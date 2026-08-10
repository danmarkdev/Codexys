 (function preloader(){
    const el = document.getElementById('preloader');
    const typed = document.getElementById('preloaderTyped');
    if (!el) return;
    const text = 'Accessing Codexys';
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function dismiss(){
      el.classList.add('hidden');
      setTimeout(() => el.remove(), 600);
    }

    if (prefersReduced || !typed) {
      if (typed) typed.textContent = text;
      setTimeout(dismiss, 1400);
      return;
    }

    let i = 0;
    function tick(){
      typed.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(tick, 110);
      } else {
        setTimeout(dismiss, 900);
      }
    }
    setTimeout(tick, 300);
  })();

  (function cycleSubline(){
    const subEl = document.getElementById('typedSub');
    if (!subEl) return;
    const services = ['Website Development', 'UI/UX Design', 'Web Systems & Dashboards'];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      subEl.textContent = services[0];
      return;
    }

    let svcIndex = 0;
    function cycleSub(){
      const word = services[svcIndex];
      let j = 0;
      function typeWord(){
        subEl.textContent = word.slice(0, j);
        j++;
        if (j <= word.length) {
          setTimeout(typeWord, 55);
        } else {
          setTimeout(eraseWord, 1400);
        }
      }
      function eraseWord(){
        subEl.textContent = word.slice(0, j);
        j--;
        if (j >= 0) {
          setTimeout(eraseWord, 30);
        } else {
          svcIndex = (svcIndex + 1) % services.length;
          setTimeout(cycleSub, 300);
        }
      }
      typeWord();
    }

    setTimeout(cycleSub, 500);
  })();

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // Mobile hamburger menu
  (function mobileNav(){
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    function closeMenu(){
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  })();

  // Dark / light theme toggle
  (function themeToggle(){
    const btn = document.getElementById('themeToggle');
    const root = document.documentElement;
    if (!btn) return;
    let saved = null;
    try { saved = localStorage.getItem('codexys-theme'); } catch(e){}
    if (saved === 'light') root.setAttribute('data-theme', 'light');
    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('codexys-theme', 'dark'); } catch(e){}
      } else {
        root.setAttribute('data-theme', 'light');
        try { localStorage.setItem('codexys-theme', 'light'); } catch(e){}
      }
    });
  })();
