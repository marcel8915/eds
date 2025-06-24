import { readBlockConfig } from "../../scripts/aem.js";
import { parallaxSection } from "../../scripts/animations.js";

/**
 * Creates and appends a video player.
 * @param {HTMLElement} container - The container to append the video to.
 * @param {string} src - The video source URL.
 * @param {object} attributes - Additional attributes for the video element.
 */
function createVideo(container, src, attributes = {}) {
  const video = document.createElement("video");
  const source = document.createElement("source");
  source.setAttribute("src", src);
  source.setAttribute("type", `video/${src.split(".").pop()}`);
  video.append(source);

  Object.entries(attributes).forEach(([key, value]) =>
    video.setAttribute(key, value)
  );
  container.append(video);
  return video;
}

/**
 * Decorates the hero block.
 * @param {HTMLElement} block The hero block element.
 */
export default function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = ""; // Clear the authored content

  // --- 1. Build Hero Structure ---
  const backgroundVideoSrc =
    "https://publish-p152536-e1620746.adobeaemcloud.com/content/dam/patina/osaka/assets/home-hero-video.mp4";
  const modalVideoSrc = config["modal-video"];
  const headingHtml = "<h1 class='text-h1'>THE RHYTHM<br>OF FREEDOM</h1>";
  const buttonLabel = "ENTER THE RHYTHM";

  const heroWrapper = document.createElement("section");
  heroWrapper.className = "hero-container";

  if (backgroundVideoSrc) {
    const videoContainer = document.createElement("div");
    videoContainer.className = "hero-video-background";
    createVideo(videoContainer, backgroundVideoSrc, {
      autoplay: "",
      playsinline: "",
      muted: "",
      loop: "",
      "aria-label": "Background video",
      class: "hero-video",
    });
    heroWrapper.append(videoContainer);
  }

  heroWrapper.innerHTML += '<div class="hero-overlay"></div>';

  const heroContent = document.createElement("div");
  heroContent.className = "hero-content";

  if (headingHtml) {
    const textWrapper = document.createElement("div");
    textWrapper.className = "hero-text-wrapper";
    textWrapper.innerHTML = headingHtml;
    heroContent.append(textWrapper);
  }

  if (buttonLabel) {
    const button = document.createElement("button");
    button.className = "hero-cta";
    button.innerHTML = `<span>${buttonLabel}</span><div class="hero-cta-icon"></div>`;
    heroContent.append(button);

    // --- 2. Build Modal Structure (if modal video exists) ---
    if (modalVideoSrc) {
      const modal = document.createElement("div");
      modal.className = "hero-video-modal";

      const closeButton = document.createElement("button");
      closeButton.className = "hero-modal-close";
      closeButton.innerHTML = "<span>Close</span>";

      const videoPlayerContainer = document.createElement("div");
      videoPlayerContainer.className = "hero-modal-video-container";

      createVideo(videoPlayerContainer, modalVideoSrc, {
        autoplay: "",
        playsinline: "",
        controls: "",
        "aria-label": "Video player",
      });

      modal.append(closeButton, videoPlayerContainer);
      block.append(modal);

      // --- 3. Add Event Listeners ---
      button.addEventListener("click", () => {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });

      closeButton.addEventListener("click", () => {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
        const modalVideo = modal.querySelector("video");
        if (modalVideo) modalVideo.pause();
      });
    }
  }

  heroWrapper.append(heroContent);
  block.append(heroWrapper);

  parallaxSection(heroWrapper);
}
