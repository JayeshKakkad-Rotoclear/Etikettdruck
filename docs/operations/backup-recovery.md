# Backup & Recovery

| Aspect | Approach |
| ------ | -------- |
| DB Backups | Nightly logical dump + weekly base backup |
| Retention | 30 days rolling |
| Verification | Monthly restore test |
| Disaster Recovery | Restore latest full + incremental logs |

Recovery Steps:
1. Identify failure scope
2. Choose most recent clean backup
3. Restore to new instance
4. Point app to restored DB
5. Post-mortem & prevention actions
