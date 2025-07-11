import { createTypesFilter } from "./types-filter.js";

export default function decorate(block) {
  block.classList.add("column-tile-container-col");

  const filterWrapper = document.createElement("div");
  filterWrapper.className = "two-column-grid-filter-wrapper";
  block.parentNode.insertBefore(filterWrapper, block);

  const filterRow = document.createElement("div");
  filterRow.className = "filter-row";
  filterWrapper.appendChild(filterRow);

  const children = Array.from(block.children);
  let destinationValues = [];
  let typeValues = [];

  if (children.length > 0) {
    destinationValues = children[0].textContent
      .trim()
      .split(",")
      .map((item) => item.trim().toLowerCase());
    children[0].remove();
  }

  if (children.length > 1) {
    typeValues = children[1].textContent
      .trim()
      .split(",")
      .map((item) => item.trim().toLowerCase());
    children[1].remove();
  }

  const typeDefaultLabel = "All Work";
  const destinationDefaultLabel = "All Destinations";

  const filterState = {
    type: typeDefaultLabel.toLowerCase(),
    destination: destinationDefaultLabel.toLowerCase(),
  };

  const destinationFilter = createTypesFilter({
    allTypes: destinationValues,
    defaultLabel: destinationDefaultLabel,
    activeType: destinationDefaultLabel,
    onFilterChange: (selectedDestination) => {
      filterState.destination = selectedDestination.toLowerCase();
      applyFilters();
    },
  });
  destinationFilter.classList.add("destination-filter");
  filterRow.appendChild(destinationFilter);

  const typeFilter = createTypesFilter({
    allTypes: typeValues,
    defaultLabel: typeDefaultLabel,
    activeType: typeDefaultLabel,
    onFilterChange: (selectedType) => {
      filterState.type = selectedType.toLowerCase();
      applyFilters();
    },
  });
  typeFilter.classList.add("type-filter");
  filterRow.appendChild(typeFilter);

  const cards = Array.from(block.children);
  let processedCards = [];

  cards.forEach((row, index) => {
    const hasContent =
      row.textContent.trim() !== "" || row.querySelector("picture");
    if (!hasContent) return;

    processCard(row, index);
    processedCards.push(row);
  });

  function applyFilters() {
    processedCards.forEach((card) => {
      const cardDestination = card.dataset.destination?.toLowerCase() || "";
      const cardType = card.dataset.type?.toLowerCase() || "";

      const typeMatch =
        filterState.type === typeDefaultLabel.toLowerCase() ||
        cardType === filterState.type;

      const destinationMatch =
        filterState.destination === destinationDefaultLabel.toLowerCase() ||
        cardDestination === filterState.destination;

      card.style.display = typeMatch && destinationMatch ? "" : "none";
    });
  }

  function processCard(row, index) {
    row.classList.add("column-tile-card");
    row.dataset.value = `card-${index + 1}`;

    const cardDivs = Array.from(row.children);
    const valueDivs = cardDivs.slice(-2);

    if (valueDivs.length >= 2) {
      row.dataset.destination = valueDivs[0].textContent.trim().toLowerCase();
      row.dataset.type = valueDivs[1].textContent.trim().toLowerCase();

      valueDivs.forEach((div) => div.remove());
    }

    const cardSections = Array.from(row.children);
    const needsContentMain = cardSections.some((_, i) => i > 0 && i < 8);
    let contentMain, leftContainer, rightContainer;

    if (needsContentMain) {
      contentMain = document.createElement("div");
      contentMain.className = "column-tile-content-main";

      const hasLeftContent = cardSections.some((_, i) => i > 0 && i < 6);
      const hasRightContent = cardSections.some((_, i) => i > 5 && i < 8);

      if (hasLeftContent) {
        leftContainer = document.createElement("div");
        leftContainer.className = "column-tile-left";
        contentMain.appendChild(leftContainer);
      }

      if (hasRightContent) {
        rightContainer = document.createElement("div");
        rightContainer.className = "column-tile-right";
        contentMain.appendChild(rightContainer);
      }
    }

    cardSections.forEach((section, sectionIndex) => {
      if (
        !section ||
        (!section.textContent.trim() && !section.querySelector("picture, a"))
      ) {
        section?.remove();
        return;
      }

      switch (sectionIndex) {
        case 0:
          if (section.querySelector("picture")) {
            section.classList.add("column-tile-images");
            if (contentMain) {
              row.insertBefore(contentMain, section.nextSibling);
            }
          }
          break;

        case 1:
          if (leftContainer && section.textContent.trim()) {
            section.classList.add("column-tile-label");
            leftContainer.appendChild(section);
          }
          break;

        case 2: {
          const link = section.querySelector("a");
          if (!link) {
            if (leftContainer && section.textContent.trim()) {
              leftContainer.appendChild(section);
            }
            break;
          }

          const nextSection = cardSections[3];
          const hasDescription = nextSection?.textContent.trim();

          if (hasDescription) {
            const secondaryLink = document.createElement("a");
            secondaryLink.href = link.getAttribute("href") || "#";
            secondaryLink.className = "column-tile-sub-link";

            const subDescription = document.createElement("p");
            subDescription.className = "column-tile-sub-description";
            subDescription.textContent = nextSection.textContent.trim();
            secondaryLink.appendChild(subDescription);

            section.replaceWith(secondaryLink);
            nextSection.remove();
            cardSections[3] = null;

            if (leftContainer) leftContainer.appendChild(secondaryLink);
          } else if (leftContainer) {
            section.classList.add("column-tile-sub-link");
            link.classList.add("column-tile-sub-link");
            leftContainer.appendChild(section);
          }
          break;
        }

        case 3:
          if (section && leftContainer && section.textContent.trim()) {
            section.classList.add("column-tile-sub-description");
            leftContainer.appendChild(section);
          }
          break;

        case 4: {
          const link = section.querySelector("a");
          if (!link) {
            if (leftContainer && section.textContent.trim()) {
              leftContainer.appendChild(section);
            }
            break;
          }

          const nextSection = cardSections[5];
          const hasDescription = nextSection?.textContent.trim();

          if (hasDescription) {
            const contentLink = document.createElement("a");
            contentLink.href = link.getAttribute("href") || "#";
            contentLink.className = "column-tile-link";

            const description = document.createElement("div");
            description.className = "column-tile-description";
            description.textContent = nextSection.textContent.trim();

            const svg = document.createElement("img");
            svg.src = "/icons/chevron_forward.svg";
            svg.alt = "Arrow";
            svg.className = "column-tile-description-icon";
            description.appendChild(svg);

            contentLink.appendChild(description);
            section.replaceWith(contentLink);
            nextSection.remove();
            cardSections[5] = null;

            if (leftContainer) leftContainer.appendChild(contentLink);
          } else if (leftContainer) {
            section.classList.add("column-tile-content-link");
            link.classList.add("column-tile-link");
            leftContainer.appendChild(section);
          }
          break;
        }

        case 5:
          if (section && leftContainer && section.textContent.trim()) {
            section.classList.add("column-tile-description");

            if (!section.querySelector(".column-tile-description-icon")) {
              const svg = document.createElement("img");
              svg.src = "/icons/chevron_forward.svg";
              svg.alt = "Arrow";
              svg.className = "column-tile-description-icon";
              section.appendChild(svg);
            }

            leftContainer.appendChild(section);
          }
          break;

        case 6:
          if (rightContainer && section.textContent.trim()) {
            section.classList.add("column-tile-supporting-text");
            rightContainer.appendChild(section);
          }
          break;

        default:
          if (sectionIndex === 7 && rightContainer) {
            const featuresContainer = document.createElement("div");
            featuresContainer.className = "column-tile-features";
            rightContainer.appendChild(featuresContainer);

            for (let i = 7; i < cardSections.length; i += 2) {
              const iconSection = cardSections[i];
              const textSection = cardSections[i + 1];

              if (
                (iconSection &&
                  (iconSection.textContent.trim() ||
                    iconSection.querySelector("picture"))) ||
                (textSection && textSection.textContent.trim())
              ) {
                const featureDiv = document.createElement("div");
                featureDiv.className = "column-tile-feature";

                if (iconSection) {
                  iconSection.classList.add("column-tile-feature-icon");
                  featureDiv.appendChild(iconSection);
                }
                if (textSection) {
                  textSection.classList.add("column-tile-feature-text");
                  featureDiv.appendChild(textSection);
                }

                featuresContainer.appendChild(featureDiv);
              }
            }
          }
          break;
      }
    });
  }
}
