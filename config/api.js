/**
 * SignalOne - API Configuration
 * 
 * Centralized API endpoint configuration
 * Supports development and production environments
 */

// API Base URL
// For remote access: Always use server IP since browser runs on client machine
export const API_BASE_URL = 'http://91.107.211.71:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Demo Data
  DEMO_BRANDS: '/api/demo/brands',
  DEMO_CAMPAIGNS: '/api/demo/campaigns',
  DEMO_CREATIVES: '/api/demo/creatives',
  DEMO_DASHBOARD: '/api/demo/dashboard',
  
  // Meta API (for live mode)
  META_OAUTH_TOKEN: '/api/meta/oauth/token',
  META_ME: '/api/meta/me',
  META_ADACCOUNTS: '/api/meta/adaccounts',
  META_CAMPAIGNS: '/api/meta/campaigns',
  META_INSIGHTS: '/api/meta/insights',
  META_ADS: '/api/meta/ads',
  
  // Sensei
  SENSEI_ANALYZE: '/api/sensei/analyze'
};

// Helper: Build full URL
export function buildApiUrl(endpoint, params = {}) {
  const url = new URL(endpoint, API_BASE_URL);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.toString();
}

// Helper: Fetch with error handling
export async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw error;
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  apiFetch
};