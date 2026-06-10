const test = require("node:test");
const assert = require("node:assert/strict");
const { readFixture, clone } = require("./helpers.js");
const consentModel = require("../public/patient360-consent-model.js");
const caregiverModel = require("../public/patient360-caregiver-model.js");

function buildCase(testCase) {
  const fixture = readFixture("consent-draft-edgecases.json");
  const patient = fixture.patients.find((item) => item.id === testCase.patientId);
  return consentModel.buildConsentDraft({
    id: testCase.consentId,
    patient,
    values: testCase.values,
    areaDefinitions: caregiverModel.CAREGIVER_AREAS
  });
}

test("consent area options mirror caregiver area definitions", () => {
  const options = consentModel.consentAreaOptions(caregiverModel.CAREGIVER_AREAS);
  assert.equal(options.length, caregiverModel.CAREGIVER_AREAS.length);
  assert.ok(options.some((option) => option.value === "tasks" && option.label === "Zadania organizacyjne"));
  assert.deepEqual(consentModel.parseLegacyAreas("dokumenty, raport", caregiverModel.CAREGIVER_AREAS), ["documents", "report"]);
});

test("checkbox areas override legacy free-text areas", () => {
  const fixture = readFixture("consent-draft-edgecases.json");
  const testCase = fixture.cases.find((item) => item.id === "support-selected-areas");
  const before = clone(testCase.values);
  const result = buildCase(testCase);
  assert.deepEqual(testCase.values, before);
  assert.equal(result.valid, true);
  assert.deepEqual(result.draft.consent.areas, ["medications", "report"]);
  assert.equal(result.draft.consent.areas.includes("documents"), false);
  assert.equal(result.draft.consent.sourceRefs.includes("consent:cg-test-1"), true);
});

test("patient self consent uses patient-self recipient identity", () => {
  const fixture = readFixture("consent-draft-edgecases.json");
  const testCase = fixture.cases.find((item) => item.id === "patient-self");
  const result = buildCase(testCase);
  assert.equal(result.valid, true);
  assert.equal(result.draft.consent.role, "pacjent");
  assert.equal(result.draft.consent.caregiverId, "patient-self-consent-p1");
  assert.deepEqual(result.draft.areaLabels, ["Obserwacje", "Raport"]);
  assert.equal(consentModel.validateConsentDraft(result.draft, caregiverModel.CAREGIVER_AREAS).valid, true);
});

test("invalid consent drafts explain missing area and recipient", () => {
  const fixture = readFixture("consent-draft-edgecases.json");
  const missingArea = buildCase(fixture.cases.find((item) => item.id === "missing-area"));
  const missingRecipient = buildCase(fixture.cases.find((item) => item.id === "missing-recipient"));
  assert.equal(missingArea.valid, false);
  assert.ok(missingArea.errors.some((error) => error.code === "missing_area"));
  assert.equal(missingRecipient.valid, false);
  assert.ok(missingRecipient.errors.some((error) => error.code === "missing_recipient"));
});
