const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { URL } = require("node:url");

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(__dirname, "..");
const packageDir = path.resolve(root, args.packageDir || "dist/public");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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
    try {
      const result = childProcess.spawnSync(candidate, ["--version"], { stdio: "ignore" });
      if (!result.error) return candidate;
    } catch {
      // Try the next candidate.
    }
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
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
      await new Promise((resolve) => setTimeout(resolve, 150));
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
      }, 10000);
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
      document.querySelector('nav button[data-view="caregiverPortal"]') &&
      document.querySelector('#viewRoot')?.children.length
    )`);
    if ((ready === "complete" || ready === "interactive") && hasApp) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Demo did not finish rendering the app in time");
}

async function main() {
  assert(fs.existsSync(packageDir), `Public package does not exist: ${packageDir}`);

  const staticServer = createStaticServer(packageDir);
  const serverPort = await listen(staticServer);
  const debugPort = await getFreePort();
  const browserPath = args.browserPath || findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "pacjent360-browser-smoke-"));
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

    const demoUrl = `http://127.0.0.1:${serverPort}/demo.html?browser-smoke=${Date.now()}`;
    await client.call("Page.navigate", { url: demoUrl });
    await waitForReady(client);

    const initial = await client.evaluate(`(() => ({
      title: document.title,
      hasContract: Boolean(window.Patient360Contract),
      hasMapModel: Boolean(window.Patient360MapModel),
      hasPreVisitModel: Boolean(window.Patient360PreVisitModel),
      hasCaregiverModel: Boolean(window.Patient360CaregiverModel),
      hasConsentModel: Boolean(window.Patient360ConsentModel),
      activeView: document.querySelector('nav button.active')?.dataset.view || null,
      watermark: document.body.textContent.includes('DANE FIKCYJNE'),
      independence: document.body.textContent.includes('CeZ') && document.body.textContent.includes('NFZ') && document.body.textContent.includes('IKP')
    }))()`);
    assert(initial.title.includes("Pacjent 360"), "Demo title should contain Pacjent 360");
    assert(initial.hasContract && initial.hasMapModel && initial.hasPreVisitModel && initial.hasCaregiverModel && initial.hasConsentModel, "Browser globals should expose contract, map model, pre-visit model, caregiver model and consent model");
    assert(initial.activeView === "core", `Expected core view, got ${initial.activeView}`);
    assert(initial.watermark, "Demo should show fictional data marker");
    assert(initial.independence, "Demo should show CeZ/NFZ/IKP independence");

    const patient = await client.evaluate(`(() => {
      document.querySelector('nav button[data-view="patientPortal"]').click();
      const steps = [...document.querySelectorAll('.previsit-step')].map((step) => step.textContent.trim().replace(/\\s+/g, ' '));
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        stepCount: steps.length,
        hasSafetyCopy: document.body.textContent.includes('Nie ocenia pilności') && document.body.textContent.includes('nie diagnozuje'),
        hasDocumentsStep: steps.some((text) => text.includes('Dokumenty')),
        hasReportStep: steps.some((text) => text.includes('Podgląd raportu')),
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      };
    })()`);
    assert(patient.activeView === "patientPortal", `Expected patientPortal view, got ${patient.activeView}`);
    assert(patient.stepCount === 6, `Expected 6 pre-visit steps, got ${patient.stepCount}`);
    assert(patient.hasSafetyCopy, "Patient pre-visit flow should keep safety copy");
    assert(patient.hasDocumentsStep && patient.hasReportStep, "Patient pre-visit flow should include documents and report preview steps");
    assert(!patient.hasHorizontalOverflow, "Desktop patient view should not create body horizontal overflow");

    const dialog = await client.evaluate(`(() => {
      document.querySelector('.previsit-step [data-open-dialog="document"]').click();
      const openBefore = Boolean(document.querySelector('dialog[open]'));
      const title = document.querySelector('dialog[open] h2')?.textContent.trim() || '';
      const warning = document.querySelector('dialog[open]')?.textContent.includes('Nie wpisuj realnych danych') || false;
      document.querySelector('dialog[open] [data-close-dialog]').click();
      return {
        openBefore,
        title,
        warning,
        openAfter: Boolean(document.querySelector('dialog[open]'))
      };
    })()`);
    assert(dialog.openBefore, "Document dialog should open");
    assert(dialog.title.includes("Dodaj dokument"), "Document dialog should have expected title");
    assert(dialog.warning, "Document dialog should show privacy/demo warning");
    assert(!dialog.openAfter, "Document dialog should close");

    const report = await client.evaluate(`(() => {
      document.querySelector('.previsit-step [data-set-view="reports"]').click();
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasReport: Boolean(document.querySelector('.context-report')),
        hasKnownUnknown: document.body.textContent.includes('Znane') &&
          document.body.textContent.includes('Nieznane') &&
          document.body.textContent.includes('Niepewne') &&
          document.body.textContent.includes('Do weryfikacji')
      };
    })()`);
    assert(report.activeView === "reports", `Expected reports view, got ${report.activeView}`);
    assert(report.hasReport, "Reports view should render context report");
    assert(report.hasKnownUnknown, "Reports view should include known/unknown/uncertain/to-verify categories in Polish");

    const timeline = await client.evaluate(`(() => {
      document.querySelector('nav button[data-view="timeline"]').click();
      const map = document.querySelector('.temporal-map');
      const summaryZoom = [...document.querySelectorAll('.temporal-summary article')]
        .find((item) => item.textContent.includes('Zoom'))?.querySelector('strong')?.textContent.trim() || '';
      const semanticLevels = [...document.querySelectorAll('[data-timeline-view-level]')].map((button) => ({
        id: button.dataset.timelineViewLevel || '',
        active: button.classList.contains('active')
      }));
      const style = map ? getComputedStyle(map) : null;
      const parsePercent = (value) => {
        const match = String(value || '').match(/(-?\\d+(?:\\.\\d+)?)%/);
        return match ? Number(match[1]) : Number.NaN;
      };
      const eventPositions = [...document.querySelectorAll('.temporal-event')].map((event) => ({
        id: event.dataset.selectTimelineEvent || '',
        left: parsePercent(event.style.getPropertyValue('--event-left')),
        style: event.getAttribute('style') || ''
      }));
      const miniTickPositions = [...document.querySelectorAll('.mini-tick')].map((tick) => ({
        id: tick.dataset.mapEventId || '',
        left: parsePercent(tick.style.left),
        style: tick.getAttribute('style') || ''
      }));
      const inlineStyles = [...document.querySelectorAll('.temporal-map,.temporal-event,.mini-tick,.temporal-today-marker')]
        .map((node) => node.getAttribute('style') || '');
      const cardRects = [...document.querySelectorAll('.temporal-card')].map((card) => {
        const rect = card.getBoundingClientRect();
        return { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
      });
      const eventRects = [...document.querySelectorAll('.temporal-event')].map((event) => {
        const rect = event.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      const bodyText = document.body.textContent || '';
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasMap: Boolean(map),
        summaryZoom,
        semanticLevels,
        stageCount: document.querySelectorAll('.stage-card').length,
        stagePointCount: document.querySelectorAll('.stage-point').length,
        laneCount: document.querySelectorAll('.temporal-lane-band').length,
        laneLabelCount: document.querySelectorAll('.lane-label').length,
        episodeBandCount: document.querySelectorAll('.episode-band').length,
        hasMinimapWindow: Boolean(document.querySelector('.minimap-window')),
        bodyHasNaN: bodyText.includes('NaN'),
        styleHasNaN: Boolean(map?.getAttribute('style')?.includes('NaN')),
        inlineStyles,
        eventPositions,
        miniTickPositions,
        eventWidth: style?.getPropertyValue('--event-width').trim() || '',
        cardWidth: style?.getPropertyValue('--card-width').trim() || '',
        mapHeight: style?.getPropertyValue('--map-height').trim() || '',
        eventCount: document.querySelectorAll('.temporal-event').length,
        cardCount: document.querySelectorAll('.temporal-card').length,
        branchCount: document.querySelectorAll('.temporal-branch').length,
        hasTodayMarker: Boolean(document.querySelector('.temporal-today-marker')),
        cardRects,
        eventRects,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      };
    })()`);
    assert(timeline.activeView === "timeline", `Expected timeline view, got ${timeline.activeView}`);
    assert(timeline.hasMap, "Timeline view should render temporal map");
    assert(!timeline.bodyHasNaN && !timeline.styleHasNaN, "Timeline view must not render NaN values");
    assert(timeline.inlineStyles.every((style) => !style.includes("NaN")), "Timeline inline styles must not contain NaN values");
    assert(timeline.semanticLevels.length === 4 && timeline.semanticLevels.some((item) => item.id === "episode" && item.active), "Timeline should expose four semantic film levels with episode active by default");
    assert(/^\d+%$/.test(timeline.summaryZoom), `Timeline summary zoom should remain a numeric technical value, got ${timeline.summaryZoom}`);
    assert(timeline.stageCount >= 3 && timeline.stagePointCount >= timeline.stageCount, "Timeline should render holistic stage summary cards with sourced points");
    assert(timeline.laneCount >= 3 && timeline.laneLabelCount === timeline.laneCount, "Timeline should render labeled presentation lanes");
    assert(timeline.episodeBandCount >= 1, "Timeline should render episode background bands");
    assert(timeline.hasMinimapWindow, "Timeline minimap should render current-window indicator");
    assert(/^\d+px$/.test(timeline.eventWidth) && /^\d+px$/.test(timeline.cardWidth) && /^\d+px$/.test(timeline.mapHeight), "Timeline geometry CSS variables should be finite px values");
    assert(timeline.eventCount >= 1 && timeline.cardCount === timeline.eventCount && timeline.branchCount === timeline.eventCount, "Timeline events should each render a card and branch");
    assert(timeline.hasTodayMarker, "Timeline should render today marker");
    assert(timeline.eventPositions.length === timeline.miniTickPositions.length, "Timeline and minimap should render the same number of dated points");
    assert(timeline.eventPositions.every((item) => item.id && Number.isFinite(item.left) && item.left >= 0 && item.left <= 100), "Timeline events should expose finite --event-left percentages");
    assert(timeline.miniTickPositions.every((item) => item.id && Number.isFinite(item.left) && item.left >= 0 && item.left <= 100), "Timeline minimap ticks should expose finite left percentages");
    const miniById = new Map(timeline.miniTickPositions.map((item) => [item.id, item.left]));
    assert(timeline.eventPositions.every((item) => miniById.has(item.id) && Math.abs(miniById.get(item.id) - item.left) <= 0.1), "Timeline minimap ticks should align with event positions");
    assert(timeline.cardRects.every((rect) => rect.width >= 120 && Number.isFinite(rect.left) && Number.isFinite(rect.top)), "Timeline cards should have finite positions and usable width");
    assert(timeline.eventRects.every((rect) => rect.width >= 120 && rect.height >= 40), "Timeline event cards should have stable usable dimensions");
    assert(!timeline.hasHorizontalOverflow, "Timeline should scroll inside workbench, not create body horizontal overflow");

    const timelineInteractions = await client.evaluate(`(async () => {
      const pause = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
      const eventsBefore = [...document.querySelectorAll('.temporal-event')].map((event) => ({
        id: event.dataset.selectTimelineEvent || '',
        title: event.querySelector('.temporal-card strong')?.textContent.trim() || '',
        track: event.querySelector('.temporal-track')?.textContent.trim().replace(/\\s+/g, ' ') || ''
      })).filter((event) => event.id);
      const targetEvent = eventsBefore.find((event) => !event.id.startsWith('anchor-')) || eventsBefore[0];
      const targetNode = [...document.querySelectorAll('.temporal-event')]
        .find((event) => event.dataset.selectTimelineEvent === targetEvent?.id);
      if (targetNode) targetNode.click();
      await pause();
      const selectedAfterClick = document.querySelector('.temporal-event.selected')?.dataset.selectTimelineEvent || '';
      const inspectorTitleAfterClick = document.querySelector('.timeline-inspector .inspector-head h3')?.textContent.trim() || '';
      const inspectorHasSources = Boolean(document.querySelector('.timeline-inspector [data-source-ref]'));

      const enabledTrackButton = [...document.querySelectorAll('[data-filter-track]')]
        .find((button) => !button.disabled && !button.classList.contains('active'));
      const selectedTrack = enabledTrackButton?.dataset.filterTrack || '';
      const countBeforeFilter = document.querySelectorAll('.temporal-event').length;
      if (enabledTrackButton) enabledTrackButton.click();
      await pause();
      const activeTrack = document.querySelector('[data-filter-track].active')?.dataset.filterTrack || '';
      const filteredEvents = [...document.querySelectorAll('.temporal-event')].map((event) => ({
        id: event.dataset.selectTimelineEvent || '',
        track: event.querySelector('.temporal-track')?.textContent.trim().replace(/\\s+/g, ' ') || ''
      }));
      const countAfterFilter = filteredEvents.length;
      const filterApplied = Boolean(activeTrack) && activeTrack === selectedTrack && countAfterFilter <= countBeforeFilter &&
        filteredEvents.every((event) => event.track.includes(activeTrack));
      const activeTrackButton = document.querySelector('[data-filter-track].active');
      if (activeTrackButton) activeTrackButton.click();
      await pause();

      const zoomRangeBefore = Number(document.querySelector('[data-timeline-zoom-range]')?.value || 0);
      const zoomButton = [...document.querySelectorAll('[data-timeline-zoom-step]')]
        .find((button) => Number(button.dataset.timelineZoomStep) > 0);
      if (zoomButton) zoomButton.click();
      await pause();
      const zoomRangeAfter = Number(document.querySelector('[data-timeline-zoom-range]')?.value || 0);
      const activeSemanticBeforeVisit = document.querySelector('[data-timeline-view-level].active')?.dataset.timelineViewLevel || '';
      const visitButton = document.querySelector('[data-timeline-view-level="visit"]');
      if (visitButton) visitButton.click();
      await pause();
      const activeSemanticAfterVisit = document.querySelector('[data-timeline-view-level].active')?.dataset.timelineViewLevel || '';
      const stagePoint = document.querySelector('.stage-point[data-select-timeline-event]');
      const stagePointEventId = stagePoint?.dataset.selectTimelineEvent || '';
      if (stagePoint) stagePoint.click();
      await pause();
      const selectedAfterStagePoint = document.querySelector('.temporal-event.selected')?.dataset.selectTimelineEvent || '';

      const scroller = document.querySelector('.temporal-scroll');
      const lastTick = [...document.querySelectorAll('.mini-tick')].at(-1);
      if (scroller) scroller.scrollLeft = 0;
      const scrollBeforeJump = scroller?.scrollLeft || 0;
      if (lastTick) lastTick.click();
      await pause(260);
      const scrollAfterJump = scroller?.scrollLeft || 0;
      const minimapJumpWorked = Boolean(lastTick) && Boolean(scroller) && scrollAfterJump >= scrollBeforeJump;

      const patientSelect = document.querySelector('#patientSelect');
      if (patientSelect) {
        patientSelect.value = 'p2';
        patientSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await pause();
      const p2EventCount = document.querySelectorAll('.temporal-event').length;
      const p2PatientValue = document.querySelector('#patientSelect')?.value || '';
      const p2FirstTitle = document.querySelector('.temporal-event .temporal-card strong')?.textContent.trim() || '';
      if (patientSelect) {
        patientSelect.value = 'p1';
        patientSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await pause();
      return {
        eventsBefore,
        targetEvent,
        selectedAfterClick,
        inspectorTitleAfterClick,
        inspectorHasSources,
        selectedTrack,
        activeTrack,
        countBeforeFilter,
        countAfterFilter,
        filterApplied,
        zoomRangeBefore,
        zoomRangeAfter,
        activeSemanticBeforeVisit,
        activeSemanticAfterVisit,
        stagePointEventId,
        selectedAfterStagePoint,
        scrollBeforeJump,
        scrollAfterJump,
        minimapJumpWorked,
        p2PatientValue,
        p2EventCount,
        p2FirstTitle,
        resetPatientValue: document.querySelector('#patientSelect')?.value || '',
        activeViewAfterReset: document.querySelector('nav button.active')?.dataset.view || null
      };
    })()`);
    assert(timelineInteractions.eventsBefore.length >= 1, "Timeline interaction smoke needs at least one event");
    assert(timelineInteractions.selectedAfterClick === timelineInteractions.targetEvent.id, "Clicking a timeline event should select it");
    assert(timelineInteractions.inspectorTitleAfterClick.includes(timelineInteractions.targetEvent.title), "Timeline inspector should show clicked event title");
    assert(timelineInteractions.inspectorHasSources, "Timeline inspector should expose source chips for selected event");
    assert(timelineInteractions.filterApplied, `Timeline track filter should reduce or preserve events for selected track ${timelineInteractions.selectedTrack}`);
    assert(timelineInteractions.zoomRangeAfter > timelineInteractions.zoomRangeBefore, `Timeline zoom-in should increase range value from ${timelineInteractions.zoomRangeBefore} to ${timelineInteractions.zoomRangeAfter}`);
    assert(timelineInteractions.activeSemanticBeforeVisit === "episode", "Timeline should start interactions from episode semantic level");
    assert(timelineInteractions.activeSemanticAfterVisit === "visit", "Timeline semantic zoom should switch to visit level");
    assert(timelineInteractions.selectedAfterStagePoint === timelineInteractions.stagePointEventId, "Stage summary click should select the linked map event");
    assert(timelineInteractions.minimapJumpWorked, "Timeline minimap click should keep navigator wired to the scroll area");
    assert(timelineInteractions.p2PatientValue === "p2", "Patient switcher should move to p2 during timeline smoke");
    assert(timelineInteractions.p2EventCount === 3, `Switching to p2 should reload map events, got ${timelineInteractions.p2EventCount}`);
    assert(timelineInteractions.p2FirstTitle.length > 0, "Switching patient should render p2 event cards");
    assert(timelineInteractions.resetPatientValue === "p1" && timelineInteractions.activeViewAfterReset === "timeline", "Timeline smoke should reset patient to p1 for later checks");

    const caregiver = await client.evaluate(`(() => {
      document.querySelector('nav button[data-view="caregiverPortal"]').click();
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasHeader: document.body.textContent.includes('Kokpit opiekuna'),
        hasSafetyCopy: document.body.textContent.includes('tylko zakres danych') && document.body.textContent.includes('nie diagnozuje'),
        scopeCount: document.querySelectorAll('.caregiver-scope').length,
        accessCardCount: document.querySelectorAll('.caregiver-access-card').length,
        taskCount: document.querySelectorAll('.caregiver-tasks .record').length,
        revocationCount: document.querySelectorAll('.caregiver-revocation .record').length,
        hasSupportingPerson: document.body.textContent.includes('osoba wspierająca'),
        hasRevokedCaregiver: document.body.textContent.includes('cofnięty')
      };
    })()`);
    assert(caregiver.activeView === "caregiverPortal", `Expected caregiverPortal view, got ${caregiver.activeView}`);
    assert(caregiver.hasHeader && caregiver.hasSafetyCopy, "Caregiver view should show scoped-access safety copy");
    assert(caregiver.scopeCount >= 3, `Caregiver view expected at least 3 scopes, got ${caregiver.scopeCount}`);
    assert(caregiver.accessCardCount >= 6, `Caregiver view expected access cards, got ${caregiver.accessCardCount}`);
    assert(caregiver.taskCount >= 4, `Caregiver view expected organizational tasks, got ${caregiver.taskCount}`);
    assert(caregiver.revocationCount >= 1, "Caregiver view should show revocation effect");
    assert(caregiver.hasSupportingPerson && caregiver.hasRevokedCaregiver, "Caregiver view should show human relation role and revoked access status");

    const consent = await client.evaluate(`(() => {
      document.querySelector('nav button[data-view="consent"]').click();
      const consentSourceChipCount = document.querySelectorAll('button[data-source-ref^="consent:"]').length;
      const consentG1Chip = document.querySelector('button[data-source-ref="consent:g1"]');
      const consentG1Label = consentG1Chip?.textContent.trim() || '';
      if (consentG1Chip) consentG1Chip.click();
      const consentEvidenceTitle = document.querySelector('#evidenceRoot .record-title')?.textContent.trim() || '';
      const consentEvidenceText = document.querySelector('#evidenceRoot')?.textContent || '';
      const addConsentButton = document.querySelector('[data-open-dialog="consent"]');
      if (addConsentButton) addConsentButton.click();
      const formDialog = document.querySelector('#entryDialog');
      const checkboxCount = document.querySelectorAll('#entryDialog .checkbox-option input[type="checkbox"]').length;
      const radioCount = document.querySelectorAll('#entryDialog .radio-option input[type="radio"]').length;
      const defaultRecipient = document.querySelector('#entryDialog input[name="recipientKind"]:checked')?.value || '';
      const initiallyCheckedCount = document.querySelectorAll('#entryDialog .checkbox-option input[type="checkbox"]:checked').length;
      const hasLegacyAreasTextarea = Boolean(document.querySelector('#entryDialog textarea[name="areas"]'));
      const subjectField = document.querySelector('#subject');
      const caregiverField = document.querySelector('#caregiverName');
      const scopeField = document.querySelector('#scope');
      const medicationArea = document.querySelector('#consentArea_medications');
      const visitArea = document.querySelector('#consentArea_visits');
      const documentArea = document.querySelector('#consentArea_documents');
      const reportArea = document.querySelector('#consentArea_report');
      if (subjectField) subjectField.value = 'Blokada bez zakresu';
      if (caregiverField) caregiverField.value = 'Opiekun testowy';
      if (scopeField) scopeField.value = 'opis zawiera leki i wizyty, ale bez checkboxów';
      if (formDialog?.open) document.querySelector('#dialogForm').requestSubmit();
      const storedAfterBlocked = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}');
      const blockedConsentSaved = (storedAfterBlocked.consents || []).some((item) => item.subject === 'Blokada bez zakresu');
      const blockedDialogStillOpen = Boolean(formDialog?.open);
      if (subjectField) subjectField.value = 'Test zakresu zgody';
      if (scopeField) scopeField.value = 'opis zawiera wizyty i dokumenty, ale zakres kontrolują checkboxy';
      if (medicationArea) medicationArea.checked = true;
      if (visitArea) visitArea.checked = false;
      if (documentArea) documentArea.checked = false;
      if (reportArea) reportArea.checked = true;
      if (formDialog?.open) document.querySelector('#dialogForm').requestSubmit();
      const createModal = document.querySelector('#confirmDialog');
      const createModalText = createModal?.textContent || '';
      const createPreviewOpened = Boolean(createModal?.open);
      const createPreviewHasRecipient = createModalText.includes('Test zakresu zgody');
      const createPreviewHasScope = createModalText.includes('Leki') && createModalText.includes('Raport') &&
        !createModalText.includes('Wizyty') && !createModalText.includes('Dokumenty');
      const createPreviewHasNeutralCopy = createModalText.includes('Opis pola') && createModalText.includes('nie rozszerza obszarów dostępu');
      const createPreviewAvoidsForbiddenPhrases = ['zalecamy', 'rekomendujemy', 'pilnie', 'triage', 'diagnoza']
        .every((phrase) => !createModalText.toLowerCase().includes(phrase));
      const createSecondaryButton = document.querySelector('#confirmSecondaryAction');
      const createSecondaryText = createSecondaryButton?.textContent.trim() || '';
      if (createSecondaryButton) createSecondaryButton.click();
      const storedAfterReturn = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}');
      const savedAfterReturn = (storedAfterReturn.consents || []).some((item) => item.subject === 'Test zakresu zgody');
      const createReturnToEdit = Boolean(document.querySelector('#entryDialog')?.open) && !document.querySelector('#confirmDialog')?.open;
      const createReturnPreservedFields =
        document.querySelector('#subject')?.value === 'Test zakresu zgody' &&
        document.querySelector('#scope')?.value.includes('wizyty') &&
        document.querySelector('#consentArea_medications')?.checked === true &&
        document.querySelector('#consentArea_report')?.checked === true;
      if (document.querySelector('#entryDialog')?.open) document.querySelector('#dialogForm').requestSubmit();
      const createConfirmButton = document.querySelector('#confirmAction');
      if (createConfirmButton) createConfirmButton.click();
      const storedAfterAdd = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}');
      const addedConsent = (storedAfterAdd.consents || []).find((item) => item.subject === 'Test zakresu zgody');
      const secondAddButton = document.querySelector('[data-open-dialog="consent"]');
      if (secondAddButton) secondAddButton.click();
      const patientRecipient = document.querySelector('#recipientKind_patient');
      const patientScope = document.querySelector('#scope');
      const patientObservations = document.querySelector('#consentArea_observations');
      const patientReport = document.querySelector('#consentArea_report');
      if (patientRecipient) patientRecipient.checked = true;
      if (patientScope) patientScope.value = 'Pacjent sprawdza własny raport';
      if (patientObservations) patientObservations.checked = true;
      if (patientReport) patientReport.checked = true;
      if (document.querySelector('#entryDialog')?.open) document.querySelector('#dialogForm').requestSubmit();
      const patientCreateModal = document.querySelector('#confirmDialog');
      const patientPreviewOpened = Boolean(patientCreateModal?.open);
      const patientPreviewText = patientCreateModal?.textContent || '';
      const patientPreviewHasRole = patientPreviewText.includes('Pacjent') && patientPreviewText.includes('pacjent');
      const patientConfirmButton = document.querySelector('#confirmAction');
      if (patientConfirmButton) patientConfirmButton.click();
      const storedAfterPatient = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}');
      const addedPatientConsent = (storedAfterPatient.consents || []).find((item) => item.scope === 'Pacjent sprawdza własny raport');
      const beforeButtons = document.querySelectorAll('[data-revoke]').length;
      const firstRevoke = document.querySelector('[data-revoke]');
      if (firstRevoke) firstRevoke.click();
      const modal = document.querySelector('#confirmDialog');
      const modalText = modal?.textContent || '';
      const modalOpened = Boolean(modal?.open);
      const buttonsAfterOpen = document.querySelectorAll('[data-revoke]').length;
      const forbiddenPhrases = ['zalecamy', 'rekomendujemy', 'pilnie', 'triage', 'diagnoza'];
      const cancelButton = document.querySelector('#confirmSecondaryAction');
      const revokeSecondaryText = cancelButton?.textContent.trim() || '';
      if (cancelButton) cancelButton.click();
      const cancelClosedDialog = !document.querySelector('#confirmDialog')?.open;
      const buttonsAfterCancel = document.querySelectorAll('[data-revoke]').length;
      const firstRevokeAfterCancel = document.querySelector('[data-revoke]');
      if (firstRevokeAfterCancel) firstRevokeAfterCancel.click();
      const confirmButton = document.querySelector('#confirmAction');
      if (confirmButton) confirmButton.click();
      const stored = JSON.parse(localStorage.getItem('pacjent360-state-v7') || '{}');
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasSafetyCopy: document.body.textContent.includes('tylko zakres danych') && document.body.textContent.includes('nie diagnozuje'),
        hasMatrix: Boolean(document.querySelector('.consent-scope-table table')),
        hasDeniedState: [...document.querySelectorAll('.consent-scope-table .status-chip')].some((node) => node.textContent.trim() === 'nie'),
        consentSourceChipCount,
        consentG1Label,
        consentEvidenceTitle,
        consentEvidenceText,
        consentFormOpened: Boolean(formDialog),
        consentAreaCheckboxCount: checkboxCount,
        consentRecipientRadioCount: radioCount,
        consentDefaultRecipientIsSupport: defaultRecipient === 'support',
        consentAreaInitiallyUnchecked: initiallyCheckedCount === 0,
        consentFormRemovedLegacyTextarea: !hasLegacyAreasTextarea,
        blockedConsentSaved,
        blockedDialogStillOpen,
        createPreviewOpened,
        createPreviewHasRecipient,
        createPreviewHasScope,
        createPreviewHasNeutralCopy,
        createPreviewAvoidsForbiddenPhrases,
        createSecondaryText,
        createReturnToEdit,
        createReturnPreservedFields,
        savedAfterReturn,
        addedConsentAreas: addedConsent?.areas || [],
        addedConsentRole: addedConsent?.role || '',
        addedConsentSourceRefs: addedConsent?.sourceRefs || [],
        addedConsentId: addedConsent?.id || '',
        patientPreviewOpened,
        patientPreviewHasRole,
        addedPatientConsent: addedPatientConsent ? {
          subject: addedPatientConsent.subject,
          role: addedPatientConsent.role,
          caregiverName: addedPatientConsent.caregiverName,
          caregiverId: addedPatientConsent.caregiverId,
          areas: addedPatientConsent.areas || [],
          sourceRefs: addedPatientConsent.sourceRefs || [],
          id: addedPatientConsent.id
        } : null,
        beforeButtons,
        modalOpened,
        modalHasRecipient: modalText.includes('Potwierdź cofnięcie dostępu dla:'),
        modalHasScopePreview: modalText.includes('Zakres zgody') || modalText.includes('Leki') || modalText.includes('Wizyty') || modalText.includes('Dokumenty'),
        modalHasNeutralEffect: modalText.includes('Po cofnięciu zgody') && modalText.includes('nie usuwa danych pacjenta'),
        modalAvoidsForbiddenPhrases: forbiddenPhrases.every((phrase) => !modalText.toLowerCase().includes(phrase)),
        buttonsAfterOpen,
        revokeSecondaryText,
        cancelClosedDialog,
        buttonsAfterCancel,
        afterButtons: document.querySelectorAll('[data-revoke]').length,
        auditSaved: (stored.audit || []).some((entry) => String(entry.action || '').includes('zgod') && String(entry.scope || '').length > 0),
        hasNoOneClickRestoreCopy: document.body.textContent.includes('nowa zgoda wymaga zakresu i daty'),
        hasRevocationEffect: document.body.textContent.includes('Po cofnięciu zgody')
      };
    })()`);
    assert(consent.activeView === "consent", `Expected consent view, got ${consent.activeView}`);
    assert(consent.hasSafetyCopy && consent.hasMatrix, "Consent view should show scoped safety copy and matrix");
    assert(consent.hasDeniedState, "Consent matrix should show denied areas without leaking hidden details");
    assert(consent.consentSourceChipCount >= 4, `Consent view should render consent source chips, got ${consent.consentSourceChipCount}`);
    assert(consent.consentG1Label.includes("Zgoda:"), `Consent source chip should use user-facing label, got ${consent.consentG1Label}`);
    assert(consent.consentEvidenceTitle.includes("Zgoda:"), `Consent source chip should open evidence card, got ${consent.consentEvidenceTitle}`);
    assert(consent.consentEvidenceText.includes("Poradnia kwalifikacyjna") && consent.consentEvidenceText.includes("raport kontekstowy"), "Consent evidence card should show consent context");
    assert(consent.consentFormOpened, "Consent add dialog should open from consent view");
    assert(consent.consentAreaCheckboxCount >= 7, `Consent dialog should expose area checkboxes, got ${consent.consentAreaCheckboxCount}`);
    assert(consent.consentRecipientRadioCount === 2 && consent.consentDefaultRecipientIsSupport, "Consent dialog should distinguish support recipient from patient");
    assert(consent.consentAreaInitiallyUnchecked, "Consent area checkboxes should not be preselected");
    assert(consent.consentFormRemovedLegacyTextarea, "Consent dialog should not use free-text areas field");
    assert(!consent.blockedConsentSaved && consent.blockedDialogStillOpen, "Consent save without selected area should be blocked");
    assert(consent.createPreviewOpened, "Consent submit should open create preview before saving");
    assert(consent.createPreviewHasRecipient && consent.createPreviewHasScope, "Consent create preview should show recipient and selected areas only");
    assert(consent.createPreviewHasNeutralCopy && consent.createPreviewAvoidsForbiddenPhrases, "Consent create preview should use neutral non-clinical wording");
    assert(consent.createSecondaryText.includes("edycji"), "Consent create preview should offer return to edit");
    assert(consent.createReturnToEdit && consent.createReturnPreservedFields, "Return to edit should reopen the filled consent form");
    assert(!consent.savedAfterReturn, "Return to edit should not save consent");
    assert(consent.addedConsentAreas.includes("medications") && consent.addedConsentAreas.includes("report"), "Added consent should persist selected area keys");
    assert(!consent.addedConsentAreas.includes("visits") && !consent.addedConsentAreas.includes("documents"), "Unchecked consent areas should not be persisted");
    assert(consent.addedConsentRole !== "pacjent", "Support consent should not be saved as patient role");
    assert(consent.addedConsentSourceRefs.includes(`consent:${consent.addedConsentId}`), "Added support consent should persist consent self-reference");
    assert(consent.patientPreviewOpened && consent.patientPreviewHasRole, "Patient consent should also show create preview");
    assert(consent.addedPatientConsent?.subject === "Pacjent" && consent.addedPatientConsent?.role === "pacjent", "Patient recipient should save as patient role");
    assert(consent.addedPatientConsent?.caregiverId === "patient-self-p1", "Patient recipient should use stable patient-self caregiver id");
    assert(consent.addedPatientConsent?.areas.includes("observations") && consent.addedPatientConsent?.areas.includes("report"), "Patient recipient should persist selected areas");
    assert(consent.addedPatientConsent?.sourceRefs.includes(`consent:${consent.addedPatientConsent?.id}`), "Added patient consent should persist consent self-reference");
    assert(consent.beforeButtons >= 1, "Consent view should expose revoke action for active consents");
    assert(consent.modalOpened, "Revoke action should open confirmation dialog before changing consent status");
    assert(consent.modalHasRecipient && consent.modalHasScopePreview, "Confirmation dialog should show recipient, role/date and scope preview");
    assert(consent.modalHasNeutralEffect && consent.modalAvoidsForbiddenPhrases, "Confirmation dialog should use neutral non-clinical wording");
    assert(consent.buttonsAfterOpen === consent.beforeButtons, "Opening confirmation dialog must not revoke consent immediately");
    assert(consent.revokeSecondaryText.includes("Anuluj"), "Revoke confirmation should keep cancel action");
    assert(consent.cancelClosedDialog && consent.buttonsAfterCancel === consent.beforeButtons, "Cancel should close dialog without revoking consent");
    assert(consent.afterButtons < consent.beforeButtons, "Revoked consent should not become one-click restore");
    assert(consent.auditSaved, "Confirmed revocation should be stored in audit trail");
    assert(consent.hasNoOneClickRestoreCopy && consent.hasRevocationEffect, "Consent view should explain explicit re-consent after revocation");

    await client.call("Emulation.setDeviceMetricsOverride", {
      width: 360,
      height: 740,
      deviceScaleFactor: 1,
      mobile: true
    });
    await client.call("Page.navigate", { url: `http://127.0.0.1:${serverPort}/demo.html?mobile-smoke=${Date.now()}` });
    await waitForReady(client);
    const mobile = await client.evaluate(`(() => {
      document.querySelector('nav button[data-view="patientPortal"]').click();
      const grid = document.querySelector('.previsit-step-grid');
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        stepCount: document.querySelectorAll('.previsit-step').length,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : ''
      };
    })()`);
    assert(mobile.activeView === "patientPortal", "Mobile smoke should open patient portal");
    assert(mobile.stepCount === 6, `Mobile smoke expected 6 steps, got ${mobile.stepCount}`);
    assert(!mobile.hasHorizontalOverflow, "Mobile patient view should not create body horizontal overflow");
    assert(!mobile.gridColumns.includes(" ") || mobile.gridColumns.split(" ").length <= 1, `Mobile pre-visit grid should be one column, got ${mobile.gridColumns}`);

    const mobileTimeline = await client.evaluate(`(() => {
      document.querySelector('nav button[data-view="timeline"]').click();
      const map = document.querySelector('.temporal-map');
      const event = document.querySelector('.temporal-event');
      const card = document.querySelector('.temporal-card');
      const scroll = document.querySelector('.temporal-scroll');
      const eventRect = event?.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();
      const bodyText = document.body.textContent || '';
      const inlineStyles = [...document.querySelectorAll('.temporal-map,.temporal-event,.mini-tick,.temporal-today-marker')]
        .map((node) => node.getAttribute('style') || '');
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasMap: Boolean(map),
        bodyHasNaN: bodyText.includes('NaN'),
        inlineHasNaN: inlineStyles.some((style) => style.includes('NaN')),
        stageCount: document.querySelectorAll('.stage-card').length,
        laneCount: document.querySelectorAll('.temporal-lane-band').length,
        eventWidth: eventRect?.width || 0,
        eventHeight: eventRect?.height || 0,
        cardWidth: cardRect?.width || 0,
        cardLeft: cardRect?.left || 0,
        scrollsInsideMap: scroll ? scroll.scrollWidth > scroll.clientWidth : false,
        hasBodyOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      };
    })()`);
    assert(mobileTimeline.activeView === "timeline", "Mobile timeline smoke should open timeline view");
    assert(mobileTimeline.hasMap, "Mobile timeline should render temporal map");
    assert(!mobileTimeline.bodyHasNaN && !mobileTimeline.inlineHasNaN, "Mobile timeline must not render NaN values");
    assert(mobileTimeline.stageCount >= 1 && mobileTimeline.laneCount >= 1, "Mobile timeline should keep stage summary and lanes");
    assert(mobileTimeline.eventWidth >= 120 && mobileTimeline.eventHeight >= 40, "Mobile timeline event cards should keep usable dimensions");
    assert(mobileTimeline.cardWidth >= 120 && Number.isFinite(mobileTimeline.cardLeft), "Mobile timeline cards should keep finite usable dimensions");
    assert(mobileTimeline.scrollsInsideMap, "Mobile timeline should scroll inside the temporal workbench");
    assert(!mobileTimeline.hasBodyOverflow, "Mobile timeline should not create body horizontal overflow");

    const browserIssues = client.events.filter((event) => {
      if (event.method === "Runtime.exceptionThrown") return true;
      if (event.method === "Log.entryAdded") {
        const level = event.params?.entry?.level;
        return level === "error";
      }
      return false;
    });
    assert(browserIssues.length === 0, `Browser reported errors: ${JSON.stringify(browserIssues.slice(0, 3))}`);

    console.log(`Browser smoke passed: ${demoUrl}`);
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
