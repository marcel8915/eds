export default function decorate(block) {
  // Add Swiper stylesheet
  const swiperStylesheet = document.createElement('link');
  swiperStylesheet.rel = 'stylesheet';
  swiperStylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
  document.head.appendChild(swiperStylesheet);

  // Add Swiper script
  const swiperScript = document.createElement('script');
  swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
  
  // Initialize after script loads
  swiperScript.onload = () => {
    createGallery(block);
  };
  
  document.head.appendChild(swiperScript);
}

function createGallery(block) {
  const cardContainer = document.createElement('div');
  cardContainer.className = 'image-gallery-tile-container';

  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'image-gallery-tile-wrapper';
  cardContainer.appendChild(cardWrapper);

  Array.from(block.children).forEach((card, cardIndex) => {
    const hasContent = card.textContent.trim() !== '' || card.querySelector('picture');
    if (!hasContent) return;

    const galleryCard = document.createElement('div');
    galleryCard.className = 'image-gallery-tile-card';

    // Process images
    const images = card.querySelectorAll('picture');
    if (images.length > 0) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'image-gallery-tile-images swiper-container';

      // Create Swiper container
      const swiperContainer = document.createElement('div');
      swiperContainer.className = `swiper mySwiper-${cardIndex}`;

      // Create Swiper wrapper
      const swiperWrapper = document.createElement('div');
      swiperWrapper.className = 'swiper-wrapper';

      // Add images to Swiper slides
      Array.from(images).slice(0, 3).forEach((image) => {
        const swiperSlide = document.createElement('div');
        swiperSlide.className = 'swiper-slide';
        swiperSlide.appendChild(image.cloneNode(true));
        swiperWrapper.appendChild(swiperSlide);
      });

      swiperContainer.appendChild(swiperWrapper);

      // Add navigation
      const nextButton = document.createElement('div');
      nextButton.className = 'swiper-button-next';
      swiperContainer.appendChild(nextButton);

      const prevButton = document.createElement('div');
      prevButton.className = 'swiper-button-prev';
      swiperContainer.appendChild(prevButton);

      // Add pagination
      const pagination = document.createElement('div');
      pagination.className = 'swiper-pagination';
      swiperContainer.appendChild(pagination);

      imageWrapper.appendChild(swiperContainer);
      galleryCard.appendChild(imageWrapper);
    }

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'image-gallery-tile-content';

    // Left column
    const leftColumn = document.createElement('div');
    leftColumn.className = 'image-gallery-tile-left';

    // Right column
    const rightColumn = document.createElement('div');
    rightColumn.className = 'image-gallery-tile-right';

    const cardSections = Array.from(card.children);

    // Title
    if (cardSections[3]?.textContent.trim()) {
      const title = document.createElement('h3');
      title.className = 'image-gallery-tile-title';
      title.textContent = cardSections[3].textContent.trim();
      leftColumn.appendChild(title);
    }

    // Link and description
    const link = document.createElement('a');
    link.href = cardSections[4]?.querySelector('a')?.getAttribute('href') || '#';
    link.className = 'image-gallery-tile-link';

    if (cardSections[5]?.textContent.trim()) {
      const description = document.createElement('p');
      description.className = 'image-gallery-tile-description';
      description.textContent = cardSections[5].textContent.trim();
      link.appendChild(description);
    }

    if (link.children.length > 0) {
      leftColumn.appendChild(link);
    }

    // Features
    const featuresContainer = document.createElement('div');
    featuresContainer.className = 'image-gallery-tile-features';

    for (let i = 6; i < cardSections.length; i += 2) {
      if (i + 1 < cardSections.length) {
        const featureItem = document.createElement('div');
        featureItem.className = 'image-gallery-tile-feature';

        const icon = cardSections[i].querySelector('picture')?.cloneNode(true);
        if (icon) {
          const iconWrapper = document.createElement('div');
          iconWrapper.className = 'image-gallery-tile-feature-icon';
          iconWrapper.appendChild(icon);
          featureItem.appendChild(iconWrapper);
        }

        const text = document.createElement('div');
        text.className = 'image-gallery-tile-feature-text';
        text.textContent = cardSections[i + 1].textContent.trim();
        featureItem.appendChild(text);

        featuresContainer.appendChild(featureItem);
      }
    }

    if (featuresContainer.children.length > 0) {
      rightColumn.appendChild(featuresContainer);
    }

    // Combine columns
    if (leftColumn.children.length > 0) {
      contentContainer.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentContainer.appendChild(rightColumn);
    }

    if (contentContainer.children.length > 0) {
      galleryCard.appendChild(contentContainer);
    }

    cardWrapper.appendChild(galleryCard);
  });

  block.innerHTML = '';
  block.appendChild(cardContainer);

  // Initialize Swipers
  setTimeout(() => {
    document.querySelectorAll('[class^="swiper mySwiper-"]').forEach((swiperEl) => {
      new Swiper(swiperEl, {
        navigation: {
          nextEl: swiperEl.querySelector('.swiper-button-next'),
          prevEl: swiperEl.querySelector('.swiper-button-prev'),
        },
        pagination: {
          el: swiperEl.querySelector('.swiper-pagination'),
          clickable: true,
        },
        loop: true,
        autoplay: false,
      });
    });
  }, 100); 
}
