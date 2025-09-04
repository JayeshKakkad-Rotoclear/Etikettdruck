# Runbook für Sicherheitsvorfälle

Leitfaden zur Erkennung, Ersteinschätzung, Reaktion und Wiederherstellung bei Sicherheitsvorfällen.

## Vorfallkategorien

| Kategorie                        | Beispiele                        | Schwerepotenzial |
| -------------------------------- | -------------------------------- | ---------------- |
| Missbrauch der Authentifizierung | Brute-Force, Credential Stuffing | Hoch             |
| Rechteausweitung                 | Unautorisierte Rollenänderung    | Kritisch         |
| Datenoffenlegung                 | Sensible Daten in Logs           | Kritisch         |
| Integritätsangriff               | Manipuliertes JWT/Session        | Kritisch         |
| Verfügbarkeit                    | Zielgerichtetes DoS auf Auth/DB  | Hoch             |

## Erkennungssignale

| Signal                             | Quelle              | Maßnahme                                   |
| ---------------------------------- | ------------------- | ------------------------------------------ |
| Wiederholte fehlgeschlagene Logins | Auth-Logs / Metrik  | Schwellwert-Alarm & IP-Korrelation         |
| Plötzliche Rollenänderungen        | Audit-Log           | Legitimität des Initiators verifizieren    |
| Verdächtiges Geo-/IP-Muster        | Aggregierte Logs    | Mit Nutzerhistorie korrelieren             |
| Token-Validierungsfehler           | Auth-Modul          | Auf Manipulationsversuch prüfen            |
| Rate-Limit-Spitzen                 | Security-Middleware | Missbrauch vs. legitime Last unterscheiden |

## Ersteinschätzung (erste 15 Minuten)

1. Alarmgüte prüfen (Fehlalarm?)
2. Umfang bestimmen: Einzelbenutzer vs. systemweit
3. Flüchtige Beweise sichern (Logs, Sitzungszustände)
4. Bei aktiver Ausnutzung: eindämmen (Dienst isolieren / IP blocken / Konto deaktivieren)
5. Incident Lead und Protokollant benennen

## Eindämmungsmaßnahmen

| Szenario                 | Maßnahme                                                      |
| ------------------------ | ------------------------------------------------------------- |
| Kompromittiertes Konto   | Sitzungen invalidieren + Passwortzurücksetzung erzwingen      |
| Token-Fälschungsversuch  | Signier-Secret rotieren (alle Tokens invalidieren)            |
| Missbrauch von Rechten   | Erhöhte Rollen entziehen + Änderungen auditieren              |
| Koordinierte Brute-Force | Temporäre IP-Sperre + CAPTCHA/Warteschritt                    |
| Datenleck in Logs        | Betroffene Logs entziehen, aus durchsuchbarem Index entfernen |

## Beweissicherung

| Artefakt         | Methode                                           |
| ---------------- | ------------------------------------------------- |
| Auth-Logs        | Gefiltertes Zeitfenster exportieren               |
| Audit-Ereignisse | `security_audit`-Store abfragen (falls vorhanden) |
| DB-Änderungen    | Snapshots / Transaktionslogs vergleichen          |
| Netzwerkflüsse   | Firewall-/Reverse-Proxy-Logs                      |
| JWT-Beispiele    | Rohe Header/Body zur Validierung erfassen         |

## Kommunikationsvorlagen

### Interner Alarm (Slack / E-Mail)

```
Incident: Mögliche Rechteausweitung erkannt
Zeit: 2025-09-04 14:22 UTC
Umfang: 1 Benutzerkonto von ROLE_USER zu ROLE_ADMIN erhöht
Ergriffene Maßnahmen: Session invalidiert, Konto gesperrt bis Prüfung
Nächste Schritte: Audit-Kette prüfen, Legitimität des Initiators bestätigen
Lead: <Name>
```

### Stakeholder-Zusammenfassung (nach Eindämmung)

```
Zusammenfassung: Unautorisierter Versuch zur Rollen-Erhöhung eingedämmt.
Auswirkung: Kein bestätigter Datenzugriff über ursprüngliche Berechtigungen hinaus.
Abhilfe: Alarm bei Rollenänderungs-Häufung ergänzt, Token-Secret rotiert.
Follow-up: Zusätzlichen Bestätigungsschritt für Admin-Erhöhungen einführen.
```

## Beseitigung & Wiederherstellung

| Schritt | Maßnahme                                                    |
| ------- | ----------------------------------------------------------- |
| 1       | Ausgenutzte Schwachstelle/Fehlkonfiguration beheben         |
| 2       | Anmeldedaten/Secrets rotieren                               |
| 3       | Kompromittierte Komponenten neu aufbauen (falls nötig)      |
| 4       | Sauberen DB-Snapshot wiederherstellen (bei Datenkorruption) |
| 5       | Nutzerzugänge schrittweise wieder freigeben                 |
| 6       | Monitoring vorübergehend verschärfen                        |

## Ursachenanalyse (RCA)

Enthält:

* Ereignistimeline
* Erkennungspfad
* Auswirkungen
* Erfolgsfaktoren der Eindämmung
* Präventionslücken
* Maßnahmen (Owner + Fälligkeitsdatum)

## Checkliste präventiver Kontrollen

| Kontrolle                                     | Status        |
| --------------------------------------------- | ------------- |
| Durchsetzung starker Passwort-Richtlinien     | TODO          |
| Rate Limiting auf Auth-Endpunkten             | Implementiert |
| Audit-Logging für Rollenänderungen            | Implementiert |
| Rotationsplan für JWT-Signierschlüssel        | TODO          |
| Session-Timeout bei Inaktivität               | Implementiert |
| IP-Drosselung bei Brute-Force                 | Implementiert |
| Bestätigung für Admin-Aktionen (Step-up-Auth) | TODO          |

## Härtung nach dem Vorfall

* Anomalieerkennung für Geografie-Wechsel von Sessions
* WebAuthn für privilegierte Rollen
* Honey-Tokens / Decoy-Accounts
* Automatische Sitzungsbeendigung bei Passwortänderung

## Eskalationsmatrix

| Eskalation an       | Wann                                       |
| ------------------- | ------------------------------------------ |
| Entwicklungsleitung | Technisch komplexe Eindämmung              |
| Security Officer    | Datenexfiltration vermutet                 |
| Legal / Compliance  | Personenbezogene Daten bestätigt betroffen |
| Management          | Vorfall > 2 Stunden ungelöst               |

---

**Status:** Entwurf (Kontakt- & Eskalationsrichtlinie anpassen)

---
