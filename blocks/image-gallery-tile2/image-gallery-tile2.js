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

  // First pass: collect data without modifying DOM
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

    // Create gallery card and apply moveInstrumentation ONCE
    const galleryCard = document.createElement("div");
    galleryCard.className = "image-gallery-tile-card";
    galleryCard.dataset.category = cardData.category;
    moveInstrumentation(card, galleryCard);

    // Get original sections before moving anything
    const originalSections = Array.from(card.children);
    
    // Handle images first - create swiper structure
    const images = card.querySelectorAll("picture");
    if (images.length > 0) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-gallery-tile-images swiper-container";

      const swiperContainer = document.createElement("div");
      swiperContainer.className = `swiper mySwiper-${cardIndex}`;

      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      // Move first 3 images directly to swiper slides
      Array.from(images)
        .slice(0, 3)
        .forEach((image) => {
          const swiperSlide = document.createElement("div");
          swiperSlide.className = "swiper-slide";
          swiperSlide.appendChild(image); // Move original image
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

    // Now handle content sections
    const contentContainer = document.createElement("div");
    contentContainer.className = "image-gallery-tile-content";

    const leftColumn = document.createElement("div");
    leftColumn.className = "image-gallery-tile-left";

    // Title (section 3)
    if (originalSections[3]?.textContent.trim()) {
      originalSections[3].className = "image-gallery-tile-title";
      leftColumn.appendChild(originalSections[3]);
    }

    // Link and description (sections 4 & 5)
    if (originalSections[4]?.querySelector("a")) {
      const linkSection = originalSections[4];
      const originalLink = linkSection.querySelector("a");
      originalLink.className = "image-gallery-tile-link";
      
      if (originalSections[5]?.textContent.trim()) {
        const descriptionText = originalSections[5].textContent.trim();
        const descElement = document.createElement("p");
        descElement.className = "image-gallery-tile-description";
        descElement.textContent = descriptionText;
        originalLink.appendChild(descElement);
      }
      
      leftColumn.appendChild(linkSection);
    }

    const rightColumn = document.createElement("div");
    rightColumn.className = "image-gallery-tile-right";

    const featuresContainer = document.createElement("div");
    featuresContainer.className = "image-gallery-tile-features";

    // Features (sections 7+)
    for (let i = 7; i < originalSections.length; i += 2) {
      if (i + 1 < originalSections.length) {
        const featureItem = document.createElement("div");
        featureItem.className = "image-gallery-tile-feature";

        // Icon
        if (originalSections[i]?.querySelector("picture")) {
          originalSections[i].className = "image-gallery-tile-feature-icon";
          featureItem.appendChild(originalSections[i]);
        }

        // Text
        if (originalSections[i + 1]?.textContent.trim()) {
          originalSections[i + 1].className = "image-gallery-tile-feature-text";
          featureItem.appendChild(originalSections[i + 1]);
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

  // Initialize Swiper after DOM is fully constructed
  // Use requestAnimationFrame for better timing
  requestAnimationFrame(() => {
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
  });
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