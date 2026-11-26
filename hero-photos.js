(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const region = document.querySelector('.hero-photo-wrap');
  if (slides.length < 2 || !region) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let hovering = false;

  function prepareNext() {
    if (reducedMotion.matches) return;
    const image = slides[(current + 1) % slides.length].querySelector('img');
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
  }
  function advance() {
    const next = (current + 1) % slides.length;
    const image = slides[next].querySelector('img');
    if (image.complete && image.naturalWidth) {
      slides[current].hidden = true;
      slides[next].hidden = false;
      current = next;
    }
    prepareNext();
  }
  function schedule() {
    clearInterval(timer);
    if (!reducedMotion.matches && !document.hidden && !hovering && !region.contains(document.activeElement)) {
      prepareNext();
      timer = setInterval(advance, 10000);
    }
  }
  region.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  region.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  region.addEventListener('focusin', schedule);
  region.addEventListener('focusout', () => setTimeout(schedule, 0));
  reducedMotion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
