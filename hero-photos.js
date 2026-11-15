(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const toggle = document.getElementById('heroRotation');
  let current = 0;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer;

  function advance() {
    for (let step = 1; step < slides.length; step++) {
      const next = (current + step) % slides.length;
      const image = slides[next].querySelector('img');
      if (!image.complete || !image.naturalWidth) continue;
      slides[current].hidden = true;
      slides[next].hidden = false;
      current = next;
      break;
    }
  }

  function schedule() {
    clearInterval(timer);
    if (!paused && !document.hidden) timer = setInterval(advance, 10000);
    toggle.textContent = paused ? 'Play photos' : 'Pause photos';
  }

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
