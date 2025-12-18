/**
 * SignalOne Academy - V3 FINAL (Phase 2)
 * 
 * OPTIMIERUNGEN:
 * - Schlankerer Hero
 * - Alle 7 Themes mit allen Modulen
 * - Modal z-index 999999 (über allem)
 * - Sauberes Öffnen/Schließen ohne Scroll-Bug
 */

import { CoreAPI } from '../../core-api.js';

export const meta = {
  id: 'academy',
  label: 'Academy',
  requiresData: false
};

// ALLE 7 THEMES MIT KOMPLETTEN MODULEN
const THEMES = [
  {
    id: 'roas-mastery',
    folder: 'ROAS Mastery',
    title: 'ROAS Mastery',
    description: 'Von Tracking über Optimierung bis Scaling - Der komplette ROAS Guide',
    image: 'assets/kurse/ROAS Mastery/thema14.png',
    logo: 'assets/kurse/ROAS Mastery/Logo_re_tr.png',
    category: 'Advanced',
    duration: '120 min',
    modules: [
      { type: 'summary', file: 'Executive Summary.html', title: 'Executive Summary' },
      { type: 'main', file: 'MAIN - thema14 - ROAS_Mastery_Part_1_Fundament.html', title: 'Part 1: Fundament' },
      { type: 'main', file: 'MAIN - thema14 - ROAS_Mastery_Part_2_Tracking.html', title: 'Part 2: Tracking' },
      { type: 'main', file: 'MAIN - thema14 - ROAS_Mastery_Part_3.html', title: 'Part 3: Optimierung' },
      { type: 'main', file: 'MAIN - thema14 - ROAS_Mastery_Part_4.html', title: 'Part 4: Scaling' },
      { type: 'extra', file: 'EXTRA - ROAS Decision Cards.html', title: 'ROAS Decision Cards' }
    ]
  },
  {
    id: 'ab-testing',
    folder: 'A-B Testing Masterclass',
    title: 'A/B Testing Masterclass',
    description: 'Professionelles A/B Testing für datenbasierte Entscheidungen',
    image: 'assets/kurse/A-B Testing Masterclass/thema17.png',
    logo: 'assets/kurse/A-B Testing Masterclass/Logo_re_tr.png',
    category: 'Intermediate',
    duration: '90 min',
    modules: [
      { type: 'main', file: 'MAIN - thema17 - A-B Testing Masterclass.html', title: 'A/B Testing Masterclass' },
      { type: 'extra', file: 'EXTRA - A-B Testing Prompt Library.html', title: 'Prompt Library' }
    ]
  },
  {
    id: 'account-architektur',
    folder: 'Account Architektur',
    title: 'Account Architektur',
    description: 'Optimale Account-Struktur für nachhaltiges Wachstum',
    image: 'assets/kurse/Account Architektur/thema13.png',
    logo: 'assets/kurse/Account Architektur/Logo_re_tr.png',
    category: 'Beginner',
    duration: '75 min',
    modules: [
      { type: 'main', file: 'MAIN - thema13 - Account Architektur.html', title: 'Account Architektur' },
      { type: 'extra', file: 'EXTRA - Account Blueprint.html', title: 'Account Blueprint' },
      { type: 'extra', file: 'EXTRA - Prompt Library.html', title: 'Prompt Library' }
    ]
  },
  {
    id: 'account-zustand',
    folder: 'Account Zustand',
    title: 'Account Zustand',
    description: 'Halte deinen Account gesund und vermeide Sperrungen',
    image: 'assets/kurse/Account Zustand/thema2.png',
    logo: 'assets/kurse/Account Zustand/Logo_re_tr.png',
    category: 'Beginner',
    duration: '60 min',
    modules: [
      { type: 'main', file: 'MAIN - Account Zustand.html', title: 'Account Health Management' },
      { type: 'extra', file: 'EXTRA - Health Checklist.html', title: 'Health Checklist' }
    ]
  },
  {
    id: 'budget-planung',
    folder: 'Budget Planung & Verteilung',
    title: 'Budget Planung & Verteilung',
    description: 'Strategische Budget-Allokation für maximalen ROI',
    image: 'assets/kurse/Budget Planung & Verteilung/thema2.png',
    logo: 'assets/kurse/Budget Planung & Verteilung/Logo_re_tr.png',
    category: 'Intermediate',
    duration: '85 min',
    modules: [
      { type: 'main', file: 'MAIN - thema2 - Budget Planung & Verteilung.html', title: 'Budget Planung & Verteilung' },
      { type: 'extra', file: 'EXTRA - Budget Allocation Planner.html', title: 'Budget Allocation Planner' },
      { type: 'extra', file: 'EXTRA - Budget Health Scorecard.html', title: 'Budget Health Scorecard' }
    ]
  },
  {
    id: 'landingpage',
    folder: 'Landingpage Grundlagen',
    title: 'Landingpage Grundlagen',
    description: 'Baue hochkonvertierende Landing Pages',
    image: 'assets/kurse/Landingpage Grundlagen/thema15.png',
    logo: 'assets/kurse/Landingpage Grundlagen/Logo_re_tr.png',
    category: 'Beginner',
    duration: '95 min',
    modules: [
      { type: 'main', file: 'MAIN - thema15 - Landingpage Grundlagen Teil 1.html', title: 'Teil 1: Fundament' },
      { type: 'main', file: 'MAIN - thema15 - Landingpage Grundlagen Teil 2.html', title: 'Teil 2: Design' },
      { type: 'main', file: 'MAIN - thema15 - Landingpage Grundlagen Teil 3.html', title: 'Teil 3: Copy' },
      { type: 'main', file: 'MAIN - thema15 - Landingpage Grundlagen Teil 4.html', title: 'Teil 4: Conversion' },
      { type: 'extra', file: 'EXTRA - thema15 - Landingpage Blueprint Visualizer.html', title: 'Blueprint Visualizer' }
    ]
  },
  {
    id: 'reporting',
    folder: 'Reporting & Daily Routine',
    title: 'Reporting & Daily Routine',
    description: 'Deine tägliche Routine für profitables Performance Marketing',
    image: 'assets/kurse/Reporting & Daily Routine/thema15.png',
    logo: 'assets/kurse/Reporting & Daily Routine/Logo_re_tr.png',
    category: 'Intermediate',
    duration: '70 min',
    modules: [
      { type: 'main', file: 'MAIN - Reporting & Daily Routine.html', title: 'Daily Performance Routine' },
      { type: 'extra', file: 'EXTRA - Prompt Library.html', title: 'Prompt Library' },
      { type: 'extra', file: 'EXTRA - Steuerungs-Ebenen für Ads & Reporting.html', title: 'Steuerungs-Ebenen' }
    ]
  }
];

const CATEGORIES = ['Alle', 'Beginner', 'Intermediate', 'Advanced'];

let filters = {
  category: 'Alle',
  search: ''
};

let selectedTheme = null;

export async function render(container) {
  try {
    loadModuleCSS();
    container.innerHTML = renderAcademy();
    bindEvents(container);
  } catch (error) {
    console.error('[Academy] Error:', error);
    CoreAPI.showToast('Academy konnte nicht geladen werden', 'error');
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  filters = { category: 'Alle', search: '' };
  selectedTheme = null;
}

function renderAcademy() {
  if (selectedTheme) {
    return renderThemeDetail(selectedTheme);
  }
  
  const filtered = filterThemes();
  const totalModules = THEMES.reduce((sum, t) => sum + t.modules.length, 0);
  
  return `
    <div class="academy">
      
      <!-- OPTIMIZED HERO - 50% SCHLANKER -->
      <div class="academy-hero">
        <div class="hero-badge">🎓 SIGNALONE ACADEMY</div>
        <h1 class="hero-title">Performance Marketing Mastery</h1>
        <p class="hero-subtitle">Dein Weg vom Beginner zum Performance Marketing Expert</p>
      </div>
      
      <!-- KOMPAKTE STATS -->
      <div class="academy-stats">
        <div class="stat-card">
          <div class="stat-value">${THEMES.length}</div>
          <div class="stat-label">Themen</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalModules}</div>
          <div class="stat-label">Module</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">10h+</div>
          <div class="stat-label">Content</div>
        </div>
        <div class="stat-card stat-free">
          <div class="stat-value">100%</div>
          <div class="stat-label">Kostenlos</div>
        </div>
      </div>
      
      <!-- FILTERS -->
      <div class="academy-filters">
        <div class="filter-pills">
          ${CATEGORIES.map(cat => `
            <button 
              class="filter-pill ${filters.category === cat ? 'active' : ''}" 
              data-category="${cat}"
            >
              ${cat}
            </button>
          `).join('')}
        </div>
        
        <input 
          type="text" 
          id="searchInput" 
          class="search-input" 
          placeholder="🔍 Thema suchen..."
          value="${filters.search}"
        />
      </div>
      
      <!-- THEMES GRID -->
      ${filtered.length > 0 ? `
        <div class="themes-grid">
          ${filtered.map(theme => renderThemeCard(theme)).join('')}
        </div>
      ` : renderEmptyState()}
      
    </div>
  `;
}

function renderThemeCard(theme) {
  const categoryColors = {
    'Beginner': '#10B981',
    'Intermediate': '#F59E0B',
    'Advanced': '#EF4444'
  };
  
  return `
    <div class="theme-card" data-theme-id="${theme.id}">
      <div class="theme-image-wrapper">
        <img 
          src="/${theme.image}" 
          alt="${theme.title}" 
          class="theme-image"
          loading="lazy"
        />
      </div>
      
      <div class="theme-content">
        <div class="theme-header">
          <span class="theme-category" style="color: ${categoryColors[theme.category]};">
            ${theme.category}
          </span>
          <span class="theme-type">KOSTENLOS</span>
        </div>
        
        <h3 class="theme-title">${theme.title}</h3>
        <p class="theme-description">${theme.description}</p>
        
        <div class="theme-footer">
          <div class="theme-meta">
            <span>⏱️ ${theme.duration}</span>
            <span>📝 ${theme.modules.length} Module</span>
          </div>
          <button class="theme-btn" data-theme-id="${theme.id}">
            Starten →
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderThemeDetail(theme) {
  return `
    <div class="theme-detail">
      <button class="back-btn" id="backBtn">← Zurück zur Übersicht</button>
      
      <div class="detail-hero">
        <img src="/${theme.logo}" alt="${theme.title}" class="detail-logo" />
        <div class="detail-info">
          <h1 class="detail-title">${theme.title}</h1>
          <p class="detail-description">${theme.description}</p>
          <div class="detail-meta">
            <span class="detail-badge">${theme.category}</span>
            <span class="detail-duration">⏱️ ${theme.duration}</span>
            <span class="detail-modules">📝 ${theme.modules.length} Module</span>
          </div>
        </div>
      </div>
      
      <div class="modules-container">
        <h2 class="modules-title">Kurs-Module</h2>
        
        <div class="modules-list">
          ${theme.modules.map((module, index) => `
            <div class="module-card ${module.type}">
              <div class="module-number">${index + 1}</div>
              <div class="module-info">
                <div class="module-type-badge">${getModuleTypeLabel(module.type)}</div>
                <h3 class="module-title">${module.title}</h3>
              </div>
              <button 
                class="module-open-btn" 
                data-file="${theme.folder}/${module.file}"
              >
                ▶️ Öffnen
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- MODAL - Z-INDEX FIX -->
    <div id="moduleModal" class="module-modal">
      <div class="modal-overlay" id="modalOverlay"></div>
      <div class="modal-container">
        <button class="modal-close" id="closeModal">✕</button>
        <iframe id="moduleFrame" class="module-iframe"></iframe>
      </div>
    </div>
  `;
}

function getModuleTypeLabel(type) {
  const labels = {
    'summary': '📊 Summary',
    'main': '🎯 Main',
    'extra': '✨ Extra'
  };
  return labels[type] || type;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">Keine Themen gefunden</h3>
      <p class="empty-text">Versuche andere Filter oder Suchbegriffe</p>
    </div>
  `;
}

function filterThemes() {
  return THEMES.filter(theme => {
    if (filters.category !== 'Alle' && theme.category !== filters.category) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const titleMatch = theme.title.toLowerCase().includes(search);
      const descMatch = theme.description.toLowerCase().includes(search);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });
}

function bindEvents(container) {
  // Back button
  const backBtn = container.querySelector('#backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      selectedTheme = null;
      render(container);
    });
  }
  
  // Filter pills
  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      filters.category = pill.dataset.category;
      render(container);
    });
  });
  
  // Search
  const searchInput = container.querySelector('#searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search = e.target.value;
      render(container);
    });
  }
  
  // Theme cards
  container.querySelectorAll('.theme-card, .theme-btn').forEach(element => {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      const themeId = element.dataset.themeId || element.closest('.theme-card')?.dataset.themeId;
      if (themeId) {
        selectedTheme = THEMES.find(t => t.id === themeId);
        render(container);
      }
    });
  });
  
  // Module open buttons
  container.querySelectorAll('.module-open-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const file = btn.dataset.file;
      openModule(file);
    });
  });
  
  // Modal close
  const closeBtn = container.querySelector('#closeModal');
  const overlay = container.querySelector('#modalOverlay');
  
  if (closeBtn) closeBtn.addEventListener('click', closeModule);
  if (overlay) overlay.addEventListener('click', closeModule);
  
  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.module-modal.active')) {
      closeModule();
    }
  });
}

function openModule(file) {
  const modal = document.getElementById('moduleModal');
  const frame = document.getElementById('moduleFrame');
  
  if (modal && frame) {
    // Scroll-Position merken
    const scrollY = window.scrollY;
    
    frame.src = `/assets/kurse/${file}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    CoreAPI.showToast('Modul wird geladen...', 'info');
  }
}

function closeModule() {
  const modal = document.getElementById('moduleModal');
  const frame = document.getElementById('moduleFrame');
  
  if (modal && frame) {
    // Scroll-Position wiederherstellen
    const scrollY = document.body.style.top;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    
    setTimeout(() => {
      frame.src = '';
    }, 300);
  }
}

function loadModuleCSS() {
  if (document.getElementById('academy-css')) return;
  const link = document.createElement('link');
  link.id = 'academy-css';
  link.rel = 'stylesheet';
  link.href = '/packages/academy/module.css';
  document.head.appendChild(link);
}

function unloadModuleCSS() {
  const link = document.getElementById('academy-css');
  if (link) link.remove();
}
