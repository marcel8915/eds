import {
  getElements,
  showFieldError,
  clearAllErrors,
  addFieldErrorListeners,
  populateCountrySelect,
  formatRichText,
} from "./newsletter-modal-utils.js";

const API_ENDPOINT =
  "https://publish-p152536-e1620746.adobeaemcloud.com/bin/chg/newsletter.json";
const RECAPTCHA_SITE_KEY = "6LdZZnMrAAAAAGqiMLFf9k-fhMoG7rX7PwLAMiyj";
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
  formatRichText(headerText[0], "text-h4 modal-header", "h4");
  // Terms text formatting
  formatRichText(
    termsText[0],
    "text-p3 desc terms-text text-text-black-800",
    "p"
  );
  // Success header text formatting
  formatRichText(successHeaderText[0], "text-h4 modal-header", "h4");

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
            <form novalidate="">
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
              <button class="text-b cta-button">${buttonText[0].textContent.trim()}</button>
            </form>
          ${termsText[0].innerHTML.trim()}
        </div>
      `;
    }
  }

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
      form.addEventListener("submit", (e) => {
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
        // Validation: check if any field is empty
        Object.entries(values).forEach(([key, value]) => {
          if (!value || value.trim() === "") {
            showFieldError(form, key, "Please fill out the field");
            hasError = true;
          }
        });
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (values.email && !emailRegex.test(values.email)) {
          showFieldError(form, "email", "Please enter a valid email address");
          hasError = true;
        }
        if (hasError) return;
        // reCAPTCHA integration
        if (typeof window.grecaptcha !== "undefined") {
          window.grecaptcha.enterprise.ready(function () {
            window.grecaptcha.enterprise
              .execute(RECAPTCHA_SITE_KEY, {
                action: "submit",
              })
              .then(function (token) {
                // Use FormData for form-data submission
                const fd = new FormData();
                fd.append("salutation", values.salutation);
                fd.append("firstName", values.firstName);
                fd.append("lastName", values.lastName);
                fd.append("email", values.email);
                fd.append("country", values.country);
                fd.append("captchaValue", token);
                // POST request as form-data
                fetch(API_ENDPOINT, {
                  method: "POST",
                  body: fd,
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("Newsletter signup response:", data);
                    // TODO // Uncomment the following lines to handle errors
                    // if (!data.success) {
                    //   showFieldError(
                    //     form,
                    //     "email",
                    //     "There was an error signing up. Please try again."
                    //   );
                    //   return;
                    // }
                    // On success, toggle to success UI
                    isSuccess = true;
                    renderNewsletterModal(block);
                  })
                  .catch((err) => {
                    console.error("Newsletter signup error:", err);
                  });
              });
          });
        } else {
          console.error("reCAPTCHA not loaded");
        }
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
