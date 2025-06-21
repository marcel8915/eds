document.addEventListener('DOMContentLoaded', function() {
    if (window.EDS && window.EDS.components) {
      window.EDS.components.on('component:ready', function(event) {
        if (event.detail.id === 'tiles-card') {
          const component = event.detail.element;
          
          component.classList.add('custom-tiles-card');
          
          const ctaLink = component.querySelector('[data-field-name="ctaLink"]');
          const ctaText = component.querySelector('[data-field-name="ctaText"]');
          
          if (ctaLink && ctaText) {
            ctaLink.textContent = ctaText.value || 'Learn More';
            
            if (ctaLink.tagName !== 'A') {
              const linkUrl = ctaLink.value || '#';
              const newLink = document.createElement('a');
              newLink.href = linkUrl;
              newLink.textContent = ctaText.value || 'Learn More';
              newLink.className = 'tiles-cta-button';
              ctaLink.parentNode.replaceChild(newLink, ctaLink);
            }
          }
          
          component.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
          });
          
          component.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          });
        }
      });
    }
  });