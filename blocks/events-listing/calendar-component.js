// Calendar component for date selection in events filter
// Exports a function that returns a DOM element for the calendar popup
// Usage: createCalendar({ selectedDate, selectedRange, onSelect, onDone })

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatMonthYear(date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function isSameDay(d1, d2) {
  return (
    d1 &&
    d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isInRange(date, start, end) {
  if (!start || !end) return false;
  const t = date.setHours(0, 0, 0, 0);
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(0, 0, 0, 0);
}

export function createCalendar({
  selectedDate = null,
  selectedRange = null,
  onSelect = () => {},
  onDone = () => {},
  minDate = null,
  maxDate = null,
} = {}) {
  let currentMonth = selectedDate ? new Date(selectedDate) : new Date();
  currentMonth.setDate(1);
  let rangeStart = selectedRange ? new Date(selectedRange[0]) : null;
  let rangeEnd = selectedRange ? new Date(selectedRange[1]) : null;
  let tempStart = rangeStart;
  let tempEnd = rangeEnd;

  const calendar = document.createElement("div");
  calendar.className = "events-filter-dropdown calendar-dropdown";
  calendar.setAttribute("aria-open", "false");

  function render() {
    calendar.innerHTML = "";
    // Header
    const header = document.createElement("div");
    header.className = "filter-dropdown-header";
    const left = document.createElement("button");
    left.type = "button";
    const leftArrowImg = document.createElement("img");
    leftArrowImg.src = "./icons/arrow.svg";
    leftArrowImg.alt = "Previous month";
    leftArrowImg.width = 24;
    leftArrowImg.height = 24;
    leftArrowImg.style.filter = "invert(1)";
    left.onmouseenter = () => {
      if (!left.disabled) {
        leftArrowImg.style.filter = "invert(1) brightness(2)";
      }
    };
    left.onmouseleave = () => {
      if (!left.disabled) {
        leftArrowImg.style.filter = "invert(1)";
      }
    };
    left.appendChild(leftArrowImg);
    left.className = "calendar-nav calendar-nav-left";
    // Disable left arrow if at current month (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCurrentMonth =
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth();
    if (isCurrentMonth) {
      left.disabled = true;
      left.classList.add("calendar-nav-disabled");
    } else {
      left.onclick = () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        render();
      };
    }
    const right = document.createElement("button");
    right.type = "button";
    const rightArrowImg = document.createElement("img");
    rightArrowImg.src = "./icons/arrow.svg";
    rightArrowImg.alt = "Next month";
    rightArrowImg.width = 24;
    rightArrowImg.height = 24;
    rightArrowImg.style.filter = "invert(1)";
    rightArrowImg.style.transform = "rotate(180deg)";
    right.onmouseenter = () => {
      rightArrowImg.style.filter = "invert(1) brightness(2)";
    };
    right.onmouseleave = () => {
      rightArrowImg.style.filter = "invert(1)";
    };
    right.appendChild(rightArrowImg);
    right.className = "calendar-nav calendar-nav-right";
    right.onclick = () => {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      render();
    };
    const label = document.createElement("span");
    label.className = "calendar-month-label text-l2";
    label.textContent = formatMonthYear(currentMonth);
    header.append(left, label, right);
    calendar.appendChild(header);

    // Days of week (start from Monday)
    const daysRow = document.createElement("div");
    daysRow.className = "calendar-days-row";
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    days.forEach((d) => {
      const el = document.createElement("p");
      el.className = "calendar-day-label";
      el.textContent = d;
      daysRow.appendChild(el);
    });
    calendar.appendChild(daysRow);

    // Dates grid (start from Monday, fill previous month's trailing days)
    const grid = document.createElement("div");
    grid.className = "calendar-grid";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, 1fr)";
    const firstDay = new Date(currentMonth);
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7; // treat Sunday as 7
    // Calculate previous month's trailing days
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    );
    const prevMonthDays = prevMonth.getDate();
    // Fill previous month's trailing days (now as buttons)
    for (let i = startDay - 1; i > 0; i--) {
      const prevDate = prevMonthDays - i + 1;
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        prevDate
      );
      date.setHours(0, 0, 0, 0);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-date-blank calendar-date-prev";
      btn.textContent = prevDate;
      // Disable if before today
      if (date < today) {
        btn.disabled = true;
        btn.classList.add("calendar-date-disabled");
      }
      if ((minDate && date < minDate) || (maxDate && date > maxDate)) {
        btn.disabled = true;
        btn.classList.add("calendar-date-disabled");
      }
      // Highlight selected, in range, or today
      const isSelected = isSameDay(date, tempStart) && isSameDay(date, tempEnd);
      if (isSelected) {
        btn.classList.add("calendar-date-selected");
      } else if (tempStart && tempEnd && isInRange(date, tempStart, tempEnd)) {
        btn.classList.add("calendar-date-inrange");
      }
      // Add class for today (current date)
      if (isSameDay(date, today)) {
        btn.classList.add("calendar-date-today");
        if (!tempStart && !tempEnd) {
          btn.classList.add("calendar-date-today");
        }
      }
      btn.onclick = () => {
        if (btn.disabled) return;
        // Use same selection logic as main dates
        if (!tempStart && !tempEnd) {
          tempStart = date;
          tempEnd = date;
        } else if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
          if (isSameDay(date, tempStart)) {
            tempStart = null;
            tempEnd = null;
          } else {
            if (date < tempStart) {
              tempEnd = tempStart;
              tempStart = date;
            } else {
              tempEnd = date;
            }
          }
        } else if (tempStart && tempEnd && !isSameDay(tempStart, tempEnd)) {
          tempStart = date;
          tempEnd = date;
        }
        render();
      };
      grid.appendChild(btn);
    }
    // Dates of current month
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );
      date.setHours(0, 0, 0, 0);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-date-btn";
      btn.textContent = d;
      // Disable if before today
      if (date < today) {
        btn.disabled = true;
        btn.classList.add("calendar-date-disabled");
      }
      // Disabled if out of min/max
      if ((minDate && date < minDate) || (maxDate && date > maxDate)) {
        btn.disabled = true;
        btn.classList.add("calendar-date-disabled");
      }
      // Highlight selected, in range, or today
      const isSelected = isSameDay(date, tempStart) && isSameDay(date, tempEnd);
      if (isSelected) {
        btn.classList.add("calendar-date-selected");
      } else if (tempStart && tempEnd && isInRange(date, tempStart, tempEnd)) {
        btn.classList.add("calendar-date-inrange");
      }
      // Add class for today (current date)
      if (isSameDay(date, today)) {
        btn.classList.add("calendar-date-today");
        if (!tempStart && !tempEnd) {
          btn.classList.add("calendar-date-today");
        }
      }
      btn.onclick = () => {
        if (btn.disabled) return;
        // If nothing selected, start new selection
        if (!tempStart && !tempEnd) {
          tempStart = date;
          tempEnd = date;
        } else if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
          // Single date selected
          if (isSameDay(date, tempStart)) {
            // Deselect if clicking same date
            tempStart = null;
            tempEnd = null;
          } else {
            // Set range (order agnostic)
            if (date < tempStart) {
              tempEnd = tempStart;
              tempStart = date;
            } else {
              tempEnd = date;
            }
          }
        } else if (tempStart && tempEnd && !isSameDay(tempStart, tempEnd)) {
          // Range already selected, start new selection
          tempStart = date;
          tempEnd = date;
        }
        render();
      };
      grid.appendChild(btn);
    }
    // Calculate next month's leading days
    const totalCells = startDay - 1 + daysInMonth;
    const nextDays = (7 - (totalCells % 7)) % 7;
    // Fill next month's leading days to complete the last week (now as buttons)
    for (let i = 1; i <= nextDays; i++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        i
      );
      date.setHours(0, 0, 0, 0);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-date-blank calendar-date-next";
      btn.textContent = i;
      // Disable if before today
      if (date < today) {
        btn.disabled = true;
        btn.classList.add("calendar-date-disabled");
      }
      if ((minDate && date < minDate) || (maxDate && date > maxDate)) {
        btn.disabled = true;
        btn.classList.add("calendar-date-disabled");
      }
      // Highlight selected, in range, or today
      const isSelected = isSameDay(date, tempStart) && isSameDay(date, tempEnd);
      if (isSelected) {
        btn.classList.add("calendar-date-selected");
      } else if (tempStart && tempEnd && isInRange(date, tempStart, tempEnd)) {
        btn.classList.add("calendar-date-inrange");
      }
      // Add class for today (current date)
      if (isSameDay(date, today)) {
        btn.classList.add("calendar-date-today");
        if (!tempStart && !tempEnd) {
          btn.classList.add("calendar-date-today");
        }
      }
      btn.onclick = () => {
        if (btn.disabled) return;
        // Use same selection logic as main dates
        if (!tempStart && !tempEnd) {
          tempStart = date;
          tempEnd = date;
        } else if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
          if (isSameDay(date, tempStart)) {
            tempStart = null;
            tempEnd = null;
          } else {
            if (date < tempStart) {
              tempEnd = tempStart;
              tempStart = date;
            } else {
              tempEnd = date;
            }
          }
        } else if (tempStart && tempEnd && !isSameDay(tempStart, tempEnd)) {
          tempStart = date;
          tempEnd = date;
        }
        render();
      };
      grid.appendChild(btn);
    }
    calendar.appendChild(grid);

    // Done button (restore)
    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.className = "events-filter-done-btn cta-button";
    doneBtn.textContent = "Done";
    doneBtn.onclick = () => {
      // If nothing selected, clear filter
      if (!tempStart && !tempEnd) {
        onSelect([]);
      } else if (tempStart && tempEnd) {
        onSelect([tempStart, tempEnd]);
      } else if (tempStart) {
        onSelect([tempStart]);
      }
      onDone();
    };
    calendar.appendChild(doneBtn);
  }

  render();

  return calendar;
}
