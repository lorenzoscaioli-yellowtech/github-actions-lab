# Lezione 05 - CD su GitHub Pages

File: `.github/workflows/05-cd-pages.yml`

## Prerequisito

Il piano gratuito non supporta GitHub Pages sui repo **privati**
(risposta dell'API: "Your current plan does not support GitHub Pages for
this repository"). Con il repo pubblico, Pages si abilita una volta sola:

```bash
gh api repos/lorenzoscaioli-yellowtech/github-actions-lab/pages -X POST -f build_type=workflow
```

`build_type=workflow` significa "la sorgente è GitHub Actions", non un branch.

## Cosa dimostra

- Separazione `build` / `deploy` con `needs`.
- `environment: github-pages` con `url`: il link al sito compare nel run e
  in Settings > Environments si possono aggiungere regole (approvatori,
  branch ammessi).
- `concurrency` con gruppo `pages`: un solo deploy alla volta, senza
  cancellare quello in corso.
- I tre permessi necessari a Pages: `pages: write`, `id-token: write`,
  `contents: read`.
- Le tre action ufficiali: `upload-pages-artifact`, `deploy-pages`
  (e opzionalmente `configure-pages`).

## Come lanciarla

```bash
gh workflow run 05-cd-pages.yml && gh run watch
```

Il sito sarà su `https://lorenzoscaioli-yellowtech.github.io/github-actions-lab/`.

## Note dopo l'esecuzione

Primo deploy 29/09/2026, dopo aver reso pubblico il repo: job `build` e
`deploy` verdi, sito online in circa 20 secondi al primo push.

- Il sito mostra versione, commit corto (da `GITHUB_SHA`) e data di build:
  conferma che è la build del workflow, non un file statico.
- Nel run compare il box "github-pages" con l'URL: è l'`environment`.
  In Settings > Environments > github-pages si possono aggiungere reviewer
  obbligatori o limitare i branch da cui si può fare deploy.
- L'URL del deploy arriva da `steps.deployment.outputs.page_url`, quindi
  il job non ha bisogno di conoscerlo in anticipo.
- Da provare: due push ravvicinati per vedere `concurrency` mettere in coda
  il secondo deploy.
