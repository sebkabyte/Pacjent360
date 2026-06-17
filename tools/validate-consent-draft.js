const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const fixturePath = path.join(root, "fixtures", "consent-draft-edgecases.json");
const consentModel = require(path.join(publicRoot, "patient360-consent-model.js"));
const caregiverModel = require(path.join(publicRoot, "patient360-caregiver-model.js"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateCase(fixture, testCase) {
  const patient = fixture.patients.find((item) => item.id === testCase.patientId);
  assert(patient, `${testCase.id}: patient not found`);

  const beforeValues = clone(testCase.values);
  const result = consentModel.buildConsentDraft({
    id: testCase.consentId,
    patient,
    values: testCase.values,
    areaDefinitions: caregiverModel.CAREGIVER_AREAS
  });
  assert(sameJson(testCase.values, beforeValues), `${testCase.id}: buildConsentDraft mutated input values`);

  if (!testCase.expect.valid) {
    assert(!result.valid, `${testCase.id}: expected invalid result`);
    assert(
      (result.errors || []).some((error) => error.code === testCase.expect.errorCode),
      `${testCase.id}: expected error code ${testCase.expect.errorCode}`
    );
    return { id: testCase.id, valid: false, errors: result.errors.map((error) => error.code) };
  }

  assert(result.valid, `${testCase.id}: expected valid result, got ${JSON.stringify(result.errors || [])}`);
  const draft = result.draft;
  const consent = draft.consent;
  const validation = consentModel.validateConsentDraft(draft, caregiverModel.CAREGIVER_AREAS);
  assert(validation.valid, `${testCase.id}: draft validation failed: ${validation.errors.join("; ")}`);

  assert(consent.patientId === patient.id, `${testCase.id}: patientId mismatch`);
  assert(consent.subject === testCase.expect.subject, `${testCase.id}: subject mismatch`);
  assert(consent.role === testCase.expect.role, `${testCase.id}: role mismatch`);
  assert(consent.status === "aktywny", `${testCase.id}: status mismatch`);
  testCase.expect.areas.forEach((area) => {
    assert(consent.areas.includes(area), `${testCase.id}: missing area ${area}`);
  });
  (testCase.expect.absentAreas || []).forEach((area) => {
    assert(!consent.areas.includes(area), `${testCase.id}: unexpected area ${area}`);
  });
  if (testCase.expect.caregiverId) {
    assert(consent.caregiverId === testCase.expect.caregiverId, `${testCase.id}: caregiverId mismatch`);
  }
  if (testCase.expect.caregiverIdPrefix) {
    assert(consent.caregiverId.startsWith(testCase.expect.caregiverIdPrefix), `${testCase.id}: caregiverId prefix mismatch`);
  }
  assert(Array.isArray(consent.sourceRefs), `${testCase.id}: sourceRefs must be an array`);
  assert(consent.sourceRefs.includes(`consent:${consent.id}`), `${testCase.id}: missing consent self-reference`);
  (testCase.expect.sourceRefs || []).forEach((ref) => {
    assert(consent.sourceRefs.includes(ref), `${testCase.id}: missing expected sourceRef ${ref}`);
  });
  assert(draft.areaLabels.length === consent.areas.length, `${testCase.id}: areaLabels count mismatch`);
  return { id: testCase.id, valid: true, areas: consent.areas, role: consent.role };
}

function validateConsentGrantCase(testCase) {
  const validation = consentModel.validateConsentGrant(testCase.grant, { now: testCase.now });
  assert(validation.valid, `${testCase.id}: consent grant should be valid: ${validation.errors.join("; ")}`);
  (testCase.accessRequests || []).forEach((request) => {
    const decision = consentModel.canAccess(testCase.grant, request);
    assert(decision.allowed === request.expectAllowed, `${testCase.id}/${request.id}: expected allowed=${request.expectAllowed}, got ${decision.allowed} (${decision.reasons.join("; ")})`);
    if (!request.expectAllowed && request.reason) {
      assert(decision.reasons.includes(request.reason), `${testCase.id}/${request.id}: expected denial reason ${request.reason}, got ${decision.reasons.join("; ")}`);
    }
  });
  return { id: testCase.id, valid: true, accessChecks: (testCase.accessRequests || []).length };
}

function validateNegativeConsentGrantCase(testCase) {
  const validation = consentModel.validateConsentGrant(testCase.grant, { now: testCase.now });
  assert(!validation.valid, `${testCase.id}: expected invalid consent grant`);
  assert(validation.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${validation.errors.join("; ")}`);
  return { id: testCase.id, valid: false, errors: validation.errors };
}

function main() {
  assert(fs.existsSync(fixturePath), `Missing fixture: ${fixturePath}`);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const options = consentModel.consentAreaOptions(caregiverModel.CAREGIVER_AREAS);
  assert(options.length === caregiverModel.CAREGIVER_AREAS.length, "consent area options should mirror caregiver areas");
  assert(options.some((option) => option.value === "tasks" && option.label === "Zadania organizacyjne"), "tasks label should be user-facing");

  const results = fixture.cases.map((testCase) => validateCase(fixture, testCase));
  const grantResults = (fixture.consentGrantCases || []).map(validateConsentGrantCase);
  const negativeGrantResults = (fixture.negativeConsentGrantCases || []).map(validateNegativeConsentGrantCase);
  assert(consentModel.ACCESS_SCOPE_KEYS.includes("report.view"), "consent matrix should include report.view");
  assert(consentModel.ROLE_SCOPE_MATRIX.doctor.includes("report.view"), "doctor should be able to view report only through grant");
  assert(!consentModel.ROLE_SCOPE_MATRIX.doctor.includes("report.share"), "doctor must not share report");
  results.forEach((result) => {
    console.log(`${result.id}: ${result.valid ? `valid areas=${result.areas.join(",")} role=${result.role}` : `invalid errors=${result.errors.join(",")}`}`);
  });
  grantResults.forEach((result) => console.log(`${result.id}: valid accessChecks=${result.accessChecks}`));
  negativeGrantResults.forEach((result) => console.log(`${result.id}: invalid errors=${result.errors.join(",")}`));
  console.log("Consent draft validation passed");
}

main();
