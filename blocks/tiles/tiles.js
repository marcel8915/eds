export default function decorate(block) {
  console.log('decorate tiles-card block');
  
  // Create main container structure
  const tileContainer = document.createElement('div');
  tileContainer.className = 'tiles-card-container';
  
  // Process each card in the block
  Array.from(block.children).forEach((card) => {
      const hasContent = card.textContent.trim() !== '' || card.querySelector('picture');
      if (!hasContent) return;
      
      // Create tile card wrapper
      const tileCard = document.createElement('div');
      tileCard.className = 'tiles-card';
      
      // Process image (first element)
      const image = card.querySelector('picture');
      if (image) {
          const imageWrapper = document.createElement('div');
          imageWrapper.className = 'tiles-card-image';
          imageWrapper.appendChild(image);
          tileCard.appendChild(imageWrapper);
      }
      
      // Create content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'tiles-card-content';
      
      // Create left column
      const leftColumn = document.createElement('div');
      leftColumn.className = 'tiles-card-left';
      
      // Process other elements (label, CTA, title)
      const elements = Array.from(card.children).filter(child => child.tagName !== 'PICTURE');
      elements.forEach((element, index) => {
          if (index === 0) {
              // First element is label
              element.className = 'tiles-card-label';
              leftColumn.appendChild(element);
          } else if (index === 1 || index === 2) {
              // Second and third are CTA elements
              if (element.textContent.trim() !== '') {
                  element.className = index === 1 ? 'tiles-card-cta-link' : 'tiles-card-cta-text';
                  leftColumn.appendChild(element);
              }
          } else if (index === 3) {
              // Fourth element is title (right column)
              const rightColumn = document.createElement('div');
              rightColumn.className = 'tiles-card-right';
              element.className = 'tiles-card-title';
              rightColumn.appendChild(element);
              contentContainer.appendChild(rightColumn);
          }
      });
      
      // Add left column to content container
      if (leftColumn.children.length > 0) {
          contentContainer.insertBefore(leftColumn, contentContainer.firstChild);
      }
      
      // Add content container to tile
      if (contentContainer.children.length > 0) {
          tileCard.appendChild(contentContainer);
      }
      
      // Add hover effects
      tileCard.addEventListener('mouseenter', () => {
          tileCard.style.transform = 'translateY(-4px)';
          tileCard.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
      });
      
      tileCard.addEventListener('mouseleave', () => {
          tileCard.style.transform = '';
          tileCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      });
      
      tileContainer.appendChild(tileCard);
  });
  
  // Replace block content with our new structure
  block.innerHTML = '';
  block.appendChild(tileContainer);
  
  // Process CTA links
  document.querySelectorAll('.tiles-card-cta-link').forEach((ctaLink) => {
      const ctaText = ctaLink.nextElementSibling?.classList.contains('tiles-card-cta-text') 
          ? ctaLink.nextElementSibling 
          : null;
      
      if (ctaText) {
          // Create anchor tag
          const link = document.createElement('a');
          link.href = ctaLink.textContent.trim();
          link.textContent = ctaText.textContent.trim() || 'Learn More';
          link.className = 'tiles-cta-button';
          
          // Replace both elements with the new link
          ctaLink.parentNode.insertBefore(link, ctaLink);
          ctaLink.remove();
          ctaText.remove();
      } else if (ctaLink.textContent.trim()) {
          // Just convert to link if no text available
          const link = document.createElement('a');
          link.href = ctaLink.textContent.trim();
          link.textContent = 'Learn More';
          link.className = 'tiles-cta-button';
          ctaLink.parentNode.replaceChild(link, ctaLink);
      }
  });
}