# Lezione 12 - Branch protection con check obbligatori

File: `.github/workflows/12-pr-gate.yml` · Ruleset "main protetto"

## Cosa dimostra

- Un **ruleset** su `main`: niente push forzati, niente cancellazione, merge
  solo via PR, check `gate` obbligatorio.
- Il pattern **gate**: un solo job obbligatorio che dipende da tutti gli
  altri, con `if: always()`.
- Perché `if: always()`: un check **skipped** conta come superato. Senza,
  con un test fallito il gate verrebbe saltato e il merge sarebbe permesso.
- Perché niente filtro `paths`: un check obbligatorio che non parte resta
  "Expected" per sempre e blocca il merge.

## Configurazione (già fatta)

```bash
gh api -X POST repos/lorenzoscaioli-yellowtech/github-actions-lab/rulesets --input ruleset.json
```

con queste regole: `deletion`, `non_fast_forward`, `pull_request` con 0
approvazioni e `required_status_checks` con context `gate` e integration_id
15368, cioè l'app GitHub Actions.

Il **bypass** è concesso al ruolo Admin (`actor_id: 5`), cioè a me: posso
ancora fare push diretti su `main`. Git lo segnala con "Bypassed rule
violations". Senza bypass anche l'admin deve passare da PR.
Visibile in Settings > Rules > Rulesets.

## Note dopo l'esecuzione

29/09/2026, PR #3 di prova.

- Test volutamente rotto: `test / check` rosso, `gate` rosso,
  `mergeStateStatus: BLOCKED`.
- Test corretto con un nuovo commit sulla stessa PR: `gate` verde con
  "success, success", `mergeStateStatus: CLEAN`.
- PR chiusa senza merge e branch eliminato.
- `gh pr checks` mostra anche i check non obbligatori (02, 03, 04): conta
  solo `gate`.
- Le PR di Dependabot aperte prima del ruleset non hanno il check `gate`,
  quindi sono bloccate. Per farlo partire basta commentare
  `@dependabot rebase`.
