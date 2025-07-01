const BLOCK_CLASS_NAME = "newsletter-modal";

export default function decorate(block) {
  const getElements = (selectors) =>
    Object.fromEntries(
      selectors.map(({ key, sel }) => [key, block.querySelectorAll(sel)])
    );

  const selectors = [
    {
      key: "headerText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(1) > div > p`,
    },
    {
      key: "buttonText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(2) > div > p`,
    },
    {
      key: "termsText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(3) > div`,
    },
  ];

  const elements = getElements(selectors);
  const { headerText, buttonText, termsText } = elements;

  console.log(termsText[0]);
  const ps = Array.from(termsText[0].querySelectorAll("p"));
  if (ps.length > 1) {
    const combinedHTML = ps.map((p) => p.innerHTML).join("<br>");
    ps.forEach((p) => p.remove());
    const paragraph = document.createElement("p");
    paragraph.className = "text-p3 desc terms-text text-text-grey-800";
    paragraph.innerHTML = combinedHTML;
    termsText[0].appendChild(paragraph);
  } else if (ps.length === 1) {
    ps[0].className = "text-p3 desc terms-text text-text-grey-800";
  }

  const salutationsSelection = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

  const modal = document.createElement("div");
  modal.className = `${BLOCK_CLASS_NAME}-modal`;
  modal.innerHTML = `
    <button class="newsletter-modal-close" aria-label="Close" type="button" style="position:absolute;top:1.5rem;left:1.5rem;background:none;border:none;font-size:2rem;line-height:1;cursor:pointer;z-index:10;">&times;</button>
    <div class="${BLOCK_CLASS_NAME}-header">
      <h4 class="text-h4 modal-header">${headerText[0].textContent.trim()}</h4>
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
  block.innerHTML = ""; // Clear the block content
  block.appendChild(modal);

  // Add close button event
  const closeBtn = modal.querySelector(".newsletter-modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });
  }

  // Populate country select
  const countrySelect = () => modal.querySelector('select[name="country"]');
  fetch("https://restcountries.com/v3.1/all?fields=name,cca2,translations")
    .then((res) => res.json())
    .then((data) => {
      const sortedCountries = data
        .map((country) => ({
          value: country.cca2,
          en: country.name.common,
          // ja: country.translations?.jpn?.common || country.name.common,
          label: country.name.common,
        }))
        .sort((a, b) => a.en.localeCompare(b.en));
      const select = countrySelect();
      if (select) {
        sortedCountries.forEach((country) => {
          const opt = document.createElement("option");
          opt.value = country.value;
          opt.textContent = country.label;
          select.appendChild(opt);
        });
      }
    });

  // Handle form submission and log values
  const form = modal.querySelector("form");
  if (form) {
    // Helper to show error below a field
    function showFieldError(name, message) {
      const field = form.querySelector(`[name="${name}"]`);
      if (!field) return;
      let error = field.parentElement.querySelector(".field-error");
      if (!error) {
        error = document.createElement("div");
        const exclaimation = document.createElement("span");
        exclaimation.className = "text-p2";
        const text = document.createElement("span");
        text.className = "text-p3";
        text.textContent = message;
        exclaimation.textContent = "!";
        error.className = "field-error";
        error.appendChild(exclaimation);
        error.appendChild(text);
        field.parentElement.appendChild(error);
      } else {
        error.querySelector(".text-p3").textContent = message;
      }
    }
    // Helper to clear all errors
    function clearAllErrors() {
      form.querySelectorAll(".field-error").forEach((e) => e.remove());
    }
    // Hide all errors on input/change of any field
    ["salutation", "firstName", "lastName", "email", "country"].forEach(
      (name) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) {
          field.addEventListener("input", () => {
            clearAllErrors();
          });
          field.addEventListener("change", () => {
            clearAllErrors();
          });
        }
      }
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAllErrors();
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
          showFieldError(key, "Please fill out the field");
          hasError = true;
        }
      });
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (values.email && !emailRegex.test(values.email)) {
        showFieldError("email", "Please enter a valid email address");
        hasError = true;
      }
      if (hasError) return;
      console.log(values);
    });
  }
}
