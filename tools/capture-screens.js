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
const outputPath = path.resolve(root, args.out || "TEMP_REVIEW_OUTPUT/NIGHT_SCREENSHOTS/screenshot.png");
const width = parseInteger(args.width, 1280);
const height = parseInteger(args.height, 900);

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

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
      if (payload.error) {
        reject(new Error(payload.error.message || JSON.stringify(payload.error)));
      } else {
        resolve(payload.result || {});
      }
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

function screenshotUrl(rawUrl, serverPort) {
  const raw = rawUrl || "index.html";
  if (/^https?:\/\//i.test(raw)) return raw;
  const safePath = raw.startsWith("/") ? raw : `/${raw}`;
  return `http://127.0.0.1:${serverPort}${safePath}`;
}

async function waitForReady(client) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const ready = await client.evaluate("document.readyState");
    if (ready === "complete" || ready === "interactive") return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Page did not finish loading before screenshot");
}

async function prepareAppState(client) {
  if (!args.view && !args.patient) return;
  const view = args.view ? JSON.stringify(String(args.view)) : "null";
  const patient = args.patient ? JSON.stringify(String(args.patient)) : "null";
  await client.evaluate(`(async () => {
    const pause = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
    const patientId = ${patient};
    const viewId = ${view};
    if (patientId) {
      const select = document.querySelector('#patientSelect');
      if (select) {
        select.value = patientId;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await pause();
      }
    }
    if (viewId) {
      const button = document.querySelector('nav button[data-view="' + viewId + '"]');
      if (button) {
        button.click();
        await pause();
      }
    }
  })()`);
}

async function captureScreenshot(client) {
  try {
    return await client.call("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true
    });
  } catch (error) {
    if (!String(error.message || "").includes("0 width")) throw error;
    return client.call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true
    });
  }
}

async function main() {
  assert(fs.existsSync(packageDir), `Package directory does not exist: ${packageDir}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const staticServer = createStaticServer(packageDir);
  const serverPort = await listen(staticServer);
  const debugPort = await getFreePort();
  const browserPath = args.browserPath || findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "pacjent360-capture-"));
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
    await client.call("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width <= 480
    });

    const url = screenshotUrl(args.url, serverPort);
    await client.call("Page.navigate", { url });
    await waitForReady(client);
    await prepareAppState(client);
    const screenshot = await captureScreenshot(client);
    assert(screenshot.data, "CDP did not return screenshot data");
    fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
    console.log(`Screenshot saved: ${outputPath}`);
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
