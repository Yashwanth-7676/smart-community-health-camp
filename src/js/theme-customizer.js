// src/js/theme-customizer.js – Live visual theme customizer panel

const STORAGE_KEY = 'smartcareCustomTheme';

const DEFAULTS = {
  '--teal':      '#0d9488',
  '--teal-soft': '#14b8a6',
  '--radius':    '18px',
};

function applyVars(vars) {
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
}

function save(vars) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vars)); } catch {}
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function buildPanel() {
  // Floating toggle button
  const toggle = document.createElement('button');
  toggle.id = 'customizerToggle';
  toggle.title = 'Theme customizer';
  toggle.setAttribute('aria-label', 'Open theme customizer');
  toggle.setAttribute('type', 'button');
  toggle.textContent = '🎨';
  document.body.appendChild(toggle);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'themeCustomizer';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Theme customizer');
  panel.innerHTML = `
    <h3>Customizer</h3>
    <div class="customizer-row">
      <label for="custPrimary">Primary color</label>
      <input type="color" id="custPrimary" aria-label="Primary color" />
    </div>
    <div class="customizer-row">
      <label for="custAccent">Accent color</label>
      <input type="color" id="custAccent" aria-label="Accent color" />
    </div>
    <div class="customizer-row">
      <label for="custRadius">Border radius <span id="custRadiusVal">18</span>px</label>
      <input type="range" id="custRadius" min="0" max="28" value="18" aria-label="Border radius" />
    </div>
    <div class="customizer-row">
      <label for="custFont">Heading font</label>
      <select id="custFont" aria-label="Heading font">
        <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
        <option value="'Inter', sans-serif">Inter</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="system-ui, sans-serif">System UI</option>
      </select>
    </div>
    <button class="customizer-reset" id="customizerReset" type="button">↩ Reset to default</button>
  `;
  document.body.appendChild(panel);

  // Toggle open/close
  toggle.addEventListener('click', () => panel.classList.toggle('open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') panel.classList.remove('open');
  });

  // Get elements
  const primary = panel.querySelector('#custPrimary');
  const accent  = panel.querySelector('#custAccent');
  const radius  = panel.querySelector('#custRadius');
  const radVal  = panel.querySelector('#custRadiusVal');
  const font    = panel.querySelector('#custFont');

  // Load saved values
  const saved = { ...DEFAULTS, ...load() };
  primary.value = saved['--teal']   || '#0d9488';
  accent.value  = saved['--teal-soft'] || '#14b8a6';
  radius.value  = parseInt(saved['--radius'] || 18);
  if (radVal) radVal.textContent = radius.value;
  applyVars(saved);

  function update() {
    const vars = {
      '--teal':      primary.value,
      '--teal-soft': accent.value,
      '--radius':    radius.value + 'px',
    };
    applyVars(vars);
    save(vars);
    if (radVal) radVal.textContent = radius.value;
  }

  primary.addEventListener('input', update);
  accent.addEventListener('input', update);
  radius.addEventListener('input', () => { update(); });

  font.addEventListener('change', () => {
    document.documentElement.style.setProperty('--font-heading', font.value);
  });

  panel.querySelector('#customizerReset').addEventListener('click', () => {
    applyVars(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    primary.value = '#0d9488';
    accent.value  = '#14b8a6';
    radius.value  = 18;
    if (radVal) radVal.textContent = 18;
    document.documentElement.style.removeProperty('--font-heading');
  });
}

document.addEventListener('DOMContentLoaded', buildPanel);
