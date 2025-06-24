export default function decorate(block) {
  const textCol = document.createElement("div");
  textCol.className = "text-image__text-column";

  const imageCol = document.createElement("div");
  imageCol.className = "text-image__image-column";

  // Find all rows
  const rows = [...block.children];
  const titleRow = rows.find(
    (row) => row.children[0]?.textContent.trim().toLowerCase() === "title"
  );
  const imageRow = rows.find((row) => row.querySelector("picture"));

  // Process image
  if (imageRow) {
    imageCol.append(imageRow);
  }

  // Process title
  if (titleRow) {
    const titleValue = titleRow.children[1];
    if (titleValue) {
      const titleEl = document.createElement("h2");
      titleEl.className = "text-image__title";
      titleEl.innerHTML = titleValue.innerHTML;
      textCol.append(titleEl);
    }
  }

  // Process content rows (including icons)
  const contentRows = rows.filter(
    (row) => row !== titleRow && row !== imageRow
  );
  if (contentRows.length > 0) {
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "text-image__content-wrapper";

    // Create details container for icon+text pairs
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "text-image__details-container";

    contentRows.forEach((row) => {
      // Check if row contains an SVG icon
      const svgIcon = row.querySelector('img[src*=".svg"]');

      if (svgIcon) {
        // This is an icon row - create detail element
        const detail = document.createElement("div");
        detail.className = "text-image__detail";

        // Create icon wrapper
        const iconWrapper = document.createElement("div");
        iconWrapper.className = "text-image__detail-icon";
        iconWrapper.innerHTML = svgIcon.outerHTML;

        // Get the text from next row
        const textRow = rows[rows.indexOf(row) + 1];
        if (textRow) {
          const text = document.createElement("div");
          text.className = "text-image__detail-text";
          text.innerHTML = textRow.innerHTML;

          detail.append(iconWrapper, text);
          detailsContainer.append(detail);
        }
      } else if (
        !row.querySelector('img[src*=".svg"]') &&
        row.textContent.trim() !== "" &&
        !rows[rows.indexOf(row) - 1]?.querySelector('img[src*=".svg"]')
      ) {
        // Regular content (not preceded by an SVG)
        const content = document.createElement("div");
        content.className = "text-image__content-block";
        content.innerHTML = row.innerHTML;
        contentWrapper.append(content);
      }
    });

    // Add details container if it has content
    if (detailsContainer.children.length > 0) {
      contentWrapper.append(detailsContainer);
    }

    textCol.append(contentWrapper);
  }

  // Clear and rebuild block
  block.innerHTML = "";
  block.append(imageCol, textCol);
}
