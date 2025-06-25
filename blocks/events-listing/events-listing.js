const EVENTS_PER_PAGE = 8;

import {
  formatDate,
  getDayOfWeek,
  getWeeklyDates,
  getMonthlyDates,
} from "./events-listing-utils.js";

export default async function decorate(block) {
  const API_URL =
    "https://publish-p152536-e1620746.adobeaemcloud.com/graphql/execute.json/CHG/GetEventList";

  function renderEventCard(event, dateObj, timing) {
    console.log(event);
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
      if (event.onceDate) {
        expanded.push({
          event,
          date: event.onceDate,
          timing: event.onceTiming,
        });
      } else if (event.dailyStartDate && event.dailyEndDate) {
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
      } else if (
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
      } else if (
        event.monthlyStartDate &&
        event.monthlyEndDate &&
        event.monthlyDays &&
        event.monthlyDays.length
      ) {
        const days = event.monthlyDays.map((d) => parseInt(d, 10));
        const dates = getMonthlyDates(
          event.monthlyStartDate,
          event.monthlyEndDate,
          days
        );
        dates.forEach((dateObj) => {
          expanded.push({
            event,
            date: dateObj.toISOString(),
            timing: event.monthlyTiming,
          });
        });
      } else {
        expanded.push({ event, date: null, timing: null });
      }
    });
    return expanded;
  }

  function renderEvents(events) {
    const container = document.querySelector(".events-listing");
    const wrapper = document.querySelector(".events-listing-wrapper");
    if (!container) return;
    if (!events || events.length === 0) {
      container.innerHTML = "<p>No events found.</p>";
      return;
    }
    const expanded = expandEvents(events);
    // Sort by date ascending and filter out past events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureEvents = expanded.filter(({ date }) => {
      if (!date) return true;
      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
    futureEvents.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

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
      renderEvents(events);
    })
    .catch(() => {
      const container = document.querySelector(".events-listing");
      if (container) container.innerHTML = "<p>Failed to load events.</p>";
    });
}
