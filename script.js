/* =============================
   Unified dashboard JS - UPDATED (includes the 5 students from uploaded JSON)
   Source data file: the uploaded lycee_data (17).json was used.
   - Copy this entire file and save as e.g. deepseek_integrated_fixed.js
   - Replaces previous JS; is a single unified file for the dashboard.
   =============================*/

/* =============================
   Data model (localStorage)
   ============================= */  
const STORAGE_KEY = 'lyceeExcellence_v_22';
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

// =============================
// Defensive fixes to stop scroll-to-top and wire grade buttons
// Inserted by ChatGPT fixer
// =============================
function normalizeInteractiveElements(){
  try {
    // 1) Buttons without a type => force type="button" (prevents accidental form submit)
    document.querySelectorAll('button').forEach(b => {
      if (!b.hasAttribute('type')) b.setAttribute('type', 'button');
    });

    // 2) Prevent anchors that use href="#" or href="#!" from jumping to top
    document.querySelectorAll('a[href="#"], a[href="#!"]').forEach(a => {
      if (!a.__preventedHash) {
        a.addEventListener('click', e => { e.preventDefault(); });
        a.__preventedHash = true;
      }
    });

    // 3) Delegate click on anchors that have href starting with '#' but also data-section handled elsewhere:
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
        // try to find nearby input with "code" in id/name/placeholder
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
   Wiring UI events (defensive - checks exist)
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

  // إضافة حدث لزر إضافة كلمة في القاموس - FIXED
  if ($('btnAddDictionary')) {
    $('btnAddDictionary').addEventListener('click', addDictionaryTerm);
  } else {
    // البحث المتأخر عن الزر إذا لم يكن موجوداً عند التحميل
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
    btn.addEventListener('click', function() {
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
  tbody.querySelectorAll('.edit-student').forEach(b=>b.addEventListener('click', ()=> {
    const id = b.getAttribute('data-id'); const s = appData.students.find(x=>x.id===id); if (!s) return;
    if ($('stId')) $('stId').value=s.id; if ($('stFullname')) $('stFullname').value=s.fullname; if ($('stUsername')) $('stUsername').value=s.username; if ($('stPassword')) $('stPassword').value=s.password; if ($('stCode')) $('stCode').value=s.code; if ($('stClassroom')) $('stClassroom').value=s.classroom; switchAdminTab('tab-students');
  }));
  tbody.querySelectorAll('.del-student').forEach(b=>b.addEventListener('click', ()=> {
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
  tbody.querySelectorAll('.del-grade').forEach(b=>b.addEventListener('click', ()=> { const id=b.getAttribute('data-id'); if (!confirm('Supprimer note ?')) return; appData.grades = appData.grades.filter(x=>x.id!==id); saveData(); loadGradesTable(); }));
}

/* =============================
   Messages admin / student
   ============================= */
function adminSendMessage(){
  const title = $('adminMessageTitle') ? $('adminMessageTitle').value.trim() : '';
  const content = $('adminMessageContent') ? $('adminMessageContent').value.trim() : '';
  const target = $('adminMessageTarget') ? $('adminMessageTarget').value : 'all';
  if (!title || !content) return alert('Titre و contenu requis');
  if (target === 'specific'){ const sid = $('adminMessageStudent').value; if (!sid) return alert('Choisir طالب'); appData.messages.push({ id: genId(), title, content, target:'specific', specific:sid, createdAt:Date.now() }); }
  else appData.messages.push({ id: genId(), title, content, target:'all', createdAt:Date.now() });
  saveData(); renderAdminMessagesList(); renderStudentMessages(); alert('Message envoyé'); if ($('adminMessageTitle')) $('adminMessageTitle').value=''; if ($('adminMessageContent')) $('adminMessageContent').value='';
}

function renderAdminMessagesList(){
  const c = $('adminMessagesList'); if (!c) return; c.innerHTML='';
  if (!appData.messages.length) return c.innerHTML='<p class="muted">لا توجد رسائل</p>';
  appData.messages.forEach(m=>{ const d=document.createElement('div'); d.textContent='['+new Date(m.createdAt).toLocaleString()+'] '+m.title+' - '+m.content+' (cible:'+m.target+')'; const del=document.createElement('button'); del.textContent='Supprimer'; del.addEventListener('click', ()=>{ if (!confirm('Supprimer message ?')) return; appData.messages=appData.messages.filter(x=>x.id!==m.id); saveData(); renderAdminMessagesList(); renderStudentMessages(); }); d.appendChild(del); c.appendChild(d); });
}

function renderStudentMessages(){
  const c = $('studentMessagesList'); if (!c) return; c.innerHTML='';
  if (!appData.currentUser) return c.innerHTML='<p class="muted">Connectez-vous</p>';
  const list = appData.messages.filter(m => m.target==='all' || (m.target==='specific' && m.specific===appData.currentUser.id));
  if (!list.length) return c.innerHTML='<p class="muted">لا توجد رسائل حتى الآن.</p>';
  list.forEach(m=>{ const d=document.createElement('div'); d.textContent='['+new Date(m.createdAt).toLocaleString()+'] '+m.title+' - '+m.content; c.appendChild(d); });
}

/* =============================
   Quiz admin & student (core functions)
   ============================= */
function adminCreateQuiz(){
  if (!$('newQuizTitle')) return;
  const title = $('newQuizTitle').value.trim(); const duration = Number($('newQuizDuration').value) || 0; const shuffle = !!$('newQuizShuffle').checked; const multiAttempts = !!$('newQuizAllowMultipleAttempts').checked;
  if (!title) return alert('Titre requis');
  const quiz = { id: genId(), title, durationMinutes: duration, shuffle, allowMultipleAttempts: multiAttempts, questions: [] };
  appData.quizzes.push(quiz); saveData(); populateAdminSelectQuiz(); renderQuizAdminListDetailed(); alert('Quiz créé');
  notifyStudents('quiz','Quiz جديد متاح','تم إضافة Quiz جديد. راجع قسم Quiz في Tableau de bord.'); if ($('newQuizTitle')) $('newQuizTitle').value=''; if ($('newQuizDuration')) $('newQuizDuration').value='0'; if ($('newQuizShuffle')) $('newQuizShuffle').checked=false; if ($('newQuizAllowMultipleAttempts')) $('newQuizAllowMultipleAttempts').checked=false;
}

function populateAdminSelectQuiz(){
  const sel = $('adminSelectQuiz'); if (!sel) return; sel.innerHTML=''; const opt=document.createElement('option'); opt.value=''; opt.textContent='-- Sélectionner quiz --'; sel.appendChild(opt);
  appData.quizzes.forEach(q=>{ const o=document.createElement('option'); o.value=q.id; o.textContent=q.title + ' ('+q.questions.length+' q)'; sel.appendChild(o); });
}

function adminAddQuestion(){
  const qid = $('adminSelectQuiz') ? $('adminSelectQuiz').value : '';
  if (!qid) return alert('Sélectionner quiz');
  const quiz = appData.quizzes.find(x=>x.id===qid); if (!quiz) return;
  const questionText = $('adminQuizQuestion') ? $('adminQuizQuestion').value.trim() : '';
  if (!questionText) return alert('Question requise');
  const type = $('adminQuestionType') ? $('adminQuestionType').value : 'single'; const points = $('adminQuestionPoints' )? Number($('adminQuestionPoints').value) || 1 : 1;
  const optsCandidates = ['adminOption1','adminOption2','adminOption3','adminOption4','adminOption5','adminOption6'];
  const options = optsCandidates.map(id=> $(id)? $(id).value.trim() : '').filter(x=>x && x.length>0);
  if (options.length < 2) return alert('Au moins 2 options requises');
  const correctStr = $('adminQuizCorrect') ? $('adminQuizCorrect').value.trim() : '1';
  const correctIndices = correctStr.split(',').map(s=>Number(s.trim())-1).filter(n=>!isNaN(n) && n>=0 && n<options.length);
  if (!correctIndices.length) return alert('Indices صحيحة مفقودة');
  const feedback = $('adminQuestionFeedback') ? $('adminQuestionFeedback').value : '';
  const fileInput = $('adminQuizImage');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const f = fileInput.files[0];
    const fr = new FileReader();
    fr.onload = function(ev){
      quiz.questions.push({ id: genId(), question:questionText, type, points, options, correctIndices, feedback, imageData: ev.target.result });
      saveData(); renderQuizAdminListDetailed(); renderQuizList(); alert('Question ajoutée avec image');
    };
    fr.readAsDataURL(f);
  } else {
    quiz.questions.push({ id: genId(), question:questionText, type, points, options, correctIndices, feedback, imageData: null });
    saveData(); renderQuizAdminListDetailed(); renderQuizList(); alert('Question ajoutée');
  }
  ['adminQuizQuestion','adminOption1','adminOption2','adminOption3','adminOption4','adminOption5','adminOption6','adminQuizCorrect','adminQuestionFeedback','adminQuizImage'].forEach(id=>{ if ($(id)) { try{ $(id).value=''; }catch(e){} } });
}

function renderQuizAdminListDetailed(){
  const el = $('quizQuestionsList'); if (!el) return; el.innerHTML='';
  if (!appData.quizzes.length) { if ($('adminSelectQuiz')) populateAdminSelectQuiz(); if (el) el.innerHTML = '<p class="muted">Aucun quiz</p>'; return; }
  appData.quizzes.forEach(q=>{
    const container = document.createElement('div');
    const header = document.createElement('div'); header.innerHTML = '<strong>'+escapeHtml(q.title)+'</strong> (durée: '+q.durationMinutes+'m, shuffle:'+ (q.shuffle?'oui':'non') +', attempts:'+(q.allowMultipleAttempts?'yes':'no')+')';
    container.appendChild(header);
    const ul = document.createElement('ol');
    q.questions.forEach((qq, idx)=>{
      const li = document.createElement('li');
      li.innerHTML = '<div><strong>'+escapeHtml(qq.question)+'</strong> ['+qq.type+'] (points: '+qq.points+')</div>';
      const opts = document.createElement('ul');
      qq.options.forEach((op,i)=> {
        const opLi = document.createElement('li'); opLi.textContent = (i+1)+'. '+op + (qq.correctIndices.includes(i) ? ' (✓ correct)' : '');
        opts.appendChild(opLi);
      });
      li.appendChild(opts);
      if (qq.feedback) { const fb = document.createElement('div'); fb.textContent = 'Feedback: '+qq.feedback; li.appendChild(fb); }
      if (qq.imageData) { const im = document.createElement('img'); im.src=qq.imageData; im.style.maxWidth='200px'; li.appendChild(im); }
      const btnUp = document.createElement('button'); btnUp.textContent='↑'; btnUp.addEventListener('click', ()=> { if (idx===0) return; q.questions.splice(idx-1,0,q.questions.splice(idx,1)[0]); saveData(); renderQuizAdminListDetailed(); });
      const btnDown = document.createElement('button'); btnDown.textContent='↓'; btnDown.addEventListener('click', ()=> { if (idx===q.questions.length-1) return; q.questions.splice(idx+1,0,q.questions.splice(idx,1)[0]); saveData(); renderQuizAdminListDetailed(); });
      const btnDel = document.createElement('button'); btnDel.textContent='Supprimer'; btnDel.addEventListener('click', ()=>{ if (!confirm('Supprimer question ?')) return; q.questions = q.questions.filter(x=>x.id!==qq.id); saveData(); renderQuizAdminListDetailed(); });
      const btnEdit = document.createElement('button'); btnEdit.textContent='Éditer'; btnEdit.addEventListener('click', ()=> {
        if ($('adminSelectQuiz')) $('adminSelectQuiz').value = q.id;
        if ($('adminQuizQuestion')) $('adminQuizQuestion').value = qq.question;
        if ($('adminQuestionType')) $('adminQuestionType').value = qq.type;
        if ($('adminQuestionPoints')) $('adminQuestionPoints').value = qq.points;
        if ($('adminOption1')) $('adminOption1').value = qq.options[0]||'';
        if ($('adminOption2')) $('adminOption2').value=qq.options[1]||'';
        if ($('adminOption3')) $('adminOption3').value=qq.options[2]||'';
        if ($('adminOption4')) $('adminOption4').value=qq.options[3]||'';
        if ($('adminOption5')) $('adminOption5').value=qq.options[4]||'';
        if ($('adminOption6')) $('adminOption6').value=qq.options[5]||'';
        if ($('adminQuizCorrect')) $('adminQuizCorrect').value = qq.correctIndices.map(i=>i+1).join(',');
        if ($('adminQuestionFeedback')) $('adminQuestionFeedback').value = qq.feedback||'';
        window.scrollTo(0,0);
        q.questions = q.questions.filter(x=>x.id!==qq.id); saveData(); renderQuizAdminListDetailed();
      });
      li.appendChild(btnUp); li.appendChild(btnDown); li.appendChild(btnEdit); li.appendChild(btnDel);
      ul.appendChild(li);
    });
    container.appendChild(ul);
    const btnDelQuiz = document.createElement('button'); btnDelQuiz.textContent='Supprimer quiz entier'; btnDelQuiz.addEventListener('click', ()=> { if (!confirm('Supprimer quiz entier ?')) return; appData.quizzes = appData.quizzes.filter(x=>x.id!==q.id); saveData(); renderQuizAdminListDetailed(); renderQuizList(); });
    container.appendChild(btnDelQuiz);
    el.appendChild(container);
  });
  populateAdminSelectQuiz();
  if ($('stats-quiz')) $('stats-quiz').textContent = appData.quizzes.reduce((acc,q)=>acc+q.questions.length,0);
}

/* =============================
   Student quiz runner and helpers
   ============================= */
let currentRun = null;

function renderQuizList(){
  const c = $('quizContent'); if (!c) return; c.innerHTML='';
  if (!appData.quizzes.length) return c.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>';
  appData.quizzes.forEach(q=>{
    const d = document.createElement('div'); d.innerHTML = '<h3>'+escapeHtml(q.title)+'</h3><p>'+q.questions.length+' questions</p>';
    const btn = document.createElement('button'); btn.textContent='Voir / Démarrer'; btn.addEventListener('click', ()=> {
      if (!appData.currentUser){ if ($('studentLoginModal')) $('studentLoginModal').style.display='block'; return; }
      startQuiz(q.id);
    });
    d.appendChild(btn); c.appendChild(d);
  });
}

function renderQuizListForStudent(){
  const c = $('studentQuizList'); if (!c) return; c.innerHTML='';
  if (!appData.quizzes.length) return c.innerHTML='<p class="muted">Aucun quiz</p>';
  appData.quizzes.forEach(q=> {
    const d = document.createElement('div'); d.innerHTML = '<strong>'+escapeHtml(q.title)+'</strong> — '+q.questions.length+' q';
    const start = document.createElement('button'); start.textContent='Démarrer'; start.addEventListener('click', ()=> { startQuiz(q.id); });
    const preview = document.createElement('button'); preview.textContent='Aperçu'; preview.addEventListener('click', ()=> previewQuizAsStudent(q.id));
    d.appendChild(start); d.appendChild(preview); c.appendChild(d);
  });
}

function startQuiz(quizId){
  const quiz = appData.quizzes.find(x=>x.id===quizId); if (!quiz) return alert('Quiz introuvable');
  let order = quiz.questions.map(q=>q.id);
  if (quiz.shuffle) order = shuffle(order.slice());
  currentRun = { quizId, order, pos:0, timeLeft: quiz.durationMinutes ? quiz.durationMinutes*60 : 0, timerInterval:null };
  if (currentRun.timeLeft > 0){
    currentRun.timerInterval = setInterval(()=> { currentRun.timeLeft--; renderTimer(); if (currentRun.timeLeft<=0){ clearInterval(currentRun.timerInterval); alert('Temps écoulé'); submitCurrentQuiz(); } }, 1000);
  }
  renderQuizRunner();
}

function renderTimer(){
  const area = $('quizTimer'); if (area && currentRun) area.textContent = formatTime(currentRun.timeLeft);
}

function renderQuizRunner(){
  const container = $('quizContainer'); if (!container) return;
  showSection('quiz'); switchStudentTab('quiz');
  container.style.display='block'; container.innerHTML='';
  if (!currentRun) return;
  const quiz = appData.quizzes.find(x=>x.id===currentRun.quizId);
  if (!quiz) return;
  const qid = currentRun.order[currentRun.pos];
  const qobj = quiz.questions.find(x=>x.id===qid);
  const header = document.createElement('div'); header.innerHTML = '<h3>'+escapeHtml(quiz.title)+' — Question '+(currentRun.pos+1)+'/'+currentRun.order.length+'</h3>';
  if (quiz.durationMinutes) header.innerHTML += '<div id="quizTimer">Temps restant: '+formatTime(currentRun.timeLeft)+'</div>';
  container.appendChild(header);
  const qdiv = document.createElement('div'); qdiv.innerHTML = '<p>'+escapeHtml(qobj.question)+'</p>'; container.appendChild(qdiv);
  if (qobj.imageData){ const img = document.createElement('img'); img.src=qobj.imageData; img.style.maxWidth='480px'; container.appendChild(img); }
  const sid = appData.currentUser.id;
  if (!appData.responses[sid]) appData.responses[sid] = {};
  if (!appData.responses[sid][currentRun.quizId]) appData.responses[sid][currentRun.quizId] = {};
  const userResp = appData.responses[sid][currentRun.quizId][qobj.id];

  const optsContainer = document.createElement('div');
  qobj.options.forEach((opt,i)=>{
    const optEl = document.createElement('div');
    optEl.textContent = String.fromCharCode(65+i) + '. ' + opt;
    optEl.style.cursor='pointer';
    optEl.style.padding='6px';
    optEl.style.margin='4px 0';
    optEl.style.borderRadius='6px';
    optEl.setAttribute('data-index', i);
    if (qobj.type === 'single') {
      if (userResp === i) { optEl.style.fontWeight='700'; optEl.style.background='#e0e0e0'; }
    } else {
      if (Array.isArray(userResp) && userResp.includes(i)) { optEl.style.fontWeight='700'; optEl.style.background='#e0e0e0'; }
    }
    optEl.addEventListener('click', ()=> {
      if (qobj.type === 'single') {
        appData.responses[sid][currentRun.quizId][qobj.id] = i;
      } else {
        let arr = Array.isArray(appData.responses[sid][currentRun.quizId][qobj.id]) ? appData.responses[sid][currentRun.quizId][qobj.id] : [];
        if (arr.includes(i)) arr = arr.filter(x=>x!==i); else arr.push(i);
        appData.responses[sid][currentRun.quizId][qobj.id] = arr;
      }
      saveData();
      renderQuizRunner();
    });
    optsContainer.appendChild(optEl);
  });
  container.appendChild(optsContainer);

  const nav = document.createElement('div'); nav.style.marginTop='12px';
  const btnPrev = document.createElement('button'); btnPrev.textContent='Précédent'; btnPrev.disabled = currentRun.pos === 0; btnPrev.addEventListener('click', ()=> { currentRun.pos = Math.max(0, currentRun.pos-1); renderQuizRunner(); });
  const btnNext = document.createElement('button'); btnNext.textContent='Suivant'; btnNext.disabled = currentRun.pos === currentRun.order.length-1; btnNext.addEventListener('click', ()=> { currentRun.pos = Math.min(currentRun.order.length-1, currentRun.pos+1); renderQuizRunner(); });
  const btnSubmit = document.createElement('button'); btnSubmit.textContent='Soumettre le quiz'; btnSubmit.addEventListener('click', ()=> submitCurrentQuiz());
  nav.appendChild(btnPrev); nav.appendChild(btnNext); nav.appendChild(btnSubmit);
  container.appendChild(nav);
}

function submitCurrentQuiz(){
  if (!currentRun) return;
  if (!confirm('Soumettre le quiz ?')) return;
  if (currentRun.timerInterval) clearInterval(currentRun.timerInterval);
  const quiz = appData.quizzes.find(x=>x.id===currentRun.quizId);
  const sid = appData.currentUser.id;
  const responses = (appData.responses[sid] && appData.responses[sid][currentRun.quizId]) || {};
  let totalPoints = 0, gotPoints = 0;
  quiz.questions.forEach(q=>{
    totalPoints += (q.points || 1);
    const user = responses[q.id];
    if (q.type === 'single'){
      if (user !== undefined && q.correctIndices.includes(user)) gotPoints += q.points || 1;
    } else {
      const userArr = Array.isArray(user) ? user.slice().sort((a,b)=>a-b) : [];
      const correctArr = q.correctIndices.slice().sort((a,b)=>a-b);
      if (userArr.length && userArr.length === correctArr.length && userArr.every((v,i)=>v===correctArr[i])) gotPoints += q.points || 1;
    }
  });
  alert('Résultat: ' + gotPoints + ' / ' + totalPoints);
  showQuizResultsForStudent(quiz.id, responses);
  currentRun = null;
  if ($('quizContainer')) $('quizContainer').style.display='none';
  saveData();
  renderQuizListForStudent();
}

function showQuizResultsForStudent(quizId, responses){
  const quiz = appData.quizzes.find(x=>x.id===quizId); if (!quiz) return;
  const container = $('studentQuizResults'); if (!container) return;
  container.innerHTML = '';
  const title = document.createElement('h3'); title.textContent = 'Résultats: ' + quiz.title; container.appendChild(title);
  quiz.questions.forEach((q,idx)=>{
    const block = document.createElement('div'); block.style.marginBottom='8px';
    const user = responses[q.id];
    const correctIndices = q.correctIndices;
    let userStr = '';
    if (q.type === 'single'){ userStr = (user === undefined ? 'Aucune réponse' : String.fromCharCode(65+user)); }
    else if (Array.isArray(user) && user.length) userStr = user.map(i=>String.fromCharCode(65+i)).join(', '); else userStr = 'Aucune réponse';
    const correctStr = correctIndices.map(i=>String.fromCharCode(65+i)).join(', ');
    block.innerHTML = '<div><strong>Q'+(idx+1)+':</strong> '+escapeHtml(q.question)+'</div><div>Votre réponse: '+escapeHtml(userStr)+' — Correcte: '+escapeHtml(correctStr)+'</div>';
    if (q.feedback) block.innerHTML += '<div>Explication: '+escapeHtml(q.feedback)+'</div>';
    container.appendChild(block);
  });
}

function previewQuizAsStudent(quizId){
  if (!appData.currentUser || appData.isAdmin){
    let demo = appData.students[0] || { id:'demo', fullname:'Élève démo', username:'demo' };
    appData.currentUser = demo; appData.isAdmin=false; saveData();
    startQuiz(quizId);
  } else {
    startQuiz(quizId);
  }
}

/* =============================
   Lessons / Exercises / Exams + regrade
   ============================= */
function adminSaveLesson(){ if (!$('adminLessonTitle')) return; const title=$('adminLessonTitle').value.trim(), link=$('adminLessonDriveLink').value.trim(); if(!title||!link) return alert('Titre و lien requis'); appData.lessons.push({id:genId(),title,driveLink:link}); saveData(); renderLessons(); renderLessonsAdminList(); alert('Leçon ajoutée'); if ($('adminLessonTitle')) $('adminLessonTitle').value=''; if ($('adminLessonDriveLink')) $('adminLessonDriveLink').value=''; }
function renderLessons(){ const c=$('lessonsContent'); if(!c) return; c.innerHTML=''; if(!appData.lessons.length) return c.innerHTML='<p class="muted">Aucune leçon</p>'; appData.lessons.forEach(l=>{ const d=document.createElement('div'); const a=document.createElement('a'); a.href=l.driveLink; a.target='_blank'; a.rel='noopener'; a.textContent=l.title; d.appendChild(a); c.appendChild(d); }); }
function renderLessonsAdminList(){ const c=$('lessonsAdminList'); if(!c) return; c.innerHTML=''; if(!appData.lessons.length) return c.innerHTML='<p class="muted">Aucune leçon</p>'; appData.lessons.forEach(l=>{ const d=document.createElement('div'); d.innerHTML = escapeHtml(l.title) + ' '; const a=document.createElement('a'); a.href=l.driveLink; a.textContent='ouvrir'; a.target='_blank'; d.appendChild(a); const del=document.createElement('button'); del.textContent='Supprimer'; del.addEventListener('click', ()=> { if(!confirm('Supprimer leçon ?')) return; appData.lessons = appData.lessons.filter(x=>x.id!==l.id); saveData(); renderLessonsAdminList(); renderLessons(); }); d.appendChild(del); c.appendChild(d); }); }

function adminSaveExercise(){ if (!$('adminExerciseTitle')) return; const title=$('adminExerciseTitle').value.trim(), link=$('adminExerciseDriveLink').value.trim(); if(!title||!link) return alert('Titre و lien requis'); appData.exercises.push({id:genId(),title,driveLink:link}); saveData(); renderExercises(); renderExercisesAdminList(); alert('Exercice ajouté'); if ($('adminExerciseTitle')) $('adminExerciseTitle').value=''; if ($('adminExerciseDriveLink')) $('adminExerciseDriveLink').value=''; }
function renderExercises(){ const c=$('exercisesContent'); if(!c) return; c.innerHTML=''; if(!appData.exercises.length) return c.innerHTML='<p class="muted">Aucun exercice</p>'; appData.exercises.forEach(e=>{ const d=document.createElement('div'); const a=document.createElement('a'); a.href=e.driveLink; a.target='_blank'; a.textContent=e.title; d.appendChild(a); c.appendChild(d); }); }
function renderExercisesAdminList(){ const c=$('exercisesAdminList'); if(!c) return; c.innerHTML=''; if(!appData.exercises.length) return c.innerHTML='<p class="muted">Aucun exercice</p>'; appData.exercises.forEach(e=>{ const d=document.createElement('div'); d.innerHTML = escapeHtml(e.title) + ' '; const a=document.createElement('a'); a.href=e.driveLink; a.textContent='ouvrir'; a.target='_blank'; d.appendChild(a); const del=document.createElement('button'); del.textContent='Supprimer'; del.addEventListener('click', ()=> { if(!confirm('Supprimer exercice ?')) return; appData.exercises = appData.exercises.filter(x=>x.id!==e.id); saveData(); renderExercisesAdminList(); renderExercises(); }); d.appendChild(del); c.appendChild(d); }); }

function adminSaveExam(){ if (!$('adminExamTitle')) return; const title=$('adminExamTitle').value.trim(), link=$('adminExamDriveLink').value.trim(); if(!title||!link) return alert('Titre و lien requis'); appData.exams.push({id:genId(),title,driveLink:link}); saveData(); renderExams(); renderExamsAdminList(); alert('Examen ajouté'); if ($('adminExamTitle')) $('adminExamTitle').value=''; if ($('adminExamDriveLink')) $('adminExamDriveLink').value=''; }
function renderExams(){ const c=$('examsContent'); if(!c) return; c.innerHTML=''; if(!appData.exams.length) return c.innerHTML='<p class="muted">Aucun examen</p>';
  appData.exams.forEach(e=>{
    const d=document.createElement('div');
    const a=document.createElement('a'); a.href=e.driveLink; a.target='_blank'; a.textContent=e.title; d.appendChild(a);

    if (appData.currentUser && !appData.isAdmin){
      const reqBtn = document.createElement('button'); reqBtn.textContent='طلب إعادة تصحيح';
      reqBtn.style.marginLeft='8px';
      reqBtn.addEventListener('click', ()=> {
        const note = prompt('اكتب ملاحظة لطلب إعادة التصحيح (اختياري):');
        if (note === null) return;
        studentRequestRegrade(e.id, note || '');
        alert('تم إرسال طلب إعادة التصحيح');
      });
      d.appendChild(reqBtn);
    }

    c.appendChild(d);
  });
}

function renderExamsAdminList(){ const c=$('examsAdminList'); if(!c) return; c.innerHTML=''; if(!appData.exams.length) return c.innerHTML='<p class="muted">Aucun examen</p>'; appData.exams.forEach(e=>{ const d=document.createElement('div'); d.innerHTML=escapeHtml(e.title)+' '; const a=document.createElement('a'); a.href=e.driveLink; a.textContent='ouvrir'; a.target='_blank'; d.appendChild(a); const del=document.createElement('button'); del.textContent='Supprimer'; del.addEventListener('click', ()=>{ if(!confirm('Supprimer examen ?')) return; appData.exams=appData.exams.filter(x=>x.id!==e.id); saveData(); renderExamsAdminList(); renderExams(); }); d.appendChild(del); c.appendChild(d); }); }

function studentRequestRegrade(examId, note){
  if (!appData.currentUser) return alert('Connectez-vous');
  const req = { id: genId(), examId, studentId: appData.currentUser.id, note: note || '', createdAt: Date.now(), handled:false };
  appData.regradeRequests = appData.regradeRequests || [];
  appData.regradeRequests.push(req);
  saveData();
  appData.messages = appData.messages || [];
  appData.messages.push({ id: genId(), title: 'طلب إعادة تصحيح', content: 'طالب طلب إعادة تصحيح لامتحان (id:' + examId + ') — ملاحظة: ' + note, target:'all', createdAt:Date.now() });
  saveData();
  renderRegradeRequestsAdminList();
  renderStudentMessages();
}

function renderRegradeRequestsAdminList(){
  const c = $('regradeRequestsList'); if (!c) return;
  c.innerHTML = '';
  const list = appData.regradeRequests || [];
  if (!list.length) { c.innerHTML = '<p class="muted">لا توجد طلبات إعادة تصحيح</p>'; return; }
  list.forEach(req=>{
    const st = appData.students.find(s=>s.id===req.studentId);
    const ex = appData.exams.find(e=>e.id===req.examId);
    const d = document.createElement('div'); d.style.marginBottom='8px';
    d.innerHTML = '['+new Date(req.createdAt).toLocaleString()+'] <strong>' + escapeHtml(st?st.fullname:'') + '</strong> — ' + escapeHtml(ex?ex.title:'(exam)') + ' — ' + escapeHtml(req.note || '');
    const markDone = document.createElement('button'); markDone.textContent = req.handled ? 'معالج' : 'وضع كمُعالَج'; markDone.style.marginLeft='8px';
    markDone.addEventListener('click', ()=>{ req.handled = true; saveData(); renderRegradeRequestsAdminList(); alert('وضع كمُعالَج'); });
    const del = document.createElement('button'); del.textContent='حذف'; del.style.marginLeft='6px';
    del.addEventListener('click', ()=>{ if (!confirm('Supprimer request ?')) return; appData.regradeRequests = appData.regradeRequests.filter(r=>r.id!==req.id); saveData(); renderRegradeRequestsAdminList(); });
    d.appendChild(markDone); d.appendChild(del);
    c.appendChild(d);
  });
}

/* =============================
   Announcement image handling
   ============================= */
function handleAnnouncementImage(e){
  const f = e.target.files[0]; if (!f) return;
  const fr = new FileReader(); fr.onload = function(ev){ appData.announcement.image = ev.target.result; if ($('announcementImagePreview')) { $('announcementImagePreview').src = ev.target.result; $('announcementImagePreview').style.display='block'; } if ($('announcementImage')) { $('announcementImage').src = ev.target.result; $('announcementImage').style.display='block'; } if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='inline-block'; saveData(); }; fr.readAsDataURL(f);
}

/* =============================
   Slider handling (front page under announcement)
   ============================= */
function renderFrontSlider(){
  const container = $('front-hero-slider');
  if (!container) return;
  container.innerHTML = '';
  if (!appData.slides || !appData.slides.length){ container.innerHTML = '<div class="muted">لا توجد شرائح حاليا</div>'; return; }
  const wrapper = document.createElement('div'); wrapper.style.whiteSpace='nowrap'; wrapper.style.overflowX='auto'; wrapper.style.padding='8px 0';
  appData.slides.forEach((sld, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.style.display = 'inline-block';
    slide.style.verticalAlign = 'top';
    slide.style.minWidth = '220px';
    slide.style.maxWidth = '320px';
    slide.style.position = 'relative';
    slide.style.borderRadius = '8px';
    slide.style.overflow = 'hidden';
    slide.style.boxShadow = '0 6px 16px rgba(12,25,40,0.06)';
    slide.style.background = '#fff';
    slide.style.padding = '6px';
    slide.style.margin = '0 8px';
    const img = document.createElement('img');
    img.src = sld.url || '';
    img.alt = sld.alt || ('Slide '+(i+1));
    img.style.maxHeight = '160px';
    img.style.width = '100%';
    img.style.objectFit = 'cover';
    img.onerror = () => { img.style.display = 'none'; };
    slide.appendChild(img);
    if (sld.alt) {
      const cap = document.createElement('div'); cap.textContent = sld.alt; cap.style.paddingTop='6px'; cap.style.fontSize='13px'; slide.appendChild(cap);
    }
    wrapper.appendChild(slide);
  });
  container.appendChild(wrapper);
}

function renderSliderAdminList(){
  const c = $('sliderAdminList');
  if (!c) return;
  c.innerHTML = '';
  if (!appData.slides || !appData.slides.length) { c.innerHTML = '<p class="muted">Aucun slide pour le moment.</p>'; return; }
  appData.slides.forEach((sld, idx) => {
    const d = document.createElement('div'); d.className='content-row'; d.style.marginBottom='8px';
    const img = document.createElement('img'); img.src = sld.url; img.style.maxWidth='140px'; img.style.display='inline-block'; img.style.verticalAlign='middle'; img.onerror = ()=>{ img.style.display='none'; };
    const info = document.createElement('span'); info.style.marginLeft='8px'; info.innerHTML = escapeHtml(sld.alt || ('Slide '+(idx+1)));
    const del = document.createElement('button'); del.textContent='حذف'; del.style.marginLeft='8px';
    del.addEventListener('click', ()=>{ if(!confirm('Supprimer ce slide ?')) return; appData.slides.splice(idx,1); saveData(); renderSliderAdminList(); renderFrontSlider(); });
    const up = document.createElement('button'); up.textContent='↑'; up.style.marginLeft='6px'; up.addEventListener('click', ()=>{ if(idx===0) return; const a=appData.slides[idx-1]; appData.slides[idx-1]=appData.slides[idx]; appData.slides[idx]=a; saveData(); renderSliderAdminList(); renderFrontSlider(); });
    const down = document.createElement('button'); down.textContent='↓'; down.style.marginLeft='6px'; down.addEventListener('click', ()=>{ if(idx===appData.slides.length-1) return; const a=appData.slides[idx+1]; appData.slides[idx+1]=appData.slides[idx]; appData.slides[idx]=a; saveData(); renderSliderAdminList(); renderFrontSlider(); });
    d.appendChild(img); d.appendChild(info); d.appendChild(up); d.appendChild(down); d.appendChild(del);
    c.appendChild(d);
  });
}

function adminAddSliderImageFromUrl(url){
  if (!url) return alert('ضع رابط الصورة للسلايد');
  appData.slides = appData.slides || [];
  appData.slides.push({ id: genId(), url: url, alt: '' });
  saveData(); renderSliderAdminList(); renderFrontSlider(); alert('Slide ajouté');
}

function adminAddSliderImageFromFile(file){
  if (!file) return;
  const fr = new FileReader();
  fr.onload = function(ev){
    appData.slides = appData.slides || [];
    appData.slides.push({ id: genId(), url: ev.target.result, alt: '' });
    saveData(); renderSliderAdminList(); renderFrontSlider(); alert('Slide ajouté (upload)');
  };
  fr.readAsDataURL(file);
}

function wireSliderAdminEvents(){
  const btn = $('btnAddSliderImage');
  if (btn) {
    btn.addEventListener('click', ()=> {
      const url = $('sliderImageUrl') ? $('sliderImageUrl').value.trim() : '';
      const fileInput = $('sliderImageUpload');
      if (url) adminAddSliderImageFromUrl(url);
      else if (fileInput && fileInput.files && fileInput.files[0]) adminAddSliderImageFromFile(fileInput.files[0]);
      else alert('Choisir une image ou fournir URL');
      if ($('sliderImageUrl')) $('sliderImageUrl').value='';
      if (fileInput) fileInput.value='';
    });
  }
  const clr = $('btnClearSlider');
  if (clr) clr.addEventListener('click', ()=> { if (!confirm('Vider tout le slider ?')) return; appData.slides = []; saveData(); renderSliderAdminList(); renderFrontSlider(); });
}

/* =============================
   Student dashboard rendering (quick view)
   ============================= */
function loadStudentDashboard(){
  if (!appData.currentUser || appData.isAdmin) return;
  const studentId = appData.currentUser.id;
  const recentEl = $('studentRecentGrades'); if (recentEl) {
    const grades = (appData.grades||[]).filter(g=>g.studentId===studentId).sort((a,b)=>new Date(b.date)-new Date(a.date));
    if (!grades.length) recentEl.innerHTML = '<p class="muted">Aucune note disponible pour le moment.</p>';
    else {
      recentEl.innerHTML = '<ul>' + grades.slice(0,6).map(g=>'<li>'+ escapeHtml(g.subject) +' - '+ escapeHtml(g.title) +' : '+ (g.score||0) +'/20 ('+ new Date(g.date).toLocaleDateString()+')</li>').join('') + '</ul>';
    }
  }
  const quizEl = $('studentQuizList'); if (quizEl) {
    const list = (appData.quizzes||[]).map(q=>({id:q.id,title:q.title, count:q.questions.length}));
    if (!list.length) quizEl.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>';
    else quizEl.innerHTML = '<ul>' + list.map(q=>'<li>'+ escapeHtml(q.title) +' ('+ q.count +' questions)</li>').join('') + '</ul>';
  }
  const examsEl = $('studentExamsQuick'); if (examsEl){
    if (!appData.exams || !appData.exams.length) examsEl.innerHTML = '<p class="muted">Aucun examen</p>';
    else {
      examsEl.innerHTML = '<ul>' + appData.exams.map(e => {
        return '<li>' + escapeHtml(e.title) + ' <button data-exid="'+e.id+'" class="dashboard-regrade">طلب إعادة تصحيح</button></li>';
      }).join('') + '</ul>';
      document.querySelectorAll('.dashboard-regrade').forEach(btn=>{
        btn.addEventListener('click', ()=> {
          const exid = btn.getAttribute('data-exid');
          const note = prompt('اكتب ملاحظة لطلب إعادة التصحيح (اختياري):');
          if (note === null) return;
          studentRequestRegrade(exid, note || '');
          alert('تم إرسال طلب إعادة التصحيح');
        });
      });
    }
  }
}

/* =============================
   Student exercises rendering - ADDED: Missing function
   ============================= */
function renderStudentExercises(){
  const c = $('studentExercisesList');
  if (!c) return;
  c.innerHTML = '';
  
  if (!appData.exercises.length) {
    c.innerHTML = '<p class="muted">Aucun exercice disponible</p>';
    return;
  }
  
  appData.exercises.forEach(ex => {
    const div = document.createElement('div');
    div.className = 'content-card';
    div.innerHTML = `
      <div class="card-content">
        <h3>${escapeHtml(ex.title)}</h3>
        <a href="${ex.driveLink}" target="_blank" rel="noopener">Ouvrir l'exercice</a>
      </div>
    `;
    c.appendChild(div);
  });
}

/* =============================
   Notification helper
   ============================= */
function notifyStudents(type, title, content){
  appData.messages = appData.messages || [];
  appData.messages.push({ id: genId(), title: title, content: content, target:'all', createdAt:Date.now() });
  saveData();
  renderAdminMessagesList();
  renderStudentMessages();
  if (appData.currentUser && !appData.isAdmin) {
    loadStudentDashboard();
    alert(title + '\n' + content);
  }
}

/* =============================
   LaTeX editor / spacing fix in preview
   ============================= */
function updateLatexLineNumbers(){
  const ta = $('latexCode'); const ln = $('latexLineNumbers'); const preview = $('latexPreview');
  if (!ta || !ln || !preview) return;
  const lines = (ta.value || '').split('\n').length;
  const count = Math.min(Math.max(lines,1),2000);
  let out = '';
  for (let i=1;i<=count;i++){ out += i + '\n'; }
  ln.textContent = out;
  preview.innerHTML = ta.value ? ('\\[' + ta.value.replace(/ /g,'\\ ') + '\\]') : 'معاينة LaTeX...';
  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([preview]).catch(()=>{});
}

function adminSaveLatex(){
  if (!$('latexTitle')) return;
  const title = $('latexTitle').value.trim(); const code = $('latexCode').value; const desc = $('latexDescription').value; const cat = $('latexCategory').value;
  if (!title || !code) return alert('Titre و code requis');
  appData.latexContents.push({ id: genId(), title, code, description: desc, category: cat, createdAt: Date.now() });
  saveData(); alert('Leçon LaTeX محفوظة'); loadLatexAdminList(); renderLatexListForStudents();
  if ($('latexTitle')) $('latexTitle').value=''; if ($('latexCode')) $('latexCode').value=''; if ($('latexDescription')) $('latexDescription').value=''; if ($('latexCategory')) $('latexCategory').value=''; updateLatexLineNumbers();
}

function loadLatexAdminList(){
  const c = $('latexContentsList'); if (!c) return; c.innerHTML='';
  if (!appData.latexContents.length) return c.innerHTML = '<p class="muted">لا توجد دروس حتى الآن.</p>';
  appData.latexContents.forEach(item=>{
    const d = document.createElement('div'); d.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong> — ' + escapeHtml(item.description || '');
    const btnPreview = document.createElement('button'); btnPreview.textContent='معاينة'; btnPreview.addEventListener('click', ()=> {
      const preview = $('latexPreview'); if (!preview) return;
      preview.innerHTML = '\\[' + item.code + '\\]'; if (window.MathJax) MathJax.typesetPromise([preview]).catch(()=>{});
    });
    const btnDel = document.createElement('button'); btnDel.textContent='Supprimer'; btnDel.addEventListener('click', ()=> { if(!confirm('Supprimer الدرس ؟')) return; appData.latexContents = appData.latexContents.filter(x=>x.id!==item.id); saveData(); loadLatexAdminList(); renderLatexListForStudents(); });
    d.appendChild(btnPreview); d.appendChild(btnDel); c.appendChild(d);
  });
  if ($('stats-latex')) $('stats-latex').textContent = appData.latexContents.length;
}

function renderLatexListForStudents(){
  const c = $('studentCoursList'); if (!c) return; c.innerHTML='';
  if (!appData.latexContents.length) return c.innerHTML='<p class="muted">لا توجد دروس</p>';
  appData.latexContents.forEach(item=>{
    const d = document.createElement('div'); d.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong> — ' + escapeHtml(item.description || '');
    const btn = document.createElement('button'); btn.textContent='معاينة'; btn.addEventListener('click', ()=> {
      const target = $('quizContent'); if (!target) return;
      target.innerHTML = '<h3>' + escapeHtml(item.title) + '</h3><div id="studentLatexArea">\\[' + item.code + '\\]</div>';
      if (window.MathJax) MathJax.typesetPromise([document.getElementById('studentLatexArea')]).catch(()=>{});
    });
    d.appendChild(btn); c.appendChild(d);
  });
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
}

/* =============================
   Grades search by code (kept)
   ============================= */
function searchGradesByCode(code){
  const s = appData.students.find(x=>x.code === code);
  if (!s) return alert('Code parcours non trouvé');
  const g = appData.grades.filter(x=>x.studentId === s.id);
  if ($('gradesResults')) $('gradesResults').style.display='block';
  if ($('studentInfo')) $('studentInfo').innerHTML = '<div class="content-card"><div class="card-content"><h3>' + escapeHtml(s.fullname) + '</h3><p>Classe: ' + escapeHtml(s.classroom||'') + '</p><p>Code: ' + escapeHtml(s.code||'') + '</p></div></div>';
  const tbody = document.querySelector('#gradesTable tbody'); if (!tbody) return;
  tbody.innerHTML = '';
  if (!g.length) { if ($('noGradesMsg')) $('noGradesMsg').style.display='block'; } else { if ($('noGradesMsg')) $('noGradesMsg').style.display='none'; g.forEach(grade=>{ const row=document.createElement('tr'); row.innerHTML = '<td>' + new Date(grade.date).toLocaleDateString() + '</td><td>' + escapeHtml(grade.subject) + '</td><td>' + escapeHtml(grade.title) + '</td><td>' + grade.score + '/20</td><td>' + escapeHtml(grade.note || '') + '</td>'; tbody.appendChild(row); }); }
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
   End of file
   ============================= */
