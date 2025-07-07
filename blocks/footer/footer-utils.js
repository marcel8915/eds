/**
 * Processes the contact section data and formats it properly
 * @param {HTMLElement} contactWrapper The contact section wrapper
 * @returns {string} Formatted HTML string
 */
export function processContactSection(contactWrapper) {
  const children = Array.from(contactWrapper.children);
  let contactHTML = "";

  for (let i = 0; i < children.length; i += 2) {
    const heading = children[i];
    const linkContainer = children[i + 1];

    if (
      heading &&
      linkContainer &&
      heading.tagName === "P" &&
      linkContainer.classList.contains("button-container")
    ) {
      const headingText = heading.textContent.trim();
      const link = linkContainer.querySelector("a");

      if (link) {
        const href = link.getAttribute("href");
        const linkText = link.textContent.trim();

        contactHTML += `
          <div class="footer-contact-column">
            <p class="footer-heading text-l3 text-text-black-700">${headingText}</p>
            <a target="_blank" href="${href}">
              <p class="footer-link animate-underline text-p2">${linkText}</p>
            </a>
          </div>`;
      }
    }
  }

  return contactHTML;
}

/**
 * Processes the links section data and formats it into columns for the footer
 * @param {HTMLElement} linksWrapper The links section wrapper
 * @returns {string} Formatted HTML string for all columns
 */
export function processFooterLinksSection(linksWrapper) {
  const children = Array.from(linksWrapper.children);
  const columns = [];
  let currentHeading = null;
  let currentLinks = [];

  // Helper to push a column if valid
  function pushColumn() {
    if (currentHeading && currentLinks.length) {
      columns.push({ heading: currentHeading, links: currentLinks });
    }
    currentHeading = null;
    currentLinks = [];
  }

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.tagName === "P" && !el.classList.contains("button-container")) {
      // New heading found
      pushColumn();
      currentHeading = el.textContent.trim();
    } else if (el.classList.contains("button-container")) {
      const link = el.querySelector("a");
      if (link && link.textContent.trim()) {
        currentLinks.push({
          href: link.getAttribute("href"),
          text: link.textContent.trim(),
        });
      }
    }
  }
  pushColumn(); // Push last column

  // Now build the HTML for each column
  return columns
    .map(({ heading, links }) => {
      const desktopLinks = links
        .map(
          (l) =>
            `<a target="_blank" href="${l.href}"><p class="footer-link animate-underline text-p2">${l.text}</p></a>`
        )
        .join("");
      const mobileLinks = links
        .map(
          (l) =>
            `<a target="_blank" href="${l.href}"><p class="footer-link text-p2">${l.text}</p></a>`
        )
        .join("");
      return `
        <div class="footer-links-column">
          <div class="footer-desktop-links">
            <p class="footer-heading-subtle text-l3 text-text-black-700 ">${heading}</p>
            ${desktopLinks}
          </div>
          <div class="footer-mobile-accordion">
            <button class="accordion-trigger" aria-expanded="false"><p class="text-text-black-700 text-l3">${heading}</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
            <div class="accordion-content" hidden>
              <div class="accordion-inner">
                ${mobileLinks}
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Processes the legal links section and formats it for the footer
 * @param {HTMLElement} legalsWrapper The legal links section wrapper
 * @returns {string} Formatted HTML string for legal links
 */
export function processFooterLegalLinksSection(legalsWrapper) {
  const children = Array.from(legalsWrapper.children);
  return children
    .map((el) => {
      if (el.classList.contains("button-container")) {
        const link = el.querySelector("a");
        if (link && link.textContent.trim()) {
          const href = link.getAttribute("href");
          const text = link.textContent.trim();
          return `<a target="_blank" href="${href}"><p class="footer-link-subtle text-l2 animate-underline text-text-grey">${text}</p></a>`;
        }
      }
      return "";
    })
    .join("");
}

/**
 * Processes the socials section and formats it for the footer
 * @param {HTMLElement} socialsWrapper The socials section wrapper
 * @returns {string} Formatted HTML string for social icons
 */
export function processFooterSocialsSection(socialsWrapper) {
  const children = Array.from(socialsWrapper.children);
  return children
    .map((el) => {
      if (el.classList.contains("button-container")) {
        const link = el.querySelector("a");
        if (link && link.textContent.trim()) {
          const href = link.getAttribute("href");
          let html = "";
          if (href.includes("linkedin") || href.includes("instagram")) {
            const domain = new URL(href, window.location.origin).hostname
              .replace("www.", "")
              .split(".")[0];
            html = `<img src="/icons/${domain}.svg" alt="${domain}" />`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`;
          } else {
            html = `${link.textContent.trim()}<div class="exit-icon"></div>`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`;
          }
        }
      }
      return "";
    })
    .join("");
}
