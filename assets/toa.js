/* T.O.A. site interactions. Vanilla JS, no dependencies. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* Mobile menu */
  const menuBtn = $('.menu-btn'), nav = $('#nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  /* Header hides on scroll down, returns on scroll up; scroll thread */
  const head = $('.site-head'), thread = $('.thread');
  let lastY = window.scrollY;

  /* Hero: walk through the painted frame */
  const hero = $('.frame-hero');
  const aperture = hero && $('.aperture', hero);
  const photos = hero ? $$('.frame-photos img', hero) : [];
  let current = 0, locked = false;
  const showPhoto = (n) => {
    if (n === current) return;
    photos[current].classList.remove('is-on');
    current = n;
    photos[current].classList.add('is-on');
  };
  if (photos.length) {
    photos[0].classList.add('is-on');
    if (!reduce && photos.length > 1) {
      setInterval(() => { if (!locked) showPhoto((current + 1) % photos.length); }, 4200);
    }
  }
  const finalIdx = Math.max(0, photos.findIndex((p) => p.closest('picture')?.hasAttribute('data-final') || p.hasAttribute('data-final')));
  const layer = hero && $('.frame-photos', hero);
  function heroFrame() {
    if (!hero || reduce) return;
    const r = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const p = clamp(-r.top / total);
    const zoomP = clamp(p / 0.62);
    // ease-in so the frame starts slow then rushes past you
    const zoom = 1 + Math.pow(zoomP, 2.2) * 9;
    hero.style.setProperty('--zoom', zoom.toFixed(3));
    hero.style.setProperty('--copy', clamp(1 - p / 0.28).toFixed(3));
    hero.style.setProperty('--lift', (-p * 120).toFixed(1) + 'px');
    hero.style.setProperty('--shade', clamp((p - 0.45) / 0.3).toFixed(3));
    hero.style.setProperty('--after', clamp((p - 0.55) / 0.25).toFixed(3));
    if (aperture && layer) {
      // the photo layer is exactly the part of the frame opening that is on screen,
      // so photos end the zoom at native screen size instead of being blown up
      const w = aperture.offsetWidth, h = aperture.offsetHeight;
      const cx = aperture.offsetLeft, cy = aperture.offsetTop;
      const vw = window.innerWidth, vh = window.innerHeight;
      const L = Math.max(0, cx - w * zoom / 2), R = Math.min(vw, cx + w * zoom / 2);
      const T = Math.max(0, cy - h * zoom / 2), B = Math.min(vh, cy + h * zoom / 2);
      Object.assign(layer.style, { left: L + 'px', top: T + 'px', width: (R - L) + 'px', height: (B - T) + 'px', transform: 'none', aspectRatio: 'auto' });
    }
    locked = p > 0.04;
    if (locked && photos.length) showPhoto(finalIdx);
    if (aperture) aperture.style.visibility = zoom > 9.5 ? 'hidden' : 'visible';
  }

  /* Year timeline: vertical scroll drives horizontal track */
  const year = $('.year'), track = year && $('.year-track', year), rail = year && $('.year-rail', year);
  const wide = () => window.innerWidth > 820 && !reduce;
  function sizeYear() {
    if (!year || !track) return;
    if (!wide()) { year.style.height = ''; track.style.transform = ''; return; }
    const dist = track.scrollWidth - window.innerWidth;
    year.style.height = (window.innerHeight + Math.max(0, dist)) + 'px';
  }
  function yearFrame() {
    if (!year || !track || !wide()) return;
    const r = year.getBoundingClientRect();
    const total = year.offsetHeight - window.innerHeight;
    const p = clamp(-r.top / Math.max(1, total));
    const dist = track.scrollWidth - window.innerWidth;
    track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    if (rail) rail.style.setProperty('--p', p.toFixed(3));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (head) head.classList.toggle('is-hidden', y > 300 && y > lastY && !(nav && nav.classList.contains('is-open')));
      lastY = y;
      if (thread) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        thread.style.setProperty('--sp', clamp(y / Math.max(1, max)).toFixed(4));
      }
      heroFrame();
      yearFrame();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { sizeYear(); onScroll(); });
  window.addEventListener('load', () => { sizeYear(); onScroll(); });
  sizeYear(); onScroll();

  /* One-time reveals: paint-stroke images, blueprint drawing, counters */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.25 }) : null;
  $$('[data-reveal], .blueprint, [data-count]').forEach((el) => {
    if (io && !reduce) io.observe(el);
    else { el.classList.add('is-in'); if (el.matches('[data-count]')) el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || ''); }
  });
  function countUp(el) {
    const end = Number(el.dataset.count), start = performance.now(), dur = 1400;
    const step = (t) => {
      const k = clamp((t - start) / dur);
      el.textContent = (el.dataset.prefix || '') + Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString() + (el.dataset.suffix || '');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Soapy Joe's countdown (orders close end of Dec 29, 2026, local time) */
  $$('[data-deadline]').forEach((el) => {
    const end = new Date(el.dataset.deadline + 'T23:59:59');
    const days = Math.ceil((end - new Date()) / 86400000);
    const num = $('b', el), label = $('span', el);
    if (days > 1) { num.textContent = days; label.textContent = 'days left to order'; }
    else if (days === 1) { num.textContent = '1'; label.textContent = 'day left to order'; }
    else { num.textContent = ''; label.textContent = 'Orders for this fundraiser have closed'; }
  });

  /* Copy donation handles */
  $$('.copy-btn').forEach((b) => {
    b.addEventListener('click', async () => {
      const text = b.dataset.copy;
      try { await navigator.clipboard.writeText(text); }
      catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
      const old = b.textContent;
      b.textContent = 'Copied ' + text;
      b.classList.add('is-done');
      setTimeout(() => { b.textContent = old; b.classList.remove('is-done'); }, 2200);
    });
  });

  /* Teen center blueprint: choose a room */
  $$('[data-rooms]').forEach((wrap) => {
    const info = $('.room-info', wrap);
    const rooms = $$('.room', wrap), tabs = $$('.room-tabs button', wrap);
    const show = (id) => {
      const tpl = $(`template[data-room="${id}"]`, wrap);
      if (tpl && info) info.replaceChildren(tpl.content.cloneNode(true));
      rooms.forEach((r) => r.classList.toggle('is-active', r.dataset.room === id));
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.room === id)));
    };
    rooms.forEach((r) => {
      r.addEventListener('click', () => show(r.dataset.room));
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(r.dataset.room); } });
    });
    tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.room)));
    if (tabs[0]) show(tabs[0].dataset.room);
  });

  /* Lightbox for galleries */
  const lb = $('.lightbox');
  if (lb) {
    const img = $('img', lb), cap = $('p', lb), close = $('button', lb);
    let opener = null;
    const shut = () => { lb.classList.remove('is-open'); img.src = ''; opener && opener.focus(); };
    $$('[data-lightbox]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      opener = a;
      img.src = a.getAttribute('href');
      img.alt = a.querySelector('img')?.alt || '';
      cap.textContent = a.dataset.caption || '';
      lb.classList.add('is-open');
      close.focus();
    }));
    close.addEventListener('click', shut);
    lb.addEventListener('click', (e) => { if (e.target === lb) shut(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('is-open')) shut(); });
  }
})();
