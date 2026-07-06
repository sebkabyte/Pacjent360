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

// S2-R12: 3 presety zgody, role po ludzku (relacja), zastrzezenie o ustawowych prawach rodzica.
test("S2-R12: exactly 3 consent presets exist and validate against the consent area matrix", () => {
  assert.equal(consentModel.CONSENT_PRESETS.length, 3);
  const ids = consentModel.CONSENT_PRESETS.map((preset) => preset.id);
  assert.deepEqual(new Set(ids), new Set(["pelny_dostep", "pomoc_w_organizacji", "tylko_terminy"]));
  const validation = consentModel.validateConsentPresets(consentModel.CONSENT_PRESETS, caregiverModel.CAREGIVER_AREAS);
  assert.equal(validation.valid, true, validation.errors.join("; "));
});

test("S2-R12: preset with an area outside the consent matrix is rejected", () => {
  const badPreset = {
    id: "preset_spoza_macierzy",
    label: "Preset spoza macierzy",
    areas: ["documents", "not_a_real_area"]
  };
  const result = consentModel.validateConsentPresets([badPreset], caregiverModel.CAREGIVER_AREAS);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("preset.preset_spoza_macierzy.area.outside_matrix:not_a_real_area"));
});

test("S2-R12: consentPreset fills areas when no checkboxes are selected, and relation maps to a human role", () => {
  const fixture = readFixture("consent-draft-edgecases.json");
  const testCase = fixture.cases.find((item) => item.id === "preset-pomoc-w-organizacji-no-checkboxes");
  const result = buildCase(testCase);
  assert.equal(result.valid, true);
  assert.deepEqual(result.draft.consent.areas, ["documents", "visits", "tasks"]);
  assert.equal(result.draft.consent.role, "osoba wspierająca");
  assert.equal(result.draft.consent.preset, "pomoc_w_organizacji");
  assert.equal(result.draft.consent.relation, "babcia");
});

test("S2-R12: explicit checkboxes override the preset default areas", () => {
  const fixture = readFixture("consent-draft-edgecases.json");
  const testCase = fixture.cases.find((item) => item.id === "explicit-checkboxes-override-preset");
  const result = buildCase(testCase);
  assert.equal(result.valid, true);
  assert.deepEqual(result.draft.consent.areas, ["medications"]);
  assert.equal(result.draft.consent.areas.includes("visits"), false);
  assert.equal(result.draft.consent.role, "rodzic");
});

test("S2-R12: second-parent statutory-rights notice is defined and mentions parental rights", () => {
  assert.equal(typeof consentModel.SECOND_PARENT_NOTICE, "string");
  assert.ok(consentModel.SECOND_PARENT_NOTICE.includes("ustawowych praw rodzica"));
});
