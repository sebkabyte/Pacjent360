#!/usr/bin/env node
// Governance-pack guardrail for normal UI.
// It verifies that technical demo surfaces are gated behind ?tech=1 instead of
// grepping raw source, where technical strings are allowed to exist.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.resolve(root, process.argv[2] || "public");

const technicalViews = [
  "roleStart",
  "core",
  "patientPortal",
  "caregiverPortal",
  "s2Prototype",
  "a1Core",
  "visitChecklist",
  "doctorBrief",
  "interview",
  "documents",
  "timeline",
  "medications",
  "observations",
  "risks",
  "patientQuestions",
  "reports",
  "consent",
  "audit"
];

const normalViews = [
  "medicalHistory",
  "visitPreparation",
  "caregiverHome",
  "accessScope"
];

function read(file) {
  return fs.readFileSync(path.join(publicRoot, file), "utf8");
}

function check(condition, message, errors) {
  if (!condition) errors.push(message);
}

const errors = [];
const appJs = read("app.js");
const stylesCss = read("styles.css");
const demoHtml = read("demo.html");

check(appJs.includes("const NORMAL_PRODUCT_VIEWS"), "app.js must define NORMAL_PRODUCT_VIEWS", errors);
check(appJs.includes("const NORMAL_RENDERABLE_PRODUCT_VIEWS"), "app.js must define NORMAL_RENDERABLE_PRODUCT_VIEWS", errors);
check(
  appJs.includes("return NORMAL_RENDERABLE_PRODUCT_VIEWS.has(view) && allowedViewsForRole(role).has(view);"),
  "canAccessViewForRole must restrict normal mode to normal renderable product views",
  errors
);
check(
  appJs.includes(": NORMAL_PRODUCT_VIEWS.has(view);"),
  "sidebar rendering must restrict normal navigation to NORMAL_PRODUCT_VIEWS",
  errors
);

normalViews.forEach((view) => {
  check(demoHtml.includes(`data-view="${view}"`), `demo.html missing normal nav view ${view}`, errors);
});

technicalViews.forEach((view) => {
  check(
    stylesCss.includes(`.nav-item[data-view="${view}"]`) || view === "doctorBrief",
    `styles.css missing normal-mode hide selector for ${view}`,
    errors
  );
});

check(
  stylesCss.includes('.nav-section-label[data-nav-section="cockpits"]') &&
    stylesCss.includes('.nav-section-label[data-nav-section="library"]'),
  "styles.css must hide cockpit and data/source section headings in normal mode",
  errors
);

check(
  stylesCss.includes("body:not([data-tech-mode=\"true\"])[data-register=\"app\"] .evidence-panel"),
  "styles.css must hide evidence/source panel in normal product mode",
  errors
);

if (errors.length) {
  console.error("Normal UI technical-name guard failed:");
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}

console.log("Normal UI technical-name guard passed: technical demo surfaces are gated behind ?tech=1.");
