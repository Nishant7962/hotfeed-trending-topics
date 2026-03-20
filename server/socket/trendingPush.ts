import http from 'http';
import { Server, Socket } from 'socket.io';
import { getTopPostsFromCache, getCacheAge } from '../services/cacheLayer';
import { query } from '../config/db';
import { Post, RankUpdateEvent, TrendingBand } from '../types/post.types';

let io: Server;
let cacheCountdownInterval: ReturnType<typeof setInterval> | null = null;

function mapRow(row: Record<string, unknown>): Post {
  return {
    id:           row.id as string,
    rank:         (row.rank as number) ?? 0,
    title:        row.title as string,
    category:     row.category as Post['category'],
    score:        Number(row.score),
    likes:        row.likes as number,
    views:        row.views as number,
    shares:       row.shares as number,
    recencyDecay: Number(row.recency_decay),
    isNew:        (row.is_new as boolean) ?? false,
    trending:     row.trending as TrendingBand,
    createdAt:    row.created_at as Date,
    updatedAt:    row.updated_at as Date,
  };
}

async function getCurrentTop20(): Promise<Post[]> {
  const cached = await getTopPostsFromCache();
  if (cached) return cached;
  const { rows } = await query<Record<string, unknown>>(
    'SELECT * FROM posts ORDER BY score DESC LIMIT 20'
  );
  return rows.map(mapRow);
}

export function initSocket(httpServer: http.Server): void {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.on('connection', async (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    try {
      const top20 = await getCurrentTop20();
      socket.emit('trending:snapshot', top20);
    } catch (err) {
      console.error('[Socket.io] Error sending snapshot:', (err as Error).message);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket.io] Initialized');
}

export function pushRankUpdate(event: RankUpdateEvent): void {
  if (!io) return;
  io.emit('trending:update', event);

  // Start/reset the cacheAge countdown
  if (cacheCountdownInterval) clearInterval(cacheCountdownInterval);

  let secondsRemaining = Number(process.env.CACHE_TTL_SECONDS) || 30;
  cacheCountdownInterval = setInterval(() => {
    secondsRemaining = Math.max(0, secondsRemaining - 1);
    io.emit('trending:cacheAge', { secondsRemaining });
    if (secondsRemaining <= 0 && cacheCountdownInterval) {
      clearInterval(cacheCountdownInterval);
    }
  }, 1000);
}

export function getIo(): Server {
  return io;
}
