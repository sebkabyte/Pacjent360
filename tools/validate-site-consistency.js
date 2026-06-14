// Walidator spójności serwisu publicznego (sprint unifikacji 2026-06-14).
// Blokuje powrót patchworku: jeden system CSS, jeden navbar, jeden tagline,
// menu mobilne na każdej stronie, brak legacy site.css.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");

// Strony publiczne objęte kanonem (demo.html ma własny shell aplikacji).
const PAGES = [
  "index.html", "investors.html", "dla-lekarzy.html", "engineering.html", "ditl.html", "agents.html",
  "soczewki.html", "mapa-historii.html", "biblioteka-dokumentow.html",
  "jak-sie-przygotowac.html", "readme.html", "wspoltworcy.html",
  "disclaimer.html", "privacy.html"
];

const CANON_TAGLINE = "Brief przed wizytą";
const errors = [];

function check(cond, page, msg) {
  if (!cond) errors.push(`${page}: ${msg}`);
}

for (const page of PAGES) {
  const file = path.join(publicRoot, page);
  if (!fs.existsSync(file)) { errors.push(`${page}: brak pliku`); continue; }
  const html = fs.readFileSync(file, "utf8");

  // Jeden system CSS: story.css obecny, legacy site.css nieobecny.
  check(html.includes('assets/story.css'), page, "musi ładować assets/story.css");
  check(!/href="site\.css/.test(html), page, "nie może ładować legacy site.css");
  check(html.includes('assets/story.js'), page, "musi ładować assets/story.js (menu mobilne, i18n)");
  check(/<body[^>]*data-register="story"/.test(html), page, 'body musi mieć data-register="story"');

  // Jeden navbar: marka, jeden tagline, menu mobilne (nav-toggle), CTA demo.
  check(html.includes('class="brand-name">Pacjent360'), page, "marka musi być Pacjent360 (brand-name)");
  check(html.includes("nav-toggle") && html.includes("data-nav-toggle"), page, "musi mieć przycisk menu mobilnego (nav-toggle)");
  check(html.includes('data-nav id="mainNav"') || html.includes('id="mainNav" data-nav'), page, "nawigacja musi mieć data-nav id=mainNav");
  check(html.includes('href="demo.html?start=1"'), page, "navbar musi linkować do demo");

  // Jeden tagline w logo; żadnych wariantów patchworku.
  const taglines = [...html.matchAll(/<small[^>]*>([^<]+)<\/small>/g)].map((m) => m[1].trim());
  const brandTagline = taglines[0] || "";
  check(brandTagline === CANON_TAGLINE, page, `tagline w logo musi brzmieć "${CANON_TAGLINE}" (jest: "${brandTagline}")`);
  for (const stray of ["Alpha do walidacji", "Poradnik", "Clinical Context Layer", "Warstwa kontekstu pacjenta"]) {
    check(!html.includes(`<small>${stray}</small>`), page, `niespójny tagline w logo: "${stray}"`);
  }
}

if (errors.length) {
  console.error("Site consistency validation FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`Site consistency validation passed: ${PAGES.length} stron, jeden system / navbar / tagline.`);
