const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const agentPolicy = require(path.join(root, "public", "patient360-agent-policy.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validatePositiveFixture() {
  const fixture = readJson("fixtures/a0-agent-policy-edgecases.json");
  const result = agentPolicy.validateA0Fixture(fixture);
  assert(result.valid, `A0 fixture invalid: ${result.errors.join("; ")}`);
  assert(fixture.agentPolicies.length === agentPolicy.A0_AGENT_TYPES.length, "A0 fixture must cover every active A0 agent");
  fixture.agentPolicies.forEach((policy) => {
    agentPolicy.FORBIDDEN_OUTPUT_TYPES.forEach((output) => {
      assert(policy.forbiddenOutputs.includes(output), `${policy.agentType}: missing forbidden output ${output}`);
      assert(!policy.allowedOutputs.includes(output), `${policy.agentType}: forbidden output appears in allowedOutputs ${output}`);
    });
  });
}

function validateNegativeFixtures() {
  const base = readJson("fixtures/a0-agent-policy-edgecases.json");

  const missingPolicy = clone(base);
  missingPolicy.agentPolicies = missingPolicy.agentPolicies.filter((policy) => policy.agentType !== "ConsentGuardAgent");
  const missingPolicyResult = agentPolicy.validateA0Fixture(missingPolicy);
  assert(!missingPolicyResult.valid, "missing agent policy should fail");
  assert(missingPolicyResult.errors.some((error) => error.includes("policies.missing:ConsentGuardAgent")), "missing policy error should name ConsentGuardAgent");

  const forbiddenOutput = clone(base);
  forbiddenOutput.agentPolicies[0].allowedOutputs.push("diagnosis");
  const forbiddenOutputResult = agentPolicy.validateA0Fixture(forbiddenOutput);
  assert(!forbiddenOutputResult.valid, "forbidden output should fail");
  assert(forbiddenOutputResult.errors.some((error) => error.includes("allowedOutputs.invalid:diagnosis") || error.includes("allowedOutputs.forbidden:diagnosis")), "forbidden output error should be explicit");

  const missingSource = clone(base);
  missingSource.afterVisitBundle.careTasks[0].sourceRefs = [];
  const missingSourceResult = agentPolicy.validateA0Fixture(missingSource);
  assert(!missingSourceResult.valid, "CareTask without source should fail");
  assert(missingSourceResult.errors.some((error) => error.includes("sourceRefs.missing")), "missing source error should be explicit");

  const unsafeText = clone(base);
  unsafeText.afterVisitBundle.visitSummaries[0].plainLanguageSummary = "diagnoza: tekst zakazany";
  const unsafeTextResult = agentPolicy.validateA0Fixture(unsafeText);
  assert(!unsafeTextResult.valid, "forbidden clinical text should fail");
  assert(unsafeTextResult.errors.some((error) => error.includes("forbiddenText")), "forbidden text error should be explicit");
}

try {
  validatePositiveFixture();
  validateNegativeFixtures();
  console.log("A0 agent policy validation passed");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
