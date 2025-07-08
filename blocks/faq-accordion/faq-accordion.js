import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
    // Create accordion container
    const accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion-container-item";
  
    // Process each accordion item
    Array.from(block.children).forEach((item, index) => {
      const hasContent = item.textContent.trim() !== "";
      if (!hasContent) return;
  
      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";
      accordionItem.dataset.value = `item-${index + 1}`;
      
      // Move instrumentation from original item to new accordionItem
      moveInstrumentation(item, accordionItem);
  
      // Get all sections of the accordion item
      const itemSections = Array.from(item.children);
  
      // Create header (title) section with trigger button
      if (itemSections[0]) {
        const header = document.createElement("div");
        header.className = "accordion-header";
        
        const trigger = document.createElement("button");
        trigger.className = "accordion-trigger";
        
        // Move instrumentation from original header section to trigger button
        moveInstrumentation(itemSections[0], trigger);
        
        // Move the content from original section to trigger, preserving the DOM structure
        while (itemSections[0].firstChild) {
          trigger.appendChild(itemSections[0].firstChild);
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
        
        header.appendChild(trigger);
        accordionItem.appendChild(header);
      }
  
      // Create content section
      if (itemSections[1]) {
        const content = document.createElement("div");
        content.className = "accordion-content";
        
        // Move instrumentation from original content section to new content
        moveInstrumentation(itemSections[1], content);
        
        // Move the content from original section to new content, preserving the DOM structure
        while (itemSections[1].firstChild) {
          content.appendChild(itemSections[1].firstChild);
        }
        
        accordionItem.appendChild(content);
      }
  
      accordionContainer.appendChild(accordionItem);
    });
  
    // Replace original block content with our accordion
    block.innerHTML = "";
    block.appendChild(accordionContainer);
  
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