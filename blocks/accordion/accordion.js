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
  
      // Get all sections of the accordion item
      const itemSections = Array.from(item.children);
  
      // Create header (title) section with trigger button
      if (itemSections[0]) {
        const header = document.createElement("div");
        header.className = "accordion-header";
        
        const trigger = document.createElement("button");
        trigger.className = "accordion-trigger";
        trigger.innerHTML = `
          ${itemSections[0].innerHTML}
          <svg class="accordion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
        
        header.appendChild(trigger);
        accordionItem.appendChild(header);
      }
  
      // Create content section
      if (itemSections[1]) {
        const content = document.createElement("div");
        content.className = "accordion-content";
        content.innerHTML = itemSections[1].innerHTML;
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
