// Reserva del Starter Pack Digital.
//
// Flujo: CTA → panel a pantalla completa → el cliente completa y revisa sus datos
// → "Ir a pagar" llama al endpoint público de Pfff!, que crea la orden y devuelve
// el link del checkout → se lo redirige ahí. Al volver (?reserva=ok) se muestra
// el resultado. El precio NO viaja desde acá: lo fija el servidor.

(function () {
  var ENDPOINT = 'https://pfff.sinapsialab.com/api/public/starter-reserve';
  // Búsqueda de dominio .com: solo consulta disponibilidad (no registra nada)
  var DOMAIN_ENDPOINT = 'https://pfff.sinapsialab.com/api/public/starter-domain';
  var TITULO = 'Reservar la consultoría';

  var abrir = document.getElementById('rsv-open');
  var modal = document.getElementById('rsv-modal');
  var titulo = document.getElementById('rsv-modal-title');
  var form = document.getElementById('rsv-form');
  var intro = document.getElementById('rsv-intro');
  var done = document.getElementById('rsv-done');
  var result = document.getElementById('rsv-result');
  var resultText = document.getElementById('rsv-result-text');
  var datos = document.getElementById('rsv-datos');
  var error = document.getElementById('rsv-error');
  var payError = document.getElementById('rsv-pay-error');
  var pagar = document.getElementById('rsv-pagar');
  var back = document.getElementById('rsv-back');
  var dominioInput = document.getElementById('rsv-dominio');
  var dominioBtn = document.getElementById('rsv-dominio-check');
  var dominioEstado = document.getElementById('rsv-dominio-status');

  if (!modal || !form || !dominioInput || !dominioBtn || !dominioEstado) return;

  var ultimoFoco = null;
  var reserva = null;
  var pagando = false;

  var MATERIAL = {
    flyer: 'Manda un flyer',
    fotos: 'Manda hasta 5 fotos',
    nada: 'Todavía no tiene material',
  };

  // --- Estados del panel: 'form' | 'resumen' | 'resultado' ---
  function mostrar(estado) {
    form.hidden = estado !== 'form';
    intro.hidden = estado !== 'form';
    done.hidden = estado !== 'resumen';
    result.hidden = estado !== 'resultado';
    modal.scrollTop = 0;
  }

  // --- Abrir / cerrar ---
  function abrirModal(estado) {
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    mostrar(estado || 'form');
    var primero = modal.querySelector(
      estado === 'resultado' ? '[data-rsv-close]' : 'input:not([tabindex="-1"]), select, button'
    );
    if (primero) primero.focus();
  }

  function cerrarModal() {
    if (modal.classList.contains('is-closing')) return;
    var terminar = function () {
      modal.hidden = true;
      modal.classList.remove('is-closing');
      document.body.style.overflow = '';
      titulo.textContent = TITULO;
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return terminar();
    modal.classList.add('is-closing');
    modal.addEventListener('animationend', terminar, { once: true });
  }

  if (abrir) abrir.addEventListener('click', function () { abrirModal('form'); });

  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-rsv-close')) cerrarModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) cerrarModal();
  });

  // Tab queda encerrado dentro del panel mientras está abierto
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = modal.querySelectorAll('button, input, select, a[href], textarea');
    var visibles = [];
    for (var i = 0; i < f.length; i++) {
      if (f[i].offsetParent !== null && f[i].tabIndex !== -1) visibles.push(f[i]);
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

  // --- Dominio .com: el cliente lo verifica antes de reservar ---
  // Solo un dominio confirmado como disponible viaja con la reserva; si cambia el texto, se verifica de nuevo.
  var dominioVerificado = null;

  function estadoDominio(texto, tipo) {
    error.hidden = true; // el aviso de "verificá el dominio" ya no corresponde
    dominioEstado.textContent = texto;
    dominioEstado.hidden = !texto;
    if (tipo) dominioEstado.setAttribute('data-kind', tipo);
  }

  dominioInput.addEventListener('input', function () {
    dominioVerificado = null;
    estadoDominio('');
  });

  function verificarDominio() {
    var escrito = dominioInput.value.trim();
    if (!escrito) return estadoDominio('Escribí el nombre que querés (por ejemplo: minegocio.com).', 'bad');

    dominioBtn.disabled = true;
    dominioBtn.textContent = 'Verificando…';
    estadoDominio('');

    fetch(DOMAIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dominio: escrito }),
    })
      .then(function (r) {
        return r.json().then(
          function (body) { return { ok: r.ok, status: r.status, body: body }; },
          function () { return { ok: false, status: r.status, body: {} }; }
        );
      })
      .then(function (res) {
        // Si mientras tanto cambió el texto, la respuesta ya no corresponde
        if (dominioInput.value.trim() !== escrito) return;
        var b = res.body || {};
        if (res.ok && b.dominio && typeof b.disponible === 'boolean') {
          dominioInput.value = b.dominio;
          if (b.disponible) {
            dominioVerificado = b.dominio;
            estadoDominio('✓ ' + b.dominio + ' está disponible.', 'ok');
          } else {
            estadoDominio(b.dominio + ' ya está registrado. Probá con otro nombre.', 'bad');
          }
          return;
        }
        var claro = res.status === 400 || res.status === 429 || res.status === 503;
        estadoDominio(
          claro && b.error
            ? b.error
            : 'No pudimos verificarlo ahora. Probá de nuevo o dejalo vacío y lo definimos en la charla.',
          'bad'
        );
      })
      .catch(function () {
        if (dominioInput.value.trim() === escrito) {
          estadoDominio('No pudimos conectar. Revisá tu conexión y probá de nuevo.', 'bad');
        }
      })
      .then(function () {
        dominioBtn.disabled = false;
        dominioBtn.textContent = 'Verificar';
      });
  }

  dominioBtn.addEventListener('click', verificarDominio);
  dominioInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    verificarDominio();
  });

  // --- Paso 1: validar y mostrar el resumen (todavía no se llama a nada) ---
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

    if (dominioInput.value.trim() && !dominioVerificado) {
      return fallo('Verificá que el dominio esté disponible, o dejá el campo vacío y lo definimos en la charla.');
    }

    var d = new FormData(form);
    reserva = {
      nombre: (d.get('nombre') || '').trim(),
      negocio: (d.get('negocio') || '').trim(),
      email: (d.get('email') || '').trim(),
      whatsapp: limpiarTelefono((d.get('whatsapp') || '').trim()),
      material: d.get('material') || 'flyer',
      dominio: dominioVerificado || '',
      website: d.get('website') || '', // campo trampa: un humano lo deja vacío
    };

    if (!reserva.nombre || !reserva.negocio) return fallo('Completá tu nombre y el de tu negocio.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reserva.email)) return fallo('Revisá el email: parece incompleto.');
    if (reserva.whatsapp.replace(/\D/g, '').length < 8) return fallo('Revisá el teléfono: faltan dígitos.');

    datos.innerHTML = '';
    [
      ['Nombre', reserva.nombre],
      ['Negocio', reserva.negocio],
      ['Email', reserva.email],
      ['Teléfono', reserva.whatsapp],
      ['Material', MATERIAL[reserva.material]],
      ['Dominio', reserva.dominio || 'Lo definimos en la charla'],
    ].forEach(function (par) {
      var dt = document.createElement('dt');
      dt.textContent = par[0];
      var dd = document.createElement('dd');
      dd.textContent = par[1];
      datos.appendChild(dt);
      datos.appendChild(dd);
    });

    payError.hidden = true;
    mostrar('resumen');
  });

  back.addEventListener('click', function () {
    mostrar('form');
  });

  // --- Paso 2: "Ir a pagar" → endpoint → checkout ---
  function botonListo() {
    pagando = false;
    pagar.disabled = false;
    pagar.textContent = 'Ir a pagar';
  }

  function falloPago(msg) {
    payError.textContent = msg;
    payError.hidden = false;
    botonListo();
  }

  pagar.addEventListener('click', function () {
    if (!reserva || pagando) return;
    pagando = true;
    pagar.disabled = true;
    pagar.textContent = 'Preparando el pago…';
    payError.hidden = true;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reserva),
    })
      .then(function (r) {
        return r.json().then(
          function (body) { return { ok: r.ok, status: r.status, body: body }; },
          function () { return { ok: false, status: r.status, body: {} }; }
        );
      })
      .then(function (res) {
        if (res.ok && res.body && res.body.url) {
          window.location.href = res.body.url;
          return;
        }
        // 400/429 traen un mensaje pensado para mostrar; el resto, uno genérico
        var claro = res.status === 400 || res.status === 429;
        falloPago(
          claro && res.body.error
            ? res.body.error
            : 'No pudimos preparar el pago. Probá de nuevo en un momento o escribime por WhatsApp.'
        );
      })
      .catch(function () {
        falloPago('No pudimos conectar. Revisá tu conexión y probá de nuevo.');
      });
  });

  // Al volver con el botón "atrás" del navegador la página puede quedar congelada
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) botonListo();
  });

  // --- Al volver del checkout (?reserva=ok) se muestra el resultado ---
  // El estado viene en la URL solo para mostrar un mensaje: el recibo y la
  // confirmación real los maneja el servidor, no esta página.
  var params = new URLSearchParams(window.location.search);
  if (params.get('reserva') === 'ok') {
    var estado = (params.get('status') || params.get('collection_status') || '').toLowerCase();

    if (estado === 'approved') {
      titulo.textContent = '¡Gracias por tu reserva!';
      resultText.textContent =
        'Recibimos tu pago. En unos minutos te llega el recibo por mail, con los próximos pasos. Después te escribo por WhatsApp para coordinar la charla.';
    } else if (estado === 'pending' || estado === 'in_process') {
      titulo.textContent = 'Tu pago está en proceso';
      resultText.textContent =
        'Cuando se acredite te llega el recibo por mail y te escribo por WhatsApp para coordinar la charla.';
    } else {
      titulo.textContent = 'Tu reserva';
      resultText.textContent =
        'Si completaste el pago, el recibo te llega por mail. Si no pudiste completarlo, podés volver a intentarlo cuando quieras.';
    }

    abrirModal('resultado');
    window.history.replaceState(null, '', window.location.pathname);
  }
})();
