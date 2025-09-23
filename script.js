/* =============================
   Unified dashboard JS - COMPLETELY FIXED VERSION
   =============================*/

/* =============================
   Data model (localStorage)
   ============================= */  
const STORAGE_KEY = 'lyceeExcellence_v_20';
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
      Object.keys(parsed).forEach(key => {
        if (appData.hasOwnProperty(key)) {
          appData[key] = parsed[key];
        }
      });
    }
  } catch(e){ console.error('loadData', e); }
}

function saveData(){ 
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); 
  } catch(e) {
    console.error('saveData', e);
  }
}

/* helpers */
function $(id){ 
  if (typeof id === 'string') {
    return document.getElementById(id); 
  }
  return id;
}
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escapeHtml(s){ 
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* =============================
   Init - FIXED SCROLL ISSUE
   ============================= */
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== APPLICATION STARTING ===');
  
  // منع السلوك الافتراضي لجميع الأزرار والروابط في الصفحة
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // منع جميع الأزرار
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('Button prevented:', target.textContent || target.id);
      return false;
    }
    
    // منع جميع الروابط الداخلية
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href === '#' || href === '' || href === null || target.hasAttribute('data-section')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('Link prevented:', href);
        return false;
      }
    }
  }, true); // استخدام capture phase لمنع الأحداث مبكرًا

  loadData();
  wireEvents();
  refreshUI();
  
  // التأكد من أن الصفحة لا تنزلق للأعلى
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

/* =============================
   COMPLETE EVENT FIX - حل جذري لمشكلة الانتقال للأعلى
   ============================= */
function wireEvents(){
  console.log('=== WIRING EVENTS ===');
  
  // حل جذري: إعادة تعريف addEventListener لمنع السلوك الافتراضي
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    const wrappedListener = function(event) {
      if (type === 'click') {
        if (event.target.tagName === 'BUTTON' || 
            event.target.closest('button') || 
            (event.target.tagName === 'A' && 
             (event.target.getAttribute('href') === '#' || 
              event.target.hasAttribute('data-section')))) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      }
      listener.call(this, event);
    };
    return originalAddEventListener.call(this, type, wrappedListener, options);
  };

  // منع السلوك الافتراضي لجميع النماذج
  document.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }, true);

  // إصلاح شامل للروابط
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // جميع الروابط التي لها data-section
    if (target.hasAttribute('data-section') || target.closest('[data-section]')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const link = target.hasAttribute('data-section') ? target : target.closest('[data-section]');
      const section = link.getAttribute('data-section');
      if (section) {
        showSection(section);
      }
      return false;
    }
    
    // جميع الأزرار
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const button = target.tagName === 'BUTTON' ? target : target.closest('button');
      handleButtonClick(button);
      return false;
    }
    
    // الروابط التي تسبب المشكلة
    if (target.tagName === 'A' && target.getAttribute('href') === '#') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, true); // استخدام capture phase

  // أحداث تسجيل الدخول المحددة
  setupLoginEvents();
  setupNavigationEvents();
  setupFunctionalEvents();
}

/* =============================
   Login Events - FIXED
   ============================= */
function setupLoginEvents() {
  // تسجيل الدخول كطالب
  document.addEventListener('click', function(e) {
    if (e.target.id === 'studentLoginBtn' || e.target.closest('#studentLoginBtn')) {
      e.preventDefault();
      e.stopPropagation();
      const modal = $('studentLoginModal');
      if (modal) modal.style.display = 'block';
    }
    
    if (e.target.id === 'cancelStudentLogin' || e.target.closest('#cancelStudentLogin')) {
      e.preventDefault();
      e.stopPropagation();
      const modal = $('studentLoginModal');
      if (modal) modal.style.display = 'none';
    }
    
    if (e.target.id === 'submitStudentLogin' || e.target.closest('#submitStudentLogin')) {
      e.preventDefault();
      e.stopPropagation();
      const username = $('studentUsername') ? $('studentUsername').value.trim() : '';
      const password = $('studentPassword') ? $('studentPassword').value : '';
      loginStudent(username, password);
    }
  });

  // تسجيل الدخول كمسؤول
  document.addEventListener('click', function(e) {
    if (e.target.id === 'loginBtn' || e.target.closest('#loginBtn')) {
      e.preventDefault();
      e.stopPropagation();
      const modal = $('loginModal');
      if (modal) modal.style.display = 'block';
    }
    
    if (e.target.id === 'cancelLogin' || e.target.closest('#cancelLogin')) {
      e.preventDefault();
      e.stopPropagation();
      const modal = $('loginModal');
      if (modal) modal.style.display = 'none';
    }
    
    if (e.target.id === 'submitLogin' || e.target.closest('#submitLogin')) {
      e.preventDefault();
      e.stopPropagation();
      const username = $('username') ? $('username').value.trim() : '';
      const password = $('password') ? $('password').value : '';
      loginAdmin(username, password);
    }
  });
}

/* =============================
   Navigation Events - FIXED
   ============================= */
function setupNavigationEvents() {
  // تبويبات الطالب
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('student-tab') || e.target.closest('.student-tab')) {
      e.preventDefault();
      e.stopPropagation();
      const tab = e.target.classList.contains('student-tab') ? e.target : e.target.closest('.student-tab');
      const tabName = tab.getAttribute('data-tab');
      if (tabName) switchStudentTab(tabName);
    }
  });

  // تبويبات المسؤول
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('admin-tab-link') || e.target.closest('.admin-tab-link')) {
      e.preventDefault();
      e.stopPropagation();
      const tab = e.target.classList.contains('admin-tab-link') ? e.target : e.target.closest('.admin-tab-link');
      const tabName = tab.getAttribute('data-tab');
      if (tabName) switchAdminTab(tabName);
    }
  });
}

/* =============================
   Functional Events - FIXED
   ============================= */
function setupFunctionalEvents() {
  // زر القاموس
  document.addEventListener('click', function(e) {
    if (e.target.id === 'btnAddDictionary' || 
        e.target.classList.contains('btnAddDictionary') ||
        (e.target.tagName === 'BUTTON' && e.target.textContent.includes('Ajouter'))) {
      e.preventDefault();
      e.stopPropagation();
      addDictionaryTerm();
    }
  });

  // زر عرض النتائج - الإصلاح النهائي
  document.addEventListener('click', function(e) {
    const target = e.target;
    const isGradesButton = target.id === 'btnViewGrades' || 
                          target.classList.contains('btnViewGrades') ||
                          (target.tagName === 'BUTTON' && 
                           (target.textContent.includes('Voir les notes') || 
                            target.textContent.includes('View grades') || 
                            target.textContent.includes('عرض النتائج')));

    if (isGradesButton) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('Grades button clicked');
      
      // البحث عن حقل الإدخال بطرق متعددة
      const codeInput = $('gradeSearchCode') || 
                       document.querySelector('input[placeholder*="code"], input[placeholder*="Code"], input[name*="code"]') ||
                       document.querySelector('#grades input[type="text"]');
      
      const code = codeInput ? codeInput.value.trim() : '';
      console.log('Searching for code:', code);
      
      if (!code) {
        alert('Veuillez entrer un code parcours');
        return;
      }
      
      searchGradesByCode(code);
      return false;
    }
  });

  // تسجيل الخروج
  document.addEventListener('click', function(e) {
    if (e.target.id === 'studentLogoutBtn' || e.target.closest('#studentLogoutBtn')) {
      e.preventDefault();
      e.stopPropagation();
      appData.currentUser = null;
      appData.isAdmin = false;
      saveData();
      refreshUI();
      showSection('home');
    }
    
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
      e.preventDefault();
      e.stopPropagation();
      appData.currentUser = null;
      appData.isAdmin = false;
      saveData();
      refreshUI();
      showSection('home');
    }
  });
}

/* =============================
   Button Click Handler - NEW
   ============================= */
function handleButtonClick(button) {
  const id = button.id;
  const text = button.textContent;
  
  console.log('Button handled:', id, text);
  
  switch(id) {
    case 'btnAddDictionary':
      addDictionaryTerm();
      break;
    case 'btnViewGrades':
      const codeInput = $('gradeSearchCode');
      const code = codeInput ? codeInput.value.trim() : '';
      searchGradesByCode(code);
      break;
    case 'btnSaveAnnouncement':
      saveAnnouncement();
      break;
    case 'btnExport':
      exportData();
      break;
    // إضافة المزيد من الأزرار هنا
    default:
      if (text.includes('Voir les notes') || text.includes('عرض النتائج')) {
        const codeInput = $('gradeSearchCode');
        const code = codeInput ? codeInput.value.trim() : '';
        searchGradesByCode(code);
      }
      break;
  }
}

/* =============================
   UI Switching - COMPLETELY FIXED
   ============================= */
function hideAllMainSections(){
  const sections = document.querySelectorAll('.page-section, #student-dashboard, #admin-panel, #home-section');
  sections.forEach(section => {
    if (section) {
      section.style.display = 'none';
      section.classList.remove('active');
    }
  });
}

function showSection(id){
  console.log('=== SHOWING SECTION:', id, '===');
  
  // إلغاء أي scroll موجود
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  
  hideAllMainSections();
  
  const element = $(id);
  if (element) {
    element.style.display = 'block';
    element.classList.add('active');
    
    // منع أي scroll داخلي
    element.style.overflow = 'hidden';
    element.scrollTop = 0;
    
    // تحميل المحتوى المناسب
    loadSectionContent(id);
  }
  
  // التأكد من بقاء الصفحة في الأعلى
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, 10);
}

function loadSectionContent(sectionId) {
  switch(sectionId) {
    case 'quiz':
      renderQuizList();
      break;
    case 'lessons':
      renderLessons();
      break;
    case 'exercises':
      renderExercises();
      break;
    case 'exams':
      renderExams();
      break;
    case 'dictionary':
      renderDictionary();
      break;
    case 'grades':
      renderGradesSection();
      break;
    case 'home':
      // لا شيء إضافي
      break;
  }
}

function switchStudentTab(tabName){
  console.log('Switching student tab:', tabName);
  
  // إخفاء جميع المحتويات
  document.querySelectorAll('.student-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // إزالة النشاط من التبويبات
  document.querySelectorAll('.student-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // تفعيل التبويب الجديد
  const activeTab = document.querySelector(`.student-tab[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(`student-${tabName}-tab`);
  
  if (activeTab) activeTab.classList.add('active');
  if (activeContent) activeContent.style.display = 'block';
}

function switchAdminTab(tabName){
  console.log('Switching admin tab:', tabName);
  
  document.querySelectorAll('.admin-section').forEach(section => {
    section.style.display = 'none';
  });
  
  document.querySelectorAll('.admin-tab-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.admin-tab-link[data-tab="${tabName}"]`);
  const activeSection = document.getElementById(tabName);
  
  if (activeLink) activeLink.classList.add('active');
  if (activeSection) activeSection.style.display = 'block';
}

/* =============================
   Authentication - FIXED
   ============================= */
function loginStudent(username, password){
  if (!username || !password) {
    alert('Veuillez saisir le nom d\'utilisateur et le mot de passe');
    return;
  }
  
  const student = appData.students.find(s => s.username === username && s.password === password);
  if (!student) {
    alert('Nom d\'utilisateur ou mot de passe incorrect');
    return;
  }
  
  appData.currentUser = student;
  appData.isAdmin = false;
  saveData();
  refreshUI();
  
  const modal = $('studentLoginModal');
  if (modal) modal.style.display = 'none';
  
  showSection('student-dashboard');
}

function loginAdmin(username, password){
  if (username === 'admin' && password === 'admin123') {
    appData.currentUser = { id: 'admin', fullname: 'Administrateur' };
    appData.isAdmin = true;
    saveData();
    refreshUI();
    
    const modal = $('loginModal');
    if (modal) modal.style.display = 'none';
    
    showSection('admin-panel');
  } else {
    alert('Nom d\'utilisateur ou mot de passe incorrect');
  }
}

/* =============================
   Grades Functionality - COMPLETELY FIXED
   ============================= */
function searchGradesByCode(code){
  console.log('=== SEARCHING GRADES FOR CODE:', code, '===');
  
  if (!code) {
    alert('Veuillez entrer un code parcours');
    return;
  }
  
  const student = appData.students.find(s => s.code === code);
  if (!student) {
    alert('Code parcours non trouvé');
    return;
  }
  
  const grades = appData.grades.filter(g => g.studentId === student.id);
  
  // إظهار القسم أولاً
  showSection('grades');
  
  // ثم تحديث البيانات بعد تأخير بسيط لضمان أن العناصر موجودة
  setTimeout(() => {
    updateGradesDisplay(student, grades);
  }, 50);
}

function updateGradesDisplay(student, grades) {
  // تحديث معلومات الطالب
  const studentInfo = $('studentInfo') || document.querySelector('#studentInfo');
  if (studentInfo) {
    studentInfo.innerHTML = `
      <div class="content-card">
        <div class="card-content">
          <h3>${escapeHtml(student.fullname)}</h3>
          <p><strong>Classe:</strong> ${escapeHtml(student.classroom || 'Non spécifiée')}</p>
          <p><strong>Code:</strong> ${escapeHtml(student.code || '')}</p>
        </div>
      </div>
    `;
  }
  
  // تحديث الجدول
  const tbody = document.querySelector('#gradesTable tbody');
  const noGradesMsg = $('noGradesMsg');
  
  if (tbody) {
    tbody.innerHTML = '';
    
    if (grades.length === 0) {
      if (noGradesMsg) noGradesMsg.style.display = 'block';
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Aucune note disponible</td></tr>';
    } else {
      if (noGradesMsg) noGradesMsg.style.display = 'none';
      
      grades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${new Date(grade.date).toLocaleDateString('fr-FR')}</td>
          <td>${escapeHtml(grade.subject)}</td>
          <td>${escapeHtml(grade.title)}</td>
          <td>${grade.score}/20</td>
          <td>${escapeHtml(grade.note || '')}</td>
        `;
        tbody.appendChild(row);
      });
    }
  }
  
  // إظهار النتائج
  const gradesResults = $('gradesResults');
  if (gradesResults) {
    gradesResults.style.display = 'block';
  }
}

function renderGradesSection(){
  const container = $('grades');
  if (!container) return;
  
  container.innerHTML = `
    <div class="content-card">
      <div class="card-content">
        <h2>Consultation des Notes</h2>
        <div class="form-group">
          <label for="gradeSearchCode">Code Parcours:</label>
          <input type="text" id="gradeSearchCode" placeholder="Entrez votre code parcours" 
                 style="padding: 10px; margin: 5px; width: 200px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="btnViewGrades" class="btn-primary" 
                  style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">
            Voir les notes
          </button>
        </div>
        <div id="gradesResults" style="display: none;">
          <div id="studentInfo"></div>
          <table id="gradesTable" class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; border: 1px solid #ddd;">Date</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Matière</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Intitulé</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Note</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Remarque</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <p id="noGradesMsg" style="display: none; text-align: center; padding: 20px; color: #666;">
            Aucune note disponible pour ce code parcours.
          </p>
        </div>
      </div>
    </div>
  `;
}

/* =============================
   Dictionary Functions - FIXED
   ============================= */
function addDictionaryTerm(){
  const arabicInput = $('dictArabic') || document.querySelector('input[placeholder*="arabe"]');
  const frenchInput = $('dictFrench') || document.querySelector('input[placeholder*="français"]');
  const definitionInput = $('dictDefinition') || document.querySelector('textarea');
  
  const arabic = arabicInput ? arabicInput.value.trim() : '';
  const french = frenchInput ? frenchInput.value.trim() : '';
  const definition = definitionInput ? definitionInput.value.trim() : '';
  
  if (!arabic || !french) {
    alert('يجب إدخال المصطلح بالعربية والفرنسية');
    return;
  }
  
  appData.dictionary.push({
    id: genId(),
    ar: arabic,
    fr: french,
    definition: definition
  });
  
  saveData();
  renderDictionary();
  alert('تمت إضافة المصطلح بنجاح');
  
  if (arabicInput) arabicInput.value = '';
  if (frenchInput) frenchInput.value = '';
  if (definitionInput) definitionInput.value = '';
}

/* =============================
   Refresh UI - FIXED
   ============================= */
function refreshUI(){
  // منع scroll أثناء التحديث
  window.scrollTo(0, 0);
  
  // تحديث واجهة المستخدم
  if ($('announcementText')) {
    $('announcementText').textContent = appData.announcement.text || '';
  }
  
  // التحكم في عرض الأقسام
  if ($('admin-panel')) $('admin-panel').style.display = appData.isAdmin ? 'block' : 'none';
  if ($('student-dashboard')) $('student-dashboard').style.display = (appData.currentUser && !appData.isAdmin) ? 'block' : 'none';
  if ($('home-section')) $('home-section').style.display = !appData.currentUser ? 'block' : 'none';
  
  renderAll();
}

/* =============================
   Render All - FIXED
   ============================= */
function renderAll(){
  renderDictionary();
  renderGradesSection();
  // إضافة دوال render الأخرى هنا
}

/* =============================
   Dictionary Render - FIXED
   ============================= */
function renderDictionary(){
  const container = $('dictionaryContent');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (appData.dictionary.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Aucun terme dans le lexique</p>';
    return;
  }
  
  appData.dictionary.forEach(term => {
    const div = document.createElement('div');
    div.className = 'content-card';
    div.innerHTML = `
      <div class="card-content">
        <h3>${escapeHtml(term.ar)} - ${escapeHtml(term.fr)}</h3>
        <p>${escapeHtml(term.definition)}</p>
      </div>
    `;
    container.appendChild(div);
  });
}

/* =============================
   Utility Functions
   ============================= */
function saveAnnouncement(){
  // دالة لحفظ الإعلان
}

function exportData(){
  // دالة لتصدير البيانات
}

// دوال placeholders للوظائف الأخرى
function renderQuizList(){}
function renderLessons(){}
function renderExercises(){}
function renderExams(){}

/* =============================
   FINAL FIX: منع جميع أشكال Scroll
   ============================= */
// منع scroll على مستوى المتصفح
window.addEventListener('scroll', function(e) {
  if (window.scrollY > 0) {
    window.scrollTo(0, 0);
  }
});

// منع scroll على مستوى body
document.body.addEventListener('scroll', function(e) {
  document.body.scrollTop = 0;
});

// منع wheel events التي قد تسبب scroll
document.addEventListener('wheel', function(e) {
  if (e.ctrlKey) return; // السماح بالzoom
  e.preventDefault();
}, { passive: false });

// منع touch events على الأجهزة اللوحية
document.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

console.log('=== APPLICATION LOADED COMPLETELY ==='); 
