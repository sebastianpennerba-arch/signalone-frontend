/**
 * SignalOne - Demo Data API (Backend Integration with Fallback)
 * 
 * Fetches demo data from backend API with fallback to local data
 * Supports time range filtering (30d/7d/24h)
 */

import { buildApiUrl, apiFetch, API_ENDPOINTS } from '../config/api.js';

// Cache for performance
const CACHE = {
  brands: null,
  campaigns: {},
  creatives: {},
  dashboard: {},
  timestamp: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// 🔥 FALLBACK DATA (if backend unavailable)
const FALLBACK_BRANDS = [
  { id: 'brand-1', name: 'TechGear Pro', mode: 'demo', currency: 'EUR', status: 'active' },
  { id: 'brand-2', name: 'FitLife', mode: 'demo', currency: 'EUR', status: 'active' },
  { id: 'brand-3', name: 'GreenHome', mode: 'demo', currency: 'EUR', status: 'active' }
];

// Helper: Check if cache is valid
function isCacheValid(key) {
  const timestamp = CACHE.timestamp[key];
  if (!timestamp) return false;
  return (Date.now() - timestamp) < CACHE_DURATION;
}

// Helper: Set cache
function setCache(key, data) {
  CACHE[key] = data;
  CACHE.timestamp[key] = Date.now();
}

/**
 * Fetch Brands
 */
export async function fetchBrands(options = {}) {
  console.log('[Demo API] fetchBrands');
  
  // Check cache
  if (isCacheValid('brands') && CACHE.brands) {
    console.log('[Demo API] Returning cached brands');
    return CACHE.brands;
  }
  
  try {
    const url = buildApiUrl(API_ENDPOINTS.DEMO_BRANDS);
    console.log('[Demo API] Fetching from:', url);
    
    const response = await apiFetch(url);
    console.log('[Demo API] Response:', response);
    
    if (response.ok && response.data) {
      setCache('brands', response.data);
      return response.data;
    }
    
    throw new Error('Invalid response from backend');
  } catch (error) {
    console.warn('[Demo API] Backend unavailable, using fallback data:', error.message);
    // 🔥 FALLBACK: Return local brands
    setCache('brands', FALLBACK_BRANDS);
    return FALLBACK_BRANDS;
  }
}

/**
 * Fetch Campaigns
 */
export async function fetchCampaigns(brand, account = null, options = {}) {
  console.log('[Demo API] fetchCampaigns', { brand: brand?.id, range: options.range });
  
  if (!brand || !brand.id) {
    console.warn('[Demo API] No brand provided');
    return [];
  }
  
  const cacheKey = `campaigns_${brand.id}_${options.range || '30d'}`;
  
  // Check cache
  if (isCacheValid(cacheKey) && CACHE.campaigns[cacheKey]) {
    console.log('[Demo API] Returning cached campaigns');
    return CACHE.campaigns[cacheKey];
  }
  
  try {
    const url = buildApiUrl(API_ENDPOINTS.DEMO_CAMPAIGNS, {
      brandId: brand.id,
      range: options.range || '30d'
    });
    
    const response = await apiFetch(url);
    
    if (response.ok && response.data) {
      const campaigns = response.data;
      CACHE.campaigns[cacheKey] = campaigns;
      CACHE.timestamp[cacheKey] = Date.now();
      return campaigns;
    }
    
    throw new Error('Invalid response from backend');
  } catch (error) {
    console.warn('[Demo API] Backend unavailable, returning empty campaigns:', error.message);
    // 🔥 FALLBACK: Return empty (or generate local campaigns)
    return [];
  }
}

/**
 * Fetch Creatives
 */
export async function fetchCreatives(brand, account = null, campaign = null, options = {}) {
  console.log('[Demo API] fetchCreatives', { 
    brand: brand?.id, 
    campaign: campaign?.id, 
    range: options.range 
  });
  
  if (!brand || !brand.id) {
    console.warn('[Demo API] No brand provided');
    return [];
  }
  
  const cacheKey = `creatives_${brand.id}_${campaign?.id || 'all'}_${options.range || '30d'}`;
  
  // Check cache
  if (isCacheValid(cacheKey) && CACHE.creatives[cacheKey]) {
    console.log('[Demo API] Returning cached creatives');
    return CACHE.creatives[cacheKey];
  }
  
  try {
    const params = {
      brandId: brand.id,
      range: options.range || '30d'
    };
    
    if (campaign && campaign.id) {
      params.campaignId = campaign.id;
    }
    
    const url = buildApiUrl(API_ENDPOINTS.DEMO_CREATIVES, params);
    const response = await apiFetch(url);
    
    if (response.ok && response.data) {
      const creatives = response.data;
      CACHE.creatives[cacheKey] = creatives;
      CACHE.timestamp[cacheKey] = Date.now();
      return creatives;
    }
    
    throw new Error('Invalid response from backend');
  } catch (error) {
    console.warn('[Demo API] Backend unavailable, returning empty creatives:', error.message);
    return [];
  }
}

/**
 * Fetch Dashboard Data
 */
export async function fetchDashboardData(brand, account = null, campaign = null, options = {}) {
  console.log('[Demo API] fetchDashboardData', { 
    brand: brand?.id, 
    campaign: campaign?.id, 
    range: options.range 
  });
  
  if (!brand || !brand.id) {
    console.warn('[Demo API] No brand provided');
    return null;
  }
  
  const cacheKey = `dashboard_${brand.id}_${campaign?.id || 'all'}_${options.range || '30d'}`;
  
  // Check cache
  if (isCacheValid(cacheKey) && CACHE.dashboard[cacheKey]) {
    console.log('[Demo API] Returning cached dashboard');
    return CACHE.dashboard[cacheKey];
  }
  
  try {
    const params = {
      brandId: brand.id,
      range: options.range || '30d'
    };
    
    if (campaign && campaign.id) {
      params.campaignId = campaign.id;
    }
    
    const url = buildApiUrl(API_ENDPOINTS.DEMO_DASHBOARD, params);
    const response = await apiFetch(url);
    
    if (response.ok && response.data) {
      const dashboardData = response.data;
      CACHE.dashboard[cacheKey] = dashboardData;
      CACHE.timestamp[cacheKey] = Date.now();
      return dashboardData;
    }
    
    throw new Error('Invalid response from backend');
  } catch (error) {
    console.warn('[Demo API] Backend unavailable, returning fallback dashboard:', error.message);
    // 🔥 FALLBACK: Return minimal dashboard data
    return {
      spend: 5000,
      revenue: 22500,
      roas: 4.5,
      impressions: 75000,
      clicks: 2500,
      ctr: 3.33,
      cpm: 66.67,
      frequency: 2.0,
      trend: { spend: 10, revenue: 15, roas: 5 }
    };
  }
}

/**
 * Fetch Accounts (not used in demo mode)
 */
export async function fetchAccounts(brand, options = {}) {
  console.log('[Demo API] fetchAccounts - not implemented');
  return [];
}

/**
 * Fetch Sensei Data (uses creatives + campaigns)
 */
export async function fetchSenseiData(brand, account = null, campaign = null, options = {}) {
  console.log('[Demo API] fetchSenseiData');
  
  const [creatives, campaigns] = await Promise.all([
    fetchCreatives(brand, account, campaign, options),
    fetchCampaigns(brand, account, options)
  ]);
  
  return {
    creatives,
    campaigns
  };
}

/**
 * Fetch Testing Log (placeholder)
 */
export async function fetchTestingLog(brand, account = null, options = {}) {
  console.log('[Demo API] fetchTestingLog - not implemented');
  return [];
}

/**
 * Fetch Reports Data (uses dashboard data)
 */
export async function fetchReportsData(brand, account = null, range = null, options = {}) {
  console.log('[Demo API] fetchReportsData');
  
  const dashboardData = await fetchDashboardData(brand, account, null, {
    ...options,
    range: range || options.range
  });
  
  return dashboardData;
}

/**
 * Clear Cache (useful for debugging)
 */
export function clearCache() {
  console.log('[Demo API] Clearing cache');
  CACHE.brands = null;
  CACHE.campaigns = {};
  CACHE.creatives = {};
  CACHE.dashboard = {};
  CACHE.timestamp = {};
}

export { CACHE };