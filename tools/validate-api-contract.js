const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseOpenApiContract(yaml) {
  const operations = [];
  let currentPath = "";
  let currentOperation = null;
  let inContract = false;
  let inConsentScopes = false;

  yaml.split(/\r?\n/).forEach((line) => {
    const pathMatch = line.match(/^  (\/[^:]+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      currentOperation = null;
      inContract = false;
      inConsentScopes = false;
      return;
    }
    const methodMatch = line.match(/^    (get|post|patch|put|delete):\s*$/);
    if (methodMatch && currentPath) {
      currentOperation = {
        path: currentPath,
        method: methodMatch[1],
        operationId: "",
        summary: "",
        contract: { consentScopes: [] }
      };
      operations.push(currentOperation);
      inContract = false;
      inConsentScopes = false;
      return;
    }
    if (!currentOperation) return;
    const operationIdMatch = line.match(/^\s+operationId:\s*(.+)\s*$/);
    if (operationIdMatch) currentOperation.operationId = operationIdMatch[1].trim();
    const summaryMatch = line.match(/^\s+summary:\s*(.+)\s*$/);
    if (summaryMatch) currentOperation.summary = summaryMatch[1].trim();
    if (line.match(/^\s+x-p360-contract:\s*$/)) {
      inContract = true;
      inConsentScopes = false;
      return;
    }
    if (!inContract) return;
    const consentScopesMatch = line.match(/^\s+consentScopes:\s*$/);
    if (consentScopesMatch) {
      inConsentScopes = true;
      return;
    }
    const scopeMatch = line.match(/^\s+-\s*(.+)\s*$/);
    if (inConsentScopes && scopeMatch) {
      currentOperation.contract.consentScopes.push(scopeMatch[1].trim());
      return;
    }
    const contractFieldMatch = line.match(/^\s+(patientDataRead|auditBeforeRead|sourceGrounded):\s*(true|false)\s*$/);
    if (contractFieldMatch) {
      currentOperation.contract[contractFieldMatch[1]] = contractFieldMatch[2] === "true";
      inConsentScopes = false;
      return;
    }
    const resourceTypeMatch = line.match(/^\s+resourceType:\s*(.+)\s*$/);
    if (resourceTypeMatch) {
      currentOperation.contract.resourceType = resourceTypeMatch[1].trim();
      inConsentScopes = false;
    }
  });
  return operations;
}

function validateOperations(operations) {
  const errors = [];
  const ids = new Set();
  operations.forEach((operation) => {
    const label = operation.operationId || `${operation.method} ${operation.path}`;
    if (!operation.operationId) errors.push(`${label}.operationId.required`);
    if (ids.has(operation.operationId)) errors.push(`${operation.operationId}.duplicate`);
    ids.add(operation.operationId);
    const scopes = operation.contract?.consentScopes || [];
    scopes.forEach((scope) => {
      if (!contract.ACCESS_SCOPE_KEYS.includes(scope)) errors.push(`${label}.consentScopes.unknown:${scope}`);
    });
    if (operation.contract?.patientDataRead === true) {
      if (operation.contract.auditBeforeRead !== true) errors.push(`${label}.auditBeforeRead.required`);
      if (!scopes.length) errors.push(`${label}.consentScopes.required`);
      if (operation.contract.sourceGrounded !== true) errors.push(`${label}.sourceGrounded.required`);
    }
    if (!operation.contract?.resourceType) errors.push(`${label}.resourceType.required`);
  });
  return { valid: errors.length === 0, errors };
}

function operationById(operations, id) {
  const operation = operations.find((item) => item.operationId === id);
  assert(operation, `operation not found: ${id}`);
  return operation;
}

function applyMutation(operations, testCase) {
  const mutated = clone(operations);
  const operation = operationById(mutated, testCase.operationId);
  if (testCase.mutate === "removeAuditBeforeRead") {
    operation.contract.auditBeforeRead = false;
  } else if (testCase.mutate === "removeConsentScopes") {
    operation.contract.consentScopes = [];
  } else if (testCase.mutate === "unknownConsentScope") {
    operation.contract.consentScopes = ["clinical.triage"];
  } else if (testCase.mutate === "removeSourceGrounding") {
    operation.contract.sourceGrounded = false;
  } else {
    throw new Error(`Unknown mutation: ${testCase.mutate}`);
  }
  return mutated;
}

function main() {
  const yaml = read("api/openapi.yaml");
  assert(yaml.includes("openapi: 3.1.0"), "openapi.version.required");
  assert(yaml.includes("No server implementation"), "api.must_state_contract_only");
  contract.FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
    assert(!phrase || !yaml.includes(phrase), `api.forbiddenPhrase:${phrase}`);
  });
  const operations = parseOpenApiContract(yaml);
  assert(operations.length >= 8, "api.operations.too_few");
  [
    "getPatientProfile",
    "listDocuments",
    "listMedications",
    "listQuestions",
    "listObservations",
    "listVisitPackets",
    "generateVisitPacket",
    "getDoctorReadOnlySession"
  ].forEach((id) => operationById(operations, id));
  const positive = validateOperations(operations);
  assert(positive.valid, `api contract invalid: ${positive.errors.join("; ")}`);
  const edgecases = readJson("fixtures/api-contract-edgecases.json");
  (edgecases.negativeCases || []).forEach((testCase) => {
    const result = validateOperations(applyMutation(operations, testCase));
    assert(!result.valid, `${testCase.id}: expected invalid`);
    assert(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
    console.log(`${testCase.id}: rejected errors=${result.errors.join(",")}`);
  });
  console.log("API contract validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
