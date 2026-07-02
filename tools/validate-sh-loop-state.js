const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const statePath = path.join(root, "BLUEPRINT", "SH_LOOP_STATE.md");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function runGit(args) {
  return childProcess.spawnSync("git", args, { cwd: root, encoding: "utf8" });
}

function currentBranch() {
  const result = runGit(["branch", "--show-current"]);
  return result.status === 0 ? result.stdout.trim() : "";
}

function backendGateOpen(state) {
  const scopeFreeze = fileExists("BLUEPRINT/SH2_REVIEW_READY/SCOPE_FREEZE_SIGNED.md")
    ? read("BLUEPRINT/SH2_REVIEW_READY/SCOPE_FREEZE_SIGNED.md")
    : "";
  const signedScopeFreeze = /ZATWIERDZAM/i.test(scopeFreeze) && /founder/i.test(scopeFreeze);
  const s2Approved = /S2[^\n]*(accepted|approved|zaakceptowane|zatwierdzone)/i.test(state) ||
    /(accepted|approved|zaakceptowane|zatwierdzone)[^\n]*S2/i.test(state);
  return signedScopeFreeze && s2Approved;
}

function parseMilestoneRows(state) {
  return state
    .split(/\r?\n/)
    .filter((line) => /^\|\s*KM-/.test(line))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return {
        line,
        km: cells[0],
        when: cells[1],
        track: cells[2],
        microplan: cells[3],
        dod: cells[4],
        doe: cells[5],
        tests: cells[6],
        status: cells[7]
      };
    });
}

function assertContainsAll(label, text, fragments) {
  fragments.forEach((fragment) => {
    assert(text.includes(fragment), `${label} missing: ${fragment}`);
  });
}

function validateState(state, options = {}) {
  const branchMatch = state.match(/^Galaz:\s*(.+)$/mi) || state.match(/^Branch:\s*(.+)$/mi);
  assert(branchMatch, "SH loop state must name the active branch");
  const expectedBranch = branchMatch[1].trim();
  const actualBranch = options.actualBranch === undefined ? currentBranch() : options.actualBranch;
  if (actualBranch) {
    assert(expectedBranch === actualBranch, `SH loop branch mismatch: state=${expectedBranch}, git=${actualBranch}`);
  }

  assertContainsAll("Preflight gate list", state, [
    "backend",
    "native mobile",
    "OCR",
    "IKP/P1/FHIR/scraping",
    "realne dane",
    "AI runtime",
    "deploy produkcyjny",
    "main merge"
  ]);

  const rows = parseMilestoneRows(state);
  const requiredMilestones = [
    "KM-0 Foundation Go-Live",
    "KM-0 S1 Foundation code",
    "KM-1 Evidence & Contracts",
    "KM-2 Backend Core",
    "KM-3 Vertical Slice + Closed Beta",
    "KM-4 Hardening",
    "KM-5 Public Launch + Pilot",
    "KM-6 Scale"
  ];
  requiredMilestones.forEach((milestone) => {
    assert(rows.some((row) => row.km === milestone), `missing milestone row: ${milestone}`);
  });

  rows.forEach((row) => {
    assert(row.when, `${row.km}: missing schedule`);
    assert(row.track, `${row.km}: missing track`);
    assert(row.microplan, `${row.km}: missing microplan`);
    assert(row.dod, `${row.km}: missing DoD`);
    assert(row.doe, `${row.km}: missing DoE`);
    assert(row.tests, `${row.km}: missing tests/gate evidence`);
    assert(row.status, `${row.km}: missing status`);
  });

  const km1 = rows.find((row) => row.km === "KM-1 Evidence & Contracts");
  assert(km1.status.includes("READY-FOR-REVIEW"), "KM-1 code track must remain READY-FOR-REVIEW until human gate closes");
  assert(km1.status.includes("SCOPE_FREEZE_SIGNED") || km1.tests.includes("SCOPE_FREEZE_SIGNED"), "KM-1 must name SCOPE_FREEZE_SIGNED gate");

  const gateOpen = options.backendGateOpen === undefined ? backendGateOpen(state) : options.backendGateOpen;
  const km2 = rows.find((row) => row.km === "KM-2 Backend Core");
  if (!gateOpen) {
    assert(km2.status.toLowerCase().includes("blocked"), "KM-2 must stay blocked while backend gate is closed");
    assert(km2.status.toLowerCase().includes("backend gate closed"), "KM-2 status must name backend gate closed");
    const hasFile = options.fileExists || fileExists;
    assert(!hasFile("server"), "server/ must not exist before backend gate opens");
  }

  assertContainsAll("Human waiting list", state, [
    "Review S2 commit chain",
    "SCOPE_FREEZE_SIGNED",
    "Upload domeny",
    "Contact aliases",
    "Deployed domain"
  ]);

  const commitRefs = [...state.matchAll(/^Commit [^:\n]+:\s+([0-9a-f]{7,40})\b/gim)].map((match) => match[1]);
  assert(commitRefs.length >= 8, `expected S1/S2 commit references, found ${commitRefs.length}`);
  if (options.checkGit !== false) {
    commitRefs.forEach((sha) => {
      const exists = runGit(["cat-file", "-e", `${sha}^{commit}`]);
      assert(exists.status === 0, `loop-state commit does not resolve: ${sha}`);
      const ancestor = runGit(["merge-base", "--is-ancestor", sha, "HEAD"]);
      assert(ancestor.status === 0, `loop-state commit is not in current HEAD ancestry: ${sha}`);
    });
  }

  return { milestones: rows.length, commits: commitRefs.length, backendGateOpen: gateOpen };
}

function replaceFirst(state, from, to) {
  assert(state.includes(from), `edgecase mutation source not found: ${from}`);
  return state.replace(from, to);
}

function applyMutation(state, mutation) {
  if (mutation.type === "replace") {
    return replaceFirst(state, mutation.from, mutation.to);
  }
  if (mutation.type === "removeLineStartingWith") {
    return state
      .split(/\r?\n/)
      .filter((line) => !line.startsWith(mutation.prefix))
      .join("\n");
  }
  throw new Error(`unknown SH loop edgecase mutation type: ${mutation.type}`);
}

function runEdgeCases(baseState) {
  const fixturePath = path.join(root, "fixtures", "sh-loop-state-edgecases.json");
  if (!fs.existsSync(fixturePath)) return { total: 0, negatives: 0 };

  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  let negatives = 0;
  fixture.cases.forEach((testCase) => {
    const mutated = testCase.mutation ? applyMutation(baseState, testCase.mutation) : baseState;
    const options = {
      actualBranch: testCase.actualBranch === undefined ? currentBranch() : testCase.actualBranch,
      backendGateOpen: false,
      checkGit: testCase.checkGit !== false,
      fileExists: (relativePath) => testCase.files?.[relativePath] === true
    };

    if (testCase.valid) {
      validateState(mutated, options);
      return;
    }

    negatives += 1;
    try {
      validateState(mutated, options);
      throw new Error(`edgecase did not fail: ${testCase.name}`);
    } catch (error) {
      assert(
        error.message.includes(testCase.expectedError),
        `${testCase.name}: expected error containing "${testCase.expectedError}", got "${error.message}"`
      );
    }
  });
  return { total: fixture.cases.length, negatives };
}

function main() {
  if (!fs.existsSync(statePath)) {
    console.log("SH loop state not present; validation skipped for public package.");
    return;
  }

  const state = fs.readFileSync(statePath, "utf8");
  const result = validateState(state);
  const edgecases = runEdgeCases(state);
  console.log(`SH loop state validation passed: milestones=${result.milestones}, commits=${result.commits}, backendGateOpen=${result.backendGateOpen}, edgecases=${edgecases.total}, negatives=${edgecases.negatives}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
