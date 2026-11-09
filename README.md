# Routeflow — Cloud-Based Logistics and Delivery Management System

**Group:** 78  
**Course:** DevOps Engineering (Sem 5)  
**Academic Year:** 2026  
**Architecture:** Containerized Multi-Tier Application with a Modular Backend Architecture (React 18 + Node.js/Express + MongoDB + Prometheus + Grafana + Nginx)

---

## 1. Project Overview

**Routeflow** is a cloud-based logistics and delivery management web application designed with modern DevOps automation. It provides end-to-end operational visibility, dispatching, and tracking across multi-role workflows:

- **Customers:** Register, authenticate, create delivery orders, view delivery history, and track shipments in real-time.
- **Merchants / Business Clients:** Create bulk shipments, track store deliveries, and view fulfillment reports.
- **Drivers:** View assigned deliveries, update real-time shipment status (Picked Up, In Transit, Delivered, Failed), and manage operational availability.
- **Administrators & Operations Managers:** Complete operational command center with real-time analytics, fleet assignment, delivery status tracking, user management, and system-wide audit reports.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, CSS3, Lucide React, Cypress (E2E) |
| **Backend** | Node.js (v22), Express.js, Mongoose, JWT, bcryptjs, Winston, Prometheus Client |
| **Database** | MongoDB 6.0 |
| **Reverse Proxy & Web Server** | Nginx Alpine (Production frontend hosting with `/api/` reverse proxy pass) |
| **Containerization** | Docker, Multi-stage Dockerfiles, Docker Compose |
| **CI Automation** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Cloud Deployment Guide** | AWS (Amazon ECS / EC2 with Docker Compose, ALB, Route 53) |
| **Monitoring & Metrics** | Prometheus (`:9090`) + Grafana (`:3000`) with pre-provisioned dashboards |
| **Testing** | Jest, Supertest (39 automated backend test cases across 6 suites) |

---

## 3. Architecture & Service Breakdown

The application follows a **containerized multi-tier architecture** with a modular Express backend:

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline (Lint, Test, Build, Docker Buildx)
├── Back-End/
│   ├── Dockerfile               # Production multi-stage Docker build (Node 22 Alpine)
│   ├── .dockerignore
│   ├── .env.example             # Backend environment template
│   ├── API_DOCUMENTATION.md     # Complete REST API reference with curl examples
│   ├── AWS_DEPLOYMENT.md        # Production AWS deployment reference (ECS / EC2)
│   ├── monitoring/
│   │   ├── prometheus.yml       # Prometheus scrape configuration (scrapes backend:5000/metrics)
│   │   └── grafana/             # Pre-configured Grafana dashboards & Prometheus datasource
│   ├── scripts/
│   │   └── seedAdmin.js         # Database seeding script for all 5 roles and initial logistics data
│   ├── src/
│   │   ├── config/              # Database (Mongoose), environment, and Winston logger setup
│   │   ├── controllers/         # Request handlers (auth, user, driver, delivery, dashboard, reports)
│   │   ├── middleware/          # JWT auth, RBAC authorization, input validation, error handling
│   │   ├── models/              # Mongoose schemas (User, Driver, Delivery, Notification)
│   │   ├── routes/              # Express API route mappings
│   │   ├── services/            # Business logic layer (delivery dispatch, status transitions)
│   │   ├── utils/               # ApiError, token generation, tracking ID helpers
│   │   ├── validators/          # Input validation schemas
│   │   ├── app.js               # Express application configuration & Prometheus instrumentation
│   │   └── server.js            # Server entrypoint and graceful shutdown
│   └── tests/                   # Automated Jest + Supertest suites (39 test cases)
├── Front-End/
│   ├── Dockerfile               # Multi-stage build (Node build -> Nginx Alpine serve)
│   ├── nginx.conf               # Nginx reverse proxy configuration (/api/ -> backend:5000/api/)
│   ├── .dockerignore
│   ├── .env.example             # Frontend environment template
│   ├── cypress.config.js        # Cypress E2E test configuration
│   ├── cypress/                 # E2E test specifications
│   ├── public/                  # Static assets and images
│   ├── src/
│   │   ├── app/                 # Root App component and router configuration
│   │   ├── components/          # Reusable UI components (Sidebar, Topbar, Tables, Badges)
│   │   ├── data/                # Fallback demo data
│   │   ├── hooks/               # Custom React hooks (useAuth, useDeliveries, useFleet)
│   │   ├── pages/               # Modular role pages (Overview, Deliveries, Fleet, Merchant, etc.)
│   │   ├── services/            # API client with automatic JWT Bearer token injection
│   │   └── styles/              # Global styling
│   └── vite.config.js           # Vite configuration with /api development proxy
├── docker-compose.yml           # Canonical full-stack multi-container orchestration
├── .gitignore                   # Root Git ignore rules
└── README.md                    # Root project documentation
```

---

## 4. Quick Start with Docker Compose

To spin up the complete Routeflow stack (Frontend, Backend, MongoDB, Prometheus, Grafana) with a single command:

```bash
docker compose up --build -d
```

### Exposed Service Endpoints

| Service | URL | Description | Default Credentials |
|---|---|---|---|
| **Frontend Application** | `http://localhost:8080` | Routeflow React Web App | Use demo accounts or register |
| **Backend REST API** | `http://localhost:5000/api` | Express API Service | - |
| **API Healthcheck** | `http://localhost:5000/api/health` | Service & DB Health Status | - |
| **Prometheus Metrics** | `http://localhost:9090` | Prometheus Time-Series DB | - |
| **Grafana Dashboards** | `http://localhost:3000` | Pre-configured metrics UI | `admin` / `admin` |
| **MongoDB** | `localhost:27017` (Docker network) | Database container | - |

> **Note on MongoDB Connection Strings:**
> - When running inside Docker Compose, the backend connects via Docker DNS: `mongodb://mongodb:27017/routeflow`.
> - When running the backend directly on the host machine, the backend connects via: `mongodb://127.0.0.1:27017/routeflow`.

To shut down all containers:
```bash
docker compose down
```

---

## 5. Local Development Setup

### Backend
```bash
cd Back-End
cp .env.example .env
npm install
npm run seed       # Seeds default users and initial logistics data
npm run dev        # Starts development server with nodemon on port 5000
npm test           # Runs all 39 Jest test suites with coverage
```

### Frontend
```bash
cd Front-End
cp .env.example .env
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
npm run build      # Produces optimized production bundle in dist/
```

---

## 6. Seed Accounts for Testing & Evaluation

The database seeding script (`Back-End/scripts/seedAdmin.js`) idempotently provisions accounts for all 5 roles:

| Role | Role Identifier | Email | Password | Scope & Workspace |
|---|---|---|---|---|
| **Administrator** | `administrator` | `admin@routeflow.io` | `AdminRouteflow2026!` | Full administrative access, user management, system KPIs |
| **Operations Manager** | `logistics` | `logistics@routeflow.io` | `LogisticsRouteflow2026!` | Logistics command center, driver dispatch, analytics |
| **Delivery Driver** | `driver` | `driver@routeflow.io` | `DriverRouteflow2026!` | Driver workspace, assigned routes, status advancement |
| **Customer** | `customer` | `customer@routeflow.io` | `CustomerRouteflow2026!` | Customer portal, delivery creation, real-time tracking |
| **Merchant** | `merchant` | `merchant@routeflow.io` | `MerchantRouteflow2026!` | Business account, store order management, dispatch |

---

## 7. Role-Based Access Control (RBAC) Matrix

| Feature / Action | `administrator` | `logistics` | `driver` | `customer` | `merchant` |
|---|:---:|:---:|:---:|:---:|:---:|
| **View System KPI Dashboard** | Yes | Yes | No | No | No |
| **User & Access Management** | Yes | No | No | No | No |
| **Manage Fleet & Drivers** | Yes | Yes | Status Only | No | No |
| **Create Delivery Orders** | Yes | Yes | No | Yes | Yes |
| **Assign Driver to Delivery** | Yes | Yes | No | No | No |
| **Update Delivery Status** | Any Status | Any Status | Assigned Only | No | No |
| **Track Shipments** | All | All | Assigned | Own Orders | Store Orders |
| **View Audit Reports** | Yes | Yes | No | No | No |
| **View Prometheus Metrics** | Yes | Yes | No | No | No |

---

## 8. Continuous Integration (CI) Pipeline

The repository integrates an automated **GitHub Actions** CI workflow (`.github/workflows/ci.yml`) triggering on pushes and pull requests to `main`, `master`, and feature branches:

1. **Backend Testing & Coverage:** Launches an ephemeral MongoDB 6 service container and runs all 39 automated tests with Jest and Supertest.
2. **Frontend Build Verification:** Validates that the React 18 production bundle compiles cleanly with Vite (`dist/`).
3. **Docker Buildx Verification:** Validates that both Frontend and Backend multi-stage Dockerfiles build successfully.

*(Note: Continuous Deployment is documented as an infrastructure-as-code reference in `Back-End/AWS_DEPLOYMENT.md` for production cloud deployment to AWS ECS / EC2).*

---

## 9. Group Contribution

- **Group 78** — DevOps Engineering Coursework, Year 2026.
