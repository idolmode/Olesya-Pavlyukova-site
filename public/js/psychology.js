/**
 * Psychology and Coaching — approved interactive page.
 * JS enhances dialogs and navigation; the full page stays visible without JS.
 * Booking is a demonstrator, not a form submission.
 */
(() => {
  'use strict';

  const menuToggle = document.getElementById('ps-mobile-menu-button');
  const menu = document.getElementById('ps-mobile-menu');
  menuToggle?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('open') || false;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '×' : '☰';
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = '☰';
  }));

  const book = document.getElementById('ps-book-dialog');
  const zoom = document.getElementById('ps-certificate-dialog');
  const picked = document.getElementById('ps-picked-service');
  const zoomImage = document.getElementById('ps-certificate-image');
  const caption = document.getElementById('ps-cert-caption');
  const copyButton = document.querySelector('#page-psychology .ps-copy-service');
  let chosen = '';

  document.querySelectorAll('.ps-book').forEach(button => button.addEventListener('click', () => {
    chosen = button.dataset.service || 'Психологическое консультирование';
    if (picked) picked.textContent = chosen;
    if (copyButton) copyButton.textContent = 'Скопировать название услуги';
    book?.showModal();
  }));

  document.querySelectorAll('#page-psychology .ps-modal-close').forEach(button =>
    button.addEventListener('click', () => button.closest('dialog')?.close()));

  copyButton?.addEventListener('click', async () => {
    const message = 'Здравствуйте! Хочу записаться на услугу: ' + chosen + '.';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(message);
      copyButton.textContent = 'Текст скопирован ✓';
    } catch (_) {
      // Clipboard may be unavailable on file:// or outside HTTPS.
      // Show a selectable message instead of falsely claiming it was copied.
      copyButton.textContent = message;
    }
  });

  const sourceImages = {
    psy: document.querySelector('[data-zoom="psy"] img'),
    coach: document.querySelector('[data-zoom="coach"] img')
  };
  const imageTitles = {
    psy: 'Сертификат специалиста PSY2.0',
    coach: 'Сертификат «Мастер-коуч»'
  };
  document.querySelectorAll('#page-psychology [data-zoom]').forEach(button =>
    button.addEventListener('click', () => {
      const key = button.dataset.zoom;
      const source = sourceImages[key];
      if (!source || !zoomImage || !zoom) return;
      zoomImage.src = source.currentSrc || source.src;
      if (caption) caption.textContent = imageTitles[key] || '';
      zoom.showModal();
    }));

  [book, zoom].forEach(dialog => dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  }));
})();
