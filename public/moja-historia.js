/**
 * Moja Historia — Pacjent360™ Patient App Controller
 * Handles UI interactions, CRUD operations, navigation, and report generation.
 * Depends on: P360Store (p360-store.js), P360ResultSeries (p360-result-series.js), P360Report (p360-report.js)
 * @version 0.1.0
 */
'use strict';

/* ------------------------------------------------------------------ */
/*  Initialization guard                                               */
/* ------------------------------------------------------------------ */
if (typeof P360Store === 'undefined') {
  console.error('[MojaHistoria] P360Store nie został załadowany. Upewnij się, że p360-store.js jest załadowany przed moja-historia.js');
}
if (typeof P360ResultSeries === 'undefined') {
  console.error('[MojaHistoria] P360ResultSeries nie został załadowany. Upewnij się, że p360-result-series.js jest załadowany przed moja-historia.js');
}

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */
const MH = {
  /** @param {string} id */
  el: (id) => document.getElementById(id),
  /** @param {string} sel @param {Element} [ctx] */
  qs: (sel, ctx) => (ctx || document).querySelector(sel),
  /** @param {string} sel @param {Element} [ctx] */
  qsa: (sel, ctx) => [...(ctx || document).querySelectorAll(sel)],
  /** @param {string} tag @param {Object} [attrs] @param {string|Element|Element[]} [children] */
  h(tag, attrs = {}, children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    }
    if (children != null) {
      if (typeof children === 'string') el.textContent = children;
      else if (Array.isArray(children)) children.forEach(c => c && el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
      else el.appendChild(children);
    }
    return el;
  },
  /** Escape HTML to prevent XSS */
  esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  /** Format date string */
  fmtDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  },
  /** Today as YYYY-MM-DD */
  today() { return new Date().toISOString().split('T')[0]; }
};

/* ================================================================== */
/*  Main App Controller                                                */
/* ================================================================== */
class MojaHistoriaApp {
  constructor() {
    this.currentSection = 'start';
    this.editingId = null;
    this.editingType = null;
  }

  /* ---------------------------------------------------------------- */
  /*  Bootstrap                                                        */
  /* ---------------------------------------------------------------- */
  async init() {
    try {
      await P360Store.init();
    } catch (e) {
      console.error('[MojaHistoria] Nie udało się otworzyć bazy danych:', e);
      return;
    }
    this.bindNavigation();
    this.bindForms();
    this.bindExportImport();
    this.initPanelSplitter();
    await this.refreshDashboard();
    await this.updateNavCounts();
    // Handle URL hash
    const hash = location.hash.replace('#', '');
    if (hash) this.switchSection(hash);
    window.addEventListener('hashchange', () => {
      const s = location.hash.replace('#', '');
      if (s) this.switchSection(s);
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Navigation                                                       */
  /* ---------------------------------------------------------------- */
  bindNavigation() {
    MH.qsa('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSection(btn.dataset.nav);
      });
    });
    // Quick action buttons on dashboard
    MH.qsa('[data-quick-nav]').forEach(btn => {
      btn.addEventListener('click', () => this.switchSection(btn.dataset.quickNav));
    });
  }

  switchSection(name) {
    // Hide all sections
    MH.qsa('[data-section]').forEach(s => { s.hidden = true; s.classList.remove('mh-section-active'); });
    // Show target section
    const target = MH.qs(`[data-section="${name}"]`);
    if (target) {
      target.hidden = false;
      requestAnimationFrame(() => target.classList.add('mh-section-active'));
    }
    // Update nav active state
    MH.qsa('[data-nav]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === name);
    });
    this.currentSection = name;
    location.hash = name;

    // Update topbar section title dynamically for clinical/patient context
    const titles = {
      start: 'Witaj w Twojej Historii',
      biography: 'Oś Czasu Życia (Biografia)',
      documents: 'Moje Dokumenty Medyczne',
      results: 'Wyniki w Czasie',
      medications: 'Moje Leki i Suplementy',
      symptoms: 'Rejestr Objawów i Obserwacji',
      visits: 'Moje Wizyty Lekarskie',
      questions: 'Pytania do Lekarza',
      report: 'Raport Przed Wizytą',
      profile: 'Mój Profil Pacjenta',
      data: 'Eksport i Import Danych'
    };
    const titleEl = MH.el('topbarSectionTitle');
    if (titleEl) titleEl.textContent = titles[name] || 'Moja Historia';

    // Load section data
    this.loadSectionData(name);

    // Create/refresh Lucide icons
    if (window.lucide) window.lucide.createIcons();
  }

  async loadSectionData(name) {
    switch (name) {
      case 'start': await this.refreshDashboard(); break;
      case 'documents': await this.renderDocuments(); break;
      case 'results': await this.renderResults(); break;
      case 'medications': await this.renderMedications(); break;
      case 'questions': await this.renderQuestions(); break;
      case 'symptoms': await this.renderSymptoms(); break;
      case 'visits': await this.renderVisits(); break;
      case 'report': await this.renderReportSection(); break;
      case 'profile': await this.loadProfile(); break;
      case 'biography': await this.renderBiography(); break;
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Evidence Panel & Resizing Splitter                              */
  /* ---------------------------------------------------------------- */
  initPanelSplitter() {
    const grid = MH.el('contentGrid');
    const splitter = MH.el('panelSplitter');
    const toggle = MH.el('toggleEvidence');
    const closeBtn = MH.el('closeEvidence');
    if (!grid || !splitter || !toggle) return;

    const DEFAULT_W = 330;
    const MIN_W = 260;
    const MAX_W = 620;
    
    splitter.setAttribute('aria-valuemin', String(MIN_W));
    splitter.setAttribute('aria-valuemax', String(MAX_W));
    
    const clampWidth = (value) => Math.min(MAX_W, Math.max(MIN_W, Math.round(value)));
    const currentWidth = () => parseInt(grid.style.getPropertyValue('--evidence-w'), 10) || DEFAULT_W;
    const applyWidth = (value) => {
      const width = clampWidth(value);
      grid.style.setProperty('--evidence-w', `${width}px`);
      splitter.setAttribute('aria-valuenow', String(width));
      return width;
    };

    const setCollapsed = (collapsed) => {
      grid.classList.toggle('evidence-collapsed', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const label = collapsed ? 'Rozwiń panel źródeł' : 'Zwiń panel źródeł';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', collapsed ? 'chevrons-left' : 'chevrons-right');
        if (window.lucide) window.lucide.createIcons();
      }
    };

    // Default to collapsed on start
    setCollapsed(true);

    toggle.addEventListener('click', () => {
      setCollapsed(!grid.classList.contains('evidence-collapsed'));
    });

    closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    let dragStart = null;
    splitter.addEventListener('pointerdown', (event) => {
      if (grid.classList.contains('evidence-collapsed')) return;
      dragStart = { x: event.clientX, width: currentWidth() };
      splitter.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    
    splitter.addEventListener('pointermove', (event) => {
      if (!dragStart) return;
      applyWidth(dragStart.width + (dragStart.x - event.clientX));
    });
    
    const endDrag = () => {
      if (!dragStart) return;
      dragStart = null;
    };
    splitter.addEventListener('pointerup', endDrag);
    splitter.addEventListener('pointercancel', endDrag);
    splitter.addEventListener('dblclick', () => {
      applyWidth(DEFAULT_W);
    });
  }

  openModal(title, bodyHtml) {
    // Redirection to the right-side evidence panel for visual consistency with Demo
    const grid = MH.el('contentGrid');
    const titleEl = MH.el('evidencePanelTitle');
    const rootEl = MH.el('evidenceRoot');
    if (titleEl) titleEl.textContent = title;
    if (rootEl) rootEl.innerHTML = bodyHtml;
    
    if (grid) {
      grid.classList.add('evidence-has-selection');
      grid.classList.remove('evidence-collapsed');
    }
    const toggleBtn = MH.el('toggleEvidence');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Zwiń panel źródeł');
      toggleBtn.title = 'Zwiń panel źródeł';
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'chevrons-right');
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  closeModal() {
    const grid = MH.el('contentGrid');
    if (grid) {
      grid.classList.remove('evidence-has-selection');
      grid.classList.add('evidence-collapsed');
    }
    const toggleBtn = MH.el('toggleEvidence');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Rozwiń panel źródeł');
      toggleBtn.title = 'Rozwiń panel źródeł';
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'chevrons-left');
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Dashboard                                                        */
  /* ---------------------------------------------------------------- */
  async refreshDashboard() {
    const [docs, results, meds, questions, symptoms, visits] = await Promise.all([
      P360Store.documents.count(),
      P360Store.results.count(),
      P360Store.medications.getAll(),
      P360Store.questions.getAll(),
      P360Store.symptoms.count(),
      P360Store.visits.getAll(),
    ]);
    const activeMeds = meds.filter(m => m.active !== false).length;
    const openQuestions = questions.filter(q => !q.answered).length;
    const upcoming = visits
      .filter(v => v.date >= MH.today() && v.status !== 'odwołana')
      .sort((a, b) => a.date.localeCompare(b.date));

    this.setDashStat('statDocs', docs);
    this.setDashStat('statResults', results);
    this.setDashStat('statMeds', activeMeds);
    this.setDashStat('statQuestions', openQuestions);
    this.setDashStat('statSymptoms', symptoms);

    const visitEl = MH.el('statNextVisit');
    if (visitEl) {
      visitEl.textContent = upcoming.length
        ? `${MH.fmtDate(upcoming[0].date)} — ${MH.esc(upcoming[0].doctor || upcoming[0].specialty || 'Wizyta')}`
        : 'Brak zaplanowanych wizyt';
    }
  }

  setDashStat(id, value) {
    const el = MH.el(id);
    if (el) el.textContent = value;
  }

  async updateNavCounts() {
    const [docs, results, meds, questions, symptoms, visits] = await Promise.all([
      P360Store.documents.count(),
      P360Store.results.count(),
      P360Store.medications.getAll().then(a => a.filter(m => m.active !== false).length),
      P360Store.questions.getAll().then(a => a.filter(q => !q.answered).length),
      P360Store.symptoms.count(),
      P360Store.visits.count(),
    ]);
    const set = (id, v) => { const el = MH.el(id); if (el) el.textContent = v || ''; };
    set('navCountDocs', docs || '');
    set('navCountResults', results || '');
    set('navCountMeds', meds || '');
    set('navCountQuestions', questions || '');
    set('navCountSymptoms', symptoms || '');
    set('navCountVisits', visits || '');
  }

  /* ---------------------------------------------------------------- */
  /*  DOCUMENTS                                                        */
  /* ---------------------------------------------------------------- */
  async renderDocuments() {
    const list = MH.el('documentsList');
    if (!list) return;
    const filterType = MH.el('filterDocType')?.value || 'all';
    let docs = await P360Store.documents.getAll();
    if (filterType !== 'all') docs = docs.filter(d => d.type === filterType);
    docs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (!docs.length) {
      list.innerHTML = '<div class="mh-empty-state"><span class="mh-empty-icon">📄</span><p>Nie masz jeszcze żadnych dokumentów.</p><p>Dodaj wypis, wynik badania lub skierowanie.</p></div>';
      return;
    }
    list.innerHTML = docs.map(d => `
      <article class="mh-doc-card p360-card">
        ${d.imageDataUrl ? `<img src="${d.imageDataUrl}" alt="" class="mh-doc-thumb" loading="lazy"/>` : '<div class="mh-doc-thumb-placeholder">📄</div>'}
        <div class="mh-doc-body">
          <h3>${MH.esc(d.title)}</h3>
          <div class="mh-doc-meta">
            <span class="p360-tag">${MH.esc(d.type || 'inny')}</span>
            <span>${MH.fmtDate(d.date)}</span>
          </div>
          ${d.description ? `<p class="mh-doc-desc">${MH.esc(d.description)}</p>` : ''}
        </div>
        <div class="mh-doc-actions">
          ${d.imageDataUrl ? `<button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.viewDocument('${d.id}')">Podgląd</button>` : ''}
          <button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.editDocument('${d.id}')">Edytuj</button>
          <button class="p360-btn p360-btn-ghost mh-btn-sm mh-btn-danger" onclick="app.deleteDocument('${d.id}')">Usuń</button>
        </div>
      </article>
    `).join('');
  }

  async addDocument(e) {
    e.preventDefault();
    const form = e.target;
    const fileInput = form.querySelector('[name="docFile"]');
    let imageDataUrl = null;
    if (fileInput?.files?.length) {
      imageDataUrl = await this.resizeAndEncode(fileInput.files[0]);
    }
    const doc = {
      title: form.querySelector('[name="docTitle"]').value.trim(),
      type: form.querySelector('[name="docType"]').value,
      date: form.querySelector('[name="docDate"]').value,
      description: form.querySelector('[name="docDescription"]')?.value?.trim() || '',
      imageDataUrl,
    };
    if (!doc.title) return;

    if (this.editingType === 'document' && this.editingId) {
      await P360Store.documents.update(this.editingId, doc);
      this.editingId = null; this.editingType = null;
    } else {
      await P360Store.documents.add(doc);
    }
    form.reset();
    this.hideForm('documentForm');
    await this.renderDocuments();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async editDocument(id) {
    const doc = await P360Store.documents.get(id);
    if (!doc) return;
    this.editingId = id; this.editingType = 'document';
    const form = MH.el('documentForm');
    if (!form) return;
    form.hidden = false;
    form.querySelector('[name="docTitle"]').value = doc.title || '';
    form.querySelector('[name="docType"]').value = doc.type || 'inny';
    form.querySelector('[name="docDate"]').value = doc.date || '';
    const desc = form.querySelector('[name="docDescription"]');
    if (desc) desc.value = doc.description || '';
  }

  async deleteDocument(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten dokument?')) return;
    await P360Store.documents.remove(id);
    await this.renderDocuments();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  viewDocument(id) {
    P360Store.documents.get(id).then(doc => {
      if (!doc?.imageDataUrl) return;
      this.openModal(doc.title || 'Dokument', `<img src="${doc.imageDataUrl}" style="max-width:100%;border-radius:8px;" alt="${MH.esc(doc.title)}"/>`);
    });
  }

  /** Resize image on canvas and return base64 */
  resizeAndEncode(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            const ratio = Math.min(MAX / w, MAX / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------------- */
  /*  RESULTS                                                          */
  /* ---------------------------------------------------------------- */
  resultSourceLabel(point) {
    if (point?.sourceNote) return point.sourceNote;
    const ref = (point?.sourceRefs || [])[0] || '';
    if (ref.startsWith('manual:')) return 'Wpis ręczny użytkownika';
    if (ref === 'source_missing') return 'Brak źródła';
    return ref || 'Wpis ręczny użytkownika';
  }

  resultValueLabel(point, unit) {
    if (!point || point.value == null) return 'brak';
    return `${Number(point.value).toLocaleString('pl-PL', { maximumFractionDigits: 3 })} ${unit || point.unit || ''}`.trim();
  }

  async populateResultSeriesSelect(results) {
    const select = MH.el('resultSeriesId');
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Nowy parametr</option>' + results
      .slice()
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pl'))
      .map((result) => `<option value="${MH.esc(result.id)}">${MH.esc(result.name)}${result.unit ? ` (${MH.esc(result.unit)})` : ''}</option>`)
      .join('');
    if (current && results.some((item) => item.id === current)) select.value = current;
  }

  async fillResultFormFromSelection() {
    const form = MH.el('resultForm');
    const select = MH.el('resultSeriesId');
    if (!form || !select) return;
    if (!select.value) {
      form.querySelector('[name="resultName"]').value = '';
      form.querySelector('[name="resultType"]').value = 'laboratorium';
      form.querySelector('[name="resultUnit"]').value = '';
      form.querySelector('[name="resultNormalMin"]').value = '';
      form.querySelector('[name="resultNormalMax"]').value = '';
      form.querySelector('[name="resultRangeLabel"]').value = '';
      return;
    }
    const result = await P360Store.results.get(select.value);
    if (!result) return;
    form.querySelector('[name="resultName"]').value = result.name || '';
    form.querySelector('[name="resultType"]').value = result.type || 'laboratorium';
    form.querySelector('[name="resultUnit"]').value = result.unit || '';
    form.querySelector('[name="resultNormalMin"]').value = Number.isFinite(Number(result.normalMin)) ? result.normalMin : '';
    form.querySelector('[name="resultNormalMax"]').value = Number.isFinite(Number(result.normalMax)) ? result.normalMax : '';
    form.querySelector('[name="resultRangeLabel"]').value = result.rangeLabel || '';
    form.querySelector('[name="resultDate"]').value = MH.today();
  }

  async renderResults() {
    const list = MH.el('resultsList');
    if (!list) return;
    const results = await P360Store.results.getAll();
    await this.populateResultSeriesSelect(results);

    if (!results.length) {
      list.innerHTML = '<div class="mh-empty-state"><span class="mh-empty-icon">📈</span><p>Nie masz jeszcze żadnych wyników.</p><p>Dodaj parametr i zakres ze źródła, aby zobaczyć wykres w czasie.</p></div>';
      return;
    }

    const sorted = results
      .map((result) => P360ResultSeries.buildSeries(result))
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pl'));

    list.innerHTML = sorted.map((series) => {
      const latest = series.latest;
      const status = P360ResultSeries.statusLabel(series.status, series.range);
      const statusClass = P360ResultSeries.statusClass(series.status);
      const p360StatusClass = statusClass === 'done' ? 'p360-status-confirmed' : statusClass === 'pending' ? 'p360-status-pending' : 'p360-status-info';
      return `
        <article class="mh-result-card p360-card">
          <div class="mh-result-head">
            <div>
              <h3>${MH.esc(series.name)}</h3>
              <div class="mh-symptom-meta">
                <span class="p360-tag">${MH.esc(series.type)}</span>
                <span>${series.points.length} ${series.points.length === 1 ? 'punkt' : 'punkty'}</span>
                <span>Zakres: ${MH.esc(series.range.label)}</span>
              </div>
            </div>
            <span class="p360-status ${p360StatusClass}">${MH.esc(status)}</span>
          </div>
          <div class="mh-result-chart">${P360ResultSeries.renderChart(series)}</div>
          <div class="mh-result-latest">
            <strong>Ostatni wynik:</strong>
            <span>${MH.esc(this.resultValueLabel(latest, series.unit))}</span>
            <span>${MH.fmtDate(latest?.date)}</span>
            <span>Źródło: ${MH.esc(this.resultSourceLabel(latest))}</span>
          </div>
          <div class="mh-doc-actions">
            <button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.addPointToResult('${series.id}')">Dodaj punkt</button>
            <button class="p360-btn p360-btn-ghost mh-btn-sm mh-btn-danger" onclick="app.deleteResult('${series.id}')">Usuń serię</button>
          </div>
        </article>
      `;
    }).join('');
  }

  async addResult(e) {
    e.preventDefault();
    const form = e.target;
    const selectedId = form.querySelector('[name="resultSeriesId"]')?.value || '';
    const value = Number(form.querySelector('[name="resultValue"]')?.value);
    const date = form.querySelector('[name="resultDate"]')?.value || '';
    const name = form.querySelector('[name="resultName"]')?.value?.trim() || '';
    const unit = form.querySelector('[name="resultUnit"]')?.value?.trim() || '';
    const type = form.querySelector('[name="resultType"]')?.value?.trim() || 'laboratorium';
    const rangeLabel = form.querySelector('[name="resultRangeLabel"]')?.value?.trim() || '';
    const minRaw = form.querySelector('[name="resultNormalMin"]')?.value;
    const maxRaw = form.querySelector('[name="resultNormalMax"]')?.value;
    const normalMin = minRaw === '' ? null : Number(minRaw);
    const normalMax = maxRaw === '' ? null : Number(maxRaw);
    const sourceNote = form.querySelector('[name="resultSourceNote"]')?.value?.trim() || 'Wpis ręczny użytkownika';

    if (!name || !unit || !date || !Number.isFinite(value)) {
      alert('Uzupełnij parametr, datę, wartość i jednostkę.');
      return;
    }
    if ((normalMin === null) !== (normalMax === null)) {
      alert('Podaj oba końce zakresu ze źródła albo zostaw oba pola puste.');
      return;
    }
    if (normalMin !== null && !(normalMin < normalMax)) {
      alert('Zakres ze źródła musi mieć min mniejsze od max.');
      return;
    }

    if (selectedId) {
      const existing = await P360Store.results.get(selectedId);
      if (!existing) return;
      if (String(existing.unit || '').trim() !== unit) {
        alert('Nie można dopisać punktu z inną jednostką do tej samej serii.');
        return;
      }
      const pointId = `${selectedId}:${Date.now()}`;
      const values = [...(existing.values || []), {
        id: pointId,
        date,
        value,
        sourceRefs: [`manual:${pointId}`],
        sourceNote
      }].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
      await P360Store.results.update(selectedId, { values });
    } else {
      const id = crypto.randomUUID();
      const result = {
        id,
        name,
        type,
        unit,
        rangeLabel,
        values: [{
          id: `${id}:0`,
          date,
          value,
          sourceRefs: [`manual:${id}`],
          sourceNote
        }]
      };
      if (normalMin !== null && normalMax !== null) {
        result.normalMin = normalMin;
        result.normalMax = normalMax;
      }
      await P360Store.results.add(result);
    }

    form.reset();
    this.hideForm('resultForm');
    await this.renderResults();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async addPointToResult(id) {
    const form = MH.el('resultForm');
    const select = MH.el('resultSeriesId');
    if (!form || !select) return;
    form.hidden = false;
    select.value = id;
    await this.fillResultFormFromSelection();
    form.querySelector('[name="resultValue"]')?.focus();
  }

  async deleteResult(id) {
    if (!confirm('Czy na pewno usunąć całą serię wyników?')) return;
    await P360Store.results.remove(id);
    await this.renderResults();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  /* ---------------------------------------------------------------- */
  /*  MEDICATIONS                                                      */
  /* ---------------------------------------------------------------- */
  async renderMedications() {
    const activeList = MH.el('medsActiveList');
    const archiveList = MH.el('medsArchiveList');
    if (!activeList) return;
    const meds = await P360Store.medications.getAll();
    const active = meds.filter(m => m.active !== false);
    const archived = meds.filter(m => m.active === false);

    const renderMed = (m) => `
      <article class="mh-med-card p360-card">
        <div class="mh-med-header">
          <h3>💊 ${MH.esc(m.name)}</h3>
          <span class="p360-tag">${MH.esc(m.type || 'przepisany')}</span>
        </div>
        <div class="mh-med-details">
          ${m.dose ? `<span><strong>Dawka:</strong> ${MH.esc(m.dose)}</span>` : ''}
          ${m.frequency ? `<span><strong>Częstotliwość:</strong> ${MH.esc(m.frequency)}</span>` : ''}
          ${m.prescribedBy ? `<span><strong>Przepisany przez:</strong> ${MH.esc(m.prescribedBy)}</span>` : ''}
          ${m.startDate ? `<span><strong>Od:</strong> ${MH.fmtDate(m.startDate)}</span>` : ''}
        </div>
        ${m.notes ? `<p class="mh-med-notes">${MH.esc(m.notes)}</p>` : ''}
        <div class="mh-doc-actions">
          <button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.editMedication('${m.id}')">Edytuj</button>
          <button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.toggleMedActive('${m.id}', ${!m.active})">${m.active !== false ? 'Archiwizuj' : 'Przywróć'}</button>
          <button class="p360-btn p360-btn-ghost mh-btn-sm mh-btn-danger" onclick="app.deleteMedication('${m.id}')">Usuń</button>
        </div>
      </article>
    `;

    activeList.innerHTML = active.length
      ? active.map(renderMed).join('')
      : '<div class="mh-empty-state"><span class="mh-empty-icon">💊</span><p>Nie masz jeszcze żadnych leków.</p></div>';

    if (archiveList) {
      archiveList.innerHTML = archived.length
        ? '<h3 class="mh-sub-heading">Archiwalne</h3>' + archived.map(renderMed).join('')
        : '';
    }
  }

  async addMedication(e) {
    e.preventDefault();
    const form = e.target;
    const med = {
      name: form.querySelector('[name="medName"]').value.trim(),
      dose: form.querySelector('[name="medDose"]')?.value?.trim() || '',
      frequency: form.querySelector('[name="medFrequency"]')?.value || '',
      type: form.querySelector('[name="medType"]')?.value || 'przepisany',
      prescribedBy: form.querySelector('[name="medPrescribedBy"]')?.value?.trim() || '',
      startDate: form.querySelector('[name="medStartDate"]')?.value || '',
      active: true,
      notes: form.querySelector('[name="medNotes"]')?.value?.trim() || '',
    };
    if (!med.name) return;

    if (this.editingType === 'medication' && this.editingId) {
      await P360Store.medications.update(this.editingId, med);
      this.editingId = null; this.editingType = null;
    } else {
      await P360Store.medications.add(med);
    }
    form.reset();
    this.hideForm('medicationForm');
    await this.renderMedications();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async editMedication(id) {
    const med = await P360Store.medications.get(id);
    if (!med) return;
    this.editingId = id; this.editingType = 'medication';
    const form = MH.el('medicationForm');
    if (!form) return;
    form.hidden = false;
    form.querySelector('[name="medName"]').value = med.name || '';
    form.querySelector('[name="medDose"]').value = med.dose || '';
    form.querySelector('[name="medFrequency"]').value = med.frequency || '';
    form.querySelector('[name="medType"]').value = med.type || 'przepisany';
    form.querySelector('[name="medPrescribedBy"]').value = med.prescribedBy || '';
    form.querySelector('[name="medStartDate"]').value = med.startDate || '';
    const notes = form.querySelector('[name="medNotes"]');
    if (notes) notes.value = med.notes || '';
  }

  async toggleMedActive(id, active) {
    await P360Store.medications.update(id, { active });
    await this.renderMedications();
    await this.updateNavCounts();
  }

  async deleteMedication(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten lek?')) return;
    await P360Store.medications.remove(id);
    await this.renderMedications();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  /* ---------------------------------------------------------------- */
  /*  QUESTIONS                                                        */
  /* ---------------------------------------------------------------- */
  async renderQuestions() {
    const list = MH.el('questionsList');
    if (!list) return;
    const questions = await P360Store.questions.getAll();
    const open = questions.filter(q => !q.answered);
    const answered = questions.filter(q => q.answered);

    if (!questions.length) {
      list.innerHTML = `<div class="mh-empty-state"><span class="mh-empty-icon">❓</span><p>Nie masz jeszcze żadnych pytań.</p>
        <div class="mh-question-hints">
          <p><strong>Przykłady pytań:</strong></p>
          <ul>
            <li>Czy mogę odstawić ten lek?</li>
            <li>Jakie badania powinienem zrobić przed kolejną wizytą?</li>
            <li>Czy te objawy mogą być związane z lekami?</li>
            <li>Co oznacza ten wynik?</li>
          </ul>
        </div></div>`;
      return;
    }

    const renderQ = (q) => `
      <article class="mh-question-card p360-card ${q.answered ? 'mh-answered' : ''}">
        <label class="mh-question-check">
          <input type="checkbox" ${q.answered ? 'checked' : ''} onchange="app.toggleQuestion('${q.id}', this.checked)"/>
        </label>
        <div class="mh-question-body">
          <p>${MH.esc(q.text)}</p>
          <span class="p360-tag">${MH.esc(q.category || 'do_lekarza')}</span>
        </div>
        <button class="p360-btn p360-btn-ghost mh-btn-sm mh-btn-danger" onclick="app.deleteQuestion('${q.id}')">✕</button>
      </article>
    `;

    list.innerHTML = open.map(renderQ).join('')
      + (answered.length ? '<h3 class="mh-sub-heading">Omówione</h3>' + answered.map(renderQ).join('') : '');
  }

  async quickAddQuestion() {
    const input = MH.el('quickQuestionInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    await P360Store.questions.add({ text, category: 'do_lekarza', answered: false });
    input.value = '';
    await this.renderQuestions();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async addQuestion(e) {
    e.preventDefault();
    const form = e.target;
    const q = {
      text: form.querySelector('[name="qText"]').value.trim(),
      category: form.querySelector('[name="qCategory"]')?.value || 'do_lekarza',
      answered: false,
    };
    if (!q.text) return;
    await P360Store.questions.add(q);
    form.reset();
    this.hideForm('questionFormFull');
    await this.renderQuestions();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async toggleQuestion(id, answered) {
    await P360Store.questions.update(id, { answered });
    await this.renderQuestions();
    await this.updateNavCounts();
  }

  async deleteQuestion(id) {
    await P360Store.questions.remove(id);
    await this.renderQuestions();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  /* ---------------------------------------------------------------- */
  /*  SYMPTOMS                                                         */
  /* ---------------------------------------------------------------- */
  async renderSymptoms() {
    const list = MH.el('symptomsList');
    if (!list) return;
    const symptoms = await P360Store.symptoms.getAll();
    symptoms.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

    if (!symptoms.length) {
      list.innerHTML = '<div class="mh-empty-state"><span class="mh-empty-icon">🌡️</span><p>Nie masz jeszcze żadnych objawów.</p><p>Zapisz objawy, które chcesz omówić z lekarzem.</p></div>';
      return;
    }

    const severityDots = (s) => {
      const colors = ['#15803d', '#22c55e', '#eab308', '#f59e0b', '#d97706'];
      return Array.from({ length: 5 }, (_, i) =>
        `<span class="mh-severity-dot${i < s ? ' active' : ''}" style="background:${i < s ? colors[i] : '#e5e7eb'}"></span>`
      ).join('');
    };

    list.innerHTML = symptoms.map(s => `
      <article class="mh-symptom-card p360-card">
        <div class="mh-symptom-header">
          <h3>${MH.esc(s.description)}</h3>
          <div class="mh-severity">${severityDots(s.severity || 1)}</div>
        </div>
        <div class="mh-symptom-meta">
          ${s.bodyArea ? `<span class="p360-tag">${MH.esc(s.bodyArea)}</span>` : ''}
          ${s.startDate ? `<span>Od: ${MH.fmtDate(s.startDate)}</span>` : ''}
          ${s.frequency ? `<span>${MH.esc(s.frequency)}</span>` : ''}
        </div>
        ${s.notes ? `<p class="mh-symptom-notes">${MH.esc(s.notes)}</p>` : ''}
        <div class="mh-doc-actions">
          <button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.editSymptom('${s.id}')">Edytuj</button>
          <button class="p360-btn p360-btn-ghost mh-btn-sm mh-btn-danger" onclick="app.deleteSymptom('${s.id}')">Usuń</button>
        </div>
      </article>
    `).join('');
  }

  async addSymptom(e) {
    e.preventDefault();
    const form = e.target;
    const s = {
      description: form.querySelector('[name="symDescription"]').value.trim(),
      bodyArea: form.querySelector('[name="symBodyArea"]')?.value || '',
      severity: parseInt(form.querySelector('[name="symSeverity"]')?.value || '1', 10),
      startDate: form.querySelector('[name="symStartDate"]')?.value || '',
      frequency: form.querySelector('[name="symFrequency"]')?.value || '',
      notes: form.querySelector('[name="symNotes"]')?.value?.trim() || '',
    };
    if (!s.description) return;

    if (this.editingType === 'symptom' && this.editingId) {
      await P360Store.symptoms.update(this.editingId, s);
      this.editingId = null; this.editingType = null;
    } else {
      await P360Store.symptoms.add(s);
    }
    form.reset();
    this.hideForm('symptomForm');
    await this.renderSymptoms();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async editSymptom(id) {
    const s = await P360Store.symptoms.get(id);
    if (!s) return;
    this.editingId = id; this.editingType = 'symptom';
    const form = MH.el('symptomForm');
    if (!form) return;
    form.hidden = false;
    form.querySelector('[name="symDescription"]').value = s.description || '';
    form.querySelector('[name="symBodyArea"]').value = s.bodyArea || '';
    form.querySelector('[name="symSeverity"]').value = s.severity || 1;
    form.querySelector('[name="symStartDate"]').value = s.startDate || '';
    form.querySelector('[name="symFrequency"]').value = s.frequency || '';
    const notes = form.querySelector('[name="symNotes"]');
    if (notes) notes.value = s.notes || '';
  }

  async deleteSymptom(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten objaw?')) return;
    await P360Store.symptoms.remove(id);
    await this.renderSymptoms();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  /* ---------------------------------------------------------------- */
  /*  VISITS                                                           */
  /* ---------------------------------------------------------------- */
  async renderVisits() {
    const list = MH.el('visitsList');
    if (!list) return;
    const visits = await P360Store.visits.getAll();
    visits.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (!visits.length) {
      list.innerHTML = '<div class="mh-empty-state"><span class="mh-empty-icon">📅</span><p>Nie masz jeszcze żadnych wizyt.</p><p>Zaplanuj wizytę, żeby przygotować raport.</p></div>';
      return;
    }

    const statusBadge = (s) => {
      const cls = s === 'odbyta' ? 'p360-status-confirmed' : s === 'odwołana' ? 'p360-status-conflict' : 'p360-status-pending';
      return `<span class="p360-status ${cls}">${MH.esc(s || 'planowana')}</span>`;
    };

    list.innerHTML = visits.map(v => `
      <article class="mh-visit-card p360-card">
        <div class="mh-visit-header">
          <h3>📅 ${MH.fmtDate(v.date)}</h3>
          ${statusBadge(v.status)}
        </div>
        <div class="mh-visit-details">
          ${v.doctor ? `<span><strong>Lekarz:</strong> ${MH.esc(v.doctor)}</span>` : ''}
          ${v.specialty ? `<span><strong>Specjalizacja:</strong> ${MH.esc(v.specialty)}</span>` : ''}
          ${v.facility ? `<span><strong>Placówka:</strong> ${MH.esc(v.facility)}</span>` : ''}
          ${v.purpose ? `<span><strong>Cel:</strong> ${MH.esc(v.purpose)}</span>` : ''}
        </div>
        ${v.notes ? `<p class="mh-visit-notes">${MH.esc(v.notes)}</p>` : ''}
        <div class="mh-doc-actions">
          <button class="p360-btn p360-btn-primary mh-btn-sm" onclick="app.generateVisitReport('${v.id}')">📋 Przygotuj raport</button>
          <button class="p360-btn p360-btn-ghost mh-btn-sm" onclick="app.editVisit('${v.id}')">Edytuj</button>
          <button class="p360-btn p360-btn-ghost mh-btn-sm mh-btn-danger" onclick="app.deleteVisit('${v.id}')">Usuń</button>
        </div>
      </article>
    `).join('');
  }

  async addVisit(e) {
    e.preventDefault();
    const form = e.target;
    const v = {
      date: form.querySelector('[name="visitDate"]').value,
      doctor: form.querySelector('[name="visitDoctor"]')?.value?.trim() || '',
      specialty: form.querySelector('[name="visitSpecialty"]')?.value?.trim() || '',
      facility: form.querySelector('[name="visitFacility"]')?.value?.trim() || '',
      purpose: form.querySelector('[name="visitPurpose"]')?.value?.trim() || '',
      status: form.querySelector('[name="visitStatus"]')?.value || 'planowana',
      notes: form.querySelector('[name="visitNotes"]')?.value?.trim() || '',
    };
    if (!v.date) return;

    if (this.editingType === 'visit' && this.editingId) {
      await P360Store.visits.update(this.editingId, v);
      this.editingId = null; this.editingType = null;
    } else {
      await P360Store.visits.add(v);
    }
    form.reset();
    this.hideForm('visitForm');
    await this.renderVisits();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  async editVisit(id) {
    const v = await P360Store.visits.get(id);
    if (!v) return;
    this.editingId = id; this.editingType = 'visit';
    const form = MH.el('visitForm');
    if (!form) return;
    form.hidden = false;
    form.querySelector('[name="visitDate"]').value = v.date || '';
    form.querySelector('[name="visitDoctor"]').value = v.doctor || '';
    form.querySelector('[name="visitSpecialty"]').value = v.specialty || '';
    form.querySelector('[name="visitFacility"]').value = v.facility || '';
    form.querySelector('[name="visitPurpose"]').value = v.purpose || '';
    form.querySelector('[name="visitStatus"]').value = v.status || 'planowana';
    const notes = form.querySelector('[name="visitNotes"]');
    if (notes) notes.value = v.notes || '';
  }

  async deleteVisit(id) {
    if (!confirm('Czy na pewno chcesz usunąć tę wizytę?')) return;
    await P360Store.visits.remove(id);
    await this.renderVisits();
    await this.updateNavCounts();
    await this.refreshDashboard();
  }

  /* ---------------------------------------------------------------- */
  /*  REPORT                                                           */
  /* ---------------------------------------------------------------- */
  async renderReportSection() {
    const container = MH.el('reportPreview');
    if (!container) return;
    if (typeof P360Report === 'undefined') {
      container.innerHTML = '<p>Moduł raportów nie jest załadowany.</p>';
      return;
    }
    const html = await P360Report.generateFullReport();
    container.innerHTML = `
      <div class="mh-report-actions">
        <button class="p360-btn p360-btn-primary" onclick="app.printReport()">🖨️ Drukuj raport</button>
        <button class="p360-btn p360-btn-secondary" onclick="app.downloadReport()">💾 Zapisz HTML</button>
      </div>
      <div class="mh-report-frame">${html}</div>
    `;
  }

  async generateVisitReport(visitId) {
    if (typeof P360Report === 'undefined') return;
    const html = await P360Report.generatePreVisitReport(visitId);
    P360Report.openPrintWindow(html);
  }

  async printReport() {
    if (typeof P360Report === 'undefined') return;
    const html = await P360Report.generateFullReport();
    P360Report.openPrintWindow(html);
  }

  async downloadReport() {
    if (typeof P360Report === 'undefined') return;
    const html = await P360Report.generateFullReport();
    P360Report.downloadReport(html, `pacjent360-raport-${MH.today()}.html`);
  }

  /* ---------------------------------------------------------------- */
  /*  BIOGRAPHY (Historia Życia)                                       */
  /* ---------------------------------------------------------------- */
  async renderBiography() {
    const container = MH.el('biographyContainer');
    if (!container) return;
    if (typeof HistoriaZycia === 'undefined') {
      container.innerHTML = '<p>Moduł Historii Życia nie jest załadowany.</p>';
      return;
    }
    const profile = await P360Store.profile.get() || {};
    const birthYear = parseInt(profile.birthYear, 10) || null;
    await HistoriaZycia.renderLifeBiography(container, birthYear);
  }

  /* ---------------------------------------------------------------- */
  /*  PROFILE                                                          */
  /* ---------------------------------------------------------------- */
  async loadProfile() {
    const profile = await P360Store.profile.get() || {};
    const set = (name, val) => {
      const el = document.querySelector(`[name="${name}"]`);
      if (el) el.value = val || '';
    };
    set('profileName', profile.name);
    set('profileBirthYear', profile.birthYear);
    set('profileBloodType', profile.bloodType);
    set('profileEmergencyContact', profile.emergencyContact);
    // Multi-value fields
    const allergies = MH.el('profileAllergies');
    if (allergies) allergies.value = (profile.allergies || []).join(', ');
    const conditions = MH.el('profileConditions');
    if (conditions) conditions.value = (profile.chronicConditions || []).join(', ');
  }

  async saveProfile(e) {
    e.preventDefault();
    const form = e.target;
    const profile = {
      name: form.querySelector('[name="profileName"]')?.value?.trim() || '',
      birthYear: form.querySelector('[name="profileBirthYear"]')?.value?.trim() || '',
      bloodType: form.querySelector('[name="profileBloodType"]')?.value || '',
      emergencyContact: form.querySelector('[name="profileEmergencyContact"]')?.value?.trim() || '',
      allergies: (MH.el('profileAllergies')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: (MH.el('profileConditions')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    };
    await P360Store.profile.set(profile);
    this.showToast('Profil zapisany ✓');
  }

  /* ---------------------------------------------------------------- */
  /*  EXPORT / IMPORT                                                  */
  /* ---------------------------------------------------------------- */
  bindExportImport() {
    MH.el('btnExport')?.addEventListener('click', () => this.exportData());
    MH.el('btnImport')?.addEventListener('click', () => MH.el('importFile')?.click());
    MH.el('importFile')?.addEventListener('change', (e) => this.importData(e));
    MH.el('btnClearAll')?.addEventListener('click', () => this.clearAllData());
  }

  async exportData() {
    const data = await P360Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pacjent360-moja-historia-${MH.today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Dane wyeksportowane ✓');
  }

  async importData(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (!confirm('Importowanie danych zastąpi obecne dane. Czy kontynuować?')) {
      e.target.value = '';
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await P360Store.importAll(data);
      this.showToast('Dane zaimportowane ✓');
      await this.refreshDashboard();
      await this.updateNavCounts();
      this.loadSectionData(this.currentSection);
    } catch (err) {
      alert('Błąd importu: ' + err.message);
    }
    e.target.value = '';
  }

  async clearAllData() {
    if (!confirm('Czy na pewno chcesz usunąć WSZYSTKIE dane?')) return;
    if (!confirm('To jest nieodwracalne! Ostatnie potwierdzenie — usunąć wszystko?')) return;
    await P360Store.clearAll();
    this.showToast('Wszystkie dane usunięte');
    await this.refreshDashboard();
    await this.updateNavCounts();
    this.loadSectionData(this.currentSection);
  }

  /* ---------------------------------------------------------------- */
  /*  Forms                                                            */
  /* ---------------------------------------------------------------- */
  bindForms() {
    // Toggle form visibility
    MH.qsa('[data-toggle-form]').forEach(btn => {
      btn.addEventListener('click', () => {
        const formId = btn.dataset.toggleForm;
        const form = MH.el(formId);
        if (form) {
          form.hidden = !form.hidden;
          if (!form.hidden) form.querySelector('input, textarea')?.focus();
        }
      });
    });
    // Form submissions
    MH.el('documentForm')?.addEventListener('submit', (e) => this.addDocument(e));
    MH.el('medicationForm')?.addEventListener('submit', (e) => this.addMedication(e));
    MH.el('questionFormFull')?.addEventListener('submit', (e) => this.addQuestion(e));
    MH.el('symptomForm')?.addEventListener('submit', (e) => this.addSymptom(e));
    MH.el('resultForm')?.addEventListener('submit', (e) => this.addResult(e));
    MH.el('visitForm')?.addEventListener('submit', (e) => this.addVisit(e));
    MH.el('profileForm')?.addEventListener('submit', (e) => this.saveProfile(e));
    MH.el('resultSeriesId')?.addEventListener('change', () => this.fillResultFormFromSelection());
    // Quick question add
    MH.el('quickQuestionInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.quickAddQuestion(); }
    });
    MH.el('quickQuestionBtn')?.addEventListener('click', () => this.quickAddQuestion());
    // Document filter
    MH.el('filterDocType')?.addEventListener('change', () => this.renderDocuments());
  }

  hideForm(id) {
    const form = MH.el(id);
    if (form) form.hidden = true;
    this.editingId = null;
    this.editingType = null;
  }

  /* ---------------------------------------------------------------- */
  /*  Toast notification                                               */
  /* ---------------------------------------------------------------- */
  showToast(msg) {
    const existing = MH.qs('.mh-toast');
    if (existing) existing.remove();
    const toast = MH.h('div', { className: 'mh-toast' }, msg);
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}

/* ================================================================== */
/*  Boot                                                               */
/* ================================================================== */
const app = new MojaHistoriaApp();
document.addEventListener('DOMContentLoaded', () => app.init());
