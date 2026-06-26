const path = require("node:path");

const root = path.resolve(__dirname, "..");
const demoData = require(path.join(root, "public", "patient360-demo-data.js"));
const a1Core = require(path.join(root, "public", "patient360-a1-core.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validatePositiveProjection() {
  const state = demoData.buildDemoState({ today: "2026-06-26" });
  const model = a1Core.projectSafeDashboard({ state, patientId: "p1", role: "doctor" });
  const result = a1Core.validateProjection(model);
  assert(result.valid, `A1-Core projection invalid: ${result.errors.join("; ")}`);
  assert(model.feedCards.length >= 3, "A1-Core should expose source-grounded feed cards");
  assert(model.inspectorCards.length >= 3, "A1-Core should expose DITL/data-quality inspector cards");
  assert(model.resultCards.length >= 1, "A1-Core should include result projections");
  assert(model.runtimeLlmEnabled === false, "A1-Core runtime LLM must remain disabled");
  assert(model.persistence.indexedDbWrites === false && model.persistence.networkWrites === false, "A1-Core must remain read-only");
  model.resultCards.forEach((card) => {
    ["table", "chart", "timelineFilm", "report"].forEach((surface) => {
      assert(card.linkedSurfaces[surface], `${card.id} missing linked surface ${surface}`);
    });
  });
}

function validateNegativeProjection() {
  const state = demoData.buildDemoState({ today: "2026-06-26" });

  const unsafeCopy = a1Core.safeRenderCard({
    id: "unsafe-copy",
    projectionId: "projection:unsafe",
    type: "timeline_event",
    surface: "feed",
    title: "Pilne zalecenie",
    sourceRefs: ["doc:d1"]
  });
  assert(!unsafeCopy.allowed, "unsafe clinical copy should be blocked");

  const missingSource = a1Core.safeRenderCard({
    id: "missing-source",
    projectionId: "projection:missing-source",
    type: "timeline_event",
    surface: "feed",
    title: "Dokument bez zrodla"
  });
  assert(!missingSource.allowed, "card without sourceRefs or source_missing should be blocked");

  const inspectorInFeed = a1Core.safeRenderCard({
    id: "inspector-in-feed",
    projectionId: "projection:inspector-in-feed",
    type: "ditl_question",
    surface: "feed",
    title: "Pytanie do rozmowy",
    sourceRefs: ["doc:d1"]
  });
  assert(!inspectorInFeed.allowed, "DITL question should not render in main feed");

  const phase2 = a1Core.safeRenderCard({
    id: "phase2",
    projectionId: "projection:phase2",
    type: "booking",
    surface: "feed",
    title: "Zadanie organizacyjne",
    actionId: "book_visit",
    sourceRefs: ["doc:d1"]
  });
  assert(!phase2.allowed, "A7/A8-like external action should be blocked in A1-Core");

  const consentLeak = a1Core.safeRenderCard({
    id: "consent-leak",
    projectionId: "projection:consent-leak",
    type: "source_summary",
    surface: "feed",
    title: "Raport ukryty",
    requiredArea: "report",
    sourceRefs: ["doc:d1"]
  }, { role: "caregiver", hiddenAreas: ["report"] });
  assert(!consentLeak.allowed, "caregiver hidden area leakage should be blocked");

  const mutatedState = clone(state);
  mutatedState.timelineEvents[0].sourceRefs = [];
  const model = a1Core.projectSafeDashboard({ state: mutatedState, patientId: "p1", role: "doctor" });
  assert(model.blockedCards.some((card) => card.id === "a1-feed-te1"), "timeline event without source should be blocked before render");
}

if (require.main === module) {
  try {
    validatePositiveProjection();
    validateNegativeProjection();
    console.log("A1-Core dashboard validation passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  validatePositiveProjection,
  validateNegativeProjection
};

