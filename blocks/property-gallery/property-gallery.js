import { loadSwiper } from "../../scripts/utils.js";

/**
 * Defines the repeating cycle of card dimensions.
 * The new cycle is: square, landscape, square, portrait
 */
const DIMENSION_CYCLE = ["square", "landscape", "square", "portrait"];

/**
 * Creates the lightbox element for full-screen image viewing.
 * @returns {HTMLElement} The lightbox element.
 */
function createLightbox() {
  const lightbox = document.createElement("div");
  lightbox.className = "property-gallery-lightbox";

  const closeBtn = document.createElement("button");
  closeBtn.className = "property-gallery-lightbox__close";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => lightbox.classList.remove("active");

  const image = document.createElement("img");
  lightbox.append(image, closeBtn);

  document.body.append(lightbox);
  return lightbox;
}

export default async function decorate(block) {
  await loadSwiper();

  const allCards = [...block.children];
  block.innerHTML = "";

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper property-gallery-container";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  const scrollPrompt = document.createElement("div");
  scrollPrompt.className = "property-gallery-scroll-prompt";
  scrollPrompt.innerHTML = "<span>Scroll to Explore</span>";

  swiperContainer.append(swiperWrapper);
  block.append(swiperContainer, scrollPrompt);

  const lightbox = createLightbox();

  let validCardIndex = 0;

  allCards.forEach((row) => {
    const [imageCell, labelCell] = [...row.children];
    const picture = imageCell?.querySelector("picture");
    const label = labelCell?.textContent.trim();

    if (!picture) return;

    const dimension = DIMENSION_CYCLE[validCardIndex % DIMENSION_CYCLE.length];
    validCardIndex++;

    const slide = document.createElement("div");
    slide.className = `swiper-slide property-gallery-card is-${dimension}`;

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "property-gallery-card__image-wrapper";

    const img = picture.querySelector("img");
    const highResSrc = img.src;

    const imageForCard = document.createElement("img");
    imageForCard.src = highResSrc;
    imageForCard.alt = img.alt;
    imageForCard.loading = "lazy";

    imageWrapper.append(imageForCard);
    slide.append(imageWrapper);

    if (label) {
      const labelEl = document.createElement("div");
      labelEl.className = "property-gallery-card__label";
      labelEl.textContent = label;
      slide.append(labelEl);
    }

    slide.addEventListener("click", () => {
      const lightboxImg = lightbox.querySelector("img");
      lightboxImg.src = highResSrc;
      lightbox.classList.add("active");
    });

    swiperWrapper.append(slide);
  });

  new Swiper(swiperContainer, {
    slidesPerView: "auto",
    spaceBetween: 24,
    freeMode: true,
    mousewheel: true,
    on: {
      scroll() {
        scrollPrompt.style.opacity = "0";
        scrollPrompt.style.pointerEvents = "none";
      },
    },
  });
}
