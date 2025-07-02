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
const TEST_SUCCESS = false; // Set to true to test success page without API
const salutationsSelection = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

let isOpen = false;
let isSuccess = false;
let modalBlock = null;
const newsletterModalContainer = document.querySelector(
  ".newsletter-modal-container"
);

function renderNewsletterModal(block) {
  if (!isOpen) {
    block.style.opacity = "0";
    const overlay = block.parentElement?.parentElement;
    if (overlay) {
      overlay.style.background = "transparent";
      overlay.style.pointerEvents = "none";
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
    if (!overlay._newsletterModalClickHandler) {
      overlay._newsletterModalClickHandler = function (e) {
        if (e.target === overlay) {
          closeModal();
        }
      };
      overlay.addEventListener("click", overlay._newsletterModalClickHandler);
    }
  }

  // Get modal content from block (cache on first render)
  if (!block._cachedContent) {
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
      { key: "image", sel: `.${BLOCK_CLASS_NAME} > div:nth-child(4) > div` },
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

    // Header text formatting
    formatRichText(elements.headerText[0], "modal-header");
    // Terms text formatting
    formatRichText(
      elements.termsText[0],
      "desc terms-text text-text-black-800",
      "text-p3"
    );
    // Success header text formatting
    formatRichText(elements.successHeaderText[0], "modal-header");

    block._cachedContent = {
      headerHTML: elements.headerText[0]?.innerHTML.trim() || "",
      buttonText: elements.buttonText[0]?.textContent.trim() || "Submit",
      termsHTML: elements.termsText[0]?.innerHTML.trim() || "",
      imageHTML: elements.image[0]?.innerHTML || "",
      successHeaderHTML: elements.successHeaderText[0]?.innerHTML.trim() || "",
      successDescText:
        elements.successDescriptionText[0]?.textContent.trim() || "",
      closeButtonText:
        elements.closeButtonText[0]?.textContent.trim() || "Close",
    };
  }
  const cached = block._cachedContent;

  // Render modal HTML (both states, toggle with display)
  block.innerHTML = `
    <div class="success-${BLOCK_CLASS_NAME}" style="display: ${
    isSuccess ? "block" : "none"
  }; ">
      <button class="close-button" aria-label="Close" type="button"></button>
      <div class="image-container">${cached.imageHTML}</div>
      <div class="${BLOCK_CLASS_NAME}-success-header" ">
        ${cached.successHeaderHTML}
        <h5 class="text-h5 text-text-black-800" >${cached.successDescText}</h5>
        <button class="text-b cta-button text-close-button" aria-label="Close">${
          cached.closeButtonText
        }</button>
      </div>
    </div>
    <div class="default-${BLOCK_CLASS_NAME}" style="display: ${
    isSuccess ? "none" : "block"
  };">
      <button class="close-button" aria-label="Close" type="button"></button>
      <div class="${BLOCK_CLASS_NAME}-header">${cached.headerHTML}
        <form>
          <div class="relative">
            <div class="relative">
              <select name="salutation" class="pill-dropdown-button"><option value="">Salutation*</option>${salutationsSelection
                .map((s) => `<option value="${s}">${s}</option>`)
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
            <button class="text-b cta-button" type="submit">${
              cached.buttonText
            }</button>
          </div>
        </form>
        ${cached.termsHTML}
      </div>
    </div>
  `;
  block.style.display = "block";

  const successModal = block.querySelector(`.success-${BLOCK_CLASS_NAME}`);
  const defaultModal = block.querySelector(`.default-${BLOCK_CLASS_NAME}`);

  function closeModal() {
    isOpen = false;
    isSuccess = false;
    if (newsletterModalContainer)
      newsletterModalContainer.style.display = "none";
    if (successModal) successModal.style.display = "none";
    if (defaultModal) defaultModal.style.display = "block";
  }

  // Add close button event
  function addCloseButtonHandler() {
    const closeBtns = block.querySelectorAll('[aria-label="Close"]');
    closeBtns.forEach((closeBtn) => {
      closeBtn.addEventListener("click", closeModal);
    });
  }
  addCloseButtonHandler();

  // Populate country select
  const countrySelect = () => block.querySelector('select[name="country"]');
  if (countrySelect()) populateCountrySelect(countrySelect());

  // Handle form submission and log values
  function addFormHandler() {
    const form = block.querySelector("form");
    if (form) {
      addFieldErrorListeners(form, () => clearAllErrors(form));
      grecaptcha.render("html_element", {
        sitekey: RECAPTCHA_SITE_KEY,
        theme: "light",
        size: "normal",
        tabindex: 0,
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector("button[type='submit']");
        const originalBtnContent = submitBtn ? submitBtn.innerHTML : null;
        if (submitBtn) {
          submitBtn.innerHTML =
            '<span class="button-loader" aria-label="Loading"></span>';
          submitBtn.disabled = true;
        }
        if (TEST_SUCCESS) {
          setTimeout(() => {
            isSuccess = true;
            if (defaultModal) defaultModal.style.display = "none";
            if (successModal) successModal.style.display = "block";
            if (submitBtn) {
              submitBtn.innerHTML = originalBtnContent;
              submitBtn.disabled = false;
            }
          }, 2000);
          return;
        }
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
        const captchaValue = grecaptcha.getResponse();
        if (!captchaValue) {
          showFieldError(
            form,
            "captchaValue",
            "Please complete the reCAPTCHA verification"
          );
          hasError = true;
        }
        if (hasError) {
          if (submitBtn) {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
          }
          return;
        }
        formData.append("captchaValue", captchaValue);
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
            if (data.status === "success") {
              isSuccess = true;
              if (defaultModal) defaultModal.style.display = "none";
              if (successModal) successModal.style.display = "block";
            }
            if (submitBtn) {
              submitBtn.innerHTML = originalBtnContent;
              submitBtn.disabled = false;
            }
          })
          .catch((err) => {
            console.error("Newsletter signup error:", err);
            if (submitBtn) {
              submitBtn.innerHTML = originalBtnContent;
              submitBtn.disabled = false;
            }
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
    newsletterModalContainer.style.display = "flex";
    if (modalBlock) {
      renderNewsletterModal(modalBlock);
    }
  });
}
