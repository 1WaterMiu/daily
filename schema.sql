CREATE TABLE IF NOT EXISTS user_data (
  email      TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
