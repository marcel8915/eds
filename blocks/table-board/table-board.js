export default function decorate(block) {
  const section = document.createElement("section");
  section.className = "press-section";

  const titleSection = document.createElement("section");
  titleSection.className = "press-title-section";
  titleSection.innerHTML = `
    <div class="scroll-reveal">
      <div class="max-w-900px">
        <h2 class="text-t1">
          <span class="word inline-block">Find</span> 
          <span class="word inline-block">the</span> 
          <span class="word inline-block">latest</span> 
          <span class="word inline-block">news</span>
        </h2>
      </div>
    </div>
  `;

  section.appendChild(titleSection);

  const itemsContainer = document.createElement("div");
  itemsContainer.className = "w-full";

  Array.from(block.children).forEach((row) => {
    const cells = Array.from(row.children);
    if (cells.length < 4) return;

    const item = document.createElement("div");
    item.className = "press-item";

    const flexContainer = document.createElement("div");
    flexContainer.className = "press-flex-container";

    const imageContainer = document.createElement("div");
    imageContainer.className = "press-image-container";
    imageContainer.innerHTML = cells[0].innerHTML;

    const contentContainer = document.createElement("div");
    contentContainer.className = "press-content-container";

    const date = document.createElement("p");
    date.className = "press-date";
    date.textContent = cells[1].textContent;

    const titleGroup = document.createElement("div");
    titleGroup.className = "press-title-group";

    const titleLink = document.createElement("a");
    titleLink.href = cells[2].querySelector("a")?.href || "#";
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.className = "press-title-link";

    const titleHeading = document.createElement("h2");
    titleHeading.className = "press-title-heading";
    titleHeading.textContent = cells[2].textContent;

    titleLink.appendChild(titleHeading);
    titleGroup.appendChild(titleLink);

    const description = document.createElement("div");
    description.className = "press-description";
    description.innerHTML = cells[3].innerHTML;

    contentContainer.append(date, titleGroup, description);

    if (cells[2].querySelector("a")) {
      const mobileButton = document.createElement("div");
      mobileButton.className = "press-mobile-button";
      mobileButton.innerHTML = `
        <a href="${
          cells[2].querySelector("a").href
        }" target="_blank" rel="noopener noreferrer">
          <button class="press-mobile-button-inner">
            <span class="press-mobile-button-text">View Press Info</span>
          </button>
        </a>
      `;
      contentContainer.appendChild(mobileButton);
    }

    flexContainer.append(imageContainer, contentContainer);
    item.appendChild(flexContainer);
    itemsContainer.appendChild(item);
  });

  section.appendChild(itemsContainer);
  block.replaceWith(section);
}
