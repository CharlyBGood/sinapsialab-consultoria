// Formulario de reserva — SIMULACIÓN.
//
// Hoy valida, arma el payload y muestra el resumen. Todavía no llama a ningún
// endpoint: cuando exista `api/public/starter-reserve` en Pfff!, se reemplaza
// el bloque marcado más abajo por el fetch y se usa la URL que devuelva.

(function () {
  // --- Modal: el CTA abre la reserva como las secciones de sinapsialab.com ---
  var abrir = document.getElementById('rsv-open');
  var modal = document.getElementById('rsv-modal');
  var ultimoFoco = null;

  function abrirModal() {
    if (!modal) return;
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var primero = modal.querySelector('input, select, a[href], button');
    if (primero) primero.focus();
  }

  function cerrarModal() {
    if (!modal || modal.classList.contains('is-closing')) return;
    var terminar = function () {
      modal.hidden = true;
      modal.classList.remove('is-closing');
      document.body.style.overflow = '';
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    };
    var sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sinAnimacion) return terminar();
    modal.classList.add('is-closing');
    modal.addEventListener('animationend', terminar, { once: true });
  }

  if (abrir && modal) {
    abrir.addEventListener('click', abrirModal);

    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-rsv-close')) cerrarModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) cerrarModal();
    });

    // Tab queda encerrado dentro de la card mientras el modal está abierto
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = modal.querySelectorAll('button, input, select, a[href], textarea');
      var visibles = [];
      for (var i = 0; i < f.length; i++) {
        if (f[i].offsetParent !== null) visibles.push(f[i]);
      }
      if (!visibles.length) return;
      var primero = visibles[0];
      var ultimo = visibles[visibles.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    });
  }

  var form = document.getElementById('rsv-form');
  if (!form) return;

  var done = document.getElementById('rsv-done');
  var datos = document.getElementById('rsv-datos');
  var error = document.getElementById('rsv-error');
  var back = document.getElementById('rsv-back');
  var intro = document.getElementById('rsv-intro');

  var MATERIAL = {
    flyer: 'Manda un flyer',
    fotos: 'Manda hasta 5 fotos',
    nada: 'Todavía no tiene material',
  };

  function fallo(msg) {
    error.textContent = msg;
    error.hidden = false;
  }

  function limpiarTelefono(v) {
    return v.replace(/[^\d+]/g, '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    error.hidden = true;

    var d = new FormData(form);
    var reserva = {
      nombre: (d.get('nombre') || '').trim(),
      negocio: (d.get('negocio') || '').trim(),
      email: (d.get('email') || '').trim(),
      whatsapp: limpiarTelefono((d.get('whatsapp') || '').trim()),
      material: d.get('material') || 'flyer',
      producto: 'starter-pack-digital',
      precio: 70000,
      moneda: 'ARS',
    };

    if (!reserva.nombre || !reserva.negocio) return fallo('Completá tu nombre y el de tu negocio.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reserva.email)) return fallo('Revisá el email: parece incompleto.');
    if (reserva.whatsapp.replace(/\D/g, '').length < 8) return fallo('Revisá el WhatsApp: faltan dígitos.');

    datos.innerHTML = '';
    [
      ['Nombre', reserva.nombre],
      ['Negocio', reserva.negocio],
      ['Email', reserva.email],
      ['WhatsApp', reserva.whatsapp],
      ['Material', MATERIAL[reserva.material]],
    ].forEach(function (par) {
      var dt = document.createElement('dt');
      dt.textContent = par[0];
      var dd = document.createElement('dd');
      dd.textContent = par[1];
      datos.appendChild(dt);
      datos.appendChild(dd);
    });

    // --- Acá va el llamado real cuando exista el endpoint ---
    // fetch('https://pfff.sinapsialab.com/api/public/starter-reserve', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(reserva),
    // })
    //   .then(r => r.json())
    //   .then(r => { document.getElementById('rsv-pagar').href = r.url; });
    console.log('[reserva] payload que se enviará al endpoint:', reserva);
    // --------------------------------------------------------

    form.hidden = true;
    if (intro) intro.hidden = true;
    done.hidden = false;
    if (modal) modal.scrollTop = 0;
  });

  back.addEventListener('click', function () {
    done.hidden = true;
    if (intro) intro.hidden = false;
    form.hidden = false;
    if (modal) modal.scrollTop = 0;
  });
})();
