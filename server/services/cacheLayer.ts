import { redis } from '../config/redis';
import { TRENDING_CONFIG } from '../config/trending.config';
import { Post } from '../types/post.types';

const LEADERBOARD_KEY = 'hotfeed:trending:top20';

export async function cacheTopPosts(posts: Post[]): Promise<void> {
  try {
    const { ttlSeconds, topN } = TRENDING_CONFIG.cache;
    const pipeline = redis.pipeline();

    pipeline.del(LEADERBOARD_KEY);
    for (const post of posts.slice(0, topN)) {
      pipeline.zadd(LEADERBOARD_KEY, post.score, JSON.stringify(post));
    }
    // Keep only top N
    pipeline.zremrangebyrank(LEADERBOARD_KEY, 0, -(topN + 2));
    pipeline.expire(LEADERBOARD_KEY, ttlSeconds);

    await pipeline.exec();
  } catch (err) {
    console.error('[Cache] cacheTopPosts error:', (err as Error).message);
  }
}

export async function getTopPostsFromCache(): Promise<Post[] | null> {
  try {
    const { topN } = TRENDING_CONFIG.cache;
    const members = await redis.zrevrange(LEADERBOARD_KEY, 0, topN - 1);
    if (!members || members.length === 0) return null;
    return members.map((m) => JSON.parse(m) as Post);
  } catch (err) {
    console.error('[Cache] getTopPostsFromCache error:', (err as Error).message);
    return null;
  }
}

export async function invalidateCache(): Promise<void> {
  try {
    await redis.del(LEADERBOARD_KEY);
  } catch (err) {
    console.error('[Cache] invalidateCache error:', (err as Error).message);
  }
}

export async function getCacheAge(): Promise<number> {
  try {
    const ttl = await redis.ttl(LEADERBOARD_KEY);
    return ttl < 0 ? 0 : ttl;
  } catch (err) {
    console.error('[Cache] getCacheAge error:', (err as Error).message);
    return 0;
  }
}

export async function setCategoryCount(categoryName: string, count: number): Promise<void> {
  try {
    await redis.setex(`hotfeed:categories:${categoryName}`, 300, String(count));
  } catch (err) {
    console.error('[Cache] setCategoryCount error:', (err as Error).message);
  }
}

export async function getCategoryCountsFromCache(): Promise<Record<string, number> | null> {
  try {
    const categories = ['Tech', 'Sports', 'Gaming', 'Music', 'Science', 'Culture'];
    const values = await redis.mget(categories.map((c) => `hotfeed:categories:${c}`));
    if (values.some((v) => v === null)) return null;
    const result: Record<string, number> = {};
    categories.forEach((cat, i) => { result[cat] = Number(values[i]); });
    return result;
  } catch (err) {
    console.error('[Cache] getCategoryCountsFromCache error:', (err as Error).message);
    return null;
  }
}
