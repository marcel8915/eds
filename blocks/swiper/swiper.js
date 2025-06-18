function createArrowButton(direction, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('swiper-arrow-button', `swiper-arrow-${direction}`);
  button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="${direction === 'left' ? 'M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z' : 'M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z'}" fill="currentColor"/>
                      </svg>`;
  button.addEventListener('click', onClick);
  return button;
}

async function loadDependencies() {
  const swiperJsUrl = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
  const swiperCssUrl = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
  try {
    if (window.Swiper) return true;

    await new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = swiperCssUrl;
      link.onload = resolve;
      link.onerror = () => reject(new Error('Swiper CSS failed to load'));
      document.head.appendChild(link);
    });

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = swiperJsUrl;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Swiper JS failed to load'));
      document.head.appendChild(script);
    });

    return true;
  } catch (error) {
    console.error('Swiper dependency loading failed:', error);
    return false;
  }
}

export default async function decorate(block) {
  if (block.dataset.swiperInitialized) return;
  block.dataset.swiperInitialized = 'true';

  const loaded = await loadDependencies();
  if (!loaded || !window.Swiper) {
    console.error('Swiper initialization aborted - dependencies not loaded');
    return;
  }

  try {
    const { Swiper, Mousewheel, Keyboard } = window;

    const swiperContainer = document.createElement('div');
    swiperContainer.className = 'swiper-container mySwiper w-full !overflow-visible px-6 md:px-8';
    swiperContainer.tabIndex = 0;

    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';

    Array.from(block.children).forEach((rawCardEl) => {
      const swiperSlide = document.createElement('div');
      swiperSlide.className = 'swiper-slide !w-[70%] md:!w-[32%]';

      while (rawCardEl.firstChild) {
        swiperSlide.appendChild(rawCardEl.firstChild);
      }

      const cardContent = swiperSlide.querySelector('div') || document.createElement('div');
      if (!cardContent.parentNode) {
        while (swiperSlide.firstChild) {
          cardContent.appendChild(swiperSlide.firstChild);
        }
        swiperSlide.appendChild(cardContent);
      }
      cardContent.classList.add('flex', 'w-full', 'flex-col', 'gap-4', 'md:gap-8');

      const imgEl = cardContent.querySelector('img');
      if (imgEl) {
        const imageContainer = imgEl.closest('.image-container') || document.createElement('div');
        if (!imageContainer.parentNode) {
          imgEl.parentNode.insertBefore(imageContainer, imgEl);
          imageContainer.appendChild(imgEl);
        }
        imageContainer.classList.add('image-container', 'aspect-[1/1.4]');
      }

      swiperWrapper.appendChild(swiperSlide);
    });

    swiperContainer.appendChild(swiperWrapper);

    const arrowWrapper = document.createElement('div');
    arrowWrapper.className = 'pointer-events-none absolute inset-0 z-10 hidden items-center justify-between md:flex';

    const prevArrowDiv = document.createElement('div');
    prevArrowDiv.className = 'relative transition-opacity duration-300 md:ml-[-60px]';
    const nextArrowDiv = document.createElement('div');
    nextArrowDiv.className = 'relative transition-opacity duration-300 md:mr-[-65px]';

    block.innerHTML = '';
    block.appendChild(swiperContainer);
    block.appendChild(arrowWrapper);
    arrowWrapper.append(prevArrowDiv, nextArrowDiv);

    const swiper = new Swiper(swiperContainer, {
      modules: [Mousewheel, Keyboard],
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true },
      slidesPerView: 'auto',
      spaceBetween: 24,
      centeredSlides: false,
      slideToClickedSlide: true,
      breakpoints: {
        768: {
          spaceBetween: 32,
        },
      },
    });

    const updateArrows = () => {
      prevArrowDiv.classList.toggle('opacity-0', swiper.isBeginning);
      prevArrowDiv.classList.toggle('pointer-events-none', swiper.isBeginning);
      nextArrowDiv.classList.toggle('opacity-0', swiper.isEnd);
      nextArrowDiv.classList.toggle('pointer-events-none', swiper.isEnd);
    };

    swiper.on('slideChange', updateArrows);
    swiper.on('init', updateArrows);

    prevArrowDiv.appendChild(createArrowButton('left', () => swiper.slidePrev()));
    nextArrowDiv.appendChild(createArrowButton('right', () => swiper.slideNext()));

    const firstImage = swiperContainer.querySelector('img');
    if (firstImage) {
      const setHeight = () => {
        if (firstImage.parentElement) {
          arrowWrapper.style.height = `${firstImage.parentElement.clientHeight}px`;
        }
      };

      if (firstImage.complete) {
        setHeight();
      } else {
        firstImage.addEventListener('load', setHeight);
      }
    }

    swiper.init();
  } catch (error) {
    console.error('Swiper initialization failed:', error);
  }
}
