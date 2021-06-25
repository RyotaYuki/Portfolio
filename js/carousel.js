/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
 function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Get the width and height of an element to mimic
   * the `background-size: cover` CSS property
   * @param  {Object} elementSizes   An object containing the `width` and `height` of the element
   * @param  {Object} containerSizes An object containing the `width` and `height` of the container
   * @return {Object}                An object containing the newly computed `width` and `height` of the element
   *
   * Credit: https://github.com/studiometa/background-cover
   */
  function backgroundCover(elementSizes, containerSizes) {
    const elementRatio = elementSizes.width / elementSizes.height;
    const containerRatio = containerSizes.width / containerSizes.height;
  
    let width, height;
  
    if (containerRatio > elementRatio) {
      width = containerSizes.width;
      height = containerSizes.width / elementRatio;
    } else {
      width = containerSizes.height * elementRatio;
      height = containerSizes.height;
    }
  
    return { width, height };
  }
  
  // Create Flickity Carousel
  // https://flickity.metafizzy.co/
  const carouselSelector = document.querySelector(".carousel");
  const carousel = new Flickity(carouselSelector, {
    wrapAround: true,
    pageDots: false,
    prevNextButtons: false
  });
  
  // Create PixiJS
  // https://www.pixijs.com/
  const pixiContainer = document.querySelector(".pixi");
  const pixi = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1,
    transparent: true
  });
  pixiContainer.appendChild(pixi.view);
  
  // Create Displacement filter
  const displacementSprite = PIXI.Sprite.from(
    "https://assets.codepen.io/3135932/displacement.png"
  );
  displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
  
  // Create blur
  const blurFilter = new PIXI.filters.BlurFilter();
  blurFilter.blur = 2.5;
  
  // Preload each image in the carousel
  const pixiSprites = [];
  const spriteContainer = new PIXI.Container();
  pixi.stage.addChild(spriteContainer);
  const carouselSlideImages = document.querySelectorAll(
    ".carousel .slide .image"
  );
  carouselSlideImages.forEach((imageElement, index) => {
    // Get background image url
    // This can be changed to get the url from <img if you use that instead of background-image
    const imageUrl = imageElement.style.backgroundImage
      .slice(4, -1)
      .replace(/"/g, "");
    const sprite = PIXI.Sprite.from(imageUrl);
    const displacementFilter = new PIXI.filters.DisplacementFilter(
      displacementSprite,
      0
    );
    sprite.filters = [displacementFilter, blurFilter];
    sprite.displacementFilter = displacementFilter;
  
    if (index != carousel.selectedIndex) {
      sprite.displacementFilter.scale.set(
        getRandom(-500, 500),
        getRandom(-500, 500)
      );
      sprite.alpha = 0;
    }
  
    // When the image is loaded, set its new size to fit like background image "cover"
    sprite.texture.baseTexture.on("loaded", () => {
      const newSizes = backgroundCover(
        { width: sprite.width, height: sprite.height },
        { width: pixi.screen.width, height: pixi.screen.height }
      );
  
      sprite.width = newSizes.width;
      sprite.height = newSizes.height;
    });
  
    pixiSprites.push(sprite);
    spriteContainer.addChild(sprite);
  });
  
  // When slide is changed animate the background
  var oldIndex = carousel.selectedIndex;
  var carouselChanging = false;
  carousel.on("change", (index) => {
    carouselChanging = true;
  
    gsap.timeline([
      gsap.to(pixiSprites[oldIndex], {
        duration: 0.5,
        pixi: {
          alpha: 0
        }
      }),
      gsap.to(pixiSprites[oldIndex].displacementFilter.scale, {
        duration: 0.5,
        x: getRandom(-500, 500),
        y: getRandom(-500, 500)
      })
    ]);
  
    gsap.timeline([
      gsap.to(pixiSprites[index], {
        duration: 0.5,
        pixi: {
          alpha: 1
        }
      }),
      gsap.to(pixiSprites[index].displacementFilter.scale, {
        duration: 0.5,
        x: 0,
        y: 0
      })
    ]);
  
    oldIndex = index;
  });
  
  carousel.on("settle", () => {
    carouselChanging = false;
  });
  
  // Partially animate the background when dragging the carousel
  carousel.on("dragMove", (event, pointer, moveVector) => {
    gsap.to(pixiSprites[carousel.selectedIndex].displacementFilter.scale, {
      duration: 0.5,
      x: moveVector.x,
      y: moveVector.y
    });
  });
  
  carousel.on("dragEnd", (event, pointer) => {
    if (!carouselChanging) {
      gsap.to(pixiSprites[carousel.selectedIndex].displacementFilter.scale, {
        duration: 0.5,
        x: 0,
        y: 0
      });
    }
  });
  
  // Can remove below
  setTimeout(() => {
    carousel.next(true, false);
  
    setTimeout(() => {
      carousel.next(true, false);
  
      setTimeout(() => {
        carousel.next(true, false);
        
        setTimeout(() => {
          carousel.select(0, true, false);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
  