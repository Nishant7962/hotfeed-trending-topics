-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Categories lookup table
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES
  ('Tech'), ('Sports'), ('Gaming'), ('Music'), ('Science'), ('Culture')
ON CONFLICT DO NOTHING;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  category       VARCHAR(50) NOT NULL REFERENCES categories(name),
  likes          INTEGER     NOT NULL DEFAULT 0,
  views          INTEGER     NOT NULL DEFAULT 0,
  shares         INTEGER     NOT NULL DEFAULT 0,
  score          NUMERIC     NOT NULL DEFAULT 0,
  rank           INTEGER,
  recency_decay  NUMERIC     NOT NULL DEFAULT 0,
  trending       VARCHAR(10) NOT NULL DEFAULT 'cold'
                             CHECK (trending IN ('hot', 'warm', 'cold')),
  is_new         BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index on title
CREATE INDEX IF NOT EXISTS posts_title_fts
  ON posts USING gin(to_tsvector('english', title));

-- Score index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS posts_score_idx ON posts (score DESC);

-- Category filter index
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts (category);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
