import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

/**
 * Toggles the menu open and closed
 * @param {Element} header The header element
 * @param {boolean} forceClose Whether to force the menu to close
 */
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

/**
 * Toggles the language selector dropdown
 * @param {Element} langSelector The language selector element
 */
function toggleLanguageSelector(langSelector) {
  const isOpen = langSelector.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    langSelector.setAttribute("aria-expanded", "false");
  } else {
    langSelector.setAttribute("aria-expanded", "true");
  }
}

/**
 * Decorates the header with content and functionality.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.innerHTML = ""; // Clear the existing content

  // Fetch the navigation fragment
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta).pathname : "/nav";
  const fragment = await loadFragment(navPath);
  console.log("fragment", fragment);
  // --- 1. Build the basic structure ---
  const nav = document.createElement("nav");
  nav.innerHTML = `
    <section class="navbar">  
        <!-- Menu Button + Hamburger -->
        <div class="nav-hamburger">
            <div class="hamburger-react" aria-expanded="false" role="button" tabindex="0">
                <div></div>
                <div></div>
                <div></div>
            </div>
            <button class="menu-text-button secondary"><span>Menu</span></button>
        </div>

        <!-- Logo -->
        <div class="nav-logo">
            <a href="/">
              <img src="/icons/patina-white-flower.svg" class="white" alt="Patina Logo" />
              <img src="/icons/patina-green-flower.svg" class="green" alt="Patina Logo" />
            </a>

        </div>
        <div class="nav-logo-text">
             <img src="/icons/patina-white-text.svg" alt="Patina" />
        </div>

        <!-- Right Side Controls -->
        <div class="nav-controls">
            <div class="nav-language">
                <button class="language-selector secondary" aria-expanded="false">
                    <span>en</span>
                    <div class="language-icon">
                      <div class="language-icon-down"></div>
                    </div>
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

  // --- 2. Populate the structure with fetched content ---
  const navLogo = nav.querySelector(".nav-logo a");
  const navReserve = nav.querySelector(".nav-reserve");
  const mainLinks = nav.querySelector(".main-links");
  const languageOptions = nav.querySelector(".language-options");
  const externalLink = nav.querySelector(".external-link");
  const socialLinks = nav.querySelector(".social-links");

  // Find content based on the authoring structure
  // const logoImg = fragment.querySelector('p > picture');
  // if (logoImg) {
  //   // Create the dual-logo structure
  //   const greenFlower = logoImg.cloneNode(true).querySelector('img');
  //   const whiteFlower = logoImg.querySelector('img');

  //   greenFlower.src = greenFlower.src.replace('white-flower', 'green-flower');
  //   greenFlower.classList.add('green-flower');
  //   whiteFlower.classList.add('white-flower');

  //   navLogo.innerHTML = `
  //       <div class="logo-container">
  //           ${whiteFlower.outerHTML}
  //           ${greenFlower.outerHTML}
  //       </div>
  //   `;
  // }

  const reserveBtn = fragment.querySelector(".button-container a");
  if (reserveBtn) {
    reserveBtn.className = "reserve-button";
    navReserve.append(reserveBtn);
  }

  // There are 3 lists in the nav fragment
  const lists2 = fragment.querySelectorAll("ul");
  if (lists2.length > 0) mainLinks.append(lists2[0]);
  const lists = fragment.querySelector(".highlight ul");
  console.log(lists);
  if (lists) {
    // Second list is languages
    lists.querySelectorAll("li").forEach((li) => {
      const lang = li.textContent.trim().toLowerCase();
      const button = document.createElement("button");
      button.innerHTML = `${li.innerHTML}`;
      // Set current language on the main button
      if (lang === "en") {
        // Simple check, could be based on URL
        nav.querySelector(".language-selector span").innerHTML = li.innerHTML;
      }
      languageOptions.append(button);
    });
  }

  // Third list can contain external and social links
  if (lists.length > 2) {
    lists[2].querySelectorAll("li").forEach((li) => {
      const a = li.querySelector("a");
      if (a) {
        const href = a.getAttribute("href");
        if (href.includes("linkedin") || href.includes("instagram")) {
          const domain = new URL(href).hostname
            .replace("www.", "")
            .split(".")[0];
          a.innerHTML = `<img src="/icons/${domain}.svg" alt="${domain}" />`;
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          socialLinks.append(a);
        } else {
          a.innerHTML += `<div class="exit-icon"></div>`;
          externalLink.append(a);
        }
      }
    });
  }

  // --- 3. Add event listeners and behaviors ---
  const header = block.closest(".header-wrapper");
  const navLogoText = nav.querySelector(".nav-logo-text");
  const navLogoWhite = nav.querySelector(".nav-logo .white");
  const navLogoGreen = nav.querySelector(".nav-logo .green");
  const hasHero = !!document.querySelector(".hero-container");
  console.log(hasHero);
  let lastScrollY = window.scrollY;
  let ticking = false;
  let navHidden = false;

  function handleScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    // Fade out nav-logo-text as you scroll down from top (0 to 1vh)
    if (navLogoText) {
      let opacity = 1;
      if (scrollY < vh && hasHero) {
        opacity = 1 - Math.min(scrollY / (vh * 0.2), 1); // fade out faster in first 50vh
      } else {
        opacity = 0;
      }
      navLogoText.style.opacity = opacity;
    }
    // Logo swap after 100vh or if no hero
    if (navLogoWhite && navLogoGreen) {
      if (!hasHero || scrollY > vh) {
        navLogoWhite.style.opacity = 0;
        navLogoGreen.style.opacity = 1;
      } else {
        navLogoWhite.style.opacity = 1;
        navLogoGreen.style.opacity = 0;
      }
    }
    // Header slide up/down: after 100vh if hero, always if no hero
    if ((hasHero && scrollY > vh) || !hasHero) {
      header.style.backgroundColor = 'white';
      header.classList.add('is-scrolled');
      const delta = scrollY - lastScrollY;
      if (delta > 0 && !navHidden) {
        // Scrolling down (any amount)
        header.style.transform = "translateY(-100%)";
        navHidden = true;
      } else if (delta < 0 && navHidden) {
        // Scrolling up (any amount)
        header.style.transform = "translateY(0)";
        navHidden = false;
      }
    } else {
      // Before 100vh (if hero), always show header (with is-scrolled styles)
      header.style.backgroundColor = '';
      header.classList.remove('is-scrolled');
      header.style.transform = "translateY(0)";
      navHidden = false;
    }
    // Add/remove is-scrolled (handled above for slide logic)
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
  const langSelector = nav.querySelector(".language-selector");
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
