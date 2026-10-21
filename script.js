/* =========================================================
   CODEXYS — SCRIPT
   ========================================================= */

/* ---------- Light/Dark theme ----------
   Defaults to dark unless the visitor previously toggled to light.
   localStorage is wrapped in try/catch: if the browser blocks it,
   the old code threw an error and STOPPED the whole script (which
   left the preloader stuck on screen). */
(function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  let saved = null;
  try { saved = localStorage.getItem('codexys-theme'); } catch (e) { saved = null; }

  const theme = saved === 'light' ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('codexys-theme', next); } catch (e) { /* ignore */ }
    });
  }
})();

/* ---------- Preloader (runs immediately, does NOT depend on anything else) ----------
   Hides after a minimum of 2.2s. It waits for the page "load" event
   but never longer than 4s, so a slow font/image can't trap the
   visitor on the loading screen. */
(function initPreloader() {
  const MIN_TIME = 2200;
  const MAX_TIME = 4000;
  const started = Date.now();
  let hidden = false;

  function hidePreloader() {
    if (hidden) return;
    hidden = true;
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('is-hidden');
  }

  function hideAfterMinTime() {
    const wait = Math.max(0, MIN_TIME - (Date.now() - started));
    setTimeout(hidePreloader, wait);
  }

  if (document.readyState === 'complete') {
    hideAfterMinTime();
  } else {
    window.addEventListener('load', hideAfterMinTime);
  }

  // Safety net: always hide, even if "load" never fires
  setTimeout(hidePreloader, MAX_TIME);
})();

/* ---------- Basic copy/paste & right-click protection ----------
   Only deters casual copying. Form fields and the footer contact
   info are excluded so visitors can still use the form and copy
   the email/phone number. */
(function protectContent() {
  const allowSelector = 'input, textarea, [contenteditable="true"], .footer-contact-item';

  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest(allowSelector)) e.preventDefault();
  });

  document.addEventListener('selectstart', (e) => {
    if (!e.target.closest(allowSelector)) e.preventDefault();
  });

  document.addEventListener('copy', (e) => {
    if (!e.target.closest(allowSelector)) e.preventDefault();
  });

  document.addEventListener('cut', (e) => {
    if (!e.target.closest(allowSelector)) e.preventDefault();
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest(allowSelector)) return;
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'u', 's'].includes(key)) {
      e.preventDefault();
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Typed subheading ---------- */
  const typedEl = document.getElementById('typedSub');
  const phrases = [
    'Website Development',
    'Web Systems & Dashboards',
    'AI Development'
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
     the .is-active class — see style.css), with the ‹ / › arrow
     buttons beside it. No swipe/drag gesture on purpose. */
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

  updateTeamCarousel();

  /* ---------- Scroll reveal ----------
     Team cards are shown immediately; everything else fades in
     when scrolled into view. */
  document.querySelectorAll('.team-card.reveal').forEach(el => {
    el.classList.add('is-visible');
  });

  const observedEls = document.querySelectorAll('.reveal:not(.team-card)');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observedEls.forEach(el => observer.observe(el));
  } else {
    observedEls.forEach(el => el.classList.add('is-visible'));
  }

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
