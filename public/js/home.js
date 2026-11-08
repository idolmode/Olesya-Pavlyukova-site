// Homepage interactions. All visual choices are preserved from approved preview.
const diplomaImages = [
  "assets/diploma_altairegional_university_full.jpg",
  "assets/diploma_business_retraining_full.jpg",
  "assets/diploma_psy20_full.jpg"
];
const mobileToggle = document.querySelector('.navbtn');
const mobileMenu = document.querySelector('.mobilelinks');
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }));
}
const diplomaDialog = document.getElementById('diploma-dialog');
const diplomaDisplay = document.getElementById('diploma-dialog-image');
if (diplomaDialog && diplomaDisplay) {
  document.querySelectorAll('[data-diploma]').forEach(button => {
    button.addEventListener('click', () => {
      const i = Number(button.getAttribute('data-diploma'));
      if (!Number.isInteger(i) || !diplomaImages[i]) return;
      diplomaDisplay.src = diplomaImages[i];
      if (diplomaDialog.showModal) diplomaDialog.showModal();
      else diplomaDialog.setAttribute('open', '');
    });
  });
  const closeDialog = () => diplomaDialog.close ? diplomaDialog.close() : diplomaDialog.removeAttribute('open');
  diplomaDialog.querySelector('.dialog-close')?.addEventListener('click', closeDialog);
  diplomaDialog.addEventListener('click', event => {
    if (event.target === diplomaDialog) closeDialog();
  });
  diplomaDialog.addEventListener('close', () => { diplomaDisplay.removeAttribute('src'); });
}
