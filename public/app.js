const STORAGE_KEY = "pacjent360-state-v6";
const PATIENT360_CONTRACT = globalThis.Patient360Contract;
if (!PATIENT360_CONTRACT) {
  throw new Error("Missing patient360-contract.js");
}
const PATIENT360_MAP_MODEL = globalThis.Patient360MapModel;
if (!PATIENT360_MAP_MODEL) {
  throw new Error("Missing patient360-map-model.js");
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
  "timelineEvents",
  "timelineEpisodes",
  "timelineRelations",
  "conditions",
  "medications",
  "allergies",
  "observations",
  "flags",
  "knownUnknowns",
  "visitChecklists",
  "reports",
  "consents",
  "audit"
];

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
  "dalsza kontrola": { doctor: "dalsza kontrola", patient: "Lekarz sprawdzi", caregiver: "Czeka" },
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
      { color: "blue", title: "Cel kontaktu", question: "Czy cel dzisiejszego kontaktu z lekarzem jest jasno nazwany?", sourceRefs: ["decision:dc1"] },
      { color: "amber", title: "Kompletność danych", question: "Czy brakuje danych krytycznych dla tej decyzji?", sourceRefs: ["doc:d3"] },
      { color: "green", title: "Źródła", question: "Czy każda teza w raporcie ma źródło?", sourceRefs: ["doc:d1", "interview:i1"] }
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
      { color: "blue", title: "Soczewka specjalisty", question: "Czy raport pokazuje, co jest ważne dla tej specjalizacji?", sourceRefs: ["decision:dc1"] },
      { color: "amber", title: "Kontekst całościowy", question: "Czy specjalista widzi też leki, funkcjonowanie i wywiad?", sourceRefs: ["interview:i1"] }
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
      { color: "red", title: "Nowa zmiana", question: "Czy nowa zmiana stanu została potraktowana jako sygnał do wyjaśnienia?", sourceRefs: ["interview:i1"] },
      { color: "amber", title: "Niepewność przyczyn", question: "Czy przyczyna zmiany nie została założona zbyt wcześnie?", sourceRefs: ["decision:dc1"] },
      { color: "blue", title: "Pytanie DITL", question: "Jakie pytanie lekarz musi rozstrzygnąć jako pierwsze?", sourceRefs: ["decision:dc1"] }
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
    uncertain: ["Objaw po zmianie leku może być działaniem niepożądanym, interakcją albo przypadkową zbieżnością czasową."],
    verify: ["Czy lekarz lub farmaceuta oznaczył listę leków jako uzgodnioną?"],
    flags: [
      { color: "amber", title: "Rozbieżność lekowa", question: "Czy dokumentacja zgadza się z realnym przyjmowaniem leków?", sourceRefs: ["interview:i1", "medication:m1"] },
      { color: "blue", title: "OTC i suplementy", question: "Czy zapytano o leki niewidoczne w dokumentacji?", sourceRefs: ["medication:m4"] },
      { color: "green", title: "Uzgodnienie", question: "Czy można oznaczyć listę leków jako potwierdzoną?", sourceRefs: ["interview:i1"] }
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
      { color: "green", title: "Plan kontroli", question: "Czy plan kontroli jest zapisany i zrozumiały?", sourceRefs: ["doc:d2"] },
      { color: "amber", title: "Luka po kontakcie", question: "Czy wiadomo, co wydarzyło się między dokumentem a dzisiejszym stanem?", sourceRefs: ["interview:i1"] },
      { color: "blue", title: "Odpowiedzialność", question: "Kto jest odpowiedzialny za następny krok?", sourceRefs: ["decision:dc1"] }
    ],
    questions: [
      "Co zapisano w planie z poprzedniego etapu?",
      "Co faktycznie wykonano?",
      "Kto i kiedy ma sprawdzić brakujące dane?"
    ]
  }
];

const demoState = {
  activePatientId: "p1",
  activeView: "core",
  reportType: "context",
  activeCaseStudy: "procedure-readiness",
  timelinePeriod: "episode",
  timelineDetail: "standard",
  timelineZoom: 0.9,
  specialist: "internist",
  search: "",
  selectedSourceRef: null,
  selectedTimelineEventId: null,
  patients: [
    {
      id: "p1",
      name: "Przypadek standardowy A",
      birthDate: "1972-04-14",
      sex: "M",
      height: 178,
      weight: 84,
      guardian: "brak",
      baselineState: "Pacjent samodzielny, leczony ambulatoryjnie z powodu chorób przewlekłych, przygotowywany do planowej procedury.",
      currentProblem: "Kwalifikacja do planowej procedury jednodniowej; do uporządkowania są leki, wyniki kontrolne i dokumenty z konsultacji.",
      biggestChange: "W dokumentacji pojawiła się potrzeba potwierdzenia aktualnej listy leków oraz brakujących danych przed procedurą.",
      decisionToday: "Czy komplet danych wymaganych przed planową procedurą został potwierdzony przez lekarza?",
      patientSummary: "Masz zaplanowaną procedurę jednodniową. Masz 4 leki, a 1 wymaga potwierdzenia z lekarzem. Masz aktualne wyniki laboratoryjne. Brakuje aktualnego EKG w danych demo.",
      patientQuestion: "Co warto omówić z lekarzem: potwierdź listę leków, zapytaj o przygotowanie do procedury, sprawdź czy wyniki są kompletne.",
      consentScope: "pełny widok 360 do 2026-06-20"
    },
    {
      id: "p2",
      name: "Przypadek standardowy B",
      birthDate: "1958-03-02",
      sex: "M",
      height: 176,
      weight: 92,
      guardian: "brak",
      baselineState: "Samodzielny, aktywny zawodowo, bez zgłaszanych ograniczeń funkcjonalnych.",
      currentProblem: "Kontrola kardiologiczna po nieznacznie podwyższonym NT-proBNP.",
      biggestChange: "Brak nowych objawów zgłoszonych w danych demo.",
      decisionToday: "Czy obecne dane wystarczają do rutynowej kontroli specjalistycznej?",
      patientSummary: "Masz kontrolę kardiologiczną. Masz 1 lek do potwierdzenia, czy nadal jest przyjmowany. Ostatnie echo serca jest z kwietnia.",
      patientQuestion: "Co warto omówić z lekarzem: potwierdź, czy przyjmujesz atorwastatynę, zapytaj o wynik echa.",
      consentScope: "raport kardiologiczny do 2026-06-12"
    }
  ],
  decisionContexts: [
    {
      id: "dc1",
      patientId: "p1",
      type: "Gotowość do procedury",
      clinicalQuestion: "Co lekarz musi wyjaśnić przed decyzją o planowanej procedurze?", // demoState decisionContext
      contactDate: "2026-06-06",
      status: "DITL: do oceny lekarza",
      sourceRefs: ["doc:d1", "doc:d2", "interview:i1"],
      ditlQuestions: [
        {
          id: "hq1",
          question: "Czy aktualna lista leków została potwierdzona z pacjentem?",
          status: "do wyjaśnienia",
          sourceRefs: ["interview:i1", "medication:m1", "medication:m4"]
        },
        {
          id: "hq2",
          question: "Czy plan postępowania z lekiem wymagającym przerwy przed procedurą jest udokumentowany?",
          status: "do wyjaśnienia",
          sourceRefs: ["doc:d3", "medication:m1"]
        },
        {
          id: "hq3",
          question: "Czy aktualne wyniki kontrolne są kompletne przed kwalifikacją?",
          status: "dalsza kontrola",
          sourceRefs: ["observation:o1", "doc:d2"]
        },
        {
          id: "hq4",
          question: "Czy pacjent otrzymał jasną informację o przygotowaniu, terminie i kontroli po procedurze?",
          status: "do wyjaśnienia",
          sourceRefs: ["interview:i1", "decision:dc1"]
        }
      ]
    },
    {
      id: "dc2",
      patientId: "p2",
      type: "Kontrola kardiologiczna",
      clinicalQuestion: "Jakie pytania trzeba wyjaśnić przed rutynową kontrolą specjalistyczną?", // demoState decisionContext
      contactDate: "2026-06-06",
      status: "DITL: do oceny lekarza",
      sourceRefs: ["doc:d4"],
      ditlQuestions: [
        {
          id: "hq5",
          question: "Czy pacjent zgłasza nowe duszności, omdlenia, ból w klatce lub obrzęki od ostatniego echa?",
          status: "do wyjaśnienia",
          sourceRefs: ["doc:d4"]
        }
      ]
    }
  ],
  documents: [
    {
      id: "d1",
      patientId: "p1",
      type: "Ankieta",
      title: "Ankieta kwalifikacyjna przed procedurą",
      date: "2026-05-18",
      eventDate: "2026-05-12",
      facility: "Poradnia Procedur Jednodniowych",
      author: "system rejestracji",
      quality: "oryginał PDF",
      extractionStatus: "przetworzony",
      trust: "wysoki",
      source: "import PDF",
      summary: "Standardowa ankieta przed procedurą: choroby przewlekłe, leki, alergie i potrzeba aktualizacji dokumentów."
    },
    {
      id: "d2",
      patientId: "p1",
      type: "Laboratorium",
      title: "Panel laboratoryjny kontrolny",
      date: "2026-05-30",
      eventDate: "2026-05-30",
      facility: "Laboratorium Diagnostyczne Alfa",
      author: "system LIS",
      quality: "wynik elektroniczny",
      extractionStatus: "przetworzony",
      trust: "wysoki",
      source: "ręczne dodanie",
      summary: "Wyniki kontrolne przed procedurą: morfologia, kreatynina, potas i glukoza do interpretacji przez lekarza."
    },
    {
      id: "d3",
      patientId: "p1",
      type: "Konsultacja",
      title: "Konsultacja kwalifikacyjna przed procedurą",
      date: "2026-05-25",
      eventDate: "2026-05-25",
      facility: "Poradnia Specjalistyczna Beta",
      author: "lek. specjalista",
      quality: "skan",
      extractionStatus: "wymaga weryfikacji",
      trust: "średni",
      source: "zdjęcie dokumentu",
      summary: "Zalecono aktualne EKG, potwierdzenie listy leków i decyzję lekarza dotyczącą przygotowania do procedury."
    },
    {
      id: "d4",
      patientId: "p2",
      type: "Echo serca",
      title: "Echo serca kontrolne",
      date: "2026-04-10",
      eventDate: "2026-04-10",
      facility: "Centrum Kardiologii",
      author: "lek. A. Przykładowy",
      quality: "oryginał PDF",
      extractionStatus: "przetworzony",
      trust: "wysoki",
      source: "import PDF",
      summary: "Frakcja wyrzutowa 50%, łagodna niedomykalność mitralna."
    }
  ],
  interviews: [
    {
      id: "i1",
      patientId: "p1",
      date: "2026-06-02",
      scenario: "Wywiad przedwizytowy z pacjentem",
      speaker: "pacjent",
      confidence: "wysoka",
      answers: {
        baseline: "Pacjent deklaruje samodzielne funkcjonowanie i regularne wizyty kontrolne w poradni.",
        current: "Pacjent zgłasza planowaną procedurę jednodniową i potrzebę uporządkowania dokumentów przed kwalifikacją.",
        symptoms: "Pacjent nie zgłasza nowych objawów alarmowych. Do potwierdzenia pozostaje aktualny stan w dniu wizyty.",
        function: "Pacjent samodzielny w codziennych czynnościach; do ustalenia pozostają transport i plan po procedurze.",
        medications: "Pacjent deklaruje lek wymagający decyzji przed procedurą, lek przewlekły B oraz suplement OTC. Dawki wymagają porównania z dokumentacją.",
        family: "Pacjent chce potwierdzić, jakie dokumenty i wyniki powinien mieć przy sobie w dniu kwalifikacji."
      },
      transcript:
        "Pacjent: Mam zaplanowaną procedurę jednodniową. Chcę uporządkować dokumenty przed kwalifikacją. Przyjmuję lek wymagający decyzji przed procedurą, lek przewlekły B i suplement OTC. Nie wiem, czy potrzebne jest aktualne EKG i które wyniki powinienem mieć przy sobie.",
      sourceRefs: ["doc:d1"]
    },
    {
      id: "i2",
      patientId: "p2",
      date: "2026-06-05",
      scenario: "Wywiad przed kontrolą kardiologiczną",
      speaker: "pacjent",
      confidence: "wysoka",
      answers: {
        baseline: "Pacjent z kontrolowanym nadciśnieniem i łagodną wadą zastawkową.",
        current: "Kontrola kardiologiczna: omówienie echa i potwierdzenie planu dalszych wizyt.",
        symptoms: "Pacjent nie zgłasza nowych objawów. Brak duszności, omdleń i obrzęków w wywiadzie demo.",
        function: "Samodzielny, aktywny fizycznie w stopniu umiarkowanym.",
        medications: "Atorwastatyna 20 mg: pacjent chce potwierdzić, czy nadal ją przyjmuje.",
        family: "Pacjent chce omówić wynik echa i plan dalszych kontroli."
      },
      transcript:
        "Pacjent: Przychodzę na kontrolę po echu. Czuję się dobrze, nie mam nowych objawów. Mam w dokumentach atorwastatynę, ale chcę potwierdzić, czy nadal ją przyjmuję. Chciałbym wiedzieć, co z wynikiem echa.",
      sourceRefs: ["doc:d4"]
    }
  ],
  timelineEvents: [
    {
      id: "te1",
      patientId: "p1",
      date: "2026-05-12",
      track: "konsultacje",
      episodeId: "ep1",
      status: "potwierdzone",
      title: "Rozpoczęcie kwalifikacji do procedury",
      description: "Wprowadzono ankietę kwalifikacyjną i listę dokumentów do uzupełnienia.",
      confidence: "wysoka",
      sourceRefs: ["doc:d1"]
    },
    {
      id: "te2",
      patientId: "p1",
      date: "2026-05-18",
      track: "leki",
      episodeId: "ep1",
      status: "do potwierdzenia",
      title: "Lista leków wymaga uzgodnienia",
      description: "Pacjent deklaruje lek wymagający decyzji przed procedurą oraz suplement OTC.",
      confidence: "wysoka",
      sourceRefs: ["doc:d1", "medication:m1", "medication:m4"]
    },
    {
      id: "te3",
      patientId: "p1",
      date: "2026-05-25",
      track: "konsultacje",
      episodeId: "ep1",
      status: "do potwierdzenia",
      title: "Konsultacja kwalifikacyjna przed procedurą",
      description: "Wskazano potrzebę aktualnego EKG, wyników kontrolnych i potwierdzenia leków.",
      confidence: "średnia",
      sourceRefs: ["doc:d3"]
    },
    {
      id: "te4",
      patientId: "p1",
      date: "2026-05-30",
      track: "badania",
      episodeId: "ep1",
      status: "potwierdzone",
      title: "Wyniki kontrolne przed kwalifikacją",
      description: "Morfologia, kreatynina, potas i glukoza dostępne do interpretacji przez lekarza.",
      confidence: "wysoka",
      sourceRefs: ["doc:d2", "observation:o1", "observation:o2", "observation:o3"]
    },
    {
      id: "te5",
      patientId: "p1",
      date: "2026-06-02",
      track: "obserwacje z wywiadu",
      episodeId: "ep1",
      status: "do potwierdzenia",
      title: "Wywiad pacjenta przed kwalifikacją",
      description: "Pacjent chce potwierdzić listę dokumentów, leków i wyników potrzebnych w dniu kwalifikacji.",
      confidence: "wysoka",
      sourceRefs: ["interview:i1", "transcript:i1"]
    },
    {
      id: "te6",
      patientId: "p1",
      date: "2026-06-06",
      track: "decyzje medyczne",
      episodeId: "ep1",
      status: "planowane",
      title: "Procedura: pytania do rozstrzygnięcia przez lekarza",
      description: "Kontekst decyzji DITL przed planowaną procedurą.",
      confidence: "wysoka",
      sourceRefs: ["decision:dc1"]
    },
    {
      id: "te7",
      patientId: "p2",
      date: "2026-04-10",
      track: "badania",
      episodeId: "ep2",
      status: "potwierdzone",
      title: "Echo serca kontrolne",
      description: "EF 50%, łagodna niedomykalność mitralna.",
      confidence: "wysoka",
      sourceRefs: ["doc:d4"]
    },
    {
      id: "te8",
      patientId: "p2",
      date: "2026-06-05",
      track: "obserwacje z wywiadu",
      episodeId: "ep2",
      status: "do potwierdzenia",
      title: "Wywiad przed kontrolą kardiologiczną",
      description: "Pacjent zgłasza brak nowych objawów. Chce omówić wynik echa i status leku.",
      confidence: "wysoka",
      sourceRefs: ["interview:i2"]
    },
    {
      id: "te9",
      patientId: "p2",
      date: "2026-06-15",
      track: "konsultacje",
      episodeId: "ep2",
      status: "planowane",
      title: "Planowana kontrola kardiologiczna",
      description: "Kontrola po echu: omówienie frakcji wyrzutowej i dalszego planu kontroli.",
      confidence: "wysoka",
      sourceRefs: ["doc:d4", "decision:dc2"]
    }
  ],
  timelineEpisodes: [
    {
      id: "ep1",
      patientId: "p1",
      title: "Przygotowanie do planowej procedury",
      startDate: "2026-05-12",
      endDate: "2026-06-06",
      status: "do potwierdzenia",
      summary: "Epizod porządkuje dokumenty, leki, wyniki i pytania przed planowaną procedurą. Nie rozstrzyga gotowości medycznej.",
      sourceRefs: ["doc:d1", "doc:d2", "interview:i1", "decision:dc1"]
    },
    {
      id: "ep2",
      patientId: "p2",
      title: "Kontrola kardiologiczna po echu",
      startDate: "2026-04-10",
      endDate: "2026-06-15",
      status: "planowane",
      summary: "Epizod łączy wynik echa, wywiad i planowaną kontrolę. Pytania pozostają do omówienia z lekarzem.",
      sourceRefs: ["doc:d4", "interview:i2", "decision:dc2"]
    }
  ],
  timelineRelations: [
    {
      id: "tr1",
      patientId: "p1",
      fromEventId: "te2",
      toEventId: "te6",
      relationType: "powiązane czasowo",
      label: "Lista leków jest elementem kontekstu przed planowaną procedurą.",
      status: "do potwierdzenia",
      sourceRefs: ["medication:m1", "decision:dc1"]
    },
    {
      id: "tr2",
      patientId: "p1",
      fromEventId: "te4",
      toEventId: "te6",
      relationType: "powiązane źródłem",
      label: "Wyniki kontrolne są źródłem w raporcie kontekstowym przed procedurą.",
      status: "potwierdzone",
      sourceRefs: ["doc:d2", "decision:dc1"]
    },
    {
      id: "tr3",
      patientId: "p2",
      fromEventId: "te7",
      toEventId: "te9",
      relationType: "powiązane czasowo",
      label: "Kontrola jest planowanym kontaktem po badaniu echo.",
      status: "planowane",
      sourceRefs: ["doc:d4", "decision:dc2"]
    }
  ],
  conditions: [
    {
      id: "c1",
      patientId: "p1",
      name: "Nadciśnienie tętnicze",
      status: "aktywny",
      certainty: "wysoka",
      since: "2018",
      sourceRefs: ["doc:d1"]
    },
    {
      id: "c2",
      patientId: "p1",
      name: "Przewlekła choroba nerek, podejrzenie stadium 3",
      status: "podejrzenie",
      certainty: "średnia",
      since: "2026-05",
      sourceRefs: ["doc:d1", "observation:o2"]
    },
    {
      id: "c3",
      patientId: "p1",
      name: "Hb do wyjaśnienia z lekarzem",
      status: "niejasny",
      certainty: "średnia",
      since: "2026-05",
      sourceRefs: ["doc:d2", "observation:o3"]
    },
    {
      id: "c4",
      patientId: "p2",
      name: "Nadciśnienie tętnicze",
      status: "aktywny",
      certainty: "wysoka",
      since: "2012",
      sourceRefs: ["doc:d4"]
    }
  ],
  medications: [
    {
      id: "m1",
      patientId: "p1",
      name: "Lek wymagający decyzji przed procedurą",
      substance: "lek przewlekły wymagający planu",
      dose: "dawka z dokumentacji",
      frequency: "2x dziennie",
      from: "2024-11-02",
      to: "",
      status: "aktywny",
      actualStatus: "zgłoszony jako przyjmowany",
      indication: "kontekst przewlekły z dokumentacji demo",
      sourceRefs: ["doc:d1", "interview:i1"],
      story: "Lek widoczny w dokumentacji i deklarowany przez pacjenta. Brak jednoznacznego planu przygotowania przed procedurą.",
      symptomLink: "",
      question: "Czy plan postępowania z tym lekiem przed procedurą został potwierdzony przez lekarza?"
    },
    {
      id: "m2",
      patientId: "p1",
      name: "Lek przewlekły B",
      substance: "lek przewlekły",
      dose: "dawka z dokumentacji",
      frequency: "1x dziennie",
      from: "2018-06-10",
      to: "",
      status: "aktywny",
      actualStatus: "zgłoszony jako przyjmowany",
      indication: "choroba przewlekła z dokumentacji demo",
      sourceRefs: ["doc:d1", "interview:i1"],
      story: "Lek przewlekły widoczny w dokumentacji i potwierdzony w wywiadzie pacjenta.",
      symptomLink: "",
      question: "Czy dawka i kontrola kreatyniny/potasu są adekwatne do aktualnego stanu nerek?"
    },
    {
      id: "m3",
      patientId: "p1",
      name: "Lek doraźny C",
      substance: "lek doraźny",
      dose: "dawka z dokumentacji",
      frequency: "doraźnie",
      from: "2026-05-18",
      to: "",
      status: "aktywny",
      actualStatus: "deklarowany przez pacjenta",
      indication: "stosowanie doraźne w danych demo",
      sourceRefs: ["doc:d1", "interview:i1", "transcript:i1"],
      story: "Lek doraźny zgłoszony w wywiadzie. Dawka i częstość stosowania wymagają porównania z dokumentacją.",
      symptomLink: "stosowanie doraźne przed procedurą",
      question: "Czy lek doraźny został uwzględniony w przygotowaniu do procedury?"
    },
    {
      id: "m4",
      patientId: "p1",
      name: "Preparat magnezu OTC",
      substance: "magnez",
      dose: "brak danych",
      frequency: "nieregularnie",
      from: "2026-05",
      to: "",
      status: "OTC/suplement",
      actualStatus: "niepotwierdzone",
      indication: "suplement OTC zgłoszony przez pacjenta",
      sourceRefs: ["interview:i1"],
      story: "Suplement zgłoszony w wywiadzie, brak danych o dawce i składzie.",
      symptomLink: "",
      question: "Czy OTC i suplementy zostały wpisane do uzgodnionej listy leków?"
    },
    {
      id: "m5",
      patientId: "p2",
      name: "Atorwastatyna",
      substance: "atorwastatyna",
      dose: "20 mg",
      frequency: "1x wieczorem",
      from: "2020-02-01",
      to: "",
      status: "aktywny",
      actualStatus: "niepotwierdzone w wywiadzie",
      indication: "hiperlipidemia",
      sourceRefs: ["doc:d4"],
      story: "Lek widoczny w dokumentacji demo; brak świeżego wywiadu o realnym przyjmowaniu.",
      symptomLink: "",
      question: "Czy pacjent nadal faktycznie przyjmuje lek zgodnie z dokumentacją?"
    }
  ],
  allergies: [
    {
      id: "a1",
      patientId: "p1",
      substance: "penicylina",
      reaction: "wysypka w dzieciństwie",
      certainty: "niska",
      sourceRefs: ["doc:d1"]
    }
  ],
  observations: [
    {
      id: "o1",
      patientId: "p1",
      name: "Glukoza",
      type: "laboratorium",
      unit: "mg/dl",
      normalMin: 70,
      normalMax: 99,
      values: [
        { date: "2026-04-15", value: 101, sourceRefs: ["doc:d1"] },
        { date: "2026-05-12", value: 104, sourceRefs: ["doc:d1"] },
        { date: "2026-05-30", value: 98, sourceRefs: ["doc:d2"] }
      ]
    },
    {
      id: "o2",
      patientId: "p1",
      name: "Kreatynina",
      type: "laboratorium",
      unit: "mg/dl",
      normalMin: 0.5,
      normalMax: 1.1,
      values: [
        { date: "2026-04-15", value: 1.0, sourceRefs: ["doc:d1"] },
        { date: "2026-05-12", value: 1.0, sourceRefs: ["doc:d1"] },
        { date: "2026-05-30", value: 1.05, sourceRefs: ["doc:d2"] }
      ]
    },
    {
      id: "o3",
      patientId: "p1",
      name: "Hemoglobina",
      type: "laboratorium",
      unit: "g/dl",
      normalMin: 12,
      normalMax: 16,
      values: [
        { date: "2026-04-15", value: 14.2, sourceRefs: ["doc:d1"] },
        { date: "2026-05-12", value: 14.1, sourceRefs: ["doc:d1"] },
        { date: "2026-05-30", value: 14.0, sourceRefs: ["doc:d2"] }
      ]
    },
    {
      id: "o4",
      patientId: "p1",
      name: "Potas",
      type: "laboratorium",
      unit: "mmol/l",
      normalMin: 3.5,
      normalMax: 5.1,
      values: [
        { date: "2026-04-15", value: 4.3, sourceRefs: ["doc:d1"] },
        { date: "2026-05-12", value: 4.2, sourceRefs: ["doc:d1"] },
        { date: "2026-05-30", value: 4.1, sourceRefs: ["doc:d2"] }
      ]
    },
    {
      id: "o5",
      patientId: "p2",
      name: "NT-proBNP",
      type: "laboratorium",
      unit: "pg/ml",
      normalMin: 0,
      normalMax: 125,
      values: [
        { date: "2026-03-20", value: 220, sourceRefs: ["doc:d4"] },
        { date: "2026-04-10", value: 190, sourceRefs: ["doc:d4"] }
      ]
    }
  ],
  flags: [
    {
      id: "f1",
      patientId: "p1",
      color: "red",
      category: "Lek wymagający planu przed procedurą",
      question: "Czy istnieje indywidualny plan postępowania z lekiem wymagającym decyzji przed procedurą?",
      evidence: "Planowana procedura i aktywny lek przewlekły; dokument kwalifikacyjny wymaga weryfikacji.",
      status: "do wyjaśnienia",
      sourceRefs: ["doc:d3", "medication:m1"]
    },
    {
      id: "f2",
      patientId: "p1",
      color: "amber",
      category: "Brak aktualnego EKG",
      question: "Czy aktualne EKG jest dostępne albo lekarz uznał, że nie jest potrzebne?",
      evidence: "Konsultacja kwalifikacyjna wskazuje potrzebę aktualnego EKG; brak wyniku w danych demo.",
      status: "do wyjaśnienia",
      sourceRefs: ["doc:d3"]
    },
    {
      id: "f3",
      patientId: "p1",
      color: "amber",
      category: "Niepewność danych lekowych",
      question: "Czy OTC, suplementy i realne przyjmowanie leków zostały uzgodnione z pacjentem?",
      evidence: "Wywiad zawiera suplement OTC bez dawki i niepełną pewność co do listy leków.",
      status: "dalsza kontrola",
      sourceRefs: ["interview:i1", "medication:m4"]
    },
    {
      id: "f4",
      patientId: "p1",
      color: "amber",
      category: "Brak potwierdzenia przygotowania",
      question: "Czy pacjent otrzymał jasną informację o przygotowaniu do procedury?",
      evidence: "Wywiad wskazuje pytanie pacjenta o dokumenty, wyniki i przygotowanie.",
      status: "do wyjaśnienia",
      sourceRefs: ["interview:i1", "decision:dc1"]
    },
    {
      id: "f5",
      patientId: "p1",
      color: "green",
      category: "Wyniki kontrolne dostępne",
      question: "Czy dostępne wyniki kontrolne są wystarczające do kwalifikacji?",
      evidence: "Morfologia, kreatynina, potas i glukoza są dostępne w panelu kontrolnym.",
      status: "dalsza kontrola",
      sourceRefs: ["observation:o1", "doc:d2"]
    },
    {
      id: "f6",
      patientId: "p1",
      color: "blue",
      category: "Pytanie DITL: kompletność kwalifikacji",
      question: "Czy komplet dokumentów, leków i wyników jest wystarczający przed procedurą?",
      evidence: "Ankieta, konsultacja, wywiad i wyniki muszą zostać rozpatrzone razem.",
      status: "do wyjaśnienia",
      sourceRefs: ["decision:dc1", "doc:d1", "doc:d2", "interview:i1"]
    },
    {
      id: "f7",
      patientId: "p2",
      color: "green",
      category: "Brak nowych alarmów w dokumentach demo",
      question: "Czy brak nowych objawów został potwierdzony w wywiadzie przed kontrolą?",
      evidence: "Dane demo nie zawierają nowych ostrych kontaktów medycznych ani sygnałów wymagających sprawdzenia.",
      status: "do wyjaśnienia",
      sourceRefs: ["doc:d4"]
    }
  ],
  knownUnknowns: [
    {
      id: "ku1",
      patientId: "p1",
      category: "Known",
      description: "Panel wyników kontrolnych został dodany 30.05.2026.",
      sourceRefs: ["observation:o1", "doc:d1", "doc:d2"]
    },
    {
      id: "ku2",
      patientId: "p1",
      category: "Known",
      description: "Pacjent potwierdził w wywiadzie stosowanie leków przewlekłych i suplementu OTC.",
      sourceRefs: ["interview:i1", "transcript:i1", "medication:m3"]
    },
    {
      id: "ku3",
      patientId: "p1",
      category: "Unknown",
      description: "Brak w danych demo aktualnego EKG po konsultacji kwalifikacyjnej.",
      sourceRefs: ["doc:d3"]
    },
    {
      id: "ku4",
      patientId: "p1",
      category: "Unknown",
      description: "Brak potwierdzenia, czy pacjent otrzymał kompletną instrukcję przygotowania do procedury.",
      sourceRefs: ["doc:d1", "doc:d2"]
    },
    {
      id: "ku5",
      patientId: "p1",
      category: "Uncertain",
      description: "Dawka suplementu OTC i częstość stosowania leku doraźnego nie są jednoznacznie potwierdzone.",
      sourceRefs: ["interview:i1", "medication:m3"]
    },
    {
      id: "ku6",
      patientId: "p1",
      category: "To verify",
      description: "Do potwierdzenia z lekarzem: plan przed procedurą dla leku wymagającego decyzji.",
      sourceRefs: ["medication:m1", "doc:d3"]
    },
    {
      id: "ku7",
      patientId: "p2",
      category: "Unknown",
      description: "Czy pacjent faktycznie przyjmuje atorwastatynę regularnie?",
      sourceRefs: ["medication:m5", "interview:i2"]
    },
    {
      id: "ku8",
      patientId: "p2",
      category: "To verify",
      description: "Czy wynik echa z kwietnia został omówiony podczas kontroli?",
      sourceRefs: ["doc:d4", "interview:i2"]
    }
  ],
  reports: [
    {
      id: "rep1",
      patientId: "p1",
      type: "Raport kontekstowy Pacjent 360",
      generatedAt: "2026-06-01T09:30:00",
      version: "1.0",
      author: "Pacjent 360",
      status: "DITL: do oceny lekarza",
      sourceRefs: ["doc:d1", "doc:d2", "doc:d3", "interview:i1"]
    }
  ],
  visitChecklists: [
    {
      id: "vc1",
      patientId: "p1",
      visitDate: "2026-06-10",
      visitType: "Kwalifikacja do procedury",
      items: [
        { id: "vci1", label: "Aktualne wyniki laboratoryjne", status: "gotowe", sourceRefs: ["doc:d2"] },
        { id: "vci2", label: "Aktualne EKG", status: "brak", sourceRefs: ["decision:dc1"] },
        { id: "vci3", label: "Lista leków potwierdzona z lekarzem", status: "do potwierdzenia", sourceRefs: ["interview:i1", "medication:m1"] },
        { id: "vci4", label: "Pytania do lekarza zapisane", status: "gotowe", sourceRefs: ["interview:i1"] },
        { id: "vci5", label: "Dokument tożsamości", status: "gotowe", sourceRefs: ["decision:dc1"] },
        { id: "vci6", label: "Skierowanie lub karta kwalifikacyjna", status: "do potwierdzenia", sourceRefs: ["doc:d3"] }
      ]
    },
    {
      id: "vc2",
      patientId: "p2",
      visitDate: "2026-06-15",
      visitType: "Kontrola kardiologiczna",
      items: [
        { id: "vci7", label: "Wynik ostatniego echa serca", status: "gotowe", sourceRefs: ["doc:d4"] },
        { id: "vci8", label: "Lista aktualnych leków", status: "do potwierdzenia", sourceRefs: ["interview:i2", "medication:m5"] },
        { id: "vci9", label: "Pytania do kardiologa", status: "brak", sourceRefs: ["interview:i2"] }
      ]
    }
  ],
  consents: [
    {
      id: "g1",
      patientId: "p1",
      subject: "Poradnia kwalifikacyjna",
      scope: "raport kontekstowy + źródła",
      role: "osoba wspierająca",
      caregiverId: "facility-qualification",
      caregiverName: "Poradnia kwalifikacyjna",
      areas: ["documents", "report"],
      validTo: "2026-06-20",
      status: "aktywny",
      sourceRefs: ["consent:g1", "doc:d3", "report:rep1"]
    },
    {
      id: "g2",
      patientId: "p1",
      subject: "Pacjent",
      scope: "wywiad pacjenta + podsumowanie wizyty",
      role: "pacjent",
      caregiverId: "patient-self",
      caregiverName: "Pacjent",
      areas: ["observations", "report"],
      validTo: "2026-12-31",
      status: "aktywny",
      sourceRefs: ["consent:g2", "interview:i1", "transcript:i1"]
    },
    {
      id: "g3",
      patientId: "p1",
      subject: "Anna K. - opiekun lekowy",
      scope: "leki, zadania lekowe, przypomnienia i pytania o uzgodnienie listy leków",
      role: "opiekun lekowy",
      caregiverId: "cg-med-p1",
      caregiverName: "Anna K.",
      areas: ["medications", "tasks"],
      validTo: "2026-09-30",
      status: "aktywny",
      sourceRefs: ["consent:g3", "interview:i1", "medication:m1"]
    },
    {
      id: "g4",
      patientId: "p1",
      subject: "Piotr K. - opiekun wizyt",
      scope: "wizyty, dokumenty i raport kontekstowy",
      role: "opiekun wizyt",
      caregiverId: "cg-visit-p1",
      caregiverName: "Piotr K.",
      areas: ["visits", "documents", "report"],
      validTo: "2026-06-15",
      status: "cofnięty",
      sourceRefs: ["consent:g4", "doc:d3", "decision:dc1"]
    }
  ],
  audit: [
    {
      id: "u1",
      patientId: "p1",
      date: "2026-06-01T09:30:00",
      actor: "Pacjent 360",
      action: "wygenerowano raport kontekstowy",
      scope: "raport, źródła d1-d3, wywiad i1"
    },
    {
      id: "u2",
      patientId: "p1",
      date: "2026-06-02T12:04:00",
      actor: "Pacjent",
      action: "dodano wywiad pacjenta",
      scope: "transkrypcja i odpowiedzi strukturalne"
    }
  ]
};

let state = loadState();

const viewRoot = document.querySelector("#viewRoot");
const evidenceRoot = document.querySelector("#evidenceRoot");
const patientSelect = document.querySelector("#patientSelect");
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

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const loaded = sanitizeLegacyStateCopy(stored ? mergeStateWithDemoDefaults(JSON.parse(stored)) : clone(demoState));
    if (!REPORT_CASE_STUDIES.some((caseStudy) => caseStudy.id === loaded.activeCaseStudy)) {
      loaded.activeCaseStudy = REPORT_CASE_STUDIES[0].id;
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
    if (stored) {
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

function byPatient(collection) {
  return collection.filter((item) => item.patientId === state.activePatientId);
}

function activeDecision() {
  return byPatient(state.decisionContexts).sort((a, b) => new Date(b.contactDate) - new Date(a.contactDate))[0];
}

function activeCaseStudy() {
  return REPORT_CASE_STUDIES.find((caseStudy) => caseStudy.id === state.activeCaseStudy) || REPORT_CASE_STUDIES[0];
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
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const today = new Date("2026-06-06T12:00:00");
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
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
  if (state === "below") return "poniżej zakresu ze źródła";
  if (state === "above") return "powyżej zakresu ze źródła";
  if (state === "within") return "w zakresie ze źródła";
  return "brak danych";
}

function observationStatusClass(observation) {
  const state = observationRangeState(observation);
  if (state === "within") return "done";
  if (state === "unknown") return "info";
  return "pending";
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
  if (parsed.type === "decision") return `Decyzja: ${record.type}`;
  if (parsed.type === "consent") return `Zgoda: ${record.subject}`;
  return String(ref);
}

function sourceChips(refs) {
  const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
  if (!list.length) return `<span class="tag">Brak źródła</span>`;
  return list
    .map((ref) => `<span class="source-chip"><button type="button" data-source-ref="${escapeHtml(ref)}" title="Pokaż źródło">${escapeHtml(sourceLabel(ref))}</button></span>`)
    .join("");
}

function render() {
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
  patientSelect.innerHTML = state.patients
    .map((patient) => `<option value="${escapeHtml(patient.id)}" ${patient.id === state.activePatientId ? "selected" : ""}>${escapeHtml(patient.name)}</option>`)
    .join("");
  searchInput.value = state.search;
}

function renderCriticalStrip() {
  const redFlags = byPatient(state.flags).filter((flag) => flag.color === "red" && flag.status !== "wyjaśnione" && flag.status !== "odrzucone");
  if (!redFlags.length) {
    criticalStrip.classList.remove("visible");
    criticalStrip.innerHTML = "";
    return;
  }
  criticalStrip.classList.add("visible");
  criticalStrip.innerHTML = `<i data-lucide="triangle-alert"></i><strong>${redFlags.length} sygnał DITL do sprawdzenia:</strong> ${escapeHtml(redFlags[0].question)}`;
}

function renderView() {
  const renderers = {
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

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.activeView);
  });

  viewRoot.innerHTML = (renderers[state.activeView] || renderCore)();
  bindViewActions();
  bindSourceButtons();
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
  return `
    <div class="page-intro">
      <div>
        <p class="eyebrow">Pacjent 360</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      ${dialogType ? `<div class="inline-actions"><button class="primary-button" data-open-dialog="${escapeHtml(dialogType)}"><i data-lucide="plus"></i>Dodaj</button></div>` : ""}
    </div>
  `;
}

function renderFullDataAccess(context = "clinician") {
  const configs = {
    clinician: {
      intro: "Kontekst lekarza korzysta z pełnej warstwy danych pacjenta.",
      title: "Dane pacjenta",
      items: [
        ["risks", "Flagi i sygnały", "shield-alert", "red/amber/green/blue do wyjaśnienia"],
        ["medications", "Leki - reconciliation", "pill", "przepisane vs faktycznie brane"],
        ["observations", "Wyniki do interpretacji", "activity", "wartości i zakresy ze źródła"],
        ["documents", "Źródła i dokumenty", "files", "jakość, zaufanie, braki"],
        ["reports", "Raport kontekstowy", "clipboard-list", "Known / Unknown / To verify"],
        ["timeline", "Mapa Pacjenta 360", "git-branch", "warstwowa historia i DITL"]
      ]
    },
    patient: {
      intro: "Twoje dane w jednym miejscu: dokumenty, wyniki, leki i pytania.",
      title: "Moje dane",
      items: [
        ["documents", "Moje dokumenty", "files", "wypisy, skierowania, wyniki PDF"],
        ["timeline", "Mapa Pacjenta 360", "git-branch", "wizyty i zdarzenia w jednej historii"],
        ["medications", "Moje leki", "pill", "co przyjmuję i co potwierdzić"],
        ["observations", "Moje wyniki", "activity", "badania i zakresy"],
        ["interview", "Moje pytania", "message-circle-question", "do rozmowy z lekarzem"],
        ["caregiverPortal", "Kokpit opiekuna", "users-round", "zakres dostępu rodziny i opiekuna"],
        ["consent", "Kto ma dostęp", "shield-check", "zarządzanie zgodami"]
      ]
    }
  };
  const config = configs[context] || configs.clinician;

  return `
    <section class="section-band full-data-hub">
      <div class="section-head">
        <div>
          <p class="eyebrow">Pełne dane</p>
          <h2><i data-lucide="database"></i> ${escapeHtml(config.title)}</h2>
        </div>
      </div>
      <p class="record-body">${escapeHtml(config.intro)}</p>
      <div class="full-data-grid">
        ${config.items.map(([view, label, icon, caption]) => `
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

function renderMedReconciliation() {
  const meds = byPatient(state.medications);
  const issues = meds.filter((med) =>
    normalize(med.actualStatus).includes("niepotwierd") ||
    normalize(med.actualStatus).includes("deklarow") ||
    med.status === "OTC/suplement"
  );
  if (!issues.length) return "";

  return `
    <section class="section-band med-reconciliation">
      <div class="section-head">
        <div>
          <p class="eyebrow">Medication reconciliation</p>
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
  const flags = byPatient(state.flags);
  const redFlags = flags.filter((flag) => flag.color === "red" && flag.status !== "wyjaśnione").slice(0, 5);
  const gaps = byPatient(state.knownUnknowns).filter((item) => item.category === "Unknown" || item.category === "To verify").slice(0, 3);
  const questions = [...(decision?.ditlQuestions || []), ...flags.filter((flag) => flag.color === "blue").map(flagToQuestion)].slice(0, 7);
  const decisionHeadline = decision ? decision.clinicalQuestion : patient.decisionToday;

  return `
    <div class="page-intro">
      <div>
        <p class="eyebrow">Kontekst wizyty i pytań DITL</p>
        <h1>Pacjent w 90 sekund</h1>
        <p>${escapeHtml(patient.name)}, ${calculateAge(patient.birthDate)} lat. System pokazuje pytania i luki do wyjaśnienia, bez automatycznej decyzji po stronie systemu.</p>
      </div>
      <div class="inline-actions">
        <button class="primary-button" data-open-dialog="decision"><i data-lucide="stethoscope"></i>Decyzja</button>
        <button class="primary-button" data-open-dialog="interview"><i data-lucide="messages-square"></i>Wywiad</button>
        <button class="ghost-button" data-set-view="reports"><i data-lucide="file-text"></i>Raport</button>
      </div>
    </div>

    <section class="context-chain" aria-label="Model kontekstu wizyty">
      ${["Historia pacjenta", "Stan", "Sygnały i luki", "Pytania do omówienia"].map((step) => `<span>${escapeHtml(step)}</span>`).join("<i data-lucide=\"chevron-right\"></i>")}
    </section>

    <div class="metric-grid">
      ${metric("Kontekst na dziś", decision?.type || "brak", decision?.status || "DITL", "stethoscope")}
      ${metric("Pytania DITL", questions.length, `${questions.filter((q) => q.status === "do wyjaśnienia").length} do wyjaśnienia`, "circle-help")}
      ${metric("Sygnały", flags.length, `${redFlags.length} do sprawdzenia`, "flag")}
      ${metric("Kompletność źródeł", `${qualityScore()}%`, "ile danych ma potwierdzone źródło", "database", "Procent elementów z potwierdzonym źródłem dokumentowym, laboratoryjnym lub z wywiadu. Nie jest oceną jakości opieki medycznej.")}
    </div>

    ${renderFullDataAccess("clinician")}
    ${renderMedReconciliation()}
    ${renderPatientMap360({ persona: "doctor", embedded: true })}

    <section class="section-band decision-hero">
      <div class="section-head">
        <div>
          <p class="eyebrow">Dzisiejszy kontekst wizyty</p>
          <h2>${escapeHtml(decisionHeadline)}</h2>
        </div>
        <span class="status-chip info">${escapeHtml(decision?.status || "DITL")}</span>
      </div>
      <p class="record-body">Kontakt: ${formatDate(decision?.contactDate)}. Lekarz oznacza każde pytanie jako wyjaśnione, odrzucone albo do dalszej kontroli.</p>
      <div class="source-line">${sourceChips(decision?.sourceRefs || [])}</div>
    </section>

    <div class="ninety-grid">
      ${renderNinetyCard("Stan bazowy", patient.baselineState, "user-round-check", ["interview:i1"])}
      ${renderNinetyCard("Aktualny problem", patient.currentProblem, "activity", decision?.sourceRefs || [])}
      ${renderNinetyCard("Największa zmiana", patient.biggestChange, "trending-up", ["interview:i1", "transcript:i1"])}
      ${renderNinetyList("Najważniejsze pytania do sprawdzenia", redFlags.map((flag) => flag.question), "triangle-alert", redFlags.flatMap((flag) => flag.sourceRefs))}
      ${renderNinetyList("Największe braki danych", gaps.map((gap) => gap.description), "search-x", gaps.flatMap((gap) => gap.sourceRefs))}
      ${renderNinetyCard("Pytanie decyzyjne", patient.decisionToday, "clipboard-check", ["decision:dc1"])}
    </div>

    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Doctor in the Loop</p>
          <h2>Pytania do lekarza</h2>
        </div>
      </div>
      <div class="ditl-grid">
        ${questions.map(renderDitlQuestion).join("") || emptyState("Brak pytań DITL dla pacjenta.")}
      </div>
    </section>

    <div class="three-column">
      ${renderCoreColumn("Historia pacjenta", storyBullets(patient), "book-open")}
      ${renderCoreColumn("Stan i dane", stateBullets(), "heart-pulse")}
      ${renderCoreColumn("Sygnały i luki", riskBullets(), "radar")}
    </div>
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
      <div class="source-line">${sourceChips(refs)}</div>
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
      <div class="source-line">${sourceChips(refs)}</div>
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

  return `
    ${pageHeader("Mój Pacjent 360", "Widok pacjenta: badania, wizyty, leki, dokumenty i pytania na rozmowę z lekarzem. Ustalenia pozostają po stronie lekarza.", "user-round")}
    <section class="section-band patient-home-hero">
      <div>
        <p class="eyebrow">Mój profil</p>
        <h2>${escapeHtml(patient.name)}</h2>
        <p>${calculateAge(patient.birthDate)} lat, ${escapeHtml(patient.sex)}. Kontakt wspierający: ${escapeHtml(patient.guardian || "brak danych")}.</p>
      </div>
      <div class="patient-home-note">
        <i data-lucide="info"></i>
        <span>Ten widok pomaga przygotować się do wizyty i zrozumieć własne dane. Nie zastępuje konsultacji lekarskiej.</span>
      </div>
    </section>

    <div class="patient-summary-grid">
      ${metric("Dokumenty", docs.length, "w historii pacjenta", "files")}
      ${metric("Wyniki", observations.length, "wartości i zakresy ze źródła", "activity")}
      ${metric("Leki", meds.length, "przepisane i faktycznie brane", "pill")}
      ${metric("Pytania", patientQuestions.length, "do omówienia z lekarzem", "message-circle-question")}
    </div>

    ${renderPreVisitFlow(preVisitModel)}
    ${renderFullDataAccess("patient")}
    ${renderPatientMap360({ persona: "patient", embedded: true })}

    <div class="patient-dashboard-grid">
      <section class="section-band patient-wide patient-narrative">
        <div class="section-head">
          <div>
            <p class="eyebrow">Moja historia</p>
            <h2><i data-lucide="book-open-text"></i> Moja sytuacja w prostych słowach</h2>
          </div>
        </div>
        <p class="patient-story">${escapeHtml(patient.patientSummary || "Brak podsumowania w danych demo.")}</p>
      </section>

      <section class="section-band patient-wide">
        <div class="section-head">
          <div>
            <p class="eyebrow">Przed wizytą</p>
            <h2><i data-lucide="clipboard-check"></i> Co przygotować</h2>
          </div>
          <button class="ghost-button" data-set-view="interview"><i data-lucide="messages-square"></i> Pytania</button>
        </div>
        <div class="patient-context-list">
          <article>
            <span>Moja sytuacja</span>
            <p>${escapeHtml(patient.currentProblem)}</p>
          </article>
          <article>
            <span>Co się zmieniło</span>
            <p>${escapeHtml(patient.biggestChange)}</p>
          </article>
          <article>
            <span>Co warto omówić z lekarzem</span>
            <p>${escapeHtml(patient.patientQuestion || "Brak pytań do przygotowania.")}</p>
            <div class="source-line">${sourceChips(decision?.sourceRefs || [`patient:${patient.id}`])}</div>
          </article>
        </div>
      </section>

      ${renderVisitChecklist()}

      <section class="section-band">
        <div class="section-head">
          <div>
            <p class="eyebrow">Wizyty i procedury</p>
            <h2><i data-lucide="calendar-clock"></i> Co jest przede mną</h2>
          </div>
        </div>
        <div class="record-list compact-records">
          ${upcoming.map(renderPatientUpcomingCard).join("") || emptyState("Brak zaplanowanych kontaktów w danych demo.")}
        </div>
      </section>

      <section class="section-band">
        <div class="section-head">
          <div>
            <p class="eyebrow">Pytania</p>
            <h2><i data-lucide="message-circle-question"></i> Do rozmowy z lekarzem</h2>
          </div>
        </div>
        <div class="record-list compact-records">
          ${patientQuestions.slice(0, 6).map(renderPatientQuestionCard).join("") || emptyState("Brak pytań do omówienia w danych demo.")}
        </div>
      </section>

      <section class="section-band">
        <div class="section-head">
          <div>
            <p class="eyebrow">Badania</p>
            <h2><i data-lucide="activity"></i> Ostatnie wyniki</h2>
          </div>
          <button class="ghost-button" data-set-view="observations"><i data-lucide="chart-no-axes-combined"></i> Wszystkie</button>
        </div>
        <div class="patient-result-list">
          ${observations.slice(0, 5).map(renderPatientResultRow).join("") || emptyState("Brak wyników w danych demo.")}
        </div>
      </section>

      <section class="section-band">
        <div class="section-head">
          <div>
            <p class="eyebrow">Leki</p>
            <h2><i data-lucide="pill"></i> Co przyjmuję</h2>
          </div>
          <button class="ghost-button" data-set-view="medications"><i data-lucide="list-checks"></i> Pełna lista</button>
        </div>
        <div class="record-list compact-records">
          ${meds.slice(0, 5).map(renderPatientMedicationCard).join("") || emptyState("Brak leków w danych demo.")}
        </div>
      </section>

      <section class="section-band patient-wide">
        <div class="section-head">
          <div>
            <p class="eyebrow">Dokumenty i historia</p>
            <h2><i data-lucide="folder-open"></i> Moje dokumenty i ostatnie zdarzenia</h2>
          </div>
          <div class="inline-actions">
            <button class="ghost-button" data-set-view="documents"><i data-lucide="files"></i> Dokumenty</button>
            <button class="ghost-button" data-set-view="timeline"><i data-lucide="git-branch"></i> Mapa</button>
          </div>
        </div>
        <div class="patient-doc-timeline">
          <div class="record-list compact-records">
            ${docs.slice(0, 4).map(renderPatientDocumentCard).join("") || emptyState("Brak dokumentów w danych demo.")}
          </div>
          <div class="record-list compact-records">
            ${timeline.slice(0, 4).map(renderPatientTimelineCard).join("") || emptyState("Brak zdarzeń na mapie pacjenta.")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function activeVisitChecklist() {
  return PATIENT360_PREVISIT_MODEL.buildPreVisitModel({
    state,
    patientId: state.activePatientId,
    searchQuery: state.search
  }).checklist;
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

function renderInterview() {
  const interviews = byPatient(state.interviews).filter(matchesSearch).sort((a, b) => new Date(b.date) - new Date(a.date));
  return `
    ${pageHeader("Wywiad pacjenta i źródła rozmowy", "Scenariusz rozmowy kontekstowej. Służy do zebrania pytań, źródeł i obserwacji przed rozmową z lekarzem.", "interview")}
    <section class="safety-note">
      <i data-lucide="shield-alert"></i>
      <span>Wywiad porządkuje relację pacjenta, opiekuna lub rodziny. Odpowiedzi są źródłem typu wywiad i wymagają interpretacji przez lekarza.</span>
    </section>
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Scenariusz jak call center</p>
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
  return `
    ${pageHeader("Mapa Pacjenta 360", "Wspólna mapa historii pacjenta: wizyty, badania, leki, wywiady, dokumenty, zgody i pytania DITL. Pokazuje kontekst, źródła i luki, ale nie rozstrzyga decyzji klinicznych.", "git-branch")}
    ${renderPatientMap360({ persona: "doctor" })}
  `;
}

function renderPatientMap360({ persona = "doctor", embedded = false } = {}) {
  const mapModel = PATIENT360_MAP_MODEL.buildPatientMapModel({
    state,
    patientId: state.activePatientId,
    periodId: state.timelinePeriod,
    detailId: state.timelineDetail,
    zoom: state.timelineZoom,
    selectedEventId: state.selectedTimelineEventId,
    trackFilter: state.timelineFilterTrack,
    searchQuery: state.search,
    today: todayInputValue(),
    persona,
    embedded,
    periods: TIMELINE_PERIODS,
    details: TIMELINE_DETAILS,
    zoomConfig: TIMELINE_ZOOM
  });
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
        ${embedded ? "" : renderTimelineControls(period, detail, zoom)}
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
      ${embedded ? "" : renderTimelineControls(period, detail, zoom)}
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
              ${events.map((event, index) => renderTimelineEvent(event, index, detail.id, zoom, selectedId, safePersona)).join("")}
              <div class="temporal-today-marker" style="--today-left: ${todayPercent}%;" aria-label="Dziś na mapie pacjenta"><span>Dziś</span></div>
            </div>
          </div>
          <p class="temporal-scroll-hint"><i data-lucide="move-horizontal"></i> Oddal, aby zobaczyć cały odcinek jako jedną linię. Przybliż, żeby rozsunąć zdarzenia, przewijać je poziomo i wejść w źródła.</p>
        </div>
        ${renderTimelineInspector(selected, safePersona, events)}
      </div>
    </section>
  `;
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
  return `Ten odcinek łączy ${sorted.length} zdarzeń od ${formatDate(first.date)} do ${formatDate(last.date)}. Najwięcej wpisów dotyczy toru „${leadingTrack?.track || "brak danych"}”. Przewiń linię, oddal do całej historii albo wybierz jeden tor, aby zobaczyć szczegóły i źródła.`;
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
    ${pageHeader("Medication Story", "Historia lekowa pokazuje nie tylko recepty, ale realne przyjmowanie, OTC, odstawienia, objawy po zmianie i pytania do lekarza.", "medication")}
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
                  <td>${escapeHtml(obs.normalMin)}-${escapeHtml(obs.normalMax)} ${escapeHtml(obs.unit)}<br><span class="muted">Bez oceny klinicznej.</span></td>
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
    ${pageHeader("Mapa pytań i sygnałów DITL", "Sygnały są wizualnym skrótem do pytań i luk w kontekście. Nie są gotową oceną ani decyzją po stronie systemu i nie zastępują lekarza.", "flag")}
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
    ["context", "Raport kontekstowy"]
  ];
  const caseStudy = activeCaseStudy();
  return `
    <div class="page-intro">
      <div>
        <p class="eyebrow">Raport kontekstowy</p>
        <h1>Raport kontekstowy</h1>
        <p>Krótki podgląd demonstracyjny, dopasowany do fikcyjnej soczewki case study: ${escapeHtml(caseStudy.label)}.</p>
      </div>
      <div class="report-actions">
        <button class="primary-button" data-generate-report><i data-lucide="sparkles"></i>Utwórz podgląd demo</button>
        <button class="ghost-button" data-print><i data-lucide="printer"></i>Podgląd wydruku demo</button>
      </div>
    </div>
    ${renderSafetyNote("Raport jest publicznym podglądem demo. Soczewka case study i dane pacjenta są fikcyjne; nie używaj tu realnych danych pacjenta.")}
    <section class="section-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">Case studies</p>
          <h2>Wybierz soczewkę raportu</h2>
        </div>
      </div>
      <div class="case-study-grid">
        ${REPORT_CASE_STUDIES.map(renderCaseStudyButton).join("")}
      </div>
      <p class="record-body case-study-disclaimer">Case studies są fikcyjnymi kompozytami projektowymi. Nie są oparte na historii choroby żadnej konkretnej osoby ani rodziny. Soczewki specjalistyczne są planowane do walidacji i nie są częścią obecnego MVP.</p>
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
      <p class="record-body">${escapeHtml(patient.name)}, ${calculateAge(patient.birthDate)} lat. Case study: ${escapeHtml(caseStudy.decision)}</p>
    </article>
    <article class="report-section case-study-summary">
      <h3>Soczewka case study</h3>
      <p class="record-body">${escapeHtml(caseStudy.lens)}</p>
      <ul class="plain-list">
        <li><i data-lucide="user-round-check"></i><span><strong>Profil:</strong> ${escapeHtml(caseStudy.patientSnapshot)}</span></li>
        <li><i data-lucide="trending-up"></i><span><strong>Największa zmiana:</strong> ${escapeHtml(caseStudy.keyChange)}</span></li>
        <li><i data-lucide="clipboard-check"></i><span><strong>Decyzja:</strong> ${escapeHtml(caseStudy.decision)}</span></li>
      </ul>
    </article>
    <article class="report-section">
      <h3>Pacjent w 90 sekund</h3>
      <ul class="plain-list">
        <li><i data-lucide="user-round-check"></i><span><strong>Stan bazowy:</strong> ${escapeHtml(patient.baselineState)}</span></li>
        <li><i data-lucide="activity"></i><span><strong>Aktualny problem:</strong> ${escapeHtml(patient.currentProblem)}</span></li>
        <li><i data-lucide="trending-up"></i><span><strong>Największa zmiana:</strong> ${escapeHtml(patient.biggestChange)}</span></li>
      </ul>
    </article>
    <article class="report-section">
      <h3>Known / Unknown / Uncertain / To verify</h3>
      <div class="known-grid">
        ${renderCaseKnownGroup("Known", caseStudy.known, "known")}
        ${renderCaseKnownGroup("Unknown", caseStudy.unknown, "unknown")}
        ${renderCaseKnownGroup("Uncertain", caseStudy.uncertain, "uncertain")}
        ${renderCaseKnownGroup("To verify", caseStudy.verify, "verify")}
      </div>
    </article>
    <article class="report-section alert">
      <h3>Sygnały case study</h3>
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
    context: "Pacjent 360: raport kontekstowy",
    internist: "Internista",
    cardiology: "Kardiolog",
    preop: "Pre-Op",
    neurology: "Neurolog",
    patient: "Pacjent"
  }[type] || "Pacjent 360: raport kontekstowy";
}

function renderCaregiverPortal() {
  const model = PATIENT360_CAREGIVER_MODEL.buildCaregiverModel({
    state,
    patientId: state.activePatientId
  });
  const validation = PATIENT360_CAREGIVER_MODEL.validateCaregiverModel(model);
  return `
    ${pageHeader("Kokpit opiekuna", "Widok zakresu udostępnienia dla rodziny lub opiekuna. Pokazuje zadania organizacyjne i status dostępu, bez decyzji klinicznych.", "consent")}
    <section class="section-band caregiver-overview">
      <div class="section-head">
        <div>
          <p class="eyebrow">Zakres zgody</p>
          <h2><i data-lucide="users-round"></i> Kto co widzi</h2>
        </div>
        <span class="status-chip ${model.activeScopes.length ? "done" : "pending"}">${model.activeScopes.length ? `${model.activeScopes.length} aktywne zakresy` : "Brak aktywnego zakresu"}</span>
      </div>
      <p class="record-body">${escapeHtml(model.safetyCopy)}</p>
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
  `;
}

function renderCaregiverScope(scope) {
  return `
    <article class="caregiver-scope ${scope.status === "aktywny" ? "active" : "inactive"}">
      <div>
        <strong>${escapeHtml(scope.subject)}</strong>
        <small>${escapeHtml(scope.role)} · do ${escapeHtml(formatDate(scope.validTo))}</small>
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
        <span class="muted">${escapeHtml(scope.role)} · do ${escapeHtml(formatDate(scope.validTo))}</span>
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
        <span class="tag">${escapeHtml(scope.role)}</span>
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
        <span class="tag">${escapeHtml(consent.role)}</span>
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
    <div class="evidence-empty">Kliknij chip źródła, aby sprawdzić, czy informacja pochodzi z dokumentu, wywiadu, transkrypcji, wyniku, leku, zgody czy decyzji DITL.</div>
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
    return `<article class="record"><p class="record-title">Zgoda: ${escapeHtml(record.subject)}</p><p class="record-body">${escapeHtml(record.scope)}</p><p class="record-body"><strong>Rola:</strong> ${escapeHtml(record.role || "")}<br><strong>Status:</strong> ${escapeHtml(record.status || "")}<br><strong>Do:</strong> ${formatDate(record.validTo)}</p><div class="source-line">${sourceChips((record.sourceRefs || []).filter((item) => item !== ref))}</div></article>`;
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
      state.activeView = button.dataset.setView;
      saveState();
      render();
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
      title: "Dodaj decyzję DITL",
      fields: [
        { name: "type", label: "Typ decyzji", kind: "select", options: ["Pre-Op / decyzja zabiegowa", "Wizyta kontrolna", "Zmiana leków", "Wypis", "Konsultacja kardiologiczna", "Konsultacja neurologiczna", "Druga opinia"] },
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
      title: "Dodaj lek do Medication Story",
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
        { name: "evidence", label: "Dane wspierające", kind: "textarea" }
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
        { name: "role", label: "Rola", kind: "select", options: ["osoba wspierająca", "opiekun lekowy", "opiekun wizyt", "rodzina"] },
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
  return configs[type] || configs.document;
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
    description: values.story || "Nowy wpis Medication Story.",
    confidence: "średnia",
    sourceRefs: [`medication:${id}`]
  });
  addAudit("dodano lek do Medication Story", values.name);
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
    author: "Pacjent 360",
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
    intendedUse: "Kontekst, źródła, pytania DITL i zadania organizacyjne. Nie diagnoza, triage ani rekomendacja terapeutyczna.",
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
    state.activeView = button.dataset.view;
    saveState();
    render();
  });
});

patientSelect.addEventListener("change", () => {
  state.activePatientId = patientSelect.value;
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
  showToast("Przywrócono dane demo v0.2.");
  render();
});

document.querySelector("#exportJson").addEventListener("click", () => {
  exportDemoJson();
});

document.querySelector("#printReport").addEventListener("click", () => printCurrentView());

render();
