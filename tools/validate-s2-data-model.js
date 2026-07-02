const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));
const consentModel = require(path.join(root, "public", "patient360-consent-model.js"));
const visitPacket = require(path.join(root, "public", "patient360-visitpacket.js"));
const auditCatalog = require(path.join(root, "public", "patient360-audit-catalog.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function refs(value) {
  return asArray(value).map(String).filter(Boolean);
}

function assertNoForbiddenText(label, value) {
  const text = JSON.stringify(value);
  contract.FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
    if (phrase && text.includes(phrase)) throw new Error(`${label}.forbiddenPhrase:${phrase}`);
  });
}

function assertSchemaDefs() {
  const schema = readJson("schema/patient360.schema.json");
  const defs = schema.$defs || {};
  [
    "s2ModelVersion",
    "patientProfile",
    "careCircleMember",
    "consentGrant",
    "s2Document",
    "s2Medication",
    "s2Question",
    "s2Observation",
    "visitPacket",
    "sh0AuditEvent",
    "s2Slice"
  ].forEach((key) => assert(defs[key], `schema.$defs.${key}.missing`));
  assert(defs.s2ModelVersion.const === contract.S2_MODEL_VERSION, "schema.s2ModelVersion.invalid");
  assert(defs.s2Document.properties.status.enum.join("|") === contract.S2_DOCUMENT_STATUSES.join("|"), "schema.s2Document.status.enum_drift");
  assert(defs.s2Question.properties.status.enum.join("|") === contract.S2_QUESTION_STATUSES.join("|"), "schema.s2Question.status.enum_drift");
  assert(defs.s2Observation.properties.observationType.enum.join("|") === contract.S2_OBSERVATION_TYPES.join("|"), "schema.s2Observation.type.enum_drift");
}

function resolveVisitPacket(entry) {
  if (entry.fixtureRef) return readJson(entry.fixtureRef);
  return entry;
}

function validateSourceRefs(label, item, errors) {
  if (!refs(item.sourceRefs).length) errors.push(`${label}.sourceRefs.empty`);
}

function validateSlice(slice) {
  const errors = [];
  if (slice.modelVersion !== contract.S2_MODEL_VERSION) errors.push("modelVersion.invalid");
  if (slice.patientProfile?.modelVersion !== contract.S2_MODEL_VERSION) errors.push("patientProfile.modelVersion.invalid");
  validateSourceRefs("patientProfile", slice.patientProfile || {}, errors);
  const patientProfileId = slice.patientProfile?.patientProfileId;
  if (!patientProfileId) errors.push("patientProfile.patientProfileId.missing");

  const consentIds = new Set();
  asArray(slice.consentGrants).forEach((grant) => {
    const validation = consentModel.validateConsentGrant(grant, { now: "2026-07-02T10:00:00.000Z" });
    validation.errors.forEach((error) => errors.push(`consentGrants.${grant.consentGrantId || "unknown"}.${error}`));
    if (grant.consentGrantId) consentIds.add(grant.consentGrantId);
    if (grant.patientProfileId !== patientProfileId) errors.push(`consentGrants.${grant.consentGrantId}.patientProfileId.mismatch`);
  });

  asArray(slice.careCircleMembers).forEach((member) => {
    validateSourceRefs(`careCircleMembers.${member.memberId}`, member, errors);
    if (!contract.S2_RECORD_STATUSES.includes(member.status)) errors.push(`careCircleMembers.${member.memberId}.status.invalid`);
    if (!consentIds.has(member.consentGrantId)) errors.push(`careCircleMembers.${member.memberId}.consentGrantId.unknown`);
  });
  asArray(slice.documents).forEach((document) => {
    validateSourceRefs(`documents.${document.documentId}`, document, errors);
    if (!contract.S2_DOCUMENT_STATUSES.includes(document.status)) errors.push(`documents.${document.documentId}.status.invalid`);
    if (document.rawText || document.ocrText) errors.push(`documents.${document.documentId}.ocr_or_raw_text.not_allowed_in_s2_contract`);
  });
  asArray(slice.medications).forEach((medication) => {
    validateSourceRefs(`medications.${medication.medicationId}`, medication, errors);
    if (!contract.S2_RECORD_STATUSES.includes(medication.status)) errors.push(`medications.${medication.medicationId}.status.invalid`);
  });
  asArray(slice.questions).forEach((question) => {
    validateSourceRefs(`questions.${question.questionId}`, question, errors);
    if (!contract.S2_QUESTION_STATUSES.includes(question.status)) errors.push(`questions.${question.questionId}.status.invalid`);
  });
  asArray(slice.observations).forEach((observation) => {
    validateSourceRefs(`observations.${observation.observationId}`, observation, errors);
    if (!contract.S2_OBSERVATION_TYPES.includes(observation.observationType)) errors.push(`observations.${observation.observationId}.observationType.invalid`);
  });
  asArray(slice.visitPackets).forEach((entry) => {
    const packet = resolveVisitPacket(entry);
    const validation = visitPacket.validateVisitPacket(packet);
    validation.errors.forEach((error) => errors.push(`visitPackets.${error}`));
    if (entry.packetId && packet.packetId !== entry.packetId) errors.push("visitPackets.packetId.mismatch");
  });
  asArray(slice.auditEvents).forEach((event) => {
    const validation = auditCatalog.validateAuditEvent(event);
    validation.errors.forEach((error) => errors.push(`auditEvents.${event.auditEventId || "unknown"}.${error}`));
  });

  try {
    assertNoForbiddenText("s2Slice", slice);
  } catch (error) {
    errors.push(error.message);
  }
  return { valid: errors.length === 0, errors };
}

function applyMutation(slice, mutation) {
  const mutated = clone(slice);
  if (mutation === "wrongModelVersion") {
    mutated.modelVersion = "0.3";
  } else if (mutation === "questionWithoutSource") {
    mutated.questions[0].sourceRefs = [];
  } else if (mutation === "doctorConsentWithoutPacketFilter") {
    delete mutated.consentGrants[0].resourceFilters;
  } else if (mutation === "visitPacketReferenceMismatch") {
    mutated.visitPackets[0].packetId = "packet-other";
  } else if (mutation === "auditForbiddenMetadata") {
    mutated.auditEvents[0].metadata.diagnosis = "forbidden";
  } else if (mutation === "forbiddenQuestionCopy") {
    mutated.questions[0].text = "diagnoza: gotowy wniosek";
  } else {
    throw new Error(`Unknown mutation: ${mutation}`);
  }
  return mutated;
}

function main() {
  assertSchemaDefs();
  const snapshot = readJson("fixtures/s2-data-model.snapshot.json");
  const positive = validateSlice(snapshot);
  assert(positive.valid, `s2 snapshot invalid: ${positive.errors.join("; ")}`);
  const edgecases = readJson("fixtures/s2-data-model-edgecases.json");
  asArray(edgecases.negativeCases).forEach((testCase) => {
    const result = validateSlice(applyMutation(snapshot, testCase.mutate));
    assert(!result.valid, `${testCase.id}: expected invalid`);
    if (testCase.expectedError) {
      assert(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
    }
    if (testCase.expectedErrorIncludes) {
      assert(result.errors.some((error) => error.includes(testCase.expectedErrorIncludes)), `${testCase.id}: expected error containing ${testCase.expectedErrorIncludes}, got ${result.errors.join("; ")}`);
    }
    console.log(`${testCase.id}: rejected errors=${result.errors.join(",")}`);
  });
  console.log("S2 data model validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
