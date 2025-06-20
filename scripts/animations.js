// animations.js
// Global animation utilities for all components
// Import GSAP and plugins as needed

/**
 * Initializes GSAP SplitText/ScrollTrigger animations for headings.
 * @param {Element|Document} root - The root element to scope the animation (default: document)
 * @param {string} selector - The selector for headings to animate (default: '.split-heading')
 */
export function initTextSplitAnimation(
  root = document,
  selector = ".split-text"
) {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  const headings = (root || document).querySelectorAll(selector);
  headings.forEach((heading) => {
    // Clean up previous splits if any
    if (heading._splitText) {
      heading._splitText.revert();
    }
    const split = new window.SplitText(heading, { type: "lines,words" });
    heading._splitText = split;
    window.gsap.set(split.words, { opacity: 0, y: 40 });
    window.gsap.to(split.words, {
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
        once: true,
      },
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.04,
    });
  });
}

// Smooth scrolling with Lenis
const lenis = new Lenis({
  autoRaf: true,
});
