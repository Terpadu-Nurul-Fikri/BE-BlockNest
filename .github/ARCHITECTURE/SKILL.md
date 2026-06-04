---
name: architecture-review
description: "Read and assess a codebase architecture, with emphasis on Node.js, Express, Prisma, routes, controllers, middlewares, config, and database flow. Use when asked to read project architecture, explain what is good, identify risks, or suggest structural improvements."
argument-hint: "What part of the architecture should be reviewed?"
user-invocable: true
---

# Architecture Review Skill

## Purpose

Use this skill to inspect the structure of a backend project, trace how requests move through the app, and explain what is already strong about the architecture.

This skill is intended for this repository and similar Node.js + Express + Prisma services.

## When to Use

- Reviewing project architecture end-to-end
- Explaining request flow from HTTP route to database
- Evaluating separation of concerns
- Checking whether controllers, routes, middlewares, config, and utils are organized sensibly
- Summarizing architectural strengths, risks, and improvement opportunities

## Workflow

1. Start from the application entrypoint.
   - Open `src/index.js` first.
   - Identify app startup, middleware registration, route mounting, health checks, and shutdown handling.

2. Trace the request path.
   - Follow routes in `src/routes/`.
   - Open the matching controllers in `src/controllers/`.
   - Check whether middleware in `src/middlewares/` handles auth, validation, and errors before business logic runs.

3. Inspect infrastructure and data access.
   - Review `src/config/index.js` for database setup and lifecycle management.
   - Check how Prisma is used and whether access is centralized or scattered.
   - Verify whether schema-driven data access is consistent with `prisma/schema.prisma`.

4. Check supporting utilities.
   - Review `src/utils/` for token generation, validation helpers, and error helpers.
   - Look for reusable patterns instead of repeated logic in controllers.

5. Evaluate what is good.
   - Separate route, controller, middleware, config, and utility layers.
   - Centralized error handling instead of ad hoc response logic.
   - Clear startup sequence with database connection, health endpoint, and graceful shutdown.
   - ESM-based module structure that keeps imports consistent.
   - Domain-oriented route grouping such as auth, products, categories, reviews, users, and webhooks.

6. Evaluate risks and smells.
   - Controllers that mix validation, persistence, and response shaping too heavily.
   - Direct Prisma calls in many controllers without a service boundary if logic grows.
   - Missing input validation on mutation endpoints.
   - Route naming inconsistencies or duplicated behaviors across modules.
   - Startup or shutdown paths that do not fail clearly when the database is unavailable.

7. Produce the final summary.
   - State the overall architectural style in one sentence.
   - List the strongest design choices first.
   - Call out the highest-value risks or drift from the intended structure.
   - End with practical next steps, ordered from low effort to higher impact.

## Output Format

When reporting findings, keep the answer in this order:

1. Architecture overview
2. What is good
3. Risks or gaps
4. Suggested improvements

Use concrete file references and keep claims tied to observed code paths.
