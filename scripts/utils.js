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
 * Formats the child elements of a given DOM element by wrapping them in a new div with a specified class name,
 * and adds additional class names to each child based on its tag name and an optional text class name.
 * Only element children with non-empty text content are processed.
 *
 * @param {HTMLElement} element - The DOM element whose children will be formatted.
 * @param {string} wrapperClassName - The class name to assign to the wrapper div.
 * @param {string} [textClassName] - An optional class name to add to each child element.
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
