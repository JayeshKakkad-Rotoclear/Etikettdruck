# Debugging

Tools:

* Browser-DevTools
* `console.log` mit strukturiertem Kontext (keine Secrets)
* Prisma-Query-Logging (per Env-Variablen aktivieren)
* MkDocs + TypeDoc, um die API-Oberfläche zu verstehen

Tabelle häufiger Probleme (später erweitern):

| Symptom           | Wahrscheinliche Ursache     | Nächster Schritt                   |
| ----------------- | --------------------------- | ---------------------------------- |
| 401-Antworten     | Abgelaufenes/ungültiges JWT | Erneuern oder neu authentifizieren |
| Langsame Abfragen | Fehlender Index             | EXPLAIN-Plan prüfen                |

---
