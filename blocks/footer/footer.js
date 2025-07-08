import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";
import {
  processContactSection,
  processFooterLinksSection,
  processFooterLegalLinksSection,
  processFooterSocialsSection,
} from "./footer-utils.js";

/**
 * Toggles an accordion panel open or closed using GSAP for smooth animation.
 * @param {HTMLElement} button The button that controls the accordion panel.
 */
function toggleAccordion(button) {
  const isOpen = button.getAttribute("aria-expanded") === "true";
  let toOpen = null;
  let toOpenIcon = null;

  // Close all accordions concurrently with GSAP (animate from current height to 0)
  document.querySelectorAll(".accordion-trigger").forEach((otherButton) => {
    const otherContent = otherButton.nextElementSibling;
    otherButton.setAttribute("aria-expanded", "false");
    if (otherContent && otherContent.classList.contains("accordion-content")) {
      otherContent.classList.remove("open");
      // Animate close from current height to 0
      const currentHeight = otherContent.scrollHeight;
      otherContent.style.overflow = "hidden";
      otherContent.style.height = currentHeight + "px";
      gsap.to(otherContent, {
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          otherContent.style.removeProperty("height");
          otherContent.style.removeProperty("overflow");
        },
      });
    }
    otherButton.querySelector("svg").classList.remove("is-open");
    if (otherButton === button && !isOpen) {
      toOpen = otherContent;
      toOpenIcon = otherButton.querySelector("svg");
    }
  });

  // Open the clicked one after all others are closed
  if (toOpen) {
    button.setAttribute("aria-expanded", "true");
    toOpen.classList.add("open");
    // Animate open with GSAP
    toOpen.style.overflow = "hidden";
    toOpen.style.height = "0px";
    // Use a child wrapper for spacing
    const inner = toOpen.querySelector(".accordion-inner");
    let targetHeight = 0;
    if (inner) {
      targetHeight = inner.scrollHeight;
    } else {
      targetHeight = toOpen.scrollHeight;
    }
    gsap.to(toOpen, {
      height: targetHeight,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        toOpen.style.removeProperty("height");
        toOpen.style.removeProperty("overflow");
      },
    });
    toOpenIcon.classList.add("is-open");
  }
}

/**
 * Decorates the footer.
 * @param {HTMLElement} block The footer block element.
 */
export default async function decorate(block) {
  const navMeta = getMetadata("footer");
  const navPath = navMeta ? new URL(navMeta).pathname : "/footer";
  const fragment = await loadFragment(navPath);
  const sections = fragment.children;
  const [
    contactSection,
    linksSection,
    copyrightSection,
    socialsSection,
    legalsSection,
  ] = sections;

  block.textContent = ""; // Clear existing content

  // Process contact section data
  const processedContactHTML = processContactSection(
    contactSection.children[0]
  );
  // Process links section data
  const processedLinksHTML = processFooterLinksSection(
    linksSection.children[0]
  );
  // Process legal links section data
  const processedLegalLinksHTML = processFooterLegalLinksSection(
    legalsSection.children[0]
  );
  // Process social icons section data
  const processedSocialsHTML = processFooterSocialsSection(
    socialsSection.children[0]
  );

  const footerHTML = `
    <div class="footer-content">
      <section class="footer-section footer-contact">
        <div class="footer-contact-wrapper">
          ${processedContactHTML}
        </div>
      </section>

      <section class="footer-section footer-links">
        <div class="footer-links-wrapper">
          ${processedLinksHTML}
        </div>
      </section>

      <section class="footer-section footer-legal">
        <div class="footer-legal-top">
          <p class="footer-copyright text-l3 text-text-black-700">${copyrightSection.children[0].textContent.trim()}</p>
          <div class="footer-socials">
            ${processedSocialsHTML}
          </div>
        </div>
        <div class="footer-legal-bottom">
          <div class="footer-legal-links">
            ${processedLegalLinksHTML}
          </div>
               <div class="footer-socials-mobile">
            ${processedSocialsHTML}
          </div>
          <button class="footer-scroll-top" aria-label="Scroll to top">
            <img src="/icons/arrow-circular.svg" alt="Scroll to top" />
          </button>
        </div>
      </section>
    </div>
  `;

  block.innerHTML = footerHTML;

  // Add accordion functionality
  block.querySelectorAll(".accordion-trigger").forEach((button) => {
    button.addEventListener("click", () => toggleAccordion(button));
  });

  // Add scroll to top functionality
  block.querySelector(".footer-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
