# Lezione 04 - Lint e formattazione

File: `.github/workflows/04-lint.yml`

## Cosa dimostra

- ESLint e Prettier come due job paralleli: se uno fallisce si vede subito
  quale.
- `prettier --check` non modifica i file: in CI si segnala, non si corregge.
- Il problem matcher di setup-node trasforma gli errori ESLint in
  annotazioni sulle righe del file nella PR.

## Come lanciarla

```bash
gh workflow run 04-lint.yml && gh run watch
```

## Da provare

- Introdurre una variabile inutilizzata in `src/calcolatrice.js` e aprire una
  PR: il job `eslint` fallisce e l'annotazione compare in "Files changed".
- Togliere un `;` e vedere fallire `prettier`.

## Alternativa da valutare

Un solo workflow "CI" con job `test`, `eslint`, `prettier` in parallelo è la
scelta più comune nei progetti reali. Qui sono separati solo per rendere
riconoscibile il caso d'uso.

## Note dopo l'esecuzione

_(da compilare)_
