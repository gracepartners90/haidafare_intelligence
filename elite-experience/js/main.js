/* Élite Experience — Concept homepage
   Interazioni misurate: header, menu mobile, reveal, rituali, player video. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 1025px)');

  /* ---------- Header: stato, tema della sezione sottostante, hide on scroll ---------- */
  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;

  function sectionThemeUnderHeader() {
    const y = header.offsetHeight / 2;
    const stack = document.elementsFromPoint(Math.min(24, window.innerWidth - 1), y);
    for (const el of stack) {
      if (header.contains(el)) continue;
      const themed = el.closest('[data-theme]');
      if (themed) return themed.dataset.theme;
    }
    return 'light';
  }

  function updateHeader() {
    const y = window.scrollY;
    const menuOpen = document.body.classList.contains('is-locked');
    header.classList.toggle('is-scrolled', y > 8);
    header.classList.toggle('is-dark', menuOpen || sectionThemeUnderHeader() === 'dark');
    if (!menuOpen) {
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > window.innerHeight * 0.6) header.classList.add('is-hidden');
      else if (goingUp || y < 120) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', updateHeader);
  updateHeader();

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Chiudi' : 'Menu';
    menu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    header.classList.remove('is-hidden');
    updateHeader();
  }

  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  isDesktop.addEventListener('change', (e) => { if (e.matches && !menu.hidden) setMenu(false); });

  /* Link segnaposto (pagine non ancora disponibili nel concept) */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Rituali: immagine sticky sincronizzata con il modulo attivo ---------- */
  const rituals = document.querySelector('[data-rituals]');
  if (rituals) {
    const items = [...rituals.querySelectorAll('[data-ritual]')];
    const images = [...rituals.querySelectorAll('.rituals__stack img')];
    const counter = rituals.querySelector('[data-ritual-index]');
    let current = 0;

    const activate = (i) => {
      if (i === current) return;
      current = i;
      items.forEach((el, n) => el.classList.toggle('is-active', n === i));
      images.forEach((el, n) => el.classList.toggle('is-active', n === i));
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
    };

    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => { if (isDesktop.matches) activate(i); });
      item.addEventListener('focusin', () => activate(i));
    });

    // Su desktop il modulo al centro del viewport diventa attivo durante lo scroll.
    if ('IntersectionObserver' in window) {
      const centerIO = new IntersectionObserver((entries) => {
        if (!isDesktop.matches) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(items.indexOf(entry.target));
        });
      }, { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
      items.forEach((el) => centerIO.observe(el));
    }
  }

  /* ---------- Player video custom ---------- */
  document.querySelectorAll('[data-player]').forEach(initPlayer);

  function initPlayer(root) {
    const video = root.querySelector('video');
    const source = video.querySelector('source');
    const start = root.querySelector('[data-player-start]');
    const btnToggle = root.querySelector('[data-player-toggle]');
    const btnMute = root.querySelector('[data-player-mute]');
    const btnFull = root.querySelector('[data-player-fullscreen]');
    const range = root.querySelector('[data-player-range]');
    const elCurrent = root.querySelector('[data-player-current]');
    const elTotal = root.querySelector('[data-player-total]');
    const elDuration = root.querySelector('[data-player-duration]');
    let seeking = false;
    let idleTimer = 0;

    const fmt = (s) => {
      if (!Number.isFinite(s) || s < 0) return '0:00';
      const t = Math.floor(s);
      const h = Math.floor(t / 3600);
      const m = Math.floor((t % 3600) / 60);
      const sec = String(t % 60).padStart(2, '0');
      return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
    };

    const setFill = (ratio) => range.style.setProperty('--p', `${(ratio * 100).toFixed(2)}%`);

    const onMeta = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      elTotal.textContent = fmt(video.duration);
      elDuration.textContent = fmt(video.duration);
    };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();

    const markUnavailable = () => {
      root.classList.add('is-unavailable');
      start.setAttribute('aria-disabled', 'true');
      elDuration.textContent = 'Video in arrivo';
    };
    source.addEventListener('error', markUnavailable);
    video.addEventListener('error', markUnavailable);

    const play = () => {
      if (root.classList.contains('is-unavailable')) return;
      root.classList.add('is-started');
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => root.classList.remove('is-started'));
    };
    const togglePlay = () => (video.paused ? play() : video.pause());

    start.addEventListener('click', play);
    btnToggle.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    const bumpIdle = () => {
      root.classList.remove('is-idle');
      window.clearTimeout(idleTimer);
      if (!video.paused) idleTimer = window.setTimeout(() => root.classList.add('is-idle'), 2600);
    };
    root.addEventListener('pointermove', bumpIdle);
    root.addEventListener('focusin', bumpIdle);

    video.addEventListener('play', () => {
      root.classList.add('is-playing');
      btnToggle.setAttribute('aria-label', 'Pausa');
      bumpIdle();
    });
    video.addEventListener('pause', () => {
      root.classList.remove('is-playing', 'is-idle');
      btnToggle.setAttribute('aria-label', 'Riproduci');
      window.clearTimeout(idleTimer);
    });
    video.addEventListener('ended', () => {
      root.classList.remove('is-started');
      elDuration.textContent = `Rivedi · ${fmt(video.duration)}`;
    });

    video.addEventListener('timeupdate', () => {
      const ratio = video.duration ? video.currentTime / video.duration : 0;
      if (!seeking) range.value = String(Math.round(ratio * 1000));
      setFill(ratio);
      elCurrent.textContent = fmt(video.currentTime);
    });

    range.addEventListener('input', () => {
      seeking = true;
      const ratio = Number(range.value) / 1000;
      setFill(ratio);
      if (video.duration) video.currentTime = ratio * video.duration;
    });
    range.addEventListener('change', () => { seeking = false; });

    btnMute.addEventListener('click', () => {
      video.muted = !video.muted;
      root.classList.toggle('is-muted', video.muted);
      btnMute.setAttribute('aria-label', video.muted ? 'Attiva audio' : 'Disattiva audio');
    });

    btnFull.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });

    // Il video si mette in pausa quando esce dal viewport.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < 0.2 && !video.paused) video.pause();
      }, { threshold: [0, 0.2] }).observe(root);
    }
  }
})();
