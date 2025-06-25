import {
  formatDate,
  getDayOfWeek,
  getWeeklyDates,
  getMonthlyDates,
} from "./events-listing-utils.js";
import { createCalendar } from "./calendar-component.js";

const EVENTS_PER_PAGE = 8;
const API_URL =
  "https://publish-p152536-e1620746.adobeaemcloud.com/graphql/execute.json/CHG/GetEventList";
const FILTER_PILL_CLASS = "pill-dropdown-button";
const FILTER_DROPDOWN_CLASS = "events-filter-dropdown";
const FILTER_DONE_BTN_CLASS = "events-filter-done-btn";
const FILTER_SELECT_ALL_BTN_CLASS = "events-filter-select-all-btn";
const FILTER_WRAPPER_CLASS = "events-filter-container";
const wrapper = document.querySelector(".events-listing-wrapper");

export default async function decorate(block) {
  function renderEventCard(event, dateObj, timing) {
    const imgUrl =
      event.images && event.images.length > 0
        ? event.images[0]._publishUrl
        : "";
    const date = formatDate(dateObj);
    const dayOfWeek = getDayOfWeek(dateObj);
    // Compute ctaLink if available
    const ctaLink = event.ctaLink || "";
    return `
      <section class="event-card">
        <div class="event-image-wrapper">
          ${imgUrl ? `<img src="${imgUrl}" alt="${event.title || ""}" />` : ""}
          <div class="event-date-wrapper">
            <p class="event-day text-l3">${dayOfWeek}</p>
            <p class="event-date text-l2">${date.replace(/,? ?\d{4}/, "")}</p>
          </div>
        </div>
        <p class="event-category text-l2">${event.category || ""}</p>
        <h3 class="event-title text-h3">${event.title || ""}</h3>
        <p class="event-desc text-p1">${event.description || ""}</p>
        <p class="event-timing text-p1">${timing ? timing : ""}</p>
        <p class="event-venue text-p1">${event.venue ? event.venue : ""}</p>
        ${
          event.ctaText && ctaLink
            ? `<a class="event-cta cta-link arrowRight" href="${ctaLink}"><span class="animate-underline">${event.ctaText}</span></a>`
            : event.ctaText
            ? `<p class="event-cta cta-link text-p1">${event.ctaText}</p>`
            : ""
        }
      </section>
    `;
  }

  function expandEvents(events) {
    const expanded = [];
    events.forEach((event) => {
      let hasRecurrence = false;
      if (event.onceDate) {
        expanded.push({
          event,
          date: event.onceDate,
          timing: event.onceTiming,
        });
        hasRecurrence = true;
      }
      if (event.dailyStartDate && event.dailyEndDate) {
        let current = new Date(event.dailyStartDate);
        const end = new Date(event.dailyEndDate);
        while (current <= end) {
          expanded.push({
            event,
            date: current.toISOString(),
            timing: event.dailyTiming,
          });
          current.setDate(current.getDate() + 1);
        }
        hasRecurrence = true;
      }
      if (
        event.weeklyStartDate &&
        event.weeklyEndDate &&
        event.weeklyDays &&
        event.weeklyDays.length
      ) {
        const dates = getWeeklyDates(
          event.weeklyStartDate,
          event.weeklyEndDate,
          event.weeklyDays
        );
        dates.forEach((dateObj) => {
          expanded.push({
            event,
            date: dateObj.toISOString(),
            timing: event.weeklyTiming,
          });
        });
        hasRecurrence = true;
      }
      if (event.monthlyStartDate && event.monthlyEndDate) {
        let days = [];
        let useWeekday = false;
        if (Array.isArray(event.monthlyDays) && event.monthlyDays.length) {
          days = event.monthlyDays.map((d) => parseInt(d, 10));
        } else {
          // Use the weekday of monthlyStartDate for each month
          useWeekday = true;
        }
        const start = new Date(event.monthlyStartDate);
        const end = new Date(event.monthlyEndDate);
        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        while (current <= end) {
          if (useWeekday) {
            // Find all dates in this month that match the weekday
            const weekday = start.getDay();
            let d = new Date(current.getFullYear(), current.getMonth(), 1);
            while (d.getMonth() === current.getMonth()) {
              if (d.getDay() === weekday) {
                // Only add if in range
                if (d >= start && d <= end) {
                  expanded.push({
                    event,
                    date: d.toISOString(),
                    timing: event.monthlyTiming,
                  });
                }
              }
              d.setDate(d.getDate() + 1);
            }
          } else {
            // Use provided days
            days.forEach((day) => {
              const d = new Date(current.getFullYear(), current.getMonth(), day);
              if (d.getMonth() === current.getMonth() && d >= start && d <= end) {
                expanded.push({
                  event,
                  date: d.toISOString(),
                  timing: event.monthlyTiming,
                });
              }
            });
          }
          // Next month
          current.setMonth(current.getMonth() + 1);
        }
        hasRecurrence = true;
      }
      if (!hasRecurrence) {
        expanded.push({ event, date: null, timing: null });
      }
    });
    // Deduplicate by event and date
    const seen = new Set();
    return expanded.filter(({ event, date }) => {
      const key =
        (event.id || event.title || JSON.stringify(event)) + "|" + (date || "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  let allEvents = [];
  let filterState = {
    selected: [], // array of subcategory strings
    allSubcategories: [],
    categories: {}, // { category: [subcategories] }
  };

  // --- Date filter button ---

  // State for date filter
  let dateFilterState = {
    selected: [], // [startDate, endDate] or [singleDate]
  };

  function extractCategories(events) {
    const categories = {};
    events.forEach((event) => {
      if (!event.category || !event.subcategory) return;
      if (!categories[event.category]) categories[event.category] = new Set();
      // Handle subcategory as array, comma-separated string, or single string
      let subs = event.subcategory;
      if (typeof subs === "string") {
        subs = subs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(subs)) subs = [subs];
      subs.forEach((sub) => categories[event.category].add(sub));
    });
    // Convert sets to arrays
    Object.keys(categories).forEach((cat) => {
      categories[cat] = Array.from(categories[cat]);
    });
    return categories;
  }

  function getAllSubcategories(categories) {
    return Object.values(categories).flat();
  }

  // Create filter wrapper div if not present
  let filterWrapper = document.querySelector(`.${FILTER_WRAPPER_CLASS}`);
  if (!filterWrapper) {
    filterWrapper = document.createElement("div");
    filterWrapper.className = FILTER_WRAPPER_CLASS;
    wrapper.prepend(filterWrapper);
  }
  // Create filter-button-wrapper for category filter if not present
  let catButtonWrapper = filterWrapper.querySelector(
    ".filter-button-wrapper.category"
  );
  if (!catButtonWrapper) {
    catButtonWrapper = document.createElement("div");
    catButtonWrapper.className = "filter-button-wrapper category";
    filterWrapper.appendChild(catButtonWrapper);
  }
  // Create filter-button-wrapper for date filter if not present
  let dateButtonWrapper = filterWrapper.querySelector(
    ".filter-button-wrapper.date"
  );
  if (!dateButtonWrapper) {
    dateButtonWrapper = document.createElement("div");
    dateButtonWrapper.className = "filter-button-wrapper date";
    filterWrapper.appendChild(dateButtonWrapper);
  }

  // Update renderFilterPill and toggleDropdown to use catButtonWrapper
  function renderFilterPill() {
    let pill = catButtonWrapper.querySelector(`.${FILTER_PILL_CLASS}`);
    if (!pill) {
      pill = document.createElement("button");
      pill.className = FILTER_PILL_CLASS;
      pill.type = "button";
      pill.addEventListener("click", toggleDropdown);
      catButtonWrapper.appendChild(pill);
    }
    pill.textContent = getPillText();
    // Set aria-expanded for chevron animation
    const dropdownOpen = !!catButtonWrapper.querySelector(
      `.${FILTER_DROPDOWN_CLASS}`
    );
    pill.setAttribute("aria-expanded", dropdownOpen ? "true" : "false");
  }

  function getPillText() {
    const sel = filterState.selected;
    const MAX_CHARS = 28;
    if (!sel.length || sel.length === filterState.allSubcategories.length)
      return "All Events";
    if (sel.length === 1) return sel[0];
    if (sel.length === 2 || sel.length === 3) {
      const joined = sel.join(", ");
      if (joined.length > MAX_CHARS) {
        let out = "";
        let i = 0;
        for (; i < sel.length; i++) {
          const next = (out ? ", " : "") + sel[i];
          if ((out + next).length > MAX_CHARS) {
            // If nothing has been added yet, still add part of the first item
            if (!out) {
              out = sel[i].slice(0, MAX_CHARS - 3) + "...";
            } else {
              out +=
                (out ? ", " : "") +
                sel[i].slice(
                  0,
                  Math.max(0, MAX_CHARS - out.length - (out ? 2 : 0) - 3)
                ) +
                "...";
            }
            break;
          }
          out += next;
        }
        // Only add ", ..." if there are more items not shown
        if (i < sel.length - 1) {
          if (!out.endsWith("...")) out += ", ...";
        }
        return out;
      }
      return joined;
    }
    return `${sel.length} Selected`;
  }

  function toggleDropdown() {
    let dropdown = catButtonWrapper.querySelector(`.${FILTER_DROPDOWN_CLASS}`);
    if (dropdown) {
      dropdown.setAttribute("aria-open", "false");
      setTimeout(() => {
        dropdown.remove();
        document.removeEventListener("mousedown", handleOutsideClick, true);
        renderFilterPill(); // update chevron
      }, 350); // match transition duration
      return;
    }
    dropdown = document.createElement("div");
    dropdown.className = FILTER_DROPDOWN_CLASS;
    dropdown.setAttribute("aria-open", "false");
    // Build dropdown content
    let html = `<div class="filter-dropdown-inner">`;
    html += `<div class="filter-dropdown-header"><p class="text-l2">Select Event</p><button type="button" class="${FILTER_SELECT_ALL_BTN_CLASS} text-l3">${
      filterState.selected.length === filterState.allSubcategories.length
        ? "Deselect All"
        : "Select All"
    }</button></div>`;
    Object.entries(filterState.categories).forEach(([cat, subs]) => {
      html += `<div class="filter-category text-l3"><div class="filter-category-title">${cat}</div>`;
      subs.forEach((sub) => {
        const checked = filterState.selected.includes(sub) ? "checked" : "";
        html += `<label class="filter-subcategory text-l2"> ${sub}<input type="checkbox" value="${sub}" ${checked}/></label>`;
      });
      html += `</div>`;
    });
    html += `<button type="button" class="${FILTER_DONE_BTN_CLASS} cta-button">Done</button>`;
    html += `</div>`;
    dropdown.innerHTML = html;
    catButtonWrapper.appendChild(dropdown);
    setTimeout(() => {
      dropdown.setAttribute("aria-open", "true");
    }, 10);
    renderFilterPill(); // update chevron

    // Add outside click handler
    function handleOutsideClick(e) {
      if (
        !dropdown.contains(e.target) &&
        !catButtonWrapper
          .querySelector(`.${FILTER_PILL_CLASS}`)
          .contains(e.target)
      ) {
        dropdown.setAttribute("aria-open", "false");
        setTimeout(() => {
          if (dropdown.parentNode) dropdown.remove();
          document.removeEventListener("mousedown", handleOutsideClick, true);
          renderFilterPill();
        }, 350);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick, true);

    // Add listeners
    dropdown.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const val = e.target.value;
        if (e.target.checked) {
          if (!filterState.selected.includes(val))
            filterState.selected.push(val);
        } else {
          filterState.selected = filterState.selected.filter((s) => s !== val);
        }
        renderFilterPill();
        // Update select all button text
        const selectAllBtn = dropdown.querySelector(
          `.${FILTER_SELECT_ALL_BTN_CLASS}`
        );
        if (selectAllBtn)
          selectAllBtn.textContent =
            filterState.selected.length === filterState.allSubcategories.length
              ? "Deselect All"
              : "Select All";
      });
    });
    dropdown
      .querySelector(`.${FILTER_DONE_BTN_CLASS}`)
      .addEventListener("click", () => {
        dropdown.remove();
        renderEvents(allEvents);
      });
    dropdown
      .querySelector(`.${FILTER_SELECT_ALL_BTN_CLASS}`)
      .addEventListener("click", () => {
        if (
          filterState.selected.length === filterState.allSubcategories.length
        ) {
          filterState.selected = [];
        } else {
          filterState.selected = [...filterState.allSubcategories];
        }
        // Update all checkboxes
        dropdown.querySelectorAll("input[type=checkbox]").forEach((cb) => {
          cb.checked = filterState.selected.includes(cb.value);
        });
        renderFilterPill();
        // Update select all button text
        const selectAllBtn = dropdown.querySelector(
          `.${FILTER_SELECT_ALL_BTN_CLASS}`
        );
        if (selectAllBtn)
          selectAllBtn.textContent =
            filterState.selected.length === filterState.allSubcategories.length
              ? "Deselect All"
              : "Select All";
      });
  }

  // Update renderDateFilterPill and toggleDateDropdown to use dateButtonWrapper
  function renderDateFilterPill() {
    let pill = dateButtonWrapper.querySelector(".date-filter-pill");
    if (!pill) {
      pill = document.createElement("button");
      pill.className = FILTER_PILL_CLASS + " date-filter-pill";
      pill.type = "button";
      pill.addEventListener("click", toggleDateDropdown);
      dateButtonWrapper.appendChild(pill);
    }
    pill.textContent = getDatePillText();
    // Set aria-expanded for chevron animation
    const dropdownOpen =
      !!dateButtonWrapper.querySelector(".calendar-dropdown");
    pill.setAttribute("aria-expanded", dropdownOpen ? "true" : "false");
  }

  function getDatePillText() {
    if (!dateFilterState.selected.length) {
      // Default: today
      const today = new Date();
      return today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    if (dateFilterState.selected.length === 1) {
      const d = dateFilterState.selected[0];
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    if (dateFilterState.selected.length === 2) {
      const d1 = dateFilterState.selected[0];
      const d2 = dateFilterState.selected[1];
      // If same day, show only one date
      if (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      ) {
        return d1.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return `${d1.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })} - ${d2.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }
    return "";
  }

  function toggleDateDropdown() {
    let dropdown = dateButtonWrapper.querySelector(".calendar-dropdown");
    if (dropdown) {
      dropdown.setAttribute("aria-open", "false");
      setTimeout(() => {
        dropdown.remove();
        document.removeEventListener("mousedown", handleOutsideClick, true);
        renderDateFilterPill();
      }, 350);
      return;
    }
    // Create calendar dropdown
    dropdown = createCalendar({
      selectedDate: dateFilterState.selected[0] || new Date(),
      selectedRange:
        dateFilterState.selected.length === 2 ? dateFilterState.selected : null,
      onSelect: (range) => {
        dateFilterState.selected = range.map((d) => new Date(d));
      },
      onDone: () => {
        console.log("Selected dates:", dateFilterState.selected, allEvents);
        dropdown.remove();
        renderDateFilterPill();
        renderEvents(allEvents);
      },
    });
    dateButtonWrapper.appendChild(dropdown);
    setTimeout(() => {
      dropdown.setAttribute("aria-open", "true");
    }, 10);
    renderDateFilterPill();

    function handleOutsideClick(e) {
      if (
        !dropdown.contains(e.target) &&
        !dateButtonWrapper.querySelector(".date-filter-pill").contains(e.target)
      ) {
        dropdown.setAttribute("aria-open", "false");
        setTimeout(() => {
          if (dropdown.parentNode) dropdown.remove();
          document.removeEventListener("mousedown", handleOutsideClick, true);
          renderDateFilterPill();
        }, 350);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick, true);
  }

  function filterEvents(events) {
    if (
      !filterState.selected.length ||
      filterState.selected.length === filterState.allSubcategories.length
    )
      return events;
    return events.filter((event) => {
      if (!event.subcategory) return false;
      let subs = event.subcategory;
      if (typeof subs === "string") {
        subs = subs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(subs)) subs = [subs];
      return subs.some((sub) => filterState.selected.includes(sub));
    });
  }

  // Update renderEvents to call renderDateFilterPill
  function renderEvents(events) {
    renderFilterPill();
    renderDateFilterPill();
    const container = document.querySelector(".events-listing");
    console.log("Rendering events:", events, events.length, allEvents);
    if (!container) return;

    const expanded = expandEvents(events);
    // Sort by date ascending and filter out past events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let futureEvents = expanded.filter(({ date }) => {
      if (!date) return true;
      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
    // Filter by subcategory
    futureEvents = futureEvents.filter(
      ({ event }) => filterEvents([event]).length
    );

    // Filter by date
    if (dateFilterState.selected.length === 1) {
      const d = dateFilterState.selected[0];
      futureEvents = futureEvents.filter(({ date }) => {
        if (!date) return false;
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === d.setHours(0, 0, 0, 0);
      });
    } else if (dateFilterState.selected.length === 2) {
      const [start, end] = dateFilterState.selected;
      const startTime = start.setHours(0, 0, 0, 0);
      const endTime = end.setHours(0, 0, 0, 0);
      futureEvents = futureEvents.filter(({ date }) => {
        if (!date) return false;
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);
        const t = eventDate.getTime();
        return t >= startTime && t <= endTime;
      });
    }
    futureEvents.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    if (!futureEvents || futureEvents.length === 0) {
      container.innerHTML = `<div class="no-events-message">
        <h2 class="text-t1">No hosted experiences today, wander at will</h2>
        <a class="cta-link split-text arrowRight"><span class="animate-underline">Know when experiences arrive</span></a>
      </div>`;
      // Remove pagination if present
      const oldPagination = wrapper.querySelector(".events-pagination");
      if (oldPagination) oldPagination.remove();
      return;
    }

    const pageSize = EVENTS_PER_PAGE;
    let currentPage = 1;
    const totalPages = Math.ceil(futureEvents.length / pageSize);

    function renderPage(page) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      container.innerHTML = futureEvents
        .slice(start, end)
        .map(({ event, date, timing }) => renderEventCard(event, date, timing))
        .join("");
      renderPagination(page);
    }

    function renderPagination(page) {
      // Remove existing pagination if present
      const oldPagination = wrapper.querySelector(".events-pagination");
      if (oldPagination) oldPagination.remove();
      if (totalPages <= 1) return;
      const pagination = document.createElement("div");
      pagination.className = "events-pagination";
      // Left arrow
      const leftArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left h-4 w-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>`;
      const leftArrow = document.createElement("button");
      leftArrow.innerHTML = leftArrowSvg;
      leftArrow.disabled = page === 1;
      leftArrow.className = "arrow-btn left-arrow";
      leftArrow.addEventListener("click", () => {
        if (page > 1) {
          currentPage = page - 1;
          renderPage(currentPage);
        }
      });
      pagination.appendChild(leftArrow);

      // Helper to add a button
      function addBtn(i, isActive = false) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (isActive) btn.classList.add("active");
        btn.addEventListener("click", () => {
          currentPage = i;
          renderPage(currentPage);
        });
        pagination.appendChild(btn);
      }

      // Helper to add ellipsis
      function addEllipsis() {
        const span = document.createElement("span");
        span.textContent = "...";

        pagination.appendChild(span);
      }

      // Pagination logic
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) addBtn(i, i === page);
      } else {
        if (page <= 2) {
          addBtn(1, page === 1);
          addBtn(2, page === 2);
          addEllipsis();
          addBtn(totalPages);
        } else if (page >= totalPages - 1) {
          addBtn(1);
          addEllipsis();
          addBtn(totalPages - 1, page === totalPages - 1);
          addBtn(totalPages, page === totalPages);
        } else {
          addBtn(1);
          addEllipsis();
          addBtn(page, true);
          addEllipsis();
          addBtn(totalPages);
        }
      }

      // Right arrow
      const rightArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right h-4 w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>`;
      const rightArrow = document.createElement("button");
      rightArrow.innerHTML = rightArrowSvg;
      rightArrow.disabled = page === totalPages;
      rightArrow.className = "arrow-btn right-arrow";
      rightArrow.addEventListener("click", () => {
        if (page < totalPages) {
          currentPage = page + 1;
          renderPage(currentPage);
        }
      });
      pagination.appendChild(rightArrow);

      wrapper.appendChild(pagination);
    }

    renderPage(currentPage);
  }

  // Fetch and render events
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const events = data.data?.eventList?.items || [];
      allEvents = events;
      filterState.categories = extractCategories(events);
      filterState.allSubcategories = getAllSubcategories(
        filterState.categories
      );
      filterState.selected = []; // Deselect everything by default
      renderEvents(events);
    })
    .catch(() => {
      const container = document.querySelector(".events-listing");
      if (container) container.innerHTML = "<p>Failed to load events.</p>";
    });
}
