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

  /* ---------- Form: validazione accessibile; con data-endpoint la richiesta va al foglio Google ---------- */
  $$('[data-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let first = null;
      $$('input:not([type="hidden"]), select, textarea', form).forEach((el) => {
        if (el.closest('.form__hp')) return;
        const field = el.closest('.field'); const err = field && $('.field__err', field);
        let msg = '';
        if (el.required && (el.type === 'checkbox' ? !el.checked : !el.value.trim())) msg = el.type === 'checkbox' ? 'Per inviare la richiesta è necessario il consenso.' : 'Campo obbligatorio.';
        else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) msg = 'Inserisci un indirizzo email valido.';
        if (field) field.classList.toggle('is-invalid', !!msg);
        if (err) err.textContent = msg;
        el.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg && !first) first = el;
      });
      const ok = $('.form__ok', form), fail = $('.form__fail', form), btn = $('button[type="submit"]', form);
      if (fail) fail.hidden = true;
      if (first) { first.focus(); if (ok) ok.hidden = true; return; }
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        form.elements.pagina.value = location.href;
        btn.disabled = true;
        form.setAttribute('aria-busy', 'true');
        try {
          const res = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
          const out = await res.json();
          if (!out.ok) throw new Error('invio rifiutato');
        } catch {
          if (fail) { fail.hidden = false; fail.setAttribute('tabindex', '-1'); fail.focus(); }
          btn.disabled = false;
          form.removeAttribute('aria-busy');
          return;
        }
        btn.disabled = false;
        form.removeAttribute('aria-busy');
      }
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
    let cur = 0, start = 0, elapsed = 0, playing = false, visible = false, raf = 0, prev = -1, prevStart = 0;
    const zoom = (i) => parseFloat(frames[i].style.getPropertyValue('--zoom')) || 1;
    // Il movimento di ogni foto dura il capitolo più la dissolvenza (1,4 s, come in CSS):
    // la foto che esce continua a muoversi mentre sfuma, senza fermarsi di colpo
    const FADE = 1400;
    const setZoom = (i, t0, t) => $('img', frames[i]).style.setProperty('--z', (zoom(i) * (1 + 0.06 * (1 - Math.min(1, Math.max(0, t - t0) / (dur + FADE))))).toFixed(4));
    const go = (i) => {
      if (i !== cur) { prev = cur; prevStart = start; }
      cur = i; start = performance.now(); elapsed = 0;
      setZoom(i, start, start);
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
      setZoom(cur, start, t);
      if (prev >= 0 && t - start < FADE) setZoom(prev, prevStart, t);
      if (tc) tc.textContent = `${clock(Math.floor((cur + local) * secs))} / ${total}`;
      if (local >= 1) go((cur + 1) % n);
      if (playing) raf = requestAnimationFrame(tick);
    };
    const play = () => {
      if (playing || reduceMotion || !visible || document.hidden) return;
      const shift = performance.now() - elapsed - start;
      playing = true; start += shift; prevStart += shift; raf = requestAnimationFrame(tick);
    };
    const pause = () => { if (!playing) return; playing = false; elapsed = performance.now() - start; cancelAnimationFrame(raf); };
    steps.forEach((s, i) => $('button', s).addEventListener('click', () => { go(i); if (playing) { pause(); elapsed = 0; play(); } }));
    if (reduceMotion) seq.classList.add('is-static');
    go(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else pause(); }, { threshold: 0.35 }).observe(seq);
    } else { visible = true; play(); }
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  });

  /* ---------- Comparsa delle immagini a tutto schermo ---------- */
  const onView = (el, cb, threshold = 0.2) => {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold }).observe(el);
  };
  $$('[data-reveal]').forEach((el) => onView(el, (inView) => { if (inView) el.classList.add('is-in'); }));

  /* ---------- Foto in dissolvenza: hero di Elisabetta e galleria del metodo ---------- */
  function cycle(items, marks, ms, root, onStep) {
    if (items.length < 2 || reduceMotion) return;
    let i = 0, timer = 0, visible = false;
    const step = () => {
      const prev = i; i = (i + 1) % items.length;
      // La foto che esce continua il movimento mentre sfuma (is-out); quella che entra, ancora
      // trasparente, riparte dall'inizio del movimento
      items.forEach((it, k) => { it.classList.toggle('is-on', k === i); it.classList.toggle('is-out', k === prev); });
      $$('img', items[i]).forEach((im) => { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; });
      marks.forEach((m, k) => { m.classList.toggle('is-on', k === i); m.classList.toggle('is-done', onStep ? k < i : false); });
      if (onStep) onStep(i, prev);
    };
    const run = () => { clearInterval(timer); if (visible && !document.hidden) timer = setInterval(step, ms); };
    onView(root, (v) => { visible = v; run(); }, 0.3);
    document.addEventListener('visibilitychange', run);
  }
  $$('[data-slides]').forEach((el) => {
    const hero = el.closest('.hero') || el;
    const ms = 6000;
    hero.style.setProperty('--slide-ms', `${ms}ms`);
    const marks = $$('.hero__progress li', hero);
    // Ricomincia l'animazione della barra della foto attiva
    cycle($$('.hero__slide', el), marks, ms, hero, (i) => { const bar = marks[i] && $('i', marks[i]); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; } });
  });
  $$('[data-fader]').forEach((el) => cycle($$('.fader__item', el), $$('.fader__dots li', el), 4200, el));

  /* ---------- Teaser in sottofondo: parte quando la sezione è visibile, con pausa a scelta ---------- */
  $$('[data-loop-video]').forEach((sec) => {
    const video = $('video', sec), toggle = $('[data-loop-toggle]', sec), label = $('[data-loop-label]', sec);
    if (!video) return;
    let userPaused = reduceMotion, visible = false;
    const sync = () => {
      toggle.setAttribute('aria-pressed', String(userPaused));
      label.textContent = userPaused ? 'Riproduci il video' : 'Metti in pausa il video';
      if (visible && !userPaused && !document.hidden) video.play().catch(() => { /* resta il fotogramma */ });
      else video.pause();
    };
    video.addEventListener('playing', () => sec.classList.add('is-playing'));
    toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
    onView(sec, (v) => { visible = v; sync(); }, 0.25);
    document.addEventListener('visibilitychange', sync);
    sync();
  });

  /* ---------- Schede a due voci (Academy: online / in presenza) ---------- */
  $$('[data-switch]').forEach((sw) => {
    const tabs = $$('[role="tab"]', sw);
    const pick = (btn, focus) => {
      tabs.forEach((t) => {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) btn.focus();
    };
    tabs.forEach((t) => t.addEventListener('click', () => pick(t)));
    sw.addEventListener('keydown', (e) => {
      const k = tabs.indexOf(document.activeElement);
      if (k < 0) return;
      const n = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      pick(tabs[(n + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- Élite & More: il numero si sfoglia in orizzontale (tablet e desktop) ---------- */
  $$('[data-sfoglio]').forEach((root) => {
    const fx = $('.sfoglio__fx', root);
    const pages = $$(':scope > .pg', fx);
    const [prev, next] = $$('.sfoglio__btn', root);
    const folio = $('.sfoglio__folio b', root), bar = $('.sfoglio__bar span', root), live = $('[data-sfoglio-live]', root);
    // Sfoglio orizzontale da tablet in su (stesso limite del CSS)
    const wide = window.matchMedia('(min-width: 761px) and (min-height: 36rem)');
    const N = pages.length;
    if (!N || !prev || !next) return;
    const bundle = !!window.__ASSETS;
    const pad = (n) => String(n).padStart(2, '0');
    const clamp = (n) => Math.max(0, Math.min(N - 1, n));
    let i = 0, lockUntil = 0, acc = 0, accT = 0, timer = 0, speak = false;

    const shown = () => root.offsetParent !== null;
    const on = () => wide.matches && shown();
    // Il numero è «agganciato» quando occupa la finestra sotto l'intestazione
    const docked = () => Math.abs(root.getBoundingClientRect().top - (hdr ? hdr.getBoundingClientRect().bottom : 0)) < 6;
    const idx = () => clamp(Math.round(fx.scrollLeft / (fx.clientWidth || 1)));
    // Pagina di un'ancora: #p-03 (sito) oppure #/elite-e-more/@p-03 (file unico)
    const pageOf = (href) => {
      const m = /(?:#|@)(p-\d+|sommario)$/.exec(href || '');
      const el = m && document.getElementById(m[1]);
      const pg = el && el.closest('.pg');
      return pg ? pages.indexOf(pg) : -1;
    };
    const render = (k) => {
      root.dataset.tone = pages[k].dataset.tone === 'ink' ? 'ink' : 'paper';
      folio.textContent = pad(k + 1);
      bar.style.width = `${((k + 1) / N) * 100}%`;
      prev.disabled = k === 0;
      next.disabled = k === N - 1;
    };
    const settle = () => {
      if (!on()) return;
      i = idx();
      render(i);
      const p = pages[i];
      if (speak) live.textContent = `Pagina ${i + 1} di ${N}: ${(($('h1, h2', p) || {}).textContent || '').replace(/\s+/g, ' ').trim()}`;
      if (!bundle) {
        const hash = i === 0 ? '' : `#${p.id}`;
        if (location.hash !== hash) history.replaceState(history.state, '', hash || location.pathname + location.search);
      }
    };
    // Animato solo verso la pagina accanto: i salti (sommario, copertina) sono immediati
    const go = (n, instant) => {
      n = clamp(n);
      const now = instant || reduceMotion || Math.abs(n - i) > 1;
      i = n; speak = true;
      render(n);
      fx.scrollTo({ left: n * fx.clientWidth, behavior: now ? 'instant' : 'smooth' });
      if (now) settle();
    };

    if ('onscrollend' in window) fx.addEventListener('scrollend', settle);
    fx.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(settle, 120); }, { passive: true });

    // Rotellina: un gesto = una pagina, solo a numero agganciato; prima e ultima pagina lasciano scorrere il sito
    root.addEventListener('wheel', (e) => {
      if (!on() || e.ctrlKey || !docked()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // swipe orizzontale nativo
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * fx.clientHeight : e.deltaY;
      const t = performance.now();
      if (t >= lockUntil && ((dy < 0 && i === 0) || (dy > 0 && i === N - 1))) return;
      e.preventDefault();
      if (t < lockUntil) { lockUntil = Math.max(lockUntil, t + 150); return; }
      if (t - accT > 200) acc = 0;
      accT = t; acc += dy;
      if (Math.abs(acc) >= 50) { go(i + Math.sign(acc)); acc = 0; lockUntil = t + 650; }
    }, { passive: false });

    // Tastiera: ← PagSu | → PagGiù | Inizio Fine (Pag/Inizio/Fine solo a numero agganciato)
    document.addEventListener('keydown', (e) => {
      if (!on() || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t && t.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="tab"], .vmodal')) return;
      const r = root.getBoundingClientRect();
      if (r.bottom < 120 || r.top > window.innerHeight - 120) return;
      let n;
      switch (e.key) {
        case 'ArrowLeft': n = i - 1; break;
        case 'ArrowRight': n = i + 1; break;
        case 'PageUp': if (!docked() || i === 0) return; n = i - 1; break;
        case 'PageDown': if (!docked() || i === N - 1) return; n = i + 1; break;
        case 'Home': if (!docked()) return; n = 0; break;
        case 'End': if (!docked()) return; n = N - 1; break;
        default: return;
      }
      e.preventDefault();
      go(n);
    });

    prev.addEventListener('click', () => go(i - 1));
    next.addEventListener('click', () => go(i + 1));

    // Link interni al numero: girano pagina e portano lì il focus; in pila restano ancore native
    root.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || !on()) return;
      const k = pageOf(a.getAttribute('href'));
      if (k < 0) return;
      e.preventDefault();
      window.scrollTo({ top: window.scrollY + root.getBoundingClientRect().top - (hdr ? hdr.offsetHeight : 0), behavior: 'instant' });
      go(k);
      pages[k].focus({ preventScroll: true });
    });

    // Tab porta la vista sulla pagina del link
    fx.addEventListener('focusin', (e) => {
      if (!on()) return;
      const pg = e.target.closest('.pg');
      const k = pg ? pages.indexOf(pg) : -1;
      if (k >= 0 && k !== i) go(k, true);
    });

    // Link diretti e ritorno: l'ancora decide la pagina
    window.addEventListener('hashchange', () => { const k = pageOf(location.hash); if (on() && k >= 0) go(k, true); });

    // Ridimensionamento e cambio di modalità: si resta sulla stessa pagina
    const snap = () => { fx.scrollTo({ left: i * fx.clientWidth, behavior: 'instant' }); render(i); };
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (on()) snap(); }).observe(fx);
    wide.addEventListener('change', () => { if (wide.matches) requestAnimationFrame(snap); else if (shown()) pages[i].scrollIntoView({ block: 'start' }); });

    const start = pageOf(location.hash);
    i = start >= 0 ? start : idx();
    if (on() && start >= 0) requestAnimationFrame(() => go(start, true));
    render(i);
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
