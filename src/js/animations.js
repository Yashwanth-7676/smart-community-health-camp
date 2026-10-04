// src/js/animations.js
// Utility to add scroll reveal animations using IntersectionObserver

/**
 * Adds the 'visible' class to elements when they intersect the viewport.
 * Elements should have the 'reveal-on-scroll' class initially (with hidden state).
 */
export function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // trigger a bit before fully in view
    threshold: 0.1,
  };

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(revealCallback, observerOptions);
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => observer.observe(el));
}

// Optional: expose a way to reinitialize (e.g., after dynamic content added)
export function refreshScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll:not(.visible)');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.1 });
  revealElements.forEach(el => observer.observe(el));
}
