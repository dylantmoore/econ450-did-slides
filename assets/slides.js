/**
 * Slide Navigation and Animation Controller
 * Handles keyboard navigation, click navigation, fragment reveals, and slide transitions
 */

class SlidePresenter {
  constructor() {
    this.currentFragmentIndex = -1;
    this.fragments = [];
    this.totalSlides = 0;
    this.currentSlide = 1;

    this.init();
  }

  init() {
    // Get all fragments on the page
    this.fragments = Array.from(document.querySelectorAll('.fragment'));

    // Get slide info from data attributes or URL
    const slideContainer = document.querySelector('.slide-container');
    if (slideContainer) {
      this.totalSlides = parseInt(slideContainer.dataset.totalSlides) || 1;
      this.currentSlide = parseInt(slideContainer.dataset.currentSlide) || 1;
    }

    // Update navigation
    this.updateNav();

    // Bind keyboard events
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Bind click on slide to advance (but not on links or buttons)
    const slide = document.querySelector('.slide');
    if (slide) {
      slide.addEventListener('click', (e) => {
        // Don't advance if clicking on a link, button, or the home button
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' ||
            e.target.closest('a') || e.target.closest('button') ||
            e.target.closest('.home-btn')) {
          return;
        }
        this.next();
      });

      // Add slide entrance animation
      slide.classList.add('slide-enter');
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'Enter':
        e.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
      case 'Backspace':
        e.preventDefault();
        this.prev();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.totalSlides);
        break;
      case 'Escape':
        e.preventDefault();
        this.goToIndex();
        break;
      case 'f':
        e.preventDefault();
        this.toggleFullscreen();
        break;
    }
  }

  next() {
    // First, check for fragment
    if (this.currentFragmentIndex < this.fragments.length - 1) {
      this.currentFragmentIndex++;
      this.fragments[this.currentFragmentIndex].classList.add('visible');
    } else {
      // Check for custom next link
      const container = document.querySelector('.slide-container');
      if (container && container.dataset.nextSlide) {
        window.location.href = container.dataset.nextSlide;
        return;
      }
      // Default: Go to next numeric slide
      if (this.currentSlide < this.totalSlides) {
        this.goToSlide(this.currentSlide + 1);
      }
    }
    this.updateNav();
  }

  prev() {
    // First, hide fragment
    if (this.currentFragmentIndex >= 0) {
      this.fragments[this.currentFragmentIndex].classList.remove('visible');
      this.currentFragmentIndex--;
    } else {
      // Check for custom prev link
      const container = document.querySelector('.slide-container');
      if (container && container.dataset.prevSlide) {
        window.location.href = container.dataset.prevSlide;
        return;
      }
      // Default: Go to previous numeric slide
      if (this.currentSlide > 1) {
        this.goToSlide(this.currentSlide - 1);
      }
    }
    this.updateNav();
  }

  goToSlide(slideNum) {
    if (slideNum >= 1 && slideNum <= this.totalSlides) {
      // Navigate to slide file
      const paddedNum = String(slideNum).padStart(2, '0');
      window.location.href = `slide-${paddedNum}.html`;
    }
  }

  goToIndex() {
    window.location.href = 'index.html';
  }

  updateNav() {
    const slideNum = document.getElementById('slide-number');
    if (slideNum) {
      slideNum.textContent = `${this.currentSlide} / ${this.totalSlides}`;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.slidePresenter = new SlidePresenter();
});
