const test = require("node:test");
const assert = require("node:assert/strict");

const demoData = require("../public/patient360-demo-data.js");
const a1Core = require("../public/patient360-a1-core.js");

function buildState() {
  return demoData.buildDemoState({ today: "2026-06-26" });
}

test("A1-Core projection is read-only, fixture-backed and source-grounded", () => {
  const model = a1Core.projectSafeDashboard({ state: buildState(), patientId: "p1", role: "doctor" });
  const result = a1Core.validateProjection(model);

  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(model.dataMode, "synthetic_demo_state");
  assert.equal(model.runtimeLlmEnabled, false);
  assert.equal(model.persistence.indexedDbWrites, false);
  assert.equal(model.persistence.localStorageProfileWrites, false);
  assert.equal(model.persistence.networkWrites, false);
  assert.ok(model.feedCards.length > 0);
  assert.ok(model.inspectorCards.length > 0);
  assert.equal(model.sourceCoverage.missingCount, 0);
});

test("A1-Core keeps DITL and data-quality items in the inspector", () => {
  const model = a1Core.projectSafeDashboard({ state: buildState(), patientId: "p1", role: "doctor" });

  assert.ok(model.inspectorCards.some((card) => card.type === "ditl_question" || card.type === "data_quality"));
  assert.ok(model.feedCards.every((card) => !["ditl_question", "missing_data", "discrepancy", "source_gap", "data_quality"].includes(card.type)));
});

test("A1-Core result projections carry the same ID across table, chart, life film and report", () => {
  const model = a1Core.projectSafeDashboard({ state: buildState(), patientId: "p1", role: "doctor" });
  const resultCard = model.resultCards[0];

  assert.ok(resultCard.projectionId.startsWith("projection:result:"));
  assert.ok(resultCard.linkedSurfaces.table);
  assert.ok(resultCard.linkedSurfaces.chart);
  assert.ok(resultCard.linkedSurfaces.timelineFilm);
  assert.ok(resultCard.linkedSurfaces.report);
  assert.ok(model.projectionLedger.some((row) => row.projectionId === resultCard.projectionId));
});

test("A1-Core safeRenderCard blocks missing source, unsafe copy, Phase 2 actions and consent leaks", () => {
  assert.equal(a1Core.safeRenderCard({
    id: "no-source",
    projectionId: "projection:no-source",
    type: "timeline_event",
    surface: "feed",
    title: "Bez zrodla"
  }).allowed, false);

  assert.equal(a1Core.safeRenderCard({
    id: "unsafe-copy",
    projectionId: "projection:unsafe-copy",
    type: "timeline_event",
    surface: "feed",
    title: "Pilne zalecenie",
    sourceRefs: ["doc:d1"]
  }).allowed, false);

  assert.equal(a1Core.safeRenderCard({
    id: "phase2",
    projectionId: "projection:phase2",
    type: "booking",
    surface: "feed",
    title: "Zadanie organizacyjne",
    actionId: "book_visit",
    sourceRefs: ["doc:d1"]
  }).allowed, false);

  assert.equal(a1Core.safeRenderCard({
    id: "leak",
    projectionId: "projection:leak",
    type: "source_summary",
    surface: "feed",
    title: "Raport ukryty",
    requiredArea: "report",
    sourceRefs: ["doc:d1"]
  }, { role: "caregiver", hiddenAreas: ["report"] }).allowed, false);
});

test("A1-Core blocks a source-less timeline event before it reaches feed rendering", () => {
  const state = buildState();
  state.timelineEvents.find((event) => event.id === "te1").sourceRefs = [];
  const model = a1Core.projectSafeDashboard({ state, patientId: "p1", role: "doctor" });

  assert.ok(!model.feedCards.some((card) => card.recordId === "te1"));
  assert.ok(model.blockedCards.some((card) => card.recordId === "te1" && card.errors.includes("source.missing")));
});

