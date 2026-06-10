// Definition of Harm gates (docs/governance/DEFINITION_OF_HARM.md)
// Static checks for harms that can be verified without a browser.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const contract = require(path.join(publicRoot, "patient360-contract.js"));
const caregiverModel = require(path.join(publicRoot, "patient360-caregiver-model.js"));

const errors = [];

function check(condition, harmId, message) {
  if (!condition) errors.push(`${harmId}: ${message}`);
}

function read(file) {
  return fs.readFileSync(path.join(publicRoot, file), "utf8");
}

const indexHtml = read("index.html");
const demoHtml = read("demo.html");
const appJs = read("app.js");

// H-001: forbidden clinical phrases are defined and non-empty
check(Array.isArray(contract.FORBIDDEN_CLAIM_PHRASES) && contract.FORBIDDEN_CLAIM_PHRASES.length >= 5,
  "H-001", "contract must define FORBIDDEN_CLAIM_PHRASES");
check(Array.isArray(caregiverModel.FORBIDDEN_CAREGIVER_PHRASES) && caregiverModel.FORBIDDEN_CAREGIVER_PHRASES.length >= 5,
  "H-001", "caregiver model must define FORBIDDEN_CAREGIVER_PHRASES");

// H-008: flag labels must not carry urgency language
const urgencyWords = ["pilne", "pilnie", "natychmiast", "alarm", "krytycz", "triage"];
const flagMeta = contract.FLAG_META || {};
Object.entries(flagMeta).forEach(([color, meta]) => {
  const label = String((meta && meta.label) || "").toLowerCase();
  urgencyWords.forEach((word) => {
    check(!label.includes(word), "H-008", `flag label for "${color}" must not contain urgency word "${word}"`);
  });
});

// H-008/H-001: timeline status labels must not interpret results clinically
const statusMeta = contract.TIMELINE_STATUS_META || {};
Object.entries(statusMeta).forEach(([key, meta]) => {
  const label = String((meta && meta.label) || "").toLowerCase();
  ["w normie", "poza norm", "diagnoz", "zalec"].forEach((word) => {
    check(!label.includes(word), "H-001", `timeline status "${key}" label must not contain "${word}"`);
  });
});

// H-010: demo must carry the fictional-data banner and noindex
check(/DANE FIKCYJNE|DANE DEMO/i.test(demoHtml), "H-010", "demo.html must show a fictional-data banner");
check(demoHtml.includes('name="robots" content="noindex,nofollow"'), "H-010", "demo.html must be noindex,nofollow");

// H-001/H-009: landing must state the system does not replace the doctor and must not discourage consultation
check(indexHtml.includes("Nie zastępuje lekarza") || /nie zast[eę]puje lekarza/i.test(indexHtml),
  "H-001", "index.html must state the system does not replace the doctor");
check(!/nie musisz i[śs][ćc] do lekarza|konsultacja nie jest potrzebna/i.test(indexHtml + demoHtml),
  "H-009", "public pages must not discourage medical consultation");

// H-003: explicit source_missing status must exist in the contract and be used by the app
check(contract.SOURCE_MISSING_REF === "source_missing", "H-003", "contract must define SOURCE_MISSING_REF as source_missing");
check(appJs.includes("SOURCE_MISSING_REF"), "H-003", "app.js must handle the explicit source_missing status");

// H-002: caregiver model must expose revocation-aware scope building
check(typeof caregiverModel.consentToScope === "function" && typeof caregiverModel.buildCaregiverModel === "function",
  "H-002", "caregiver model must expose consent scoping functions");

if (errors.length) {
  console.error("Definition of Harm gates failed:");
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("Definition of Harm gates passed");
