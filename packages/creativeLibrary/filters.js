// packages/creativeLibrary/filters.js
// P2 FINAL – defensive, no crashes, no globals

/**
 * Apply KPI-based filters to creatives.
 * This function is PURE and NEVER assumes filters exist.
 */

export function applyFilters(creatives = [], filters = {}) {
  const list = Array.isArray(creatives) ? creatives : [];

  const minRoas =
    Number.isFinite(filters.minRoas) ? filters.minRoas : null;
  const maxRoas =
    Number.isFinite(filters.maxRoas) ? filters.maxRoas : null;

  const format = typeof filters.format === "string" && filters.format
    ? filters.format
    : null;

  const search =
    typeof filters.search === "string"
      ? filters.search.trim().toLowerCase()
      : "";

  return list.filter((c) => {
    if (!c) return false;

    const roas = Number(c?.kpis?.roas || 0);

    if (minRoas !== null && roas < minRoas) return false;
    if (maxRoas !== null && roas > maxRoas) return false;

    if (format && String(c.format || "") !== format) return false;

    if (search) {
      const haystack = [
        c.name,
        c.brand,
        c.format,
        c.type,
        c.status,
        c.campaignName,
        c.adsetName,
        ...(Array.isArray(c.tags) ? c.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

/**
 * Sort creatives by KPI.
 * Never crashes if kpis are missing.
 */
export function applySort(creatives = [], sort = "roasDesc") {
  const list = Array.isArray(creatives) ? [...creatives] : [];

  const valueOf = (c) => {
    const k = c?.kpis || {};
    if (sort === "spendDesc") return Number(k.spend || 0);
    if (sort === "ctrDesc") return Number(k.ctr || 0);
    return Number(k.roas || 0);
  };

  list.sort((a, b) => valueOf(b) - valueOf(a));
  return list;
}
