/*
  Pacjent360 A4 Consent Guard.
  Zero-knowledge projection filter for caregiver scoped views.
*/
(function initPatient360A4ConsentGuard(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.Patient360A4ConsentGuard = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360A4ConsentGuard() {
  "use strict";

  const SOURCE_MISSING_REF = "source_missing";
  const CONSENT_AREA = "consent";
  const ALL_AREAS = Object.freeze(["documents", "results", "medications", "observations", "visits", "tasks", "report", CONSENT_AREA]);
  const ZERO_KNOWLEDGE_EMPTY_COPY = "W tym widoku nie ma jeszcze udostepnionych danych.";
  const ZERO_KNOWLEDGE_FORBIDDEN_COPY = Object.freeze([
    "brak dostepu",
    "brak dostępu",
    "brak aktywnej zgody",
    "brak aktywnego dostepu",
    "brak aktywnego dostępu",
    "wymagana zgoda",
    "ukryto",
    "ukryte",
    "zablokowane",
    "zablokowano",
    "cofnieto",
    "cofnięto",
    "poza zgoda",
    "poza zgodą"
  ]);

  const SOURCE_REF_AREA = Object.freeze({
    doc: "documents",
    document: "documents",
    medication: "medications",
    observation: "results",
    result: "results",
    interview: "observations",
    transcript: "observations",
    visit: "visits",
    encounter: "visits",
    checklist: "tasks",
    task: "tasks",
    flag: "report",
    decision: "report",
    report: "report",
    knownUnknown: "report",
    consent: CONSENT_AREA
  });

  function asArray(value) {
    return Array.isArray(value) ? value : [value].filter(Boolean);
  }

  function unique(values) {
    return [...new Set(asArray(values).map(String).filter(Boolean))];
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function parseDate(value) {
    const date = new Date(String(value || "").slice(0, 10) + "T12:00:00Z");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function byPatient(state, key, patientId) {
    return asArray(state && state[key]).filter((item) => item.patientId === patientId);
  }

  function isActiveConsent(consent, today) {
    if (!consent || consent.status !== "aktywny") return false;
    const now = parseDate(today);
    const validFrom = parseDate(consent.validFrom);
    const validTo = parseDate(consent.validTo);
    if (now && validFrom && validFrom > now) return false;
    if (now && validTo && validTo < now) return false;
    return true;
  }

  function activeConsentAreas(state, patientId, today) {
    const areas = new Set();
    byPatient(state, "consents", patientId)
      .filter((consent) => isActiveConsent(consent, today))
      .filter((consent) => String(consent.role || "").toLowerCase() !== "pacjent")
      .filter((consent) => !String(consent.caregiverId || "").startsWith("facility-"))
      .forEach((consent) => {
        asArray(consent.areas).forEach((area) => {
          if (ALL_AREAS.includes(area)) areas.add(area);
        });
      });
    if (areas.size) areas.add(CONSENT_AREA);
    return [...areas];
  }

  function buildConsentContext(input = {}) {
    const state = input.state || {};
    const patientId = input.patientId || state.activePatientId || "";
    const role = input.role || state.activeRole || "doctor";
    const today = input.today || input.demoToday || state.demoToday || "2026-06-26";
    const visibleAreas = role === "caregiver"
      ? unique(input.visibleAreas || input.allowedAreas || activeConsentAreas(state, patientId, today))
      : ALL_AREAS.slice();
    const areaSet = new Set(visibleAreas);
    return {
      id: `a4-consent:${patientId}:${role}`,
      role,
      patientId,
      today,
      visibleAreas,
      areaSet,
      zeroKnowledge: role === "caregiver",
      emptyCopy: ZERO_KNOWLEDGE_EMPTY_COPY
    };
  }

  function areaForSourceRef(ref) {
    if (ref === SOURCE_MISSING_REF) return SOURCE_MISSING_REF;
    const prefix = String(ref || "").split(":")[0];
    return SOURCE_REF_AREA[prefix] || "report";
  }

  function sourceRefAllowed(ref, context) {
    if (ref === SOURCE_MISSING_REF) return true;
    if (context.role !== "caregiver") return true;
    const area = areaForSourceRef(ref);
    return context.areaSet.has(area);
  }

  function filterSourceRefs(refs, context) {
    const visible = unique(refs).filter((ref) => sourceRefAllowed(ref, context));
    return visible.length ? visible : [SOURCE_MISSING_REF];
  }

  function consentDecision(item, context) {
    if (context.role !== "caregiver") return { allowed: true, reason: "role.full_access" };
    if (!item || typeof item !== "object") return { allowed: false, reason: "item.missing" };
    if (!item.requiredArea) return { allowed: false, reason: "requiredArea.missing" };
    if (!context.areaSet.has(item.requiredArea)) return { allowed: false, reason: `area.denied:${item.requiredArea}` };
    return { allowed: true, reason: "area.allowed" };
  }

  function sanitizeItem(item, context) {
    const copy = { ...item };
    copy.sourceRefs = filterSourceRefs(copy.sourceRefs || [], context);
    copy.sourceStatus = copy.sourceRefs.includes(SOURCE_MISSING_REF) ? SOURCE_MISSING_REF : copy.sourceStatus || "source_refs";
    return copy;
  }

  function projectionLedger(cards) {
    return cards.map((card) => ({
      projectionId: card.projectionId,
      label: card.title || card.questionText || card.label || card.id,
      type: card.type || card.gapType || "projection",
      sourceRefs: unique(card.sourceRefs),
      linkedSurfaces: card.linkedSurfaces || {}
    }));
  }

  function filterItems(items, context) {
    const visible = [];
    const denied = [];
    asArray(items).forEach((item) => {
      const decision = consentDecision(item, context);
      if (!decision.allowed) {
        denied.push({ id: item && item.id, projectionId: item && item.projectionId, reason: decision.reason });
        return;
      }
      visible.push(sanitizeItem(item, context));
    });
    return { visible, denied };
  }

  function visibleSummary(model, visibleCards, visibleInspector) {
    return {
      visibleCards: visibleCards.length + visibleInspector.length,
      feedCards: visibleCards.length,
      inspectorCards: visibleInspector.length,
      blockedCards: 0,
      missingSourceRefs: model?.sourceCoverage?.missingRefs || []
    };
  }

  function guardA1CoreProjection(model, input = {}) {
    const context = input.context || buildConsentContext(input);
    if (!model || typeof model !== "object") return model;
    const feed = filterItems(model.feedCards, context);
    const inspector = filterItems(model.inspectorCards, context);
    const visibleCards = feed.visible;
    const visibleInspector = inspector.visible;
    const resultCards = visibleCards.filter((card) => card.type === "result_series");
    const timelineCards = visibleCards.filter((card) => card.type === "timeline_event");
    const visibleAll = [...visibleCards, ...visibleInspector];

    return {
      ...model,
      consentGuard: zeroKnowledgeSummary(context, visibleAll.length),
      hiddenAreas: context.role === "caregiver" ? [] : model.hiddenAreas || [],
      feedCards: visibleCards,
      inspectorCards: visibleInspector,
      resultCards,
      timelineCards,
      blockedCards: context.zeroKnowledge ? [] : asArray(model.blockedCards),
      projectionLedger: projectionLedger(visibleAll),
      gateSummary: context.zeroKnowledge ? visibleSummary(model, visibleCards, visibleInspector) : model.gateSummary,
      sourceCoverage: {
        ...(model.sourceCoverage || {}),
        checkedCount: visibleAll.flatMap((item) => unique(item.sourceRefs).filter((ref) => ref !== SOURCE_MISSING_REF)).length,
        sourceMissingCount: visibleAll.flatMap((item) => unique(item.sourceRefs)).filter((ref) => ref === SOURCE_MISSING_REF).length,
        missingCount: 0,
        missingRefs: []
      }
    };
  }

  function guardA3A5Projection(model, input = {}) {
    const context = input.context || buildConsentContext(input);
    if (!model || typeof model !== "object") return model;
    const gapFilter = filterItems(model.gaps, context);
    const visibleGapIds = new Set(gapFilter.visible.map((gap) => gap.id));
    const questionFilter = filterItems(model.questions, context);
    const questions = questionFilter.visible.filter((question) => visibleGapIds.has(question.gapId));
    const questionGapIds = new Set(questions.map((question) => question.gapId));
    const gaps = gapFilter.visible.filter((gap) => questionGapIds.has(gap.id));
    const visibleAll = [...gaps, ...questions];

    return {
      ...model,
      consentGuard: zeroKnowledgeSummary(context, questions.length),
      hiddenAreas: context.role === "caregiver" ? [] : model.hiddenAreas || [],
      gaps,
      questions,
      inspectorCards: questions,
      blockedQuestions: context.zeroKnowledge ? [] : asArray(model.blockedQuestions),
      blockedGaps: context.zeroKnowledge ? [] : asArray(model.blockedGaps),
      sourceCoverage: {
        ...(model.sourceCoverage || {}),
        checkedCount: visibleAll.flatMap((item) => unique(item.sourceRefs).filter((ref) => ref !== SOURCE_MISSING_REF)).length,
        sourceMissingCount: visibleAll.flatMap((item) => unique(item.sourceRefs)).filter((ref) => ref === SOURCE_MISSING_REF).length,
        missingCount: 0,
        missingRefs: []
      },
      gateSummary: context.zeroKnowledge
        ? {
          gaps: gaps.length,
          questions: questions.length,
          blockedQuestions: 0,
          missingSourceRefs: []
        }
        : model.gateSummary
    };
  }

  function zeroKnowledgeSummary(context, visibleCount) {
    return {
      id: context.id,
      role: context.role,
      zeroKnowledge: context.zeroKnowledge,
      visibleAreas: context.zeroKnowledge ? [] : context.visibleAreas.slice(),
      visibleCount,
      emptyCopy: context.emptyCopy
    };
  }

  function sanitizeZeroKnowledgeText(text) {
    const normalized = normalize(text);
    return !ZERO_KNOWLEDGE_FORBIDDEN_COPY.some((pattern) => normalized.includes(normalize(pattern))) &&
      !/\b\d+\s*z\s+\d+\b/i.test(String(text || ""));
  }

  function validateZeroKnowledgeProjection(model, input = {}) {
    const context = input.context || buildConsentContext(input);
    const errors = [];
    if (!model || typeof model !== "object") return { valid: false, errors: ["model.missing"] };
    const collections = [
      ...asArray(model.feedCards),
      ...asArray(model.inspectorCards),
      ...asArray(model.gaps),
      ...asArray(model.questions),
      ...asArray(model.resultCards),
      ...asArray(model.timelineCards)
    ];
    if (context.role === "caregiver") {
      if (model.blockedCards?.length) errors.push("zeroKnowledge.blockedCards.visible");
      if (model.blockedQuestions?.length) errors.push("zeroKnowledge.blockedQuestions.visible");
      if (model.blockedGaps?.length) errors.push("zeroKnowledge.blockedGaps.visible");
      if (model.hiddenAreas?.length) errors.push("zeroKnowledge.hiddenAreas.visible");
      collections.forEach((item) => {
        if (!item.requiredArea) errors.push(`requiredArea.missing:${item.id || item.projectionId}`);
        if (item.requiredArea && !context.areaSet.has(item.requiredArea)) errors.push(`area.leak:${item.id || item.projectionId}:${item.requiredArea}`);
        unique(item.sourceRefs).forEach((ref) => {
          if (!sourceRefAllowed(ref, context)) errors.push(`source.leak:${item.id || item.projectionId}:${ref}`);
        });
      });
      if (model.consentGuard && Object.prototype.hasOwnProperty.call(model.consentGuard, "hiddenCount")) {
        errors.push("zeroKnowledge.hiddenCount.exposed");
      }
    }
    if (input.uiText && !sanitizeZeroKnowledgeText(input.uiText)) {
      errors.push("zeroKnowledge.copy.forbidden");
    }
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    SOURCE_MISSING_REF,
    ALL_AREAS,
    CONSENT_AREA,
    ZERO_KNOWLEDGE_EMPTY_COPY,
    ZERO_KNOWLEDGE_FORBIDDEN_COPY,
    buildConsentContext,
    activeConsentAreas,
    consentDecision,
    filterSourceRefs,
    guardA1CoreProjection,
    guardA3A5Projection,
    validateZeroKnowledgeProjection,
    sanitizeZeroKnowledgeText,
    _private: Object.freeze({
      clone,
      areaForSourceRef,
      filterItems,
      isActiveConsent,
      zeroKnowledgeSummary
    })
  });
});
