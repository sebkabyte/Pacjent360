(function initPatient360Flags(root, factory) {
  const flags = factory(root);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = flags;
  }
  root.Patient360Flags = flags;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360Flags(root) {
  const contract =
    typeof require === "function" ? require("./patient360-contract.js") : root.Patient360Contract || {};

  const LEGAL_VARIANTS = Object.freeze(["A", "B", "C"]);
  const DEFAULT_ACTIVE_VARIANT = "B";
  const REQUIRED_SURFACES = Object.freeze(["demo", "navigation", "copy"]);
  const REGULATED_FEATURES_ENABLED = false;
  const FORBIDDEN_COPY_PATTERNS = Object.freeze([
    /diagnoz/i,
    /rozpoznanie/i,
    /zalecen/i,
    /rekomendac/i,
    /piln/i,
    /triage/i,
    /clinical decision support/i,
    /monitoring zdrowia/i,
    /przypomnienie o leku/i,
    /w normie/i,
    /poza norm/i,
    /terapi/i,
    /dawkowan/i
  ]);

  const LEGAL_VARIANT_FLAGS = deepFreeze({
    activeVariant: DEFAULT_ACTIVE_VARIANT,
    featureSchemaVersion: "0.1",
    features: {
      patientContextOrganizer: {
        category: "core",
        label: "Organizer kontekstu pacjenta",
        variants: { A: true, B: true, C: true },
        surfacesByVariant: visibleFor("A", "B", "C"),
        copyByVariant: copyForAll({
          title: "Porzadkowanie kontekstu przed wizyta",
          body: "Pacjent lub opiekun uklada dokumenty, pytania, braki danych i statusy do rozmowy z lekarzem.",
          disclaimer: "Pacjent360 nie zastepuje lekarza. Decyzje medyczne podejmuje uprawniony profesjonalista."
        })
      },
      visitPreparationChecklist: {
        category: "core",
        label: "Checklista przygotowania wizyty",
        variants: { A: true, B: true, C: true },
        surfacesByVariant: visibleFor("A", "B", "C"),
        copyByVariant: copyForAll({
          title: "Checklista do potwierdzenia",
          body: "System pokazuje zadania organizacyjne, zrodla i pytania do omowienia podczas wizyty.",
          disclaimer: "To jest material pomocniczy do rozmowy. System nie rozstrzyga znaczenia klinicznego."
        })
      },
      doctorReadOnlyPacket: {
        category: "core",
        label: "Pakiet read-only dla lekarza",
        variants: { A: true, B: true, C: true },
        surfacesByVariant: visibleFor("A", "B", "C"),
        copyByVariant: copyForAll({
          title: "Pakiet wizyty z audytem",
          body: "Lekarz widzi tylko udostepniony zakres, zrodla, braki i pytania DITL.",
          disclaimer: "Odczyt wymaga audytu. Brak audytu oznacza brak wyswietlenia danych."
        })
      },
      waitlist: {
        category: "core",
        label: "Waitlista",
        variants: { A: true, B: true, C: true },
        surfacesByVariant: visibleFor("A", "B", "C"),
        copyByVariant: copyForAll({
          title: "Lista zainteresowanych beta",
          body: "Formularz zbiera adres e-mail do kontaktu po potwierdzeniu double opt-in i zgody informacyjnej.",
          disclaimer: "Zapis nie tworzy konta medycznego i nie przyjmuje danych pacjenta."
        })
      },
      aiDraftingFull: {
        category: "borderline",
        label: "AI Drafting - pelny zakres konfiguracyjny",
        runtimeGate: "AI-GATE",
        variants: { A: true, B: false, C: false },
        surfacesByVariant: { A: surface(true), B: surface(false), C: surface(false) },
        copyByVariant: {
          A: {
            title: "Szkice organizacyjne do akceptacji",
            body: "Po osobnym otwarciu AI-GATE system moze przygotowac szkic porzadkujacy kontekst na danych syntetycznych.",
            disclaimer: "Kazdy szkic wymaga walidatora, preview i akceptacji czlowieka przed zapisem."
          }
        }
      },
      organizationalAiDrafting: {
        category: "borderline",
        label: "AI Drafting - tylko organizacja",
        runtimeGate: "AI-GATE",
        variants: { A: true, B: true, C: false },
        surfacesByVariant: { A: surface(true), B: surface(true), C: surface(false) },
        copyByVariant: {
          A: {
            title: "Szkic checklisty organizacyjnej",
            body: "System moze przygotowac draft zadan, brakow danych i pytan bez rozstrzygania znaczenia klinicznego.",
            disclaimer: "AI-GATE musi byc otwarty osobnym wpisem. Dane realne pozostaja poza zakresem demo."
          },
          B: {
            title: "Wariant ostrozny: tylko organizacja",
            body: "Draft ogranicza sie do porzadkowania dokumentow, pytan, zrodel i statusow do potwierdzenia.",
            disclaimer: "Brak porad medycznych. Czlowiek akceptuje kazdy zapis przed utrwaleniem."
          }
        }
      },
      clinicalAssist: {
        category: "forbidden",
        label: "Clinical Assist",
        variants: { A: false, B: false, C: false },
        surfacesByVariant: { A: surface(false), B: surface(false), C: surface(false) },
        copyByVariant: {}
      }
    }
  });

  function surface(visible) {
    return Object.freeze({ demo: visible, navigation: visible, copy: visible });
  }

  function visibleFor(...variants) {
    return LEGAL_VARIANTS.reduce((acc, variant) => {
      acc[variant] = surface(variants.includes(variant));
      return acc;
    }, {});
  }

  function copyForAll(copy) {
    return LEGAL_VARIANTS.reduce((acc, variant) => {
      acc[variant] = { ...copy };
      return acc;
    }, {});
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function aktywnyWariant(candidate, config = LEGAL_VARIANT_FLAGS) {
    const requested = String(candidate || config.activeVariant || DEFAULT_ACTIVE_VARIANT).trim().toUpperCase();
    return LEGAL_VARIANTS.includes(requested) ? requested : DEFAULT_ACTIVE_VARIANT;
  }

  function feature(config, featureKey) {
    return (config.features || {})[featureKey] || null;
  }

  function czyWlaczona(featureKey, variant, config = LEGAL_VARIANT_FLAGS) {
    const resolvedVariant = aktywnyWariant(variant, config);
    return feature(config, featureKey)?.variants?.[resolvedVariant] === true;
  }

  function copyDlaWariantu(featureKey, variant, config = LEGAL_VARIANT_FLAGS) {
    const resolvedVariant = aktywnyWariant(variant, config);
    const item = feature(config, featureKey);
    if (!item || item.variants?.[resolvedVariant] !== true) return null;
    if (item.surfacesByVariant?.[resolvedVariant]?.copy !== true) return null;
    const copy = item.copyByVariant?.[resolvedVariant];
    return copy ? { ...copy } : null;
  }

  function textFromCopy(copy) {
    return [copy?.title, copy?.body, copy?.disclaimer].filter(Boolean).join(" ");
  }

  function containsForbiddenCopy(text) {
    const contractPhrases = Array.isArray(contract.FORBIDDEN_CLAIM_PHRASES) ? contract.FORBIDDEN_CLAIM_PHRASES : [];
    const normalized = String(text || "");
    const lower = normalized.toLowerCase();
    const contractHit = contractPhrases.find((phrase) => phrase && lower.includes(String(phrase).toLowerCase()));
    const patternHit = FORBIDDEN_COPY_PATTERNS.find((pattern) => pattern.test(normalized));
    return contractHit || patternHit?.source || null;
  }

  function validateVariantFlags(config = LEGAL_VARIANT_FLAGS) {
    const errors = [];
    const features = config?.features || {};
    if (!LEGAL_VARIANTS.includes(config?.activeVariant)) errors.push("activeVariant.invalid");
    Object.entries(features).forEach(([featureKey, item]) => {
      const variants = item?.variants || {};
      const variantKeys = Object.keys(variants).sort().join("|");
      if (variantKeys !== LEGAL_VARIANTS.join("|")) errors.push(`${featureKey}.variants.must_define_A_B_C`);
      LEGAL_VARIANTS.forEach((variant) => {
        const enabled = variants[variant] === true;
        const surfaces = item?.surfacesByVariant?.[variant] || {};
        REQUIRED_SURFACES.forEach((surfaceKey) => {
          if (typeof surfaces[surfaceKey] !== "boolean") errors.push(`${featureKey}.${variant}.surface.${surfaceKey}.missing`);
          if (!enabled && surfaces[surfaceKey] === true) errors.push(`${featureKey}.${variant}.disabled_surface_visible:${surfaceKey}`);
        });
        const copy = item?.copyByVariant?.[variant];
        if (enabled) {
          if (!copy) errors.push(`${featureKey}.${variant}.copy.missing`);
          if (!copy?.disclaimer) errors.push(`${featureKey}.${variant}.disclaimer.missing`);
          const forbidden = containsForbiddenCopy(textFromCopy(copy));
          if (forbidden) errors.push(`${featureKey}.${variant}.copy.forbiddenPhrase:${forbidden}`);
        } else if (copy && surfaces.copy === true) {
          errors.push(`${featureKey}.${variant}.disabled_copy_visible`);
        }
      });
      if ((item.category === "borderline" || item.category === "forbidden") && variants.C === true) {
        errors.push(`${featureKey}.C.must_be_disabled_for_core_only_variant`);
      }
      if (item.category === "forbidden" && LEGAL_VARIANTS.some((variant) => variants[variant] === true)) {
        errors.push(`${featureKey}.forbidden_feature_enabled`);
      }
    });
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    LEGAL_VARIANTS,
    DEFAULT_ACTIVE_VARIANT,
    REGULATED_FEATURES_ENABLED,
    regulatedFeaturesEnabled: REGULATED_FEATURES_ENABLED,
    LEGAL_VARIANT_FLAGS,
    cloneFlags: () => clone(LEGAL_VARIANT_FLAGS),
    aktywnyWariant,
    czyWlaczona,
    copyDlaWariantu,
    validateVariantFlags
  });
});
