const test = require("node:test");
const assert = require("node:assert/strict");
const { readFixture, clone } = require("./helpers.js");

const consentModel = require("../public/patient360-consent-model.js");
const auditCatalog = require("../public/patient360-audit-catalog.js");
const visitPacketModel = require("../public/patient360-visitpacket.js");
const doctorSessionModel = require("../public/patient360-doctor-session.js");

test("S2 runtime modules import in Node without DOM globals", () => {
  assert.equal(globalThis.window, undefined);
  assert.equal(globalThis.document, undefined);
  assert.equal(typeof consentModel.validateConsentGrant, "function");
  assert.equal(typeof consentModel.canAccess, "function");
  assert.equal(typeof auditCatalog.validateDataVisibilityScenario, "function");
  assert.equal(typeof visitPacketModel.validateVisitPacket, "function");
  assert.equal(typeof doctorSessionModel.validateDoctorReadOnlySession, "function");
});

test("consent grant checks are deterministic, read-only and scoped to packet", () => {
  const slice = readFixture("s2-data-model.snapshot.json");
  const grant = clone(slice.consentGrants[0]);
  const before = clone(grant);
  const request = {
    actorRole: "doctor",
    scope: "report.view",
    packetId: "vp-demo-001",
    at: "2026-07-03T09:00:00.000Z"
  };

  assert.deepEqual(consentModel.validateConsentGrant(grant, { now: request.at }), consentModel.validateConsentGrant(grant, { now: request.at }));
  assert.equal(consentModel.canAccess(grant, request).allowed, true);
  assert.deepEqual(grant, before);

  const withoutReportScope = clone(grant);
  withoutReportScope.scopes = withoutReportScope.scopes.filter((scope) => scope !== "report.view");
  assert.equal(consentModel.canAccess(withoutReportScope, request).allowed, false);

  const wrongPacket = clone(grant);
  wrongPacket.resourceFilters.packetId = "vp-other";
  assert.equal(consentModel.canAccess(wrongPacket, request).allowed, false);
});

test("audit catalog fails closed before any data is visible", () => {
  const slice = readFixture("s2-data-model.snapshot.json");
  const event = clone(slice.auditEvents[0]);
  const scenario = {
    policyAllowed: true,
    auditWriteStatus: "failed_blocked",
    dataVisible: true,
    requiredAction: event.action,
    resourceId: event.resourceId,
    auditTrail: [event]
  };

  assert.equal(auditCatalog.canShowData({ policyAllowed: true, auditWriteStatus: "failed_blocked" }), false);
  const result = auditCatalog.validateDataVisibilityScenario(scenario);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("dataVisible.fail_closed_violation"));
});

test("VisitPacket and DoctorReadOnlySession validators are pure and fail closed", () => {
  const packet = readFixture("visit-packet.snapshot.json");
  const packetBefore = clone(packet);
  const packetResult = visitPacketModel.validateVisitPacket(packet);
  assert.equal(packetResult.valid, true, packetResult.errors.join("; "));
  assert.deepEqual(packet, packetBefore);

  const fixture = readFixture("doctor-session-edgecases.json");
  const session = clone(fixture.validCases.find((item) => item.id === "opened-guest-read-only").session);
  const sessionBefore = clone(session);
  const sessionResult = doctorSessionModel.validateDoctorReadOnlySession(session, { visitPacket: packet });
  assert.equal(sessionResult.valid, true, sessionResult.errors.join("; "));
  assert.deepEqual(session, sessionBefore);

  const failedAudit = clone(session);
  failedAudit.auditStatus = "failed_blocked";
  failedAudit.dataVisible = true;
  const failedAuditResult = doctorSessionModel.validateDoctorReadOnlySession(failedAudit, { visitPacket: packet });
  assert.equal(failedAuditResult.valid, false);
  assert.ok(failedAuditResult.errors.includes("dataVisible.auditStatus.not_written"));
  assert.ok(failedAuditResult.errors.includes("audit.failed_but_data_visible"));

  const writeAction = clone(session);
  writeAction.allowedActions.push("edit_patient_data");
  const writeActionResult = doctorSessionModel.validateDoctorReadOnlySession(writeAction, { visitPacket: packet });
  assert.equal(writeActionResult.valid, false);
  assert.ok(writeActionResult.errors.includes("allowedActions.write_or_unknown:edit_patient_data"));
});
