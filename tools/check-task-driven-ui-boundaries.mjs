#!/usr/bin/env node
// Guardrail for task-driven Patient/Caregiver-first normal UI.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function check(condition, message, errors) {
  if (!condition) errors.push(message);
}

function setBlock(source, constName) {
  const match = source.match(new RegExp(`const\\s+${constName}\\s*=\\s*Object\\.freeze\\(new Set\\(\\[([\\s\\S]*?)\\]\\)\\);`));
  return match ? match[1] : "";
}

function blockIncludes(block, value) {
  return new RegExp(`["']${value}["']`).test(block);
}

function renderableIncludes(view) {
  return blockIncludes(renderableBlock, view) || (requiredNormalViews.includes(view) && renderableBlock.includes("...NORMAL_PRODUCT_VIEWS"));
}

const appJs = read("public/app.js");
const demoHtml = read("public/demo.html");
const stylesCss = read("public/styles.css");
const flagsJs = read("public/patient360-flags.js");
const deliveryContract = read("docs/governance/DELIVERY_CONTRACT_TASK_DRIVEN_UI.md");

const errors = [];

const requiredNormalViews = ["medicalHistory", "visitPreparation", "caregiverHome", "accessScope"];
const requiredRenderableViews = [...requiredNormalViews, "visitPacket", "postVisit"];
const forbiddenNormalViews = ["doctorBrief", "core", "roleStart", "a1Core", "s2Prototype", "audit"];
const normalBlock = setBlock(appJs, "NORMAL_PRODUCT_VIEWS");
const renderableBlock = setBlock(appJs, "NORMAL_RENDERABLE_PRODUCT_VIEWS");
const techOnlyBlock = setBlock(appJs, "TECH_ONLY_VIEWS");

check(Boolean(normalBlock), "app.js must define NORMAL_PRODUCT_VIEWS", errors);
check(Boolean(renderableBlock), "app.js must define NORMAL_RENDERABLE_PRODUCT_VIEWS", errors);

requiredNormalViews.forEach((view) => {
  check(blockIncludes(normalBlock, view), `NORMAL_PRODUCT_VIEWS missing ${view}`, errors);
  check(demoHtml.includes(`data-view="${view}"`), `demo.html missing normal nav item ${view}`, errors);
});

requiredRenderableViews.forEach((view) => {
  check(renderableIncludes(view), `NORMAL_RENDERABLE_PRODUCT_VIEWS missing ${view}`, errors);
});

forbiddenNormalViews.forEach((view) => {
  check(!blockIncludes(normalBlock, view), `NORMAL_PRODUCT_VIEWS must not include ${view}`, errors);
  check(!blockIncludes(renderableBlock, view), `NORMAL_RENDERABLE_PRODUCT_VIEWS must not include ${view}`, errors);
});

["doctorBrief", "roleStart", "a1Core", "s2Prototype", "audit"].forEach((view) => {
  check(blockIncludes(techOnlyBlock, view), `TECH_ONLY_VIEWS should include ${view}`, errors);
});

check(
  appJs.includes("return NORMAL_RENDERABLE_PRODUCT_VIEWS.has(view) && allowedViewsForRole(role).has(view);"),
  "normal mode canAccessViewForRole must restrict to NORMAL_RENDERABLE_PRODUCT_VIEWS",
  errors
);

check(
  appJs.includes(": NORMAL_PRODUCT_VIEWS.has(view);"),
  "normal sidebar rendering must restrict to NORMAL_PRODUCT_VIEWS",
  errors
);

check(
  appJs.includes("isTechMode() ? `<button") && appJs.includes('data-set-view="doctorBrief"'),
  "doctorBrief shortcut must remain tech-mode gated",
  errors
);

check(
  stylesCss.includes("body:not([data-tech-mode=\"true\"])[data-register=\"app\"] .evidence-panel"),
  "normal UI must hide permanent evidence/source panel",
  errors
);

check(
  flagsJs.includes("const REGULATED_FEATURES_ENABLED = false;"),
  "patient360-flags.js must define REGULATED_FEATURES_ENABLED = false",
  errors
);

check(
  flagsJs.includes("regulatedFeaturesEnabled: REGULATED_FEATURES_ENABLED"),
  "Patient360Flags must export regulatedFeaturesEnabled",
  errors
);

[
  "Zbliża się wizyta",
  "Brakuje dokumentu oznaczonego przez pacjenta/opiekuna",
  "Leki i alergie do potwierdzenia",
  "Nowy wpis od opiekuna",
  "Nowy dokument w historii",
  "Pytania zapisane do wizyty"
].forEach((label) => {
  check(deliveryContract.includes(label), `delivery contract missing allowed action card: ${label}`, errors);
});

[
  "Wynik poza normą",
  "Ryzyko lekowe",
  "Pilna sprawa",
  "AI przygotowała syntezę",
  "System wykrył odchylenie"
].forEach((label) => {
  check(deliveryContract.includes(label), `delivery contract missing forbidden action card: ${label}`, errors);
  check(!appJs.includes(label) && !demoHtml.includes(label), `normal UI source contains forbidden action card label: ${label}`, errors);
});

[
  "Asystent Wizyt",
  "AI chat",
  "LLM synthesis",
  "medication conflict detection",
  "interaction-risk detection",
  "urgency assessment",
  "triage"
].forEach((term) => {
  check(deliveryContract.includes(term) || deliveryContract.toLowerCase().includes(term.toLowerCase()), `delivery contract missing forbidden term: ${term}`, errors);
});

if (errors.length) {
  console.error("Task-driven UI boundary guard failed:");
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}

console.log("Task-driven UI boundary guard passed: normal UI remains Patient/Caregiver-first and regulated features are disabled.");
