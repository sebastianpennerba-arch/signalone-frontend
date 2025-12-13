/**
 * Dashboard Data Module
 * 
 * Fetches dashboard data from DataLayer.
 * Uses new state structure: selectedBrand, selectedCampaign
 */

import * as DataLayer from '../../data/index.js';
import { AppState } from '../../data/state.js';

/**
 * Fetch Dashboard Data
 */
export async function fetchDashboardData() {
  try {
    // NEW STATE STRUCTURE!
    const data = await DataLayer.fetchDashboardData(
      AppState.selectedBrand,      // ✅ selectedBrand (not currentBrand)
      null,                         // account not needed for demo
      AppState.selectedCampaign     // ✅ selectedCampaign (not currentCampaign)
    );
    
    return data;
  } catch (error) {
    console.error('[Dashboard] Data fetch failed:', error);
    throw error;
  }
}
