export default function decorate(block) {
    // Preserve the original wrapper and card classes
    const cardContainer = document.createElement('div');
    cardContainer.className = 'three-column-card-wrapper-main';
    
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'three-column-card block';
    cardWrapper.setAttribute('data-block-name', 'three-column-card');
    cardWrapper.setAttribute('data-block-status', 'loaded');
    cardContainer.appendChild(cardWrapper);
    
    // Process each column in the block (should be exactly 3)
    const columns = Array.from(block.children);
    
    // Create hero card (first column)
    if (columns.length > 0) {
        const mainCard = createCard(columns[0], 'main-card');
        cardWrapper.appendChild(mainCard);
    }
    
    // Create secondary cards (second and third columns)
    if (columns.length > 1) {
        const subCard1 = createCard(columns[1], 'sub-card-1');
        cardWrapper.appendChild(subCard1);
        
        if (columns.length > 2) {
            const subCard2 = createCard(columns[2], 'sub-card-2');
            cardWrapper.appendChild(subCard2);
        }
    }
    
    // Replace block content with our new structure
    block.innerHTML = '';
    block.appendChild(cardContainer);
}

function createCard(column, cardClass) {
    const card = document.createElement('div');
    card.className = `${cardClass}`; // Add only the specific card class
    
    // Process image (first element)
    const image = column.querySelector('picture');
    if (image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'grid-card-image';
        imageWrapper.appendChild(image);
        card.appendChild(imageWrapper);
    }
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'grid-card-content';
    
    // Get all content elements (excluding picture)
    const elements = Array.from(column.children).filter(child => child.tagName !== 'PICTURE');
    
    // Extract content from each div (accounting for nested p tags)
    const contentItems = elements.map(el => {
        const p = el.querySelector('p');
        return p ? p.textContent.trim() : el.textContent.trim();
    });
    
    // Process category/tag (second element - "Wellbeing")
    if (contentItems[1]) {
        const category = document.createElement('div');
        category.className = 'grid-card-category';
        category.textContent = contentItems[1];
        contentContainer.appendChild(category);
    }
    
    // Process title (fourth element - "Wellness Facilities")
    if (contentItems[3]) {
        const title = document.createElement('div');
        title.className = 'grid-card-title';
        title.textContent = contentItems[3];
        contentContainer.appendChild(title);
    }
    
    // Add content container to card if it has content
    if (contentContainer.children.length > 0) {
        card.appendChild(contentContainer);
    }
    
    return card;
}