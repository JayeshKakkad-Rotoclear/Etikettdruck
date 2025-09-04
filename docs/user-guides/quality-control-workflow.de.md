# Qualitätskontroll-Workflow

1. **Vorbereitung:** Sicherstellen, dass Drucker & QR-Scanner betriebsbereit sind
2. **Scan/Eingabe:** Bediener erfasst oder scannt Chargenkennungen
3. **Validierung:** Client wendet Eingabevalidierung an (`src/lib/input-validator.ts`)
4. **Erfassung:** Server speichert Ergebnisse & druckt Etiketten
5. **Review:** Management überprüft Dashboard-Kennzahlen
6. **Audit:** Sicherheitsereignisse werden auf Auffälligkeiten protokolliert

Swimlane (High-Level):

```
Bediener -> Web-App -> API -> DB -> Drucker -> Bediener
```

---