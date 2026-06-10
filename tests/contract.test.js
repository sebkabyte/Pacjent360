const test = require("node:test");
const assert = require("node:assert/strict");
const contract = require("../public/patient360-contract.js");

test("contract exposes frozen version and source constants", () => {
  assert.equal(contract.DATA_SCHEMA_VERSION, 7);
  assert.equal(contract.DATA_CONTRACT_VERSION, "0.1");
  assert.equal(contract.SOURCE_MISSING_REF, "source_missing");
  assert.equal(Object.isFrozen(contract), true);
  assert.equal(Object.isFrozen(contract.TIMELINE_TRACKS), true);
  assert.equal(Object.isFrozen(contract.FORBIDDEN_CLAIM_PHRASES), true);
});

test("timeline tracks remain unique and cover current demo lanes", () => {
  assert.equal(contract.TIMELINE_TRACKS.length, 9);
  assert.equal(new Set(contract.TIMELINE_TRACKS).size, contract.TIMELINE_TRACKS.length);
  assert.ok(contract.TIMELINE_TRACKS.includes("badania"));
  assert.ok(contract.TIMELINE_TRACKS.includes("leki"));
  assert.ok(contract.TIMELINE_TRACKS.includes("obserwacje z wywiadu"));
  assert.ok(contract.TIMELINE_TRACKS.includes("decyzje medyczne"));
});

test("evidence classes map source types without clinical scoring", () => {
  assert.equal(contract.SOURCE_TYPE_TO_EVIDENCE_CLASS.document, "official_document");
  assert.equal(contract.SOURCE_TYPE_TO_EVIDENCE_CLASS.interview, "patient_reported");
  assert.equal(contract.SOURCE_TYPE_TO_EVIDENCE_CLASS.transcript, "patient_reported");
  assert.equal(contract.SOURCE_TYPE_TO_EVIDENCE_CLASS.flag, "system_generated");
  assert.equal(contract.SOURCE_REF_PREFIX_TO_TYPE.consent, "consent");
  assert.ok(contract.EVIDENCE_CLASSES.includes("caregiver_reported"));
});

test("DITL, claim and forbidden phrase lists keep safety boundaries explicit", () => {
  assert.ok(contract.DITL_STATUSES.includes("do wyjaśnienia"));
  assert.ok(contract.CLAIM_TYPES.includes("Unknown"));
  assert.ok(contract.CLAIM_TYPES.includes("To verify"));
  assert.ok(contract.CLAIM_TYPES.includes("flag:blue"));
  assert.ok(contract.FORBIDDEN_CLAIM_PHRASES.includes("triage"));
  assert.ok(contract.FORBIDDEN_CLAIM_PHRASES.includes("zalecamy"));
});
