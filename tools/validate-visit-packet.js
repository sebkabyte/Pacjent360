const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));
const visitPacket = require(path.join(root, "public", "patient360-visitpacket.js"));

const snapshotPath = path.join(root, "fixtures", "visit-packet.snapshot.json");
const pediatricSnapshotPath = path.join(root, "fixtures", "visit-packet-pediatric.snapshot.json");
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

function applyMutation(packet, testCase) {
  const mutation = typeof testCase === "string" ? testCase : testCase.mutate;
  const mutated = clone(packet);
  if (mutation === "injectSummaryText") {
    mutated.summary90s.text = String(testCase.text || "");
  } else if (mutation === "discrepancyMissingReportedSide") {
    delete mutated.discrepancies[0].reportedSays;
  } else if (mutation === "allergyWithoutCertainty") {
    delete mutated.allergies[0].certainty;
  } else if (mutation === "medicationFullUnknownGroup") {
    mutated.medicationsFull[0].group = "inne";
  } else if (mutation === "removeIdentityHeader") {
    delete mutated.identityHeader;
  } else if (mutation === "wrongPacketSchemaVersion") {
    mutated.visitPacketSchemaVersion = 1;
  } else if (mutation === "emptyAllergies") {
    mutated.allergies = [];
  } else if (mutation === "removeSummarySources") {
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
  const packet = applyMutation(basePacket, testCase);
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
  assert(defs.visitPacket.properties.visitPacketSchemaVersion.const === contract.VISIT_PACKET_SCHEMA_VERSION, "visitPacket schema version drift");
  ["identityHeader", "discrepancies", "allergies", "medicationsFull"].forEach((key) => {
    assert(defs.visitPacket.required.includes(key), `schema visitPacket must require ${key}`);
    assert(defs.visitPacket.properties[key], `schema visitPacket must define ${key}`);
  });
  assert(contract.VISIT_PACKET_SECTION_KEYS[0] === "discrepancies", "discrepancies must stay first render section");
  const groupEnum = defs.visitPacket.properties.medicationsFull.items.properties.group.enum.join("|");
  assert(groupEnum === contract.VISIT_PACKET_MEDICATION_GROUPS.join("|"), "medicationsFull group enum drift");
}

function main() {
  validateSchema();
  const snapshot = readJson(snapshotPath);
  const pediatricSnapshot = readJson(pediatricSnapshotPath);
  const edgecases = readJson(edgecasesPath);
  const positives = [
    validatePositive("snapshot", snapshot),
    validatePositive("pediatric-snapshot", pediatricSnapshot),
    ...(edgecases.validCases || []).map((testCase) => validatePositive(testCase.id, testCase.packet))
  ];
  assert(JSON.stringify(snapshot).includes("atorwastatyna"), "adult snapshot must carry the real-substance discrepancy case");
  assert(JSON.stringify(pediatricSnapshot).includes("amoksycylina 250 mg/5 ml"), "pediatric snapshot must carry the amoxicillin case");
  [snapshot, pediatricSnapshot].forEach((packet) => {
    assert((packet.sourceIndex || []).some((source) => source.status === "conflicting"), `${packet.packetId}: expected at least one conflicting source`);
    const ditlStatuses = new Set([packet.visitContext, packet.summary90s, ...packet.topMatters, ...packet.questionsForDoctor, ...packet.timelineHighlights].map((item) => item && item.ditlStatus).filter(Boolean));
    assert(ditlStatuses.size >= 2, `${packet.packetId}: ditlStatus must be diversified, got ${[...ditlStatuses].join(",")}`);
  });
  const negatives = (edgecases.negativeCases || []).map((testCase) => validateNegative(snapshot, testCase));
  assert(positives.length >= 4, "VisitPacket positives should include both snapshots and edge cases");
  assert(negatives.length >= 19, "VisitPacket negatives should cover source, consent, DITL, audit, forbidden-phrase and new-section failures");
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
