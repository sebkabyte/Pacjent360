const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const agentPolicy = require(path.join(root, "public", "patient360-agent-policy.js"));

const FIXTURE_PATH = "fixtures/a1-safe-draft-dashboard.snapshot.json";
const ALLOWED_STATUSES = new Set(["draft", "needs_review", "source_missing"]);
const ALLOWED_DITL_STATUSES = new Set(["do wyjasnienia", "wyjasnione", "odrzucone", "dalsza kontrola"]);
const ALLOWED_SORTS = new Set(["chronological", "alphabetical"]);
const ALLOWED_SURFACES = new Set(["feed", "inspector"]);
const REQUIRED_ROLES = new Set(["patient", "caregiver", "doctor"]);
const REQUIRED_BLOCKED_ICONS = ["alert", "warning", "exclamation", "medical-cross", "heart", "siren"];
const INSPECTOR_ONLY_TYPES = new Set(["ditl_question", "missing_data", "discrepancy"]);
const FORBIDDEN_COPY_PATTERNS = [
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
  "zastosuj plan",
  "sor",
  "wykryto",
  "blad w",
  "potwierdz poprawne",
  "podsumowanie zdrowia",
  "twoje zadania do wykonania",
  "zostaw jako luke",
  "gotowosc wizyty"
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

function collectRenderableText(value, texts = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectRenderableText(entry, texts));
    return texts;
  }
  if (!value || typeof value !== "object") return texts;

  Object.entries(value).forEach(([key, entry]) => {
    if (["title", "label", "banner", "description", "primaryAction", "emptyState", "demoLabel", "draftLabel", "reviewLabel", "sourceMissingLabel"].includes(key)) {
      texts.push(entry);
      return;
    }
    if (typeof entry === "object") collectRenderableText(entry, texts);
  });
  return texts;
}

function validateCopySafety(fixture, errors) {
  const text = normalizeText(collectRenderableText(fixture).join(" "));
  FORBIDDEN_COPY_PATTERNS.forEach((pattern) => {
    if (text.includes(pattern)) errors.push(`copy.forbidden:${pattern}`);
  });
}

function validateCards(fixture, errors) {
  const agentTypes = new Set(agentPolicy.A0_AGENT_TYPES);
  const allowedIconIds = new Set(asArray(fixture.visualPolicy?.allowedIconIds));
  const blockedIconIds = new Set(asArray(fixture.visualPolicy?.blockedIconIds));
  const feedAllowedTypes = new Set(asArray(fixture.displayPolicy?.mainFeedAllowedCardTypes));
  const roles = new Set();
  const cardIds = new Set();

  asArray(fixture.scenarios).forEach((scenario, scenarioIndex) => {
    if (scenario.synthetic !== true) errors.push(`scenarios.${scenarioIndex}.synthetic.required`);
    const sourceIds = new Set(asArray(scenario.sources).map((source) => source.id));

    asArray(scenario.roleViews).forEach((view, viewIndex) => {
      roles.add(view.role);
      if (!ALLOWED_SORTS.has(view.sortMode)) errors.push(`scenarios.${scenarioIndex}.roleViews.${viewIndex}.sortMode.invalid`);
      if (view.role === "caregiver" && asArray(view.hiddenAreas).some((area) => String(area).toLowerCase().includes("psy"))) {
        errors.push(`scenarios.${scenarioIndex}.roleViews.${viewIndex}.hiddenAreas.leaky`);
      }

      let lastDate = "";
      asArray(view.cards).forEach((card, cardIndex) => {
        const pathLabel = `scenarios.${scenarioIndex}.roleViews.${viewIndex}.cards.${cardIndex}`;
        if (!card.id) errors.push(`${pathLabel}.id.missing`);
        if (cardIds.has(card.id)) errors.push(`${pathLabel}.id.duplicate`);
        cardIds.add(card.id);
        if (!card.date) errors.push(`${pathLabel}.date.missing`);
        if (!ALLOWED_SURFACES.has(card.surface)) errors.push(`${pathLabel}.surface.invalid`);
        if (card.surface === "feed" && !feedAllowedTypes.has(card.type)) errors.push(`${pathLabel}.surface.feedTypeNotAllowed:${card.type}`);
        if (INSPECTOR_ONLY_TYPES.has(card.type) && card.surface !== "inspector") errors.push(`${pathLabel}.surface.mustUseInspector`);
        if (!card.iconId) errors.push(`${pathLabel}.iconId.missing`);
        if (card.iconId && !allowedIconIds.has(card.iconId)) errors.push(`${pathLabel}.iconId.notAllowed:${card.iconId}`);
        if (card.iconId && blockedIconIds.has(card.iconId)) errors.push(`${pathLabel}.iconId.blocked:${card.iconId}`);
        if (view.sortMode === "chronological" && lastDate && String(card.date) < lastDate) {
          errors.push(`${pathLabel}.date.notChronological`);
        }
        lastDate = String(card.date || lastDate);
        if (!agentTypes.has(card.agentType)) errors.push(`${pathLabel}.agentType.invalid`);
        if (!card.policyRef) errors.push(`${pathLabel}.policyRef.missing`);
        if (!ALLOWED_STATUSES.has(card.status)) errors.push(`${pathLabel}.status.invalid`);
        if (!ALLOWED_DITL_STATUSES.has(card.ditlStatus)) errors.push(`${pathLabel}.ditlStatus.invalid`);

        const refs = asArray(card.sourceRefs);
        const hasMissing = card.sourceStatus === agentPolicy.SOURCE_MISSING_REF;
        if (!refs.length && !hasMissing) errors.push(`${pathLabel}.source.missing`);
        refs.forEach((ref) => {
          if (!sourceIds.has(ref)) errors.push(`${pathLabel}.source.unknown:${ref}`);
        });
      });
    });
  });

  REQUIRED_ROLES.forEach((role) => {
    if (!roles.has(role)) errors.push(`role.missing:${role}`);
  });
}

function validateA1Fixture(fixture) {
  const errors = [];
  if (!fixture || typeof fixture !== "object") return { valid: false, errors: ["fixture.missing"] };
  if (fixture.sprint !== "A1") errors.push("sprint.invalid");
  if (fixture.status !== "pending_kickoff") errors.push("status.mustRemainPendingKickoff");
  if (fixture.dataMode !== "synthetic_fixture_only") errors.push("dataMode.invalid");
  if (fixture.runtimeLlmEnabled !== false) errors.push("runtimeLlm.enabled");
  if (fixture.persistence?.indexedDbWrites !== false) errors.push("persistence.indexedDbWrites.enabled");
  if (fixture.persistence?.localStorageWrites !== false) errors.push("persistence.localStorageWrites.enabled");
  if (fixture.persistence?.networkWrites !== false) errors.push("persistence.networkWrites.enabled");
  if (fixture.interactionPolicy?.userMedicalInputEnabled !== false) errors.push("userMedicalInput.enabled");
  if (fixture.interactionPolicy?.defaultSort !== "chronological") errors.push("defaultSort.notChronological");
  if (fixture.displayPolicy?.exposeAgentTypeLabels !== false) errors.push("displayPolicy.exposeAgentTypeLabels.enabled");
  if (fixture.displayPolicy?.assistantOutputsSurface !== "inspector") errors.push("displayPolicy.assistantOutputsSurface.invalid");
  if (fixture.displayPolicy?.progressMetricsEnabled !== false) errors.push("displayPolicy.progressMetrics.enabled");
  if (fixture.displayPolicy?.stickyContextDisclaimerRequired !== true) errors.push("displayPolicy.stickyContextDisclaimerRequired.missing");
  if (fixture.displayPolicy?.sourceQuotesRequired !== true) errors.push("displayPolicy.sourceQuotesRequired.missing");

  asArray(fixture.interactionPolicy?.allowedSorts).forEach((sort) => {
    if (!ALLOWED_SORTS.has(sort)) errors.push(`allowedSort.invalid:${sort}`);
  });
  ["red", "green"].forEach((color) => {
    if (!asArray(fixture.visualPolicy?.blockedSemanticColors).includes(color)) errors.push(`visualPolicy.blockedColor.missing:${color}`);
  });
  REQUIRED_BLOCKED_ICONS.forEach((iconId) => {
    if (!asArray(fixture.visualPolicy?.blockedIconIds).includes(iconId)) errors.push(`visualPolicy.blockedIcon.missing:${iconId}`);
  });

  validateCards(fixture, errors);
  validateCopySafety(fixture, errors);
  return { valid: errors.length === 0, errors };
}

function validatePositiveFixture() {
  const fixture = readJson(FIXTURE_PATH);
  const result = validateA1Fixture(fixture);
  assert(result.valid, `A1 fixture invalid: ${result.errors.join("; ")}`);
}

function validateNegativeFixtures() {
  const base = readJson(FIXTURE_PATH);

  const runtime = clone(base);
  runtime.runtimeLlmEnabled = true;
  assert(!validateA1Fixture(runtime).valid, "runtime LLM should fail A1 fixture validation");

  const unsafeCopy = clone(base);
  unsafeCopy.scenarios[0].roleViews[0].cards[0].title = "Pilne zalecenie";
  assert(!validateA1Fixture(unsafeCopy).valid, "forbidden user-visible copy should fail");

  const missingSource = clone(base);
  delete missingSource.scenarios[0].roleViews[0].cards[0].sourceRefs;
  assert(!validateA1Fixture(missingSource).valid, "card without sourceRefs or source_missing should fail");

  const unsafeSort = clone(base);
  unsafeSort.scenarios[0].roleViews[0].sortMode = "urgency";
  assert(!validateA1Fixture(unsafeSort).valid, "urgency-like sorting should fail");

  const persistence = clone(base);
  persistence.persistence.localStorageWrites = true;
  assert(!validateA1Fixture(persistence).valid, "localStorage writes should fail");

  const unsafeSurface = clone(base);
  unsafeSurface.scenarios[0].roleViews[0].cards[1].surface = "feed";
  assert(!validateA1Fixture(unsafeSurface).valid, "DITL questions in main feed should fail");

  const unsafeIcon = clone(base);
  unsafeIcon.scenarios[0].roleViews[0].cards[0].iconId = "warning";
  assert(!validateA1Fixture(unsafeIcon).valid, "warning icon should fail");

  const exposedAgentNames = clone(base);
  exposedAgentNames.displayPolicy.exposeAgentTypeLabels = true;
  assert(!validateA1Fixture(exposedAgentNames).valid, "exposed agent type labels should fail");
}

if (require.main === module) {
  try {
    validatePositiveFixture();
    validateNegativeFixtures();
    console.log("A1 safe draft dashboard validation passed");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  validateA1Fixture,
  validatePositiveFixture,
  validateNegativeFixtures
};
