export default function decorate(block) {
  const textCol = document.createElement("div");
  textCol.className = "text-image__text-column";

  const imageCol = document.createElement("div");
  imageCol.className = "text-image__image-column";

  const rows = [...block.children];

  const titleRow = rows[0];
  let title = "";
  if (titleRow) {
    title = titleRow.textContent.trim();
    title = title.replace(/&amp;nbsp;/g, " ").replace(/&lt;\/?p&gt;/g, "");
  }

  const descRow = rows[1];
  let description = "";
  if (descRow) {
    description = descRow.textContent.trim();
    description = description
      .replace(/&amp;nbsp;/g, "")
      .replace(/^&lt;p&gt;/, "")
      .replace(/&lt;\/p&gt;$/, "");
  }

  const imageRow = rows[2];

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "text-image__content-wrapper";

  if (title) {
    const titleEl = document.createElement("h2");
    titleEl.className = "text-image__title";
    titleEl.textContent = title;
    textCol.append(titleEl);
  }

  if (description) {
    const descEl = document.createElement("div");
    descEl.className = "text-image__description";
    descEl.innerHTML = description;
    contentWrapper.append(descEl);
  }

  if (imageRow && imageRow.querySelector("picture")) {
    imageCol.append(imageRow.querySelector("picture").cloneNode(true));
  }

  const buttonRow = rows[3];
  if (buttonRow && buttonRow.querySelector("a.button")) {
    const button = buttonRow.querySelector("a.button").cloneNode(true);
    contentWrapper.append(button);
  }

  textCol.append(contentWrapper);
  block.innerHTML = "";

  // 👇 Changed to image on LEFT by default
  block.append(imageCol, textCol); // ← Now image comes first
}
