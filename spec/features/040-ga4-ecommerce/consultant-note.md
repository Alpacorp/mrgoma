# Medición ecommerce en GA4 — nota para la consultora

> Mr. Goma Tires · Feature `040-ga4-ecommerce` · Noviembre 2026

## Qué cambió

Hasta ahora GA4 recibía parte del embudo **sin datos de producto** y no recibía
ni `view_item` ni `add_payment_info` ni `purchase`. Desde esta versión, los seis
eventos recomendados de ecommerce de GA4 llegan con productos, valor y moneda.

Las ventas existían: Vercel Web Analytics (medición propia del servidor)
registró ~17 compras con tarjeta (~US$3.800) entre agosto y el 10 de noviembre
de 2026. GA4 no las veía porque el evento `purchase` solo se enviaba a Vercel.

## Los eventos

| Evento              | Cuándo se dispara                                                                                       | Datos clave                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `view_item`         | Al abrir la ficha de una llanta (también si es la primera página de la visita, p. ej. desde Google).    | 1 producto, `value` = precio                                  |
| `add_to_cart`       | Al pulsar "Add to Cart" en la tarjeta del catálogo (escritorio o móvil) o en la ficha.                  | el producto añadido                                           |
| `begin_checkout`    | Al abrir la página `/checkout` con productos en el carrito, se llegue por donde se llegue.              | todo el carrito, `value` = subtotal                           |
| `add_shipping_info` | Cuando el servidor **acepta** el pedido tras elegir envío a domicilio o recogida en tienda.            | carrito + `shipping_tier` = `delivery` o `pickup`             |
| `add_payment_info`  | Justo antes de enviar al cliente al formulario de pago de Stripe.                                      | carrito + `payment_type` = `card`                             |
| `purchase`          | En la página de confirmación, cuando Stripe confirma el pago. Una sola vez por pedido.                 | `transaction_id`, `value`, `tax`, `shipping`, `currency`, productos |

Cada producto lleva siempre los mismos campos, en todos los eventos:

| Campo GA4       | Contenido                                     | Ejemplo                                    |
| --------------- | --------------------------------------------- | ------------------------------------------ |
| `item_id`       | ID interno de la llanta (igual en todo el flujo) | `432917`                                |
| `item_name`     | Título que ve el cliente                      | `New Arroyo Tamarock AT XL 245/75/17`      |
| `item_brand`    | Marca                                         | `Arroyo`                                   |
| `item_category` | Condición                                     | `New` / `Used`                             |
| `item_variant`  | Medida                                        | `245/75/17`                                |
| `price`         | Precio unitario antes de impuestos (USD)      | `175`                                      |
| `quantity`      | Unidades                                      | `1`                                        |

Ningún evento contiene datos personales (nombre, correo, teléfono, dirección
ni datos de pago).

## Límites que hay que tener en cuenta al leer los datos

1. **GA4 verá menos compras que las reales.** GA4 solo mide a quien acepta las
   cookies y no usa bloqueador. En agosto de 2026 medimos que GA4 veía
   aproximadamente **1 de cada 5 visitantes**. La cifra de referencia de pedidos
   reales sigue siendo la de Vercel (servidor) y Stripe. Dentro de ~28 días
   compartiremos el cociente GA4/Vercel para `purchase`.
2. **`add_payment_info` significa "enviado al formulario de tarjeta"**, no
   "tarjeta ingresada". El formulario de pago es de Stripe y el sitio no puede
   ver lo que pasa dentro.
3. **Cambio de criterio el [fecha de publicación].** Dos eventos se cuentan en
   otro momento desde esa fecha; leer las series con cuidado al cruzarla:
   - `begin_checkout`: antes se contaba al pulsar "Checkout" en el carrito;
     ahora, al abrir `/checkout` con productos (incluye entradas directas).
   - `add_shipping_info`: antes se contaba al pulsar el botón aunque el pedido
     fuera rechazado (p. ej. llanta ya vendida); ahora, solo si el servidor
     acepta el pedido. Es esperable que baje un poco.
4. **Ruta de WhatsApp** (solo si se desactiva el pago con tarjeta): envía
   `add_shipping_info` pero nunca `add_payment_info` ni `purchase`, porque no se
   puede confirmar que el pedido se pagó.
5. **Impuestos:** el `value` de `purchase` es el total cobrado (incluye
   impuestos); `tax` va aparte. El precio de cada producto es antes de
   impuestos.
6. **Moneda:** siempre USD, aunque el cliente elija pagar en otra moneda en
   Stripe.

## Pruebas y tráfico de desarrollo

- Las pruebas del equipo (sitio en local o entornos de prueba) se envían a GA4
  marcadas con `debug_mode`. Desde el **10 de noviembre de 2026** la propiedad
  tiene activo el filtro de datos **"Developer Traffic"** (Tráfico de
  desarrolladores, Excluir): todo evento marcado así **no entra en los
  informes**; solo se ve en DebugView mientras ocurre. Las ventas reales del
  sitio en producción nunca llevan esa marca y cuentan normalmente.
- **Excluir manualmente dos compras de prueba del 10 de noviembre de 2026**,
  hechas antes de crear el filtro (los filtros no son retroactivos):
  - `transaction_id` `cs_test_b1YxWrSQKGuwudAl8nwJ0A6cI6jMcboNxUQIOCAArj2HCrE1My1Bk4eW8G` — US$353,10
  - `transaction_id` `cs_test_a18cQUxsNK5Hu4Ip5ZvZcPdFOKHMkjtr3ysehA6OpQ3GMWVGxneSGV2rcN` — US$186,38

  Todo `transaction_id` que empiece por `cs_test_` es una prueba; los pedidos
  reales empiezan por `cs_live_`. Ese mismo día hay también eventos de prueba
  del resto del embudo (`view_item`, `add_to_cart`, `begin_checkout`, etc.) de
  una sola sesión desde Colombia.

## Configuración en GA4 (hecha el 10 nov 2026)

- Moneda de la propiedad: USD. ✓
- `purchase` marcado como **evento clave** (conversión). ✓
- Filtro de datos "Developer Traffic" activo. ✓
- Informes donde verlo: _Monetización → Compras de ecommerce_ y
  _Adquisición → Adquisición de tráfico_ (ingresos por canal, incl. Organic
  Search).
