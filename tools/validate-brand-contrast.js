const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const tokenPath = path.join(root, "public", "brand", "tokens.css");

function parseTokens(css) {
  const tokens = {};
  const tokenPattern = /--(p360-[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let match = tokenPattern.exec(css);
  while (match) {
    tokens[match[1]] = normalizeHex(match[2]);
    match = tokenPattern.exec(css);
  }
  return tokens;
}

function normalizeHex(hex) {
  const value = hex.replace("#", "");
  if (value.length === 3) {
    return `#${value.split("").map((char) => char + char).join("")}`.toLowerCase();
  }
  return `#${value.slice(0, 6)}`.toLowerCase();
}

function hexToRgb(hex) {
  const value = normalizeHex(hex).replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    b: Number.parseInt(value.slice(4, 6), 16) / 255
  };
}

function linear(channel) {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(foreground, background) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function token(tokens, name) {
  assert(tokens[name], `Missing token ${name}`);
  return tokens[name];
}

const css = fs.readFileSync(tokenPath, "utf8");
const tokens = parseTokens(css);

const pairs = [
  { label: "ink / paper", fg: "p360-color-ink", bg: "p360-color-paper", threshold: 4.5, kind: "text" },
  { label: "ink-strong / paper", fg: "p360-color-ink-strong", bg: "p360-color-paper", threshold: 4.5, kind: "text" },
  { label: "muted / paper", fg: "p360-color-muted", bg: "p360-color-paper", threshold: 4.5, kind: "text" },
  { label: "subtle / paper", fg: "p360-color-subtle", bg: "p360-color-paper", threshold: 4.5, kind: "small text" },
  { label: "teal / paper", fg: "p360-color-teal", bg: "p360-color-paper", threshold: 4.5, kind: "text" },
  { label: "teal-strong / teal-soft", fg: "p360-color-teal-strong", bg: "p360-color-teal-soft", threshold: 4.5, kind: "status text" },
  { label: "blue / blue-soft", fg: "p360-color-blue", bg: "p360-color-blue-soft", threshold: 4.5, kind: "status text" },
  { label: "amber / amber-soft", fg: "p360-color-amber", bg: "p360-color-amber-soft", threshold: 4.5, kind: "status text" },
  { label: "red / red-soft", fg: "p360-color-red", bg: "p360-color-red-soft", threshold: 4.5, kind: "status text" },
  { label: "green / green-soft", fg: "p360-color-green", bg: "p360-color-green-soft", threshold: 4.5, kind: "status text" },
  { label: "line-strong / paper", fg: "p360-color-line-strong", bg: "p360-color-paper", threshold: 3, kind: "UI boundary" },
  { label: "focus / paper", fg: "p360-color-blue", bg: "p360-color-paper", threshold: 3, kind: "UI focus" }
];

const failures = [];
console.log("Pacjent360 brand contrast");
for (const pair of pairs) {
  const fg = token(tokens, pair.fg);
  const bg = token(tokens, pair.bg);
  const ratio = contrast(fg, bg);
  const status = ratio >= pair.threshold ? "OK" : "FAIL";
  console.log(`${status} ${pair.label}: ${ratio.toFixed(2)}:1 (${pair.kind}, threshold ${pair.threshold}:1)`);
  if (status === "FAIL") {
    failures.push(`${pair.label} ${ratio.toFixed(2)}:1 < ${pair.threshold}:1`);
  }
}

if (failures.length) {
  console.error(`Brand contrast validation failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Brand contrast validation passed");
}
