/*
  Pacjent360 A3+A5 projection.
  Converts data gaps into neutral DITL questions without changing schema v7.
*/
(function initPatient360A3A5Quality(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.Patient360A3A5Quality = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360A3A5Quality() {
  "use strict";

  const SOURCE_MISSING_REF = "source_missing";
  const DITL_STATUS = "do wyjasnienia";
  const ALL_CONSENT_AREAS = Object.freeze(["documents", "results", "medications", "observations", "visits", "tasks", "report"]);
  const PRIORITY_ORDER = Object.freeze(["conflict", "source_missing", "stale_data", "missing_context", "consent_limited"]);
  const GAP_META = Object.freeze({
    conflict: { rank: 1, label: "Rozbieznosc danych", tone: "compare" },
    source_missing: { rank: 2, label: "Brak zrodla", tone: "source" },
    stale_data: { rank: 3, label: "Starsze dane", tone: "time" },
    missing_context: { rank: 4, label: "Brak szczegolu", tone: "context" },
    consent_limited: { rank: 5, label: "Zakres zgody", tone: "consent" }
  });
  const FORBIDDEN_COPY_PATTERNS = Object.freeze([
    "diagnoza",
    "rozpoznanie",
    "zalecenie",
    "terapia",
    "pilne",
    "natychmiast",
    "triage",
    "w normie",
    "poza norma",
    "rekomendacja",
    "alert",
    "niebezpiecz",
    "zastosuj plan",
    "sor",
    "wykryto",
    "blad medyczny",
    "wskazanie zmiany",
    "skoryguj",
    "nielegalny",
    "zmien dawke",
    "odstaw"
  ]);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [value].filter(Boolean);
  }

  function unique(values) {
    return [...new Set(asArray(values).map(String).filter(Boolean))];
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[Ĺ‚Ĺ]/g, "l")
      .toLowerCase();
  }

  function dateOnly(value) {
    return String(value || "").slice(0, 10);
  }

  function parseDateOnly(value) {
    const date = new Date(`${dateOnly(value)}T12:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysOld(today, value) {
    const current = parseDateOnly(today);
    const date = parseDateOnly(value);
    if (!current || !date) return 0;
    return Math.floor((current.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
  }

  function byPatient(state, key, patientId) {
    return asArray(state && state[key]).filter((item) => item.patientId === patientId);
  }

  function safeLabel(value, fallback = "element danych") {
    return String(value || fallback)
      .replace(/["<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 96) || fallback;
  }

  function recordLabel(record, fallback) {
    return safeLabel(
      record && (record.name || record.title || record.label || record.category || record.type || record.description),
      fallback
    );
  }

  function sourceRefsFor(record) {
    const refs = unique(record && record.sourceRefs);
    return refs.length ? refs : [SOURCE_MISSING_REF];
  }

  function isSourceMissing(refs) {
    const list = unique(refs);
    return !list.length || list.includes(SOURCE_MISSING_REF);
  }

  function sourceRecordEntries(state, patientId) {
    const entries = [];
    const push = (ref, type, label, item) => {
      if (!ref) return;
      entries.push({
        ref,
        type,
        label,
        patientId: item && item.patientId || patientId,
        date: item && (item.date || item.eventDate || item.contactDate || item.generatedAt || item.validTo || item.from) || "",
        recordId: item && item.id || ""
      });
    };
    byPatient(state, "documents", patientId).forEach((item) => push(`doc:${item.id}`, "document", item.title || item.type, item));
    byPatient(state, "interviews", patientId).forEach((item) => {
      push(`interview:${item.id}`, "interview", item.scenario || "Wywiad", item);
      push(`transcript:${item.id}`, "transcript", `Transkrypcja: ${item.scenario || item.id}`, item);
    });
    byPatient(state, "observations", patientId).forEach((item) => push(`observation:${item.id}`, "observation", item.name, item));
    byPatient(state, "medications", patientId).forEach((item) => push(`medication:${item.id}`, "medication", item.name, item));
    byPatient(state, "flags", patientId).forEach((item) => push(`flag:${item.id}`, "flag", item.category, item));
    byPatient(state, "decisionContexts", patientId).forEach((item) => push(`decision:${item.id}`, "decisionContext", item.type, item));
    byPatient(state, "knownUnknowns", patientId).forEach((item) => push(`knownUnknown:${item.id}`, "knownUnknown", item.category, item));
    byPatient(state, "reports", patientId).forEach((item) => push(`report:${item.id}`, "report", item.type, item));
    byPatient(state, "consents", patientId).forEach((item) => push(`consent:${item.id}`, "consent", item.subject || item.scope, item));
    return entries;
  }

  function buildSourceIndex(state, patientId) {
    const map = new Map(sourceRecordEntries(state, patientId).map((source) => [source.ref, source]));
    return {
      sources: [...map.values()].sort((a, b) => a.ref.localeCompare(b.ref)),
      has(ref) {
        return ref === SOURCE_MISSING_REF || map.has(ref);
      }
    };
  }

  function sourceCoverageFor(items, sourceIndex) {
    const refs = items.flatMap((item) => sourceRefsFor(item));
    const checked = refs.filter((ref) => ref !== SOURCE_MISSING_REF);
    const missing = checked.filter((ref) => !sourceIndex.has(ref));
    return {
      checkedCount: checked.length,
      missingCount: missing.length,
      sourceMissingCount: refs.filter((ref) => ref === SOURCE_MISSING_REF).length,
      missingRefs: unique(missing)
    };
  }

  function priorityRank(gapType) {
    return GAP_META[gapType]?.rank || 99;
  }

  function recordArea(recordType, gapType) {
    if (gapType === "consent_limited") return "consent";
    if (recordType === "observation") return "results";
    if (recordType === "medication") return "medications";
    if (recordType === "visitChecklistItem") return "tasks";
    return "report";
  }

  function projectionLinks(gap) {
    const base = `${gap.recordType}:${gap.recordId}`;
    return {
      gap: `gap:${base}`,
      questionList: `questions:${gap.id}`,
      inspector: `inspector:${gap.id}`,
      timelineFilm: gap.timelineRef || "timeline:source-derived",
      report: gap.reportRef || "report:context-draft"
    };
  }

  function questionTextForGap(gap) {
    const label = safeLabel(gap.label);
    if (gap.gapType === "conflict") {
      return `Czy informacje o "${label}" opisane w roznych zrodlach zostaly wspolnie sprawdzone podczas wizyty?`;
    }
    if (gap.gapType === "source_missing") {
      return `Z jakiego dokumentu, wywiadu albo wpisu pochodzi informacja o "${label}"?`;
    }
    if (gap.gapType === "stale_data") {
      return `Czy dla "${label}" jest nowsze zrodlo, ktore warto pokazac na wizycie?`;
    }
    if (gap.gapType === "consent_limited") {
      return `Czy pacjent chce udostepnic zakres "${label}" przed rozmowa?`;
    }
    return `Jaki szczegol przy "${label}" jest do doprecyzowania podczas rozmowy?`;
  }

  function makeGap(input) {
    const sourceRefs = sourceRefsFor(input);
    const gapType = isSourceMissing(sourceRefs) ? "source_missing" : input.gapType;
    const recordId = input.recordId || input.record?.id || input.id || "unknown";
    const recordType = input.recordType || "record";
    const id = `${gapType}:${recordType}:${recordId}`;
    const projectionId = `projection:ditl:gap-${recordType}-${recordId}-${gapType}`;
    const gap = {
      id,
      projectionId,
      patientId: input.patientId,
      gapType,
      priority: priorityRank(gapType),
      recordType,
      recordId,
      label: safeLabel(input.label || recordLabel(input.record, "element danych")),
      title: GAP_META[gapType]?.label || "Luka danych",
      description: safeLabel(input.description || input.record?.description || input.record?.story || input.record?.evidence || ""),
      status: DITL_STATUS,
      sourceRefs,
      sourceStatus: isSourceMissing(sourceRefs) ? SOURCE_MISSING_REF : "source_refs",
      requiredArea: input.requiredArea || recordArea(recordType, gapType),
      timelineRef: input.timelineRef || "",
      reportRef: input.reportRef || ""
    };
    const questionText = questionTextForGap(gap);
    return {
      ...gap,
      questionId: `question:${id}`,
      questionText,
      linkedSurfaces: projectionLinks(gap)
    };
  }

  function makeQuestion(gap) {
    return {
      id: gap.questionId,
      projectionId: gap.projectionId,
      gapId: gap.id,
      gapType: gap.gapType,
      type: "ditl_question",
      status: DITL_STATUS,
      title: "Do omowienia z lekarzem",
      questionText: gap.questionText,
      reason: gap.description,
      sourceRefs: sourceRefsFor(gap),
      sourceStatus: gap.sourceStatus,
      requiredArea: gap.requiredArea,
      linkedSurfaces: gap.linkedSurfaces
    };
  }

  function copyErrors(text) {
    const normalized = normalize(text);
    return FORBIDDEN_COPY_PATTERNS
      .filter((pattern) => normalized.includes(pattern))
      .map((pattern) => `copy.forbidden:${pattern}`);
  }

  function safeQuestion(question, context = {}) {
    const errors = [];
    if (!question || typeof question !== "object") {
      return { allowed: false, errors: ["question.missing"], question: null };
    }
    if (!question.id) errors.push("question.id.missing");
    if (!question.projectionId) errors.push("projectionId.missing");
    if (!question.gapId) errors.push("gapId.missing");
    if (question.type !== "ditl_question") errors.push(`question.type.invalid:${question.type}`);
    if (question.status !== DITL_STATUS) errors.push("ditl.status.invalid");
    if (!sourceRefsFor(question).length) errors.push("source.missing");
    errors.push(...copyErrors([question.title, question.questionText, question.reason].filter(Boolean).join(" ")));

    const hiddenAreas = new Set(unique(context.hiddenAreas));
    if (context.role === "caregiver" && hiddenAreas.has(question.requiredArea) && question.gapType !== "consent_limited") {
      errors.push(`consent.hiddenArea:${question.requiredArea}`);
    }

    const safe = {
      ...question,
      sourceRefs: sourceRefsFor(question),
      gateStatus: errors.length ? "blocked" : "allowed"
    };
    return {
      allowed: errors.length === 0,
      errors,
      question: safe
    };
  }

  function activeCaregiverAreas(state, patientId) {
    return new Set(byPatient(state, "consents", patientId)
      .filter((consent) => consent.status === "aktywny")
      .flatMap((consent) => consent.areas || []));
  }

  function hiddenAreasForRole(state, patientId, role, overrideHiddenAreas) {
    if (Array.isArray(overrideHiddenAreas)) return unique(overrideHiddenAreas);
    if (role !== "caregiver") return [];
    const active = activeCaregiverAreas(state, patientId);
    return ALL_CONSENT_AREAS.filter((area) => !active.has(area));
  }

  function inferKnownUnknownType(item) {
    const category = normalize(item.category);
    const text = normalize([item.description, item.category].join(" "));
    if (category.includes("known")) return "";
    if (isSourceMissing(item.sourceRefs)) return "source_missing";
    if (text.includes("rozbie") || text.includes("rozni") || text.includes("rozn")) return "conflict";
    if (category.includes("uncertain")) return "missing_context";
    if (category.includes("unknown") || category.includes("verify")) return "missing_context";
    return "missing_context";
  }

  function inferFlagType(flag) {
    if (flag.color === "green") return "";
    const text = normalize([flag.category, flag.question, flag.evidence].join(" "));
    if (isSourceMissing(flag.sourceRefs)) return "source_missing";
    if (text.includes("rozbie") || text.includes("porown") || text.includes("niepewn")) return "conflict";
    if (text.includes("brak") || text.includes("potwierd") || text.includes("komplet")) return "missing_context";
    return "missing_context";
  }

  function collectFlagGaps(state, patientId) {
    return byPatient(state, "flags", patientId)
      .map((flag) => {
        const gapType = inferFlagType(flag);
        if (!gapType) return null;
        return makeGap({
          patientId,
          record: flag,
          recordType: "flag",
          recordId: flag.id,
          gapType,
          label: flag.category,
          description: flag.evidence || flag.question,
          sourceRefs: flag.sourceRefs,
          requiredArea: "report"
        });
      })
      .filter(Boolean);
  }

  function collectKnownUnknownGaps(state, patientId) {
    return byPatient(state, "knownUnknowns", patientId)
      .map((item) => {
        const gapType = inferKnownUnknownType(item);
        if (!gapType) return null;
        return makeGap({
          patientId,
          record: item,
          recordType: "knownUnknown",
          recordId: item.id,
          gapType,
          label: item.description,
          description: item.description,
          sourceRefs: item.sourceRefs,
          requiredArea: "report"
        });
      })
      .filter(Boolean);
  }

  function medicationGapType(medication, today) {
    if (isSourceMissing(medication.sourceRefs)) return "source_missing";
    const text = normalize([medication.actualStatus, medication.confirmationStatus, medication.story, medication.question, medication.dose, medication.frequency].join(" "));
    if (text.includes("rozn") || text.includes("rozbie") || text.includes("porown")) return "conflict";
    if (text.includes("brak danych") || text.includes("niepotwierdzone") || text.includes("do potwierdzenia")) return "missing_context";
    if (normalize(medication.status).includes("aktywn") && daysOld(today, medication.from) > 365 && text.includes("niepotwierdzone")) return "stale_data";
    return "";
  }

  function collectMedicationGaps(state, patientId, today) {
    return byPatient(state, "medications", patientId)
      .map((medication) => {
        const gapType = medicationGapType(medication, today);
        if (!gapType) return null;
        return makeGap({
          patientId,
          record: medication,
          recordType: "medication",
          recordId: medication.id,
          gapType,
          label: medication.name,
          description: medication.story || medication.question || medication.actualStatus,
          sourceRefs: medication.sourceRefs,
          requiredArea: "medications"
        });
      })
      .filter(Boolean);
  }

  function latestValue(observation) {
    return asArray(observation && observation.values)
      .slice()
      .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
      .at(-1) || null;
  }

  function observationGapType(observation, today) {
    const latest = latestValue(observation);
    const refs = unique(latest && latest.sourceRefs || observation.sourceRefs);
    if (isSourceMissing(refs)) return "source_missing";
    const hasNumericValue = asArray(observation.values).some((point) => Number.isFinite(Number(point.value)));
    if (hasNumericValue && !observation.unit) return "missing_context";
    if (latest && daysOld(today, latest.date) > 365) return "stale_data";
    return "";
  }

  function collectObservationGaps(state, patientId, today) {
    return byPatient(state, "observations", patientId)
      .map((observation) => {
        const gapType = observationGapType(observation, today);
        if (!gapType) return null;
        const latest = latestValue(observation);
        return makeGap({
          patientId,
          record: observation,
          recordType: "observation",
          recordId: observation.id,
          gapType,
          label: observation.name,
          description: latest ? `Ostatni punkt danych: ${dateOnly(latest.date)}` : "Brak punktu danych",
          sourceRefs: latest && latest.sourceRefs || observation.sourceRefs,
          requiredArea: "results"
        });
      })
      .filter(Boolean);
  }

  function collectVisitChecklistGaps(state, patientId) {
    return byPatient(state, "visitChecklists", patientId).flatMap((checklist) =>
      asArray(checklist.items)
        .filter((item) => {
          const status = normalize(item.status);
          return status.includes("brak") || status.includes("potwierd");
        })
        .map((item) => makeGap({
          patientId,
          record: item,
          recordType: "visitChecklistItem",
          recordId: `${checklist.id}-${item.id}`,
          gapType: isSourceMissing(item.sourceRefs) ? "source_missing" : "missing_context",
          label: item.label,
          description: `Status przygotowania: ${item.status || DITL_STATUS}`,
          sourceRefs: item.sourceRefs,
          requiredArea: "tasks"
        }))
    );
  }

  function collectConsentLimitedGaps(state, patientId, role, hiddenAreas) {
    if (role !== "caregiver" || !hiddenAreas.length) return [];
    const consentRefs = unique(byPatient(state, "consents", patientId).map((consent) => `consent:${consent.id}`));
    return hiddenAreas.map((area) => makeGap({
      patientId,
      recordType: "consentArea",
      recordId: area,
      gapType: "consent_limited",
      label: area,
      description: "Widok opiekuna zalezy od aktywnej zgody pacjenta.",
      sourceRefs: consentRefs.length ? consentRefs : [SOURCE_MISSING_REF],
      requiredArea: "consent"
    }));
  }

  function dedupeGaps(gaps) {
    const seen = new Set();
    return gaps.filter((gap) => {
      const key = `${gap.gapType}:${gap.recordType}:${gap.recordId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function sortGaps(gaps) {
    return gaps.slice().sort((a, b) =>
      a.priority - b.priority ||
      String(a.recordType).localeCompare(String(b.recordType)) ||
      String(a.recordId).localeCompare(String(b.recordId))
    );
  }

  function applyQuestionGate(questions, context) {
    const allowed = [];
    const blocked = [];
    questions.forEach((question) => {
      const result = safeQuestion(question, context);
      if (result.allowed) allowed.push(result.question);
      else blocked.push({ ...result.question, errors: result.errors });
    });
    return { allowed, blocked };
  }

  function projectQualityQuestions(input = {}) {
    const state = input.state || {};
    const patientId = input.patientId || state.activePatientId || (state.patients || [])[0]?.id || "";
    const role = input.role || state.activeRole || "doctor";
    const today = input.today || state.demoToday || input.demoToday || "2026-06-26";
    const hiddenAreas = hiddenAreasForRole(state, patientId, role, input.hiddenAreas);
    const patient = asArray(state.patients).find((item) => item.id === patientId) || null;
    const sourceIndex = buildSourceIndex(state, patientId);
    const rawGaps = dedupeGaps([
      ...collectFlagGaps(state, patientId),
      ...collectKnownUnknownGaps(state, patientId),
      ...collectMedicationGaps(state, patientId, today),
      ...collectObservationGaps(state, patientId, today),
      ...collectVisitChecklistGaps(state, patientId),
      ...collectConsentLimitedGaps(state, patientId, role, hiddenAreas)
    ]);
    const gaps = sortGaps(rawGaps);
    const rawQuestions = gaps.map(makeQuestion);
    const gate = applyQuestionGate(rawQuestions, { role, hiddenAreas });
    const questions = gate.allowed;
    const blockedQuestions = gate.blocked;
    const visibleGapIds = new Set(questions.map((question) => question.gapId));
    const visibleGaps = gaps.filter((gap) => visibleGapIds.has(gap.id));
    const coverage = sourceCoverageFor(questions, sourceIndex);

    return {
      id: `a3-a5:${patientId}:${role}`,
      sprint: "A3+A5",
      status: "read_only_data_quality_questions",
      dataMode: "synthetic_demo_state",
      scale: "organizational_priority_only",
      runtimeLlmEnabled: false,
      persistence: {
        indexedDbWrites: false,
        localStorageProfileWrites: false,
        networkWrites: false
      },
      patient,
      patientId,
      role,
      hiddenAreas,
      priorityOrder: PRIORITY_ORDER.slice(),
      sourceIndex: sourceIndex.sources,
      gaps: visibleGaps,
      questions,
      inspectorCards: questions,
      blockedQuestions,
      blockedGaps: gaps.filter((gap) => !visibleGapIds.has(gap.id)),
      sourceCoverage: coverage,
      gateSummary: {
        gaps: visibleGaps.length,
        questions: questions.length,
        blockedQuestions: blockedQuestions.length,
        missingSourceRefs: coverage.missingRefs
      }
    };
  }

  function validateProjection(model) {
    const errors = [];
    if (!model || typeof model !== "object") return { valid: false, errors: ["model.missing"] };
    if (model.runtimeLlmEnabled !== false) errors.push("runtimeLlm.enabled");
    if (model.persistence?.indexedDbWrites !== false) errors.push("persistence.indexedDbWrites.enabled");
    if (model.persistence?.localStorageProfileWrites !== false) errors.push("persistence.localStorageProfileWrites.enabled");
    if (model.persistence?.networkWrites !== false) errors.push("persistence.networkWrites.enabled");
    if (model.scale !== "organizational_priority_only") errors.push("priority.scale.invalid");

    const gapById = new Map(asArray(model.gaps).map((gap) => [gap.id, gap]));
    asArray(model.questions).forEach((question) => {
      if (!question.projectionId) errors.push(`projectionId.missing:${question.id}`);
      if (!question.gapId || !gapById.has(question.gapId)) errors.push(`gap.missing:${question.id}`);
      const gap = gapById.get(question.gapId);
      if (gap && gap.projectionId !== question.projectionId) errors.push(`projectionId.mismatch:${question.id}`);
      if (!sourceRefsFor(question).length) errors.push(`source.missing:${question.id}`);
      if (question.status !== DITL_STATUS) errors.push(`ditl.status.invalid:${question.id}`);
      copyErrors([question.title, question.questionText, question.reason].filter(Boolean).join(" "))
        .forEach((error) => errors.push(`${question.id}.${error}`));
    });

    asArray(model.gaps).forEach((gap, index, list) => {
      if (!PRIORITY_ORDER.includes(gap.gapType)) errors.push(`gap.type.invalid:${gap.id}:${gap.gapType}`);
      if (!sourceRefsFor(gap).length) errors.push(`gap.source.missing:${gap.id}`);
      if (index > 0 && priorityRank(list[index - 1].gapType) > priorityRank(gap.gapType)) {
        errors.push(`priority.order.invalid:${gap.id}`);
      }
    });

    if (model.sourceCoverage?.missingCount) {
      errors.push(`sourceCoverage.missing:${model.sourceCoverage.missingRefs.join(",")}`);
    }
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    SOURCE_MISSING_REF,
    DITL_STATUS,
    PRIORITY_ORDER,
    GAP_META,
    FORBIDDEN_COPY_PATTERNS,
    buildSourceIndex,
    projectQualityQuestions,
    safeQuestion,
    validateProjection,
    _private: Object.freeze({
      clone,
      makeGap,
      makeQuestion,
      questionTextForGap,
      collectFlagGaps,
      collectKnownUnknownGaps,
      collectMedicationGaps,
      collectObservationGaps,
      collectVisitChecklistGaps,
      collectConsentLimitedGaps,
      hiddenAreasForRole,
      sourceCoverageFor
    })
  });
});
