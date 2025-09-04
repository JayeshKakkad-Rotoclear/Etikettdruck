# Schema: Response Formats

Standard envelope (example):
```json
{ "success": true, "data": { /* payload */ }, "error": null }
```

Error format:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```
