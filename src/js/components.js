// src/js/components.js
// Lightweight component rendering helpers for vanilla JS SPA

/**
 * Renders a component from a <template> element.
 * @param {string} templateId - The id of the <template> element
 * @param {Object} options
 * @param {string} [options.extraClass] - Additional CSS class to add to root element
 * @param {string} [options.variant] - data-variant value for styling
 * @returns {Element|null}
 */
export function renderComponent(templateId, { extraClass = '', variant = '' } = {}) {
  const tpl = document.getElementById(templateId);
  if (!tpl) {
    console.warn(`[components] Template not found: #${templateId}`);
    return null;
  }
  const clone = tpl.content.cloneNode(true);
  const root = clone.firstElementChild;
  if (!root) return null;
  if (extraClass) extraClass.split(' ').forEach(c => c && root.classList.add(c));
  if (variant) root.dataset.variant = variant;
  return root;
}

/**
 * Mounts a component into a container, injecting content via a dataMap.
 * @param {Object} opts
 * @param {string} opts.containerSelector - CSS selector for the container
 * @param {string} opts.templateId - id of <template> element
 * @param {Object} opts.dataMap - { [cssSelector]: innerHTML } to inject
 * @param {string} [opts.extraClass]
 * @param {string} [opts.variant]
 */
export function mountComponent({ containerSelector, templateId, dataMap = {}, extraClass = '', variant = '' }) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const el = renderComponent(templateId, { extraClass, variant });
  if (!el) return;

  Object.entries(dataMap).forEach(([selector, html]) => {
    const target = selector === 'root' ? el : el.querySelector(selector);
    if (target) target.innerHTML = html;
  });

  container.appendChild(el);
  return el;
}
