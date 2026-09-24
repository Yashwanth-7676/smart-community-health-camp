/* ==========================================================================
   Yash AI - Read-only data layer
   --------------------------------------------------------------------------
   Every Yash AI answer is computed from this layer. It exposes aggregate,
   non-identifying operations data only. Accessors are defensive: if the host
   application bridge is not ready yet they return safe empty values instead
   of throwing, so the assistant degrades instead of crashing.
   ========================================================================== */
(function () {
  "use strict";

  const YASH = (window.YashAI = window.YashAI || {});

  const DEMO_CAPACITY = 120;
  const MINIMUM_AGE = 1;
  const MAXIMUM_AGE = 120;
  const ALLOWED_GENDERS = ["Female", "Male", "Other"];
  const FOLLOW_UP_DUE_DAYS = 3;
  const STALE_CONSULTATION_DAYS = 1;
  const MAX_LIST_ROWS = 40;

  function bridge() {
    return window.SmartCareBridge || null;
  }

  function isReady() {
    return Boolean(bridge());
  }

  /* --------------------------------------------------------------- primitives */

  function patients() {
    const api = bridge();
    if (!api || typeof api.getPatients !== "function") return [];
    const list = api.getPatients();
    return Array.isArray(list) ? list.slice() : [];
  }

  function medicines() {
    const api = bridge();
    if (!api || typeof api.getDemoMedicines !== "function") return [];
    const list = api.getDemoMedicines();
    return Array.isArray(list) ? list.slice() : [];
  }

  function currentUser() {
    const api = bridge();
    if (!api || typeof api.getCurrentUser !== "function") return null;
    return api.getCurrentUser() || null;
  }

  function currentRole() {
    const user = currentUser();
    return (user && user.role) || "Guest";
  }

  function permissions() {
    const api = bridge();
    const role = currentRole();
    const map = (api && api.ROLE_PERMISSIONS) || {};
    const panels = Array.isArray(map[role]) ? map[role].slice() : [];
    return {
      role: role,
      panels: panels,
      canUseYashAi: panels.includes("ai-panel"),
      canWriteReports: ["Administrator", "Camp Organizer", "Auditor"].includes(role),
      canPublishPoster: ["Administrator", "Camp Organizer"].includes(role),
      canManageInventory: ["Administrator", "Pharmacist"].includes(role),
      canViewAudit: ["Administrator", "Auditor"].includes(role),
      canToggleSafety: role === "Administrator",
      isReadOnly: role === "Auditor"
    };
  }

  function campName() {
    const api = bridge();
    if (api && typeof api.DEFAULT_CAMP_NAME === "string") return api.DEFAULT_CAMP_NAME;
    return "Smart Community Health Camp 2026";
  }

  function mode() {
    const api = bridge();
    if (api && typeof api.getYashAiMode === "function") {
      const value = api.getYashAiMode();
      if (value === "real" || value === "fallback" || value === "demo") return value;
    }
    return "demo";
  }

  /* ------------------------------------------------------------- history helpers */

  function historyOf(patient, key) {
    const history = (patient && patient.history) || {};
    const list = history[key];
    return Array.isArray(list) ? list : [];
  }

  function hasHistory(patient, key) {
    return historyOf(patient, key).length > 0;
  }

  function isWaiting(patient) {
    return !patient.queueStatus || patient.queueStatus === "Waiting";
  }

  /* ------------------------------------------------------------------- counters */

  function todayRegistrations() {
    const today = YASH.todayKey();
    return patients().filter(function (patient) {
      return String(patient.registrationDate || "").slice(0, 10) === today;
    }).length;
  }

  function counts() {
    const list = patients();
    return {
      registrations: list.length,
      todayRegistrations: todayRegistrations(),
      waiting: list.filter(isWaiting).length,
      screenings: list.filter(function (patient) {
        return hasHistory(patient, "screening");
      }).length,
      consultations: list.filter(function (patient) {
        return hasHistory(patient, "consultation");
      }).length,
      dispensings: list.filter(function (patient) {
        return hasHistory(patient, "medicine");
      }).length,
      referrals: list.filter(function (patient) {
        return hasHistory(patient, "referral");
      }).length,
      followUps: list.filter(function (patient) {
        return hasHistory(patient, "followup");
      }).length,
      lowStock: medicineAlerts().lowStock.length,
      expired: medicineAlerts().expired.length
    };
  }

  function departments() {
    const groups = {};
    patients().forEach(function (patient) {
      const name = patient.department || "General Check-up";
      groups[name] = (groups[name] || 0) + 1;
    });
    return groups;
  }

  /* -------------------------------------------------------------- safe AI tools */

  /** getDashboardSummary() */
  function dashboardSummary() {
    const totals = counts();
    return {
      camp: campName(),
      totals: totals,
      departments: departments(),
      readiness: readiness(),
      dataQualityScore: dataQualityScore(),
      offlinePending: offlineSyncCount(),
      generatedAt: YASH.nowIso()
    };
  }

  /** getCampDetails(campId) */
  function campDetails(campId) {
    const list = patients();
    const name = campId || campName();
    const campPatients = list.filter(function (patient) {
      return (patient.campName || campName()) === name;
    });
    const workflow = workflowState();
    return {
      campId: name,
      campName: name,
      registrations: campPatients.length,
      staffAssigned: workflow.completed.includes(2),
      posterPublished: Boolean(YASH.store.get(YASH.KEY.POSTERS, []).length),
      reportGenerated: Boolean(YASH.store.get(YASH.KEY.REPORTS, []).length),
      workflowProgress: workflow,
      departments: departments()
    };
  }

  /** getQueueSummary(campId) */
  function queueSummary() {
    const list = patients();
    const waiting = list.filter(isWaiting);
    const byDepartment = {};
    waiting.forEach(function (patient) {
      const key = patient.department || "General Check-up";
      byDepartment[key] = (byDepartment[key] || 0) + 1;
    });
    const rows = Object.keys(byDepartment)
      .map(function (key) {
        return { department: key, waiting: byDepartment[key] };
      })
      .sort(function (a, b) {
        return b.waiting - a.waiting;
      });

    return {
      waiting: waiting.length,
      inScreening: list.filter(function (patient) {
        return patient.queueStatus === "Screening";
      }).length,
      completed: list.filter(function (patient) {
        return patient.queueStatus === "Completed";
      }).length,
      longestDepartment: rows[0] ? rows[0].department : null,
      longestDepartmentWaiting: rows[0] ? rows[0].waiting : 0,
      byDepartment: rows
    };
  }

  /** getMedicineAlerts() */
  function medicineAlerts() {
    const list = medicines();
    const today = YASH.todayKey();
    const lowStock = list.filter(function (medicine) {
      const quantity = Number(medicine.quantity) || 0;
      const minimum = Number(medicine.minimum) || 0;
      return quantity <= minimum;
    });
    const expired = list.filter(function (medicine) {
      const expiry = String(medicine.expiry || "").slice(0, 10);
      return Boolean(expiry) && expiry < today;
    });
    const expiringSoon = list.filter(function (medicine) {
      const expiry = String(medicine.expiry || "").slice(0, 10);
      if (!expiry) return false;
      const days = YASH.daysBetween(YASH.todayKey(), expiry);
      return expiry >= today && days <= 60;
    });
    return {
      total: list.length,
      lowStock: lowStock,
      expired: expired,
      expiringSoon: expiringSoon,
      items: list
    };
  }

  /** getFollowUpSummary() */
  function followUpSummary() {
    const today = YASH.todayKey();
    const rows = [];
    patients().forEach(function (patient) {
      historyOf(patient, "followup").forEach(function (entry) {
        rows.push({
          patientRef: patient.patientId,
          camp: patient.campName || campName(),
          due: String(entry.date || entry.due || "").slice(0, 10),
          assignedTo: entry.assignedTo || entry.staff || "Unassigned",
          note: entry.note || "",
          status: entry.status || "Pending",
          createdAt: entry.createdAt || entry.date || null
        });
      });
    });

    const pending = rows.filter(function (row) {
      return row.status !== "Completed" && row.status !== "Closed";
    });
    const overdue = pending.filter(function (row) {
      if (!row.due) return true;
      const age = YASH.daysBetween(row.due, today);
      return age >= FOLLOW_UP_DUE_DAYS;
    });

    const byStaff = {};
    overdue.forEach(function (row) {
      byStaff[row.assignedTo] = (byStaff[row.assignedTo] || 0) + 1;
    });

    return {
      total: rows.length,
      pending: pending.length,
      overdue: overdue.length,
      rows: rows,
      overdueRows: overdue,
      withoutDueDate: rows.filter(function (row) {
        return !row.due;
      }).length,
      byStaff: Object.keys(byStaff).map(function (key) {
        return { staff: key, count: byStaff[key] };
      })
    };
  }

  /** getReferralSummary() */
  function referralSummary() {
    const rows = [];
    patients().forEach(function (patient) {
      historyOf(patient, "referral").forEach(function (entry) {
        rows.push({
          patientRef: patient.patientId,
          camp: patient.campName || campName(),
          reason: entry.reason || entry.note || "",
          date: entry.date || null,
          destination: entry.destination || "Not recorded"
        });
      });
    });
    return {
      total: rows.length,
      missingReason: rows.filter(function (row) {
        return !String(row.reason || "").trim();
      }).length,
      rows: rows
    };
  }

  /** getReportData(filters) */
  function reportData(filters) {
    const options = filters || {};
    const list = patients();
    const from = options.from ? new Date(options.from).getTime() : null;
    const to = options.to ? new Date(options.to).getTime() : null;
    const inRange = list.filter(function (patient) {
      const registered = new Date(patient.registrationDate || 0).getTime();
      if (from !== null && registered < from) return false;
      if (to !== null && registered > to) return false;
      return true;
    });
    return {
      filters: {
        from: options.from || null,
        to: options.to || null,
        department: options.department || "All departments",
        camp: options.camp || campName()
      },
      registrations: inRange.length,
      screenings: inRange.filter(function (patient) {
        return hasHistory(patient, "screening");
      }).length,
      consultations: inRange.filter(function (patient) {
        return hasHistory(patient, "consultation");
      }).length,
      referrals: inRange.filter(function (patient) {
        return hasHistory(patient, "referral");
      }).length,
      followUps: inRange.filter(function (patient) {
        return hasHistory(patient, "followup");
      }).length,
      dispensings: inRange.filter(function (patient) {
        return hasHistory(patient, "medicine");
      }).length,
      genderSplit: inRange.reduce(function (groups, patient) {
        const key = patient.gender || "Other";
        groups[key] = (groups[key] || 0) + 1;
        return groups;
      }, {}),
      departments: departments()
    };
  }

  /** getCurrentUserPermissions() */
  function currentUserPermissions() {
    return permissions();
  }

  /* ------------------------------------------------------- workflow and offline */

  function workflowState() {
    const stored = YASH.store.get("smartcareWorkflowState", null);
    const fallback = { currentStep: 0, completed: [], updatedAt: null };
    if (!stored || typeof stored !== "object") return fallback;
    return {
      currentStep: Number(stored.currentStep) || 0,
      completed: Array.isArray(stored.completed) ? stored.completed.slice() : [],
      updatedAt: stored.updatedAt || null
    };
  }

  function workflowStepCount() {
    const api = bridge();
    if (api && Array.isArray(api.WORKFLOW_STEPS)) return api.WORKFLOW_STEPS.length;
    return 15;
  }

  function offlineSyncCount() {
    let raw = 0;
    try {
      raw = Number(window.localStorage.getItem("smartcarePendingDemoSync") || 0);
    } catch (error) {
      raw = 0;
    }
    return Number.isFinite(raw) ? raw : 0;
  }

  function readiness() {
    const totals = counts();
    const workflow = workflowState();
    const total = workflowStepCount();
    const workflowRatio = total ? Math.round((workflow.completed.length / total) * 100) : 0;
    const medicineState = medicineAlerts();
    const items = [
      {
        label: "Camp record created",
        done: workflow.completed.includes(0) || totals.registrations > 0
      },
      { label: "Readiness checklist reviewed", done: workflow.completed.includes(1) },
      { label: "Staff roster assigned", done: workflow.completed.includes(2) },
      {
        label: "Inventory prepared",
        done: medicineState.lowStock.length === 0 && medicineState.expired.length === 0
      },
      { label: "Public poster published", done: Boolean(YASH.store.get(YASH.KEY.POSTERS, []).length) },
      { label: "Registration desk staffed", done: totals.registrations > 0 },
      {
        label: "Screening station ready",
        done: totals.registrations === 0 || totals.screenings > 0
      }
    ];
    const done = items.filter(function (item) {
      return item.done;
    }).length;
    return {
      items: items,
      done: done,
      total: items.length,
      workflowRatio: workflowRatio,
      score: Math.round((done / items.length) * 100)
    };
  }

  /* -------------------------------------------------------- data-quality engine */

  function recordRef(patient) {
    /* Patient names are never shown. Only the pseudonymous demo identifier. */
    return patient.patientId || "unknown-record";
  }

  function issue(code, severity, title, detail, suggestedFix, relatedRoute, context) {
    return {
      id: code + ":" + (context && context.ref ? context.ref : "camp"),
      code: code,
      severity: severity,
      title: title,
      detail: detail,
      relatedRoute: relatedRoute || "data-quality",
      suggestedFix: suggestedFix,
      context: context || {},
      ref: (context && context.ref) || "camp",
      reviewed: isIssueReviewed(code + ":" + ((context && context.ref) || "camp"))
    };
  }

  function reviewedIssueIds() {
    const list = YASH.store.get(YASH.KEY.REVIEWED_ISSUES, []);
    return Array.isArray(list) ? list : [];
  }

  function isIssueReviewed(id) {
    return reviewedIssueIds().includes(id);
  }

  /** getDataQualityIssues() */
  function dataQualityIssues() {
    const issues = [];
    const list = patients();
    const today = YASH.todayKey();

    /* 1. Duplicate registrations (same name, age and gender in the same camp) */
    const seen = {};
    list.forEach(function (patient) {
      const fingerprint = [
        String(patient.name || "").trim().toLowerCase(),
        Number(patient.age) || 0,
        String(patient.gender || "").toLowerCase()
      ].join("|");
      if (seen[fingerprint]) {
        issues.push(
          issue(
            "duplicate-registration",
            "high",
            "Possible duplicate registration",
            "Two fictional demo records share the same name, age and gender in the same camp.",
            "Compare the two demo records manually and keep only the correct registration.",
            "register",
            { ref: recordRef(patient) }
          )
        );
      } else {
        seen[fingerprint] = true;
      }
    });

    /* 2. Missing consent (explicitly declined or unknown for completed records) */
    list.forEach(function (patient) {
      if (patient.consent === false) {
        issues.push(
          issue(
            "missing-consent",
            "high",
            "Consent not confirmed",
            "This fictional record is marked as consent-not-given.",
            "Ask the registration desk to confirm demo consent before continuing the visit.",
            "registration",
            { ref: recordRef(patient) }
          )
        );
      }
    });

    /* 3. Invalid demo fields */
    list.forEach(function (patient) {
      const age = Number(patient.age);
      const invalidAge = !Number.isFinite(age) || age < MINIMUM_AGE || age > MAXIMUM_AGE;
      const invalidGender = !ALLOWED_GENDERS.includes(patient.gender);
      const invalidName = !String(patient.name || "").trim();
      if (invalidAge || invalidGender || invalidName) {
        issues.push(
          issue(
            "invalid-demo-field",
            "high",
            "Invalid demo field",
            "A fictional registration contains a missing name, an out-of-range age or an unexpected gender value.",
            "Correct the field on the registration workspace, or reset the demo record.",
            "registration",
            { ref: recordRef(patient) }
          )
        );
      }
    });

    /* 4. Missing screening */
    list.forEach(function (patient) {
      if (!hasHistory(patient, "screening")) {
        issues.push(
          issue(
            "missing-screening",
            "medium",
            "Screening not recorded",
            "This fictional record has no screening entry yet.",
            "Complete the screening handoff for this demo visit, or mark it as intentionally skipped.",
            "screening",
            { ref: recordRef(patient) }
          )
        );
      }
    });

    /* 5. Missing consultation after screening */
    list.forEach(function (patient) {
      if (!hasHistory(patient, "consultation") && hasHistory(patient, "screening")) {
        const age = YASH.daysBetween(patient.registrationDate, today);
        if (age >= STALE_CONSULTATION_DAYS) {
          issues.push(
            issue(
              "missing-consultation",
              "medium",
              "Consultation not documented",
              "Screening is complete but no consultation entry exists for this fictional visit.",
              "Ask the assigned clinician workspace to document the demo consultation handoff.",
              "consultation",
              { ref: recordRef(patient) }
            )
          );
        }
      }
    });

    /* 6. Missing referral reason */
    list.forEach(function (patient) {
      historyOf(patient, "referral").forEach(function (entry) {
        const reason = String(entry.reason || entry.note || "").trim();
        if (!reason) {
          issues.push(
            issue(
              "missing-referral-reason",
              "medium",
              "Referral reason missing",
              "A fictional referral entry has no recorded administrative reason.",
              "Add the operational reason for the referral record. Do not add clinical interpretation.",
              "referrals",
              { ref: recordRef(patient) }
            )
          );
        }
      });
    });

    /* 7. Missing follow-up date */
    list.forEach(function (patient) {
      historyOf(patient, "followup").forEach(function (entry) {
        if (!String(entry.date || entry.due || "").trim()) {
          issues.push(
            issue(
              "missing-followup-date",
              "medium",
              "Follow-up date missing",
              "A fictional follow-up entry has no due date, so it cannot be scheduled.",
              "Add a due date on the follow-up workspace.",
              "followups",
              { ref: recordRef(patient) }
            )
          );
        }
      });
    });

    /* 8. Expired medicines */
    medicineAlerts().expired.forEach(function (medicine) {
      issues.push(
        issue(
          "expired-medicine",
          "high",
          "Expired medicine in demo inventory",
          "A fictional inventory item is past its labelled expiry date.",
          "Remove or restock the item on the pharmacy workspace. Yash AI never changes stock silently.",
          "medicines",
          { ref: medicine.id, name: medicine.name }
        )
      );
    });

    /* 9. Low stock */
    medicineAlerts().lowStock.forEach(function (medicine) {
      issues.push(
        issue(
          "low-stock",
          "medium",
          "Low medicine stock",
          "A fictional inventory item is at or below its demo minimum threshold.",
          "Review the stock level with the pharmacist and restock if appropriate.",
          "medicines",
          { ref: medicine.id, name: medicine.name }
        )
      );
    });

    /* 10. Camp without assigned staff */
    const workflow = workflowState();
    if (list.length > 0 && !workflow.completed.includes(2)) {
      issues.push(
        issue(
          "camp-without-staff",
          "medium",
          "Staff roster not assigned",
          "Fictional registrations exist but the staff-assignment workflow step is not complete.",
          "Open the workflow workspace and complete the staff-assignment step.",
          "workflow",
          { ref: "camp" }
        )
      );
    }

    /* 11. Capacity exceeded */
    if (list.length > DEMO_CAPACITY) {
      issues.push(
        issue(
          "capacity-exceeded",
          "low",
          "Demo capacity exceeded",
          "Fictional registrations exceed the " + DEMO_CAPACITY + " attendee planning assumption.",
          "Review desk and station planning on the Camp Planner.",
          "camp-planner",
          { ref: "camp" }
        )
      );
    }

    /* 12. Unsynced offline records */
    const pending = offlineSyncCount();
    if (pending > 0) {
      issues.push(
        issue(
          "unsynced-offline",
          "low",
          "Offline demo changes waiting",
          pending + " local fictional change(s) are still waiting for a demo sync.",
          "Run the demo sync from the status bar when the browser is online.",
          "dashboard",
          { ref: "camp" }
        )
      );
    }

    /* 13. Missing poster details */
    if (list.length > 0 && !YASH.store.get(YASH.KEY.POSTERS, []).length && !YASH.store.get(YASH.KEY.POSTER_INPUTS, null)) {
      issues.push(
        issue(
          "missing-poster",
          "low",
          "Camp poster not prepared",
          "No fictional poster draft has been prepared for this camp yet.",
          "Open the Poster Generator and prepare a draft for review.",
          "poster-generator",
          { ref: "camp" }
        )
      );
    }

    /* 14. Missing report sections */
    if (list.length > 0 && !YASH.store.get(YASH.KEY.REPORTS, []).length) {
      issues.push(
        issue(
          "missing-report",
          "low",
          "Camp report not generated",
          "No fictional operations report has been generated for this camp yet.",
          "Open the Report Generator and produce a draft for human review.",
          "report-generator",
          { ref: "camp" }
        )
      );
    }

    return issues;
  }

  function dataQualityScore() {
    const issues = dataQualityIssues();
    const weights = { high: 9, medium: 4, low: 1 };
    const penalty = issues.reduce(function (total, item) {
      return total + (weights[item.severity] || 1);
    }, 0);
    return YASH.clamp(100 - penalty, 0, 100);
  }

  /* ------------------------------------------------------------ tasks & activity */

  function tasks() {
    const list = YASH.store.get(YASH.KEY.TASKS, []);
    return Array.isArray(list) ? list : [];
  }

  function pendingConfirmations() {
    const list = YASH.store.get(YASH.KEY.CONFIRMATIONS, []);
    return Array.isArray(list) ? list.filter(function (item) {
      return item.status === "pending";
    }) : [];
  }

  function auditLogs() {
    const list = YASH.store.get(YASH.KEY.AUDIT, []);
    return Array.isArray(list) ? list : [];
  }

  function recentActivity(limit) {
    const logs = auditLogs().slice().reverse();
    return logs.slice(0, limit || 6).map(function (item) {
      return {
        feature: item.feature || "Yash AI request",
        mode: item.mode || "Demo AI",
        status: item.status || "completed",
        timestamp: item.timestamp || null,
        reviewed: Boolean(item.reviewed)
      };
    });
  }

  function requestCount() {
    return auditLogs().length;
  }

  function lastRequest() {
    const logs = auditLogs();
    return logs.length ? logs[logs.length - 1] : null;
  }

  /* ------------------------------------------------------------- next best action */

  /**
   * Administrative (never clinical) next-action suggestions, ordered by priority.
   * Each suggestion carries the operational evidence behind it so the user can
   * verify the claim instead of trusting it.
   */
  function nextActions() {
    const suggestions = [];
    const totals = counts();
    const queue = queueSummary();
    const medicineState = medicineAlerts();
    const followUps = followUpSummary();
    const ready = readiness();
    const workflow = workflowState();
    const pending = offlineSyncCount();

    if (totals.waiting > 0) {
      suggestions.push({
        code: "queue-review",
        priority: totals.waiting >= 5 ? "high" : "medium",
        title: totals.waiting + " " + YASH.plural(totals.waiting, "registration is", "registrations are") + " waiting for screening",
        explanation:
          "The fictional queue still holds registrations that have not reached screening. This is an administrative handoff gap, not a clinical priority score.",
        route: "queue",
        source: "Local demo queue records",
        evidence: "queueStatus is empty or \u201CWaiting\u201D for " + totals.waiting + " record(s)"
      });
    }

    if (queue.longestDepartment) {
      suggestions.push({
        code: "queue-longest",
        priority: "medium",
        title: "Longest fictional queue: " + queue.longestDepartment,
        explanation:
          queue.longestDepartmentWaiting + " waiting registration(s) are grouped under this department. Volunteer allocation can be adjusted; no clinical prioritisation is suggested.",
        route: "queue",
        source: "Local demo department grouping",
        evidence: "Aggregate department grouping of queueStatus records"
      });
    }

    if (!workflow.completed.includes(2)) {
      suggestions.push({
        code: "staff-missing",
        priority: "high",
        title: "The current camp has no completed staff assignment",
        explanation:
          "The guided workflow step that records the fictional staff roster is not marked complete. Accountability for each station is still open.",
        route: "workflow",
        source: "Local demo workflow state",
        evidence: "Workflow step \u201CAssign staff\u201D is incomplete"
      });
    }

    if (followUps.overdue > 0) {
      suggestions.push({
        code: "followups-overdue",
        priority: followUps.overdue >= 3 ? "high" : "medium",
        title: followUps.overdue + " demo follow-up(s) are overdue",
        explanation:
          "These fictional follow-ups have passed the demo due window. Yash AI can create a contact checklist and an administrative task.",
        route: "followups",
        source: "Local demo follow-up entries",
        evidence: "Follow-up due date is at least " + FOLLOW_UP_DUE_DAYS + " days in the past"
      });
    }

    if (medicineState.lowStock.length > 0) {
      suggestions.push({
        code: "stock-low",
        priority: "medium",
        title: medicineState.lowStock.length + " fictional medicine item(s) below the demo threshold",
        explanation:
          "Stock levels need an administrative review. Yash AI never changes medicine quantities without explicit confirmation and never suggests treatment.",
        route: "medicines",
        source: "Local demo inventory",
        evidence: "quantity is less than or equal to the recorded demo minimum"
      });
    }

    if (medicineState.expired.length > 0) {
      suggestions.push({
        code: "stock-expired",
        priority: "high",
        title: medicineState.expired.length + " fictional medicine item(s) past expiry",
        explanation:
          "Expired demo items should be removed or restocked by the responsible pharmacist. This is an inventory task only.",
        route: "medicines",
        source: "Local demo inventory",
        evidence: "Recorded demo expiry date is in the past"
      });
    }

    if (!YASH.store.get(YASH.KEY.REPORTS, []).length && totals.registrations > 0) {
      suggestions.push({
        code: "report-missing",
        priority: "medium",
        title: "The camp report has not been generated",
        explanation:
          "No fictional operations report draft exists yet. Generating one now keeps the end-of-day review on schedule.",
        route: "report-generator",
        source: "Local demo report store",
        evidence: "No saved report draft for this browser profile"
      });
    }

    if (!YASH.store.get(YASH.KEY.POSTERS, []).length && totals.registrations > 0) {
      suggestions.push({
        code: "poster-missing",
        priority: "low",
        title: "The camp poster has not been prepared",
        explanation:
          "No fictional poster draft or publish action is recorded for this camp yet.",
        route: "poster-generator",
        source: "Local demo poster store",
        evidence: "No saved poster draft for this browser profile"
      });
    }

    const issueList = dataQualityIssues();
    if (issueList.length > 0) {
      suggestions.push({
        code: "data-quality",
        priority: issueList.some(function (item) {
          return item.severity === "high";
        })
          ? "high"
          : "medium",
        title: issueList.length + " demo record issue(s) need review",
        explanation:
          "The Data Quality assistant found fictional records with missing or conflicting values. Yash AI never changes records silently.",
        route: "data-quality",
        source: "Local rule-based data-quality scan",
        evidence: "Missing screening, duplicates, invalid fields or inventory alerts detected"
      });
    }

    if (ready.score < 100) {
      suggestions.push({
        code: "readiness",
        priority: ready.score < 50 ? "high" : "low",
        title: "Camp readiness is at " + ready.score + "%",
        explanation:
          "Some readiness checklist items are still open. Review the checklist before the camp opens.",
        route: "camp-planner",
        source: "Local demo readiness checklist",
        evidence: ready.total - ready.done + " checklist item(s) incomplete"
      });
    }

    if (pending > 0) {
      suggestions.push({
        code: "offline-sync",
        priority: "low",
        title: pending + " local demo change(s) are waiting to sync",
        explanation:
          "Offline demo mode has queued fictional changes. Running the demo sync clears the queue when the browser is online.",
        route: "dashboard",
        source: "Local demo offline queue",
        evidence: "smartcarePendingDemoSync is greater than zero"
      });
    }

    const order = { high: 0, medium: 1, low: 2 };
    return suggestions
      .sort(function (a, b) {
        return order[a.priority] - order[b.priority];
      })
      .map(function (item, index) {
        return Object.assign(
          {
            id: "suggestion-" + item.code,
            index: index,
            timestamp: YASH.nowIso()
          },
          item
        );
      });
  }

  /* ------------------------------------------------------------------- exports */

  YASH.data = {
    DEMO_CAPACITY: DEMO_CAPACITY,
    MAX_LIST_ROWS: MAX_LIST_ROWS,
    FOLLOW_UP_DUE_DAYS: FOLLOW_UP_DUE_DAYS,
    isReady: isReady,
    bridge: bridge,
    patients: patients,
    medicines: medicines,
    currentUser: currentUser,
    currentRole: currentRole,
    permissions: permissions,
    currentUserPermissions: currentUserPermissions,
    campName: campName,
    mode: mode,
    counts: counts,
    departments: departments,
    todayRegistrations: todayRegistrations,
    dashboardSummary: dashboardSummary,
    campDetails: campDetails,
    queueSummary: queueSummary,
    medicineAlerts: medicineAlerts,
    followUpSummary: followUpSummary,
    referralSummary: referralSummary,
    reportData: reportData,
    workflowState: workflowState,
    workflowStepCount: workflowStepCount,
    offlineSyncCount: offlineSyncCount,
    readiness: readiness,
    dataQualityIssues: dataQualityIssues,
    dataQualityScore: dataQualityScore,
    tasks: tasks,
    pendingConfirmations: pendingConfirmations,
    auditLogs: auditLogs,
    recentActivity: recentActivity,
    requestCount: requestCount,
    lastRequest: lastRequest,
    nextActions: nextActions,
    historyOf: historyOf,
    hasHistory: hasHistory,
    isWaiting: isWaiting,
    isIssueReviewed: isIssueReviewed
  };
})();
