/**
 * @file p360-report.js
 * @description Pacjent360 — Moja Historia: printable pre-visit & full report generator.
 *
 * Generates clean, A4-printable HTML reports from local IndexedDB data.
 * Requires p360-store.js to be loaded first and uses p360-result-series.js when available.
 *
 * PROTOTYP — To nie jest porada medyczna.
 *
 * @version 1.0.0
 * @license MPL-2.0
 */

/* global P360Store, P360ResultSeries, self */
;(function (root) {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────────────

  /**
   * Format an ISO date string to Polish locale display.
   * @param {string|undefined} isoDate
   * @returns {string}
   */
  function formatDate(isoDate) {
    if (!isoDate) return '—';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      return d.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  }

  /**
   * Format date and time.
   * @param {string|undefined} isoDate
   * @returns {string}
   */
  function formatDateTime(isoDate) {
    if (!isoDate) return '—';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      return d.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDate;
    }
  }

  /**
   * Escape HTML entities.
   * @param {string} str
   * @returns {string}
   */
  function esc(str) {
    if (!str) return '';
    const el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }

  /**
   * Human-readable severity badge (1-5).
   * @param {number} severity
   * @returns {string}
   */
  function severityLabel(severity) {
    const labels = {
      1: 'Łagodny',
      2: 'Lekki',
      3: 'Umiarkowany',
      4: 'Znaczny',
      5: 'Bardzo znaczny',
    };
    return labels[severity] || `${severity}/5`;
  }

  /**
   * Translate document type to Polish label.
   * @param {string} type
   * @returns {string}
   */
  function docTypeLabel(type) {
    const labels = {
      wypis: 'Wypis',
      wynik: 'Wynik',
      skierowanie: 'Skierowanie',
      recepta: 'Recepta',
      inny: 'Inny',
    };
    return labels[type] || type || '—';
  }

  /**
   * Translate medication type to Polish label.
   * @param {string} type
   * @returns {string}
   */
  function medTypeLabel(type) {
    const labels = {
      przepisany: 'Przepisany',
      przyjmowany: 'Przyjmowany',
      OTC: 'OTC',
      suplement: 'Suplement',
    };
    return labels[type] || type || '—';
  }

  /**
   * Translate question category to Polish label.
   * @param {string} cat
   * @returns {string}
   */
  function questionCatLabel(cat) {
    const labels = {
      do_lekarza: 'Do lekarza',
      do_farmaceuty: 'Do farmaceuty',
      'do_wyjaśnienia': 'Do wyjaśnienia',
    };
    return labels[cat] || cat || '—';
  }

  /**
   * Translate visit status to Polish label.
   * @param {string} status
   * @returns {string}
   */
  function visitStatusLabel(status) {
    const labels = {
      planowana: 'Planowana',
      odbyta: 'Odbyta',
      'odwołana': 'Odwołana',
    };
    return labels[status] || status || '—';
  }

  // ── Print Stylesheet ──────────────────────────────────────────────────

  const PRINT_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #1f2933;
      --ink-strong: #10242a;
      --muted: #607080;
      --subtle: #6b7785;
      --line: #d8e0e7;
      --paper: #ffffff;
      --wash: #f5f7f9;
      --teal: #0f766e;
      --teal-strong: #0f5c56;
      --teal-soft: #d9f0ee;
      --amber: #b45309;
      --amber-soft: #fff4d6;
      --red: #b42318;
      --red-soft: #fde3df;
      --green: #15803d;
      --green-soft: #dcfce7;
      --blue: #1d4ed8;
      --blue-soft: #dbeafe;
    }

    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--ink);
      background: var(--paper);
      padding: 0;
      margin: 0;
    }

    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      section { break-inside: avoid; }
    }

    @media screen {
      body {
        max-width: 210mm;
        margin: 24px auto;
        padding: 32px 28px;
        border: 1px solid var(--line);
        box-shadow: 0 10px 30px rgba(31,41,51,0.08);
      }
    }

    /* ── Header ─────────────────────────────────────── */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 3px solid var(--teal);
      margin-bottom: 24px;
    }
    .report-header h1 {
      font-size: 18pt;
      font-weight: 900;
      color: var(--ink-strong);
      letter-spacing: -0.02em;
      margin: 0;
    }
    .report-header .subtitle {
      font-size: 10pt;
      color: var(--muted);
      margin-top: 2px;
    }
    .report-header .brand {
      text-align: right;
      font-size: 9pt;
      color: var(--teal-strong);
      font-weight: 700;
    }
    .report-header .brand small {
      display: block;
      font-weight: 400;
      color: var(--muted);
      font-size: 8pt;
    }

    /* ── Patient info bar ───────────────────────────── */
    .patient-bar {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      padding: 12px 16px;
      background: var(--wash);
      border: 1px solid var(--line);
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 10pt;
    }
    .patient-bar dt {
      font-weight: 600;
      color: var(--muted);
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .patient-bar dd {
      font-weight: 600;
      color: var(--ink-strong);
      margin: 0;
    }

    /* ── Sections ────────────────────────────────────── */
    section {
      margin-bottom: 22px;
    }
    section h2 {
      font-size: 12pt;
      font-weight: 800;
      color: var(--teal-strong);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--teal-soft);
    }
    section h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: var(--ink-strong);
      margin: 12px 0 6px;
    }

    /* ── Tables ──────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-bottom: 8px;
    }
    thead th {
      text-align: left;
      font-weight: 700;
      color: var(--muted);
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 6px 8px;
      border-bottom: 2px solid var(--line);
    }
    tbody td {
      padding: 7px 8px;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }

    /* ── Badges ──────────────────────────────────────── */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 700;
      line-height: 1.4;
      white-space: nowrap;
    }
    .badge-teal  { background: var(--teal-soft); color: var(--teal-strong); }
    .badge-amber { background: var(--amber-soft); color: var(--amber); }
    .badge-green { background: var(--green-soft); color: var(--green); }
    .badge-red   { background: var(--red-soft); color: var(--red); }
    .badge-blue  { background: var(--blue-soft); color: var(--blue); }

    /* ── Severity dots ──────────────────────────────── */
    .severity {
      display: inline-flex;
      gap: 3px;
      align-items: center;
    }
    .severity .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--line);
    }
    .severity .dot.active { background: var(--teal); }
    .severity-4 .dot.active { background: var(--amber); }
    .severity-5 .dot.active { background: var(--red); }

    /* ── Question list ──────────────────────────────── */
    .question-list {
      list-style: none;
      padding: 0;
    }
    .question-list li {
      padding: 8px 12px;
      margin-bottom: 6px;
      background: var(--wash);
      border: 1px solid var(--line);
      border-left: 4px solid var(--teal);
      border-radius: 6px;
      font-size: 10pt;
    }
    .question-list li .cat {
      font-size: 8pt;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Empty state ────────────────────────────────── */
    .empty {
      padding: 12px 16px;
      color: var(--subtle);
      font-style: italic;
      font-size: 9.5pt;
      background: var(--wash);
      border-radius: 6px;
      text-align: center;
    }

    /* ── Disclaimer ─────────────────────────────────── */
    .disclaimer {
      margin-top: 28px;
      padding: 14px 16px;
      background: var(--red-soft);
      border: 1px solid #f5c5bf;
      border-left: 5px solid var(--red);
      border-radius: 8px;
      font-size: 9pt;
      color: var(--red);
      font-weight: 600;
    }
    .disclaimer strong {
      display: block;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    /* ── Footer ─────────────────────────────────────── */
    .report-footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: var(--subtle);
    }
  `;

  // ── Severity HTML helper ───────────────────────────────────────────────

  /**
   * Render severity as visual dots (1-5).
   * @param {number} level
   * @returns {string}
   */
  function severityDots(level) {
    const n = Math.max(1, Math.min(5, level || 1));
    const cls = n >= 5 ? 'severity-5' : n >= 4 ? 'severity-4' : '';
    let html = `<span class="severity ${cls}" title="${severityLabel(n)} (${n}/5)">`;
    for (let i = 1; i <= 5; i++) {
      html += `<span class="dot${i <= n ? ' active' : ''}"></span>`;
    }
    html += `<span style="font-size:8pt;margin-left:4px;color:var(--muted)">${n}/5</span></span>`;
    return html;
  }

  // ── Section builders ───────────────────────────────────────────────────

  /**
   * Build the HTML header section.
   * @param {Object|null} profile
   * @param {string} title
   * @param {string} [subtitle]
   * @returns {string}
   */
  function buildHeader(profile, title, subtitle) {
    const name = profile?.name || 'Pacjent';
    const dateStr = formatDate(new Date().toISOString());

    return `
      <header class="report-header">
        <div>
          <h1>${esc(title)}</h1>
          ${subtitle ? `<div class="subtitle">${esc(subtitle)}</div>` : ''}
        </div>
        <div class="brand">
          Pacjent360<br>
          <small>Moja Historia</small>
        </div>
      </header>

      <dl class="patient-bar">
        <div>
          <dt>Pacjent</dt>
          <dd>${esc(name)}</dd>
        </div>
        ${profile?.birthYear ? `<div><dt>Rok urodzenia</dt><dd>${esc(String(profile.birthYear))}</dd></div>` : ''}
        ${profile?.bloodType ? `<div><dt>Grupa krwi</dt><dd>${esc(profile.bloodType)}</dd></div>` : ''}
        <div>
          <dt>Data raportu</dt>
          <dd>${dateStr}</dd>
        </div>
      </dl>
    `;
  }

  /**
   * Build allergies and conditions section.
   * @param {Object|null} profile
   * @returns {string}
   */
  function buildProfileDetails(profile) {
    if (!profile) return '';

    const allergies = profile.allergies || [];
    const conditions = profile.chronicConditions || [];

    if (allergies.length === 0 && conditions.length === 0) return '';

    let html = '<section><h2>Informacje o pacjencie</h2>';

    if (allergies.length > 0) {
      html += '<h3>Alergie</h3><p>';
      html += allergies.map(a => `<span class="badge badge-red">${esc(a)}</span>`).join(' ');
      html += '</p>';
    }

    if (conditions.length > 0) {
      html += '<h3>Stany przewlekłe</h3><p>';
      html += conditions.map(c => `<span class="badge badge-amber">${esc(c)}</span>`).join(' ');
      html += '</p>';
    }

    if (profile.emergencyContact) {
      html += `<h3>Kontakt w nagłych wypadkach</h3><p>${esc(profile.emergencyContact)}</p>`;
    }

    html += '</section>';
    return html;
  }

  /**
   * Build medications table.
   * @param {Object[]} meds
   * @param {Object} [options]
   * @param {boolean} [options.activeOnly=false]
   * @returns {string}
   */
  function buildMedications(meds, options = {}) {
    const list = options.activeOnly ? meds.filter(m => m.active) : meds;

    const heading = options.activeOnly ? 'Aktywne leki' : 'Leki';

    if (list.length === 0) {
      return `<section><h2>${heading}</h2><div class="empty">Brak danych o lekach.</div></section>`;
    }

    // Sort: active first, then by name
    list.sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '', 'pl');
    });

    let html = `<section><h2>${heading}</h2>`;
    html += `<table>
      <thead><tr>
        <th>Nazwa</th>
        <th>Dawka</th>
        <th>Częstotliwość</th>
        <th>Typ</th>
        <th>Przepisany przez</th>
        <th>Status</th>
      </tr></thead><tbody>`;

    for (const m of list) {
      const statusBadge = m.active
        ? '<span class="badge badge-green">Aktywny</span>'
        : '<span class="badge badge-amber">Zakończony</span>';

      html += `<tr>
        <td><strong>${esc(m.name)}</strong></td>
        <td>${esc(m.dose) || '—'}</td>
        <td>${esc(m.frequency) || '—'}</td>
        <td><span class="badge badge-teal">${esc(medTypeLabel(m.type))}</span></td>
        <td>${esc(m.prescribedBy) || '—'}</td>
        <td>${statusBadge}</td>
      </tr>`;
    }

    html += '</tbody></table></section>';
    return html;
  }

  /**
   * Build questions list.
   * @param {Object[]} questions
   * @param {Object} [options]
   * @param {boolean} [options.unansweredOnly=false]
   * @returns {string}
   */
  function buildQuestions(questions, options = {}) {
    const list = options.unansweredOnly ? questions.filter(q => !q.answered) : questions;

    const heading = options.unansweredOnly ? 'Otwarte pytania' : 'Pytania';

    if (list.length === 0) {
      return `<section><h2>${heading}</h2><div class="empty">Brak zapisanych pytań.</div></section>`;
    }

    let html = `<section><h2>${heading}</h2><ol class="question-list">`;
    for (const q of list) {
      html += `<li>
        <span class="cat">${esc(questionCatLabel(q.category))}</span><br>
        ${esc(q.text)}
        ${q.answered && q.answer ? `<br><em style="color:var(--green);font-size:9pt">✓ ${esc(q.answer)}</em>` : ''}
      </li>`;
    }
    html += '</ol></section>';
    return html;
  }

  /**
   * Build symptoms section.
   * @param {Object[]} symptoms
   * @returns {string}
   */
  function buildSymptoms(symptoms) {
    if (symptoms.length === 0) {
      return '<section><h2>Objawy</h2><div class="empty">Brak zapisanych objawów.</div></section>';
    }

    // Sort by startDate descending
    const sorted = [...symptoms].sort((a, b) => {
      return (b.startDate || '').localeCompare(a.startDate || '');
    });

    let html = '<section><h2>Objawy</h2>';
    html += `<table>
      <thead><tr>
        <th>Opis</th>
        <th>Obszar ciała</th>
        <th>Nasilenie</th>
        <th>Od kiedy</th>
        <th>Częstotliwość</th>
      </tr></thead><tbody>`;

    for (const s of sorted) {
      html += `<tr>
        <td>${esc(s.description)}${s.notes ? `<br><em style="font-size:8.5pt;color:var(--muted)">${esc(s.notes)}</em>` : ''}</td>
        <td>${esc(s.bodyArea) || '—'}</td>
        <td>${severityDots(s.severity)}</td>
        <td>${formatDate(s.startDate)}</td>
        <td>${esc(s.frequency) || '—'}</td>
      </tr>`;
    }

    html += '</tbody></table></section>';
    return html;
  }

  function resultValueLabel(value, unit) {
    if (value == null || value === '') return '—';
    return `${value}${unit ? ` ${unit}` : ''}`;
  }

  function resultSeriesForReport(result) {
    if (root.P360ResultSeries && typeof root.P360ResultSeries.buildSeries === 'function') {
      return root.P360ResultSeries.buildSeries(result);
    }

    const points = [...(result.values || [])]
      .filter((point) => point && point.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const latest = points.at(-1) || null;
    return {
      name: result.name || 'Parametr',
      unit: result.unit || '',
      range: {
        label: result.rangeLabel || (
          result.normalMin != null && result.normalMax != null
            ? `${result.normalMin}-${result.normalMax}${result.unit ? ` ${result.unit}` : ''}`
            : ''
        ),
      },
      latest,
      status: 'unknown',
    };
  }

  function resultStatusLabel(series) {
    if (root.P360ResultSeries && typeof root.P360ResultSeries.statusLabel === 'function') {
      return root.P360ResultSeries.statusLabel(series.status, series.range);
    }
    return series.status || 'brak statusu';
  }

  function resultBadgeClass(status) {
    if (status === 'within') return 'badge-green';
    if (status === 'above' || status === 'below') return 'badge-amber';
    if (status === 'descriptive') return 'badge-teal';
    return 'badge-blue';
  }

  /**
   * Build result series section.
   * @param {Object[]} results
   * @param {Object} [options]
   * @param {number} [options.limit]
   * @returns {string}
   */
  function buildResults(results, options = {}) {
    let list = [...(results || [])]
      .map((result) => ({ result, series: resultSeriesForReport(result) }))
      .sort((a, b) => String(b.series.latest?.date || '').localeCompare(String(a.series.latest?.date || '')));

    const heading = options.limit
      ? `Ostatnie wyniki (${Math.min(list.length, options.limit)} z ${list.length})`
      : 'Wyniki w czasie';

    if (list.length === 0) {
      return `<section><h2>${heading}</h2><div class="empty">Brak zapisanych wynikow.</div></section>`;
    }

    if (options.limit) {
      list = list.slice(0, options.limit);
    }

    let html = `<section><h2>${heading}</h2>`;
    html += `<table>
      <thead><tr>
        <th>Parametr</th>
        <th>Ostatni punkt</th>
        <th>Zakres ze zrodla</th>
        <th>Status opisowy</th>
        <th>Zrodlo punktu</th>
      </tr></thead><tbody>`;

    for (const item of list) {
      const { result, series } = item;
      const latest = series.latest || {};
      const source = latest.sourceNote || (Array.isArray(latest.sourceRefs) ? latest.sourceRefs.join(', ') : '');
      html += `<tr>
        <td><strong>${esc(series.name || result.name)}</strong>${series.unit ? `<br><em style="font-size:8.5pt;color:var(--muted)">${esc(series.unit)}</em>` : ''}</td>
        <td style="white-space:nowrap">${formatDate(latest.date)}<br><strong>${esc(resultValueLabel(latest.value, series.unit))}</strong></td>
        <td>${esc(series.range?.label) || '—'}</td>
        <td><span class="badge ${resultBadgeClass(series.status)}">${esc(resultStatusLabel(series))}</span></td>
        <td>${esc(source) || 'Reczny wpis uzytkownika'}</td>
      </tr>`;
    }

    html += '</tbody></table></section>';
    return html;
  }

  /**
   * Build documents summary table.
   * @param {Object[]} docs
   * @param {Object} [options]
   * @param {number} [options.limit] — Max number to show
   * @returns {string}
   */
  function buildDocuments(docs, options = {}) {
    let list = [...docs].sort((a, b) => {
      return (b.date || '').localeCompare(a.date || '');
    });

    const heading = options.limit
      ? `Ostatnie dokumenty (${Math.min(list.length, options.limit)} z ${list.length})`
      : 'Dokumenty';

    if (list.length === 0) {
      return `<section><h2>${heading}</h2><div class="empty">Brak zapisanych dokumentów.</div></section>`;
    }

    if (options.limit) {
      list = list.slice(0, options.limit);
    }

    let html = `<section><h2>${heading}</h2>`;
    html += `<table>
      <thead><tr>
        <th>Data</th>
        <th>Typ</th>
        <th>Tytuł</th>
        <th>Opis</th>
      </tr></thead><tbody>`;

    for (const d of list) {
      html += `<tr>
        <td style="white-space:nowrap">${formatDate(d.date)}</td>
        <td><span class="badge badge-blue">${esc(docTypeLabel(d.type))}</span></td>
        <td><strong>${esc(d.title)}</strong></td>
        <td>${esc(d.description) || '—'}</td>
      </tr>`;
    }

    html += '</tbody></table></section>';
    return html;
  }

  /**
   * Build visits section.
   * @param {Object[]} visits
   * @returns {string}
   */
  function buildVisits(visits) {
    if (visits.length === 0) {
      return '<section><h2>Wizyty</h2><div class="empty">Brak zapisanych wizyt.</div></section>';
    }

    const sorted = [...visits].sort((a, b) => {
      return (b.date || '').localeCompare(a.date || '');
    });

    let html = '<section><h2>Wizyty</h2>';
    html += `<table>
      <thead><tr>
        <th>Data</th>
        <th>Lekarz</th>
        <th>Specjalizacja</th>
        <th>Placówka</th>
        <th>Cel</th>
        <th>Status</th>
      </tr></thead><tbody>`;

    for (const v of sorted) {
      const statusCls = v.status === 'planowana' ? 'badge-amber'
        : v.status === 'odbyta' ? 'badge-green'
        : v.status === 'odwołana' ? 'badge-red'
        : 'badge-teal';

      html += `<tr>
        <td style="white-space:nowrap">${formatDate(v.date)}</td>
        <td>${esc(v.doctor) || '—'}</td>
        <td>${esc(v.specialty) || '—'}</td>
        <td>${esc(v.facility) || '—'}</td>
        <td>${esc(v.purpose) || '—'}</td>
        <td><span class="badge ${statusCls}">${esc(visitStatusLabel(v.status))}</span></td>
      </tr>`;
    }

    html += '</tbody></table></section>';
    return html;
  }

  /**
   * Build the disclaimer block.
   * @returns {string}
   */
  function buildDisclaimer() {
    return `
      <div class="disclaimer">
        <strong>⚠ PROTOTYP — TO NIE JEST PORADA MEDYCZNA</strong>
        Ten raport został wygenerowany automatycznie przez aplikację Pacjent360 — Moja Historia.
        Służy wyłącznie do uporządkowania informacji pacjenta przed wizytą lekarską.
        Nie stanowi porady medycznej, nie zastępuje konsultacji z lekarzem
        i nie powinien być traktowany jako dokument medyczny.
        Wszystkie decyzje zdrowotne podejmuje lekarz (zasada DITL — Doctor In The Loop).
      </div>
    `;
  }

  /**
   * Build the report footer.
   * @returns {string}
   */
  function buildFooter() {
    const now = formatDateTime(new Date().toISOString());
    return `
      <footer class="report-footer">
        <span>Pacjent360 — Moja Historia (prototyp)</span>
        <span>Wygenerowano: ${now}</span>
      </footer>
    `;
  }

  /**
   * Wrap body content in a full HTML document.
   * @param {string} title
   * @param {string} body
   * @returns {string}
   */
  function wrapDocument(title, body) {
    return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} — Pacjent360</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${body}
</body>
</html>`;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * @namespace P360Report
   * @description Report generator for Pacjent360 — Moja Historia.
   * Requires P360Store to be initialised before use.
   */
  const P360Report = {
    /**
     * Generate a pre-visit report for a specific visit.
     *
     * Includes: patient info, allergies/conditions, active medications,
     * open questions linked to the visit, recent symptoms, recent documents,
     * and the mandatory disclaimer.
     *
     * @param {string} visitId — The visit ID to generate the report for
     * @returns {Promise<string>} Complete HTML document string
     * @throws {Error} If the visit is not found
     */
    async generatePreVisitReport(visitId) {
      const store = root.P360Store;
      if (!store) throw new Error('P360Store nie jest załadowany.');

      const visit = await store.visits.get(visitId);
      if (!visit) {
        throw new Error(`Wizyta o id "${visitId}" nie została znaleziona.`);
      }

      const [profile, allMeds, allQuestions, allSymptoms, allDocs, allResults] = await Promise.all([
        store.profile.get(),
        store.medications.getAll(),
        store.questions.getAll(),
        store.symptoms.getAll(),
        store.documents.getAll(),
        store.results ? store.results.getAll() : Promise.resolve([]),
      ]);

      // Questions linked to this visit + unlinked unanswered ones
      const visitQuestions = allQuestions.filter(q =>
        q.visitId === visitId || (!q.visitId && !q.answered && q.category === 'do_lekarza')
      );

      // Visit-linked documents
      const visitDocIds = new Set(visit.documentIds || []);
      const visitDocs = visitDocIds.size > 0
        ? allDocs.filter(d => visitDocIds.has(d.id))
        : allDocs;

      const visitInfo = [
        visit.doctor ? `Lekarz: ${visit.doctor}` : null,
        visit.specialty ? `Specjalizacja: ${visit.specialty}` : null,
        visit.facility ? `Placówka: ${visit.facility}` : null,
        visit.purpose ? `Cel: ${visit.purpose}` : null,
      ].filter(Boolean).join(' · ');

      const subtitle = `Wizyta: ${formatDate(visit.date)}${visitInfo ? ' — ' + visitInfo : ''}`;

      let body = '';
      body += buildHeader(profile, 'Raport przedwizytowy', subtitle);
      body += buildProfileDetails(profile);

      // Visit details card
      body += `<section><h2>Szczegóły wizyty</h2>`;
      body += `<table><tbody>`;
      body += `<tr><td style="font-weight:600;width:140px">Data</td><td>${formatDate(visit.date)}</td></tr>`;
      if (visit.doctor) body += `<tr><td style="font-weight:600">Lekarz</td><td>${esc(visit.doctor)}</td></tr>`;
      if (visit.specialty) body += `<tr><td style="font-weight:600">Specjalizacja</td><td>${esc(visit.specialty)}</td></tr>`;
      if (visit.facility) body += `<tr><td style="font-weight:600">Placówka</td><td>${esc(visit.facility)}</td></tr>`;
      if (visit.purpose) body += `<tr><td style="font-weight:600">Cel wizyty</td><td>${esc(visit.purpose)}</td></tr>`;
      body += `<tr><td style="font-weight:600">Status</td><td><span class="badge badge-amber">${esc(visitStatusLabel(visit.status))}</span></td></tr>`;
      if (visit.notes) body += `<tr><td style="font-weight:600">Notatki</td><td>${esc(visit.notes)}</td></tr>`;
      body += `</tbody></table></section>`;

      body += buildMedications(allMeds, { activeOnly: true });
      body += buildQuestions(visitQuestions, { unansweredOnly: true });
      body += buildSymptoms(allSymptoms);
      body += buildResults(allResults, { limit: 10 });
      body += buildDocuments(visitDocs, { limit: 10 });
      body += buildDisclaimer();
      body += buildFooter();

      return wrapDocument('Raport przedwizytowy', body);
    },

    /**
     * Generate a complete report of all patient data.
     *
     * Includes: patient info, all medications, all visits, all documents,
     * all symptoms, all questions, and the mandatory disclaimer.
     *
     * @returns {Promise<string>} Complete HTML document string
     */
    async generateFullReport() {
      const store = root.P360Store;
      if (!store) throw new Error('P360Store nie jest załadowany.');

      const [profile, meds, questions, symptoms, docs, visits, results] = await Promise.all([
        store.profile.get(),
        store.medications.getAll(),
        store.questions.getAll(),
        store.symptoms.getAll(),
        store.documents.getAll(),
        store.visits.getAll(),
        store.results ? store.results.getAll() : Promise.resolve([]),
      ]);

      let body = '';
      body += buildHeader(profile, 'Pełny raport — Moja Historia');
      body += buildProfileDetails(profile);
      body += buildMedications(meds);
      body += buildVisits(visits);
      body += buildSymptoms(symptoms);
      body += buildResults(results);
      body += buildDocuments(docs);
      body += buildQuestions(questions);
      body += buildDisclaimer();
      body += buildFooter();

      return wrapDocument('Pełny raport — Moja Historia', body);
    },

    /**
     * Open a report in a new browser window for printing.
     * @param {string} html — Complete HTML document string
     */
    openPrintWindow(html) {
      const w = window.open('', '_blank', 'width=800,height=1100');
      if (!w) {
        throw new Error('Nie udało się otworzyć okna wydruku. Sprawdź blokadę wyskakujących okien.');
      }
      w.document.write(html);
      w.document.close();
      // Auto-trigger print dialog after render
      w.addEventListener('load', () => {
        setTimeout(() => w.print(), 300);
      });
    },

    /**
     * Download a report as an HTML file.
     * @param {string} html — Complete HTML document string
     * @param {string} [filename='raport-pacjent360.html']
     */
    downloadReport(html, filename = 'raport-pacjent360.html') {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 100);
    },
  };

  // ── UMD export ─────────────────────────────────────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = P360Report;
  } else {
    root.P360Report = P360Report;
  }

})(typeof self !== 'undefined' ? self : this);
