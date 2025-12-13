/**
 * SignalOne - Live Meta API Client
 * 
 * Echte Meta Ads API Calls.
 * Wird verwendet, wenn mode='live' und metaConnected=true.
 */

import { AppState } from './state.js';

const API_BASE = 'https://signalone-backend.onrender.com/api/meta';

/**
 * Helper: Meta API Request
 */
async function metaRequest(endpoint, options = {}) {
  const token = AppState.metaToken;
  if (!token) {
    throw new Error('No Meta token available');
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`Meta API Error: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Dashboard Data
 */
export async function fetchDashboardData(brand, account, campaign) {
  try {
    const campaigns = await metaRequest(`/campaigns/${account.id}`);
    const insights = await metaRequest(`/insights/${campaign.id}`);
    
    // KPIs berechnen
    const spend = insights.spend || 0;
    const revenue = insights.purchase_value || 0;
    const roas = revenue / spend;
    
    return {
      spend,
      revenue,
      roas,
      profit: revenue - spend,
      ctr: insights.ctr || 0,
      cpm: insights.cpm || 0,
      conversions: insights.purchases || 0
    };
  } catch (error) {
    console.error('Live Dashboard fetch failed:', error);
    throw error;
  }
}

/**
 * Creatives Data
 */
export async function fetchCreatives(brand, account, campaign) {
  try {
    const ads = await metaRequest(`/ads/${account.id}`);
    return ads;
  } catch (error) {
    console.error('Live Creatives fetch failed:', error);
    throw error;
  }
}

/**
 * Campaigns Data
 */
export async function fetchCampaigns(brand, account) {
  try {
    const campaigns = await metaRequest(`/campaigns/${account.id}`);
    return campaigns;
  } catch (error) {
    console.error('Live Campaigns fetch failed:', error);
    throw error;
  }
}

/**
 * Sensei AI Data
 */
export async function fetchSenseiData(brand, account, campaign) {
  // TODO: Implement Sensei API
  return { insights: [] };
}

/**
 * Testing Log Data
 */
export async function fetchTestingLog(brand, account) {
  // TODO: Implement Testing Log API
  return { tests: [] };
}

/**
 * Reports Data
 */
export async function fetchReportsData(brand, account, range) {
  // TODO: Implement Reports API
  return { reports: [] };
}

/**
 * Brands
 */
export async function fetchBrands() {
  try {
    const accounts = await metaRequest('/adaccounts');
    return accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      vertical: acc.vertical || 'ecommerce'
    }));
  } catch (error) {
    console.error('Live Brands fetch failed:', error);
    throw error;
  }
}

/**
 * Accounts
 */
export async function fetchAccounts(brand) {
  // In Meta gibt es nur ein Account pro Brand
  return [{ id: brand.id, name: brand.name }];
}
