/**
 * SignalOne - Settings Module V1.0 (Context-kompatibel)
 *
 * ✅ Wichtig: KEIN direkter Import von core-api.js
 * ✅ Alles läuft über Module Context (ctx) + coreAction Events
 * ✅ Saved in localStorage
 */

export const meta = {
  id: 'settings',
  label: 'Settings',
  requiresData: false
};

// Module Context (von app.js)
let ctx = null;

// Settings State
let settings = {
  theme: 'light', // light, dark, auto
  language: 'de', // de, en
  timezone: 'Europe/Berlin',
  currency: 'EUR',
  numberFormat: 'de', // de: 1.000,00 | en: 1,000.00
  dateFormat: 'DD.MM.YYYY' // DD.MM.YYYY | MM/DD/YYYY | YYYY-MM-DD
};

function getLiveState() {
  // ctx.appState ist ein Snapshot; für UI-Reflektion (Mode/MetaConnected)
  // nehmen wir, wenn vorhanden, den globalen Single-Source-State.
  return (window.SignalOne && window.SignalOne.AppState) ? window.SignalOne.AppState : (ctx?.appState || {});
}

function toast(message, type = 'info') {
  if (ctx?.showToast) return ctx.showToast(message, type);
  if (window.SignalOne?.showToast) return window.SignalOne.showToast(message, type);
  // fallback: silent
}

function setMode(mode) {
  window.dispatchEvent(new CustomEvent('coreAction', {
    detail: { action: 'setMode', payload: { mode } }
  }));
}

export async function render(container, context) {
  ctx = context || ctx;

  loadSettings();
  loadModuleCSS();

  const state = getLiveState();

  container.innerHTML = `
    <div class="settings-container">

      <!-- HEADER -->
      <div class="settings-header">
        <h1>⚙️ Einstellungen</h1>
        <p>Plattform-Konfiguration und Präferenzen</p>
      </div>

      <!-- SIDEBAR TABS -->
      <div class="settings-layout">
        <div class="settings-sidebar">
          <button class="settings-tab active" data-tab="mode">
            <span>🎮</span>
            <span>Datenmodus</span>
          </button>
          <button class="settings-tab" data-tab="appearance">
            <span>🎨</span>
            <span>Darstellung</span>
          </button>
          <button class="settings-tab" data-tab="preferences">
            <span>🔧</span>
            <span>Präferenzen</span>
          </button>
          <button class="settings-tab" data-tab="account">
            <span>👤</span>
            <span>Account</span>
          </button>
          <button class="settings-tab" data-tab="integrations">
            <span>🔌</span>
            <span>Integrationen</span>
          </button>
          <button class="settings-tab" data-tab="about">
            <span>ℹ️</span>
            <span>Über</span>
          </button>
        </div>

        <!-- CONTENT AREA -->
        <div class="settings-content">

          <!-- 1. DATA MODE -->
          <div class="settings-section active" data-section="mode">
            ${renderDataMode(state)}
          </div>

          <!-- 2. APPEARANCE -->
          <div class="settings-section" data-section="appearance">
            ${renderAppearance()}
          </div>

          <!-- 3. PREFERENCES -->
          <div class="settings-section" data-section="preferences">
            ${renderPreferences()}
          </div>

          <!-- 4. ACCOUNT -->
          <div class="settings-section" data-section="account">
            ${renderAccount()}
          </div>

          <!-- 5. INTEGRATIONS -->
          <div class="settings-section" data-section="integrations">
            ${renderIntegrations(state)}
          </div>

          <!-- 6. ABOUT -->
          <div class="settings-section" data-section="about">
            ${renderAbout()}
          </div>

        </div>
      </div>

    </div>
  `;

  bindEvents(container);
  applyTheme();
}

function renderDataMode(state) {
  const mode = state?.mode || 'demo';
  return `
    <h2>🎮 Datenmodus</h2>
    <p class="section-intro">Wähle zwischen Live-Daten (echte Meta Ads) oder Demo-Daten (Test-Brands)</p>

    <div class="mode-buttons">
      <button class="mode-card ${mode === 'live' ? 'active' : ''}" data-mode="live">
        <div class="mode-icon">🚀</div>
        <div class="mode-title">Live Mode</div>
        <div class="mode-desc">Echte Kampagnendaten</div>
        ${mode === 'live' ? '<div class="mode-badge">✅ Aktiv</div>' : ''}
      </button>

      <button class="mode-card ${mode === 'demo' ? 'active' : ''}" data-mode="demo">
        <div class="mode-icon">🎮</div>
        <div class="mode-title">Demo Mode</div>
        <div class="mode-desc">8 Test-Brands verfügbar</div>
        ${mode === 'demo' ? '<div class="mode-badge">✅ Aktiv</div>' : ''}
      </button>
    </div>

    <div class="info-box">
      <strong>${mode === 'live' ? '🚀 Live Mode:' : '🎮 Demo Mode:'}</strong>
      ${mode === 'live'
        ? 'Verbinde dich mit Meta Ads, Google Ads oder TikTok Ads für echte Daten.'
        : 'Nutze realistische Demo-Daten mit 8 verschiedenen Brands zum Testen.'}
    </div>
  `;
}

function renderAppearance() {
  return `
    <h2>🎨 Darstellung</h2>
    <p class="section-intro">Passe das Aussehen der Plattform an</p>

    <!-- THEME -->
    <div class="setting-group">
      <label class="setting-label">Theme</label>
      <div class="theme-buttons">
        <button class="theme-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme="light">
          <span>☀️</span><span>Light</span>
        </button>
        <button class="theme-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
          <span>🌙</span><span>Dark</span>
        </button>
        <button class="theme-btn ${settings.theme === 'auto' ? 'active' : ''}" data-theme="auto">
          <span>🔄</span><span>Auto</span>
        </button>
      </div>
    </div>

    <!-- LANGUAGE -->
    <div class="setting-group">
      <label class="setting-label">Sprache</label>
      <select id="languageSelect" class="setting-select">
        <option value="de" ${settings.language === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>🇬🇧 English</option>
      </select>
    </div>

    <!-- TIMEZONE -->
    <div class="setting-group">
      <label class="setting-label">Zeitzone</label>
      <select id="timezoneSelect" class="setting-select">
        <option value="Europe/Berlin" ${settings.timezone === 'Europe/Berlin' ? 'selected' : ''}>Europe/Berlin (CET)</option>
        <option value="Europe/London" ${settings.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London (GMT)</option>
        <option value="America/New_York" ${settings.timezone === 'America/New_York' ? 'selected' : ''}>America/New York (EST)</option>
        <option value="America/Los_Angeles" ${settings.timezone === 'America/Los_Angeles' ? 'selected' : ''}>America/Los Angeles (PST)</option>
        <option value="Asia/Dubai" ${settings.timezone === 'Asia/Dubai' ? 'selected' : ''}>Asia/Dubai (GST)</option>
      </select>
    </div>
  `;
}

function renderPreferences() {
  return `
    <h2>🔧 Präferenzen</h2>
    <p class="section-intro">Zahlen- und Datumsformate anpassen</p>

    <!-- CURRENCY -->
    <div class="setting-group">
      <label class="setting-label">Währung</label>
      <select id="currencySelect" class="setting-select">
        <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>€ EUR - Euro</option>
        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>$ USD - US Dollar</option>
        <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>£ GBP - British Pound</option>
        <option value="CHF" ${settings.currency === 'CHF' ? 'selected' : ''}>CHF - Swiss Franc</option>
      </select>
      <div class="setting-hint">Beispiel: ${formatCurrency(1234.56)}</div>
    </div>

    <!-- NUMBER FORMAT -->
    <div class="setting-group">
      <label class="setting-label">Zahlenformat</label>
      <select id="numberFormatSelect" class="setting-select">
        <option value="de" ${settings.numberFormat === 'de' ? 'selected' : ''}>1.000,00 (Deutsch)</option>
        <option value="en" ${settings.numberFormat === 'en' ? 'selected' : ''}>1,000.00 (Englisch)</option>
      </select>
      <div class="setting-hint">Beispiel: ${formatNumber(1234567.89)}</div>
    </div>

    <!-- DATE FORMAT -->
    <div class="setting-group">
      <label class="setting-label">Datumsformat</label>
      <select id="dateFormatSelect" class="setting-select">
        <option value="DD.MM.YYYY" ${settings.dateFormat === 'DD.MM.YYYY' ? 'selected' : ''}>DD.MM.YYYY (13.12.2025)</option>
        <option value="MM/DD/YYYY" ${settings.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY (12/13/2025)</option>
        <option value="YYYY-MM-DD" ${settings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD (2025-12-13)</option>
      </select>
      <div class="setting-hint">Beispiel: ${formatDate(new Date())}</div>
    </div>
  `;
}

function renderAccount() {
  return `
    <h2>👤 Account</h2>
    <p class="section-intro">Deine Account-Informationen</p>

    <div class="account-card">
      <div class="account-avatar">
        <div class="avatar-circle">SP</div>
      </div>
      <div class="account-info">
        <div class="account-name">Sebastian Penner</div>
        <div class="account-email">sebastian@signalone.cloud</div>
        <div class="account-role">👑 Owner</div>
      </div>
    </div>

    <div class="setting-group">
      <button class="action-btn secondary" disabled>
        <span>🔒</span><span>Passwort ändern</span><span class="badge-soon">Bald</span>
      </button>
    </div>

    <div class="setting-group">
      <button class="action-btn secondary" disabled>
        <span>📧</span><span>E-Mail ändern</span><span class="badge-soon">Bald</span>
      </button>
    </div>

    <div class="setting-group">
      <button class="action-btn danger" id="logoutBtn">
        <span>🚪</span><span>Ausloggen</span>
      </button>
    </div>
  `;
}

function renderIntegrations(state) {
  const mode = state?.mode || 'demo';
  const metaConnected = !!state?.metaConnected;

  return `
    <h2>🔌 Integrationen</h2>
    <p class="section-intro">Verbundene Werbekanäle und Tools</p>

    <div class="integration-list">
      <div class="integration-item">
        <div class="integration-icon" style="background: linear-gradient(135deg, #4267B2, #5890FF);">
          <span style="font-size: 1.5rem;">🔵</span>
        </div>
        <div class="integration-info">
          <div class="integration-name">Meta Ads</div>
          <div class="integration-desc">Facebook & Instagram Ads</div>
        </div>
        <div class="integration-status ${mode === 'live' && metaConnected ? 'connected' : 'disconnected'}">
          ${mode === 'live' && metaConnected ? '✅ Verbunden' : '⚫ Nicht verbunden'}
        </div>
      </div>

      <div class="integration-item">
        <div class="integration-icon" style="background: linear-gradient(135deg, #4285F4, #34A853);">
          <span style="font-size: 1.5rem;">🔴</span>
        </div>
        <div class="integration-info">
          <div class="integration-name">Google Ads</div>
          <div class="integration-desc">Search, Display & YouTube</div>
        </div>
        <div class="integration-status disconnected">
          <span class="badge-soon">Bald</span>
        </div>
      </div>

      <div class="integration-item">
        <div class="integration-icon" style="background: linear-gradient(135deg, #000000, #EE1D52);">
          <span style="font-size: 1.5rem;">⚫</span>
        </div>
        <div class="integration-info">
          <div class="integration-name">TikTok Ads</div>
          <div class="integration-desc">TikTok For Business</div>
        </div>
        <div class="integration-status disconnected">
          <span class="badge-soon">Bald</span>
        </div>
      </div>
    </div>
  `;
}

function renderAbout() {
  return `
    <h2>ℹ️ Über SignalOne</h2>
    <p class="section-intro">Plattform-Informationen und Ressourcen</p>

    <div class="about-card">
      <div class="about-row">
        <span class="about-label">Version</span>
        <span class="about-value">v1.0.0</span>
      </div>
      <div class="about-row">
        <span class="about-label">Status</span>
        <span class="about-value">🟢 Live</span>
      </div>
      <div class="about-row">
        <span class="about-label">Letztes Update</span>
        <span class="about-value">13.12.2025</span>
      </div>
    </div>

    <div class="link-list">
      <a href="https://docs.signalone.cloud" target="_blank" class="link-item">
        <span>📖</span><span>Dokumentation</span><span>→</span>
      </a>

      <a href="https://signalone.cloud/changelog" target="_blank" class="link-item">
        <span>📝</span><span>Changelog</span><span>→</span>
      </a>

      <a href="https://support.signalone.cloud" target="_blank" class="link-item">
        <span>💬</span><span>Support</span><span>→</span>
      </a>

      <a href="https://signalone.cloud/status" target="_blank" class="link-item">
        <span>🟢</span><span>System Status</span><span>→</span>
      </a>
    </div>

    <div class="about-footer">
      <p>Made with ❤️ by SignalOne Team</p>
      <p>© 2025 SignalOne.cloud - All rights reserved</p>
    </div>
  `;
}

function bindEvents(container) {
  // Tabs
  const tabs = container.querySelectorAll('.settings-tab');
  const sections = container.querySelectorAll('.settings-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const section = container.querySelector(`[data-section="${targetTab}"]`);
      if (section) section.classList.add('active');
    });
  });

  // Data Mode
  const modeCards = container.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      const label = mode === 'live' ? 'Live' : 'Demo';
      if (confirm(`Zu ${label} Mode wechseln?`)) {
        setMode(mode);
        toast(`Wechsel zu ${label} Mode...`, 'info');
      }
    });
  });

  // Theme
  const themeBtns = container.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      settings.theme = btn.dataset.theme;
      saveSettings();
      applyTheme();

      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      toast(`Theme: ${settings.theme}`, 'success');
    });
  });

  // Language
  const langSelect = container.querySelector('#languageSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      settings.language = e.target.value;
      saveSettings();
      toast(`Sprache: ${settings.language === 'de' ? 'Deutsch' : 'English'}`, 'success');
    });
  }

  // Timezone
  const tzSelect = container.querySelector('#timezoneSelect');
  if (tzSelect) {
    tzSelect.addEventListener('change', (e) => {
      settings.timezone = e.target.value;
      saveSettings();
      toast(`Zeitzone: ${settings.timezone}`, 'success');
    });
  }

  // Currency
  const currencySelect = container.querySelector('#currencySelect');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      settings.currency = e.target.value;
      saveSettings();
      toast(`Währung: ${settings.currency}`, 'success');
      render(container, ctx); // update examples
    });
  }

  // Number Format
  const numFormatSelect = container.querySelector('#numberFormatSelect');
  if (numFormatSelect) {
    numFormatSelect.addEventListener('change', (e) => {
      settings.numberFormat = e.target.value;
      saveSettings();
      toast('Zahlenformat aktualisiert', 'success');
      render(container, ctx);
    });
  }

  // Date Format
  const dateFormatSelect = container.querySelector('#dateFormatSelect');
  if (dateFormatSelect) {
    dateFormatSelect.addEventListener('change', (e) => {
      settings.dateFormat = e.target.value;
      saveSettings();
      toast('Datumsformat aktualisiert', 'success');
      render(container, ctx);
    });
  }

  // Logout
  const logoutBtn = container.querySelector('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Wirklich ausloggen?')) {
        toast('Logging out...', 'info');
        setTimeout(() => window.location.reload(), 900);
      }
    });
  }
}

// Helpers
function formatCurrency(value) {
  const locale = settings.numberFormat === 'de' ? 'de-DE' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: settings.currency }).format(value);
}

function formatNumber(value) {
  const locale = settings.numberFormat === 'de' ? 'de-DE' : 'en-US';
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  if (settings.dateFormat === 'DD.MM.YYYY') return `${d}.${m}.${y}`;
  if (settings.dateFormat === 'MM/DD/YYYY') return `${m}/${d}/${y}`;
  return `${y}-${m}-${d}`;
}

function applyTheme() {
  const root = document.documentElement;

  if (settings.theme === 'dark') {
    root.classList.add('dark-theme');
  } else if (settings.theme === 'light') {
    root.classList.remove('dark-theme');
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark-theme', !!prefersDark);
  }
}

function saveSettings() {
  try {
    localStorage.setItem('signalOneSettings', JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('signalOneSettings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (e) {
    // ignore
  }
}

function loadModuleCSS() {
  if (document.getElementById('settings-css')) return;

  const bust = (window.CACHE_BUST || '').toString().trim();
  const href = bust
    ? `packages/settings/module.css?v=${encodeURIComponent(bust)}`
    : `packages/settings/module.css`;

  const link = document.createElement('link');
  link.id = 'settings-css';
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('settings-css');
  if (link) link.remove();
}

export async function destroy(container) {
  if (container) container.innerHTML = '';
  unloadModuleCSS();
}

export function getSettings() {
  return settings;
}
