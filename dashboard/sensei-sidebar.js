/**
 * SignalOne Dashboard Sensei Sidebar
 * Kompakte Recommendations (max 3 visible)
 */

export function renderSenseiSidebar(signals = []) {
  // Fallback Demo-Signals
  const recommendations = signals.length > 0 ? signals : [
    {
      type: 'ok',
      message: 'Performance stabil - ROAS über Ziel',
      icon: '✅',
      action: null
    },
    {
      type: 'warning',
      message: 'CTR unter Erwartung - Hook/First-Frame prüfen',
      icon: '⚠️',
      action: 'open-creatives'
    },
    {
      type: 'opportunity',
      message: '3 Creatives bereit zum Scaling',
      icon: '💡',
      action: 'open-testing'
    }
  ];
  
  const limitedSignals = recommendations.slice(0, 3);
  
  const typeClass = {
    'ok': 'signal-success',
    'warning': 'signal-warning',
    'danger': 'signal-critical',
    'opportunity': 'signal-info'
  };
  
  return `
    <div class="sensei-sidebar">
      <div class="sensei-header">
        <div class="sensei-icon">🧠</div>
        <div class="sensei-title">
          <h3>Sensei Empfehlungen</h3>
          <span class="sensei-subtitle">${limitedSignals.length} Hinweise</span>
        </div>
      </div>
      
      <div class="sensei-signals">
        ${limitedSignals.map(signal => `
          <div class="sensei-signal ${typeClass[signal.type] || 'signal-info'}">
            <div class="signal-icon">${signal.icon}</div>
            <div class="signal-content">
              <p class="signal-message">${signal.message}</p>
              ${signal.action ? `
                <button class="signal-action" data-action="${signal.action}">
                  Details anzeigen →
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="sensei-footer">
        <button class="sensei-view-all" data-action="open-sensei">
          Alle Insights anzeigen
        </button>
      </div>
    </div>
  `;
}
