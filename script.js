 /********************
 * CONSTANTS & CONFIG
 ********************/
const LS_KEY = 'lx-data-v4'; // Updated version for security improvements
const ADMIN = { user: 'admin7', pass: 'ali7800' };
const PASSWORD_SECRET = 'edu_system_secret_key'; // For basic password obfuscation

/********************
 * UTILITY FUNCTIONS
 ********************/
// DOM helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ID generator
const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

// Basic password obfuscation (not for production - for demonstration only)
const encryptPassword = (password) => {
  return btoa(encodeURIComponent(password + PASSWORD_SECRET));
};

const decryptPassword = (encrypted) => {
  return decodeURIComponent(atob(encrypted)).replace(PASSWORD_SECRET, '');
};

// Debounce function for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/********************
 * STATE MANAGEMENT
 ********************/
let DB = null;
let currentStudent = null;
let currentQuiz = null;
let quizTimer = null;
let currentQuestionIndex = 0;
let studentAnswers = {};
let appState = {
  isAdmin: false,
  activeSection: 'home',
  activeTab: null
};

// Initialize application
const initApp = () => {
  loadData();
  setupEventListeners();
  updateUI();
};

/********************
 * DATA MANAGEMENT
 ********************/
const loadData = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    initializeDemoData();
    return;
  }
  try {
    DB = JSON.parse(raw);
    // Ensure all required properties exist
    DB.grades = DB.grades || {};
    DB.dictionary = DB.dictionary || [];
    DB.quiz = DB.quiz || [];
    DB.exams = DB.exams || [];
    DB.exercises = DB.exercises || [];
    DB.lessons = DB.lessons || [];
    DB.announcement = DB.announcement || "";
    DB.announcementImage = DB.announcementImage || "";
    DB.revisionRequests = DB.revisionRequests || [];
    DB.quizResults = DB.quizResults || {};
  } catch (e) {
    console.error("Error parsing stored ", e);
    localStorage.removeItem(LS_KEY);
    initializeDemoData();
  }
};

// ✅✅✅ تم دمج بياناتك هنا مع تشفير كلمات المرور ✅✅✅
const initializeDemoData = () => {
  DB = {
    students: [
      {
        "id": "id-qtu7fy39",
        "fullname": "Ahmed Amine",
        "username": "ahmed.amine",
        "password": encryptPassword("1234"), // ✅ تم التشفير
        "code": "P-2024-001",
        "classroom": "2ème Bac SP"
      },
      {
        "id": "id-nzftxsgm",
        "fullname": "Sara El",
        "username": "sara.el",
        "password": encryptPassword("abcd"), // ✅ تم التشفير
        "code": "P-2024-002",
        "classroom": "2ème Bac SP"
      },
      {
        "id": "id-sz718lmr",
        "fullname": "ali bairouè",
        "username": "ali.bairouk",
        "password": encryptPassword("abcd1"), // ✅ تم التشفير
        "code": "P-2024-003",
        "classroom": "2ème Bac SP"
      },
      {
        "id": "id-aoj4g2fm",
        "fullname": "Saad lmobi",
        "username": "Saad.lmobi",
        "password": encryptPassword("1234"), // ✅ تم التشفير
        "code": "P-2024-004",
        "classroom": "2ème Bac SP"
      },
      {
        "id": "id-kjsylmlp",
        "fullname": "Achraf amir",
        "username": "Achraf.amir",
        "password": encryptPassword("1234"), // ✅ تم التشفير
        "code": "P-2024-005",
        "classroom": "2ème Bac SP"
      },
      {
        "id": "id-tqbv50to",
        "fullname": "Ahmed omari",
        "username": "Ahmed.omari",
        "password": encryptPassword("1234"), // ✅ تم التشفير
        "code": "P-2024-006",
        "classroom": "2ème Bac SP"
      }
    ],
    grades: {
      "id-qtu7fy39": [
        {
          "id": "id-12kd0imv",
          "date": "2024-10-15",
          "subject": "Mécanique",
          "title": "Contrôle 1",
          "score": 16.5,
          "note": "Très bien"
        }
      ],
      "id-sz718lmr": [
        {
          "id": "id-nzpmp2p8",
          "subject": "physique",
          "title": "Contrôle 1",
          "date": "2025-09-05",
          "score": 12,
          "note": "P"
        }
      ],
      "id-aoj4g2fm": [
        {
          "id": "id-gdj95evr",
          "subject": "Contrôle 1",
          "title": "Contrôle 1",
          "date": "2025-09-05",
          "score": 11,
          "note": "P"
        }
      ],
      "id-kjsylmlp": [
        {
          "id": "id-r4epgu3u",
          "subject": "physique",
          "title": "Contrôle 1",
          "date": "2025-09-05",
          "score": 5,
          "note": "F"
        }
      ],
      "id-tqbv50to": [
        {
          "id": "id-ix95ujev",
          "subject": "physique",
          "title": "Contrôle 1",
          "date": "2025-09-05",
          "score": 2,
          "note": "F"
        }
      ]
    },
    dictionary: [
      {
        "id": "id-78801jpm",
        "ar": "الطاقة",
        "fr": "Énergie",
        "def": "Capacité d'un système à produire un travail."
      },
      {
        "id": "id-nq556ws2",
        "ar": "السرعة",
        "fr": "Vitesse",
        "def": "Distance parcourue par unité de temps."
      },
      {
        "id": "id-4cnz3uv9",
        "ar": "التسارع",
        "fr": "Accélération",
        "def": "Taux de changement de la vitesse."
      },
      {
        "id": "id-6b58jnbb",
        "ar": "القوة",
        "fr": "Force",
        "def": "Action mécanique modifiant le mouvement."
      }
    ],
    quiz: [],
    exams: [],
    exercises: [],
    lessons: [],
    announcement: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة",
    announcementImage: "",
    revisionRequests: [],
    quizResults: {}
  };
  setData(DB);
};

const setData = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    DB = data;
  } catch (e) {
    console.error("Error saving data:", e);
    alert("خطأ في حفظ البيانات. قد يكون تخزين localStorage ممتلئاً.");
  }
};

/********************
 * UI MANAGEMENT
 ********************/
const updateUI = () => {
  // Update announcement
  if (DB && DB.announcement) {
    document.getElementById('announcementText').textContent = DB.announcement;
    document.getElementById('announcementInput').value = DB.announcement;
    if (DB.announcementImage) {
      document.getElementById('announcementImage').src = DB.announcementImage;
      document.getElementById('announcementImage').style.display = 'block';
    }
  }
  // Update based on authentication state
  if (appState.isAdmin) {
    document.body.classList.add('admin-mode');
    $('#admin-panel').style.display = 'block';
    renderStudentsTable();
    populateStudentSelects();
    renderAdminGradesTable();
    updateDashboardStats();
    renderAdminDictionaryList();
    renderAdminQuizList();
  } else {
    document.body.classList.remove('admin-mode');
    $('#admin-panel').style.display = 'none';
  }
  if (currentStudent) {
    $('#student-dashboard').style.display = 'block';
    $('#studentWelcome').textContent = `Bienvenue, ${currentStudent.fullname}`;
    loadStudentResources();
    populateRevisionForm();
    loadStudentRevisionRequests();
    loadStudentQuizzes();
  } else {
    $('#student-dashboard').style.display = 'none';
  }
};

/********************
 * EVENT HANDLING
 ********************/
const setupEventListeners = () => {
  // Navigation
  $$('.nav-link, .feature-card').forEach(item => {
    item.addEventListener('click', function() {
      const id = this.getAttribute('data-section');
      if (id) showSection(id);
    });
  });

  // Student tabs navigation
  $$('.student-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchStudentTab(tabId);
    });
  });

  // Admin tabs navigation
  $$('.admin-tab-link').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      switchAdminTab(tabId);
    });
  });

  // Student login
  $('#studentLoginBtn').addEventListener('click', () => $('#studentLoginModal').style.display = 'flex');
  $('#cancelStudentLogin').addEventListener('click', () => $('#studentLoginModal').style.display = 'none');
  $('#submitStudentLogin').addEventListener('click', handleStudentLogin);

  // Admin login
  $('#loginBtn').addEventListener('click', () => $('#loginModal').style.display = 'flex');
  $('#cancelLogin').addEventListener('click', () => $('#loginModal').style.display = 'none');
  $('#submitLogin').addEventListener('click', handleAdminLogin);

  // Logout
  $('#logoutBtn').addEventListener('click', handleAdminLogout);
  $('#studentLogoutBtn').addEventListener('click', handleStudentLogout);

  // Search by code
  $('#btnSearchByCode').addEventListener('click', handleSearchByCode);

  // Revision request
  $('#revisionRequestForm').addEventListener('submit', handleRevisionRequest);

  // Quiz navigation
  $('#prevQuestion').addEventListener('click', handlePrevQuestion);
  $('#nextQuestion').addEventListener('click', handleNextQuestion);
  $('#submitQuiz').addEventListener('click', submitQuiz);

  // Student management
  $('#btnSaveStudent').addEventListener('click', saveStudent);
  $('#btnResetStudent').addEventListener('click', resetStudentForm);

  // Grade management
  $('#btnSaveGrade').addEventListener('click', saveGrade);
  $('#btnResetGrade').addEventListener('click', resetGradeForm);
  $('#grFilterStudent').addEventListener('change', renderAdminGradesTable);

  // Dictionary management
  $('#adminBtnSaveDict').addEventListener('click', saveDictionaryTerm);
  $('#adminBtnResetDict').addEventListener('click', resetDictionaryForm);

  // Quiz management
  $('#adminBtnSaveQuiz').addEventListener('click', saveQuizQuestion);
  $('#adminBtnResetQuiz').addEventListener('click', resetQuizForm);

  // Announcement management
  $('#btnSaveAnnouncement').addEventListener('click', saveAnnouncement);
  $('#announcementImageInput').addEventListener('change', handleAnnouncementImagePreview);

  // Data import/export
  $('#btnExport').addEventListener('click', exportData);
  $('#importFile').addEventListener('change', importData);

  // Modal close handlers
  window.addEventListener('click', (e) => {
    if (e.target === $('#studentLoginModal')) $('#studentLoginModal').style.display = 'none';
    if (e.target === $('#loginModal')) $('#loginModal').style.display = 'none';
  });

  // Debounced search for better performance
  $('#filterStudents').addEventListener('input', debounce(filterStudents, 300));
};

/********************
 * NAVIGATION
 ********************/
const showSection = (id) => {
  $$('.page-section').forEach(s => s.classList.remove('active'));
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    appState.activeSection = id;
  }
};

const switchStudentTab = (tabId) => {
  $$('.student-tab').forEach(t => t.classList
