// packages/creativeLibrary/filters.js
// Filter + Sort (P2 FINAL)

export function createDefaultFilters() {
  return {
    search: "",
    format: "",         // "" = all
    bucket: "all",      // all | winner | solid | testing | attention | dead | paused
    type: "all",        // all | image | video
    sort: "roas-desc",  // roas-desc | roas-asc | spend-desc | spend-asc | ctr-desc | ctr-asc | cpm-asc | cpm-desc
  };
}

export function applyFilters(creatives = [], filters = createDefaultFilters()) {
  const f = { ...createDefaultFilters(), ...(filters || {}) };

  const search = (f.search || "").trim().toLowerCase();
  const format = String(f.format || "");
  const bucket = String(f.bucket || "all").toLowerCase();
  const type = String(f.type || "all").toLowerCase();

  return creatives.filter((c) => {
    if (format && String(c.format || "") !== format) return false;

    if (bucket !== "all") {
      const s = String(c.status || "testing").toLowerCase();
      if (s !== bucket) return false;
    }

    if (type !== "all") {
      const t = String(c.type || "image").toLowerCase();
      if (t !== type) return false;
    }

    if (search) {
      const hay = [
        c.name,
        c.brand,
        c.format,
        c.type,
        c.status,
        c.campaignName,
        c.adsetName,
        c.primaryText,
        c.headline,
        ...(c.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!hay.includes(search)) return false;
    }

    return true;
  });
}

export function applySort(creatives = [], sortId = "roas-desc") {
  const id = String(sortId || "roas-desc");
  const [field, direction] = id.split("-");
  const dir = direction === "asc" ? 1 : -1;

  const val = (c) => {
    const k = c.kpis || {};
    switch (field) {
      case "spend":
        return Number(k.spend || 0);
      case "ctr":
        return Number(k.ctr || 0);
      case "cpm":
        return Number(k.cpm || 0);
      case "roas":
      default:
        return Number(k.roas || 0);
    }
  };

  return [...creatives].sort((a, b) => {
    const av = val(a);
    const bv = val(b);
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });
}
