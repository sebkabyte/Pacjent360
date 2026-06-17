const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));
const visitPacket = require(path.join(root, "public", "patient360-visitpacket.js"));
const doctorSession = require(path.join(root, "public", "patient360-doctor-session.js"));
const consentModel = require(path.join(root, "public", "patient360-consent-model.js"));
const auditCatalog = require(path.join(root, "public", "patient360-audit-catalog.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function compareEnum(label, actual, expected) {
  assert(Array.isArray(actual), `${label}: actual enum missing`);
  assert(actual.join("|") === expected.join("|"), `${label}: enum drift`);
}

function assertNoForbiddenText(label, value) {
  const text = JSON.stringify(value);
  contract.FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
    if (phrase && text.includes(phrase)) throw new Error(`${label}: forbidden phrase ${phrase}`);
  });
}

function validateSchemaEnums() {
  const schema = readJson("schema/patient360.schema.json");
  const defs = schema.$defs || {};
  compareEnum("visitPacket.status", defs.visitPacket.properties.status.enum, contract.VISIT_PACKET_STATUSES);
  compareEnum("visitPacket.preparedByRole", defs.visitPacket.properties.preparedByRole.enum, contract.VISIT_PACKET_PREPARED_BY_ROLES);
  compareEnum("doctor.viewerType", defs.doctorReadOnlySession.properties.viewerType.enum, contract.DOCTOR_VIEWER_TYPES);
  compareEnum("doctor.sessionStatus", defs.doctorReadOnlySession.properties.sessionStatus.enum, contract.DOCTOR_SESSION_STATUSES);
  compareEnum("consentGrant.granteeType", defs.consentGrant.properties.granteeType.enum, contract.CONSENT_GRANTEE_TYPES);
  compareEnum("consentGrant.purpose", defs.consentGrant.properties.purpose.enum, contract.CONSENT_PURPOSES);
  compareEnum("consentGrant.scopes", defs.consentGrant.properties.scopes.items.enum, contract.ACCESS_SCOPE_KEYS);
  compareEnum("audit.action", defs.sh0AuditEvent.properties.action.enum, contract.SH0_AUDIT_ACTIONS);
  compareEnum("audit.policyDecision", defs.sh0AuditEvent.properties.policyDecision.enum, contract.SH0_AUDIT_POLICY_DECISIONS);
}

function validateVisitPacketConsent(packet, grant) {
  assert(packet.consentGrantId === grant.consentGrantId, "VisitPacket consentGrantId must match ConsentGrant");
  assert(packet.accessScopeId === "scope-demo-visit-001", "VisitPacket accessScopeId should remain fixture-scoped");
  const grantValidation = consentModel.validateConsentGrant(grant, { now: "2026-06-17T10:00:00.000Z" });
  assert(grantValidation.valid, `ConsentGrant invalid: ${grantValidation.errors.join("; ")}`);
  ["report.view", "documents.metadata.view", "medications.view", "questions.view", "timeline.view"].forEach((scope) => {
    const decision = consentModel.canAccess(grant, {
      actorRole: "doctor",
      scope,
      packetId: packet.packetId,
      at: "2026-06-17T10:00:00.000Z"
    });
    assert(decision.allowed, `doctor should have scoped access to ${scope}: ${decision.reasons.join("; ")}`);
  });
  if (packet.documentsIncluded.some((document) => document.fileIncluded)) {
    const decision = consentModel.canAccess(grant, {
      actorRole: "doctor",
      scope: "documents.file.view",
      packetId: packet.packetId,
      at: "2026-06-17T10:00:00.000Z"
    });
    assert(decision.allowed, `included files require documents.file.view: ${decision.reasons.join("; ")}`);
  }
}

function validateDoctorSessionAudit(packet, session, auditTrail) {
  const sessionValidation = doctorSession.validateDoctorReadOnlySession(session, { visitPacket: packet });
  assert(sessionValidation.valid, `Doctor session invalid: ${sessionValidation.errors.join("; ")}`);
  const trailValidation = auditCatalog.validateAuditTrail(auditTrail);
  assert(trailValidation.valid, `Audit trail invalid: ${trailValidation.errors.join("; ")}`);
  const readEvent = auditTrail.find((event) =>
    event.action === "doctor_session.packet_viewed" &&
    event.resourceId === packet.packetId &&
    event.policyDecision === "allowed"
  );
  assert(readEvent, "Doctor packet view must have an allowed audit event");
  const visibility = auditCatalog.validateDataVisibilityScenario({
    resourceId: packet.packetId,
    requiredAction: "doctor_session.packet_viewed",
    policyAllowed: true,
    auditWriteStatus: "written",
    dataVisible: session.dataVisible,
    auditTrail
  });
  assert(visibility.valid, `Doctor visibility scenario invalid: ${visibility.errors.join("; ")}`);
}

function main() {
  validateSchemaEnums();
  const packet = readJson("fixtures/visit-packet.snapshot.json");
  const packetValidation = visitPacket.validateVisitPacket(packet);
  assert(packetValidation.valid, `VisitPacket invalid: ${packetValidation.errors.join("; ")}`);
  assertNoForbiddenText("VisitPacket snapshot", packet);

  const consentFixture = readJson("fixtures/consent-draft-edgecases.json");
  const grant = consentFixture.consentGrantCases.find((item) => item.id === "doctor-visit-packet-consent").grant;
  validateVisitPacketConsent(packet, grant);

  const doctorFixture = readJson("fixtures/doctor-session-edgecases.json");
  const session = doctorFixture.validCases.find((item) => item.id === "opened-guest-read-only").session;
  const auditFixture = readJson("fixtures/audit-catalog-edgecases.json");
  validateDoctorSessionAudit(packet, session, auditFixture.validTrail);

  assert(contract.DATA_SCHEMA_VERSION === contract.SH0_SCHEMA_VERSION, "SH0 schema version must match data schema version");
  assert(consentModel.ACCESS_SCOPE_KEYS.join("|") === contract.ACCESS_SCOPE_KEYS.join("|"), "consent model access scopes must mirror contract");
  assert(auditCatalog.ACTIONS.join("|") === contract.SH0_AUDIT_ACTIONS.join("|"), "audit catalog actions must mirror contract");
  console.log("SH-0 cross-contract validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
