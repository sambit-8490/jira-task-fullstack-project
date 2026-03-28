# Full-Stack Assessment — Project & Task Management System

A full-stack project and task management application built with Node.js, Express, TypeScript, React 18, PostgreSQL, Redis, and BullMQ.

---

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose
- [Node.js](https://nodejs.org/) 20+ (for running the frontend locally)

### 1. Clone and configure

```bash
git clone <repository-url>
cd fullstack-assessment

# Copy root env file (used by docker-compose)
cp .env.example .env
```

Edit `.env` and set strong JWT secrets (at least 32 characters each):

```
JWT_ACCESS_SECRET=your-strong-random-secret-here-minimum-32-chars
JWT_REFRESH_SECRET=your-other-strong-random-secret-here-32-chars
```

### 2. Start the backend stack

```bash
docker-compose up --build
```

This will:
- Start **PostgreSQL** on port `5432`
- Start **Redis** on port `6379`
- Start the **backend** on port `4000` with hot reload
- Automatically run Prisma migrations

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at **http://localhost:5173**

> **Note:** Docker container names are `fsa_postgres`, `fsa_redis`, `fsa_backend`

---

## Running Tests

Tests require a running PostgreSQL instance (you can use the Docker one).

```bash
cd backend

# Copy and configure test env
cp .env.example .env
# Make sure TEST_DATABASE_URL points to a separate test database

# Install dependencies
npm install

# Create test database
createdb pma_test_db  # or connect to Postgres and run: CREATE DATABASE pma_test_db;

# Sync schema to test DB
TEST_DATABASE_URL=<your_test_url> npx prisma db push --schema=src/models/schema.prisma

# Run tests
npm run test
```

---

## Environment Variables

All variables are documented in `.env.example` (root) and `backend/.env.example`.

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend port | `4000` |
| `DATABASE_URL` | PostgreSQL connection URL | — |
| `TEST_DATABASE_URL` | Separate database for Jest tests | — |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 32 chars) | — |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) | — |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `EXPORTS_DIR` | Directory for generated CSV files | `./exports` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `POSTGRES_USER` | Postgres user (docker-compose) | `pma_user` |
| `POSTGRES_PASSWORD` | Postgres password (docker-compose) | `pma_password` |
| `POSTGRES_DB` | Postgres database name (docker-compose) | `pma_db` |

---

## API Overview

Base URL: `http://localhost:4000/api`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register — returns access + refresh token |
| POST | `/auth/login` | Login — returns access + refresh token |
| POST | `/auth/refresh` | Rotate refresh token, get new access token |
| POST | `/auth/logout` | Invalidate refresh token |

### Projects (Bearer auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List user's projects (paginated, cached) |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project with tasks (cached) |
| POST | `/projects/:id/members` | Add member by email (owner only) |
| DELETE | `/projects/:id/members/:userId` | Remove member (owner only) |
| POST | `/projects/:id/export` | Trigger async CSV export |

### Tasks (Bearer auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (filterable by project, status, priority) |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task (owner only) |

### Exports (Bearer auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exports` | List user's export history |
| GET | `/exports/:id` | Get export status |
| GET | `/exports/:id/download` | Download completed CSV |

---

## Key Decisions

- **Refresh token rotation**: On every `/auth/refresh` call, the old refresh token is deleted and a new one is issued. This limits the window for refresh token abuse — a stolen token can only be used once before it's rotated away.

- **Cache-aside over write-through**: We delete cache keys on write events rather than updating them. This is simpler and avoids race conditions between the cache write and DB write. The downside (brief staleness) is acceptable given the 2–5 minute TTLs.

- **Service-layer RBAC**: Access control checks live in service functions, not middleware. This ensures every code path goes through the same guard regardless of how it's called, making it harder to accidentally bypass via new routes.

- **Optimistic UI updates**: The Kanban drag-and-drop uses TanStack Query's `onMutate`/`onError`/`onSettled` pattern — the UI updates immediately, and rolls back if the API call fails. This eliminates the perceived latency of a status change.

- **BullMQ over simple `setTimeout`**: Async export processing uses BullMQ so jobs survive server restarts, can be retried with exponential backoff, and are observable. The queue is backed by the same Redis instance used for caching.

- **Prisma over raw SQL**: Prisma provides type-safe database access, auto-generated migrations, and excellent TypeScript ergonomics. The schema is the single source of truth for both database structure and TypeScript types.

- **No component library**: TailwindCSS only, as required. A custom design system (buttons, inputs, modals, badges) was built using `@layer components` in `index.css`, keeping the component code clean.

- **`any`-free codebase**: Both backend and frontend are compiled with `strict: true`. Express's custom request type (`AuthenticatedRequest`) extends the base `Request` type to add the `user` property safely without casting to `any`.

---

## Known Limitations

- **No email verification**: Registration doesn't verify email addresses — any valid email format is accepted.
- **No file storage service**: Generated CSV files are stored on the local filesystem inside the container. In production, these should be uploaded to S3/GCS and served via signed URLs.
- **Export history per-user only**: `/api/exports` returns exports for the authenticated user only; owners cannot see exports triggered by other members.
- **Tests require manual DB setup**: The test database must be created and migrated manually before running Jest. A setup script would improve DX.
- **No pagination on export history**: The export history list returns all records without pagination.
