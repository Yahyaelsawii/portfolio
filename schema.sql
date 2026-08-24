CREATE TABLE IF NOT EXISTS ai_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  session_hash TEXT,
  visitor_hash TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  flag TEXT NOT NULL DEFAULT 'none' CHECK (flag IN ('none', 'salary', 'privacy')),
  model TEXT NOT NULL,
  response_ms INTEGER NOT NULL,
  knowledge_version TEXT NOT NULL,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session_recent ON ai_logs(session_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_visitor_recent ON ai_logs(visitor_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_flag ON ai_logs(flag, created_at DESC);

CREATE TABLE IF NOT EXISTS site_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  event_key TEXT NOT NULL UNIQUE,
  session_hash TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  page_path TEXT NOT NULL,
  referrer_host TEXT NOT NULL DEFAULT 'Direct',
  device_type TEXT NOT NULL,
  browser_family TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_events_created_at ON site_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_events_session_recent ON site_events(session_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_events_page_recent ON site_events(page_path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_events_country_recent ON site_events(country, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_rate_limits (
  identity_hash TEXT NOT NULL,
  window_start TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (identity_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_window ON ai_rate_limits(window_start);

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  identity_hash TEXT NOT NULL,
  window_start TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (identity_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_window ON contact_rate_limits(window_start);

CREATE TABLE IF NOT EXISTS knowledge_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  proposed_fact TEXT NOT NULL,
  evidence_excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_knowledge_candidates_status ON knowledge_candidates(status, created_at DESC);
