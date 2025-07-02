import {
  showFieldError,
  clearAllErrors,
  addFieldErrorListeners,
  populateCountrySelect,
} from "./newsletter-modal-utils.js";

import { formatRichText, getElements } from "../../scripts/utils.js";

const API_ENDPOINT =
  "https://publish-p152536-e1620746.adobeaemcloud.com/bin/chg/newsletter.json";
const RECAPTCHA_SITE_KEY = "6LfpYh8rAAAAAPaE-icNeXk4b8ktPXqLKwHhqp6d";
const BLOCK_CLASS_NAME = "newsletter-modal";

// Module-level state for modal
let isOpen = false;
let isSuccess = false;
let modalBlock = null;

function renderNewsletterModal(block) {
  if (!isOpen) {
    block.style.opacity = "0";
    const overlay = block.parentElement?.parentElement;
    if (overlay) {
      overlay.style.background = "transparent";
      overlay.style.pointerEvents = "none";
      // Remove overlay click listener if present
      overlay.removeEventListener(
        "click",
        overlay._newsletterModalClickHandler
      );
      overlay._newsletterModalClickHandler = null;
    }
    return;
  }

  block.style.opacity = "1";
  const overlay = block.parentElement?.parentElement;
  if (overlay) {
    overlay.style.background = "rgba(0, 0, 0, 0.8)";
    overlay.style.pointerEvents = "auto";
    // Add overlay click-to-close logic
    if (!overlay._newsletterModalClickHandler) {
      overlay._newsletterModalClickHandler = function (e) {
        if (e.target === overlay) {
          isOpen = false;
          renderNewsletterModal(block);
        }
      };
      overlay.addEventListener("click", overlay._newsletterModalClickHandler);
    }
  }

  const selectors = [
    {
      key: "headerText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(1) > div`,
    },
    {
      key: "buttonText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(2) > div > p`,
    },
    {
      key: "termsText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(3) > div`,
    },
    {
      key: "image",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(4) > div`,
    },
    {
      key: "successHeaderText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(5) > div `,
    },
    {
      key: "successDescriptionText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(6) > div > p`,
    },
    {
      key: "closeButtonText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(7) > div > p`,
    },
  ];

  const elements = getElements(block, selectors);
  const {
    headerText,
    buttonText,
    termsText,
    image,
    successHeaderText,
    successDescriptionText,
    closeButtonText,
  } = elements;

  // Header text formatting
  formatRichText(headerText[0], "modal-header");
  // Terms text formatting
  formatRichText(
    termsText[0],
    "desc terms-text text-text-black-800",
    "text-p3"
  );
  // Success header text formatting
  formatRichText(successHeaderText[0], "modal-header");

  const salutationsSelection = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

  function renderModalContent() {
    if (isSuccess) {
      return `
        <button class="close-button" aria-label="Close" type="button"></button>
        <div class="image-container">
          ${image[0].innerHTML}
        </div>
        <div class="${BLOCK_CLASS_NAME}-success-header">
          ${successHeaderText[0].innerHTML.trim()}
          <h5 class="text-h5 text-text-black-800">${successDescriptionText[0].textContent.trim()}</h5>
          <button class="text-b cta-button text-close-button" aria-label="Close">${closeButtonText[0].textContent.trim()}</button>
        </div>
      `;
    } else {
      return `
        <button class="close-button" aria-label="Close" type="button"></button>
        <div class="${BLOCK_CLASS_NAME}-header">
          ${headerText[0].innerHTML.trim()}
            <form >
              <div class="relative">
                <div class="relative">
                  <select name="salutation" class="pill-dropdown-button"><option value="">Salutation*</option>${salutationsSelection
                    .map(
                      (salutation) =>
                        `<option value="${salutation}">${salutation}</option>`
                    )
                    .join("")}</select>
                </div>
                <div class="name-inputs">
                  <div class="relative">
                    <input class="pill-dropdown-button" placeholder="First Name*" type="text" value="" name="firstName">
                  </div>
                  <div class="relative">
                    <input class="pill-dropdown-button" placeholder="Last Name*"  type="text" value="" name="lastName">
                  </div>
                </div>
                <div class="relative">
                  <input class="pill-dropdown-button" placeholder="Email Address*" type="email" value="" name="email">
                </div>
                <div class="relative">
                  <select name="country" class="pill-dropdown-button"><option value="">Country*</option></select>
                </div>
                <div class="relative">
                  <div id="html_element" name="captchaValue"></div>
                </div>

                <button class="text-b cta-button" type="submit">${buttonText[0].textContent.trim()}</button>
                </form>
                ${termsText[0].innerHTML.trim()}
                </div>
                `;
    }
  }
  // <div class="g-recaptcha" data-sitekey="6LfpYh8rAAAAAPaE-icNeXk4b8ktPXqLKwHhqp6d" data-action="LOGIN"></div>
  // <div class="g-recaptcha" data-sitekey=${RECAPTCHA_SITE_KEY} data-action="LOGIN"></div>

  block.innerHTML = renderModalContent();
  block.style.display = "block";

  // Add close button event
  function addCloseButtonHandler() {
    const closeBtns = block.querySelectorAll('[aria-label="Close"]');
    closeBtns.forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        isOpen = false;
        renderNewsletterModal(block);
      });
    });
  }
  addCloseButtonHandler();

  // Populate country select
  const countrySelect = () => block.querySelector('select[name="country"]');
  populateCountrySelect(countrySelect());

  // Handle form submission and log values
  function addFormHandler() {
    const form = block.querySelector("form");
    if (form) {
      addFieldErrorListeners(form, () => clearAllErrors(form));
      // Render checkbox reCAPTCHA
      grecaptcha.render("html_element", {
        sitekey: RECAPTCHA_SITE_KEY,
        theme: "light",
        size: "normal",
        tabindex: 0,
      });
      // Prevent default form POST by intercepting submit
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearAllErrors(form);
        const formData = new FormData(form);
        const values = {
          salutation: formData.get("salutation"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          country: formData.get("country"),
        };

        let hasError = false;
        Object.entries(values).forEach(([key, value]) => {
          if (!value || value.trim() === "") {
            showFieldError(form, key, "Please fill out the field");
            hasError = true;
          }
        });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (values.email && !emailRegex.test(values.email)) {
          showFieldError(form, "email", "Please enter a valid email address");
          hasError = true;
        }
        // Check reCAPTCHA response
        const captchaValue = grecaptcha.getResponse();
        if (!captchaValue) {
          showFieldError(
            form,
            "captchaValue",
            "Please complete the reCAPTCHA verification"
          );
          hasError = true;
        }
        if (hasError) return;
        formData.append("captchaValue", captchaValue);
        // Remove g-recaptcha-response from FormData if present
        formData.delete("g-recaptcha-response");

        fetch(API_ENDPOINT, {
          method: "POST",
          body: formData,
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Network response was not ok");
            const text = await res.text();
            if (!text) return {}; // treat empty as success
            try {
              return JSON.parse(text);
            } catch (e) {
              throw new Error("Invalid JSON response");
            }
          })
          .then((data) => {
            isSuccess = true;
            renderNewsletterModal(block);
          })
          .catch((err) => {
            // let errorDiv = form.querySelector(".newsletter-error");
            // if (!errorDiv) {
            //   errorDiv = document.createElement("div");
            //   errorDiv.className = "newsletter-error";
            //   errorDiv.style.color = "red";
            //   errorDiv.style.marginTop = "1em";
            //   form.appendChild(errorDiv);
            // }
            // errorDiv.textContent =
            //   "There was a problem submitting the form. Please try again.";
            // console.error(
            //   "Newsletter signup error:",
            //   err && err.message ? err.message : err || "Unknown error"
            // );
          });
      });
    }
  }
  addFormHandler();
}

export default function decorate(block) {
  modalBlock = block;
  renderNewsletterModal(block);
}

const anchor = document.querySelector('a[href="/newsletter"]');
if (anchor) {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen = true;
    isSuccess = false;
    if (modalBlock) {
      renderNewsletterModal(modalBlock);
    }
  });
}
