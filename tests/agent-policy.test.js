const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const agentPolicy = require("../public/patient360-agent-policy.js");
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "fixtures", "a0-agent-policy-edgecases.json"), "utf8"));

test("A0 fixture covers every safe and caution agent policy", () => {
  const result = agentPolicy.validateA0Fixture(fixture);
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(fixture.agentPolicies.length, agentPolicy.A0_AGENT_TYPES.length);
  assert.deepEqual(
    fixture.agentPolicies.map((policy) => policy.agentType).sort(),
    [...agentPolicy.A0_AGENT_TYPES].sort()
  );
});

test("AgentPolicy blocks forbidden outputs from allowed output sets", () => {
  const policy = {
    ...fixture.agentPolicies[0],
    allowedOutputs: [...fixture.agentPolicies[0].allowedOutputs, "therapy_recommendation"]
  };
  const result = agentPolicy.validateAgentPolicy(policy);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("allowedOutputs.invalid:therapy_recommendation") || error.includes("allowedOutputs.forbidden:therapy_recommendation")));
});

test("After Visit Loop contracts require source refs and DITL status", () => {
  const bundle = JSON.parse(JSON.stringify(fixture.afterVisitBundle));
  bundle.careTasks[0].sourceRefs = [];
  bundle.careTasks[0].ditlStatus = "";
  const result = agentPolicy.validateAfterVisitBundle(bundle);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("sourceRefs.missing")));
  assert.ok(result.errors.some((error) => error.includes("ditlStatus.invalid")));
});
