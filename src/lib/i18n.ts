export type SiteLanguage = "en" | "es";

const STORAGE_KEY = "larper-language";
const textOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();
const translatedTextNodes = new Set<Text>();
const translatedElements = new Set<Element>();

let language: SiteLanguage = "en";
let observer: MutationObserver | null = null;
let applying = false;

const ES: Record<string, string> = {
  "Larper Clothes — The Students' Second-Hand Store":
    "Larper Clothes — La tienda de segunda mano de los estudiantes",
  "A one-page store for second-hand clothes from university students in Cancún. Every item has a clear price, size, color, condition, and history.":
    "Una tienda de una sola página para ropa de segunda mano de estudiantes universitarios en Cancún. Cada prenda tiene precio, talla, color, estado e historia claros.",
  Home: "Inicio",
  Inventory: "Inventario",
  Products: "Productos",
  "About Us": "Nosotros",
  Benefits: "Beneficios",
  Contact: "Contacto",
  "Main navigation": "Navegación principal",
  "Mobile navigation": "Navegación móvil",
  "Shopping bag": "Bolsa de compra",
  "Open menu": "Abrir menú",
  "Close menu": "Cerrar menú",
  "Switch to Spanish": "Cambiar a español",
  "campus · id 003.201": "campus · id 003.201",
  "Welcome to my store!": "¡Bienvenido a mi tienda!",
  "Larper's campus closet.": "El armario universitario de Larper.",
  "Welcome to my store! Larper's campus closet sells second-hand clothes.":
    "¡Bienvenido a mi tienda! El armario universitario de Larper vende ropa de segunda mano.",
  "Featured clothes": "Prendas destacadas",
  "Previous item": "Prenda anterior",
  "Next item": "Prenda siguiente",
  "View item": "Ver prenda",
  "Loading item": "Cargando prenda",
  "Current inventory": "Inventario actual",
  "What is available today": "Lo que está disponible hoy",
  "There are eight second-hand pieces in this collection. There are jackets, T-shirts, sweatshirts, and pants. There is only one unit of every style. There are clear details about each item's color, size, condition, price, and previous use.":
    "Hay ocho prendas de segunda mano en esta colección. Hay chamarras, playeras, sudaderas y pantalones. Solo hay una unidad de cada estilo. Hay información clara sobre el color, la talla, el estado, el precio y el uso anterior de cada prenda.",
  "Inventory summary": "Resumen del inventario",
  "There are eight pieces.": "Hay ocho prendas.",
  "There is one of each.": "Hay una de cada una.",
  "There are only student listings.": "Solo hay publicaciones de estudiantes.",
  "There is a clear price for every item.": "Hay un precio claro para cada prenda.",
  "The students' current edit": "La selección actual de los estudiantes",
  "This collection comes from students in our university community. Open a product to read the garment's full history and condition.":
    "Esta colección proviene de estudiantes de nuestra comunidad universitaria. Abre un producto para leer la historia completa y el estado de la prenda.",
  "Our store was a small campus idea.": "Nuestra tienda era una pequeña idea universitaria.",
  "These clothes were part of a student's daily life.":
    "Esta ropa formaba parte de la vida diaria de un estudiante.",
  "Every piece was checked before it entered the store.":
    "Cada prenda fue revisada antes de entrar a la tienda.",
  "Now it is ready for another student's story.":
    "Ahora está lista para la historia de otro estudiante.",
  "ABOUT US": "NOSOTROS",
  "Scroll to inspect": "Desliza para observar",
  "Benefits · featured item": "Beneficios · prenda destacada",
  "This navy blue piece is comfortable and useful in cool weather. It gives a quality garment another period of use. The store checks every item's condition and presents its history clearly. This system helps students buy distinctive clothes at a fair price.":
    "Esta prenda azul marino es cómoda y útil en clima fresco. Le da otro periodo de uso a una prenda de calidad. La tienda revisa el estado de cada artículo y presenta su historia con claridad. Este sistema ayuda a los estudiantes a comprar ropa distintiva a un precio justo.",
  "View products": "Ver productos",
  "Contact the": "Contacta a la",
  "student store.": "tienda estudiantil.",
  "The store's email is hello@larperchlothes.mx. The owner's phone is +52 998 123 4567. Send us a message about an item's size, condition, or campus delivery.":
    "El correo de la tienda es hello@larperchlothes.mx. El teléfono del propietario es +52 998 123 4567. Envíanos un mensaje sobre la talla, el estado o la entrega en el campus de una prenda.",
  "Email address": "Correo electrónico",
  "your@email.com": "tu@correo.com",
  "Send a request": "Enviar una solicitud",
  "Message received": "Mensaje recibido",
  "Secure checkout": "Pago seguro",
  "Condition checked": "Estado revisado",
  "Shipping across Mexico": "Envíos a todo México",
  Store: "Tienda",
  Project: "Proyecto",
  Help: "Ayuda",
  "Student sellers": "Vendedores estudiantes",
  "Item histories": "Historias de las prendas",
  "Size guide": "Guía de tallas",
  Shipping: "Envíos",
  "The students' second-hand clothing store in Cancún. Every item has one owner, one history, and one available unit.":
    "La tienda de ropa de segunda mano de los estudiantes en Cancún. Cada prenda tiene un propietario, una historia y una unidad disponible.",
  "Student project.": "Proyecto estudiantil.",
  "Back to top": "Volver arriba",
  "Moving to another section": "Cambiando a otra sección",
  "NEW TO STORE": "NUEVA EN TIENDA",
  "ONE OF ONE": "PIEZA ÚNICA",
  "STUDENT PICK": "ELECCIÓN ESTUDIANTIL",
  AVAILABLE: "DISPONIBLE",
  "Second-hand oversized jacket": "Chamarra oversize de segunda mano",
  "Second-hand layered T-shirt": "Playera en capas de segunda mano",
  "Second-hand quarter-zip sweatshirt": "Sudadera de cierre corto de segunda mano",
  "Second-hand graphic T-shirt": "Playera gráfica de segunda mano",
  "Second-hand leather jacket": "Chamarra de cuero de segunda mano",
  "Second-hand denim pants": "Pantalones de mezclilla de segunda mano",
  "Second-hand cargo pants": "Pantalones cargo de segunda mano",
  "Second-hand sports T-shirt": "Playera deportiva de segunda mano",
  Jackets: "Chamarras",
  "T-shirts": "Playeras",
  Sweatshirts: "Sudaderas",
  Pants: "Pantalones",
  "Vintage brown / black": "Café vintage / negro",
  "Black / white": "Negro / blanco",
  "Navy blue": "Azul marino",
  Black: "Negro",
  "Aged brown": "Café envejecido",
  "Black / red": "Negro / rojo",
  "Faded black": "Negro desgastado",
  "Vintage brown": "Café vintage",
  black: "negro",
  white: "blanco",
  red: "rojo",
  "Product view": "Vista del producto",
  "Worn view": "Vista con modelo",
  enlarge: "ampliar",
  "· enlarge": "· ampliar",
  LOOK: "VISTA",
  "Product views": "Vistas del producto",
  "SECOND LIFE / ONE OF ONE": "SEGUNDA VIDA / PIEZA ÚNICA",
  "WORN": "USADA",
  "AGAIN.": "DE NUEVO.",
  "Selected construction.": "Confección seleccionada.",
  "Ready for another story.": "Lista para otra historia.",
  "Original character.": "Carácter original.",
  "No two pieces alike.": "No hay dos prendas iguales.",
  "WHY THIS PIECE": "POR QUÉ ESTA PRENDA",
  Inspected: "Revisada",
  "Quality checked by our team": "Calidad revisada por nuestro equipo",
  "One of one": "Pieza única",
  "Only this piece is available": "Solo esta prenda está disponible",
  "Campus ready": "Lista para el campus",
  "Local and nationwide delivery": "Entrega local y nacional",
  "ONE PIECE. ANOTHER CHAPTER.": "UNA PRENDA. OTRO CAPÍTULO.",
  Size: "Talla",
  "Hide details": "Ocultar detalles",
  "View full details": "Ver todos los detalles",
  "View the item": "Ver la prenda",
  "View the item worn": "Ver la prenda puesta",
  ITEM: "PRENDA",
  "Available size": "Talla disponible",
  "Available color": "Color disponible",
  "In stock · ships in 2–4 business days": "Disponible · envío en 2–4 días hábiles",
  "Add to bag": "Añadir a la bolsa",
  "Select a size": "Selecciona una talla",
  "Protected purchase": "Compra protegida",
  "Zoom out": "Alejar",
  "Zoom in": "Acercar",
  Reset: "Restablecer",
  "Pinch or use the controls to zoom · drag to explore · double tap to switch":
    "Pellizca o usa los controles para ampliar · arrastra para explorar · toca dos veces para alternar",
  "This second-hand jacket is vintage brown and black, and the jacket's size is M. The jacket's price is $1,450 MXN. These printed panels and that full zipper are in good condition. A student bought it two years ago and wore it on campus. It was the student's favorite winter jacket, but it was not used last year.":
    "Esta chamarra de segunda mano es café vintage y negra, y la talla de la chamarra es M. El precio de la chamarra es $1,450 MXN. Estos paneles estampados y ese cierre completo están en buen estado. Un estudiante la compró hace dos años y la usó en el campus. Era la chamarra de invierno favorita del estudiante, pero no se usó el año pasado.",
  "This second-hand T-shirt is black and white, and the T-shirt's size is L. Its price is $850 MXN. These white sleeves are soft, and that front print is still clear. Its first owner bought it in 2023 and used it at concerts. It was an expensive piece when it was new, but the sleeves were always comfortable.":
    "Esta playera de segunda mano es negra y blanca, y la talla de la playera es L. Su precio es $850 MXN. Estas mangas blancas son suaves y ese estampado frontal todavía está claro. Su primer propietario la compró en 2023 y la usó en conciertos. Era una prenda costosa cuando era nueva, pero las mangas siempre fueron cómodas.",
  "This second-hand sweatshirt is navy blue, and the sweatshirt's size is M. The sweatshirt's price is $980 MXN. This embroidered patch is clean, and these cuffs are in very good condition. A student bought it for a school trip and wore it during one cold semester. It was warm and useful, and there were no broken parts.":
    "Esta sudadera de segunda mano es azul marino, y la talla de la sudadera es M. El precio de la sudadera es $980 MXN. Este parche bordado está limpio y estos puños están en muy buen estado. Un estudiante la compró para un viaje escolar y la usó durante un semestre frío. Era cálida y útil, y no tenía partes rotas.",
  "This second-hand T-shirt is black, and the T-shirt's size is M. The T-shirt's price is $550 MXN. That blue Arch Linux logo is bright, and these seams are strong. Its previous owner bought it in 2022 and wore it in the computer lab. It was a simple daily shirt, and it was easy to combine with jeans.":
    "Esta playera de segunda mano es negra, y la talla de la playera es M. El precio de la playera es $550 MXN. Ese logotipo azul de Arch Linux es brillante y estas costuras son resistentes. Su propietario anterior la compró en 2022 y la usó en el laboratorio de computación. Era una playera sencilla para uso diario y era fácil de combinar con mezclilla.",
  "This second-hand leather jacket is aged brown, and the jacket's size is L. The jacket's price is $1,890 MXN. These leather panels have natural marks, and that metal zipper works well. A student found it in a local vintage shop and wore it for two years. It was his graduation jacket, and the shoulders were already slightly worn.":
    "Esta chamarra de cuero de segunda mano es café envejecido, y la talla de la chamarra es L. El precio de la chamarra es $1,890 MXN. Estos paneles de cuero tienen marcas naturales y ese cierre metálico funciona bien. Un estudiante la encontró en una tienda vintage local y la usó durante dos años. Era su chamarra de graduación y los hombros ya estaban ligeramente desgastados.",
  "These second-hand denim pants are black and red, and the pants' size is 32. Their price is $1,100 MXN. These wide legs are strong, and that red patch gives the pair a clear identity. A design student bought them in 2023 and changed the stitching by hand. They were part of a class project, and they were only worn a few times.":
    "Estos pantalones de mezclilla de segunda mano son negros y rojos, y la talla de los pantalones es 32. Su precio es $1,100 MXN. Estas piernas anchas son resistentes y ese parche rojo les da una identidad clara. Un estudiante de diseño los compró en 2023 y cambió las costuras a mano. Formaban parte de un proyecto de clase y solo se usaron unas cuantas veces.",
  "These second-hand cargo pants are faded black, and the pants' size is 30. The pants' price is $1,050 MXN. These utility pockets are useful, and that washed finish is part of the original look. Their first owner bought them for photography work and used them around campus. They were practical and durable, but they were not used this semester.":
    "Estos pantalones cargo de segunda mano son negros desgastados, y la talla de los pantalones es 30. El precio de los pantalones es $1,050 MXN. Estos bolsillos utilitarios son útiles y ese acabado lavado forma parte del aspecto original. Su primer propietario los compró para trabajos de fotografía y los usó en el campus. Eran prácticos y duraderos, pero no se usaron este semestre.",
  "This second-hand sports T-shirt is black and white, and the T-shirt's size is L. The T-shirt's price is $720 MXN. This Everlast graphic is in good condition, and these sleeves keep their relaxed shape. A student bought it at a boxing event and wore it for weekend training. It was part of the student's sports wardrobe, but it was not worn last year.":
    "Esta playera deportiva de segunda mano es negra y blanca, y la talla de la playera es L. El precio de la playera es $720 MXN. Este gráfico de Everlast está en buen estado y estas mangas conservan su forma relajada. Un estudiante la compró en un evento de boxeo y la usó para entrenar los fines de semana. Formaba parte del guardarropa deportivo del estudiante, pero no se usó el año pasado.",
  "This second-hand jacket is vintage brown and black, and the jacket's size is M.":
    "Esta chamarra de segunda mano es café vintage y negra, y la talla de la chamarra es M.",
  "This second-hand T-shirt is black and white, and the T-shirt's size is L.":
    "Esta playera de segunda mano es negra y blanca, y la talla de la playera es L.",
  "This second-hand sweatshirt is navy blue, and the sweatshirt's size is M.":
    "Esta sudadera de segunda mano es azul marino, y la talla de la sudadera es M.",
  "This second-hand T-shirt is black, and the T-shirt's size is M.":
    "Esta playera de segunda mano es negra, y la talla de la playera es M.",
  "This second-hand leather jacket is aged brown, and the jacket's size is L.":
    "Esta chamarra de cuero de segunda mano es café envejecido, y la talla de la chamarra es L.",
  "These second-hand denim pants are black and red, and the pants' size is 32.":
    "Estos pantalones de mezclilla de segunda mano son negros y rojos, y la talla de los pantalones es 32.",
  "These second-hand cargo pants are faded black, and the pants' size is 30.":
    "Estos pantalones cargo de segunda mano son negros desgastados, y la talla de los pantalones es 30.",
  "This second-hand sports T-shirt is black and white, and the T-shirt's size is L.":
    "Esta playera deportiva de segunda mano es negra y blanca, y la talla de la playera es L.",
};

function translateString(value: string): string {
  const direct = ES[value];
  if (direct) return direct;
  return value
    .replace(/^View details for (.+)$/, "Ver detalles de $1")
    .replace(/^Open a detailed view of (.+)$/, "Abrir una vista detallada de $1")
    .replace(/^Detailed image of (.+)$/, "Imagen detallada de $1")
    .replace(/^Detailed view of (.+)$/, "Vista detallada de $1")
    .replace(/^Close product details$/, "Cerrar detalles del producto")
    .replace(/^Close detailed image$/, "Cerrar imagen detallada")
    .replace(/^Save (.+)$/, "Guardar $1")
    .replace(/^Remove (.+) from saved items$/, "Quitar $1 de prendas guardadas")
    .replace(/^(.+) worn by a model$/, "$1 puesta por un modelo")
    .replace(/^Benefits · featured item (.+)$/, "Beneficios · prenda destacada $1")
    .replace(
      /^© (\d{4}) Larper Clothes\. Student project\.$/,
      "© $1 Larper Clothes. Proyecto estudiantil.",
    );
}

function translateTextNode(node: Text) {
  const current = node.data;
  const known = textOriginals.get(node);
  if (language === "en") {
    if (known !== undefined && current !== known) node.data = known;
    return;
  }
  if (known !== undefined && current === translateWithWhitespace(known)) return;
  const original = known !== undefined && current === known ? known : current;
  const translated = translateWithWhitespace(original);
  if (translated === current) return;
  textOriginals.set(node, original);
  translatedTextNodes.add(node);
  node.data = translated;
}

function translateWithWhitespace(value: string): string {
  if (value.trim() === "") return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  return `${leading}${translateString(core)}${trailing}`;
}

function translateAttribute(element: Element, name: string) {
  const current = element.getAttribute(name);
  if (current === null) return;
  let originals = attributeOriginals.get(element);
  if (!originals) {
    originals = new Map();
    attributeOriginals.set(element, originals);
  }
  const known = originals.get(name);
  if (language === "en") {
    if (known !== undefined && current !== known) element.setAttribute(name, known);
    return;
  }
  if (known !== undefined && current === translateString(known)) return;
  const original = known !== undefined && current === known ? known : current;
  const translated = translateString(original);
  if (translated === current) return;
  originals.set(name, original);
  translatedElements.add(element);
  element.setAttribute(name, translated);
}

function translateTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text);
    return;
  }
  if (!(root instanceof Element) && !(root instanceof Document)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent?.matches("script, style, noscript")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });
  let node = walker.nextNode();
  while (node) {
    translateTextNode(node as Text);
    node = walker.nextNode();
  }
  const elements = root instanceof Element ? [root, ...root.querySelectorAll("*")] : [...root.querySelectorAll("*")];
  elements.forEach((element) => {
    ["aria-label", "placeholder", "title", "alt", "content"].forEach((name) => translateAttribute(element, name));
  });
}

function applyLanguage() {
  if (typeof document === "undefined" || applying) return;
  applying = true;
  document.documentElement.lang = language;
  if (language === "en") {
    translatedTextNodes.forEach((node) => {
      const original = textOriginals.get(node);
      if (original !== undefined && node.isConnected) node.data = original;
    });
    translatedElements.forEach((element) => {
      const originals = attributeOriginals.get(element);
      originals?.forEach((value, name) => {
        if (element.isConnected) element.setAttribute(name, value);
      });
    });
  } else {
    translateTree(document);
  }
  applying = false;
}

export function getSiteLanguage(): SiteLanguage {
  return language;
}

export function setSiteLanguage(next: SiteLanguage) {
  language = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyLanguage();
    window.dispatchEvent(new CustomEvent<SiteLanguage>("site-language-change", { detail: next }));
  }
}

export function initSiteLanguage() {
  if (typeof window === "undefined" || observer) return;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  language = saved === "es" ? "es" : "en";
  applyLanguage();
  observer = new MutationObserver((mutations) => {
    if (applying || language !== "es") return;
    applying = true;
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") translateTextNode(mutation.target as Text);
      mutation.addedNodes.forEach(translateTree);
      if (mutation.type === "attributes" && mutation.target instanceof Element && mutation.attributeName) {
        translateAttribute(mutation.target, mutation.attributeName);
      }
    });
    applying = false;
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-label", "placeholder", "title", "alt", "content"],
  });
}
