
// packages/academy/render.js
// SignalOne Academy - UI Rendering Layer

import { filterCourses, sortCourses } from './compute.js';

export function renderAcademyView(container, data) {
  const { user, courses, progress, recommendations, stats, nextCourse } = data;

  container.innerHTML = `
    <div class="academy-container">
      
      <!-- Hero Section with User Stats -->
      <div class="academy-hero">
        <div class="academy-hero-content">
          <div class="academy-hero-text">
            <h1 class="academy-hero-title">
              <span class="hero-icon">📘</span>
              SignalOne Academy
            </h1>
            <p class="academy-hero-subtitle">
              Werde zum Performance Marketing Expert – mit praxisnahen Kursen direkt aus 7-stelligen Ad Accounts.
            </p>
          </div>
          
          <div class="academy-stats-cards">
            ${renderStatsCard('Kurse abgeschlossen', stats.completed, stats.totalCourses, '✅')}
            ${renderStatsCard('In Bearbeitung', stats.inProgress, stats.totalCourses, '📚')}
            ${renderStatsCard('Lernzeit', formatTime(stats.totalTime), null, '⏱️')}
            ${renderStatsCard('Fortschritt', `${stats.completionRate}%`, null, '🎯')}
          </div>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      ${renderRecommendationsSection(recommendations, nextCourse)}

      <!-- Filter & Search Bar -->
      <div class="academy-controls">
        <div class="academy-search-wrapper">
          <input 
            type="text" 
            id="academySearch" 
            class="academy-search-input" 
            placeholder="Kurse durchsuchen..."
          />
          <span class="academy-search-icon">🔍</span>
        </div>

        <div class="academy-filters">
          <select id="academyLevelFilter" class="academy-filter-select">
            <option value="">Alle Level</option>
            <option value="beginner">Anfänger</option>
            <option value="intermediate">Fortgeschritten</option>
            <option value="advanced">Experte</option>
            <option value="expert">Master</option>
          </select>

          <select id="academyCategoryFilter" class="academy-filter-select">
            <option value="">Alle Kategorien</option>
            <option value="fundamentals">Grundlagen</option>
            <option value="creative">Creative</option>
            <option value="targeting">Targeting</option>
            <option value="analytics">Analytics</option>
            <option value="testing">Testing</option>
            <option value="scaling">Scaling</option>
            <option value="conversion">Conversion</option>
          </select>

          <select id="academySortFilter" class="academy-filter-select">
            <option value="recommended">Empfohlen</option>
            <option value="difficulty-asc">Schwierigkeit ↑</option>
            <option value="difficulty-desc">Schwierigkeit ↓</option>
            <option value="duration-asc">Dauer ↑</option>
            <option value="duration-desc">Dauer ↓</option>
            <option value="title">A-Z</option>
          </select>
        </div>
      </div>

      <!-- Courses Grid -->
      <div class="academy-courses-section">
        <div id="academyCoursesGrid" class="academy-courses-grid">
          ${courses.map(course => renderCourseCard(course, progress[course.id])).join('')}
        </div>
      </div>

      <!-- Launch Offer Banner -->
      <div class="academy-launch-banner">
        <div class="launch-banner-content">
          <h3 class="launch-banner-title">🎉 Launch Special: Alle 20 Kurse kostenlos!</h3>
          <p class="launch-banner-text">
            Sichere dir jetzt alle Grundlagen-Kurse zum Launch – komplett kostenfrei. 
            Später wird Premium-Content hinzugefügt, aber diese 20 bleiben für dich immer verfügbar.
          </p>
        </div>
      </div>

    </div>
  `;

  attachEventListeners(courses, progress);
}

// ============================================
// COMPONENT RENDERERS
// ============================================
function renderStatsCard(label, value, maxValue, icon) {
  const displayValue = maxValue ? `${value}/${maxValue}` : value;
  const percentage = maxValue ? Math.round((value / maxValue) * 100) : null;

  return `
    <div class="academy-stat-card">
      <div class="stat-card-icon">${icon}</div>
      <div class="stat-card-content">
        <div class="stat-card-label">${label}</div>
        <div class="stat-card-value">${displayValue}</div>
        ${percentage !== null ? `
          <div class="stat-card-progress">
            <div class="stat-card-progress-bar" style="width: ${percentage}%"></div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderRecommendationsSection(recommendations, nextCourse) {
  if (!recommendations || recommendations.length === 0) {
    return '';
  }

  return `
    <div class="academy-recommendations">
      <div class="recommendations-header">
        <h2 class="recommendations-title">
          <span class="rec-icon">⚡</span>
          Für dich empfohlen
        </h2>
        <p class="recommendations-subtitle">
          Basierend auf deinem Level und Fortschritt haben wir diese Kurse für dich ausgewählt
        </p>
      </div>

      ${nextCourse ? renderNextCourseCard(nextCourse) : ''}

      <div class="recommendations-grid">
        ${recommendations.map(course => renderRecommendationCard(course)).join('')}
      </div>
    </div>
  `;
}

function renderNextCourseCard(course) {
  return `
    <div class="next-course-card">
      <div class="next-course-badge">
        <span class="badge-icon">▶️</span>
        Weitermachen
      </div>
      <div class="next-course-content">
        <div class="next-course-image" style="background-image: url('assets/academy/${course.image}')">
          <div class="next-course-overlay"></div>
        </div>
        <div class="next-course-info">
          <h3 class="next-course-title">${course.title}</h3>
          <p class="next-course-subtitle">${course.subtitle}</p>
          <button class="next-course-cta" data-course-id="${course.id}">
            <span>Kurs fortsetzen</span>
            <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderRecommendationCard(course) {
  return `
    <div class="recommendation-card" data-course-id="${course.id}">
      <div class="rec-card-image" style="background-image: url('assets/academy/${course.image}')"></div>
      <div class="rec-card-content">
        <div class="rec-card-meta">
          <span class="rec-card-level">${getLevelBadge(course.level)}</span>
          <span class="rec-card-duration">${course.duration}</span>
        </div>
        <h4 class="rec-card-title">${course.title}</h4>
        <p class="rec-card-description">${course.description}</p>
      </div>
    </div>
  `;
}

function renderCourseCard(course, userProgress = {}) {
  const isCompleted = userProgress.completed || false;
  const progressPercent = userProgress.progress || 0;
  const isInProgress = progressPercent > 0 && progressPercent < 100;

  return `
    <div class="course-card ${isCompleted ? 'course-completed' : ''} ${isInProgress ? 'course-in-progress' : ''}" 
         data-course-id="${course.id}">
      
      <!-- Course Image with Status Overlay -->
      <div class="course-card-image" style="background-image: url('assets/academy/${course.image}')">
        ${course.premium ? `
          <div class="course-premium-badge">
            <span class="premium-icon">👑</span>
            Premium
          </div>
        ` : `
          <div class="course-free-badge">
            <span class="free-icon">🎁</span>
            Kostenlos
          </div>
        `}
        
        ${isCompleted ? `
          <div class="course-completed-overlay">
            <span class="completed-check">✓</span>
            Abgeschlossen
          </div>
        ` : ''}

        ${isInProgress ? `
          <div class="course-progress-overlay">
            <div class="progress-ring">
              <svg width="50" height="50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#FF6B35" stroke-width="3" 
                        stroke-dasharray="${2 * Math.PI * 20}" 
                        stroke-dashoffset="${2 * Math.PI * 20 * (1 - progressPercent / 100)}"
                        transform="rotate(-90 25 25)"/>
              </svg>
              <span class="progress-percent">${progressPercent}%</span>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Course Content -->
      <div class="course-card-content">
        
        <!-- Course Meta -->
        <div class="course-card-meta">
          <span class="course-level-badge ${course.level}">${getLevelBadge(course.level)}</span>
          <span class="course-category-tag">${getCategoryLabel(course.category)}</span>
        </div>

        <!-- Course Title -->
        <h3 class="course-card-title">${course.icon} ${course.title}</h3>
        <p class="course-card-subtitle">${course.subtitle}</p>

        <!-- Course Info -->
        <div class="course-card-info">
          <div class="course-info-item">
            <span class="info-icon">⏱️</span>
            <span class="info-text">${course.duration}</span>
          </div>
          <div class="course-info-item">
            <span class="info-icon">📑</span>
            <span class="info-text">${course.modules} Module</span>
          </div>
          <div class="course-info-item">
            <span class="info-icon">📊</span>
            <span class="info-text">Level ${course.difficulty}</span>
          </div>
        </div>

        <!-- Course Description -->
        <p class="course-card-description">${course.description}</p>

        <!-- Key Learnings -->
        <div class="course-learnings">
          <div class="learnings-title">Das lernst du:</div>
          <ul class="learnings-list">
            ${course.learnings.slice(0, 3).map(learning => `
              <li class="learning-item">
                <span class="learning-check">✓</span>
                ${learning}
              </li>
            `).join('')}
            ${course.learnings.length > 3 ? `
              <li class="learning-item learning-more">+${course.learnings.length - 3} weitere</li>
            ` : ''}
          </ul>
        </div>

        <!-- CTA Button -->
        <button class="course-card-cta ${isCompleted ? 'cta-completed' : isInProgress ? 'cta-continue' : ''}" 
                data-course-id="${course.id}">
          ${isCompleted ? '✓ Nochmal ansehen' : isInProgress ? '▶ Weitermachen' : '→ Kurs starten'}
        </button>
      </div>
    </div>
  `;
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getLevelBadge(level) {
  const badges = {
    beginner: 'Anfänger',
    intermediate: 'Fortgeschritten',
    advanced: 'Experte',
    expert: 'Master'
  };
  return badges[level] || level;
}

function getCategoryLabel(category) {
  const labels = {
    fundamentals: 'Grundlagen',
    creative: 'Creative',
    targeting: 'Targeting',
    analytics: 'Analytics',
    testing: 'Testing',
    scaling: 'Scaling',
    conversion: 'Conversion'
  };
  return labels[category] || category;
}

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners(coursesData, progressData) {
  // Search
  const searchInput = document.getElementById('academySearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleFiltersChange(coursesData, progressData);
    });
  }

  // Filters
  const levelFilter = document.getElementById('academyLevelFilter');
  const categoryFilter = document.getElementById('academyCategoryFilter');
  const sortFilter = document.getElementById('academySortFilter');

  [levelFilter, categoryFilter, sortFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', () => {
        handleFiltersChange(coursesData, progressData);
      });
    }
  });

  // Course Cards Click
  document.querySelectorAll('.course-card-cta, .recommendation-card, .next-course-cta').forEach(el => {
    el.addEventListener('click', (e) => {
      const courseId = el.dataset.courseId || el.closest('[data-course-id]')?.dataset.courseId;
      if (courseId) {
        handleCourseClick(courseId, coursesData);
      }
    });
  });
}

function handleFiltersChange(coursesData, progressData) {
  const searchValue = document.getElementById('academySearch')?.value || '';
  const levelValue = document.getElementById('academyLevelFilter')?.value || '';
  const categoryValue = document.getElementById('academyCategoryFilter')?.value || '';
  const sortValue = document.getElementById('academySortFilter')?.value || 'recommended';

  let filtered = filterCourses(coursesData, {
    search: searchValue,
    level: levelValue,
    category: categoryValue,
    onlyFree: false
  });

  filtered = sortCourses(filtered, sortValue);

  // Re-render grid
  const grid = document.getElementById('academyCoursesGrid');
  if (grid) {
    grid.innerHTML = filtered.map(course => renderCourseCard(course, progressData[course.id])).join('');
    
    // Re-attach click listeners
    grid.querySelectorAll('.course-card-cta').forEach(el => {
      el.addEventListener('click', (e) => {
        const courseId = el.dataset.courseId;
        if (courseId) {
          handleCourseClick(courseId, coursesData);
        }
      });
    });
  }
}

function handleCourseClick(courseId, coursesData) {
  const course = coursesData.find(c => c.id === courseId);
  if (!course) return;

  // TODO: Implement course detail view or redirect to course page
  console.log('Opening course:', course);
  
  // For now: show toast
  if (window.showToast) {
    window.showToast(`Öffne Kurs: ${course.title}`, 'info');
  }

  // In production: Navigate to course detail page or open modal
  // window.location.href = `/academy/course/${courseId}`;
  // OR: openCourseModal(course);
}
