/*
  Pacjent360 demo data seed.
  Dates are materialized from offsets relative to one demoToday value.
  Birth dates remain absolute; all timeline/demo operational dates are generated.
*/

(function initPatient360DemoData(global) {
  const DAY_MS = 24 * 60 * 60 * 1000;

  function localToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateOnly(value) {
    const [year, month, day] = String(value || localToday()).slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function isoDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromOffset(today, offset) {
    const base = parseDateOnly(today);
    return isoDate(new Date(base.getTime() + Number(offset || 0) * DAY_MS));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function materializeDates(value, today) {
    if (Array.isArray(value)) return value.map((item) => materializeDates(item, today));
    if (!value || typeof value !== "object") return value;
    if (Object.prototype.hasOwnProperty.call(value, "__p360DateOffset")) {
      const date = dateFromOffset(today, value.__p360DateOffset);
      return value.__p360Time ? `${date}T${value.__p360Time}` : date;
    }
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, materializeDates(entry, today)]));
  }

  const DEMO_STATE_TEMPLATE = {
  "activePatientId": "p1",
  "activeRole": "doctor",
  "roleSelectionConfirmed": false,
  "activeView": "roleStart",
  "reportType": "context",
  "activeCaseStudy": "procedure-readiness",
  "timelinePeriod": "episode",
  "timelineDetail": "standard",
  "timelineZoom": 0.9,
  "specialist": "internist",
  "search": "",
  "selectedSourceRef": null,
  "selectedTimelineEventId": null,
  "patients": [
    {
      "id": "p1",
      "name": "Jan S. — senior przed planową procedurą",
      "birthDate": "1949-04-14",
      "sex": "M",
      "height": 172,
      "weight": 78,
      "guardian": "brak",
      "baselineState": "Senior mieszkający samodzielnie, leczony ambulatoryjnie z powodu chorób przewlekłych; córka Madeline pomaga w lekach, dokumentach i wizytach.",
      "currentProblem": "Kwalifikacja do planowej procedury jednodniowej; do uporządkowania są leki, wyniki kontrolne, dokumenty z konsultacji i obserwacje córki.",
      "biggestChange": "Córka Madeline zgłasza, że przed procedurą trzeba potwierdzić faktycznie przyjmowane leki, transport i plan po wizycie.",
      "decisionToday": "Czy komplet danych wymaganych przed planową procedurą został potwierdzony przez lekarza?",
      "patientSummary": "Jan ma zaplanowaną procedurę jednodniową. W danych demo są 4 leki, a 3 wymagają potwierdzenia z lekarzem. Córka Madeline ma aktywny zakres do dokumentów, mapy, leków, wyników, obserwacji i zadań organizacyjnych.",
      "patientQuestion": "Co warto omówić z lekarzem: potwierdzić listę leków, przygotowanie do procedury, transport i dokumenty potrzebne w dniu kwalifikacji.",
      "consentScope": "Jan S.: pełny widok 360; Madeline S. — córka: dokumenty, mapa, leki, wyniki, obserwacje i zadania"
    },
    {
      "id": "p2",
      "name": "Andrzej K. — kontrola kardiologiczna",
      "birthDate": "1958-03-02",
      "sex": "M",
      "height": 176,
      "weight": 92,
      "guardian": "brak",
      "baselineState": "Dorosły pacjent samodzielny, aktywny zawodowo, bez aktywnego opiekuna w danych demo.",
      "currentProblem": "Kontrola kardiologiczna po wyniku NT-proBNP powyżej zakresu ze źródła.",
      "biggestChange": "Brak nowych zgłoszeń w dokumentach demo; aktualny stan do potwierdzenia w wywiadzie przed wizytą.",
      "decisionToday": "Czy obecne dane wystarczają do rutynowej kontroli specjalistycznej?",
      "patientSummary": "Andrzej ma kontrolę kardiologiczną. W danych demo ma 1 lek do potwierdzenia, czy nadal jest przyjmowany. Ostatnie echo serca jest z kwietnia.",
      "patientQuestion": "Co warto omówić z lekarzem: potwierdź, czy przyjmujesz atorwastatynę, zapytaj o wynik echa.",
      "consentScope": "raport kardiologiczny do 2026-06-12"
    },
    {
      "id": "p3",
      "name": "Maja N. — dziecko po infekcji (widok rodzica)",
      "birthDate": "2017-09-18",
      "sex": "K",
      "height": 132,
      "weight": 29,
      "guardian": "rodzic",
      "baselineState": "Dziecko w wieku szkolnym; mama Marta przygotowuje kontrolę po niedawnym epizodzie infekcyjnym zapisanym w dokumentacji demo.",
      "currentProblem": "Kontrola pediatryczna po infekcji; do uporządkowania są dokumenty, leki faktycznie podane w domu, obserwacje mamy i pytania na wizytę.",
      "biggestChange": "Mama Marta odnotowała poprawę samopoczucia, ale lista leków z dokumentacji nie zgadza się w pełni z tym, co faktycznie podano w domu.",
      "decisionToday": "Jakie informacje rodzic może przygotować do omówienia z lekarzem podczas kontroli dziecka?",
      "patientSummary": "Mama Marta przygotowuje kontrolę Mai po infekcji. W danych demo są 3 dokumenty, 2 leki do porównania i obserwacje opiekuna do omówienia z lekarzem.",
      "patientQuestion": "Co warto omówić z lekarzem: które leki faktycznie podano, jakie objawy mama obserwowała w domu i jakie dokumenty zabrać na kontrolę.",
      "consentScope": "Marta N. — mama: pełny zakres; Paweł N. — tata: wizyty i dokumenty"
    }
  ],
  "roleNarratives": [
    {
      "id": "rn-p1-doctor",
      "patientId": "p1",
      "role": "doctor",
      "title": "Jan S.: szybki kontekst przed procedurą",
      "summary": "Lekarz widzi seniora przygotowywanego do procedury, rozbieżności w lekach, obserwacje córki i brakujące elementy do omówienia.",
      "mapTitle": "Procedura Jana jako film przygotowania",
      "mapSummary": "Oś historii pokazuje dokument kwalifikacyjny, wywiad Jana, obserwacje Madeline, leki do potwierdzenia i planowany kontakt. Celem jest zobaczyć, co trzeba wyjaśnić w gabinecie."
    },
    {
      "id": "rn-p1-patient",
      "patientId": "p1",
      "role": "patient",
      "title": "Jan S.: co przygotować przed procedurą",
      "summary": "Pacjent widzi prosty plan: dokumenty, lista leków, pytania do lekarza, transport i to, co udostępnia córce.",
      "mapTitle": "Moja droga do procedury",
      "mapSummary": "Oś historii pomaga Janowi zobaczyć, co już jest zebrane, czego brakuje i jakie pytania zabrać na rozmowę z lekarzem."
    },
    {
      "id": "rn-p1-caregiver",
      "patientId": "p1",
      "role": "caregiver",
      "title": "Madeline S.: pomoc ojcu w przygotowaniu",
      "summary": "Opiekun widzi zakres zgody udzielonej przez Jana: dokumenty, mapę, leki, wyniki, obserwacje i zadania organizacyjne. Obserwacje Madeline są oznaczone jako wywiad opiekuna.",
      "mapTitle": "Co mogę dopilnować dla taty",
      "mapSummary": "Oś historii opiekuna pokazuje przygotowanie Jana do procedury w zakresie zgody: dokumenty, wyniki, leki, wywiad i zadania organizacyjne."
    },
    {
      "id": "rn-p2-doctor",
      "patientId": "p2",
      "role": "doctor",
      "title": "Andrzej K.: kontrola kardiologiczna bez opiekuna",
      "summary": "Lekarz widzi krótki kontekst kontroli: echo serca, lek do potwierdzenia, brak aktywnego opiekuna i pytania pacjenta.",
      "mapTitle": "Kontrola Andrzeja w trzech punktach",
      "mapSummary": "Oś historii łączy badanie, wywiad i planowaną konsultację. Nie ma wpisów opiekuna ani domyślnego udostępniania rodzinie."
    },
    {
      "id": "rn-p2-patient",
      "patientId": "p2",
      "role": "patient",
      "title": "Andrzej K.: moja kontrola i pytania",
      "summary": "Pacjent widzi, co zabrać na kontrolę, jaki lek potwierdzić i jakie pytanie o wynik echa zapisać przed wizytą.",
      "mapTitle": "Moja kontrola kardiologiczna",
      "mapSummary": "Oś historii pokazuje wynik echa, wywiad i nadchodzącą kontrolę w prostym języku przygotowania do rozmowy."
    },
    {
      "id": "rn-p2-caregiver",
      "patientId": "p2",
      "role": "caregiver",
      "title": "Andrzej K.: widok opiekuna bez elementów",
      "summary": "W tym scenariuszu widok opiekuna pozostaje neutralnym stanem pustym. Demo pokazuje tylko elementy gotowe do wyświetlenia w aktualnym zakresie.",
      "mapTitle": "Neutralny widok opiekuna",
      "mapSummary": "Aplikacja pokazuje wyłącznie elementy udostępnione do bieżącego widoku."
    },
    {
      "id": "rn-p3-doctor",
      "patientId": "p3",
      "role": "doctor",
      "title": "Maja N.: kontrola dziecka przez wywiad rodzica",
      "summary": "Lekarz widzi dziecko po infekcji, dokumenty, wyniki, leki podane w domu i obserwacje mamy jako wywiad opiekuna.",
      "mapTitle": "Historia infekcji Mai oczami dokumentów i mamy",
      "mapSummary": "Oś historii oddziela dokumenty pediatryczne od obserwacji Marty. Celem jest omówić kaszel, powrót do szkoły i leki faktycznie podane w domu."
    },
    {
      "id": "rn-p3-patient",
      "patientId": "p3",
      "role": "patient",
      "title": "Maja N.: widok rodzica przed kontrolą",
      "summary": "Rodzic widzi przygotowanie wizyty dziecka: dokumenty, wyniki, leki podane w domu, pytania i zakres dostępu drugiego rodzica.",
      "mapTitle": "Kontrola Mai po infekcji",
      "mapSummary": "Oś historii prowadzi rodzica przez poradę, wyniki, obserwacje w domu i planowaną kontrolę pediatryczną."
    },
    {
      "id": "rn-p3-caregiver",
      "patientId": "p3",
      "role": "caregiver",
      "title": "Marta i Paweł: opieka nad dzieckiem w zakresie dostępu",
      "summary": "Mama ma pełny zakres przygotowania wizyty, a tata widzi tylko wizyty, dokumenty i zadania. Informacje pochodzą od rodzica.",
      "mapTitle": "Co rodzice widzą w historii Mai",
      "mapSummary": "Oś historii opiekuna pokazuje zadania, dokumenty, wizyty i obserwacje rodzica zgodnie z zakresem zgody."
    }
  ],
  "roleGoals": [
    { "id": "rg-p1-doctor", "patientId": "p1", "role": "doctor", "goal": "W 90 sekund zobaczyć leki, braki i pytania przed procedurą.", "primaryView": "core" },
    { "id": "rg-p1-patient", "patientId": "p1", "role": "patient", "goal": "Przygotować dokumenty, pytania i listę leków do omówienia.", "primaryView": "visitChecklist" },
    { "id": "rg-p1-caregiver", "patientId": "p1", "role": "caregiver", "goal": "Pomóc ojcu w lekach, transporcie i dokumentach w zakresie zgody.", "primaryView": "caregiverPortal" },
    { "id": "rg-p2-doctor", "patientId": "p2", "role": "doctor", "goal": "Zobaczyć kontekst kontroli kardiologicznej i pytania pacjenta.", "primaryView": "core" },
    { "id": "rg-p2-patient", "patientId": "p2", "role": "patient", "goal": "Przygotować pytanie o echo i potwierdzenie leku.", "primaryView": "visitChecklist" },
    { "id": "rg-p2-caregiver", "patientId": "p2", "role": "caregiver", "goal": "Zobaczyć, że bez zgody opiekun nie ma dostępu do danych.", "primaryView": "caregiverPortal" },
    { "id": "rg-p3-doctor", "patientId": "p3", "role": "doctor", "goal": "Oddzielić dokumenty dziecka od obserwacji rodzica i pytań na kontrolę.", "primaryView": "core" },
    { "id": "rg-p3-patient", "patientId": "p3", "role": "patient", "goal": "Jako rodzic przygotować kontrolę dziecka po infekcji.", "primaryView": "visitChecklist" },
    { "id": "rg-p3-caregiver", "patientId": "p3", "role": "caregiver", "goal": "Wiedzieć, co mama i tata widzą w zakresie zgody.", "primaryView": "caregiverPortal" }
  ],
  "roleVisibleSections": [
    { "id": "rvs-p1-doctor", "patientId": "p1", "role": "doctor", "sections": ["brief 90 sekund", "leki do potwierdzenia", "źródła", "pytania do rozmowy"] },
    { "id": "rvs-p1-patient", "patientId": "p1", "role": "patient", "sections": ["co teraz", "checklista", "moje pytania", "udostępnianie córce"] },
    { "id": "rvs-p1-caregiver", "patientId": "p1", "role": "caregiver", "sections": ["dokumenty", "mapa", "leki", "wyniki", "gotowy wywiad", "zgody"] },
    { "id": "rvs-p2-doctor", "patientId": "p2", "role": "doctor", "sections": ["echo serca", "lek do potwierdzenia", "wywiad pacjenta", "brak opiekuna"] },
    { "id": "rvs-p2-patient", "patientId": "p2", "role": "patient", "sections": ["kontrola", "pytania", "lek", "wynik echa"] },
    { "id": "rvs-p2-caregiver", "patientId": "p2", "role": "caregiver", "sections": ["brak aktywnej zgody", "brak danych do wglądu"] },
    { "id": "rvs-p3-doctor", "patientId": "p3", "role": "doctor", "sections": ["dokumenty dziecka", "wyniki", "leki podane w domu", "obserwacje mamy"] },
    { "id": "rvs-p3-patient", "patientId": "p3", "role": "patient", "sections": ["widok rodzica", "kontrola", "leki w domu", "pytania do pediatry"] },
    { "id": "rvs-p3-caregiver", "patientId": "p3", "role": "caregiver", "sections": ["zakres mamy", "zakres taty", "wizyty", "dokumenty"] }
  ],
  "decisionContexts": [
    {
      "id": "dc1",
      "patientId": "p1",
      "type": "Gotowość do procedury",
      "clinicalQuestion": "Co lekarz musi wyjaśnić przed decyzją o planowanej procedurze?",
      "contactDate": {
        "__p360DateOffset": 3
      },
      "status": "DITL: do oceny lekarza",
      "sourceRefs": [
        "doc:d1",
        "doc:d2",
        "interview:i1"
      ],
      "ditlQuestions": [
        {
          "id": "hq1",
          "question": "Czy aktualna lista leków została potwierdzona z pacjentem?",
          "status": "do wyjaśnienia",
          "sourceRefs": [
            "interview:i1",
            "medication:m1",
            "medication:m4"
          ]
        },
        {
          "id": "hq2",
          "question": "Czy źródła jasno wskazują, kto ma potwierdzić informację o leku przed procedurą?",
          "status": "do wyjaśnienia",
          "sourceRefs": [
            "doc:d3",
            "medication:m1"
          ]
        },
        {
          "id": "hq3",
          "question": "Czy aktualne wyniki kontrolne są kompletne przed kwalifikacją?",
          "status": "dalsza kontrola",
          "sourceRefs": [
            "observation:o1",
            "doc:d2"
          ]
        },
        {
          "id": "hq4",
          "question": "Czy pacjent otrzymał jasną informację o przygotowaniu, terminie i kontroli po procedurze?",
          "status": "do wyjaśnienia",
          "sourceRefs": [
            "interview:i1",
            "decision:dc1"
          ]
        }
      ]
    },
    {
      "id": "dc2",
      "patientId": "p2",
      "type": "Kontrola kardiologiczna",
      "clinicalQuestion": "Jakie pytania trzeba wyjaśnić przed rutynową kontrolą specjalistyczną?",
      "contactDate": {
        "__p360DateOffset": 5
      },
      "status": "DITL: do oceny lekarza",
      "sourceRefs": [
        "doc:d4"
      ],
      "ditlQuestions": [
        {
          "id": "hq5",
          "question": "Czy pacjent zgłasza nowe duszności, omdlenia, ból w klatce lub obrzęki od ostatniego echa?",
          "status": "do wyjaśnienia",
          "sourceRefs": [
            "doc:d4"
          ]
        }
      ]
    },
    {
      "id": "dc3",
      "patientId": "p3",
      "type": "Przygotowanie kontroli pediatrycznej",
      "clinicalQuestion": "Co lekarz musi wyjaśnić z rodzicem podczas kontroli po infekcji dziecka?",
      "contactDate": {
        "__p360DateOffset": 2
      },
      "status": "DITL: do oceny lekarza",
      "sourceRefs": [
        "doc:d5",
        "doc:d7",
        "interview:i3"
      ],
      "ditlQuestions": [
        {
          "id": "hq6",
          "question": "Czy lista leków faktycznie podanych w domu została porównana z dokumentacją?",
          "status": "do wyjaśnienia",
          "sourceRefs": [
            "interview:i3",
            "medication:m6",
            "medication:m7"
          ]
        },
        {
          "id": "hq7",
          "question": "Czy obserwacje rodzica po infekcji są zapisane jako wywiad, a nie jako fakt laboratoryjny?",
          "status": "do wyjaśnienia",
          "sourceRefs": [
            "interview:i3",
            "observation:o7",
            "observation:o8"
          ]
        },
        {
          "id": "hq8",
          "question": "Czy dokumenty i wyniki potrzebne na kontrolę są kompletne w zakresie danych demo?",
          "status": "dalsza kontrola",
          "sourceRefs": [
            "doc:d5",
            "doc:d6",
            "doc:d7"
          ]
        }
      ]
    }
  ],
  "documents": [
    {
      "id": "d1",
      "patientId": "p1",
      "type": "Ankieta",
      "title": "Ankieta kwalifikacyjna przed procedurą",
      "date": {
        "__p360DateOffset": -24
      },
      "eventDate": {
        "__p360DateOffset": -30
      },
      "facility": "Poradnia Procedur Jednodniowych",
      "author": "system rejestracji (KS-SOMED)",
      "quality": "oryginał PDF",
      "extractionStatus": "potwierdzone",
      "trust": "wysoki",
      "source": "import IKP (XML)",
      "summary": "Standardowa ankieta przed procedurą: choroby przewlekłe, leki, alergie i potrzeba aktualizacji dokumentów."
    },
    {
      "id": "d2",
      "patientId": "p1",
      "type": "Laboratorium",
      "title": "Panel laboratoryjny kontrolny",
      "date": {
        "__p360DateOffset": -12
      },
      "eventDate": {
        "__p360DateOffset": -12
      },
      "facility": "Laboratorium Diagnostyczne Alfa",
      "author": "HL7 ORU",
      "quality": "wynik elektroniczny",
      "extractionStatus": "potwierdzone",
      "trust": "wysoki",
      "source": "integracja HL7 LIS",
      "summary": "Wyniki kontrolne przed procedurą: morfologia, kreatynina, potas i glukoza do interpretacji przez lekarza."
    },
    {
      "id": "d3",
      "patientId": "p1",
      "type": "Konsultacja",
      "title": "Konsultacja kwalifikacyjna przed procedurą",
      "date": {
        "__p360DateOffset": -17
      },
      "eventDate": {
        "__p360DateOffset": -17
      },
      "facility": "Poradnia Specjalistyczna Beta",
      "author": "lek. specjalista",
      "quality": "skan",
      "extractionStatus": "wymaga weryfikacji",
      "trust": "średni",
      "source": "zdjęcie dokumentu",
      "summary": "Dokument zawiera informację o EKG do sprawdzenia, potwierdzeniu listy leków i przygotowaniu do procedury."
    },
    {
      "id": "d4",
      "patientId": "p2",
      "type": "Echo serca",
      "title": "Echo serca kontrolne",
      "date": {
        "__p360DateOffset": -62
      },
      "eventDate": {
        "__p360DateOffset": -62
      },
      "facility": "Centrum Kardiologii",
      "author": "lek. A. Przykładowy",
      "quality": "oryginał PDF",
      "extractionStatus": "przetworzony",
      "trust": "wysoki",
      "source": "import PDF",
      "summary": "Frakcja wyrzutowa 50%, łagodna niedomykalność mitralna."
    },
    {
      "id": "d5",
      "patientId": "p3",
      "type": "Porada pediatryczna",
      "title": "Wpis z porady po infekcji",
      "date": {
        "__p360DateOffset": -22
      },
      "eventDate": {
        "__p360DateOffset": -22
      },
      "facility": "Poradnia Pediatryczna Alfa",
      "author": "lek. pediatra",
      "quality": "skan",
      "extractionStatus": "wymaga weryfikacji",
      "trust": "średni",
      "source": "zdjęcie dokumentu",
      "summary": "W dokumencie zapisano kontrolę po infekcji oraz listę leków do porównania z relacją rodzica."
    },
    {
      "id": "d6",
      "patientId": "p3",
      "type": "Laboratorium",
      "title": "Morfologia i CRP po infekcji",
      "date": {
        "__p360DateOffset": -18
      },
      "eventDate": {
        "__p360DateOffset": -18
      },
      "facility": "Laboratorium Diagnostyczne Beta",
      "author": "system LIS",
      "quality": "wynik elektroniczny",
      "extractionStatus": "przetworzony",
      "trust": "wysoki",
      "source": "import PDF",
      "summary": "Wyniki kontrolne po infekcji dodane do omówienia podczas wizyty pediatrycznej."
    },
    {
      "id": "d7",
      "patientId": "p3",
      "type": "Termin wizyty",
      "title": "Potwierdzenie kontroli pediatrycznej",
      "date": {
        "__p360DateOffset": -8
      },
      "eventDate": {
        "__p360DateOffset": 2
      },
      "facility": "Rejestracja poradni",
      "author": "system rejestracji",
      "quality": "potwierdzenie elektroniczne",
      "extractionStatus": "przetworzony",
      "trust": "wysoki",
      "source": "ręczne dodanie",
      "summary": "W dokumencie zapisano termin kontroli oraz listę dokumentów do zabrania przez rodzica."
    }
  ],
  "interviews": [
    {
      "id": "i1",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -9
      },
      "scenario": "Wywiad przedwizytowy z pacjentem",
      "speaker": "pacjent",
      "confidence": "wysoka",
      "answers": {
        "baseline": "Pacjent deklaruje samodzielne funkcjonowanie i regularne wizyty kontrolne w poradni.",
        "current": "Pacjent zgłasza planowaną procedurę jednodniową i potrzebę uporządkowania dokumentów przed kwalifikacją.",
        "symptoms": "Pacjent nie zgłasza nowych objawów. Aktualny stan do potwierdzenia w dniu wizyty.",
        "function": "Pacjent samodzielny w codziennych czynnościach; do ustalenia pozostają transport i plan po procedurze.",
        "medications": "Pacjent deklaruje lek wymagający decyzji przed procedurą, lek przewlekły B oraz suplement OTC. Dawki wymagają porównania z dokumentacją.",
        "family": "Pacjent chce potwierdzić, jakie dokumenty i wyniki powinien mieć przy sobie w dniu kwalifikacji."
      },
      "transcript": "Pacjent: Mam zaplanowaną procedurę jednodniową. Chcę uporządkować dokumenty przed kwalifikacją. Przyjmuję lek wymagający decyzji przed procedurą, lek przewlekły B i preparat magnezu OTC. Lek doraźny C stosuję tylko w razie potrzeby. Nie wiem, czy potrzebne jest aktualne EKG i które wyniki powinienem mieć przy sobie.",
      "sourceRefs": [
        "doc:d1",
        "consent:g3"
      ]
    },
    {
      "id": "i4",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -8
      },
      "scenario": "Obserwacje córki-opiekuna przed procedurą",
      "speaker": "córka / opiekun",
      "confidence": "średnia",
      "answers": {
        "baseline": "Córka Madeline zgłasza, że Jan S. zwykle funkcjonuje samodzielnie, ale wymaga pomocy w przypomnieniu o dokumentach i lekach przed wizytą.",
        "current": "Madeline chce upewnić się, które leki ojciec faktycznie przyjmuje i co ma zabrać na kwalifikację.",
        "symptoms": "Opiekun nie zgłasza nowych objawów alarmowych w rozmowie demo; aktualny stan wymaga potwierdzenia przez lekarza.",
        "function": "Do ustalenia pozostaje transport na procedurę i plan kontaktu po wizycie.",
        "medications": "Córka widzi rozbieżność między listą leków w dokumentach a tym, co ojciec opisuje jako faktycznie przyjmowane.",
        "family": "Madeline ma zgodę na leki i zadania organizacyjne; raport powinien korzystać wyłącznie z aktywnych zakresów udostępnienia."
      },
      "transcript": "Madeline, córka: Tata ma procedurę i boję się, że coś zgubimy. Pomagam mu z lekami i dokumentami. Chcę wiedzieć, które leki ma potwierdzić z lekarzem, czy potrzebne jest EKG, kto organizuje transport i co mamy zrobić po wizycie. To są moje obserwacje jako opiekuna, nie wynik badania.",
      "sourceRefs": [
        "consent:g3",
        "doc:d1",
        "medication:m1"
      ],
      "evidenceClass": "caregiver_reported"
    },
    {
      "id": "i2",
      "patientId": "p2",
      "date": {
        "__p360DateOffset": -6
      },
      "scenario": "Wywiad przed kontrolą kardiologiczną",
      "speaker": "pacjent",
      "confidence": "wysoka",
      "answers": {
        "baseline": "Pacjent z kontrolowanym nadciśnieniem i łagodną wadą zastawkową.",
        "current": "Kontrola kardiologiczna: omówienie echa i potwierdzenie planu dalszych wizyt.",
        "symptoms": "Pacjent nie zgłasza nowych objawów. Brak duszności, omdleń i obrzęków w wywiadzie demo.",
        "function": "Samodzielny, aktywny fizycznie w stopniu umiarkowanym.",
        "medications": "Atorwastatyna 20 mg: pacjent chce potwierdzić, czy nadal ją przyjmuje.",
        "family": "Pacjent chce omówić wynik echa i plan dalszych kontroli."
      },
      "transcript": "Pacjent: Przychodzę na kontrolę po echu. Czuję się dobrze, nie mam nowych objawów. Mam w dokumentach atorwastatynę, ale chcę potwierdzić, czy nadal ją przyjmuję. Chciałbym wiedzieć, co z wynikiem echa.",
      "sourceRefs": [
        "doc:d4"
      ]
    },
    {
      "id": "i3",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -5
      },
      "scenario": "Wywiad przed kontrolą Mai z mamą",
      "speaker": "mama / opiekun prawny",
      "confidence": "średnia",
      "answers": {
        "baseline": "Mama Marta zgłasza, że Maja zwykle chodzi do szkoły i funkcjonuje samodzielnie adekwatnie do wieku.",
        "current": "Mama przygotowuje kontrolę po infekcji i chce uporządkować dokumenty, leki oraz obserwacje z domu.",
        "symptoms": "Mama odnotowała spadek gorączki i poprawę aktywności, ale chce omówić utrzymujący się kaszel w wywiadzie.",
        "function": "Mama zgłasza stopniowy powrót do normalnej aktywności; powrót do zajęć szkolnych pozostaje do omówienia.",
        "medications": "Mama deklaruje, że lek A z dokumentacji został zakończony wcześniej niż zapisano, a lek doraźny OTC był podawany według potrzeby.",
        "family": "Tata Paweł ma mieć dostęp do terminów wizyt i dokumentów, bez dostępu do pełnego raportu."
      },
      "transcript": "Marta, mama: Chcę przygotować kontrolę Mai po infekcji. Mam wpis z porady, wynik morfologii i CRP oraz potwierdzenie terminu. Lek A po infekcji z dokumentacji był podany krócej niż pamiętam z opisu, a lek doraźny OTC podawaliśmy tylko przy temperaturze. Maja czuje się lepiej, ale chcę zapytać o kaszel, powrót do szkoły i co zabrać na wizytę.",
      "sourceRefs": [
        "doc:d5",
        "doc:d6",
        "doc:d7"
      ],
      "evidenceClass": "caregiver_reported"
    }
  ],
  "timelineEvents": [
    {
      "id": "te1",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -30
      },
      "track": "konsultacje",
      "episodeId": "ep1",
      "status": "potwierdzone",
      "title": "Rozpoczęcie kwalifikacji do procedury",
      "description": "Wprowadzono ankietę kwalifikacyjną i listę dokumentów do uzupełnienia.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d1"
      ]
    },
    {
      "id": "te2",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -24
      },
      "track": "leki",
      "episodeId": "ep1",
      "status": "do potwierdzenia",
      "title": "Lista leków wymaga uzgodnienia",
      "description": "Pacjent deklaruje lek wymagający decyzji przed procedurą oraz suplement OTC.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d1",
        "medication:m1",
        "medication:m4"
      ]
    },
    {
      "id": "te3",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -17
      },
      "track": "konsultacje",
      "episodeId": "ep1",
      "status": "do potwierdzenia",
      "title": "Konsultacja kwalifikacyjna przed procedurą",
      "description": "Wskazano potrzebę aktualnego EKG, wyników kontrolnych i potwierdzenia leków.",
      "confidence": "średnia",
      "sourceRefs": [
        "doc:d3"
      ]
    },
    {
      "id": "te4",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -12
      },
      "track": "badania",
      "episodeId": "ep1",
      "status": "potwierdzone",
      "title": "Wyniki kontrolne przed kwalifikacją",
      "description": "Morfologia, kreatynina, potas i glukoza dostępne do interpretacji przez lekarza.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d2",
        "observation:o1",
        "observation:o2",
        "observation:o3"
      ]
    },
    {
      "id": "te5",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -9
      },
      "track": "obserwacje z wywiadu",
      "episodeId": "ep1",
      "status": "do potwierdzenia",
      "title": "Wywiad pacjenta przed kwalifikacją",
      "description": "Pacjent chce potwierdzić listę dokumentów, leków i wyników potrzebnych w dniu kwalifikacji.",
      "confidence": "wysoka",
      "sourceRefs": [
        "interview:i1",
        "transcript:i1"
      ]
    },
    {
      "id": "te6",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": 3
      },
      "track": "decyzje medyczne",
      "episodeId": "ep1",
      "status": "planowane",
      "title": "Procedura: pytania do rozstrzygnięcia przez lekarza",
      "description": "Kontekst decyzji przed planowaną procedurą.",
      "confidence": "wysoka",
      "sourceRefs": [
        "decision:dc1"
      ]
    },
    {
      "id": "te7",
      "patientId": "p2",
      "date": {
        "__p360DateOffset": -62
      },
      "track": "badania",
      "episodeId": "ep2",
      "status": "potwierdzone",
      "title": "Echo serca kontrolne",
      "description": "EF 50%, łagodna niedomykalność mitralna.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d4"
      ]
    },
    {
      "id": "te8",
      "patientId": "p2",
      "date": {
        "__p360DateOffset": -6
      },
      "track": "obserwacje z wywiadu",
      "episodeId": "ep2",
      "status": "do potwierdzenia",
      "title": "Wywiad przed kontrolą kardiologiczną",
      "description": "Pacjent zgłasza brak nowych objawów. Chce omówić wynik echa i status leku.",
      "confidence": "wysoka",
      "sourceRefs": [
        "interview:i2"
      ]
    },
    {
      "id": "te9",
      "patientId": "p2",
      "date": {
        "__p360DateOffset": 5
      },
      "track": "konsultacje",
      "episodeId": "ep2",
      "status": "planowane",
      "title": "Planowana kontrola kardiologiczna",
      "description": "Kontrola po echu: omówienie frakcji wyrzutowej i dalszego planu kontroli.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d4",
        "decision:dc2"
      ]
    },
    {
      "id": "te10",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -22
      },
      "track": "konsultacje",
      "episodeId": "ep3",
      "status": "potwierdzone",
      "title": "Porada po infekcji",
      "description": "W dokumencie zapisano wizytę po infekcji i listę elementów do kontroli.",
      "confidence": "średnia",
      "sourceRefs": [
        "doc:d5"
      ]
    },
    {
      "id": "te11",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -5
      },
      "track": "leki",
      "episodeId": "ep3",
      "status": "do potwierdzenia",
      "title": "Lista leków dziecka wymaga porównania",
      "description": "Rodzic zgłasza różnicę między dokumentem a faktycznym podaniem leku A.",
      "confidence": "średnia",
      "sourceRefs": [
        "doc:d5",
        "interview:i3",
        "medication:m6",
        "medication:m7"
      ]
    },
    {
      "id": "te12",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -18
      },
      "track": "badania",
      "episodeId": "ep3",
      "status": "potwierdzone",
      "title": "Wyniki kontrolne po infekcji",
      "description": "Morfologia i CRP są dostępne jako dane do interpretacji przez lekarza.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d6",
        "observation:o6"
      ]
    },
    {
      "id": "te13",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -5
      },
      "track": "obserwacje z wywiadu",
      "episodeId": "ep3",
      "status": "do potwierdzenia",
      "title": "Obserwacje rodzica po infekcji",
      "description": "Rodzic odnotował poprawę aktywności, spadek temperatury i pytanie o kaszel.",
      "confidence": "średnia",
      "sourceRefs": [
        "interview:i3",
        "transcript:i3",
        "observation:o7",
        "observation:o8"
      ]
    },
    {
      "id": "te14",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -3
      },
      "track": "funkcjonowanie",
      "episodeId": "ep3",
      "status": "do potwierdzenia",
      "title": "Powrót do aktywności szkolnej do omówienia",
      "description": "Rodzic zgłasza stopniowy powrót do aktywności, bez rozstrzygania znaczenia klinicznego przez system.",
      "confidence": "średnia",
      "sourceRefs": [
        "interview:i3",
        "observation:o8"
      ]
    },
    {
      "id": "te15",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": 2
      },
      "track": "decyzje medyczne",
      "episodeId": "ep3",
      "status": "planowane",
      "title": "Kontrola pediatryczna: pytania do lekarza",
      "description": "Kontekst decyzji przed kontrolą dziecka po infekcji.",
      "confidence": "wysoka",
      "sourceRefs": [
        "doc:d7",
        "decision:dc3"
      ]
    }
  ],
  "timelineEpisodes": [
    {
      "id": "ep1",
      "patientId": "p1",
      "title": "Przygotowanie do planowej procedury",
      "startDate": {
        "__p360DateOffset": -30
      },
      "endDate": {
        "__p360DateOffset": 3
      },
      "status": "do potwierdzenia",
      "summary": "Epizod porządkuje dokumenty, leki, wyniki i pytania przed planowaną procedurą. Nie rozstrzyga gotowości medycznej.",
      "sourceRefs": [
        "doc:d1",
        "doc:d2",
        "interview:i1",
        "decision:dc1"
      ]
    },
    {
      "id": "ep2",
      "patientId": "p2",
      "title": "Kontrola kardiologiczna po echu",
      "startDate": {
        "__p360DateOffset": -62
      },
      "endDate": {
        "__p360DateOffset": 5
      },
      "status": "planowane",
      "summary": "Epizod łączy wynik echa, wywiad i planowaną kontrolę. Pytania pozostają do omówienia z lekarzem.",
      "sourceRefs": [
        "doc:d4",
        "interview:i2",
        "decision:dc2"
      ]
    },
    {
      "id": "ep3",
      "patientId": "p3",
      "title": "Kontrola dziecka po infekcji",
      "startDate": {
        "__p360DateOffset": -22
      },
      "endDate": {
        "__p360DateOffset": 2
      },
      "status": "do potwierdzenia",
      "summary": "Epizod porządkuje dokumenty, wyniki, leki faktycznie podane w domu, obserwacje rodzica i pytania przed kontrolą pediatryczną.",
      "sourceRefs": [
        "doc:d5",
        "doc:d6",
        "doc:d7",
        "interview:i3"
      ]
    }
  ],
  "stageSummaries": [
    {
      "id": "stage-p1-1",
      "patientId": "p1",
      "order": 1,
      "title": "Tło",
      "points": [
        {
          "text": "w dokumencie zapisano choroby przewlekłe i listę leków do uporządkowania",
          "status": "potwierdzone",
          "eventRef": "te1",
          "sourceRefs": [
            "doc:d1"
          ]
        }
      ]
    },
    {
      "id": "stage-p1-2",
      "patientId": "p1",
      "order": 2,
      "title": "Początek zmiany",
      "points": [
        {
          "text": "pacjent zgłosił potrzebę potwierdzenia leków i dokumentów przed kwalifikacją",
          "status": "do potwierdzenia",
          "eventRef": "te2",
          "sourceRefs": [
            "interview:i1",
            "medication:m1"
          ]
        }
      ]
    },
    {
      "id": "stage-p1-3",
      "patientId": "p1",
      "order": 3,
      "title": "Kontakty i diagnostyka",
      "points": [
        {
          "text": "w dokumencie zapisano konsultację oraz wyniki kontrolne do interpretacji przez lekarza",
          "status": "potwierdzone",
          "eventRef": "te4",
          "sourceRefs": [
            "doc:d2",
            "doc:d3"
          ]
        }
      ]
    },
    {
      "id": "stage-p1-4",
      "patientId": "p1",
      "order": 4,
      "title": "Stan obecny",
      "points": [
        {
          "text": "brak potwierdzenia w dokumentach dla aktualnego EKG i planu postępowania z lekiem",
          "status": "do omówienia z lekarzem",
          "eventRef": "te6",
          "sourceRefs": [
            "doc:d3",
            "decision:dc1"
          ]
        }
      ]
    },
    {
      "id": "stage-p1-5",
      "patientId": "p1",
      "order": 5,
      "title": "Co dalej organizacyjnie",
      "points": [
        {
          "text": "do omówienia z lekarzem pozostaje komplet dokumentów, leków i pytań przed procedurą",
          "status": "do omówienia z lekarzem",
          "eventRef": "te6",
          "sourceRefs": [
            "decision:dc1",
            "interview:i1"
          ]
        }
      ]
    },
    {
      "id": "stage-p2-1",
      "patientId": "p2",
      "order": 1,
      "title": "Tło",
      "points": [
        {
          "text": "w dokumencie zapisano kontrolne echo serca jako źródło rozmowy specjalistycznej",
          "status": "potwierdzone",
          "eventRef": "te7",
          "sourceRefs": [
            "doc:d4"
          ]
        }
      ]
    },
    {
      "id": "stage-p2-2",
      "patientId": "p2",
      "order": 2,
      "title": "Stan obecny",
      "points": [
        {
          "text": "pacjent zgłosił brak nowych objawów w wywiadzie demo i pytanie o status leku",
          "status": "do potwierdzenia",
          "eventRef": "te8",
          "sourceRefs": [
            "interview:i2",
            "medication:m5"
          ]
        }
      ]
    },
    {
      "id": "stage-p2-3",
      "patientId": "p2",
      "order": 3,
      "title": "Co dalej organizacyjnie",
      "points": [
        {
          "text": "do omówienia z lekarzem pozostaje wynik echa i lista leków przed kontrolą",
          "status": "do omówienia z lekarzem",
          "eventRef": "te9",
          "sourceRefs": [
            "doc:d4",
            "decision:dc2"
          ]
        }
      ]
    },
    {
      "id": "stage-p3-1",
      "patientId": "p3",
      "order": 1,
      "title": "Tło",
      "points": [
        {
          "text": "w dokumencie zapisano kontrolę dziecka po infekcji",
          "status": "potwierdzone",
          "eventRef": "te10",
          "sourceRefs": [
            "doc:d5"
          ]
        }
      ]
    },
    {
      "id": "stage-p3-2",
      "patientId": "p3",
      "order": 2,
      "title": "Początek zmiany",
      "points": [
        {
          "text": "rodzic odnotował rozbieżność między dokumentacją a faktycznym podaniem leku",
          "status": "do potwierdzenia",
          "eventRef": "te11",
          "sourceRefs": [
            "interview:i3",
            "medication:m6"
          ]
        }
      ]
    },
    {
      "id": "stage-p3-3",
      "patientId": "p3",
      "order": 3,
      "title": "Kontakty i diagnostyka",
      "points": [
        {
          "text": "w dokumencie zapisano wyniki kontrolne do interpretacji przez lekarza",
          "status": "potwierdzone",
          "eventRef": "te12",
          "sourceRefs": [
            "doc:d6",
            "observation:o6"
          ]
        }
      ]
    },
    {
      "id": "stage-p3-4",
      "patientId": "p3",
      "order": 4,
      "title": "Stan obecny",
      "points": [
        {
          "text": "rodzic odnotował poprawę aktywności i pytania o kaszel oraz powrót do szkoły",
          "status": "do omówienia z lekarzem",
          "eventRef": "te13",
          "sourceRefs": [
            "interview:i3",
            "observation:o7",
            "observation:o8"
          ]
        }
      ]
    },
    {
      "id": "stage-p3-5",
      "patientId": "p3",
      "order": 5,
      "title": "Co dalej organizacyjnie",
      "points": [
        {
          "text": "do omówienia z lekarzem pozostaje lista leków, dokumenty i zakres informacji dla drugiego rodzica",
          "status": "do omówienia z lekarzem",
          "eventRef": "te15",
          "sourceRefs": [
            "decision:dc3",
            "consent:g6",
            "doc:d7"
          ]
        }
      ]
    }
  ],
  "timelineRelations": [
    {
      "id": "tr1",
      "patientId": "p1",
      "fromEventId": "te2",
      "toEventId": "te6",
      "relationType": "powiązane czasowo",
      "label": "Lista leków jest elementem kontekstu przed planowaną procedurą.",
      "status": "do potwierdzenia",
      "sourceRefs": [
        "medication:m1",
        "decision:dc1"
      ]
    },
    {
      "id": "tr2",
      "patientId": "p1",
      "fromEventId": "te4",
      "toEventId": "te6",
      "relationType": "powiązane źródłem",
      "label": "Wyniki kontrolne są źródłem w raporcie kontekstowym przed procedurą.",
      "status": "potwierdzone",
      "sourceRefs": [
        "doc:d2",
        "decision:dc1"
      ]
    },
    {
      "id": "tr3",
      "patientId": "p2",
      "fromEventId": "te7",
      "toEventId": "te9",
      "relationType": "powiązane czasowo",
      "label": "Kontrola jest planowanym kontaktem po badaniu echo.",
      "status": "planowane",
      "sourceRefs": [
        "doc:d4",
        "decision:dc2"
      ]
    },
    {
      "id": "tr4",
      "patientId": "p3",
      "fromEventId": "te11",
      "toEventId": "te15",
      "relationType": "powiązane czasowo",
      "label": "Lista leków jest elementem kontekstu przed planowaną kontrolą pediatryczną.",
      "status": "do potwierdzenia",
      "sourceRefs": [
        "interview:i3",
        "medication:m6",
        "decision:dc3"
      ]
    },
    {
      "id": "tr5",
      "patientId": "p3",
      "fromEventId": "te13",
      "toEventId": "te15",
      "relationType": "powiązane źródłem",
      "label": "Obserwacje rodzica i pytania do rozmowy pochodzą z tego samego wywiadu przed wizytą.",
      "status": "do potwierdzenia",
      "sourceRefs": [
        "interview:i3",
        "decision:dc3"
      ]
    }
  ],
  "conditions": [
    {
      "id": "c1",
      "patientId": "p1",
      "name": "Nadciśnienie tętnicze",
      "status": "aktywny",
      "certainty": "wysoka",
      "since": "2018",
      "sourceRefs": [
        "doc:d1"
      ]
    },
    {
      "id": "c2",
      "patientId": "p1",
      "name": "Funkcja nerek — do omówienia z lekarzem",
      "status": "do omówienia",
      "certainty": "średnia",
      "since": "2026-05",
      "sourceRefs": [
        "doc:d1",
        "observation:o2"
      ]
    },
    {
      "id": "c4",
      "patientId": "p2",
      "name": "Nadciśnienie tętnicze",
      "status": "aktywny",
      "certainty": "wysoka",
      "since": "2012",
      "sourceRefs": [
        "doc:d4"
      ]
    },
    {
      "id": "c5",
      "patientId": "p3",
      "name": "Kontrola po infekcji zapisana w dokumencie",
      "status": "do potwierdzenia",
      "certainty": "średnia",
      "since": "2026-05",
      "sourceRefs": [
        "doc:d5",
        "interview:i3"
      ]
    }
  ],
  "medications": [
    {
      "id": "m1",
      "patientId": "p1",
      "name": "Lek wymagający decyzji przed procedurą",
      "substance": "lek przewlekły wymagający planu",
      "dose": "dawka z dokumentacji",
      "frequency": "2x dziennie",
      "from": {
        "__p360DateOffset": -586
      },
      "to": "",
      "status": "aktywny",
      "actualStatus": "zgłoszony jako przyjmowany",
      "confirmationStatus": "do potwierdzenia",
      "indication": "kontekst przewlekły z dokumentacji demo",
      "sourceRefs": [
        "doc:d1",
        "interview:i1"
      ],
      "story": "Lek widoczny w dokumentacji i deklarowany przez pacjenta. Brak jednoznacznego źródła potwierdzenia informacji o leku przed procedurą.",
      "symptomLink": "",
      "question": "Czy źródła jasno wskazują, kto ma potwierdzić informację o tym leku przed procedurą?"
    },
    {
      "id": "m2",
      "patientId": "p1",
      "name": "Lek przewlekły B",
      "substance": "lek przewlekły",
      "dose": "dawka z dokumentacji",
      "frequency": "1x dziennie",
      "from": {
        "__p360DateOffset": -2923
      },
      "to": "",
      "status": "aktywny",
      "actualStatus": "zgłoszony jako przyjmowany",
      "confirmationStatus": "potwierdzone",
      "indication": "choroba przewlekła z dokumentacji demo",
      "sourceRefs": [
        "doc:d1",
        "interview:i1"
      ],
      "story": "Lek przewlekły widoczny w dokumentacji i potwierdzony w wywiadzie pacjenta.",
      "symptomLink": "",
      "question": "Czy w źródłach jest jasno wskazane, kto ma potwierdzić dawkę i wymagane kontrole?"
    },
    {
      "id": "m3",
      "patientId": "p1",
      "name": "Lek doraźny C",
      "substance": "lek doraźny",
      "dose": "dawka z dokumentacji",
      "frequency": "doraźnie",
      "from": {
        "__p360DateOffset": -24
      },
      "to": "",
      "status": "aktywny",
      "actualStatus": "deklarowany przez pacjenta",
      "confirmationStatus": "do potwierdzenia",
      "indication": "stosowanie doraźne w danych demo",
      "sourceRefs": [
        "doc:d1",
        "interview:i1",
        "transcript:i1"
      ],
      "story": "Lek doraźny zgłoszony w wywiadzie. Dawka i częstość stosowania wymagają porównania z dokumentacją.",
      "symptomLink": "stosowanie doraźne przed procedurą",
      "question": "Czy lek doraźny został uwzględniony w przygotowaniu do procedury?"
    },
    {
      "id": "m4",
      "patientId": "p1",
      "name": "Preparat magnezu OTC",
      "substance": "magnez",
      "dose": "brak danych",
      "frequency": "nieregularnie",
      "from": "2026-05",
      "to": "",
      "status": "OTC/suplement",
      "actualStatus": "niepotwierdzone",
      "confirmationStatus": "do potwierdzenia",
      "indication": "suplement OTC zgłoszony przez pacjenta",
      "sourceRefs": [
        "interview:i1"
      ],
      "story": "Suplement zgłoszony w wywiadzie, brak danych o dawce i składzie.",
      "symptomLink": "",
      "question": "Czy OTC i suplementy zostały wpisane do uzgodnionej listy leków?"
    },
    {
      "id": "m5",
      "patientId": "p2",
      "name": "Atorwastatyna",
      "substance": "atorwastatyna",
      "dose": "20 mg",
      "frequency": "1x wieczorem",
      "from": {
        "__p360DateOffset": -2322
      },
      "to": "",
      "status": "aktywny",
      "actualStatus": "niepotwierdzone w wywiadzie",
      "indication": "hiperlipidemia",
      "sourceRefs": [
        "doc:d4"
      ],
      "story": "Lek widoczny w dokumentacji demo; brak świeżego wywiadu o realnym przyjmowaniu.",
      "symptomLink": "",
      "question": "Czy pacjent nadal faktycznie przyjmuje lek zgodnie z dokumentacją?"
    },
    {
      "id": "m6",
      "patientId": "p3",
      "name": "Lek A po infekcji",
      "substance": "lek z dokumentacji pediatrycznej",
      "dose": "dawka z dokumentacji",
      "frequency": "2x dziennie",
      "from": {
        "__p360DateOffset": -22
      },
      "to": {
        "__p360DateOffset": -17
      },
      "status": "zakończony w dokumentacji",
      "actualStatus": "rodzic zgłasza krótsze podawanie",
      "indication": "kontekst infekcji z dokumentu demo",
      "sourceRefs": [
        "doc:d5",
        "interview:i3",
        "transcript:i3"
      ],
      "story": "Dokument i wywiad rodzica opisują ten sam lek, ale czas faktycznego podawania wymaga porównania podczas wizyty.",
      "symptomLink": "obserwacje rodzica po infekcji",
      "question": "Czy czas faktycznego podawania leku A został porównany z dokumentacją?"
    },
    {
      "id": "m7",
      "patientId": "p3",
      "name": "Lek doraźny OTC",
      "substance": "lek przeciwgorączkowy OTC",
      "dose": "brak danych w dokumentacji",
      "frequency": "doraźnie według relacji rodzica",
      "from": {
        "__p360DateOffset": -22
      },
      "to": "",
      "status": "OTC",
      "actualStatus": "rodzic zgłasza podawany doraźnie",
      "indication": "relacja rodzica w wywiadzie demo",
      "sourceRefs": [
        "interview:i3",
        "transcript:i3"
      ],
      "story": "Lek doraźny jest widoczny tylko w wywiadzie rodzica; brak dawki w dokumentach demo.",
      "symptomLink": "temperatura zgłoszona przez rodzica",
      "question": "Czy leki OTC podane w domu zostały dopisane do listy do omówienia z lekarzem?"
    }
  ],
  "allergies": [
    {
      "id": "a1",
      "patientId": "p1",
      "substance": "penicylina",
      "reaction": "wysypka w dzieciństwie",
      "certainty": "niska",
      "sourceRefs": [
        "doc:d1"
      ]
    }
  ],
  "observations": [
    {
      "id": "o1",
      "patientId": "p1",
      "name": "Glukoza",
      "type": "laboratorium",
      "unit": "mg/dl",
      "normalMin": 70,
      "normalMax": 99,
      "values": [
        {
          "date": {
            "__p360DateOffset": -57
          },
          "value": 101,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -30
          },
          "value": 104,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -12
          },
          "value": 98,
          "sourceRefs": [
            "doc:d2"
          ]
        }
      ]
    },
    {
      "id": "o2",
      "patientId": "p1",
      "name": "Kreatynina",
      "type": "laboratorium",
      "unit": "mg/dl",
      "normalMin": 0.7,
      "normalMax": 1.3,
      "values": [
        {
          "date": {
            "__p360DateOffset": -57
          },
          "value": 1,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -30
          },
          "value": 1,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -12
          },
          "value": 1.05,
          "sourceRefs": [
            "doc:d2"
          ]
        }
      ]
    },
    {
      "id": "o3",
      "patientId": "p1",
      "name": "Hemoglobina",
      "type": "laboratorium",
      "unit": "g/dl",
      "normalMin": 13.5,
      "normalMax": 17.5,
      "values": [
        {
          "date": {
            "__p360DateOffset": -57
          },
          "value": 14.2,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -30
          },
          "value": 14.1,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -12
          },
          "value": 14,
          "sourceRefs": [
            "doc:d2"
          ]
        }
      ]
    },
    {
      "id": "o4",
      "patientId": "p1",
      "name": "Potas",
      "type": "laboratorium",
      "unit": "mmol/l",
      "normalMin": 3.5,
      "normalMax": 5.1,
      "values": [
        {
          "date": {
            "__p360DateOffset": -57
          },
          "value": 4.3,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -30
          },
          "value": 4.2,
          "sourceRefs": [
            "doc:d1"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -12
          },
          "value": 4.1,
          "sourceRefs": [
            "doc:d2"
          ]
        }
      ]
    },
    {
      "id": "o5",
      "patientId": "p2",
      "name": "NT-proBNP",
      "type": "laboratorium",
      "unit": "pg/ml",
      "normalMin": 0,
      "normalMax": 125,
      "values": [
        {
          "date": {
            "__p360DateOffset": -83
          },
          "value": 220,
          "sourceRefs": [
            "doc:d4"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -62
          },
          "value": 190,
          "sourceRefs": [
            "doc:d4"
          ]
        }
      ]
    },
    {
      "id": "o6",
      "patientId": "p3",
      "name": "CRP",
      "type": "laboratorium",
      "unit": "mg/l",
      "normalMin": 0,
      "normalMax": 5,
      "values": [
        {
          "date": {
            "__p360DateOffset": -22
          },
          "value": 18,
          "sourceRefs": [
            "doc:d5"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -18
          },
          "value": 7,
          "sourceRefs": [
            "doc:d6"
          ]
        }
      ]
    },
    {
      "id": "o7",
      "patientId": "p3",
      "name": "Temperatura zgłoszona przez rodzica",
      "type": "obserwacja opiekuna",
      "unit": "°C",
      "normalMin": 36,
      "normalMax": 37.5,
      "values": [
        {
          "date": {
            "__p360DateOffset": -21
          },
          "value": 38.1,
          "sourceRefs": [
            "interview:i3",
            "transcript:i3"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -19
          },
          "value": 37.4,
          "sourceRefs": [
            "interview:i3",
            "transcript:i3"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -5
          },
          "value": 36.8,
          "sourceRefs": [
            "interview:i3",
            "transcript:i3"
          ]
        }
      ],
      "evidenceClass": "caregiver_reported"
    },
    {
      "id": "o8",
      "patientId": "p3",
      "name": "Aktywność zgłoszona przez rodzica",
      "type": "obserwacja opiekuna",
      "unit": "skala 0-5",
      "values": [
        {
          "date": {
            "__p360DateOffset": -21
          },
          "value": 2,
          "sourceRefs": [
            "interview:i3"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -14
          },
          "value": 3,
          "sourceRefs": [
            "interview:i3"
          ]
        },
        {
          "date": {
            "__p360DateOffset": -5
          },
          "value": 4,
          "sourceRefs": [
            "interview:i3"
          ]
        }
      ],
      "evidenceClass": "caregiver_reported",
      "rangeLabel": "skala opisowa, bez zakresu referencyjnego"
    }
  ],
  "flags": [
    {
      "id": "f1",
      "patientId": "p1",
      "color": "red",
      "category": "Lek wymagający planu przed procedurą",
      "question": "Czy źródła jasno wskazują, kto ma potwierdzić informację o leku przed procedurą?",
      "evidence": "Planowana procedura i aktywny lek przewlekły; dokument kwalifikacyjny wymaga weryfikacji źródła.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "doc:d3",
        "medication:m1"
      ]
    },
    {
      "id": "f2",
      "patientId": "p1",
      "color": "amber",
      "category": "Brak aktualnego EKG",
      "question": "Czy aktualne EKG jest dostępne albo lekarz uznał, że nie jest potrzebne?",
      "evidence": "EKG nie jest widoczne w danych. Do potwierdzenia z lekarzem przed decyzją.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "doc:d3"
      ]
    },
    {
      "id": "f3",
      "patientId": "p1",
      "color": "amber",
      "category": "Niepewność danych lekowych",
      "question": "Czy OTC, suplementy i realne przyjmowanie leków zostały uzgodnione z pacjentem?",
      "evidence": "Wywiad zawiera suplement OTC bez dawki i niepełną pewność co do listy leków.",
      "status": "dalsza kontrola",
      "sourceRefs": [
        "interview:i1",
        "medication:m4"
      ]
    },
    {
      "id": "f4",
      "patientId": "p1",
      "color": "amber",
      "category": "Brak potwierdzenia przygotowania",
      "question": "Czy pacjent otrzymał jasną informację o przygotowaniu do procedury?",
      "evidence": "Wywiad wskazuje pytanie pacjenta o dokumenty, wyniki i przygotowanie.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "interview:i1",
        "decision:dc1"
      ]
    },
    {
      "id": "f5",
      "patientId": "p1",
      "color": "green",
      "category": "Wyniki kontrolne dostępne",
      "question": "Czy dostępne wyniki kontrolne są wystarczające do kwalifikacji?",
      "evidence": "Morfologia, kreatynina, potas i glukoza są dostępne w panelu kontrolnym.",
      "status": "dalsza kontrola",
      "sourceRefs": [
        "observation:o1",
        "doc:d2"
      ]
    },
    {
      "id": "f6",
      "patientId": "p1",
      "color": "blue",
      "category": "Pytanie do lekarza: kompletność kwalifikacji",
      "question": "Czy komplet dokumentów, leków i wyników jest wystarczający przed procedurą?",
      "evidence": "Ankieta, konsultacja, wywiad i wyniki muszą zostać rozpatrzone razem.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "decision:dc1",
        "doc:d1",
        "doc:d2",
        "interview:i1"
      ]
    },
    {
      "id": "f7",
      "patientId": "p2",
      "color": "green",
      "category": "Brak nowych zgłoszeń w dokumentach demo",
      "question": "Czy brak nowych objawów został potwierdzony w wywiadzie przed kontrolą?",
      "evidence": "Dane demo nie zawierają nowych ostrych kontaktów medycznych ani nowych zgłoszeń wymagających sprawdzenia.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "doc:d4"
      ]
    },
    {
      "id": "f8",
      "patientId": "p3",
      "color": "amber",
      "category": "Rozbieżność lekowa u dziecka",
      "question": "Czy lek A z dokumentacji został porównany z tym, co rodzic zgłasza jako faktycznie podane?",
      "evidence": "Dokument i wywiad rodzica opisują różny czas podawania leku A.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "doc:d5",
        "interview:i3",
        "medication:m6"
      ]
    },
    {
      "id": "f9",
      "patientId": "p3",
      "color": "blue",
      "category": "Pytanie do lekarza: kontrola po infekcji",
      "question": "Jakie obserwacje rodzica lekarz chce omówić podczas kontroli dziecka?",
      "evidence": "Rodzic zgłasza obserwacje temperatury, aktywności i pytanie o kaszel.",
      "status": "do wyjaśnienia",
      "sourceRefs": [
        "interview:i3",
        "observation:o7",
        "observation:o8",
        "decision:dc3"
      ]
    },
    {
      "id": "f10",
      "patientId": "p3",
      "color": "green",
      "category": "Dokumenty do kontroli dostępne",
      "question": "Czy rodzic ma przygotowane dokumenty i wyniki do pokazania lekarzowi?",
      "evidence": "W danych demo są wpis z porady, wynik kontrolny i potwierdzenie wizyty.",
      "status": "dalsza kontrola",
      "sourceRefs": [
        "doc:d5",
        "doc:d6",
        "doc:d7"
      ]
    }
  ],
  "knownUnknowns": [
    {
      "id": "ku1",
      "patientId": "p1",
      "category": "Known",
      "description": "Panel wyników kontrolnych został dodany 30.05.2026.",
      "sourceRefs": [
        "observation:o1",
        "doc:d1",
        "doc:d2"
      ]
    },
    {
      "id": "ku2",
      "patientId": "p1",
      "category": "Known",
      "description": "Pacjent potwierdził w wywiadzie stosowanie leków przewlekłych i suplementu OTC.",
      "sourceRefs": [
        "interview:i1",
        "transcript:i1",
        "medication:m3"
      ]
    },
    {
      "id": "ku3",
      "patientId": "p1",
      "category": "Unknown",
      "description": "EKG nie jest widoczne w danych. Do potwierdzenia z lekarzem przed decyzją.",
      "sourceRefs": [
        "doc:d3"
      ]
    },
    {
      "id": "ku4",
      "patientId": "p1",
      "category": "Unknown",
      "description": "Brak potwierdzenia, czy pacjent otrzymał kompletną instrukcję przygotowania do procedury.",
      "sourceRefs": [
        "doc:d1",
        "doc:d2"
      ]
    },
    {
      "id": "ku5",
      "patientId": "p1",
      "category": "Uncertain",
      "description": "Dawka suplementu OTC i częstość stosowania leku doraźnego nie są jednoznacznie potwierdzone.",
      "sourceRefs": [
        "interview:i1",
        "medication:m3"
      ]
    },
    {
      "id": "ku6",
      "patientId": "p1",
      "category": "To verify",
      "description": "Do potwierdzenia z lekarzem: informacja o leku przed procedurą i źródło jej potwierdzenia.",
      "sourceRefs": [
        "medication:m1",
        "doc:d3"
      ]
    },
    {
      "id": "ku7",
      "patientId": "p2",
      "category": "Unknown",
      "description": "Czy pacjent faktycznie przyjmuje atorwastatynę regularnie?",
      "sourceRefs": [
        "medication:m5",
        "interview:i2"
      ]
    },
    {
      "id": "ku8",
      "patientId": "p2",
      "category": "To verify",
      "description": "Czy wynik echa z kwietnia został omówiony podczas kontroli?",
      "sourceRefs": [
        "doc:d4",
        "interview:i2"
      ]
    },
    {
      "id": "ku9",
      "patientId": "p3",
      "category": "Known",
      "description": "Termin kontroli pediatrycznej jest zapisany na 12.06.2026.",
      "sourceRefs": [
        "doc:d7"
      ]
    },
    {
      "id": "ku10",
      "patientId": "p3",
      "category": "Known",
      "description": "Rodzic zgłosił obserwacje temperatury i aktywności w wywiadzie demo.",
      "sourceRefs": [
        "interview:i3",
        "observation:o7",
        "observation:o8"
      ]
    },
    {
      "id": "ku11",
      "patientId": "p3",
      "category": "Uncertain",
      "description": "Czas faktycznego podawania leku A różni się między dokumentem a relacją rodzica.",
      "sourceRefs": [
        "doc:d5",
        "interview:i3",
        "medication:m6"
      ]
    },
    {
      "id": "ku12",
      "patientId": "p3",
      "category": "To verify",
      "description": "Do omówienia z lekarzem: które leki i obserwacje rodzica są ważne dla kontroli po infekcji.",
      "sourceRefs": [
        "decision:dc3",
        "interview:i3",
        "medication:m6",
        "medication:m7"
      ]
    }
  ],
  "reports": [
    {
      "id": "rep1",
      "patientId": "p1",
      "type": "Raport kontekstowy Pacjent360™",
      "generatedAt": {
        "__p360DateOffset": -8,
        "__p360Time": "09:30:00"
      },
      "version": "1.0",
      "author": "Pacjent360™",
      "status": "DITL: do oceny lekarza",
      "sourceRefs": [
        "doc:d1",
        "doc:d2",
        "doc:d3",
        "interview:i1"
      ]
    },
    {
      "id": "rep3",
      "patientId": "p3",
      "type": "Raport kontekstowy Pacjent360™",
      "generatedAt": {
        "__p360DateOffset": -4,
        "__p360Time": "16:20:00"
      },
      "version": "1.0",
      "author": "Pacjent360™",
      "status": "DITL: do oceny lekarza",
      "sourceRefs": [
        "doc:d5",
        "doc:d6",
        "doc:d7",
        "interview:i3"
      ]
    }
  ],
  "visitChecklists": [
    {
      "id": "vc1",
      "patientId": "p1",
      "visitDate": {
        "__p360DateOffset": 3
      },
      "visitType": "Kwalifikacja do procedury",
      "items": [
        {
          "id": "vci1",
          "label": "Aktualne wyniki laboratoryjne",
          "status": "gotowe",
          "sourceRefs": [
            "doc:d2"
          ]
        },
        {
          "id": "vci2",
          "label": "Aktualne EKG",
          "status": "brak",
          "sourceRefs": [
            "decision:dc1"
          ]
        },
        {
          "id": "vci3",
          "label": "Lista leków potwierdzona z lekarzem",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "interview:i1",
            "medication:m1"
          ]
        },
        {
          "id": "vci4",
          "label": "Pytania do lekarza zapisane",
          "status": "gotowe",
          "sourceRefs": [
            "interview:i1"
          ]
        },
        {
          "id": "vci5",
          "label": "Dokument tożsamości",
          "status": "gotowe",
          "sourceRefs": [
            "decision:dc1"
          ]
        },
        {
          "id": "vci6",
          "label": "Skierowanie lub karta kwalifikacyjna",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "doc:d3"
          ]
        }
      ]
    },
    {
      "id": "vc2",
      "patientId": "p2",
      "visitDate": {
        "__p360DateOffset": 5
      },
      "visitType": "Kontrola kardiologiczna",
      "items": [
        {
          "id": "vci7",
          "label": "Wynik ostatniego echa serca",
          "status": "gotowe",
          "sourceRefs": [
            "doc:d4"
          ]
        },
        {
          "id": "vci8",
          "label": "Lista aktualnych leków",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "interview:i2",
            "medication:m5"
          ]
        },
        {
          "id": "vci9",
          "label": "Pytania do kardiologa zapisane do rozmowy",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "interview:i2"
          ]
        }
      ]
    },
    {
      "id": "vc3",
      "patientId": "p3",
      "visitDate": {
        "__p360DateOffset": 2
      },
      "visitType": "Kontrola pediatryczna po infekcji",
      "items": [
        {
          "id": "vci10",
          "label": "Wpis z porady po infekcji",
          "status": "gotowe",
          "sourceRefs": [
            "doc:d5"
          ]
        },
        {
          "id": "vci11",
          "label": "Wyniki morfologii i CRP",
          "status": "gotowe",
          "sourceRefs": [
            "doc:d6"
          ]
        },
        {
          "id": "vci12",
          "label": "Lista leków faktycznie podanych w domu",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "interview:i3",
            "medication:m6",
            "medication:m7"
          ]
        },
        {
          "id": "vci13",
          "label": "Obserwacje rodzica zapisane do rozmowy",
          "status": "gotowe",
          "sourceRefs": [
            "interview:i3",
            "observation:o7",
            "observation:o8"
          ]
        },
        {
          "id": "vci14",
          "label": "Pytania o powrót do szkoły i kaszel",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "interview:i3",
            "decision:dc3"
          ]
        },
        {
          "id": "vci15",
          "label": "Zakres dostępu drugiego rodzica",
          "status": "do potwierdzenia",
          "sourceRefs": [
            "consent:g6"
          ]
        }
      ]
    }
  ],
  "consents": [
    {
      "id": "g1",
      "patientId": "p1",
      "subject": "Poradnia kwalifikacyjna",
      "scope": "raport kontekstowy + źródła",
      "role": "osoba wspierająca",
      "caregiverId": "facility-qualification",
      "caregiverName": "Poradnia kwalifikacyjna",
      "areas": [
        "documents",
        "report"
      ],
      "validTo": {
        "__p360DateOffset": 9
      },
      "status": "aktywny",
      "sourceRefs": [
        "consent:g1",
        "doc:d3",
        "report:rep1"
      ]
    },
    {
      "id": "g2",
      "patientId": "p1",
      "subject": "Pacjent",
      "scope": "wywiad pacjenta + podsumowanie wizyty",
      "role": "pacjent",
      "caregiverId": "patient-self",
      "caregiverName": "Pacjent",
      "areas": [
        "observations",
        "report"
      ],
      "validTo": {
        "__p360DateOffset": 203
      },
      "status": "aktywny",
      "sourceRefs": [
        "consent:g2",
        "interview:i1",
        "transcript:i1"
      ]
    },
    {
      "id": "g3",
      "patientId": "p1",
      "subject": "Madeline S. - córka Jana",
      "scope": "szeroki zakres opieki przed procedurą: dokumenty, oś historii, wyniki, leki, obserwacje, gotowy wywiad i zadania organizacyjne",
      "role": "osoba wspierająca",
      "caregiverId": "cg-med-p1",
      "caregiverName": "Madeline S.",
      "areas": [
        "documents",
        "results",
        "medications",
        "observations",
        "report",
        "visits",
        "tasks"
      ],
      "validTo": {
        "__p360DateOffset": 111
      },
      "status": "aktywny",
      "sourceRefs": [
        "consent:g3",
        "interview:i1",
        "interview:i4",
        "doc:d3",
        "medication:m1"
      ]
    },
    {
      "id": "g4",
      "patientId": "p1",
      "subject": "Tomasz S. - syn Jana",
      "scope": "wizyty, dokumenty i raport kontekstowy; dostęp cofnięty w danych demo",
      "role": "osoba wspierająca",
      "caregiverId": "cg-visit-p1",
      "caregiverName": "Tomasz S.",
      "areas": [
        "visits",
        "documents",
        "report"
      ],
      "validTo": {
        "__p360DateOffset": 4
      },
      "status": "cofnięty",
      "sourceRefs": [
        "consent:g4",
        "doc:d3",
        "decision:dc1"
      ]
    },
    {
      "id": "g5",
      "patientId": "p3",
      "subject": "Marta N. - mama Mai",
      "scope": "pełny zakres przygotowania wizyty dziecka: dokumenty, wyniki, leki, obserwacje, raport i zadania organizacyjne",
      "role": "rodzic",
      "caregiverId": "parent-a-p3",
      "caregiverName": "Marta N.",
      "areas": [
        "documents",
        "results",
        "medications",
        "observations",
        "report",
        "tasks",
        "visits"
      ],
      "validTo": {
        "__p360DateOffset": 111
      },
      "status": "aktywny",
      "sourceRefs": [
        "consent:g5",
        "doc:d7",
        "report:rep3"
      ]
    },
    {
      "id": "g6",
      "patientId": "p3",
      "subject": "Paweł N. - tata Mai",
      "scope": "ograniczony zakres: terminy wizyt, dokumenty i zadania organizacyjne",
      "role": "rodzic",
      "caregiverId": "parent-b-p3",
      "caregiverName": "Paweł N.",
      "areas": [
        "visits",
        "documents",
        "tasks"
      ],
      "validTo": {
        "__p360DateOffset": 34
      },
      "status": "aktywny",
      "sourceRefs": [
        "consent:g6",
        "doc:d7"
      ]
    }
  ],
  "careContracts": [
    {
      "id": "cc1",
      "patientId": "p1",
      "scenario": "Jan S. — senior przed planową procedurą",
      "relationship": "pacjent senior + córka-opiekun",
      "patientRole": "Jan S. jest pacjentem i potwierdza własny wywiad.",
      "primaryInformant": "Madeline S., córka Jana, wnosi obserwacje opiekuna i pomaga w lekach, dokumentach, wynikach, wizytach oraz zadaniach organizacyjnych.",
      "doctorGets": [
        "dokumenty kwalifikacyjne, wyniki kontrolne i listę leków",
        "wywiad Jana oraz obserwacje Madeline oznaczone jako opiekun",
        "status zgód: Madeline ma aktywny szeroki zakres opieki, Tomasz ma dostęp cofnięty"
      ],
      "patientGets": [
        "prostą mapę przygotowania do procedury",
        "pytania do omówienia z lekarzem",
        "widoczny zakres tego, co udostępnia córce: dokumenty, mapa, leki, wyniki, obserwacje i zadania"
      ],
      "caregiverGets": [
        "dokumenty, mapę, leki, wyniki, gotowy wywiad i zadania organizacyjne w zakresie zgody",
        "pytania o dokumenty, transport i plan po wizycie",
        "tylko elementy udostępnione w aktualnym zakresie"
      ],
      "caregiverAdds": [
        "obserwacje opiekuna",
        "potwierdzenie faktycznie przyjmowanych leków",
        "informacje organizacyjne przed wizytą"
      ],
      "safetyBoundary": "Obserwacje Madeline są wywiadem/opiekunem, nie faktem laboratoryjnym. Lekarz potwierdza je w rozmowie.",
      "sourceRefs": [
        "consent:g3",
        "consent:g4",
        "interview:i1",
        "interview:i4",
        "decision:dc1"
      ]
    },
    {
      "id": "cc2",
      "patientId": "p2",
      "scenario": "Andrzej K. — samodzielna kontrola kardiologiczna",
      "relationship": "pacjent dorosły bez aktywnego opiekuna",
      "patientRole": "Andrzej K. jest pacjentem i głównym źródłem wywiadu.",
      "primaryInformant": "Brak aktywnego opiekuna w danych demo; lekarz opiera się na dokumentach i wywiadzie pacjenta.",
      "doctorGets": [
        "echo serca i dane z dokumentu kardiologicznego",
        "wywiad Andrzeja przed kontrolą",
        "pytania o leki i nowe objawy do potwierdzenia w gabinecie"
      ],
      "patientGets": [
        "krótki plan przygotowania kontroli",
        "listę pytań o wynik echa i status leku",
        "mapę: badanie, wywiad, planowana konsultacja"
      ],
      "caregiverGets": [
        "brak aktywnego zakresu dla opiekuna",
        "pacjent może dodać opiekuna dopiero przez zgodę",
        "raport nie jest automatycznie udostępniany rodzinie"
      ],
      "caregiverAdds": [
        "brak wpisów opiekuna w tym scenariuszu"
      ],
      "safetyBoundary": "Brak opiekuna oznacza brak domyślnego udostępniania. Lekarz widzi tylko dokumenty i informacje podane przez pacjenta.",
      "sourceRefs": [
        "doc:d4",
        "interview:i2",
        "decision:dc2"
      ]
    },
    {
      "id": "cc3",
      "patientId": "p3",
      "scenario": "Maja N. — dziecko po infekcji",
      "relationship": "dziecko + rodzic jako główne źródło informacji",
      "patientRole": "Maja N. jest pacjentką, ale informacje przed wizytą wnosi rodzic.",
      "primaryInformant": "Marta N., mama Mai, przygotowuje dokumenty, leki faktycznie podane w domu i obserwacje po infekcji.",
      "doctorGets": [
        "dokument z porady, wyniki kontrolne i termin wizyty",
        "wywiad mamy oznaczony jako obserwacja opiekuna",
        "zakres dostępu drugiego rodzica: wizyty, dokumenty i zadania"
      ],
      "patientGets": [
        "mapę kontroli pediatrycznej widzianą przez rodzica",
        "pytania o kaszel, powrót do szkoły i leki podane w domu",
        "rozróżnienie dokumentów od obserwacji rodzica"
      ],
      "caregiverGets": [
        "Marta widzi pełny zakres przygotowania wizyty",
        "Paweł widzi tylko wizyty, dokumenty i zadania",
        "obserwacje rodzica nie są oznaczane jako wynik badania"
      ],
      "caregiverAdds": [
        "obserwacje po infekcji",
        "informacje o lekach faktycznie podanych w domu",
        "pytania rodzica do lekarza"
      ],
      "safetyBoundary": "W przypadku dziecka rodzic jest źródłem wywiadu. System nie zamienia obserwacji rodzica w diagnozę ani wynik badania.",
      "sourceRefs": [
        "consent:g5",
        "consent:g6",
        "interview:i3",
        "decision:dc3"
      ]
    }
  ],
  "audit": [
    {
      "id": "u1",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -8,
        "__p360Time": "09:30:00"
      },
      "actor": "Pacjent360™",
      "action": "wygenerowano raport kontekstowy",
      "scope": "raport, źródła d1-d3, wywiad i1"
    },
    {
      "id": "u2",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -9,
        "__p360Time": "12:04:00"
      },
      "actor": "Jan S.",
      "action": "dodano wywiad pacjenta",
      "scope": "transkrypcja i odpowiedzi strukturalne"
    },
    {
      "id": "u3",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -4,
        "__p360Time": "16:20:00"
      },
      "actor": "Marta N. - mama",
      "action": "dodano wywiad rodzica",
      "scope": "transkrypcja, leki faktycznie podane i obserwacje opiekuna"
    },
    {
      "id": "u4",
      "patientId": "p3",
      "date": {
        "__p360DateOffset": -4,
        "__p360Time": "16:25:00"
      },
      "actor": "Pacjent360™",
      "action": "wygenerowano raport kontekstowy",
      "scope": "raport rep3, źródła d5-d7, wywiad i3"
    }
  ]
};

  function buildDemoState(options = {}) {
    const today = options.today || localToday();
    const state = materializeDates(clone(DEMO_STATE_TEMPLATE), today);
    state.demoDate = today;
    return state;
  }

  const api = Object.freeze({
    buildDemoState,
    dateFromOffset,
    localToday
  });

  global.Patient360DemoData = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
