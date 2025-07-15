import { loadCSS } from "../../scripts/aem.js";
export default function decorate(block) {
  const textCol = document.createElement("div");
  textCol.className = "text-image__text-column";

  const imageCol = document.createElement("div");
  imageCol.className = "text-image__image-column";

  const rows = [...block.children];

  let imageRight = false;
  const positionRow = rows[3];
  if (positionRow && positionRow.textContent.trim().toLowerCase() === "right") {
    imageRight = true;
    positionRow.remove();
  }

  const titleRow = rows[0];
  let title = "";
  if (titleRow) {
    title = titleRow.textContent.trim();
    title = title.replace(/&amp;nbsp;/g, " ").replace(/&lt;\/?p&gt;/g, "");
  }

  const descRow = rows[1];
  let descriptionContent = null;
  if (descRow) {
    descriptionContent =
      descRow.querySelector("div")?.cloneNode(true) || descRow.cloneNode(true);
  }

  const imageRow = rows[2];

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "text-image__content-wrapper";

  if (title) {
    const titleEl = document.createElement("div");
    titleEl.className = "text-image__title text-t5";
    titleEl.textContent = title;
    textCol.append(titleEl);
  }

  if (descriptionContent) {
    const descEl = document.createElement("div");
    descEl.className = "text-image__description text-p1";

    while (descriptionContent.firstChild) {
      descEl.appendChild(descriptionContent.firstChild);
    }

    contentWrapper.append(descEl);
  }

  if (imageRow && imageRow.querySelector("picture")) {
    imageCol.append(imageRow.querySelector("picture").cloneNode(true));
  }

  const buttonRow = rows[4];
  if (buttonRow && buttonRow.querySelector("a.button")) {
    const buttonLink = buttonRow.querySelector("a.button");
    const buttonText = buttonLink.textContent.trim();

    const textSpan = document.createElement("span");
    const textElement = document.createElement("p");
    textElement.className = "text-b";
    textElement.textContent = buttonText;
    textSpan.appendChild(textElement);

    const icon = document.createElement("div");
    icon.className = "button-icon";
    icon.setAttribute("aria-hidden", "true");

    buttonLink.innerHTML = "";
    buttonLink.appendChild(textSpan);
    buttonLink.appendChild(icon);
    buttonLink.classList.add("button-styled");

    contentWrapper.append(buttonLink);
  }

  // ✅ Add "View Image Gallery" Button
  const viewGalleryBtn = document.createElement("button");
  viewGalleryBtn.className = "view-gallery-button button-styled";
  viewGalleryBtn.textContent = "View Image Gallery";

  viewGalleryBtn.addEventListener("click", async () => {
    // Load CSS (only if needed)
    loadCSS(
      `${window.hlx.codeBasePath}/blocks/property-gallery/property-gallery.css`
    );

    // Load JS
    const module = await import("../property-gallery/property-gallery.js");

    // Call decorate() only if not already decorated
    const galleryBlock = document.querySelector(".property-gallery.block");
    if (galleryBlock && !galleryBlock.classList.contains("decorated")) {
      await module.default(galleryBlock);
    }

    // Show the section
    const gallerySection = document.querySelector(
      ".property-gallery-container"
    );
    if (gallerySection) {
      gallerySection.classList.remove("hidden");
    } else {
      console.warn("Gallery section not found.");
    }
  });

  contentWrapper.append(viewGalleryBtn);

  textCol.append(contentWrapper);
  block.innerHTML = "";

  if (imageRight) {
    block.classList.add("image-right");
  }

  block.append(imageCol, textCol);
}
