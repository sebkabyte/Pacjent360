const test = require("node:test");
const assert = require("node:assert/strict");
const { readFixture, scopedState } = require("./helpers.js");
const caregiverModel = require("../public/patient360-caregiver-model.js");

function build(fixture, patientId) {
  const state = scopedState(fixture, patientId);
  return caregiverModel.buildCaregiverModel({ state, patientId });
}

test("active caregiver scope exposes only consented areas and tasks", () => {
  const fixture = readFixture("caregiver-scope-edgecases.json");
  const model = build(fixture, "caregiver-active");
  const validation = caregiverModel.validateCaregiverModel(model);
  assert.equal(validation.valid, true);
  assert.equal(model.activeScopes.length, 1);
  assert.equal(model.inactiveScopes.length, 1);
  assert.ok(model.activeAreas.includes("medications"));
  assert.ok(model.activeAreas.includes("tasks"));
  assert.equal(model.activeAreas.includes("documents"), false);
  assert.equal(model.tasks.length, 2);
  assert.ok(model.tasks.every((task) => task.sourceRefs.length));
});

test("revoked-only caregiver scope hides data and keeps revocation effect", () => {
  const fixture = readFixture("caregiver-scope-edgecases.json");
  const model = build(fixture, "caregiver-none");
  const validation = caregiverModel.validateCaregiverModel(model);
  assert.equal(validation.valid, true);
  assert.equal(model.activeScopes.length, 0);
  assert.equal(model.inactiveScopes.length, 1);
  assert.deepEqual(model.activeAreas, []);
  assert.equal(model.tasks.length, 0);
  assert.equal(model.revocationEffects.length, 1);
});

test("legacy support roles display as human care circle roles", () => {
  assert.match(caregiverModel.displayRole("opiekun lekowy"), /obszar/);
  assert.match(caregiverModel.displayRole("opiekun wizyt"), /wizyty/);
  assert.equal(caregiverModel.displayRole("rodzic"), "rodzic");
  assert.deepEqual(caregiverModel.normalizeAreas({ scope: "leki, wizyty, dokumenty" }), ["medications", "visits", "documents"]);
  assert.deepEqual(caregiverModel.normalizeAreas({ areas: ["medications", "unknown"] }), ["medications"]);
});

test("caregiver validation blocks unsafe generated wording", () => {
  const fixture = readFixture("caregiver-scope-edgecases.json");
  const model = build(fixture, "caregiver-active");
  model.tasks[0].description = "natychmiast";
  const validation = caregiverModel.validateCaregiverModel(model);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes("forbidden caregiver phrase")));
});
