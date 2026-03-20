import { Post } from '../data/mockPosts';

interface TrendingBadgeProps {
  score: number;
  trending: Post['trending'];
}

export function TrendingBadge({ score, trending }: TrendingBadgeProps) {
  if (trending === 'hot' && score > 80000) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-display font-semibold text-white rounded-full"
        style={{
          background: 'linear-gradient(90deg, #FF5C35 0%, #FF8C42 100%)',
        }}
      >
        🔥 HOT
      </div>
    );
  }

  if (trending === 'warm' && score > 40000) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-display font-semibold rounded-full"
        style={{
          background: 'rgba(0, 200, 180, 0.20)',
          color: '#00C8B4',
        }}
      >
        TRENDING
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-display font-semibold rounded-full"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        color: '#7BADB0',
      }}
    >
      RISING
    </div>
  );
}
