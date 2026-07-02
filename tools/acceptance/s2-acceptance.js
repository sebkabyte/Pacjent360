const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const demoData = require(path.join(root, "public", "patient360-demo-data.js"));
const flags = require(path.join(root, "public", "patient360-flags.js"));
const s2Prototype = require(path.join(root, "public", "patient360-s2-prototype.js"));
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

function runNode(relativePath) {
  const result = childProcess.spawnSync(process.execPath, [path.join(root, relativePath)], {
    cwd: root,
    encoding: "utf8"
  });
  assert(result.status === 0, `${relativePath} failed\n${result.stdout}\n${result.stderr}`);
}

function buildBundle(variant = "B", patientId = "p1") {
  const state = demoData.buildDemoState({ today: "2026-07-02" });
  state.activePatientId = patientId;
  return s2Prototype.buildS2PrototypeBundle({
    state,
    patientId,
    activeVariant: variant,
    flags
  });
}

function assertFileContains(relativePath, fragments) {
  const content = read(relativePath);
  fragments.forEach((fragment) => {
    assert(content.includes(fragment), `${relativePath} missing fragment: ${fragment}`);
  });
}

const criteria = [
  {
    id: "S2-AC-001",
    title: "Data model v0.2 is source-grounded and backend-ready",
    assert() {
      runNode("tools/validate-s2-data-model.js");
      const schema = readJson("schema/patient360.schema.json");
      const snapshot = readJson("fixtures/s2-data-model.snapshot.json");
      ["patientProfile", "careCircleMember", "consentGrant", "s2Document", "s2Medication", "s2Question", "s2Observation", "visitPacket", "sh0AuditEvent", "s2Slice"].forEach((key) => {
        assert(schema.$defs?.[key], `schema.$defs.${key}.missing`);
      });
      assert(snapshot.modelVersion === contract.S2_MODEL_VERSION, "snapshot.modelVersion must match contract.S2_MODEL_VERSION");
      assert((snapshot.documents || []).every((item) => !item.rawText && !item.ocrText), "S2 documents must stay metadata-only in contract phase");
    }
  },
  {
    id: "S2-AC-002",
    title: "API contract is OpenAPI-only and enforces audit-before-read",
    assert() {
      runNode("tools/validate-api-contract.js");
      const openapi = read("api/openapi.yaml");
      assert(openapi.includes("openapi: 3.1.0"), "OpenAPI 3.1 contract required");
      assert(openapi.includes("No server implementation"), "API file must state contract-only / no server implementation");
      ["auditBeforeRead: true", "sourceGrounded: true", "consentScopes:"].forEach((fragment) => {
        assert(openapi.includes(fragment), `API contract missing ${fragment}`);
      });
    }
  },
  {
    id: "S2-AC-003",
    title: "Consent and audit runtime contracts are importable, pure and fail-closed",
    assert() {
      runNode("tools/validate-s2-runtime-contracts.js");
      assertFileContains("tools/validate-s2-runtime-contracts.js", [
        "runtimeToken.forbidden",
        "addForbiddenMetadata"
      ]);
      assertFileContains("fixtures/s2-runtime-contract-edgecases.json", [
        "doctor.packet_filter.required",
        "metadata.phi_key:diagnosis",
        "auditFailedDataVisible"
      ]);
    }
  },
  {
    id: "S2-AC-004",
    title: "Clickable prototypes cover doctor read-only packet and patient/caregiver PWA flow",
    assert() {
      runNode("tools/validate-s2-prototypes.js");
      for (const variant of flags.LEGAL_VARIANTS) {
        const bundle = buildBundle(variant, "p1");
        const result = s2Prototype.validateS2PrototypeBundle(bundle);
        assert(result.valid, `${variant}: S2 prototype bundle invalid: ${result.errors.join("; ")}`);
        assert(bundle.doctor.readOnly === true, `${variant}: doctor prototype must be read-only`);
        assert(bundle.flow.steps.map((step) => step.id).join("|") === s2Prototype.FLOW_STEP_IDS.join("|"), `${variant}: PWA flow sequence drift`);
      }
    }
  },
  {
    id: "S2-AC-005",
    title: "Browser route tests exercise the S2 prototype without write dialogs",
    assert() {
      assertFileContains("public/demo.html", ['data-view="s2Prototype"', "patient360-s2-prototype.js"]);
      assertFileContains("public/app.js", ["renderS2Prototype", "data-s2-prototype", "data-s2-doctor-readonly", "data-s2-flow-step"]);
      assertFileContains("tools/verify-click-routes.js", ["assertS2PrototypeRoutes", "writeDialogCount === 0", "data-s2-flow-step"]);
    }
  },
  {
    id: "S2-AC-006",
    title: "Closed gates remain closed for backend, AI runtime and real patient data",
    assert() {
      const bundle = buildBundle("B", "p1");
      assert(bundle.gates.backendOpen === false, "backend gate must remain closed in S2");
      assert(bundle.gates.aiRuntimeOpen === false, "AI runtime gate must remain closed in S2");
      assert(bundle.gates.usesRealPatientData === false, "real patient data must remain forbidden in S2");
      assert(!fs.existsSync(path.join(root, "server")), "S2 must not introduce server/backend implementation");
      assert(!read("public/patient360-s2-prototype.js").includes("fetch("), "S2 prototype must not call backend APIs");
    }
  },
  {
    id: "S2-AC-007",
    title: "S2 acceptance gates are wired into go-live and public repo packaging",
    assert() {
      assertFileContains("tools/validate-go-live.ps1", [
        "tools/acceptance/s2-acceptance.js",
        "S2 acceptance criteria",
        "tools/validate-s2-data-model.ps1",
        "tools/validate-api-contract.ps1",
        "tools/validate-s2-runtime-contracts.ps1",
        "tools/validate-s2-prototypes.ps1"
      ]);
      assertFileContains("tools/public-repo-manifest.txt", [
        "tools/acceptance/",
        "fixtures/s2-prototype-edgecases.json"
      ]);
      assertFileContains("tools/verify-public-repo.ps1", ["tools/acceptance/s2-acceptance.js"]);
    }
  }
];

function main() {
  criteria.forEach((criterion) => {
    criterion.assert();
    console.log(`${criterion.id}: PASS - ${criterion.title}`);
  });
  console.log(`S2 acceptance criteria passed: ${criteria.length}/${criteria.length}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
