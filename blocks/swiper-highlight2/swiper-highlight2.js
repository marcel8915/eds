function loadScript(src, attrs) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        script.setAttribute(key, attrs[key]);
      });
    }
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

async function loadDependencies() {
  if (window.Swiper) return;
  await Promise.all([
    loadCSS("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"),
    loadScript("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"),
  ]);
}

export default async function decorate(block) {
  await loadDependencies();

  const container = document.createElement("div");
  container.className = "swiper-block-container";

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "swiper-arrows-container";

  const leftArrow = document.createElement("button");
  leftArrow.className = "swiper-arrow-button left-arrow";
  leftArrow.innerHTML = `<div class="arrow-icon"></div>`;
  leftArrow.setAttribute("aria-label", "Previous Slide");

  const rightArrow = document.createElement("button");
  rightArrow.className = "swiper-arrow-button right-arrow";
  rightArrow.innerHTML = `<div class="arrow-icon"></div>`;
  rightArrow.setAttribute("aria-label", "Next Slide");

  arrowsContainer.append(leftArrow, rightArrow);
  container.append(arrowsContainer);

  const cards = []; // Track all card elements

  const rows = [...block.children];
  rows.forEach((row) => {
    const hasContent =
      row.textContent.trim() !== "" || row.querySelector("picture");
    if (!hasContent) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const card = document.createElement("div");
    card.className = "card";
    cards.push(card); // Add card to tracking array

    const [imageCell, titleCell, descCell, ...metaCells] = [...row.children];

    const picture = imageCell?.querySelector("picture");
    if (picture) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-container";
      imageWrapper.appendChild(picture);
      card.appendChild(imageWrapper);
    }

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    if (titleCell?.textContent.trim()) {
      const titleEl = document.createElement("h3");
      titleEl.className = "card-title";
      titleEl.textContent = titleCell.textContent;
      cardContent.appendChild(titleEl);
    }

    if (descCell?.textContent.trim()) {
      const descEl = document.createElement("p");
      descEl.className = "card-description split-text";
      descEl.textContent = descCell.textContent;
      cardContent.appendChild(descEl);
    }

    if (metaCells.length > 0) {
      const metaEl = document.createElement("div");
      metaEl.className = "card-meta";
      metaCells.forEach((cell) => {
        if (cell.textContent.trim()) {
          const p = document.createElement("p");
          p.innerHTML = cell.innerHTML;
          metaEl.appendChild(p);
        }
      });
      cardContent.appendChild(metaEl);
    }

    card.appendChild(cardContent);
    slide.appendChild(card);
    swiperWrapper.appendChild(slide);
  });

  swiperContainer.appendChild(swiperWrapper);
  container.appendChild(swiperContainer);
  block.innerHTML = "";
  block.appendChild(container);

  // Function to update arrow container height based on active card
  const positionArrows = (swiper) => {
    if (!cards.length) return;

    const activeIndex = swiper.activeIndex;
    const activeCard = cards[activeIndex];

    if (activeCard) {
      const cardHeight = activeCard.offsetHeight;
      arrowsContainer.style.height = `${cardHeight}px`;

      // Adjust arrow vertical position to stay centered
      const arrowHeight = 40; // Match your arrow button height
      const centerPosition = cardHeight / 2 - arrowHeight / 2;

      leftArrow.style.top = `${centerPosition}px`;
      rightArrow.style.top = `${centerPosition}px`;
    }
  };

  // Initialize Swiper
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
    spaceBetween: 24,
    mousewheel: {
      forceToAxis: true,
    },
    navigation: {
      nextEl: rightArrow,
      prevEl: leftArrow,
    },

    on: {
      init: (s) => {
        updateArrowVisibility(s);
        positionArrows(s);

        // Initial positioning fallback
        if (!cards.length) {
          arrowsContainer.style.height = "400px"; // Default card height
        }
      },
      slideChange: (s) => {
        updateArrowVisibility(s);
        positionArrows(s);
      },
      resize: (s) => {
        positionArrows(s);
      },
    },
  });

  // Function to handle arrow visibility
  function updateArrowVisibility(s) {
    leftArrow.style.opacity = s.isBeginning ? "0" : "1";
    rightArrow.style.opacity = s.isEnd ? "0" : "1";
    leftArrow.style.pointerEvents = s.isBeginning ? "none" : "auto";
    rightArrow.style.pointerEvents = s.isEnd ? "none" : "auto";
  }

  // Initial resize observer for cards
  if (window.ResizeObserver && cards.length) {
    const resizeObserver = new ResizeObserver(() => {
      positionArrows(swiper);
    });

    // Observe all cards for height changes
    cards.forEach((card) => {
      resizeObserver.observe(card);
    });
  }
}
