const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const validator = require("../tools/validate-a1-safe-draft-dashboard.js");
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "fixtures", "a1-safe-draft-dashboard.snapshot.json"), "utf8"));

test("A1 safe draft dashboard stays pending kickoff and fixture-only", () => {
  const result = validator.validateA1Fixture(fixture);
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(fixture.status, "pending_kickoff");
  assert.equal(fixture.runtimeLlmEnabled, false);
  assert.equal(fixture.interactionPolicy.userMedicalInputEnabled, false);
});

test("A1 cards require source coverage, status and DITL status", () => {
  const copy = JSON.parse(JSON.stringify(fixture));
  delete copy.scenarios[0].roleViews[0].cards[0].sourceRefs;
  copy.scenarios[0].roleViews[0].cards[1].status = "";
  copy.scenarios[0].roleViews[0].cards[2].ditlStatus = "";
  const result = validator.validateA1Fixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("source.missing")));
  assert.ok(result.errors.some((error) => error.includes("status.invalid")));
  assert.ok(result.errors.some((error) => error.includes("ditlStatus.invalid")));
});

test("A1 validation blocks runtime LLM, persistence and unsafe sorting", () => {
  const copy = JSON.parse(JSON.stringify(fixture));
  copy.runtimeLlmEnabled = true;
  copy.persistence.indexedDbWrites = true;
  copy.scenarios[0].roleViews[0].sortMode = "urgency";
  const result = validator.validateA1Fixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("runtimeLlm.enabled")));
  assert.ok(result.errors.some((error) => error.includes("indexedDbWrites")));
  assert.ok(result.errors.some((error) => error.includes("sortMode.invalid")));
});

test("A1 validation keeps generated items out of the main feed", () => {
  const copy = JSON.parse(JSON.stringify(fixture));
  copy.scenarios[0].roleViews[0].cards[1].surface = "feed";
  const result = validator.validateA1Fixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("surface.mustUseInspector")));
});

test("A1 validation blocks unsafe icons and exposed agent labels", () => {
  const copy = JSON.parse(JSON.stringify(fixture));
  copy.displayPolicy.exposeAgentTypeLabels = true;
  copy.scenarios[0].roleViews[0].cards[0].iconId = "warning";
  const result = validator.validateA1Fixture(copy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("exposeAgentTypeLabels.enabled")));
  assert.ok(result.errors.some((error) => error.includes("iconId.notAllowed") || error.includes("iconId.blocked")));
});
