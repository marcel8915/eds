export default function decorate(block) {
    console.log('decorate grid-card block');
    const container = document.createElement('div');
    container.className = 'grid-cards-container';
  
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-cards-wrapper';
  
    const gridBlock = document.createElement('div');
    gridBlock.className = 'grid-cards';
  
    Array.from(block.children).forEach((card) => {
      const hasContent = card.textContent.trim() !== '' || card.querySelector('picture');
      if (!hasContent) return;
      const cardContainer = document.createElement('div');
      cardContainer.className = 'grid-card';
  
      while (card.firstChild) {
        cardContainer.appendChild(card.firstChild);
      }
  
      const paragraphs = cardContainer.querySelectorAll('p');
      paragraphs.forEach((p, index) => {
        p.classList.add(`grid-card-p-${index + 1}`);
      });
  
      const picture = cardContainer.querySelector('picture');
      if (picture) {
        picture.classList.add('grid-card-picture');
      }
  
      gridBlock.appendChild(cardContainer);
    });
  
    wrapper.appendChild(gridBlock);
    container.appendChild(wrapper);
    block.innerHTML = '';
    block.appendChild(container);
  }
  