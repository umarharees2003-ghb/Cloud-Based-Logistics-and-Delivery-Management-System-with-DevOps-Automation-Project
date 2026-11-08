# Routeflow API

Base: `/api` through Nginx, or `http://localhost:5000/api` directly. JSON requests and responses. Protected routes require `Authorization: Bearer <token>`. Errors return `{ success: false, message, errors }` with HTTP 400/401/403/404/409/422/429/500 as appropriate.

| Method | Path | Access / behavior |
| --- | --- | --- |
| POST | /auth/register (also /auth/signup) | Public; name, email, password (8+ chars), optional confirmPassword, role: customer/merchant by default; driver/logistics additionally allowed only with ALLOW_PUBLIC_STAFF_SIGNUP=true; administrator always forbidden |
| POST | /auth/login | Public; email, password, optional roleId which must match the account |
| GET / PATCH | /auth/me | Authenticated profile; PATCH only accepts name, phone, company |
| POST | /auth/logout | Compatibility acknowledgement; browser deletes token. JWT remains valid until expiry; no server revocation list |
| GET / POST | /users | Administrator only; list or provision accounts including staff |
| GET / PATCH | /users/:id | Administrator only; inspect or edit name, email, phone, company, role, status |
| PATCH | /users/:id/status | Administrator; active, inactive or suspended |
| GET / POST | /drivers | Administrator or logistics; list or create linked driver profile |
| GET | /drivers/me/profile | Driver's own linked profile |
| GET | /drivers/:id | Staff or driver who owns the profile |
| PATCH | /drivers/:id | Staff; vehicle, zone, phone, licenseNumber, vehicleType |
| PATCH | /drivers/:id/status (also /availability) | Staff or own driver; Available, On route, Unavailable |
| GET | /drivers/:id/deliveries | Staff or own driver; assignment IDs determine access |
| GET | /deliveries | Authenticated, role scoped; search, status, page, limit (1-500) |
| POST | /deliveries | Staff, merchant, customer; customer, pickup, dropoff, eta; optional priority/package/recipient fields. Server generates IDs and forces Pending/Unassigned |
| GET / PATCH | /deliveries/:id | Scoped detail / edit; owners can edit Pending shipments, staff can edit authorized shipments |
| PATCH | /deliveries/:id/status | Staff or assigned driver; validated lifecycle transitions |
| PATCH | /deliveries/:id/driver (also /assign-driver) | Staff; driverId preferred, driver name accepted for compatibility, or driver: Unassigned |
| DELETE | /deliveries/:id | Soft cancellation with history. Owners only Pending; staff permitted by lifecycle; drivers forbidden |
| GET | /deliveries/:id/history | Authenticated, scoped history |
| GET | /tracking/:trackingNumber (also /deliveries/:trackingNumber/tracking) | Public; opaque tracking token required. Status, ETA, timestamps only; no exact addresses, customer, driver, or private remarks |
| GET | /dashboard/summary, /dashboard/deliveries | Authenticated, role scoped counts and recent deliveries |
| GET | /dashboard/fleet | Staff only |
| GET | /reports/overview, /reports/deliveries | Authenticated, role scoped counts and weekly volume (UTC) |
| GET | /reports/drivers | Staff only |
| GET | /notifications | Own notifications; optional unreadOnly and limit |
| PATCH | /notifications/:id/read, /notifications/read-all | Own notifications only |
| GET | /health, /health/live, /health/ready | Public health; readiness requires MongoDB |
| GET | /metrics | Prometheus metrics; restrict access at infrastructure boundary when exposed publicly |

List responses use `data: []`; delivery mutations/detail use `data: { ... }`. Delivery fields retain original UI names: `id` (SHP code), `_id` (MongoDB ID), `driver`, `status`, `route`, `eta`, `trackingNumber`, `statusHistory`. Authentication returns `user` and `token` at the top level.

Public registration policy: `ALLOW_PUBLIC_STAFF_SIGNUP` defaults to false for every environment, including production. Only the explicit value `true` enables driver/logistics self-registration for local demonstrations. Administrator creation always requires the secure bootstrap or authenticated administrator `/users` provisioning, regardless of the flag. Unsupported roles never create an account. The server persists only an allowed selected role and generates the JWT from that MongoDB user; submitted permission lists or administrator flags do not grant authorization. Changing the flag controls future signup and does not modify existing accounts.

A self-registered driver has a driver-role user account and can access the driver dashboard. A real linked fleet profile is required for assignments; public signup does not fabricate vehicle or fleet records.

Ownership uses sender/merchant/creator account IDs; driver visibility uses assignedDriver linked to a User. Display names never authorize access. Legacy records with only names require an operator to link the correct account IDs; they are deliberately not exposed by matching names.

Lifecycle: Pending -> In transit/Delayed/Cancelled; In transit -> Out for delivery/Delivered/Delayed/Cancelled; Out for delivery -> Delivered/Delayed/Cancelled; Delayed -> Pending/In transit/Out for delivery/Delivered/Cancelled. Delivered and Cancelled are terminal. Repeating the same state is allowed.

Average duration and customer ratings are null until measurements exist. The network map is an illustration; no live GPS or route optimization provider is configured.
