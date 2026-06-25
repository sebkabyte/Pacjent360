/**
 * Historia Życia — Pacjent360™ Life-Stage Scroll Biography
 * Groups patient data into life epochs with drill-down and source linking.
 * Depends on: P360Store (p360-store.js)
 * @version 0.1.0
 */
'use strict';

/* ================================================================== */
/*  EPOCH DEFINITIONS                                                  */
/* ================================================================== */

/**
 * Life stage definitions with medically relevant data categories.
 * Based on WHO Life Course Approach.
 */
const EPOCHS = [
  { key: 'noworodek',    label: 'Noworodek',           icon: '🍼', ageMin: 0,  ageMax: 1,  color: '#b2dfdb', gradient: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
    medicalFocus: ['Poród i APGAR', 'Szczepienia noworodkowe', 'Wady wrodzone', 'Alergie pokarmowe', 'Rozwój motoryczny'] },
  { key: 'dziecinstwo',  label: 'Wczesne dzieciństwo', icon: '🧒', ageMin: 1,  ageMax: 6,  color: '#a5d6a7', gradient: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
    medicalFocus: ['Szczepienia', 'Choroby zakaźne', 'Alergie', 'Rozwój mowy i motoryki', 'Wady postawy'] },
  { key: 'szkolne',      label: 'Lata szkolne',        icon: '📚', ageMin: 6,  ageMax: 12, color: '#90caf9', gradient: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
    medicalFocus: ['Bilanse szkolne', 'Wzrok', 'Ortodoncja', 'Urazy sportowe', 'ADHD / trudności w nauce'] },
  { key: 'dorastanie',   label: 'Dorastanie',          icon: '🎸', ageMin: 12, ageMax: 18, color: '#80cbc4', gradient: 'linear-gradient(135deg, #e0f2f1 0%, #80cbc4 100%)',
    medicalFocus: ['Pokwitanie', 'Zdrowie psychiczne', 'Migreny', 'Dieta i odżywianie', 'Szczepienia uzupełniające'] },
  { key: 'mloda_doroslosc', label: 'Młoda dorosłość',  icon: '🎓', ageMin: 18, ageMax: 30, color: '#ffe082', gradient: 'linear-gradient(135deg, #fffde7 0%, #ffe082 100%)',
    medicalFocus: ['Badania profilaktyczne', 'Ciąża / planowanie rodziny', 'Stres / wypalenie', 'Szczepienia podróżne', 'Uzależnienia'] },
  { key: 'dojrzalosc',   label: 'Dojrzałość',          icon: '🏠', ageMin: 30, ageMax: 50, color: '#ffcc80', gradient: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
    medicalFocus: ['Choroby przewlekłe', 'Nadciśnienie', 'Cukrzyca', 'Otyłość', 'Profilaktyka onkologiczna'] },
  { key: 'sredni',       label: 'Wiek średni',         icon: '⚖️', ageMin: 50, ageMax: 65, color: '#ffab91', gradient: 'linear-gradient(135deg, #fbe9e7 0%, #ffab91 100%)',
    medicalFocus: ['Kardiologia', 'Onkologia', 'Menopauza / andropauza', 'Osteoporoza', 'Wzrok i słuch'] },
  { key: 'starszy',      label: 'Wiek starszy',        icon: '🌿', ageMin: 65, ageMax: 999,color: '#a5d6a7', gradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    medicalFocus: ['Geriatria', 'Polipragmazja', 'Rehabilitacja', 'Opieka paliatywna', 'Upadki i mobilność'] },
];

/* ================================================================== */
/*  EPOCH RESOLVER                                                     */
/* ================================================================== */

/**
 * Resolves a date to a life epoch based on birth year.
 * @param {string} eventDate - ISO date string
 * @param {number} birthYear - Patient's birth year
 * @returns {Object} Epoch object with key, label, icon, etc.
 */
function resolveEpoch(eventDate, birthYear) {
  if (!eventDate || !birthYear) return EPOCHS[EPOCHS.length - 1];
  const eventYear = new Date(eventDate).getFullYear();
  const age = eventYear - birthYear;
  return EPOCHS.find(e => age >= e.ageMin && age < e.ageMax) || EPOCHS[EPOCHS.length - 1];
}

/**
 * Returns the epoch for a given age.
 * @param {number} age
 * @returns {Object}
 */
function epochForAge(age) {
  return EPOCHS.find(e => age >= e.ageMin && age < e.ageMax) || EPOCHS[EPOCHS.length - 1];
}

/* ================================================================== */
/*  DATA AGGREGATOR                                                    */
/* ================================================================== */

/**
 * Collects ALL patient data from P360Store and groups it by epoch.
 * Each item gets a `_source` field linking back to the original record.
 * @param {number} birthYear
 * @returns {Promise<Map<string, Object>>} Map of epochKey → { epoch, events[], summary }
 */
async function aggregateByEpoch(birthYear) {
  const [docs, meds, symptoms, results, visits, questions] = await Promise.all([
    P360Store.documents.getAll(),
    P360Store.medications.getAll(),
    P360Store.symptoms.getAll(),
    P360Store.results ? P360Store.results.getAll() : Promise.resolve([]),
    P360Store.visits.getAll(),
    P360Store.questions.getAll(),
  ]);

  /** @type {Map<string, {epoch: Object, events: Array, documents: Array, medications: Array, symptoms: Array, results: Array, visits: Array, questions: Array}>} */
  const epochMap = new Map();

  // Initialize all epochs
  for (const ep of EPOCHS) {
    epochMap.set(ep.key, {
      epoch: ep,
      events: [],
      documents: [],
      medications: [],
      symptoms: [],
      results: [],
      visits: [],
      questions: [],
    });
  }

  // Helper to place item in epoch
  const place = (item, dateField, collection, type) => {
    const date = item[dateField];
    const ep = resolveEpoch(date, birthYear);
    const bucket = epochMap.get(ep.key);
    if (!bucket) return;

    const enriched = {
      ...item,
      _type: type,
      _date: date,
      _sourceId: item.id,
      _sourceCollection: collection,
    };
    bucket.events.push(enriched);
    bucket[collection].push(enriched);
  };

  // Place all items
  docs.forEach(d => place(d, 'date', 'documents', 'document'));
  meds.forEach(m => place(m, 'startDate', 'medications', 'medication'));
  symptoms.forEach(s => place(s, 'startDate', 'symptoms', 'symptom'));
  results.forEach((result) => {
    (result.values || []).forEach((point, index) => {
      place({
        ...result,
        resultId: result.id,
        pointId: point.id || `${result.id}:${index}`,
        pointDate: point.date,
        pointValue: point.value,
        pointSourceRefs: point.sourceRefs || [],
        pointSourceNote: point.sourceNote || '',
        title: `Wynik: ${result.name || 'parametr'}`,
      }, 'pointDate', 'results', 'result');
    });
  });
  visits.forEach(v => place(v, 'date', 'visits', 'visit'));
  questions.forEach(q => place(q, 'createdAt', 'questions', 'question'));

  // Sort events within each epoch by date
  for (const [, bucket] of epochMap) {
    bucket.events.sort((a, b) => (a._date || '').localeCompare(b._date || ''));
  }

  return epochMap;
}

/* ================================================================== */
/*  SUMMARY GENERATOR                                                  */
/* ================================================================== */

/**
 * Generates a medically-oriented summary for an epoch.
 * Every summary item links to its source records.
 * @param {Object} bucket - Epoch bucket from aggregateByEpoch
 * @param {number} birthYear
 * @returns {Object} Summary with counts, key events, source links
 */
function generateEpochSummary(bucket, birthYear) {
  const { epoch, documents, medications, symptoms, results, visits, questions, events } = bucket;

  // Unique conditions/diagnoses mentioned
  const docTypes = {};
  documents.forEach(d => {
    docTypes[d.type || 'inny'] = (docTypes[d.type || 'inny'] || 0) + 1;
  });

  // Active medications in this epoch
  const activeMeds = medications.filter(m => m.active !== false);
  const archivedMeds = medications.filter(m => m.active === false);

  // Unanswered questions from this period
  const openQuestions = questions.filter(q => !q.answered);

  // Key events: most important items (visits + high-severity symptoms + docs)
  const keyEvents = [];

  // Add all visits as key events
  visits.forEach(v => {
    keyEvents.push({
      date: v.date,
      title: `Wizyta: ${v.doctor || v.specialty || 'lekarz'}`,
      detail: v.purpose || v.notes || '',
      icon: '🏥',
      sourceId: v.id,
      sourceCollection: 'visits',
    });
  });

  // Add high-severity symptoms
  symptoms.filter(s => (s.severity || 0) >= 3).forEach(s => {
    keyEvents.push({
      date: s.startDate,
      title: `Objaw: ${s.description}`,
      detail: `Nasilenie: ${s.severity}/5${s.bodyArea ? `, Obszar: ${s.bodyArea}` : ''}`,
      icon: '🌡️',
      sourceId: s.id,
      sourceCollection: 'symptoms',
    });
  });

  // Add important documents (wypis, wynik)
  documents.filter(d => d.type === 'wypis' || d.type === 'wynik').forEach(d => {
    keyEvents.push({
      date: d.date,
      title: `${d.type === 'wypis' ? 'Wypis' : 'Wynik'}: ${d.title}`,
      detail: d.description || '',
      icon: d.type === 'wypis' ? '📋' : '📊',
      sourceId: d.id,
      sourceCollection: 'documents',
    });
  });

  // Add source-bound result points without clinical interpretation.
  results.forEach(r => {
    const value = r.pointValue == null || r.pointValue === ''
      ? ''
      : `${r.pointValue}${r.unit ? ` ${r.unit}` : ''}`;
    keyEvents.push({
      date: r.pointDate,
      title: `Wynik: ${r.name || 'parametr'}`,
      detail: value ? `Wartosc: ${value}` : 'Wynik opisowy',
      icon: '\uD83D\uDCC8',
      sourceId: r.resultId || r.id,
      sourceCollection: 'results',
    });
  });

  // Sort key events by date
  keyEvents.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Age range display
  const ageRange = epoch.ageMax < 999
    ? `${epoch.ageMin}–${epoch.ageMax} lat`
    : `${epoch.ageMin}+ lat`;

  const yearRange = birthYear
    ? `${birthYear + epoch.ageMin}–${epoch.ageMax < 999 ? birthYear + epoch.ageMax : 'teraz'}`
    : '';

  return {
    epochKey: epoch.key,
    epochLabel: epoch.label,
    epochIcon: epoch.icon,
    ageRange,
    yearRange,
    hasData: events.length > 0,

    counts: {
      total: events.length,
      documents: documents.length,
      medications: medications.length,
      activeMeds: activeMeds.length,
      archivedMeds: archivedMeds.length,
      symptoms: symptoms.length,
      results: results.length,
      visits: visits.length,
      questions: questions.length,
      openQuestions: openQuestions.length,
    },

    docTypes,
    activeMeds: activeMeds.map(m => ({
      name: m.name,
      dose: m.dose,
      type: m.type,
      sourceId: m.id,
    })),
    archivedMeds: archivedMeds.map(m => ({
      name: m.name,
      dose: m.dose,
      sourceId: m.id,
    })),

    keyEvents: keyEvents.slice(0, 8),
    allEvents: events,

    medicalFocus: epoch.medicalFocus,
  };
}

/* ================================================================== */
/*  HTML RENDERER                                                      */
/* ================================================================== */

const HZ = {
  esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  fmtDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  },
};

/**
 * Renders the complete life biography into a container element.
 * @param {HTMLElement} container
 * @param {number} birthYear
 */
async function renderLifeBiography(container, birthYear) {
  if (!birthYear) {
    container.innerHTML = `
      <div class="hz-empty-state">
        <span class="hz-empty-icon">📅</span>
        <h2>Uzupełnij rok urodzenia</h2>
        <p>Aby zobaczyć historię życia podzieloną na etapy, przejdź do <strong>Mój profil</strong> i wpisz rok urodzenia.</p>
        <button class="p360-btn p360-btn-primary" onclick="app.switchSection('profile')">Przejdź do profilu</button>
      </div>
    `;
    return;
  }

  const epochMap = await aggregateByEpoch(birthYear);
  const summaries = [];
  for (const [, bucket] of epochMap) {
    summaries.push(generateEpochSummary(bucket, birthYear));
  }

  // Current age
  const currentAge = new Date().getFullYear() - birthYear;

  let html = '';

  // ── Sticky Mini-Map ──
  html += '<nav class="hz-minimap" aria-label="Etapy życia">';
  for (const s of summaries) {
    const isCurrent = currentAge >= EPOCHS.find(e => e.key === s.epochKey).ageMin &&
                      currentAge < EPOCHS.find(e => e.key === s.epochKey).ageMax;
    html += `<a href="#epoch-${s.epochKey}" class="hz-minimap-item${s.hasData ? ' has-data' : ''}${isCurrent ? ' current' : ''}"
                title="${HZ.esc(s.epochLabel)} (${s.ageRange})" aria-label="${HZ.esc(s.epochLabel)}">
      <span class="hz-minimap-icon">${s.epochIcon}</span>
      <span class="hz-minimap-label">${HZ.esc(s.epochLabel)}</span>
      ${s.counts.total > 0 ? `<span class="hz-minimap-count">${s.counts.total}</span>` : ''}
    </a>`;
  }
  html += '</nav>';

  // ── Epoch Sections ──
  for (const s of summaries) {
    const ep = EPOCHS.find(e => e.key === s.epochKey);

    html += `<section class="hz-epoch" id="epoch-${s.epochKey}" data-epoch="${s.epochKey}" style="--epoch-gradient: ${ep.gradient}; --epoch-color: ${ep.color};">`;

    // Epoch header (sticky)
    html += `
      <header class="hz-epoch-header">
        <span class="hz-epoch-icon">${ep.icon}</span>
        <div>
          <h2 class="hz-epoch-title">${HZ.esc(ep.label)}</h2>
          <span class="hz-epoch-range">${HZ.esc(s.ageRange)}${s.yearRange ? ` · ${HZ.esc(s.yearRange)}` : ''}</span>
        </div>
        ${s.counts.total > 0 ? `<span class="hz-epoch-badge">${s.counts.total} wpisów</span>` : '<span class="hz-epoch-badge hz-badge-empty">brak danych</span>'}
      </header>
    `;

    // Medical focus for this epoch
    html += '<div class="hz-medical-focus">';
    html += '<span class="hz-focus-label">Na co zwracać uwagę w tym okresie:</span>';
    html += '<div class="hz-focus-tags">';
    for (const focus of ep.medicalFocus) {
      html += `<span class="hz-focus-tag">${HZ.esc(focus)}</span>`;
    }
    html += '</div></div>';

    if (s.hasData) {
      // ── Timeline of events ──
      html += '<div class="hz-timeline">';
      html += '<div class="hz-timeline-line"></div>';

      for (const evt of s.allEvents) {
        html += renderEventCard(evt);
      }

      html += '</div>';

      // ── Summary Card ──
      html += renderSummaryCard(s);

    } else {
      // Empty state for this epoch
      html += `
        <div class="hz-epoch-empty">
          <p>Brak danych z tego okresu.</p>
          <p class="hz-epoch-empty-hint">Jeśli masz dokumenty z tego okresu — dodaj je w sekcji <strong>Dokumenty</strong>.</p>
        </div>
      `;
    }

    html += '</section>'; // close epoch
    html += '<div class="hz-epoch-divider"></div>';
  }

  // ── Footer disclaimer ──
  html += `
    <footer class="hz-footer">
      <p>⚠ PROTOTYP — To nie jest porada medyczna. Dane przechowywane lokalnie na Twoim urządzeniu.</p>
      <p>Historia życia jest generowana automatycznie z wprowadzonych przez Ciebie danych. Każda pozycja posiada odniesienie do źródła.</p>
    </footer>
  `;

  container.innerHTML = html;

  // ── Activate scroll animations ──
  activateScrollAnimations(container);
  activateMinimapHighlight(container);
  activateDrilldown(container);
}

/* ------------------------------------------------------------------ */
/*  Event Card Renderer                                                */
/* ------------------------------------------------------------------ */

function renderEventCard(evt) {
  const typeConfig = {
    document:   { icon: '📄', label: 'Dokument',  badgeClass: 'hz-badge-doc' },
    medication: { icon: '💊', label: 'Lek',       badgeClass: 'hz-badge-med' },
    symptom:    { icon: '🌡️', label: 'Objaw',     badgeClass: 'hz-badge-sym' },
    result:     { icon: '📈', label: 'Wynik',     badgeClass: 'hz-badge-doc' },
    visit:      { icon: '🏥', label: 'Wizyta',    badgeClass: 'hz-badge-vis' },
    question:   { icon: '❓', label: 'Pytanie',   badgeClass: 'hz-badge-que' },
  };

  const tc = typeConfig[evt._type] || typeConfig.document;
  const title = evt.title || evt.name || evt.description || evt.text || evt.doctor || 'Wpis';
  const subtitle = getEventSubtitle(evt);

  return `
    <article class="hz-event-card" data-source-id="${evt._sourceId}" data-source-collection="${evt._sourceCollection}">
      <div class="hz-event-dot">
        <span class="hz-event-dot-inner ${tc.badgeClass}">${tc.icon}</span>
      </div>
      <div class="hz-event-body">
        <div class="hz-event-header">
          <span class="hz-event-badge ${tc.badgeClass}">${HZ.esc(tc.label)}</span>
          <time class="hz-event-date">${HZ.fmtDate(evt._date)}</time>
        </div>
        <h3 class="hz-event-title">${HZ.esc(title)}</h3>
        ${subtitle ? `<p class="hz-event-subtitle">${HZ.esc(subtitle)}</p>` : ''}
        <button class="hz-drill-btn" data-source-id="${evt._sourceId}" data-source-collection="${evt._sourceCollection}" aria-label="Pokaż szczegóły">
          Szczegóły →
        </button>
      </div>
    </article>
  `;
}

function getEventSubtitle(evt) {
  switch (evt._type) {
    case 'document': return evt.description || evt.type || '';
    case 'medication': return [evt.dose, evt.frequency, evt.prescribedBy ? `Przepisany: ${evt.prescribedBy}` : ''].filter(Boolean).join(' · ');
    case 'symptom': return [evt.bodyArea, evt.severity ? `Nasilenie: ${evt.severity}/5` : '', evt.frequency].filter(Boolean).join(' · ');
    case 'result': return [
      evt.pointValue == null || evt.pointValue === '' ? '' : `${evt.pointValue}${evt.unit ? ` ${evt.unit}` : ''}`,
      evt.rangeLabel || (evt.normalMin != null && evt.normalMax != null ? `zakres ze zrodla: ${evt.normalMin}-${evt.normalMax}${evt.unit ? ` ${evt.unit}` : ''}` : ''),
      evt.pointSourceNote || '',
    ].filter(Boolean).join(' · ');
    case 'visit': return [evt.specialty, evt.facility, evt.purpose].filter(Boolean).join(' · ');
    case 'question': return evt.category || '';
    default: return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Summary Card Renderer                                              */
/* ------------------------------------------------------------------ */

function renderSummaryCard(s) {
  let html = `<div class="hz-summary-card">`;
  html += `<h3 class="hz-summary-title">📊 Podsumowanie: ${HZ.esc(s.epochLabel)}</h3>`;

  // Stats grid
  html += '<div class="hz-summary-stats">';
  const stats = [
    { icon: '🏥', value: s.counts.visits, label: 'wizyt', show: true },
    { icon: '📄', value: s.counts.documents, label: 'dokumentów', show: true },
    { icon: '💊', value: s.counts.activeMeds, label: 'leków aktywnych', show: s.counts.medications > 0 },
    { icon: '🌡️', value: s.counts.symptoms, label: 'objawów', show: s.counts.symptoms > 0 },
    { icon: '📈', value: s.counts.results, label: 'wyników', show: s.counts.results > 0 },
    { icon: '❓', value: s.counts.openQuestions, label: 'otwartych pytań', show: s.counts.openQuestions > 0 },
  ];
  for (const st of stats) {
    if (!st.show) continue;
    html += `<div class="hz-summary-stat"><span class="hz-stat-icon">${st.icon}</span><span class="hz-stat-value">${st.value}</span><span class="hz-stat-label">${st.label}</span></div>`;
  }
  html += '</div>';

  // Active medications with source links
  if (s.activeMeds.length > 0) {
    html += '<div class="hz-summary-section">';
    html += '<h4>💊 Leki w tym okresie</h4>';
    html += '<ul class="hz-summary-list">';
    for (const m of s.activeMeds) {
      html += `<li class="hz-source-link" data-source-id="${m.sourceId}" data-source-collection="medications">
        <strong>${HZ.esc(m.name)}</strong>${m.dose ? ` — ${HZ.esc(m.dose)}` : ''}
        <span class="hz-source-indicator" title="Kliknij, aby zobaczyć źródło">🔗</span>
      </li>`;
    }
    html += '</ul></div>';
  }

  // Key events with source links
  if (s.keyEvents.length > 0) {
    html += '<div class="hz-summary-section">';
    html += '<h4>📌 Kluczowe zdarzenia</h4>';
    html += '<ul class="hz-summary-list">';
    for (const ke of s.keyEvents) {
      html += `<li class="hz-source-link" data-source-id="${ke.sourceId}" data-source-collection="${ke.sourceCollection}">
        <span>${ke.icon}</span>
        <span><strong>${HZ.fmtDate(ke.date)}</strong> — ${HZ.esc(ke.title)}</span>
        ${ke.detail ? `<span class="hz-key-detail">${HZ.esc(ke.detail)}</span>` : ''}
        <span class="hz-source-indicator" title="Kliknij, aby zobaczyć źródło">🔗</span>
      </li>`;
    }
    html += '</ul></div>';
  }

  // Document types breakdown
  if (Object.keys(s.docTypes).length > 0) {
    html += '<div class="hz-summary-section">';
    html += '<h4>📄 Dokumenty wg typu</h4>';
    html += '<div class="hz-doc-type-grid">';
    for (const [type, count] of Object.entries(s.docTypes)) {
      html += `<span class="hz-doc-type-chip">${HZ.esc(type)}: ${count}</span>`;
    }
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

/* ================================================================== */
/*  SCROLL ANIMATIONS                                                  */
/* ================================================================== */

function activateScrollAnimations(container) {
  // Use IntersectionObserver for card reveal (works everywhere)
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('hz-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  container.querySelectorAll('.hz-event-card, .hz-summary-card, .hz-epoch-empty, .hz-medical-focus').forEach(el => {
    observer.observe(el);
  });

  // CSS Scroll-Driven Animations enhancement (if supported)
  if (CSS.supports && CSS.supports('animation-timeline', 'view()')) {
    container.classList.add('hz-scroll-native');
  }
}

/* ================================================================== */
/*  MINIMAP HIGHLIGHT                                                  */
/* ================================================================== */

function activateMinimapHighlight(container) {
  const minimap = container.querySelector('.hz-minimap');
  if (!minimap) return;

  const sections = container.querySelectorAll('.hz-epoch');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const epochKey = entry.target.dataset.epoch;
        minimap.querySelectorAll('.hz-minimap-item').forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#epoch-${epochKey}`);
        });
      }
    }
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll on minimap click
  minimap.addEventListener('click', (e) => {
    const link = e.target.closest('.hz-minimap-item');
    if (!link) return;
    e.preventDefault();
    const target = container.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ================================================================== */
/*  DRILL-DOWN (Source linking)                                        */
/* ================================================================== */

function activateDrilldown(container) {
  container.addEventListener('click', async (e) => {
    const drillBtn = e.target.closest('.hz-drill-btn, .hz-source-link');
    if (!drillBtn) return;

    const sourceId = drillBtn.dataset.sourceId;
    const sourceCollection = drillBtn.dataset.sourceCollection;
    if (!sourceId || !sourceCollection) return;

    // Fetch the full source record
    let record;
    try {
      record = await P360Store[sourceCollection].get(sourceId);
    } catch { return; }
    if (!record) return;

    // Render detail modal
    showSourceDetail(sourceCollection, record);
  });
}

/**
 * Shows a modal with full source record details.
 * This allows both doctor and patient to drill into raw data.
 */
function showSourceDetail(collection, record) {
  const titles = {
    documents: '📄 Dokument — pełne szczegóły',
    medications: '💊 Lek — pełne szczegóły',
    symptoms: '🌡️ Objaw — pełne szczegóły',
    results: '📈 Wynik — pełne szczegóły',
    visits: '🏥 Wizyta — pełne szczegóły',
    questions: '❓ Pytanie — pełne szczegóły',
  };

  const title = titles[collection] || 'Szczegóły';
  let body = '<div class="hz-detail-grid">';

  // Render all fields of the record
  const fieldLabels = {
    title: 'Tytuł', name: 'Nazwa', description: 'Opis', text: 'Treść',
    type: 'Typ', dose: 'Dawka', frequency: 'Częstotliwość',
    prescribedBy: 'Przepisany przez', startDate: 'Data rozpoczęcia',
    endDate: 'Data zakończenia', date: 'Data', active: 'Aktywny',
    notes: 'Notatki', doctor: 'Lekarz', specialty: 'Specjalizacja',
    facility: 'Placówka', purpose: 'Cel wizyty', status: 'Status',
    unit: 'Jednostka', normalMin: 'Minimum ze źródła',
    normalMax: 'Maksimum ze źródła', rangeLabel: 'Zakres ze źródła',
    values: 'Punkty wyniku',
    bodyArea: 'Obszar ciała', severity: 'Nasilenie', category: 'Kategoria',
    answered: 'Odpowiedziano', answer: 'Odpowiedź', priority: 'Priorytet',
    bloodType: 'Grupa krwi', allergies: 'Alergie',
    chronicConditions: 'Choroby przewlekłe',
    createdAt: 'Utworzono', updatedAt: 'Ostatnia zmiana',
  };

  const skipFields = ['id', '_type', '_date', '_sourceId', '_sourceCollection', 'imageDataUrl'];

  for (const [key, value] of Object.entries(record)) {
    if (skipFields.includes(key) || value == null || value === '') continue;
    const label = fieldLabels[key] || key;
    let displayValue;

    if (typeof value === 'boolean') {
      displayValue = value ? 'Tak' : 'Nie';
    } else if (Array.isArray(value)) {
      displayValue = value.map((entry) => {
        if (!entry || typeof entry !== 'object') return String(entry);
        return [entry.date, entry.value, entry.sourceNote].filter(Boolean).join(' - ');
      }).join('<br>') || '—';
    } else if (key === 'severity') {
      const dots = Array.from({length: 5}, (_, i) =>
        `<span class="hz-sev-dot${i < value ? ' active' : ''}" style="background:${i < value ? ['#15803d','#22c55e','#eab308','#f59e0b','#d97706'][i] : '#e5e7eb'}"></span>`
      ).join('');
      displayValue = `${dots} (${value}/5)`;
    } else if (key.includes('Date') || key === 'date' || key.includes('At')) {
      displayValue = HZ.fmtDate(value);
    } else {
      displayValue = HZ.esc(String(value));
    }

    body += `<div class="hz-detail-field"><span class="hz-detail-label">${HZ.esc(label)}</span><span class="hz-detail-value">${displayValue}</span></div>`;
  }

  // If document has an image, show it
  if (record.imageDataUrl) {
    body += `<div class="hz-detail-image"><img src="${record.imageDataUrl}" alt="${HZ.esc(record.title || 'Dokument')}" loading="lazy"/></div>`;
  }

  body += '</div>';

  // Source metadata
  body += `<div class="hz-detail-source">
    <small>Źródło: kolekcja <code>${HZ.esc(collection)}</code> · ID: <code>${HZ.esc(record.id)}</code></small>
    ${record.createdAt ? `<br><small>Utworzono: ${HZ.fmtDate(record.createdAt)}</small>` : ''}
    ${record.updatedAt ? `<small> · Zmieniono: ${HZ.fmtDate(record.updatedAt)}</small>` : ''}
  </div>`;

  // Use the existing modal system from moja-historia
  if (typeof app !== 'undefined' && app.openModal) {
    app.openModal(title, body);
  }
}

/* ================================================================== */
/*  PUBLIC API                                                         */
/* ================================================================== */

window.HistoriaZycia = {
  EPOCHS,
  resolveEpoch,
  aggregateByEpoch,
  generateEpochSummary,
  renderLifeBiography,
};
