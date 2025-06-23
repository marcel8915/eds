import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Toggles the menu open and closed
 * @param {Element} header The header element
 * @param {boolean} forceClose Whether to force the menu to close
 */
function toggleMenu(header, forceClose = false) {
  const hamburger = header.querySelector('.hamburger-react');
  const navMenu = header.querySelector('.nav-menu');
  const body = document.body;
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';

  if (forceClose || isOpen) {
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
    body.classList.remove('nav-open');
  } else {
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.setAttribute('aria-hidden', 'false');
    body.classList.add('nav-open');
  }
}

/**
 * Toggles the language selector dropdown
 * @param {Element} langSelector The language selector element
 */
function toggleLanguageSelector(langSelector) {
    const isOpen = langSelector.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
        langSelector.setAttribute('aria-expanded', 'false');
    } else {
        langSelector.setAttribute('aria-expanded', 'true');
    }
}


/**
 * Decorates the header with content and functionality.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.innerHTML = ''; // Clear the existing content

  // Fetch the navigation fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);
console.log(fragment)
  // --- 1. Build the basic structure ---
  const nav = document.createElement('nav');
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
  const navLogo = nav.querySelector('.nav-logo a');
  const navReserve = nav.querySelector('.nav-reserve');
  const mainLinks = nav.querySelector('.main-links');
  const languageOptions = nav.querySelector('.language-options');
  const externalLink = nav.querySelector('.external-link');
  const socialLinks = nav.querySelector('.social-links');

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

  const reserveBtn = fragment.querySelector('.button-container a');
  if (reserveBtn) {
    reserveBtn.className = 'reserve-button';
    navReserve.append(reserveBtn);
  }

  // There are 3 lists in the nav fragment
  const lists = fragment.querySelector('.highlight ul');
  console.log(lists)
  if (lists) { // Second list is languages
      lists.querySelectorAll('li').forEach(li => {
          const lang = li.textContent.trim().toLowerCase();
          const button = document.createElement('button');
          button.innerHTML = `${li.innerHTML}`;
          // Set current language on the main button
          if (lang === 'en') { // Simple check, could be based on URL
              nav.querySelector('.language-selector span').innerHTML = li.innerHTML;
          }
          languageOptions.append(button);
      });
  }
  
  // Third list can contain external and social links
  if (lists.length > 2) { 
    lists[2].querySelectorAll('li').forEach(li => {
        const a = li.querySelector('a');
        if (a) {
            const href = a.getAttribute('href');
            if (href.includes('linkedin') || href.includes('instagram')) {
                const domain = new URL(href).hostname.replace('www.', '').split('.')[0];
                a.innerHTML = `<img src="/icons/${domain}.svg" alt="${domain}" />`;
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
                socialLinks.append(a);
            } else {
                a.innerHTML += `<div class="exit-icon"></div>`;
                externalLink.append(a);
            }
        }
    });
  }


  // --- 3. Add event listeners and behaviors ---
  const header = block.closest('.header-wrapper');

  // Scroll listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });

  // Menu toggle
  const hamburger = nav.querySelector('.hamburger-react');
  const menuTextButton = nav.querySelector('.menu-text-button');
  hamburger.addEventListener('click', () => toggleMenu(header));
  menuTextButton.addEventListener('click', () => toggleMenu(header));

  // Language selector toggle
  const langSelector = nav.querySelector('.language-selector');
  langSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLanguageSelector(langSelector);
  });

  // Close language selector when clicking outside
  document.addEventListener('click', () => {
    if(langSelector.getAttribute('aria-expanded') === 'true') {
        langSelector.setAttribute('aria-expanded', 'false');
    }
  });

  block.append(nav);
}
