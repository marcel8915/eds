export default function decorate(block) {
  const container = document.createElement("div");
  container.className = "table-board-container";

  const rows = [...block.children];

  const sectionTitleRow = rows[0];
  let sectionTitle = "";
  if (sectionTitleRow) {
    sectionTitle = sectionTitleRow.textContent.trim();
    sectionTitleRow.remove();
  }

  if (rows.length > 1 && rows[1].textContent.trim() === "") {
    rows[1].remove();
  }

  let viewAllText = "";
  let viewAllLink = "";
  if (rows.length > 2) {
    const viewAllTextRow = rows[2];
    viewAllText = viewAllTextRow.textContent.trim();

    if (rows.length > 3 && rows[3].querySelector(".button-container a")) {
      viewAllLink = rows[3]
        .querySelector(".button-container a")
        .getAttribute("href");

      rows.splice(2, 2);
    }
  }

  if (sectionTitle) {
    const titleElement = document.createElement("h2");
    titleElement.className = "table-board-section-title";
    titleElement.textContent = sectionTitle;
    container.append(titleElement);
  }

  const itemsContainer = document.createElement("div");
  itemsContainer.className = "table-board-items";

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const columns = [...row.children];

    if (columns.length < 5) continue;

    const item = document.createElement("div");
    item.className = "table-board-item";

    const itemContent = document.createElement("div");
    itemContent.className = "table-board-item-content";

    const imageCol = columns[0];
    if (imageCol && imageCol.querySelector("picture")) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "table-board-image-container";
      imageContainer.append(imageCol.querySelector("picture").cloneNode(true));
      itemContent.append(imageContainer);
    }

    const textContent = document.createElement("div");
    textContent.className = "table-board-text-content";

    const dateCol = columns[1];
    if (dateCol) {
      const dateElement = document.createElement("div");
      dateElement.className = "text-l1 table-board-date";
      dateElement.textContent = dateCol.textContent.trim();
      textContent.append(dateElement);
    }

    const titleCol = columns[2];
    const titleLinkCol = columns[3];
    if (titleCol) {
      const titleWrapper = document.createElement("div");
      titleWrapper.className = "table-board-item-title text-h2";

      const titleText = titleCol.textContent.trim();
      const titleHtml = titleCol.innerHTML.trim();
      const hasNewline = titleText.includes("\n") || titleHtml.includes("<br>");

      if (titleLinkCol && titleLinkCol.querySelector("a")) {
        const link = titleLinkCol.querySelector("a").getAttribute("href");
        const linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.className = "table-board-title-link";
        linkElement.style.whiteSpace = "pre-line";

        const groupContainer = document.createElement("div");
        groupContainer.className = "table-board-title-group";

        if (hasNewline) {
          const lines = titleText.split("\n");

          groupContainer.appendChild(document.createTextNode(lines[0].trim()));
          groupContainer.appendChild(document.createElement("br"));

          const secondLine = document.createElement("span");
          secondLine.className = "table-board-title-line";
          secondLine.textContent = lines[1] ? lines[1].trim() : "";

          const underline = document.createElement("span");
          underline.className = "table-board-title-underline";

          secondLine.appendChild(underline);
          groupContainer.appendChild(secondLine);
        } else {
          const titleLine = document.createElement("span");
          titleLine.className = "table-board-title-line";
          titleLine.textContent = titleText;

          const underline = document.createElement("span");
          underline.className = "table-board-title-underline";

          titleLine.appendChild(underline);
          groupContainer.appendChild(titleLine);
        }

        linkElement.appendChild(groupContainer);
        titleWrapper.appendChild(linkElement);
      } else {
        titleWrapper.textContent = titleText;
      }

      textContent.append(titleWrapper);
    }

    const descCol = columns[4];
    if (descCol) {
      const descElement = document.createElement("div");
      descElement.className = "text-p2 table-board-description";
      descElement.innerHTML = descCol.innerHTML;
      textContent.append(descElement);
    }

    if (columns.length > 6) {
      const buttonTextCol = columns[5];
      const buttonLinkCol = columns[6];

      if (buttonTextCol && buttonLinkCol && buttonLinkCol.querySelector("a")) {
        const buttonText =
          buttonTextCol.textContent.trim() || "View Press Info";
        const buttonLink = buttonLinkCol
          .querySelector("a")
          .getAttribute("href");

        if (buttonLink) {
          const mobileButton = document.createElement("a");
          mobileButton.href = buttonLink;
          mobileButton.target = "_blank";
          mobileButton.rel = "noopener noreferrer";
          mobileButton.className = "table-board-mobile-button secondary-button";

          const underlineContainer = document.createElement("span");
          underlineContainer.className = "underline-container";
          underlineContainer.textContent = buttonText;

          const underline = document.createElement("span");
          underline.className = "underline";

          underlineContainer.appendChild(underline);
          mobileButton.appendChild(underlineContainer);

          textContent.append(mobileButton);
        }
      }
    }

    itemContent.append(textContent);
    item.append(itemContent);
    itemsContainer.append(item);
  }

  container.append(itemsContainer);

  if (viewAllLink && viewAllText) {
    const viewAllContainer = document.createElement("div");
    viewAllContainer.className = "table-board-view-all";

    const viewAllLinkElement = document.createElement("a");
    viewAllLinkElement.href = viewAllLink;
    viewAllLinkElement.target = "_blank";
    viewAllLinkElement.rel = "noopener noreferrer";
    viewAllLinkElement.className = "table-board-view-all-link";

    const underlineContainer = document.createElement("span");
    underlineContainer.className = "underline-container";
    underlineContainer.textContent = viewAllText;

    const underline = document.createElement("span");
    underline.className = "underline";

    underlineContainer.appendChild(underline);
    viewAllLinkElement.innerHTML = "";
    viewAllLinkElement.appendChild(underlineContainer);

    viewAllContainer.append(viewAllLinkElement);
    container.append(viewAllContainer);
  }

  block.innerHTML = "";
  block.append(container);
}
