# DNS Analytics — condivisioni controllate (contratto v1)

## Scelta funzionale
**Una sola dashboard Analytics**, senza perdere moduli, dati o storico. DNS Workspace mantiene il proprio login DNS Identity. Partner Hub mostra Analytics **soltanto a strutture già autenticate nel Partner Hub**, senza un secondo login. L'iframe da solo **non concede accesso**: non bisogna fidarsi di un URL, di un parametro `partnerId`, di un `Referer`, di `postMessage` dal parent o del fatto che l'utente veda il Partner Hub.

## Contratto di sicurezza
- `src/sharing/analyticsSharePolicy.ts` definisce un grant **server-approved**, una identità **server-verified** e sezioni/metriche allowlisted. Qualsiasi profilo assente, anonimo, revocato, scaduto, cross-partner o con campo non autorizzato viene negato.
- Questo modulo è **solo una policy e un test**: non emette token, non legge dati protetti, non concede permessi Firestore e non è un'implementazione di SSO.
- Backend trusted (da implementare): verifica sessione Partner Hub e che l'account sia associato alla struttura; emette un token brevissimo, **limitato all'audience Analytics**, da usare come autorizzazione di richiesta verso un endpoint dati autenticato. Nessun segreto persistente nell'URL o nel bundle.
- Backend dati (da implementare): rivalida sessione, status e scadenza grant **a ogni richiesta**, determina stagione/sezioni/campi e restituisce una proiezione ridotta. La query Firebase usa credenziali server con autorizzazione verificata; la risposta non contiene documenti `historicalSeasonRecords` o `ticketSales` grezzi.
- Quando l'iframe deve scambiare messaggi con il Hub, usare **origin allowlist rigorosa** e challenge/session-binding; l'origin check è complementare, non sostituisce l'autorizzazione backend. Gestire correttamente cookie third-party bloccati: preferire un token di sessione limitato trasportato tramite canale controllato.
- Sessione terminata o grant revocato: nuove letture negate e dati locali azzerati. Non memorizzare dati riservati in cache pubbliche o localStorage.
- Firestore non deve introdurre alcuna regola `allow get` anonima per dati analitici riservati. Un eventuale link esterno per persone nominate deve utilizzare identità verificata e grant esplicito; **niente link bearer anonimo** in questa fase.
- Accessibilità, stampa/PDF e tutte le sette tab originali devono essere verificate prima di collegare l'iframe reale.

## Integrazione in più PR, senza regressioni
1. PR Analytics #59: solo contratto e test di negazione. Mantenere Draft, nessun merge/deploy.
2. PR separata Partner Hub: mappare sessione e establishmentId reale. Non inserire un URL condiviso prima che l'endpoint autenticato esista.
3. Backend DNS Core con endpoint per session exchange e dati ridotti; prova revoca/expiry/IDOR con account di almeno due strutture diverse.
4. UI Analytics riutilizza le sette tab e i componenti originali, con blocco delle sezioni non concesse e dati **proiettati server-side**. Zero-loss obbligatorio; non eliminare dataset, migrarli su Firebase prima di togliere gli import statici.
5. Verificare Workspace Admin/area/AT e Partner Hub con due strutture; test iframe, login/logout, refresh, stampa, URL diretto, token scaduto, revoca e tentativi di lettura incrociata.
6. Cutover con PR distinta e rollback, soltanto dopo approvazione e CI completamente verde.

## Vincoli di rollout
La pagina Analytics corrente su GitHub Pages continua a usare il bundle storico: il solo login UI non protegge dati incorporati nel bundle pubblico. Non chiamare questa migrazione completata o sicura finché il bundle legacy non è stato sostituito **senza perdita funzionale**, e finché Firestore production rules / backend non sono collaudati.
