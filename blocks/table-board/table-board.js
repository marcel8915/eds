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
    const linkCol = columns[3];
    if (titleCol) {
      const titleWrapper = document.createElement("span");
      titleWrapper.className = "text-h2";

      const titleText = titleCol.textContent.trim();
      const titleHtml = titleCol.innerHTML.trim();
      const hasNewline = titleText.includes("\n") || titleHtml.includes("<br>");

      if (linkCol && linkCol.querySelector("a")) {
        const link = linkCol.querySelector("a").getAttribute("href");
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
          secondLine.className = "text-h2 table-board-title-line";
          secondLine.textContent = lines[1] ? lines[1].trim() : "";

          const underline = document.createElement("span");
          underline.className = "table-board-title-underline";

          secondLine.appendChild(underline);
          groupContainer.appendChild(secondLine);
        } else {
          const titleLine = document.createElement("span");
          titleLine.className = "text-h2 table-board-title-line";
          titleLine.textContent = titleText;

          const underline = document.createElement("span");
          underline.className = "table-board-title-underline";

          titleLine.appendChild(underline);
          groupContainer.appendChild(titleLine);
        }

        linkElement.appendChild(groupContainer);
        titleWrapper.appendChild(linkElement);
      } else {
        if (hasNewline) {
          const lines = titleText.split("\n");
          titleWrapper.appendChild(document.createTextNode(lines[0].trim()));
          titleWrapper.appendChild(document.createElement("br"));
          titleWrapper.appendChild(document.createTextNode(lines[1].trim()));
        } else {
          titleWrapper.textContent = titleText;
        }
        titleWrapper.style.whiteSpace = "pre-line";
      }

      textContent.append(titleWrapper);
    }

    const descCol = columns[4];
    if (descCol) {
      const descElement = document.createElement("div");
      descElement.className = "text-p2";
      descElement.innerHTML = descCol.innerHTML;
      textContent.append(descElement);
    }

    if (linkCol && linkCol.querySelector("a")) {
      const link = linkCol.querySelector("a").getAttribute("href");
      const mobileButton = document.createElement("a");
      mobileButton.href = link;
      mobileButton.target = "_blank";
      mobileButton.rel = "noopener noreferrer";
      mobileButton.className = "table-board-mobile-button secondary-button";

      const underlineContainer = document.createElement("span");
      underlineContainer.className = "underline-container";

      const buttonText = document.createElement("span");
      buttonText.textContent = "View Press Info";

      const underline = document.createElement("span");
      underline.className = "underline";

      underlineContainer.appendChild(buttonText);
      underlineContainer.appendChild(underline);
      mobileButton.appendChild(underlineContainer);
      textContent.append(mobileButton);
    }

    itemContent.append(textContent);
    item.append(itemContent);
    itemsContainer.append(item);
  }

  container.append(itemsContainer);
  block.innerHTML = "";
  block.append(container);
}
