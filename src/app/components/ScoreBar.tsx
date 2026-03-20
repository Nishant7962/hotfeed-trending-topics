interface ScoreBarProps {
  score: number;
  maxScore?: number;
  height?: number;
  showShimmer?: boolean;
}

export function ScoreBar({ score, maxScore = 100000, height = 3, showShimmer = false }: ScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div
      className="w-full bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden relative"
      style={{ height: `${height}px` }}
    >
      <div
        className={`h-full rounded-r-full relative ${showShimmer ? 'score-shimmer' : ''}`}
        style={{
          width: `${percentage}%`,
          background: 'linear-gradient(90deg, #FF5C35 0%, #FF8C42 100%)',
        }}
      />
    </div>
  );
}
