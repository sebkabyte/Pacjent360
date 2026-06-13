const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const appPath = path.join(publicRoot, "app.js");
const snapshotPath = path.join(root, "fixtures", "patient-map-model.snapshot.json");
const edgeCasePath = path.join(root, "fixtures", "patient-map-model-edgecases.json");
const contract = require(path.join(publicRoot, "patient360-contract.js"));
const mapModel = require(path.join(publicRoot, "patient360-map-model.js"));
const demoData = require(path.join(publicRoot, "patient360-demo-data.js"));
const DEMO_VALIDATION_TODAY = process.env.P360_DEMO_TODAY || "2026-06-11";

const TIMELINE_PERIODS = [
  { id: "episode", label: "Epizod" },
  { id: "year", label: "12 mies." },
  { id: "life", label: "Od urodzenia" }
];

const TIMELINE_DETAILS = [
  { id: "overview", label: "Ogól" },
  { id: "standard", label: "Standard" },
  { id: "detail", label: "Szczegóły" }
];

const TIMELINE_ZOOM = {
  min: 0.4,
  max: 1.55,
  step: 0.1,
  fit: 0.42
};

const PATIENT_SCOPED_COLLECTION_KEYS = [
  "decisionContexts",
  "documents",
  "interviews",
  "roleNarratives",
  "roleGoals",
  "roleVisibleSections",
  "timelineEvents",
  "timelineEpisodes",
  "timelineRelations",
  "stageSummaries",
  "conditions",
  "medications",
  "allergies",
  "observations",
  "flags",
  "knownUnknowns",
  "visitChecklists",
  "reports",
  "consents",
  "careContracts",
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
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
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

function buildActivePatientState(demoState, patient) {
  const exportState = clone(demoState);
  exportState.activePatientId = patient.id;
  exportState.patients = [patient];
  exportState.selectedSourceRef = null;
  exportState.selectedTimelineEventId = null;
  exportState.search = "";
  PATIENT_SCOPED_COLLECTION_KEYS.forEach((key) => {
    exportState[key] = Array.isArray(demoState[key])
      ? demoState[key].filter((item) => item.patientId === patient.id)
      : [];
  });
  return exportState;
}

function buildEdgeCaseState(fixture, patientId, options = {}) {
  const state = clone(fixture);
  state.activePatientId = patientId;
  state.patients = (fixture.patients || []).filter((patient) => patient.id === patientId);
  PATIENT_SCOPED_COLLECTION_KEYS.forEach((key) => {
    state[key] = Array.isArray(fixture[key])
      ? fixture[key].filter((item) => item.patientId === patientId)
      : [];
  });
  if (!options.includeInvalidCausality) {
    state.timelineRelations = state.timelineRelations.filter((relation) => relation.causality !== "asserted");
  }
  state.search = "";
  state.selectedTimelineEventId = options.selectedTimelineEventId || "";
  return state;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildModel(state, overrides = {}) {
  return mapModel.buildPatientMapModel({
    state,
    patientId: state.activePatientId,
    periodId: overrides.periodId || "episode",
    detailId: overrides.detailId || "standard",
    zoom: overrides.zoom ?? 0.9,
    selectedEventId: overrides.selectedEventId || state.selectedTimelineEventId,
    trackFilter: overrides.trackFilter || null,
    searchQuery: overrides.searchQuery || "",
    today: DEMO_VALIDATION_TODAY,
    persona: overrides.persona || "doctor",
    embedded: Boolean(overrides.embedded),
    periods: TIMELINE_PERIODS,
    details: TIMELINE_DETAILS,
    zoomConfig: TIMELINE_ZOOM
  });
}

function eventIds(model) {
  return model.events.map((event) => event.id).join("|");
}

function toSnapshotShape(episodeModel, lifeModel, filteredModel) {
  return {
    episode: {
      rangeStart: episodeModel.range.start,
      rangeEnd: episodeModel.range.end,
      eventIds: episodeModel.events.map((event) => event.id),
      eventTracks: episodeModel.events.map((event) => event.track),
      selectedId: episodeModel.selectedId,
      activeTracks: episodeModel.activeTracks.map((item) => ({ track: item.track, count: item.count })),
      hiddenTracks: episodeModel.hiddenTracks,
      sourceMissingCount: episodeModel.sourceQuality.sourceMissingCount,
      todayColumn: episodeModel.todayColumn
    },
    life: {
      eventIds: lifeModel.events.map((event) => event.id),
      virtualIds: lifeModel.events.filter((event) => event.virtual).map((event) => event.id)
    },
    filteredTrack: filteredModel
      ? {
          track: filteredModel.trackFilter,
          eventIds: filteredModel.events.map((event) => event.id),
          virtualIds: filteredModel.events.filter((event) => event.virtual).map((event) => event.id)
        }
      : null
  };
}

function assertSnapshot(actual, expected, label) {
  const actualJson = JSON.stringify(actual, null, 2);
  const expectedJson = JSON.stringify(expected, null, 2);
  assert(actualJson === expectedJson, `${label} snapshot mismatch\nExpected:\n${expectedJson}\nActual:\n${actualJson}`);
}

function validateForPatient(demoState, patient, expectedSnapshot) {
  const activeState = buildActivePatientState(demoState, patient);
  const episodeModel = buildModel(activeState, { periodId: "episode" });
  const episodeValidation = mapModel.validatePatientMapModel(episodeModel);
  assert(episodeValidation.valid, `${patient.id} episode model invalid: ${episodeValidation.errors.join("; ")}`);
  assert(episodeModel.events.length > 0, `${patient.id} should have visible map events`);
  assert(episodeModel.events.every((event) => event.virtual || event.patientId === patient.id), `${patient.id} event patientId mismatch`);
  assert(episodeModel.layers.length === contract.TIMELINE_TRACKS.length, `${patient.id} layer count mismatch`);
  assert(episodeModel.relationsByEventId, `${patient.id} relationsByEventId missing`);
  Object.values(episodeModel.relationsByEventId).flat().forEach((relation) => {
    assert(relation.causality === "not_asserted", `${patient.id} relation asserts causality: ${relation.id}`);
  });

  const patientModel = buildModel(activeState, { periodId: "episode", persona: "patient" });
  assert(eventIds(patientModel) === eventIds(episodeModel), `${patient.id} doctor/patient event history diverged`);

  const lifeModel = buildModel(activeState, { periodId: "life" });
  const lifeValidation = mapModel.validatePatientMapModel(lifeModel);
  assert(lifeValidation.valid, `${patient.id} life model invalid: ${lifeValidation.errors.join("; ")}`);
  assert(lifeModel.events.some((event) => event.id === "anchor-birth" && event.virtual), `${patient.id} life model missing birth anchor`);
  assert(lifeModel.events.some((event) => event.id === "anchor-now" && event.virtual), `${patient.id} life model missing now anchor`);

  const activeTrack = episodeModel.activeTracks[0]?.track;
  let trackModel = null;
  if (activeTrack) {
    trackModel = buildModel(activeState, { periodId: "life", trackFilter: activeTrack });
    const trackValidation = mapModel.validatePatientMapModel(trackModel);
    assert(trackValidation.valid, `${patient.id} track model invalid: ${trackValidation.errors.join("; ")}`);
    assert(trackModel.events.every((event) => !event.virtual), `${patient.id} track filtered model should not include virtual anchors`);
    assert(trackModel.events.every((event) => event.track === activeTrack), `${patient.id} track filter leaked another track`);
  }

  if (expectedSnapshot) {
    assertSnapshot(toSnapshotShape(episodeModel, lifeModel, trackModel), expectedSnapshot, patient.id);
  }

  return {
    patientId: patient.id,
    events: episodeModel.events.length,
    clinicalEvents: episodeModel.clinicalEvents.length,
    layers: episodeModel.activeTracks.length,
    sourceMissing: episodeModel.sourceQuality.sourceMissingCount,
    warnings: episodeValidation.warnings.length + lifeValidation.warnings.length
  };
}

function validateEdgeCases() {
  const fixture = JSON.parse(fs.readFileSync(edgeCasePath, "utf8"));
  assert(fixture.fixtureVersion === 1, "Unsupported patient map edge fixture version");

  const emptyState = buildEdgeCaseState(fixture, "edge-empty");
  const emptyModel = buildModel(emptyState, { periodId: "episode", selectedEventId: "missing-event" });
  const emptyValidation = mapModel.validatePatientMapModel(emptyModel);
  assert(emptyValidation.valid, `empty edge model invalid: ${emptyValidation.errors.join("; ")}`);
  assert(emptyModel.events.length === 0, "empty edge model should have no events");
  assert(!emptyModel.selectedId, "empty edge model should not select an event");

  const edgeState = buildEdgeCaseState(fixture, "edge-map", { selectedTimelineEventId: "missing-event" });
  const edgeModel = buildModel(edgeState, { periodId: "episode", selectedEventId: "missing-event" });
  const edgeValidation = mapModel.validatePatientMapModel(edgeModel);
  assert(edgeValidation.valid, `edge model invalid: ${edgeValidation.errors.join("; ")}`);
  assert(edgeValidation.warnings.some((warning) => warning.includes("source_missing")), "edge model should warn about source_missing");
  assert(edgeModel.selectedId === "edge-e1", "missing selectedEventId should fall back to first non-virtual event");
  assert(edgeModel.sourceQuality.sourceMissingCount === 1, "edge model should count one source_missing event");
  assert(edgeModel.quality.hasPlannedEvents, "edge model should expose planned events");
  assert(edgeModel.events.find((event) => event.id === "edge-e2")?.future, "planned future event should be marked as future");
  assert((edgeModel.questionsByEventId["edge-e1"] || []).length === 1, "edge source_missing event should carry linked flag question");
  assert((edgeModel.questionsByEventId["edge-e2"] || []).length === 1, "edge planned event should carry linked DITL question");
  assert((edgeModel.relationsByEventId["edge-e1"] || []).some((relation) => relation.id === "edge-r1"), "edge model should expose neutral relation");

  const filteredLifeModel = buildModel(edgeState, { periodId: "life", trackFilter: "badania" });
  assert(filteredLifeModel.events.length === 1, "filtered edge life model should keep one badania event");
  assert(filteredLifeModel.events.every((event) => !event.virtual), "filtered edge life model should not include virtual anchors");

  const invalidState = buildEdgeCaseState(fixture, "edge-map", { includeInvalidCausality: true });
  const invalidModel = buildModel(invalidState, { periodId: "episode" });
  const invalidValidation = mapModel.validatePatientMapModel(invalidModel);
  assert(!invalidValidation.valid, "invalid causality relation should fail validation");
  assert(
    invalidValidation.errors.some((error) => error.includes("relation asserts causality")),
    "invalid causality relation should explain the failure"
  );
}

function main() {
  const demoState = readDemoState();
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  assert(snapshot.snapshotVersion === 1, "Unsupported patient map snapshot version");
  assert(snapshot.today === DEMO_VALIDATION_TODAY, "Snapshot today should match validator deterministic date");
  const patients = demoState.patients || [];
  assert(patients.length > 0, "No patients in demo state");
  const summaries = patients.map((patient) => validateForPatient(demoState, patient, snapshot.patients?.[patient.id]));
  const snapshotPatientIds = Object.keys(snapshot.patients || {}).sort().join("|");
  const demoPatientIds = patients.map((patient) => patient.id).sort().join("|");
  assert(snapshotPatientIds === demoPatientIds, `Snapshot patients mismatch: ${snapshotPatientIds} vs ${demoPatientIds}`);
  validateEdgeCases();
  summaries.forEach((summary) => {
    console.log(
      `${summary.patientId}: ${summary.events} display events, ${summary.clinicalEvents} clinical events, ${summary.layers} layers, ${summary.sourceMissing} source_missing`
    );
  });
  console.log("Patient map edge cases validation passed");
  console.log("Patient map model validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
