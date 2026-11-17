(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-card-browser]').forEach(browser => {
    const track = browser.querySelector('.browse-track');
    const cards = [...track.children];
    const toolbar = browser.querySelector('.browse-toolbar');
    const previous = browser.querySelector('.browse-previous');
    const next = browser.querySelector('.browse-next');
    const counter = browser.querySelector('.browse-count');
    let current = 0;
    let visible = 1;
    let scrollTimer;

    browser.classList.add('is-ready');
    toolbar.hidden = false;
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    track.setAttribute('aria-roledescription', 'carousel');
    track.setAttribute('aria-describedby', browser.querySelector('.browse-hint').id);
    cards.forEach((card, index) => {
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${index + 1} of ${cards.length}`);
    });

    function geometry() {
      const width = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const padding = parseFloat(getComputedStyle(track).paddingLeft) + parseFloat(getComputedStyle(track).paddingRight);
      visible = Math.max(1, Math.min(cards.length, Math.floor((track.clientWidth - padding + gap + 1) / (width + gap))));
      return width + gap;
    }

    function update() {
      const step = geometry();
      current = Math.max(0, Math.min(cards.length - visible, Math.round(track.scrollLeft / step)));
      previous.setAttribute('aria-disabled', String(current === 0));
      next.setAttribute('aria-disabled', String(current >= cards.length - visible));
      const last = Math.min(cards.length, current + visible);
      const range = visible === 1 ? `${current + 1}` : `${current + 1}–${last}`;
      counter.textContent = `${range} of ${cards.length}`;
    }

    function goTo(index, behavior = reducedMotion.matches ? 'auto' : 'smooth') {
      const step = geometry();
      current = Math.max(0, Math.min(cards.length - visible, index));
      track.scrollTo({ left: current * step, behavior });
    }

    previous.addEventListener('click', () => {
      if (previous.getAttribute('aria-disabled') !== 'true') goTo(current - visible);
    });
    next.addEventListener('click', () => {
      if (next.getAttribute('aria-disabled') !== 'true') goTo(current + visible);
    });
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(update, 120);
    }, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      const destinations = { ArrowLeft: current - visible, ArrowRight: current + visible, Home: 0, End: cards.length - visible };
      if (!Object.prototype.hasOwnProperty.call(destinations, event.key)) return;
      event.preventDefault();
      goTo(destinations[event.key]);
    });
    // Keep a tabbed-to card fully in view without moving the page vertically.
    track.addEventListener('focusin', event => {
      const card = event.target.closest('.browse-card');
      if (!card) return;
      const bounds = track.getBoundingClientRect();
      const rect = card.getBoundingClientRect();
      if (rect.left < bounds.left || rect.right > bounds.right) goTo(cards.indexOf(card), 'auto');
    });
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        goTo(current, 'auto');
        update();
      }).observe(track);
    } else {
      window.addEventListener('resize', update);
    }
    update();
  });

  const dialog = document.getElementById('campCardDialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const content = document.getElementById('campCardContent');
  let opener;
  document.querySelectorAll('.browse-details summary').forEach(summary => {
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.setAttribute('aria-controls', dialog.id);
    summary.addEventListener('click', event => {
      event.preventDefault();
      const card = summary.closest('.browse-card');
      const title = document.createElement('h2');
      title.id = 'campCardTitle';
      title.textContent = card.querySelector('h3').textContent;
      const nodes = [card.querySelector('.browse-icon').cloneNode(true), title, card.querySelector('.browse-summary').cloneNode(true)];
      const facts = card.querySelector('.browse-facts');
      if (facts) nodes.push(facts.cloneNode(true));
      const instructions = card.querySelector('.browse-details-body').cloneNode(true);
      const subheading = document.createElement('h3');
      subheading.textContent = instructions.querySelector('h4').textContent;
      instructions.querySelector('h4').replaceWith(subheading);
      nodes.push(instructions);
      content.replaceChildren(...nodes);
      opener = summary;
      document.body.classList.add('camp-card-open');
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  });
  dialog.querySelectorAll('.card-dialog-close, .card-dialog-done').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('camp-card-open');
    opener?.focus({ preventScroll: true });
  });
  // A drag that starts inside the instructions must not dismiss the dialog.
  let backdropPress = false;
  const outside = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && outside(event)) dialog.close();
    backdropPress = false;
  });
})();
