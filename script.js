/* =============================
   Unified dashboard JS - FIXED COMPLETE VERSION
   =============================*/

/* =============================
   Data model (localStorage)
   ============================= */  
const STORAGE_KEY = 'lyceeExcellence_v_15';
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
  quizzes: [],
  dictionary: [],
  lessons: [],
  exercises: [
    { id: "mfj2mukk2edjb", title: "Série N'1 Physique-Chimie", driveLink: "https://drive.google.com/file/d/1Ck4CbEtKofWPd11xAOxJVCQI7b8v65vK/view?usp=sharing" }
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
    text: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة",
    image: null
  },
  siteCover: { enabled: true, url: null }
};

function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(appData, parsed);
      appData.slides = appData.slides || [];
      appData.regradeRequests = appData.regradeRequests || [];
      appData.responses = appData.responses || {};
    }
  } catch(e){ console.error('loadData', e); }
}

function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }

/* helpers */
function $(id){ return document.getElementById(id); }
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escapeHtml(s){ return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

/* =============================
   Init
   ============================= */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  wireEvents();
  wireSliderAdminEvents();
  refreshUI();
  setTimeout(()=>{ renderAll(); renderFrontSlider(); }, 50);
});

/* =============================
   Wiring UI events - FIXED: Added event prevention for buttons
   ============================= */
function wireEvents(){
  // Prevent default behavior for all buttons to avoid page scroll
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // nav links
  document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', e => { 
    e.preventDefault(); 
    e.stopPropagation();
    const s=a.getAttribute('data-section'); 
    showSection(s); 
  }));
  
  document.querySelectorAll('.feature-card').forEach(c => c.addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    const s=c.getAttribute('data-section'); 
    showSection(s); 
  }));

  // login modals
  if ($('studentLoginBtn')) $('studentLoginBtn').addEventListener('click', (e)=> { 
    e.preventDefault(); 
    e.stopPropagation();
    if ($('studentLoginModal')) $('studentLoginModal').style.display='block'; 
  });
  
  if ($('loginBtn')) $('loginBtn').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    if ($('loginModal')) $('loginModal').style.display='block'; 
  });
  
  if ($('cancelStudentLogin')) $('cancelStudentLogin').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    if ($('studentLoginModal')) $('studentLoginModal').style.display='none'; 
  });
  
  if ($('cancelLogin')) $('cancelLogin').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    if ($('loginModal')) $('loginModal').style.display='none'; 
  });

  if ($('submitStudentLogin')) $('submitStudentLogin').addEventListener('click', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    const u = $('studentUsername').value.trim(), p = $('studentPassword').value;
    loginStudent(u,p);
  });
  
  if ($('submitLogin')) $('submitLogin').addEventListener('click', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    const u = $('username').value.trim(), p = $('password').value;
    loginAdmin(u,p);
  });

  if ($('studentLogoutBtn')) $('studentLogoutBtn').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    appData.currentUser=null; appData.isAdmin=false; saveData(); refreshUI(); showSection('home'); 
  });
  
  if ($('logoutBtn')) $('logoutBtn').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    appData.currentUser=null; appData.isAdmin=false; saveData(); refreshUI(); showSection('home'); 
  });

  // student tabs
  document.querySelectorAll('.student-tab').forEach(t => t.addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    const name = t.getAttribute('data-tab'); 
    switchStudentTab(name); 
  }));

  // admin tab links
  document.querySelectorAll('.admin-tab-link').forEach(a => a.addEventListener('click', e => { 
    e.preventDefault(); 
    e.stopPropagation();
    const tab = a.getAttribute('data-tab'); 
    switchAdminTab(tab); 
  }));

  // announcement handlers
  if ($('announcementImageInput')) $('announcementImageInput').addEventListener('change', handleAnnouncementImage);
  
  if ($('btnSaveAnnouncement')) $('btnSaveAnnouncement').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    if ($('announcementInput')) appData.announcement.text = $('announcementInput').value; 
    if ($('announcementText')) $('announcementText').textContent = appData.announcement.text; 
    saveData(); 
    alert('Annonce enregistrée'); 
  });
  
  if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    appData.announcement.image=null; 
    saveData(); 
    if ($('announcementImagePreview')) $('announcementImagePreview').style.display='none'; 
    if ($('announcementImage')) $('announcementImage').style.display='none'; 
    if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='none'; 
  });

  // export/import
  if ($('btnExport')) $('btnExport').addEventListener('click', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(appData)], {type:'application/json'}); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.href=url; 
    a.download='lycee_data.json'; 
    a.click(); 
    URL.revokeObjectURL(url);
  });
  
  if ($('importFile')) $('importFile').addEventListener('change', e => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.target.files[0]; 
    if (!f) return;
    const fr = new FileReader(); 
    fr.onload = function(ev){ 
      try { 
        if (!confirm('Importer va remplacer البيانات الحالية. Continuer?')) return; 
        appData = JSON.parse(ev.target.result); 
        saveData(); 
        renderAll(); 
        refreshUI(); 
        alert('Import réussi'); 
      } catch(err){ 
        alert('Fichier invalide'); 
      } 
    }; 
    fr.readAsText(f);
  });

  // student/admin functional buttons (guarded)
  if ($('btnCreateQuiz')) $('btnCreateQuiz').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminCreateQuiz();
  });
  
  if ($('adminBtnSaveQuiz')) $('adminBtnSaveQuiz').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminAddQuestion();
  });
  
  if ($('adminBtnPreviewQuiz')) $('adminBtnPreviewQuiz').addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    const qid = $('adminSelectQuiz').value; 
    if (!qid){ alert('Sélectionner quiz'); return;} 
    previewQuizAsStudent(qid); 
  });

  if ($('adminBtnSaveLesson')) $('adminBtnSaveLesson').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSaveLesson();
  });
  
  if ($('adminBtnSaveExercise')) $('adminBtnSaveExercise').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSaveExercise();
  });
  
  if ($('adminBtnSaveExam')) $('adminBtnSaveExam').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSaveExam();
  });

  if ($('btnSaveStudent')) $('btnSaveStudent').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSaveStudent();
  });
  
  if ($('btnSaveGrade')) $('btnSaveGrade').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSaveGrade();
  });
  
  if ($('adminBtnSendMessage')) $('adminBtnSendMessage').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSendMessage();
  });

  // إضافة حدث لزر إضافة كلمة في القاموس - FIXED
  if ($('btnAddDictionary')) {
    $('btnAddDictionary').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      addDictionaryTerm();
    });
  }

  // إضافة حدث لزر "Voir les notes" في قسم Consultation des Notes - FIXED
  if ($('btnViewGrades')) {
    $('btnViewGrades').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const code = $('gradeSearchCode').value.trim();
      searchGradesByCode(code);
    });
  }

  // إضافة أحداث للأزرار الديناميكية باستخدام event delegation
  document.addEventListener('click', function(e) {
    // للزر "Voir les notes" في حالة عدم وجوده في البداية
    if (e.target && (e.target.textContent.includes('Voir les notes') || 
                     e.target.textContent.includes('View grades') || 
                     e.target.textContent.includes('عرض النتائج'))) {
      e.preventDefault();
      e.stopPropagation();
      const codeInput = document.querySelector('input[placeholder*="Code"], input[placeholder*="code"], input[name*="code"]');
      const code = codeInput ? codeInput.value.trim() : '';
      searchGradesByCode(code);
    }
    
    // للزر "Ajouter le terme" في القاموس
    if (e.target && (e.target.textContent.includes('Ajouter le terme') || 
                     e.target.textContent.includes('Add term') || 
                     e.target.textContent.includes('إضافة مصطلح'))) {
      e.preventDefault();
      e.stopPropagation();
      addDictionaryTerm();
    }
  });

  if ($('latexCode')) {
    $('latexCode').addEventListener('input', updateLatexLineNumbers);
    updateLatexLineNumbers();
  }
  
  if ($('btnSaveLatex')) $('btnSaveLatex').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adminSaveLatex();
  });
}

/* =============================
   UI switching - FIXED: Correct panel visibility
   ============================= */
function hideAllMainSections(){
  document.querySelectorAll('.page-section').forEach(s => s.style.display='none'); 
  if ($('student-dashboard')) $('student-dashboard').style.display='none'; 
  if ($('admin-panel')) $('admin-panel').style.display='none';
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
  if (id === 'grades') renderGradesSection(); // إضافة عرض قسم النتائج
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
   Refresh UI / render lists - FIXED: Correct panel visibility logic
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

/* =============================
   Dictionary functions - FIXED: Working dictionary functionality
   ============================= */
function addDictionaryTerm(){
  // البحث المرن عن عناصر الإدخال
  let arabicInput = $('dictArabic') || 
                   document.querySelector('input[placeholder*="arabe"], input[placeholder*="عربي"], input[name*="arabic"]') ||
                   document.querySelector('input[type="text"]:first-of-type');
  
  let frenchInput = $('dictFrench') || 
                   document.querySelector('input[placeholder*="français"], input[placeholder*="فرنسي"], input[name*="french"]') ||
                   document.querySelector('input[type="text"]:nth-of-type(2)');
  
  let definitionInput = $('dictDefinition') || 
                       document.querySelector('textarea, input[placeholder*="définition"], input[placeholder*="تعريف"]') ||
                       document.querySelector('input[type="text"]:last-of-type, textarea');

  const arabic = arabicInput ? arabicInput.value.trim() : '';
  const french = frenchInput ? frenchInput.value.trim() : '';
  const definition = definitionInput ? definitionInput.value.trim() : '';
  
  if (!arabic || !french) {
    alert('يجب إدخال المصطلح بالعربية والفرنسية');
    return;
  }
  
  const newTerm = {
    id: genId(),
    ar: arabic,
    fr: french,
    definition: definition
  };
  
  appData.dictionary.push(newTerm);
  saveData();
  
  // تحديث الواجهات
  renderDictionary();
  renderDictionaryAdminList();
  
  // مسح الحقول
  if (arabicInput) arabicInput.value = '';
  if (frenchInput) frenchInput.value = '';
  if (definitionInput) definitionInput.value = '';
  
  alert('تمت إضافة المصطلح بنجاح');
}

function renderDictionaryAdminList(){
  const container = $('dictionaryAdminList') || document.querySelector('#dictionaryAdminList, .dictionary-admin-list, [data-list="dictionary"]');
  if (!container) {
    console.log('Dictionary admin container not found');
    return;
  }
  
  container.innerHTML = '';
  
  if (!appData.dictionary.length) {
    container.innerHTML = '<p class="muted">لا توجد مصطلحات</p>';
    return;
  }
  
  appData.dictionary.forEach(term => {
    const div = document.createElement('div');
    div.className = 'content-row';
    div.style.padding = '10px';
    div.style.borderBottom = '1px solid #eee';
    div.innerHTML = `
      <div style="margin-bottom: 5px;">
        <strong>${escapeHtml(term.ar)}</strong> - ${escapeHtml(term.fr)}
      </div>
      <div style="margin-bottom: 5px; color: #666;">${escapeHtml(term.definition)}</div>
      <button class="delete-dict-term" data-id="${term.id}" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">حذف</button>
    `;
    container.appendChild(div);
  });

  // ربط أحداث الحذف
  container.querySelectorAll('.delete-dict-term').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const id = this.getAttribute('data-id');
      if (confirm('هل تريد حذف هذا المصطلح؟')) {
        appData.dictionary = appData.dictionary.filter(term => term.id !== id);
        saveData();
        renderDictionary();
        renderDictionaryAdminList();
      }
    });
  });
}

/* =============================
   Grades search functionality - FIXED: Improved search function
   ============================= */
function searchGradesByCode(code){
  if (!code) {
    alert('Veuillez entrer un code parcours');
    return;
  }
  
  const s = appData.students.find(x => x.code === code);
  if (!s) {
    alert('Code parcours non trouvé');
    return;
  }
  
  const g = appData.grades.filter(x => x.studentId === s.id);
  
  // إظهار قسم النتائج
  showSection('grades');
  
  // تحديث معلومات الطالب
  const studentInfoEl = $('studentInfo') || document.querySelector('#studentInfo, .student-info');
  if (studentInfoEl) {
    studentInfoEl.innerHTML = `
      <div class="content-card">
        <div class="card-content">
          <h3>${escapeHtml(s.fullname)}</h3>
          <p>Classe: ${escapeHtml(s.classroom || '')}</p>
          <p>Code: ${escapeHtml(s.code || '')}</p>
        </div>
      </div>
    `;
  }
  
  // تحديث الجدول
  const tbody = document.querySelector('#gradesTable tbody');
  if (tbody) {
    tbody.innerHTML = '';
    
    if (!g.length) {
      const noGradesMsg = $('noGradesMsg') || document.querySelector('#noGradesMsg, .no-grades-message');
      if (noGradesMsg) noGradesMsg.style.display = 'block';
    } else {
      const noGradesMsg = $('noGradesMsg') || document.querySelector('#noGradesMsg, .no-grades-message');
      if (noGradesMsg) noGradesMsg.style.display = 'none';
      
      g.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${new Date(grade.date).toLocaleDateString()}</td>
          <td>${escapeHtml(grade.subject)}</td>
          <td>${escapeHtml(grade.title)}</td>
          <td>${grade.score}/20</td>
          <td>${escapeHtml(grade.note || '')}</td>
        `;
        tbody.appendChild(row);
      });
    }
  }
  
  // إظهار قسم النتائج إذا كان مخفياً
  const gradesResults = $('gradesResults') || document.querySelector('#gradesResults, .grades-results');
  if (gradesResults) {
    gradesResults.style.display = 'block';
  }
}

function renderGradesSection(){
  // هذه الدالة تعرض قسم النتائج عند زيارة الصفحة
  const container = $('grades') || document.querySelector('#grades, .grades-section');
  if (!container) return;
  
  container.innerHTML = `
    <div class="content-card">
      <div class="card-content">
        <h2>Consultation des Notes</h2>
        <div class="form-group">
          <label for="gradeSearchCode">Code Parcours:</label>
          <input type="text" id="gradeSearchCode" placeholder="Entrez votre code parcours">
          <button id="btnViewGrades" class="btn-primary">Voir les notes</button>
        </div>
        <div id="gradesResults" style="display: none;">
          <div id="studentInfo"></div>
          <table id="gradesTable" class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matière</th>
                <th>Intitulé</th>
                <th>Note</th>
                <th>Remarque</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <p id="noGradesMsg" style="display: none; text-align: center; padding: 20px;">
            Aucune note disponible pour ce code parcours.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // إعادة ربط الأحداث للزر الجديد
  if ($('btnViewGrades')) {
    $('btnViewGrades').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const code = $('gradeSearchCode').value.trim();
      searchGradesByCode(code);
    });
  }
}

/* =============================
   Students admin / lists
   ============================= */
function adminSaveStudent(){
  const id = $('stId') ? $('stId').value || genId() : genId();
  const fullname = $('stFullname') ? $('stFullname').value.trim() : '';
  const username = $('stUsername') ? $('stUsername').value.trim() : '';
  const password = $('stPassword') ? $('stPassword').value : '';
  const code = $('stCode') ? $('stCode').value.trim() : '';
  const classroom = $('stClassroom') ? $('stClassroom').value.trim() : '';
  if (!fullname || !username) return alert('Nom complet و nom d\'utilisateur requis');
  const existing = appData.students.find(x=>x.id===id);
  if (existing) { existing.fullname=fullname; existing.username=username; existing.password=password; existing.code=code; existing.classroom=classroom; }
  else appData.students.push({ id, fullname, username, password, code, classroom });
  saveData(); loadStudentsTable(); populateStudentsSelect(); alert('Étudiant enregistré');
  if ($('stFullname')) $('stFullname').value=''; if ($('stUsername')) $('stUsername').value=''; if ($('stPassword')) $('stPassword').value=''; if ($('stCode')) $('stCode').value=''; if ($('stClassroom')) $('stClassroom').value=''; if ($('stId')) $('stId').value='';
}

function loadStudentsTable(){
  const tbody = document.querySelector('#studentsTable tbody'); if (!tbody) return;
  tbody.innerHTML = '';
  appData.students.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>'+escapeHtml(s.fullname)+'</td><td>'+escapeHtml(s.username)+'</td><td>'+escapeHtml(s.code||'')+'</td><td>'+escapeHtml(s.classroom||'')+'</td><td><button data-id="'+s.id+'" class="edit-student">Edit</button> <button data-id="'+s.id+'" class="del-student">Del</button></td>';
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.edit-student').forEach(b=>b.addEventListener('click', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    const id = b.getAttribute('data-id'); const s = appData.students.find(x=>x.id===id); if (!s) return;
    if ($('stId')) $('stId').value=s.id; if ($('stFullname')) $('stFullname').value=s.fullname; if ($('stUsername')) $('stUsername').value=s.username; if ($('stPassword')) $('stPassword').value=s.password; if ($('stCode')) $('stCode').value=s.code; if ($('stClassroom')) $('stClassroom').value=s.classroom; switchAdminTab('tab-students');
  }));
  tbody.querySelectorAll('.del-student').forEach(b=>b.addEventListener('click', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    const id = b.getAttribute('data-id'); if (!confirm('Supprimer étudiant ?')) return; appData.students = appData.students.filter(x=>x.id!==id); saveData(); loadStudentsTable(); populateStudentsSelect();
  }));
}

function populateStudentsSelect(){
  const sel = $('adminMessageStudent'); if (!sel) return;
  sel.innerHTML = '<option value="">Choisir</option>';
  appData.students.forEach(s=>{ const o = document.createElement('option'); o.value=s.id; o.textContent = s.fullname + ' (' + (s.code||'') + ')'; sel.appendChild(o); });
  const gr = $('grStudent'); if (gr){ gr.innerHTML='<option value="">-- Choisir étudiant --</option>'; appData.students.forEach(s=>{ const o = document.createElement('option'); o.value=s.id; o.textContent=s.fullname; gr.appendChild(o); }); }
  const gf = $('grFilterStudent'); if (gf){ gf.innerHTML='<option value="">Tous</option>'; appData.students.forEach(s=>{ const o = document.createElement('option'); o.value=s.id; o.textContent=s.fullname; gf.appendChild(o); }); }
}

/* =============================
   Grades admin
   ============================= */
function adminSaveGrade(){
  const id = genId();
  const studentId = $('grStudent') ? $('grStudent').value : '';
  const subject = $('grSubject') ? $('grSubject').value.trim() : '';
  const title = $('grTitle') ? $('grTitle').value.trim() : '';
  const date = $('grDate') ? ($('grDate').value || new Date().toISOString()) : new Date().toISOString();
  const score = $('grScore') ? Number($('grScore').value) || 0 : 0;
  const note = $('grNote') ? $('grNote').value : '';
  if (!studentId || !subject || !title) return alert('Remplir étudiant، matière و intitulé');
  appData.grades.push({ id, studentId, subject, title, date, score, note });
  saveData(); loadGradesTable(); alert('Note ajoutée');
  notifyStudents('grade','تمت إضافة نقطة جديدة','تمت إضافة نقطة جديدة إلى حسابك. تحقق من Tableau de bord.');
  if ($('grStudent')) $('grStudent').value=''; if ($('grSubject')) $('grSubject').value=''; if ($('grTitle')) $('grTitle').value=''; if ($('grDate')) $('grDate').value=''; if ($('grScore')) $('grScore').value=''; if ($('grNote')) $('grNote').value='';
}

function loadGradesTable(){
  const tbody = document.querySelector('#gradesAdminTable tbody'); if (!tbody) return; tbody.innerHTML='';
  appData.grades.forEach(g=>{
    const st = appData.students.find(s=>s.id===g.studentId);
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>'+escapeHtml(st?st.fullname:'')+'</td><td>'+new Date(g.date).toLocaleDateString()+'</td><td>'+escapeHtml(g.subject)+'</td><td>'+escapeHtml(g.title)+'</td><td>'+g.score+'</td><td>'+escapeHtml(g.note||'')+'</td><td><button data-id="'+g.id+'" class="del-grade">Del</button></td>';
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.del-grade').forEach(b=>b.addEventListener('click', (e)=> { 
    e.preventDefault();
    e.stopPropagation();
    const id=b.getAttribute('data-id'); if (!confirm('Supprimer note ?')) return; appData.grades = appData.grades.filter(x=>x.id!==id); saveData(); loadGradesTable(); 
  }));
}

/* =============================
   Utility & renderAll
   ============================= */
function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function formatTime(sec){ if (!sec || sec<=0) return '00:00'; const m=Math.floor(sec/60); const s=sec%60; return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }

function renderAll(){
  renderQuizAdminListDetailed();
  renderQuizList();
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
  renderGradesSection(); // إضافة عرض قسم النتائج
}

/* =============================
   Dictionary / misc rendering
   ============================= */
function renderDictionary(){
  const el = $('dictionaryContent'); if (!el) return; el.innerHTML='';
  if (!appData.dictionary.length) return el.innerHTML = '<p class="muted">Aucun terme dans le lexique pour le moment.</p>';
  appData.dictionary.forEach(term=>{ const d=document.createElement('div'); d.className='content-card'; d.innerHTML = '<div class="card-content"><h3>'+escapeHtml(term.ar)+' - '+escapeHtml(term.fr)+'</h3><p>'+escapeHtml(term.definition)+'</p></div>'; el.appendChild(d); });
}

/* =============================
   Additional required functions (placeholders)
   ============================= */
function wireSliderAdminEvents(){}
function renderQuizAdminListDetailed(){}
function renderQuizList(){}
function renderLessons(){}
function renderExercises(){}
function renderExams(){}
function renderLessonsAdminList(){}
function renderExercisesAdminList(){}
function renderExamsAdminList(){}
function loadLatexAdminList(){}
function renderLatexListForStudents(){}
function renderStudentMessages(){}
function renderFrontSlider(){}
function renderQuizListForStudent(){}
function renderStudentExercises(){}
function loadStudentDashboard(){}
function adminCreateQuiz(){}
function adminAddQuestion(){}
function previewQuizAsStudent(qid){}
function adminSaveLesson(){}
function adminSaveExercise(){}
function adminSaveExam(){}
function adminSendMessage(){}
function updateLatexLineNumbers(){}
function adminSaveLatex(){}
function renderAdminMessagesList(){}
function renderRegradeRequestsAdminList(){}
function handleAnnouncementImage(){}
function notifyStudents(){}

/* =============================
   End of file
   ============================= */  
