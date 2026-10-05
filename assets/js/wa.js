// Oculta el botón flotante cuando el footer entra en pantalla (no tapa su contenido).
(() => {
  const wa = document.querySelector('.wa');
  const footer = document.querySelector('.sl-footer');
  if (!wa || !footer || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => wa.classList.toggle('is-hidden', e.isIntersecting)).observe(footer);
})();
