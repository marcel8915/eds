export default async function decorate(block) {
  const API_URL =
    "https://publish-p152536-e1620746.adobeaemcloud.com/graphql/execute.json/CHG/GetEventList";

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getDayOfWeek(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }

  // Helper: get all dates for weekly events
  function getWeeklyDates(start, end, days) {
    const result = [];
    const dayIndexes = days.map((day) => {
      // Accepts both full and short names
      const map = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      return map[day] ?? new Date(day + " 2020").getDay();
    });
    let current = new Date(start);
    const endDate = new Date(end);
    current.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    while (current <= endDate) {
      if (dayIndexes.includes(current.getDay())) {
        result.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  }

  // Helper: get all dates for monthly events
  function getMonthlyDates(start, end, days) {
    const result = [];
    let current = new Date(start);
    const endDate = new Date(end);
    current.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    while (current <= endDate) {
      const day = current.getDate();
      if (days.includes(day) || days.includes(day.toString())) {
        result.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  }

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
    if (!container) return;
    if (!events || events.length === 0) {
      container.innerHTML = "<p>No events found.</p>";
      return;
    }
    const expanded = expandEvents(events);
    // Sort by date ascending
    expanded.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
    container.innerHTML = expanded
      .map(({ event, date, timing }) => renderEventCard(event, date, timing))
      .join("");
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
