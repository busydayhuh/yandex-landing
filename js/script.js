function initStagesSlider() {
  const slider = document.querySelector(".stages");
  const track = slider?.querySelector(".stages__list");
  const slides =
    slider ? Array.from(slider.querySelectorAll(".stages__list > *")) : [];
  const prevButton = slider?.querySelector(".stages__button--prev");
  const nextButton = slider?.querySelector(".stages__button--next");
  const dotsContainer = slider?.querySelector(".stages__dots");

  if (
    !slider ||
    !track ||
    !slides.length ||
    !prevButton ||
    !nextButton ||
    !dotsContainer
  ) {
    return;
  }

  let currentIndex = 0;
  let dots = [];

  function isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function createDots() {
    dotsContainer.innerHTML = "";

    dots = slides.map((_, index) => {
      const dot = document.createElement("button");

      dot.className = "stages__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Перейти к этапу ${index + 1}`);

      dot.addEventListener("click", () => {
        currentIndex = index;
        updateSlider();
      });

      dotsContainer.append(dot);

      return dot;
    });
  }

  function updateSlider() {
    if (!isMobile()) {
      track.style.transform = "";
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.setAttribute(
        "aria-current",
        index === currentIndex ? "true" : "false",
      );
    });
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex === 0) return;

    currentIndex -= 1;
    updateSlider();
  });

  nextButton.addEventListener("click", () => {
    if (currentIndex === slides.length - 1) return;

    currentIndex += 1;
    updateSlider();
  });

  window.addEventListener("resize", () => {
    if (currentIndex > slides.length - 1) {
      currentIndex = slides.length - 1;
    }

    updateSlider();
  });

  createDots();
  updateSlider();
}

function initMembersSlider() {
  const slider = document.querySelector(".members");
  const viewport = slider?.querySelector(".members__viewport");
  const track = slider?.querySelector(".members__track");
  const prevButton = slider?.querySelector(".members__button--prev");
  const nextButton = slider?.querySelector(".members__button--next");
  const currentCounter = slider?.querySelector(".members__counter-current");
  const totalCounter = slider?.querySelector(".members__counter-total");

  if (
    !slider ||
    !viewport ||
    !track ||
    !prevButton ||
    !nextButton ||
    !currentCounter ||
    !totalCounter
  ) {
    return;
  }

  const originalCards = Array.from(track.children);
  const totalCards = originalCards.length;
  const AUTOPLAY_DELAY = 4000;
  const TRANSITION = "transform 400ms ease";

  let visibleCards = getVisibleCards();
  let currentIndex = visibleCards;
  let slideWidth = 0;
  let autoplayTimer = null;
  let isAnimating = false;

  totalCounter.textContent = totalCards;

  function getVisibleCards() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      return 1;
    }

    if (window.matchMedia("(max-width: 1023px)").matches) {
      return 2;
    }

    return 3;
  }

  function removeClones() {
    track.querySelectorAll("[data-clone='true']").forEach((clone) => {
      clone.remove();
    });
  }

  function createClones() {
    removeClones();

    visibleCards = getVisibleCards();

    const firstClones = originalCards.slice(0, visibleCards).map((card) => {
      const clone = card.cloneNode(true);
      clone.dataset.clone = "true";
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    const lastClones = originalCards.slice(-visibleCards).map((card) => {
      const clone = card.cloneNode(true);
      clone.dataset.clone = "true";
      clone.setAttribute("aria-hidden", "true");
      return clone;
    });

    track.prepend(...lastClones);
    track.append(...firstClones);

    currentIndex = visibleCards;
  }

  function setPosition(withTransition = true) {
    track.style.transition = withTransition ? TRANSITION : "none";
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  function updateSizes() {
    slideWidth = viewport.offsetWidth / visibleCards;
    setPosition(false);

    requestAnimationFrame(() => {
      track.style.transition = TRANSITION;
    });
  }

  function getRealIndex() {
    return (
      (((currentIndex - visibleCards) % totalCards) + totalCards) % totalCards
    );
  }

  function updateCounter() {
    const realIndex = getRealIndex();
    const visibleLastCard = Math.min(realIndex + visibleCards, totalCards);

    currentCounter.textContent = visibleLastCard;
  }

  function moveTo(index) {
    if (isAnimating) return;

    isAnimating = true;
    currentIndex = index;
    setPosition(true);
    updateCounter();
  }

  function nextSlide() {
    moveTo(currentIndex + visibleCards);
  }

  function prevSlide() {
    moveTo(currentIndex - visibleCards);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  track.addEventListener("transitionend", () => {
    isAnimating = false;

    if (currentIndex >= totalCards + visibleCards) {
      currentIndex = visibleCards;
      setPosition(false);
    }

    if (currentIndex < visibleCards) {
      currentIndex = totalCards;
      setPosition(false);
    }

    updateCounter();
  });

  nextButton.addEventListener("click", () => {
    nextSlide();
    restartAutoplay();
  });

  prevButton.addEventListener("click", () => {
    prevSlide();
    restartAutoplay();
  });

  window.addEventListener("resize", () => {
    const nextVisibleCards = getVisibleCards();

    if (nextVisibleCards !== visibleCards) {
      createClones();
    }

    updateSizes();
    updateCounter();
    restartAutoplay();
  });

  createClones();
  updateSizes();
  updateCounter();
  startAutoplay();
}

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll("[data-animate]");

  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
    },
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMembersSlider();
  initStagesSlider();
  initScrollAnimations();
});
