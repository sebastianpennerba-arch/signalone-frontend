/**
 * SignalOne Titanium - FULL Demo Data Engine
 * 8 Brands | 80-200 Creatives | Enterprise-Grade Simulation
 */

// ===================================
// 8 DEMO BRANDS (ORIGINAL SPEC)
// ===================================

const DEMO_BRANDS = [
  {
    id: 'acme-fashion',
    name: 'ACME Fashion',
    vertical: 'fashion',
    size: 'enterprise',
    creativeCount: { min: 80, max: 160 },
    campaignCount: { min: 10, max: 18 },
    logo: '/logos/acme.svg'
  },
  {
    id: 'brandx-home',
    name: 'BrandX Home',
    vertical: 'home',
    size: 'large',
    creativeCount: { min: 40, max: 80 },
    campaignCount: { min: 8, max: 14 },
    logo: '/logos/brandx.svg'
  },
  {
    id: 'fashionco-beauty',
    name: 'FashionCo Beauty',
    vertical: 'beauty',
    size: 'medium',
    creativeCount: { min: 25, max: 60 },
    campaignCount: { min: 5, max: 10 },
    logo: '/logos/fashionco.svg'
  },
  {
    id: 'electronics24',
    name: 'Electronics24',
    vertical: 'electronics',
    size: 'enterprise',
    creativeCount: { min: 90, max: 200 },
    campaignCount: { min: 10, max: 18 },
    logo: '/logos/electronics.svg'
  },
  {
    id: 'signalone-demo',
    name: 'SignalOne Demo Brand',
    vertical: 'generic',
    size: 'medium',
    creativeCount: { min: 30, max: 70 },
    campaignCount: { min: 5, max: 10 },
    logo: '/logos/signalone.svg'
  },
  {
    id: 'urbanfit-studio',
    name: 'UrbanFit Studio',
    vertical: 'fitness',
    size: 'small',
    creativeCount: { min: 6, max: 18 },
    campaignCount: { min: 2, max: 5 },
    logo: '/logos/urbanfit.svg'
  },
  {
    id: 'greensnacks',
    name: 'GreenSnacks D2C',
    vertical: 'food',
    size: 'small',
    creativeCount: { min: 2, max: 12 },
    campaignCount: { min: 2, max: 5 },
    logo: '/logos/greensnacks.svg'
  },
  {
    id: 'saasify-tools',
    name: 'SaaSify Tools',
    vertical: 'saas',
    size: 'medium',
    creativeCount: { min: 15, max: 35 },
    campaignCount: { min: 5, max: 10 },
    logo: '/logos/saasify.svg'
  }
];

// ===================================
// CAMPAIGN NAME POOLS
// ===================================

const CAMPAIGN_NAMES = {
  fashion: [
    'Winter Collection 2025', 'Spring Essentials', 'Black Friday Mega Sale',
    'Summer Launch', 'Holiday Gift Guide', 'New Arrivals', 'Clearance Sale',
    'Premium Line Launch', 'Seasonal Refresh', 'Flash Sale Weekend',
    'VIP Exclusive', 'Limited Edition Drop', 'End of Season Sale',
    'Back to School', 'Valentine\'s Day Special', 'Mother\'s Day Collection',
    'Father\'s Day Sale', 'Anniversary Special'
  ],
  home: [
    'Home Makeover Sale', 'Modern Living Collection', 'Smart Home Bundle',
    'Outdoor Furniture Launch', 'Kitchen Essentials', 'Bedroom Refresh',
    'Bathroom Upgrade', 'Holiday Decor', 'Spring Cleaning Sale',
    'Home Office Setup', 'Cozy Winter Collection', 'Summer Garden Sale'
  ],
  beauty: [
    'Skincare Routine', 'Summer Glow', 'Holiday Makeup', 'Anti-Aging Line',
    'Natural Beauty Collection', 'Luxury Skincare Launch', 'Gift Sets',
    'New Fragrance Line', 'Men\'s Grooming', 'Teen Beauty Range'
  ],
  electronics: [
    'Q4 Gadget Push', 'Holiday Tech Sale', 'Smart Device Bundle',
    'Gaming Console Launch', 'Laptop Sale', 'Smartphone Upgrade',
    'Audio Equipment Sale', 'Wearables Collection', 'Smart Home Tech',
    'Camera & Photography', 'Accessories Bundle', 'Tech Essentials'
  ],
  generic: [
    'Product Launch', 'Brand Awareness', 'Holiday Campaign',
    'Summer Sale', 'New Customer Acquisition', 'Retargeting Campaign',
    'Flash Sale', 'Limited Time Offer', 'Seasonal Promotion'
  ],
  fitness: [
    'New Year Transformation', 'Summer Body Challenge', 'Home Workout Gear',
    'Gym Membership Promo', 'Fitness App Launch', 'Nutrition Plan Sale'
  ],
  food: [
    'Healthy Snacks Launch', 'Organic Range', 'Seasonal Flavors',
    'Subscription Box Promo', 'Holiday Gift Baskets'
  ],
  saas: [
    'Free Trial Campaign', 'Enterprise Plan Launch', 'Annual Subscription Sale',
    'Feature Launch', 'Onboarding Campaign', 'Upgrade Promotion'
  ]
};

// ===================================
// CREATIVE NAME TEMPLATES
// ===================================

const CREATIVE_TEMPLATES = [
  'UGC Hook Fast Try-On', 'UGC Problem-Solution', 'UGC Testimonial',
  'UGC Before-After', 'Static Product Hero', 'Static Offer Split',
  'Static Brand Story', 'Video Product Demo', 'Video Customer Story',
  'Video Founder Message', 'Video How-To Tutorial', 'Carousel Features',
  'Carousel Comparison', 'Reels Trending Sound', 'Reels Quick Demo',
  'Story Poll Interactive', 'Story Question Sticker', 'Story Product Tag',
  'Feed Video Lifestyle', 'Feed Video Unboxing'
];

const CREATIVE_FORMATS = [
  'Story/Reel 9:16', 'Feed Post 1:1', 'Feed Video 4:5', 'Carousel 1:1',
  'Reels 9:16', 'Story 9:16', 'Feed 4:5', 'Story Ad 9:16'
];

const CREATIVE_TYPES = [
  'UGC', 'Product Shot', 'Founder Story', 'Testimonial', 'Brand Content',
  'Lifestyle', 'Tutorial', 'Before-After', 'Demo'
];

const CREATIVE_STATUS = ['winner', 'scaling', 'testing', 'paused', 'archived'];

// ===================================
// HELPER FUNCTIONS
// ===================================

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCreativeId() {
  return `cr_${Date.now()}_${random(1000, 9999)}`;
}

function generateCampaignId() {
  return `camp_${Date.now()}_${random(1000, 9999)}`;
}

// ===================================
// CAMPAIGN GENERATOR
// ===================================

function generateCampaigns(brand) {
  const count = random(brand.campaignCount.min, brand.campaignCount.max);
  const campaigns = [];
  const namePool = CAMPAIGN_NAMES[brand.vertical] || CAMPAIGN_NAMES.generic;
  
  for (let i = 0; i < count; i++) {
    const spend = random(5000, 50000);
    const roas = randomFloat(2.5, 6.0);
    const revenue = spend * roas;
    const cpm = randomFloat(8, 25);
    const impressions = (spend / cpm) * 1000;
    const ctr = randomFloat(1.5, 4.5);
    const clicks = (impressions * ctr) / 100;
    const cpc = spend / clicks;
    
    campaigns.push({
      id: `${brand.id}_campaign_${i + 1}`,
      name: namePool[i % namePool.length] + (i >= namePool.length ? ` V${Math.floor(i / namePool.length) + 1}` : ''),
      status: i < 3 ? 'active' : (Math.random() > 0.7 ? 'paused' : 'active'),
      objective: randomElement(['Conversions', 'Sales', 'Traffic', 'Leads', 'Brand Awareness']),
      dailyBudget: random(500, 5000),
      spend30d: spend,
      revenue30d: Math.round(revenue),
      roas: parseFloat(roas.toFixed(1)),
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      ctr: parseFloat(ctr.toFixed(2)),
      cpm: parseFloat(cpm.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      conversions: Math.round(clicks * randomFloat(0.02, 0.08))
    });
  }
  
  return campaigns;
}

// ===================================
// CREATIVE GENERATOR
// ===================================

function generateCreatives(brand, campaigns) {
  const count = random(brand.creativeCount.min, brand.creativeCount.max);
  const creatives = [];
  
  for (let i = 0; i < count; i++) {
    const spend = random(500, 15000);
    const roas = randomFloat(1.8, 7.5);
    const revenue = spend * roas;
    const cpm = randomFloat(8, 30);
    const impressions = (spend / cpm) * 1000;
    const ctr = randomFloat(1.2, 5.5);
    const clicks = (impressions * ctr) / 100;
    const cpc = spend / clicks;
    const conversions = Math.round(clicks * randomFloat(0.02, 0.12));
    
    // Assign to campaign
    const campaign = campaigns[i % campaigns.length];
    
    creatives.push({
      id: `${brand.id}_creative_${i + 1}`,
      name: `${randomElement(CREATIVE_TEMPLATES)} ${i + 1}`,
      format: randomElement(CREATIVE_FORMATS),
      type: randomElement(CREATIVE_TYPES),
      thumbnail: `https://picsum.photos/400/600?random=${brand.id}_${i}`,
      status: randomElement(CREATIVE_STATUS),
      campaignId: campaign.id,
      campaignName: campaign.name,
      spend: Math.round(spend),
      revenue: Math.round(revenue),
      roas: parseFloat(roas.toFixed(1)),
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      ctr: parseFloat(ctr.toFixed(2)),
      cpm: parseFloat(cpm.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      conversions,
      daysActive: random(1, 90),
      score: random(45, 95),
      hook: randomElement(['Problem-Solution', 'Testimonial', 'Product Demo', 'Lifestyle', 'Before-After']),
      creator: randomElement(['Sarah M.', 'John D.', 'Emma K.', 'Internal', 'Agency'])
    });
  }
  
  return creatives;
}

// ===================================
// DASHBOARD DATA GENERATOR
// ===================================

function generateDashboardData(brand, campaigns, creatives) {
  const totalSpend = creatives.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = creatives.reduce((sum, c) => sum + c.revenue, 0);
  const avgRoas = totalRevenue / totalSpend;
  const totalImpressions = creatives.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = creatives.reduce((sum, c) => sum + c.clicks, 0);
  const avgCtr = (totalClicks / totalImpressions) * 100;
  const avgCpm = (totalSpend / totalImpressions) * 1000;
  const totalConversions = creatives.reduce((sum, c) => sum + c.conversions, 0);
  
  // Weekly performance
  const weeklyData = [];
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  for (let i = 0; i < 7; i++) {
    const daySpend = totalSpend / 7 * randomFloat(0.8, 1.2);
    const dayRoas = avgRoas * randomFloat(0.85, 1.15);
    weeklyData.push({
      day: days[i],
      roas: parseFloat(dayRoas.toFixed(1)),
      spend: Math.round(daySpend),
      conversions: Math.round(totalConversions / 7 * randomFloat(0.8, 1.2))
    });
  }
  
  // Alerts
  const alerts = [];
  if (avgRoas < 3.0) {
    alerts.push({ severity: 'warning', message: `${brand.name}: ROAS unter 3.0x` });
  }
  if (totalSpend > 100000) {
    alerts.push({ severity: 'info', message: `${brand.name}: Hoher Spend erkannt` });
  }
  const pausedCreatives = creatives.filter(c => c.status === 'paused').length;
  if (pausedCreatives > 10) {
    alerts.push({ severity: 'info', message: `${brand.name}: ${pausedCreatives} pausierte Creatives` });
  }
  
  return {
    spend: Math.round(totalSpend),
    revenue: Math.round(totalRevenue),
    roas: parseFloat(avgRoas.toFixed(1)),
    profit: Math.round(totalRevenue - totalSpend),
    ctr: parseFloat(avgCtr.toFixed(2)),
    cpm: parseFloat(avgCpm.toFixed(2)),
    conversions: totalConversions,
    trend: {
      spend: randomFloat(-10, 20),
      revenue: randomFloat(-5, 25),
      roas: randomFloat(-0.5, 0.8)
    },
    weeklyData,
    alerts
  };
}

// ===================================
// PUBLIC API
// ===================================

export async function fetchBrands() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return DEMO_BRANDS;
}

export async function fetchAccounts(brand) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: `${brand.id}_account_1`, name: `${brand.name} - Main Account` }
  ];
}

export async function fetchCampaigns(brand, account) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const campaigns = generateCampaigns(brand);
  return campaigns;
}

export async function fetchCreatives(brand, account, campaign) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const campaigns = generateCampaigns(brand);
  const creatives = generateCreatives(brand, campaigns);
  
  // Filter by campaign if specified
  if (campaign) {
    return creatives.filter(c => c.campaignId === campaign.id);
  }
  
  return creatives;
}

export async function fetchDashboardData(brand, account, campaign) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const campaigns = generateCampaigns(brand);
  const creatives = generateCreatives(brand, campaigns);
  
  // Filter by campaign if specified
  const filteredCreatives = campaign 
    ? creatives.filter(c => c.campaignId === campaign.id)
    : creatives;
  
  return generateDashboardData(brand, campaigns, filteredCreatives);
}

export async function fetchSenseiData(brand, account, campaign) {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const score = random(70, 95);
  const verdict = score > 85 ? 'Starke Performance' : score > 75 ? 'Gute Performance' : 'Verbesserungspotenzial';
  
  return {
    score,
    verdict,
    insights: [
      'ROAS liegt über Benchmark',
      'Creative-Fatigue bei einigen Ads erkannt',
      'Scaling-Potenzial bei Winner-Creatives vorhanden'
    ],
    recommendations: [
      { action: 'Skaliere Top-Creative um 30%', priority: 'high' },
      { action: 'Pausiere Loser-Creative mit ROAS < 2.0', priority: 'medium' },
      { action: 'Starte Hook-Testing mit Variante B', priority: 'medium' }
    ]
  };
}

export async function fetchTestingLog(brand, account) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    tests: [
      {
        id: 'test_1',
        date: '2025-12-10',
        creativeA: 'UGC Hook Fast Try-On',
        creativeB: 'UGC Hook Problem-Solution',
        winner: 'A',
        roasA: 6.2,
        roasB: 4.8,
        reason: 'ROAS Domination (+0.3)'
      },
      {
        id: 'test_2',
        date: '2025-12-08',
        creativeA: 'Static Brand Hero',
        creativeB: 'Static Product Showcase',
        winner: 'A',
        roasA: 5.8,
        roasB: 4.9,
        reason: 'ROAS Domination (+0.3)'
      }
    ]
  };
}

export async function fetchReportsData(brand, account, range) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const campaigns = generateCampaigns(brand);
  const creatives = generateCreatives(brand, campaigns);
  const dashboard = generateDashboardData(brand, campaigns, creatives);
  
  return {
    summary: {
      totalSpend: dashboard.spend,
      totalRevenue: dashboard.revenue,
      avgRoas: dashboard.roas,
      topCampaign: campaigns[0].name
    }
  };
}
