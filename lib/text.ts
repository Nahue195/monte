// Lowercase without diacritics: "Etiopía" → "etiopia".
export function fold(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
