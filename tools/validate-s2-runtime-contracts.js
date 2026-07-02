const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const consentModel = require(path.join(root, "public", "patient360-consent-model.js"));
const auditCatalog = require(path.join(root, "public", "patient360-audit-catalog.js"));
const visitPacketModel = require(path.join(root, "public", "patient360-visitpacket.js"));
const doctorSessionModel = require(path.join(root, "public", "patient360-doctor-session.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertUnchanged(label, before, after) {
  assert(JSON.stringify(after) === JSON.stringify(before), `${label}.mutated_input`);
}

function assertRuntimeImportable() {
  assert(typeof globalThis.window === "undefined", "runtime.window_global.present");
  assert(typeof globalThis.document === "undefined", "runtime.document_global.present");
  assert(typeof consentModel.validateConsentGrant === "function", "consentModel.validateConsentGrant.missing");
  assert(typeof consentModel.canAccess === "function", "consentModel.canAccess.missing");
  assert(typeof auditCatalog.validateAuditEvent === "function", "auditCatalog.validateAuditEvent.missing");
  assert(typeof auditCatalog.validateDataVisibilityScenario === "function", "auditCatalog.validateDataVisibilityScenario.missing");
  assert(typeof visitPacketModel.validateVisitPacket === "function", "visitPacket.validateVisitPacket.missing");
  assert(typeof doctorSessionModel.validateDoctorReadOnlySession === "function", "doctorSession.validateDoctorReadOnlySession.missing");
}

function assertNoDomRuntimeTokens(edgecases) {
  (edgecases.runtimeModules || []).forEach((modulePath) => {
    const text = read(modulePath);
    (edgecases.blockedRuntimeTokens || []).forEach((token) => {
      assert(!text.includes(token), `${modulePath}.runtimeToken.forbidden:${token}`);
    });
  });
}

function baseAuditVisibilityScenario(snapshot) {
  const event = clone(snapshot.auditEvents[0]);
  return {
    policyAllowed: true,
    auditWriteStatus: "written",
    dataVisible: true,
    requiredAction: event.action,
    resourceId: event.resourceId,
    auditTrail: [event]
  };
}

function applyMutation(testCase, context) {
  if (testCase.target === "auditVisibility") {
    const scenario = baseAuditVisibilityScenario(context.snapshot);
    if (testCase.mutate === "auditFailedDataVisible") {
      scenario.auditWriteStatus = "failed_blocked";
      scenario.dataVisible = true;
      return auditCatalog.validateDataVisibilityScenario(scenario).errors;
    }
  }

  if (testCase.target === "doctorSession") {
    const session = clone(context.validDoctorSession);
    if (testCase.mutate === "addWriteAction") {
      session.allowedActions.push("edit_patient_data");
    } else if (testCase.mutate === "auditFailedDataVisible") {
      session.auditStatus = "failed_blocked";
      session.dataVisible = true;
    } else {
      throw new Error(`${testCase.id}.unknown_mutation:${testCase.mutate}`);
    }
    return doctorSessionModel.validateDoctorReadOnlySession(session, { visitPacket: context.visitPacket }).errors;
  }

  if (testCase.target === "consentGrant") {
    const grant = clone(context.snapshot.consentGrants[0]);
    if (testCase.mutate === "removePacketFilter") {
      delete grant.resourceFilters;
      return consentModel.validateConsentGrant(grant, { now: "2026-07-03T09:00:00.000Z" }).errors;
    }
  }

  if (testCase.target === "auditEvent") {
    const event = clone(context.snapshot.auditEvents[0]);
    if (testCase.mutate === "addForbiddenMetadata") {
      event.metadata.diagnosis = "forbidden";
      return auditCatalog.validateAuditEvent(event).errors;
    }
  }

  throw new Error(`${testCase.id}.unknown_target_or_mutation:${testCase.target}:${testCase.mutate}`);
}

function assertPositiveContracts(context) {
  const grant = clone(context.snapshot.consentGrants[0]);
  const grantBefore = clone(grant);
  const consentResult = consentModel.validateConsentGrant(grant, { now: "2026-07-03T09:00:00.000Z" });
  assert(consentResult.valid, `consentGrant.positive.invalid:${consentResult.errors.join("; ")}`);
  const access = consentModel.canAccess(grant, {
    actorRole: "doctor",
    scope: "report.view",
    packetId: "vp-demo-001",
    at: "2026-07-03T09:00:00.000Z"
  });
  assert(access.allowed, `consentGrant.access.denied:${access.reasons.join("; ")}`);
  assertUnchanged("consentGrant", grantBefore, grant);

  const packetBefore = clone(context.visitPacket);
  const packetResult = visitPacketModel.validateVisitPacket(context.visitPacket);
  assert(packetResult.valid, `visitPacket.positive.invalid:${packetResult.errors.join("; ")}`);
  assertUnchanged("visitPacket", packetBefore, context.visitPacket);

  const session = clone(context.validDoctorSession);
  const sessionBefore = clone(session);
  const sessionResult = doctorSessionModel.validateDoctorReadOnlySession(session, { visitPacket: context.visitPacket });
  assert(sessionResult.valid, `doctorSession.positive.invalid:${sessionResult.errors.join("; ")}`);
  assertUnchanged("doctorSession", sessionBefore, session);

  const auditScenario = baseAuditVisibilityScenario(context.snapshot);
  const auditResult = auditCatalog.validateDataVisibilityScenario(auditScenario);
  assert(auditResult.valid, `auditVisibility.positive.invalid:${auditResult.errors.join("; ")}`);
}

function main() {
  const edgecases = readJson("fixtures/s2-runtime-contract-edgecases.json");
  assertRuntimeImportable();
  assertNoDomRuntimeTokens(edgecases);

  const snapshot = readJson("fixtures/s2-data-model.snapshot.json");
  const doctorFixture = readJson("fixtures/doctor-session-edgecases.json");
  const context = {
    snapshot,
    visitPacket: readJson("fixtures/visit-packet.snapshot.json"),
    validDoctorSession: doctorFixture.validCases.find((item) => item.id === "opened-guest-read-only").session
  };
  assert(context.validDoctorSession, "doctorSession.validCase.missing");

  assertPositiveContracts(context);
  (edgecases.negativeCases || []).forEach((testCase) => {
    const errors = applyMutation(testCase, context);
    assert(errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${errors.join("; ")}`);
    console.log(`${testCase.id}: rejected errors=${errors.join(",")}`);
  });
  console.log("S2 runtime contract validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
