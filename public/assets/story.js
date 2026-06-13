const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const filter = document.querySelector("[data-doc-filter]");
if (filter) {
  const cards = [...document.querySelectorAll("[data-doc-card]")];
  filter.addEventListener("input", () => {
    const q = filter.value.toLowerCase();
    cards.forEach((card) => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? "block" : "none";
    });
  });
}

const i18nElements = [...document.querySelectorAll("[data-i18n]")];
const plCopy = Object.fromEntries(i18nElements.map((element) => [element.dataset.i18n, element.textContent]));

const metaCopy = {
  pl: {
    lang: "pl",
    title: "Pacjent360™ | Historia pacjenta i kontekst wizyty w jednym miejscu",
    description: "Pacjent360™ porządkuje wyniki, wypisy, leki, obserwacje i pytania w jedną historię pacjenta przed wizytą. Demo alpha dla pacjentów, opiekunów i lekarzy.",
    ogTitle: "Pacjent360™ | Jedna historia pacjenta zamiast chaosu dokumentów",
    ogDescription: "Pacjent360™ porządkuje wyniki, wypisy, leki, obserwacje i pytania w czytelny kontekst przed wizytą."
  },
  en: {
    lang: "en",
    title: "Patient360 | Patient context and visit brief in one place",
    description: "Patient360 organizes results, discharge notes, medications, observations and questions into clear visit context. Alpha demo for patients, caregivers and doctors.",
    ogTitle: "Patient360 | One visit context instead of document chaos",
    ogDescription: "Patient360 organizes results, discharge notes, medications, observations and questions into a clear pre-visit context."
  }
};

const brandCopy = {
  pl: 'Pacjent360<sup class="brand-legal-mark">™</sup>',
  en: "Patient360"
};

const enCopy = {
  skipLink: "Skip to content",
  brandSubtitle: "Pre-visit context",
  navWhat: "Problem",
  navHow: "How it works",
  navAudiences: "For whom",
  navValidate: "Validation",
  navDemo: "Demo",
  heroEyebrow: "Patient context in one view",
  heroTitle: "One visit context instead of document chaos.",
  heroLead: "Patient360 organizes results, discharge notes, medications, observations and questions into a clear pre-visit context. The patient, caregiver and doctor see one shared story: what is known, what is missing and what should be discussed.",
  heroDemo: "Open demo",
  heroAudiences: "Who is it for?",
  trustMap: "Patient timeline map",
  trustLibrary: "Results and document library",
  trustQuestions: "Medications and questions before the visit",
  trustDoctor: "The doctor decides",
  mobileWhat: "Problem",
  mobileHow: "How",
  mobileRoles: "Roles",
  mobileDemo: "Demo",
  whatEyebrow: "What is it?",
  whatTitle: "A patient brief before the visit.",
  whatBody: "One view that turns scattered information into patient context for the visit: what is known, what is missing and what should be discussed with the doctor.",
  proofHistory: "History",
  proofHistoryText: "what happened and when",
  proofSources: "Sources",
  proofSourcesText: "document, result, interview",
  proofQuestions: "Questions",
  proofQuestionsText: "gaps for discussion",
  proofReport: "Summary",
  proofReportText: "known, unknown, uncertain and to verify",
  problemEyebrow: "Problem",
  problemTitle: "The data exists. But the story falls apart.",
  problemBody1: "Results may be on a phone. A discharge note in a folder. The medication list on paper or in a parent or caregiver's memory.",
  problemBody2: "And questions for the doctor often appear only after leaving the office.",
  problemBody3: "Patient360 organizes these pieces into one story before the visit.",
  howEyebrow: "How it works",
  howTitle: "Documents → history → questions → summary.",
  howBody: "The patient, parent or caregiver gathers materials. The system arranges them into a story, shows sources and helps prepare the conversation with the doctor.",
  flowDocs: "Documents",
  flowDocsText: "records, results, medications",
  flowHistory: "History",
  flowHistoryText: "what happened and when",
  flowQuestions: "Questions",
  flowQuestionsText: "what is missing",
  flowBrief: "Brief",
  flowBriefText: "known, unknown, uncertain and to verify",
  aiPromiseTitle: "Assistants that organize materials",
  aiPromiseBody: "In the next step, assistants may help arrange documents, point out missing information and prepare questions for review. The decision always belongs to the doctor.",
  audiencesEyebrow: "For whom",
  audiencesTitle: "One story. Three lenses.",
  doctorTitle: "For the doctor",
  doctorText: "Short context, sources, gaps and questions for the conversation before a decision.",
  patientTitle: "For the patient",
  patientText: "Documents, medications, results, questions and consents prepared before the visit.",
  caregiverTitle: "For the parent / caregiver",
  caregiverText: "Support for a close person within the access scope they shared.",
  mapEyebrow: "Product vision",
  mapTitle: "Layered map of patient context.",
  mapBody: "The public demo shows patient context as a simple vertical timeline. The next direction is a layered view of visits, medications, results and observations meeting at the most important moments.",
  mapEvents: "Visits",
  mapEventsText: "contacts, discharge notes, procedures",
  mapMeds: "Medications",
  mapMedsText: "prescribed and actually taken",
  mapResults: "Results",
  mapResultsText: "tests and documents",
  mapObservations: "Shared points",
  mapObservationsText: "moments where several sources meet",
  demoEyebrow: "Alpha demo",
  demoTitle: "See an example story from three perspectives.",
  demoBody: "In the demo, choose the doctor, patient or caregiver perspective. Then see the same timeline with a different data scope. The demo uses example cases.",
  demoLanguageNote: "The demo is currently in Polish. English demo after validation of the first guided path.",
  demoButton: "Open Polish demo",
  demoSafety: "Product boundaries",
  roadEyebrow: "Direction",
  roadTitle: "From visit preparation to post-visit follow-up.",
  roadBody: "The first step is organizing context before the conversation. Next steps are the patient app, doctor cockpit and visible post-visit arrangements.",
  resourceEngineering: "Engineering",
  resourceDitl: "Doctor decision",
  resourceAi: "AI boundaries",
  resourceInvestors: "Investors",
  ctaEyebrow: "Alpha to review",
  ctaTitle: "Try the demo and help us build a better way to prepare for a visit.",
  ctaBody: "Concrete feedback from doctors, patients, parents, caregivers and people building health products helps most.",
  ctaDemo: "Open demo",
  ctaContact: "Contact the project",
  contactEyebrow: "Contact",
  contactTitle: "Want to talk about Patient360?",
  contactBody: "If you are a doctor, patient, caregiver, investor or you build health products, write to us and let's check where this project can be truly useful.",
  contactButton: "Send a message",
  footerText: "Independent open source prototype. It does not replace a doctor, national patient portals or medical documentation. It is not an official public health service. The demo uses fictional data only.",
  footerDemo: "Alpha demo",
  footerAi: "AI boundaries",
  footerInvestors: "Investors",
  footerDisclaimer: "Medical disclaimer",
  footerPrivacy: "Privacy"
};

const languageCopy = {
  pl: plCopy,
  en: enCopy
};

function setMeta(lang) {
  const meta = metaCopy[lang] || metaCopy.pl;
  document.documentElement.lang = meta.lang;
  document.title = meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", meta.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", meta.ogTitle);
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", meta.ogDescription);
}

function setLanguage(lang, options = {}) {
  const normalized = lang === "en" ? "en" : "pl";
  const copy = languageCopy[normalized] || languageCopy.pl;
  i18nElements.forEach((element) => {
    const key = element.dataset.i18n;
    if (copy[key]) element.textContent = copy[key];
  });
  document.querySelectorAll(".brand-name").forEach((element) => {
    element.innerHTML = brandCopy[normalized];
  });
  document.querySelectorAll(".brand").forEach((element) => {
    element.setAttribute("aria-label", normalized === "en" ? "Patient360" : "Pacjent360");
  });
  setMeta(normalized);
  document.querySelectorAll("[data-language-switch]").forEach((button) => {
    const active = button.dataset.languageSwitch === normalized;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (options.persist !== false) {
    localStorage.setItem("pacjent360-site-lang", normalized);
  }
  if (options.updateUrl) {
    const url = new URL(window.location.href);
    if (normalized === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState({}, "", url);
  }
}

document.querySelectorAll("[data-language-switch]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.languageSwitch, { updateUrl: true });
  });
});

const urlLanguage = new URLSearchParams(window.location.search).get("lang");
const storedLanguage = localStorage.getItem("pacjent360-site-lang");
setLanguage(urlLanguage || storedLanguage || "pl", { persist: false });
