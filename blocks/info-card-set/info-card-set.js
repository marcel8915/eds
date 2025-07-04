export default function decorate(block) {
    const infoCard = document.createElement("div");
    infoCard.className = "info-card-content";
  
    Array.from(block.children).forEach((section, index) => {
      const sectionDiv = document.createElement("div");
      sectionDiv.className = `info-card-section`;
  
      Array.from(section.children).forEach((child, childIndex) => {
        const childDiv = document.createElement("div");
        
        if (childIndex === 0) {
          childDiv.className = "info-card-header";
        } else {
          childDiv.className = "info-card-details";
        }
        
        // Process paragraphs
        Array.from(child.children).forEach((paragraph) => {
          if (paragraph.tagName === 'P') {
            paragraph.className = childIndex === 0 
              ? "info-card-title" 
              : "info-card-item";
          }
          childDiv.appendChild(paragraph);
        });
  
        sectionDiv.appendChild(childDiv);
      });
  
      infoCard.appendChild(sectionDiv);
    });
  
    block.innerHTML = "";
    block.appendChild(infoCard);
  }