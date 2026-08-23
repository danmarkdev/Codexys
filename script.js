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

  /* ---------- Horizontal swipe: custom drag + momentum (mobile only) ----------
     REWRITE: the previous version relied entirely on the browser's own
     native scroll-snap (overflow-x:auto + scroll-snap-type). That's a
     fundamentally different mechanism from the free-following drag +
     momentum-glide swipe used elsewhere on this developer's own
     portfolio site, so no amount of tuning the native version could
     make it feel the same — it needed to be replaced, not adjusted.

     This tracks the pointer 1:1 while dragging (via a CSS transform,
     not native scrollLeft), carries real velocity into a momentum
     glide on release, then settles onto whichever card is nearest.
     Unlike a looping marquee this is bounded — it can't be dragged
     past the first or last card. Mobile-only: on desktop it's a
     disabled no-op and the normal CSS grid layout applies untouched.
     Applied to all three carousels: About, Services, Team. */
  function initTouchCarousel(grid, cardSelector) {
    if (!grid) return;

    const MOBILE_QUERY = '(max-width: 768px)';
    function isMobile() { return window.matchMedia(MOBILE_QUERY).matches; }

    let pos = 0;            // current offset in px (0 = first card)
    let pageWidth = 0;      // width of one card "page"
    let maxPos = 0;         // pos at the last card
    let dragging = false;
    let moved = false;      // did this touch/drag actually move (vs. a tap)
    let startX = 0;
    let startPos = 0;
    let activePointerId = null;

    let lastMoveTime = 0;
    let lastMovePos = 0;
    let velocity = 0;       // px/sec, carried into momentum on release
    const MAX_VELOCITY = 4200;
    const FRICTION = 3.2;   // higher = stops sooner
    let rafId = null;

    function cardCount() { return grid.querySelectorAll(cardSelector).length; }

    function measure() {
      pageWidth = grid.clientWidth;
      maxPos = Math.max(0, (cardCount() - 1) * pageWidth);
    }

    function clampPos(v) { return Math.max(0, Math.min(maxPos, v)); }

    function render(withTransition) {
      grid.style.transition = withTransition
        ? 'transform .35s cubic-bezier(.22,.61,.36,1)'
        : 'none';
      grid.style.transform = 'translateX(' + (-pos) + 'px)';
    }

    function resetForDesktop() {
      grid.style.transform = '';
      grid.style.transition = '';
      pos = 0;
    }

    function currentIndex() {
      return pageWidth > 0 ? Math.round(pos / pageWidth) : 0;
    }

    function snapToNearest() {
      const idx = Math.max(0, Math.min(cardCount() - 1, currentIndex()));
      pos = idx * pageWidth;
      render(true);
    }

    function stopMomentum() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function momentumGlide() {
      stopMomentum();
      let lastT = null;
      function tick(t) {
        if (lastT === null) lastT = t;
        const dt = (t - lastT) / 1000;
        lastT = t;

        pos += velocity * dt;
        velocity *= Math.pow(1 / (1 + FRICTION), dt);

        if (pos <= 0 || pos >= maxPos || Math.abs(velocity) < 60) {
          pos = clampPos(pos);
          snapToNearest();
          return;
        }
        render(false);
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function pointerDown(e) {
      if (!isMobile()) return;
      measure();
      stopMomentum();
      dragging = true;
      moved = false;
      startX = e.clientX;
      startPos = pos;
      lastMoveTime = performance.now();
      lastMovePos = pos;
      velocity = 0;
      activePointerId = e.pointerId;
      // NOTE: no setPointerCapture here yet — same reasoning as the
      // portfolio version: capturing on every pointerdown (even a plain
      // tap on a link) redirects that link's click away from itself.
      // Only capture once a real drag is confirmed, below.
    }

    function pointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 10) {
        moved = true;
        grid.classList.add('dragging');
        if (grid.setPointerCapture) {
          try { grid.setPointerCapture(activePointerId); } catch (err) {}
        }
      }
      if (moved) {
        pos = clampPos(startPos - dx);
        render(false);

        const now = performance.now();
        const dt = now - lastMoveTime;
        if (dt > 0) {
          const raw = (pos - lastMovePos) / dt * 1000; // px/sec
          velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, raw));
          lastMoveTime = now;
          lastMovePos = pos;
        }
      }
    }

    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      grid.classList.remove('dragging');
      if (moved && grid.releasePointerCapture) {
        try { grid.releasePointerCapture(activePointerId); } catch (err) {}
      }
      if (!moved) return; // plain tap — let the underlying click through untouched

      if (Math.abs(velocity) > 40) {
        momentumGlide();
      } else {
        snapToNearest();
      }
    }

    grid.addEventListener('pointerdown', pointerDown);
    grid.addEventListener('pointermove', pointerMove);
    grid.addEventListener('pointerup', pointerUp);
    grid.addEventListener('pointercancel', pointerUp);
    grid.addEventListener('pointerleave', () => { if (dragging) pointerUp(); });

    // A drag that actually moved shouldn't also fire the link/card
    // click underneath it once the finger lifts.
    grid.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    function handleResize() {
      stopMomentum();
      if (isMobile()) {
        const idx = pageWidth > 0 ? Math.max(0, Math.min(cardCount() - 1, currentIndex())) : 0;
        measure();
        pos = idx * pageWidth;
        render(false);
      } else {
        resetForDesktop();
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('load', handleResize);

    handleResize();
  }

  initTouchCarousel(document.querySelector('.about-grid'), '.info-card');
  initTouchCarousel(document.querySelector('.service-grid'), '.service-card');
  initTouchCarousel(document.getElementById('teamGrid'), '.team-card');

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


  /* ---------- Scroll reveal ----------
     FIX: cards inside the three swipeable carousels (.info-card,
     .service-card, .team-card) used to be gated behind the same
     scroll-triggered IntersectionObserver as everything else. That's
     fine for elements that only ever move via normal page scroll —
     but these cards are moved horizontally via a CSS `transform`
     from the swipe carousel above. Only the first card in each
     carousel starts inside the browser's viewport bounds; every card
     after it starts off-screen to the side, so the observer often
     never (or unreliably, especially on mobile) reports them as
     "intersecting" even after the user swipes them into view. Net
     result: cards 2+ could stay stuck at opacity:0 — the "disappearing
     content" bug (service/about/team cards vanishing on swipe).

     Fix: these are core content, not a decorative scroll flourish, so
     they're shown immediately instead of waiting on scroll detection.
     The scroll-fade is kept only for section headers/intros, which
     never get moved by the swipe carousel and so don't have this
     problem. */
  const carouselCardSelector = '.info-card.reveal, .service-card.reveal, .team-card.reveal';

  document.querySelectorAll(carouselCardSelector).forEach(el => {
    el.classList.add('is-visible');
  });

  const revealEls = document.querySelectorAll('.reveal:not(.info-card):not(.service-card):not(.team-card)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));

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
