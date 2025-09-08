# ADR-0001: Multi-Schema Database

Status: Accepted
Date: 2025-07-15

## Context
Need isolation between product lines and shared core tables while using a single PostgreSQL instance.

## Decision
Adopt multiple PostgreSQL schemas to logically partition domain data (e.g., core, c2, cpro, cbasic) with Prisma managing models.

## Consequences
Pros: Logical isolation, simpler backups per schema.

Cons: Slightly more complex migrations & cross-schema queries.
