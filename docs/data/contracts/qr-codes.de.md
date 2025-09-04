# Spezifikation: QR-Codes

Format: UTF-8, alphanumerisch, mit Prüfsumme (optionale künftige Ergänzung).

Strukturvorschlag:

```
<PRODUCT_CODE>-<TIMESTAMP>-<INCREMENT>
```

Die Validierung erfolgt in `input-validator.ts`.

---
