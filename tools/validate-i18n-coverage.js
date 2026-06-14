// Walidator kompletności tłumaczeń EN (sprint i18n 2026-06-14).
// Każdy tekstowy element treści (h1-h4, p, li, button-link, eyebrow) musi
// mieć data-i18n (klucz w słowniku enCopy) albo data-en, inaczej w trybie EN
// zostaje po polsku. Raportuje luki per strona; --report nie failuje.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const reportOnly = process.argv.includes("--report");

const PAGES = [
  "index.html", "investors.html", "dla-lekarzy.html", "engineering.html", "ditl.html",
  "agents.html", "soczewki.html", "mapa-historii.html", "biblioteka-dokumentow.html",
  "jak-sie-przygotowac.html", "readme.html", "wspoltworcy.html", "disclaimer.html", "privacy.html"
];

// Klucze obecne w centralnym słowniku enCopy (story.js) — homepage używa data-i18n.
const enCopyKeys = new Set();
{
  const storyJs = fs.readFileSync(path.join(publicRoot, "assets", "story.js"), "utf8");
  const enBlock = storyJs.slice(storyJs.indexOf("const enCopy"), storyJs.indexOf("const languageCopy"));
  for (const m of enBlock.matchAll(/(\w+):\s*"/g)) enCopyKeys.add(m[1]);
}

function mainSlice(html) {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  if (start < 0 || end < 0) return html;
  return html.slice(start, end);
}

function isTranslated(openTag) {
  if (/\bdata-en\s*=/.test(openTag)) return true;
  const key = openTag.match(/\bdata-i18n\s*=\s*"([^"]+)"/);
  if (key && enCopyKeys.has(key[1])) return true;
  return false;
}

const TEXT_TAGS = ["h1", "h2", "h3", "h4", "p", "li"];
const allErrors = [];
const summary = [];

for (const page of PAGES) {
  const file = path.join(publicRoot, page);
  const html = fs.readFileSync(file, "utf8");
  const gaps = [];

  // Strona musi mieć przełącznik języka, by EN był osiągalny.
  if (!/data-language-switch/.test(html)) gaps.push("brak przełącznika języka (data-language-switch)");

  const region = mainSlice(html);
  for (const tag of TEXT_TAGS) {
    const re = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "g");
    for (const m of region.matchAll(re)) {
      const openAttrs = m[1];
      const inner = m[2];
      const text = inner.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").trim();
      if (text.length < 2) continue;                       // puste / symbole
      if (/^[\d\s.,:%+/–-]+$/.test(text)) continue;        // czyste liczby
      if (isTranslated(`<${tag}${openAttrs}>`)) continue;   // element sam przetłumaczony
      // kontener, którego dzieci niosą tłumaczenie (np. eyebrow ze spanami)
      if (/data-(en|i18n)\s*=/.test(inner)) continue;
      gaps.push(`<${tag}> bez data-en: "${text.slice(0, 60)}"`);
    }
  }

  summary.push(`${page}: ${gaps.length === 0 ? "OK" : gaps.length + " luk"}`);
  if (gaps.length) allErrors.push(`\n## ${page}\n  - ` + gaps.join("\n  - "));
}

console.log(summary.join("\n"));
if (allErrors.length) {
  console.log("\n=== LUKI TŁUMACZEŃ EN ===" + allErrors.join(""));
  if (!reportOnly) {
    console.error(`\ni18n coverage FAILED: ${allErrors.length} stron z lukami`);
    process.exit(1);
  }
} else {
  console.log("\ni18n coverage passed: pełne EN na wszystkich stronach.");
}
