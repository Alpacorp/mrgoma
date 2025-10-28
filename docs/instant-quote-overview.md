# Instant Quote – Explicación y guía técnica

A alto nivel, se creó y evolucionó la página “Instant Quote” para que los usuarios pidan una cotización rápida, y se reforzó el backend con validaciones y protecciones ligeras sin fricción. Además, se realizaron mejoras visuales/UX, se corrigieron rutas y se ajustaron íconos del footer.

## 1) Arquitectura y patrón del proyecto
- App Router (Next.js 15) con la carpeta agrupada `(pages)` para mantener el mismo entorno visual (Header, Footer, Providers) en todas las páginas.
- Estado global de la medida del neumático con `SelectedFiltersContext` (para compartir width/sidewall/diameter entre componentes).
- API Routes en `src/app/api/*` para manejar validaciones y reenvío al webhook de n8n sin exponerlo al cliente.

Esto respeta el patrón existente del proyecto (layout global, secciones UI, hooks y contextos) y evita duplicar lógica.

## 2) Página /instant-quote (formulario por pasos)
Estructura en 3 segmentos con “cards” (archivo clave: `src/app/(pages)/instant-quote/container/InstantQoute/InstantQoute.tsx`):

1) Tire & Vehicle
   - Tire Condition (New, Like‑New, Used)
   - Tire Brand (dropdown desde `/api/brands`)
   - Car Brand (lista curada estática)
   - Model Year (validación 1980 → año actual + 1)
   - Tire Size al final usando `SearchByText` en modo “solo input” (sin CTA ni navegación)

2) Where should we send your quote?
   - Name, Email, Phone
   - Botón “Get My Quote” con spinner durante el envío

3) Aviso de éxito
   - Banner más grande (~2x) con el mensaje: “Thanks! Our team is finding your best price. You’ll get your quote in minutes.”

Accesibilidad/UX:
- Foco automático en el primer campo inválido
- Mensajes de error claros, aria‑atributos, scroll a banners de feedback
- Validaciones en tiempo real: email y teléfono; año con límites

## 3) Componente SearchByText en modo input‑only
Archivo: `src/app/ui/components/SearchByText/SearchByText.tsx`.
- Props añadidas para reutilizar diseño sin CTA ni navegación:
  - `showButton={false}` oculta el botón “Search Tires”.
  - `enableSubmit={false}` evita que Enter navegue a resultados.
- Sigue formateando la medida y poblando el `SelectedFiltersContext` (width/sidewall/diameter).

## 4) Envío de datos y API /api/instant-quote
- Cliente envía: `size`, `width`, `sidewall`, `diameter`, `tireBrand` (antes `brand`), `carBrand`, `year`, `condition`, `name`, `email`, `phone`, `submittedAt`, `source`.
- Servidor valida campos requeridos, agrega metadatos (`_meta`: ip, userAgent, referer, url, submittedAt, source) y reenvía al webhook n8n (`N8N_WEBHOOK_URL`).
- Extracción de IP desde headers (`x-forwarded-for`/`x-real-ip`).

Archivos:
- Cliente: `src/app/(pages)/instant-quote/container/InstantQoute/InstantQoute.tsx`
- Servidor: `src/app/api/instant-quote/route.ts`

## 5) Protecciones ligeras (seguridad)
- Allow‑list de Origin/Referer: sólo acepta peticiones desde orígenes configurados (`NEXT_PUBLIC_BASE_URL`, `BASE_URL_PROD`, `BASE_URL_DEV` y el host actual). Otros devuelven 403.
- Rate limiting por IP (en memoria): máx. 5 solicitudes en 5 minutos por IP; excedente devuelve 429.
- Honeypot: input oculto en el formulario; si se rellena, la API responde `ok: true` pero NO reenvía a n8n.

Notas:
- Para producción grande, mover el rate limit a un store compartido (Redis/Upstash) o añadir CAPTCHA selectivo si hay abuso.

## 6) Correcciones de rutas y errores
- Ruta “qoute” → “quote”, con redirecciones para no romper enlaces existentes.
- Se solucionó un bug de recursión en `/instant-quote/page.tsx` que causaba “Maximum call stack size exceeded”. Ahora la página retorna el contenedor real.
- Arreglo de linter por comilla sin escapar: se usó `We&#39;ll`.

## 7) Footer: redes sociales e íconos correctos
- Agregadas X y TikTok con URLs proporcionadas.
- SVGs reemplazados por versiones “brand‑correct” (estilo Simple Icons) con `fill="currentColor"` para heredar color/hover.

Archivos: `Footer.tsx`, `SocialIcons.tsx`, tipos en `footer-section.d.ts`.

## 8) Plantilla de email (n8n)
- Plantilla HTML más robusta y alineada con el sitio: paleta, estructura compatible con clientes de correo (tablas + estilos inline), preheader, CTA, badges, enlaces clicables y fecha “America/Bogota”.

## 9) Variables de entorno relevantes
- `N8N_WEBHOOK_URL`: URL del workflow en n8n que recibe los datos.
- `NEXT_PUBLIC_BASE_URL`, `BASE_URL_PROD`, `BASE_URL_DEV`: para el allow‑list del backend.

Archivo de referencia: `.env` (y `.env.template`).

## 10) Cómo probar rápidamente
1. Flujo normal: completa el formulario (incluido Tire Size como `255/55/18`) y envía. Debe llegar al webhook y verás el banner de éxito.
2. Honeypot: en la consola del navegador, `document.getElementById('hp').value = 'bot'` y envía; la API responde ok pero no reenvía a n8n.
3. Rate limit: envía 6 veces en 5 minutos desde la misma IP; a partir de la 6ª, responde 429.
4. Allow‑list: intenta mandar la petición desde un dominio no permitido (cambiando Origin/Referer con una herramienta) → 403.

## Dónde tocar si quieres ajustar
- Copys, orden y estilos del formulario: `InstantQoute.tsx`.
- Lógica del input de tamaño: `SearchByText.tsx` y utilidades `handleChangeInput.ts`.
- Validaciones y seguridad del backend: `src/app/api/instant-quote/route.ts` (parámetros `RATE_MAX`, `RATE_WINDOW_MS` y lista de orígenes permitidos).
- Redes del Footer: `Footer.tsx` y `SocialIcons.tsx`.

## Mejoras futuras sugeridas
- Extraer en componentes reutilizables: `SectionCard`, `TireBrandSelect` (asincrónico), `CarBrandSelect` (estático o API).
- Crear `/api/car-brands` para lista centralizada y traducible.
- Añadir búsqueda en los dropdowns si la lista crece (combobox accesible).
- Esquema de validación en servidor (Zod), normalización de email/phone y pequeñas demoras en errores para frenar bots.
