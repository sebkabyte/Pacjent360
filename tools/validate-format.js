const path = require("path");

const root = path.resolve(__dirname, "..");
const format = require(path.join(root, "public", "patient360-format.js"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expect(actual, expected, message) {
  assert(actual === expected, `${message}: expected "${expected}", got "${actual}"`);
}

try {
  expect(format.formatYears(1), "1 rok", "single year");
  expect(format.formatYears(2), "2 lata", "few years");
  expect(format.formatYears(5), "5 lat", "many years");
  expect(format.formatYears(12), "12 lat", "teen years");
  expect(format.formatYears(22), "22 lata", "compound few years");
  expect(format.formatYears(112), "112 lat", "compound teen years");

  expect(format.formatDocuments(1), "1 dokument", "single document");
  expect(format.formatDocuments(2), "2 dokumenty", "few documents");
  expect(format.formatDocuments(5), "5 dokumentów", "many documents");

  expect(format.formatQuestions(1), "1 pytanie", "single question");
  expect(format.formatQuestions(4), "4 pytania", "few questions");
  expect(format.formatQuestions(10), "10 pytań", "many questions");

  expect(format.formatGaps(1), "1 brak", "single gap");
  expect(format.formatGaps(3), "3 braki", "few gaps");
  expect(format.formatGaps(14), "14 braków", "teen gaps");

  console.log("Polish format validation passed");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
