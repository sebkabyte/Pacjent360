const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { URL } = require("node:url");

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(__dirname, "..");
const packageDir = path.resolve(root, args.packageDir || "public");
const evidenceDir = path.resolve(root, args.evidenceDir || "TEMP_REVIEW_OUTPUT/R1_EVIDENCE");
const captureEvidence = Boolean(args.capture || args.writeEvidence);

const VIEWS = [
  "core",
  "patientPortal",
  "caregiverPortal",
  "interview",
  "documents",
  "timeline",
  "medications",
  "observations",
  "risks",
  "reports",
  "consent",
  "audit"
];

const PATIENTS = [
  { id: "p1", label: "p1" },
  { id: "p2", label: "p2" },
  { id: "p3", label: "p3" }
];

const VIEW_SENTINELS = {
  core: {
    p1: ["procedur", "lek wymagajacy"],
    p2: ["kardiologiczn", "atorwastatyn"],
    p3: ["infekcj", "dziecko"]
  },
  patientPortal: {
    p1: ["procedur", "lek wymagajacy"],
    p2: ["kardiologiczn", "atorwastatyn"],
    p3: ["danych dziecka", "infekcj"]
  },
  caregiverPortal: {
    p1: ["poradnia kwalifikacyjna", "osoba wspierajaca"],
    p2: ["brak aktywnego zakresu"],
    p3: ["rodzic", "drugi rodzic"]
  },
  interview: {
    p1: ["procedur", "opiekun"],
    p2: ["kontrola kardiologiczn", "atorwastatyn"],
    p3: ["kontrola dziecka", "rodzic"]
  },
  documents: {
    p1: ["panel laboratoryjny", "ankieta kwalifikacyjna"],
    p2: ["echo serca", "kardiologiczn"],
    p3: ["potwierdzenie kontroli pediatrycznej", "porada pediatryczna"]
  },
  timeline: {
    p1: ["konsultacja kwalifikacyjna", "procedur"],
    p2: ["echo serca", "kardiologiczn"],
    p3: ["porada pediatryczna", "infekcj"]
  },
  medications: {
    p1: ["lek wymagajacy", "preparat magnezu"],
    p2: ["atorwastatyn", "przyjmowany"],
    p3: ["lek a po infekcji", "otc dla dziecka"]
  },
  observations: {
    p1: ["glukoza"],
    p2: ["nt-probnp"],
    p3: ["crp"]
  },
  risks: {
    p1: ["plan leku przed procedur", "procedur"],
    p2: ["objawy od ostatniego echa", "echo"],
    p3: ["obserwacje rodzica", "infekcj"]
  },
  reports: {
    p1: ["procedur", "lek wymagajacy"],
    p2: ["kardiologiczn", "atorwastatyn"],
    p3: ["infekcj", "dziecko"]
  },
  consent: {
    p1: ["poradnia kwalifikacyjna", "osoba wspierajaca"],
    p2: ["brak zgod", "brak aktywnego"],
    p3: ["rodzic", "drugi rodzic"]
  },
  audit: {
    p1: ["zrodla d1-d3", "wywiad i1"],
    p2: ["brak wpisow audytu"],
    p3: ["rodzic a", "rep3"]
  }
};

const LEAK_SENTINELS = {
  p1: ["lek wymagajacy", "panel laboratoryjny", "ankieta kwalifikacyjna"],
  p2: ["atorwastatyn", "nt-probnp", "echo serca kontrolne"],
  p3: ["lek a po infekcji", "potwierdzenie kontroli pediatrycznej", "rodzic a"]
};

const ALLOWED_DIALOG_TYPES = new Set([
  "document",
  "decision",
  "interview",
  "medication",
  "observation",
  "flag",
  "consent"
]);

const DIALOG_EXPECTATIONS = {
  document: "dodaj dokument",
  decision: "dodaj kontekst decyzji",
  interview: "dodaj wywiad",
  medication: "dodaj lek",
  observation: "dodaj wynik",
  flag: "dodaj sygnal",
  consent: "dodaj zgode"
};

const DIALOG_VIEW_BY_TYPE = {
  document: "documents",
  decision: "core",
  interview: "core",
  medication: "medications",
  observation: "observations",
  flag: "risks",
  consent: "consent"
};

const failures = [];
const counters = {
  patientViewChecks: 0,
  sourceRefsChecked: 0,
  controlChecks: 0,
  screenshots: 0
};

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fold(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łŁ]/g, "l")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(value, maxLength = 520) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function reportFailure(id, message, details = {}) {
  failures.push({ id, message, details });
}

function ensureEvidenceDir() {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

function findBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
    path.join(process.env.ProgramFiles || "", "Microsoft/Edge/Application/msedge.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
    "google-chrome",
    "chromium",
    "msedge"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes("\\") || candidate.includes("/")) {
      if (fs.existsSync(candidate)) return candidate;
      continue;
    }
    const result = childProcess.spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error) return candidate;
  }
  throw new Error("No Chrome/Edge executable found. Set BROWSER_PATH to a Chromium-based browser.");
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8"
  }[extension] || "application/octet-stream";
}

function createStaticServer(baseDir) {
  return http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const requested = path.resolve(baseDir, "." + pathname);
    if (!requested.startsWith(baseDir) || !fs.existsSync(requested) || !fs.statSync(requested).isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(requested) });
    fs.createReadStream(requested).pipe(response);
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function waitForJson(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      return await fetchJson(url);
    } catch (error) {
      lastError = error;
      await pause(150);
    }
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(socketUrl) {
    this.socket = new WebSocket(socketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve, reject } = this.pending.get(payload.id);
        this.pending.delete(payload.id);
        if (payload.error) {
          reject(new Error(payload.error.message || JSON.stringify(payload.error)));
        } else {
          resolve(payload.result || {});
        }
        return;
      }
      this.events.push(payload);
    });
  }

  call(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 12000);
    });
  }

  async evaluate(expression) {
    const result = await this.call("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (result.exceptionDetails) {
      throw new Error(`Browser evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
    }
    return result.result?.value;
  }

  close() {
    this.socket.close();
  }
}

async function pause(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForReady(client) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const ready = await client.evaluate("document.readyState");
    const hasApp = await client.evaluate(`Boolean(
      window.Patient360Contract &&
      window.Patient360MapModel &&
      window.Patient360PreVisitModel &&
      window.Patient360CaregiverModel &&
      document.querySelector('nav button[data-view="patientPortal"]') &&
      document.querySelector('#viewRoot')?.children.length
    )`);
    if ((ready === "complete" || ready === "interactive") && hasApp) return;
    await pause(150);
  }
  throw new Error("Demo did not finish rendering the app in time");
}

async function capture(client, name) {
  if (!captureEvidence) return "";
  ensureEvidenceDir();
  const result = await client.call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  const safeName = name.replace(/[^a-z0-9._-]+/gi, "_");
  const target = path.join(evidenceDir, `${safeName}.png`);
  fs.writeFileSync(target, Buffer.from(result.data, "base64"));
  counters.screenshots += 1;
  return target;
}

async function setPatientAndView(client, patientId, viewId) {
  await client.evaluate(`(() => {
    const select = document.querySelector('#patientSelect');
    if (select && select.value !== ${JSON.stringify(patientId)}) {
      select.value = ${JSON.stringify(patientId)};
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const nav = document.querySelector('nav button[data-view="${viewId}"]');
    if (nav) nav.click();
  })()`);
  await pause(90);
}

async function snapshotRegion(client, selector = "#viewRoot") {
  return client.evaluate(`(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return "";
    return (node.textContent || "").replace(/\\s+/g, " ").trim();
  })()`);
}

async function checkPatientViewMatrix(client) {
  const matrixRows = [];
  for (const view of VIEWS) {
    let previous = null;
    for (const patient of PATIENTS) {
      await setPatientAndView(client, patient.id, view);
      const text = await snapshotRegion(client, "#viewRoot");
      const normalized = fold(text);
      const sentinels = VIEW_SENTINELS[view]?.[patient.id] || [];
      counters.patientViewChecks += 1;

      const hasOwnSentinel = sentinels.some((term) => normalized.includes(term));
      if (!hasOwnSentinel) {
        await capture(client, `before_fail_${view}_${patient.id}_missing_sentinel`);
        reportFailure("R1-3", `${view}/${patient.id}: active patient sentinel not found`, {
          expectedAny: sentinels,
          text: snippet(text)
        });
      }

      for (const other of PATIENTS.filter((item) => item.id !== patient.id)) {
        const leaks = (LEAK_SENTINELS[other.id] || []).filter((term) => normalized.includes(term));
        if (leaks.length) {
          await capture(client, `before_fail_${view}_${patient.id}_leak_${other.id}`);
          reportFailure("R1-3", `${view}/${patient.id}: leaked sentinel from ${other.id}`, {
            leaks,
            text: snippet(text)
          });
        }
      }

      if (previous && previous.text === text) {
        await capture(client, `before_fail_${view}_${patient.id}_unchanged`);
        reportFailure("R1-3", `${view}/${patient.id}: region did not change after patient switch`, {
          previousPatient: previous.patientId,
          text: snippet(text)
        });
      }

      const sourceRows = await checkSourceChips(client, view, patient.id);
      matrixRows.push({
        view,
        patientId: patient.id,
        text: snippet(text),
        sourceRefsChecked: sourceRows.length
      });
      previous = { patientId: patient.id, text };
    }
  }
  return matrixRows;
}

async function checkSourceChips(client, view, patientId) {
  const rows = await client.evaluate(`(() => {
    const refs = [...new Set([...document.querySelectorAll('#viewRoot [data-source-ref]')]
      .map((button) => button.dataset.sourceRef)
      .filter(Boolean)
      .filter((ref) => ref !== 'source_missing'))].slice(0, 8);
    return refs.map((ref) => {
      const result = typeof sourceRecord === 'function' ? sourceRecord(ref) : { record: null };
      return {
        ref,
        patientId: result.record?.patientId || null,
        title: result.record?.title || result.record?.scenario || result.record?.name || result.record?.category || result.record?.subject || ''
      };
    });
  })()`);
  for (const row of rows) {
    counters.sourceRefsChecked += 1;
    if (row.patientId && row.patientId !== patientId) {
      await capture(client, `before_fail_source_${view}_${patientId}_${row.ref.replace(/[^a-z0-9]/gi, "_")}`);
      reportFailure("R1-3", `${view}/${patientId}: source chip points to ${row.patientId}`, row);
    }
  }
  return rows;
}

async function checkCaseStudyAndReportControls(client) {
  await setPatientAndView(client, "p1", "reports");
  const before = await snapshotRegion(client, "#viewRoot");
  const result = await client.evaluate(`(() => {
    const options = [...document.querySelectorAll('[data-case-study]')].map((button) => ({
      id: button.dataset.caseStudy,
      text: button.textContent.trim().replace(/\\s+/g, ' '),
      active: button.classList.contains('active')
    }));
    const target = options.find((item) => !item.active);
    if (target) document.querySelector('[data-case-study="' + target.id + '"]').click();
    return { options, targetId: target?.id || null };
  })()`);
  await pause(90);
  const after = await snapshotRegion(client, "#viewRoot");
  counters.controlChecks += 1;
  if (!result.targetId || before === after) {
    await capture(client, "before_fail_case_study_no_change");
    reportFailure("R1-4", "Case study selector did not change report region", {
      targetId: result.targetId,
      before: snippet(before),
      after: snippet(after)
    });
  }
  if (!fold(after).includes("soczewka")) {
    reportFailure("R1-4", "Case study/report lens lacks visible scope wording", { after: snippet(after) });
  }

  const reportTypes = await client.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('[data-report-type]')];
    const before = document.querySelector('#viewRoot')?.textContent || '';
    const target = buttons.find((button) => !button.classList.contains('active'));
    if (target) target.click();
    const after = document.querySelector('#viewRoot')?.textContent || '';
    return { count: buttons.length, clicked: target?.dataset.reportType || null, changed: before !== after };
  })()`);
  await pause(90);
  counters.controlChecks += 1;
  if (reportTypes.count > 1 && !reportTypes.changed) {
    await capture(client, "before_fail_report_type_no_change");
    reportFailure("R1-4", "Report type lens did not change report region", reportTypes);
  }
}

async function checkDialogBindings(client) {
  const invalid = [];
  const seen = new Set();
  for (const view of VIEWS) {
    await setPatientAndView(client, "p1", view);
    const types = await client.evaluate(`([...document.querySelectorAll('#viewRoot [data-open-dialog]')].map((button) => button.dataset.openDialog))`);
    for (const type of types) {
      counters.controlChecks += 1;
      seen.add(type);
      if (!ALLOWED_DIALOG_TYPES.has(type)) invalid.push({ view, type });
    }
  }
  if (invalid.length) {
    await setPatientAndView(client, "p1", invalid[0].view);
    await capture(client, `before_fail_invalid_dialog_${invalid[0].view}_${invalid[0].type}`);
    reportFailure("R1-5", "Invalid data-open-dialog binding found", { invalid });
  }

  for (const type of [...seen].filter((item) => ALLOWED_DIALOG_TYPES.has(item))) {
    await setPatientAndView(client, "p1", DIALOG_VIEW_BY_TYPE[type] || "core");
    const opened = await client.evaluate(`(() => {
      const button = document.querySelector('[data-open-dialog="${type}"]');
      if (!button) return { found: false };
      button.click();
      const dialog = document.querySelector('#entryDialog');
      const title = document.querySelector('#dialogTitle')?.textContent || '';
      dialog?.close();
      return { found: true, open: Boolean(dialog?.open), title };
    })()`);
    counters.controlChecks += 1;
    if (!opened.found || !fold(opened.title).includes(DIALOG_EXPECTATIONS[type])) {
      reportFailure("R1-5", `Dialog ${type} opens wrong form`, opened);
    }
  }
}

async function checkTimelineControls(client) {
  await setPatientAndView(client, "p1", "timeline");
  const before = await client.evaluate(`(() => ({
    text: document.querySelector('#viewRoot')?.textContent || '',
    cards: document.querySelectorAll('.timeline-story-card,[data-temporal-story-event]').length,
    activePeriod: document.querySelector('[data-timeline-period].active')?.dataset.timelinePeriod || null,
    activeDetail: document.querySelector('[data-timeline-detail].active')?.dataset.timelineDetail || null
  }))()`);

  const afterPeriod = await client.evaluate(`(() => {
    const target = [...document.querySelectorAll('[data-timeline-period]')].find((button) => !button.classList.contains('active') && !button.disabled);
    if (target) target.click();
    return target?.dataset.timelinePeriod || null;
  })()`);
  await pause(90);
  const periodText = await snapshotRegion(client, "#viewRoot");
  counters.controlChecks += 1;
  if (afterPeriod && before.text === periodText) {
    await capture(client, "before_fail_timeline_period_no_change");
    reportFailure("R1-5", "Timeline period control did not change view", { afterPeriod });
  }

  const filter = await client.evaluate(`(() => {
    const beforeCount = document.querySelectorAll('.timeline-story-card,[data-temporal-story-event]').length;
    const target = [...document.querySelectorAll('[data-filter-track]')].find((button) => !button.disabled && !button.classList.contains('active'));
    if (target) target.click();
    return { track: target?.dataset.filterTrack || null, beforeCount };
  })()`);
  await pause(90);
  const afterFilter = await client.evaluate(`(() => ({
    text: document.querySelector('#viewRoot')?.textContent || '',
    cards: document.querySelectorAll('.timeline-story-card,[data-temporal-story-event]').length
  }))()`);
  counters.controlChecks += 1;
  if (filter.track && before.cards && afterFilter.cards > filter.beforeCount) {
    reportFailure("R1-5", "Timeline track filter increased visible cards", { filter, afterCards: afterFilter.cards });
  }

  await client.evaluate(`(() => {
    if (typeof state === 'object') {
      state.timelineFilterTrack = null;
      state.selectedTimelineEventId = null;
      if (typeof saveState === 'function') saveState();
      if (typeof render === 'function') render();
    }
  })()`);
  await pause(90);
  const selected = await client.evaluate(`(() => {
    const current = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}').selectedTimelineEventId || '';
    const items = [...document.querySelectorAll('[data-select-timeline-event]')];
    const item = current
      ? items.find((candidate) => candidate.dataset.selectTimelineEvent !== current)
      : (items[1] || items[0]);
    const eventId = item?.dataset.selectTimelineEvent || null;
    const beforeTitle = document.querySelector('.timeline-inspector h3,.timeline-inspector .record-title')?.textContent || '';
    if (item) item.click();
    return { eventId, beforeTitle };
  })()`);
  await pause(90);
  selected.afterTitle = await client.evaluate(`document.querySelector('.timeline-inspector h3,.timeline-inspector .record-title')?.textContent || ''`);
  counters.controlChecks += 1;
  if (selected.eventId && selected.beforeTitle === selected.afterTitle) {
    await capture(client, "before_fail_timeline_select_no_change");
    reportFailure("R1-5", "Timeline event selection did not update inspector", selected);
  }
}

async function checkDitlStatus(client) {
  await setPatientAndView(client, "p1", "risks");
  const result = await client.evaluate(`(() => {
    const beforeAudit = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}').audit?.length || 0;
    const selected = document.querySelector('[data-ditl-status].selected');
    const target = [...document.querySelectorAll('[data-ditl-status]')].find((button) => button !== selected);
    const beforeText = document.querySelector('#viewRoot')?.textContent || '';
    if (target) target.click();
    const afterText = document.querySelector('#viewRoot')?.textContent || '';
    const afterAudit = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}').audit?.length || 0;
    return { found: Boolean(target), status: target?.dataset.ditlStatus || null, changed: beforeText !== afterText, beforeAudit, afterAudit };
  })()`);
  await pause(90);
  counters.controlChecks += 1;
  if (!result.found || !result.changed || result.afterAudit <= result.beforeAudit) {
    await capture(client, "before_fail_ditl_status");
    reportFailure("R1-5", "DITL status action did not update card and audit", result);
  }
}

async function checkSearchResetExport(client) {
  await setPatientAndView(client, "p1", "observations");
  const search = await client.evaluate(`(() => {
    const input = document.querySelector('#searchInput');
    const before = document.querySelector('#viewRoot')?.textContent || '';
    if (input) {
      input.value = 'glukoza';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const after = document.querySelector('#viewRoot')?.textContent || '';
    return { found: Boolean(input), changed: before !== after, after };
  })()`);
  await pause(90);
  counters.controlChecks += 1;
  if (!search.found || !fold(search.after).includes("glukoza")) {
    reportFailure("R1-5", "Search control did not filter observations", { found: search.found, after: snippet(search.after) });
  }

  for (const patient of PATIENTS) {
    await setPatientAndView(client, patient.id, "core");
    const exported = await client.evaluate(`(() => {
      const data = typeof buildActivePatientExport === 'function' ? buildActivePatientExport() : null;
      return {
        patientId: data?.patient?.id || null,
        mismatches: data ? ['documents','interviews','timelineEvents','medications','observations','flags','decisionContexts','consents']
          .flatMap((key) => (data[key] || []).filter((item) => item.patientId && item.patientId !== data.patient.id).map((item) => key + ':' + item.id + ':' + item.patientId)) : ['no-export']
      };
    })()`);
    counters.controlChecks += 1;
    if (exported.patientId !== patient.id || exported.mismatches.length) {
      reportFailure("R1-5", "Export does not match active patient", { patientId: patient.id, exported });
    }
  }

  const reset = await client.evaluate(`(() => {
    const button = document.querySelector('#resetDemo');
    if (button) button.click();
    return {
      found: Boolean(button),
      patientId: document.querySelector('#patientSelect')?.value || '',
      search: document.querySelector('#searchInput')?.value || '',
      activeView: document.querySelector('nav button.active')?.dataset.view || ''
    };
  })()`);
  await pause(90);
  counters.controlChecks += 1;
  if (!reset.found || reset.patientId !== "p1" || reset.search !== "" || reset.activeView !== "core") {
    reportFailure("R1-5", "Reset does not restore default render state", reset);
  }
}

async function checkPanelAndPrint(client) {
  await setPatientAndView(client, "p1", "reports");
  const panel = await client.evaluate(`(() => {
    const toggle = document.querySelector('#toggleEvidence');
    const grid = document.querySelector('#contentGrid');
    if (toggle) toggle.click();
    const collapsed = grid?.classList.contains('evidence-collapsed') || false;
    document.querySelector('nav button[data-view="core"]')?.click();
    const persisted = grid?.classList.contains('evidence-collapsed') || false;
    if (toggle) toggle.click();
    return { found: Boolean(toggle), collapsed, persisted };
  })()`);
  counters.controlChecks += 1;
  if (!panel.found || !panel.collapsed || !panel.persisted) {
    reportFailure("R1-5", "Evidence panel collapse does not persist after view switch", panel);
  }

  await setPatientAndView(client, "p1", "reports");
  const printed = await client.evaluate(`(() => {
    window.__r1Printed = false;
    window.confirm = () => true;
    window.print = () => { window.__r1Printed = true; };
    const button = document.querySelector('[data-print]') || document.querySelector('#printReport');
    if (button) button.click();
    return { found: Boolean(button), printed: Boolean(window.__r1Printed) };
  })()`);
  counters.controlChecks += 1;
  if (!printed.found || !printed.printed) {
    reportFailure("R1-5", "Print action did not call window.print", printed);
  }
}

async function writeEvidenceJson(payload) {
  if (!captureEvidence) return;
  ensureEvidenceDir();
  fs.writeFileSync(path.join(evidenceDir, "verify-reactivity-result.json"), JSON.stringify(payload, null, 2));
}

async function main() {
  assert(fs.existsSync(packageDir), `Public package does not exist: ${packageDir}`);
  if (captureEvidence) ensureEvidenceDir();

  const staticServer = createStaticServer(packageDir);
  const serverPort = await listen(staticServer);
  const debugPort = await getFreePort();
  const browserPath = args.browserPath || findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "pacjent360-reactivity-"));
  const browser = childProcess.spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  let client = null;
  let matrixRows = [];
  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    assert(pageTarget, "No browser page target available");

    client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.open();
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Log.enable");
    await client.call("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false
    });

    const demoUrl = `http://127.0.0.1:${serverPort}/demo.html?r1=${Date.now()}`;
    await client.call("Page.navigate", { url: demoUrl });
    await waitForReady(client);

    matrixRows = await checkPatientViewMatrix(client);
    await checkCaseStudyAndReportControls(client);
    await checkDialogBindings(client);
    await checkTimelineControls(client);
    await checkDitlStatus(client);
    await checkSearchResetExport(client);
    await checkPanelAndPrint(client);

    const browserIssues = client.events.filter((event) => {
      if (event.method === "Runtime.exceptionThrown") return true;
      if (event.method === "Log.entryAdded") {
        return event.params?.entry?.level === "error";
      }
      return false;
    });
    if (browserIssues.length) {
      reportFailure("R1-browser", "Browser reported runtime/log errors", { browserIssues: browserIssues.slice(0, 5) });
    }

    const payload = { packageDir, demoUrl, counters, matrixRows, failures };
    await writeEvidenceJson(payload);

    if (failures.length) {
      console.error(`R1 reactivity verification failed: ${failures.length} issue(s)`);
      for (const failure of failures) {
        console.error(`- [${failure.id}] ${failure.message}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("R1 reactivity verification passed");
    console.log(`Patient/view checks: ${counters.patientViewChecks}`);
    console.log(`Source refs checked: ${counters.sourceRefsChecked}`);
    console.log(`Control checks: ${counters.controlChecks}`);
    console.log(`Screenshots written: ${counters.screenshots}`);
  } finally {
    if (client) client.close();
    staticServer.close();
    if (!browser.killed) browser.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // Temporary browser profile cleanup is best-effort.
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
