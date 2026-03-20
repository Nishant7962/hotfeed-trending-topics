import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export function InfiniteScrollTrigger({ hasNextPage = false, onLoadMore }: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const current = triggerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [onLoadMore, hasNextPage]);

  if (!hasNextPage) return null;

  return (
    <div ref={triggerRef} className="flex flex-col items-center justify-center py-12">
      {/* Wave SVG indicator */}
      <svg
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
      >
        <path
          d="M0 20C15 10 25 10 40 20C55 30 65 30 80 20C95 10 105 10 120 20"
          stroke="rgba(0, 200, 180, 0.15)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M0 28C15 18 25 18 40 28C55 38 65 38 80 28C95 18 105 18 120 28"
          stroke="rgba(0, 200, 180, 0.1)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.2s' }}
        />
        <path
          d="M0 12C15 2 25 2 40 12C55 22 65 22 80 12C95 2 105 2 120 12"
          stroke="rgba(0, 200, 180, 0.08)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.4s' }}
        />
      </svg>
      <p className="font-body text-[12px] text-[#7BADB0]">Loading more</p>
    </div>
  );
}
