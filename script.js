// Unified dashboard JS - FIXED & IMPROVED
// Changes in this version (v7):
// - Fixed student regrade request exam selection (now shows only exams with published grades)
// - Improved site cover with professional slider design
// - Fixed student messaging system (now shows student names)
// - Fixed grade search by student code

const STORAGE_KEY = 'lyceeExcellence_v_7';
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
  exercises: [ { id: "mfj2mukk2edjb", title: "Série N’1 Physique-Chimie", driveLink: "https://drive.google.com/file/d/1Ck4CbEtKofWPd11xAOxJVCQI7b8v65vK/view?usp=sharing" } ],
  exams: [],
  messages: [],
  latexContents: [],
  slides: [
    { id: "slide1", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", alt: "تعليم متميز" },
    { id: "slide2", url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", alt: "فصول دراسية حديثة" },
    { id: "slide3", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", alt: "تعاون أكاديمي" }
  ],
  responses: {},
  regradeRequests: [],
  currentUser: { id: "admin", fullname: "Administrateur" },
  isAdmin: true,
  announcement: { text: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة", image: null },
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

/* small helpers */
function $(id){ return document.getElementById(id); }
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escapeHtml(s){ return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

/* Create a nicer button quickly */
function makeButton(label, onClick, opts={}){
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.padding = '8px 12px';
  b.style.borderRadius = '8px';
  b.style.border = '1px solid rgba(0,0,0,0.08)';
  b.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,245,245,0.9))';
  b.style.cursor = 'pointer';
  b.style.boxShadow = '0 4px 10px rgba(12,25,40,0.04)';
  b.style.marginLeft = opts.marginLeft || '6px';
  if (opts.className) b.className = opts.className;
  if (typeof onClick === 'function') b.addEventListener('click', onClick);
  return b;
}

/* push notifications to dashboard (replace alert())
   opts: { target: 'all'|'specific', specific: studentId|null, severity: 'info'|'warn'|'error' }
*/
function pushNotification(title, content, opts={}){
  opts = Object.assign({target:'all', specific:null, severity:'info'}, opts);
  const msg = { id: genId(), title: title||'', content: content||'', target: opts.target, specific: opts.specific, createdAt: Date.now(), severity: opts.severity };
  appData.messages = appData.messages || [];
  appData.messages.push(msg);
  saveData();
  // render lists wherever present
  renderAdminMessagesList();
  renderStudentMessages();
  // also show in student dashboard area if visible and target matches current user
  displayDashboardMessage(msg);
}

function displayDashboardMessage(msg){
  const container = $('dashboardMessages');
  if (!container){
    // no dedicated area: fallback to alert for critical errors
    if (typeof window !== 'undefined' && (msg.severity === 'error' || msg.severity === 'warn')) alert((msg.title?msg.title+'\n':'') + msg.content);
    return;
  }
  // only display if message is for 'all' or it's specific to current user
  if (msg.target === 'all' || (appData.currentUser && msg.specific === appData.currentUser.id) || (msg.target==='specific' && !msg.specific && appData.currentUser && appData.currentUser.id)){
    const div = document.createElement('div');
    div.className = 'dash-msg';
    div.style.border = '1px solid rgba(0,0,0,0.06)';
    div.style.padding = '8px 10px';
    div.style.marginBottom = '8px';
    div.style.borderRadius = '8px';
    div.style.background = '#fff';
    const t = document.createElement('div'); t.style.fontWeight='700'; t.textContent = msg.title || 'Message';
    const c = document.createElement('div'); c.style.marginTop='4px'; c.textContent = msg.content || '';
    const time = document.createElement('div'); time.style.fontSize='12px'; time.style.opacity='0.6'; time.style.marginTop='6px'; time.textContent = new Date(msg.createdAt).toLocaleString();
    const del = makeButton('حذف', ()=>{ container.removeChild(div); appData.messages = appData.messages.filter(x=>x.id!==msg.id); saveData(); renderAdminMessagesList(); });
    del.style.marginLeft='10px'; del.style.padding='6px 8px';
    div.appendChild(t); div.appendChild(c); div.appendChild(time); div.appendChild(del);
    container.insertBefore(div, container.firstChild);
  }
}

/* initialize */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  wireEvents();
  // slider admin events only if main admin (id === 'admin')
  wireSliderAdminEvents();
  refreshUI();
  setTimeout(()=>{ renderAll(); renderFrontSlider(); }, 50);
});

/* =============================
   Wiring UI events
   ============================= */
function wireEvents(){
  document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const s=a.getAttribute('data-section'); showSection(s); }));
  document.querySelectorAll('.feature-card').forEach(c => c.addEventListener('click', ()=> { const s=c.getAttribute('data-section'); showSection(s); }));

  if ($('studentLoginBtn')) $('studentLoginBtn').addEventListener('click', ()=> { if ($('studentLoginModal')) $('studentLoginModal').style.display='block'; });
  if ($('loginBtn')) $('loginBtn').addEventListener('click', ()=> { if ($('loginModal')) $('loginModal').style.display='block'; });
  if ($('cancelStudentLogin')) $('cancelStudentLogin').addEventListener('click', ()=> { if ($('studentLoginModal')) $('studentLoginModal').style.display='none'; });
  if ($('cancelLogin')) $('cancelLogin').addEventListener('click', ()=> { if ($('loginModal')) $('loginModal').style.display='none'; });

  if ($('submitStudentLogin')) $('submitStudentLogin').addEventListener('click', ()=> {
    const u = $('studentUsername').value.trim(), p = $('studentPassword').value; loginStudent(u,p);
  });
  if ($('submitLogin')) $('submitLogin').addEventListener('click', ()=> {
    const u = $('username').value.trim(), p = $('password').value; loginAdmin(u,p);
  });

  if ($('studentLogoutBtn')) $('studentLogoutBtn').addEventListener('click', ()=> { appData.currentUser=null; appData.isAdmin=false; saveData(); refreshUI(); });
  if ($('logoutBtn')) $('logoutBtn').addEventListener('click', ()=> { appData.currentUser=null; appData.isAdmin=false; saveData(); refreshUI(); });

  document.querySelectorAll('.student-tab').forEach(t => t.addEventListener('click', ()=> { const name = t.getAttribute('data-tab'); switchStudentTab(name); }));
  document.querySelectorAll('.admin-tab-link').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const tab = a.getAttribute('data-tab'); switchAdminTab(tab); }));

  if ($('announcementImageInput')) $('announcementImageInput').addEventListener('change', handleAnnouncementImage);
  if ($('btnSaveAnnouncement')) $('btnSaveAnnouncement').addEventListener('click', ()=> { if ($('announcementInput')) appData.announcement.text = $('announcementInput').value; if ($('announcementText')) $('announcementText').textContent = appData.announcement.text; saveData(); pushNotification('Annonce enregistrée', appData.announcement.text, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
  if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').addEventListener('click', ()=> { appData.announcement.image=null; saveData(); if ($('announcementImagePreview')) $('announcementImagePreview').style.display='none'; if ($('announcementImage')) $('announcementImage').style.display='none'; if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='none'; pushNotification('Image supprimée', 'تم حذف صورة الإعلان', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });

  if ($('btnExport')) $('btnExport').addEventListener('click', ()=> {
    const blob = new Blob([JSON.stringify(appData)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='lycee_data.json'; a.click(); URL.revokeObjectURL(url); pushNotification('Export', 'Export des données terminé', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
  });
  if ($('importFile')) $('importFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader(); fr.onload = function(ev){ try { if (!confirm('Importer va remplacer البيانات الحالية. Continuer?')) return; appData = JSON.parse(ev.target.result); saveData(); renderAll(); refreshUI(); pushNotification('Import réussi','Fichier importé avec succès',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); } catch(err){ pushNotification('Fichier invalide','تعذر استيراد الملف',{ severity:'error' }); } }; fr.readAsText(f);
  });

  if ($('btnCreateQuiz')) $('btnCreateQuiz').addEventListener('click', adminCreateQuiz);
  if ($('adminBtnSaveQuiz')) $('adminBtnSaveQuiz').addEventListener('click', adminAddQuestion);
  if ($('adminBtnPreviewQuiz')) $('adminBtnPreviewQuiz').addEventListener('click', ()=> { const qid = $('adminSelectQuiz').value; if (!qid){ pushNotification('Sélectionner quiz','Veuillez sélectionner un quiz',{ severity:'warn' }); return;} previewQuizAsStudent(qid); });

  if ($('adminBtnSaveLesson')) $('adminBtnSaveLesson').addEventListener('click', adminSaveLesson);
  if ($('adminBtnSaveExercise')) $('adminBtnSaveExercise').addEventListener('click', adminSaveExercise);
  if ($('adminBtnSaveExam')) $('adminBtnSaveExam').addEventListener('click', adminSaveExam);

  if ($('btnSaveStudent')) $('btnSaveStudent').addEventListener('click', adminSaveStudent);
  if ($('btnSaveGrade')) $('btnSaveGrade').addEventListener('click', adminSaveGrade);
  if ($('adminBtnSendMessage')) $('adminBtnSendMessage').addEventListener('click', adminSendMessage);

  if ($('latexCode')) {
    $('latexCode').addEventListener('input', updateLatexLineNumbers);
    updateLatexLineNumbers();
  }
  if ($('btnSaveLatex')) $('btnSaveLatex').addEventListener('click', adminSaveLatex);
  
  // Search grades by code
  if ($('btnSearchGrades')) $('btnSearchGrades').addEventListener('click', ()=> {
    const code = $('searchCodeInput').value.trim();
    if (!code) return pushNotification('Code requis','Veuillez entrer un code',{ severity:'warn' });
    searchGradesByCode(code);
  });
}

/* UI switching helpers unchanged (kept compact) */
function hideAllMainSections(){ document.querySelectorAll('.page-section').forEach(s => s.style.display='none'); if ($('student-dashboard')) $('student-dashboard').style.display='none'; if ($('admin-panel')) $('admin-panel').style.display='none'; }
function showSection(id){ hideAllMainSections(); if (id === 'home') { if ($('home-section')) $('home-section').style.display='block'; return; } const el = document.getElementById(id); if (el) el.style.display='block'; if (id === 'quiz') renderQuizList(); if (id === 'lessons') renderLessons(); if (id === 'exercises') renderExercises(); if (id === 'exams') renderExams(); if (id === 'dictionary') renderDictionary(); }

function switchStudentTab(tabName){ document.querySelectorAll('.student-tab-content').forEach(x=>x.style.display='none'); document.querySelectorAll('.student-tab').forEach(t=>t.classList.remove('active')); const btn = document.querySelector('.student-tab[data-tab="'+tabName+'"]'); if (btn) btn.classList.add('active'); const content = document.getElementById('student-'+tabName+'-tab'); if (content) content.style.display='block'; if (tabName === 'dashboard') loadStudentDashboard(); if (tabName === 'quiz') renderQuizListForStudent(); if (tabName === 'exercises') { if (typeof renderStudentExercises === 'function') renderStudentExercises(); } if (tabName === 'cours') renderLatexListForStudents(); if (tabName === 'messages') renderStudentMessages(); if (tabName === 'exams') renderExams(); }

function switchAdminTab(tabName){ document.querySelectorAll('.admin-section').forEach(s=>s.style.display='none'); document.querySelectorAll('.admin-tab-link').forEach(l=>l.classList.remove('active')); const link = document.querySelector('.admin-tab-link[data-tab="'+tabName+'"]'); if (link) link.classList.add('active'); const el = document.getElementById(tabName); if (el) el.style.display='block'; if (tabName === 'tab-students') loadStudentsTable(); if (tabName === 'tab-grades') loadGradesTable(); if (tabName === 'tab-quiz') renderQuizAdminListDetailed(); if (tabName === 'tab-latex') loadLatexAdminList(); if (tabName === 'tab-messages') renderAdminMessagesList(); if (tabName === 'tab-lessons') renderLessonsAdminList(); if (tabName === 'tab-exercises') renderExercisesAdminList(); if (tabName === 'tab-exams') { renderExamsAdminList(); renderRegradeRequestsAdminList(); } }

/* Authentication */
function loginStudent(username, password){
  const s = appData.students.find(x=>x.username===username && x.password===password);
  if (!s) { pushNotification('خطأ في تسجيل الدخول','Nom d\'utilisateur ou mot de passe incorrect',{ severity:'error' }); return; }
  appData.currentUser = s; appData.isAdmin = false; saveData(); refreshUI(); if ($('studentLoginModal')) $('studentLoginModal').style.display='none'; switchStudentTab('dashboard'); pushNotification('Bienvenue', 'Bienvenue, ' + (s.fullname||''), { target:'specific', specific: s.id });
}

function loginAdmin(username, password){
  if (username === 'admin' && password === 'admin123') {
    appData.currentUser = { id:'admin', fullname:'Administrateur' }; appData.isAdmin = true; saveData(); refreshUI(); if ($('loginModal')) $('loginModal').style.display='none'; switchAdminTab('tab-dashboard'); pushNotification('Connexion admin', 'Vous êtes connecté en tant qu\'Administrateur', { target:'specific', specific:'admin' }); return;
  }
  pushNotification('خطأ في تسجيل الدخول','Nom d\'utilisateur ou mot de passe incorrect',{ severity:'error' });
}

/* Refresh UI */
function refreshUI(){
  if ($('announcementText')) $('announcementText').textContent = appData.announcement.text || '';
  if (appData.announcement.image){ if ($('announcementImage')) { $('announcementImage').src = appData.announcement.image; $('announcementImage').style.display='block'; } if ($('announcementImagePreview')) { $('announcementImagePreview').src = appData.announcement.image; $('announcementImagePreview').style.display='block'; } if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='inline-block'; } else { if ($('announcementImage')) $('announcementImage').style.display='none'; if ($('announcementImagePreview')) $('announcementImagePreview').style.display='none'; if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='none'; }

  // show admin panel only when user is the main admin or appData.isAdmin
  if ($('admin-panel')) $('admin-panel').style.display = (appData.isAdmin && appData.currentUser && appData.currentUser.id === 'admin') ? 'block' : 'none';
  if ($('student-dashboard')) $('student-dashboard').style.display = (appData.currentUser && !appData.isAdmin) ? 'block' : 'none';
  if (appData.currentUser && !appData.isAdmin && $('studentWelcome')) $('studentWelcome').textContent = 'Bienvenue, ' + (appData.currentUser.fullname || '');

  if ($('stats-students')) $('stats-students').textContent = appData.students.length;
  if ($('stats-quiz')) $('stats-quiz').textContent = appData.quizzes.reduce((acc,q)=>acc+(q.questions?q.questions.length:0),0);
  if ($('stats-dictionary')) $('stats-dictionary').textContent = appData.dictionary.length;
  if ($('stats-grades')) $('stats-grades').textContent = appData.grades.length;
  if ($('stats-messages')) $('stats-messages').textContent = appData.messages.length;
  if ($('stats-latex')) $('stats-latex').textContent = appData.latexContents.length;

  populateStudentsSelect();
  populateAdminSelectQuiz();

  renderAll();
}

/* Students admin / lists */
function adminSaveStudent(){
  const id = $('stId') ? $('stId').value || genId() : genId();
  const fullname = $('stFullname') ? $('stFullname').value.trim() : '';
  const username = $('stUsername') ? $('stUsername').value.trim() : '';
  const password = $('stPassword') ? $('stPassword').value : '';
  const code = $('stCode') ? $('stCode').value.trim() : '';
  const classroom = $('stClassroom') ? $('stClassroom').value.trim() : '';
  if (!fullname || !username) return pushNotification('خطأ', 'Nom complet و nom d\'utilisateur requis', { severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
  const existing = appData.students.find(x=>x.id===id);
  if (existing) { existing.fullname=fullname; existing.username=username; existing.password=password; existing.code=code; existing.classroom=classroom; }
  else appData.students.push({ id, fullname, username, password, code, classroom });
  saveData(); loadStudentsTable(); populateStudentsSelect(); pushNotification('Étudiant enregistré', fullname + ' تم حفظ الطالب', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
  ['stFullname','stUsername','stPassword','stCode','stClassroom','stId'].forEach(idk=>{ if ($(idk)) $(idk).value=''; });
}

function loadStudentsTable(){
  const tbody = document.querySelector('#studentsTable tbody'); if (!tbody) return; tbody.innerHTML = '';
  appData.students.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>'+escapeHtml(s.fullname)+'</td><td>'+escapeHtml(s.username)+'</td><td>'+escapeHtml(s.code||'')+'</td><td>'+escapeHtml(s.classroom||'')+'</td><td></td>';
    const td = tr.querySelector('td:last-child');
    const edit = makeButton('Edit', ()=>{ if ($('stId')) $('stId').value=s.id; if ($('stFullname')) $('stFullname').value=s.fullname; if ($('stUsername')) $('stUsername').value=s.username; if ($('stPassword')) $('stPassword').value=s.password; if ($('stCode')) $('stCode').value=s.code; if ($('stClassroom')) $('stClassroom').value=s.classroom; switchAdminTab('tab-students'); });
    const del = makeButton('Del', ()=>{ if (!confirm('Supprimer étudiant ?')) return; appData.students = appData.students.filter(x=>x.id!==s.id); saveData(); loadStudentsTable(); populateStudentsSelect(); pushNotification('Étudiant supprimé', s.fullname,{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    td.appendChild(edit); td.appendChild(del);
    tbody.appendChild(tr);
  });
}

function populateStudentsSelect(){
  const sel = $('adminMessageStudent'); if (!sel) return; sel.innerHTML = '<option value="">Choisir</option>'; appData.students.forEach(s=>{ const o = document.createElement('option'); o.value=s.id; o.textContent = s.fullname + ' (' + (s.code||'') + ')'; sel.appendChild(o); });
  const gr = $('grStudent'); if (gr){ gr.innerHTML='<option value="">-- Choisir étudiant --</option>'; appData.students.forEach(s=>{ const o = document.createElement('option'); o.value=s.id; o.textContent=s.fullname; gr.appendChild(o); }); }
  const gf = $('grFilterStudent'); if (gf){ gf.innerHTML='<option value="">Tous</option>'; appData.students.forEach(s=>{ const o = document.createElement('option'); o.value=s.id; o.textContent=s.fullname; gf.appendChild(o); }); }
}

/* Grades admin */
function adminSaveGrade(){
  const id = genId();
  const studentId = $('grStudent') ? $('grStudent').value : '';
  const subject = $('grSubject') ? $('grSubject').value.trim() : '';
  const title = $('grTitle') ? $('grTitle').value.trim() : '';
  const date = $('grDate') ? ($('grDate').value || new Date().toISOString()) : new Date().toISOString();
  const score = $('grScore') ? Number($('grScore').value) || 0 : 0;
  const note = $('grNote') ? $('grNote').value : '';
  if (!studentId || !subject || !title) return pushNotification('Remplir', 'Remplir étudiant، matière و intitulé', { severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
  appData.grades.push({ id, studentId, subject, title, date, score, note });
  saveData(); loadGradesTable(); pushNotification('Note ajoutée', 'تمت إضافة نقطة جديدة', { target:'all' });
  ['grStudent','grSubject','grTitle','grDate','grScore','grNote'].forEach(idk=>{ if ($(idk)) $(idk).value=''; });
}

function loadGradesTable(){
  const tbody = document.querySelector('#gradesAdminTable tbody'); if (!tbody) return; tbody.innerHTML='';
  appData.grades.forEach(g=>{
    const st = appData.students.find(s=>s.id===g.studentId);
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>'+escapeHtml(st?st.fullname:'')+'</td><td>'+new Date(g.date).toLocaleDateString()+'</td><td>'+escapeHtml(g.subject)+'</td><td>'+escapeHtml(g.title)+'</td><td>'+g.score+'</td><td>'+escapeHtml(g.note||'')+'</td><td></td>';
    const td = tr.querySelector('td:last-child');
    const del = makeButton('Del', ()=> { const id = g.id; if (!confirm('Supprimer note ?')) return; appData.grades = appData.grades.filter(x=>x.id!==id); saveData(); loadGradesTable(); pushNotification('Note supprimée','Remplacé',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    td.appendChild(del);
    tbody.appendChild(tr);
  });
}

/* Messages area */
function adminSendMessage(){
  const title = $('adminMessageTitle') ? $('adminMessageTitle').value.trim() : '';
  const content = $('adminMessageContent') ? $('adminMessageContent').value.trim() : '';
  const target = $('adminMessageTarget') ? $('adminMessageTarget').value : 'all';
  if (!title || !content) return pushNotification('Titre و contenu requis','يجب ملء العنوان والمحتوى',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
  if (target === 'specific'){ const sid = $('adminMessageStudent').value; if (!sid) return pushNotification('Choisir طالب','يرجى اختيار طالب',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); appData.messages.push({ id: genId(), title, content, target:'specific', specific:sid, createdAt:Date.now() }); }
  else appData.messages.push({ id: genId(), title, content, target:'all', createdAt:Date.now() });
  saveData(); renderAdminMessagesList(); renderStudentMessages(); pushNotification('Message envoyé', title + ' - ' + content, { target: 'specific', specific: appData.currentUser?appData.currentUser.id:null });
  if ($('adminMessageTitle')) $('adminMessageTitle').value=''; if ($('adminMessageContent')) $('adminMessageContent').value='';
}

function renderAdminMessagesList(){
  const c = $('adminMessagesList'); if (!c) return; c.innerHTML='';
  if (!appData.messages.length) return c.innerHTML='<p class="muted">لا توجد رسائل</p>';
  appData.messages.forEach(m=>{ 
    const d=document.createElement('div'); 
    d.style.marginBottom = '10px';
    d.style.padding = '10px';
    d.style.border = '1px solid #eee';
    d.style.borderRadius = '5px';
    
    let targetInfo = '';
    if (m.target === 'specific') {
      const student = appData.students.find(s => s.id === m.specific);
      targetInfo = student ? ` (إلى: ${student.fullname})` : ` (إلى: ${m.specific})`;
    } else {
      targetInfo = ' (إلى الجميع)';
    }
    
    d.innerHTML = '<strong>'+escapeHtml(m.title)+targetInfo+'</strong><br>'+escapeHtml(m.content)+'<br><small>'+new Date(m.createdAt).toLocaleString()+'</small>';
    const del = makeButton('Supprimer', ()=>{ if (!confirm('Supprimer message ?')) return; appData.messages=appData.messages.filter(x=>x.id!==m.id); saveData(); renderAdminMessagesList(); renderStudentMessages(); });
    del.style.marginTop = '5px';
    d.appendChild(del);
    c.appendChild(d);
  });
}

function renderStudentMessages(){
  const c = $('studentMessagesList'); if (!c) return; c.innerHTML='';
  if (!appData.currentUser) return c.innerHTML='<p class="muted">Connectez-vous</p>';
  const list = appData.messages.filter(m => m.target==='all' || (m.target==='specific' && m.specific===appData.currentUser.id));
  if (!list.length) return c.innerHTML='<p class="muted">لا توجد رسائل حتى الآن.</p>';
  list.forEach(m=>{ 
    const d=document.createElement('div');
    d.style.marginBottom = '10px';
    d.style.padding = '10px';
    d.style.border = '1px solid #eee';
    d.style.borderRadius = '5px';
    d.innerHTML = '<strong>'+escapeHtml(m.title)+'</strong><br>'+escapeHtml(m.content)+'<br><small>'+new Date(m.createdAt).toLocaleString()+'</small>';
    c.appendChild(d);
  });
}

/* =============================
   Quiz admin & student (kept mostly unchanged)
   ============================= */
function adminCreateQuiz(){ if (!$('newQuizTitle')) return; const title = $('newQuizTitle').value.trim(); const duration = Number($('newQuizDuration').value) || 0; const shuffle = !!$('newQuizShuffle').checked; const multiAttempts = !!$('newQuizAllowMultipleAttempts').checked; if (!title) return pushNotification('Titre requis','Veuillez entrer un titre',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); const quiz = { id: genId(), title, durationMinutes: duration, shuffle, allowMultipleAttempts: multiAttempts, questions: [] }; appData.quizzes.push(quiz); saveData(); populateAdminSelectQuiz(); renderQuizAdminListDetailed(); pushNotification('Quiz créé','Quiz ajouté: '+title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); if ($('newQuizTitle')) $('newQuizTitle').value=''; if ($('newQuizDuration')) $('newQuizDuration').value='0'; if ($('newQuizShuffle')) $('newQuizShuffle').checked=false; if ($('newQuizAllowMultipleAttempts')) $('newQuizAllowMultipleAttempts').checked=false; }
function populateAdminSelectQuiz(){ const sel = $('adminSelectQuiz'); if (!sel) return; sel.innerHTML=''; const opt=document.createElement('option'); opt.value=''; opt.textContent='-- Sélectionner quiz --'; sel.appendChild(opt); appData.quizzes.forEach(q=>{ const o=document.createElement('option'); o.value=q.id; o.textContent=q.title + ' ('+ (q.questions?q.questions.length:0) +' q)'; sel.appendChild(o); }); }

function adminAddQuestion(){ const qid = $('adminSelectQuiz') ? $('adminSelectQuiz').value : ''; if (!qid) return pushNotification('Sélectionner quiz','Veuillez sélectionner un quiz',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); const quiz = appData.quizzes.find(x=>x.id===qid); if (!quiz) return; const questionText = $('adminQuizQuestion') ? $('adminQuizQuestion').value.trim() : ''; if (!questionText) return pushNotification('Question requise','Veuillez fournir une question',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); const type = $('adminQuestionType') ? $('adminQuestionType').value : 'single'; const points = $('adminQuestionPoints' )? Number($('adminQuestionPoints').value) || 1 : 1; const optsCandidates = ['adminOption1','adminOption2','adminOption3','adminOption4','adminOption5','adminOption6']; const options = optsCandidates.map(id=> $(id)? $(id).value.trim() : '').filter(x=>x && x.length>0); if (options.length < 2) return pushNotification('Options manquantes','Au moins 2 options requises',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); const correctStr = $('adminQuizCorrect') ? $('adminQuizCorrect').value.trim() : '1'; const correctIndices = correctStr.split(',').map(s=>Number(s.trim())-1).filter(n=>!isNaN(n) && n>=0 && n<options.length); if (!correctIndices.length) return pushNotification('Indices مفقودة','Indices صحيحة مفقودة',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); const feedback = $('adminQuestionFeedback') ? $('adminQuestionFeedback').value : ''; const fileInput = $('adminQuizImage'); if (fileInput && fileInput.files && fileInput.files[0]) { const f = fileInput.files[0]; const fr = new FileReader(); fr.onload = function(ev){ quiz.questions.push({ id: genId(), question:questionText, type, points, options, correctIndices, feedback, imageData: ev.target.result }); saveData(); renderQuizAdminListDetailed(); renderQuizList(); pushNotification('Question ajoutée', questionText, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }; fr.readAsDataURL(f); } else { quiz.questions.push({ id: genId(), question:questionText, type, points, options, correctIndices, feedback, imageData: null }); saveData(); renderQuizAdminListDetailed(); renderQuizList(); pushNotification('Question ajoutée', questionText, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }
['adminQuizQuestion','adminOption1','adminOption2','adminOption3','adminOption4','adminOption5','adminOption6','adminQuizCorrect','adminQuestionFeedback','adminQuizImage'].forEach(id=>{ if ($(id)) { try{ $(id).value=''; }catch(e){} } }); }

function renderQuizAdminListDetailed(){ const el = $('quizQuestionsList'); if (!el) return; el.innerHTML=''; if (!appData.quizzes.length) { if ($('adminSelectQuiz')) populateAdminSelectQuiz(); if (el) el.innerHTML = '<p class="muted">Aucun quiz</p>'; return; } appData.quizzes.forEach(q=>{ const container = document.createElement('div'); const header = document.createElement('div'); header.innerHTML = '<strong>'+escapeHtml(q.title)+'</strong> (durée: '+q.durationMinutes+'m, shuffle:'+ (q.shuffle?'oui':'non') +', attempts:'+(q.allowMultipleAttempts?'yes':'no')+')'; container.appendChild(header); const ul = document.createElement('ol'); q.questions.forEach((qq, idx)=>{ const li = document.createElement('li'); li.innerHTML = '<div><strong>'+escapeHtml(qq.question)+'</strong> ['+qq.type+'] (points: '+qq.points+')</div>'; const opts = document.createElement('ul'); qq.options.forEach((op,i)=> { const opLi = document.createElement('li'); opLi.textContent = (i+1)+'. '+op + (qq.correctIndices.includes(i) ? ' (✓ correct)' : ''); opts.appendChild(opLi); }); li.appendChild(opts); if (qq.feedback) { const fb = document.createElement('div'); fb.textContent = 'Feedback: '+qq.feedback; li.appendChild(fb); } if (qq.imageData) { const im = document.createElement('img'); im.src=qq.imageData; im.style.maxWidth='200px'; li.appendChild(im); } const btnUp = makeButton('↑', ()=> { if (idx===0) return; q.questions.splice(idx-1,0,q.questions.splice(idx,1)[0]); saveData(); renderQuizAdminListDetailed(); }); const btnDown = makeButton('↓', ()=> { if (idx===q.questions.length-1) return; q.questions.splice(idx+1,0,q.questions.splice(idx,1)[0]); saveData(); renderQuizAdminListDetailed(); }); const btnDel = makeButton('Supprimer', ()=>{ if (!confirm('Supprimer question ?')) return; q.questions = q.questions.filter(x=>x.id!==qq.id); saveData(); renderQuizAdminListDetailed(); }); const btnEdit = makeButton('Éditer', ()=> { if ($('adminSelectQuiz')) $('adminSelectQuiz').value = q.id; if ($('adminQuizQuestion')) $('adminQuizQuestion').value = qq.question; if ($('adminQuestionType')) $('adminQuestionType').value = qq.type; if ($('adminQuestionPoints')) $('adminQuestionPoints').value = qq.points; if ($('adminOption1')) $('adminOption1').value = qq.options[0]||''; if ($('adminOption2')) $('adminOption2').value=qq.options[1]||''; if ($('adminOption3')) $('adminOption3').value=qq.options[2]||''; if ($('adminOption4')) $('adminOption4').value=qq.options[3]||''; if ($('adminOption5')) $('adminOption5').value=qq.options[4]||''; if ($('adminOption6')) $('adminOption6').value=qq.options[5]||''; if ($('adminQuizCorrect')) $('adminQuizCorrect').value = qq.correctIndices.map(i=>i+1).join(','); if ($('adminQuestionFeedback')) $('adminQuestionFeedback').value = qq.feedback||''; window.scrollTo(0,0); q.questions = q.questions.filter(x=>x.id!==qq.id); saveData(); renderQuizAdminListDetailed(); }); li.appendChild(btnUp); li.appendChild(btnDown); li.appendChild(btnEdit); li.appendChild(btnDel); ul.appendChild(li); }); container.appendChild(ul); const btnDelQuiz = makeButton('Supprimer quiz entier', ()=> { if (!confirm('Supprimer quiz entier ?')) return; appData.quizzes = appData.quizzes.filter(x=>x.id!==q.id); saveData(); renderQuizAdminListDetailed(); renderQuizList(); pushNotification('Quiz supprimé','Quiz supprimé: '+q.title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); container.appendChild(btnDelQuiz); el.appendChild(container); }); populateAdminSelectQuiz(); if ($('stats-quiz')) $('stats-quiz').textContent = appData.quizzes.reduce((acc,q)=>acc+(q.questions?q.questions.length:0),0); }

/* Student quiz runner kept the same except for pushNotification vs alert */
let currentRun = null;
function renderQuizList(){ const c = $('quizContent'); if (!c) return; c.innerHTML=''; if (!appData.quizzes.length) return c.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>'; appData.quizzes.forEach(q=>{ const d = document.createElement('div'); d.innerHTML = '<h3>'+escapeHtml(q.title)+'</h3><p>'+ (q.questions?q.questions.length:0) +' questions</p>'; const btn = makeButton('Voir / Démarrer', ()=> { if (!appData.currentUser){ if ($('studentLoginModal')) $('studentLoginModal').style.display='block'; else pushNotification('Connectez-vous','يرجى تسجيل الدخول لبدء الاختبار',{ severity:'warn' }); return; } startQuiz(q.id); }); d.appendChild(btn); c.appendChild(d); }); }
function renderQuizListForStudent(){ const c = $('studentQuizList'); if (!c) return; c.innerHTML=''; if (!appData.quizzes.length) return c.innerHTML='<p class="muted">Aucun quiz</p>'; appData.quizzes.forEach(q=> { const d = document.createElement('div'); d.innerHTML = '<strong>'+escapeHtml(q.title)+'</strong> — '+(q.questions?q.questions.length:0)+' q'; const start = makeButton('Démarrer', ()=> { startQuiz(q.id); }); const preview = makeButton('Aperçu', ()=> previewQuizAsStudent(q.id)); d.appendChild(start); d.appendChild(preview); c.appendChild(d); }); }
function startQuiz(quizId){ const quiz = appData.quizzes.find(x=>x.id===quizId); if (!quiz) { pushNotification('Quiz introuvable','Quiz introuvable',{ severity:'error' }); return; } let order = quiz.questions.map(q=>q.id); if (quiz.shuffle) order = shuffle(order.slice()); currentRun = { quizId, order, pos:0, timeLeft: quiz.durationMinutes ? quiz.durationMinutes*60 : 0, timerInterval:null }; if (currentRun.timeLeft > 0){ currentRun.timerInterval = setInterval(()=> { currentRun.timeLeft--; renderTimer(); if (currentRun.timeLeft<=0){ clearInterval(currentRun.timerInterval); pushNotification('Temps écoulé','Le temps est écoulé pour ce quiz',{ severity:'warn' }); submitCurrentQuiz(); } }, 1000); } renderQuizRunner(); }
function renderTimer(){ const area = $('quizTimer'); if (area && currentRun) area.textContent = formatTime(currentRun.timeLeft); }
function renderQuizRunner(){ const container = $('quizContainer'); if (!container) return; showSection('quiz'); switchStudentTab('quiz'); container.style.display='block'; container.innerHTML=''; if (!currentRun) return; const quiz = appData.quizzes.find(x=>x.id===currentRun.quizId); if (!quiz) return; const qid = currentRun.order[currentRun.pos]; const qobj = quiz.questions.find(x=>x.id===qid); const header = document.createElement('div'); header.innerHTML = '<h3>'+escapeHtml(quiz.title)+' — Question '+(currentRun.pos+1)+'/'+currentRun.order.length+'</h3>'; if (quiz.durationMinutes) header.innerHTML += '<div id="quizTimer">Temps restant: '+formatTime(currentRun.timeLeft)+'</div>'; container.appendChild(header); const qdiv = document.createElement('div'); qdiv.innerHTML = '<p>'+escapeHtml(qobj.question)+'</p>'; container.appendChild(qdiv); if (qobj.imageData){ const img = document.createElement('img'); img.src=qobj.imageData; img.style.maxWidth='480px'; container.appendChild(img); } const sid = appData.currentUser.id; if (!appData.responses[sid]) appData.responses[sid] = {}; if (!appData.responses[sid][currentRun.quizId]) appData.responses[sid][currentRun.quizId] = {}; const userResp = appData.responses[sid][currentRun.quizId][qobj.id]; const optsContainer = document.createElement('div'); qobj.options.forEach((opt,i)=>{ const optEl = document.createElement('div'); optEl.textContent = String.fromCharCode(65+i) + '. ' + opt; optEl.style.cursor='pointer'; optEl.style.padding='6px'; optEl.style.margin='4px 0'; optEl.style.borderRadius='6px'; optEl.setAttribute('data-index', i); if (qobj.type === 'single') { if (userResp === i) { optEl.style.fontWeight='700'; optEl.style.background='#e0e0e0'; } } else { if (Array.isArray(userResp) && userResp.includes(i)) { optEl.style.fontWeight='700'; optEl.style.background='#e0e0e0'; } } optEl.addEventListener('click', ()=> { if (qobj.type === 'single') { appData.responses[sid][currentRun.quizId][qobj.id] = i; } else { let arr = Array.isArray(appData.responses[sid][currentRun.quizId][qobj.id]) ? appData.responses[sid][currentRun.quizId][qobj.id] : []; if (arr.includes(i)) arr = arr.filter(x=>x!==i); else arr.push(i); appData.responses[sid][currentRun.quizId][qobj.id] = arr; } saveData(); renderQuizRunner(); }); optsContainer.appendChild(optEl); }); container.appendChild(optsContainer); const nav = document.createElement('div'); nav.style.marginTop='12px'; const btnPrev = makeButton('Précédent', ()=> { currentRun.pos = Math.max(0, currentRun.pos-1); renderQuizRunner(); }); btnPrev.disabled = currentRun.pos === 0; const btnNext = makeButton('Suivant', ()=> { currentRun.pos = Math.min(currentRun.order.length-1, currentRun.pos+1); renderQuizRunner(); }); btnNext.disabled = currentRun.pos === currentRun.order.length-1; const btnSubmit = makeButton('Soumettre le quiz', ()=> submitCurrentQuiz()); nav.appendChild(btnPrev); nav.appendChild(btnNext); nav.appendChild(btnSubmit); container.appendChild(nav); }
function submitCurrentQuiz(){ if (!currentRun) return; if (!confirm('Soumettre le quiz ?')) return; if (currentRun.timerInterval) clearInterval(currentRun.timerInterval); const quiz = appData.quizzes.find(x=>x.id===currentRun.quizId); const sid = appData.currentUser.id; const responses = (appData.responses[sid] && appData.responses[sid][currentRun.quizId]) || {}; let totalPoints = 0, gotPoints = 0; quiz.questions.forEach(q=>{ totalPoints += (q.points || 1); const user = responses[q.id]; if (q.type === 'single'){ if (user !== undefined && q.correctIndices.includes(user)) gotPoints += q.points || 1; } else { const userArr = Array.isArray(user) ? user.slice().sort((a,b)=>a-b) : []; const correctArr = q.correctIndices.slice().sort((a,b)=>a-b); if (userArr.length && userArr.length === correctArr.length && userArr.every((v,i)=>v===correctArr[i])) gotPoints += q.points || 1; } }); pushNotification('Résultat', 'Résultat: ' + gotPoints + ' / ' + totalPoints, { target:'specific', specific: sid }); showQuizResultsForStudent(quiz.id, responses); currentRun = null; if ($('quizContainer')) $('quizContainer').style.display='none'; saveData(); renderQuizListForStudent(); }
function showQuizResultsForStudent(quizId, responses){ const quiz = appData.quizzes.find(x=>x.id===quizId); if (!quiz) return; const container = $('studentQuizResults'); if (!container) return; container.innerHTML = ''; const title = document.createElement('h3'); title.textContent = 'Résultats: ' + quiz.title; container.appendChild(title); quiz.questions.forEach((q,idx)=>{ const block = document.createElement('div'); block.style.marginBottom='8px'; const user = responses[q.id]; const correctIndices = q.correctIndices; let userStr = ''; if (q.type === 'single'){ userStr = (user === undefined ? 'Aucune réponse' : String.fromCharCode(65+user)); } else if (Array.isArray(user) && user.length) userStr = user.map(i=>String.fromCharCode(65+i)).join(', '); else userStr = 'Aucune réponse'; const correctStr = correctIndices.map(i=>String.fromCharCode(65+i)).join(', '); block.innerHTML = '<div><strong>Q'+(idx+1)+':</strong> '+escapeHtml(q.question)+'</div><div>Votre réponse: '+escapeHtml(userStr)+' — Correcte: '+escapeHtml(correctStr)+'</div>'; if (q.feedback) block.innerHTML += '<div>Explication: '+escapeHtml(q.feedback)+'</div>'; container.appendChild(block); }); }
function previewQuizAsStudent(quizId){ if (!appData.currentUser || appData.isAdmin){ let demo = appData.students[0] || { id:'demo', fullname:'Élève démo', username:'demo' }; appData.currentUser = demo; appData.isAdmin=false; saveData(); startQuiz(quizId); } else { startQuiz(quizId); } }

/* Lessons / Exercises / Exams + regrade */
function adminSaveLesson(){ if (!$('adminLessonTitle')) return; const title=$('adminLessonTitle').value.trim(), link=$('adminLessonDriveLink').value.trim(); if(!title||!link) return pushNotification('Titre و lien requis','يرجى ملء الحقول',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); appData.lessons.push({id:genId(),title,driveLink:link}); saveData(); renderLessons(); renderLessonsAdminList(); pushNotification('Leçon ajoutée', title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); if ($('adminLessonTitle')) $('adminLessonTitle').value=''; if ($('adminLessonDriveLink')) $('adminLessonDriveLink').value=''; }
function renderLessons(){ const c=$('lessonsContent'); if(!c) return; c.innerHTML=''; if(!appData.lessons.length) return c.innerHTML='<p class="muted">Aucune leçon</p>'; appData.lessons.forEach(l=>{ const d=document.createElement('div'); const a=document.createElement('a'); a.href=l.driveLink; a.target='_blank'; a.rel='noopener'; a.textContent=l.title; d.appendChild(a); c.appendChild(d); }); }
function renderLessonsAdminList(){ const c=$('lessonsAdminList'); if(!c) return; c.innerHTML=''; if(!appData.lessons.length) return c.innerHTML='<p class="muted">Aucune leçon</p>'; appData.lessons.forEach(l=>{ const d=document.createElement('div'); d.innerHTML = escapeHtml(l.title) + ' '; const a=document.createElement('a'); a.href=l.driveLink; a.textContent='ouvrir'; a.target='_blank'; d.appendChild(a); const del=makeButton('Supprimer', ()=>{ if(!confirm('Supprimer leçon ?')) return; appData.lessons = appData.lessons.filter(x=>x.id!==l.id); saveData(); renderLessonsAdminList(); renderLessons(); pushNotification('Leçon محذوفة', l.title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); d.appendChild(del); c.appendChild(d); }); }

function adminSaveExercise(){ if (!$('adminExerciseTitle')) return; const title=$('adminExerciseTitle').value.trim(), link=$('adminExerciseDriveLink').value.trim(); if(!title||!link) return pushNotification('Titre و lien requis','يرجى ملء الحقول',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); appData.exercises.push({id:genId(),title,driveLink:link}); saveData(); renderExercises(); renderExercisesAdminList(); pushNotification('Exercice ajouté', title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); if ($('adminExerciseTitle')) $('adminExerciseTitle').value=''; if ($('adminExerciseDriveLink')) $('adminExerciseDriveLink').value=''; }
function renderExercises(){ const c=$('exercisesContent'); if(!c) return; c.innerHTML=''; if(!appData.exercises.length) return c.innerHTML='<p class="muted">Aucun exercice</p>'; appData.exercises.forEach(e=>{ const d=document.createElement('div'); const a=document.createElement('a'); a.href=e.driveLink; a.target='_blank'; a.textContent=e.title; d.appendChild(a); c.appendChild(d); }); }
function renderExercisesAdminList(){ const c=$('exercisesAdminList'); if(!c) return; c.innerHTML=''; if(!appData.exercises.length) return c.innerHTML='<p class="muted">Aucun exercice</p>'; appData.exercises.forEach(e=>{ const d=document.createElement('div'); d.innerHTML = escapeHtml(e.title) + ' '; const a=document.createElement('a'); a.href=e.driveLink; a.textContent='ouvrir'; a.target='_blank'; d.appendChild(a); const del=makeButton('Supprimer', ()=>{ if(!confirm('Supprimer exercice ?')) return; appData.exercises = appData.exercises.filter(x=>x.id!==e.id); saveData(); renderExercisesAdminList(); renderExercises(); pushNotification('Exercice supprimé', e.title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); d.appendChild(del); c.appendChild(d); }); }

function adminSaveExam(){ if (!$('adminExamTitle')) return; const title=$('adminExamTitle').value.trim(), link=$('adminExamDriveLink').value.trim(); if(!title||!link) return pushNotification('Titre و lien requis','يرجى ملء الحقول',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); appData.exams.push({id:genId(),title,driveLink:link}); saveData(); renderExams(); renderExamsAdminList(); pushNotification('Examen ajouté', title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); if ($('adminExamTitle')) $('adminExamTitle').value=''; if ($('adminExamDriveLink')) $('adminExamDriveLink').value=''; }

function renderExams(){ const c=$('examsContent'); if(!c) return; c.innerHTML=''; if(!appData.exams.length) return c.innerHTML='<p class="muted">Aucun examen</p>'; appData.exams.forEach(e=>{ const d=document.createElement('div'); const a=document.createElement('a'); a.href=e.driveLink; a.target='_blank'; a.textContent=e.title; d.appendChild(a);
    // For students: show regrade button only if this exam has a published grade for this student
    if (appData.currentUser && !appData.isAdmin){
      const studentId = appData.currentUser.id;
      const hasGradeForThisExam = (appData.grades||[]).some(g => g.studentId === studentId && (g.title && e.title && (g.title === e.title || g.title.includes(e.title) || e.title.includes(g.title))));
      if (hasGradeForThisExam){ const reqBtn = makeButton('طلب إعادة تصحيح', ()=> { // open prompt
            const note = prompt('اكتب ملاحظة لطلب إعادة التصحيح (اختياري):'); if (note === null) return; studentRequestRegrade(e.id, note || ''); pushNotification('تم إرسال طلب إعادة التصحيح','طلبك تم إرساله', { target:'specific', specific: studentId }); }); reqBtn.style.marginLeft='8px'; d.appendChild(reqBtn); }
    }
    c.appendChild(d);
  }); }

function renderExamsAdminList(){ const c=$('examsAdminList'); if(!c) return; c.innerHTML=''; if(!appData.exams.length) return c.innerHTML='<p class="muted">Aucun examen</p>'; appData.exams.forEach(e=>{ const d=document.createElement('div'); d.innerHTML=escapeHtml(e.title)+' '; const a=document.createElement('a'); a.href=e.driveLink; a.textContent='ouvrir'; a.target='_blank'; d.appendChild(a); const del=makeButton('Supprimer', ()=>{ if(!confirm('Supprimer examen ?')) return; appData.exams=appData.exams.filter(x=>x.id!==e.id); saveData(); renderExamsAdminList(); renderExams(); pushNotification('Examen محذوف', e.title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); d.appendChild(del); c.appendChild(d); }); }

function studentRequestRegrade(examId, note){ if (!appData.currentUser) return pushNotification('Connectez-vous', 'يرجى تسجيل الدخول', { severity:'warn' }); const req = { id: genId(), examId, studentId: appData.currentUser.id, note: note || '', createdAt: Date.now(), handled:false }; appData.regradeRequests = appData.regradeRequests || []; appData.regradeRequests.push(req); saveData(); appData.messages = appData.messages || []; appData.messages.push({ id: genId(), title: 'طلب إعادة تصحيح', content: 'طالب طلب إعادة تصحيح لامتحان (id:' + examId + ') — ملاحظة: ' + note, target:'all', createdAt:Date.now() }); saveData(); renderRegradeRequestsAdminList(); renderStudentMessages(); }

function renderRegradeRequestsAdminList(){ const c = $('regradeRequestsList'); if (!c) return; c.innerHTML = ''; const list = appData.regradeRequests || []; if (!list.length) { c.innerHTML = '<p class="muted">لا توجد طلبات إعادة تصحيح</p>'; return; } list.forEach(req=>{ const st = appData.students.find(s=>s.id===req.studentId); const ex = appData.exams.find(e=>e.id===req.examId); const d = document.createElement('div'); d.style.marginBottom='8px'; d.innerHTML = '['+new Date(req.createdAt).toLocaleString()+'] <strong>' + escapeHtml(st?st.fullname:'') + '</strong> — ' + escapeHtml(ex?ex.title:'(exam)') + ' — ' + escapeHtml(req.note || ''); const markDone = makeButton(req.handled ? 'معالج' : 'وضع كمُعالَج', ()=>{ req.handled = true; saveData(); renderRegradeRequestsAdminList(); pushNotification('تم المعالجة', 'تم وضع الطلب كمُعالَج', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); markDone.style.marginLeft='8px'; const del = makeButton('حذف', ()=>{ if (!confirm('Supprimer request ?')) return; appData.regradeRequests = appData.regradeRequests.filter(r=>r.id!==req.id); saveData(); renderRegradeRequestsAdminList(); pushNotification('Request supprimé', '', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); del.style.marginLeft='6px'; d.appendChild(markDone); d.appendChild(del); c.appendChild(d); }); }

/* Announcement image handling */
function handleAnnouncementImage(e){ const f = e.target.files[0]; if (!f) return; const fr = new FileReader(); fr.onload = function(ev){ appData.announcement.image = ev.target.result; if ($('announcementImagePreview')) { $('announcementImagePreview').src = ev.target.result; $('announcementImagePreview').style.display='block'; } if ($('announcementImage')) { $('announcementImage').src = ev.target.result; $('announcementImage').style.display='block'; } if ($('btnDeleteAnnouncementImage')) $('btnDeleteAnnouncementImage').style.display='inline-block'; saveData(); pushNotification('Image annonce', 'صورة الاعلان تم رفعها', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }; fr.readAsDataURL(f); }

/* Slider handling: render front slider (public) and admin slider list (admin only)
   Important: slider admin controls are shown ONLY to the main admin 사용자 (id 'admin')
*/
let currentSlide = 0;
let slideInterval;

function renderFrontSlider(){ 
  const container = $('front-hero-slider'); 
  if (!container) return; 
  container.innerHTML = ''; 
  
  if (!appData.slides || !appData.slides.length){ 
    container.innerHTML = '<div class="muted">لا توجد شرائح حاليا</div>'; 
    return; 
  }
  
  // Create slider container
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  sliderContainer.style.position = 'relative';
  sliderContainer.style.height = '400px';
  sliderContainer.style.overflow = 'hidden';
  sliderContainer.style.borderRadius = '10px';
  sliderContainer.style.margin = '20px 0';
  
  // Create slides
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'slides-wrapper';
  slidesWrapper.style.display = 'flex';
  slidesWrapper.style.transition = 'transform 0.5s ease';
  slidesWrapper.style.width = `${appData.slides.length * 100}%`;
  slidesWrapper.style.height = '100%';
  
  appData.slides.forEach((sld, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.style.width = `${100 / appData.slides.length}%`;
    slide.style.flexShrink = '0';
    slide.style.position = 'relative';
    slide.style.background = '#f0f0f0';
    
    const img = document.createElement('img');
    img.src = sld.url || '';
    img.alt = sld.alt || ('Slide '+(i+1));
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.onerror = () => { 
      img.style.display = 'none'; 
      slide.style.background = 'linear-gradient(135deg, #3498db, #2ecc71)';
      slide.style.display = 'flex';
      slide.style.alignItems = 'center';
      slide.style.justifyContent = 'center';
      slide.style.color = 'white';
      slide.style.fontSize = '24px';
      slide.textContent = sld.alt || ('Slide '+(i+1));
    };
    
    slide.appendChild(img);
    
    if (sld.alt) {
      const caption = document.createElement('div');
      caption.textContent = sld.alt;
      caption.style.position = 'absolute';
      caption.style.bottom = '0';
      caption.style.left = '0';
      caption.style.right = '0';
      caption.style.background = 'rgba(0,0,0,0.7)';
      caption.style.color = 'white';
      caption.style.padding = '15px';
      caption.style.textAlign = 'center';
      caption.style.fontSize = '18px';
      slide.appendChild(caption);
    }
    
    slidesWrapper.appendChild(slide);
  });
  
  sliderContainer.appendChild(slidesWrapper);
  
  // Create navigation buttons
  if (appData.slides.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&#10094;';
    prevBtn.className = 'slider-nav slider-prev';
    prevBtn.style.position = 'absolute';
    prevBtn.style.top = '50%';
    prevBtn.style.left = '15px';
    prevBtn.style.transform = 'translateY(-50%)';
    prevBtn.style.background = 'rgba(0,0,0,0.5)';
    prevBtn.style.color = 'white';
    prevBtn.style.border = 'none';
    prevBtn.style.borderRadius = '50%';
    prevBtn.style.width = '40px';
    prevBtn.style.height = '40px';
    prevBtn.style.fontSize = '20px';
    prevBtn.style.cursor = 'pointer';
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
    });
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&#10095;';
    nextBtn.className = 'slider-nav slider-next';
    nextBtn.style.position = 'absolute';
    nextBtn.style.top = '50%';
    nextBtn.style.right = '15px';
    nextBtn.style.transform = 'translateY(-50%)';
    nextBtn.style.background = 'rgba(0,0,0,0.5)';
    nextBtn.style.color = 'white';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '50%';
    nextBtn.style.width = '40px';
    nextBtn.style.height = '40px';
    nextBtn.style.fontSize = '20px';
    nextBtn.style.cursor = 'pointer';
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
    });
    
    sliderContainer.appendChild(prevBtn);
    sliderContainer.appendChild(nextBtn);
    
    // Create indicators
    const indicators = document.createElement('div');
    indicators.className = 'slider-indicators';
    indicators.style.position = 'absolute';
    indicators.style.bottom = '15px';
    indicators.style.left = '0';
    indicators.style.right = '0';
    indicators.style.display = 'flex';
    indicators.style.justifyContent = 'center';
    indicators.style.gap = '10px';
    
    appData.slides.forEach((_, i) => {
      const indicator = document.createElement('span');
      indicator.className = 'slider-indicator';
      indicator.style.width = '12px';
      indicator.style.height = '12px';
      indicator.style.borderRadius = '50%';
      indicator.style.background = i === currentSlide ? '#3498db' : 'rgba(255,255,255,0.5)';
      indicator.style.cursor = 'pointer';
      indicator.addEventListener('click', () => {
        showSlide(i);
      });
      indicators.appendChild(indicator);
    });
    
    sliderContainer.appendChild(indicators);
  }
  
  container.appendChild(sliderContainer);
  
  // Start auto-sliding if there are multiple slides
  if (appData.slides.length > 1) {
    startSlider();
  }
}

function showSlide(n) {
  const slidesWrapper = document.querySelector('.slides-wrapper');
  const indicators = document.querySelectorAll('.slider-indicator');
  const slides = appData.slides;
  
  if (n >= slides.length) {
    currentSlide = 0;
  } else if (n < 0) {
    currentSlide = slides.length - 1;
  } else {
    currentSlide = n;
  }
  
  slidesWrapper.style.transform = `translateX(-${currentSlide * (100 / slides.length)}%)`;
  
  indicators.forEach((indicator, i) => {
    indicator.style.background = i === currentSlide ? '#3498db' : 'rgba(255,255,255,0.5)';
  });
}

function startSlider() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
  
  slideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);
}

function renderSliderAdminList(){ 
  const c = $('sliderAdminList'); 
  if (!c) return; 
  
  // only the main admin may see slider admin
  if (!appData.currentUser || !appData.isAdmin || appData.currentUser.id !== 'admin'){ 
    c.innerHTML = '<p class="muted">لا تملك صلاحية تعديل السلايد</p>'; 
    return; 
  }
  
  c.innerHTML = '';
  
  if (!appData.slides || !appData.slides.length) { 
    c.innerHTML = '<p class="muted">Aucun slide pour le moment.</p>'; 
    return; 
  }
  
  appData.slides.forEach((sld, idx) => { 
    const d = document.createElement('div'); 
    d.className='content-row'; 
    d.style.marginBottom='15px';
    d.style.padding='10px';
    d.style.border='1px solid #eee';
    d.style.borderRadius='5px';
    
    const img = document.createElement('img'); 
    img.src = sld.url; 
    img.style.maxWidth='140px'; 
    img.style.maxHeight='100px';
    img.style.objectFit='cover';
    img.style.display='inline-block'; 
    img.style.verticalAlign='middle';
    img.style.marginRight='10px';
    img.onerror = ()=>{ 
      img.style.display='none'; 
    }; 
    
    const info = document.createElement('span'); 
    info.style.marginLeft='8px'; 
    info.innerHTML = escapeHtml(sld.alt || ('Slide '+(idx+1)));
    
    const up = makeButton('↑', ()=>{ 
      if(idx===0) return; 
      const a=appData.slides[idx-1]; 
      appData.slides[idx-1]=appData.slides[idx]; 
      appData.slides[idx]=a; 
      saveData(); 
      renderSliderAdminList(); 
      renderFrontSlider(); 
    });
    
    const down = makeButton('↓', ()=>{ 
      if(idx===appData.slides.length-1) return; 
      const a=appData.slides[idx+1]; 
      appData.slides[idx+1]=appData.slides[idx]; 
      appData.slides[idx]=a; 
      saveData(); 
      renderSliderAdminList(); 
      renderFrontSlider(); 
    });
    
    const edit = makeButton('تعديل', ()=>{
      const newAlt = prompt('النص البديل للشريحة:', sld.alt || '');
      if (newAlt !== null) {
        sld.alt = newAlt;
        saveData();
        renderSliderAdminList();
        renderFrontSlider();
        pushNotification('تم التعديل', 'تم تعديل الشريحة بنجاح', { target:'specific', specific: appData.currentUser.id });
      }
    });
    
    const del = makeButton('حذف', ()=>{ 
      if(!confirm('Supprimer ce slide ?')) return; 
      appData.slides.splice(idx,1); 
      saveData(); 
      renderSliderAdminList(); 
      renderFrontSlider(); 
      pushNotification('Slide supprimé','Slide supprimé',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); 
    });
    
    d.appendChild(img); 
    d.appendChild(info);
    d.appendChild(up); 
    d.appendChild(down);
    d.appendChild(edit);
    d.appendChild(del); 
    c.appendChild(d); 
  }); 
}

function adminAddSliderImageFromUrl(url){ 
  if (!url) return pushNotification('رابط غير صالح','ضع رابط الصورة للسلايد');
  const alt = prompt('النص البديل للشريحة (اختياري):', '');
  appData.slides = appData.slides || []; 
  appData.slides.push({ id: genId(), url: url, alt: alt || '' }); 
  saveData(); 
  renderSliderAdminList(); 
  renderFrontSlider(); 
  pushNotification('Slide ajouté','تم إضافة سلايد جديد',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); 
}

function adminAddSliderImageFromFile(file){ 
  if (!file) return; 
  const fr = new FileReader(); 
  fr.onload = function(ev){ 
    const alt = prompt('النص البديل للشريحة (اختياري):', '');
    appData.slides = appData.slides || []; 
    appData.slides.push({ id: genId(), url: ev.target.result, alt: alt || '' }); 
    saveData(); 
    renderSliderAdminList(); 
    renderFrontSlider(); 
    pushNotification('Slide ajouté (upload)','تم رفع سلايد جديد (upload)',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); 
  }; 
  fr.readAsDataURL(file); 
}

function wireSliderAdminEvents(){
  // Only wire slider admin events if main admin
  const isMainAdmin = appData.currentUser && appData.isAdmin && appData.currentUser.id === 'admin';
  const btn = $('btnAddSliderImage');
  if (btn){
    // if not main admin, hide button entirely
    if (!isMainAdmin){ 
      btn.style.display='none'; 
      const upload = $('sliderImageUpload'); 
      if (upload) upload.style.display='none'; 
      const urlInput = $('sliderImageUrl'); 
      if (urlInput) urlInput.style.display='none'; 
      const clr = $('btnClearSlider'); 
      if (clr) clr.style.display='none'; 
      return; 
    }
    
    btn.addEventListener('click', ()=> {
      const url = $('sliderImageUrl') ? $('sliderImageUrl').value.trim() : '';
      const fileInput = $('sliderImageUpload');
      if (url) adminAddSliderImageFromUrl(url);
      else if (fileInput && fileInput.files && fileInput.files[0]) adminAddSliderImageFromFile(fileInput.files[0]);
      else pushNotification('Choisir une image','Choisir image او وضع رابط URL',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
      if ($('sliderImageUrl')) $('sliderImageUrl').value='';
      if (fileInput) fileInput.value='';
    });
  }
  
  const clr = $('btnClearSlider');
  if (clr) clr.addEventListener('click', ()=> { 
    if (!confirm('Vider tout le slider ?')) return; 
    appData.slides = []; 
    saveData(); 
    renderSliderAdminList(); 
    renderFrontSlider(); 
    pushNotification('Slider vidé','جميع السلايدات محذوفة',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); 
  });
}

/* Student dashboard */
function loadStudentDashboard(){ 
  if (!appData.currentUser || appData.isAdmin) return; 
  const studentId = appData.currentUser.id; 
  
  const recentEl = $('studentRecentGrades'); 
  if (recentEl) { 
    const grades = (appData.grades||[]).filter(g=>g.studentId===studentId).sort((a,b)=>new Date(b.date)-new Date(a.date)); 
    if (!grades.length) recentEl.innerHTML = '<p class="muted">Aucune note disponible pour le moment.</p>'; 
    else { 
      recentEl.innerHTML = '<ul>' + grades.slice(0,6).map(g=>'<li>'+ escapeHtml(g.subject) +' - '+ escapeHtml(g.title) +' : '+ (g.score||0) +'/20 ('+ new Date(g.date).toLocaleDateString()+')</li>').join('') + '</ul>'; 
    } 
  }
  
  const quizEl = $('studentQuizList'); 
  if (quizEl) { 
    const list = (appData.quizzes||[]).map(q=>({id:q.id,title:q.title, count:q.questions?q.questions.length:0})); 
    if (!list.length) quizEl.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>'; 
    else quizEl.innerHTML = '<ul>' + list.map(q=>'<li>'+ escapeHtml(q.title) +' ('+ q.count +' questions)</li>').join('') + '</ul>'; 
  }
  
  const examsEl = $('studentExamsQuick'); 
  if (examsEl){ 
    if (!appData.exams || !appData.exams.length) examsEl.innerHTML = '<p class="muted">Aucun examen</p>'; 
    else { 
      // show only exams that have published grades for this student
      const studentId = appData.currentUser.id;
      const validExams = appData.exams.filter(e => 
        (appData.grades||[]).some(g => g.studentId === studentId && (g.title && e.title && (g.title === e.title || g.title.includes(e.title) || e.title.includes(g.title))))
      );
      
      if (!validExams.length) examsEl.innerHTML = '<p class="muted">لا توجد امتحانات لها نقاط منشورة يمكنك طلب إعادة التصحيح لها</p>';
      else {
        examsEl.innerHTML = '<ul>' + validExams.map(e => {
          return '<li>' + escapeHtml(e.title) + ' <button data-exid="'+e.id+'" class="dashboard-regrade">طلب إعادة تصحيح</button></li>';
        }).join('') + '</ul>';
        
        document.querySelectorAll('.dashboard-regrade').forEach(btn=>{ 
          btn.addEventListener('click', ()=> { 
            const exid = btn.getAttribute('data-exid'); 
            const note = prompt('اكتب ملاحظة لطلب إعادة التصحيح (اختياري):'); 
            if (note === null) return; 
            studentRequestRegrade(exid, note || ''); 
            pushNotification('طلب إعادة تصحيح','تم إرسال طلب إعادة التصحيح', { target:'specific', specific: studentId }); 
          }); 
        });
      }
    } 
  }
}

/* Notification helper kept for backward compatibility */
function notifyStudents(type, title, content){ appData.messages = appData.messages || []; appData.messages.push({ id: genId(), title: title, content: content, target:'all', createdAt:Date.now() }); saveData(); renderAdminMessagesList(); renderStudentMessages(); if (appData.currentUser && !appData.isAdmin) { loadStudentDashboard(); pushNotification(title, content, { target:'specific', specific: appData.currentUser.id }); } }

/* LaTeX functions unchanged except notifications */
function updateLatexLineNumbers(){ const ta = $('latexCode'); const ln = $('latexLineNumbers'); const preview = $('latexPreview'); if (!ta || !ln || !preview) return; const lines = (ta.value || '').split('\n').length; const count = Math.min(Math.max(lines,1),2000); let out = ''; for (let i=1;i<=count;i++){ out += i + '\n'; } ln.textContent = out; preview.innerHTML = ta.value ? ('\\[' + ta.value.replace(/ /g,'\\ ') + '\\]') : 'معاينة LaTeX...'; if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([preview]).catch(()=>{}); }
function adminSaveLatex(){ if (!$('latexTitle')) return; const title = $('latexTitle').value.trim(); const code = $('latexCode').value; const desc = $('latexDescription').value; const cat = $('latexCategory').value; if (!title || !code) return pushNotification('Titre و code requis','يرجى ملء الحقول',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); appData.latexContents.push({ id: genId(), title, code, description: desc, category: cat, createdAt: Date.now() }); saveData(); pushNotification('Leçon LaTeX محفوظة', title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); loadLatexAdminList(); renderLatexListForStudents(); if ($('latexTitle')) $('latexTitle').value=''; if ($('latexCode')) $('latexCode').value=''; if ($('latexDescription')) $('latexDescription').value=''; if ($('latexCategory')) $('latexCategory').value=''; updateLatexLineNumbers(); }
function loadLatexAdminList(){ const c = $('latexContentsList'); if (!c) return; c.innerHTML=''; if (!appData.latexContents.length) return c.innerHTML = '<p class="muted">لا توجد دروس حتى الآن.</p>'; appData.latexContents.forEach(item=>{ const d = document.createElement('div'); d.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong> — ' + escapeHtml(item.description || ''); const btnPreview = makeButton('معاينة', ()=> { const preview = $('latexPreview'); if (!preview) return; preview.innerHTML = '\\[' + item.code + '\\]'; if (window.MathJax) MathJax.typesetPromise([preview]).catch(()=>{}); }); const btnDel = makeButton('Supprimer', ()=> { if(!confirm('Supprimer الدرس ؟')) return; appData.latexContents = appData.latexContents.filter(x=>x.id!==item.id); saveData(); loadLatexAdminList(); renderLatexListForStudents(); pushNotification('درس محذوف', item.title, { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }); d.appendChild(btnPreview); d.appendChild(btnDel); c.appendChild(d); }); if ($('stats-latex')) $('stats-latex').textContent = appData.latexContents.length; }
function renderLatexListForStudents(){ const c = $('studentCoursList'); if (!c) return; c.innerHTML=''; if (!appData.latexContents.length) return c.innerHTML='<p class="muted">لا توجد دروس</p>'; appData.latexContents.forEach(item=>{ const d = document.createElement('div'); d.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong> — ' + escapeHtml(item.description || ''); const btn = makeButton('معاينة', ()=> { const target = $('quizContent'); if (!target) return; target.innerHTML = '<h3>' + escapeHtml(item.title) + '</h3><div id="studentLatexArea">\\[' + item.code + '\\]</div>'; if (window.MathJax) MathJax.typesetPromise([document.getElementById('studentLatexArea')]).catch(()=>{}); }); d.appendChild(btn); c.appendChild(d); }); }

/* Utility & renderAll */
function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function formatTime(sec){ if (!sec || sec<=0) return '00:00'; const m=Math.floor(sec/60); const s=sec%60; return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }
function renderAll(){ renderQuizAdminListDetailed(); renderQuizList(); renderLessons(); renderExercises(); renderExams(); renderLessonsAdminList(); renderExercisesAdminList(); renderExamsAdminList(); renderDictionary(); loadStudentsTable(); loadGradesTable(); loadLatexAdminList(); renderLatexListForStudents(); renderStudentMessages(); renderFrontSlider(); renderSliderAdminList(); }

function searchGradesByCode(code){ 
  const s = appData.students.find(x=>x.code === code); 
  if (!s) return pushNotification('Code non trouvé','Code parcours non trouvé',{ severity:'warn' }); 
  const g = appData.grades.filter(x=>x.studentId === s.id); 
  
  if ($('gradesResults')) $('gradesResults').style.display='block'; 
  if ($('studentInfo')) $('studentInfo').innerHTML = '<div class="content-card"><div class="card-content"><h3>' + escapeHtml(s.fullname) + '</h3><p>Classe: ' + escapeHtml(s.classroom||'') + '</p><p>Code: ' + escapeHtml(s.code||'') + '</p></div></div>'; 
  
  const tbody = document.querySelector('#gradesTable tbody'); 
  if (!tbody) return; 
  tbody.innerHTML = ''; 
  
  if (!g.length) { 
    if ($('noGradesMsg')) $('noGradesMsg').style.display='block'; 
  } else { 
    if ($('noGradesMsg')) $('noGradesMsg').style.display='none'; 
    g.forEach(grade=>{ 
      const row=document.createElement('tr'); 
      row.innerHTML = '<td>' + new Date(grade.date).toLocaleDateString() + '</td><td>' + escapeHtml(grade.subject) + '</td><td>' + escapeHtml(grade.title) + '</td><td>' + grade.score + '/20</td><td>' + escapeHtml(grade.note || '') + '</td>'; 
      tbody.appendChild(row); 
    }); 
  } 
}

function renderDictionary(){ const el = $('dictionaryContent'); if (!el) return; el.innerHTML=''; if (!appData.dictionary.length) return el.innerHTML = '<p class="muted">Aucun terme dans le lexique pour le moment.</p>'; appData.dictionary.forEach(term=>{ const d=document.createElement('div'); d.className='content-card'; d.innerHTML = '<div class="card-content"><h3>'+escapeHtml(term.ar)+' - '+escapeHtml(term.fr)+'</h3><p>'+escapeHtml(term.definition)+'</p></div>'; el.appendChild(d); }); }

/* End of file */
