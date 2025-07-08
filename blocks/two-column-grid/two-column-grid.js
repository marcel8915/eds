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
        case 1: // Label section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-label');
          }
          break;
        case 2: // Secondary link section
          if (section.querySelector('a')) {
            section.classList.add('column-tile-sub-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-sub-link');
            }
          }
          // Check if the next section is the sub-description and wrap it
          const nextSection = cardSections[sectionIndex + 1];
          if (
            nextSection &&
            nextSection.textContent.trim() &&
            !nextSection.classList.contains('column-tile-sub-description')
          ) {
            nextSection.classList.add('column-tile-sub-description');
            section.appendChild(nextSection);
          }
          break;
        // No need for case 3 anymore, handled above
          break;
        case 4: // Main link section
          if (section.querySelector('a')) {
            section.classList.add('column-tile-content-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-link');
            }
          }
          // Check if the next section is the main description and wrap it
          const descSection = cardSections[sectionIndex + 1];
          if (
            descSection &&
            descSection.textContent.trim() &&
            !descSection.classList.contains('column-tile-description')
          ) {
            descSection.classList.add('column-tile-description');
            section.appendChild(descSection);
          }
          break;
        case 5: // Main description section (already handled above)
          // Do nothing here, as it's now wrapped by the link section
          break;
        case 6: // Supporting text section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-supporting-text');
          }
          break;
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