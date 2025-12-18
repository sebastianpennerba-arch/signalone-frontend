/**
 * SignalOne Dashboard Hero
 * Elite Entry Point – Greeting, Account Status, Quick Actions
 */

export function renderHero(ctx) {
  const { brand, dataMode, timeRange = 'Letzte 30 Tage' } = ctx;
  
  // Tageszeit-basierte Begrüßung
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Guten Morgen' : 
                   hour < 18 ? 'Guten Tag' : 
                   'Guten Abend';
  
  // Demo Mode Badge
  const demoModeBadge = dataMode === 'demo' 
    ? `<div class="hero-badge demo-badge">
         <span class="badge-dot orange"></span>
         <span>Demo-Modus</span>
       </div>`
    : '';
  
  // Brand Name
  const brandName = brand?.name || 'SignalOne';
  
  // Health Badge
  const health = brand?.health || 'Strong';
  const healthClass = health === 'Strong' ? 'success' : health === 'Warning' ? 'warning' : 'critical';
  const healthIcon = health === 'Strong' ? '🟢' : health === 'Warning' ? '🟡' : '🔴';
  
  return `
    <div class="dashboard-hero">
      <div class="hero-header">
        <div class="hero-left">
          <h1 class="hero-greeting">${greeting}</h1>
          <div class="hero-meta">
            <span class="hero-brand">${brandName}</span>
            <span class="hero-separator">•</span>
            <span class="hero-timerange">${timeRange}</span>
            ${demoModeBadge}
          </div>
        </div>
        
        <div class="hero-right">
          <div class="hero-badge health-badge ${healthClass}">
            <span class="badge-icon">${healthIcon}</span>
            <span>Performance ${health}</span>
          </div>
        </div>
      </div>
      
      <div class="hero-actions">
        <button class="hero-btn primary" data-action="open-creatives">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v8h8V4H4z"/>
          </svg>
          Creatives analysieren
        </button>
        
        <button class="hero-btn secondary" data-action="open-sensei">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a2 2 0 012 2v2.586l4.207 4.207a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0L5.586 10H3a2 2 0 01-2-2V3a2 2 0 012-2h5z"/>
          </svg>
          Sensei öffnen
        </button>
      </div>
    </div>
  `;
}
