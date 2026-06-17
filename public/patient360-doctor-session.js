(function initPatient360DoctorSession(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const doctorSession = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = doctorSession;
  }
  root.Patient360DoctorSession = doctorSession;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360DoctorSession(contract) {
  const DATA_SCHEMA_VERSION = contract?.DATA_SCHEMA_VERSION || 7;
  const DATA_CONTRACT_VERSION = contract?.DATA_CONTRACT_VERSION || "0.1";
  const VIEWER_TYPES = Object.freeze(contract?.DOCTOR_VIEWER_TYPES || ["guest_doctor", "known_clinician", "clinic_user_later"]);
  const VIEWER_IDENTITY_STATUSES = Object.freeze(contract?.DOCTOR_VIEWER_IDENTITY_STATUSES || ["unknown", "declared", "verified_later"]);
  const SESSION_STATUSES = Object.freeze(contract?.DOCTOR_SESSION_STATUSES || ["created", "opened", "expired", "revoked", "blocked"]);
  const AUDIT_STATUSES = Object.freeze(contract?.DOCTOR_AUDIT_STATUSES || ["pending", "written", "failed_blocked"]);
  const ALLOWED_READ_ACTIONS = Object.freeze(contract?.DOCTOR_ALLOWED_READ_ACTIONS || ["open_packet", "view_summary", "view_source", "view_document_metadata", "close_session"]);
  const FORBIDDEN_CLAIM_PHRASES = Object.freeze(contract?.FORBIDDEN_CLAIM_PHRASES || []);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function collectText(value, texts = []) {
    if (Array.isArray(value)) {
      value.forEach((item) => collectText(item, texts));
      return texts;
    }
    if (!value || typeof value !== "object") return texts;
    Object.values(value).forEach((item) => {
      if (typeof item === "string") texts.push(item);
      else if (typeof item === "object") collectText(item, texts);
    });
    return texts;
  }

  function hasAllowedPacketViewAudit(session) {
    return asArray(session.auditTrail).some((event) =>
      event.action === "doctor_session.packet_viewed" &&
      event.policyDecision === "allowed" &&
      event.resourceType === "visitPacket" &&
      event.resourceId === session.packetId
    );
  }

  function hasOpenAttemptAudit(session) {
    return asArray(session.auditTrail).some((event) =>
      event.action === "doctor_session.open_attempted" &&
      event.resourceType === "visitPacket" &&
      event.resourceId === session.packetId
    );
  }

  function validateDoctorReadOnlySession(session, context = {}) {
    const errors = [];
    const packet = context.visitPacket;
    if (!session || typeof session !== "object") return { valid: false, errors: ["doctorSession.missing"] };
    if (session.schemaVersion !== DATA_SCHEMA_VERSION) errors.push("schemaVersion.invalid");
    if (session.contractVersion !== DATA_CONTRACT_VERSION) errors.push("contractVersion.invalid");
    ["sessionId", "packetId", "patientProfileId", "viewerType", "viewerIdentityStatus", "consentGrantId", "accessScopeId", "createdAt", "expiresAt", "auditStatus", "sessionStatus"].forEach((field) => {
      if (!session[field]) errors.push(`${field}.missing`);
    });
    if (!VIEWER_TYPES.includes(session.viewerType)) errors.push("viewerType.invalid");
    if (!VIEWER_IDENTITY_STATUSES.includes(session.viewerIdentityStatus)) errors.push("viewerIdentityStatus.invalid");
    if (!SESSION_STATUSES.includes(session.sessionStatus)) errors.push("sessionStatus.invalid");
    if (!AUDIT_STATUSES.includes(session.auditStatus)) errors.push("auditStatus.invalid");
    if (session.readOnly !== true) errors.push("readOnly.required");
    asArray(session.allowedActions).forEach((action) => {
      if (!ALLOWED_READ_ACTIONS.includes(action)) errors.push(`allowedActions.write_or_unknown:${action}`);
    });
    if (asArray(session.attemptedMutations).length) errors.push("attemptedMutations.not_allowed");
    if (session.visibleScope === "full_vault") errors.push("visibleScope.full_vault_not_allowed");
    if (session.dataVisible === true) {
      if (session.auditStatus !== "written") errors.push("dataVisible.auditStatus.not_written");
      if (!hasOpenAttemptAudit(session)) errors.push("audit.open_attempt.missing");
      if (!hasAllowedPacketViewAudit(session)) errors.push("audit.packet_view.missing");
    }
    if (session.auditStatus === "failed_blocked" && session.dataVisible === true) {
      errors.push("audit.failed_but_data_visible");
    }
    if (["expired", "revoked", "blocked"].includes(session.sessionStatus) && session.dataVisible === true) {
      errors.push("blocked_status.data_visible");
    }
    if (packet) {
      if (packet.packetId !== session.packetId) errors.push("packetId.mismatch");
      if (packet.patientProfileId !== session.patientProfileId) errors.push("patientProfileId.mismatch");
      if (packet.consentGrantId && packet.consentGrantId !== session.consentGrantId) errors.push("consentGrantId.mismatch");
      if (packet.accessScopeId && packet.accessScopeId !== session.accessScopeId) errors.push("accessScopeId.mismatch");
    }
    const text = collectText(session).join(" ");
    FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
      if (phrase && text.includes(phrase)) errors.push(`forbiddenPhrase:${phrase}`);
    });
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    VIEWER_TYPES,
    VIEWER_IDENTITY_STATUSES,
    SESSION_STATUSES,
    AUDIT_STATUSES,
    ALLOWED_READ_ACTIONS,
    validateDoctorReadOnlySession
  });
});
