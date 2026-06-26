const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const validator = require("../tools/validate-safety-gate-matrix.js");
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "fixtures", "system-wide-red-team-cases.json"), "utf8"));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("system-wide safety gate fixture remains synthetic and runtime-disabled", () => {
  const result = validator.validateSafetyGateFixture(fixture);
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(fixture.dataMode, "synthetic_fixture_only");
  assert.equal(fixture.runtimeLlmEnabled, false);
  assert.equal(fixture.phasePolicy.phase2Default, "blocked_until_explicit_approval");
});

test("safety gate validation requires all gates and blocked red-team cases", () => {
  const copy = clone(fixture);
  copy.requiredGates = copy.requiredGates.filter((gateId) => gateId !== "consent_gate");
  copy.cases[0].blockedExpected = false;
  const result = validator.validateSafetyGateFixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("requiredGates.missing:consent_gate")));
  assert.ok(result.errors.some((error) => error.includes("blockedExpected.mustBeTrue")));
});

test("safety gate validation blocks unsafe safeCopy but allows attackText in inputs", () => {
  const validAttack = validator.validateSafetyGateFixture(fixture);
  assert.equal(validAttack.valid, true, validAttack.errors.join("; "));

  const copy = clone(fixture);
  copy.cases[0].safeCopy = "Pilne zalecenie dla pacjenta";
  const result = validator.validateSafetyGateFixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("safeCopy.forbidden")));
});

test("phase boundary gate must explicitly cover A7 or A8 attempts", () => {
  const copy = clone(fixture);
  const boundaryCase = copy.cases.find((entry) => entry.gateId === "phase_boundary_gate");
  boundaryCase.input.requestedSprint = "A6";
  const result = validator.validateSafetyGateFixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("phaseBoundary.requestedSprint.required")));
});

test("projection gate catches timeline events trying to become source truth", () => {
  const copy = clone(fixture);
  const projectionCase = copy.cases.find((entry) => entry.gateId === "projection_gate");
  projectionCase.input.timelineEvent.independentClinicalMeaning = false;
  const result = validator.validateSafetyGateFixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("projection.attackShape.required")));
});

