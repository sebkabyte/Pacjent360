const STORAGE_KEY = "pacjent360-state-v11";
const PATIENT360_CONTRACT = globalThis.Patient360Contract;
if (!PATIENT360_CONTRACT) {
  throw new Error("Missing patient360-contract.js");
}
const PATIENT360_FORMAT = globalThis.Patient360Format;
if (!PATIENT360_FORMAT) {
  throw new Error("Missing patient360-format.js");
}
const PATIENT360_MAP_MODEL = globalThis.Patient360MapModel;
if (!PATIENT360_MAP_MODEL) {
  throw new Error("Missing patient360-map-model.js");
}
const PATIENT360_MAP_VIEW = globalThis.Patient360MapView;
if (!PATIENT360_MAP_VIEW) {
  throw new Error("Missing patient360-map-view.js");
}
const PATIENT360_PREVISIT_MODEL = globalThis.Patient360PreVisitModel;
if (!PATIENT360_PREVISIT_MODEL) {
  throw new Error("Missing patient360-previsit-model.js");
}
const PATIENT360_CAREGIVER_MODEL = globalThis.Patient360CaregiverModel;
if (!PATIENT360_CAREGIVER_MODEL) {
  throw new Error("Missing patient360-caregiver-model.js");
}
const PATIENT360_CONSENT_MODEL = globalThis.Patient360ConsentModel;
if (!PATIENT360_CONSENT_MODEL) {
  throw new Error("Missing patient360-consent-model.js");
}
const PATIENT360_DEMO_DATA = globalThis.Patient360DemoData;
if (!PATIENT360_DEMO_DATA) {
  throw new Error("Missing patient360-demo-data.js");
}
const DATA_SCHEMA_VERSION = PATIENT360_CONTRACT.DATA_SCHEMA_VERSION;
const DATA_CONTRACT_VERSION = PATIENT360_CONTRACT.DATA_CONTRACT_VERSION;
const SOURCE_MISSING_REF = PATIENT360_CONTRACT.SOURCE_MISSING_REF;
const DEMO_WATERMARK_TEXT = "PROTOTYP KONCEPCYJNY — DANE FIKCYJNE — NIE UŻYWAĆ Z REALNYMI DANYMI PACJENTA";
const DEMO_FORM_WARNING =
  "Formularz służy wyłącznie do fikcyjnych danych demo. Nie wpisuj realnych danych pacjenta, danych identyfikujących ani treści z dokumentacji medycznej.";
const DEMO_EXPORT_WARNING =
  "Eksport JSON pobiera dane aktywnego pacjenta z lokalnego demo. Kontynuuj tylko dla fikcyjnych danych demonstracyjnych.";
const DEMO_PRINT_WARNING =
  "Wydruk jest przeznaczony wyłącznie do publicznego demo i nie może zawierać realnych danych pacjenta.";
const DITL_STATUS_NOTICE =
  "Status w demo jest tylko lokalnym oznaczeniem. W prawdziwym systemie taka zmiana wymagałaby uzasadnienia, autora i śladu audytu.";
const REPORT_DEMO_WATERMARK = "FIKCYJNA SOCZEWKA DEMO / DANE PACJENTA DEMO";
const PATIENT_SCOPED_COLLECTION_KEYS = [
  "decisionContexts",
  "documents",
  "interviews",
  "roleNarratives",
  "roleGoals",
  "roleVisibleSections",
  "timelineEvents",
  "timelineEpisodes",
  "timelineRelations",
  "stageSummaries",
  "conditions",
  "medications",
  "allergies",
  "observations",
  "flags",
  "knownUnknowns",
  "visitChecklists",
  "reports",
  "consents",
  "careContracts",
  "audit"
];

const VIEW_REGISTER = Object.freeze({
  roleStart: "app",
  core: "doctor",
  interview: "doctor",
  documents: "doctor",
  timeline: "doctor",
  medications: "doctor",
  observations: "doctor",
  risks: "doctor",
  reports: "doctor",
  patientPortal: "patient",
  caregiverPortal: "caregiver",
  consent: "caregiver",
  audit: "caregiver"
});

const ROLE_ORDER = ["doctor", "patient", "caregiver"];
const ROLE_META = Object.freeze({
  doctor: {
    label: "Lekarz360",
    icon: "stethoscope",
    view: "core",
    promise: "Mam 90 sekund, żeby zobaczyć, co trzeba wyjaśnić.",
    cta: "Wejdź do Lekarz360"
  },
  patient: {
    label: "Pacjent360",
    icon: "user-round",
    view: "patientPortal",
    promise: "Chcę wiedzieć, co przygotować i co dalej.",
    cta: "Wejdź do Pacjent360"
  },
  caregiver: {
    label: "Opiekun360",
    icon: "users-round",
    view: "caregiverPortal",
    promise: "Chcę pomóc bliskiej osobie w lekach, dokumentach i wizytach.",
    cta: "Wejdź do Opiekun360"
  }
});

const VIEW_ROLE_HINT = Object.freeze({
  core: "doctor",
  patientPortal: "patient",
  caregiverPortal: "caregiver"
});

const ROLE_VIEW_ACCESS = Object.freeze({
  doctor: new Set(["roleStart", "core", "interview", "documents", "timeline", "medications", "observations", "risks", "reports", "consent"]),
  patient: new Set(["roleStart", "patientPortal", "interview", "documents", "timeline", "medications", "observations", "consent"]),
  caregiver: new Set(["roleStart", "caregiverPortal", "interview", "documents", "timeline", "medications", "observations", "consent"])
});

const ROLE_HOME_VIEW = Object.freeze({
  doctor: "core",
  patient: "patientPortal",
  caregiver: "caregiverPortal"
});

const DEMO_JOURNEY_STEPS = Object.freeze([
  { id: "role", label: "Perspektywa", caption: "czyj widok" },
  { id: "scenario", label: "Scenariusz", caption: "który pacjent" },
  { id: "cockpit", label: "Kokpit", caption: "co teraz" },
  { id: "map", label: "Oś historii", caption: "skrót historii" },
  { id: "data", label: "Dane / źródła", caption: "skąd to wiemy" },
  { id: "summary", label: "Podsumowanie", caption: "co zabrać dalej" }
]);

const VIEW_JOURNEY_STAGE = Object.freeze({
  core: "cockpit",
  patientPortal: "cockpit",
  caregiverPortal: "cockpit",
  timeline: "map",
  interview: "data",
  documents: "data",
  medications: "data",
  observations: "data",
  risks: "data",
  consent: "data",
  reports: "summary",
  audit: "data"
});

const ROLE_DATA_VISIBILITY = Object.freeze({
  doctor: [
    ["interview", "Wywiad", "messages-square", "pacjent, rodzina lub opiekun jako źródło rozmowy"],
    ["documents", "Dokumenty", "files", "wypisy, skierowania i źródła"],
    ["timeline", "Oś historii", "git-branch", "skrót historii, źródła i pytania"],
    ["medications", "Leki", "pill", "przepisane vs faktycznie przyjmowane"],
    ["observations", "Wyniki", "activity", "wartości i zakresy ze źródła"],
    ["risks", "Pytania DITL", "shield-alert", "pytania i luki do wyjaśnienia"],
    ["reports", "Podsumowanie kontekstu", "clipboard-list", "co wiadomo, czego brakuje i co potwierdzić"],
    ["consent", "Zgody", "shield-check", "kto widzi dane i dlaczego"]
  ],
  patient: [
    ["documents", "Moje dokumenty", "files", "wypisy, skierowania, wyniki PDF"],
    ["timeline", "Oś historii", "git-branch", "wizyty i zdarzenia w jednej historii"],
    ["interview", "Opis wywiadu", "messages-square", "rozmowa i pytania do omówienia"],
    ["medications", "Moje leki", "pill", "lista z dokumentów i wywiadu"],
    ["observations", "Moje wyniki", "activity", "badania i zakresy ze źródła"],
    ["consent", "Zgody", "shield-check", "komu udostępniam dane"]
  ],
  caregiver: [
    ["caregiverPortal", "Opiekun360", "users-round", "kto udostępnił opiekę i nad kim ją sprawuję"],
    ["documents", "Dokumenty", "files", "widoczne w zakresie zgody"],
    ["timeline", "Oś historii", "git-branch", "historia osoby pod opieką"],
    ["interview", "Gotowy wywiad", "messages-square", "informacje z rozmowy i obserwacji"],
    ["medications", "Leki", "pill", "lista do organizacyjnego dopilnowania"],
    ["observations", "Wyniki", "activity", "badania widoczne w zgodzie"],
    ["consent", "Zakres zgody", "shield-check", "kto co widzi i do kiedy"]
  ]
});

const ROLE_SOURCE_VIEW = Object.freeze({
  doctor: "documents",
  patient: "documents",
  caregiver: "documents"
});

const ROLE_SUMMARY_VIEW = Object.freeze({
  doctor: "reports",
  patient: "patientPortal",
  caregiver: "caregiverPortal"
});

const LIBRARY_HEADING = "Dane i źródła";

const SIDEBAR_LIBRARY_LABELS = Object.freeze({
  interview: "Wywiad",
  documents: "Dokumenty",
  timeline: "Oś historii",
  medications: "Leki",
  observations: "Wyniki",
  risks: "Pytania",
  reports: "Podsumowanie",
  consent: "Zgody"
});

const CAREGIVER_VIEW_AREAS = Object.freeze({
  interview: ["observations", "report"],
  documents: ["documents"],
  timeline: ["documents", "results", "medications", "observations", "visits", "tasks", "report"],
  medications: ["medications"],
  observations: ["results", "observations"],
  consent: ["documents", "results", "medications", "observations", "visits", "tasks", "report"]
});

const TRACKS = PATIENT360_CONTRACT.TIMELINE_TRACKS;

const TIMELINE_PERIODS = [
  { id: "episode", label: "Epizod", description: "od pierwszego zdarzenia w danych do dziś" },
  { id: "year", label: "12 mies.", description: "ostatnie 12 miesięcy" },
  { id: "life", label: "Od urodzenia", description: "od daty urodzenia do chwili użycia narzędzia" }
];

const TIMELINE_DETAILS = [
  { id: "overview", label: "Ogół", description: "mapa orientacyjna" },
  { id: "standard", label: "Standard", description: "najważniejsze zdarzenia" },
  { id: "detail", label: "Szczegóły", description: "źródła, pewność i opis" }
];

const TIMELINE_ZOOM = {
  min: 0.4,
  max: 1.55,
  step: 0.1,
  fit: 0.42
};

const TIMELINE_STATUS_META = PATIENT360_CONTRACT.TIMELINE_STATUS_META;

const FLAG_META = PATIENT360_CONTRACT.FLAG_META;

const FLAG_COLOR_OPTIONS = Object.entries(FLAG_META).map(([value, meta]) => ({ value, label: meta.label }));

const DITL_STATUSES = PATIENT360_CONTRACT.DITL_STATUSES;
const CONTRACT_CLAIM_TYPES = PATIENT360_CONTRACT.CLAIM_TYPES;
const CONTRACT_SOURCE_TYPES = PATIENT360_CONTRACT.SOURCE_TYPES;
const SOURCE_REF_PREFIX_TO_TYPE = PATIENT360_CONTRACT.SOURCE_REF_PREFIX_TO_TYPE;
const CONTRACT_CLAIM_STATUSES = PATIENT360_CONTRACT.CLAIM_STATUSES;
const CONTRACT_RELATION_TYPES = PATIENT360_CONTRACT.RELATION_TYPES;
const CONTRACT_CONSENT_STATUSES = PATIENT360_CONTRACT.CONSENT_STATUSES;
const CONTRACT_AUDIT_ACTION_TYPES = PATIENT360_CONTRACT.AUDIT_ACTION_TYPES;
const CONTRACT_FORBIDDEN_CLAIM_PHRASES = PATIENT360_CONTRACT.FORBIDDEN_CLAIM_PHRASES;
const STATUS_MAP = {
  "do wyjaśnienia": { doctor: "do wyjaśnienia", patient: "Do omówienia", caregiver: "Do sprawdzenia" },
  "dalsza kontrola": { doctor: "dalsza kontrola", patient: "Do sprawdzenia przez lekarza", caregiver: "Czeka" },
  wyjaśnione: { doctor: "wyjaśnione", patient: "Gotowe", caregiver: "Zrobione" },
  odrzucone: { doctor: "odrzucone", patient: "Nieaktualne", caregiver: "Nieaktualne" },
  gotowe: { doctor: "gotowe", patient: "Gotowe", caregiver: "Zrobione" },
  brak: { doctor: "brak", patient: "Brak", caregiver: "Brak" },
  "do potwierdzenia": { doctor: "do potwierdzenia", patient: "Do potwierdzenia", caregiver: "Do sprawdzenia" }
};

function personaStatus(rawStatus, persona = "doctor") {
  const mapping = STATUS_MAP[rawStatus];
  return mapping ? mapping[persona] : rawStatus;
}

const INTERVIEW_SCRIPT = [
  {
    key: "baseline",
    title: "Stan przed chorobą",
    questions: [
      "Jak pacjent funkcjonował miesiąc temu i pół roku temu?",
      "Czy chodził sam, robił zakupy, gotował, prowadził samochód?",
      "Czy były upadki, chudnięcie, zaburzenia snu, omamy albo pogorszenie pamięci?"
    ]
  },
  {
    key: "current",
    title: "Aktualny problem",
    questions: [
      "Od kiedy problem trwa i co było pierwszym objawem?",
      "Czy przebieg jest nagły, stopniowy czy falujący?",
      "Co pogarsza, co poprawia i czy był nowy lek, uraz, infekcja albo zabieg?"
    ]
  },
  {
    key: "symptoms",
    title: "Objawy",
    questions: [
      "Czy jest ból, duszność, gorączka, omdlenie, krwawienie, uraz albo nagłe pogorszenie kontaktu?",
      "Czy pojawił się nowy objaw, który pacjent uznaje za nietypowy?",
      "Czy objawy są stałe, nasilają się, ustępują czy wracają falami?"
    ]
  },
  {
    key: "function",
    title: "Funkcjonowanie",
    questions: [
      "Czy pacjent je, pije, połyka i korzysta z toalety jak wcześniej?",
      "Czy zmienił się kontakt, orientacja, sen, chód lub ryzyko upadków?",
      "Czy w domu jest realne wsparcie i kto układa leki?"
    ]
  },
  {
    key: "medications",
    title: "Leki faktycznie brane",
    questions: [
      "Co pacjent faktycznie bierze, a czego nie bierze mimo recepty?",
      "Czy są OTC, suplementy albo leki doraźne niewidoczne w dokumentacji?",
      "Czy po zmianie leku pojawiło się krwawienie, zawroty, spadki ciśnienia, senność albo inny nowy objaw?"
    ]
  },
  {
    key: "family",
    title: "Informacje dodatkowe",
    questions: [
      "Co pacjent uważa za najważniejszą sprawę do omówienia?",
      "Czy pacjent rozumie cel wizyty, procedury albo kontroli?",
      "Czy w wypowiedziach pacjenta, dokumentach albo lekach są sprzeczności do potwierdzenia?"
    ]
  }
];

const REPORT_CASE_STUDIES = [
  {
    id: "procedure-readiness",
    label: "Fikcyjny kompozyt: gotowość do procedury",
    decision: "Czy przed zaplanowaną procedurą zebrano wszystkie pytania wymagające oceny lekarza?",
    lens: "Raport skupia się na gotowości do procedury bez opisywania konkretnej historii choroby: stan bazowy, aktualny problem, leki, braki danych i pytania DITL.",
    patientSnapshot: "Syntetyczny pacjent demonstracyjny przed procedurą lub konsultacją kwalifikującą.",
    keyChange: "Najważniejsze jest ustalenie, co zmieniło się względem stanu bazowego i czy ta zmiana ma znaczenie dla decyzji.",
    known: ["Jest określony cel kontaktu z lekarzem.", "Są co najmniej dwa źródła: dokumentacja i wywiad."],
    unknown: ["Nie wiadomo, czy wszystkie dane krytyczne dla tej decyzji są aktualne.", "Nie wiadomo, czy pacjent potwierdził najnowszy stan funkcjonalny."],
    uncertain: ["Część informacji może pochodzić z wywiadu i wymaga oznaczenia jako obserwacja, nie fakt medyczny."],
    verify: ["Czy lekarz oznaczył, które pytania DITL są wyjaśnione, a które wymagają dalszej kontroli?"],
    flags: [
      { color: "blue", title: "Cel kontaktu", question: "Czy cel dzisiejszego kontaktu z lekarzem jest jasno nazwany?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "amber", title: "Kompletność danych", question: "Czy brakuje danych krytycznych dla tej decyzji?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "green", title: "Źródła", question: "Czy każda teza w raporcie ma źródło?", sourceRefs: [SOURCE_MISSING_REF] }
    ],
    questions: [
      "Jaki dokładnie cel kontaktu ma zostać dziś omówiony?",
      "Które dane są znane, nieznane, niepewne albo do potwierdzenia?",
      "Czy lekarz potwierdził status każdego pytania DITL?"
    ]
  },
  {
    id: "specialist-consult",
    label: "Fikcyjny kompozyt: konsultacja specjalistyczna",
    decision: "Czy specjalista widzi pacjenta jako całość, a nie tylko przez pryzmat jednej dziedziny?",
    lens: "Raport pokazuje rdzeń pacjenta i kontekst pozaspecjalistyczny: funkcję, leki, trendy, wywiad i braki danych.",
    patientSnapshot: "Syntetyczny pacjent demonstracyjny kierowany na konsultację specjalistyczną.",
    keyChange: "Najważniejsze jest odróżnienie problemu dziedzinowego od problemu wieloczynnikowego.",
    known: ["Jest powód konsultacji.", "Są dane o części chorób, leków i wyników."],
    unknown: ["Nie wiadomo, czy specjalista ma pełny kontekst funkcjonalny, lekowy i dokumentacyjny."],
    uncertain: ["Objawy mogą wynikać z kilku nakładających się przyczyn i nie powinny być automatycznie przypisane jednej specjalizacji."],
    verify: ["Czy raport pokazuje kontekst pozaspecjalistyczny bez gotowej decyzji po stronie systemu?"],
    flags: [
      { color: "blue", title: "Soczewka specjalisty", question: "Czy raport pokazuje, co jest ważne dla tej specjalizacji?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "amber", title: "Kontekst całościowy", question: "Czy specjalista widzi też leki, funkcjonowanie i wywiad?", sourceRefs: [SOURCE_MISSING_REF] }
    ],
    questions: [
      "Czy objaw może mieć więcej niż jedną przyczynę?",
      "Czy lista leków i wywiad pacjenta zmieniają interpretację danych?",
      "Jakie dane są potrzebne specjaliście przed decyzją?"
    ]
  },
  {
    id: "acute-change",
    label: "Fikcyjny kompozyt: nagła zmiana stanu",
    decision: "Czy nowa zmiana zachowania, funkcji albo objawu została właściwie oznaczona jako pytanie do wyjaśnienia?",
    lens: "Raport rozdziela wypowiedź pacjenta, wynik, lek, dokument i pytanie DITL, żeby nie zamienić relacji w rozstrzygnięcie po stronie systemu.",
    patientSnapshot: "Syntetyczny pacjent demonstracyjny z nową zmianą zgłoszoną w wywiadzie.",
    keyChange: "Najważniejsza jest dynamika: kiedy zaczęła się zmiana, co ją poprzedziło i czy przebieg jest nagły, stopniowy czy falujący.",
    known: ["Jest obserwacja zmiany zgłoszona w wywiadzie.", "Można przypisać źródło informacji: pacjent, lekarz, dokument albo wynik."],
    unknown: ["Nie wiadomo, czy zmiana została oceniona w pełnym kontekście klinicznym."],
    uncertain: ["Związek czasowy z wydarzeniem lub lekiem nie oznacza przyczynowości."],
    verify: ["Czy lekarz oznaczył dalszy tryb wyjaśnienia tej zmiany?"],
    flags: [
      { color: "red", title: "Nowa zmiana", question: "Czy nowa zmiana stanu została potraktowana jako sygnał do wyjaśnienia?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "amber", title: "Niepewność przyczyn", question: "Czy przyczyna zmiany nie została założona zbyt wcześnie?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "blue", title: "Pytanie DITL", question: "Które pytania lekarz chce omówić w kontekście tej zmiany?", sourceRefs: [SOURCE_MISSING_REF] }
    ],
    questions: [
      "Kiedy dokładnie zaczęła się zmiana?",
      "Kto ją zaobserwował i jak wiarygodne jest źródło?",
      "Czy są dane, które przeczą lub potwierdzają tę obserwację?"
    ]
  },
  {
    id: "medication-reconciliation",
    label: "Fikcyjny kompozyt: uzgodnienie leków",
    decision: "Czy lista leków jest uzgodniona między dokumentacją, pacjentem i wywiadem?",
    lens: "Raport porównuje leki przepisane, faktycznie przyjmowane, doraźne, OTC/suplementy, odstawienia i objawy po zmianie.",
    patientSnapshot: "Syntetyczny pacjent demonstracyjny z niepewną lub złożoną historią lekową.",
    keyChange: "Najważniejsze jest ustalenie, co pacjent faktycznie bierze teraz, a nie tylko co widnieje w dokumentacji.",
    known: ["Są leki widoczne w dokumentacji.", "Wywiad może wskazać realne przyjmowanie lub pomijanie leków."],
    unknown: ["Brak pełnej listy leków doraźnych, OTC i suplementów."],
    uncertain: ["Objaw zgłoszony po zmianie leku wymaga omówienia bez zakładania przyczyny; związek czasowy nie oznacza przyczynowości."],
    verify: ["Czy lekarz lub farmaceuta oznaczył listę leków jako uzgodnioną?"],
    flags: [
      { color: "amber", title: "Rozbieżność lekowa", question: "Czy dokumentacja zgadza się z realnym przyjmowaniem leków?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "blue", title: "OTC i suplementy", question: "Czy zapytano o leki niewidoczne w dokumentacji?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "green", title: "Uzgodnienie", question: "Czy można oznaczyć listę leków jako potwierdzoną?", sourceRefs: [SOURCE_MISSING_REF] }
    ],
    questions: [
      "Kto układa leki i jak są podawane?",
      "Czego pacjent nie bierze mimo recepty?",
      "Czy po zmianie leku pojawił się nowy objaw?"
    ]
  },
  {
    id: "care-transition",
    label: "Fikcyjny kompozyt: przejście opieki",
    decision: "Czy po zmianie miejsca opieki pacjent ma jasny plan kontroli, źródła i odpowiedzialności?",
    lens: "Raport skupia się na ciągłości: co zapisano w planie z poprzedniego etapu, co wykonano, czego brakuje i kto kontroluje następny krok.",
    patientSnapshot: "Syntetyczny pacjent demonstracyjny po przejściu między oddziałem, poradnią, domem lub innym etapem opieki.",
    keyChange: "Najważniejsze jest połączenie dokumentacji z tym, co realnie wydarzyło się po kontakcie medycznym.",
    known: ["Jest dokument podsumowujący poprzedni etap opieki.", "Można zebrać obserwacje pacjenta po powrocie do domu lub po wizycie."],
    unknown: ["Nie wiadomo, czy plan z poprzedniego etapu został zrozumiany i wykonany."],
    uncertain: ["Poprawa jednego parametru nie musi oznaczać poprawy całościowego stanu pacjenta."],
    verify: ["Czy pacjent ma zapisany plan kontroli i ścieżkę kontaktu wskazaną przez lekarza?"],
    flags: [
      { color: "green", title: "Plan kontroli", question: "Czy plan kontroli jest zapisany i zrozumiały?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "amber", title: "Luka po kontakcie", question: "Czy wiadomo, co wydarzyło się między dokumentem a dzisiejszym stanem?", sourceRefs: [SOURCE_MISSING_REF] },
      { color: "blue", title: "Odpowiedzialność", question: "Kto jest odpowiedzialny za następny krok?", sourceRefs: [SOURCE_MISSING_REF] }
    ],
    questions: [
      "Co zapisano w planie z poprzedniego etapu?",
      "Co faktycznie wykonano?",
      "Kto i kiedy ma sprawdzić brakujące dane?"
    ]
  }
];

const DIALOG_TYPES = new Set(["document", "decision", "interview", "medication", "observation", "flag", "consent"]);
const DEFAULT_CASE_STUDY_BY_PATIENT = {
  p1: "procedure-readiness",
  p2: "specialist-consult",
  p3: "acute-change"
};

function demoToday() {
  return PATIENT360_DEMO_DATA.localToday ? PATIENT360_DEMO_DATA.localToday() : new Date().toISOString().slice(0, 10);
}

const demoState = PATIENT360_DEMO_DATA.buildDemoState({ today: demoToday() });

let state = loadState();

const viewRoot = document.querySelector("#viewRoot");
const evidenceRoot = document.querySelector("#evidenceRoot");
const patientSelect = document.querySelector("#patientSelect");
const roleSwitcher = document.querySelector("#roleSwitcher");
const searchInput = document.querySelector("#searchInput");
const criticalStrip = document.querySelector("#criticalStrip");
const entryDialog = document.querySelector("#entryDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogFields = document.querySelector("#dialogFields");
const dialogForm = document.querySelector("#dialogForm");
const confirmDialog = document.querySelector("#confirmDialog");
const confirmTitle = document.querySelector("#confirmTitle");
const confirmBody = document.querySelector("#confirmBody");
const confirmAction = document.querySelector("#confirmAction");
const confirmSecondaryAction = document.querySelector("#confirmSecondaryAction");
let pendingConsentRevokeId = null;
let pendingConsentCreateDraft = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeStateWithDemoDefaults(loaded) {
  const merged = { ...clone(demoState), ...loaded };
  Object.entries(demoState).forEach(([key, defaultValue]) => {
    if (!Array.isArray(defaultValue)) return;
    const existingItems = Array.isArray(loaded[key]) ? loaded[key] : [];
    const byId = new Map(existingItems.map((item) => [item.id, item]));
    merged[key] = defaultValue.map((defaultItem) => {
      const existing = byId.get(defaultItem.id);
      if (!existing) return defaultItem;
      const item = { ...defaultItem, ...existing };
      if (key === "observations" && Array.isArray(defaultItem.values) && (!Array.isArray(existing.values) || existing.values.length < defaultItem.values.length)) {
        item.values = defaultItem.values;
      }
      if (key === "visitChecklists" && Array.isArray(defaultItem.items) && (!Array.isArray(existing.items) || existing.items.some((entry) => !Array.isArray(entry.sourceRefs)))) {
        item.items = defaultItem.items;
      }
      return item;
    });
    existingItems.forEach((item) => {
      if (!defaultValue.some((defaultItem) => defaultItem.id === item.id)) merged[key].push(item);
    });
  });
  return merged;
}

function replaceLegacyCopy(text) {
  return [
    ["wygenerowano " + "one" + "-pager decyzyjny", "wygenerowano raport kontekstowy"],
    ["one" + "-pager i indeks źródeł", "raport kontekstowy i indeks źródeł"],
    ["one" + "-pager decyzyjny", "raport kontekstowy"],
    ["One" + "-pager", "Raport"],
    ["one" + "-pager", "raport kontekstowy"],
    ["Raport " + "decyzyjny", "Raport kontekstowy"],
    ["raport " + "decyzyjny", "raport kontekstowy"],
    ["Niedokrwistość do " + "diagnostyki", "Hb do wyjaśnienia z lekarzem"],
    ["Czy dzisiejsza " + "decyzja medyczna jest jasno nazwana?", "Czy cel dzisiejszego kontaktu z lekarzem jest jasno nazwany?"],
    ["Jaka dokładnie " + "decyzja ma zostać dziś podjęta?", "Jaki dokładnie cel kontaktu ma zostać dziś omówiony?"]
  ].reduce((value, [from, to]) => value.split(from).join(to), text);
}

function sanitizeLegacyStateCopy(value) {
  if (typeof value === "string") return replaceLegacyCopy(value);
  if (Array.isArray(value)) return value.map(sanitizeLegacyStateCopy);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeLegacyStateCopy(entry)]));
}

function shouldStartDemoFresh() {
  try {
    return new URLSearchParams(globalThis.location?.search || "").get("start") === "1";
  } catch {
    return false;
  }
}

function freshDemoStartState() {
  const fresh = clone(demoState);
  fresh.activeView = "roleStart";
  fresh.activeRole = "doctor";
  fresh.roleSelectionConfirmed = false;
  fresh.selectedSourceRef = null;
  fresh.selectedTimelineEventId = null;
  fresh.search = "";
  return fresh;
}

function loadState() {
  try {
    if (shouldStartDemoFresh()) {
      const fresh = freshDemoStartState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    const loaded = sanitizeLegacyStateCopy(parsed && parsed.demoDate === demoState.demoDate ? mergeStateWithDemoDefaults(parsed) : clone(demoState));
    if (!REPORT_CASE_STUDIES.some((caseStudy) => caseStudy.id === loaded.activeCaseStudy)) {
      loaded.activeCaseStudy = REPORT_CASE_STUDIES[0].id;
    }
    if (!ROLE_META[loaded.activeRole]) {
      loaded.activeRole = "doctor";
    }
    loaded.roleSelectionConfirmed = Boolean(loaded.roleSelectionConfirmed);
    const renderableViews = new Set(["roleStart", "core", "patientPortal", "interview", "documents", "timeline", "medications", "observations", "risks", "reports", "caregiverPortal", "consent", "audit"]);
    if (!renderableViews.has(loaded.activeView)) {
      loaded.activeView = "roleStart";
    }
    if (loaded.activeView === "roleStart") {
      loaded.roleSelectionConfirmed = false;
    }
    if (!TIMELINE_PERIODS.some((period) => period.id === loaded.timelinePeriod)) {
      loaded.timelinePeriod = "episode";
    }
    if (!TIMELINE_DETAILS.some((detail) => detail.id === loaded.timelineDetail)) {
      loaded.timelineDetail = "standard";
    }
    if (loaded.timelineFilterTrack && !TRACKS.includes(loaded.timelineFilterTrack)) {
      loaded.timelineFilterTrack = null;
    }
    loaded.timelineZoom = normalizeTimelineZoom(loaded.timelineZoom);
    loaded.selectedTimelineEventId = validTimelineEventId(loaded.selectedTimelineEventId, loaded.activePatientId, loaded.timelineEvents)
      ? loaded.selectedTimelineEventId
      : null;
    if (stored && parsed?.demoDate === demoState.demoDate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    }
    return loaded;
  } catch {
    return clone(demoState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activePatient() {
  return state.patients.find((patient) => patient.id === state.activePatientId) || state.patients[0];
}

function patientDisplayName(patient = activePatient()) {
  return String(patient?.name || "Pacjent").split(" — ")[0];
}

function byPatient(collection) {
  return collection.filter((item) => item.patientId === state.activePatientId);
}

function activeDecision() {
  return byPatient(state.decisionContexts).sort((a, b) => new Date(b.contactDate) - new Date(a.contactDate))[0];
}

function activeCareContract() {
  return byPatient(state.careContracts || [])[0] || null;
}

function activeRole() {
  return ROLE_META[state.activeRole] ? state.activeRole : "doctor";
}

function activeRoleMeta(role = activeRole()) {
  return ROLE_META[role] || ROLE_META.doctor;
}

function viewForRole(role = activeRole()) {
  return activeRoleMeta(role).view;
}

function allowedViewsForRole(role = activeRole()) {
  return ROLE_VIEW_ACCESS[role] || ROLE_VIEW_ACCESS.doctor;
}

function canAccessViewForRole(view, role = activeRole()) {
  return allowedViewsForRole(role).has(view);
}

function fallbackViewForRole(role = activeRole()) {
  return ROLE_HOME_VIEW[role] || "core";
}

function switchActiveRole(role, view = null) {
  const nextRole = ROLE_META[role] ? role : "doctor";
  state.activeRole = nextRole;
  state.roleSelectionConfirmed = true;
  state.activeView = view || viewForRole(nextRole);
  state.selectedSourceRef = null;
  state.selectedTimelineEventId = null;
  state.search = "";
}

function activeRoleNarrative(role = activeRole(), patientId = state.activePatientId) {
  return (state.roleNarratives || []).find((item) => item.patientId === patientId && item.role === role) || null;
}

function activeRoleGoal(role = activeRole(), patientId = state.activePatientId) {
  return (state.roleGoals || []).find((item) => item.patientId === patientId && item.role === role) || null;
}

function activeRoleSections(role = activeRole(), patientId = state.activePatientId) {
  return (state.roleVisibleSections || []).find((item) => item.patientId === patientId && item.role === role)?.sections || [];
}

function roleDataVisibility(role = activeRole()) {
  return (ROLE_DATA_VISIBILITY[role] || ROLE_DATA_VISIBILITY.doctor)
    .filter(([view]) => canAccessViewForRole(view, role));
}

function activeCaregiverAreas() {
  if (activeRole() !== "caregiver") return new Set();
  const model = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  return new Set(model.activeAreas || []);
}

function caregiverModelForActivePatient() {
  return PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
}

function caregiverHasActiveScope() {
  return Boolean(caregiverModelForActivePatient().activeScopes.length);
}

function isCaregiverProtectedDataView(view) {
  return ["interview", "documents", "timeline", "medications", "observations"].includes(view);
}

function caregiverCannotOpenDataView(view, role = activeRole()) {
  return role === "caregiver" && isCaregiverProtectedDataView(view) && !caregiverHasActiveScope();
}

function canShowSidebarLibraryView(view, role = activeRole()) {
  if (!view || view === "roleStart" || VIEW_ROLE_HINT[view] || view === "audit") return false;
  if (!canAccessViewForRole(view, role)) return false;
  if (role !== "caregiver") return true;
  if (view === "consent") return true;
  const activeAreas = activeCaregiverAreas();
  if (!activeAreas.size) return false;
  const requiredAreas = CAREGIVER_VIEW_AREAS[view] || [];
  return requiredAreas.some((area) => activeAreas.has(area));
}

function sidebarLibraryItem(view, role = activeRole()) {
  return roleDataVisibility(role).find(([itemView]) => itemView === view) || null;
}

function journeyStageForView(view = state.activeView) {
  if (view === "roleStart") {
    return state.roleSelectionConfirmed ? "scenario" : "role";
  }
  return VIEW_JOURNEY_STAGE[view] || "cockpit";
}

function viewForJourneyStep(stepId, role = activeRole()) {
  if (stepId === "role" || stepId === "scenario") return "roleStart";
  if (stepId === "cockpit") return viewForRole(role);
  if (role === "caregiver" && !caregiverHasActiveScope() && ["map", "data", "summary"].includes(stepId)) {
    return "consent";
  }
  if (stepId === "map") return "timeline";
  if (stepId === "data") {
    const preferred = ROLE_SOURCE_VIEW[role] || "documents";
    return canAccessViewForRole(preferred, role) ? preferred : fallbackViewForRole(role);
  }
  if (stepId === "summary") {
    const preferred = ROLE_SUMMARY_VIEW[role] || fallbackViewForRole(role);
    return canAccessViewForRole(preferred, role) ? preferred : fallbackViewForRole(role);
  }
  return fallbackViewForRole(role);
}

function setJourneyStep(stepId) {
  if (stepId === "role") {
    state.activeView = "roleStart";
    state.roleSelectionConfirmed = false;
  } else if (stepId === "scenario") {
    state.activeView = "roleStart";
    state.roleSelectionConfirmed = true;
  } else {
    setActiveView(viewForJourneyStep(stepId));
  }
  state.selectedSourceRef = null;
  state.selectedTimelineEventId = null;
  state.search = "";
}

function journeyStepIndex(stepId = journeyStageForView()) {
  return Math.max(DEMO_JOURNEY_STEPS.findIndex((step) => step.id === stepId), 0);
}

function journeyStepByOffset(offset) {
  const nextIndex = journeyStepIndex() + offset;
  return DEMO_JOURNEY_STEPS[nextIndex] || null;
}

function setActiveView(view) {
  if (VIEW_ROLE_HINT[view]) {
    switchActiveRole(VIEW_ROLE_HINT[view], view);
    return;
  }
  if (caregiverCannotOpenDataView(view)) {
    state.activeView = "consent";
    state.selectedSourceRef = null;
    state.selectedTimelineEventId = null;
    state.search = "";
    return;
  }
  if (!canAccessViewForRole(view, activeRole())) {
    state.activeView = fallbackViewForRole(activeRole());
    return;
  }
  state.activeView = view;
  if (view === "roleStart") state.roleSelectionConfirmed = false;
}

function startRoleScenario(role, patientId) {
  state.activeRole = ROLE_META[role] ? role : "doctor";
  state.roleSelectionConfirmed = true;
  state.activePatientId = patientId || state.activePatientId;
  state.activeView = viewForRole(state.activeRole);
  state.activeCaseStudy = defaultCaseStudyForPatient(state.activePatientId);
  state.selectedSourceRef = null;
  state.selectedTimelineEventId = null;
  saveState();
  render();
}

function activeCaseStudy() {
  return REPORT_CASE_STUDIES.find((caseStudy) => caseStudy.id === state.activeCaseStudy) || REPORT_CASE_STUDIES[0];
}

function defaultCaseStudyForPatient(patientId) {
  return DEFAULT_CASE_STUDY_BY_PATIENT[patientId] || REPORT_CASE_STUDIES[0].id;
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesSearch(item) {
  const query = normalize(state.search).trim();
  if (!query) return true;
  return normalize(JSON.stringify(item)).includes(query);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "brak daty";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatDateTime(value) {
  if (!value) return "brak daty";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function todayInputValue() {
  return demoToday();
}

function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

function parseDateOnly(value) {
  const date = new Date(`${dateOnly(value)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
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

function normalizeTimelineZoom(value) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom)) return 0.9;
  return Number(clampNumber(zoom, TIMELINE_ZOOM.min, TIMELINE_ZOOM.max).toFixed(2));
}

function clampEndDate(events) {
  const today = todayInputValue();
  const latestEvent = events[events.length - 1]?.date;
  if (!latestEvent) return today;
  const todayDate = parseDateOnly(today);
  const latestDate = parseDateOnly(latestEvent);
  return latestDate && todayDate && latestDate > todayDate ? dateOnly(latestEvent) : today;
}

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date(`${demoToday()}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function formatAge(birthDate) {
  return PATIENT360_FORMAT.formatYears(calculateAge(birthDate));
}

function formatCount(count, one, few, many) {
  return PATIENT360_FORMAT.formatCount(count, one, few, many);
}

function statusClass(value) {
  const normalized = normalize(value);
  if (normalized.includes("do wyjaśnienia") || normalized.includes("aktywn") || normalized.includes("wysok")) return "active";
  if (normalized.includes("kontrola") || normalized.includes("weryfik") || normalized.includes("śred") || normalized.includes("potwierdzenia") || normalized.includes("rozbież") || normalized.includes("planow") || normalized.includes("brak")) return "pending";
  if (normalized.includes("wyjaśn") || normalized.includes("potwierdz") || normalized.includes("przetworz") || normalized.includes("niski") || normalized.includes("gotowe")) return "done";
  return "info";
}

function latestValue(observation) {
  return [...observation.values].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

function trendDirection(observation) {
  const values = [...observation.values].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (values.length < 2) return "brak trendu";
  const diff = values[values.length - 1].value - values[0].value;
  if (Math.abs(diff) < 0.01) return "stabilnie";
  return diff > 0 ? "wzrost" : "spadek";
}

function observationRangeState(observation) {
  const latest = latestValue(observation);
  if (!latest) return "unknown";
  if (observation.rangeLabel) return "descriptive";
  const value = Number(latest.value);
  const min = Number(observation.normalMin);
  const max = Number(observation.normalMax);
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return "unknown";
  if (value < min) return "below";
  if (value > max) return "above";
  return "within";
}

function observationStatus(observation) {
  const state = observationRangeState(observation);
  if (state === "descriptive") return observation.rangeLabel;
  if (state === "below") return "poza zakresem referencyjnym - poniżej zakresu ze źródła";
  if (state === "above") return "poza zakresem referencyjnym - powyżej zakresu ze źródła";
  if (state === "within") return "w zakresie ze źródła";
  return "brak danych";
}

function observationStatusClass(observation) {
  const state = observationRangeState(observation);
  if (state === "within") return "done";
  if (state === "unknown" || state === "descriptive") return "info";
  return "pending";
}

function observationRangeLabel(observation) {
  if (observation.rangeLabel) return observation.rangeLabel;
  if (!Number.isFinite(Number(observation.normalMin)) || !Number.isFinite(Number(observation.normalMax))) {
    return "brak zakresu referencyjnego";
  }
  return `${observation.normalMin}-${observation.normalMax} ${observation.unit}`;
}

function qualityScore() {
  const docs = byPatient(state.documents);
  const interviews = byPatient(state.interviews);
  const decisions = byPatient(state.decisionContexts);
  if (!docs.length && !interviews.length) return 0;
  const processed = docs.filter((doc) => doc.extractionStatus === "przetworzony").length;
  const trusted = docs.filter((doc) => doc.trust === "wysoki").length;
  const dated = docs.filter((doc) => doc.date && doc.eventDate).length;
  const interviewScore = interviews.length ? 3 : 0;
  const decisionScore = decisions.length ? 3 : 0;
  const denominator = docs.length * 3 + 6;
  return Math.round(((processed + trusted + dated + interviewScore + decisionScore) / denominator) * 100);
}

function parseSourceRef(ref) {
  if (!ref) return { type: "doc", id: "" };
  if (typeof ref === "object") return ref;
  if (String(ref).includes(":")) {
    const [type, ...rest] = String(ref).split(":");
    return { type, id: rest.join(":") };
  }
  return { type: "doc", id: String(ref) };
}

function sourceRecord(ref) {
  const parsed = parseSourceRef(ref);
  const map = {
    doc: state.documents,
    interview: state.interviews,
    transcript: state.interviews,
    observation: state.observations,
    medication: state.medications,
    flag: state.flags,
    decision: state.decisionContexts,
    report: state.reports,
    consent: state.consents
  };
  return { parsed, record: (map[parsed.type] || []).find((item) => item.id === parsed.id) };
}

function sourceLabel(ref) {
  const { parsed, record } = sourceRecord(ref);
  if (!record) return String(ref);
  if (parsed.type === "doc") return `${record.type} ${formatDate(record.date)}`;
  if (parsed.type === "interview") return `Wywiad ${formatDate(record.date)}`;
  if (parsed.type === "transcript") return `Transkrypcja ${formatDate(record.date)}`;
  if (parsed.type === "observation") return `Wynik: ${record.name}`;
  if (parsed.type === "medication") return `Lek: ${record.name}`;
  if (parsed.type === "flag") return `Sygnał: ${record.category}`;
  if (parsed.type === "decision") return `Kontekst decyzji: ${record.type}`;
  if (parsed.type === "report") return `Raport: ${record.type}`;
  if (parsed.type === "consent") return `Zgoda: ${record.subject}`;
  return String(ref);
}

function evidenceClassLabel(ref) {
  const prefix = String(ref || "").split(":")[0];
  const { record } = sourceRecord(ref);
  if (record?.evidenceClass) {
    return PATIENT360_CONTRACT.EVIDENCE_CLASS_LABELS[record.evidenceClass] || "";
  }
  const type = SOURCE_REF_PREFIX_TO_TYPE[prefix];
  const evidenceClass = PATIENT360_CONTRACT.SOURCE_TYPE_TO_EVIDENCE_CLASS[type];
  return PATIENT360_CONTRACT.EVIDENCE_CLASS_LABELS[evidenceClass] || "";
}

function sourceChips(refs) {
  const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
  if (!list.length) return `<span class="tag">Brak źródła</span>`;
  return list
    .map((ref) => {
      if (ref === SOURCE_MISSING_REF) {
        return `<span class="tag">Brak źródła</span>`;
      }
      const evidence = evidenceClassLabel(ref);
      const tooltip = evidence ? `${evidence} — pokaż źródło` : "Pokaż źródło";
      return `<span class="source-chip p360-source-chip"><button type="button" data-source-ref="${escapeHtml(ref)}" title="${escapeHtml(tooltip)}">${escapeHtml(sourceLabel(ref))}</button></span>`;
    })
    .join("");
}

function compactSourceRefs(refs, limit = 3) {
  const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
  const unique = [...new Set(list.filter(Boolean))];
  return unique.slice(0, limit);
}

function render() {
  renderRoleSwitcher();
  renderPatientSelect();
  renderCriticalStrip();
  renderView();
  renderEvidence();
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function renderPatientSelect() {
  const patientSwitcher = patientSelect?.closest(".patient-switcher");
  const globalSearch = searchInput?.closest(".global-search");
  if (patientSwitcher) patientSwitcher.hidden = state.activeView === "roleStart";
  if (globalSearch) globalSearch.hidden = state.activeView === "roleStart";
  patientSelect.innerHTML = state.patients
    .map((patient) => `<option value="${escapeHtml(patient.id)}" ${patient.id === state.activePatientId ? "selected" : ""}>${escapeHtml(patient.name)}</option>`)
    .join("");
  searchInput.value = state.search;
}

function renderRoleSwitcher() {
  if (!roleSwitcher) return;
  roleSwitcher.hidden = state.activeView === "roleStart";
  if (state.activeView === "roleStart") {
    roleSwitcher.innerHTML = "";
    return;
  }
  const currentRole = activeRole();
  roleSwitcher.innerHTML = ROLE_ORDER.map((role) => {
    const meta = activeRoleMeta(role);
    return `
      <button type="button" class="role-switch ${role === currentRole ? "active" : ""}" data-role-switch="${escapeHtml(role)}" title="${escapeHtml(meta.promise)}">
        <i data-lucide="${escapeHtml(meta.icon)}"></i>
        <span>${escapeHtml(meta.label)}</span>
      </button>
    `;
  }).join("");
  roleSwitcher.querySelectorAll("[data-role-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      switchActiveRole(button.dataset.roleSwitch);
      saveState();
      render();
    });
  });
}

function renderCriticalStrip() {
  if (state.activeView === "roleStart") {
    criticalStrip.classList.remove("visible");
    criticalStrip.innerHTML = "";
    return;
  }
  const redFlags = byPatient(state.flags).filter((flag) => flag.color === "red" && flag.status !== "wyjaśnione" && flag.status !== "odrzucone");
  if (!redFlags.length) {
    criticalStrip.classList.remove("visible");
    criticalStrip.innerHTML = "";
    return;
  }
  criticalStrip.classList.add("visible");
  criticalStrip.innerHTML = `<i data-lucide="triangle-alert"></i><strong>${formatCount(redFlags.length, "sygnał DITL", "sygnały DITL", "sygnałów DITL")} do sprawdzenia:</strong> ${escapeHtml(redFlags[0].question)}`;
}

function isCaregiverRestrictedView(view = state.activeView) {
  if (activeRole() !== "caregiver") return false;
  if (!["interview", "documents", "timeline", "medications", "observations"].includes(view)) return false;
  const model = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  return !model.activeScopes.length;
}

function renderCaregiverRestrictedData(view = state.activeView) {
  const patient = activePatient();
  const model = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  const label = {
    interview: "wywiady i transkrypcje",
    documents: "dokumenty",
    timeline: "oś historii",
    medications: "leki",
    observations: "wyniki",
  }[view] || "dane";
  return `
    ${pageHeader("Brak aktywnej zgody", "Ten widok wymaga aktywnego udostępnienia opiekunowi. Bez zgody system pokazuje tylko informację o braku dostępu.", "shield-check")}
    ${renderRoleContextBanner("caregiver")}
    <section class="section-band caregiver-guard">
      <div class="section-head">
        <div>
          <p class="eyebrow">Dostęp opiekuna</p>
          <h2>${escapeHtml(patient.name)} · ${escapeHtml(label)}</h2>
        </div>
        <span class="status-chip ${model.activeScopes.length ? "done" : "pending"}">${model.activeScopes.length ? "Zakres aktywny" : "Brak aktywnego zakresu"}</span>
      </div>
      <p class="record-body">${escapeHtml(model.safetyCopy)}</p>
      <div class="caregiver-access-grid">
        ${model.accessCards.map(renderCaregiverAccessCard).join("")}
      </div>
      <div class="inline-actions">
        <button class="primary-button" data-set-view="caregiverPortal"><i data-lucide="users-round"></i>Wróć do kokpitu opiekuna</button>
        <button class="ghost-button" data-set-view="consent"><i data-lucide="shield-check"></i>Kto może udostępnić dane</button>
      </div>
    </section>
  `;
}

function renderView() {
  const renderers = {
    roleStart: renderRoleStart,
    core: renderCore,
    patientPortal: renderPatientPortal,
    interview: renderInterview,
    documents: renderDocuments,
    timeline: renderTimeline,
    medications: renderMedications,
    observations: renderObservations,
    risks: renderRisks,
    reports: renderReportsV2,
    caregiverPortal: renderCaregiverPortal,
    consent: renderConsent,
    audit: renderAudit
  };

  if (!canAccessViewForRole(state.activeView, activeRole())) {
    state.activeView = fallbackViewForRole(activeRole());
    saveState();
  }

  const role = activeRole();
  const libraryLabel = document.querySelector('[data-nav-section="library"]');
  if (libraryLabel) {
    libraryLabel.textContent = LIBRARY_HEADING;
  }
  const navList = document.querySelector(".nav-list");
  if (navList) {
    navList.setAttribute("aria-label", `Widoki demo: ${activeRoleMeta(role).label}`);
  }

  document.querySelectorAll(".nav-item").forEach((button) => {
    const view = button.dataset.view;
    const isStart = view === "roleStart";
    const isCockpitSwitch = button.classList.contains("cockpit-nav") || Boolean(VIEW_ROLE_HINT[view]);
    const isLibraryItem = !isStart && !isCockpitSwitch;
    const allowed = isStart || isCockpitSwitch || canShowSidebarLibraryView(view, role);
    const item = isLibraryItem ? sidebarLibraryItem(view, role) : null;
    if (isLibraryItem) {
      const label = SIDEBAR_LIBRARY_LABELS[view] || item?.[1] || "";
      const caption = item?.[3] || button.title;
      const labelNode = button.querySelector("span");
      if (labelNode) labelNode.textContent = label;
      button.title = caption;
    }
    button.hidden = !allowed;
    button.disabled = !allowed;
    button.setAttribute("aria-hidden", allowed ? "false" : "true");
    button.classList.toggle("is-hidden", !allowed);
    button.classList.toggle("active", allowed && view === state.activeView);
  });

  document.body.dataset.register = state.activeView === "roleStart"
    ? "app"
    : activeRole() || VIEW_REGISTER[state.activeView] || "doctor";
  const renderedView = isCaregiverRestrictedView()
    ? renderCaregiverRestrictedData()
    : (renderers[state.activeView] || renderCore)();
  viewRoot.innerHTML = state.activeView === "roleStart"
    ? renderedView
    : `${renderDemoJourney()}${renderedView}`;
  bindViewActions();
  bindSourceButtons();
}

function renderDemoJourney() {
  const currentStepId = journeyStageForView();
  const currentIndex = journeyStepIndex(currentStepId);
  const role = activeRole();
  const meta = activeRoleMeta(role);
  const patient = activePatient();
  const caregiverNoAccess = role === "caregiver" && !caregiverHasActiveScope();
  const previous = journeyStepByOffset(-1);
  const next = caregiverNoAccess ? null : journeyStepByOffset(1);
  const summaryTarget = viewForJourneyStep("summary", role);
  const dataTarget = viewForJourneyStep("data", role);

  return `
    <section class="demo-journey section-band" aria-label="Ścieżka demo Pacjent360">
      <div class="demo-journey-head">
        <div>
          <p class="eyebrow"><i data-lucide="route"></i>Ścieżka demo</p>
          <h2>${escapeHtml(meta.label)} · ${escapeHtml(patientDisplayName(patient))}</h2>
          <p>Ten sam pacjent, ta sama historia, inny zakres dostępu. Przechodzisz przez demo krok po kroku.</p>
        </div>
        <span class="status-chip info">${escapeHtml(DEMO_JOURNEY_STEPS[currentIndex]?.label || "Kokpit")}</span>
      </div>
      <div class="demo-journey-steps">
        ${DEMO_JOURNEY_STEPS.map((step, index) => `
          <button
            type="button"
            class="demo-journey-step ${index < currentIndex ? "done" : ""} ${step.id === currentStepId ? "active" : ""}"
            data-journey-step="${escapeHtml(step.id)}"
            aria-current="${step.id === currentStepId ? "step" : "false"}"
          >
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(step.label)}</strong>
            <small>${escapeHtml(step.caption)}</small>
          </button>
        `).join("")}
      </div>
      <div class="demo-journey-actions" aria-label="Następne kroki demo">
        ${previous ? `<button class="ghost-button" data-journey-step="${escapeHtml(previous.id)}"><i data-lucide="arrow-left"></i>Wróć: ${escapeHtml(previous.label)}</button>` : ""}
        ${next ? `<button class="primary-button" data-journey-step="${escapeHtml(next.id)}"><i data-lucide="arrow-right"></i>Dalej: ${escapeHtml(next.label)}</button>` : ""}
        ${caregiverNoAccess && state.activeView !== "consent" ? `<button class="primary-button" data-set-view="consent"><i data-lucide="shield-check"></i>Zobacz zakres zgody</button>` : ""}
        ${!caregiverNoAccess && state.activeView !== "timeline" ? `<button class="ghost-button" data-set-view="timeline"><i data-lucide="git-branch"></i>${role === "caregiver" ? "Zobacz historię w zakresie zgody" : role === "patient" ? "Zobacz moją historię" : "Zobacz zdarzenia i źródła"}</button>` : ""}
        ${!caregiverNoAccess && state.activeView !== dataTarget ? `<button class="ghost-button" data-set-view="${escapeHtml(dataTarget)}"><i data-lucide="files"></i>Pokaż źródła</button>` : ""}
        ${!caregiverNoAccess && state.activeView !== summaryTarget ? `<button class="ghost-button" data-set-view="${escapeHtml(summaryTarget)}"><i data-lucide="clipboard-check"></i>Zakończ podsumowaniem</button>` : ""}
      </div>
    </section>
  `;
}

function metric(title, value, caption, icon, tooltip = "") {
  return `
    <article class="metric" ${tooltip ? `title="${escapeHtml(tooltip)}"` : ""}>
      <div class="metric-head">
        <span class="eyebrow">${escapeHtml(title)}</span>
        <span class="metric-icon"><i data-lucide="${escapeHtml(icon)}"></i></span>
      </div>
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="metric-caption">${escapeHtml(caption)}</div>
    </article>
  `;
}

function renderSafetyNote(message, className = "") {
  return `
    <div class="safety-note ${className}" role="note">
      <i data-lucide="shield-alert"></i>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function renderDitlStatusNotice() {
  return `<p class="ditl-status-copy">${escapeHtml(DITL_STATUS_NOTICE)}</p>`;
}

function renderReportDemoBadge(lensLabel = "kontekst demo") {
  return `
    <div class="report-demo-badge" role="note">
      <span><strong>Soczewka:</strong> fikcyjny kompozyt demo (${escapeHtml(lensLabel)})</span>
      <span><strong>Dane:</strong> pacjent demonstracyjny</span>
    </div>
  `;
}

function pageHeader(title, description, dialogType) {
  const hasDialogAction = dialogType && DIALOG_TYPES.has(dialogType);
  return `
    <div class="page-intro">
      <div>
        <p class="eyebrow">Pacjent360™</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      ${hasDialogAction ? `<div class="inline-actions"><button class="primary-button" data-open-dialog="${escapeHtml(dialogType)}"><i data-lucide="plus"></i>Dodaj</button></div>` : ""}
    </div>
  `;
}

function renderFullDataAccess(context = "clinician") {
  const configs = {
    clinician: {
      role: "doctor",
      eyebrow: "Pełny kontekst",
      intro: "Lekarz360 pokazuje pełny kontekst udostępniony w demo: wywiad, dokumenty, oś historii, leki, wyniki, pytania DITL, podsumowanie i zgody.",
      title: "Dane dostępne w Lekarz360"
    },
    patient: {
      role: "patient",
      eyebrow: "Moje dane",
      intro: "Pacjent360 pokazuje dokumenty, mapę, wywiad opisany prostym językiem, leki, wyniki oraz zgody udzielone innym osobom.",
      title: "Co widzę w Pacjent360"
    },
    caregiver: {
      role: "caregiver",
      eyebrow: "Dane osoby pod opieką",
      intro: "Opiekun360 pokazuje dane osoby, która udostępniła opiekę, albo dziecka/osoby bliskiej w zakresie aktywnej zgody: dokumenty, mapę, leki, wyniki, zgody i gotowy wywiad.",
      title: "Co widzę w Opiekun360"
    }
  };
  const config = configs[context] || configs.clinician;
  const visibleItems = roleDataVisibility(config.role);

  return `
    <section class="section-band full-data-hub">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(config.eyebrow)}</p>
          <h2><i data-lucide="database"></i> ${escapeHtml(config.title)}</h2>
        </div>
      </div>
      <p class="record-body">${escapeHtml(config.intro)}</p>
      <div class="full-data-grid">
        ${visibleItems.map(([view, label, icon, caption]) => `
          <button class="full-data-tile" data-set-view="${escapeHtml(view)}">
            <i data-lucide="${escapeHtml(icon)}"></i>
            <span>
              <strong>${escapeHtml(label)}</strong>
              <small>${escapeHtml(caption)}</small>
            </span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function medNeedsConfirmation(med) {
  const status = normalize([med.status, med.actualStatus, med.story, med.question].filter(Boolean).join(" "));
  return (
    status.includes("niepotwierd") ||
    status.includes("deklarow") ||
    status.includes("rodzic zgłasza") ||
    status.includes("rodzic zglasza") ||
    status.includes("rozbiezn") ||
    med.status === "OTC/suplement" ||
    med.status === "OTC"
  );
}

function medsToConfirm(patientId = state.activePatientId) {
  return state.medications.filter((med) => med.patientId === patientId && medNeedsConfirmation(med)).length;
}

function renderMedReconciliation() {
  const meds = byPatient(state.medications);
  const issues = meds.filter(medNeedsConfirmation);
  if (!issues.length) return "";

  return `
    <section class="section-band med-reconciliation">
      <div class="section-head">
        <div>
          <p class="eyebrow">Uzgodnienie leków</p>
          <h2><i data-lucide="pill"></i> Rozbieżności lekowe (${issues.length})</h2>
        </div>
        <button class="ghost-button" data-set-view="medications"><i data-lucide="list"></i> Pełna lista</button>
      </div>
      <div class="med-recon-table table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lek</th>
              <th>Status formalny</th>
              <th>Realne przyjmowanie</th>
              <th>Pytanie</th>
            </tr>
          </thead>
          <tbody>
            ${issues.map((med) => `
              <tr>
                <td><strong>${escapeHtml(med.name)}</strong> <span class="muted">${escapeHtml(med.dose)}</span></td>
                <td><span class="status-chip ${statusClass(med.status)}">${escapeHtml(med.status)}</span></td>
                <td><span class="tag">${escapeHtml(med.actualStatus)}</span></td>
                <td>${escapeHtml(med.question)} ${sourceChips(med.sourceRefs)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCore() {
  const patient = activePatient();
  const decision = activeDecision();
  const latestInterview = byPatient(state.interviews).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const latestInterviewRefs = latestInterview ? [`interview:${latestInterview.id}`, `transcript:${latestInterview.id}`] : [SOURCE_MISSING_REF];
  const decisionSelfRefs = decision ? [`decision:${decision.id}`] : [SOURCE_MISSING_REF];
  const decisionRefs = decision?.sourceRefs?.length ? decision.sourceRefs : decisionSelfRefs;
  const flags = byPatient(state.flags);
  const redFlags = flags.filter((flag) => flag.color === "red" && flag.status !== "wyjaśnione").slice(0, 5);
  const gaps = byPatient(state.knownUnknowns).filter((item) => item.category === "Unknown" || item.category === "To verify").slice(0, 3);
  const questions = [...(decision?.ditlQuestions || []), ...flags.filter((flag) => flag.color === "blue").map(flagToQuestion)].slice(0, 7);
  const decisionHeadline = decision ? decision.clinicalQuestion : patient.decisionToday;
  const topQuestions = questions.slice(0, 3);

  return `
    <div class="page-intro">
      <div>
        <p class="eyebrow">Kontekst wizyty i pytania do decyzji lekarza (DITL)</p>
        <h1>Lekarz360: kontekst w 90 sekund</h1>
        <p>${escapeHtml(patient.name)}, ${formatAge(patient.birthDate)}. System pokazuje pytania i luki do wyjaśnienia, bez automatycznej decyzji po stronie systemu.</p>
      </div>
      <div class="inline-actions">
        <button class="primary-button" data-open-dialog="decision"><i data-lucide="stethoscope"></i>Kontekst</button>
        <button class="primary-button" data-open-dialog="interview"><i data-lucide="messages-square"></i>Wywiad</button>
        <button class="ghost-button" data-set-view="reports"><i data-lucide="file-text"></i>Raport</button>
      </div>
    </div>

    ${renderRoleContextBanner("doctor")}
    ${renderDashboardOrchestrator({
      persona: "Lekarz360",
      icon: "stethoscope",
      title: "Najpierw kontekst, potem pełne dane",
      lead: `${patient.name} · ${formatAge(patient.birthDate)}. ${decisionHeadline}`,
      status: `${formatCount(questions.filter((q) => q.status === "do wyjaśnienia").length, "pytanie do wyjaśnienia", "pytania do wyjaśnienia", "pytań do wyjaśnienia")} · ${formatCount(redFlags.length, "sygnał do sprawdzenia", "sygnały do sprawdzenia", "sygnałów do sprawdzenia")}`,
      steps: [
        ["1", "Powód wizyty", patient.currentProblem || "Brak opisu aktualnego problemu."],
        ["2", "Niepewności", gaps[0]?.description || "Brak jawnych braków danych w demo."],
        ["3", "Pytania", topQuestions[0]?.question || "Brak pytań DITL dla tego pacjenta."]
      ],
      actions: [
        { label: "Raport", icon: "file-text", view: "reports", primary: true },
        { label: "Oś historii", icon: "git-branch", view: "timeline" },
        { label: "Leki", icon: "pill", view: "medications" }
      ]
    })}
    ${renderFullDataAccess("clinician")}
    ${renderCareContractPanel("doctor")}

    ${renderCockpitDetails("Pełne dane Lekarz360: leki, źródła, karta 90 sekund, oś historii i skróty", `
      <section class="section-band decision-hero core-brief">
        <div class="section-head">
          <div>
            <p class="eyebrow">Dzisiejszy kontekst wizyty</p>
            <h2>${escapeHtml(decisionHeadline)}</h2>
          </div>
          <span class="status-chip info">${escapeHtml(decision?.status || "DITL")}</span>
        </div>
        <p class="record-body">Kontakt: ${formatDate(decision?.contactDate)}. Lekarz oznacza każde pytanie jako wyjaśnione, odrzucone albo do dalszej kontroli.</p>
        <p class="record-body"><strong>Największa zmiana:</strong> ${escapeHtml(patient.biggestChange)}</p>
        <div class="source-line">${sourceChips(decision?.sourceRefs || [])}</div>
      </section>

      ${renderMedReconciliation()}

      <div class="ninety-grid core-priority-grid">
        ${renderNinetyCard("Stan bazowy", patient.baselineState, "user-round-check", latestInterviewRefs)}
        ${renderNinetyCard("Aktualny problem", patient.currentProblem, "activity", decisionRefs)}
        ${renderNinetyList("Największe braki danych", gaps.map((gap) => gap.description), "search-x", gaps.flatMap((gap) => gap.sourceRefs))}
        ${renderNinetyList("Top pytania DITL", topQuestions.map((question) => question.question), "circle-help", topQuestions.flatMap((question) => question.sourceRefs || []))}
      </div>

      ${renderMapShortcut()}
      ${renderClinicianShortcuts()}
    `)}
  `;
}

function renderDashboardOrchestrator({ persona, icon, title, lead, status, steps, actions }) {
  return `
    <section class="section-band dashboard-orchestrator" aria-label="Widok perspektywy">
      <div class="orchestrator-main">
        <p class="eyebrow"><i data-lucide="${escapeHtml(icon)}"></i>Widok perspektywy · ${escapeHtml(persona)}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(lead)}</p>
        <div class="orchestrator-actions">
          ${actions.map((action) => `
            <button class="${action.primary ? "primary-button" : "ghost-button"}" data-set-view="${escapeHtml(action.view)}">
              <i data-lucide="${escapeHtml(action.icon)}"></i>${escapeHtml(action.label)}
            </button>
          `).join("")}
        </div>
      </div>
      <div class="orchestrator-panel">
        <span class="status-chip info">${escapeHtml(status)}</span>
        <div class="orchestrator-steps">
          ${steps.map(([number, label, body]) => `
            <article>
              <b>${escapeHtml(number)}</b>
              <div>
                <strong>${escapeHtml(label)}</strong>
                <small>${escapeHtml(body)}</small>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCockpitDetails(summary, content) {
  return `
    <details class="cockpit-details">
      <summary><i data-lucide="layers"></i>${escapeHtml(summary)}</summary>
      <div class="cockpit-detail-body">${content}</div>
    </details>
  `;
}

function renderCareContractPanel(persona = "doctor") {
  const contract = activeCareContract();
  if (!contract) return "";
  const personaIntro = {
    doctor: "Lekarz widzi dokumenty, źródła, pytania i zakres zgód. Obserwacje opiekuna pozostają oznaczone jako wywiad.",
    patient: "Pacjent albo rodzic widzi, co jest zbierane przed wizytą i co zostało udostępnione innym osobom.",
    caregiver: "Opiekun widzi tylko zakres zgody i może dopisać informacje organizacyjne lub obserwacje opiekuna."
  }[persona] || "Ten widok pokazuje, kto wnosi informacje i kto co widzi.";
  const groups = [
    ["Lekarz dostaje", contract.doctorGets || [], "stethoscope"],
    ["Pacjent widzi", contract.patientGets || [], "user-round"],
    ["Opiekun wnosi / widzi", [...(contract.caregiverGets || []), ...(contract.caregiverAdds || [])].slice(0, 5), "users-round"]
  ];
  return `
    <section class="section-band care-contract-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow"><i data-lucide="handshake"></i>Kto co widzi i dlaczego</p>
          <h2>${escapeHtml(contract.scenario)}</h2>
        </div>
        <span class="status-chip info">${escapeHtml(contract.relationship)}</span>
      </div>
      <p class="record-body">${escapeHtml(personaIntro)}</p>
      <div class="care-contract-roles">
        <article>
          <span>Pacjent</span>
          <strong>${escapeHtml(contract.patientRole)}</strong>
        </article>
        <article>
          <span>Główne źródło informacji</span>
          <strong>${escapeHtml(contract.primaryInformant)}</strong>
        </article>
      </div>
      <div class="care-contract-grid">
        ${groups.map(([title, items, icon]) => `
          <article>
            <h3><i data-lucide="${escapeHtml(icon)}"></i>${escapeHtml(title)}</h3>
            <ul class="plain-list compact-list">
              ${(items.length ? items : ["Brak danych w tym scenariuszu."]).map((item) => `<li><i data-lucide="dot"></i><span>${escapeHtml(item)}</span></li>`).join("")}
            </ul>
          </article>
        `).join("")}
      </div>
      <p class="safety-note inline-note"><i data-lucide="shield-alert"></i>${escapeHtml(contract.safetyBoundary)}</p>
      <div class="source-line">${sourceChips(contract.sourceRefs || [])}</div>
    </section>
  `;
}

function flagToQuestion(flag) {
  return {
    id: `flag-${flag.id}`,
    question: flag.question,
    status: flag.status,
    sourceRefs: flag.sourceRefs,
    flagId: flag.id
  };
}

function renderNinetyCard(title, text, icon, refs) {
  return `
    <article class="section-band ninety-card">
      <p class="eyebrow"><i data-lucide="${escapeHtml(icon)}"></i>${escapeHtml(title)}</p>
      <p class="record-body">${escapeHtml(text || "Brak danych.")}</p>
      <div class="source-line">${sourceChips(compactSourceRefs(refs))}</div>
    </article>
  `;
}

function renderNinetyList(title, items, icon, refs) {
  return `
    <article class="section-band ninety-card">
      <p class="eyebrow"><i data-lucide="${escapeHtml(icon)}"></i>${escapeHtml(title)}</p>
      <ul class="plain-list compact-list">
        ${(items.length ? items : ["Brak danych."]).map((item) => `<li><i data-lucide="dot"></i><span>${escapeHtml(item)}</span></li>`).join("")}
      </ul>
      <div class="source-line">${sourceChips(compactSourceRefs(refs))}</div>
    </article>
  `;
}

function renderDitlQuestion(question) {
  const id = question.flagId ? question.flagId : question.id;
  const type = question.flagId ? "flag" : "question";
  return `
    <article class="ditl-card">
      <div class="record-head">
        <div>
          <p class="record-title">${escapeHtml(question.question)}</p>
          <div class="record-meta"><span class="status-chip ${statusClass(question.status)}">${escapeHtml(question.status)}</span></div>
        </div>
      </div>
      <div class="status-actions" role="group" aria-label="Status DITL">
        ${DITL_STATUSES.map((status) => `<button class="small-action ${question.status === status ? "selected" : ""}" data-ditl-type="${escapeHtml(type)}" data-ditl-id="${escapeHtml(id)}" data-ditl-status="${escapeHtml(status)}">${escapeHtml(status)}</button>`).join("")}
      </div>
      ${renderDitlStatusNotice()}
      <div class="source-line">${sourceChips(question.sourceRefs)}</div>
    </article>
  `;
}

function renderMapShortcut() {
  const events = byPatient(state.timelineEvents).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = events[0];
  const last = events[events.length - 1];
  const tracks = [...new Set(events.map((event) => event.track))].slice(0, 4);
  return `
    <section class="section-band core-map-shortcut">
      <div>
        <p class="eyebrow"><i data-lucide="map"></i>Oś historii pacjenta</p>
        <h2>Skrót historii pacjenta: od osi czasu do źródeł</h2>
        <p class="record-body">
          ${events.length
            ? `${formatDate(first.date)} - ${formatDate(last.date)} · ${PATIENT360_FORMAT.formatEvents(events.length)} · ${PATIENT360_FORMAT.formatTracks(tracks.length)}`
            : "Brak zdarzeń w danych demo."}
        </p>
        <div class="core-map-rail" aria-hidden="true">
          ${events.map((event) => `<span class="${event.status === "planowane" ? "future" : ""}" style="left:${timelinePreviewPosition(event, first, last)}%"></span>`).join("")}
        </div>
      </div>
      <button class="primary-button" data-set-view="timeline"><i data-lucide="git-branch"></i>Otwórz oś historii</button>
    </section>
  `;
}

function renderClinicianShortcuts() {
  const items = [
    ["documents", "Źródła", "files"],
    ["observations", "Wyniki", "activity"],
    ["medications", "Leki", "pill"],
    ["risks", "Pytania", "flag"],
    ["reports", "Raport", "file-text"]
  ];
  return `
    <section class="section-band core-shortcuts">
      <div class="section-head">
        <div>
          <p class="eyebrow">Dalsza praca</p>
          <h2><i data-lucide="layout-dashboard"></i>Przejdź do pełnych danych</h2>
        </div>
      </div>
      <div class="core-shortcut-row">
        ${items.map(([view, label, icon]) => `<button class="ghost-button" data-set-view="${escapeHtml(view)}"><i data-lucide="${escapeHtml(icon)}"></i>${escapeHtml(label)}</button>`).join("")}
      </div>
    </section>
  `;
}

function timelinePreviewPosition(event, first, last) {
  if (!event || !first || !last) return 0;
  const start = new Date(`${dateOnly(first.date)}T12:00:00`);
  const end = new Date(`${dateOnly(last.date)}T12:00:00`);
  const current = new Date(`${dateOnly(event.date)}T12:00:00`);
  if ([start, end, current].some((date) => Number.isNaN(date.getTime()))) return 0;
  const span = Math.max(end.getTime() - start.getTime(), 1);
  return Math.round(Math.min(Math.max(((current.getTime() - start.getTime()) / span) * 100, 0), 100));
}

function renderCoreColumn(title, bullets, icon) {
  return `
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(title)}</p>
          <h2><i data-lucide="${escapeHtml(icon)}"></i>${escapeHtml(title)}</h2>
        </div>
      </div>
      <ul class="plain-list">
        ${bullets.map((bullet) => `<li><i data-lucide="check-circle-2"></i><span>${escapeHtml(bullet)}</span></li>`).join("")}
      </ul>
    </section>
  `;
}

function renderRoleStart() {
  const selectedRole = activeRole();
  const roleConfirmed = Boolean(state.roleSelectionConfirmed);
  if (roleConfirmed) return renderRoleScenarioSubpage(selectedRole);
  return `
    <section class="role-demo-hero">
      <div>
        <p class="eyebrow"><i data-lucide="play-circle"></i>Jedna historia, trzy perspektywy</p>
        <h1>Wybierz perspektywę 360° i zobacz tę samą historię pacjenta</h1>
        <p>Pacjent360™ pokazuje jedną historię w trzech soczewkach: Lekarz360 dla szybkiego kontekstu, Pacjent360 dla przygotowania wizyty i Opiekun360 dla pomocy bliskiej osobie w zakresie zgody.</p>
      </div>
      <div class="role-demo-current">
        <span>Zacznij tutaj</span>
        <strong><i data-lucide="mouse-pointer-click"></i>Wybierz perspektywę</strong>
        <p>Po wyborze perspektywy przejdziesz do osobnego ekranu z historiami pacjentów.</p>
      </div>
    </section>

    <section class="section-band role-picker-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Krok 1</p>
          <h2>Z jakiej perspektywy oglądasz historię?</h2>
        </div>
      </div>
      <div class="role-card-grid">
        ${ROLE_ORDER.map((role) => {
          const meta = activeRoleMeta(role);
          return `
            <button type="button" class="role-card" data-select-role="${escapeHtml(role)}">
              <i data-lucide="${escapeHtml(meta.icon)}"></i>
              <strong>${escapeHtml(meta.label)}</strong>
              <span>${escapeHtml(meta.promise)}</span>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderRoleScenarioSubpage(role) {
  const meta = activeRoleMeta(role);
  return `
    <section class="role-step-breadcrumb" aria-label="Postęp wyboru demo">
      <span><i data-lucide="check-circle-2"></i>Krok 1: ${escapeHtml(meta.label)}</span>
      <i data-lucide="chevron-right"></i>
      <strong>Krok 2: wybierz pacjenta</strong>
      <button type="button" class="ghost-button" data-reset-role-selection>
        <i data-lucide="arrow-left"></i>Zmień perspektywę
      </button>
    </section>

    <section class="role-demo-hero role-scenario-hero">
      <div>
        <p class="eyebrow"><i data-lucide="${escapeHtml(meta.icon)}"></i>Krok 2 · ${escapeHtml(meta.label)}</p>
        <h1>Wybierz historię, którą chcesz zobaczyć w ${escapeHtml(meta.label)}</h1>
        <p>${escapeHtml(meta.promise)} Każdy scenariusz prowadzi do innego kokpitu, ale korzysta z tej samej mapy zdarzeń pacjenta.</p>
      </div>
      <div class="role-demo-current">
        <span>Wybrana perspektywa</span>
        <strong><i data-lucide="${escapeHtml(meta.icon)}"></i>${escapeHtml(meta.label)}</strong>
        <p>To osobny ekran po wyborze perspektywy. Teraz wybierasz pacjenta demonstracyjnego.</p>
      </div>
    </section>

    <section class="section-band scenario-picker-band role-subpage-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Pacjenci demonstracyjni</p>
        <h2>Trzy historie, trzy kokpity 360°</h2>
        </div>
        <span class="status-chip info">${escapeHtml(meta.label)}</span>
      </div>
      <div class="scenario-card-grid">
        ${state.patients.map((patient) => renderScenarioCard(patient, role)).join("")}
      </div>
    </section>
  `;
}

function renderScenarioCard(patient, role) {
  const meta = activeRoleMeta(role);
  const narrative = activeRoleNarrative(role, patient.id);
  const goal = activeRoleGoal(role, patient.id);
  const sections = activeRoleSections(role, patient.id);
  return `
    <article class="scenario-card ${patient.id === state.activePatientId ? "selected" : ""}">
      <div class="scenario-card-head">
        <span>${escapeHtml(formatAge(patient.birthDate))}</span>
        <strong>${escapeHtml(patient.name)}</strong>
      </div>
      <p>${escapeHtml(narrative?.summary || patient.patientSummary || patient.currentProblem)}</p>
      <div class="scenario-goal">
        <span>Cel tej perspektywy</span>
        <strong>${escapeHtml(goal?.goal || meta.promise)}</strong>
      </div>
      <ul class="plain-list compact-list">
        ${(sections.length ? sections : ["Kokpit 360°", "Oś historii", "Następny krok"]).slice(0, 4).map((item) => `<li><i data-lucide="check-circle-2"></i><span>${escapeHtml(item)}</span></li>`).join("")}
      </ul>
      <button class="primary-button" data-start-role="${escapeHtml(role)}" data-start-patient="${escapeHtml(patient.id)}">
        <i data-lucide="${escapeHtml(meta.icon)}"></i>${escapeHtml(meta.cta)}
      </button>
    </article>
  `;
}

function renderRoleContextBanner(role = activeRole()) {
  const meta = activeRoleMeta(role);
  const narrative = activeRoleNarrative(role);
  const goal = activeRoleGoal(role);
  return `
    <section class="section-band role-context-banner">
      <div>
        <p class="eyebrow"><i data-lucide="${escapeHtml(meta.icon)}"></i>${escapeHtml(meta.label)}</p>
        <h2>${escapeHtml(narrative?.title || "Ten sam film życia, inna soczewka")}</h2>
        <p>${escapeHtml(narrative?.summary || meta.promise)}</p>
      </div>
      <article>
        <span>Cel teraz</span>
        <strong>${escapeHtml(goal?.goal || meta.promise)}</strong>
      </article>
    </section>
  `;
}

function storyBullets(patient) {
  const interview = byPatient(state.interviews)[0];
  return [
    patient.baselineState,
    patient.biggestChange,
    interview ? `Wywiad ${formatDate(interview.date)}: ${interview.answers.family}` : "Brak wywiadu pacjenta."
  ];
}

function stateBullets() {
  return [
    ...byPatient(state.conditions).slice(0, 3).map((condition) => `${condition.name} (${condition.status})`),
    ...byPatient(state.observations).slice(0, 2).map((obs) => {
      const latest = latestValue(obs);
      return `${obs.name}: ${latest?.value ?? "brak"} ${obs.unit}, trend: ${trendDirection(obs)}`;
    })
  ];
}

function riskBullets() {
  return byPatient(state.flags)
    .filter((flag) => flag.color === "red" || flag.color === "amber")
    .slice(0, 5)
    .map((flag) => `${FLAG_META[flag.color].label}: ${flag.question}`);
}

function renderPatientPortal() {
  const patient = activePatient();
  const preVisitModel = PATIENT360_PREVISIT_MODEL.buildPreVisitModel({
    state,
    patientId: state.activePatientId,
    searchQuery: state.search
  });
  const docs = byPatient(state.documents).filter(matchesSearch).sort((a, b) => new Date(b.date) - new Date(a.date));
  const observations = byPatient(state.observations).filter(matchesSearch);
  const meds = byPatient(state.medications).filter(matchesSearch);
  const decisions = byPatient(state.decisionContexts).sort((a, b) => new Date(b.contactDate) - new Date(a.contactDate));
  const timeline = byPatient(state.timelineEvents).filter(matchesSearch).sort((a, b) => new Date(b.date) - new Date(a.date));
  const decision = activeDecision();
  const patientQuestions = preVisitModel.patientQuestions;
  const upcoming = patientPortalUpcoming(decisions, timeline);
  const caregiverModel = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  const isGuardianView = patient.guardian && patient.guardian !== "brak";
  const checklistSummary = preVisitModel.checklistSummary || visitChecklistSummary(preVisitModel.checklist);
  const nextItem = upcoming[0] || null;
  const medConfirmCount = meds.filter((med) => {
    const actual = normalize(med.actualStatus || "");
    return actual.includes("niepotwierd") || actual.includes("deklarow") || actual.includes("otc");
  }).length;

  return `
    ${pageHeader(
      isGuardianView ? "Pacjent360: widok rodzica" : "Pacjent360",
      isGuardianView
        ? "Widok rodzica: co przygotować dla dziecka przed wizytą, jakie dokumenty zabrać i kto ma dostęp do danych dziecka."
        : "Osobisty widok Pacjent360™: oś historii, następne kroki, leki, dokumenty i udostępnianie opiekunowi. Nie zastępuje konsultacji lekarskiej.",
      "smartphone"
    )}
    ${renderRoleContextBanner("patient")}
    ${renderDashboardOrchestrator({
      persona: isGuardianView ? "Rodzic w Pacjent360" : "Pacjent360",
      icon: isGuardianView ? "users-round" : "smartphone",
      title: isGuardianView ? "Przygotuj wizytę dziecka bez chaosu" : "Przygotuj wizytę bez chaosu",
      lead: `${patient.name} · ${formatAge(patient.birthDate)}. ${nextItem ? `${formatDate(nextItem.date)} · ${nextItem.title}` : "Zacznij od dokumentów, leków, objawów i pytań."}`,
      status: `${checklistSummary.ready} gotowe · ${formatCount(checklistSummary.confirm, "element do potwierdzenia", "elementy do potwierdzenia", "elementów do potwierdzenia")} · ${formatCount(medConfirmCount, "lek do sprawdzenia", "leki do sprawdzenia", "leków do sprawdzenia")}`,
      steps: [
        ["1", "Dodaj to, co masz", `${PATIENT360_FORMAT.formatDocuments(docs.length)} · ${PATIENT360_FORMAT.formatResults(observations.length)}`],
        ["2", "Zaznacz niepewne", formatCount(checklistSummary.confirm, "element do potwierdzenia", "elementy do potwierdzenia", "elementów do potwierdzenia")],
        ["3", "Zabierz pytania", formatCount(patientQuestions.length, "pytanie do rozmowy z lekarzem", "pytania do rozmowy z lekarzem", "pytań do rozmowy z lekarzem")]
      ],
      actions: [
        { label: "Dokumenty", icon: "files", view: "documents", primary: true },
        { label: "Leki", icon: "pill", view: "medications" },
        { label: "Oś historii", icon: "git-branch", view: "timeline" }
      ]
    })}
    ${renderFullDataAccess("patient")}
    ${renderCareContractPanel("patient")}
    ${renderPatientNextSteps({ patient, preVisitModel, upcoming, patientQuestions, decision, isGuardianView })}
    ${renderCockpitDetails("Pełne przygotowanie: kafle, checklista, pytania, dokumenty i zgody", `
      ${renderPatientAppHome({ patient, preVisitModel, docs, observations, meds, patientQuestions, upcoming, timeline, caregiverModel })}
      ${renderPreVisitFlow(preVisitModel)}
    `)}
  `;
}

function activeVisitChecklist() {
  return PATIENT360_PREVISIT_MODEL.buildPreVisitModel({
    state,
    patientId: state.activePatientId,
    searchQuery: state.search
  }).checklist;
}

function renderPatientNextSteps({ patient, preVisitModel, upcoming, patientQuestions, decision, isGuardianView }) {
  const checklistItems = (preVisitModel.checklistItems || []).slice(0, 4);
  const nextItem = upcoming[0] || null;
  const questions = patientQuestions.slice(0, 3);
  return `
    <section class="section-band patient-now-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${isGuardianView ? "Co przygotować dla dziecka" : "Co mam zrobić teraz"}</p>
          <h2><i data-lucide="clipboard-check"></i>${isGuardianView ? "Najbliższe kroki rodzica" : "Najbliższe kroki przed wizytą"}</h2>
        </div>
        <button class="ghost-button" data-set-view="timeline"><i data-lucide="git-branch"></i>Oś historii</button>
      </div>
      <div class="patient-now-grid">
        <article>
          <span>Najbliższy kontakt</span>
          <strong>${escapeHtml(nextItem?.title || "Uzupełnij kontekst przed wizytą")}</strong>
          <p>${escapeHtml(nextItem ? `${formatDate(nextItem.date)} · ${nextItem.body}` : patient.patientSummary || "Brak zaplanowanego kontaktu w danych demo.")}</p>
          <div class="source-line">${sourceChips(nextItem?.sourceRefs || decision?.sourceRefs || [`patient:${patient.id}`])}</div>
        </article>
        <article>
          <span>${isGuardianView ? "Pytania rodzica" : "Co omówić"}</span>
          <ul class="plain-list compact-list">
            ${(questions.length ? questions : [{ question: patient.patientQuestion || "Brak pytań do omówienia.", sourceRefs: decision?.sourceRefs || [] }]).map((item) => `<li><i data-lucide="message-circle-question"></i><span>${escapeHtml(item.question)}</span></li>`).join("")}
          </ul>
        </article>
        <article>
          <span>Checklista</span>
          <ul class="plain-list compact-list">
            ${(checklistItems.length ? checklistItems : []).map((item) => `<li><i data-lucide="${escapeHtml(item.state.icon)}"></i><span>${escapeHtml(item.label)} - ${escapeHtml(item.state.label)}</span></li>`).join("") || `<li><i data-lucide="circle-help"></i><span>Brak checklisty w danych demo.</span></li>`}
          </ul>
        </article>
      </div>
    </section>
  `;
}

function renderPatientAppHome({ patient, preVisitModel, docs, observations, meds, patientQuestions, upcoming, timeline, caregiverModel }) {
  const checklistSummary = preVisitModel.checklistSummary || visitChecklistSummary(preVisitModel.checklist);
  const nextItem = upcoming[0] || null;
  const medConfirmCount = meds.filter((med) => {
    const actual = normalize(med.actualStatus || "");
    return actual.includes("niepotwierd") || actual.includes("deklarow") || actual.includes("otc");
  }).length;
  const activeScopes = caregiverModel?.activeScopes || [];
  const latestEvent = timeline[0] || null;
  const isGuardianView = patient.guardian && patient.guardian !== "brak";

  return `
    <section class="section-band patient-app-home">
      <div class="patient-app-hero">
        <div>
          <p class="eyebrow">${isGuardianView ? "Pacjent360 · widok rodzica" : "Pacjent360"}</p>
          <h2>${isGuardianView ? "Zdrowie dziecka w jednej mapie" : "Moje zdrowie w jednej mapie"}</h2>
          <p>
            ${escapeHtml(patient.name)} · ${formatAge(patient.birthDate)}. Ten widok porządkuje historię,
            przygotowanie do wizyty i następne kroki. Decyzje kliniczne zostają po stronie lekarza.
          </p>
          <div class="patient-app-actions" aria-label="Skróty aplikacji pacjenta">
            <button class="patient-app-tab active" data-set-view="patientPortal"><i data-lucide="home"></i>Start</button>
            <button class="patient-app-tab" data-set-view="timeline"><i data-lucide="git-branch"></i>Oś historii</button>
            <button class="patient-app-tab" data-set-view="medications"><i data-lucide="pill"></i>Leki</button>
            <button class="patient-app-tab" data-set-view="documents"><i data-lucide="files"></i>Dokumenty</button>
            <button class="patient-app-tab" data-set-view="consent"><i data-lucide="shield-check"></i>Udostępnianie</button>
          </div>
        </div>
        <article class="patient-today-card">
          <span>Dziś / najbliższy krok</span>
          <strong>${escapeHtml(nextItem?.title || "Uzupełnij kontekst przed wizytą")}</strong>
          <p>${escapeHtml(nextItem ? `${formatDate(nextItem.date)} · ${nextItem.body}` : "Zacznij od dokumentów, leków, wywiadu i pytań do lekarza.")}</p>
          <div class="source-line">${sourceChips(nextItem?.sourceRefs || [`patient:${patient.id}`])}</div>
        </article>
      </div>

      <div class="patient-app-grid">
        ${renderPatientAppTile({
          label: "Przygotowanie",
          title: checklistSummary.status.label,
          body: `${checklistSummary.ready} gotowe · ${checklistSummary.confirm} do potwierdzenia · ${PATIENT360_FORMAT.formatGaps(checklistSummary.missing)}`,
          icon: checklistSummary.status.icon,
          statusClass: checklistSummary.status.className,
          view: "patientPortal"
        })}
        ${renderPatientAppTile({
          label: "Oś historii",
          title: latestEvent ? latestEvent.title : "Brak zdarzeń",
          body: latestEvent ? `${formatDate(latestEvent.date)} · ${latestEvent.track}` : "Dodaj dokument lub wywiad demo, aby zbudować mapę.",
          icon: "map",
          statusClass: "info",
          view: "timeline"
        })}
        ${renderPatientAppTile({
          label: "Leki",
          title: medConfirmCount ? `${medConfirmCount} do potwierdzenia` : `${meds.length} na liście`,
          body: "Przepisane, faktycznie przyjmowane, OTC i suplementy jako pytania do lekarza.",
          icon: "pill",
          statusClass: medConfirmCount ? "pending" : "done",
          view: "medications"
        })}
        ${renderPatientAppTile({
          label: "Pytania",
          title: `${patientQuestions.length} do rozmowy`,
          body: "Pytania i braki danych są przygotowaniem do rozmowy, nie zaleceniem systemu.",
          icon: "message-circle-question",
          statusClass: patientQuestions.length ? "pending" : "done",
          view: "interview"
        })}
      </div>

      <div class="patient-app-secondary">
        <article class="patient-app-panel">
          <div class="patient-card-head">
            <span>Dokumenty i wyniki</span>
            <i data-lucide="folder-open"></i>
          </div>
          <strong>${PATIENT360_FORMAT.formatDocuments(docs.length)} · ${PATIENT360_FORMAT.formatResults(observations.length)}</strong>
          <p>Wszystko pozostaje źródłem do sprawdzenia. Wyniki pokazują zakres podany przez źródło, bez interpretacji klinicznej.</p>
          <button class="ghost-button" data-set-view="documents"><i data-lucide="files"></i>Otwórz dokumenty</button>
        </article>
        <article class="patient-app-panel">
          <div class="patient-card-head">
            <span>${isGuardianView ? "Dostęp do danych dziecka" : "Opiekun i rodzina"}</span>
            <i data-lucide="users-round"></i>
          </div>
          <strong>${activeScopes.length ? `${activeScopes.length} aktywne zakresy dostępu` : "Brak aktywnego dostępu"}</strong>
          <p>${isGuardianView ? "Widok pokazuje, kto ma dostęp do danych dziecka i w jakim zakresie." : "Pacjent decyduje, co opiekun widzi: leki, wizyty, dokumenty, zadania, obserwacje albo raport."}</p>
          <button class="ghost-button" data-set-view="consent"><i data-lucide="shield-check"></i>Zarządzaj zgodami</button>
        </article>
      </div>
    </section>
  `;
}

function renderPatientAppTile({ label, title, body, icon, statusClass, view }) {
  return `
    <button class="patient-app-tile ${escapeHtml(statusClass || "info")}" type="button" data-set-view="${escapeHtml(view)}">
      <span><i data-lucide="${escapeHtml(icon)}"></i>${escapeHtml(label)}</span>
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(body)}</small>
    </button>
  `;
}

function visitChecklistItemState(item = {}) {
  return PATIENT360_PREVISIT_MODEL.visitChecklistItemState(item);
}

function visitChecklistSummary(checklist) {
  return PATIENT360_PREVISIT_MODEL.visitChecklistSummary(checklist);
}

function preVisitStepState(kind, payload = {}) {
  return PATIENT360_PREVISIT_MODEL.preVisitStepState(kind, payload);
}

function renderPreVisitFlow(model) {
  const checklistSummary = model.checklistSummary;
  const steps = model.steps;
  return `
    <section class="section-band previsit-flow">
      <div class="section-head">
        <div>
          <p class="eyebrow">Przed wizytą</p>
          <h2><i data-lucide="route"></i> Przygotowanie krok po kroku</h2>
        </div>
        <span class="status-chip ${escapeHtml(checklistSummary.status.className)}"><i data-lucide="${escapeHtml(checklistSummary.status.icon)}"></i>${escapeHtml(checklistSummary.status.label)}</span>
      </div>
      <p class="record-body">${escapeHtml(model.safetyCopy)}</p>
      <div class="previsit-progress" aria-label="Postęp przygotowania do wizyty">
        <span style="width: ${checklistSummary.readyPercent}%"></span>
      </div>
      <div class="previsit-step-grid">
        ${steps.map((step) => renderPreVisitStep(step, step.state)).join("")}
      </div>
    </section>
  `;
}

function renderPreVisitStep(step, stateInfo) {
  return `
    <article class="previsit-step ${escapeHtml(stateInfo.key)}">
      <div class="previsit-step-head">
        <span><i data-lucide="${escapeHtml(step.icon)}"></i></span>
        <strong>${escapeHtml(step.title)}</strong>
      </div>
      <p class="previsit-step-status">${escapeHtml(stateInfo.label)}</p>
      <small>${escapeHtml(stateInfo.caption)}</small>
      <button class="small-action" ${step.openDialog ? `data-open-dialog="${escapeHtml(step.openDialog)}"` : `data-set-view="${escapeHtml(step.view)}"`}>
        ${escapeHtml(step.action)}
      </button>
    </article>
  `;
}

function renderVisitChecklist() {
  const model = PATIENT360_PREVISIT_MODEL.buildPreVisitModel({
    state,
    patientId: state.activePatientId,
    searchQuery: state.search
  });
  const checklist = model.checklist;
  if (!checklist) {
    return `
      <section class="section-band visit-checklist">
        <div class="section-head">
          <div>
            <p class="eyebrow">Przed wizytą</p>
            <h2><i data-lucide="list-checks"></i> Checklista przygotowania</h2>
          </div>
        </div>
        ${emptyState("Brak checklisty przygotowania w danych demo. Zacznij od dokumentu, wywiadu albo listy pytań.")}
        <div class="inline-actions">
          <button class="ghost-button" data-open-dialog="document"><i data-lucide="files"></i>Dodaj dokument</button>
          <button class="ghost-button" data-open-dialog="interview"><i data-lucide="messages-square"></i>Dodaj wywiad</button>
        </div>
      </section>
    `;
  }
  const summary = model.checklistSummary;

  return `
    <section class="section-band visit-checklist">
      <div class="section-head">
        <div>
          <p class="eyebrow">Przed wizytą</p>
            <h2><i data-lucide="list-checks"></i> Checklista przygotowania</h2>
          </div>
        <span class="status-chip ${escapeHtml(summary.status.className)}"><i data-lucide="${escapeHtml(summary.status.icon)}"></i>${escapeHtml(summary.status.label)}</span>
      </div>
      <div class="checklist-summary">
        <span><strong>${summary.ready}</strong> gotowe</span>
        <span><strong>${summary.confirm}</strong> do potwierdzenia</span>
        <span><strong>${summary.missing}</strong> brak danych</span>
      </div>
      <div class="checklist-items">
        ${model.checklistItems.map((item) => {
          const itemState = item.state;
          return `
          <article class="checklist-item ${escapeHtml(itemState.key)}">
            <span class="check-marker" aria-hidden="true"><i data-lucide="${escapeHtml(itemState.icon)}"></i></span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <div class="record-meta"><span class="status-chip ${statusClass(item.status)}">${escapeHtml(itemState.label)}</span></div>
              <p>${escapeHtml(itemState.description)}</p>
              <div class="source-line">${sourceChips(item.sourceRefs || [])}</div>
            </div>
          </article>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function patientPortalQuestions(decision) {
  return PATIENT360_PREVISIT_MODEL.patientPortalQuestions(state, state.activePatientId, decision);
}

function patientPortalUpcoming(decisions, timeline) {
  const decisionItems = decisions.map((decision) => ({
    title: decision.type,
    date: decision.contactDate,
    body: activePatient().patientQuestion || "Przygotuj pytania i dokumenty do rozmowy z lekarzem.",
    sourceRefs: [`decision:${decision.id}`, ...(decision.sourceRefs || [])]
  }));
  const timelineItems = timeline
    .filter((event) => event.track === "decyzje medyczne" || event.track === "konsultacje")
    .map((event) => ({
      title: event.title,
      date: event.date,
      body: event.description,
      sourceRefs: event.sourceRefs
    }));
  return [...decisionItems, ...timelineItems]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);
}

function renderPatientUpcomingCard(item) {
  return `
    <article class="patient-mini-card">
      <div class="patient-card-head">
        <span class="tag">${formatDate(item.date)}</span>
        <i data-lucide="calendar-clock"></i>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
      <div class="source-line">${sourceChips(item.sourceRefs)}</div>
    </article>
  `;
}

function renderPatientQuestionCard(item) {
  return `
    <article class="patient-mini-card question">
      <div class="patient-card-head">
        <span class="status-chip ${statusClass(item.status)}">${escapeHtml(personaStatus(item.status, "patient"))}</span>
        <i data-lucide="message-circle-question"></i>
      </div>
      <strong>${escapeHtml(item.question)}</strong>
      <div class="source-line">${sourceChips(item.sourceRefs)}</div>
    </article>
  `;
}

function renderPatientResultRow(observation) {
  const latest = latestValue(observation);
  return `
    <article class="patient-result-row">
      <div>
        <strong>${escapeHtml(observation.name)}</strong>
        <span>${escapeHtml(observation.type)} • ${formatDate(latest?.date)}</span>
      </div>
      <div>
        <strong>${escapeHtml(latest?.value ?? "brak")} ${escapeHtml(observation.unit)}</strong>
        <span class="status-chip ${observationStatusClass(observation)}">${escapeHtml(observationStatus(observation))}</span>
      </div>
      <div class="source-line">${sourceChips(latest?.sourceRefs || [`observation:${observation.id}`])}</div>
    </article>
  `;
}

function renderPatientMedicationCard(med) {
  return `
    <article class="patient-mini-card">
      <div class="patient-card-head">
        <span class="tag">${escapeHtml(med.status)}</span>
        <i data-lucide="pill"></i>
      </div>
      <strong>${escapeHtml(med.name)}</strong>
      <p>${escapeHtml(med.dose)} • ${escapeHtml(med.frequency)}<br>${escapeHtml(med.actualStatus)}</p>
      <div class="source-line">${sourceChips(med.sourceRefs)}</div>
    </article>
  `;
}

function renderPatientDocumentCard(doc) {
  return `
    <article class="patient-mini-card">
      <div class="patient-card-head">
        <span class="tag">${escapeHtml(doc.type)}</span>
        <span>${formatDate(doc.date)}</span>
      </div>
      <strong>${escapeHtml(doc.title)}</strong>
      <p>${escapeHtml(doc.summary)}</p>
      <div class="source-line">${sourceChips(`doc:${doc.id}`)}</div>
    </article>
  `;
}

function renderPatientTimelineCard(event) {
  return `
    <article class="patient-mini-card">
      <div class="patient-card-head">
        <span class="tag">${formatDate(event.date)}</span>
        <span>${escapeHtml(event.track)}</span>
      </div>
      <strong>${escapeHtml(event.title)}</strong>
      <p>${escapeHtml(event.description)}</p>
      <div class="source-line">${sourceChips(event.sourceRefs)}</div>
    </article>
  `;
}

function renderInterviewSummaryPanel(interviews, role = activeRole()) {
  const patient = activePatient();
  const latest = interviews[0] || null;
  const meds = byPatient(state.medications).slice(0, 5);
  const decision = activeDecision();
  const refs = compactSourceRefs([
    latest ? `interview:${latest.id}` : null,
    latest ? `transcript:${latest.id}` : null,
    ...(latest?.sourceRefs || []),
    ...(decision?.sourceRefs || [])
  ]);
  const isCaregiver = role === "caregiver";
  const answerKeys = ["baseline", "current", "function", "medications", "family"];

  return `
    <section class="section-band interview-summary-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${isCaregiver ? "Gotowy wywiad" : "Opis rozmowy"}</p>
          <h2><i data-lucide="messages-square"></i>${isCaregiver ? "Co wiadomo z rozmowy i obserwacji" : "Co zostało zebrane przed wizytą"}</h2>
        </div>
        <button class="ghost-button" data-set-view="medications"><i data-lucide="pill"></i>Leki</button>
      </div>
      <p class="record-body">
        ${escapeHtml(isCaregiver
          ? "Opiekun widzi gotowy opis wywiadu osoby pod opieką w zakresie aktywnej zgody. To źródło rozmowy z lekarzem, nie wynik badania."
          : "Pacjent widzi prosty opis rozmowy, pytania do omówienia oraz listę leków zebraną z dokumentów i wywiadu. System nie zastępuje rozmowy z lekarzem.")}
      </p>
      <div class="patient-now-grid">
        <article>
          <span>Osoba, której dotyczy wywiad</span>
          <strong>${escapeHtml(patient.name)}</strong>
          <p>${escapeHtml(latest ? `${formatDate(latest.date)} · rozmówca: ${latest.speaker}` : "Brak zapisanego wywiadu w danych demo.")}</p>
        </article>
        <article>
          <span>Cel rozmowy</span>
          <strong>${escapeHtml(decision?.clinicalQuestion || patient.currentProblem || "Przygotowanie kontekstu")}</strong>
          <p>${escapeHtml(patient.patientQuestion || "Brak pytania pacjenta w danych demo.")}</p>
        </article>
        <article>
          <span>Leki w kontekście rozmowy</span>
          <ul class="plain-list compact-list">
            ${meds.map((med) => `<li><i data-lucide="pill"></i><span>${escapeHtml(med.name)} · ${escapeHtml(med.actualStatus || med.status || "status do sprawdzenia")}</span></li>`).join("") || `<li><i data-lucide="circle-help"></i><span>Brak leków w danych demo.</span></li>`}
          </ul>
        </article>
      </div>
      <div class="answer-grid">
        ${answerKeys.map((key) => `<div><strong>${escapeHtml(INTERVIEW_SCRIPT.find((section) => section.key === key)?.title || key)}</strong><p>${escapeHtml(latest?.answers?.[key] || "Brak odpowiedzi w tej sekcji.")}</p></div>`).join("")}
      </div>
      <div class="source-line">${sourceChips(refs)}</div>
    </section>
  `;
}

function renderInterview() {
  const interviews = byPatient(state.interviews).filter(matchesSearch).sort((a, b) => new Date(b.date) - new Date(a.date));
  const role = activeRole();
  if (role !== "doctor") {
    const isCaregiver = role === "caregiver";
    return `
      ${pageHeader(
        isCaregiver ? "Gotowy wywiad osoby pod opieką" : "Opis wywiadu i rozmowy",
        isCaregiver
          ? "Widok opiekuna pokazuje zebrany wywiad w zakresie udzielonego dostępu. Informacje z rozmowy są źródłem, nie faktem laboratoryjnym."
          : "Widok pacjenta pokazuje opis rozmowy, pytania do omówienia, leki i źródła w prostym języku.",
        "interview"
      )}
      <section class="safety-note">
        <i data-lucide="shield-alert"></i>
        <span>Wywiad porządkuje relację pacjenta, opiekuna lub rodziny. Odpowiedzi są źródłem typu wywiad i wymagają rozmowy z lekarzem.</span>
      </section>
      ${renderInterviewSummaryPanel(interviews, role)}
      <section class="section-band">
        <div class="section-head">
          <div>
            <p class="eyebrow">Źródło: wywiad / transkrypcja</p>
            <h2>Zapis rozmowy</h2>
          </div>
        </div>
        <div class="record-list">
          ${interviews.map(renderInterviewCard).join("") || emptyState("Brak wywiadów dla wybranego pacjenta.")}
        </div>
      </section>
    `;
  }

  return `
    ${pageHeader("Wywiad pacjenta i źródła rozmowy", "Scenariusz rozmowy kontekstowej. Służy do zebrania pytań, źródeł i obserwacji przed rozmową z lekarzem.", "interview")}
    <section class="safety-note">
      <i data-lucide="shield-alert"></i>
      <span>Wywiad porządkuje relację pacjenta, opiekuna lub rodziny. Odpowiedzi są źródłem typu wywiad i wymagają interpretacji przez lekarza.</span>
    </section>
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Scenariusz rozmowy</p>
          <h2>Pytania prowadzące</h2>
        </div>
      </div>
      <div class="script-grid">
        ${INTERVIEW_SCRIPT.map(renderScriptSection).join("")}
      </div>
    </section>
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Źródło: wywiad / transkrypcja</p>
          <h2>Zebrane rozmowy</h2>
        </div>
      </div>
      <div class="record-list">
        ${interviews.map(renderInterviewCard).join("") || emptyState("Brak wywiadów dla wybranego pacjenta.")}
      </div>
    </section>
  `;
}

function renderScriptSection(section) {
  return `
    <article class="script-card">
      <h3>${escapeHtml(section.title)}</h3>
      <ul class="plain-list">
        ${section.questions.map((question) => `<li><i data-lucide="message-circle-question"></i><span>${escapeHtml(question)}</span></li>`).join("")}
      </ul>
    </article>
  `;
}

function renderInterviewCard(interview) {
  return `
    <article class="record interview-record">
      <div class="record-head">
        <div>
          <p class="record-title">${escapeHtml(interview.scenario)}</p>
          <div class="record-meta">
            <span class="tag">${formatDate(interview.date)}</span>
            <span class="tag">rozmówca: ${escapeHtml(interview.speaker)}</span>
            <span class="status-chip ${statusClass(interview.confidence)}">pewność: ${escapeHtml(interview.confidence)}</span>
          </div>
        </div>
      </div>
      <div class="answer-grid">
        ${INTERVIEW_SCRIPT.map((section) => `<div><strong>${escapeHtml(section.title)}</strong><p>${escapeHtml(interview.answers?.[section.key] || "Brak odpowiedzi.")}</p></div>`).join("")}
      </div>
      <details>
        <summary>Transkrypcja rozmowy</summary>
        <p class="record-body">${escapeHtml(interview.transcript || "Brak transkrypcji.")}</p>
      </details>
      <div class="source-line">${sourceChips([`interview:${interview.id}`, `transcript:${interview.id}`, ...(interview.sourceRefs || [])])}</div>
    </article>
  `;
}

function renderDocuments() {
  const documents = byPatient(state.documents).filter(matchesSearch).sort((a, b) => new Date(b.date) - new Date(a.date));
  return `
    ${pageHeader("Rejestr dokumentów", "Dokumenty są jednym z typów źródła. Wywiad i transkrypcja są oddzielnymi źródłami o innym poziomie pewności.", "document")}
    <section class="section-band flush">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Dokument</th><th>Data</th><th>Placówka</th><th>Jakość</th><th>Status</th><th>Zaufanie</th></tr></thead>
          <tbody>
            ${documents.map((doc) => `
              <tr>
                <td><strong>${escapeHtml(doc.title)}</strong><div class="record-meta"><span class="tag">${escapeHtml(doc.type)}</span>${sourceChips(`doc:${doc.id}`)}</div></td>
                <td>${formatDate(doc.date)}<br><span class="muted">zdarzenie: ${formatDate(doc.eventDate)}</span></td>
                <td>${escapeHtml(doc.facility)}<br><span class="muted">${escapeHtml(doc.author)}</span></td>
                <td>${escapeHtml(doc.quality)}</td>
                <td><span class="status-chip ${statusClass(doc.extractionStatus)}">${escapeHtml(doc.extractionStatus)}</span></td>
                <td><span class="status-chip ${statusClass(doc.trust)}">${escapeHtml(doc.trust)}</span></td>
              </tr>
            `).join("") || `<tr><td colspan="6">${emptyState("Brak dokumentów dla wyszukiwania.")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTimeline() {
  const role = activeRole();
  return `
    ${pageHeader("Oś historii pacjenta", "Publiczne demo pokazuje uproszczony skrót historii: wizyty, badania, leki, wywiady, dokumenty, zgody i pytania DITL. Pełna mapa wielowarstwowa jest kierunkiem rozwoju.", "git-branch")}
    ${renderTimelineNarrator(role)}
    ${renderPatientMap360({ persona: role })}
  `;
}

function renderTimelineNarrator(role = activeRole()) {
  const meta = activeRoleMeta(role);
  const narrative = activeRoleNarrative(role);
  const sections = activeRoleSections(role).slice(0, 4);
  const events = byPatient(state.timelineEvents).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = events[0];
  const last = events[events.length - 1];
  return `
    <section class="section-band timeline-narrator">
      <div>
        <p class="eyebrow"><i data-lucide="${escapeHtml(meta.icon)}"></i>Film życia · ${escapeHtml(meta.label)}</p>
        <h2>${escapeHtml(narrative?.mapTitle || narrative?.title || "Ta sama historia, inna soczewka")}</h2>
        <p>${escapeHtml(narrative?.mapSummary || narrative?.summary || "Oś historii porządkuje zdarzenia w czasie i pokazuje, co warto omówić w kolejnym kontakcie.")}</p>
      </div>
      <div class="timeline-narrator-facts">
        <article>
          <span>Odcinek</span>
          <strong>${events.length ? `${formatDate(first.date)} - ${formatDate(last.date)}` : "Brak zdarzeń"}</strong>
        </article>
        <article>
          <span>W tej perspektywie widzisz</span>
          <strong>${escapeHtml(sections.length ? sections.join(" · ") : "historię, pytania i źródła")}</strong>
        </article>
      </div>
    </section>
  `;
}

function stateForMapPersona(persona = activeRole()) {
  if (persona !== "caregiver") return state;
  const model = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  if (!model.activeScopes.length) {
    return {
      ...state,
      timelineEvents: state.timelineEvents.filter((event) => event.patientId !== state.activePatientId),
      stageSummaries: (state.stageSummaries || []).filter((item) => item.patientId !== state.activePatientId)
    };
  }
  const allowedAreas = new Set(model.activeAreas || []);
  const trackAreaMap = {
    leki: "medications",
    konsultacje: "visits",
    "decyzje medyczne": "visits",
    badania: "results",
    "kontekst medyczny": "documents",
    objawy: "observations",
    "obserwacje z wywiadu": "observations",
    funkcjonowanie: "observations",
    hospitalizacje: "documents"
  };
  const timelineEvents = state.timelineEvents.filter((event) => {
    if (event.patientId !== state.activePatientId) return true;
    const area = trackAreaMap[event.track] || "documents";
    return allowedAreas.has(area) || (allowedAreas.has("tasks") && ["decyzje medyczne", "konsultacje"].includes(event.track));
  });
  const stageSummaries = (state.stageSummaries || []).filter((item) => item.patientId !== state.activePatientId || timelineEvents.some((event) => event.patientId === item.patientId && event.stage === item.stage));
  return { ...state, timelineEvents, stageSummaries };
}

function renderPatientMap360({ persona = "doctor", embedded = false } = {}) {
  const mapState = stateForMapPersona(persona);
  const mapPersona = persona === "caregiver" ? "patient" : persona;
  const mapModel = PATIENT360_MAP_MODEL.buildPatientMapModel({
    state: mapState,
    patientId: state.activePatientId,
    periodId: state.timelinePeriod,
    detailId: state.timelineDetail,
    zoom: state.timelineZoom,
    selectedEventId: state.selectedTimelineEventId,
    trackFilter: state.timelineFilterTrack,
    searchQuery: state.search,
    today: todayInputValue(),
    persona: mapPersona,
    embedded,
    periods: TIMELINE_PERIODS,
    details: TIMELINE_DETAILS,
    zoomConfig: TIMELINE_ZOOM
  });
  return PATIENT360_MAP_VIEW.render({
    mapModel,
    embedded,
    periods: TIMELINE_PERIODS,
    details: TIMELINE_DETAILS,
    zoomConfig: TIMELINE_ZOOM,
    stageSummaries: (mapState.stageSummaries || []).filter((item) => item.patientId === state.activePatientId),
    sourceChips
  });
}

function renderTimelineInspector(event, persona, events) {
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
  return `Ten odcinek łączy ${PATIENT360_FORMAT.formatEvents(sorted.length)} od ${formatDate(first.date)} do ${formatDate(last.date)}. Najwięcej wpisów dotyczy toru „${leadingTrack?.track || "brak danych"}”. Przewiń linię, oddal do całej historii albo wybierz jeden tor, aby zobaczyć szczegóły i źródła.`;
}

function activeTimelinePeriod() {
  return TIMELINE_PERIODS.find((period) => period.id === state.timelinePeriod) || TIMELINE_PERIODS[0];
}

function activeTimelineDetail() {
  return TIMELINE_DETAILS.find((detail) => detail.id === state.timelineDetail) || TIMELINE_DETAILS[1];
}

function activeTimelineZoom() {
  return normalizeTimelineZoom(state.timelineZoom);
}

function validTimelineEventId(id, patientId, events = state.timelineEvents) {
  return Boolean(id && Array.isArray(events) && events.some((event) => event.id === id && event.patientId === patientId));
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

function timelineEpisodeForEvent(event) {
  if (!event?.episodeId) return null;
  return byPatient(state.timelineEpisodes || []).find((episode) => episode.id === event.episodeId) || null;
}

function timelineEpisodeIdForDate(value) {
  const date = parseDateOnly(value);
  if (!date) return null;
  const episode = byPatient(state.timelineEpisodes || []).find((item) => {
    const start = parseDateOnly(item.startDate);
    const end = parseDateOnly(item.endDate);
    return start && end && date >= start && date <= end;
  });
  return episode?.id || null;
}

function selectedTimelineEvent(events) {
  if (!events.length) return null;
  return events.find((event) => event.id === state.selectedTimelineEventId) || events.find((event) => !event.virtual) || events[0];
}

function refsOverlap(left = [], right = []) {
  const leftList = Array.isArray(left) ? left : [left].filter(Boolean);
  const rightList = Array.isArray(right) ? right : [right].filter(Boolean);
  const rightSet = new Set(rightList);
  return leftList.some((ref) => rightSet.has(ref));
}

function timelineEventQuestions(event) {
  if (!event || event.virtual) return [];
  const refs = Array.isArray(event.sourceRefs) ? event.sourceRefs : [event.sourceRefs].filter(Boolean);
  const flagQuestions = byPatient(state.flags)
    .filter((flag) => refsOverlap(refs, flag.sourceRefs || []))
    .map((flag) => ({
      id: `flag-${flag.id}`,
      label: flag.category,
      question: flag.question,
      status: flag.status,
      sourceRefs: flag.sourceRefs || []
    }));
  const decisionQuestions = byPatient(state.decisionContexts).flatMap((decision) =>
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

function timelineEventRelations(event, events) {
  if (!event || event.virtual) return [];
  const eventMap = new Map(events.map((item) => [item.id, item]));
  return byPatient(state.timelineRelations || [])
    .filter((relation) => relation.fromEventId === event.id || relation.toEventId === event.id)
    .map((relation) => {
      const otherId = relation.fromEventId === event.id ? relation.toEventId : relation.fromEventId;
      return { ...relation, otherEvent: eventMap.get(otherId) || state.timelineEvents.find((item) => item.id === otherId) };
    });
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

function timelineRange(events, patient, periodId) {
  const end = clampEndDate(events);
  if (periodId === "life") {
    return {
      start: patient.birthDate || events[0]?.date || end,
      end,
      label: "od urodzenia do dziś"
    };
  }
  if (periodId === "year") {
    return {
      start: addMonths(end, -12),
      end,
      label: "ostatnie 12 miesięcy"
    };
  }
  return {
    start: events[0]?.date || addMonths(end, -1),
    end,
    label: "aktywny epizod"
  };
}

function isTimelineEventInRange(event, range) {
  const eventDate = parseDateOnly(event.date);
  const startDate = parseDateOnly(range.start);
  const endDate = parseDateOnly(range.end);
  if (!eventDate || !startDate || !endDate) return true;
  return eventDate >= startDate && eventDate <= endDate;
}

function timelineDisplayEvents(events, patient, range, periodId) {
  if (periodId !== "life" || normalize(state.search).trim()) return events;
  return [
    {
      id: "anchor-birth",
      date: patient.birthDate,
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

function renderTimelineControls(period, detail, zoom) {
  return `
    <div class="temporal-controls">
      <div class="timeline-control-group">
        <span>Zakres czasu</span>
        <div class="segmented" role="group" aria-label="Zakres czasu mapy pacjenta">
          ${TIMELINE_PERIODS.map((item) => `<button data-timeline-period="${escapeHtml(item.id)}" class="${period.id === item.id ? "active" : ""}" title="${escapeHtml(item.description)}">${escapeHtml(item.label)}</button>`).join("")}
        </div>
      </div>
      <div class="timeline-control-group">
        <span>Poziom widoku</span>
        <div class="segmented" role="group" aria-label="Poziom szczegółowości mapy pacjenta">
          ${TIMELINE_DETAILS.map((item) => `<button data-timeline-detail="${escapeHtml(item.id)}" class="${detail.id === item.id ? "active" : ""}" title="${escapeHtml(item.description)}">${escapeHtml(item.label)}</button>`).join("")}
        </div>
      </div>
      <div class="timeline-control-group zoom-group">
        <span>Zoom mapy</span>
        <div class="temporal-zoom-control">
          <button class="icon-button compact" data-timeline-zoom-step="${escapeHtml(-TIMELINE_ZOOM.step)}" title="Oddal mapę" aria-label="Oddal mapę pacjenta"><i data-lucide="zoom-out"></i></button>
          <input type="range" min="${TIMELINE_ZOOM.min}" max="${TIMELINE_ZOOM.max}" step="0.01" value="${zoom}" data-timeline-zoom-range aria-label="Zoom mapy pacjenta">
          <button class="icon-button compact" data-timeline-zoom-step="${escapeHtml(TIMELINE_ZOOM.step)}" title="Przybliż mapę" aria-label="Przybliż mapę pacjenta"><i data-lucide="zoom-in"></i></button>
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
      ${activeTracks.map(({ track, count }) => {
        return `
          <span class="active">
            <i data-lucide="${escapeHtml(timelineTrackIcon(track))}"></i>
            ${escapeHtml(track)}
            <strong>${count}</strong>
          </span>
        `;
      }).join("")}
    </div>
    ${hiddenTracks ? `<p class="temporal-note">Ukryto ${formatCount(hiddenTracks, "pusty tor", "puste tory", "pustych torów")} w tym widoku.</p>` : ""}
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

function renderTimelineEvent(event, index, detailId = "standard", zoom = 0.9, selectedId = "", persona = "doctor") {
  const trackIndex = Math.max(TRACKS.indexOf(event.track), 0);
  const side = index % 2 === 0 ? "above" : "below";
  const branchDepth = Math.round((82 + (trackIndex % 4) * 18) * (0.72 + zoom * 0.28));
  const eventLeft = Number.isFinite(event.positionPercent) ? event.positionPercent : 0;
  const isOverview = detailId === "overview";
  const eventDate = parseDateOnly(event.date);
  const todayDate = parseDateOnly(todayInputValue());
  const isFuture = eventDate && todayDate ? eventDate >= todayDate : false;
  const status = timelineEventStatus(event);
  const statusMeta = timelineStatusMeta(status);
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

function renderMedications() {
  const meds = byPatient(state.medications).filter(matchesSearch);
  const allergies = byPatient(state.allergies);
  return `
    ${pageHeader("Historia leków", "Historia lekowa pokazuje nie tylko recepty, ale realne przyjmowanie, leki bez recepty (OTC), odstawienia, objawy po zmianie i pytania do lekarza.", "medication")}
    <div class="metric-grid">
      ${metric("Leki aktywne", meds.filter((med) => med.status === "aktywny").length, "z dokumentów i wywiadu", "pill")}
      ${metric("OTC / suplementy", meds.filter((med) => med.status.includes("OTC")).length, "do potwierdzenia w wywiadzie", "shopping-bag")}
      ${metric("Niepotwierdzone", meds.filter((med) => normalize(med.actualStatus).includes("niepotwierd")).length, "realne przyjmowanie", "circle-help")}
      ${metric("Alergie", allergies.length, "oddzielne od działań niepożądanych", "shield-alert")}
    </div>
    <section class="section-band">
      <div class="record-list">
        ${meds.map(renderMedicationCard).join("") || emptyState("Brak leków dla wyszukiwania.")}
      </div>
    </section>
    <section class="section-band">
      <div class="section-head"><div><p class="eyebrow">Alergie i nietolerancje</p><h2>Do odróżnienia od działań niepożądanych</h2></div></div>
      <div class="record-list">
        ${allergies.map((allergy) => `
          <article class="record">
            <p class="record-title">${escapeHtml(allergy.substance)}</p>
            <p class="record-body">${escapeHtml(allergy.reaction)}</p>
            <div class="record-meta"><span class="tag">pewność: ${escapeHtml(allergy.certainty)}</span>${sourceChips(allergy.sourceRefs)}</div>
          </article>
        `).join("") || emptyState("Brak alergii w danych.")}
      </div>
    </section>
  `;
}

function renderMedicationCard(med) {
  return `
    <article class="record medication-story">
      <div class="record-head">
        <div>
          <p class="record-title">${escapeHtml(med.name)} <span class="muted">${escapeHtml(med.dose)}</span></p>
          <div class="record-meta">
            <span class="status-chip ${statusClass(med.status)}">${escapeHtml(med.status)}</span>
            <span class="tag">${escapeHtml(med.frequency)}</span>
            <span class="tag">realnie: ${escapeHtml(med.actualStatus)}</span>
          </div>
        </div>
      </div>
      <div class="story-grid">
        <div><strong>Historia</strong><p>${escapeHtml(med.story)}</p></div>
        <div><strong>Objawy po zmianie</strong><p>${escapeHtml(med.symptomLink || "Brak zgłoszonego związku czasowego.")}</p></div>
        <div><strong>Pytanie do lekarza</strong><p>${escapeHtml(med.question)}</p></div>
      </div>
      <div class="source-line">${sourceChips(med.sourceRefs)}</div>
    </article>
  `;
}

function renderObservations() {
  const observations = byPatient(state.observations).filter(matchesSearch);
  return `
    ${pageHeader("Wyniki i zakresy podane przez źródła", "Widok pokazuje wartości oraz zakresy przekazane przez źródło danych. Nie ocenia klinicznie wyniku i nie rozstrzyga jego znaczenia.", "observation")}
    <section class="section-band flush">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Parametr</th><th>Ostatni wynik</th><th>Trend</th><th>Zakres podany przez źródło</th><th>Źródło</th></tr></thead>
          <tbody>
            ${observations.map((obs) => {
              const latest = latestValue(obs);
              return `
                <tr>
                  <td><strong>${escapeHtml(obs.name)}</strong><br><span class="muted">${escapeHtml(obs.type)}</span></td>
                  <td>${escapeHtml(latest?.value ?? "brak")} ${escapeHtml(obs.unit)}<br><span class="muted">${formatDate(latest?.date)}</span></td>
                  <td>${renderSparkline(obs)}<br><span class="status-chip ${observationStatusClass(obs)}">${escapeHtml(observationStatus(obs))}</span></td>
                  <td>${escapeHtml(observationRangeLabel(obs))}<br><span class="muted">Bez oceny klinicznej.</span></td>
                  <td>${sourceChips(latest?.sourceRefs || [`observation:${obs.id}`])}</td>
                </tr>
              `;
            }).join("") || `<tr><td colspan="5">${emptyState("Brak wyników dla wyszukiwania.")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSparkline(observation) {
  const values = observation.values.map((point) => Number(point.value));
  if (values.length < 3) return `<span class="muted">Za mało punktów na trend</span>`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 112 + 4;
      const y = 30 - ((value - min) / span) * 24;
      return `${x},${y}`;
    })
    .join(" ");
  return `<svg class="sparkline" viewBox="0 0 120 34" role="img" aria-label="Trend ${escapeHtml(observation.name)}"><polyline points="${points}"></polyline></svg>`;
}

function renderRisks() {
  const flags = byPatient(state.flags).filter(matchesSearch);
  const grouped = ["red", "amber", "green", "blue"];
  return `
    ${pageHeader("Pytania i luki DITL", "Ten widok jest skrótem do pytań i luk w kontekście. Nie jest gotową oceną ani decyzją po stronie systemu i nie zastępuje lekarza.", "flag")}
    <section class="flag-legend">
      ${grouped.map((color) => `<span class="flag-badge ${FLAG_META[color].className}"><i data-lucide="${escapeHtml(FLAG_META[color].icon)}"></i>${escapeHtml(FLAG_META[color].label)}</span>`).join("")}
    </section>
    <div class="flag-grid">
      ${grouped.map((color) => renderFlagColumn(color, flags.filter((flag) => flag.color === color))).join("")}
    </div>
  `;
}

function renderFlagColumn(color, flags) {
  const meta = FLAG_META[color];
  return `
    <section class="section-band flag-column">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(meta.label)}</p>
          <h2><i data-lucide="${escapeHtml(meta.icon)}"></i>${escapeHtml(meta.label)}</h2>
        </div>
        <span class="tag">${flags.length}</span>
      </div>
      <div class="record-list">
        ${flags.map(renderFlagCard).join("") || emptyState("Brak sygnałów w tej kategorii.")}
      </div>
    </section>
  `;
}

function renderFlagCard(flag) {
  const meta = FLAG_META[flag.color] || FLAG_META.blue;
  return `
    <article class="record flag-card ${meta.className}">
      <div class="record-head">
        <div>
          <p class="record-title">${escapeHtml(flag.category)}</p>
          <div class="record-meta"><span class="status-chip ${statusClass(flag.status)}">${escapeHtml(flag.status)}</span></div>
        </div>
      </div>
      <p class="record-body"><strong>Pytanie:</strong> ${escapeHtml(flag.question)}</p>
      <p class="record-body"><strong>Dane:</strong> ${escapeHtml(flag.evidence)}</p>
      <div class="status-actions">
        ${DITL_STATUSES.map((status) => `<button class="small-action ${flag.status === status ? "selected" : ""}" data-ditl-type="flag" data-ditl-id="${escapeHtml(flag.id)}" data-ditl-status="${escapeHtml(status)}">${escapeHtml(status)}</button>`).join("")}
      </div>
      ${renderDitlStatusNotice()}
      <div class="source-line">${sourceChips(flag.sourceRefs)}</div>
    </article>
  `;
}

function renderReportsV2() {
  const reportTypes = [
    ["context", "Podsumowanie kontekstu"]
  ];
  const caseStudy = activeCaseStudy();
  return `
    <div class="page-intro">
      <div>
        <p class="eyebrow">Podsumowanie</p>
        <h1>Podsumowanie kontekstu</h1>
        <p>Krótki podgląd demonstracyjny, dopasowany do fikcyjnego scenariusza demonstracyjnego: ${escapeHtml(caseStudy.label)}.</p>
      </div>
      <div class="report-actions">
        <button class="primary-button" data-generate-report><i data-lucide="sparkles"></i>Utwórz podgląd demo</button>
        <button class="ghost-button" data-print><i data-lucide="printer"></i>Podgląd wydruku demo</button>
      </div>
    </div>
    ${renderSafetyNote("Raport jest publicznym podglądem demo. Scenariusz demonstracyjny i dane pacjenta są fikcyjne; nie używaj tu realnych danych pacjenta.")}
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Przypadki demonstracyjne</p>
          <h2>Wybierz wersję podsumowania</h2>
        </div>
      </div>
      <div class="case-study-grid">
        ${REPORT_CASE_STUDIES.map(renderCaseStudyButton).join("")}
      </div>
      <p class="record-body case-study-disclaimer">Przypadki demonstracyjne są fikcyjnymi kompozytami projektowymi. Nie są oparte na historii choroby żadnej konkretnej osoby ani rodziny. Soczewki specjalistyczne są planowane do walidacji i nie są częścią obecnego demo.</p>
    </section>
    <section class="section-band">
      <div class="filter-row">
        <div class="segmented">
          ${reportTypes.map(([id, label]) => `<button data-report-type="${escapeHtml(id)}" class="${state.reportType === id ? "active" : ""}">${escapeHtml(label)}</button>`).join("")}
        </div>
      </div>
      <div class="report-preview context-report" data-demo-watermark="${escapeHtml(REPORT_DEMO_WATERMARK)}">
        ${renderOnePagerV2(state.reportType)}
      </div>
    </section>
  `;
}

function renderCaseStudyButton(caseStudy) {
  const active = caseStudy.id === state.activeCaseStudy;
  return `
    <button class="case-study-option ${active ? "active" : ""}" data-case-study="${escapeHtml(caseStudy.id)}">
      <span>${escapeHtml(caseStudy.label)}</span>
      <strong>${escapeHtml(caseStudy.decision)}</strong>
    </button>
  `;
}

function renderOnePagerV2(type) {
  const patient = activePatient();
  const decision = activeDecision();
  const caseStudy = activeCaseStudy();
  const patientQuestions = [
    ...(decision?.ditlQuestions || []),
    ...byPatient(state.flags).filter((flag) => flag.color === "blue" || flag.color === "red").map(flagToQuestion)
  ];
  const questions = [
    ...caseStudy.questions.map((question, index) => ({
      id: `case-${caseStudy.id}-${index}`,
      question,
      status: "do wyjaśnienia",
      sourceRefs: caseStudy.flags[index]?.sourceRefs || decision?.sourceRefs || []
    })),
    ...patientQuestions
  ].slice(0, 7);

  return `
    <article class="report-section">
      ${renderReportDemoBadge(caseStudy.label)}
      <p class="eyebrow">Status: DITL, do oceny lekarza</p>
      <h2>${escapeHtml(typeLabel(type))} / ${escapeHtml(caseStudy.label)}</h2>
      <p class="record-body">${escapeHtml(patient.name)}, ${formatAge(patient.birthDate)}. Scenariusz demonstracyjny: ${escapeHtml(caseStudy.decision)}</p>
    </article>
    <article class="report-section case-study-summary">
      <h3>Scenariusz demonstracyjny</h3>
      <p class="record-body">${escapeHtml(caseStudy.lens)}</p>
      <ul class="plain-list">
        <li><i data-lucide="user-round-check"></i><span><strong>Profil:</strong> ${escapeHtml(caseStudy.patientSnapshot)}</span></li>
        <li><i data-lucide="trending-up"></i><span><strong>Największa zmiana:</strong> ${escapeHtml(caseStudy.keyChange)}</span></li>
        <li><i data-lucide="clipboard-check"></i><span><strong>Kontekst decyzji:</strong> ${escapeHtml(caseStudy.decision)}</span></li>
      </ul>
    </article>
    <article class="report-section">
      <h3>Kontekst w 90 sekund</h3>
      <ul class="plain-list">
        <li><i data-lucide="user-round-check"></i><span><strong>Stan bazowy:</strong> ${escapeHtml(patient.baselineState)}</span></li>
        <li><i data-lucide="activity"></i><span><strong>Aktualny problem:</strong> ${escapeHtml(patient.currentProblem)}</span></li>
        <li><i data-lucide="trending-up"></i><span><strong>Największa zmiana:</strong> ${escapeHtml(patient.biggestChange)}</span></li>
      </ul>
    </article>
    <article class="report-section">
      <h3>Znane / Nieznane / Niepewne / Do weryfikacji</h3>
      <div class="known-grid">
        ${renderCaseKnownGroup("Znane", caseStudy.known, "known")}
        ${renderCaseKnownGroup("Nieznane", caseStudy.unknown, "unknown")}
        ${renderCaseKnownGroup("Niepewne", caseStudy.uncertain, "uncertain")}
        ${renderCaseKnownGroup("Do weryfikacji", caseStudy.verify, "verify")}
      </div>
    </article>
    <article class="report-section alert">
      <h3>Pytania scenariusza demonstracyjnego</h3>
      <p class="record-body">Fikcyjny przykład poglądowy: poniższe pytania pokazują format podsumowania, nie dane aktywnego pacjenta.</p>
      <ul class="plain-list">
        ${caseStudy.flags.map((flag) => `<li><i data-lucide="${escapeHtml(FLAG_META[flag.color].icon)}"></i><span><strong>${escapeHtml(flag.title)}:</strong> ${escapeHtml(flag.question)} ${sourceChips(flag.sourceRefs)}</span></li>`).join("")}
      </ul>
    </article>
    <article class="report-section">
      <h3>Pytania DITL do lekarza</h3>
      <ol class="question-list">
        ${questions.map((question) => `<li>${escapeHtml(question.question)} <span class="status-chip ${statusClass(question.status)}">${escapeHtml(question.status)}</span> ${sourceChips(question.sourceRefs)}</li>`).join("")}
      </ol>
    </article>
    <article class="report-section">
      <h3>Uczciwe ograniczenie</h3>
      <p class="record-body">Raport porządkuje kontekst, źródła i pytania. Decyzje pozostają po stronie lekarza.</p>
    </article>
  `;
}

function renderCaseKnownGroup(title, items, className) {
  return `
    <div class="known-card ${className}">
      <strong>${escapeHtml(title)}</strong>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function typeLabel(type) {
  return {
    context: "Pacjent360™: raport kontekstowy",
    internist: "Internista",
    cardiology: "Kardiolog",
    preop: "Przed zabiegiem",
    neurology: "Neurolog",
    patient: "Pacjent"
  }[type] || "Pacjent360™: raport kontekstowy";
}

function renderCaregiverAssignmentPanel(model) {
  const patient = model.patient || activePatient();
  const patientName = patientDisplayName(patient);
  const activeScopes = model.activeScopes || [];
  const inactiveScopes = model.inactiveScopes || [];
  const visibleAreas = [...new Set(activeScopes.flatMap((scope) => scope.areas || []))]
    .map(caregiverAreaLabel)
    .filter(Boolean);
  const grantor = patient.guardian && patient.guardian !== "brak" ? patient.guardian : patientName;

  if (!activeScopes.length) {
    return `
      <section class="section-band caregiver-assignment-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Relacja opieki</p>
            <h2><i data-lucide="users-round"></i>Brak aktywnego udostępnienia</h2>
          </div>
          <span class="status-chip pending">Brak dostępu</span>
        </div>
        <div class="care-contract-roles">
          <article>
            <span>Osoba, której dotyczy historia</span>
            <strong>${escapeHtml(patientName)}</strong>
          </article>
          <article>
            <span>Widoczność danych</span>
            <strong>Opiekun nie widzi danych bez aktywnej zgody.</strong>
          </article>
        </div>
        ${inactiveScopes.length ? `<p class="record-body">W danych demo są cofnięte lub wygasłe zakresy: ${escapeHtml(inactiveScopes.map((scope) => scope.subject).join(", "))}.</p>` : ""}
      </section>
    `;
  }

  return `
    <section class="section-band caregiver-assignment-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Relacja opieki</p>
          <h2><i data-lucide="users-round"></i>Kto udostępnił opiekę i nad kim</h2>
        </div>
        <span class="status-chip done">${formatCount(activeScopes.length, "aktywny zakres", "aktywne zakresy", "aktywnych zakresów")}</span>
      </div>
      <div class="care-contract-roles">
        <article>
          <span>Osoba pod opieką</span>
          <strong>${escapeHtml(patientName)}</strong>
        </article>
        <article>
          <span>Dostęp udostępniony przez</span>
          <strong>${escapeHtml(grantor)}</strong>
        </article>
        <article>
          <span>Widoczne obszary</span>
          <strong>${escapeHtml(visibleAreas.join(", ") || "brak obszarów")}</strong>
        </article>
      </div>
      <div class="caregiver-scope-list compact-list">
        ${activeScopes.map((scope) => `
          <article class="caregiver-scope active">
            <div>
              <strong>${escapeHtml(scope.caregiverName || scope.subject)}</strong>
              <small>${escapeHtml(PATIENT360_CAREGIVER_MODEL.displayRole(scope.role))} · do ${escapeHtml(formatDate(scope.validTo))}</small>
            </div>
            <span class="status-chip done">${escapeHtml(scope.status)}</span>
            <p>${escapeHtml(scope.scope)}</p>
            <div class="record-meta">
              ${(scope.areas || []).map((area) => `<span class="tag">${escapeHtml(caregiverAreaLabel(area))}</span>`).join("") || `<span class="tag">brak zakresu</span>`}
            </div>
            <div class="source-line">${sourceChips(scope.sourceRefs || [])}</div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCaregiverPortal() {
  const model = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  const validation = PATIENT360_CAREGIVER_MODEL.validateCaregiverModel(model);
  const patient = activePatient();
  const nextTask = model.tasks[0] || null;
  if (!model.activeScopes.length) {
    return `
      ${pageHeader("Opiekun360", "Widok pomocy organizacyjnej działa wyłącznie w zakresie aktywnej zgody. W tym scenariuszu opiekun nie ma dostępu do danych.")}
      ${renderRoleContextBanner("caregiver")}
      ${renderDashboardOrchestrator({
        persona: "Opiekun360",
        icon: "users-round",
        title: "Brak aktywnego dostępu do danych",
        lead: `${patient.name} · ${model.safetyCopy}`,
        status: "Brak aktywnego zakresu",
        steps: [
          ["1", "Zakres zgody", "Brak aktywnej zgody w danych demo."],
          ["2", "Widoczność danych", "Opiekun nie widzi dokumentów, leków, wyników, wywiadu ani mapy."],
          ["3", "Następny krok", "Możesz zobaczyć, jak opisany jest zakres zgody."]
        ],
        actions: [
          { label: "Zobacz zakres zgody", icon: "shield-check", view: "consent", primary: true }
        ]
      })}
      ${renderCaregiverAssignmentPanel(model)}
    `;
  }
  return `
    ${pageHeader("Opiekun360", "Widok pomocy organizacyjnej: zakres zgody, zadania, dokumenty, wizyty i obserwacje opiekuna. Nie pokazuje danych poza zakresem udostępnienia.", "consent")}
    ${renderRoleContextBanner("caregiver")}
    ${renderDashboardOrchestrator({
      persona: "Opiekun360",
      icon: "users-round",
      title: "Dopilnuj tylko tego, do czego masz dostęp",
      lead: `${patient.name} · ${model.safetyCopy}`,
      status: model.activeScopes.length ? formatCount(model.activeScopes.length, "aktywny zakres dostępu", "aktywne zakresy dostępu", "aktywnych zakresów dostępu") : "Brak aktywnego zakresu",
      steps: [
        ["1", "Zakres zgody", model.activeScopes.length ? "Sprawdź, które obszary są widoczne." : "Brak aktywnej zgody w danych demo."],
        ["2", "Najbliższe zadanie", nextTask ? nextTask.title : "Brak zadań w aktywnym zakresie zgody."],
        ["3", "Po cofnięciu", model.revocationEffects[0]?.description || "Brak cofniętych zakresów w danych demo."]
      ],
      actions: [
        { label: "Zgody", icon: "shield-check", view: "consent", primary: true },
        { label: "Leki", icon: "pill", view: "medications" },
        { label: "Oś historii", icon: "git-branch", view: "timeline" }
      ]
    })}
    ${renderCaregiverAssignmentPanel(model)}
    ${renderFullDataAccess("caregiver")}
    ${renderCareContractPanel("caregiver")}
    ${renderCockpitDetails("Pełne dane Opiekun360: zakresy, obszary, zadania i cofnięcia zgód", `
      <section class="section-band caregiver-overview">
        <div class="section-head">
          <div>
            <p class="eyebrow">Zakres zgody</p>
            <h2><i data-lucide="users-round"></i> Kto co widzi</h2>
          </div>
          <span class="status-chip ${model.activeScopes.length ? "done" : "pending"}">${model.activeScopes.length ? formatCount(model.activeScopes.length, "aktywny zakres dostępu", "aktywne zakresy dostępu", "aktywnych zakresów dostępu") : "Brak aktywnego zakresu"}</span>
        </div>
        <p class="record-body">${escapeHtml(model.safetyCopy)}</p>
        <p class="safety-note inline-note"><i data-lucide="info"></i>Ten widok pokazuje przegląd zgód pacjenta. Docelowo opiekun zobaczy tylko zakres przypisany do swojej zgody.</p>
        ${validation.valid ? "" : `<p class="form-warning">Model opiekuna wymaga sprawdzenia: ${escapeHtml(validation.errors.join("; "))}</p>`}
        <div class="caregiver-scope-list">
          ${model.scopes.map(renderCaregiverScope).join("") || emptyState("Brak zgód opiekuna w danych demo.")}
        </div>
      </section>
      <section class="section-band caregiver-access">
        <div class="section-head">
          <div>
            <p class="eyebrow">Dostęp granularny</p>
            <h2><i data-lucide="shield-check"></i> Obszary widoczne dla opiekuna</h2>
          </div>
        </div>
        <div class="caregiver-access-grid">
          ${model.accessCards.map(renderCaregiverAccessCard).join("")}
        </div>
      </section>
      <section class="section-band caregiver-tasks">
        <div class="section-head">
          <div>
            <p class="eyebrow">Zadania organizacyjne</p>
            <h2><i data-lucide="list-checks"></i> Co opiekun może pomóc dopilnować</h2>
          </div>
        </div>
        <div class="record-list">
          ${model.tasks.map(renderCaregiverTask).join("") || emptyState("Brak zadań w aktywnym zakresie zgody.")}
        </div>
      </section>
      <section class="section-band caregiver-revocation">
        <div class="section-head">
          <div>
            <p class="eyebrow">Cofnięcie zgody</p>
            <h2><i data-lucide="shield-x"></i> Efekt cofnięcia dostępu</h2>
          </div>
        </div>
        <div class="record-list">
          ${model.revocationEffects.map((effect) => `
            <article class="record">
              <p class="record-title">${escapeHtml(effect.subject)}</p>
              <p class="record-body">${escapeHtml(effect.description)}</p>
            </article>
          `).join("") || emptyState("Brak cofniętych lub wygasłych zakresów w danych demo.")}
        </div>
      </section>
    `)}
  `;
}

function renderCaregiverScope(scope) {
  return `
    <article class="caregiver-scope ${scope.status === "aktywny" ? "active" : "inactive"}">
      <div>
        <strong>${escapeHtml(scope.subject)}</strong>
        <small>${escapeHtml(PATIENT360_CAREGIVER_MODEL.displayRole(scope.role))} · do ${escapeHtml(formatDate(scope.validTo))}</small>
      </div>
      <span class="status-chip ${statusClass(scope.status)}">${escapeHtml(scope.status)}</span>
      <p>${escapeHtml(scope.scope)}</p>
      <div class="record-meta">
        ${scope.areas.map((area) => `<span class="tag">${escapeHtml(area)}</span>`).join("") || `<span class="tag">brak zakresu</span>`}
      </div>
    </article>
  `;
}

function renderCaregiverAccessCard(card) {
  return `
    <article class="caregiver-access-card ${card.allowed ? "allowed" : "denied"}">
      <span><i data-lucide="${escapeHtml(card.icon)}"></i></span>
      <div>
        <strong>${escapeHtml(card.label)}</strong>
        <small>${escapeHtml(card.caption)}</small>
      </div>
      <b>${card.allowed ? escapeHtml(String(card.count)) : "—"}</b>
    </article>
  `;
}

function renderCaregiverTask(task) {
  return `
    <article class="record">
      <div class="record-head">
        <div>
          <p class="record-title">${escapeHtml(task.title)}</p>
          <div class="record-meta">
            <span class="status-chip ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
            ${task.due ? `<span class="tag">do ${escapeHtml(formatDate(task.due))}</span>` : ""}
            <span class="tag">${escapeHtml(task.area)}</span>
          </div>
        </div>
      </div>
      <p class="record-body">${escapeHtml(task.description)}</p>
      <div class="record-meta">${sourceChips(task.sourceRefs)}</div>
    </article>
  `;
}

function renderConsent() {
  const consents = byPatient(state.consents).filter(matchesSearch);
  const caregiverModel = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  const caregiverValidation = PATIENT360_CAREGIVER_MODEL.validateCaregiverModel(caregiverModel);
  const consentScopes = consents.map((consent) => PATIENT360_CAREGIVER_MODEL.consentToScope(consent));
  return `
    ${pageHeader("Zgody i dostęp", "Wywiad i transkrypcje są wrażliwymi źródłami. Dostęp musi mieć zakres, czas i audyt.", "consent")}
    <section class="section-band consent-dashboard">
      <div class="section-head">
        <div>
          <p class="eyebrow">Świadome udostępnianie</p>
          <h2><i data-lucide="shield-check"></i> Zakresy dostępu</h2>
        </div>
        <button class="ghost-button" data-set-view="caregiverPortal"><i data-lucide="users-round"></i>Podgląd opiekuna</button>
      </div>
      <p class="record-body">${escapeHtml(caregiverModel.safetyCopy)}</p>
      ${caregiverValidation.valid ? "" : `<p class="form-warning">Model zgód wymaga sprawdzenia: ${escapeHtml(caregiverValidation.errors.join("; "))}</p>`}
      <div class="consent-summary-grid">
        ${metric("Aktywne zakresy", caregiverModel.activeScopes.length, "kto ma obecnie dostęp", "shield-check")}
        ${metric("Cofnięte lub wygasłe", caregiverModel.inactiveScopes.length, "wymagają rewizji raportów", "shield-x")}
        ${metric("Zadania opiekuna", caregiverModel.tasks.length, "tylko organizacyjne", "list-checks")}
      </div>
      <div class="table-wrap consent-scope-table" aria-label="Macierz zakresów zgód">
        <table>
          <thead>
            <tr>
              <th>Odbiorca</th>
              ${PATIENT360_CAREGIVER_MODEL.CAREGIVER_AREAS.filter((area) => area.key !== "tasks").map((area) => `<th>${escapeHtml(area.label)}</th>`).join("")}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${consentScopes.map(renderConsentScopeRow).join("") || `<tr><td colspan="8">${emptyState("Brak zgód dla wyszukiwania.")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Po cofnięciu zgody</p>
          <h2><i data-lucide="shield-x"></i> Co system oznacza do rewizji</h2>
        </div>
      </div>
      <div class="record-list">
        ${caregiverModel.revocationEffects.map((effect) => `
          <article class="record">
            <p class="record-title">${escapeHtml(effect.subject)}</p>
            <p class="record-body">${escapeHtml(effect.description)}</p>
          </article>
        `).join("") || emptyState("Brak cofniętych lub wygasłych zakresów w danych demo.")}
      </div>
    </section>
    <section class="section-band">
      <div class="record-list">
        ${consents.map((consent) => `
          <article class="record">
            <div class="record-head">
              <div>
                <p class="record-title">${escapeHtml(consent.subject)}</p>
                <div class="record-meta"><span class="status-chip ${statusClass(consent.status)}">${escapeHtml(consent.status)}</span><span class="tag">do ${formatDate(consent.validTo)}</span></div>
              </div>
              ${consent.status === "aktywny" ? `<button class="icon-button compact" data-revoke="${escapeHtml(consent.id)}" title="Cofnij zgodę" aria-label="Cofnij zgodę"><i data-lucide="shield-x"></i></button>` : `<span class="tag">nowa zgoda wymaga zakresu i daty</span>`}
            </div>
            <p class="record-body">${escapeHtml(consent.scope)}</p>
            <div class="source-line">${sourceChips(consentSourceRefsForContract(consent))}</div>
          </article>
        `).join("") || emptyState("Brak zgód dla wyszukiwania.")}
      </div>
    </section>
  `;
}

function renderConsentScopeRow(scope) {
  const areas = PATIENT360_CAREGIVER_MODEL.CAREGIVER_AREAS.filter((area) => area.key !== "tasks");
  const active = scope.status === "aktywny";
  return `
    <tr>
      <td>
        <strong>${escapeHtml(scope.subject)}</strong><br>
        <span class="muted">${escapeHtml(PATIENT360_CAREGIVER_MODEL.displayRole(scope.role))} · do ${escapeHtml(formatDate(scope.validTo))}</span>
      </td>
      ${areas.map((area) => {
        const allowed = active && scope.areas.includes(area.key);
        return `<td><span class="status-chip ${allowed ? "done" : "low"}">${allowed ? "tak" : "nie"}</span></td>`;
      }).join("")}
      <td><span class="status-chip ${statusClass(scope.status)}">${escapeHtml(scope.status)}</span></td>
    </tr>
  `;
}

function caregiverAreaLabel(areaKey) {
  return PATIENT360_CAREGIVER_MODEL.CAREGIVER_AREAS.find((area) => area.key === areaKey)?.label || areaKey;
}

function closeConfirmDialog() {
  pendingConsentCreateDraft = null;
  pendingConsentRevokeId = null;
  confirmDialog?.close();
}

function setConfirmAction(label, variant = "danger") {
  confirmAction.textContent = label;
  confirmAction.className = variant === "primary" ? "primary-button" : "danger-button";
}

function setConfirmSecondaryAction(label) {
  confirmSecondaryAction.textContent = label;
}

function returnToConsentEdit() {
  if (!pendingConsentCreateDraft) {
    closeConfirmDialog();
    return;
  }
  confirmDialog?.close();
  entryDialog.showModal();
  refreshIcons();
}

function openConsentRevokeDialog(consentId) {
  const consent = state.consents.find((item) => item.id === consentId);
  if (!consent) return;
  if (consent.status !== "aktywny") {
    showToast("Przywrócenie dostępu wymaga dodania nowej zgody z zakresem i datą ważności.");
    return;
  }
  const scope = PATIENT360_CAREGIVER_MODEL.consentToScope(consent);
  const areaLabels = scope.areas.map(caregiverAreaLabel);
  pendingConsentCreateDraft = null;
  pendingConsentRevokeId = consentId;
  confirmTitle.textContent = "Cofnąć dostęp opiekuna?";
  setConfirmAction("Cofnij dostęp", "danger");
  setConfirmSecondaryAction("Anuluj");
  confirmBody.innerHTML = `
    <div class="confirm-summary">
      <p class="record-body">Potwierdź cofnięcie dostępu dla: <strong>${escapeHtml(scope.subject)}</strong>.</p>
      <div class="record-meta">
        <span class="tag">${escapeHtml(PATIENT360_CAREGIVER_MODEL.displayRole(scope.role))}</span>
        <span class="tag">do ${escapeHtml(formatDate(scope.validTo))}</span>
      </div>
      <div class="confirm-tags" aria-label="Zakres zgody">
        ${areaLabels.map((label) => `<span class="tag">${escapeHtml(label)}</span>`).join("") || `<span class="tag">brak zakresu</span>`}
      </div>
      <ul>
        <li>Po cofnięciu zgody opiekun przestanie widzieć wskazane obszary i zadania w tym zakresie.</li>
        <li>Zmiana zostanie zapisana w historii/audycie.</li>
        <li>To nie usuwa danych pacjenta i nie zmienia leków, wizyt ani planu leczenia.</li>
        <li>Ponowny dostęp wymaga dodania nowej zgody z zakresem i datą ważności.</li>
        <li>Cofnięcie nie usuwa kopii wcześniej pobranych lub udostępnionych poza systemem.</li>
      </ul>
    </div>
  `;
  confirmDialog.showModal();
  refreshIcons();
}

function buildConsentDraft(id, values) {
  const patient = activePatient();
  const result = PATIENT360_CONSENT_MODEL.buildConsentDraft({
      id,
      patientId: state.activePatientId,
      patientName: patient.name,
      values,
      areaDefinitions: PATIENT360_CAREGIVER_MODEL.CAREGIVER_AREAS
  });
  if (!result.valid) {
    showToast(result.errors[0]?.message || "Sprawdź zakres zgody.");
    return null;
  }
  return result.draft;
}

function openConsentCreateDialog(id, values) {
  const draft = buildConsentDraft(id, values);
  if (!draft) return false;
  pendingConsentRevokeId = null;
  pendingConsentCreateDraft = draft;
  const { consent, patientName, areaLabels } = draft;
  confirmTitle.textContent = "Dodać dostęp?";
  setConfirmAction("Dodaj dostęp", "primary");
  setConfirmSecondaryAction("Wróć do edycji");
  confirmBody.innerHTML = `
    <div class="confirm-summary">
      <p class="record-body">Sprawdź zakres przed zapisem dostępu dla: <strong>${escapeHtml(consent.subject)}</strong>.</p>
      <div class="record-meta">
        <span class="tag">${escapeHtml(PATIENT360_CAREGIVER_MODEL.displayRole(consent.role))}</span>
        <span class="tag">pacjent: ${escapeHtml(patientName)}</span>
        <span class="tag">do ${escapeHtml(formatDate(consent.validTo))}</span>
      </div>
      <div class="confirm-tags" aria-label="Zakres zgody">
        ${areaLabels.map((label) => `<span class="tag">${escapeHtml(label)}</span>`).join("")}
      </div>
      <ul>
        <li>Po zapisie odbiorca zobaczy tylko wskazane obszary w lokalnym demo.</li>
        <li>Opis pola „Zakres” jest notatką i nie rozszerza obszarów dostępu.</li>
        <li>Zmiana zostanie zapisana w historii/audycie.</li>
        <li>To nie jest zgoda na leczenie, upoważnienie medyczne ani decyzja kliniczna.</li>
      </ul>
    </div>
  `;
  entryDialog.close();
  confirmDialog.showModal();
  refreshIcons();
  return true;
}

function confirmConsentCreate() {
  if (!pendingConsentCreateDraft) {
    closeConfirmDialog();
    return;
  }
  const { consent, patientName, areaLabels } = pendingConsentCreateDraft;
  state.consents.push(consent);
  addAudit("dodano zgodę", `${consent.subject} (${patientName}): ${areaLabels.join(", ")}`);
  saveState();
  closeConfirmDialog();
  render();
  showToast("Zapisano zgodę lokalnie.");
}

function confirmConsentRevoke() {
  const consent = state.consents.find((item) => item.id === pendingConsentRevokeId);
  if (!consent) {
    closeConfirmDialog();
    return;
  }
  if (consent.status !== "aktywny") {
    closeConfirmDialog();
    showToast("Przywrócenie dostępu wymaga dodania nowej zgody z zakresem i datą ważności.");
    return;
  }
  consent.status = "cofnięty";
  addAudit("cofnięto zgodę", consent.subject);
  saveState();
  closeConfirmDialog();
  render();
}

function confirmDialogAction() {
  if (pendingConsentCreateDraft) {
    confirmConsentCreate();
    return;
  }
  confirmConsentRevoke();
}

function renderAudit() {
  const entries = byPatient(state.audit).filter(matchesSearch).sort((a, b) => new Date(b.date) - new Date(a.date));
  return `
    ${pageHeader("Audyt", "Każda zmiana statusu DITL, wywiad, eksport i raport trafiają do lokalnego śladu audytu.", null)}
    <section class="section-band flush">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Aktor</th><th>Akcja</th><th>Zakres</th></tr></thead>
          <tbody>
            ${entries.map((entry) => `<tr><td>${formatDateTime(entry.date)}</td><td>${escapeHtml(entry.actor)}</td><td>${escapeHtml(entry.action)}</td><td>${escapeHtml(entry.scope)}</td></tr>`).join("") || `<tr><td colspan="4">${emptyState("Brak wpisów audytu.")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderEvidence() {
  const selected = state.selectedSourceRef ? sourceRecord(state.selectedSourceRef) : null;
  if (selected?.record) {
    evidenceRoot.innerHTML = renderEvidenceCard(state.selectedSourceRef, selected.parsed, selected.record);
    bindSourceButtons();
    return;
  }

  const docs = byPatient(state.documents).slice(0, 3).map((doc) => `doc:${doc.id}`);
  const interviews = byPatient(state.interviews).slice(0, 2).map((interview) => `interview:${interview.id}`);
  evidenceRoot.innerHTML = `
    <div class="evidence-empty">Kliknij etykietę źródła, aby sprawdzić, czy informacja pochodzi z dokumentu, wywiadu, transkrypcji, wyniku, leku, zgody czy decyzji DITL.</div>
    <div class="record-list">
      ${[...docs, ...interviews].map((ref) => {
        const { parsed, record } = sourceRecord(ref);
        return renderEvidenceMini(ref, parsed, record);
      }).join("")}
    </div>
  `;
  bindSourceButtons();
}

function renderEvidenceMini(ref, parsed, record) {
  if (!record) return "";
  const title = parsed.type === "doc" ? record.type : parsed.type === "interview" ? "Wywiad" : "Źródło";
  const body = parsed.type === "doc" ? record.title : record.scenario;
  return `<article class="record"><p class="record-title">${escapeHtml(title)}</p><p class="record-body">${escapeHtml(body)}</p><div class="record-meta">${sourceChips(ref)}</div></article>`;
}

function renderEvidenceCard(ref, parsed, record) {
  if (parsed.type === "doc") {
    return `
      <div class="evidence-card">
        <article class="record">
          <p class="record-title">${escapeHtml(record.title)}</p>
          <div class="record-meta"><span class="tag">${escapeHtml(record.type)}</span><span class="tag">${formatDate(record.date)}</span><span class="status-chip ${statusClass(record.trust)}">${escapeHtml(record.trust)}</span></div>
          <p class="record-body">${escapeHtml(record.summary)}</p>
          <p class="record-body"><strong>Placówka:</strong> ${escapeHtml(record.facility)}<br><strong>Autor:</strong> ${escapeHtml(record.author)}<br><strong>Źródło:</strong> ${escapeHtml(record.source)}</p>
        </article>
      </div>
    `;
  }
  if (parsed.type === "interview" || parsed.type === "transcript") {
    return `
      <div class="evidence-card">
        <article class="record">
          <p class="record-title">${escapeHtml(parsed.type === "transcript" ? "Transkrypcja rozmowy" : record.scenario)}</p>
          <div class="record-meta"><span class="tag">${formatDate(record.date)}</span><span class="tag">rozmówca: ${escapeHtml(record.speaker)}</span><span class="status-chip ${statusClass(record.confidence)}">pewność: ${escapeHtml(record.confidence)}</span></div>
          <p class="record-body">${escapeHtml(parsed.type === "transcript" ? record.transcript : Object.values(record.answers || {}).join(" "))}</p>
        </article>
      </div>
    `;
  }
  if (parsed.type === "observation") {
    const latest = latestValue(record);
    return `<article class="record"><p class="record-title">${escapeHtml(record.name)}</p><p class="record-body">Ostatnio: ${escapeHtml(latest?.value ?? "brak")} ${escapeHtml(record.unit)} (${formatDate(latest?.date)}), trend: ${escapeHtml(trendDirection(record))}.</p></article>`;
  }
  if (parsed.type === "medication") {
    return `<article class="record"><p class="record-title">${escapeHtml(record.name)}</p><p class="record-body">${escapeHtml(record.story)}</p><p class="record-body"><strong>Pytanie:</strong> ${escapeHtml(record.question)}</p></article>`;
  }
  if (parsed.type === "flag") {
    return `<article class="record"><p class="record-title">${escapeHtml(record.category)}</p><p class="record-body">${escapeHtml(record.evidence)}</p><p class="record-body"><strong>Pytanie:</strong> ${escapeHtml(record.question)}</p></article>`;
  }
  if (parsed.type === "decision") {
    return `<article class="record"><p class="record-title">${escapeHtml(record.type)}</p><p class="record-body">${escapeHtml(record.clinicalQuestion)}</p><div class="source-line">${sourceChips(record.sourceRefs)}</div></article>`; // decisionContext
  }
  if (parsed.type === "consent") {
    return `<article class="record"><p class="record-title">Zgoda: ${escapeHtml(record.subject)}</p><p class="record-body">${escapeHtml(record.scope)}</p><p class="record-body"><strong>Rola:</strong> ${escapeHtml(PATIENT360_CAREGIVER_MODEL.displayRole(record.role || ""))}<br><strong>Status:</strong> ${escapeHtml(record.status || "")}<br><strong>Do:</strong> ${formatDate(record.validTo)}</p><div class="source-line">${sourceChips((record.sourceRefs || []).filter((item) => item !== ref))}</div></article>`;
  }
  return `<article class="record"><p class="record-title">${escapeHtml(sourceLabel(ref))}</p></article>`;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function bindViewActions() {
  viewRoot.querySelectorAll("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => openEntryDialog(button.dataset.openDialog));
  });

  viewRoot.querySelectorAll("[data-set-view]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.setView);
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-journey-step]").forEach((button) => {
    button.addEventListener("click", () => {
      setJourneyStep(button.dataset.journeyStep);
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-select-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeRole = button.dataset.selectRole;
      state.roleSelectionConfirmed = true;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-reset-role-selection]").forEach((button) => {
    button.addEventListener("click", () => {
      state.roleSelectionConfirmed = false;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-start-patient]").forEach((button) => {
    button.addEventListener("click", () => {
      startRoleScenario(button.dataset.startRole || activeRole(), button.dataset.startPatient);
    });
  });

  viewRoot.querySelectorAll("[data-ditl-status]").forEach((button) => {
    button.addEventListener("click", () => setDitlStatus(button.dataset.ditlType, button.dataset.ditlId, button.dataset.ditlStatus));
  });

  viewRoot.querySelectorAll("[data-report-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reportType = button.dataset.reportType;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-case-study]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCaseStudy = button.dataset.caseStudy;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.timelinePeriod = button.dataset.timelinePeriod;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      state.timelineDetail = button.dataset.timelineDetail;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-view-level]").forEach((button) => {
    button.addEventListener("click", () => {
      state.timelinePeriod = button.dataset.timelineViewPeriod || "episode";
      state.timelineDetail = button.dataset.timelineViewDetail || "standard";
      state.timelineZoom = normalizeTimelineZoom(button.dataset.timelineViewZoom || state.timelineZoom);
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-zoom-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.timelineZoom = normalizeTimelineZoom(activeTimelineZoom() + Number(button.dataset.timelineZoomStep));
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-zoom-fit]").forEach((button) => {
    button.addEventListener("click", () => {
      state.timelineDetail = "overview";
      state.timelineZoom = TIMELINE_ZOOM.fit;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-zoom-range]").forEach((input) => {
    input.addEventListener("change", () => {
      state.timelineZoom = normalizeTimelineZoom(input.value);
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-timeline-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.dataset.timelineJump, 10);
      if (!Number.isFinite(index)) return;
      const scroller = viewRoot.querySelector(".temporal-scroll");
      const target = viewRoot.querySelector(`[data-temporal-index="${escapeHtml(index)}"]`);
      if (!scroller || !target) return;
      const left = target.offsetLeft - scroller.clientWidth / 2 + target.clientWidth / 2;
      scroller.scrollTo({ left: Math.max(left, 0), behavior: "smooth" });
    });
  });

  viewRoot.querySelectorAll("[data-select-timeline-event]").forEach((item) => {
    const selectEvent = () => {
      const scroller = item.closest(".patient-map-workbench")?.querySelector(".temporal-scroll");
      const scrollLeft = scroller?.scrollLeft || 0;
      state.selectedTimelineEventId = item.dataset.selectTimelineEvent;
      saveState();
      render();
      requestAnimationFrame(() => {
        const nextScroller = viewRoot.querySelector(".patient-map-workbench .temporal-scroll");
        if (nextScroller) nextScroller.scrollLeft = scrollLeft;
        const storyCard = viewRoot.querySelector(`[data-temporal-story-event="${escapeHtml(state.selectedTimelineEventId)}"]`);
        if (storyCard) storyCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };
    item.addEventListener("click", selectEvent);
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectEvent();
    });
  });

  viewRoot.querySelectorAll("[data-filter-track]").forEach((button) => {
    button.addEventListener("click", () => {
      const track = button.dataset.filterTrack;
      state.timelineFilterTrack = state.timelineFilterTrack === track ? null : track;
      saveState();
      render();
    });
  });

  viewRoot.querySelectorAll("[data-generate-report]").forEach((button) => {
    button.addEventListener("click", () => generateReport());
  });

  viewRoot.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => printCurrentView("raport demo"));
  });

  viewRoot.querySelectorAll("[data-revoke]").forEach((button) => {
    button.addEventListener("click", () => {
      openConsentRevokeDialog(button.dataset.revoke);
    });
  });
}

function bindSourceButtons() {
  document.querySelectorAll("[data-source-ref]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSourceRef = button.dataset.sourceRef;
      saveState();
      renderEvidence();
      refreshIcons();
    });
  });
}

function setDitlStatus(type, id, status) {
  if (type === "flag") {
    const flag = state.flags.find((item) => item.id === id);
    if (flag) {
      flag.status = status;
      addAudit("zmieniono status sygnału DITL", `${flag.category}: ${status}`);
    }
  } else {
    for (const decision of state.decisionContexts) {
      const question = (decision.ditlQuestions || []).find((item) => item.id === id);
      if (question) {
        question.status = status;
        addAudit("zmieniono status pytania DITL", `${question.question}: ${status}`);
      }
    }
  }
  saveState();
  showToast(DITL_STATUS_NOTICE);
  render();
}

function openEntryDialog(type) {
  const config = dialogConfig(type);
  if (!config) {
    showToast("Ten widok nie ma formularza dodawania.");
    return;
  }
  dialogTitle.textContent = config.title;
  dialogFields.innerHTML = renderSafetyNote(DEMO_FORM_WARNING, "compact") + config.fields.map(renderField).join("");
  dialogForm.dataset.type = type;
  entryDialog.showModal();
  refreshIcons();
}

function optionValue(option) {
  return typeof option === "object" ? option.value : option;
}

function optionLabel(option) {
  return typeof option === "object" ? option.label : option;
}

function consentAreaOptions() {
  return PATIENT360_CONSENT_MODEL.consentAreaOptions(PATIENT360_CAREGIVER_MODEL.CAREGIVER_AREAS);
}

function renderField(field) {
  const required = field.required ? "required" : "";
  const step = field.kind === "number" ? 'step="any"' : "";
  if (field.kind === "textarea") {
    return `<div class="field"><label for="${field.name}">${field.label}</label><textarea id="${field.name}" name="${field.name}" ${required}>${escapeHtml(field.value || "")}</textarea></div>`;
  }
  if (field.kind === "select") {
    return `<div class="field"><label for="${field.name}">${field.label}</label><select id="${field.name}" name="${field.name}" ${required}>${field.options.map((option) => `<option value="${escapeHtml(optionValue(option))}">${escapeHtml(optionLabel(option))}</option>`).join("")}</select></div>`;
  }
  if (field.kind === "checkboxGroup") {
    const selected = new Set(field.value || []);
    return `
      <fieldset class="field checkbox-group">
        <legend>${escapeHtml(field.label)}</legend>
        <div class="checkbox-options">
          ${field.options.map((option) => {
            const value = optionValue(option);
            const inputId = `${field.name}_${value}`;
            const checked = selected.has(value) ? "checked" : "";
            return `
              <label class="checkbox-option" for="${escapeHtml(inputId)}">
                <input id="${escapeHtml(inputId)}" name="${escapeHtml(inputId)}" type="checkbox" value="${escapeHtml(value)}" ${checked}>
                <span>${escapeHtml(optionLabel(option))}</span>
              </label>
            `;
          }).join("")}
        </div>
        ${field.help ? `<p class="field-help">${escapeHtml(field.help)}</p>` : ""}
      </fieldset>
    `;
  }
  if (field.kind === "radioGroup") {
    return `
      <fieldset class="field radio-group">
        <legend>${escapeHtml(field.label)}</legend>
        <div class="radio-options">
          ${field.options.map((option, index) => {
            const value = optionValue(option);
            const inputId = `${field.name}_${value}`;
            const checked = (field.value || (index === 0 ? value : "")) === value ? "checked" : "";
            return `
              <label class="radio-option" for="${escapeHtml(inputId)}">
                <input id="${escapeHtml(inputId)}" name="${escapeHtml(field.name)}" type="radio" value="${escapeHtml(value)}" ${checked}>
                <span>${escapeHtml(optionLabel(option))}</span>
              </label>
            `;
          }).join("")}
        </div>
        ${field.help ? `<p class="field-help">${escapeHtml(field.help)}</p>` : ""}
      </fieldset>
    `;
  }
  return `<div class="field"><label for="${field.name}">${field.label}</label><input id="${field.name}" name="${field.name}" type="${field.kind || "text"}" value="${escapeHtml(field.value || "")}" ${required} ${step}></div>`;
}

function dialogConfig(type) {
  const today = todayInputValue();
  const configs = {
    document: {
      title: "Dodaj dokument",
      fields: [
        { name: "title", label: "Tytuł", required: true },
        { name: "type", label: "Typ", kind: "select", options: ["Wypis", "Laboratorium", "Konsultacja", "Obrazowanie", "Recepta"] },
        { name: "date", label: "Data dokumentu", kind: "date", value: today, required: true },
        { name: "facility", label: "Placówka" },
        { name: "summary", label: "Krótki opis", kind: "textarea" }
      ]
    },
    decision: {
      title: "Dodaj kontekst decyzji (DITL)",
      fields: [
        { name: "type", label: "Typ decyzji", kind: "select", options: ["Decyzja przed zabiegiem", "Wizyta kontrolna", "Zmiana leków", "Wypis", "Konsultacja kardiologiczna", "Konsultacja neurologiczna", "Druga opinia"] },
        { name: "contactDate", label: "Data kontaktu", kind: "date", value: today, required: true },
        { name: "contextQuestion", label: "Pytanie kontekstowe na dziś", kind: "textarea", required: true },
        { name: "ditlQuestions", label: "Pytania DITL, po jednym w linii", kind: "textarea" }
      ]
    },
    interview: {
      title: "Dodaj wywiad i transkrypcję",
      fields: [
        { name: "scenario", label: "Scenariusz", value: "Wywiad przedwizytowy", required: true },
        { name: "date", label: "Data rozmowy", kind: "date", value: today, required: true },
        { name: "speaker", label: "Rozmówca", kind: "select", options: ["pacjent", "opiekun", "rodzina", "lekarz"] },
        { name: "confidence", label: "Poziom pewności", kind: "select", options: ["średnia", "wysoka", "niska"] },
        ...INTERVIEW_SCRIPT.map((section) => ({ name: `answer_${section.key}`, label: section.title, kind: "textarea" })),
        { name: "transcript", label: "Transkrypcja rozmowy", kind: "textarea" }
      ]
    },
    medication: {
      title: "Dodaj lek do historii leków",
      fields: [
        { name: "name", label: "Nazwa leku", required: true },
        { name: "dose", label: "Dawka" },
        { name: "frequency", label: "Częstotliwość" },
        { name: "status", label: "Status", kind: "select", options: ["aktywny", "OTC/suplement", "odstawiony", "niejasny"] },
        { name: "actualStatus", label: "Realne przyjmowanie", kind: "select", options: ["zgłoszony jako przyjmowany", "niepotwierdzone", "nie bierze mimo recepty", "podawany doraźnie"] },
        { name: "story", label: "Historia leczenia", kind: "textarea" },
        { name: "symptomLink", label: "Objawy po zmianie lub związek czasowy", kind: "textarea" },
        { name: "question", label: "Pytanie do lekarza", kind: "textarea" }
      ]
    },
    observation: {
      title: "Dodaj wynik",
      fields: [
        { name: "name", label: "Parametr", required: true },
        { name: "value", label: "Wartość", kind: "number", required: true },
        { name: "unit", label: "Jednostka", value: "mg/l" },
        { name: "date", label: "Data wyniku", kind: "date", value: today, required: true },
        { name: "normalMin", label: "Zakres ze źródła min", kind: "number", value: "0" },
        { name: "normalMax", label: "Zakres ze źródła max", kind: "number", value: "5" }
      ]
    },
    flag: {
      title: "Dodaj sygnał DITL",
      fields: [
        { name: "color", label: "Kategoria sygnału", kind: "select", options: FLAG_COLOR_OPTIONS },
        { name: "category", label: "Kategoria", required: true },
        { name: "question", label: "Pytanie do lekarza", kind: "textarea", required: true },
        { name: "evidence", label: "Informacje ze źródeł", kind: "textarea" }
      ]
    },
    consent: {
      title: "Dodaj zgodę",
      fields: [
        {
          name: "recipientKind",
          label: "Kto otrzymuje dostęp?",
          kind: "radioGroup",
          value: "support",
          options: [
            { value: "support", label: "Opiekun lub osoba wspierająca" },
            { value: "patient", label: "Pacjent" }
          ],
          help: "Wybór służy tylko do zakresu dostępu w demo; nie jest zgodą na leczenie ani upoważnieniem medycznym."
        },
        { name: "subject", label: "Odbiorca / nazwa opiekuna" },
        { name: "caregiverName", label: "Imię lub nazwa opiekuna" },
        { name: "role", label: "Rola", kind: "select", options: ["rodzic", "opiekun prawny", "osoba wspierająca", "rodzina"] },
        {
          name: "consentArea",
          label: "Obszary udostępnienia",
          kind: "checkboxGroup",
          options: consentAreaOptions(),
          value: [],
          help: "Wybierz tylko te obszary, które opiekun ma widzieć w demo."
        },
        { name: "scope", label: "Zakres", required: true },
        { name: "validTo", label: "Ważna do", kind: "date", value: today, required: true }
      ]
    }
  };
  return configs[type] || null;
}

dialogForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(dialogForm).entries());
  const saved = saveEntry(dialogForm.dataset.type, values);
  if (saved === "pending") return;
  if (!saved) return;
  entryDialog.close();
  showToast("Zapisano wpis lokalnie.");
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => entryDialog.close());
});

document.querySelectorAll("[data-close-confirm]").forEach((button) => {
  button.addEventListener("click", closeConfirmDialog);
});

confirmSecondaryAction?.addEventListener("click", () => {
  if (pendingConsentCreateDraft) {
    returnToConsentEdit();
    return;
  }
  closeConfirmDialog();
});

confirmDialog?.addEventListener("cancel", () => {
  pendingConsentCreateDraft = null;
  pendingConsentRevokeId = null;
});

confirmDialog?.addEventListener("close", () => {
  if (!confirmDialog.open) {
    pendingConsentCreateDraft = null;
    pendingConsentRevokeId = null;
  }
});

confirmAction?.addEventListener("click", confirmDialogAction);

function saveEntry(type, values) {
  const id = `${type.slice(0, 2)}${Date.now()}`;
  let saved = true;
  if (type === "document") saveDocument(id, values);
  if (type === "decision") saveDecision(id, values);
  if (type === "interview") saveInterview(id, values);
  if (type === "medication") saveMedication(id, values);
  if (type === "observation") saveObservation(id, values);
  if (type === "flag") saveFlag(id, values);
  if (type === "consent") saved = openConsentCreateDialog(id, values) ? "pending" : false;
  if (!saved) return false;
  if (saved === "pending") return "pending";
  saveState();
  render();
  return true;
}

function saveDecision(id, values) {
  const contextQuestion = values.contextQuestion || values.clinicalQuestion || ""; // decisionContext backward compatibility
  const questionLines = String(values.ditlQuestions || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const ditlQuestions = (questionLines.length ? questionLines : [contextQuestion]).map((question, index) => ({
    id: `hq${Date.now()}${index}`,
    question,
    status: "do wyjaśnienia",
    sourceRefs: latestSourceRefs()
  }));
  state.decisionContexts.push({
    id,
    patientId: state.activePatientId,
    type: values.type,
    clinicalQuestion: contextQuestion, // decisionContext
    contactDate: values.contactDate,
    status: "DITL: do oceny lekarza",
    sourceRefs: latestSourceRefs(),
    ditlQuestions
  });
  state.timelineEvents.push({
    id: `te${Date.now()}`,
    patientId: state.activePatientId,
    date: values.contactDate,
    track: "decyzje medyczne",
    episodeId: timelineEpisodeIdForDate(values.contactDate),
    status: "do potwierdzenia",
    title: values.type,
    description: contextQuestion,
    confidence: "wysoka",
    sourceRefs: [`decision:${id}`]
  });
  addAudit("dodano decyzję DITL", values.type);
}

function saveDocument(id, values) {
  state.documents.push({
    id,
    patientId: state.activePatientId,
    type: values.type,
    title: values.title,
    date: values.date,
    eventDate: values.date,
    facility: values.facility || "brak danych",
    author: "ręczne dodanie",
    quality: "ręczne uzupełnienie",
    extractionStatus: "wymaga weryfikacji",
    trust: "średni",
    source: "ręczne dodanie",
    summary: values.summary || "Brak opisu."
  });
  state.timelineEvents.push({
    id: `te${Date.now()}`,
    patientId: state.activePatientId,
    date: values.date,
    track: "badania",
    episodeId: timelineEpisodeIdForDate(values.date),
    status: "do potwierdzenia",
    title: values.title,
    description: values.summary || "Nowy dokument dodany ręcznie.",
    confidence: "średnia",
    sourceRefs: [`doc:${id}`]
  });
  addAudit("dodano dokument", values.title);
}

function saveInterview(id, values) {
  const answers = Object.fromEntries(INTERVIEW_SCRIPT.map((section) => [section.key, values[`answer_${section.key}`] || ""]));
  state.interviews.push({
    id,
    patientId: state.activePatientId,
    date: values.date,
    scenario: values.scenario,
    speaker: values.speaker,
    confidence: values.confidence,
    answers,
    transcript: values.transcript || "",
    sourceRefs: []
  });
  state.timelineEvents.push({
    id: `te${Date.now()}`,
    patientId: state.activePatientId,
    date: values.date,
    track: values.speaker === "rodzina" || values.speaker === "opiekun" ? "obserwacje z wywiadu" : "objawy",
    episodeId: timelineEpisodeIdForDate(values.date),
    status: "do potwierdzenia",
    title: values.scenario,
    description: answers.current || answers.family || "Nowy wywiad dodany ręcznie.",
    confidence: values.confidence,
    sourceRefs: [`interview:${id}`, `transcript:${id}`]
  });
  addAudit("dodano wywiad i transkrypcję", values.scenario);
}

function saveMedication(id, values) {
  const today = todayInputValue();
  state.medications.push({
    id,
    patientId: state.activePatientId,
    name: values.name,
    substance: values.name,
    dose: values.dose,
    frequency: values.frequency,
    from: today,
    to: "",
    status: values.status,
    actualStatus: values.actualStatus,
    indication: "do uzupełnienia",
    sourceRefs: latestSourceRefs(),
    story: values.story || "Brak historii leku.",
    symptomLink: values.symptomLink || "",
    question: values.question || "Czy ten lek został potwierdzony w uzgodnionej liście leków?"
  });
  state.timelineEvents.push({
    id: `te${Date.now()}`,
    patientId: state.activePatientId,
    date: today,
    track: "leki",
    episodeId: timelineEpisodeIdForDate(today),
    status: "do potwierdzenia",
    title: `Dodano lek: ${values.name}`,
    description: values.story || "Nowy wpis historii leków.",
    confidence: "średnia",
    sourceRefs: [`medication:${id}`]
  });
  addAudit("dodano lek do historii leków", values.name);
}

function saveObservation(id, values) {
  state.observations.push({
    id,
    patientId: state.activePatientId,
    name: values.name,
    type: "laboratorium",
    unit: values.unit,
    normalMin: Number(values.normalMin),
    normalMax: Number(values.normalMax),
    values: [{ date: values.date, value: Number(values.value), sourceRefs: latestSourceRefs() }]
  });
  state.timelineEvents.push({
    id: `te${Date.now()}`,
    patientId: state.activePatientId,
    date: values.date,
    track: "badania",
    episodeId: timelineEpisodeIdForDate(values.date),
    status: "do potwierdzenia",
    title: `Wynik: ${values.name}`,
    description: `${values.value} ${values.unit}`,
    confidence: "średnia",
    sourceRefs: [`observation:${id}`]
  });
  addAudit("dodano wynik", values.name);
}

function saveFlag(id, values) {
  state.flags.push({
    id,
    patientId: state.activePatientId,
    color: values.color,
    category: values.category,
    question: values.question,
    evidence: values.evidence || "Brak opisu danych wspierających.",
    status: "do wyjaśnienia",
    sourceRefs: latestSourceRefs()
  });
  addAudit("dodano sygnał DITL", values.category);
}

function latestSourceRefs() {
  const interview = byPatient(state.interviews).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const doc = byPatient(state.documents).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  return [interview ? `interview:${interview.id}` : null, doc ? `doc:${doc.id}` : null].filter(Boolean);
}

function generateReport() {
  const caseStudy = activeCaseStudy();
  const patientRefs = [
    ...byPatient(state.documents).map((doc) => `doc:${doc.id}`),
    ...byPatient(state.interviews).map((interview) => `interview:${interview.id}`)
  ];
  const baseLabel = `${typeLabel(state.reportType)} - wersja demonstracyjna`;
  const label = `${baseLabel} / ${caseStudy.label}`;
  state.reports.push({
    id: `rep${Date.now()}`,
    patientId: state.activePatientId,
    type: label,
    generatedAt: new Date().toISOString(),
    version: `${byPatient(state.reports).length + 1}.0`,
    author: "Pacjent360™",
    status: "DITL: do oceny lekarza",
    caseStudyId: caseStudy.id,
    sourceRefs: patientRefs
  });
  addAudit(`wygenerowano raport ${label}`, "raport kontekstowy i indeks źródeł");
  saveState();
  showToast(`Wygenerowano wersję raportu: ${label}.`);
  render();
}

function addAudit(action, scope) {
  state.audit.push({
    id: `u${Date.now()}`,
    patientId: state.activePatientId,
    date: new Date().toISOString(),
    actor: "Użytkownik lokalny",
    action,
    scope
  });
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function confirmDemoAction(message) {
  return window.confirm(`${DEMO_WATERMARK_TEXT}\n\n${message}`);
}

function buildLegacyActivePatientState(patient = activePatient()) {
  const exportState = clone(state);
  exportState.activePatientId = patient.id;
  exportState.patients = [patient];
  exportState.selectedSourceRef = null;
  exportState.selectedTimelineEventId = null;
  exportState.search = "";
  PATIENT_SCOPED_COLLECTION_KEYS.forEach((key) => {
    exportState[key] = Array.isArray(state[key])
      ? state[key].filter((item) => item.patientId === patient.id)
      : [];
  });
  return exportState;
}

function normalizeSourceRefsForContract(refs) {
  const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
  const normalized = list.map(String).filter(Boolean);
  return normalized.length ? [...new Set(normalized)] : [SOURCE_MISSING_REF];
}

function addContractSource(sources, ref, type, title, record, date = "") {
  if (!ref || sources.has(ref)) return;
  sources.set(ref, {
    ref,
    type,
    evidenceClass: record?.evidenceClass || PATIENT360_CONTRACT.SOURCE_TYPE_TO_EVIDENCE_CLASS[type] || "system_generated",
    title: title || ref,
    patientId: record?.patientId || "",
    date: date || record?.date || record?.eventDate || record?.contactDate || record?.generatedAt || "",
    confidence: record?.confidence || record?.trust || record?.certainty || "",
    status: record?.status || record?.extractionStatus || "",
    recordId: record?.id || ""
  });
}

function buildContractSources(exportState) {
  const sources = new Map();
  (exportState.documents || []).forEach((item) => addContractSource(sources, `doc:${item.id}`, "document", item.title || item.type, item, item.eventDate || item.date));
  (exportState.interviews || []).forEach((item) => {
    addContractSource(sources, `interview:${item.id}`, "interview", item.scenario || "Wywiad", item, item.date);
    addContractSource(sources, `transcript:${item.id}`, "transcript", `Transkrypcja: ${item.scenario || item.id}`, item, item.date);
  });
  (exportState.observations || []).forEach((item) => addContractSource(sources, `observation:${item.id}`, "observation", item.name, item, item.values?.[item.values.length - 1]?.date || ""));
  (exportState.medications || []).forEach((item) => addContractSource(sources, `medication:${item.id}`, "medication", item.name, item, item.from || ""));
  (exportState.flags || []).forEach((item) => addContractSource(sources, `flag:${item.id}`, "flag", item.category, item));
  (exportState.decisionContexts || []).forEach((item) => addContractSource(sources, `decision:${item.id}`, "decisionContext", item.type, item, item.contactDate));
  (exportState.reports || []).forEach((item) => addContractSource(sources, `report:${item.id}`, "report", item.type, item, item.generatedAt));
  (exportState.consents || []).forEach((item) => addContractSource(sources, `consent:${item.id}`, "consent", `Zgoda: ${item.subject || item.caregiverName || item.id}`, item, item.validTo || ""));
  return Array.from(sources.values()).sort((a, b) => a.ref.localeCompare(b.ref));
}

function buildContractClaims(exportState) {
  const claims = [];
  const pushClaim = (claim) => {
    claims.push({
      id: claim.id,
      patientId: claim.patientId || exportState.activePatientId,
      claimType: claim.claimType,
      text: claim.text,
      status: claim.status || "",
      sourceRefs: normalizeSourceRefsForContract(claim.sourceRefs),
      linkedRef: claim.linkedRef || ""
    });
  };

  (exportState.knownUnknowns || []).forEach((item) =>
    pushClaim({
      id: `knownUnknown:${item.id}`,
      patientId: item.patientId,
      claimType: item.category,
      text: item.description,
      status: item.category,
      sourceRefs: item.sourceRefs,
      linkedRef: `knownUnknown:${item.id}`
    })
  );

  (exportState.flags || []).forEach((item) =>
    pushClaim({
      id: `flag:${item.id}`,
      patientId: item.patientId,
      claimType: `flag:${item.color}`,
      text: `${item.category}: ${item.question}`,
      status: item.status,
      sourceRefs: item.sourceRefs,
      linkedRef: `flag:${item.id}`
    })
  );

  (exportState.decisionContexts || []).forEach((decision) => {
    pushClaim({
      id: `decision:${decision.id}`,
      patientId: decision.patientId,
      claimType: "decisionContext",
      text: decision.clinicalQuestion,
      status: decision.status,
      sourceRefs: decision.sourceRefs,
      linkedRef: `decision:${decision.id}`
    });
    (decision.ditlQuestions || []).forEach((question) =>
      pushClaim({
        id: `question:${decision.id}:${question.id}`,
        patientId: decision.patientId,
        claimType: "ditlQuestion",
        text: question.question,
        status: question.status,
        sourceRefs: question.sourceRefs || decision.sourceRefs,
        linkedRef: `decision:${decision.id}`
      })
    );
  });

  (exportState.timelineEvents || []).forEach((event) =>
    pushClaim({
      id: `event:${event.id}`,
      patientId: event.patientId,
      claimType: "timelineEvent",
      text: `${event.title}: ${event.description}`,
      status: event.status,
      sourceRefs: event.sourceRefs,
      linkedRef: `event:${event.id}`
    })
  );

  (exportState.reports || []).forEach((report) =>
    pushClaim({
      id: `report:${report.id}`,
      patientId: report.patientId,
      claimType: "report",
      text: report.type,
      status: report.status,
      sourceRefs: report.sourceRefs,
      linkedRef: `report:${report.id}`
    })
  );

  return claims;
}

function buildContractTimelineEvents(exportState) {
  return (exportState.timelineEvents || []).map((event) => ({
    ...event,
    sourceRefs: normalizeSourceRefsForContract(event.sourceRefs),
    claimRefs: [`event:${event.id}`],
    schemaStatus: event.status === "planowane" ? "planned_not_fact" : "projected_from_sources"
  }));
}

function buildContractTimelineEpisodes(exportState) {
  const eventsByEpisode = new Map();
  (exportState.timelineEvents || []).forEach((event) => {
    if (!event.episodeId) return;
    const list = eventsByEpisode.get(event.episodeId) || [];
    list.push(event.id);
    eventsByEpisode.set(event.episodeId, list);
  });
  return (exportState.timelineEpisodes || []).map((episode) => ({
    ...episode,
    sourceRefs: normalizeSourceRefsForContract(episode.sourceRefs),
    eventRefs: eventsByEpisode.get(episode.id) || []
  }));
}

function buildContractTimelineRelations(exportState) {
  return (exportState.timelineRelations || []).map((relation) => ({
    ...relation,
    sourceRefs: normalizeSourceRefsForContract(relation.sourceRefs),
    causality: "not_asserted"
  }));
}

function consentSourceRefsForContract(consent) {
  const selfRef = consent?.id ? `consent:${consent.id}` : null;
  return normalizeSourceRefsForContract([selfRef, ...(Array.isArray(consent?.sourceRefs) ? consent.sourceRefs : [])]);
}

function buildContractConsentScopes(exportState) {
  return (exportState.consents || []).map((consent) => ({
    id: consent.id,
    patientId: consent.patientId,
    subject: consent.subject,
    scope: consent.scope,
    role: consent.role || "",
    caregiverId: consent.caregiverId || "",
    caregiverName: consent.caregiverName || consent.subject || "",
    areas: Array.isArray(consent.areas) ? consent.areas : [],
    validTo: consent.validTo,
    status: consent.status,
    sourceRefs: consentSourceRefsForContract(consent)
  }));
}

function collectContractSourceRefs(value, refs = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectContractSourceRefs(item, refs));
    return refs;
  }
  if (!value || typeof value !== "object") return refs;
  Object.entries(value).forEach(([key, entry]) => {
    if (key === "sourceRefs") {
      normalizeSourceRefsForContract(entry).forEach((ref) => refs.push(ref));
    } else {
      collectContractSourceRefs(entry, refs);
    }
  });
  return refs;
}

function buildSourceQuality(contract) {
  const refs = collectContractSourceRefs({
    claims: contract.claims,
    timelineEvents: contract.timelineEvents,
    timelineEpisodes: contract.timelineEpisodes,
    timelineRelations: contract.timelineRelations,
    consentScopes: contract.consentScopes,
    domainData: contract.domainData
  });
  return {
    sources: contract.sources.length,
    claims: contract.claims.length,
    sourceMissingCount: refs.filter((ref) => ref === SOURCE_MISSING_REF).length
  };
}

function buildDataContractExport(exportState) {
  const contract = {
    schemaVersion: DATA_SCHEMA_VERSION,
    contractVersion: DATA_CONTRACT_VERSION,
    exportedAt: new Date().toISOString(),
    intendedUse: "Kontekst, źródła, pytania DITL i zadania organizacyjne. Nie diagnoza, ocena pilności ani rekomendacja terapeutyczna.",
    patient: exportState.patients?.[0] || null,
    sources: buildContractSources(exportState),
    claims: buildContractClaims(exportState),
    timelineEvents: buildContractTimelineEvents(exportState),
    timelineEpisodes: buildContractTimelineEpisodes(exportState),
    timelineRelations: buildContractTimelineRelations(exportState),
    consentScopes: buildContractConsentScopes(exportState),
    audit: (exportState.audit || []).map((entry) => ({ ...entry, actionType: "local_demo_audit" })),
    domainData: exportState
  };
  contract.sourceQuality = buildSourceQuality(contract);
  return contract;
}

function validateDataContract(contract) {
  const errors = [];
  const requiredArrays = ["sources", "claims", "timelineEvents", "timelineEpisodes", "timelineRelations", "consentScopes", "audit"];
  if (contract.schemaVersion !== DATA_SCHEMA_VERSION) errors.push(`schemaVersion must be ${DATA_SCHEMA_VERSION}`);
  if (contract.contractVersion !== DATA_CONTRACT_VERSION) errors.push(`contractVersion must be ${DATA_CONTRACT_VERSION}`);
  requiredArrays.forEach((key) => {
    if (!Array.isArray(contract[key])) errors.push(`${key} must be an array`);
  });
  const patientId = contract.patient?.id;
  const checkUnique = (key, items, idKey = "id") => {
    const seen = new Set();
    (items || []).forEach((item) => {
      const id = item[idKey];
      if (!id) errors.push(`${key} item missing ${idKey}`);
      if (seen.has(id)) errors.push(`${key} has duplicate ${idKey} ${id}`);
      seen.add(id);
    });
  };
  checkUnique("sources", contract.sources, "ref");
  ["claims", "timelineEvents", "timelineEpisodes", "timelineRelations", "consentScopes", "audit"].forEach((key) => checkUnique(key, contract[key]));
  const checkPatient = (key, items) => (items || []).forEach((item) => {
    if (item.patientId && patientId && item.patientId !== patientId) errors.push(`${key} ${item.id || item.ref} belongs to ${item.patientId}, not ${patientId}`);
  });
  ["sources", "claims", "timelineEvents", "timelineEpisodes", "timelineRelations", "consentScopes", "audit"].forEach((key) => checkPatient(key, contract[key]));

  const sourceRefs = new Set((contract.sources || []).map((source) => source.ref));
  const sourceByRef = new Map((contract.sources || []).map((source) => [source.ref, source]));
  (contract.sources || []).forEach((source) => {
    if (!CONTRACT_SOURCE_TYPES.includes(source.type)) errors.push(`source ${source.ref} has invalid type ${source.type}`);
    const parsed = parseSourceRef(source.ref);
    const expectedType = SOURCE_REF_PREFIX_TO_TYPE[parsed.type];
    if (expectedType && source.type !== expectedType) errors.push(`source ${source.ref} has type ${source.type}, expected ${expectedType}`);
  });
  const checkRefs = (owner, refs) => normalizeSourceRefsForContract(refs).forEach((ref) => {
    if (ref !== SOURCE_MISSING_REF && !sourceRefs.has(ref)) errors.push(`${owner} references missing source ${ref}`);
    const source = sourceByRef.get(ref);
    const parsed = parseSourceRef(ref);
    const expectedType = SOURCE_REF_PREFIX_TO_TYPE[parsed.type];
    if (source && expectedType && source.type !== expectedType) errors.push(`${owner} reference ${ref} points to ${source.type}, expected ${expectedType}`);
  });
  (contract.claims || []).forEach((claim) => {
    if (!CONTRACT_CLAIM_TYPES.includes(claim.claimType)) errors.push(`claim ${claim.id} has invalid claimType ${claim.claimType}`);
    if (!CONTRACT_CLAIM_STATUSES.includes(claim.status || "")) errors.push(`claim ${claim.id} has invalid status ${claim.status}`);
    CONTRACT_FORBIDDEN_CLAIM_PHRASES.forEach((phrase) => {
      if (String(claim.text || "").includes(phrase)) errors.push(`claim ${claim.id} contains forbidden phrase ${phrase}`);
    });
    checkRefs(`claim ${claim.id}`, claim.sourceRefs);
  });
  (contract.timelineEvents || []).forEach((event) => {
    if (!TRACKS.includes(event.track)) errors.push(`timelineEvent ${event.id} has invalid track ${event.track}`);
    if (!Object.keys(TIMELINE_STATUS_META).includes(event.status)) errors.push(`timelineEvent ${event.id} has invalid status ${event.status}`);
    if (!["projected_from_sources", "planned_not_fact"].includes(event.schemaStatus)) errors.push(`timelineEvent ${event.id} has invalid schemaStatus ${event.schemaStatus}`);
    checkRefs(`timelineEvent ${event.id}`, event.sourceRefs);
  });
  (contract.timelineEpisodes || []).forEach((episode) => {
    if (!Object.keys(TIMELINE_STATUS_META).includes(episode.status)) errors.push(`timelineEpisode ${episode.id} has invalid status ${episode.status}`);
    checkRefs(`timelineEpisode ${episode.id}`, episode.sourceRefs);
  });
  (contract.timelineRelations || []).forEach((relation) => {
    if (!CONTRACT_RELATION_TYPES.includes(relation.relationType)) errors.push(`timelineRelation ${relation.id} has invalid relationType ${relation.relationType}`);
    checkRefs(`timelineRelation ${relation.id}`, relation.sourceRefs);
  });
  (contract.consentScopes || []).forEach((scope) => {
    if (!CONTRACT_CONSENT_STATUSES.includes(scope.status)) errors.push(`consentScope ${scope.id} has invalid status ${scope.status}`);
    checkRefs(`consentScope ${scope.id}`, scope.sourceRefs);
  });
  (contract.audit || []).forEach((entry) => {
    if (!CONTRACT_AUDIT_ACTION_TYPES.includes(entry.actionType)) errors.push(`audit ${entry.id} has invalid actionType ${entry.actionType}`);
  });
  collectContractSourceRefs(contract.domainData || {}).forEach((ref) => {
    if (ref !== SOURCE_MISSING_REF && !sourceRefs.has(ref)) errors.push(`domainData references missing source ${ref}`);
  });

  const eventIds = new Set((contract.timelineEvents || []).map((event) => event.id));
  (contract.timelineRelations || []).forEach((relation) => {
    if (!eventIds.has(relation.fromEventId)) errors.push(`timelineRelation ${relation.id} has missing fromEventId ${relation.fromEventId}`);
    if (!eventIds.has(relation.toEventId)) errors.push(`timelineRelation ${relation.id} has missing toEventId ${relation.toEventId}`);
    if (relation.causality !== "not_asserted") errors.push(`timelineRelation ${relation.id} must not assert causality`);
  });
  const expectedQuality = buildSourceQuality(contract);
  if (!contract.sourceQuality) {
    errors.push("sourceQuality is required");
  } else {
    ["sources", "claims", "sourceMissingCount"].forEach((key) => {
      if (contract.sourceQuality[key] !== expectedQuality[key]) errors.push(`sourceQuality.${key} should be ${expectedQuality[key]}`);
    });
  }

  return errors;
}

function buildActivePatientExport() {
  const exportState = buildLegacyActivePatientState(activePatient());
  const contract = buildDataContractExport(exportState);
  const errors = validateDataContract(contract);
  if (errors.length) {
    throw new Error(`Data Contract v${DATA_CONTRACT_VERSION} invalid:\n${errors.join("\n")}`);
  }
  return contract;
}

function exportDemoJson() {
  if (!confirmDemoAction(DEMO_EXPORT_WARNING)) return;
  let exportState;
  try {
    exportState = buildActivePatientExport();
  } catch (error) {
    window.alert(`Eksport zatrzymany: ${error.message}`);
    return;
  }
  const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pacjent-360-context-v${DATA_SCHEMA_VERSION}-${state.activePatientId}.json`;
  link.click();
  URL.revokeObjectURL(url);
  addAudit("wyeksportowano JSON demo", `aktywny pacjent demo: ${state.activePatientId}`);
  saveState();
}

function printCurrentView(scope = "bieżący widok demo") {
  if (!confirmDemoAction(DEMO_PRINT_WARNING)) return;
  addAudit("otwarto podgląd wydruku demo", scope);
  saveState();
  window.print();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.view);
    saveState();
    render();
  });
});

patientSelect.addEventListener("change", () => {
  state.activePatientId = patientSelect.value;
  state.activeCaseStudy = defaultCaseStudyForPatient(state.activePatientId);
  state.selectedSourceRef = null;
  state.selectedTimelineEventId = null;
  saveState();
  render();
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  saveState();
  renderView();
  refreshIcons();
});

document.querySelector("#closeEvidence").addEventListener("click", () => {
  state.selectedSourceRef = null;
  saveState();
  renderEvidence();
  refreshIcons();
});

document.querySelector("#resetDemo").addEventListener("click", () => {
  state = clone(demoState);
  saveState();
  showToast("Przywrócono dane demo.");
  render();
});

document.querySelector("#exportJson").addEventListener("click", () => {
  exportDemoJson();
});

document.querySelector("#printReport").addEventListener("click", () => printCurrentView());

render();

// Preferencje UI (szerokosc/zwijanie panelu zrodel) - poza stanem danych i kontraktem
const UI_PREFS_KEY = "pacjent360-ui-prefs-v1";

function loadUiPrefs() {
  try {
    return JSON.parse(localStorage.getItem(UI_PREFS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveUiPrefs(patch) {
  const prefs = { ...loadUiPrefs(), ...patch };
  localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
}

function initPanelSplitter() {
  const grid = document.getElementById("contentGrid");
  const splitter = document.getElementById("panelSplitter");
  const toggle = document.getElementById("toggleEvidence");
  if (!grid || !splitter || !toggle) return;

  const DEFAULT_W = 330;
  const MIN_W = 260;
  const MAX_W = 620;
  splitter.setAttribute("aria-valuemin", String(MIN_W));
  splitter.setAttribute("aria-valuemax", String(MAX_W));
  const clampWidth = (value) => Math.min(MAX_W, Math.max(MIN_W, Math.round(value)));
  const currentWidth = () => parseInt(grid.style.getPropertyValue("--evidence-w"), 10) || DEFAULT_W;
  const applyWidth = (value) => {
    const width = clampWidth(value);
    grid.style.setProperty("--evidence-w", `${width}px`);
    splitter.setAttribute("aria-valuenow", String(width));
    return width;
  };

  const setCollapsed = (collapsed) => {
    grid.classList.toggle("evidence-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    const label = collapsed ? "Rozwiń panel źródeł" : "Zwiń panel źródeł";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    const icon = toggle.querySelector("i");
    if (icon) {
      icon.setAttribute("data-lucide", collapsed ? "chevrons-left" : "chevrons-right");
      refreshIcons();
    }
    saveUiPrefs({ evidenceCollapsed: collapsed });
  };

  const prefs = loadUiPrefs();
  if (typeof prefs.evidenceWidth === "number") applyWidth(prefs.evidenceWidth);
  if (prefs.evidenceCollapsed) setCollapsed(true);

  toggle.addEventListener("click", () => {
    setCollapsed(!grid.classList.contains("evidence-collapsed"));
  });

  let dragStart = null;
  splitter.addEventListener("pointerdown", (event) => {
    if (grid.classList.contains("evidence-collapsed")) return;
    dragStart = { x: event.clientX, width: currentWidth() };
    splitter.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  splitter.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    applyWidth(dragStart.width + (dragStart.x - event.clientX));
  });
  const endDrag = () => {
    if (!dragStart) return;
    dragStart = null;
    saveUiPrefs({ evidenceWidth: currentWidth() });
  };
  splitter.addEventListener("pointerup", endDrag);
  splitter.addEventListener("pointercancel", endDrag);
  splitter.addEventListener("dblclick", () => {
    applyWidth(DEFAULT_W);
    saveUiPrefs({ evidenceWidth: DEFAULT_W });
  });
  splitter.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") applyWidth(currentWidth() + 24);
    if (event.key === "ArrowRight") applyWidth(currentWidth() - 24);
    if (event.key === "Home") applyWidth(DEFAULT_W);
    saveUiPrefs({ evidenceWidth: currentWidth() });
  });
}

initPanelSplitter();
