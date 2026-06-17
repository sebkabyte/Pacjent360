(function initPatient360AuditCatalog(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const auditCatalog = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = auditCatalog;
  }
  root.Patient360AuditCatalog = auditCatalog;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360AuditCatalog(contract) {
  const ACTIONS = Object.freeze(contract?.SH0_AUDIT_ACTIONS || []);
  const POLICY_DECISIONS = Object.freeze(contract?.SH0_AUDIT_POLICY_DECISIONS || ["allowed", "blocked", "failed_closed"]);
  const RESOURCE_TYPES = Object.freeze(contract?.SH0_AUDIT_RESOURCE_TYPES || []);
  const ACTOR_ROLES = Object.freeze(["patient", "parent", "legal_guardian", "support_person", "doctor", "admin", "system"]);
  const FORBIDDEN_METADATA_KEYS = Object.freeze(["patientName", "documentText", "rawDocument", "freeTextMedical", "diagnosis", "recommendation"]);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function hasForbiddenMetadata(metadata = {}) {
    const keys = Object.keys(metadata || {});
    return keys.filter((key) => FORBIDDEN_METADATA_KEYS.includes(key));
  }

  function validateAuditEvent(event) {
    const errors = [];
    if (!event || typeof event !== "object") return { valid: false, errors: ["auditEvent.missing"] };
    ["auditEventId", "requestId", "actorRole", "patientProfileId", "action", "resourceType", "resourceId", "policyDecision", "scope", "purpose", "createdAt"].forEach((field) => {
      if (!event[field]) errors.push(`${field}.missing`);
    });
    if (!ACTIONS.includes(event.action)) errors.push("action.invalid");
    if (!POLICY_DECISIONS.includes(event.policyDecision)) errors.push("policyDecision.invalid");
    if (!RESOURCE_TYPES.includes(event.resourceType)) errors.push("resourceType.invalid");
    if (!ACTOR_ROLES.includes(event.actorRole)) errors.push("actorRole.invalid");
    hasForbiddenMetadata(event.metadata).forEach((key) => errors.push(`metadata.phi_key:${key}`));
    return { valid: errors.length === 0, errors };
  }

  function validateAuditTrail(events) {
    const errors = [];
    const seen = new Set();
    let previousTime = "";
    asArray(events).forEach((event, index) => {
      const validation = validateAuditEvent(event);
      validation.errors.forEach((error) => errors.push(`${event?.auditEventId || `event-${index}`}.${error}`));
      if (seen.has(event.auditEventId)) errors.push(`duplicate:${event.auditEventId}`);
      seen.add(event.auditEventId);
      if (previousTime && event.createdAt < previousTime) errors.push(`appendOnly.order:${event.auditEventId}`);
      previousTime = event.createdAt || previousTime;
    });
    return { valid: errors.length === 0, errors };
  }

  function canShowData({ policyAllowed, auditWriteStatus } = {}) {
    return policyAllowed === true && auditWriteStatus === "written";
  }

  function validateDataVisibilityScenario(scenario = {}) {
    const errors = [];
    const trailValidation = validateAuditTrail(scenario.auditTrail || []);
    trailValidation.errors.forEach((error) => errors.push(`auditTrail.${error}`));
    const visible = canShowData({
      policyAllowed: scenario.policyAllowed,
      auditWriteStatus: scenario.auditWriteStatus
    });
    if (scenario.dataVisible === true && !visible) errors.push("dataVisible.fail_closed_violation");
    if (scenario.dataVisible === true) {
      const hasAllowedRead = asArray(scenario.auditTrail).some((event) =>
        event.action === scenario.requiredAction &&
        event.resourceId === scenario.resourceId &&
        event.policyDecision === "allowed"
      );
      if (!hasAllowedRead) errors.push("dataVisible.audit_event_missing");
    }
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    ACTIONS,
    POLICY_DECISIONS,
    RESOURCE_TYPES,
    ACTOR_ROLES,
    FORBIDDEN_METADATA_KEYS,
    validateAuditEvent,
    validateAuditTrail,
    canShowData,
    validateDataVisibilityScenario
  });
});
