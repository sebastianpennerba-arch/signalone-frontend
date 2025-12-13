// packages/creativeLibrary/compute.js
// Titanium Creative Library – Normalisierung + KPIs + robuste Demo-Thumbnails

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
  if (s.includes("winner") || s.includes("scale") || s.includes("scaling")) return "winner";
  if (s.includes("test")) return "testing";
  if (s.includes("pause")) return "paused";
  if (s.includes("dead") || s.includes("loser") || s.includes("kill")) return "dead";
  if (s.includes("solid")) return "solid";
  if (s.includes("attention") || s.includes("watch")) return "attention";
  return "testing";
}

function normalizeType(raw) {
  const t = String(raw || "").toLowerCase();
  if (!t) return "image";
  if (t.includes("video") || t.includes("reel")) return "video";
  if (t.includes("image") || t.includes("static")) return "image";
  return raw;
}

function hashColor(seed) {
  let h = 0;
  const s = String(seed || "SignalOne");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const a = 200 + (h % 55); // 200-254
  const b = 120 + ((h >> 8) % 90); // 120-209
  const c = 180 + ((h >> 16) % 60); // 180-239
  return { a, b, c };
}

function makeThumbDataURI(title, subtitle) {
  const { a, b, c } = hashColor(title);
  const safeTitle = String(title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeSub = String(subtitle || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="rgb(${a}, ${b}, 255)" stop-opacity="0.92"/>
        <stop offset="1" stop-color="rgb(180, ${c}, 255)" stop-opacity="0.82"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="25%" r="75%">
        <stop offset="0" stop-color="white" stop-opacity="0.35"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="700" fill="url(#g)"/>
    <rect width="1200" height="700" fill="url(#r)"/>
    <text x="60" y="520" font-family="Inter, system-ui, Arial" font-size="54" font-weight="800" fill="rgba(15,23,42,0.88)">${safeTitle}</text>
    <text x="60" y="585" font-family="Inter, system-ui, Arial" font-size="28" font-weight="700" fill="rgba(15,23,42,0.60)">${safeSub}</text>
    <text x="60" y="110" font-family="Inter, system-ui, Arial" font-size="18" font-weight="800" fill="rgba(255,255,255,0.85)">SIGNALONE • DEMO</text>
  </svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function normalizeCreative(raw, idx) {
  if (!raw || typeof raw !== "object") return buildDemoCreative(idx);

  const id = raw.id || raw.creative_id || raw.ad_id || `c-${idx}`;
  const name = raw.name || raw.title || raw.creative_name || raw.ad_name || `Creative #${idx + 1}`;
  const brand = raw.brand || raw.accountName || raw.ad_account_name || "Unbekannte Brand";
  const format = raw.format || raw.placement || raw.ad_format || "Unknown";

  const thumbUrl =
    raw.thumbUrl ||
    raw.thumbnail_url ||
    raw.image_url ||
    raw.thumbnail ||
    "";

  const impressions = safeNumber(raw.impressions || raw.impr || raw.kpis?.impressions);
  const clicks = safeNumber(raw.clicks || raw.ctr_clicks || raw.kpis?.clicks);
  const spend = safeNumber(raw.spend || raw.spend_7d || raw.spend_30d || raw.kpis?.spend);
  const roas = safeNumber(raw.roas || raw.roas_7d || raw.roas_30d || raw.kpis?.roas);

  const ctr = impressions > 0 ? (clicks / impressions) : safeNumber(raw.ctr || raw.kpis?.ctr);
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : safeNumber(raw.cpm || raw.kpis?.cpm);

  const status = normalizeStatus(raw.status || raw.lifecycle || raw.bucket);
  const type = normalizeType(raw.type || raw.asset_type || raw.media_type || raw.category || "image");

  const finalThumb = thumbUrl && String(thumbUrl).trim()
    ? thumbUrl
    : makeThumbDataURI(name, `${brand} • ${format}`);

  return {
    id,
    name,
    brand,
    format,
    type,
    status,
    thumbUrl: finalThumb,

    roas,
    spend,
    impressions,
    clicks,
    ctr: clamp(ctr || 0, 0, 1),
    cpm: clamp(cpm || 0, 0, 9999),

    kpis: {
      roas,
      spend,
      impressions,
      clicks,
      ctr: clamp(ctr || 0, 0, 1),
      cpm: clamp(cpm || 0, 0, 9999),
    },

    tags: Array.isArray(raw.tags) ? raw.tags : [],
    campaignName: raw.campaignName || raw.campaign_name || "",
    adsetName: raw.adsetName || raw.adset_name || "",
    primaryText: raw.primaryText || raw.primary_text || "",
    headline: raw.headline || raw.title_text || "",
  };
}

function buildDemoCreative(idx) {
  const demo = [
    {
      name: "UGC Hook v3 – Main",
      brand: "SignalOne Demo",
      format: "Story / Reel",
      type: "video",
      status: "winner",
      roas: 4.8,
      spend: 12340,
      impressions: 185000,
      clicks: 4200,
    },
    {
      name: "Product Focus 2.1",
      brand: "Brand A",
      format: "Feed Video",
      type: "video",
      status: "winner",
      roas: 3.9,
      spend: 8210,
      impressions: 124000,
      clicks: 3100,
    },
    {
      name: "Static USP Split",
      brand: "Brand B",
      format: "Static",
      type: "image",
      status: "testing",
      roas: 2.7,
      spend: 4980,
      impressions: 76000,
      clicks: 1400,
    },
  ];

  const base = demo[idx % demo.length];
  const id = `demo-${idx + 1}`;

  const impressions = safeNumber(base.impressions);
  const clicks = safeNumber(base.clicks);
  const spend = safeNumber(base.spend);
  const roas = safeNumber(base.roas);

  const ctr = impressions > 0 ? clicks / impressions : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;

  return {
    id,
    name: base.name,
    brand: base.brand,
    format: base.format,
    type: base.type,
    status: base.status,
    thumbUrl: makeThumbDataURI(base.name, `${base.brand} • ${base.format}`),

    roas,
    spend,
    impressions,
    clicks,
    ctr,
    cpm,

    kpis: { roas, spend, impressions, clicks, ctr, cpm },
    tags: [],
    campaignName: "",
    adsetName: "",
    primaryText: "",
    headline: "",
  };
}

export function buildCreativeLibraryModel(dataClientPayload) {
  let rawList = [];

  if (Array.isArray(dataClientPayload)) {
    rawList = dataClientPayload;
  } else if (dataClientPayload && typeof dataClientPayload === "object") {
    if (Array.isArray(dataClientPayload.creatives)) rawList = dataClientPayload.creatives;
    else if (Array.isArray(dataClientPayload.ads)) rawList = dataClientPayload.ads;
    else if (Array.isArray(dataClientPayload.creativeLibrary)) rawList = dataClientPayload.creativeLibrary;
  }

  if (!rawList.length) {
    rawList = Array.from({ length: 9 }).map((_, i) => null).map((x, i) => buildDemoCreative(i));
  }

  const creatives = rawList.map(normalizeCreative);

  const totalSpend = creatives.reduce((sum, c) => sum + safeNumber(c.kpis?.spend), 0);
  const avgRoas =
    creatives.length > 0
      ? creatives.reduce((sum, c) => sum + safeNumber(c.kpis?.roas), 0) / creatives.length
      : 0;

  const byBrand = new Map();
  creatives.forEach((c) => {
    const key = c.brand || "Unbekannt";
    const prev = byBrand.get(key) || { spend: 0, creatives: 0 };
    prev.spend += safeNumber(c.kpis?.spend);
    prev.creatives += 1;
    byBrand.set(key, prev);
  });

  const brandSummary = Array.from(byBrand.entries())
    .map(([brand, stats]) => ({ brand, spend: stats.spend, creatives: stats.creatives }))
    .sort((a, b) => b.spend - a.spend);

  const formats = Array.from(new Set(creatives.map((c) => c.format || "Unknown"))).sort();

  return {
    creatives,
    formats,
    summary: {
      totalCreatives: creatives.length,
      totalSpend,
      avgRoas,
      brands: brandSummary,
    },
  };
}
