(function initPatient360CaregiverModel(root, factory) {
  const contract =
    root.Patient360Contract ||
    (typeof require === "function" ? require("./patient360-contract.js") : null);
  const caregiverModel = factory(contract);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = caregiverModel;
  }
  root.Patient360CaregiverModel = caregiverModel;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360CaregiverModel(contract) {
  const SOURCE_MISSING_REF = contract?.SOURCE_MISSING_REF || "source_missing";

  const CAREGIVER_AREAS = Object.freeze([
    { key: "medications", label: "Leki", icon: "pill" },
    { key: "visits", label: "Wizyty", icon: "calendar-check" },
    { key: "documents", label: "Dokumenty", icon: "files" },
    { key: "results", label: "Wyniki", icon: "activity" },
    { key: "observations", label: "Obserwacje", icon: "messages-square" },
    { key: "report", label: "Raport", icon: "clipboard-list" },
    { key: "tasks", label: "Zadania", icon: "list-checks" }
  ]);

  const CAREGIVER_ROLES = Object.freeze([
    "pacjent",
    "rodzic",
    "opiekun prawny",
    "osoba wspierająca",
    "rodzina",
    // wartości historyczne - zachowane dla kompatybilności zapisanych zgód;
    // człowiek w kręgu opieki ma relację i zakres dostępu, agent jest funkcją systemu
    "opiekun lekowy",
    "opiekun wizyt"
  ]);

  // Legacy role -> neutralny język człowieka z zakresem; nowe zgody używają relacji + obszarów
  const ROLE_DISPLAY = Object.freeze({
    "opiekun lekowy": "osoba wspierająca · obszar: leki",
    "opiekun wizyt": "osoba wspierająca · obszar: wizyty"
  });

  function displayRole(role) {
    const key = String(role || "").toLowerCase();
    return ROLE_DISPLAY[key] || role || "osoba wspierająca";
  }

  const FORBIDDEN_CAREGIVER_PHRASES = Object.freeze([
    "pilnie",
    "natychmiast",
    "zalecamy",
    "rekomendujemy",
    "diagnoza",
    "triage",
    "terapia",
    "odstaw",
    "zmień dawkę",
    "nie wymaga konsultacji"
  ]);

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function pluralPl(count, one, few, many) {
    const absolute = Math.abs(Number(count) || 0);
    const mod10 = absolute % 10;
    const mod100 = absolute % 100;
    if (absolute === 1) return one;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
    return many;
  }

  function formatCount(count, one, few, many) {
    const value = Number(count) || 0;
    return `${value} ${pluralPl(value, one, few, many)}`;
  }

  function byPatient(collection, patientId) {
    return (Array.isArray(collection) ? collection : []).filter((item) => item.patientId === patientId);
  }

  function normalizeSourceRefs(refs) {
    if (Array.isArray(refs)) return refs.filter(Boolean);
    return [refs].filter(Boolean);
  }

  function inferAreasFromScope(scope = "") {
    const text = normalize(scope);
    const areas = new Set();
    if (text.includes("lek")) areas.add("medications");
    if (text.includes("wizyt") || text.includes("procedur") || text.includes("kontrol") || text.includes("checklist")) areas.add("visits");
    if (text.includes("dokument") || text.includes("źród") || text.includes("zrodl")) areas.add("documents");
    if (text.includes("wynik")) areas.add("results");
    if (text.includes("wywiad") || text.includes("obserw")) areas.add("observations");
    if (text.includes("raport")) areas.add("report");
    if (text.includes("zad") || text.includes("przypom")) areas.add("tasks");
    return [...areas];
  }

  function normalizeAreas(consent = {}) {
    const allowed = new Set();
    (Array.isArray(consent.areas) ? consent.areas : inferAreasFromScope(consent.scope)).forEach((area) => {
      if (CAREGIVER_AREAS.some((definition) => definition.key === area)) allowed.add(area);
    });
    return [...allowed];
  }

  function supportRole(consent = {}) {
    const role = normalize(consent.role || "");
    if (role === "pacjent") return "pacjent";
    if (CAREGIVER_ROLES.includes(role)) return role;
    const scope = normalize(consent.scope || "");
    if (scope.includes("rodzin")) return "rodzina";
    return "osoba wspierająca";
  }

  function consentToScope(consent = {}) {
    return {
      id: consent.id,
      patientId: consent.patientId,
      caregiverId: consent.caregiverId || consent.id,
      caregiverName: consent.caregiverName || consent.subject || "Opiekun",
      subject: consent.subject || consent.caregiverName || "Opiekun",
      role: supportRole(consent),
      status: consent.status || "brak",
      validTo: consent.validTo || "",
      areas: normalizeAreas(consent),
      scope: consent.scope || "",
      sourceRefs: normalizeSourceRefs(consent.sourceRefs)
    };
  }

  function isActiveScope(scope) {
    return scope.status === "aktywny";
  }

  function activeAreaSet(scopes) {
    const areas = new Set();
    scopes.filter(isActiveScope).forEach((scope) => scope.areas.forEach((area) => areas.add(area)));
    return areas;
  }

  function visitChecklistItemState(item = {}) {
    const status = normalize(item.status);
    const refs = normalizeSourceRefs(item.sourceRefs);
    if (status.includes("gotowe") || item.done) return "ready";
    if (status.includes("brak") || refs.includes(SOURCE_MISSING_REF)) return "missing";
    return "confirm";
  }

  function medicationTasks(state, patientId, canView) {
    if (!canView.has("medications")) return [];
    return byPatient(state.medications, patientId)
      .filter((medication) => {
        const actual = normalize(medication.actualStatus);
        const status = normalize(medication.status);
        return actual.includes("niepotwierdzone") || status.includes("otc") || Boolean(medication.question);
      })
      .slice(0, 5)
      .map((medication) => ({
        id: `caretask-med-${medication.id}`,
        area: "medications",
        title: `Sprawdzić z pacjentem: ${medication.name}`,
        description: medication.question || "Potwierdzić, czy lek jest faktycznie przyjmowany i czy jest na liście do rozmowy z lekarzem.",
        status: normalize(medication.actualStatus).includes("niepotwierdzone") ? "do potwierdzenia" : "do sprawdzenia",
        sourceRefs: normalizeSourceRefs(medication.sourceRefs)
      }));
  }

  function visitTasks(state, patientId, canView) {
    if (!canView.has("visits")) return [];
    const checklist = byPatient(state.visitChecklists, patientId)
      .slice()
      .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))[0];
    if (!checklist) return [];
    return (checklist.items || [])
      .filter((item) => visitChecklistItemState(item) !== "ready")
      .map((item) => ({
        id: `caretask-visit-${item.id}`,
        area: "visits",
        title: `Przygotować przed wizytą: ${item.label}`,
        description: "Element checklisty wymaga uzupełnienia albo potwierdzenia źródła przed rozmową z lekarzem.",
        status: visitChecklistItemState(item) === "missing" ? "brak danych" : "do potwierdzenia",
        due: checklist.visitDate,
        sourceRefs: normalizeSourceRefs(item.sourceRefs)
      }));
  }

  function documentTasks(state, patientId, canView) {
    if (!canView.has("documents")) return [];
    return byPatient(state.documents, patientId)
      .filter((document) => normalize(document.status).includes("do potwierdzenia"))
      .slice(0, 3)
      .map((document) => ({
        id: `caretask-doc-${document.id}`,
        area: "documents",
        title: `Sprawdzić dokument: ${document.title}`,
        description: "Dokument ma status do potwierdzenia w danych demo.",
        status: "do potwierdzenia",
        due: document.eventDate || document.date,
        sourceRefs: [`doc:${document.id}`]
      }));
  }

  function visibleCounts(state, patientId, canView) {
    return {
      medications: canView.has("medications") ? byPatient(state.medications, patientId).length : 0,
      visits: canView.has("visits") ? byPatient(state.visitChecklists, patientId).length : 0,
      documents: canView.has("documents") ? byPatient(state.documents, patientId).length : 0,
      results: canView.has("results") ? byPatient(state.observations, patientId).length : 0,
      observations: canView.has("observations") ? byPatient(state.interviews, patientId).length : 0,
      report: canView.has("report") ? byPatient(state.reports, patientId).length : 0
    };
  }

  function accessCards(counts, canView) {
    return CAREGIVER_AREAS.filter((area) => area.key !== "tasks").map((area) => ({
      ...area,
      allowed: canView.has(area.key),
      count: counts[area.key] || 0,
      caption: canView.has(area.key)
        ? `${formatCount(counts[area.key] || 0, "element", "elementy", "elementów")} w zakresie zgody`
        : "Nie wczytano elementów w tym obszarze"
    }));
  }

  function buildCaregiverModel(input = {}) {
    const state = input.state || {};
    const patients = Array.isArray(state.patients) ? state.patients : [];
    const patientId = input.patientId || state.activePatientId || patients[0]?.id || "";
    const patient = patients.find((item) => item.id === patientId) || patients[0] || null;
    const scopes = byPatient(state.consents, patientId)
      .map(consentToScope)
      .filter((scope) => scope.role !== "pacjent" && !String(scope.caregiverId || "").startsWith("facility-"));
    const canView = activeAreaSet(scopes);
    const counts = visibleCounts(state, patientId, canView);
    const tasks = [
      ...medicationTasks(state, patientId, canView),
      ...visitTasks(state, patientId, canView),
      ...documentTasks(state, patientId, canView)
    ].filter((task) => task.sourceRefs.length);
    const activeScopes = scopes.filter(isActiveScope);
    const inactiveScopes = scopes.filter((scope) => !isActiveScope(scope));

    return {
      patient,
      patientId,
      scopes,
      activeScopes,
      inactiveScopes,
      activeAreas: [...canView],
      accessCards: accessCards(counts, canView),
      tasks,
      counts,
      safetyCopy: "Widok opiekuna pokazuje elementy udostępnione w aktualnym zakresie. Służy do organizacji wizyty; nie diagnozuje, nie ocenia pilności i nie tworzy zaleceń terapeutycznych.",
      revocationEffects: inactiveScopes.map((scope) => ({
        id: `revoked-${scope.id}`,
        subject: scope.subject,
        description: "Po cofnięciu lub wygaśnięciu zgody opiekun traci dostęp do tego zakresu, a raporty wymagają ponownego sprawdzenia zakresu udostępnienia."
      }))
    };
  }

  function validateCaregiverModel(model) {
    const errors = [];
    const warnings = [];
    if (!model || typeof model !== "object") return { valid: false, errors: ["Model is missing"], warnings };
    if (!model.patientId) errors.push("patientId is missing");
    if (!Array.isArray(model.scopes)) errors.push("scopes must be an array");
    if (!Array.isArray(model.accessCards) || model.accessCards.length !== CAREGIVER_AREAS.length - 1) errors.push("accessCards count mismatch");
    const activeAreas = new Set(model.activeAreas || []);
    (model.tasks || []).forEach((task) => {
      if (!task.id || !task.area || !task.title) errors.push(`invalid task: ${task.id || "(missing id)"}`);
      if (!activeAreas.has(task.area) && !(task.area === "visits" && activeAreas.has("tasks"))) errors.push(`task outside active consent scope: ${task.id}`);
      if (!normalizeSourceRefs(task.sourceRefs).length) errors.push(`task without sourceRefs: ${task.id}`);
    });
    (model.scopes || []).forEach((scope) => {
      if (!scope.id) errors.push("scope id is missing");
      if (!CAREGIVER_ROLES.includes(scope.role)) warnings.push(`unknown caregiver role: ${scope.role}`);
      (scope.areas || []).forEach((area) => {
        if (!CAREGIVER_AREAS.some((definition) => definition.key === area)) errors.push(`unknown caregiver area: ${area}`);
      });
    });
    const texts = [
      model.safetyCopy,
      ...(model.tasks || []).flatMap((task) => [task.title, task.description, task.status]),
      ...(model.accessCards || []).flatMap((card) => [card.label, card.caption]),
      ...(model.revocationEffects || []).map((effect) => effect.description)
    ].join(" ");
    FORBIDDEN_CAREGIVER_PHRASES.forEach((phrase) => {
      if (normalize(texts).includes(normalize(phrase))) errors.push(`forbidden caregiver phrase: ${phrase}`);
    });
    return { valid: errors.length === 0, errors, warnings };
  }

  return Object.freeze({
    CAREGIVER_AREAS,
    CAREGIVER_ROLES,
    ROLE_DISPLAY,
    FORBIDDEN_CAREGIVER_PHRASES,
    buildCaregiverModel,
    validateCaregiverModel,
    normalizeAreas,
    consentToScope,
    displayRole
  });
});
