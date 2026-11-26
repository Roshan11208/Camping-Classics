(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const next = document.getElementById('nextHeroPhoto');
  if (!next || slides.length < 2) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let pending = false;

  function nextImage() {
    const image = slides[(current + 1) % slides.length].querySelector('img');
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
    return image;
  }
  function schedule() {
    clearTimeout(timer);
    if (!document.hidden && !reducedMotion.matches) {
      nextImage();
      timer = setTimeout(advance, 7000);
    }
  }
  async function advance() {
    if (pending) return;
    pending = true;
    clearTimeout(timer);
    try {
      await nextImage().decode();
      slides[current].hidden = true;
      current = (current + 1) % slides.length;
      slides[current].hidden = false;
    } catch { /* Keep the current photo visible if the next image fails. */ }
    pending = false;
    schedule();
  }
  next.addEventListener('click', advance);
  reducedMotion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
