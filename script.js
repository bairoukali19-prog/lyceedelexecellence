 /********************
 * UTIL & STORAGE - MODIFIED FOR CLOUD SYNC
 ********************/
// استبدل هذه القيم بمعلومات حسابك على JSONBin.io
const JSONBIN_BIN_ID = 'YOUR_BIN_ID_HERE'; // استبدل هذا بمعرف الـ Bin الخاص بك
const JSONBIN_API_KEY = '$2b$10$YOUR_API_KEY_HERE'; // استبدل هذا بمفتاح API الخاص بك
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
const LS_KEY = 'lx-data-backup';
const ADMIN = { user: 'admin7', pass: 'ali7800' };

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

// دالة لجلب البيانات من السحابة مع وجود نسخة احتياطية محلية
const getData = async () => {
  try {
    console.log('جاري تحميل البيانات من السحابة...');
    const response = await fetch(JSONBIN_URL, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'X-Bin-Meta': 'false'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from cloud');
    }
    
    const data = await response.json();
    console.log('تم تحميل البيانات من السحابة بنجاح');
    
    // حفظ نسخة احتياطية محلية
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Error fetching cloud data:', error);
    console.log('جاري استخدام النسخة الاحتياطية المحلية...');
    
    // المحاولة باستخدام النسخة المحلية
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing local data:', e);
      }
    }
    
    // البيانات الافتراضية في حالة فشل التحميل
    console.log('جاري استخدام البيانات الافتراضية...');
    const demo = {
      students: [
        {id: uid(), fullname:'Ahmed Amine', username:'ahmed.amine', password:'1234', code:'P-2024-001', classroom:'2ème Bac SP'},
        {id: uid(), fullname:'Sara El', username:'sara.el', password:'abcd', code:'P-2024-002', classroom:'2ème Bac SP'}
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
      quizResults: {},
      lastUpdated: new Date().toISOString()
    };
    
    // محاولة حفظ البيانات الافتراضية إلى السحابة
    try {
      await setData(demo);
    } catch (e) {
      console.error('Failed to save default data to cloud:', e);
      // حفظ محلي كنسخة احتياطية
      localStorage.setItem(LS_KEY, JSON.stringify(demo));
    }
    
    return demo;
  }
};

// دالة لحفظ البيانات إلى السحابة
const setData = async (data) => {
  // تحديث وقت التعديل الأخير
  data.lastUpdated = new Date().toISOString();
  
  try {
    console.log('جاري حفظ البيانات إلى السحابة...');
    const response = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save data to cloud');
    }
    
    console.log('تم حفظ البيانات إلى السحابة بنجاح');
    
    // حفظ نسخة احتياطية محلية
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return await response.json();
  } catch (error) {
    console.error('Error saving data to cloud:', error);
    
    // حفظ محلي كنسخة احتياطية
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      console.log('تم حفظ البيانات محلياً كنسخة احتياطية');
    } catch (e) {
      console.error('Failed to save data locally:', e);
    }
    
    throw error;
  }
};

// تهيئة البيانات
let DB = {};
let currentStudent = null;
let currentQuiz = null;
let quizTimer = null;
let currentQuestionIndex = 0;
let studentAnswers = {};
let isOnline = true;

// التحقق من حالة الاتصال
const checkOnlineStatus = async () => {
  try {
    // استخدام خدمة بسيطة للتحقق من الاتصال لتجنب مشاكل CORS
    const response = await fetch('https://httpbin.org/status/200', { 
      method: 'HEAD',
      cache: 'no-store'
    });
    isOnline = response.ok;
  } catch (error) {
    isOnline = navigator.onLine;
  }
  
  // تحديث واجهة المستخدم بناءً على حالة الاتصال
  const statusElement = $('#onlineStatus') || document.createElement('div');
  statusElement.id = 'onlineStatus';
  statusElement.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 12px;
    border-radius: 4px;
    font-weight: bold;
    z-index: 1000;
    display: ${isOnline ? 'none' : 'block'};
    background: #e74c3c;
    color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  statusElement.textContent = '⚠️ أنت غير متصل بالإنترنت';
  
  if (!document.getElementById('onlineStatus')) {
    document.body.appendChild(statusElement);
  }
  
  return isOnline;
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
  // التحقق من حالة الاتصال
  isOnline = await checkOnlineStatus();
  
  try {
    DB = await getData();
    initApp();
    
    // تحديث تلقائي للبيانات كل 30 ثانية
    setInterval(async () => {
      isOnline = await checkOnlineStatus();
      if (isOnline) {
        try {
          const freshData = await getData();
          if (freshData.lastUpdated !== DB.lastUpdated) {
            DB = freshData;
            console.log('تم تحديث البيانات من السحابة');
            updateUIWithNewData();
          }
        } catch (error) {
          console.error('Error updating data:', error);
        }
      }
    }, 30000);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('فشل تحميل البيانات. يرجى التحقق من اتصال الإنترنت وتحديث الصفحة.');
  }
});

function initApp() {
  // تحديث الإعلان عند تحميل الصفحة
  if ($('#announcementText')) {
    $('#announcementText').textContent = DB.announcement || '';
  }
  if ($('#announcementInput')) {
    $('#announcementInput').value = DB.announcement || '';
  }
  if (DB.announcementImage && $('#announcementImage')) {
    $('#announcementImage').src = DB.announcementImage;
    $('#announcementImage').style.display = 'block';
  }

  /********************
   * NAVIGATION
   ********************/
  function showSection(id) {
    $$('.page-section').forEach(s => s.classList.remove('active'));
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    }
  }

  $$('.nav-link, .feature-card').forEach(item => {
    item.addEventListener('click', function () {
      const id = this.getAttribute('data-section');
      if (id) showSection(id);
    });
  });

  // Student tabs navigation
  $$('.student-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab
      $$('.student-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding section
      $$('.student-tab-content').forEach(s => s.classList.remove('active'));
      const tabContent = $(`#student-${tabId}-tab`);
      if (tabContent) tabContent.classList.add('active');
    });
  });

  // Admin tabs navigation
  $$('.admin-tab-link').forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab
      $$('.admin-tab-link').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding section
      $$('.admin-section').forEach(s => s.classList.remove('active'));
      const section = $(`#${tabId}`);
      if (section) section.classList.add('active');

      // Load specific content if needed
      if (tabId === 'tab-revisions') {
        renderRevisionRequests();
      }
    });
  });

  /********************
   * STUDENT AREA
   ********************/
  function fillGradesFor(student) {
    const tbody = $('#gradesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const list = (DB.grades[student.id] || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (!list.length) {
      if ($('#noGradesMsg')) $('#noGradesMsg').style.display = 'block';
    } else {
      if ($('#noGradesMsg')) $('#noGradesMsg').style.display = 'none';
    }
    list.forEach(g => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${g.date || ''}</td><td>${g.subject || ''}</td><td>${g.title || ''}</td><td><strong>${Number(g.score).toFixed(2)}</strong></td><td>${g.note || ''}</td>`;
      tbody.appendChild(tr);
    });
    if ($('#studentInfo')) {
      $('#studentInfo').innerHTML = `<div class="inline"><span class="chip"><i class="fa-solid fa-user"></i> ${student.fullname}</span><span class="chip"><i class="fa-solid fa-id-card"></i> ${student.code}</span><span class="chip"><i class="fa-solid fa-school"></i> ${student.classroom || ''}</span></div>`;
    }
    if ($('#gradesResults')) {
      $('#gradesResults').style.display = 'block';
    }
    showSection('grades');
  }

  // Search by Code Parcours
  if ($('#btnSearchByCode')) {
    $('#btnSearchByCode').addEventListener('click', () => {
      const code = ($('#searchCode').value || '').trim();
      const st = DB.students.find(s => s.code.toLowerCase() === code.toLowerCase());
      if (!st) {
        alert('Code parcours introuvable.');
        return;
      }
      fillGradesFor(st);
    });
  }

  // Student login modal open/close
  if ($('#studentLoginBtn')) {
    $('#studentLoginBtn').addEventListener('click', () => {
      if ($('#studentLoginModal')) $('#studentLoginModal').style.display = 'flex';
    });
  }
  
  if ($('#cancelStudentLogin')) {
    $('#cancelStudentLogin').addEventListener('click', () => {
      if ($('#studentLoginModal')) $('#studentLoginModal').style.display = 'none';
    });
  }
  
  window.addEventListener('click', (e) => {
    if ($('#studentLoginModal') && e.target === $('#studentLoginModal')) {
      $('#studentLoginModal').style.display = 'none';
    }
    if ($('#loginModal') && e.target === $('#loginModal')) {
      $('#loginModal').style.display = 'none';
    }
  });

  // Student login submit
  if ($('#submitStudentLogin')) {
    $('#submitStudentLogin').addEventListener('click', () => {
      const u = ($('#studentUsername').value || '').trim();
      const p = ($('#studentPassword').value || '').trim();
      const st = DB.students.find(s => s.username === u && s.password === p);
      if (!st) {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
        return;
      }
      if ($('#studentLoginModal')) $('#studentLoginModal').style.display = 'none';
      
      // Set current student
      currentStudent = st;
      
      // Show student dashboard
      if ($('#studentWelcome')) $('#studentWelcome').textContent = `Bienvenue, ${st.fullname}`;
      if ($('#student-dashboard')) $('#student-dashboard').style.display = 'block';
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
      if ($('#student-dashboard')) $('#student-dashboard').style.display = 'none';
      currentStudent = null;
      showSection('home');
    });
  }

  // Populate revision form with student's grades
  function populateRevisionForm() {
    if (!currentStudent) return;
    const grades = DB.grades[currentStudent.id] || [];
    const select = $('#revisionExam');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionnez une évaluation</option>';
    grades.forEach(grade => {
      const option = document.createElement('option');
      option.value = grade.id;
      option.textContent = `${grade.title} - ${grade.subject} (${grade.score}/20)`;
      select.appendChild(option);
    });
  }

  // Handle revision request submission
  if ($('#revisionRequestForm')) {
    $('#revisionRequestForm').addEventListener('submit', async function (e) {
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
        date: new Date().toISOString().slice(0, 10),
        status: 'pending'
      });

      try {
        await setData(DB);
        alert('Votre demande a été envoyée.');
        this.reset();
        loadStudentRevisionRequests();
      } catch (error) {
        alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  // Load student's revision requests
  function loadStudentRevisionRequests() {
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
    if (!container) return;
    
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
      btn.addEventListener('click', function () {
        startQuiz();
      });
    });
    
    // Load quiz results
    loadQuizResults();
  }

  function loadQuizResults() {
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
          <p>Score: ${result.score}/${result.total} (${Math.round((result.score / result.total) * 100)}%)</p>
          <p>Temps utilisé: ${result.timeUsed}</p>
        </div>
      `;
      container.appendChild(resultCard);
    });
  }

  function startQuiz() {
    if (!currentStudent) return;
    
    // Hide quiz list and show quiz container
    if ($('#studentQuizList')) $('#studentQuizList').style.display = 'none';
    if ($('#quizContainer')) $('#quizContainer').style.display = 'block';
    
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
      option.addEventListener('click', function () {
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
      $(`.quiz-option[data-option="${studentAnswers[index]}"]`)?.classList.add('selected');
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

  // Navigation between questions
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

  // Submit quiz
  if ($('#submitQuiz')) {
    $('#submitQuiz').addEventListener('click', submitQuiz);
  }

  async function submitQuiz() {
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
    
    try {
      await setData(DB);
      
      // Show results
      if ($('#quizContainer')) $('#quizContainer').style.display = 'none';
      if ($('#quizResultsContainer')) $('#quizResultsContainer').style.display = 'block';
      
      if ($('#quizResultsContent')) {
        $('#quizResultsContent').innerHTML = `
          <h4>Résultats du Quiz</h4>
          <p>Vous avez obtenu ${score} sur ${currentQuiz.length} (${Math.round((score / currentQuiz.length) * 100)}%)</p>
          <p>Temps utilisé: ${timeUsed}</p>
          <button class="btn btn-primary" id="backToQuizzes">Retour aux quiz</button>
        `;
      }
      
      if ($('#backToQuizzes')) {
        $('#backToQuizzes').addEventListener('click', () => {
          if ($('#quizResultsContainer')) $('#quizResultsContainer').style.display = 'none';
          if ($('#studentQuizList')) $('#studentQuizList').style.display = 'block';
          loadQuizResults();
        });
      }
    } catch (error) {
      alert('فشل في حفظ النتائج. يرجى المحاولة مرة أخرى.');
    }
  }

  function calculateTimeUsed() {
    // This would normally be calculated based on the actual time taken
    // For simplicity, we'll just return a placeholder
    return "25:30";
  }

  /********************
   * ADMIN AUTH
   ********************/
  if ($('#loginBtn')) {
    $('#loginBtn').addEventListener('click', () => {
      if ($('#loginModal')) $('#loginModal').style.display = 'flex';
    });
  }
  
  if ($('#cancelLogin')) {
    $('#cancelLogin').addEventListener('click', () => {
      if ($('#loginModal')) $('#loginModal').style.display = 'none';
    });
  }
  
  if ($('#submitLogin')) {
    $('#submitLogin').addEventListener('click', () => {
      const u = $('#username').value.trim();
      const p = $('#password').value.trim();
      if (u === ADMIN.user && p === ADMIN.pass) {
        if ($('#loginModal')) $('#loginModal').style.display = 'none';
        document.body.classList.add('admin-mode');
        if ($('#admin-panel')) $('#admin-panel').style.display = 'block';
        showSection('admin-panel');
        renderStudentsTable();
        populateStudentSelects();
        renderAdminGradesTable();
        updateDashboardStats();
        renderAdminDictionaryList();
        renderAdminQuizList();
      } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
      }
    });
  }
  
  if ($('#logoutBtn')) {
    $('#logoutBtn').addEventListener('click', () => {
      document.body.classList.remove('admin-mode');
      if ($('#admin-panel')) $('#admin-panel').style.display = 'none';
      showSection('home');
    });
  }

  /********************
   * DASHBOARD STATS
   ********************/
  function updateDashboardStats() {
    if ($('#stats-students')) $('#stats-students').textContent = DB.students.length;
    if ($('#stats-quiz')) $('#stats-quiz').textContent = DB.quiz.length;
    if ($('#stats-dictionary')) $('#stats-dictionary').textContent = DB.dictionary.length;
    
    // Calculate total grades
    let totalGrades = 0;
    for (const studentId in DB.grades) {
      totalGrades += DB.grades[studentId].length;
    }
    if ($('#stats-grades')) $('#stats-grades').textContent = totalGrades;
    
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
    if (!tbody) return;
    
    tbody.innerHTML = '';
    DB.students.forEach(st => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${st.fullname}</td>
        <td>${st.username}</td>
        <td>${st.code}</td>
        <td>${st.classroom || ''}</td>
        <td>
          <button class="btn btn-ghost btn-sm edit-student" data-id="${st.id}"><i class="fa-solid fa-edit"></i></button>
          <button class="btn btn-accent btn-sm delete-student" data-id="${st.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    // Add event listeners
    $$('.edit-student').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const st = DB.students.find(s => s.id === id);
        if (st) {
          if ($('#stId')) $('#stId').value = st.id;
          if ($('#stFullname')) $('#stFullname').value = st.fullname;
          if ($('#stUsername')) $('#stUsername').value = st.username;
          if ($('#stPassword')) $('#stPassword').value = st.password;
          if ($('#stCode')) $('#stCode').value = st.code;
          if ($('#stClassroom')) $('#stClassroom').value = st.classroom || '';
        }
      });
    });
    
    $$('.delete-student').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
          DB.students = DB.students.filter(s => s.id !== id);
          delete DB.grades[id];
          setData(DB).then(() => {
            renderStudentsTable();
            populateStudentSelects();
          }).catch(error => {
            alert('فشل في حذف الطالب. يرجى المحاولة مرة أخرى.');
          });
        }
      });
    });
    
    // Filter students
    if ($('#filterStudents')) {
      $('#filterStudents').addEventListener('input', function () {
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

  // Save student
  if ($('#btnSaveStudent')) {
    $('#btnSaveStudent').addEventListener('click', async () => {
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
      
      try {
        await setData(DB);
        renderStudentsTable();
        populateStudentSelects();
        if ($('#btnResetStudent')) $('#btnResetStudent').click();
      } catch (error) {
        alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  // Reset student form
  if ($('#btnResetStudent')) {
    $('#btnResetStudent').addEventListener('click', () => {
      if ($('#stId')) $('#stId').value = '';
      if ($('#stFullname')) $('#stFullname').value = '';
      if ($('#stUsername')) $('#stUsername').value = '';
      if ($('#stPassword')) $('#stPassword').value = '';
      if ($('#stCode')) $('#stCode').value = '';
      if ($('#stClassroom')) $('#stClassroom').value = '';
    });
  }

  /********************
   * GRADES MANAGEMENT
   ********************/
  function renderAdminGradesTable() {
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
        if (Array.isArray(DB.grades[id])) {
          grades = grades.concat(DB.grades[id]);
        }
      }
    }
    
    if (grades.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Aucune note disponible</td></tr>';
      return;
    }
    
    grades.forEach(grade => {
      const student = DB.students.find(s => {
        const studentGrades = DB.grades[s.id] || [];
        return studentGrades.some(g => g.id === grade.id);
      });
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${student ? student.fullname : 'Inconnu'}</td>
        <td>${grade.date || ''}</td>
        <td>${grade.subject || ''}</td>
        <td>${grade.title || ''}</td>
        <td><strong>${Number(grade.score).toFixed(2)}</strong></td>
        <td>${grade.note || ''}</td>
        <td>
          <button class="btn btn-ghost btn-sm edit-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}"><i class="fa-solid fa-edit"></i></button>
          <button class="btn btn-accent btn-sm delete-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    // Add event listeners
    $$('.edit-grade').forEach(btn => {
      btn.addEventListener('click', function () {
        const gradeId = this.getAttribute('data-id');
        const studentId = this.getAttribute('data-student');
        const grades = DB.grades[studentId] || [];
        const grade = grades.find(g => g.id === gradeId);
        
        if (grade) {
          if ($('#grId')) $('#grId').value = grade.id;
          if ($('#grStudent')) $('#grStudent').value = studentId;
          if ($('#grSubject')) $('#grSubject').value = grade.subject || '';
          if ($('#grTitle')) $('#grTitle').value = grade.title || '';
          if ($('#grDate')) $('#grDate').value = grade.date || '';
          if ($('#grScore')) $('#grScore').value = grade.score || '';
          if ($('#grNote')) $('#grNote').value = grade.note || '';
        }
      });
    });
    
    $$('.delete-grade').forEach(btn => {
      btn.addEventListener('click', function () {
        const gradeId = this.getAttribute('data-id');
        const studentId = this.getAttribute('data-student');
        
        if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
          if (DB.grades[studentId]) {
            DB.grades[studentId] = DB.grades[studentId].filter(g => g.id !== gradeId);
            setData(DB).then(() => {
              renderAdminGradesTable();
            }).catch(error => {
              alert('فشل في حذف الدرجة. يرجى المحاولة مرة أخرى.');
            });
          }
        }
      });
    });
  }

  // Filter grades by student
  if ($('#grFilterStudent')) {
    $('#grFilterStudent').addEventListener('change', renderAdminGradesTable);
  }

  // Save grade
  if ($('#btnSaveGrade')) {
    $('#btnSaveGrade').addEventListener('click', async () => {
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
      
      try {
        await setData(DB);
        renderAdminGradesTable();
        if ($('#btnResetGrade')) $('#btnResetGrade').click();
      } catch (error) {
        alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  // Reset grade form
  if ($('#btnResetGrade')) {
    $('#btnResetGrade').addEventListener('click', () => {
      if ($('#grId')) $('#grId').value = '';
      if ($('#grStudent')) $('#grStudent').value = '';
      if ($('#grSubject')) $('#grSubject').value = '';
      if ($('#grTitle')) $('#grTitle').value = '';
      if ($('#grDate')) $('#grDate').value = '';
      if ($('#grScore')) $('#grScore').value = '';
      if ($('#grNote')) $('#grNote').value = '';
    });
  }

  /********************
   * DICTIONARY MANAGEMENT
   ********************/
  function renderAdminDictionaryList() {
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
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const term = DB.dictionary.find(t => t.id === id);
        if (term) {
          if ($('#adminDictAr')) $('#adminDictAr').value = term.ar;
          if ($('#adminDictFr')) $('#adminDictFr').value = term.fr;
          if ($('#adminDictDef')) $('#adminDictDef').value = term.def;
          // Store the ID for update
          if ($('#adminDictAr')) $('#adminDictAr').setAttribute('data-id', id);
        }
      });
    });
    
    $$('.delete-dict').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        if (confirm('Êtes-vous sûr de vouloir supprimer ce terme ?')) {
          DB.dictionary = DB.dictionary.filter(t => t.id !== id);
          setData(DB).then(() => {
            renderAdminDictionaryList();
          }).catch(error => {
            alert('فشل في حذف المصطلح. يرجى المحاولة مرة أخرى.');
          });
        }
      });
    });
  }

  // Save dictionary term
  if ($('#adminBtnSaveDict')) {
    $('#adminBtnSaveDict').addEventListener('click', async () => {
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
      
      try {
        await setData(DB);
        renderAdminDictionaryList();
        if ($('#adminBtnResetDict')) $('#adminBtnResetDict').click();
      } catch (error) {
        alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  // Reset dictionary form
  if ($('#adminBtnResetDict')) {
    $('#adminBtnResetDict').addEventListener('click', () => {
      if ($('#adminDictAr')) $('#adminDictAr').value = '';
      if ($('#adminDictFr')) $('#adminDictFr').value = '';
      if ($('#adminDictDef')) $('#adminDictDef').value = '';
      if ($('#adminDictAr')) $('#adminDictAr').removeAttribute('data-id');
    });
  }

  /********************
   * QUIZ MANAGEMENT
   ********************/
  function renderAdminQuizList() {
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
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const question = DB.quiz.find(q => q.id === id);
        if (question) {
          if ($('#adminQuizQuestion')) $('#adminQuizQuestion').value = question.question;
          if ($('#adminOption1')) $('#adminOption1').value = question.options[0] || '';
          if ($('#adminOption2')) $('#adminOption2').value = question.options[1] || '';
          if ($('#adminOption3')) $('#adminOption3').value = question.options[2] || '';
          if ($('#adminOption4')) $('#adminOption4').value = question.options[3] || '';
          if ($('#adminQuizCorrect')) $('#adminQuizCorrect').value = question.correct;
          // Store the ID for update
          if ($('#adminQuizQuestion')) $('#adminQuizQuestion').setAttribute('data-id', id);
        }
      });
    });
    
    $$('.delete-quiz').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
          DB.quiz = DB.quiz.filter(q => q.id !== id);
          setData(DB).then(() => {
            renderAdminQuizList();
            loadStudentQuizzes();
          }).catch(error => {
            alert('فشل في حذف السؤال. يرجى المحاولة مرة أخرى.');
          });
        }
      });
    });
  }

  /********************
   * ANNOUNCEMENT MANAGEMENT
   ********************/
  if ($('#btnSaveAnnouncement')) {
    $('#btnSaveAnnouncement').addEventListener('click', async () => {
      const announcement = $('#announcementInput').value.trim();
      DB.announcement = announcement;
      
      // Handle image upload
      const imageInput = $('#announcementImageInput');
      if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          DB.announcementImage = e.target.result;
          setData(DB).then(() => {
            updateAnnouncementDisplay();
            alert('Annonce enregistrée avec image!');
          }).catch(error => {
            alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
          });
        };
        reader.readAsDataURL(imageInput.files[0]);
      } else {
        try {
          await setData(DB);
          updateAnnouncementDisplay();
          alert('Annonce enregistrée!');
        } catch (error) {
          alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
        }
      }
    });
  }

  function updateAnnouncementDisplay() {
    if ($('#announcementText')) $('#announcementText').textContent = DB.announcement || '';
    if ($('#announcementImage') && DB.announcementImage) {
      $('#announcementImage').src = DB.announcementImage;
      $('#announcementImage').style.display = 'block';
    } else if ($('#announcementImage')) {
      $('#announcementImage').style.display = 'none';
    }
  }

  // Image preview for announcement
  if ($('#announcementImageInput')) {
    $('#announcementImageInput').addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          if ($('#announcementImagePreview')) {
            $('#announcementImagePreview').src = e.target.result;
            $('#announcementImagePreview').style.display = 'block';
          }
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  /********************
   * REVISION REQUESTS MANAGEMENT
   ********************/
  function renderRevisionRequests() {
    const container = $('#revisionRequestsList');
    if (!container) return;
    
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
      btn.addEventListener('click', async function () {
        const id = this.getAttribute('data-id');
        const request = DB.revisionRequests.find(r => r.id === id);
        if (request) {
          request.status = 'approved';
          try {
            await setData(DB);
            renderRevisionRequests();
          } catch (error) {
            alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
          }
        }
      });
    });
    
    $$('.reject-revision').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.getAttribute('data-id');
        const request = DB.revisionRequests.find(r => r.id === id);
        if (request) {
          request.status = 'rejected';
          try {
            await setData(DB);
            renderRevisionRequests();
          } catch (error) {
            alert('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
          }
        }
      });
    });
  }

  /********************
   * DATA IMPORT/EXPORT
   ********************/
  if ($('#btnExport')) {
    $('#btnExport').addEventListener('click', () => {
      const dataStr = JSON.stringify(DB, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'lycee-excellence-data.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  }

  if ($('#importFile')) {
    $('#importFile').addEventListener('change', async function () {
      const file = this.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async function (e) {
        try {
          const importedData = JSON.parse(e.target.result);
          if (confirm('Êtes-vous sûr de vouloir importer ces données ? Toutes les données actuelles seront remplacées.')) {
            try {
              await setData(importedData);
              DB = importedData;
              alert('Données importées avec succès !');
              location.reload();
            } catch (error) {
              alert('فشل في استيراد البيانات. يرجى المحاولة مرة أخرى.');
            }
          }
        } catch (error) {
          alert('Erreur lors de l\'importation du fichier. Le format est invalide.');
        }
      };
      reader.readAsText(file);
    });
  }

  /********************
   * INITIALIZATION
   ********************/
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
}

// Load student resources
function loadStudentResources() {
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
          <h3>${resource.title}</h3>
          <p>Chapitre: ${resource.chapter}</p>
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
          <h3>${term.ar} → ${term.fr}</h3>
          <p>${term.def}</p>
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
          <h3>${exercise.title}</h3>
          <p>Chapitre: ${exercise.chapter}</p>
          <button class="btn btn-outline">Télécharger</button>
        </div>
      `;
      exercisesContainer.appendChild(exerciseEl);
    });
  }
}

// تحديث واجهة المستخدم عند تلقي بيانات جديدة
function updateUIWithNewData() {
  // إذا كان المستخدم الحالي مسجلاً دخوله، قم بتحديث واجهته
  if (currentStudent) {
    loadStudentResources();
    loadStudentRevisionRequests();
    loadStudentQuizzes();
  }
  
  // إذا كان المدير مسجلاً دخوله، قم بتحديث واجهته
  if (document.body.classList.contains('admin-mode')) {
    renderStudentsTable();
    populateStudentSelects();
    renderAdminGradesTable();
    updateDashboardStats();
    renderAdminDictionaryList();
    renderAdminQuizList();
    renderRevisionRequests();
  }
  
  // تحديث الإعلان
  updateAnnouncementDisplay();
}
