(function initPatient360MapView(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const mapView = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = mapView;
  }
  root.Patient360MapView = mapView;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360MapView(contract) {
  if (!contract) {
    throw new Error("Missing patient360-contract.js");
  }

  const TRACKS = contract.TIMELINE_TRACKS || [];
  const TIMELINE_STATUS_META = contract.TIMELINE_STATUS_META || {};

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function dateOnly(value) {
    return String(value || "").slice(0, 10);
  }

  function parseDateOnly(value) {
    const date = new Date(`${dateOnly(value)}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    if (!value) return "brak daty";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  }

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function timelinePositionPercent(date, range) {
    const start = parseDateOnly(range.start);
    const end = parseDateOnly(range.end);
    const current = parseDateOnly(date);
    if (!start || !end || !current) return 0;
    const span = Math.max(end.getTime() - start.getTime(), 1);
    const offset = current.getTime() - start.getTime();
    return Math.round(clampNumber((offset / span) * 100, 0, 100));
  }

  function timelineTrackIcon(track) {
    return {
      objawy: "activity",
      badania: "flask-conical",
      leki: "pill",
      "kontekst medyczny": "clipboard-list",
      hospitalizacje: "building-2",
      konsultacje: "messages-square",
      funkcjonowanie: "user-round-check",
      "decyzje medyczne": "clipboard-check",
      "obserwacje z wywiadu": "message-circle"
    }[track] || "circle";
  }

  function statusClass(value) {
    const normalized = normalize(value);
    if (normalized.includes("do wyjaśnienia") || normalized.includes("aktywn") || normalized.includes("wysok")) return "active";
    if (
      normalized.includes("kontrola") ||
      normalized.includes("weryfik") ||
      normalized.includes("śred") ||
      normalized.includes("potwierdzenia") ||
      normalized.includes("rozbież") ||
      normalized.includes("planow") ||
      normalized.includes("brak")
    ) return "pending";
    if (
      normalized.includes("wyjaśn") ||
      normalized.includes("potwierdz") ||
      normalized.includes("przetworz") ||
      normalized.includes("niski") ||
      normalized.includes("gotowe")
    ) return "done";
    return "info";
  }

  function timelineEventStatus(event) {
    if (event?.virtual) return "orientacyjne";
    if (event?.status) return event.status;
    const refs = Array.isArray(event?.sourceRefs) ? event.sourceRefs : [event?.sourceRefs].filter(Boolean);
    return refs.length ? "potwierdzone" : "do potwierdzenia";
  }

  function timelineStatusMeta(status) {
    return TIMELINE_STATUS_META[status] || TIMELINE_STATUS_META["do potwierdzenia"];
  }

  function fallbackSourceChips(refs) {
    const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
    if (!list.length) return `<span class="tag">Brak źródła</span>`;
    return list.map((ref) => `<span class="source-chip"><button type="button" data-source-ref="${escapeHtml(ref)}">${escapeHtml(ref)}</button></span>`).join("");
  }

  function emptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  function renderTimelineControls(period, detail, zoom, periods, details, zoomConfig) {
    return `
      <div class="temporal-controls">
        <div class="timeline-control-group">
          <span>Zakres czasu</span>
          <div class="segmented" role="group" aria-label="Zakres czasu mapy pacjenta">
            ${periods.map((item) => `<button data-timeline-period="${escapeHtml(item.id)}" class="${period.id === item.id ? "active" : ""}" title="${escapeHtml(item.description)}">${escapeHtml(item.label)}</button>`).join("")}
          </div>
        </div>
        <div class="timeline-control-group">
          <span>Poziom widoku</span>
          <div class="segmented" role="group" aria-label="Poziom szczegółowości mapy pacjenta">
            ${details.map((item) => `<button data-timeline-detail="${escapeHtml(item.id)}" class="${detail.id === item.id ? "active" : ""}" title="${escapeHtml(item.description)}">${escapeHtml(item.label)}</button>`).join("")}
          </div>
        </div>
        <div class="timeline-control-group zoom-group">
          <span>Zoom mapy</span>
          <div class="temporal-zoom-control">
            <button class="icon-button compact" data-timeline-zoom-step="${escapeHtml(-zoomConfig.step)}" title="Oddal mapę" aria-label="Oddal mapę pacjenta"><i data-lucide="zoom-out"></i></button>
            <input type="range" min="${zoomConfig.min}" max="${zoomConfig.max}" step="0.01" value="${zoom}" data-timeline-zoom-range aria-label="Zoom mapy pacjenta">
            <button class="icon-button compact" data-timeline-zoom-step="${escapeHtml(zoomConfig.step)}" title="Przybliż mapę" aria-label="Przybliż mapę pacjenta"><i data-lucide="zoom-in"></i></button>
            <button class="ghost-button fit-button" data-timeline-zoom-fit title="Oddal tak, aby zobaczyć cały odcinek"><i data-lucide="scan"></i>Dopasuj</button>
            <strong>${Math.round(zoom * 100)}%</strong>
          </div>
        </div>
      </div>
    `;
  }

  function renderTimelineOverview(events, range, detail, zoom) {
    const activeTracks = TRACKS.map((track) => ({ track, count: events.filter((event) => event.track === track).length })).filter((item) => item.count);
    const hiddenTracks = TRACKS.length - activeTracks.length;
    return `
      <div class="temporal-summary">
        <article>
          <span>Zakres</span>
          <strong>${escapeHtml(range.label)}</strong>
          <p>${formatDate(range.start)} → ${formatDate(range.end)}</p>
        </article>
        <article>
          <span>Zdarzenia</span>
          <strong>${events.length}</strong>
          <p>widoczne punkty historii</p>
        </article>
        <article>
          <span>Wymiary</span>
          <strong>${activeTracks.length}</strong>
          <p>aktywne tory danych</p>
        </article>
        <article>
          <span>Widok</span>
          <strong>${escapeHtml(detail.label)}</strong>
          <p>${escapeHtml(detail.description)}</p>
        </article>
        <article>
          <span>Zoom</span>
          <strong>${Math.round(zoom * 100)}%</strong>
          <p>${zoom <= 0.58 ? "cała linia / orientacja" : "praca na szczegółach"}</p>
        </article>
      </div>
      <div class="temporal-layers" aria-label="Aktywne wymiary mapy pacjenta">
        ${activeTracks.map(({ track, count }) => `
          <span class="active">
            <i data-lucide="${escapeHtml(timelineTrackIcon(track))}"></i>
            ${escapeHtml(track)}
            <strong>${count}</strong>
          </span>
        `).join("")}
      </div>
      ${hiddenTracks ? `<p class="temporal-note">Ukryto ${hiddenTracks} pustych torów w tym widoku.</p>` : ""}
    `;
  }

  function renderTimelineLegend(events, trackFilter) {
    return `
      <div class="temporal-legend" aria-label="Filtruj warstwy mapy pacjenta">
        ${TRACKS.map((track) => {
          const count = events.filter((event) => event.track === track).length;
          const active = trackFilter === track;
          return `
            <button type="button" data-filter-track="${escapeHtml(track)}" class="${active ? "active" : ""}" ${count ? "" : "disabled"} title="${count ? "Pokaż lub ukryj tor" : "Brak zdarzeń w tym torze"}">
              <i data-lucide="${escapeHtml(timelineTrackIcon(track))}"></i>
              <span>${escapeHtml(track)}</span>
              <strong>${count}</strong>
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderTimelineMiniMap(events, range) {
    const tickPosition = (event) => Number.isFinite(event.positionPercent) ? event.positionPercent : timelinePositionPercent(event.date, range);
    return `
      <div class="temporal-minimap" aria-label="Mini-mapa wybranego zakresu">
        <div class="temporal-minimap-head">
          <span>${formatDate(range.start)}</span>
          <strong>Cała linia wybranego zakresu</strong>
          <span>${formatDate(range.end)}</span>
        </div>
        <div class="temporal-minimap-line">
          ${events.map((event, index) => `
            <button
              type="button"
              class="mini-tick ${event.virtual ? "virtual" : ""}"
              style="left: ${tickPosition(event)}%;"
              data-timeline-jump="${escapeHtml(index)}"
              data-map-event-id="${escapeHtml(event.id)}"
              title="${escapeHtml(`${formatDate(event.date)} • ${event.title}`)}"
              aria-label="Przejdź do zdarzenia: ${escapeHtml(event.title)}"
            >
              <i data-lucide="${escapeHtml(timelineTrackIcon(event.track))}"></i>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderTimelineEvent(event, index, detailId = "standard", zoom = 0.9, selectedId = "", persona = "doctor", today = "") {
    const trackIndex = Math.max(TRACKS.indexOf(event.track), 0);
    const side = index % 2 === 0 ? "above" : "below";
    const branchDepth = Math.round((82 + (trackIndex % 4) * 18) * (0.72 + zoom * 0.28));
    const eventLeft = Number.isFinite(event.positionPercent) ? event.positionPercent : 0;
    const isOverview = detailId === "overview";
    const eventDate = parseDateOnly(event.date);
    const todayDate = parseDateOnly(today);
    const isFuture = eventDate && todayDate ? eventDate >= todayDate : false;
    const status = timelineEventStatus(event);
    const statusMeta = event.statusMeta || timelineStatusMeta(status);
    const sourceCount = (Array.isArray(event.sourceRefs) ? event.sourceRefs : [event.sourceRefs].filter(Boolean)).length;
    const selected = event.id === selectedId;
    const personaHint = persona === "patient" ? "Kliknij, aby zobaczyć źródła i pytania do rozmowy." : "Kliknij, aby zobaczyć źródła, epizod i pytania DITL.";

    return `
      <article
        class="temporal-event ${side} ${event.virtual ? "virtual" : ""} ${isFuture ? "future" : ""} ${selected ? "selected" : ""}"
        data-temporal-index="${escapeHtml(index)}"
        data-select-timeline-event="${escapeHtml(event.id)}"
        tabindex="0"
        role="button"
        aria-pressed="${selected ? "true" : "false"}"
        aria-label="${escapeHtml(`${formatDate(event.date)}: ${event.title}. ${personaHint}`)}"
        style="--event-left: ${eventLeft}%; --branch-depth: ${branchDepth}px;"
      >
        <div class="temporal-branch" aria-hidden="true"></div>
        <div class="temporal-card">
          <div class="temporal-card-head">
            <span class="temporal-date">${formatDate(event.date)}</span>
            <span class="temporal-track"><i data-lucide="${escapeHtml(timelineTrackIcon(event.track))}"></i>${escapeHtml(event.track)}</span>
          </div>
          <strong>${escapeHtml(event.title)}</strong>
          <div class="record-meta">
            <span class="status-chip ${escapeHtml(statusMeta.className)}"><i data-lucide="${escapeHtml(statusMeta.icon)}"></i>${escapeHtml(isOverview ? status : statusMeta.label)}</span>
            <span class="tag">${sourceCount ? `${sourceCount} źr.` : "bez źródła"}</span>
            ${event.virtual ? `<span class="tag">kotwica czasu</span>` : ""}
          </div>
          ${isOverview ? "" : `<p class="temporal-card-hint">${escapeHtml(personaHint)}</p>`}
        </div>
      </article>
    `;
  }

  function renderTimelineInspector(event, persona, sourceChips) {
    if (!event) {
      return `
        <aside class="timeline-inspector" aria-label="Szczegóły zdarzenia">
          ${emptyState("Wybierz zdarzenie na mapie, aby zobaczyć źródła i pytania DITL.")}
        </aside>
      `;
    }
    const status = event.status || timelineEventStatus(event);
    const statusMeta = event.statusMeta || timelineStatusMeta(status);
    const episode = event.episode || null;
    const questions = Array.isArray(event.questions) ? event.questions : [];
    const relations = Array.isArray(event.relations) ? event.relations : [];
    const refs = Array.isArray(event.sourceRefs) ? event.sourceRefs : [event.sourceRefs].filter(Boolean);

    return `
      <aside class="timeline-inspector" aria-label="Szczegóły zdarzenia">
        <div class="inspector-head">
          <p class="eyebrow">Inspektor zdarzenia</p>
          <h3>${escapeHtml(event.title)}</h3>
          <div class="record-meta">
            <span class="tag">${formatDate(event.date)}</span>
            <span class="tag"><i data-lucide="${escapeHtml(timelineTrackIcon(event.track))}"></i>${escapeHtml(event.track)}</span>
            <span class="status-chip ${escapeHtml(statusMeta.className)}"><i data-lucide="${escapeHtml(statusMeta.icon)}"></i>${escapeHtml(statusMeta.label)}</span>
          </div>
        </div>

        <section class="inspector-section">
          <strong>Opis</strong>
          <p>${escapeHtml(event.description || "Brak opisu zdarzenia.")}</p>
          <p class="inspector-copy">${persona === "patient" ? "Ten opis pomaga przygotować rozmowę z lekarzem." : "Ten opis porządkuje kontekst do omówienia z pacjentem."}</p>
        </section>

        <section class="inspector-section">
          <strong>Epizod</strong>
          ${
            episode
              ? `<p>${escapeHtml(episode.title)}</p><span class="status-chip ${statusClass(episode.status)}">${escapeHtml(episode.status)}</span><p class="inspector-copy">${escapeHtml(episode.summary)}</p><div class="source-line">${sourceChips(episode.sourceRefs || [])}</div>`
              : `<p>Brak przypisanego epizodu. To zdarzenie pozostaje pojedynczym punktem na mapie.</p>`
          }
        </section>

        <section class="inspector-section">
          <strong>Źródła</strong>
          <div class="source-line">${sourceChips(refs)}</div>
        </section>

        <section class="inspector-section">
          <strong>Pytania DITL powiązane ze źródłem</strong>
          <div class="inspector-list">
            ${
              questions.length
                ? questions.map((item) => `
                  <article>
                    <span class="status-chip ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
                    <p>${escapeHtml(item.question)}</p>
                    <div class="source-line">${sourceChips(item.sourceRefs)}</div>
                  </article>
                `).join("")
                : `<p>Brak pytania DITL bezpośrednio połączonego ze źródłami tego zdarzenia.</p>`
            }
          </div>
        </section>

        <section class="inspector-section">
          <strong>Powiązania bez wnioskowania przyczynowego</strong>
          <div class="inspector-list">
            ${
              relations.length
                ? relations.map((relation) => `
                  <article>
                    <span class="tag">${escapeHtml(relation.relationType)}</span>
                    <p>${escapeHtml(relation.label)}</p>
                    ${relation.otherEvent ? `<small>Drugie zdarzenie: ${formatDate(relation.otherEvent.date)} · ${escapeHtml(relation.otherEvent.title)}</small>` : ""}
                    <div class="source-line">${sourceChips(relation.sourceRefs || [])}</div>
                  </article>
                `).join("")
                : `<p>Brak opisanych powiązań dla tego zdarzenia.</p>`
            }
          </div>
        </section>
      </aside>
    `;
  }

  function render(options = {}) {
    const mapModel = options.mapModel;
    if (!mapModel) {
      throw new Error("Patient360MapView.render requires mapModel");
    }
    const embedded = Boolean(options.embedded);
    const sourceChips = typeof options.sourceChips === "function" ? options.sourceChips : fallbackSourceChips;
    const periods = Array.isArray(options.periods) ? options.periods : [];
    const details = Array.isArray(options.details) ? options.details : [];
    const zoomConfig = options.zoomConfig || { min: 0.4, max: 1.55, step: 0.1, fit: 0.42 };
    const period = mapModel.period;
    const detail = mapModel.detail;
    const zoom = mapModel.zoom;
    const safePersona = mapModel.safePersona;
    const range = mapModel.range;
    const clinicalEvents = mapModel.clinicalEvents;
    const filteredEvents = mapModel.filteredEvents;
    const trackFilter = mapModel.trackFilter;
    const events = mapModel.events;
    const geometry = mapModel.geometry;
    const selected = mapModel.selectedEvent;
    const selectedId = mapModel.selectedId;
    const todayPercent = Number.isFinite(mapModel.todayPercent) ? mapModel.todayPercent : 100;
    const mapWidth = Math.max(events.length * (geometry.eventWidth + 22) + 76, 960);

    if (!events.length) {
      return `
        <section class="section-band temporal-section patient-map360 ${embedded ? "embedded" : ""}">
          <div class="temporal-head">
            <div>
              <p class="eyebrow">Mapa Pacjenta 360</p>
              <h2>Brak zdarzeń dla wybranego zakresu</h2>
              <p class="episode-narrative">Zmień zakres czasu, filtr toru albo wyszukiwanie, aby zobaczyć historię pacjenta.</p>
            </div>
          </div>
          ${embedded ? "" : renderTimelineControls(period, detail, zoom, periods, details, zoomConfig)}
          ${renderTimelineOverview(filteredEvents, range, detail, zoom)}
          ${renderTimelineLegend(clinicalEvents, trackFilter)}
          ${emptyState("Brak zdarzeń na mapie pacjenta dla wybranego zakresu.")}
        </section>
      `;
    }

    return `
      <section class="section-band temporal-section patient-map360 detail-${escapeHtml(detail.id)} ${embedded ? "embedded" : ""}">
        <div class="temporal-head">
          <div>
            <p class="eyebrow">Mapa Pacjenta 360</p>
            <h2>${embedded ? "Mapa najważniejszych zdarzeń" : "Warstwowa historia pacjenta"}</h2>
            <p class="episode-narrative">${escapeHtml(mapModel.summary.narrative)}</p>
          </div>
          <div class="timeline-head-actions">
            <div class="temporal-range">
              <span>${formatDate(range.start)}</span>
              <i data-lucide="arrow-right"></i>
              <span>${formatDate(range.end)}</span>
            </div>
            ${embedded ? `<button class="ghost-button" data-set-view="timeline"><i data-lucide="map"></i>Pełna mapa</button>` : ""}
          </div>
        </div>
        <section class="safety-note compact">
          <i data-lucide="shield-alert"></i>
          <span>Mapa pokazuje zdarzenia, źródła, luki i pytania DITL. Relacje są opisane jako powiązania czasowe lub źródłowe, nie jako przyczyna.</span>
        </section>
        ${embedded ? "" : renderTimelineControls(period, detail, zoom, periods, details, zoomConfig)}
        ${renderTimelineOverview(filteredEvents, range, detail, zoom)}
        ${embedded ? "" : renderTimelineLegend(clinicalEvents, trackFilter)}
        ${renderTimelineMiniMap(events, range)}
        <div class="patient-map-workbench">
          <div class="patient-map-canvas">
            <div class="temporal-scroll" aria-label="Mapa Pacjenta 360">
              <div class="temporal-map ${zoom <= 0.58 ? "zoom-compact" : ""}" style="--event-count: ${events.length}; --event-width: ${geometry.eventWidth}px; --card-width: ${geometry.cardWidth}px; --map-width: ${mapWidth}px; --map-height: ${geometry.mapHeight}px; --event-height: ${geometry.eventHeight}px;">
                <div class="temporal-spine" aria-hidden="true">
                  <span>historia</span>
                  <span>stan</span>
                  <span>sygnały</span>
                  <span>decyzja</span>
                </div>
                ${events.map((event, index) => renderTimelineEvent(event, index, detail.id, zoom, selectedId, safePersona, mapModel.today)).join("")}
                <div class="temporal-today-marker" style="--today-left: ${todayPercent}%;" aria-label="Dziś na mapie pacjenta"><span>Dziś</span></div>
              </div>
            </div>
            <p class="temporal-scroll-hint"><i data-lucide="move-horizontal"></i> Oddal, aby zobaczyć cały odcinek jako jedną linię. Przybliż, żeby rozsunąć zdarzenia, przewijać je poziomo i wejść w źródła.</p>
          </div>
          ${renderTimelineInspector(selected, safePersona, sourceChips)}
        </div>
      </section>
    `;
  }

  return Object.freeze({
    render
  });
});
