const STORAGE_KEY = "smartcarePatientDatabase";
const ACCOUNTS_KEY = "smartcareAccounts";
const ACTIVE_USER_KEY = "smartcareActiveUser";
const PATIENT_DB_PREFIX = "smartcarePatientDatabase_";
const DEFAULT_CAMP_NAME = "Smart Community Health Camp 2026";

const appStorage = (() => {
  const memory = new Map();
  let persistent = true;
  try {
    const probeKey = "smartcareStorageProbe";
    localStorage.setItem(probeKey, "ok");
    localStorage.removeItem(probeKey);
  } catch (error) {
    persistent = false;
  }
  return {
    get(key) {
      try { return persistent ? localStorage.getItem(key) : memory.get(key) || null; } catch (error) { persistent = false; return memory.get(key) || null; }
    },
    set(key, value) {
      memory.set(key, String(value));
      try { if (persistent) localStorage.setItem(key, value); } catch (error) { persistent = false; }
    },
    remove(key) {
      memory.delete(key);
      try { if (persistent) localStorage.removeItem(key); } catch (error) { persistent = false; }
    },
    isPersistent() { return persistent; }
  };
})();

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
const portalButton = document.getElementById("portalButton");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const backToLoginButton = document.getElementById("backToLoginButton");
const portalDashboard = document.getElementById("portalDashboard");
const portalUserLabel = document.getElementById("portalUserLabel");
const logoutButton = document.getElementById("logoutButton");
const qrPassModal = document.getElementById("qrPassModal");
const closeQrPassButton = document.getElementById("closeQrPass");
const readingProgress = document.getElementById("readingProgress");
const backToTopButton = document.getElementById("backToTop");
const cookieBanner = document.getElementById("cookieBanner");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");
const mobileThemeToggle = document.getElementById("mobileThemeToggle");
const themePreferenceSelect = document.getElementById("themePreferenceSelect");
const languageToggle = document.getElementById("languageToggle");
const typewriterText = document.getElementById("typewriterText");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".tag");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const carouselTrack = document.querySelector(".carousel-track");
const galleryItems = document.querySelectorAll(".gallery-item");
const installAppButton = document.getElementById("installAppButton");
const connectionStatus = document.getElementById("connectionStatus");
const syncStatus = document.getElementById("syncStatus");
const syncNowButton = document.getElementById("syncNowButton");
const appStartup = document.getElementById("appStartup");
const aiAssistButton = document.getElementById("aiAssistButton");
const aiPreviewModal = document.getElementById("aiPreviewModal");
const aiPromptInput = document.getElementById("aiPromptInput");
const aiChat = document.getElementById("aiChat");
const aiAuditSummary = document.getElementById("aiAuditSummary");
const commandPalette = document.getElementById("commandPalette");
const floatingAiPanel = document.getElementById("floatingAiPanel");
const floatingAiMessages = document.getElementById("floatingAiMessages");
const floatingAiInput = document.getElementById("floatingAiInput");
const floatingAiForm = document.getElementById("floatingAiForm");
const floatingAiLanguage = document.getElementById("floatingAiLanguage");
let pendingAiPrompt = "";
let yashAiMode = "demo";

const patientRegistrationForm = document.getElementById("patientRegistrationForm");
const recentPatientsList = document.getElementById("recentPatientsList");
const patientProfileContent = document.getElementById("patientProfileContent");
const scannerInput = document.getElementById("scannerInput");
const scannerStatus = document.getElementById("scannerStatus");
const scanQrButton = document.getElementById("scanQrButton");
const qrImageInput = document.getElementById("qrImageInput");
const campPosterModal = document.getElementById("campPosterModal");
const campRegistrationModal = document.getElementById("campRegistrationModal");
const printPosterButton = document.getElementById("printPosterButton");
const posterDoNotShowAgain = document.getElementById("posterDoNotShowAgain");
const campRegistrationForm = document.getElementById("campRegistrationForm");
const campRegistrationStatus = document.getElementById("campRegistrationStatus");
const posterCloseButton = document.querySelector(".poster-close");
const registrationCloseButton = document.querySelector(".registration-close");
const POSTER_SESSION_KEY = "smartcarePosterShownSession";
const POSTER_DONT_SHOW_TODAY_KEY = "smartcarePosterDontShowToday";
const CAMP_REGISTRATION_COUNTER = "smartcareCampRegistrationCounter";
const WORKFLOW_KEY = "smartcareWorkflowState";
const PENDING_SYNC_KEY = "smartcarePendingDemoSync";
const APP_ROUTE_TO_PANEL = {
  dashboard: "dashboard-panel",
  "control-center": "dashboard-panel",
  workflow: "workflow-panel",
  camps: "workflow-panel",
  "camps/new": "workflow-panel",
  patients: "register-panel",
  "patients/new": "register-panel",
  registration: "register-panel",
  queue: "queue-panel",
  "queue/display": "queue-panel",
  screening: "scanner-panel",
  consultation: "scanner-panel",
  medicines: "pharmacy-panel",
  dispensing: "pharmacy-panel",
  referrals: "reports-panel",
  followups: "reports-panel",
  reports: "reports-panel",
  insights: "reports-panel",
  "smart-insights": "reports-panel",
  "yash-ai": "ai-panel",
  "yash-ai/camp-planner": "ai-panel",
  "yash-ai/report-generator": "ai-panel",
  "yash-ai/poster-generator": "ai-panel",
  "yash-ai/translator": "ai-panel",
  "yash-ai/data-quality": "ai-panel",
  "yash-ai/staff-assistant": "ai-panel",
  "yash-ai/follow-up-assistant": "ai-panel",
  "yash-ai/safety": "ai-panel",
  settings: "settings-panel",
  profile: "profile-panel",
  "project-report": "reports-panel",
  presentation: "presentation-panel"
};
const APP_ROUTE_META = {
  dashboard: ["Dashboard", "Operations overview"],
  "control-center": ["Control Center", "Operations overview"],
  workflow: ["Workflow", "Guided care workflow"],
  camps: ["Camps", "Camp management"],
  "camps/new": ["Camps / New", "Create fictional camp"],
  patients: ["Patients", "Patient records"],
  "patients/new": ["Patients / New", "Register fictional patient"],
  registration: ["Registration", "Register patient"],
  queue: ["Queue", "Queue management"],
  "queue/display": ["Queue / Display", "Queue management"],
  screening: ["Screening", "Screening workspace"],
  consultation: ["Consultation", "Consultation workspace"],
  medicines: ["Medicines", "Inventory and dispensing"],
  dispensing: ["Dispensing", "Inventory and dispensing"],
  referrals: ["Referrals", "Aggregate reports"],
  followups: ["Follow-ups", "Aggregate reports"],
  reports: ["Reports", "Camp operations report"],
  insights: ["Insights", "Camp operations report"],
  "smart-insights": ["Smart Insights", "Camp operations report"],
  "yash-ai": ["Yash AI", "Your Smart Community Health Camp Assistant"],
  "yash-ai/camp-planner": ["Yash AI / Camp Planner", "Your Smart Community Health Camp Assistant"],
  "yash-ai/report-generator": ["Yash AI / Report Generator", "Your Smart Community Health Camp Assistant"],
  "yash-ai/poster-generator": ["Yash AI / Poster Generator", "Your Smart Community Health Camp Assistant"],
  "yash-ai/translator": ["Yash AI / Translator", "Your Smart Community Health Camp Assistant"],
  "yash-ai/data-quality": ["Yash AI / Data Quality", "Your Smart Community Health Camp Assistant"],
  "yash-ai/staff-assistant": ["Yash AI / Staff Assistant", "Your Smart Community Health Camp Assistant"],
  "yash-ai/follow-up-assistant": ["Yash AI / Follow-up Assistant", "Your Smart Community Health Camp Assistant"],
  "yash-ai/safety": ["Yash AI / Safety", "Your Smart Community Health Camp Assistant"],
  settings: ["Settings", "Workspace preferences"],
  profile: ["Profile", "Authenticated demo profile"],
  "project-report": ["Project Report", "Camp operations report"],
  presentation: ["Presentation", "Competition presentation"]
};

const PRESENTATION_SLIDES = [
  ["The problem", "Community health camps need a clear, affordable way to coordinate people, queues, records, and follow-up care.", "Open by describing the community problem, not the technology."],
  ["The proposed solution", "SmartCare Guided Camp Workflow with Yash AI Operations Assistant connects each operational handoff in one demo workspace.", "State the innovation in one sentence."],
  ["Users", "Organizers, volunteers, nurses, doctors, pharmacists, and administrators each see the work relevant to their role.", "Explain role-aware access."],
  ["Login", "Demo accounts provide a safe role-based entry point without real patient data.", "Use the Administrator account."],
  ["Create camp", "The guided workflow starts with a fictional camp and readiness checklist.", "Show the workflow progress."],
  ["Assign staff", "Staff handoffs are represented as an explicit operational step.", "Connect this to accountability."],
  ["Publish poster", "The public poster explains the camp and opens fictional registration.", "Open the poster if time allows."],
  ["Register patient", "Registration captures fictional details and consent before the visit continues.", "Emphasize privacy boundaries."],
  ["Generate token", "Each demonstration registration can receive a sample queue token.", "Show the confirmation state."],
  ["Screening", "Queue and screening steps keep the next operational handoff visible.", "Clarify that screening is not diagnosis."],
  ["Consultation", "Consultation is represented as a qualified-care workflow handoff.", "Do not claim clinical automation."],
  ["Medicine", "Inventory and dispensing views show stock readiness for a fictional camp.", "Explain stock alerts."],
  ["Referral", "Referral and follow-up are tracked as closing tasks, not autonomous medical decisions.", "Highlight human review."],
  ["Follow-up", "The workflow makes it easier to see what remains after the camp visit.", "Connect this to continuity of care."],
  ["Yash AI", "Yash AI summarizes aggregate operations, drafts reports, translates content, and refuses unsafe clinical requests.", "Show Demo Mode and safety notice."],
  ["Reports", "Aggregate reports help organizers review registrations, screenings, consultations, and referrals.", "Mention fictional data."],
  ["Kannada support", "The public experience can switch between English, Kannada, and Hindi demo content.", "Show the language control."],
  ["Offline demo", "The PWA shell and local demo storage support a classroom demonstration without a backend.", "State that localStorage is not secure clinical storage."],
  ["Dark mode", "Theme, contrast, reduced motion, and responsive layout support accessible presentation.", "Show the settings quickly."],
  ["Conclusion", "SmartCare makes a community health-camp operation understandable, demonstrable, and safer to discuss through explicit human oversight.", "End with social impact and future scope."]
];
let deferredInstallPrompt = null;
const DEMO_ACCOUNTS = [
  { id: "demo-admin", name: "Demo Administrator", email: "admin@smartcare.demo", password: "Admin@123", role: "Administrator" },
  { id: "demo-organizer", name: "Demo Organizer", email: "organizer@smartcare.demo", password: "Organizer@123", role: "Camp Organizer" },
  { id: "demo-doctor", name: "Demo Doctor", email: "doctor@smartcare.demo", password: "Doctor@123", role: "Doctor" },
  { id: "demo-nurse", name: "Demo Nurse", email: "nurse@smartcare.demo", password: "Nurse@123", role: "Nurse" },
  { id: "demo-volunteer", name: "Demo Volunteer", email: "volunteer@smartcare.demo", password: "Volunteer@123", role: "Volunteer" },
  { id: "demo-pharmacist", name: "Demo Pharmacist", email: "pharmacist@smartcare.demo", password: "Pharmacy@123", role: "Pharmacist" }
];

let patientDatabase = loadPatients();

function getAccounts() {
  const saved = appStorage.get(ACCOUNTS_KEY);
  if (!saved) {
    saveAccounts(DEMO_ACCOUNTS);
    return DEMO_ACCOUNTS;
  }

  try {
    const storedAccounts = JSON.parse(saved);
    const mergedAccounts = [...storedAccounts];
    DEMO_ACCOUNTS.forEach((demoAccount) => {
      if (!mergedAccounts.some((account) => account.email === demoAccount.email)) {
        mergedAccounts.push(demoAccount);
      }
    });
    const normalizedAccounts = mergedAccounts.map((account) => ({
      ...account,
      role: account.role || "Camp Organizer"
    }));
    saveAccounts(normalizedAccounts);
    return normalizedAccounts;
  } catch (error) {
    console.error("Account database parse failed:", error);
    return [];
  }
}

function saveAccounts(accounts) {
  appStorage.set(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getCurrentUser() {
  const saved = appStorage.get(ACTIVE_USER_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Current user parse failed:", error);
    return null;
  }
}

function setCurrentUser(user) {
  if (!user) {
    appStorage.remove(ACTIVE_USER_KEY);
    syncAuthState();
    return;
  }

  appStorage.set(ACTIVE_USER_KEY, JSON.stringify(user));
  syncAuthState();
}

function getPatientDatabaseKey() {
  const currentUser = getCurrentUser();
  return currentUser ? `${PATIENT_DB_PREFIX}${currentUser.id}` : STORAGE_KEY;
}

function loadPatients() {
  const key = getPatientDatabaseKey();
  const saved = appStorage.get(key);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Patient database parse failed:", error);
    }
  }

  if (getCurrentUser()) {
    return [];
  }

  const seedRecords = [];

  seedRecords.push(
    createPatientRecord(
      {
        name: "Anita Sharma",
        age: 34,
        gender: "Female",
        campName: DEFAULT_CAMP_NAME,
        registrationDate: "2026-09-18T09:15:00.000Z"
      },
      seedRecords
    )
  );

  seedRecords.push(
    createPatientRecord(
      {
        name: "Rohit Meena",
        age: 42,
        gender: "Male",
        campName: DEFAULT_CAMP_NAME,
        registrationDate: "2026-09-18T10:40:00.000Z"
      },
      seedRecords
    )
  );

  appStorage.set(key, JSON.stringify(seedRecords));
  return seedRecords;
}

function persistPatients() {
  appStorage.set(getPatientDatabaseKey(), JSON.stringify(patientDatabase));
}

function syncAuthState() {
  const currentUser = getCurrentUser();

  if (portalUserLabel) {
    portalUserLabel.textContent = currentUser
      ? `Signed in: ${currentUser.name} · ${currentUser.role || "Staff"}`
      : "Guest access";
  }

  if (logoutButton) {
    logoutButton.style.display = currentUser ? "inline-flex" : "none";
  }

  if (portalDashboard) {
    portalDashboard.classList.toggle("visible", Boolean(currentUser));
  }

  if (aiAssistButton) {
    aiAssistButton.hidden = !currentUser;
  }
  if (!currentUser) setFloatingAiOpen(false);
}

function refreshCurrentPatientData() {
  patientDatabase = loadPatients();
  renderRecentPatients();
  renderOperationsPanels();
}

const ROLE_PERMISSIONS = {
  Administrator: ["dashboard-panel", "presentation-panel", "workflow-panel", "register-panel", "queue-panel", "scanner-panel", "pharmacy-panel", "reports-panel", "settings-panel", "profile-panel", "ai-panel"],
  "Camp Organizer": ["dashboard-panel", "presentation-panel", "workflow-panel", "register-panel", "queue-panel", "reports-panel", "settings-panel", "profile-panel", "ai-panel"],
  Doctor: ["dashboard-panel", "presentation-panel", "workflow-panel", "scanner-panel", "reports-panel", "settings-panel", "profile-panel", "ai-panel"],
  Nurse: ["dashboard-panel", "presentation-panel", "workflow-panel", "register-panel", "queue-panel", "scanner-panel", "reports-panel", "settings-panel", "profile-panel", "ai-panel"],
  Volunteer: ["dashboard-panel", "presentation-panel", "workflow-panel", "register-panel", "queue-panel", "settings-panel", "profile-panel", "ai-panel"],
  Pharmacist: ["dashboard-panel", "presentation-panel", "workflow-panel", "pharmacy-panel", "reports-panel", "settings-panel", "profile-panel", "ai-panel"]
};

const WORKFLOW_STEPS = [
  ["Create or select camp", "Start with a fictional camp record and choose the current event."],
  ["Check camp readiness", "Confirm the venue, equipment, and safety checklist."],
  ["Assign staff", "Review the role roster for the selected camp."],
  ["Prepare inventory", "Check fictional medicine and equipment stock."],
  ["Publish poster", "Open the camp poster and make the event visible."],
  ["Register patient", "Capture a fictional patient record with consent."],
  ["Generate token", "Create a queue token and attach it to the patient visit."],
  ["Complete screening", "Record screening information for qualified review."],
  ["Complete consultation", "Document a fictional consultation outcome."],
  ["Add prescription", "Add a fictional prescription item when appropriate."],
  ["Dispense medicine", "Validate stock and record a fictional dispense event."],
  ["Create referral or follow-up", "Close the loop with a referral or follow-up action."],
  ["Close patient visit", "Mark the visit complete after required care steps."],
  ["View camp statistics", "Review aggregate operational figures."],
  ["Generate report", "Export or print the fictional camp summary."]
];

function getDemoMedicines() {
  const saved = localStorage.getItem("smartcareDemoMedicines");
  if (saved) {
    try { return JSON.parse(saved); } catch (error) { console.error("Medicine data parse failed:", error); }
  }
  const initial = [
    { id: "med-1", name: "Paracetamol 500mg", quantity: 42, minimum: 10 },
    { id: "med-2", name: "ORS Sachets", quantity: 8, minimum: 12 },
    { id: "med-3", name: "Cetirizine 10mg", quantity: 24, minimum: 10 }
  ];
  localStorage.setItem("smartcareDemoMedicines", JSON.stringify(initial));
  return initial;
}

function saveDemoMedicines(medicines) {
  localStorage.setItem("smartcareDemoMedicines", JSON.stringify(medicines));
}

function renderRoleDashboard() {
  const currentUser = getCurrentUser();
  const content = document.getElementById("roleDashboardContent");
  const title = document.getElementById("roleDashboardTitle");
  if (!content || !title) return;

  const role = currentUser?.role || "Staff";
  const copy = {
    Administrator: "Review every operational area, reset fictional data, and monitor activity.",
    "Camp Organizer": "Coordinate camp registrations, queue progress, staff handoffs, and reports.",
    Doctor: "Review assigned patient passes and keep consultation and referral work visible.",
    Nurse: "Record intake, support screening, and keep the current queue moving.",
    Volunteer: "Register fictional patients, issue queue tokens, and update queue status.",
    Pharmacist: "Monitor stock alerts and keep medicine operations ready for dispensing."
  };
  title.textContent = `${role} dashboard`;
  content.innerHTML = `<p>${copy[role] || "Use the tabs above to work with the demonstration data."}</p><div class="role-chip-row"><span class="role-chip">${role}</span><span class="role-chip">Fictional data</span><span class="role-chip">Local browser storage</span></div>`;
}

function renderProfile() {
  const currentUser = getCurrentUser();
  const name = document.getElementById("profileName");
  const role = document.getElementById("profileRole");
  const email = document.getElementById("profileEmail");
  const avatar = document.getElementById("profileAvatar");
  if (!name || !role || !email || !avatar) return;
  const displayName = currentUser?.name || "Guest access";
  name.textContent = displayName;
  role.textContent = currentUser?.role || "Staff";
  email.textContent = currentUser?.email || "Not signed in";
  avatar.textContent = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function getAiAggregateData() {
  const medicines = getDemoMedicines();
  const waiting = patientDatabase.filter((patient) => !patient.queueStatus || patient.queueStatus === "Waiting").length;
  const consultations = patientDatabase.filter((patient) => (patient.history?.consultation || []).length).length;
  const referrals = patientDatabase.filter((patient) => (patient.history?.referral || []).length).length;
  return {
    registrations: patientDatabase.length,
    waiting,
    consultations,
    referrals,
    lowStock: medicines.filter((medicine) => medicine.quantity <= medicine.minimum).length,
    departments: patientDatabase.reduce((groups, patient) => { const department = patient.department || "General Check-up"; groups[department] = (groups[department] || 0) + 1; return groups; }, {})
  };
}

function getAiAuditLogs() {
  try { return JSON.parse(localStorage.getItem("smartcareAiAuditLogs") || "[]"); } catch (error) { return []; }
}

function logAiRequest(type, status = "completed", mode = yashAiMode) {
  const logs = getAiAuditLogs();
  const auditMode = mode === "real" ? "Real AI (server proxy)" : mode === "fallback" ? "Demo fallback" : "Demo AI";
  logs.push({ role: getCurrentUser()?.role || "Guest", feature: type, dataCategory: "Aggregate fictional operations", mode: auditMode, status, reviewed: false, timestamp: new Date().toISOString() });
  localStorage.setItem("smartcareAiAuditLogs", JSON.stringify(logs.slice(-50)));
  if (aiAuditSummary) aiAuditSummary.textContent = `${logs.length} non-sensitive Yash AI request${logs.length === 1 ? "" : "s"} recorded.`;
}

function setYashAiMode(mode) {
  yashAiMode = mode === "real" || mode === "fallback" ? mode : "demo";
  const isReal = yashAiMode === "real";
  const isFallback = yashAiMode === "fallback";
  const dashboardStatus = document.getElementById("dashboardAiStatus");
  const mainStatus = document.getElementById("yashAiStatus");
  const floatingBadge = document.getElementById("floatingAiBadge");
  const providerStatus = document.getElementById("aiProviderStatus");
  const previewDestination = document.getElementById("aiPreviewDestination");
  const badgeText = isReal ? "Real AI" : isFallback ? "Demo fallback" : "Demo Mode";

  if (dashboardStatus) {
    dashboardStatus.textContent = badgeText;
    dashboardStatus.className = `status-badge ${isFallback ? "warning" : "success"}`;
  }
  if (floatingBadge) floatingBadge.textContent = badgeText;
  if (mainStatus) {
    mainStatus.textContent = isReal
      ? "● Real AI · Secure server proxy · Aggregate-only"
      : isFallback
        ? "● Demo fallback · Provider unavailable"
        : "● Demo Mode · Local fallback · No API key";
  }
  if (providerStatus) {
    providerStatus.textContent = isReal
      ? "Gemini is connected through the local server. Its API key is server-side and is never sent to this browser."
      : isFallback
        ? "The real provider is unavailable, so Yash AI is using local demo rules. No request content was sent to a provider."
        : "No server-side provider key is configured. Yash AI is using local demo rules only.";
  }
  if (previewDestination) {
    previewDestination.textContent = isReal
      ? "The aggregate fictional counts will be sent to Gemini through the local server proxy; no browser API key is used."
      : "Yash AI local demo rules running in this browser; no external provider receives this request.";
  }
}

async function refreshYashAiProviderStatus() {
  try {
    const response = await fetch("/api/yash-ai/status", { cache: "no-store", credentials: "same-origin" });
    const result = await response.json();
    setYashAiMode(response.ok && result.mode === "real" ? "real" : "demo");
  } catch (error) {
    setYashAiMode("demo");
  }
}

function getSafeAiAggregateData() {
  const aggregate = getAiAggregateData();
  return {
    registrations: aggregate.registrations,
    waiting: aggregate.waiting,
    consultations: aggregate.consultations,
    referrals: aggregate.referrals,
    lowStock: aggregate.lowStock
  };
}

async function requestYashAiResponse(prompt) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("/api/yash-ai", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, aggregate: getSafeAiAggregateData() })
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && typeof result.response === "string") {
      if (result.mode === "real") setYashAiMode("real");
      if (result.mode === "safety-refusal") return { text: result.response, mode: "safety-refusal" };
      if (result.mode === "real") return { text: result.response, mode: "real" };
    }
    if (result.mode === "demo-fallback") setYashAiMode("fallback");
  } catch (error) {
    setYashAiMode("fallback");
  } finally {
    window.clearTimeout(timeout);
  }
  return { text: generateDemoAiResponse(prompt), mode: yashAiMode === "fallback" ? "fallback" : "demo" };
}

function generateDemoAiResponse(prompt) {
  const normalized = prompt.toLowerCase();
  const response = (text) => `${text}\n\nGenerated from fictional SmartCare Camp demo data.`;
  if (/diagnos|disease|individual risk|predict.*risk|clinical decision|change the doctor/i.test(normalized)) return response("I cannot diagnose patients or make clinical decisions. Please ask a qualified healthcare professional. I can help summarize non-sensitive operational information.");
  if (/prescrib|medicine should|what medicine|treatment/i.test(normalized)) return response("I cannot recommend medicines or treatment. A qualified healthcare professional must make that decision. I can help organize an existing authorized record.");
  if (/emergency|urgent treatment/i.test(normalized)) return response("I cannot provide emergency treatment instructions. Contact appropriate local emergency services and qualified healthcare professionals immediately.");
  if (/should.*refer|referral decision|refer this patient/i.test(normalized)) return response("I cannot make clinical referral decisions. An authorized healthcare professional must review the patient. I can organize referral records and follow-up tasks.");
  if (/all patient|diagnoses|phone number|address|government id|medical histor/i.test(normalized)) return response("I cannot display unnecessary sensitive patient information. I can provide an aggregate fictional summary by category if your role permits it.");
  const data = getAiAggregateData();
  if (normalized.includes("queue") || normalized.includes("department")) {
    return response(`Current situation: ${data.waiting} fictional patient${data.waiting === 1 ? " is" : "s are"} currently waiting. Department-level detail remains aggregate.\n\nSuggested administrative next step: review registration and queue staffing.`);
  }
  if (normalized.includes("translate") || normalized.includes("kannada")) {
    return response("Translation draft: ಆರೋಗ್ಯ ಶಿಬಿರಕ್ಕೆ ಸ್ವಾಗತ. ನೋಂದಣಿ, ತಪಾಸಣೆ ಮತ್ತು ಆರೋಗ್ಯ ಜಾಗೃತಿ ಸೇವೆಗಳು ಲಭ್ಯವಿವೆ.\n\nReview this translation before using it for public communication.");
  }
  if (/readiness|checklist|plan|venue|equipment|staff briefing|volunteer briefing|volunteer/i.test(normalized)) {
    return response("Camp-readiness checklist:\n• Confirm registration desks and queue signage.\n• Confirm staff roster and handoff points.\n• Check fictional inventory and equipment.\n• Prepare volunteer briefing and public poster.\n• Review offline sync status.\n\nDemo planning estimate only. Verify all operational decisions with the responsible organizer and qualified professionals.");
  }
  if (/incomplete|data quality|duplicate|missing consent|overdue|stock problem/i.test(normalized)) {
    const missingScreening = patientDatabase.filter((patient) => !(patient.history?.screening || []).length).length;
    return response(`Data-quality review found ${missingScreening} fictional record(s) without a screening entry. Review manually; Yash AI never changes records silently. Also check consent, duplicate registrations, stock thresholds, and overdue follow-ups.`);
  }
  if (/viva|presentation|five-minute|explain.*dashboard|difference between screening/i.test(normalized)) {
    return response("Presentation support: SmartCare Camp is a browser-based educational prototype for coordinating fictional community health-camp operations. Explain the role-based dashboard, workflow handoffs, aggregate-only Demo AI, and why localStorage is not suitable for real health records.");
  }
  if (normalized.includes("report") || normalized.includes("summarize") || normalized.includes("camp")) {
    return response(`Current situation: ${data.registrations} fictional registration${data.registrations === 1 ? " was" : "s were"} recorded, ${data.consultations} consultation${data.consultations === 1 ? " was" : "s were"} documented, ${data.waiting} patient${data.waiting === 1 ? " is" : "s are"} waiting, and ${data.referrals} referral${data.referrals === 1 ? " is" : "s are"} tracked.\n\nItems needing attention: ${data.lowStock} medicine stock alert${data.lowStock === 1 ? " needs" : "s need"} administrative review.\n\nSuggested next step: review the queue and export the aggregate camp report.`);
  }
  if (normalized.includes("poster") || normalized.includes("education") || normalized.includes("volunteer")) {
    return response("Poster draft: Welcome to SmartCare Camp. Join us for community screening, health awareness, and referral support. Please bring your questions and speak with qualified healthcare professionals.\n\nReview this educational content before public use.");
  }
  return response(`I can summarize operations, prepare reports, plan camp logistics, review fictional data quality, draft posters, translate content, and support your college presentation. Current totals: ${data.registrations} registrations, ${data.waiting} waiting, ${data.consultations} consultations, and ${data.lowStock} low-stock alerts.`);
}

function appendAiMessage(role, text) {
  if (!aiChat) return;
  const message = document.createElement("div");
  message.className = `ai-message ${role}`;
  message.innerHTML = `<strong>${role === "user" ? "You" : "Yash AI"}</strong><p></p><time>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>`;
  message.querySelector("p").textContent = text;
  aiChat.appendChild(message);
  aiChat.scrollTop = aiChat.scrollHeight;
  return message;
}

function openYashAi(prompt = "") {
  document.querySelector('[data-tab="ai-panel"]')?.click();
  portalDashboard?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (prompt && aiPromptInput) {
    aiPromptInput.value = prompt;
    aiPromptInput.focus();
  }
}

function exportAiConversation() {
  const messages = [...(aiChat?.querySelectorAll(".ai-message") || [])].map((message) => message.textContent.trim()).join("\n\n");
  downloadText("yash-ai-conversation.txt", messages || "No Yash AI conversation yet.");
}

function setFloatingAiOpen(open) {
  if (!floatingAiPanel) return;
  floatingAiPanel.classList.toggle("visible", open);
  floatingAiPanel.setAttribute("aria-hidden", String(!open));
  if (open) floatingAiInput?.focus();
}

function appendFloatingAiMessage(role, text, loading = false) {
  if (!floatingAiMessages) return;
  const message = document.createElement("div");
  message.className = `floating-ai-message ${role}${loading ? " loading" : ""}`;
  message.innerHTML = `<strong>${role === "user" ? "You" : "Yash AI"}</strong><p></p>`;
  message.querySelector("p").textContent = text;
  floatingAiMessages.appendChild(message);
  floatingAiMessages.scrollTop = floatingAiMessages.scrollHeight;
  return message;
}

function floatingAiGreeting() {
  return floatingAiLanguage?.value === "kn"
    ? "ನಮಸ್ಕಾರ! ಶಿಬಿರ ಕಾರ್ಯಾಚರಣೆ, ವರದಿ, ಪೋಸ್ಟರ್ ಮತ್ತು ಅನುವಾದದಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಾನು ರೋಗನಿರ್ಣಯ ಅಥವಾ ಔಷಧ ಸಲಹೆ ನೀಡುವುದಿಲ್ಲ."
    : floatingAiLanguage?.value === "hi"
      ? "नमस्ते! मैं शिविर संचालन, रिपोर्ट, पोस्टर और अनुवाद में मदद कर सकता हूँ। मैं निदान या दवा की सलाह नहीं देता।"
      : "Hello! I can help with fictional camp operations, reports, posters, translations, and presentation support. I cannot diagnose or prescribe.";
}

async function submitFloatingAiPrompt(prompt) {
  const cleanPrompt = String(prompt || "").trim();
  if (!cleanPrompt) return;
  appendFloatingAiMessage("user", cleanPrompt);
  if (floatingAiInput) floatingAiInput.value = "";
  const loading = appendFloatingAiMessage("assistant", "Yash AI is preparing a safe response…", true);
  if (floatingAiForm) floatingAiForm.classList.add("is-loading");
  try {
    const result = await requestYashAiResponse(cleanPrompt);
    loading?.remove();
    appendFloatingAiMessage("assistant", result.text);
    logAiRequest("Floating assistant prompt", result.mode === "safety-refusal" ? "safety-refusal" : "completed", result.mode);
  } finally {
    if (floatingAiForm) floatingAiForm.classList.remove("is-loading");
  }
}

function bindFloatingAiAssistant() {
  aiAssistButton?.addEventListener("click", () => {
    if (!getCurrentUser()) {
      openModal();
      return;
    }
    const isOpen = floatingAiPanel?.classList.contains("visible");
    setFloatingAiOpen(!isOpen);
  });
  document.getElementById("floatingAiMinimize")?.addEventListener("click", () => setFloatingAiOpen(false));
  document.getElementById("floatingAiClose")?.addEventListener("click", () => setFloatingAiOpen(false));
  document.getElementById("floatingAiClear")?.addEventListener("click", () => {
    if (floatingAiMessages) floatingAiMessages.innerHTML = "";
    appendFloatingAiMessage("assistant", floatingAiGreeting());
  });
  floatingAiForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!floatingAiForm.classList.contains("is-loading")) submitFloatingAiPrompt(floatingAiInput?.value);
  });
  floatingAiInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      floatingAiForm?.requestSubmit();
    }
  });
  document.querySelectorAll("[data-floating-ai-prompt]").forEach((button) => button.addEventListener("click", () => submitFloatingAiPrompt(button.dataset.floatingAiPrompt)));
  floatingAiLanguage?.addEventListener("change", () => {
    const language = floatingAiLanguage.value;
    if (language !== "en") setLanguage(language);
    appendFloatingAiMessage("assistant", floatingAiGreeting());
  });
}

function openAiPreview(prompt) {
  pendingAiPrompt = prompt;
  const data = getAiAggregateData();
  const included = document.getElementById("aiPreviewIncluded");
  if (included) included.textContent = `${data.registrations} registration count(s), ${data.waiting} queue count(s), ${data.consultations} consultation count(s), ${data.referrals} referral count(s), and ${data.lowStock} inventory alert(s).`;
  aiPreviewModal?.classList.add("visible");
  aiPreviewModal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeAiPreview() {
  aiPreviewModal?.classList.remove("visible");
  aiPreviewModal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function closeCommandPalette() {
  commandPalette?.classList.remove("visible");
  commandPalette?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openCommandPalette() {
  if (!getCurrentUser()) {
    showToast("Sign in to use Yash AI.", "info");
    openModal();
    return;
  }
  commandPalette?.classList.add("visible");
  commandPalette?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function bindAiAssistant() {
  const ask = () => {
    const prompt = aiPromptInput?.value.trim();
    if (prompt) openAiPreview(prompt);
  };
  document.getElementById("dashboardAskAiButton")?.addEventListener("click", () => openYashAi());
  document.getElementById("dashboardSummarizeAiButton")?.addEventListener("click", () => {
    openYashAi("Summarize today’s camp operations.");
    document.getElementById("aiAskButton")?.click();
  });
  document.getElementById("aiAskButton")?.addEventListener("click", ask);
  aiPromptInput?.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(); } });
  document.querySelectorAll("[data-ai-prompt]").forEach((button) => button.addEventListener("click", () => { aiPromptInput.value = button.dataset.aiPrompt; ask(); }));
  document.getElementById("confirmAiPreviewButton")?.addEventListener("click", async (event) => {
    const confirmButton = event.currentTarget;
    const prompt = pendingAiPrompt;
    confirmButton.disabled = true;
    closeAiPreview();
    aiPromptInput.value = "";
    appendAiMessage("user", prompt);
    const loading = appendAiMessage("assistant", "Yash AI is preparing a safe response…");
    loading?.classList.add("loading");
    try {
      const result = await requestYashAiResponse(prompt);
      loading?.classList.remove("loading");
      const responseText = loading?.querySelector("p");
      if (responseText) responseText.textContent = result.text;
      logAiRequest("Assistant prompt", result.mode === "safety-refusal" ? "safety-refusal" : "completed", result.mode);
    } finally {
      confirmButton.disabled = false;
    }
  });
  document.getElementById("cancelAiPreviewButton")?.addEventListener("click", closeAiPreview);
  document.getElementById("closeAiPreviewButton")?.addEventListener("click", closeAiPreview);
  document.getElementById("aiClearButton")?.addEventListener("click", () => {
    aiChat.innerHTML = "<div class='ai-message assistant'><strong>Yash AI</strong><p>Conversation cleared. I can help with fictional administrative summaries and education drafts.</p><time>Now</time></div>";
  });
  document.getElementById("aiNewConversationButton")?.addEventListener("click", () => {
    aiChat.innerHTML = "<div class='ai-message assistant'><strong>Yash AI</strong><p>Hello! I’m Yash AI. I can help summarize camp operations, prepare reports, create announcements, translate content, and organize tasks. I cannot diagnose or prescribe.</p><time>Now</time></div>";
    showToast("New Yash AI conversation started.", "success");
  });
  document.getElementById("aiCopyButton")?.addEventListener("click", async () => {
    const messages = aiChat?.querySelectorAll(".ai-message.assistant p");
    const latest = messages?.[messages.length - 1]?.textContent || "No response yet.";
    try { await navigator.clipboard.writeText(latest); showToast("Latest Yash AI response copied.", "success"); } catch (error) { showToast("Copy is unavailable in this browser.", "info"); }
  });
  document.getElementById("aiExportButton")?.addEventListener("click", exportAiConversation);
  document.getElementById("aiReviewedButton")?.addEventListener("click", () => showToast("Conversation marked for human review.", "success"));
  document.getElementById("aiPrintButton")?.addEventListener("click", () => window.print());
  const logs = getAiAuditLogs();
  if (aiAuditSummary && logs.length) aiAuditSummary.textContent = `${logs.length} non-sensitive Yash AI request${logs.length === 1 ? "" : "s"} recorded.`;

  document.getElementById("commandAskAiButton")?.addEventListener("click", () => { closeCommandPalette(); openYashAi(); });
  document.getElementById("closeCommandPaletteButton")?.addEventListener("click", closeCommandPalette);
  commandPalette?.addEventListener("click", (event) => { if (event.target === commandPalette) closeCommandPalette(); });
}

function getWorkflowState() {
  const saved = localStorage.getItem(WORKFLOW_KEY);
  if (!saved) return { currentStep: 0, completed: [], updatedAt: null };
  try { return JSON.parse(saved); } catch (error) { return { currentStep: 0, completed: [], updatedAt: null }; }
}

function saveWorkflowState(state) {
  const nextState = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(WORKFLOW_KEY, JSON.stringify(nextState));
  return nextState;
}

function addPendingSync(label) {
  const pending = Number(localStorage.getItem(PENDING_SYNC_KEY) || 0) + 1;
  localStorage.setItem(PENDING_SYNC_KEY, String(pending));
  if (syncStatus) syncStatus.textContent = `${pending} demo change${pending === 1 ? "" : "s"} pending sync`;
  return label;
}

function renderWorkflow() {
  const list = document.getElementById("workflowStepList");
  const state = getWorkflowState();
  const currentStep = Math.min(Math.max(Number(state.currentStep) || 0, 0), WORKFLOW_STEPS.length - 1);
  if (!list) return;
  const completed = new Set(state.completed || []);
  list.innerHTML = WORKFLOW_STEPS.map(([title], index) => {
    const isComplete = completed.has(index);
    const isCurrent = currentStep === index;
    const locked = index > currentStep && !isComplete;
    return `<button class="workflow-step ${isComplete ? "complete" : ""} ${isCurrent ? "current" : ""}" type="button" data-workflow-step="${index}" ${locked ? "disabled" : ""}><span>${isComplete ? "✓" : index + 1}</span>${title}</button>`;
  }).join("");
  list.querySelectorAll("[data-workflow-step]").forEach((button) => button.addEventListener("click", () => {
    const next = getWorkflowState();
    next.currentStep = Number(button.dataset.workflowStep);
    saveWorkflowState(next);
    renderWorkflow();
  }));
  const [title, description] = WORKFLOW_STEPS[currentStep];
  const stepNumber = document.getElementById("workflowStepNumber");
  const stepTitle = document.getElementById("workflowStepTitle");
  const stepDescription = document.getElementById("workflowStepDescription");
  const stepNote = document.getElementById("workflowDataNote");
  const progressLabel = document.getElementById("workflowProgressLabel");
  const progressBar = document.getElementById("workflowProgressBar");
  const backButton = document.getElementById("workflowBackButton");
  const nextButton = document.getElementById("workflowNextButton");
  if (stepNumber) stepNumber.textContent = `Step ${currentStep + 1} of ${WORKFLOW_STEPS.length}`;
  if (stepTitle) stepTitle.textContent = title;
  if (stepDescription) stepDescription.textContent = description;
  if (stepNote) stepNote.textContent = state.updatedAt ? `Last saved ${formatDate(state.updatedAt)}. Changes are fictional and local.` : "No demo record created for this step yet.";
  if (progressLabel) progressLabel.textContent = `${completed.size} of ${WORKFLOW_STEPS.length} complete`;
  if (progressBar) progressBar.style.width = `${(completed.size / WORKFLOW_STEPS.length) * 100}%`;
  if (backButton) backButton.disabled = currentStep === 0;
  if (nextButton) nextButton.textContent = currentStep === WORKFLOW_STEPS.length - 1 ? "Finish workflow" : completed.has(currentStep) ? "Next step" : "Complete step";
}

function bindWorkflow() {
  document.getElementById("workflowNextButton")?.addEventListener("click", () => {
    const state = getWorkflowState();
    const completed = new Set(state.completed || []);
    completed.add(Number(state.currentStep) || 0);
    state.completed = [...completed].sort((a, b) => a - b);
    state.currentStep = Math.min((Number(state.currentStep) || 0) + 1, WORKFLOW_STEPS.length - 1);
    saveWorkflowState(state);
    addPendingSync("workflow step");
    renderWorkflow();
    showToast("Workflow step saved. The next step is ready.", "success");
  });
  document.getElementById("workflowBackButton")?.addEventListener("click", () => {
    const state = getWorkflowState();
    state.currentStep = Math.max((Number(state.currentStep) || 0) - 1, 0);
    saveWorkflowState(state);
    renderWorkflow();
  });
  document.getElementById("workflowDraftButton")?.addEventListener("click", () => {
    saveWorkflowState(getWorkflowState());
    addPendingSync("workflow draft");
    showToast("Workflow draft saved locally.", "success");
    renderWorkflow();
  });
  document.getElementById("resumeWorkflowButton")?.addEventListener("click", renderWorkflow);
  renderWorkflow();
}

function getRecommendedAction() {
  const medicines = getDemoMedicines();
  const waiting = patientDatabase.filter((patient) => !patient.queueStatus || patient.queueStatus === "Waiting").length;
  const screeningsPending = patientDatabase.some((patient) => patient.queueStatus === "Waiting" || !patient.queueStatus);
  const lowStock = medicines.some((medicine) => medicine.quantity <= medicine.minimum);
  const needsFollowup = patientDatabase.some((patient) => (patient.history?.consultation || []).length > 0 && (patient.history?.followup || []).length === 0);

  if (!patientDatabase.length) return "Register your first patient.";
  if (screeningsPending) return "Complete pending screening.";
  if (lowStock) return "Dispense pending medicines.";
  if (needsFollowup) return "Complete overdue follow-ups.";
  if (waiting > 0) return "Review the doctor queue.";
  return "Generate the camp report.";
}

function renderDashboardSummary() {
  const summary = document.getElementById("dashboardSummaryGrid");
  const recommendedBanner = document.getElementById("recommendedActionBanner");
  if (!summary) return;
  const medicines = getDemoMedicines();
  const waiting = patientDatabase.filter((patient) => !patient.queueStatus || patient.queueStatus === "Waiting").length;
  const consultations = patientDatabase.filter((patient) => (patient.history?.consultation || []).length).length;
  const lowStock = medicines.filter((medicine) => medicine.quantity <= medicine.minimum).length;
  const cards = [
    [patientDatabase.length, "Registered patients", "care"],
    [waiting, "Patients waiting", "queue"],
    [consultations, "Consultations recorded", "success"],
    [lowStock, "Low-stock medicines", "warning"]
  ];
  summary.innerHTML = cards.map(([value, label, tone]) => `<div class="summary-card ${tone}"><strong>${value}</strong><span>${label}</span></div>`).join("");

  if (recommendedBanner) {
    recommendedBanner.textContent = getRecommendedAction();
  }
}

function renderQueue() {
  const list = document.getElementById("queueList");
  const badge = document.getElementById("queueCountBadge");
  const search = (document.getElementById("queueSearchInput")?.value || "").toLowerCase();
  if (!list) return;
  const visiblePatients = patientDatabase.filter((patient) => `${patient.name} ${patient.patientId}`.toLowerCase().includes(search));
  const waiting = patientDatabase.filter((patient) => !patient.queueStatus || patient.queueStatus === "Waiting");
  if (badge) badge.textContent = `${waiting.length} waiting`;
  list.innerHTML = visiblePatients.length ? visiblePatients.map((patient) => {
    const status = patient.queueStatus || "Waiting";
    return `<div class="queue-row"><div><strong>${patient.name}</strong><span>${patient.patientId}</span></div><span class="queue-status ${status.toLowerCase().replace(" ", "-")}">${status}</span><button class="button button-ghost small-button" type="button" data-queue-id="${patient.patientId}">${status === "Waiting" ? "Start screening" : "Mark complete"}</button></div>`;
  }).join("") : `<div class="empty-state">No matching queue records.</div>`;
  list.querySelectorAll("[data-queue-id]").forEach((button) => button.addEventListener("click", () => {
    const patient = patientDatabase.find((entry) => entry.patientId === button.dataset.queueId);
    if (!patient) return;
    patient.queueStatus = patient.queueStatus === "Waiting" ? "Screening" : patient.queueStatus === "Screening" ? "Completed" : "Waiting";
    persistPatients();
    renderOperationsPanels();
    showToast(`${patient.name} is now ${patient.queueStatus}.`, "success");
  }));
}

function renderInventory() {
  const list = document.getElementById("medicineList");
  const alerts = document.getElementById("inventoryAlerts");
  if (!list) return;
  const medicines = getDemoMedicines();
  const lowStock = medicines.filter((medicine) => medicine.quantity <= medicine.minimum);
  if (alerts) alerts.innerHTML = lowStock.length ? `<div class="alert-box warning">${lowStock.length} medicine item(s) need stock attention.</div>` : `<div class="alert-box success">Inventory levels are currently healthy.</div>`;
  list.innerHTML = medicines.map((medicine) => `<div class="medicine-row"><div><strong>${medicine.name}</strong><span>Minimum stock: ${medicine.minimum}</span></div><strong class="medicine-quantity ${medicine.quantity <= medicine.minimum ? "low" : ""}">${medicine.quantity}</strong><button class="button button-ghost small-button" type="button" data-stock-id="${medicine.id}">+5 stock</button></div>`).join("");
  list.querySelectorAll("[data-stock-id]").forEach((button) => button.addEventListener("click", () => {
    const medicine = medicines.find((entry) => entry.id === button.dataset.stockId);
    if (!medicine) return;
    medicine.quantity += 5;
    saveDemoMedicines(medicines);
    renderOperationsPanels();
    showToast(`${medicine.name} stock updated.`, "success");
  }));
}

function renderReports() {
  const summary = document.getElementById("reportSummary");
  const bars = document.getElementById("reportBars");
  if (!summary || !bars) return;
  const screenings = patientDatabase.filter((patient) => (patient.history?.screening || []).length).length;
  const referrals = patientDatabase.filter((patient) => (patient.history?.referral || []).length).length;
  summary.innerHTML = [[patientDatabase.length, "Patients"], [screenings, "Screenings"], [patientDatabase.filter((patient) => (patient.history?.consultation || []).length).length, "Consultations"], [referrals, "Referrals"]].map(([value, label]) => `<div class="report-stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
  const groups = { Female: 0, Male: 0, Other: 0 };
  patientDatabase.forEach((patient) => { groups[patient.gender] = (groups[patient.gender] || 0) + 1; });
  const max = Math.max(1, ...Object.values(groups));
  bars.innerHTML = Object.entries(groups).map(([label, value]) => `<div class="report-bar-row"><span>${label}</span><div><i style="width:${(value / max) * 100}%"></i></div><strong>${value}</strong></div>`).join("");
}

function renderOperationsPanels() {
  renderDashboardSummary();
  renderRoleDashboard();
  renderProfile();
  renderQueue();
  renderInventory();
  renderReports();
  applyRolePermissions();
}

function applyRolePermissions() {
  const currentUser = getCurrentUser();
  const allowed = ROLE_PERMISSIONS[currentUser?.role] || [];
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.hidden = !allowed.includes(button.dataset.tab);
  });
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename, value) {
  const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function generatePatientId(existingRecords = []) {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  let patientId = `SC-${timestampPart}-${randomPart}`;

  while (existingRecords.some((patient) => patient.patientId === patientId)) {
    patientId = `SC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  return patientId;
}

function buildQrPayload(patientId) {
  return `smartcare://patient/${patientId}`;
}

function buildQrUrl(payload) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
}

function createPatientRecord({ name, age, gender, campName, registrationDate }, existingRecords = []) {
  const patientId = generatePatientId(existingRecords);
  const normalizedRegistrationDate = registrationDate || new Date().toISOString();
  const qrPayload = buildQrPayload(patientId);

  return {
    patientId,
    name,
    age: Number(age),
    gender,
    campName: campName || DEFAULT_CAMP_NAME,
    registrationDate: normalizedRegistrationDate,
    qrPayload,
    qrCodeUrl: buildQrUrl(qrPayload),
    history: {
      registration: [{
        date: normalizedRegistrationDate,
        note: "Patient registered and QR pass generated."
      }],
      screening: [],
      consultation: [],
      medicine: [],
      referral: [],
      followup: []
    }
  };
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shouldAutoShowPoster() {
  if (sessionStorage.getItem(POSTER_SESSION_KEY) === "shown") {
    return false;
  }

  const hiddenToday = localStorage.getItem(POSTER_DONT_SHOW_TODAY_KEY);
  if (hiddenToday === getTodayKey()) {
    return false;
  }

  return true;
}

function openPosterModal({ rememberSession = false } = {}) {
  if (!campPosterModal) return;

  campPosterModal.classList.add("visible");
  campPosterModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (rememberSession) {
    sessionStorage.setItem(POSTER_SESSION_KEY, "shown");
  }
}

function closePosterModal() {
  if (!campPosterModal) return;

  campPosterModal.classList.remove("visible");
  campPosterModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (posterDoNotShowAgain && posterDoNotShowAgain.checked) {
    localStorage.setItem(POSTER_DONT_SHOW_TODAY_KEY, getTodayKey());
  }

  sessionStorage.setItem(POSTER_SESSION_KEY, "shown");
}

function openCampRegistration() {
  closePosterModal();

  if (!campRegistrationModal) return;
  campRegistrationModal.classList.add("visible");
  campRegistrationModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCampRegistration() {
  if (!campRegistrationModal) return;
  campRegistrationModal.classList.remove("visible");
  campRegistrationModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function generateDemoQueueToken() {
  const current = Number(localStorage.getItem(CAMP_REGISTRATION_COUNTER) || 0) + 1;
  localStorage.setItem(CAMP_REGISTRATION_COUNTER, String(current));
  return `SC-${String(current).padStart(3, "0")}`;
}

function renderCampRegistrationSuccess(token) {
  if (!campRegistrationStatus) return;

  campRegistrationStatus.className = "camp-registration-status success";
  campRegistrationStatus.innerHTML = `
    <div class="demo-confirmation-card">
      <p class="demo-confirmation-heading">Demo registration completed.</p>
      <div class="demo-token-box">Your sample queue token: <strong>${token}</strong></div>
      <p>This is fictional demo data for the SmartCare Camp educational project.</p>
      <button class="button button-primary small-button" type="button" id="printConfirmationButton">Print Confirmation</button>
    </div>
  `;

  const printConfirmationButton = document.getElementById("printConfirmationButton");
  if (printConfirmationButton) {
    printConfirmationButton.addEventListener("click", () => window.print());
  }
}

function showToast(message, type = "info") {
  if (!toast) return;

  toast.className = `toast show ${type}`;
  toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.className = "toast";
  }, 2600);
}

function runAccessibilityAudit() {
  const warnings = [];
  const importantText = [...document.querySelectorAll("body *")].filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  });

  importantText.forEach((element) => {
    if ((element.tagName === "LABEL" || element.tagName === "P" || element.tagName === "SPAN" || element.tagName === "H1" || element.tagName === "H2" || element.tagName === "H3") && element.textContent.trim()) {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const bg = style.backgroundColor;

      if (color && bg && color.startsWith("rgb") && bg.startsWith("rgb")) {
        const parseRgb = (value) => value.match(/\d+/g)?.map(Number) || [0, 0, 0];
        const [r1, g1, b1] = parseRgb(color);
        const [r2, g2, b2] = parseRgb(bg);
        const luminance = (value) => {
          const channel = value / 255;
          return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        };
        const lum1 = 0.2126 * luminance(r1) + 0.7152 * luminance(g1) + 0.0722 * luminance(b1);
        const lum2 = 0.2126 * luminance(r2) + 0.7152 * luminance(g2) + 0.0722 * luminance(b2);
        const contrast = lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
        if (contrast < 4.5 && element.closest(".registration-modal")) {
          warnings.push(`Low contrast warning: ${element.tagName.toLowerCase()} with contrast ratio ${contrast.toFixed(2)}.`);
        }
      }
    }
  });

  document.querySelectorAll("button, input, select, textarea").forEach((element) => {
    if (element.tagName === "BUTTON" && !element.textContent.trim() && !element.getAttribute("aria-label")) {
      warnings.push(`Button missing accessible name: ${element.outerHTML.slice(0, 80)}...`);
    }
    if ((element.tagName === "INPUT" || element.tagName === "SELECT" || element.tagName === "TEXTAREA") && !element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby") && (!element.closest("label") || !element.closest("label").textContent.trim())) {
      warnings.push(`Form control missing visible label: ${element.name || element.id || "unnamed input"}.`);
    }
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      const style = window.getComputedStyle(element);
      if (Number.parseFloat(style.opacity) < 0.7) {
        warnings.push(`Low opacity warning on ${element.tagName.toLowerCase()}: ${element.name || element.id || "unnamed input"}.`);
      }
    }
  });

  if (document.querySelector("[role='dialog']") && !document.querySelector("[role='dialog'] h2, [role='dialog'] h1, [role='dialog'] h3")) {
    warnings.push("Dialog is missing a visible title.");
  }

  if (window.location.search.includes("audit=1") || window.location.hostname === "localhost") {
    console.group("SmartCare accessibility audit");
    if (!warnings.length) {
      console.info("No serious accessibility warnings found in the current run.");
    } else {
      warnings.forEach((warning) => console.warn(warning));
    }
    console.groupEnd();
  }

  return warnings;
}

if (window.location.search.includes("audit=1") || window.location.hostname === "localhost") {
  window.addEventListener("load", () => {
    runAccessibilityAudit();
  });
}

function openModal() {
  if (!loginModal) return;

  loginModal.classList.add("visible");
  loginModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLoginModal() {
  if (!loginModal) return;

  loginModal.classList.remove("visible");
  loginModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showPortalDashboard() {
  if (portalDashboard) {
    portalDashboard.classList.add("visible");
    const requestedRoute = getAppRoute();
    navigateAppRoute(APP_ROUTE_TO_PANEL[requestedRoute] ? requestedRoute : "dashboard");
  }
}

function getAppRoute() {
  return window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "") || "";
}

function navigateAppRoute(route) {
  const normalized = String(route || "dashboard").replace(/^\/?/, "");
  if (window.location.hash !== `#/${normalized}`) {
    window.location.hash = `/${normalized}`;
    return;
  }
  renderAppRoute();
}

function renderAppRoute() {
  const route = getAppRoute();
  const panelId = APP_ROUTE_TO_PANEL[route];
  const isAppRoute = Boolean(panelId);
  document.body.classList.toggle("app-route-active", isAppRoute);
  if (!isAppRoute) {
    document.title = "SmartCare Camp";
    return;
  }

  if (!getCurrentUser()) {
    document.body.classList.remove("app-route-active");
    openModal();
    return;
  }

  const allowed = ROLE_PERMISSIONS[getCurrentUser()?.role] || [];
  if (!allowed.includes(panelId)) {
    showToast("This role does not have access to that workspace.", "error");
    navigateAppRoute("dashboard");
    return;
  }

  portalDashboard?.classList.add("visible");
  const [breadcrumb, pageTitle] = APP_ROUTE_META[route] || ["Dashboard", "Operations overview"];
  const breadcrumbNode = document.getElementById("portalBreadcrumb");
  const titleNode = document.getElementById("portalPageTitle");
  if (breadcrumbNode) breadcrumbNode.textContent = `SmartCare Camp / ${breadcrumb}`;
  if (titleNode) titleNode.textContent = pageTitle;
  document.title = `SmartCare Camp · ${breadcrumb}`;
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === panelId);
  });
  document.querySelectorAll(".portal-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });
  window.scrollTo({ top: 0, behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth" });
  window.requestAnimationFrame(() => titleNode?.focus({ preventScroll: true }));
}

let presentationIndex = 0;

function renderPresentation() {
  const [title, body, note] = PRESENTATION_SLIDES[presentationIndex];
  const titleNode = document.getElementById("presentationTitle");
  const bodyNode = document.getElementById("presentationBody");
  const noteNode = document.getElementById("presentationNote");
  const progress = document.getElementById("presentationProgress");
  const progressBar = document.getElementById("presentationProgressBar");
  const previous = document.getElementById("presentationPreviousButton");
  const next = document.getElementById("presentationNextButton");
  if (titleNode) titleNode.textContent = title;
  if (bodyNode) bodyNode.textContent = body;
  if (noteNode) noteNode.textContent = note;
  if (progress) progress.textContent = `${presentationIndex + 1} of ${PRESENTATION_SLIDES.length}`;
  if (progressBar) progressBar.style.width = `${((presentationIndex + 1) / PRESENTATION_SLIDES.length) * 100}%`;
  if (previous) previous.disabled = presentationIndex === 0;
  if (next) next.textContent = presentationIndex === PRESENTATION_SLIDES.length - 1 ? "Finish" : "Next";
}

function bindPresentationMode() {
  document.getElementById("presentationModeButton")?.addEventListener("click", () => navigateAppRoute("presentation"));
  document.getElementById("presentationPreviousButton")?.addEventListener("click", () => {
    presentationIndex = Math.max(0, presentationIndex - 1);
    renderPresentation();
  });
  document.getElementById("presentationNextButton")?.addEventListener("click", () => {
    if (presentationIndex === PRESENTATION_SLIDES.length - 1) {
      showToast("Presentation complete. Thank you.", "success");
      return;
    }
    presentationIndex += 1;
    renderPresentation();
  });
  document.getElementById("presentationResetButton")?.addEventListener("click", () => {
    presentationIndex = 0;
    renderPresentation();
    showToast("Presentation reset.", "success");
  });
  document.getElementById("presentationExitButton")?.addEventListener("click", () => navigateAppRoute("dashboard"));
  document.getElementById("presentationFullscreenButton")?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await portalDashboard?.requestFullscreen?.();
      else await document.exitFullscreen();
    } catch (error) {
      showToast("Full screen is unavailable in this browser.", "info");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (getAppRoute() !== "presentation") return;
    if (event.key === "ArrowRight") document.getElementById("presentationNextButton")?.click();
    if (event.key === "ArrowLeft") document.getElementById("presentationPreviousButton")?.click();
  });
  renderPresentation();
}

function setScannerState(type, message) {
  if (!scannerStatus) return;
  scannerStatus.className = `scanner-status ${type}`;
  scannerStatus.textContent = message;
}

function renderRecentPatients() {
  if (!recentPatientsList) return;

  if (!getCurrentUser()) {
    recentPatientsList.innerHTML = "<div class='empty-state'>Log in to view patient records.</div>";
    return;
  }

  recentPatientsList.innerHTML = patientDatabase
    .slice()
    .reverse()
    .map(
      (patient) => `
        <article class="patient-row">
          <div>
            <strong>${patient.name}</strong>
            <span>${patient.patientId}</span>
          </div>
          <div class="patient-meta">
            <span>${patient.age} yrs</span>
            <span>${patient.gender}</span>
          </div>
          <div class="patient-actions">
            <button class="button button-ghost small-button" type="button" data-action="view-pass" data-id="${patient.patientId}">View QR Pass</button>
            <button class="button button-primary small-button" type="button" data-action="print-pass" data-id="${patient.patientId}">Download/Print</button>
          </div>
        </article>
      `
    )
    .join("");

  recentPatientsList.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const patientId = button.dataset.id;
      const patient = patientDatabase.find((entry) => entry.patientId === patientId);

      if (!patient) return;

      if (button.dataset.action === "view-pass") {
        openQrPass(patient);
      }

      if (button.dataset.action === "print-pass") {
        openQrPass(patient, true);
      }
    });
  });
}

function openQrPass(patient, autoPrint = false) {
  if (!qrPassModal || !patient) return;

  const passContent = document.getElementById("qrPassContent");
  const qrPassName = document.getElementById("qrPassName");

  qrPassName.textContent = patient.name;
  passContent.innerHTML = `
    <div class="qr-pass-grid">
      <div class="qr-pass-details">
        <div class="pass-row"><span>Patient name</span><strong>${patient.name}</strong></div>
        <div class="pass-row"><span>Patient ID</span><strong>${patient.patientId}</strong></div>
        <div class="pass-row"><span>Age</span><strong>${patient.age}</strong></div>
        <div class="pass-row"><span>Gender</span><strong>${patient.gender}</strong></div>
        <div class="pass-row"><span>Camp name</span><strong>${patient.campName}</strong></div>
        <div class="pass-row"><span>Registration date</span><strong>${formatDate(patient.registrationDate)}</strong></div>
      </div>
      <div class="qr-code-wrap">
        <img src="${patient.qrCodeUrl}" alt="QR code for ${patient.name}" />
      </div>
    </div>
    <div class="pass-actions">
      <button type="button" class="button button-primary" id="printQrPassButton">Print QR pass</button>
    </div>
  `;

  qrPassModal.classList.add("visible");
  qrPassModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const printButton = document.getElementById("printQrPassButton");
  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  if (autoPrint) {
    window.print();
  }
}

function closeQrPass() {
  if (!qrPassModal) return;

  qrPassModal.classList.remove("visible");
  qrPassModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function getPatientByIdentifier(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;

  const directMatch = patientDatabase.find((patient) => patient.patientId === normalized || patient.qrPayload === normalized);
  if (directMatch) return directMatch;

  const patientIdMatch = normalized.match(/SC-[A-Z0-9-]+/i);
  if (patientIdMatch) {
    const patientId = patientIdMatch[0];
    return patientDatabase.find((patient) => patient.patientId === patientId);
  }

  return null;
}

function parseQrPayload(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return null;

  const urlMatch = value.match(/smartcare:\/\/patient\/([^\s]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  const patientIdMatch = value.match(/SC-[A-Z0-9-]+/i);
  if (patientIdMatch) {
    return patientIdMatch[0];
  }

  return null;
}

function renderPatientHistory(patient) {
  const historySections = [
    { key: "screening", label: "Screening" },
    { key: "consultation", label: "Consultation" },
    { key: "medicine", label: "Medicine" },
    { key: "referral", label: "Referral" },
    { key: "followup", label: "Follow-up" }
  ];

  const listHtml = historySections
    .map(({ key, label }) => {
      const items = patient.history[key] || [];
      const content = items.length
        ? items
            .map(
              (item) => `
                <li>
                  <span>${formatDate(item.date || item.timestamp || patient.registrationDate)}</span>
                  <strong>${item.note || label}</strong>
                </li>
              `
            )
            .join("")
        : `<li class="empty-history">No ${label.toLowerCase()} records yet.</li>`;

      return `
        <div class="history-group">
          <h4>${label}</h4>
          <ul>${content}</ul>
        </div>
      `;
    })
    .join("");

  return `
    <div class="profile-summary">
      <div>
        <p class="profile-label">Patient</p>
        <h3>${patient.name}</h3>
      </div>
      <span class="status-badge success">${patient.patientId}</span>
    </div>

    <div class="profile-stats">
      <div><span>Age</span><strong>${patient.age}</strong></div>
      <div><span>Gender</span><strong>${patient.gender}</strong></div>
      <div><span>Camp</span><strong>${patient.campName}</strong></div>
      <div><span>Registered</span><strong>${formatDate(patient.registrationDate)}</strong></div>
    </div>

    <div class="quick-actions">
      <button class="button button-primary small-button" type="button" data-quick-action="screening" data-id="${patient.patientId}">Start Screening</button>
      <button class="button button-primary small-button" type="button" data-quick-action="consultation" data-id="${patient.patientId}">Consultation</button>
      <button class="button button-primary small-button" type="button" data-quick-action="medicine" data-id="${patient.patientId}">Prescription</button>
      <button class="button button-primary small-button" type="button" data-quick-action="referral" data-id="${patient.patientId}">Referral</button>
      <button class="button button-primary small-button" type="button" data-quick-action="followup" data-id="${patient.patientId}">Follow-up</button>
    </div>

    <div class="history-list">${listHtml}</div>
  `;
}

function addHistoryEntry(patientId, key, note) {
  const patient = patientDatabase.find((entry) => entry.patientId === patientId);
  if (!patient) return;

  patient.history[key].push({
    date: new Date().toISOString(),
    note
  });

  persistPatients();
  renderRecentPatients();

  const foundPatient = getPatientByIdentifier(patientId);
  if (foundPatient && patientProfileContent && patientProfileContent.dataset.patientId === patientId) {
    renderPatientContent(foundPatient);
  }
}

function renderPatientContent(patient) {
  if (!patientProfileContent) return;

  patientProfileContent.dataset.patientId = patient.patientId;
  patientProfileContent.innerHTML = renderPatientHistory(patient);

  patientProfileContent.querySelectorAll("button[data-quick-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const actionMap = {
        screening: "Screening started for this patient.",
        consultation: "Consultation completed and documented.",
        medicine: "Prescription issued and medicine record added.",
        referral: "Referral created and assigned to the appropriate care team.",
        followup: "Follow-up scheduled for the next care review."
      };

      const keyMap = {
        screening: "screening",
        consultation: "consultation",
        medicine: "medicine",
        referral: "referral",
        followup: "followup"
      };

      const actionKey = button.dataset.quickAction;
      addHistoryEntry(button.dataset.id, keyMap[actionKey], actionMap[actionKey]);
      setScannerState("success", `${actionMap[actionKey]} Patient updated successfully.`);
    });
  });
}

function handleScanResult(rawValue) {
  const payload = parseQrPayload(rawValue);
  if (!payload) {
    setScannerState("invalid", "Invalid QR code. Please scan a valid SmartCare patient QR pass.");
    patientProfileContent.innerHTML = "<div class='empty-state'>Invalid QR code. Try again.</div>";
    return;
  }

  setScannerState("loading", "Verifying patient record...");

  window.setTimeout(() => {
    const patient = getPatientByIdentifier(payload);

    if (!patient) {
      setScannerState("not-found", "Patient not found. This QR code does not match an active record.");
      patientProfileContent.innerHTML = "<div class='empty-state'>Patient not found.</div>";
      return;
    }

    setScannerState("success", `Patient found: ${patient.name} (${patient.patientId})`);
    renderPatientContent(patient);
  }, 500);
}

function handleQrFileUpload(file) {
  if (!file) return;

  setScannerState("loading", "Reading QR code from image...");

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      if (typeof jsQR === "undefined") {
        setScannerState("invalid", "QR image reader is unavailable in this browser.");
        return;
      }

      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
      if (!qrCode) {
        setScannerState("invalid", "The uploaded image does not contain a readable QR code.");
        patientProfileContent.innerHTML = "<div class='empty-state'>Invalid QR image.</div>";
        return;
      }

      handleScanResult(qrCode.data);
      scannerInput.value = qrCode.data;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function bindPortalTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const route = Object.entries(APP_ROUTE_TO_PANEL).find(([, panelId]) => panelId === button.dataset.tab)?.[0] || "dashboard";
      navigateAppRoute(route);
    });
  });
  window.addEventListener("hashchange", renderAppRoute);
  renderAppRoute();
}

function resetDemoRecords() {
  patientDatabase = [];
  persistPatients();
  localStorage.removeItem("smartcareDemoMedicines");
  localStorage.removeItem(CAMP_REGISTRATION_COUNTER);
  refreshCurrentPatientData();
  showToast("Local fictional records were reset.", "success");
}

function bindOperations() {
  document.getElementById("continueWorkflowButton")?.addEventListener("click", () => {
    const workflowTab = document.querySelector('[data-tab="workflow-panel"]');
    if (workflowTab) workflowTab.click();
    showToast("Continuing the demo workflow.", "success");
  });

  document.getElementById("resumeLastActivityButton")?.addEventListener("click", () => {
    renderWorkflow();
    const workflowTab = document.querySelector('[data-tab="workflow-panel"]');
    if (workflowTab) workflowTab.click();
    showToast("Resuming the last workflow state.", "success");
  });

  document.getElementById("queueSearchInput")?.addEventListener("input", renderQueue);
  document.getElementById("callNextButton")?.addEventListener("click", () => {
    const next = patientDatabase.find((patient) => !patient.queueStatus || patient.queueStatus === "Waiting");
    if (!next) {
      showToast("There are no waiting patients.", "info");
      return;
    }
    next.queueStatus = "Screening";
    persistPatients();
    renderOperationsPanels();
    showToast(`Now calling ${next.name}.`, "success");
  });
  document.getElementById("addMedicineButton")?.addEventListener("click", () => {
    const nameInput = document.getElementById("medicineNameInput");
    const quantityInput = document.getElementById("medicineQuantityInput");
    const name = nameInput.value.trim();
    const quantity = Number(quantityInput.value);
    if (!name || !Number.isFinite(quantity) || quantity <= 0) {
      showToast("Enter a medicine name and a positive quantity.", "error");
      return;
    }
    const medicines = getDemoMedicines();
    medicines.push({ id: `med-${Date.now()}`, name, quantity, minimum: 10 });
    saveDemoMedicines(medicines);
    nameInput.value = "";
    quantityInput.value = "";
    renderOperationsPanels();
    showToast(`${name} was added to inventory.`, "success");
  });
  document.getElementById("resetDemoDataButton")?.addEventListener("click", resetDemoRecords);
  document.getElementById("resetAllDataButton")?.addEventListener("click", () => {
    if (window.confirm("Reset all fictional patient and medicine data in this browser?")) resetDemoRecords();
  });
  document.getElementById("exportDataButton")?.addEventListener("click", () => downloadJson("smartcare-demo-data.json", { patients: patientDatabase, medicines: getDemoMedicines() }));
  document.getElementById("exportReportButton")?.addEventListener("click", () => {
    const rows = [["Patient count", patientDatabase.length], ["Screenings", patientDatabase.filter((patient) => (patient.history?.screening || []).length).length], ["Consultations", patientDatabase.filter((patient) => (patient.history?.consultation || []).length).length], ["Referrals", patientDatabase.filter((patient) => (patient.history?.referral || []).length).length]];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartcare-aggregate-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById("reduceMotionToggle")?.addEventListener("change", (event) => {
    document.body.classList.toggle("reduce-motion", event.target.checked);
    localStorage.setItem("smartcareReduceMotion", event.target.checked ? "true" : "false");
  });
  const reduceMotionToggle = document.getElementById("reduceMotionToggle");
  if (reduceMotionToggle) {
    reduceMotionToggle.checked = localStorage.getItem("smartcareReduceMotion") === "true";
    document.body.classList.toggle("reduce-motion", reduceMotionToggle.checked);
  }
  [
    ["highContrastToggle", "smartcareHighContrast", "high-contrast"],
    ["largeTextToggle", "smartcareLargeText", "large-text"]
  ].forEach(([id, storageKey, className]) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    toggle.checked = localStorage.getItem(storageKey) === "true";
    document.body.classList.toggle(className, toggle.checked);
    toggle.addEventListener("change", (event) => {
      document.body.classList.toggle(className, event.target.checked);
      localStorage.setItem(storageKey, event.target.checked ? "true" : "false");
    });
  });
}

function updateConnectionStatus() {
  if (!connectionStatus) return;
  const online = navigator.onLine;
  connectionStatus.className = `connection-status ${online ? "online" : "offline"}`;
  connectionStatus.innerHTML = `<i></i> ${online ? "Online" : "Offline Demo Mode"}`;
  if (syncStatus && !online) syncStatus.textContent = `${Number(localStorage.getItem(PENDING_SYNC_KEY) || 0)} local demo changes waiting`;
}

function syncDemoData() {
  if (!syncStatus || !navigator.onLine) {
    showToast("Offline Demo Mode: changes remain saved locally.", "info");
    return;
  }
  syncStatus.textContent = "Syncing demo data...";
  if (syncNowButton) syncNowButton.disabled = true;
  window.setTimeout(() => {
    localStorage.setItem(PENDING_SYNC_KEY, "0");
    syncStatus.textContent = "Demo data synchronized";
    if (syncNowButton) syncNowButton.disabled = false;
    showToast("Fictional demo data synchronized locally.", "success");
  }, 700);
}

function initAppShell() {
  if (!appStorage.isPersistent() && syncStatus) {
    syncStatus.textContent = "Temporary demo storage: changes last until this tab closes";
  }
  updateConnectionStatus();
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
  syncNowButton?.addEventListener("click", syncDemoData);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installAppButton) installAppButton.hidden = false;
  });
  installAppButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast("Install is available when the app is served from localhost or HTTPS.", "info");
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    if (installAppButton) installAppButton.hidden = true;
    showToast("SmartCare Camp was added to your device.", "success");
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").then(() => {
      if (syncStatus) syncStatus.textContent = "Offline app shell ready";
    }).catch(() => {
      if (syncStatus) syncStatus.textContent = "Browser mode: offline shell unavailable";
    });
  }
}

function showAppError(message) {
  const panel = document.getElementById("appErrorPanel");
  const messageNode = document.getElementById("appErrorMessage");
  if (!panel) return;
  if (messageNode) messageNode.textContent = message || "The local demo encountered an unexpected problem. Please reload the workspace.";
  panel.hidden = false;
}

window.addEventListener("error", (event) => {
  if (event.target && event.target !== window) return;
  console.error("SmartCare runtime error:", event.error || event.message);
  showAppError("The local demo encountered an unexpected problem. Please reload the workspace.");
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("SmartCare promise error:", event.reason);
  showAppError("A local operation could not finish. Please reload the workspace and try again.");
});

function reloadWorkspace() {
  const cleanUrl = `${window.location.pathname}?reload=${Date.now()}`;
  window.location.assign(cleanUrl);
}

document.getElementById("appErrorRetry")?.addEventListener("click", reloadWorkspace);

function initStartupScreen() {
  if (!appStartup) return;
  const seen = localStorage.getItem("smartcareStartupSeen") === "true";
  if (seen) return;
  appStartup.classList.add("visible");
  window.setTimeout(() => {
    appStartup.classList.remove("visible");
    appStartup.setAttribute("aria-hidden", "true");
    localStorage.setItem("smartcareStartupSeen", "true");
  }, 850);
}

function resolveTheme(preference) {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return preference === "dark" ? "dark" : "light";
}

function applyTheme(preference = "light", notify = false) {
  const normalized = ["light", "dark", "system"].includes(preference) ? preference : "light";
  const resolved = resolveTheme(normalized);
  document.documentElement.dataset.themePreference = normalized;
  document.documentElement.dataset.theme = resolved;
  document.body.dataset.themePreference = normalized;
  document.body.dataset.theme = resolved;
  localStorage.setItem("smartcareTheme", normalized);
  const label = normalized === "light" ? "☀️ Theme: Light" : normalized === "dark" ? "🌙 Theme: Dark" : "🖥 Theme: System";
  if (themeToggle) themeToggle.textContent = label;
  if (mobileThemeToggle) mobileThemeToggle.textContent = label;
  if (themePreferenceSelect) themePreferenceSelect.value = normalized;
  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.content = resolved === "dark" ? "#0b1520" : "#123b63";
  if (notify) showToast(`${normalized === "light" ? "Light" : normalized === "dark" ? "Dark" : "System"} mode enabled.`, "success");
}

function cycleTheme() {
  const current = localStorage.getItem("smartcareTheme") || "light";
  const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
  applyTheme(next, true);
}

function setLanguage(lang) {
  const translations = {
    en: {
      eyebrowTag: "Community health operations",
      heroTitle: "Run every health camp handoff with confidence.",
      heroDescription: "SmartCare Camp gives community health teams one clear website for planning camps, coordinating patient flow, recording care, managing medicines, and closing follow-ups.",
      typewriterPrefix: "Building",
      capabilitiesLabel: "Capabilities",
      capabilitiesTitle: "A website for the whole camp operation.",
      capabilitiesText: "Keep planning, patient flow, care coordination, medicines, and reporting connected in one calm workspace.",
      showcaseLabel: "Smart features",
      showcaseHeading: "Modern tools for every health campaign."
    },
    kn: {
      eyebrowTag: "ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಯಾಚರಣೆಗಳು",
      heroTitle: "ಪ್ರತಿ ಆರೋಗ್ಯ ಶಿಬಿರದ ಹಸ್ತಾಂತರವನ್ನು ವಿಶ್ವಾಸದಿಂದ ನಡೆಸಿ.",
      heroDescription: "SmartCare Camp ಶಿಬಿರ ಯೋಜನೆ, ರೋಗಿಗಳ ಹರಿವು, ಆರೈಕೆ ದಾಖಲಾತಿ, ಔಷಧ ನಿರ್ವಹಣೆ ಮತ್ತು ಮುಂದಿನ ಆರೈಕೆಯನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಸಂಯೋಜಿಸುತ್ತದೆ.",
      typewriterPrefix: "ನಿರ್ಮಿಸುತ್ತಿದೆ",
      capabilitiesLabel: "ಸೌಲಭ್ಯಗಳು",
      capabilitiesTitle: "ಸಂಪೂರ್ಣ ಶಿಬಿರ ಕಾರ್ಯಾಚರಣೆಗೆ ಒಂದು ವೆಬ್‌ಸೈಟ್.",
      capabilitiesText: "ಯೋಜನೆ, ರೋಗಿಗಳ ಹರಿವು, ಆರೈಕೆ, ಔಷಧಿ ಮತ್ತು ವರದಿಗಳನ್ನು ಒಂದೇ ಸರಳ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ.",
      showcaseLabel: "ಸ್ಮಾರ್ಟ್ ವೈಶಿಷ್ಟ್ಯಗಳು",
      showcaseHeading: "ಪ್ರತಿ ಆರೋಗ್ಯ ಕ್ಯಾಂಪೈನ್‌ಗಾಗಿ ನವೀನ ಉಪಕರಣಗಳು."
    },
    hi: {
      eyebrowTag: "सामुदायिक स्वास्थ्य संचालन",
      heroTitle: "हर स्वास्थ्य शिविर के हस्तांतरण को आत्मविश्वास से चलाएँ।",
      heroDescription: "SmartCare Camp शिविर योजना, मरीजों का प्रवाह, देखभाल रिकॉर्ड, दवा प्रबंधन और फॉलो-अप को एक वेबसाइट में जोड़ता है।",
      typewriterPrefix: "निर्माण",
      capabilitiesLabel: "क्षमताएँ",
      capabilitiesTitle: "पूरे शिविर संचालन के लिए एक वेबसाइट।",
      capabilitiesText: "योजना, मरीज प्रवाह, देखभाल, दवाओं और रिपोर्ट को एक सरल कार्यक्षेत्र में जोड़ें।",
      showcaseLabel: "स्मार्ट सुविधाएँ",
      showcaseHeading: "हर स्वास्थ्य शिविर के लिए आधुनिक उपकरण।"
    }
  };

  const dictionary = translations[lang] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) {
      node.textContent = dictionary[key];
    }
  });
  localStorage.setItem("smartcareLanguage", lang);
  if (languageToggle) {
    languageToggle.textContent = lang === "en" ? "Kannada" : lang === "kn" ? "हिंदी" : "English";
  }
}

function updateReadingProgress() {
  if (!readingProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  readingProgress.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;

  if (backToTopButton) {
    backToTopButton.classList.toggle("visible", scrollTop > 300);
  }
}

function initTypewriter() {
  if (!typewriterText) return;

  const phrases = ["care coordination", "patient visibility", "faster referrals", "community health impact"];
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  function tick() {
    const activePhrase = phrases[phraseIndex];
    if (!deleting) {
      characterIndex += 1;
    } else {
      characterIndex -= 1;
    }

    typewriterText.textContent = activePhrase.slice(0, characterIndex);

    if (!deleting && characterIndex === activePhrase.length) {
      deleting = true;
      setTimeout(tick, 1200);
      return;
    }

    if (deleting && characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    setTimeout(tick, deleting ? 45 : 90);
  }

  tick();
}

function initSearchFilter() {
  if (!searchInput) return;

  const cards = document.querySelectorAll(".showcase-card");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    cards.forEach((card) => {
      const matches = card.textContent.toLowerCase().includes(query);
      card.style.display = matches ? "block" : "none";
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tag").forEach((tag) => tag.classList.toggle("active", tag === button));
      const filter = button.dataset.filter;
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.style.display = match ? "block" : "none";
      });
    });
  });
}

function initCarousel() {
  const slides = carouselTrack ? Array.from(carouselTrack.children) : [];
  const dots = document.querySelectorAll(".dot");
  let index = 0;

  if (!slides.length) return;

  function updateCarousel() {
    const offset = index * -100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  }

  document.querySelector(".carousel-btn.prev")?.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  document.querySelector(".carousel-btn.next")?.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateCarousel();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      index = dotIndex;
      updateCarousel();
    });
  });

}

function initLightbox() {
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const fullImage = item.dataset.fullImage;
      if (!fullImage || !lightbox || !lightboxImage) return;
      lightboxImage.src = fullImage;
      lightbox.classList.add("visible");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        lightbox.classList.remove("visible");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    });
  }

  document.querySelector(".lightbox-close")?.addEventListener("click", () => {
    lightbox.classList.remove("visible");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  });
}

function initCounters() {
  const counters = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 50));

      const counterInterval = setInterval(() => {
        current += step;
        element.textContent = `${current}${target >= 100 ? "+" : ""}`;

        if (current >= target) {
          element.textContent = `${target}+`;
          clearInterval(counterInterval);
        }
      }, 25);

      observer.unobserve(element);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}

function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach((item) => observer.observe(item));
}

function initFaq() {
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const isOpen = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach((faq) => faq.classList.remove("active"));
      if (!isOpen) {
        item.classList.add("active");
      }
    });
  });
}

function validateContactForm(event) {
  event.preventDefault();

  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    showToast("Please complete all fields before submitting.", "error");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  showToast("Your message was sent successfully.", "success");
  event.target.reset();
}

function loadQuote() {
  if (!quoteText) return;
  const localQuotes = [
    ["Healthcare is a shared responsibility that grows through compassion and coordination.", "SmartCare Team"],
    ["Small, organized handoffs help communities receive kinder care.", "SmartCare Team"],
    ["Good records give every care team member a clearer next step.", "SmartCare Team"]
  ];
  const [quote, author] = localQuotes[new Date().getDate() % localQuotes.length];
  quoteText.textContent = `“${quote}”`;
  quoteAuthor.textContent = `— ${author}`;
}

function initCookieConsent() {
  if (!cookieBanner) return;

  const consentState = localStorage.getItem("smartcareCookieConsent");
  if (consentState === "accepted" || consentState === "declined") {
    cookieBanner.classList.add("hidden");
    return;
  }

  document.querySelectorAll("[data-cookie]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.cookie;
      localStorage.setItem("smartcareCookieConsent", choice);
      cookieBanner.classList.add("hidden");
      showToast(choice === "accept" ? "Cookies accepted." : "Cookies declined.", "success");
    });
  });
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("visible");
  });
}

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileMenu) {
      mobileMenu.classList.remove("visible");
    }
  });
});

if (portalButton) {
  portalButton.addEventListener("click", () => {
    if (!getCurrentUser()) {
      openModal();
      showToast("Please log in or create an account to access the portal.", "error");
      return;
    }
    closeLoginModal();
    showPortalDashboard();
  });
}

if (closeModal) {
  closeModal.addEventListener("click", closeLoginModal);
}

if (loginModal) {
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });
}

if (closeQrPassButton) {
  closeQrPassButton.addEventListener("click", closeQrPass);
}

if (qrPassModal) {
  qrPassModal.addEventListener("click", (event) => {
    if (event.target === qrPassModal) {
      closeQrPass();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  if (event.key === "Escape") {
    closeLoginModal();
    closeQrPass();
    if (campRegistrationModal && campRegistrationModal.classList.contains("visible")) {
      closeCampRegistration();
    }
    if (campPosterModal && campPosterModal.classList.contains("visible")) {
      closePosterModal();
    }
    if (lightbox) {
      lightbox.classList.remove("visible");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    closeCommandPalette();
  }
});

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = loginForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Verifying...";
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Continue to portal"; }
      showToast("Enter both email and password.", "error");
      return;
    }

    const accounts = getAccounts();
    const account = accounts.find((entry) => entry.email === email && entry.password === password);

    if (!account) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Continue to portal"; }
      showToast("Invalid email or password.", "error");
      return;
    }

    setCurrentUser(account);
    closeLoginModal();
    refreshCurrentPatientData();
    showPortalDashboard();
    showToast(`Welcome back, ${account.name}.`, "success");
    loginForm.reset();
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Continue to portal"; }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = signupForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";
    }

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

    if (!name || !email || !password || !confirmPassword) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
      showToast("Complete all account fields.", "error");
      return;
    }

    if (password.length < 6) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
      showToast("Passwords do not match.", "error");
      return;
    }

    const accounts = getAccounts();
    const alreadyExists = accounts.some((entry) => entry.email === email);
    if (alreadyExists) {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
      showToast("An account with this email already exists.", "error");
      return;
    }

    const newAccount = {
      id: `acct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      password,
      role: "Camp Organizer",
      createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    saveAccounts(accounts);
    setCurrentUser(newAccount);
    closeLoginModal();
    refreshCurrentPatientData();
    showPortalDashboard();
    signupForm.reset();
    showToast(`Account created for ${newAccount.name}.`, "success");
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
  });
}

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordTarget);
    if (!input) return;
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    button.textContent = isVisible ? "Show" : "Hide";
    button.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
  });
});

function showAuthForm(formId) {
  document.querySelectorAll(".auth-switch").forEach((button) => button.classList.remove("active"));
  document.querySelectorAll(".auth-form").forEach((form) => form.classList.toggle("active", form.id === formId));
}

if (forgotPasswordButton) {
  forgotPasswordButton.addEventListener("click", () => showAuthForm("forgotPasswordForm"));
}

if (backToLoginButton) {
  backToLoginButton.addEventListener("click", () => showAuthForm("loginForm"));
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const accountExists = getAccounts().some((account) => account.email === email);
    if (!accountExists) {
      showToast("No demo account was found for that email.", "error");
      return;
    }
    showToast("Demo reset complete. Use the provided local demo password.", "success");
    forgotPasswordForm.reset();
    showAuthForm("loginForm");
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    setCurrentUser(null);
    window.location.hash = "";
    document.body.classList.remove("app-route-active");
    closeLoginModal();
    openModal();
    patientProfileContent.innerHTML = "<div class='empty-state'>Logged out. Sign in to continue.</div>";
    showToast("You have been logged out.", "success");
  });
}

if (posterDoNotShowAgain) {
  posterDoNotShowAgain.addEventListener("change", () => {
    if (posterDoNotShowAgain.checked) {
      localStorage.setItem(POSTER_DONT_SHOW_TODAY_KEY, getTodayKey());
    } else {
      localStorage.removeItem(POSTER_DONT_SHOW_TODAY_KEY);
    }
  });
}

if (posterCloseButton) {
  posterCloseButton.addEventListener("click", closePosterModal);
}

if (registrationCloseButton) {
  registrationCloseButton.addEventListener("click", closeCampRegistration);
}

if (campPosterModal) {
  campPosterModal.addEventListener("click", (event) => {
    if (event.target === campPosterModal) {
      closePosterModal();
    }
  });
}

if (campRegistrationModal) {
  campRegistrationModal.addEventListener("click", (event) => {
    if (event.target === campRegistrationModal) {
      closeCampRegistration();
    }
  });
}

if (printPosterButton) {
  printPosterButton.addEventListener("click", () => window.print());
}

document.querySelectorAll("[data-poster-open='true']").forEach((button) => {
  button.addEventListener("click", () => openPosterModal());
});

document.querySelectorAll("[data-camp-register='true']").forEach((button) => {
  button.addEventListener("click", () => openCampRegistration());
});

if (campRegistrationForm) {
  campRegistrationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("campFullName").value.trim();
    const age = Number(document.getElementById("campAge").value);
    const gender = document.getElementById("campGender").value;
    const phone = document.getElementById("campPhone").value.trim();
    const address = document.getElementById("campAddress").value.trim();
    const department = document.getElementById("campDepartment").value;
    const consent = document.getElementById("campConsent").checked;

    if (!name || !Number.isFinite(age) || age <= 0 || !gender || !phone || !address || !department || !consent) {
      if (campRegistrationStatus) {
        campRegistrationStatus.className = "camp-registration-status error";
        campRegistrationStatus.textContent = "Please complete all fields and confirm the demo consent checkbox.";
      }
      return;
    }

    const phonePattern = /^[+]?[-\d\s()]{8,}$/;
    if (!phonePattern.test(phone)) {
      if (campRegistrationStatus) {
        campRegistrationStatus.className = "camp-registration-status error";
        campRegistrationStatus.textContent = "Please enter a valid phone number.";
      }
      return;
    }

    const token = generateDemoQueueToken();
    renderCampRegistrationSuccess(token);
    campRegistrationForm.reset();
  });
}

if (patientRegistrationForm) {
  patientRegistrationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!getCurrentUser()) {
      showToast("Please log in to register a patient.", "error");
      openModal();
      return;
    }

    const formData = new FormData(patientRegistrationForm);
    const patient = createPatientRecord(
      {
        name: String(formData.get("name") || "").trim(),
        age: Number(formData.get("age") || 0),
        gender: String(formData.get("gender") || "").trim(),
        campName: String(formData.get("campName") || DEFAULT_CAMP_NAME).trim(),
        registrationDate: new Date().toISOString()
      },
      patientDatabase
    );

    if (!patient.name || !patient.age || !patient.gender) {
      return;
    }

    patientDatabase.push(patient);
    persistPatients();
    renderRecentPatients();
    patientRegistrationForm.reset();
    document.getElementById("campName").value = DEFAULT_CAMP_NAME;
    setScannerState("success", `New patient registered: ${patient.name} (${patient.patientId})`);
    renderPatientContent(patient);
    openQrPass(patient);
  });
}

if (scanQrButton) {
  scanQrButton.addEventListener("click", () => {
    handleScanResult(scannerInput.value);
  });
}

if (scannerInput) {
  scannerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleScanResult(scannerInput.value);
    }
  });
}

if (qrImageInput) {
  qrImageInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    handleQrFileUpload(file);
  });
}

if (themeToggle) themeToggle.addEventListener("click", cycleTheme);
if (mobileThemeToggle) mobileThemeToggle.addEventListener("click", cycleTheme);
if (themePreferenceSelect) {
  themePreferenceSelect.addEventListener("change", (event) => applyTheme(event.target.value, true));
}
document.querySelectorAll("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => applyTheme(button.dataset.themeChoice, true));
});
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
systemThemeQuery.addEventListener?.("change", () => {
  if ((localStorage.getItem("smartcareTheme") || "light") === "system") applyTheme("system");
});

if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    const current = localStorage.getItem("smartcareLanguage") || "en";
    const next = current === "en" ? "kn" : current === "kn" ? "hi" : "en";
    setLanguage(next);
  });
}

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", validateContactForm);
}

document.querySelectorAll(".auth-switch").forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.authView;
    document.querySelectorAll(".auth-switch").forEach((switchButton) => switchButton.classList.toggle("active", switchButton === button));
    document.querySelectorAll(".auth-form").forEach((form) => form.classList.toggle("active", form.id === `${view}Form`));
  });
});

window.addEventListener("scroll", updateReadingProgress);
window.addEventListener("load", () => {
  updateReadingProgress();
  loadQuote();
  const savedTheme = localStorage.getItem("smartcareTheme") || "light";
  applyTheme(savedTheme);
  const savedLanguage = localStorage.getItem("smartcareLanguage") || "en";
  setLanguage(savedLanguage);
  initTypewriter();
  initSearchFilter();
  initCarousel();
  initLightbox();
  initCounters();
  revealOnScroll();
  initFaq();
  initCookieConsent();
  syncAuthState();

  setTimeout(() => {
    if (!getCurrentUser() && !APP_ROUTE_TO_PANEL[getAppRoute()] && shouldAutoShowPoster()) {
      openPosterModal({ rememberSession: true });
    }
  }, 800);
});

bindPortalTabs();
bindOperations();
bindWorkflow();
bindAiAssistant();
bindPresentationMode();
bindFloatingAiAssistant();
refreshCurrentPatientData();
setScannerState("idle", "Awaiting QR input.");
refreshYashAiProviderStatus();

syncAuthState();
initAppShell();
initStartupScreen();
