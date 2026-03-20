import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { Navbar } from '../components/Navbar';
import { PostCard } from '../components/PostCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { InfiniteScrollTrigger } from '../components/InfiniteScrollTrigger';
import { apiFetch } from '../../hooks/useApi';
import { Post } from '../../hooks/useHotTopics';
import type { Category } from '../data/mockPosts';

interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const categoryName = category
    ? (category.charAt(0).toUpperCase() + category.slice(1)) as Category
    : 'Tech';

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (reset) setIsLoading(true);
      const data = await apiFetch<{ data: Post[]; meta: PaginatedMeta }>(
        `/api/posts?category=${categoryName}&page=${pageNum}&limit=20`
      );
      if (reset) {
        setPosts(data.data);
      } else {
        setPosts((prev) => [...prev, ...data.data]);
      }
      setHasNextPage(data.meta.hasNextPage);
    } catch (err) {
      console.error('[CategoryPage] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [categoryName, fetchPosts]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  }, [page, fetchPosts]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar activeCategory={categoryName} />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-16">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="w-32 h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer mb-4" />
            <div className="w-48 h-12 bg-[rgba(0,200,180,0.1)] rounded shimmer mb-2" />
            <div className="w-40 h-4 bg-[rgba(0,200,180,0.1)] rounded shimmer" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

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
        <Navbar activeCategory={categoryName} />

        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-16">
          {/* Category Header */}
          <section className="mb-12">
            <div className="font-body text-[12px] text-[#7BADB0] mb-4">
              Hot Topics / {categoryName}
            </div>
            <h1 className="font-display text-[36px] md:text-[48px] text-[#E8F4F0] mb-2">
              {categoryName}
            </h1>
            <p className="font-body text-[14px] text-[#7BADB0] mb-4">
              {posts.length} posts trending
            </p>
            <div className="w-[60px] h-[2px] bg-[#00C8B4]" />
          </section>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <>
              {/* Desktop/Tablet: 3-column uniform */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="medium" />
                ))}
              </div>

              {/* Mobile: 1-column compact */}
              <div className="grid md:hidden grid-cols-1 gap-3 mb-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="compact" />
                ))}
              </div>

              <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
            </>
          ) : (
            <EmptyState type="category" categoryName={categoryName} />
          )}
        </main>
      </div>
    </div>
  );
}
