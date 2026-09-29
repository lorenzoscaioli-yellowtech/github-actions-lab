# Lezione 10 - Action riusabili

File: `.github/actions/setup-app/action.yml`, `.github/workflows/10-node-check.yml`,
`.github/workflows/10-chiamante.yml` · Repo esterno: `github-actions-consumer`

## Serve un'organizzazione?

No. Sull'account personale:

| Da dove chiami | Verso un repo pubblico | Verso un repo privato |
|---|---|---|
| Stesso repo (`./...`) | sì | sì |
| Altro repo tuo | sì | sì, abilitando Settings > Actions > General > Access |
| Repo di altri | sì | no |

L'organizzazione aggiunge governance: accesso tra repo privati dei membri,
starter workflow nel repo `.github` dell'org, workflow obbligatori via ruleset.

## Composite action o reusable workflow?

| | Composite action | Reusable workflow |
|---|---|---|
| Cos'è | Un gruppo di step | Un workflow intero (job, runner) |
| Si usa in | uno step: `- uses: ...` | un job: `jobs.x.uses: ...` |
| Dove gira | nel job del chiamante, stessa macchina | su runner propri |
| `runs-on`, `permissions`, `environment` | no | sì |
| Segreti | li riceve come input | `secrets:` espliciti o `secrets: inherit` |
| `shell:` negli step `run` | obbligatorio | come in ogni workflow |
| Log | step unico espandibile | job con nome "chiamante / chiamato" |
| Annidamento | fino a 10 livelli | fino a 10 livelli di chiamata |

Regola pratica: **composite** per "preparare l'ambiente" (setup, login,
cache); **reusable** per "una pipeline standard" (CI completa, deploy).

## Come lanciarla

```bash
gh workflow run 10-chiamante.yml && gh run watch
# dal repo consumer
cd ../GitHub-Actions-consumer && gh workflow run usa-lab.yml && gh run watch
```

## Note dopo l'esecuzione

29/09/2026.

- Refactoring: 03 e 05 usano la composite, 04 richiama il reusable due
  volte. Tutti verdi. Nella UI i job di 04 si chiamano `eslint / check` e
  `prettier / check`.
- **Trappola**: in un reusable workflow `uses: ./.github/actions/...` si
  riferisce al repo del CHIAMANTE, perché è quello scaricato dal checkout.
  Chiamato dal consumer, il percorso non esisterebbe. Per questo il
  reusable scrive setup-node e `npm ci` per esteso invece di usare la
  composite.
- **Boolean in workflow_call** (dubbio della lezione 02): sono veri booleani.
  Con `upload-artifact: true`, `== true` vale `true` e `== 'true'` vale
  `false`.
- Gli output passano da step → job → workflow → `needs.<job>.outputs`:
  il job `riepilogo` stampa i tre risultati, incluso Node v24 per il test.
- Consumer: il log mostra
  `Uses: lorenzoscaioli-yellowtech/github-actions-lab/.github/workflows/10-node-check.yml@refs/tags/v0.2.0`
  e `Download action repository 'lorenzoscaioli-yellowtech/github-actions-lab@v0.2.0'`.
  Nessuna organizzazione coinvolta.
- Il tag `v0.2.0` ha anche avviato la release 06: il tag serve sia a
  versionare le action sia a pubblicare la release.
