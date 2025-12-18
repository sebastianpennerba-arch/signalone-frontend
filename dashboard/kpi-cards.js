/**
 * SignalOne Dashboard KPI Cards
 * Premium 4-Column Grid mit Gradient Backgrounds
 */

export function renderKPICards(data) {
  const { spend30d = 0, revenue30d = 0, roas30d = 0, profitEst30d = 0, deltaSpend = 0, deltaRevenue = 0, deltaRoas = 0, deltaProfit = 0 } = data;
  
  const formatCurrency = (val) => `€${val.toLocaleString('de-DE')}`;
  const formatPercent = (val) => `${val > 0 ? '+' : ''}${(val * 100).toFixed(1)}%`;
  const formatRoas = (val) => `${val.toFixed(2)}x`;
  
  const getDeltaClass = (delta) => delta >= 0 ? 'positive' : 'negative';
  const getDeltaIcon = (delta) => delta >= 0 ? '↑' : '↓';
  
  const cards = [
    {
      label: 'Ad Spend',
      value: formatCurrency(spend30d),
      delta: formatPercent(deltaSpend),
      deltaClass: getDeltaClass(-deltaSpend), // Negative spend ist gut
      deltaIcon: getDeltaIcon(-deltaSpend),
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      label: 'Revenue',
      value: formatCurrency(revenue30d),
      delta: formatPercent(deltaRevenue),
      deltaClass: getDeltaClass(deltaRevenue),
      deltaIcon: getDeltaIcon(deltaRevenue),
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      label: 'ROAS',
      value: formatRoas(roas30d),
      delta: formatPercent(deltaRoas),
      deltaClass: getDeltaClass(deltaRoas),
      deltaIcon: getDeltaIcon(deltaRoas),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      label: 'Profit',
      value: formatCurrency(profitEst30d),
      delta: formatPercent(deltaProfit),
      deltaClass: getDeltaClass(deltaProfit),
      deltaIcon: getDeltaIcon(deltaProfit),
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];
  
  return `
    <div class="kpi-grid">
      ${cards.map(card => `
        <div class="kpi-card" style="--gradient: ${card.gradient}">
          <div class="kpi-card-bg"></div>
          <div class="kpi-card-content">
            <div class="kpi-header">
              <span class="kpi-label">${card.label}</span>
              <span class="kpi-delta ${card.deltaClass}">
                <span class="delta-icon">${card.deltaIcon}</span>
                ${card.delta}
              </span>
            </div>
            <div class="kpi-value">${card.value}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
