/********************
// 1️⃣ تعريف متغير عام للبيانات
let data = {};

// 2️⃣ جلب البيانات من data.json
async function fetchData() {
    const res = await fetch("data.json"); // لازم الملف يكون في نفس مجلد script.js
    data = await res.json();
}

// 3️⃣ استدعاء التحميل أول ما يفتح الموقع
fetchData();

// 4️⃣ دوال التعامل مع تسجيل الدخول والدرجات
function login(username, password) {
    const student = data.students.find(s => s.username === username && s.password === password);
    if (student) {
        alert(مرحباً ${student.fullname});
        displayGrades(student.id);
    } else {
        alert("اسم المستخدم أو كلمة المرور خاطئة");
    }
}

function displayGrades(studentId) {
    const studentGrades = data.grades[studentId] || [];
    studentGrades.forEach(g => {
        console.log(${g.date} - ${g.subject} - ${g.title} : ${g.score} (${g.note}));
    });
}
 * UTIL & STORAGE
 ********************/
const LS_KEY = 'lx-data-v4'; // Updated to v4 for new features
const ADMIN = { user: 'admin7', pass: 'ali7800' };

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const uid = () => 'id-' + Math.random().toString(36).slice(2,10);

const getData = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const demo = {
      students: [
        {id: uid(), fullname:'Ahmed Amine', username:'ahmed.amine', password:'1234', code:'P-2024-001', classroom:'2ème Bac SP'},
        {id: uid(), fullname:'Sara El', username:'sara.el', password:'abcd', code:'P-2024-002', classroom:'2ème Bac SP'},
        {id: uid(), fullname:'ali bairouè', username:'ali.bairouk', password:'abcd1', code:'P-2024-003', classroom:'2ème Bac SP'}
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
      announcementImage: "", // New field for announcement image
      revisionRequests: [],
      quizResults: {} // New field for storing quiz results
    };
    // seed demo grades
    demo.grades[ demo.students[0].id ] = [
      {id:uid(), date:'2024-10-15', subject:'Mécanique', title:'Contrôle 1', score:16.5, note:'Très bien'},
      {id:uid(), date:'2024-11-22', subject:'Électricité', title:'Contrôle 2', score:14, note:'Bon travail'}
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(demo));
    return demo;
  }
  try { return JSON.parse(raw); } catch { localStorage.removeItem(LS_KEY); return getData(); }
};
const setData = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));
let DB = getData();
let currentStudent = null;
let currentQuiz = null;
let quizTimer = null;
let currentQuestionIndex = 0;
let studentAnswers = {};

// Update announcement text and image on page load
document.getElementById('announcementText').textContent = DB.announcement;
document.getElementById('announcementInput').value = DB.announcement;
if (DB.announcementImage) {
  document.getElementById('announcementImage').src = DB.announcementImage;
  document.getElementById('announcementImage').style.display = 'block';
}

/********************
 * NAVIGATION
 ********************/
function showSection(id){
  $$('.page-section').forEach(s=>s.classList.remove('active'));
  if(id==='home'){ 
    window.scrollTo({top:0,behavior:'smooth'}); 
    return; 
  }
  const el = document.getElementById(id);
  if(el){ 
    el.classList.add('active'); 
    window.scrollTo({top:el.offsetTop-90,behavior:'smooth'}); 
  }
}

$$('.nav-link, .feature-card').forEach(item=>{
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
    }
  });
});

/********************
 * STUDENT AREA
 ********************/
function fillGradesFor(student){
  const tbody = $('#gradesTable tbody');
  tbody.innerHTML = '';
  const list = (DB.grades[student.id] || []).slice().sort((a,b)=>(a.date||'').localeCompare(b.date));
  if(!list.length){ $('#noGradesMsg').style.display='block'; }
  else { $('#noGradesMsg').style.display='none'; }
  list.forEach(g=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${g.date||''}</td><td>${g.subject||''}</td><td>${g.title||''}</td><td><strong>${Number(g.score).toFixed(2)}</strong></td><td>${g.note||''}</td>`;
    tbody.appendChild(tr);
  });
  $('#studentInfo').innerHTML = `<div class="inline"><span class="chip"><i class="fa-solid fa-user"></i> ${student.fullname}</span><span class="chip"><i class="fa-solid fa-id-card"></i> ${student.code}</span><span class="chip"><i class="fa-solid fa-school"></i> ${student.classroom||''}</span></div>`;
  $('#gradesResults').style.display='block';
  showSection('grades');
}

// Search by Code Parcours
$('#btnSearchByCode').addEventListener('click', ()=>{
  const code = ($('#searchCode').value || '').trim();
  const st = DB.students.find(s=>s.code.toLowerCase()===code.toLowerCase());
  if(!st){ alert('Code parcours introuvable.'); return; }
  fillGradesFor(st);
});

// Student login modal open/close
$('#studentLoginBtn').addEventListener('click', ()=> $('#studentLoginModal').style.display='flex');
$('#cancelStudentLogin').addEventListener('click', ()=> $('#studentLoginModal').style.display='none');
window.addEventListener('click', (e)=>{
  if(e.target===$('#studentLoginModal')) $('#studentLoginModal').style.display='none';
  if(e.target===$('#loginModal')) $('#loginModal').style.display='none';
});

// Student login submit
$('#submitStudentLogin').addEventListener('click', ()=>{
  const u = ($('#studentUsername').value||'').trim();
  const p = ($('#studentPassword').value||'').trim();
  const st = DB.students.find(s=>s.username===u && s.password===p);
  if(!st){ alert("Nom d'utilisateur ou mot de passe incorrect."); return; }
  $('#studentLoginModal').style.display='none';
  
  // Set current student
  currentStudent = st;
  
  // Show student dashboard
  $('#studentWelcome').textContent = `Bienvenue, ${st.fullname}`;
  $('#student-dashboard').style.display = 'block';
  showSection('student-dashboard');
  
  // Load student resources
  loadStudentResources();
  populateRevisionForm();
  loadStudentRevisionRequests();
  loadStudentQuizzes();
});

// Student logout
$('#studentLogoutBtn').addEventListener('click', ()=>{
  $('#student-dashboard').style.display = 'none';
  currentStudent = null;
  showSection('home');
});

// Populate revision form with student's grades
function populateRevisionForm() {
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
}

// Handle revision request submission
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

// Load student's revision requests
function loadStudentRevisionRequests() {
  if (!currentStudent) return;
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
 * QUIZ FUNCTIONALITY - IMPROVED
 ********************/
function loadStudentQuizzes() {
  if (!currentStudent) return;
  
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
  if (!currentStudent) return;
  
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
}

function startTimer(duration) {
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
}

function loadQuestion(index) {
  if (index < 0 || index >= currentQuiz.length) return;
  
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
}

// Navigation between questions
$('#prevQuestion').addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    loadQuestion(currentQuestionIndex - 1);
  }
});

$('#nextQuestion').addEventListener('click', () => {
  if (currentQuestionIndex < currentQuiz.length - 1) {
    loadQuestion(currentQuestionIndex + 1);
  }
});

// Submit quiz
$('#submitQuiz').addEventListener('click', submitQuiz);

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
}

function calculateTimeUsed() {
  // This would normally be calculated based on the actual time taken
  // For simplicity, we'll just return a placeholder
  return "25:30";
}

/********************
 * ADMIN AUTH
 ********************/
$('#loginBtn').addEventListener('click', ()=> $('#loginModal').style.display='flex');
$('#cancelLogin').addEventListener('click', ()=> $('#loginModal').style.display='none');
$('#submitLogin').addEventListener('click', ()=>{
  const u = $('#username').value.trim();
  const p = $('#password').value.trim();
  if(u===ADMIN.user && p===ADMIN.pass){
    $('#loginModal').style.display='none';
    document.body.classList.add('admin-mode');
    $('#admin-panel').style.display='block';
    showSection('admin-panel');
    renderStudentsTable();
    populateStudentSelects();
    renderAdminGradesTable();
    updateDashboardStats();
    renderAdminDictionaryList();
    renderAdminQuizList();
  }else{
    alert("Nom d'utilisateur ou mot de passe incorrect.");
  }
});
$('#logoutBtn').addEventListener('click', ()=>{
  document.body.classList.remove('admin-mode');
  $('#admin-panel').style.display='none';
  showSection('home');
});

/********************
 * DASHBOARD STATS
 ********************/
function updateDashboardStats() {
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
  $('#filterStudents').addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    $$('#studentsTable tbody tr').forEach(tr => {
      const text = tr.textContent.toLowerCase();
      tr.style.display = text.includes(filter) ? '' : 'none';
    });
  });
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

// Save student
$('#btnSaveStudent').addEventListener('click', () => {
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
  $('#btnResetStudent').click();
});

// Reset student form
$('#btnResetStudent').addEventListener('click', () => {
  $('#stId').value = '';
  $('#stFullname').value = '';
  $('#stUsername').value = '';
  $('#stPassword').value = '';
  $('#stCode').value = '';
  $('#stClassroom').value = '';
});

/********************
 * GRADES MANAGEMENT
 ********************/
function renderAdminGradesTable() {
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

// Filter grades by student
$('#grFilterStudent').addEventListener('change', renderAdminGradesTable);

// Save grade
$('#btnSaveGrade').addEventListener('click', () => {
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
  $('#btnResetGrade').click();
});

// Reset grade form
$('#btnResetGrade').addEventListener('click', () => {
  $('#grId').value = '';
  $('#grStudent').value = '';
  $('#grSubject').value = '';
  $('#grTitle').value = '';
  $('#grDate').value = '';
  $('#grScore').value = '';
  $('#grNote').value = '';
});

/********************
 * DICTIONARY MANAGEMENT
 ********************/
function renderAdminDictionaryList() {
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

// Save dictionary term
$('#adminBtnSaveDict').addEventListener('click', () => {
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
  $('#adminBtnResetDict').click();
});

// Reset dictionary form
$('#adminBtnResetDict').addEventListener('click', () => {
  $('#adminDictAr').value = '';
  $('#adminDictFr').value = '';
  $('#adminDictDef').value = '';
  $('#adminDictAr').removeAttribute('data-id');
});

/********************
 * QUIZ MANAGEMENT
 ********************/
function renderAdminQuizList() {
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

// Save quiz question
$('#adminBtnSaveQuiz').addEventListener('click', () => {
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
  $('#adminBtnResetQuiz').click();
});

// Reset quiz form
$('#adminBtnResetQuiz').addEventListener('click', () => {
  $('#adminQuizQuestion').value = '';
  $('#adminOption1').value = '';
  $('#adminOption2').value = '';
  $('#adminOption3').value = '';
  $('#adminOption4').value = '';
  $('#adminQuizCorrect').value = '1';
  $('#adminQuizQuestion').removeAttribute('data-id');
});

/********************
 * ANNOUNCEMENT MANAGEMENT
 ********************/
$('#btnSaveAnnouncement').addEventListener('click', () => {
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
});

function updateAnnouncementDisplay() {
  $('#announcementText').textContent = DB.announcement;
  if (DB.announcementImage) {
    $('#announcementImage').src = DB.announcementImage;
    $('#announcementImage').style.display = 'block';
  } else {
    $('#announcementImage').style.display = 'none';
  }
}

// Image preview for announcement
$('#announcementImageInput').addEventListener('change', function() {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      $('#announcementImagePreview').src = e.target.result;
      $('#announcementImagePreview').style.display = 'block';
    };
    reader.readAsDataURL(this.files[0]);
  }
});

/********************
 * REVISION REQUESTS MANAGEMENT
 ********************/
function renderRevisionRequests() {
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
$('#btnExport').addEventListener('click', () => {
  const dataStr = JSON.stringify(DB, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'lycee-excellence-data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
});

$('#importFile').addEventListener('change', function() {
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
});

/********************
 * INITIALIZATION
 ********************/
document.addEventListener('DOMContentLoaded', function() {
  // Load student resources
  loadStudentResources();
  
  // Set up admin functionality
  if (document.body.classList.contains('admin-mode')) {
    renderStudentsTable();
    populateStudentSelects();
    renderAdminGradesTable();
    updateDashboardStats();
    renderAdminDictionaryList();
    renderAdminQuizList();
  }
});

// Load student resources
function loadStudentResources() {
  if (!currentStudent) return;
  
  // Load recent grades
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
  
  // Load resources
  const resourcesContainer = $('#studentResources');
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
        <h3>${resource.title}</h3>
        <p>Chapitre: ${resource.chapter}</p>
        <button class="btn btn-outline">Consulter</button>
      </div>
    `;
    resourcesContainer.appendChild(resourceEl);
  });
  
  // Load dictionary terms
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
  
  // Load exercises
  const exercisesContainer = $('#studentExercisesList');
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
        <h3>${exercise.title}</h3>
        <p>Chapitre: ${exercise.chapter}</p>
        <button class="btn btn-outline">Télécharger</button>
      </div>
    `;
    exercisesContainer.appendChild(exerciseEl);
  });
}
