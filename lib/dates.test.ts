import { test } from "node:test";
import assert from "node:assert/strict";
import { addBusinessDays, addDays, localToday, nextWeekday } from "./dates.ts";

test("localToday usa la fecha local", () => {
  const now = new Date(2026, 9, 9, 23, 30); // 9 de octubre, 23:30 hora local
  assert.equal(localToday(now), "2026-10-09");
});

test("addDays cruza meses y años", () => {
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("nextWeekday devuelve el próximo día pedido, nunca el mismo", () => {
  assert.equal(nextWeekday("2026-10-09", 2), "2026-10-13"); // viernes → martes
  assert.equal(nextWeekday("2026-10-13", 2), "2026-10-20"); // martes → martes siguiente
  assert.equal(nextWeekday("2026-10-12", 2), "2026-10-13"); // lunes → martes
});

test("addBusinessDays saltea sábados y domingos", () => {
  assert.equal(addBusinessDays("2026-10-13", 2), "2026-10-15"); // martes → jueves
  assert.equal(addBusinessDays("2026-10-15", 2), "2026-10-19"); // jueves → lunes
  assert.equal(addBusinessDays("2026-10-16", 1), "2026-10-19"); // viernes → lunes
});
