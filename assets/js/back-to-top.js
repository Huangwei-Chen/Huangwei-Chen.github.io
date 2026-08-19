(function () {
  const button = document.querySelector('.back-to-top');
  if (!button) return;

  function updateVisibility() {
    button.classList.toggle('is-visible', window.scrollY > 400);
  }

  button.addEventListener('click', function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
})();
