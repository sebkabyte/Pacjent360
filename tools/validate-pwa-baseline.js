const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateManifest() {
  const manifest = readJson("public/manifest.webmanifest");
  assert(manifest.name && manifest.short_name, "manifest must define name and short_name");
  assert(manifest.start_url === "/index.html", "manifest start_url should point to index.html");
  assert(manifest.scope === "/", "manifest scope should be root");
  assert(manifest.display === "standalone", "manifest display should be standalone");
  assert(manifest.theme_color === "#10242a", "manifest theme_color should match landing theme");
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "manifest should define SVG and PNG icons");
  assert(manifest.icons.some((icon) => icon.src === "assets/favicon.svg"), "manifest should include favicon.svg");
}

function validateServiceWorker() {
  const sw = read("public/sw.js");
  assert(sw.includes("CACHE_NAME"), "service worker should define cache name");
  assert(sw.includes("install") && sw.includes("activate") && sw.includes("fetch"), "service worker should handle install, activate and fetch");
  assert(sw.includes("request.method !== \"GET\""), "service worker should ignore non-GET requests");
  assert(sw.includes("/api/"), "service worker should avoid API requests");
  assert(!/localStorage|indexedDB|sessionStorage/i.test(sw), "service worker must not access browser storage APIs");
  assert(sw.includes("manifest.webmanifest") && sw.includes("patient360-flags.js") && sw.includes("assets/story.css"), "service worker should cache static shell files");
}

function validateHtml() {
  const index = read("public/index.html");
  const demo = read("public/demo.html");
  assert(index.includes('rel="manifest" href="manifest.webmanifest"'), "index.html should link manifest");
  assert(demo.includes('rel="manifest" href="manifest.webmanifest"'), "demo.html should link manifest");
  assert(index.includes('src="p360-pwa.js"'), "index.html should load PWA registration");
  assert(demo.includes('src="p360-pwa.js'), "demo.html should load PWA registration");
  assert(index.includes('id="waitlist"'), "index.html should expose waitlist section");
  assert(index.includes("data-waitlist-form"), "waitlist form should be marked for JS handling");
  assert(index.includes("double opt-in"), "waitlist copy should mention double opt-in");
  assert(index.includes("Nie wpisuj danych zdrowotnych"), "waitlist should block health data entry");
  assert(index.includes("NO_BACKEND_WAITLIST_PLACEHOLDER"), "waitlist should declare backend placeholder");
}

function validateRegistrationScript() {
  const script = read("public/p360-pwa.js");
  assert(script.includes("serviceWorker") && script.includes("register(\"sw.js\""), "PWA script should register sw.js");
  assert(script.includes("file:"), "PWA script should avoid file:// registration");
}

try {
  validateManifest();
  validateServiceWorker();
  validateHtml();
  validateRegistrationScript();
  console.log("PWA baseline validation passed");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
