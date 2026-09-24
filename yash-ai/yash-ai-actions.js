/* ==========================================================================
   Yash AI - Safe application tools, confirmation workflow and audit trail
   --------------------------------------------------------------------------
   Yash AI never changes application data directly. Every data-changing request
   becomes a *proposal*:

       request()  ->  pending confirmation (stored)  ->  resolve()

   resolve() is the only place a write can happen, and it always
     - re-checks the user's role permission,
     - validates the structured arguments,
     - writes an audit entry stating the action was confirmed by the user.

   The tool registry below mirrors the specification exactly: read-only tools
   live in yash-ai-data.js, navigation and draft tools are registered as
   non-persistent helpers, and the write tools require confirmation.
   ========================================================================== */
(function () {
  "use strict";

  const YASH = (window.YashAI = window.YashAI || {});

  const MAX_TASK_TITLE = 120;
  const MAX_TASK_REASON = 240;
  const MAX_PAYLOAD_STRING = 4000;

  /* ------------------------------------------------------------- small helpers */

  function bridge() {
    return window.SmartCareBridge || null;
  }

  function notify(message, type) {
    const api = bridge();
    if (api && typeof api.showToast === "function") {
      api.showToast(message, type || "info");
      return;
    }
    window.console.info("[Yash AI]", message);
  }

  function navigate(route) {
    const api = bridge();
    if (!api || typeof api.navigateAppRoute !== "function") {
      notify("Navigation is unavailable in this browser session.", "info");
      return false;
    }
    if (!route) return false;
    api.navigateAppRoute(String(route));
    return true;
  }

  function dismiss(key) {
    const dismissed = YASH.store.get("smartcareAiDismissed", []);
    const list = Array.isArray(dismissed) ? dismissed : [];
    if (!list.includes(key)) list.push(key);
    YASH.store.set("smartcareAiDismissed", list.slice(-80));
    notify("Suggestion dismissed. It will not be suggested again in this browser.", "info");
    window.dispatchEvent(new CustomEvent("yash-ai:dismissed", { detail: { key: key } }));
  }

  function isDismissed(key) {
    const list = YASH.store.get("smartcareAiDismissed", []);
    return Array.isArray(list) && list.includes(key);
  }

  /* ---------------------------------------------------------------- validation */

  function cleanText(value, maxLength) {
    const text = String(value === null || value === undefined ? "" : value).trim();
    if (text.length > maxLength) return text.slice(0, maxLength);
    return text;
  }

  function validateTask(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const title = cleanText(source.title, MAX_TASK_TITLE);
    if (!title) return { ok: false, error: "A task title is required." };
    return {
      ok: true,
      value: {
        title: title,
        assignment: cleanText(source.assignment, 60) || "Unassigned",
        due: cleanText(source.due, 40) || YASH.t("common.today"),
        priority: ["high", "medium", "low"].includes(source.priority) ? source.priority : "medium",
        reason: cleanText(source.reason, MAX_TASK_REASON),
        kind: cleanText(source.kind, 40) || "administrative",
        relatedRoute: cleanText(source.relatedRoute, 60) || "dashboard"
      }
    };
  }

  function validateIssueId(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const issueId = cleanText(source.issueId, 160);
    if (!issueId) return { ok: false, error: "An issue identifier is required." };
    return { ok: true, value: { issueId: issueId } };
  }

  function validateReport(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const title = cleanText(source.title, MAX_TASK_TITLE);
    if (!title) return { ok: false, error: "A report title is required." };
    return {
      ok: true,
      value: {
        title: title,
        reportType: cleanText(source.reportType, 60) || "camp-operations",
        audience: cleanText(source.audience, 60) || "Organizer",
        language: YASH.isLanguage(source.language) ? source.language : YASH.currentLanguage(),
        body: cleanText(source.body, MAX_PAYLOAD_STRING),
        metrics: Array.isArray(source.metrics) ? source.metrics.slice(0, 20) : []
      }
    };
  }

  function validatePoster(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const title = cleanText(source.title, MAX_TASK_TITLE);
    if (!title) return { ok: false, error: "A poster title is required." };
    return {
      ok: true,
      value: {
        title: title,
        theme: cleanText(source.theme, 40) || "healthcare-blue",
        language: YASH.isLanguage(source.language) ? source.language : YASH.currentLanguage(),
        fields: Array.isArray(source.fields) ? source.fields.slice(0, 20) : [],
        services: Array.isArray(source.services) ? source.services.slice(0, 12) : [],
        cta: cleanText(source.cta, 200),
        subtitle: cleanText(source.subtitle, 200)
      }
    };
  }

  function validateTranslation(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const translated = cleanText(source.translated, MAX_PAYLOAD_STRING);
    if (!translated) return { ok: false, error: "There is no translation draft to save." };
    return {
      ok: true,
      value: {
        source: YASH.isLanguage(source.source) ? source.source : "en",
        target: YASH.isLanguage(source.target) ? source.target : "kn",
        original: cleanText(source.original, MAX_PAYLOAD_STRING),
        translated: translated
      }
    };
  }

  function validateBriefing(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const title = cleanText(source.title, MAX_TASK_TITLE);
    if (!title) return { ok: false, error: "A briefing title is required." };
    return {
      ok: true,
      value: {
        title: title,
        briefingType: cleanText(source.briefingType, 60) || "camp-briefing",
        body: cleanText(source.body, MAX_PAYLOAD_STRING),
        audience: cleanText(source.audience, 60) || "Camp team"
      }
    };
  }

  /* --------------------------------------------------------- write tool registry */
  /* permittedRoles: empty array means "any signed-in role".              */
  /* readOnlyBlocked: Auditor never performs writes.                      */

  const WRITE_TOOLS = {
    createTask: {
      label: "Create administrative task",
      permittedRoles: [],
      validate: validateTask,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("task"),
          status: "open",
          createdBy: YASH.data.currentRole(),
          createdAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.TASKS, record, 60);
        return { record: record, message: YASH.t("task.created") };
      }
    },

    createFollowUpTask: {
      label: "Create follow-up task",
      permittedRoles: [],
      validate: validateTask,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("followup-task"),
          kind: "follow-up",
          status: "open",
          createdBy: YASH.data.currentRole(),
          createdAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.TASKS, record, 60);
        return {
          record: record,
          message: "Follow-up task confirmed by the user and added to the demo task list."
        };
      }
    },

    saveApprovedReport: {
      label: "Save approved report",
      permittedRoles: ["Administrator", "Camp Organizer"],
      validate: validateReport,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("report"),
          reviewed: true,
          savedBy: YASH.data.currentRole(),
          savedAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.REPORTS, record, 20);
        return { record: record, message: "Report saved and marked as human-reviewed." };
      }
    },

    saveApprovedPoster: {
      label: "Save approved poster",
      permittedRoles: ["Administrator", "Camp Organizer"],
      validate: validatePoster,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("poster"),
          reviewed: true,
          published: false,
          savedBy: YASH.data.currentRole(),
          savedAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.POSTERS, record, 20);
        return { record: record, message: "Poster saved and marked as human-reviewed." };
      }
    },

    publishPoster: {
      label: "Publish poster to announcements",
      permittedRoles: ["Administrator", "Camp Organizer"],
      validate: validatePoster,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("poster"),
          reviewed: true,
          published: true,
          savedBy: YASH.data.currentRole(),
          savedAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.POSTERS, record, 20);
        const announcements = YASH.store.get("smartcareAiAnnouncements", []);
        announcements.push({
          id: YASH.uid("announcement"),
          title: value.title,
          subtitle: value.subtitle || "",
          publishedAt: YASH.nowIso(),
          publishedBy: YASH.data.currentRole()
        });
        YASH.store.set("smartcareAiAnnouncements", announcements.slice(-20));
        return { record: record, message: "Poster published to the local demo announcements list." };
      }
    },

    saveApprovedTranslation: {
      label: "Save approved translation",
      permittedRoles: [],
      validate: validateTranslation,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("translation"),
          reviewed: true,
          savedBy: YASH.data.currentRole(),
          savedAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.TRANSLATIONS, record, 40);
        return { record: record, message: "Approved translation saved for local reuse." };
      }
    },

    saveBriefing: {
      label: "Save briefing",
      permittedRoles: ["Administrator", "Camp Organizer", "Doctor", "Nurse"],
      validate: validateBriefing,
      execute: function (value) {
        const record = Object.assign({}, value, {
          id: YASH.uid("briefing"),
          reviewed: false,
          savedBy: YASH.data.currentRole(),
          savedAt: YASH.nowIso()
        });
        YASH.store.push(YASH.KEY.BRIEFINGS, record, 30);
        return { record: record, message: "Briefing saved as a draft awaiting review." };
      }
    },

    markDataQualityIssueReviewed: {
      label: "Mark data-quality issue reviewed",
      permittedRoles: [],
      validate: validateIssueId,
      execute: function (value) {
        const reviewed = YASH.store.get(YASH.KEY.REVIEWED_ISSUES, []);
        const list = Array.isArray(reviewed) ? reviewed : [];
        if (!list.includes(value.issueId)) list.push(value.issueId);
        YASH.store.set(YASH.KEY.REVIEWED_ISSUES, list.slice(-200));
        return {
          record: { issueId: value.issueId, reviewedAt: YASH.nowIso() },
          message: "Issue marked reviewed. The underlying demo record was not changed."
        };
      }
    }
  };

  /* --------------------------------------------------------------- audit trail */

  /**
   * Audit entries never contain the free-text the user typed, and never contain
   * patient identifiers. They record what was done, by which role, in which mode.
   */
  function audit(entry) {
    const record = Object.assign(
      {
        role: YASH.data.currentRole(),
        feature: "Yash AI action",
        dataCategory: "Aggregate fictional operations",
        mode: YASH.data.mode() === "real" ? "Real AI (server proxy)" : "Demo AI",
        status: "completed",
        reviewed: false,
        timestamp: YASH.nowIso()
      },
      entry || {}
    );
    const logs = YASH.store.get(YASH.KEY.AUDIT, []);
    const list = Array.isArray(logs) ? logs : [];
    list.push(record);
    YASH.store.set(YASH.KEY.AUDIT, list.slice(-50));
    return record;
  }

  /* ------------------------------------------------------- confirmation storage */

  function confirmations() {
    const list = YASH.store.get(YASH.KEY.CONFIRMATIONS, []);
    return Array.isArray(list) ? list : [];
  }

  function saveConfirmations(list) {
    YASH.store.set(YASH.KEY.CONFIRMATIONS, list.slice(-40));
  }

  function findConfirmation(actionId) {
    return (
      confirmations().find(function (item) {
        return item.id === actionId;
      }) || null
    );
  }

  function pendingList() {
    return confirmations().filter(function (item) {
      return item.status === "pending";
    });
  }

  /* ------------------------------------------------------------ proposal API */

  /**
   * Propose a data-changing action. Returns a confirmation *block* that the
   * caller embeds into a response; nothing is written yet.
   */
  function request(spec) {
    const source = spec && typeof spec === "object" ? spec : {};
    const tool = WRITE_TOOLS[source.type];
    const actionId = YASH.uid("confirm");

    if (!tool) {
      return {
        type: "warning",
        severity: "high",
        title: "Unknown action refused",
        body: "Yash AI does not have a tool named \u201C" + String(source.type || "unknown") + "\u201D, so nothing was proposed."
      };
    }

    const permission = YASH.safety.canConfirmWrites(YASH.data.currentRole());
    const role = YASH.data.currentRole();

    if (!permission || (tool.permittedRoles.length && !tool.permittedRoles.includes(role))) {
      return {
        type: "warning",
        severity: "high",
        title: "Permission required",
        body:
          "The role \u201C" +
          role +
          "\u201D cannot confirm \u201C" +
          tool.label +
          "\u201D. Ask an authorized teammate to perform this action."
      };
    }

    const record = {
      id: actionId,
      type: source.type,
      toolLabel: tool.label,
      title: source.title || tool.label,
      summary: Array.isArray(source.summary) ? source.summary : [],
      reason: source.reason || "",
      payload: source.payload || {},
      status: "pending",
      createdAt: YASH.nowIso(),
      resolvedAt: null,
      resolvedBy: null,
      result: null
    };

    const list = confirmations();
    list.push(record);
    saveConfirmations(list);
    window.dispatchEvent(new CustomEvent("yash-ai:confirmation", { detail: { actionId: actionId } }));

    return {
      type: "confirmation",
      actionId: actionId,
      title: record.title,
      summary: record.summary,
      reason: record.reason
    };
  }

  function refreshCards(actionId, outcome) {
    document.querySelectorAll("[data-confirmation-id='" + actionId + "']").forEach(function (card) {
      card.classList.remove("is-pending");
      card.classList.add(outcome.ok ? "is-confirmed" : "is-cancelled");
      const actions = card.querySelector(".yash-confirmation-actions");
      if (actions) actions.remove();
      const status = YASH.el("div", {
        className: "yash-confirmation-outcome " + (outcome.ok ? "success" : "neutral")
      });
      status.appendChild(YASH.svgNode(outcome.ok ? "check" : "info", 15));
      status.appendChild(YASH.el("p", { text: outcome.message }));
      card.appendChild(status);
    });
  }

  /**
   * Resolve a proposal.
   * decision: "confirm" | "cancel" | "edit"
   */
  function resolve(actionId, decision) {
    const list = confirmations();
    const record = list.find(function (item) {
      return item.id === actionId;
    });

    if (!record) {
      notify("That confirmation has already been cleared.", "info");
      return null;
    }
    if (record.status !== "pending") {
      notify("That action was already " + record.status + ".", "info");
      return null;
    }

    if (decision === "cancel") {
      record.status = "cancelled";
      record.resolvedAt = YASH.nowIso();
      record.resolvedBy = YASH.data.currentRole();
      saveConfirmations(list);
      audit({ feature: "Action cancelled by user: " + record.type, status: "cancelled" });
      refreshCards(actionId, { ok: false, message: "Cancelled. No change was made to the demo data." });
      notify("Action cancelled. Nothing was changed.", "info");
      return { status: "cancelled" };
    }

    if (decision === "edit") {
      record.status = "edited";
      record.resolvedAt = YASH.nowIso();
      saveConfirmations(list);
      audit({ feature: "Action returned for editing: " + record.type, status: "edited" });
      refreshCards(actionId, {
        ok: false,
        message: "Sent back for editing. Adjust the details on the matching workspace, then ask Yash AI again."
      });
      notify("Sent back for editing. Nothing was changed.", "info");
      return { status: "edited" };
    }

    /* confirm */
    const tool = WRITE_TOOLS[record.type];
    if (!tool) {
      notify("That tool is no longer available.", "error");
      return null;
    }

    const role = YASH.data.currentRole();
    if (!YASH.safety.canConfirmWrites(role) || (tool.permittedRoles.length && !tool.permittedRoles.includes(role))) {
      record.status = "blocked";
      saveConfirmations(list);
      audit({ feature: "Action blocked by permission: " + record.type, status: "blocked" });
      refreshCards(actionId, {
        ok: false,
        message: "Your role does not permit this action. An authorized teammate must confirm it."
      });
      notify("Your role does not permit that action.", "error");
      return { status: "blocked" };
    }

    const validated = tool.validate(record.payload);
    if (!validated.ok) {
      record.status = "invalid";
      saveConfirmations(list);
      audit({ feature: "Action failed validation: " + record.type, status: "invalid" });
      refreshCards(actionId, { ok: false, message: "Validation failed: " + validated.error });
      notify(validated.error, "error");
      return { status: "invalid", error: validated.error };
    }

    let outcome;
    try {
      outcome = tool.execute(validated.value);
    } catch (error) {
      record.status = "failed";
      saveConfirmations(list);
      audit({ feature: "Action failed: " + record.type, status: "failed" });
      refreshCards(actionId, { ok: false, message: "The action could not be completed." });
      notify("The action could not be completed.", "error");
      return { status: "failed" };
    }

    record.status = "confirmed";
    record.resolvedAt = YASH.nowIso();
    record.resolvedBy = role;
    record.result = outcome.message;
    saveConfirmations(list);

    audit({
      feature: "Action confirmed by user: " + record.type,
      status: "confirmed-by-user",
      reviewed: true
    });

    refreshCards(actionId, { ok: true, message: outcome.message });
    notify(outcome.message, "success");
    window.dispatchEvent(new CustomEvent("yash-ai:action-confirmed", { detail: { actionId: actionId, record: record } }));

    return { status: "confirmed", record: record, message: outcome.message };
  }

  /* --------------------------------------------------- draft (non-write) tools */
  /* Draft tools never persist anything. They exist so the tool surface matches
     the specification and so the assistant can describe what it is about to do. */

  const DRAFT_TOOLS = {
    createReportDraft: "Builds a report preview that is not saved until you confirm.",
    createPosterDraft: "Builds a poster preview that is not saved until you confirm.",
    createBriefingDraft: "Builds a briefing draft that is not saved until you confirm.",
    createTranslationDraft: "Builds a local translation draft. Never saved automatically.",
    createTaskDraft: "Builds a task proposal. The task exists only after you confirm.",
    openRoute: "Navigates to an internal page after checking role permission."
  };

  const READ_ONLY_TOOLS = {
    getDashboardSummary: "Aggregate operations totals for the current camp.",
    getCampDetails: "Camp record, readiness and workflow progress.",
    getQueueSummary: "Waiting, screening and completed queue totals.",
    getMedicineAlerts: "Low-stock and expiry alerts from fictional inventory.",
    getFollowUpSummary: "Pending and overdue fictional follow-ups.",
    getReferralSummary: "Referral totals and missing administrative reasons.",
    getReportData: "Filtered aggregate report inputs.",
    getDataQualityIssues: "Rule-based data-quality findings. Never modifies records.",
    getCurrentUserPermissions: "The signed-in role and its permitted workspaces."
  };

  const FORBIDDEN_TOOLS = YASH.safety.RESTRICTIONS;

  YASH.actions = {
    WRITE_TOOLS: WRITE_TOOLS,
    DRAFT_TOOLS: DRAFT_TOOLS,
    READ_ONLY_TOOLS: READ_ONLY_TOOLS,
    FORBIDDEN_TOOLS: FORBIDDEN_TOOLS,
    request: request,
    resolve: resolve,
    list: confirmations,
    pending: pendingList,
    pendingCount: function () {
      return pendingList().length;
    },
    find: findConfirmation,
    audit: audit,
    notify: notify,
    navigate: navigate,
    dismiss: dismiss,
    isDismissed: isDismissed,
    refreshCards: refreshCards
  };
})();
