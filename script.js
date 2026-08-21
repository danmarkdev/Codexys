/* =========================================================
   CODEXYS — SCRIPT
   ========================================================= */

/* ---------- Light/Dark theme ----------
   Runs immediately (script is deferred, so the DOM already exists) so
   the saved theme applies as early as possible, before the rest of the
   page's setup code below. Defaults to dark (the site's original look)
   unless the visitor has previously toggled to light. */
(function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('codexys-theme');
  const theme = saved === 'light' ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('codexys-theme', next);
    });
  }
})();

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
    'Web Systems & Dashboards',
    'Business & Portfolio Websites',
    'Capstone Systems'
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

  /* ---------- Horizontal swipe: handled entirely by CSS ----------
     No JS needed here anymore. .about-grid / .service-grid / #teamGrid
     just use plain overflow-x:auto + scroll-snap in style.css — no
     overscroll-behavior-x, no touch-action, no JS touchmove guard.
     Since none of these elements scroll vertically, a vertical drag is
     naturally passed through to the page by the browser's default
     touch handling, so the page always scrolls down normally. */

  /* ---------- Carousels: force-snap to the nearest card ----------
     Some mobile browsers — notably in-app webviews like Facebook/
     Messenger's — don't reliably honor CSS scroll-snap, so a quick
     swipe can leave a carousel resting between two cards instead of
     landing on one. This is a fallback: a short moment after the user
     stops scrolling, it snaps to whichever card is nearest, regardless
     of what native scroll-snap did or didn't do. It measures the
     "page" width from the actual nearest card's own center rather than
     assuming a fixed card width, since cards can have their own
     max-width and gaps between them.
     Applied to all three mobile carousels: About, Services, Team. */
  function snapCarouselToNearestCard(grid, cardSelector) {
    const cards = grid.querySelectorAll(cardSelector);
    if (!cards.length) return;

    const gridRect = grid.getBoundingClientRect();
    const gridCenter = gridRect.left + gridRect.width / 2;

    let nearest = cards[0];
    let nearestDist = Infinity;
    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const dist = Math.abs(cardCenter - gridCenter);
      if (dist < nearestDist) { nearestDist = dist; nearest = card; }
    });

    const nearestRect = nearest.getBoundingClientRect();
    const nearestCenter = nearestRect.left + nearestRect.width / 2;
    const delta = nearestCenter - gridCenter;

    // Already close enough (native scroll-snap got it right) — skip
    // the extra animated scroll so it doesn't feel like a re-snap jitter.
    if (Math.abs(delta) < 1) return;

    grid.scrollTo({ left: grid.scrollLeft + delta, behavior: 'smooth' });
  }

  function attachSnapFallback(grid, cardSelector) {
    if (!grid) return;
    let snapTimer = null;
    let touching = false;

    grid.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    grid.addEventListener('touchend', () => {
      touching = false;
      // Finger just lifted — re-check shortly after in case the scroll
      // is still settling from this specific touch.
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => snapCarouselToNearestCard(grid, cardSelector), 120);
    }, { passive: true });

    grid.addEventListener('scroll', () => {
      if (touching) return; // don't fight an active drag
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => snapCarouselToNearestCard(grid, cardSelector), 120);
    }, { passive: true });
  }

  attachSnapFallback(document.querySelector('.about-grid'), '.info-card');
  attachSnapFallback(document.querySelector('.service-grid'), '.service-card');
  attachSnapFallback(document.getElementById('teamGrid'), '.team-card');

  /* ---------- Team carousel: center arrows on the photo, not the card ----------
     The card's total height varies with description length, but every
     .member-photo band is a fixed height (set in CSS). This measures
     that band on the currently-first-visible card and moves the arrows
     to sit on its vertical center, instead of the vertical center of
     the whole (taller) card. Re-runs on load/resize since the photo
     band's pixel height changes across breakpoints.
     Note: .carousel-arrow is currently display:none at every screen
     size in CSS (the mobile team carousel now relies on swipe/scroll-
     snap only), so this is effectively inert — left in place in case
     the arrows come back. */
  function centerTeamArrows() {
    const wrap = document.getElementById('teamCarouselWrap');
    const grid = document.getElementById('teamGrid');
    if (!wrap || !grid) return;

    // Arrows are only shown (display:flex) below 960px — skip work otherwise.
    const isMobile = window.matchMedia('(max-width: 960px)').matches;
    if (!isMobile) return;

    // Use whichever card is currently left-most/visible in the scroller.
    const cards = grid.querySelectorAll('.team-card');
    if (!cards.length) return;

    const wrapRect = wrap.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const gridCenter = gridRect.left + gridRect.width / 2;
    let activeCard = cards[0];
    let bestDist = Infinity;
    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const dist = Math.abs(cardCenter - gridCenter);
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
    let arrowRaf = null;
    teamGridEl.addEventListener('scroll', () => {
      if (arrowRaf) cancelAnimationFrame(arrowRaf);
      arrowRaf = requestAnimationFrame(centerTeamArrows);
    }, { passive: true });
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
