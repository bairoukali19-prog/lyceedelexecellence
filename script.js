// deepseek_javascript_20250914_729457.fixed.js
// نسخة كاملة ومعدّلة: إصلاحات تحكّم السلايدر وDemande de Récorrection
// الصق هذا الملف مكان ملف الـ JS عندك (app.js أو deepseek_javascript_20250914_729457.js)

const STORAGE_KEY = 'lyceeExcellence_v_8';
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
  slides: [],                 // legacy: some functions use slides/sliders; we keep slides for compatibility
  slidesData: [],             // alternative name (not required)
  responses: {},
  regradeRequests: [],
  currentUser: { id: "admin", fullname: "Administrateur" },
  isAdmin: true,
  announcement: { text: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة", image: null },
  siteCover: { enabled: true, url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" }
};

// ----------------- Persistence & Helpers -----------------
function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(appData, parsed);
      appData.slides = appData.slides || appData.slidesData || [];
      appData.regradeRequests = appData.regradeRequests || [];
      appData.responses = appData.responses || {};
    }
  } catch(e){ console.error('loadData', e); }
}

function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }

function $(id){ return document.getElementById(id); }
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escapeHtml(s){ return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

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
  // try render lists (if present)
  if (typeof renderAdminMessagesList === 'function') renderAdminMessagesList();
  if (typeof renderStudentMessages === 'function') renderStudentMessages();
}

// ----------------- Slider rendering (public) -----------------
function renderFrontSlider(){
  const container = $('front-hero-slider') || $('siteSlider') || $('siteSliderContainer');
  if (!container) return;
  container.innerHTML = '';
  // keep legacy: appData.slides or appData.slidesData
  const slides = appData.slides && appData.slides.length ? appData.slides : (appData.slidesData || []);
  if (!slides || !slides.length){
    container.innerHTML = '<div class="muted">لا توجد شرائح حاليا</div>';
    return;
  }
  const wrapper = document.createElement('div');
  wrapper.style.whiteSpace='nowrap';
  wrapper.style.overflowX='auto';
  wrapper.style.padding='8px 0';
  slides.forEach((sld, i) => {
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
    img.src = sld.url || sld.image || '';
    img.alt = sld.alt || sld.title || ('Slide '+(i+1));
    img.style.maxHeight = '160px';
    img.style.width = '100%';
    img.style.objectFit = 'cover';
    img.onerror = () => { img.style.display = 'none'; };
    slide.appendChild(img);
    if (sld.alt || sld.title){
      const cap = document.createElement('div');
      cap.textContent = sld.alt || sld.title;
      cap.style.paddingTop='6px'; cap.style.fontSize='13px';
      slide.appendChild(cap);
    }
    wrapper.appendChild(slide);
  });
  container.appendChild(wrapper);
}

// ----------------- Slider admin list (FIX) -----------------
// IMPORTANT CHANGE: before this function was only showing controls to the MAIN admin (id === 'admin').
// Now: show controls to ANY user with isAdmin === true (appData.currentUser.isAdmin).
function renderSliderAdminList(){
  const c = $('sliderAdminList');
  if (!c) return;
  // If user not logged or not admin -> hide controls
  if (!appData.currentUser || !(appData.currentUser.isAdmin || appData.isAdmin)) {
    c.innerHTML = '<p class="muted">لا تملك صلاحية تعديل السلايد</p>';
    return;
  }
  c.innerHTML = '';
  const slides = appData.slides || [];
  if (!slides.length) { c.innerHTML = '<p class="muted">Aucun slide pour le moment.</p>'; return; }

  slides.forEach((sld, idx) => {
    const d = document.createElement('div');
    d.className='content-row';
    d.style.marginBottom='8px';
    d.style.display='flex';
    d.style.alignItems='center';
    d.style.justifyContent='space-between';
    // left: thumb + title
    const left = document.createElement('div');
    left.style.display='flex';
    left.style.alignItems='center';
    const img = document.createElement('img'); img.src = sld.url || sld.image || ''; img.style.maxWidth='140px'; img.style.display='inline-block'; img.style.verticalAlign='middle';
    img.onerror = ()=>{ img.style.display='none'; };
    const info = document.createElement('span'); info.style.marginLeft='8px'; info.innerHTML = escapeHtml(sld.alt || sld.title || ('Slide '+(idx+1)));
    left.appendChild(img); left.appendChild(info);
    d.appendChild(left);

    // right: controls
    const right = document.createElement('div');
    const up = makeButton('↑', ()=>{ if(idx===0) return; const a=appData.slides[idx-1]; appData.slides[idx-1]=appData.slides[idx]; appData.slides[idx]=a; saveData(); renderSliderAdminList(); renderFrontSlider(); pushNotification('Slide déplacé','Slide déplacé vers le haut', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    const down = makeButton('↓', ()=>{ if(idx===appData.slides.length-1) return; const a=appData.slides[idx+1]; appData.slides[idx+1]=appData.slides[idx]; appData.slides[idx]=a; saveData(); renderSliderAdminList(); renderFrontSlider(); pushNotification('Slide déplacé','Slide déplacé vers le bas', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    const edit = makeButton('Edit', ()=>{ const newAlt = prompt('Titre / alt', sld.alt || sld.title || ''); if (newAlt !== null) { sld.alt = newAlt.trim(); saveData(); renderSliderAdminList(); renderFrontSlider(); } const newUrl = prompt('Image URL (laisser vide si Aucun)', sld.url || sld.image || ''); if (newUrl !== null) { if (newUrl.trim() === '') { sld.url = sld.image = ''; } else { sld.url = newUrl.trim(); sld.image = newUrl.trim(); } saveData(); renderSliderAdminList(); renderFrontSlider(); } });
    const del = makeButton('حذف', ()=>{ if(!confirm('Supprimer ce slide ?')) return; appData.slides.splice(idx,1); saveData(); renderSliderAdminList(); renderFrontSlider(); pushNotification('Slide supprimé','Slide supprimé', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    right.appendChild(up); right.appendChild(down); right.appendChild(edit); right.appendChild(del);
    d.appendChild(right);
    c.appendChild(d);
  });

  // Add new slide
  const addRow = document.createElement('div');
  addRow.style.marginTop = '6px';
  const addBtn = makeButton('Create new slide', ()=>{ const id = genId(); appData.slides = appData.slides || []; appData.slides.push({ id, title: 'Nouveau slide', alt: '', url: '', order: appData.slides.length+1, visible: true }); saveData(); renderSliderAdminList(); renderFrontSlider(); pushNotification('Slide ajouté','Slide ajouté', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
  addRow.appendChild(addBtn);
  c.appendChild(addRow);
}

// helpers to add slide by URL or file (keep existing API)
function adminAddSliderImageFromUrl(url){ if (!url) return pushNotification('رابط غير صالح','ضع رابط الصورة للسلايد'); appData.slides = appData.slides || []; appData.slides.push({ id: genId(), url: url, alt: '' }); saveData(); renderSliderAdminList(); renderFrontSlider(); pushNotification('Slide ajouté','تم إضافة سلايد جديد', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }
function adminAddSliderImageFromFile(file){ if (!file) return; const fr = new FileReader(); fr.onload = function(ev){ appData.slides = appData.slides || []; appData.slides.push({ id: genId(), url: ev.target.result, alt: '' }); saveData(); renderSliderAdminList(); renderFrontSlider(); pushNotification('Slide ajouté (upload)','تم رفع سلايد جديد (upload)', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); }; fr.readAsDataURL(file); }

// ----------------- Regrade / Exams logic (FIXES) -----------------

// tolerant title compare (case-insensitive + substring)
function titleEq(a,b){ if (!a || !b) return false; const A = String(a).trim().toLowerCase(); const B = String(b).trim().toLowerCase(); return A === B || A.includes(B) || B.includes(A); }

// Build an array of exam-like entries that the given student has a grade for.
// Each entry: { id: <examId|null>, title: <string> }
function getExamsAvailableForStudent(studentId){
  const seen = new Set();
  const res = [];
  (appData.grades || []).forEach(g => {
    if (g.studentId !== studentId) return;
    // preferred: if grade has examId and that exam exists in appData.exams, return that exam
    if (g.examId){
      const ex = (appData.exams || []).find(e => e.id === g.examId);
      if (ex && !seen.has(ex.id)){ res.push({ id: ex.id, title: ex.title }); seen.add(ex.id); return; }
    }
    // fallback: try match by title to an existing exam
    if (g.title || g.examTitle){
      const gTitle = g.title || g.examTitle;
      const matched = (appData.exams || []).find(e => e.title && titleEq(e.title, gTitle));
      if (matched && !seen.has(matched.id)){ res.push({ id: matched.id, title: matched.title }); seen.add(matched.id); return; }
      // else add pseudo entry keyed by title (id=null)
      const key = 'title::' + String((gTitle||'')).trim().toLowerCase();
      if (!seen.has(key)){ res.push({ id: null, title: gTitle }); seen.add(key); }
    }
  });
  // Also ensure any exam in exams list that has a grade for the student is included
  (appData.exams || []).forEach(e => {
    if (seen.has(e.id)) return;
    const has = (appData.grades || []).some(g => g.studentId === studentId && (g.examId === e.id || (g.title && titleEq(g.title, e.title))));
    if (has){ res.push({ id: e.id, title: e.title }); seen.add(e.id); }
  });
  return res;
}

// Student sends a regrade request. Accepts examRef (either examId string OR title string OR object {id|null,title})
function studentRequestRegrade(studentId, examRef, reason){
  if (!studentId) return pushNotification('Connectez-vous', 'يرجى تسجيل الدخول', { severity:'warn' });
  let examId = null, examTitle = null;
  if (!examRef) {
    examTitle = 'Non spécifié';
  } else if (typeof examRef === 'string'){
    // string might be examId or title (we detect examId existence)
    const e = (appData.exams || []).find(x => x.id === examRef);
    if (e) examId = e.id; else examTitle = examRef;
  } else if (typeof examRef === 'object'){
    examId = examRef.id || null;
    examTitle = examRef.title || null;
  }
  const req = { id: genId(), studentId, examId: examId || null, examTitle: (!examId && examTitle) ? examTitle : null, reason: reason || '', createdAt: Date.now(), handled:false };
  appData.regradeRequests = appData.regradeRequests || [];
  appData.regradeRequests.push(req);
  saveData();
  pushNotification('طلب إعادة تصحيح', 'تم إرسال طلب إعادة التصحيح', { target:'specific', specific: studentId });
  // update admin view if present
  if (typeof renderRegradeRequestsAdminList === 'function') renderRegradeRequestsAdminList();
}

// Admin view of regrade requests (updated to show title fallback)
function renderRegradeRequestsAdminList(){
  const c = $('regradeRequestsList') || $('requestsAdmin') || $('regradeRequestsContainer');
  if (!c) return;
  if (!appData.regradeRequests || !appData.regradeRequests.length) { c.innerHTML = '<p class="muted">لا توجد طلبات إعادة تصحيح</p>'; return; }
  c.innerHTML = '';
  appData.regradeRequests.slice().reverse().forEach(req => {
    const el = document.createElement('div');
    el.style.border = '1px solid rgba(0,0,0,0.06)';
    el.style.padding = '8px';
    el.style.marginBottom = '8px';
    el.style.borderRadius = '8px';
    const student = (appData.students || []).find(s => s.id === req.studentId) || { fullname: req.studentId };
    const examTitle = req.examId ? ((appData.exams || []).find(e=>e.id===req.examId) || {}).title : (req.examTitle || '(non spécifié)');
    el.innerHTML = `<div style="font-weight:600">${escapeHtml(student.fullname)}</div>
      <div style="font-size:12px;color:#666">${new Date(req.createdAt).toLocaleString()}</div>
      <div style="margin-top:6px;">${escapeHtml(examTitle || '')}</div>
      <div style="margin-top:6px;">${escapeHtml(req.reason || '')}</div>`;
    const markDone = makeButton(req.handled ? 'معالج' : 'وضع كمُعالَج', ()=>{ req.handled = true; saveData(); renderRegradeRequestsAdminList(); pushNotification('تم المعالجة', 'تم وضع الطلب كمُعالَج', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    markDone.style.marginLeft='8px';
    const del = makeButton('حذف', ()=>{ if (!confirm('Supprimer request ?')) return; appData.regradeRequests = appData.regradeRequests.filter(r=>r.id!==req.id); saveData(); renderRegradeRequestsAdminList(); pushNotification('Request supprimé', '', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); });
    del.style.marginLeft='6px';
    el.appendChild(markDone); el.appendChild(del);
    c.appendChild(el);
  });
}

// ----------------- Student dashboard rendering (with select filled by getExamsAvailableForStudent) -----------------
function renderStudentDashboard(containerId = 'studentDashboard'){
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!appData.currentUser) { container.innerHTML = '<p class="muted">غير مسجل الدخول</p>'; return; }
  // If the current user is admin/teacher, optionally show student preview; here we try to show student view only for students.
  const isStudentUser = !(appData.currentUser && appData.currentUser.isAdmin);
  const studentId = isStudentUser ? appData.currentUser.id : (appData.students && appData.students[0] ? appData.students[0].id : null);

  const header = document.createElement('div'); header.innerHTML = `<h3>واجهة التلميذ</h3><div style="font-size:13px;color:#666">${escapeHtml(appData.currentUser.fullname || '')}</div>`;
  container.appendChild(header);

  // recent grades
  const recent = document.createElement('div'); recent.style.marginTop='10px'; recent.innerHTML = '<h4>النقط المنشورة</h4>';
  const sg = (appData.grades || []).filter(g => g.studentId === studentId);
  if (!sg.length) recent.innerHTML += '<p class="muted">لا توجد نقاط منشورة.</p>';
  else {
    const ul = document.createElement('ul');
    sg.forEach(g => { const li = document.createElement('li'); li.innerHTML = `${escapeHtml(g.title || g.examTitle || '')} — <strong>${escapeHtml(String(g.score))}</strong>`; ul.appendChild(li); });
    recent.appendChild(ul);
  }
  container.appendChild(recent);

  // Demande de Récorrection: show only exams available for student
  const rec = document.createElement('div'); rec.style.marginTop='12px'; rec.innerHTML = '<h4>Demande de Récorrection de Note</h4>';
  const examsList = getExamsAvailableForStudent(studentId);
  if (!examsList.length){
    rec.innerHTML += '<p class="muted">لا توجد تقييمات لها نقاط منشورة يمكنك طلب إعادة التصحيح لها.</p>'; container.appendChild(rec);
  } else {
    const select = document.createElement('select'); select.style.width='100%'; select.id = 'regradeSelect';
    const placeholder = document.createElement('option'); placeholder.value=''; placeholder.textContent = 'Sélectionnez une évaluation';
    select.appendChild(placeholder);
    examsList.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id ? e.id : ('title::' + (e.title || ''));
      opt.textContent = e.title || '(sans titre)';
      select.appendChild(opt);
    });
    const textarea = document.createElement('textarea'); textarea.style.width='100%'; textarea.style.minHeight='80px'; textarea.style.marginTop='8px'; textarea.id='regradeReason'; textarea.placeholder='Motif de la demande...';
    const btn = makeButton('Envoyer la demande', ()=> {
      const val = select.value;
      if (!val) return alert('Choisissez une évaluation.');
      let examRef = null;
      if (val.startsWith('title::')) examRef = val.replace('title::','');
      else examRef = val; // examId
      const reason = (textarea.value||'').trim();
      studentRequestRegrade(studentId, examRef, reason);
      textarea.value = ''; select.value = '';
      alert('Demande envoyée.');
      if (typeof renderRegradeRequestsAdminList === 'function') renderRegradeRequestsAdminList();
    });
    rec.appendChild(select); rec.appendChild(textarea); rec.appendChild(btn);
    container.appendChild(rec);
  }
}

// ----------------- Small utilities and initial render -----------------
function renderAll(){
  try {
    renderFrontSlider();
    renderSliderAdminList();
    renderStudentDashboard();
    renderRegradeRequestsAdminList();
  } catch(e){ console.error('renderAll error', e); }
}

function init(){
  loadData();
  // ensure arrays
  appData.slides = appData.slides || [];
  appData.regradeRequests = appData.regradeRequests || [];
  appData.grades = appData.grades || [];
  appData.exams = appData.exams || [];
  appData.students = appData.students || [];
  saveData();
  renderAll();

  // wire optional elements (if present in your HTML)
  if ($('btnAddSlideUrl')) $('btnAddSlideUrl').addEventListener('click', ()=> { if (!appData.currentUser || !(appData.currentUser.isAdmin || appData.isAdmin)) return alert('No permission'); const url = prompt('Image URL'); if (!url) return; adminAddSliderImageFromUrl(url); });
  if ($('btnImport')) $('btnImport').addEventListener('change', e=> {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader(); fr.onload = function(ev){ try { if (!confirm('Importer va remplacer البيانات الحالية. Continuer?')) return; const parsed = JSON.parse(ev.target.result); Object.assign(appData, parsed); saveData(); renderAll(); pushNotification('Import réussi','Fichier importé avec succès',{ target:'specific', specific: appData.currentUser?appData.currentUser.id:null }); } catch(err){ pushNotification('Fichier invalide','تعذر استيراد الملف',{ severity:'error' }); } }; fr.readAsText(f);
  });
}

// run init when DOM ready
if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }

// expose for debugging
window.__deepseek_fixed = { appData, saveData, loadData, renderAll, getExamsAvailableForStudent };
