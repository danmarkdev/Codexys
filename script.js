/* =========================================================
   CODEXYS - JAVASCRIPT
   ========================================================= */

/* PRELOADER */
(function preloader() {
  const el = document.getElementById("preloader");
  const typed = document.getElementById("preloaderTyped");

  if (!el) return;

  const text = "Accessing Codexys";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function dismiss() {
    el.classList.add("hidden");

    setTimeout(function () {
      if (el) el.remove();
    }, 600);
  }

  if (prefersReduced || !typed) {
    if (typed) {
      typed.textContent = text;
    }

    setTimeout(dismiss, 900);
    return;
  }

  let i = 0;

  function tick() {
    typed.textContent = text.slice(0, i);
    i++;

    if (i <= text.length) {
      setTimeout(tick, 80);
    } else {
      setTimeout(dismiss, 700);
    }
  }

  setTimeout(tick, 250);
})();


/* HERO TYPING */
(function cycleSubline() {
  const subEl = document.getElementById("typedSub");

  if (!subEl) return;

  const services = [
    "Website Development",
    "UI/UX Design",
    "Web Systems & Dashboards"
  ];

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReduced) {
    subEl.textContent = services[0];
    return;
  }

  let serviceIndex = 0;

  function cycleSub() {
    const word = services[serviceIndex];
    let j = 0;

    function typeWord() {
      subEl.textContent = word.slice(0, j);
      j++;

      if (j <= word.length) {
        setTimeout(typeWord, 55);
      } else {
        setTimeout(eraseWord, 1400);
      }
    }

    function eraseWord() {
      j--;
      subEl.textContent = word.slice(0, j);

      if (j > 0) {
        setTimeout(eraseWord, 30);
      } else {
        serviceIndex =
          (serviceIndex + 1) % services.length;

        setTimeout(cycleSub, 300);
      }
    }

    typeWord();
  }

  setTimeout(cycleSub, 500);
})();


/* SCROLL REVEAL */
(function revealOnScroll() {
  const revealEls =
    document.querySelectorAll(".reveal");

  if (!revealEls.length) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    prefersReduced ||
    !("IntersectionObserver" in window)
  ) {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });

    return;
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealEls.forEach(function (el) {
    io.observe(el);
  });
})();


/* MOBILE NAVIGATION */
(function mobileNav() {
  const btn =
    document.getElementById("hamburgerBtn");

  const menu =
    document.getElementById("mobileMenu");

  if (!btn || !menu) return;

  function closeMenu() {
    btn.classList.remove("open");
    menu.classList.remove("open");

    btn.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove(
      "menu-open"
    );
  }

  btn.addEventListener("click", function () {
    const isOpen =
      !menu.classList.contains("open");

    btn.classList.toggle("open", isOpen);
    menu.classList.toggle("open", isOpen);

    btn.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    document.body.classList.toggle(
      "menu-open",
      isOpen
    );
  });

  menu.querySelectorAll("a").forEach(
    function (link) {
      link.addEventListener(
        "click",
        closeMenu
      );
    }
  );

  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    }
  );
})();


/* DARK / LIGHT MODE */
(function themeToggle() {
  const btn =
    document.getElementById("themeToggle");

  const root = document.documentElement;

  if (!btn) return;

  let saved = null;

  try {
    saved =
      localStorage.getItem(
        "codexys-theme"
      );
  } catch (error) {
    saved = null;
  }

  if (saved === "light") {
    root.setAttribute(
      "data-theme",
      "light"
    );
  }

  btn.addEventListener(
    "click",
    function () {
      const isLight =
        root.getAttribute(
          "data-theme"
        ) === "light";

      if (isLight) {
        root.removeAttribute(
          "data-theme"
        );

        try {
          localStorage.setItem(
            "codexys-theme",
            "dark"
          );
        } catch (error) {}
      } else {
        root.setAttribute(
          "data-theme",
          "light"
        );

        try {
          localStorage.setItem(
            "codexys-theme",
            "light"
          );
        } catch (error) {}
      }
    }
  );
})();


/* CONTACT FORM */
(function contactForm() {
  const form =
    document.getElementById(
      "contactForm"
    );

  const status =
    document.getElementById(
      "formStatus"
    );

  if (!form || !status) return;

  form.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      status.textContent =
        "Your message is ready. Connect this form to your email service or backend to send it.";

      form.reset();
    }
  );
})();
