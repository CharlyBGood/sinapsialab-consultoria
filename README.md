# SinapsiaLab — Starter Pack Digital

Página del Starter Pack Digital de SinapsiaLab: una charla sobre el emprendimiento del cliente + sitio de una página con WhatsApp, guía para emprendedores y plan de acción personalizado.

Sitio estático, sin build. Se sirve tal cual desde la raíz.

```
index.html
assets/css/tokens.css      colores y tipografías (única fuente de verdad)
assets/css/base.css        reset y tipografía de documento
assets/css/layout.css      ancho de página, secciones, grilla
assets/css/components.css  cada bloque de la página, en orden de aparición
assets/css/print.css       ajustes para imprimir a PDF
assets/js/year.js          año del footer
```

Para cambiar un color, tocar `tokens.css` y nada más. El footer de marca sigue la
convención compartida con los demás sitios de SinapsiaLab (spec: `footer-sinapsialab.html`):
si cambia, hay que actualizarlo en todos.

- Versión integrada al sitio: https://sinapsialab.com/starter/ (repo `sinapsialab-astro`, textos en `src/components/starter/content.ts`)
- Esta versión: estilo claro, independiente, para publicar en un subdominio propio.

Al editar textos, mantener sincronizadas las dos versiones.
