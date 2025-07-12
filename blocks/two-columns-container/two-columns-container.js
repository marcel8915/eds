import { createTypesFilter } from "./types-filter.js";

export default function decorate(block) {
  block.classList.add("two-columns-container-col");

  const filterWrapper = document.createElement("div");
  filterWrapper.className = "two-columns-container-filter-wrapper";
  block.parentNode.insertBefore(filterWrapper, block);

  const filterRow = document.createElement("div");
  filterRow.className = "two-columns-container-filter-row";
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
    row.classList.add("two-columns-container-card");
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
      contentMain.className = "two-columns-container-content-main";

      const hasLeftContent = cardSections.some((_, i) => i > 0 && i < 6);
      const hasRightContent = cardSections.some((_, i) => i > 5 && i < 8);

      if (hasLeftContent) {
        leftContainer = document.createElement("div");
        leftContainer.className = "two-columns-container-left";
        contentMain.appendChild(leftContainer);
      }

      if (hasRightContent) {
        rightContainer = document.createElement("div");
        rightContainer.className = "two-columns-container-right";
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
            section.classList.add("two-columns-container-images");
            if (contentMain) {
              row.insertBefore(contentMain, section.nextSibling);
            }
          }
          break;

        case 1:
          if (leftContainer && section.textContent.trim()) {
            section.classList.add("two-columns-container-label");
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
            secondaryLink.className = "two-columns-container-sub-link";

            const subDescription = document.createElement("p");
            subDescription.className = "two-columns-container-sub-description";
            subDescription.textContent = nextSection.textContent.trim();
            secondaryLink.appendChild(subDescription);

            section.replaceWith(secondaryLink);
            nextSection.remove();
            cardSections[3] = null;

            if (leftContainer) leftContainer.appendChild(secondaryLink);
          } else if (leftContainer) {
            section.classList.add("two-columns-container-sub-link");
            link.classList.add("two-columns-container-sub-link");
            leftContainer.appendChild(section);
          }
          break;
        }

        case 3:
          if (section && leftContainer && section.textContent.trim()) {
            section.classList.add("two-columns-container-sub-description");
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
            contentLink.className = "two-columns-container-link";

            const description = document.createElement("div");
            description.className = "two-columns-container-description";
            description.textContent = nextSection.textContent.trim();

            const svg = document.createElement("img");
            svg.src = "/icons/chevron_forward.svg";
            svg.alt = "Arrow";
            svg.className = "two-columns-container-description-icon";
            description.appendChild(svg);

            contentLink.appendChild(description);
            section.replaceWith(contentLink);
            nextSection.remove();
            cardSections[5] = null;

            if (leftContainer) leftContainer.appendChild(contentLink);
          } else if (leftContainer) {
            section.classList.add("two-columns-container-link");
            link.classList.add("two-columns-container-link");
            leftContainer.appendChild(section);
          }
          break;
        }

        case 5:
          if (section && leftContainer && section.textContent.trim()) {
            section.classList.add("two-columns-container-description");

            if (
              !section.querySelector(".two-columns-container-description-icon")
            ) {
              const svg = document.createElement("img");
              svg.src = "/icons/chevron_forward.svg";
              svg.alt = "Arrow";
              svg.className = "two-columns-container-description-icon";
              section.appendChild(svg);
            }

            leftContainer.appendChild(section);
          }
          break;

        case 6:
          if (rightContainer && section.textContent.trim()) {
            section.classList.add("two-columns-container-supporting-text");
            rightContainer.appendChild(section);
          }
          break;

        default:
          if (sectionIndex === 7 && rightContainer) {
            const featuresContainer = document.createElement("div");
            featuresContainer.className = "two-columns-container-features";
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
                featureDiv.className = "two-columns-container-feature";

                if (iconSection) {
                  iconSection.classList.add(
                    "two-columns-container-feature-icon"
                  );
                  featureDiv.appendChild(iconSection);
                }
                if (textSection) {
                  textSection.classList.add(
                    "two-columns-container-feature-text"
                  );
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
