import { moveInstrumentation } from '../../scripts/scripts.js'; 

export default function decorate(block) {
  // Create the main container structure that CSS expects
  const mainContainer = document.createElement("div");
  const galleryContainer = document.createElement("div");
  galleryContainer.className = "column-tile-container-col";
  
  const galleryWrapper = document.createElement("div");
  galleryWrapper.className = "column-tile-wrapper-col";
  galleryContainer.appendChild(galleryWrapper);

  // Process each card while preserving original elements where possible
  Array.from(block.children).forEach((card) => {
    const hasContent = card.textContent.trim() !== "" || card.querySelector("picture");
    if (!hasContent) return;

    // Create the card container
    const galleryCard = document.createElement("div");
    galleryCard.className = "column-tile-card";
    
    // Move instrumentation from original card to new card container
    moveInstrumentation(card, galleryCard);

    const cardSections = Array.from(card.children);

    // Handle image section - preserve original image element
    const image = cardSections[0]?.querySelector("picture");
    if (image) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "column-tile-images";
      
      // Move the original image element instead of cloning
      moveInstrumentation(cardSections[0], imageWrapper);
      imageWrapper.appendChild(image);
      galleryCard.appendChild(imageWrapper);
    }

    const contentContainer = document.createElement("div");
    contentContainer.className = "column-tile-content";

    // LEFT COLUMN
    const leftColumn = document.createElement("div");
    leftColumn.className = "column-tile-left";

    // Label section - preserve original content
    if (cardSections[1]?.textContent.trim()) {
      const label = document.createElement("p");
      label.className = "column-tile-label";
      
      // Move original content instead of copying text
      moveInstrumentation(cardSections[1], label);
      while (cardSections[1].firstChild) {
        label.appendChild(cardSections[1].firstChild);
      }
      leftColumn.appendChild(label);
    }

    // Secondary link section
    const originalSecondaryLink = cardSections[2]?.querySelector("a");
    if (originalSecondaryLink) {
      const secondaryLink = document.createElement("a");
      secondaryLink.href = originalSecondaryLink.getAttribute("href") || "#";
      secondaryLink.className = "column-tile-sub-link";
      
      moveInstrumentation(originalSecondaryLink, secondaryLink);

      // Sub description
      if (cardSections[3]?.textContent.trim()) {
        const subDescription = document.createElement("p");
        subDescription.className = "column-tile-sub-description";
        
        moveInstrumentation(cardSections[3], subDescription);
        while (cardSections[3].firstChild) {
          subDescription.appendChild(cardSections[3].firstChild);
        }
        secondaryLink.appendChild(subDescription);
      }

      leftColumn.appendChild(secondaryLink);
    }

    // RIGHT COLUMN
    const rightColumn = document.createElement("div");
    rightColumn.className = "column-tile-right";

    // Supporting text
    if (cardSections[6]?.textContent.trim()) {
      const rightDescription = document.createElement("p");
      rightDescription.className = "column-tile-supporting-text";
      
      moveInstrumentation(cardSections[6], rightDescription);
      while (cardSections[6].firstChild) {
        rightDescription.appendChild(cardSections[6].firstChild);
      }
      rightColumn.appendChild(rightDescription);
    }

    // Features section
    const featuresContainer = document.createElement("div");
    featuresContainer.className = "column-tile-features";

    for (let i = 7; i < cardSections.length; i += 2) {
      if (i + 1 < cardSections.length) {
        const featureItem = document.createElement("div");
        featureItem.className = "column-tile-feature";

        // Feature icon - preserve original picture element
        const originalIcon = cardSections[i].querySelector("picture");
        if (originalIcon) {
          const iconWrapper = document.createElement("div");
          iconWrapper.className = "column-tile-feature-icon";
          
          moveInstrumentation(cardSections[i], iconWrapper);
          iconWrapper.appendChild(originalIcon);
          featureItem.appendChild(iconWrapper);
        }

        // Feature text - preserve original content
        const text = document.createElement("div");
        text.className = "column-tile-feature-text";
        
        moveInstrumentation(cardSections[i + 1], text);
        while (cardSections[i + 1].firstChild) {
          text.appendChild(cardSections[i + 1].firstChild);
        }
        featureItem.appendChild(text);

        featuresContainer.appendChild(featureItem);
      }
    }

    if (featuresContainer.children.length > 0) {
      rightColumn.appendChild(featuresContainer);
    }

    // Content main wrapper
    const contentMain = document.createElement("div");
    contentMain.className = "column-tile-content-main";

    if (leftColumn.children.length > 0) {
      contentMain.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentMain.appendChild(rightColumn);
    }

    if (contentMain.children.length > 0) {
      contentContainer.appendChild(contentMain);
    }

    // LINK SECTION - preserve original link element
    const originalMainLink = cardSections[4]?.querySelector("a");
    if (originalMainLink) {
      const contentLink = document.createElement("div");
      contentLink.className = "column-tile-content-link";

      const link = document.createElement("a");
      link.href = originalMainLink.getAttribute("href") || "#";
      link.className = "column-tile-link";
      
      moveInstrumentation(originalMainLink, link);

      // Description section
      if (cardSections[5]?.textContent.trim()) {
        const description = document.createElement("p");
        description.className = "column-tile-description";

        const textSpan = document.createElement("span");
        textSpan.className = "description-text";
        
        moveInstrumentation(cardSections[5], textSpan);
        while (cardSections[5].firstChild) {
          textSpan.appendChild(cardSections[5].firstChild);
        }
        description.appendChild(textSpan);

        const svg = document.createElement("img");
        svg.src = "/icons/chevron_forward.svg";
        svg.alt = "Arrow";
        svg.className = "column-tile-description-icon";
        description.appendChild(svg);

        link.appendChild(description);
      }

      contentLink.appendChild(link);
      contentContainer.appendChild(contentLink);
    }

    if (contentContainer.children.length > 0) {
      galleryCard.appendChild(contentContainer);
    }

    galleryWrapper.appendChild(galleryCard);
  });

  mainContainer.appendChild(galleryContainer);
  block.innerHTML = "";
  block.appendChild(mainContainer);
}