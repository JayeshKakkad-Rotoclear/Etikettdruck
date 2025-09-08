# Quality Control Workflow

1. **Preparation:** Ensure printer & QR scanners operational
2. **Scan / Input:** Operator enters or scans batch identifiers
3. **Validation:** Client applies input validation (`src/lib/input-validator.ts`)
4. **Recording:** Server persists results & prints labels
5. **Review:** Management reviews dashboard metrics
6. **Audit:** Security events logged for anomalies

Swimlane (high-level):
```
Operator -> Web App -> API -> DB -> Printer -> Operator
```
