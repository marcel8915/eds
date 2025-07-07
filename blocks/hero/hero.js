import { parallaxSection } from "../../scripts/animations.js";
import {
  handleMediaBlocks,
  formatRichText,
  getElements,
} from "../../scripts/utils.js";

const BLOCK_CLASS_NAME = "hero";

/**
 * Decorates the hero block.
 * @param {HTMLElement} block The hero block element.
 */
export default function decorate(block) {
  const selectors = [
    {
      key: "label",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(1) > div > p`,
    },
    {
      key: "mainHeroText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(2) > div`,
    },
    {
      key: "isSlideInText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(3) > div > p`,
    },
    {
      key: "media",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(4) > div`,
    },
    {
      key: "ctaText",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(5) > div > p`,
    },
    {
      key: "isVideoCta",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(6) > div > p`,
    },
    {
      key: "video",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(7) > div`,
    },
    {
      key: "ctaUrl",
      sel: `.${BLOCK_CLASS_NAME} > div:nth-child(8) > div > p`,
    },
  ];

  const elements = getElements(block, selectors);

  const {
    label,
    mainHeroText,
    isSlideInText,
    media,
    ctaText,
    isVideoCta,
    video,
    ctaUrl,
  } = elements;

  // Extract data first
  const labelText = label[0]?.textContent.trim();
  const mainHeroTextContent = mainHeroText[0];
  const isSlideInTextValue = isSlideInText[0]?.textContent.trim() === "true";
  const ctaButtonText = ctaText[0]?.textContent.trim();
  const isVideoCtaValue = isVideoCta[0]?.textContent.trim() === "true";
  const ctaLinkUrl = ctaUrl[0]?.textContent.trim();

  // Process text content and prepare for insertion
  let processedTextContent = "";
  if (mainHeroTextContent) {
    if (!isSlideInTextValue) {
      formatRichText(mainHeroTextContent, "hero-text-container", "text-t1");
      processedTextContent = mainHeroTextContent.innerHTML;
    } else {
      // Add classes to existing elements but don't animate yet
      Array.from(mainHeroTextContent.children).forEach((el) => {
        if (el.tagName === "H2") {
          el.classList.add("text-t1", "hero-slide-text");
        }
      });
      processedTextContent = mainHeroTextContent.innerHTML;
    }
  }

  // Clear and create new structure
  block.textContent = "";
  const parallaxWrapper = document.createElement("section");
  block.append(parallaxWrapper);

  parallaxWrapper.innerHTML = `
    <section class="hero-wrapper">
      <section class="hero-container">
        <div class="hero-media-container">
          <!-- Video will be inserted here by handleMediaBlocks -->
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content  text-text-white">
            ${
              labelText
                ? `<div>
                  <p class="text-l1 label-text">${labelText}</p>
                </div>`
                : ""
            }
            <div class="hero-text-container">
              ${processedTextContent}
            </div>
            <div class="hero-cta-wrapper">
                ${
                  isVideoCtaValue
                    ? `
                  <p class="play-icon"><span class="cta-link animate-underline">${ctaButtonText}</span></p>
                  `
                    : `
                  <a href="${ctaLinkUrl}" class="cta-link animate-underline arrow-right text-text-white">${ctaButtonText}</a>
                  `
                }
            </div>
        </div>
      </section>
      ${
        isVideoCtaValue
          ? `
      <dialog class="video-modal">
        <div class="video-container-wrapper">
            <!-- Video will be inserted here by handleMediaBlocks -->
            <button class="modal-close-btn text-b" aria-label="Close video modal">
              <span class="close-icon"></span><span class="animate-underline">CLOSE</span>
            </button>
        </div>
      </dialog>`
          : ""
      }
    </section>
  `;

  // Handle media blocks and append to hero media container
  const heroMediaContainer = parallaxWrapper.querySelector(
    ".hero-media-container"
  );
  handleMediaBlocks(media, [], heroMediaContainer);

  // Handle modal video if it exists
  if (isVideoCtaValue && video) {
    const modalVideoPadding = parallaxWrapper.querySelector(
      ".video-container-wrapper"
    );
    // Create video element for modal with controls
    handleMediaBlocks(video, [], modalVideoPadding);
    // Update the modal video to have controls
    const modalVideo = modalVideoPadding.querySelector("video");
    if (modalVideo) {
      modalVideo.controls = true; // Enable controls in modal
      modalVideo.autoplay = false; // Disable autoplay - will be controlled manually
      modalVideo.className = "modal-video";
      modalVideo.muted = false; // Allow sound in modal
      modalVideo.preload = "metadata"; // Only load metadata, not the full video
    }
  }

  // Setup video modal functionality if needed
  if (isVideoCtaValue) {
    setupVideoModal(parallaxWrapper);
  }

  // Now animate the elements that are actually in the DOM
  if (isSlideInTextValue) {
    requestAnimationFrame(() => {
      animateHeroText(parallaxWrapper);
    });
  }

  // Animate CTA and label elements
  requestAnimationFrame(() => {
    animateHeroElements(parallaxWrapper);
  });

  // Setup parallax after everything is ready
  setTimeout(() => parallaxSection(parallaxWrapper), 100);
}

/**
 * Animates hero text elements with GSAP
 * @param {HTMLElement} container - The container element
 */
function animateHeroText(container) {
  const textElements = container.querySelectorAll(".hero-slide-text");

  if (window.gsap && textElements.length >= 2) {
    const [firstChild, secondChild] = textElements;

    // Set initial state
    window.gsap.set([firstChild, secondChild], { opacity: 0 });

    // Check if splash screen exists and delay animation if it does
    const splashScreen = document.querySelector(
      ".flower-splash-screen-container"
    );
    const animationDelay = splashScreen ? 3.5 : 0;

    if (firstChild) {
      window.gsap.fromTo(
        firstChild,
        { x: "-5%", opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          delay: animationDelay,
        }
      );
    }
    if (secondChild) {
      window.gsap.fromTo(
        secondChild,
        { x: "5%", opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          delay: animationDelay + 0.2,
        }
      );
    }
  }
}

/**
 * Animates hero CTA and label elements with GSAP
 * @param {HTMLElement} container - The container element
 */
function animateHeroElements(container) {
  const ctaElement = container.querySelector(".hero-cta-wrapper");
  const labelElement = container.querySelector(".label-text");

  if (window.gsap) {
    // Check if splash screen exists and delay animation if it does
    const splashScreen = document.querySelector(
      ".flower-splash-screen-container"
    );
    const animationDelay = splashScreen ? 4.5 : 0;

    // Set initial state for elements that exist
    const elementsToAnimate = [ctaElement, labelElement].filter(Boolean);
    if (elementsToAnimate.length > 0) {
      window.gsap.set(elementsToAnimate, { opacity: 0 });
    }

    // Animate CTA wrapper
    if (ctaElement) {
      window.gsap.fromTo(
        ctaElement,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: animationDelay,
        }
      );
    }

    // Animate label text
    if (labelElement) {
      window.gsap.fromTo(
        labelElement,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: animationDelay,
        }
      );
    }
  }
}

/**
 * Sets up video modal functionality
 * @param {HTMLElement} container - The container element
 */
function setupVideoModal(container) {
  const modal = container.querySelector(".video-modal");
  const openButton = container.querySelector(".hero-cta-wrapper");
  const closeButtons = container.querySelectorAll(".modal-close-btn");

  if (modal && openButton) {
    openButton.addEventListener("click", (e) => {
      e.preventDefault();
      modal.showModal();

      // Disable scrolling with multiple approaches for reliability
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // Trigger fade in animation
      modal.classList.remove("fade-out");
      modal.classList.add("fade-in");

      // Start playing video when modal opens
      const video = modal.querySelector("video");
      if (video) {
        video.currentTime = 0; // Reset to beginning
        video.play().catch(console.error); // Play video (handle potential autoplay restrictions)
      }
    });

    // Function to handle modal closing with fade out
    const closeModal = () => {
      // Start fade out animation
      modal.classList.remove("fade-in");
      modal.classList.add("fade-out");

      // Wait for animation to complete before actually closing
      setTimeout(() => {
        modal.close();

        // Re-enable scrolling
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";

        // Pause and reset video when closing
        const video = modal.querySelector("video");
        if (video) {
          video.pause();
          video.currentTime = 0; // Reset to beginning for next time
        }
      }, 300); // Match the CSS transition duration
    };

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Handle ESC key to close modal - prevent default dialog behavior
    const handleEscKey = (e) => {
      if (e.key === "Escape" && modal.open) {
        e.preventDefault(); // Prevent default dialog close behavior
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    // Also listen for the dialog's cancel event (triggered by ESC)
    modal.addEventListener("cancel", (e) => {
      e.preventDefault(); // Prevent default immediate close
      closeModal();
    });
  }
}
