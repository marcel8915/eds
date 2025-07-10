import { isUniversalEditor } from "../../scripts/aem.js";
import { loadSwiper } from "../../scripts/utils.js";

/**
 * Creates an arrow button for the swiper navigation.
 * @param {'left' | 'right'} direction The direction of the arrow.
 * @returns {HTMLButtonElement} The created button element.
 */
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

/**
 * Initializes the Swiper instance with navigation and event listeners.
 * @param {Element} container The main block element.
 * @param {Element} swiperContainer The .swiper-container element.
 * @param {Element} arrowsContainer The container for navigation arrows.
 * @param {Element[]} imageContainers An array of the image containers to track for height changes.
 */
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

  function updateArrows(swiperInstance, containers, arrContainer) {
    if (!arrContainer || !containers?.length) return;

    const activeIndex = swiperInstance.activeIndex;
    const activeContainer = containers[activeIndex];
    if (!activeContainer) return;

    const height = activeContainer.offsetHeight;
    arrContainer.style.height = `${height}px`;

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

/**
 * Decorates the Swiper block.
 * @param {Element} block The swiper block element.
 */
export default async function decorate(block) {
  block.classList.add("swiper-block-container");
  block.style.position = "relative";

  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "swiper-arrows-container";
  block.appendChild(arrowsContainer);

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = isUniversalEditor()
    ? "swiper-wrapper authoring-mode"
    : "swiper-wrapper animate-stagger";

  const imageContainers = [];
  const cards = [...block.children];

  cards.forEach((card) => {
    if (
      (!card.textContent.trim() && !card.querySelector("picture")) ||
      card === arrowsContainer
    ) {
      return;
    }

    card.classList.add("swiper-slide");

    const cardContainer = document.createElement("div");
    cardContainer.className = "card";

    const picture = card.querySelector("picture");
    if (picture) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-container";
      imageContainers.push(imageWrapper);
      imageWrapper.appendChild(picture);
      cardContainer.appendChild(imageWrapper);

      const pictureSection = picture.closest("div");
      if (pictureSection && pictureSection.parentNode === card) {
        pictureSection.style.display = "none";
      }
    }

    const para = card.querySelector("p");
    if (para) {
      para.classList.add("card-description", "text-p1");
    }

    const contentElements = [...card.children].filter(
      (el) => !el.querySelector("picture") && el !== cardContainer
    );
    contentElements.forEach((element) => {
      cardContainer.appendChild(element.cloneNode(true));
      element.style.display = "none";
    });

    card.appendChild(cardContainer);
    swiperWrapper.appendChild(card);
  });

  swiperContainer.appendChild(swiperWrapper);
  block.appendChild(swiperContainer);

  if (!isUniversalEditor()) {
    try {
      await loadSwiper();
      initializeSwiper(
        block,
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
