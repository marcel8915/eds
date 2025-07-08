// import { moveInstrumentation } from '../../scripts/scripts.js'; 

export default function decorate(block) {
  // Add container class to the block itself
  block.classList.add('column-tile-container-col');
  
  // Process each row (card)
  Array.from(block.children).forEach((row, index) => {
    const hasContent = row.textContent.trim() !== "" || row.querySelector("picture");
    if (!hasContent) return;
    
    // Add card class to the original row
    row.classList.add('column-tile-card');
    row.dataset.value = `card-${index + 1}`;
    
    // Get all sections of the card
    const cardSections = Array.from(row.children);
    
    // Process each section and add appropriate classes
    cardSections.forEach((section, sectionIndex) => {
      switch(sectionIndex) {
        case 0: // Image section
          if (section.querySelector('picture')) {
            section.classList.add('column-tile-images');
          }
          break;
        // Wrap sections 1-6 in a .column-tile-left div
        case 1: {
          let leftContainer = row.querySelector('.column-tile-left');
          if (!leftContainer) {
            leftContainer = document.createElement('div');
            leftContainer.className = 'column-tile-left';
            // Insert after the image section (section 0)
            if (cardSections[0].nextSibling) {
              row.insertBefore(leftContainer, cardSections[0].nextSibling);
            } else {
              row.appendChild(leftContainer);
            }
          }
          // Move section 1 into leftContainer
          leftContainer.appendChild(section);
          if (section.textContent.trim()) {
            section.classList.add('column-tile-label');
          }
          break;
        }
        case 2: {
          const leftContainer = row.querySelector('.column-tile-left');
          if (leftContainer) leftContainer.appendChild(section);
          if (section.querySelector('a')) {
            section.classList.add('column-tile-sub-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-sub-link');
            }
          }
          break;
        }
        case 3: {
          const leftContainer = row.querySelector('.column-tile-left');
          if (leftContainer) leftContainer.appendChild(section);
          if (section.textContent.trim()) {
            section.classList.add('column-tile-sub-description');
          }
          break;
        }
        case 4: {
          const leftContainer = row.querySelector('.column-tile-left');
          if (leftContainer) leftContainer.appendChild(section);
          if (section.querySelector('a')) {
            section.classList.add('column-tile-content-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-link');
            }
          }
          break;
        }
        case 5: {
          const leftContainer = row.querySelector('.column-tile-left');
          if (leftContainer) leftContainer.appendChild(section);
          if (section.textContent.trim()) {
            section.classList.add('column-tile-description');
            // Add arrow icon if this section has content
            const existingIcon = section.querySelector('.column-tile-description-icon');
            if (!existingIcon) {
              const svg = document.createElement('img');
              svg.src = '/icons/chevron_forward.svg';
              svg.alt = 'Arrow';
              svg.className = 'column-tile-description-icon';
              section.appendChild(svg);
            }
          }
          break;
        }
        case 6: {
          const leftContainer = row.querySelector('.column-tile-left');
          if (leftContainer) leftContainer.appendChild(section);
          if (section.textContent.trim()) {
            section.classList.add('column-tile-supporting-text');
          }
          break;
        }
        default: // Feature sections (7+)
            // Group feature sections (7+) into a .column-tile-features container
            if (sectionIndex === 7) {
            // Create the features container if it doesn't exist
            let featuresContainer = row.querySelector('.column-tile-features');
            if (!featuresContainer) {
              featuresContainer = document.createElement('div');
              featuresContainer.className = 'column-tile-features';
              row.appendChild(featuresContainer);
            }
            // Move all feature sections (7+) into the features container
            for (let i = 7; i < cardSections.length; i += 2) {
              const iconSection = cardSections[i];
              const textSection = cardSections[i + 1];
              if (iconSection || textSection) {
              const featureDiv = document.createElement('div');
              featureDiv.className = 'column-tile-feature';
              if (iconSection) {
                iconSection.classList.add('column-tile-feature-icon');
                featureDiv.appendChild(iconSection);
              }
              if (textSection) {
                textSection.classList.add('column-tile-feature-text');
                featureDiv.appendChild(textSection);
              }
              featuresContainer.appendChild(featureDiv);
              }
            }
            }
            // Prevent further processing for feature sections
            if (sectionIndex >= 7) return;
          break;
      }
    });
  });
}