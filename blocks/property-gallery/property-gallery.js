import { loadSwiper } from "../../scripts/utils.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

const DIMENSION_CYCLE = ["square", "landscape", "square", "portrait"];
let scrollY = 0;
let isScrollLocked = false;
let swiperInstance = null;
let galleryItems = [];
let lightboxItems = [];
let lightboxIndex = 0;

function disableBodyScroll(lock) {
  if (lock && !isScrollLocked) {
    scrollY = window.scrollY;
    isScrollLocked = true;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else if (!lock && isScrollLocked) {
    isScrollLocked = false;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, scrollY);
  }
}

function createLightbox() {
  const lightbox = document.createElement("div");
  lightbox.className = "property-gallery-lightbox";
  const backBtn = document.createElement("button");
  backBtn.className = "property-gallery-lightbox__back";
  backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> BACK`;
  const title = document.createElement("div");
  title.className = "property-gallery-lightbox__title";
  const imageContainer = document.createElement("div");
  imageContainer.className = "property-gallery-lightbox__image-container";
  const image = document.createElement("img");
  image.className = "property-gallery-lightbox__image";
  imageContainer.appendChild(image);
  const prevButton = document.createElement("button");
  prevButton.className =
    "property-gallery-lightbox__nav property-gallery-lightbox__prev";
  prevButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M15 18L9 12L15 6" stroke="white" stroke-width="2"/></svg>`;
  const nextButton = document.createElement("button");
  nextButton.className =
    "property-gallery-lightbox__nav property-gallery-lightbox__next";
  nextButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 6L15 12L9 18" stroke="white" stroke-width="2"/></svg>`;
  const thumbnailContainer = document.createElement("div");
  thumbnailContainer.className = "property-gallery-lightbox__thumbnails";
  lightbox.append(
    backBtn,
    title,
    imageContainer,
    prevButton,
    nextButton,
    thumbnailContainer
  );
  document.body.append(lightbox);
  return {
    element: lightbox,
    backBtn,
    title,
    image,
    imageContainer,
    prevButton,
    nextButton,
    thumbnailContainer,
  };
}

export function handleGalleryTrigger(e) {
  if (e) e.preventDefault();
  const galleryWrapper = document.querySelector(".image-gallery");
  if (galleryWrapper) {
    disableBodyScroll(true);
    galleryWrapper.style.display = "flex";
    galleryWrapper.focus();
  }
}

export default async function decorate(block) {
  galleryItems = [];
  const galleryWrapper = document.createElement("div");
  galleryWrapper.className = "image-gallery";
  galleryWrapper.tabIndex = -1;
  block.parentNode.insertBefore(galleryWrapper, block);
  galleryWrapper.appendChild(block);

  const lightboxElements = createLightbox();

  const galleryIcon = document.createElement("div");
  galleryIcon.className = "gallery-flower-icon";
  galleryIcon.innerHTML = `<a href="/"><img src="/icons/patina-green-flower.svg" alt="Patina Flower" /></a>`;

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper";
  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  const allRows = [...block.children];
  block.innerHTML = "";
  let validCardIndex = 0;
  let categories = [];

  const categoryRow = allRows.find((row) => row.children.length === 1);
  if (categoryRow) {
    categories = categoryRow.textContent
      .trim()
      .split(",")
      .map((cat) => cat.trim());
  }

  const cardRows = allRows.filter((row) => row.children.length > 1);
  cardRows.forEach((row, index) => {
    const [imageCell, labelCell, categoryCell] = [...row.children];
    const picture = imageCell?.querySelector("picture");
    if (!picture) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    const itemCategory =
      categoryCell?.textContent.trim().toLowerCase().replace(/\s+/g, "-") ||
      "uncategorized";
    slide.dataset.category = itemCategory;
    slide.dataset.id = index;

    const dimension = DIMENSION_CYCLE[validCardIndex % DIMENSION_CYCLE.length];
    validCardIndex++;
    const card = document.createElement("div");
    card.className = `property-gallery-card is-${dimension}`;
    moveInstrumentation(row, card);
    const img = picture.querySelector("img");
    card.style.backgroundImage = `url(${img.src})`;
    const label = labelCell?.textContent.trim();
    galleryItems.push({ id: index, src: img.src, alt: img.alt, label });

    if (label) {
      const labelEl = document.createElement("div");
      labelEl.className = "property-gallery-card__label";
      labelEl.textContent = label;
      card.append(labelEl);
    }

    card.addEventListener("click", (e) => {
      e.preventDefault();
      lightboxItems = Array.from(swiperWrapper.children)
        .filter((s) => s.style.display !== "none")
        .map((s) =>
          galleryItems.find((item) => item.id === parseInt(s.dataset.id, 10))
        );
      lightboxIndex = lightboxItems.findIndex(
        (item) => item.id === parseInt(slide.dataset.id, 10)
      );
      openLightbox();
    });
    slide.append(card);
    swiperWrapper.appendChild(slide);
  });

  // Create both Desktop and Mobile Filter UIs
  const desktopFilters = document.createElement("div");
  desktopFilters.className = "gallery-filters-desktop";

  const mobileFiltersPopup = document.createElement("div");
  mobileFiltersPopup.className = "gallery-filters-popup";
  mobileFiltersPopup.innerHTML = `
    <div class="gallery-filters-popup__overlay"></div>
    <div class="gallery-filters-popup__content">
      <div class="gallery-filters-popup__header">
        <h3>Categories</h3>
        <button class="gallery-filters-popup__close" aria-label="Close categories">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="gallery-filters-popup__list"></div>
    </div>
  `;
  const mobileFilterList = mobileFiltersPopup.querySelector(
    ".gallery-filters-popup__list"
  );

  const mobileTriggerBtn = document.createElement("button");
  mobileTriggerBtn.className = "gallery-open-filters-btn";
  mobileTriggerBtn.innerHTML = `
    <span class="gallery-open-filters-btn__label">${
      categories[0] || "All"
    }</span>
    <span class="gallery-open-filters-btn__icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </span>
  `;

  mobileTriggerBtn.onclick = () => {
    mobileFiltersPopup.classList.add("active");
    disableBodyScroll(true);
  };

  function closePopup() {
    mobileFiltersPopup.classList.remove("active");
    disableBodyScroll(false);
  }
  mobileFiltersPopup.querySelector(".gallery-filters-popup__close").onclick =
    closePopup;
  mobileFiltersPopup.querySelector(".gallery-filters-popup__overlay").onclick =
    closePopup;

  function filterGallery(category, categoryName) {
    desktopFilters.querySelectorAll(".gallery-filter-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === category);
    });

    mobileTriggerBtn.querySelector(
      ".gallery-open-filters-btn__label"
    ).textContent = categoryName;

    swiperWrapper.querySelectorAll(".swiper-slide").forEach((slide) => {
      slide.style.display =
        category === "all" || slide.dataset.category === category ? "" : "none";
    });

    if (swiperInstance) {
      swiperInstance.update();
      swiperInstance.slideTo(0);
    }
    if (mobileFiltersPopup.classList.contains("active")) {
      closePopup();
    }
  }

  const createFilterButton = (cat, name, isPopup = false) => {
    const btn = document.createElement("button");
    btn.className = isPopup
      ? "gallery-filters-popup__button"
      : "gallery-filter-button";
    btn.textContent = name;
    btn.dataset.filter = cat;
    btn.onclick = () => filterGallery(cat, name);
    return btn;
  };

  // Populate both UIs
  const allFilterName = "All";
  desktopFilters.append(createFilterButton("all", allFilterName));
  mobileFilterList.append(createFilterButton("all", allFilterName, true));

  categories.forEach((cat) => {
    const filterKey = cat.toLowerCase().replace(/\s+/g, "-");
    desktopFilters.append(createFilterButton(filterKey, cat));
    mobileFilterList.append(createFilterButton(filterKey, cat, true));
  });
  desktopFilters.querySelector('[data-filter="all"]').classList.add("active");

  function openLightbox() {
    if (lightboxIndex < 0 || lightboxIndex >= lightboxItems.length) return;
    const item = lightboxItems[lightboxIndex];
    lightboxElements.image.src = item.src;
    lightboxElements.title.textContent = item.label || "";
    lightboxElements.thumbnailContainer.innerHTML = "";
    lightboxItems.forEach((thumbItem, i) => {
      const thumb = document.createElement("img");
      thumb.src = thumbItem.src;
      thumb.className = `property-gallery-lightbox__thumbnail ${
        i === lightboxIndex ? "active" : ""
      }`;
      thumb.onclick = (e) => {
        e.stopPropagation();
        lightboxIndex = i;
        openLightbox();
      };
      lightboxElements.thumbnailContainer.appendChild(thumb);
    });
    lightboxElements.element.classList.add("active");
    disableBodyScroll(true);
  }

  // Lightbox event listeners
  lightboxElements.prevButton.onclick = () => {
    lightboxIndex -= 1;
    if (lightboxIndex < 0) lightboxIndex = lightboxItems.length - 1;
    openLightbox();
  };
  lightboxElements.nextButton.onclick = () => {
    lightboxIndex += 1;
    if (lightboxIndex >= lightboxItems.length) lightboxIndex = 0;
    openLightbox();
  };
  lightboxElements.backBtn.onclick = () => {
    lightboxElements.element.classList.remove("active");
    disableBodyScroll(false);
  };
  document.addEventListener("keydown", (e) => {
    if (lightboxElements.element.classList.contains("active")) {
      if (e.key === "ArrowLeft") lightboxElements.prevButton.click();
      if (e.key === "ArrowRight") lightboxElements.nextButton.click();
      if (e.key === "Escape") lightboxElements.backBtn.click();
    }
  });

  swiperContainer.appendChild(swiperWrapper);
  const modalPrevButton = document.createElement("button");
  modalPrevButton.className = "swiper-button swiper-button-prev";
  const modalNextButton = document.createElement("button");
  modalNextButton.className = "swiper-button swiper-button-next";
  const closeModalBtn = document.createElement("button");
  closeModalBtn.className = "property-gallery-modal-close";
  closeModalBtn.innerHTML = "&times;";
  closeModalBtn.onclick = () => {
    galleryWrapper.style.display = "none";
    disableBodyScroll(false);
  };

  block.append(
    galleryIcon,
    desktopFilters,
    mobileTriggerBtn,
    closeModalBtn,
    swiperContainer,
    modalPrevButton,
    modalNextButton,
    mobileFiltersPopup
  );
  block.classList.add("decorated");

  await loadSwiper();
  const handleResize = () => {
    if (swiperInstance) swiperInstance.destroy(true, true);
    const isMobile = window.innerWidth <= 768;
    swiperInstance = new Swiper(swiperContainer, {
      direction: isMobile ? "vertical" : "horizontal",
      slidesPerView: "auto",
      spaceBetween: isMobile ? 32 : 24,
      freeMode: true,
      keyboard: { enabled: true },
      mousewheel: { forceToAxis: true },
      navigation: { nextEl: modalNextButton, prevEl: modalPrevButton },
    });
    desktopFilters.style.display = isMobile ? "none" : "flex";
    mobileTriggerBtn.style.display = isMobile ? "flex" : "none";
    modalPrevButton.style.display = isMobile ? "none" : "flex";
    modalNextButton.style.display = isMobile ? "none" : "flex";
  };
  handleResize();
  window.addEventListener("resize", handleResize);
}
