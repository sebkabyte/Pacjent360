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
  "activeView": "core",
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
      "name": "Demo A — dorosły przed planową procedurą",
      "birthDate": "1972-04-14",
      "sex": "M",
      "height": 178,
      "weight": 84,
      "guardian": "brak",
      "baselineState": "Pacjent samodzielny, leczony ambulatoryjnie z powodu chorób przewlekłych, przygotowywany do planowej procedury.",
      "currentProblem": "Kwalifikacja do planowej procedury jednodniowej; do uporządkowania są leki, wyniki kontrolne i dokumenty z konsultacji.",
      "biggestChange": "W dokumentacji pojawiła się potrzeba potwierdzenia aktualnej listy leków oraz brakujących danych przed procedurą.",
      "decisionToday": "Czy komplet danych wymaganych przed planową procedurą został potwierdzony przez lekarza?",
      "patientSummary": "Masz zaplanowaną procedurę jednodniową. Masz 4 leki, a 3 wymagają potwierdzenia z lekarzem. Masz aktualne wyniki laboratoryjne. Brakuje aktualnego EKG w danych demo.",
      "patientQuestion": "Co warto omówić z lekarzem: potwierdź listę leków, zapytaj o przygotowanie do procedury, sprawdź czy wyniki są kompletne.",
      "consentScope": "pełny widok 360 do 2026-06-20"
    },
    {
      "id": "p2",
      "name": "Demo B — kontrola kardiologiczna",
      "birthDate": "1958-03-02",
      "sex": "M",
      "height": 176,
      "weight": 92,
      "guardian": "brak",
      "baselineState": "Samodzielny, aktywny zawodowo, bez zgłaszanych ograniczeń funkcjonalnych.",
      "currentProblem": "Kontrola kardiologiczna po wyniku NT-proBNP powyżej zakresu ze źródła.",
      "biggestChange": "Brak nowych zgłoszeń w dokumentach demo; aktualny stan do potwierdzenia w wywiadzie przed wizytą.",
      "decisionToday": "Czy obecne dane wystarczają do rutynowej kontroli specjalistycznej?",
      "patientSummary": "Masz kontrolę kardiologiczną. Masz 1 lek do potwierdzenia, czy nadal jest przyjmowany. Ostatnie echo serca jest z kwietnia.",
      "patientQuestion": "Co warto omówić z lekarzem: potwierdź, czy przyjmujesz atorwastatynę, zapytaj o wynik echa.",
      "consentScope": "raport kardiologiczny do 2026-06-12"
    },
    {
      "id": "p3",
      "name": "Demo C — dziecko po infekcji (widok rodzica)",
      "birthDate": "2017-09-18",
      "sex": "K",
      "height": 132,
      "weight": 29,
      "guardian": "rodzic",
      "baselineState": "Dziecko w wieku szkolnym, rodzic przygotowuje kontrolę po niedawnym epizodzie infekcyjnym zapisanym w dokumentacji demo.",
      "currentProblem": "Kontrola pediatryczna po infekcji; do uporządkowania są dokumenty, leki faktycznie podane w domu, obserwacje rodzica i pytania na wizytę.",
      "biggestChange": "Rodzic odnotował poprawę samopoczucia, ale lista leków z dokumentacji nie zgadza się w pełni z tym, co faktycznie podano w domu.",
      "decisionToday": "Jakie informacje rodzic może przygotować do omówienia z lekarzem podczas kontroli dziecka?",
      "patientSummary": "Rodzic przygotowuje kontrolę po infekcji. W danych demo są 3 dokumenty, 2 leki do porównania i obserwacje opiekuna do omówienia z lekarzem.",
      "patientQuestion": "Co warto omówić z lekarzem: które leki faktycznie podano, jakie objawy rodzic obserwował w domu i jakie dokumenty zabrać na kontrolę.",
      "consentScope": "rodzic: pełny zakres; drugi rodzic: wizyty i dokumenty do 2026-07-15"
    }
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
          "question": "Czy plan postępowania z lekiem wymagającym przerwy przed procedurą jest udokumentowany?",
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
      "author": "system rejestracji",
      "quality": "oryginał PDF",
      "extractionStatus": "przetworzony",
      "trust": "wysoki",
      "source": "import PDF",
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
      "author": "system LIS",
      "quality": "wynik elektroniczny",
      "extractionStatus": "przetworzony",
      "trust": "wysoki",
      "source": "ręczne dodanie",
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
      "summary": "Zalecono aktualne EKG, potwierdzenie listy leków i decyzję lekarza dotyczącą przygotowania do procedury."
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
        "doc:d1"
      ]
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
      "scenario": "Wywiad przed kontrolą dziecka z rodzicem",
      "speaker": "rodzic",
      "confidence": "średnia",
      "answers": {
        "baseline": "Rodzic zgłasza, że dziecko zwykle chodzi do szkoły i funkcjonuje samodzielnie adekwatnie do wieku.",
        "current": "Rodzic przygotowuje kontrolę po infekcji i chce uporządkować dokumenty, leki oraz obserwacje z domu.",
        "symptoms": "Rodzic odnotował spadek gorączki i poprawę aktywności, ale chce omówić utrzymujący się kaszel w wywiadzie.",
        "function": "Rodzic zgłasza stopniowy powrót do normalnej aktywności; powrót do zajęć szkolnych pozostaje do omówienia.",
        "medications": "Rodzic deklaruje, że lek A z dokumentacji został zakończony wcześniej niż zapisano, a lek doraźny OTC był podawany według potrzeby.",
        "family": "Drugi rodzic ma mieć dostęp do terminów wizyt i dokumentów, bez dostępu do pełnego raportu."
      },
      "transcript": "Rodzic: Chcę przygotować kontrolę po infekcji. Mam wpis z porady, wynik morfologii i CRP oraz potwierdzenie terminu. Lek A po infekcji z dokumentacji był podany krócej niż pamiętam z opisu, a lek doraźny OTC dla dziecka podawaliśmy tylko przy temperaturze. Dziecko czuje się lepiej, ale chcę zapytać o kaszel, powrót do szkoły i co zabrać na wizytę.",
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
      "description": "Kontekst decyzji DITL przed planowaną procedurą.",
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
      "description": "Kontekst DITL przed kontrolą dziecka po infekcji.",
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
      "label": "Obserwacje rodzica i pytania DITL pochodzą z tego samego wywiadu przed wizytą.",
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
      "story": "Lek widoczny w dokumentacji i deklarowany przez pacjenta. Brak jednoznacznego planu przygotowania przed procedurą.",
      "symptomLink": "",
      "question": "Czy plan postępowania z tym lekiem przed procedurą został potwierdzony przez lekarza?"
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
      "question": "Czy dawka i kontrola kreatyniny/potasu są adekwatne do aktualnego stanu nerek?"
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
      "name": "Lek doraźny OTC dla dziecka",
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
      "question": "Czy istnieje indywidualny plan postępowania z lekiem wymagającym decyzji przed procedurą?",
      "evidence": "Planowana procedura i aktywny lek przewlekły; dokument kwalifikacyjny wymaga weryfikacji.",
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
      "evidence": "Konsultacja kwalifikacyjna wskazuje potrzebę aktualnego EKG; brak wyniku w danych demo.",
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
      "category": "Pytanie DITL: kompletność kwalifikacji",
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
      "category": "Pytanie DITL: kontrola po infekcji",
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
      "description": "Brak w danych demo aktualnego EKG po konsultacji kwalifikacyjnej.",
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
      "description": "Do potwierdzenia z lekarzem: plan przed procedurą dla leku wymagającego decyzji.",
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
      "type": "Raport kontekstowy Pacjent 360",
      "generatedAt": {
        "__p360DateOffset": -8,
        "__p360Time": "09:30:00"
      },
      "version": "1.0",
      "author": "Pacjent 360",
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
      "type": "Raport kontekstowy Pacjent 360",
      "generatedAt": {
        "__p360DateOffset": -4,
        "__p360Time": "16:20:00"
      },
      "version": "1.0",
      "author": "Pacjent 360",
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
      "subject": "Anna K. - córka",
      "scope": "leki, zadania organizacyjne i pytania o uzgodnienie listy leków",
      "role": "osoba wspierająca",
      "caregiverId": "cg-med-p1",
      "caregiverName": "Anna K.",
      "areas": [
        "medications",
        "tasks"
      ],
      "validTo": {
        "__p360DateOffset": 111
      },
      "status": "aktywny",
      "sourceRefs": [
        "consent:g3",
        "interview:i1",
        "medication:m1"
      ]
    },
    {
      "id": "g4",
      "patientId": "p1",
      "subject": "Piotr K. - osoba wspierająca",
      "scope": "wizyty, dokumenty i raport kontekstowy",
      "role": "osoba wspierająca",
      "caregiverId": "cg-visit-p1",
      "caregiverName": "Piotr K.",
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
      "subject": "Rodzic A",
      "scope": "pełny zakres przygotowania wizyty dziecka: dokumenty, wyniki, leki, obserwacje, raport i zadania organizacyjne",
      "role": "rodzic",
      "caregiverId": "parent-a-p3",
      "caregiverName": "Rodzic A",
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
      "subject": "Rodzic B",
      "scope": "ograniczony zakres: terminy wizyt, dokumenty i zadania organizacyjne",
      "role": "rodzic",
      "caregiverId": "parent-b-p3",
      "caregiverName": "Rodzic B",
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
  "audit": [
    {
      "id": "u1",
      "patientId": "p1",
      "date": {
        "__p360DateOffset": -8,
        "__p360Time": "09:30:00"
      },
      "actor": "Pacjent 360",
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
      "actor": "Pacjent",
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
      "actor": "Rodzic A",
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
      "actor": "Pacjent 360",
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
