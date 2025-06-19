const sliderTeaserSection = document.querySelectorAll(
  ".slider-teaser-content-container"
);

/* ---------------------------------- Handle Content --------------------------------- */

// Createa slider teaser media wrapper and block
sliderTeaserSection.forEach((section) => {
  const labelText = section.querySelectorAll(
    ".slider-teaser-content > div:first-child > div > p"
  );
  const titleText = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(2) > div > p"
  );
  const ctaText = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(3) > div > p"
  );
  const ctaLinks = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(4) > div > p"
  );
  const isExternalLink = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(5) > div > p"
  );
  const media = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(6) > div"
  );
  const isVideo = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(7) > div > p"
  );
  const imgAltText = section.querySelectorAll(
    ".slider-teaser-content > div:nth-child(8) > div > p"
  );

  const sliderTeaserMedia = document.createElement("div");
  sliderTeaserMedia.className = "slider-teaser-media-wrapper";
  const mediaBlock = document.createElement("div");
  mediaBlock.className = "slider-teaser-media block";
  mediaBlock.setAttribute("data-block-name", "slider-teaser-media");
  mediaBlock.setAttribute("data-block-status", "loaded");
  sliderTeaserMedia.appendChild(mediaBlock);
  section.appendChild(sliderTeaserMedia);

  labelText.forEach((child) => {
    child.classList.add("text-l2");
    child.style.color = "white";
  });

  titleText.forEach((child) => {
    child.classList.add("text-t1");
    child.style.color = "white";
  });
  ctaText.forEach((child, idx) => {
    const anchor = document.createElement("a");
    anchor.className = "cta-link animate-underline";
    anchor.textContent = child.textContent;
    child.replaceWith(anchor);
    child.style.color = "white";
    const link = ctaLinks[idx];
    if (link) {
      anchor.href = link.textContent.trim();
    }
    const isExternal = isExternalLink[idx];
    if (isExternal && isExternal.textContent.trim() === "true") {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
  });
  ctaLinks.forEach((child) => {
    child.style.display = "none";
  });
  media.forEach((child, idx) => {
    const video = !child.querySelector("picture");

    const sliderTeaserMedia = section.querySelector(
      ".slider-teaser-media-wrapper .slider-teaser-media"
    );

    // If Video, create a video element
    if (video) {
      const anchor = child.querySelector("a");
      if (anchor) {
        const videoElement = document.createElement("video");
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.preload = "none";
        videoElement.setAttribute("aria-label", "Video player");
        videoElement.className = "video-player";
        videoElement.controls = false; // Show controls for debugging

        const source = document.createElement("source");
        source.src =
          // "https://author-p152536-e1620746.adobeaemcloud.com/content/dam/patina/osaka/assets/L2_Banner-Rooms-Suites.webm";
          "https://patinahotels.com/osaka/videos/parallax/L1_Banner-Rooms&Suites.webm";
        source.type = "video/webm";
        videoElement.appendChild(source);

        anchor.parentElement.remove();
        child.appendChild(videoElement);
      }
    }
    // Add Alt Text to images
    if (!video) {
      const picture = child.querySelector("picture");
      if (picture) {
        const img = picture.querySelector("img");
        if (img && imgAltText[idx]) {
          img.alt = imgAltText[idx].textContent.trim();
        }
      }
    }

    // Append media to the slider teaser media block
    if (sliderTeaserMedia) {
      const childDiv = document.createElement("div");
      childDiv.appendChild(child);
      sliderTeaserMedia.appendChild(childDiv);
    }
  });
  isVideo.forEach((child) => {
    child.style.display = "none";
  });
  imgAltText.forEach((child) => {
    child.style.display = "none";
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
        wrapper.style.opacity = isActive ? "1" : "0";
        wrapper.style.zIndex = isActive ? "1" : "0";
        wrapper.style.transition = "opacity 0.5s";
        wrapper.style.pointerEvents = isActive ? "auto" : "none";
      });
      mediaSlides.forEach((slide, idx) => {
        slide.style.opacity = idx === activeIdx ? "1" : "0";
        slide.style.zIndex = idx === activeIdx ? "1" : "0";
        slide.style.transition = "opacity 0.5s";
        slide.style.pointerEvents = idx === activeIdx ? "auto" : "none";
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
