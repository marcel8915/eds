// future note
// filter is based on authoring content coming from AEM
// filter values are either {set, user just select what values they want} or {user can input in as string, the values they want}
// either or approach, the values needs to be the same as the values put inside each card
// right now the values are hard coded

import { moveInstrumentation } from "../../scripts/scripts.js";
import { createCalendarBoard } from "./calendar-board.js";
import { createTopicsFilter } from "./topics-filter.js";

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isInRange(date, start, end) {
  if (!date || !start || !end) return false;
  const time = date.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  return time >= startTime && time <= endTime;
}

export default function decorate(block) {
  const container = document.createElement("div");
  container.className = "table-board-container";

  const rows = [...block.children];

  const sectionTitleRow = rows[0];
  let sectionTitle = "";
  if (sectionTitleRow) {
    sectionTitle = sectionTitleRow.textContent.trim();
    sectionTitleRow.remove();
  }

  if (rows.length > 1 && rows[1].textContent.trim() === "") {
    rows[1].remove();
  }

  let viewAllText = "";
  let viewAllLink = "";
  if (rows.length > 2) {
    const viewAllTextRow = rows[2];
    viewAllText = viewAllTextRow.textContent.trim();

    if (rows.length > 3 && rows[3].querySelector(".button-container a")) {
      viewAllLink = rows[3]
        .querySelector(".button-container a")
        .getAttribute("href");

      rows.splice(2, 2);
    }
  }

  const header = document.createElement("div");
  header.className = "table-board-header";
  if (sectionTitle) {
    const titleElement = document.createElement("h2");
    titleElement.className = "table-board-section-title";
    titleElement.textContent = sectionTitle;
    header.append(titleElement);
  }
  container.append(header);

  const allFiltersContainer = document.createElement("div");
  allFiltersContainer.className = "table-board-all-filters-container";

  const dateFilterContainer = document.createElement("div");
  dateFilterContainer.className = "table-board-filter-container";
  const dateFilterButton = document.createElement("button");
  dateFilterButton.className = "table-board-filter-button";

  dateFilterButton.setAttribute("aria-expanded", "false");
  const buttonTextSpan = document.createElement("span");
  buttonTextSpan.className = "table-board-filter-button-text";
  buttonTextSpan.textContent = "Filter by Date";
  const buttonIconSpan = document.createElement("span");
  buttonIconSpan.className = "table-board-filter-button-icon";
  buttonIconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
  dateFilterButton.append(buttonTextSpan, buttonIconSpan);
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "table-board-filter-dropdown-container";
  dateFilterContainer.append(dateFilterButton);
  dateFilterContainer.append(dropdownContainer);

  const allTopics = ["Technology", "Arts & Culture", "Science", "Business"];
  let selectedTopics = [];

  const topicsFilter = createTopicsFilter({
    allTopics: allTopics,
    selectedTopics: selectedTopics,
    onFilterChange: (newSelectedTopics) => {
      selectedTopics = newSelectedTopics;

      applyAllFilters();
    },
  });

  allFiltersContainer.append(topicsFilter);
  allFiltersContainer.append(dateFilterContainer);

  container.append(allFiltersContainer);

  const itemsContainer = document.createElement("div");
  itemsContainer.className = "table-board-items";

  let originalItems = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const columns = [...row.children];
    if (columns.length < 5) continue;
    const item = document.createElement("div");
    item.className = "table-board-item";
    moveInstrumentation(row, item);

    let itemDate = null;
    const dateCol = columns[1];
    if (dateCol) {
      const dateStr = dateCol.textContent.trim();
      if (dateStr) {
        itemDate = new Date(dateStr);
        item.dataset.date = itemDate.toISOString();
      }
    }

    const topic = allTopics[i % allTopics.length];
    item.dataset.topic = topic;

    const itemContent = document.createElement("div");
    itemContent.className = "table-board-item-content";

    const imageCol = columns[0];
    if (imageCol && imageCol.querySelector("picture")) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "table-board-image-container";
      const picture = imageCol.querySelector("picture");
      const clonedPicture = picture.cloneNode(true);
      moveInstrumentation(picture, clonedPicture);
      imageContainer.append(clonedPicture);
      itemContent.append(imageContainer);
    }
    const textContent = document.createElement("div");
    textContent.className = "table-board-text-content";
    if (dateCol) {
      const dateElement = document.createElement("div");
      dateElement.className = "text-l1 table-board-date";
      dateElement.textContent = dateCol.textContent.trim();
      moveInstrumentation(dateCol, dateElement);
      textContent.append(dateElement);
    }
    const titleCol = columns[2];
    const titleLinkCol = columns[3];
    if (titleCol) {
      const titleWrapper = document.createElement("div");
      titleWrapper.className = "table-board-item-title text-h2";
      moveInstrumentation(titleCol, titleWrapper);
      const titleText = titleCol.textContent.trim();
      const titleHtml = titleCol.innerHTML.trim();
      const hasNewline = titleText.includes("\n") || titleHtml.includes("<br>");
      if (titleLinkCol && titleLinkCol.querySelector("a")) {
        const link = titleLinkCol.querySelector("a").getAttribute("href");
        const linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.className = "table-board-title-link";
        linkElement.style.whiteSpace = "pre-line";
        const originalLink = titleLinkCol.querySelector("a");
        moveInstrumentation(originalLink, linkElement);
        const groupContainer = document.createElement("div");
        groupContainer.className = "table-board-title-group";
        if (hasNewline) {
          const lines = titleText.split("\n");
          groupContainer.appendChild(document.createTextNode(lines[0].trim()));
          groupContainer.appendChild(document.createElement("br"));
          const secondLine = document.createElement("span");
          secondLine.className = "table-board-title-line";
          secondLine.textContent = lines[1] ? lines[1].trim() : "";
          const underline = document.createElement("span");
          underline.className = "table-board-title-underline";
          secondLine.appendChild(underline);
          groupContainer.appendChild(secondLine);
        } else {
          const titleLine = document.createElement("span");
          titleLine.className = "table-board-title-line";
          titleLine.textContent = titleText;
          const underline = document.createElement("span");
          underline.className = "table-board-title-underline";
          titleLine.appendChild(underline);
          groupContainer.appendChild(titleLine);
        }
        linkElement.appendChild(groupContainer);
        titleWrapper.appendChild(linkElement);
      } else {
        titleWrapper.textContent = titleText;
      }
      textContent.append(titleWrapper);
    }
    const descCol = columns[4];
    if (descCol) {
      const descElement = document.createElement("div");
      descElement.className = "text-p2 table-board-description";
      descElement.innerHTML = descCol.innerHTML;
      moveInstrumentation(descCol, descElement);
      textContent.append(descElement);
    }
    if (columns.length > 6) {
      const buttonTextCol = columns[5];
      const buttonLinkCol = columns[6];
      if (buttonTextCol && buttonLinkCol && buttonLinkCol.querySelector("a")) {
        const buttonText =
          buttonTextCol.textContent.trim() || "View Press Info";
        const buttonLink = buttonLinkCol
          .querySelector("a")
          .getAttribute("href");
        if (buttonLink) {
          const mobileButton = document.createElement("a");
          mobileButton.href = buttonLink;
          mobileButton.target = "_blank";
          mobileButton.rel = "noopener noreferrer";
          mobileButton.className = "table-board-mobile-button secondary-button";
          const originalButtonLink = buttonLinkCol.querySelector("a");
          moveInstrumentation(originalButtonLink, mobileButton);
          const underlineContainer = document.createElement("span");
          underlineContainer.className = "underline-container";
          underlineContainer.textContent = buttonText;
          const underline = document.createElement("span");
          underline.className = "underline";
          underlineContainer.appendChild(underline);
          mobileButton.appendChild(underlineContainer);
          textContent.append(mobileButton);
        }
      }
    }

    itemContent.append(textContent);
    item.append(itemContent);
    originalItems.push({ element: item, date: itemDate, topic: topic });
    itemsContainer.append(item);
  }
  container.append(itemsContainer);

  let selectedDates = [];
  const formatDateRange = (range) => {
    if (!range || range.length === 0 || !range[0]) return "Filter by Date";
    const options = { month: "short", day: "numeric", year: "numeric" };
    const fromDate = range[0].toLocaleDateString("en-US", options);
    if (range.length === 1 || isSameDay(range[0], range[1])) return fromDate;
    const toDate = range[1].toLocaleDateString("en-US", options);
    return `${fromDate} – ${toDate}`;
  };

  function applyAllFilters() {
    itemsContainer.innerHTML = "";
    originalItems.forEach((item) => {
      const dateMatch = (() => {
        if (!selectedDates || selectedDates.length === 0) return true;
        const [start, end] =
          selectedDates.length === 1
            ? [selectedDates[0], selectedDates[0]]
            : selectedDates;
        return item.date && isInRange(item.date, start, end);
      })();

      const topicMatch = (() => {
        if (
          selectedTopics.length === 0 ||
          selectedTopics.length === allTopics.length
        )
          return true;
        return selectedTopics.includes(item.topic);
      })();

      if (dateMatch && topicMatch) {
        itemsContainer.append(item.element);
      }
    });
  }

  const calendar = createCalendarBoard({
    onSelect: (dates) => {
      selectedDates = dates;
      buttonTextSpan.textContent = formatDateRange(dates);
      applyAllFilters();
    },
    onDone: () => {
      dateFilterButton.setAttribute("aria-expanded", "false");
    },
  });
  dropdownContainer.append(calendar);

  dateFilterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded =
      dateFilterButton.getAttribute("aria-expanded") === "true";
    dateFilterButton.setAttribute("aria-expanded", !isExpanded);
  });

  document.addEventListener("click", () => {
    dateFilterButton.setAttribute("aria-expanded", "false");
  });

  if (viewAllLink && viewAllText) {
    const viewAllContainer = document.createElement("div");
    viewAllContainer.className = "table-board-view-all";
    const viewAllLinkElement = document.createElement("a");
    viewAllLinkElement.href = viewAllLink;
    viewAllLinkElement.target = "_blank";
    viewAllLinkElement.rel = "noopener noreferrer";
    viewAllLinkElement.className = "table-board-view-all-link";
    const underlineContainer = document.createElement("span");
    underlineContainer.className = "underline-container";
    underlineContainer.textContent = viewAllText;
    const underline = document.createElement("span");
    underline.className = "underline";
    underlineContainer.appendChild(underline);
    viewAllLinkElement.innerHTML = "";
    viewAllLinkElement.appendChild(underlineContainer);
    viewAllContainer.append(viewAllLinkElement);
    container.append(viewAllContainer);
  }

  block.innerHTML = "";
  block.append(container);
}
