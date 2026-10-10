import { test } from "node:test";
import assert from "node:assert/strict";
import { luhn, PROVINCES, validateField, validateForm, type CheckoutForm, type Field } from "./checkout.ts";

const TODAY = "2026-10-09";
const valid: CheckoutForm = {
  email: "ana@mail.com",
  phone: "+54 341 555-1234",
  delivery: "envio",
  name: "Ana Pérez",
  address: "Bv. Oroño 1234",
  city: "Rosario",
  province: "Santa Fe",
  zip: "S2000ABC",
  card: "4242 4242 4242 4242",
  expiry: "12/28",
  cvv: "123",
};
const check = (patch: Partial<CheckoutForm>, field: Field) => validateField(field, { ...valid, ...patch }, TODAY);

test("hay 24 jurisdicciones", () => {
  assert.equal(PROVINCES.length, 24);
  assert.ok(PROVINCES.includes("Ciudad Autónoma de Buenos Aires"));
});

test("luhn", () => {
  assert.equal(luhn("4242424242424242"), true);
  assert.equal(luhn("4242424242424241"), false);
  assert.equal(luhn(""), false);
  assert.equal(luhn("42a2"), false);
});

test("un formulario completo y válido no tiene errores", () => {
  assert.deepEqual(validateForm(valid, TODAY), {});
});

test("campos vacíos son requeridos", () => {
  assert.equal(check({ email: "  " }, "email"), "required");
  assert.equal(check({ card: "" }, "card"), "required");
});

test("formatos inválidos", () => {
  assert.equal(check({ email: "ana@mail" }, "email"), "invalid");
  assert.equal(check({ phone: "1234" }, "phone"), "invalid");
  assert.equal(check({ name: "A" }, "name"), "invalid");
  assert.equal(check({ address: "abc" }, "address"), "invalid");
  assert.equal(check({ province: "Narnia" }, "province"), "invalid");
  assert.equal(check({ zip: "200" }, "zip"), "invalid");
  assert.equal(check({ card: "4242 4242 4242 4241" }, "card"), "invalid");
  assert.equal(check({ expiry: "13/28" }, "expiry"), "invalid");
  assert.equal(check({ expiry: "1228" }, "expiry"), "invalid");
  assert.equal(check({ cvv: "12" }, "cvv"), "invalid");
});

test("códigos postales viejos y nuevos", () => {
  assert.equal(check({ zip: "2000" }, "zip"), null);
  assert.equal(check({ zip: "s2000abc" }, "zip"), null);
});

test("vencimiento: este mes vale, el anterior no", () => {
  assert.equal(check({ expiry: "10/26" }, "expiry"), null);
  assert.equal(check({ expiry: "09/26" }, "expiry"), "expired");
  assert.equal(check({ expiry: "12/25" }, "expiry"), "expired");
});

test("con retiro no se piden datos de envío", () => {
  const pickup = { ...valid, delivery: "retiro" as const, name: "", address: "", city: "", province: "", zip: "" };
  assert.deepEqual(validateForm(pickup, TODAY), {});
});

test("validateForm junta todos los errores", () => {
  const errors = validateForm({ ...valid, email: "", cvv: "1" }, TODAY);
  assert.deepEqual(errors, { email: "required", cvv: "invalid" });
});
