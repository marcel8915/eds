// animations.js
// Global animation utilities for all components
// Import GSAP and plugins as needed

/**
 * Initializes GSAP SplitText/ScrollTrigger animations for headings using custom osmo-ease and responsive matchMedia.
 */
export function initTextSplitAnimation() {
  if (
    !window.gsap ||
    !window.ScrollTrigger ||
    !window.SplitText ||
    !window.CustomEase
  )
    return;
  // Register the GSAP plugins
  gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase);

  // Create the custom ease function from the original Pen
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

  // Use ScrollTrigger.matchMedia() to create responsive animations.
  ScrollTrigger.matchMedia({
    "(min-width: 1px)": function () {
      const headings = document.querySelectorAll(".split-text");
      headings.forEach((heading) => {
        // Split the text for the current heading. Because this is inside matchMedia, it will be re-done on resize.
        const split = SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
        });
        // Set the initial hidden state for the lines.
        gsap.set(split.lines, { yPercent: 110 });
        // Create a unique ScrollTrigger for each heading.
        ScrollTrigger.create({
          trigger: heading,
          start: "top 85%",
          onEnter: () => {
            gsap.to(split.lines, {
              yPercent: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "osmo-ease",
            });
          },
          // onLeaveBack: () => {
          //   gsap.to(split.lines, {
          //     yPercent: 110,
          //     duration: 0.8,
          //     stagger: 0.08,
          //     ease: "osmo-ease",
          //   });
          // },
        });
      });
      // Return a cleanup function. GSAP will call this when the media query no longer matches (or before re-running the setup).
      return () => {
        // Revert all SplitText instances to avoid issues.
        const allSplits = SplitText.getAll();
        allSplits.forEach((split) => split.revert());
      };
    },
  });
}

/**
 * Animates children of elements with .animate-stagger class to fade in and up one by one on scroll into view.
 */
export function initStaggerAnimations() {
  console.log("Initializing stagger animations");
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const staggerParents = document.querySelectorAll(".animate-stagger");
  staggerParents.forEach((parent) => {
    const children = Array.from(parent.children);
    console.log(
      "Staggering children for parent:",
      parent,
      "Children:",
      children
    );
    gsap.set(children, { opacity: 0, y: 50 });
    ScrollTrigger.create({
      trigger: parent,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 2,
          ease: "power3.out",
          stagger: 0.3,
        });
      },
    });
  });
}

// Smooth scrolling with Lenis
const lenis = new Lenis({
  autoRaf: true,
});

export function parallaxSection(section) {
  const speed = 0.5; // Parallax speed
  const offsetTop = 0; // px or string, e.g. "100px"
  const zIndex = 1; // z-index value

  console.log("test", section);
  if (section) {
    section.style.zIndex = zIndex;
    section.style.top =
      typeof offsetTop === "number" ? offsetTop + "px" : offsetTop;
    section.style.position = "sticky";
    section.style.height = "100vh";
    console.log(section);

    gsap.registerPlugin(ScrollTrigger);
    gsap.to(section, {
      y: () => window.innerHeight * speed,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}
