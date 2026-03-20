import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from './useApi';

export interface Post {
  id: string;
  rank: number;
  title: string;
  category: string;
  score: number;
  likes: number;
  views: number;
  shares: number;
  recencyDecay: number;
  isNew?: boolean;
  trending?: 'hot' | 'warm' | 'cold';
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  fromCache?: boolean;
  cacheAge?: number;
}

interface UseHotTopicsReturn {
  posts: Post[];
  isLoading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  cacheSecondsRemaining: number;
}

const SOCKET_URL = 'http://localhost:4000';

export function useHotTopics(): UseHotTopicsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cacheSecondsRemaining, setCacheSecondsRemaining] = useState(30);
  const socketRef = useRef<Socket | null>(null);
  const initialLoadedRef = useRef(false);

  // Initial REST fetch (page 1)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch<{ data: Post[]; meta: PaginatedMeta }>('/api/posts?page=1&limit=20');
        setPosts(data.data);
        setHasNextPage(data.meta.hasNextPage);
        initialLoadedRef.current = true;
      } catch (err) {
        console.error('[useHotTopics] Initial fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Socket.io subscription
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('trending:snapshot', (snapshotPosts: Post[]) => {
      if (!initialLoadedRef.current) {
        setPosts(snapshotPosts);
        setIsLoading(false);
        initialLoadedRef.current = true;
      }
    });

    socket.on('trending:update', (event: { posts: Post[] }) => {
      // Merge live-updated top-20 with any existing posts beyond page 1
      setPosts((prev) => {
        if (prev.length <= 20) return event.posts;
        // Keep pages beyond 20 intact, replace top-20
        return [...event.posts, ...prev.slice(20)];
      });
    });

    socket.on('trending:cacheAge', ({ secondsRemaining }: { secondsRemaining: number }) => {
      setCacheSecondsRemaining(secondsRemaining);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!hasNextPage) return;
    const nextPage = page + 1;
    try {
      const data = await apiFetch<{ data: Post[]; meta: PaginatedMeta }>(
        `/api/posts?page=${nextPage}&limit=20`
      );
      setPosts((prev) => [...prev, ...data.data]);
      setHasNextPage(data.meta.hasNextPage);
      setPage(nextPage);
    } catch (err) {
      console.error('[useHotTopics] loadMore error:', err);
    }
  }, [hasNextPage, page]);

  return { posts, isLoading, hasNextPage, loadMore, cacheSecondsRemaining };
}
