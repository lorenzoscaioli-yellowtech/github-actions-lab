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

Le lezioni 03-07 seguono i cinque casi d'uso classici dei workflow: CI, CD,
lint, release, automazione. Le successive coprono i meccanismi trasversali.

| # | Lezione | Cosa impari | Stato |
|---|---------|-------------|-------|
| 01 | [Hello world](lezioni/01-hello-world.md) | Anatomia di un workflow: trigger, job, step, runner, contesti, variabili, output | eseguita |
| 02 | [Trigger e filtri](lezioni/02-trigger.md) | `push`, `pull_request`, `schedule`, `workflow_dispatch` con input, filtri su branch e path | eseguita |
| 03 | [Continuous Integration](lezioni/03-ci.md) | Checkout, setup-node con cache, `npm ci`, test, artefatti | pronta |
| 04 | [Lint e formattazione](lezioni/04-lint.md) | ESLint e Prettier in job paralleli, annotazioni sulla PR | pronta |
| 05 | [CD su GitHub Pages](lezioni/05-cd-pages.md) | Build e deploy separati, `environment`, `concurrency`, permessi Pages | bloccata: Pages richiede repo pubblico |
| 06 | [Release](lezioni/06-release.md) | Trigger su tag, note generate, asset allegati, `gh` nei workflow | pronta |
| 07 | [Automazione](lezioni/07-automazione.md) | Schedule, commit da bot, segreti opzionali, notifica Slack | pronta |
| 08 | Matrici e job paralleli | `strategy.matrix`, `needs`, `fail-fast`, `continue-on-error` | da fare |
| 09 | Segreti, variabili e environment | `secrets`, `vars`, environment con approvazione manuale | da fare |
| 10 | Action riusabili | `composite action`, `reusable workflow` con `workflow_call` | da fare |
| 11 | Sicurezza e buone pratiche | Permessi minimi, pin a SHA, Dependabot per le action, script injection | da fare |

## Comandi utili

```bash
gh workflow list                          # elenco dei workflow
gh workflow run 01-hello-world.yml        # lancio manuale
gh run list --workflow=01-hello-world.yml # esecuzioni recenti
gh run watch                              # segue l'ultima esecuzione in tempo reale
gh run view --log                         # log completo dell'ultima esecuzione
```
