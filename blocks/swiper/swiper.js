function createArrowButton(direction, onClick) {
  const button = document.createElement('button');
  button.classList.add('swiper-arrow-button', `swiper-arrow-${direction}`);
  button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="${direction === 'left' ? 'M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z' : 'M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z'}" fill="currentColor"/>
                      </svg>`;
  button.addEventListener('click', onClick);
  return button;
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
    document.head.appendChild(link);
  });
}

export default async function decorate(block) {
  const swiperJsUrl = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
  const swiperCssUrl = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';

  await Promise.all([
    loadCSS(swiperCssUrl),
    loadScript(swiperJsUrl),
  ]);

  const { Swiper, Mousewheel, Keyboard } = window;

  if (!Swiper) {
    console.error('Swiper library not loaded from CDN.');
    return;
  }

  const rawCardElements = Array.from(block.children);

  const swiperContainer = document.createElement('div');

  swiperContainer.classList.add('swiper-container', 'mySwiper', 'w-full', '!overflow-visible', 'px-6', 'md:px-8');
  swiperContainer.setAttribute('tabindex', '0');

  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');

  rawCardElements.forEach((rawCardEl) => {
    const swiperSlide = document.createElement('div');
    swiperSlide.classList.add('swiper-slide', '!w-[70%]', 'md:!w-[32%]');

    while (rawCardEl.firstChild) {
      swiperSlide.appendChild(rawCardEl.firstChild);
    }

    let cardContentDiv = swiperSlide.querySelector('div');
    if (!cardContentDiv) {
      cardContentDiv = document.createElement('div');
      while (swiperSlide.firstChild) {
        cardContentDiv.appendChild(swiperSlide.firstChild);
      }
      swiperSlide.appendChild(cardContentDiv);
    }
    cardContentDiv.classList.add('flex', 'w-full', 'flex-col', 'gap-4', 'md:gap-8');

    const imageContainer = cardContentDiv.querySelector('div.image-container');
    if (imageContainer) {
      imageContainer.classList.add('aspect-[1/1.4]');
    } else {
      const imgEl = cardContentDiv.querySelector('img');
      if (imgEl) {
        const newImageContainer = document.createElement('div');
        newImageContainer.classList.add('image-container', 'aspect-[1/1.4]');
        imgEl.parentNode.insertBefore(newImageContainer, imgEl);
        newImageContainer.appendChild(imgEl);
      }
    }

    swiperWrapper.appendChild(swiperSlide);
  });

  swiperContainer.appendChild(swiperWrapper);

  const arrowWrapper = document.createElement('div');
  arrowWrapper.classList.add('pointer-events-none', 'absolute', 'inset-0', 'z-10', 'hidden', 'items-center', 'justify-between', 'md:flex');

  const prevArrowDiv = document.createElement('div');
  prevArrowDiv.classList.add('relative', 'transition-opacity', 'duration-300', 'md:ml-[-60px]');
  const nextArrowDiv = document.createElement('div');
  nextArrowDiv.classList.add('relative', 'transition-opacity', 'duration-300', 'md:mr-[-65px]');

  block.innerHTML = '';
  block.appendChild(swiperContainer);

  block.appendChild(arrowWrapper);
  arrowWrapper.appendChild(prevArrowDiv);
  arrowWrapper.appendChild(nextArrowDiv);

  const swiperInstance = new Swiper(swiperContainer, {
    modules: [Mousewheel, Keyboard],
    tabIndex: 0,
    mousewheel: { forceToAxis: true },
    keyboard: { enabled: true },
    slidesPerView: 'auto',
    spaceBetween: 24,
    centeredSlides: false,
    centeredSlidesBounds: true,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    slideToClickedSlide: true,
    breakpoints: {
      768: {
        slidesPerView: 'auto',
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        spaceBetween: 32,
      },
    },
  });

  const updateArrowVisibility = () => {
    prevArrowDiv.classList.toggle('pointer-events-none', swiperInstance.isBeginning);
    prevArrowDiv.classList.toggle('opacity-0', swiperInstance.isBeginning);
    nextArrowDiv.classList.toggle('pointer-events-none', swiperInstance.isEnd);
    nextArrowDiv.classList.toggle('opacity-0', swiperInstance.isEnd);
  };

  swiperInstance.on('slideChange', updateArrowVisibility);
  swiperInstance.on('transitionEnd', updateArrowVisibility);

  const prevButtonEl = createArrowButton('left', () => swiperInstance.slidePrev());
  prevButtonEl.classList.add('pointer-events-auto');
  prevArrowDiv.appendChild(prevButtonEl);

  const nextButtonEl = createArrowButton('right', () => swiperInstance.slideNext());
  nextButtonEl.classList.add('pointer-events-auto');
  nextArrowDiv.appendChild(nextButtonEl);

  updateArrowVisibility();

  const firstImageEl = swiperContainer.querySelector('.swiper-slide .image-container img');
  if (firstImageEl) {
    if (firstImageEl.complete && firstImageEl.parentNode) {
      arrowWrapper.style.height = `${firstImageEl.parentNode.clientHeight}px`;
    } else {
      firstImageEl.addEventListener('load', () => {
        if (firstImageEl.parentNode) {
          arrowWrapper.style.height = `${firstImageEl.parentNode.clientHeight}px`;
        }
      });
    }
  }
}
