export function somma(a, b) {
  return a + b;
}

export function dividi(a, b) {
  if (b === 0) {
    throw new Error("Divisione per zero");
  }
  return a / b;
}

export function media(numeri) {
  let totale = 0;
  for (const n of numeri) {
    totale += n;
  }
  return totale / numeri.length;
}
