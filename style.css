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

  /* ---------- Team: all members visible on mobile, arrows as quick nav ----------
     Previously the team section used a one-card-at-a-time slider on
     mobile (translateX driven by measuring the grid's own width),
     which is why only one member ever showed up unless you happened
     to tap the tiny arrow buttons. That approach also depended on
     precise width math that could silently go wrong on real devices.

     Now, on mobile, every team member is simply stacked in a normal
     vertical list (see the .team-grid rule in style.css) — nothing is
     hidden, so all four members are always visible/complete, same as
     on desktop. The ‹ / › arrow buttons are kept fully clickable: they
     still work, they just smooth-scroll up/down from the member
     closest to view to the next/previous one, instead of sliding a
     track. This is simpler and can't silently break like the old
     width-measuring version could. */
  const teamWrap = document.getElementById('teamCarouselWrap');
  const teamGrid = document.getElementById('teamGrid');
  const teamPrevBtn = teamWrap ? teamWrap.querySelector('.arrow-prev') : null;
  const teamNextBtn = teamWrap ? teamWrap.querySelector('.arrow-next') : null;

  function teamCards() {
    return teamGrid ? Array.from(teamGrid.querySelectorAll('.team-card')) : [];
  }

  function isMobileTeam() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function scrollToTeamCard(i) {
    const cards = teamCards();
    if (!cards.length) return;
    const index = Math.max(0, Math.min(cards.length - 1, i));
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Finds whichever card is currently nearest the top of the viewport,
  // so tapping an arrow always moves relative to what the visitor is
  // actually looking at right now (not a stale stored index).
  function currentTeamIndex() {
    const cards = teamCards();
    if (!cards.length) return 0;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().top - 100);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  if (teamPrevBtn) {
    teamPrevBtn.addEventListener('click', () => {
      if (!isMobileTeam()) return;
      scrollToTeamCard(currentTeamIndex() - 1);
    });
  }
  if (teamNextBtn) {
    teamNextBtn.addEventListener('click', () => {
      if (!isMobileTeam()) return;
      scrollToTeamCard(currentTeamIndex() + 1);
    });
  }

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
