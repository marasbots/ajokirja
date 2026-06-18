CREATE TABLE IF NOT EXISTS entries (
  id        TEXT PRIMARY KEY,
  data      TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  deleted   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS places (
  id        TEXT PRIMARY KEY,
  data      TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  deleted   INTEGER DEFAULT 0
);
