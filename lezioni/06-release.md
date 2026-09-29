# Lezione 06 - Gestione delle release

File: `.github/workflows/06-release.yml`

## Cosa dimostra

- Trigger su tag `v*`: il rilascio è un gesto git esplicito.
- `fetch-depth: 0` nel checkout: serve tutta la storia per calcolare le note
  tra un tag e il precedente.
- `gh` CLI è preinstallato sui runner e funziona con `GH_TOKEN: ${{ github.token }}`.
- `gh release create --generate-notes`: changelog automatico da commit e PR.
- Asset allegati alla release (lo zip della build).
- `permissions: contents: write` è il minimo per creare release.
- Espressione condizionale `a && b || c` come ternario di GitHub Actions.

## Come lanciarla

Release vera:

```bash
git tag v0.1.0 -m "Prima release del laboratorio"
git push origin v0.1.0
gh run watch
gh release view v0.1.0
```

Prova senza tag (crea una release **draft**, poi da cancellare):

```bash
gh workflow run 06-release.yml -f tag=v0.0.0-test
gh release delete v0.0.0-test --yes
```

## Cosa osservare

1. In "Releases" compare la release con titolo, note generate e lo zip.
2. Le note elencano i commit dall'ultimo tag (al primo tag: tutta la storia).

## Da approfondire

- Convenzioni sui messaggi di commit (Conventional Commits) e strumenti che
  generano versione e changelog da soli: `release-please`, `semantic-release`.

## Note dopo l'esecuzione

Tag `v0.1.0` pushato il 29/09/2026: la release è stata creata in 12 secondi
con l'asset `app-v0.1.0.zip`.

- Le note generate contengono solo il link "Full Changelog": senza PR unite
  e senza tag precedente non c'è materiale per il changelog. Alla prossima
  release, con PR in mezzo, le note elencheranno i titoli delle PR.
- Il push del tag ha fatto partire anche la lezione 02 (ha `tags: v*`),
  come previsto.
- I test sono girati prima della release: se falliscono, niente release.
