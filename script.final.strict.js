/* script.final.strict.js
   Final strict defensive JS to stop "jump to top" and ensure
   Consultation des Notes / Code Parcours / Voir les notes work.
   - Aggressive prevention of accidental form submit & href "#" jumps
   - Capture-phase handlers + mousedown scroll snapshot + restore fallback
   - MutationObserver to normalize dynamic content
   - Explicit submit interception on forms with empty/action '#'
   - Wiring fallback for grade buttons to call searchGradesByCode(code)
   Drop this file into your project as script.js (replace existing), clear cache (Ctrl+F5).
*/
(function(window, document){
  'use strict';

  const DEBUG = false; // set true to see console logs for diagnostics

  function log(...args){ if(DEBUG) console.log('[final.strict]', ...args); }

  // Helper: set type="button" for plain buttons (not used to submit)
  function normalizeButtons(root=document){
    try{
      Array.from(root.querySelectorAll('button')).forEach(b=>{
        if(!b.hasAttribute('type')){
          // If button has a formnovalidate/data-submit attributes maybe intended; keep safety conservative:
          b.setAttribute('type','button');
          b.dataset._fix_type = "true";
        }
      });
    }catch(e){ log('normalizeButtons err', e); }
  }

  // Helper: neutralize anchors with empty/hash hrefs that don't map to existing id
  function neutralizeHashes(root=document){
    try{
      Array.from(root.querySelectorAll('a[href]')).forEach(a=>{
        try{
          const href = (a.getAttribute('href')||'').trim();
          if(href === '' || href === '#' || href === '#!' ){
            if(!a.__neutralizedHash){
              a.addEventListener('click', function(e){ e.preventDefault(); }, true);
              a.__neutralizedHash = true;
              log('neutralized anchor #', a);
            }
          } else if(href.startsWith('#')){
            const id = href.slice(1);
            if(!document.getElementById(id)){
              if(!a.__neutralizedMissingFragment){
                a.addEventListener('click', function(e){ e.preventDefault(); }, true);
                a.__neutralizedMissingFragment = true;
                log('neutralized missing fragment', href, a);
              }
            }
          }
        }catch(errInner){ /*ignore*/ }
      });
    }catch(e){ log('neutralizeHashes err', e); }
  }

  // Prevent form submission when action is empty or '#'
  function interceptForms(root=document){
    try{
      Array.from(root.querySelectorAll('form')).forEach(form=>{
        if(form.__submitIntercepted) return;
        form.addEventListener('submit', function(e){
          try{
            const action = (form.getAttribute('action')||'').trim();
            if(action === '' || action === '#' || action === '#!'){
              log('prevented form submit for empty/# action', form);
              e.preventDefault();
              e.stopImmediatePropagation();
              return false;
            }
            // otherwise allow submit
          }catch(err){ log('form submit handler err', err); }
        }, true); // capture so we can block early
        form.__submitIntercepted = true;
      });
    }catch(e){ log('interceptForms err', e); }
  }

  // Wiring fallback for grade buttons/links
  function attachGradeButtonsFallback(root=document){
    try{
      const labels = [
        'Consultation des Notes','Consultation des notes','Consultation Des Notes',
        'Code Parcours','Code parcours','Code-parcours','CodeParcours','Codeparcours',
        'Voir les notes','Voir les Notes','Voir les notes','Voir les Notes'
      ];
      Array.from(root.querySelectorAll('button, a')).forEach(el => {
        if(el.__gradeBound) return;
        const txt = (el.textContent || '').trim();
        if(!txt) return;
        const matches = labels.some(lbl => txt.indexOf(lbl) !== -1);
        if(!matches) return;
        el.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          // find nearby input for code
          let code = '';
          const frm = el.closest('form');
          let input = null;
          if(frm) input = frm.querySelector('input, textarea');
          if(!input) input = document.querySelector('#codeParcours, #gradeCode, #code, input[name="code"], input[name="gradeCode"]');
          if(!input){
            input = Array.from(document.querySelectorAll('input, textarea')).find(i => {
              const p = (i.placeholder||'').toLowerCase();
              const n = (i.name||'').toLowerCase();
              const id = (i.id||'').toLowerCase();
              return p.includes('code') || n.includes('code') || id.includes('code') || p.includes('parcours') || n.includes('parcours') || id.includes('parcours');
            }) || null;
          }
          if(input) code = (input.value || '').trim();
          if(!code){
            // prompt fallback
            try{ code = prompt('أدخل Code Parcours / Entrez le Code Parcours (مثال: P-2024-001):'); } catch(err){ code = null; }
            if(!code) return;
          }
          try{
            if(typeof window.searchGradesByCode === 'function'){
              window.searchGradesByCode(code.trim());
            } else {
              // best-effort: if there is a global 'showGrades' or similar try
              if(typeof window.showGrades === 'function') window.showGrades(code.trim());
              else alert('Function searchGradesByCode(Code) غير موجودة. الكود: ' + code.trim());
            }
          }catch(err){ console.error('grade fallback error', err); alert('خطأ أثناء عرض النقاط: '+(err.message||err)); }
        }, true);
        el.__gradeBound = true;
      });
    }catch(err){ log('attachGradeButtonsFallback err', err); }
  }

  // Deep click handler with mousedown snapshot and restore fallback
  function installDeepClickProtection(){
    try{
      let lastMouseDownScroll = {x:0,y:0, time:0, insideSection:false};

      document.addEventListener('mousedown', function(ev){
        try{
          const inSection = !!ev.target.closest('section');
          lastMouseDownScroll.insideSection = inSection;
          if(!inSection) return;
          const se = document.scrollingElement || document.documentElement || document.body;
          lastMouseDownScroll.x = (se.scrollLeft || 0);
          lastMouseDownScroll.y = (se.scrollTop || 0);
          lastMouseDownScroll.time = Date.now();
          log('mousedown snapshot', lastMouseDownScroll);
        }catch(e){ /*ignore*/ }
      }, true);

      document.addEventListener('click', function(ev){
        try{
          const inSection = !!ev.target.closest('section');
          if(!inSection) return;
          // If user clicked an anchor or button that we neutralized earlier, it has been prevented already.
          // But if despite prevention the viewport jumped to top (scrollTop==0) and previously was not 0 -> restore
          const se = document.scrollingElement || document.documentElement || document.body;
          const curY = se.scrollTop || 0;
          // schedule check in next frame because some scripts change scroll after event loop
          requestAnimationFrame(()=>{
            try{
              const newY = se.scrollTop || 0;
              // threshold: if previously > 50 and newY is 0 => unexpected jump
              if(lastMouseDownScroll.insideSection && lastMouseDownScroll.y > 50 && newY === 0){
                log('unexpected jump detected. restoring to', lastMouseDownScroll.y);
                // restore scroll smoothly if possible, otherwise immediate
                try{ window.scrollTo({ top: lastMouseDownScroll.y, left: lastMouseDownScroll.x, behavior: 'auto' }); }catch(ignore){ window.scrollTo(lastMouseDownScroll.x, lastMouseDownScroll.y); }
              }
            }catch(err){ /*ignore*/ }
          });
        }catch(e){ /*ignore*/ }
      }, true);

      // Also intercept clicks on anchors and buttons in capture phase to proactively prevent bad behavior
      document.addEventListener('click', function(ev){
        try{
          const el = ev.target.closest('a, button, input[type="submit"], input[type="image"]');
          if(!el) return;
          const inSection = !!ev.target.closest('section');
          if(!inSection) return; // only enforce within sections per user's description
          if(el.tagName === 'A'){
            const href = (el.getAttribute('href')||'').trim();
            if(href === '' || href === '#' || href === '#!' ){
              ev.preventDefault(); ev.stopImmediatePropagation(); log('blocked href #'); return;
            }
            if(href.startsWith('#')){
              const id = href.slice(1);
              if(!document.getElementById(id)){
                ev.preventDefault(); ev.stopImmediatePropagation(); log('blocked href to missing fragment', href); return;
              }
            }
            // allow other anchors to proceed
            return;
          }
          if(el.tagName === 'BUTTON' || (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'image'))){
            // if button has explicit type submit and belongs to form with valid action, allow; else block to avoid accidental submit causing page reload
            const typeAttr = (el.getAttribute && el.getAttribute('type')) ? (el.getAttribute('type')||'').toLowerCase() : '';
            const isSubmit = (typeAttr === 'submit' || (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'image')));
            if(!isSubmit){
              ev.preventDefault(); ev.stopImmediatePropagation(); log('blocked non-submit button click to avoid reload'); return;
            }
            // if is submit, verify form action
            const form = el.closest('form');
            if(form){
              const action = (form.getAttribute('action')||'').trim();
              if(action === '' || action === '#' || action === '#!'){
                ev.preventDefault(); ev.stopImmediatePropagation(); log('blocked submit to empty/#'); return;
              }
            }
          }
        }catch(err){ log('proactive click handler err', err); }
      }, true); // capture

    }catch(err){ log('installDeepClickProtection err', err); }
  }

  // MutationObserver to apply normalization to new nodes
  function installMutationNormalization(){
    try{
      const mo = new MutationObserver(function(mutations){
        try{
          mutations.forEach(m => {
            m.addedNodes && m.addedNodes.forEach(node => {
              if(!(node instanceof HTMLElement)) return;
              normalizeButtons(node);
              neutralizeHashes(node);
              interceptForms(node);
              attachGradeButtonsFallback(node);
            });
          });
        }catch(e){ log('mutation handler inner err', e); }
      });
      mo.observe(document.documentElement || document.body, { childList:true, subtree:true });
    }catch(err){ log('installMutationNormalization err', err); }
  }

  // Run all initializers
  function initAll(){
    try{
      normalizeButtons();
      neutralizeHashes();
      interceptForms();
      attachGradeButtonsFallback();
      installDeepClickProtection();
      installMutationNormalization();
      // extra: protect against scripts programmatically setting scrollTop to 0 right after click by listening to hashchange and beforeunload
      window.addEventListener('hashchange', function(e){
        try{ log('hashchange', location.hash); }catch(e){}
      });
    }catch(e){ log('initAll err', e); }
  }

  // Start when DOM ready; also guard for late injection if DOM already ready
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(initAll, 10);
  } else {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
    // also a safety in case DOMContentLoaded never fires
    setTimeout(function(){ if(!window.__finalStrictInitDone) initAll(); }, 5000);
  }

  // expose a diagnostic helper (optional)
  try{ window.__finalStrictDiagnostics = { status: 'installed', version: '1.0.0' }; }catch(e){}

})(window, document);
