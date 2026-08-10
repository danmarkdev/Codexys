/* =========================================================
   CODEXYS - MAIN JAVASCRIPT
   Web Development Agency
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     PRELOADER
     ========================================================= */

  (function preloader() {
    const preloaderEl = document.getElementById("preloader");
    const typedEl = document.getElementById("preloaderTyped");

    if (!preloaderEl) return;

    const text = "Accessing Codexys";

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function dismiss() {
      preloaderEl.classList.add("hidden");

      setTimeout(() => {
        if (preloaderEl && preloaderEl.parentNode) {
          preloaderEl.remove();
        }
      }, 600);
    }

    /* Reduced motion */
    if (prefersReduced || !typedEl) {
      if (typedEl) {
        typedEl.textContent = text;
      }

      setTimeout(dismiss, 1000);
      return;
    }

    /* Typing animation */
    let i = 0;

    function typePreloader() {
      typedEl.textContent = text.slice(0, i);
      i++;

      if (i <= text.length) {
        setTimeout(typePreloader, 80);
      } else {
        setTimeout(dismiss, 700);
      }
    }

    setTimeout(typePreloader, 250);
  })();


  /* =========================================================
     HERO SERVICE TYPING ANIMATION
     ========================================================= */

  (function cycleSubline() {
    const subEl = document.getElementById("typedSub");

    if (!subEl) return;

    const services = [
      "Website Development",
      "UI/UX Design",
      "Web Systems & Dashboards"
    ];

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Reduced motion */
    if (prefersReduced) {
      subEl.textContent = services[0];
      return;
    }

    let serviceIndex = 0;

    function typeService() {
      const currentService = services[serviceIndex];
      let letterIndex = 0;

      function typeWord() {
        subEl.textContent =
          currentService.slice(0, letterIndex);

        letterIndex++;

        if (letterIndex <= currentService.length) {
          setTimeout(typeWord, 55);
        } else {
          setTimeout(eraseWord, 1500);
        }
      }

      function eraseWord() {
        subEl.textContent =
          currentService.slice(0, letterIndex);

        letterIndex--;

        if (letterIndex >= 0) {
          setTimeout(eraseWord, 30);
        } else {
          serviceIndex =
            (serviceIndex + 1) % services.length;

          setTimeout(typeService, 350);
        }
      }

      typeWord();
    }

    setTimeout(typeService, 700);
  })();


  /* =========================================================
     SCROLL REVEAL
     ========================================================= */

  (function revealOnScroll() {
    const revealElements =
      document.querySelectorAll(".reveal");

    if (!revealElements.length) return;

    /* If browser doesn't support IntersectionObserver */
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.classList.add("in");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("in");

            observerInstance.unobserve(entry.target);
          }

        });

      },
      {
        threshold: 0.15
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  })();


  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  (function mobileNavigation() {

    const hamburger =
      document.getElementById("hamburgerBtn");

    const mobileMenu =
      document.getElementById("mobileMenu");

    if (!hamburger || !mobileMenu) return;


    function closeMenu() {

      hamburger.classList.remove("open");

      mobileMenu.classList.remove("open");

      hamburger.setAttribute(
        "aria-expanded",
        "false"
      );
    }


    function openMenu() {

      hamburger.classList.add("open");

      mobileMenu.classList.add("open");

      hamburger.setAttribute(
        "aria-expanded",
        "true"
      );
    }


    hamburger.addEventListener("click", () => {

      const isOpen =
        hamburger.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }

    });


    /* Close menu when clicking a navigation link */

    const menuLinks =
      mobileMenu.querySelectorAll("a");

    menuLinks.forEach((link) => {

      link.addEventListener("click", () => {
        closeMenu();
      });

    });


    /* Close menu when pressing Escape */

    document.addEventListener("keydown", (event) => {

      if (event.key === "Escape") {
        closeMenu();
      }

    });


    /* Close menu when clicking outside */

    document.addEventListener("click", (event) => {

      const clickedInsideMenu =
        mobileMenu.contains(event.target);

      const clickedButton =
        hamburger.contains(event.target);

      if (
        !clickedInsideMenu &&
        !clickedButton &&
        hamburger.classList.contains("open")
      ) {
        closeMenu();
      }

    });

  })();


  /* =========================================================
     DARK / LIGHT THEME TOGGLE
     ========================================================= */

  (function themeToggle() {

    const themeButton =
      document.getElementById("themeToggle");

    const root =
      document.documentElement;

    if (!themeButton) return;


    /* Load saved theme */

    let savedTheme = null;

    try {
      savedTheme =
        localStorage.getItem("codexys-theme");
    } catch (error) {
      savedTheme = null;
    }


    if (savedTheme === "light") {

      root.setAttribute(
        "data-theme",
        "light"
      );

    } else {

      root.removeAttribute("data-theme");

    }


    /* Toggle theme */

    themeButton.addEventListener("click", () => {

      const isLight =
        root.getAttribute("data-theme") === "light";


      if (isLight) {

        /* Change to dark */

        root.removeAttribute("data-theme");

        try {
          localStorage.setItem(
            "codexys-theme",
            "dark"
          );
        } catch (error) {
          /* Ignore localStorage errors */
        }

      } else {

        /* Change to light */

        root.setAttribute(
          "data-theme",
          "light"
        );

        try {
          localStorage.setItem(
            "codexys-theme",
            "light"
          );
        } catch (error) {
          /* Ignore localStorage errors */
        }

      }

    });

  })();


  /* =========================================================
     SMOOTH SCROLL
     ========================================================= */

  (function smoothScroll() {

    const links =
      document.querySelectorAll(
        'a[href^="#"]'
      );

    links.forEach((link) => {

      link.addEventListener("click", (event) => {

        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      });

    });

  })();


  /* =========================================================
     ACTIVE NAVIGATION LINK
     ========================================================= */

  (function activeNavigation() {

    const sections =
      document.querySelectorAll(
        "section[id]"
      );

    const navLinks =
      document.querySelectorAll(
        'nav a[href^="#"]'
      );

    if (
      !sections.length ||
      !navLinks.length
    ) {
      return;
    }


    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            const sectionId =
              entry.target.getAttribute("id");

            navLinks.forEach((link) => {

              link.classList.remove("active");

              if (
                link.getAttribute("href") ===
                "#" + sectionId
              ) {
                link.classList.add("active");
              }

            });

          });

        },
        {
          threshold: 0.35
        }
      );


    sections.forEach((section) => {
      observer.observe(section);
    });

  })();


  /* =========================================================
     CONTACT FORM
     ========================================================= */

  (function contactForm() {

    const form =
      document.querySelector(
        "#contactForm"
      );

    if (!form) return;


    form.addEventListener("submit", (event) => {

      event.preventDefault();


      const nameInput =
        form.querySelector(
          '[name="name"]'
        );

      const emailInput =
        form.querySelector(
          '[name="email"]'
        );

      const messageInput =
        form.querySelector(
          '[name="message"]'
        );


      const name =
        nameInput
          ? nameInput.value.trim()
          : "";

      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      const message =
        messageInput
          ? messageInput.value.trim()
          : "";


      /* Basic validation */

      if (!name) {

        alert("Please enter your name.");

        if (nameInput) {
          nameInput.focus();
        }

        return;
      }


      if (!email) {

        alert("Please enter your email.");

        if (emailInput) {
          emailInput.focus();
        }

        return;
      }


      if (!message) {

        alert("Please enter your message.");

        if (messageInput) {
          messageInput.focus();
        }

        return;
      }


      /*
        This does not send an email by itself.

        Connect this form to your preferred
        email service or backend when ready.
      */

      alert(
        "Thank you, " +
        name +
        "! Your message is ready to be sent to Codexys."
      );


      form.reset();

    });

  })();


  /* =========================================================
     HEADER SCROLL EFFECT
     ========================================================= */

  (function headerScroll() {

    const header =
      document.querySelector("header");

    if (!header) return;


    function updateHeader() {

      if (window.scrollY > 40) {

        header.classList.add(
          "scrolled"
        );

      } else {

        header.classList.remove(
          "scrolled"
        );

      }

    }


    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
    );


    updateHeader();

  })();


  /* =========================================================
     BUTTON RIPPLE EFFECT
     ========================================================= */

  (function buttonEffects() {

    const buttons =
      document.querySelectorAll(
        ".btn"
      );

    if (!buttons.length) return;


    buttons.forEach((button) => {

      button.addEventListener(
        "click",
        function (event) {

          const ripple =
            document.createElement(
              "span"
            );

          ripple.classList.add(
            "button-ripple"
          );


          const rect =
            button.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          ripple.style.left =
            x + "px";

          ripple.style.top =
            y + "px";


          button.appendChild(
            ripple
          );


          setTimeout(() => {

            ripple.remove();

          }, 600);

        }
      );

    });

  })();


  /* =========================================================
     LOGO / IMAGE FALLBACK
     ========================================================= */

  (function imageFallback() {

    const images =
      document.querySelectorAll(
        "img"
      );

    images.forEach((image) => {

      image.addEventListener(
        "error",
        () => {

          image.classList.add(
            "image-error"
          );

        }
      );

    });

  })();


  /* =========================================================
     CURRENT YEAR
     ========================================================= */

  (function currentYear() {

    const yearElements =
      document.querySelectorAll(
        "[data-current-year]"
      );

    if (!yearElements.length) return;


    const currentYear =
      new Date().getFullYear();


    yearElements.forEach((element) => {

      element.textContent =
        currentYear;

    });

  })();


  /* =========================================================
     CODEXYS CONSOLE MESSAGE
     ========================================================= */

  console.log(
    "%c CODEXYS ",
    "background: linear-gradient(90deg, #38d9ff, #6d5cff, #9b45ff); color: white; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
  );

  console.log(
    "Web Development • UI/UX Design • Web Systems & Dashboards"
  );

});
