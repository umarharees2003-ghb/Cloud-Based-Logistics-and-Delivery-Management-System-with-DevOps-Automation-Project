# Routeflow

React 18 + Vite frontend, Express REST API, MongoDB/Mongoose persistence, JWT authentication, Nginx, Docker Compose, GitHub Actions, Prometheus and Grafana. The original page structure, role selection, navigation and dashboard shells are preserved, with navy/ocean/teal styling and optimized local logistics photographs. All operational records come from the API; empty databases show empty states.

## Run with Docker (PowerShell)

Requirements: Docker Desktop running with Linux containers, Docker Compose, and free ports 8080 and 5001. In this workspace port 5000 belongs to an existing Node service; the ignored local `.env` intentionally sets `BACKEND_PORT=5001`, as approved by the user. Nginx always uses `backend:5000` internally. The backend host port binds to loopback. Nginx replaces incoming forwarded client-IP headers and the Docker backend explicitly trusts one proxy hop for authentication rate limiting; local standalone backend defaults to zero trusted hops.

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

Open http://localhost:8080. Backend on http://localhost:5001; its container-internal port remains5000. MongoDB is internal on port 27017. The persistent volume is `routeflow-v2_mongodb_data` when run from this workspace. `docker compose down` retains it. Never use `down -v` on data you need.

An ignored local `.env` has already been generated for this workspace; do not overwrite it or commit it. A fresh environment must use its own secrets. Changing JWT_SECRET invalidates existing tokens. Compose passes only configured backend values; root `.env` is for Compose interpolation. Backend local development reads `Back-End/.env`.

## Accounts and permissions

Public signup always supports `customer` and `merchant`. Explicitly setting `ALLOW_PUBLIC_STAFF_SIGNUP=true` also permits `driver` and `logistics` self-registration for local development and academic demonstrations. The setting defaults to `false` and only works with `APP_ENV=development`. Production or staging deployment environments always reject public staff signup, even if the signup flag is accidentally set to true. Public signup never creates an `administrator`; that role always requires secure bootstrap or administrator provisioning.

The server checks the selected role against the enabled signup allowlist, stores that role in MongoDB, hashes the password, and issues a JWT using the stored role. Client-supplied permissions cannot grant additional access. Selecting a different role at login does not change account permissions; it must match the stored account role.

To bootstrap one administrator, explicitly supply operator-chosen credentials. The script refuses to overwrite any existing account and creates no example shipments or users:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = 'your-admin@example.com'
$env:BOOTSTRAP_ADMIN_PASSWORD = Read-Host 'New administrator password (12+ characters)'
docker compose exec -e BOOTSTRAP_ADMIN_EMAIL -e BOOTSTRAP_ADMIN_PASSWORD backend npm run seed
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
```

Sign in as that administrator. Team & access can create users, including privileged accounts, and change account status. Fleet management can create driver accounts with an explicit password, or `POST /api/drivers` can link an existing driver user via `userId`. Never reuse a default or example password. The seed script does not run automatically.

Customer/merchant access is tied to stored sender, merchant or creator IDs; drivers see assignments through their linked fleet profile ID. A self-registered driver account can open the original driver dashboard immediately; a fleet profile with real vehicle and service-zone details must be linked before delivery assignment. Signup does not invent vehicles or assignments. Legacy records that only store a name must be linked to the correct account by an operator. No automatic name matching or destructive migration is performed.

## Workflows

- Customers: own shipment tracking/history, shipment selection, profile updates.
- Merchants: create shipments, inspect/edit pending shipments, cancel pending shipments, shipment history, reports, business profile.
- Logistics: operational overview, search/filter, assignment, delivery lifecycle, fleet creation/editing/availability, reports.
- Drivers: own assignments, status updates, saved route stops, fleet details and profile.
- Administrators: operational tools plus account provisioning and status management.

Select an order identifier to inspect tracking and history or edit/cancel when permitted. API errors are shown; failed mutations never update the UI as successful. Dashboard counts and weekly volume are aggregated from stored, authorized records. Average duration uses actual pickup-to-delivery timestamps (with available legacy history fallback); customer ratings remain unavailable until measurements exist. The network map is a service-area illustration; live GPS, route optimization and external email are not configured.

## Local development

Use Node.js 22+ and MongoDB. The backend connects before listening and creates declared indexes additively; it never drops records or indexes. Existing conflicting indexes or duplicate unique keys must be resolved by an operator rather than deleting data.

```powershell
Set-Location Back-End
Copy-Item .env.example .env
# Edit JWT_SECRET and MONGODB_URI. Use a local MongoDB or a private connection URI.
# Local driver/logistics demos require APP_ENV=development and ALLOW_PUBLIC_STAFF_SIGNUP=true in Back-End/.env.
npm.cmd ci
npm.cmd run dev
```

In a second terminal:

```powershell
Set-Location C:\DEvops\routeflow-v2\Front-End
npm.cmd ci
npm.cmd run dev
```

Vite runs on port 5173 and proxies `/api` to the Docker backend at `http://127.0.0.1:5001` by default. Override the target with `ROUTEFLOW_API_TARGET=http://127.0.0.1:<port>` when needed. Compose allows the Vite origins `http://localhost:5173` and `http://127.0.0.1:5173` by default; production deployments should override `FRONTEND_ORIGIN` with only their explicit HTTPS frontend origins. `VITE_API_BASE_URL` is an optional build-time override; default `/api` is appropriate behind Nginx. Use `npm.cmd` on PowerShell systems that block npm.ps1.

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

Backend tests always create an isolated ephemeral MongoDB; no configured development database is cleared. First run may download a MongoDB binary. Browser tests start their own ephemeral APIs/databases on 5055/5056 (signup disabled/enabled) and Vite servers on 5179/5180/5181; those ports must be free. Chromium must be installed. UI checks extract original commit `6e80818` under ignored `.artifacts`, compare original controls/forms/navigation/shell geometry, verify the requested palette, compare enhanced desktop visual snapshots, and check mobile/tablet overflow. The Git history containing that baseline must be available (CI uses full checkout).

Browser screenshots and failure traces are in `Front-End/.artifacts`; coverage is in `Back-End/coverage`. Neither is committed. Legacy Cypress files are optional and require separately installed Cypress plus explicit `ADMIN_EMAIL`/`ADMIN_PASSWORD`; the supported automated suite is Playwright.

The Docker smoke script starts its own isolated Compose project using the current built images, creates disposable test users/deliveries, and verifies database/backend restart persistence. It never touches the running project records or removes existing volumes. Its uniquely named test volume is retained and printed for review. Use `node scripts/docker-smoke.cjs --proxy-only` for a read-only check of the running local stack.

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
- Driver/logistics signup rejected: for a local demo, set `APP_ENV=development` and `ALLOW_PUBLIC_STAFF_SIGNUP=true` in root `.env` and recreate the Docker backend; for standalone development, set both values in `Back-End/.env` and restart the API. With the setting disabled, use administrator provisioning. Administrator public signup is always rejected.
- Frontend-only Compose in `Front-End/` lacks the backend network; use the root Compose file for the full stack.
- Dependency audit: frontend and backend production dependencies passed the latest local audit. Six low-severity findings remain in the Jest/deepmerge development dependency chain; npm's proposed fix downgrades Jest across major versions and was not forced.

## Enable local self-registration for all non-admin roles

The original signup dropdown retains all five roles. To allow Customer, Merchant, Driver and Logistics Manager self-registration in this local Docker demo, add or update this line in the existing root `.env` without replacing its secrets or `BACKEND_PORT=5001` override:

```dotenv
APP_ENV=development
ALLOW_PUBLIC_STAFF_SIGNUP=true
```

Then rebuild/recreate the application:

```powershell
Set-Location C:\DEvops\routeflow-v2
docker compose up -d --build frontend backend mongodb
docker compose ps
```

Open http://localhost:8080 -> Sign up -> enter your name -> choose Customer / Sender, Business Client / Merchant, Delivery Driver / Courier, or Logistics Manager / Operations Staff -> enter an email and password (8+ characters) -> confirm the password -> Create account. The original role-specific dashboard opens automatically. After signing out, use Sign in, select the same role, and enter the registered credentials. Each account and its selected role are saved in MongoDB; JWTs contain that stored role.

The local ignored `.env` opts into this demonstration mode. Both tracked `.env.example` files default staff signup to `false`. The root example defaults `APP_ENV` to production. Local demos explicitly use `APP_ENV=development` and the signup flag together; `NODE_ENV=production` remains the optimized container runtime setting. Production/staging `APP_ENV` values prohibit staff signup regardless of the flag. Set the flag back to `false` and recreate the backend to stop new public staff registrations. Existing accounts and database records remain intact; changing the setting does not demote existing users.

`administrator` remains in the original dropdown but is always rejected by public signup with a field-specific role error. Create an administrator using the explicit bootstrap in Accounts and permissions, or through an authenticated administrator's Team & access page. Unsupported roles and arbitrary client permissions are rejected or ignored according to the server allowlist.

## Optional administrator-approved Logistics Manager provisioning

When demo signup is disabled, an administrator can still create a manager through the existing UI: Sign in as System Administrator -> Team & access -> Create account -> enter name/email/initial password -> select `logistics` -> Create user -> Sign out. Then select Logistics Manager / Operations Staff on Sign in and use the created credentials. Deliveries, New delivery, Fleet management and Analytics & reports are available; administrator-only user management remains forbidden.

The local administrator-approved helper remains available and prompts for passwords without storing them in files or command arguments:

```powershell
Set-Location C:\DEvops\routeflow-v2
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\New-LogisticsAccount.ps1 -Email logistics.local@routeflow.test
```

Enter an existing active administrator's email/password, then choose and confirm the manager password. The helper calls the protected `/api/users` endpoint with `role: logistics`, requires administrator authorization, and refuses to overwrite an existing email. If there is no administrator, first use the secure bootstrap documented above. For a standalone backend, temporarily set ADMIN_EMAIL, ADMIN_PASSWORD, LOGISTICS_EMAIL and LOGISTICS_PASSWORD and run `npm.cmd run provision:logistics` from Back-End; clear password variables afterwards. Optional LOGISTICS_NAME and loopback-only LOCAL_API_URL are supported.

## Enhancement review and manual checks (uncommitted working tree)

This enhancement intentionally makes no Git metadata changes: no staging, commits, branch operations, pushes, or remote workflows. Review with `git diff` and commit manually when ready.

Palette: Navy #102A43, Ocean #176B91, Teal #13B8A6, Background #F3F7FA and White #FFFFFF. Original buttons, forms, pages and five dashboards remain. Photo sources, license links and optimized sizes are documented in [IMAGE_LICENSES.md](IMAGE_LICENSES.md). Existing JPEG files are retained; current screens use the licensed local WebP assets.

Deliveries now record typed creation/edit/assignment/status events plus assigned/pickup/delivered/cancelled timestamps, avoid duplicate history for repeated requests, and return a conflict for concurrent saves. Status transitions, ownership and private tracking data remain enforced. API errors and HTTP logs include server-generated request IDs; logs redact nested credentials, bearer tokens and database passwords. Production unexpected errors return generic messages.

After starting Docker, visit localhost:8080 and check desktop/mobile welcome/login. Sign up for a permitted role, sign out and sign back in with the same role. As Logistics, create a delivery, add/link a real driver profile, assign it and update through In transit -> Out for delivery -> Delivered. Check tracking/history, terminal status protection and reports. Refresh to confirm saved state. New drivers start with empty assignments until a real fleet profile is linked. Account data and existing MongoDB volumes are preserved.

Reviewed Windows pixel snapshots live alongside ui-preservation.spec.js snapshots. Exact pixel checks run on Windows; other platforms run the portable structure, palette, photo and responsiveness checks without comparing different operating-system font rendering. When intentionally changing the visual design, review new screenshot artifacts before using `npm.cmd test -- --update-snapshots`; ordinary runs compare the saved references. No Git write occurs when these files are generated.
