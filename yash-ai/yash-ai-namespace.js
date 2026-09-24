/* ==========================================================================
   Yash AI - Namespace, constants, and shared DOM utilities
   SmartCare Camp - Smart Community Health Camp Management System
   --------------------------------------------------------------------------
   Loaded before script.js. Defines window.YashAI only; it never touches
   application globals at parse time, so script order stays safe.
   ========================================================================== */
(function () {
  "use strict";

  const YASH = (window.YashAI = window.YashAI || {});

  /* ---------------------------------------------------------------- identity */

  YASH.APP = {
    name: "Yash AI",
    subtitle: "Your Smart Community Health Camp Assistant",
    version: "2.0.0",
    product: "SmartCare Camp"
  };

  YASH.WELCOME =
    "Hello, I\u2019m Yash AI. I can help summarize camp operations, create reports, " +
    "prepare posters, translate content, organize tasks, and explain this application. " +
    "I cannot diagnose, prescribe, or replace qualified healthcare professionals.";

  YASH.WARNING =
    "Yash AI provides administrative and educational assistance only. It does not " +
    "diagnose, prescribe, make treatment decisions, or provide emergency medical advice.";

  YASH.DEMO_LINE = "Responses are generated from fictional SmartCare Camp data.";

  YASH.EDUCATION_DISCLAIMER =
    "For general education only. Ask a qualified healthcare professional for personal advice.";

  YASH.TRANSLATION_DISCLAIMER =
    "Review this translation before using it for public communication.";

  YASH.MEMORY_LINE = "Yash AI remembers limited workflow context only.";

  YASH.VOICE_LINE = "Voice input is optional and depends on browser support.";

  /* ------------------------------------------------------------------ modes */

  YASH.MODES = { DEMO: "demo", REAL: "real", FALLBACK: "fallback" };

  YASH.MODE_LABEL = {
    demo: "Yash AI \u2013 Demo Mode",
    real: "Yash AI \u2013 Real AI (secure server proxy)",
    fallback: "Yash AI \u2013 Demo fallback (provider unavailable)"
  };

  /* ---------------------------------------------------------------- languages */

  YASH.LANGUAGES = [
    { code: "en", label: "English", native: "English" },
    { code: "kn", label: "Kannada", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1" },
    { code: "hi", label: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940" }
  ];

  YASH.isLanguage = function (code) {
    return YASH.LANGUAGES.some(function (item) {
      return item.code === code;
    });
  };

  /* -------------------------------------------------------------------- roles */

  YASH.ROLES = {
    ADMIN: "Administrator",
    ORGANIZER: "Camp Organizer",
    DOCTOR: "Doctor",
    NURSE: "Nurse",
    VOLUNTEER: "Volunteer",
    PHARMACIST: "Pharmacist",
    AUDITOR: "Auditor"
  };

  /* -------------------------------------------------------------- block types */

  YASH.BLOCK = {
    SUMMARY: "summary",
    KPI: "kpi",
    TABLE: "table",
    CHART: "chart",
    TIMELINE: "timeline",
    CHECKLIST: "checklist",
    WARNING: "warning",
    RECOMMENDATION: "recommendation",
    TASK: "task",
    REPORT: "report",
    POSTER: "poster",
    TRANSLATION: "translation",
    DATA_QUALITY: "dataQuality",
    NAVIGATION: "navigation",
    CONFIRMATION: "confirmation",
    SAFETY: "safety",
    PLAIN: "plain"
  };

  YASH.BLOCK_LABEL = {
    summary: "Summary card",
    kpi: "KPI card",
    table: "Table",
    chart: "Chart",
    timeline: "Timeline",
    checklist: "Checklist",
    warning: "Warning",
    recommendation: "Recommendation",
    task: "Task suggestion",
    report: "Report preview",
    poster: "Poster preview",
    translation: "Translation comparison",
    dataQuality: "Data-quality issue",
    navigation: "Navigation card",
    confirmation: "Confirmation card",
    safety: "Safety refusal",
    plain: "Text"
  };

  /* --------------------------------------------------------------- confidence */

  YASH.CONFIDENCE = {
    DESCRIPTIVE: "Descriptive demo summary",
    RULE_BASED: "Rule-based demo insight",
    DRAFT: "Draft requires review",
    NOT_MEDICAL: "Not medical advice",
    FICTIONAL: "Based on fictional data",
    TRANSLATION: "Machine-generated draft"
  };

  /* --------------------------------------------------------------- storage keys */

  YASH.KEY = {
    TASKS: "smartcareAiTasks",
    REPORTS: "smartcareAiReports",
    POSTERS: "smartcareAiPosters",
    TRANSLATIONS: "smartcareAiTranslations",
    REVIEWED_ISSUES: "smartcareAiReviewedIssues",
    FEEDBACK: "smartcareAiFeedback",
    AUDIT: "smartcareAiAuditLogs",
    MEMORY: "smartcareAiMemory",
    PREFS: "smartcareAiPreferences",
    CONFIRMATIONS: "smartcareAiConfirmations",
    POSTER_INPUTS: "smartcareAiPosterInputs",
    PLANNER_INPUTS: "smartcareAiPlannerInputs",
    BRIEFINGS: "smartcareAiBriefings"
  };

  /* ------------------------------------------------------------- route mapping */

  YASH.MODULE_ROUTES = {
    "yash-ai": "command-center",
    "yash-ai/camp-planner": "camp-planner",
    "yash-ai/report-generator": "report-generator",
    "yash-ai/poster-generator": "poster-generator",
    "yash-ai/translator": "translator",
    "yash-ai/data-quality": "data-quality",
    "yash-ai/staff-assistant": "staff-assistant",
    "yash-ai/follow-up-assistant": "follow-up-assistant",
    "yash-ai/education": "education",
    "yash-ai/safety": "safety"
  };

  YASH.MODULE_TITLES = {
    "command-center": "Command Center",
    "camp-planner": "Camp Planner",
    "report-generator": "Report Generator",
    "poster-generator": "Poster Generator",
    "translator": "Translator",
    "data-quality": "Data Quality",
    "staff-assistant": "Staff Assistant",
    "follow-up-assistant": "Follow-up Assistant",
    "education": "Education Assistant",
    "safety": "Safety Center"
  };

  YASH.MODULE_ICONS = {
    "command-center": "sparkle",
    "camp-planner": "clipboard",
    "report-generator": "report",
    "poster-generator": "image",
    translator: "translate",
    "data-quality": "shield",
    "staff-assistant": "users",
    "follow-up-assistant": "clock",
    education: "book",
    safety: "lock"
  };

  YASH.MODULE_ROUTE_OF = function (moduleId) {
    const found = Object.keys(YASH.MODULE_ROUTES).find(function (route) {
      return YASH.MODULE_ROUTES[route] === moduleId;
    });
    return found || "yash-ai";
  };

  YASH.MODULE_OF_ROUTE = function (route) {
    return YASH.MODULE_ROUTES[route] || null;
  };

  /* ------------------------------------------------------ safe storage wrapper */

  YASH.store = (function () {
    function readRaw(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    }

    function writeRaw(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (error) {
        return false;
      }
    }

    return {
      get: function (key, fallback) {
        const raw = readRaw(key);
        if (raw === null || raw === undefined) return fallback;
        try {
          return JSON.parse(raw);
        } catch (error) {
          return fallback;
        }
      },
      set: function (key, value) {
        return writeRaw(key, JSON.stringify(value));
      },
      remove: function (key) {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          /* Storage unavailable: nothing to remove. */
        }
      },
      push: function (key, entry, limit) {
        const list = YASH.store.get(key, []);
        const safeList = Array.isArray(list) ? list : [];
        safeList.push(entry);
        const capped = typeof limit === "number" ? safeList.slice(-limit) : safeList;
        YASH.store.set(key, capped);
        return capped;
      }
    };
  })();

  /* ------------------------------------------------------------------ helpers */

  YASH.uid = function (prefix) {
    return (
      (prefix || "id") +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  };

  YASH.nowIso = function () {
    return new Date().toISOString();
  };

  YASH.todayKey = function () {
    return new Date().toISOString().slice(0, 10);
  };

  YASH.formatClock = function (value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  YASH.formatDateTime = function (value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return (
      date.toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" }) +
      " \u00B7 " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  YASH.daysBetween = function (fromIso, toIso) {
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso || Date.now()).getTime();
    if (Number.isNaN(from) || Number.isNaN(to)) return 0;
    return Math.round((to - from) / 86400000);
  };

  YASH.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  YASH.plural = function (count, singular, plural) {
    return count === 1 ? singular : plural || singular + "s";
  };

  YASH.capitalizeFirst = function (text) {
    const safe = String(text || "");
    return safe ? safe.charAt(0).toUpperCase() + safe.slice(1) : safe;
  };

  /* ------------------------------------------------------------ DOM utilities */
  /* All dynamic strings are written with textContent; innerHTML is reserved for
     static, developer-authored markup only. */

  YASH.el = function (tag, options, children) {
    const node = document.createElement(tag);
    const settings = options || {};
    if (settings.className) node.className = settings.className;
    if (settings.text !== undefined && settings.text !== null) {
      node.textContent = String(settings.text);
    }
    if (settings.html !== undefined) {
      node.innerHTML = settings.html;
    }
    if (settings.attrs) {
      Object.keys(settings.attrs).forEach(function (name) {
        const value = settings.attrs[name];
        if (value === null || value === undefined || value === false) return;
        node.setAttribute(name, String(value));
      });
    }
    if (settings.dataset) {
      Object.keys(settings.dataset).forEach(function (name) {
        node.dataset[name] = String(settings.dataset[name]);
      });
    }
    if (settings.on) {
      Object.keys(settings.on).forEach(function (eventName) {
        node.addEventListener(eventName, settings.on[eventName]);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (child) {
        if (child === null || child === undefined || child === false) return;
        node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
      });
    }
    return node;
  };

  YASH.svgNode = (function () {
    const cache = {};

    const paths = {
      spark: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z",
      sparkle:
        "M12 4l1.4 4.1L17.5 9.5l-4.1 1.4L12 15l-1.4-4.1L6.5 9.5l4.1-1.4L12 4zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z",
      shield:
        "M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3zM9 12l2 2 4-4",
      pulse: "M3 12h4l2-5 3 10 2-5h7",
      users:
        "M8 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM14 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 20c0-2.6 1.6-4.8 4-5.6",
      clipboard: "M9 4h6v3H9zM7 7H5v13h14V7h-2M9 12h6M9 16h4",
      pill: "M8 16l8-8a3 3 0 114 4l-8 8a3 3 0 01-4-4zM11 7l6 6",
      chart: "M4 20V9M10 20V4M16 20v-7M3 20h18",
      check: "M4 12l5 5L20 6",
      warn: "M12 3l10 18H2L12 3zM12 9v5M12 17v.5",
      report: "M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7",
      image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3",
      translate:
        "M4 5h9M8 5c0 5-2 8-5 10M6 10c1 3 3 5 6 6M14 20l4-11 4 11M15.5 16h5",
      book: "M4 4h7v16H4zM13 4h7v16h-7z",
      task: "M4 6h16M4 12h16M4 18h10",
      clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l4 2",
      arrow: "M5 12h14M13 6l6 6-6 6",
      lock: "M6 11V8a6 6 0 1112 0v3M4 11h16v10H4z",
      mic: "M12 3a3 3 0 013 3v6a3 3 0 11-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3",
      copy: "M9 9h10v12H9zM5 15V3h10v2",
      print: "M7 8V3h10v5M7 18H4v-6h16v6h-3M7 14h10v7H7z",
      thumbsUp:
        "M7 21V10l4-7 1 .5a2 2 0 011 2.4L12 9h6a2 2 0 012 2.4l-1.4 7A2 2 0 0116.6 20H7z",
      thumbsDown:
        "M17 3v11l-4 7-1-.5a2 2 0 01-1-2.4L12 15H6a2 2 0 01-2-2.4l1.4-7A2 2 0 017.4 4H17z",
      flag: "M5 21V4h10l-1 3h6l-2 5 2 5H5",
      refresh: "M20 12a8 8 0 11-3-6.2M20 4v5h-5",
      stop: "M7 7h10v10H7z",
      download: "M12 3v12M7 10l5 5 5-5M4 21h16",
      save: "M5 4h11l3 3v13H5zM8 4v6h7V4M8 20v-6h8v6",
      home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
      info: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v6M12 8v.5",
      bell: "M6 17V11a6 6 0 1112 0v6l2 3H4l2-3zM10 20a2 2 0 004 0",
      send: "M4 12l16-8-6 16-2-6-8-2z"
    };

    return function (name, size) {
      const key = name + ":" + (size || 18);
      if (cache[key]) return cache[key].cloneNode(true);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", String(size || 18));
      svg.setAttribute("height", String(size || 18));
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", paths[name] || paths.spark);
      svg.appendChild(path);
      cache[key] = svg;
      return svg.cloneNode(true);
    };
  })();

  YASH.iconButton = function (iconName, label, onClick, extraClass) {
    const button = YASH.el("button", {
      className: "yash-icon-button " + (extraClass || ""),
      attrs: { type: "button", title: label, "aria-label": label },
      on: onClick ? { click: onClick } : null
    });
    button.appendChild(YASH.svgNode(iconName, 15));
    button.appendChild(YASH.el("span", { className: "yash-icon-button-label", text: label }));
    return button;
  };

  YASH.copyText = function (text) {
    const value = String(text || "");
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(
        function () {
          return true;
        },
        function () {
          return YASH.copyFallback(value);
        }
      );
    }
    return Promise.resolve(YASH.copyFallback(value));
  };

  YASH.copyFallback = function (value) {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "readonly");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch (error) {
      return false;
    }
  };

  YASH.download = function (filename, content, mime) {
    const blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  };

  YASH.printNode = function (node, title) {
    const frame = document.createElement("iframe");
    frame.setAttribute("title", "Printable Yash AI document");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    if (!doc) {
      document.body.removeChild(frame);
      window.print();
      return;
    }
    doc.open();
    doc.write("<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>");
    doc.close();
    const style = doc.createElement("style");
    style.textContent =
      "body{font-family:Inter,'Segoe UI',sans-serif;padding:26px;color:#142333;line-height:1.55}" +
      "h1{font-size:21px;margin:0 0 6px}h2{font-size:15px;margin:16px 0 6px}" +
      "table{border-collapse:collapse;width:100%;margin:8px 0}" +
      "th,td{border:1px solid #cbd6de;padding:6px 8px;text-align:left;font-size:12px}" +
      ".pn{margin-top:16px;padding:10px;border:1px solid #cbd6de;font-size:11px}" +
      "ul{margin:6px 0 6px 18px}li{font-size:12px}";
    doc.head.appendChild(style);
    const body = doc.body;
    const heading = doc.createElement("h1");
    heading.textContent = title || YASH.APP.name;
    body.appendChild(heading);
    const holder = doc.createElement("div");
    holder.appendChild(node.cloneNode(true));
    body.appendChild(holder);
    window.setTimeout(function () {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (error) {
        window.print();
      }
      window.setTimeout(function () {
        if (frame.parentNode) frame.parentNode.removeChild(frame);
      }, 1500);
    }, 180);
  };
})();
