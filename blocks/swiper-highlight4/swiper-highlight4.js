import { isUniversalEditor } from "../../scripts/aem.js";
import { loadSwiper } from "../../scripts/utils.js";
import { fetchVenueEvents } from "./events-api.js";

export default async function decorate(block) {
  const isAuthoring = isUniversalEditor();

  block.classList.add("swiper-highlight4-container");

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container-highlight4";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "swiper-highlight4-arrows-container";

  const leftArrow = document.createElement("button");
  leftArrow.className = "swiper-highlight4-arrow-button highlight4-left-arrow";
  leftArrow.innerHTML = `<div class="highlight4-arrow-icon"></div>`;
  leftArrow.setAttribute("aria-label", "Previous Slide");
  leftArrow.style.opacity = "0";

  const rightArrow = document.createElement("button");
  rightArrow.className =
    "swiper-highlight4-arrow-button highlight4-right-arrow";
  rightArrow.innerHTML = `<div class="highlight4-arrow-icon"></div>`;
  rightArrow.setAttribute("aria-label", "Next Slide");

  arrowsContainer.append(leftArrow, rightArrow);
  block.appendChild(arrowsContainer);

  const cards = [];

  if (isAuthoring) {
    const rows = [...block.children];
    rows.forEach((row) => {
      if (!row.textContent.trim() && !row.querySelector("picture")) return;
      if (row === arrowsContainer) return;
      processRow(row, isAuthoring, cards, swiperWrapper);
    });
  } else {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const venue = (
      pathSegments[pathSegments.length - 1] || "P72"
    ).toUpperCase();
    const events = await fetchVenueEvents(venue);

    events.forEach((event) => {
      const row = document.createElement("div");
      row.className = "swiper-slide";
      row.dataset.displayDate = event.displayDate;

      const imageCell = document.createElement("div");
      if (event.images?.[0]?._publishUrl) {
        const picture = document.createElement("picture");
        const img = document.createElement("img");
        img.src = event.images[0]._publishUrl;
        img.alt = event.title;
        picture.appendChild(img);
        imageCell.appendChild(picture);
      }

      const labelCell = document.createElement("div");
      labelCell.textContent = event.category;

      const titleCell = document.createElement("div");
      titleCell.textContent = event.title;

      const descCell = document.createElement("div");
      descCell.textContent = event.description;

      const timeCell = document.createElement("div");
      timeCell.textContent = event.displayTiming || "";

      const venueCell = document.createElement("div");
      venueCell.textContent = event.venue || "";

      row.append(
        imageCell,
        labelCell,
        titleCell,
        descCell,
        timeCell,
        venueCell
      );
      processRow(row, isAuthoring, cards, swiperWrapper, event);
    });
  }

  swiperContainer.appendChild(swiperWrapper);
  block.appendChild(swiperContainer);

  if (isAuthoring) {
    swiperContainer.style.display = "flex";
    swiperWrapper.style.display = "flex";
    swiperWrapper.style.gap = "24px";
    arrowsContainer.style.display = "none";
    block.classList.add("swiper-highlight4-authoring");
    return;
  }

  await loadSwiper();

  const positionArrows = (swiper) => {
    if (!cards.length) return;
    const activeIndex = swiper.activeIndex;
    const activeCard = cards[activeIndex];
    if (activeCard) {
      const cardHeight = activeCard.offsetHeight;
      arrowsContainer.style.height = `${cardHeight}px`;
      const arrowHeight = 40;
      const centerPosition = cardHeight / 2 - arrowHeight / 2;
      leftArrow.style.top = `${centerPosition}px`;
      rightArrow.style.top = `${centerPosition}px`;
    }
  };

  const swiper = new Swiper(swiperContainer, {
    slidesPerView: 1.25,
    spaceBetween: 24,
    freeMode: true,
    keyboard: { enabled: true, onlyInViewport: true },
    watchOverflow: true,
    preventClicksPropagation: true,
    resistance: true,
    resistanceRatio: 0.85,
    mousewheel: { forceToAxis: true },
    breakpoints: { 640: { slidesPerView: 2 } },
    navigation: { nextEl: rightArrow, prevEl: leftArrow },
    on: {
      init: (s) => {
        updateArrowVisibility(s);
        positionArrows(s);
        if (!cards.length) arrowsContainer.style.height = "400px";
      },
      progress: (s) => updateArrowVisibility(s),
      slideChange: (s) => positionArrows(s),
      resize: (s) => positionArrows(s),
    },
  });

  function updateArrowVisibility(s) {
    leftArrow.style.opacity = s.isBeginning ? "0" : "1";
    rightArrow.style.opacity = s.isEnd ? "0" : "1";
    leftArrow.style.pointerEvents = s.isBeginning ? "none" : "auto";
    rightArrow.style.pointerEvents = s.isEnd ? "none" : "auto";
  }

  if (window.ResizeObserver && cards.length) {
    const resizeObserver = new ResizeObserver(() => positionArrows(swiper));
    cards.forEach((card) => resizeObserver.observe(card));
  }
}

function processRow(row, isAuthoring, cards, swiperWrapper, event) {
  row.className = isAuthoring
    ? "swiper-slide-highlight4 authoring-slide"
    : "swiper-slide";

  const card = document.createElement("div");
  card.className = "highlight4-card";
  cards.push(card);

  const sections = Array.from(row.children);
  const [imageCell, labelCell, titleCell, descCell, timeCell, venueCell] =
    sections;

  const picture = imageCell?.querySelector("picture");
  if (picture) {
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "highlight4-image-container";
    imageWrapper.appendChild(picture);
    card.appendChild(imageWrapper);
    if (imageCell) imageCell.style.display = "none";
  }

  const cardContent = document.createElement("div");
  cardContent.className = "highlight4-card-content";

  if (!isAuthoring && row.dataset.displayDate) {
    const displayDate = new Date(row.dataset.displayDate);
    const calendarContainer = document.createElement("div");
    calendarContainer.className = "highlight4-calendar-container";

    const weekday = document.createElement("div");
    weekday.className = "highlight4-calendar-weekday";
    weekday.textContent = displayDate.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const dayMonth = document.createElement("div");
    dayMonth.className = "highlight4-calendar-day-month";
    dayMonth.textContent = `${displayDate.getDate()} ${displayDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
      }
    )}`;

    calendarContainer.append(weekday, dayMonth);
    cardContent.appendChild(calendarContainer);
  }

  const mainRow = document.createElement("div");
  mainRow.className = "highlight4-card-content__main-row";

  const leftCol = document.createElement("div");
  leftCol.className = "highlight4-card-content__left-col";

  const rightCol = document.createElement("div");
  rightCol.className = "highlight4-card-content__right-col";

  if (labelCell?.textContent.trim()) {
    const labelEl = document.createElement("div");
    labelEl.className = "highlight4-card-label text-l2";
    labelEl.innerHTML = `<p>${labelCell.textContent}</p>`;
    leftCol.appendChild(labelEl);
    labelCell.style.display = "none";
  }

  if (titleCell?.textContent.trim()) {
    const titleEl = document.createElement("h3");
    titleEl.className = "highlight4-card-title text-h3";
    titleEl.textContent = titleCell.textContent;
    leftCol.appendChild(titleEl);
    titleCell.style.display = "none";
  }

  const createIconLine = (cell, defaultIconName) => {
    if (!cell || !cell.textContent.trim()) return null;
    const text = cell.textContent.trim();
    let iconName = defaultIconName;
    let iconText = text;

    if (text.includes("|")) {
      const parts = text.split("|").map((s) => s.trim());
      iconName = parts[0];
      iconText = parts[1];
    }
    const item = document.createElement("div");
    item.className = "highlight4-card-icon-line text-p1";
    const icon = document.createElement("div");
    icon.className = `highlight4-card-icon icon-${iconName.toLowerCase()}`;
    const p = document.createElement("p");
    p.className = "highlight4-card-icon-text text-p1";
    p.textContent = iconText;
    item.append(icon, p);
    return item;
  };

  const timeLine = createIconLine(timeCell, "clock");
  if (timeLine) {
    rightCol.appendChild(timeLine);
    if (timeCell) timeCell.style.display = "none";
  }

  const venueLine = createIconLine(venueCell, "location");
  if (venueLine) {
    rightCol.appendChild(venueLine);
    if (venueCell) venueCell.style.display = "none";
  }

  mainRow.append(leftCol, rightCol);
  cardContent.append(mainRow);

  if (descCell?.textContent.trim()) {
    const descEl = document.createElement("p");
    descEl.className = "highlight4-card-description text-p1";
    descEl.textContent = descCell.textContent;
    cardContent.appendChild(descEl);
    descCell.style.display = "none";
  }

  card.appendChild(cardContent);
  row.appendChild(card);
  swiperWrapper.appendChild(row);
}
