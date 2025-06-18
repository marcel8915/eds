export default async function decorate(block) {
  await loadDependencies();

  const container = document.createElement("div");
  container.className = "swiper-block-container";

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

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

  new Swiper(swiperContainer, {
    slidesPerView: "auto",
    freeMode: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    watchOverflow: true,
    preventClicksPropagation: true,
    resistance: true,
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
        slidesPerView: 3,
        spaceBetween: 32,
      },
    },
  });
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
