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
    await client.call("Emulation.setDeviceMetricsOverride", {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    const demoUrl = `http://127.0.0.1:${serverPort}/demo.html?browser-smoke=${Date.now()}`;
    await client.call("Page.navigate", { url: demoUrl });
    await waitForReady(client);

    const initial = await client.evaluate(`(() => ({
      title: document.title,
      hasContract: Boolean(window.Patient360Contract),
      hasFormat: Boolean(window.Patient360Format),
      hasMapModel: Boolean(window.Patient360MapModel),
      hasDemoData: Boolean(window.Patient360DemoData),
      hasPreVisitModel: Boolean(window.Patient360PreVisitModel),
      hasCaregiverModel: Boolean(window.Patient360CaregiverModel),
      hasConsentModel: Boolean(window.Patient360ConsentModel),
      activeView: document.querySelector('nav button.active')?.dataset.view || null,
      register: document.body.dataset.register || '',
      hasPerspectiveDemo: document.body.textContent.includes('Jedna historia, trzy perspektywy') && document.querySelectorAll('[data-select-role]').length === 3,
      scenarioChoicesVisible: document.querySelectorAll('[data-start-patient]').length,
      hasPerspectiveOnlyPage: document.body.textContent.includes('Z jakiej perspektywy oglądasz historię?') && !document.body.textContent.includes('Pacjenci demonstracyjni'),
      watermark: document.body.textContent.includes('DANE FIKCYJNE'),
      independence: document.body.textContent.includes('CeZ') && document.body.textContent.includes('NFZ') && document.body.textContent.includes('IKP')
    }))()`);
    assert(initial.title.includes("Pacjent360"), "Demo title should contain Pacjent360");
    assert(initial.hasContract && initial.hasFormat && initial.hasMapModel && initial.hasDemoData && initial.hasPreVisitModel && initial.hasCaregiverModel && initial.hasConsentModel, "Browser globals should expose contract, format, map model, demo data, pre-visit model, caregiver model and consent model");
    assert(initial.activeView === "roleStart", `Expected roleStart view, got ${initial.activeView}`);
    assert(initial.register === "app", `Expected neutral app register on role start, got ${initial.register}`);
    assert(initial.hasPerspectiveDemo && initial.hasPerspectiveOnlyPage && initial.scenarioChoicesVisible === 0, "Demo should start with a perspective-only page and no patient choices");
    assert(initial.watermark, "Demo should show fictional data marker");
    assert(initial.independence, "Demo should show CeZ/NFZ/IKP independence");

    const roleStart = await client.evaluate(`(() => {
      const doctorRole = document.querySelector('[data-select-role="doctor"]');
      if (doctorRole) doctorRole.click();
      const scenarioCount = document.querySelectorAll('[data-start-patient]').length;
      const roleChoiceCount = document.querySelectorAll('[data-select-role]').length;
      const hasSubpage = document.body.textContent.includes('Krok 2: wybierz pacjenta') && document.body.textContent.includes('Zmień perspektywę');
      const doctorJan = document.querySelector('[data-start-role="doctor"][data-start-patient="p1"]');
      if (doctorJan) doctorJan.click();
      return {
        roleFound: Boolean(doctorRole),
        scenarioCount,
        roleChoiceCount,
        hasSubpage,
        found: Boolean(doctorJan),
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        role: JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}').activeRole || '',
        patient: document.querySelector('#patientSelect')?.value || '',
        hasDoctorBrief: (document.querySelector('#viewRoot')?.textContent || '').toLowerCase().includes('kontekst w 90 sekund') || false
      };
    })()`);
    assert(roleStart.roleFound && roleStart.hasSubpage && roleStart.scenarioCount === 3 && roleStart.roleChoiceCount === 0 && roleStart.found && roleStart.activeView === "core" && roleStart.role === "doctor" && roleStart.patient === "p1" && roleStart.hasDoctorBrief, `Guided perspective demo should show a step-2 subpage before entering doctor cockpit for Jan: ${JSON.stringify(roleStart)}`);

    const core = await client.evaluate(`(() => ({
      activeView: document.querySelector('nav button.active')?.dataset.view || null,
      scrollHeight: document.body.scrollHeight,
      hasMapShortcut: Boolean(document.querySelector('.core-map-shortcut')),
      hasEmbeddedMap: Boolean(document.querySelector('.patient-map360.embedded')),
      hasMedReconciliation: Boolean(document.querySelector('.med-reconciliation')),
      hasSpecialtyLensPanel: Boolean(document.querySelector('.specialty-lens-panel')),
      specialtyLensCount: document.querySelectorAll('[data-specialty-lens]').length,
      activeSpecialtyLens: document.querySelector('[data-specialty-lens].active')?.dataset.specialtyLens || '',
      register: document.body.dataset.register || '',
      hasLedgerSourceChip: Boolean(document.querySelector('.source-chip.p360-source-chip')),
      journeyStepCount: document.querySelectorAll('.demo-journey-step').length,
      activeJourneyStep: document.querySelector('.demo-journey-step.active strong')?.textContent.trim() || '',
      hasJourneyBack: [...document.querySelectorAll('.demo-journey-actions button')].some((button) => button.textContent.includes('Wróć')),
      hasJourneyNext: [...document.querySelectorAll('.demo-journey-actions button')].some((button) => button.textContent.includes('Dalej: Historia pacjenta')),
      hasMapAction: [...document.querySelectorAll('.demo-journey-actions button')].some((button) => button.textContent.includes('Zobacz zdarzenia'))
    }))()`);
    assert(core.activeView === "core", `Expected core view for 90-second dashboard, got ${core.activeView}`);
    assert(core.scrollHeight <= 3000, `Core dashboard should stay within 90-second height budget, got ${core.scrollHeight}px`);
    assert(core.hasMapShortcut && !core.hasEmbeddedMap, "Core dashboard should use a map shortcut instead of embedding the full map");
    assert(core.hasMedReconciliation, "Core dashboard should keep medication reconciliation visible");
    assert(core.hasSpecialtyLensPanel && core.specialtyLensCount >= 5 && core.activeSpecialtyLens === "internist", `Core dashboard should expose specialty lens selector: ${JSON.stringify(core)}`);
    assert(core.register === "doctor", `Core dashboard should use doctor visual register, got ${core.register}`);
    assert(core.hasLedgerSourceChip, "Core dashboard should render Trust OS ledger source chips");
    assert(core.journeyStepCount === 6 && core.activeJourneyStep === "Kokpit" && core.hasJourneyBack && core.hasJourneyNext && core.hasMapAction, `Core dashboard should expose guided demo journey: ${JSON.stringify(core)}`);

    const specialtyLens = await client.evaluate(`(() => {
      const stateFromStorage = () => JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
      const cardiology = document.querySelector('[data-specialty-lens="cardiology"]');
      if (cardiology) cardiology.click();
      return {
        clicked: Boolean(cardiology),
        storedLens: stateFromStorage().specialist || '',
        activeLens: document.querySelector('[data-specialty-lens].active')?.dataset.specialtyLens || '',
        title: document.querySelector('.dashboard-orchestrator h2')?.textContent.trim() || '',
        hasSafetyCopy: (document.querySelector('.specialty-lens-panel')?.textContent || '').includes('nie ocenia pilności')
      };
    })()`);
    assert(specialtyLens.clicked && specialtyLens.storedLens === "cardiology" && specialtyLens.activeLens === "cardiology", `Specialty lens selector should persist cardiology lens: ${JSON.stringify(specialtyLens)}`);
    assert(specialtyLens.title.includes("Kardiolog") && specialtyLens.hasSafetyCopy, `Cardiology lens should update dashboard wording without urgency language: ${JSON.stringify(specialtyLens)}`);

    const journey = await client.evaluate(`(() => {
      const stateFromStorage = () => JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
      const click = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return false;
        node.click();
        return true;
      };
      const nextMapClicked = click('.demo-journey-actions [data-journey-step="map"]');
      const afterMap = {
        activeView: stateFromStorage().activeView || '',
        activeStep: document.querySelector('.demo-journey-step.active strong')?.textContent.trim() || '',
        hasTimeline: Boolean(document.querySelector('.history-v2'))
      };
      const nextDataClicked = click('.demo-journey-actions [data-journey-step="data"]');
      const afterData = {
        activeView: stateFromStorage().activeView || '',
        activeStep: document.querySelector('.demo-journey-step.active strong')?.textContent.trim() || '',
        hasDocuments: (document.querySelector('#viewRoot')?.textContent || '').includes('Rejestr dokumentów')
      };
      const scenarioClicked = click('.demo-journey-step[data-journey-step="scenario"]');
      const afterScenario = {
        activeView: stateFromStorage().activeView || '',
        roleSelectionConfirmed: Boolean(stateFromStorage().roleSelectionConfirmed),
        hasScenarioCards: document.querySelectorAll('[data-start-patient]').length === 3
      };
      const backToCoreClicked = click('[data-start-role="doctor"][data-start-patient="p1"]');
      const afterReturn = {
        activeView: stateFromStorage().activeView || '',
        role: stateFromStorage().activeRole || '',
        patient: stateFromStorage().activePatientId || '',
        activeStep: document.querySelector('.demo-journey-step.active strong')?.textContent.trim() || ''
      };
      return { nextMapClicked, afterMap, nextDataClicked, afterData, scenarioClicked, afterScenario, backToCoreClicked, afterReturn };
    })()`);
    assert(journey.nextMapClicked && journey.afterMap.activeView === "timeline" && journey.afterMap.activeStep === "Historia pacjenta" && journey.afterMap.hasTimeline, `Journey next should open patient history: ${JSON.stringify(journey.afterMap)}`);
    assert(journey.nextDataClicked && journey.afterData.activeView === "documents" && journey.afterData.activeStep === "Dane / źródła" && journey.afterData.hasDocuments, `Journey data step should open sources/documents: ${JSON.stringify(journey.afterData)}`);
    assert(journey.scenarioClicked && journey.afterScenario.activeView === "roleStart" && journey.afterScenario.roleSelectionConfirmed && journey.afterScenario.hasScenarioCards, `Journey scenario step should return to patient scenario subpage: ${JSON.stringify(journey.afterScenario)}`);
    assert(journey.backToCoreClicked && journey.afterReturn.activeView === "core" && journey.afterReturn.role === "doctor" && journey.afterReturn.patient === "p1" && journey.afterReturn.activeStep === "Kokpit", `Journey return should restore doctor cockpit for smoke checks: ${JSON.stringify(journey.afterReturn)}`);

    const cockpitSidebar = await client.evaluate(`(() => {
      const setPatient = (patientId) => {
        const select = document.querySelector('#patientSelect');
        if (!select) return;
        select.value = patientId;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const stateFromStorage = () => JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
      const snapshot = () => ({
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        activeNav: document.querySelector('nav button.active span')?.textContent.trim() || '',
        role: stateFromStorage().activeRole || '',
        patient: document.querySelector('#patientSelect')?.value || '',
        h1: document.querySelector('#viewRoot h1')?.textContent.trim() || '',
        text: (document.querySelector('#viewRoot')?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 700),
        search: document.querySelector('#searchInput')?.value || '',
        libraryHeading: document.querySelector('[data-nav-section="library"]')?.textContent.trim() || '',
        libraryLabels: [...document.querySelectorAll('nav .nav-item:not(.cockpit-nav):not([data-view="roleStart"])')]
          .filter((button) => !button.hidden && button.getAttribute('aria-hidden') !== 'true')
          .map((button) => button.querySelector('span')?.textContent.trim() || '')
      });
      setPatient('p1');
      document.querySelector('nav button[data-view="core"]')?.click();
      const doctor = snapshot();
      const input = document.querySelector('#searchInput');
      if (input) {
        input.value = 'ator';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      document.querySelector('nav button[data-view="patientPortal"]')?.click();
      const patient = snapshot();
      document.querySelector('nav button[data-view="caregiverPortal"]')?.click();
      const caregiver = snapshot();
      document.querySelector('nav button[data-view="core"]')?.click();
      const finalDoctor = snapshot();
      return { doctor, patient, caregiver, finalDoctor };
    })()`);
    assert(cockpitSidebar.doctor.role === "doctor" && cockpitSidebar.doctor.activeView === "core" && cockpitSidebar.doctor.h1.includes("Lekarz360"), `Sidebar Lekarz360 should open doctor cockpit: ${JSON.stringify(cockpitSidebar.doctor)}`);
    assert(cockpitSidebar.patient.role === "patient" && cockpitSidebar.patient.activeView === "patientPortal" && cockpitSidebar.patient.patient === "p1" && cockpitSidebar.patient.h1.includes("Pacjent360"), `Sidebar Pacjent360 should switch role and preserve patient: ${JSON.stringify(cockpitSidebar.patient)}`);
    assert(cockpitSidebar.patient.search === "", "Switching cockpit should clear active search so the next cockpit is not accidentally filtered");
    assert(cockpitSidebar.caregiver.role === "caregiver" && cockpitSidebar.caregiver.activeView === "caregiverPortal" && cockpitSidebar.caregiver.patient === "p1" && cockpitSidebar.caregiver.h1.includes("Opiekun360"), `Sidebar Opiekun360 should switch role and preserve patient: ${JSON.stringify(cockpitSidebar.caregiver)}`);
    assert(cockpitSidebar.doctor.text !== cockpitSidebar.patient.text && cockpitSidebar.patient.text !== cockpitSidebar.caregiver.text, "Sidebar cockpit switches should visibly change cockpit content");
    assert(cockpitSidebar.finalDoctor.role === "doctor" && cockpitSidebar.finalDoctor.activeView === "core", "Sidebar should switch back to Lekarz360 for later smoke checks");
    assert(cockpitSidebar.doctor.libraryHeading === "Dane i źródła" && cockpitSidebar.doctor.libraryLabels.includes("Pytania") && cockpitSidebar.doctor.libraryLabels.includes("Podsumowanie"), `Doctor sidebar library should expose context items with canonical labels: ${JSON.stringify(cockpitSidebar.doctor.libraryLabels)}`);
    assert(cockpitSidebar.patient.libraryHeading === "Dane i źródła" && cockpitSidebar.patient.libraryLabels.includes("Dokumenty") && !cockpitSidebar.patient.libraryLabels.includes("Pytania") && !cockpitSidebar.patient.libraryLabels.includes("Podsumowanie"), `Patient sidebar library should hide doctor-only items but keep canonical labels: ${JSON.stringify(cockpitSidebar.patient.libraryLabels)}`);
    assert(cockpitSidebar.caregiver.libraryHeading === "Dane i źródła" && cockpitSidebar.caregiver.libraryLabels.includes("Zgody") && !cockpitSidebar.caregiver.libraryLabels.includes("Pytania") && !cockpitSidebar.caregiver.libraryLabels.includes("Podsumowanie"), `Caregiver sidebar library should be scoped to consent with canonical labels: ${JSON.stringify(cockpitSidebar.caregiver.libraryLabels)}`);

    const caregiverNoConsentSidebar = await client.evaluate(`(() => {
      const setPatient = (patientId) => {
        const select = document.querySelector('#patientSelect');
        if (!select) return;
        select.value = patientId;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };
      setPatient('p2');
      document.querySelector('nav button[data-view="caregiverPortal"]')?.click();
      const labels = [...document.querySelectorAll('nav .nav-item:not(.cockpit-nav):not([data-view="roleStart"])')]
        .filter((button) => !button.hidden && button.getAttribute('aria-hidden') !== 'true')
        .map((button) => button.querySelector('span')?.textContent.trim() || '');
      const heading = document.querySelector('[data-nav-section="library"]')?.textContent.trim() || '';
      setPatient('p1');
      document.querySelector('nav button[data-view="core"]')?.click();
      return { heading, labels };
    })()`);
    assert(caregiverNoConsentSidebar.heading === "Dane i źródła" && caregiverNoConsentSidebar.labels.length === 1 && caregiverNoConsentSidebar.labels[0] === "Zgody", `Caregiver without active consent should only see consent scope in sidebar: ${JSON.stringify(caregiverNoConsentSidebar)}`);

    const patientSwitch = await client.evaluate(`(() => {
      const setPatient = (patientId) => {
        const select = document.querySelector('#patientSelect');
        if (!select) return '';
        select.value = patientId;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return document.querySelector('#viewRoot')?.textContent || '';
      };
      document.querySelector('[data-role-switch="doctor"]')?.click();
      const p2Core = setPatient('p2');
      document.querySelector('[data-role-switch="patient"]')?.click();
      const p2Patient = document.querySelector('#viewRoot')?.textContent || '';
      document.querySelector('[data-role-switch="doctor"]')?.click();
      const p3Core = setPatient('p3');
      document.querySelector('nav button[data-view="timeline"]')?.click();
      const p3Timeline = document.querySelector('#viewRoot')?.textContent || '';
      setPatient('p1');
      document.querySelector('[data-role-switch="doctor"]')?.click();
      return { p2Core, p2Patient, p3Core, p3Timeline };
    })()`);
    assert(patientSwitch.p2Core.includes("Atorwastatyna") && !patientSwitch.p2Core.includes("Lek wymagajÄ…cy decyzji przed procedurÄ…"), "Switching to patient p2 should refresh doctor cockpit content");
    assert(patientSwitch.p2Patient.includes("Andrzej K.") && patientSwitch.p2Patient.includes("kardiologiczna"), "Switching to patient p2 should refresh patient portal content");
    assert(patientSwitch.p3Core.includes("Maja N.") && patientSwitch.p3Core.includes("infekcji"), "Switching to patient p3 should refresh doctor cockpit content");
    assert(patientSwitch.p3Timeline.includes("Porada pediatryczna") && !patientSwitch.p3Timeline.includes("Atorwastatyna"), "Switching to patient p3 should refresh timeline content");

    const patient = await client.evaluate(`(() => {
      document.querySelector('[data-role-switch="patient"]')?.click();
      const steps = [...document.querySelectorAll('.previsit-step')].map((step) => step.textContent.trim().replace(/\\s+/g, ' '));
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        register: document.body.dataset.register || '',
        scrollHeight: document.body.scrollHeight,
        stepCount: steps.length,
        hasNowPanel: Boolean(document.querySelector('.patient-now-panel')),
        hasEmbeddedMap: Boolean(document.querySelector('.patient-map360.embedded')),
        hasSafetyCopy: document.body.textContent.toLowerCase().includes('nie diagnozuje'),
        hasDocumentsStep: steps.some((text) => text.includes('Dokumenty')),
        hasConsentStep: steps.some((text) => text.includes('Zgody')),
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      };
    })()`);
    assert(patient.activeView === "patientPortal", `Expected patientPortal view, got ${patient.activeView}`);
    assert(patient.register === "patient", `Patient portal should use patient visual register, got ${patient.register}`);
    assert(patient.scrollHeight <= 3500, `Patient portal desktop should stay within first-screen workflow budget, got ${patient.scrollHeight}px`);
    assert(patient.hasNowPanel && !patient.hasEmbeddedMap, "Patient portal should show next-step panel and avoid embedding full map");
    assert(patient.stepCount === 6, `Expected 6 pre-visit steps, got ${patient.stepCount}`);
    assert(patient.hasSafetyCopy, "Patient pre-visit flow should keep safety copy");
    assert(patient.hasDocumentsStep && patient.hasConsentStep, "Patient pre-visit flow should include documents and consent steps");
    assert(!patient.hasHorizontalOverflow, "Desktop patient view should not create body horizontal overflow");

    const guardianPatient = await client.evaluate(`(() => {
      const patientSelect = document.querySelector('#patientSelect');
      if (patientSelect) {
        patientSelect.value = 'p3';
        patientSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.querySelector('[data-role-switch="patient"]')?.click();
      const text = document.body.textContent || '';
      const result = {
        patient: document.querySelector('#patientSelect')?.value || '',
        hasGuardianTitle: text.includes('Zdrowie dziecka') && text.includes('widok rodzica'),
        hasChildAccessCopy: text.includes('danych dziecka'),
        hasNowPanel: Boolean(document.querySelector('.patient-now-panel')),
        hasEmbeddedMap: Boolean(document.querySelector('.patient-map360.embedded'))
      };
      if (patientSelect) {
        patientSelect.value = 'p1';
        patientSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.querySelector('[data-role-switch="patient"]')?.click();
      return result;
    })()`);
    assert(guardianPatient.patient === "p3", "Guardian smoke should switch to p3");
    assert(guardianPatient.hasGuardianTitle && guardianPatient.hasChildAccessCopy && guardianPatient.hasNowPanel && !guardianPatient.hasEmbeddedMap, "p3 patient portal should use parent/child copy without embedded full map");

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
      document.querySelector('[data-role-switch="doctor"]')?.click();
      document.querySelector('nav button[data-view="reports"]')?.click();
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
      const bodyText = document.body.textContent || '';
      const history = document.querySelector('.history-v2');
      const oldControls = [
        '[data-timeline-period]',
        '[data-timeline-view-level]',
        '[data-timeline-zoom-range]',
        '[data-timeline-zoom-step]',
        '[data-filter-track]',
        '.temporal-map',
        '.temporal-minimap'
      ];
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasHistory: Boolean(history),
        title: document.querySelector('#viewRoot h1')?.textContent.trim() || '',
        hasCurrentPanel: Boolean(document.querySelector('.history-current-panel')),
        hasVerticalTimeline: Boolean(document.querySelector('.history-vertical-timeline')),
        priorityCount: document.querySelectorAll('.history-issue-list li').length,
        stageCount: document.querySelectorAll('.history-stage-group').length,
        eventCount: document.querySelectorAll('.history-event-row').length,
        detailVisible: Boolean(document.querySelector('.history-event-detail-drawer')),
        modeLabels: [...document.querySelectorAll('.history-mode-switch button')].map((button) => button.textContent.trim()),
        evidenceCollapsed: document.querySelector('#contentGrid')?.classList.contains('evidence-collapsed') || false,
        oldControlsPresent: oldControls.filter((selector) => document.querySelector(selector)),
        bodyHasNaN: bodyText.includes('NaN'),
        hasForbiddenMainName: bodyText.includes('Poziom filmu') || bodyText.includes('Zoom mapy') || bodyText.includes('Film życia'),
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      };
    })()`);
    assert(timeline.activeView === "timeline", `Expected timeline view, got ${timeline.activeView}`);
    assert(timeline.hasHistory && timeline.title.includes("Historia pacjenta"), `Timeline should render patient history view: ${JSON.stringify(timeline)}`);
    assert(timeline.hasCurrentPanel && timeline.hasVerticalTimeline, "Patient history should render current-context and vertical timeline panels");
    assert(timeline.priorityCount >= 1 && timeline.priorityCount <= 3, `Patient history should expose up to 3 key issues, got ${timeline.priorityCount}`);
    assert(timeline.eventCount >= 1 && timeline.detailVisible, "Patient history should show chronological events and a detail panel");
    assert(timeline.modeLabels.includes("Najważniejsze") && timeline.modeLabels.includes("Etapy") && timeline.modeLabels.includes("Wszystkie zdarzenia"), `Patient history should expose semantic view modes: ${timeline.modeLabels.join(", ")}`);
    assert(timeline.evidenceCollapsed, "Patient history should keep the evidence panel collapsed until a source is requested");
    assert(timeline.oldControlsPresent.length === 0, `Patient history should not show old zoom/film/lane controls: ${timeline.oldControlsPresent.join(", ")}`);
    assert(!timeline.bodyHasNaN && !timeline.hasForbiddenMainName, "Patient history should not render NaN or old film/zoom wording");
    assert(!timeline.hasHorizontalOverflow, "Patient history should not create body horizontal overflow");

    const timelineInteractions = await client.evaluate(`(async () => {
      const pause = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
      const eventsBefore = [...document.querySelectorAll('.history-event-row [data-select-timeline-event]')].map((event) => ({
        id: event.dataset.selectTimelineEvent || '',
        title: event.querySelector('.history-event-main strong')?.textContent.trim() || ''
      })).filter((event) => event.id);
      const targetEvent = eventsBefore[1] || eventsBefore[0];
      const targetNode = [...document.querySelectorAll('.history-event-row [data-select-timeline-event]')]
        .find((event) => event.dataset.selectTimelineEvent === targetEvent?.id);
      if (targetNode) targetNode.click();
      await pause();
      const selectedAfterClick = document.querySelector('.history-event-row.selected [data-select-timeline-event]')?.dataset.selectTimelineEvent || '';
      const detailTitleAfterClick = document.querySelector('.history-event-detail-drawer h3')?.textContent.trim() || '';
      const detailHasSources = Boolean(document.querySelector('.history-event-detail-drawer [data-source-ref]'));

      const sourceButton = document.querySelector('.history-event-detail-drawer [data-open-evidence]');
      const sourceRef = sourceButton?.dataset.openEvidence || '';
      if (sourceButton) sourceButton.click();
      await pause();
      const evidenceExpanded = !document.querySelector('#contentGrid')?.classList.contains('evidence-collapsed');
      const selectedSource = JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}').selectedSourceRef || '';

      document.querySelector('[data-timeline-detail="detail"]')?.click();
      await pause();
      const stageModeActive = document.querySelector('[data-timeline-detail="detail"]')?.classList.contains('active') || false;
      const stageGroupCount = document.querySelectorAll('.history-stage-group').length;

      const stagePoint = document.querySelector('.history-stage-group [data-select-timeline-event]');
      const stagePointEventId = stagePoint?.dataset.selectTimelineEvent || '';
      if (stagePoint) stagePoint.click();
      await pause();
      const selectedAfterStagePoint = document.querySelector('.history-event-row.selected [data-select-timeline-event]')?.dataset.selectTimelineEvent || '';

      document.querySelector('[data-timeline-detail="standard"]')?.click();
      await pause();
      const allModeActive = document.querySelector('[data-timeline-detail="standard"]')?.classList.contains('active') || false;
      const allModeShowsDescriptions = [...document.querySelectorAll('.history-event-main p')].length >= 1;

      const patientSelect = document.querySelector('#patientSelect');
      if (patientSelect) {
        patientSelect.value = 'p2';
        patientSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await pause();
      const p2EventCount = document.querySelectorAll('.history-event-row').length;
      const p2PatientValue = document.querySelector('#patientSelect')?.value || '';
      const p2FirstTitle = document.querySelector('.history-event-row strong')?.textContent.trim() || '';
      if (patientSelect) {
        patientSelect.value = 'p1';
        patientSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await pause();
      return {
        eventsBefore,
        targetEvent,
        selectedAfterClick,
        detailTitleAfterClick,
        detailHasSources,
        sourceRef,
        evidenceExpanded,
        selectedSource,
        stageModeActive,
        stageGroupCount,
        allModeActive,
        allModeShowsDescriptions,
        stagePointEventId,
        selectedAfterStagePoint,
        p2PatientValue,
        p2EventCount,
        p2FirstTitle,
        resetPatientValue: document.querySelector('#patientSelect')?.value || '',
        activeViewAfterReset: document.querySelector('nav button.active')?.dataset.view || null
      };
    })()`);
    assert(timelineInteractions.eventsBefore.length >= 1, "Patient history interaction smoke needs at least one event");
    assert(timelineInteractions.selectedAfterClick === timelineInteractions.targetEvent.id, "Clicking a history event should select it");
    assert(timelineInteractions.detailTitleAfterClick.includes(timelineInteractions.targetEvent.title), "History detail panel should show clicked event title");
    assert(timelineInteractions.detailHasSources, "History detail panel should expose source chips for selected event");
    assert(timelineInteractions.sourceRef && timelineInteractions.evidenceExpanded && timelineInteractions.selectedSource === timelineInteractions.sourceRef, "Source action should open the evidence panel for the selected event");
    assert(timelineInteractions.stageModeActive && timelineInteractions.stageGroupCount >= 1, "Stage mode should group the patient history into episodes");
    assert(timelineInteractions.allModeActive && timelineInteractions.allModeShowsDescriptions, "All-events mode should switch to a richer chronological list");
    assert(!timelineInteractions.stagePointEventId || timelineInteractions.selectedAfterStagePoint === timelineInteractions.stagePointEventId, "Stage map click should select the linked history event");
    assert(timelineInteractions.p2PatientValue === "p2", "Patient switcher should move to p2 during history smoke");
    assert(timelineInteractions.p2EventCount >= 1, `Switching to p2 should reload history events, got ${timelineInteractions.p2EventCount}`);
    assert(timelineInteractions.p2FirstTitle.length > 0, "Switching patient should render p2 history rows");
    assert(timelineInteractions.resetPatientValue === "p1" && timelineInteractions.activeViewAfterReset === "timeline", "History smoke should reset patient to p1 for later checks");

    const caregiver = await client.evaluate(`(() => {
      document.querySelector('[data-role-switch="caregiver"]')?.click();
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        register: document.body.dataset.register || '',
        hasHeader: document.body.textContent.includes('Opiekun360'),
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
    assert(caregiver.register === "caregiver", `Caregiver portal should use caregiver visual register, got ${caregiver.register}`);
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
      const storedAfterBlocked = JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
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
      const storedAfterReturn = JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
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
      const storedAfterAdd = JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
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
      const storedAfterPatient = JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
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
      const stored = JSON.parse(localStorage.getItem('pacjent360-state-v11') || '{}');
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
    await client.evaluate(`localStorage.removeItem('pacjent360-state-v11')`);
    await client.call("Page.navigate", { url: `http://127.0.0.1:${serverPort}/demo.html?mobile-smoke=${Date.now()}` });
    await waitForReady(client);
    const mobile = await client.evaluate(`(() => {
      document.querySelector('[data-select-role="patient"]')?.click();
      document.querySelector('[data-start-role="patient"][data-start-patient="p1"]')?.click();
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
      const history = document.querySelector('.history-v2');
      const currentPanel = document.querySelector('.history-current-panel');
      const firstRow = document.querySelector('.history-event-row');
      const detail = document.querySelector('.history-event-detail-drawer');
      const currentRect = currentPanel?.getBoundingClientRect();
      const rowRect = firstRow?.getBoundingClientRect();
      const detailRect = detail?.getBoundingClientRect();
      const bodyText = document.body.textContent || '';
      return {
        activeView: document.querySelector('nav button.active')?.dataset.view || null,
        hasHistory: Boolean(history),
        bodyHasNaN: bodyText.includes('NaN'),
        hasCurrentPanel: Boolean(currentPanel),
        eventCount: document.querySelectorAll('.history-event-row').length,
        priorityCount: document.querySelectorAll('.history-issue-list li').length,
        currentWidth: currentRect?.width || 0,
        rowWidth: rowRect?.width || 0,
        detailWidth: detailRect?.width || 0,
        hasBodyOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      };
    })()`);
    assert(mobileTimeline.activeView === "timeline", "Mobile patient history smoke should open history view");
    assert(mobileTimeline.hasHistory, "Mobile patient history should render the simplified history view");
    assert(!mobileTimeline.bodyHasNaN, "Mobile patient history must not render NaN values");
    assert(mobileTimeline.priorityCount >= 1 && mobileTimeline.priorityCount <= 3, "Mobile patient history should keep key issues short");
    assert(mobileTimeline.hasCurrentPanel && mobileTimeline.eventCount >= 1, "Mobile patient history should show current context and chronological events");
    assert(mobileTimeline.currentWidth >= 220 && mobileTimeline.rowWidth >= 220 && mobileTimeline.detailWidth >= 220, "Mobile patient history panels should keep usable dimensions");
    assert(!mobileTimeline.hasBodyOverflow, "Mobile patient history should not create body horizontal overflow");

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
