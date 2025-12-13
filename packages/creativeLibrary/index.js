// packages/creativeLibrary/index.js
// V4.0 CRITICAL FIX - Working Dropdowns + Sensei
// Cache-buster: 2025-12-13-15:23

import { buildCreativeLibraryModel } from "./compute.js";
import { renderCreativeLibrary, renderGridOnly } from "./render.js";
import { openCreativeModal, closeCreativeModal } from "./modal.js";

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

  const payload = await fetchCreativeLibraryData(_ctx);
  _model = buildCreativeLibraryModel(payload);

  console.log('[CreativeLibrary] Model:', _model);

  const viewModel = {
    creatives: getSorted(getFiltered(_model.creatives)),
    formats: _model.formats,
    summary: _model.summary,
    activeFilters: { ..._filters },
  };

  renderCreativeLibrary(_root, viewModel);
  _mounted = false;
}

export function mount(root, ctx) {
  _root = root || _root;
  _ctx = ctx || _ctx;
  if (!_root || _mounted) return;

  console.log('[CreativeLibrary] Mounting event listeners...');

  // Single delegated listener
  _root.addEventListener("input", onInput);
  _root.addEventListener("change", onChange);
  _root.addEventListener("click", onClick);
  _root.addEventListener("keydown", onKeyDown);

  _mounted = true;
  console.log('[CreativeLibrary] Mounted successfully');
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
}

/* ---------------- data ---------------- */

async function fetchCreativeLibraryData(ctx) {
  const client = ctx?.getDataClient ? ctx.getDataClient() : null;

  if (ctx?.ensureMetaConnected && ctx?.appState?.mode === "live") {
    await ctx.ensureMetaConnected();
  }

  if (client?.getCreativeLibraryData) {
    return await client.getCreativeLibraryData(ctx?.appState);
  }

  if (client?.fetchCreatives) {
    const creatives = await client.fetchCreatives(ctx?.appState);
    return { creatives };
  }

  return { creatives: [] };
}

/* ---------------- filtering/sorting ---------------- */

function getFiltered(list) {
  const search = (_filters.search || "").trim().toLowerCase();
  const format = String(_filters.format || "");

  console.log('[CreativeLibrary] Filtering with:', { search, format });

  const filtered = (list || []).filter((c) => {
    if (format && String(c.format || "") !== format) return false;

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
      if (!hay.includes(search)) return false;
    }

    return true;
  });

  console.log('[CreativeLibrary] Filtered:', filtered.length, '/', list.length);
  return filtered;
}

function getSorted(list) {
  const sort = _filters.sort || "roasDesc";
  const arr = [...(list || [])];

  console.log('[CreativeLibrary] Sorting by:', sort);

  const val = (c) => {
    const k = c.kpis || {};
    if (sort === "spendDesc") return Number(k.spend || 0);
    if (sort === "ctrDesc") return Number(k.ctr || 0);
    return Number(k.roas || 0);
  };

  arr.sort((a, b) => val(b) - val(a));
  return arr;
}

function rerenderGrid() {
  if (!_root || !_model) return;
  console.log('[CreativeLibrary] Rerendering grid...');
  const next = getSorted(getFiltered(_model.creatives));
  renderGridOnly(_root, next);
}

/* ---------------- events ---------------- */

function onInput(e) {
  const t = e.target;
  if (!t) return;
  if (t.id === "clSearch") {
    console.log('[CreativeLibrary] Search input:', t.value);
    _filters.search = String(t.value || "");
    rerenderGrid();
  }
}

function onChange(e) {
  const t = e.target;
  if (!t) return;

  if (t.id === "clFormat") {
    console.log('[CreativeLibrary] Format changed:', t.value);
    _filters.format = String(t.value || "");
    rerenderGrid();
  }

  if (t.id === "clSort") {
    console.log('[CreativeLibrary] Sort changed:', t.value);
    _filters.sort = String(t.value || "roasDesc");
    rerenderGrid();
  }
}

function onClick(e) {
  const t = e.target;
  if (!t) return;

  // Upload stub
  if (t.closest?.("#clNewCreativeBtn")) {
    toast("info", "Upload kommt in P2.1 (Storage/Backend).");
    return;
  }

  // Sensei button
  const s = t.closest?.("[data-cl-sensei]");
  if (s) {
    const id = s.getAttribute("data-cl-sensei");
    const c = (_model?.creatives || []).find((x) => String(x.id) === String(id));
    if (c) {
      toast("info", `🧠 Sensei Analyse für "${c.name}" wird geladen...`);
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

  // Select (stub)
  const sel = t.closest?.("[data-cl-select]");
  if (sel) {
    toast("info", "Multi-Select kommt als P2.5 (Bulk Actions).");
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

/* ---------------- actions ---------------- */

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

/* ---------------- css ---------------- */

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
