const sliderTeaserSection = document.querySelectorAll(
  ".slider-teaser-content-container"
);

/* ---------------------------------- Handle Content --------------------------------- */

// Createa slider teaser media wrapper and block
sliderTeaserSection.forEach((section) => {
  const getElements = (selectors) =>
    Object.fromEntries(
      selectors.map(({ key, sel }) => [key, section.querySelectorAll(sel)])
    );

  const selectors = [
    { key: "sliderTeaserContent", sel: ".slider-teaser-content" },
    {
      key: "overlay",
      sel: ".slider-teaser-content > div:nth-child(1) > div > p",
    },
    {
      key: "overlayText",
      sel: ".slider-teaser-content > div:nth-child(2) > div > p",
    },
    {
      key: "overlayButtonText",
      sel: ".slider-teaser-content > div:nth-child(3) > div > p",
    },
    {
      key: "overlayButtonUrl",
      sel: ".slider-teaser-content > div:nth-child(4) > div > p",
    },
    {
      key: "labelText",
      sel: ".slider-teaser-content > div:nth-child(5) > div > p",
    },
    {
      key: "titleText",
      sel: ".slider-teaser-content > div:nth-child(6) > div > p",
    },
    {
      key: "ctaText",
      sel: ".slider-teaser-content > div:nth-child(7) > div > p",
    },
    {
      key: "ctaUrl",
      sel: ".slider-teaser-content > div:nth-child(8) > div > p",
    },
    {
      key: "isExternalLink",
      sel: ".slider-teaser-content > div:nth-child(9) > div > p",
    },
    { key: "media", sel: ".slider-teaser-content > div:nth-child(10) > div" },
    {
      key: "imgAltText",
      sel: ".slider-teaser-content > div:nth-child(11) > div > p",
    },
    {
      key: "logo",
      sel: ".slider-teaser-content > div:nth-child(12) > div",
    },
  ];

  const elements = getElements(selectors);
  const {
    sliderTeaserContent,
    overlay,
    overlayText,
    overlayButtonText,
    overlayButtonUrl,
    labelText,
    titleText,
    ctaText,
    ctaUrl,
    isExternalLink,
    media,
    imgAltText,
    logo,
  } = elements;

  // Create media wrapper and block
  const sliderTeaserMediaWrapper = document.createElement("div");
  sliderTeaserMediaWrapper.className = "slider-teaser-media-wrapper";
  const mediaBlock = document.createElement("div");
  mediaBlock.className = "slider-teaser-media block";
  mediaBlock.dataset.blockName = "slider-teaser-media";
  mediaBlock.dataset.blockStatus = "loaded";
  sliderTeaserMediaWrapper.appendChild(mediaBlock);
  section.appendChild(sliderTeaserMediaWrapper);

  // Overlay handling
  sliderTeaserContent.forEach((child, idx) => {
    if (overlay[idx]?.textContent.trim() === "true") {
      const wrapper = document.createElement("div");
      wrapper.className = "overlay-container";
      while (child.firstChild) wrapper.appendChild(child.firstChild);
      child.appendChild(wrapper);
    }
  });

  // Hide overlay and related fields if not overlay
  [overlay, overlayButtonUrl, ctaUrl, isExternalLink, imgAltText].forEach(
    (list) => list.forEach((el) => (el.style.display = "none"))
  );

  logo.forEach((el, idx) => {
    if (overlay[idx]?.textContent.trim() !== "true") el.style.display = "none";

    // Move logo's parent div to the top of its siblings
    const parentDiv = el.parentElement;
    if (parentDiv && parentDiv.parentElement) {
      parentDiv.parentElement.insertBefore(
        parentDiv,
        parentDiv.parentElement.firstChild
      );
    }
  });
  overlayText.forEach((el, idx) => {
    if (overlay[idx]?.textContent.trim() !== "true") el.style.display = "none";

    el.classList.add("text-h4");
  });

  overlayButtonText.forEach((el, idx) => {
    if (overlay[idx]?.textContent.trim() !== "true") {
      el.style.display = "none";
      return;
    }
    const anchor = document.createElement("a");
    anchor.className = "cta-button";
    anchor.textContent = el.textContent;
    const link = overlayButtonUrl[idx];
    if (link) anchor.href = link.textContent.trim();
    el.replaceWith(anchor);
  });

  // Label and title styling
  labelText.forEach((el) => {
    el.classList.add("text-l2");
    el.style.color = "white";
  });
  titleText.forEach((el) => {
    el.classList.add("text-t1");
    el.style.color = "white";
  });

  // CTA links
  ctaText.forEach((el, idx) => {
    const anchor = document.createElement("a");
    anchor.className = "cta-link animate-underline";
    anchor.textContent = el.textContent;
    anchor.style.color = "white";
    const link = ctaUrl[idx];
    if (link) anchor.href = link.textContent.trim();
    const isExternal = isExternalLink[idx];
    if (isExternal?.textContent.trim() === "true") {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.classList.add("arrowRight");
    }
    el.replaceWith(anchor);
  });

  // Media handling
  media.forEach((child, idx) => {
    const isVideo = !child.querySelector("picture");
    const sliderTeaserMedia = section.querySelector(
      ".slider-teaser-media-wrapper .slider-teaser-media"
    );

    if (isVideo) {
      const anchor = child.querySelector("a");
      if (anchor) {
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        video.preload = "none";
        video.setAttribute("aria-label", "Video player");
        video.className = "video-player";
        video.controls = false;
        const source = document.createElement("source");
        source.src =
          "https://publish-p152536-e1620746.adobeaemcloud.com" +
          anchor.innerText.trim();
        source.type = "video/webm";
        video.appendChild(source);
        anchor.parentElement.remove();
        child.appendChild(video);
      }
    } else {
      const picture = child.querySelector("picture");
      const img = picture?.querySelector("img");
      if (img && imgAltText[idx]) {
        img.alt = imgAltText[idx].textContent.trim();
      }
    }

    if (sliderTeaserMedia) {
      const childDiv = document.createElement("div");
      childDiv.appendChild(child);
      sliderTeaserMedia.appendChild(childDiv);
    }
  });
});

/* ---------------------------------- Parallax Effect --------------------------------- */

// Slider Teaser Media: Scroll-synced media/content slider
// Author: Refactored for clarity and maintainability

/**
 * Utility: Clamp a number between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Set the height of the container based on the number of sections
 * @param {HTMLElement} container
 * @param {number} numSections
 */
function setContainerHeight(container, numSections) {
  if (container) {
    container.style.height = `${numSections * 100}vh`;
  }
}

/**
 * Position and center each content wrapper absolutely
 * @param {HTMLElement[]} wrappers
 */
function positionContentWrappers(wrappers) {
  wrappers.forEach((wrapper, idx) => {
    Object.assign(wrapper.style, {
      position: "absolute",
      top: `${idx * 100}vh`,
      left: "0",
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });
  });
}

/**
 * Main initialization
 */
(function initSliderTeaserMedia() {
  // For each slider-teaser-content-container, set up its own independent slider logic
  const allSections = Array.from(
    document.querySelectorAll(".slider-teaser-content-container")
  );
  allSections.forEach((section) => {
    const contentWrappers = Array.from(
      section.querySelectorAll(".slider-teaser-content-wrapper")
    );
    const mediaWrapper = section.querySelector(".slider-teaser-media.block");
    if (!mediaWrapper) return;
    const mediaSlides = Array.from(mediaWrapper.children);

    setContainerHeight(section, contentWrappers.length);
    positionContentWrappers(contentWrappers);

    let activeIndex = 0;
    function updateSlides(activeIdx) {
      contentWrappers.forEach((wrapper, idx) => {
        const isActive = idx === activeIdx;
        wrapper.style.opacity = "1";
        wrapper.style.zIndex = "1";
        wrapper.style.pointerEvents = isActive ? "auto" : "none";
      });
      mediaSlides.forEach((slide, idx) => {
        slide.style.opacity = idx === activeIndex ? "1" : "0";
        slide.style.zIndex = idx === activeIndex ? "1" : "0";
        slide.style.transition = "opacity 0.5s";
        slide.style.pointerEvents = idx === activeIndex ? "auto" : "none";
      });
    }

    function handleScroll() {
      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const containerTop = rect.top + scrollY;
      const vh = window.innerHeight;
      let currentIndex = Math.floor((scrollY - containerTop + vh / 2) / vh);
      currentIndex = clamp(currentIndex, 0, contentWrappers.length - 1);
      if (currentIndex !== activeIndex) {
        activeIndex = currentIndex;
        updateSlides(activeIndex);
      }
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    // Initialize
    updateSlides(activeIndex);
  });
})();
