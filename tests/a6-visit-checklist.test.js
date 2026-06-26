const test = require("node:test");
const assert = require("node:assert/strict");

const demoData = require("../public/patient360-demo-data.js");
const a6 = require("../public/patient360-a6-checklist.js");

function buildState() {
  return demoData.buildDemoState({ today: "2026-06-26" });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("A6 projects a read-only logistical visit checklist", () => {
  const model = a6.projectVisitChecklist({ state: buildState(), patientId: "p1", role: "patient", today: "2026-06-26" });
  const validation = a6.validateProjection(model);

  assert.equal(validation.valid, true, validation.errors.join("; "));
  assert.equal(model.dataMode, "synthetic_demo_state");
  assert.equal(model.scale, "logistical_only");
  assert.equal(model.runtimeLlmEnabled, false);
  assert.equal(model.persistence.indexedDbWrites, false);
  assert.equal(model.persistence.localStorageProfileWrites, false);
  assert.equal(model.persistence.networkWrites, false);
  assert.ok(model.items.length > 0);
  assert.equal(model.sourceCoverage.missingCount, 0);
});

test("A6 Jan checklist aggregates bring, ask and confirm items without ready duplicates", () => {
  const model = a6.projectVisitChecklist({ state: buildState(), patientId: "p1", role: "patient", today: "2026-06-26" });
  const byCategory = Object.fromEntries(model.sections.map((section) => [section.category, section]));

  assert.ok(byCategory.to_bring.count >= 1, "Jan should have at least one logistical item to bring");
  assert.ok(byCategory.to_ask.count >= 3, "Jan should have multiple DITL questions");
  assert.ok(byCategory.to_confirm.count >= 1, "Jan should have confirmation items");
  assert.equal(model.items.some((item) => item.category === "ready" && item.requiredArea === "medications"), false);
  assert.equal(new Set(model.items.map((item) => item.id)).size, model.items.length);
  assert.ok(model.items.every((item) => item.projectionId && item.sourceRefs.length && item.requiredArea));
});

test("A6 Maja parent caregiver with full consent receives the visible checklist", () => {
  const state = buildState();
  const patient = a6.projectVisitChecklist({ state, patientId: "p3", role: "patient", today: "2026-06-26" });
  const caregiver = a6.projectVisitChecklist({
    state,
    patientId: "p3",
    role: "caregiver",
    allowedAreas: ["documents", "results", "medications", "observations", "report", "tasks", "visits", "consent"],
    today: "2026-06-26"
  });

  assert.equal(a6.validateProjection(caregiver).valid, true);
  assert.equal(caregiver.items.length, patient.items.length);
  assert.deepEqual(
    caregiver.sections.map((section) => [section.category, section.count]),
    patient.sections.map((section) => [section.category, section.count])
  );
  assert.equal(caregiver.blockedItems.length, 0);
});

test("A6 limited caregiver scope cuts results and observations without zero-knowledge leakage", () => {
  const state = clone(buildState());
  state.consents.push({
    id: "g-a6-limited-p2",
    patientId: "p2",
    subject: "Żona Andrzeja - wsparcie organizacyjne",
    scope: "leki, zadania i terminy wizyt",
    role: "osoba wspierająca",
    caregiverId: "spouse-p2",
    caregiverName: "Żona Andrzeja",
    areas: ["medications", "tasks", "visits"],
    validFrom: "2026-06-01",
    validTo: "2026-07-30",
    status: "aktywny",
    sourceRefs: ["consent:g-a6-limited-p2"]
  });

  const model = a6.projectVisitChecklist({
    state,
    patientId: "p2",
    role: "caregiver",
    today: "2026-06-26"
  });
  const text = JSON.stringify(model);

  assert.equal(a6.validateProjection(model).valid, true);
  assert.ok(model.items.length > 0);
  assert.equal(model.items.some((item) => ["results", "observations"].includes(item.requiredArea)), false);
  assert.equal(model.blockedItems.length, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(model.consentGuard || {}, "hiddenCount"), false);
  assert.equal(/ukryto|zablok|brak dost|3 z 10/i.test(text), false);
});

test("A6 safety gate blocks clinical urgency and recommendation wording", () => {
  const unsafe = a6.safeChecklistItem({
    id: "unsafe",
    projectionId: "projection:unsafe",
    category: "to_confirm",
    title: "Krytyczne zalecenie",
    description: "Skonsultuj natychmiast",
    status: "confirm",
    requiredArea: "report",
    sourceRefs: ["doc:d1"],
    linkedSurfaces: {}
  });

  assert.equal(unsafe.allowed, false);
  assert.ok(unsafe.errors.some((error) => error.startsWith("copy.forbidden")));
});
