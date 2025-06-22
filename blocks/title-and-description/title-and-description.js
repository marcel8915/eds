/**
 *  title-and-description block.
 * @param {Element} block
 */
export default function decorate(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "title-and-description__wrapper";

  const title = block.children[0];
  if (title) {
    title.classList.add("title-and-description__title");
    wrapper.append(title);
  }

  const description = block.children[0];
  if (description) {
    description.classList.add("title-and-description__description");
    wrapper.append(description);
  }

  const miniText = block.children[0];
  if (miniText) {
    miniText.classList.add("title-and-description__mini-text");
    wrapper.append(miniText);
  }

  block.innerHTML = "";
  block.append(wrapper);
}
