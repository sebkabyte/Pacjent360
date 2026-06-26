/*
  Pacjent360 A1-Core projection.
  Read-only, source-grounded dashboard over synthetic demo state.
*/
(function initPatient360A1Core(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.Patient360A1Core = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360A1Core() {
  "use strict";

  const SOURCE_MISSING_REF = "source_missing";
  const ALL_CONSENT_AREAS = Object.freeze(["documents", "results", "medications", "observations", "visits", "tasks", "report"]);
  const FEED_CARD_TYPES = new Set(["timeline_event", "result_series", "source_summary", "consent_scope"]);
  const INSPECTOR_CARD_TYPES = new Set(["ditl_question", "missing_data", "discrepancy", "source_gap", "data_quality"]);
  const BLOCKED_ACTION_IDS = new Set(["apply_plan", "book_visit", "buy_medication", "call_external_api", "plain_language", "post_visit_task"]);
  const PHASE2_TYPES = new Set(["plain_language_summary", "post_visit_task", "booking", "medication_access", "care_navigation"]);
  const FORBIDDEN_COPY_PATTERNS = Object.freeze([
    "diagnoza",
    "rozpoznanie",
    "zalecenie",
    "terapia",
    "pilne",
    "natychmiast",
    "triage",
    "w normie",
    "poza norma",
    "rekomendacja",
    "alert",
    "niebezpiecz",
    "zastosuj plan",
    "sor",
    "wykryto"
  ]);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[łŁ]/g, "l")
      .toLowerCase();
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [value].filter(Boolean);
  }

  function unique(values) {
    return [...new Set(asArray(values).map(String).filter(Boolean))];
  }

  function dateOnly(value) {
    return String(value || "").slice(0, 10);
  }

  function byPatient(state, key, patientId) {
    return asArray(state && state[key]).filter((item) => item.patientId === patientId);
  }

  function hasSourceState(card) {
    const refs = unique(card.sourceRefs);
    return refs.length > 0 || card.sourceStatus === SOURCE_MISSING_REF;
  }

  function sourceRefsFor(card) {
    const refs = unique(card.sourceRefs);
    return refs.length ? refs : (card.sourceStatus === SOURCE_MISSING_REF ? [SOURCE_MISSING_REF] : []);
  }

  function collectRenderableText(card) {
    return [
      card.title,
      card.description,
      card.primaryAction,
      card.statusLabel,
      card.surfaceLabel
    ].filter(Boolean).join(" ");
  }

  function copyErrors(card) {
    const text = normalize(collectRenderableText(card));
    return FORBIDDEN_COPY_PATTERNS
      .filter((pattern) => text.includes(pattern))
      .map((pattern) => `copy.forbidden:${pattern}`);
  }

  function consentErrors(card, context) {
    if (context.role !== "caregiver") return [];
    const hiddenAreas = new Set(unique(context.hiddenAreas));
    const errors = [];
    const area = card.requiredArea || card.dataArea || "";
    if (area && hiddenAreas.has(area)) errors.push(`consent.hiddenArea:${area}`);
    if (card.revealsHiddenArea === true) errors.push("consent.hiddenArea.revealed");
    const text = normalize(collectRenderableText(card));
    hiddenAreas.forEach((hiddenArea) => {
      if (hiddenArea === "report" && (text.includes("raport") || text.includes("report"))) {
        errors.push("consent.hiddenArea.copy:report");
      }
    });
    return errors;
  }

  function safeRenderCard(card, context = {}) {
    const errors = [];
    if (!card || typeof card !== "object") {
      return { allowed: false, errors: ["card.missing"], card: null };
    }
    if (!card.id) errors.push("card.id.missing");
    if (!card.projectionId) errors.push("projectionId.missing");
    if (!hasSourceState(card)) errors.push("source.missing");
    if (card.surface === "feed" && !FEED_CARD_TYPES.has(card.type)) errors.push(`surface.feedTypeBlocked:${card.type}`);
    if (card.surface === "inspector" && !INSPECTOR_CARD_TYPES.has(card.type)) errors.push(`surface.inspectorTypeInvalid:${card.type}`);
    if (card.surface !== "feed" && card.surface !== "inspector") errors.push(`surface.invalid:${card.surface}`);
    if (BLOCKED_ACTION_IDS.has(card.actionId)) errors.push(`action.blocked:${card.actionId}`);
    if (PHASE2_TYPES.has(card.type) || card.phase === "phase2_high_risk") errors.push("phase2.blocked");
    errors.push(...copyErrors(card));
    errors.push(...consentErrors(card, context));

    const safeCard = {
      ...card,
      sourceRefs: sourceRefsFor(card),
      isSourceMissing: sourceRefsFor(card).includes(SOURCE_MISSING_REF),
      visibleAgentLabel: "",
      gateStatus: errors.length ? "blocked" : "allowed"
    };

    return {
      allowed: errors.length === 0,
      errors,
      card: safeCard
    };
  }

  function sourceRecordEntries(state, patientId) {
    const entries = [];
    const push = (ref, type, label, item) => {
      if (!ref) return;
      entries.push({
        ref,
        type,
        label,
        patientId: item && item.patientId || patientId,
        date: item && (item.date || item.eventDate || item.contactDate || item.generatedAt || item.validTo) || "",
        recordId: item && item.id || ""
      });
    };
    byPatient(state, "documents", patientId).forEach((item) => push(`doc:${item.id}`, "document", item.title || item.type, item));
    byPatient(state, "interviews", patientId).forEach((item) => {
      push(`interview:${item.id}`, "interview", item.scenario || "Wywiad", item);
      push(`transcript:${item.id}`, "transcript", `Transkrypcja: ${item.scenario || item.id}`, item);
    });
    byPatient(state, "observations", patientId).forEach((item) => push(`observation:${item.id}`, "observation", item.name, item));
    byPatient(state, "medications", patientId).forEach((item) => push(`medication:${item.id}`, "medication", item.name, item));
    byPatient(state, "flags", patientId).forEach((item) => push(`flag:${item.id}`, "flag", item.category, item));
    byPatient(state, "decisionContexts", patientId).forEach((item) => push(`decision:${item.id}`, "decisionContext", item.type, item));
    byPatient(state, "reports", patientId).forEach((item) => push(`report:${item.id}`, "report", item.type, item));
    byPatient(state, "consents", patientId).forEach((item) => push(`consent:${item.id}`, "consent", item.subject || item.scope, item));
    return entries;
  }

  function buildSourceIndex(state, patientId) {
    const map = new Map(sourceRecordEntries(state, patientId).map((source) => [source.ref, source]));
    return {
      sources: [...map.values()].sort((a, b) => a.ref.localeCompare(b.ref)),
      has(ref) {
        return ref === SOURCE_MISSING_REF || map.has(ref);
      },
      get(ref) {
        return map.get(ref) || null;
      }
    };
  }

  function sourceCoverageFor(cards, sourceIndex) {
    const refs = cards.flatMap((card) => sourceRefsFor(card));
    const checked = refs.filter((ref) => ref !== SOURCE_MISSING_REF);
    const missing = checked.filter((ref) => !sourceIndex.has(ref));
    return {
      checkedCount: checked.length,
      missingCount: missing.length,
      sourceMissingCount: refs.filter((ref) => ref === SOURCE_MISSING_REF).length,
      missingRefs: unique(missing)
    };
  }

  function activeCaregiverAreas(state, patientId) {
    return new Set(byPatient(state, "consents", patientId)
      .filter((consent) => consent.status === "aktywny")
      .flatMap((consent) => consent.areas || []));
  }

  function hiddenAreasForRole(state, patientId, role, overrideHiddenAreas) {
    if (Array.isArray(overrideHiddenAreas)) return unique(overrideHiddenAreas);
    if (role !== "caregiver") return [];
    const active = activeCaregiverAreas(state, patientId);
    return ALL_CONSENT_AREAS.filter((area) => !active.has(area));
  }

  function areaForTimelineEvent(event) {
    const track = normalize(event && event.track);
    if (track.includes("badania")) return "results";
    if (track.includes("leki")) return "medications";
    if (track.includes("konsult") || track.includes("hospital")) return "visits";
    if (track.includes("obserw") || track.includes("funkcjon")) return "observations";
    if (track.includes("decyz")) return "report";
    return "documents";
  }

  function sourceOverlap(leftRefs, rightRefs) {
    const right = new Set(unique(rightRefs));
    return unique(leftRefs).some((ref) => right.has(ref));
  }

  function reportRefForSources(state, patientId, sourceRefs) {
    const report = byPatient(state, "reports", patientId).find((item) => sourceOverlap(sourceRefs, item.sourceRefs || []));
    return report ? `report:${report.id}` : "report:context-draft";
  }

  function timelineRefForSources(state, patientId, sourceRefs) {
    const event = byPatient(state, "timelineEvents", patientId).find((item) => sourceOverlap(sourceRefs, item.sourceRefs || []));
    return event ? `timeline:${event.id}` : "timeline:source-derived";
  }

  function projectionLinks(kind, id, state, patientId, sourceRefs) {
    const timelineRef = kind === "timeline" ? `timeline:${id}` : timelineRefForSources(state, patientId, sourceRefs);
    return {
      feed: `feed:${kind}:${id}`,
      inspector: `inspector:${kind}:${id}`,
      table: `table:${kind}:${id}`,
      chart: kind === "result" ? `chart:result:${id}` : "",
      timelineFilm: timelineRef,
      report: reportRefForSources(state, patientId, sourceRefs)
    };
  }

  function timelineCards(state, patientId) {
    return byPatient(state, "timelineEvents", patientId)
      .slice()
      .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
      .map((event) => {
        const projectionId = `projection:timeline:${event.id}`;
        const sourceRefs = unique(event.sourceRefs);
        return {
          id: `a1-feed-${event.id}`,
          projectionId,
          recordId: event.id,
          date: dateOnly(event.date),
          type: "timeline_event",
          surface: "feed",
          title: event.title || "Zdarzenie z osi",
          description: event.description || "",
          status: event.status || "do potwierdzenia",
          ditlStatus: event.status === "potwierdzone" ? "wyjasnione" : "do wyjasnienia",
          sourceRefs,
          requiredArea: areaForTimelineEvent(event),
          linkedSurfaces: projectionLinks("timeline", event.id, state, patientId, sourceRefs)
        };
      });
  }

  function latestValue(observation) {
    const values = Array.isArray(observation && observation.values) ? observation.values : [];
    return values.slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || ""))).at(-1) || null;
  }

  function resultCards(state, patientId) {
    return byPatient(state, "observations", patientId).map((observation) => {
      const latest = latestValue(observation);
      const sourceRefs = unique(latest && latest.sourceRefs || observation.sourceRefs || [`observation:${observation.id}`]);
      const projectionId = `projection:result:${observation.id}:${observation.unit || "no-unit"}`;
      return {
        id: `a1-result-${observation.id}`,
        projectionId,
        recordId: observation.id,
        date: dateOnly(latest && latest.date),
        type: "result_series",
        surface: "feed",
        title: observation.name || "Wynik",
        description: latest ? `Ostatni punkt: ${latest.value} ${observation.unit || ""}`.trim() : "Brak punktu wyniku",
        status: "draft",
        ditlStatus: "do wyjasnienia",
        sourceRefs,
        requiredArea: "results",
        linkedSurfaces: projectionLinks("result", observation.id, state, patientId, sourceRefs)
      };
    });
  }

  function flagInspectorCards(state, patientId) {
    return byPatient(state, "flags", patientId).map((flag) => ({
      id: `a1-inspector-flag-${flag.id}`,
      projectionId: `projection:question:${flag.id}`,
      recordId: flag.id,
      date: "",
      type: flag.color === "blue" ? "ditl_question" : "data_quality",
      surface: "inspector",
      title: flag.category || "Punkt do omowienia",
      description: flag.question || flag.evidence || "",
      status: flag.status || "do wyjasnienia",
      ditlStatus: flag.status || "do wyjasnienia",
      sourceRefs: unique(flag.sourceRefs),
      requiredArea: "report",
      linkedSurfaces: projectionLinks("question", flag.id, state, patientId, flag.sourceRefs || [])
    }));
  }

  function decisionInspectorCards(state, patientId) {
    return byPatient(state, "decisionContexts", patientId).flatMap((decision) =>
      asArray(decision.ditlQuestions).map((question) => {
        const sourceRefs = unique(question.sourceRefs || decision.sourceRefs || [`decision:${decision.id}`]);
        return {
          id: `a1-inspector-question-${decision.id}-${question.id}`,
          projectionId: `projection:ditl:${decision.id}:${question.id}`,
          recordId: `${decision.id}:${question.id}`,
          date: dateOnly(decision.contactDate),
          type: "ditl_question",
          surface: "inspector",
          title: "Pytanie do rozmowy",
          description: question.question || "",
          status: question.status || "do wyjasnienia",
          ditlStatus: question.status || "do wyjasnienia",
          sourceRefs,
          requiredArea: "report",
          linkedSurfaces: projectionLinks("ditl", `${decision.id}:${question.id}`, state, patientId, sourceRefs)
        };
      })
    );
  }

  function applyGate(cards, context) {
    const allowed = [];
    const blocked = [];
    cards.forEach((card) => {
      const result = safeRenderCard(card, context);
      if (result.allowed) allowed.push(result.card);
      else blocked.push({ ...result.card, errors: result.errors });
    });
    return { allowed, blocked };
  }

  function projectionLedger(cards) {
    return cards.map((card) => ({
      projectionId: card.projectionId,
      label: card.title,
      type: card.type,
      sourceRefs: sourceRefsFor(card),
      linkedSurfaces: card.linkedSurfaces || {}
    }));
  }

  function projectSafeDashboard(input = {}) {
    const state = input.state || {};
    const patientId = input.patientId || state.activePatientId || (state.patients || [])[0]?.id || "";
    const role = input.role || state.activeRole || "doctor";
    const patient = asArray(state.patients).find((item) => item.id === patientId) || null;
    const hiddenAreas = hiddenAreasForRole(state, patientId, role, input.hiddenAreas);
    const sourceIndex = buildSourceIndex(state, patientId);
    const context = { role, hiddenAreas, sourceIndex };
    const rawFeedCards = [...timelineCards(state, patientId), ...resultCards(state, patientId)];
    const rawInspectorCards = [...flagInspectorCards(state, patientId), ...decisionInspectorCards(state, patientId)];
    const feedGate = applyGate(rawFeedCards, context);
    const inspectorGate = applyGate(rawInspectorCards, context);
    const feedCards = feedGate.allowed;
    const inspectorCards = inspectorGate.allowed;
    const blockedCards = [...feedGate.blocked, ...inspectorGate.blocked];
    const visibleCards = [...feedCards, ...inspectorCards];
    const coverage = sourceCoverageFor(visibleCards, sourceIndex);

    return {
      id: `a1-core:${patientId}:${role}`,
      sprint: "A1-Core",
      status: "read_only_fixture_dashboard",
      dataMode: "synthetic_demo_state",
      runtimeLlmEnabled: false,
      persistence: {
        indexedDbWrites: false,
        localStorageProfileWrites: false,
        networkWrites: false
      },
      patient,
      patientId,
      role,
      hiddenAreas,
      sourceIndex: sourceIndex.sources,
      feedCards,
      inspectorCards,
      resultCards: feedCards.filter((card) => card.type === "result_series"),
      timelineCards: feedCards.filter((card) => card.type === "timeline_event"),
      blockedCards,
      projectionLedger: projectionLedger(visibleCards),
      sourceCoverage: coverage,
      gateSummary: {
        visibleCards: visibleCards.length,
        feedCards: feedCards.length,
        inspectorCards: inspectorCards.length,
        blockedCards: blockedCards.length,
        missingSourceRefs: coverage.missingRefs
      }
    };
  }

  function validateProjection(model) {
    const errors = [];
    if (!model || typeof model !== "object") return { valid: false, errors: ["model.missing"] };
    if (model.runtimeLlmEnabled !== false) errors.push("runtimeLlm.enabled");
    if (model.persistence?.indexedDbWrites !== false) errors.push("persistence.indexedDbWrites.enabled");
    if (model.persistence?.localStorageProfileWrites !== false) errors.push("persistence.localStorageProfileWrites.enabled");
    if (model.persistence?.networkWrites !== false) errors.push("persistence.networkWrites.enabled");
    [...asArray(model.feedCards), ...asArray(model.inspectorCards)].forEach((card) => {
      if (!card.projectionId) errors.push(`projectionId.missing:${card.id}`);
      if (!hasSourceState(card)) errors.push(`source.missing:${card.id}`);
      if (card.surface === "feed" && !FEED_CARD_TYPES.has(card.type)) errors.push(`feed.type.invalid:${card.id}`);
      if (card.surface === "inspector" && !INSPECTOR_CARD_TYPES.has(card.type)) errors.push(`inspector.type.invalid:${card.id}`);
      copyErrors(card).forEach((error) => errors.push(`${card.id}.${error}`));
    });
    asArray(model.feedCards).forEach((card) => {
      if (INSPECTOR_CARD_TYPES.has(card.type)) errors.push(`inspectorItem.inFeed:${card.id}`);
    });
    asArray(model.inspectorCards).forEach((card) => {
      if (card.surface !== "inspector") errors.push(`inspector.surface.invalid:${card.id}`);
    });
    asArray(model.resultCards).forEach((card) => {
      const links = card.linkedSurfaces || {};
      ["table", "chart", "timelineFilm", "report"].forEach((key) => {
        if (!links[key]) errors.push(`result.linkedSurface.missing:${card.id}:${key}`);
      });
    });
    if (model.sourceCoverage?.missingCount) {
      errors.push(`sourceCoverage.missing:${model.sourceCoverage.missingRefs.join(",")}`);
    }
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    SOURCE_MISSING_REF,
    ALL_CONSENT_AREAS,
    FORBIDDEN_COPY_PATTERNS,
    buildSourceIndex,
    safeRenderCard,
    projectSafeDashboard,
    validateProjection,
    _private: Object.freeze({
      clone,
      sourceCoverageFor,
      hiddenAreasForRole,
      projectionLinks
    })
  });
});

