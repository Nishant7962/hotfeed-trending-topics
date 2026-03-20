import { useState, useEffect } from 'react';
import { Post } from '../../hooks/useHotTopics';
import { TrendingBadge } from './TrendingBadge';
import { ScoreBar } from './ScoreBar';
import { CategoryChip } from './CategoryChip';
import { ScoreTooltip } from './ScoreTooltip';
import { Eye, Heart, Share2 } from 'lucide-react';
import { apiFetch } from '../../hooks/useApi';

// Module-level Set — persists for the entire browser session.
// Prevents duplicate view requests on remounts / re-renders.
const viewedPostIds = new Set<string>();

interface PostCardProps {
  post: Post;
  variant?: 'hero' | 'medium' | 'compact';
  className?: string;
}

export function PostCard({ post, variant = 'medium', className = '' }: PostCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  // Fire view event once per post per session
  useEffect(() => {
    if (viewedPostIds.has(post.id)) return; // already counted this session
    viewedPostIds.add(post.id);             // mark immediately to avoid concurrent duplicates

    apiFetch(`/api/posts/${post.id}/view`, { method: 'POST' })
      .then((result: unknown) => {
        const updated = result as Partial<Post>;
        if (updated && updated.views !== undefined) {
          setLocalPost((prev) => ({ ...prev, ...updated }));
        }
      })
      .catch(() => {
        // Silently ignore — rate limit or server unavailable
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  // Sync with prop changes (live updates from Socket.io)
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const formatNumber = (num: number) => num.toLocaleString();

  if (variant === 'hero') {
    return (
      <div
        className={`glass-card p-6 h-[320px] flex flex-col justify-between transition-all duration-300 cursor-pointer relative ${
          isHovered ? '-translate-y-1 z-20' : 'z-0'
        } ${className}`}
        onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
        onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <CategoryChip category={localPost.category} />
            <div
              className="flex items-center justify-center px-4 py-2 rounded-lg"
              style={{ background: 'rgba(255, 92, 53, 0.2)' }}
            >
              <span className="font-mono text-[48px] text-[#FF5C35] opacity-100">
                {localPost.rank.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <h2 className="font-display text-[32px] leading-tight text-[#E8F4F0] mb-4 line-clamp-2">
            {localPost.title}
          </h2>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="glass-chip flex items-center gap-1.5 px-3 py-1.5">
              <Eye className="w-4 h-4 text-[#7BADB0]" />
              <span className="font-body text-[12px] text-[#7BADB0]">{formatNumber(localPost.views)}</span>
            </div>
            <div className="glass-chip flex items-center gap-1.5 px-3 py-1.5">
              <Heart className="w-4 h-4 text-[#7BADB0]" />
              <span className="font-body text-[12px] text-[#7BADB0]">{formatNumber(localPost.likes)}</span>
            </div>
            <div className="glass-chip flex items-center gap-1.5 px-3 py-1.5">
              <Share2 className="w-4 h-4 text-[#7BADB0]" />
              <span className="font-body text-[12px] text-[#7BADB0]">{formatNumber(localPost.shares)}</span>
            </div>
            <div className="ml-auto">
              <TrendingBadge score={localPost.score} trending={localPost.trending} />
            </div>
          </div>
          <div className="relative">
            <ScoreBar score={localPost.score} height={4} showShimmer={isHovered} />
            <p className="font-mono text-[13px] text-[#7BADB0] mt-2">{formatNumber(localPost.score)} pts</p>
            {showTooltip && (
              <div className="absolute top-full left-0 mt-2 z-30">
                <ScoreTooltip post={localPost} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`glass-card p-4 h-[120px] flex flex-col justify-between transition-all duration-300 cursor-pointer relative ${
          isHovered ? '-translate-y-1 z-20' : 'z-0'
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="font-mono text-[11px] text-[#7BADB0]">#{localPost.rank.toString().padStart(2, '0')}</span>
          <TrendingBadge score={localPost.score} trending={localPost.trending} />
        </div>
        <h3 className="font-body text-[14px] text-[#E8F4F0] mb-2 line-clamp-1 flex-1">{localPost.title}</h3>
        <div className="flex items-end justify-between">
          <CategoryChip category={localPost.category} />
        </div>
        <div className="mt-2">
          <ScoreBar score={localPost.score} height={3} showShimmer={isHovered} />
        </div>
      </div>
    );
  }

  // medium variant (default)
  return (
    <div
      className={`glass-card p-5 h-[180px] flex flex-col justify-between transition-all duration-300 cursor-pointer relative ${
        isHovered ? '-translate-y-1 border-[rgba(0,200,180,0.25)] z-20' : 'z-0'
      } ${className}`}
      onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
      onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-[11px] text-[#7BADB0]">#{localPost.rank.toString().padStart(2, '0')}</span>
        <TrendingBadge score={localPost.score} trending={localPost.trending} />
      </div>
      <h3 className="font-body text-[14px] text-[#E8F4F0] mb-3 line-clamp-2 flex-1">{localPost.title}</h3>
      <div className="flex items-end justify-between mb-3">
        <CategoryChip category={localPost.category} />
      </div>
      <div className="relative">
        <ScoreBar score={localPost.score} height={3} showShimmer={isHovered} />
        {showTooltip && (
          <div className="hidden md:block absolute top-full left-0 mt-2 z-30">
            <ScoreTooltip post={localPost} />
          </div>
        )}
      </div>
    </div>
  );
}