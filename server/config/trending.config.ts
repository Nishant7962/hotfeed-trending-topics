// All values are overridable via environment variables.
export const TRENDING_CONFIG = {
  weights: {
    views:  Number(process.env.WEIGHT_VIEWS)  || 1,
    likes:  Number(process.env.WEIGHT_LIKES)  || 3,
    shares: Number(process.env.WEIGHT_SHARES) || 5,
  },
  bands: {
    hot:  Number(process.env.BAND_HOT_THRESHOLD)  || 80_000,
    warm: Number(process.env.BAND_WARM_THRESHOLD) || 40_000,
  },
  cache: {
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 30,
    topN:       Number(process.env.TOP_N_CACHED)      || 20,
  },
  decay: {
    // Half-life in hours — score halves every N hours
    halfLifeHours: 24,
  },
} as const;
