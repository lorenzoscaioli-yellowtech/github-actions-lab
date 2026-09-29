# Laboratorio GitHub Actions

Percorso pratico personale per imparare GitHub Actions partendo da zero.
Ogni lezione è un workflow in `.github/workflows/` più gli appunti in
`lezioni/` che spiegano cosa dimostra, come lanciarlo e cosa osservare nei log.

## Prerequisiti

- Un repository su GitHub che contenga questa cartella (vedi "Setup").
- `gh` CLI autenticato: `gh auth status`.

## Setup

```bash
cd GitHub-Actions
git init
git add .
git commit -m "Laboratorio GitHub Actions: lezioni 01 e 02"
gh repo create github-actions-lab --private --source=. --push
```

Da questo momento i workflow compaiono nella tab **Actions** del repo.

## Percorso didattico

| # | Lezione | Cosa impari | Stato |
|---|---------|-------------|-------|
| 01 | [Hello world](lezioni/01-hello-world.md) | Anatomia di un workflow: trigger, job, step, runner, contesti, variabili, output | pronta |
| 02 | [Trigger e filtri](lezioni/02-trigger.md) | `push`, `pull_request`, `schedule`, `workflow_dispatch` con input, filtri su branch e path | pronta |
| 03 | CI di un'applicazione | Checkout, setup del runtime, cache, test, artefatti | da fare |
| 04 | Matrici e job paralleli | `strategy.matrix`, `needs`, `fail-fast`, `continue-on-error` | da fare |
| 05 | Segreti, variabili e environment | `secrets`, `vars`, environment con approvazione manuale | da fare |
| 06 | Action riusabili | `composite action`, `reusable workflow` con `workflow_call` | da fare |
| 07 | Deploy | Pubblicare su GitHub Pages, build e push di un'immagine Docker su GHCR | da fare |
| 08 | Sicurezza e buone pratiche | Permessi minimi del `GITHUB_TOKEN`, pin a SHA, Dependabot per le action, concurrency | da fare |

## Comandi utili

```bash
gh workflow list                          # elenco dei workflow
gh workflow run 01-hello-world.yml        # lancio manuale
gh run list --workflow=01-hello-world.yml # esecuzioni recenti
gh run watch                              # segue l'ultima esecuzione in tempo reale
gh run view --log                         # log completo dell'ultima esecuzione
```
