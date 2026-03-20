import { computeAndRankAll } from '../services/trendingEngine';
import { cacheTopPosts } from '../services/cacheLayer';
import { pushRankUpdate } from '../socket/trendingPush';
import { Post, RankChange } from '../types/post.types';

// In-memory map of the previous top-20: postId → rank
let previousTop20Map: Map<string, number> = new Map();
let previousTop20Ids: Set<string> = new Set();

const INTERVAL_MS = (Number(process.env.CACHE_TTL_SECONDS) || 30) * 1000;

async function runCycle(): Promise<void> {
  const cycleStart = Date.now();
  console.log('[RankingWorker] Starting cycle...');

  try {
    // 1. Recompute all scores + ranks
    const allPosts = await computeAndRankAll(previousTop20Ids);
    if (allPosts.length === 0) {
      console.log('[RankingWorker] No posts in DB — skipping cycle');
      return;
    }

    const top20 = allPosts.slice(0, 20);

    // 2. Detect rank changes
    const changes: RankChange[] = top20.map((post: Post) => {
      const prevRank = previousTop20Map.get(post.id);
      let direction: RankChange['direction'] = 'unchanged';
      if (prevRank === undefined) direction = 'new';
      else if (post.rank < prevRank) direction = 'up';
      else if (post.rank > prevRank) direction = 'down';

      return {
        postId:       post.id,
        previousRank: prevRank ?? 0,
        currentRank:  post.rank,
        direction,
      };
    });

    // 3. Write new top-20 to Redis
    await cacheTopPosts(top20);

    // 4. Push Socket.io update
    pushRankUpdate({ posts: top20, changes });

    // 5. Update in-memory reference
    previousTop20Map = new Map(top20.map((p: Post) => [p.id, p.rank]));
    previousTop20Ids = new Set(top20.map((p: Post) => p.id));

    const duration = Date.now() - cycleStart;
    console.log(`[RankingWorker] Cycle complete in ${duration}ms — ${top20.length} posts cached`);
  } catch (err) {
    console.error('[RankingWorker] Cycle error (continuing):', (err as Error).message);
  }
}

export function startRankingWorker(): void {
  console.log('[RankingWorker] Starting...');
  // Run immediately, then every INTERVAL_MS
  runCycle();
  setInterval(runCycle, INTERVAL_MS);
}
