(function initPatient360VisitPacket(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const visitPacket = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = visitPacket;
  }
  root.Patient360VisitPacket = visitPacket;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360VisitPacket(contract) {
  const DATA_SCHEMA_VERSION = contract?.DATA_SCHEMA_VERSION || 7;
  const DATA_CONTRACT_VERSION = contract?.DATA_CONTRACT_VERSION || "0.1";
  const SOURCE_MISSING_REF = contract?.SOURCE_MISSING_REF || "source_missing";
  const STATUSES = Object.freeze(contract?.VISIT_PACKET_STATUSES || ["draft", "ready_to_share", "shared", "revoked", "expired", "superseded"]);
  const PREPARED_BY_ROLES = Object.freeze(contract?.VISIT_PACKET_PREPARED_BY_ROLES || ["patient", "parent", "legal_guardian", "support_person"]);
  const SOURCE_STATUSES = Object.freeze(contract?.VISIT_PACKET_SOURCE_STATUSES || [
    "confirmed",
    "patient_reported",
    "caregiver_observed",
    "document_derived",
    "to_verify",
    "conflicting",
    "missing_source",
    "outdated",
    "revoked_access"
  ]);
  const SECTION_KEYS = Object.freeze(contract?.VISIT_PACKET_SECTION_KEYS || [
    "summary90s",
    "topMatters",
    "medicationsToConfirm",
    "questionsForDoctor",
    "timelineHighlights",
    "documentsIncluded",
    "missingOrUncertain",
    "sourceIndex"
  ]);
  const DITL_STATUSES = Object.freeze(contract?.DITL_STATUSES || ["do wyjaśnienia", "wyjaśnione", "odrzucone", "dalsza kontrola"]);
  const FORBIDDEN_CLAIM_PHRASES = Object.freeze(contract?.FORBIDDEN_CLAIM_PHRASES || []);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeRefs(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value) return [String(value)];
    return [];
  }

  function hasSource(item) {
    return normalizeRefs(item?.sourceRefs).length > 0 || Boolean(item?.sourceRef) || item?.sourceMissing === true;
  }

  function refsFor(item) {
    const refs = normalizeRefs(item?.sourceRefs);
    if (item?.sourceRef) refs.push(String(item.sourceRef));
    if (item?.sourceMissing === true) refs.push(SOURCE_MISSING_REF);
    return [...new Set(refs)];
  }

  function collectText(value, texts = []) {
    if (Array.isArray(value)) {
      value.forEach((item) => collectText(item, texts));
      return texts;
    }
    if (!value || typeof value !== "object") return texts;
    Object.entries(value).forEach(([key, item]) => {
      if (["text", "title", "goal", "label", "description", "question", "safetyNotice"].includes(key) && item) {
        texts.push(String(item));
      } else if (typeof item === "object") {
        collectText(item, texts);
      }
    });
    return texts;
  }

  function sourceRefSet(packet) {
    return new Set(asArray(packet?.sourceIndex).map((source) => source.ref).filter(Boolean));
  }

  function sourcedItems(packet) {
    const items = [];
    if (packet?.visitContext) items.push(["visitContext", packet.visitContext]);
    if (packet?.summary90s) items.push(["summary90s", packet.summary90s]);
    ["topMatters", "medicationsToConfirm", "questionsForDoctor", "timelineHighlights", "documentsIncluded", "missingOrUncertain"].forEach((key) => {
      asArray(packet?.[key]).forEach((item) => items.push([`${key}.${item.id || item.documentId || item.questionId || "item"}`, item]));
    });
    return items;
  }

  function validateVisitPacket(packet) {
    const errors = [];
    const sourceRefs = sourceRefSet(packet);
    if (!packet || typeof packet !== "object") return { valid: false, errors: ["visitPacket.missing"] };
    if (packet.schemaVersion !== DATA_SCHEMA_VERSION) errors.push("schemaVersion.invalid");
    if (packet.contractVersion !== DATA_CONTRACT_VERSION) errors.push("contractVersion.invalid");
    ["packetId", "version", "generatedAt", "generatedByUserId", "patientProfileId", "preparedByRole", "status"].forEach((field) => {
      if (!packet[field]) errors.push(`${field}.missing`);
    });
    if (!STATUSES.includes(packet.status)) errors.push("status.invalid");
    if (!PREPARED_BY_ROLES.includes(packet.preparedByRole)) errors.push("preparedByRole.invalid");
    SECTION_KEYS.forEach((key) => {
      if (packet[key] === undefined) errors.push(`${key}.missing`);
    });
    if (!packet.visitContext?.goal) errors.push("visitContext.goal.missing");
    if (!packet.auditPolicy || packet.auditPolicy.mode !== "audit-before-read" || packet.auditPolicy.failClosed !== true) {
      errors.push("auditPolicy.audit_before_read.missing");
    }
    if (["ready_to_share", "shared"].includes(packet.status)) {
      ["consentGrantId", "accessScopeId", "expiresAt"].forEach((field) => {
        if (!packet[field]) errors.push(`${field}.missing_for_share`);
      });
    }
    if (!Array.isArray(packet.topMatters) || packet.topMatters.length > 3) errors.push("topMatters.max_three");
    if (!Array.isArray(packet.sourceIndex) || !packet.sourceIndex.length) errors.push("sourceIndex.empty");
    asArray(packet.sourceIndex).forEach((source) => {
      if (!source.ref) errors.push("sourceIndex.ref.missing");
      if (!SOURCE_STATUSES.includes(source.status)) errors.push(`sourceIndex.status.invalid:${source.ref || "unknown"}`);
    });
    sourcedItems(packet).forEach(([path, item]) => {
      if (!hasSource(item)) errors.push(`${path}.source.missing`);
      refsFor(item).forEach((ref) => {
        if (ref !== SOURCE_MISSING_REF && !sourceRefs.has(ref)) errors.push(`${path}.source.unknown:${ref}`);
      });
      if (!item.ditlStatus || !DITL_STATUSES.includes(item.ditlStatus)) errors.push(`${path}.ditlStatus.invalid`);
    });
    collectText(packet).join(" ").toLowerCase();
    const allText = collectText(packet).join(" ");
    FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
      if (phrase && allText.includes(phrase)) errors.push(`forbiddenPhrase:${phrase}`);
    });
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    STATUSES,
    PREPARED_BY_ROLES,
    SOURCE_STATUSES,
    SECTION_KEYS,
    validateVisitPacket
  });
});
