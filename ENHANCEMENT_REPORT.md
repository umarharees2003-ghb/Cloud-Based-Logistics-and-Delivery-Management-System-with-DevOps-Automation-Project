# Routeflow enhancement report - 8 November 2026

## Review state

All changes are unstaged and uncommitted in the existing routeflow-v2 working directory. No Git write operations, staging, commits, branch changes, history changes, pushes, remote workflows or cloud deployments were performed. Existing local commit remains1ac30eb. Git was used only for read-only inspection and reading the original UI baseline into test artifacts.

## Frontend

Applied Navy#102A43, Ocean#176B91, Teal#13B8A6, Background#F3F7FA and White#FFFFFF. Retained original pages, all controls/navigation/forms and five dashboards. Improved card/button shadows, hover/focus states, readable muted text, keyboard focus, reduced motion, responsive modal scrolling and zero-value charts. Replaced unlicensed-provenance photo usage in current screens with three verified reusable stock photographs and responsive local WebP variants, accurate alternatives and dimensions. See IMAGE_LICENSES.md for photographers, source pages, license links and the assets manifest. Original JPEG files remain for compatibility and are no longer used by current UI.

The landing preview now explicitly illustrates the product rather than claiming fabricated live deliveries, on-time rates or route optimization. Reports show actual measured delivery counts and duration when available.

## Backend

Added typed delivery audit events (creation, edit, assignment/unassignment and status), milestone timestamps, validated edit/status/assignment payloads and pagination queries, unambiguous driver-ID assignment, idempotent repeated mutations, and optimistic concurrency conflict responses. Assignment notifications are created after persistence succeeds. Closed deliveries reject inappropriate edits. Existing endpoint paths and response aliases are retained; errors include request IDs and unexpected production500 responses hide internal details.

HTTP logs are structured and correlated with server-generated UUIDs. Nested passwords/tokens/authorization, bearer strings and database credentials are redacted in all logger output formats. Routine health probes are suppressed; metric route labels avoid arbitrary raw paths/queries.

Customer/merchant public signup remains available. Driver/logistics public signup now requires BOTH APP_ENV=development and ALLOW_PUBLIC_STAFF_SIGNUP=true. Production/staging deployment environments reject staff signup even when the flag is true. Administrator public signup is always rejected. NODE_ENV=production still controls the optimized local Docker runtime; it does not classify an explicitly configured academic demo as a production deployment. Selected permitted roles are stored in MongoDB and JWTs are generated from trusted records. The ignored local .env already opts into the development demo without changing its existing secrets/port override.

## Database

Additive optional assignedAt, pickedUpAt, deliveredAt, cancelledAt and eventType fields, validation and compound indexes preserve legacy documents. Authorization remains based on account and assigned-driver relationships, never display names. Summary statistics and driver workloads use aggregate queries; timing analytics use valid milestone dates or legacy history where available. No destructive migration, record deletion or original-volume removal occurred.

The original MongoDB volume remains routeflow-v2_mongodb_data. Disposable smoke users/deliveries are isolated in their own database and new volume, not inserted into the original database.

## DevOps

Backend production dependencies are installed once in a cacheable stage; runtime copies only required files and uses a non-root user. Frontend build excludes browser-test dependencies; runtime is unprivileged Nginx. Compose preserves frontend8080, backend127.0.0.1:5001, internalMongo27017 and named database persistence. Added init/graceful shutdown, bounded log rotation, robust HTTP/Mongo health checks and explicit deployment environment configuration.

Nginx re-resolves Docker DNS after backend recreation, preserves /api routing, replaces untrusted forwarding headers, sets bounded timeouts/security/cache headers, compresses text assets and avoids caching API responses. Optional monitoring keeps persistent storage, loopback host ports, and corrected Grafana dashboard provisioning paths. CI configuration includes bounded jobs, browser checks and isolated Docker smoke tests. No hosted workflow was run.

## Tests actually executed

| Verification | Result |
| --- | --- |
| npm.cmd test -- --silent in Back-End | PASS:11 suites,102 tests |
| Final focused operationalLogging suite after probe-log refinement | PASS:3 tests |
| npm.cmd run build in Front-End and Node22 Docker production frontend build | PASS |
| Browser suite with new enhanced screenshot references | PASS:23 tests |
| npm.cmd test in Front-End without updating references | PASS:23 tests, including visual comparison |
| Original controls/forms/navigation/shell comparison, palette, local photos,390/768px layouts, all five mobile dashboards | PASS |
| Registration/login for permitted roles, forbidden admin registration, JWT/ownership checks | PASS in backend/browser/isolated Docker |
| Delivery creation/edit/history/tracking, driver enrollment/assignment/status, milestones and real counts | PASS |
| MongoDB/backend restart persistence | PASS in separate disposable Docker project |
| docker compose config --quiet and monitoring-profile configuration | PASS |
| docker compose up -d --build --wait frontend backend mongodb | PASS:all three healthy |
| nginx -t and mainstack --proxy-only smoke checks | PASS |
| git diff --check; staged diff inspection | PASS; nothing staged |

The isolated runner initially failed before API execution because Docker Desktop returned a bare image digest. Image lookup was corrected to canonical locally built image IDs with no pulling, then the full isolated test passed. No test failures remain open.

Reviewed Windows pixel references are under Front-End/tests/ui-preservation.spec.js-snapshots. They were generated for this intentional visual change and then tested again without updating. Other operating systems run portable structure/palette/photo/responsiveness checks rather than compare operating-system font rasterization. Screenshots of every enhanced dashboard and mobile view are under ignored Front-End/.artifacts.

## Docker status and disposable artifacts

Main services: frontend healthy on8080, backend healthy on127.0.0.1:5001 (container5000), MongoDB healthy and internal-only. Original MongoDB data volume preserved.

Isolated smoke containers/network were cleaned up. Its NEW test-only volume remains for review, without deleting any volume:

routeflow-smoke-1794112718591-c28fb6_mongodb_data

The failed pre-creation attempt did not create a test volume. Ignored .artifacts/docker-smoke contains test-only generated Compose configurations; original secrets are not committed. The isolated runner is now the default docker-smoke mode, and --proxy-only checks the existing stack without adding records.

## Remaining limits

Hosted GitHub Actions and optional Prometheus/Grafana runtime were not executed; their configuration was validated. No cloud deployment was attempted. Existing low-severity Jest/deepmerge development-dependency findings documented in README remain outside this enhancement. New drivers require real fleet/vehicle enrollment before assignments. Live GPS/route optimization, external email and customer ratings remain unconfigured and are not falsely shown as connected. Legacy name-only records require operator linkage to proper account IDs. Previous JPEG license provenance is unknown; only the new documented photographs are used in current screens.

## Manual review and testing

1. Keep the existing root .env and its secrets. For local staff demos verify APP_ENV=development and ALLOW_PUBLIC_STAFF_SIGNUP=true; backend host port remains5001. Production/staging should use APP_ENV=production/staging and staff signup false.
2. Run docker compose up -d --build frontend backend mongodb and docker compose ps from C:\DEvops\routeflow-v2. Open http://localhost:8080. API readiness: http://localhost:5001/api/health/ready.
3. Review welcome/login and all five dashboards at desktop, tablet and390px mobile widths; check navigation, focus, buttons and readable forms. Create a new customer/merchant/driver/logistics account and sign out/back in with the same selected role. Public administrator signup must fail.
4. As Merchant create a shipment. As Logistics inspect all deliveries, add/link the driver with real vehicle/zone details in Fleet management, then assign that shipment. As that Driver, update In transit -> Out for delivery -> Delivered. As the Merchant, inspect the original shipment identifier for details/tracking/history and verify reports. Refresh between steps to verify persistence.
5. To repeat disposable Docker lifecycle/persistence coverage run node scripts/docker-smoke.cjs --isolated. To check only the existing stack routing run node scripts/docker-smoke.cjs --proxy-only. Do not delete existing volumes or databases.
6. Run backend npm.cmd test, frontend npm.cmd test and npm.cmd run build. Review ENHANCEMENT_REPORT.md, IMAGE_LICENSES.md and git diff. You control staging, committing and pushing manually.

## Modified/new file list

The ignored local .env was updated only to set APP_ENV=development while preserving its existing settings. Generated ignored artifacts and test caches are not listed below. Reviewable source/configuration/test/photo/documentation files:

- .env.example
- .github/workflows/ci.yml
- Back-End/.dockerignore
- Back-End/.env.example
- Back-End/API_DOCUMENTATION.md
- Back-End/Dockerfile
- Back-End/monitoring/grafana/provisioning/dashboards/dashboards.yml
- Back-End/monitoring/grafana/provisioning/datasources/datasource.yml
- Back-End/monitoring/prometheus.yml
- Back-End/src/app.js
- Back-End/src/config/environment.js
- Back-End/src/config/logger.js
- Back-End/src/controllers/deliveryController.js
- Back-End/src/middleware/errorHandler.js
- Back-End/src/models/Delivery.js
- Back-End/src/routes/deliveryRoutes.js
- Back-End/src/routes/driverRoutes.js
- Back-End/src/services/deliveryService.js
- Back-End/src/services/driverService.js
- Back-End/src/services/reportService.js
- Back-End/src/utils/publicSignupPolicy.js
- Back-End/src/validators/deliveryValidator.js
- Back-End/src/validators/driverValidator.js
- Back-End/tests/operationalEnhancements.test.js
- Back-End/tests/operationalLogging.test.js
- Back-End/tests/publicStaffSignup.test.js
- Back-End/tests/setup.js
- ENHANCEMENT_REPORT.md
- Front-End/.dockerignore
- Front-End/Dockerfile
- Front-End/nginx.conf
- Front-End/public/images/logistics-images.json
- Front-End/public/images/logistics-port-800.webp
- Front-End/public/images/logistics-port.webp
- Front-End/public/images/logistics-truck-800.webp
- Front-End/public/images/logistics-truck.webp
- Front-End/public/images/logistics-warehouse-800.webp
- Front-End/public/images/logistics-warehouse.webp
- Front-End/src/components/RolePhotoGallery.jsx
- Front-End/src/data/demoData.js
- Front-End/src/pages/AnalyticsPage.jsx
- Front-End/src/pages/AuthPage.jsx
- Front-End/src/pages/WelcomePage.jsx
- Front-End/src/styles/index.css
- Front-End/tests/start-api.cjs
- Front-End/tests/ui-preservation.spec.js
- Front-End/tests/ui-preservation.spec.js-snapshots/login-desktop-win32.png
- Front-End/tests/ui-preservation.spec.js-snapshots/welcome-desktop-win32.png
- IMAGE_LICENSES.md
- README.md
- docker-compose.yml
- scripts/docker-smoke.cjs
