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

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readIfExists(relativePath) {
  return fileExists(relativePath) ? read(relativePath) : "";
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function readJsonIfExists(relativePath) {
  return fileExists(relativePath) ? readJson(relativePath) : null;
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

function backendGateEvidence() {
  const scopeFreeze = readIfExists("BLUEPRINT/SH2_REVIEW_READY/SCOPE_FREEZE_SIGNED.md");
  const loopState = readIfExists("BLUEPRINT/SH_LOOP_STATE.md");
  const signedScopeFreeze = /ZATWIERDZAM/i.test(scopeFreeze) && /founder/i.test(scopeFreeze);
  const s2Approved = /S2[^\n]*(accepted|approved|zaakceptowane|zatwierdzone)/i.test(loopState) ||
    /(accepted|approved|zaakceptowane|zatwierdzone)[^\n]*S2/i.test(loopState);
  return {
    open: signedScopeFreeze && s2Approved,
    signedScopeFreeze,
    s2Approved,
    loopState
  };
}

function assertNoBackendImplementation(reason) {
  const blockedPaths = [
    "server",
    "docker-compose.yml",
    "docker-compose.yaml",
    ".github/workflows/backend.yml",
    ".github/workflows/backend.yaml"
  ];
  blockedPaths.forEach((relativePath) => {
    assert(!fileExists(relativePath), `${reason}: unexpected backend artifact before gate opens: ${relativePath}`);
  });

  const packageJson = readJsonIfExists("package.json");
  if (!packageJson) return;

  const dependencyNames = Object.keys({
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.optionalDependencies || {})
  });
  const backendDependencies = dependencyNames.filter((name) =>
    name === "fastify" ||
    name === "pg" ||
    name === "postgres" ||
    name === "testcontainers" ||
    name === "minio" ||
    name.startsWith("@fastify/") ||
    name.startsWith("@prisma/") ||
    name === "prisma" ||
    name === "drizzle-orm" ||
    name === "typeorm" ||
    name === "sequelize"
  );
  assert(backendDependencies.length === 0, `${reason}: backend dependencies before gate opens: ${backendDependencies.join(", ")}`);
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
      if (!backendGateEvidence().open) {
        assertNoBackendImplementation("S2 must not introduce server/backend implementation");
      }
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
  },
  {
    id: "S2-AC-008",
    title: "Backend transition remains blocked unless founder scope-freeze evidence exists",
    assert() {
      const evidence = backendGateEvidence();
      if (!evidence.open) {
        assertNoBackendImplementation("backend gate is closed");
        assert(!/Biezacy sprint:\s*S3|Current sprint:\s*S3/i.test(evidence.loopState), "S3 cannot become the current sprint before backend gate evidence exists");
      }

      const deliveryPrompt = readIfExists("CODEX_SH_DELIVERY_LOOP_PROMPT.md");
      if (deliveryPrompt) {
        assert(deliveryPrompt.includes("SCOPE_FREEZE_SIGNED"), "delivery loop must name SCOPE_FREEZE_SIGNED as backend gate evidence");
        assert(deliveryPrompt.includes("approved") || deliveryPrompt.includes("approved/scalone"), "delivery loop must require human S2 approval before S3");
      }
    }
  },
  {
    id: "S2-AC-009",
    title: "S2 review handoff names required reviewer domains and gate decision",
    assert() {
      const loopState = readIfExists("BLUEPRINT/SH_LOOP_STATE.md");
      if (!loopState) return;

      assert(loopState.includes("## Reviewer Checklist S2"), "loop state must include Reviewer Checklist S2 before S3 can be considered");
      [
        "Security + Data",
        "API + Backend Readiness",
        "Consent + Audit Runtime",
        "UX + Medical Safety",
        "QA + Release Engineering",
        "Gate Boundary"
      ].forEach((fragment) => {
        assert(loopState.includes(fragment), `Reviewer Checklist S2 missing domain: ${fragment}`);
      });
      [
        "accepted / rework / narrow",
        "SCOPE_FREEZE_SIGNED",
        "human S2 approval",
        "AC-008"
      ].forEach((fragment) => {
        assert(loopState.includes(fragment), `Reviewer Checklist S2 missing gate marker: ${fragment}`);
      });
    }
  },
  {
    id: "S2-AC-010",
    title: "S2 loop-state acceptance evidence matches the executable criteria count",
    assert() {
      const loopState = readIfExists("BLUEPRINT/SH_LOOP_STATE.md");
      if (!loopState) return;

      const acceptanceCount = criteria.length;
      const expectedRatio = `${acceptanceCount}/${acceptanceCount}`;
      assert(loopState.includes(`acceptance ${expectedRatio}`), `loop state must mention acceptance ${expectedRatio}`);
      assert(loopState.includes(`S2 acceptance criteria ${expectedRatio}`), `loop state validate-go-live evidence must mention S2 acceptance criteria ${expectedRatio}`);
      const ratios = [...loopState.matchAll(/acceptance(?: criteria)?\s+(\d+\/\d+)/gi)].map((match) => match[1]);
      assert(ratios.length > 0, "loop state must contain at least one acceptance ratio");
      ratios.forEach((ratio) => {
        assert(ratio === expectedRatio, `loop state contains stale acceptance ratio: ${ratio}, expected ${expectedRatio}`);
      });
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
