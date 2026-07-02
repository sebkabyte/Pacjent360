// Walidator spojnosci: kazda fraza banowana w docs/legal/CLAIMS_REGISTER.md
// (sekcje 2.1 "Frazy kliniczne" i 2.4 "Frazy zakazane w output systemowym")
// musi miec odpowiednik w contract.FORBIDDEN_CLAIM_PHRASES.
// Odpowiednik = po normalizacji (lowercase, bez diakrytykow) jakas fraza kontraktu
// jest substringiem frazy z rejestru albo jest jej rowna. Dzieki temu kontrakt
// nie moze "zgubic" frazy, ktora rejestr prawny uznaje za zakazana.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = require(path.join(root, "public", "patient360-contract.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const normalize = contract.normalizeClaimPhrase;
assert(typeof normalize === "function", "contract.normalizeClaimPhrase.missing");

function extractSectionRows(markdown, sectionHeading) {
  const start = markdown.indexOf(sectionHeading);
  assert(start >= 0, `CLAIMS_REGISTER section missing: ${sectionHeading}`);
  const rest = markdown.slice(start + sectionHeading.length);
  const nextHeading = rest.search(/\n#{2,3}\s/);
  const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
  return section
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length > 2)
    .map((cells) => cells[1])
    .filter((cell) => cell && !/^-+$/.test(cell) && !/^Fraza$/i.test(cell));
}

function backtickPhrase(cell) {
  const match = cell.match(/`([^`]+)`/);
  return match ? match[1].trim() : null;
}

function isCovered(registryPhrase, contractPhrases) {
  const normalizedRegistry = normalize(registryPhrase);
  return contractPhrases.some((contractPhrase) => {
    const normalizedContract = normalize(contractPhrase);
    return normalizedContract && normalizedRegistry.includes(normalizedContract);
  });
}

function validateRegistrySync(markdown, contractPhrases) {
  const cells = [
    ...extractSectionRows(markdown, "### 2.1"),
    ...extractSectionRows(markdown, "### 2.4")
  ];
  const phrases = cells.map(backtickPhrase).filter(Boolean);
  assert(phrases.length >= 20, `CLAIMS_REGISTER banned phrases parse too small: ${phrases.length}`);

  const uncovered = phrases.filter((phrase) => !isCovered(phrase, contractPhrases));
  assert(
    uncovered.length === 0,
    `CLAIMS_REGISTER phrases without contract counterpart: ${uncovered.join(" | ")}`
  );
  return phrases.length;
}

function runSelfChecks(markdown, contractPhrases) {
  // Negatyw 1: fraza rejestru bez odpowiednika w kontrakcie musi byc wykryta.
  const mutatedRegistry = markdown.replace(
    "### 2.2",
    "| `fraza-testowa-bez-odpowiednika` | test | test |\n\n### 2.2"
  );
  let failed = false;
  try {
    validateRegistrySync(mutatedRegistry, contractPhrases);
  } catch (error) {
    failed = error.message.includes("fraza-testowa-bez-odpowiednika");
  }
  assert(failed, "self-check: uncovered registry phrase should fail sync validation");

  // Negatyw 2: usuniecie frazy z kontraktu musi byc wykryte.
  const weakenedContract = contractPhrases.filter((phrase) => normalize(phrase) !== "triage");
  let weakened = false;
  try {
    validateRegistrySync(markdown, weakenedContract);
  } catch (error) {
    weakened = error.message.includes("triage");
  }
  assert(weakened, "self-check: contract without triage should fail sync validation");

  // Pozytyw normalizacji: diakrytyki i wielkosc liter nie moga rozjechac porownania.
  assert(normalize("Poza Normą") === "poza norma", "normalizeClaimPhrase diacritics drift");
  assert(normalize("TRIAGE") === "triage", "normalizeClaimPhrase case drift");
}

function main() {
  const registryPath = path.join(root, "docs", "legal", "CLAIMS_REGISTER.md");
  const markdown = fs.readFileSync(registryPath, "utf8");
  const contractPhrases = [...contract.FORBIDDEN_CLAIM_PHRASES];
  assert(contractPhrases.length >= 40, `contract forbidden phrase list too small: ${contractPhrases.length}`);

  const registryCount = validateRegistrySync(markdown, contractPhrases);
  runSelfChecks(markdown, contractPhrases);
  console.log(`Forbidden claims sync passed: registry=${registryCount}, contract=${contractPhrases.length}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
