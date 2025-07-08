import { moveInstrumentation } from "../../scripts/scripts.js";
import { isUniversalEditor } from "../../scripts/aem.js";
import { loadSwiper } from "../../scripts/utils.js";

export default async function decorate(block) {
  const container = document.createElement("div");
  container.className = "swiper-block-container";
  container.style.position = "relative";

  // Create arrows container
  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "swiper-arrows-container";
  arrowsContainer.style.position = "absolute";
  arrowsContainer.style.top = "0";
  arrowsContainer.style.left = "0";
  arrowsContainer.style.right = "0";
  arrowsContainer.style.zIndex = "20";
  arrowsContainer.style.pointerEvents = "none";
  arrowsContainer.style.display = "flex";
  arrowsContainer.style.justifyContent = "space-between";
  arrowsContainer.style.alignItems = "center";
  arrowsContainer.style.height = "100%";
  container.appendChild(arrowsContainer);

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = isUniversalEditor()
    ? "swiper-wrapper authoring-mode"
    : "swiper-wrapper animate-stagger";

  const imageContainers = [];
  Array.from(block.children).forEach((card) => {
    if (!card.textContent.trim() && !card.querySelector("picture")) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    moveInstrumentation(card, slide);

    const cardContainer = document.createElement("div");
    cardContainer.className = "card";

    const picture = card.querySelector("picture");
    if (picture) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-container";
      imageContainers.push(imageWrapper);
      imageWrapper.appendChild(picture);
      cardContainer.appendChild(imageWrapper);
    }

    // Handle content - specifically style paragraphs
    const para = card.querySelector("p");
    if (para) {
      para.className = "card-description text-p1";
    }

    // Move all content
    const contentElements = [...card.children].filter(
      (el) => !el.querySelector("picture")
    );
    contentElements.forEach((element) => cardContainer.appendChild(element));

    slide.appendChild(cardContainer);
    swiperWrapper.appendChild(slide);
  });

  swiperContainer.appendChild(swiperWrapper);
  container.appendChild(swiperContainer);
  block.innerHTML = "";
  block.appendChild(container);

  if (!isUniversalEditor()) {
    try {
      await loadSwiper();
      initializeSwiper(
        container,
        swiperContainer,
        arrowsContainer,
        imageContainers
      );
    } catch (error) {
      console.error("Swiper initialization failed:", error);
    }
  } else {
    swiperContainer.style.display = "flex";
    swiperContainer.style.overflow = "visible";
    swiperWrapper.style.display = "flex";
    swiperWrapper.style.gap = "24px";
    arrowsContainer.style.display = "none";
  }
}

function initializeSwiper(
  container,
  swiperContainer,
  arrowsContainer,
  imageContainers
) {
  if (!arrowsContainer) return;

  const leftArrow = createArrowButton("left");
  const rightArrow = createArrowButton("right");

  arrowsContainer.appendChild(leftArrow);
  arrowsContainer.appendChild(rightArrow);

  const swiper = new Swiper(swiperContainer, {
    slidesPerView: "auto",
    freeMode: true,
    keyboard: { enabled: true, onlyInViewport: true },
    watchOverflow: true,
    preventClicksPropagation: true,
    resistance: true,
    slidesOffsetAfter: -130,
    resistanceRatio: 0.85,
    mousewheel: { forceToAxis: true },
    navigation: {
      nextEl: rightArrow,
      prevEl: leftArrow,
    },
    breakpoints: {
      0: { slidesPerView: "auto", spaceBetween: 16 },
      768: { slidesPerView: 2.5, spaceBetween: 24 },
      1024: { slidesPerView: "auto", spaceBetween: 32 },
    },
    on: {
      init: (s) => updateArrows(s, imageContainers, arrowsContainer),
      slideChange: (s) => updateArrows(s, imageContainers, arrowsContainer),
      resize: (s) => updateArrows(s, imageContainers, arrowsContainer),
      slideChangeTransitionStart: (s) =>
        updateArrows(s, imageContainers, arrowsContainer),
    },
  });

  function updateArrows(swiperInstance, containers, arrowsContainer) {
    if (!arrowsContainer || !containers?.length) return;

    const activeIndex = swiperInstance.activeIndex;
    const activeContainer = containers[activeIndex];
    if (!activeContainer) return;

    const height = activeContainer.offsetHeight;
    arrowsContainer.style.height = `${height}px`;

    const containerRect = activeContainer.getBoundingClientRect();
    const swiperRect = swiperContainer.getBoundingClientRect();
    const centerY =
      containerRect.top + containerRect.height / 2 - swiperRect.top - 20;

    leftArrow.style.top = `${centerY}px`;
    rightArrow.style.top = `${centerY}px`;

    leftArrow.style.opacity = swiperInstance.isBeginning ? "0" : "1";
    rightArrow.style.opacity = swiperInstance.isEnd ? "0" : "1";
    leftArrow.style.pointerEvents = swiperInstance.isBeginning
      ? "none"
      : "auto";
    rightArrow.style.pointerEvents = swiperInstance.isEnd ? "none" : "auto";
  }

  window.addEventListener("load", () =>
    updateArrows(swiper, imageContainers, arrowsContainer)
  );
}

function createArrowButton(direction) {
  const arrow = document.createElement("button");
  arrow.className = `swiper-arrow-button ${direction}-arrow`;
  arrow.style.pointerEvents = "auto";
  arrow.style.opacity = direction === "left" ? "0" : "1";
  arrow.style.transition = "opacity 300ms";
  arrow.style.position = "absolute";
  arrow.style[direction] = "20px";

  const icon = document.createElement("div");
  icon.className = "arrow-icon";
  if (direction === "right") icon.style.transform = "rotate(180deg)";
  arrow.appendChild(icon);

  return arrow;
}
