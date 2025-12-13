/* ============================================
   SignalOne Demo Creatives – High Quality
   Realistic Stock-Based Dataset
   ============================================ */

export const demoCreatives = [
  /* --------------------------------------------------
     ACME Fashion
  -------------------------------------------------- */
  {
    id: "acme-001",
    brandId: "acme",
    platform: "meta",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
    aspectRatio: "4:5",
    campaignName: "Winter Drops 2024",
    adsetName: "Remarketing – Women",
    primaryText: "New winter essentials. Limited drop.",
    headline: "Shop Winter 2024",
    callToAction: "Shop Now",
    status: "winner",
    tags: ["fashion", "winter", "female"],
    metrics: {
      hookRate: 42,
      retention: 31,
      scrollStop: 2.1
    },
    kpis: {
      ctr: 3.4,
      cpm: 7.8,
      roas: 5.2,
      spend: 2843,
      purchases: 119
    },
    timestamp: Date.now() - 86400 * 1000 * 2
  },
  {
    id: "acme-002",
    brandId: "acme",
    platform: "meta",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    aspectRatio: "9:16",
    campaignName: "Winter Drops 2024",
    adsetName: "TOF Broad",
    primaryText: "Your new everyday look.",
    headline: "Feel the Style",
    callToAction: "Learn More",
    status: "testing",
    tags: ["ugc", "try-on"],
    metrics: {
      hookRate: 28,
      retention: 13,
      scrollStop: 1.3
    },
    kpis: {
      ctr: 1.9,
      cpm: 9.2,
      roas: 2.1,
      spend: 1892,
      purchases: 34
    },
    timestamp: Date.now() - 86400 * 1000 * 4
  },
  {
    id: "acme-003",
    brandId: "acme",
    platform: "meta",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    aspectRatio: "1:1",
    campaignName: "Brand Evergreen",
    adsetName: "Lookalike 2%",
    primaryText: "Premium quality. Modern fit.",
    headline: "Premium Essentials",
    callToAction: "Shop Now",
    status: "solid",
    tags: ["lifestyle", "product"],
    metrics: {
      hookRate: 31,
      retention: 24,
      scrollStop: 1.7
    },
    kpis: {
      ctr: 2.8,
      cpm: 8.4,
      roas: 3.7,
      spend: 1022,
      purchases: 41
    },
    timestamp: Date.now() - 86400 * 1000 * 7
  },
  {
    id: "acme-004",
    brandId: "acme",
    platform: "meta",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1",
    aspectRatio: "9:16",
    campaignName: "New Arrivals",
    adsetName: "Retargeting – 30 Days",
    primaryText: "Our best sellers are back.",
    headline: "Restocked Items",
    callToAction: "Shop Now",
    status: "attention",
    tags: ["low retention"],
    metrics: {
      hookRate: 22,
      retention: 10,
      scrollStop: 1.1
    },
    kpis: {
      ctr: 1.4,
      cpm: 10.2,
      roas: 1.2,
      spend: 512,
      purchases: 8
    },
    timestamp: Date.now() - 86400 * 1000 * 1
  },

  /* --------------------------------------------------
     TECHGADGETS
  -------------------------------------------------- */
  {
    id: "tech-001",
    brandId: "tech",
    platform: "meta",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1510557880182-3f8c55f2f0c6",
    aspectRatio: "1:1",
    campaignName: "Holiday Tech Sale",
    adsetName: "TOF Broad",
    primaryText: "Upgrade your workspace.",
    headline: "Smart Desk Essentials",
    callToAction: "Shop Now",
    status: "winner",
    tags: ["tech", "gadgets"],
    metrics: {
      hookRate: 40,
      retention: 29,
      scrollStop: 2.9
    },
    kpis: {
      ctr: 3.9,
      cpm: 6.8,
      roas: 6.1,
      spend: 5412,
      purchases: 212
    },
    timestamp: Date.now() - 86400 * 1000 * 3
  },
  {
    id: "tech-002",
    brandId: "tech",
    platform: "meta",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    aspectRatio: "9:16",
    campaignName: "Holiday Tech Sale",
    adsetName: "Retargeting – 7 Days",
    primaryText: "Your perfect home office.",
    headline: "Work Smarter",
    callToAction: "Learn More",
    status: "solid",
    tags: ["how-to", "demo"],
    metrics: {
      hookRate: 36,
      retention: 21,
      scrollStop: 1.9
    },
    kpis: {
      ctr: 2.7,
      cpm: 8.1,
      roas: 4.2,
      spend: 2912,
      purchases: 84
    },
    timestamp: Date.now() - 86400 * 1000 * 6
  },
  {
    id: "tech-003",
    brandId: "tech",
    platform: "meta",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    aspectRatio: "16:9",
    campaignName: "Tech Gadgets 2024",
    adsetName: "Lookalike 1%",
    primaryText: "Ultra fine precision.",
    headline: "Pro Tools Lineup",
    callToAction: "Buy Now",
    status: "testing",
    tags: ["demo"],
    metrics: {
      hookRate: 24,
      retention: 18,
      scrollStop: 1.3
    },
    kpis: {
      ctr: 1.8,
      cpm: 9.4,
      roas: 2.8,
      spend: 1612,
      purchases: 32
    },
    timestamp: Date.now() - 86400 * 1000 * 1
  },

  /* --------------------------------------------------
     BEAUTY LUX
  -------------------------------------------------- */
  {
    id: "beauty-001",
    brandId: "beauty",
    platform: "meta",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
    aspectRatio: "9:16",
    campaignName: "Glow Essentials",
    adsetName: "TOF – Beauty Lovers",
    primaryText: "Glow starts here.",
    headline: "New Essentials",
    callToAction: "Shop Now",
    status: "winner",
    tags: ["beauty", "product"],
    metrics: {
      hookRate: 47,
      retention: 36,
      scrollStop: 3.1
    },
    kpis: {
      ctr: 4.1,
      cpm: 6.1,
      roas: 7.4,
      spend: 3984,
      purchases: 176
    },
    timestamp: Date.now() - 86400 * 1000 * 2
  },
  {
    id: "beauty-002",
    brandId: "beauty",
    platform: "meta",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143",
    aspectRatio: "4:5",
    campaignName: "Glow Essentials",
    adsetName: "Retargeting – 14 Days",
    primaryText: "Hydration unlocked.",
    headline: "Feel the Glow",
    callToAction: "Learn More",
    status: "solid",
    tags: ["hydration"],
    metrics: {
      hookRate: 33,
      retention: 22,
      scrollStop: 1.8
    },
    kpis: {
      ctr: 2.9,
      cpm: 8.4,
      roas: 3.9,
      spend: 2231,
      purchases: 67
    },
    timestamp: Date.now() - 86400 * 1000 * 5
  },
  {
    id: "beauty-003",
    brandId: "beauty",
    platform: "meta",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
    aspectRatio: "9:16",
    campaignName: "Holiday Glow Set",
    adsetName: "Lookalike 3%",
    primaryText: "Your glow-up essentials.",
    headline: "Holiday Set 2024",
    callToAction: "Shop Now",
    status: "attention",
    tags: ["low roas"],
    metrics: {
      hookRate: 18,
      retention: 11,
      scrollStop: 0.9
    },
    kpis: {
      ctr: 1.2,
      cpm: 11.4,
      roas: 1.1,
      spend: 812,
      purchases: 11
    },
    timestamp: Date.now() - 86400 * 1000 * 1
  }
];
