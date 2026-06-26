const path = require("node:path");

const root = path.resolve(__dirname, "..");
const demoData = require(path.join(root, "public", "patient360-demo-data.js"));
const a1Core = require(path.join(root, "public", "patient360-a1-core.js"));
const a3a5 = require(path.join(root, "public", "patient360-a3-a5-quality.js"));
const consentGuard = require(path.join(root, "public", "patient360-a4-consent-guard.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildState() {
  return demoData.buildDemoState({ today: "2026-06-26" });
}

function caregiverContext(allowedAreas) {
  return consentGuard.buildConsentContext({
    state: buildState(),
    patientId: "p1",
    role: "caregiver",
    today: "2026-06-26",
    allowedAreas
  });
}

function validateA1ZeroKnowledge() {
  const state = buildState();
  const raw = a1Core.projectSafeDashboard({ state, patientId: "p1", role: "doctor" });
  const context = caregiverContext(["medications"]);
  const guarded = consentGuard.guardA1CoreProjection(raw, { context });
  const validation = consentGuard.validateZeroKnowledgeProjection(guarded, { context });

  assert(validation.valid, `A1 zero-knowledge projection invalid: ${validation.errors.join("; ")}`);
  assert(raw.feedCards.length > guarded.feedCards.length, "Caregiver-limited A1 projection should be trimmed");
  assert(guarded.feedCards.every((card) => card.requiredArea === "medications"), "A1 caregiver projection should expose only medication cards");
  assert(guarded.blockedCards.length === 0, "A1 caregiver projection must not expose blocked card counters");
  assert(!Object.prototype.hasOwnProperty.call(guarded.consentGuard, "hiddenCount"), "A1 caregiver projection must not expose hidden counts");
}

function validateA3A5OrphanCleanup() {
  const state = buildState();
  state.observations.push({
    id: "o-a4-validator-stale",
    patientId: "p1",
    name: "Stary wynik A4",
    type: "laboratorium",
    unit: "x",
    values: [{ date: "2024-01-01", value: 1, sourceRefs: ["doc:d1"] }]
  });
  const raw = a3a5.projectQualityQuestions({ state, patientId: "p1", role: "doctor", today: "2026-06-26" });
  const staleGap = raw.gaps.find((gap) => gap.recordId === "o-a4-validator-stale");
  assert(staleGap, "Validator stale result gap should exist before consent guard");
  assert(raw.questions.some((question) => question.gapId === staleGap.id), "Validator stale result question should exist before consent guard");

  const context = caregiverContext(["medications"]);
  const guarded = consentGuard.guardA3A5Projection(raw, { context });
  const validation = consentGuard.validateZeroKnowledgeProjection(guarded, { context });
  assert(validation.valid, `A3+A5 zero-knowledge projection invalid: ${validation.errors.join("; ")}`);
  assert(!guarded.gaps.some((gap) => gap.id === staleGap.id), "Hidden result gap should be removed");
  assert(!guarded.questions.some((question) => question.gapId === staleGap.id), "Question orphan should be removed with hidden gap");
  assert(guarded.blockedQuestions.length === 0, "A3+A5 caregiver projection must not expose blocked question counters");
}

function validateFailSafeAndCopy() {
  const context = caregiverContext(["documents"]);
  const guarded = consentGuard.guardA1CoreProjection({
    feedCards: [{ id: "no-area", projectionId: "projection:no-area", type: "timeline_event", sourceRefs: ["doc:d1"] }],
    inspectorCards: [],
    resultCards: [],
    timelineCards: [],
    blockedCards: []
  }, { context });

  assert(guarded.feedCards.length === 0, "Card without requiredArea should fail closed for caregiver");
  assert(consentGuard.sanitizeZeroKnowledgeText(consentGuard.ZERO_KNOWLEDGE_EMPTY_COPY), "Neutral empty copy should pass");
  assert(!consentGuard.sanitizeZeroKnowledgeText("Pokazujesz 3 z 10 ukrytych wynikow."), "Fractional hidden counter copy should fail");
  assert(!consentGuard.sanitizeZeroKnowledgeText("Brak dostepu do zablokowanych wizyt."), "Access-denied copy should fail");
}

if (require.main === module) {
  try {
    validateA1ZeroKnowledge();
    validateA3A5OrphanCleanup();
    validateFailSafeAndCopy();
    console.log("A4 consent guard validation passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  validateA1ZeroKnowledge,
  validateA3A5OrphanCleanup,
  validateFailSafeAndCopy
};
