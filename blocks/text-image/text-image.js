/**
 * Decorates the text-image block.
 * @param {Element} block
 */
export default function decorate(block) {
  const textCol = document.createElement("div");
  textCol.className = "text-image__text-column";
  const imageCol = document.createElement("div");
  imageCol.className = "text-image__image-column";

  const rows = [...block.children];

  const titleRow = rows.find((row) =>
    row.textContent.trim().toLowerCase().startsWith("title")
  );

  const imageRow = rows.find((row) => row.querySelector("picture"));

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "text-image__content-wrapper";

  rows.forEach((row) => {
    if (row !== titleRow && row !== imageRow) {
      contentWrapper.append(row);
    }
  });

  if (imageRow) {
    imageCol.append(imageRow);
  }

  if (titleRow) {
    const titleEl = document.createElement("h2");
    titleEl.className = "text-image__title";
    titleEl.innerHTML = titleRow.innerHTML.replace(/^title/gi, "").trim();
    textCol.append(titleEl);
  }

  textCol.append(contentWrapper);

  const contentChildren = [...contentWrapper.children];
  const lastDiv = contentChildren[contentChildren.length - 1];

  if (
    lastDiv &&
    lastDiv.children.length === 3 &&
    [...lastDiv.children].every(
      (child) =>
        child.tagName === "DIV" && child.firstElementChild?.tagName === "P"
    )
  ) {
    const contactWrapper = document.createElement("div");
    contactWrapper.className = "contact-detail";

    const contactTypes = ["call", "book-event", "event"];

    [...lastDiv.children].forEach((item, index) => {
      const type = contactTypes[index];
      const value = item.textContent.trim();

      if (value) {
        const contactItem = document.createElement("div");
        contactItem.className = `contact-detail__item`;

        const icon = document.createElement("span");
        icon.className = `icon icon-${type}`;

        const text = document.createElement("span");
        text.className = "contact-detail__text";
        text.textContent = value;

        contactItem.append(icon, text);
        contactWrapper.append(contactItem);
      }
    });

    contentWrapper.replaceChild(contactWrapper, lastDiv);
  }

  block.innerHTML = "";
  block.append(imageCol, textCol);
}
