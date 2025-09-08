# ADR-0002: SvelteKit Full-Stack

Status: Accepted
Date: 2025-07-20

## Context
Need unified framework for SSR, routing, API endpoints, and SPA interactivity.

## Decision
Use SvelteKit for both UI and lightweight server endpoints (internal APIs) instead of separate frontend/backend repos.

## Consequences
Pros: Faster development, shared types, simplified deployment.

Cons: Coupled deployment, potential scaling limits for heavy APIs.
