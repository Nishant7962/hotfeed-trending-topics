import { Post } from '../data/mockPosts';

interface ScoreTooltipProps {
  post: Post;
}

export function ScoreTooltip({ post }: ScoreTooltipProps) {
  return (
    <div className="glass-card px-4 py-3 min-w-[320px]">
      <div className="font-mono text-[11px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[#7BADB0]">❤ Likes × 3</span>
          <span className="text-[#E8F4F0]">
            {post.likes.toLocaleString()} × 3 = {(post.likes * 3).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#7BADB0]">👁 Views × 1</span>
          <span className="text-[#E8F4F0]">
            {post.views.toLocaleString()} × 1 = {post.views.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#7BADB0]">⏱ Recency</span>
          <span className="text-[#E8F4F0]">{post.recencyDecay.toLocaleString()}</span>
        </div>
        <div className="border-t border-[rgba(0,200,180,0.15)] my-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[#7BADB0]">Total Score</span>
            <span className="text-[#E8F4F0] font-semibold">
              {post.score.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
