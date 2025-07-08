import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Create the proper container structure that CSS expects
  const container = document.createElement('div');
  container.className = 'column-tile-container';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'column-tile-wrapper-col';
  container.appendChild(wrapper);

  [...block.children].forEach((row) => {
    const hasContent = row.textContent.trim() !== "" || row.querySelector("picture");
    if (!hasContent) return;

    // Create card and move instrumentation from original row
    const card = document.createElement('div');
    card.className = 'column-tile-card';
    moveInstrumentation(row, card);
    
    // Move all children from row to card (preserving original elements)
    while (row.firstElementChild) {
      card.append(row.firstElementChild);
    }
    
    // Now create the expected structure based on CSS
    const sections = Array.from(card.children);
    
    // Image section (first child)
    if (sections[0]?.querySelector('picture')) {
      sections[0].className = 'column-tile-images';
    }
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'column-tile-content';
    
    // Create main content area
    const contentMain = document.createElement('div');
    contentMain.className = 'column-tile-content-main';
    
    // Left column
    const leftCol = document.createElement('div');
    leftCol.className = 'column-tile-left';
    
    // Label (section 1)
    if (sections[1]?.textContent.trim()) {
      sections[1].className = 'column-tile-label';
      leftCol.appendChild(sections[1]);
    }
    
    // Secondary link with description (sections 2 & 3)
    if (sections[2]?.querySelector('a')) {
      const link = sections[2].querySelector('a');
      link.className = 'column-tile-sub-link';
      
      if (sections[3]?.textContent.trim()) {
        sections[3].className = 'column-tile-sub-description';
        // Move the description content into the link
        while (sections[3].firstChild) {
          link.appendChild(sections[3].firstChild);
        }
      }
      
      leftCol.appendChild(sections[2]);
    }
    
    // Right column
    const rightCol = document.createElement('div');
    rightCol.className = 'column-tile-right';
    
    // Supporting text (section 6)
    if (sections[6]?.textContent.trim()) {
      sections[6].className = 'column-tile-supporting-text';
      rightCol.appendChild(sections[6]);
    }
    
    // Features (sections 7+)
    const features = document.createElement('div');
    features.className = 'column-tile-features';
    
    for (let i = 7; i < sections.length; i += 2) {
      if (sections[i] && sections[i + 1]) {
        const feature = document.createElement('div');
        feature.className = 'column-tile-feature';
        
        // Feature icon
        if (sections[i].querySelector('picture')) {
          sections[i].className = 'column-tile-feature-icon';
          feature.appendChild(sections[i]);
        }
        
        // Feature text
        if (sections[i + 1]?.textContent.trim()) {
          sections[i + 1].className = 'column-tile-feature-text';
          feature.appendChild(sections[i + 1]);
        }
        
        features.appendChild(feature);
      }
    }
    
    if (features.children.length > 0) {
      rightCol.appendChild(features);
    }
    
    // Add columns to main content
    if (leftCol.children.length > 0) {
      contentMain.appendChild(leftCol);
    }
    if (rightCol.children.length > 0) {
      contentMain.appendChild(rightCol);
    }
    
    if (contentMain.children.length > 0) {
      content.appendChild(contentMain);
    }
    
    // Content link section (sections 4 & 5)
    if (sections[4]?.querySelector('a')) {
      const contentLink = document.createElement('div');
      contentLink.className = 'column-tile-content-link';
      
      const link = sections[4].querySelector('a');
      link.className = 'column-tile-link';
      
      if (sections[5]?.textContent.trim()) {
        const description = document.createElement('div');
        description.className = 'column-tile-description';
        
        const descText = document.createElement('span');
        descText.className = 'description-text';
        
        // Move content to description text
        while (sections[5].firstChild) {
          descText.appendChild(sections[5].firstChild);
        }
        
        description.appendChild(descText);
        
        // Add arrow icon
        const icon = document.createElement('img');
        icon.src = '/icons/chevron_forward.svg';
        icon.alt = 'Arrow';
        icon.className = 'column-tile-description-icon';
        description.appendChild(icon);
        
        link.appendChild(description);
      }
      
      contentLink.appendChild(link);
      content.appendChild(contentLink);
    }
    
    // Add content to card
    if (content.children.length > 0) {
      card.appendChild(content);
    }
    
    wrapper.appendChild(card);
  });
  
  // Replace block content
  block.textContent = '';
  block.appendChild(container);
}