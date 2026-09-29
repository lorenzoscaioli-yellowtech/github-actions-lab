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
| 03 | [Continuous Integration](lezioni/03-ci.md) | Checkout, setup-node con cache, `npm ci`, test, artefatti | eseguita |
| 04 | [Lint e formattazione](lezioni/04-lint.md) | ESLint e Prettier in job paralleli, annotazioni sulla PR | eseguita |
| 05 | [CD su GitHub Pages](lezioni/05-cd-pages.md) | Build e deploy separati, `environment`, `concurrency`, permessi Pages | eseguita |
| 06 | [Release](lezioni/06-release.md) | Trigger su tag, note generate, asset allegati, `gh` nei workflow | eseguita |
| 07 | [Automazione](lezioni/07-automazione.md) | Schedule, commit da bot, segreti opzionali, notifica Slack | eseguita |
| 08 | [Matrici](lezioni/08-matrice.md) | `strategy.matrix`, `include`/`exclude`, `fail-fast`, `continue-on-error`, Windows e macOS | eseguita |
| 09 | [Segreti, variabili, environment](lezioni/09-deploy-approvazione.md) | `vars` e `secrets` per ambiente, approvazione manuale, branch policy | in attesa di approvazione |
| 10 | [Action riusabili](lezioni/10-action-riusabili.md) | Composite action, reusable workflow, uso da un altro repo del proprio account | eseguita |
| 11 | [Sicurezza](lezioni/11-sicurezza.md) | Permessi minimi, pin a SHA, script injection, actionlint, Dependabot | eseguita |
| 12 | [Check obbligatori sulle PR](lezioni/12-pr-gate.md) | Ruleset su main, job `gate` con `if: always()`, bypass admin | eseguita |
| 13 | [Concurrency e timeout](lezioni/13-concurrency.md) | `cancel-in-progress`, gruppi per ref, `timeout-minutes` | eseguita |
| 14 | [Debug](lezioni/14-debug.md) | Comandi di workflow, dump dei contesti, `rerun --debug`, `act` | eseguita (act da riprovare con Docker) |

Fuori percorso, perché richiedono infrastruttura esterna: deploy su GHCR e
via SSH, OIDC verso un cloud, runner self-hosted.

## Comandi utili

```bash
gh workflow list                          # elenco dei workflow
gh workflow run 01-hello-world.yml        # lancio manuale
gh run list --workflow=01-hello-world.yml # esecuzioni recenti
gh run watch                              # segue l'ultima esecuzione in tempo reale
gh run view --log                         # log completo dell'ultima esecuzione
gh run rerun <id> --debug                 # rilancia con i log di debug
actionlint                                # lint di tutti i workflow, in locale
```
