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
    
    // Create main content container
    const contentMain = document.createElement('div');
    contentMain.className = 'column-tile-content-main';
    
    // Create left content container
    const contentLeft = document.createElement('div');
    contentLeft.className = 'column-tile-left';
    
    // Process each section and add appropriate classes
    cardSections.forEach((section, sectionIndex) => {
      switch(sectionIndex) {
        case 0: // Image section
          if (section.querySelector('picture')) {
            section.classList.add('column-tile-images');
            row.insertBefore(section, contentMain); 
          }
          break;
        case 1: // Label section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-label');
            contentLeft.appendChild(section);
          }
          break;
        case 2: // Secondary link section
          if (section.querySelector('a')) {
            section.classList.add('column-tile-sub-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-sub-link');
            }
            contentLeft.appendChild(section);
          }
          break;
        case 3: // Secondary description section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-sub-description');
            contentLeft.appendChild(section);
          }
          break;
        case 4: // Main link section
          if (section.querySelector('a')) {
            section.classList.add('column-tile-content-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-link');
            }
            contentLeft.appendChild(section);
          }
          break;
        case 5: // Main description section
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
            contentMain.appendChild(contentLeft);
            contentMain.appendChild(section);
          }
          break;
        case 6: // Supporting text section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-supporting-text');
            contentMain.appendChild(section);
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
              
              // Add contentMain first, then features container
              if (contentMain.hasChildNodes()) {
                row.appendChild(contentMain);
              }
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
    
    // If we didn't add contentLeft during case 5 (no description), add it now
    if (!contentMain.contains(contentLeft) && contentLeft.hasChildNodes()) {
      contentMain.insertBefore(contentLeft, contentMain.firstChild);
    }
    
    // If we have content in main but haven't added it yet, add it now
    if (contentMain.hasChildNodes() && !row.contains(contentMain)) {
      row.appendChild(contentMain);
    }
  });
}