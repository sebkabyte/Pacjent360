const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const demoData = require(path.join(root, "public", "patient360-demo-data.js"));
const flags = require(path.join(root, "public", "patient360-flags.js"));
const s2Prototype = require(path.join(root, "public", "patient360-s2-prototype.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

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

function validateDemoWiring() {
  const demo = read("public/demo.html");
  const app = read("public/app.js");
  const prototypeIndex = demo.indexOf("patient360-s2-prototype.js");
  const flagsIndex = demo.indexOf("patient360-flags.js");
  const appIndex = demo.indexOf("app.js");
  assert(prototypeIndex > -1, "demo.html should load patient360-s2-prototype.js");
  assert(flagsIndex > -1 && flagsIndex < prototypeIndex, "demo.html should load flags before S2 prototype");
  assert(prototypeIndex < appIndex, "demo.html should load S2 prototype before app.js");
  assert(demo.includes('data-view="s2Prototype"'), "demo.html should expose S2 prototype navigation");
  assert(app.includes("PATIENT360_S2_PROTOTYPE"), "app.js should require S2 prototype global");
  assert(app.includes("renderS2Prototype"), "app.js should render S2 prototype view");
  assert(app.includes("data-s2-prototype"), "S2 prototype UI should expose browser-test sentinels");
  assert(!app.includes('data-open-dialog="s2Prototype"'), "S2 prototype must not wire write dialogs");
}

function validatePositive(edgecases) {
  for (const variant of edgecases.validVariants || ["A", "B", "C"]) {
    for (const patientId of ["p1", "p2", "p3"]) {
      const bundle = buildBundle(variant, patientId);
      const result = s2Prototype.validateS2PrototypeBundle(bundle);
      assert(result.valid, `${variant}/${patientId}: expected valid bundle, got ${result.errors.join("; ")}`);
      assert(bundle.doctor.readOnly === true, `${variant}/${patientId}: doctor view must be read-only`);
      assert(bundle.doctor.allowedActions.every((action) => !/(edit|save|update|delete|write)/i.test(action)), `${variant}/${patientId}: doctor write action leaked`);
      assert(bundle.flow.steps.map((step) => step.id).join("|") === s2Prototype.FLOW_STEP_IDS.join("|"), `${variant}/${patientId}: flow steps drift`);
      console.log(`${variant}/${patientId}: valid S2 prototype`);
    }
  }
}

function validateNegative(edgecases) {
  const base = buildBundle("B", "p1");
  (edgecases.negativeCases || []).forEach((testCase) => {
    const result = s2Prototype.validateS2PrototypeBundle(mutate(base, testCase.mutate));
    assert(!result.valid, `${testCase.id}: expected invalid`);
    assert(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
    console.log(`${testCase.id}: rejected errors=${result.errors.join(",")}`);
  });
}

function main() {
  const edgecases = readJson("fixtures/s2-prototype-edgecases.json");
  validateDemoWiring();
  validatePositive(edgecases);
  validateNegative(edgecases);
  console.log("S2 prototype validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
