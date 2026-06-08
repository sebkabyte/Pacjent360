const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const appPath = path.join(publicRoot, "app.js");
const edgeCasePath = path.join(root, "fixtures", "previsit-workflow-edgecases.json");
const preVisitModel = require(path.join(publicRoot, "patient360-previsit-model.js"));

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
  const source = fs.readFileSync(appPath, "utf8");
  const literal = extractObjectLiteral(source, "const demoState =");
  return vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 });
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

function countStepStates(model) {
  return model.steps.reduce((counts, step) => {
    counts[step.state.key] = (counts[step.state.key] || 0) + 1;
    return counts;
  }, {});
}

function validateModelForPatient(state, patient, expected = {}) {
  const activeState = buildActivePatientState(state, patient);
  const model = preVisitModel.buildPreVisitModel({ state: activeState, patientId: patient.id });
  const validation = preVisitModel.validatePreVisitModel(model);
  assert(validation.valid, `${patient.id} pre-visit model invalid: ${validation.errors.join("; ")}`);
  assert(model.steps.length === 6, `${patient.id} should have six pre-visit steps`);
  assert(model.safetyCopy.includes("Nie ocenia pilności"), `${patient.id} safety copy should reject urgency assessment`);
  assert(model.safetyCopy.includes("nie diagnozuje"), `${patient.id} safety copy should reject diagnosis`);
  assert(model.safetyCopy.includes("nie tworzy zaleceń terapeutycznych"), `${patient.id} safety copy should reject therapy recommendations`);
  if (expected.summary) {
    Object.entries(expected.summary).forEach(([key, value]) => {
      assert(model.checklistSummary[key] === value, `${patient.id} checklistSummary.${key}: ${model.checklistSummary[key]} !== ${value}`);
    });
  }
  if (expected.statusKey) {
    assert(model.checklistSummary.status.key === expected.statusKey, `${patient.id} status key mismatch`);
  }
  if (expected.hasAnyData !== undefined) {
    assert(model.emptyState.hasAnyData === expected.hasAnyData, `${patient.id} hasAnyData mismatch`);
  }
  if (expected.stepStates) {
    const counts = countStepStates(model);
    Object.entries(expected.stepStates).forEach(([key, value]) => {
      assert((counts[key] || 0) === value, `${patient.id} step state ${key}: ${counts[key] || 0} !== ${value}`);
    });
  }
  return {
    patientId: patient.id,
    steps: model.steps.length,
    status: model.checklistSummary.status.key,
    ready: model.checklistSummary.ready,
    confirm: model.checklistSummary.confirm,
    missing: model.checklistSummary.missing,
    hasAnyData: model.emptyState.hasAnyData
  };
}

function validateDemoState() {
  const demoState = readDemoState();
  const patients = demoState.patients || [];
  const summaries = patients.map((patient) => validateModelForPatient(demoState, patient));
  const p1 = summaries.find((summary) => summary.patientId === "p1");
  assert(p1.ready === 3 && p1.confirm === 2 && p1.missing === 1, "p1 checklist summary should remain 3/2/1");
  return summaries;
}

function validateEdgeCases() {
  const fixture = JSON.parse(fs.readFileSync(edgeCasePath, "utf8"));
  assert(fixture.fixtureVersion === 1, "Unsupported pre-visit fixture version");
  const empty = fixture.patients.find((patient) => patient.id === "previsit-empty");
  const ready = fixture.patients.find((patient) => patient.id === "previsit-ready");
  assert(empty && ready, "Pre-visit edge fixture should include empty and ready patients");
  const emptySummary = validateModelForPatient(fixture, empty, {
    summary: { total: 0, ready: 0, confirm: 0, missing: 0 },
    statusKey: "empty",
    hasAnyData: false,
    stepStates: { missing: 4, ready: 1, confirm: 1 }
  });
  const readySummary = validateModelForPatient(fixture, ready, {
    summary: { total: 3, ready: 3, confirm: 0, missing: 0 },
    statusKey: "ready",
    hasAnyData: true,
    stepStates: { ready: 6, confirm: 0, missing: 0 }
  });
  return [emptySummary, readySummary];
}

function main() {
  const demo = validateDemoState();
  const edge = validateEdgeCases();
  [...demo, ...edge].forEach((summary) => {
    console.log(
      `${summary.patientId}: ${summary.steps} steps, status=${summary.status}, ready=${summary.ready}, confirm=${summary.confirm}, missing=${summary.missing}, hasAnyData=${summary.hasAnyData}`
    );
  });
  console.log("Pre-visit workflow validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
