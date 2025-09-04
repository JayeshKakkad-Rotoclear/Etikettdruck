# Operations Environment Setup

Checklist for new environment (staging/production):
1. Provision PostgreSQL (version & extensions)
2. Set required environment variables (`JWT_SECRET`, DB creds, printer IP defaults)
3. Run migrations & seed admin
4. Configure monitoring (Prometheus / Grafana dashboards)
5. Set up backup schedule & retention
