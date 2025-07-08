import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Create simple ul structure like cards.js
  const ul = document.createElement('ul');
  ul.className = 'column-tile-container';
  
  [...block.children].forEach((row) => {
    const hasContent = row.textContent.trim() !== "" || row.querySelector("picture");
    if (!hasContent) return;

    // Create li and move instrumentation (like cards.js)
    const li = document.createElement('li');
    li.className = 'column-tile-card';
    moveInstrumentation(row, li);
    
    // Move all children from row to li (like cards.js)
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }
    
    // Add classes to existing children (like faq-accordion.js)
    const sections = Array.from(li.children);
    
    // Image section
    if (sections[0]?.querySelector('picture')) {
      sections[0].className = 'column-tile-images';
    }
    
    // Label
    if (sections[1]) {
      sections[1].className = 'column-tile-label';
    }
    
    // Secondary link
    if (sections[2]) {
      sections[2].className = 'column-tile-sub-link-wrapper';
      const link = sections[2].querySelector('a');
      if (link) {
        link.className = 'column-tile-sub-link';
      }
    }
    
    // Sub description
    if (sections[3]) {
      sections[3].className = 'column-tile-sub-description';
    }
    
    // Main link
    if (sections[4]) {
      sections[4].className = 'column-tile-link-wrapper';
      const link = sections[4].querySelector('a');
      if (link) {
        link.className = 'column-tile-link';
      }
    }
    
    // Description
    if (sections[5]) {
      sections[5].className = 'column-tile-description';
    }
    
    // Supporting text
    if (sections[6]) {
      sections[6].className = 'column-tile-supporting-text';
    }
    
    // Features (remaining sections)
    for (let i = 7; i < sections.length; i++) {
      if (sections[i]?.querySelector('picture')) {
        sections[i].className = 'column-tile-feature-icon';
      } else if (sections[i]?.textContent.trim()) {
        sections[i].className = 'column-tile-feature-text';
      }
    }
    
    ul.append(li);
  });
  
  // Replace block content
  block.textContent = '';
  block.append(ul);
}