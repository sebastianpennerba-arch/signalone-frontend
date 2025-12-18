/**
 * SignalOne - Data Layer API
 *
 * Zentrale Datenquelle für ALLE Module.
 * Entscheidet automatisch zwischen Live und Demo.
 *
 * ✅ FIX: Unterstützt jetzt optionalen 4. Parameter (options), z.B. { range: '24h' | '7d' }
 *         → wird an Demo/Live weitergereicht (falls dort genutzt), ohne bestehende Signaturen zu brechen.
 */

import { AppState } from './state.js';
import * as LiveAPI from './live.js';
import * as DemoAPI from './demo.js';

/**
 * Bestimmt, ob Live oder Demo verwendet wird
 */
function getDataSource() {
  if (AppState.mode === 'live' && AppState.metaConnected) {
    return LiveAPI;
  }
  return DemoAPI;
}

/**
 * Dashboard Data
 */
export async function fetchDashboardData(brand, account, campaign, options = {}) {
  const source = getDataSource();
  return await source.fetchDashboardData(brand, account, campaign, options);
}

/**
 * Creative Library Data
 */
export async function fetchCreatives(brand, account, campaign, options = {}) {
  const source = getDataSource();
  return await source.fetchCreatives(brand, account, campaign, options);
}

/**
 * Campaigns Data
 */
export async function fetchCampaigns(brand, account, options = {}) {
  const source = getDataSource();
  return await source.fetchCampaigns(brand, account, options);
}

/**
 * Sensei AI Data
 */
export async function fetchSenseiData(brand, account, campaign, options = {}) {
  const source = getDataSource();
  return await source.fetchSenseiData(brand, account, campaign, options);
}

/**
 * Testing Log Data
 */
export async function fetchTestingLog(brand, account, options = {}) {
  const source = getDataSource();
  return await source.fetchTestingLog(brand, account, options);
}

/**
 * Reports Data
 */
export async function fetchReportsData(brand, account, range, options = {}) {
  const source = getDataSource();
  return await source.fetchReportsData(brand, account, range, options);
}

/**
 * Brands auflisten
 */
export async function fetchBrands(options = {}) {
  const source = getDataSource();
  return await source.fetchBrands(options);
}

/**
 * Accounts auflisten
 */
export async function fetchAccounts(brand, options = {}) {
  const source = getDataSource();
  return await source.fetchAccounts(brand, options);
}
