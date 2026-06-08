(function initPatient360MapModel(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const mapModel = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = mapModel;
  }
  root.Patient360MapModel = mapModel;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360MapModel(contract) {
  if (!contract) {
    throw new Error("Missing patient360-contract.js");
  }

  const TRACKS = contract.TIMELINE_TRACKS || [];
  const TIMELINE_STATUS_META = contract.TIMELINE_STATUS_META || {};
  const DEFAULT_ZOOM = Object.freeze({ min: 0.4, max: 1.55, step: 0.1, fit: 0.42 });
  const SOURCE_MISSING_REF = contract.SOURCE_MISSING_REF || "source_missing";

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function matchesSearchValue(item, query) {
    const safeQuery = normalize(query).trim();
    if (!safeQuery) return true;
    return normalize(JSON.stringify(item)).includes(safeQuery);
  }

  function dateOnly(value) {
    return String(value || "").slice(0, 10);
  }

  function todayInputValue() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  function isoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addMonths(value, amount) {
    const date = parseDateOnly(value) || new Date();
    date.setMonth(date.getMonth() + amount);
    return isoDate(date);
  }

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeSourceRefs(refs) {
    if (Array.isArray(refs)) return refs.filter(Boolean);
    return [refs].filter(Boolean);
  }

  function byPatient(collection, patientId) {
    return (Array.isArray(collection) ? collection : []).filter((item) => item.patientId === patientId);
  }

  function normalizeTimelineZoom(value, zoomConfig = DEFAULT_ZOOM) {
    const zoom = Number(value);
    if (!Number.isFinite(zoom)) return 0.9;
    return Number(clampNumber(zoom, zoomConfig.min, zoomConfig.max).toFixed(2));
  }

  function clampEndDate(events, today) {
    const safeToday = dateOnly(today || todayInputValue());
    const latestEvent = events[events.length - 1]?.date;
    if (!latestEvent) return safeToday;
    const todayDate = parseDateOnly(safeToday);
    const latestDate = parseDateOnly(latestEvent);
    return latestDate && todayDate && latestDate > todayDate ? dateOnly(latestEvent) : safeToday;
  }

  function timelineRange(events, patient, periodId, today) {
    const end = clampEndDate(events, today);
    if (periodId === "life") {
      return {
        start: patient?.birthDate || events[0]?.date || end,
        end,
        label: "od urodzenia do dziś",
        periodId
      };
    }
    if (periodId === "year") {
      return {
        start: addMonths(end, -12),
        end,
        label: "ostatnie 12 miesięcy",
        periodId
      };
    }
    return {
      start: events[0]?.date || addMonths(end, -1),
      end,
      label: "aktywny epizod",
      periodId: periodId || "episode"
    };
  }

  function isTimelineEventInRange(event, range) {
    const eventDate = parseDateOnly(event.date);
    const startDate = parseDateOnly(range.start);
    const endDate = parseDateOnly(range.end);
    if (!eventDate || !startDate || !endDate) return true;
    return eventDate >= startDate && eventDate <= endDate;
  }

  function timelineDisplayEvents(events, patient, range, periodId, searchQuery) {
    if (periodId !== "life" || normalize(searchQuery).trim()) return events;
    return [
      {
        id: "anchor-birth",
        patientId: patient?.id,
        date: patient?.birthDate,
        track: "funkcjonowanie",
        title: "Początek osi pacjenta",
        description: "Data urodzenia jako orientacyjna kotwica czasu. To nie jest zdarzenie kliniczne.",
        confidence: "orientacyjna",
        status: "orientacyjne",
        sourceRefs: [],
        virtual: true
      },
      ...events,
      {
        id: "anchor-now",
        patientId: patient?.id,
        date: range.end,
        track: "decyzje medyczne",
        title: "Dziś / chwila użycia narzędzia",
        description: "Aktualny punkt pracy lekarza z kontekstem decyzji DITL.",
        confidence: "orientacyjna",
        status: "orientacyjne",
        sourceRefs: [],
        virtual: true
      }
    ];
  }

  function timelineEventStatus(event) {
    if (event?.virtual) return "orientacyjne";
    if (event?.status) return event.status;
    return normalizeSourceRefs(event?.sourceRefs).length ? "potwierdzone" : "do potwierdzenia";
  }

  function timelineStatusMeta(status) {
    return TIMELINE_STATUS_META[status] || TIMELINE_STATUS_META["do potwierdzenia"];
  }

  function timelineGeometry(detailId, zoom) {
    const presets = {
      overview: { eventWidth: 196, cardWidth: 214, mapHeight: 520, eventHeight: 468 },
      standard: { eventWidth: 270, cardWidth: 274, mapHeight: 800, eventHeight: 748 },
      detail: { eventWidth: 326, cardWidth: 326, mapHeight: 880, eventHeight: 828 }
    };
    const base = presets[detailId] || presets.standard;
    const compact = zoom <= 0.58;
    return {
      eventWidth: Math.round(base.eventWidth * zoom),
      cardWidth: Math.round(Math.max(compact ? 136 : 210, base.cardWidth * zoom)),
      mapHeight: Math.round(Math.max(compact ? 430 : 620, base.mapHeight * (0.78 + zoom * 0.22))),
      eventHeight: Math.round(Math.max(compact ? 378 : 560, base.eventHeight * (0.78 + zoom * 0.22)))
    };
  }

  function selectedTimelineEvent(events, selectedEventId) {
    if (!events.length) return null;
    return events.find((event) => event.id === selectedEventId) || events.find((event) => !event.virtual) || events[0];
  }

  function refsOverlap(left = [], right = []) {
    const leftList = normalizeSourceRefs(left);
    const rightSet = new Set(normalizeSourceRefs(right));
    return leftList.some((ref) => rightSet.has(ref));
  }

  function timelineEventQuestions(event, state, patientId) {
    if (!event || event.virtual) return [];
    const refs = normalizeSourceRefs(event.sourceRefs);
    const flagQuestions = byPatient(state.flags, patientId)
      .filter((flag) => refsOverlap(refs, flag.sourceRefs || []))
      .map((flag) => ({
        id: `flag-${flag.id}`,
        label: flag.category,
        question: flag.question,
        status: flag.status,
        sourceRefs: flag.sourceRefs || []
      }));
    const decisionQuestions = byPatient(state.decisionContexts, patientId).flatMap((decision) =>
      (decision.ditlQuestions || [])
        .filter((question) => refsOverlap(refs, question.sourceRefs || decision.sourceRefs || []))
        .map((question) => ({
          id: `decision-${decision.id}-${question.id}`,
          label: decision.type,
          question: question.question,
          status: question.status,
          sourceRefs: question.sourceRefs || decision.sourceRefs || []
        }))
    );
    return [...flagQuestions, ...decisionQuestions].slice(0, 5);
  }

  function buildEpisodeByEventId(episodes) {
    const episodeByEventId = new Map();
    episodes.forEach((episode) => {
      (episode.eventRefs || []).forEach((eventId) => {
        episodeByEventId.set(eventId, episode);
      });
    });
    return episodeByEventId;
  }

  function timelineEpisodeForEvent(event, episodes, episodeByEventId) {
    if (!event) return null;
    if (episodeByEventId.has(event.id)) return episodeByEventId.get(event.id);
    if (!event.episodeId) return null;
    return episodes.find((episode) => episode.id === event.episodeId) || null;
  }

  function timelineEventRelations(event, displayEvents, state, patientId) {
    if (!event || event.virtual) return [];
    const eventMap = new Map(displayEvents.map((item) => [item.id, item]));
    const allEvents = byPatient(state.timelineEvents, patientId);
    return byPatient(state.timelineRelations, patientId)
      .filter((relation) => relation.fromEventId === event.id || relation.toEventId === event.id)
      .map((relation) => {
        const otherId = relation.fromEventId === event.id ? relation.toEventId : relation.fromEventId;
        return {
          ...relation,
          causality: relation.causality || "not_asserted",
          otherEvent: eventMap.get(otherId) || allEvents.find((item) => item.id === otherId)
        };
      });
  }

  function generateEpisodeNarrative(events) {
    if (!events.length) {
      return "Brak zdarzeń w wybranym odcinku. Zmień zakres czasu albo wyczyść wyszukiwanie.";
    }
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const trackCounts = TRACKS.map((track) => ({
      track,
      count: sorted.filter((event) => event.track === track).length
    })).filter((item) => item.count);
    const leadingTrack = trackCounts.sort((a, b) => b.count - a.count)[0];
    return `Ten odcinek łączy ${sorted.length} zdarzeń od ${formatDate(first.date)} do ${formatDate(last.date)}. Najwięcej wpisów dotyczy toru "${leadingTrack?.track || "brak danych"}". Przewiń linię, oddal do całej historii albo wybierz jeden tor, aby zobaczyć szczegóły i źródła.`;
  }

  function buildTrackLayers(events, activeTrackId = null) {
    return TRACKS.map((track) => {
      const count = events.filter((event) => event.track === track).length;
      return { id: track, track, count, active: activeTrackId === track, empty: count === 0 };
    });
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

  function buildSourceQuality(events) {
    const nonVirtual = events.filter((event) => !event.virtual);
    const sourceMissingCount = nonVirtual.filter((event) => {
      const refs = normalizeSourceRefs(event.sourceRefs);
      return !refs.length || refs.includes(SOURCE_MISSING_REF);
    }).length;
    return {
      sourceMissingCount,
      sourceCoveredCount: nonVirtual.length - sourceMissingCount,
      totalCount: nonVirtual.length
    };
  }

  function buildPatientMapModel(input = {}) {
    const state = input.state || {};
    const patients = Array.isArray(state.patients) ? state.patients : [];
    const patientId = input.patientId || state.activePatientId || patients[0]?.id;
    const patient = patients.find((item) => item.id === patientId) || patients[0] || null;
    const safePatientId = patient?.id || patientId;
    const periods = Array.isArray(input.periods) && input.periods.length ? input.periods : [{ id: "episode", label: "Epizod" }];
    const details = Array.isArray(input.details) && input.details.length ? input.details : [{ id: "standard", label: "Standard" }];
    const zoomConfig = input.zoomConfig || DEFAULT_ZOOM;
    const period = periods.find((item) => item.id === input.periodId) || periods[0];
    const detail = input.embedded ? details[0] : details.find((item) => item.id === input.detailId) || details[1] || details[0];
    const baseZoom = normalizeTimelineZoom(input.zoom, zoomConfig);
    const zoom = input.embedded ? Math.max(zoomConfig.fit, Math.min(baseZoom, 0.62)) : baseZoom;
    const safePersona = input.persona === "patient" ? "patient" : "doctor";
    const searchQuery = input.searchQuery ?? input.search ?? "";
    const today = dateOnly(input.today || todayInputValue());
    const trackFilter = input.trackFilter || null;
    const rawEvents = byPatient(state.timelineEvents, safePatientId)
      .filter((event) => matchesSearchValue(event, searchQuery))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const range = timelineRange(rawEvents, patient, period.id, today);
    const clinicalEvents = rawEvents.filter((event) => isTimelineEventInRange(event, range));
    const filteredEvents = trackFilter ? clinicalEvents.filter((event) => event.track === trackFilter) : clinicalEvents;
    const displayPeriodId = trackFilter ? "episode" : period.id;
    const events = timelineDisplayEvents(filteredEvents, patient, range, displayPeriodId, searchQuery);
    const geometry = timelineGeometry(detail.id, zoom);
    const selectedEvent = selectedTimelineEvent(events, input.selectedEventId);
    const selectedId = selectedEvent?.id || "";
    const todayDate = parseDateOnly(today);
    const todayCandidateIndex = events.findIndex((event) => {
      const eventDate = parseDateOnly(event.date);
      return eventDate && todayDate ? eventDate >= todayDate : false;
    });
    const todayColumn = todayCandidateIndex >= 0 ? todayCandidateIndex + 1 : Math.max(events.length, 1);
    const episodes = byPatient(state.timelineEpisodes, safePatientId);
    const episodeByEventIdMap = buildEpisodeByEventId(episodes);
    const episodeByEventId = Object.fromEntries(episodeByEventIdMap.entries());
    const questionsByEventId = Object.fromEntries(events.map((event) => [event.id, timelineEventQuestions(event, state, safePatientId)]));
    const relationsByEventId = Object.fromEntries(events.map((event) => [event.id, timelineEventRelations(event, events, state, safePatientId)]));
    const enrichedEvents = events.map((event) => ({
      ...event,
      status: timelineEventStatus(event),
      statusMeta: timelineStatusMeta(timelineEventStatus(event)),
      sourceCount: normalizeSourceRefs(event.sourceRefs).length,
      selected: event.id === selectedId,
      future: Boolean(parseDateOnly(event.date) && todayDate && parseDateOnly(event.date) >= todayDate),
      positionPercent: timelinePositionPercent(event.date, range),
      episode: timelineEpisodeForEvent(event, episodes, episodeByEventIdMap),
      questions: questionsByEventId[event.id] || [],
      relations: relationsByEventId[event.id] || []
    }));
    const selectedEnriched = enrichedEvents.find((event) => event.id === selectedId) || null;
    const layers = buildTrackLayers(clinicalEvents, trackFilter);
    const activeTracks = layers.filter((layer) => !layer.empty);
    const hiddenTracks = layers.length - activeTracks.length;
    const warnings = [];
    Object.values(relationsByEventId).flat().forEach((relation) => {
      if (relation.causality && relation.causality !== "not_asserted") {
        warnings.push(`Relation ${relation.id || "(missing id)"} asserts causality`);
      }
    });

    return {
      patient,
      patientId: safePatientId,
      period,
      periodId: period.id,
      detail,
      detailId: detail.id,
      trackFilter,
      safePersona,
      persona: safePersona,
      embedded: Boolean(input.embedded),
      searchQuery,
      today,
      range,
      rawEvents,
      clinicalEvents,
      filteredEvents,
      events: enrichedEvents,
      displayEvents: enrichedEvents,
      geometry,
      selectedEvent: selectedEnriched,
      selected: selectedEnriched,
      selectedId,
      todayColumn,
      layers,
      activeTracks,
      hiddenTracks,
      episodes,
      episodeByEventId,
      questionsByEventId,
      relationsByEventId,
      sourceQuality: buildSourceQuality(enrichedEvents),
      summary: {
        eventCount: enrichedEvents.length,
        clinicalEventCount: clinicalEvents.length,
        activeTrackCount: activeTracks.length,
        hiddenTrackCount: hiddenTracks,
        narrative: generateEpisodeNarrative(clinicalEvents)
      },
      quality: {
        sourceMissingCount: buildSourceQuality(enrichedEvents).sourceMissingCount,
        hasPlannedEvents: enrichedEvents.some((event) => event.status === "planowane"),
        hasVirtualAnchors: enrichedEvents.some((event) => event.virtual)
      },
      warnings
    };
  }

  function validatePatientMapModel(model) {
    const errors = [];
    const warnings = [];
    if (!model || typeof model !== "object") {
      return { valid: false, errors: ["Model is missing"], warnings };
    }
    if (!model.patientId) errors.push("patientId is missing");
    if (!model.range?.start || !model.range?.end) errors.push("range.start/range.end are required");
    const ids = new Set();
    (model.events || []).forEach((event) => {
      if (!event.id) errors.push("event.id is missing");
      if (ids.has(event.id)) errors.push(`duplicate event id: ${event.id}`);
      ids.add(event.id);
      if (!TRACKS.includes(event.track)) errors.push(`invalid track for ${event.id}: ${event.track}`);
      const refs = normalizeSourceRefs(event.sourceRefs);
      if (!event.virtual && !refs.length) errors.push(`event without sourceRefs: ${event.id}`);
      if (!event.virtual && refs.includes(SOURCE_MISSING_REF)) warnings.push(`event uses source_missing: ${event.id}`);
    });
    if (model.selectedId && !ids.has(model.selectedId)) {
      errors.push(`selectedId is not in display events: ${model.selectedId}`);
    }
    Object.values(model.relationsByEventId || {}).flat().forEach((relation) => {
      if (relation.causality && relation.causality !== "not_asserted") {
        errors.push(`relation asserts causality: ${relation.id || "(missing id)"}`);
      }
    });
    return { valid: errors.length === 0, errors, warnings };
  }

  return Object.freeze({
    buildPatientMapModel,
    validatePatientMapModel,
    timelineRange,
    timelineGeometry,
    timelineEventStatus,
    timelineStatusMeta,
    normalizeTimelineZoom,
    parseDateOnly,
    timelinePositionPercent
  });
});
