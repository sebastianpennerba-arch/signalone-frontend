/* packages/creativeLibrary/sections.js
   Titanium Edition – Render der gesamten Creative Library
*/

import { createCreativeCard } from "./cards.js";
import { applyFilters } from "./filters.js";
import { computeCreativeLibrary } from "./compute.js";
import { openCreativeModal } from "./modal.js";

export function renderCreativeLibrary(rootEl, state) {
  rootEl.innerHTML = "";

  const header = renderHeader();
  const controls = renderControls(state);
  const grid = renderGrid(state);

  rootEl.appendChild(header);
  rootEl.appendChild(controls);
  rootEl.appendChild(grid);
}

/* ---------------- HEADER ---------------- */

function renderHeader() {
  const wrap = document.createElement("div");
  wrap.className = "so-creative-header";

  const title = document.createElement("h1");
  title.className = "so-creative-h1";
  title.textContent = "Creative Library";

  const sub = document.createElement("p");
  sub.className = "so-creative-sub";
  sub.textContent = "Alle Creatives, KPIs und Varianten – Titanium Ready.";

  wrap.appendChild(title);
  wrap.appendChild(sub);
  return wrap;
}

/* ---------------- CONTROLS ---------------- */

function renderControls(state) {
  const wrap = document.createElement("div");
  wrap.className = "so-creative-controls";

  // Search
  const search = document.createElement("input");
  search.className = "so-input";
  search.placeholder = "Suche Creative…";
  search.value = state.search || "";

  search.addEventListener("input", (e) => {
    state.search = e.target.value;
    state.update();
  });

  // Format Filter
  const select = document.createElement("select");
  select.className = "so-select";

  const formats = ["Alle Formate", "Story", "Reel", "Feed", "Static", "UGC"];
  formats.forEach((f) => {
    const op = document.createElement("option");
    op.value = f === "Alle Formate" ? "" : f;
    op.textContent = f;
    if (state.format === op.value) op.selected = true;
    select.appendChild(op);
  });

  select.addEventListener("change", (e) => {
    state.format = e.target.value;
    state.update();
  });

  // Sort
  const sort = document.createElement("select");
  sort.className = "so-select";

  const sortOptions = [
    ["", "Sortierung"],
    ["roas", "ROAS"],
    ["spend", "Spend"],
    ["ctr", "CTR"],
    ["cpm", "CPM"],
  ];

  sortOptions.forEach(([val, label]) => {
    const op = document.createElement("option");
    op.value = val;
    op.textContent = label;
    if (state.sort === val) op.selected = true;
    sort.appendChild(op);
  });

  sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.update();
  });

  wrap.appendChild(search);
  wrap.appendChild(select);
  wrap.appendChild(sort);

  return wrap;
}

/* ---------------- GRID ---------------- */

function renderGrid(state) {
  const wrap = document.createElement("div");
  wrap.className = "so-creative-grid";

  const data = computeCreativeLibrary(state.data);
  const filtered = applyFilters(data, state);

  if (!filtered.length) {
    return renderEmpty();
  }

  filtered.forEach((creative) => {
    const card = createCreativeCard(creative, {
      onOpen: (c) => openCreativeModal(c),
    });
    wrap.appendChild(card);
  });

  return wrap;
}

/* ---------------- EMPTY STATE ---------------- */

function renderEmpty() {
  const wrap = document.createElement("div");
  wrap.className = "so-empty";

  const title = document.createElement("div");
  title.className = "so-empty-title";
  title.textContent = "Keine Creatives gefunden";

  const text = document.createElement("div");
  text.className = "so-empty-text";
  text.textContent =
    "Passe deine Filter oder Suchbegriffe an, um mehr Ergebnisse zu sehen.";

  wrap.appendChild(title);
  wrap.appendChild(text);
  return wrap;
}
