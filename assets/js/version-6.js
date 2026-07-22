(() => {
  const video = document.querySelector('.hero-video-media');
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const startVideo = () => video.play().catch(() => {});
    if (video.readyState >= 2) startVideo();
    else video.addEventListener('canplay', startVideo, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && video.paused) startVideo();
    });
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
