const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));
const auditCatalog = require(path.join(root, "public", "patient360-audit-catalog.js"));

const fixturePath = path.join(root, "fixtures", "audit-catalog-edgecases.json");
const schemaPath = path.join(root, "schema", "patient360.schema.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function scenarioTrail(fixture, scenario) {
  if (scenario.auditTrailRef === "validTrail") return fixture.validTrail;
  return scenario.auditTrail || [];
}

function validateSchema() {
  const schema = readJson(schemaPath);
  const defs = schema.$defs || {};
  assert(defs.sh0AuditEvent, "schema must define $defs.sh0AuditEvent");
  assert(defs.sh0AuditEvent.properties.action.enum.join("|") === contract.SH0_AUDIT_ACTIONS.join("|"), "audit action enum drift");
  assert(defs.sh0AuditEvent.properties.policyDecision.enum.join("|") === contract.SH0_AUDIT_POLICY_DECISIONS.join("|"), "audit policy enum drift");
}

function main() {
  validateSchema();
  const fixture = readJson(fixturePath);
  const trailValidation = auditCatalog.validateAuditTrail(fixture.validTrail);
  assert(trailValidation.valid, `validTrail failed: ${trailValidation.errors.join("; ")}`);
  fixture.validScenarios.forEach((scenario) => {
    const validation = auditCatalog.validateDataVisibilityScenario({
      ...scenario,
      auditTrail: scenarioTrail(fixture, scenario)
    });
    assert(validation.valid, `${scenario.id}: expected valid scenario, got ${validation.errors.join("; ")}`);
  });
  fixture.negativeEvents.forEach((testCase) => {
    const validation = auditCatalog.validateAuditEvent(testCase.event);
    assert(!validation.valid, `${testCase.id}: expected invalid audit event`);
    assert(validation.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${validation.errors.join("; ")}`);
  });
  fixture.negativeScenarios.forEach((scenario) => {
    const validation = auditCatalog.validateDataVisibilityScenario({
      ...scenario,
      auditTrail: scenarioTrail(fixture, scenario)
    });
    assert(!validation.valid, `${scenario.id}: expected invalid visibility scenario`);
    assert(validation.errors.includes(scenario.expectedError), `${scenario.id}: expected ${scenario.expectedError}, got ${validation.errors.join("; ")}`);
  });
  assert(auditCatalog.canShowData({ policyAllowed: true, auditWriteStatus: "written" }) === true, "allowed + written should show data");
  assert(auditCatalog.canShowData({ policyAllowed: true, auditWriteStatus: "failed" }) === false, "audit failure must hide data");
  console.log(`Audit catalog validation passed: actions=${auditCatalog.ACTIONS.length}, validEvents=${fixture.validTrail.length}, negativeEvents=${fixture.negativeEvents.length}, negativeScenarios=${fixture.negativeScenarios.length}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
