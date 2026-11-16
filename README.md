# Gatekeeper — Smart API Gateway & Management Platform

A high-performance, distributed, enterprise-grade API Gateway and Management Platform built with **Spring Boot 21**, **Java 21**, **React**, **MySQL**, **Redis**, **MongoDB**, and **Kafka**.

---

## 🏛️ System Architecture

Gatekeeper follows a modern microservices architecture separating the **Control Plane**, the **Data Plane (Smart Gateway)**, the **Observability / Analytics Engine**, and the **Administrative Frontend Console**.

```
                           +-------------------------------------+
                           |         Frontend Console            |
                           |   React + Vite + Tailwind (3000)    |
                           +------------------+------------------+
                                              |
                   +--------------------------+--------------------------+
                   |                          |                          |
                   v                          v                          v
       +-----------------------+  +-----------------------+  +-----------------------+
       |   Smart Gateway       |  |   API Management      |  |   Analytics Service   |
       |     Data Plane        |  |    Control Plane      |  |     Observability     |
       |     (Port 8080)       |  |     (Port 8081)       |  |     (Port 8082)       |
       +-----------+-----------+  +-----------+-----------+  +-----------+-----------+
                   |                          |                          |
         +---------+---------+                |                          |
         |                   |                v                          v
         v                   v             [MySQL]                   [MongoDB]
      [Redis]             [Kafka]      gatekeeper_management    gatekeeper_analytics
  (Rate Limiting &   (Access Event Bus)   (Port 3306)               (Port 27017)
    Idempotency)        (Port 9092)
```

---

## 🚀 Microservices Overview

### 1. `smart-gateway-service` (Port 8080) — The Data Plane
The high-performance reverse proxy that intercepts and processes incoming client traffic:
- **Dynamic Route Matching**: Ant path pattern matching with dynamic variable extraction and upstream URL rewriting.
- **HTTP Method Enforcement**: Validates allowed methods (e.g. GET, POST, PUT, DELETE) per route, returning `405 Method Not Allowed` when restricted.
- **Sliding-Window Rate Limiting**: Distributed Redis rate limiting with automatic, resilient In-Memory sliding-window fallback if Redis is unavailable. Injects standard headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`. Returns `429 Too Many Requests` when limit exceeded.
- **Idempotency Deduplication**: Detects `Idempotency-Key` or `X-Idempotency-Key` headers on mutating requests. Prevents duplicate in-flight requests (`409 Conflict`) and returns cached responses on repeated requests with `X-Gateway-Idempotent-Replay: true`.
- **Header Transformation Pipeline**: Dynamically executes `ADD`, `SET`, or `REMOVE` operations on incoming request headers before forwarding upstream, and on outgoing response headers before returning to clients.
- **Fault Tolerance & Timeouts**: Configurable per-route response timeout. Maps upstream timeouts to `504 Gateway Timeout` and connection drops to `502 Bad Gateway`.
- **Event Streaming & Logging**: Emits detailed access log events to Kafka (`gateway-access-logs` topic), with automatic real-time HTTP fallback to `analytics-service` if Kafka is offline.

### 2. `api-management-service` (Port 8081) — The Control Plane
The centralized management service managing tenants, policies, credentials, and versioning:
- **JWT Authentication & RBAC**: Role-based access control (`PLATFORM_ADMIN`, `TENANT_ADMIN`, `GATEWAY_SERVICE`).
- **Route Lifecycle Management**: Full CRUD operations on API routes, allowed methods, rate limits, timeouts, and header manipulation rules.
- **Immutable Configuration Versioning & Rollback**: Every route change produces a versioned snapshot (`route_configuration_versions`). Any previous configuration can be rolled back with one click.
- **Multi-Tenant Organizations**: Tenant isolation with dedicated organization slugs and users.
- **Control Plane Audit Ledger**: Security audit log (`control_plane_audit_records`) tracking actor, action, resource, duration, and execution result.
- **Data Plane Sync**: Real-time discovery endpoint `/api/v1/internal/gateway/routes` queried by `smart-gateway-service`.
- **Mock Upstream Endpoints**: Built-in test backends (`/api/v1/mock/users`, `/api/v1/mock/echo`, `/api/v1/mock/delay/{ms}`, `/api/v1/mock/status/{code}`) for immediate end-to-end testing without external servers.

### 3. `analytics-service` (Port 8082) — Observability & Metrics
The analytics and metrics processing engine:
- **Dual Log Ingestion**: Ingests traffic events via Kafka consumer OR direct high-speed REST endpoint (`/api/v1/analytics/ingest`).
- **Resilient Storage**: Stores access logs in MongoDB when active, with in-memory ring-buffer storage fallback for seamless local operation.
- **Aggregated Metrics**: Calculates throughput, error rates, average latency, P95, and P99 percentiles.
- **Timeseries & Histograms**: Real-time request volume and latency distribution over selectable time windows (`15m`, `1h`, `6h`, `24h`, `7d`).
- **Status Code Distribution**: Categorized breakdown of `2xx`, `3xx`, `4xx`, and `5xx` responses.
- **Live Search & Filter**: Searchable access log query engine with routeId and status code filtering.

### 4. `frontend` (Port 3000) — Modern Web Console
A responsive React dashboard built with Vite, Tailwind CSS, and Lucide React:
- **Authentication**: Login screen with 1-click demo login buttons for Platform Admin and Tenant Admin.
- **Dashboard Overview**: KPI cards, cluster health indicators (Gateway, Management, Analytics), live SVG throughput chart, and recent traffic stream.
- **Route Management**: Searchable routes table, instant active/inactive toggle switch, route creation and edit modal, rate limit and timeout controls, and header transformation builder.
- **API Gateway Playground (Interactive Tester)**: Built-in API client (like Postman in the browser) that sends live requests through the Smart Gateway (Port 8080) and inspects response status, latency, headers, and formatted JSON body.
  - *Rate Limit Stress Test button*: Fires 15 rapid requests and displays HTTP 429 Too Many Requests live!
  - *Idempotency Test button*: Sends duplicate requests with the same Idempotency-Key and demonstrates cached replay!
- **Analytics & Observability Center**: Real-time throughput and latency charts, route performance table, status code breakdown, and searchable access log explorer.
- **Version History & Rollback Drawer**: Inspect historical snapshots of any route with 1-click rollback!
- **Organizations & Tenant Administration**: Multi-tenant organization creation and status monitoring.
- **Security Audit Logs**: Chronological log of control plane modifications.

---

## 🔑 Default Credentials

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `platform-admin` | `admin123` | `PLATFORM_ADMIN` | Global administrator with full cluster access |
| `tenant-admin` | `admin123` | `TENANT_ADMIN` | Tenant administrator for default organization |
| `gateway-service` | `gateway123` | `GATEWAY_SERVICE` | Internal data plane service account |

---

## 🛠️ How to Run

### Option A: Local Execution (Single Click)
Run the automated Windows batch or PowerShell script from the project root:

```cmd
start-all.bat
```
*or in PowerShell:*
```powershell
.\start-all.ps1
```

This launches:
1. `api-management-service` on `http://localhost:8081`
2. `smart-gateway-service` on `http://localhost:8080`
3. `analytics-service` on `http://localhost:8082`
4. `frontend` on `http://localhost:3000`

### Option B: Running Individual Services Locally
In separate terminals:

```powershell
# 1. API Management Service
cd api-management-service
.\mvnw.cmd spring-boot:run

# 2. Smart Gateway Service
cd smart-gateway-service
.\mvnw.cmd spring-boot:run

# 3. Analytics Service
cd analytics-service
.\mvnw.cmd spring-boot:run

# 4. Frontend Console
cd frontend
npm install
npm run dev
```

### Option C: Docker Compose
```bash
docker compose up -d
```

---

## 🧪 Testing the API Gateway

### 1. Test via Frontend API Playground
1. Open `http://localhost:3000` and sign in.
2. Click **API Playground** on the sidebar.
3. Select route **User Management Service** (`/gateway/api/v1/mock/users`).
4. Click **Send** to see the proxied response, latency, and injected gateway headers!
5. Click **Rate Limit Stress Test** to watch the gateway enforce rate limits and return `429 Too Many Requests`.
6. Click **Idempotency Test** to see deduplication in action with `X-Gateway-Idempotent-Replay: true`.

### 2. Test via cURL / Terminal

```bash
# 1. Send normal request through the Gateway
curl -i http://localhost:8080/gateway/api/v1/mock/users

# 2. Test Idempotency Deduplication (send twice with the same key)
curl -i -X POST http://localhost:8080/gateway/echo \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-001" \
  -d '{"message": "Hello Gatekeeper"}'

# 3. Trigger Rate Limiting (send rapid requests)
for /L %i in (1,1,20) do @curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/gateway/api/v1/mock/users

# 4. Sync Gateway Cache
curl -X POST http://localhost:8080/gateway/admin/sync
```

---

## 📡 API Reference Summary

### Control Plane (`http://localhost:8081`)
- `POST /api/v1/auth/login` — Authenticate and receive JWT
- `GET /api/v1/auth/me` — Current user profile
- `GET /api/v1/routes` — List all routes (filterable by search)
- `POST /api/v1/routes` — Create a new API route
- `PUT /api/v1/routes/{id}` — Update an API route (increments version)
- `PATCH /api/v1/routes/{id}/toggle` — Activate / deactivate route
- `DELETE /api/v1/routes/{id}` — Delete route
- `GET /api/v1/routes/{routeId}/versions` — List historical version snapshots
- `POST /api/v1/routes/{routeId}/rollback` — Rollback route to target version
- `GET /api/v1/internal/gateway/routes` — Internal route synchronization
- `GET /api/v1/mock/**` — Mock upstream endpoints (users, echo, delay, status)

### Data Plane (`http://localhost:8080`)
- `ANY /gateway/**` — Reverse proxy router for all active routes
- `POST /gateway/admin/sync` — Force immediate route cache refresh
- `GET /gateway/admin/routes` — List routes loaded in memory
- `GET /gateway/admin/status` — Gateway uptime and status

### Observability Engine (`http://localhost:8082`)
- `GET /api/v1/analytics/overview` — Cluster summary statistics
- `GET /api/v1/analytics/timeseries` — Request volume and latency timeseries
- `GET /api/v1/analytics/routes` — Per-route latency and error statistics
- `GET /api/v1/analytics/status-codes` — HTTP status code distribution
- `GET /api/v1/analytics/logs` — Searchable access log query
- `POST /api/v1/analytics/ingest` — Direct access log ingestion
- `POST /api/v1/analytics/seed-sample-data` — Seed sample traffic for demo

