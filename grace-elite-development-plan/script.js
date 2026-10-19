/* Élite Experience — Development Plan | Grace & Partners
   JavaScript solo per: navigazione, progress di lettura, reveal, stampa. */
(() => {
  const nav = document.getElementById('nav');
  const bar = document.getElementById('progress');
  const links = [...document.querySelectorAll('.nav-links a')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Progress di lettura + nav chiara/scura in base alla sezione sottostante */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      const under = document.elementFromPoint(24, nav.getBoundingClientRect().bottom + 2)?.closest('.sec');
      nav.classList.toggle('on-dark', !!under && under.classList.contains('inv'));
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Sezione corrente */
  const setActive = (id) => links.forEach((a) => a.setAttribute('aria-current', a.dataset.nav === id ? 'true' : 'false'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.dataset.section); });
  }, { rootMargin: '-45% 0px -54% 0px' });
  document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
  const firstSection = document.getElementById('overview');
  addEventListener('scroll', () => {
    if (firstSection.getBoundingClientRect().top > innerHeight * 0.46) setActive('');
  }, { passive: true });

  /* Reveal leggero: solo per ciò che parte sotto la piega; a riposo tutto è visibile */
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.sec .wrap > *, .opener .wrap > *, .areas li, .index-list li, .seq li, .stairs li, .g-row, .prio > div, .funnel > *, .pipe li, .objectives li, .qa li'
    );
    const rv = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.remove('pending');
        e.target.classList.add('revealed');
        rv.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => {
      if (el.closest('.pending')) return; // evita reveal annidati
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('pending');
        rv.observe(el);
      }
    });
  }

  /* Elenchi lunghi ripiegati su mobile; sempre aperti su desktop e in stampa */
  const folds = [...document.querySelectorAll('details.fold')];
  const mq = matchMedia('(max-width: 720px)');
  const syncFolds = () => folds.forEach((d) => { d.open = !mq.matches; });
  syncFolds();
  mq.addEventListener?.('change', syncFolds);

  const prepPrint = () => {
    folds.forEach((d) => { d.open = true; });
    document.querySelectorAll('.pending').forEach((el) => { el.classList.remove('pending'); el.classList.add('revealed'); });
  };
  addEventListener('beforeprint', prepPrint);
  addEventListener('afterprint', syncFolds);

  /* PRINT / EXPORT PDF
     Nel browser: window.print().
     Dentro un artifact claude.ai la stampa è bloccata: si scarica una copia HTML da stampare. */
  const note = document.getElementById('print-note');
  const say = (t) => { if (note) { note.textContent = t; note.hidden = false; } };
  const selfCopy = () => {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('.pending').forEach((el) => el.classList.remove('pending'));
    clone.querySelectorAll('details.fold').forEach((d) => d.setAttribute('open', ''));
    return '<!doctype html>\n' + clone.outerHTML;
  };
  document.querySelectorAll('[data-print]').forEach((btn) => btn.addEventListener('click', async () => {
    const rt = window.claude;
    if (!rt || typeof rt.use !== 'function') { prepPrint(); window.print(); return; }
    let dl = null;
    try { dl = await rt.use('downloads'); } catch { dl = null; }
    if (!dl) { say('Per il PDF apri il documento nel browser e usa Stampa → Salva come PDF.'); return; }
    try {
      await dl.save({ filename: 'Elite-Experience-Development-Plan.html', data: selfCopy() });
      say('Copia scaricata: aprila nel browser e usa Stampa → Salva come PDF.');
    } catch (e) {
      say(e && e.code === 'declined' ? 'Download annullato.' : 'Per il PDF apri il documento nel browser e usa Stampa → Salva come PDF.');
    }
  }));
})();
