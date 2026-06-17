(function initPatient360ConsentModel(root, factory) {
  const consentModel = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = consentModel;
  }
  root.Patient360ConsentModel = consentModel;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360ConsentModel() {
  const contract =
    typeof require === "function" ? require("./patient360-contract.js") : null;

  const ACCESS_SCOPE_KEYS = Object.freeze(contract?.ACCESS_SCOPE_KEYS || [
    "profile.view",
    "documents.metadata.view",
    "documents.file.view",
    "documents.upload",
    "medications.view",
    "medications.edit",
    "observations.view",
    "observations.add",
    "questions.view",
    "questions.add",
    "questions.status.mark",
    "timeline.view",
    "report.generate",
    "report.share",
    "report.view",
    "audit.view"
  ]);
  const CONSENT_ACTOR_ROLES = Object.freeze(contract?.CONSENT_ACTOR_ROLES || ["patient", "parent", "legal_guardian", "support_person", "doctor", "admin_governance"]);
  const CONSENT_GRANTEE_TYPES = Object.freeze(contract?.CONSENT_GRANTEE_TYPES || ["self", "parent", "legal_guardian", "support_person", "doctor", "governance"]);
  const CONSENT_GRANT_STATUSES = Object.freeze(contract?.CONSENT_GRANT_STATUSES || ["draft", "active", "revoked", "expired"]);
  const CONSENT_PURPOSES = Object.freeze(contract?.CONSENT_PURPOSES || ["self_management", "care_support", "pre_visit_review", "admin_governance"]);
  const ROLE_SCOPE_MATRIX = Object.freeze({
    patient: ACCESS_SCOPE_KEYS,
    parent: ACCESS_SCOPE_KEYS.filter((scope) => scope !== "audit.view"),
    legal_guardian: ACCESS_SCOPE_KEYS.filter((scope) => scope !== "audit.view"),
    support_person: [
      "profile.view",
      "documents.metadata.view",
      "documents.upload",
      "medications.view",
      "medications.edit",
      "observations.view",
      "observations.add",
      "questions.view",
      "questions.add",
      "timeline.view",
      "report.generate",
      "report.share",
      "report.view"
    ],
    doctor: [
      "profile.view",
      "documents.metadata.view",
      "documents.file.view",
      "medications.view",
      "observations.view",
      "questions.view",
      "questions.status.mark",
      "timeline.view",
      "report.view"
    ],
    admin_governance: ["audit.view"]
  });

  const FALLBACK_AREA_DEFINITIONS = Object.freeze([
    { key: "medications", label: "Leki" },
    { key: "visits", label: "Wizyty" },
    { key: "documents", label: "Dokumenty" },
    { key: "results", label: "Wyniki" },
    { key: "observations", label: "Obserwacje" },
    { key: "report", label: "Raport" },
    { key: "tasks", label: "Zadania organizacyjne" }
  ]);

  const LEGACY_AREA_ALIASES = Object.freeze({
    medications: ["medications", "leki", "lekowy", "leków", "lekow"],
    visits: ["visits", "wizyty", "wizyta", "kontrole", "procedury"],
    documents: ["documents", "dokumenty", "dokument", "źródła", "zrodla"],
    results: ["results", "wyniki", "wynik", "badania"],
    observations: ["observations", "obserwacje", "wywiad", "rodzina"],
    report: ["report", "raport"],
    tasks: ["tasks", "zadania", "checklisty"]
  });

  function normalize(value) {
    return String(value || "").trim();
  }

  function normalizeLower(value) {
    return normalize(value).toLowerCase();
  }

  function areaDefinitions(definitions) {
    const source = Array.isArray(definitions) && definitions.length ? definitions : FALLBACK_AREA_DEFINITIONS;
    return source
      .filter((area) => area && area.key)
      .map((area) => ({
        key: area.key,
        label: area.key === "tasks" ? "Zadania organizacyjne" : area.label || area.key
      }));
  }

  function areaKeys(definitions) {
    return areaDefinitions(definitions).map((area) => area.key);
  }

  function areaLabel(areaKey, definitions) {
    return areaDefinitions(definitions).find((area) => area.key === areaKey)?.label || areaKey;
  }

  function consentAreaOptions(definitions) {
    return areaDefinitions(definitions).map((area) => ({
      value: area.key,
      label: area.label
    }));
  }

  function parseLegacyAreas(value = "", definitions) {
    const text = normalizeLower(value);
    const allowedKeys = new Set(areaKeys(definitions));
    const areas = new Set();
    Object.entries(LEGACY_AREA_ALIASES).forEach(([key, aliases]) => {
      if (!allowedKeys.has(key)) return;
      if (aliases.some((alias) => text.includes(alias))) areas.add(key);
    });
    return [...areas];
  }

  function selectedConsentAreas(values = {}, definitions) {
    const allowedKeys = areaKeys(definitions);
    const selected = allowedKeys.filter((key) => values[`consentArea_${key}`] === key);
    if (selected.length) return selected;
    return parseLegacyAreas(values.areas || "", definitions);
  }

  function buildConsentDraft({ id, patient, patientId, patientName, values = {}, areaDefinitions: definitions } = {}) {
    const errors = [];
    const resolvedPatientId = patientId || patient?.id || "";
    const resolvedPatientName = patientName || patient?.name || resolvedPatientId;
    const areas = selectedConsentAreas(values, definitions);
    if (!id) errors.push({ code: "missing_id", message: "Brakuje identyfikatora zgody." });
    if (!resolvedPatientId) errors.push({ code: "missing_patient", message: "Brakuje identyfikatora pacjenta." });
    if (!areas.length) errors.push({ code: "missing_area", message: "Wybierz co najmniej jeden obszar udostępnienia." });

    const recipientKind = values.recipientKind === "patient" ? "patient" : "support";
    const supportSubject = normalize(values.subject || values.caregiverName);
    if (recipientKind === "support" && !supportSubject) {
      errors.push({ code: "missing_recipient", message: "Podaj odbiorcę lub nazwę opiekuna." });
    }

    if (errors.length) return { valid: false, errors };

    const subject = recipientKind === "patient" ? "Pacjent" : supportSubject;
    const role = recipientKind === "patient" ? "pacjent" : normalize(values.role) || "osoba wspierająca";
    const caregiverName = recipientKind === "patient" ? "Pacjent" : normalize(values.caregiverName) || supportSubject;
    const caregiverId = recipientKind === "patient" ? `patient-self-${resolvedPatientId}` : `caregiver-${id}`;
    const areaLabels = areas.map((area) => areaLabel(area, definitions));

    return {
      valid: true,
      draft: {
        recipientKind,
        patientName: normalize(resolvedPatientName) || resolvedPatientId,
        areaLabels,
        consent: {
          id,
          patientId: resolvedPatientId,
          subject,
          scope: normalize(values.scope),
          role,
          caregiverId,
          caregiverName,
          areas,
          validTo: normalize(values.validTo),
          status: "aktywny",
          sourceRefs: [`consent:${id}`]
        }
      }
    };
  }

  function validateConsentDraft(draft, definitions) {
    const errors = [];
    const warnings = [];
    const allowedKeys = new Set(areaKeys(definitions));
    const consent = draft?.consent || draft;
    if (!consent || typeof consent !== "object") {
      return { valid: false, errors: ["draft consent is missing"], warnings };
    }
    ["id", "patientId", "subject", "role", "caregiverId", "caregiverName", "validTo", "status"].forEach((field) => {
      if (!consent[field]) errors.push(`consent.${field} is missing`);
    });
    if (consent.status !== "aktywny") errors.push("draft consent status must be aktywny");
    if (!Array.isArray(consent.areas) || !consent.areas.length) errors.push("consent.areas must contain at least one area");
    if (!Array.isArray(consent.sourceRefs) || !consent.sourceRefs.includes(`consent:${consent.id}`)) {
      errors.push("consent.sourceRefs must include consent self-reference");
    }
    (consent.areas || []).forEach((area) => {
      if (!allowedKeys.has(area)) errors.push(`unknown consent area: ${area}`);
    });
    if (consent.role === "pacjent" && !String(consent.caregiverId || "").startsWith("patient-self-")) {
      errors.push("patient consent must use patient-self caregiverId");
    }
    if (consent.role !== "pacjent" && String(consent.caregiverId || "").startsWith("patient-self-")) {
      errors.push("support consent must not use patient-self caregiverId");
    }
    return { valid: errors.length === 0, errors, warnings };
  }

  function normalizeScopes(scopes) {
    return [...new Set((Array.isArray(scopes) ? scopes : []).map(String).filter(Boolean))];
  }

  function validateConsentGrant(grant, options = {}) {
    const errors = [];
    const warnings = [];
    if (!grant || typeof grant !== "object") return { valid: false, errors: ["consentGrant.missing"], warnings };
    ["consentGrantId", "patientProfileId", "grantorUserId", "granteeType", "purpose", "validFrom", "validUntil", "status"].forEach((field) => {
      if (!grant[field]) errors.push(`${field}.missing`);
    });
    if (!CONSENT_GRANTEE_TYPES.includes(grant.granteeType)) errors.push("granteeType.invalid");
    if (!CONSENT_PURPOSES.includes(grant.purpose)) errors.push("purpose.invalid");
    if (!CONSENT_GRANT_STATUSES.includes(grant.status)) errors.push("status.invalid");
    const scopes = normalizeScopes(grant.scopes);
    if (!scopes.length) errors.push("scopes.empty");
    scopes.forEach((scope) => {
      if (!ACCESS_SCOPE_KEYS.includes(scope)) errors.push(`scopes.unknown:${scope}`);
    });
    if (grant.status === "active") {
      if (!grant.validUntil) errors.push("validUntil.required_for_active");
      if (options.now && grant.validUntil <= options.now) errors.push("validUntil.expired");
    }
    if (grant.granteeType === "doctor") {
      if (grant.purpose !== "pre_visit_review") errors.push("doctor.purpose.invalid");
      if (!grant.resourceFilters?.packetId && !grant.resourceFilters?.packetVersion) errors.push("doctor.packet_filter.required");
      if (!scopes.includes("report.view")) errors.push("doctor.report_view.required");
    }
    if (grant.granteeType === "support_person" && scopes.includes("documents.file.view")) {
      warnings.push("support_person.documents_file_view.requires_explicit_review");
    }
    return { valid: errors.length === 0, errors, warnings };
  }

  function canAccess(grant, request = {}) {
    const validation = validateConsentGrant(grant, { now: request.at });
    if (!validation.valid) return { allowed: false, reasons: validation.errors };
    const actorRole = request.actorRole;
    const requestedScope = request.scope;
    const reasons = [];
    if (!CONSENT_ACTOR_ROLES.includes(actorRole)) reasons.push("actorRole.invalid");
    if (!ACCESS_SCOPE_KEYS.includes(requestedScope)) reasons.push("scope.invalid");
    if (grant.status !== "active") reasons.push(`status.${grant.status}`);
    if (request.at && grant.validUntil <= request.at) reasons.push("validUntil.expired");
    const roleAllowed = new Set(ROLE_SCOPE_MATRIX[actorRole] || []);
    if (!roleAllowed.has(requestedScope)) reasons.push("role_scope.denied");
    const grantScopes = new Set(normalizeScopes(grant.scopes));
    if (!grantScopes.has(requestedScope)) reasons.push("grant_scope.denied");
    if (actorRole === "doctor") {
      if (grant.granteeType !== "doctor") reasons.push("doctor.granteeType.required");
      if (request.packetId && grant.resourceFilters?.packetId && grant.resourceFilters.packetId !== request.packetId) reasons.push("packet.scope_mismatch");
    }
    return { allowed: reasons.length === 0, reasons };
  }

  return Object.freeze({
    FALLBACK_AREA_DEFINITIONS,
    ACCESS_SCOPE_KEYS,
    CONSENT_ACTOR_ROLES,
    CONSENT_GRANTEE_TYPES,
    CONSENT_GRANT_STATUSES,
    CONSENT_PURPOSES,
    ROLE_SCOPE_MATRIX,
    consentAreaOptions,
    parseLegacyAreas,
    selectedConsentAreas,
    buildConsentDraft,
    validateConsentDraft,
    validateConsentGrant,
    canAccess
  });
});
