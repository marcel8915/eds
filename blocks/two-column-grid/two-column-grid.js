import { moveInstrumentation } from '../../scripts/scripts.js'; 

export default function decorate(block) {
  // Create the main container structure that CSS expects
  const galleryContainer = document.createElement("div");
  galleryContainer.className = "column-tile-container-col";
  
  const galleryWrapper = document.createElement("div");
  galleryWrapper.className = "column-tile-wrapper-col";
  galleryContainer.appendChild(galleryWrapper);

  // Process each card - follow the cards.js pattern
  [...block.children].forEach((card) => {
    const hasContent = card.textContent.trim() !== "" || card.querySelector("picture");
    if (!hasContent) return;

    // Create the card container and move instrumentation from original card
    const galleryCard = document.createElement("div");
    galleryCard.className = "column-tile-card";
    moveInstrumentation(card, galleryCard);

    // Move all children from original card to new card (like cards.js does)
    while (card.firstElementChild) {
      galleryCard.append(card.firstElementChild);
    }

    // Now process the moved children to add appropriate classes
    const cardSections = Array.from(galleryCard.children);

    // Handle image section (first child)
    if (cardSections[0]?.querySelector("picture")) {
      cardSections[0].className = "column-tile-images";
    }

    // Create content container for the rest
    const contentContainer = document.createElement("div");
    contentContainer.className = "column-tile-content";

    // Create main content wrapper
    const contentMain = document.createElement("div");
    contentMain.className = "column-tile-content-main";

    // LEFT COLUMN
    const leftColumn = document.createElement("div");
    leftColumn.className = "column-tile-left";

    // Label section (index 1)
    if (cardSections[1]?.textContent.trim()) {
      cardSections[1].className = "column-tile-label";
      leftColumn.appendChild(cardSections[1]);
    }

    // Secondary link wrapper
    if (cardSections[2]?.querySelector("a") || cardSections[3]?.textContent.trim()) {
      const secondaryLinkWrapper = document.createElement("div");
      
      if (cardSections[2]?.querySelector("a")) {
        const link = cardSections[2].querySelector("a");
        link.className = "column-tile-sub-link";
        
        if (cardSections[3]?.textContent.trim()) {
          cardSections[3].className = "column-tile-sub-description";
          link.appendChild(cardSections[3]);
        }
        
        secondaryLinkWrapper.appendChild(link);
        leftColumn.appendChild(secondaryLinkWrapper);
      }
    }

    // RIGHT COLUMN
    const rightColumn = document.createElement("div");
    rightColumn.className = "column-tile-right";

    // Supporting text (index 6)
    if (cardSections[6]?.textContent.trim()) {
      cardSections[6].className = "column-tile-supporting-text";
      rightColumn.appendChild(cardSections[6]);
    }

    // Features (indices 7+)
    const featuresContainer = document.createElement("div");
    featuresContainer.className = "column-tile-features";

    for (let i = 7; i < cardSections.length; i += 2) {
      if (i + 1 < cardSections.length) {
        const featureItem = document.createElement("div");
        featureItem.className = "column-tile-feature";

        // Feature icon
        if (cardSections[i]?.querySelector("picture")) {
          cardSections[i].className = "column-tile-feature-icon";
          featureItem.appendChild(cardSections[i]);
        }

        // Feature text
        if (cardSections[i + 1]?.textContent.trim()) {
          cardSections[i + 1].className = "column-tile-feature-text";
          featureItem.appendChild(cardSections[i + 1]);
        }

        featuresContainer.appendChild(featureItem);
      }
    }

    if (featuresContainer.children.length > 0) {
      rightColumn.appendChild(featuresContainer);
    }

    // Add columns to main content
    if (leftColumn.children.length > 0) {
      contentMain.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentMain.appendChild(rightColumn);
    }

    if (contentMain.children.length > 0) {
      contentContainer.appendChild(contentMain);
    }

    // MAIN LINK SECTION (indices 4 & 5)
    if (cardSections[4]?.querySelector("a") || cardSections[5]?.textContent.trim()) {
      const contentLink = document.createElement("div");
      contentLink.className = "column-tile-content-link";

      if (cardSections[4]?.querySelector("a")) {
        const link = cardSections[4].querySelector("a");
        link.className = "column-tile-link";

        if (cardSections[5]?.textContent.trim()) {
          const description = document.createElement("div");
          description.className = "column-tile-description";
          
          cardSections[5].className = "description-text";
          description.appendChild(cardSections[5]);

          const svg = document.createElement("img");
          svg.src = "/icons/chevron_forward.svg";
          svg.alt = "Arrow";
          svg.className = "column-tile-description-icon";
          description.appendChild(svg);

          link.appendChild(description);
        }

        contentLink.appendChild(link);
      }

      if (contentLink.children.length > 0) {
        contentContainer.appendChild(contentLink);
      }
    }

    // Add content container to card
    if (contentContainer.children.length > 0) {
      galleryCard.appendChild(contentContainer);
    }

    galleryWrapper.appendChild(galleryCard);
  });

  // Replace block content
  block.textContent = '';
  block.appendChild(galleryContainer);
}