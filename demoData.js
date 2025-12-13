// demoData.js
// SignalOne Titanium – Multi-Client Demo Data Engine (Hybrid)
// --------------------------------------------------------------
// Liefert:
//   window.SignalOneDemoData            -> Metadaten zu allen Demo-Clients
//   window.SignalOneCreateDemoClient()  -> erzeugt einen Demo-DataClient
//   window.SignalOneDemoClient          -> Default-Client (Rückwärtskompatibilität)
//
// Jeder Client liefert u.a.:
//   client.id
//   client.label
//   client.vertical
//   client.size       ("small" | "medium" | "large" | "enterprise")
//   client.creatives  (Array normalisierbarer Creatives)
//   client.campaigns  (Array mit Kampagnen-Daten)
//   client.getDashboardData()
//   client.getCampaigns()

(function () {
  "use strict";

  /* =========================================================
     UTILITIES
     ========================================================= */

  function randBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(randBetween(min, max + 1));
  }

  function choice(list) {
    if (!list || !list.length) return null;
    const idx = randInt(0, list.length - 1);
    return list[idx];
  }

  function round(value, digits) {
    const f = Math.pow(10, digits || 0);
    return Math.round(value * f) / f;
  }

  function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /* =========================================================
     THUMBNAIL GENERATOR (MODE B – Fake Real Thumbnails)
     ========================================================= */

  const THUMBS_FASHION = [
    "https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7671210/pexels-photo-7671210.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7671164/pexels-photo-7671164.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7940622/pexels-photo-7940622.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  const THUMBS_HOME = [
    "https://images.pexels.com/photos/3965555/pexels-photo-3965555.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3705530/pexels-photo-3705530.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  const THUMBS_BEAUTY = [
    "https://images.pexels.com/photos/3738085/pexels-photo-3738085.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3738096/pexels-photo-3738096.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3738099/pexels-photo-3738099.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  const THUMBS_ELECTRONICS = [
    "https://images.pexels.com/photos/18104/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1337247/pexels-photo-1337247.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/196646/pexels-photo-196646.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  const THUMBS_GENERIC = [
    "https://images.pexels.com/photos/886521/pexels-photo-886521.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181460/pexels-photo-1181460.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  function pickThumb(vertical) {
    switch (vertical) {
      case "fashion":
        return choice(THUMBS_FASHION);
      case "home":
        return choice(THUMBS_HOME);
      case "beauty":
        return choice(THUMBS_BEAUTY);
      case "electronics":
        return choice(THUMBS_ELECTRONICS);
      default:
        return choice(THUMBS_GENERIC);
    }
  }

  /* =========================================================
     CREATIVE NAME / FORMAT / STATUS GENERATION
     ========================================================= */

  const FORMATS = [
    "Story / Reel",
    "Feed Video",
    "Static",
    "Carousel",
    "Square Video",
  ];

  const TYPES = ["UGC", "Product", "Static", "Founder", "Testimonial"];

  const HOOK_TEMPLATES = [
    "UGC Hook v{n} – Main",
    "Problem/Solution v{n}",
    "Offer Split v{n}",
    "Static USP v{n}",
    "Founder Video v{n}",
    "Testimonial v{n}",
    "Product Focus v{n}",
  ];

  function buildCreativeName(idx) {
    const n = (idx % 5) + 1;
    const base = choice(HOOK_TEMPLATES) || "Creative v{n}";
    return base.replace("{n}", n);
  }

  function deriveStatusFromMetrics(roas, spend) {
    if (roas >= 4 && spend > 15000) return "scaling";
    if (roas >= 3 && spend > 7000) return "winner";
    if (roas >= 1.4 && spend > 2000) return "testing";
    if (spend < 1000) return "paused";
    return "retest";
  }

  /* =========================================================
     CLIENT DEFINITIONS (8 Demo-Kunden)
     ========================================================= */

  const DEMO_CLIENT_DEFS = [
    {
      id: "acme-fashion",
      label: "ACME Fashion",
      vertical: "fashion",
      size: "enterprise",
      creativesMin: 80,
      creativesMax: 160,
      baseSpendPerCreative: [2000, 25000],
      roasRange: [3.2, 5.4],
      cpmRange: [7, 14],
      ctrRange: [1.1, 3.2],
      aovRange: [60, 120],
    },
    {
      id: "brandx-home",
      label: "BrandX Home",
      vertical: "home",
      size: "large",
      creativesMin: 40,
      creativesMax: 80,
      baseSpendPerCreative: [1500, 15000],
      roasRange: [2.4, 4.0],
      cpmRange: [5, 12],
      ctrRange: [0.9, 2.5],
      aovRange: [80, 220],
    },
    {
      id: "fashionco-beauty",
      label: "FashionCo Beauty",
      vertical: "beauty",
      size: "medium",
      creativesMin: 25,
      creativesMax: 60,
      baseSpendPerCreative: [800, 9000],
      roasRange: [2.8, 4.8],
      cpmRange: [8, 18],
      ctrRange: [1.3, 3.8],
      aovRange: [40, 90],
    },
    {
      id: "electronics24",
      label: "Electronics24",
      vertical: "electronics",
      size: "enterprise",
      creativesMin: 90,
      creativesMax: 200,
      baseSpendPerCreative: [3000, 40000],
      roasRange: [1.3, 3.2],
      cpmRange: [10, 24],
      ctrRange: [0.4, 1.4],
      aovRange: [180, 600],
    },
    {
      id: "signalone-demo",
      label: "SignalOne Demo Brand",
      vertical: "generic",
      size: "medium",
      creativesMin: 30,
      creativesMax: 70,
      baseSpendPerCreative: [1500, 20000],
      roasRange: [2.0, 4.5],
      cpmRange: [7, 18],
      ctrRange: [0.8, 2.8],
      aovRange: [70, 170],
    },
    {
      id: "urbanfit-studio",
      label: "UrbanFit Studio",
      vertical: "fitness",
      size: "small",
      creativesMin: 6,
      creativesMax: 18,
      baseSpendPerCreative: [600, 4500],
      roasRange: [1.6, 3.0],
      cpmRange: [5, 12],
      ctrRange: [0.7, 2.0],
      aovRange: [40, 120],
    },
    {
      id: "greensnacks",
      label: "GreenSnacks D2C",
      vertical: "food",
      size: "small",
      creativesMin: 2,
      creativesMax: 12,
      baseSpendPerCreative: [300, 2600],
      roasRange: [1.4, 2.8],
      cpmRange: [4, 10],
      ctrRange: [0.9, 3.1],
      aovRange: [20, 60],
    },
    {
      id: "saasify-tools",
      label: "SaaSify Tools",
      vertical: "saas",
      size: "medium",
      creativesMin: 15,
      creativesMax: 35,
      baseSpendPerCreative: [800, 9000],
      roasRange: [1.8, 3.6],
      cpmRange: [15, 40],
      ctrRange: [0.4, 1.5],
      aovRange: [150, 450],
    },
  ];

  const DEFAULT_CLIENT_ID = "signalone-demo";

  /* =========================================================
     CREATIVE GENERATION PER CLIENT
     ========================================================= */

  function generateCreativesForClient(def) {
    const count = randInt(def.creativesMin, def.creativesMax);
    const list = [];

    for (let i = 0; i < count; i++) {
      const format = choice(FORMATS);
      const type = choice(TYPES);

      const spend = randBetween(
        def.baseSpendPerCreative[0],
        def.baseSpendPerCreative[1]
      );
      const roas = randBetween(def.roasRange[0], def.roasRange[1]);
      const revenue = spend * roas;

      const cpm = randBetween(def.cpmRange[0], def.cpmRange[1]);
      const impressions = (spend / cpm) * 1000;

      const ctr = randBetween(def.ctrRange[0], def.ctrRange[1]);
      const clicks = impressions * (ctr / 100);

      const status = deriveStatusFromMetrics(roas, spend);

      const creative = {
        id: createId(def.id),
        name: buildCreativeName(i),
        brand: def.label,
        format,
        type,
        roas: round(roas, 2),
        spend: Math.round(spend),
        impressions: Math.round(impressions),
        clicks: Math.round(clicks),
        status,
        thumbUrl: pickThumb(def.vertical),
      };

      list.push(creative);
    }

    return list;
  }

  /* =========================================================
     CAMPAIGN GENERATION PER CLIENT (Option B)
     ========================================================= */

  const CAMPAIGN_OBJECTIVES = [
    "Conversions",
    "Sales",
    "Leads",
    "Traffic",
    "Awareness",
  ];

  const CAMPAIGN_NAME_TEMPLATES = {
    fashion: [
      "Always On – Prospecting",
      "Always On – Retargeting",
      "Launch – New Collection",
      "Promo – Mid Season Sale",
      "UGC Test Funnel",
    ],
    home: [
      "Always On – Home Essentials",
      "Static Offer Residency",
      "Retargeting – Add to Cart",
      "Bundle Promo",
    ],
    beauty: [
      "Launch – New Routine",
      "UGC Skin Funnel",
      "Retargeting – PDP Visitors",
      "Reactivation – Past Buyers",
    ],
    electronics: [
      "Performance Max – Laptops",
      "Prospecting – Electronics",
      "Retargeting – PDP & Cart",
      "High Ticket Promo",
    ],
    generic: [
      "Always On – Performance",
      "Testing – Creative Lab",
      "Retargeting – High Intent",
      "Offer Promo",
    ],
    fitness: [
      "New Membership Funnel",
      "7-Day Trial Campaign",
      "Retargeting – Website Visitors",
    ],
    food: [
      "Snack Box Launch",
      "Always On – D2C Snacks",
      "Retargeting – Add to Cart",
    ],
    saas: [
      "Free Trial – Acquisition",
      "Demo Request Funnel",
      "Retargeting – Signups",
    ],
  };

  function getCampaignNamePool(vertical) {
    return (
      CAMPAIGN_NAME_TEMPLATES[vertical] ||
      CAMPAIGN_NAME_TEMPLATES.generic ||
      ["Always On Campaign", "Testing Campaign"]
    );
  }

  function getCampaignCountForSize(size) {
    // Option B:
    // kleine: 2–5; mittlere: 5–10; enterprise: 10–18; large ≈ 8–14
    switch (size) {
      case "small":
        return [2, 5];
      case "medium":
        return [5, 10];
      case "large":
        return [8, 14];
      case "enterprise":
        return [10, 18];
      default:
        return [3, 8];
    }
  }

  function generateCampaignsForClient(def, creatives) {
    const [minC, maxC] = getCampaignCountForSize(def.size);
    let count = randInt(minC, maxC);
    if (creatives.length && count > creatives.length) {
      count = Math.max(2, Math.floor(creatives.length / 2));
    }
    if (count <= 0) count = 2;

    const pool = getCampaignNamePool(def.vertical);
    const campaigns = [];
    const buckets = Array.from({ length: count }, () => []);

    // Creatives gleichmäßig auf Kampagnen verteilen
    creatives.forEach((c, idx) => {
      const bucketIndex = idx % count;
      buckets[bucketIndex].push(c);
    });

    for (let i = 0; i < count; i++) {
      const cList = buckets[i];
      const name = choice(pool) || `Campaign ${i + 1}`;
      const objective =
        choice(CAMPAIGN_OBJECTIVES) || "Conversions";

      let totalSpend = 0;
      let totalRevenue = 0;
      let totalImpr = 0;
      let totalClicks = 0;

      cList.forEach((c) => {
        const spend = Number(c.spend) || 0;
        const roas = Number(c.roas) || 0;
        const impr = Number(c.impressions) || 0;
        const clicks = Number(c.clicks) || 0;

        totalSpend += spend;
        totalRevenue += spend * roas;
        totalImpr += impr;
        totalClicks += clicks;
      });

      const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
      const ctr =
        totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
      const cpm =
        totalImpr > 0 ? (totalSpend / totalImpr) * 1000 : 0;
      const cpc =
        totalClicks > 0 ? totalSpend / totalClicks : 0;

      const status = deriveStatusFromMetrics(roas, totalSpend);

      const dailyBudget =
        def.size === "enterprise"
          ? randBetween(800, 4500)
          : def.size === "large"
          ? randBetween(400, 2000)
          : def.size === "medium"
          ? randBetween(150, 800)
          : randBetween(50, 350);

      const campaignId = createId(def.id + "-cmp");

      const campaign = {
        id: campaignId,
        name,
        objective,
        status,
        dailyBudget: Math.round(dailyBudget),
        spend30d: Math.round(totalSpend),
        roas: round(roas, 2),
        impressions: Math.round(totalImpr),
        ctr: round(ctr, 2),
        cpm: round(cpm, 2),
        cpc: round(cpc, 2),
      };

      // Creatives auf Kampagnen zurückreferenzieren
      cList.forEach((c) => {
        c.campaignId = campaignId;
        c.campaignName = name;
      });

      campaigns.push(campaign);
    }

    return campaigns;
  }

  /* =========================================================
     DASHBOARD SUMMARY
     ========================================================= */

  function computeDashboardSummaryFromCreatives(creatives, def) {
    if (!Array.isArray(creatives) || !creatives.length) {
      return {
        totalSpend: 0,
        totalRevenue: 0,
        avgRoas: 0,
        avgCpm: 0,
        avgCtr: 0,
        totalImpr: 0,
        totalClicks: 0,
        hero: {
          kpis: [],
          alerts: [],
        },
      };
    }

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalImpr = 0;
    let totalClicks = 0;
    let sumCpm = 0;
    let sumCtr = 0;

    creatives.forEach((c) => {
      const spend = Number(c.spend) || 0;
      const roas = Number(c.roas) || 0;
      const impr = Number(c.impressions) || 0;
      const clicks = Number(c.clicks) || 0;

      totalSpend += spend;
      totalRevenue += spend * roas;
      totalImpr += impr;
      totalClicks += clicks;

      if (impr > 0) {
        const cpm = (spend / impr) * 1000;
        const ctr = clicks > 0 ? (clicks / impr) * 100 : 0;
        sumCpm += cpm;
        sumCtr += ctr;
      }
    });

    const avgRoas =
      totalSpend > 0 ? round(totalRevenue / totalSpend, 2) : 0;
    const avgCpm =
      creatives.length > 0 ? round(sumCpm / creatives.length, 2) : 0;
    const avgCtr =
      creatives.length > 0 ? round(sumCtr / creatives.length, 2) : 0;

    const alerts = [];

    if (avgRoas < 1.5) {
      alerts.push({
        severity: "high",
        title: "ROAS unter 1,5x",
        description:
          "Gesamt-ROAS ist niedrig. Sensei empfiehlt, schwache Kampagnen zu pausieren und neue Creatives zu testen.",
      });
    } else if (avgRoas < 2.2) {
      alerts.push({
        severity: "medium",
        title: "ROAS im Mittelfeld",
        description:
          "Deine Performance ist stabil, aber nicht optimal. Fokus auf Winner-Varianten.",
      });
    } else {
      alerts.push({
        severity: "low",
        title: "Starke Performance",
        description:
          "Deine Creative-Performance ist stark. Jetzt kannst du skalieren und neue Varianten testen.",
      });
    }

    const heroKpis = [
      {
        id: "spend",
        label: "Ad Spend (30 Tage)",
        value: totalSpend,
        format: "currency",
        trend: avgRoas >= 2 ? "up" : "down",
      },
      {
        id: "revenue",
        label: "Revenue (30 Tage)",
        value: totalRevenue,
        format: "currency",
        trend: "neutral",
      },
      {
        id: "roas",
        label: "Ø ROAS",
        value: avgRoas,
        format: "x",
        trend: avgRoas >= 3 ? "up" : avgRoas >= 2 ? "neutral" : "down",
      },
    ];

    return {
      totalSpend: Math.round(totalSpend),
      totalRevenue: Math.round(totalRevenue),
      avgRoas,
      avgCpm,
      avgCtr,
      totalImpr: Math.round(totalImpr),
      totalClicks: Math.round(totalClicks),
      hero: {
        kpis: heroKpis,
        alerts,
        brandLabel: def.label,
        size: def.size,
      },
    };
  }

  // Brand-Metriken für Dashboard v4 (Brand & Campaign aware)
  function buildBrandMetricsFromSummary(summary, weekPerf) {
    const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const weekTrend = (weekPerf || []).map((d, idx) => ({
      day: weekdays[d.dayIndex] || weekdays[idx] || `T${idx + 1}`,
      roas: round(d.roas || 0, 2),
    }));
    const conversions7 = Math.round((summary.totalClicks || 0) * 0.04);

    return {
      spend30: summary.totalSpend || 0,
      revenue30: summary.totalRevenue || 0,
      roas: summary.avgRoas || 0,
      profit30:
        (summary.totalRevenue || 0) - (summary.totalSpend || 0),
      weekTrend,
      conversions7,
    };
  }

  function buildWeekPerformance(creatives) {
    const days = 7;
    const values = [];
    let baseSpend = creatives.length ? creatives.length * 150 : 1500;
    for (let i = 0; i < days; i++) {
      const daySpend = baseSpend * randBetween(0.7, 1.4);
      const dayRoas = randBetween(1.4, 4.2);
      values.push({
        dayIndex: i,
        spend: Math.round(daySpend),
        roas: round(dayRoas, 2),
      });
      baseSpend *= randBetween(0.95, 1.05);
    }
    return values;
  }

  /* =========================================================
     DEMO CLIENT FACTORY
     ========================================================= */

  function createDemoClient(def) {
    const creatives = generateCreativesForClient(def);
    const campaigns = generateCampaignsForClient(def, creatives);
    const dashboardSummary = computeDashboardSummaryFromCreatives(
      creatives,
      def
    );
    const weekPerf = buildWeekPerformance(creatives);
    const brandMetrics = buildBrandMetricsFromSummary(
      dashboardSummary,
      weekPerf
    );

    const brand = {
      id: def.id,
      name: def.label,
      label: def.label,
      vertical: def.vertical,
      size: def.size,
      metrics: brandMetrics,
      creatives,
      campaigns,
    };

    const client = {
      id: def.id,
      label: def.label,
      vertical: def.vertical,
      size: def.size,
      creatives,
      campaigns,
      brand,

      // NEU für Dashboard v4: Brand-Getter
      getBrand(requestedId) {
        if (!requestedId || requestedId === def.id) {
          return brand;
        }
        // DemoClient hat nur 1 Brand – zur Sicherheit trotzdem zurückgeben
        return brand;
      },

      getDashboardData() {
        return {
          summary: dashboardSummary,
          weekPerformance: weekPerf,
          topCreatives: creatives
            .slice()
            .sort((a, b) => (b.roas || 0) - (a.roas || 0))
            .slice(0, 5),
          campaigns,
        };
      },

      getCreativeLibraryData() {
        return creatives;
      },

      getCampaigns() {
        return campaigns;
      },
    };

    return client;
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */

  const demoClientsMeta = DEMO_CLIENT_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    vertical: def.vertical,
    size: def.size,
    creativesMin: def.creativesMin,
    creativesMax: def.creativesMax,
  }));

  const SignalOneDemoData = {
    defaultClientId: DEFAULT_CLIENT_ID,
    clients: demoClientsMeta,
  };

  function SignalOneCreateDemoClient(clientId) {
    const id = clientId || DEFAULT_CLIENT_ID;
    const def =
      DEMO_CLIENT_DEFS.find((c) => c.id === id) ||
      DEMO_CLIENT_DEFS.find((c) => c.id === DEFAULT_CLIENT_ID) ||
      DEMO_CLIENT_DEFS[0];

    return createDemoClient(def);
  }

  window.SignalOneDemoData = SignalOneDemoData;
  window.SignalOneCreateDemoClient = SignalOneCreateDemoClient;
  window.SignalOneDemoClient = SignalOneCreateDemoClient(DEFAULT_CLIENT_ID);
})();
