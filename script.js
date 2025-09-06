 /********************
 * UTIL & STORAGE
 ********************/
const LS_KEY = 'lx-data-v12';
const ADMIN = { user: 'admin7', pass: 'ali7800' };

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

// البيانات المضمنة من الملف المقدم
const initialData = {
  "students": [
    {
      "id": "id-qtu7fy39",
      "fullname": "Ahmed Amine",
      "username": "ahmed.amine",
      "password": "1234",
      "code": "P-2024-001",
      "classroom": "2ème Bac SP"
    },
    {
      "id": "id-nzftxsgm",
      "fullname": "Sara El",
      "username": "sara.el",
      "password": "abcd",
      "code": "P-2024-002",
      "classroom": "2ème Bac SP"
    },
    {
      "id": "id-sz718lmr",
      "fullname": "ali bairouè",
      "username": "ali.bairouk",
      "password": "abcd1",
      "code": "P-2024-003",
      "classroom": "2ème Bac SP"
    },
    {
      "id": "id-aoj4g2fm",
      "fullname": "Saad lmobi",
      "username": "Saad.lmobi",
      "password": "1234",
      "code": "P-2024-004",
      "classroom": "2ème Bac SP"
    },
    {
      "id": "id-kjsylmlp",
      "fullname": "Achraf amir",
      "username": "Achraf.amir",
      "password": "1234",
      "code": "P-2024-005",
      "classroom": "2ème Bac SP"
    },
    {
      "id": "id-tqbv50to",
      "fullname": "Ahmed omari",
      "username": "Ahmed.omari",
      "password": "1234",
      "code": "P-2024-006",
      "classroom": "2ème Bac SP"
    }
  ],
  "grades": {
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
  "dictionary": [
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
  "quiz": [
    {
      "id": "id-vfe4pnza",
      "question": "ماهي وحدة السرعة ؟",
      "options": [
        "متر",
        "متر على ثانية",
        "ثانية",
        "فولط"
      ],
      "correct": 2
    },
    {
      "id": "id-pccd0yaa",
      "question": "ماهي وحدة زمن؟",
      "options": [
        "ثانية",
        "فولط",
        "تسلا",
        "امبير"
      ],
      "correct": 1
    },
    {
      "id": "id-teh057hr",
      "question": "ماهي وحدة توتر؟",
      "options": [
        "امبير",
        "فولط",
        "كلومب",
        "تسلا"
      ],
      "correct": 2
    },
    {
      "id": "id-9isvpp8s",
      "question": "ماهي وحدة تيار كهربائي",
      "options": [
        "امبير",
        "فولط",
        "تسلا",
        "متر"
      ],
      "correct": 1
    },
    {
      "id": "id-5vnhxb2x",
      "question": "ماهي وحدة المسافة ؟",
      "options": [
        "ثانية",
        "متر",
        "تسla",
        "امبير"
      ],
      "correct": 2
    }
  ],
  "exams": [],
  "exercises": [],
  "lessons": [],
  "announcement": "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة\nفديو شرح الأساسيات لسنة ثانية بكالوريا سيكون جاهزا اليوم السبت 06/09",
  "announcementImage": "",
  "revisionRequests": [],
  "quizResults": {}
};

const getData = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try { 
    return JSON.parse(raw); 
  } catch { 
    localStorage.removeItem(LS_KEY); 
    return getData(); 
  }
};

const setData = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));
let DB = getData();
let currentStudent = null;
let currentQuiz = null;
let quizTimer = null;
let currentQuestionIndex = 0;
let studentAnswers = {};

/********************
 * NAVIGATION
 ********************/
function showSection(id){
  $$('.page-section').forEach(s => s.classList.remove('active'));
  if(id === 'home'){ 
    window.scrollTo({top:0,behavior:'smooth'}); 
    return; 
  }
  const el = document.getElementById(id);
  if(el){ 
    el.classList.add('active'); 
    window.scrollTo({top:el.offsetTop-90,behavior:'smooth'}); 
  }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
  // Update announcement text and image on page load
  if ($('#announcementText')) {
    $('#announcementText').textContent = DB.announcement;
  }
  if ($('#announcementInput')) {
    $('#announcementInput').value = DB.announcement;
  }
  if (DB.announcementImage && $('#announcementImage')) {
    $('#announcementImage').src = DB.announcementImage;
    $('#announcementImage').style.display = 'block';
  }

  // Set up navigation event listeners
  $$('.nav-link, .feature-card').forEach(item => {
    item.addEventListener('click', function(){
      const id = this.getAttribute('data-section');
      if(id) showSection(id);
    });
  });

  // Student tabs navigation
  $$('.student-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab
      $$('.student-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding section
      $$('.student-tab-content').forEach(s => s.classList.remove('active'));
      $(`#student-${tabId}-tab`).classList.add('active');
    });
  });

  // Admin tabs navigation
  $$('.admin-tab-link').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab
      $$('.admin-tab-link').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding section
      $$('.admin-section').forEach(s => s.classList.remove('active'));
      $(`#${tabId}`).classList.add('active');

      // Load specific content if needed
      if (tabId === 'tab-revisions') {
        renderRevisionRequests();
      } else if (tabId === 'tab-lessons') {
        renderAdminLessonsList();
      } else if (tabId === 'tab-exercises') {
        renderAdminExercisesList();
      } else if (tabId === 'tab-exams') {
        renderAdminExamsList();
      }
    });
  });

  // Student login modal open/close
  if ($('#studentLoginBtn')) {
    $('#studentLoginBtn').addEventListener('click', () => $('#studentLoginModal').style.display = 'flex');
  }
  if ($('#cancelStudentLogin')) {
    $('#cancelStudentLogin').addEventListener('click', () => $('#studentLoginModal').style.display = 'none');
  }
  
  // Admin login modal open/close
  if ($('#loginBtn')) {
    $('#loginBtn').addEventListener('click', () => $('#loginModal').style.display = 'flex');
  }
  if ($('#cancelLogin')) {
    $('#cancelLogin').addEventListener('click', () => $('#loginModal').style.display = 'none');
  }
  
  window.addEventListener('click', (e) => {
    if(e.target === $('#studentLoginModal')) $('#studentLoginModal').style.display = 'none';
    if(e.target === $('#loginModal')) $('#loginModal').style.display = 'none';
  });

  // Student login submit
  if ($('#submitStudentLogin')) {
    $('#submitStudentLogin').addEventListener('click', () => {
      const u = ($('#studentUsername').value || '').trim();
      const p = ($('#studentPassword').value || '').trim();
      
      // إصلاح المشكلة: البحث عن الطالب باستخدام username فقط
      const st = DB.students.find(s => s.username === u);
      
      if(!st){ 
        alert("Nom d'utilisateur ou mot de passe incorrect."); 
        return; 
      }
      
      // التحقق من كلمة المرور
      if (st.password !== p) {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
        return;
      }
      
      $('#studentLoginModal').style.display = 'none';
      
      // Set current student
      currentStudent = st;
      
      // Show student dashboard
      if ($('#studentWelcome')) {
        $('#studentWelcome').textContent = `Bienvenue, ${st.fullname}`;
      }
      if ($('#student-dashboard')) {
        $('#student-dashboard').style.display = 'block';
      }
      showSection('student-dashboard');
      
      // Load student resources
      loadStudentResources();
      populateRevisionForm();
      loadStudentRevisionRequests();
      loadStudentQuizzes();
    });
  }

  // Student logout
  if ($('#studentLogoutBtn')) {
    $('#studentLogoutBtn').addEventListener('click', () => {
      if ($('#student-dashboard')) {
        $('#student-dashboard').style.display = 'none';
      }
      currentStudent = null;
      showSection('home');
    });
  }

  // Admin login submit
  if ($('#submitLogin')) {
    $('#submitLogin').addEventListener('click', () => {
      const u = ($('#username').value || '').trim();
      const p = ($('#password').value || '').trim();
      if(u === ADMIN.user && p === ADMIN.pass){
        $('#loginModal').style.display = 'none';
        document.body.classList.add('admin-mode');
        if ($('#admin-panel')) {
          $('#admin-panel').style.display = 'block';
        }
        showSection('admin-panel');
        renderStudentsTable();
        populateStudentSelects();
        renderAdminGradesTable();
        updateDashboardStats();
        renderAdminDictionaryList();
        renderAdminQuizList();
        renderAdminLessonsList();
        renderAdminExercisesList();
        renderAdminExamsList();
      } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
      }
    });
  }

  // Admin logout
  if ($('#logoutBtn')) {
    $('#logoutBtn').addEventListener('click', () => {
      document.body.classList.remove('admin-mode');
      if ($('#admin-panel')) {
        $('#admin-panel').style.display = 'none';
      }
      showSection('home');
    });
  }

  // Search by Code Parcours
  if ($('#btnSearchByCode')) {
    $('#btnSearchByCode').addEventListener('click', () => {
      const code = ($('#searchCode').value || '').trim();
      const st = DB.students.find(s => s.code.toLowerCase() === code.toLowerCase());
      if(!st){ 
        alert('Code parcours introuvable.'); 
        return; 
      }
      fillGradesFor(st);
    });
  }

  // Revision request form submission
  if ($('#revisionRequestForm')) {
    $('#revisionRequestForm').addEventListener('submit', function(e) {
      e.preventDefault();
      if (!currentStudent) return;

      const gradeId = $('#revisionExam').value;
      const message = $('#revisionMessage').value;

      if (!gradeId || !message) {
        alert('Veuillez sélectionner un examen et écrire un message.');
        return;
      }

      DB.revisionRequests = DB.revisionRequests || [];
      DB.revisionRequests.push({
        id: uid(),
        studentId: currentStudent.id,
        gradeId,
        message,
        date: new Date().toISOString().slice(0,10),
        status: 'pending'
      });

      setData(DB);
      alert('Votre demande a été envoyée.');
      this.reset();
      loadStudentRevisionRequests();
    });
  }

  // Quiz navigation
  if ($('#prevQuestion')) {
    $('#prevQuestion').addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
      }
    });
  }

  if ($('#nextQuestion')) {
    $('#nextQuestion').addEventListener('click', () => {
      if (currentQuestionIndex < currentQuiz.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
      }
    });
  }

  if ($('#submitQuiz')) {
    $('#submitQuiz').addEventListener('click', submitQuiz);
  }

  // Student management
  if ($('#btnSaveStudent')) {
    $('#btnSaveStudent').addEventListener('click', saveStudent);
  }

  if ($('#btnResetStudent')) {
    $('#btnResetStudent').addEventListener('click', resetStudentForm);
  }

  // Grade management
  if ($('#btnSaveGrade')) {
    $('#btnSaveGrade').addEventListener('click', saveGrade);
  }

  if ($('#btnResetGrade')) {
    $('#btnResetGrade').addEventListener('click', resetGradeForm);
  }

  if ($('#grFilterStudent')) {
    $('#grFilterStudent').addEventListener('change', renderAdminGradesTable);
  }

  // Dictionary management
  if ($('#adminBtnSaveDict')) {
    $('#adminBtnSaveDict').addEventListener('click', saveDictionaryTerm);
  }

  if ($('#adminBtnResetDict')) {
    $('#adminBtnResetDict').addEventListener('click', resetDictionaryForm);
  }

  // Quiz management
  if ($('#adminBtnSaveQuiz')) {
    $('#adminBtnSaveQuiz').addEventListener('click', saveQuizQuestion);
  }

  if ($('#adminBtnResetQuiz')) {
    $('#adminBtnResetQuiz').addEventListener('click', resetQuizForm);
  }

  // Announcement management
  if ($('#btnSaveAnnouncement')) {
    $('#btnSaveAnnouncement').addEventListener('click', saveAnnouncement);
  }

  if ($('#announcementImageInput')) {
    $('#announcementImageInput').addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          if ($('#announcementImagePreview')) {
            $('#announcementImagePreview').src = e.target.result;
            $('#announcementImagePreview').style.display = 'block';
          }
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // Data import/export
  if ($('#btnExport')) {
    $('#btnExport').addEventListener('click', exportData);
  }

  if ($('#importFile')) {
    $('#importFile').addEventListener('change', importData);
  }

  // Lessons management
  if ($('#adminBtnSaveLesson')) {
    $('#adminBtnSaveLesson').addEventListener('click', saveLesson);
  }

  if ($('#adminBtnResetLesson')) {
    $('#adminBtnResetLesson').addEventListener('click', resetLessonForm);
  }

  // Exercises management
  if ($('#adminBtnSaveExercise')) {
    $('#adminBtnSaveExercise').addEventListener('click', saveExercise);
  }

  if ($('#adminBtnResetExercise')) {
    $('#adminBtnResetExercise').addEventListener('click', resetExerciseForm);
  }

  // Exams management
  if ($('#adminBtnSaveExam')) {
    $('#adminBtnSaveExam').addEventListener('click', saveExam);
  }

  if ($('#adminBtnResetExam')) {
    $('#adminBtnResetExam').addEventListener('click', resetExamForm);
  }

  // Load initial data
  loadStudentResources();
});

/********************
 * STUDENT AREA
 ********************/
function fillGradesFor(student){
  if (!$('#gradesTable')) return;
  
  const tbody = $('#gradesTable tbody');
  tbody.innerHTML = '';
  const list = (DB.grades[student.id] || []).slice().sort((a,b) => (a.date||'').localeCompare(b.date));
  
  if(!list.length && $('#noGradesMsg')){ 
    $('#noGradesMsg').style.display='block'; 
  } else if ($('#noGradesMsg')) { 
    $('#noGradesMsg').style.display='none'; 
  }
  
  list.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${g.date||''}</td><td>${g.subject||''}</td><td>${g.title||''}</td><td><strong>${Number(g.score).toFixed(2)}</strong></td><td>${g.note||''}</td>`;
    tbody.appendChild(tr);
  });
  
  if ($('#studentInfo')) {
    $('#studentInfo').innerHTML = `<div class="inline"><span class="chip"><i class="fa-solid fa-user"></i> ${student.fullname}</span><span class="chip"><i class="fa-solid fa-id-card"></i> ${student.code}</span><span class="chip"><i class="fa-solid fa-school"></i> ${student.classroom||''}</span></div>`;
  }
  
  if ($('#gradesResults')) {
    $('#gradesResults').style.display='block';
  }
  
  showSection('grades');
}

function populateRevisionForm() {
  if (!currentStudent || !$('#revisionExam')) return;
  
  const grades = DB.grades[currentStudent.id] || [];
  const select = $('#revisionExam');
  select.innerHTML = '<option value="">Sélectionnez une évaluation</option>';
  
  grades.forEach(grade => {
    const option = document.createElement('option');
    option.value = grade.id;
    option.textContent = `${grade.title} - ${grade.subject} (${grade.score}/20)`;
    select.appendChild(option);
  });
}

function loadStudentRevisionRequests() {
  if (!currentStudent || !$('#studentRevisionRequests')) return;
  
  const container = $('#studentRevisionRequests');
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
    
    const item = document.createElement('div');
    item.className = 'revision-request-item';
    item.style.padding = '10px';
    item.style.border = '1px solid #eee';
    item.style.borderRadius = '5px';
    item.style.marginBottom = '10px';
    item.innerHTML = `
      <strong>${grade.title} - ${grade.subject}</strong>
      <p>${req.message}</p>
      <div class="inline">
        <span class="chip">Date: ${req.date}</span>
        <span class="btn btn-${statusColors[req.status]}">Statut: ${req.status}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

/********************
 * QUIZ FUNCTIONALITY
 ********************/
function loadStudentQuizzes() {
  if (!currentStudent || !$('#studentQuizList')) return;
  
  const container = $('#studentQuizList');
  container.innerHTML = '';
  
  if (DB.quiz.length === 0) {
    container.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>';
    return;
  }
  
  DB.quiz.forEach(quiz => {
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
  });
  
  // Add event listeners to start quiz buttons
  $$('.start-quiz').forEach(btn => {
    btn.addEventListener('click', function() {
      startQuiz();
    });
  });
  
  // Load quiz results
  loadQuizResults();
}

function loadQuizResults() {
  if (!currentStudent || !$('#studentQuizResults')) return;
  
  const container = $('#studentQuizResults');
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
}

function startQuiz() {
  if (!currentStudent || !$('#studentQuizList') || !$('#quizContainer')) return;
  
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
}

function startTimer(duration) {
  let timer = duration;
  clearInterval(quizTimer);
  
  quizTimer = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    
    if ($('#quizTimer')) {
      $('#quizTimer').textContent = `Temps restant: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    if (--timer < 0) {
      clearInterval(quizTimer);
      submitQuiz();
    }
  }, 1000);
}

function loadQuestion(index) {
  if (index < 0 || index >= currentQuiz.length || !$('#quizQuestionsContainer')) return;
  
  currentQuestionIndex = index;
  const question = currentQuiz[index];
  
  const container = $('#quizQuestionsContainer');
  container.innerHTML = '';
  
  const questionEl = document.createElement('div');
  questionEl.className = 'quiz-question-slider active';
  questionEl.innerHTML = `
    <div class="quiz-question-number">Question ${index + 1} sur ${currentQuiz.length}</div>
    <h3>${question.question}</h3>
    ${question.image ? `<img src="${question.image}" alt="Question image">` : ''}
    <div class="quiz-options">
      ${question.options.map((option, i) => `
        <div class="quiz-option" data-option="${i + 1}">
          ${option}
        </div>
      `).join('')}
    </div>
  `;
  
  container.appendChild(questionEl);
  
  // Update question counter
  if ($('#questionCounter')) {
    $('#questionCounter').textContent = `Question ${index + 1} sur ${currentQuiz.length}`;
  }
  
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
  if ($('#prevQuestion')) {
    $('#prevQuestion').style.display = index === 0 ? 'none' : 'block';
  }
  if ($('#nextQuestion')) {
    $('#nextQuestion').style.display = index === currentQuiz.length - 1 ? 'none' : 'block';
  }
  if ($('#submitQuiz')) {
    $('#submitQuiz').style.display = index === currentQuiz.length - 1 ? 'block' : 'none';
  }
}

function submitQuiz() {
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
  if ($('#quizContainer') && $('#quizResultsContainer')) {
    $('#quizContainer').style.display = 'none';
    $('#quizResultsContainer').style.display = 'block';
  }
  
  if ($('#quizResultsContent')) {
    $('#quizResultsContent').innerHTML = `
      <h4>Résultats du Quiz</h4>
      <p>Vous avez obtenu ${score} sur ${currentQuiz.length} (${Math.round((score/currentQuiz.length)*100)}%)</p>
      <p>Temps utilisé: ${timeUsed}</p>
      <button class="btn btn-primary" id="backToQuizzes">Retour aux quiz</button>
    `;
    
    if ($('#backToQuizzes')) {
      $('#backToQuizzes').addEventListener('click', () => {
        $('#quizResultsContainer').style.display = 'none';
        $('#studentQuizList').style.display = 'block';
        loadQuizResults();
      });
    }
  }
}

function calculateTimeUsed() {
  // This would normally be calculated based on the actual time taken
  // For simplicity, we'll just return a placeholder
  return "25:30";
}

/********************
 * DASHBOARD STATS
 ********************/
function updateDashboardStats() {
  if ($('#stats-students')) {
    $('#stats-students').textContent = DB.students.length;
  }
  if ($('#stats-quiz')) {
    $('#stats-quiz').textContent = DB.quiz.length;
  }
  if ($('#stats-dictionary')) {
    $('#stats-dictionary').textContent = DB.dictionary.length;
  }
  
  // Calculate total grades
  let totalGrades = 0;
  for (const studentId in DB.grades) {
    totalGrades += DB.grades[studentId].length;
  }
  
  if ($('#stats-grades')) {
    $('#stats-grades').textContent = totalGrades;
  }
  
  // Load recent activity
  if (!$('#recent-activity')) return;
  
  const activityContainer = $('#recent-activity');
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
    activityEl.style.padding = '10px';
    activityEl.style.borderBottom = '1px solid #eee';
    activityEl.innerHTML = `
      <div><strong>${activity.action}</strong>: ${activity.details}</div>
      <div class="muted" style="font-size: 0.9rem;">${activity.time}</div>
    `;
    activityContainer.appendChild(activityEl);
  });
}

/********************
 * STUDENTS MANAGEMENT
 ********************/
function renderStudentsTable() {
  if (!$('#studentsTable')) return;
  
  const tbody = $('#studentsTable tbody');
  tbody.innerHTML = '';
  
  DB.students.forEach(st => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${st.fullname}</td>
      <td>${st.username}</td>
      <td>${st.code}</td>
      <td>${st.classroom||''}</td>
      <td>
        <button class="btn btn-ghost btn-sm edit-student" data-id="${st.id}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-student" data-id="${st.id}"><i class="fa-solid fa-trash"></i></button>
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
        $('#stPassword').value = st.password;
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
      }
    });
  });
  
  // Filter students
  if ($('#filterStudents')) {
    $('#filterStudents').addEventListener('input', function() {
      const filter = this.value.toLowerCase();
      $$('#studentsTable tbody tr').forEach(tr => {
        const text = tr.textContent.toLowerCase();
        tr.style.display = text.includes(filter) ? '' : 'none';
      });
    });
  }
}

// Populate student selects in grades and other forms
function populateStudentSelects() {
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
}

function saveStudent() {
  const id = $('#stId').value;
  const fullname = $('#stFullname').value.trim();
  const username = $('#stUsername').value.trim();
  const password = $('#stPassword').value.trim();
  const code = $('#stCode').value.trim();
  const classroom = $('#stClassroom').value.trim();
  
  if (!fullname || !username || !password || !code) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }
  
  if (id) {
    // Update existing student
    const index = DB.students.findIndex(s => s.id === id);
    if (index !== -1) {
      DB.students[index] = { ...DB.students[index], fullname, username, password, code, classroom };
    }
  } else {
    // Add new student
    const newStudent = { id: uid(), fullname, username, password, code, classroom };
    DB.students.push(newStudent);
  }
  
  setData(DB);
  renderStudentsTable();
  populateStudentSelects();
  resetStudentForm();
}

function resetStudentForm() {
  $('#stId').value = '';
  $('#stFullname').value = '';
  $('#stUsername').value = '';
  $('#stPassword').value = '';
  $('#stCode').value = '';
  $('#stClassroom').value = '';
}

/********************
 * GRADES MANAGEMENT
 ********************/
function renderAdminGradesTable() {
  if (!$('#gradesAdminTable')) return;
  
  const tbody = $('#gradesAdminTable tbody');
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
      <td>${student ? student.fullname : 'Inconnu'}</td>
      <td>${grade.date||''}</td>
      <td>${grade.subject||''}</td>
      <td>${grade.title||''}</td>
      <td><strong>${Number(grade.score).toFixed(2)}</strong></td>
      <td>${grade.note||''}</td>
      <td>
        <button class="btn btn-ghost btn-sm edit-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}"><i class="fa-solid fa-trash"></i></button>
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
        }
      }
    });
  });
}

function saveGrade() {
  const id = $('#grId').value;
  const studentId = $('#grStudent').value;
  const subject = $('#grSubject').value.trim();
  const title = $('#grTitle').value.trim();
  const date = $('#grDate').value;
  const score = parseFloat($('#grScore').value);
  const note = $('#grNote').value.trim();
  
  if (!studentId || !subject || !title || !date || isNaN(score)) {
    alert('Veuillez remplir tous les champs obligatoires.');
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
    }
  } else {
    // Add new grade
    const newGrade = { id: uid(), subject, title, date, score, note };
    DB.grades[studentId].push(newGrade);
  }
  
  setData(DB);
  renderAdminGradesTable();
  resetGradeForm();
}

function resetGradeForm() {
  $('#grId').value = '';
  $('#grStudent').value = '';
  $('#grSubject').value = '';
  $('#grTitle').value = '';
  $('#grDate').value = '';
  $('#grScore').value = '';
  $('#grNote').value = '';
}

/********************
 * DICTIONARY MANAGEMENT
 ********************/
function renderAdminDictionaryList() {
  if (!$('#dictionaryTermsList')) return;
  
  const container = $('#dictionaryTermsList');
  container.innerHTML = '';
  
  if (DB.dictionary.length === 0) {
    container.innerHTML = '<p class="muted">Aucun terme pour le moment.</p>';
    return;
  }
  
  DB.dictionary.forEach(term => {
    const termEl = document.createElement('div');
    termEl.className = 'dictionary-term';
    termEl.style.padding = '10px';
    termEl.style.borderBottom = '1px solid #eee';
    termEl.innerHTML = `
      <div><strong>${term.ar}</strong> → ${term.fr}</div>
      <div class="muted">${term.def}</div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-dict" data-id="${term.id}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-dict" data-id="${term.id}"><i class="fa-solid fa-trash"></i></button>
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
        // Store the ID for update
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
      }
    });
  });
}

function saveDictionaryTerm() {
  const id = $('#adminDictAr').getAttribute('data-id');
  const ar = $('#adminDictAr').value.trim();
  const fr = $('#adminDictFr').value.trim();
  const def = $('#adminDictDef').value.trim();
  
  if (!ar || !fr) {
    alert('Veuillez remplir les termes arabe et français.');
    return;
  }
  
  if (id) {
    // Update existing term
    const index = DB.dictionary.findIndex(t => t.id === id);
    if (index !== -1) {
      DB.dictionary[index] = { ...DB.dictionary[index], ar, fr, def };
    }
  } else {
    // Add new term
    const newTerm = { id: uid(), ar, fr, def };
    DB.dictionary.push(newTerm);
  }
  
  setData(DB);
  renderAdminDictionaryList();
  resetDictionaryForm();
}

function resetDictionaryForm() {
  $('#adminDictAr').value = '';
  $('#adminDictFr').value = '';
  $('#adminDictDef').value = '';
  $('#adminDictAr').removeAttribute('data-id');
}

/********************
 * QUIZ MANAGEMENT
 ********************/
function renderAdminQuizList() {
  if (!$('#quizQuestionsList')) return;
  
  const container = $('#quizQuestionsList');
  container.innerHTML = '';
  
  if (DB.quiz.length === 0) {
    container.innerHTML = '<p class="muted">Aucune question pour le moment.</p>';
    return;
  }
  
  DB.quiz.forEach((question, index) => {
    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';
    questionEl.style.padding = '10px';
    questionEl.style.borderBottom = '1px solid #eee';
    questionEl.innerHTML = `
      <div><strong>Question ${index + 1}:</strong> ${question.question}</div>
      ${question.image ? `<div><img src="${question.image}" alt="Question image" style="max-width: 200px; max-height: 150px;"></div>` : ''}
      <div class="muted">
        Options: 
        ${question.options.map((option, i) => `
          ${i + 1}. ${option} ${i + 1 == question.correct ? '✓' : ''}
        `).join(' | ')}
      </div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-quiz" data-id="${question.id}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-quiz" data-id="${question.id}"><i class="fa-solid fa-trash"></i></button>
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
        // Store the ID for update
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
      }
    });
  });
}

function saveQuizQuestion() {
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
    alert('Veuillez remplir la question et toutes les options.');
    return;
  }
  
  if (id) {
    // Update existing question
    const index = DB.quiz.findIndex(q => q.id === id);
    if (index !== -1) {
      DB.quiz[index] = { ...DB.quiz[index], question, options, correct };
    }
  } else {
    // Add new question
    const newQuestion = { id: uid(), question, options, correct };
    DB.quiz.push(newQuestion);
  }
  
  setData(DB);
  renderAdminQuizList();
  resetQuizForm();
}

function resetQuizForm() {
  $('#adminQuizQuestion').value = '';
  $('#adminOption1').value = '';
  $('#adminOption2').value = '';
  $('#adminOption3').value = '';
  $('#adminOption4').value = '';
  $('#adminQuizCorrect').value = '1';
  $('#adminQuizQuestion').removeAttribute('data-id');
}

/********************
 * LESSONS MANAGEMENT
 ********************/
function renderAdminLessonsList() {
  if (!$('#lessonsList')) return;
  
  const container = $('#lessonsList');
  container.innerHTML = '';
  
  if (DB.lessons.length === 0) {
    container.innerHTML = '<p class="muted">Aucune leçon pour le moment.</p>';
    return;
  }
  
  DB.lessons.forEach((lesson, index) => {
    const lessonEl = document.createElement('div');
    lessonEl.className = 'lesson-item';
    lessonEl.style.padding = '10px';
    lessonEl.style.borderBottom = '1px solid #eee';
    lessonEl.innerHTML = `
      <div><strong>${lesson.title}</strong> - ${lesson.chapter}</div>
      <div class="muted">${lesson.description}</div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-lesson" data-id="${lesson.id}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-lesson" data-id="${lesson.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    container.appendChild(lessonEl);
  });
  
  // Add event listeners
  $$('.edit-lesson').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const lesson = DB.lessons.find(l => l.id === id);
      if (lesson) {
        $('#adminLessonTitle').value = lesson.title;
        $('#adminLessonChapter').value = lesson.chapter;
        $('#adminLessonDescription').value = lesson.description;
        $('#adminLessonContent').value = lesson.content;
        // Store the ID for update
        $('#adminLessonTitle').setAttribute('data-id', id);
      }
    });
  });
  
  $$('.delete-lesson').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
        DB.lessons = DB.lessons.filter(l => l.id !== id);
        setData(DB);
        renderAdminLessonsList();
      }
    });
  });
}

function saveLesson() {
  const id = $('#adminLessonTitle').getAttribute('data-id');
  const title = $('#adminLessonTitle').value.trim();
  const chapter = $('#adminLessonChapter').value.trim();
  const description = $('#adminLessonDescription').value.trim();
  const content = $('#adminLessonContent').value.trim();
  
  if (!title || !chapter) {
    alert('Veuillez remplir le titre et le chapitre.');
    return;
  }
  
  if (id) {
    // Update existing lesson
    const index = DB.lessons.findIndex(l => l.id === id);
    if (index !== -1) {
      DB.lessons[index] = { ...DB.lessons[index], title, chapter, description, content };
    }
  } else {
    // Add new lesson
    const newLesson = { id: uid(), title, chapter, description, content };
    DB.lessons.push(newLesson);
  }
  
  setData(DB);
  renderAdminLessonsList();
  resetLessonForm();
}

function resetLessonForm() {
  $('#adminLessonTitle').value = '';
  $('#adminLessonChapter').value = '';
  $('#adminLessonDescription').value = '';
  $('#adminLessonContent').value = '';
  $('#adminLessonTitle').removeAttribute('data-id');
}

/********************
 * EXERCISES MANAGEMENT
 ********************/
function renderAdminExercisesList() {
  if (!$('#exercisesList')) return;
  
  const container = $('#exercisesList');
  container.innerHTML = '';
  
  if (DB.exercises.length === 0) {
    container.innerHTML = '<p class="muted">Aucun exercice pour le moment.</p>';
    return;
  }
  
  DB.exercises.forEach((exercise, index) => {
    const exerciseEl = document.createElement('div');
    exerciseEl.className = 'exercise-item';
    exerciseEl.style.padding = '10px';
    exerciseEl.style.borderBottom = '1px solid #eee';
    exerciseEl.innerHTML = `
      <div><strong>${exercise.title}</strong> - ${exercise.chapter}</div>
      <div class="muted">${exercise.description}</div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-exercise" data-id="${exercise.id}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-exercise" data-id="${exercise.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    container.appendChild(exerciseEl);
  });
  
  // Add event listeners
  $$('.edit-exercise').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const exercise = DB.exercises.find(e => e.id === id);
      if (exercise) {
        $('#adminExerciseTitle').value = exercise.title;
        $('#adminExerciseChapter').value = exercise.chapter;
        $('#adminExerciseDescription').value = exercise.description;
        $('#adminExerciseContent').value = exercise.content;
        // Store the ID for update
        $('#adminExerciseTitle').setAttribute('data-id', id);
      }
    });
  });
  
  $$('.delete-exercise').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
        DB.exercises = DB.exercises.filter(e => e.id !== id);
        setData(DB);
        renderAdminExercisesList();
      }
    });
  });
}

function saveExercise() {
  const id = $('#adminExerciseTitle').getAttribute('data-id');
  const title = $('#adminExerciseTitle').value.trim();
  const chapter = $('#adminExerciseChapter').value.trim();
  const description = $('#adminExerciseDescription').value.trim();
  const content = $('#adminExerciseContent').value.trim();
  
  if (!title || !chapter) {
    alert('Veuillez remplir le titre et le chapitre.');
    return;
  }
  
  if (id) {
    // Update existing exercise
    const index = DB.exercises.findIndex(e => e.id === id);
    if (index !== -1) {
      DB.exercises[index] = { ...DB.exercises[index], title, chapter, description, content };
    }
  } else {
    // Add new exercise
    const newExercise = { id: uid(), title, chapter, description, content };
    DB.exercises.push(newExercise);
  }
  
  setData(DB);
  renderAdminExercisesList();
  resetExerciseForm();
}

function resetExerciseForm() {
  $('#adminExerciseTitle').value = '';
  $('#adminExerciseChapter').value = '';
  $('#adminExerciseDescription').value = '';
  $('#adminExerciseContent').value = '';
  $('#adminExerciseTitle').removeAttribute('data-id');
}

/********************
 * EXAMS MANAGEMENT
 ********************/
function renderAdminExamsList() {
  if (!$('#examsList')) return;
  
  const container = $('#examsList');
  container.innerHTML = '';
  
  if (DB.exams.length === 0) {
    container.innerHTML = '<p class="muted">Aucun examen pour le moment.</p>';
    return;
  }
  
  DB.exams.forEach((exam, index) => {
    const examEl = document.createElement('div');
    examEl.className = 'exam-item';
    examEl.style.padding = '10px';
    examEl.style.borderBottom = '1px solid #eee';
    examEl.innerHTML = `
      <div><strong>${exam.title}</strong> - ${exam.subject}</div>
      <div class="muted">${exam.description}</div>
      <div class="mt-1">
        <button class="btn btn-ghost btn-sm edit-exam" data-id="${exam.id}"><i class="fa-solid fa-edit"></i></button>
        <button class="btn btn-accent btn-sm delete-exam" data-id="${exam.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    container.appendChild(examEl);
  });
  
  // Add event listeners
  $$('.edit-exam').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const exam = DB.exams.find(e => e.id === id);
      if (exam) {
        $('#adminExamTitle').value = exam.title;
        $('#adminExamSubject').value = exam.subject;
        $('#adminExamDescription').value = exam.description;
        $('#adminExamContent').value = exam.content;
        // Store the ID for update
        $('#adminExamTitle').setAttribute('data-id', id);
      }
    });
  });
  
  $$('.delete-exam').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
        DB.exams = DB.exams.filter(e => e.id !== id);
        setData(DB);
        renderAdminExamsList();
      }
    });
  });
}

function saveExam() {
  const id = $('#adminExamTitle').getAttribute('data-id');
  const title = $('#adminExamTitle').value.trim();
  const subject = $('#adminExamSubject').value.trim();
  const description = $('#adminExamDescription').value.trim();
  const content = $('#adminExamContent').value.trim();
  
  if (!title || !subject) {
    alert('Veuillez remplir le titre et la matière.');
    return;
  }
  
  if (id) {
    // Update existing exam
    const index = DB.exams.findIndex(e => e.id === id);
    if (index !== -1) {
      DB.exams[index] = { ...DB.exams[index], title, subject, description, content };
    }
  } else {
    // Add new exam
    const newExam = { id: uid(), title, subject, description, content };
    DB.exams.push(newExam);
  }
  
  setData(DB);
  renderAdminExamsList();
  resetExamForm();
}

function resetExamForm() {
  $('#adminExamTitle').value = '';
  $('#adminExamSubject').value = '';
  $('#adminExamDescription').value = '';
  $('#adminExamContent').value = '';
  $('#adminExamTitle').removeAttribute('data-id');
}

/********************
 * ANNOUNCEMENT MANAGEMENT
 ********************/
function saveAnnouncement() {
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
      alert('Annonce enregistrée avec image!');
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    setData(DB);
    updateAnnouncementDisplay();
    alert('Annonce enregistrée!');
  }
}

function updateAnnouncementDisplay() {
  if ($('#announcementText')) {
    $('#announcementText').textContent = DB.announcement;
  }
  if ($('#announcementImage')) {
    if (DB.announcementImage) {
      $('#announcementImage').src = DB.announcementImage;
      $('#announcementImage').style.display = 'block';
    } else {
      $('#announcementImage').style.display = 'none';
    }
  }
}

/********************
 * REVISION REQUESTS MANAGEMENT
 ********************/
function renderRevisionRequests() {
  if (!$('#revisionRequestsList')) return;
  
  const container = $('#revisionRequestsList');
  container.innerHTML = '';
  
  if (!DB.revisionRequests || DB.revisionRequests.length === 0) {
    container.innerHTML = '<p class="muted">Aucune demande de récorrection pour le moment.</p>';
    return;
  }
  
  DB.revisionRequests.forEach(request => {
    const student = DB.students.find(s => s.id === request.studentId);
    const grade = student && DB.grades[student.id] ? DB.grades[student.id].find(g => g.id === request.gradeId) : null;
    
    if (!student || !grade) return;
    
    const statusColors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'accent'
    };
    
    const requestEl = document.createElement('div');
    requestEl.className = 'revision-request';
    requestEl.style.padding = '15px';
    requestEl.style.border = '1px solid #eee';
    requestEl.style.borderRadius = '8px';
    requestEl.style.marginBottom = '10px';
    requestEl.innerHTML = `
      <div><strong>${student.fullname}</strong> - ${grade.title} (${grade.subject}) - Note: ${grade.score}/20</div>
      <div class="muted">${request.date}</div>
      <div>${request.message}</div>
      <div class="mt-2">
        <span class="btn btn-${statusColors[request.status]}">Statut: ${request.status}</span>
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
      }
    });
  });
}

/********************
 * DATA IMPORT/EXPORT
 ********************/
function exportData() {
  const dataStr = JSON.stringify(DB, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'lycee-excellence-data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importData() {
  const file = this.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (confirm('Êtes-vous sûr de vouloir importer ces données ? Toutes les données actuelles seront remplacées.')) {
        localStorage.setItem(LS_KEY, JSON.stringify(importedData));
        DB = getData();
        alert('Données importées avec succès !');
        location.reload();
      }
    } catch (error) {
      alert('Erreur lors de l\'importation du fichier. Le format est invalide.');
    }
  };
  reader.readAsText(file);
}

/********************
 * INITIALIZATION
 ********************/
function loadStudentResources() {
  if (!currentStudent) return;
  
  // Load recent grades
  if ($('#studentRecentGrades')) {
    const gradesContainer = $('#studentRecentGrades');
    gradesContainer.innerHTML = '';
    
    const grades = (DB.grades[currentStudent.id] || []).slice(-5).reverse();
    if (grades.length === 0) {
      gradesContainer.innerHTML = '<p class="muted">Aucune note disponible pour le moment.</p>';
    } else {
      grades.forEach(grade => {
        const gradeEl = document.createElement('div');
        gradeEl.style.padding = '10px';
        gradeEl.style.borderBottom = '1px solid #eee';
        gradeEl.innerHTML = `
          <div><strong>${grade.title}</strong> - ${grade.subject}</div>
          <div>Note: ${grade.score}/20 - ${grade.note}</div>
          <div class="muted">${grade.date}</div>
        `;
        gradesContainer.appendChild(gradeEl);
      });
    }
  }
  
  // Load lessons
  if ($('#studentLessonsList')) {
    const lessonsContainer = $('#studentLessonsList');
    lessonsContainer.innerHTML = '';
    
    if (DB.lessons.length === 0) {
      lessonsContainer.innerHTML = '<p class="muted">Aucune leçon disponible pour le moment.</p>';
    } else {
      DB.lessons.forEach(lesson => {
        const lessonEl = document.createElement('div');
        lessonEl.className = 'content-card';
        lessonEl.innerHTML = `
          <div class="card-content">
            <h3>${lesson.title}</h3>
            <p>Chapitre: ${lesson.chapter}</p>
            <p>${lesson.description}</p>
            <button class="btn btn-outline view-lesson" data-id="${lesson.id}">Consulter</button>
          </div>
        `;
        lessonsContainer.appendChild(lessonEl);
      });
      
      // Add event listeners for viewing lessons
      $$('.view-lesson').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          const lesson = DB.lessons.find(l => l.id === id);
          if (lesson) {
            $('#lessonModalTitle').textContent = lesson.title;
            $('#lessonModalContent').innerHTML = `
              <p><strong>Chapitre:</strong> ${lesson.chapter}</p>
              <p><strong>Description:</strong> ${lesson.description}</p>
              <div>${lesson.content}</div>
            `;
            $('#lessonModal').style.display = 'block';
          }
        });
      });
    }
  }
  
  // Load exercises
  if ($('#studentExercisesList')) {
    const exercisesContainer = $('#studentExercisesList');
    exercisesContainer.innerHTML = '';
    
    if (DB.exercises.length === 0) {
      exercisesContainer.innerHTML = '<p class="muted">Aucun exercice disponible pour le moment.</p>';
    } else {
      DB.exercises.forEach(exercise => {
        const exerciseEl = document.createElement('div');
        exerciseEl.className = 'content-card';
        exerciseEl.innerHTML = `
          <div class="card-content">
            <h3>${exercise.title}</h3>
            <p>Chapitre: ${exercise.chapter}</p>
            <p>${exercise.description}</p>
            <button class="btn btn-outline view-exercise" data-id="${exercise.id}">Consulter</button>
          </div>
        `;
        exercisesContainer.appendChild(exerciseEl);
      });
      
      // Add event listeners for viewing exercises
      $$('.view-exercise').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          const exercise = DB.exercises.find(e => e.id === id);
          if (exercise) {
            $('#exerciseModalTitle').textContent = exercise.title;
            $('#exerciseModalContent').innerHTML = `
              <p><strong>Chapitre:</strong> ${exercise.chapter}</p>
              <p><strong>Description:</strong> ${exercise.description}</p>
              <div>${exercise.content}</div>
            `;
            $('#exerciseModal').style.display = 'block';
          }
        });
      });
    }
  }
  
  // Load exams
  if ($('#studentExamsList')) {
    const examsContainer = $('#studentExamsList');
    examsContainer.innerHTML = '';
    
    if (DB.exams.length === 0) {
      examsContainer.innerHTML = '<p class="muted">Aucun examen disponible pour le moment.</p>';
    } else {
      DB.exams.forEach(exam => {
        const examEl = document.createElement('div');
        examEl.className = 'content-card';
        examEl.innerHTML = `
          <div class="card-content">
            <h3>${exam.title}</h3>
            <p>Matière: ${exam.subject}</p>
            <p>${exam.description}</p>
            <button class="btn btn-outline view-exam" data-id="${exam.id}">Consulter</button>
          </div>
        `;
        examsContainer.appendChild(examEl);
      });
      
      // Add event listeners for viewing exams
      $$('.view-exam').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          const exam = DB.exams.find(e => e.id === id);
          if (exam) {
            $('#examModalTitle').textContent = exam.title;
            $('#examModalContent').innerHTML = `
              <p><strong>Matière:</strong> ${exam.subject}</p>
              <p><strong>Description:</strong> ${exam.description}</p>
              <div>${exam.content}</div>
            `;
            $('#examModal').style.display = 'block';
          }
        });
      });
    }
  }
  
  // Load dictionary terms
  if ($('#studentDictionaryContent')) {
    const dictionaryContainer = $('#studentDictionaryContent');
    dictionaryContainer.innerHTML = '';
    
    DB.dictionary.forEach(term => {
      const termEl = document.createElement('div');
      termEl.className = 'content-card';
      termEl.innerHTML = `
        <div class="card-content">
          <h3>${term.ar} → ${term.fr}</h3>
          <p>${term.def}</p>
        </div>
      `;
      dictionaryContainer.appendChild(termEl);
    });
  }
}

// Close modals
window.addEventListener('click', (e) => {
  if (e.target === $('#lessonModal')) $('#lessonModal').style.display = 'none';
  if (e.target === $('#exerciseModal')) $('#exerciseModal').style.display = 'none';
  if (e.target === $('#examModal')) $('#examModal').style.display = 'none';
});

// Close buttons for modals
if ($('#closeLessonModal')) {
  $('#closeLessonModal').addEventListener('click', () => $('#lessonModal').style.display = 'none');
}
if ($('#closeExerciseModal')) {
  $('#closeExerciseModal').addEventListener('click', () => $('#exerciseModal').style.display = 'none');
}
if ($('#closeExamModal')) {
  $('#closeExamModal').addEventListener('click', () => $('#examModal').style.display = 'none');
}
