// packages/creativeLibrary/cards.js
// Titanium Edition – Zero Inline Styles, Premium SaaS Layout

export function createCreativeCard(creative, deps = {}) {
  const { onOpen } = deps;

  const el = document.createElement("div");
  el.className = "so-creative-card";
  el.dataset.id = creative.id;

  // Thumbnail
  const thumb = document.createElement("div");
  thumb.className = "so-creative-thumb";
  thumb.style.backgroundImage = `url(${creative.thumbnail || ""})`;

  // Title Row
  const titleRow = document.createElement("div");
  titleRow.className = "so-creative-title-row";

  const title = document.createElement("div");
  title.className = "so-creative-title";
  title.textContent = creative.name || "Unnamed Creative";

  const tag = document.createElement("div");
  tag.className = "so-creative-tag";
  tag.textContent = creative.format || "Unknown";

  titleRow.appendChild(title);
  titleRow.appendChild(tag);

  // KPI Section
  const kpi = document.createElement("div");
  kpi.className = "so-creative-kpis";

  kpi.appendChild(
    createKpiChip("ROAS", creative.roas ? creative.roas + "x" : "–")
  );
  kpi.appendChild(
    createKpiChip("Spend", creative.spend ? "€" + creative.spend : "–")
  );
  kpi.appendChild(
    createKpiChip("CTR", creative.ctr ? creative.ctr + "%" : "–")
  );
  kpi.appendChild(
    createKpiChip("CPM", creative.cpm ? "€" + creative.cpm : "–")
  );

  // Status
  const status = document.createElement("div");
  status.className = "so-creative-status " + getStatusClass(creative.status);
  status.textContent = creative.status || "Unknown";

  // Click handler for modal
  el.addEventListener("click", () => {
    if (onOpen) onOpen(creative);
  });

  // Composition
  el.appendChild(thumb);
  el.appendChild(titleRow);
  el.appendChild(kpi);
  el.appendChild(status);

  return el;
}

export function createKpiChip(label, value) {
  const el = document.createElement("div");
  el.className = "so-kpi-chip";

  const l = document.createElement("span");
  l.className = "so-kpi-label";
  l.textContent = label;

  const v = document.createElement("span");
  v.className = "so-kpi-value";
  v.textContent = value;

  el.appendChild(l);
  el.appendChild(v);
  return el;
}

function getStatusClass(s) {
  if (!s) return "so-status-unknown";
  const x = s.toLowerCase();
  if (x.includes("winner")) return "so-status-success";
  if (x.includes("scaling")) return "so-status-success";
  if (x.includes("testing")) return "so-status-warning";
  if (x.includes("paused")) return "so-status-danger";
  return "so-status-neutral";
}
