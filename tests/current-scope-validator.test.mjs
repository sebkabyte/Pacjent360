import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  MANIFEST_PATH,
  REPO_ROOT,
  REQUIRED_ACTIVE_SCOPE_PATHS,
  REQUIRED_SUPPORTING_DOCUMENT_PATHS,
  validateRepository
} from "../tools/validate-current-scope.mjs";

const VALIDATOR_PATH = path.join(REPO_ROOT, "tools", "validate-current-scope.mjs");

function copyPath(sourceRoot, targetRoot, relativePath) {
  const source = path.join(sourceRoot, relativePath);
  if (!fs.existsSync(source)) return;
  const target = path.join(targetRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function createFixture() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "p360-current-scope-"));
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, MANIFEST_PATH), "utf8"));
  const changeset = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json"), "utf8")
  );
  const paths = new Set([
    MANIFEST_PATH,
    ...manifest.activeScopeDocuments.map((entry) => entry.path),
    ...manifest.activeSupportingDocuments.map((entry) => entry.path),
    ...manifest.activeExecutableControlSurfaces,
    ...manifest.supersededScopes.flatMap((entry) => entry.paths.filter((value) => !value.endsWith("/"))),
    ...changeset.changes.map((entry) => entry.path)
  ]);
  const tracked = spawnSync("git", ["ls-files", "-z"], { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(tracked.status, 0, `${tracked.stdout}\n${tracked.stderr}`);
  for (const relativePath of tracked.stdout.split("\0").filter(Boolean)) {
    if (relativePath.startsWith("docs/") || (!relativePath.includes("/") && relativePath.endsWith(".md"))) paths.add(relativePath);
  }
  for (const relativePath of paths) copyPath(REPO_ROOT, fixtureRoot, relativePath);
  return fixtureRoot;
}

function runCli(root, extraArgs = ["--allow-untracked"]) {
  return spawnSync(process.execPath, [VALIDATOR_PATH, "--root", root, ...extraArgs], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
}

function runGit(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function runGitOutput(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

function sha256File(absolutePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex").toUpperCase();
}

function mutateFile(root, relativePath, mutate) {
  const absolutePath = path.join(root, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  fs.writeFileSync(absolutePath, mutate(source), "utf8");
}

function initializeCommittedFixture(root) {
  fs.rmSync(path.join(root, "BLUEPRINT"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "CODEX_SH_DELIVERY_LOOP_PROMPT.md"), { force: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(root, MANIFEST_PATH), "utf8"));
  const inventory = new Set(manifest.closedWorld.trackedDocumentation.inventory.map((entry) => entry.path));
  for (const scope of manifest.supersededScopes || []) {
    for (const relativePath of scope.paths || []) {
      if (relativePath.endsWith("/") || inventory.has(relativePath)) continue;
      fs.rmSync(path.join(root, relativePath), { force: true });
    }
  }
  mutateFile(root, "docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md", (source) => (
    source.includes("Independent S0 Reviewer: GPT 5.6 SOL")
      ? source
      : `${source}\nIndependent S0 Reviewer: GPT 5.6 SOL\n`
  ));
  // The synthetic candidate below commits a two-path changeset, so the pack has to declare that
  // same reality; the validator now rejects a pack whose numbers describe a different commit.
  mutateFile(root, "docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md", (source) =>
    source.replace(/PASS\s+\d+\/\d+\s+allowlisted paths/i, "PASS 2/2 allowlisted paths"));
  runGit(root, ["init", "-q"]);
  runGit(root, ["config", "user.name", "Pacjent360 Scope Test"]);
  runGit(root, ["config", "user.email", "kontakt@pacjent360.com.pl"]);
  runGit(root, ["add", "."]);
  runGit(root, ["commit", "-q", "-m", "baseline fixture"]);
  const baseHead = runGitOutput(root, ["rev-parse", "HEAD"]);

  mutateFile(root, "README.md", (source) => `${source}\nSynthetic committed-boundary fixture.\n`);
  runGit(root, ["add", "README.md"]);
  const candidateBeforeEvidenceWrite = runGitOutput(root, ["write-tree"]);
  const changesetPath = path.join(root, "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json");
  const changeset = JSON.parse(fs.readFileSync(changesetPath, "utf8"));
  changeset.schemaVersion = 2;
  changeset.repository = {
    branch: "fixture",
    baseHead,
    candidateBeforeEvidenceWrite,
    candidateBeforeEvidenceWriteType: "index_tree"
  };
  changeset.changeCount = 2;
  changeset.outsideAllowlist = [];
  changeset.forbiddenAreaChanges = [];
  changeset.changes = [
    {
      path: "README.md",
      changeKind: "modified_after_baseline",
      allowed: true,
      before: null,
      after: {
        sha256: sha256File(path.join(root, "README.md")),
        size: fs.statSync(path.join(root, "README.md")).size,
        tracked: true,
        ignored: false
      }
    },
    {
      path: "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json",
      changeKind: "generated_evidence_self",
      allowed: true,
      before: null,
      after: { sha256: null, size: null, tracked: true, ignored: false }
    }
  ];
  fs.writeFileSync(changesetPath, `${JSON.stringify(changeset, null, 2)}\n`, "utf8");
  runGit(root, ["add", "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json"]);
  runGit(root, ["commit", "-q", "-m", "candidate fixture"]);
}

test("ratified current scope passes in explicit working-tree repair mode", () => {
  const result = validateRepository({ allowUntracked: true });
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(result.counts.activeScopeChecked, REQUIRED_ACTIVE_SCOPE_PATHS.length);
  assert.equal(result.counts.supportingChecked, REQUIRED_SUPPORTING_DOCUMENT_PATHS.length);
  assert.equal(result.manifest.currentSprint, "S0");
  assert.equal(result.manifest.gate, "G0_PENDING");
});

test("CLI passes end-to-end on an intact isolated fixture", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runCli(root);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, new RegExp(`${REQUIRED_ACTIVE_SCOPE_PATHS.length} active scope contracts`));
});

test("CLI passes when ignored legacy control-plane files are absent as in a clean checkout", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.rmSync(path.join(root, "BLUEPRINT"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "CODEX_SH_DELIVERY_LOOP_PROMPT.md"), { force: true });
  const result = runCli(root);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("CLI returns non-zero for contradictory body text even with a valid scope header", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "README.md", (source) => `${source}\nObecne MVP pokazuje trzy kokpity: Pacjent, Opiekun i Lekarz.\n`);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /legacy\.three_cockpits/);
});

test("CLI returns non-zero when manifest is reduced to two active documents", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, MANIFEST_PATH, (source) => {
    const manifest = JSON.parse(source);
    manifest.activeScopeDocuments = manifest.activeScopeDocuments.slice(0, 2);
    return `${JSON.stringify(manifest, null, 2)}\n`;
  });
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /manifest\.activeScopeDocument\.required/);
});

test("CLI returns non-zero when an active gate invokes legacy SH loop state", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "tools/validate-go-live.ps1", (source) => `${source}\nnode tools/validate-sh-loop-state.js\n`);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /executableIsolation\.forbiddenReference/);
});

test("CLI returns non-zero for a current doctor scope mutation", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "PRODUCT_SSOT.md", (source) => source.replace("doctor=later_read_only_recipient", "doctor=current_primary_user"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /scopeBlock\.doctor\.mismatch/);
});

test("CLI returns non-zero for an AI or OCR current-scope paraphrase", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "README.md", (source) => `${source}\nOCR działa teraz w obecnym MVP i przetwarza dokumenty.\n`);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /document\.currentScope\.ai_ocr\.current:README\.md/);
});

test("CLI returns non-zero for the OCR and doctor-panel MVP paraphrase", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "README.md", (source) => `${source}\nW obecnym MVP OCR odczytuje dokumenty, a lekarz korzysta z panelu do oceny wizyty.\n`);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /document\.currentScope\.(?:ai_ocr\.current|doctor\.current_panel):README\.md/);
});

test("CLI returns non-zero for an unclassified docs root document", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "docs", "UNCLASSIFIED_SCOPE.md"), "# Alternate current scope\nDoctor, children, OCR and backend are active now.\n", "utf8");
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /closedWorld\.unclassified:docs\/UNCLASSIFIED_SCOPE\.md/);
});

test("CLI fails closed for a new ALT_ACTIVE_WO under a formerly blanket-classified directory", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(root, "docs", "product", "ALT_ACTIVE_WO.md"),
    "# Alternate work order\nStatus: ACTIVE CURRENT WORK ORDER\nCurrent scope: doctor, children, OCR and backend are active now.\n",
    "utf8"
  );
  runGit(root, ["init", "-q"]);
  runGit(root, ["add", "."]);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /closedWorld\.trackedDocumentation\.inventoryMissing:docs\/product\/ALT_ACTIVE_WO\.md/);
});

test("CLI returns non-zero when required supporting evidence is removed from the manifest", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, MANIFEST_PATH, (source) => {
    const manifest = JSON.parse(source);
    manifest.activeSupportingDocuments = [];
    return `${JSON.stringify(manifest, null, 2)}\n`;
  });
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /manifest\.supportingDocument\.required/);
});

test("CLI returns non-zero when a corrective evidence artifact is absent", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.rmSync(path.join(root, "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /correctiveEvidence\.requiredArtifact\.missing:docs\/governance\/S0_REPAIR_CHANGESET_2026-07-10\.json/);
});

test("CLI returns non-zero when Founder Attestation is replaced by a placeholder", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md"), "# Placeholder\n", "utf8");
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /supportingDocument\.requiredMarker\.missing:docs\/governance\/FOUNDER_ATTESTATION_D1_D8_2026-07-10\.md/);
});

test("CLI returns non-zero when a required reference-only marker is removed", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "docs/ARCHITECTURE.md", (source) => source.replace("P360_CONTROL_STATUS: REFERENCE_ONLY", "P360_CONTROL_STATUS: UNCLASSIFIED"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /closedWorld\.explicitClassification\.markerMissing:docs\/ARCHITECTURE\.md/);
});

test("CLI returns non-zero when a reference-only architecture document declares regulated current scope", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, "docs/ARCHITECTURE.md", (source) => `${source}\nCurrent scope: doctor, children, OCR and backend are active.\n`);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /closedWorld\.explicitClassification\.reactivated:docs\/ARCHITECTURE\.md/);
});

test("CLI returns non-zero when a present ignored control plane lacks the reference marker", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const markerPath = path.join(root, "BLUEPRINT", "20_ONE_PLAN_AND_GATES.md");
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(markerPath, "# One active plan\nStatus: ACTIVE\n", "utf8");
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ignoredControlPlane\.marker\.missing/);
});

test("CLI committed HEAD G0 mode rejects a fixture that is not a git checkout", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runCli(root, []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /git\.committedHead\.required/);
});

test("CLI committed HEAD G0 mode passes in an isolated committed fixture", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  initializeCommittedFixture(root);
  const result = runCli(root, []);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /committed HEAD G0 mode/);
});

test("CLI committed HEAD G0 mode rejects a staged-only documentation path", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  initializeCommittedFixture(root);
  const relativePath = "docs/product/STAGED_ONLY_SCOPE.md";
  fs.writeFileSync(path.join(root, relativePath), "# Staged-only scope\n", "utf8");
  runGit(root, ["add", relativePath]);
  const result = runCli(root, []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /(?:closedWorld\.trackedDocumentation\.inventoryMissing|git\.discoveredPath\.notInHead):docs\/product\/STAGED_ONLY_SCOPE\.md/);
});

test("CLI committed HEAD G0 mode rejects a forbidden public diff", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  initializeCommittedFixture(root);
  fs.mkdirSync(path.join(root, "public"), { recursive: true });
  fs.writeFileSync(path.join(root, "public/index.html"), "<!doctype html><title>Forbidden S0 diff</title>\n", "utf8");
  runGit(root, ["add", "public/index.html"]);
  runGit(root, ["commit", "-q", "-m", "forbidden fixture"]);
  const result = runCli(root, []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /correctiveEvidence\.headDiff\.forbiddenArea:public\/index\.html/);
});

test("CLI committed HEAD G0 mode rejects active scope content that differs from HEAD", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  initializeCommittedFixture(root);
  mutateFile(root, "docs/ROADMAP.md", (source) => `${source}\nUncommitted scope drift.\n`);
  const result = runCli(root, []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /git\.requiredPath\.headMismatch:docs\/ROADMAP\.md/);
});

test("CLI committed HEAD G0 mode rejects a compliant staged version over a noncompliant HEAD", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.rmSync(path.join(root, "BLUEPRINT"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "CODEX_SH_DELIVERY_LOOP_PROMPT.md"), { force: true });
  const validReadme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  fs.writeFileSync(path.join(root, "README.md"), `${validReadme}\nObecne MVP pokazuje trzy kokpity: Pacjent, Opiekun i Lekarz.\n`, "utf8");
  runGit(root, ["init", "-q"]);
  runGit(root, ["config", "user.name", "Pacjent360 Scope Test"]);
  runGit(root, ["config", "user.email", "kontakt@pacjent360.com.pl"]);
  runGit(root, ["add", "."]);
  runGit(root, ["commit", "-q", "-m", "noncompliant fixture"]);
  fs.writeFileSync(path.join(root, "README.md"), validReadme, "utf8");
  runGit(root, ["add", "README.md"]);
  const result = runCli(root, []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /git\.requiredPath\.headMismatch:README\.md/);
});

test("CLI returns non-zero when structured supersession metadata is removed", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, MANIFEST_PATH, (source) => {
    const manifest = JSON.parse(source);
    delete manifest.supersededScopes[0].supersededBy;
    return `${JSON.stringify(manifest, null, 2)}\n`;
  });
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /supersededScope\.metadata\.missing/);
});

const EVIDENCE_PACK = "docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md";
const ALLOWLIST = "docs/governance/S0_REPAIR_ALLOWLIST_2026-07-10.json";

test("CLI returns non-zero when the evidence pack declares a stale authorized path count", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, EVIDENCE_PACK, (source) =>
    source.replace(/\|\s*Authorized commit paths\s*\|\s*\d+\s*\|/i, "| Authorized commit paths | 9001 |"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /evidencePack\.authorizedCommitPaths\.mismatch/);
});

test("CLI returns non-zero when the evidence pack declares a stale final path set", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, EVIDENCE_PACK, (source) =>
    source.replace(/PASS\s+\d+\/\d+\s+allowlisted paths/i, "PASS 7/7 allowlisted paths"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /evidencePack\.finalPathSet\.mismatch/);
});

test("CLI returns non-zero when a forbidden area is lifted while the pack still claims it untouched", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, EVIDENCE_PACK, (source) =>
    source.includes("nie zmieniono `public/`") ? source : `${source}\nKorekta nie zmieniono \`public/\` ani runtime.\n`);
  mutateFile(root, ALLOWLIST, (source) => {
    const allowlist = JSON.parse(source);
    allowlist.forbiddenAreas = (allowlist.forbiddenAreas || []).filter((prefix) => prefix !== "public/");
    return `${JSON.stringify(allowlist, null, 2)}\n`;
  });
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /evidencePack\.forbiddenAreaClaim\.notEnforced:public\//);
});

const SAFETY_CASE = "docs/governance/SAFETY_CASE.md";

test("CLI returns non-zero when a supporting document drops its later-phase qualifier", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, SAFETY_CASE, (source) => source.replace(/P360_PHASE_NOTE/g, "PHASE_NOTE_REMOVED"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /supportingDocument\.laterPhaseRole\.unqualified/);
});

test("CLI returns non-zero when a supporting document asserts a current doctor panel", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, SAFETY_CASE, (source) =>
    `${source}\nW obecnym MVP OCR odczytuje dokumenty, a lekarz korzysta z panelu do oceny wizyty.\n`);
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /supportingDocument\.currentScope\./);
});

test("CLI returns non-zero when the evidence pack declares a stale scope-validator test count", (t) => {
  const root = createFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  mutateFile(root, EVIDENCE_PACK, (source) =>
    source.replace(/\|\s*Scope validator tests\s*\|\s*PASS\s+\d+\/\d+\s*\|/i, "| Scope validator tests | PASS 3/3 |"));
  const result = runCli(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /evidencePack\.scopeValidatorTests\.mismatch/);
});
