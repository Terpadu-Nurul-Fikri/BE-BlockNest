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

### Daily Workflow

Use this quick checklist at the start of each work session to stay synced:

```bash
# Update main and your feature branch (if any)
git checkout main
git pull origin main

# If working on a feature branch, rebase or pull latest
git checkout feature/your-feature-name
git pull origin feature/your-feature-name
# or
git rebase main
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

### Pull Latest Changes

Before starting new work, pull the latest changes from the remote branch you are working on:

```bash
git checkout main
git pull origin main
```

If you are already on a feature branch, you can pull updates for that branch directly:

```bash
git pull origin feature/your-feature-name
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

This repository includes a ready-to-use pipeline at `.github/workflows/ci-cd.yml`.

### What the pipeline does

1. Install dependencies (`npm ci`)
2. Run tests (`npm test` when real tests exist)
3. Build (`npm run build --if-present`)
4. Upload code to VPS using SSH + rsync
5. Deploy with atomic release strategy (`releases/<commit_sha>` + `current` symlink)
6. Restart app using PM2 (or systemd)
7. Roll back automatically if deployment or health check fails

### Required GitHub Secrets

Set these in: **GitHub Repository -> Settings -> Secrets and variables -> Actions**

- `VPS_HOST` = VPS public IP / domain
- `VPS_USER` = SSH username
- `VPS_SSH_PRIVATE_KEY` = private key content used by GitHub Actions

### Optional GitHub Variables

Set these in: **GitHub Repository -> Settings -> Secrets and variables -> Actions -> Variables**

- `APP_NAME` (default: `be-blocknest`)
- `VPS_DEPLOY_PATH` (default: `/var/www/be-blocknest`)
- `PM2_PROCESS_NAME` (default: `be-blocknest-api`)
- `SERVICE_NAME` (if using systemd instead of PM2)
- `HEALTHCHECK_URL` (example: `https://api.yourdomain.com/health`)

### VPS one-time setup

Run this once on the VPS:

```bash
sudo bash scripts/deploy/vps-bootstrap.sh be-blocknest /var/www/be-blocknest deploy
```

Then edit production env file:

```bash
nano /var/www/be-blocknest/shared/.env
```

### SSH key setup for GitHub Actions

1. Generate a dedicated deploy key locally:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/blocknest_deploy_key
```

2. Add public key to VPS:

```bash
ssh-copy-id -i ~/.ssh/blocknest_deploy_key.pub deploy@YOUR_VPS_HOST
```

3. Add private key content to GitHub secret `VPS_SSH_PRIVATE_KEY`.

4. Test from local machine:

```bash
ssh -i ~/.ssh/blocknest_deploy_key deploy@YOUR_VPS_HOST
```

### PM2 setup example on VPS

```bash
cd /var/www/be-blocknest/current
pm2 start src/index.js --name be-blocknest-api
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy
```

### systemd setup example (alternative)

```bash
sudo tee /etc/systemd/system/be-blocknest.service > /dev/null <<'UNIT'
[Unit]
Description=BE-BlockNest API
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/be-blocknest/current
EnvironmentFile=/var/www/be-blocknest/shared/.env
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable be-blocknest
sudo systemctl start be-blocknest
```

### Manual rollback command

On the VPS:

```bash
export DEPLOY_PATH=/var/www/be-blocknest
export PM2_PROCESS_NAME=be-blocknest-api
bash scripts/deploy/vps-rollback.sh
```

### How GitHub connects to VPS (automation flow)

1. Push/merge to `main`
2. GitHub Actions starts workflow
3. Workflow loads SSH private key from GitHub Secrets
4. Workflow opens SSH connection to VPS
5. Workflow uploads source and executes `scripts/deploy/vps-deploy.sh`
6. VPS installs dependencies, applies migrations, updates `current` symlink, restarts app
7. If error occurs, rollback is executed automatically

### Modular customization

For other projects, update only these points:

- `NODE_VERSION` in workflow
- deploy variables (`APP_NAME`, `VPS_DEPLOY_PATH`, `PM2_PROCESS_NAME`)
- health check URL
- app start command in `scripts/deploy/vps-deploy.sh`
- migration command (if not Prisma)

This keeps CI/CD reusable while preserving the same release and rollback strategy.

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
