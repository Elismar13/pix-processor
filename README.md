# Pix Processor

An opinionated, testable reference implementation of the SPI/Pix message retrieval flow (Brazilian Central Bank) as described in endpoints.md. It demonstrates how a PSP can expose a streaming API with parallel collectors, avoid duplicate deliveries, and process payments asynchronously with queues.

This is a Minimal Viable Product (MVP) built with NestJS, BullMQ, Redis, and PostgreSQL.

## High-level architecture

```
┌──────────────┐      GET /stream/start|/{iterationId}       ┌───────────────┐
│    Client    │◄────────────────────────────────────────────►│ Pix Controller│
└─────┬────────┘                                              └───────┬───────┘
      │                                                                  │
      │                                                                  ▼
      │                                                     ┌────────────────────┐
      │                                                     │     Pix Service    │
      │                                                     └─────────┬──────────┘
      │                                                               │
      │                 claim/locks + stream state (IDs only)         │ load data
      │                                                               ▼
      │                                                     ┌────────────────────┐
      │                                                     │     Redis          │
      │                                                     └────────────────────┘
      │                                                               │ enqueue IDs
      │                                                               ▼
      │                                                     ┌────────────────────┐
      │                                                     │     BullMQ Queue   │
      │                                                     └─────────┬──────────┘
      │                                                               │
      │                                         update delivery state  ▼
      │                                                     ┌────────────────────┐
      │                                                     │  Worker + Postgres │
      │                                                     └────────────────────┘
```

Key ideas:
- Streams store only message IDs in Redis (low memory footprint).
- A simple Redis-based claim prevents the same ID from being enqueued by multiple streams.
- Workers load message data from PostgreSQL by ID and mark as processed/delivered.

## Technologies
- NestJS (TypeScript)
- Redis (ioredis)
- Bull/BullMQ (message processing)
- PostgreSQL (TypeORM)

## What this MVP contains
- Pix stream endpoints with parallel collectors (up to 6 per ISPB):
  - GET `/api/pix/{ispb}/stream/start`
  - GET `/api/pix/{ispb}/stream/{iterationId}`
  - DELETE `/api/pix/{ispb}/stream/{iterationId}` (planned/optional)
- Accept header behavior:
  - `application/json` returns exactly 1 message per call.
  - `multipart/json` returns up to 10 messages per call.
- Long polling semantics: return 200 with content or 204 after timeout, always including `Pull-Next`.
- Duplicate-avoidance via Redis claim:
  - `claimMessageIds(ispb, iterationId, ids)` associates each `messageId` to exactly one stream.
  - Only claimed IDs are enqueued and returned to the client.
- Queue processing with a worker that updates delivery flags in Postgres.

See full contract and examples in endpoints.md.

## How it works
- Start:
  - `startStream` queries up to 10 undelivered messages for the ISPB.
  - Claims their IDs in Redis (atomic HSETNX per ID) and stores only the claimed IDs in `stream:{iterationId}:messages`.
  - Returns messages (loaded from DB) and sets `Pull-Next` to the iteration URL.
- Continue:
  - `continueStream` reads up to N IDs from the stream (1 or 10), claims any not yet owned, requeues unclaimed to the stream head, enqueues only claimed to Bull, loads them from DB, and returns them.
  - Response always sets `Pull-Next` header.
- Worker:
  - Consumes enqueued IDs, updates `isProcessed`/`isDelivered` in Postgres, and can optionally release claims.

## Strengths
- Low Redis footprint (IDs only) and predictable memory usage.
- Simple claim mechanism to avoid duplicates across streams (no heavy transactions).
- Clear separation of concerns: HTTP API, queueing, persistence, and concurrency control.
- Extensible to different batching strategies and backpressure.

## Local setup
1) Requirements:
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

2) Install dependencies
```
npm install
```

3) Environment
- Configure Redis and Postgres via environment variables (see `.env.example` if available). Defaults:
  - REDIS_HOST=localhost, REDIS_PORT=6379
  - Postgres connection via TypeORM config

4) Run
```
npm run start:dev
```

5) Tests
```
npm test
```

## Endpoints overview
- Start stream: `GET /api/pix/{ispb}/stream/start`
- Continue: `GET /api/pix/{ispb}/stream/{iterationId}`
- Stop: `DELETE /api/pix/{ispb}/stream/{iterationId}` (optional)

Behavior highlights (see endpoints.md):
- `Accept: application/json` → 1 message; `Accept: multipart/json` → up to 10
- Always set `Pull-Next` with the next URL to call
- Return 204 when no content (after long-poll interval)

## Concurrency & duplicate prevention
- Redis Claim: `ispb:{ispb}:owners` hash associates `messageId -> iterationId` using HSETNX.
- Only claimed IDs are sent to clients and enqueued to the worker.
- Unclaimed IDs are preserved in the stream so that another attempt can claim them later.

## Queues & workers
- Queue: `message-processing` (Bull/BullMQ)
- Job payload includes only IDs (lean payloads, low network/Redis usage)
- Worker loads entities by ID and marks them as processed/delivered

## Known limitations (MVP)
- No lease/expiration for claims by default (can be added if needed)
- No automatic re-supply if the stream is empty beyond basic start; can be extended
- DELETE stream endpoint may be a no-op or partially implemented
- Minimal error handling/observability

## Roadmap / Improvements
- Add claim expiration (lease) and periodic cleanup
- Switch stream storage from JSON to Redis lists for O(1) trims/pushes
- Implement robust long-polling with cancellation and jitter
- Add metrics (Prometheus), tracing, and structured logging
- Backpressure and rate-limiting per ISPB/collector
- Idempotent worker with retry/DLQ strategy and visibility timeouts
- Harden database access patterns (e.g., SKIP LOCKED variant as alternative to Redis claim)
- E2E tests and performance tests for 1k+/min throughput

## License
MIT
