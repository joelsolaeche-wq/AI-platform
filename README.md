# AI Learning Platform

A production-ready, AI-powered learning platform that delivers personalized, adaptive courses with video lessons, semantic search, real-time collaboration, and an AI tutor powered by Anthropic Claude.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Install](#install)
4. [Environment](#environment)
5. [Development](#development)
6. [Scripts](#scripts)
7. [Architecture](#architecture)
8. [Deployment](#deployment)
9. [License](#license)

---

## Overview

AI Learning Platform is a full-stack monorepo built on a **locked, opinionated stack**:

| Layer | Technology |
|---|---|
| Frontend | **Next.js 14** (App Router) · TypeScript · Tailwind CSS · shadcn/ui |
| API | **NestJS 10** (Node.js) · Clean Architecture |
| AI microservice | **FastAPI** (Python 3.11) · RAG · reranking |
| Database | **PostgreSQL 16** (Neon) · **pgvector** for embeddings |
| Cache / Queue | **Redis 7** · **BullMQ** |
| Auth | **Auth.js** (NextAuth) · **WorkOS** SSO |
| Search | **Meilisearch** full-text search |
| Media | **Mux** video encoding · **Cloudflare R2** object storage |
| AI models | **Anthropic Claude** (tutor) · **Voyage AI** (embeddings) |
| Email | **Resend** |
| Realtime | **Pusher** |
| Observability | **Sentry** · **Datadog** · **PostHog** |
| Deployment | **Vercel** (web) · **Fly.io** (API + AI service) · **Neon** (DB) |

The backend follows **Clean Architecture** with a strict dependency rule:

```
interfaces  ──▶  application  ──▶  domain
infrastructure ──▶ application ──▶ domain
```

---

## Prerequisites

Install the following tools before continuing. The exact versions below are what the project is locked to; using newer patch releases is fine but do not downgrade.

| Tool | Minimum version | Install |
|---|---|---|
| **Node.js** | 20 LTS | https://nodejs.org or `nvm install 20` |
| **pnpm** | 9.7.0 | `npm install -g pnpm@9.7.0` |
| **Python** | 3.11 | https://python.org or `pyenv install 3.11` |
| **Docker & Docker Compose** | Docker 24 / Compose v2 | https://docs.docker.com/get-docker/ |

> **Verify your setup**
> ```bash
> node  -v   # v20.x.x
> pnpm  -v   # 9.x.x
> python3 -V # Python 3.11.x
> docker compose version
> ```

---

## Install

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ai-learning-platform.git
cd ai-learning-platform
```

### 2. Install Node dependencies

```bash
# Install API (NestJS) dependencies
pnpm install

# Install frontend (Next.js) dependencies
cd web && pnpm install && cd ..
```

### 3. Install Python dependencies

```bash
pip install -r src/interfaces/ai-service/requirements.txt
```

> Using a virtual environment is recommended:
> ```bash
> python3 -m venv .venv
> source .venv/bin/activate          # Windows: .venv\Scripts\activate
> pip install -r src/interfaces/ai-service/requirements.txt
> ```

### 4. Generate the Prisma client

```bash
pnpm prisma:generate
```

---

## Environment

The project uses two separate `.env` files — one for the backend API and one for the Next.js frontend.

### 4a. Backend API (`/.env`)

```bash
cp .env.example .env
```

Open `.env` and fill in the values marked with `# required`:

```dotenv
# ─── Core ────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
AI_SERVICE_URL=http://localhost:8001

# ─── Database (Postgres + pgvector) ─────────────────────
# Spin up local DB with Docker (see Development section).
# For Neon: copy the connection string from your project dashboard.
DATABASE_URL=postgresql://user:password@localhost:5432/ailearning
DIRECT_URL=postgresql://user:password@localhost:5432/ailearning

# ─── Redis ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Auth (WorkOS) ───────────────────────────────────────
WORKOS_API_KEY=           # required — from workos.com dashboard
WORKOS_CLIENT_ID=         # required
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
WORKOS_COOKIE_PASSWORD=change-me-minimum-32-chars-please

# ─── NextAuth ────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=          # required

# ─── AI ──────────────────────────────────────────────────
ANTHROPIC_API_KEY=        # required — console.anthropic.com
ANTHROPIC_MODEL=claude-sonnet-4-20250514
VOYAGE_API_KEY=           # required — voyageai.com
VOYAGE_MODEL=voyage-3

# ─── Media (Mux) ─────────────────────────────────────────
MUX_TOKEN_ID=             # required for video features
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=

# ─── Cloudflare R2 ───────────────────────────────────────
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=ai-learning-assets
R2_PUBLIC_BASE_URL=https://cdn.example.com

# ─── Email (Resend) ──────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM="AI Learning <noreply@example.com>"

# ─── Realtime (Pusher) ───────────────────────────────────
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=us2

# ─── Search (Meilisearch) ────────────────────────────────
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=masterKey

# ─── Observability ───────────────────────────────────────
SENTRY_DSN=
DD_API_KEY=
DD_SERVICE=ai-learning-api
DD_ENV=development
POSTHOG_API_KEY=
POSTHOG_HOST=https://us.i.posthog.com
```

> **Minimum required for `pnpm dev` to start:** `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`.  
> All other keys can be left blank during initial local development; the features that need them will log a warning but the server will still boot.

### 4b. Frontend (`/web/.env.local`)

```bash
cp web/.env.example web/.env.local
```

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=us2
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Development

### Step 1 — Start local backing services

Docker Compose runs Postgres 16 with pgvector, Redis 7, and Meilisearch:

```bash
docker compose up -d
```

Verify the containers are healthy:

```bash
docker compose ps
```

Expected output:

```
NAME                    STATUS
ai-learning-postgres    running (healthy)
ai-learning-redis       running
ai-learning-meilisearch running
```

### Step 2 — Run database migrations

```bash
pnpm prisma:migrate
```

This applies all pending Prisma migrations to your local Postgres instance and re-generates the Prisma client.

### Step 3 — Run the full dev stack

Open **four terminal tabs** and run one command per tab:

**Terminal 1 — NestJS API** (http://localhost:3000)
```bash
pnpm dev
```

**Terminal 2 — BullMQ background workers**
```bash
pnpm workers
```

**Terminal 3 — FastAPI AI microservice** (http://localhost:8001)
```bash
cd src/interfaces/ai-service
uvicorn main:app --reload --port 8001
```

**Terminal 4 — Next.js frontend** (http://localhost:3001)
```bash
cd web
pnpm dev
```

| Service | URL |
|---|---|
| NestJS REST API | http://localhost:3000 |
| API health check | http://localhost:3000/health |
| FastAPI AI service | http://localhost:8001 |
| FastAPI docs | http://localhost:8001/docs |
| Next.js frontend | http://localhost:3001 |
| Meilisearch | http://localhost:7700 |

---

## Scripts

### Root (NestJS API)

| Script | Command | Description |
|---|---|---|
| `dev` | `pnpm dev` | Start NestJS in watch mode |
| `build` | `pnpm build` | Compile TypeScript to `dist/` |
| `start` | `pnpm start` | Start compiled production server |
| `workers` | `pnpm workers` | Start BullMQ worker processes |
| `cli` | `pnpm cli` | Run Nest Commander CLI tasks |
| `test` | `pnpm test` | Run all unit tests (Jest) |
| `test:watch` | `pnpm test:watch` | Run unit tests in watch mode |
| `test:e2e` | `pnpm test:e2e` | Run end-to-end API tests |
| `lint` | `pnpm lint` | Lint and auto-fix `src/**/*.ts` |
| `format` | `pnpm format` | Format `src/**/*.ts` with Prettier |
| `prisma:generate` | `pnpm prisma:generate` | Re-generate Prisma client |
| `prisma:migrate` | `pnpm prisma:migrate` | Create and apply a new migration |
| `prisma:deploy` | `pnpm prisma:deploy` | Apply migrations in production |

### Frontend (`web/`)

| Script | Command | Description |
|---|---|---|
| `dev` | `pnpm dev` | Start Next.js on port 3001 |
| `build` | `pnpm build` | Production Next.js build |
| `start` | `pnpm start` | Serve production build |
| `lint` | `pnpm lint` | Run Next.js ESLint |
| `test` | `pnpm test` | Run frontend unit tests |

---

## Architecture

```
.
├── src/
│   ├── domain/              # Entities, Value Objects, Repository Interfaces, Domain Services
│   ├── application/         # Use Cases, DTOs, Ports
│   ├── infrastructure/      # Prisma, Redis, Mux, R2, Claude, Voyage, Resend, Pusher, BullMQ
│   └── interfaces/
│       ├── http/            # NestJS controllers & modules
│       ├── cli/             # Nest Commander CLI
│       ├── workers/         # BullMQ worker entry point
│       └── ai-service/      # FastAPI routes (Python)
├── web/                     # Next.js 14 frontend
├── prisma/                  # Prisma schema & migrations
├── docker-compose.yml       # Local Postgres / Redis / Meilisearch
├── fly.api.toml             # Fly.io config — NestJS API
├── fly.ai.toml              # Fly.io config — FastAPI AI service
├── CLAUDE.md                # Architecture contract (read before contributing)
└── architecture.json        # Machine-readable layer rules
```

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture contract enforced in code review and CI.

---

## Deployment

| Target | Platform | Command |
|---|---|---|
| Frontend | Vercel | `cd web && vercel --prod` |
| NestJS API | Fly.io | `fly deploy -c fly.api.toml` |
| FastAPI AI service | Fly.io | `fly deploy -c fly.ai.toml` |
| Database migrations | Neon (Postgres) | `pnpm prisma:deploy` |

---

## License

MIT
