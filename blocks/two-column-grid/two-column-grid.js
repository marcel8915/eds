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
          break;
        case 3: // Secondary description section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-sub-description');
          }
          break;
        case 4: // Main link section
          if (section.querySelector('a')) {
            section.classList.add('column-tile-content-link');
            const link = section.querySelector('a');
            if (link) {
              link.classList.add('column-tile-link');
            }
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
          }
          break;
        case 6: // Supporting text section
          if (section.textContent.trim()) {
            section.classList.add('column-tile-supporting-text');
          }
          break;
        default: // Feature sections (7+)
          if (sectionIndex >= 7) {
            if (sectionIndex % 2 === 1) { // Odd indices are feature icons
              if (section.querySelector('picture')) {
                section.classList.add('column-tile-feature-icon');
              }
            } else { // Even indices are feature text
              if (section.textContent.trim()) {
                section.classList.add('column-tile-feature-text');
              }
            }
          }
          break;
      }
    });
  });
}