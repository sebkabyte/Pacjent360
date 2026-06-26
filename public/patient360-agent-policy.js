/**
 * Pacjent360 - A0 agent policy and After Visit Loop contracts.
 *
 * This module is a dry-run contract layer. It validates shape, sources, DITL
 * status and forbidden outputs; it does not run an agent or produce clinical
 * decisions.
 */
(function initPatient360AgentPolicy(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const api = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.Patient360AgentPolicy = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360AgentPolicy(contract) {
  "use strict";

  const SOURCE_MISSING_REF = contract?.SOURCE_MISSING_REF || "source_missing";
  const DITL_STATUSES = Object.freeze(contract?.DITL_STATUSES || ["do wyjasnienia", "wyjasnione", "odrzucone", "dalsza kontrola"]);
  const FORBIDDEN_CLAIM_PHRASES = Object.freeze(contract?.FORBIDDEN_CLAIM_PHRASES || []);

  const AGENT_CLASSES = Object.freeze(["safe", "caution", "forbidden"]);
  const A0_AGENT_TYPES = Object.freeze([
    "DataQualityAgent",
    "SourceGroundingAgent",
    "DemoSafetyLintAgent",
    "ConsentGuardAgent",
    "VisitChecklistAgent",
    "DITLQuestionAgent",
    "MedicationSupportAgent",
    "ReportDraftingAgent",
    "VisitPlainLanguageAgent",
    "PostVisitTaskRouter",
    "MedicationAccessAgent",
    "CareNavigationAgent"
  ]);
  const SAFE_AGENTS = Object.freeze([
    "DataQualityAgent",
    "SourceGroundingAgent",
    "DemoSafetyLintAgent",
    "ConsentGuardAgent"
  ]);
  const CAUTION_AGENTS = Object.freeze(A0_AGENT_TYPES.filter((agentType) => !SAFE_AGENTS.includes(agentType)));
  const AFTER_VISIT_TYPES = Object.freeze({
    Encounter: {
      required: ["id", "patientId", "occurredAt", "encounterType", "sourceRefs", "status"],
      statuses: ["planned", "completed", "cancelled", "needs_confirmation"]
    },
    VisitArtifact: {
      required: ["id", "encounterId", "type", "sourceId", "consentStatus", "confidenceLabel", "retentionPolicy"],
      statuses: ["confirmed", "missing", "withdrawn", "not_applicable"]
    },
    VisitSummary: {
      required: ["id", "encounterId", "sourceRefs", "plainLanguageSummary", "status"],
      statuses: ["draft", "needs_review", "accepted", "rejected", "superseded"]
    },
    PostVisitPlan: {
      required: ["id", "encounterId", "summaryId", "careTaskIds", "status"],
      statuses: ["draft", "needs_review", "active", "closed", "superseded"]
    },
    CareTask: {
      required: ["id", "type", "title", "ownerRole", "sourceRefs", "status", "ditlStatus", "createdBy"],
      statuses: ["draft", "open", "done", "dismissed", "blocked", "superseded"]
    }
  });
  const CARE_TASK_TYPES = Object.freeze([
    "medication_purchase",
    "medication_confirmation",
    "lab_test_to_schedule",
    "lab_result_to_deliver",
    "referral_booking",
    "appointment_booking",
    "document_upload",
    "question_to_confirm",
    "caregiver_followup",
    "data_check",
    "visit_preparation",
    "source_review",
    "consent_review",
    "demo_safety_review"
  ]);
  const ALLOWED_OUTPUT_TYPES = Object.freeze([
    "ditl_question",
    "missing_data",
    "discrepancy",
    "preparation_task",
    "report_draft",
    "plain_language_summary",
    "post_visit_task",
    "visibility_decision",
    "audit_event"
  ]);
  const FORBIDDEN_OUTPUT_TYPES = Object.freeze([
    "diagnosis",
    "triage",
    "therapy_recommendation",
    "urgency_assessment",
    "dose_change",
    "clinical_decision",
    "risk_score",
    "drug_substitution"
  ]);
  const CLINICAL_WORDS = Object.freeze([
    "diagnoza",
    "rozpoznanie",
    "zalecenie",
    "terapia",
    "pilne",
    "natychmiast",
    "triage",
    "dawkowanie",
    "w normie",
    "poza norma",
    "poza norma"
  ]);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeRefs(value) {
    return asArray(value).map(String).filter(Boolean);
  }

  function add(errors, path, message) {
    errors.push(`${path}.${message}`);
  }

  function collectText(value, texts = []) {
    if (Array.isArray(value)) {
      value.forEach((item) => collectText(item, texts));
      return texts;
    }
    if (!value || typeof value !== "object") return texts;
    Object.entries(value).forEach(([key, item]) => {
      if (typeof item === "string" && ["title", "description", "text", "claim", "plainLanguageSummary", "resultSummary", "userVisibleLabel"].includes(key)) {
        texts.push(item);
      } else if (typeof item === "object") {
        collectText(item, texts);
      }
    });
    return texts;
  }

  function hasSourceRefs(item) {
    const refs = normalizeRefs(item?.sourceRefs);
    return refs.length > 0 || item?.sourceRef || item?.sourceStatus === SOURCE_MISSING_REF;
  }

  function validateForbiddenText(value, errors, path) {
    const text = collectText(value).join(" ").toLowerCase();
    [...FORBIDDEN_CLAIM_PHRASES, ...CLINICAL_WORDS].forEach((phrase) => {
      if (phrase && text.includes(String(phrase).toLowerCase())) {
        add(errors, path, `forbiddenText:${phrase}`);
      }
    });
  }

  function validateRecordShape(record, type, errors, path) {
    const def = AFTER_VISIT_TYPES[type];
    if (!def) return;
    def.required.forEach((field) => {
      if (record?.[field] === undefined || record?.[field] === "") add(errors, path, `${field}.missing`);
    });
    if (record?.status && !def.statuses.includes(record.status)) add(errors, path, "status.invalid");
    if (["Encounter", "VisitSummary", "CareTask"].includes(type) && !hasSourceRefs(record)) add(errors, path, "sourceRefs.missing");
    if (type === "CareTask") {
      if (!CARE_TASK_TYPES.includes(record.type)) add(errors, path, "type.invalid");
      if (!DITL_STATUSES.includes(record.ditlStatus)) add(errors, path, "ditlStatus.invalid");
    }
    validateForbiddenText(record, errors, path);
  }

  function validateAfterVisitBundle(bundle) {
    const errors = [];
    if (!bundle || typeof bundle !== "object") return { valid: false, errors: ["bundle.missing"] };
    asArray(bundle.encounters).forEach((record, index) => validateRecordShape(record, "Encounter", errors, `encounters.${index}`));
    asArray(bundle.visitArtifacts).forEach((record, index) => validateRecordShape(record, "VisitArtifact", errors, `visitArtifacts.${index}`));
    asArray(bundle.visitSummaries).forEach((record, index) => validateRecordShape(record, "VisitSummary", errors, `visitSummaries.${index}`));
    asArray(bundle.postVisitPlans).forEach((record, index) => validateRecordShape(record, "PostVisitPlan", errors, `postVisitPlans.${index}`));
    asArray(bundle.careTasks).forEach((record, index) => validateRecordShape(record, "CareTask", errors, `careTasks.${index}`));
    return { valid: errors.length === 0, errors };
  }

  function validateAgentPolicy(policy) {
    const errors = [];
    if (!policy || typeof policy !== "object") return { valid: false, errors: ["policy.missing"] };
    ["id", "agentType", "class", "version", "allowedOutputs", "forbiddenOutputs", "requiredConsentScopes", "validatorRules"].forEach((field) => {
      if (policy[field] === undefined || policy[field] === "") add(errors, "policy", `${field}.missing`);
    });
    if (!A0_AGENT_TYPES.includes(policy.agentType)) add(errors, "policy", "agentType.invalid");
    if (!AGENT_CLASSES.includes(policy.class)) add(errors, "policy", "class.invalid");
    if (SAFE_AGENTS.includes(policy.agentType) && policy.class !== "safe") add(errors, "policy", "class.safeExpected");
    if (CAUTION_AGENTS.includes(policy.agentType) && policy.class !== "caution") add(errors, "policy", "class.cautionExpected");
    asArray(policy.allowedOutputs).forEach((output) => {
      if (!ALLOWED_OUTPUT_TYPES.includes(output)) add(errors, "policy", `allowedOutputs.invalid:${output}`);
      if (FORBIDDEN_OUTPUT_TYPES.includes(output)) add(errors, "policy", `allowedOutputs.forbidden:${output}`);
    });
    FORBIDDEN_OUTPUT_TYPES.forEach((output) => {
      if (!asArray(policy.forbiddenOutputs).includes(output)) add(errors, "policy", `forbiddenOutputs.missing:${output}`);
    });
    if (policy.class === "caution" && policy.requiresHumanAcceptance !== true) add(errors, "policy", "requiresHumanAcceptance.requiredForCaution");
    if (policy.ditlStatusRequired !== true) add(errors, "policy", "ditlStatusRequired.missing");
    validateForbiddenText(policy, errors, "policy");
    return { valid: errors.length === 0, errors };
  }

  function validateAgentPolicies(policies) {
    const errors = [];
    const list = asArray(policies);
    const byAgent = new Map();
    list.forEach((policy, index) => {
      const result = validateAgentPolicy(policy);
      result.errors.forEach((error) => errors.push(`policies.${index}.${error}`));
      if (policy?.agentType) byAgent.set(policy.agentType, policy);
    });
    A0_AGENT_TYPES.forEach((agentType) => {
      if (!byAgent.has(agentType)) errors.push(`policies.missing:${agentType}`);
    });
    return { valid: errors.length === 0, errors };
  }

  function validateA0Fixture(fixture) {
    const policyResult = validateAgentPolicies(fixture?.agentPolicies || []);
    const afterVisitResult = validateAfterVisitBundle(fixture?.afterVisitBundle || {});
    return {
      valid: policyResult.valid && afterVisitResult.valid,
      errors: [...policyResult.errors, ...afterVisitResult.errors]
    };
  }

  return Object.freeze({
    SOURCE_MISSING_REF,
    A0_AGENT_TYPES,
    SAFE_AGENTS,
    CAUTION_AGENTS,
    AFTER_VISIT_TYPES,
    CARE_TASK_TYPES,
    ALLOWED_OUTPUT_TYPES,
    FORBIDDEN_OUTPUT_TYPES,
    validateAgentPolicy,
    validateAgentPolicies,
    validateAfterVisitBundle,
    validateA0Fixture
  });
});
