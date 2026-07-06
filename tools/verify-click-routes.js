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
const STORAGE_KEY = "pacjent360-state-v11";

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
    ".svg": "image/svg+xml",
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
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
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
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (!payload.id || !this.pending.has(payload.id)) return;
      const { resolve, reject } = this.pending.get(payload.id);
      this.pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message || JSON.stringify(payload.error)));
      else resolve(payload.result || {});
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

async function waitForCondition(client, expression, message, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await client.evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error(message);
}

async function navigate(client, url) {
  await client.call("Page.navigate", { url });
  await waitForCondition(client, "document.readyState === 'complete' || document.readyState === 'interactive'", `Page did not load: ${url}`);
}

async function waitForDemoReady(client) {
  await waitForCondition(client, `Boolean(
    window.Patient360Contract &&
    window.Patient360DemoData &&
    document.querySelector('#viewRoot')?.children.length
  )`, "Demo did not render");
}

async function setViewport(client, width, height, mobile = false) {
  await client.call("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile
  });
}

async function snapshotDemo(client) {
  return client.evaluate(`(() => ({
    url: location.href,
    activeView: document.querySelector('nav button.active')?.dataset.view || null,
    activeRole: JSON.parse(localStorage.getItem('${STORAGE_KEY}') || '{}').activeRole || '',
    activePatient: document.querySelector('#patientSelect')?.value || '',
    h1: document.querySelector('#viewRoot h1')?.textContent.trim() || '',
    roleCards: document.querySelectorAll('[data-select-role]').length,
    scenarioCards: document.querySelectorAll('[data-start-patient]').length,
    visibleLibrary: [...document.querySelectorAll('nav .nav-item:not(.cockpit-nav):not([data-view="roleStart"])')]
      .filter((button) => !button.hidden && button.getAttribute('aria-hidden') !== 'true')
      .map((button) => button.querySelector('span')?.textContent.trim() || ''),
    visibleSetViews: [...document.querySelectorAll('#viewRoot [data-set-view]')]
      .filter((button) => !button.disabled && (button.offsetWidth || button.offsetHeight))
      .map((button) => ({ view: button.dataset.setView, text: button.textContent.replace(/\\s+/g, ' ').trim() })),
    text: (document.querySelector('#viewRoot')?.textContent || '').replace(/\\s+/g, ' ').trim()
  }))()`);
}

async function openPerspective(client, baseUrl, role, patientId) {
  await navigate(client, `${baseUrl}/demo.html?start=1&click-routes=${Date.now()}`);
  await waitForDemoReady(client);
  await client.evaluate(`document.querySelector('[data-select-role="${role}"]')?.click()`);
  await waitForCondition(client, "document.querySelectorAll('[data-start-patient]').length === 3", `Scenario picker did not open for ${role}`);
  await client.evaluate(`document.querySelector('[data-start-role="${role}"][data-start-patient="${patientId}"]')?.click()`);
  await waitForCondition(client, `document.querySelector('#patientSelect')?.value === '${patientId}'`, `Patient ${patientId} did not become active`);
  return snapshotDemo(client);
}

async function assertLandingRoutes(client, baseUrl) {
  await setViewport(client, 1366, 900, false);
  await navigate(client, `${baseUrl}/index.html?click-routes=${Date.now()}`);
  const landing = await client.evaluate(`(() => {
    const ids = new Set([...document.querySelectorAll('[id]')].map((item) => item.id));
    const hrefs = [...document.querySelectorAll('a[href]')].map((link) => ({
      text: link.textContent.replace(/\\s+/g, ' ').trim(),
      href: link.getAttribute('href'),
      visible: Boolean(link.offsetWidth || link.offsetHeight)
    }));
    return {
      text: document.body.textContent,
      hrefs,
      missingAnchors: hrefs
        .filter((item) => item.href.startsWith('#') && !ids.has(item.href.slice(1)))
        .map((item) => item.href),
      demoLinks: hrefs.filter((item) => item.href.startsWith('demo.html')),
      heroStartCount: document.querySelectorAll('.hero-actions a[href="demo.html?start=1&lang=pl"]').length
    };
  })()`);
  assert(!landing.missingAnchors.length, `Landing has missing anchors: ${landing.missingAnchors.join(", ")}`);
  assert(landing.heroStartCount === 1, "Landing hero should have exactly one clean-start PL demo CTA");
  assert(landing.demoLinks.length >= 4 && landing.demoLinks.every((item) => item.href === "demo.html?start=1&lang=pl"), `All landing demo links should use demo.html?start=1&lang=pl: ${JSON.stringify(landing.demoLinks)}`);
  assert(!landing.text.includes("Start gry") && !landing.text.includes("Demo jako gra w role"), "Landing should not use game wording");

  await client.evaluate(`document.querySelector('.hero-actions a[href="demo.html?start=1&lang=pl"]')?.click()`);
  await waitForDemoReady(client);
  const afterHero = await snapshotDemo(client);
  assert(afterHero.activeView === "roleStart" && afterHero.roleCards === 3 && afterHero.scenarioCards === 0, `Hero CTA should open perspective choice: ${JSON.stringify(afterHero)}`);

  await setViewport(client, 1366, 900, false);
  await navigate(client, `${baseUrl}/index.html?lang=en&click-routes-en=${Date.now()}`);
  const landingEn = await client.evaluate(`(() => {
    const hrefs = [...document.querySelectorAll('a[href]')].map((link) => ({
      text: link.textContent.replace(/\\s+/g, ' ').trim(),
      href: link.getAttribute('href'),
      visible: Boolean(link.offsetWidth || link.offsetHeight)
    }));
    return {
      htmlLang: document.documentElement.lang,
      demoLinks: hrefs.filter((item) => item.href.startsWith('demo.html')),
      heroStartCount: document.querySelectorAll('.hero-actions a[href="demo.html?start=1&lang=en"]').length
    };
  })()`);
  assert(landingEn.htmlLang === "en", `English landing should set html lang=en: ${JSON.stringify(landingEn)}`);
  assert(landingEn.heroStartCount === 1, "English landing hero should have exactly one clean-start EN demo CTA");
  assert(landingEn.demoLinks.length >= 4 && landingEn.demoLinks.every((item) => item.href === "demo.html?start=1&lang=en"), `All English landing demo links should use demo.html?start=1&lang=en: ${JSON.stringify(landingEn.demoLinks)}`);
  await client.evaluate(`document.querySelector('.hero-actions a[href="demo.html?start=1&lang=en"]')?.click()`);
  await waitForDemoReady(client);
  const afterHeroEn = await snapshotDemo(client);
  const afterHeroEnUrl = await client.evaluate(`location.href`);
  assert(afterHeroEnUrl.includes("lang=en"), `English hero CTA should preserve lang=en in demo URL: ${afterHeroEnUrl}`);
  assert(afterHeroEn.activeView === "roleStart" && afterHeroEn.roleCards === 3 && afterHeroEn.scenarioCards === 0, `English hero CTA should open perspective choice: ${JSON.stringify(afterHeroEn)}`);
  assert(afterHeroEn.text.includes("Choose a 360") && afterHeroEn.text.includes("One story, three perspectives"), `English hero CTA should render English demo start copy: ${JSON.stringify(afterHeroEn)}`);
  assert(!afterHeroEn.text.includes("Wybierz perspektyw") && !afterHeroEn.text.includes("Jedna historia, trzy perspektywy"), `English demo start should not leak Polish start copy: ${JSON.stringify(afterHeroEn)}`);

  await setViewport(client, 390, 844, true);
  await navigate(client, `${baseUrl}/index.html?mobile-click-routes=${Date.now()}`);
  const mobileNav = await client.evaluate(`(() => ({
    jumpVisible: Boolean(document.querySelector('.mobile-jump-nav')?.offsetWidth || document.querySelector('.mobile-jump-nav')?.offsetHeight),
    startCount: document.querySelectorAll('.mobile-jump-nav a[href="demo.html?start=1&lang=pl"]').length,
    toggleVisible: Boolean(document.querySelector('[data-nav-toggle]')?.offsetWidth || document.querySelector('[data-nav-toggle]')?.offsetHeight)
  }))()`);
  assert(mobileNav.jumpVisible && mobileNav.startCount === 1 && mobileNav.toggleVisible, `Mobile landing navigation should expose clean Start: ${JSON.stringify(mobileNav)}`);
  await client.evaluate(`document.querySelector('.mobile-jump-nav a[href="demo.html?start=1&lang=pl"]')?.click()`);
  await waitForDemoReady(client);
  const afterMobileStart = await snapshotDemo(client);
  assert(afterMobileStart.activeView === "roleStart" && afterMobileStart.roleCards === 3 && afterMobileStart.scenarioCards === 0, `Mobile Start should open perspective choice: ${JSON.stringify(afterMobileStart)}`);
}

async function assertPerspectiveRoutes(client, baseUrl) {
  const cases = [
    ["doctor", "p1", "core", "Lekarz360"],
    ["patient", "p2", "visitChecklist", "Przed wizytą"],
    ["caregiver", "p1", "caregiverPortal", "Opiekun360"],
    ["caregiver", "p2", "caregiverPortal", "Opiekun360"],
    ["caregiver", "p3", "caregiverPortal", "Opiekun360"]
  ];

  for (const [role, patientId, expectedView, expectedHeading] of cases) {
    await setViewport(client, 1366, 900, false);
    const snap = await openPerspective(client, baseUrl, role, patientId);
    assert(snap.activeView === expectedView, `${role}/${patientId} should open ${expectedView}: ${JSON.stringify(snap)}`);
    assert(snap.activeRole === role, `${role}/${patientId} should persist active role: ${JSON.stringify(snap)}`);
    assert(snap.activePatient === patientId, `${role}/${patientId} should preserve active patient: ${JSON.stringify(snap)}`);
    assert(snap.h1.includes(expectedHeading), `${role}/${patientId} should show ${expectedHeading}: ${JSON.stringify(snap)}`);
    assert(!snap.text.includes("Start gry") && !snap.text.includes("Demo jako gra w role") && !snap.text.includes("Wybierz rolę"), `${role}/${patientId} should not show old game/role wording`);
  }
}

async function assertCaregiverNoConsent(client, baseUrl) {
  const snap = await openPerspective(client, baseUrl, "caregiver", "p2");
  const protectedViews = new Set(["interview", "documents", "timeline", "medications", "observations"]);
  const leakedActions = snap.visibleSetViews.filter((item) => protectedViews.has(item.view));
  assert(snap.visibleLibrary.length === 1 && snap.visibleLibrary[0] === "Zgody", `Caregiver without consent should only see consent in sidebar: ${JSON.stringify(snap.visibleLibrary)}`);
  assert(!leakedActions.length, `Caregiver without consent should not see data action buttons: ${JSON.stringify(leakedActions)}`);
  const lower = snap.text.toLowerCase();
  assert(lower.includes("nie wczytano element") || lower.includes("nie ma jeszcze udost"), "Caregiver without consent should render neutral zero-knowledge empty state");
  assert(!["brak dost", "zablok", "ukryt", "wymagana zgoda", "3 z 10"].some((phrase) => lower.includes(phrase)), "Caregiver without consent should not expose access-denied or hidden-count copy");

  await client.evaluate(`document.querySelector('#viewRoot [data-set-view="consent"]')?.click()`);
  await waitForCondition(client, "document.querySelector('nav button.active')?.dataset.view === 'consent'", "Caregiver consent action did not open consent view");
  const afterConsent = await snapshotDemo(client);
  assert(afterConsent.activeView === "consent", `Consent action should open consent view: ${JSON.stringify(afterConsent)}`);
}

async function assertS2PrototypeRoutes(client, baseUrl) {
  await openPerspective(client, baseUrl, "doctor", "p1");
  await client.evaluate(`document.querySelector('nav button[data-view="s2Prototype"]')?.click()`);
  await waitForCondition(client, "document.querySelector('nav button.active')?.dataset.view === 's2Prototype'", "S2 prototype navigation did not open");
  const s2 = await client.evaluate(`(() => ({
    activeView: document.querySelector('nav button.active')?.dataset.view || null,
    heading: document.querySelector('#viewRoot h1')?.textContent.trim() || '',
    hasBundle: Boolean(document.querySelector('[data-s2-prototype="bundle"]')),
    doctorReadonly: document.querySelector('[data-s2-doctor-readonly]')?.dataset.s2DoctorReadonly || '',
    doctorSections: [...document.querySelectorAll('[data-s2-doctor-section]')].map((item) => item.dataset.s2DoctorSection),
    flowSteps: [...document.querySelectorAll('[data-s2-flow-step]')].map((item) => item.dataset.s2FlowStep),
    writeDialogCount: document.querySelectorAll('[data-s2-prototype] [data-open-dialog]').length,
    text: (document.querySelector('#viewRoot')?.textContent || '').replace(/\\s+/g, ' ').trim()
  }))()`);
  assert(s2.activeView === "s2Prototype" && s2.hasBundle, `S2 prototype should render bundle: ${JSON.stringify(s2)}`);
  assert(s2.heading.includes("S2") && s2.doctorReadonly === "true", `S2 prototype should expose read-only doctor packet: ${JSON.stringify(s2)}`);
  ["discrepancies", "packet90s", "sources", "questions", "timeline", "documentDrawer"].forEach((section) => {
    assert(s2.doctorSections.includes(section), `S2 doctor prototype missing section ${section}: ${JSON.stringify(s2)}`);
  });
  assert(s2.doctorSections[0] === "discrepancies", `S2 doctor prototype must render discrepancies first: ${JSON.stringify(s2.doctorSections)}`);
  ["profile", "visitGoal", "documents", "medications", "questions", "consent", "packet"].forEach((step) => {
    assert(s2.flowSteps.includes(step), `S2 PWA prototype missing step ${step}: ${JSON.stringify(s2)}`);
  });
  assert(s2.writeDialogCount === 0, `S2 prototype should not expose write dialogs: ${JSON.stringify(s2)}`);
  assert(s2.text.includes("Backend") && s2.text.includes("closed") && s2.text.includes("AI runtime"), `S2 prototype should show closed gates: ${JSON.stringify(s2)}`);

  // S2-R9: przycisk "Drukuj pakiet" wywoluje window.print(); jednostronicowy wydruk sprawdzany ponizej przez Page.printToPDF.
  const printButton = await client.evaluate(`(() => {
    window.__p360Printed = false;
    window.print = () => { window.__p360Printed = true; };
    const button = document.querySelector('[data-print-packet]');
    if (button) button.click();
    return {
      found: Boolean(button),
      printed: Boolean(window.__p360Printed),
      bodyHasPrintClass: document.body.classList.contains('p360-print-packet'),
      sheetVisible: Boolean(document.querySelector('[data-s2-print-packet="true"]'))
    };
  })()`);
  assert(printButton.found, "S2 prototype should render a 'Drukuj pakiet' button");
  assert(printButton.printed, "Drukuj pakiet button should call window.print()");
  assert(printButton.bodyHasPrintClass, "Drukuj pakiet button should toggle p360-print-packet body class");
  assert(printButton.sheetVisible, "Print sheet markup should be present in the DOM");
  await client.evaluate(`document.body.classList.remove('p360-print-packet')`);

  // Headless print-to-pdf as a smoke check that @page/print CSS renders without error;
  // the one-page-A4 layout claim itself is enforced by static CSS assertions in validate-s2-prototypes.js
  // (DoD-E: "asercje CSS" jako dopuszczalna alternatywa, gdy PDF page-count nie jest niezawodnie parsowalny).
  const printPdf = await client.call("Page.printToPDF", { printBackground: false, preferCSSPageSize: true });
  assert(printPdf?.data, "Page.printToPDF should render the S2 prototype view to PDF without error");
  console.log(`S2 print packet: headless print-to-pdf rendered successfully (${Buffer.from(printPdf.data, "base64").length} bytes)`);

  await client.evaluate(`document.querySelector('[data-s2-flow-step="documents"]')?.click()`);
  await waitForCondition(client, "document.querySelector('nav button.active')?.dataset.view === 'documents'", "S2 documents step did not navigate to documents");
  const docs = await snapshotDemo(client);
  assert(docs.activeView === "documents" && docs.text.toLowerCase().includes("dokument"), `S2 documents step should open documents view: ${JSON.stringify(docs)}`);

  await client.evaluate(`document.querySelector('nav button[data-view="s2Prototype"]')?.click()`);
  await waitForCondition(client, "document.querySelector('nav button.active')?.dataset.view === 's2Prototype'", "S2 prototype did not reopen");
  await client.evaluate(`document.querySelector('[data-s2-pwa-flow] [data-set-view="caregiverPortal"]')?.click()`);
  await waitForCondition(client, "document.querySelector('nav button.active')?.dataset.view === 'caregiverPortal'", "S2 caregiver PWA action did not navigate to caregiver portal");
  const caregiver = await snapshotDemo(client);
  assert(caregiver.activeView === "caregiverPortal" && caregiver.activeRole === "caregiver", `S2 caregiver action should switch to caregiver PWA: ${JSON.stringify(caregiver)}`);
}

async function main() {
  assert(fs.existsSync(packageDir), `Package does not exist: ${packageDir}`);

  const staticServer = createStaticServer(packageDir);
  const serverPort = await listen(staticServer);
  const debugPort = await getFreePort();
  const browserPath = args.browserPath || findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "pacjent360-click-routes-"));
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

    const baseUrl = `http://127.0.0.1:${serverPort}`;
    await assertLandingRoutes(client, baseUrl);
    await assertPerspectiveRoutes(client, baseUrl);
    await assertCaregiverNoConsent(client, baseUrl);
    await assertS2PrototypeRoutes(client, baseUrl);

    console.log(`Click route verification passed: ${baseUrl} -> ${packageDir}`);
  } finally {
    if (client) client.close();
    staticServer.close();
    if (!browser.killed) browser.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      // Windows can keep Chromium profile files locked for a moment after browser.kill().
    }
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
