// unified-dashboard-fixed.js
// نسخة مُعدّلة: تحكم السلايدر للادمن العام + إصلاح اختيار التقييم لطلبات إعادة التصحيح
// Author: assistant (for user)
// Usage: استبدل الملف القديم بهذه النسخة

const STORAGE_KEY = 'lyceeExcellence_v4_fixed';

// --- بيانات ابتدائية (موديل مبسط) ---
let appData = {
  users: [
    // مثال: { id: 'u1', fullname: 'Prof A', username: 'prof', isAdmin: true, role: 'teacher' }
  ],
  students: [
    // مثال: { id: 's1', fullname: 'Ali', username: 'ali01', classroom: '1BAC' }
  ],
  exams: [
    // مثال: { id: 'e1', title: 'Devoir 1 - Physique', date: '2025-09-01' }
  ],
  grades: [
    // مثال: { id: 'g1', examId: 'e1', examTitle: 'Devoir 1 - Physique', studentId: 's1', score: 14 }
  ],
  sliders: [
    // مثال: { id: 'sl1', title: 'Bienvenue', image: '/img/1.jpg', order: 1, visible: true }
  ],
  currentUser: null // سيُملأ بعد تسجيل الدخول أو اختيار مستخدم للتجريب
};

// --- Helpers DOM ---
function $(id){ return document.getElementById(id); }
function q(sel){ return document.querySelector(sel); }
function qAll(sel){ return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }

function makeButton(label, onClick, opts={}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.className = opts.className || 'btn';
  b.style.padding = '6px 10px';
  b.style.borderRadius = '8px';
  b.style.margin = opts.margin || '4px';
  b.addEventListener('click', onClick);
  return b;
}

// --- Persistence ---
function saveData(){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    // console.log('Saved');
  } catch(e){ console.error('Save failed', e); }
}
function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // merge to appData conservatively
      appData = Object.assign({}, appData, parsed);
    } catch(e){ console.error('Load parse failed', e); }
  } else {
    // لا بيانات مخزنة — ممكن ننشئ بيانات تجريبية لو تحب
    seedDemoData();
    saveData();
  }
}

// --- Demo seed (اختياري) ---
function seedDemoData(){
  appData.users = [
    { id: 'admin1', fullname: 'Admin Root', username: 'admin', isAdmin: true, role: 'admin' },
    { id: 'prof1', fullname: 'Prof. Youssef', username: 'youssef', isAdmin: true, role: 'teacher' },
    { id: 'teach2', fullname: 'Mme Samira', username: 'samira', isAdmin: false, role: 'teacher' }
  ];
  appData.students = [
    { id: 's1', fullname: 'Ali Bairouk', username: 'ali', classroom: '1BAC' },
    { id: 's2', fullname: 'Mohamed Zahid', username: 'moh', classroom: 'TC PC' }
  ];
  appData.exams = [
    { id: 'e1', title: 'Devoir 1 - Physique', date: '2025-09-01' },
    { id: 'e2', title: 'Examen 1 - Math', date: '2025-09-10' }
  ];
  appData.grades = [
    { id: 'g1', examId: 'e1', examTitle: 'Devoir 1 - Physique', studentId: 's1', score: 12 },
    { id: 'g2', examId: 'e2', examTitle: 'Examen 1 - Math', studentId: 's2', score: 15 }
  ];
  appData.sliders = [
    { id: 'sl1', title: 'Bienvenue au site', image: '', order: 1, visible: true },
    { id: 'sl2', title: 'Inscription ouverte', image: '', order: 2, visible: true }
  ];
  // set default current user to prof1 for testing (ادمن فعّال)
  appData.currentUser = appData.users[1]; // prof1
}

// --- Authentication stub (لاستخدام داخلي للتجريب) ---
function setCurrentUserByUsername(username){
  const u = (appData.users||[]).find(x => x.username === username);
  if (u) {
    appData.currentUser = u;
    saveData();
    renderAll();
  } else {
    console.warn('User not found', username);
  }
}

// --- Slider admin rendering (الجزء المطلوب) ---
function renderSliderAdminList(containerId = 'sliderAdminList'){
  const container = $(containerId);
  if (!container) return;

  // صلاحية: أي مستخدم مُعلَن كـ admin قادر يدير السلايد
  if (!appData.currentUser || !appData.currentUser.isAdmin) {
    container.innerHTML = '<p class="muted">ما عندكش الصلاحية لتحكم في السلايد.</p>';
    return;
  }

  container.innerHTML = '';
  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '8px';

  (appData.sliders || []).sort((a,b) => (a.order||0)-(b.order||0)).forEach(s => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.padding = '8px';
    row.style.border = '1px solid rgba(0,0,0,0.06)';
    row.style.borderRadius = '8px';
    row.innerHTML = `<div>
        <strong>${escapeHtml(s.title||'--')}</strong> <small>(${escapeHtml(s.id)})</small>
        <div style="font-size:12px;color:#666">${escapeHtml(s.image||'no image')}</div>
      </div>`;
    const controls = document.createElement('div');
    const toggle = makeButton(s.visible ? 'Hide' : 'Show', ()=>{
      s.visible = !s.visible; saveData(); renderSliderAdminList(containerId);
    });
    const up = makeButton('↑', ()=>{
      moveSliderUp(s.id); saveData(); renderSliderAdminList(containerId);
    });
    const down = makeButton('↓', ()=>{
      moveSliderDown(s.id); saveData(); renderSliderAdminList(containerId);
    });
    const edit = makeButton('Edit', ()=>{
      openSliderEditor(s.id);
    });
    const del = makeButton('Delete', ()=>{
      if (confirm('Supprimer ce slider ?')) {
        appData.sliders = (appData.sliders||[]).filter(x=>x.id!==s.id);
        saveData(); renderSliderAdminList(containerId);
      }
    }, { className: 'btn-danger' });
    controls.appendChild(toggle); controls.appendChild(up); controls.appendChild(down); controls.appendChild(edit); controls.appendChild(del);
    row.appendChild(controls);
    list.appendChild(row);
  });

  // Add new slider button
  const addRow = document.createElement('div');
  addRow.style.marginTop = '8px';
  const addBtn = makeButton('Create new slider', ()=>{
    const id = uid('sl');
    appData.sliders = appData.sliders || [];
    appData.sliders.push({ id, title: 'Nouveau slider', image: '', order: (appData.sliders.length+1), visible: true });
    saveData(); renderSliderAdminList(containerId);
  }, { className: 'btn-primary' });
  addRow.appendChild(addBtn);
  container.appendChild(list);
  container.appendChild(addRow);
}

function moveSliderUp(id){
  const arr = appData.sliders || [];
  const i = arr.findIndex(x=>x.id===id);
  if (i>0) {
    const a = arr[i-1]; arr[i-1] = arr[i]; arr[i] = a;
    // recompute order
    arr.forEach((s, idx)=> s.order = idx+1);
  }
}
function moveSliderDown(id){
  const arr = appData.sliders || [];
  const i = arr.findIndex(x=>x.id===id);
  if (i>=0 && i < arr.length-1) {
    const a = arr[i+1]; arr[i+1] = arr[i]; arr[i] = a;
    arr.forEach((s, idx)=> s.order = idx+1);
  }
}
function openSliderEditor(id){
  const s = (appData.sliders||[]).find(x=>x.id===id);
  if (!s) return alert('Slider introuvable');
  const title = prompt('Titre du slider', s.title || '');
  if (title === null) return;
  s.title = title.trim();
  const img = prompt('Image URL (laisser vide si aucun)', s.image || '');
  if (img !== null) s.image = img.trim();
  saveData(); renderSliderAdminList();
}

// --- Exams / Grades logic ---
function addExam(title, date){
  appData.exams = appData.exams || [];
  const id = uid('e');
  appData.exams.push({ id, title: title || 'Untitled', date: date || new Date().toISOString().slice(0,10) });
  saveData(); renderAll();
  return id;
}

function addOrUpdateGrade({ examId, examTitle, studentId, score }){
  appData.grades = appData.grades || [];
  // if a grade entry already exists for same examId & studentId => update
  let g = null;
  if (examId) {
    g = appData.grades.find(x => x.examId === examId && x.studentId === studentId);
  }
  if (!g) {
    // fallback: try to match by examTitle (case-insensitive) if examId not provided/matched
    const candidate = (appData.grades||[]).find(x => x.studentId===studentId && x.examTitle && examTitle && x.examTitle.trim().toLowerCase() === examTitle.trim().toLowerCase());
    if (candidate) g = candidate;
  }
  if (g) {
    g.score = score;
    g.examTitle = examTitle || g.examTitle;
    if (examId) g.examId = examId;
  } else {
    const id = uid('g');
    appData.grades.push({ id, examId: examId || null, examTitle: examTitle || '', studentId, score });
  }
  saveData();
}

// Helper: get exams that have grades for a given student
function getExamsWithGradesForStudent(studentId){
  const grades = (appData.grades||[]).filter(g => g.studentId === studentId);
  // Map to exam references (use examId if present, else use examTitle)
  const result = [];
  const seen = new Set();
  grades.forEach(g => {
    if (g.examId) {
      const ex = (appData.exams||[]).find(e => e.id === g.examId);
      if (ex && !seen.has(ex.id)) { result.push({ exam: ex, grade: g }); seen.add(ex.id); }
      else if (!ex && !seen.has(g.examTitle)) { result.push({ exam: { id: null, title: g.examTitle }, grade: g }); seen.add(g.examTitle); }
    } else {
      // fallback: find by title
      const ex = (appData.exams||[]).find(e => e.title && e.title.trim().toLowerCase() === (g.examTitle||'').trim().toLowerCase());
      if (ex && !seen.has(ex.id)) { result.push({ exam: ex, grade: g }); seen.add(ex.id); }
      else if (!seen.has(g.examTitle)) { result.push({ exam: { id: null, title: g.examTitle }, grade: g }); seen.add(g.examTitle); }
    }
  });
  return result;
}

// Render student's dashboard including Demande de Récorrection
function renderStudentDashboard(containerId='studentDashboard', studentId=null){
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = '';
  const student = (appData.students||[]).find(s => s.id === studentId) || appData.students[0] || null;
  if (!student) {
    container.innerHTML = '<p>Pas d\'élève trouvé.</p>'; return;
  }
  const header = document.createElement('div');
  header.innerHTML = `<h3>${escapeHtml(student.fullname)}</h3><small>Class: ${escapeHtml(student.classroom||'')}</small>`;
  container.appendChild(header);

  // All exams list
  const examsBox = document.createElement('div');
  examsBox.style.marginTop = '10px';
  examsBox.innerHTML = '<h4>Exams disponibles</h4>';
  const ul = document.createElement('ul');
  (appData.exams||[]).forEach(e => {
    const li = document.createElement('li');
    // find grade for this student
    const grade = (appData.grades||[]).find(g => (g.examId && g.examId === e.id && g.studentId === student.id) || (g.studentId === student.id && g.examTitle && e.title && g.examTitle.trim().toLowerCase() === e.title.trim().toLowerCase()));
    li.innerHTML = `<strong>${escapeHtml(e.title)}</strong> <small>${escapeHtml(e.date||'')}</small>`;
    if (grade) {
      li.innerHTML += ` — <span>Note: ${escapeHtml(String(grade.score))}</span>`;
    } else {
      li.innerHTML += ` — <span class="muted">Pas de note</span>`;
    }
    ul.appendChild(li);
  });
  examsBox.appendChild(ul);
  container.appendChild(examsBox);

  // Demande de Récorrection de Note: show only exams that have grades for this student
  const recBox = document.createElement('div');
  recBox.style.marginTop = '12px';
  recBox.innerHTML = '<h4>Demande de Récorrection de Note</h4>';
  const select = document.createElement('select');
  select.id = 'selectRegrade';
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Sélectionnez une évaluation';
  select.appendChild(placeholderOption);

  const examsWithGrades = getExamsWithGradesForStudent(student.id);
  if (examsWithGrades.length === 0) {
    const hint = document.createElement('div');
    hint.className = 'muted';
    hint.textContent = 'Aucune évaluation avec note publiée pour cet élève.';
    recBox.appendChild(hint);
  } else {
    examsWithGrades.forEach(pair => {
      const e = pair.exam;
      const g = pair.grade;
      const opt = document.createElement('option');
      opt.value = e.id || ('title::' + (e.title||''));
      opt.textContent = `${e.title} — note: ${g.score}`;
      select.appendChild(opt);
    });
    recBox.appendChild(select);
    const textarea = document.createElement('textarea');
    textarea.id = 'regradeReason';
    textarea.placeholder = 'Motif de la demande...';
    textarea.style.display = 'block';
    textarea.style.width = '100%';
    textarea.style.minHeight = '80px';
    textarea.style.marginTop = '8px';
    recBox.appendChild(textarea);
    const send = makeButton('Envoyer la demande', ()=>{
      const sel = select.value;
      if (!sel) return alert('Choisissez une évaluation.');
      const reason = (textarea.value||'').trim();
      if (!reason) return alert('Expliquez la raison de la demande.');
      // here: we would normally send to server; for demo, save a "request" to localStorage (or console)
      const request = {
        id: uid('r'),
        date: new Date().toISOString(),
        studentId: student.id,
        examRef: sel,
        reason
      };
      // we'll push into appData.requests (create if not exist)
      appData.requests = appData.requests || [];
      appData.requests.push(request);
      saveData();
      alert('Demande envoyée.');
      textarea.value = '';
      select.value = '';
      renderRequestsAdmin(); // update admin panel if visible
    }, { className: 'btn-primary' });
    recBox.appendChild(send);
  }

  container.appendChild(recBox);
}

// Admin: view regrade requests
function renderRequestsAdmin(containerId='requestsAdmin'){
  const container = $(containerId);
  if (!container) return;
  if (!appData.currentUser || !appData.currentUser.isAdmin) {
    container.innerHTML = '<p class="muted">لا توجد صلاحية لعرض الطلبات.</p>'; return;
  }
  const list = appData.requests || [];
  if (!list.length) {
    container.innerHTML = '<p>Pas de demandes reçues.</p>'; return;
  }
  container.innerHTML = '<h4>Demandes de Récorrection</h4>';
  list.forEach(r => {
    const box = document.createElement('div');
    box.style.border = '1px solid rgba(0,0,0,0.06)';
    box.style.padding = '8px'; box.style.margin = '6px'; box.style.borderRadius = '8px';
    const student = (appData.students||[]).find(s => s.id === r.studentId);
    box.innerHTML = `<strong>${escapeHtml(student ? student.fullname : r.studentId)}</strong> 
      <div style="font-size:12px;color:#666">${escapeHtml(r.date)}</div>
      <div style="margin-top:6px;">Ref: ${escapeHtml(String(r.examRef))}</div>
      <div style="margin-top:6px;">${escapeHtml(r.reason)}</div>`;
    const done = makeButton('Mark handled', ()=>{
      appData.requests = (appData.requests||[]).filter(x=>x.id!==r.id); saveData(); renderRequestsAdmin(containerId);
    }, { className: 'btn' });
    box.appendChild(done);
    container.appendChild(box);
  });
}

// --- Admin: add grade form handler (ensuring examId saved) ---
function wireAdminGradeForm(formId='adminGradeForm'){
  const form = $(formId);
  if (!form) return;
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    const sid = form.querySelector('[name="studentId"]').value;
    const examSelect = form.querySelector('[name="examId"]');
    const examId = examSelect ? examSelect.value : '';
    const examTitleInput = form.querySelector('[name="examTitle"]');
    const score = Number(form.querySelector('[name="score"]').value);
    if (!sid) return alert('Choisissez un élève');
    if (!(Number.isFinite(score))) return alert('Entrez une note valide');
    let examTitle = '';
    if (examId) {
      const ex = (appData.exams||[]).find(e=>e.id===examId);
      examTitle = ex ? ex.title : (examTitleInput ? examTitleInput.value : '');
    } else {
      examTitle = examTitleInput ? examTitleInput.value : '';
    }
    addOrUpdateGrade({ examId: examId || null, examTitle: examTitle || '', studentId: sid, score });
    alert('Note enregistrée.');
    renderAll();
  });
}

// --- Utility to populate selects used in admin forms ---
function populateAdminSelects(){
  // student select
  qAll('select[name="studentId"]').forEach(sel => {
    sel.innerHTML = '<option value="">--choose student--</option>';
    (appData.students||[]).forEach(s => {
      const o = document.createElement('option'); o.value = s.id; o.textContent = s.fullname + ' (' + (s.classroom||'') + ')';
      sel.appendChild(o);
    });
  });
  // exam select
  qAll('select[name="examId"]').forEach(sel => {
    sel.innerHTML = '<option value="">--choose exam--</option>';
    (appData.exams||[]).forEach(e => {
      const o = document.createElement('option'); o.value = e.id; o.textContent = e.title + ' — ' + (e.date||'');
      sel.appendChild(o);
    });
  });
}

// --- Main render ---
function renderAll(){
  renderSliderAdminList('sliderAdminList');
  renderStudentDashboard('studentDashboard', appData.students && appData.students.length ? appData.students[0].id : null);
  renderRequestsAdmin('requestsAdmin');
  populateAdminSelects();
}

// --- Wiring initial UI elements if present ---
function wireUI(){
  // simulate login switcher (if present)
  qAll('.switch-user-btn').forEach(btn => {
    btn.addEventListener('click', function(){
      const username = btn.dataset.username;
      setCurrentUserByUsername(username);
    });
  });
  // wire admin grade form
  wireAdminGradeForm('adminGradeForm');
}

// --- Init ---
function init(){
  loadData();
  // ensure structures exist
  appData.exams = appData.exams || [];
  appData.grades = appData.grades || [];
  appData.students = appData.students || [];
  appData.sliders = appData.sliders || [];
  // render
  renderAll();
  wireUI();
}

// automatically init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* END of file */
