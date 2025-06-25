// events-listing-utils.js
// Utility functions for events-listing.js

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDayOfWeek(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function getWeeklyDates(start, end, days) {
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

export function getMonthlyDates(start, end, days) {
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
