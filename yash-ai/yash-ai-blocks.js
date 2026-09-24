/* ==========================================================================
   Yash AI - Visual response system
   --------------------------------------------------------------------------
   Converts structured response objects into accessible DOM components.
   Sixteen component types are supported so an answer is never a wall of text:
     summary, kpi, table, chart, timeline, checklist, warning, recommendation,
     task, report, poster, translation, dataQuality, navigation, confirmation,
     safety (plus a plain-text fallback).
   Rules enforced here:
     - Every dynamic value is written with textContent, never innerHTML.
     - Every response carries source, date range, generation time, mode,
       fictional-data label, confidence label, limitations and review status.
     - Animation is skipped when reduced motion is requested.
   ========================================================================== */
(function () {
  "use strict";

  const YASH = (window.YashAI = window.YashAI || {});

  /* ------------------------------------------------------------ response model */

  const DEFAULT_LIMITATIONS = [
    "Yash AI provides administrative and educational assistance only.",
    "It does not diagnose, prescribe, make treatment decisions or provide emergency medical advice.",
    "Every operational number below describes fictional demo data held in this browser."
  ];

  function defaultDateRange() {
    const today = new Date();
    const label = today.toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
    return "Fictional demo records \u00B7 up to " + label;
  }

  /**
   * Normalise a response specification into the canonical shape every renderer
   * and exporter can rely on.
   */
  YASH.buildResponse = function (spec) {
    const source = spec && typeof spec === "object" ? spec : {};
    const mode = source.mode || YASH.data.mode();
    const blocks = Array.isArray(source.blocks) ? source.blocks.filter(Boolean) : [];
    return {
      id: source.id || YASH.uid("response"),
      kind: source.kind || "answer",
      title: source.title || "",
      explanation: source.explanation || "",
      blocks: blocks,
      actions: Array.isArray(source.actions) ? source.actions : [],
      meta: {
        source: source.source || "Local fictional SmartCare Camp demo data",
        dateRange: source.dateRange || defaultDateRange(),
        generatedAt: source.generatedAt || YASH.nowIso(),
        mode: mode,
        confidence: source.confidence || YASH.CONFIDENCE.DESCRIPTIVE,
        fictional: true,
        reviewed: Boolean(source.reviewed),
        reviewRequired: source.reviewRequired !== false,
        limitations: Array.isArray(source.limitations) ? source.limitations : DEFAULT_LIMITATIONS.slice(),
        dataBasis: source.dataBasis || "Rule-based demo calculation"
      },
      page: source.page || null,
      role: source.role || YASH.data.currentRole(),
      stopped: false
    };
  };

  /* ------------------------------------------------------------------- helpers */

  function prefersReducedMotion() {
    if (document.body.classList.contains("reduce-motion")) return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function animateNumber(node, value) {
    const target = Number(value) || 0;
    if (prefersReducedMotion()) {
      node.textContent = String(target);
      return;
    }
    const duration = YASH.clamp(420 + target * 6, 420, 900);
    const start = window.performance.now();
    const from = 0;
    function step(now) {
      const progress = YASH.clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(from + (target - from) * eased));
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function toneClass(tone) {
    return ["success", "warning", "danger", "info", "neutral"].includes(tone) ? " tone-" + tone : "";
  }

  function severityTone(severity) {
    if (severity === "high") return "danger";
    if (severity === "medium") return "warning";
    return "info";
  }

  function priorityTone(priority) {
    if (priority === "high") return "danger";
    if (priority === "medium") return "warning";
    return "info";
  }

  function heading(text, level) {
    if (!text) return null;
    return YASH.el("h" + (level || 4), { className: "yash-block-title", text: text });
  }

  function shell(type, title, children, extraClass) {
    const node = YASH.el("section", {
      className: "yash-block yash-block-" + type + " " + (extraClass || ""),
      attrs: { "data-block-type": type }
    });
    const head = YASH.el("header", { className: "yash-block-head" });
    const icon = YASH.svgNode(YASH.blockIcon(type), 16);
    head.appendChild(YASH.el("span", { className: "yash-block-icon", attrs: { "aria-hidden": "true" } }, icon));
    head.appendChild(YASH.el("span", { className: "yash-block-kind", text: YASH.BLOCK_LABEL[type] || "Result" }));
    node.appendChild(head);
    const titleNode = heading(title, 4);
    if (titleNode) node.appendChild(titleNode);
    (Array.isArray(children) ? children : [children]).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  YASH.blockIcon = function (type) {
    const map = {
      summary: "report",
      kpi: "chart",
      table: "task",
      chart: "chart",
      timeline: "clock",
      checklist: "check",
      warning: "warn",
      recommendation: "sparkle",
      task: "task",
      report: "report",
      poster: "image",
      translation: "translate",
      dataQuality: "shield",
      navigation: "arrow",
      confirmation: "info",
      safety: "lock",
      plain: "spark"
    };
    return map[type] || "spark";
  };

  /* -------------------------------------------------------- summary / kpi cards */

  function renderSummary(block) {
    const body = YASH.el("div", { className: "yash-summary-body" });
    if (block.text) {
      body.appendChild(YASH.el("p", { className: "yash-summary-lead", text: block.text }));
    }
    const points = Array.isArray(block.points) ? block.points : [];
    if (points.length) {
      const list = YASH.el("ul", { className: "yash-summary-points" });
      points.forEach(function (point) {
        const item = YASH.el("li");
        item.appendChild(YASH.el("span", { className: "yash-summary-dot", attrs: { "aria-hidden": "true" } }));
        item.appendChild(YASH.el("span", { text: typeof point === "string" ? point : point.text }));
        list.appendChild(item);
      });
      body.appendChild(list);
    }
    if (block.note) {
      body.appendChild(YASH.el("p", { className: "yash-block-note", text: block.note }));
    }
    return shell("summary", block.title, body);
  }

  function renderKpiGrid(block) {
    const grid = YASH.el("div", { className: "yash-kpi-grid" });
    const items = Array.isArray(block.items) ? block.items : [];
    items.forEach(function (item, index) {
      const card = YASH.el("div", {
        className: "yash-kpi-card" + toneClass(item.tone),
        attrs: { style: prefersReducedMotion() ? null : "animation-delay:" + index * 55 + "ms" }
      });
      const valueNode = YASH.el("strong", { className: "yash-kpi-value" });
      valueNode.textContent = "0";
      card.appendChild(valueNode);
      card.appendChild(
        YASH.el("span", {
          className: "yash-kpi-label",
          text: item.unit ? item.label + " (" + item.unit + ")" : item.label
        })
      );
      if (item.hint) card.appendChild(YASH.el("small", { className: "yash-kpi-hint", text: item.hint }));
      grid.appendChild(card);
      window.requestAnimationFrame(function () {
        animateNumber(valueNode, item.value);
      });
    });
    return shell("kpi", block.title, grid);
  }

  /* -------------------------------------------------------------------- table */

  function renderTable(block) {
    const wrap = YASH.el("div", { className: "yash-table-wrap" });
    const table = YASH.el("table", { className: "yash-table" });
    const columns = Array.isArray(block.columns) ? block.columns : [];
    const head = YASH.el("thead");
    const headRow = YASH.el("tr");
    columns.forEach(function (column) {
      headRow.appendChild(
        YASH.el("th", { attrs: { scope: "col" }, text: typeof column === "string" ? column : column.label })
      );
    });
    head.appendChild(headRow);
    table.appendChild(head);

    const body = YASH.el("tbody");
    const rows = Array.isArray(block.rows) ? block.rows : [];
    if (!rows.length) {
      const emptyRow = YASH.el("tr");
      emptyRow.appendChild(
        YASH.el("td", {
          attrs: { colspan: String(Math.max(columns.length, 1)) },
          className: "yash-table-empty",
          text: block.emptyText || YASH.t("common.noData")
        })
      );
      body.appendChild(emptyRow);
    } else {
      rows.forEach(function (row) {
        const rowNode = YASH.el("tr");
        (Array.isArray(row) ? row : [row]).forEach(function (cell) {
          rowNode.appendChild(YASH.el("td", { text: cell === null || cell === undefined ? "\u2014" : cell }));
        });
        body.appendChild(rowNode);
      });
    }
    table.appendChild(body);
    wrap.appendChild(table);
    const children = [wrap];
    if (block.note) children.push(YASH.el("p", { className: "yash-block-note", text: block.note }));
    return shell("table", block.title, children);
  }

  /* -------------------------------------------------------------------- chart */

  function renderChart(block) {
    const series = Array.isArray(block.series) ? block.series : [];
    const max = Math.max(1, series.reduce(function (peak, item) {
      return Math.max(peak, Number(item.value) || 0);
    }, 0));
    const chart = YASH.el("div", {
      className: "yash-chart",
      attrs: { role: "img", "aria-label": (block.title || "Chart") + ": " + series.map(function (item) {
        return item.label + " " + (Number(item.value) || 0);
      }).join(", ") }
    });

    series.forEach(function (item, index) {
      const value = Number(item.value) || 0;
      const row = YASH.el("div", { className: "yash-chart-row" });
      row.appendChild(YASH.el("span", { className: "yash-chart-label", text: item.label }));
      const track = YASH.el("div", { className: "yash-chart-track" });
      const bar = YASH.el("i", { className: "yash-chart-bar" + toneClass(item.tone) });
      bar.style.setProperty("--yash-bar-target", Math.round((value / max) * 100) + "%");
      if (prefersReducedMotion()) {
        bar.style.width = Math.round((value / max) * 100) + "%";
      } else {
        bar.style.animationDelay = index * 70 + "ms";
      }
      track.appendChild(bar);
      row.appendChild(track);
      row.appendChild(YASH.el("strong", { className: "yash-chart-value", text: String(value) }));
      chart.appendChild(row);
    });

    if (!series.length) {
      chart.appendChild(YASH.el("p", { className: "yash-block-note", text: block.emptyText || YASH.t("common.noData") }));
    }

    const children = [chart];
    if (block.unit) children.push(YASH.el("p", { className: "yash-block-note", text: "Unit: " + block.unit }));
    return shell("chart", block.title, children);
  }

  /* ----------------------------------------------------------------- timeline */

  function renderTimeline(block) {
    const list = YASH.el("ol", { className: "yash-timeline" });
    const items = Array.isArray(block.items) ? block.items : [];
    items.forEach(function (item) {
      const entry = YASH.el("li", { className: "yash-timeline-item" + toneClass(item.tone) });
      entry.appendChild(YASH.el("span", { className: "yash-timeline-dot", attrs: { "aria-hidden": "true" } }));
      const body = YASH.el("div", { className: "yash-timeline-body" });
      body.appendChild(YASH.el("strong", { text: item.title }));
      if (item.time) body.appendChild(YASH.el("time", { className: "yash-timeline-time", text: item.time }));
      if (item.detail) body.appendChild(YASH.el("p", { text: item.detail }));
      entry.appendChild(body);
      list.appendChild(entry);
    });
    if (!items.length) {
      list.appendChild(YASH.el("li", { className: "yash-block-note", text: block.emptyText || YASH.t("common.noData") }));
    }
    return shell("timeline", block.title, list);
  }

  /* ---------------------------------------------------------------- checklist */

  function renderChecklist(block) {
    const list = YASH.el("ul", { className: "yash-checklist" });
    const items = Array.isArray(block.items) ? block.items : [];
    items.forEach(function (item) {
      const state = item.done === true ? "done" : item.done === false ? "todo" : "info";
      const entry = YASH.el("li", { className: "yash-checklist-item is-" + state });
      const marker = YASH.el("span", { className: "yash-checklist-marker", attrs: { "aria-hidden": "true" } });
      if (item.done === true) marker.appendChild(YASH.svgNode("check", 12));
      entry.appendChild(marker);
      const body = YASH.el("div");
      body.appendChild(YASH.el("strong", { text: item.label }));
      if (item.detail) body.appendChild(YASH.el("p", { text: item.detail }));
      entry.appendChild(body);
      list.appendChild(entry);
    });
    if (!items.length) {
      list.appendChild(YASH.el("li", { className: "yash-block-note", text: block.emptyText || YASH.t("common.noData") }));
    }
    const children = [list];
    if (block.note) children.push(YASH.el("p", { className: "yash-block-note", text: block.note }));
    return shell("checklist", block.title, children);
  }

  YASH.blocks = {
    renderSummary: renderSummary,
    renderKpiGrid: renderKpiGrid,
    renderTable: renderTable,
    renderChart: renderChart,
    renderTimeline: renderTimeline,
    renderChecklist: renderChecklist
  };

  YASH.blockHelpers = {
    shell: shell,
    heading: heading,
    toneClass: toneClass,
    severityTone: severityTone,
    priorityTone: priorityTone,
    prefersReducedMotion: prefersReducedMotion,
    animateNumber: animateNumber
  };
})();
/* ==========================================================================
   Yash AI - Visual response system, part 2
   Remaining component types plus the response orchestrator and the plain-text
   exporter. Reuses the shell/helper primitives exported by part 1.
   ========================================================================== */
(function () {
  "use strict";

  const YASH = (window.YashAI = window.YashAI || {});
  const H = YASH.blockHelpers;
  const shell = H.shell;
  const toneClass = H.toneClass;
  const severityTone = H.severityTone;
  const priorityTone = H.priorityTone;
  const prefersReducedMotion = H.prefersReducedMotion;

  function actionButton(label, kind, onClick, tone, iconName) {
    const button = YASH.el("button", {
      className: "yash-action-button " + (kind || "ghost") + toneClass(tone),
      attrs: { type: "button" },
      on: onClick ? { click: onClick } : null
    });
    if (iconName) button.appendChild(YASH.svgNode(iconName, 14));
    button.appendChild(YASH.el("span", { text: label }));
    return button;
  }

  /* ------------------------------------------------------------------ warning */

  function renderWarning(block) {
    const body = YASH.el("div", { className: "yash-warning-body" + toneClass(severityTone(block.severity)) });
    body.appendChild(YASH.el("p", { className: "yash-warning-text", text: block.body || "" }));
    const bullets = Array.isArray(block.bullets) ? block.bullets : [];
    if (bullets.length) {
      const list = YASH.el("ul", { className: "yash-warning-list" });
      bullets.forEach(function (item) {
        list.appendChild(YASH.el("li", { text: item }));
      });
      body.appendChild(list);
    }
    return shell("warning", block.title || "Warning", body);
  }

  /* ----------------------------------------------------------- recommendation */

  function renderRecommendation(block) {
    const body = YASH.el("div", { className: "yash-recommendation-body" });
    body.appendChild(
      YASH.el("span", {
        className: "yash-priority-pill" + toneClass(priorityTone(block.priority)),
        text: "Priority: " + String(block.priority || "low").toUpperCase()
      })
    );
    if (block.body) body.appendChild(YASH.el("p", { text: block.body }));

    const reasons = Array.isArray(block.reasons) ? block.reasons : [];
    if (reasons.length) {
      const list = YASH.el("ul", { className: "yash-recommendation-reasons" });
      reasons.forEach(function (item) {
        list.appendChild(YASH.el("li", { text: typeof item === "string" ? item : item.text }));
      });
      body.appendChild(list);
    }

    const facts = YASH.el("dl", { className: "yash-fact-list" });
    if (block.relatedPage) {
      facts.appendChild(YASH.el("dt", { text: "Related page" }));
      facts.appendChild(YASH.el("dd", { text: block.relatedPage }));
    }
    if (block.source) {
      facts.appendChild(YASH.el("dt", { text: YASH.t("actions.source") }));
      facts.appendChild(YASH.el("dd", { text: block.source }));
    }
    facts.appendChild(YASH.el("dt", { text: YASH.t("meta.generated") }));
    facts.appendChild(YASH.el("dd", { text: YASH.formatDateTime(block.timestamp || YASH.nowIso()) }));
    body.appendChild(facts);

    if (Array.isArray(block.actions) && block.actions.length) {
      const row = YASH.el("div", { className: "yash-action-row" });
      block.actions.forEach(function (action) {
        row.appendChild(
          actionButton(action.label, action.kind || "ghost", function () {
            if (typeof action.run === "function") action.run();
            else if (action.route) YASH.navigate(action.route);
          }, action.tone, action.icon)
        );
      });
      body.appendChild(row);
    }

    return shell("recommendation", block.title || "Recommendation", body);
  }

  /* --------------------------------------------------------------------- task */

  function renderTask(block) {
    const body = YASH.el("div", { className: "yash-task-body" });
    const facts = YASH.el("dl", { className: "yash-fact-list" });
    const rows = [
      [YASH.t("task.assigned"), block.assignment || "Unassigned"],
      [YASH.t("task.due"), block.due || YASH.t("common.today")],
      [YASH.t("task.priority"), YASH.t("task.priority." + (block.priority || "medium"))],
      [YASH.t("task.reason"), block.reason || "\u2014"]
    ];
    rows.forEach(function (pair) {
      facts.appendChild(YASH.el("dt", { text: pair[0] }));
      facts.appendChild(YASH.el("dd", { text: pair[1] }));
    });
    body.appendChild(facts);
    if (block.note) body.appendChild(YASH.el("p", { className: "yash-block-note", text: block.note }));
    return shell("task", block.title || YASH.t("task.title"), body);
  }

  /* ------------------------------------------------------------------- report */

  function renderReport(block) {
    const body = YASH.el("div", { className: "yash-report-preview" });
    const paper = YASH.el("article", { className: "yash-report-paper" });
    paper.appendChild(YASH.el("h5", { className: "yash-report-heading", text: block.reportTitle || block.title || "Camp report" }));
    if (block.scope) paper.appendChild(YASH.el("p", { className: "yash-report-scope", text: block.scope }));

    const metrics = Array.isArray(block.metrics) ? block.metrics : [];
    if (metrics.length) {
      const grid = YASH.el("div", { className: "yash-report-metrics" });
      metrics.forEach(function (metric) {
        const cell = YASH.el("div", { className: "yash-report-metric" });
        cell.appendChild(YASH.el("strong", { text: String(metric.value) }));
        cell.appendChild(YASH.el("span", { text: metric.label }));
        grid.appendChild(cell);
      });
      paper.appendChild(grid);
    }

    const sections = Array.isArray(block.sections) ? block.sections : [];
    sections.forEach(function (section) {
      paper.appendChild(YASH.el("h6", { className: "yash-report-section-title", text: section.heading }));
      if (section.body) paper.appendChild(YASH.el("p", { text: section.body }));
      const items = Array.isArray(section.items) ? section.items : [];
      if (items.length) {
        const list = YASH.el("ul", { className: "yash-report-list" });
        items.forEach(function (item) {
          list.appendChild(YASH.el("li", { text: item }));
        });
        paper.appendChild(list);
      }
    });

    if (block.limitations && block.limitations.length) {
      paper.appendChild(YASH.el("h6", { className: "yash-report-section-title", text: YASH.t("meta.limitations") }));
      const list = YASH.el("ul", { className: "yash-report-list" });
      block.limitations.forEach(function (item) {
        list.appendChild(YASH.el("li", { text: item }));
      });
      paper.appendChild(list);
    }

    body.appendChild(paper);
    return shell("report", block.title || YASH.t("report.title"), body);
  }

  /* ------------------------------------------------------------------- poster */

  function renderPoster(block) {
    const body = YASH.el("div", { className: "yash-poster-preview" });
    const poster = YASH.el("article", {
      className: "yash-poster-sheet theme-" + (block.theme || "healthcare-blue"),
      attrs: { "data-poster-theme": block.theme || "healthcare-blue" }
    });
    poster.appendChild(YASH.el("span", { className: "yash-poster-ribbon", text: block.organizer || YASH.t("brand.product") }));
    poster.appendChild(YASH.el("h5", { className: "yash-poster-title", text: block.posterTitle || block.title || "" }));
    if (block.subtitle) poster.appendChild(YASH.el("p", { className: "yash-poster-subtitle", text: block.subtitle }));

    const services = Array.isArray(block.services) ? block.services : [];
    if (services.length) {
      const grid = YASH.el("div", { className: "yash-poster-services" });
      services.forEach(function (service) {
        const card = YASH.el("div", { className: "yash-poster-service" });
        card.appendChild(YASH.svgNode(service.icon || "pulse", 15));
        card.appendChild(YASH.el("span", { text: service.label || service }));
        grid.appendChild(card);
      });
      poster.appendChild(grid);
    }

    const fields = Array.isArray(block.fields) ? block.fields : [];
    if (fields.length) {
      const dl = YASH.el("dl", { className: "yash-poster-fields" });
      fields.forEach(function (field) {
        dl.appendChild(YASH.el("dt", { text: field.label }));
        dl.appendChild(YASH.el("dd", { text: field.value || "\u2014" }));
      });
      poster.appendChild(dl);
    }

    if (block.cta) poster.appendChild(YASH.el("p", { className: "yash-poster-cta", text: block.cta }));
    poster.appendChild(YASH.el("p", { className: "yash-poster-footer", text: block.footer || YASH.t("poster.footer") }));
    body.appendChild(poster);
    return shell("poster", block.title || YASH.t("poster.title"), body);
  }

  /* -------------------------------------------------------------- translation */

  function renderTranslation(block) {
    const body = YASH.el("div", { className: "yash-translation" });
    const grid = YASH.el("div", { className: "yash-translation-grid" });
    const left = YASH.el("div", { className: "yash-translation-column" });
    left.appendChild(YASH.el("span", { className: "yash-translation-lang", text: block.sourceLabel || block.source }));
    left.appendChild(YASH.el("p", { className: "yash-translation-text", text: block.original || "" }));
    const right = YASH.el("div", { className: "yash-translation-column output" });
    right.appendChild(YASH.el("span", { className: "yash-translation-lang", text: block.targetLabel || block.target }));
    right.appendChild(YASH.el("p", { className: "yash-translation-text", text: block.translated || "" }));
    right.appendChild(
      YASH.el("span", {
        className: "yash-review-badge " + (block.reviewed ? "is-reviewed" : "needs-review"),
        text: block.reviewed ? YASH.t("translate.reviewed") : YASH.t("translate.machine")
      })
    );
    grid.appendChild(left);
    grid.appendChild(right);
    body.appendChild(grid);

    const notes = Array.isArray(block.qualityNotes) ? block.qualityNotes : [];
    if (notes.length) {
      const list = YASH.el("ul", { className: "yash-translation-notes" });
      notes.forEach(function (note) {
        list.appendChild(YASH.el("li", { text: note }));
      });
      body.appendChild(list);
    }

    body.appendChild(YASH.el("p", { className: "yash-block-note", text: YASH.TRANSLATION_DISCLAIMER }));
    return shell("translation", block.title || YASH.t("translate.title"), body);
  }

  /* -------------------------------------------------------------- data quality */

  function dataQualityRow(issue, options) {
    const row = YASH.el("li", {
      className: "yash-quality-item severity-" + issue.severity + (issue.reviewed ? " is-reviewed" : ""),
      attrs: { "data-issue-id": issue.id }
    });
    const head = YASH.el("div", { className: "yash-quality-head" });
    head.appendChild(
      YASH.el("span", {
        className: "yash-severity-pill" + toneClass(severityTone(issue.severity)),
        text: YASH.t("quality." + issue.severity)
      })
    );
    head.appendChild(YASH.el("strong", { text: issue.title }));
    row.appendChild(head);
    row.appendChild(YASH.el("p", { text: issue.detail }));

    const facts = YASH.el("dl", { className: "yash-fact-list" });
    facts.appendChild(YASH.el("dt", { text: YASH.t("quality.record") }));
    facts.appendChild(
      YASH.el("dd", {
        text: options && options.hideRefs ? "Pseudonymous demo record" : issue.ref
      })
    );
    facts.appendChild(YASH.el("dt", { text: YASH.t("quality.fix") }));
    facts.appendChild(YASH.el("dd", { text: issue.suggestedFix }));
    row.appendChild(facts);

    if (!options || options.showActions !== false) {
      const actions = YASH.el("div", { className: "yash-action-row" });
      actions.appendChild(
        actionButton(
          issue.reviewed ? YASH.t("actions.reviewedShort") : YASH.t("actions.reviewed"),
          "outline",
          function () {
            YASH.actions.request({
              type: "markDataQualityIssueReviewed",
              title: "Mark data-quality issue reviewed",
              summary: [
                { label: "Issue", value: issue.title },
                { label: "Record", value: options && options.hideRefs ? "Pseudonymous demo record" : issue.ref }
              ],
              reason: "Reviewing an issue records human oversight. It does not change the underlying demo record.",
              payload: { issueId: issue.id }
            });
          },
          null,
          "check"
        )
      );
      actions.appendChild(
        actionButton(YASH.t("actions.fix"), "ghost", function () {
          YASH.navigate(issue.relatedRoute || "data-quality");
          YASH.notify("Open the related workspace to fix this fictional record manually.", "info");
        }, null, "arrow")
      );
      actions.appendChild(
        actionButton(YASH.t("actions.dismiss"), "ghost", function () {
          YASH.dismiss("issue:" + issue.id);
        }, null, "flag")
      );
      row.appendChild(actions);
    }
    return row;
  }

  function renderDataQuality(block) {
    const body = YASH.el("div", { className: "yash-quality-body" });
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) {
      body.appendChild(YASH.el("p", { className: "yash-block-note", text: YASH.t("quality.empty") }));
    } else {
      const grouped = { high: [], medium: [], low: [] };
      items.forEach(function (issue) {
        (grouped[issue.severity] || grouped.low).push(issue);
      });
      ["high", "medium", "low"].forEach(function (severity) {
        if (!grouped[severity].length) return;
        body.appendChild(
          YASH.el("h5", {
            className: "yash-quality-group-title" + toneClass(severityTone(severity)),
            text: YASH.t("quality." + severity) + " \u00B7 " + grouped[severity].length
          })
        );
        const list = YASH.el("ul", { className: "yash-quality-list" });
        grouped[severity].forEach(function (issue) {
          list.appendChild(dataQualityRow(issue, block.rowOptions));
        });
        body.appendChild(list);
      });
    }
    body.appendChild(YASH.el("p", { className: "yash-block-note", text: YASH.t("quality.noSilentChange") }));
    return shell("dataQuality", block.title || YASH.t("quality.title"), body);
  }

  /* -------------------------------------------------------------- navigation */

  function renderNavigation(block) {
    const body = YASH.el("div", { className: "yash-navigation-body" });
    body.appendChild(YASH.el("p", { text: block.description || "" }));
    const facts = YASH.el("dl", { className: "yash-fact-list" });
    facts.appendChild(YASH.el("dt", { text: "Route" }));
    facts.appendChild(YASH.el("dd", { text: "/" + (block.route || "") }));
    if (block.permissionNote) {
      facts.appendChild(YASH.el("dt", { text: "Permission" }));
      facts.appendChild(YASH.el("dd", { text: block.permissionNote }));
    }
    body.appendChild(facts);
    const row = YASH.el("div", { className: "yash-action-row" });
    row.appendChild(
      actionButton(YASH.t("actions.open"), "primary", function () {
        YASH.navigate(block.route);
      }, null, "arrow")
    );
    body.appendChild(row);
    return shell("navigation", block.title || "Navigation", body);
  }

  /* ------------------------------------------------------------ confirmation */

  function renderConfirmation(block) {
    const body = YASH.el("div", { className: "yash-confirmation-body" });
    body.appendChild(
      YASH.el("p", {
        className: "yash-confirmation-lead",
        text: "Yash AI wants to perform an action. Nothing changes until you confirm."
      })
    );
    const facts = YASH.el("dl", { className: "yash-fact-list" });
    (Array.isArray(block.summary) ? block.summary : []).forEach(function (pair) {
      facts.appendChild(YASH.el("dt", { text: pair.label }));
      facts.appendChild(YASH.el("dd", { text: pair.value }));
    });
    if (block.reason) {
      facts.appendChild(YASH.el("dt", { text: YASH.t("task.reason") }));
      facts.appendChild(YASH.el("dd", { text: block.reason }));
    }
    body.appendChild(facts);

    const row = YASH.el("div", { className: "yash-action-row yash-confirmation-actions" });
    row.appendChild(
      actionButton(YASH.t("actions.cancel"), "ghost", function () {
        YASH.actions.resolve(block.actionId, "cancel");
      }, null, "stop")
    );
    row.appendChild(
      actionButton(YASH.t("actions.edit"), "outline", function () {
        YASH.actions.resolve(block.actionId, "edit");
      }, null, "task")
    );
    row.appendChild(
      actionButton(YASH.t("actions.confirm"), "primary", function () {
        YASH.actions.resolve(block.actionId, "confirm");
      }, "success", "check")
    );
    body.appendChild(row);

    const node = shell("confirmation", block.title || "Confirmation required", body);
    node.setAttribute("data-confirmation-id", block.actionId);
    return node;
  }

  /* ------------------------------------------------------------------- safety */

  function renderSafety(block) {
    const body = YASH.el("div", { className: "yash-safety-body" });
    body.appendChild(
      YASH.el("span", {
        className: "yash-severity-pill" + toneClass(severityTone(block.severity)),
        text: block.severity === "high" ? "Restricted request" : "Limited request"
      })
    );
    body.appendChild(YASH.el("p", { className: "yash-safety-reason", text: block.reason || "" }));
    if (block.alternative) {
      const alt = YASH.el("div", { className: "yash-safety-alternative" });
      alt.appendChild(YASH.el("strong", { text: "What I can do instead" }));
      alt.appendChild(YASH.el("p", { text: block.alternative }));
      body.appendChild(alt);
    }
    const row = YASH.el("div", { className: "yash-action-row" });
    row.appendChild(
      actionButton("Open Safety Center", "ghost", function () {
        YASH.navigate("yash-ai/safety");
      }, null, "lock")
    );
    body.appendChild(row);
    return shell("safety", block.title || YASH.t("safety.refused"), body);
  }

  /* -------------------------------------------------------------------- plain */

  function renderPlain(block) {
    const body = YASH.el("div", { className: "yash-plain-body" });
    String(block.text || "")
      .split(/\n{2,}/)
      .forEach(function (paragraph) {
        const trimmed = paragraph.trim();
        if (trimmed) body.appendChild(YASH.el("p", { text: trimmed }));
      });
    return shell("plain", block.title || "", body);
  }

  /* ------------------------------------------------------- renderer dispatch */

  const RENDERERS = {
    summary: YASH.blocks.renderSummary,
    kpi: YASH.blocks.renderKpiGrid,
    table: YASH.blocks.renderTable,
    chart: YASH.blocks.renderChart,
    timeline: YASH.blocks.renderTimeline,
    checklist: YASH.blocks.renderChecklist,
    warning: renderWarning,
    recommendation: renderRecommendation,
    task: renderTask,
    report: renderReport,
    poster: renderPoster,
    translation: renderTranslation,
    dataQuality: renderDataQuality,
    navigation: renderNavigation,
    confirmation: renderConfirmation,
    safety: renderSafety,
    plain: renderPlain
  };

  YASH.renderBlock = function (block) {
    if (!block || !block.type) return null;
    const renderer = RENDERERS[block.type] || renderPlain;
    try {
      return renderer(block);
    } catch (error) {
      return renderPlain({ text: "This card could not be displayed.", title: YASH.BLOCK_LABEL[block.type] || "Result" });
    }
  };

  /* ------------------------------------------------------------- mode badge */

  function modeBadge(mode) {
    const label =
      mode === "real"
        ? YASH.t("mode.real")
        : mode === "fallback"
          ? YASH.t("mode.fallback")
          : YASH.t("mode.demo.short");
    return YASH.el("span", { className: "yash-mode-badge mode-" + mode, text: label });
  }

  /* --------------------------------------------------------- response footer */

  function metaStrip(response) {
    const meta = response.meta;
    const wrapper = YASH.el("footer", { className: "yash-response-meta" });
    const toggle = YASH.el("button", {
      className: "yash-meta-toggle",
      attrs: { type: "button", "aria-expanded": "false" },
      text: YASH.t("meta.show")
    });
    const panel = YASH.el("dl", { className: "yash-meta-panel", attrs: { hidden: "hidden" } });

    const rows = [
      [YASH.t("meta.source"), meta.source],
      [YASH.t("meta.range"), meta.dateRange],
      [YASH.t("meta.generated"), YASH.formatDateTime(meta.generatedAt)],
      [YASH.t("meta.mode"), meta.mode === "real" ? YASH.t("mode.real") : YASH.t("mode.demo.short")],
      [YASH.t("meta.confidence"), meta.confidence],
      [YASH.t("meta.review"), meta.reviewed ? YASH.t("meta.reviewed") : YASH.t("meta.notReviewed")],
      [YASH.t("meta.fictional"), YASH.t("meta.fictional.value")]
    ];
    rows.forEach(function (pair) {
      panel.appendChild(YASH.el("dt", { text: pair[0] }));
      panel.appendChild(YASH.el("dd", { text: pair[1] }));
    });

    if (meta.limitations && meta.limitations.length) {
      const listWrap = YASH.el("div", { className: "yash-meta-limitations" });
      listWrap.appendChild(YASH.el("dt", { text: YASH.t("meta.limitations") }));
      const list = YASH.el("ul");
      meta.limitations.forEach(function (item) {
        list.appendChild(YASH.el("li", { text: item }));
      });
      listWrap.appendChild(list);
      panel.appendChild(listWrap);
    }

    toggle.addEventListener("click", function () {
      const open = panel.hasAttribute("hidden");
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "hidden");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? YASH.t("meta.hide") : YASH.t("meta.show");
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(panel);

    if (meta.reviewRequired && !meta.reviewed) {
      wrapper.appendChild(
        YASH.el("span", { className: "yash-review-flag needs-review", text: YASH.t("meta.reviewRequired") })
      );
    }
    return wrapper;
  }

  /* ------------------------------------------------------- response assembly */

  /**
   * Build the assistant message DOM for a structured response.
   * options.onRetry / options.onFeedback / options.onReport are optional hooks
   * supplied by the chat panel.
   */
  YASH.renderResponse = function (response, options) {
    const settings = options || {};
    const article = YASH.el("article", {
      className: "yash-response",
      attrs: { "data-response-id": response.id, "data-kind": response.kind }
    });

    const head = YASH.el("header", { className: "yash-response-head" });
    head.appendChild(
      YASH.el("span", { className: "yash-response-avatar", attrs: { "aria-hidden": "true" } }, YASH.svgNode("sparkle", 15))
    );
    const headText = YASH.el("div", { className: "yash-response-headtext" });
    headText.appendChild(YASH.el("strong", { text: YASH.t("chat.assistant") }));
    headText.appendChild(
      YASH.el("time", { className: "yash-response-time", text: YASH.formatClock(new Date()) })
    );
    head.appendChild(headText);
    head.appendChild(modeBadge(response.meta.mode));
    article.appendChild(head);

    if (response.title) {
      article.appendChild(YASH.el("h3", { className: "yash-response-title", text: response.title }));
    }
    if (response.explanation) {
      article.appendChild(YASH.el("p", { className: "yash-response-explanation", text: response.explanation }));
    }

    const blockHolder = YASH.el("div", { className: "yash-block-stack" });
    response.blocks.forEach(function (block) {
      const node = YASH.renderBlock(block);
      if (node) blockHolder.appendChild(node);
    });
    if (!response.blocks.length) {
      blockHolder.appendChild(YASH.el("p", { className: "yash-block-note", text: YASH.t("common.noData") }));
    }
    article.appendChild(blockHolder);

    if (Array.isArray(response.actions) && response.actions.length) {
      const row = YASH.el("div", { className: "yash-action-row yash-response-actions" });
      response.actions.forEach(function (action) {
        row.appendChild(
          actionButton(action.label, action.kind || "ghost", function () {
            if (typeof action.run === "function") action.run();
            else if (action.route) YASH.navigate(action.route);
          }, action.tone, action.icon)
        );
      });
      article.appendChild(row);
    }

    article.appendChild(metaStrip(response));

    /* Per-response utility row: copy, print, export, feedback. */
    const utilities = YASH.el("div", { className: "yash-response-utilities" });
    if (settings.showUtilities !== false) {
      utilities.appendChild(
        YASH.iconButton("copy", YASH.t("chat.copy"), function () {
          YASH.copyText(YASH.responseToText(response)).then(function (ok) {
            YASH.notify(ok ? "Response copied." : "Copy is unavailable in this browser.", ok ? "success" : "info");
          });
        })
      );
      utilities.appendChild(
        YASH.iconButton("print", YASH.t("chat.print"), function () {
          YASH.printResponse(response);
        })
      );
      utilities.appendChild(
        YASH.iconButton("thumbsUp", YASH.t("chat.helpful"), function () {
          YASH.feedback.record(response, "helpful");
        })
      );
      utilities.appendChild(
        YASH.iconButton("thumbsDown", YASH.t("chat.notHelpful"), function () {
          YASH.feedback.openForm(response);
        })
      );
      utilities.appendChild(
        YASH.iconButton("flag", YASH.t("chat.report"), function () {
          YASH.feedback.openForm(response, "report");
        })
      );
    }
    article.appendChild(utilities);

    return article;
  };

  /* ------------------------------------------------------ plain-text exporter */

  function blockToText(block) {
    const lines = [];
    lines.push("[" + (YASH.BLOCK_LABEL[block.type] || "Result") + "]");
    if (block.title) lines.push(block.title);

    switch (block.type) {
      case "summary":
        if (block.text) lines.push(block.text);
        (block.points || []).forEach(function (point) {
          lines.push(" - " + (typeof point === "string" ? point : point.text));
        });
        break;
      case "kpi":
        (block.items || []).forEach(function (item) {
          lines.push(" - " + item.label + ": " + item.value);
        });
        break;
      case "table":
        lines.push((block.columns || []).join(" | "));
        (block.rows || []).forEach(function (row) {
          lines.push(row.join(" | "));
        });
        break;
      case "chart":
        (block.series || []).forEach(function (item) {
          lines.push(" - " + item.label + ": " + item.value);
        });
        break;
      case "timeline":
        (block.items || []).forEach(function (item) {
          lines.push(" - " + (item.time ? item.time + " \u00B7 " : "") + item.title + (item.detail ? ": " + item.detail : ""));
        });
        break;
      case "checklist":
        (block.items || []).forEach(function (item) {
          lines.push(" [" + (item.done === true ? "x" : item.done === false ? " " : "-") + "] " + item.label);
        });
        break;
      case "warning":
        lines.push(block.body || "");
        (block.bullets || []).forEach(function (item) {
          lines.push(" - " + item);
        });
        break;
      case "recommendation":
        lines.push("Priority: " + block.priority);
        if (block.body) lines.push(block.body);
        (block.reasons || []).forEach(function (item) {
          lines.push(" - " + (typeof item === "string" ? item : item.text));
        });
        break;
      case "task":
        lines.push("Assigned to: " + (block.assignment || "Unassigned"));
        lines.push("Due: " + (block.due || "Today"));
        lines.push("Reason: " + (block.reason || "-"));
        break;
      case "report":
        if (block.scope) lines.push(block.scope);
        (block.metrics || []).forEach(function (metric) {
          lines.push(" - " + metric.label + ": " + metric.value);
        });
        (block.sections || []).forEach(function (section) {
          lines.push("");
          lines.push(section.heading);
          if (section.body) lines.push(section.body);
          (section.items || []).forEach(function (item) {
            lines.push(" - " + item);
          });
        });
        break;
      case "poster":
        if (block.subtitle) lines.push(block.subtitle);
        (block.fields || []).forEach(function (field) {
          lines.push(" - " + field.label + ": " + field.value);
        });
        (block.services || []).forEach(function (service) {
          lines.push(" - " + (service.label || service));
        });
        if (block.cta) lines.push(block.cta);
        break;
      case "translation":
        lines.push("Source (" + block.source + "): " + block.original);
        lines.push("Draft (" + block.target + "): " + block.translated);
        (block.qualityNotes || []).forEach(function (note) {
          lines.push(" - " + note);
        });
        break;
      case "dataQuality":
        (block.items || []).forEach(function (issue) {
          lines.push(" - [" + issue.severity + "] " + issue.title + " (" + issue.ref + ")");
          lines.push("   Fix: " + issue.suggestedFix);
        });
        break;
      case "navigation":
        lines.push(block.description || "");
        lines.push("Route: /" + block.route);
        break;
      case "confirmation":
        (block.summary || []).forEach(function (pair) {
          lines.push(" - " + pair.label + ": " + pair.value);
        });
        break;
      case "safety":
        lines.push(block.reason || "");
        if (block.alternative) lines.push("Instead: " + block.alternative);
        break;
      default:
        lines.push(block.text || "");
    }
    lines.push("");
    return lines.join("\n");
  }

  YASH.responseToText = function (response) {
    const lines = [];
    lines.push("Yash AI \u2014 " + YASH.APP.subtitle);
    lines.push("Mode: " + (response.meta.mode === "real" ? "Real AI" : "Demo AI"));
    lines.push("");
    if (response.title) lines.push(response.title);
    if (response.explanation) lines.push(response.explanation);
    lines.push("");
    response.blocks.forEach(function (block) {
      lines.push(blockToText(block));
    });
    lines.push("Data source: " + response.meta.source);
    lines.push("Date range: " + response.meta.dateRange);
    lines.push("Generated: " + YASH.formatDateTime(response.meta.generatedAt));
    lines.push("Confidence: " + response.meta.confidence);
    lines.push("Human review: " + (response.meta.reviewed ? "Reviewed" : "Not reviewed"));
    lines.push("");
    lines.push(YASH.WARNING);
    lines.push(YASH.DEMO_LINE);
    return lines.join("\n");
  };

  YASH.printResponse = function (response) {
    const holder = document.createElement("div");
    response.blocks.forEach(function (block) {
      const node = YASH.renderBlock(block);
      if (node) holder.appendChild(node);
    });
    const notice = document.createElement("p");
    notice.style.marginTop = "16px";
    notice.style.fontSize = "11px";
    notice.textContent = YASH.WARNING + " " + YASH.DEMO_LINE;
    holder.appendChild(notice);
    YASH.printNode(holder, response.title || YASH.APP.name);
  };

  YASH.blocks.renderWarning = renderWarning;
  YASH.blocks.renderRecommendation = renderRecommendation;
  YASH.blocks.renderTask = renderTask;
  YASH.blocks.renderReport = renderReport;
  YASH.blocks.renderPoster = renderPoster;
  YASH.blocks.renderTranslation = renderTranslation;
  YASH.blocks.renderDataQuality = renderDataQuality;
  YASH.blocks.renderNavigation = renderNavigation;
  YASH.blocks.renderConfirmation = renderConfirmation;
  YASH.blocks.renderSafety = renderSafety;
  YASH.blocks.renderPlain = renderPlain;
  YASH.blocks.renderSafetyResponse = renderSafety;
  YASH.modeBadge = modeBadge;
  YASH.metaStrip = metaStrip;
})();
