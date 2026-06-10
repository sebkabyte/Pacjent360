(function initPatient360Contract(root, factory) {
  const contract = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = contract;
  }
  root.Patient360Contract = contract;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360Contract() {
  const DATA_SCHEMA_VERSION = 7;
  const DATA_CONTRACT_VERSION = "0.1";
  const SOURCE_MISSING_REF = "source_missing";

  const TIMELINE_TRACKS = [
    "objawy",
    "badania",
    "leki",
    "kontekst medyczny",
    "hospitalizacje",
    "konsultacje",
    "funkcjonowanie",
    "decyzje medyczne",
    "obserwacje z wywiadu"
  ];

  const TIMELINE_STATUS_META = {
    potwierdzone: { label: "Potwierdzone źródłem", className: "done", icon: "check-circle-2" },
    "do potwierdzenia": { label: "Do potwierdzenia", className: "pending", icon: "circle-help" },
    rozbieżność: { label: "Rozbieżność danych", className: "pending", icon: "git-compare-arrows" },
    planowane: { label: "Planowane / do potwierdzenia", className: "info", icon: "calendar-clock" },
    orientacyjne: { label: "Kotwica orientacyjna", className: "info", icon: "map-pin" }
  };

  const FLAG_META = {
    red: { label: "Sygnał do sprawdzenia", className: "red-flag", icon: "triangle-alert" },
    amber: { label: "Luka lub niepewność", className: "amber-flag", icon: "alert-circle" },
    green: { label: "Element potwierdzony", className: "green-flag", icon: "check-circle-2" },
    blue: { label: "Pytanie do lekarza", className: "blue-flag", icon: "circle-help" }
  };

  const DITL_STATUSES = ["do wyjaśnienia", "wyjaśnione", "odrzucone", "dalsza kontrola"];
  const CLAIM_TYPES = [
    "Known",
    "Unknown",
    "Uncertain",
    "To verify",
    "flag:red",
    "flag:amber",
    "flag:green",
    "flag:blue",
    "decisionContext",
    "ditlQuestion",
    "timelineEvent",
    "report"
  ];
  const SOURCE_TYPES = ["document", "interview", "transcript", "observation", "medication", "flag", "decisionContext", "report", "consent"];
  // Klasa dowodowa: lekarz musi widziec, czy patrzy na dokument, relacje pacjenta,
  // obserwacje opiekuna czy zapis systemu. To nie jest ocena wiarygodnosci klinicznej.
  const EVIDENCE_CLASSES = ["official_document", "patient_reported", "caregiver_reported", "system_generated"];
  const SOURCE_TYPE_TO_EVIDENCE_CLASS = {
    document: "official_document",
    observation: "official_document",
    medication: "official_document",
    interview: "patient_reported",
    transcript: "patient_reported",
    consent: "patient_reported",
    flag: "system_generated",
    decisionContext: "system_generated",
    report: "system_generated"
  };
  const EVIDENCE_CLASS_LABELS = {
    official_document: "dokument",
    patient_reported: "relacja pacjenta / wywiad",
    caregiver_reported: "obserwacja opiekuna",
    system_generated: "zapis systemu"
  };
  const SOURCE_REF_PREFIX_TO_TYPE = {
    doc: "document",
    interview: "interview",
    transcript: "transcript",
    observation: "observation",
    medication: "medication",
    flag: "flag",
    decision: "decisionContext",
    report: "report",
    consent: "consent"
  };
  const CLAIM_STATUSES = [
    "",
    "Known",
    "Unknown",
    "Uncertain",
    "To verify",
    "DITL: do oceny lekarza",
    ...DITL_STATUSES,
    ...Object.keys(TIMELINE_STATUS_META)
  ];
  const RELATION_TYPES = ["powiązane czasowo", "powiązane źródłem"];
  const CONSENT_STATUSES = ["aktywny", "cofnięty", "wygasły"];
  const AUDIT_ACTION_TYPES = ["local_demo_audit", "ditl_status_change", "consent_change", "export", "import", "validation"];
  const FORBIDDEN_CLAIM_PHRASES = [
    "H" + "ITL",
    "AI " + "lekarz",
    "Raport " + "decyzyjny",
    "one" + "-pager",
    "NFZ " + "one" + "-pager",
    "zalecamy",
    "rekomendujemy",
    "rozpoznanie:",
    "diagnoza:",
    "triage"
  ];

  return Object.freeze({
    DATA_SCHEMA_VERSION,
    DATA_CONTRACT_VERSION,
    SOURCE_MISSING_REF,
    TIMELINE_TRACKS: Object.freeze([...TIMELINE_TRACKS]),
    TIMELINE_STATUS_META: Object.freeze(TIMELINE_STATUS_META),
    FLAG_META: Object.freeze(FLAG_META),
    DITL_STATUSES: Object.freeze([...DITL_STATUSES]),
    CLAIM_TYPES: Object.freeze([...CLAIM_TYPES]),
    SOURCE_TYPES: Object.freeze([...SOURCE_TYPES]),
    EVIDENCE_CLASSES: Object.freeze([...EVIDENCE_CLASSES]),
    SOURCE_TYPE_TO_EVIDENCE_CLASS: Object.freeze({ ...SOURCE_TYPE_TO_EVIDENCE_CLASS }),
    EVIDENCE_CLASS_LABELS: Object.freeze({ ...EVIDENCE_CLASS_LABELS }),
    SOURCE_REF_PREFIX_TO_TYPE: Object.freeze({ ...SOURCE_REF_PREFIX_TO_TYPE }),
    CLAIM_STATUSES: Object.freeze([...CLAIM_STATUSES]),
    RELATION_TYPES: Object.freeze([...RELATION_TYPES]),
    CONSENT_STATUSES: Object.freeze([...CONSENT_STATUSES]),
    AUDIT_ACTION_TYPES: Object.freeze([...AUDIT_ACTION_TYPES]),
    FORBIDDEN_CLAIM_PHRASES: Object.freeze([...FORBIDDEN_CLAIM_PHRASES])
  });
});
