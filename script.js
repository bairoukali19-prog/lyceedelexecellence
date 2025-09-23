  /**
 * full-app.js
 * النسخة الكاملة (شاملة) لجافا سكريبت لتصليح مشاكل الموقع:
 *  - عدم إمكانية الدخول إلى واجهة الأستاذ/التلميذ
 *  - القفز إلى أعلى الصفحة عند الضغط على أي زر/رابط داخل sections
 *  - مشاكل في المودالات، التبويبات، السلايدر، وبطاقات الميزات
 *
 * تعليمات الاستخدام:
 *  - الصق هذا الملف كـ script.js أو داخل وسم <script> قبل </body>.
 *  - لا يحتاج لمكتبات خارجية.
 *  - جميع العناصر التي تُستخدم هنا يمكن تعديلها في الـ HTML عبر id أو attributes التالية:
 *      data-section="section-id"   -> روابط/أزرار التنقل بين الأقسام
 *      data-section-id="..."       -> لتسمية عناصر الأقسام إذا لم يكن لديها id
 *      data-open-modal="modalId"   -> لفتح مودال
 *      data-close-modal="modalId"  -> لغلق مودال
 *      data-tab="key"              -> لتبويبات التلميذ/الإدارة
 *      data-prevent-submit         -> على الفورم لمنع submit الافتراضي
 *      href="#" أو href="javascript:void(0)" -> لن يسبب قفزة إلى الأعلى بعد الآن
 *
 * ملاحظة: الكود مرن ويتحمل غياب بعض العناصر في DOM دون كسر التطبيق.
 */

'use strict';

(function () {
  // -------------------------
  // CONFIG
  // -------------------------
  const C = {
    sliderInterval: 5000,
    debug: false,
    selectors: {
      navLinkAttr: 'data-section',
      sectionIdAttr: 'data-section-id',
      modalOpenAttr: 'data-open-modal',
      modalCloseAttr: 'data-close-modal',
      studentTab: '[data-student-tab]',
      studentTabContent: '.student-tab-content',
      adminTabLink: '.admin-tab-link',
      adminTabContent: '.admin-section',
      featureCard: '.feature-card',
      sliderRoot: '#front-hero-slider',
      loginBtn: '#loginBtn',
      studentLoginBtn: '#studentLoginBtn',
      logoutBtn: '#logoutBtn',
      studentLogoutBtn: '#studentLogoutBtn',
      submitLogin: '#submitLogin',
      submitStudentLogin: '#submitStudentLogin',
      preventFormAttr: 'data-prevent-submit'
    }
  };

  // -------------------------
  // STATE
  // -------------------------
  const state = {
    sections: {},       // map id -> element
    currentUser: null,  // { username, role: 'admin'|'student' }
    sliderTimer: null
  };

  // -------------------------
  // Utilities
  // -------------------------
  function log(...args) {
    if (C.debug) console.log('[APP]', ...args);
  }

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

  // -------------------------
  // Build sections map robustly
  // -------------------------
  function buildSections() {
    const map = {};
    // first, any element with data-section-id or id that likely represents a page section
    qsa(`[${C.selectors.sectionIdAttr}], section, [role="region"], [data-section]`).forEach(el => {
      const id = el.getAttribute(C.selectors.sectionIdAttr) || el.id || el.dataset.section;
      if (id) map[id] = el;
    });

    // also, any element that has an id (common fallback)
    qsa('[id]').forEach(el => {
      if (el.id && !map[el.id]) map[el.id] = el;
    });

    // common specific fallbacks for this project
    ['home', 'home-section', 'student-dashboard', 'admin-panel', 'grades', 'quiz', 'lessons', 'exams', 'exercises'].forEach(fid => {
      const el = document.getElementById(fid);
      if (el) map[fid] = el;
    });

    state.sections = map;
    log('Sections map built:', Object.keys(map));
    return map;
  }

  // -------------------------
  // Hide/Show sections without jumping
  // -------------------------
  function hideAllSections() {
    Object.values(state.sections).forEach(el => {
      if (!el) return;
      el.style.display = 'none';
      el.classList.remove('active');
    });
  }

  /**
   * Show a section by id (no automatic scroll to top).
   * If the section doesn't exist, fallback gracefully to home or first section found.
   */
  function showSection(id, opts = { scrollIntoView: false }) {
    if (!state.sections || Object.keys(state.sections).length === 0) buildSections();
    const el = state.sections[id] || document.getElementById(id);
    if (!el) {
      console.warn(`showSection: القسم "${id}" غير موجود.`);
      const fallback = state.sections['home'] || state.sections['home-section'] || Object.values(state.sections)[0];
      if (fallback) {
        hideAllSections();
        fallback.style.display = 'block';
        fallback.classList.add('active');
        log('showSection: displayed fallback', fallback.id || null);
      }
      return;
    }

    hideAllSections();
    el.style.display = 'block';
    el.classList.add('active');

    // اختياري: تمرير سلس إلى القسم إذا طلبنا ذلك (لا نفعل بشكل افتراضي)
    if (opts.scrollIntoView) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
    }
    log('showSection: displayed', id);
  }

  // -------------------------
  // Prevent anchor jumping globally (but allow intentional hash navigation to an existing id)
  // Strategy:
  //  - If href is exactly '#' or javascript:void or empty -> preventDefault and do nothing
  //  - If href starts with '#' and target id exists -> preventDefault and showSection(targetId)
  //  - Otherwise allow normal behavior
  // -------------------------
  function initAnchorProtection() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a');
      if (!a) return;
      const href = (a.getAttribute('href') || '').trim();
      // cases to block
      if (!href || href === '#' || href.toLowerCase().startsWith('javascript:void')) {
        e.preventDefault();
        // try to resolve data-section attribute if present
        const ds = a.getAttribute(C.selectors.navLinkAttr) || a.dataset.section;
        if (ds) showSection(ds);
        return;
      }
      // hash navigation to an element within the page
      if (href.startsWith('#')) {
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          // show as section if present in our map, else optionally scroll into view
          if (state.sections && state.sections[id]) showSection(id);
          else {
            // if it's not a full "section", do a smooth scroll to it (not a jump)
            try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) { /* ignore */ }
          }
        } else {
          // href="#nonexistent" -> prevent jump to top
          e.preventDefault();
        }
      }
    }, { passive: false });
  }

  // -------------------------
  // Delegated navigation via data-section attributes (for buttons/links)
  // - Prevent default to avoid form submit or anchor jumps
  // - Handles authorization checks for admin/student (opens login modal if needed)
  // -------------------------
  function initSectionNavigation() {
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest(`[${C.selectors.navLinkAttr}]`);
      if (!trigger) return;
      e.preventDefault();

      const section = trigger.getAttribute(C.selectors.navLinkAttr) || trigger.dataset.section;
      if (!section) return;

      // security checks: if section requires role, expect data-require-role attribute (admin|student)
      const requiredRole = trigger.dataset.requireRole;
      if (requiredRole) {
        if (!state.currentUser || state.currentUser.role !== requiredRole) {
          // open appropriate login modal
          if (requiredRole === 'admin') openModalById('loginModal');
          else if (requiredRole === 'student') openModalById('studentLoginModal');
          return;
        }
      }

      // show section without jumping
      showSection(section);
    }, { passive: false });
  }

  // -------------------------
  // Modal helpers (open/close, trap focus, close on ESC and outside click)
  // Elements expected: <div id="someModal" class="modal"><div class="modal-content">...</div></div>
  // -------------------------
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open'); // css: .modal-open { overflow: hidden; }
    // focus management
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

  function initModalSystem() {
    // openers: data-open-modal="id"
    document.addEventListener('click', function (e) {
      const opener = e.target.closest(`[${C.selectors.modalOpenAttr}]`);
      if (!opener) return;
      e.preventDefault();
      const id = opener.getAttribute(C.selectors.modalOpenAttr) || opener.dataset.openModal;
      openModalById(id);
    });

    // closers: data-close-modal="id" OR elements inside modal with data-close-modal
    document.addEventListener('click', function (e) {
      const closer = e.target.closest(`[${C.selectors.modalCloseAttr}]`);
      if (!closer) return;
      e.preventDefault();
      const id = closer.getAttribute(C.selectors.modalCloseAttr) || closer.dataset.closeModal;
      if (id) closeModal(document.getElementById(id));
      else {
        const modal = closer.closest('.modal');
        if (modal) closeModal(modal);
      }
    });

    // click outside modal content closes it (delegation)
    document.addEventListener('click', function (e) {
      const modal = e.target.closest('.modal.active');
      if (!modal) return;
      const content = modal.querySelector('.modal-content') || modal.querySelector('.modal-body') || modal;
      if (!content.contains(e.target)) {
        closeModal(modal);
      }
    });

    // ESC closes active modals
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        qsa('.modal.active').forEach(m => closeModal(m));
      }
    });
  }

  // -------------------------
  // Slider initialization (if exists)
  // - uses .slide or .hero-slide elements inside root
  // - pauses on mouseenter and when document hidden (tab switch)
  // -------------------------
  function initSlider() {
    const root = qs(C.selectors.sliderRoot);
    if (!root) return;
    const slides = qsa('.slide, .hero-slide, img', root).filter(Boolean);
    if (!slides.length) return;

    slides.forEach((s, i) => {
      s.style.display = i === 0 ? 'block' : 'none';
      s.classList.toggle('active', i === 0);
    });

    let idx = 0;
    function next() {
      slides[idx].style.display = 'none';
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].style.display = 'block';
      slides[idx].classList.add('active');
    }

    clearInterval(state.sliderTimer);
    state.sliderTimer = setInterval(next, C.sliderInterval);

    root.addEventListener('mouseenter', () => clearInterval(state.sliderTimer));
    root.addEventListener('mouseleave', () => {
      clearInterval(state.sliderTimer);
      state.sliderTimer = setInterval(next, C.sliderInterval);
    });

    // Pause slider when document not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(state.sliderTimer);
      else {
        clearInterval(state.sliderTimer);
        state.sliderTimer = setInterval(next, C.sliderInterval);
      }
    });
  }

  // -------------------------
  // Tabs system for student/admin
  // - expects elements with data-student-tab / data-tab attributes and matching content ids
  // -------------------------
  function initTabs() {
    // student tabs
    qsa(C.selectors.studentTab).forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        const key = this.dataset.studentTab;
        if (!key) return;
        // deactivate all
        qsa(C.selectors.studentTab).forEach(t => t.classList.remove('active'));
        qsa(C.selectors.studentTabContent).forEach(c => {
          c.classList.remove('active');
          c.style.display = 'none';
        });
        this.classList.add('active');
        const target = document.getElementById(`student-${key}-tab`) || document.querySelector(`[data-student-content="${key}"]`);
        if (target) {
          target.classList.add('active');
          target.style.display = 'block';
        }
      });
    });

    // admin tabs
    qsa(C.selectors.adminTabLink).forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const key = this.dataset.tab;
        if (!key) return;
        qsa(C.selectors.adminTabLink).forEach(l => l.classList.remove('active'));
        qsa(C.selectors.adminTabContent).forEach(s => {
          s.classList.remove('active');
          s.style.display = 'none';
        });
        this.classList.add('active');
        const target = document.getElementById(key);
        if (target) {
          target.classList.add('active');
          target.style.display = 'block';
        }
      });
    });
  }

  // -------------------------
  // Feature cards (clickable)
  // -------------------------
  function initFeatureCards() {
    qsa(C.selectors.featureCard).forEach(card => {
      card.setAttribute('role', 'button');
      card.addEventListener('click', function (e) {
        // avoid accidental form submits
        e.preventDefault();
        const section = this.dataset.section;
        if (section) showSection(section);
      });
    });
  }

  // -------------------------
  // Prevent accidental form submits and button-induced page jumps
  // - if a <form> has data-prevent-submit attribute, prevent its submit
  // - any <button type="submit"> inside such forms will not submit
  // - intercept global submit to stop reloads where intended
  // -------------------------
  function initFormPrevention() {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || !(form instanceof HTMLFormElement)) return;
      if (form.hasAttribute(C.selectors.preventFormAttr)) {
        e.preventDefault();
      }
    });

    // also prevent <button href="#"> like behaviors: if a button is clicked and has dataset.noJump
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      // if button explicitly has type="button" nothing to do; if it's submit and inside prevent-form -> prevent default
      const form = btn.form;
      if (form && form.hasAttribute(C.selectors.preventFormAttr)) {
        if (btn.type === 'submit' || !btn.type) {
          e.preventDefault();
        }
      }
    }, { passive: false });
  }

  // -------------------------
  // Authentication simulation & handlers
  // - Simple simulation: admin/admin => admin; student login accepts any credentials (for now)
  // - After login, show corresponding panel
  // -------------------------
  function simulateAuth(username, password, isStudent = false) {
    if (isStudent) {
      if (!username) username = 'student';
      state.currentUser = { username, role: 'student' };
      // close student login modal if present
      closeModal(document.getElementById('studentLoginModal'));
      showSection('student-dashboard');
      return true;
    } else {
      if (username === 'admin' && password === 'admin') {
        state.currentUser = { username: 'admin', role: 'admin' };
        closeModal(document.getElementById('loginModal'));
        showSection('admin-panel');
        return true;
      } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة (جرب admin/admin للمسؤول).');
        return false;
      }
    }
  }

  function initAuthHandlers() {
    const loginBtn = qs(C.selectors.loginBtn);
    const studentLoginBtn = qs(C.selectors.studentLoginBtn);
    const logoutBtn = qs(C.selectors.logoutBtn);
    const studentLogoutBtn = qs(C.selectors.studentLogoutBtn);

    loginBtn?.addEventListener('click', function (e) { e.preventDefault(); openModalById('loginModal'); });
    studentLoginBtn?.addEventListener('click', function (e) { e.preventDefault(); openModalById('studentLoginModal'); });

    logoutBtn?.addEventListener('click', function (e) { e.preventDefault(); state.currentUser = null; showSection('home'); });
    studentLogoutBtn?.addEventListener('click', function (e) { e.preventDefault(); state.currentUser = null; showSection('home'); });

    const submitLogin = qs(C.selectors.submitLogin);
    const submitStudentLogin = qs(C.selectors.submitStudentLogin);

    submitLogin?.addEventListener('click', function (e) {
      e.preventDefault();
      const username = qs('#username')?.value || '';
      const password = qs('#password')?.value || '';
      simulateAuth(username.trim(), password.trim(), false);
    });

    submitStudentLogin?.addEventListener('click', function (e) {
      e.preventDefault();
      const username = qs('#studentUsername')?.value || '';
      const password = qs('#studentPassword')?.value || '';
      simulateAuth(username.trim(), password.trim(), true);
    });
  }

  // -------------------------
  // Accessibility small improvements
  // -------------------------
  function enhanceAccessibility() {
    // ensure interactive elements are keyboard reachable
    qsa('a, button, input, select, textarea').forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });
  }

  // -------------------------
  // Initialize everything
  // -------------------------
  function init() {
    try {
      buildSections();
      initAnchorProtection();
      initSectionNavigation();
      initModalSystem();
      initSlider();
      initTabs();
      initFeatureCards();
      initFormPrevention();
      initAuthHandlers();
      enhanceAccessibility();

      // show default section (prefer 'home' if exists)
      const defaults = ['home', 'home-section', 'student-dashboard', 'main'];
      let shown = false;
      for (const d of defaults) {
        if (state.sections[d]) { showSection(d); shown = true; break; }
      }
      if (!shown) {
        const first = Object.keys(state.sections)[0];
        if (first) showSection(first);
      }

      log('Initialization complete.');
    } catch (err) {
      console.error('Init error:', err);
    }
  }

  // -------------------------
  // Run on DOM ready
  // -------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
