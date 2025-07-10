export async function fetchVenueEvents(venue) {
  const API_URL = `https://publish-p152536-e1620746.adobeaemcloud.com/graphql/execute.json/CHG/GetEventListByVenue;venue=${venue}`;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return expandEvents(data.data?.eventList?.items || []);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

function expandEvents(events) {
  const expanded = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  events.forEach((event) => {
    if (event.frequency === "Once" && event.onceDate) {
      const eventDate = new Date(event.onceDate);
      if (eventDate >= today) {
        expanded.push({
          ...event,
          displayDate: eventDate,
          displayTiming: event.onceTiming,
          // Extract hours for sorting
          sortTime: extractTimeValue(event.onceTiming),
        });
      }
    } else if (
      event.frequency === "Daily" &&
      event.dailyStartDate &&
      event.dailyEndDate
    ) {
      const start = new Date(event.dailyStartDate);
      const end = new Date(event.dailyEndDate);
      let current = new Date(start);

      while (current <= end) {
        if (current >= today) {
          expanded.push({
            ...event,
            displayDate: new Date(current),
            displayTiming: event.dailyTiming,
            sortTime: extractTimeValue(event.dailyTiming),
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (
      event.frequency === "Weekly" &&
      event.weeklyStartDate &&
      event.weeklyEndDate &&
      event.weeklyDays?.length
    ) {
      const start = new Date(event.weeklyStartDate);
      const end = new Date(event.weeklyEndDate);
      const days = event.weeklyDays.map((day) =>
        [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].indexOf(day)
      );

      let current = new Date(start);
      while (current <= end) {
        if (current >= today && days.includes(current.getDay())) {
          expanded.push({
            ...event,
            displayDate: new Date(current),
            displayTiming: event.weeklyTiming,
            sortTime: extractTimeValue(event.weeklyTiming),
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (
      event.frequency === "Monthly" &&
      event.monthlyStartDate &&
      event.monthlyEndDate
    ) {
      const start = new Date(event.monthlyStartDate);
      const end = new Date(event.monthlyEndDate);
      const startDay = start.getDate();

      let current = new Date(start);
      while (current <= end) {
        if (current >= today && current.getDate() === startDay) {
          expanded.push({
            ...event,
            displayDate: new Date(current),
            displayTiming: event.monthlyTiming,
            sortTime: extractTimeValue(event.monthlyTiming),
          });
        }
        current.setMonth(current.getMonth() + 1);
      }
    }
  });

  function extractTimeValue(timing) {
    if (!timing) return 0;

    const timeStr = timing.split("–")[0].trim();

    const timeMatch = timeStr.match(/(\d+)(?::\d+)?\s*(am|pm)?/i);
    if (!timeMatch) return 0;

    let hours = parseInt(timeMatch[1]);
    const period = timeMatch[2]?.toLowerCase();

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return hours;
  }

  return expanded
    .sort((a, b) => {
      const dateDiff = a.displayDate - b.displayDate;
      if (dateDiff !== 0) return dateDiff;
      return (a.sortTime || 0) - (b.sortTime || 0);
    })
    .slice(0, 7)
    .map((event) => ({
      ...event,
      dayOfWeek: event.displayDate.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      shortDate: event.displayDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: event.displayDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
}
