/**
 * app-espace-fixes.js
 * نسخة مُحدَّثة: تحافظ على "Espace de professeur" و "Espace des élèves"
 * وتضيف واجهة بسيطة لإدخال نقاط (notes).
 *
 * الصق هذا الملف كـ script.js أو داخل وسم <script> قبل </body>.
 *
 * تعليمات سريعة:
 * - يفضل أن تعطي عناصر الأقسام id واضح مثل:
 *     <section id="espace-professeur"> ... </section>
 *     <section id="espace-eleves"> ... </section>
 * - أزرار التنقل استخدم: data-section="espace-professeur" أو data-section="espace-eleves"
 * - إن لم تغير HTML، الكود الآن يحاول العثور على الأقسام بالبحث عن العناوين النصية.
 */

'use strict';

(function () {
  const CONFIG = {
    sliderIntervalMs: 5000,
    debug: false,
    selectors: {
      navLinkAttr: 'data-section',        // عناصر التنقل تحمل هذا attribute
      sectionIdAttr: 'data-section-id',   // (اختياري) الأقسام تحمل هذا attribute
      modalOpenAttr: 'data-open-modal',
      modalCloseAttr: 'data-close-modal',
      notesContainerIds: ['notes-list', 'notes', 'notes-container'], // محاولات التسمية
      espaceProfLabel: 'Espace de professeur',
      espaceElevesLabel: 'Espace des élèves',
      loginModalId: 'loginModal',
      studentLoginModalId: 'studentLoginModal',
      addNoteModalId: 'addNoteModal',
      addNoteBtnId: 'openAddNoteBtn',
    }
  };

  const state = {
    sections: {}, // map id -> element
    currentUser: null,
    sliderTimer: null
  };

  function log(...args) { if (CONFIG.debug) console.log('[APP]', ...args); }

  // -------------------------
  // Build sections map robustly and ensure espace-professeur / espace-eleves exist
  // -------------------------
  function buildSectionsMap() {
    const map = {};

    // 1) elements with data-section-id
    document.querySelectorAll(`[${CONFIG.selectors.sectionIdAttr}]`).forEach(el => {
      const id = el.getAttribute(CONFIG.selectors.sectionIdAttr);
      if (id) map[id] = el;
    });

    // 2) elements with id
    document.querySelectorAll('[id]').forEach(el => {
      const id = el.id;
      if (id) {
        // ignore typical UI elements that are not sections? we include all then hide as needed
        if (!map[id]) map[id] = el;
      }
    });

    // 3) fallback: try to find "Espace de professeur" / "Espace des élèves" by common ids
    const profIds = ['espace-professeur', 'espace_professeur', 'professeur-space', 'prof-space'];
    const eleveIds = ['espace-eleves', 'espace_eleves', 'eleves-space', 'student-space', 'eleve-space'];

    for (const id of profIds) {
      const found = document.getElementById(id);
      if (found) { map['espace-professeur'] = found; break; }
    }
    for (const id of eleveIds) {
      const found = document.getElementById(id);
      if (found) { map['espace-eleves'] = found; break; }
    }

    // 4) If still not found, search for elements that contain the label text in an H1/H2/H3 or with class .section-title
    if (!map['espace-professeur']) {
      const byText = findElementByHeadingText(CONFIG.selectors.espaceProfLabel);
      if (byText) map['espace-professeur'] = byText;
    }
    if (!map['espace-eleves']) {
      const byText = findElementByHeadingText(CONFIG.selectors.espaceElevesLabel);
      if (byText) map['espace-eleves'] = byText;
    }

    // 5) ensure there is at least some 'home' fallback
    if (!map['home']) {
      const h = document.getElementById('home') || document.querySelector('.home') || Object.values(map)[0];
      if (h) map['home'] = h;
    }

    state.sections = map;
    log('Sections built:', Object.keys(map));
    return map;
  }

  function findElementByHeadingText(text) {
    if (!text) return null;
    // search common heading tags first
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'));
    for (const h of headings) {
      if (h.textContent && h.textContent.trim().includes(text)) {
        // prefer the nearest section/ancestor
        const sec = h.closest('section, [role="region"], .section, .card, .container') || h.parentElement;
        return sec;
      }
    }
    // search for class .section-title
    const title = Array.from(document.querySelectorAll('.section-title, .title')).find(el => el.textContent?.trim().includes(text));
    if (title) return title.closest('section') || title.parentElement;
    return null;
  }

  // -------------------------
  // Hide/Show sections safely (no jumping)
  // -------------------------
  function hideAllSections() {
    Object.values(state.sections).forEach(el => {
      if (!el) return;
      // only hide if it's a sizeable element (to avoid hiding header/footer accidentally)
      try {
        el.style.display = 'none';
        el.classList.remove('active');
      } catch (e) { /* ignore */ }
    });
  }

  function showSection(id, opts = { scrollIntoView: false }) {
    if (!state.sections || Object.keys(state.sections).length === 0) buildSectionsMap();
    const el = state.sections[id] || document.getElementById(id);
    if (!el) {
      console.warn('showSection: القسم غير موجود:', id);
      // fallback
      const fallback = state.sections['home'] || Object.values(state.sections)[0];
      if (fallback) {
        hideAllSections();
        fallback.style.display = 'block';
        fallback.classList.add('active');
      }
      return;
    }
    hideAllSections();
    el.style.display = 'block';
    el.classList.add('active');
    if (opts.scrollIntoView) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    }
    log('Section shown:', id);
  }

  // -------------------------
  // Prevent default anchor '#' jumping and smart hash handling
  // -------------------------
  function initAnchorProtection() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a');
      if (!a) return;
      const href = (a.getAttribute('href') || '').trim();
      if (!href || href === '#' || href.toLowerCase().startsWith('javascript:void')) {
        e.preventDefault();
        const ds = a.getAttribute(CONFIG.selectors.navLinkAttr) || a.dataset.section;
        if (ds) showSection(ds);
        return;
      }
      if (href.startsWith('#')) {
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          // if it's a full section we show it, else smooth-scroll to fragment
          if (state.sections[id]) showSection(id);
          else {
            try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) {}
          }
        } else {
          e.preventDefault(); // prevent jump-to-top for broken hashes
        }
      }
    }, { passive: false });
  }

  // -------------------------
  // Navigation via data-section attribute
  // -------------------------
  function initSectionNavigation() {
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest(`[${CONFIG.selectors.navLinkAttr}]`);
      if (!trigger) return;
      e.preventDefault();
      const section = trigger.getAttribute(CONFIG.selectors.navLinkAttr) || trigger.dataset.section;
      if (!section) return;
      // if section is French label, map to our normalized ids
      const normalized = mapLabelToId(section);
      showSection(normalized || section);
    }, { passive: false });
  }

  function mapLabelToId(label) {
    if (!label) return null;
    const l = label.trim().toLowerCase();
    if (l === CONFIG.selectors.espaceProfLabel.toLowerCase() || l.includes('professeur') || l.includes('prof')) return 'espace-professeur';
    if (l === CONFIG.selectors.espaceElevesLabel.toLowerCase() || l.includes('élève') || l.includes('eleve') || l.includes('eleves') || l.includes('student')) return 'espace-eleves';
    return null;
  }

  // -------------------------
  // Modals
  // -------------------------
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const focusable = modalEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }
  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  function openModalById(id) {
    if (!id) return null;
    const m = document.getElementById(id);
    if (m) openModal(m);
    return m;
  }
  function initModals() {
    document.addEventListener('click', function (e) {
      const opener = e.target.closest(`[${CONFIG.selectors.modalOpenAttr}]`);
      if (opener) {
        e.preventDefault();
        const id = opener.getAttribute(CONFIG.selectors.modalOpenAttr) || opener.dataset.openModal;
        openModalById(id);
      }
      const closer = e.target.closest(`[${CONFIG.selectors.modalCloseAttr}]`);
      if (closer) {
        e.preventDefault();
        const id = closer.getAttribute(CONFIG.selectors.modalCloseAttr) || closer.dataset.closeModal;
        if (id) closeModal(document.getElementById(id));
        else {
          const modal = closer.closest('.modal');
          if (modal) closeModal(modal);
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') qsa('.modal.active').forEach(m => closeModal(m));
    });

    // click outside content closes
    document.addEventListener('click', function (e) {
      const modal = e.target.closest('.modal.active');
      if (!modal) return;
      const content = modal.querySelector('.modal-content') || modal.querySelector('.modal-body') || modal;
      if (!content.contains(e.target)) closeModal(modal);
    });
  }

  // -------------------------
  // Slider (if present)
  // -------------------------
  function initSlider() {
    const root = document.querySelector('#front-hero-slider');
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('.slide, .hero-slide, img')).filter(Boolean);
    if (!slides.length) return;
    slides.forEach((s, i) => { s.style.display = i === 0 ? 'block' : 'none'; s.classList.toggle('active', i === 0); });
    let idx = 0;
    function next() {
      slides[idx].style.display = 'none'; slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].style.display = 'block'; slides[idx].classList.add('active');
    }
    clearInterval(state.sliderTimer);
    state.sliderTimer = setInterval(next, CONFIG.sliderIntervalMs);
    root.addEventListener('mouseenter', () => clearInterval(state.sliderTimer));
    root.addEventListener('mouseleave', () => { clearInterval(state.sliderTimer); state.sliderTimer = setInterval(next, CONFIG.sliderIntervalMs); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(state.sliderTimer);
      else { clearInterval(state.sliderTimer); state.sliderTimer = setInterval(next, CONFIG.sliderIntervalMs); }
    });
  }

  // -------------------------
  // Notes (grades) system
  // - adds ability to add a grade and display it in a notes container
  // -------------------------
  function findOrCreateNotesContainer() {
    for (const id of CONFIG.selectors.notesContainerIds) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    // create a container at end of student dashboard or body
    const parent = state.sections['espace-eleves'] || state.sections['student-dashboard'] || document.body;
    const container = document.createElement('div');
    container.id = CONFIG.selectors.notesContainerIds[0];
    container.className = 'notes-auto-created';
    container.innerHTML = '<h3>Notes</h3><ul id="notes-list-ul"></ul>';
    parent.appendChild(container);
    return container;
  }

  function addGradeNote(studentName, value) {
    const container = findOrCreateNotesContainer();
    // find UL to append
    let ul = container.querySelector('#notes-list-ul') || container.querySelector('ul');
    if (!ul) {
      ul = document.createElement('ul');
      ul.id = 'notes-list-ul';
      container.appendChild(ul);
    }
    const li = document.createElement('li');
    const safeName = (studentName || 'Unnamed').toString();
    const safeValue = (typeof value === 'number' || !isNaN(Number(value))) ? Number(value) : value;
    li.textContent = `${safeName} — ${safeValue}`;
    ul.appendChild(li);
    // optional: flash highlight
    li.style.transition = 'background-color 0.4s';
    li.style.backgroundColor = '#ffffb3';
    setTimeout(() => { li.style.backgroundColor = ''; }, 600);
  }

  // If there is a modal/form for adding notes, wire it
  function initNotesUI() {
    // If there's a button with id openAddNoteBtn it will open modal addNoteModal
    const openBtn = document.getElementById(CONFIG.selectors.addNoteBtnId);
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openModalById(CONFIG.selectors.addNoteModalId);
      });
    }

    // If modal exists with inputs #noteStudent and #noteValue and button #saveNoteBtn
    const saveBtn = document.getElementById('saveNoteBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const student = (document.getElementById('noteStudent')?.value || '').trim();
        const value = document.getElementById('noteValue')?.value;
        if (!value) { alert('المرجو إدخال قيمة النقطة'); return; }
        addGradeNote(student || 'Étudiant', value);
        // close modal
        closeModal(document.getElementById(CONFIG.selectors.addNoteModalId));
      });
    }

    // Also allow quick test button if present
    const quickTest = document.getElementById('addNoteQuickTest');
    if (quickTest) {
      quickTest.addEventListener('click', function (e) {
        e.preventDefault();
        addGradeNote('Test Student', Math.floor(Math.random() * 21));
      });
    }
  }

  // -------------------------
  // small helpers (querySelectorAll convenience)
  // -------------------------
  function qsa(sel, ctx = document) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // -------------------------
  // Accessibility & small improvements
  // -------------------------
  function enhanceAccessibility() {
    qsa('a, button, input, textarea, select').forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });
  }

  // -------------------------
  // Initialize app (tie everything together)
  // -------------------------
  function initApp() {
    try {
      buildSectionsMap();
      initAnchorProtection();
      initSectionNavigation();
      initModals();
      initSlider();
      initNotesUI();
      enhanceAccessibility();

      // ensure espace-professeur and espace-eleves are visible in the sections map
      if (!state.sections['espace-professeur'] && document.getElementById('espace-professeur')) {
        state.sections['espace-professeur'] = document.getElementById('espace-professeur');
      }
      if (!state.sections['espace-eleves'] && document.getElementById('espace-eleves')) {
        state.sections['espace-eleves'] = document.getElementById('espace-eleves');
      }

      // Default: show home or espace-eleves if user is student etc. but we default to home
      const defaultId = state.sections['home'] ? 'home' : (state.sections['espace-eleves'] ? 'espace-eleves' : Object.keys(state.sections)[0]);
      if (defaultId) showSection(defaultId);

      log('App initialized with sections:', Object.keys(state.sections));
    } catch (err) {
      console.error('initApp error:', err);
    }
  }

  // run on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
  else initApp();

  // Export small API on window for debugging / manual calls
  window.MyApp = window.MyApp || {};
  window.MyApp.showSection = showSection;
  window.MyApp.addGradeNote = addGradeNote;
  window.MyApp.rebuildSections = buildSectionsMap;

})();
 
