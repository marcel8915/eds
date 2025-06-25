export default function decorate(block) {
    const tileContainer = document.createElement('div');
    tileContainer.className = 'three-column-tile-wrapper-main';
    
    const tileWrapper = document.createElement('div');
    tileWrapper.className = 'three-column-tile block';
    tileWrapper.setAttribute('data-block-name', 'three-column-tile');
    tileWrapper.setAttribute('data-block-status', 'loaded');
    tileContainer.appendChild(tileWrapper);
    
    const columns = Array.from(block.children);
    
    if (columns.length > 0) {
        const mainTile = createTile(columns[0], 'main-tile');
        tileWrapper.appendChild(mainTile);
    }
    
    if (columns.length > 1) {
        const subTile1 = createTile(columns[1], 'sub-tile');
        tileWrapper.appendChild(subTile1);
        
        if (columns.length > 2) {
            const subTile2 = createTile(columns[2], 'sub-tile');
            tileWrapper.appendChild(subTile2);
        }
    }
    
    block.innerHTML = '';
    block.appendChild(tileContainer);
}

function createTile(column, tileClass) {
    const tile = document.createElement('div');
    tile.className = `${tileClass}`;
    
    const image = column.querySelector('picture');
    if (image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'grid-tile-image';
        imageWrapper.appendChild(image);
        tile.appendChild(imageWrapper);
    }
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'grid-tile-content';
    
    const elements = Array.from(column.children).filter(child => child.tagName !== 'PICTURE');
    
    const contentItems = elements.map(el => {
        const p = el.querySelector('p');
        return p ? p.textContent.trim() : el.textContent.trim();
    });
    
    if (contentItems[1]) {
        const category = document.createElement('div');
        category.className = 'grid-tile-category';
        category.textContent = contentItems[1];
        contentContainer.appendChild(category);
    }
    
    if (contentItems[3]) {
        const titleWrapper = document.createElement('a');
        const titleElement = elements[3].querySelector('p');
        const linkElement = elements[2].querySelector('a');
        
        if (linkElement && titleElement) {
            const url = new URL(linkElement.href);
            titleWrapper.href = url.pathname; 
            titleWrapper.className = linkElement.className;
            titleWrapper.appendChild(titleElement.cloneNode(true));
            const title = document.createElement('div');
            title.className = 'grid-tile-title';
            title.appendChild(titleWrapper);
            contentContainer.appendChild(title);
        }
    }
    
    if (contentContainer.children.length > 0) {
        tile.appendChild(contentContainer);
    }
    
    return tile;
}
