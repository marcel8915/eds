/**
 * Decorates the text-image block.
 * @param {Element} block The text-image block element.
 */
export default function decorate(block) {
  const textCol = document.createElement("div");
  textCol.className = "text-image__text-column";

  const imageCol = document.createElement("div");
  imageCol.className = "text-image__image-column";

  const titleRow = [...block.children].find(
    (row) => row.children[0]?.textContent.trim().toLowerCase() === "title"
  );

  const imageRow = [...block.children].find((row) =>
    row.querySelector("picture")
  );

  const contentRows = [...block.children].filter(
    (row) => row !== titleRow && row !== imageRow
  );

  if (imageRow) {
    imageCol.append(imageRow);
  }

  if (titleRow) {
    const titleValue = titleRow.children[1];
    if (titleValue) {
      const titleEl = document.createElement("h2");
      titleEl.className = "text-image__title";
      titleEl.innerHTML = titleValue.innerHTML;
      textCol.append(titleEl);
    }
  }

  if (contentRows.length > 0) {
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "text-image__content-wrapper";

    const nonEmptyContent = contentRows.filter(
      (row) => row.textContent.trim() !== ""
    );
    if (nonEmptyContent.length > 0) {
      contentWrapper.append(...nonEmptyContent);
      textCol.append(contentWrapper);
    }
  }

  block.innerHTML = "";
  block.append(imageCol, textCol);
}
