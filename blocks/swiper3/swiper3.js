import { isUniversalEditor } from "../../scripts/aem.js";
import { loadSwiper } from "../../scripts/utils.js";

function createArrowButton(direction) {
  const arrow = document.createElement("button");
  arrow.className = `swiper-arrow-button ${direction}-arrow`;
  arrow.style.pointerEvents = "auto";
  arrow.style.opacity = direction === "left" ? "0" : "1";
  arrow.style.transition = "opacity 300ms";
  arrow.style.position = "absolute";
  arrow.style[direction] = "20px";
  arrow.style.top = "50%";
  arrow.style.transform = "translateY(-50%)";

  const icon = document.createElement("div");
  icon.className = "arrow-icon";
  if (direction === "right") icon.style.transform = "rotate(180deg)";
  arrow.appendChild(icon);

  return arrow;
}

function initializeSwiper(swiperContainer, arrowsContainer, imageContainers) {
  const leftArrow = createArrowButton("left");
  const rightArrow = createArrowButton("right");
  arrowsContainer.append(leftArrow, rightArrow);

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
      init: (swiper) => updateArrowsHeight(swiper),
      slideChange: (swiper) => updateArrowsHeight(swiper),
      resize: (swiper) => updateArrowsHeight(swiper),
    },
  });

  function updateArrowsHeight(swiperInstance) {
    if (!imageContainers.length) return;

    const activeIndex = swiperInstance.activeIndex;
    const activeImageContainer = imageContainers[activeIndex];
    if (!activeImageContainer) return;

    const imageHeight = activeImageContainer.clientHeight;
    console.log("image height:", imageHeight);

    arrowsContainer.style.height = `${imageHeight}px`;

    leftArrow.style.opacity = swiperInstance.isBeginning ? "0" : "1";
    rightArrow.style.opacity = swiperInstance.isEnd ? "0" : "1";
    leftArrow.style.pointerEvents = swiperInstance.isBeginning
      ? "none"
      : "auto";
    rightArrow.style.pointerEvents = swiperInstance.isEnd ? "none" : "auto";
  }

  function handleImageLoad() {
    updateArrowsHeight(swiper);
  }

  imageContainers.forEach((container) => {
    const img = container.querySelector("img");
    if (img) {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener("load", handleImageLoad);
      }
    }
  });

  window.addEventListener("resize", () => updateArrowsHeight(swiper));

  setTimeout(() => updateArrowsHeight(swiper), 100);
}

export default async function decorate(block) {
  block.classList.add("swiper-block-container");
  block.style.position = "relative";

  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "swiper-arrows-container";
  arrowsContainer.style.position = "absolute";
  arrowsContainer.style.top = "0";
  arrowsContainer.style.left = "0";
  arrowsContainer.style.right = "0";
  arrowsContainer.style.zIndex = "20";
  arrowsContainer.style.pointerEvents = "none";
  block.appendChild(arrowsContainer);

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = isUniversalEditor()
    ? "swiper-wrapper authoring-mode"
    : "swiper-wrapper";

  const imageContainers = [];
  const cards = [...block.children];

  cards.forEach((card, index) => {
    if (
      (!card.textContent.trim() && !card.querySelector("picture")) ||
      card === arrowsContainer
    ) {
      return;
    }

    card.classList.add("swiper-slide");

    card.style.width = index === 0 ? "43%" : "32%";
    card.style.marginRight = "32px";

    const cardContainer = document.createElement("div");
    cardContainer.className = "card";

    const picture = card.querySelector("picture");
    if (picture) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = `image-container ${
        index === 0 ? "first-slide" : ""
      }`;

      const pictureClone = picture.cloneNode(true);
      imageWrapper.appendChild(pictureClone);
      cardContainer.appendChild(imageWrapper);
      imageContainers.push(imageWrapper);

      picture.closest("div")?.style.setProperty("display", "none");
    }

    const contentElements = [...card.children].filter(
      (el) => !el.querySelector("picture") && el !== cardContainer
    );

    contentElements.forEach((element) => {
      const clone = element.cloneNode(true);
      if (element.tagName === "P") {
        clone.classList.add("card-description", "text-p1");
      }
      cardContainer.appendChild(clone);
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
      initializeSwiper(swiperContainer, arrowsContainer, imageContainers);
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
