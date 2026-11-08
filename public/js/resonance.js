/**
 * Resonance relaxation — page interactions for developer handoff.
 * Visual design remains the approved dark-blue / gold page.
 * Enhancement policy: never make content dependent on JavaScript.
 */
(() => {
  'use strict';

  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu-mobile');
  const progress = document.getElementById('progress');
  const service = document.getElementById('service');
  const requestBox = document.getElementById('request-message');
  const requestCopy = document.getElementById('request-copy');
  const requestBtn = document.getElementById('request-btn');
  const copyBtn = document.getElementById('copy-btn');

  const closeMenu = () => {
    if (!menu || !menuBtn) return;
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = '☰';
  };
  menuBtn?.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.textContent = isOpen ? '×' : '☰';
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  function updateProgress() {
    if (!progress) return;
    const remaining = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (remaining > 0 ? (window.scrollY / remaining) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // Progressive enhancement. The HTML/CSS starts with ALL sections visible.
  // Animate only when motion is allowed and an IntersectionObserver exists.
  const allowMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if (allowMotion && 'IntersectionObserver' in window && reveals.length) {
    try {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }
      }, { threshold: 0.09, rootMargin: '0px 0px 40px 0px' });

      // No hidden content until observer setup has succeeded.
      reveals.filter(el => el.getBoundingClientRect().top < innerHeight + 45)
             .forEach(el => el.classList.add('visible'));
      reveals.forEach(el => observer.observe(el));
      document.documentElement.classList.add('motion-ready');

      // Restore visibility if the browser suspends the page and then resumes it.
      window.addEventListener('pageshow', event => {
        if (event.persisted) {
          document.documentElement.classList.remove('motion-ready');
          reveals.forEach(el => el.classList.add('visible'));
          observer.disconnect();
        }
      });
    } catch (error) {
      document.documentElement.classList.remove('motion-ready');
      reveals.forEach(el => el.classList.add('visible'));
    }
  }

  // On-page service selector — no backend request is made by this demo.
  document.querySelectorAll('.stage-book').forEach(link => {
    link.addEventListener('click', () => {
      if (service) service.value = link.getAttribute('data-service') || '';
      requestBox?.classList.remove('active');
    });
  });
  requestBtn?.addEventListener('click', () => {
    if (!service || !requestCopy || !requestBox) return;
    requestCopy.textContent = 'Здравствуйте! Я хочу записаться на услугу «' +
      service.value + '» по методу резонансной релаксации. Подскажите, пожалуйста, ближайшие варианты записи.';
    requestBox.classList.add('active');
  });
  copyBtn?.addEventListener('click', async () => {
    if (!requestCopy?.textContent) return;
    try {
      await navigator.clipboard.writeText(requestCopy.textContent);
      copyBtn.textContent = 'Скопировано';
    } catch (e) {
      const field = document.createElement('textarea');
      field.value = requestCopy.textContent;
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      copyBtn.textContent = copied ? 'Скопировано' : 'Выделите и скопируйте сообщение';
    }
  });
})();
