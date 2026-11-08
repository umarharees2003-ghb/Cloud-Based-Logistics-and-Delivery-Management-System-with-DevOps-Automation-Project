# Routeflow Backend Service

**Cloud-Based Logistics and Delivery Management System with DevOps Automation**  
**Group:** 78  
**Technology Stack:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, Winston, Prometheus, Jest, Supertest, Docker.

---

## 1. Project Overview

The Routeflow backend is an Express-based REST API designed for cloud-based logistics and delivery tracking. It provides:

- Role-based workspaces for **System Administrators**, **Logistics Managers**, **Delivery Drivers**, **Customers**, and **Merchants**.
- Secure authentication with bcrypt password hashing and JSON Web Tokens (JWT).
- Delivery management with unique tracking numbers, status audit histories, and driver route assignments.
- Fleet management tracking driver profiles, service zones, and availability.
- Aggregated real-time dashboard analytics and reports.
- Structured logging with Winston and operational metrics exported to Prometheus and Grafana.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v20+ / v22 / v24) |
| Web Framework | Express.js 4.x |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` |
| Security | Helmet, CORS, `express-rate-limit` |
| Testing | Jest, Supertest, `mongodb-memory-server` |
| Logging | Winston + Morgan |
| Monitoring | Prometheus (`prom-client`) + Grafana |
| Containerization | Docker (Multi-stage build) + Docker Compose |
| CI/CD | GitHub Actions |

---

## 3. Directory Structure

```text
Back-End/
├── .dockerignore
├── .env.example
├── .gitignore
├── API_DOCUMENTATION.md       # Full API endpoint specification
├── AWS_DEPLOYMENT.md          # Cloud architecture & ECS runbook
├── Dockerfile                 # Multi-stage production container build
├── package.json               # Dependencies & scripts
├── README.md                  # This documentation
├── monitoring/
│   ├── prometheus.yml         # Prometheus scrape configuration
│   └── grafana/
│       ├── provisioning/      # Datasource & dashboard auto-provisioning
│       └── dashboards/        # Routeflow Grafana dashboard JSON
├── scripts/
│   └── seedAdmin.js           # Database bootstrap & demo seed script
├── src/
│   ├── app.js                 # Express application & middleware assembly
│   ├── server.js              # Server lifecycle & graceful shutdown
│   ├── config/
│   │   ├── database.js        # Mongoose connection & events
│   │   ├── environment.js     # Validated environment configuration
│   │   └── logger.js          # Winston structured logger
│   ├── controllers/           # HTTP controllers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── deliveryController.js
│   │   ├── driverController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middleware/            # Auth, authorization & error handlers
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validateRequest.js
│   ├── models/                # MongoDB Mongoose schemas
│   │   ├── Delivery.js
│   │   ├── Driver.js
│   │   ├── Notification.js
│   │   └── User.js
│   ├── routes/                # Express API routes
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── deliveryRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── services/              # Business logic layer
│   │   ├── authService.js
│   │   ├── deliveryService.js
│   │   ├── driverService.js
│   │   ├── notificationService.js
│   │   ├── reportService.js
│   │   └── userService.js
│   ├── utils/                 # Helper utilities
│   │   ├── ApiError.js
│   │   ├── generateToken.js
│   │   └── generateTrackingNumber.js
│   └── validators/            # Request validation schemas
│       ├── authValidator.js
│       ├── deliveryValidator.js
│       ├── driverValidator.js
│       └── userValidator.js
└── tests/                     # Automated test suite
    ├── setup.js
    ├── auth.test.js
    ├── dashboard.test.js
    ├── deliveries.test.js
    ├── drivers.test.js
    ├── notifications.test.js
    └── users.test.js
```

---

## 4. Prerequisites

- **Node.js:** v20.x or later (Node 22 / 24 supported)
- **npm:** v10.x or later
- **MongoDB:** v6.0 or higher running locally (or via Docker)

---

## 5. Installation & Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Back-End
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   Inspect and adjust `.env` if using a custom MongoDB connection or port.

---

## 6. Database Seeding

To populate the database with the initial administrator, test accounts for all roles, fleet drivers, and sample deliveries:

```bash
npm run seed
```

### Pre-Seeded Demo Accounts:
| Role | Email | Password |
|---|---|---|
| System Administrator | `admin@routeflow.io` | `AdminRouteflow2026!` |
| Logistics Manager | `logistics@routeflow.io` | `LogisticsRouteflow2026!` |
| Delivery Driver | `driver@routeflow.io` | `DriverRouteflow2026!` |
| Customer / Sender | `customer@routeflow.io` | `CustomerRouteflow2026!` |
| Merchant / Business | `merchant@routeflow.io` | `MerchantRouteflow2026!` |

---

## 7. Running the Server

### Development Mode (with auto-restart via nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will listen at `http://localhost:5000`.

- **Health Check:** `http://localhost:5000/api/health`
- **Database Readiness:** `http://localhost:5000/api/health/ready`
- **Prometheus Metrics:** `http://localhost:5000/metrics`

---

## 8. Running Automated Tests

The backend includes a comprehensive Jest test suite covering authentication, permissions, driver management, delivery operations, status state transitions, and dashboard metrics.

```bash
npm test
```

To run with test coverage reporting:
```bash
npm run test:coverage
```

---

## 9. Running with Docker & Docker Compose

From the root project directory, launch the entire multi-service stack:

```bash
docker compose up --build -d
```

This starts:
- **Frontend SPA (Nginx):** `http://localhost:8080`
- **Backend API (Express):** `http://localhost:5000`
- **Database (MongoDB):** `localhost:27017`
- **Metrics (Prometheus):** `http://localhost:9090`
- **Monitoring (Grafana):** `http://localhost:3000` (User: `admin` / Password: `admin`)

To stop all services:
```bash
docker compose down
```

---

## 10. API Documentation

Detailed endpoint documentation, parameters, sample payloads, and status codes are in:
👉 [`API_DOCUMENTATION.md`](file:///c:/Users/DELL/Documents/Quick%20Share/Sem%205/DevOps/DevOps%20Project/Back-End/API_DOCUMENTATION.md)

AWS cloud deployment guide and architectural specifications:
👉 [`AWS_DEPLOYMENT.md`](file:///c:/Users/DELL/Documents/Quick%20Share/Sem%205/DevOps/DevOps%20Project/Back-End/AWS_DEPLOYMENT.md)

