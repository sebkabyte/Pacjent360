const path = require("node:path");

const root = path.resolve(__dirname, "..");
const demoData = require(path.join(root, "public", "patient360-demo-data.js"));
const quality = require(path.join(root, "public", "patient360-a3-a5-quality.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildState() {
  return demoData.buildDemoState({ today: "2026-06-26" });
}

function validatePositiveProjection() {
  const model = quality.projectQualityQuestions({ state: buildState(), patientId: "p1", role: "doctor", today: "2026-06-26" });
  const result = quality.validateProjection(model);

  assert(result.valid, `A3+A5 projection invalid: ${result.errors.join("; ")}`);
  assert(model.runtimeLlmEnabled === false, "A3+A5 runtime LLM must remain disabled");
  assert(model.persistence.indexedDbWrites === false && model.persistence.networkWrites === false, "A3+A5 must remain read-only");
  assert(model.scale === "organizational_priority_only", "A3+A5 priority must stay organizational only");
  assert(model.questions.length >= 4, "A3+A5 should expose DITL questions for demo gaps");
  assert(model.gaps.length === model.questions.length, "Each visible gap should map to one visible question");
  assert(model.sourceCoverage.missingCount === 0, "A3+A5 should not reference unknown sources");

  model.questions.forEach((question) => {
    const gap = model.gaps.find((item) => item.id === question.gapId);
    assert(gap, `${question.id} missing linked gap`);
    assert(gap.projectionId === question.projectionId, `${question.id} projection mismatch`);
    assert(question.sourceRefs.length > 0, `${question.id} missing source refs`);
    ["questionList", "inspector", "timelineFilm", "report"].forEach((surface) => {
      assert(gap.linkedSurfaces[surface], `${gap.id} missing linked surface ${surface}`);
    });
  });
}

function validateNegativeProjection() {
  const unsafe = quality.safeQuestion({
    id: "unsafe-question",
    projectionId: "projection:ditl:gap-unsafe",
    gapId: "gap-unsafe",
    type: "ditl_question",
    status: quality.DITL_STATUS,
    title: "Pilne zalecenie",
    questionText: "Czy trzeba skorygowac dawke?",
    sourceRefs: ["doc:d1"]
  });
  assert(!unsafe.allowed, "Unsafe clinical or action-like wording should be blocked");

  const state = buildState();
  state.flags.push({
    id: "f-source-missing-validator",
    patientId: "p1",
    color: "amber",
    category: "Brak dokumentu testowego",
    question: "Z jakiego wpisu pochodzi informacja testowa?",
    evidence: "Testowy rekord bez sourceRefs.",
    status: quality.DITL_STATUS,
    sourceRefs: []
  });
  state.observations.push({
    id: "o-stale-validator",
    patientId: "p1",
    name: "Stary parametr testowy",
    type: "laboratorium",
    unit: "x",
    values: [{ date: "2024-01-01", value: 1, sourceRefs: ["doc:d1"] }]
  });

  const model = quality.projectQualityQuestions({ state, patientId: "p1", role: "doctor", today: "2026-06-26" });
  const sourceGap = model.gaps.find((gap) => gap.recordId === "f-source-missing-validator");
  const staleGap = model.gaps.find((gap) => gap.recordId === "o-stale-validator");
  assert(sourceGap && sourceGap.gapType === "source_missing", "Missing source should become explicit source_missing");
  assert(model.questions.find((question) => question.gapId === sourceGap.id)?.sourceRefs.includes("source_missing"), "source_missing question should carry source_missing ref");
  assert(staleGap && staleGap.gapType === "stale_data", "Old result should become stale_data gap");
  assert(quality.validateProjection(model).valid, "Mutated projection should still be valid after safe source_missing handling");

  const caregiverModel = quality.projectQualityQuestions({
    state: clone(buildState()),
    patientId: "p1",
    role: "caregiver",
    hiddenAreas: ["report"],
    today: "2026-06-26"
  });
  assert(caregiverModel.questions.some((question) => question.gapType === "consent_limited"), "Caregiver hidden scope should produce consent_limited question");
  assert(caregiverModel.questions.every((question) => question.requiredArea !== "report" || question.gapType === "consent_limited"), "Caregiver should not receive hidden report gaps");
}

if (require.main === module) {
  try {
    validatePositiveProjection();
    validateNegativeProjection();
    console.log("A3+A5 quality validation passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  validatePositiveProjection,
  validateNegativeProjection
};
