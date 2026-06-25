const test = require("node:test");
const assert = require("node:assert/strict");

const resultSeries = require("../public/p360-result-series.js");

test("numeric source range expands chart domain beyond values and reference range", () => {
  const series = resultSeries.buildSeries({
    id: "glucose",
    name: "Glukoza",
    unit: "mg/dl",
    normalMin: 70,
    normalMax: 99,
    rangeLabel: "70-99 mg/dl, zakres z dokumentu",
    values: [
      { date: "2026-01-01", value: 98, sourceRefs: ["doc:d1"] },
      { date: "2026-02-01", value: 104, sourceRefs: ["doc:d2"] }
    ]
  });

  assert.equal(series.range.kind, "numeric");
  assert.equal(series.range.label, "70-99 mg/dl, zakres z dokumentu");
  assert.equal(series.latest.status, "above");
  assert.ok(series.chartDomain.min <= 70);
  assert.ok(series.chartDomain.max >= 104);
});

test("CRP above source range is marked above without clinical wording", () => {
  const series = resultSeries.buildSeries({
    id: "crp",
    name: "CRP",
    unit: "mg/l",
    normalMin: 0,
    normalMax: 5,
    values: [
      { date: "2026-06-03", value: 18, sourceRefs: ["doc:d5"] },
      { date: "2026-06-07", value: 7, sourceRefs: ["doc:d6"] }
    ]
  });

  assert.equal(series.status, "above");
  assert.equal(resultSeries.statusLabel(series.status, series.range), "poza zakresem ze zrodla - powyzej");
  assert.ok(!/diagno|triage|zalec/i.test(resultSeries.statusLabel(series.status, series.range)));
});

test("numeric source range creates norm position indexes for midpoint and bounds", () => {
  const series = resultSeries.buildSeries({
    id: "bounded",
    name: "Parametr",
    unit: "u",
    normalMin: 10,
    normalMax: 20,
    values: [
      { date: "2026-01-01", value: 10, sourceRefs: ["doc:d1"] },
      { date: "2026-01-02", value: 15, sourceRefs: ["doc:d1"] },
      { date: "2026-01-03", value: 20, sourceRefs: ["doc:d1"] }
    ]
  });

  assert.equal(series.scaleMode, "adaptiveNormPosition");
  assert.equal(series.normDomain.normalMin, -1);
  assert.equal(series.normDomain.normalMax, 1);
  assert.equal(series.points[0].normIndex, -1);
  assert.equal(series.points[1].normIndex, 0);
  assert.equal(series.points[2].normIndex, 1);
  assert.equal(series.points[0].visualIndex, -1);
  assert.equal(series.points[1].visualIndex, 0);
  assert.equal(series.points[2].visualIndex, 1);
});

test("extreme CRP value keeps raw value and caps adaptive visual index", () => {
  const series = resultSeries.buildSeries({
    id: "crp-extreme",
    name: "CRP",
    unit: "mg/l",
    normalMin: 0.5,
    normalMax: 2.5,
    values: [
      { date: "2026-06-01", value: 1.5, sourceRefs: ["doc:d1"] },
      { date: "2026-06-10", value: 240, sourceRefs: ["doc:d2"] }
    ]
  });
  const latest = series.latest;
  const svg = resultSeries.renderChart(series);

  assert.equal(latest.rawValue, 240);
  assert.ok(latest.normIndex > 200);
  assert.equal(latest.visualIndex, 4);
  assert.equal(latest.isVisualCapped, true);
  assert.equal(series.normDomain.max, 4);
  assert.ok(svg.includes("mode-combined"));
  assert.ok(svg.includes("240 mg/l"));
  assert.ok(svg.includes("zrodlo: doc:d2"));
});

test("below-range values sit below the neutral norm band", () => {
  const series = resultSeries.buildSeries({
    id: "below",
    name: "Parametr",
    unit: "u",
    normalMin: 10,
    normalMax: 20,
    values: [{ date: "2026-01-01", value: 5, sourceRefs: ["doc:d1"] }]
  });

  assert.equal(series.latest.status, "below");
  assert.ok(series.latest.normIndex < -1);
  assert.ok(series.latest.visualIndex < -1);
});

test("descriptive result scale does not render a numeric normal band", () => {
  const series = resultSeries.buildSeries({
    id: "activity",
    name: "Aktywnosc",
    unit: "skala 0-5",
    rangeLabel: "skala opisowa, bez zakresu referencyjnego",
    values: [
      { date: "2026-06-01", value: 2, sourceRefs: ["interview:i1"] },
      { date: "2026-06-10", value: 4, sourceRefs: ["interview:i1"] }
    ]
  });
  const svg = resultSeries.renderChart(series);

  assert.equal(series.range.kind, "descriptive");
  assert.equal(series.scaleMode, "valueOnly");
  assert.equal(series.normDomain, null);
  assert.equal(series.status, "descriptive");
  assert.ok(!svg.includes("p360-result-chart-band"));
  assert.ok(!svg.includes("p360-result-chart-norm-panel"));
});

test("same parameter with different units stays as separate projections", () => {
  const mg = resultSeries.buildSeries({
    id: "crp-mg",
    name: "CRP",
    unit: "mg/l",
    normalMin: 0,
    normalMax: 5,
    values: [{ date: "2026-06-01", value: 4, sourceRefs: ["doc:d1"] }]
  });
  const other = resultSeries.buildSeries({
    id: "crp-other",
    name: "CRP",
    unit: "mg/dl",
    normalMin: 0,
    normalMax: 0.5,
    values: [{ date: "2026-06-01", value: 0.4, sourceRefs: ["doc:d2"] }]
  });

  assert.notEqual(mg.id, other.id);
  assert.notEqual(mg.unit, other.unit);
  assert.equal(mg.points.length, 1);
  assert.equal(other.points.length, 1);
});
