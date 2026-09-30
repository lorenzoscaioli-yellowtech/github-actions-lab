# Lezione 15 - Test generati con Gemini

File: `.github/workflows/15-test-ai.yml`, `.github/scripts/genera-test-ai.mjs`

## Cosa dimostra

- Chiamare un modello AI da una GitHub Action tramite REST, con la chiave nei
  segreti e passata nell'header `x-goog-api-key`.
- **Output strutturato**: `responseSchema` obbliga Gemini a rispondere con un
  JSON che contiene `riepilogo`, `casi` e `codice`, invece di testo libero da
  ripulire.
- Test **ad hoc**: il prompt contiene solo il diff di `app/src` rispetto alla
  base della PR, i file modificati completi e un test esistente come esempio
  di stile.
- **Separazione dei poteri** in tre job, come nella lezione 11:

  | Job | Segreti | Permessi | Esegue codice generato |
  |---|---|---|---|
  | `genera` | `GEMINI_API_KEY` | `contents: read` | no |
  | `esegui` | nessuno | `contents: read` | sì |
  | `commenta` | nessuno | `pull-requests: write` | no |

  Il diff di una PR è testo non fidato, che potrebbe contenere istruzioni per
  il modello (prompt injection). Il codice che ne esce va trattato come codice
  di uno sconosciuto: gira dove non c'è niente da rubare.
- Passaggio di file tra job con artefatti e di valori con `outputs`.
- Un solo commento sulla PR, aggiornato a ogni push con `--edit-last --create-if-none`.
- `concurrency` per non pagare chiamate su push superati, e `timeout-minutes`.

## Prerequisiti

1. Una chiave API da [Google AI Studio](https://aistudio.google.com/apikey).
   Il piano gratuito basta per le prove.
2. Salvarla come segreto del repo. Il comando chiede il valore senza mostrarlo
   e non lo lascia nella history della shell:

   ```bash
   gh secret set GEMINI_API_KEY
   ```

3. Facoltativo: scegliere il modello con una variabile del repo. Il default
   nello script è `gemini-3.8-flash`. Se il modello non esiste più, il log
   elenca quelli disponibili.

   ```bash
   gh variable set GEMINI_MODEL --body gemini-3.8-flash
   ```

   Meglio un nome preciso che un alias come `gemini-flash-latest`: l'alias
   può cambiare modello da un giorno all'altro, come un tag mobile (lezione 11).

## Come lanciarla

Si avvia da sola su ogni PR che tocca `app/src`. A mano, confrontando con un
commit precedente:

```bash
gh workflow run 15-test-ai.yml -f base=HEAD~1
```

In locale, senza GitHub e dalla cartella `app/`:

```bash
GEMINI_API_KEY=... BASE_REF=main node ../.github/scripts/genera-test-ai.mjs
node --test test/ai/generated.test.js
```

## La PR di prova

Il branch `prova-test-ai` aggiunge una funzione `media(numeri)` con un bug
voluto: su un array vuoto restituisce `NaN`, perché divide `0 / 0`. I test
esistenti non la coprono, quindi la CI normale resta verde. La domanda della
lezione è se i test generati da Gemini se ne accorgono.

## Limiti da tenere presenti

- **Non deterministico**: due run sullo stesso diff possono produrre test
  diversi. Per questo il check NON è tra quelli obbligatori del ruleset: è un
  secondo parere, non un cancello.
- Un test generato può essere **sbagliato**, cioè aspettarsi un comportamento
  che nessuno ha deciso. Un test rosso va letto, non creduto a occhi chiusi.
- Costo e privacy: il diff viene inviato a Google. Su un progetto cliente
  va verificato cosa si può mandare a un servizio esterno.
- Le PR da fork non ricevono i segreti, quindi `genera` fallisce. È voluto.

## Note dopo l'esecuzione

30/09/2026, PR #4. Per arrivare al primo run riuscito ci sono voluti tre
aggiustamenti, tutti tipici delle integrazioni con un'API AI.

1. **Modello ritirato.** Il default iniziale `gemini-2.5-flash` ha risposto
   404: "no longer available to new users, use gemini-3.8-flash". Lo script
   ha stampato l'elenco dei modelli disponibili ed è bastato impostare
   `GEMINI_MODEL`. Morale: il nome del modello è una dipendenza che invecchia
   e va tenuto in una variabile, non scolpito nel codice.
2. **Sovraccarico.** `gemini-3.8-flash` ha risposto 503 "high demand" più volte
   di fila. Ho aggiunto tentativi con attesa crescente di 5, 15 e 30 secondi
   su 429, 500 e 503, più una lista di modelli di riserva (`GEMINI_FALLBACK`).
   Al run successivo è bastato il secondo tentativo.
3. **Rerun e codice vecchio.** `gh run rerun` su una PR riusa lo stesso merge
   commit, quindi anche il vecchio script. Per provare una correzione fatta su
   `main` bisogna aggiornare il branch della PR con rebase e push.

**Il risultato.**

- Primo run: Gemini ha proposto 5 casi. Il caso "gestisce un array vuoto" è
  fallito, perché `media([])` restituiva `NaN`. **Il bug voluto è stato
  trovato**, mentre la CI normale e il `gate` erano verdi.
- Correzione sulla PR, con un errore esplicito su array vuoto: nuovo run con
  5 test su 5 verdi. Il commento sulla PR è stato aggiornato, non duplicato.
- I due run hanno generato test **diversi** per lo stesso codice: nomi,
  valori e ordine cambiano. Il non determinismo si vede subito.
- Il test sull'array vuoto del primo run si aspettava un messaggio che
  contenesse "vuoto" o "non valido". Nessuno l'aveva deciso: l'ha inventato
  il modello. Il messaggio scelto nella correzione lo soddisfa per caso. Un
  messaggio diverso, per esempio "empty array", avrebbe fatto fallire un test
  su codice corretto. È il limite principale: il test rosso va letto.
- Costo di una generazione: circa 1.500 token, di cui 700 di prompt, 570 di
  risposta e 230 di "ragionamento" del modello. Durata del job circa 10 secondi.
