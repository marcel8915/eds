export default function decorate(block) {
    console.log('decorate layout-card block');
    
    // Create main container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'layout-card-container';
    
    // Create wrapper inside the container
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'layout-card-wrapper';
    cardContainer.appendChild(cardWrapper);
    
    // Process each card in the block
    Array.from(block.children).forEach((card) => {
        const hasContent = card.textContent.trim() !== '' || card.querySelector('picture');
        if (!hasContent) return;
        
        // Create card wrapper
        const layoutCard = document.createElement('div');
        layoutCard.className = 'layout-card';
        
        // Process image (first element)
        const image = card.querySelector('picture');
        if (image) {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'layout-card-image';
            imageWrapper.appendChild(image);
            layoutCard.appendChild(imageWrapper);
        }
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'layout-card-content';
        
        // Create left column (for label and CTA)
        const leftColumn = document.createElement('div');
        leftColumn.className = 'layout-card-left';
        
        // Create right column (for title)
        const rightColumn = document.createElement('div');
        rightColumn.className = 'layout-card-right';
        
        // Get all content elements (excluding picture)
        const elements = Array.from(card.children).filter(child => child.tagName !== 'PICTURE');
        
        // Extract content from each div (accounting for nested p tags)
        const contentItems = elements.map(el => {
            const p = el.querySelector('p');
            return p ? p.textContent.trim() : el.textContent.trim();
        });
        
        // Process content items
        if (contentItems[1]) { // Label ("Drink and Dine")
            const label = document.createElement('div');
            label.className = 'layout-card-label';
            label.textContent = contentItems[1];
            leftColumn.appendChild(label);
        }
        
        // Process CTA (combine URL and CTA text)
        if (contentItems[2] && contentItems[3]) {
            const ctaButton = document.createElement('a');
            ctaButton.href = contentItems[2];
            ctaButton.className = 'layout-cta-button';
            ctaButton.textContent = contentItems[3]; // "P72"
            leftColumn.appendChild(ctaButton);
        }
        
        // Process title ("Open for Reserve")
        if (contentItems[4]) {
            const title = document.createElement('div');
            title.className = 'layout-card-title';
            title.textContent = contentItems[4];
            rightColumn.appendChild(title);
        }
        
        // Add columns to content container
        if (leftColumn.children.length > 0) {
            contentContainer.appendChild(leftColumn);
        }
        if (rightColumn.children.length > 0) {
            contentContainer.appendChild(rightColumn);
        }
        
        // Add content container to card
        if (contentContainer.children.length > 0) {
            layoutCard.appendChild(contentContainer);
        }
    
        cardWrapper.appendChild(layoutCard);
    });
    
    // Replace block content with our new structure
    block.innerHTML = '';
    block.appendChild(cardContainer);
}