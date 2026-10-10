import type { Delivery } from "./cart.ts";

export const PROVINCES = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Ciudad Autónoma de Buenos Aires", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta",
  "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

export const FIELD_ORDER = ["email", "phone", "name", "address", "city", "province", "zip", "card", "expiry", "cvv"] as const;

export type Field = (typeof FIELD_ORDER)[number];
export type CheckoutForm = Record<Field, string> & { delivery: Delivery };
export type FieldError = "required" | "invalid" | "expired";
export type FormErrors = Partial<Record<Field, FieldError>>;

const SHIPPING_ONLY: Field[] = ["name", "address", "city", "province", "zip"];

const lengthBetween = (value: string, min: number, max: number) => value.length >= min && value.length <= max;

export function luhn(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function checkExpiry(value: string, today: string): FieldError | null {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value);
  if (!match) return "invalid";
  const month = Number(match[1]);
  if (month < 1 || month > 12) return "invalid";
  const year = 2000 + Number(match[2]);
  const [thisYear, thisMonth] = today.split("-").map(Number);
  return year < thisYear || (year === thisYear && month < thisMonth) ? "expired" : null;
}

export function validateField(field: Field, form: CheckoutForm, today: string): FieldError | null {
  if (form.delivery === "retiro" && SHIPPING_ONLY.includes(field)) return null;
  const value = form[field].trim();
  if (!value) return "required";
  switch (field) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? null : "invalid";
    case "phone":
      return /^\d{8,15}$/.test(value.replace(/[\s\-+().]/g, "")) ? null : "invalid";
    case "name":
    case "city":
      return lengthBetween(value, 2, 60) ? null : "invalid";
    case "address":
      return lengthBetween(value, 4, 100) ? null : "invalid";
    case "province":
      return PROVINCES.includes(value) ? null : "invalid";
    case "zip":
      return /^(\d{4}|[a-z]\d{4}[a-z]{3})$/i.test(value) ? null : "invalid";
    case "card": {
      const digits = value.replace(/[\s-]/g, "");
      return /^\d{13,19}$/.test(digits) && luhn(digits) ? null : "invalid";
    }
    case "expiry":
      return checkExpiry(value, today);
    case "cvv":
      return /^\d{3,4}$/.test(value) ? null : "invalid";
  }
  return null;
}

export function validateForm(form: CheckoutForm, today: string): FormErrors {
  const errors: FormErrors = {};
  for (const field of FIELD_ORDER) {
    const error = validateField(field, form, today);
    if (error) errors[field] = error;
  }
  return errors;
}
