/* Sen Digitals — Interaction & Scroll Choreography */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PAGE INTRO ---------- */
  function loadPage() {
    document.body.classList.add('is-loaded');
    kickoffHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPage, { once: true });
  } else {
    setTimeout(loadPage, reduced ? 0 : 80);
  }

  /* ---------- YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAV ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById('nav-toggle');
  const navExpand = document.getElementById('nav-expand');

  function closeNav() {
    toggle?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    navExpand?.classList.remove('is-open');
    navExpand?.setAttribute('aria-hidden', 'true');
  }

  toggle?.addEventListener('click', () => {
    const isOpen = navExpand.classList.toggle('is-open');
    navExpand.setAttribute('aria-hidden', String(!isOpen));
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navExpand?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeNav);
  });

  /* ---------- CURSOR ---------- */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  if (cursor && dot && !matchMedia('(pointer: coarse)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; });
    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const hoverables = document.querySelectorAll('a, button, .service-card, .work-item, .nav-toggle');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- SECTION REVEAL (fallback when GSAP not yet loaded) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  // Hero items are revealed manually on page kickoff.
  document.querySelectorAll('.section-title, .contact-title, .contact .eyebrow').forEach((el) => io.observe(el));

  /* ---------- KICKOFF HERO ---------- */
  function kickoffHero() {
    document.querySelector('.hero-title')?.classList.add('is-visible');
    document.querySelector('.hero-ctas')?.classList.add('is-visible');
    document.querySelector('.hero .eyebrow')?.classList.add('is-visible');
  }

  /* ---------- TILT (services) ---------- */
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ---------- COUNT UP STATS ---------- */
  const counters = document.querySelectorAll('.stat-num');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isDecimal = suffix.startsWith('.');
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = isDecimal
          ? (target + parseFloat(suffix)) * eased
          : target * eased;
        el.textContent = isDecimal ? val.toFixed(1) : Math.round(val) + (suffix && !isDecimal ? suffix : '');
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = isDecimal ? (target + parseFloat(suffix)).toFixed(1) : target + (suffix && !isDecimal ? suffix : '');
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterIO.observe(c));

  /* ---------- GSAP SCROLL CHOREOGRAPHY ---------- */
  function gsapInit() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    /* Live-build preview parallax */
    gsap.to('.hero-asset-frame', {
      y: -44,
      scrollTrigger: { trigger: '.build-preview', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    /* Section title reveals */
    gsap.utils.toArray('.section-title').forEach((title) => {
      ScrollTrigger.create({
        trigger: title,
        start: 'top 80%',
        onEnter: () => title.classList.add('is-visible'),
      });
    });

    /* Service cards stagger */
    gsap.from('.service-card', {
      y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.services-grid', start: 'top 75%' }
    });

    /* Work items */
    gsap.from('.work-item', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.work-list', start: 'top 80%' }
    });

    /* Process steps */
    gsap.from('.process-step', {
      y: 50, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.process-steps', start: 'top 80%' }
    });

    /* Stats */
    gsap.from('.stat', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.stats', start: 'top 85%' }
    });

    /* About card parallax */
    gsap.to('.about-card', {
      y: -40,
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    /* Contact form fade */
    gsap.from('.contact-form', {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 85%' }
    });
  }

  /* run after deferred GSAP loads */
  if (document.readyState === 'complete') gsapInit();
  else window.addEventListener('load', gsapInit);

  /* ---------- ANCHOR SMOOTH OFFSET ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

})();
