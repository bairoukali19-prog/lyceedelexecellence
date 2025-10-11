/* =============================
   Unified dashboard JS - UPDATED with Professional Quiz System
   =============================*/

/* =============================
   Data model (localStorage)
   ============================= */  
const STORAGE_KEY = 'lyceeExcellence_v_24';
let appData = {
  students: [
    { id: "mfepslppvscwl", fullname: "Mohamed ali belhaj", username: "Mohamed.Ali", password: "1@20TC", code: "P-2024-001", classroom: "TC PC" },
    { id: "mfepug3abdx5k", fullname: "Mohamed Abu Zaid", username: "Abu.Zaid", password: "2@2025", code: "P-2024-002", classroom: "1BAC" },
    { id: "mfepwvs0jpxwe", fullname: "Sallam Elmohib", username: "Sallam.Elmohib", password: "3@2024", code: "P-2024-003", classroom: "1BAC" },
    { id: "mfepyzyc4yh2a", fullname: "Ajwad Halab", username: "Ajwad.Halab", password: "3@2323", code: "P-2024-004", classroom: "TC PC" },
    { id: "mfeq2kxyuh5pf", fullname: "Lwali Thali", username: "Lwali.Thali", password: "4@5252", code: "P-2024-005", classroom: "TC PC" }
  ],
  grades: [
    { id: "mfeq5pgwl22cy", studentId: "mfepslppvscwl", subject: "Physique", title: "Evaluation diagnostique", date: "2025-09-10", score: 0.25, note: "F" },
    { id: "mfeq6gtoehgov", studentId: "mfepug3abdx5k", subject: "physique", title: "Evaluation diagnostique", date: "2025-09-11T01:24:03.372Z", score: 0.5, note: "F" },
    { id: "mfeq7oqrphzkw", studentId: "mfepwvs0jpxwe", subject: "physique", title: "Evaluation diagnostique", date: "2025-09-11T01:25:00.291Z", score: 10.5, note: "P" },
    { id: "mfeq8wlcm55g2", studentId: "mfepyzyc4yh2a", subject: "Physique", title: "Evaluation diagnostique", date: "2025-09-11T01:25:57.121Z", score: 0.25, note: "F" },
    { id: "mfeq9nfdiokin", studentId: "mfeq2kxyuh5pf", subject: "Physique", title: "Evaluation diagnostique", date: "2025-09-11T01:26:31.897Z", score: 2.5, note: "F" }
  ],
  quizzes: [
    {
      id: "quiz1",
      title: "اختبار فيزياء تجريبي - القوة والحركة",
      description: "اختبار تجريبي يشمل أساسيات القوة والحركة في الفيزياء",
      durationMinutes: 20,
      shuffle: true,
      allowMultipleAttempts: true,
      questions: [
        {
          id: "q1",
          question: "ما هي وحدة قياس القوة في النظام الدولي للوحدات؟",
          type: "single",
          points: 2,
          options: ["الجول", "النيتون", "الواط", "الباسكال"],
          correctIndices: [1],
          feedback: "النيتون هي وحدة قياس القوة في النظام الدولي للوحدات"
        },
        {
          id: "q2", 
          question: "اختر العبارات الصحيحة حول الحركة المتسارعة:",
          type: "multiple",
          points: 3,
          options: [
            "تتغير السرعة بمعدل ثابت",
            "التسارع يكون صفراً",
            "القوة المحصلة لا تساوي صفراً",
            "السرعة تكون ثابتة"
          ],
          correctIndices: [0, 2],
          feedback: "في الحركة المتسارعة تتغير السرعة بمعدل ثابت وتكون القوة المحصلة لا تساوي صفراً"
        },
        {
          id: "q3",
          question: "الكيلوجرام هو وحدة قياس الكتلة وليس الوزن",
          type: "single",
          points: 2,
          options: ["صح", "خطأ"],
          correctIndices: [0],
          feedback: "نعم، الكيلوجرام وحدة كتلة بينما النيتون وحدة وزن"
        },
        {
          id: "q4",
          question: "ما هو قانون نيوتن الأول؟",
          type: "single",
          points: 3,
          options: [
            "القوة تساوي الكتلة في التسارع",
            "لكل فعل رد فعل مساوٍ له في المقدار ومعاكس في الاتجاه",
            "يظل الجسم في حالته من السكون أو الحركة ما لم تؤثر عليه قوة محصلة"
          ],
          correctIndices: [2],
          feedback: "قانون نيوتن الأول يعرف بقانون القصور الذاتي"
        }
      ]
    },
    {
      id: "quiz2",
      title: "اختبار كيمياء - الجدول الدوري",
      description: "اختبار في أساسيات الجدول الدوري والعناصر الكيميائية",
      durationMinutes: 15,
      shuffle: false,
      allowMultipleAttempts: true,
      questions: [
        {
          id: "q1",
          question: "ما هو العدد الذري للهيدروجين؟",
          type: "single",
          points: 1,
          options: ["1", "2", "3", "4"],
          correctIndices: [0],
          feedback: "العدد الذري للهيدروجين هو 1"
        }
      ]
    }
  ],
  dictionary: [],
  lessons: [],
  exercises: [
    { id: "mfj2mukk2edjb", title: "Série N'1 Physique-Chimie", driveLink: "https://drive.google.com/file/d/1Ck4CbEtKofWPd11xAOxJVCQI7b8v65vK/view?usp=sharing" },
    { id: "mglipszl7zhay", title: "Série N'1 Physique-Chimie 2-bac pc", driveLink: "https://drive.google.com/file/d/1Ck4CbEtKofWPd11xAOxJVCQI7b8v65vK/view?usp=sharing" }
  ],
  exams: [],
  messages: [],
  latexContents: [],
  slides: [],
  responses: {},
  regradeRequests: [],
  currentUser: null,
  isAdmin: false,
  announcement: {
    text: "امتحان المراقبة المستمرة رقم 01 سيكون ابتداء من يوم 28/10 حتى 11/11 \nبالنسبة ل  1bac و 2Bac و TC .",
    image: null
  },
  siteCover: { enabled: true, url: null }
};

// متغيرات نظام الـ Quiz
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizTimer = null;
let timeLeft = 0;
let userAnswers = {};
let quizStartTime = null;

function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(appData, parsed);
      appData.slides = appData.slides || [];
      appData.regradeRequests = appData.regradeRequests || [];
      appData.responses = appData.responses || {};
      appData.quizzes = appData.quizzes || [];
    }
  } catch(e){ console.error('loadData', e); }
}

function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }

/* helpers */
function $(id){ return document.getElementById(id); }
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escapeHtml(s){ return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

// =============================
// Defensive fixes to stop scroll-to-top and wire grade buttons
// =============================
function normalizeInteractiveElements(){
  try {
    document.querySelectorAll('button').forEach(b => {
      if (!b.hasAttribute('type')) b.setAttribute('type', 'button');
    });

    document.querySelectorAll('a[href="#"], a[href="#!"]').forEach(a => {
      if (!a.__preventedHash) {
        a.addEventListener('click', e => { e.preventDefault(); });
        a.__preventedHash = true;
      }
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      if (a.getAttribute('data-section')) return;
      if (!a.__preventedHashAny) {
        a.addEventListener('click', e => {
          const targetHash = a.getAttribute('href');
          if (!targetHash || targetHash === '#' || targetHash === '#!') { e.preventDefault(); return; }
          try {
            const id = targetHash.replace(/^#/, '');
            if (!document.getElementById(id)) e.preventDefault();
          } catch(err){ e.preventDefault(); }
        });
        a.__preventedHashAny = true;
      }
    });
  } catch (err) { console.warn('normalizeInteractiveElements error', err); }
}

function attachGradeButtonsFallback(){
  try {
    const labels = [
      'Consultation des Notes','Consultation des notes','Consultation Des Notes',
      'Code Parcours','Code parcours','Code-parcours','CodeParcours',
      'Voir les notes','Voir les Notes','Voir les notes'
    ];
    Array.from(document.querySelectorAll('button, a')).forEach(el => {
      const txt = (el.textContent || '').trim();
      if (!txt) return;
      const matchesLabel = labels.some(lbl => txt.indexOf(lbl) !== -1);
      if (!matchesLabel) return;
      if (el.__gradeBound) return;
      el.addEventListener('click', function(e){
        e.preventDefault();
        let input = null;
        const frm = el.closest('form');
        if (frm) input = frm.querySelector('input, textarea');
        if (!input) input = document.querySelector('#codeParcours, #gradeCode, #code, input[name="code"], input[name="gradeCode"]');
        if (!input) {
          input = Array.from(document.querySelectorAll('input, textarea')).find(i => {
            const p = (i.placeholder||'').toLowerCase();
            const n = (i.name||'').toLowerCase();
            const id = (i.id||'').toLowerCase();
            return p.includes('code') || n.includes('code') || id.includes('code') || p.includes('parcours') || n.includes('parcours') || id.includes('parcours');
          }) || null;
        }
        let code = '';
        if (input) code = (input.value || '').trim();
        if (!code) {
          code = prompt('أدخل Code Parcours / Entrez le Code Parcours (مثال: P-2024-001):');
          if (!code) return;
        }
        try { searchGradesByCode(code.trim()); } catch(err){ alert('خطأ أثناء محاولة عرض النقاط: ' + (err && err.message ? err.message : err)); console.error(err); }
      });
      el.__gradeBound = true;
    });
  } catch(err){ console.warn('attachGradeButtonsFallback error', err); }
}

/* =============================
   Init
   ============================= */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  wireEvents();
  wireSliderAdminEvents();

  // defensive fixes
  normalizeInteractiveElements();
  attachGradeButtonsFallback();

  refreshUI();
  setTimeout(()=>{ renderAll(); renderFrontSlider(); }, 50);
});

/* =============================
   Wiring UI events
   ============================= */
function wireEvents(){
  // nav links
  document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const s=a.getAttribute('data-section'); showSection(s); }));
  document.querySelectorAll('.feature-card').forEach(c => c.addEventListener('click', ()=> { const s=c.getAttribute('data-section'); showSection(s); }));

  // login modals
  if ($('studentLoginBtn')) $('studentLoginBtn').addEventListener('click', ()=> { if ($('studentLoginModal')) $('studentLoginModal').style.display='block'; });
  if ($('loginBtn')) $('loginBtn').addEventListener('click', ()=> { if ($('loginModal')) $('loginModal').style.display='block'; });
  if ($('cancelStudentLogin')) $('cancelStudentLogin').addEventListener('click', ()=> { if ($('studentLoginModal')) $('studentLoginModal').style.display='none'; });
  if ($('cancelLogin')) $('cancelLogin').addEventListener('click', ()=> { if ($('loginModal')) $('loginModal').style.display='none'; });

  if ($('submitStudentLogin')) $('submitStudentLogin').addEventListener('click', ()=> {
    const u = $('studentUsername').value.trim(), p = $('studentPassword').value;
    loginStudent(u,p);
  });
  if ($('submitLogin')) $('submitLogin').addEventListener('click', ()=> {
    const u = $('username').value.trim(), p = $('password').value;
    loginAdmin(u,p);
  });

  if ($('studentLogoutBtn')) $('studentLogoutBtn').addEventListener('click', ()=> { appData.currentUser=null; appData.isAdmin=false; saveData(); refreshUI(); showSection('home'); });
  if ($('logoutBtn')) $('logoutBtn').addEventListener('click', ()=> { appData.currentUser=null; appData.isAdmin=false; saveData(); refreshUI(); showSection('home'); });

  // student tabs
  document.querySelectorAll('.student-tab').forEach(t => t.addEventListener('click', ()=> { const name = t.getAttribute('data-tab'); switchStudentTab(name); }));

  // admin tab links
  document.querySelectorAll('.admin-tab-link').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const tab = a.getAttribute('data-tab'); switchAdminTab(tab); }));

  // announcement handlers
  if ($('announcementImageInput')) $('announcementImageInput').addEventListener('change', handleAnnouncementImage);
  if ($('btnSaveAnnouncement')) $('btnSaveAnnouncement').addEventListener('click', ()=> { if ($('announcementInput')) appData.announcement.text = $('announcementInput').value; if ($('announcementText')) $('announcementText').textContent = appData.announcement.text; saveData(); alert('Annonce enregistrée'); });
  if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').addEventListener('click', ()=> { appData.announcement.image=null; saveData(); if ($('announcementImagePreview')) $('announcementImagePreview').style.display='none'; if ($('announcementImage')) $('announcementImage').style.display='none'; if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='none'; });

  // export/import
  if ($('btnExport')) $('btnExport').addEventListener('click', ()=> {
    const blob = new Blob([JSON.stringify(appData)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='lycee_data.json'; a.click(); URL.revokeObjectURL(url);
  });
  if ($('importFile')) $('importFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader(); fr.onload = function(ev){ try { if (!confirm('Importer va remplacer البيانات الحالية. Continuer?')) return; appData = JSON.parse(ev.target.result); saveData(); renderAll(); refreshUI(); alert('Import réussi'); } catch(err){ alert('Fichier invalide'); } }; fr.readAsText(f);
  });

  // student/admin functional buttons (guarded)
  if ($('btnCreateQuiz')) $('btnCreateQuiz').addEventListener('click', adminCreateQuiz);
  if ($('adminBtnSaveQuiz')) $('adminBtnSaveQuiz').addEventListener('click', adminAddQuestion);
  if ($('adminBtnPreviewQuiz')) $('adminBtnPreviewQuiz').addEventListener('click', ()=> { const qid = $('adminSelectQuiz').value; if (!qid){ alert('Sélectionner quiz'); return;} previewQuizAsStudent(qid); });

  if ($('adminBtnSaveLesson')) $('adminBtnSaveLesson').addEventListener('click', adminSaveLesson);
  if ($('adminBtnSaveExercise')) $('adminBtnSaveExercise').addEventListener('click', adminSaveExercise);
  if ($('adminBtnSaveExam')) $('adminBtnSaveExam').addEventListener('click', adminSaveExam);

  if ($('btnSaveStudent')) $('btnSaveStudent').addEventListener('click', adminSaveStudent);
  if ($('btnSaveGrade')) $('btnSaveGrade').addEventListener('click', adminSaveGrade);
  if ($('adminBtnSendMessage')) $('adminBtnSendMessage').addEventListener('click', adminSendMessage);

  // إضافة حدث لزر إضافة كلمة في القاموس
  if ($('btnAddDictionary')) {
    $('btnAddDictionary').addEventListener('click', addDictionaryTerm);
  } else {
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.textContent.includes('Ajouter le terme') || btn.textContent.includes('Add term') || btn.textContent.includes('إضافة مصطلح')) {
          btn.addEventListener('click', addDictionaryTerm);
        }
      });
    }, 1000);
  }

  if ($('latexCode')) {
    $('latexCode').addEventListener('input', updateLatexLineNumbers);
    updateLatexLineNumbers();
  }
  if ($('btnSaveLatex')) $('btnSaveLatex').addEventListener('click', adminSaveLatex);
}

/* =============================
   UI switching
   ============================= */
function hideAllMainSections(){
  document.querySelectorAll('.page-section').forEach(s => s.style.display='none'); 
  if ($('student-dashboard')) $('student-dashboard').style.display='none'; 
  if ($('admin-panel')) $('admin-panel').style.display='none';
  // إخفاء واجهة الـ Quiz إذا كانت مفتوحة
  const quizInterface = $('quiz-interface');
  if (quizInterface) quizInterface.style.display = 'none';
}

function showSection(id){
  hideAllMainSections();
  
  const el = document.getElementById(id);
  if (el) {
    el.style.display='block';
  }
  
  if (!appData.currentUser && id !== 'home') {
    if ($('home-section')) $('home-section').style.display='block';
    return;
  }
  
  if (id === 'quiz') renderQuizList();
  if (id === 'lessons') renderLessons();
  if (id === 'exercises') renderExercises();
  if (id === 'exams') renderExams();
  if (id === 'dictionary') renderDictionary();
}

function switchStudentTab(tabName){
  document.querySelectorAll('.student-tab-content').forEach(x=>x.style.display='none');
  document.querySelectorAll('.student-tab').forEach(t=>t.classList.remove('active'));
  const btn = document.querySelector('.student-tab[data-tab="'+tabName+'"]');
  if (btn) btn.classList.add('active');
  const content = document.getElementById('student-'+tabName+'-tab');
  if (content) content.style.display='block';
  if (tabName === 'dashboard') loadStudentDashboard();
  if (tabName === 'quiz') renderQuizListForStudent();
  if (tabName === 'exercises') renderStudentExercises();
  if (tabName === 'cours') renderLatexListForStudents();
  if (tabName === 'messages') renderStudentMessages();
  if (tabName === 'exams') renderExams();
}

function switchAdminTab(tabName){
  document.querySelectorAll('.admin-section').forEach(s=>s.style.display='none');
  document.querySelectorAll('.admin-tab-link').forEach(l=>l.classList.remove('active'));
  const link = document.querySelector('.admin-tab-link[data-tab="'+tabName+'"]'); 
  if (link) link.classList.add('active');
  const el = document.getElementById(tabName); 
  if (el) el.style.display='block';
  if (tabName === 'tab-students') loadStudentsTable();
  if (tabName === 'tab-grades') loadGradesTable();
  if (tabName === 'tab-quiz') renderQuizAdminListDetailed();
  if (tabName === 'tab-latex') loadLatexAdminList();
  if (tabName === 'tab-messages') renderAdminMessagesList();
  if (tabName === 'tab-lessons') renderLessonsAdminList();
  if (tabName === 'tab-exercises') renderExercisesAdminList();
  if (tabName === 'tab-exams') { renderExamsAdminList(); renderRegradeRequestsAdminList(); }
  if (tabName === 'tab-dictionary') renderDictionaryAdminList();
}

/* =============================
   Authentication
   ============================= */
function loginStudent(username, password){
  const s = appData.students.find(x=>x.username===username && x.password===password);
  if (!s) { alert('Nom d\'utilisateur ou mot de passe incorrect'); return; }
  appData.currentUser = s; 
  appData.isAdmin = false; 
  saveData(); 
  refreshUI(); 
  if ($('studentLoginModal')) $('studentLoginModal').style.display='none'; 
  switchStudentTab('dashboard');
}

function loginAdmin(username, password){
  if (username === 'admin' && password === 'admin123') {
    appData.currentUser = { id:'admin', fullname:'Administrateur' }; 
    appData.isAdmin = true; 
    saveData(); 
    refreshUI(); 
  if ($('loginModal')) $('loginModal').style.display='none'; 
    switchAdminTab('tab-dashboard'); 
    return;
  }
  alert('Nom d\'utilisateur ou mot de passe incorrect');
}

/* =============================
   نظام الـ Quiz المحسن - الجزء الرئيسي
   ============================= */

/* =============================
   عرض قائمة الـ Quiz للطالب
   ============================= */
function renderQuizListForStudent() {
  const container = $('studentQuizList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!appData.quizzes || appData.quizzes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h3 style="margin: 0 0 8px 0;">لا توجد اختبارات متاحة حالياً</h3>
        <p style="margin: 0;">سيتم إضافة اختبارات جديدة قريباً</p>
      </div>
    `;
    return;
  }
  
  appData.quizzes.forEach(quiz => {
    const studentId = appData.currentUser?.id;
    const previousAttempt = studentId ? appData.responses[studentId]?.[quiz.id] : null;
    const canRetake = quiz.allowMultipleAttempts || !previousAttempt;
    
    const quizCard = document.createElement('div');
    quizCard.className = 'quiz-card';
    quizCard.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid #e1e5e9;
    `;
    
    quizCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #2c3e50; flex: 1;">${escapeHtml(quiz.title)}</h3>
        <span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">
          ${quiz.questions.length} أسئلة
        </span>
      </div>
      <div style="margin-bottom: 12px;">
        <p style="color: #7f8c8d; margin: 0 0 12px 0;">${quiz.description || 'اختبار تقييمي'}</p>
        <div style="display: flex; gap: 16px; font-size: 14px; color: #95a5a6;">
          <span>⏱ ${quiz.durationMinutes} دقيقة</span>
          <span>🔄 ${quiz.allowMultipleAttempts ? 'محاولات متعددة' : 'محاولة واحدة'}</span>
          ${previousAttempt ? `<span>🎯 آخر نتيجة: ${previousAttempt.percentage}%</span>` : ''}
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button class="start-quiz-btn" data-quiz-id="${quiz.id}" 
          style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; flex: 1;">
          ${canRetake ? 'بدء الاختبار' : 'معاينة النتائج'}
        </button>
        <button class="preview-quiz-btn" data-quiz-id="${quiz.id}"
          style="background: #ecf0f1; color: #2c3e50; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; flex: 1;">
          معاينة الأسئلة
        </button>
      </div>
    `;
    
    container.appendChild(quizCard);
  });
  
  // إضافة الأحداث للأزرار
  container.querySelectorAll('.start-quiz-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const quizId = e.target.getAttribute('data-quiz-id');
      startQuizForStudent(quizId);
    });
  });
  
  container.querySelectorAll('.preview-quiz-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const quizId = e.target.getAttribute('data-quiz-id');
      previewQuiz(quizId);
    });
  });
}

/* =============================
   بدء الاختبار للطالب
   ============================= */
function startQuizForStudent(quizId) {
  if (!appData.currentUser) {
    alert('يجب تسجيل الدخول أولاً');
    if ($('studentLoginModal')) $('studentLoginModal').style.display = 'block';
    return;
  }
  
  const quiz = appData.quizzes.find(q => q.id === quizId);
  if (!quiz) {
    alert('الاختبار غير موجود');
    return;
  }
  
  // التحقق من المحاولات السابقة
  const studentId = appData.currentUser.id;
  const previousAttempt = appData.responses[studentId]?.[quizId];
  
  if (previousAttempt && !quiz.allowMultipleAttempts) {
    if (!confirm('لقد أجريت هذا الاختبار من قبل ولا يمكن إعادة المحاولة. هل تريد معاينة النتائج؟')) {
      return;
    }
    showQuizResultsPage(quizId);
    return;
  }
  
  if (!confirm(`هل أنت مستعد لبدء الاختبار؟\n\n📝 عدد الأسئلة: ${quiz.questions.length}\n⏱ المدة: ${quiz.durationMinutes} دقيقة\n🎯 ${previousAttempt ? 'محاولة سابقة: ' + previousAttempt.percentage + '%' : 'أول محاولة'}`)) {
    return;
  }
  
  currentQuiz = quiz;
  currentQuestionIndex = 0;
  userAnswers = {};
  quizStartTime = Date.now();
  
  // تهيئة المؤقت
  timeLeft = quiz.durationMinutes * 60;
  startTimer();
  
  // عرض واجهة الاختبار
  showQuizInterface();
  displayCurrentQuestion();
}

/* =============================
   عرض واجهة الاختبار
   ============================= */
function showQuizInterface() {
  // إخفاء كل الأقسام
  document.querySelectorAll('.page-section, .student-tab-content').forEach(el => {
    el.style.display = 'none';
  });
  
  // إنشاء واجهة الاختبار إذا لم تكن موجودة
  let quizInterface = $('quiz-interface');
  if (!quizInterface) {
    quizInterface = document.createElement('div');
    quizInterface.id = 'quiz-interface';
    document.body.appendChild(quizInterface);
  }
  
  quizInterface.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f8f9fa;
    z-index: 1000;
    overflow-y: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;
  
  quizInterface.innerHTML = `
    <div style="background: white; padding: 16px 24px; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="margin: 0 0 8px 0; color: #2c3e50;">${escapeHtml(currentQuiz.title)}</h2>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="color: #7f8c8d;">السؤال <span id="current-q-number">1</span> من ${currentQuiz.questions.length}</span>
          <div style="width: 200px; height: 6px; background: #ecf0f1; border-radius: 3px; overflow: hidden;">
            <div id="quiz-progress-fill" style="height: 100%; background: #3498db; transition: width 0.3s ease; width: ${(1/currentQuiz.questions.length)*100}%;"></div>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <div id="quiz-timer" style="background: ${timeLeft < 300 ? '#e74c3c' : '#2ecc71'}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
          ⏱ ${formatTime(timeLeft)}
        </div>
        <button id="exit-quiz-btn" style="background: #95a5a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
          خروج
        </button>
      </div>
    </div>
    
    <div style="max-width: 800px; margin: 24px auto; padding: 0 20px;">
      <div id="question-container" style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- سيتم ملؤه ديناميكياً -->
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0;">
        <button id="prev-btn" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; min-width: 100px;" disabled>
          السابق
        </button>
        
        <div id="question-indicators" style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
          <!-- سيتم ملؤه ديناميكياً -->
        </div>
        
        <button id="next-btn" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; min-width: 100px;">
          التالي
        </button>
      </div>
      
      <div style="text-align: center;">
        <button id="submit-quiz-btn" style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">
          إنهاء الاختبار
        </button>
      </div>
    </div>
  `;
  
  quizInterface.style.display = 'block';
  
  // إضافة الأحداث
  $('prev-btn').addEventListener('click', goToPreviousQuestion);
  $('next-btn').addEventListener('click', goToNextQuestion);
  $('submit-quiz-btn').addEventListener('click', submitQuiz);
  $('exit-quiz-btn').addEventListener('click', exitQuiz);
  
  // إنشاء مؤشرات الأسئلة
  createQuestionIndicators();
}

/* =============================
   عرض السؤال الحالي
   ============================= */
function displayCurrentQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];
  const container = $('question-container');
  
  if (!container) return;
  
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: #2c3e50;">السؤال ${currentQuestionIndex + 1}</h3>
        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
          ${question.points} نقطة
        </span>
      </div>
      <div style="font-size: 18px; line-height: 1.6; color: #2c3e50;">
        ${escapeHtml(question.question)}
      </div>
    </div>
    
    <div id="options-container">
      ${renderOptions(question)}
    </div>
    
    ${question.feedback ? `
      <div style="margin-top: 16px; padding: 12px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
        <strong>💡 ملاحظة:</strong> ${escapeHtml(question.feedback)}
      </div>
    ` : ''}
  `;
  
  // تحديث واجهة المستخدم
  updateQuizUI();
  
  // تحميل الإجابة السابقة إن وجدت
  loadPreviousAnswer();
}

/* =============================
   عرض خيارات الإجابة
   ============================= */
function renderOptions(question) {
  if (question.type === 'single') {
    return question.options.map((option, index) => `
      <div class="option-radio" style="display: flex; align-items: center; padding: 12px 16px; border: 2px solid #e1e5e9; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 8px;">
        <input type="radio" id="option-${index}" name="quiz-answer" value="${index}" style="margin-right: 12px;">
        <label for="option-${index}" style="display: flex; align-items: center; cursor: pointer; width: 100%;">
          <span style="display: inline-block; width: 24px; height: 24px; background: #3498db; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-weight: bold;">
            ${String.fromCharCode(65 + index)}
          </span>
          <span>${escapeHtml(option)}</span>
        </label>
      </div>
    `).join('');
  } else {
    return question.options.map((option, index) => `
      <div class="option-checkbox" style="display: flex; align-items: center; padding: 12px 16px; border: 2px solid #e1e5e9; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 8px;">
        <input type="checkbox" id="option-${index}" name="quiz-answer" value="${index}" style="margin-right: 12px;">
        <label for="option-${index}" style="display: flex; align-items: center; cursor: pointer; width: 100%;">
          <span style="display: inline-block; width: 24px; height: 24px; background: #9b59b6; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-weight: bold;">
            ${String.fromCharCode(65 + index)}
          </span>
          <span>${escapeHtml(option)}</span>
        </label>
      </div>
    `).join('');
  }
}

/* =============================
   تحميل الإجابة السابقة
   ============================= */
function loadPreviousAnswer() {
  const questionId = currentQuiz.questions[currentQuestionIndex].id;
  const savedAnswer = userAnswers[questionId];
  
  if (savedAnswer !== undefined) {
    if (Array.isArray(savedAnswer)) {
      // إجابة متعددة
      savedAnswer.forEach(index => {
        const checkbox = $(`option-${index}`);
        if (checkbox) checkbox.checked = true;
      });
    } else {
      // إجابة وحيدة
      const radio = $(`option-${savedAnswer}`);
      if (radio) radio.checked = true;
    }
  }
  
  // إضافة أحداث للتغيير
  const options = document.querySelectorAll('#options-container input');
  options.forEach(option => {
    option.addEventListener('change', saveCurrentAnswer);
  });
  
  // إضافة تأثير hover
  const optionDivs = document.querySelectorAll('.option-radio, .option-checkbox');
  optionDivs.forEach(div => {
    div.addEventListener('mouseenter', function() {
      this.style.borderColor = '#3498db';
      this.style.background = '#f8f9fa';
    });
    div.addEventListener('mouseleave', function() {
      if (!this.querySelector('input').checked) {
        this.style.borderColor = '#e1e5e9';
        this.style.background = 'white';
      }
    });
  });
}

/* =============================
   حفظ الإجابة الحالية
   ============================= */
function saveCurrentAnswer() {
  const question = currentQuiz.questions[currentQuestionIndex];
  const questionId = question.id;
  
  if (question.type === 'single') {
    const selected = document.querySelector('input[name="quiz-answer"]:checked');
    userAnswers[questionId] = selected ? parseInt(selected.value) : null;
    
    // تحديث المظهر
    document.querySelectorAll('.option-radio').forEach(div => {
      const input = div.querySelector('input');
      if (input.checked) {
        div.style.borderColor = '#27ae60';
        div.style.background = '#d5f4e6';
      } else {
        div.style.borderColor = '#e1e5e9';
        div.style.background = 'white';
      }
    });
  } else {
    const selected = Array.from(document.querySelectorAll('input[name="quiz-answer"]:checked'))
      .map(input => parseInt(input.value));
    userAnswers[questionId] = selected;
    
    // تحديث المظهر
    document.querySelectorAll('.option-checkbox').forEach(div => {
      const input = div.querySelector('input');
      if (input.checked) {
        div.style.borderColor = '#9b59b6';
        div.style.background = '#f4ecf7';
      } else {
        div.style.borderColor = '#e1e5e9';
        div.style.background = 'white';
      }
    });
  }
  
  // تحديث مؤشر السؤال
  updateQuestionIndicator(currentQuestionIndex, userAnswers[questionId] !== null && 
    (Array.isArray(userAnswers[questionId]) ? userAnswers[questionId].length > 0 : true));
}

/* =============================
   التنقل بين الأسئلة
   ============================= */
function goToPreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayCurrentQuestion();
  }
}

function goToNextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    displayCurrentQuestion();
  }
}

/* =============================
   إنهاء الاختبار
   ============================= */
function submitQuiz() {
  const unanswered = getUnansweredQuestions();
  
  if (unanswered.length > 0) {
    if (!confirm(`لديك ${unanswered.length} أسئلة لم تتم الإجابة عليها. هل تريد إنهاء الاختبار مع ذلك؟`)) {
      return;
    }
  }
  
  if (!confirm('هل أنت متأكد من إنهاء الاختبار؟ لا يمكنك العودة بعد الإنهاء.')) {
    return;
  }
  
  clearInterval(quizTimer);
  showQuizResults();
}

/* =============================
   الخروج من الاختبار
   ============================= */
function exitQuiz() {
  if (confirm('هل تريد الخروج من الاختبار؟ سيتم فقدان تقدمك الحالي.')) {
    clearInterval(quizTimer);
    hideQuizInterface();
    switchStudentTab('quiz');
  }
}

/* =============================
   إخفاء واجهة الاختبار
   ============================= */
function hideQuizInterface() {
  const quizInterface = $('quiz-interface');
  if (quizInterface) {
    quizInterface.style.display = 'none';
  }
}

/* =============================
   المؤقت
   ============================= */
function startTimer() {
  quizTimer = setInterval(() => {
    timeLeft--;
    
    if ($('quiz-timer')) {
      $('quiz-timer').textContent = `⏱ ${formatTime(timeLeft)}`;
      
      // تغيير اللون عندما يقل الوقت
      if (timeLeft < 300) { // أقل من 5 دقائق
        $('quiz-timer').style.background = '#e74c3c';
      } else if (timeLeft < 600) { // أقل من 10 دقائق
        $('quiz-timer').style.background = '#f39c12';
      }
    }
    
    if (timeLeft <= 0) {
      clearInterval(quizTimer);
      alert('انتهى الوقت!');
      submitQuiz();
    }
  }, 1000);
}

/* =============================
   حساب النتائج
   ============================= */
function calculateResults() {
  let totalPoints = 0;
  let earnedPoints = 0;
  const results = [];
  
  currentQuiz.questions.forEach(question => {
    totalPoints += question.points;
    const userAnswer = userAnswers[question.id];
    const isCorrect = checkAnswer(question, userAnswer);
    
    if (isCorrect) {
      earnedPoints += question.points;
    }
    
    results.push({
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.correctIndices,
      isCorrect: isCorrect,
      points: question.points,
      earnedPoints: isCorrect ? question.points : 0,
      feedback: question.feedback,
      type: question.type
    });
  });
  
  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  const timeSpent = Math.round((Date.now() - quizStartTime) / 1000); // بالثواني
  
  // حفظ النتائج
  const studentId = appData.currentUser.id;
  if (!appData.responses[studentId]) {
    appData.responses[studentId] = {};
  }
  
  appData.responses[studentId][currentQuiz.id] = {
    timestamp: Date.now(),
    score: earnedPoints,
    totalScore: totalPoints,
    percentage: percentage,
    timeSpent: timeSpent,
    answers: userAnswers
  };
  
  saveData();
  
  return {
    earnedPoints,
    totalPoints,
    percentage,
    timeSpent,
    results
  };
}

/* =============================
   التحقق من الإجابة
   ============================= */
function checkAnswer(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }
  
  const correctAnswers = question.correctIndices;
  
  if (question.type === 'single') {
    return correctAnswers.includes(userAnswer);
  } else {
    if (!Array.isArray(userAnswer) || userAnswer.length !== correctAnswers.length) {
      return false;
    }
    
    return userAnswer.every(answer => correctAnswers.includes(answer)) &&
           correctAnswers.every(answer => userAnswer.includes(answer));
  }
}

/* =============================
   عرض النتائج
   ============================= */
function showQuizResults() {
  const results = calculateResults();
  const container = $('question-container');
  
  if (!container) return;
  
  const timeSpentFormatted = `${Math.floor(results.timeSpent / 60)}:${(results.timeSpent % 60).toString().padStart(2, '0')}`;
  
  container.innerHTML = `
    <div style="text-align: center;">
      <div style="margin-bottom: 32px;">
        <h2 style="color: #2c3e50; margin-bottom: 24px;">نتيجة الاختبار</h2>
        <div style="width: 120px; height: 120px; border-radius: 50%; background: ${results.percentage >= 50 ? '#27ae60' : '#e74c3c'}; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 24px; font-weight: bold;">
          <span style="font-size: 24px;">${results.percentage}%</span>
          <span style="font-size: 14px;">${results.earnedPoints}/${results.totalPoints}</span>
        </div>
        <div style="color: #7f8c8d;">
          <p>الوقت المستغرق: ${timeSpentFormatted}</p>
          <p>الحالة: ${results.percentage >= 50 ? 'ناجح 🎉' : 'يحتاج تحسين 💪'}</p>
        </div>
      </div>
      
      <div style="text-align: left; max-width: 600px; margin: 0 auto;">
        <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px;">تفاصيل الإجابات:</h3>
        <div style="max-height: 400px; overflow-y: auto;">
          ${results.results.map((result, index) => `
            <div style="padding: 16px; border-radius: 8px; margin-bottom: 16px; background: ${result.isCorrect ? '#d5f4e6' : '#fadbd8'}; border-left: 4px solid ${result.isCorrect ? '#27ae60' : '#e74c3c'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: bold;">السؤال ${index + 1}</span>
                <span style="background: ${result.isCorrect ? '#27ae60' : '#e74c3c'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                  ${result.isCorrect ? '✓' : '✗'} ${result.earnedPoints}/${result.points}
                </span>
              </div>
              <div style="margin-bottom: 8px; font-weight: 500;">${escapeHtml(result.question)}</div>
              <div style="font-size: 14px;">
                <div style="margin-bottom: 4px;"><strong>إجابتك:</strong> ${formatUserAnswer(result.userAnswer, currentQuiz.questions[index].options, result.type)}</div>
                <div style="margin-bottom: 4px;"><strong>الإجابة الصحيحة:</strong> ${formatCorrectAnswer(result.correctAnswer, currentQuiz.questions[index].options)}</div>
                ${result.feedback ? `
                  <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 4px;">
                    <strong>💡 شرح:</strong> ${escapeHtml(result.feedback)}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: center;">
        <button id="retry-quiz-btn" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
          إعادة الاختبار
        </button>
        <button id="back-to-quizzes-btn" style="background: #95a5a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
          العودة إلى القائمة
        </button>
      </div>
    </div>
  `;
  
  // إضافة الأحداث
  $('retry-quiz-btn').addEventListener('click', () => {
    if (currentQuiz.allowMultipleAttempts) {
      startQuizForStudent(currentQuiz.id);
    } else {
      alert('لا يمكن إعادة هذا الاختبار. المسموح بمحاولة واحدة فقط.');
    }
  });
  
  $('back-to-quizzes-btn').addEventListener('click', () => {
    hideQuizInterface();
    switchStudentTab('quiz');
  });
}

/* =============================
   عرض صفحة النتائج
   ============================= */
function showQuizResultsPage(quizId) {
  const quiz = appData.quizzes.find(q => q.id === quizId);
  const studentId = appData.currentUser.id;
  const attempt = appData.responses[studentId]?.[quizId];
  
  if (!attempt) {
    alert('لا توجد نتائج سابقة لهذا الاختبار');
    return;
  }
  
  const container = $('studentQuizList');
  if (!container) return;
  
  container.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2c3e50;">نتيجة الاختبار: ${escapeHtml(quiz.title)}</h2>
        <div style="width: 100px; height: 100px; border-radius: 50%; background: ${attempt.percentage >= 50 ? '#27ae60' : '#e74c3c'}; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 16px; font-weight: bold;">
          <span style="font-size: 20px;">${attempt.percentage}%</span>
          <span style="font-size: 12px;">${attempt.score}/${attempt.totalScore}</span>
        </div>
        <p style="color: #7f8c8d;">تاريخ الإجراء: ${new Date(attempt.timestamp).toLocaleString('ar-EG')}</p>
      </div>
      
      <button onclick="renderQuizListForStudent()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
        العودة إلى قائمة الاختبارات
      </button>
    </div>
  `;
}

/* =============================
   دوال مساعدة للـ Quiz
   ============================= */
function formatUserAnswer(userAnswer, options, type) {
  if (userAnswer === null || userAnswer === undefined) {
    return '<span style="color: #e74c3c;">لم تتم الإجابة</span>';
  }
  
  if (Array.isArray(userAnswer)) {
    if (userAnswer.length === 0) {
      return '<span style="color: #e74c3c;">لم تتم الإجابة</span>';
    }
    return userAnswer.map(index => 
      `<span style="color: #e74c3c;">${String.fromCharCode(65 + index)}. ${options[index]}</span>`
    ).join('، ');
  } else {
    return `<span style="color: #e74c3c;">${String.fromCharCode(65 + userAnswer)}. ${options[userAnswer]}</span>`;
  }
}

function formatCorrectAnswer(correctIndices, options) {
  return correctIndices.map(index => 
    `<span style="color: #27ae60;">${String.fromCharCode(65 + index)}. ${options[index]}</span>`
  ).join('، ');
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateQuizUI() {
  // تحديث رقم السؤال
  if ($('current-q-number')) {
    $('current-q-number').textContent = currentQuestionIndex + 1;
  }
  
  // تحديث شريط التقدم
  if ($('quiz-progress-fill')) {
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    $('quiz-progress-fill').style.width = `${progress}%`;
  }
  
  // تحديث أزرار التنقل
  if ($('prev-btn')) {
    $('prev-btn').disabled = currentQuestionIndex === 0;
  }
  
  if ($('next-btn')) {
    $('next-btn').disabled = currentQuestionIndex === currentQuiz.questions.length - 1;
  }
}

function createQuestionIndicators() {
  const container = $('question-indicators');
  if (!container) return;
  
  container.innerHTML = '';
  
  currentQuiz.questions.forEach((_, index) => {
    const indicator = document.createElement('button');
    indicator.textContent = index + 1;
    indicator.style.cssText = `
      width: 36px;
      height: 36px;
      border: 2px solid #bdc3c7;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all 0.2s ease;
    `;
    
    indicator.addEventListener('click', () => {
      currentQuestionIndex = index;
      displayCurrentQuestion();
    });
    
    container.appendChild(indicator);
  });
  
  updateAllQuestionIndicators();
}

function updateAllQuestionIndicators() {
  const indicators = document.querySelectorAll('#question-indicators button');
  indicators.forEach((indicator, index) => {
    const questionId = currentQuiz.questions[index].id;
    const answered = userAnswers[questionId] !== null && 
      (Array.isArray(userAnswers[questionId]) ? userAnswers[questionId].length > 0 : true);
    
    if (index === currentQuestionIndex) {
      indicator.style.borderColor = '#3498db';
      indicator.style.background = '#3498db';
      indicator.style.color = 'white';
    } else if (answered) {
      indicator.style.borderColor = '#27ae60';
      indicator.style.background = '#27ae60';
      indicator.style.color = 'white';
    } else {
      indicator.style.borderColor = '#bdc3c7';
      indicator.style.background = 'white';
      indicator.style.color = '#2c3e50';
    }
  });
}

function updateQuestionIndicator(index, answered) {
  const indicators = document.querySelectorAll('#question-indicators button');
  if (indicators[index]) {
    if (index === currentQuestionIndex) {
      indicators[index].style.borderColor = '#3498db';
      indicators[index].style.background = '#3498db';
      indicators[index].style.color = 'white';
    } else if (answered) {
      indicators[index].style.borderColor = '#27ae60';
      indicators[index].style.background = '#27ae60';
      indicators[index].style.color = 'white';
    } else {
      indicators[index].style.borderColor = '#bdc3c7';
      indicators[index].style.background = 'white';
      indicators[index].style.color = '#2c3e50';
    }
  }
}

function getUnansweredQuestions() {
  return currentQuiz.questions.filter((question, index) => {
    const answer = userAnswers[question.id];
    return answer === null || answer === undefined || 
          (Array.isArray(answer) && answer.length === 0);
  });
}

function previewQuiz(quizId) {
  const quiz = appData.quizzes.find(q => q.id === quizId);
  if (!quiz) return;
  
  const previewHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 20px; position: relative;">
        <button onclick="this.closest('div').remove()" style="position: absolute; top: 16px; right: 16px; background: #e74c3c; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">×</button>
        
        <h3 style="margin: 0 0 16px 0; color: #2c3e50;">${escapeHtml(quiz.title)}</h3>
        <p style="color: #7f8c8d; margin-bottom: 24px;">${quiz.description || ''}</p>
        
        <div>
          ${quiz.questions.map((question, index) => `
            <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e1e5e9; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #2c3e50;">السؤال ${index + 1} (${question.points} نقطة)</h4>
              <p style="margin: 0 0 12px 0;">${escapeHtml(question.question)}</p>
              <div>
                ${question.options.map((option, optIndex) => `
                  <div style="display: flex; align-items: center; padding: 8px; margin-bottom: 4px; border-radius: 4px; background: ${question.correctIndices.includes(optIndex) ? '#d5f4e6' : '#f8f9fa'};">
                    <span style="display: inline-block; width: 20px; height: 20px; background: ${question.correctIndices.includes(optIndex) ? '#27ae60' : '#95a5a6'}; color: white; border-radius: 50%; text-align: center; line-height: 20px; margin-right: 8px; font-size: 12px; font-weight: bold;">
                      ${String.fromCharCode(65 + optIndex)}
                    </span>
                    <span>${escapeHtml(option)}</span>
                    ${question.correctIndices.includes(optIndex) ? '<span style="margin-right: auto; color: #27ae60; font-weight: bold;">✓</span>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <button onclick="this.closest('div').remove()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 16px;">
          إغلاق
        </button>
      </div>
    </div>
  `;
  
  const previewDiv = document.createElement('div');
  previewDiv.innerHTML = previewHTML;
  document.body.appendChild(previewDiv);
}

// =============================
// باقي الدوال الأساسية (يجب أن تبقى كما هي)
// =============================

/* =============================
   Refresh UI / render lists
   ============================= */
function refreshUI(){
  if ($('announcementText')) $('announcementText').textContent = appData.announcement.text || '';
  if (appData.announcement.image){ 
    if ($('announcementImage')) { 
      $('announcementImage').src = appData.announcement.image; 
      $('announcementImage').style.display='block'; 
    } 
    if ($('announcementImagePreview')) { 
      $('announcementImagePreview').src = appData.announcement.image; 
      $('announcementImagePreview').style.display='block'; 
    } 
    if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='inline-block'; 
  } else { 
    if ($('announcementImage')) $('announcementImage').style.display='none'; 
    if ($('announcementImagePreview')) $('announcementImagePreview').style.display='none'; 
    if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='none'; 
  }

  if ($('admin-panel')) {
    $('admin-panel').style.display = appData.isAdmin ? 'block' : 'none';
  }
  
  if ($('student-dashboard')) {
    $('student-dashboard').style.display = (appData.currentUser && !appData.isAdmin) ? 'block' : 'none';
  }
  
  if (!appData.currentUser) {
    hideAllMainSections();
    if ($('home-section')) $('home-section').style.display = 'block';
  }

  if (appData.currentUser && !appData.isAdmin && $('studentWelcome')) {
    $('studentWelcome').textContent = 'Bienvenue, ' + (appData.currentUser.fullname || '');
  }

  if ($('stats-students')) $('stats-students').textContent = appData.students.length;
  if ($('stats-quiz')) $('stats-quiz').textContent = appData.quizzes.reduce((acc,q)=>acc+q.questions.length,0);
  if ($('stats-dictionary')) $('stats-dictionary').textContent = appData.dictionary.length;
  if ($('stats-grades')) $('stats-grades').textContent = appData.grades.length;
  if ($('stats-messages')) $('stats-messages').textContent = appData.messages.length;
  if ($('stats-latex')) $('stats-latex').textContent = appData.latexContents.length;

  populateStudentsSelect();
  populateAdminSelectQuiz();

  renderAll();
}

// ... (بقية الدوال الأساسية تبقى كما هي من الكود الأصلي)
// مثل: adminCreateQuiz, adminAddQuestion, renderQuizAdminListDetailed, إلخ.

// دوال الـ Quiz القديمة - نعطلها مؤقتاً
function renderQuizList(){
  // نستخدم النسخة المحسنة بدلاً من هذه
  console.log('Using enhanced quiz system');
}

function startQuiz(quizId){
  // نستخدم النسخة المحسنة بدلاً من هذه
  startQuizForStudent(quizId);
}

// ... (بقية الدوال الأساسية)

/* =============================
   Utility & renderAll
   ============================= */
function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function renderAll(){
  renderQuizAdminListDetailed();
  renderQuizListForStudent(); // استخدام النسخة المحسنة
  renderLessons(); renderExercises(); renderExams();
  renderLessonsAdminList(); renderExercisesAdminList(); renderExamsAdminList();
  renderDictionary();
  loadStudentsTable();
  loadGradesTable();
  loadLatexAdminList();
  renderLatexListForStudents();
  renderStudentMessages();
  renderFrontSlider();
  renderDictionaryAdminList();
}

// ... (بقية الدوال الأساسية)

// نهاية الكود 

/* =============================
   End of file
   ============================= */ 
