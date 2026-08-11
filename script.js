/* =========================================================
   CODEXYS — SCRIPT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader) preloader.classList.add('is-hidden');
    }, 2200);
  });

  /* ---------- Typed subheading ---------- */
  const typedEl = document.getElementById('typedSub');
  const phrases = [
    'Website Development',
    'UI/UX Design',
    'Web Systems & Dashboards'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  function typeLoop() {
    if (!typedEl) return;
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 35 : 65);
  }
  typeLoop();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Carousel arrows: scroll behaviour ---------- */
  document.querySelectorAll('.carousel-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const dir = btn.classList.contains('arrow-next') ? 1 : -1;
      target.scrollBy({ left: dir * target.clientWidth, behavior: 'smooth' });
    });
  });

  /* ---------- Team carousel: center arrows on the photo, not the card ----------
     The card's total height varies with description length, but every
     .member-photo band is a fixed height (set in CSS). This measures
     that band on the currently-first-visible card and moves the arrows
     to sit on its vertical center, instead of the vertical center of
     the whole (taller) card. Re-runs on load/resize since the photo
     band's pixel height changes across breakpoints. */
  function centerTeamArrows() {
    const wrap = document.getElementById('teamCarouselWrap');
    const grid = document.getElementById('teamGrid');
    if (!wrap || !grid) return;

    // Arrows are only shown (display:flex) below 640px — skip work otherwise.
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (!isMobile) return;

    // Use whichever card is currently left-most/visible in the scroller.
    const cards = grid.querySelectorAll('.team-card');
    if (!cards.length) return;

    const wrapRect = wrap.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    let activeCard = cards[0];
    let bestDist = Infinity;
    cards.forEach(card => {
      const dist = Math.abs(card.getBoundingClientRect().left - gridRect.left);
      if (dist < bestDist) { bestDist = dist; activeCard = card; }
    });

    const photo = activeCard.querySelector('.member-photo');
    if (!photo) return;

    const photoRect = photo.getBoundingClientRect();
    const centerY = (photoRect.top - wrapRect.top) + (photoRect.height / 2);

    wrap.querySelectorAll('.carousel-arrow').forEach(btn => {
      btn.style.top = `${centerY}px`;
    });
  }

  centerTeamArrows();
  window.addEventListener('resize', centerTeamArrows);
  window.addEventListener('orientationchange', centerTeamArrows);

  const teamGridEl = document.getElementById('teamGrid');
  if (teamGridEl) {
    let scrollRaf = null;
    teamGridEl.addEventListener('scroll', () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(centerTeamArrows);
    });
  }

  // Photos loaded from disk (e.g. danmark.jpg) don't change the box size
  // (height is fixed in CSS), but re-run once more after full page load
  // just in case fonts/webfont metrics shift layout slightly.
  window.addEventListener('load', centerTeamArrows);

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));

  /* ---------- Contact form (front-end only) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = 'Sending…';
      setTimeout(() => {
        status.textContent = 'Thanks — your message has been sent. We\'ll get back to you soon.';
        form.reset();
      }, 900);
    });
  }
});
