/*
  Pacjent360 A6 Visit Checklist.
  Read-only pre-visit checklist projected from A1, A3+A5 and A4 guarded data.
*/
(function initPatient360A6Checklist(root, factory) {
  const a1Core =
    root.Patient360A1Core ||
    (typeof require === "function" ? require("./patient360-a1-core.js") : null);
  const a3a5 =
    root.Patient360A3A5Quality ||
    (typeof require === "function" ? require("./patient360-a3-a5-quality.js") : null);
  const consentGuard =
    root.Patient360A4ConsentGuard ||
    (typeof require === "function" ? require("./patient360-a4-consent-guard.js") : null);
  const api = factory(a1Core, a3a5, consentGuard);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.Patient360A6Checklist = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360A6Checklist(a1Core, a3a5, consentGuard) {
  "use strict";

  const SOURCE_MISSING_REF = "source_missing";
  const CATEGORIES = Object.freeze(["to_bring", "to_ask", "to_confirm", "ready"]);
  const STATUSES = Object.freeze(["ready", "confirm", "missing", "optional"]);
  const CATEGORY_LABELS = Object.freeze({
    to_bring: {
      patient: "Co zabrać",
      caregiver: "Co przygotować",
      doctor: "Dostarczone przez pacjenta"
    },
    to_ask: {
      patient: "O co zapytać",
      caregiver: "O co dopytać",
      doctor: "Pytania od pacjenta"
    },
    to_confirm: {
      patient: "Co potwierdzić",
      caregiver: "Co sprawdzić organizacyjnie",
      doctor: "Do potwierdzenia w rozmowie"
    },
    ready: {
      patient: "Gotowe",
      caregiver: "Gotowe do pokazania",
      doctor: "Źródła gotowe"
    }
  });
  const FORBIDDEN_COPY_PATTERNS = Object.freeze([
    "diagnoza",
    "rozpoznanie",
    "zalecenie",
    "terapia",
    "pilne",
    "natychmiast",
    "triage",
    "rekomendacja",
    "krytyczne",
    "krytyczny",
    "alert",
    "niebezpiecz",
    "skonsultuj natychmiast",
    "zgłoś się natychmiast",
    "zastosuj plan",
    "odstaw",
    "zmien dawke",
    "zmień dawkę",
    "ukryto",
    "zablokowano",
    "brak dostepu",
    "brak dostępu"
  ]);

  function asArray(value) {
    return Array.isArray(value) ? value : [value].filter(Boolean);
  }

  function unique(values) {
    return [...new Set(asArray(values).map(String).filter(Boolean))];
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[łŁ]/g, "l")
      .toLowerCase();
  }

  function byPatient(state, key, patientId) {
    return asArray(state && state[key]).filter((item) => item.patientId === patientId);
  }

  function firstPatientId(state) {
    return asArray(state && state.patients)[0]?.id || "";
  }

  function sourceRefsFor(item) {
    const refs = unique(item && item.sourceRefs);
    return refs.length ? refs : [SOURCE_MISSING_REF];
  }

  function latestVisitChecklist(state, patientId) {
    return byPatient(state, "visitChecklists", patientId)
      .slice()
      .sort((a, b) => String(a.visitDate || "").localeCompare(String(b.visitDate || "")) || String(a.id || "").localeCompare(String(b.id || "")))[0] || null;
  }

  function areaForSourceRef(ref) {
    if (ref === SOURCE_MISSING_REF) return "report";
    const prefix = String(ref || "").split(":")[0];
    return {
      doc: "documents",
      document: "documents",
      medication: "medications",
      observation: "results",
      result: "results",
      interview: "observations",
      transcript: "observations",
      visit: "visits",
      encounter: "visits",
      checklist: "tasks",
      task: "tasks",
      flag: "report",
      decision: "report",
      report: "report",
      knownUnknown: "report",
      consent: "consent"
    }[prefix] || "report";
  }

  function areaForRefs(refs) {
    const areas = unique(refs).map(areaForSourceRef);
    const order = ["medications", "results", "documents", "observations", "visits", "tasks", "report", "consent"];
    return order.find((area) => areas.includes(area)) || "report";
  }

  function statusFromText(status, refs) {
    const text = normalize(status);
    if (text.includes("gotowe") || text.includes("wyjasn") || text.includes("potwierdzone")) return "ready";
    if (text.includes("brak") || unique(refs).includes(SOURCE_MISSING_REF)) return "missing";
    if (text.includes("opcjonal")) return "optional";
    return "confirm";
  }

  function categoryFromChecklistStatus(status) {
    const key = statusFromText(status);
    if (key === "ready") return "ready";
    if (key === "missing") return "to_bring";
    return "to_confirm";
  }

  function sourceKey(refs) {
    return unique(refs).sort().join("|") || SOURCE_MISSING_REF;
  }

  function linkedSurfacesFor(kind, id, sourceRefs, extra = {}) {
    return {
      checklist: `checklist:${kind}:${id}`,
      timelineFilm: extra.timelineFilm || "timeline:source-derived",
      inspector: extra.inspector || `inspector:${kind}:${id}`,
      report: extra.report || "report:context-draft",
      sourceRefs: sourceKey(sourceRefs)
    };
  }

  function copyErrors(text) {
    const normalized = normalize(text);
    return FORBIDDEN_COPY_PATTERNS
      .filter((pattern) => normalized.includes(normalize(pattern)))
      .map((pattern) => `copy.forbidden:${pattern}`);
  }

  function makeItem(input) {
    const sourceRefs = sourceRefsFor(input);
    const item = {
      id: input.id,
      projectionId: input.projectionId,
      recordId: input.recordId || "",
      category: input.category,
      title: String(input.title || "").trim(),
      description: String(input.description || "").trim(),
      status: input.status,
      requiredArea: input.requiredArea || areaForRefs(sourceRefs),
      sourceRefs,
      linkedSurfaces: input.linkedSurfaces || linkedSurfacesFor("item", input.id, sourceRefs),
      origin: input.origin || "a6"
    };
    return item;
  }

  function sourceRefsOverlap(left, right) {
    const rightSet = new Set(unique(right));
    return unique(left).some((ref) => rightSet.has(ref));
  }

  function itemBusinessKey(item) {
    if (item.origin === "a5_question") return `projection:${item.projectionId}`;
    if (item.recordId) return `${item.requiredArea}:${item.recordId}`;
    return `${item.requiredArea}:${sourceKey(item.sourceRefs)}`;
  }

  function dedupeItems(items) {
    const questionKeys = new Set(items
      .filter((item) => item.origin === "a5_question")
      .map(itemBusinessKey));
    const questionRefs = items
      .filter((item) => item.origin === "a5_question")
      .flatMap((item) => item.sourceRefs);
    const seen = new Set();
    return items.filter((item) => {
      const key = itemBusinessKey(item);
      if (item.origin !== "a5_question" && questionKeys.has(key)) return false;
      if (item.origin === "a1_ready" && sourceRefsOverlap(item.sourceRefs, questionRefs)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function sortItems(items) {
    const categoryRank = new Map(CATEGORIES.map((category, index) => [category, index]));
    const statusRank = new Map([["missing", 0], ["confirm", 1], ["optional", 2], ["ready", 3]]);
    return items.slice().sort((a, b) =>
      (categoryRank.get(a.category) ?? 99) - (categoryRank.get(b.category) ?? 99) ||
      (statusRank.get(a.status) ?? 99) - (statusRank.get(b.status) ?? 99) ||
      String(a.title).localeCompare(String(b.title), "pl")
    );
  }

  function safeChecklistItem(item, context = {}) {
    const errors = [];
    if (!item || typeof item !== "object") return { allowed: false, errors: ["item.missing"], item: null };
    if (!item.id) errors.push("item.id.missing");
    if (!item.projectionId) errors.push("projectionId.missing");
    if (!CATEGORIES.includes(item.category)) errors.push(`category.invalid:${item.category}`);
    if (!STATUSES.includes(item.status)) errors.push(`status.invalid:${item.status}`);
    if (!item.requiredArea) errors.push("requiredArea.missing");
    if (!sourceRefsFor(item).length) errors.push("source.missing");
    copyErrors([item.title, item.description].filter(Boolean).join(" ")).forEach((error) => errors.push(error));
    if (context.role === "caregiver" && consentGuard) {
      const decision = consentGuard.consentDecision(item, context);
      if (!decision.allowed) errors.push(`consent.${decision.reason}`);
    }
    const safe = {
      ...item,
      sourceRefs: consentGuard && context.role === "caregiver"
        ? consentGuard.filterSourceRefs(item.sourceRefs, context)
        : sourceRefsFor(item),
      gateStatus: errors.length ? "blocked" : "allowed"
    };
    return { allowed: errors.length === 0, errors, item: safe };
  }

  function buildGuardedInputs(input) {
    const state = input.state || {};
    const patientId = input.patientId || state.activePatientId || firstPatientId(state);
    const role = input.role || state.activeRole || "patient";
    const today = input.today || input.demoToday || state.demoToday || "2026-06-26";
    const context = consentGuard
      ? (input.context || consentGuard.buildConsentContext({ state, patientId, role, today, allowedAreas: input.allowedAreas }))
      : { role, patientId, today, areaSet: new Set(), zeroKnowledge: role === "caregiver", emptyCopy: "Brak przypisanych elementow" };
    const rawA1 = input.a1Model || a1Core.projectSafeDashboard({ state, patientId, role: role === "caregiver" ? "doctor" : role, today });
    const rawQuality = input.qualityModel || a3a5.projectQualityQuestions({ state, patientId, role: role === "caregiver" ? "doctor" : role, today });
    const a1Model = consentGuard && role === "caregiver"
      ? consentGuard.guardA1CoreProjection(rawA1, { context })
      : rawA1;
    const qualityModel = consentGuard && role === "caregiver"
      ? consentGuard.guardA3A5Projection(rawQuality, { context })
      : rawQuality;
    return { state, patientId, role, today, context, a1Model, qualityModel };
  }

  function itemsFromQuestions(qualityModel) {
    return asArray(qualityModel.questions).map((question) => makeItem({
      id: `a6-question-${question.id}`.replace(/[^a-zA-Z0-9:_-]/g, "-"),
      projectionId: question.projectionId,
      recordId: question.gapId,
      category: "to_ask",
      title: question.questionText || question.title || "Pytanie do rozmowy",
      description: question.reason || "Pytanie powstało z luki danych do omówienia podczas wizyty.",
      status: "confirm",
      requiredArea: question.requiredArea,
      sourceRefs: question.sourceRefs,
      linkedSurfaces: question.linkedSurfaces || linkedSurfacesFor("question", question.id, question.sourceRefs),
      origin: "a5_question"
    }));
  }

  function itemsFromChecklist(state, patientId) {
    const checklist = latestVisitChecklist(state, patientId);
    return asArray(checklist && checklist.items).map((item) => {
      const sourceRefs = sourceRefsFor(item);
      const status = statusFromText(item.status, sourceRefs);
      return makeItem({
        id: `a6-checklist-${checklist.id}-${item.id}`,
        projectionId: `projection:visit-checklist:${checklist.id}:${item.id}`,
        recordId: `${checklist.id}:${item.id}`,
        category: categoryFromChecklistStatus(item.status),
        title: item.label || "Element przygotowania",
        description: status === "ready"
          ? "Element jest oznaczony jako przygotowany w danych demo."
          : "Element wymaga uzupełnienia albo potwierdzenia źródła przed rozmową.",
        status,
        requiredArea: areaForRefs(sourceRefs),
        sourceRefs,
        linkedSurfaces: linkedSurfacesFor("visit-checklist", `${checklist.id}:${item.id}`, sourceRefs, {
          inspector: `inspector:visit-checklist:${checklist.id}:${item.id}`,
          timelineFilm: "timeline:source-derived"
        }),
        origin: "visit_checklist"
      });
    });
  }

  function itemsFromA1Ready(a1Model) {
    return asArray(a1Model.feedCards)
      .filter((card) => card.type === "timeline_event" || card.type === "result_series")
      .filter((card) => sourceRefsFor(card).every((ref) => ref !== SOURCE_MISSING_REF))
      .map((card) => makeItem({
        id: `a6-ready-${card.id}`,
        projectionId: card.projectionId,
        recordId: card.recordId,
        category: "ready",
        title: card.title,
        description: card.type === "result_series"
          ? "Wynik jest podłączony jako źródło do pokazania podczas rozmowy."
          : "Zdarzenie ma źródło w historii pacjenta.",
        status: "ready",
        requiredArea: card.requiredArea,
        sourceRefs: card.sourceRefs,
        linkedSurfaces: card.linkedSurfaces,
        origin: "a1_ready"
      }));
  }

  function itemsFromQualityGaps(qualityModel) {
    const questionGapIds = new Set(asArray(qualityModel.questions).map((question) => question.gapId));
    return asArray(qualityModel.gaps)
      .filter((gap) => !questionGapIds.has(gap.id))
      .map((gap) => makeItem({
        id: `a6-gap-${gap.id}`.replace(/[^a-zA-Z0-9:_-]/g, "-"),
        projectionId: gap.projectionId,
        recordId: gap.recordId,
        category: gap.gapType === "source_missing" ? "to_bring" : "to_confirm",
        title: gap.label || gap.title || "Element do sprawdzenia",
        description: gap.description || "Element wymaga potwierdzenia przed rozmową.",
        status: gap.gapType === "source_missing" ? "missing" : "confirm",
        requiredArea: gap.requiredArea,
        sourceRefs: gap.sourceRefs,
        linkedSurfaces: gap.linkedSurfaces,
        origin: "a3_gap"
      }));
  }

  function applyItemGate(items, context) {
    const allowed = [];
    const blocked = [];
    items.forEach((item) => {
      const result = safeChecklistItem(item, context);
      if (result.allowed) allowed.push(result.item);
      else blocked.push({ ...item, errors: result.errors });
    });
    return { allowed, blocked };
  }

  function categorySummary(items, role) {
    return CATEGORIES.map((category) => {
      const categoryItems = items.filter((item) => item.category === category);
      return {
        category,
        label: CATEGORY_LABELS[category]?.[role] || CATEGORY_LABELS[category]?.patient || category,
        count: categoryItems.length,
        items: categoryItems
      };
    });
  }

  function sourceCoverage(items) {
    const refs = items.flatMap((item) => sourceRefsFor(item));
    return {
      checkedCount: refs.filter((ref) => ref !== SOURCE_MISSING_REF).length,
      sourceMissingCount: refs.filter((ref) => ref === SOURCE_MISSING_REF).length,
      missingCount: 0,
      missingRefs: []
    };
  }

  function projectVisitChecklist(input = {}) {
    if (!a1Core || !a3a5) {
      throw new Error("A6 checklist requires A1-Core and A3+A5 modules");
    }
    const { state, patientId, role, today, context, a1Model, qualityModel } = buildGuardedInputs(input);
    const patient = asArray(state.patients).find((item) => item.id === patientId) || null;
    const rawItems = [
      ...itemsFromQuestions(qualityModel),
      ...itemsFromQualityGaps(qualityModel),
      ...itemsFromChecklist(state, patientId),
      ...itemsFromA1Ready(a1Model)
    ];
    const deduped = dedupeItems(rawItems);
    const gate = applyItemGate(deduped, context);
    const items = sortItems(gate.allowed);
    return {
      id: `a6-checklist:${patientId}:${role}`,
      sprint: "A6",
      status: "read_only_visit_checklist",
      dataMode: "synthetic_demo_state",
      scale: "logistical_only",
      runtimeLlmEnabled: false,
      persistence: {
        indexedDbWrites: false,
        localStorageProfileWrites: false,
        networkWrites: false
      },
      patient,
      patientId,
      role,
      today,
      items,
      sections: categorySummary(items, role),
      blockedItems: context.zeroKnowledge ? [] : gate.blocked,
      dedupeSummary: {
        rawItems: rawItems.length,
        visibleItems: items.length,
        removedByDedupe: rawItems.length - deduped.length,
        blockedItems: context.zeroKnowledge ? 0 : gate.blocked.length
      },
      sourceCoverage: sourceCoverage(items),
      consentGuard: context.zeroKnowledge
        ? {
          id: context.id,
          zeroKnowledge: true,
          visibleCount: items.length,
          emptyCopy: context.emptyCopy || "Brak przypisanych elementow"
        }
        : null
    };
  }

  function validateProjection(model) {
    const errors = [];
    if (!model || typeof model !== "object") return { valid: false, errors: ["model.missing"] };
    if (model.runtimeLlmEnabled !== false) errors.push("runtimeLlm.enabled");
    if (model.persistence?.indexedDbWrites !== false) errors.push("persistence.indexedDbWrites.enabled");
    if (model.persistence?.localStorageProfileWrites !== false) errors.push("persistence.localStorageProfileWrites.enabled");
    if (model.persistence?.networkWrites !== false) errors.push("persistence.networkWrites.enabled");
    if (model.scale !== "logistical_only") errors.push("scale.invalid");
    if (!Array.isArray(model.items)) errors.push("items.notArray");
    asArray(model.items).forEach((item) => {
      if (!item.id) errors.push("item.id.missing");
      if (!item.projectionId) errors.push(`projectionId.missing:${item.id}`);
      if (!CATEGORIES.includes(item.category)) errors.push(`category.invalid:${item.id}:${item.category}`);
      if (!STATUSES.includes(item.status)) errors.push(`status.invalid:${item.id}:${item.status}`);
      if (!item.requiredArea) errors.push(`requiredArea.missing:${item.id}`);
      if (!sourceRefsFor(item).length) errors.push(`source.missing:${item.id}`);
      if (!item.linkedSurfaces || typeof item.linkedSurfaces !== "object") errors.push(`linkedSurfaces.missing:${item.id}`);
      copyErrors([item.title, item.description].filter(Boolean).join(" ")).forEach((error) => errors.push(`${item.id}.${error}`));
    });
    const ids = new Set();
    asArray(model.items).forEach((item) => {
      if (ids.has(item.id)) errors.push(`item.id.duplicate:${item.id}`);
      ids.add(item.id);
    });
    if (model.role === "caregiver") {
      if (asArray(model.blockedItems).length) errors.push("zeroKnowledge.blockedItems.visible");
      if (model.consentGuard && Object.prototype.hasOwnProperty.call(model.consentGuard, "hiddenCount")) errors.push("zeroKnowledge.hiddenCount.exposed");
    }
    if (model.sourceCoverage?.missingCount) errors.push(`sourceCoverage.missing:${model.sourceCoverage.missingRefs.join(",")}`);
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    SOURCE_MISSING_REF,
    CATEGORIES,
    STATUSES,
    CATEGORY_LABELS,
    FORBIDDEN_COPY_PATTERNS,
    projectVisitChecklist,
    safeChecklistItem,
    validateProjection,
    _private: Object.freeze({
      asArray,
      unique,
      normalize,
      areaForSourceRef,
      areaForRefs,
      statusFromText,
      categoryFromChecklistStatus,
      dedupeItems,
      latestVisitChecklist,
      copyErrors
    })
  });
});
