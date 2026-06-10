const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const appPath = path.join(publicRoot, "app.js");
const schemaPath = path.join(root, "schema", "patient360.schema.json");
const contract = require(path.join(publicRoot, "patient360-contract.js"));

const DATA_SCHEMA_VERSION = contract.DATA_SCHEMA_VERSION;
const DATA_CONTRACT_VERSION = contract.DATA_CONTRACT_VERSION;
const SOURCE_MISSING_REF = contract.SOURCE_MISSING_REF;
const SOURCE_TYPES = contract.SOURCE_TYPES;
const EVIDENCE_CLASSES = contract.EVIDENCE_CLASSES;
const SOURCE_TYPE_TO_EVIDENCE_CLASS = contract.SOURCE_TYPE_TO_EVIDENCE_CLASS;
const SOURCE_REF_PREFIX_TO_TYPE = contract.SOURCE_REF_PREFIX_TO_TYPE;
const CLAIM_TYPES = contract.CLAIM_TYPES;
const CLAIM_STATUSES = contract.CLAIM_STATUSES;
const TIMELINE_TRACKS = contract.TIMELINE_TRACKS;
const TIMELINE_STATUSES = Object.keys(contract.TIMELINE_STATUS_META);
const RELATION_TYPES = contract.RELATION_TYPES;
const CONSENT_STATUSES = contract.CONSENT_STATUSES;
const AUDIT_ACTION_TYPES = contract.AUDIT_ACTION_TYPES;
const FORBIDDEN_CLAIM_PHRASES = contract.FORBIDDEN_CLAIM_PHRASES;
const PATIENT_SCOPED_COLLECTION_KEYS = [
  "decisionContexts",
  "documents",
  "interviews",
  "timelineEvents",
  "timelineEpisodes",
  "timelineRelations",
  "stageSummaries",
  "conditions",
  "medications",
  "allergies",
  "observations",
  "flags",
  "knownUnknowns",
  "visitChecklists",
  "reports",
  "consents",
  "audit"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractObjectLiteral(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Marker not found: ${marker}`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`Object start not found after marker: ${marker}`);

  let depth = 0;
  let inString = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }
    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      inString = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart, i + 1);
    }
  }
  throw new Error(`Object end not found after marker: ${marker}`);
}

function readDemoState() {
  const source = fs.readFileSync(appPath, "utf8");
  const literal = extractObjectLiteral(source, "const demoState =");
  return vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 });
}

function normalizeSourceRefs(refs) {
  const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
  const normalized = list.map(String).filter(Boolean);
  return normalized.length ? [...new Set(normalized)] : [SOURCE_MISSING_REF];
}

function parseSourceRef(ref) {
  if (!ref) return { type: "", id: "" };
  if (String(ref).includes(":")) {
    const [type, ...rest] = String(ref).split(":");
    return { type, id: rest.join(":") };
  }
  return { type: "", id: String(ref) };
}

function addSource(sources, ref, type, title, record, date = "") {
  if (!ref || sources.has(ref)) return;
  sources.set(ref, {
    ref,
    type,
    evidenceClass: SOURCE_TYPE_TO_EVIDENCE_CLASS[type] || "system_generated",
    title: title || ref,
    patientId: record?.patientId || "",
    date: date || record?.date || record?.eventDate || record?.contactDate || record?.generatedAt || "",
    confidence: record?.confidence || record?.trust || record?.certainty || "",
    status: record?.status || record?.extractionStatus || "",
    recordId: record?.id || ""
  });
}

function buildActivePatientState(demoState, patient) {
  const exportState = clone(demoState);
  exportState.activePatientId = patient.id;
  exportState.patients = [patient];
  exportState.selectedSourceRef = null;
  exportState.selectedTimelineEventId = null;
  exportState.search = "";
  PATIENT_SCOPED_COLLECTION_KEYS.forEach((key) => {
    exportState[key] = Array.isArray(demoState[key])
      ? demoState[key].filter((item) => item.patientId === patient.id)
      : [];
  });
  return exportState;
}

function buildSources(exportState) {
  const sources = new Map();
  (exportState.documents || []).forEach((item) => addSource(sources, `doc:${item.id}`, "document", item.title || item.type, item, item.eventDate || item.date));
  (exportState.interviews || []).forEach((item) => {
    addSource(sources, `interview:${item.id}`, "interview", item.scenario || "Wywiad", item, item.date);
    addSource(sources, `transcript:${item.id}`, "transcript", `Transkrypcja: ${item.scenario || item.id}`, item, item.date);
  });
  (exportState.observations || []).forEach((item) => addSource(sources, `observation:${item.id}`, "observation", item.name, item, item.values?.[item.values.length - 1]?.date || ""));
  (exportState.medications || []).forEach((item) => addSource(sources, `medication:${item.id}`, "medication", item.name, item, item.from || ""));
  (exportState.flags || []).forEach((item) => addSource(sources, `flag:${item.id}`, "flag", item.category, item));
  (exportState.decisionContexts || []).forEach((item) => addSource(sources, `decision:${item.id}`, "decisionContext", item.type, item, item.contactDate));
  (exportState.reports || []).forEach((item) => addSource(sources, `report:${item.id}`, "report", item.type, item, item.generatedAt));
  (exportState.consents || []).forEach((item) => addSource(sources, `consent:${item.id}`, "consent", `Zgoda: ${item.subject || item.caregiverName || item.id}`, item, item.validTo || ""));
  return Array.from(sources.values()).sort((a, b) => a.ref.localeCompare(b.ref));
}

function buildClaims(exportState) {
  const claims = [];
  const push = (claim) => claims.push({
    id: claim.id,
    patientId: claim.patientId || exportState.activePatientId,
    claimType: claim.claimType,
    text: claim.text,
    status: claim.status || "",
    sourceRefs: normalizeSourceRefs(claim.sourceRefs),
    linkedRef: claim.linkedRef || ""
  });
  (exportState.knownUnknowns || []).forEach((item) => push({
    id: `knownUnknown:${item.id}`,
    patientId: item.patientId,
    claimType: item.category,
    text: item.description,
    status: item.category,
    sourceRefs: item.sourceRefs,
    linkedRef: `knownUnknown:${item.id}`
  }));
  (exportState.flags || []).forEach((item) => push({
    id: `flag:${item.id}`,
    patientId: item.patientId,
    claimType: `flag:${item.color}`,
    text: `${item.category}: ${item.question}`,
    status: item.status,
    sourceRefs: item.sourceRefs,
    linkedRef: `flag:${item.id}`
  }));
  (exportState.decisionContexts || []).forEach((decision) => {
    push({
      id: `decision:${decision.id}`,
      patientId: decision.patientId,
      claimType: "decisionContext",
      text: decision.clinicalQuestion,
      status: decision.status,
      sourceRefs: decision.sourceRefs,
      linkedRef: `decision:${decision.id}`
    });
    (decision.ditlQuestions || []).forEach((question) => push({
      id: `question:${decision.id}:${question.id}`,
      patientId: decision.patientId,
      claimType: "ditlQuestion",
      text: question.question,
      status: question.status,
      sourceRefs: question.sourceRefs || decision.sourceRefs,
      linkedRef: `decision:${decision.id}`
    }));
  });
  (exportState.timelineEvents || []).forEach((event) => push({
    id: `event:${event.id}`,
    patientId: event.patientId,
    claimType: "timelineEvent",
    text: `${event.title}: ${event.description}`,
    status: event.status,
    sourceRefs: event.sourceRefs,
    linkedRef: `event:${event.id}`
  }));
  (exportState.reports || []).forEach((report) => push({
    id: `report:${report.id}`,
    patientId: report.patientId,
    claimType: "report",
    text: report.type,
    status: report.status,
    sourceRefs: report.sourceRefs,
    linkedRef: `report:${report.id}`
  }));
  return claims;
}

function buildContract(exportState) {
  const eventsByEpisode = new Map();
  (exportState.timelineEvents || []).forEach((event) => {
    if (!event.episodeId) return;
    const list = eventsByEpisode.get(event.episodeId) || [];
    list.push(event.id);
    eventsByEpisode.set(event.episodeId, list);
  });
  const contract = {
    schemaVersion: DATA_SCHEMA_VERSION,
    contractVersion: DATA_CONTRACT_VERSION,
    exportedAt: "2026-06-08T00:00:00.000Z",
    intendedUse: "Kontekst, źródła, pytania DITL i zadania organizacyjne. Nie diagnoza, triage ani rekomendacja terapeutyczna.",
    patient: exportState.patients[0],
    sources: buildSources(exportState),
    claims: buildClaims(exportState),
    timelineEvents: (exportState.timelineEvents || []).map((event) => ({
      ...event,
      sourceRefs: normalizeSourceRefs(event.sourceRefs),
      claimRefs: [`event:${event.id}`],
      schemaStatus: event.status === "planowane" ? "planned_not_fact" : "projected_from_sources"
    })),
    timelineEpisodes: (exportState.timelineEpisodes || []).map((episode) => ({
      ...episode,
      sourceRefs: normalizeSourceRefs(episode.sourceRefs),
      eventRefs: eventsByEpisode.get(episode.id) || []
    })),
    timelineRelations: (exportState.timelineRelations || []).map((relation) => ({
      ...relation,
      sourceRefs: normalizeSourceRefs(relation.sourceRefs),
      causality: "not_asserted"
    })),
    consentScopes: (exportState.consents || []).map((consent) => ({
      id: consent.id,
      patientId: consent.patientId,
      subject: consent.subject,
      scope: consent.scope,
      role: consent.role || "",
      caregiverId: consent.caregiverId || "",
      caregiverName: consent.caregiverName || consent.subject || "",
      areas: Array.isArray(consent.areas) ? consent.areas : [],
      validTo: consent.validTo,
      status: consent.status,
      sourceRefs: normalizeSourceRefs([consent.id ? `consent:${consent.id}` : null, ...(Array.isArray(consent.sourceRefs) ? consent.sourceRefs : [])])
    })),
    audit: (exportState.audit || []).map((entry) => ({ ...entry, actionType: "local_demo_audit" })),
    domainData: exportState
  };
  contract.sourceQuality = buildSourceQuality(contract);
  return contract;
}

function collectSourceRefs(value, refs = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSourceRefs(item, refs));
    return refs;
  }
  if (!value || typeof value !== "object") return refs;
  Object.entries(value).forEach(([key, entry]) => {
    if (key === "sourceRefs") {
      normalizeSourceRefs(entry).forEach((ref) => refs.push(ref));
    } else {
      collectSourceRefs(entry, refs);
    }
  });
  return refs;
}

function buildSourceQuality(contract) {
  const refs = collectSourceRefs({
    claims: contract.claims,
    timelineEvents: contract.timelineEvents,
    timelineEpisodes: contract.timelineEpisodes,
    timelineRelations: contract.timelineRelations,
    consentScopes: contract.consentScopes,
    domainData: contract.domainData
  });
  return {
    sources: contract.sources.length,
    claims: contract.claims.length,
    sourceMissingCount: refs.filter((ref) => ref === SOURCE_MISSING_REF).length
  };
}

function validateContract(contract) {
  const errors = [];
  const requiredArrays = ["sources", "claims", "timelineEvents", "timelineEpisodes", "timelineRelations", "consentScopes", "audit"];
  if (contract.schemaVersion !== DATA_SCHEMA_VERSION) errors.push("schemaVersion is not 7");
  if (contract.contractVersion !== DATA_CONTRACT_VERSION) errors.push("contractVersion is not 0.1");
  requiredArrays.forEach((key) => {
    if (!Array.isArray(contract[key])) errors.push(`${key} must be an array`);
  });
  const patientId = contract.patient?.id;
  const checkUnique = (key, items, idKey = "id") => {
    const seen = new Set();
    (items || []).forEach((item) => {
      const id = item[idKey];
      if (!id) errors.push(`${key} item missing ${idKey}`);
      if (seen.has(id)) errors.push(`${key} has duplicate ${idKey} ${id}`);
      seen.add(id);
    });
  };
  checkUnique("sources", contract.sources, "ref");
  ["claims", "timelineEvents", "timelineEpisodes", "timelineRelations", "consentScopes", "audit"].forEach((key) => checkUnique(key, contract[key]));
  const checkPatient = (key, items) => (items || []).forEach((item) => {
    if (item.patientId && patientId && item.patientId !== patientId) errors.push(`${key} ${item.id || item.ref} belongs to ${item.patientId}, not ${patientId}`);
  });
  ["sources", "claims", "timelineEvents", "timelineEpisodes", "timelineRelations", "consentScopes", "audit"].forEach((key) => checkPatient(key, contract[key]));

  const sourceRefs = new Set((contract.sources || []).map((source) => source.ref));
  const sourceByRef = new Map((contract.sources || []).map((source) => [source.ref, source]));
  const duplicateSources = (contract.sources || []).filter((source, index, list) => list.findIndex((item) => item.ref === source.ref) !== index);
  duplicateSources.forEach((source) => errors.push(`duplicate source ${source.ref}`));
  (contract.sources || []).forEach((source) => {
    if (!SOURCE_TYPES.includes(source.type)) errors.push(`source ${source.ref} has invalid type ${source.type}`);
    const parsed = parseSourceRef(source.ref);
    const expectedType = SOURCE_REF_PREFIX_TO_TYPE[parsed.type];
    if (expectedType && source.type !== expectedType) errors.push(`source ${source.ref} has type ${source.type}, expected ${expectedType}`);
    if (source.evidenceClass !== undefined) {
      if (!EVIDENCE_CLASSES.includes(source.evidenceClass)) errors.push(`source ${source.ref} has invalid evidenceClass ${source.evidenceClass}`);
      const expectedClass = SOURCE_TYPE_TO_EVIDENCE_CLASS[source.type];
      if (expectedClass && source.evidenceClass !== expectedClass && source.evidenceClass !== "caregiver_reported") {
        errors.push(`source ${source.ref} has evidenceClass ${source.evidenceClass}, expected ${expectedClass}`);
      }
    }
  });

  const checkRefs = (owner, refs) => normalizeSourceRefs(refs).forEach((ref) => {
    if (ref !== SOURCE_MISSING_REF && !sourceRefs.has(ref)) errors.push(`${owner} references missing source ${ref}`);
    const source = sourceByRef.get(ref);
    const parsed = parseSourceRef(ref);
    const expectedType = SOURCE_REF_PREFIX_TO_TYPE[parsed.type];
    if (source && expectedType && source.type !== expectedType) errors.push(`${owner} reference ${ref} points to ${source.type}, expected ${expectedType}`);
  });
  (contract.claims || []).forEach((claim) => {
    if (!claim.sourceRefs?.length) errors.push(`claim ${claim.id} has no sourceRefs`);
    if (!CLAIM_TYPES.includes(claim.claimType)) errors.push(`claim ${claim.id} has invalid claimType ${claim.claimType}`);
    if (!CLAIM_STATUSES.includes(claim.status || "")) errors.push(`claim ${claim.id} has invalid status ${claim.status}`);
    FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
      if (String(claim.text || "").includes(phrase)) errors.push(`claim ${claim.id} contains forbidden phrase ${phrase}`);
    });
    checkRefs(`claim ${claim.id}`, claim.sourceRefs);
  });
  (contract.timelineEvents || []).forEach((event) => {
    if (!TIMELINE_TRACKS.includes(event.track)) errors.push(`timelineEvent ${event.id} has invalid track ${event.track}`);
    if (!TIMELINE_STATUSES.includes(event.status)) errors.push(`timelineEvent ${event.id} has invalid status ${event.status}`);
    if (!["projected_from_sources", "planned_not_fact"].includes(event.schemaStatus)) errors.push(`timelineEvent ${event.id} has invalid schemaStatus ${event.schemaStatus}`);
    checkRefs(`timelineEvent ${event.id}`, event.sourceRefs);
  });
  (contract.timelineEpisodes || []).forEach((episode) => {
    if (!TIMELINE_STATUSES.includes(episode.status)) errors.push(`timelineEpisode ${episode.id} has invalid status ${episode.status}`);
    checkRefs(`timelineEpisode ${episode.id}`, episode.sourceRefs);
  });
  (contract.timelineRelations || []).forEach((relation) => {
    if (!RELATION_TYPES.includes(relation.relationType)) errors.push(`timelineRelation ${relation.id} has invalid relationType ${relation.relationType}`);
    checkRefs(`timelineRelation ${relation.id}`, relation.sourceRefs);
  });
  (contract.consentScopes || []).forEach((scope) => {
    if (!CONSENT_STATUSES.includes(scope.status)) errors.push(`consentScope ${scope.id} has invalid status ${scope.status}`);
    checkRefs(`consentScope ${scope.id}`, scope.sourceRefs);
  });
  (contract.audit || []).forEach((entry) => {
    if (!AUDIT_ACTION_TYPES.includes(entry.actionType)) errors.push(`audit ${entry.id} has invalid actionType ${entry.actionType}`);
  });
  collectSourceRefs(contract.domainData || {}).forEach((ref) => {
    if (ref !== SOURCE_MISSING_REF && !sourceRefs.has(ref)) errors.push(`domainData references missing source ${ref}`);
  });

  const eventIds = new Set((contract.timelineEvents || []).map((event) => event.id));
  (contract.timelineRelations || []).forEach((relation) => {
    if (!eventIds.has(relation.fromEventId)) errors.push(`relation ${relation.id} missing fromEventId ${relation.fromEventId}`);
    if (!eventIds.has(relation.toEventId)) errors.push(`relation ${relation.id} missing toEventId ${relation.toEventId}`);
    if (relation.causality !== "not_asserted") errors.push(`relation ${relation.id} asserts causality`);
  });
  (contract.timelineEpisodes || []).forEach((episode) => {
    (episode.eventRefs || []).forEach((eventRef) => {
      if (!eventIds.has(eventRef)) errors.push(`episode ${episode.id} missing eventRef ${eventRef}`);
    });
  });

  const expectedQuality = buildSourceQuality(contract);
  if (!contract.sourceQuality) {
    errors.push("sourceQuality is required");
  } else {
    ["sources", "claims", "sourceMissingCount"].forEach((key) => {
      if (contract.sourceQuality[key] !== expectedQuality[key]) errors.push(`sourceQuality.${key} should be ${expectedQuality[key]}`);
    });
  }

  return errors;
}

function compareEnum(name, actual, expected) {
  const actualList = [...actual].sort();
  const expectedList = [...expected].sort();
  if (actualList.length !== expectedList.length || actualList.some((value, index) => value !== expectedList[index])) {
    throw new Error(`Schema enum drift: ${name}`);
  }
}

function validateSchemaEnums(schema) {
  const defs = schema.$defs || {};
  compareEnum("source.type", defs.source?.properties?.type?.enum || [], SOURCE_TYPES);
  compareEnum("source.evidenceClass", defs.source?.properties?.evidenceClass?.enum || [], EVIDENCE_CLASSES);
  compareEnum("claimType", defs.claimType?.enum || [], CLAIM_TYPES);
  compareEnum("claimStatus", defs.claimStatus?.enum || [], CLAIM_STATUSES);
  compareEnum("timelineTrack", defs.timelineTrack?.enum || [], TIMELINE_TRACKS);
  compareEnum("timelineStatus", defs.timelineStatus?.enum || [], TIMELINE_STATUSES);
  compareEnum("relationType", defs.relationType?.enum || [], RELATION_TYPES);
  compareEnum("consentStatus", defs.consentStatus?.enum || [], CONSENT_STATUSES);
  compareEnum("auditActionType", defs.auditActionType?.enum || [], AUDIT_ACTION_TYPES);
}

function main() {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  validateSchemaEnums(schema);
  const demoState = readDemoState();
  const patients = demoState.patients || [];
  if (!patients.length) throw new Error("demoState has no patients");

  const results = [];
  const allErrors = [];
  patients.forEach((patient) => {
    const exportState = buildActivePatientState(demoState, patient);
    const contract = buildContract(exportState);
    const errors = validateContract(contract);
    results.push({
      patientId: patient.id,
      sources: contract.sources.length,
      claims: contract.claims.length,
      events: contract.timelineEvents.length,
      sourceMissing: contract.sourceQuality.sourceMissingCount,
      errors: errors.length
    });
    errors.forEach((error) => allErrors.push(`${patient.id}: ${error}`));
  });

  if (allErrors.length) {
    console.error(allErrors.join("\n"));
    process.exit(1);
  }
  console.log(`Data Contract v${DATA_CONTRACT_VERSION} validation passed`);
  results.forEach((result) => {
    console.log(`- ${result.patientId}: ${result.sources} sources, ${result.claims} claims, ${result.events} events, ${result.sourceMissing} source_missing`);
  });
}

main();
