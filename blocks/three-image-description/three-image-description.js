export default function decorate(block) {
  const leftCol = document.createElement("div");
  leftCol.className = "three-image-grid__left-col";

  const rightCol = document.createElement("div");
  rightCol.className = "three-image-grid__right-col";

  const items = [];
  const children = [...block.children];
  while (children.length > 0) {
    const currentDiv = children.shift();

    if (currentDiv.querySelector("picture, img")) {
      const imageDiv = currentDiv;
      let captionDiv;

      if (children.length > 0 && !children[0].querySelector("picture, img")) {
        captionDiv = children.shift();
      } else {
        captionDiv = document.createElement("div");
      }
      items.push({ imageDiv, captionDiv });
    }
  }

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "three-image-grid__card";

    item.imageDiv.classList.add("three-image-grid__image");
    item.captionDiv.classList.add("three-image-grid__caption");

    card.append(item.imageDiv);
    card.append(item.captionDiv);

    if (index === 0) {
      leftCol.append(card);
    } else if (index === 1) {
      const cardWrapper = document.createElement("div");
      cardWrapper.className = "three-image-grid__card-wrapper--staggered";
      cardWrapper.append(card);
      leftCol.append(cardWrapper);
    } else if (index === 2) {
      rightCol.append(card);
    }
  });

  block.innerHTML = "";

  block.className = "three-image-grid";

  block.append(leftCol, rightCol);
}
