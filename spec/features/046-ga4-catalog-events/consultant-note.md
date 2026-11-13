# Eventos de catálogo, carrito y búsqueda en GA4 — nota para la consultora

> Mr. Goma Tires · Feature `046-ga4-catalog-events` · Noviembre 2026
> Complementa la nota de la feature `040-ga4-ecommerce`.

## Sobre lo que encontraron en las pruebas

`add_to_cart`, `begin_checkout` y `add_shipping_info` sin `currency`, `value`
ni `items`: es lo que envía hoy el sitio publicado, que todavía corre el código
anterior a la feature 040. La 040 ya los envía completos (con productos, valor
y moneda), igual que `view_item`, `add_payment_info` y `purchase`. Se verá en
cuanto se publique.

`purchase` lleva `transaction_id` (id de la sesión de Stripe), `currency`,
`value`, `tax`, `shipping` e `items`; se envía solo cuando Stripe confirma el
pago y una sola vez por pedido. Se puede validar en un entorno de pruebas con
tarjetas de prueba de Stripe: esos eventos llegan con `debug_mode` y se ven en
DebugView sin entrar en los informes.

## Eventos nuevos

| Evento | Cuándo se dispara | Datos clave |
| --- | --- | --- |
| `view_item_list` | Cada vez que un listado muestra un resultado nuevo: al cargar, al cambiar de página, de filtro o de orden. El mismo resultado no se repite. | `item_list_id`, `item_list_name`, todas las llantas mostradas con su `index` (posición en todo el resultado: la página 2 empieza en 21) |
| `select_item` | Al abrir la ficha de una llanta desde un listado (foto o título de la tarjeta), o un juego desde el chat. "Add to Cart" de la tarjeta **no** es `select_item`. | la llanta (o las llantas del juego), lista e `index` |
| `view_cart` | Al abrir el carrito lateral con llantas. En `/checkout` no se envía (allí va `begin_checkout`). | todo el carrito, `value`, `currency` |
| `remove_from_cart` | Cuando el cliente quita una llanta o un juego completo. Si el sitio quita una llanta porque se vendió, **no** se envía. (El botón "Remove the {ciudad} tire" del checkout desapareció con la feature 047: ya se puede recoger en cualquier tienda.) | las llantas quitadas, `value`, `currency` |
| `search` | Cuando una búsqueda por medida llega al catálogo: buscador por medida o por texto del home, o los filtros de medida de `/tires`. Solo un **cambio de medida** cuenta como búsqueda nueva. | `search_term` (`225/45R17`, o parcial: `225/45`), `tire_width`, `tire_profile`, `tire_rim`; `tire_brand` y `tire_condition` si se eligieron |

Los productos usan exactamente los mismos campos que la 040 (`item_id`,
`item_name`, `item_brand`, `item_category` = condición, `item_variant` =
medida, `price`, `quantity`), así que una llanta se puede seguir desde el
listado hasta la compra.

## Listados (`item_list_id` / `item_list_name`)

| Id | Nombre | Dónde |
| --- | --- | --- |
| `catalog` | All tires | `/tires` (con o sin filtros) |
| `new_tires` | New tires | `/tires/new` |
| `used_tires` | Used tires | `/tires/used` |
| `brand_tires` | Brand: {marca} | `/tires/brands/…` |
| `size_tires` | Size: {medida} | `/tires/size/…` |
| `chat_sets` | Chat sets | tarjetas de juegos del asistente |

## Parámetros de los filtros

| Evento | Parámetros nuevos | Se mantiene |
| --- | --- | --- |
| `apply_home_filters` | `tire_brand` (marcas separadas por coma), `tire_condition` | `value` (cuántos filtros) |
| `filter_apply` | `filter_group` (`brand`, `condition`, `width`…), `filter_value` (`Michelin`…) | `label` (`brand:Michelin`) |

**Un filtro de medida en `/tires` envía dos eventos**: `filter_apply` (el clic
en el filtro) y `search` (la búsqueda que resulta). Son dos hechos distintos,
no un duplicado.

## Dimensiones personalizadas a registrar en GA4

De ámbito evento: `tire_width`, `tire_profile`, `tire_rim`, `tire_brand`,
`tire_condition`, `filter_group`, `filter_value`. (`search_term`,
`item_list_id`, `item_list_name` e `index` ya son parámetros que GA4 reconoce.)

Ningún evento lleva datos personales (nombre, correo, teléfono, dirección ni
datos de pago). Como en la 040, GA4 solo recibe eventos de quien acepta las
cookies; Vercel Analytics recibe un resumen sin productos de todos.

## Cambio posterior (feature 047, 13 nov 2026)

`ai_chat_sets_shown` lleva `outcome` = `found`, `any_city` o `smaller`. El
valor `other_city` ya no existe: los juegos pueden mezclar llantas de Miami y
Orlando y se recogen en cualquier tienda. `any_city` significa que el cliente
pidió una ciudad, no había un juego con todas las llantas allí, y se le
mostraron los mejores de las dos ciudades.
