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
    fromCache?: boolean;
    cacheAge?: number;
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
