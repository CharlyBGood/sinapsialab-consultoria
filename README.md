# SinapsiaLab — Starter Pack Digital

Página del Starter Pack Digital: una charla sobre el emprendimiento del cliente + sitio de una página con WhatsApp, guía para emprendedores y plan de acción personalizado.

- **Publicada en:** https://starter.sinapsialab.com/ (Cloudflare Pages, deploy automático al hacer push a `main`)
- **Única fuente de verdad.** La página que vivía en `sinapsialab-astro` (`/starter/`) fue eliminada. En ese repo sobrevive solo la tarjeta del home (`src/components/StarterPackSection.tsx` + `src/components/starter/content.ts`), que enlaza acá. Si cambia el precio o el texto del hero, hay que replicarlo en ese `content.ts`.

Sitio estático, **sin build**: se sirve tal cual desde la raíz. Estilo oscuro "retro" alineado con `sinapsialab-astro` (ver `DESIGN.md` de ese repo).

## Estructura

```
index.html
assets/css/tokens.css      colores, sombras retro y tipografías (única fuente de verdad)
assets/css/base.css        reset y tipografía de documento
assets/css/layout.css      ancho de página, secciones, grilla
assets/css/components.css  cada bloque de la página, en orden de aparición
assets/css/print.css       ajustes para imprimir a PDF
assets/js/year.js          año del footer
assets/js/reserva.js       panel de reserva y llamada al endpoint de pago
```

Para cambiar un color, tocar `tokens.css` y nada más. El footer de marca sigue la convención compartida con los demás sitios de SinapsiaLab (spec: `footer-sinapsialab.html`): si cambia, hay que actualizarlo en todos.

## Flujo de reserva y pago

```
starter.sinapsialab.com
  CTA "Reservar la consultoría" → panel a pantalla completa (datos del cliente)
  → resumen → "Ir a pagar"
        │  POST (JSON, sin precio)
        ▼
pfff.sinapsialab.com/api/public/starter-reserve        (repo expense-tracker-react)
  valida → crea orden de pago pendiente (tipo `orden_pago`, a nombre de Charly)
  → crea preferencia de pago → devuelve { ok, url }
        │  redirección
        ▼
checkout de pago (externo)
        │  notificación del pago aprobado
        ▼
pfff.sinapsialab.com/api/payments/webhook
  marca la orden pagada → crea el RECIBO → lo envía por mail (Resend, con PDF)
  usando `documents.receipt_message` como texto del mail
        │  back_url
        ▼
starter.sinapsialab.com/?reserva=ok&status=…   → panel "¡Gracias por tu reserva!"
```

Puntos a recordar:

- **El precio vive solo en el servidor** (`PRODUCT.price` en `starter-reserve.js`). El front nunca manda importes.
- **Ninguna página nombra la pasarela de pago.** Las órdenes salen con medio de pago "Pago online".
- `reserva.js` solo valida datos, muestra el resumen y llama al endpoint. Si el endpoint falla muestra un mensaje; los 400 y 429 traen su propio texto.
- El estado de `?reserva=ok&status=…` es solo para mostrar un mensaje. La confirmación real del pago la hace el webhook en el servidor.
- El endpoint solo acepta pedidos del origen `https://starter.sinapsialab.com` (y `localhost` para desarrollo). Probar desde un `file://` o desde otro dominio falla por CORS a propósito.
- Anti-abuso: campo trampa `website`, tope de 20 reservas por hora y reutilización del link si el mismo email reserva dos veces en 30 minutos.

### Variables de entorno (Vercel, proyecto de Pfff!)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `STARTER_OWNER_USER_ID` | Sí | Id del usuario de Supabase al que se asignan las órdenes |
| `STARTER_PRICE_OVERRIDE` | No — **solo pruebas** | Cobra ese importe en vez del real |
| `STARTER_ALLOWED_ORIGINS` | No | Lista separada por comas; por defecto `https://starter.sinapsialab.com` |
| `STARTER_BACK_URL` | No | Adónde vuelve el cliente tras pagar |
| `STARTER_COMPANY_NAME` | No | Nombre que aparece como emisor; por defecto `SinapsiaLab` |
| `STARTER_REPLY_TO` | No | Email al que le llega la respuesta del cliente al recibo (Reply-To) |
| `STARTER_NOTIFY_EMAIL` | No | Casilla donde te avisa cuando se paga una reserva; sin esto no hay aviso |

### Pendiente antes del lanzamiento

Mientras `STARTER_PRICE_OVERRIDE` esté cargada, el Starter Pack cobra ese monto de prueba. Antes de anunciar:

1. Borrar `STARTER_PRICE_OVERRIDE` en Vercel.
2. Redeployar manualmente (las variables solo se aplican a deploys nuevos).
3. Crear una reserva y abrir el link: el checkout tiene que mostrar el precio real. **No pagarlo.**
4. Borrar las órdenes pendientes y los recibos de prueba en Pfff!.

## Al editar

- Textos: mantener sincronizada la tarjeta del home (`content.ts` en `sinapsialab-astro`).
- Tono: cercano pero neutral, sin exagerar; evitar "gratis" y "regalo" y las formulaciones en negativo.
- Accesibilidad: inputs de 16px (evita el zoom en iOS), `focus-visible`, respeto de `prefers-reduced-motion`.
