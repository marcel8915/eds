// newsletter-modal-utils.js
// Utility functions for newsletter modal

export function getElements(block, selectors) {
  return Object.fromEntries(
    selectors.map(({ key, sel }) => [key, block.querySelectorAll(sel)])
  );
}

export function showFieldError(form, name, message) {
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

export function clearAllErrors(form) {
  form.querySelectorAll(".field-error").forEach((e) => e.remove());
}

export function addFieldErrorListeners(form, clearAllErrorsFn) {
  [
    "salutation",
    "firstName",
    "lastName",
    "email",
    "country",
    "captchaValue",
  ].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.addEventListener("input", () => {
        clearAllErrorsFn();
      });
      field.addEventListener("change", () => {
        clearAllErrorsFn();
      });
    }
  });
}

export function populateCountrySelect(select) {
  fetch("https://restcountries.com/v3.1/all?fields=name,cca2,translations")
    .then((res) => res.json())
    .then((data) => {
      const sortedCountries = data
        .map((country) => ({
          value: country.cca2,
          en: country.name.common,
          label: country.name.common,
        }))
        .sort((a, b) => a.en.localeCompare(b.en));
      if (select) {
        sortedCountries.forEach((country) => {
          const opt = document.createElement("option");
          opt.value = country.value;
          opt.textContent = country.label;
          select.appendChild(opt);
        });
      }
    });
}

export function formatRichText(element, className, wrapperTag = "p") {
  const nodes = Array.from(element.querySelectorAll("p"));
  if (nodes.length > 1) {
    const combinedHTML = nodes.map((n) => n.innerHTML).join("<br>");
    nodes.forEach((n) => n.remove());
    const wrapper = document.createElement(wrapperTag);
    wrapper.className = className;
    wrapper.innerHTML = combinedHTML;
    element.appendChild(wrapper);
  } else if (nodes.length === 1) {
    nodes[0].className = className;
  }
}
