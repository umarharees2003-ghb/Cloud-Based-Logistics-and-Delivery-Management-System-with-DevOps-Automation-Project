# Routeflow — Cloud-Based Logistics and Delivery Management System

**Group:** 78  
**Course:** DevOps Engineering (Sem 5)  
**Academic Year:** 2026  
**Architecture:** Microservice-ready Multi-Container Architecture (React 18 + Node.js/Express + MongoDB + Prometheus + Grafana + Nginx)

---

## 1. Project Overview

**Routeflow** is a cloud-based logistics and delivery management web application designed with modern DevOps automation. It provides end-to-end operational visibility, dispatching, and tracking across multi-role workflows:

- **Customers:** Register, authenticate, create delivery orders, view delivery history, and track shipments in real-time.
- **Drivers:** View assigned deliveries, update real-time shipment status (Picked Up, In Transit, Delivered, Failed), and manage operational availability.
- **Administrators & Operations Managers:** Complete operational command center with real-time analytics, fleet assignment, delivery status tracking, user management, and system-wide audit reports.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, CSS3, Lucide React, Cypress (E2E) |
| **Backend** | Node.js (v22), Express.js, Mongoose, JWT, bcryptjs, Winston, Prometheus Client |
| **Database** | MongoDB 6.0 |
| **Reverse Proxy & Web Server** | Nginx Alpine (Production frontend hosting with `/api/` reverse proxy) |
| **Containerization** | Docker, Multi-stage Dockerfiles, Docker Compose |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Monitoring & Metrics** | Prometheus (`:9090`) + Grafana (`:3000`) with pre-provisioned dashboards |
| **Testing** | Jest, Supertest (37 automated backend test cases across 6 suites) |

---

## 3. Repository Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline (Lint, Test, Build, Docker Buildx)
├── Back-End/
│   ├── Dockerfile               # Production multi-stage Docker build
│   ├── .dockerignore
│   ├── .env.example             # Backend environment template
│   ├── API_DOCUMENTATION.md     # Complete REST API reference with curl examples
│   ├── AWS_DEPLOYMENT.md        # Production AWS deployment guide (ECS / EC2)
│   ├── monitoring/
│   │   ├── prometheus.yml       # Prometheus scrape configuration
│   │   └── grafana/             # Pre-configured Grafana dashboards & datasources
│   ├── scripts/
│   │   └── seedAdmin.js         # Database seeding script for default credentials
│   ├── src/
│   │   ├── config/              # Database, environment, and Winston logger setup
│   │   ├── controllers/         # Request handlers (auth, user, driver, delivery, etc.)
│   │   ├── middleware/          # JWT auth, RBAC, input validation, error handling
│   │   ├── models/              # MongoDB Mongoose schemas (User, Driver, Delivery, Notification)
│   │   ├── routes/              # Express API route definitions
│   │   ├── services/            # Business logic layer
│   │   ├── utils/               # ApiError, token generation, tracking ID helpers
│   │   ├── validators/          # Input validation schemas
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entrypoint and graceful shutdown
│   └── tests/                   # Automated Jest + Supertest suites (37 test cases)
├── Front-End/
│   ├── Dockerfile               # Multi-stage build (Node build -> Nginx Alpine serve)
│   ├── nginx.conf               # Nginx reverse proxy configuration
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
│   │   ├── pages/               # Modular role pages (Overview, Deliveries, Fleet, Auth, etc.)
│   │   ├── services/            # API integration client with JWT Bearer injection
│   │   └── styles/              # Global styling
│   └── vite.config.js           # Vite configuration with API proxy
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
| **MongoDB** | `localhost:27017` | Database | - |

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
npm test           # Runs all 37 Jest test suites with coverage
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

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@routeflow.io` | `Admin123!` |
| **Operations Manager** | `ops@routeflow.io` | `Manager123!` |
| **Delivery Driver** | `marcus.vance@routeflow.io` | `Driver123!` |
| **Customer** | `sarah.chen@acmelogistics.com` | `Customer123!` |

---

## 7. CI/CD & Automated Quality Gates

The repository is integrated with **GitHub Actions** (`.github/workflows/ci.yml`), which executes on every push and pull request to `main`, `master`, and feature branches:

1. **Backend Testing & Coverage:** Runs 37 automated tests against a live MongoDB test service container.
2. **Frontend Build Verification:** Validates that the React 18 production bundle builds without errors or missing imports.
3. **Docker Buildx:** Multi-platform container build verification for both Frontend and Backend Dockerfiles.

---

## 8. Group Contribution

- **Group 78** — DevOps Engineering Coursework, Year 2026.
