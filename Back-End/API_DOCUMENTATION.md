# Routeflow API Documentation

**Project:** Cloud-Based Logistics and Delivery Management System with DevOps Automation  
**Group:** 78  
**Base URL:** `http://localhost:5000/api` (Local Dev) / `/api` (Production Nginx Proxy)  
**Specification Version:** 1.0.0  

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Error Handling & Response Format](#2-error-handling--response-format)
3. [Health & Monitoring Endpoints](#3-health--monitoring-endpoints)
4. [Authentication APIs](#4-authentication-apis)
5. [User Management APIs](#5-user-management-apis)
6. [Driver & Fleet APIs](#6-driver--fleet-apis)
7. [Delivery & Shipment APIs](#7-delivery--shipment-apis)
8. [Public Tracking API](#8-public-tracking-api)
9. [Notifications APIs](#9-notifications-apis)
10. [Dashboard & Reports APIs](#10-dashboard--reports-apis)
11. [Delivery Lifecycle & State Machine](#11-delivery-lifecycle--state-machine)

---

## 1. Authentication & Authorization

All protected endpoints require an `Authorization` HTTP header with a valid JSON Web Token (JWT) in Bearer format:

```http
Authorization: Bearer <jwt_token>
```

### Supported Roles & Permissions Matrix

| Role Identifier | Role Label | Scope / Permissions |
|---|---|---|
| `administrator` | System Administrator | Full access to users, fleet, all deliveries, assignment, status updates, settings, reports. |
| `logistics` | Logistics Manager / Operations Staff | Operational view: manage deliveries, assign drivers, view fleet availability, operational reports. |
| `driver` | Delivery Driver / Courier | Scoped to assigned deliveries, update permitted delivery status (`In transit`, `Delivered`, `Delayed`), route view. |
| `customer` | Customer / Sender | Create orders, view own deliveries, track shipment, view personal delivery history & notifications. |
| `merchant` | Business Client / Merchant | Create merchant shipments, view store deliveries, tracking, reports, store profile. |

---

## 2. Error Handling & Response Format

### Success Response Format
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address."
    }
  ]
}
```

### HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Malformed request or invalid parameters.
- `401 Unauthorized`: Missing, invalid, or expired authentication token.
- `403 Forbidden`: Authenticated user lacks permission for the resource.
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Resource state conflict (e.g., duplicate email address).
- `422 Unprocessable Entity`: Request body failed schema validation.
- `429 Too Many Requests`: Rate limiter triggered.
- `500 Internal Server Error`: Unhandled server exception.

---

## 3. Health & Monitoring Endpoints

### Basic Health Check
- **Endpoint:** `GET /api/health`
- **Access:** Public
- **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-03T04:55:06.907Z",
    "uptime": 371.89,
    "service": "routeflow-backend"
  }
  ```

### Liveness Probe
- **Endpoint:** `GET /api/health/live`
- **Access:** Public (Used by container orchestrators)
- **Response:** `200 OK`

### Readiness Probe
- **Endpoint:** `GET /api/health/ready`
- **Access:** Public (Verifies active MongoDB connectivity)
- **Response (Connected):** `200 OK`
  ```json
  {
    "status": "ready",
    "database": "connected",
    "timestamp": "2026-11-03T04:55:20.491Z"
  }
  ```
- **Response (Disconnected):** `503 Service Unavailable`

### Prometheus Metrics
- **Endpoint:** `GET /metrics`
- **Access:** Public / Monitoring network
- **Format:** Prometheus text format (`http_requests_total`, `http_request_duration_seconds`, process metrics).

---

## 4. Authentication APIs

### Register User
- **Endpoint:** `POST /api/auth/register` (alias: `/api/auth/signup`)
- **Access:** Public (Rate-limited)
- **Request Body:**
  ```json
  {
    "name": "Jordan Smith",
    "email": "jordan@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "role": "customer",
    "phone": "+1-555-0144"
  }
  ```
  *(Note: Public self-registration only permits `customer` or `merchant`. Privileged accounts must be provisioned by an Administrator).*
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6ae967a8beb4fef5f1fe5642",
      "name": "Jordan Smith",
      "email": "jordan@example.com",
      "role": "customer",
      "roleId": "customer",
      "status": "active"
    },
    "name": "Jordan Smith",
    "roleId": "customer"
  }
  ```

### Log In User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public (Rate-limited)
- **Request Body:**
  ```json
  {
    "email": "admin@routeflow.io",
    "password": "AdminRouteflow2026!",
    "roleId": "administrator"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "6ae967a8beb4fef5f1fe5642",
      "name": "System Administrator",
      "email": "admin@routeflow.io",
      "role": "administrator",
      "roleId": "administrator",
      "status": "active"
    },
    "name": "System Administrator",
    "roleId": "administrator"
  }
  ```

### Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (Bearer Token)
- **Response (200 OK):** Returns current user object and roleId.

### Log Out User
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Public
- **Response (200 OK):** `{"success": true, "message": "Logged out successfully"}`

---

## 5. User Management APIs

All endpoints require: `Authorization: Bearer <admin_token>`

### List Users
- **Endpoint:** `GET /api/users`
- **Query Parameters:**
  - `role`: Filter by role (`administrator`, `logistics`, `driver`, `customer`, `merchant`)
  - `status`: Filter by status (`active`, `inactive`, `suspended`)
  - `search`: Search name or email
  - `page`: Page index (default: `1`)
  - `limit`: Page size (default: `50`)

### Create User (Privileged)
- **Endpoint:** `POST /api/users`
- **Request Body:**
  ```json
  {
    "name": "David Courier",
    "email": "david.courier@routeflow.io",
    "password": "CourierPass2026!",
    "role": "driver",
    "phone": "+1-555-0188"
  }
  ```

### Update User Status
- **Endpoint:** `PATCH /api/users/:id/status`
- **Request Body:** `{"status": "suspended"}`

---

## 6. Driver & Fleet APIs

### List Driver Roster
- **Endpoint:** `GET /api/drivers`
- **Access:** Public / Authenticated
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "6ae967a8beb4fef5f1fe5647",
        "name": "Alex Lee",
        "initials": "AL",
        "vehicle": "Van · V-204",
        "zone": "Brooklyn",
        "status": "On route",
        "deliveries": 8
      }
    ]
  }
  ```

### Create Driver Profile
- **Endpoint:** `POST /api/drivers`
- **Access:** Administrator, Logistics
- **Request Body:**
  ```json
  {
    "name": "Taylor Morgan",
    "vehicle": "Van · V-305",
    "zone": "Bronx",
    "phone": "+1-555-0166",
    "status": "Available"
  }
  ```

### Toggle Driver Status
- **Endpoint:** `PATCH /api/drivers/:id/status` (or `PATCH /api/drivers/:id/availability`)
- **Access:** Authenticated (Driver, Logistics, Admin)
- **Request Body:** `{"status": "Available"}`

---

## 7. Delivery & Shipment APIs

### List Deliveries
- **Endpoint:** `GET /api/deliveries`
- **Access:** Scoped by role
  - `customer`: Only personal deliveries
  - `merchant`: Only merchant store shipments
  - `driver`: Only deliveries assigned to driver
  - `administrator` / `logistics`: All deliveries across network
- **Query Parameters:**
  - `status`: `All statuses`, `Pending`, `In transit`, `Out for delivery`, `Delivered`, `Delayed`
  - `search`: Keyword search matching ID, customer name, route, driver, tracking number
  - `page`: Page index
  - `limit`: Results per page
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "SHP-10482",
        "customer": "Miriam Patel",
        "route": "Newark → Brooklyn",
        "pickup": "Newark",
        "dropoff": "Brooklyn",
        "status": "In transit",
        "eta": "14:30",
        "driver": "Alex Lee",
        "trackingNumber": "RF-TRK-90000"
      }
    ],
    "total": 8
  }
  ```

### Create Delivery / Shipment
- **Endpoint:** `POST /api/deliveries`
- **Access:** Authenticated / Guest
- **Request Body:**
  ```json
  {
    "customer": "Jordan Smith",
    "pickup": "Jersey City",
    "dropoff": "Hoboken",
    "eta": "16:30"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Delivery created successfully",
    "id": "SHP-10500",
    "customer": "Jordan Smith",
    "route": "Jersey City → Hoboken",
    "status": "Pending",
    "eta": "16:30",
    "driver": "Unassigned"
  }
  ```

### Update Delivery Status
- **Endpoint:** `PATCH /api/deliveries/:id/status`
- **Access:** Driver (assigned orders), Logistics, Admin
- **Request Body:**
  ```json
  {
    "status": "Delivered",
    "remarks": "Package signed by customer."
  }
  ```

### Assign Driver
- **Endpoint:** `PATCH /api/deliveries/:id/driver` (alias: `PATCH /api/deliveries/:id/assign-driver`)
- **Access:** Administrator, Logistics
- **Request Body:**
  ```json
  {
    "driver": "Alex Lee"
  }
  ```

### Delivery Audit History
- **Endpoint:** `GET /api/deliveries/:id/history`
- **Access:** Authenticated
- **Response (200 OK):** Array of historical changes with timestamp, status, modifier, and remarks.

---

## 8. Public Tracking API

### Track by Tracking Number
- **Endpoint:** `GET /api/tracking/:trackingNumber`
- **Access:** Public (No authentication required)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "trackingNumber": "RF-TRK-90000",
      "deliveryId": "SHP-10482",
      "status": "In transit",
      "route": "Newark → Brooklyn",
      "pickup": "Newark",
      "dropoff": "Brooklyn",
      "eta": "14:30",
      "statusHistory": [
        {
          "status": "Pending",
          "timestamp": "2026-11-03T00:00:00.000Z",
          "remarks": "Initial dispatch"
        },
        {
          "status": "In transit",
          "timestamp": "2026-11-03T04:48:41.000Z",
          "remarks": "Current status: In transit"
        }
      ]
    }
  }
  ```
*(Note: Exposes only safe logistics milestones. Private customer contact info is stripped).*

---

## 9. Notifications APIs

Requires: `Authorization: Bearer <token>`

- `GET /api/notifications` — Retrieve in-app notifications with `unreadCount`.
- `PATCH /api/notifications/:id/read` — Mark an individual notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read for current user.

---

## 10. Dashboard & Reports APIs

- `GET /api/dashboard/summary` — Returns real-time KPI metrics (`Total deliveries`, `In transit`, `Delivered today`, `Needs attention`) and active driver counts.
- `GET /api/reports/overview` — Returns 7-day shipment volume aggregation and service performance KPIs.
- `GET /api/dashboard/fleet` — Returns current driver availability status.

---

## 11. Delivery Lifecycle & State Machine

```
              ┌─────────┐
              │ Pending │
              └────┬────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
   ┌────────────┐       ┌───────────┐
   │ In transit │◄─────►│  Delayed  │
   └─────┬──────┘       └─────┬─────┘
         │                    │
         ▼                    ▼
┌──────────────────┐    ┌───────────┐
│ Out for delivery ├───►│ Cancelled │ (Terminal)
└────────┬─────────┘    └───────────┘
         │
         ▼
   ┌───────────┐
   │ Delivered │ (Terminal)
   └───────────┘
```

