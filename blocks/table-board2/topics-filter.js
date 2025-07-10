const TOPICS_PILL_CLASS = "topics-filter-pill";
const TOPICS_DROPDOWN_CLASS = "topics-filter-dropdown";
const TOPICS_DONE_BTN_CLASS = "topics-filter-done-btn";
const TOPICS_SELECT_ALL_BTN_CLASS = "topics-filter-select-all-btn";

/**
 * Creates a dropdown filter component for topics.
 * @param {object} options
 * @param {string[]} [options.allTopics=[]]
 * @param {string[]} [options.selectedTopics=[]]
 * @param {function} [options.onFilterChange=()=>{}]
 * @returns {HTMLElement}
 */
export function createTopicsFilter({
  allTopics = [],
  selectedTopics = [],
  onFilterChange = () => {},
}) {
  const filterState = {
    all: [...allTopics],
    selected: [...selectedTopics],
  };

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "topics-filter-button-wrapper";

  const pillButton = document.createElement("button");
  pillButton.className = TOPICS_PILL_CLASS;
  pillButton.type = "button";

  const pillText = document.createElement("span");
  pillText.className = "topics-filter-pill-text";

  const pillIcon = document.createElement("span");
  pillIcon.className = "topics-filter-pill-icon";
  pillIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

  pillButton.append(pillText, pillIcon);
  buttonWrapper.append(pillButton);

  function updatePillText() {
    const sel = filterState.selected;
    if (sel.length === 0 || sel.length === filterState.all.length) {
      pillText.textContent = "All Topics";
      return;
    }
    if (sel.length === 1) {
      pillText.textContent = sel[0];
      return;
    }
    pillText.textContent = `${sel.length} Topics Selected`;
  }

  function closeDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.setAttribute("aria-open", "false");
    pillButton.setAttribute("aria-expanded", "false");
    setTimeout(() => {
      dropdown.remove();
    }, 350);
  }

  function toggleDropdown() {
    let dropdown = buttonWrapper.querySelector(`.${TOPICS_DROPDOWN_CLASS}`);
    if (dropdown) {
      closeDropdown(dropdown);
      return;
    }

    dropdown = document.createElement("div");
    dropdown.className = TOPICS_DROPDOWN_CLASS;
    dropdown.setAttribute("aria-open", "false");

    let html = `<div class="topics-filter-dropdown-inner">`;
    html += `<div class="topics-filter-dropdown-header"><p>Select Topic</p><button type="button" class="${TOPICS_SELECT_ALL_BTN_CLASS}">${
      filterState.selected.length === filterState.all.length
        ? "Deselect All"
        : "Select All"
    }</button></div>`;

    filterState.all.forEach((topic) => {
      const checked = filterState.selected.includes(topic) ? "checked" : "";
      html += `<label class="topics-filter-item"> ${topic}<input type="checkbox" value="${topic}" ${checked}/></label>`;
    });

    html += `<button type="button" class="${TOPICS_DONE_BTN_CLASS}">Done</button>`;
    html += `</div>`;
    dropdown.innerHTML = html;
    buttonWrapper.appendChild(dropdown);

    dropdown.addEventListener("click", (e) => e.stopPropagation());

    dropdown.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const { value, checked } = e.target;
        if (checked) {
          filterState.selected.push(value);
        } else {
          filterState.selected = filterState.selected.filter(
            (s) => s !== value
          );
        }
        updatePillText();
      });
    });

    dropdown
      .querySelector(`.${TOPICS_DONE_BTN_CLASS}`)
      .addEventListener("click", () => {
        onFilterChange(filterState.selected);
        closeDropdown(dropdown);
      });

    dropdown
      .querySelector(`.${TOPICS_SELECT_ALL_BTN_CLASS}`)
      .addEventListener("click", (e) => {
        const btn = e.target;
        if (filterState.selected.length === filterState.all.length) {
          filterState.selected = [];
          btn.textContent = "Select All";
        } else {
          filterState.selected = [...filterState.all];
          btn.textContent = "Deselect All";
        }
        dropdown.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          cb.checked = filterState.selected.includes(cb.value);
        });
        updatePillText();
      });

    setTimeout(() => {
      dropdown.setAttribute("aria-open", "true");
      pillButton.setAttribute("aria-expanded", "true");
    }, 10);
  }

  pillButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", () => {
    const dropdown = buttonWrapper.querySelector(`.${TOPICS_DROPDOWN_CLASS}`);
    if (dropdown) {
      closeDropdown(dropdown);
    }
  });

  updatePillText();
  return buttonWrapper;
}
