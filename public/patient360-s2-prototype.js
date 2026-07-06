(function initPatient360S2Prototype(root, factory) {
  const deps = {
    contract: root.Patient360Contract || (typeof require === "function" ? require("./patient360-contract.js") : null),
    flags: root.Patient360Flags || (typeof require === "function" ? require("./patient360-flags.js") : null)
  };
  const s2Prototype = factory(deps);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = s2Prototype;
  }
  root.Patient360S2Prototype = s2Prototype;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildPatient360S2Prototype({ contract, flags } = {}) {
  const SOURCE_MISSING_REF = contract?.SOURCE_MISSING_REF || "source_missing";
  const S2_MODEL_VERSION = contract?.S2_MODEL_VERSION || "0.2";
  const LEGAL_VARIANTS = Object.freeze(flags?.LEGAL_VARIANTS || ["A", "B", "C"]);
  const FLOW_STEP_IDS = Object.freeze(["profile", "visitGoal", "documents", "medications", "questions", "consent", "packet"]);
  // S2-R7: rozbieznosci sa pierwsza sekcja pakietu lekarza.
  const DOCTOR_SECTION_IDS = Object.freeze(["discrepancies", "packet90s", "sources", "questions", "timeline", "documentDrawer"]);
  const SAFE_DOCTOR_ACTIONS = Object.freeze(["view_packet_90s", "view_source", "view_document_metadata", "view_timeline", "close_session"]);
  const WRITE_ACTION_PATTERN = /(add|create|delete|edit|mutate|patch|post|put|save|update|write)/i;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function unique(values) {
    return [...new Set(asArray(values).map(String).filter(Boolean))];
  }

  function normalizeRefs(value) {
    if (Array.isArray(value)) return unique(value);
    if (value) return [String(value)];
    return [];
  }

  function sourceRefsFor(item, fallback = SOURCE_MISSING_REF) {
    const refs = normalizeRefs(item?.sourceRefs);
    if (item?.sourceRef) refs.push(String(item.sourceRef));
    if (item?.sourceMissing === true) refs.push(SOURCE_MISSING_REF);
    return unique(refs.length ? refs : [fallback]);
  }

  function byPatient(state, key, patientId) {
    return asArray(state?.[key]).filter((item) => item.patientId === patientId);
  }

  function latestByDate(items, field) {
    return asArray(items).slice().sort((a, b) => String(b?.[field] || "").localeCompare(String(a?.[field] || "")))[0] || null;
  }

  function activeVariant(variant, injectedFlags = flags) {
    return injectedFlags?.aktywnyWariant ? injectedFlags.aktywnyWariant(variant) : (LEGAL_VARIANTS.includes(variant) ? variant : "B");
  }

  function flagEnabled(featureKey, variant, injectedFlags = flags) {
    return injectedFlags?.czyWlaczona ? injectedFlags.czyWlaczona(featureKey, variant) : true;
  }

  function flagCopy(featureKey, variant, injectedFlags = flags) {
    return injectedFlags?.copyDlaWariantu ? injectedFlags.copyDlaWariantu(featureKey, variant) : null;
  }

  function patientProfileFromState(state, patientId) {
    const patient = asArray(state?.patients).find((item) => item.id === patientId) || asArray(state?.patients)[0] || {};
    return {
      patientProfileId: `profile-${patient.id || patientId || "demo"}`,
      displayName: patient.name || "Pacjent demo",
      sourceRefs: sourceRefsFor(patient, `patient:${patient.id || patientId || "demo"}`)
    };
  }

  function questionsFromState(state, patientId) {
    const decisions = byPatient(state, "decisionContexts", patientId);
    const decisionQuestions = decisions.flatMap((decision) =>
      asArray(decision.ditlQuestions).map((question) => ({
        id: question.id || `question-${decision.id}`,
        text: question.question || question.text || "Pytanie do rozmowy",
        sourceRefs: sourceRefsFor(question, sourceRefsFor(decision)[0])
      }))
    );
    const flagQuestions = byPatient(state, "flags", patientId)
      .filter((flag) => flag.color !== "green")
      .map((flag) => ({
        id: `flag-${flag.id}`,
        text: flag.question || flag.category || "Punkt do wyjasnienia",
        sourceRefs: sourceRefsFor(flag)
      }));
    return [...decisionQuestions, ...flagQuestions];
  }

  function packetSources(packet) {
    return asArray(packet?.sourceIndex).map((source) => ({
      id: source.ref,
      label: source.title || source.ref,
      type: source.type || "source",
      status: source.status || "to_verify",
      sourceRefs: [source.ref || SOURCE_MISSING_REF]
    }));
  }

  function stateSources(state, patientId) {
    const records = [
      ...byPatient(state, "documents", patientId).map((item) => ({ id: `doc:${item.id}`, label: item.title, type: "document", sourceRefs: [`doc:${item.id}`] })),
      ...byPatient(state, "interviews", patientId).map((item) => ({ id: `interview:${item.id}`, label: item.title || "Wywiad", type: "interview", sourceRefs: [`interview:${item.id}`] })),
      ...byPatient(state, "medications", patientId).map((item) => ({ id: `medication:${item.id}`, label: item.name, type: "medication", sourceRefs: sourceRefsFor(item) }))
    ];
    return records.length ? records : [{ id: SOURCE_MISSING_REF, label: "Brak zrodla", type: "missing", sourceRefs: [SOURCE_MISSING_REF] }];
  }

  function buildDoctorReadOnlyPrototype(input = {}) {
    const variant = activeVariant(input.activeVariant, input.flags);
    const state = input.state || {};
    const patientId = input.patientId || input.visitPacket?.patientProfileId || state.activePatientId;
    const patientProfile = input.patientProfile || patientProfileFromState(state, patientId);
    const packet = input.visitPacket || null;
    const session = input.doctorSession || null;
    const documents = packet
      ? asArray(packet.documentsIncluded).map((item) => ({ id: item.documentId, title: item.title, sourceRefs: sourceRefsFor(item) }))
      : byPatient(state, "documents", patientId).map((item) => ({ id: item.id, title: item.title, sourceRefs: [`doc:${item.id}`] }));
    const timelineItems = packet
      ? asArray(packet.timelineHighlights).map((item) => ({ id: item.id, title: item.title, sourceRefs: sourceRefsFor(item) }))
      : byPatient(state, "timelineEvents", patientId).slice(0, 5).map((item) => ({ id: item.id, title: item.title, sourceRefs: sourceRefsFor(item) }));
    const questions = packet
      ? asArray(packet.questionsForDoctor).map((item) => ({ id: item.id || item.questionId, text: item.question, sourceRefs: sourceRefsFor(item) }))
      : questionsFromState(state, patientId).slice(0, 6);
    const decision = latestByDate(byPatient(state, "decisionContexts", patientId), "contactDate");
    const topMatters = packet
      ? asArray(packet.topMatters).map((item) => ({ id: item.id, text: item.title, sourceRefs: sourceRefsFor(item) })).slice(0, 3)
      : [
          ...byPatient(state, "knownUnknowns", patientId).slice(0, 3).map((item) => ({ id: item.id, text: item.description, sourceRefs: sourceRefsFor(item) })),
          ...questions.slice(0, 2).map((item) => ({ id: item.id, text: item.text, sourceRefs: sourceRefsFor(item) }))
        ].slice(0, 3);
    const topMattersNote = packet
      ? "wybor wskazany przez pacjenta/opiekuna"
      : "kolejnosc wg daty dodania, nie waznosci";
    const sourceIndex = packet ? packetSources(packet) : stateSources(state, patientId);
    const discrepancies = packet
      ? asArray(packet.discrepancies).map((item) => ({
          id: item.id,
          text: `${item.topic || "Rozbieznosc"} - dokument: ${item.documentSays || "brak"} / relacja: ${item.reportedSays || "brak"}`,
          sourceRefs: sourceRefsFor(item)
        }))
      : byPatient(state, "medications", patientId)
          .filter((item) => item.actualStatus && item.status && String(item.actualStatus) !== String(item.status))
          .slice(0, 3)
          .map((item) => ({
            id: `disc-${item.id}`,
            text: `${item.name}: dokument - ${item.status} / relacja - ${item.actualStatus}`,
            sourceRefs: sourceRefsFor(item)
          }));
    const discrepancySectionRefs = unique(discrepancies.flatMap((item) => sourceRefsFor(item)));
    const summaryText = packet?.summary90s?.text || decision?.summary || decision?.clinicalQuestion || "Krotki, zrodlowy kontekst wizyty bez decyzji systemu.";
    const featureEnabled = flagEnabled("doctorReadOnlyPacket", variant, input.flags);
    const auditWriteStatus = session?.auditStatus || "written";
    const dataVisible = featureEnabled && auditWriteStatus === "written" && session?.dataVisible !== false;
    const sourceSectionRefs = unique(sourceIndex.flatMap((item) => sourceRefsFor(item)));
    const questionSectionRefs = unique(questions.flatMap((item) => sourceRefsFor(item)));
    const timelineSectionRefs = unique(timelineItems.flatMap((item) => sourceRefsFor(item)));
    const documentSectionRefs = unique(documents.flatMap((item) => sourceRefsFor(item)));
    const sections = [
      {
        id: "discrepancies",
        label: "Rozbieznosci: dokument vs relacja",
        itemCount: discrepancies.length,
        sourceRefs: discrepancySectionRefs.length ? discrepancySectionRefs : [SOURCE_MISSING_REF],
        items: discrepancies
      },
      {
        id: "packet90s",
        label: "Pakiet wizyty",
        itemCount: 1,
        sourceRefs: sourceRefsFor(packet?.summary90s || decision || patientProfile),
        items: [{ text: summaryText, sourceRefs: sourceRefsFor(packet?.summary90s || decision || patientProfile) }]
      },
      {
        id: "sources",
        label: "Zrodla",
        itemCount: sourceIndex.length,
        sourceRefs: sourceSectionRefs.length ? sourceSectionRefs : [SOURCE_MISSING_REF],
        items: sourceIndex
      },
      {
        id: "questions",
        label: "Pytania pacjenta do omowienia",
        itemCount: questions.length,
        sourceRefs: questionSectionRefs.length ? questionSectionRefs : [SOURCE_MISSING_REF],
        items: questions
      },
      {
        id: "timeline",
        label: "Timeline",
        itemCount: timelineItems.length,
        sourceRefs: timelineSectionRefs.length ? timelineSectionRefs : [SOURCE_MISSING_REF],
        items: timelineItems
      },
      {
        id: "documentDrawer",
        label: "Dokumenty pacjenta",
        itemCount: documents.length,
        sourceRefs: documentSectionRefs.length ? documentSectionRefs : [SOURCE_MISSING_REF],
        items: documents
      }
    ];

    return {
      prototypeId: "s2-doctor-readonly-v0.1",
      role: "doctor",
      activeVariant: variant,
      featureEnabled,
      variantCopy: flagCopy("doctorReadOnlyPacket", variant, input.flags),
      patientProfileId: patientProfile.patientProfileId,
      packetId: packet?.packetId || `packet-demo-${patientId || "patient"}`,
      readOnly: true,
      auditBeforeRead: true,
      auditWriteStatus,
      dataVisible,
      allowedActions: asArray(session?.allowedActions).length ? asArray(session.allowedActions) : SAFE_DOCTOR_ACTIONS.slice(),
      mutationActions: [],
      safetyNotice: packet?.safetyNotice || "Widok pokazuje tylko udostepniony zakres, zrodla, rozbieznosci, braki i pytania pacjenta.",
      sections,
      topMatters,
      topMattersNote,
      blockedCapabilities: ["edit_patient_data", "write_note_to_record", "medical_assessment"]
    };
  }

  function buildPatientCaregiverFlow(input = {}) {
    const variant = activeVariant(input.activeVariant, input.flags);
    const state = input.state || {};
    const patientId = input.patientId || input.visitPacket?.patientProfileId || state.activePatientId;
    const patientProfile = input.patientProfile || patientProfileFromState(state, patientId);
    const packet = input.visitPacket || null;
    const documents = packet ? asArray(packet.documentsIncluded) : byPatient(state, "documents", patientId);
    const medications = byPatient(state, "medications", patientId);
    const questions = packet ? asArray(packet.questionsForDoctor) : questionsFromState(state, patientId);
    const decisions = byPatient(state, "decisionContexts", patientId);
    const decision = latestByDate(decisions, "contactDate");
    const consentGrants = asArray(input.consentGrants).length
      ? asArray(input.consentGrants)
      : [...asArray(input.s2Slice?.consentGrants), ...byPatient(state, "consents", patientId)];
    const activeConsents = consentGrants.filter((grant) => ["active", "aktywny"].includes(grant.status));
    const documentRefs = unique(documents.flatMap((item) => sourceRefsFor(item, item.id ? `doc:${item.id}` : SOURCE_MISSING_REF)));
    const medicationRefs = unique(medications.flatMap((item) => sourceRefsFor(item)));
    const questionRefs = unique(questions.flatMap((item) => sourceRefsFor(item)));
    const consentRefs = unique((activeConsents.length ? activeConsents : consentGrants).map((grant) => grant.consentGrantId ? `consent:${grant.consentGrantId}` : grant.id ? `consent:${grant.id}` : SOURCE_MISSING_REF));
    const packetRefs = packet
      ? unique([...sourceRefsFor(packet.visitContext), ...asArray(packet.sourceIndex).map((source) => source.ref).filter(Boolean)])
      : sourceRefsFor(decision || patientProfile);
    const steps = [
      {
        id: "profile",
        label: "Profil",
        view: "patientPortal",
        status: "ready",
        count: 1,
        sourceRefs: sourceRefsFor(patientProfile)
      },
      {
        id: "visitGoal",
        label: "Cel wizyty",
        view: "visitChecklist",
        status: decision || packet?.visitContext ? "ready" : "to_confirm",
        count: decision || packet?.visitContext ? 1 : 0,
        sourceRefs: sourceRefsFor(packet?.visitContext || decision || patientProfile)
      },
      {
        id: "documents",
        label: "Dokumenty",
        view: "documents",
        status: documents.length ? "ready" : "to_confirm",
        count: documents.length,
        sourceRefs: documentRefs.length ? documentRefs : [SOURCE_MISSING_REF]
      },
      {
        id: "medications",
        label: "Leki",
        view: "medications",
        status: medications.length ? "ready" : "to_confirm",
        count: medications.length,
        sourceRefs: medicationRefs.length ? medicationRefs : [SOURCE_MISSING_REF]
      },
      {
        id: "questions",
        label: "Pytania",
        view: "patientQuestions",
        status: questions.length ? "ready" : "to_confirm",
        count: questions.length,
        sourceRefs: questionRefs.length ? questionRefs : [SOURCE_MISSING_REF]
      },
      {
        id: "consent",
        label: "Zgoda",
        view: "consent",
        status: activeConsents.length ? "ready" : "to_confirm",
        count: activeConsents.length,
        sourceRefs: consentRefs.length ? consentRefs : [SOURCE_MISSING_REF]
      },
      {
        id: "packet",
        label: "Pakiet",
        view: "s2Prototype",
        status: packet?.status || "ready_to_share",
        count: 1,
        sourceRefs: packetRefs
      }
    ];

    // S2-R13: jawna sciezka "minimum na jutro": cel wizyty + 1 dokument + pytania.
    const minimumStepIds = Object.freeze(["visitGoal", "documents", "questions"]);
    const stepsWithMinimum = steps.map((step) => ({
      ...step,
      minimum: minimumStepIds.includes(step.id),
      optionalNote: minimumStepIds.includes(step.id) ? "" : "mozna uzupelnic pozniej"
    }));

    return {
      prototypeId: "s2-patient-caregiver-pwa-v0.1",
      role: "patient_caregiver",
      activeVariant: variant,
      featureEnabled: flagEnabled("patientContextOrganizer", variant, input.flags) && flagEnabled("visitPreparationChecklist", variant, input.flags),
      variantCopy: flagCopy("visitPreparationChecklist", variant, input.flags),
      patientProfileId: patientProfile.patientProfileId,
      caregiver: {
        activeConsentCount: activeConsents.length,
        zeroKnowledgeWhenNoConsent: activeConsents.length === 0,
        scopeLabels: activeConsents.flatMap((grant) => asArray(grant.scopes || grant.areas)).slice(0, 8)
      },
      steps: stepsWithMinimum,
      minimumPath: {
        stepIds: [...minimumStepIds],
        note: "Minimum na jutro: cel wizyty, jeden dokument i pytania. Reszte mozna uzupelnic pozniej."
      },
      ctaSequence: stepsWithMinimum.map((step) => ({ stepId: step.id, view: step.view }))
    };
  }

  function buildS2PrototypeBundle(input = {}) {
    const variant = activeVariant(input.activeVariant, input.flags);
    const doctor = buildDoctorReadOnlyPrototype({ ...input, activeVariant: variant });
    const flow = buildPatientCaregiverFlow({ ...input, activeVariant: variant });
    return {
      modelVersion: S2_MODEL_VERSION,
      prototypeVersion: "0.1",
      activeVariant: variant,
      patientId: input.patientId || input.state?.activePatientId || doctor.patientProfileId,
      gates: {
        backendOpen: false,
        aiRuntimeOpen: false,
        usesRealPatientData: false
      },
      doctor,
      flow
    };
  }

  function validateSourceRefs(errors, label, refs) {
    if (!normalizeRefs(refs).length) errors.push(`${label}.sourceRefs.empty`);
  }

  function validateDoctorPrototype(doctor, errors) {
    if (!doctor?.featureEnabled) errors.push("doctor.feature.disabled");
    if (doctor?.readOnly !== true) errors.push("doctor.readOnly.required");
    if (doctor?.auditBeforeRead !== true) errors.push("doctor.auditBeforeRead.required");
    if (doctor?.dataVisible === true && doctor.auditWriteStatus !== "written") errors.push("doctor.audit.fail_closed");
    asArray(doctor?.allowedActions).forEach((action) => {
      if (WRITE_ACTION_PATTERN.test(action)) errors.push(`doctor.allowedActions.write_or_unknown:${action}`);
    });
    if (asArray(doctor?.mutationActions).length) errors.push("doctor.mutationActions.not_allowed");
    DOCTOR_SECTION_IDS.forEach((sectionId) => {
      const section = asArray(doctor?.sections).find((item) => item.id === sectionId);
      if (!section) {
        errors.push(`doctor.section.missing:${sectionId}`);
        return;
      }
      validateSourceRefs(errors, `doctor.${sectionId}`, section.sourceRefs);
    });
  }

  function validateFlowPrototype(flow, errors) {
    if (!flow?.featureEnabled) errors.push("flow.feature.disabled");
    const minimumIds = asArray(flow?.minimumPath?.stepIds);
    if (!minimumIds.length) errors.push("flow.minimumPath.missing");
    ["visitGoal", "documents", "questions"].forEach((stepId) => {
      if (!minimumIds.includes(stepId)) errors.push(`flow.minimumPath.step.missing:${stepId}`);
    });
    minimumIds.forEach((stepId) => {
      if (!FLOW_STEP_IDS.includes(stepId)) errors.push(`flow.minimumPath.step.unknown:${stepId}`);
    });
    const questionsStep = asArray(flow?.steps).find((step) => step.id === "questions");
    if (questionsStep && questionsStep.view === "risks") errors.push("flow.questions.view.risks_not_allowed");
    FLOW_STEP_IDS.forEach((stepId) => {
      const step = asArray(flow?.steps).find((item) => item.id === stepId);
      if (!step) {
        errors.push(`flow.step.missing:${stepId}`);
        return;
      }
      if (!step.view) errors.push(`flow.${stepId}.view.missing`);
      validateSourceRefs(errors, `flow.${stepId}`, step.sourceRefs);
    });
    asArray(flow?.steps).forEach((step) => {
      if (!FLOW_STEP_IDS.includes(step.id)) errors.push(`flow.step.unknown:${step.id}`);
    });
  }

  function validateS2PrototypeBundle(bundle) {
    const errors = [];
    if (!LEGAL_VARIANTS.includes(bundle?.activeVariant)) errors.push("activeVariant.invalid");
    if (bundle?.gates?.backendOpen !== false) errors.push("gates.backend.must_stay_closed");
    if (bundle?.gates?.aiRuntimeOpen !== false) errors.push("gates.ai.must_stay_closed");
    if (bundle?.gates?.usesRealPatientData !== false) errors.push("gates.real_patient_data.not_allowed");
    validateDoctorPrototype(bundle?.doctor, errors);
    validateFlowPrototype(bundle?.flow, errors);
    return { valid: errors.length === 0, errors };
  }

  return Object.freeze({
    FLOW_STEP_IDS,
    DOCTOR_SECTION_IDS,
    SAFE_DOCTOR_ACTIONS,
    clone,
    buildDoctorReadOnlyPrototype,
    buildPatientCaregiverFlow,
    buildS2PrototypeBundle,
    validateS2PrototypeBundle
  });
});
