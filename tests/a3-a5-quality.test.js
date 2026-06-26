const test = require("node:test");
const assert = require("node:assert/strict");

const demoData = require("../public/patient360-demo-data.js");
const quality = require("../public/patient360-a3-a5-quality.js");

function buildState() {
  return demoData.buildDemoState({ today: "2026-06-26" });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("A3+A5 projection turns data gaps into source-grounded DITL questions", () => {
  const model = quality.projectQualityQuestions({ state: buildState(), patientId: "p1", role: "doctor", today: "2026-06-26" });
  const result = quality.validateProjection(model);

  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(model.dataMode, "synthetic_demo_state");
  assert.equal(model.scale, "organizational_priority_only");
  assert.equal(model.runtimeLlmEnabled, false);
  assert.equal(model.persistence.indexedDbWrites, false);
  assert.ok(model.questions.length > 0);
  assert.equal(model.sourceCoverage.missingCount, 0);
  assert.ok(model.questions.every((question) => question.status === quality.DITL_STATUS));
});

test("A3+A5 keeps one projection id for the gap and derived question", () => {
  const model = quality.projectQualityQuestions({ state: buildState(), patientId: "p1", role: "doctor", today: "2026-06-26" });
  const question = model.questions[0];
  const gap = model.gaps.find((item) => item.id === question.gapId);

  assert.ok(gap);
  assert.equal(question.projectionId, gap.projectionId);
  assert.ok(question.projectionId.startsWith("projection:ditl:gap-"));
  assert.ok(gap.linkedSurfaces.questionList);
  assert.ok(gap.linkedSurfaces.inspector);
  assert.ok(gap.linkedSurfaces.timelineFilm);
  assert.ok(gap.linkedSurfaces.report);
});

test("A3+A5 sorts by organizational priority, not clinical severity", () => {
  const state = buildState();
  state.observations.push({
    id: "o-stale",
    patientId: "p1",
    name: "Stary parametr testowy",
    type: "laboratorium",
    unit: "x",
    values: [{ date: "2024-01-01", value: 1, sourceRefs: ["doc:d1"] }]
  });

  const model = quality.projectQualityQuestions({ state, patientId: "p1", role: "doctor", today: "2026-06-26" });
  const priorities = model.gaps.map((gap) => gap.priority);

  assert.deepEqual(priorities, [...priorities].sort((a, b) => a - b));
  assert.ok(model.gaps.some((gap) => gap.gapType === "stale_data" && gap.recordId === "o-stale"));
});

test("A3+A5 source gate converts missing refs into explicit source_missing", () => {
  const state = buildState();
  state.flags.push({
    id: "f-source-missing",
    patientId: "p1",
    color: "amber",
    category: "Brak dokumentu testowego",
    question: "Z jakiego wpisu pochodzi informacja testowa?",
    evidence: "Testowy rekord bez sourceRefs.",
    status: quality.DITL_STATUS,
    sourceRefs: []
  });

  const model = quality.projectQualityQuestions({ state, patientId: "p1", role: "doctor", today: "2026-06-26" });
  const gap = model.gaps.find((item) => item.recordId === "f-source-missing");
  const question = model.questions.find((item) => item.gapId === gap?.id);

  assert.equal(gap.gapType, "source_missing");
  assert.ok(question.sourceRefs.includes("source_missing"));
  assert.equal(quality.validateProjection(model).valid, true);
});

test("A3+A5 safety gate blocks clinical or action-like wording", () => {
  const unsafe = quality.safeQuestion({
    id: "q-unsafe",
    projectionId: "projection:ditl:gap-unsafe",
    gapId: "gap-unsafe",
    type: "ditl_question",
    status: quality.DITL_STATUS,
    title: "Pilne zalecenie",
    questionText: "Czy trzeba skorygowac dawke?",
    sourceRefs: ["doc:d1"]
  });

  assert.equal(unsafe.allowed, false);
  assert.ok(unsafe.errors.some((error) => error.startsWith("copy.forbidden")));
});

test("A3+A5 caregiver view does not reveal hidden report gaps", () => {
  const state = clone(buildState());
  const model = quality.projectQualityQuestions({
    state,
    patientId: "p1",
    role: "caregiver",
    hiddenAreas: ["report"],
    today: "2026-06-26"
  });

  assert.ok(model.questions.some((question) => question.gapType === "consent_limited"));
  assert.ok(model.questions.every((question) => question.requiredArea !== "report" || question.gapType === "consent_limited"));
  assert.equal(quality.validateProjection(model).valid, true);
});
