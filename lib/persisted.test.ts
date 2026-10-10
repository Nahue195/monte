import { test } from "node:test";
import assert from "node:assert/strict";
import { createPersisted, type StorageLike } from "./persisted.ts";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const parseNumbers = (raw: unknown) => (Array.isArray(raw) ? raw.filter((n): n is number => typeof n === "number") : []);

test("lee, valida y devuelve la misma referencia", () => {
  const storage = memoryStorage({ k: "[1,\"x\",2]" });
  const store = createPersisted("k", parseNumbers, [], () => storage);
  assert.deepEqual(store.get(), [1, 2]);
  assert.equal(store.get(), store.get());
});

test("JSON roto o clave vacía devuelven el valor vacío", () => {
  const empty: number[] = [];
  assert.equal(createPersisted("k", parseNumbers, empty, () => memoryStorage({ k: "{roto" })).get(), empty);
  assert.equal(createPersisted("k", parseNumbers, empty, () => memoryStorage()).get(), empty);
});

test("set guarda, avisa y actualiza el valor", () => {
  const storage = memoryStorage();
  const store = createPersisted("k", parseNumbers, [], () => storage);
  let calls = 0;
  const unsubscribe = store.subscribe(() => calls++);
  store.set([3]);
  assert.equal(storage.data.get("k"), "[3]");
  assert.deepEqual(store.get(), [3]);
  assert.equal(calls, 1);
  unsubscribe();
  store.set([4]);
  assert.equal(calls, 1);
});

test("si el storage falla, funciona en memoria", () => {
  const broken: StorageLike = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
  };
  const store = createPersisted("k", parseNumbers, [], () => broken);
  assert.deepEqual(store.get(), []);
  store.set([5]);
  assert.deepEqual(store.get(), [5]);
});

test("sin storage (servidor) usa el valor vacío", () => {
  const empty: number[] = [];
  const store = createPersisted("k", parseNumbers, empty, () => undefined);
  assert.equal(store.get(), empty);
  assert.equal(store.serverSnapshot(), empty);
});

test("refresh vuelve a leer (cambios de otra pestaña)", () => {
  const storage = memoryStorage({ k: "[1]" });
  const store = createPersisted("k", parseNumbers, [], () => storage);
  assert.deepEqual(store.get(), [1]);
  storage.data.set("k", "[9]");
  store.refresh();
  assert.deepEqual(store.get(), [9]);
});
