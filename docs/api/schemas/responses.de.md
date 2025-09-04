# Schema: Antwortformate

Standard-Hülle (Beispiel):

```json
{ "success": true, "data": { /* payload */ }, "error": null }
```

Fehlerformat:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

---