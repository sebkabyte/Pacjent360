#!/usr/bin/env node
// Governance-pack No-CDSS guardrail.
// This repo already keeps executable safety checks for forbidden clinical copy,
// source-preserved text, caregiver scope and harm gates. Run those checks instead
// of raw-grepping docs that intentionally contain forbidden phrases as rules.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checks = [
  ["forbidden claims registry sync", "tools/validate-forbidden-claims-sync.js"],
  ["definition of harm gates", "tools/validate-harm-gates.js"],
  ["A1 safe dashboard copy gate", "tools/validate-a1-core-dashboard.js"],
  ["A3/A5 quality copy gate", "tools/validate-a3-a5-quality.js"],
  ["A6 checklist copy gate", "tools/validate-a6-checklist.js"],
  ["public glossary safety copy", "tools/validate-glossary.js"]
];

const failures = [];

const normalSurfaceFiles = [
  "public/app.js",
  "public/demo.html",
  "public/styles.css",
  "public/moja-historia.js"
];

const forbiddenNormalUiPatterns = [
  ["outlier", /\boutliers?\b/i],
  ["poza normą / w normie", /\b(?:poza\s+norm(?:a|ą|ie)?|w\s+normie)\b/i],
  ["odchylenie", /\bodchyleni[ea]\b/i],
  ["czerwony alert", /czerwony\s+alert/i],
  ["alert kliniczny", /alert\s+kliniczny/i],
  ["konflikt lekowy", /konflikt\s+lekowy/i],
  ["ryzyko interakcji", /ryzyko\s+interakcj/i],
  ["pilne", /\bpiln(?:e|y|a|ie|ych|ego)?\b/i],
  ["system wykrył", /system\s+wykry(?:ł|l|wa)/i],
  ["AI zauważyła", /\bAI\s+zauwa(?:żyła|zyla)/i],
  ["AI przygotowała", /\bAI\s+przygotowa(?:ła|la)/i],
  ["asystent analizuje", /asystent\s+analizuje/i],
  ["rekomendacja", /\brekomendacj(?:a|e|i|ą|e)\b/i],
  ["zalecenie", /\bzaleceni(?:e|a|em|u)\b/i]
];

function isAllowedNegativeBoundary(line) {
  const normalized = line.toLowerCase();
  return (
    /\bnie\b.{0,90}\b(?:zalec|rekomend)/i.test(normalized) ||
    /\bbrak\b.{0,90}\b(?:zalec|rekomend)/i.test(normalized) ||
    /\bbez\b.{0,90}\b(?:zalec|rekomend)/i.test(normalized) ||
    normalized.includes("forbidden") ||
    normalized.includes("zakazane") ||
    normalized.includes("do not") ||
    normalized.includes("no-cdss")
  );
}

function scanNormalUiSurfaces() {
  const hits = [];
  normalSurfaceFiles.forEach((file) => {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) return;
    const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes("sourceQuote") || line.includes("data-source-quote") || line.includes("tech=1")) return;
      forbiddenNormalUiPatterns.forEach(([label, pattern]) => {
        if (!pattern.test(line)) return;
        if ((label === "rekomendacja" || label === "zalecenie") && isAllowedNegativeBoundary(line)) return;
        hits.push(`${file}:${index + 1}: ${label}: ${line.trim()}`);
      });
    });
  });
  return hits;
}

const normalUiHits = scanNormalUiSurfaces();
if (normalUiHits.length) {
  failures.push({
    label: "normal UI forbidden clinical copy",
    script: "tools/check-no-cdss-copy.mjs",
    stdout: normalUiHits.join("\n"),
    stderr: ""
  });
}

for (const [label, script] of checks) {
  const result = spawnSync(process.execPath, [path.join(root, script)], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    failures.push({
      label,
      script,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim()
    });
  }
}

if (failures.length) {
  console.error("No-CDSS guard failed:");
  failures.forEach((failure) => {
    console.error(`\n[${failure.label}] ${failure.script}`);
    if (failure.stdout) console.error(failure.stdout);
    if (failure.stderr) console.error(failure.stderr);
  });
  process.exit(1);
}

console.log(`No-CDSS guard passed: ${checks.length} repo-native safety checks and normal UI copy scan are green.`);
