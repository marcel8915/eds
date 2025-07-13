import { moveInstrumentation } from "../../scripts/scripts.js";
import { decorateIcons } from "../../scripts/aem.js";
import { isUniversalEditor } from "../../scripts/aem.js";
import { loadSwiper } from "../../scripts/utils.js";

export default async function decorate(block) {
  moveInstrumentation(block);

  const isAuthoring = isUniversalEditor();
  block.classList.add("banner-toggle-container");

  const bannerToggle = block.querySelector(".banner-toggle") || block;
  const arrowsContainer =
    block.querySelector(".banner-toggle-arrows-container") ||
    document.createElement("div");
  arrowsContainer.className = "banner-toggle-arrows-container";

  const swiperContainer =
    block.querySelector(".banner-toggle-swiper") ||
    document.createElement("div");
  swiperContainer.className = "banner-toggle-swiper swiper";

  const swiperWrapper =
    swiperContainer.querySelector(".swiper-wrapper") ||
    document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  // Clear and rebuild swiper structure
  swiperContainer.innerHTML = "";
  swiperContainer.append(swiperWrapper);

  let prevArrow = arrowsContainer.querySelector(".banner-toggle-prev-arrow");
  let nextArrow = arrowsContainer.querySelector(".banner-toggle-next-arrow");

  if (!prevArrow) {
    prevArrow = document.createElement("button");
    prevArrow.className = "banner-toggle-arrow-button banner-toggle-prev-arrow";
    prevArrow.innerHTML = '<div class="banner-toggle-arrow-icon"></div>';
    prevArrow.setAttribute("aria-label", "Previous Slide");
    prevArrow.style.opacity = "0";
  }

  if (!nextArrow) {
    nextArrow = document.createElement("button");
    nextArrow.className = "banner-toggle-arrow-button banner-toggle-next-arrow";
    nextArrow.innerHTML = '<div class="banner-toggle-arrow-icon"></div>';
    nextArrow.setAttribute("aria-label", "Next Slide");
  }

  arrowsContainer.innerHTML = "";
  arrowsContainer.append(prevArrow, nextArrow);

  const cardGroups = Array.from(bannerToggle.children).filter(
    (el) =>
      el.tagName === "DIV" &&
      !el.classList.contains("banner-toggle-arrows-container") &&
      !el.classList.contains("banner-toggle-swiper")
  );

  if (cardGroups.length === 0) {
    console.warn("No card groups found in banner-toggle block");
    return;
  }

  cardGroups.forEach((cardGroup) => {
    if (!cardGroup.children || cardGroup.children.length < 2) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const slideContent = document.createElement("div");
    slideContent.className = "banner-card-content";

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "banner-toggle-controls";

    const dayButton = document.createElement("button");
    dayButton.className = "banner-toggle-button active";
    dayButton.textContent = "Day";
    dayButton.setAttribute("aria-label", "Show day view");

    const nightButton = document.createElement("button");
    nightButton.className = "banner-toggle-button";
    nightButton.textContent = "Night";
    nightButton.setAttribute("aria-label", "Show night view");

    toggleContainer.append(dayButton, nightButton);
    slideContent.append(toggleContainer);

    const imageContainer = document.createElement("div");
    imageContainer.className = "banner-image-container";

    const dayImage = cardGroup.children[0]
      ?.querySelector("picture")
      ?.cloneNode(true);
    const nightImage = cardGroup.children[1]
      ?.querySelector("picture")
      ?.cloneNode(true);

    if (dayImage) {
      dayImage.classList.add("banner-image", "day-image", "active");
      imageContainer.append(dayImage);
    }

    if (nightImage) {
      nightImage.classList.add("banner-image", "night-image");
      imageContainer.append(nightImage);
    }

    slideContent.append(imageContainer);

    const processContent = (index, className, tagName = "div") => {
      if (cardGroup.children[index]?.textContent?.trim()) {
        const el = document.createElement(tagName);
        el.className = className;
        el.textContent = cardGroup.children[index].textContent.trim();
        return el;
      }
      return null;
    };

    const elements = [
      processContent(2, "banner-label"),
      processContent(3, "banner-title", "h2"),
      processContent(4, "banner-subtitle", "p"),
    ];

    elements.forEach((el) => el && slideContent.append(el));

    const ctaLink = cardGroup.children[5]?.querySelector("a");
    if (ctaLink) {
      ctaLink.className = "banner-cta";
      const ctaContainer = document.createElement("div");
      ctaContainer.className = "banner-cta-container";
      ctaContainer.append(ctaLink);
      slideContent.append(ctaContainer);
    }

    if (dayImage && nightImage) {
      dayButton.addEventListener("click", () => {
        dayButton.classList.add("active");
        nightButton.classList.remove("active");
        dayImage.classList.add("active");
        nightImage.classList.remove("active");
      });

      nightButton.addEventListener("click", () => {
        nightButton.classList.add("active");
        dayButton.classList.remove("active");
        nightImage.classList.add("active");
        dayImage.classList.remove("active");
      });
    } else {
      toggleContainer.style.display = "none";
    }

    slide.append(slideContent);
    swiperWrapper.append(slide);
  });

  bannerToggle.innerHTML = "";
  bannerToggle.append(arrowsContainer, swiperContainer);

  if (isAuthoring) {
    swiperContainer.style.display = "flex";
    swiperWrapper.style.display = "flex";
    swiperWrapper.style.flexDirection = "column";
    arrowsContainer.style.display = "none";
    return;
  }

  // Initialize Swiper
  try {
    await loadSwiper();

    if (swiperWrapper.children.length > 0) {
      new Swiper(swiperContainer, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: {
          nextEl: nextArrow,
          prevEl: prevArrow,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        on: {
          init: (swiper) => {
            updateArrowVisibility(swiper);
          },
          slideChange: (swiper) => {
            updateArrowVisibility(swiper);
          },
        },
      });

      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      swiperContainer.append(pagination);
    }
  } catch (error) {
    console.error("Failed to initialize Swiper:", error);
  }

  function updateArrowVisibility(swiper) {
    if (!prevArrow || !nextArrow) return;
    prevArrow.style.opacity = swiper.isBeginning ? "0" : "1";
    nextArrow.style.opacity = swiper.isEnd ? "0" : "1";
    prevArrow.style.pointerEvents = swiper.isBeginning ? "none" : "auto";
    nextArrow.style.pointerEvents = swiper.isEnd ? "none" : "auto";
  }

  decorateIcons(prevArrow);
  decorateIcons(nextArrow);
}
