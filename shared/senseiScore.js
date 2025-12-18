/**
 * SignalOne - Unified Sensei Score Engine
 * 
 * Single source of truth for Sensei Score calculation and rendering.
 * Used by both Dashboard and Sensei modules to ensure consistency.
 * 
 * PHASE 1 - P1-10: Unified Score Logic
 */

/**
 * Calculate Sensei Score for a Brand or Campaign
 * 
 * @param {Object} data - Brand or Campaign data with KPIs
 * @param {Object} options - Calculation options
 * @returns {Object} Score result with value, label, color, tier
 */
export function calculateSenseiScore(data, options = {}) {
  if (!data) {
    return {
      score: 0,
      label: 'Keine Daten',
      color: '#6E6E73',
      tier: 'none',
      factors: []
    };
  }

  // Extract KPIs
  const roas = Number(data.roas30d || data.roas || 0);
  const spend = Number(data.spend30d || data.spend || 0);
  const ctr = Number(data.ctr || 0);
  const cpm = Number(data.cpm || 0);
  const frequency = Number(data.frequency || 0);
  
  // Score factors (0-100 each)
  const factors = [];
  
  // 1. ROAS Factor (40% weight) - Most important
  let roasScore = 0;
  if (roas >= 5.0) roasScore = 100;
  else if (roas >= 4.0) roasScore = 90;
  else if (roas >= 3.0) roasScore = 75;
  else if (roas >= 2.5) roasScore = 60;
  else if (roas >= 2.0) roasScore = 45;
  else if (roas >= 1.5) roasScore = 30;
  else if (roas >= 1.0) roasScore = 15;
  else if (roas > 0) roasScore = 5;
  
  factors.push({
    name: 'ROAS Efficiency',
    score: roasScore,
    weight: 0.4,
    value: roas.toFixed(2) + 'x'
  });
  
  // 2. CTR Factor (25% weight)
  let ctrScore = 0;
  if (ctr >= 3.0) ctrScore = 100;
  else if (ctr >= 2.5) ctrScore = 85;
  else if (ctr >= 2.0) ctrScore = 70;
  else if (ctr >= 1.5) ctrScore = 55;
  else if (ctr >= 1.0) ctrScore = 40;
  else if (ctr >= 0.5) ctrScore = 25;
  else if (ctr > 0) ctrScore = 10;
  
  factors.push({
    name: 'CTR Performance',
    score: ctrScore,
    weight: 0.25,
    value: ctr.toFixed(2) + '%'
  });
  
  // 3. CPM Factor (20% weight) - Lower is better
  let cpmScore = 0;
  if (cpm > 0) {
    if (cpm <= 5) cpmScore = 100;
    else if (cpm <= 10) cpmScore = 85;
    else if (cpm <= 15) cpmScore = 70;
    else if (cpm <= 20) cpmScore = 55;
    else if (cpm <= 30) cpmScore = 40;
    else if (cpm <= 50) cpmScore = 25;
    else cpmScore = 10;
  }
  
  factors.push({
    name: 'CPM Efficiency',
    score: cpmScore,
    weight: 0.2,
    value: '€' + cpm.toFixed(2)
  });
  
  // 4. Frequency Factor (15% weight) - Sweet spot is 1.5-2.5
  let freqScore = 0;
  if (frequency >= 1.5 && frequency <= 2.5) freqScore = 100;
  else if (frequency >= 1.0 && frequency < 1.5) freqScore = 75;
  else if (frequency > 2.5 && frequency <= 3.5) freqScore = 70;
  else if (frequency >= 0.5 && frequency < 1.0) freqScore = 50;
  else if (frequency > 3.5 && frequency <= 5.0) freqScore = 40;
  else if (frequency > 0) freqScore = 20;
  
  factors.push({
    name: 'Frequency Balance',
    score: freqScore,
    weight: 0.15,
    value: frequency.toFixed(2)
  });
  
  // Calculate weighted average
  const weightedScore = factors.reduce((sum, factor) => {
    return sum + (factor.score * factor.weight);
  }, 0);
  
  const finalScore = Math.round(weightedScore);
  
  // Determine tier and label
  let tier, label, color;
  
  if (finalScore >= 70) {
    tier = 'excellent';
    label = 'Stark';
    color = '#10B981'; // Green
  } else if (finalScore >= 40) {
    tier = 'moderate';
    label = 'Beobachten';
    color = '#F59E0B'; // Orange
  } else if (finalScore > 0) {
    tier = 'critical';
    label = 'Kritisch';
    color = '#EF4444'; // Red
  } else {
    tier = 'none';
    label = 'Keine Daten';
    color = '#6E6E73'; // Gray
  }
  
  return {
    score: finalScore,
    label,
    color,
    tier,
    factors,
    metrics: {
      roas,
      spend,
      ctr,
      cpm,
      frequency
    }
  };
}

/**
 * Render Sensei Score Grid Component
 * 
 * @param {Object} scoreData - Result from calculateSenseiScore()
 * @param {Object} options - Rendering options (compact, showFactors, etc.)
 * @returns {String} HTML string
 */
export function renderSenseiScoreGrid(scoreData, options = {}) {
  const {
    compact = false,
    showFactors = true,
    showExplanation = true,
    title = 'Sensei Score'
  } = options;
  
  const { score, label, color, tier, factors } = scoreData;
  
  // Compact version (for sidebar widgets)
  if (compact) {
    return `
      <div class="sensei-score-compact">
        <div class="score-value" style="color: ${color};">
          ${score > 0 ? score : 'n/a'}
        </div>
        <div class="score-label">${label}</div>
      </div>
    `;
  }
  
  // Full grid version
  let html = `
    <div class="sensei-score-grid">
      <div class="score-header">
        <h3 class="score-title">${title}</h3>
        <div class="score-badge" style="background: ${color}15; color: ${color};">
          ${label}
        </div>
      </div>
      
      <div class="score-main">
        <div class="score-circle" style="border-color: ${color};">
          <span class="score-number" style="color: ${color};">
            ${score > 0 ? score : 'n/a'}
          </span>
          <span class="score-max">/100</span>
        </div>
      </div>
  `;
  
  // Show factors breakdown
  if (showFactors && factors && factors.length > 0) {
    html += `
      <div class="score-factors">
        <div class="factors-title">Score-Faktoren:</div>
        <div class="factors-list">
    `;
    
    factors.forEach(factor => {
      const barWidth = Math.max(0, Math.min(100, factor.score));
      const barColor = factor.score >= 70 ? '#10B981' : factor.score >= 40 ? '#F59E0B' : '#EF4444';
      
      html += `
        <div class="factor-item">
          <div class="factor-header">
            <span class="factor-name">${factor.name}</span>
            <span class="factor-value">${factor.value}</span>
          </div>
          <div class="factor-bar-container">
            <div class="factor-bar" style="width: ${barWidth}%; background: ${barColor};"></div>
          </div>
          <div class="factor-score">${factor.score}/100</div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  }
  
  // Show explanation
  if (showExplanation) {
    html += `
      <div class="score-explanation">
        <strong>Score-Bedeutung:</strong><br>
        • <span style="color: #10B981;">●</span> <strong>70–100:</strong> Stark – solide Performance<br>
        • <span style="color: #F59E0B;">●</span> <strong>40–69:</strong> Okay – Optimierungspotenzial<br>
        • <span style="color: #EF4444;">●</span> <strong>0–39:</strong> Kritisch – dringender Handlungsbedarf
      </div>
    `;
  }
  
  html += `
    </div>
  `;
  
  return html;
}

/**
 * Get score color by tier or value
 */
export function getScoreColor(scoreOrTier) {
  if (typeof scoreOrTier === 'string') {
    // Tier-based
    switch (scoreOrTier) {
      case 'excellent': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6E6E73';
    }
  } else {
    // Score-based
    const score = Number(scoreOrTier);
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    if (score > 0) return '#EF4444';
    return '#6E6E73';
  }
}

/**
 * Get score label by tier or value
 */
export function getScoreLabel(scoreOrTier) {
  if (typeof scoreOrTier === 'string') {
    // Tier-based
    switch (scoreOrTier) {
      case 'excellent': return 'Stark';
      case 'moderate': return 'Beobachten';
      case 'critical': return 'Kritisch';
      default: return 'Keine Daten';
    }
  } else {
    // Score-based
    const score = Number(scoreOrTier);
    if (score >= 70) return 'Stark';
    if (score >= 40) return 'Beobachten';
    if (score > 0) return 'Kritisch';
    return 'Keine Daten';
  }
}
