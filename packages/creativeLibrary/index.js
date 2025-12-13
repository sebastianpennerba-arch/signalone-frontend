// packages/creativeLibrary/index.js
// SignalOne Titanium – Creative Library (P2 FINAL)
// Contract: load(ctx), render(root, ctx), mount(root, ctx), destroy(root, ctx)

import { buildCreativeLibraryModel } from "./compute.js";
import { createDefaultFilters, applyFilters, applySort } from "./filters.js";
import {
  renderCreativeLibrary,
  renderGridOnly,
  renderEmptyState,
  renderErrorState,
} from "./render.js";
import { openCreativeModal, closeCreativeModal } from "./modal.js";
import { computeCreativeHealth } from "./health.js";

export const meta = {
  id: "creativeLibrary",
  title: "Creative Library",
  subtitle: "Assets, KPIs & Varianten – Titanium Ready.",
  requiresMeta: false,
};

let _root = null;
let _ctx = null;

let _model = null;
let _filters = createDefaultFilters();
let _selection = new Set();
let _mounted = false;

export async function load(ctx) {
  // Optional preload hook – keep light
  _ctx = ctx || null;
  ensureModuleCSS();
}

export async function render(root, ctx) {
  _root = root;
  _ctx = ctx || _ctx;

  try {
    ensureModuleCSS();
    closeCreativeModal();

    // --- Data Gatekeeper (wenn Shell es anbietet) ---
    // Jede datenabhängige Funktion MUSS Token-Check respektieren (P5).
    if (_ctx?.ensureMetaConnected && _ctx?.appState?.dataMode === "live") {
      await _ctx.ensureMetaConnected(); // wirft bei fehlender Auth ggf. Error
    }

    const data = await fetchCreativeLibraryData(_ctx);
    _model = buildCreativeLibraryModel(data);

    if (!_model?.creatives?.length) {
      renderEmptyState(_root, _ctx?.appState?.dataMode === "live" ? "Live Mode" : "Demo Mode");
      return;
    }

    // Reset selection on hard re-render
    _selection = new Set();

    const creatives = getFilteredCreatives();
    renderCreativeLibrary(_root, {
      summary: _model.summary,
      formats: _model.formats,
      filters: _filters,
      creatives,
      selectionCount: _selection.size,
      modeLabel: _ctx?.appState?.dataMode === "live" ? "Live Mode" : "Demo Mode",
    });

    _mounted = false; // mount() soll Events frisch verdrahten
  } catch (err) {
    console.error("[creativeLibrary] render error:", err);
    renderErrorState(_root, err?.message || "Creative Library konnte nicht geladen werden.");
  }
}

export function mount(root, ctx) {
  _root = root || _root;
  _ctx = ctx || _ctx;
  if (!_root || _mounted) return;

  // Controls
  _root.addEventListener("input", onInput);
  _root.addEventListener("change", onChange);
  _root.addEventListener("click", onClick);

  _mounted = true;
}

export function destroy() {
  if (_root) {
    _root.removeEventListener("input", onInput);
    _root.removeEventListener("change", onChange);
    _root.removeEventListener("click", onClick);
    _root.innerHTML = "";
  }

  closeCreativeModal();

  _root = null;
  _ctx = null;
  _model = null;
  _filters = createDefaultFilters();
  _selection = new Set();
  _mounted = false;

  unloadModuleCSS();
}

/* ----------------------------- Events ----------------------------- */

function onInput(e) {
  const t = e.target;
  if (!t) return;

  if (t.id === "soClSearch") {
    _filters.search = String(t.value || "");
    rerenderGrid();
  }
}

function onChange(e) {
  const t = e.target;
  if (!t) return;

  if (t.id === "soClFormat") {
    _filters.format = String(t.value || "");
    rerenderGrid();
  }

  if (t.id === "soClBucket") {
    _filters.bucket = String(t.value || "all");
    rerenderGrid();
  }

  if (t.id === "soClType") {
    _filters.type = String(t.value || "all");
    rerenderGrid();
  }

  if (t.id === "soClSort") {
    _filters.sort = String(t.value || "roas-desc");
    rerenderGrid();
  }
}

function onClick(e) {
  const t = e.target;
  if (!t) return;

  // Checkbox selection
  const cb = t.closest?.("[data-so-cl-select]");
  if (cb) {
    const id = cb.getAttribute("data-so-cl-select");
    toggleSelection(id);
    rerenderSelectionOnly();
    e.preventDefault();
    return;
  }

  // Bulk actions
  const bulk = t.closest?.("[data-so-cl-bulk]");
  if (bulk) {
    const action = bulk.getAttribute("data-so-cl-bulk");
    handleBulkAction(action);
    e.preventDefault();
    return;
  }

  // Analyze / Sensei (single)
  const senseiBtn = t.closest?.("[data-so-cl-sensei]");
  if (senseiBtn) {
    const id = senseiBtn.getAttribute("data-so-cl-sensei");
    analyzeWithSensei(id);
    e.preventDefault();
    return;
  }

  // Card open (avoid opening when clicking buttons/checkbox inside)
  const card = t.closest?.("[data-so-cl-card]");
  if (card) {
    const id = card.getAttribute("data-so-cl-card");
    if (!id) return;
    openDetails(id);
  }

  // Upload stub
  const uploadBtn = t.closest?.("#soClUploadBtn");
  if (uploadBtn) {
    toast("info", "Upload folgt in P2.1+ (Backend / Storage).");
    e.preventDefault();
  }
}

/* ----------------------------- Rendering helpers ----------------------------- */

function getFilteredCreatives() {
  const list = _model?.creatives || [];
  const filtered = applyFilters(list, _filters);
  return applySort(filtered, _filters.sort);
}

function rerenderGrid() {
  if (!_root || !_model) return;

  // Selection bereinigen (falls Items rausgefiltert wurden)
  const visibleIds = new Set(getFilteredCreatives().map((c) => String(c.id)));
  _selection = new Set([..._selection].filter((id) => visibleIds.has(String(id))));

  const creatives = getFilteredCreatives();
  renderGridOnly(_root, creatives, {
    filters: _filters,
    selection: _selection,
    selectionCount: _selection.size,
  });
}

function rerenderSelectionOnly() {
  if (!_root) return;
  const el = _root.querySelector("[data-so-cl-selectionbar]");
  if (!el) {
    // falls selection bar noch nicht da ist -> full grid refresh
    rerenderGrid();
    return;
  }
  // update selection bar count + card selected states
  renderGridOnly(_root, getFilteredCreatives(), {
    filters: _filters,
    selection: _selection,
    selectionCount: _selection.size,
    selectionOnly: true,
  });
}

/* ----------------------------- Actions ----------------------------- */

function toggleSelection(id) {
  const key = String(id);
  if (_selection.has(key)) _selection.delete(key);
  else _selection.add(key);
}

function openDetails(id) {
  const c = findCreativeById(id);
  if (!c) return;

  openCreativeModal(c, {
    onSensei: () => analyzeWithSensei(id),
    onCompare: () => {
      toggleSelection(id);
      rerenderSelectionOnly();
      toast("info", "Creative zur Vergleichsliste hinzugefügt.");
    },
  });
}

function analyzeWithSensei(id) {
  const c = findCreativeById(id);
  if (!c) return;

  const k = c.kpis || {};
  const health = computeCreativeHealth({
    metrics: {
      roas: k.roas,
      ctr: (k.ctr || 0) * 100, // health expects %
      cpm: k.cpm,
      spend: k.spend,
    },
    bucket: c.status,
  });

  if (_ctx?.openSenseiForCreative) {
    _ctx.openSenseiForCreative(c, health);
    return;
  }

  if (window.openSystemModal) {
    const html = `
      <p><strong>${health.label}</strong> – Score ${health.score}</p>
      <p>${health.reasonShort}</p>
      <p style="margin-top:8px; font-size:12px; color:var(--grey-600);">
        ${health.reasonLong}
      </p>
    `;
    window.openSystemModal("Sensei Analyse (Demo)", html);
    return;
  }

  toast("info", health.reasonShort);
}

function handleBulkAction(action) {
  const ids = [..._selection];
  if (!ids.length) {
    toast("warning", "Keine Creatives ausgewählt.");
    return;
  }

  if (action === "clear") {
    _selection = new Set();
    rerenderSelectionOnly();
    toast("info", "Selection geleert.");
    return;
  }

  if (action === "compare") {
    toast("info", `Compare (P2.5): ${ids.length} Creatives vorgemerkt.`);
    return;
  }

  if (action === "sensei") {
    // Analyze first selected as demo behavior
    analyzeWithSensei(ids[0]);
    return;
  }

  toast("warning", "Unbekannte Bulk-Action.");
}

/* ----------------------------- Data ----------------------------- */

async function fetchCreativeLibraryData(ctx) {
  const client = ctx?.getDataClient ? ctx.getDataClient() : null;

  // Prefer canonical method
  if (client?.getCreativeLibraryData) {
    return await client.getCreativeLibraryData(ctx?.appState);
  }

  // Fallback to dashboard data shapes / demo data shapes
  if (client?.getCreatives) {
    const list = await client.getCreatives(ctx?.appState);
    return { creatives: list };
  }

  // Plain shapes
  if (Array.isArray(client?.creatives)) return { creatives: client.creatives };
  if (Array.isArray(client?.ads)) return { creatives: client.ads };
  if (Array.isArray(client?.creativeLibrary)) return { creatives: client.creativeLibrary };

  // Last resort: global demo
  if (window.SignalOneDemoClient?.getCreativeLibraryData) {
    return await window.SignalOneDemoClient.getCreativeLibraryData(ctx?.appState);
  }

  return { creatives: [] };
}

function findCreativeById(id) {
  const key = String(id);
  return (_model?.creatives || []).find((c) => String(c.id) === key);
}

/* ----------------------------- UI helpers ----------------------------- */

function toast(type, msg) {
  if (_ctx?.showToast) return _ctx.showToast(type, msg);
  if (window.SignalOne?.showToast) return window.SignalOne.showToast(type, msg);
  console.log(`[creativeLibrary toast:${type}]`, msg);
}

/* ----------------------------- CSS loader ----------------------------- */

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
