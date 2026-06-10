const test = require("node:test");
const assert = require("node:assert/strict");
const { readFixture, scopedState } = require("./helpers.js");
const mapModel = require("../public/patient360-map-model.js");

const PERIODS = [
  { id: "episode", label: "Epizod" },
  { id: "year", label: "12 mies." },
  { id: "life", label: "Od urodzenia" }
];

const DETAILS = [
  { id: "overview", label: "Ogól" },
  { id: "standard", label: "Standard" },
  { id: "detail", label: "Szczegóły" }
];

function build(state, overrides = {}) {
  return mapModel.buildPatientMapModel({
    state,
    patientId: state.activePatientId,
    periodId: overrides.periodId || "episode",
    detailId: overrides.detailId || "standard",
    zoom: overrides.zoom ?? 0.9,
    selectedEventId: overrides.selectedEventId || "",
    trackFilter: overrides.trackFilter || null,
    today: "2026-06-08",
    periods: PERIODS,
    details: DETAILS
  });
}

test("map model handles empty patient without selecting phantom events", () => {
  const fixture = readFixture("patient-map-model-edgecases.json");
  const model = build(scopedState(fixture, "edge-empty"), { selectedEventId: "missing-event" });
  const validation = mapModel.validatePatientMapModel(model);
  assert.equal(validation.valid, true);
  assert.equal(model.events.length, 0);
  assert.equal(model.selectedId, "");
  assert.equal(model.sourceQuality.totalCount, 0);
});

test("map model keeps source_missing visible and links questions", () => {
  const fixture = readFixture("patient-map-model-edgecases.json");
  const model = build(scopedState(fixture, "edge-map"), { selectedEventId: "missing-event" });
  const validation = mapModel.validatePatientMapModel(model);
  assert.equal(validation.valid, true);
  assert.equal(model.selectedId, "edge-e1");
  assert.equal(model.sourceQuality.sourceMissingCount, 1);
  assert.ok(validation.warnings.some((warning) => warning.includes("source_missing")));
  assert.equal(model.questionsByEventId["edge-e1"].length, 1);
  assert.equal(model.questionsByEventId["edge-e2"].length, 1);
  assert.equal(model.quality.hasPlannedEvents, true);
});

test("life view adds anchors, while track filter removes virtual anchors", () => {
  const fixture = readFixture("patient-map-model-edgecases.json");
  const state = scopedState(fixture, "edge-map");
  const life = build(state, { periodId: "life" });
  assert.ok(life.events.some((event) => event.id === "anchor-birth" && event.virtual));
  assert.ok(life.events.some((event) => event.id === "anchor-now" && event.virtual));
  const filtered = build(state, { periodId: "life", trackFilter: "badania" });
  assert.equal(filtered.events.length, 1);
  assert.equal(filtered.events[0].track, "badania");
  assert.equal(filtered.events.some((event) => event.virtual), false);
});

test("map model rejects asserted causality and clamps geometry inputs", () => {
  const fixture = readFixture("patient-map-model-edgecases.json");
  const invalid = build(scopedState(fixture, "edge-map", { includeInvalidCausality: true }));
  const validation = mapModel.validatePatientMapModel(invalid);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes("relation asserts causality")));
  assert.equal(mapModel.normalizeTimelineZoom(99), 1.55);
  assert.equal(mapModel.normalizeTimelineZoom(-4), 0.4);
  assert.equal(mapModel.timelinePositionPercent("2026-05-16", { start: "2026-05-01", end: "2026-05-31" }), 50);
});
