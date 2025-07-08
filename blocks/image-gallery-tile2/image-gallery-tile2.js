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
  // Add main container class to the block itself
  block.classList.add('image-gallery-tile-container');
  
  const categories = new Set(["All"]);
  const cardsData = [];

  // Collect card data and process each card in place
  Array.from(block.children).forEach((card, cardIndex) => {
    if (card.children.length === 0) return;
    
    const cardSections = Array.from(card.children);
    let category = "all";
    
    if (cardSections[6]?.textContent.trim()) {
      category = cardSections[6].textContent.trim();
      categories.add(category);
    }
    
    cardsData.push({
      element: card,
      category: category.toLowerCase(),
    });
    
    const hasContent =
      card.textContent.trim() !== "" || card.querySelector("picture");
    if (!hasContent) return;

    // Add gallery card class to the original card
    card.classList.add('image-gallery-tile-card');
    card.dataset.category = category.toLowerCase();
    
    // Process sections in place
    const sections = Array.from(card.children);
    
    // Create image wrapper for first 3 images
    const images = card.querySelectorAll("picture");
    if (images.length > 0) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-gallery-tile-images swiper-container";

      const swiperContainer = document.createElement("div");
      swiperContainer.className = `swiper mySwiper-${cardIndex}`;

      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      // Move first 3 images to swiper slides
      Array.from(images)
        .slice(0, 3)
        .forEach((image) => {
          const swiperSlide = document.createElement("div");
          swiperSlide.className = "swiper-slide";
          // Move the entire section containing the image
          const imageSection = image.closest('div');
          if (imageSection && imageSection.parentNode === card) {
            swiperSlide.appendChild(image);
            imageSection.style.display = 'none'; // Hide original section
          }
          swiperWrapper.appendChild(swiperSlide);
        });

      swiperContainer.appendChild(swiperWrapper);

      // Add navigation
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
      
      // Insert image wrapper at the beginning of the card
      card.insertBefore(imageWrapper, card.firstChild);
    }

    // Create content container
    const contentContainer = document.createElement("div");
    contentContainer.className = "image-gallery-tile-content";

    const leftColumn = document.createElement("div");
    leftColumn.className = "image-gallery-tile-left";

    const rightColumn = document.createElement("div");
    rightColumn.className = "image-gallery-tile-right";

    // Process sections and add classes
    sections.forEach((section, index) => {
      switch (index) {
        case 3: // Title
          if (section.textContent.trim()) {
            section.classList.add('image-gallery-tile-title');
            leftColumn.appendChild(section);
          }
          break;
          case 4: // Link
          if (section.querySelector('a')) {
            section.classList.add('image-gallery-tile-link-section');
            const link = section.querySelector('a');
            link.classList.add('image-gallery-tile-link');
            
            // Remove title attribute and clear link text if not needed
            link.removeAttribute('title');
            link.textContent = ''; // Clear any existing text content
            
            // Add description to link if exists
            if (sections[5]?.textContent.trim()) {
              const descriptionText = sections[5].textContent.trim();
              const descElement = document.createElement("p");
              descElement.className = "image-gallery-tile-description";
              descElement.textContent = descriptionText;
              link.appendChild(descElement);
              sections[5].style.display = 'none'; // Hide original description section
            }
            
            leftColumn.appendChild(section);
          }
          break;
        case 6: // Category (hidden)
          section.style.display = 'none';
          break;
        default:
          // Features (sections 7+)
          if (index >= 7) {
            // Create features container if it doesn't exist
            let featuresContainer = rightColumn.querySelector('.image-gallery-tile-features');
            if (!featuresContainer) {
              featuresContainer = document.createElement('div');
              featuresContainer.className = 'image-gallery-tile-features';
              rightColumn.appendChild(featuresContainer);
            }
            
            // Process features in pairs (icon + text)
            if (index % 2 === 1) { // Odd index = icon
              const textSection = sections[index + 1];
              if (textSection) {
                const featureItem = document.createElement('div');
                featureItem.className = 'image-gallery-tile-feature';
                
                // Icon
                if (section.querySelector('picture')) {
                  section.classList.add('image-gallery-tile-feature-icon');
                  featureItem.appendChild(section);
                }
                
                // Text
                if (textSection.textContent.trim()) {
                  textSection.classList.add('image-gallery-tile-feature-text');
                  featureItem.appendChild(textSection);
                }
                
                featuresContainer.appendChild(featureItem);
              }
            }
          }
          break;
      }
    });

    // Append content containers to card
    if (leftColumn.children.length > 0) {
      contentContainer.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentContainer.appendChild(rightColumn);
    }
    if (contentContainer.children.length > 0) {
      card.appendChild(contentContainer);
    }
  });

  // Create filters if needed
  if (categories.size > 1) {
    const filtersContainer = createCategoryFilters(
      Array.from(categories),
      cardsData
    );
    block.insertBefore(filtersContainer, block.firstChild);
  }

  // Initialize Swiper with proper timing
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