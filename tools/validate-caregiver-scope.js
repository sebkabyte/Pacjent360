const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const appPath = path.join(publicRoot, "app.js");
const edgeCasePath = path.join(root, "fixtures", "caregiver-scope-edgecases.json");
const caregiverModel = require(path.join(publicRoot, "patient360-caregiver-model.js"));
const demoData = require(path.join(publicRoot, "patient360-demo-data.js"));
const DEMO_VALIDATION_TODAY = process.env.P360_DEMO_TODAY || "2026-06-11";

const PATIENT_SCOPED_COLLECTION_KEYS = [
  "decisionContexts",
  "documents",
  "interviews",
  "timelineEvents",
  "timelineEpisodes",
  "timelineRelations",
  "conditions",
  "medications",
  "allergies",
  "observations",
  "flags",
  "knownUnknowns",
  "visitChecklists",
  "reports",
  "consents",
  "audit"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractObjectLiteral(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Marker not found: ${marker}`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`Object start not found after marker: ${marker}`);
  let depth = 0;
  let inString = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === inString) inString = null;
      continue;
    }
    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      inString = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart, i + 1);
    }
  }
  throw new Error(`Object end not found after marker: ${marker}`);
}

function readDemoState() {
  return demoData.buildDemoState({ today: DEMO_VALIDATION_TODAY });
}

function buildActivePatientState(sourceState, patient) {
  const state = clone(sourceState);
  state.activePatientId = patient.id;
  state.patients = [patient];
  state.search = "";
  PATIENT_SCOPED_COLLECTION_KEYS.forEach((key) => {
    state[key] = Array.isArray(sourceState[key])
      ? sourceState[key].filter((item) => item.patientId === patient.id)
      : [];
  });
  return state;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateModelForPatient(state, patient, expected = {}) {
  const activeState = buildActivePatientState(state, patient);
  const model = caregiverModel.buildCaregiverModel({ state: activeState, patientId: patient.id });
  const validation = caregiverModel.validateCaregiverModel(model);
  assert(validation.valid, `${patient.id} caregiver model invalid: ${validation.errors.join("; ")}`);
  assert(model.safetyCopy.includes("tylko zakres danych"), `${patient.id} safety copy should mention scoped access`);
  assert(model.safetyCopy.includes("nie diagnozuje"), `${patient.id} safety copy should reject diagnosis`);
  assert(model.safetyCopy.includes("nie tworzy zaleceń terapeutycznych"), `${patient.id} safety copy should reject therapy recommendations`);
  if (expected.activeScopes !== undefined) assert(model.activeScopes.length === expected.activeScopes, `${patient.id} active scope count mismatch`);
  if (expected.inactiveScopes !== undefined) assert(model.inactiveScopes.length === expected.inactiveScopes, `${patient.id} inactive scope count mismatch`);
  if (expected.taskCount !== undefined) assert(model.tasks.length === expected.taskCount, `${patient.id} task count mismatch: ${model.tasks.length}`);
  if (expected.activeAreas) {
    expected.activeAreas.forEach((area) => assert(model.activeAreas.includes(area), `${patient.id} missing active area ${area}`));
  }
  if (expected.deniedAreas) {
    expected.deniedAreas.forEach((area) => assert(!model.activeAreas.includes(area), `${patient.id} should not expose area ${area}`));
  }
  model.tasks.forEach((task) => {
    assert(task.sourceRefs.length, `${patient.id} task without sourceRefs: ${task.id}`);
    assert(task.area !== "results", `${patient.id} caregiver task should not expose results interpretation`);
  });
  return {
    patientId: patient.id,
    activeScopes: model.activeScopes.length,
    inactiveScopes: model.inactiveScopes.length,
    activeAreas: model.activeAreas.join(","),
    tasks: model.tasks.length,
    revocations: model.revocationEffects.length
  };
}

function validateDemoState() {
  const demoState = readDemoState();
  const p1 = (demoState.patients || []).find((patient) => patient.id === "p1");
  assert(p1, "Demo state should include p1");
  return [validateModelForPatient(demoState, p1, {
    activeScopes: 2,
    inactiveScopes: 1,
    activeAreas: ["medications", "documents", "report"],
    deniedAreas: ["visits", "results"],
    taskCount: 4
  })];
}

function validateEdgeCases() {
  const fixture = JSON.parse(fs.readFileSync(edgeCasePath, "utf8"));
  assert(fixture.fixtureVersion === 1, "Unsupported caregiver fixture version");
  const active = fixture.patients.find((patient) => patient.id === "caregiver-active");
  const none = fixture.patients.find((patient) => patient.id === "caregiver-none");
  assert(active && none, "Caregiver fixture should include active and none patients");
  return [
    validateModelForPatient(fixture, active, {
      activeScopes: 1,
      inactiveScopes: 1,
      activeAreas: ["medications"],
      deniedAreas: ["visits", "documents", "results"],
      taskCount: 2
    }),
    validateModelForPatient(fixture, none, {
      activeScopes: 0,
      inactiveScopes: 1,
      deniedAreas: ["medications", "visits", "documents", "results", "report"],
      taskCount: 0
    })
  ];
}

function main() {
  const summaries = [...validateDemoState(), ...validateEdgeCases()];
  summaries.forEach((summary) => {
    console.log(
      `${summary.patientId}: activeScopes=${summary.activeScopes}, inactiveScopes=${summary.inactiveScopes}, activeAreas=${summary.activeAreas || "-"}, tasks=${summary.tasks}, revocations=${summary.revocations}`
    );
  });
  console.log("Caregiver scope validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
