import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TOOL_DIR, "..");

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: options.quiet ? ["ignore", "pipe", "ignore"] : ["ignore", "pipe", "pipe"]
  }).trim();
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function statusPath(line) {
  const raw = line.slice(3).trim();
  const candidate = raw.includes(" -> ") ? raw.split(" -> ").at(-1) : raw;
  return candidate.replace(/^"|"$/g, "").replaceAll("\\", "/");
}

function isTracked(relativePath) {
  try {
    git(["ls-files", "--error-unmatch", "--", relativePath], { quiet: true });
    return true;
  } catch {
    return false;
  }
}

function isIgnored(relativePath) {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relativePath], {
      cwd: REPO_ROOT,
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

const baselineStatusPath = argValue("--baseline-status");
const compareBaselinePath = argValue("--compare-baseline");
const augmentBaselinePath = argValue("--augment-baseline");
const finalCandidateBase = argValue("--final-candidate-base");
const allowlistPath = argValue("--allowlist");
const outputPath = argValue("--out");
const label = argValue("--label") || "S0 corrective baseline";

if ((!baselineStatusPath && !compareBaselinePath && !augmentBaselinePath && !finalCandidateBase) || !outputPath) {
  console.error("Usage: baseline: --baseline-status <path>; augment: --augment-baseline <json> --allowlist <json>; compare: --compare-baseline <json> --allowlist <json>; final candidate: --final-candidate-base <commit> --compare-baseline <json> --allowlist <json>; all modes require --out <path>");
  process.exit(2);
}

function fileEvidence(relativePath, status = null) {
  const absolutePath = path.join(REPO_ROOT, relativePath);
  const exists = fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
  const contents = exists ? fs.readFileSync(absolutePath) : null;
  return {
    status,
    path: relativePath,
    exists,
    tracked: isTracked(relativePath),
    ignored: isIgnored(relativePath),
    size: contents ? contents.length : null,
    sha256: contents ? sha256(contents) : null
  };
}

function gitBlobEvidence(spec, relativePath) {
  try {
    const contents = execFileSync("git", ["show", spec], {
      cwd: REPO_ROOT,
      encoding: null,
      stdio: ["ignore", "pipe", "ignore"]
    });
    return {
      path: relativePath,
      exists: true,
      tracked: true,
      ignored: false,
      size: contents.length,
      sha256: sha256(contents)
    };
  } catch {
    return null;
  }
}

if (finalCandidateBase) {
  if (!allowlistPath || !compareBaselinePath) {
    console.error("Final-candidate mode requires --compare-baseline <json> and --allowlist <json>");
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, compareBaselinePath), "utf8"));
  const allowlist = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, allowlistPath), "utf8"));
  const baseHead = git(["rev-parse", `${finalCandidateBase}^{commit}`]);
  const candidateBeforeEvidenceWrite = git(["write-tree"]);
  const stagedOutput = execFileSync("git", ["diff", "--cached", "--name-only", "-z", baseHead, "--"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const selfPath = normalizePath(outputPath);
  const stagedPaths = new Set(stagedOutput.split("\0").filter(Boolean).map(normalizePath));
  stagedPaths.add(selfPath);
  const allowed = new Set((allowlist.allowedPaths || []).map(normalizePath));
  const changes = [];
  for (const relativePath of [...stagedPaths].sort()) {
    if (relativePath === selfPath) {
      changes.push({
        path: relativePath,
        changeKind: "generated_evidence_self",
        allowed: allowed.has(relativePath),
        before: gitBlobEvidence(`${baseHead}:${relativePath}`, relativePath),
        after: { sha256: null, size: null, tracked: true, ignored: false }
      });
      continue;
    }
    const before = gitBlobEvidence(`${baseHead}:${relativePath}`, relativePath);
    const after = gitBlobEvidence(`:${relativePath}`, relativePath);
    let changeKind = "modified_after_baseline";
    if (!before && after) changeKind = "added_after_baseline";
    else if (before && !after) changeKind = "removed_after_baseline";
    changes.push({
      path: relativePath,
      changeKind,
      allowed: allowed.has(relativePath),
      before: before ? { sha256: before.sha256, size: before.size, tracked: before.tracked, ignored: before.ignored } : null,
      after: after ? { sha256: after.sha256, size: after.size, tracked: after.tracked, ignored: after.ignored } : null
    });
  }
  const outsideAllowlist = changes.filter((entry) => !entry.allowed).map((entry) => entry.path);
  const forbiddenAreaChanges = changes
    .filter((entry) => (allowlist.forbiddenAreas || []).some((prefix) => entry.path.startsWith(normalizePath(prefix))))
    .map((entry) => entry.path);
  const report = {
    schemaVersion: 2,
    label,
    capturedAt: new Date().toISOString(),
    repository: {
      branch: git(["branch", "--show-current"]),
      baseHead,
      candidateBeforeEvidenceWrite,
      candidateBeforeEvidenceWriteType: "index_tree"
    },
    baselinePath: compareBaselinePath,
    baselineRawStatusSha256: baseline.rawStatusSha256,
    allowlistPath,
    changeCount: changes.length,
    outsideAllowlist,
    forbiddenAreaChanges,
    changes
  };
  const absoluteOutputPath = path.resolve(REPO_ROOT, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(absoluteOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`S0 final-candidate changeset written from index: ${outputPath} (${changes.length} changed paths, ${outsideAllowlist.length} outside allowlist)`);
  if (outsideAllowlist.length || forbiddenAreaChanges.length) process.exitCode = 1;
  process.exit();
}

if (augmentBaselinePath) {
  if (!allowlistPath) {
    console.error("Augment mode requires --allowlist <json>");
    process.exit(2);
  }
  const absoluteBaselinePath = path.resolve(REPO_ROOT, augmentBaselinePath);
  const baseline = JSON.parse(fs.readFileSync(absoluteBaselinePath, "utf8"));
  const allowlist = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, allowlistPath), "utf8"));
  const existing = new Set((baseline.entries || []).map((entry) => entry.path));
  const reconstructed = [];
  for (const relativePath of allowlist.allowedPaths || []) {
    if (existing.has(relativePath)) continue;
    try {
      const contents = execFileSync("git", ["show", `${baseline.repository.head}:${relativePath}`], {
        cwd: REPO_ROOT,
        encoding: null,
        stdio: ["ignore", "pipe", "ignore"]
      });
      reconstructed.push({
        path: relativePath,
        source: `git:${baseline.repository.head}`,
        exists: true,
        tracked: true,
        ignored: false,
        size: contents.length,
        sha256: sha256(contents)
      });
    } catch {
      // The path was untracked or did not exist at the captured HEAD.
    }
  }
  baseline.reconstructedTrackedEntries = reconstructed.sort((a, b) => a.path.localeCompare(b.path));
  baseline.reconstructedTrackedEntryCount = baseline.reconstructedTrackedEntries.length;
  baseline.reconstructionMethod = "git show <captured-head>:<path> for allowlisted paths absent from porcelain baseline";
  const absoluteOutputPath = path.resolve(REPO_ROOT, outputPath);
  fs.writeFileSync(absoluteOutputPath, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`S0 baseline augmented from captured HEAD: ${reconstructed.length} tracked paths reconstructed`);
  process.exit();
}

if (compareBaselinePath) {
  if (!allowlistPath) {
    console.error("Compare mode requires --allowlist <json>");
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, compareBaselinePath), "utf8"));
  const allowlist = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, allowlistPath), "utf8"));
  const rawCurrentStatus = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  }).replace(/\r?\n$/, "");
  const currentStatusLines = rawCurrentStatus.split(/\r?\n/).filter(Boolean);
  const currentStatusByPath = new Map(currentStatusLines.map((line) => [statusPath(line), line.slice(0, 2)]));
  const baselineByPath = new Map([
    ...(baseline.reconstructedTrackedEntries || []).map((entry) => [entry.path, entry]),
    ...(baseline.entries || []).map((entry) => [entry.path, entry])
  ]);
  const allPaths = new Set([
    ...baselineByPath.keys(),
    ...currentStatusByPath.keys(),
    ...(allowlist.ignoredLocalMarkerPaths || []),
    normalizePath(outputPath)
  ]);
  const allowed = new Set([...(allowlist.allowedPaths || []), ...(allowlist.ignoredLocalMarkerPaths || [])]);
  const changes = [];
  for (const relativePath of [...allPaths].sort()) {
    if (relativePath === normalizePath(outputPath)) {
      changes.push({
        path: relativePath,
        changeKind: "generated_evidence_self",
        allowed: allowed.has(relativePath),
        before: baselineByPath.has(relativePath) ? { sha256: baselineByPath.get(relativePath).sha256 } : null,
        after: { sha256: null, size: null, tracked: isTracked(relativePath), ignored: isIgnored(relativePath) }
      });
      continue;
    }
    const before = baselineByPath.get(relativePath) || null;
    const current = fileEvidence(relativePath, currentStatusByPath.get(relativePath) || null);
    let changeKind = "unchanged";
    if (!before && current.ignored) changeKind = "baseline_unavailable_ignored";
    else if (!before && current.exists) changeKind = "added_after_baseline";
    else if (before?.exists && !current.exists) changeKind = "removed_after_baseline";
    else if (before?.sha256 !== current.sha256) changeKind = "modified_after_baseline";
    if (changeKind !== "unchanged") {
      changes.push({
        path: relativePath,
        changeKind,
        allowed: allowed.has(relativePath),
        before: before ? { sha256: before.sha256, size: before.size, tracked: before.tracked, ignored: before.ignored } : null,
        after: { sha256: current.sha256, size: current.size, tracked: current.tracked, ignored: current.ignored }
      });
    }
  }
  const outsideAllowlist = changes.filter((entry) => !entry.allowed).map((entry) => entry.path);
  const forbiddenAreaChanges = changes
    .filter((entry) => (allowlist.forbiddenAreas || []).some((prefix) => entry.path.startsWith(prefix)))
    .map((entry) => entry.path);
  const report = {
    schemaVersion: 1,
    label,
    capturedAt: new Date().toISOString(),
    repository: {
      branch: git(["branch", "--show-current"]),
      head: git(["rev-parse", "HEAD"]),
      tree: git(["rev-parse", "HEAD^{tree}"])
    },
    baselinePath: compareBaselinePath,
    baselineRawStatusSha256: baseline.rawStatusSha256,
    currentStatusSha256: sha256(Buffer.from(rawCurrentStatus, "utf8")),
    allowlistPath,
    changeCount: changes.length,
    outsideAllowlist,
    forbiddenAreaChanges,
    changes
  };
  const absoluteOutputPath = path.resolve(REPO_ROOT, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(absoluteOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`S0 corrective changeset written: ${outputPath} (${changes.length} changed paths, ${outsideAllowlist.length} outside allowlist)`);
  if (outsideAllowlist.length || forbiddenAreaChanges.length) process.exitCode = 1;
  process.exit();
}

const rawStatus = fs.readFileSync(path.resolve(baselineStatusPath), "utf8");
const lines = rawStatus.split(/\r?\n/).filter(Boolean);
const entries = lines.map((line) => {
  const relativePath = statusPath(line);
  return fileEvidence(relativePath, line.slice(0, 2));
});

const report = {
  schemaVersion: 1,
  label,
  capturedAt: new Date().toISOString(),
  repository: {
    branch: git(["branch", "--show-current"]),
    head: git(["rev-parse", "HEAD"]),
    tree: git(["rev-parse", "HEAD^{tree}"])
  },
  rawStatusSha256: sha256(Buffer.from(rawStatus, "utf8")),
  entryCount: entries.length,
  entries
};

const absoluteOutputPath = path.resolve(REPO_ROOT, outputPath);
fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
fs.writeFileSync(absoluteOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`S0 boundary snapshot written: ${outputPath} (${entries.length} entries)`);
