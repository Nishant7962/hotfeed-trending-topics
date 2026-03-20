import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import postsRouter from './routes/posts';
import categoriesRouter from './routes/categories';
import { initSocket } from './socket/trendingPush';
import { startRankingWorker } from './workers/rankingWorker';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ---- Middleware ----
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(generalLimiter);

// ---- Routes ----
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Global error handler (must be last) ----
app.use(errorHandler);

// ---- Server + Socket.io ----
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`HotFeed server running on port ${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);

  // ---- Background ranking worker ----
  startRankingWorker();
});
