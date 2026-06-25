const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const FILES = [
  "public/index.html",
  "public/demo.html",
  "public/disclaimer.html",
  "public/privacy.html",
  "public/app.js",
  "public/p360-result-series.js",
  "public/patient360-previsit-model.js",
  "public/patient360-consent-model.js",
  "public/patient360-demo-data.js"
];

const FORBIDDEN_EXACT = [
  "HITL",
  "NFZ one-pager",
  "poza normą",
  "Brak nowych alarmów",
  "Scenariusz jak call center",
  "Raport preview",
  "Ten flow",
  "Medication Story",
  "Known / Unknown / Uncertain / To verify",
  "Known / Unknown / To verify",
  "Disclaimer medyczny",
  ">Disclaimer<",
  "Case studies",
  "case study",
  "Doctor in the Loop",
  "Pre-Op",
  "Dane wspierające",
  "Znane (Known)",
  "Nieznane (Unknown)",
  "Niepewne (Uncertain)",
  "Do weryfikacji (To verify)",
  "tracking",
  "feedbacku",
  "workflow"
];

const REQUIRED = [
  { file: "public/app.js", text: "Znane / Nieznane / Niepewne / Do weryfikacji" },
  { file: "public/app.js", text: "Historia leków" },
  { file: "public/app.js", text: "Przypadki demonstracyjne" },
  { file: "public/app.js", text: "Scenariusz rozmowy kontekstowej" },
  { file: "public/p360-result-series.js", text: "poza zakresem ze zrodla" },
  { file: "public/patient360-previsit-model.js", text: "Zgody" },
  { file: "public/patient360-previsit-model.js", text: "Ten widok porządkuje dane" },
  { file: "public/index.html", text: "Znane, nieznane, niepewne i do weryfikacji" },
  { file: "public/disclaimer.html", text: "Zastrzeżenie medyczne" },
  { file: "public/privacy.html", text: "narzędzia śledzące" }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

try {
  const contents = new Map(FILES.map((file) => [file, read(file)]));
  const errors = [];

  contents.forEach((content, file) => {
    FORBIDDEN_EXACT.forEach((phrase) => {
      if (content.includes(phrase)) {
        errors.push(`${file}: forbidden public glossary phrase "${phrase}"`);
      }
    });
  });

  REQUIRED.forEach(({ file, text }) => {
    if (!contents.get(file)?.includes(text)) {
      errors.push(`${file}: required glossary phrase missing "${text}"`);
    }
  });

  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Public glossary validation passed");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
