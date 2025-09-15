// ---------- Helper tolerant title comparison ----------
function titleEq(a, b){
  if (!a || !b) return false;
  const sa = String(a).trim().toLowerCase();
  const sb = String(b).trim().toLowerCase();
  return sa === sb || sa.includes(sb) || sb.includes(sa);
}

// ---------- Build exams list for a student from grades + exams store ----------
function getExamsAvailableForStudent(studentId){
  const seen = new Set();
  const result = [];

  (appData.grades || []).forEach(g => {
    if (g.studentId !== studentId) return;

    // Best: if grade stored examId and matches an exam record
    if (g.examId){
      const ex = (appData.exams || []).find(e => e.id === g.examId);
      if (ex && !seen.has(ex.id)){
        result.push(ex); seen.add(ex.id); return;
      }
    }

    // Try to find by title in exams
    if (g.title){
      const matched = (appData.exams || []).find(e => e.title && titleEq(e.title, g.title));
      if (matched && !seen.has(matched.id)){
        result.push(matched); seen.add(matched.id); return;
      }
      // fallback: create pseudo exam entry (keeps id null)
      const key = 'title::' + g.title.trim().toLowerCase();
      if (!seen.has(key)){
        result.push({ id: null, title: g.title });
        seen.add(key);
      }
    }
  });

  // also if there are exams that legitimately exist and have grade for this student via examId (cover other edge-cases)
  (appData.exams || []).forEach(e => {
    if (seen.has(e.id)) return;
    const has = (appData.grades || []).some(g => g.studentId === studentId && (g.examId === e.id || (g.title && titleEq(g.title, e.title))));
    if (has){
      result.push(e); seen.add(e.id);
    }
  });

  return result;
}

// ---------- Front slider render (uses appData.slides) ----------
function renderFrontSlider(){
  const container = $('front-hero-slider') || $('siteSlider') || $('siteSliderContainer');
  if (!container) return;
  container.innerHTML = '';
  const slides = appData.slides || [];
  if (!slides.length){
    container.innerHTML = '<div class="muted" style="padding:14px;text-align:center">لا توجد شرائح حاليا</div>';
    return;
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'front-slider-wrapper';
  slides.forEach(s => {
    const item = document.createElement('div');
    item.className = 'front-slide';
    item.style.display = 'inline-block';
    item.style.verticalAlign = 'top';
    item.style.width = '100%';
    item.style.maxHeight = '360px';
    item.style.overflow = 'hidden';
    if (s.url){
      const img = document.createElement('img');
      img.src = s.url;
      img.alt = s.alt || s.title || '';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'cover';
      img.onerror = ()=> img.style.display = 'none';
      item.appendChild(img);
    } else {
      const txt = document.createElement('div');
      txt.textContent = s.alt || s.title || 'Slide';
      txt.style.padding = '36px';
      txt.style.textAlign = 'center';
      item.appendChild(txt);
    }
    wrapper.appendChild(item);
  });
  container.appendChild(wrapper);
}

// ---------- Admin slider list (show to any admin, not only id==='admin') ----------
function renderSliderAdminList(){
  const c = $('sliderAdminList');
  if (!c) return;
  if (!appData.currentUser || !appData.isAdmin){
    c.innerHTML = '<div style="padding:8px;color:#666;border-radius:8px">ما عندكش صلاحية التحكم في السلايدر</div>';
    return;
  }
  c.innerHTML = '';
  const slides = appData.slides || [];
  if (!slides.length){
    c.innerHTML = '<div class="muted">Aucun slide pour le moment.</div>';
    return;
  }
  slides.forEach((sld, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.alignItems='center'; row.style.justifyContent='space-between';
    row.style.padding = '8px'; row.style.border = '1px solid rgba(0,0,0,0.04)'; row.style.borderRadius='8px'; row.style.marginBottom='8px';
    const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='center';
    if (sld.url){
      const img = document.createElement('img'); img.src = sld.url; img.style.width='120px'; img.style.height='70px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; img.onerror = ()=> img.style.display='none';
      left.appendChild(img);
    }
    const meta = document.createElement('div'); meta.style.marginLeft='10px';
    meta.innerHTML = '<div style="font-weight:600">'+escapeHtml(sld.alt || sld.title || 'Slide')+'</div><div style="font-size:12px;color:#666">'+escapeHtml(sld.id || '')+'</div>';
    left.appendChild(meta);
    row.appendChild(left);

    const controls = document.createElement('div');
    const btnUp = makeButton('↑', ()=> { if (idx>0){ const a = appData.slides[idx-1]; appData.slides[idx-1] = appData.slides[idx]; appData.slides[idx] = a; saveData(); renderSliderAdminList(); renderFrontSlider(); } });
    const btnDown = makeButton('↓', ()=> { if (idx < appData.slides.length-1){ const a = appData.slides[idx+1]; appData.slides[idx+1] = appData.slides[idx]; appData.slides[idx] = a; saveData(); renderSliderAdminList(); renderFrontSlider(); } });
    const btnEdit = makeButton('Edit', ()=> {
      const newAlt = prompt('Titre / alt', sld.alt || sld.title || '');
      if (newAlt !== null) { sld.alt = newAlt.trim(); saveData(); renderSliderAdminList(); renderFrontSlider(); }
      const newUrl = prompt('Image URL (laisser vide si aucun)', sld.url || '');
      if (newUrl !== null){ sld.url = newUrl.trim(); saveData(); renderSliderAdminList(); renderFrontSlider(); }
    });
    const btnDel = makeButton('حذف', ()=> { if (!confirm('Supprimer ce slide ?')) return; appData.slides.splice(idx,1); saveData(); renderSliderAdminList(); renderFrontSlider(); });
    controls.appendChild(btnUp); controls.appendChild(btnDown); controls.appendChild(btnEdit); controls.appendChild(btnDel);
    row.appendChild(controls);

    c.appendChild(row);
  });
}

// ---------- Wire slider admin events (allow any admin) ----------
function wireSliderAdminEvents(){
  const isAdmin = appData.currentUser && appData.isAdmin;
  const btn = $('btnAddSliderImage');
  if (!btn) return;
  // if not admin, hide upload fields
  if (!isAdmin){
    btn.style.display = 'none';
    const up = $('sliderImageUpload'); if (up) up.style.display='none';
    const urlInp = $('sliderImageUrl'); if (urlInp) urlInp.style.display='none';
    const clr = $('btnClearSlider'); if (clr) clr.style.display='none';
    return;
  } else {
    btn.style.display = '';
    const up = $('sliderImageUpload'); if (up) up.style.display='';
    const urlInp = $('sliderImageUrl'); if (urlInp) urlInp.style.display='';
    const clr = $('btnClearSlider'); if (clr) clr.style.display='';
  }

  btn.removeEventListener && btn.removeEventListener('click', null); // defensive
  btn.addEventListener('click', ()=> {
    const url = ($('sliderImageUrl') && $('sliderImageUrl').value.trim()) || '';
    const fileInput = $('sliderImageUpload');
    if (url) {
      adminAddSliderImageFromUrl(url);
    } else if (fileInput && fileInput.files && fileInput.files[0]){
      adminAddSliderImageFromFile(fileInput.files[0]);
    } else {
      pushNotification('Choisir une image','Choisir image او وضع رابط URL',{ severity:'warn', target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
    }
    if ($('sliderImageUrl')) $('sliderImageUrl').value='';
    if (fileInput) fileInput.value='';
  });

  const clrBtn = $('btnClearSlider');
  if (clrBtn){
    clrBtn.addEventListener('click', ()=> {
      if (!confirm('Vider tout le slider ?')) return;
      appData.slides = [];
      saveData(); renderSliderAdminList(); renderFrontSlider();
      pushNotification('Slider vidé','جميع السلايدات محذوفة', { target:'specific', specific: appData.currentUser?appData.currentUser.id:null });
    });
  }
}

// ---------- Render exams (student view) with regrade only for exams that have grades for student ----------
function renderExams(){
  const c = $('examsContent');
  if (!c) return;
  c.innerHTML = '';
  // If admin view, show all exams
  if (appData.currentUser && appData.isAdmin){
    if (!appData.exams || !appData.exams.length) { c.innerHTML = '<p class="muted">Aucun examen</p>'; return; }
    appData.exams.forEach(e => {
      const d = document.createElement('div');
      const a = document.createElement('a'); a.href = e.driveLink || '#'; a.target = '_blank'; a.textContent = e.title || 'Examen';
      d.appendChild(a);
      c.appendChild(d);
    });
    return;
  }

  // Student view: show only exams that are connected to grades (even if exam record missing)
  if (!appData.currentUser || appData.isAdmin) return;
  const studentId = appData.currentUser.id;
  const examsForStudent = getExamsAvailableForStudent(studentId);
  if (!examsForStudent.length){
    c.innerHTML = '<p class="muted">لا توجد امتحانات لها نقاط منشورة يمكنك طلب إعادة التصحيح لها</p>';
    return;
  }
  examsForStudent.forEach(e => {
    const d = document.createElement('div');
    const titleText = e.title || e.examTitle || 'Évaluation';
    const span = document.createElement('span'); span.textContent = titleText;
    d.appendChild(span);
    const btn = makeButton('طلب إعادة تصحيح', ()=> {
      const note = prompt('اكتب ملاحظة لطلب إعادة التصحيح (اختياري):');
      if (note === null) return;
      // If e.id exists use it, otherwise we pass null and store title in request
      studentRequestRegrade(e.id || null, note || '', e.title || e.examTitle || titleText);
      pushNotification('طلب إعادة تصحيح','تم إرسال طلب إعادة التصحيح', { target:'specific', specific: studentId });
    });
    btn.style.marginLeft = '8px';
    d.appendChild(btn);
    c.appendChild(d);
  });
}

// ---------- studentRequestRegrade: store examId if present else store title ----------
function studentRequestRegrade(examId, note, fallbackTitle){
  if (!appData.currentUser) { pushNotification('Connectez-vous','يرجى تسجيل الدخول',{ severity:'warn' }); return; }
  const req = {
    id: genId(),
    examId: examId || null,
    examTitle: (!examId && fallbackTitle) ? fallbackTitle : null,
    studentId: appData.currentUser.id,
    note: note || '',
    createdAt: Date.now(),
    handled: false
  };
  appData.regradeRequests = appData.regradeRequests || [];
  appData.regradeRequests.push(req);
  saveData();
  // also send an internal message to admin(s)
  appData.messages = appData.messages || [];
  appData.messages.push({ id: genId(), title: 'طلب إعادة تصحيح', content: 'طالب طلب إعادة تصحيح: ' + (req.examTitle || ('examId:' + (req.examId||''))) + ' — ' + (req.note || ''), target: 'all', createdAt: Date.now() });
  saveData();
  renderRegradeRequestsAdminList && renderRegradeRequestsAdminList();
  renderStudentMessages && renderStudentMessages();
}

// ---------- loadStudentDashboard: ensure quick exams area uses getExamsAvailableForStudent ----------
function loadStudentDashboard(){
  if (!appData.currentUser || appData.isAdmin) return;
  const studentId = appData.currentUser.id;

  // recent grades
  const recentEl = $('studentRecentGrades');
  if (recentEl){
    const grades = (appData.grades || []).filter(g => g.studentId === studentId).sort((a,b)=> new Date(b.date) - new Date(a.date));
    if (!grades.length) recentEl.innerHTML = '<p class="muted">Aucune note disponible pour le moment.</p>';
    else recentEl.innerHTML = '<ul>' + grades.slice(0,6).map(g => '<li>' + escapeHtml(g.subject || '') + ' - ' + escapeHtml(g.title || '') + ' : ' + (g.score || 0) + '</li>').join('') + '</ul>';
  }

  // exams quick (regrade)
  const examsEl = $('studentExamsQuick');
  if (examsEl){
    const exams = getExamsAvailableForStudent(studentId);
    if (!exams.length) examsEl.innerHTML = '<p class="muted">لا توجد امتحانات لها نقاط منشورة يمكنك طلب إعادة التصحيح لها</p>';
    else {
      examsEl.innerHTML = '<ul>' + exams.map(e => {
        const titleText = e.title || e.examTitle || 'Évaluation';
        return '<li>' + escapeHtml(titleText) + ' <button data-exid="'+ (e.id || '') +'" class="dashboard-regrade">طلب إعادة تصحيح</button></li>';
      }).join('') + '</ul>';
      document.querySelectorAll('.dashboard-regrade').forEach(btn => {
        btn.addEventListener('click', () => {
          const exid = btn.getAttribute('data-exid') || null;
          const note = prompt('اكتب ملاحظة لطلب إعادة التصحيح (اختياري):');
          if (note === null) return;
          // find title fallback if exid empty
          let fallbackTitle = null;
          if (!exid) {
            const li = btn.parentElement;
            fallbackTitle = li ? li.firstChild.textContent.trim() : null;
          }
          studentRequestRegrade(exid || null, note || '', fallbackTitle || null);
          pushNotification('طلب إعادة تصحيح', 'تم إرسال طلب إعادة التصحيح', { target:'specific', specific: studentId });
        });
      });
    }
  }

  // other parts (quizzes/messages) unchanged
  renderStudentMessages && renderStudentMessages();
  renderQuizListForStudent && renderQuizListForStudent();
}
