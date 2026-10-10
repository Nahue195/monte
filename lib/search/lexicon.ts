import type { Term } from "./types.ts";

type Entry = { phrases: string[]; term: Term };

// Phrases are already normalized (lowercase, no accents). Spanish and English share one list.
export const LEXICON: Entry[] = [
  // Notes
  { term: { kind: "note", value: "frutal" }, phrases: ["frutal", "frutales", "frutoso", "frutosa", "fruta", "frutas", "frutado", "fruity", "fruit", "fruits"] },
  { term: { kind: "note", value: "citrico" }, phrases: ["citrico", "citrica", "citricos", "limon", "naranja", "mandarina", "pomelo", "lima", "citrus", "citrusy", "lemon", "orange"] },
  { term: { kind: "note", value: "frutos-rojos" }, phrases: ["frutos rojos", "frutilla", "frutillas", "arandano", "arandanos", "frambuesa", "cereza", "berries", "berry", "red berries", "strawberry", "blueberry"] },
  { term: { kind: "note", value: "chocolate" }, phrases: ["chocolate", "chocolatoso", "chocolatosa", "chocolatado", "cacao", "chocolatey", "chocolaty", "cocoa"] },
  { term: { kind: "note", value: "caramelo" }, phrases: ["caramelo", "acaramelado", "dulce de leche", "panela", "miel", "melaza", "caramel", "honey", "toffee"] },
  { term: { kind: "note", value: "floral" }, phrases: ["floral", "florales", "flores", "flor", "jazmin", "flowers", "jasmine"] },
  { term: { kind: "note", value: "nueces" }, phrases: ["nuez", "nueces", "avellana", "almendra", "frutos secos", "mani", "nutty", "nuts", "hazelnut", "almond"] },
  { term: { kind: "note", value: "especiado" }, phrases: ["especiado", "especiada", "especias", "canela", "clavo", "spicy", "spices", "spice", "cinnamon"] },
  // Methods
  { term: { kind: "method", value: "filtro" }, phrases: ["filtro", "filtrado", "v60", "chemex", "kalita", "pour over", "pourover", "goteo", "drip", "filter"] },
  { term: { kind: "method", value: "espresso" }, phrases: ["espresso", "expreso", "expresso", "cafetera de bar"] },
  { term: { kind: "method", value: "prensa" }, phrases: ["prensa francesa", "prensa", "french press", "press", "embolo"] },
  { term: { kind: "method", value: "moka" }, phrases: ["moka", "moka pot", "cafetera italiana", "italiana", "bialetti"] },
  { term: { kind: "method", value: "cold-brew" }, phrases: ["cold brew", "coldbrew", "frio", "fria", "helado", "iced"] },
  // Roasts ("amargo" and "fuerte" mean a dark roast)
  { term: { kind: "roast", value: "claro" }, phrases: ["tueste claro", "tostado claro", "claro", "clarito", "light roast", "light"] },
  { term: { kind: "roast", value: "medio" }, phrases: ["tueste medio", "tostado medio", "medio", "medium"] },
  { term: { kind: "roast", value: "oscuro" }, phrases: ["tueste oscuro", "tostado oscuro", "oscuro", "intenso", "fuerte", "amargo", "dark roast", "dark", "strong", "bitter"] },
  // Attributes
  { term: { kind: "level", attr: "acidity", dir: "up" }, phrases: ["acido", "acida", "acidez", "brillante", "acidic", "acidity", "bright"] },
  { term: { kind: "level", attr: "body", dir: "up" }, phrases: ["cuerpo", "cremoso", "cremosa", "denso", "densa", "full bodied", "body", "creamy"] },
  { term: { kind: "level", attr: "sweetness", dir: "up" }, phrases: ["dulce", "dulces", "dulzor", "sweet", "sweetness"] },
  { term: { kind: "level", attr: "body", dir: "down" }, phrases: ["suave", "liviano", "liviana", "ligero", "ligera", "smooth", "mild"] },
  // Origins
  { term: { kind: "origin", value: ["colombia"] }, phrases: ["colombia", "colombiano", "colombian"] },
  { term: { kind: "origin", value: ["etiopia"] }, phrases: ["etiopia", "etiope", "ethiopia", "ethiopian"] },
  { term: { kind: "origin", value: ["brasil"] }, phrases: ["brasil", "brasilero", "brasileno", "brazil", "brazilian"] },
  { term: { kind: "origin", value: ["peru"] }, phrases: ["peru", "peruano", "peruvian"] },
  { term: { kind: "origin", value: ["guatemala"] }, phrases: ["guatemala", "guatemalteco"] },
  { term: { kind: "origin", value: ["costa rica"] }, phrases: ["costa rica", "costarricense"] },
  { term: { kind: "origin", value: ["kenia"] }, phrases: ["kenia", "kenya", "keniata", "kenyan"] },
  { term: { kind: "origin", value: ["honduras"] }, phrases: ["honduras", "hondureno"] },
  { term: { kind: "origin", value: ["etiopia", "kenia"] }, phrases: ["africa", "africano", "african"] },
  { term: { kind: "origin", value: ["guatemala", "costa rica", "honduras"] }, phrases: ["centroamerica", "centroamericano", "central america", "central american"] },
  // Decaf ("sin cafeina" is a two-word phrase, so it wins over the negation "sin")
  { term: { kind: "decaf" }, phrases: ["descafeinado", "descafeinada", "descafe", "sin cafeina", "decaf", "decaffeinated"] },
  // Price
  { term: { kind: "cheap" }, phrases: ["barato", "barata", "economico", "economica", "accesible", "cheap", "affordable"] },
  { term: { kind: "price-cue" }, phrases: ["menos de", "hasta", "debajo de", "por debajo de", "maximo", "max", "under", "below", "less than", "up to"] },
];

// Words that are never typo-corrected, to avoid false positives such as "caro" → "claro".
export const STOPWORDS = new Set([
  "algo", "alguno", "alguna", "para", "que", "quiero", "busco", "necesito", "caro", "cara", "rico", "rica",
  "con", "muy", "pero", "como", "cafe", "cafes", "uno", "una", "unos", "mas", "menos", "sea", "este", "esta",
  "tipo", "nada", "poco", "poca", "bien", "super", "sin", "mucho", "todo", "todos", "leche", "taza", "bueno",
  "buena", "coffee", "something", "want", "like", "very", "not", "too", "really", "with", "the", "and", "for",
  "good", "nice", "milk", "cup",
]);
