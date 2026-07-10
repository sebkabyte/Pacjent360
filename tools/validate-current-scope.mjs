import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(TOOL_DIR, "..");
export const MANIFEST_PATH = "docs/governance/CURRENT_SCOPE_MANIFEST.json";

export const EXPECTED_SCOPE = Object.freeze({
  contractId: "FCV1-D1-D8-2026-07-10",
  currentSprint: "S0",
  gate: "G0_PENDING",
  primaryUser: "competent_adult_patient",
  supportUser: "one_named_adult_supporter",
  wedge: "one_planned_visit",
  data: "synthetic_only",
  doctor: "later_read_only_recipient",
  childrenGuardians: "blocked",
  runtimeAiOcrCdss: "blocked",
  backend: "blocked",
  publicLaunch: "blocked_2026_2027"
});

export const REQUIRED_ACTIVE_SCOPE_PATHS = Object.freeze([
  "README.md",
  "PRODUCT_SSOT.md",
  "docs/PROGRAM_PLAN.md",
  "docs/ROADMAP.md",
  "docs/product/FIRST_WEDGE.md",
  "docs/product/PRODUCT_CONSTITUTION.md",
  "docs/product/ROADMAP_2026_2027.md",
  "docs/product/EXECUTION_PLAN_2026_2027.md",
  "docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md",
  "docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md",
  "docs/adr/0008-founder-control-pack-v1-scope-freeze.md",
  "docs/governance/DECISION_LOG.md",
  "docs/governance/GOVERNANCE_V2_STANDING_DELEGATION.md",
  "docs/governance/SCOPE_GUARDRAILS.md",
  "docs/qa/DEFINITION_OF_READY_DONE.md"
]);

export const REQUIRED_EXECUTABLE_CONTROL_PATHS = Object.freeze([
  ".github/workflows/validate.yml",
  "tools/validate-go-live.ps1",
  "tools/verify-public-repo.ps1",
  "tools/public-repo-manifest.txt",
  "tools/validate-current-scope.mjs",
  "tests/current-scope-validator.test.mjs",
  "tools/capture-s0-boundary.mjs"
]);

export const REQUIRED_SUPPORTING_DOCUMENT_PATHS = Object.freeze([
  "docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md",
  "docs/governance/OWNER_RACI_MATRIX.md",
  "docs/governance/S0_REPAIR_BASELINE_2026-07-10.json",
  "docs/governance/S0_REPAIR_ALLOWLIST_2026-07-10.json",
  "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json",
  "docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md",
  "docs/legal/DISCLAIMER.md",
  "SECURITY.md",
  "docs/governance/RISKS.md",
  "docs/governance/SAFETY_CASE.md",
  "docs/governance/SAFETY_GATE_MATRIX.md"
]);

// CONTRIBUTING.md is deliberately absent: README makes its checklist a mandatory commit gate, so it
// is classified ACTIVE and enforced through activeControlInputs instead of a downgrade entry.
export const REQUIRED_EXPLICIT_CLASSIFICATION_PATHS = Object.freeze([
  "CHANGELOG.md",
  "docs/ARCHITECTURE.md",
  "docs/COCKPIT_GAP_ANALYSIS.md",
  "docs/PLAN_UX_MARKETING.md",
  "docs/PROJECT_CHRONICLE.md",
  "docs/TIMELINE_VISION.md"
]);

const REQUIRED_RATIFIED_ARTIFACT_PATHS = Object.freeze([
  "PRODUCT_SSOT.md",
  "docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md",
  "docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md"
]);

const CORRECTIVE_BASELINE_PATH = "docs/governance/S0_REPAIR_BASELINE_2026-07-10.json";
const CORRECTIVE_ALLOWLIST_PATH = "docs/governance/S0_REPAIR_ALLOWLIST_2026-07-10.json";
const CORRECTIVE_CHANGESET_PATH = "docs/governance/S0_REPAIR_CHANGESET_2026-07-10.json";
const CORRECTIVE_EVIDENCE_PACK_PATH = "docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md";

const REQUIRED_MARKER_PATHS = Object.freeze([
  "docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md",
  "docs/governance/OWNER_RACI_MATRIX.md",
  "docs/governance/GOVERNANCE_V2_STANDING_DELEGATION.md",
  "docs/governance/S0_CORRECTIVE_EVIDENCE_PACK_2026-07-10.md"
]);

const BLOCK_TO_SCOPE = Object.freeze({
  contract_id: "contractId",
  current_sprint: "currentSprint",
  gate: "gate",
  primary_user: "primaryUser",
  support_user: "supportUser",
  wedge: "wedge",
  data: "data",
  doctor: "doctor",
  children_guardians: "childrenGuardians",
  runtime_ai_ocr_cdss: "runtimeAiOcrCdss",
  backend: "backend",
  public_launch: "publicLaunch"
});

const STALE_STATUS_PATTERNS = [
  /Status:\s*\*\*DRAFT DO RATYFIKACJI PRZEZ FOUNDERA/i,
  /Status:\s*\*\*PROPOSED - do ratyfikacji przez Foundera/i,
  /\*\*Status:\*\*\s*RECOMMENDED FOR RATIFICATION/i,
  /\*\*Status:\*\*\s*PROPOSED\s*[—-]\s*aktywować po ratyfikacji Foundera/i
];

const REFERENCE_REACTIVATION_PATTERNS = [
  /(?:current\s+scope|bieżąc\w*\s+zakres|biezac\w*\s+zakres|obecn\w*\s+zakres)\s*[:=-].{0,180}\b(?:doctor|lekarz|children|dzieci|guardian|OCR|AI|LLM|backend)\b.{0,100}\b(?:active|enabled|aktyw\w*|w(?:ł|l)ączon\w*|dzia(?:ł|l)[aą])\b/i,
  /\b(?:doctor|lekarz|children|dzieci|guardian|OCR|AI|LLM|backend)\b.{0,100}\b(?:active|enabled|aktyw\w*|w(?:ł|l)ączon\w*|dzia(?:ł|l)[aą])\b.{0,180}(?:current\s+scope|bieżąc\w*\s+zakres|biezac\w*\s+zakres|obecn\w*\s+zakres)/i
];

const CONTRADICTORY_CURRENT_SCOPE_PATTERNS = [
  { code: "legacy.three_cockpits", pattern: /\btrzy\s+kokpity\b/i },
  { code: "legacy.current_parent_doctor", pattern: /w obecnej wersji.{0,180}pacjent,\s*rodzic albo opiekun.{0,180}lekarz ocenia/i },
  { code: "legacy.first_wedge_doctor", pattern: /pierwszy wedge.{0,120}opiekun mobile\s*\+\s*lekarz desktop/i },
  { code: "legacy.active_sprints", pattern: /docs\/SPRINTS\.md.{0,120}aktywny backlog/i },
  { code: "ratification.not_ratified", pattern: /(?:roadmapa|founder decision pack).{0,100}nie (?:są|sa) jeszcze ratyfikowanym SSOT/i },
  { code: "ratification.future_again", pattern: /Founder.{0,50}(?:do\s+)?24\.07(?:\.2026)?.{0,70}ratyfikuje/i },
  { code: "business.unresolved_binary", pattern: /B2C\s+(?:albo|czy)\s+B2B2C/i },
  { code: "doctor.current_primary", pattern: /lekarz\s+(?:jest|to)\s+(?:głównym|glownym|primary)\s+(?:użytkownikiem|uzytkownikiem|odbiorcą|odbiorca).{0,100}(?:current|bieżąc|biezac|MVP)/i },
  { code: "children_guardians.current", pattern: /(?:(?:current|bieżąc|biezac)\s+(?:phase|scope|zakres).{0,40}(?:obejmuje|includes|contains).{0,50}(?:dzieci|child|guardian|opiekun prawny)|(?:dzieci|child|guardian|opiekun prawny).{0,50}(?:są|sa|are)\s+(?:w\s+|in\s+)?(?:current|bieżąc|biezac))/i },
  {
    code: "ai_ocr.current",
    pattern: /(?:\b(?:AI|LLM|OCR|CDSS)\b.{0,60}\b(?:dzia(?:ł|l)[aą]|enabled|active|w(?:ł|l)ączon\w*|uruchomion\w*|dostępn\w*)\b.{0,60}\b(?:teraz|obecnie|MVP|(?:current|bieżąc\w*|biezac\w*)\s+(?:MVP|scope|phase|zakres|wersj\w*))\b|\b(?:teraz|obecnie|MVP|(?:current|bieżąc\w*|biezac\w*)\s+(?:MVP|scope|phase|zakres|wersj\w*))\b.{0,60}\b(?:AI|LLM|OCR|CDSS)\b.{0,60}\b(?:dzia(?:ł|l)[aą]|enabled|active|w(?:ł|l)ączon\w*|uruchomion\w*|dostępn\w*)\b)/i
  },
  {
    code: "ai_ocr.current",
    pattern: /\b(?:AI|LLM|OCR|CDSS)\b.{0,80}\b(?:jest|są|sa|stanowi|obejmuje)\b.{0,80}\b(?:obecn\w*|bieżąc\w*|biezac\w*|current|MVP)\b/i
  },
  {
    code: "ai_ocr.current",
    pattern: /\b(?:w\s+)?(?:obecn\w*|biezac\w*|current)\s+(?:MVP|wersj\w*|zakres\w*)\b.{0,120}\b(?:AI|LLM|OCR|CDSS)\b.{0,100}\b(?:odczyt\w*|czyta\w*|przetwarz\w*|skanuj\w*|analiz\w*)\b/i
  },
  {
    code: "doctor.current_panel",
    pattern: /\b(?:obecn\w*|biezac\w*|current)\s+(?:MVP|wersj\w*|zakres\w*)\b.{0,220}\b(?:lekarz|doctor)\b.{0,100}\b(?:korzysta|uzywa|uses|ocenia|assesses)\b.{0,100}\b(?:panel\w*|dashboard\w*|widok\w*)\b/i
  },
  { code: "backend.current", pattern: /backend.{0,30}(?:enabled|active|włączony|wlaczony).{0,60}(?:current|bieżąc|biezac)\s+(?:phase|scope|zakres)/i },
  { code: "legacy.wedge", pattern: /Wedge A:\s*(?:rodzic|opiekun|parent|guardian)/i }
];

const REQUIRED_TEXT_BY_PATH = Object.freeze({
  "README.md": ["Ratyfikowany current wedge", "Lekarz nie jest bieżącym użytkownikiem produktu"],
  "docs/product/ROADMAP_2026_2027.md": ["zostały ratyfikowane 10.07.2026", "osobna decyzja Foundera Sebastiana Kalisza o G0"],
  "docs/product/EXECUTION_PLAN_2026_2027.md": ["D1-D8 i current wedge zostaly ratyfikowane", "B2C jako ratyfikowana hipoteza uzytkowa 2026"],
  "docs/product/PACJENT360_FOUNDER_CONTROL_PACK_V1_2026-07-10.md": ["P360-ATT-D1-D8-20260710-001", "Artefakty wymagane do G0 i ich stan"],
  "docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md": ["Corrective addendum S0-R", "Rozszerzona, zamknięta allowlista korekty"],
  "docs/adr/0008-founder-control-pack-v1-scope-freeze.md": ["Supersedes for current hierarchy: ADR 0005"],
  "docs/governance/DECISION_LOG.md": ["P360-ATT-D1-D8-20260710-001", "Corrective S0 remediation authorized", "Governance V2 standing delegation ratified"],
  "docs/governance/GOVERNANCE_V2_STANDING_DELEGATION.md": ["ACTIVE AND RATIFIED", "Standing mandate Codexa", "Decyzje zastrzeżone dla Foundera"]
});

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, (match) => match);
}

function isDirectoryRule(value) {
  return String(value).endsWith("/");
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function sha256CanonicalTextFile(filePath) {
  const contents = fs.readFileSync(filePath);
  if (contents.includes(0)) return crypto.createHash("sha256").update(contents).digest("hex").toUpperCase();
  const normalized = contents.toString("utf8").replace(/\r\n/g, "\n");
  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex").toUpperCase();
}

function sha256GitBlob(root, spec) {
  try {
    const contents = execFileSync("git", ["show", spec], {
      cwd: root,
      encoding: null,
      stdio: ["ignore", "pipe", "ignore"]
    });
    return crypto.createHash("sha256").update(contents).digest("hex").toUpperCase();
  } catch {
    return null;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function uniquePaths(entries) {
  return [...new Set(entries.map((entry) => normalizePath(typeof entry === "string" ? entry : entry.path)))];
}

function requiredMarkers(entry) {
  return Array.isArray(entry?.requiredMarkers) ? entry.requiredMarkers : [];
}

function validateEntryMarkers(text, entry, prefix) {
  const errors = [];
  const relativePath = normalizePath(entry.path);
  for (const marker of requiredMarkers(entry)) {
    if (!String(text).includes(marker)) errors.push(`${prefix}.requiredMarker.missing:${relativePath}:${marker}`);
  }
  return errors;
}

export function parseScopeBlock(text) {
  const match = String(text).match(/<!--\s*P360_CURRENT_SCOPE_V1\s*([\s\S]*?)-->/);
  if (!match) return null;

  const parsed = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    parsed[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return parsed;
}

export function validateScopeObject(scope, prefix = "scope") {
  const errors = [];
  for (const [key, expectedValue] of Object.entries(EXPECTED_SCOPE)) {
    if (scope?.[key] !== expectedValue) {
      errors.push(`${prefix}.${key}.expected:${expectedValue}:received:${scope?.[key] ?? "missing"}`);
    }
  }
  return errors;
}

export function validateDocumentText(text, documentPath, expectedScope = EXPECTED_SCOPE) {
  const errors = [];
  const block = parseScopeBlock(text);
  if (!block) return [`document.scopeBlock.missing:${documentPath}`];

  const normalizedScope = {};
  for (const [blockKey, scopeKey] of Object.entries(BLOCK_TO_SCOPE)) normalizedScope[scopeKey] = block[blockKey];

  for (const [key, expectedValue] of Object.entries(expectedScope)) {
    if (normalizedScope[key] !== expectedValue) {
      errors.push(`document.scopeBlock.${key}.mismatch:${documentPath}:${normalizedScope[key] ?? "missing"}`);
    }
  }

  for (const pattern of STALE_STATUS_PATTERNS) {
    if (pattern.test(text)) errors.push(`document.status.stale:${documentPath}`);
  }

  const normalizedText = String(text).replace(/\s+/g, " ");
  for (const { code, pattern } of CONTRADICTORY_CURRENT_SCOPE_PATTERNS) {
    if (pattern.test(normalizedText)) errors.push(`document.currentScope.${code}:${documentPath}`);
  }

  for (const requiredText of REQUIRED_TEXT_BY_PATH[documentPath] || []) {
    if (!String(text).includes(requiredText)) errors.push(`document.requiredText.missing:${documentPath}:${requiredText}`);
  }

  return errors;
}

function validateRatificationMetadata(manifest) {
  const errors = [];
  const ratification = manifest?.ratification;
  if (ratification?.attestationId !== "P360-ATT-D1-D8-20260710-001") errors.push("manifest.ratification.attestationId.invalid");
  if (ratification?.signerId !== "P360-FOUNDER-SEBASTIAN-KALISZ-01") errors.push("manifest.ratification.signerId.invalid");
  if (ratification?.signerName !== "Sebastian Kalisz") errors.push("manifest.ratification.signerName.invalid");
  if (ratification?.signerRole !== "Founder") errors.push("manifest.ratification.signerRole.invalid");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(ratification?.recordedAt || "")) {
    errors.push("manifest.ratification.recordedAt.timezone_required");
  }
  if (ratification?.recordPath !== "docs/governance/FOUNDER_ATTESTATION_D1_D8_2026-07-10.md") {
    errors.push("manifest.ratification.recordPath.invalid");
  }
  const hashes = ratification?.artifactHashes;
  if (!Array.isArray(hashes)) {
    errors.push("manifest.ratification.artifactHashes.required");
  } else {
    const hashPaths = new Set(hashes.map((entry) => normalizePath(entry.path)));
    for (const requiredPath of REQUIRED_RATIFIED_ARTIFACT_PATHS) {
      if (!hashPaths.has(requiredPath)) errors.push(`manifest.ratification.artifactHash.missing:${requiredPath}`);
    }
    for (const entry of hashes) {
      if (!/^[A-F0-9]{64}$/.test(entry.sha256 || "")) errors.push(`manifest.ratification.artifactHash.invalid:${entry.path || "missing"}`);
    }
  }
  return errors;
}

export function validateManifest(manifest) {
  const errors = [];
  const manifestScope = {
    contractId: manifest?.contractId,
    currentSprint: manifest?.currentSprint,
    gate: manifest?.gate,
    primaryUser: manifest?.scope?.primaryUser,
    supportUser: manifest?.scope?.supportUser,
    wedge: manifest?.scope?.wedge,
    data: manifest?.scope?.data,
    doctor: manifest?.scope?.doctor,
    childrenGuardians: manifest?.scope?.childrenGuardians,
    runtimeAiOcrCdss: manifest?.scope?.runtimeAiOcrCdss,
    backend: manifest?.scope?.backend,
    publicLaunch: manifest?.scope?.publicLaunch
  };
  errors.push(...validateScopeObject(manifestScope, "manifest.scope"));
  errors.push(...validateRatificationMetadata(manifest));

  if (manifest?.schemaVersion !== 3) errors.push("manifest.schemaVersion.expected:3");
  for (const arrayName of ["activeScopeDocuments", "activeSupportingDocuments", "activeExecutableControlSurfaces", "supersededScopes", "ignoredControlPlanes"]) {
    if (!Array.isArray(manifest?.[arrayName])) errors.push(`manifest.${arrayName}.required`);
  }

  const activeScopePaths = uniquePaths(manifest?.activeScopeDocuments || []);
  const supportingPaths = uniquePaths(manifest?.activeSupportingDocuments || []);
  const activeControlPaths = uniquePaths(manifest?.activeExecutableControlSurfaces || []);
  for (const requiredPath of REQUIRED_ACTIVE_SCOPE_PATHS) {
    if (!activeScopePaths.includes(requiredPath)) errors.push(`manifest.activeScopeDocument.required:${requiredPath}`);
  }
  for (const requiredPath of REQUIRED_EXECUTABLE_CONTROL_PATHS) {
    if (!activeControlPaths.includes(requiredPath)) errors.push(`manifest.activeExecutableControl.required:${requiredPath}`);
  }
  for (const requiredPath of REQUIRED_SUPPORTING_DOCUMENT_PATHS) {
    if (!supportingPaths.includes(requiredPath)) errors.push(`manifest.supportingDocument.required:${requiredPath}`);
  }

  const markerEntries = [
    ...(manifest?.activeScopeDocuments || []),
    ...(manifest?.activeSupportingDocuments || [])
  ].filter((entry) => entry && typeof entry === "object");
  const markerEntriesByPath = new Map(markerEntries.map((entry) => [normalizePath(entry.path), entry]));
  for (const entry of markerEntries) {
    if (entry.requiredMarkers === undefined) continue;
    if (!Array.isArray(entry.requiredMarkers) || entry.requiredMarkers.length === 0 || entry.requiredMarkers.some((marker) => typeof marker !== "string" || !marker.trim())) {
      errors.push(`manifest.requiredMarkers.invalid:${normalizePath(entry.path)}`);
    }
  }
  for (const requiredPath of REQUIRED_MARKER_PATHS) {
    if (requiredMarkers(markerEntriesByPath.get(requiredPath)).length === 0) errors.push(`manifest.requiredMarkers.required:${requiredPath}`);
  }

  const allExplicitPaths = [
    ...activeScopePaths,
    ...supportingPaths,
    ...activeControlPaths
  ];
  if (new Set(allExplicitPaths).size !== allExplicitPaths.length) errors.push("manifest.explicitPaths.duplicate");

  const activeWorkOrders = (manifest?.activeScopeDocuments || []).filter((entry) => entry.role === "current_work_order");
  if (activeWorkOrders.length !== 1) errors.push(`manifest.activeWorkOrder.expected:1:received:${activeWorkOrders.length}`);
  if (normalizePath(activeWorkOrders[0]?.path) !== "docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md") {
    errors.push("manifest.activeWorkOrder.path.invalid");
  }

  const closedWorld = manifest?.closedWorld;
  if (!Array.isArray(closedWorld?.roots) || !closedWorld.roots.map(normalizePath).includes("docs/")) {
    errors.push("manifest.closedWorld.docsRoot.required");
  }
  if (!Array.isArray(closedWorld?.referenceOnlyDefaults) || closedWorld.referenceOnlyDefaults.length < 10) {
    errors.push("manifest.closedWorld.referenceOnlyDefaults.incomplete");
  }
  if ((closedWorld?.referenceOnlyDefaults || []).map(normalizePath).includes("docs/")) {
    errors.push("manifest.closedWorld.blanketDocsReferenceOnly.forbidden");
  }
  if (closedWorld?.activeExactPathsOverrideReferenceDefaults !== true) errors.push("manifest.closedWorld.activeOverride.required");
  if (closedWorld?.rootFilePatternClassification !== "REQUIRE_EXPLICIT_OR_REFERENCE_RULE") {
    errors.push("manifest.closedWorld.rootPatternClassification.invalid");
  }
  if (!Array.isArray(closedWorld?.referenceOnlyRootPatterns) || closedWorld.referenceOnlyRootPatterns.length === 0) {
    errors.push("manifest.closedWorld.referenceOnlyRootPatterns.required");
  }
  if (closedWorld?.trackedDocumentation?.requireDiscovered !== true) {
    errors.push("manifest.closedWorld.trackedDocumentation.requireDiscovered");
  }
  if (!Array.isArray(closedWorld?.untrackedReferenceOnlyDefaults) || closedWorld.untrackedReferenceOnlyDefaults.length === 0) {
    errors.push("manifest.closedWorld.untrackedReferenceOnlyDefaults.required");
  }

  const trackedConfig = closedWorld?.trackedDocumentation || {};
  const inventory = trackedConfig.inventory;
  const inventoryByPath = new Map();
  if (!Array.isArray(inventory) || inventory.length === 0) {
    errors.push("manifest.closedWorld.trackedDocumentation.inventory.required");
  } else {
    for (const entry of inventory) {
      const relativePath = normalizePath(entry?.path);
      if (!relativePath || !["ACTIVE", "REFERENCE_ONLY", "SUPERSEDED"].includes(entry?.status)) {
        errors.push(`manifest.closedWorld.trackedDocumentation.inventory.invalid:${relativePath || "missing"}`);
        continue;
      }
      if (inventoryByPath.has(relativePath)) errors.push(`manifest.closedWorld.trackedDocumentation.inventory.duplicate:${relativePath}`);
      inventoryByPath.set(relativePath, entry);
    }
    const inventoryPaths = [...inventoryByPath.keys()];
    const sortedInventoryPaths = [...inventoryPaths].sort();
    if (inventoryPaths.some((relativePath, index) => relativePath !== sortedInventoryPaths[index])) {
      errors.push("manifest.closedWorld.trackedDocumentation.inventory.notSorted");
    }
  }

  for (const relativePath of [...activeScopePaths, ...supportingPaths]) {
    const inventoryEntry = inventoryByPath.get(relativePath);
    if (!inventoryEntry) errors.push(`manifest.closedWorld.trackedDocumentation.inventory.activeMissing:${relativePath}`);
    else if (inventoryEntry.status !== "ACTIVE") errors.push(`manifest.closedWorld.trackedDocumentation.inventory.activeStatus:${relativePath}:${inventoryEntry.status}`);
  }

  for (const entry of closedWorld?.explicitClassifications || []) {
    const relativePath = normalizePath(entry.path);
    const inventoryEntry = inventoryByPath.get(relativePath);
    if (inventoryEntry && inventoryEntry.status !== entry.status) {
      errors.push(`manifest.closedWorld.trackedDocumentation.inventory.explicitStatus:${relativePath}:${inventoryEntry.status}:${entry.status}`);
    }
  }

  for (const scope of manifest?.supersededScopes || []) {
    for (const configuredPath of scope.paths || []) {
      if (isDirectoryRule(configuredPath)) continue;
      const relativePath = normalizePath(configuredPath);
      const inventoryEntry = inventoryByPath.get(relativePath);
      if (inventoryEntry && inventoryEntry.status !== scope.status) {
        errors.push(`manifest.closedWorld.trackedDocumentation.inventory.supersededStatus:${relativePath}:${inventoryEntry.status}:${scope.status}`);
      }
    }
  }

  const ignoredControlPlanePaths = new Set((manifest?.ignoredControlPlanes || []).map((entry) => normalizePath(entry.path)));
  const trackedPrefixes = (trackedConfig.includePrefixes || []).map(normalizePath);
  for (const configuredPath of closedWorld?.referenceOnlyDefaults || []) {
    const normalized = normalizePath(configuredPath);
    if (isDirectoryRule(configuredPath) && trackedPrefixes.some((prefix) => normalized.startsWith(prefix)) && !ignoredControlPlanePaths.has(normalized)) {
      errors.push(`manifest.closedWorld.trackedDocumentation.directoryDefaultForbidden:${normalized}`);
    }
  }

  const explicitClassifications = closedWorld?.explicitClassifications;
  if (!Array.isArray(explicitClassifications)) {
    errors.push("manifest.closedWorld.explicitClassifications.required");
  } else {
    const explicitPaths = uniquePaths(explicitClassifications);
    for (const requiredPath of REQUIRED_EXPLICIT_CLASSIFICATION_PATHS) {
      if (!explicitPaths.includes(requiredPath)) errors.push(`manifest.closedWorld.explicitClassification.required:${requiredPath}`);
    }
    for (const entry of explicitClassifications) {
      if (!entry.path || !["REFERENCE_ONLY", "SUPERSEDED"].includes(entry.status) || !entry.owner || !entry.reason) {
        errors.push(`manifest.closedWorld.explicitClassification.invalid:${entry.path || "missing"}`);
      }
    }
    if (new Set(explicitPaths).size !== explicitPaths.length) errors.push("manifest.closedWorld.explicitClassification.duplicate");
  }

  for (const entry of manifest?.supersededScopes || []) {
    if (!entry.id || !["SUPERSEDED", "REFERENCE_ONLY"].includes(entry.status)) errors.push(`manifest.supersededScope.invalid:${entry.id || "missing"}`);
    if (!entry.owner || !entry.supersededBy || !entry.enforcement) errors.push(`manifest.supersededScope.metadata.missing:${entry.id || "missing"}`);
    if (!Array.isArray(entry.paths) || entry.paths.length === 0) errors.push(`manifest.supersededScope.paths.missing:${entry.id || "missing"}`);
  }

  if (manifest?.gitPolicy?.requireTrackedForG0 !== true) errors.push("manifest.gitPolicy.requireTrackedForG0.required");
  if (manifest?.gitPolicy?.requireCommittedHeadForG0 !== true) errors.push("manifest.gitPolicy.requireCommittedHeadForG0.required");
  const isolation = manifest?.executableIsolation;
  if (!Array.isArray(isolation?.scanPaths) || isolation.scanPaths.length === 0) errors.push("manifest.executableIsolation.scanPaths.required");
  if (!Array.isArray(isolation?.forbiddenReferences) || isolation.forbiddenReferences.length < 5) {
    errors.push("manifest.executableIsolation.forbiddenReferences.incomplete");
  }

  return errors;
}

function walkFiles(root, extensions, output = []) {
  if (!fs.existsSync(root)) return output;
  const stat = fs.statSync(root);
  if (stat.isFile()) {
    if (extensions.has(path.extname(root).toLowerCase())) output.push(root);
    return output;
  }
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    walkFiles(path.join(root, entry.name), extensions, output);
  }
  return output;
}

function discoverClosedWorldPaths(root, manifest) {
  const extensions = new Set(manifest.closedWorld.extensions.map((extension) => extension.toLowerCase()));
  const discovered = new Set();
  for (const configuredPath of manifest.closedWorld.roots) {
    const normalized = normalizePath(configuredPath);
    const absolute = path.join(root, normalized);
    for (const filePath of walkFiles(absolute, extensions)) discovered.add(normalizePath(path.relative(root, filePath)));
  }
  const patterns = (manifest.closedWorld.rootFilePatterns || []).map((pattern) => new RegExp(pattern));
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && patterns.some((pattern) => pattern.test(entry.name))) discovered.add(normalizePath(entry.name));
  }
  return [...discovered].sort();
}

function readGitTrackedPaths(root, treeish = null) {
  try {
    const args = treeish
      ? ["ls-tree", "-r", "--name-only", "-z", treeish]
      : ["ls-files", "-z"];
    const output = execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return output.split("\0").filter(Boolean).map(normalizePath);
  } catch {
    return null;
  }
}

function filterTrackedDocumentationPaths(paths, manifest) {
  if (!paths) return null;
  const config = manifest.closedWorld.trackedDocumentation || {};
  const prefixes = (config.includePrefixes || []).map(normalizePath);
  const rootPatterns = (config.includeRootFilePatterns || []).map((pattern) => new RegExp(pattern));
  const extensions = new Set((manifest.closedWorld.extensions || []).map((extension) => extension.toLowerCase()));
  return paths
    .filter((relativePath) => extensions.has(path.extname(relativePath).toLowerCase()))
    .filter((relativePath) => {
      if (prefixes.some((prefix) => relativePath.startsWith(prefix))) return true;
      return !relativePath.includes("/") && rootPatterns.some((pattern) => pattern.test(relativePath));
    })
    .sort();
}

function discoverTrackedDocumentationPaths(root, manifest, treeish = null) {
  return filterTrackedDocumentationPaths(readGitTrackedPaths(root, treeish), manifest);
}

function trackedDocumentationInventory(manifest) {
  return new Map((manifest.closedWorld.trackedDocumentation?.inventory || []).map((entry) => [normalizePath(entry.path), entry]));
}

function isCoveredByRule(relativePath, rules) {
  return rules.some((rule) => {
    const normalizedRule = normalizePath(rule);
    return isDirectoryRule(rule) ? relativePath.startsWith(normalizedRule) : relativePath === normalizedRule;
  });
}

function classifyClosedWorldPath(relativePath, manifest, active, trackedDocumentationSet) {
  if (trackedDocumentationSet.has(relativePath)) {
    return trackedDocumentationInventory(manifest).get(relativePath)?.status || null;
  }

  if (active.has(relativePath)) return "ACTIVE";

  const explicit = (manifest.closedWorld.explicitClassifications || []).find(
    (entry) => normalizePath(entry.path) === relativePath
  );
  if (explicit) return explicit.status;

  for (const scope of manifest.supersededScopes || []) {
    if (isCoveredByRule(relativePath, scope.paths || [])) return scope.status;
  }

  if (isCoveredByRule(relativePath, manifest.closedWorld.referenceOnlyDefaults || [])) return "REFERENCE_ONLY";

  if (isCoveredByRule(relativePath, manifest.closedWorld.untrackedReferenceOnlyDefaults || [])) return "REFERENCE_ONLY";

  if (!relativePath.includes("/")) {
    const rootReferencePatterns = (manifest.closedWorld.referenceOnlyRootPatterns || []).map((pattern) => new RegExp(pattern));
    if (rootReferencePatterns.some((pattern) => pattern.test(relativePath))) return "REFERENCE_ONLY";
  }

  return null;
}

function validateExplicitClassificationMarkers(root, manifest) {
  const errors = [];
  for (const entry of manifest.closedWorld.explicitClassifications || []) {
    const relativePath = normalizePath(entry.path);
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`closedWorld.explicitClassification.fileMissing:${relativePath}`);
      continue;
    }
    if (!entry.requiredMarker) continue;
    const text = fs.readFileSync(absolutePath, "utf8");
    if (!text.includes(entry.requiredMarker)) errors.push(`closedWorld.explicitClassification.markerMissing:${relativePath}`);
    if (/P360_CONTROL_STATUS:\s*ACTIVE/i.test(text)) errors.push(`closedWorld.explicitClassification.reactivated:${relativePath}`);
    for (const pattern of REFERENCE_REACTIVATION_PATTERNS) {
      if (pattern.test(text)) errors.push(`closedWorld.explicitClassification.reactivated:${relativePath}`);
    }
  }
  return errors;
}

function validateClosedWorld(root, manifest, allowUntracked) {
  const errors = [];
  const active = new Set([
    ...uniquePaths(manifest.activeScopeDocuments || []),
    ...uniquePaths(manifest.activeSupportingDocuments || []),
    ...uniquePaths(manifest.activeExecutableControlSurfaces || [])
  ]);
  const discovered = discoverClosedWorldPaths(root, manifest);
  const discoveredSet = new Set(discovered);
  const inventory = trackedDocumentationInventory(manifest);
  const gitTrackedDocumentation = discoverTrackedDocumentationPaths(root, manifest);
  const trackedDocumentation = gitTrackedDocumentation || [...inventory.keys()].filter((relativePath) => fs.existsSync(path.join(root, relativePath))).sort();
  const trackedDocumentationSet = new Set(trackedDocumentation);
  const unclassified = new Set();

  if (gitTrackedDocumentation) {
    for (const relativePath of gitTrackedDocumentation) {
      if (!inventory.has(relativePath)) errors.push(`closedWorld.trackedDocumentation.inventoryMissing:${relativePath}`);
    }
    for (const relativePath of inventory.keys()) {
      if (!trackedDocumentationSet.has(relativePath) && (!allowUntracked || !fs.existsSync(path.join(root, relativePath)))) {
        errors.push(`closedWorld.trackedDocumentation.inventoryStale:${relativePath}`);
      }
    }
  }

  if (manifest.closedWorld.trackedDocumentation?.requireDiscovered === true) {
    for (const relativePath of trackedDocumentation) {
      if (!discoveredSet.has(relativePath)) errors.push(`closedWorld.trackedDocumentation.undiscovered:${relativePath}`);
    }
  }

  for (const relativePath of discovered) {
    if (!classifyClosedWorldPath(relativePath, manifest, active, trackedDocumentationSet)) unclassified.add(relativePath);
  }
  for (const relativePath of unclassified) errors.push(`closedWorld.unclassified:${relativePath}`);
  errors.push(...validateExplicitClassificationMarkers(root, manifest));

  return {
    errors,
    discoveredPaths: discovered,
    discoveredCount: discovered.length,
    trackedDocumentationCount: trackedDocumentation.length,
    classifiedCount: discovered.length - unclassified.size
  };
}

function validateIgnoredControlPlanes(root, manifest) {
  const errors = [];
  for (const controlPlane of manifest.ignoredControlPlanes || []) {
    const controlPath = path.join(root, normalizePath(controlPlane.path));
    if (!fs.existsSync(controlPath)) continue;
    const markerPath = path.join(root, normalizePath(controlPlane.markerPath));
    if (!fs.existsSync(markerPath)) {
      errors.push(`ignoredControlPlane.markerFile.missing:${controlPlane.markerPath}`);
      continue;
    }
    const text = fs.readFileSync(markerPath, "utf8");
    if (!text.includes(controlPlane.requiredMarker)) errors.push(`ignoredControlPlane.marker.missing:${controlPlane.markerPath}`);
  }
  return errors;
}

function validateExecutableIsolation(root, manifest) {
  const errors = [];
  for (const relativePath of manifest.executableIsolation?.scanPaths || []) {
    const absolutePath = path.join(root, normalizePath(relativePath));
    if (!fs.existsSync(absolutePath)) {
      errors.push(`executableIsolation.scanPath.missing:${relativePath}`);
      continue;
    }
    const text = fs.readFileSync(absolutePath, "utf8");
    for (const forbiddenReference of manifest.executableIsolation.forbiddenReferences || []) {
      if (text.includes(forbiddenReference)) errors.push(`executableIsolation.forbiddenReference:${relativePath}:${forbiddenReference}`);
    }
  }
  return errors;
}

function validateSupersededFileMarkers(root, manifest) {
  const errors = [];
  for (const entry of manifest.closedWorld.trackedDocumentation?.inventory || []) {
    const relativePath = normalizePath(entry.path);
    if (entry.status !== "SUPERSEDED" || path.extname(relativePath).toLowerCase() !== ".md") continue;
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`superseded.fileMarker.fileMissing:${relativePath}`);
      continue;
    }
    const text = fs.readFileSync(absolutePath, "utf8");
    if (!/(?:P360_CONTROL_STATUS:\s*SUPERSEDED|\bSUPERSEDED\b)/i.test(text)) errors.push(`superseded.fileMarker.missing:${relativePath}`);
    if (/P360_CONTROL_STATUS:\s*ACTIVE/i.test(text)) errors.push(`superseded.fileMarker.reactivated:${relativePath}`);
  }
  return errors;
}

function validateRatifiedArtifactHashes(root, manifest) {
  const errors = [];
  for (const entry of manifest.ratification?.artifactHashes || []) {
    const relativePath = normalizePath(entry.path);
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`ratification.artifact.missing:${relativePath}`);
      continue;
    }
    const actual = sha256File(absolutePath);
    if (actual !== entry.sha256) errors.push(`ratification.artifact.hashMismatch:${relativePath}:expected:${entry.sha256}:received:${actual}`);
  }
  return errors;
}

function readCommittedHeadDiff(root) {
  try {
    const parent = execFileSync("git", ["rev-parse", "HEAD^"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    const output = execFileSync("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", "HEAD^", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return { parent, paths: output.split("\0").filter(Boolean).map(normalizePath).sort() };
  } catch {
    return null;
  }
}

function validateCorrectiveEvidence(root, allowUntracked) {
  const errors = [];
  const required = [CORRECTIVE_BASELINE_PATH, CORRECTIVE_ALLOWLIST_PATH, CORRECTIVE_CHANGESET_PATH];
  const missing = required.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));
  for (const relativePath of missing) errors.push(`correctiveEvidence.requiredArtifact.missing:${relativePath}`);
  if (missing.length) return errors;

  let baseline;
  let allowlist;
  let changeset;
  try {
    baseline = readJson(path.join(root, CORRECTIVE_BASELINE_PATH));
    allowlist = readJson(path.join(root, CORRECTIVE_ALLOWLIST_PATH));
    changeset = readJson(path.join(root, CORRECTIVE_CHANGESET_PATH));
  } catch (error) {
    return [`correctiveEvidence.invalidJson:${error.message}`];
  }

  if (baseline.repository?.head !== "1a2e4b6a9bef10259b874bf4c3672fcdfb84f8a4") errors.push("correctiveEvidence.baseline.head.invalid");
  if (baseline.repository?.tree !== "1d5094a48599b56ee095ac96b287c1bd05c53bce") errors.push("correctiveEvidence.baseline.tree.invalid");
  if (baseline.rawStatusSha256 !== "081595C783029E35588B6B8BB3F252A8D3BC64CAE004A4D5AEC648DD3F9BF18F") {
    errors.push("correctiveEvidence.baseline.statusHash.invalid");
  }
  if (baseline.entryCount !== baseline.entries?.length || baseline.entryCount !== 106) errors.push("correctiveEvidence.baseline.entryCount.invalid");
  if (baseline.reconstructedTrackedEntryCount !== baseline.reconstructedTrackedEntries?.length) {
    errors.push("correctiveEvidence.baseline.reconstructedTrackedEntryCount.invalid");
  }
  for (const entry of baseline.reconstructedTrackedEntries || []) {
    if (entry.source !== `git:${baseline.repository.head}` || !/^[A-F0-9]{64}$/.test(entry.sha256 || "")) {
      errors.push(`correctiveEvidence.baseline.reconstructedEntry.invalid:${entry.path || "missing"}`);
    }
  }
  if (changeset.baselineRawStatusSha256 !== baseline.rawStatusSha256) errors.push("correctiveEvidence.changeset.baselineHash.mismatch");
  if (changeset.baselinePath !== CORRECTIVE_BASELINE_PATH) errors.push("correctiveEvidence.changeset.baselinePath.invalid");
  if (changeset.allowlistPath !== CORRECTIVE_ALLOWLIST_PATH) errors.push("correctiveEvidence.changeset.allowlistPath.invalid");
  if (!Array.isArray(changeset.outsideAllowlist) || changeset.outsideAllowlist.length !== 0) errors.push("correctiveEvidence.outsideAllowlist.notEmpty");
  if (!Array.isArray(changeset.forbiddenAreaChanges) || changeset.forbiddenAreaChanges.length !== 0) errors.push("correctiveEvidence.forbiddenAreaChanges.notEmpty");
  if (changeset.changeCount !== changeset.changes?.length) errors.push("correctiveEvidence.changeCount.invalid");

  const allowed = new Set((allowlist.allowedPaths || []).map(normalizePath));
  const selfEntries = [];
  for (const change of changeset.changes || []) {
    const relativePath = normalizePath(change.path);
    if (!allowed.has(relativePath) || change.allowed !== true) errors.push(`correctiveEvidence.change.notAllowed:${relativePath}`);
    if ((allowlist.forbiddenAreas || []).some((prefix) => relativePath.startsWith(prefix))) errors.push(`correctiveEvidence.change.forbiddenArea:${relativePath}`);
    if (change.changeKind === "generated_evidence_self") {
      selfEntries.push(relativePath);
      continue;
    }
    if (change.after?.sha256) {
      const absolutePath = path.join(root, relativePath);
      if (!fs.existsSync(absolutePath) && change.changeKind === "baseline_unavailable_ignored") continue;
      if (!fs.existsSync(absolutePath)) errors.push(`correctiveEvidence.change.fileMissing:${relativePath}`);
      else {
        const gitSpec = allowUntracked ? `:${relativePath}` : `HEAD:${relativePath}`;
        const actualHash = sha256GitBlob(root, gitSpec) || sha256CanonicalTextFile(absolutePath);
        if (actualHash !== change.after.sha256) errors.push(`correctiveEvidence.change.hashMismatch:${relativePath}`);
      }
    }
  }
  if (selfEntries.length !== 1 || selfEntries[0] !== CORRECTIVE_CHANGESET_PATH) errors.push("correctiveEvidence.selfEntry.invalid");

  if (!allowUntracked) {
    const committedDiff = readCommittedHeadDiff(root);
    if (!committedDiff) {
      errors.push("correctiveEvidence.headDiff.unavailable");
    } else {
      const allowedCommitPaths = new Set((allowlist.allowedPaths || []).map(normalizePath));
      const actualPaths = new Set(committedDiff.paths);
      const changesetPaths = new Set((changeset.changes || []).map((entry) => normalizePath(entry.path)));
      for (const relativePath of actualPaths) {
        if (!allowedCommitPaths.has(relativePath)) errors.push(`correctiveEvidence.headDiff.notAllowed:${relativePath}`);
        if ((allowlist.forbiddenAreas || []).some((prefix) => relativePath.startsWith(normalizePath(prefix)))) {
          errors.push(`correctiveEvidence.headDiff.forbiddenArea:${relativePath}`);
        }
        if (!changesetPaths.has(relativePath)) errors.push(`correctiveEvidence.headDiff.missingFromChangeset:${relativePath}`);
      }
      for (const relativePath of changesetPaths) {
        if (!actualPaths.has(relativePath)) errors.push(`correctiveEvidence.changeset.notInHeadDiff:${relativePath}`);
      }
      if (changeset.repository?.baseHead !== committedDiff.parent) {
        errors.push(`correctiveEvidence.changeset.baseHead.mismatch:${changeset.repository?.baseHead || "missing"}:${committedDiff.parent}`);
      }
      if (!/^[a-f0-9]{40}$/i.test(changeset.repository?.candidateBeforeEvidenceWrite || "")) {
        errors.push("correctiveEvidence.changeset.candidateBeforeEvidenceWrite.invalid");
      }
    }
  }

  const workOrderPath = path.join(root, "docs/product/WO_P360_S0_GOVERNANCE_FREEZE_2026-07-10.md");
  const addendumPaths = new Set();
  for (const value of Object.values(allowlist)) {
    if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.addedPaths)) continue;
    if (!value.requestedBy && !value.authorizedBy && !value.ratifiedBy) errors.push("correctiveEvidence.allowlist.addendum.ownerMissing");
    for (const relativePath of value.addedPaths) addendumPaths.add(normalizePath(relativePath));
  }
  if (fs.existsSync(workOrderPath)) {
    const workOrderText = fs.readFileSync(workOrderPath, "utf8");
    for (const relativePath of allowlist.allowedPaths || []) {
      if (!workOrderText.includes(`\`${relativePath}\``) && !addendumPaths.has(normalizePath(relativePath))) {
        errors.push(`correctiveEvidence.allowlist.notDeclared:${relativePath}`);
      }
    }
  } else errors.push("correctiveEvidence.workOrder.missing");
  return errors;
}

// Supporting documents carry no scope block, so they used to be marker-checked only. A safety or
// risk document may still narrate doctor-assigned status or guardian roles as if they were current.
const LATER_PHASE_ROLE_PATTERN = /\b(?:opiekun\s+prawny|guardian|dzieci\b|dziecka\b|child(?:ren)?\b)/i;
const LATER_PHASE_QUALIFIER_PATTERN = /P360_PHASE_NOTE/;

export function validateSupportingDocumentSemantics(text, documentPath) {
  const errors = [];
  // A quoted fragment is a citation, not an assertion. Evidence packs legitimately quote the very
  // phrases their negative tests reject, so citations are stripped before the semantic scan.
  const withoutCitations = String(text).replace(/„[^”]*”/g, " ");
  const normalizedText = withoutCitations.replace(/\s+/g, " ");
  for (const { code, pattern } of CONTRADICTORY_CURRENT_SCOPE_PATTERNS) {
    if (pattern.test(normalizedText)) errors.push(`supportingDocument.currentScope.${code}:${documentPath}`);
  }
  for (const pattern of REFERENCE_REACTIVATION_PATTERNS) {
    if (pattern.test(withoutCitations)) errors.push(`supportingDocument.reactivated:${documentPath}`);
  }
  if (LATER_PHASE_ROLE_PATTERN.test(text) && !LATER_PHASE_QUALIFIER_PATTERN.test(text)) {
    errors.push(`supportingDocument.laterPhaseRole.unqualified:${documentPath}`);
  }
  return errors;
}

function gitDiffCheckIsClean(root) {
  try {
    execFileSync("git", ["diff", "--check", "HEAD^", "HEAD"], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// The evidence pack is prose written by the implementer. Without this gate a pack can keep
// asserting an older, smaller and cleaner commit than the one actually being reviewed.
function validateEvidencePackTruthfulness(root, allowUntracked, closedWorldCount) {
  const packPath = path.join(root, CORRECTIVE_EVIDENCE_PACK_PATH);
  if (!fs.existsSync(packPath)) return [`evidencePack.missing:${CORRECTIVE_EVIDENCE_PACK_PATH}`];

  let allowlist;
  let changeset;
  try {
    allowlist = readJson(path.join(root, CORRECTIVE_ALLOWLIST_PATH));
    changeset = readJson(path.join(root, CORRECTIVE_CHANGESET_PATH));
  } catch (error) {
    return [`evidencePack.correctiveArtifactsUnreadable:${error.message}`];
  }

  const errors = [];
  const text = fs.readFileSync(packPath, "utf8");
  const allowedCount = (allowlist.allowedPaths || []).length;
  const changeCount = changeset.changeCount ?? (changeset.changes || []).length;

  const authorized = text.match(/\|\s*Authorized commit paths\s*\|\s*(\d+)\s*\|/i);
  if (!authorized) errors.push("evidencePack.authorizedCommitPaths.missing");
  else if (Number(authorized[1]) !== allowedCount) {
    errors.push(`evidencePack.authorizedCommitPaths.mismatch:declared:${authorized[1]}:actual:${allowedCount}`);
  }

  const finalSet = text.match(/PASS\s+(\d+)\/(\d+)\s+allowlisted paths/i);
  if (!finalSet) errors.push("evidencePack.finalPathSet.missing");
  else if (Number(finalSet[1]) !== changeCount || Number(finalSet[2]) !== changeCount) {
    errors.push(`evidencePack.finalPathSet.mismatch:declared:${finalSet[1]}/${finalSet[2]}:actual:${changeCount}`);
  }

  // A prose claim that a product area stayed untouched is only credible while that area is
  // still an enforced forbidden prefix.
  const forbiddenAreas = new Set((allowlist.forbiddenAreas || []).map(normalizePath));
  for (const area of ["public/", "schema/", "fixtures/", "api/"]) {
    const claimPattern = new RegExp(`nie zmieniono[^.\\n]*\`${area.replace("/", "\\/")}\``, "i");
    if (claimPattern.test(text) && !forbiddenAreas.has(area)) {
      errors.push(`evidencePack.forbiddenAreaClaim.notEnforced:${area}`);
    }
  }

  // The pack also declares how many scope-validator tests back the claim; that number is
  // verifiable against the committed suite, so a stale figure must not survive.
  const declaredTests = text.match(/\|\s*Scope validator tests\s*\|\s*PASS\s+(\d+)\/(\d+)\s*\|/i);
  const testFile = path.join(root, "tests/current-scope-validator.test.mjs");
  const actualTests = fs.existsSync(testFile)
    ? (fs.readFileSync(testFile, "utf8").match(/^test\(/gm) || []).length
    : null;
  if (!declaredTests) errors.push("evidencePack.scopeValidatorTests.missing");
  else if (actualTests !== null && (Number(declaredTests[1]) !== actualTests || Number(declaredTests[2]) !== actualTests)) {
    errors.push(`evidencePack.scopeValidatorTests.mismatch:declared:${declaredTests[1]}/${declaredTests[2]}:actual:${actualTests}`);
  }

  const closedWorld = text.match(/(\d+)\/(\d+)\s+closed-world candidates/i);
  if (!closedWorld) errors.push("evidencePack.closedWorldCount.missing");

  if (!allowUntracked) {
    if (!gitDiffCheckIsClean(root)) errors.push("evidencePack.gitDiffCheck.failed");
    if (closedWorld && typeof closedWorldCount === "number") {
      if (Number(closedWorld[1]) !== closedWorldCount || Number(closedWorld[2]) !== closedWorldCount) {
        errors.push(`evidencePack.closedWorldCount.mismatch:declared:${closedWorld[1]}/${closedWorld[2]}:actual:${closedWorldCount}`);
      }
    }
  }

  return errors;
}

function gitHeadExists(root) {
  try {
    execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function gitHeadTracksPath(root, relativePath) {
  try {
    execFileSync("git", ["cat-file", "-e", `HEAD:${relativePath}`], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function gitHeadMatchesWorktree(root, relativePath) {
  try {
    execFileSync("git", ["diff", "--quiet", "HEAD", "--", relativePath], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function gitCheckoutIsClean(root) {
  try {
    const output = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return output.length === 0;
  } catch {
    return false;
  }
}

function validateCommittedHeadPaths(root, manifest, allowUntracked, discoveredPaths) {
  if (allowUntracked) return [];
  if (!gitHeadExists(root)) return ["git.committedHead.required"];
  const headPaths = readGitTrackedPaths(root, "HEAD");
  if (!headPaths) return ["git.committedHead.treeUnreadable"];
  const headPathSet = new Set(headPaths);
  const headDocumentation = filterTrackedDocumentationPaths(headPaths, manifest) || [];
  const indexDocumentation = discoverTrackedDocumentationPaths(root, manifest) || [];
  const required = new Set([
    MANIFEST_PATH,
    ...uniquePaths(manifest.activeScopeDocuments || []),
    ...uniquePaths(manifest.activeSupportingDocuments || []),
    ...uniquePaths(manifest.activeExecutableControlSurfaces || []),
    ...headDocumentation,
    ...indexDocumentation
  ]);
  const errors = [];
  if (!gitCheckoutIsClean(root)) errors.push("git.checkout.notClean");

  for (const relativePath of discoveredPaths || []) {
    if (!headPathSet.has(relativePath)) errors.push(`git.discoveredPath.notInHead:${relativePath}`);
  }

  for (const relativePath of required) {
    if (!headPathSet.has(relativePath) || !gitHeadTracksPath(root, relativePath)) {
      errors.push(`git.requiredPath.notInHead:${relativePath}`);
      continue;
    }
    if (!gitHeadMatchesWorktree(root, relativePath)) errors.push(`git.requiredPath.headMismatch:${relativePath}`);
  }
  return errors;
}

export function validateRepository(options = {}) {
  const root = path.resolve(options.root || REPO_ROOT);
  const allowUntracked = options.allowUntracked === true;
  const manifestPath = path.join(root, MANIFEST_PATH);
  const errors = [];
  if (!fs.existsSync(manifestPath)) return { valid: false, errors: [`manifest.missing:${MANIFEST_PATH}`], counts: {} };

  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    return { valid: false, errors: [`manifest.invalidJson:${error.message}`], counts: {} };
  }

  errors.push(...validateManifest(manifest));
  let activeScopeChecked = 0;
  for (const document of manifest.activeScopeDocuments || []) {
    const relativePath = normalizePath(document.path);
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`activeScopeDocument.missing:${relativePath}`);
      continue;
    }
    activeScopeChecked += 1;
    const text = fs.readFileSync(absolutePath, "utf8");
    errors.push(...validateDocumentText(text, relativePath));
    errors.push(...validateEntryMarkers(text, document, "activeScopeDocument"));
    // Prose may describe an ignored control plane as detached; listing one of its files as a
    // work item is how a reference-only blueprint quietly becomes backlog again.
    for (const ignoredPlane of manifest.ignoredControlPlanes || []) {
      const prefix = normalizePath(ignoredPlane?.path || "");
      if (!prefix.endsWith("/")) continue;
      const bulletPattern = new RegExp(`^\\s*[-*]\\s+\`${prefix.replace(/\//g, "\\/")}[^\`]*\`.*$`, "gm");
      for (const line of text.match(bulletPattern) || []) {
        // A bullet that classifies or detaches the plane is fine; one that names it as work is not.
        if (/REFERENCE_ONLY|SUPERSEDED|ignorowan|archiwum|odlacz|odłącz|klasyfikuj/i.test(line)) continue;
        errors.push(`activeScopeDocument.ignoredPlaneWorkItem:${relativePath}:${prefix}`);
      }
    }
  }

  let supportingChecked = 0;
  for (const document of manifest.activeSupportingDocuments || []) {
    const relativePath = normalizePath(document.path);
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) errors.push(`supportingDocument.missing:${relativePath}`);
    else {
      supportingChecked += 1;
      const supportingText = fs.readFileSync(absolutePath, "utf8");
      errors.push(...validateEntryMarkers(supportingText, document, "supportingDocument"));
      errors.push(...validateSupportingDocumentSemantics(supportingText, relativePath));
    }
  }

  let executableChecked = 0;
  for (const relativePathRaw of manifest.activeExecutableControlSurfaces || []) {
    const relativePath = normalizePath(relativePathRaw);
    if (!fs.existsSync(path.join(root, relativePath))) errors.push(`activeExecutableControl.missing:${relativePath}`);
    else executableChecked += 1;
  }

  // A document read by an executable gate must not be classified as reference material.
  const inventoryStatus = new Map(
    (manifest.closedWorld?.trackedDocumentation?.inventory || []).map((entry) => [normalizePath(entry.path), entry.status])
  );
  const controlInputs = manifest.activeControlInputs;
  if (!Array.isArray(controlInputs) || controlInputs.length === 0) {
    errors.push("manifest.activeControlInputs.required");
  } else {
    for (const entry of controlInputs) {
      const relativePath = normalizePath(entry?.path);
      if (!relativePath || !entry?.consumedBy) {
        errors.push(`activeControlInput.invalid:${relativePath || "missing"}`);
        continue;
      }
      if (!fs.existsSync(path.join(root, relativePath))) errors.push(`activeControlInput.missing:${relativePath}`);
      const status = inventoryStatus.get(relativePath);
      if (status && status !== "ACTIVE") {
        errors.push(`activeControlInput.notActive:${relativePath}:${status}`);
      }
    }
  }

  const closedWorld = validateClosedWorld(root, manifest, allowUntracked);
  errors.push(...closedWorld.errors);
  errors.push(...validateIgnoredControlPlanes(root, manifest));
  errors.push(...validateExecutableIsolation(root, manifest));
  errors.push(...validateSupersededFileMarkers(root, manifest));
  errors.push(...validateRatifiedArtifactHashes(root, manifest));
  errors.push(...validateCorrectiveEvidence(root, allowUntracked));
  errors.push(...validateEvidencePackTruthfulness(root, allowUntracked, closedWorld.discoveredCount));
  errors.push(...validateCommittedHeadPaths(root, manifest, allowUntracked, closedWorld.discoveredPaths));

  return {
    valid: errors.length === 0,
    errors,
    manifest,
    counts: {
      activeScopeChecked,
      supportingChecked,
      executableChecked,
      closedWorldDiscovered: closedWorld.discoveredCount,
      closedWorldClassified: closedWorld.classifiedCount,
      trackedDocumentation: closedWorld.trackedDocumentationCount
    },
    allowUntracked
  };
}

function cliOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = validateRepository({
    root: cliOption("--root") || REPO_ROOT,
    allowUntracked: process.argv.includes("--allow-untracked")
  });
  if (!result.valid) {
    console.error("Current scope validation FAILED");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    const trackedMode = result.allowUntracked ? "working-tree repair mode" : "committed HEAD G0 mode";
    console.log(
      `Current scope validation PASS: ${result.counts.activeScopeChecked} active scope contracts, ` +
      `${result.counts.supportingChecked} supporting documents, ${result.counts.executableChecked} executable controls, ` +
      `${result.counts.closedWorldClassified}/${result.counts.closedWorldDiscovered} closed-world candidates classified, ` +
      `${result.counts.trackedDocumentation} tracked documentation files covered; one active work order; G0 pending; ${trackedMode}.`
    );
  }
}
