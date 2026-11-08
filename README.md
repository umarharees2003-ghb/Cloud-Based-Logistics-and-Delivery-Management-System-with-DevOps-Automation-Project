# Routeflow

React 18 + Vite frontend, Express REST API, MongoDB/Mongoose persistence, JWT authentication, Nginx, Docker Compose, GitHub Actions, Prometheus and Grafana. The original UI stylesheet, welcome page, role selection, navigation and dashboard shells are preserved. All operational records come from the API; empty databases show empty states.

## Run with Docker (PowerShell)

Requirements: Docker Desktop running with Linux containers, Docker Compose, and free ports 8080 and 5000. In this workspace port 5000 belongs to an existing Node service; the ignored local `.env` intentionally sets `BACKEND_PORT=5001`, as approved by the user. Nginx always uses `backend:5000` internally. The backend host port binds to loopback. Nginx replaces incoming forwarded client-IP headers and the Docker backend explicitly trusts one proxy hop for authentication rate limiting; local standalone backend defaults to zero trusted hops.

```powershell
Set-Location C:\DEvops\routeflow-v2
# For a fresh checkout only (preserve any existing .env):
Copy-Item .env.example .env
# Edit .env: replace JWT_SECRET with at least 32 random characters.
# Set a unique GRAFANA_ADMIN_PASSWORD if using monitoring.
# Use BACKEND_PORT=5001 when port 5000 is occupied.
docker compose up -d --build frontend backend mongodb
docker compose ps
```

Open http://localhost:8080. Backend on http://localhost:5001 in this workspace, or http://localhost:5000 with the default host port. MongoDB is internal on port 27017. The persistent volume is `routeflow-v2_mongodb_data` when run from this workspace. `docker compose down` retains it. Never use `down -v` on data you need.

An ignored local `.env` has already been generated for this workspace; do not overwrite it or commit it. A fresh environment must use its own secrets. Changing JWT_SECRET invalidates existing tokens. Compose passes only configured backend values; root `.env` is for Compose interpolation. Backend local development reads `Back-End/.env`.

## Accounts and permissions

Public signup supports customers and merchants. Administrator, logistics and driver accounts must be provisioned by an administrator. Selecting a role in the browser does not grant access; it must match the stored account role.

To bootstrap one administrator, explicitly supply operator-chosen credentials. The script refuses to overwrite any existing account and creates no example shipments or users:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = 'your-admin@example.com'
$env:BOOTSTRAP_ADMIN_PASSWORD = Read-Host 'New administrator password (12+ characters)'
docker compose exec -e BOOTSTRAP_ADMIN_EMAIL -e BOOTSTRAP_ADMIN_PASSWORD backend npm run seed
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
```

Sign in as that administrator. Team & access can create users, including privileged accounts, and change account status. Fleet management can create driver accounts with an explicit password, or `POST /api/drivers` can link an existing driver user via `userId`. Never reuse a default or example password. The seed script does not run automatically.

Customer/merchant access is tied to stored sender, merchant or creator IDs; drivers see assignments through their linked fleet profile ID. Legacy records that only store a name must be linked to the correct account by an operator. No automatic name matching or destructive migration is performed.

## Workflows

- Customers: own shipment tracking/history, shipment selection, profile updates.
- Merchants: create shipments, inspect/edit pending shipments, cancel pending shipments, shipment history, reports, business profile.
- Logistics: operational overview, search/filter, assignment, delivery lifecycle, fleet creation/editing/availability, reports.
- Drivers: own assignments, status updates, saved route stops, fleet details and profile.
- Administrators: operational tools plus account provisioning and status management.

Select an order identifier to inspect tracking and history or edit/cancel when permitted. API errors are shown; failed mutations never update the UI as successful. Dashboard counts and weekly volume are aggregated from stored, authorized records. Average duration and ratings are shown as unavailable until measurements exist. The network map is a service-area illustration; live GPS, route optimization and external email are not configured.

## Local development

Use Node.js 22+ and MongoDB. The backend connects before listening and creates declared indexes additively; it never drops records or indexes. Existing conflicting indexes or duplicate unique keys must be resolved by an operator rather than deleting data.

```powershell
Set-Location Back-End
Copy-Item .env.example .env
# Edit JWT_SECRET and MONGODB_URI. Use a local MongoDB or a private connection URI.
npm.cmd ci
npm.cmd run dev
```

In a second terminal:

```powershell
Set-Location C:\DEvops\routeflow-v2\Front-End
npm.cmd ci
npm.cmd run dev
```

Vite runs on port 5173 and proxies `/api` to localhost:5000. To use the Docker backend on 5001, set `$env:ROUTEFLOW_API_TARGET='http://localhost:5001'` before starting Vite. `VITE_API_BASE_URL` is an optional build-time override; default `/api` is appropriate behind Nginx. Use `npm.cmd` on PowerShell systems that block npm.ps1.

## Tests and verification

```powershell
Set-Location C:\DEvops\routeflow-v2\Back-End
npm.cmd ci
npm.cmd test
npm.cmd run test:coverage
Set-Location ..\Front-End
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd test
npm.cmd run build
Set-Location ..
docker compose config --quiet
docker compose exec -T frontend nginx -t
node scripts/docker-smoke.cjs
```

Backend tests always create an isolated ephemeral MongoDB; no configured development database is cleared. First run may download a MongoDB binary. Browser tests start their own ephemeral API/database on 5055 and Vite servers on 5179/5181; those ports must be free. Chromium must be installed. UI checks extract original commit `6e80818` under ignored `.artifacts`, compare welcome pixels, auth geometry, all five dashboard shells, stylesheet bytes and mobile overflow. The Git history containing that baseline must be available (CI uses full checkout).

Browser screenshots and failure traces are in `Front-End/.artifacts`; coverage is in `Back-End/coverage`. Neither is committed. Legacy Cypress files are optional and require separately installed Cypress plus explicit `ADMIN_EMAIL`/`ADMIN_PASSWORD`; the supported automated suite is Playwright.

The Docker smoke script creates one uniquely named test account and shipment, then restarts this project's MongoDB/backend to verify persistence. Run it against a local test stack. It never deletes data or volumes.

## API

See [API documentation](Back-End/API_DOCUMENTATION.md). Main groups: `/api/auth`, `/api/users`, `/api/deliveries`, `/api/drivers`, `/api/notifications`, `/api/dashboard`, `/api/reports`, `/api/tracking/:trackingNumber`. Authentication uses Bearer JWT. Backend ownership checks apply to details, lists, edits, cancellation, history, driver availability and reports.

Public tracking requires the opaque tracking number and omits exact addresses, names and private remarks. The authenticated detail endpoint exposes the full record only to authorized accounts. Logout removes the browser token; tokens are stateless and remain valid until expiry. Suspension is enforced immediately by reading the user record on each request.

## CI/CD and monitoring

GitHub Actions runs backend integration/coverage, frontend build and real browser tests, then builds and starts Compose and verifies health, Nginx proxy and restart persistence. No live cloud deployment or registry push is performed. Backend production dependency installation and both lockfiles are reproducible. Optional monitoring remains available:

```powershell
docker compose --profile monitoring up -d prometheus grafana
```

Prometheus: localhost:9090. Grafana: localhost:3000 using the configured credentials. Grafana refuses startup without a password. Restrict monitoring and `/metrics` at the infrastructure boundary when deploying publicly. Existing provisioning and dashboards are retained.

## Git workflow

Work is developed on `routeflow-v2` in logical database, backend, frontend, DevOps and test commits. Fetch and compare before integrating with teammates. Never force push or overwrite teammate history. **Transfer to `dinura` is blocked:** fetched `origin/dinura` is an unrelated frontend-only repository layout at root; it has no merge base with `routeflow-v2`. Work remains committed locally; no remote branch is overwritten. A team-approved reconciliation of histories and folder structure is needed before integration.

## Troubleshooting

- Port bind error: preserve existing services and set `BACKEND_PORT=5001` in root `.env`; frontend proxy requires no change.
- Docker unavailable: start Docker Desktop with Linux containers; inspect `docker compose ps` and `docker compose logs --tail=100`.
- API 401/expired token: sign in again. 403: use the matching stored role and an authorized account.
- Database readiness 503: inspect the backend MongoDB URI/network and MongoDB health. Do not remove the named volume.
- Blank deliveries: check API errors first; an empty authorized database correctly contains no example records.
- Staff signup rejected: bootstrap an administrator, then provision through Team & access or the administrator API.
- Frontend-only Compose in `Front-End/` lacks the backend network; use the root Compose file for the full stack.
- Dependency audit: frontend and backend production dependencies passed the latest local audit. Six low-severity findings remain in the Jest/deepmerge development dependency chain; npm's proposed fix downgrades Jest across major versions and was not forced.
