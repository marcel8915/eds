import { moveInstrumentation } from '../../scripts/scripts.js'; 

export default function decorate(block) {
  // Convert block to a more semantic structure while preserving original elements
  const ul = document.createElement('ul');
  ul.className = 'column-tile-container-col';
  
  [...block.children].forEach((row) => {
    const hasContent = row.textContent.trim() !== "" || row.querySelector("picture");
    if (!hasContent) return;
    
    const li = document.createElement('li');
    li.className = 'column-tile-card';
    
    // Move instrumentation from original row to new list item
    moveInstrumentation(row, li);
    
    // Process the row's children and organize them
    const cardSections = Array.from(row.children);
    
    // Handle image (first section)
    const image = cardSections[0]?.querySelector('picture');
    if (image) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'column-tile-images';
      // Move the original image element, don't clone
      moveInstrumentation(cardSections[0], imageWrapper);
      while (cardSections[0].firstElementChild) {
        imageWrapper.appendChild(cardSections[0].firstElementChild);
      }
      li.appendChild(imageWrapper);
    }
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'column-tile-content';
    
    // LEFT COLUMN
    const leftColumn = document.createElement('div');
    leftColumn.className = 'column-tile-left';
    
    // Label (section 1)
    if (cardSections[1]?.textContent.trim()) {
      const labelWrapper = document.createElement('div');
      labelWrapper.className = 'column-tile-label';
      moveInstrumentation(cardSections[1], labelWrapper);
      while (cardSections[1].firstChild) {
        labelWrapper.appendChild(cardSections[1].firstChild);
      }
      leftColumn.appendChild(labelWrapper);
    }
    
    // Secondary link (sections 2 & 3)
    if (cardSections[2]?.querySelector('a') || cardSections[3]?.textContent.trim()) {
      const secondaryLink = document.createElement('div');
      secondaryLink.className = 'column-tile-sub-link';
      
      // Handle link from section 2
      if (cardSections[2]?.querySelector('a')) {
        const linkElement = cardSections[2].querySelector('a');
        const newLink = document.createElement('a');
        newLink.href = linkElement.getAttribute('href') || '#';
        newLink.className = 'column-tile-sub-link';
        moveInstrumentation(linkElement, newLink);
        
        // Handle description from section 3
        if (cardSections[3]?.textContent.trim()) {
          const subDescription = document.createElement('div');
          subDescription.className = 'column-tile-sub-description';
          moveInstrumentation(cardSections[3], subDescription);
          while (cardSections[3].firstChild) {
            subDescription.appendChild(cardSections[3].firstChild);
          }
          newLink.appendChild(subDescription);
        }
        
        secondaryLink.appendChild(newLink);
      }
      
      if (secondaryLink.children.length > 0) {
        leftColumn.appendChild(secondaryLink);
      }
    }
    
    // RIGHT COLUMN
    const rightColumn = document.createElement('div');
    rightColumn.className = 'column-tile-right';
    
    // Supporting text (section 6)
    if (cardSections[6]?.textContent.trim()) {
      const rightDescription = document.createElement('div');
      rightDescription.className = 'column-tile-supporting-text';
      moveInstrumentation(cardSections[6], rightDescription);
      while (cardSections[6].firstChild) {
        rightDescription.appendChild(cardSections[6].firstChild);
      }
      rightColumn.appendChild(rightDescription);
    }
    
    // Features (sections 7+)
    const featuresContainer = document.createElement('div');
    featuresContainer.className = 'column-tile-features';
    
    for (let i = 7; i < cardSections.length; i += 2) {
      if (i + 1 < cardSections.length) {
        const featureItem = document.createElement('div');
        featureItem.className = 'column-tile-feature';
        
        // Icon
        const iconSection = cardSections[i];
        if (iconSection?.querySelector('picture')) {
          const iconWrapper = document.createElement('div');
          iconWrapper.className = 'column-tile-feature-icon';
          moveInstrumentation(iconSection, iconWrapper);
          while (iconSection.firstElementChild) {
            iconWrapper.appendChild(iconSection.firstElementChild);
          }
          featureItem.appendChild(iconWrapper);
        }
        
        // Text
        const textSection = cardSections[i + 1];
        if (textSection?.textContent.trim()) {
          const textWrapper = document.createElement('div');
          textWrapper.className = 'column-tile-feature-text';
          moveInstrumentation(textSection, textWrapper);
          while (textSection.firstChild) {
            textWrapper.appendChild(textSection.firstChild);
          }
          featureItem.appendChild(textWrapper);
        }
        
        if (featureItem.children.length > 0) {
          featuresContainer.appendChild(featureItem);
        }
      }
    }
    
    if (featuresContainer.children.length > 0) {
      rightColumn.appendChild(featuresContainer);
    }
    
    // Content main wrapper
    const contentMain = document.createElement('div');
    contentMain.className = 'column-tile-content-main';
    
    if (leftColumn.children.length > 0) {
      contentMain.appendChild(leftColumn);
    }
    if (rightColumn.children.length > 0) {
      contentMain.appendChild(rightColumn);
    }
    
    if (contentMain.children.length > 0) {
      contentContainer.appendChild(contentMain);
    }
    
    // LINK SECTION (sections 4 & 5)
    if (cardSections[4]?.querySelector('a') || cardSections[5]?.textContent.trim()) {
      const contentLink = document.createElement('div');
      contentLink.className = 'column-tile-content-link';
      
      const linkSection = cardSections[4];
      if (linkSection?.querySelector('a')) {
        const originalLink = linkSection.querySelector('a');
        const link = document.createElement('a');
        link.href = originalLink.getAttribute('href') || '#';
        link.className = 'column-tile-link';
        moveInstrumentation(originalLink, link);
        
        // Description from section 5
        if (cardSections[5]?.textContent.trim()) {
          const description = document.createElement('div');
          description.className = 'column-tile-description';
          
          const textSpan = document.createElement('span');
          textSpan.className = 'description-text';
          moveInstrumentation(cardSections[5], textSpan);
          while (cardSections[5].firstChild) {
            textSpan.appendChild(cardSections[5].firstChild);
          }
          description.appendChild(textSpan);
          
          const svg = document.createElement('img');
          svg.src = '/icons/chevron_forward.svg';
          svg.alt = 'Arrow';
          svg.className = 'column-tile-description-icon';
          description.appendChild(svg);
          
          link.appendChild(description);
        }
        
        contentLink.appendChild(link);
      }
      
      if (contentLink.children.length > 0) {
        contentContainer.appendChild(contentLink);
      }
    }
    
    if (contentContainer.children.length > 0) {
      li.appendChild(contentContainer);
    }
    
    ul.appendChild(li);
  });
  
  // Replace block content with the new structure
  block.textContent = '';
  block.appendChild(ul);
}