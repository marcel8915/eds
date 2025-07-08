import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
    // Process each accordion item
    Array.from(block.children).forEach((item, index) => {
      const hasContent = item.textContent.trim() !== "";
      if (!hasContent) return;
  
      // Add accordion item class to the original row
      item.className = "accordion-item";
      item.dataset.value = `item-${index + 1}`;
  
      // Get all sections of the accordion item
      const itemSections = Array.from(item.children);
  
      // Transform the first section into header
      if (itemSections[0]) {
        const headerSection = itemSections[0];
        headerSection.className = "accordion-header";
        
        // Create trigger button and move content
        const trigger = document.createElement("button");
        trigger.className = "accordion-trigger";
        
        // Move all content from header section to trigger
        while (headerSection.firstChild) {
          trigger.appendChild(headerSection.firstChild);
        }
        
        // Add the icon
        const icon = document.createElement('svg');
        icon.className = 'accordion-icon';
        icon.setAttribute('width', '16');
        icon.setAttribute('height', '16');
        icon.setAttribute('viewBox', '0 0 16 16');
        icon.setAttribute('fill', 'none');
        
        const path = document.createElement('path');
        path.setAttribute('d', 'M8 3V13M3 8H13');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        
        icon.appendChild(path);
        trigger.appendChild(icon);
        
        // Move instrumentation from original header section to trigger
        moveInstrumentation(headerSection, trigger);
        
        // Clear header section and add trigger
        headerSection.innerHTML = '';
        headerSection.appendChild(trigger);
      }
  
      // Transform the second section into content
      if (itemSections[1]) {
        const contentSection = itemSections[1];
        contentSection.className = "accordion-content";
        // Keep the original content section as-is to preserve Universal Editor attributes
      }
    });
  
    // Add container class to the block itself
    block.className += ' accordion-container-item';
  
    // Add click handlers for all triggers
    const triggers = block.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        item.classList.toggle('active');
        
        // Toggle the icon rotation
        const icon = trigger.querySelector('.accordion-icon');
        if (icon) {
          icon.style.transform = item.classList.contains('active') 
            ? 'rotate(45deg)' 
            : 'rotate(0deg)';
        }
      });
    });
  }