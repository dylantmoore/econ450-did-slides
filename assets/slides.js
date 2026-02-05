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
        // Don't advance if info dialog is open
        if (window.infoDialogs && window.infoDialogs.isOpen()) {
          return;
        }
        this.next();
      });

      // Add slide entrance animation
      slide.classList.add('slide-enter');
    }
  }

  handleKeydown(e) {
    // If info dialog is open, don't handle navigation keys
    if (window.infoDialogs && window.infoDialogs.isOpen()) {
      return;
    }

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

/**
 * Info Dialog Manager
 * Shared overlay dialog triggered by inline .info-btn buttons.
 * Replaces the old LectureNotesModal and DetailButtons classes.
 */
class InfoDialogManager {
  constructor() {
    this.overlay = null;
    this.init();
  }

  init() {
    // Create shared overlay element
    this.overlay = document.createElement('div');
    this.overlay.className = 'info-dialog-overlay';
    this.overlay.innerHTML = `
      <div class="info-dialog">
        <button class="close-btn" aria-label="Close">&times;</button>
        <h3 class="dialog-title"></h3>
        <div class="dialog-body"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    // Close on overlay click (outside dialog) - MUST stopPropagation
    this.overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === this.overlay) this.close();
    });

    // Close on X button
    this.overlay.querySelector('.close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });

    // Wire up all info buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = document.getElementById(btn.dataset.dialog);
        if (target) {
          this.open(
            target.dataset.title || btn.textContent,
            target.innerHTML
          );
        }
      });
    });
  }

  isOpen() {
    return this.overlay && this.overlay.classList.contains('open');
  }

  open(title, bodyHtml) {
    this.overlay.querySelector('.dialog-title').textContent = title;
    const body = this.overlay.querySelector('.dialog-body');
    body.innerHTML = bodyHtml;
    this.overlay.classList.add('open');
    // Re-render MathJax if available
    if (window.MathJax) {
      MathJax.typesetPromise([body]).catch(() => {});
    }
  }

  close() {
    this.overlay.classList.remove('open');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.slidePresenter = new SlidePresenter();
  window.infoDialogs = new InfoDialogManager();
});
