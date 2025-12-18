// packages/creativeLibrary/index.js
// V6.3 PHASE 1 FINAL - FIXED DATA LAYER IMPORT
// ✅ P1-06: Proper empty states
// ✅ P1-07: Filter honesty (all filters work)
// ✅ P1-08: No artificial limits
// ✅ FIX: Direct import from data layer (fixes 3-creative fallback bug)

import { buildCreativeLibraryModel } from "./compute.js";
import { renderCreativeLibrary, renderGridOnly } from "./render.js";
import { openCreativeModal, closeCreativeModal } from "./modal.js";
import * as DataLayer from "../../data/index.js";

export const meta = {
  id: "creativeLibrary",
  title: "Creative Library",
  subtitle: "Assets & KPIs",
  requiresMeta: false,
};

let _root = null;
let _ctx = null;
let _model = null;

let _filters = {
  search: "",
  format: "",
  sort: "roasDesc",
};

let _mounted = false;

export async function load(ctx) {
  _ctx = ctx || null;
  ensureModuleCSS();
}

export async function render(root, ctx) {
  _root = root;
  _ctx = ctx || _ctx;

  closeCreativeModal();
  ensureModuleCSS();

  console.log('[CreativeLibrary] 🚀 Fetching data...');
  
  const payload = await fetchCreativeLibraryData(_ctx);
  
  console.log('[CreativeLibrary] 📦 Payload received:', payload);
  
  _model = buildCreativeLibraryModel(payload);

  console.log('[CreativeLibrary] 📋 Model built:', {
    totalCreatives: _model.creatives?.length || 0,
    formats: _model.formats,
    summary: _model.summary
  });

  // P1-06: Empty state only if TRULY no creatives
  if (!_model.creatives || _model.creatives.length === 0) {
    console.warn('[CreativeLibrary] ⚠️ No creatives available - showing empty state');
    _root.innerHTML = renderEmptyState('brand', _ctx);
    return;
  }

  const viewModel = {
    creatives: getSorted(getFiltered(_model.creatives)),
    formats: _model.formats,
    summary: _model.summary,
    activeFilters: { ..._filters },
  };

  console.log('[CreativeLibrary] 🎨 Rendering', viewModel.creatives.length, 'creatives');

  renderCreativeLibrary(_root, viewModel);
  
  mount(root, ctx);
}

export function mount(root, ctx) {
  _root = root || _root;
  _ctx = ctx || _ctx;
  
  if (_mounted && _root) {
    _root.removeEventListener("input", onInput);
    _root.removeEventListener("change", onChange);
    _root.removeEventListener("click", onClick);
    _root.removeEventListener("keydown", onKeyDown);
  }
  
  if (!_root) return;

  console.log('[CreativeLibrary] 🎯 Mounting event listeners...');

  _root.addEventListener("input", onInput);
  _root.addEventListener("change", onChange);
  _root.addEventListener("click", onClick);
  _root.addEventListener("keydown", onKeyDown);

  _mounted = true;
  console.log('[CreativeLibrary] ✅ Mounted successfully');
}

export function destroy(root) {
  const r = root || _root;
  if (r) {
    r.removeEventListener("input", onInput);
    r.removeEventListener("change", onChange);
    r.removeEventListener("click", onClick);
    r.removeEventListener("keydown", onKeyDown);
    r.innerHTML = "";
  }

  closeCreativeModal();

  _root = null;
  _ctx = null;
  _model = null;
  _filters = { search: "", format: "", sort: "roasDesc" };
  _mounted = false;

  unloadModuleCSS();
  console.log('[CreativeLibrary] 🧹 Destroyed');
}

/* ---------------- P1-06: EMPTY STATES ---------------- */

function renderEmptyState(reason, ctx) {
  const brandName = ctx?.appState?.selectedBrand?.name || 'dieser Brand';
  const campaignName = ctx?.appState?.selectedCampaign?.name || null;
  const mode = ctx?.appState?.mode || 'demo';
  
  let title, message, icon;
  
  if (reason === 'campaign' && campaignName) {
    icon = '🎬';
    title = `Keine Creatives für "${campaignName}"`;
    message = 'Diese Kampagne hat noch keine Ads. Wähle eine andere Kampagne oder prüfe die Datenquelle.';
  } else if (reason === 'filter') {
    icon = '🔍';
    title = 'Keine Ergebnisse';
    message = 'Deine Filter liefern keine Treffer. Versuche andere Suchbegriffe oder entferne Filter.';
  } else {
    icon = '📦';
    title = `${brandName} hat noch keine Creatives`;
    message = mode === 'live' 
      ? 'Stelle sicher, dass dein Meta-Konto verbunden ist und Ads existieren.'
      : 'Wähle eine Brand mit Demo-Daten aus dem Header-Dropdown.';
  }
  
  return `
    <div style="
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 3rem;
      text-align: center;
    ">
      <div style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.5;">${icon}</div>
      <h2 style="font-size: 1.5rem; font-weight: 700; color: #1D1D1F; margin-bottom: 1rem;">
        ${title}
      </h2>
      <p style="color: #6b7280; font-size: 1rem; max-width: 500px; line-height: 1.6;">
        ${message}
      </p>
    </div>
  `;
}

/* ---------------- DATA FETCHING ---------------- */

async function fetchCreativeLibraryData(ctx) {
  console.log('[CreativeLibrary] 🔍 Fetching creative library data...');
  
  const appState = ctx?.appState;

  // Live mode: ensure Meta connected
  if (ctx?.ensureMetaConnected && appState?.mode === "live") {
    await ctx.ensureMetaConnected();
  }

  // ✅ FIX: Direct import from data layer
  console.log('[CreativeLibrary] 👍 Using DataLayer.fetchCreatives() directly');
  
  const brand = appState?.selectedBrand;
  const account = appState?.selectedAccount;
  const campaign = appState?.selectedCampaign;
  
  console.log('[CreativeLibrary] 📊 Fetching with:', { brand: brand?.name, account: account?.name, campaign: campaign?.name });
  
  const creatives = await DataLayer.fetchCreatives(brand, account, campaign);
  
  console.log('[CreativeLibrary] 📥 Received creatives:', creatives?.length || 0);
  
  if (Array.isArray(creatives) && creatives.length > 0) {
    // Extract unique formats from creatives
    const formats = Array.from(new Set(creatives.map(c => c.format || 'Unknown'))).sort();
    return { creatives, formats };
  }

  console.warn('[CreativeLibrary] ⚠️ No creatives returned from data layer');
  return { creatives: [] };
}

/* ---------------- FILTERING / SORTING ---------------- */

function getFiltered(list) {
  const search = (_filters.search || "").trim().toLowerCase();
  const format = String(_filters.format || "");

  console.log('[CreativeLibrary] 🔍 Filtering with:', { search, format, totalItems: list?.length || 0 });

  const filtered = (list || []).filter((c) => {
    // P1-07: Format filter works (if format selected, must match)
    if (format && String(c.format || "") !== format) {
      return false;
    }

    // P1-07: Search filter works
    if (search) {
      const hay = [
        c.name,
        c.brand,
        c.format,
        c.type,
        c.status,
        c.campaignName,
        c.adsetName,
        ...(c.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      
      if (!hay.includes(search)) {
        return false;
      }
    }

    return true;
  });

  console.log('[CreativeLibrary] 📊 Filtered result:', filtered.length, '/', list?.length || 0);
  
  // P1-06: Check if filters produced empty result
  if (filtered.length === 0 && (search || format)) {
    console.log('[CreativeLibrary] ⚠️ Filters produced no results');
  }
  
  return filtered;
}

function getSorted(list) {
  const sort = _filters.sort || "roasDesc";
  const arr = [...(list || [])];

  console.log('[CreativeLibrary] 📈 Sorting by:', sort);

  const val = (c) => {
    const k = c.kpis || {};
    if (sort === "spendDesc") return Number(k.spend || 0);
    if (sort === "ctrDesc") return Number(k.ctr || 0);
    return Number(k.roas || 0); // default: roasDesc
  };

  arr.sort((a, b) => val(b) - val(a));
  
  // P1-08: NO artificial limits - return ALL sorted items
  console.log('[CreativeLibrary] ✅ Sorted', arr.length, 'items (no limit)');
  return arr;
}

function rerenderGrid() {
  if (!_root || !_model) {
    console.warn('[CreativeLibrary] ⚠️ Cannot rerender - no root or model');
    return;
  }
  
  console.log('[CreativeLibrary] 🔄 Rerendering grid...');
  const next = getSorted(getFiltered(_model.creatives));
  
  // P1-06: Show filter empty state if applicable
  if (next.length === 0 && (_filters.search || _filters.format)) {
    _root.innerHTML = renderEmptyState('filter', _ctx);
    return;
  }
  
  console.log('[CreativeLibrary] 🎨 Rendering', next.length, 'creatives to grid');
  renderGridOnly(_root, next);
}

/* ---------------- EVENT HANDLERS ---------------- */

function onInput(e) {
  const t = e.target;
  if (!t) return;
  
  // P1-07: Search is fully functional
  if (t.id === "clSearch") {
    console.log('[CreativeLibrary] 🔍 Search input:', t.value);
    _filters.search = String(t.value || "");
    rerenderGrid();
  }
}

function onChange(e) {
  const t = e.target;
  if (!t) return;

  // P1-07: Format filter is fully functional
  if (t.id === "clFormat") {
    console.log('[CreativeLibrary] 🎯 Format changed:', t.value);
    _filters.format = String(t.value || "");
    rerenderGrid();
  }

  // P1-07: Sort is fully functional
  if (t.id === "clSort") {
    console.log('[CreativeLibrary] 📊 Sort changed:', t.value);
    _filters.sort = String(t.value || "roasDesc");
    rerenderGrid();
  }
}

function onClick(e) {
  const t = e.target;
  if (!t) return;

  // Upload stub (Phase 2)
  if (t.closest?.("#clNewCreativeBtn")) {
    toast("info", "Upload kommt in Phase 2");
    return;
  }

  // Sensei button (Phase 2)
  const s = t.closest?.("[data-cl-sensei]");
  if (s) {
    const id = s.getAttribute("data-cl-sensei");
    const c = (_model?.creatives || []).find((x) => String(x.id) === String(id));
    if (c) {
      toast("info", `🧠 Sensei Analyse für "${c.name}" kommt in Phase 2`);
    } else {
      toast("warning", "Creative nicht gefunden.");
    }
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Details button
  const d = t.closest?.("[data-cl-details]");
  if (d) {
    const id = d.getAttribute("data-cl-details");
    openDetails(id);
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Select (stub - Phase 2)
  const sel = t.closest?.("[data-cl-select]");
  if (sel) {
    toast("info", "Multi-Select kommt in Phase 2");
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Card click
  const card = t.closest?.("[data-cl-card]");
  if (card) {
    const id = card.getAttribute("data-cl-card");
    openDetails(id);
  }
}

function onKeyDown(e) {
  if (e.key !== "Enter") return;
  const t = e.target;
  const card = t?.closest?.("[data-cl-card]");
  if (card) {
    const id = card.getAttribute("data-cl-card");
    openDetails(id);
  }
}

/* ---------------- ACTIONS ---------------- */

function openDetails(id) {
  const c = (_model?.creatives || []).find((x) => String(x.id) === String(id));
  if (!c) {
    toast("warning", "Creative nicht gefunden.");
    return;
  }
  openCreativeModal(c);
}

function toast(type, msg) {
  if (_ctx?.showToast) return _ctx.showToast(msg, type);
  if (window.SignalOne?.showToast) return window.SignalOne.showToast(msg, type);
  console.log(`[CreativeLibrary:${type}]`, msg);
}

/* ---------------- CSS ---------------- */

function ensureModuleCSS() {
  if (document.getElementById("so-creative-library-css")) return;
  const link = document.createElement("link");
  link.id = "so-creative-library-css";
  link.rel = "stylesheet";
  link.href = "/packages/creativeLibrary/module.css";
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById("so-creative-library-css");
  if (link) link.remove();
}
