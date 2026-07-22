(() => {
  const video = document.querySelector('.hero-video-media');
  const control = document.querySelector('#hero-video-control');
  if (video && control) {
    const label = control.querySelector('b');
    const icon = control.querySelector('span');
    const sync = () => {
      const paused = video.paused;
      control.setAttribute('aria-pressed', String(paused));
      control.setAttribute('aria-label', paused ? 'Reproducir video de fondo' : 'Pausar video de fondo');
      if (label) label.textContent = paused ? 'Reproducir video' : 'Pausar video';
      if (icon) icon.textContent = paused ? '▶' : 'Ⅱ';
    };
    control.addEventListener('click', async () => {
      try { video.paused ? await video.play() : video.pause(); } catch (_) {}
      sync();
    });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (!current) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${current.target.id}`));
    }, { rootMargin: '-25% 0px -60%', threshold: [0.05,.2,.5] });
    sections.forEach(s => observer.observe(s));
  }
})();
