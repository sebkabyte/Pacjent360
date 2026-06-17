const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));
const doctorSession = require(path.join(root, "public", "patient360-doctor-session.js"));
const visitPacket = require(path.join(root, "public", "patient360-visitpacket.js"));

const packetPath = path.join(root, "fixtures", "visit-packet.snapshot.json");
const fixturePath = path.join(root, "fixtures", "doctor-session-edgecases.json");
const schemaPath = path.join(root, "schema", "patient360.schema.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function applyMutation(session, mutation) {
  const mutated = clone(session);
  if (mutation === "removeAuditTrail") {
    mutated.auditTrail = [];
  } else if (mutation === "addWriteAction") {
    mutated.allowedActions.push("edit_patient_data");
  } else if (mutation === "addMutationAttempt") {
    mutated.attemptedMutations.push({ action: "edit_patient_data", field: "summary90s" });
  } else if (mutation === "fullVault") {
    mutated.visibleScope = "full_vault";
  } else if (mutation === "auditFailedDataVisible") {
    mutated.auditStatus = "failed_blocked";
    mutated.dataVisible = true;
  } else if (mutation === "packetMismatch") {
    mutated.packetId = "vp-other";
  } else if (mutation === "invalidViewerType") {
    mutated.viewerType = "system_agent";
  } else {
    throw new Error(`Unknown mutation: ${mutation}`);
  }
  return mutated;
}

function validatePositive(id, session, packet) {
  const result = doctorSession.validateDoctorReadOnlySession(session, { visitPacket: packet });
  assert(result.valid, `${id}: expected valid DoctorReadOnlySession, got ${result.errors.join("; ")}`);
  assert(session.schemaVersion === contract.DATA_SCHEMA_VERSION, `${id}: schemaVersion mismatch`);
  assert(session.contractVersion === contract.DATA_CONTRACT_VERSION, `${id}: contractVersion mismatch`);
  assert(session.readOnly === true, `${id}: session must be read-only`);
  assert(!session.allowedActions.some((action) => !doctorSession.ALLOWED_READ_ACTIONS.includes(action)), `${id}: unexpected action`);
  return { id, status: session.sessionStatus, visible: session.dataVisible };
}

function validateNegative(baseSession, testCase, packet) {
  const session = applyMutation(baseSession, testCase.mutate);
  const result = doctorSession.validateDoctorReadOnlySession(session, { visitPacket: packet });
  assert(!result.valid, `${testCase.id}: expected invalid DoctorReadOnlySession`);
  assert(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
  return { id: testCase.id, errors: result.errors };
}

function validateSchema() {
  const schema = readJson(schemaPath);
  const defs = schema.$defs || {};
  assert(defs.doctorReadOnlySession, "schema must define $defs.doctorReadOnlySession");
  assert(defs.doctorReadOnlySession.properties.viewerType.enum.join("|") === contract.DOCTOR_VIEWER_TYPES.join("|"), "doctor viewerType enum drift");
  assert(defs.doctorReadOnlySession.properties.sessionStatus.enum.join("|") === contract.DOCTOR_SESSION_STATUSES.join("|"), "doctor sessionStatus enum drift");
}

function main() {
  validateSchema();
  const packet = readJson(packetPath);
  const packetValidation = visitPacket.validateVisitPacket(packet);
  assert(packetValidation.valid, `VisitPacket fixture invalid: ${packetValidation.errors.join("; ")}`);
  const fixture = readJson(fixturePath);
  const positives = fixture.validCases.map((testCase) => validatePositive(testCase.id, testCase.session, packet));
  const baseSession = fixture.validCases.find((testCase) => testCase.id === "opened-guest-read-only").session;
  const negatives = fixture.negativeCases.map((testCase) => validateNegative(baseSession, testCase, packet));
  assert(positives.length >= 2, "Doctor session positives should include opened and blocked/expired edge");
  assert(negatives.length >= 7, "Doctor session negatives should cover audit, write, scope and identity failures");
  positives.forEach((item) => console.log(`${item.id}: valid status=${item.status} visible=${item.visible}`));
  negatives.forEach((item) => console.log(`${item.id}: rejected errors=${item.errors.join(",")}`));
  console.log("DoctorReadOnlySession validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
