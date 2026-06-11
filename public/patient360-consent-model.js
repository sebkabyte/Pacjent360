(function initPatient360ConsentModel(root, factory) {
  const consentModel = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = consentModel;
  }
  root.Patient360ConsentModel = consentModel;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360ConsentModel() {
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

  return Object.freeze({
    FALLBACK_AREA_DEFINITIONS,
    consentAreaOptions,
    parseLegacyAreas,
    selectedConsentAreas,
    buildConsentDraft,
    validateConsentDraft
  });
});
