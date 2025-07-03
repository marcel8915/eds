import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

function toggleMenu(header, forceClose = false) {
  const hamburger = header.querySelector(".hamburger-react");
  const navMenu = header.querySelector(".nav-menu");
  const body = document.body;
  const isOpen = hamburger.getAttribute("aria-expanded") === "true";
  if (forceClose || isOpen) {
    hamburger.setAttribute("aria-expanded", "false");
    navMenu.setAttribute("aria-hidden", "true");
    body.classList.remove("nav-open");
  } else {
    hamburger.setAttribute("aria-expanded", "true");
    navMenu.setAttribute("aria-hidden", "false");
    body.classList.add("nav-open");
  }
}

function toggleLanguageSelector(langSelector) {
  const isOpen = langSelector.getAttribute("aria-expanded") === "true";
  langSelector.setAttribute("aria-expanded", isOpen ? "false" : "true");
  // Add: set lang on html when a language is selected
  const options = langSelector.parentElement.querySelectorAll(
    ".language-options button"
  );
  options.forEach((btn) => {
    btn.onclick = function () {
      const lang = btn.dataset.lang || btn.textContent.trim().toLowerCase();
      document.documentElement.setAttribute("lang", lang);

      // Remove .selected from all buttons, then add to the clicked one
      options.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      langSelector.setAttribute("aria-expanded", "false");
      langSelector.querySelector("span").textContent = btn.textContent.trim();
    };
  });
}

export default async function decorate(block) {
  block.innerHTML = "";
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta).pathname : "/nav";
  const fragment = await loadFragment(navPath);
  const nav = document.createElement("nav");
  nav.innerHTML = `
    <section class="navbar">
      <div class="nav-hamburger">
        <div class="hamburger-react" aria-expanded="false" role="button" tabindex="0">
          <div></div><div></div><div></div>
        </div>
        <button class="menu-text-button secondary"><span>Menu</span></button>
      </div>
      <div class="nav-logo">
        <a href="/">
          <img src="/icons/patina-white-flower.svg" class="white" alt="Patina Logo" />
          <img src="/icons/patina-green-flower.svg" class="green" alt="Patina Logo" />
        </a>
      </div>
      <div class="nav-logo-text">
        <img src="/icons/patina-white-text.svg" alt="Patina" />
      </div>
      <div class="nav-controls">
        <div class="nav-language">
          <button class="language-selector secondary" aria-expanded="false">
            <span>en</span>
            <div class="language-icon"><div class="language-icon-down"></div></div>
          </button>
          <div class="language-options"></div>
        </div>
        <div class="nav-reserve"></div>
      </div>
    </section>
    <section class="nav-menu" aria-hidden="true">
      <div class="nav-menu-content">
        <div class="main-links"></div>
        <section class="bottom-links">
          <div class="external-link"></div>
          <div class="social-links"></div>
        </section>
      </div>
    </section>
  `;

  // --- Populate structure ---
  const langSelector = nav.querySelector(".language-selector");
  const navLogo = nav.querySelector(".nav-logo a");
  const navReserve = nav.querySelector(".nav-reserve");
  const mainLinks = nav.querySelector(".main-links");
  const languageOptions = nav.querySelector(".language-options");
  const externalLink = nav.querySelector(".external-link");
  const socialLinks = nav.querySelector(".social-links");

  // Reserve button
  const reserveBtn = fragment.querySelector(".button-container a");
  if (reserveBtn) {
    reserveBtn.className = "reserve-button";
    navReserve.append(reserveBtn);
  }

  // Main and language links
  const lists2 = fragment.querySelectorAll("ul");
  if (lists2.length > 0) mainLinks.append(lists2[0]);
  const lists = fragment.querySelector(".highlight ul");
  if (lists) {
    lists.querySelectorAll("li").forEach((li) => {
      // Expect format: "Display Name | code"
      const [display, code] = li.textContent.split("|").map((s) => s.trim());
      const button = document.createElement("button");
      button.className = "text-b animate-underline";
      button.innerHTML = display;
      button.dataset.lang = code || display.toLowerCase(); // fallback to display if no code
      if (code === "en") {
        nav.querySelector(".language-selector span").innerHTML = display;
        button.classList.add("selected"); // Add selected class by default for English
      }
      languageOptions.append(button);
    });
  }

  // External and social links
  if (lists && lists.length > 2) {
    lists[2].querySelectorAll("li").forEach((li) => {
      const a = li.querySelector("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href.includes("linkedin") || href.includes("instagram")) {
        const domain = new URL(href).hostname.replace("www.", "").split(".")[0];
        a.innerHTML = `<img src="/icons/${domain}.svg" alt="${domain}" />`;
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
        socialLinks.append(a);
      } else {
        a.innerHTML += `<div class="exit-icon"></div>`;
        externalLink.append(a);
      }
    });
  }

  // --- Event listeners and scroll behavior ---
  const header = block.closest(".header-wrapper");
  const navLogoText = nav.querySelector(".nav-logo-text");
  const navLogoWhite = nav.querySelector(".nav-logo .white");
  const navLogoGreen = nav.querySelector(".nav-logo .green");
  const hasHero = !!document.querySelector(".hero-container");
  let lastScrollY = window.scrollY;
  let ticking = false;
  let navHidden = false;

  function setHeaderBackground(scrolled) {
    if (scrolled) {
      header.style.backgroundColor = "white";
      header.classList.add("is-scrolled");
      // Add .is-scrolled to language selector
      langSelector.classList.add("is-scrolled");
    } else {
      header.style.backgroundColor = "";
      header.classList.remove("is-scrolled");
      // Remove .is-scrolled from language selector
      langSelector.classList.remove("is-scrolled");
    }
  }

  function updateLogoTextOpacity(scrollY, vh, hasHero) {
    if (!navLogoText) return;
    let opacity = 1;
    if (scrollY < vh && hasHero) {
      opacity = 1 - Math.min(scrollY / (vh * 0.2), 1);
    } else {
      opacity = 0;
    }
    navLogoText.style.opacity = opacity;
  }

  function updateLogoColor(scrollY, vh, hasHero) {
    if (!navLogoWhite || !navLogoGreen) return;
    if (!hasHero || scrollY > vh) {
      navLogoWhite.style.opacity = 0;
      navLogoGreen.style.opacity = 1;
    } else {
      navLogoWhite.style.opacity = 1;
      navLogoGreen.style.opacity = 0;
    }
  }

  updateLogoColor(window.scrollY, window.innerHeight, hasHero);

  function updateHeaderSlide(scrollY, vh, hasHero) {
    if ((hasHero && scrollY > vh) || !hasHero) {
      setHeaderBackground(true);
      const delta = scrollY - lastScrollY;
      if (delta > 0 && !navHidden) {
        header.style.transform = "translateY(-100%)";
        navHidden = true;
      } else if (delta < 0 && navHidden) {
        header.style.transform = "translateY(0)";
        navHidden = false;
      }
    } else {
      setHeaderBackground(false);
      header.style.transform = "translateY(0)";
      navHidden = false;
    }
  }

  updateHeaderSlide(window.scrollY, window.innerHeight, hasHero);

  function handleScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    updateLogoTextOpacity(scrollY, vh, hasHero);
    updateLogoColor(scrollY, vh, hasHero);
    updateHeaderSlide(scrollY, vh, hasHero);
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Menu toggle
  const hamburger = nav.querySelector(".hamburger-react");
  const menuTextButton = nav.querySelector(".menu-text-button");
  hamburger.addEventListener("click", () => toggleMenu(header));
  menuTextButton.addEventListener("click", () => toggleMenu(header));

  // Language selector toggle

  langSelector.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleLanguageSelector(langSelector);
  });

  // Close language selector when clicking outside
  document.addEventListener("click", () => {
    if (langSelector.getAttribute("aria-expanded") === "true") {
      langSelector.setAttribute("aria-expanded", "false");
    }
  });

  block.append(nav);
}
