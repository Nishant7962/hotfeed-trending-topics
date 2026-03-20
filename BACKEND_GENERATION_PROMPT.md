# HotFeed — Complete Backend Generation Prompt

> Feed this entire file to your AI code generation tool (Cursor, GitHub Copilot Workspace,
> Claude Code, or similar). It is self-contained and covers every service, file, schema,
> algorithm, and integration the HotFeed frontend expects.

---

## 0. Project Context

You are building the **complete backend** for **HotFeed** — a real-time trending social media
feed. The frontend is React + Vite + TypeScript. It expects:

- A REST API served at `http://localhost:4000`
- Socket.io on the same port for live rank-push events
- Redis for the top-20 leaderboard cache (refreshed every 30 seconds)
- PostgreSQL as the primary data store
- A background scoring engine that continuously recalculates trending scores

The frontend has these active consumers:
- `useHotTopics.js` — subscribes to Socket.io channel `trending:update`
- `useSearch.js` — calls `GET /api/posts/search?q=`
- `HotTopicsGrid.jsx` — calls `GET /api/posts?page=&limit=20`
- `CategoryPage.jsx` — calls `GET /api/posts?category=&page=&limit=20`
- `PostCard.jsx` — fires `POST /api/posts/:id/view` on mount
- Engagement buttons — fire `POST /api/posts/:id/like` and `/share`

---

## 1. Folder Structure

Generate this exact folder and file layout. Do not add extras; do not omit any file listed.

```
server/
├── index.ts                         ← Express + Socket.io bootstrap
├── config/
│   ├── db.ts                        ← PostgreSQL pool (pg)
│   ├── redis.ts                     ← Redis client (ioredis)
│   └── trending.config.ts           ← Scoring weights + band thresholds
├── routes/
│   ├── posts.ts                     ← All /api/posts routes
│   └── categories.ts                ← GET /api/categories
├── services/
│   ├── trendingEngine.ts            ← Score calculation + banding
│   ├── cacheLayer.ts                ← Redis ZSET read/write helpers
│   └── searchService.ts             ← Full-text search on PostgreSQL
├── socket/
│   └── trendingPush.ts              ← Socket.io emitter
├── workers/
│   └── rankingWorker.ts             ← setInterval engine (every 30s)
├── middleware/
│   ├── errorHandler.ts              ← Global error handler
│   ├── rateLimiter.ts               ← express-rate-limit config
│   └── validate.ts                  ← Zod request validation
├── types/
│   └── post.types.ts                ← Shared TypeScript interfaces
├── database/
│   ├── schema.sql                   ← Full DDL — posts, categories, votes
│   └── seed.ts                      ← 100+ posts across 6 categories
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 2. Environment Variables

Create `.env.example` with exactly these keys:

```env
PORT=4000
NODE_ENV=development

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=hotfeed
PG_USER=postgres
PG_PASSWORD=yourpassword

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Scoring weights (used by trending.config.ts)
WEIGHT_VIEWS=1
WEIGHT_LIKES=3
WEIGHT_SHARES=5

# Band thresholds
BAND_HOT_THRESHOLD=80000
BAND_WARM_THRESHOLD=40000

# Cache
CACHE_TTL_SECONDS=30
TOP_N_CACHED=20

# CORS
CLIENT_ORIGIN=http://localhost:5173
```

---

## 3. TypeScript Interfaces

### `types/post.types.ts`

```typescript
export interface Post {
  id: string;             // UUID
  rank: number;           // 1-based position in current leaderboard
  title: string;
  category: Category;
  score: number;          // Computed trending score
  likes: number;
  views: number;
  shares: number;
  recencyDecay: number;   // Negative float — applied during scoring
  isNew?: boolean;        // True if post entered top-20 in last cycle
  trending: TrendingBand; // 'hot' | 'warm' | 'cold'
  createdAt: Date;
  updatedAt: Date;
}

export type Category =
  | 'Tech'
  | 'Sports'
  | 'Gaming'
  | 'Music'
  | 'Science'
  | 'Culture';

export type TrendingBand = 'hot' | 'warm' | 'cold';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface EngagementResult {
  id: string;
  likes: number;
  views: number;
  shares: number;
  score: number;
  trending: TrendingBand;
}

export interface RankUpdateEvent {
  posts: Post[];           // Full updated top-20 list
  changes: RankChange[];   // Which posts changed rank this cycle
}

export interface RankChange {
  postId: string;
  previousRank: number;
  currentRank: number;
  direction: 'up' | 'down' | 'new' | 'unchanged';
}
```

---

## 4. Database Schema

### `database/schema.sql`

Generate the full DDL with these exact tables and constraints:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Categories lookup table
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES
  ('Tech'), ('Sports'), ('Gaming'), ('Music'), ('Science'), ('Culture')
ON CONFLICT DO NOTHING;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  category       VARCHAR(50) NOT NULL REFERENCES categories(name),
  likes          INTEGER     NOT NULL DEFAULT 0,
  views          INTEGER     NOT NULL DEFAULT 0,
  shares         INTEGER     NOT NULL DEFAULT 0,
  score          NUMERIC     NOT NULL DEFAULT 0,
  rank           INTEGER,
  recency_decay  NUMERIC     NOT NULL DEFAULT 0,
  trending       VARCHAR(10) NOT NULL DEFAULT 'cold'
                             CHECK (trending IN ('hot', 'warm', 'cold')),
  is_new         BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index on title
CREATE INDEX IF NOT EXISTS posts_title_fts
  ON posts USING gin(to_tsvector('english', title));

-- Score index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS posts_score_idx ON posts (score DESC);

-- Category filter index
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. Configuration

### `config/trending.config.ts`

```typescript
// All values are overridable via environment variables.
// The frontend reads band thresholds to determine TrendingBadge color tier.

export const TRENDING_CONFIG = {
  weights: {
    views:  Number(process.env.WEIGHT_VIEWS)  || 1,
    likes:  Number(process.env.WEIGHT_LIKES)  || 3,
    shares: Number(process.env.WEIGHT_SHARES) || 5,
  },
  bands: {
    hot:  Number(process.env.BAND_HOT_THRESHOLD)  || 80_000,
    warm: Number(process.env.BAND_WARM_THRESHOLD) || 40_000,
  },
  cache: {
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 30,
    topN:       Number(process.env.TOP_N_CACHED)      || 20,
  },
  decay: {
    // Half-life in hours — score halves every N hours
    halfLifeHours: 24,
  },
} as const;
```

### `config/db.ts`

Generate a `pg.Pool` instance using env vars. Export a typed `query()` helper that wraps
`pool.query()` and automatically logs slow queries (>500ms) to stderr.

### `config/redis.ts`

Generate an `ioredis` client with auto-reconnect. Export a singleton `redis` instance.
On connection error, log to stderr but do NOT crash the process — the app must degrade
gracefully by bypassing cache and hitting PostgreSQL directly.

---

## 6. Core Services

### `services/trendingEngine.ts`

Implement and export the following functions:

#### `calculateScore(post: Pick<Post, 'views' | 'likes' | 'shares' | 'createdAt'>): number`

Formula:
```
score = (views × weight_v) + (likes × weight_l) + (shares × weight_s) - recencyDecay
```

Recency decay formula:
```
hoursAge    = (Date.now() - createdAt.getTime()) / 3_600_000
recencyDecay = score_raw × (1 - 0.5 ^ (hoursAge / halfLifeHours))
```

So a post 24 hours old loses 50% of its raw score. A post 48 hours old loses 75%, etc.

#### `getBand(score: number): TrendingBand`

```
score >= BAND_HOT_THRESHOLD  → 'hot'
score >= BAND_WARM_THRESHOLD → 'warm'
else                         → 'cold'
```

#### `computeAndRankAll(): Promise<Post[]>`

1. Fetch all posts from PostgreSQL
2. Recalculate `score` and `recencyDecay` for each
3. Sort by `score` descending
4. Assign `rank` (1-based)
5. Set `trending` band
6. Mark `isNew: true` for posts that were NOT in the previous top-20 but are now
7. Bulk UPDATE all posts in PostgreSQL with new score/rank/trending values
8. Return the sorted list

---

### `services/cacheLayer.ts`

Use Redis **sorted sets** (`ZSET`) — the industry-standard leaderboard structure.

The Redis key for the leaderboard is `hotfeed:trending:top20`.

Implement and export:

#### `cacheTopPosts(posts: Post[]): Promise<void>`

- `ZADD hotfeed:trending:top20` with score = trending score, member = JSON.stringify(post)
- `EXPIRE hotfeed:trending:top20 {ttlSeconds}`
- Keep only top N members: `ZREMRANGEBYRANK hotfeed:trending:top20 0 -(N+1)`

#### `getTopPostsFromCache(): Promise<Post[] | null>`

- `ZREVRANGE hotfeed:trending:top20 0 N-1 WITHSCORES`
- Parse each member back to `Post`
- Return `null` if key is missing or Redis is unavailable (triggers DB fallback)

#### `invalidateCache(): Promise<void>`

- `DEL hotfeed:trending:top20`

#### `getCacheAge(): Promise<number>`

- Returns remaining TTL in seconds via `TTL hotfeed:trending:top20`
- Used by the frontend 30-second refresh bar

---

### `services/searchService.ts`

Implement and export:

#### `searchPosts(query: string, category?: string): Promise<Post[]>`

Use PostgreSQL full-text search:

```sql
SELECT *, ts_rank(to_tsvector('english', title), plainto_tsquery('english', $1)) AS relevance
FROM posts
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', $1)
  AND ($2::text IS NULL OR category = $2)
ORDER BY relevance DESC, score DESC
LIMIT 20;
```

- Sanitize query: strip special characters, trim whitespace
- If query is empty return `[]` immediately without hitting DB
- Return posts shaped to the `Post` interface

---

## 7. API Routes

### `routes/posts.ts`

Implement all routes with Zod validation on query params and body.

#### `GET /api/posts`

Query params:
- `page` (integer, default 1)
- `limit` (integer, default 20, max 50)
- `category` (optional, one of the 6 valid values)

Logic:
1. If `page === 1` AND no `category` filter → try Redis cache first via `getTopPostsFromCache()`
2. On cache hit: return cached posts with `meta.fromCache: true`
3. On cache miss or filtered request: query PostgreSQL ordered by `score DESC`
4. Apply OFFSET pagination: `OFFSET (page - 1) * limit LIMIT limit`
5. Return `PaginatedResponse<Post>`

Response shape:
```json
{
  "data": [ ...Post[] ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 247,
    "hasNextPage": true,
    "fromCache": true,
    "cacheAge": 14
  }
}
```

#### `GET /api/posts/search`

Query params:
- `q` (string, required, min 2 chars)
- `category` (optional)

Logic: delegate to `searchService.searchPosts()`. Return array of `Post`.

#### `POST /api/posts/:id/like`

- Validate `:id` is a valid UUID
- `UPDATE posts SET likes = likes + 1 WHERE id = $1`
- Recalculate score for this single post via `trendingEngine.calculateScore()`
- Update score and trending band in DB
- Invalidate Redis cache via `cacheLayer.invalidateCache()`
- Return `EngagementResult`

#### `POST /api/posts/:id/view`

- Same pattern as `/like` but increments `views`
- **Rate-limit this endpoint aggressively**: max 1 view per IP per post per 60 seconds
  (use a Redis key `view:{ip}:{postId}` with 60s TTL)
- This prevents view-count inflation from frontend re-renders

#### `POST /api/posts/:id/share`

- Same pattern as `/like` but increments `shares`

---

### `routes/categories.ts`

#### `GET /api/categories`

Returns the static list with post counts:

```json
[
  { "name": "Tech",    "count": 42 },
  { "name": "Sports",  "count": 38 },
  { "name": "Gaming",  "count": 31 },
  { "name": "Music",   "count": 29 },
  { "name": "Science", "count": 25 },
  { "name": "Culture", "count": 22 }
]
```

Cache this response in Redis for 5 minutes key `hotfeed:categories`.

---

## 8. Socket.io — Real-time Push

### `socket/trendingPush.ts`

```typescript
// This module holds the Socket.io server reference and exposes
// a single function the ranking worker calls after each cycle.

export function initSocket(httpServer: http.Server): void
// Attach Socket.io to the HTTP server.
// On client connect: immediately emit 'trending:snapshot' with
// current top-20 from cache (or DB fallback).

export function pushRankUpdate(event: RankUpdateEvent): void
// Emit 'trending:update' to ALL connected clients.
// event contains full updated post list + per-post rank changes.
```

**Socket.io events the frontend listens for:**

| Event | Payload | When emitted |
|---|---|---|
| `trending:snapshot` | `Post[]` | On client connect — sends current top-20 immediately |
| `trending:update` | `RankUpdateEvent` | After every 30s ranking worker cycle |
| `trending:cacheAge` | `{ secondsRemaining: number }` | Every second (countdown for the frontend cache bar) |

**`trending:cacheAge` implementation:**
After each ranking cycle resets the cache, start a `setInterval` that emits
`trending:cacheAge` every 1 second with the remaining TTL. The frontend uses
this to animate the 30-second progress bar at the top of the page.

---

## 9. Background Worker

### `workers/rankingWorker.ts`

```typescript
export function startRankingWorker(): void
```

This is the heartbeat of the whole system. It must:

1. Run immediately on startup, then every 30 seconds
2. Call `trendingEngine.computeAndRankAll()` — recalculates all scores
3. Compare new top-20 with previous top-20 to detect `RankChange[]`
4. Write new top-20 to Redis via `cacheLayer.cacheTopPosts()`
5. Call `trendingPush.pushRankUpdate({ posts, changes })` to notify all clients
6. Log cycle time to stdout: `[RankingWorker] Cycle complete in 142ms — 20 posts cached`

**Detecting rank changes:**

```typescript
// Before the cycle: read previous top-20 from cache (keyed by postId → rank)
// After the cycle: compare new ranks
// direction logic:
//   previousRank === undefined          → 'new'   (entered top-20)
//   newRank < previousRank              → 'up'
//   newRank > previousRank              → 'down'
//   newRank === previousRank            → 'unchanged'
```

**Error resilience:**
- Wrap entire cycle in try/catch
- On error: log to stderr but continue — do NOT crash the worker
- If PostgreSQL is down: skip this cycle, retry next interval
- If Redis is down: still emit Socket.io update directly from DB result

---

## 10. Server Bootstrap

### `index.ts`

Bootstrap in this exact order:

```typescript
1. Load dotenv
2. Create Express app
3. Apply middleware: cors, helmet, express.json(), rateLimiter
4. Mount routes: app.use('/api/posts', postsRouter)
                 app.use('/api/categories', categoriesRouter)
5. Apply errorHandler middleware LAST
6. Create http.Server from app
7. initSocket(httpServer)  ← attach Socket.io
8. httpServer.listen(PORT)
9. startRankingWorker()    ← start background loop
10. Log: "HotFeed server running on port 4000"
```

CORS config: allow `CLIENT_ORIGIN` from env, credentials: true.

---

## 11. Middleware

### `middleware/rateLimiter.ts`

Use `express-rate-limit`:
- General API: 100 requests per minute per IP
- `/api/posts/:id/view`: 1 request per 60 seconds per IP per post (custom Redis key)
- `/api/posts/search`: 30 requests per minute per IP

### `middleware/errorHandler.ts`

Global error handler that:
- Returns `{ error: string, code: string }` JSON — never stack traces in production
- Maps Zod `ZodError` → 400 with field-level error details
- Maps PostgreSQL error code `23505` (unique violation) → 409
- All other errors → 500

### `middleware/validate.ts`

Export a `validate(schema: ZodSchema)` middleware factory that validates `req.query`
or `req.body` and calls `next(error)` on failure.

---

## 12. Seed Data

### `database/seed.ts`

Generate 120 posts across all 6 categories (20 per category). Each post must have:

- Realistic titles relevant to the category (e.g. Tech: "TypeScript 6.0 ships with
  native decorators", Sports: "Champions League final breaks viewership record")
- `views` between 1,000 and 500,000 (random)
- `likes` between 100 and 50,000 (random, correlated with views at ~10% ratio)
- `shares` between 10 and 5,000 (random, ~2% of views)
- `createdAt` spread across the last 7 days (random timestamps)
- Score and trending band pre-calculated via `trendingEngine.calculateScore()`

Run with: `npx ts-node database/seed.ts`

---

## 13. Package Dependencies

### `package.json` — required dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "pg": "^8.11.3",
    "ioredis": "^5.3.2",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.2",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.10.9",
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  },
  "scripts": {
    "dev": "nodemon --exec ts-node index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node database/seed.ts",
    "db:schema": "psql $DATABASE_URL -f database/schema.sql"
  }
}
```

---

## 14. TypeScript Config

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 15. Complete Data Flow Summary

For reference when debugging or extending the system:

```
POST created in DB
      ↓
rankingWorker fires (every 30s)
      ↓
trendingEngine.computeAndRankAll()
  → fetch all posts from PostgreSQL
  → calculate score = (views×1) + (likes×3) + (shares×5) − recencyDecay
  → assign rank 1..N by score DESC
  → assign trending band (hot/warm/cold)
  → detect isNew (was not in previous top-20)
  → bulk UPDATE PostgreSQL
      ↓
cacheLayer.cacheTopPosts(top20)
  → ZADD hotfeed:trending:top20
  → EXPIRE 30s
      ↓
trendingPush.pushRankUpdate({ posts, changes })
  → Socket.io emit 'trending:update' to all clients
      ↓
useHotTopics.js receives event
  → Updates React state
  → HotTopicsGrid re-renders with rank-change animations
```

---

## 16. API Contract Summary

| Method | Endpoint | Auth | Cache | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/posts` | None | Redis 30s | Paginated trending posts |
| GET | `/api/posts?category=Tech` | None | DB only | Category-filtered posts |
| GET | `/api/posts/search?q=` | None | None | Full-text search |
| GET | `/api/categories` | None | Redis 5m | Category list with counts |
| POST | `/api/posts/:id/like` | None | Invalidates | Increment likes |
| POST | `/api/posts/:id/view` | None | Invalidates | Increment views (rate limited) |
| POST | `/api/posts/:id/share` | None | Invalidates | Increment shares |

---

## 17. Critical Implementation Rules

Follow these exactly — they prevent the most common integration bugs:

1. **Never return camelCase from PostgreSQL directly.** Map `snake_case` DB columns
   to `camelCase` in a transform function before returning from any route handler.
   Example: `recency_decay` → `recencyDecay`, `is_new` → `isNew`, `created_at` → `createdAt`.

2. **The `/api/posts/search` route must be registered BEFORE `/api/posts/:id`.**
   Express matches routes in order — if `:id` is first, the string "search" is
   treated as a post ID and the route fails.

3. **Socket.io CORS must match Express CORS.** Both must allow `CLIENT_ORIGIN`.
   Configure Socket.io as: `new Server(httpServer, { cors: { origin: CLIENT_ORIGIN, credentials: true } })`.

4. **Redis unavailability must NOT crash the API.** Every Redis call must be wrapped
   in try/catch with a DB fallback. The frontend must still work when Redis is down,
   just with slightly higher DB load.

5. **The ranking worker must store the previous top-20 in memory** (not Redis) between
   cycles so it can compute `RankChange[]` without an extra Redis round-trip.

6. **View deduplication is mandatory.** Without it, `PostCard.jsx` mounting and
   unmounting during React re-renders will flood the view counter. Implement the
   Redis TTL key pattern: `SET view:{ip}:{postId} 1 EX 60 NX`.

7. **Score must be recomputed on every engagement event** (like/view/share), not just
   during the 30-second cycle. Otherwise a post can accumulate thousands of likes
   between cycles without its badge updating. After each mutation, recalculate the
   single post's score and update its `trending` band in PostgreSQL immediately.

8. **`isNew` flag must be cleared after one cycle.** When a post enters the top-20
   and is marked `isNew: true`, the next cycle must set it back to `false` unless
   it just entered again (which is impossible — it's already there).
