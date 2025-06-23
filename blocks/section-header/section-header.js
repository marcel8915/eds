/**
 * Decorates the section-header block with semantic structure and classes.
 * @param {Element} block
 */
export default function decorate(block) {
  if (!block || block.children.length < 5) return;

  const [labelDiv, titleDiv, descDiv, ctaTextDiv, ctaLinkDiv] = block.children;
  const label = labelDiv?.querySelector("p");
  const title = titleDiv;
  const description = descDiv;
  const ctaText = ctaTextDiv?.querySelector("p");
  const ctaLink = ctaLinkDiv?.querySelector("a");

  console.log(title);
  console.log(description);

  if (title) {
    if (title.querySelectorAll("p").length > 1) {
      const ps = Array.from(title.querySelectorAll("p"));
      const paragraph = document.createElement("p");

      ps.forEach((p) => {
        p.className = "text-t1 split-text title";
      });
      title.appendChild(paragraph);
    } else {
      title.className = "text-t1 split-text title";
    }
  }
  if (description) {
    if (description.querySelectorAll("p").length > 1) {
      const ps = Array.from(description.querySelectorAll("p"));
      const paragraph = document.createElement("p");

      ps.forEach((p) => {
        p.className = "text-p1 split-text desc";
      });
      title.appendChild(paragraph);
    } else {
      description.className = "text-p1 split-text desc" ;
    }
  }

  if (label) label.className = "text-l2 split-text label";

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
