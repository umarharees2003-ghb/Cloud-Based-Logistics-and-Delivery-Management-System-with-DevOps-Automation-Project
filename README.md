# Routeflow

Routeflow is a full-stack logistics and delivery management system built with React/Vite, Express, MongoDB/Mongoose, Nginx, Docker Compose, Prometheus, and Grafana.

## Architecture

- React/Vite frontend
- Express REST API
- MongoDB persistence
- JWT authentication and role-based authorization
- Nginx reverse proxy for `/api`
- Docker Compose application stack
- Prometheus metrics and Grafana dashboards
- Jest/Supertest backend coverage

## Local development

Requirements: Node.js 18+, npm, MongoDB, and Docker Engine with Compose.

```powershell
cd Back-End
npm install
Copy-Item .env.example .env
npm run dev

cd ..\Front-End
npm install
npm run dev
```

## Configuration

Copy `.env.example` to `.env` at the repository root for Docker Compose. Generate a strong JWT secret and Grafana password; never commit real secrets.

Backend variables are documented in `Back-End/.env.example`.

## Docker

```powershell
Copy-Item .env.example .env
docker compose up -d --build frontend backend mongodb
docker compose ps
```

Frontend is available at `http://localhost:8080`, backend health at `http://localhost:5000/api/health`, and Docker API traffic through `http://localhost:8080/api`.

MongoDB data is retained in the named `mongodb_data` volume.

## Tests and builds

```powershell
cd Back-End
npm test

cd ..\Front-End
npm run build
```

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/deliveries`
- `GET/POST/PATCH /api/drivers`
- `GET /api/dashboard`, `GET /api/reports`
- `GET/PATCH /api/users`
- `GET/PATCH /api/notifications`
- `GET /api/tracking/:trackingNumber`

Protected endpoints require `Authorization: Bearer <JWT>`.

## Git workflow

Development is performed on `routeflow-v2`, tested, and transferred to `dinura` with normal merges or cherry-picks. Avoid force pushes and do not overwrite teammate commits.

## CI/CD

GitHub Actions runs backend tests, frontend builds, and Docker image build verification. Continuous deployment is not enabled automatically.

## Troubleshooting

- Confirm MongoDB and backend containers are running with `docker compose ps`.
- Check logs with `docker compose logs backend`.
- If Compose reports missing variables, ensure `.env` exists and contains `JWT_SECRET` and `GRAFANA_ADMIN_PASSWORD`.
- If the browser receives stale assets, clear the frontend cache or rebuild the frontend image.
