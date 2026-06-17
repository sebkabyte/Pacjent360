const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));
const visitPacket = require(path.join(root, "public", "patient360-visitpacket.js"));

const snapshotPath = path.join(root, "fixtures", "visit-packet.snapshot.json");
const edgecasesPath = path.join(root, "fixtures", "visit-packet-edgecases.json");
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

function applyMutation(packet, mutation) {
  const mutated = clone(packet);
  if (mutation === "removeSummarySources") {
    delete mutated.summary90s.sourceRefs;
    delete mutated.summary90s.sourceRef;
    delete mutated.summary90s.sourceMissing;
  } else if (mutation === "unknownSourceRef") {
    mutated.topMatters[0].sourceRefs = ["doc:missing"];
  } else if (mutation === "forbiddenPhrase") {
    mutated.summary90s.text = "diagnoza: tekst zakazany w pakiecie";
  } else if (mutation === "removeConsent") {
    delete mutated.consentGrantId;
  } else if (mutation === "tooManyMatters") {
    mutated.topMatters = [
      ...mutated.topMatters,
      { id: "matter-extra-001", title: "Dodatkowa sprawa", ditlStatus: "do wyjaśnienia", sourceMissing: true }
    ];
  } else if (mutation === "auditOpen") {
    mutated.auditPolicy.failClosed = false;
  } else if (mutation === "invalidDitlStatus") {
    mutated.visitContext.ditlStatus = "system_resolved";
  } else {
    throw new Error(`Unknown mutation: ${mutation}`);
  }
  return mutated;
}

function validatePositive(id, packet) {
  const result = visitPacket.validateVisitPacket(packet);
  assert(result.valid, `${id}: expected valid VisitPacket, got ${result.errors.join("; ")}`);
  assert(packet.schemaVersion === contract.DATA_SCHEMA_VERSION, `${id}: schemaVersion mismatch`);
  assert(packet.contractVersion === contract.DATA_CONTRACT_VERSION, `${id}: contractVersion mismatch`);
  assert(packet.auditPolicy.mode === "audit-before-read", `${id}: audit-before-read missing`);
  assert(packet.auditPolicy.failClosed === true, `${id}: failClosed must be true`);
  assert(packet.safetyNotice.includes("Decyzje medyczne podejmuje lekarz"), `${id}: DITL safety notice missing`);
  return { id, sections: visitPacket.SECTION_KEYS.length };
}

function validateNegative(basePacket, testCase) {
  const packet = applyMutation(basePacket, testCase.mutate);
  const result = visitPacket.validateVisitPacket(packet);
  assert(!result.valid, `${testCase.id}: expected invalid VisitPacket`);
  if (testCase.expectedError) {
    assert(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
  }
  if (testCase.expectedErrorIncludes) {
    assert(result.errors.some((error) => error.includes(testCase.expectedErrorIncludes)), `${testCase.id}: expected error containing ${testCase.expectedErrorIncludes}, got ${result.errors.join("; ")}`);
  }
  return { id: testCase.id, errors: result.errors };
}

function validateSchema() {
  const schema = readJson(schemaPath);
  const defs = schema.$defs || {};
  assert(defs.visitPacket, "schema must define $defs.visitPacket");
  assert(defs.visitPacket.properties.status.enum.join("|") === contract.VISIT_PACKET_STATUSES.join("|"), "visitPacket status enum drift");
  assert(defs.visitPacket.properties.preparedByRole.enum.join("|") === contract.VISIT_PACKET_PREPARED_BY_ROLES.join("|"), "visitPacket preparedByRole enum drift");
}

function main() {
  validateSchema();
  const snapshot = readJson(snapshotPath);
  const edgecases = readJson(edgecasesPath);
  const positives = [
    validatePositive("snapshot", snapshot),
    ...(edgecases.validCases || []).map((testCase) => validatePositive(testCase.id, testCase.packet))
  ];
  const negatives = (edgecases.negativeCases || []).map((testCase) => validateNegative(snapshot, testCase));
  assert(positives.length >= 3, "VisitPacket positives should include snapshot and edge cases");
  assert(negatives.length >= 7, "VisitPacket negatives should cover source, consent, DITL and audit failures");
  positives.forEach((item) => console.log(`${item.id}: valid sections=${item.sections}`));
  negatives.forEach((item) => console.log(`${item.id}: rejected errors=${item.errors.join(",")}`));
  console.log("VisitPacket validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
