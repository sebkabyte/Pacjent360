const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const protocol = read("VALIDATION_PROTOCOL.md");
const form = read("VALIDATION_FEEDBACK_FORM.md");
const csv = read("VALIDATION_RESULTS_TEMPLATE.csv");

for (const [name, content] of Object.entries({
  "VALIDATION_PROTOCOL.md": protocol,
  "VALIDATION_FEEDBACK_FORM.md": form,
  "VALIDATION_RESULTS_TEMPLATE.csv": csv
})) {
  assert(!content.includes("1.txt"), `${name} should not reference private source file`);
  assert(!content.includes("linkedin-story"), `${name} should not reference private story file`);
  assert(!content.includes("DO UZUPELNIENIA"), `${name} should not contain placeholders`);
}

assert(protocol.includes("2 lekarzy POZ"), "Validation protocol should define POZ reviewers");
assert(protocol.includes("1 lekarz specjalista"), "Validation protocol should define specialist reviewer");
assert(protocol.includes("3 pacjent"), "Validation protocol should define patient/caregiver reviewers");
assert(protocol.includes("6 sesji walidacyjnych"), "Validation protocol should define six total sessions");
assert(protocol.includes(">= 4/6") && protocol.includes(">= 2/3"), "Validation metrics should separate all reviewers from patient/caregiver reviewers");

assert(form.includes("Session ID"), "Feedback form should contain session metadata");
assert(form.includes("Safety check"), "Feedback form should contain safety check section");
assert(form.includes("Continue") && form.includes("Pivot") && form.includes("No-go"), "Feedback form should contain decision options");
assert(form.includes("diagnoza") && form.includes("triage") && form.includes("zalecenie"), "Feedback form should check clinical safety wording");
assert(form.includes("Czy DITL jest zrozumiale"), "Feedback form should verify DITL understanding");
assert(form.includes("Nie wprowadzamy realnych danych"), "Feedback form should explicitly block real data");

const lines = csv.trim().split(/\r?\n/);
assert(lines.length >= 3, "CSV should contain header and example rows");
const header = lines[0].split(",");
for (const column of [
  "session_id",
  "reviewer_persona",
  "case_study",
  "used_real_data",
  "time_to_first_answer_seconds",
  "usefulness_1_5",
  "misinterpretation_risk_1_5",
  "ditl_understanding_1_5",
  "understood_without_help",
  "looked_like_diagnosis",
  "looked_like_triage",
  "looked_like_treatment_advice",
  "decision",
  "backlog_change"
]) {
  assert(header.includes(column), `CSV is missing required column: ${column}`);
}

for (const row of lines.slice(1)) {
  const cells = row.split(",");
  assert(cells.length === header.length, "CSV example rows must have the same column count as the header");
  const usedRealData = cells[header.indexOf("used_real_data")];
  assert(usedRealData === "NIE", "CSV example rows must not use real data");
}

console.log("Validation pack validation passed");
