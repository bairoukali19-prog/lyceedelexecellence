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
    console.error("Error parsing stored data:", e);
    localStorage.removeItem(LS_KEY);
    initializeDemoData();
  }
};

const initializeDemoData = () => {
  DB = {
    students: [
      {
        id: uid(), 
        fullname: 'Ahmed Amine', 
        username: 'ahmed.amine', 
        password: encryptPassword('1234'), 
        code: 'P-2024-001', 
        classroom: '2ème Bac SP'
      },
      {
        id: uid(), 
        fullname: 'Sara El', 
        username: 'sara.el', 
        password: encryptPassword('abcd'), 
        code: 'P-2024-002', 
        classroom: '2ème Bac SP'
      }
    ],
    grades: {},
    dictionary: [
      {id: uid(), ar: 'الطاقة', fr: 'Énergie', def: 'Capacité d\'un système à produire un travail.'},
      {id: uid(), ar: 'السرعة', fr: 'Vitesse', def: 'Distance parcourue par unité de temps.'},
      {id: uid(), ar: 'التسارع', fr: 'Accélération', def: 'Taux de changement de la vitesse.'},
      {id: uid(), ar: 'القوة', fr: 'Force', def: 'Action mécanique modifiant le mouvement.'}
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
  
  // Seed demo grades with encrypted data
  DB.grades[DB.students[0].id] = [
    {id: uid(), date: '2024-10-15', subject: 'Mécanique', title: 'Contrôle 1', score: 16.5, note: 'Très bien'},
    {id: uid(), date: '2024-11-22', subject: 'Électricité', title: 'Contrôle 2', score: 14, note: 'Bon travail'}
  ];
  
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
  $$('.student-tab').forEach(t => t.classList.remove('active'));
  $(`.student-tab[data-tab="${tabId}"]`).classList.add('active');
  
  $$('.student-tab-content').forEach(s => s.classList.remove('active'));
  $(`#student-${tabId}-tab`).classList.add('active');
  appState.activeTab = tabId;
};

const switchAdminTab = (tabId) => {
  $$('.admin-tab-link').forEach(t => t.classList.remove('active'));
  $(`.admin-tab-link[data-tab="${tabId}"]`).classList.add('active');
  
  $$('.admin-section').forEach(s => s.classList.remove('active'));
  $(`#${tabId}`).classList.add('active');
  appState.activeTab = tabId;

  if (tabId === 'tab-revisions') {
    renderRevisionRequests();
  }
};

/********************
 * AUTHENTICATION
 ********************/
const handleStudentLogin = () => {
  const u = ($('#studentUsername').value || '').trim();
  const p = ($('#studentPassword').value || '').trim();
  
  if (!u || !p) {
    showNotification("Veuillez saisir un nom d'utilisateur et un mot de passe.", 'error');
    return;
  }
  
  const st = DB.students.find(s => s.username === u && decryptPassword(s.password) === p);
  if (!st) {
    showNotification("Nom d'utilisateur ou mot de passe incorrect.", 'error');
    return;
  }
  
  $('#studentLoginModal').style.display = 'none';
  currentStudent = st;
  showNotification(`Bienvenue, ${st.fullname}`, 'success');
  updateUI();
  showSection('student-dashboard');
};

const handleAdminLogin = () => {
  const u = $('#username').value.trim();
  const p = $('#password').value.trim();
  
  if (u === ADMIN.user && p === ADMIN.pass) {
    $('#loginModal').style.display = 'none';
    appState.isAdmin = true;
    showNotification('Connexion administrateur réussie', 'success');
    updateUI();
    showSection('admin-panel');
  } else {
    showNotification("Nom d'utilisateur ou mot de passe incorrect.", 'error');
  }
};

const handleAdminLogout = () => {
  appState.isAdmin = false;
  showNotification('Déconnexion réussie', 'info');
  updateUI();
  showSection('home');
};

const handleStudentLogout = () => {
  currentStudent = null;
  showNotification('Déconnexion réussie', 'info');
  updateUI();
  showSection('home');
};

/********************
 * NOTIFICATION SYSTEM
 ********************/
const showNotification = (message, type = 'info') => {
  // Remove any existing notification
  const existingNotification = $('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    hideNotification(notification);
  }, 5000);
  
  // Close button event
  $('.notification-close', notification).addEventListener('click', () => {
    hideNotification(notification);
  });
};

const hideNotification = (notification) => {
  notification.classList.remove('show');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
};

/********************
 * STUDENT MANAGEMENT
 ********************/
const renderStudentsTable = () => {
  const tbody = $('#studentsTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  DB.students.forEach(st => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(st.fullname)}</td>
      <td>${escapeHTML(st.username)}</td>
      <td>${escapeHTML(st.code)}</td>
      <td>${escapeHTML(st.classroom || '')}</td>
      <td>
        <button class="btn btn-ghost btn-sm edit-student" data-id="${st.id}">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="btn btn-accent btn-sm delete-student" data-id="${st.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Add event listeners
  $$('.edit-student').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const st = DB.students.find(s => s.id === id);
      if (st) {
        $('#stId').value = st.id;
        $('#stFullname').value = st.fullname;
        $('#stUsername').value = st.username;
        $('#stPassword').value = decryptPassword(st.password);
        $('#stCode').value = st.code;
        $('#stClassroom').value = st.classroom || '';
      }
    });
  });
  
  $$('.delete-student').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
        DB.students = DB.students.filter(s => s.id !== id);
        delete DB.grades[id];
        setData(DB);
        renderStudentsTable();
        populateStudentSelects();
        showNotification('Étudiant supprimé avec succès', 'success');
      }
    });
  });
};

const filterStudents = function() {
  const filter = this.value.toLowerCase();
  $$('#studentsTable tbody tr').forEach(tr => {
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(filter) ? '' : 'none';
  });
};

const populateStudentSelects = () => {
  const studentSelects = ['#grStudent', '#grFilterStudent'];
  studentSelects.forEach(sel => {
    const select = $(sel);
    if (select) {
      select.innerHTML = '';
      DB.students.forEach(st => {
        const option = document.createElement('option');
        option.value = st.id;
        option.textContent = `${st.fullname} (${st.code})`;
        select.appendChild(option);
      });
    }
  });
};

const saveStudent = () => {
  const id = $('#stId').value;
  const fullname = $('#stFullname').value.trim();
  const username = $('#stUsername').value.trim();
  const password = $('#stPassword').value.trim();
  const code = $('#stCode').value.trim();
  const classroom = $('#stClassroom').value.trim();
  
  if (!fullname || !username || !password || !code) {
    showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
    return;
  }
  
  // Check if username already exists (for new students)
  if (!id && DB.students.some(s => s.username === username)) {
    showNotification("Ce nom d'utilisateur est déjà utilisé.", 'error');
    return;
  }
  
  if (id) {
    // Update existing student
    const index = DB.students.findIndex(s => s.id === id);
    if (index !== -1) {
      DB.students[index] = { 
        ...DB.students[index], 
        fullname, 
        username, 
        password: encryptPassword(password), 
        code, 
        classroom 
      };
      showNotification('Étudiant mis à jour avec succès', 'success');
    }
  } else {
    // Add new student
    const newStudent = { 
      id: uid(), 
      fullname, 
      username, 
      password: encryptPassword(password), 
      code, 
      classroom 
    };
    DB.students.push(newStudent);
    showNotification('Étudiant ajouté avec succès', 'success');
  }
  
  setData(DB);
  renderStudentsTable();
  populateStudentSelects();
  resetStudentForm();
};

const resetStudentForm = () => {
  $('#stId').value = '';
  $('#stFullname').value = '';
  $('#stUsername').value = '';
  $('#stPassword').value = '';
  $('#stCode').value = '';
  $('#stClassroom').value = '';
};

/********************
 * GRADE MANAGEMENT
 ********************/
const fillGradesFor = (student) => {
  const tbody = $('#gradesTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const list = (DB.grades[student.id] || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date));
  
  if (!list.length) { 
    $('#noGradesMsg').style.display = 'block'; 
  } else { 
    $('#noGradesMsg').style.display = 'none'; 
  }
  
  list.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(g.date || '')}</td>
      <td>${escapeHTML(g.subject || '')}</td>
      <td>${escapeHTML(g.title || '')}</td>
      <td><strong>${Number(g.score).toFixed(2)}</strong></td>
      <td>${escapeHTML(g.note || '')}</td>
    `;
    tbody.appendChild(tr);
  });
  
  $('#studentInfo').innerHTML = `
    <div class="inline">
      <span class="chip"><i class="fa-solid fa-user"></i> ${escapeHTML(student.fullname)}</span>
      <span class="chip"><i class="fa-solid fa-id-card"></i> ${escapeHTML(student.code)}</span>
      <span class="chip"><i class="fa-solid fa-school"></i> ${escapeHTML(student.classroom || '')}</span>
    </div>
  `;
  
  $('#gradesResults').style.display = 'block';
  showSection('grades');
};

const handleSearchByCode = () => {
  const code = ($('#searchCode').value || '').trim();
  const st = DB.students.find(s => s.code.toLowerCase() === code.toLowerCase());
  if (!st) {
    showNotification('Code parcours introuvable.', 'error');
    return;
  }
  fillGradesFor(st);
};

const renderAdminGradesTable = () => {
  const tbody = $('#gradesAdminTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const studentId = $('#grFilterStudent').value;
  let grades = [];
  
  if (studentId) {
    grades = DB.grades[studentId] || [];
  } else {
    // Show all grades
    for (const id in DB.grades) {
      grades = grades.concat(DB.grades[id]);
    }
  }
  
  grades.forEach(grade => {
    const student = DB.students.find(s => {
      const studentGrades = DB.grades[s.id] || [];
      return studentGrades.some(g => g.id === grade.id);
    });
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(student ? student.fullname : 'Inconnu')}</td>
      <td>${escapeHTML(grade.date || '')}</td>
      <td>${escapeHTML(grade.subject || '')}</td>
      <td>${escapeHTML(grade.title || '')}</td>
      <td><strong>${Number(grade.score).toFixed(2)}</strong></td>
      <td>${escapeHTML(grade.note || '')}</td>
      <td>
        <button class="btn btn-ghost btn-sm edit-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="btn btn-accent btn-sm delete-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Add event listeners
  $$('.edit-grade').forEach(btn => {
    btn.addEventListener('click', function() {
      const gradeId = this.getAttribute('data-id');
      const studentId = this.getAttribute('data-student');
      const grades = DB.grades[studentId] || [];
      const grade = grades.find(g => g.id === gradeId);
      
      if (grade) {
        $('#grId').value = grade.id;
        $('#grStudent').value = studentId;
        $('#grSubject').value = grade.subject || '';
        $('#grTitle').value = grade.title || '';
        $('#grDate').value = grade.date || '';
        $('#grScore').value = grade.score || '';
        $('#grNote').value = grade.note || '';
      }
    });
  });
  
  $$('.delete-grade').forEach(btn => {
    btn.addEventListener('click', function() {
      const gradeId = this.getAttribute('data-id');
      const studentId = this.getAttribute('data-student');
      
      if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
        if (DB.grades[studentId]) {
          DB.grades[studentId] = DB.grades[studentId].filter(g => g.id !== gradeId);
          setData(DB);
          renderAdminGradesTable();
          showNotification('Note supprimée avec succès', 'success');
        }
      }
    });
  });
};

const saveGrade = () => {
  const id = $('#grId').value;
  const studentId = $('#grStudent').value;
  const subject = $('#grSubject').value.trim();
  const title = $('#grTitle').value.trim();
  const date = $('#grDate').value;
  const score = parseFloat($('#grScore').value);
  const note = $('#grNote').value.trim();
  
  if (!studentId || !subject || !title || !date || isNaN(score)) {
    showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
    return;
  }
  
  if (score < 0 || score > 20) {
    showNotification('La note doit être comprise entre 0 et 20.', 'error');
    return;
  }
  
  if (!DB.grades[studentId]) {
    DB.grades[studentId] = [];
  }
  
  if (id) {
    // Update existing grade
    const index = DB.grades[studentId].findIndex(g => g.id === id);
    if (index !== -1) {
      DB.grades[studentId][index] = { ...DB.grades[studentId][index], subject, title, date, score, note };
      showNotification('Note mise à jour avec succès', 'success');
    }
  } else {
    // Add new grade
    const newGrade = { id: uid(), subject, title, date, score, note };
    DB.grades[studentId].push(newGrade);
    showNotification('Note ajoutée avec succès', 'success');
  }
  
  setData(DB);
  renderAdminGradesTable();
  resetGradeForm();
};

const resetGradeForm = () => {
  $('#grId').value = '';
  $('#grStudent').value = '';
  $('#grSubject').value = '';
  $('#grTitle').value = '';
  $('#grDate').value = '';
  $('#grScore').value = '';
  $('#grNote').value = '';
};

/********************
 * DICTIONARY MANAGEMENT
 ********************/
const renderAdminDictionaryList = () => {
  const container = $('#dictionaryTermsList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (DB.dictionary.length === 0) {
    container.innerHTML = '<p class="muted">Aucun terme pour le moment.</p>';
    return;
  }
  
  DB.dictionary.forEach(term => {
    const termEl = document.createElement('div');
    termEl.className = 'dictionary-term';
    termEl.innerHTML = `
      <div><strong>${escapeHTML(term.ar)}</strong> → ${escapeHTML(term.fr)}</div>
      <div class="muted">${escapeHTML(term.def)}</div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-dict" data-id="${term.id}">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="btn btn-accent btn-sm delete-dict" data-id="${term.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(termEl);
  });
  
  // Add event listeners
  $$('.edit-dict').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const term = DB.dictionary.find(t => t.id === id);
      if (term) {
        $('#adminDictAr').value = term.ar;
        $('#adminDictFr').value = term.fr;
        $('#adminDictDef').value = term.def;
        $('#adminDictAr').setAttribute('data-id', id);
      }
    });
  });
  
  $$('.delete-dict').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer ce terme ?')) {
        DB.dictionary = DB.dictionary.filter(t => t.id !== id);
        setData(DB);
        renderAdminDictionaryList();
        showNotification('Terme supprimé avec succès', 'success');
      }
    });
  });
};

const saveDictionaryTerm = () => {
  const id = $('#adminDictAr').getAttribute('data-id');
  const ar = $('#adminDictAr').value.trim();
  const fr = $('#adminDictFr').value.trim();
  const def = $('#adminDictDef').value.trim();
  
  if (!ar || !fr) {
    showNotification('Veuillez remplir les termes arabe et français.', 'error');
    return;
  }
  
  if (id) {
    // Update existing term
    const index = DB.dictionary.findIndex(t => t.id === id);
    if (index !== -1) {
      DB.dictionary[index] = { ...DB.dictionary[index], ar, fr, def };
      showNotification('Terme mis à jour avec succès', 'success');
    }
  } else {
    // Add new term
    const newTerm = { id: uid(), ar, fr, def };
    DB.dictionary.push(newTerm);
    showNotification('Terme ajouté avec succès', 'success');
  }
  
  setData(DB);
  renderAdminDictionaryList();
  resetDictionaryForm();
};

const resetDictionaryForm = () => {
  $('#adminDictAr').value = '';
  $('#adminDictFr').value = '';
  $('#adminDictDef').value = '';
  $('#adminDictAr').removeAttribute('data-id');
};

/********************
 * QUIZ MANAGEMENT
 ********************/
const renderAdminQuizList = () => {
  const container = $('#quizQuestionsList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (DB.quiz.length === 0) {
    container.innerHTML = '<p class="muted">Aucune question pour le moment.</p>';
    return;
  }
  
  DB.quiz.forEach((question, index) => {
    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';
    questionEl.innerHTML = `
      <div><strong>Question ${index + 1}:</strong> ${escapeHTML(question.question)}</div>
      ${question.image ? `<div><img src="${question.image}" alt="Question image" style="max-width: 200px;"></div>` : ''}
      <div class="muted">
        Options: 
        ${question.options.map((option, i) => `
          ${i + 1}. ${escapeHTML(option)} ${i + 1 == question.correct ? '✓' : ''}
        `).join(' | ')}
      </div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-quiz" data-id="${question.id}">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="btn btn-accent btn-sm delete-quiz" data-id="${question.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(questionEl);
  });
  
  // Add event listeners
  $$('.edit-quiz').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const question = DB.quiz.find(q => q.id === id);
      if (question) {
        $('#adminQuizQuestion').value = question.question;
        $('#adminOption1').value = question.options[0] || '';
        $('#adminOption2').value = question.options[1] || '';
        $('#adminOption3').value = question.options[2] || '';
        $('#adminOption4').value = question.options[3] || '';
        $('#adminQuizCorrect').value = question.correct;
        $('#adminQuizQuestion').setAttribute('data-id', id);
      }
    });
  });
  
  $$('.delete-quiz').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
        DB.quiz = DB.quiz.filter(q => q.id !== id);
        setData(DB);
        renderAdminQuizList();
        showNotification('Question supprimée avec succès', 'success');
      }
    });
  });
};

const saveQuizQuestion = () => {
  const id = $('#adminQuizQuestion').getAttribute('data-id');
  const question = $('#adminQuizQuestion').value.trim();
  const options = [
    $('#adminOption1').value.trim(),
    $('#adminOption2').value.trim(),
    $('#adminOption3').value.trim(),
    $('#adminOption4').value.trim()
  ];
  const correct = parseInt($('#adminQuizCorrect').value);
  
  if (!question || options.some(opt => !opt)) {
    showNotification('Veuillez remplir la question et toutes les options.', 'error');
    return;
  }
  
  if (correct < 1 || correct > 4) {
    showNotification('La réponse correcte doit être entre 1 et 4.', 'error');
    return;
  }
  
  if (id) {
    // Update existing question
    const index = DB.quiz.findIndex(q => q.id === id);
    if (index !== -1) {
      DB.quiz[index] = { ...DB.quiz[index], question, options, correct };
      showNotification('Question mise à jour avec succès', 'success');
    }
  } else {
    // Add new question
    const newQuestion = { id: uid(), question, options, correct };
    DB.quiz.push(newQuestion);
    showNotification('Question ajoutée avec succès', 'success');
  }
  
  setData(DB);
  renderAdminQuizList();
  resetQuizForm();
};

const resetQuizForm = () => {
  $('#adminQuizQuestion').value = '';
  $('#adminOption1').value = '';
  $('#adminOption2').value = '';
  $('#adminOption3').value = '';
  $('#adminOption4').value = '';
  $('#adminQuizCorrect').value = '1';
  $('#adminQuizQuestion').removeAttribute('data-id');
};

/********************
 * ANNOUNCEMENT MANAGEMENT
 ********************/
const saveAnnouncement = () => {
  const announcement = $('#announcementInput').value.trim();
  DB.announcement = announcement;
  
  // Handle image upload
  const imageInput = $('#announcementImageInput');
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      DB.announcementImage = e.target.result;
      setData(DB);
      updateAnnouncementDisplay();
      showNotification('Annonce enregistrée avec image!', 'success');
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    setData(DB);
    updateAnnouncementDisplay();
    showNotification('Annonce enregistrée!', 'success');
  }
};

const updateAnnouncementDisplay = () => {
  $('#announcementText').textContent = DB.announcement;
  if (DB.announcementImage) {
    $('#announcementImage').src = DB.announcementImage;
    $('#announcementImage').style.display = 'block';
  } else {
    $('#announcementImage').style.display = 'none';
  }
};

const handleAnnouncementImagePreview = function() {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      $('#announcementImagePreview').src = e.target.result;
      $('#announcementImagePreview').style.display = 'block';
    };
    reader.readAsDataURL(this.files[0]);
  }
};

/********************
 * REVISION REQUESTS
 ********************/
const populateRevisionForm = () => {
  if (!currentStudent) return;
  const grades = DB.grades[currentStudent.id] || [];
  const select = $('#revisionExam');
  select.innerHTML = '<option value="">Sélectionnez une évaluation</option>';
  grades.forEach(grade => {
    const option = document.createElement('option');
    option.value = grade.id;
    option.textContent = `${grade.title} - ${grade.subject} (${grade.score}/20)`;
    select.appendChild(option);
  });
};

const handleRevisionRequest = function(e) {
  e.preventDefault();
  if (!currentStudent) return;

  const gradeId = $('#revisionExam').value;
  const message = $('#revisionMessage').value;

  if (!gradeId || !message) {
    showNotification('Veuillez sélectionner un examen et écrire un message.', 'error');
    return;
  }

  DB.revisionRequests = DB.revisionRequests || [];
  DB.revisionRequests.push({
    id: uid(),
    studentId: currentStudent.id,
    gradeId,
    message,
    date: new Date().toISOString().slice(0, 10),
    status: 'pending'
  });

  setData(DB);
  showNotification('Votre demande a été envoyée.', 'success');
  this.reset();
  loadStudentRevisionRequests();
};

const loadStudentRevisionRequests = () => {
  if (!currentStudent) return;
  const container = $('#studentRevisionRequests');
  if (!container) return;
  
  container.innerHTML = '';
  const requests = (DB.revisionRequests || []).filter(req => req.studentId === currentStudent.id);
  
  if (requests.length === 0) {
    container.innerHTML = '<p class="muted">Vous n\'avez pas encore soumis de demandes de récorrection.</p>';
    return;
  }
  
  requests.forEach(req => {
    const grade = (DB.grades[currentStudent.id] || []).find(g => g.id === req.gradeId);
    if (!grade) return;
    
    const statusColors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'accent'
    };
    
    const statusTexts = {
      'pending': 'En attente',
      'approved': 'Approuvée',
      'rejected': 'Rejetée'
    };
    
    const item = document.createElement('div');
    item.className = 'revision-request-item';
    item.innerHTML = `
      <strong>${escapeHTML(grade.title)} - ${escapeHTML(grade.subject)}</strong>
      <p>${escapeHTML(req.message)}</p>
      <div class="inline">
        <span class="chip">Date: ${req.date}</span>
        <span class="btn btn-${statusColors[req.status]}">Statut: ${statusTexts[req.status]}</span>
      </div>
    `;
    container.appendChild(item);
  });
};

const renderRevisionRequests = () => {
  const container = $('#revisionRequestsList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!DB.revisionRequests || DB.revisionRequests.length === 0) {
    container.innerHTML = '<p class="muted">Aucune demande de récorrection pour le moment.</p>';
    return;
  }
  
  DB.revisionRequests.forEach(request => {
    const student = DB.students.find(s => s.id === request.studentId);
    const grade = student && DB.grades[student.id] ? 
      DB.grades[student.id].find(g => g.id === request.gradeId) : null;
    
    if (!student || !grade) return;
    
    const statusColors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'accent'
    };
    
    const statusTexts = {
      'pending': 'En attente',
      'approved': 'Approuvée',
      'rejected': 'Rejetée'
    };
    
    const requestEl = document.createElement('div');
    requestEl.className = 'revision-request';
    requestEl.innerHTML = `
      <div><strong>${escapeHTML(student.fullname)}</strong> - ${escapeHTML(grade.title)} (${escapeHTML(grade.subject)}) - Note: ${grade.score}/20</div>
      <div class="muted">${request.date}</div>
      <div>${escapeHTML(request.message)}</div>
      <div class="mt-2">
        <span class="btn btn-${statusColors[request.status]}">Statut: ${statusTexts[request.status]}</span>
        ${request.status === 'pending' ? `
          <button class="btn btn-success btn-sm approve-revision" data-id="${request.id}">Approuver</button>
          <button class="btn btn-accent btn-sm reject-revision" data-id="${request.id}">Rejeter</button>
        ` : ''}
      </div>
    `;
    container.appendChild(requestEl);
  });
  
  // Add event listeners
  $$('.approve-revision').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const request = DB.revisionRequests.find(r => r.id === id);
      if (request) {
        request.status = 'approved';
        setData(DB);
        renderRevisionRequests();
        showNotification('Demande approuvée avec succès', 'success');
      }
    });
  });
  
  $$('.reject-revision').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const request = DB.revisionRequests.find(r => r.id === id);
      if (request) {
        request.status = 'rejected';
        setData(DB);
        renderRevisionRequests();
        showNotification('Demande rejetée', 'info');
      }
    });
  });
};

/********************
 * QUIZ FUNCTIONALITY
 ********************/
const loadStudentQuizzes = () => {
  if (!currentStudent) return;
  const container = $('#studentQuizList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (DB.quiz.length === 0) {
    container.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>';
    return;
  }
  
  const quizCard = document.createElement('div');
  quizCard.className = 'content-card';
  quizCard.innerHTML = `
    <div class="card-content">
      <h3>Quiz de Physique</h3>
      <p>Ce quiz contient ${DB.quiz.length} questions. Durée: 30 minutes.</p>
      <button class="btn btn-primary start-quiz" data-quiz-id="general">Commencer le quiz</button>
    </div>
  `;
  container.appendChild(quizCard);
  
  // Add event listeners to start quiz button
  $('.start-quiz').addEventListener('click', startQuiz);
  
  // Load quiz results
  loadQuizResults();
};

const loadQuizResults = () => {
  if (!currentStudent) return;
  const container = $('#studentQuizResults');
  if (!container) return;
  
  container.innerHTML = '';
  const results = DB.quizResults && DB.quizResults[currentStudent.id] ? DB.quizResults[currentStudent.id] : [];
  
  if (results.length === 0) {
    container.innerHTML = '<p class="muted">Aucun résultat de quiz pour le moment.</p>';
    return;
  }
  
  results.forEach(result => {
    const resultCard = document.createElement('div');
    resultCard.className = 'content-card';
    resultCard.innerHTML = `
      <div class="card-content">
        <h3>Quiz du ${result.date}</h3>
        <p>Score: ${result.score}/${result.total} (${Math.round((result.score/result.total)*100)}%)</p>
        <p>Temps utilisé: ${result.timeUsed}</p>
      </div>
    `;
    container.appendChild(resultCard);
  });
};

const startQuiz = () => {
  if (!currentStudent) return;
  
  // Hide quiz list and show quiz container
  $('#studentQuizList').style.display = 'none';
  $('#quizContainer').style.display = 'block';
  
  currentQuiz = DB.quiz;
  currentQuestionIndex = 0;
  studentAnswers = {};
  
  // Start timer (30 minutes)
  startTimer(30 * 60);
  
  // Load first question
  loadQuestion(0);
};

const startTimer = (duration) => {
  let timer = duration;
  clearInterval(quizTimer);
  
  quizTimer = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    
    $('#quizTimer').textContent = `Temps restant: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (--timer < 0) {
      clearInterval(quizTimer);
      submitQuiz();
    }
  }, 1000);
};

const loadQuestion = (index) => {
  if (index < 0 || index >= currentQuiz.length) return;
  
  currentQuestionIndex = index;
  const question = currentQuiz[index];
  
  const container = $('#quizQuestionsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  const questionEl = document.createElement('div');
  questionEl.className = 'quiz-question-slider active';
  questionEl.innerHTML = `
    <div class="quiz-question-number">Question ${index + 1} sur ${currentQuiz.length}</div>
    <h3>${escapeHTML(question.question)}</h3>
    ${question.image ? `<img src="${question.image}" alt="Question image">` : ''}
    <div class="quiz-options">
      ${question.options.map((option, i) => `
        <div class="quiz-option" data-option="${i + 1}">
          ${escapeHTML(option)}
        </div>
      `).join('')}
    </div>
  `;
  
  container.appendChild(questionEl);
  
  // Update question counter
  $('#questionCounter').textContent = `Question ${index + 1} sur ${currentQuiz.length}`;
  
  // Set up option selection
  $$('.quiz-option').forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      $$('.quiz-option').forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      this.classList.add('selected');
      
      // Store answer
      studentAnswers[index] = this.getAttribute('data-option');
    });
  });
  
  // Restore previous answer if exists
  if (studentAnswers[index]) {
    $(`.quiz-option[data-option="${studentAnswers[index]}"]`).classList.add('selected');
  }
  
  // Set up navigation buttons
  $('#prevQuestion').style.display = index === 0 ? 'none' : 'block';
  $('#nextQuestion').style.display = index === currentQuiz.length - 1 ? 'none' : 'block';
  $('#submitQuiz').style.display = index === currentQuiz.length - 1 ? 'block' : 'none';
};

const handlePrevQuestion = () => {
  if (currentQuestionIndex > 0) {
    loadQuestion(currentQuestionIndex - 1);
  }
};

const handleNextQuestion = () => {
  if (currentQuestionIndex < currentQuiz.length - 1) {
    loadQuestion(currentQuestionIndex + 1);
  }
};

const submitQuiz = () => {
  clearInterval(quizTimer);
  
  // Calculate score
  let score = 0;
  for (let i = 0; i < currentQuiz.length; i++) {
    if (studentAnswers[i] == currentQuiz[i].correct) {
      score++;
    }
  }
  
  // Save results
  DB.quizResults = DB.quizResults || {};
  DB.quizResults[currentStudent.id] = DB.quizResults[currentStudent.id] || [];
  
  const timeUsed = calculateTimeUsed();
  
  DB.quizResults[currentStudent.id].push({
    date: new Date().toLocaleDateString(),
    score: score,
    total: currentQuiz.length,
    timeUsed: timeUsed
  });
  
  setData(DB);
  
  // Show results
  $('#quizContainer').style.display = 'none';
  $('#quizResultsContainer').style.display = 'block';
  
  $('#quizResultsContent').innerHTML = `
    <h4>Résultats du Quiz</h4>
    <p>Vous avez obtenu ${score} sur ${currentQuiz.length} (${Math.round((score/currentQuiz.length)*100)}%)</p>
    <p>Temps utilisé: ${timeUsed}</p>
    <button class="btn btn-primary" id="backToQuizzes">Retour aux quiz</button>
  `;
  
  $('#backToQuizzes').addEventListener('click', () => {
    $('#quizResultsContainer').style.display = 'none';
    $('#studentQuizList').style.display = 'block';
    loadQuizResults();
  });
};

const calculateTimeUsed = () => {
  // This would normally be calculated based on the actual time taken
  // For simplicity, we'll just return a placeholder
  return "25:30";
};

/********************
 * DASHBOARD & STATS
 ********************/
const updateDashboardStats = () => {
  $('#stats-students').textContent = DB.students.length;
  $('#stats-quiz').textContent = DB.quiz.length;
  $('#stats-dictionary').textContent = DB.dictionary.length;
  
  // Calculate total grades
  let totalGrades = 0;
  for (const studentId in DB.grades) {
    totalGrades += DB.grades[studentId].length;
  }
  $('#stats-grades').textContent = totalGrades;
  
  // Load recent activity
  const activityContainer = $('#recent-activity');
  if (!activityContainer) return;
  
  activityContainer.innerHTML = '';
  
  // Add some sample activity (in a real app, this would come from a log)
  const activities = [
    { action: 'Nouvel étudiant inscrit', details: 'Ahmed Amine', time: 'Il y a 2 heures' },
    { action: 'Note ajoutée', details: 'Contrôle 1 - Mécanique', time: 'Il y a 5 heures' },
    { action: 'Question de quiz ajoutée', details: 'Nouvelle question sur l\'électricité', time: 'Hier' }
  ];
  
  if (activities.length === 0) {
    activityContainer.innerHTML = '<p class="muted">Aucune activité récente.</p>';
    return;
  }
  
  activities.forEach(activity => {
    const activityEl = document.createElement('div');
    activityEl.className = 'activity-item';
    activityEl.innerHTML = `
      <div><strong>${activity.action}</strong>: ${activity.details}</div>
      <div class="muted">${activity.time}</div>
    `;
    activityContainer.appendChild(activityEl);
  });
};

/********************
 * DATA IMPORT/EXPORT
 ********************/
const exportData = () => {
  const dataStr = JSON.stringify(DB, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'lycee-excellence-data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showNotification('Données exportées avec succès', 'success');
};

const importData = function() {
  const file = this.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (confirm('Êtes-vous sûr de vouloir importer ces données ? Toutes les données actuelles seront remplacées.')) {
        localStorage.setItem(LS_KEY, JSON.stringify(importedData));
        DB = getData();
        showNotification('Données importées avec succès !', 'success');
        location.reload();
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Erreur lors de l\'importation du fichier. Le format est invalide.', 'error');
    }
  };
  reader.readAsText(file);
};

/********************
 * STUDENT RESOURCES
 ********************/
const loadStudentResources = () => {
  if (!currentStudent) return;
  
  // Load recent grades
  const gradesContainer = $('#studentRecentGrades');
  if (gradesContainer) {
    gradesContainer.innerHTML = '';
    const grades = (DB.grades[currentStudent.id] || []).slice(-5).reverse();
    
    if (grades.length === 0) {
      gradesContainer.innerHTML = '<p class="muted">Aucune note disponible pour le moment.</p>';
    } else {
      grades.forEach(grade => {
        const gradeEl = document.createElement('div');
        gradeEl.className = 'grade-item';
        gradeEl.innerHTML = `
          <div><strong>${escapeHTML(grade.title)}</strong> - ${escapeHTML(grade.subject)}</div>
          <div>Note: ${grade.score}/20 - ${escapeHTML(grade.note)}</div>
          <div class="muted">${grade.date}</div>
        `;
        gradesContainer.appendChild(gradeEl);
      });
    }
  }
  
  // Load resources
  const resourcesContainer = $('#studentResources');
  if (resourcesContainer) {
    resourcesContainer.innerHTML = '';
    
    // Add some sample resources
    const resources = [
      { type: 'lesson', title: 'Introduction à la mécanique', chapter: 'Mécanique' },
      { type: 'exercise', title: 'Exercices sur l\'électricité', chapter: 'Électricité' },
      { type: 'exam', title: 'Examen Blanc 2023', chapter: 'Général' }
    ];
    
    resources.forEach(resource => {
      const resourceEl = document.createElement('div');
      resourceEl.className = 'content-card';
      resourceEl.innerHTML = `
        <div class="card-content">
          <h3>${escapeHTML(resource.title)}</h3>
          <p>Chapitre: ${escapeHTML(resource.chapter)}</p>
          <button class="btn btn-outline">Consulter</button>
        </div>
      `;
      resourcesContainer.appendChild(resourceEl);
    });
  }
  
  // Load dictionary terms
  const dictionaryContainer = $('#studentDictionaryContent');
  if (dictionaryContainer) {
    dictionaryContainer.innerHTML = '';
    
    DB.dictionary.forEach(term => {
      const termEl = document.createElement('div');
      termEl.className = 'content-card';
      termEl.innerHTML = `
        <div class="card-content">
          <h3>${escapeHTML(term.ar)} → ${escapeHTML(term.fr)}</h3>
          <p>${escapeHTML(term.def)}</p>
        </div>
      `;
      dictionaryContainer.appendChild(termEl);
    });
  }
  
  // Load exercises
  const exercisesContainer = $('#studentExercisesList');
  if (exercisesContainer) {
    exercisesContainer.innerHTML = '';
    
    // Add some sample exercises
    const exercises = [
      { title: 'Exercices sur les forces', chapter: 'Mécanique' },
      { title: 'Problèmes d\'électricité', chapter: 'Électricité' },
      { title: 'Devoir maison', chapter: 'Général' }
    ];
    
    exercises.forEach(exercise => {
      const exerciseEl = document.createElement('div');
      exerciseEl.className = 'content-card';
      exerciseEl.innerHTML = `
        <div class="card-content">
          <h3>${escapeHTML(exercise.title)}</h3>
          <p>Chapitre: ${escapeHTML(exercise.chapter)}</p>
          <button class="btn btn-outline">Télécharger</button>
        </div>
      `;
      exercisesContainer.appendChild(exerciseEl);
    });
  }
};

/********************
 * SECURITY UTILITIES
 ********************/
const escapeHTML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/********************
 * INITIALIZATION
 ********************/
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});
