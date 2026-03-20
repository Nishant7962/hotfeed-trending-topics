interface SkeletonCardProps {
  variant?: 'hero' | 'medium' | 'compact';
  className?: string;
}

export function SkeletonCard({ variant = 'medium', className = '' }: SkeletonCardProps) {
  if (variant === 'hero') {
    return (
      <div className={`glass-card p-6 h-[320px] flex flex-col justify-between ${className}`}>
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-6 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
            <div className="w-24 h-16 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
          </div>
          <div className="space-y-3">
            <div className="w-[80%] h-8 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
            <div className="w-[60%] h-8 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
          </div>
        </div>
        <div>
          <div className="flex gap-3 mb-4">
            <div className="w-20 h-8 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
            <div className="w-20 h-8 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
            <div className="w-20 h-8 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
          </div>
          <div className="w-full h-1 bg-[rgba(0,200,180,0.1)] rounded-full shimmer" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`glass-card p-4 h-[120px] flex flex-col justify-between ${className}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="w-8 h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
          <div className="w-16 h-6 bg-[rgba(0,200,180,0.1)] rounded-full shimmer" />
        </div>
        <div className="w-full h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer mb-2" />
        <div className="flex items-end justify-between">
          <div className="w-16 h-6 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
        </div>
        <div className="w-full h-[3px] bg-[rgba(0,200,180,0.1)] rounded-full shimmer mt-2" />
      </div>
    );
  }

  return (
    <div className={`glass-card p-5 h-[180px] flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
        <div className="w-16 h-6 bg-[rgba(0,200,180,0.1)] rounded-full shimmer" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="w-full h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
        <div className="w-3/4 h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
      </div>
      <div className="flex items-end justify-between mb-3">
        <div className="w-16 h-6 bg-[rgba(0,200,180,0.1)] rounded-lg shimmer" />
      </div>
      <div className="w-full h-[3px] bg-[rgba(0,200,180,0.1)] rounded-full shimmer" />
    </div>
  );
}
