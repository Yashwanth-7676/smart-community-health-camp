// src/js/init-components.js
// This script initializes dynamic components based on the content configuration.
import { content } from "../config/content.js";
import { mountComponent } from "./components.js";
import { initScrollReveal } from "./animations.js";

/** Helper to mount a list of items using a template */
function mountList({ containerSelector, templateId, items, mapItem }) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  // Clear existing content (e.g., static markup)
  container.innerHTML = "";
  items.forEach(item => {
    const dataMap = mapItem(item);
    mountComponent({
      containerSelector,
      templateId,
      dataMap,
      extraClass: "reveal-on-scroll",
    });
  });
}

// When DOM is ready, mount all sections
window.addEventListener("DOMContentLoaded", () => {
  // Capabilities cards
  mountList({
    containerSelector: ".capability-grid",
    templateId: "card-template",
    items: content.capabilities,
    mapItem: item => ({
      ".card-icon": `<div class="card-icon">${item.icon}</div>`,
      "h3": item.title,
      "p": item.text,
      ".capability-card-action": `<span class="capability-card-action">Open ${item.title.toLowerCase()} <span aria-hidden="true">→</span></span>`,
      "a": `<a class="capability-card capability-link" href="${item.link}" aria-label="Open ${item.title} workspace"></a>`
    })
  });

  // Workflow steps (using workflow-item template)
  mountList({
    containerSelector: ".workflow-grid",
    templateId: "workflow-item-template",
    items: content.workflowSteps,
    mapItem: step => ({
      "span": step.step,
      ".workflow-label": step.label
    })
  });

  // Testimonials
  if (document.querySelector("#testimonials .testimonials-grid")) {
    mountList({
      containerSelector: "#testimonials .testimonials-grid",
      templateId: "testimonial-card-template",
      items: content.testimonials,
      mapItem: t => ({
        ".testimonial-quote": `<p class="testimonial-quote">\"${t.quote}\"</p>`,
        ".testimonial-author": `<p class="testimonial-author"><strong>${t.author}</strong>, ${t.role}</p>`
      })
    });
  }

  // Pricing cards
  if (document.querySelector("#pricing .pricing-grid")) {
    mountList({
      containerSelector: "#pricing .pricing-grid",
      templateId: "pricing-card-template",
      items: content.pricing,
      mapItem: p => ({
        ".plan-name": `<h3 class="plan-name">${p.plan}</h3>`,
        ".plan-price": `<p class="plan-price">${p.price}</p>`,
        ".plan-features": `<ul class="plan-features">${p.features.map(f => `<li>${f}</li>`).join("")}</ul>`
      })
    });
  }

  // FAQ items
  if (document.querySelector("#faq .faq-list")) {
    mountList({
      containerSelector: "#faq .faq-list",
      templateId: "faq-item-template",
      items: content.faq,
      mapItem: q => ({
        ".faq-question": `<button class="faq-question" type="button">${q.question}</button>`,
        ".faq-answer": `<div class="faq-answer"><p>${q.answer}</p></div>`
      })
    });
  }

  // Initialize scroll reveal animations
  initScrollReveal();
});
