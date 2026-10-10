import { fold } from "../text.ts";

export const MAX_QUERY_LENGTH = 200;

// "¿Algo frutal, menos de $15.000?" → ["algo", "frutal", "menos", "de", "15000"]
export function normalize(text: string): string[] {
  let s = fold(text.slice(0, MAX_QUERY_LENGTH)).replace(/\$/g, " ");
  for (let prev = ""; prev !== s; ) {
    prev = s;
    s = s.replace(/(\d)[.,](\d{3})(?!\d)/g, "$1$2");
  }
  s = s.replace(/(\d+)\s*(?:mil|k)\b/g, (_, n: string) => String(Number(n) * 1000));
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s ? s.split(" ") : [];
}
