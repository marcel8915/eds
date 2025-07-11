const TYPE_PILL_CLASS = "type-filter-pill";
const TYPE_DROPDOWN_CLASS = "type-filter-dropdown";

/**
 * Creates a generic dropdown filter component for types/categories
 * @param {object} options
 * @param {string[]} [options.allTypes=[]] - The list of available filter options
 * @param {string} [options.activeType] - The initially selected type
 * @param {string} [options.defaultLabel='All Types'] - The label for the "all" state
 * @param {function} [options.onFilterChange=()=>{}] - Callback function
 * @returns {HTMLElement} The filter component's root element
 */
export function createTypesFilter({
  allTypes = [],
  activeType,
  defaultLabel = "All Types",
  onFilterChange = () => {},
}) {
  const filterState = {
    all: [defaultLabel, ...allTypes],
    active: activeType || defaultLabel,
  };

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "type-filter-button-wrapper";

  const pillButton = document.createElement("button");
  pillButton.className = TYPE_PILL_CLASS;
  pillButton.type = "button";
  pillButton.setAttribute("aria-expanded", "false");

  const pillText = document.createElement("span");
  pillText.className = "type-filter-pill-text";

  const pillIcon = document.createElement("span");
  pillIcon.className = "type-filter-pill-icon";
  pillIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

  pillButton.append(pillText, pillIcon);
  buttonWrapper.append(pillButton);

  function formatTypeName(text) {
    if (typeof text !== "string" || !text) return "";
    if (text === defaultLabel) return text;
    const lowercased = text.toLowerCase();
    return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
  }

  function updatePillText() {
    pillText.textContent = formatTypeName(filterState.active);
  }

  function closeDropdown() {
    const dropdown = buttonWrapper.querySelector(`.${TYPE_DROPDOWN_CLASS}`);
    if (!dropdown) return;
    dropdown.setAttribute("aria-open", "false");
    pillButton.setAttribute("aria-expanded", "false");
    setTimeout(() => dropdown.remove(), 350);
  }

  function toggleDropdown() {
    let dropdown = buttonWrapper.querySelector(`.${TYPE_DROPDOWN_CLASS}`);
    if (dropdown) {
      closeDropdown();
      return;
    }

    dropdown = document.createElement("div");
    dropdown.className = TYPE_DROPDOWN_CLASS;
    dropdown.setAttribute("aria-open", "false");

    filterState.all.forEach((type) => {
      const item = document.createElement("button");
      item.className = "type-filter-item";
      item.textContent = formatTypeName(type);

      if (type === filterState.active) {
        item.classList.add("active");
      }

      item.addEventListener("click", () => {
        filterState.active = type;
        onFilterChange(type);
        updatePillText();
        closeDropdown();
      });

      dropdown.appendChild(item);
    });

    buttonWrapper.appendChild(dropdown);

    setTimeout(() => {
      dropdown.setAttribute("aria-open", "true");
      pillButton.setAttribute("aria-expanded", "true");
    }, 10);
  }

  pillButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", closeDropdown);

  updatePillText();
  return buttonWrapper;
}
