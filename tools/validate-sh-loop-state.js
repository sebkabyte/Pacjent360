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

function optionFileExists(relativePath, options = {}) {
  if (Object.prototype.hasOwnProperty.call(options.files || {}, relativePath)) {
    return options.files[relativePath] === true;
  }
  return fileExists(relativePath);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function optionRead(relativePath, options = {}) {
  if (Object.prototype.hasOwnProperty.call(options.fileContents || {}, relativePath)) {
    return options.fileContents[relativePath];
  }
  return read(relativePath);
}

function runGit(args) {
  return childProcess.spawnSync("git", args, { cwd: root, encoding: "utf8" });
}

function currentBranch() {
  const result = runGit(["branch", "--show-current"]);
  return result.status === 0 ? result.stdout.trim() : "";
}

function validateScopeFreezeDecision(scopeFreeze) {
  const signed = /ZATWIERDZAM/i.test(scopeFreeze) && /founder/i.test(scopeFreeze);
  const decisionMatch = scopeFreeze.match(/^Decision:\s*(continue|narrow|continue_with_evidence_debt)\s*$/im);
  const decision = decisionMatch ? decisionMatch[1] : "";
  const hasFrozenScope = /Frozen S3 scope:/i.test(scopeFreeze) && /Explicitly outside S3:/i.test(scopeFreeze);
  const hasPhotoAsSource = /Photo-as-source/i.test(scopeFreeze);
  const evidenceFirst = /Evidence basis:/i.test(scopeFreeze) &&
    /SH-1 evidence table completed:\s*yes/i.test(scopeFreeze);
  const evidenceDebt = /evidence-debt/i.test(scopeFreeze) &&
    /Right to narrow after evidence:\s*yes/i.test(scopeFreeze);

  return {
    valid: signed && Boolean(decision) && hasFrozenScope && hasPhotoAsSource &&
      (decision === "continue_with_evidence_debt" ? evidenceDebt : evidenceFirst),
    signed,
    decision
  };
}

function backendGateOpen(state, options = {}) {
  const scopeFreeze = optionFileExists("BLUEPRINT/SH2_REVIEW_READY/SCOPE_FREEZE_SIGNED.md", options)
    ? optionRead("BLUEPRINT/SH2_REVIEW_READY/SCOPE_FREEZE_SIGNED.md", options)
    : "";
  const scopeFreezeDecision = validateScopeFreezeDecision(scopeFreeze);
  const s2Approved = /S2[^\n]*(accepted|approved|zaakceptowane|zatwierdzone)/i.test(state) ||
    /(accepted|approved|zaakceptowane|zatwierdzone)[^\n]*S2/i.test(state);
  return scopeFreezeDecision.valid && s2Approved;
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

function validateSh2ReviewPack(state, options = {}, gateOpen = false) {
  const stateClaimsPack = /SH2_REVIEW_READY/.test(state);
  const packDirExists = optionFileExists("BLUEPRINT/SH2_REVIEW_READY", options);
  if (!stateClaimsPack && !packDirExists) return;

  assert(packDirExists, "SH2_REVIEW_READY pack missing");

  const requiredFiles = [
    "BLUEPRINT/SH2_REVIEW_READY/00_SH2_REVIEW_PACK_INDEX.md",
    "BLUEPRINT/SH2_REVIEW_READY/01_SH1_FAST_VALIDATION_RUNBOOK.md",
    "BLUEPRINT/SH2_REVIEW_READY/02_SH1_EVIDENCE_TABLE.md",
    "BLUEPRINT/SH2_REVIEW_READY/03_SCOPE_FREEZE_SIGNED_TEMPLATE.md",
    "BLUEPRINT/SH2_REVIEW_READY/04_SH1_RECRUITMENT_MESSAGES.md"
  ];
  requiredFiles.forEach((relativePath) => {
    assert(optionFileExists(relativePath, options), `SH2_REVIEW_READY missing file: ${relativePath}`);
  });

  const index = optionRead(requiredFiles[0], options);
  assertContainsAll("SH2 review pack index", index, [
    "S2 technical review accepted",
    "S3 backend gate still closed",
    "03_SCOPE_FREEZE_SIGNED_TEMPLATE.md",
    "04_SH1_RECRUITMENT_MESSAGES.md"
  ]);

  const runbook = optionRead(requiredFiles[1], options);
  assertContainsAll("SH1 fast validation runbook", runbook, [
    "No real patient data",
    "Forbidden Material",
    "Safety Stop Conditions",
    "Decision Rules"
  ]);

  const evidence = optionRead(requiredFiles[2], options);
  assertContainsAll("SH1 evidence table", evidence, [
    "Status: ready template",
    "SH1-DOC-01",
    "SH1-PAT-01",
    "Evidence Capture Matrix",
    "WTP/Payer Signal",
    "Manual vs Photo Signal",
    "Scope Freeze Readiness Checklist",
    "Sessions with real data used | 0 | 0",
    "Serious safety concerns | 0 | 0"
  ]);

  const freezeTemplate = optionRead(requiredFiles[3], options);
  assertContainsAll("Scope freeze template", freezeTemplate, [
    "Status: template only - not a gate file",
    "SCOPE_FREEZE_SIGNED.md",
    "Decision: continue / narrow",
    "Decision: continue_with_evidence_debt",
    "ZATWIERDZAM - founder",
    "Photo-as-source",
    "SH-1 evidence table completed: yes",
    "Right to narrow after evidence: yes",
    "evidence-debt: SH-1 pending"
  ]);

  const recruitment = optionRead(requiredFiles[4], options);
  assertContainsAll("SH1 recruitment messages", recruitment, [
    "Nie prosze o zadne realne dane medyczne",
    "Pacjent360 nie diagnozuje",
    "nie ocenia pilnosci",
    "nie zaleca"
  ]);

  const signedFreezeExists = optionFileExists("BLUEPRINT/SH2_REVIEW_READY/SCOPE_FREEZE_SIGNED.md", options);
  if (signedFreezeExists && !gateOpen) {
    throw new Error("SCOPE_FREEZE_SIGNED exists but backend gate is not open");
  }
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

  const gateOpen = options.backendGateOpen === undefined ? backendGateOpen(state, options) : options.backendGateOpen;
  const km2 = rows.find((row) => row.km === "KM-2 Backend Core");
  if (!gateOpen) {
    assert(km2.status.toLowerCase().includes("blocked"), "KM-2 must stay blocked while backend gate is closed");
    assert(km2.status.toLowerCase().includes("backend gate closed"), "KM-2 status must name backend gate closed");
    assert(!optionFileExists("server", options), "server/ must not exist before backend gate opens");
  }

  assertContainsAll("Human waiting list", state, [
    "Review S2 commit chain",
    "SCOPE_FREEZE_SIGNED",
    "Upload domeny",
    "Contact aliases",
    "Deployed domain"
  ]);

  validateSh2ReviewPack(state, options, gateOpen);

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
      backendGateOpen: Object.prototype.hasOwnProperty.call(testCase, "backendGateOpen")
        ? testCase.backendGateOpen
        : undefined,
      checkGit: testCase.checkGit !== false,
      files: testCase.files,
      fileContents: testCase.fileContents
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
