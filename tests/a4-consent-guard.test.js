const test = require("node:test");
const assert = require("node:assert/strict");

const demoData = require("../public/patient360-demo-data.js");
const a1Core = require("../public/patient360-a1-core.js");
const a3a5 = require("../public/patient360-a3-a5-quality.js");
const consentGuard = require("../public/patient360-a4-consent-guard.js");

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

test("A4 lets doctor and patient projections pass without zero-knowledge trimming", () => {
  const state = buildState();
  const raw = a1Core.projectSafeDashboard({ state, patientId: "p1", role: "doctor" });
  const guarded = consentGuard.guardA1CoreProjection(raw, {
    context: consentGuard.buildConsentContext({ state, patientId: "p1", role: "doctor", today: "2026-06-26" })
  });

  assert.equal(guarded.feedCards.length, raw.feedCards.length);
  assert.equal(guarded.inspectorCards.length, raw.inspectorCards.length);
  assert.equal(guarded.consentGuard.zeroKnowledge, false);
});

test("A4 caregiver filter trims A1 cards and exposes only visible counters", () => {
  const state = buildState();
  const raw = a1Core.projectSafeDashboard({ state, patientId: "p1", role: "doctor" });
  const guarded = consentGuard.guardA1CoreProjection(raw, { context: caregiverContext(["medications"]) });
  const validation = consentGuard.validateZeroKnowledgeProjection(guarded, { context: caregiverContext(["medications"]) });

  assert.equal(validation.valid, true, validation.errors.join("; "));
  assert.ok(raw.feedCards.length > guarded.feedCards.length);
  assert.ok(guarded.feedCards.every((card) => card.requiredArea === "medications"));
  assert.equal(guarded.gateSummary.feedCards, guarded.feedCards.length);
  assert.equal(guarded.blockedCards.length, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(guarded.consentGuard, "hiddenCount"), false);
});

test("A4 fail-safe blocks caregiver items without requiredArea", () => {
  const raw = {
    feedCards: [{
      id: "unsafe-no-area",
      projectionId: "projection:test:no-area",
      type: "timeline_event",
      sourceRefs: ["doc:d1"]
    }],
    inspectorCards: [],
    resultCards: [],
    timelineCards: [],
    blockedCards: []
  };
  const guarded = consentGuard.guardA1CoreProjection(raw, { context: caregiverContext(["documents"]) });

  assert.equal(guarded.feedCards.length, 0);
  assert.equal(guarded.blockedCards.length, 0);
  assert.equal(guarded.gateSummary.feedCards, 0);
});

test("A4 source guard removes hidden source refs without exposing blocked sources", () => {
  const raw = {
    feedCards: [{
      id: "visit-with-doc-source",
      projectionId: "projection:test:visit",
      type: "timeline_event",
      requiredArea: "visits",
      sourceRefs: ["doc:d1"]
    }],
    inspectorCards: [],
    resultCards: [],
    timelineCards: [],
    blockedCards: []
  };
  const guarded = consentGuard.guardA1CoreProjection(raw, { context: caregiverContext(["visits"]) });

  assert.equal(guarded.feedCards.length, 1);
  assert.deepEqual(guarded.feedCards[0].sourceRefs, ["source_missing"]);
  assert.equal(consentGuard.validateZeroKnowledgeProjection(guarded, { context: caregiverContext(["visits"]) }).valid, true);
});

test("A4 orphan cleanup removes DITL questions whose gap parent is outside consent", () => {
  const state = buildState();
  state.observations.push({
    id: "o-a4-stale",
    patientId: "p1",
    name: "Stary wynik A4",
    type: "laboratorium",
    unit: "x",
    values: [{ date: "2024-01-01", value: 1, sourceRefs: ["doc:d1"] }]
  });
  const raw = a3a5.projectQualityQuestions({ state, patientId: "p1", role: "doctor", today: "2026-06-26" });
  const staleGap = raw.gaps.find((gap) => gap.recordId === "o-a4-stale");
  assert.ok(staleGap);
  assert.ok(raw.questions.some((question) => question.gapId === staleGap.id));

  const guarded = consentGuard.guardA3A5Projection(raw, { context: caregiverContext(["medications"]) });

  assert.ok(!guarded.gaps.some((gap) => gap.id === staleGap.id));
  assert.ok(!guarded.questions.some((question) => question.gapId === staleGap.id));
  assert.equal(guarded.blockedQuestions.length, 0);
  assert.equal(consentGuard.validateZeroKnowledgeProjection(guarded, { context: caregiverContext(["medications"]) }).valid, true);
});

test("A4 zero-knowledge text validator blocks leakage copy and fractions", () => {
  assert.equal(consentGuard.sanitizeZeroKnowledgeText("W tym widoku nie ma jeszcze udostepnionych danych."), true);
  assert.equal(consentGuard.sanitizeZeroKnowledgeText("Pokazujesz 3 z 10 ukrytych wynikow."), false);
  assert.equal(consentGuard.sanitizeZeroKnowledgeText("Brak dostepu do zablokowanych wizyt."), false);
});
