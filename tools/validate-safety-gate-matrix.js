const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const FIXTURE_PATH = "fixtures/system-wide-red-team-cases.json";

const ALLOWED_GATES = new Set([
  "data_truth_gate",
  "projection_gate",
  "source_gate",
  "ditl_gate",
  "forbidden_output_gate",
  "consent_gate",
  "role_visibility_gate",
  "visual_neutrality_gate",
  "runtime_gate",
  "persistence_gate",
  "phase_boundary_gate",
  "commercial_claim_gate"
]);

const ALLOWED_PHASES = new Set([
  "phase1_context_secretariat",
  "phase2_high_risk",
  "system"
]);

const REQUIRED_OUTPUT_FLAGS = [
  "medicalDecision",
  "triage",
  "therapyRecommendation",
  "urgencyScoring",
  "autonomousExternalAction",
  "independentProjectionTruth"
];

const FORBIDDEN_SAFE_COPY_PATTERNS = [
  "diagnoza",
  "rozpoznanie",
  "zalecenie",
  "terapia",
  "pilne",
  "natychmiast",
  "triage",
  "w normie",
  "poza norma",
  "rekomendacja",
  "alert",
  "niebezpiecz",
  "alarm",
  "sor",
  "wykryto",
  "zastosuj plan"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(Object(value), key);
}

function validateSafeCopy(caseItem, pathLabel, errors) {
  if (!hasOwn(caseItem, "safeCopy") || typeof caseItem.safeCopy !== "string" || !caseItem.safeCopy.trim()) {
    errors.push(`${pathLabel}.safeCopy.missing`);
    return;
  }
  const text = normalizeText(caseItem.safeCopy);
  FORBIDDEN_SAFE_COPY_PATTERNS.forEach((pattern) => {
    if (text.includes(pattern)) errors.push(`${pathLabel}.safeCopy.forbidden:${pattern}`);
  });
}

function validateCase(caseItem, caseIndex, seenIds, errors) {
  const pathLabel = `cases.${caseIndex}`;

  if (!caseItem || typeof caseItem !== "object") {
    errors.push(`${pathLabel}.invalid`);
    return;
  }

  if (!caseItem.id) errors.push(`${pathLabel}.id.missing`);
  if (caseItem.id && seenIds.has(caseItem.id)) errors.push(`${pathLabel}.id.duplicate:${caseItem.id}`);
  seenIds.add(caseItem.id);

  if (!ALLOWED_GATES.has(caseItem.gateId)) errors.push(`${pathLabel}.gateId.invalid:${caseItem.gateId}`);
  if (!ALLOWED_PHASES.has(caseItem.phase)) errors.push(`${pathLabel}.phase.invalid:${caseItem.phase}`);
  if (caseItem.blockedExpected !== true) errors.push(`${pathLabel}.blockedExpected.mustBeTrue`);
  if (!caseItem.expectedBlockReason || typeof caseItem.expectedBlockReason !== "string") {
    errors.push(`${pathLabel}.expectedBlockReason.missing`);
  }
  if (!caseItem.input || typeof caseItem.input !== "object") errors.push(`${pathLabel}.input.missing`);
  if (caseItem.input && caseItem.input.syntheticOnly !== true) errors.push(`${pathLabel}.input.syntheticOnly.required`);

  validateSafeCopy(caseItem, pathLabel, errors);

  if (caseItem.gateId === "phase_boundary_gate") {
    const sprint = String(caseItem.input?.requestedSprint || "");
    if (!["A7", "A8"].includes(sprint)) errors.push(`${pathLabel}.phaseBoundary.requestedSprint.required`);
    if (!String(caseItem.expectedBlockReason || "").includes("phase_boundary")) {
      errors.push(`${pathLabel}.phaseBoundary.blockReason.required`);
    }
  }

  if (caseItem.gateId === "projection_gate") {
    const timelineEvent = caseItem.input?.timelineEvent;
    if (!timelineEvent || timelineEvent.independentClinicalMeaning !== true) {
      errors.push(`${pathLabel}.projection.attackShape.required`);
    }
  }

  if (caseItem.gateId === "source_gate") {
    const refs = asArray(caseItem.input?.sourceRefs);
    const sourceStatus = caseItem.input?.sourceStatus;
    if (refs.length || sourceStatus === "source_missing") {
      errors.push(`${pathLabel}.sourceGate.mustRepresentMissingSourceAttack`);
    }
  }

  if (caseItem.gateId === "runtime_gate") {
    if (caseItem.input?.requestedRuntimeLlmEnabled !== true) {
      errors.push(`${pathLabel}.runtimeGate.runtimeAttack.required`);
    }
  }
}

function validateSafetyGateFixture(fixture) {
  const errors = [];
  if (!fixture || typeof fixture !== "object") return { valid: false, errors: ["fixture.missing"] };

  if (fixture.id !== "system-wide-safety-gate-matrix-v1") errors.push("id.invalid");
  if (fixture.status !== "active_governance_fixture") errors.push("status.invalid");
  if (fixture.dataMode !== "synthetic_fixture_only") errors.push("dataMode.invalid");
  if (fixture.runtimeLlmEnabled !== false) errors.push("runtimeLlm.enabled");
  if (fixture.phasePolicy?.phase2Default !== "blocked_until_explicit_approval") {
    errors.push("phasePolicy.phase2Default.invalid");
  }

  REQUIRED_OUTPUT_FLAGS.forEach((flag) => {
    if (fixture.outputPolicy?.[flag] !== false) errors.push(`outputPolicy.${flag}.mustBeFalse`);
  });

  const requiredGates = new Set(asArray(fixture.requiredGates));
  ALLOWED_GATES.forEach((gateId) => {
    if (!requiredGates.has(gateId)) errors.push(`requiredGates.missing:${gateId}`);
  });
  requiredGates.forEach((gateId) => {
    if (!ALLOWED_GATES.has(gateId)) errors.push(`requiredGates.invalid:${gateId}`);
  });

  const cases = asArray(fixture.cases);
  if (cases.length < ALLOWED_GATES.size - 2) errors.push("cases.tooFew");

  const seenIds = new Set();
  const coveredGates = new Set();
  cases.forEach((caseItem, index) => {
    if (caseItem?.gateId) coveredGates.add(caseItem.gateId);
    validateCase(caseItem, index, seenIds, errors);
  });

  [
    "source_gate",
    "forbidden_output_gate",
    "consent_gate",
    "projection_gate",
    "visual_neutrality_gate",
    "runtime_gate",
    "persistence_gate",
    "phase_boundary_gate",
    "commercial_claim_gate"
  ].forEach((gateId) => {
    if (!coveredGates.has(gateId)) errors.push(`cases.coverage.missing:${gateId}`);
  });

  return { valid: errors.length === 0, errors };
}

function validatePositiveFixture() {
  const fixture = readJson(FIXTURE_PATH);
  const result = validateSafetyGateFixture(fixture);
  assert(result.valid, `Safety gate fixture invalid: ${result.errors.join("; ")}`);
}

function validateNegativeFixtures() {
  const base = readJson(FIXTURE_PATH);

  const runtime = clone(base);
  runtime.runtimeLlmEnabled = true;
  assert(!validateSafetyGateFixture(runtime).valid, "runtime LLM should fail safety gate validation");

  const missingReason = clone(base);
  delete missingReason.cases[0].expectedBlockReason;
  assert(!validateSafetyGateFixture(missingReason).valid, "missing expected block reason should fail");

  const unknownGate = clone(base);
  unknownGate.cases[0].gateId = "unknown_gate";
  assert(!validateSafetyGateFixture(unknownGate).valid, "unknown gate should fail");

  const unsafeCopy = clone(base);
  unsafeCopy.cases[0].safeCopy = "Pilne zalecenie dla pacjenta";
  assert(!validateSafetyGateFixture(unsafeCopy).valid, "unsafe safeCopy should fail");

  const phaseBoundary = clone(base);
  const boundaryCase = phaseBoundary.cases.find((entry) => entry.gateId === "phase_boundary_gate");
  boundaryCase.input.requestedSprint = "A3";
  assert(!validateSafetyGateFixture(phaseBoundary).valid, "phase boundary without A7/A8 attack should fail");

  const projection = clone(base);
  const projectionCase = projection.cases.find((entry) => entry.gateId === "projection_gate");
  projectionCase.input.timelineEvent.independentClinicalMeaning = false;
  assert(!validateSafetyGateFixture(projection).valid, "projection truth attack should be explicit");
}

if (require.main === module) {
  try {
    validatePositiveFixture();
    validateNegativeFixtures();
    console.log("Safety gate matrix validation passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  validateSafetyGateFixture,
  validatePositiveFixture,
  validateNegativeFixtures
};

