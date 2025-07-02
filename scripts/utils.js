/**
 * Retrieves elements from a given block based on an array of selector objects.
 *
 * @param {Element} block - The parent DOM element to search within.
 * @param {Array<{key: string, sel: string}>} selectors - An array of objects, each containing:
 *   - key: The property name for the returned object.
 *   - sel: The CSS selector string to query elements.
 * @returns {Object<string, NodeListOf<Element>>} An object mapping each key to the NodeList of matched elements.
 */

export function getElements(block, selectors) {
  return Object.fromEntries(
    selectors.map(({ key, sel }) => [key, block.querySelectorAll(sel)])
  );
}

/**
 * Formats rich text content within a given element by combining multiple <p> nodes into a single wrapper element,
 * or by applying a class to a single <p> node.
 *
 * @param {Element} element - The DOM element containing the rich text to format.
 * @param {string} className - The CSS class to apply to the formatted wrapper or <p> element.
 * @param {string} [wrapperTag="p"] - The tag name to use for the wrapper element if combining multiple paragraphs.
 */
export function formatRichText(element, wrapperClassName, textClassName) {
  const wrapper = document.createElement("div");
  wrapper.className = wrapperClassName;
  const nodes = Array.from(element.children).filter(
    (child) => child.nodeType === 1 && child.textContent.trim() !== ""
  );
  nodes.forEach((node) => {
    const tag = node.tagName.toLowerCase();
    node.classList.add(`text-${tag}`, "split-text");
    if (textClassName) {
      node.classList.add(textClassName);
    }
    wrapper.appendChild(node);
  });
  element.innerHTML = "";
  element.appendChild(wrapper);
  console.log(wrapper);
}
