import { createTypesFilter } from "./types-filter.js";

export default function decorate(block) {
  const parentContainer = block.closest(".section.section-header-container");
  if (!parentContainer) return;

  if (!parentContainer.querySelector(".column-tile-filters")) {
    const filterContainer = document.createElement("div");
    filterContainer.className = "column-tile-filters";

    const allTypes = ["science", "technology", "music", "art"];
    let selectedTypes = [];

    const typesFilter = createTypesFilter({
      allTypes: allTypes,
      activeType: "All Types",
      defaultLabel: "All Types",
      onFilterChange: (selectedLabel) => {
        selectedTypes =
          selectedLabel === "All Types" ? [] : [selectedLabel.toLowerCase()];
        applyFilters();
      },
    });

    filterContainer.append(typesFilter);

    const header = parentContainer.querySelector(".section-header-wrapper");
    if (header) {
      header.after(filterContainer);
    } else {
      parentContainer.prepend(filterContainer);
    }
  }

  block.classList.add("column-tile-container-col");
  const cards = Array.from(block.children).filter(
    (row) => row.textContent.trim() !== "" || row.querySelector("picture")
  );

  cards.forEach((row, index) => {
    row.classList.add("column-tile-card");
    row.dataset.value = `card-${index + 1}`;
    row.dataset.type = ["science", "technology", "music", "art"][index % 4];

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
  });

  // 4. Filter function that works across all blocks
  function applyFilters() {
    const allCards = document.querySelectorAll(".column-tile-card");
    const activeFilter = parentContainer
      .querySelector(".type-filter-pill-text")
      ?.textContent.toLowerCase();
    const selectedTypes = activeFilter === "all types" ? [] : [activeFilter];

    allCards.forEach((card) => {
      const cardType = card.dataset.type.toLowerCase();
      const shouldShow =
        selectedTypes.length === 0 || selectedTypes.includes(cardType);
      card.style.display = shouldShow ? "" : "none";
    });
  }
}
