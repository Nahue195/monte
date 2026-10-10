# Monte — diseño

Fecha: 2026-10-09 · Autor: Nahuel Martinez · Estado: aprobado en conversación, pendiente de revisión escrita

## 1. Qué es y para qué

Monte es una marca **ficticia** de café de especialidad tostado en Rosario, con tienda online propia. Es el segundo proyecto conceptual del portfolio de Nahuel (el primero es Pulso) y tiene que mostrar en una sola pieza **identidad de marca, e-commerce hecho de cero y búsqueda "inteligente"**.

**Lo que pidió el usuario**
- Todo hecho de cero: catálogo, carrito y checkout propios, sin Shopify ni otra plataforma.
- Buscador en lenguaje natural con un **intérprete propio, sin IA** (opción 1).
- Alcance compacto: inicio, tienda, ficha, carrito, checkout simulado y confirmación.
- Dirección visual **B · Tostado**: fondo espresso, naranja intenso, tipografía condensada enorme.

**Supuestos (no discutidos explícitamente, heredados de Pulso)**
- Demo sin cuentas de usuario.
- Interfaz en español y en inglés; precios en pesos argentinos.
- Proyecto en `C:\monte`, repo propio, deploy en Vercel a cargo del usuario.

**Criterio de éxito**
Alguien que llega desde el portfolio puede recorrer la tienda, escribir "algo frutal para filtro, no muy ácido", entender por qué le recomiendan cada café, agregarlo al carrito y completar un checkout de prueba, sin errores, sin cobros y sin que se envíe ningún dato.

**Fuera de alcance**
Cuentas, pagos reales, backend, base de datos, suscripciones, guías de preparación, panel de administración, IA, emails.

## 2. Stack y restricciones globales

- Next.js 16.2.3 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS 4. Antes de escribir código de Next, leer la guía correspondiente en `node_modules/next/dist/docs/` (esta versión tiene cambios incompatibles con versiones anteriores; `middleware` ahora es `proxy.ts`).
- Tests con `node --test "lib/**/*.test.ts"` (type stripping nativo de Node), sin frameworks de test.
- Verificación en navegador con Playwright (`playwright-core` + Edge instalado), como en Pulso.
- **Sin backend y sin variables de entorno obligatorias.** El sitio se puede deployar gratis. La única variable opcional es `NEXT_PUBLIC_PORTFOLIO_URL` (link "Ver portfolio"; por defecto `#`).
- Fuentes: Archivo Black (títulos) y Archivo (texto) con `next/font/google`.
- Íconos: `lucide-react`.
- Sin imágenes externas: los paquetes de café se dibujan con CSS.
- Dependencias de runtime: `next`, `react`, `react-dom`, `lucide-react`. Nada más salvo justificación escrita.

## 3. Rutas

La raíz `/` redirige a `/es` o `/en` según `Accept-Language` (en `proxy.ts`, conservando el query string). Las rutas son iguales en los dos idiomas; solo cambian los textos.

| Ruta | Render | Contenido |
|---|---|---|
| `/[lang]` | estático | Inicio: hero, buscador protagonista con frases de ejemplo, franja crema con la historia, 3 cafés destacados |
| `/[lang]/shop` | estático + cliente | Buscador, filtros rápidos (método, tueste), grilla de resultados. La búsqueda vive en `?q=` |
| `/[lang]/coffee/[slug]` | estático (`generateStaticParams`) | Ficha: paquete, origen, finca, proceso, variedades, perfil de sabor (barras 1–5), métodos, elección de molienda y peso, cantidad, "Agregar al carrito" |
| `/[lang]/checkout` | cliente | Formulario simulado; con carrito vacío muestra mensaje + link a la tienda |
| `/[lang]/order` | cliente | Confirmación del último pedido; sin pedido muestra "No hay un pedido reciente" |

Un `slug` inexistente o un `lang` que no sea `es`/`en` devuelven `notFound()`. Hay una página 404 propia con la estética de Monte.

Encabezado común: logo MONTE, Tienda, Origen (ancla a la historia en el inicio), cambio de idioma (conserva ruta y query) y botón del carrito con contador. Pie con "Proyecto conceptual de Nahuel Martinez · Ver portfolio".

## 4. Catálogo

`data/coffees.ts` exporta 12 cafés validados por tipos (y por un test que chequea rangos, slugs únicos y precios positivos).

```ts
type NoteTag = "frutal" | "citrico" | "frutos-rojos" | "chocolate" | "caramelo" | "floral" | "nueces" | "especiado";
type Method = "filtro" | "espresso" | "prensa" | "moka" | "cold-brew";
type Roast = "claro" | "medio" | "oscuro";
type Level = 1 | 2 | 3 | 4 | 5;

type Coffee = {
  slug: string;
  name: string;            // "Huila"
  country: { es: string; en: string };
  region: string;
  farm: string;
  process: { es: string; en: string };
  varieties: string[];
  roast: Roast;
  notes: { es: string[]; en: string[] };   // texto visible: "durazno, panela, mandarina"
  noteTags: NoteTag[];                       // lo que entiende el buscador
  acidity: Level; body: Level; sweetness: Level;
  methods: Method[];
  decaf: boolean;
  prices: { "250": number; "1000": number }; // ARS enteros
  color: string;                             // color del paquete
  story: { es: string; en: string };         // 1–2 oraciones
  featured?: boolean;
};
```

| slug | Origen | Proceso | Tueste | Notas (tags) | A/C/D | Métodos | 250 g / 1 kg |
|---|---|---|---|---|---|---|---|
| huila | Colombia | lavado | medio | durazno, panela, mandarina (frutal, caramelo, citrico) | 3/3/4 | filtro, espresso | 14.900 / 50.900 |
| sidama | Etiopía | lavado | claro | jazmín, limón, bergamota (floral, citrico) | 5/2/3 | filtro, cold-brew | 17.200 / 58.900 |
| cerrado | Brasil | natural | medio | frutos rojos, cacao (frutos-rojos, chocolate) | 2/4/4 | espresso, filtro, prensa | 12.800 / 43.500 |
| cajamarca | Perú | lavado | medio | chocolate con leche, nuez, caramelo (chocolate, nueces, caramelo) | 2/3/4 | espresso, moka, prensa | 11.900 / 40.500 |
| guji | Etiopía | natural | claro | arándano, frutilla, vino (frutos-rojos, frutal) | 4/3/5 | filtro, cold-brew | 18.500 / 62.900 |
| narino | Colombia | honey | claro | manzana verde, miel, lima (frutal, caramelo, citrico) | 4/2/4 | filtro | 16.400 / 55.900 |
| mogiana | Brasil | natural | oscuro | chocolate amargo, avellana (chocolate, nueces) | 1/5/3 | espresso, moka | 10.900 / 36.900 |
| antigua | Guatemala | lavado | medio | cacao, especias, naranja (chocolate, especiado, citrico) | 3/4/3 | espresso, filtro, prensa | 15.600 / 53.000 |
| tarrazu | Costa Rica | honey | medio | caramelo, durazno, cacao (caramelo, frutal, chocolate) | 3/3/5 | filtro, espresso | 16.900 / 57.500 |
| kirinyaga | Kenia | lavado | claro | grosella, pomelo (frutos-rojos, citrico) | 5/3/3 | filtro | 19.800 / 67.500 |
| santa-barbara | Honduras | lavado | oscuro | chocolate, melaza, clavo (chocolate, caramelo, especiado) | 2/4/3 | espresso, moka, cold-brew | 11.400 / 38.800 |
| huila-decaf | Colombia | descafeinado al agua | medio | chocolate, caramelo (chocolate, caramelo) | 2/3/4 | espresso, filtro, prensa | 13.900 / 47.500 |

Destacados del inicio: huila, guji, mogiana.

## 5. Buscador (`lib/search/`)

Funciones puras, sin dependencias, con tests. Corre en el navegador mientras se escribe (sin debounce visible; con `useDeferredValue`).

### 5.1 Pipeline

1. **`normalize(text)`** → minúsculas, sin tildes (NFD + quitar diacríticos), signos → espacio, números con separador de miles unificados ("15.000", "15 mil", "15k" → `15000`), tokens.
2. **`recognize(tokens)`** → recorre los tokens buscando en el diccionario frases de 3, 2 y 1 palabras (gana la más larga). Tolerancia a typos con distancia de Levenshtein: 0 para palabras de ≤ 3 letras, 1 para 4–6, 2 para ≥ 7; solo se aplica a palabras del diccionario de 1 palabra, y nunca a palabras de una lista de exclusión (`algo`, `para`, `que`, `caro`, `cara`, `rico`, `con`, `muy`, …) para evitar falsos positivos como "caro" → "claro". Cada coincidencia produce un **término** (`{ kind, value, span }`).
3. **`applyModifiers(terms, tokens)`** → mira hasta 2 tokens antes de cada término de atributo o nota:
   - negación ("no", "nada", "sin", "not", "no muy", "without") sobre una nota → exclusión;
   - sobre un atributo: "no muy X" → X ≤ 3; "nada X" / "sin X" → X ≤ 2; "poco X" → X ≤ 2;
   - intensificador ("muy", "bien", "re", "super", "very") → X ≥ 4; sin modificador, "X" → X ≥ 3.
   - "suave"/"liviano"/"smooth"/"mild" → cuerpo ≤ 2 (es una entrada propia del diccionario, no una negación).
4. **`buildQuery(terms)`** → `Query = { notes: NoteTag[]; excludeNotes: NoteTag[]; methods: Method[]; roasts: Roast[]; origins: string[]; levels: { acidity?, body?, sweetness?: {min?, max?} }; maxPrice?: number; decaf?: boolean; understood: Term[] }`.
5. **`rank(coffees, query)`** → `Result[] = { coffee, score (0–1), matches: Match[] }`, ordenado por score desc y luego por nombre.

### 5.2 Diccionario (`lib/search/lexicon.ts`)

Cada entrada: `{ phrases: string[] (es + en, normalizadas), term }`. Mínimo:

- **Notas:** frutal/frutoso/fruta/fruity → `frutal` (expande a frutal + citrico + frutos-rojos); citrico/limon/naranja/citrus → `citrico`; frutos rojos/frutilla/arandano/berries → `frutos-rojos`; chocolate/chocolatoso/cacao/chocolatey → `chocolate`; caramelo/dulce de leche/panela/miel/caramel → `caramelo`; floral/flores/jazmin/floral → `floral`; nuez/nueces/avellana/almendra/nutty → `nueces`; especiado/especias/canela/spicy → `especiado`.
- **Métodos:** filtro/filtrado/v60/chemex/pour over/drip → `filtro`; espresso/expreso/cafetera de bar → `espresso`; prensa/prensa francesa/french press → `prensa`; moka/italiana/bialetti → `moka`; cold brew/frio/iced → `cold-brew`.
- **Tueste:** claro/suave de tueste/light roast → `claro`; medio/medium → `medio`; oscuro/intenso/fuerte/dark → `oscuro`.
- **Atributos:** acido/acidez/brillante/bright/acidic → `acidity`; cuerpo/cremoso/denso/body → `body`; dulce/dulzor/sweet → `sweetness`; amargo/bitter → se interpreta como `roast: oscuro`.
- **Origen:** colombia/colombiano, etiopia/etiope/ethiopia, brasil/brasilero/brazil, peru/peruano, guatemala, costa rica, kenia/kenya, honduras, africa (→ etiopia + kenia), centroamerica (→ guatemala + costa rica + honduras).
- **Precio:** "menos de N", "hasta N", "debajo de N", "under N", "barato"/"economico"/"cheap" (→ maxPrice 13000), siempre sobre el precio de 250 g.
- **Descafeinado:** "descafeinado", "decaf", "sin cafeina" (frase de 2 palabras: se reconoce antes que la negación "sin").

### 5.3 Puntaje

Pesos: notas 3, método 3, tueste 2, origen 2, cada atributo 2.

- **Filtros duros** (sacan el café de la lista): `excludeNotes`, `maxPrice`, `decaf` (si se pidió descafeinado, solo decaf; si no se pidió, decaf aparece igual).
- **Notas:** coincidencia si el café tiene al menos un tag pedido (con la expansión de `frutal`).
- **Atributos:** dentro del rango → peso completo; a distancia 1 → mitad; más lejos → 0.
- `score = puntos obtenidos / puntos posibles`.
- Resultados = cafés que pasan los filtros duros y tienen score > 0. Si son menos de 3, se completa hasta 3 con los demás cafés que pasan los filtros duros, por score, marcados "cercano".
- Si ningún café pasa los filtros duros: aviso "Ningún café cumple todo" y los 3 de mayor score ignorando los filtros duros, cada uno con lo que no cumple marcado ✗.
- Cada `Match` = `{ label: {es,en}, ok: boolean }` para mostrar "frutal ✓ · filtro ✓ · acidez alta ✗".

### 5.4 Casos borde

- Búsqueda vacía → catálogo completo ordenado por destacados y nombre, sin marcas de coincidencia.
- Nada reconocido → catálogo completo + aviso "No entendí del todo, probá con sabores o métodos" + 3 sugerencias clickeables.
- Términos contradictorios ("claro y oscuro") → se aceptan los dos (OR dentro de la misma categoría).
- Texto de más de 200 caracteres → se recorta a 200.
- Funciona igual con la página en ES o EN (el diccionario es bilingüe; las etiquetas se muestran en el idioma de la página).

### 5.5 Tests

- Tabla de ~30 frases → `Query` esperada (ES, EN, typos, negaciones, precios, descafeinado, vacías, sin sentido).
- Ranking con un catálogo de prueba de 4 cafés: orden, filtros duros, coincidencia parcial, completar hasta 3.

## 6. Carrito (`lib/cart.ts`)

- `CartLine = { slug, grind: "grano" | "filtro" | "espresso" | "prensa", size: "250" | "1000", qty: 1–10 }`.
- Funciones puras: `addLine`, `setQty`, `removeLine`, `priceCart(lines, catalog) → { lines con precio, subtotal, shipping, total, freeShippingGap }`.
- Misma combinación slug + molienda + peso suma cantidad (tope 10).
- Envío: gratis desde $40.000 de subtotal; si no, $4.500. Retiro en tostadero → $0 (se aplica en el checkout).
- Persistencia en `localStorage["monte:cart:v1"]`, validada al leer; si está corrupta o un slug ya no existe, se descarta esa parte. Si `localStorage` falla, el carrito funciona en memoria.
- Precios siempre desde el catálogo, nunca desde lo guardado.
- UI: panel lateral con `<dialog>` nativo (pantalla completa en celular), foco atrapado, Escape cierra y devuelve el foco al botón que lo abrió. El contador del encabezado se actualiza al agregar, con un aviso para lectores de pantalla ("Agregado: Huila, 250 g").
- Sincroniza entre pestañas con el evento `storage`.

## 7. Checkout simulado (`lib/checkout.ts` + `/checkout`)

Campos y validación (funciones puras con tests, mensajes ES/EN):

| Campo | Regla |
|---|---|
| email | formato válido |
| teléfono | 8–15 dígitos (se ignoran espacios, guiones, `+`) |
| entrega | `envio` o `retiro` |
| nombre | 2–60 caracteres (solo si envío) |
| dirección | 4–100 caracteres (solo si envío) |
| ciudad | 2–60 caracteres (solo si envío) |
| provincia | una de las 24 jurisdicciones (solo si envío) |
| código postal | 4 dígitos o `A1234ABC` (solo si envío) |
| tarjeta | 13–19 dígitos y Luhn válido |
| vencimiento | `MM/AA`, mes 01–12, no vencida respecto de hoy |
| CVV | 3 o 4 dígitos |

- Cartel visible: "Demo: no se cobra nada. Usá 4242 4242 4242 4242". Los datos de tarjeta nunca salen del navegador ni se guardan.
- Validación al salir de cada campo y al confirmar; mensajes junto al campo (`aria-describedby`), foco al primer error.
- Al confirmar: espera simulada de ~1,2 s con el botón deshabilitado ("Procesando…"), se genera `MNT-` + 6 caracteres (A–Z sin O/I, 2–9), se guarda `{ id, lines con precios, totales, entrega, fecha }` en `localStorage["monte:order:v1"]` (sin datos de tarjeta ni contacto), se vacía el carrito y se navega a `/order`.
- `/order` muestra número, ítems, total, y "Tostamos el próximo martes; te llega entre 2 y 4 días hábiles después" (fecha calculada).
- Carrito vacío en `/checkout` → mensaje + link a la tienda.

## 8. Diseño visual

- **Tema único oscuro.** Tokens en `:root`: `--bg #17110d`, `--panel #221a14`, `--line #3d2e25`, `--ink #f3e9dc`, `--muted #b9a898`, `--hot #ff6a2b`, `--cream #efe4d3`, `--ok`, `--bad` (verde y rojo suaves para las marcas de coincidencia). Ajustar tonos donde haga falta para AA; un test (`lib/contrast.ts`) mide los pares texto/fondo usados.
- Títulos en Archivo Black en mayúsculas, muy grandes en el hero (clamp). Texto en Archivo.
- Paquete de café en CSS: rectángulo con borde superior dentado, color del café y etiqueta con nombre/origen/proceso.
- Franjas crema para la historia y para bloques de contraste.
- Movimiento: entrada del hero, apertura del carrito, reordenamiento de resultados (FLIP simple o View Transitions si la guía de Next 16 lo recomienda). Todo apagado con `prefers-reduced-motion`.
- Mobile first; en celular todo en una columna y el buscador arriba en la tienda.
- `aria-live="polite"` con la cantidad de resultados ("3 cafés para vos").

## 9. Idiomas

`dictionaries/es.ts` y `dictionaries/en.ts` con los mismos keys (test que lo verifica). Formato de precio con `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })` en ambos idiomas (`en` usa `en-US` para el separador pero sigue siendo ARS). `<html lang>` según la ruta. Metadatos (título, descripción, Open Graph) por idioma.

## 10. Verificación

- `npm test` (lógica: buscador, carrito, checkout, contraste, diccionarios, catálogo).
- `npm run lint`, `tsc --noEmit`, `npm run build`.
- Playwright contra `next start`, desktop y 375 px:
  1. `/` redirige a `/es` o `/en`.
  2. Desde el inicio, tocar una frase de ejemplo lleva a `/shop?q=…` con resultados y marcas de coincidencia.
  3. Escribir "chocolatoso para espresso" reordena resultados; "xyz" muestra el aviso.
  4. Abrir un café, elegir molienda y peso, agregar; el contador sube; el panel muestra el ítem.
  5. Cambiar cantidad y ver el total; recargar y que el carrito siga.
  6. Checkout: confirmar vacío muestra errores y enfoca el primero; completar con 4242… lleva a `/order` con número `MNT-…`; el carrito queda vacío.
  7. `/order` sin pedido y `/checkout` sin carrito muestran sus mensajes.
  8. Cambio de idioma conserva la ruta y la búsqueda.
  9. Teclado: abrir y cerrar el carrito con Escape devuelve el foco.
  10. Sin errores en consola.

## 11. Después del build

- El usuario crea el repo en GitHub (URL sin token), pushea y conecta el proyecto en Vercel.
- Se define `NEXT_PUBLIC_PORTFOLIO_URL`.
- Se agrega Monte al portfolio (`data/projects.ts`, `type: "concept"`).
