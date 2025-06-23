/**
 * Decorates the section-header block with semantic structure and classes.
 * @param {Element} block
 */
export default function decorate(block) {
  if (!block || block.children.length < 5) return;

  const [labelDiv, titleDiv, descDiv, ctaTextDiv, ctaLinkDiv] = block.children;
  const label = labelDiv?.querySelector("p");
  const title = titleDiv?.querySelector("p");
  const description = descDiv?.querySelector("p");
  const ctaText = ctaTextDiv?.querySelector("p");
  const ctaLink = ctaLinkDiv?.querySelector("a");

  if (label) label.className = "text-l2 split-text label";
  if (title) title.className = "text-t1 split-text title";
  if (description) description.className = "text-p1 split-text";

  // Replace CTA text with anchor if both exist
  if (ctaText && ctaLink) {
    const anchor = document.createElement("a");
    anchor.className = "cta-link animate-underline split-text";
    anchor.textContent = ctaText.textContent;
    anchor.href = ctaLink.href;
    ctaText.replaceWith(anchor);
    ctaLink.style.display = "none";
  }
}
