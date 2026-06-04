# Architecture Overview

This folder contains a concise description of the application's architecture and recommended folders/files to keep the architecture documentation centralized.

## Purpose

- Explain the high-level components and how they interact.
- Provide quick onboarding guidance for new contributors.

## High-Level Diagram

Client (Frontend) → API (Express) → Controller Layer → Prisma ORM → PostgreSQL

## Key Folders

- `src/config` — external service and environment configuration
- `src/controllers` — request handling and business logic
- `src/middlewares` — authentication, validation, error handling
- `src/routes` — route definitions
- `docs/architecture` — this folder (detailed design notes, diagrams)

## Recommendations

- Keep controllers thin and push business logic into services/helpers.
- Add sequence diagrams here for complex flows (checkout, payments).
- Document any infra (NGINX, Docker, CI pipeline) in this folder.

## Next Steps

- Add a `checkout-flow.md` and `payment-flow.md` with sequence diagrams.
