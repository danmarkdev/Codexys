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

  /* ---------- Team: single-card carousel, arrow-click only ----------
     On mobile, only ONE member card is shown at a time (toggled via
     the .is-active class — see style.css), centered on screen, with
     the ‹ / › arrow buttons sitting beside it as plain flex siblings
     (never on top of the card, never overlapping the photo). The only
     way to move between members is tapping those two buttons — no
     swipe/drag gesture is wired up on purpose. This avoids the old
     approach of sliding a track by a JS-measured pixel width (fragile
     on real devices); toggling display via a class can't drift or
     mis-measure. */
  const teamWrap = document.getElementById('teamCarouselWrap');
  const teamGrid = document.getElementById('teamGrid');
  const teamPrevBtn = teamWrap ? teamWrap.querySelector('.arrow-prev') : null;
  const teamNextBtn = teamWrap ? teamWrap.querySelector('.arrow-next') : null;

  function teamCards() {
    return teamGrid ? Array.from(teamGrid.querySelectorAll('.team-card')) : [];
  }

  let teamIndex = 0;

  function updateTeamCarousel() {
    const cards = teamCards();
    if (!cards.length) return;
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === teamIndex);
    });
    if (teamPrevBtn) teamPrevBtn.disabled = teamIndex <= 0;
    if (teamNextBtn) teamNextBtn.disabled = teamIndex >= cards.length - 1;
  }

  if (teamPrevBtn) {
    teamPrevBtn.addEventListener('click', () => {
      teamIndex = Math.max(0, teamIndex - 1);
      updateTeamCarousel();
    });
  }
  if (teamNextBtn) {
    teamNextBtn.addEventListener('click', () => {
      const max = teamCards().length - 1;
      teamIndex = Math.min(max, teamIndex + 1);
      updateTeamCarousel();
    });
  }

  // Set the initial state (first card active, prev arrow disabled).
  // Harmless on desktop — .is-active has no effect there since every
  // .team-card is shown regardless (see style.css, unaffected outside
  // the mobile media query).
  updateTeamCarousel();

  /* ---------- Scroll reveal ----------
     About and Services cards are plain, normally-flowing elements
     (no carousel transform), so the standard scroll-triggered fade-in
     works correctly for them without any special-casing. Team cards
     are also normally-flowing now (a stacked list on mobile, a static
     grid on desktop), but they're still shown immediately instead of
     waiting on scroll-into-view detection, just to guarantee every
     member renders right away with no chance of a missed
     intersection observer callback hiding one of them. */
  const teamCardSelector = '.team-card.reveal';

  document.querySelectorAll(teamCardSelector).forEach(el => {
    el.classList.add('is-visible');
  });

  const observedEls = document.querySelectorAll('.reveal:not(.team-card)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  observedEls.forEach(el => observer.observe(el));

  /* ---------- Contact form (Formspree) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Sending…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          status.textContent = 'Thanks your message has been sent. We\'ll get back to you soon.';
          form.reset();
        } else {
          status.textContent = 'Something went wrong. Please try again or email us directly.';
        }
      } catch (error) {
        status.textContent = 'Something went wrong. Please try again or email us directly.';
      }
    });
  }
});
