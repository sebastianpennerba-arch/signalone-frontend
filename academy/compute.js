// packages/academy/compute.js
// SignalOne Academy - Data & Business Logic

export function computeAcademyData(AppState = {}) {
  const userData = getUserData(AppState);
  const coursesData = getAllCourses();
  const userProgress = getUserProgress(AppState);
  const recommendations = getPersonalizedRecommendations(userData, userProgress);
  
  return {
    user: userData,
    courses: coursesData,
    progress: userProgress,
    recommendations,
    stats: calculateUserStats(userProgress),
    nextCourse: findNextCourse(coursesData, userProgress)
  };
}

// ============================================
// COURSES DATABASE - 20 Free Launch Courses
// ============================================
function getAllCourses() {
  return [
    // BEGINNER LEVEL (1-7)
    {
      id: 'course-001',
      title: 'Meta Ads Grundlagen 2025',
      subtitle: 'Dein Einstieg in profitables Performance Marketing',
      level: 'beginner',
      category: 'fundamentals',
      duration: '45 min',
      modules: 6,
      icon: '🚀',
      premium: false,
      image: 'course-001.jpg', // Deine erstellten Bilder
      description: 'Lerne die Basics von Meta Ads - von Kampagnenstruktur bis zur ersten Anzeige.',
      learnings: [
        'Meta Business Manager Setup',
        'Kampagnenstrukturen verstehen',
        'Deine erste Kampagne erstellen',
        'Grundlegende KPIs auswerten'
      ],
      difficulty: 1,
      completionRate: 0
    },
    {
      id: 'course-002',
      title: 'Creative Basics für Einsteiger',
      subtitle: 'Wie gute Werbeanzeigen wirklich funktionieren',
      level: 'beginner',
      category: 'creative',
      duration: '35 min',
      modules: 5,
      icon: '🎨',
      premium: false,
      image: 'course-002.jpg',
      description: 'Verstehe die Grundprinzipien erfolgreicher Ad Creatives.',
      learnings: [
        'Hook-Pattern-Offer Framework',
        'Die 3-Sekunden-Regel',
        'Format-Grundlagen (Feed, Story, Reel)',
        'Mobile-First Design Prinzipien'
      ],
      difficulty: 1,
      completionRate: 0
    },
    {
      id: 'course-003',
      title: 'Targeting 101: Wen erreichst du?',
      subtitle: 'Zielgruppen richtig verstehen und aufsetzen',
      level: 'beginner',
      category: 'targeting',
      duration: '40 min',
      modules: 5,
      icon: '🎯',
      premium: false,
      image: 'course-003.jpg',
      description: 'Von Broad Audiences bis Custom Audiences - alles was du wissen musst.',
      learnings: [
        'Broad vs. Interest Targeting',
        'Custom Audiences erstellen',
        'Lookalike Audiences aufbauen',
        'Ausschluss-Strategien'
      ],
      difficulty: 1,
      completionRate: 0
    },
    {
      id: 'course-004',
      title: 'Budget & Bidding Strategien',
      subtitle: 'Wie du dein Budget optimal verteilst',
      level: 'beginner',
      category: 'fundamentals',
      duration: '30 min',
      modules: 4,
      icon: '💰',
      premium: false,
      image: 'course-004.jpg',
      description: 'Lerne Budgetierung und Bidding-Strategien für maximale Effizienz.',
      learnings: [
        'CBO vs. ABO verstehen',
        'Bid Caps richtig einsetzen',
        'Scaling-Budgets planen',
        'Budget-Pacing analysieren'
      ],
      difficulty: 1,
      completionRate: 0
    },
    {
      id: 'course-005',
      title: 'Conversion Tracking Setup',
      subtitle: 'Messe was wirklich zählt',
      level: 'beginner',
      category: 'analytics',
      duration: '50 min',
      modules: 6,
      icon: '📊',
      premium: false,
      image: 'course-005.jpg',
      description: 'Pixel, Conversions API und Event Setup - technisch sauber umgesetzt.',
      learnings: [
        'Meta Pixel installieren',
        'Conversions API einrichten',
        'Custom Events definieren',
        'Tracking debuggen'
      ],
      difficulty: 2,
      completionRate: 0
    },
    {
      id: 'course-006',
      title: 'Landing Pages die konvertieren',
      subtitle: 'Von Klick zu Kunde - der letzte Meter zählt',
      level: 'beginner',
      category: 'conversion',
      duration: '55 min',
      modules: 7,
      icon: '🎯',
      premium: false,
      image: 'course-006.jpg',
      description: 'Optimiere deine Landing Pages für maximale Conversion Rate.',
      learnings: [
        'Above-the-Fold Optimierung',
        'CTA-Strategien',
        'Trust-Elemente einbauen',
        'Mobile-Optimierung'
      ],
      difficulty: 2,
      completionRate: 0
    },
    {
      id: 'course-007',
      title: 'KPIs verstehen & interpretieren',
      subtitle: 'Zahlen lesen wie ein Pro',
      level: 'beginner',
      category: 'analytics',
      duration: '45 min',
      modules: 6,
      icon: '📈',
      premium: false,
      image: 'course-007.jpg',
      description: 'Von CTR bis ROAS - lerne alle wichtigen Metriken zu analysieren.',
      learnings: [
        'Die wichtigsten KPIs im Überblick',
        'ROAS vs. CPA richtig bewerten',
        'CTR, CPM, CPC verstehen',
        'Frequency & Reach interpretieren'
      ],
      difficulty: 1,
      completionRate: 0
    },

    // INTERMEDIATE LEVEL (8-14)
    {
      id: 'course-008',
      title: 'UGC Content Mastery',
      subtitle: 'User Generated Content professionell einsetzen',
      level: 'intermediate',
      category: 'creative',
      duration: '60 min',
      modules: 8,
      icon: '🎬',
      premium: false,
      image: 'course-008.jpg',
      description: 'Erstelle und optimiere UGC Ads die performen.',
      learnings: [
        'UGC Briefings schreiben',
        'Creator finden und managen',
        'Hook-Formeln für UGC',
        'UGC Testing Framework'
      ],
      difficulty: 3,
      completionRate: 0
    },
    {
      id: 'course-009',
      title: 'Advanced Kampagnenstrukturen',
      subtitle: 'Skalierbare Account-Architekturen aufbauen',
      level: 'intermediate',
      category: 'fundamentals',
      duration: '70 min',
      modules: 9,
      icon: '🏗️',
      premium: false,
      image: 'course-009.jpg',
      description: 'Baue robuste Kampagnenstrukturen für nachhaltiges Wachstum.',
      learnings: [
        'Full-Funnel Struktur aufbauen',
        'Testing vs. Scaling Kampagnen',
        'Retargeting-Layer implementieren',
        'Account-Hygiene & Cleanups'
      ],
      difficulty: 3,
      completionRate: 0
    },
    {
      id: 'course-010',
      title: 'Creative Testing Frameworks',
      subtitle: 'Systematisch die besten Creatives finden',
      level: 'intermediate',
      category: 'testing',
      duration: '55 min',
      modules: 7,
      icon: '🧪',
      premium: false,
      image: 'course-010.jpg',
      description: 'Entwickle ein systematisches Testing-System für deine Ads.',
      learnings: [
        'Testing-Hypothesen aufstellen',
        'Sample Size & Significance',
        'Iterative Testing-Prozesse',
        'Winner-Scaling Strategien'
      ],
      difficulty: 3,
      completionRate: 0
    },
    {
      id: 'course-011',
      title: 'Copywriting für Performance Ads',
      subtitle: 'Texte die verkaufen - nicht nur informieren',
      level: 'intermediate',
      category: 'creative',
      duration: '50 min',
      modules: 6,
      icon: '✍️',
      premium: false,
      image: 'course-011.jpg',
      description: 'Schreibe Ad Copy die Aufmerksamkeit schafft und konvertiert.',
      learnings: [
        'Hook-Frameworks im Detail',
        'Pain-Agitate-Solution Pattern',
        'Social Proof integrieren',
        'CTA-Optimierung'
      ],
      difficulty: 3,
      completionRate: 0
    },
    {
      id: 'course-012',
      title: 'Retargeting Strategien 2025',
      subtitle: 'Warme Audiences profitabel bespielen',
      level: 'intermediate',
      category: 'targeting',
      duration: '65 min',
      modules: 8,
      icon: '🔁',
      premium: false,
      image: 'course-012.jpg',
      description: 'Baue profitable Retargeting-Funnels mit hoher Conversion Rate.',
      learnings: [
        'Multi-Layer Retargeting Setup',
        'Time-Window Strategien',
        'Dynamic Product Ads',
        'Retargeting Creative Angles'
      ],
      difficulty: 3,
      completionRate: 0
    },
    {
      id: 'course-013',
      title: 'A/B Testing Meisterklasse',
      subtitle: 'Wissenschaftlich testen - profitabel skalieren',
      level: 'intermediate',
      category: 'testing',
      duration: '75 min',
      modules: 9,
      icon: '⚗️',
      premium: false,
      image: 'course-013.jpg',
      description: 'Lerne statistically significant Testing auf Pro-Level.',
      learnings: [
        'Statistische Signifikanz verstehen',
        'Multi-Variant Testing',
        'Testing Roadmaps erstellen',
        'Learnings dokumentieren'
      ],
      difficulty: 4,
      completionRate: 0
    },
    {
      id: 'course-014',
      title: 'Scaling ohne Budget-Waste',
      subtitle: 'Profitable Skalierung systematisch umsetzen',
      level: 'intermediate',
      category: 'scaling',
      duration: '80 min',
      modules: 10,
      icon: '📈',
      premium: false,
      image: 'course-014.jpg',
      description: 'Skaliere deine Winner ohne ROAS-Einbrüche.',
      learnings: [
        'Horizontal vs. Vertical Scaling',
        'Budget-Ramping Strategien',
        'Scaling-Indikatoren erkennen',
        'Frequency Management'
      ],
      difficulty: 4,
      completionRate: 0
    },

    // ADVANCED/EXPERT LEVEL (15-20)
    {
      id: 'course-015',
      title: 'Algorithmus-Hacking 2025',
      subtitle: 'Wie Meta\'s Learning System wirklich funktioniert',
      level: 'advanced',
      category: 'fundamentals',
      duration: '90 min',
      modules: 11,
      icon: '🧠',
      premium: false,
      image: 'course-015.jpg',
      description: 'Deep Dive in Meta\'s Machine Learning und wie du es zu deinem Vorteil nutzt.',
      learnings: [
        'Learning Phase verstehen & beschleunigen',
        'Algorithmus-Signale optimieren',
        'Attribution Modeling',
        'Advantage+ richtig nutzen'
      ],
      difficulty: 5,
      completionRate: 0
    },
    {
      id: 'course-016',
      title: 'Creative Production Systeme',
      subtitle: 'High-Volume Content Pipelines aufbauen',
      level: 'advanced',
      category: 'creative',
      duration: '85 min',
      modules: 10,
      icon: '🎥',
      premium: false,
      image: 'course-016.jpg',
      description: 'Baue ein skalierbares System für konstanten Creative Output.',
      learnings: [
        'Production Workflows designen',
        'Creator-Teams aufbauen',
        'Batch-Production optimieren',
        'Quality Control Prozesse'
      ],
      difficulty: 5,
      completionRate: 0
    },
    {
      id: 'course-017',
      title: 'Data-Driven Attribution',
      subtitle: 'Multi-Touch Attribution Models verstehen',
      level: 'advanced',
      category: 'analytics',
      duration: '95 min',
      modules: 12,
      icon: '📊',
      premium: false,
      image: 'course-017.jpg',
      description: 'Verstehe komplexe Attribution Models und optimiere danach.',
      learnings: [
        'First-Click vs. Last-Click',
        'Time-Decay Models',
        'Custom Attribution Windows',
        'Cross-Channel Attribution'
      ],
      difficulty: 5,
      completionRate: 0
    },
    {
      id: 'course-018',
      title: 'Enterprise Account Management',
      subtitle: 'Multi-Brand Accounts professionell strukturieren',
      level: 'advanced',
      category: 'fundamentals',
      duration: '100 min',
      modules: 13,
      icon: '🏢',
      premium: false,
      image: 'course-018.jpg',
      description: 'Manage komplexe Multi-Brand Setups mit hohen Budgets.',
      learnings: [
        'Business Manager Architekturen',
        'Permissions & Governance',
        'Consolidated Reporting',
        'Agency-Client Workflows'
      ],
      difficulty: 5,
      completionRate: 0
    },
    {
      id: 'course-019',
      title: 'Predictive Analytics & Forecasting',
      subtitle: 'Zukunfts-Performance vorhersagen',
      level: 'expert',
      category: 'analytics',
      duration: '110 min',
      modules: 14,
      icon: '🔮',
      premium: false,
      image: 'course-019.jpg',
      description: 'Nutze fortgeschrittene Analytics für Forecasting und Planning.',
      learnings: [
        'Predictive Models aufbauen',
        'Seasonality-Adjustments',
        'Budget-Forecasting',
        'Risk-Assessment Frameworks'
      ],
      difficulty: 6,
      completionRate: 0
    },
    {
      id: 'course-020',
      title: 'Meta Ads Mastery: Complete System',
      subtitle: 'Das ultimative End-to-End Framework',
      level: 'expert',
      category: 'fundamentals',
      duration: '120 min',
      modules: 15,
      icon: '👑',
      premium: false,
      image: 'course-020.jpg',
      description: 'Alle Puzzleteile zusammengefügt - dein komplettes Performance Marketing System.',
      learnings: [
        'Full-Stack Performance Setup',
        'Team & Process Management',
        'Continuous Optimization Loops',
        'Innovation & Testing Culture'
      ],
      difficulty: 6,
      completionRate: 0
    }
  ];
}

// ============================================
// USER DATA & PROGRESS FUNCTIONS
// ============================================
function getUserData(AppState) {
  return {
    name: AppState.username || 'Performance Marketer',
    level: AppState.userLevel || 'intermediate',
    accountAge: AppState.accountAge || 14, // days
    totalCoursesCompleted: AppState.coursesCompleted || 0,
    totalLearningTime: AppState.learningTime || 0, // minutes
    currentStreak: AppState.learningStreak || 0 // days
  };
}

function getUserProgress(AppState) {
  // In production: fetch from backend/localStorage
  // Demo: return mock progress data
  return {
    'course-001': { completed: true, progress: 100, timeSpent: 45, lastAccessed: '2025-12-08' },
    'course-002': { completed: false, progress: 60, timeSpent: 21, lastAccessed: '2025-12-09' },
    'course-003': { completed: false, progress: 0, timeSpent: 0, lastAccessed: null }
    // ... weitere Kurse
  };
}

function calculateUserStats(userProgress) {
  const courses = Object.keys(userProgress);
  const completed = courses.filter(id => userProgress[id].completed).length;
  const inProgress = courses.filter(id => userProgress[id].progress > 0 && !userProgress[id].completed).length;
  const totalTime = courses.reduce((sum, id) => sum + (userProgress[id].timeSpent || 0), 0);

  return {
    completed,
    inProgress,
    totalCourses: getAllCourses().length,
    totalTime,
    completionRate: Math.round((completed / getAllCourses().length) * 100)
  };
}

function getPersonalizedRecommendations(userData, userProgress) {
  const allCourses = getAllCourses();
  const completed = Object.keys(userProgress).filter(id => userProgress[id].completed);
  
  // Simple recommendation logic - in production: use ML/AI
  const recommendations = allCourses
    .filter(course => !completed.includes(course.id))
    .sort((a, b) => {
      // Prioritize based on user level
      if (userData.level === 'beginner') return a.difficulty - b.difficulty;
      if (userData.level === 'intermediate') {
        if (a.difficulty >= 2 && a.difficulty <= 4) return -1;
        return 1;
      }
      return b.difficulty - a.difficulty;
    })
    .slice(0, 3);

  return recommendations;
}

function findNextCourse(coursesData, userProgress) {
  const inProgress = Object.keys(userProgress).find(
    id => userProgress[id].progress > 0 && userProgress[id].progress < 100
  );
  
  if (inProgress) {
    return coursesData.find(c => c.id === inProgress);
  }

  // Find first uncompleted course
  return coursesData.find(c => !userProgress[c.id] || userProgress[c.id].progress === 0);
}

// ============================================
// SEARCH & FILTER FUNCTIONS
// ============================================
export function filterCourses(courses, filters = {}) {
  let filtered = [...courses];

  if (filters.level) {
    filtered = filtered.filter(c => c.level === filters.level);
  }

  if (filters.category) {
    filtered = filtered.filter(c => c.category === filters.category);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(searchLower) ||
      c.description.toLowerCase().includes(searchLower)
    );
  }

  if (filters.onlyFree) {
    filtered = filtered.filter(c => !c.premium);
  }

  return filtered;
}

export function sortCourses(courses, sortBy = 'recommended') {
  const sorted = [...courses];

  switch (sortBy) {
    case 'difficulty-asc':
      return sorted.sort((a, b) => a.difficulty - b.difficulty);
    case 'difficulty-desc':
      return sorted.sort((a, b) => b.difficulty - a.difficulty);
    case 'duration-asc':
      return sorted.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    case 'duration-desc':
      return sorted.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted; // recommended - default order
  }
}
