# Debugging

Tools:

- Browser DevTools
- `console.log` with structured context (avoid secrets)
- Prisma query logging (enable via env vars)
- MkDocs + TypeDoc for API surface understanding

Common Issues Table (expand later):

| Symptom | Likely Cause | Next Step |
| ------- | ------------ | --------- |
| 401 responses | Expired / invalid JWT | Refresh or re-authenticate |
| Slow queries | Missing index | Examine EXPLAIN plan |
