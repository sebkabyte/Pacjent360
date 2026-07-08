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

// S2-R9: jednostronicowy wydruk pakietu lekarza (print CSS statyczny check, bez backendowego PDF).
function validatePrintPacket() {
  const app = read("public/app.js");
  const css = read("public/styles.css");
  assert(app.includes('data-print-packet="true"'), "app.js should render a print-packet button");
  assert(app.includes("renderS2PrintSheet"), "app.js should render the one-page print sheet markup");
  assert(app.includes('data-s2-print-packet="true"'), "app.js should expose a browser-test sentinel for the print sheet");
  assert(/window\.print\(\)/.test(app), "print-packet button should call window.print()");
  assert(app.includes("p360-print-packet"), "app.js should toggle a print-scoped class on document.body");
  assert(
    app.includes("Materiał pomocniczy przygotowany przez pacjenta") && app.includes("nie zastępuje dokumentacji medycznej"),
    "print sheet footer should carry the mandatory non-substitute disclaimer"
  );
  const sectionOrder = [
    "1. Rozbieżności: dokument vs relacja",
    "2. Alergie",
    "3. Leki",
    "4. Sprawy wskazane przez pacjenta",
    "5. Pytania pacjenta do omówienia"
  ];
  const sectionIndexes = sectionOrder.map((label) => app.indexOf(label));
  sectionIndexes.forEach((index, position) => {
    assert(index > -1, `print sheet should include section heading containing "${sectionOrder[position]}"`);
  });
  for (let i = 1; i < sectionIndexes.length; i += 1) {
    assert(sectionIndexes[i] > sectionIndexes[i - 1], `print sheet sections out of order: expected ${sectionOrder.join(" -> ")}`);
  }
  assert(css.includes("@media print"), "styles.css should define @media print rules");
  assert(css.includes(".s2-print-sheet"), "styles.css should style .s2-print-sheet");
  assert(css.includes("p360-print-packet"), "styles.css should scope print visibility to the p360-print-packet body class");
  assert(/@page\s*\{[^}]*size:\s*A4/.test(css), "styles.css should set @page size: A4 for the one-page packet");
  console.log("Print packet CSS and markup present, sections ordered discrepancies -> allergies -> medications -> topMatters -> questions");
}

function validateUiContestCherryPicks() {
  const app = read("public/app.js");
  const css = read("public/styles.css");
  const brandComponents = read("public/brand/components.css");
  const prototype = read("public/patient360-s2-prototype.js");
  assert(prototype.includes("computeReadinessStatus"), "S2 prototype model should expose computeReadinessStatus");
  assert(prototype.includes("Masz wystarczajaco na jutro."), "S2 prototype should compute the readiness copy");
  assert(prototype.includes("photo-source-placeholder"), "S2 prototype should model disabled photo-as-source placeholder actions");
  assert(app.includes("s2-readiness-banner"), "app.js should render readiness banner");
  assert(app.includes("discrepancy-sidebyside"), "app.js should render side-by-side discrepancies");
  assert(app.includes("unknown-chip"), "app.js should render source_missing as UnknownChip");
  assert(app.includes("UI Layer Architecture"), "app.js should document the L1-L4 UI architecture");
  assert(css.includes(".s2-readiness-banner"), "styles.css should style readiness banner");
  assert(css.includes(".discrepancy-sidebyside"), "styles.css should style side-by-side discrepancies");
  assert(css.includes(".unknown-chip"), "styles.css should style UnknownChip");
  ["SourceChip", "RelationChip", "UnknownChip", "ConsentBadge", "AuditDot", "FieldVerifier"].forEach((name) => {
    assert(brandComponents.includes(name), `brand components should document ${name}`);
  });
  console.log("UI contest cherry-picks present: readiness, discrepancies, disabled photo placeholder, component aliases, UnknownChip, L1-L4 comment");
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
  validatePrintPacket();
  validateUiContestCherryPicks();
  console.log("S2 prototype validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
