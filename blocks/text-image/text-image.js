import { loadCSS } from "../../scripts/aem.js";
import { handleGalleryTrigger } from "../property-gallery/property-gallery.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  const rows = [...block.children];

  const textCol = document.createElement("div");
  textCol.className = "text-image__text-column";

  const imageCol = document.createElement("div");
  imageCol.className = "text-image__image-column";

  const titleRow = rows[0];
  const descRow = rows[1];
  const imageRow = rows[2];
  const positionRow = rows[3];
  const buttonRow = rows[4];

  const imageRight = positionRow?.textContent.trim().toLowerCase() === "right";

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "text-image__content-wrapper";

  const titleEl = document.createElement("div");
  if (titleRow?.textContent.trim()) {
    titleEl.className = "text-image__title text-t5";
    titleEl.textContent = titleRow.textContent
      .trim()
      .replace(/&amp;nbsp;/g, " ")
      .replace(/&lt;\/?p&gt;/g, "");
  }

  const descEl = document.createElement("div");
  if (descRow) {
    descEl.className = "text-image__description text-p1";
    const descriptionContent =
      descRow.querySelector("div")?.cloneNode(true) || descRow.cloneNode(true);
    while (descriptionContent.firstChild) {
      descEl.appendChild(descriptionContent.firstChild);
    }
  }

  const pictureEl = imageRow?.querySelector("picture")?.cloneNode(true);
  if (pictureEl) {
    imageCol.append(pictureEl);
  }

  const buttonLink = buttonRow?.querySelector("a.button");
  if (buttonLink) {
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
  }

  const viewGalleryLink = document.createElement("a");
  viewGalleryLink.className = "view-gallery-button button-styled";
  viewGalleryLink.textContent = "View Image Gallery";
  viewGalleryLink.href = "/imageGallery";
  viewGalleryLink.addEventListener("mouseenter", () => {
    loadCSS(
      `${window.hlx.codeBasePath}/blocks/property-gallery/property-gallery.css`
    );
    import("../property-gallery/property-gallery.js");
  });
  viewGalleryLink.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleGalleryTrigger(e);
  });

  if (typeof moveInstrumentation === "function") {
    try {
      if (titleRow && titleEl.textContent)
        moveInstrumentation(titleRow, titleEl);
      if (descRow && descEl.hasChildNodes())
        moveInstrumentation(descRow, descEl);
      if (imageRow && pictureEl) moveInstrumentation(imageRow, pictureEl);
      if (buttonRow && buttonLink) moveInstrumentation(buttonRow, buttonLink);
    } catch (e) {
      console.error("Error moving instrumentation:", e);
    }
  }

  if (titleEl.textContent) {
    textCol.append(titleEl);
  }
  if (descEl.hasChildNodes()) {
    contentWrapper.append(descEl);
  }
  if (buttonLink) {
    contentWrapper.append(buttonLink);
  }
  contentWrapper.append(viewGalleryLink);
  textCol.append(contentWrapper);

  block.innerHTML = "";
  if (imageRight) {
    block.classList.add("image-right");
  }
  block.append(imageCol, textCol);
}
