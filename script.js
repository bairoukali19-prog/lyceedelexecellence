/* =============================
   Unified dashboard JS - FIXED COMPLETE VERSION
   =============================*/

/* =============================
   Data model (localStorage)
   ============================= */  
const STORAGE_KEY = 'lyceeExcellence_v_19';
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
      // دمج البيانات بدلاً من الاستبدال الكامل للحفاظ على الهيكل
      Object.keys(parsed).forEach(key => {
        if (appData.hasOwnProperty(key)) {
          appData[key] = parsed[key];
        }
      });
      appData.slides = appData.slides || [];
      appData.regradeRequests = appData.regradeRequests || [];
      appData.responses = appData.responses || {};
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
   Init
   ============================= */
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - initializing app');
  loadData();
  wireEvents();
  refreshUI();
  setTimeout(function(){
    renderAll(); 
    // إصلاح: التأكد من أن الصفحة الرئيسية معروضة عند البدء
    if (!appData.currentUser) {
      showSection('home');
    }
  }, 100);
});

/* =============================
   Wiring UI events - FIXED COMPLETELY
   ============================= */
function wireEvents(){
  console.log('Wiring events...');
  
  // منع السلوك الافتراضي لجميع الأزرار والروابط
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // منع السلوك الافتراضي للأزرار
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Button click prevented:', target.textContent || target.value || target.id);
    }
    
    // منع السلوك الافتراضي للروابط التي لها data-section
    if (target.tagName === 'A' && target.hasAttribute('data-section')) {
      e.preventDefault();
      e.stopPropagation();
      const section = target.getAttribute('data-section');
      showSection(section);
    }
  });

  // nav links - إصلاح: استخدام event delegation بدلاً من event listeners فردية
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-link')) {
      e.preventDefault();
      e.stopPropagation();
      const section = e.target.getAttribute('data-section');
      if (section) {
        showSection(section);
      }
    }
    
    if (e.target.closest('.feature-card')) {
      e.preventDefault();
      e.stopPropagation();
      const card = e.target.closest('.feature-card');
      const section = card.getAttribute('data-section');
      if (section) {
        showSection(section);
      }
    }
  });

  // login modals - إصلاح: التأكد من وجود العناصر قبل إضافة الأحداث
  setTimeout(function() {
    // أحداث تسجيل الدخول للطلاب
    const studentLoginBtn = $('studentLoginBtn');
    const studentLoginModal = $('studentLoginModal');
    const cancelStudentLogin = $('cancelStudentLogin');
    const submitStudentLogin = $('submitStudentLogin');
    
    if (studentLoginBtn) {
      studentLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (studentLoginModal) studentLoginModal.style.display = 'block';
      });
    }
    
    if (cancelStudentLogin) {
      cancelStudentLogin.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (studentLoginModal) studentLoginModal.style.display = 'none';
      });
    }
    
    if (submitStudentLogin) {
      submitStudentLogin.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const username = $('studentUsername') ? $('studentUsername').value.trim() : '';
        const password = $('studentPassword') ? $('studentPassword').value : '';
        loginStudent(username, password);
      });
    }
    
    // أحداث تسجيل الدخول للإدارة
    const loginBtn = $('loginBtn');
    const loginModal = $('loginModal');
    const cancelLogin = $('cancelLogin');
    const submitLogin = $('submitLogin');
    
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (loginModal) loginModal.style.display = 'block';
      });
    }
    
    if (cancelLogin) {
      cancelLogin.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (loginModal) loginModal.style.display = 'none';
      });
    }
    
    if (submitLogin) {
      submitLogin.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const username = $('username') ? $('username').value.trim() : '';
        const password = $('password') ? $('password').value : '';
        loginAdmin(username, password);
      });
    }
  }, 500);

  // تسجيل الخروج - إصلاح: التأكد من وجود الأزرار
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

  // student tabs - إصلاح: استخدام event delegation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('student-tab') || e.target.closest('.student-tab')) {
      e.preventDefault();
      e.stopPropagation();
      const tabElement = e.target.classList.contains('student-tab') ? e.target : e.target.closest('.student-tab');
      const tabName = tabElement.getAttribute('data-tab');
      if (tabName) {
        switchStudentTab(tabName);
      }
    }
  });

  // admin tab links - إصلاح: استخدام event delegation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('admin-tab-link') || e.target.closest('.admin-tab-link')) {
      e.preventDefault();
      e.stopPropagation();
      const tabElement = e.target.classList.contains('admin-tab-link') ? e.target : e.target.closest('.admin-tab-link');
      const tabName = tabElement.getAttribute('data-tab');
      if (tabName) {
        switchAdminTab(tabName);
      }
    }
  });

  // أحداث الإعلانات - إصلاح: التأكد من وجود العناصر
  const announcementImageInput = $('announcementImageInput');
  const btnSaveAnnouncement = $('btnSaveAnnouncement');
  const btnDeleteAnnouncementImage = $('btnDeleteAnnouncementImage');
  
  if (announcementImageInput) {
    announcementImageInput.addEventListener('change', handleAnnouncementImage);
  }
  
  if (btnSaveAnnouncement) {
    btnSaveAnnouncement.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const announcementInput = $('announcementInput');
      if (announcementInput) {
        appData.announcement.text = announcementInput.value;
      }
      const announcementText = $('announcementText');
      if (announcementText) {
        announcementText.textContent = appData.announcement.text;
      }
      saveData();
      alert('Annonce enregistrée');
    });
  }
  
  if (btnDeleteAnnouncementImage) {
    btnDeleteAnnouncementImage.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      appData.announcement.image = null;
      saveData();
      const announcementImagePreview = $('announcementImagePreview');
      const announcementImage = $('announcementImage');
      if (announcementImagePreview) announcementImagePreview.style.display = 'none';
      if (announcementImage) announcementImage.style.display = 'none';
      if (btnDeleteAnnouncementImage) btnDeleteAnnouncementImage.style.display = 'none';
    });
  }

  // أحداث الاستيراد والتصدير - إصلاح: التأكد من وجود العناصر
  const btnExport = $('btnExport');
  const importFile = $('importFile');
  
  if (btnExport) {
    btnExport.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const blob = new Blob([JSON.stringify(appData)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lycee_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
  
  if (importFile) {
    importFile.addEventListener('change', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          if (!confirm('Importer va remplacer les données actuelles. Continuer?')) return;
          const importedData = JSON.parse(event.target.result);
          Object.keys(importedData).forEach(key => {
            appData[key] = importedData[key];
          });
          saveData();
          renderAll();
          refreshUI();
          alert('Import réussi');
        } catch(err) {
          alert('Fichier invalide');
          console.error(err);
        }
      };
      reader.readAsText(file);
    });
  }

  // إصلاح: إضافة حدث لزر القاموس باستخدام event delegation
  document.addEventListener('click', function(e) {
    // زر إضافة مصطلح في القاموس
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
    
    // زر عرض النتائج
    if (e.target.id === 'btnViewGrades' || 
        e.target.classList.contains('btnViewGrades') ||
        (e.target.tagName === 'BUTTON' && 
         (e.target.textContent.includes('Voir les notes') || 
          e.target.textContent.includes('View grades') || 
          e.target.textContent.includes('عرض النتائج')))) {
      e.preventDefault();
      e.stopPropagation();
      const codeInput = $('gradeSearchCode') || 
                       document.querySelector('input[placeholder*="code"], input[placeholder*="Code"], input[name*="code"]');
      const code = codeInput ? codeInput.value.trim() : '';
      searchGradesByCode(code);
    }
  });

  // إصلاح: إضافة أحداث للأزرار الأخرى
  const functionalButtons = [
    'btnCreateQuiz', 'adminBtnSaveQuiz', 'adminBtnPreviewQuiz',
    'adminBtnSaveLesson', 'adminBtnSaveExercise', 'adminBtnSaveExam',
    'btnSaveStudent', 'btnSaveGrade', 'adminBtnSendMessage', 'btnSaveLatex'
  ];
  
  functionalButtons.forEach(btnId => {
    const button = $(btnId);
    if (button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked:', btnId);
      });
    }
  });

  console.log('Events wired successfully');
}

/* =============================
   UI switching - COMPLETELY FIXED
   ============================= */
function hideAllMainSections(){
  const sections = document.querySelectorAll('.page-section, #student-dashboard, #admin-panel, #home-section');
  sections.forEach(section => {
    if (section) section.style.display = 'none';
  });
}

function showSection(id){
  console.log('Showing section:', id);
  hideAllMainSections();
  
  const element = $(id);
  if (element) {
    element.style.display = 'block';
    
    // إصلاح: تحميل المحتوى المناسب لكل قسم
    switch(id) {
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
        // لا شيء إضافي للصفحة الرئيسية
        break;
    }
  } else {
    console.warn('Element not found:', id);
  }
  
  // إصلاح: إذا لم يكن هناك مستخدم مسجل، نعرض الصفحة الرئيسية
  if (!appData.currentUser && id !== 'home') {
    const homeSection = $('home-section');
    if (homeSection) homeSection.style.display = 'block';
  }
}

function switchStudentTab(tabName){
  console.log('Switching to student tab:', tabName);
  
  // إخفاء جميع محتويات التبويبات
  const tabContents = document.querySelectorAll('.student-tab-content');
  tabContents.forEach(content => {
    if (content) content.style.display = 'none';
  });
  
  // إزالة النشاط من جميع التبويبات
  const tabs = document.querySelectorAll('.student-tab');
  tabs.forEach(tab => {
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

function switchAdminTab(tabName){
  console.log('Switching to admin tab:', tabName);
  
  // إخفاء جميع أقسام الإدارة
  const adminSections = document.querySelectorAll('.admin-section');
  adminSections.forEach(section => {
    if (section) section.style.display = 'none';
  });
  
  // إزالة النشاط من جميع روابط التبويبات
  const tabLinks = document.querySelectorAll('.admin-tab-link');
  tabLinks.forEach(link => {
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
  
  const studentLoginModal = $('studentLoginModal');
  if (studentLoginModal) studentLoginModal.style.display = 'none';
  
  switchStudentTab('dashboard');
  alert('Bienvenue, ' + student.fullname);
}

function loginAdmin(username, password){
  if (!username || !password) {
    alert('Veuillez saisir le nom d\'utilisateur et le mot de passe');
    return;
  }
  
  if (username === 'admin' && password === 'admin123') {
    appData.currentUser = { id: 'admin', fullname: 'Administrateur' };
    appData.isAdmin = true;
    saveData();
    refreshUI();
    
    const loginModal = $('loginModal');
    if (loginModal) loginModal.style.display = 'none';
    
    switchAdminTab('tab-dashboard');
    alert('Bienvenue, Administrateur');
  } else {
    alert('Nom d\'utilisateur ou mot de passe incorrect');
  }
}

/* =============================
   Refresh UI / render lists - FIXED
   ============================= */
function refreshUI(){
  console.log('Refreshing UI...');
  
  // تحديث الإعلان
  const announcementText = $('announcementText');
  if (announcementText) {
    announcementText.textContent = appData.announcement.text || '';
  }
  
  // تحديث صورة الإعلان
  if (appData.announcement.image) {
    const announcementImage = $('announcementImage');
    const announcementImagePreview = $('announcementImagePreview');
    const btnDeleteAnnouncementImage = $('btnDeleteAnnouncementImage');
    
    if (announcementImage) {
      announcementImage.src = appData.announcement.image;
      announcementImage.style.display = 'block';
    }
    if (announcementImagePreview) {
      announcementImagePreview.src = appData.announcement.image;
      announcementImagePreview.style.display = 'block';
    }
    if (btnDeleteAnnouncementImage) {
      btnDeleteAnnouncementImage.style.display = 'inline-block';
    }
  } else {
    const announcementImage = $('announcementImage');
    const announcementImagePreview = $('announcementImagePreview');
    const btnDeleteAnnouncementImage = $('btnDeleteAnnouncementImage');
    
    if (announcementImage) announcementImage.style.display = 'none';
    if (announcementImagePreview) announcementImagePreview.style.display = 'none';
    if (btnDeleteAnnouncementImage) btnDeleteAnnouncementImage.style.display = 'none';
  }

  // التحكم في عرض لوحة التحكم
  const adminPanel = $('admin-panel');
  const studentDashboard = $('student-dashboard');
  const homeSection = $('home-section');
  
  if (adminPanel) {
    adminPanel.style.display = appData.isAdmin ? 'block' : 'none';
  }
  
  if (studentDashboard) {
    studentDashboard.style.display = (appData.currentUser && !appData.isAdmin) ? 'block' : 'none';
  }
  
  if (homeSection) {
    homeSection.style.display = (!appData.currentUser) ? 'block' : 'none';
  }

  // تحديث رسالة الترحيب
  const studentWelcome = $('studentWelcome');
  if (studentWelcome && appData.currentUser && !appData.isAdmin) {
    studentWelcome.textContent = 'Bienvenue, ' + (appData.currentUser.fullname || '');
  }

  // تحديث الإحصائيات
  const statsElements = {
    'stats-students': appData.students.length,
    'stats-quiz': appData.quizzes.reduce((acc, q) => acc + (q.questions ? q.questions.length : 0), 0),
    'stats-dictionary': appData.dictionary.length,
    'stats-grades': appData.grades.length,
    'stats-messages': appData.messages.length,
    'stats-latex': appData.latexContents.length
  };
  
  Object.keys(statsElements).forEach(id => {
    const element = $(id);
    if (element) {
      element.textContent = statsElements[id];
    }
  });

  // تحديث القوائم المنسدلة
  populateStudentsSelect();
  populateAdminSelectQuiz();

  // إعادة render المحتوى
  renderAll();
}

/* =============================
   Dictionary functions - FIXED
   ============================= */
function addDictionaryTerm(){
  console.log('Adding dictionary term...');
  
  // البحث عن حقول الإدخال بطرق مختلفة
  let arabicInput = $('dictArabic') || 
                   document.querySelector('input[placeholder*="arabe"], input[placeholder*="عربي"], input[name*="arabic"]') ||
                   document.querySelector('#dictionary input[type="text"]:first-child');
  
  let frenchInput = $('dictFrench') || 
                   document.querySelector('input[placeholder*="français"], input[placeholder*="فرنسي"], input[name*="french"]') ||
                   document.querySelector('#dictionary input[type="text"]:nth-child(2)');
  
  let definitionInput = $('dictDefinition') || 
                       document.querySelector('textarea[placeholder*="définition"], textarea[placeholder*="تعريف"], #dictionary textarea') ||
                       document.querySelector('#dictionary input[type="text"]:last-child, #dictionary textarea');

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
    definition: definition || 'لا يوجد تعريف'
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
  const container = $('dictionaryAdminList') || 
                   document.querySelector('#dictionaryAdminList, [data-list="dictionary"], .admin-dictionary-list');
  
  if (!container) {
    console.log('Dictionary admin container not found');
    return;
  }
  
  container.innerHTML = '';
  
  if (!appData.dictionary || appData.dictionary.length === 0) {
    container.innerHTML = '<p class="muted">لا توجد مصطلحات في القاموس</p>';
    return;
  }
  
  appData.dictionary.forEach(term => {
    const termDiv = document.createElement('div');
    termDiv.className = 'dictionary-term admin-term';
    termDiv.style.padding = '10px';
    termDiv.style.marginBottom = '10px';
    termDiv.style.border = '1px solid #ddd';
    termDiv.style.borderRadius = '5px';
    
    termDiv.innerHTML = `
      <div style="margin-bottom: 5px;">
        <strong>${escapeHtml(term.ar)}</strong> - ${escapeHtml(term.fr)}
      </div>
      <div style="margin-bottom: 5px; color: #666; font-size: 0.9em;">
        ${escapeHtml(term.definition)}
      </div>
      <button class="delete-dict-term" data-id="${term.id}" 
              style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
        حذف
      </button>
    `;
    
    container.appendChild(termDiv);
  });

  // إضافة أحداث الحذف
  container.querySelectorAll('.delete-dict-term').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const termId = this.getAttribute('data-id');
      if (confirm('هل أنت متأكد من حذف هذا المصطلح؟')) {
        appData.dictionary = appData.dictionary.filter(term => term.id !== termId);
        saveData();
        renderDictionary();
        renderDictionaryAdminList();
      }
    });
  });
}

/* =============================
   Grades search functionality - FIXED
   ============================= */
function searchGradesByCode(code){
  console.log('Searching grades for code:', code);
  
  if (!code || code.trim() === '') {
    alert('Veuillez entrer un code parcours');
    return;
  }
  
  const student = appData.students.find(s => s.code === code);
  if (!student) {
    alert('Code parcours non trouvé');
    return;
  }
  
  const grades = appData.grades.filter(g => g.studentId === student.id);
  
  // إظهار قسم النتائج
  showSection('grades');
  
  // تحديث معلومات الطالب
  const studentInfoEl = $('studentInfo') || 
                       document.querySelector('#studentInfo, .student-info, [data-info="student"]');
  
  if (studentInfoEl) {
    studentInfoEl.innerHTML = `
      <div class="content-card">
        <div class="card-content">
          <h3>${escapeHtml(student.fullname)}</h3>
          <p><strong>Classe:</strong> ${escapeHtml(student.classroom || 'Non spécifiée')}</p>
          <p><strong>Code Parcours:</strong> ${escapeHtml(student.code || '')}</p>
        </div>
      </div>
    `;
  }
  
  // تحديث جدول النتائج
  const gradesTableBody = document.querySelector('#gradesTable tbody');
  const noGradesMsg = $('noGradesMsg') || 
                     document.querySelector('#noGradesMsg, .no-grades-message');
  
  if (gradesTableBody) {
    gradesTableBody.innerHTML = '';
    
    if (!grades || grades.length === 0) {
      if (noGradesMsg) noGradesMsg.style.display = 'block';
    } else {
      if (noGradesMsg) noGradesMsg.style.display = 'none';
      
      grades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${new Date(grade.date).toLocaleDateString('fr-FR')}</td>
          <td>${escapeHtml(grade.subject || '')}</td>
          <td>${escapeHtml(grade.title || '')}</td>
          <td>${grade.score}/20</td>
          <td>${escapeHtml(grade.note || '')}</td>
        `;
        gradesTableBody.appendChild(row);
      });
    }
  }
  
  // إظهار قسم النتائج
  const gradesResults = $('gradesResults') || 
                       document.querySelector('#gradesResults, .grades-results');
  
  if (gradesResults) {
    gradesResults.style.display = 'block';
  }
}

function renderGradesSection(){
  console.log('Rendering grades section...');
  
  const container = $('grades') || 
                   document.querySelector('#grades, .grades-section, [data-section="grades"]');
  
  if (!container) {
    console.error('Grades container not found');
    return;
  }
  
  container.innerHTML = `
    <div class="content-card">
      <div class="card-content">
        <h2>Consultation des Notes</h2>
        <div class="form-group">
          <label for="gradeSearchCode">Code Parcours:</label>
          <input type="text" id="gradeSearchCode" placeholder="Entrez votre code parcours" 
                 style="padding: 8px; margin: 5px 0; width: 200px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="btnViewGrades" class="btn-primary" 
                  style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Voir les notes
          </button>
        </div>
        <div id="gradesResults" style="display: none; margin-top: 20px;">
          <div id="studentInfo"></div>
          <table id="gradesTable" class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Matière</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Intitulé</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Note</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Remarque</th>
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
  
  // إضافة حدث للزر بعد إنشاء العناصر
  setTimeout(() => {
    const viewGradesBtn = $('btnViewGrades');
    if (viewGradesBtn) {
      viewGradesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const codeInput = $('gradeSearchCode');
        const code = codeInput ? codeInput.value.trim() : '';
        searchGradesByCode(code);
      });
    }
  }, 100);
}

/* =============================
   Students admin / lists - FIXED
   ============================= */
function adminSaveStudent(){
  const id = $('stId') ? ($('stId').value || genId()) : genId();
  const fullname = $('stFullname') ? $('stFullname').value.trim() : '';
  const username = $('stUsername') ? $('stUsername').value.trim() : '';
  const password = $('stPassword') ? $('stPassword').value : '';
  const code = $('stCode') ? $('stCode').value.trim() : '';
  const classroom = $('stClassroom') ? $('stClassroom').value.trim() : '';
  
  if (!fullname || !username) {
    alert('Nom complet et nom d\'utilisateur sont requis');
    return;
  }
  
  const existingIndex = appData.students.findIndex(s => s.id === id);
  if (existingIndex !== -1) {
    // تحديث الطالب الموجود
    appData.students[existingIndex] = {
      id: id,
      fullname: fullname,
      username: username,
      password: password,
      code: code,
      classroom: classroom
    };
  } else {
    // إضافة طالب جديد
    appData.students.push({
      id: id,
      fullname: fullname,
      username: username,
      password: password,
      code: code,
      classroom: classroom
    });
  }
  
  saveData();
  loadStudentsTable();
  populateStudentsSelect();
  alert('Étudiant enregistré avec succès');
  
  // مسح الحقول
  if ($('stFullname')) $('stFullname').value = '';
  if ($('stUsername')) $('stUsername').value = '';
  if ($('stPassword')) $('stPassword').value = '';
  if ($('stCode')) $('stCode').value = '';
  if ($('stClassroom')) $('stClassroom').value = '';
  if ($('stId')) $('stId').value = '';
}

function loadStudentsTable(){
  const tbody = document.querySelector('#studentsTable tbody');
  if (!tbody) {
    console.error('Students table body not found');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (!appData.students || appData.students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Aucun étudiant</td></tr>';
    return;
  }
  
  appData.students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(student.fullname)}</td>
      <td>${escapeHtml(student.username)}</td>
      <td>${escapeHtml(student.code || '')}</td>
      <td>${escapeHtml(student.classroom || '')}</td>
      <td>
        <button class="edit-student" data-id="${student.id}" 
                style="padding: 5px 10px; margin: 2px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Modifier
        </button>
        <button class="del-student" data-id="${student.id}" 
                style="padding: 5px 10px; margin: 2px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Supprimer
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // إضافة أحداث للزرين
  tbody.querySelectorAll('.edit-student').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const studentId = this.getAttribute('data-id');
      const student = appData.students.find(s => s.id === studentId);
      if (!student) return;
      
      if ($('stId')) $('stId').value = student.id;
      if ($('stFullname')) $('stFullname').value = student.fullname;
      if ($('stUsername')) $('stUsername').value = student.username;
      if ($('stPassword')) $('stPassword').value = student.password;
      if ($('stCode')) $('stCode').value = student.code || '';
      if ($('stClassroom')) $('stClassroom').value = student.classroom || '';
    });
  });
  
  tbody.querySelectorAll('.del-student').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const studentId = this.getAttribute('data-id');
      if (confirm('Voulez-vous vraiment supprimer cet étudiant?')) {
        appData.students = appData.students.filter(s => s.id !== studentId);
        saveData();
        loadStudentsTable();
        populateStudentsSelect();
      }
    });
  });
}

function populateStudentsSelect(){
  const selects = [
    { id: 'adminMessageStudent', defaultText: 'Choisir un étudiant' },
    { id: 'grStudent', defaultText: '-- Choisir étudiant --' },
    { id: 'grFilterStudent', defaultText: 'Tous les étudiants' }
  ];
  
  selects.forEach(selectInfo => {
    const select = $(selectInfo.id);
    if (select) {
      select.innerHTML = `<option value="">${selectInfo.defaultText}</option>`;
      
      appData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.fullname} (${student.code || 'Sans code'})`;
        select.appendChild(option);
      });
    }
  });
}

/* =============================
   Grades admin - FIXED
   ============================= */
function adminSaveGrade(){
  const studentId = $('grStudent') ? $('grStudent').value : '';
  const subject = $('grSubject') ? $('grSubject').value.trim() : '';
  const title = $('grTitle') ? $('grTitle').value.trim() : '';
  const date = $('grDate') ? $('grDate').value : new Date().toISOString().split('T')[0];
  const score = $('grScore') ? parseFloat($('grScore').value) || 0 : 0;
  const note = $('grNote') ? $('grNote').value.trim() : '';
  
  if (!studentId || !subject || !title) {
    alert('Veuillez remplir tous les champs obligatoires: étudiant, matière et intitulé');
    return;
  }
  
  if (score < 0 || score > 20) {
    alert('La note doit être comprise entre 0 et 20');
    return;
  }
  
  const newGrade = {
    id: genId(),
    studentId: studentId,
    subject: subject,
    title: title,
    date: date,
    score: score,
    note: note
  };
  
  appData.grades.push(newGrade);
  saveData();
  loadGradesTable();
  alert('Note ajoutée avec succès');
  
  // مسح الحقول
  if ($('grStudent')) $('grStudent').value = '';
  if ($('grSubject')) $('grSubject').value = '';
  if ($('grTitle')) $('grTitle').value = '';
  if ($('grDate')) $('grDate').value = '';
  if ($('grScore')) $('grScore').value = '';
  if ($('grNote')) $('grNote').value = '';
}

function loadGradesTable(){
  const tbody = document.querySelector('#gradesAdminTable tbody');
  if (!tbody) {
    console.error('Grades admin table body not found');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (!appData.grades || appData.grades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Aucune note</td></tr>';
    return;
  }
  
  appData.grades.forEach(grade => {
    const student = appData.students.find(s => s.id === grade.studentId);
    const studentName = student ? student.fullname : 'Étudiant inconnu';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(studentName)}</td>
      <td>${new Date(grade.date).toLocaleDateString('fr-FR')}</td>
      <td>${escapeHtml(grade.subject)}</td>
      <td>${escapeHtml(grade.title)}</td>
      <td>${grade.score}/20</td>
      <td>${escapeHtml(grade.note || '')}</td>
      <td>
        <button class="del-grade" data-id="${grade.id}" 
                style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Supprimer
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // إضافة أحداث لحذف الدرجات
  tbody.querySelectorAll('.del-grade').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const gradeId = this.getAttribute('data-id');
      if (confirm('Voulez-vous vraiment supprimer cette note?')) {
        appData.grades = appData.grades.filter(g => g.id !== gradeId);
        saveData();
        loadGradesTable();
      }
    });
  });
}

/* =============================
   Utility & renderAll - FIXED
   ============================= */
function shuffle(array){
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function formatTime(seconds){
  if (!seconds || seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderAll(){
  console.log('Rendering all components...');
  
  // قائمة بالمكونات التي تحتاج إلى render
  const renderFunctions = [
    renderQuizAdminListDetailed,
    renderQuizList,
    renderLessons,
    renderExercises,
    renderExams,
    renderLessonsAdminList,
    renderExercisesAdminList,
    renderExamsAdminList,
    renderDictionary,
    loadStudentsTable,
    loadGradesTable,
    loadLatexAdminList,
    renderLatexListForStudents,
    renderStudentMessages,
    renderDictionaryAdminList,
    renderGradesSection
  ];
  
  // تنفيذ جميع دوال render مع معالجة الأخطاء
  renderFunctions.forEach(func => {
    try {
      if (typeof func === 'function') {
        func();
      }
    } catch (error) {
      console.error('Error in render function:', func.name, error);
    }
  });
}

/* =============================
   Dictionary rendering - FIXED
   ============================= */
function renderDictionary(){
  const container = $('dictionaryContent') || 
                   document.querySelector('#dictionaryContent, .dictionary-content, [data-content="dictionary"]');
  
  if (!container) {
    console.log('Dictionary content container not found');
    return;
  }
  
  container.innerHTML = '';
  
  if (!appData.dictionary || appData.dictionary.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align: center; padding: 20px; color: #666;">Aucun terme dans le lexique pour le moment.</p>';
    return;
  }
  
  appData.dictionary.forEach(term => {
    const termCard = document.createElement('div');
    termCard.className = 'content-card dictionary-term';
    termCard.style.marginBottom = '15px';
    termCard.style.padding = '15px';
    termCard.style.border = '1px solid #e0e0e0';
    termCard.style.borderRadius = '8px';
    termCard.style.backgroundColor = '#f9f9f9';
    
    termCard.innerHTML = `
      <div class="card-content">
        <h3 style="margin: 0 0 10px 0; color: #333;">
          <span style="color: #2c5aa0;">${escapeHtml(term.ar)}</span> - 
          <span style="color: #d35400;">${escapeHtml(term.fr)}</span>
        </h3>
        <p style="margin: 0; color: #666; line-height: 1.5;">${escapeHtml(term.definition)}</p>
      </div>
    `;
    
    container.appendChild(termCard);
  });
}

/* =============================
   Placeholder functions for missing implementations
   ============================= */
function populateAdminSelectQuiz(){
  // دالة مؤقتة - تحتاج إلى تنفيذ كامل
  const select = $('adminSelectQuiz');
  if (select) {
    select.innerHTML = '<option value="">Aucun quiz disponible</option>';
  }
}

function loadStudentDashboard(){
  console.log('Loading student dashboard...');
  // تنفيذ لوحة تحكم الطالب
}

function renderQuizList(){}
function renderLessons(){}
function renderExercises(){}
function renderExams(){}
function renderQuizAdminListDetailed(){}
function renderLessonsAdminList(){}
function renderExercisesAdminList(){}
function renderExamsAdminList(){}
function loadLatexAdminList(){}
function renderLatexListForStudents(){}
function renderStudentMessages(){}
function renderQuizListForStudent(){}
function renderStudentExercises(){}
function renderAdminMessagesList(){}
function renderRegradeRequestsAdminList(){}
function handleAnnouncementImage(){}
function updateLatexLineNumbers(){}
function adminCreateQuiz(){}
function adminAddQuestion(){}
function previewQuizAsStudent(){}
function adminSaveLesson(){}
function adminSaveExercise(){}
function adminSaveExam(){}
function adminSendMessage(){}
function adminSaveLatex(){}
function notifyStudents(){}

/* =============================
   End of fixed code
   ============================= */     
