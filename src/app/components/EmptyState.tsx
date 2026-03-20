interface EmptyStateProps {
  type: 'search' | 'category' | 'error';
  categoryName?: string;
  onRetry?: () => void;
}

export function EmptyState({ type, categoryName, onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      {/* Ripple illustration */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6"
      >
        <circle
          cx="60"
          cy="60"
          r="20"
          stroke="rgba(0, 200, 180, 0.15)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <circle
          cx="60"
          cy="60"
          r="35"
          stroke="rgba(0, 200, 180, 0.1)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.3s' }}
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="rgba(0, 200, 180, 0.08)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.6s' }}
        />
      </svg>

      {type === 'search' && (
        <>
          <h3 className="font-display text-[20px] text-[#E8F4F0] mb-2">
            Nothing trending here
          </h3>
          <p className="font-body text-[13px] text-[#7BADB0] mb-6 text-center max-w-md">
            Try a different search or browse categories
          </p>
          <button className="glass-pill px-6 py-2 text-[13px] font-body text-[#7BADB0] hover:text-[#E8F4F0] hover:border-[rgba(0,200,180,0.3)] transition-colors">
            Clear search
          </button>
        </>
      )}

      {type === 'category' && (
        <>
          <h3 className="font-display text-[20px] text-[#E8F4F0] mb-2">
            No hot topics in {categoryName} yet
          </h3>
          <p className="font-body text-[13px] text-[#7BADB0] text-center max-w-md">
            Check back soon
          </p>
        </>
      )}

      {type === 'error' && (
        <>
          <div className="glass-card px-8 py-6 text-center max-w-md">
            <h3 className="font-display text-[18px] text-[#E8F4F0] mb-2">
              Feed unavailable
            </h3>
            <p className="font-body text-[13px] text-[#7BADB0] mb-6">
              Could not connect to live feed
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-2 rounded-full font-display text-[13px] text-white transition-transform hover:scale-105"
                style={{ background: '#FF5C35' }}
              >
                Retry
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
