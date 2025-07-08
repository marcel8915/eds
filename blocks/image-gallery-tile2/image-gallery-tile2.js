import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const swiperStylesheet = document.createElement("link");
  swiperStylesheet.rel = "stylesheet";
  swiperStylesheet.href =
    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
  document.head.appendChild(swiperStylesheet);

  const swiperScript = document.createElement("script");
  swiperScript.src =
    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";

  swiperScript.onload = () => {
    createGalleryWithFilters(block);
  };

  document.head.appendChild(swiperScript);
}

function createGalleryWithFilters(block) {
  const mainContainer = document.createElement("div");

  const categories = new Set(["All"]);
  const cardsData = [];

  Array.from(block.children).forEach((card) => {
    const cardSections = Array.from(card.children);
    if (cardSections[6]?.textContent.trim()) {
      const category = cardSections[6].textContent.trim();
      categories.add(category);
      cardsData.push({
        element: card,
        category: category.toLowerCase(),
      });
    }
  });

  if (categories.size > 1) {
    const filtersContainer = createCategoryFilters(
      Array.from(categories),
      cardsData
    );
    mainContainer.appendChild(filtersContainer);
  }

  const galleryContainer = document.createElement("div");
  galleryContainer.className = "image-gallery-tile-container";

  const galleryWrapper = document.createElement("div");
  galleryWrapper.className = "image-gallery-tile-wrapper";
  galleryContainer.appendChild(galleryWrapper);

  cardsData.forEach((cardData, cardIndex) => {
    const card = cardData.element;
    const hasContent =
      card.textContent.trim() !== "" || card.querySelector("picture");
    if (!hasContent) return;

    const galleryCard = document.createElement("div");
    galleryCard.className = "image-gallery-tile-card";
    galleryCard.dataset.category = cardData.category;
    
    // Single moveInstrumentation call from original card to new card
    moveInstrumentation(card, galleryCard);

    // Move all children from original card to new card (preserve original elements)
    while (card.firstElementChild) {
      galleryCard.append(card.firstElementChild);
    }

    // Now work with the moved children
    const cardSections = Array.from(galleryCard.children);
    
    // Handle images - move original elements, don't clone
    const images = galleryCard.querySelectorAll("picture");
    if (images.length > 0) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-gallery-tile-images swiper-container";

      const swiperContainer = document.createElement("div");
      swiperContainer.className = `swiper mySwiper-${cardIndex}`;

      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      // Take first 3 images and move them (don't clone)
      Array.from(images)
        .slice(0, 3)
        .forEach((image) => {
          const swiperSlide = document.createElement("div");
          swiperSlide.className = "swiper-slide";
          // Move the original image element
          swiperSlide.appendChild(image);
          swiperWrapper.appendChild(swiperSlide);
        });

      swiperContainer.appendChild(swiperWrapper);

      const nextButton = document.createElement("div");
      nextButton.className = "swiper-button-next";
      swiperContainer.appendChild(nextButton);

      const prevButton = document.createElement("div");
      prevButton.className = "swiper-button-prev";
      swiperContainer.appendChild(prevButton);

      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      swiperContainer.appendChild(pagination);

      imageWrapper.appendChild(swiperContainer);
      galleryCard.appendChild(imageWrapper);
    }

    const contentContainer = document.createElement("div");
    contentContainer.className = "image-gallery-tile-content";

    const leftColumn = document.createElement("div");
    leftColumn.className = "image-gallery-tile-left";

    // Title - add class to existing element
    if (cardSections[3]?.textContent.trim()) {
      cardSections[3].className = "image-gallery-tile-title";
      leftColumn.appendChild(cardSections[3]);
    }

    // Link - preserve original link element
    if (cardSections[4]?.querySelector("a")) {
      const originalLink = cardSections[4].querySelector("a");
      originalLink.className = "image-gallery-tile-link";
      
      // Description - add to existing link
      if (cardSections[5]?.textContent.trim()) {
        cardSections[5].className = "image-gallery-tile-description";
        // Move description content into the link
        while (cardSections[5].firstChild) {
          originalLink.appendChild(cardSections[5].firstChild);
        }
      }
      
      leftColumn.appendChild(cardSections[4]);
    }

    const rightColumn = document.createElement("div");
    rightColumn.className = "image-gallery-tile-right";

    const featuresContainer = document.createElement("div");
    featuresContainer.className = "image-gallery-tile-features";

    // Features - preserve original elements
    for (let i = 7; i < cardSections.length; i += 2) {
      if (i + 1 < cardSections.length) {
        const featureItem = document.createElement("div");
        featureItem.className = "image-gallery-tile-feature";

        // Icon - move original picture element
        if (cardSections[i]?.querySelector("picture")) {
          cardSections[i].className = "image-gallery-tile-feature-icon";
          featureItem.appendChild(cardSections[i]);
        }

        // Text - add class to existing element
        if (cardSections[i + 1]?.textContent.trim()) {
          cardSections[i + 1].className = "image-gallery-tile-feature-text";
          featureItem.appendChild(cardSections[i + 1]);
        }

        featuresContainer.appendChild(featureItem);
      }
    }

    if (featuresContainer.children.length > 0) {
      rightColumn.appendChild(featuresContainer);
    }

    if (leftColumn.children.length > 0) {
      contentContainer.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentContainer.appendChild(rightColumn);
    }

    if (contentContainer.children.length > 0) {
      galleryCard.appendChild(contentContainer);
    }

    galleryWrapper.appendChild(galleryCard);
  });

  mainContainer.appendChild(galleryContainer);
  block.innerHTML = "";
  block.appendChild(mainContainer);

  setTimeout(() => {
    document
      .querySelectorAll('[class^="swiper mySwiper-"]')
      .forEach((swiperEl) => {
        new Swiper(swiperEl, {
          navigation: {
            nextEl: swiperEl.querySelector(".swiper-button-next"),
            prevEl: swiperEl.querySelector(".swiper-button-prev"),
          },
          pagination: {
            el: swiperEl.querySelector(".swiper-pagination"),
            clickable: true,
          },
          loop: false,
          autoplay: false,
        });
      });
  }, 100);
}

function createCategoryFilters(categories, cardsData) {
  const container = document.createElement("div");
  container.className = "category-filters-container";

  const bg = document.createElement("div");
  bg.className = "category-filters-bg";
  container.appendChild(bg);

  const slider = document.createElement("div");
  slider.className = "category-filters-slider";

  const sliderBg = document.createElement("div");
  sliderBg.className = "category-filters-slider-bg";
  slider.appendChild(sliderBg);
  container.appendChild(slider);

  categories.forEach((category, idx) => {
    const item = document.createElement("div");
    item.className = "category-filter-item";
    item.dataset.category = category.toLowerCase();

    const text = document.createElement("span");
    text.className = `category-filter-text ${
      idx === 0 ? "category-filter-text-dark" : "category-filter-text-light"
    }`;
    text.textContent = category;
    item.appendChild(text);

    item.addEventListener("click", () => {
      container.querySelectorAll(".category-filter-text").forEach((t, i) => {
        t.classList.toggle("category-filter-text-dark", i === idx);
        t.classList.toggle("category-filter-text-light", i !== idx);
      });

      const itemWidth = item.offsetWidth;
      const itemLeft = item.offsetLeft;
      slider.style.left = `${itemLeft}px`;
      slider.style.width = `${itemWidth}px`;

      document.querySelectorAll(".image-gallery-tile-card").forEach((card) => {
        if (
          category === "All" ||
          card.dataset.category === category.toLowerCase()
        ) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });

    container.appendChild(item);
  });

  setTimeout(() => {
    const firstItem = container.querySelector(".category-filter-item");
    if (firstItem) {
      const itemWidth = firstItem.offsetWidth;
      const itemLeft = firstItem.offsetLeft;
      slider.style.left = `${itemLeft}px`;
      slider.style.width = `${itemWidth}px`;
    }
  }, 100);

  return container;
}