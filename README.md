# BE-BlockNest

Backend service for BlockNest, built with Node.js, Express, Prisma ORM, and PostgreSQL. This project follows a clean and scalable architecture suitable for production environments.

---

## Project Structure

```
BE-BlockNest/
├── node_modules/
├── src/
│   ├── config/           # External configurations (database, services)
│   ├── controllers/      # Business logic (request & response handling)
│   ├── middlewares/      # Middleware functions (auth, error handling)
│   ├── models/           # Data models (if needed beyond Prisma)
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility/helper functions
│   └── index.js          # Application entry point
├── .env                  # Environment variables (excluded from Git)
├── .gitignore
└── package.json
```

---

## Technology Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

---

## Environment Setup

Create a `.env` file in the root directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/blocknest_dev
PORT=3000
```

Ensure `.env` is listed in `.gitignore`.

---

## Installation

```
npm install
```

---

## Development

Run the application in development mode:

```
npm run dev
```

---

## Database Management

### Development

Use Prisma migrations during development:

```
npx prisma migrate dev
```

### Production

Apply migrations safely without data loss:

```
npx prisma migrate deploy
```

### Notes

- Each developer should use a local database instance.
- Do not connect development environments to the production database.
- All schema changes must go through migrations.

---

## API Structure

Base URL example:

```
https://api.yourdomain.com/api/v1
```

Example endpoints:

```
GET    /product
GET    /product/:id
POST   /product
PUT    /product/:id
DELETE /product/:id
```

---

## Git Workflow

This repository follows a structured Git workflow to ensure code quality and stability.

### Branching Strategy

- `main` → Production-ready code
- `feature/*` → New features
- `fix/*` → Bug fixes

### Development Flow

1. Sync with main branch:

```
git checkout main
git pull origin main
```

2. Create a new branch:

```
git checkout -b feature/your-feature-name
```

3. Commit changes:

```
git add .
git commit -m "feat: add product API"
```

4. Push to remote:

```
git push origin feature/your-feature-name
```

5. Open a Pull Request to `main`

6. Review and merge after approval

7. Delete branch after merge:

```
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Commit Message Convention

Use structured commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code improvement
- `docs:` Documentation changes
- `chore:` Maintenance tasks

Example:

```
feat: implement product CRUD endpoints
```

---

## Rules and Guidelines

- Do not push directly to `main`
- All changes must go through Pull Requests
- Ensure code is tested before submission
- Keep commits small and meaningful
- Do not commit sensitive data such as `.env`

---

## CI/CD Overview

Deployment is triggered automatically when changes are merged into the `main` branch.

Flow:

```
Push to main
   → CI/CD pipeline runs
   → Deploy to VPS
   → Apply database migrations
   → Restart application
```

---

## CI/CD Setup (GitHub Actions + VPS)

This repository uses the deployment workflow at `.github/workflows/deploy.yml`.

### What the workflow does

1. Build the application container image
2. Scan the image for vulnerabilities with Trivy (blocks deployment on CRITICAL/HIGH findings)
3. Upload the image artifact
4. Copy the image to the VPS over SSH
5. Deploy/update the service with `docker-compose`
6. Clean up dangling images on the VPS

> **Note:** The deployment flow is Docker-based. It does **not** use `rsync`, PM2, atomic release directories, or automatic rollback.

### Required GitHub Secrets

Set these in: **GitHub Repository → Settings → Secrets and variables → Actions**

Refer to `.github/workflows/deploy.yml` for the exact secret names. Typical values include:

- `VPS_HOST` – VPS public IP or domain
- `VPS_USERNAME` – SSH username on the VPS
- `VPS_SSH_KEY` – SSH private key content used by GitHub Actions
- `VPS_PORT` – SSH port (optional, defaults to 7878 in the workflow)

---

## Application Architecture

```
Client (Frontend)
        ↓
API (Express)
        ↓
Controller Layer
        ↓
Prisma ORM
        ↓
PostgreSQL Database
```

---

## Production Notes

- Use a process manager such as PM2
- Use NGINX as a reverse proxy
- Enable HTTPS (SSL)
- Monitor logs and application health

---

## License

This project is intended for internal or educational use unless otherwise specified.
