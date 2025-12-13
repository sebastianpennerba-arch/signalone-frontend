/**
 * SignalOne Dashboard Performance Chart
 * 7-Tage ROAS Trend mit realistischer Varianz
 */

export function renderPerformanceChart(data) {
  const { days = [], roasAvg = 0, roasPeak = 0 } = data;
  
  // Fallback: Realistische Demo-Daten
  const chartData = days.length > 0 ? days : [
    { day: 'Mo', roas: 3.6 },
    { day: 'Di', roas: 3.2 },
    { day: 'Mi', roas: 4.1 },
    { day: 'Do', roas: 3.8 },
    { day: 'Fr', roas: 3.5 },
    { day: 'Sa', roas: 3.9 },
    { day: 'So', roas: 4.0 }
  ];
  
  const avg = roasAvg || chartData.reduce((sum, d) => sum + d.roas, 0) / chartData.length;
  const peak = roasPeak || Math.max(...chartData.map(d => d.roas));
  
  // Berechne Skalierung
  const maxValue = Math.ceil(peak * 1.2); // 20% headroom
  const minValue = 0;
  
  // Bars mit Höhenberechnung
  const bars = chartData.map(d => {
    const heightPercent = ((d.roas - minValue) / (maxValue - minValue)) * 100;
    const isPeak = d.roas === peak;
    
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar ${isPeak ? 'peak' : ''}" style="height: ${heightPercent}%" data-value="${d.roas.toFixed(2)}x">
          <div class="chart-bar-fill"></div>
          ${isPeak ? '<div class="peak-indicator">⭐</div>' : ''}
        </div>
        <div class="chart-label">${d.day}</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="performance-chart-wrapper">
      <div class="chart-header">
        <h3 class="chart-title">7-Tage Performance Trend</h3>
        <div class="chart-stats">
          <div class="chart-stat">
            <span class="stat-label">Ø ROAS</span>
            <span class="stat-value">${avg.toFixed(2)}x</span>
          </div>
          <div class="chart-stat">
            <span class="stat-label">Peak</span>
            <span class="stat-value success">${peak.toFixed(2)}x</span>
          </div>
        </div>
      </div>
      
      <div class="chart-canvas">
        <div class="chart-grid">
          ${Array.from({ length: 5 }, (_, i) => {
            const value = maxValue - (i * maxValue / 4);
            return `<div class="grid-line" data-value="${value.toFixed(1)}x"></div>`;
          }).join('')}
        </div>
        
        <div class="chart-bars">
          ${bars}
        </div>
      </div>
    </div>
  `;
}
