// packages/creativeLibrary/compute.js
// ✅ Titanium Creative Library – Datenaufbereitung & Fallbacks

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCreative(raw, idx) {
  if (!raw || typeof raw !== "object") {
    return {
      id: `demo-${idx}`,
      name: `Demo Creative #${idx + 1}`,
      brand: "SignalOne Demo",
      format: "Feed Video",
      type: "UGC",
      roas: 3.2,
      spend: 12340,
      impressions: 150000,
      clicks: 3200,
      status: "scaling",
      thumbUrl: "",
    };
  }

  return {
    id: raw.id || raw.creative_id || `c-${idx}`,
    name:
      raw.name ||
      raw.title ||
      raw.creative_name ||
      raw.ad_name ||
      `Creative #${idx + 1}`,
    brand: raw.brand || raw.accountName || raw.ad_account_name || "Unbekannte Brand",
    format: raw.format || raw.placement || raw.ad_format || "Unknown",
    type: raw.type || raw.category || "Creative",
    roas: safeNumber(raw.roas || raw.roas_7d || raw.roas_30d),
    spend: safeNumber(raw.spend || raw.spend_7d || raw.spend_30d),
    impressions: safeNumber(raw.impressions || raw.impr),
    clicks: safeNumber(raw.clicks || raw.ctr_clicks),
    status: raw.status || raw.lifecycle || "unknown",
    thumbUrl: raw.thumbUrl || raw.thumbnail_url || raw.image_url || "",
  };
}

function buildFallbackCreatives() {
  return [
    {
      id: "demo-1",
      name: "UGC Hook v3 – Main",
      brand: "SignalOne Demo",
      format: "Story / Reel",
      type: "UGC",
      roas: 4.8,
      spend: 12340,
      impressions: 185000,
      clicks: 4200,
      status: "scaling",
      thumbUrl: "",
    },
    {
      id: "demo-2",
      name: "Product Focus 2.1",
      brand: "Brand A",
      format: "Feed Video",
      type: "Product",
      roas: 3.9,
      spend: 8210,
      impressions: 124000,
      clicks: 3100,
      status: "winner",
      thumbUrl: "",
    },
    {
      id: "demo-3",
      name: "Static USP Split",
      brand: "Brand B",
      format: "Static",
      type: "Static",
      roas: 2.7,
      spend: 4980,
      impressions: 76000,
      clicks: 1400,
      status: "retest",
      thumbUrl: "",
    },
  ];
}

export function buildCreativeLibraryModel(dataClient) {
  let rawList = [];

  try {
    if (dataClient) {
      if (Array.isArray(dataClient.creatives)) {
        rawList = dataClient.creatives;
      } else if (Array.isArray(dataClient.ads)) {
        rawList = dataClient.ads;
      } else if (Array.isArray(dataClient.creativeLibrary)) {
        rawList = dataClient.creativeLibrary;
      }
    }
  } catch (e) {
    console.warn("[CreativeLibrary] Error reading dataClient:", e);
  }

  if (!rawList || !rawList.length) {
    rawList = buildFallbackCreatives();
  }

  const creatives = rawList.map(normalizeCreative);

  const totalSpend = creatives.reduce((sum, c) => sum + c.spend, 0);
  const avgRoas =
    creatives.length > 0
      ? creatives.reduce((sum, c) => sum + c.roas, 0) / creatives.length
      : 0;

  const byBrand = new Map();
  creatives.forEach((c) => {
    const key = c.brand || "Unbekannt";
    const prev = byBrand.get(key) || { spend: 0, creatives: 0 };
    prev.spend += c.spend;
    prev.creatives += 1;
    byBrand.set(key, prev);
  });

  const brandSummary = Array.from(byBrand.entries())
    .map(([brand, stats]) => ({
      brand,
      spend: stats.spend,
      creatives: stats.creatives,
    }))
    .sort((a, b) => b.spend - a.spend);

  const formats = Array.from(
    new Set(creatives.map((c) => c.format || "Unknown"))
  ).sort();

  const summary = {
    totalCreatives: creatives.length,
    totalSpend,
    avgRoas,
    brands: brandSummary,
  };

  return {
    creatives,
    formats,
    summary,
  };
}
