const path = require("node:path");

const root = path.resolve(__dirname, "..");
const demoData = require(path.join(root, "public", "patient360-demo-data.js"));
const a6 = require(path.join(root, "public", "patient360-a6-checklist.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildState() {
  return demoData.buildDemoState({ today: "2026-06-26" });
}

function validatePatientProjections() {
  const state = buildState();
  ["p1", "p2", "p3"].forEach((patientId) => {
    const model = a6.projectVisitChecklist({ state, patientId, role: "patient", today: "2026-06-26" });
    const validation = a6.validateProjection(model);
    assert(validation.valid, `${patientId} A6 projection invalid: ${validation.errors.join("; ")}`);
    assert(model.runtimeLlmEnabled === false, `${patientId} A6 runtime LLM must remain disabled`);
    assert(model.persistence.indexedDbWrites === false && model.persistence.networkWrites === false, `${patientId} A6 must remain read-only`);
    assert(model.scale === "logistical_only", `${patientId} A6 must stay logistical only`);
    assert(model.items.every((item) => item.sourceRefs.length), `${patientId} A6 item missing sourceRefs`);
    assert(model.items.every((item) => item.requiredArea), `${patientId} A6 item missing requiredArea`);
    assert(model.items.every((item) => item.projectionId), `${patientId} A6 item missing projectionId`);
    console.log(`${patientId}: items=${model.items.length}, ${model.sections.map((section) => `${section.category}=${section.count}`).join(", ")}`);
  });
}

function validateDeduplicationAndSourceGate() {
  const state = buildState();
  state.visitChecklists[0].items.push({
    id: "vci-a6-missing-extra",
    label: "Testowy dokument do zabrania",
    status: "brak",
    sourceRefs: ["source_missing"]
  });
  const model = a6.projectVisitChecklist({ state, patientId: "p1", role: "patient", today: "2026-06-26" });
  const ids = new Set(model.items.map((item) => item.id));
  assert(ids.size === model.items.length, "A6 should not duplicate checklist item ids");
  assert(model.items.some((item) => item.sourceRefs.includes("source_missing")), "A6 should keep explicit source_missing when source is manual/missing");
  assert(model.items.some((item) => item.category === "to_ask"), "A6 should include DITL questions");
  assert(!model.items.some((item) => item.category === "ready" && item.requiredArea === "medications"), "A6 should not mark medication as ready when DITL question exists");
}

function validateCaregiverZeroKnowledge() {
  const state = clone(buildState());
  state.consents.push({
    id: "g-a6-validator-p2",
    patientId: "p2",
    subject: "Opiekun testowy Andrzeja",
    scope: "leki i zadania organizacyjne",
    role: "osoba wspierająca",
    caregiverId: "validator-p2",
    caregiverName: "Opiekun testowy",
    areas: ["medications", "tasks", "visits"],
    validFrom: "2026-06-01",
    validTo: "2026-07-30",
    status: "aktywny",
    sourceRefs: ["consent:g-a6-validator-p2"]
  });
  const model = a6.projectVisitChecklist({ state, patientId: "p2", role: "caregiver", today: "2026-06-26" });
  const validation = a6.validateProjection(model);
  const text = JSON.stringify(model).toLowerCase();
  assert(validation.valid, `A6 caregiver projection invalid: ${validation.errors.join("; ")}`);
  assert(model.items.every((item) => !["results", "observations"].includes(item.requiredArea)), "A6 caregiver projection leaked hidden result/observation area");
  assert(model.blockedItems.length === 0, "A6 caregiver zero-knowledge projection must not expose blocked items");
  assert(!Object.prototype.hasOwnProperty.call(model.consentGuard || {}, "hiddenCount"), "A6 caregiver projection must not expose hidden count");
  assert(!["brak dost", "zablok", "ukryt", "wymagana zgoda", "3 z 10"].some((phrase) => text.includes(phrase)), "A6 caregiver copy leaks zero-knowledge language");
}

function validateSafetyGate() {
  const unsafe = a6.safeChecklistItem({
    id: "unsafe",
    projectionId: "projection:unsafe",
    category: "to_confirm",
    title: "Pilne zalecenie",
    description: "Skonsultuj natychmiast",
    status: "confirm",
    requiredArea: "report",
    sourceRefs: ["doc:d1"],
    linkedSurfaces: {}
  });
  assert(!unsafe.allowed, "A6 safety gate should block urgency/recommendation wording");
}

if (require.main === module) {
  try {
    validatePatientProjections();
    validateDeduplicationAndSourceGate();
    validateCaregiverZeroKnowledge();
    validateSafetyGate();
    console.log("A6 visit checklist validation passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  validatePatientProjections,
  validateDeduplicationAndSourceGate,
  validateCaregiverZeroKnowledge,
  validateSafetyGate
};
