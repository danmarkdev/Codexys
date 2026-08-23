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

  /* ---------- Team carousel: click-only, arrow-driven ----------
     Only one member card is shown at a time on mobile, and the only
     way to move between them is tapping the ‹ / › buttons — no touch
     dragging, no swipe gesture. Each click moves exactly one card
     width (measured from the actual rendered card, not guessed from
     the container), with a small transition for a smooth slide. */
  function initArrowCarousel(grid, cardSelector, prevBtn, nextBtn, onMove) {
    if (!grid) return;

    const MOBILE_QUERY = '(max-width: 768px)';
    function isMobile() { return window.matchMedia(MOBILE_QUERY).matches; }

    let index = 0;
    let pageWidth = 0;

    function cards() { return grid.querySelectorAll(cardSelector); }

    function measure() {
      const els = cards();
      if (els.length) {
        const cardWidth = els[0].getBoundingClientRect().width;
        const gapValue = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || '0') || 0;
        pageWidth = cardWidth + gapValue;
      } else {
        pageWidth = grid.clientWidth;
      }
    }

    function render(withTransition) {
      if (!isMobile()) {
        grid.style.transition = '';
        grid.style.transform = '';
        return;
      }
      grid.style.transition = withTransition
        ? 'transform .35s cubic-bezier(.22,.61,.36,1)'
        : 'none';
      grid.style.transform = 'translateX(' + (-index * pageWidth) + 'px)';
    }

    function updateArrowState() {
      const max = cards().length - 1;
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
    }

    function goTo(i) {
      const max = cards().length - 1;
      index = Math.max(0, Math.min(max, i));
      measure();
      render(true);
      updateArrowState();
      if (typeof onMove === 'function') onMove(index, isMobile());
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

    function handleResize() {
      if (!isMobile()) {
        index = 0;
      }
      measure();
      render(false);
      updateArrowState();
      if (typeof onMove === 'function') onMove(index, isMobile());
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('load', handleResize);

    handleResize();
  }

  /* ---------- Team carousel: keep arrows glued to the active photo ----------
     PREVIOUS APPROACH (removed): calculate the arrows' pixel "top"
     offset by measuring the active card's .member-photo with
     getBoundingClientRect() and writing an inline style.top. That
     math went stale easily — after scrolling, after web fonts
     finished loading, after any layout shift — leaving the arrows
     floating in the wrong spot, sometimes over a big blank gap above
     the actual card.

     NEW APPROACH: instead of computing coordinates, just physically
     move the two arrow buttons so they become children of the
     currently active card's .member-photo element. That element is
     already `position: relative`, and the arrows already have
     `position: absolute; top: 50%; transform: translateY(-50%)` in
     CSS — so plain CSS centers them correctly with zero JS math,
     and it can never drift out of sync with the visible card. */
  const teamWrap = document.getElementById('teamCarouselWrap');
  const teamGrid = document.getElementById('teamGrid');
  const teamPrevBtn = teamWrap ? teamWrap.querySelector('.arrow-prev') : null;
  const teamNextBtn = teamWrap ? teamWrap.querySelector('.arrow-next') : null;

  function placeTeamArrows(index, mobile) {
    if (!teamWrap || !teamGrid || !teamPrevBtn || !teamNextBtn) return;

    if (!mobile) {
      // Desktop: arrows are hidden by CSS anyway, just keep them
      // parked on the wrap so the DOM stays tidy.
      if (teamPrevBtn.parentElement !== teamWrap) teamWrap.insertBefore(teamPrevBtn, teamGrid);
      if (teamNextBtn.parentElement !== teamWrap) teamWrap.insertBefore(teamNextBtn, teamGrid);
      return;
    }

    const activeCard = teamGrid.querySelectorAll('.team-card')[index];
    const photo = activeCard ? activeCard.querySelector('.member-photo') : null;
    if (!photo) return;

    if (teamPrevBtn.parentElement !== photo) photo.appendChild(teamPrevBtn);
    if (teamNextBtn.parentElement !== photo) photo.appendChild(teamNextBtn);
  }

  initArrowCarousel(teamGrid, '.team-card', teamPrevBtn, teamNextBtn, placeTeamArrows);

  /* ---------- Scroll reveal ----------
     About and Services cards are plain, normally-flowing elements now
     (no more carousel transform), so the standard scroll-triggered
     fade-in works correctly for them without any special-casing.
     Team cards are still moved horizontally via a transform for the
     single-card mobile view, so — same reasoning as before — they're
     shown immediately instead of waiting on scroll-into-view
     detection, since that detection isn't reliable for elements moved
     by JS transform inside an overflow:hidden track. */
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
