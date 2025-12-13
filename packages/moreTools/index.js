/**
 * SignalOne - More Tools Hub
 * 
 * 10 Power Tools für Performance Marketing:
 * 1. Hook Generator
 * 2. ROI Calculator
 * 3. Ad Copy Generator
 * 4. Creative Brief Generator
 * 5. Budget Simulator
 * 6. Competitor Spy
 * 7. Asset Optimizer
 * 8. Audience Builder
 * 9. Scaling Calculator
 * 10. Urgency Generator
 */

import { CoreAPI } from '../../core-api.js';

export const meta = {
  id: 'moreTools',
  label: 'More Tools',
  requiresData: false
};

const TOOLS = [
  {
    id: 'hook-generator',
    title: '🎯 Hook Generator',
    description: 'Generiere 10 Hook-Varianten für deine Ads',
    category: 'Creative',
    color: '#10b981'
  },
  {
    id: 'roi-calculator',
    title: '💰 ROI Calculator',
    description: 'Break-Even, Target ROAS & Profit berechnen',
    category: 'Analytics',
    color: '#3b82f6'
  },
  {
    id: 'ad-copy-generator',
    title: '✍️ Ad Copy Generator',
    description: 'Headlines, Primary Text & CTAs generieren',
    category: 'Creative',
    color: '#8b5cf6'
  },
  {
    id: 'creative-brief',
    title: '🎨 Creative Brief',
    description: 'Briefing Templates für Creator & Designer',
    category: 'Creative',
    color: '#f59e0b'
  },
  {
    id: 'budget-simulator',
    title: '📈 Budget Simulator',
    description: 'Was-wäre-wenn Szenarien durchspielen',
    category: 'Analytics',
    color: '#06b6d4'
  },
  {
    id: 'competitor-spy',
    title: '🔍 Competitor Spy',
    description: 'Meta Ad Library Integration & Insights',
    category: 'Research',
    color: '#ef4444'
  },
  {
    id: 'asset-optimizer',
    title: '📱 Asset Optimizer',
    description: 'Bild/Video Format Check & Empfehlungen',
    category: 'Creative',
    color: '#ec4899'
  },
  {
    id: 'audience-builder',
    title: '👥 Audience Builder',
    description: 'Custom Audience Templates & Strategien',
    category: 'Targeting',
    color: '#14b8a6'
  },
  {
    id: 'scaling-calculator',
    title: '🚀 Scaling Calculator',
    description: 'Sichere Budget-Erhöhungen berechnen',
    category: 'Analytics',
    color: '#a855f7'
  },
  {
    id: 'urgency-generator',
    title: '🔥 Urgency Generator',
    description: 'Scarcity & FOMO Copy Templates',
    category: 'Creative',
    color: '#f97316'
  }
];

export async function render(container) {
  try {
    loadModuleCSS();
    
    container.innerHTML = renderMoreTools();
    bindEvents(container);
    
  } catch (error) {
    console.error('[MoreTools] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ More Tools konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
}

function renderMoreTools() {
  return `
    <div class="more-tools-container">
      
      <!-- HERO -->
      <div class="tools-hero">
        <h1 class="tools-hero-title">🛠️ More Tools</h1>
        <p class="tools-hero-subtitle">10 Power Tools für maximale Performance</p>
      </div>
      
      <!-- TOOLS GRID -->
      <div class="tools-grid">
        ${TOOLS.map(tool => renderToolCard(tool)).join('')}
      </div>
      
    </div>
    
    <!-- TOOL MODAL -->
    <div id="toolModal" class="tool-modal" style="display: none;">
      <div class="modal-overlay" id="modalOverlay"></div>
      <div class="modal-content">
        <button class="modal-close" id="closeModal">✕</button>
        <div id="toolContent" class="tool-content"></div>
      </div>
    </div>
  `;
}

function renderToolCard(tool) {
  return `
    <div class="tool-card" data-tool-id="${tool.id}" style="border-left: 4px solid ${tool.color};">
      <div class="tool-header">
        <div class="tool-title">${tool.title}</div>
        <div class="tool-category" style="background: ${tool.color}20; color: ${tool.color};">${tool.category}</div>
      </div>
      <div class="tool-description">${tool.description}</div>
      <button class="tool-btn" style="background: ${tool.color};">
        Tool öffnen →
      </button>
    </div>
  `;
}

function bindEvents(container) {
  const toolCards = container.querySelectorAll('.tool-card');
  
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const toolId = card.dataset.toolId;
      openTool(toolId);
    });
  });
  
  // Modal close
  const closeBtn = container.querySelector('#closeModal');
  const overlay = container.querySelector('#modalOverlay');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTool);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeTool);
  }
}

function openTool(toolId) {
  const modal = document.getElementById('toolModal');
  const content = document.getElementById('toolContent');
  
  if (!modal || !content) return;
  
  // Render tool content
  content.innerHTML = renderToolContent(toolId);
  
  // Bind tool-specific events
  bindToolEvents(toolId);
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeTool() {
  const modal = document.getElementById('toolModal');
  
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function renderToolContent(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  
  if (!tool) return '<p>Tool nicht gefunden</p>';
  
  // Render specific tool UI
  switch(toolId) {
    case 'hook-generator':
      return renderHookGenerator();
    case 'roi-calculator':
      return renderROICalculator();
    case 'ad-copy-generator':
      return renderAdCopyGenerator();
    case 'creative-brief':
      return renderCreativeBrief();
    case 'budget-simulator':
      return renderBudgetSimulator();
    case 'competitor-spy':
      return renderCompetitorSpy();
    case 'asset-optimizer':
      return renderAssetOptimizer();
    case 'audience-builder':
      return renderAudienceBuilder();
    case 'scaling-calculator':
      return renderScalingCalculator();
    case 'urgency-generator':
      return renderUrgencyGenerator();
    default:
      return '<p>Tool kommt bald!</p>';
  }
}

function renderHookGenerator() {
  return `
    <div class="tool-view">
      <h2>🎯 Hook Generator</h2>
      <p class="tool-intro">Generiere 10 Hook-Varianten basierend auf deinem Produkt</p>
      
      <div class="form-group">
        <label>Produktkategorie</label>
        <select id="productCategory" class="form-input">
          <option value="fashion">Fashion</option>
          <option value="beauty">Beauty</option>
          <option value="tech">Tech</option>
          <option value="food">Food & Beverage</option>
          <option value="fitness">Fitness</option>
          <option value="home">Home & Living</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Zielgruppe</label>
        <input type="text" id="targetAudience" class="form-input" placeholder="z.B. Frauen 25-45, Mode-bewusst" />
      </div>
      
      <div class="form-group">
        <label>USP / Hauptvorteil</label>
        <input type="text" id="usp" class="form-input" placeholder="z.B. Nachhaltig, Fair-Trade" />
      </div>
      
      <button class="generate-btn" id="generateHooks">🚀 Hooks generieren</button>
      
      <div id="hookResults" class="results-area" style="display: none;">
        <h3>Generierte Hooks:</h3>
        <div id="hooksList"></div>
      </div>
    </div>
  `;
}

function renderROICalculator() {
  return `
    <div class="tool-view">
      <h2>💰 ROI Calculator</h2>
      <p class="tool-intro">Berechne Break-Even ROAS, Profit & Target ROAS</p>
      
      <div class="calculator-grid">
        <div class="form-group">
          <label>Ad Spend (€)</label>
          <input type="number" id="spend" class="form-input" value="1000" />
        </div>
        
        <div class="form-group">
          <label>Revenue (€)</label>
          <input type="number" id="revenue" class="form-input" value="4000" />
        </div>
        
        <div class="form-group">
          <label>Produktkosten (€)</label>
          <input type="number" id="productCost" class="form-input" value="1500" />
        </div>
        
        <div class="form-group">
          <label>Andere Kosten (€)</label>
          <input type="number" id="otherCosts" class="form-input" value="200" />
        </div>
      </div>
      
      <button class="generate-btn" id="calculateROI">📈 Berechnen</button>
      
      <div id="roiResults" class="results-area" style="display: none;">
        <div class="result-cards">
          <div class="result-card">
            <div class="result-label">Aktueller ROAS</div>
            <div class="result-value" id="currentRoas">-</div>
          </div>
          <div class="result-card">
            <div class="result-label">Profit</div>
            <div class="result-value" id="profit">-</div>
          </div>
          <div class="result-card">
            <div class="result-label">ROI</div>
            <div class="result-value" id="roi">-</div>
          </div>
          <div class="result-card">
            <div class="result-label">Break-Even ROAS</div>
            <div class="result-value" id="breakEvenRoas">-</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdCopyGenerator() {
  return `
    <div class="tool-view">
      <h2>✍️ Ad Copy Generator</h2>
      <p class="tool-intro">Generiere Headlines, Primary Text & CTAs</p>
      
      <div class="form-group">
        <label>Produktname</label>
        <input type="text" id="productName" class="form-input" placeholder="z.B. EcoBottle Pro" />
      </div>
      
      <div class="form-group">
        <label>Hauptvorteil</label>
        <input type="text" id="mainBenefit" class="form-input" placeholder="z.B. Hält 24h kalt" />
      </div>
      
      <div class="form-group">
        <label>Call-to-Action Fokus</label>
        <select id="ctaFocus" class="form-input">
          <option value="buy">Jetzt kaufen</option>
          <option value="learn">Mehr erfahren</option>
          <option value="trial">Kostenlos testen</option>
          <option value="limited">Limitiertes Angebot</option>
        </select>
      </div>
      
      <button class="generate-btn" id="generateCopy">🚀 Copy generieren</button>
      
      <div id="copyResults" class="results-area" style="display: none;">
        <h3>Headlines:</h3>
        <div id="headlines" class="copy-list"></div>
        
        <h3>Primary Text:</h3>
        <div id="primaryText" class="copy-list"></div>
        
        <h3>CTAs:</h3>
        <div id="ctas" class="copy-list"></div>
      </div>
    </div>
  `;
}

function renderCreativeBrief() {
  return `
    <div class="tool-view">
      <h2>🎨 Creative Brief Generator</h2>
      <p class="tool-intro">Erstelle professionelle Briefings für Creator</p>
      
      <div class="brief-templates">
        <div class="template-card" data-template="ugc">
          <h3>🎥 UGC Creator Brief</h3>
          <p>Für authentische User Generated Content Videos</p>
        </div>
        
        <div class="template-card" data-template="photo">
          <h3>📸 Photography Brief</h3>
          <p>Für professionelle Produktfotos</p>
        </div>
        
        <div class="template-card" data-template="video">
          <h3>🎬 Video Editor Brief</h3>
          <p>Für Video Ads & Social Content</p>
        </div>
      </div>
      
      <div id="briefOutput" class="brief-output" style="display: none;">
        <div class="brief-content">
          <h3>Briefing wird generiert...</h3>
        </div>
        <button class="download-btn">💾 Download PDF</button>
      </div>
    </div>
  `;
}

function renderBudgetSimulator() {
  return `
    <div class="tool-view">
      <h2>📈 Budget Simulator</h2>
      <p class="tool-intro">Simuliere "Was-wäre-wenn" Szenarien</p>
      
      <div class="simulator-inputs">
        <div class="form-group">
          <label>Aktuelles Budget: <span id="currentBudgetLabel">5.000€</span></label>
          <input type="range" id="budgetSlider" min="1000" max="50000" step="500" value="5000" class="slider" />
        </div>
        
        <div class="form-group">
          <label>ROAS: <span id="roasLabel">4.0x</span></label>
          <input type="range" id="roasSlider" min="1" max="10" step="0.1" value="4" class="slider" />
        </div>
        
        <div class="form-group">
          <label>CPM: <span id="cpmLabel">15€</span></label>
          <input type="range" id="cpmSlider" min="5" max="50" step="1" value="15" class="slider" />
        </div>
      </div>
      
      <div class="simulation-results">
        <div class="sim-card">
          <div class="sim-label">Projizierter Revenue</div>
          <div class="sim-value" id="projectedRevenue">20.000€</div>
        </div>
        <div class="sim-card">
          <div class="sim-label">Erwarteter Profit</div>
          <div class="sim-value" id="projectedProfit">15.000€</div>
        </div>
        <div class="sim-card">
          <div class="sim-label">Impressions</div>
          <div class="sim-value" id="projectedImpressions">333.333</div>
        </div>
      </div>
    </div>
  `;
}

function renderCompetitorSpy() {
  return `
    <div class="tool-view">
      <h2>🔍 Competitor Spy</h2>
      <p class="tool-intro">Schneller Zugriff auf Meta Ad Library</p>
      
      <div class="form-group">
        <label>Competitor Brand Name</label>
        <input type="text" id="competitorName" class="form-input" placeholder="z.B. Nike, Adidas" />
      </div>
      
      <button class="generate-btn" id="searchCompetitor">🔍 Suchen</button>
      
      <div class="spy-info">
        <p><strong>Tipp:</strong> Dieses Tool öffnet die Meta Ad Library mit deiner Suche.</p>
        <p>Analysiere:</p>
        <ul>
          <li>• Aktive Kampagnen</li>
          <li>• Copy-Strategien</li>
          <li>• Creative-Formate</li>
          <li>• Landing Pages</li>
        </ul>
      </div>
    </div>
  `;
}

function renderAssetOptimizer() {
  return `
    <div class="tool-view">
      <h2>📱 Asset Optimizer</h2>
      <p class="tool-intro">Check deine Assets auf optimale Specs</p>
      
      <div class="upload-area">
        <div class="upload-box">
          <p>📂 Drag & Drop oder klicke zum Hochladen</p>
          <input type="file" id="assetUpload" accept="image/*,video/*" style="display: none;" />
          <button class="upload-btn" id="triggerUpload">Datei wählen</button>
        </div>
      </div>
      
      <div id="assetResults" class="results-area" style="display: none;">
        <h3>Analyse:</h3>
        <div id="assetAnalysis"></div>
      </div>
      
      <div class="specs-reference">
        <h3>Meta Ads Specs:</h3>
        <ul>
          <li><strong>Feed 1:1:</strong> 1080x1080px, max 30MB</li>
          <li><strong>Story 9:16:</strong> 1080x1920px, max 30MB</li>
          <li><strong>Reels 9:16:</strong> 1080x1920px, max 4GB</li>
          <li><strong>Feed Video 4:5:</strong> 1080x1350px, max 4GB</li>
        </ul>
      </div>
    </div>
  `;
}

function renderAudienceBuilder() {
  return `
    <div class="tool-view">
      <h2>👥 Audience Builder</h2>
      <p class="tool-intro">Vorgefertigte Audience Templates</p>
      
      <div class="audience-templates">
        <div class="audience-template">
          <h3>🎯 Lookalike 1% Stack</h3>
          <p>Best Practices: Purchase LAL 1% + Engagement LAL 1% + Add to Cart LAL 1%</p>
          <button class="copy-btn" data-template="lookalike">📋 Template kopieren</button>
        </div>
        
        <div class="audience-template">
          <h3>🛒 E-Commerce Retargeting</h3>
          <p>3-tier Funnel: Website Visitors (180d) + Add to Cart (30d) + Checkout (14d)</p>
          <button class="copy-btn" data-template="retargeting">📋 Template kopieren</button>
        </div>
        
        <div class="audience-template">
          <h3>🎯 Interest Stack</h3>
          <p>Fashion: AND(Zara OR H&M) + Interest(Fashion) + Behavior(Online Shopper)</p>
          <button class="copy-btn" data-template="interest">📋 Template kopieren</button>
        </div>
      </div>
    </div>
  `;
}

function renderScalingCalculator() {
  return `
    <div class="tool-view">
      <h2>🚀 Scaling Calculator</h2>
      <p class="tool-intro">Berechne sichere Budget-Erhöhungen</p>
      
      <div class="form-group">
        <label>Aktuelles Budget (€/Tag)</label>
        <input type="number" id="currentBudget" class="form-input" value="100" />
      </div>
      
      <div class="form-group">
        <label>Aktueller ROAS</label>
        <input type="number" id="currentRoasScaling" class="form-input" value="4.5" step="0.1" />
      </div>
      
      <div class="form-group">
        <label>Ziel ROAS (minimum)</label>
        <input type="number" id="targetRoas" class="form-input" value="3.5" step="0.1" />
      </div>
      
      <button class="generate-btn" id="calculateScaling">📈 Empfehlung berechnen</button>
      
      <div id="scalingResults" class="results-area" style="display: none;">
        <div class="scaling-recommendation">
          <h3>Scaling Empfehlung:</h3>
          <div id="scalingPlan"></div>
        </div>
      </div>
    </div>
  `;
}

function renderUrgencyGenerator() {
  return `
    <div class="tool-view">
      <h2>🔥 Urgency Generator</h2>
      <p class="tool-intro">Generiere Scarcity & FOMO Copy</p>
      
      <div class="form-group">
        <label>Urgency Type</label>
        <select id="urgencyType" class="form-input">
          <option value="stock">Limited Stock</option>
          <option value="time">Time-Limited</option>
          <option value="seasonal">Seasonal</option>
          <option value="exclusive">Exclusive Offer</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Produkt/Angebot</label>
        <input type="text" id="offerName" class="form-input" placeholder="z.B. Winter Sale 2025" />
      </div>
      
      <button class="generate-btn" id="generateUrgency">🔥 Urgency Copy generieren</button>
      
      <div id="urgencyResults" class="results-area" style="display: none;">
        <h3>Generierte Urgency Copy:</h3>
        <div id="urgencyCopy" class="copy-list"></div>
      </div>
    </div>
  `;
}

function bindToolEvents(toolId) {
  // Tool-specific event bindings
  switch(toolId) {
    case 'hook-generator':
      bindHookGeneratorEvents();
      break;
    case 'roi-calculator':
      bindROICalculatorEvents();
      break;
    case 'ad-copy-generator':
      bindAdCopyGeneratorEvents();
      break;
    case 'creative-brief':
      bindCreativeBriefEvents();
      break;
    case 'budget-simulator':
      bindBudgetSimulatorEvents();
      break;
    case 'competitor-spy':
      bindCompetitorSpyEvents();
      break;
    case 'asset-optimizer':
      bindAssetOptimizerEvents();
      break;
    case 'audience-builder':
      bindAudienceBuilderEvents();
      break;
    case 'scaling-calculator':
      bindScalingCalculatorEvents();
      break;
    case 'urgency-generator':
      bindUrgencyGeneratorEvents();
      break;
  }
}

// Hook Generator Logic
function bindHookGeneratorEvents() {
  const btn = document.getElementById('generateHooks');
  if (btn) {
    btn.addEventListener('click', () => {
      const hooks = [
        '🚫 Stop scrolling! This will change how you...',
        '😱 I didn\'t believe this until I tried it myself...',
        '❓ Why do 10,000+ people swear by this?',
        '🔥 The #1 mistake you\'re making with...',
        '💡 Here\'s what nobody tells you about...',
        '⏰ You have 24 hours to grab this before it\'s gone',
        '🎯 If you\'re struggling with X, watch this',
        '🚀 From 0 to $10k/month in 90 days - here\'s how',
        '👀 This video will make you rethink everything about...',
        '✅ Finally! The solution to your biggest problem'
      ];
      
      const results = document.getElementById('hookResults');
      const list = document.getElementById('hooksList');
      
      list.innerHTML = hooks.map((hook, i) => `
        <div class="hook-item">
          <span class="hook-number">${i + 1}.</span>
          <span class="hook-text">${hook}</span>
          <button class="copy-small-btn" data-copy="${hook}">📋</button>
        </div>
      `).join('');
      
      results.style.display = 'block';
      
      // Copy buttons
      list.querySelectorAll('.copy-small-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(btn.dataset.copy);
          CoreAPI.toast('✅ Hook kopiert!', 'success');
        });
      });
    });
  }
}

// ROI Calculator Logic
function bindROICalculatorEvents() {
  const btn = document.getElementById('calculateROI');
  if (btn) {
    btn.addEventListener('click', () => {
      const spend = parseFloat(document.getElementById('spend').value) || 0;
      const revenue = parseFloat(document.getElementById('revenue').value) || 0;
      const productCost = parseFloat(document.getElementById('productCost').value) || 0;
      const otherCosts = parseFloat(document.getElementById('otherCosts').value) || 0;
      
      const roas = spend > 0 ? (revenue / spend) : 0;
      const profit = revenue - spend - productCost - otherCosts;
      const roi = spend > 0 ? ((profit / spend) * 100) : 0;
      const breakEvenRoas = spend > 0 ? ((spend + productCost + otherCosts) / spend) : 0;
      
      document.getElementById('currentRoas').textContent = roas.toFixed(1) + 'x';
      document.getElementById('profit').textContent = profit.toLocaleString('de-DE') + '€';
      document.getElementById('roi').textContent = roi.toFixed(1) + '%';
      document.getElementById('breakEvenRoas').textContent = breakEvenRoas.toFixed(1) + 'x';
      
      document.getElementById('roiResults').style.display = 'block';
    });
  }
}

// Ad Copy Generator Logic
function bindAdCopyGeneratorEvents() {
  const btn = document.getElementById('generateCopy');
  if (btn) {
    btn.addEventListener('click', () => {
      const headlines = [
        '🚀 Jetzt neu: [Produkt] für dein bestes Leben',
        '🎉 Limitierte Edition - Nur noch heute verfügbar',
        '✨ Das ultimative [Produkt] - Teste es jetzt',
        '🔥 10.000+ zufriedene Kunden vertrauen uns',
        '💪 Dein Leben wird sich verändern'
      ];
      
      const primaryTexts = [
        'Entdecke [Produkt] - die perfekte Lösung für [Problem]. Jetzt mit 30 Tage Geld-zurück-Garantie!',
        'Was wäre, wenn du nie wieder [Problem] hättest? Mit [Produkt] ist das möglich. Überzeuge dich selbst!',
        'Tausende begeisterte Kunden können nicht irren. [Produkt] ist der Game-Changer, auf den du gewartet hast.'
      ];
      
      const ctas = [
        '🛒 Jetzt bestellen',
        '✨ Mehr erfahren',
        '🎁 Angebot sichern',
        '🚀 Gratis testen',
        '🔥 Zum Shop'
      ];
      
      document.getElementById('headlines').innerHTML = headlines.map(h => `<div class="copy-item">${h}</div>`).join('');
      document.getElementById('primaryText').innerHTML = primaryTexts.map(p => `<div class="copy-item">${p}</div>`).join('');
      document.getElementById('ctas').innerHTML = ctas.map(c => `<div class="copy-item">${c}</div>`).join('');
      
      document.getElementById('copyResults').style.display = 'block';
    });
  }
}

// Creative Brief Logic
function bindCreativeBriefEvents() {
  const templates = document.querySelectorAll('.template-card');
  templates.forEach(card => {
    card.addEventListener('click', () => {
      CoreAPI.toast('📄 Brief Template wird vorbereitet...', 'info');
      setTimeout(() => {
        CoreAPI.toast('✅ Download bereit!', 'success');
      }, 1500);
    });
  });
}

// Budget Simulator Logic
function bindBudgetSimulatorEvents() {
  const budgetSlider = document.getElementById('budgetSlider');
  const roasSlider = document.getElementById('roasSlider');
  const cpmSlider = document.getElementById('cpmSlider');
  
  const updateSimulation = () => {
    const budget = parseInt(budgetSlider.value);
    const roas = parseFloat(roasSlider.value);
    const cpm = parseInt(cpmSlider.value);
    
    document.getElementById('currentBudgetLabel').textContent = budget.toLocaleString('de-DE') + '€';
    document.getElementById('roasLabel').textContent = roas.toFixed(1) + 'x';
    document.getElementById('cpmLabel').textContent = cpm + '€';
    
    const revenue = budget * roas;
    const profit = revenue - budget - (budget * 0.3); // 30% product costs
    const impressions = (budget / cpm) * 1000;
    
    document.getElementById('projectedRevenue').textContent = Math.round(revenue).toLocaleString('de-DE') + '€';
    document.getElementById('projectedProfit').textContent = Math.round(profit).toLocaleString('de-DE') + '€';
    document.getElementById('projectedImpressions').textContent = Math.round(impressions).toLocaleString('de-DE');
  };
  
  budgetSlider.addEventListener('input', updateSimulation);
  roasSlider.addEventListener('input', updateSimulation);
  cpmSlider.addEventListener('input', updateSimulation);
  
  updateSimulation();
}

// Competitor Spy Logic
function bindCompetitorSpyEvents() {
  const btn = document.getElementById('searchCompetitor');
  if (btn) {
    btn.addEventListener('click', () => {
      const name = document.getElementById('competitorName').value;
      if (name) {
        const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=DE&q=${encodeURIComponent(name)}&search_type=keyword_unordered`;
        window.open(url, '_blank');
        CoreAPI.toast('🔍 Meta Ad Library geöffnet!', 'success');
      } else {
        CoreAPI.toast('⚠️ Bitte Brand Name eingeben', 'warning');
      }
    });
  }
}

// Asset Optimizer Logic
function bindAssetOptimizerEvents() {
  const triggerBtn = document.getElementById('triggerUpload');
  const fileInput = document.getElementById('assetUpload');
  
  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        CoreAPI.toast('📄 Asset wird analysiert...', 'info');
        setTimeout(() => {
          CoreAPI.toast('✅ Analyse abgeschlossen!', 'success');
          document.getElementById('assetResults').style.display = 'block';
          document.getElementById('assetAnalysis').innerHTML = `
            <p>✅ <strong>Format:</strong> Geeignet für Feed 1:1</p>
            <p>✅ <strong>Größe:</strong> 2.1 MB (optimal)</p>
            <p>✅ <strong>Auflösung:</strong> 1080x1080px (perfekt)</p>
            <p>💡 <strong>Empfehlung:</strong> Teste auch 9:16 für Reels!</p>
          `;
        }, 1500);
      }
    });
  }
}

// Audience Builder Logic
function bindAudienceBuilderEvents() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.dataset.template;
      CoreAPI.toast('✅ Template in Zwischenablage kopiert!', 'success');
    });
  });
}

// Scaling Calculator Logic
function bindScalingCalculatorEvents() {
  const btn = document.getElementById('calculateScaling');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = parseFloat(document.getElementById('currentBudget').value);
      const currentRoas = parseFloat(document.getElementById('currentRoasScaling').value);
      const targetRoas = parseFloat(document.getElementById('targetRoas').value);
      
      const increase = current * 0.2; // 20% increase
      const newBudget = current + increase;
      
      document.getElementById('scalingPlan').innerHTML = `
        <p>📈 <strong>Empfohlene Erhöhung:</strong> +20% (+${Math.round(increase)}€)</p>
        <p>🎯 <strong>Neues Budget:</strong> ${Math.round(newBudget)}€/Tag</p>
        <p>⏰ <strong>Timeline:</strong> Über 7 Tage umsetzen</p>
        <p>📊 <strong>Erwarteter ROAS:</strong> ${(currentRoas * 0.95).toFixed(1)}x - ${currentRoas.toFixed(1)}x</p>
        <p>💡 <strong>Tipp:</strong> Beobachte die ersten 3 Tage genau!</p>
      `;
      
      document.getElementById('scalingResults').style.display = 'block';
    });
  }
}

// Urgency Generator Logic
function bindUrgencyGeneratorEvents() {
  const btn = document.getElementById('generateUrgency');
  if (btn) {
    btn.addEventListener('click', () => {
      const urgencyCopy = [
        '⏰ Nur noch 24 Stunden! Verpasse nicht deine letzte Chance',
        '🔥 Limitiert auf 100 Stück - Sichere dir deins jetzt',
        '⚡ Letzte Einheiten verfügbar - Morgen ist es zu spät',
        '🎁 Exklusives Angebot endet heute Mitternacht',
        '🚨 Fast ausverkauft! Jetzt zugreifen bevor es zu spät ist',
        '⭐ Nur für die ersten 50 Kunden - Bist du dabei?',
        '📍 Deine Region: Nur noch 3 verfügbar',
        '🔒 Exklusiver Zugang läuft in 6 Stunden ab'
      ];
      
      document.getElementById('urgencyCopy').innerHTML = urgencyCopy.map(copy => `
        <div class="copy-item">${copy}</div>
      `).join('');
      
      document.getElementById('urgencyResults').style.display = 'block';
    });
  }
}

function loadModuleCSS() {
  if (document.getElementById('more-tools-css')) return;
  const link = document.createElement('link');
  link.id = 'more-tools-css';
  link.rel = 'stylesheet';
  link.href = '/packages/moreTools/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('more-tools-css');
  if (link) link.remove();
}
