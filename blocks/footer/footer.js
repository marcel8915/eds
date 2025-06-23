import { getMetadata } from '../../scripts/aem.js';

/**
 * Toggles an accordion panel open or closed.
 * @param {HTMLElement} button The button that controls the accordion panel.
 */
function toggleAccordion(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector('svg');
  const isOpen = button.getAttribute('aria-expanded') === 'true';

  // Close all other accordions in the same container
  const parent = button.closest('.footer-links');
  parent.querySelectorAll('.accordion-trigger').forEach((otherButton) => {
    if (otherButton !== button) {
      otherButton.setAttribute('aria-expanded', 'false');
      otherButton.nextElementSibling.setAttribute('hidden', '');
      otherButton.querySelector('svg').classList.remove('is-open');
    }
  });

  if (isOpen) {
    button.setAttribute('aria-expanded', 'false');
    content.setAttribute('hidden', '');
    icon.classList.remove('is-open');
  } else {
    button.setAttribute('aria-expanded', 'true');
    content.removeAttribute('hidden');
    icon.classList.add('is-open');
  }
}

/**
 * Decorates the footer.
 * @param {HTMLElement} block The footer block element.
 */
export default async function decorate(block) {
  block.textContent = ''; // Clear existing content

  const footerHTML = `
    <div class="footer-content">
      <section class="footer-section footer-contact">
        <div class="footer-contact-column">
          <p class="footer-heading">Address</p>
          <a target="_blank" href="https://maps.app.goo.gl/H3PeAfzCyYmyXDFW7">
            <p class="footer-link animate-underline">3-91, Banba-cho, Chuo-ku, Osaka-shi, Osaka, 540-0007, Japan</p>
          </a>
        </div>
        <div class="footer-contact-column">
          <p class="footer-heading">Phone</p>
          <a target="_blank" href="tel:+81669418888">
            <p class="footer-link animate-underline">+81 6 6941 8888</p>
          </a>
        </div>
        <div class="footer-contact-column">
          <p class="footer-heading">Email</p>
          <a target="_blank" href="mailto:info.osaka@patinahotels.com">
            <p class="footer-link animate-underline">info.osaka@ patinahotels.com</p>
          </a>
        </div>
        <div class="footer-contact-column">
          <p class="footer-heading">Enquiries</p>
          <a target="_blank" href="https://patinahotels.com/osaka/contact-us">
            <p class="footer-link animate-underline">Contact Us</p>
          </a>
        </div>
        <div class="footer-contact-column">
          <p class="footer-heading">Newsroom</p>
          <a target="_blank" href="https://patinahotels.com/osaka/press">
            <p class="footer-link animate-underline">Press Information</p>
          </a>
        </div>
      </section>

      <section class="footer-section footer-links">
        <div class="footer-links-column">
          <div class="footer-desktop-links">
            <p class="footer-heading-subtle">Destinations</p>
            <a target="_blank" href="https://patinahotels.com/osaka"><p class="footer-link animate-underline">Osaka</p></a>
            <a target="_blank" href="https://patinahotels.com/maldives-fari-islands"><p class="footer-link animate-underline">Maldives</p></a>
            <a target="_blank" href="https://patinahotels.com/ourfootprint-sanya"><p class="footer-link animate-underline">Sanya</p></a>
          </div>
          <div class="footer-mobile-accordion">
            <button class="accordion-trigger" aria-expanded="false"><p>Destinations</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
            <div class="accordion-content" hidden>
               <a target="_blank" href="https://patinahotels.com/osaka"><p class="footer-link animate-underline">Osaka</p></a>
               <a target="_blank" href="https://patinahotels.com/maldives-fari-islands"><p class="footer-link animate-underline">Maldives</p></a>
               <a target="_blank" href="https://patinahotels.com/ourfootprint-sanya"><p class="footer-link animate-underline">Sanya</p></a>
            </div>
          </div>
        </div>

        <div class="footer-links-column">
          <div class="footer-desktop-links">
            <p class="footer-heading-subtle">Patina Osaka</p>
            <a target="_blank" href="https://patinahotels.com/osaka/the-story"><p class="footer-link animate-underline">The Story</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/rooms-and-suites"><p class="footer-link animate-underline">Rooms & Suites</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/drink-and-dine"><p class="footer-link animate-underline">Drink & Dine</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/wellbeing"><p class="footer-link animate-underline">Wellbeing</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/events-and-weddings"><p class="footer-link animate-underline">Events & Weddings</p></a>
          </div>
           <div class="footer-mobile-accordion">
            <button class="accordion-trigger" aria-expanded="false"><p>Patina Osaka</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
            <div class="accordion-content" hidden>
              <a target="_blank" href="https://patinahotels.com/osaka/the-story"><p class="footer-link animate-underline">The Story</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/rooms-and-suites"><p class="footer-link animate-underline">Rooms & Suites</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/drink-and-dine"><p class="footer-link animate-underline">Drink & Dine</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/wellbeing"><p class="footer-link animate-underline">Wellbeing</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/events-and-weddings"><p class="footer-link animate-underline">Events & Weddings</p></a>
            </div>
          </div>
        </div>

        <div class="footer-links-column">
          <div class="footer-desktop-links">
            <p class="footer-heading-subtle">What's on</p>
            <a target="_blank" href="https://patinahotels.com/osaka/whats-on"><p class="footer-link animate-underline">Programmes</p></a>
          </div>
           <div class="footer-mobile-accordion">
            <button class="accordion-trigger" aria-expanded="false"><p>What's on</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
            <div class="accordion-content" hidden>
              <a target="_blank" href="https://patinahotels.com/osaka/whats-on"><p class="footer-link animate-underline">Programmes</p></a>
            </div>
          </div>
        </div>
        
        <div class="footer-links-column">
          <div class="footer-desktop-links">
            <p class="footer-heading-subtle">Offers</p>
            <a target="_blank" href="https://patinahotels.com/osaka/offers/patina-imprints"><p class="footer-link animate-underline">Patina Imprints</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/offers/patina-escape"><p class="footer-link animate-underline">Patina Escape</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/offers/patina-journey"><p class="footer-link animate-underline">Patina Journey</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/offers/stay3-pay2"><p class="footer-link animate-underline">Stay 3 Pay 2</p></a>
          </div>
           <div class="footer-mobile-accordion">
            <button class="accordion-trigger" aria-expanded="false"><p>Offers</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
            <div class="accordion-content" hidden>
              <a target="_blank" href="https://patinahotels.com/osaka/offers/patina-imprints"><p class="footer-link animate-underline">Patina Imprints</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/offers/patina-escape"><p class="footer-link animate-underline">Patina Escape</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/offers/patina-journey"><p class="footer-link animate-underline">Patina Journey</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/offers/stay3-pay2"><p class="footer-link animate-underline">Stay 3 Pay 2</p></a>
            </div>
          </div>
        </div>
        
        <div class="footer-links-column">
          <div class="footer-desktop-links">
            <p class="footer-heading-subtle">Our Brands</p>
            <a target="_blank" href="https://patinahotels.com/"><p class="footer-link animate-underline">Patina Hotels and Resorts</p></a>
            <a target="_blank" href="https://capellahotels.com/"><p class="footer-link animate-underline">Capella Hotels and Resorts</p></a>
            <a target="_blank" href="https://capellahotelgroup.com/"><p class="footer-link animate-underline">Capella Hotel Group</p></a>
            <a target="_blank" href="https://patinaosaka.talentplushire.com/jobs/"><p class="footer-link animate-underline">Careers</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/faq"><p class="footer-link animate-underline">FAQ</p></a>
          </div>
           <div class="footer-mobile-accordion">
            <button class="accordion-trigger" aria-expanded="false"><p>Our Brands</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
            <div class="accordion-content" hidden>
              <a target="_blank" href="https://patinahotels.com/"><p class="footer-link animate-underline">Patina Hotels and Resorts</p></a>
              <a target="_blank" href="https://capellahotels.com/"><p class="footer-link animate-underline">Capella Hotels and Resorts</p></a>
              <a target="_blank" href="https://capellahotelgroup.com/"><p class="footer-link animate-underline">Capella Hotel Group</p></a>
              <a target="_blank" href="https://patinaosaka.talentplushire.com/jobs/"><p class="footer-link animate-underline">Careers</p></a>
              <a target="_blank" href="https://patinahotels.com/osaka/faq"><p class="footer-link animate-underline">FAQ</p></a>
            </div>
          </div>
        </div>
      </section>

      <section class="footer-section footer-legal">
        <div class="footer-legal-top">
          <p class="footer-copyright">© 2025 Capella Hotel Group. All Rights Reserved.</p>
          <div class="footer-socials">
             <a href="https://www.linkedin.com/company/patina-hotels-&-resorts-pte-ltd" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
               <span class="social-icon-wrapper">
                 <img src="/icons/socials/linkedin.svg" alt="LinkedIn" class="social-icon-default" />
                 <img src="/icons/socials/hover-linkedin.svg" alt="LinkedIn Hover" class="social-icon-hover" />
               </span>
             </a>
             <a href="https://www.instagram.com/patinaosaka/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
               <span class="social-icon-wrapper">
                 <img src="/icons/socials/instagram.svg" alt="Instagram" class="social-icon-default" />
                 <img src="/icons/socials/hover-instagram.svg" alt="Instagram Hover" class="social-icon-hover" />
               </span>
             </a>
          </div>
        </div>
        <div class="footer-legal-bottom">
          <div class="footer-legal-links">
            <a target="_blank" href="https://www.capellahotels.com/en/corporate/global-contacts"><p class="footer-link-subtle">Global Contacts</p></a>
            <a target="_blank" href="https://www.capellahotels.com/en/corporate/privacy-policy"><p class="footer-link-subtle">Privacy Policy</p></a>
            <a target="_blank" href="https://www.capellahotels.com/en/corporate/ugc-terms-and-conditions"><p class="footer-link-subtle">UGC Terms & Conditions</p></a>
            <a target="_blank" href="https://capellahotelgroup.com/bookingterms/"><p class="footer-link-subtle">Booking Terms & Conditions</p></a>
            <a target="_blank" href="https://capellahotelgroup.com/digital-payment-tokens/"><p class="footer-link-subtle">Digital Payment Tokens</p></a>
            <a target="_blank" href="https://patinahotels.com/discovery"><p class="footer-link-subtle">Patina Discovery</p></a>
            <a target="_blank" href="https://patinahotels.com/osaka/specified-commercial-transactions-act"><p class="footer-link-subtle">Specified Commercial Transactions Act</p></a>
          </div>
          <button class="footer-scroll-top" aria-label="Scroll to top">
            <img src="/icons/arrowCircular.svg" alt="Scroll to top" />
          </button>
        </div>
      </section>
    </div>
  `;

  block.innerHTML = footerHTML;

  // Add accordion functionality
  block.querySelectorAll('.accordion-trigger').forEach((button) => {
    button.addEventListener('click', () => toggleAccordion(button));
  });

  // Add scroll to top functionality
  block.querySelector('.footer-scroll-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
