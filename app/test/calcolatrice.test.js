import { test } from "node:test";
import assert from "node:assert/strict";
import { somma, dividi } from "../src/calcolatrice.js";

test("somma due numeri", () => {
  assert.equal(somma(2, 3), 6);
});

test("divide due numeri", () => {
  assert.equal(dividi(10, 4), 2.5);
});

test("rifiuta la divisione per zero", () => {
  assert.throws(() => dividi(1, 0), /Divisione per zero/);
});
