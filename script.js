 /**
 * app-full.js
 * نسخة كاملة ومتكاملة من جافا سكريبت (بديلة/مكملة) لموقع Lycée de l’Excellence
 * تحل المشاكل التالية التي ذكرتها:
 *  - عدم القدرة على الدخول إلى واجهة الأستاذ / التلميذ
 *  - عند الضغط على أي زر/رابط ينتقل الموقع تلقائياً إلى الأعلى (القفز إلى top)
 *  - مشاكل في المودالات، التبويبات، والسلايدر
 *
 * الصق هذا الملف كـ script.js أو داخل وسم <script> قبل </body>.
 *
 * ملاحظات مهمة:
 *  - هذا الكود لا يعتمد على أي مكتبة خارجية.
 *  - يعالج الروابط التي تحتوي href="#"، ويمنع سلوكها الافتراضي.
 *  - يدعم التهيئة حتى لو كانت بعض العناصر غير موجودة في DOM (مرونة).
 *  - يحتوي تعليقات بالعربية داخل الكود لشرح كل قسم.
 */

'use strict';

(function () {
  // ============================
  // إعدادات عامة / تكوين
  // ============================
  const CONFIG = {
    sliderIntervalMs: 5000,
    debug: false, // ضع true لعرض سجلات إضافية في console
    selectors: {
      sectionAttr: 'data-section',            // attribute used on nav links / buttons
      navLink: '.nav-link',                  // class for navigation links
      featureCard: '.feature-card',          // class for clickable feature cards
      modal: '.modal',                       // generic modal class
      modalOpenAttr: 'data-open-modal',      // attribute to open modal
      modalCloseAttr: 'data-close-modal',    // attribute to close modal
      studentTab: '.student-tab',            // student tab links
      studentTabContent: '.student-tab-content', // student tab content
      adminTabLink: '.admin-tab-link',
      adminSection: '.admin-section',
      sliderRoot: '#front-hero-slider',
      loginBtn: '#loginBtn',
      studentLoginBtn: '#studentLoginBtn',
      logoutBtn: '#logoutBtn',
      studentLogoutBtn: '#studentLogoutBtn',
      submitLogin: '#submitLogin',
      submitStudentLogin: '#submitStudentLogin',
      formPreventSubmit: 'data-prevent-submit'
    }
  };

  // ============================
  // حالة التطبيق (بسيطة)
  // ============================
  const state = {
    currentUser: null, // { username, role: 'admin'|'student' }
    currentSection: null,
    sliderTimer: null
  };

  // ============================
  // مساعدة: سجل حالة التصحيح
  // ============================
  function log(...args) {
    if (CONFIG.debug) console.log('[APP]', ...args);
  }

  // ============================
  // أمان: منع "القفز" إلى أعلى الصفحة عند استخدام href="#"
  // - نستخدم delegation لمنع السلوك الافتراضي فقط للحالات الضارة
  // ============================
  function preventAnchorJumping() {
    document.addEventListener('click', function (e) {
      // إذا كان الهدف أو أحد الآباء هو رابط <a>
      const a = e.target.closest('a');
      if (!a) return;

      const href = a.getAttribute('href');
      // إذا الرابط مجرد '#' أو 'javascript:void(0)' أو فارغ، نمنع السلوك الافتراضي
      if (!href || href.trim() === '#' || href.trim().toLowerCase().startsWith('javascript:void')) {
        e.preventDefault();
        // بعض الروابط قد تستخدم data-section لتحديد القسم؛ نتعامل معها في handler آخر
        const section = a.getAttribute(CONFIG.selectors.sectionAttr) || a.dataset.section;
        if (section) {
          // ننتقل للعرض الداخلي دون أي تمرير تلقائي
          showSection(section);
        }
      }
    }, { passive: false });
  }

  // ============================
  // دالة مساعدة: الحصول على جميع الأقسام الموجودة في DOM
  // - نقوم ببناء خريطة لأقسام الصفحة بناء على attribute id أو data-section-target
  // ============================
  function buildSectionsMap() {
    const sections = {};
    // افترض أن كل قسم يحمل class "section" أو attribute id
    // أفضل نهج: العناصر التي تحمل data-section-id أو id
    document.querySelectorAll('[data-section-id], [id]').forEach(el => {
      const id = el.getAttribute('data-section-id') || el.id;
      if (!id) return;
      sections[id] = el;
    });

    // إذا لم نجد شيء، نحاول قراءة عناصر محددة بالاسم الشائع
    // قوائم احتياطية شائعة في هذا المشروع:
    const fallbackIds = [
      'home', 'home-section', 'student-dashboard', 'admin-panel',
      'grades', 'quiz', 'lessons', 'exams', 'exercises', 'lessons-section'
    ];
    fallbackIds.forEach(fid => {
      const el = document.getElementById(fid);
      if (el && !sections[fid]) sections[fid] = el;
    });

    return sections;
  }

  // ============================
  // إظهار وإخفاء الأقسام
  // - لا نستخدم window.scrollTo أو تغيير الهاش إلا إذا طلب صراحة
  // ============================
  function hideAllSections(sectionsMap) {
    Object.values(sectionsMap).forEach(el => {
      if (!el) return;
      el.style.display = 'none';
      el.classList.remove('active');
    });
  }

  function showSection(sectionName, options = { scrollIntoView: false, smooth: true }) {
    const sections = window.__APP_SECTIONS_MAP || buildSectionsMap();
    window.__APP_SECTIONS_MAP = sections;

    const target = sections[sectionName] || document.getElementById(sectionName);
    if (!target) {
      console.warn(`showSection: القسم "${sectionName}" غير موجود في DOM.`);
      // إذا لم نجده، نعرض الـ home إن وجد
      const fallback = sections['home'] || document.getElementById('home') || Object.values(sections)[0];
      if (fallback) {
        hideAllSections(sections);
        fallback.style.display = 'block';
        fallback.classList.add('active');
        state.currentSection = fallback.id || 'home-fallback';
      }
      return;
    }

    hideAllSections(sections);
    target.style.display = 'block';
    target.classList.add('active');
    state.currentSection = sectionName;
    log('showSection ->', sectionName);

    if (options.scrollIntoView) {
      try {
        target.scrollIntoView({ behavior: options.smooth ? 'smooth' : 'auto', block: 'start' });
      } catch (err) {
        // تجاهل الأخطاء
      }
    }
  }

  // ============================
  // تهيئة الروابط / الأزرار التي توجه بين الأقسام
  // - يبحث عن العناصر التي تملك data-section أو data-section-target
  // - يمنع السلوك الافتراضي عند الحاجة
  // ============================
  function initSectionNavigation() {
    // نستخدم delegation على document
    document.addEventListener('click', function (e) {
      const btn = e.target.closest(`[${CONFIG.selectors.sectionAttr}]`);
      if (!btn) return;

      e.preventDefault(); // مهم جداً لإيقاف href="#" من القفز
      const section = btn.getAttribute(CONFIG.selectors.sectionAttr) || btn.dataset.section;
      if (!section) return;

      // إمكانية انتظار بيانات أو تحقق دور المستخدم هنا
      if (section === 'student-dashboard' && (!state.currentUser || state.currentUser.role !== 'student')) {
        // إذا لم يسجل التلميذ دخوله، نطلب منه تسجيل الدخول أو نعرض مودال
        openModalById('studentLoginModal') || openModalById('loginModal');
        return;
      }
      if (section === 'admin-panel' && (!state.currentUser || state.currentUser.role !== 'admin')) {
        openModalById('loginModal');
        return;
      }

      showSection(section);
    }, { passive: false });
  }

  // ============================
  // إدارة المودالات (Modals)
  // - فتح/إغلاق بواسطة attributes data-open-modal / data-close-modal أو بواسطة id مباشرة
  // - إغلاق بالنقر خارج المحتوى و بال ESC
  // ============================
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    // وضع التركيز على أول عنصر focusable داخل المودال
    const focusable = modalEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function openModalById(id) {
    if (!id) return null;
    const modal = document.getElementById(id);
    if (modal) {
      openModal(modal);
      return modal;
    }
    return null;
  }

  function initModalHandlers() {
    // فتح المودال بواسطة عناصر تحمل data-open-modal="idOfModal"
    document.addEventListener('click', function (e) {
      const opener = e.target.closest(`[${CONFIG.selectors.modalOpenAttr}]`);
      if (!opener) return;
      e.preventDefault();
      const id = opener.getAttribute(CONFIG.selectors.modalOpenAttr) || opener.dataset.openModal;
      openModalById(id);
    });

    // إغلاق بواسطة عناصر تحمل data-close-modal
    document.addEventListener('click', function (e) {
      const closer = e.target.closest(`[${CONFIG.selectors.modalCloseAttr}]`);
      if (!closer) return;
      e.preventDefault();
      const id = closer.getAttribute(CONFIG.selectors.modalCloseAttr) || closer.dataset.closeModal;
      if (id) {
        closeModal(document.getElementById(id));
      } else {
        // إذا لم يعطِ id، نغلق المودال الأب الأقرب
        const modal = closer.closest(CONFIG.selectors.modal);
        closeModal(modal);
      }
    });

    // إغلاق بالنقر خارج محتوى المودال
    document.addEventListener('click', function (e) {
      const modal = e.target.closest(CONFIG.selectors.modal);
      if (!modal) return;
      const content = modal.querySelector('.modal-content') || modal.querySelector('.modal-body') || modal;
      if (!content) return;
      if (!content.contains(e.target)) {
        closeModal(modal);
      }
    });

    // إغلاق بالـ ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll(`${CONFIG.selectors.modal}.active`).forEach(m => closeModal(m));
      }
    });
  }

  // ============================
  // تهيئة السلايدر الأمامي إن وجد
  // ============================
  function initSlider() {
    const root = document.querySelector(CONFIG.selectors.sliderRoot);
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('.slide, img, .hero-slide'));
    if (!slides.length) return;

    // إعداد البداية
    slides.forEach((s, i) => {
      s.style.display = i === 0 ? 'block' : 'none';
      s.classList.toggle('active', i === 0);
    });

    let current = 0;
    const next = () => {
      slides[current].style.display = 'none';
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].style.display = 'block';
      slides[current].classList.add('active');
    };

    clearInterval(state.sliderTimer);
    state.sliderTimer = setInterval(next, CONFIG.sliderIntervalMs);

    // إيقاف عند وضع الماوس (تحسين تجربة)
    root.addEventListener('mouseenter', () => clearInterval(state.sliderTimer));
    root.addEventListener('mouseleave', () => {
      clearInterval(state.sliderTimer);
      state.sliderTimer = setInterval(next, CONFIG.sliderIntervalMs);
    });
  }

  // ============================
  // تهيئة تبويبات التلميذ والتبويبات الإدارية
  // ============================
  function initTabs() {
    // تبويبات التلميذ
    const studentTabs = Array.from(document.querySelectorAll(CONFIG.selectors.studentTab));
    const studentContents = Array.from(document.querySelectorAll(CONFIG.selectors.studentTabContent));
    studentTabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        const key = this.dataset.tab;
        if (!key) return;
        // تعطيل جميع التبويبات
        studentTabs.forEach(t => t.classList.remove('active'));
        studentContents.forEach(c => {
          c.classList.remove('active');
          c.style.display = 'none';
        });
        this.classList.add('active');
        const target = document.getElementById(`student-${key}-tab`) || document.querySelector(`[data-student-tab="${key}"]`);
        if (target) {
          target.classList.add('active');
          target.style.display = 'block';
        }
      });
    });

    // تبويبات الإدارة
    const adminLinks = Array.from(document.querySelectorAll(CONFIG.selectors.adminTabLink));
    const adminSections = Array.from(document.querySelectorAll(CONFIG.selectors.adminSection));
    adminLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const key = this.dataset.tab;
        if (!key) return;
        adminLinks.forEach(l => l.classList.remove('active'));
        adminSections.forEach(s => {
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

  // ============================
  // تهيئة بطاقات المميزات (feature cards)
  // ============================
  function initFeatureCards() {
    document.querySelectorAll(CONFIG.selectors.featureCard).forEach(card => {
      card.setAttribute('role', 'button');
      card.addEventListener('click', function (e) {
        // أزرار البطاقات لا تسبب submit عادة لكن نمنع السلوك الافتراضي فقط للتحكم
        e.preventDefault();
        const section = this.getAttribute('data-section') || this.dataset.section;
        if (section) showSection(section);
      });
    });
  }

  // ============================
  // نماذج: منع إعادة تحميل الصفحة عند الضغط على زر داخل form إذا عليه attribute data-prevent-submit
  // - يساعد لو كان لديك <form> ويحتوي على أزرار تنفيذ لا يجب أن ترسل النموذج
  // ============================
  function preventFormSubmits() {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (form && form.hasAttribute(CONFIG.selectors.formPreventSubmit)) {
        e.preventDefault();
      }
    });
  }

  // ============================
  // محاكاة تسجيل الدخول (يمكنك ربط API لاحقاً)
  // - تذكر: إزالة المحاكاة عند الربط الحقيقي
  // ============================
  function simulateLogin(username, password, isStudent) {
    // قاعدة بسيطة: admin/admin => مشرف، أي شيء آخر => تلميذ (إذا isStudent) أو رفض
    if (isStudent) {
      // قبول أي اسم/كلمة (محاكاة)
      state.currentUser = { username: username || 'student', role: 'student' };
      showSection('student-dashboard');
      closeModal(document.getElementById('studentLoginModal'));
      return true;
    } else {
      if (username === 'admin' && password === 'admin') {
        state.currentUser = { username: 'admin', role: 'admin' };
        showSection('admin-panel');
        closeModal(document.getElementById('loginModal'));
        return true;
      } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة.');
        return false;
      }
    }
  }

  // ============================
  // تهيئة أزرار/MODAL login / logout
  // ============================
  function initAuthHandlers() {
    // أزرار فتح المودال (إذا لم تستخدم data-open-modal)
    const loginBtn = document.querySelector(CONFIG.selectors.loginBtn);
    const studentLoginBtn = document.querySelector(CONFIG.selectors.studentLoginBtn);
    const logoutBtn = document.querySelector(CONFIG.selectors.logoutBtn);
    const studentLogoutBtn = document.querySelector(CONFIG.selectors.studentLogoutBtn);

    loginBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      openModalById('loginModal');
    });

    studentLoginBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      openModalById('studentLoginModal');
    });

    logoutBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      state.currentUser = null;
      showSection('home');
    });

    studentLogoutBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      state.currentUser = null;
      showSection('home');
    });

    // أزرار إرسال النماذج (محاكاة)
    const submitLogin = document.querySelector(CONFIG.selectors.submitLogin);
    const submitStudentLogin = document.querySelector(CONFIG.selectors.submitStudentLogin);

    submitLogin?.addEventListener('click', function (e) {
      e.preventDefault();
      const username = document.getElementById('username')?.value || '';
      const password = document.getElementById('password')?.value || '';
      simulateLogin(username.trim(), password.trim(), false);
    });

    submitStudentLogin?.addEventListener('click', function (e) {
      e.preventDefault();
      const username = document.getElementById('studentUsername')?.value || '';
      const password = document.getElementById('studentPassword')?.value || '';
      simulateLogin(username.trim(), password.trim(), true);
    });
  }

  // ============================
  // تهيئة التحسينات العامة عند التحميل
  // ============================
  function initAccessibilityImprovements() {
    // أحسن التاب ترتيب للعناصر المهمة إن لم يكن موجود
    document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
  }

  // ============================
  // تهيئة كل شيء
  // ============================
  function initApp() {
    try {
      log('Initializing app...');

      window.__APP_SECTIONS_MAP = buildSectionsMap();

      preventAnchorJumping(); // منع href="#" من القفز
      initSectionNavigation(); // التعامل مع data-section
      initModalHandlers(); // مودالات
      initSlider(); // سلايدر
      initTabs(); // تبويبات
      initFeatureCards(); // بطاقات
      preventFormSubmits(); // منع submit للـ forms المختارة
      initAuthHandlers(); // login/logout simulation
      initAccessibilityImprovements(); // تحسينات وصول

      // افتراضي: عرض القسم الرئيسي إن وجد
      const defaultCandidates = ['home', 'home-section', 'student-dashboard', 'main'];
      let shown = false;
      for (const cand of defaultCandidates) {
        if (document.getElementById(cand)) {
          showSection(cand);
          shown = true;
          break;
        }
      }
      if (!shown) {
        // عرض أول قسم في الخريطة
        const first = Object.keys(window.__APP_SECTIONS_MAP)[0];
        if (first) showSection(first);
      }

      log('App initialized.');
    } catch (err) {
      console.error('خطأ في initApp:', err);
    }
  }

  // تشغيل تهيئة التطبيق عند تحميل DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
