# 🏗️ SignalOne Titanium Remastered – Systemarchitektur

**Version:** 2.0 Remastered  
**Stand:** 13.12.2025  
**Status:** 🟢 Production-Ready Architecture

---

## 🎯 Kernproblem & Lösung

### ❌ Das alte Problem:
- **4+ CSS-Dateien** → Niemand steigt durch (styles.css, sx-core.css, titanium.css, module styles)
- **Sidebar/Topbar werden ständig angerührt** → Breaking Changes
- **Module zerstören sich gegenseitig** → Globale CSS-Konflikte
- **Datenfluss nicht konsistent** → Live/Demo-Switch funktioniert nicht überall
- **Keine klare Trennung** zwischen Core, Modules & Data

### ✅ Die neue Lösung:
**3-Layer-System** mit strikter Trennung:

```
┌─────────────────────────────────────────┐
│  LAYER 1: FROZEN CORE                   │
│  → Sidebar, Topbar, Routing, Modal      │
│  → NIE WIEDER ANFASSEN                  │
└─────────────────────────────────────────┘
           ↓ (liefert Container)
┌─────────────────────────────────────────┐
│  LAYER 2: DATA LAYER                    │
│  → Brand/Campaign/Account-State         │
│  → Live/Demo-Switch                     │
│  → Zentrale Datenquelle für ALLE Module │
└─────────────────────────────────────────┘
           ↓ (liefert Daten)
┌─────────────────────────────────────────┐
│  LAYER 3: MODULE SYSTEM                 │
│  → Jedes Modul ist 100% autark         │
│  → Eigenes CSS, eigene Logik, eigene UI │
│  → Keine Cross-Dependencies             │
└─────────────────────────────────────────┘
```

---

## 📦 LAYER 1: FROZEN CORE

### Dateien (NIE WIEDER ANFASSEN):
```
index.html          → App Shell (Sidebar, Topbar, View-Container)
app.js              → Routing, Settings, Module Loader
core.css            → NUR Sidebar, Topbar, Modal, Toast, Loader
```

### Was gehört hier rein:
- ✅ **Sidebar** (Navigation, frozen)
- ✅ **Topbar** (Brand/Campaign-Selects, Meta-Connect, frozen)
- ✅ **View-Container** (`<section id="dashboardView" class="view">`)
- ✅ **Global Components** (Loader, Toast, Modal)
- ✅ **Routing** (View-Switching, Navigation)
- ✅ **Settings** (Live/Demo-Toggle, Theme, etc.)

### Was NICHT hier rein gehört:
- ❌ Modul-spezifisches Styling
- ❌ Dashboard-KPIs
- ❌ Creative-Library-Grids
- ❌ Campaigns-Tabellen

### Regel:
> **"Sidebar & Topbar sind FROZEN. Wer sie anfasst, wird gefeuert."**

---

## 📊 LAYER 2: DATA LAYER

### Dateien:
```
data/
  ├── index.js        → DataLayer API (fetchDashboard, fetchCreatives, etc.)
  ├── state.js        → Global State (Brand, Campaign, Mode)
  ├── live.js         → Live Meta API Calls
  └── demo.js         → Demo Data Generator
```

### Global State:
```javascript
// data/state.js
export const AppState = {
  // Datenquelle
  mode: 'demo', // 'live' | 'demo'
  
  // Kontext (gilt für ALLE Module)
  currentBrand: null,      // { id, name, ... }
  currentAccount: null,    // { id, name, ... }
  currentCampaign: null,   // { id, name, ... }
  
  // Meta Connection
  metaConnected: false,
  metaToken: null,
  
  // Current View
  currentView: 'dashboard',
  
  // Settings
  settings: {
    theme: 'dark',
    currency: 'EUR',
    timezone: 'CET'
  }
};
```

### DataLayer API:
```javascript
// data/index.js
export const DataLayer = {
  // Dashboard
  async fetchDashboardData(brand, account, campaign) {
    if (AppState.mode === 'demo') {
      return DemoData.getDashboard(brand, account, campaign);
    } else {
      return LiveAPI.getDashboard(brand, account, campaign);
    }
  },
  
  // Creatives
  async fetchCreatives(brand, account, campaign) {
    // ... analog
  },
  
  // Campaigns
  async fetchCampaigns(brand, account) {
    // ... analog
  }
};
```

### Dropdown-Master-Logic:
**Wenn User Brand/Campaign wechselt:**
```javascript
// In app.js
function onBrandChange(newBrand) {
  AppState.currentBrand = newBrand;
  reloadAllActiveModules(); // ← Alle sichtbaren Module neu rendern
}

function onCampaignChange(newCampaign) {
  AppState.currentCampaign = newCampaign;
  reloadAllActiveModules();
}

function onModeChange(newMode) {
  AppState.mode = newMode; // 'live' | 'demo'
  reloadAllActiveModules();
}
```

### Regel:
> **"Alle Module lesen Daten NUR aus DataLayer. Nie direkt aus AppState oder Meta API."**

---

## 🧩 LAYER 3: MODULE SYSTEM

### Struktur pro Modul:
```
packages/dashboard/
  ├── index.js        → Public API (render, mount, destroy)
  ├── compute.js      → KPI-Berechnungen
  ├── render.js       → HTML-Rendering
  ├── data.js         → Data-Fetching (nutzt DataLayer)
  └── module.css      → NUR Dashboard-Styling

packages/creativeLibrary/
  ├── index.js
  ├── compute.js
  ├── render.js
  ├── data.js
  └── module.css

packages/campaigns/
  ├── index.js
  ├── compute.js
  ├── render.js
  ├── data.js
  └── module.css
```

### Module API (Standard):
```javascript
// packages/dashboard/index.js
export async function render(container, state) {
  // 1. Daten holen (aus DataLayer)
  const data = await DataLayer.fetchDashboardData(
    state.currentBrand,
    state.currentAccount,
    state.currentCampaign
  );
  
  // 2. Berechnen (in compute.js)
  const computed = computeKPIs(data);
  
  // 3. HTML bauen (in render.js)
  const html = renderDashboard(computed);
  
  // 4. Rendern
  container.innerHTML = html;
  
  // 5. CSS laden (dynamisch)
  loadModuleCSS('/packages/dashboard/module.css');
  
  // 6. Events binden
  bindDashboardEvents(container);
}

export function destroy(container) {
  // Cleanup: Events entfernen, CSS unloaden
  container.innerHTML = '';
  unloadModuleCSS('/packages/dashboard/module.css');
}
```

### CSS-Kapselung:
```css
/* packages/dashboard/module.css */
/* WICHTIG: Alle Selektoren mit #dashboardView prefixen */

#dashboardView .hero-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

#dashboardView .kpi-card {
  background: var(--card-bg);
  border-radius: 18px;
  padding: 1.5rem;
}

/* NIEMALS globale Selektoren wie .card oder .button */
```

### Regel:
> **"Jedes Modul ist eine Insel. Keine Imports zwischen Modulen (außer DataLayer)."**

---

## 🔄 DATENFLUSS

```
User wählt Brand "ACME"
    ↓
AppState.currentBrand = "ACME"
    ↓
reloadAllActiveModules()
    ↓
Dashboard.render(container, AppState)
    ↓
DataLayer.fetchDashboardData("ACME", ...)
    ↓
Live/Demo entscheidet: DemoData oder Meta API
    ↓
KPIs berechnen
    ↓
HTML rendern
    ↓
Fertig
```

**Gleiches Prinzip für:**
- Campaign-Wechsel
- Live/Demo-Toggle
- Account-Wechsel

---

## 🎨 CSS-ARCHITEKTUR

### Alte Struktur (LÖSCHEN):
```
❌ styles.css        → 38KB Chaos
❌ sx-core.css       → 5KB doppelte Definitionen
❌ titanium.css      → 8KB obsolete Styles
❌ Module styles inline im HTML
```

### Neue Struktur:
```
✅ core.css          → 10KB (NUR Sidebar, Topbar, Modal, Toast)
✅ packages/dashboard/module.css
✅ packages/creativeLibrary/module.css
✅ packages/campaigns/module.css
```

### CSS-Variablen (global in core.css):
```css
:root {
  /* Colors */
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-border: rgba(255, 255, 255, 0.06);
  
  /* Status */
  --color-good: #16a34a;
  --color-warning: #ea980c;
  --color-critical: #e11d48;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  
  /* Shadows */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.24);
}
```

---

## 🚦 START-SCREEN

**Problem:**
- User loggt ein → Keine Brand ausgewählt → Module crashen

**Lösung:**
```html
<!-- index.html -->
<section id="welcomeView" class="view">
  <div class="welcome-container">
    <img src="/logo.svg" alt="SignalOne" />
    <h1>Welcome to SignalOne</h1>
    <p>Select a Brand and Campaign to get started.</p>
    <div class="welcome-actions">
      <button id="selectBrandBtn">Select Brand</button>
      <button id="useDemoBtn">Use Demo Data</button>
    </div>
  </div>
</section>
```

**Logik:**
```javascript
// app.js
if (!AppState.currentBrand) {
  showView('welcomeView');
} else {
  showView('dashboardView');
  loadModule('dashboard');
}
```

---

## ⚙️ SETTINGS-VIEW

**Live/Demo-Toggle landet in Settings:**
```html
<section id="settingsView" class="view">
  <div class="settings-section">
    <h3>Data Source</h3>
    <div class="settings-toggle">
      <button id="liveModeBtn" class="btn-toggle">
        <span class="icon">🔴</span> Live Meta Ads
      </button>
      <button id="demoModeBtn" class="btn-toggle active">
        <span class="icon">🟢</span> Demo Data
      </button>
    </div>
    <p class="settings-hint">
      Demo Mode uses realistic sample data. 
      Live Mode requires Meta connection.
    </p>
  </div>
</section>
```

---

## 📝 MODULE TEMPLATE

**Für jedes neue Modul (z.B. "sensei"):**

### 1. Ordner erstellen:
```
packages/sensei/
  ├── index.js
  ├── compute.js
  ├── render.js
  ├── data.js
  └── module.css
```

### 2. index.js:
```javascript
import { DataLayer } from '../../data/index.js';
import { computeSenseiInsights } from './compute.js';
import { renderSenseiView } from './render.js';

export async function render(container, state) {
  // 1. Daten holen
  const data = await DataLayer.fetchSenseiData(
    state.currentBrand,
    state.currentAccount,
    state.currentCampaign
  );
  
  // 2. Berechnen
  const insights = computeSenseiInsights(data);
  
  // 3. Rendern
  container.innerHTML = renderSenseiView(insights);
  
  // 4. CSS laden
  loadModuleCSS('/packages/sensei/module.css');
}

export function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS('/packages/sensei/module.css');
}
```

### 3. compute.js:
```javascript
export function computeSenseiInsights(data) {
  // KPI-Berechnungen, Logik, etc.
  return {
    score: 85,
    recommendations: [...],
    alerts: [...]
  };
}
```

### 4. render.js:
```javascript
export function renderSenseiView(insights) {
  return `
    <div class="sensei-container">
      <h2>Sensei AI Insights</h2>
      <div class="sensei-score">${insights.score}</div>
      <!-- ... -->
    </div>
  `;
}
```

### 5. module.css:
```css
#senseiView .sensei-container {
  padding: 2rem;
}

#senseiView .sensei-score {
  font-size: 3rem;
  color: var(--color-good);
}
```

---

## 🔥 MIGRATION PLAN

### Phase 1: Core Freeze ✅
- [x] `core.css` erstellen (NUR Sidebar, Topbar, Modal)
- [x] `app.js` cleanup (Routing, Settings)
- [x] `index.html` cleanup
- [x] Alte CSS-Dateien löschen

### Phase 2: Data Layer ✅
- [ ] `data/index.js` erstellen
- [ ] `data/state.js` erstellen
- [ ] `data/live.js` + `data/demo.js` erstellen
- [ ] Topbar-Dropdowns an State binden

### Phase 3: Dashboard Refactor 🔄
- [ ] `packages/dashboard/module.css` erstellen
- [ ] `packages/dashboard/data.js` an DataLayer anbinden
- [ ] CSS-Kapselung mit `#dashboardView` prefix

### Phase 4: Creative Library Refactor 🔄
- [ ] Analog zu Dashboard

### Phase 5: Campaigns Refactor 🔄
- [ ] Analog zu Dashboard

### Phase 6: Settings-View 🆕
- [ ] Live/Demo-Toggle in Settings
- [ ] Welcome-Screen erstellen

---

## ✅ REGELN (NIEMALS BRECHEN)

1. **Sidebar & Topbar sind FROZEN** → Nie wieder anfassen
2. **Jedes Modul ist autark** → Keine Cross-Dependencies
3. **CSS mit View-Prefix** → `#dashboardView .kpi-card`, nie `.kpi-card`
4. **Daten NUR aus DataLayer** → Nie direkt Meta API oder AppState
5. **Brand/Campaign-Wechsel = Global Re-Render** → Alle Module neu laden
6. **Live/Demo = Globaler Switch** → In Settings, gilt für ALLE Module

---

## 🚀 NÄCHSTE SCHRITTE

1. ✅ Dieses Dokument als `ARCHITECTURE.md` im Repo speichern
2. ⏳ Core Freeze durchführen (Phase 1)
3. ⏳ Data Layer aufbauen (Phase 2)
4. ⏳ Dashboard refactoren (Phase 3)
5. ⏳ Settings-View erstellen (Phase 6)

---

**Ende der Architektur-Dokumentation.**  
Bei Fragen: Dieses Dokument ist die Wahrheit. Folge ihm strikt.
