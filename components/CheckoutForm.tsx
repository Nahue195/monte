"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import { COFFEES } from "@/data/coffees";
import type { Dictionary } from "@/dictionaries";
import { priceCart, type Delivery, type PricedCart } from "@/lib/cart";
import {
  FIELD_ORDER,
  PROVINCES,
  validateField,
  validateForm,
  type CheckoutForm as FormValues,
  type Field,
  type FieldError,
  type FormErrors,
} from "@/lib/checkout";
import { localToday } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { buildOrder, makeOrderId } from "@/lib/order";
import { cartActions, cartStore, useCartLines } from "./cart/store";
import { orderStore } from "./orderStore";
import { useHydrated } from "./useHydrated";

const EMPTY_FORM: FormValues = {
  email: "",
  phone: "",
  delivery: "envio",
  name: "",
  address: "",
  city: "",
  province: "",
  zip: "",
  card: "",
  expiry: "",
  cvv: "",
};
const PROCESSING_MS = 1200;

type Props = { lang: Locale; dict: Pick<Dictionary, "checkout" | "labels" | "cart"> };

export function CheckoutForm({ lang, dict }: Props) {
  const hydrated = useHydrated();
  const lines = useCartLines();
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [frozen, setFrozen] = useState<PricedCart | null>(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const { checkout, labels, cart } = dict;
  const price = (n: number) => formatPrice(n, lang);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (lines.length === 0 && !frozen) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <h2 className="font-display text-3xl uppercase">{checkout.emptyTitle}</h2>
        <p className="text-muted">{checkout.emptyBody}</p>
        <Link href={`/${lang}/shop`} className="btn btn-hot">
          {cart.goShop}
        </Link>
      </div>
    );
  }

  const priced = frozen ?? priceCart(lines, COFFEES, form.delivery);
  const processing = frozen !== null;

  const messageFor = (field: Field): string | undefined => {
    const error: FieldError | undefined = errors[field];
    if (!error) return undefined;
    if (error === "required") return checkout.errors.required;
    return error === "expired" ? checkout.errors.expired : checkout.errors[field];
  };

  const recheck = (field: Field, values: FormValues) =>
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values, localToday()) ?? undefined }));

  const onChange = (field: Field) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...form, [field]: event.target.value };
    setForm(next);
    // Once a field shows an error, re-check it while typing so the message clears as soon as it's fixed.
    if (errors[field]) recheck(field, next);
  };

  const onDelivery = (delivery: Delivery) => {
    setForm((prev) => ({ ...prev, delivery }));
    // Pickup hides the address fields, so their errors must not keep the summary alive.
    if (delivery === "retiro") setErrors((prev) => ({ ...prev, name: undefined, address: undefined, city: undefined, province: undefined, zip: undefined }));
  };

  const fieldProps = (field: Field) => ({
    id: field,
    label: checkout.fields[field],
    value: form[field],
    error: messageFor(field),
    onChange: onChange(field),
    onBlur: () => recheck(field, form),
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const found = validateForm(form, localToday());
    setErrors(found);
    setAttempted(true);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    const snapshot = priceCart(cartStore.get(), COFFEES, form.delivery);
    // The cart may have been cleared in another tab since this page rendered.
    if (snapshot.lines.length === 0) return;
    busy.current = true;
    setFrozen(snapshot);
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_MS));
    if (!mounted.current) return;
    orderStore.set(buildOrder(snapshot, form.delivery, makeOrderId(), localToday()));
    cartActions.clear();
    router.push(`/${lang}/order`);
  }

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_22rem]">
      <form noValidate onSubmit={submit} className="grid gap-8">
        <p className="rounded-xl border border-hot/60 px-4 py-3 text-sm">{checkout.demo}</p>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-xl uppercase">{checkout.contact}</legend>
          <TextField {...fieldProps("email")} type="email" autoComplete="email" />
          <TextField {...fieldProps("phone")} type="tel" autoComplete="tel" />
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-xl uppercase">{checkout.delivery}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["envio", "retiro"] as const).map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 has-[:checked]:border-hot"
              >
                <input type="radio" name="delivery" checked={form.delivery === option} onChange={() => onDelivery(option)} className="accent-[var(--hot)]" />
                {option === "envio" ? checkout.ship : checkout.pickup}
              </label>
            ))}
          </div>
          {form.delivery === "envio" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField {...fieldProps("name")} autoComplete="name" className="sm:col-span-2" />
              <TextField {...fieldProps("address")} autoComplete="street-address" className="sm:col-span-2" />
              <TextField {...fieldProps("city")} autoComplete="address-level2" />
              <div>
                <label htmlFor="f-province" className="text-sm">
                  {checkout.fields.province}
                </label>
                <select
                  id="f-province"
                  value={form.province}
                  onChange={onChange("province")}
                  onBlur={() => recheck("province", form)}
                  aria-invalid={errors.province ? true : undefined}
                  aria-describedby={errors.province ? "f-province-error" : undefined}
                  className="field mt-1"
                >
                  <option value="">{checkout.provincePlaceholder}</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p id="f-province-error" className="mt-1 text-sm text-bad">
                    {messageFor("province")}
                  </p>
                )}
              </div>
              <TextField {...fieldProps("zip")} autoComplete="postal-code" />
            </div>
          )}
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-xl uppercase">{checkout.payment}</legend>
          <TextField {...fieldProps("card")} inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-4">
            <TextField {...fieldProps("expiry")} inputMode="numeric" autoComplete="off" placeholder="12/30" />
            <TextField {...fieldProps("cvv")} inputMode="numeric" autoComplete="off" placeholder="123" />
          </div>
        </fieldset>

        {attempted && hasErrors && (
          <p role="alert" className="text-sm text-bad">
            {checkout.errorSummary}
          </p>
        )}
        <button type="submit" disabled={processing} className="btn btn-hot w-full sm:w-auto">
          {processing ? checkout.processing : checkout.submit}
        </button>
      </form>

      <aside className="h-fit rounded-2xl bg-panel p-5 md:sticky md:top-24">
        <h2 className="font-display text-xl uppercase">{checkout.summary}</h2>
        <ul className="mt-4 grid gap-3 text-sm">
          {priced.lines.map((line) => (
            <li key={`${line.slug}|${line.grind}|${line.size}`} className="flex justify-between gap-3">
              <span>
                {line.coffee.name} × {line.qty}
                <span className="block text-xs text-muted">
                  {labels.grinds[line.grind]} · {labels.sizes[line.size]}
                </span>
              </span>
              <span>{price(line.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-y-1 border-t border-line pt-4 text-sm">
          <dt className="text-muted">{cart.subtotal}</dt>
          <dd className="text-right">{price(priced.subtotal)}</dd>
          <dt className="text-muted">{cart.shipping}</dt>
          <dd className="text-right">{priced.shipping === 0 ? cart.free : price(priced.shipping)}</dd>
          <dt className="font-semibold">{cart.total}</dt>
          <dd className="text-right font-display text-lg text-hot">{price(priced.total)}</dd>
        </dl>
      </aside>
    </div>
  );
}

type TextFieldProps = {
  id: Field;
  label: string;
  error?: string;
  className?: string;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur" | "type" | "autoComplete" | "inputMode" | "placeholder">;

function TextField({ id, label, error, className = "", ...input }: TextFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={`f-${id}`} className="text-sm">
        {label}
      </label>
      <input
        id={`f-${id}`}
        {...input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `f-${id}-error` : undefined}
        className="field mt-1"
      />
      {error && (
        <p id={`f-${id}-error`} className="mt-1 text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
