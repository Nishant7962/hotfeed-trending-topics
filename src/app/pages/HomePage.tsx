import { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { PostCard } from '../components/PostCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { InfiniteScrollTrigger } from '../components/InfiniteScrollTrigger';
import { useHotTopics } from '../../hooks/useHotTopics';

export function HomePage() {
  const { posts, isLoading, hasNextPage, loadMore } = useHotTopics();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-16">
          {/* Hero Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mb-8">
            <SkeletonCard variant="hero" />
            <div className="hidden lg:flex flex-col gap-4">
              <SkeletonCard variant="medium" className="h-[148px]" />
              <SkeletonCard variant="medium" className="h-[148px]" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="mb-6">
            <h2 className="font-display text-[11px] tracking-[4px] text-[#7BADB0] uppercase mb-4">
              TRENDING NOW
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const featuredPost = posts[0];
  const secondPost  = posts[1];
  const thirdPost   = posts[2];
  const trendingPosts = posts.slice(3);

  if (!featuredPost) return null;

  return (
    <div className="min-h-screen relative">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #0A2233 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #071A25 0%, transparent 70%)' }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,180,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,180,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-16">
          {/* Hero Section */}
          <section className="mb-12">
            {/* Desktop: Side by side */}
            <div className="hidden lg:grid grid-cols-[1.5fr_1fr] gap-4">
              <PostCard post={featuredPost} variant="hero" />
              <div className="flex flex-col gap-4">
                {secondPost && <PostCard post={secondPost} variant="medium" className="h-[148px]" />}
                {thirdPost  && <PostCard post={thirdPost}  variant="medium" className="h-[148px]" />}
              </div>
            </div>

            {/* Tablet: Stacked */}
            <div className="hidden md:block lg:hidden">
              <PostCard post={featuredPost} variant="hero" className="h-[240px] mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {secondPost && <PostCard post={secondPost} variant="medium" className="h-[180px]" />}
                {thirdPost  && <PostCard post={thirdPost}  variant="medium" className="h-[180px]" />}
              </div>
            </div>

            {/* Mobile: Only featured */}
            <div className="block md:hidden">
              <PostCard post={featuredPost} variant="hero" className="h-[280px]" />
            </div>
          </section>

          {/* Trending Grid */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-display text-[11px] tracking-[4px] text-[#7BADB0] uppercase whitespace-nowrap">
                TRENDING NOW
              </h2>
              <div className="flex-1 h-[1px] bg-[rgba(0,200,180,0.15)]" />
            </div>

            {/* Desktop: 4-column masonry-like */}
            <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
              {trendingPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  variant="medium"
                  className={index % 2 === 0 ? 'h-[160px]' : 'h-[200px]'}
                />
              ))}
            </div>

            {/* Tablet: 2-column uniform */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 mb-8">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} variant="medium" className="h-[180px]" />
              ))}
            </div>

            {/* Mobile: 1-column compact */}
            <div className="grid md:hidden grid-cols-1 gap-3 mb-8">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} variant="compact" />
              ))}
            </div>

            <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
          </section>
        </main>
      </div>
    </div>
  );
}
