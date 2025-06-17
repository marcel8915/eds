export default function decorate(block) {
  const parallaxSections = block.querySelectorAll(".parallax-section");

  parallaxSections.forEach((section) => {
    const sections = section.querySelectorAll(".scroll-section");
    const backgrounds = section.querySelectorAll(".sticky > .absolute");
    let activeIndex = 0;

    const handleScroll = () => {
      let currentIndex = 0;

      sections.forEach((scrollSection, index) => {
        const rect = scrollSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5) {
          currentIndex = index;
        }
      });

      if (currentIndex !== activeIndex) {
        activeIndex = currentIndex;
        updateBackgrounds();
      }
    };

    const updateBackgrounds = () => {
      backgrounds.forEach((background, index) => {
        if (
          index === activeIndex ||
          (activeIndex >= sections.length - 1 && index === sections.length - 1)
        ) {
          background.style.opacity = "1";
          background.style.zIndex = "1";
        } else {
          background.style.opacity = "0";
          background.style.zIndex = "-1";
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initialize the backgrounds
    updateBackgrounds();
  });
}
