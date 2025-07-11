import { moveInstrumentation } from "../../scripts/scripts.js";
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

  const allRows = [...block.children];

  const sectionTitle = allRows[0]?.textContent.trim() || "";
  const viewAllText = allRows[2]?.textContent.trim() || "";
  const viewAllLink =
    allRows[3]?.querySelector("a")?.getAttribute("href") || "";

  const topicsString = allRows[4]?.textContent.trim() || "";
  const allTopics = topicsString
    ? [
        ...new Set(
          topicsString.split(",").map((topic) => topic.trim().toLowerCase())
        ),
      ]
    : [];

  const itemRows = allRows.slice(5);
  block.innerHTML = "";

  // header section
  const header = document.createElement("div");
  header.className = "table-board-header";
  if (sectionTitle) {
    const titleElement = document.createElement("h2");
    titleElement.className = "table-board-section-title";
    titleElement.textContent = sectionTitle;
    header.append(titleElement);
  }
  container.append(header);

  // filters container
  const allFiltersContainer = document.createElement("div");
  allFiltersContainer.className = "table-board-all-filters-container";

  // date ranges configuration
  const dateRanges = [
    {
      label: "Jan 2025 - Mar 2025",
      start: new Date(2025, 0, 1),
      end: new Date(2025, 2, 31),
    },
    {
      label: "Apr 2025 - Jun 2025",
      start: new Date(2025, 3, 1),
      end: new Date(2025, 5, 30),
    },
    {
      label: "Jul 2025 - Sep 2025",
      start: new Date(2025, 6, 1),
      end: new Date(2025, 8, 30),
    },
    {
      label: "Oct 2025 - Dec 2025",
      start: new Date(2025, 9, 1),
      end: new Date(2025, 11, 31),
    },
  ];

  let selectedDateRange = null;
  const dateRangeFilter = createTopicsFilter({
    allTopics: dateRanges.map((range) => range.label),
    activeTopic: "All Dates",
    defaultLabel: "All Dates",
    onFilterChange: (selectedLabel) => {
      selectedDateRange =
        selectedLabel === "All Dates"
          ? null
          : dateRanges.find((range) => range.label === selectedLabel);
      applyAllFilters();
    },
  });

  let selectedTopics = [];
  const topicsFilter = createTopicsFilter({
    allTopics: allTopics,
    activeTopic: "All Topics",
    defaultLabel: "All Topics",
    onFilterChange: (selectedLabel) => {
      selectedTopics =
        selectedLabel === "All Topics" ? [] : [selectedLabel.toLowerCase()]; // Store lowercase for comparison
      applyAllFilters();
    },
  });

  allFiltersContainer.append(topicsFilter);
  allFiltersContainer.append(dateRangeFilter);
  container.append(allFiltersContainer);

  // Items container
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "table-board-items";
  let originalItems = [];

  // Process each item row
  itemRows.forEach((row) => {
    const columns = [...row.children];
    if (columns.length < 8) return;

    const item = document.createElement("div");
    item.className = "table-board-item";
    moveInstrumentation(row, item);

    // process date
    let itemDate = null;
    const dateCol = columns[1];
    if (dateCol) {
      const dateStr = dateCol.textContent.trim();
      if (dateStr) {
        itemDate = new Date(dateStr);
        item.dataset.date = itemDate.toISOString();
      }
    }

    // process category (lowercase)
    const category = columns[7]?.textContent.trim().toLowerCase() || "";
    item.dataset.category = category;

    const itemContent = document.createElement("div");
    itemContent.className = "table-board-item-content";

    // image handling
    const imageCol = columns[0];
    if (imageCol?.querySelector("picture")) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "table-board-image-container";
      const picture = imageCol.querySelector("picture");
      const clonedPicture = picture.cloneNode(true);
      moveInstrumentation(picture, clonedPicture);
      imageContainer.append(clonedPicture);
      itemContent.append(imageContainer);
    }

    // text content
    const textContent = document.createElement("div");
    textContent.className = "table-board-text-content";

    // date
    if (dateCol) {
      const dateElement = document.createElement("div");
      dateElement.className = "text-l1 table-board-date";
      dateElement.textContent = dateCol.textContent.trim();
      moveInstrumentation(dateCol, dateElement);
      textContent.append(dateElement);
    }

    // title with optional link
    const titleCol = columns[2];
    const titleLinkCol = columns[3];
    if (titleCol) {
      const titleWrapper = document.createElement("div");
      titleWrapper.className = "table-board-item-title text-h2";
      moveInstrumentation(titleCol, titleWrapper);
      const titleText = titleCol.textContent.trim();

      if (titleLinkCol?.querySelector("a")) {
        const link = titleLinkCol.querySelector("a").getAttribute("href");
        const linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.className = "table-board-title-link";
        linkElement.textContent = titleText;
        titleWrapper.append(linkElement);
      } else {
        titleWrapper.textContent = titleText;
      }
      textContent.append(titleWrapper);
    }

    // description
    const descCol = columns[4];
    if (descCol) {
      const descElement = document.createElement("div");
      descElement.className = "text-p2 table-board-description";
      descElement.innerHTML = descCol.innerHTML;
      moveInstrumentation(descCol, descElement);
      textContent.append(descElement);
    }

    // button
    const buttonTextCol = columns[5];
    const buttonLinkCol = columns[6];
    if (buttonTextCol && buttonLinkCol?.querySelector("a")) {
      const buttonText = buttonTextCol.textContent.trim() || "View Press Info";
      const buttonLink = buttonLinkCol.querySelector("a").getAttribute("href");
      if (buttonLink) {
        const button = document.createElement("a");
        button.href = buttonLink;
        button.target = "_blank";
        button.rel = "noopener noreferrer";
        button.className = "table-board-mobile-button secondary-button";
        button.textContent = buttonText;
        textContent.append(button);
      }
    }

    itemContent.append(textContent);
    item.append(itemContent);
    originalItems.push({ element: item, date: itemDate, category });
    itemsContainer.append(item);
  });

  container.append(itemsContainer);

  // filtering function
  function applyAllFilters() {
    itemsContainer.innerHTML = "";

    originalItems.forEach((item) => {
      const dateMatch =
        !selectedDateRange ||
        (item.date &&
          isInRange(item.date, selectedDateRange.start, selectedDateRange.end));

      const categoryMatch =
        selectedTopics.length === 0 ||
        selectedTopics.some((topic) => item.category === topic.toLowerCase());

      if (dateMatch && categoryMatch) {
        itemsContainer.append(item.element);
      }
    });
  }

  if (viewAllLink && viewAllText) {
    const viewAllContainer = document.createElement("div");
    viewAllContainer.className = "table-board-view-all";
    const viewAllLinkElement = document.createElement("a");
    viewAllLinkElement.href = viewAllLink;
    viewAllLinkElement.target = "_blank";
    viewAllLinkElement.rel = "noopener noreferrer";
    viewAllLinkElement.className = "table-board-view-all-link";
    viewAllLinkElement.textContent = viewAllText;
    viewAllContainer.append(viewAllLinkElement);
    container.append(viewAllContainer);
  }

  block.append(container);
}
