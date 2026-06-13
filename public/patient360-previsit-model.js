(function initPatient360PreVisitModel(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const format =
    root.Patient360Format ||
    (typeof require === "function" ? require("./patient360-format.js") : null);
  const preVisitModel = factory(contract, format);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = preVisitModel;
  }
  root.Patient360PreVisitModel = preVisitModel;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360PreVisitModel(contract, format) {
  const SOURCE_MISSING_REF = contract?.SOURCE_MISSING_REF || "source_missing";
  const formatCount =
    format?.formatCount ||
    function fallbackFormatCount(count, one, few, many) {
      const absolute = Math.abs(Number(count) || 0);
      const mod10 = absolute % 10;
      const mod100 = absolute % 100;
      const noun = absolute === 1
        ? one
        : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
          ? few
          : many;
      return `${Number(count) || 0} ${noun}`;
    };
  const formatDocuments = format?.formatDocuments || ((count) => formatCount(count, "dokument", "dokumenty", "dokumentów"));
  const formatQuestions = format?.formatQuestions || ((count) => formatCount(count, "pytanie", "pytania", "pytań"));
  const formatGaps = format?.formatGaps || ((count) => formatCount(count, "brak", "braki", "braków"));

  const STEP_DEFINITIONS = Object.freeze([
    { kind: "documents", title: "Dokumenty", icon: "files", action: "Dodaj dokument", openDialog: "document" },
    { kind: "medications", title: "Leki", icon: "pill", action: "Sprawdź leki", view: "medications" },
    { kind: "interview", title: "Wywiad", icon: "messages-square", action: "Dodaj wywiad", openDialog: "interview" },
    { kind: "questions", title: "Pytania", icon: "message-circle-question", action: "Zapisz pytania", openDialog: "interview" },
    { kind: "gaps", title: "Braki", icon: "search-x", action: "Zobacz braki", view: "interview" },
    { kind: "sharing", title: "Zgody", icon: "shield-check", action: "Sprawdź zgody", view: "consent" }
  ]);

  const FORBIDDEN_PREVISIT_PHRASES = Object.freeze([
    "pilnie",
    "natychmiast",
    "zalecamy",
    "rekomendujemy",
    "diagnoza",
    "triage",
    "odstaw",
    "zmień dawkę",
    "nie wymaga konsultacji"
  ]);

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function byPatient(collection, patientId) {
    return (Array.isArray(collection) ? collection : []).filter((item) => item.patientId === patientId);
  }

  function matchesSearchValue(item, query) {
    const safeQuery = normalize(query).trim();
    if (!safeQuery) return true;
    return normalize(JSON.stringify(item)).includes(safeQuery);
  }

  function normalizeSourceRefs(refs) {
    if (Array.isArray(refs)) return refs.filter(Boolean);
    return [refs].filter(Boolean);
  }

  function activeVisitChecklist(state, patientId) {
    return byPatient(state.visitChecklists, patientId)
      .slice()
      .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))[0] || null;
  }

  function visitChecklistItemState(item = {}) {
    const normalized = normalize(item.status || (item.done ? "gotowe" : ""));
    const refs = normalizeSourceRefs(item.sourceRefs);
    if (item.done || normalized.includes("gotowe") || normalized.includes("wyjaśn") || normalized.includes("potwierdzone")) {
      return {
        key: "ready",
        label: "Gotowe",
        description: "Element jest oznaczony jako przygotowany w danych demo.",
        icon: "check-circle-2"
      };
    }
    if (normalized.includes("brak") || refs.includes(SOURCE_MISSING_REF)) {
      return {
        key: "missing",
        label: "Brak danych",
        description: "Brakuje danych albo źródła. To jest element do uzupełnienia lub omówienia.",
        icon: "circle-help"
      };
    }
    return {
      key: "confirm",
      label: "Do potwierdzenia",
      description: "Element wymaga potwierdzenia źródła, pacjenta, opiekuna albo lekarza.",
      icon: "alert-circle"
    };
  }

  function visitChecklistSummary(checklist) {
    const items = checklist?.items || [];
    const initial = { total: items.length, ready: 0, missing: 0, confirm: 0 };
    const counts = items.reduce((summary, item) => {
      const state = visitChecklistItemState(item);
      summary[state.key] += 1;
      return summary;
    }, initial);
    const readyPercent = counts.total ? Math.round((counts.ready / counts.total) * 100) : 0;
    const status = !counts.total
      ? { key: "empty", label: "Zacznij od danych", icon: "list-plus", className: "info" }
      : counts.missing
        ? { key: "missing", label: "Braki do uzupełnienia", icon: "circle-help", className: "pending" }
        : counts.confirm
          ? { key: "confirm", label: "Do potwierdzenia", icon: "alert-circle", className: "pending" }
          : { key: "ready", label: "Gotowe do rozmowy", icon: "check-circle-2", className: "done" };
    return { ...counts, readyPercent, status };
  }

  function patientPortalQuestions(state, patientId, decision) {
    const decisionQuestions = (decision?.ditlQuestions || []).map((question) => ({
      question: question.question,
      status: question.status,
      sourceRefs: question.sourceRefs || decision.sourceRefs || []
    }));
    const flagQuestions = byPatient(state.flags, patientId)
      .filter((flag) => flag.status !== "wyjaśnione" && flag.status !== "odrzucone")
      .map((flag) => ({
        question: flag.question,
        status: flag.status,
        sourceRefs: flag.sourceRefs || []
      }));
    return [...decisionQuestions, ...flagQuestions];
  }

  function preVisitStepState(kind, payload = {}) {
    if (kind === "documents") {
      return payload.docs.length
        ? { key: "ready", label: formatDocuments(payload.docs.length), caption: "źródła są w historii demo" }
        : { key: "missing", label: "Brak dokumentów", caption: "zacznij od dodania dokumentu demo" };
    }
    if (kind === "medications") {
      const uncertain = payload.meds.filter((med) =>
        normalize(med.actualStatus).includes("niepotwierd") || normalize(med.actualStatus).includes("deklarow")
      );
      if (!payload.meds.length) return { key: "missing", label: "Brak listy leków", caption: "dodaj listę leków z dokumentu lub wywiadu" };
      return uncertain.length
        ? { key: "confirm", label: `${uncertain.length} do potwierdzenia`, caption: "realne przyjmowanie wymaga sprawdzenia" }
        : { key: "ready", label: formatCount(payload.meds.length, "lek", "leki", "leków"), caption: "lista ma źródła w demo" };
    }
    if (kind === "interview") {
      return payload.interviews.length
        ? { key: "ready", label: "Wywiad dodany", caption: "relacja pacjenta/opiekuna jest źródłem" }
        : { key: "missing", label: "Brak wywiadu", caption: "dodaj rozmowę lub transkrypcję demo" };
    }
    if (kind === "questions") {
      return payload.patientQuestions.length
        ? { key: "ready", label: formatQuestions(payload.patientQuestions.length), caption: "do omówienia podczas wizyty" }
        : { key: "missing", label: "Brak pytań", caption: "zapisz pytania przed rozmową" };
    }
    if (kind === "gaps") {
      return payload.gaps.length
        ? { key: "confirm", label: formatGaps(payload.gaps.length), caption: "znane, nieznane i do weryfikacji" }
        : { key: "ready", label: "Braki uporządkowane", caption: "brak luk w danych demo" };
    }
    if (kind === "sharing") {
      return payload.consents.length
        ? { key: "ready", label: formatCount(payload.consents.length, "zgoda", "zgody", "zgód"), caption: "sprawdź, kto ma dostęp do danych" }
        : { key: "confirm", label: "Brak aktywnych zgód", caption: "pacjent decyduje, komu udostępnia dane" };
    }
    const summary = visitChecklistSummary(payload.checklist);
    return summary.status.key === "ready"
      ? { key: "ready", label: "Przygotowanie gotowe", caption: "dane są uporządkowane przed rozmową" }
      : { key: "confirm", label: "Sprawdź przygotowanie", caption: "najpierw sprawdź braki i potwierdzenia" };
  }

  function buildPreVisitModel(input = {}) {
    const state = input.state || {};
    const patients = Array.isArray(state.patients) ? state.patients : [];
    const patientId = input.patientId || state.activePatientId || patients[0]?.id || "";
    const searchQuery = input.searchQuery ?? input.search ?? "";
    const patient = patients.find((item) => item.id === patientId) || patients[0] || null;
    const docs = byPatient(state.documents, patientId).filter((item) => matchesSearchValue(item, searchQuery)).sort((a, b) => new Date(b.date) - new Date(a.date));
    const meds = byPatient(state.medications, patientId).filter((item) => matchesSearchValue(item, searchQuery));
    const interviews = byPatient(state.interviews, patientId).filter((item) => matchesSearchValue(item, searchQuery));
    const gaps = byPatient(state.knownUnknowns, patientId).filter((item) => item.category === "Unknown" || item.category === "To verify");
    const consents = byPatient(state.consents, patientId);
    const decisions = byPatient(state.decisionContexts, patientId).slice().sort((a, b) => new Date(b.contactDate) - new Date(a.contactDate));
    const decision = decisions[0] || null;
    const patientQuestions = patientPortalQuestions(state, patientId, decision);
    const checklist = activeVisitChecklist(state, patientId);
    const checklistSummary = visitChecklistSummary(checklist);
    const payload = { docs, meds, interviews, patientQuestions, gaps, consents, checklist };
    const steps = STEP_DEFINITIONS.map((step) => ({ ...step, state: preVisitStepState(step.kind, payload) }));
    const checklistItems = (checklist?.items || []).map((item) => ({
      ...item,
      state: visitChecklistItemState(item),
      sourceRefs: normalizeSourceRefs(item.sourceRefs)
    }));

    return {
      patient,
      patientId,
      searchQuery,
      docs,
      meds,
      interviews,
      gaps,
      consents,
      decisions,
      decision,
      patientQuestions,
      checklist,
      checklistItems,
      checklistSummary,
      steps,
      safetyCopy: "Ten widok porządkuje dane przed rozmową z lekarzem: dokumenty, leki, wywiad, pytania, braki i zgody. Nie ocenia pilności, nie diagnozuje i nie tworzy zaleceń terapeutycznych.",
      emptyState: {
        hasAnyData: Boolean(docs.length || meds.length || interviews.length || patientQuestions.length || gaps.length || checklistItems.length),
        message: "Zacznij od dokumentu, wywiadu albo listy pytań."
      }
    };
  }

  function validatePreVisitModel(model) {
    const errors = [];
    const warnings = [];
    if (!model || typeof model !== "object") return { valid: false, errors: ["Model is missing"], warnings };
    if (!model.patientId) errors.push("patientId is missing");
    if (!Array.isArray(model.steps) || model.steps.length !== STEP_DEFINITIONS.length) errors.push("steps count mismatch");
    if (!model.checklistSummary) errors.push("checklistSummary is missing");
    (model.steps || []).forEach((step) => {
      if (!step.kind || !step.state?.key) errors.push(`invalid step: ${step.kind || "(missing kind)"}`);
      if (!["ready", "missing", "confirm"].includes(step.state?.key)) errors.push(`invalid step state for ${step.kind}: ${step.state?.key}`);
    });
    (model.checklistItems || []).forEach((item) => {
      if (!item.id) errors.push("checklist item id is missing");
      if (!item.state?.key) errors.push(`checklist item state is missing: ${item.id || "(missing id)"}`);
      if (!normalizeSourceRefs(item.sourceRefs).length) warnings.push(`checklist item without sourceRefs: ${item.id}`);
    });
    const texts = [
      model.safetyCopy,
      ...(model.steps || []).flatMap((step) => [step.state?.label, step.state?.caption]),
      ...(model.checklistItems || []).flatMap((item) => [item.state?.label, item.state?.description])
    ].join(" ");
    FORBIDDEN_PREVISIT_PHRASES.forEach((phrase) => {
      if (normalize(texts).includes(normalize(phrase))) errors.push(`forbidden pre-visit phrase: ${phrase}`);
    });
    return { valid: errors.length === 0, errors, warnings };
  }

  return Object.freeze({
    STEP_DEFINITIONS,
    FORBIDDEN_PREVISIT_PHRASES,
    buildPreVisitModel,
    validatePreVisitModel,
    visitChecklistItemState,
    visitChecklistSummary,
    preVisitStepState,
    patientPortalQuestions
  });
});
