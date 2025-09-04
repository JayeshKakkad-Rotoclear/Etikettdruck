# ADR-0003: JWT Session Hybrid Authentication

Status: Accepted
Date: 2025-01-25

## Context
Need stateless JWT benefits (scalable clients) plus ability to revoke/track sessions centrally for security.

## Decision
Issue signed JWTs bound to a server-side session record (DB) including IP binding option for risk mitigation.

## Consequences
Pros: Revocation, auditing, horizontal scaling. Cons: Extra DB lookups on validation.
