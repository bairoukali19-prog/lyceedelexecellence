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

/* =============================
   Utility Functions
   ============================= */
function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // دمج البيانات بدلاً من الاستبدال الكامل
      Object.keys(parsed).forEach(key => {
        if (appData.hasOwnProperty(key)) {
          appData[key] = parsed[key];
        }
      });
    }
  } catch(e){ 
    console.error('خطأ في تحميل البيانات:', e); 
  }
}

function saveData(){ 
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); 
  } catch(e) {
    console.error('خطأ في حفظ البيانات:', e);
  }
}

function $(id){ 
  return document.getElementById(id); 
}

function genId(){ 
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7); 
}

function escapeHtml(s){ 
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =============================
   INITIALIZATION - الإصلاح الجذري
   ============================= */
document.addEventListener('DOMContentLoaded', function() {
  console.log('بدء تحميل التطبيق...');
  
  // حل جذري: منع جميع الأحداث التي تسبب الانتقال للأعلى
  document.addEventListener('click', function(e) {
    // منع السلوك الافتراضي لجميع الأزرار
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('تم منع زر:', e.target.textContent || e.target.id);
    }
    
    // منع السلوك الافتراضي للروابط التي لها #
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // منع السلوك الافتراضي للروابط التي لها data-section
    if (e.target.hasAttribute('data-section') || e.target.closest('[data-section]')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true); // استخدام capture phase لمنع الأحداث مبكراً

  loadData();
  wireEvents();
  refreshUI();
  
  // التأكد من أن الصفحة تبدأ من الأعلى
  window.scrollTo(0, 0);
});

/* =============================
   EVENT WIRING - الإصلاح الشامل
   ============================= */
function wireEvents(){
  console.log('تهيئة الأحداث...');
  
  // حل شامل: إعادة تعريف addEventListener لمنع السلوك الافتراضي
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'click') {
      const wrappedListener = function(event) {
        // منع السلوك الافتراضي لجميع الأزرار والروابط
        if (event.target.tagName === 'BUTTON' || 
            event.target.closest('button') ||
            (event.target.tagName === 'A' && 
             (event.target.getAttribute('href') === '#' || 
              event.target.hasAttribute('data-section')))) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
        return listener.call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // إعداد أحداث تسجيل الدخول
  setupLoginEvents();
  
  // إعداد أحداث التنقل
  setupNavigationEvents();
  
  // إعداد أحداث الوظائف
  setupFunctionalEvents();
  
  console.log('تم تهيئة جميع الأحداث بنجاح');
}

/* =============================
   LOGIN EVENTS - أحداث تسجيل الدخول
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
   NAVIGATION EVENTS - أحداث التنقل
   ============================= */
function setupNavigationEvents() {
  // التنقل بين الأقسام الرئيسية
  document.addEventListener('click', function(e) {
    if (e.target.hasAttribute('data-section') || e.target.closest('[data-section]')) {
      e.preventDefault();
      e.stopPropagation();
      
      const element = e.target.hasAttribute('data-section') ? e.target : e.target.closest('[data-section]');
      const sectionId = element.getAttribute('data-section');
      
      if (sectionId) {
        showSection(sectionId);
      }
    }
  });

  // تبويبات الطالب
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('student-tab') || e.target.closest('.student-tab')) {
      e.preventDefault();
      e.stopPropagation();
      
      const tab = e.target.classList.contains('student-tab') ? e.target : e.target.closest('.student-tab');
      const tabName = tab.getAttribute('data-tab');
      
      if (tabName) {
        switchStudentTab(tabName);
      }
    }
  });

  // تبويبات المسؤول
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('admin-tab-link') || e.target.closest('.admin-tab-link')) {
      e.preventDefault();
      e.stopPropagation();
      
      const tab = e.target.classList.contains('admin-tab-link') ? e.target : e.target.closest('.admin-tab-link');
      const tabName = tab.getAttribute('data-tab');
      
      if (tabName) {
        switchAdminTab(tabName);
      }
    }
  });
}

/* =============================
   FUNCTIONAL EVENTS - أحداث الوظائف
   ============================= */
function setupFunctionalEvents() {
  // زر إضافة مصطلح في القاموس
  document.addEventListener('click', function(e) {
    if (e.target.id === 'btnAddDictionary' || 
        e.target.classList.contains('btnAddDictionary') ||
        (e.target.tagName === 'BUTTON' && 
         (e.target.textContent.includes('Ajouter') || 
          e.target.textContent.includes('Add') || 
          e.target.textContent.includes('إضافة')))) {
      e.preventDefault();
      e.stopPropagation();
      addDictionaryTerm();
    }
  });

  // زر "Voir les notes" - الإصلاح النهائي
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
      
      console.log('تم النقر على زر عرض النتائج');
      
      // البحث عن حقل الإدخال بطرق متعددة
      const codeInput = $('gradeSearchCode') || 
                       document.querySelector('input[placeholder*="code"], input[placeholder*="Code"], input[name*="code"]') ||
                       document.querySelector('#grades input[type="text"]');
      
      const code = codeInput ? codeInput.value.trim() : '';
      
      if (!code) {
        alert('يرجى إدخال كود المسار');
        return;
      }
      
      searchGradesByCode(code);
    }
  });

  // أحداث أخرى
  document.addEventListener('click', function(e) {
    // تسجيل الخروج
    if (e.target.id === 'studentLogoutBtn' || e.target.closest('#studentLogoutBtn')) {
      e.preventDefault();
      e.stopPropagation();
      logoutUser();
    }
    
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
      e.preventDefault();
      e.stopPropagation();
      logoutUser();
    }
    
    // حفظ الإعلان
    if (e.target.id === 'btnSaveAnnouncement' || e.target.closest('#btnSaveAnnouncement')) {
      e.preventDefault();
      e.stopPropagation();
      saveAnnouncement();
    }
    
    // تصدير البيانات
    if (e.target.id === 'btnExport' || e.target.closest('#btnExport')) {
      e.preventDefault();
      e.stopPropagation();
      exportData();
    }
  });
}

/* =============================
   AUTHENTICATION - التوثيق
   ============================= */
function loginStudent(username, password) {
  if (!username || !password) {
    alert('يرجى إدخال اسم المستخدم وكلمة المرور');
    return;
  }
  
  const student = appData.students.find(s => s.username === username && s.password === password);
  if (!student) {
    alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    return;
  }
  
  appData.currentUser = student;
  appData.isAdmin = false;
  saveData();
  refreshUI();
  
  const modal = $('studentLoginModal');
  if (modal) modal.style.display = 'none';
  
  showSection('student-dashboard');
  alert('مرحبا، ' + student.fullname);
}

function loginAdmin(username, password) {
  if (!username || !password) {
    alert('يرجى إدخال اسم المستخدم وكلمة المرور');
    return;
  }
  
  if (username === 'admin' && password === 'admin123') {
    appData.currentUser = { id: 'admin', fullname: 'المسؤول' };
    appData.isAdmin = true;
    saveData();
    refreshUI();
    
    const modal = $('loginModal');
    if (modal) modal.style.display = 'none';
    
    showSection('admin-panel');
    alert('مرحبا، المسؤول');
  } else {
    alert('اسم المستخدم أو كلمة المرور غير صحيحة');
  }
}

function logoutUser() {
  appData.currentUser = null;
  appData.isAdmin = false;
  saveData();
  refreshUI();
  showSection('home');
}

/* =============================
   UI MANAGEMENT - إدارة الواجهة
   ============================= */
function hideAllMainSections() {
  const sections = document.querySelectorAll('.page-section, #student-dashboard, #admin-panel, #home-section');
  sections.forEach(section => {
    if (section) {
      section.style.display = 'none';
    }
  });
}

function showSection(id) {
  console.log('عرض القسم:', id);
  
  // التأكد من بقاء الصفحة في الأعلى
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  
  hideAllMainSections();
  
  const element = $(id);
  if (element) {
    element.style.display = 'block';
    
    // تحميل المحتوى المناسب للقسم
    loadSectionContent(id);
  }
  
  // إذا لم يكن هناك مستخدم مسجل، عرض الصفحة الرئيسية
  if (!appData.currentUser && id !== 'home') {
    const homeSection = $('home-section');
    if (homeSection) homeSection.style.display = 'block';
  }
  
  // التأكد مرة أخرى من عدم الانتقال للأعلى
  setTimeout(() => {
    window.scrollTo(0, 0);
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
  }
}

function switchStudentTab(tabName) {
  console.log('تبديل تبويب الطالب إلى:', tabName);
  
  // إخفاء جميع محتويات التبويبات
  document.querySelectorAll('.student-tab-content').forEach(content => {
    if (content) content.style.display = 'none';
  });
  
  // إزالة النشاط من جميع التبويبات
  document.querySelectorAll('.student-tab').forEach(tab => {
    if (tab) tab.classList.remove('active');
  });
  
  // تفعيل التبويب المحدد
  const activeTab = document.querySelector('.student-tab[data-tab="' + tabName + '"]');
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // إظهار محتوى التبويب المحدد
  const activeContent = document.getElementById('student-' + tabName + '-tab');
  if (activeContent) {
    activeContent.style.display = 'block';
    
    // تحميل المحتوى المناسب
    switch(tabName) {
      case 'dashboard':
        loadStudentDashboard();
        break;
      case 'quiz':
        renderQuizListForStudent();
        break;
      case 'exercises':
        renderStudentExercises();
        break;
      case 'cours':
        renderLatexListForStudents();
        break;
      case 'messages':
        renderStudentMessages();
        break;
      case 'exams':
        renderExams();
        break;
    }
  }
}

function switchAdminTab(tabName) {
  console.log('تبديل تبويب المسؤول إلى:', tabName);
  
  // إخفاء جميع أقسام الإدارة
  document.querySelectorAll('.admin-section').forEach(section => {
    if (section) section.style.display = 'none';
  });
  
  // إزالة النشاط من جميع روابط التبويبات
  document.querySelectorAll('.admin-tab-link').forEach(link => {
    if (link) link.classList.remove('active');
  });
  
  // تفعيل رابط التبويب المحدد
  const activeLink = document.querySelector('.admin-tab-link[data-tab="' + tabName + '"]');
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // إظهار قسم الإدارة المحدد
  const activeSection = document.getElementById(tabName);
  if (activeSection) {
    activeSection.style.display = 'block';
    
    // تحميل المحتوى المناسب
    switch(tabName) {
      case 'tab-students':
        loadStudentsTable();
        break;
      case 'tab-grades':
        loadGradesTable();
        break;
      case 'tab-quiz':
        renderQuizAdminListDetailed();
        break;
      case 'tab-latex':
        loadLatexAdminList();
        break;
      case 'tab-messages':
        renderAdminMessagesList();
        break;
      case 'tab-lessons':
        renderLessonsAdminList();
        break;
      case 'tab-exercises':
        renderExercisesAdminList();
        break;
      case 'tab-exams':
        renderExamsAdminList();
        renderRegradeRequestsAdminList();
        break;
      case 'tab-dictionary':
        renderDictionaryAdminList();
        break;
    }
  }
}

/* =============================
   GRADES FUNCTIONALITY - وظائف النتائج
   ============================= */
function searchGradesByCode(code) {
  console.log('البحث عن النتائج للكود:', code);
  
  if (!code) {
    alert('يرجى إدخال كود المسار');
    return;
  }
  
  const student = appData.students.find(s => s.code === code);
  if (!student) {
    alert('لم يتم العثور على كود المسار');
    return;
  }
  
  const grades = appData.grades.filter(g => g.studentId === student.id);
  
  // إظهار قسم النتائج
  showSection('grades');
  
  // تحديث العرض بعد تأخير بسيط لضمان تحميل العناصر
  setTimeout(() => {
    updateGradesDisplay(student, grades);
  }, 50);
}

function updateGradesDisplay(student, grades) {
  // تحديث معلومات الطالب
  const studentInfo = $('studentInfo');
  if (studentInfo) {
    studentInfo.innerHTML = `
      <div class="content-card">
        <div class="card-content">
          <h3>${escapeHtml(student.fullname)}</h3>
          <p><strong>الصف:</strong> ${escapeHtml(student.classroom || 'غير محدد')}</p>
          <p><strong>الكود:</strong> ${escapeHtml(student.code || '')}</p>
        </div>
      </div>
    `;
  }
  
  // تحديث جدول النتائج
  const tbody = document.querySelector('#gradesTable tbody');
  const noGradesMsg = $('noGradesMsg');
  
  if (tbody) {
    tbody.innerHTML = '';
    
    if (!grades || grades.length === 0) {
      if (noGradesMsg) noGradesMsg.style.display = 'block';
    } else {
      if (noGradesMsg) noGradesMsg.style.display = 'none';
      
      grades.forEach(grade => {
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
  
  // إظهار قسم النتائج
  const gradesResults = $('gradesResults');
  if (gradesResults) {
    gradesResults.style.display = 'block';
  }
}

function renderGradesSection() {
  const container = $('grades');
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
  
  // إعادة ربط الأحداث بعد إنشاء العناصر
  setTimeout(() => {
    const viewGradesBtn = $('btnViewGrades');
    if (viewGradesBtn) {
      viewGradesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const code = $('gradeSearchCode').value.trim();
        searchGradesByCode(code);
      });
    }
  }, 100);
}

/* =============================
   DICTIONARY FUNCTIONS - وظائف القاموس
   ============================= */
function addDictionaryTerm() {
  // البحث عن حقول الإدخال
  let arabicInput = $('dictArabic') || 
                   document.querySelector('input[placeholder*="arabe"], input[placeholder*="عربي"]');
  
  let frenchInput = $('dictFrench') || 
                   document.querySelector('input[placeholder*="français"], input[placeholder*="فرنسي"]');
  
  let definitionInput = $('dictDefinition') || 
                       document.querySelector('textarea');

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

function renderDictionaryAdminList() {
  const container = $('dictionaryAdminList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!appData.dictionary.length) {
    container.innerHTML = '<p class="muted">لا توجد مصطلحات</p>';
    return;
  }
  
  appData.dictionary.forEach(term => {
    const div = document.createElement('div');
    div.className = 'content-row';
    div.innerHTML = `
      <div style="margin-bottom: 5px;">
        <strong>${escapeHtml(term.ar)}</strong> - ${escapeHtml(term.fr)}
      </div>
      <div style="margin-bottom: 5px; color: #666;">${escapeHtml(term.definition)}</div>
      <button class="delete-dict-term" data-id="${term.id}">حذف</button>
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
   REFRESH UI - تحديث الواجهة
   ============================= */
function refreshUI() {
  // التأكد من بقاء الصفحة في الأعلى
  window.scrollTo(0, 0);
  
  // تحديث الإعلان
  if ($('announcementText')) {
    $('announcementText').textContent = appData.announcement.text || '';
  }
  
  // التحكم في عرض الأقسام
  if ($('admin-panel')) {
    $('admin-panel').style.display = appData.isAdmin ? 'block' : 'none';
  }
  
  if ($('student-dashboard')) {
    $('student-dashboard').style.display = (appData.currentUser && !appData.isAdmin) ? 'block' : 'none';
  }
  
  if ($('home-section')) {
    $('home-section').style.display = !appData.currentUser ? 'block' : 'none';
  }

  // تحديث رسالة الترحيب
  if ($('studentWelcome') && appData.currentUser && !appData.isAdmin) {
    $('studentWelcome').textContent = 'مرحبا، ' + (appData.currentUser.fullname || '');
  }

  // تحديث الإحصائيات
  if ($('stats-students')) $('stats-students').textContent = appData.students.length;
  if ($('stats-quiz')) $('stats-quiz').textContent = appData.quizzes.reduce((acc, q) => acc + (q.questions ? q.questions.length : 0), 0);
  if ($('stats-dictionary')) $('stats-dictionary').textContent = appData.dictionary.length;
  if ($('stats-grades')) $('stats-grades').textContent = appData.grades.length;

  // تحديث القوائم المنسدلة
  populateStudentsSelect();

  // إعادة render المحتوى
  renderAll();
}

/* =============================
   RENDER ALL - عرض جميع المكونات
   ============================= */
function renderAll() {
  renderDictionary();
  renderGradesSection();
  // إضافة دوال render الأخرى هنا
}

/* =============================
   DICTIONARY RENDER - عرض القاموس
   ============================= */
function renderDictionary() {
  const container = $('dictionaryContent');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!appData.dictionary.length) {
    container.innerHTML = '<p class="muted">لا توجد مصطلحات في القاموس حالياً</p>';
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
   UTILITY FUNCTIONS - دوال مساعدة
   ============================= */
function populateStudentsSelect() {
  const selects = [
    { id: 'adminMessageStudent', defaultText: 'اختر طالب' },
    { id: 'grStudent', defaultText: '-- اختر طالب --' },
    { id: 'grFilterStudent', defaultText: 'جميع الطلاب' }
  ];
  
  selects.forEach(selectInfo => {
    const select = $(selectInfo.id);
    if (select) {
      select.innerHTML = `<option value="">${selectInfo.defaultText}</option>`;
      
      appData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.fullname} (${student.code || ''})`;
        select.appendChild(option);
      });
    }
  });
}

function saveAnnouncement() {
  if ($('announcementInput')) {
    appData.announcement.text = $('announcementInput').value;
  }
  saveData();
  alert('تم حفظ الإعلان');
}

function exportData() {
  const blob = new Blob([JSON.stringify(appData)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lycee_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =============================
   PLACEHOLDER FUNCTIONS - دوال مؤقتة
   ============================= */
function loadStudentsTable() {}
function loadGradesTable() {}
function renderQuizList() {}
function renderLessons() {}
function renderExercises() {}
function renderExams() {}
function renderQuizAdminListDetailed() {}
function loadLatexAdminList() {}
function renderAdminMessagesList() {}
function renderLessonsAdminList() {}
function renderExercisesAdminList() {}
function renderExamsAdminList() {}
function renderRegradeRequestsAdminList() {}
function renderLatexListForStudents() {}
function renderStudentMessages() {}
function renderQuizListForStudent() {}
function renderStudentExercises() {}
function loadStudentDashboard() {}

console.log('تم تحميل كود الجافا سكريبت بنجاح');
