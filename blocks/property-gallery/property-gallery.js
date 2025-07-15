import { moveInstrumentation } from "../../scripts/scripts.js";

/**
 * Repeating card size pattern: square → landscape → square → portrait
 */
const DIMENSION_CYCLE = ["square", "landscape", "square", "portrait"];

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

export function handleGalleryTrigger(e) {
  if (e) e.preventDefault();

  const galleryWrapper = document.querySelector(".image-gallery");
  if (galleryWrapper) {
    galleryWrapper.style.display = "flex";
    document.body.style.overflow = "hidden";
  } else {
    console.warn("Gallery wrapper (.image-gallery) not found");
  }
}

export default async function decorate(block) {
  const galleryWrapper = document.createElement("div");
  galleryWrapper.className = "image-gallery";

  block.parentNode.insertBefore(galleryWrapper, block);
  galleryWrapper.appendChild(block);

  const allCards = [...block.children];
  block.innerHTML = "";

  const container = document.createElement("div");
  container.className = "property-gallery-container";

  const scrollPrompt = document.createElement("div");
  scrollPrompt.className = "property-gallery-scroll-prompt";
  scrollPrompt.innerHTML = "<span>Scroll to Explore</span>";

  const lightbox = createLightbox();

  let validCardIndex = 0;

  allCards.forEach((row) => {
    const [imageCell, labelCell] = [...row.children];
    const picture = imageCell?.querySelector("picture");
    const label = labelCell?.textContent.trim();

    if (!picture) return;

    const dimension = DIMENSION_CYCLE[validCardIndex % DIMENSION_CYCLE.length];
    validCardIndex++;

    const card = document.createElement("div");
    card.className = `property-gallery-card is-${dimension}`;

    moveInstrumentation(row, card);

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "property-gallery-card__image-wrapper";

    moveInstrumentation(imageCell, imageWrapper);

    const img = picture.querySelector("img");
    const highResSrc = img.src;

    const image = document.createElement("img");
    image.src = highResSrc;
    image.alt = img.alt;
    image.loading = "lazy";

    imageWrapper.append(image);
    card.append(imageWrapper);

    if (label) {
      const labelEl = document.createElement("div");
      labelEl.className = "property-gallery-card__label";
      labelEl.textContent = label;

      moveInstrumentation(labelCell, labelEl);
      card.append(labelEl);
    }

    card.addEventListener("click", () => {
      const lightboxImg = lightbox.querySelector("img");
      lightboxImg.src = highResSrc;
      lightbox.classList.add("active");
    });

    container.appendChild(card);
  });

  const closeModalBtn = document.createElement("button");
  closeModalBtn.className = "property-gallery-modal-close";
  closeModalBtn.innerHTML = "&times;";
  closeModalBtn.addEventListener("click", () => {
    galleryWrapper.style.display = "none";
    document.body.style.overflow = "";
  });

  block.append(closeModalBtn, container, scrollPrompt);
  block.classList.add("decorated");
}

document.querySelectorAll('a[href="/imageGallery"]').forEach((anchor) => {
  anchor.addEventListener("click", handleGalleryTrigger);
});
