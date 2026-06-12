const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(file) {
  return fs.readFileSync(path.join(publicRoot, file), "utf8");
}

function matches(text, regex) {
  return [...text.matchAll(regex)].map((match) => match[0]);
}

const htmlFiles = ["index.html", "demo.html", "disclaimer.html", "privacy.html", "maintenance.html"];
const html = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));

for (const file of htmlFiles) {
  const content = html[file];
  assert(/<html\s+lang="pl"/.test(content), `${file} should declare lang="pl"`);
  assert(/<title>[^<]+<\/title>/.test(content), `${file} should contain a non-empty title`);
  assert(/<meta\s+name="viewport"/.test(content), `${file} should contain viewport meta`);

  for (const imageTag of matches(content, /<img\b[^>]*>/g)) {
    assert(/\salt=/.test(imageTag), `${file} image is missing alt attribute: ${imageTag}`);
  }

  for (const iconButton of matches(content, /<button\b[^>]*class="[^"]*icon-button[^"]*"[^>]*>/g)) {
    assert(/\saria-label=/.test(iconButton) || /\stitle=/.test(iconButton), `${file} icon button needs aria-label or title: ${iconButton}`);
  }
}

assert(html["index.html"].includes('class="skip-link"') && html["index.html"].includes('href="#main-content"'), "index.html should expose a skip link to main content");
assert(html["index.html"].includes('<main id="main-content">'), "index.html skip link target should exist");
assert(/<nav\b[^>]*aria-label="Sekcje strony"/.test(html["index.html"]), "index.html nav should have an accessible label");
assert(/data-nav-toggle[^>]*aria-expanded="false"[^>]*aria-controls="mainNav"/.test(html["index.html"]), "index.html mobile nav toggle should expose aria-expanded and aria-controls");

assert(html["demo.html"].includes('class="skip-link"') && html["demo.html"].includes('href="#viewRoot"'), "demo.html should expose a skip link to the rendered view");
assert(html["demo.html"].includes('id="viewRoot"'), "demo.html skip link target should exist");
assert(html["demo.html"].includes('aria-label="Widoki demo"'), "demo.html nav should have an accessible label");
assert(html["demo.html"].includes('id="searchInput"') && html["demo.html"].includes('aria-label="Szukaj w danych demo"'), "demo search input should have an explicit aria-label");
assert(html["demo.html"].includes('<dialog id="entryDialog" aria-labelledby="dialogTitle">'), "entry dialog should be labelled by dialogTitle");
assert(html["demo.html"].includes('<dialog id="confirmDialog" aria-labelledby="confirmTitle">'), "confirm dialog should be labelled by confirmTitle");
assert(/id="panelSplitter"[^>]*role="separator"[^>]*aria-valuemin="260"[^>]*aria-valuemax="620"[^>]*aria-valuenow="330"/.test(html["demo.html"]), "demo evidence splitter should expose range semantics");

for (const legalFile of ["disclaimer.html", "privacy.html"]) {
  assert(html[legalFile].includes('class="skip-link"') && html[legalFile].includes('href="#main-content"'), `${legalFile} should expose a skip link to main content`);
  assert(html[legalFile].includes('id="main-content"') && html[legalFile].includes('tabindex="-1"'), `${legalFile} skip link target should exist and be focusable`);
}

const siteCss = read("site.css");
const stylesCss = read("styles.css");
assert(siteCss.includes(".skip-link") && siteCss.includes(":focus-visible"), "site.css should style skip-link and focus-visible");
assert(stylesCss.includes(".skip-link") && stylesCss.includes(":focus-visible"), "styles.css should style skip-link and focus-visible");
assert(/a:focus-visible[\s\S]*button:focus-visible/.test(siteCss), "site.css should expose visible focus styles for links/buttons");
assert(/input:focus-visible[\s\S]*textarea:focus-visible/.test(stylesCss), "styles.css should expose visible focus styles for form controls");

console.log("Accessibility static validation passed");
