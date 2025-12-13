/**
 * SignalOne - Academy Module
 * 
 * THE MONEY-MAKING MACHINE 💰
 * 
 * Features:
 * - 20 Premium Kurse mit Bildern
 * - Kategorie-Filter
 * - Search-Funktion
 * - Modal für Kurs-Ansicht
 * - Progress Tracking
 * - Bookmarks
 */

import { CoreAPI } from '../../core-api.js';

export const meta = {
  id: 'academy',
  label: 'Academy',
  requiresData: false
};

const COURSES = [
  {
    id: 'ab-testing',
    title: 'A/B Testing Masterclass',
    category: 'Testing & Analytics',
    difficulty: 'Advanced',
    duration: '45 min',
    image: '/assets/kurse/Course_AB_Testing_Masterclass.png',
    file: '/assets/kurse/Course_AB_Testing_Masterclass.html',
    description: 'Lerne professionelles A/B Testing für maximale ROAS-Steigerung'
  },
  {
    id: 'account-health',
    title: 'Account Health',
    category: 'Account Management',
    difficulty: 'Beginner',
    duration: '30 min',
    image: '/assets/kurse/Course_Account_Health.png',
    file: '/assets/kurse/Course_Account_Health.html',
    description: 'Halte deinen Ad Account gesund und vermeide Sperren'
  },
  {
    id: 'account-structure',
    title: 'Account Structure',
    category: 'Account Management',
    difficulty: 'Intermediate',
    duration: '40 min',
    image: '/assets/kurse/Course_Account_Structure.png',
    file: '/assets/kurse/Course_Account_Structure.html',
    description: 'Optimale Account-Struktur für nachhaltiges Wachstum'
  },
  {
    id: 'attribution-models',
    title: 'Attribution Models',
    category: 'Testing & Analytics',
    difficulty: 'Advanced',
    duration: '35 min',
    image: '/assets/kurse/Course_Attribution_Models.png',
    file: '/assets/kurse/Course_Attribution_Models.html',
    description: 'Verstehe Attribution Models und optimiere dein Tracking'
  },
  {
    id: 'budget-allocation',
    title: 'Budget Allocation',
    category: 'Scaling & Budget',
    difficulty: 'Intermediate',
    duration: '40 min',
    image: '/assets/kurse/Course_Budget_Allocation.png',
    file: '/assets/kurse/Course_Budget_Allocation.html',
    description: 'Verteile dein Budget optimal für maximalen ROI'
  },
  {
    id: 'cbo-vs-abo',
    title: 'CBO vs ABO',
    category: 'Scaling & Budget',
    difficulty: 'Intermediate',
    duration: '35 min',
    image: '/assets/kurse/Course_CBO_vs_ABO.png',
    file: '/assets/kurse/Course_CBO_vs_ABO.html',
    description: 'Wann nutzt du CBO und wann ABO? Die ultimative Anleitung'
  },
  {
    id: 'creative-fatigue',
    title: 'Creative Fatigue',
    category: 'Creative Strategy',
    difficulty: 'Intermediate',
    duration: '30 min',
    image: '/assets/kurse/Course_Creative_Fatigue.png',
    file: '/assets/kurse/Course_Creative_Fatigue.html',
    description: 'Erkenne und behebe Creative Fatigue rechtzeitig'
  },
  {
    id: 'email-ads',
    title: 'Email Ads Integration',
    category: 'Advanced Tactics',
    difficulty: 'Advanced',
    duration: '40 min',
    image: '/assets/kurse/Course_Email_Ads_Integration.png',
    file: '/assets/kurse/Course_Email_Ads_Integration.html',
    description: 'Verbinde Email Marketing mit deinen Ad Campaigns'
  },
  {
    id: 'landing-page',
    title: 'Landing Page Essentials',
    category: 'Conversion',
    difficulty: 'Beginner',
    duration: '50 min',
    image: '/assets/kurse/Course_Landing_Page_Essentials.png',
    file: '/assets/kurse/Course_Landing_Page_Essentials.html',
    description: 'Baue hochkonvertierende Landing Pages'
  },
  {
    id: 'lookalike',
    title: 'Lookalike Audiences 2.0',
    category: 'Targeting',
    difficulty: 'Intermediate',
    duration: '35 min',
    image: '/assets/kurse/Course_Lookalike_Audiences_2.0.png',
    file: '/assets/kurse/Course_Lookalike_Audiences_2.0.html',
    description: 'Moderne Lookalike-Strategien für 2025'
  },
  {
    id: 'meta-pixel',
    title: 'Meta Pixel Deep Dive',
    category: 'Testing & Analytics',
    difficulty: 'Advanced',
    duration: '45 min',
    image: '/assets/kurse/Course_Meta_Pixel_Deep_Dive.png',
    file: '/assets/kurse/Course_Meta_Pixel_Deep_Dive.html',
    description: 'Master das Meta Pixel für perfektes Tracking'
  },
  {
    id: 'multi-offer',
    title: 'Multi Offer Funnels',
    category: 'Advanced Tactics',
    difficulty: 'Advanced',
    duration: '50 min',
    image: '/assets/kurse/Course_Multi_Offer_Funnels.png',
    file: '/assets/kurse/Course_Multi_Offer_Funnels.html',
    description: 'Maximiere AOV mit Multi-Offer-Strategien'
  },
  {
    id: 'psychology',
    title: 'Psychology of Conversion',
    category: 'Conversion',
    difficulty: 'Intermediate',
    duration: '45 min',
    image: '/assets/kurse/Course_Psychology_of_Conversion.png',
    file: '/assets/kurse/Course_Psychology_of_Conversion.html',
    description: 'Nutze psychologische Trigger für höhere Conversions'
  },
  {
    id: 'roas-mastery',
    title: 'ROAS Mastery',
    category: 'Scaling & Budget',
    difficulty: 'Advanced',
    duration: '60 min',
    image: '/assets/kurse/Course_ROAS_Mastery.png',
    file: '/assets/kurse/Course_ROAS_Mastery.html',
    description: 'Der komplette Guide zu profitablem ROAS'
  },
  {
    id: 'retargeting',
    title: 'Retargeting Matrix',
    category: 'Targeting',
    difficulty: 'Intermediate',
    duration: '40 min',
    image: '/assets/kurse/Course_Retargeting_Matrix.png',
    file: '/assets/kurse/Course_Retargeting_Matrix.html',
    description: 'Aufbau einer profitablen Retargeting-Strategie'
  },
  {
    id: 'scaling',
    title: 'Scaling Without Killing ROAS',
    category: 'Scaling & Budget',
    difficulty: 'Advanced',
    duration: '50 min',
    image: '/assets/kurse/Course_Scaling_Without_Killing_ROAS.png',
    file: '/assets/kurse/Course_Scaling_Without_Killing_ROAS.html',
    description: 'Skaliere profitabel ohne ROAS zu zerstören'
  },
  {
    id: 'seasonal',
    title: 'Seasonal Campaign Planning',
    category: 'Account Management',
    difficulty: 'Intermediate',
    duration: '40 min',
    image: '/assets/kurse/Course_Seasonal_Campaign_Planning.png',
    file: '/assets/kurse/Course_Seasonal_Campaign_Planning.html',
    description: 'Plane erfolgreiche Saison-Kampagnen'
  },
  {
    id: '3-second-rule',
    title: 'The 3 Second Rule',
    category: 'Creative Strategy',
    difficulty: 'Beginner',
    duration: '35 min',
    image: '/assets/kurse/Course_The_3_Second_Rule.png',
    file: '/assets/kurse/Course_The_3_Second_Rule.html',
    description: 'Fessele Nutzer in den ersten 3 Sekunden'
  },
  {
    id: 'ugc',
    title: 'UGC Content',
    category: 'Creative Strategy',
    difficulty: 'Beginner',
    duration: '40 min',
    image: '/assets/kurse/Course_UGC_Content.png',
    file: '/assets/kurse/Course_UGC_Content.html',
    description: 'Erstelle authentische UGC Ads die konvertieren'
  },
  {
    id: 'video-ads',
    title: 'Video Ads',
    category: 'Creative Strategy',
    difficulty: 'Intermediate',
    duration: '55 min',
    image: '/assets/kurse/Course_Video_Ads.png',
    file: '/assets/kurse/Course_Video_Ads.html',
    description: 'Produziere Video Ads die verkaufen'
  }
];

const CATEGORIES = ['Alle', 'Creative Strategy', 'Scaling & Budget', 'Testing & Analytics', 'Targeting', 'Conversion', 'Account Management', 'Advanced Tactics'];

let filters = {
  category: 'Alle',
  search: '',
  difficulty: 'Alle'
};

export async function render(container) {
  try {
    loadModuleCSS();
    
    container.innerHTML = renderAcademy();
    bindEvents(container);
    
  } catch (error) {
    console.error('[Academy] Error:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <h2 style="font-size: 1.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️ Academy konnte nicht geladen werden</h2>
        <p style="color: #6b7280;">${error.message}</p>
      </div>
    `;
  }
}

export async function destroy(container) {
  container.innerHTML = '';
  unloadModuleCSS();
  filters = { category: 'Alle', search: '', difficulty: 'Alle' };
}

function renderAcademy() {
  const filtered = filterCourses();
  
  return `
    <div class="academy-container">
      
      <!-- HERO -->
      <div class="academy-hero">
        <h1 class="academy-hero-title">📘 SignalOne Academy</h1>
        <p class="academy-hero-subtitle">Dein Performance Marketing MBA - Von Beginner bis Expert</p>
      </div>
      
      <!-- FILTERS -->
      <div class="academy-filters">
        <div class="filter-tabs">
          ${CATEGORIES.map(cat => `
            <button class="filter-tab ${filters.category === cat ? 'active' : ''}" data-category="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>
        
        <div class="filter-controls">
          <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="🔍 Kurs suchen..."
            value="${filters.search}"
          />
          
          <select id="difficultySelect" class="difficulty-select">
            <option value="Alle">Alle Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      <!-- STATS -->
      <div class="academy-stats">
        <div class="stat-item">
          <div class="stat-value">${COURSES.length}</div>
          <div class="stat-label">Kurse</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${filtered.length}</div>
          <div class="stat-label">Angezeigt</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">∞</div>
          <div class="stat-label">Wissen</div>
        </div>
      </div>
      
      <!-- COURSES GRID -->
      <div class="courses-grid">
        ${filtered.map(course => renderCourseCard(course)).join('')}
      </div>
      
      ${filtered.length === 0 ? '<div class="no-results">🔍 Keine Kurse gefunden</div>' : ''}
      
    </div>
    
    <!-- MODAL -->
    <div id="courseModal" class="course-modal" style="display: none;">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" id="closeModal">✕</button>
        <iframe id="courseFrame" class="course-frame"></iframe>
      </div>
    </div>
  `;
}

function renderCourseCard(course) {
  const difficultyClass = `difficulty-${course.difficulty.toLowerCase()}`;
  
  return `
    <div class="course-card" data-course-id="${course.id}">
      <div class="course-image">
        <img src="${course.image}" alt="${course.title}" loading="lazy" />
        <div class="course-difficulty ${difficultyClass}">${course.difficulty}</div>
      </div>
      
      <div class="course-content">
        <div class="course-category">📚 ${course.category}</div>
        <h3 class="course-title">${course.title}</h3>
        <p class="course-description">${course.description}</p>
        
        <div class="course-meta">
          <span class="meta-item">⏱️ ${course.duration}</span>
          <span class="meta-item">🎓 Kostenlos</span>
        </div>
        
        <button class="course-btn" data-file="${course.file}">
          🚀 Kurs starten
        </button>
      </div>
    </div>
  `;
}

function filterCourses() {
  return COURSES.filter(course => {
    if (filters.category !== 'Alle' && course.category !== filters.category) return false;
    if (filters.difficulty !== 'Alle' && course.difficulty !== filters.difficulty) return false;
    if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

function bindEvents(container) {
  // Category tabs
  const tabs = container.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filters.category = tab.dataset.category;
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
  
  // Difficulty select
  const difficultySelect = container.querySelector('#difficultySelect');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      filters.difficulty = e.target.value;
      render(container);
    });
  }
  
  // Course cards
  const courseCards = container.querySelectorAll('.course-card');
  courseCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('course-btn')) {
        const file = e.target.dataset.file;
        openCourse(file);
      }
    });
  });
  
  // Modal close
  const closeBtn = container.querySelector('#closeModal');
  const modalOverlay = container.querySelector('.modal-overlay');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCourse);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeCourse);
  }
}

function openCourse(file) {
  const modal = document.getElementById('courseModal');
  const frame = document.getElementById('courseFrame');
  
  if (modal && frame) {
    frame.src = file;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeCourse() {
  const modal = document.getElementById('courseModal');
  const frame = document.getElementById('courseFrame');
  
  if (modal && frame) {
    modal.style.display = 'none';
    frame.src = '';
    document.body.style.overflow = 'auto';
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
