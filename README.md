# AI Learning Platform

A production-ready AI-powered learning platform that delivers personalized, adaptive courses with video lessons, semantic search, real-time collaboration, and AI tutoring powered by Anthropic Claude.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** for server state
- **Zustand** for client state
- **Pusher** for real-time updates
- **PostHog** for product analytics

### Backend (API)
- **NestJS** (Node.js) — primary API
- **FastAPI** (Python) — AI/ML microservice (embeddings, RAG, ranking)
- **BullMQ** for background jobs (video processing, embeddings, emails)

### Data
- **PostgreSQL** (Neon) + **pgvector** for embeddings
- **Redis** for caching, sessions, and BullMQ
- **Meilisearch** for full-text search

### Media & Delivery
- **Mux** for video encoding and streaming
- **Cloudflare R2** for object storage
- **Cloudflare CDN** for edge delivery

### Integrations
- **WorkOS** — SSO / enterprise auth
- **Resend** — transactional email
- **Anthropic Claude** — AI tutor & content generation
- **Voyage AI** — embeddings

### Observability
- **Sentry** — error tracking
- **Datadog** — metrics/APM/logs
- **PostHog** — product analytics

### Deployment
- **Vercel** — frontend (Next.js)
- **Fly.io** — NestJS API + FastAPI AI service
- **Neon** — serverless Postgres

## Clean Architecture

This project strictly follows Clean Architecture. See `CLAUDE.md` at the root and in each layer folder for the rules enforced.

```
src/
├── domain/         # Entities, Value Objects, Repository Interfaces, Domain Services
├── application/    # Use Cases, DTOs, Ports, Application Services
├── infrastructure/ # DB, Redis, Mux, R2, Claude, Voyage, Resend, Pusher, BullMQ, FastAPI
└── interfaces/     # NestJS controllers, CLI, FastAPI routes, agent entry points
web/                # Next.js frontend (also an "interfaces" adapter)
```

### Dependency Rule (ABSOLUTE)

```
interfaces  ──▶  application  ──▶  domain
infrastructure ──▶ application ──▶ domain
```

- `domain/` imports NOTHING from outside itself — no SDKs, no ORMs, no `process.env`.
- `application/` defines ports (interfaces) that `infrastructure/` implements.
- `interfaces/` is thin: validate → call use case → serialize.

## Project Layout

```
.
├── CLAUDE.md                    # Global architecture contract
├── architecture.json            # Machine-readable layer rules
├── src/
│   ├── domain/
│   │   ├── entities/            # Course, Lesson, User, Enrollment, ...
│   │   ├── value-objects/       # EmailAddress, Progress, VideoDuration, ...
│   │   ├── repositories/        # ICourseRepository, IUserRepository, ...
│   │   └── services/            # RecommendationDomainService, ...
│   ├── application/
│   │   ├── use-cases/           # EnrollInCourseUseCase, AskTutorUseCase, ...
│   │   ├── dtos/
│   │   ├── ports/               # IAiTutorPort, IEmbeddingPort, IVideoPort, ...
│   │   └── services/
│   ├── infrastructure/
│   │   ├── persistence/         # Prisma + pgvector + Neon adapters
│   │   ├── cache/               # Redis
│   │   ├── queue/               # BullMQ
│   │   ├── ai/                  # Anthropic, Voyage
│   │   ├── media/               # Mux, Cloudflare R2
│   │   ├── email/               # Resend
│   │   ├── realtime/            # Pusher
│   │   ├── search/              # Meilisearch
│   │   ├── auth/                # WorkOS
│   │   ├── observability/       # Sentry, Datadog
│   │   └── ai-service/          # FastAPI Python RAG service (adapter)
│   └── interfaces/
│       ├── http/                # NestJS controllers & modules
│       ├── cli/                 # Nest commander CLI entry
│       ├── workers/             # BullMQ workers
│       └── ai-service/          # FastAPI routes (Python)
├── web/                         # Next.js frontend
├── prisma/                      # Prisma schema & migrations
├── fly.api.toml                 # Fly.io config for NestJS API
├── fly.ai.toml                  # Fly.io config for FastAPI AI service
└── docker-compose.yml           # Local Postgres/Redis/Meilisearch
```

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- Python ≥ 3.11
- Docker & Docker Compose
- A Neon (Postgres) project, Redis instance, and accounts for the integrations listed above

### 1. Install dependencies

```bash
# Backend (NestJS)
pnpm install

# Python AI service
cd src/interfaces/ai-service && pip install -r requirements.txt && cd -

# Frontend
cd web && pnpm install && cd -
```

### 2. Configure environment

```bash
cp .env.example .env
cp web/.env.example web/.env.local
```

Fill in values for Neon, Redis, WorkOS, Mux, R2, Resend, Pusher, Anthropic, Voyage, Sentry, Datadog, PostHog, Meilisearch.

### 3. Start local services

```bash
docker compose up -d        # Postgres + Redis + Meilisearch
pnpm prisma migrate dev     # Run migrations
```

### 4. Run the stack (dev)

```bash
# Terminal 1 — NestJS API
pnpm dev

# Terminal 2 — BullMQ workers
pnpm workers

# Terminal 3 — FastAPI AI service
cd src/interfaces/ai-service && uvicorn main:app --reload --port 8001

# Terminal 4 — Next.js frontend
cd web && pnpm dev
```

API: http://localhost:3000 · AI service: http://localhost:8001 · Web: http://localhost:3001

## Testing

```bash
pnpm test              # Unit tests (Jest)
pnpm test:e2e          # End-to-end API tests
cd web && pnpm test    # Frontend tests
```

## Deployment

- **Frontend** → Vercel (`vercel --prod` from `web/`)
- **NestJS API** → Fly.io (`fly deploy -c fly.api.toml`)
- **FastAPI AI** → Fly.io (`fly deploy -c fly.ai.toml`)
- **DB** → Neon (managed; run `pnpm prisma migrate deploy`)

## License

MIT
