const test = require("node:test");
const assert = require("node:assert/strict");
const { readFixture } = require("./helpers.js");
const demoData = require("../public/patient360-demo-data.js");
const flags = require("../public/patient360-flags.js");
const s2Prototype = require("../public/patient360-s2-prototype.js");

function buildBundle(variant = "B", patientId = "p1") {
  const state = demoData.buildDemoState({ today: "2026-07-02" });
  state.activePatientId = patientId;
  return s2Prototype.buildS2PrototypeBundle({
    state,
    patientId,
    activeVariant: variant,
    flags
  });
}

function mutate(bundle, mutation) {
  const next = s2Prototype.clone(bundle);
  if (mutation === "doctorWriteAction") {
    next.doctor.allowedActions.push("edit_patient_data");
  } else if (mutation === "doctorAuditFailedVisible") {
    next.doctor.auditWriteStatus = "failed_blocked";
    next.doctor.dataVisible = true;
  } else if (mutation === "removeDocumentDrawer") {
    next.doctor.sections = next.doctor.sections.filter((section) => section.id !== "documentDrawer");
  } else if (mutation === "removeConsentStep") {
    next.flow.steps = next.flow.steps.filter((step) => step.id !== "consent");
  } else if (mutation === "removeProfileSources") {
    next.flow.steps.find((step) => step.id === "profile").sourceRefs = [];
  } else if (mutation === "openBackendGate") {
    next.gates.backendOpen = true;
  } else {
    throw new Error(`Unknown mutation: ${mutation}`);
  }
  return next;
}

test("S2 prototype bundle is valid for A/B/C variants and stays core-only", () => {
  for (const variant of ["A", "B", "C"]) {
    const bundle = buildBundle(variant, "p1");
    const validation = s2Prototype.validateS2PrototypeBundle(bundle);
    assert.equal(validation.valid, true, validation.errors.join("; "));
    assert.equal(bundle.activeVariant, variant);
    assert.equal(bundle.doctor.readOnly, true);
    assert.equal(bundle.doctor.auditBeforeRead, true);
    assert.equal(bundle.gates.backendOpen, false);
    assert.equal(bundle.gates.aiRuntimeOpen, false);
    assert.equal(bundle.gates.usesRealPatientData, false);
    assert.deepEqual(bundle.flow.steps.map((step) => step.id), s2Prototype.FLOW_STEP_IDS);
    assert.deepEqual(bundle.doctor.sections.map((section) => section.id), s2Prototype.DOCTOR_SECTION_IDS);
  }
});

test("S2 prototype covers doctor packet and patient/caregiver clickable views", () => {
  const bundle = buildBundle("B", "p3");
  const doctorViews = new Set(bundle.doctor.sections.map((section) => section.id));
  const flowViews = new Set(bundle.flow.steps.map((step) => step.view));
  assert.equal(doctorViews.has("packet90s"), true);
  assert.equal(doctorViews.has("documentDrawer"), true);
  ["patientPortal", "visitChecklist", "documents", "medications", "risks", "consent", "s2Prototype"].forEach((view) => {
    assert.equal(flowViews.has(view), true, `missing view ${view}`);
  });
  assert.equal(bundle.flow.caregiver.zeroKnowledgeWhenNoConsent, false);
});

test("S2 prototype rejects unsafe or incomplete prototype mutations", () => {
  const edgecases = readFixture("s2-prototype-edgecases.json");
  const base = buildBundle("B", "p1");
  for (const testCase of edgecases.negativeCases) {
    const result = s2Prototype.validateS2PrototypeBundle(mutate(base, testCase.mutate));
    assert.equal(result.valid, false, `${testCase.id}: expected invalid`);
    assert.ok(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
  }
});
