const path = require("path");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const demoData = require(path.join(publicRoot, "patient360-demo-data.js"));
const contract = require(path.join(publicRoot, "patient360-contract.js"));

const SOURCE_MISSING_REF = contract.SOURCE_MISSING_REF;
const VALIDATION_TODAYS = [...new Set([process.env.P360_DEMO_TODAY || "2026-06-11", "2026-07-01"])];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

function parseDate(value) {
  const normalized = dateOnly(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  const date = new Date(`${normalized}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function compareDate(a, b) {
  const left = parseDate(a);
  const right = parseDate(b);
  if (!left || !right) return null;
  return Math.sign(left.getTime() - right.getTime());
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function parseSourceRef(ref) {
  if (!ref || ref === SOURCE_MISSING_REF) return { type: SOURCE_MISSING_REF, id: "" };
  const [type, ...rest] = String(ref).split(":");
  return { type, id: rest.join(":") };
}

function sourceRecord(state, ref) {
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
  if (parsed.type === SOURCE_MISSING_REF) return { parsed, record: null };
  return { parsed, record: (map[parsed.type] || []).find((item) => item.id === parsed.id) || null };
}

function latestObservationDate(observation) {
  return [...(observation.values || [])]
    .map((point) => point.date)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function sourceDate(state, ref, mode = "event") {
  const { parsed, record } = sourceRecord(state, ref);
  if (!record) return "";
  if (parsed.type === "doc") return mode === "report" ? record.date || record.eventDate || "" : record.eventDate || record.date || "";
  if (parsed.type === "interview" || parsed.type === "transcript") return record.date || "";
  if (parsed.type === "observation") return latestObservationDate(record) || "";
  if (parsed.type === "medication") return record.from || "";
  if (parsed.type === "flag") return record.date || "";
  if (parsed.type === "decision") return record.contactDate || "";
  if (parsed.type === "report") return record.generatedAt || "";
  if (parsed.type === "consent") return record.validTo || "";
  return "";
}

function normalizeSourceRefs(refs) {
  const list = Array.isArray(refs) ? refs : [refs].filter(Boolean);
  return list.map(String).filter(Boolean);
}

function collectSourceRefs(value, refs = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSourceRefs(item, refs));
    return refs;
  }
  if (!value || typeof value !== "object") return refs;
  Object.entries(value).forEach(([key, entry]) => {
    if (key === "sourceRefs") refs.push(...normalizeSourceRefs(entry));
    else collectSourceRefs(entry, refs);
  });
  return refs;
}

function maxSourceDate(state, refs, mode = "event") {
  return normalizeSourceRefs(refs)
    .map((ref) => sourceDate(state, ref, mode))
    .filter((value) => parseDate(value))
    .sort()
    .at(-1);
}

function validateChronology(state, today) {
  state.timelineEvents.forEach((event) => {
    const maxDate = maxSourceDate(state, event.sourceRefs, "event");
    if (maxDate) {
      assert(compareDate(event.date, maxDate) >= 0, `${today}: event ${event.id} is before source date ${maxDate}`);
    }
    if (event.status === "planowane") {
      assert(compareDate(event.date, today) >= 0, `${today}: planned event ${event.id} is before today`);
    }
  });

  state.reports.forEach((report) => {
    const maxDate = maxSourceDate(state, report.sourceRefs, "report");
    if (maxDate) {
      assert(compareDate(report.generatedAt, maxDate) > 0, `${today}: report ${report.id} is not after source date ${maxDate}`);
    }
  });

  state.visitChecklists.forEach((checklist) => {
    assert(compareDate(checklist.visitDate, today) >= 0, `${today}: checklist ${checklist.id} visitDate is before today`);
  });

  state.timelineEpisodes.forEach((episode) => {
    const events = state.timelineEvents.filter((event) => event.episodeId === episode.id);
    events.forEach((event) => {
      assert(compareDate(event.date, episode.startDate) >= 0, `${today}: episode ${episode.id} starts after event ${event.id}`);
      assert(compareDate(event.date, episode.endDate) <= 0, `${today}: episode ${episode.id} ends before event ${event.id}`);
    });
  });

  state.observations.forEach((observation) => {
    const values = observation.values || [];
    const sorted = [...values].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    assert(JSON.stringify(values) === JSON.stringify(sorted), `${today}: observation ${observation.id} values are not sorted`);
  });
}

function textForInterview(interview) {
  return normalize(`${Object.values(interview.answers || {}).join(" ")} ${interview.transcript || ""}`);
}

function validateMedicationInterviewContent(state, today) {
  state.medications.forEach((medication) => {
    const interviewRefs = normalizeSourceRefs(medication.sourceRefs).filter((ref) => ref.startsWith("interview:") || ref.startsWith("transcript:"));
    if (!interviewRefs.length) return;
    const text = interviewRefs
      .map((ref) => sourceRecord(state, ref).record)
      .filter(Boolean)
      .map(textForInterview)
      .join(" ");
    assert(text.includes(normalize(medication.name)), `${today}: medication ${medication.id} cites interview but its name is not in interview text`);
  });
}

function validateSourceRefs(state, today) {
  const refs = collectSourceRefs(state);
  refs.forEach((ref) => {
    if (ref === SOURCE_MISSING_REF) return;
    const { record } = sourceRecord(state, ref);
    assert(record, `${today}: sourceRef has no resolver record: ${ref}`);
  });
}

function medNeedsConfirmation(medication) {
  const text = normalize([medication.status, medication.actualStatus, medication.story, medication.question].filter(Boolean).join(" "));
  return (
    text.includes("niepotwierd") ||
    text.includes("deklarow") ||
    text.includes("rodzic zgłasza") ||
    text.includes("rozbież") ||
    medication.status === "OTC/suplement" ||
    medication.status === "OTC"
  );
}

function validatePatientSummaryCounts(state, today) {
  state.patients.forEach((patient) => {
    const summary = patient.patientSummary || "";
    const medications = state.medications.filter((medication) => medication.patientId === patient.id);
    const confirmCount = medications.filter(medNeedsConfirmation).length;
    const totalMatch = summary.match(/Masz\s+(\d+)\s+lek(?:i|ów|)/i);
    if (totalMatch) {
      assert(Number(totalMatch[1]) === medications.length, `${today}: patient ${patient.id} summary medication total mismatch`);
    }
    const confirmMatch = summary.match(/(\d+)\s+lek(?:i|ów|)\s+(?:do potwierdzenia|do porównania)/i) ||
      summary.match(/a\s+(\d+)\s+wymaga(?:ją)?\s+potwierdzenia/i);
    if (confirmMatch) {
      assert(Number(confirmMatch[1]) === confirmCount, `${today}: patient ${patient.id} summary medication confirmation mismatch`);
    }
  });
}

function validateState(today) {
  const state = demoData.buildDemoState({ today });
  validateChronology(state, today);
  validateMedicationInterviewContent(state, today);
  validateSourceRefs(state, today);
  validatePatientSummaryCounts(state, today);
  console.log(`${today}: demo coherence passed`);
}

try {
  VALIDATION_TODAYS.forEach(validateState);
  console.log("Demo coherence validation passed");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
