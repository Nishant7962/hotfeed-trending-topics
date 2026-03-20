# Backend Requirements for Trending Hot Topics

Based on the frontend implementation (React, Vite, TypeScript), the application expects a backend that can deliver dynamic, paginated lists of posts and compute trending metrics.

## 1. Data Models / Database Schema

The frontend currently relies on mock data with a specific structure (`src/app/data/mockPosts.ts`). The backend needs to provide a corresponding `Post` entity.

**`Post` Model:**
```typescript
interface Post {
  id: string;              // UUID or ObjectId
  rank: number;            // Current ranking position (1, 2, 3...)
  title: string;           // Title of the post
  category: string;        // Enum: 'Tech', 'Sports', 'Gaming', 'Music', 'Science', 'Culture'
  score: number;           // Total computed trending score
  likes: number;           // Number of likes
  views: number;           // Number of views
  shares: number;          // Number of shares
  recencyDecay: number;    // Negative value utilized to decay older posts
  isNew?: boolean;         // Optional flag for newly added posts
  trending?: string;       // Enum: 'hot', 'warm', 'cold'
}
```

## 2. Core API Endpoints

The backend must expose REST or GraphQL endpoints to serve and manipulate these entries. Based on the frontend logic (e.g., in `HomePage.tsx`), the following endpoints are required:

### Read Operations
- **Get All Trending Posts**
  - **Endpoint:** `GET /api/posts`
  - **Query Params:** `page`, `limit` (or `cursor` for infinite scroll support).
  - **Description:** The `HomePage.tsx` component includes an `<InfiniteScrollTrigger />`, which strictly necessitates pagination.
  - **Response:** Array of `Post` objects, ordered by highest `score` / lowest `rank`.

- **Filter Posts by Category**
  - **Endpoint:** `GET /api/posts?category={category_name}`
  - **Response:** Array of `Post` objects filtered by the specified category.

- **Search Posts**
  - **Endpoint:** `GET /api/posts/search?q={search_term}`
  - **Response:** Array of `Post` objects where the `title` matches the search query. This requires full-text search capabilities in the database.

### Write/Mutation Operations
While not explicitly mocked in the read-only UI at the moment, a fully functional app requires these interactions to update metrics:
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/view` 
- `POST /api/posts/:id/share`

## 3. Business Logic & Ranking Algorithm

The mock data specifies attributes like `score`, `rank`, and `recencyDecay`. The backend must implement a background worker, cron job, or a dynamic computing engine that recalculates the "Trending Score".

- **Trending Algorithm:** A mathematical formula evaluating `(views * weight_v) + (likes * weight_l) + (shares * weight_s) - time_decay`. 
- **Banding:** Depending on the computed score, the system needs to categorize the `trending` status into `'hot'`, `'warm'`, or `'cold'`.
- **Ranking Engine:** A continuous process that sorts all posts by their computed score and updates their absolute `rank` position (1st, 2nd, 3rd, etc.). This ensures the frontend consistently displays the top 3 posts as "Hero" items in the UI.

## 4. Technical Stack Recommendations

Given the Vite + React TS frontend, a modern Node.js backend would fit perfectly:

- **Language/Framework:** Node.js with Express or NestJS (allows for full-stack TypeScript).
- **Database:** 
  - *Primary DB:* PostgreSQL or MongoDB (to safely store post metadata).
  - *Caching/Ranking Engine:* **Redis**. Redis sorted sets (`ZSET`) are the industry-standard approach for building real-time "trending" leaderboards. They handle high-volume reads and fast rank calculations efficiently without crashing the primary database.
