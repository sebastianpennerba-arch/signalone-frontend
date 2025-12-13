/* ============================================
   Creative Library – Filter & Sort + Wiring
   ============================================ */

import {
  renderCreativeLibrary,
  renderGridOnly,
  renderEmptyState,
  renderErrorState,
} from "./render.js";
import { wireCreativeLibrary } from "./actions.js";
import { openCreativeModal } from "./modal.js";
import { computeCreativeHealth } from "./health.js";

/* -------------------------------------------
   Basis-Filter-State
------------------------------------------- */

export function createDefaultFilters() {
  return {
    bucket: "all", // all | winner | solid | testing | attention | dead
    type: "all", // all | image | video
    search: "",
    sort: "roas-desc", // roas-desc | roas-asc | spend-desc | spend-asc | ctr-desc | ctr-asc
  };
}

/* -------------------------------------------
   Reines Filter-Logic-Layer
------------------------------------------- */

export function applyFilters(creatives = [], filters = createDefaultFilters()) {
  const search = (filters.search || "").trim().toLowerCase();
  const bucket = filters.bucket || "all";
  const type = filters.type || "all";

  return creatives.filter((c) => {
    if (bucket !== "all") {
      const status = (c.status || "testing").toLowerCase();
      if (status !== bucket.toLowerCase()) return false;
    }

    if (type !== "all") {
      const t = (c.type || "image").toLowerCase();
      if (t !== type.toLowerCase()) return false;
    }

    if (search) {
      const haystack = [
        c.campaignName,
        c.adsetName,
        c.primaryText,
        c.headline,
        ...(c.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function applySort(creatives = [], sortId = "roas-desc") {
  const [field, direction] = sortId.split("-");
  const dir = direction === "asc" ? 1 : -1;

  const valueFor = (c) => {
    switch (field) {
      case "roas":
        return c.kpis?.roas || 0;
      case "spend":
        return c.kpis?.spend || 0;
      case "ctr":
        return c.kpis?.ctr || 0;
      default:
        return c.kpis?.roas || 0;
    }
  };

  return [...creatives].sort((a, b) => {
    const av = valueFor(a);
    const bv = valueFor(b);
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });
}

/* -------------------------------------------
   High-Level: Wiring + Re-Render
   Wird von index.js → mount(root, ctx) aufgerufen
------------------------------------------- */

export function applyCreativeFilters(root, ctx) {
  if (!root) return;

  try {
    const appState = window.SignalOneAppState || {};
    const model = appState.creativeLibraryModel;

    if (!model || !Array.isArray(model.creatives)) {
      const modeLabel = model?.demoMode ? "Demo Mode" : "Live Mode";
      renderEmptyState(root, modeLabel);
      return;
    }

    const modeLabel = model.demoMode ? "Demo Mode" : "Live Mode";

    const deps = {
      formatCurrency,
      formatNumber,
      modeLabel,
    };

    // Filters aus State oder Defaults
    const filters = appState.creativeLibraryFilters
      ? { ...createDefaultFilters(), ...appState.creativeLibraryFilters }
      : createDefaultFilters();

    function getFilteredCreatives() {
      const filtered = applyFilters(model.creatives, filters);
      const sorted = applySort(filtered, filters.sort);
      return sorted;
    }

    // Initialer Render: Header + Controls + Grid
    const initialCreatives = getFilteredCreatives();
    const viewModel = {
      summary: model.summary,
      filters,
      creatives: initialCreatives,
    };

    renderCreativeLibrary(root, viewModel, deps);

    // Filters persistieren
    appState.creativeLibraryFilters = { ...filters };
    window.SignalOneAppState = appState;

    // Event-Wiring
    wireCreativeLibrary(root, {
      onFilterChange(partial) {
        Object.assign(filters, partial);
        window.SignalOneAppState.creativeLibraryFilters = { ...filters };
        const nextCreatives = getFilteredCreatives();
        renderGridOnly(root, nextCreatives, deps);
      },
      onSortChange(sortId) {
        filters.sort = sortId;
        window.SignalOneAppState.creativeLibraryFilters = { ...filters };
        const nextCreatives = getFilteredCreatives();
        renderGridOnly(root, nextCreatives, deps);
      },
      onOpenDetails(id) {
        const creative = findCreativeById(model.creatives, id);
        if (!creative) return;
        openCreativeModal(creative, deps);
      },
      onAnalyzeWithSensei(id) {
        const creative = findCreativeById(model.creatives, id);
        if (!creative) return;

        const k = creative.kpis || {};
        const health = computeCreativeHealth({
          metrics: {
            roas: k.roas,
            ctr: (k.ctr || 0) * 100, // Health-Score arbeitet mit Prozenten
            cpm: k.cpm,
            spend: k.spend,
          },
          bucket: creative.status,
        });

        if (window.SignalOne?.openSenseiForCreative) {
          window.SignalOne.openSenseiForCreative(creative, health);
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

        if (window.SignalOne?.showToast) {
          window.SignalOne.showToast("info", health.reasonShort);
        } else {
          console.log("[CreativeLibrary] Sensei Analyse", { creative, health });
        }
      },
    });
  } catch (err) {
    console.error("[CreativeLibrary] applyCreativeFilters() error", err);
    renderErrorState(root);
  }
}

/* -------------------------------------------
   Helpers
------------------------------------------- */

function findCreativeById(list, id) {
  const idStr = String(id);
  return list.find((c) => String(c.id) === idStr);
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatNumber(value, fractionDigits = 0) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
