const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

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

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(root, "fixtures", name), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scopedState(sourceState, patientId, options = {}) {
  const state = clone(sourceState);
  state.activePatientId = patientId;
  state.patients = (sourceState.patients || []).filter((patient) => patient.id === patientId);
  PATIENT_SCOPED_COLLECTION_KEYS.forEach((key) => {
    state[key] = Array.isArray(sourceState[key])
      ? sourceState[key].filter((item) => item.patientId === patientId)
      : [];
  });
  if (!options.includeInvalidCausality && Array.isArray(state.timelineRelations)) {
    state.timelineRelations = state.timelineRelations.filter((relation) => relation.causality !== "asserted");
  }
  state.search = "";
  return state;
}

module.exports = {
  root,
  readFixture,
  clone,
  scopedState
};
