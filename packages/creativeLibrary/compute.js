// packages/creativeLibrary/compute.js
// Titanium Creative Library – normalize + robust fallbacks (P2 FINAL FIX)

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeStatus(raw) {
  const s = String(raw || "").toLowerCase();
  if (!s) return "testing";
  if (s.includes("scale") || s.includes("winner")) return "winner";
  if (s.includes("test")) return "testing";
  if (s.includes("pause")) return "paused";
  if (s.includes("dead") || s.includes("arch")) return "dead";
  if (s.includes("retest")) return "attention";
  return "testing";
}

function normalizeType(raw) {
  const t = String(raw || "").toLowerCase();
  if (!t) return "image";
  if (t.includes("video") || t.includes("ugc") || t.includes("reel")) return "video";
  if (t.includes("static") || t.includes("image")) return "image";
  return raw;
}

function makeSvgThumb(title = "Creative") {
  // Lightweight offline-safe thumbnail (works even without external images)
  const safe = String(title).slice(0, 28);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#b6ccff"/>
          <stop offset="1" stop-color="#d9c7ff"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="240" cy="190" r="120" fill="rgba(255,255,255,0.25)"/>
      <circle cx="920" cy="600" r="220" fill="rgba(255,255,255,0.18)"/>
      <text x="70" y="710" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto" font-size="56" font-weight="800" fill="rgba(15,23,42,0.85)">
        ${escapeXml(safe)}
      </text>
      <text x="72" y="760" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto" font-size="28" font-weight="700" fill="rgba(15,23,42,0.55)">
        SignalOne • Demo Preview
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeCreative(raw, idx) {
  const id = raw?.id || raw?.creative_id || raw?.ad_id || `c-${idx + 1}`;
  const name = raw?.name || raw?.title || raw?.creative_name || raw?.ad_name || `Creative #${idx + 1}`;
  const brand = raw?.brand || raw?.accountName || raw?.ad_account_name || "Unbekannte Brand";
  const format = raw?.format || raw?.placement || raw?.ad_format || "Unknown";
  const status = normalizeStatus(raw?.status || raw?.bucket || raw?.lifecycle);
  const type = normalizeType(raw?.type || raw?.asset_type || raw?.media_type || raw?.category);

  const impressions = safeNumber(raw?.impressions || raw?.kpis?.impressions);
  const clicks = safeNumber(raw?.clicks || raw?.kpis?.clicks);
  const spend = safeNumber(raw?.spend || raw?.kpis?.spend);
  const roas = safeNumber(raw?.roas || raw?.kpis?.roas);

  const ctr = impressions > 0 ? clicks / impressions : safeNumber(raw?.ctr || raw?.kpis?.ctr);
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : safeNumber(raw?.cpm || raw?.kpis?.cpm);

  // IMPORTANT: if no thumbUrl is provided (demo/live), generate a deterministic SVG
  const thumbUrl =
    raw?.thumbUrl ||
    raw?.thumbnail_url ||
    raw?.image_url ||
    raw?.thumbnail ||
    makeSvgThumb(name);

  return {
    id,
    name,
    brand,
    format,
    status,
    type,
    thumbUrl,

    campaignName: raw?.campaignName || raw?.campaign_name || "",
    adsetName: raw?.adsetName || raw?.adset_name || "",
    tags: Array.isArray(raw?.tags) ? raw.tags : [],

    kpis: {
      roas,
      spend,
      impressions,
      clicks,
      ctr: clamp(ctr || 0, 0, 1),
      cpm: clamp(cpm || 0, 0, 9999),
    },
  };
}

function buildFallbackCreatives() {
  // Previously thumbUrl: "" -> that caused "no images".
  // Now we keep data-uri thumbnails so the UI always has a "real" image.
  return [
    {
      id: "demo-1",
      name: "UGC Hook v3 – Main",
      brand: "SignalOne Demo",
      format: "Story / Reel",
      type: "video",
      roas: 4.8,
      spend: 12340,
      impressions: 185000,
      clicks: 4200,
      status: "winner",
    },
    {
      id: "demo-2",
      name: "Product Focus 2.1",
      brand: "Brand A",
      format: "Feed Video",
      type: "video",
      roas: 3.9,
      spend: 8210,
      impressions: 124000,
      clicks: 3100,
      status: "winner",
    },
    {
      id: "demo-3",
      name: "Static USP Split",
      brand: "Brand B",
      format: "Static",
      type: "image",
      roas: 2.7,
      spend: 4980,
      impressions: 76000,
      clicks: 1400,
      status: "testing",
    },
  ];
}

export function buildCreativeLibraryModel(dataClientPayload) {
  let rawList = [];

  try {
    const p = dataClientPayload;

    // allow payload shapes: { creatives: [] } | { ads: [] } | raw array
    if (Array.isArray(p)) rawList = p;
    else if (p && typeof p === "object") {
      if (Array.isArray(p.creatives)) rawList = p.creatives;
      else if (Array.isArray(p.ads)) rawList = p.ads;
      else if (Array.isArray(p.creativeLibrary)) rawList = p.creativeLibrary;
    }
  } catch (e) {
    console.warn("[CreativeLibrary] Error reading data payload:", e);
  }

  if (!rawList || !rawList.length) rawList = buildFallbackCreatives();

  const creatives = rawList.map(normalizeCreative);

  const totalSpend = creatives.reduce((sum, c) => sum + (c.kpis?.spend || 0), 0);
  const avgRoas =
    creatives.length > 0
      ? creatives.reduce((sum, c) => sum + (c.kpis?.roas || 0), 0) / creatives.length
      : 0;

  const formats = Array.from(new Set(creatives.map((c) => c.format || "Unknown"))).sort();

  return {
    creatives,
    formats,
    summary: {
      totalCreatives: creatives.length,
      totalSpend,
      avgRoas,
    },
  };
}
