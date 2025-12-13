/**
 * SignalOne - Data Layer API
 * 
 * Zentrale Datenquelle für ALLE Module.
 * Entscheidet automatisch zwischen Live und Demo.
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
export async function fetchDashboardData(brand, account, campaign) {
  const source = getDataSource();
  return await source.fetchDashboardData(brand, account, campaign);
}

/**
 * Creative Library Data
 */
export async function fetchCreatives(brand, account, campaign) {
  const source = getDataSource();
  return await source.fetchCreatives(brand, account, campaign);
}

/**
 * Campaigns Data
 */
export async function fetchCampaigns(brand, account) {
  const source = getDataSource();
  return await source.fetchCampaigns(brand, account);
}

/**
 * Sensei AI Data
 */
export async function fetchSenseiData(brand, account, campaign) {
  const source = getDataSource();
  return await source.fetchSenseiData(brand, account, campaign);
}

/**
 * Testing Log Data
 */
export async function fetchTestingLog(brand, account) {
  const source = getDataSource();
  return await source.fetchTestingLog(brand, account);
}

/**
 * Reports Data
 */
export async function fetchReportsData(brand, account, range) {
  const source = getDataSource();
  return await source.fetchReportsData(brand, account, range);
}

/**
 * Brands auflisten
 */
export async function fetchBrands() {
  const source = getDataSource();
  return await source.fetchBrands();
}

/**
 * Accounts auflisten
 */
export async function fetchAccounts(brand) {
  const source = getDataSource();
  return await source.fetchAccounts(brand);
}
