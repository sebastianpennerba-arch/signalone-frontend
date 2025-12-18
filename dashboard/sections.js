/* =========================================================
   SIGNALONE – DASHBOARD SECTIONS (FINAL)
   Responsibility:
   - Declarative definition of dashboard sections
   - NO DOM manipulation
   - NO data computation
   - Pure configuration + render instructions
   ---------------------------------------------------------
   Consumed by:
   - render.js
   - index.js
   ========================================================= */

/**
 * Section IDs are used by render.js
 * Order matters
 */

export const DASHBOARD_SECTIONS = [
  {
    id: "hero",
    type: "hero",
    title: null,
    description: null,
  },

  {
    id: "kpiGrid",
    type: "kpi-grid",
    title: "Account Snapshot",
    description: "Schnelle Übersicht der wichtigsten Kennzahlen",
  },

  {
    id: "weeklyTrend",
    type: "trend",
    title: "Weekly Performance Trend",
    description: "ROAS-Entwicklung über die letzten 7 Tage",
  },

  {
    id: "alerts",
    type: "alerts",
    title: "Performance Alerts",
    description: "Automatische Hinweise & Empfehlungen",
  },

  {
    id: "performance",
    type: "table",
    title: "Performance Breakdown",
    description: "Aggregierte Metriken im Überblick",
  },
];

/* =========================================================
   Section helpers (optional metadata)
   ========================================================= */

/**
 * Returns section config by id
 */
export function getDashboardSection(id) {
  return DASHBOARD_SECTIONS.find((s) => s.id === id) || null;
}

/**
 * Returns ordered list of section ids
 */
export function getDashboardSectionOrder() {
  return DASHBOARD_SECTIONS.map((s) => s.id);
}

/**
 * Guard: check if section exists
 */
export function hasDashboardSection(id) {
  return DASHBOARD_SECTIONS.some((s) => s.id === id);
}

/* =========================================================
   Section render rules
   ========================================================= */

/**
 * These flags are consumed by render.js
 * to decide how to render / skip sections
 */
export const SECTION_RULES = {
  hero: {
    required: true,
    emptyState: false,
  },

  "kpi-grid": {
    required: false,
    emptyState: true,
  },

  trend: {
    required: false,
    emptyState: true,
  },

  alerts: {
    required: false,
    emptyState: true,
    maxItems: 3,
  },

  table: {
    required: false,
    emptyState: true,
  },
};

/**
 * Returns render rules for a given section type
 */
export function getSectionRules(type) {
  return SECTION_RULES[type] || { required: false, emptyState: true };
}
