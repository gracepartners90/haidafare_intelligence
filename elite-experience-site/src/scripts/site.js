/* Élite Experience — interazioni del sito (nessuna dipendenza) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage non disponibile */ } },
  };

  /* ---------- Immagini incorporate (solo file unico di anteprima) ---------- */
  if (window.__ASSETS) {
    $$('img[data-asset]').forEach((img) => { const a = window.__ASSETS[img.dataset.asset]; if (a) img.src = a; });
  }

  /* ---------- Note di lavorazione ---------- */
  const notesBtn = $('[data-notes]');
  const setNotes = (on) => { body.classList.toggle('notes-on', on); if (notesBtn) notesBtn.setAttribute('aria-pressed', String(on)); store.set('ee-notes', on ? '1' : '0'); };
  if (notesBtn) {
    setNotes(store.get('ee-notes') !== '0');
    notesBtn.addEventListener('click', () => setNotes(!body.classList.contains('notes-on')));
  }

  /* ---------- Sottomenu Academy ---------- */
  const closeSubs = (except) => $$('.has-sub.open').forEach((li) => { if (li !== except) { li.classList.remove('open'); $('.sub-toggle', li).setAttribute('aria-expanded', 'false'); } });
  $$('.sub-toggle').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const li = b.closest('.has-sub'); const open = !li.classList.contains('open');
    closeSubs(li); li.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-sub')) closeSubs(); });

  /* ---------- Menu mobile ---------- */
  const burger = $('[data-burger]'), drawer = $('[data-drawer]');
  const setDrawer = (open) => { if (!drawer) return; drawer.hidden = !open; burger.setAttribute('aria-expanded', String(open)); syncHdr(); };
  if (burger) burger.addEventListener('click', () => setDrawer(drawer.hidden));
  if (drawer) drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });

  /* ---------- Intestazione trasparente finché la hero della home è in cima ---------- */
  const hdr = $('[data-hdr]');
  function syncHdr() {
    if (!hdr) return;
    const hero = $$('.hero').find((h) => h.offsetParent !== null);
    hdr.classList.toggle('hdr--over', !!hero && window.scrollY < 24 && (!drawer || drawer.hidden));
  }
  window.addEventListener('scroll', syncHdr, { passive: true });
  syncHdr();

  /* ---------- Video: apre il file se presente, altrimenti dichiara lo spazio da riempire ---------- */
  const modal = $('[data-vmodal]');
  const player = modal && $('.vmodal__video', modal);
  let opener = null;
  const openModal = (btn) => {
    const src = btn.dataset.videoSrc;
    opener = btn;
    $('.vmodal__title', modal).textContent = btn.dataset.videoTitle || 'Video';
    $('.vmodal__note', modal).textContent = btn.dataset.videoNote || 'Video in preparazione.';
    modal.classList.toggle('vmodal--video', !!src);
    player.hidden = !src;
    if (src) { player.src = src; player.play().catch(() => { /* l'utente avvia con i controlli */ }); }
    modal.hidden = false; $('[data-vmodal-close]', modal).focus();
  };
  const closeModal = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true; player.pause(); player.removeAttribute('src'); player.load();
    if (opener) opener.focus();
  };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-video-open]'); if (b) openModal(b); });
  if (modal) {
    $('[data-vmodal-close]', modal).addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    closeSubs(); setDrawer(false);
  });

  /* ---------- Tab dei contatti ---------- */
  const tabs = $('[data-tabs]');
  const selectTab = (id) => {
    if (!tabs) return false;
    const btn = $(`[aria-controls="${id}"]`, tabs); if (!btn) return false;
    $$('[role="tab"]', tabs).forEach((t) => { const on = t === btn; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
    return true;
  };
  if (tabs) {
    $$('[role="tab"]', tabs).forEach((t) => t.addEventListener('click', () => selectTab(t.getAttribute('aria-controls'))));
    tabs.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const all = $$('[role="tab"]', tabs); const i = all.indexOf(document.activeElement);
      const n = all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length]; n.focus(); n.click();
    });
    if (!window.__ASSETS && location.hash) selectTab(location.hash.slice(1));
    window.addEventListener('hashchange', () => { if (!window.__ASSETS) selectTab(location.hash.slice(1)); });
  }

  /* ---------- Form: validazione accessibile, nessun invio a servizi esterni ---------- */
  $$('[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      $$('input, select, textarea', form).forEach((el) => {
        const field = el.closest('.field'); const err = field && $('.field__err', field);
        let msg = '';
        if (el.required && (el.type === 'checkbox' ? !el.checked : !el.value.trim())) msg = el.type === 'checkbox' ? 'Per inviare la richiesta è necessario il consenso.' : 'Campo obbligatorio.';
        else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) msg = 'Inserisci un indirizzo email valido.';
        if (field) field.classList.toggle('is-invalid', !!msg);
        if (err) err.textContent = msg;
        el.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg && !first) first = el;
      });
      const ok = $('.form__ok', form);
      if (first) { first.focus(); if (ok) ok.hidden = true; return; }
      if (ok) ok.hidden = false;
      form.reset();
    });
  });

  /* ---------- Selettore dei rituali: l'immagine segue il corso indicato ---------- */
  $$('[data-picker]').forEach((picker) => {
    const items = $$('[data-picker-item]', picker), imgs = $$('.picker__img', picker);
    const set = (i) => {
      items.forEach((it, k) => it.classList.toggle('is-on', k === i));
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    };
    items.forEach((it, i) => { it.addEventListener('mouseenter', () => set(i)); it.addEventListener('focusin', () => set(i)); });
  });

  /* ---------- Il metodo, in pratica: i capitoli scorrono come un film quando la sezione è visibile ---------- */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = (s) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  $$('[data-seq]').forEach((seq) => {
    const frames = $$('.seq__frame', seq), caps = $$('.seq__cap', seq), steps = $$('.seq__bar li', seq), tc = $('[data-seq-tc]', seq);
    const n = frames.length, secs = Number(seq.dataset.seconds) || 5, dur = secs * 1000, total = clock(n * secs);
    let cur = 0, start = 0, elapsed = 0, playing = false, visible = false, raf = 0;
    const zoom = (i) => parseFloat(frames[i].style.getPropertyValue('--zoom')) || 1;
    const go = (i) => {
      cur = i; start = performance.now(); elapsed = 0;
      frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
      caps.forEach((c, k) => c.classList.toggle('is-on', k === i));
      steps.forEach((s, k) => {
        s.classList.toggle('is-on', k === i);
        $('i', s).style.setProperty('--f', k < i || (reduceMotion && k === i) ? 1 : 0);
        if (k === i) $('button', s).setAttribute('aria-current', 'step'); else $('button', s).removeAttribute('aria-current');
      });
      if (i > 0) seq.classList.add('past-intro');
      if (i === n - 1) seq.classList.add('at-end');
      if (tc) tc.textContent = `${clock(i * secs)} / ${total}`;
    };
    const tick = (t) => {
      const local = Math.min(1, (t - start) / dur);
      $('i', steps[cur]).style.setProperty('--f', local.toFixed(3));
      $('img', frames[cur]).style.setProperty('--z', (zoom(cur) * (1 + 0.06 * (1 - local))).toFixed(4));
      if (tc) tc.textContent = `${clock(Math.floor((cur + local) * secs))} / ${total}`;
      if (local >= 1) go((cur + 1) % n);
      if (playing) raf = requestAnimationFrame(tick);
    };
    const play = () => { if (playing || reduceMotion || !visible || document.hidden) return; playing = true; start = performance.now() - elapsed; raf = requestAnimationFrame(tick); };
    const pause = () => { if (!playing) return; playing = false; elapsed = performance.now() - start; cancelAnimationFrame(raf); };
    steps.forEach((s, i) => $('button', s).addEventListener('click', () => { go(i); if (playing) { pause(); elapsed = 0; play(); } }));
    if (reduceMotion) seq.classList.add('is-static');
    go(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else pause(); }, { threshold: 0.35 }).observe(seq);
    } else { visible = true; play(); }
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  });

  /* ---------- File unico di anteprima: navigazione tra le pagine ---------- */
  if (window.__ASSETS) {
    const routes = $$('.route');
    const navLinks = $$('.hdr a[href^="#/"], .drawer a[href^="#/"]');
    const show = () => {
      const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
      const [route, anchor] = raw.split('@');
      const target = routes.find((s) => s.dataset.route === route) || routes.find((s) => s.dataset.route === '');
      routes.forEach((s) => { s.hidden = s !== target; });
      document.title = target.dataset.title;
      navLinks.forEach((a) => { const r = a.getAttribute('href').slice(2).split('@')[0]; if (r === target.dataset.route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      setDrawer(false); closeSubs();
      if (anchor && selectTab(anchor)) { /* scheda dei contatti */ }
      const el = anchor && target.querySelector(`#${CSS.escape(anchor)}`);
      if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
      syncHdr();
    };
    window.addEventListener('hashchange', show);
    show();
  }
})();
