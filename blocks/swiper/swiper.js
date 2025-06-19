export default async function decorate(block) {
  await loadDependencies();

  const container = document.createElement("div");
  container.className = "swiper-block-container";
  container.style.position = "relative";

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

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

  const leftArrow = document.createElement("button");
  leftArrow.className = "swiper-arrow-button left-arrow";
  leftArrow.style.pointerEvents = "auto";
  leftArrow.style.opacity = "0";
  leftArrow.style.transition = "opacity 300ms";
  leftArrow.style.position = "absolute";
  leftArrow.style.left = "20px";

  const leftArrowIcon = document.createElement("div");
  leftArrowIcon.className = "arrow-icon";
  leftArrow.appendChild(leftArrowIcon);

  const rightArrow = document.createElement("button");
  rightArrow.className = "swiper-arrow-button right-arrow";
  rightArrow.style.pointerEvents = "auto";
  rightArrow.style.opacity = "0";
  rightArrow.style.transition = "opacity 300ms";
  rightArrow.style.position = "absolute";
  rightArrow.style.right = "20px";

  const rightArrowIcon = document.createElement("div");
  rightArrowIcon.className = "arrow-icon";
  rightArrowIcon.style.transform = "rotate(180deg)";
  rightArrow.appendChild(rightArrowIcon);

  arrowsContainer.appendChild(leftArrow);
  arrowsContainer.appendChild(rightArrow);
  container.appendChild(arrowsContainer);

  const imageContainers = [];

  Array.from(block.children).forEach((card) => {
    const hasContent =
      card.textContent.trim() !== "" || card.querySelector("picture");
    if (!hasContent) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

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

    Array.from(card.children).forEach((element) => {
      if (element !== picture) {
        cardContainer.appendChild(element);
      }
    });

    slide.appendChild(cardContainer);
    swiperWrapper.appendChild(slide);
  });

  swiperContainer.appendChild(swiperWrapper);
  container.appendChild(swiperContainer);
  block.innerHTML = "";
  block.appendChild(container);

  const swiper = new Swiper(swiperContainer, {
    slidesPerView: "auto",
    freeMode: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    watchOverflow: true,
    preventClicksPropagation: true,
    resistance: true,
    slidesOffsetAfter: -130,
    resistanceRatio: 0.85,
    mousewheel: {
      forceToAxis: true,
    },
    breakpoints: {
      0: {
        slidesPerView: "auto",
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 24,
      },
      1024: {
        slidesPerView: "auto",
        spaceBetween: 32,
      },
    },
    on: {
      init: function () {
        updateArrowVisibility(this);
        positionArrows(this);
      },
      slideChange: function () {
        updateArrowVisibility(this);
        positionArrows(this);
      },
      resize: function () {
        positionArrows(this);
      },
      slideChangeTransitionStart: function () {
        positionArrows(this);
      },
    },
  });

  leftArrow.addEventListener("click", () => swiper.slidePrev());
  rightArrow.addEventListener("click", () => swiper.slideNext());

  function positionArrows(swiperInstance) {
    if (imageContainers.length === 0) return;

    const activeIndex = swiperInstance.activeIndex;
    const activeImageContainer = imageContainers[activeIndex];

    if (!activeImageContainer) return;

    const imageHeight = activeImageContainer.offsetHeight;

    arrowsContainer.style.height = `${imageHeight}px`;

    const imageRect = activeImageContainer.getBoundingClientRect();
    const swiperRect = swiperContainer.getBoundingClientRect();
    const imageCenterY = imageRect.top + imageRect.height / 2 - swiperRect.top;

    leftArrow.style.top = `${imageCenterY - 20}px`;
    rightArrow.style.top = `${imageCenterY - 20}px`;

    updateArrowVisibility(swiperInstance);
  }

  function updateArrowVisibility(swiperInstance) {
    if (swiperInstance.isBeginning) {
      leftArrow.style.opacity = "0";
      leftArrow.style.pointerEvents = "none";
    } else {
      leftArrow.style.opacity = "1";
      leftArrow.style.pointerEvents = "auto";
    }

    if (swiperInstance.isEnd) {
      rightArrow.style.opacity = "0";
      rightArrow.style.pointerEvents = "none";
    } else {
      rightArrow.style.opacity = "1";
      rightArrow.style.pointerEvents = "auto";
    }
  }

  window.addEventListener("load", () => positionArrows(swiper));
}

async function loadDependencies() {
  if (window.Swiper) return;

  await Promise.all([
    loadCSS("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"),
    loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"),
  ]);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCSS(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}
