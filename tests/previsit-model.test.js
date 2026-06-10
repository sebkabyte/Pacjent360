const test = require("node:test");
const assert = require("node:assert/strict");
const { readFixture, scopedState } = require("./helpers.js");
const preVisitModel = require("../public/patient360-previsit-model.js");

function build(fixture, patientId) {
  const state = scopedState(fixture, patientId);
  return preVisitModel.buildPreVisitModel({ state, patientId });
}

function countSteps(model) {
  return model.steps.reduce((counts, step) => {
    counts[step.state.key] = (counts[step.state.key] || 0) + 1;
    return counts;
  }, {});
}

test("empty pre-visit state starts without pretending readiness", () => {
  const fixture = readFixture("previsit-workflow-edgecases.json");
  const model = build(fixture, "previsit-empty");
  const validation = preVisitModel.validatePreVisitModel(model);
  assert.equal(validation.valid, true);
  assert.equal(model.steps.length, 6);
  assert.equal(model.checklistSummary.status.key, "empty");
  assert.equal(model.emptyState.hasAnyData, false);
  assert.deepEqual(countSteps(model), { missing: 4, ready: 1, confirm: 1 });
});

test("ready pre-visit fixture keeps all preparation steps ready", () => {
  const fixture = readFixture("previsit-workflow-edgecases.json");
  const model = build(fixture, "previsit-ready");
  const validation = preVisitModel.validatePreVisitModel(model);
  assert.equal(validation.valid, true);
  assert.equal(model.checklistSummary.total, 3);
  assert.equal(model.checklistSummary.ready, 3);
  assert.equal(model.checklistSummary.status.key, "ready");
  assert.deepEqual(countSteps(model), { ready: 6 });
  assert.equal(model.patientQuestions.length, 1);
});

test("checklist item state treats source_missing as a data gap", () => {
  assert.equal(preVisitModel.visitChecklistItemState({ done: true }).key, "ready");
  assert.equal(preVisitModel.visitChecklistItemState({ status: "brak", sourceRefs: ["source_missing"] }).key, "missing");
  assert.equal(preVisitModel.visitChecklistItemState({ status: "do potwierdzenia" }).key, "confirm");
  const summary = preVisitModel.visitChecklistSummary({ items: [{ done: true }, { status: "do potwierdzenia" }] });
  assert.equal(summary.total, 2);
  assert.equal(summary.ready, 1);
  assert.equal(summary.confirm, 1);
  assert.equal(summary.status.key, "confirm");
});

test("pre-visit validation catches unsafe wording in generated text", () => {
  const fixture = readFixture("previsit-workflow-edgecases.json");
  const model = build(fixture, "previsit-ready");
  model.steps[0].state.label = "pilnie";
  const validation = preVisitModel.validatePreVisitModel(model);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes("forbidden pre-visit phrase")));
});
