/**
 * Pacjent360 - result series projection.
 *
 * Builds chart-ready result series from existing observation/result records.
 * The projection is source-range based only: it does not infer medical norms,
 * diagnose, triage, or recommend treatment.
 */
(function initP360ResultSeries(root) {
  "use strict";

  const SOURCE_MISSING_REF = "source_missing";

  const STATUS_LABELS = Object.freeze({
    within: "w zakresie ze zrodla",
    above: "poza zakresem ze zrodla - powyzej",
    below: "poza zakresem ze zrodla - ponizej",
    descriptive: "skala opisowa, bez zakresu referencyjnego",
    unknown: "brak danych do porownania z zakresem"
  });

  const NORM_DOMAIN_MIN_ABS = 2;
  const NORM_DOMAIN_MAX_ABS = 4;

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function toDateMs(value) {
    if (!value) return null;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  function normalizeSourceRefs(refs, fallbackRef) {
    const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
    const normalized = [...new Set(list.map(String).filter(Boolean))];
    if (normalized.length) return normalized;
    return fallbackRef ? [fallbackRef] : [SOURCE_MISSING_REF];
  }

  function normalizeRange(record) {
    const min = toNumber(record && record.normalMin);
    const max = toNumber(record && record.normalMax);
    if (min !== null && max !== null && min < max) {
      return {
        kind: "numeric",
        min,
        max,
        unit: record.unit || "",
        label: record && record.rangeLabel
          ? String(record.rangeLabel)
          : `${record.normalMin}-${record.normalMax}${record.unit ? ` ${record.unit}` : ""}`
      };
    }

    if (record && record.rangeLabel) {
      return {
        kind: "descriptive",
        label: String(record.rangeLabel),
        unit: record.unit || ""
      };
    }

    return {
      kind: "missing",
      label: "brak zakresu referencyjnego ze zrodla",
      unit: record && record.unit || ""
    };
  }

  function pointStatus(value, range) {
    const number = toNumber(value);
    if (range.kind === "descriptive") return "descriptive";
    if (range.kind !== "numeric" || number === null) return "unknown";
    if (number < range.min) return "below";
    if (number > range.max) return "above";
    return "within";
  }

  function normIndexFor(value, range) {
    const number = toNumber(value);
    if (range.kind !== "numeric" || number === null) return null;
    const halfRange = (range.max - range.min) / 2;
    if (!Number.isFinite(halfRange) || halfRange <= 0) return null;
    const midRange = (range.min + range.max) / 2;
    return (number - midRange) / halfRange;
  }

  function adaptiveVisualIndex(normIndex) {
    if (!Number.isFinite(normIndex)) return null;
    const sign = Math.sign(normIndex) || 1;
    const abs = Math.abs(normIndex);
    if (abs <= 1) return normIndex;
    return sign * (1 + Math.asinh(abs - 1));
  }

  function normMetricsFor(value, range) {
    const normIndex = normIndexFor(value, range);
    const adaptiveIndex = adaptiveVisualIndex(normIndex);
    if (adaptiveIndex === null) {
      return {
        normIndex: null,
        visualIndex: null,
        isVisualCapped: false
      };
    }
    const isVisualCapped = Math.abs(adaptiveIndex) > NORM_DOMAIN_MAX_ABS;
    return {
      normIndex,
      visualIndex: Math.max(-NORM_DOMAIN_MAX_ABS, Math.min(NORM_DOMAIN_MAX_ABS, adaptiveIndex)),
      isVisualCapped
    };
  }

  function comparePointDate(left, right) {
    const leftMs = toDateMs(left.date);
    const rightMs = toDateMs(right.date);
    if (leftMs !== null && rightMs !== null && leftMs !== rightMs) return leftMs - rightMs;
    return String(left.date || "").localeCompare(String(right.date || ""));
  }

  function normalizePoints(record, range) {
    const fallbackRef = record && record.id ? `manual:${record.id}` : SOURCE_MISSING_REF;
    const rawValues = Array.isArray(record && record.values) ? record.values : [];
    const values = rawValues.length ? rawValues : (
      record && Object.prototype.hasOwnProperty.call(record, "value")
        ? [{ date: record.date || record.observedAt || record.createdAt || "", value: record.value, sourceRefs: record.sourceRefs }]
        : []
    );

    return values
      .map((point, index) => {
        const value = toNumber(point && point.value);
        const normMetrics = normMetricsFor(value, range);
        return {
          id: point && point.id ? String(point.id) : `${record && record.id || "result"}:${index}`,
          date: point && point.date || "",
          value,
          rawValue: point && point.value,
          unit: point && point.unit || record && record.unit || "",
          sourceRefs: normalizeSourceRefs(point && point.sourceRefs || record && record.sourceRefs, fallbackRef),
          sourceNote: point && point.sourceNote || record && record.sourceNote || "",
          normIndex: normMetrics.normIndex,
          visualIndex: normMetrics.visualIndex,
          isVisualCapped: normMetrics.isVisualCapped,
          status: pointStatus(value, range)
        };
      })
      .sort(comparePointDate);
  }

  function buildChartDomain(points, range) {
    const values = points.map((point) => point.value).filter((value) => value !== null);
    if (range.kind === "numeric") {
      values.push(range.min, range.max);
    }
    if (!values.length) return { min: 0, max: 1 };

    let min = Math.min(...values);
    let max = Math.max(...values);
    const span = max - min || Math.max(Math.abs(max), 1);
    const rangeSpan = range.kind === "numeric" ? range.max - range.min : 0;
    const margin = Math.max(span * 0.12, rangeSpan * 0.16, 0.5);

    min -= margin;
    max += margin;
    if (range.kind === "numeric" && range.min >= 0 && min < 0) min = 0;
    if (min === max) max = min + 1;
    return { min, max };
  }

  function buildNormDomain(points, range) {
    if (range.kind !== "numeric") return null;
    const visualValues = points
      .map((point) => point.visualIndex)
      .filter((value) => Number.isFinite(value));
    const maxAbs = Math.min(
      NORM_DOMAIN_MAX_ABS,
      Math.max(NORM_DOMAIN_MIN_ABS, ...visualValues.map((value) => Math.abs(value)))
    );
    return {
      min: -maxAbs,
      max: maxAbs,
      normalMin: -1,
      normalMax: 1,
      visualLimit: NORM_DOMAIN_MAX_ABS,
      isAdaptive: true,
      hasCappedPoints: points.some((point) => point.isVisualCapped)
    };
  }

  function buildSeries(record) {
    const range = normalizeRange(record || {});
    const points = normalizePoints(record || {}, range);
    const latest = points.length ? points[points.length - 1] : null;
    const status = latest ? latest.status : "unknown";
    return {
      id: record && record.id || "",
      name: record && (record.name || record.parameter || record.description) || "Wynik",
      type: record && record.type || "laboratorium",
      unit: record && record.unit || "",
      range,
      points,
      latest,
      status,
      chartDomain: buildChartDomain(points, range),
      normDomain: buildNormDomain(points, range),
      scaleMode: range.kind === "numeric" ? "adaptiveNormPosition" : "valueOnly"
    };
  }

  function statusLabel(status, range) {
    if (status === "descriptive" && range && range.label) return range.label;
    return STATUS_LABELS[status] || STATUS_LABELS.unknown;
  }

  function statusClass(status) {
    if (status === "within") return "done";
    if (status === "above" || status === "below") return "pending";
    return "info";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatNumber(value) {
    if (value == null) return "";
    return Number(value).toLocaleString("pl-PL", { maximumFractionDigits: 3 });
  }

  function pointTitle(point, series) {
    const unit = point.unit || series.unit || "";
    const parts = [
      `${point.date || "brak daty"}: ${formatNumber(point.value)} ${unit}`.trim(),
      statusLabel(point.status, series.range),
      `zrodlo: ${(point.sourceRefs || []).join(", ") || SOURCE_MISSING_REF}`
    ];
    if (Number.isFinite(point.normIndex)) {
      parts.push(`pozycja wzgledem normy: ${formatNumber(point.normIndex)}`);
    }
    if (point.isVisualCapped) {
      parts.push("poza limitem skali wizualnej");
    }
    return parts.join(" - ");
  }

  function renderChart(series, options = {}) {
    const width = Number(options.width) || 420;
    const requestedMode = options.mode || "combined";
    const hasNormPanel = Boolean(series.normDomain && series.range && series.range.kind === "numeric");
    const mode = requestedMode === "combined" && !hasNormPanel ? "value"
      : requestedMode === "normPosition" && !hasNormPanel ? "value"
      : requestedMode;
    const height = Number(options.height) || (mode === "combined" ? 240 : 150);
    const left = 34;
    const right = width - 18;
    const plotWidth = right - left;
    const points = series.points || [];
    const valuePanel = mode === "combined"
      ? { top: 18, bottom: 104 }
      : { top: 18, bottom: height - 38 };
    const normPanel = mode === "combined"
      ? { top: 138, bottom: height - 38 }
      : { top: 18, bottom: height - 38 };
    const yFor = (value, domain, panel) => {
      const span = domain.max - domain.min || 1;
      return panel.bottom - ((value - domain.min) / span) * (panel.bottom - panel.top);
    };
    const dateValues = points.map((point) => toDateMs(point.date)).filter((ms) => ms !== null);
    const minDate = dateValues.length ? Math.min(...dateValues) : null;
    const maxDate = dateValues.length ? Math.max(...dateValues) : null;
    const xFor = (point, index) => {
      const ms = toDateMs(point.date);
      if (ms !== null && minDate !== null && maxDate !== null && minDate !== maxDate) {
        return left + ((ms - minDate) / (maxDate - minDate)) * plotWidth;
      }
      return points.length <= 1 ? left + plotWidth / 2 : left + (index / (points.length - 1)) * plotWidth;
    };
    const valueDomain = series.chartDomain || { min: 0, max: 1 };
    const valueCoords = points
      .filter((point) => point.value !== null)
      .map((point, index) => ({ point, x: xFor(point, index), y: yFor(point.value, valueDomain, valuePanel) }));
    const valuePolyline = valueCoords.map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" ");
    const valueBand = series.range && series.range.kind === "numeric" && mode !== "normPosition"
      ? {
          y1: yFor(series.range.max, valueDomain, valuePanel),
          y2: yFor(series.range.min, valueDomain, valuePanel)
        }
      : null;
    const normDomain = series.normDomain || { min: -NORM_DOMAIN_MIN_ABS, max: NORM_DOMAIN_MIN_ABS };
    const normCoords = hasNormPanel
      ? points
          .filter((point) => point.visualIndex !== null)
          .map((point, index) => ({ point, x: xFor(point, index), y: yFor(point.visualIndex, normDomain, normPanel) }))
      : [];
    const normPolyline = normCoords.map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" ");
    const normBand = hasNormPanel
      ? {
          y1: yFor(1, normDomain, normPanel),
          y2: yFor(-1, normDomain, normPanel),
          mid: yFor(0, normDomain, normPanel)
        }
      : null;
    const axisLabel = series.range && series.range.kind === "numeric"
      ? `Zakres ze zrodla: ${series.range.label}`
      : (series.range && series.range.label) || "Brak zakresu liczbowego ze zrodla";
    const valuePanelSvg = mode === "normPosition" ? "" : `
        <g class="p360-result-chart-panel p360-result-chart-value-panel">
          <line class="p360-result-chart-axis" x1="${left}" y1="${valuePanel.bottom}" x2="${right}" y2="${valuePanel.bottom}"></line>
          <line class="p360-result-chart-axis" x1="${left}" y1="${valuePanel.top}" x2="${left}" y2="${valuePanel.bottom}"></line>
          ${valueBand ? `<rect class="p360-result-chart-band" x="${left}" y="${Math.min(valueBand.y1, valueBand.y2).toFixed(1)}" width="${plotWidth}" height="${Math.abs(valueBand.y2 - valueBand.y1).toFixed(1)}"></rect>` : ""}
          ${valueBand ? `<line class="p360-result-chart-range-line" x1="${left}" y1="${valueBand.y1.toFixed(1)}" x2="${right}" y2="${valueBand.y1.toFixed(1)}"></line><line class="p360-result-chart-range-line" x1="${left}" y1="${valueBand.y2.toFixed(1)}" x2="${right}" y2="${valueBand.y2.toFixed(1)}"></line>` : ""}
          ${valuePolyline ? `<polyline class="p360-result-chart-line" points="${valuePolyline}"></polyline>` : ""}
          ${valueCoords.map(({ point, x, y }) => `
            <circle class="p360-result-chart-point status-${escapeHtml(point.status)}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.3">
              <title>${escapeHtml(pointTitle(point, series))}</title>
            </circle>
          `).join("")}
          <text class="p360-result-chart-panel-label" x="${left}" y="${valuePanel.top - 6}">Wartosc rzeczywista</text>
        </g>`;
    const normPanelSvg = mode === "value" || !hasNormPanel ? "" : `
        <g class="p360-result-chart-panel p360-result-chart-norm-panel">
          <line class="p360-result-chart-axis" x1="${left}" y1="${normPanel.bottom}" x2="${right}" y2="${normPanel.bottom}"></line>
          <line class="p360-result-chart-axis" x1="${left}" y1="${normPanel.top}" x2="${left}" y2="${normPanel.bottom}"></line>
          <rect class="p360-result-chart-band p360-result-chart-norm-band" x="${left}" y="${Math.min(normBand.y1, normBand.y2).toFixed(1)}" width="${plotWidth}" height="${Math.abs(normBand.y2 - normBand.y1).toFixed(1)}"></rect>
          <line class="p360-result-chart-range-line" x1="${left}" y1="${normBand.y1.toFixed(1)}" x2="${right}" y2="${normBand.y1.toFixed(1)}"></line>
          <line class="p360-result-chart-range-line" x1="${left}" y1="${normBand.y2.toFixed(1)}" x2="${right}" y2="${normBand.y2.toFixed(1)}"></line>
          <line class="p360-result-chart-midline" x1="${left}" y1="${normBand.mid.toFixed(1)}" x2="${right}" y2="${normBand.mid.toFixed(1)}"></line>
          ${normPolyline ? `<polyline class="p360-result-chart-line p360-result-chart-norm-line" points="${normPolyline}"></polyline>` : ""}
          ${normCoords.map(({ point, x, y }) => `
            <circle class="p360-result-chart-point status-${escapeHtml(point.status)}${point.isVisualCapped ? " capped" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${point.isVisualCapped ? "5.2" : "4.3"}">
              <title>${escapeHtml(pointTitle(point, series))}</title>
            </circle>
            ${point.isVisualCapped ? `<path class="p360-result-chart-cap" d="M ${x.toFixed(1)} ${(point.visualIndex > 0 ? y - 10 : y + 10).toFixed(1)} l 5 ${point.visualIndex > 0 ? 7 : -7} h -10 z"><title>${escapeHtml(pointTitle(point, series))}</title></path>` : ""}
          `).join("")}
          <text class="p360-result-chart-panel-label" x="${left}" y="${normPanel.top - 6}">Pozycja wzgledem zakresu ze zrodla</text>
          <text class="p360-result-chart-tick-label" x="${right - 22}" y="${normBand.y1.toFixed(1)}">+1</text>
          <text class="p360-result-chart-tick-label" x="${right - 22}" y="${normBand.mid.toFixed(1)}">0</text>
          <text class="p360-result-chart-tick-label" x="${right - 22}" y="${normBand.y2.toFixed(1)}">-1</text>
        </g>`;

    return `
      <svg class="p360-result-chart mode-${escapeHtml(mode)}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend ${escapeHtml(series.name)} wzgledem zakresu ze zrodla">
        ${valuePanelSvg}
        ${normPanelSvg}
        <text class="p360-result-chart-label" x="${left}" y="${height - 12}">${escapeHtml(axisLabel)}</text>
      </svg>
    `;
  }

  const api = Object.freeze({
    SOURCE_MISSING_REF,
    STATUS_LABELS,
    buildSeries,
    renderChart,
    statusClass,
    statusLabel
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.P360ResultSeries = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
