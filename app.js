(function(){
  // safe MathJax typeset helper (queue until MathJax available)
  window._assistant_mj_queue = window._assistant_mj_queue || [];
  function typesetSafe(node){
    return new Promise(function(resolve){
      if (window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise([node]).then(resolve).catch(resolve);
      } else {
        window._assistant_mj_queue.push({node:node, resolve:resolve});
        if (!window._assistant_mj_checker){
          window._assistant_mj_checker = setInterval(function(){
            if (window.MathJax && MathJax.typesetPromise){
              clearInterval(window._assistant_mj_checker); window._assistant_mj_checker = null;
              const q = window._assistant_mj_queue.slice(); window._assistant_mj_queue = [];
              q.reduce((p,it)=> p.then(()=> MathJax.typesetPromise([it.node]).then(()=> it.resolve()).catch(()=> it.resolve())), Promise.resolve());
            }
          }, 200);
        }
      }
    });
  }

  // Improved LaTeX line-number + preview updater (no CSS changes)
  function updateLatexLineNumbersAssistant(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    const preview = document.getElementById('latexPreview');
    if (!ta || !ln || !preview) return;
    // ensure pre height matches textarea (keeps numbers inside the same frame)
    ln.style.boxSizing = 'border-box';
    ln.style.height = ta.offsetHeight + 'px';
    // line numbers content
    const lines = (ta.value || '').split('\n').length;
    const count = Math.min(Math.max(lines,1),2000);
    let out = '';
    for (let i=1;i<=count;i++){ out += i + '\n'; }
    ln.textContent = out;
    // sync scroll position
    ln.scrollTop = ta.scrollTop;
    // preview: use display math so equations appear centered; escape is handled by user
    const code = ta.value || '';
    if (code.trim()){
      preview.innerHTML = '\\\\[' + code + '\\\\]';
      typesetSafe(preview).catch(()=>{});
    } else {
      preview.textContent = 'ستظهر المعاينة هنا';
    }
  }

  // attach listeners if elements exist
  document.addEventListener('DOMContentLoaded', function(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    if (ta && ln){
      // initial sync
      updateLatexLineNumbersAssistant();
      ta.addEventListener('input', updateLatexLineNumbersAssistant);
      ta.addEventListener('scroll', function(){ ln.scrollTop = ta.scrollTop; });
      window.addEventListener('resize', function(){ ln.style.height = ta.offsetHeight + 'px'; });
    }

    // Also override global updateLatexLineNumbers and updatePreview if they exist to use the improved one
    try { window.updateLatexLineNumbers = updateLatexLineNumbersAssistant; window.updateLatexPreview = updateLatexLineNumbersAssistant; } catch(e){}

    // Fix duplicate #studentQuizList elements: keep the second as the "main" quiz list,
    // rename the first (dashboard trimmed view) to #studentQuizSummary so functions won't conflict.
    const els = document.querySelectorAll('#studentQuizList');
    if (els && els.length > 1){
      els[0].id = 'studentQuizSummary';
      // If loadStudentDashboard exists, wrap it to populate the summary after execution
      if (typeof window.loadStudentDashboard === 'function'){
        const orig = window.loadStudentDashboard;
        window.loadStudentDashboard = function(){
          try { orig(); } catch(e){ console.error(e); }
          // populate summary small list (first 6)
          const container = document.getElementById('studentQuizSummary');
          if (!container) return;
          const list = (window.appData && window.appData.quizzes) ? window.appData.quizzes.slice(0,6) : [];
          if (!list.length) { container.innerHTML = '<p class=\"muted\">Aucun quiz disponible pour le moment.</p>'; return; }
          container.innerHTML = '<ul>' + list.map(q=>'<li>'+ (q.title ? q.title : 'Untitled') +' ('+ (q.questions? q.questions.length : 0) +' q)</li>').join('') + '</ul>';
        };
      }
    }

    // Ensure admin has a link to Slider tab (tab-slider) in the sidebar for easier access
    const menu = document.querySelector('.admin-menu');
    if (menu && !document.querySelector('.admin-tab-link[data-tab=\"tab-slider\"]')){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'admin-tab-link';
      a.setAttribute('data-tab','tab-slider');
      a.innerHTML = '<i class=\"fa-solid fa-images\"></i> Slider';
      a.addEventListener('click', function(e){ e.preventDefault(); try { switchAdminTab('tab-slider'); } catch(err){ console.error(err); } });
      li.appendChild(a);
      menu.appendChild(li);
    }

    // Make sure slider admin events are wired (in case earlier initialization missed it)
    try { if (typeof window.wireSliderAdminEvents === 'function') window.wireSliderAdminEvents(); } catch(e){ console.error(e); }

    // Ensure renderFrontSlider runs once at load to reflect stored slides
    try { if (typeof window.renderFrontSlider === 'function') window.renderFrontSlider(); } catch(e){ console.error(e); }
  });
})();

(function(){
  // safe MathJax typeset helper (queue until MathJax ready)
  window._assistant_mj_queue = window._assistant_mj_queue || [];
  function typesetSafe(node){
    return new Promise(function(resolve){
      if (window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise([node]).then(resolve).catch(resolve);
      } else {
        window._assistant_mj_queue.push({node:node, resolve:resolve});
        if (!window._assistant_mj_checker){
          window._assistant_mj_checker = setInterval(function(){
            if (window.MathJax && MathJax.typesetPromise){
              clearInterval(window._assistant_mj_checker); window._assistant_mj_checker = null;
              const q = window._assistant_mj_queue.slice(); window._assistant_mj_queue = [];
              q.reduce((p,it)=> p.then(()=> MathJax.typesetPromise([it.node]).then(()=> it.resolve()).catch(()=> it.resolve())), Promise.resolve());
            }
          }, 200);
        }
      }
    });
  }

  // robust update for LaTeX editor: sets line-number height, syncs scroll, updates preview safely
  function updateLatexLineNumbersAssistant(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    const preview = document.getElementById('latexPreview');
    if (!ta || !ln || !preview) return;
    // ensure line-number box matches textarea height and is scroll-synced
    ln.style.boxSizing = 'border-box';
    ln.style.height = ta.offsetHeight + 'px';
    // generate numbers
    const lines = (ta.value || '').split('\n').length;
    const count = Math.min(Math.max(lines,1),2000);
    let out = '';
    for (let i=1;i<=count;i++){ out += i + '\n'; }
    ln.textContent = out;
    // sync scroll position
    ln.scrollTop = ta.scrollTop;
    // preview: render as display math for cleaner output
    const code = ta.value || '';
    if (code.trim()){
      preview.innerHTML = '\\\\[' + code + '\\\\]';
      typesetSafe(preview).catch(()=>{});
    } else {
      preview.textContent = 'ستظهر المعاينة هنا';
    }
  }

  // attach on DOM ready; override existing handlers for safety
  document.addEventListener('DOMContentLoaded', function(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    if (ta && ln){
      // wire events and initial sync
      ta.addEventListener('input', updateLatexLineNumbersAssistant);
      ta.addEventListener('scroll', function(){ ln.scrollTop = ta.scrollTop; });
      window.addEventListener('resize', function(){ ln.style.height = ta.offsetHeight + 'px'; });
      // immediate sync
      updateLatexLineNumbersAssistant();
    }

    // override global functions if present
    try { window.updateLatexLineNumbers = updateLatexLineNumbersAssistant; window.updateLatexPreview = updateLatexLineNumbersAssistant; } catch(e){}

    // Fix duplicate #studentQuizList elements if present: rename the first to studentQuizSummary
    const els = document.querySelectorAll('#studentQuizList');
    if (els && els.length > 1){
      els[0].id = 'studentQuizSummary';
      if (typeof window.loadStudentDashboard === 'function'){
        const orig = window.loadStudentDashboard;
        window.loadStudentDashboard = function(){
          try { orig(); } catch(e){ console.error(e); }
          // populate summary small list
          const container = document.getElementById('studentQuizSummary');
          if (!container) return;
          const list = (window.appData && window.appData.quizzes) ? window.appData.quizzes.slice(0,6) : [];
          if (!list.length) { container.innerHTML = '<p class=\"muted\">Aucun quiz disponible pour le moment.</p>'; return; }
          container.innerHTML = '<ul>' + list.map(q=>'<li>'+ (q.title ? q.title : 'Untitled') +' ('+ (q.questions? q.questions.length : 0) +' q)</li>').join('') + '</ul>';
        };
      }
    }

    // ensure admin slider tab link exists
    const menu = document.querySelector('.admin-menu');
    if (menu && !document.querySelector('.admin-tab-link[data-tab=\"tab-slider\"]')){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'admin-tab-link';
      a.setAttribute('data-tab','tab-slider');
      a.innerHTML = '<i class=\"fa-solid fa-images\"></i> Slider';
      a.addEventListener('click', function(e){ e.preventDefault(); try { switchAdminTab('tab-slider'); } catch(err){ console.error(err); } });
      li.appendChild(a);
      menu.appendChild(li);
    }

    // ensure slider admin events are wired (safe to call multiple times)
    try { if (typeof window.wireSliderAdminEvents === 'function') window.wireSliderAdminEvents(); } catch(e){ console.error(e); }

    // ensure front slider rendered initially
    try { if (typeof window.renderFrontSlider === 'function') window.renderFrontSlider(); } catch(e){ console.error(e); }
  });
})();

(function(){
  // Ensure appData exists
  window.appData = window.appData || { slides: [], latexContents: [], grades: [], quizzes: [], exams: [], revisionRequests: [], students: [], messages: [] };

  /* --------------------------
     Front slider rendering
     -------------------------- */
  function renderFrontSlider(){
    const container = document.getElementById('front-hero-slider');
    if (!container) return;
    container.innerHTML = '';
    const slides = (appData.slides || []);
    if (!slides.length){
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    slides.forEach((s, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'front-slide';
      wrap.style.display = 'inline-block';
      wrap.style.minWidth = '200px';
      wrap.style.maxWidth = '320px';
      wrap.style.marginRight = '8px';
      // image
      const img = document.createElement('img');
      img.src = s.url || '';
      img.alt = s.alt || ('slide ' + (i+1));
      img.style.maxWidth = '100%';
      img.style.maxHeight = '160px';
      img.onerror = ()=> { img.style.display='none'; };
      wrap.appendChild(img);
      // optional caption
      if (s.alt){
        const cap = document.createElement('div'); cap.textContent = s.alt; cap.style.fontSize='13px'; cap.style.marginTop='6px';
        wrap.appendChild(cap);
      }
      container.appendChild(wrap);
    });
  }

  // Make renderFrontSlider global if not already
  window.renderFrontSlider = renderFrontSlider;

  /* --------------------------
     Slider admin wiring (safe idempotent)
     -------------------------- */
  function wireSliderAdminEventsSafe(){
    // avoid double-binding by marking container
    if (wireSliderAdminEventsSafe._bound) return;
    wireSliderAdminEventsSafe._bound = true;

    const addBtn = document.getElementById('btnAddSliderImage');
    const urlInput = document.getElementById('sliderImageUrl');
    const fileInput = document.getElementById('sliderImageUpload');
    const clearBtn = document.getElementById('btnClearSlider');

    if (addBtn){
      addBtn.addEventListener('click', () => {
        const url = urlInput && urlInput.value && urlInput.value.trim();
        if (url) {
          appData.slides = appData.slides || [];
          appData.slides.push({ id: 's_' + Date.now(), url: url, alt: '' });
          saveData(); renderSliderAdminList(); renderFrontSlider(); if (urlInput) urlInput.value=''; alert('Slide ajouté');
          return;
        }
        if (fileInput && fileInput.files && fileInput.files[0]){
          const f = fileInput.files[0];
          const fr = new FileReader();
          fr.onload = function(ev){
            appData.slides = appData.slides || [];
            appData.slides.push({ id: 's_' + Date.now(), url: ev.target.result, alt: '' });
            saveData(); renderSliderAdminList(); renderFrontSlider(); fileInput.value=''; alert('Slide ajouté (upload)');
          };
          fr.readAsDataURL(f);
          return;
        }
        alert('فشل: ضع رابط الصورة أو اختر ملفاً');
      });
    }
    if (clearBtn){
      clearBtn.addEventListener('click', () => {
        if (!confirm('Vider tout le slider ?')) return;
        appData.slides = []; saveData(); renderSliderAdminList(); renderFrontSlider();
      });
    }
  }
  window.wireSliderAdminEvents = wireSliderAdminEventsSafe;

  /* --------------------------
     LaTeX lessons for students
     -------------------------- */
  function renderLatexListForStudents(){
    const c = document.getElementById('studentCoursList') || document.getElementById('studentCoursList') || document.getElementById('studentCoursList');
    // fallback id in the markup is 'studentCoursList' (from file)
    const container = document.getElementById('studentCoursList') || document.getElementById('studentCoursList') || document.getElementById('studentCoursList');
    // If not found, try studentCoursList or studentCours
    let target = document.getElementById('studentCoursList');
    if (!target) target = document.getElementById('studentCoursList');
    if (!target) return;
    target.innerHTML = '';
    if (!appData.latexContents || !appData.latexContents.length){
      target.innerHTML = '<p class="muted">لا توجد دروس متاحة حتى الآن.</p>';
      return;
    }
    appData.latexContents.forEach(item => {
      const card = document.createElement('div'); card.className='content-card';
      const inner = document.createElement('div'); inner.className='card-content';
      const title = document.createElement('h3'); title.textContent = item.title || 'Untitled';
      inner.appendChild(title);
      if (item.description) {
        const desc = document.createElement('p'); desc.textContent = item.description; inner.appendChild(desc);
      }
      const btnView = document.createElement('button'); btnView.className='btn'; btnView.textContent='عرض الدرس';
      const previewDiv = document.createElement('div'); previewDiv.className='latex-preview-area'; previewDiv.style.minHeight='80px'; previewDiv.style.marginTop='8px';
      btnView.addEventListener('click', () => {
        previewDiv.innerHTML = '\\[' + (item.code || '') + '\\]';
        if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([previewDiv]).catch(()=>{});
        // scroll into view
        previewDiv.scrollIntoView({ behavior:'smooth', block:'center' });
      });
      inner.appendChild(btnView);
      inner.appendChild(previewDiv);
      card.appendChild(inner);
      target.appendChild(card);
    });
  }
  window.renderLatexListForStudents = renderLatexListForStudents;

  /* --------------------------
     Revision request handling
     - populate select with student's exams/grades
     - submit requests and show them
     -------------------------- */
  function populateRevisionSelect(){
    const sel = document.getElementById('revisionExam');
    if (!sel) return;
    sel.innerHTML = '<option value="">Sélectionnez une évaluation</option>';
    const student = appData.currentUser;
    if (!student) return;
    // include grades and exams and exercises
    const items = [];
    (appData.grades || []).filter(g => g.studentId === student.id).forEach(g => items.push({ id: g.id, type: 'note', text: g.title + ' - ' + g.subject }));
    (appData.exams || []).forEach(e => items.push({ id: e.id, type: 'examen', text: e.title || ('Examen ' + (e.id||'')) }));
    (appData.exercises || []).forEach(ex => items.push({ id: ex.id, type: 'exercice', text: ex.title || ('Exercice ' + (ex.id||'')) }));
    if (!items.length) { sel.innerHTML = '<option value="">Aucune évaluation disponible</option>'; return; }
    items.forEach(it => {
      const o = document.createElement('option'); o.value = it.type + '::' + it.id; o.textContent = it.text; sel.appendChild(o);
    });
  }

  function renderStudentRevisionRequests(){
    const container = document.getElementById('studentRevisionRequests');
    if (!container) return;
    const student = appData.currentUser;
    if (!student) { container.innerHTML = '<p class="muted">Connectez-vous</p>'; return; }
    const list = (appData.revisionRequests || []).filter(r => r.studentId === student.id);
    if (!list.length) { container.innerHTML = '<p class="muted">Vous n\'avez pas encore soumis de demandes de récorrection.</p>'; return; }
    container.innerHTML = '<ul>' + list.map(r => '<li><strong>' + escapeHtml(r.evaluationText || r.evaluation) + '</strong> - ' + new Date(r.createdAt).toLocaleString() + '<br/>' + escapeHtml(r.message) + (r.status ? ' (' + r.status + ')' : '') + '</li>').join('') + '</ul>';
  }

  function handleRevisionFormSubmit(e){
    e.preventDefault();
    const sel = document.getElementById('revisionExam');
    const msg = document.getElementById('revisionMessage');
    if (!sel || !msg) return alert('خطأ في النموذج');
    const val = sel.value;
    if (!val) return alert('حدد الامتحان');
    const [type, id] = val.split('::');
    const student = appData.currentUser;
    if (!student) return alert('Connectez-vous d\'abord');
    const evalText = sel.options[sel.selectedIndex].text;
    const req = { id: 'rv_' + Date.now(), studentId: student.id, evaluationId: id, evaluationType: type, evaluationText: evalText, message: msg.value.trim(), status: 'Pending', createdAt: Date.now() };
    appData.revisionRequests = appData.revisionRequests || [];
    appData.revisionRequests.push(req);
    saveData();
    renderStudentRevisionRequests();
    renderRevisionRequestsList();
    alert('Demande envoyée');
    msg.value = '';
    sel.value = '';
  }

  function renderRevisionRequestsList(){
    const c = document.getElementById('revisionRequestsList');
    if (!c) return;
    c.innerHTML = '';
    const list = appData.revisionRequests || [];
    if (!list.length) return c.innerHTML = '<p class="muted">Aucune demande pour le moment.</p>';
    list.forEach(r => {
      const s = appData.students.find(st => st.id === r.studentId);
      const div = document.createElement('div'); div.className='content-row';
      div.innerHTML = '<strong>' + (s ? escapeHtml(s.fullname) : 'Étudiant') + '</strong> — ' + escapeHtml(r.evaluationText || '') + ' — ' + (r.status || '') + '<div style="margin-top:6px;">' + escapeHtml(r.message) + '</div>';
      const btnResolve = document.createElement('button'); btnResolve.textContent='Marquer résolu'; btnResolve.className='btn';
      btnResolve.style.marginLeft='8px';
      btnResolve.addEventListener('click', ()=> { r.status = 'Resolved'; saveData(); renderRevisionRequestsList(); renderStudentRevisionRequests(); });
      const btnDel = document.createElement('button'); btnDel.textContent='Supprimer'; btnDel.className='btn btn-danger'; btnDel.style.marginLeft='6px';
      btnDel.addEventListener('click', ()=> { if (!confirm('Supprimer cette demande ?')) return; appData.revisionRequests = appData.revisionRequests.filter(x=>x.id!==r.id); saveData(); renderRevisionRequestsList(); renderStudentRevisionRequests(); });
      div.appendChild(btnResolve); div.appendChild(btnDel);
      c.appendChild(div);
    });
  }

  /* --------------------------
     Hook into existing lifecycle
     -------------------------- */
  document.addEventListener('DOMContentLoaded', function(){
    // wire admin slider events safely
    try { wireSliderAdminEventsSafe(); } catch(e){ console.error(e); }
    // initial render of front slider
    try { renderFrontSlider(); } catch(e){ console.error(e); }
    // populate revision select if student logged in
    try { populateRevisionSelect(); } catch(e){ console.error(e); }
    // bind revision form
    const revForm = document.getElementById('revisionRequestForm');
    if (revForm && !revForm._bound){
      revForm._bound = true;
      revForm.addEventListener('submit', handleRevisionFormSubmit);
    }
    // render revision lists
    try { renderRevisionRequestsList(); renderStudentRevisionRequests(); } catch(e){ console.error(e); }
    // render latex lessons list for students
    try { renderLatexListForStudents(); } catch(e){ console.error(e); }
  });

  // expose for manual calls
  window.renderFrontSlider = renderFrontSlider;
  window.renderLatexListForStudents = renderLatexListForStudents;
  window.populateRevisionSelect = populateRevisionSelect;
  window.renderRevisionRequestsList = renderRevisionRequestsList;
  window.renderStudentRevisionRequests = renderStudentRevisionRequests;

})();



(function(){
  // safe MathJax typeset helper (queue until MathJax available)
  window._assistant_mj_queue = window._assistant_mj_queue || [];
  function typesetSafe(node){
    return new Promise(function(resolve){
      if (window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise([node]).then(resolve).catch(resolve);
      } else {
        window._assistant_mj_queue.push({node:node, resolve:resolve});
        if (!window._assistant_mj_checker){
          window._assistant_mj_checker = setInterval(function(){
            if (window.MathJax && MathJax.typesetPromise){
              clearInterval(window._assistant_mj_checker); window._assistant_mj_checker = null;
              const q = window._assistant_mj_queue.slice(); window._assistant_mj_queue = [];
              q.reduce((p,it)=> p.then(()=> MathJax.typesetPromise([it.node]).then(()=> it.resolve()).catch(()=> it.resolve())), Promise.resolve());
            }
          }, 200);
        }
      }
    });
  }

  // Improved LaTeX line-number + preview updater (no CSS changes)
  function updateLatexLineNumbersAssistant(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    const preview = document.getElementById('latexPreview');
    if (!ta || !ln || !preview) return;
    // ensure pre height matches textarea (keeps numbers inside the same frame)
    ln.style.boxSizing = 'border-box';
    ln.style.height = ta.offsetHeight + 'px';
    // line numbers content
    const lines = (ta.value || '').split('\n').length;
    const count = Math.min(Math.max(lines,1),2000);
    let out = '';
    for (let i=1;i<=count;i++){ out += i + '\n'; }
    ln.textContent = out;
    // sync scroll position
    ln.scrollTop = ta.scrollTop;
    // preview: use display math so equations appear centered; escape is handled by user
    const code = ta.value || '';
    if (code.trim()){
      preview.innerHTML = '\\\\[' + code + '\\\\]';
      typesetSafe(preview).catch(()=>{});
    } else {
      preview.textContent = 'ستظهر المعاينة هنا';
    }
  }

  // attach listeners if elements exist
  document.addEventListener('DOMContentLoaded', function(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    if (ta && ln){
      // initial sync
      updateLatexLineNumbersAssistant();
      ta.addEventListener('input', updateLatexLineNumbersAssistant);
      ta.addEventListener('scroll', function(){ ln.scrollTop = ta.scrollTop; });
      window.addEventListener('resize', function(){ ln.style.height = ta.offsetHeight + 'px'; });
    }

    // Also override global updateLatexLineNumbers and updatePreview if they exist to use the improved one
    try { window.updateLatexLineNumbers = updateLatexLineNumbersAssistant; window.updateLatexPreview = updateLatexLineNumbersAssistant; } catch(e){}

    // Fix duplicate #studentQuizList elements: keep the second as the "main" quiz list,
    // rename the first (dashboard trimmed view) to #studentQuizSummary so functions won't conflict.
    const els = document.querySelectorAll('#studentQuizList');
    if (els && els.length > 1){
      els[0].id = 'studentQuizSummary';
      // If loadStudentDashboard exists, wrap it to populate the summary after execution
      if (typeof window.loadStudentDashboard === 'function'){
        const orig = window.loadStudentDashboard;
        window.loadStudentDashboard = function(){
          try { orig(); } catch(e){ console.error(e); }
          // populate summary small list (first 6)
          const container = document.getElementById('studentQuizSummary');
          if (!container) return;
          const list = (window.appData && window.appData.quizzes) ? window.appData.quizzes.slice(0,6) : [];
          if (!list.length) { container.innerHTML = '<p class=\"muted\">Aucun quiz disponible pour le moment.</p>'; return; }
          container.innerHTML = '<ul>' + list.map(q=>'<li>'+ (q.title ? q.title : 'Untitled') +' ('+ (q.questions? q.questions.length : 0) +' q)</li>').join('') + '</ul>';
        };
      }
    }

    // Ensure admin has a link to Slider tab (tab-slider) in the sidebar for easier access
    const menu = document.querySelector('.admin-menu');
    if (menu && !document.querySelector('.admin-tab-link[data-tab=\"tab-slider\"]')){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'admin-tab-link';
      a.setAttribute('data-tab','tab-slider');
      a.innerHTML = '<i class=\"fa-solid fa-images\"></i> Slider';
      a.addEventListener('click', function(e){ e.preventDefault(); try { switchAdminTab('tab-slider'); } catch(err){ console.error(err); } });
      li.appendChild(a);
      menu.appendChild(li);
    }

    // Make sure slider admin events are wired (in case earlier initialization missed it)
    try { if (typeof window.wireSliderAdminEvents === 'function') window.wireSliderAdminEvents(); } catch(e){ console.error(e); }

    // Ensure renderFrontSlider runs once at load to reflect stored slides
    try { if (typeof window.renderFrontSlider === 'function') window.renderFrontSlider(); } catch(e){ console.error(e); }
  });
})();

(function(){
  // safe MathJax typeset helper (queue until MathJax ready)
  window._assistant_mj_queue = window._assistant_mj_queue || [];
  function typesetSafe(node){
    return new Promise(function(resolve){
      if (window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise([node]).then(resolve).catch(resolve);
      } else {
        window._assistant_mj_queue.push({node:node, resolve:resolve});
        if (!window._assistant_mj_checker){
          window._assistant_mj_checker = setInterval(function(){
            if (window.MathJax && MathJax.typesetPromise){
              clearInterval(window._assistant_mj_checker); window._assistant_mj_checker = null;
              const q = window._assistant_mj_queue.slice(); window._assistant_mj_queue = [];
              q.reduce((p,it)=> p.then(()=> MathJax.typesetPromise([it.node]).then(()=> it.resolve()).catch(()=> it.resolve())), Promise.resolve());
            }
          }, 200);
        }
      }
    });
  }

  // robust update for LaTeX editor: sets line-number height, syncs scroll, updates preview safely
  function updateLatexLineNumbersAssistant(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    const preview = document.getElementById('latexPreview');
    if (!ta || !ln || !preview) return;
    // ensure line-number box matches textarea height and is scroll-synced
    ln.style.boxSizing = 'border-box';
    ln.style.height = ta.offsetHeight + 'px';
    // generate numbers
    const lines = (ta.value || '').split('\n').length;
    const count = Math.min(Math.max(lines,1),2000);
    let out = '';
    for (let i=1;i<=count;i++){ out += i + '\n'; }
    ln.textContent = out;
    // sync scroll position
    ln.scrollTop = ta.scrollTop;
    // preview: render as display math for cleaner output
    const code = ta.value || '';
    if (code.trim()){
      preview.innerHTML = '\\\\[' + code + '\\\\]';
      typesetSafe(preview).catch(()=>{});
    } else {
      preview.textContent = 'ستظهر المعاينة هنا';
    }
  }

  // attach on DOM ready; override existing handlers for safety
  document.addEventListener('DOMContentLoaded', function(){
    const ta = document.getElementById('latexCode');
    const ln = document.getElementById('latexLineNumbers');
    if (ta && ln){
      // wire events and initial sync
      ta.addEventListener('input', updateLatexLineNumbersAssistant);
      ta.addEventListener('scroll', function(){ ln.scrollTop = ta.scrollTop; });
      window.addEventListener('resize', function(){ ln.style.height = ta.offsetHeight + 'px'; });
      // immediate sync
      updateLatexLineNumbersAssistant();
    }

    // override global functions if present
    try { window.updateLatexLineNumbers = updateLatexLineNumbersAssistant; window.updateLatexPreview = updateLatexLineNumbersAssistant; } catch(e){}

    // Fix duplicate #studentQuizList elements if present: rename the first to studentQuizSummary
    const els = document.querySelectorAll('#studentQuizList');
    if (els && els.length > 1){
      els[0].id = 'studentQuizSummary';
      if (typeof window.loadStudentDashboard === 'function'){
        const orig = window.loadStudentDashboard;
        window.loadStudentDashboard = function(){
          try { orig(); } catch(e){ console.error(e); }
          // populate summary small list
          const container = document.getElementById('studentQuizSummary');
          if (!container) return;
          const list = (window.appData && window.appData.quizzes) ? window.appData.quizzes.slice(0,6) : [];
          if (!list.length) { container.innerHTML = '<p class=\"muted\">Aucun quiz disponible pour le moment.</p>'; return; }
          container.innerHTML = '<ul>' + list.map(q=>'<li>'+ (q.title ? q.title : 'Untitled') +' ('+ (q.questions? q.questions.length : 0) +' q)</li>').join('') + '</ul>';
        };
      }
    }

    // ensure admin slider tab link exists
    const menu = document.querySelector('.admin-menu');
    if (menu && !document.querySelector('.admin-tab-link[data-tab=\"tab-slider\"]')){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'admin-tab-link';
      a.setAttribute('data-tab','tab-slider');
      a.innerHTML = '<i class=\"fa-solid fa-images\"></i> Slider';
      a.addEventListener('click', function(e){ e.preventDefault(); try { switchAdminTab('tab-slider'); } catch(err){ console.error(err); } });
      li.appendChild(a);
      menu.appendChild(li);
    }

    // ensure slider admin events are wired (safe to call multiple times)
    try { if (typeof window.wireSliderAdminEvents === 'function') window.wireSliderAdminEvents(); } catch(e){ console.error(e); }

    // ensure front slider rendered initially
    try { if (typeof window.renderFrontSlider === 'function') window.renderFrontSlider(); } catch(e){ console.error(e); }
  });
})();

(function(){
  // Ensure appData exists
  window.appData = window.appData || { slides: [], latexContents: [], grades: [], quizzes: [], exams: [], revisionRequests: [], students: [], messages: [] };

  /* --------------------------
     Front slider rendering
     -------------------------- */
  function renderFrontSlider(){
    const container = document.getElementById('front-hero-slider');
    if (!container) return;
    container.innerHTML = '';
    const slides = (appData.slides || []);
    if (!slides.length){
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    slides.forEach((s, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'front-slide';
      wrap.style.display = 'inline-block';
      wrap.style.minWidth = '200px';
      wrap.style.maxWidth = '320px';
      wrap.style.marginRight = '8px';
      // image
      const img = document.createElement('img');
      img.src = s.url || '';
      img.alt = s.alt || ('slide ' + (i+1));
      img.style.maxWidth = '100%';
      img.style.maxHeight = '160px';
      img.onerror = ()=> { img.style.display='none'; };
      wrap.appendChild(img);
      // optional caption
      if (s.alt){
        const cap = document.createElement('div'); cap.textContent = s.alt; cap.style.fontSize='13px'; cap.style.marginTop='6px';
        wrap.appendChild(cap);
      }
      container.appendChild(wrap);
    });
  }

  // Make renderFrontSlider global if not already
  window.renderFrontSlider = renderFrontSlider;

  /* --------------------------
     Slider admin wiring (safe idempotent)
     -------------------------- */
  function wireSliderAdminEventsSafe(){
    // avoid double-binding by marking container
    if (wireSliderAdminEventsSafe._bound) return;
    wireSliderAdminEventsSafe._bound = true;

    const addBtn = document.getElementById('btnAddSliderImage');
    const urlInput = document.getElementById('sliderImageUrl');
    const fileInput = document.getElementById('sliderImageUpload');
    const clearBtn = document.getElementById('btnClearSlider');

    if (addBtn){
      addBtn.addEventListener('click', () => {
        const url = urlInput && urlInput.value && urlInput.value.trim();
        if (url) {
          appData.slides = appData.slides || [];
          appData.slides.push({ id: 's_' + Date.now(), url: url, alt: '' });
          saveData(); renderSliderAdminList(); renderFrontSlider(); if (urlInput) urlInput.value=''; alert('Slide ajouté');
          return;
        }
        if (fileInput && fileInput.files && fileInput.files[0]){
          const f = fileInput.files[0];
          const fr = new FileReader();
          fr.onload = function(ev){
            appData.slides = appData.slides || [];
            appData.slides.push({ id: 's_' + Date.now(), url: ev.target.result, alt: '' });
            saveData(); renderSliderAdminList(); renderFrontSlider(); fileInput.value=''; alert('Slide ajouté (upload)');
          };
          fr.readAsDataURL(f);
          return;
        }
        alert('فشل: ضع رابط الصورة أو اختر ملفاً');
      });
    }
    if (clearBtn){
      clearBtn.addEventListener('click', () => {
        if (!confirm('Vider tout le slider ?')) return;
        appData.slides = []; saveData(); renderSliderAdminList(); renderFrontSlider();
      });
    }
  }
  window.wireSliderAdminEvents = wireSliderAdminEventsSafe;

  /* --------------------------
     LaTeX lessons for students
     -------------------------- */
  function renderLatexListForStudents(){
    const c = document.getElementById('studentCoursList') || document.getElementById('studentCoursList') || document.getElementById('studentCoursList');
    // fallback id in the markup is 'studentCoursList' (from file)
    const container = document.getElementById('studentCoursList') || document.getElementById('studentCoursList') || document.getElementById('studentCoursList');
    // If not found, try studentCoursList or studentCours
    let target = document.getElementById('studentCoursList');
    if (!target) target = document.getElementById('studentCoursList');
    if (!target) return;
    target.innerHTML = '';
    if (!appData.latexContents || !appData.latexContents.length){
      target.innerHTML = '<p class="muted">لا توجد دروس متاحة حتى الآن.</p>';
      return;
    }
    appData.latexContents.forEach(item => {
      const card = document.createElement('div'); card.className='content-card';
      const inner = document.createElement('div'); inner.className='card-content';
      const title = document.createElement('h3'); title.textContent = item.title || 'Untitled';
      inner.appendChild(title);
      if (item.description) {
        const desc = document.createElement('p'); desc.textContent = item.description; inner.appendChild(desc);
      }
      const btnView = document.createElement('button'); btnView.className='btn'; btnView.textContent='عرض الدرس';
      const previewDiv = document.createElement('div'); previewDiv.className='latex-preview-area'; previewDiv.style.minHeight='80px'; previewDiv.style.marginTop='8px';
      btnView.addEventListener('click', () => {
        previewDiv.innerHTML = '\\[' + (item.code || '') + '\\]';
        if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([previewDiv]).catch(()=>{});
        // scroll into view
        previewDiv.scrollIntoView({ behavior:'smooth', block:'center' });
      });
      inner.appendChild(btnView);
      inner.appendChild(previewDiv);
      card.appendChild(inner);
      target.appendChild(card);
    });
  }
  window.renderLatexListForStudents = renderLatexListForStudents;

  /* --------------------------
     Revision request handling
     - populate select with student's exams/grades
     - submit requests and show them
     -------------------------- */
  function populateRevisionSelect(){
    const sel = document.getElementById('revisionExam');
    if (!sel) return;
    sel.innerHTML = '<option value="">Sélectionnez une évaluation</option>';
    const student = appData.currentUser;
    if (!student) return;
    // include grades and exams and exercises
    const items = [];
    (appData.grades || []).filter(g => g.studentId === student.id).forEach(g => items.push({ id: g.id, type: 'note', text: g.title + ' - ' + g.subject }));
    (appData.exams || []).forEach(e => items.push({ id: e.id, type: 'examen', text: e.title || ('Examen ' + (e.id||'')) }));
    (appData.exercises || []).forEach(ex => items.push({ id: ex.id, type: 'exercice', text: ex.title || ('Exercice ' + (ex.id||'')) }));
    if (!items.length) { sel.innerHTML = '<option value="">Aucune évaluation disponible</option>'; return; }
    items.forEach(it => {
      const o = document.createElement('option'); o.value = it.type + '::' + it.id; o.textContent = it.text; sel.appendChild(o);
    });
  }

  function renderStudentRevisionRequests(){
    const container = document.getElementById('studentRevisionRequests');
    if (!container) return;
    const student = appData.currentUser;
    if (!student) { container.innerHTML = '<p class="muted">Connectez-vous</p>'; return; }
    const list = (appData.revisionRequests || []).filter(r => r.studentId === student.id);
    if (!list.length) { container.innerHTML = '<p class="muted">Vous n\'avez pas encore soumis de demandes de récorrection.</p>'; return; }
    container.innerHTML = '<ul>' + list.map(r => '<li><strong>' + escapeHtml(r.evaluationText || r.evaluation) + '</strong> - ' + new Date(r.createdAt).toLocaleString() + '<br/>' + escapeHtml(r.message) + (r.status ? ' (' + r.status + ')' : '') + '</li>').join('') + '</ul>';
  }

  function handleRevisionFormSubmit(e){
    e.preventDefault();
    const sel = document.getElementById('revisionExam');
    const msg = document.getElementById('revisionMessage');
    if (!sel || !msg) return alert('خطأ في النموذج');
    const val = sel.value;
    if (!val) return alert('حدد الامتحان');
    const [type, id] = val.split('::');
    const student = appData.currentUser;
    if (!student) return alert('Connectez-vous d\'abord');
    const evalText = sel.options[sel.selectedIndex].text;
    const req = { id: 'rv_' + Date.now(), studentId: student.id, evaluationId: id, evaluationType: type, evaluationText: evalText, message: msg.value.trim(), status: 'Pending', createdAt: Date.now() };
    appData.revisionRequests = appData.revisionRequests || [];
    appData.revisionRequests.push(req);
    saveData();
    renderStudentRevisionRequests();
    renderRevisionRequestsList();
    alert('Demande envoyée');
    msg.value = '';
    sel.value = '';
  }

  function renderRevisionRequestsList(){
    const c = document.getElementById('revisionRequestsList');
    if (!c) return;
    c.innerHTML = '';
    const list = appData.revisionRequests || [];
    if (!list.length) return c.innerHTML = '<p class="muted">Aucune demande pour le moment.</p>';
    list.forEach(r => {
      const s = appData.students.find(st => st.id === r.studentId);
      const div = document.createElement('div'); div.className='content-row';
      div.innerHTML = '<strong>' + (s ? escapeHtml(s.fullname) : 'Étudiant') + '</strong> — ' + escapeHtml(r.evaluationText || '') + ' — ' + (r.status || '') + '<div style="margin-top:6px;">' + escapeHtml(r.message) + '</div>';
      const btnResolve = document.createElement('button'); btnResolve.textContent='Marquer résolu'; btnResolve.className='btn';
      btnResolve.style.marginLeft='8px';
      btnResolve.addEventListener('click', ()=> { r.status = 'Resolved'; saveData(); renderRevisionRequestsList(); renderStudentRevisionRequests(); });
      const btnDel = document.createElement('button'); btnDel.textContent='Supprimer'; btnDel.className='btn btn-danger'; btnDel.style.marginLeft='6px';
      btnDel.addEventListener('click', ()=> { if (!confirm('Supprimer cette demande ?')) return; appData.revisionRequests = appData.revisionRequests.filter(x=>x.id!==r.id); saveData(); renderRevisionRequestsList(); renderStudentRevisionRequests(); });
      div.appendChild(btnResolve); div.appendChild(btnDel);
      c.appendChild(div);
    });
  }

  /* --------------------------
     Hook into existing lifecycle
     -------------------------- */
  document.addEventListener('DOMContentLoaded', function(){
    // wire admin slider events safely
    try { wireSliderAdminEventsSafe(); } catch(e){ console.error(e); }
    // initial render of front slider
    try { renderFrontSlider(); } catch(e){ console.error(e); }
    // populate revision select if student logged in
    try { populateRevisionSelect(); } catch(e){ console.error(e); }
    // bind revision form
    const revForm = document.getElementById('revisionRequestForm');
    if (revForm && !revForm._bound){
      revForm._bound = true;
      revForm.addEventListener('submit', handleRevisionFormSubmit);
    }
    // render revision lists
    try { renderRevisionRequestsList(); renderStudentRevisionRequests(); } catch(e){ console.error(e); }
    // render latex lessons list for students
    try { renderLatexListForStudents(); } catch(e){ console.error(e); }
  });

  // expose for manual calls
  window.renderFrontSlider = renderFrontSlider;
  window.renderLatexListForStudents = renderLatexListForStudents;
  window.populateRevisionSelect = populateRevisionSelect;
  window.renderRevisionRequestsList = renderRevisionRequestsList;
  window.renderStudentRevisionRequests = renderStudentRevisionRequests;

})();