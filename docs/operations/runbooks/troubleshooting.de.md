# Troubleshooting-Runbook

Operativer Leitfaden zur Diagnose und Behebung häufiger Produktionsprobleme.

## Schnelle Diagnose-Checkliste

1. Reagiert die App auf den Health-Check? (`/health`, falls implementiert)
2. Erhöhte Fehlerrate? (Metrik-Dashboard prüfen)
3. Kürzliches Deployment? (CI/CD-Historie)
4. Datenbankkonnektivität OK? (pg-Verbindungen, Latenz)
5. Ungewöhnliche Auth-Fehler? (Audit-Log)
6. Ressourcenauslastung? (CPU, RAM, Disk, File Descriptors)

## Häufige Probleme

### 1. Hohe Fehlerrate (5xx)

| Schritt | Maßnahme                        | Befehl/Tool           |
| ------- | ------------------------------- | --------------------- |
| 1       | Fehlende Routen identifizieren  | Metrik-Dashboard      |
| 2       | Jüngste Deploy-Diff inspizieren | `git show`            |
| 3       | Logs auf Stacktraces prüfen     | Loki / Logs tailen    |
| 4       | DB-Konnektivität verifizieren   | Einfache `psql`-Query |
| 5       | Bei Regression rollback         | CI/CD-Rollback        |

### 2. Langsame Antworten

1. Latenz-Histogramm p95/p99 prüfen
2. DB-Bound? (Query-Zeiten)
3. Blocking-Logs oder lange Queries suchen
4. Temporär Profiling aktivieren (detailliertes Logging)
5. Horizontal skalieren, falls Sättigung

### 3. Spike bei Auth-Fehlschlägen

| Ursache                      | Abhilfe                                      |
| ---------------------------- | -------------------------------------------- |
| Falsche Secret-Rotation      | Env-Variablen zwischen Nodes synchronisieren |
| Inkonsistenter Session-Store | Alte Sessions leeren / Cluster neu starten   |
| Brute-Force-Versuch          | IP temporär blocken, Security-Event auslösen |

### 4. Probleme im Drucker-Subsystem

| Symptom                    | Maßnahme                                      |
| -------------------------- | --------------------------------------------- |
| Jobs werden nicht gesendet | Netzwerk-Erreichbarkeit zur Drucker-IP prüfen |
| Hohe Retry-Anzahl          | Job-Queue-Handler-Logs prüfen                 |
| Falsches Etikettformat     | ZPL-Vorlagenversionen validieren              |

### 5. Fehler bei QR-Generierung

| Symptom         | Maßnahme                                                    |
| --------------- | ----------------------------------------------------------- |
| Leere QR-Codes  | DB-Zeilen auf fehlendes Feld `qr_code_automatiktest` prüfen |
| Falscher Inhalt | Encoding-Logik & Input-Sanitizer validieren                 |
| Hohe Latenz     | Wiederholte Generierungen cachen (falls sinnvoll)           |

### 6. Sättigung DB-Verbindungen


1. Aktive vs. max. Verbindungen prüfen
2. Langläufer-Queries identifizieren
3. Poolgröße vorsichtig erhöhen
4. Indizes für häufige Scans ergänzen

### 7. Verdacht auf Memory-Leak


1. Heap-Snapshot aktivieren (falls unkritisch)
2. Objektretention via Inspector prüfen
3. Große In-Memory-Caches auf Begrenzung prüfen
4. Prozess temporär neu starten (Mitigation)

## Log-Muster

| Muster                   | Bedeutung                    | Maßnahme                    |
| ------------------------ | ---------------------------- | --------------------------- |
| `rate_limited`           | Flut / Missbrauch            | Quell-IPs prüfen            |
| `auth_failed`            | Ungültiger Login             | Auf Brute-Force achten      |
| `db_slow_query`          | Query > Schwellwert          | Ausführungsplan analysieren |
| `printer_dispatch_error` | Drucker nicht erreichbar     | Netzwerk / Config prüfen    |
| `qr_generation_error`    | Input ungültig/Encode-Fehler | Upstream-Input validieren   |

## Eskalationsmatrix

| Schweregrad | Kriterium                     | Maßnahme              | Benachrichtigen |
| ----------- | ----------------------------- | --------------------- | --------------- |
| Kritisch    | Ausfall > 5 min / Datenrisiko | Incident-Kanal öffnen | Dev + Security  |
| Hoch        | Fehlerrate > 5 % anhaltend    | Hotfix oder Rollback  | Dev             |
| Mittel      | Performance-Regression        | Fix einplanen         | Product         |
| Niedrig     | Minor-Defekt / kosmetisch     | Backlog-Eintrag       | Product         |

## Temporäre Mitigations

| Problem               | Mitigation                         |
| --------------------- | ---------------------------------- |
| Latenz im DB-Hot-Path | In-Memory-Cache-Layer hinzufügen   |
| Druckerüberlastung    | Queue mit Ratenbegrenzung          |
| Hohe Auth-Last        | Exponentielles Backoff im Login-UI |
| Erhöhte Brute-Force   | IP-Deny-Rule / WAF-Regel           |

## Forensische Sicherung (bei Bedarf)

1. Fehlerlogs (Zeitfenster) exportieren
2. DB-Status erfassen: aktive Verbindungen, Slow Queries
3. Konfigurationssnapshot archivieren
4. Problematische Payload-Beispiele sichern

## Nach dem Vorfall

* RCA innerhalb von 48 Stunden
* Abhilfemaßnahmen als Tickets
* Runbook aktualisieren, falls Lücke entdeckt
* Zusammenfassung an Stakeholder kommunizieren

## Tooling-Wunschliste

* Automatische Anomalieerkennung
* Distributed Tracing (OpenTelemetry)
* Canary-Transaktionsskript
* Synthetischer Health-Check für das Drucker-Subsystem

---