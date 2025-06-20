export default function decorate(block) {
  const container = document.createElement("div");
  container.className = "three-image-description-container";

  const layout = block.dataset.layout || "images-above";

  const headerSection = document.createElement("div");
  headerSection.className = "three-image-description-header";

  const contentSection = document.createElement("div");
  contentSection.className = "three-image-description-content";

  const children = [...block.children];

  if (children.length > 0) {
    const titleEl = children.shift();
    titleEl.className = "three-image-description-title";
    headerSection.appendChild(titleEl);
  }

  if (children.length > 0) {
    const descEl = children.shift();
    descEl.className = "three-image-description-text";
    headerSection.appendChild(descEl);
  }

  children.forEach((child) => {
    contentSection.appendChild(child);
  });

  if (layout === "images-above") {
    container.appendChild(contentSection);
    container.appendChild(headerSection);
  } else if (layout === "images-below") {
    container.appendChild(headerSection);
    container.appendChild(contentSection);
  } else if (layout === "images-left") {
    const flexContainer = document.createElement("div");
    flexContainer.className = "three-image-description-flex";
    flexContainer.appendChild(contentSection);
    flexContainer.appendChild(headerSection);
    container.appendChild(flexContainer);
  } else {
    const flexContainer = document.createElement("div");
    flexContainer.className = "three-image-description-flex";
    flexContainer.appendChild(headerSection);
    flexContainer.appendChild(contentSection);
    container.appendChild(flexContainer);
  }

  block.innerHTML = "";
  block.appendChild(container);
}
