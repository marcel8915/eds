import { moveInstrumentation } from "../../scripts/scripts.js";
import { isUniversalEditor } from "../../scripts/aem.js";
import { loadSwiper } from "../../scripts/utils.js";

export default async function decorate(block) {
  const isAuthoring = isUniversalEditor();

  const container = document.createElement("div");
  container.className = "swiper-block-container";

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "swiper-arrows-container";

  const leftArrow = document.createElement("button");
  leftArrow.className = "swiper-arrow-button left-arrow";
  leftArrow.innerHTML = `<div class="arrow-icon"></div>`;
  leftArrow.setAttribute("aria-label", "Previous Slide");
  leftArrow.style.opacity = "0";

  const rightArrow = document.createElement("button");
  rightArrow.className = "swiper-arrow-button right-arrow";
  rightArrow.innerHTML = `<div class="arrow-icon"></div>`;
  rightArrow.setAttribute("aria-label", "Next Slide");

  arrowsContainer.append(leftArrow, rightArrow);
  container.append(arrowsContainer);

  const cards = [];

  const rows = [...block.children];
  rows.forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector("picture")) return;

    const slide = document.createElement("div");
    slide.className = isAuthoring
      ? "swiper-slide authoring-slide"
      : "swiper-slide";
    moveInstrumentation(row, slide);

    const card = document.createElement("div");
    card.className = "card";
    moveInstrumentation(row, card);
    cards.push(card);

    const [imageCell, labelCell, titleCell, descCell, timeCell, venueCell] = [
      ...row.children,
    ];

    const picture = imageCell?.querySelector("picture");
    if (picture) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-container";
      imageWrapper.appendChild(picture);
      moveInstrumentation(imageCell, imageWrapper);
      card.appendChild(imageWrapper);
    }

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    const mainRow = document.createElement("div");
    mainRow.className = "card-content__main-row";

    const leftCol = document.createElement("div");
    leftCol.className = "card-content__left-col";

    const rightCol = document.createElement("div");
    rightCol.className = "card-content__right-col";

    if (labelCell?.textContent.trim()) {
      const labelEl = document.createElement("div");
      labelEl.className = "card-label text-l2";
      labelEl.innerHTML = `<p>${labelCell.textContent}</p>`;
      moveInstrumentation(labelCell, labelEl);
      leftCol.appendChild(labelEl);
    }

    if (titleCell?.textContent.trim()) {
      const titleEl = document.createElement("h3");
      titleEl.className = "card-title text-h3";
      titleEl.textContent = titleCell.textContent;
      moveInstrumentation(titleCell, titleEl);
      leftCol.appendChild(titleEl);
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
      item.className = "card-icon-line text-p1";
      const icon = document.createElement("div");
      icon.className = `card-icon icon-${iconName.toLowerCase()}`;
      const p = document.createElement("p");
      p.className = "card-icon-text text-p1";
      p.textContent = iconText;
      item.append(icon, p);
      moveInstrumentation(cell, item);
      return item;
    };

    const timeLine = createIconLine(timeCell, "clock");
    if (timeLine) rightCol.appendChild(timeLine);

    const venueLine = createIconLine(venueCell, "location");
    if (venueLine) rightCol.appendChild(venueLine);

    mainRow.append(leftCol, rightCol);
    cardContent.append(mainRow);

    if (descCell?.textContent.trim()) {
      const descEl = document.createElement("p");
      descEl.className = "card-description text-p1";
      descEl.textContent = descCell.textContent;
      moveInstrumentation(descCell, descEl);
      cardContent.appendChild(descEl);
    }

    card.appendChild(cardContent);
    slide.appendChild(card);
    swiperWrapper.appendChild(slide);
  });

  swiperContainer.appendChild(swiperWrapper);
  container.appendChild(swiperContainer);

  /* const soundButtonIframe = document.createElement("iframe");
  soundButtonIframe.src = "/blocks/swiper-highlight4/sound.html";
  soundButtonIframe.style.border = "none";
  soundButtonIframe.style.height = "70px";
  soundButtonIframe.style.width = "100%";
  soundButtonIframe.scrolling = "no";
  soundButtonIframe.title = "Sound Player Button";
  container.appendChild(soundButtonIframe);
  */

  block.innerHTML = "";
  block.appendChild(container);

  if (isAuthoring) {
    swiperContainer.style.display = "flex";
    swiperWrapper.style.display = "flex";
    swiperWrapper.style.gap = "24px";
    arrowsContainer.style.display = "none";

    container.classList.add("swiper-block-authoring");
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
