// Año del footer, calculado en el navegador: la página queda publicada
// de forma permanente y no puede envejecer con un año escrito a mano.
document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('sl-year');
  if (el) el.textContent = new Date().getFullYear();
});
