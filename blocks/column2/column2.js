export default function decorate(block) {
  const cardContainer = document.createElement("div");
  cardContainer.className = "tiles-card-container";

  const cardWrapper = document.createElement("div");
  cardWrapper.className = "tiles-card-wrapper";
  cardContainer.appendChild(cardWrapper);

  Array.from(block.children).forEach((card) => {
    const hasContent =
      card.textContent.trim() !== "" || card.querySelector("picture");
    if (!hasContent) return;

    const tilesCard = document.createElement("div");
    tilesCard.className = "tiles-card";

    const image = card.querySelector("picture");
    if (image) {
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "tiles-card-image";
      imageWrapper.appendChild(image);
      tilesCard.appendChild(imageWrapper);
    }

    const contentContainer = document.createElement("div");
    contentContainer.className = "tiles-card-content";

    const leftColumn = document.createElement("div");
    leftColumn.className = "tiles-card-left";

    const rightColumn = document.createElement("div");
    rightColumn.className = "tiles-card-right";

    const cardSections = Array.from(card.children);

    if (cardSections[1]) {
      const label = document.createElement("div");
      label.className = "tiles-card-label";
      label.textContent = cardSections[1].textContent.trim();
      leftColumn.appendChild(label);
    }

    if (cardSections[3]) {
      const ctaText = document.createElement("div");
      ctaText.className = "tiles-card-ctatext";
      ctaText.textContent = cardSections[3].textContent.trim();
      leftColumn.appendChild(ctaText);
    }

    if (cardSections[2]?.textContent.trim()) {
      const ctaButton = document.createElement("a");
      ctaButton.href = cardSections[2].textContent.trim();
      ctaButton.className = "tiles-cta-button";

      ctaButton.textContent =
        cardSections[3]?.textContent.trim() || "Learn More";
      leftColumn.appendChild(ctaButton);
    }

    if (cardSections[4]) {
      const description = document.createElement("div");
      description.className = "tiles-card-title";
      description.textContent = cardSections[4].textContent.trim();
      rightColumn.appendChild(description);
    }

    if (leftColumn.children.length > 0) {
      contentContainer.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentContainer.appendChild(rightColumn);
    }

    if (contentContainer.children.length > 0) {
      tilesCard.appendChild(contentContainer);
    }

    cardWrapper.appendChild(tilesCard);
  });

  block.innerHTML = "";
  block.appendChild(cardContainer);
  //adding comment to trigger rebuild
}
