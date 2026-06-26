-- data/schema.sql
-- SQLite DDL for the Lyme research aggregation database.
-- See HANDOFF.md §4.

PRAGMA foreign_keys = ON;

CREATE TABLE topics (
  topic_id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sources (
  source_id TEXT PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(topic_id),
  type TEXT NOT NULL,
  consensus_status TEXT NOT NULL CHECK(consensus_status IN
    ('mainstream','minority-research','fringe','historical','speculative')),
  title TEXT NOT NULL,
  authors TEXT,           -- JSON array
  year INTEGER,
  journal_or_publisher TEXT,
  doi TEXT,
  pmid TEXT,
  url TEXT,
  key_findings TEXT,
  relevance_notes TEXT
);

CREATE TABLE forum_excerpts (
  excerpt_id TEXT PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(topic_id),
  platform TEXT NOT NULL,
  thread_url TEXT,
  approximate_date TEXT,
  paraphrased_content TEXT NOT NULL,
  pattern_tag TEXT
);

CREATE TABLE excerpt_source_links (
  excerpt_id TEXT NOT NULL REFERENCES forum_excerpts(excerpt_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  link_type TEXT NOT NULL CHECK(link_type IN ('corroborates','contradicts','related')),
  PRIMARY KEY (excerpt_id, source_id, link_type)
);

CREATE TABLE symptoms (
  symptom_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  body_system TEXT,       -- musculoskeletal, neurological, dermatological, etc.
  description TEXT
);

CREATE TABLE symptom_topic_map (
  symptom_id INTEGER REFERENCES symptoms(symptom_id),
  topic_id INTEGER REFERENCES topics(topic_id),
  frequency TEXT CHECK(frequency IN ('hallmark','common','occasional','rare')),
  mechanism_explanation TEXT,
  PRIMARY KEY (symptom_id, topic_id)
);

CREATE TABLE symptom_source_map (
  symptom_id INTEGER REFERENCES symptoms(symptom_id),
  source_id TEXT REFERENCES sources(source_id),
  PRIMARY KEY (symptom_id, source_id)
);

CREATE TABLE relationships (
  relationship_id TEXT PRIMARY KEY,
  from_topic_id INTEGER NOT NULL REFERENCES topics(topic_id),
  to_topic_id INTEGER NOT NULL REFERENCES topics(topic_id),
  type TEXT NOT NULL,
  description TEXT,
  strength TEXT CHECK(strength IN ('strong','moderate','weak','speculative'))
);

CREATE TABLE relationship_evidence (
  relationship_id TEXT REFERENCES relationships(relationship_id),
  source_id TEXT REFERENCES sources(source_id),
  PRIMARY KEY (relationship_id, source_id)
);

CREATE TABLE insights (
  insight_id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER REFERENCES topics(topic_id),  -- NULL for meta-insights
  category TEXT,   -- emergent-pattern, hypothesis, contradiction, cross-topic
  title TEXT NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE insight_source_links (
  insight_id INTEGER REFERENCES insights(insight_id),
  source_id TEXT REFERENCES sources(source_id),
  PRIMARY KEY (insight_id, source_id)
);

-- Indexes
CREATE INDEX idx_sources_topic ON sources(topic_id);
CREATE INDEX idx_sources_consensus ON sources(consensus_status);
CREATE INDEX idx_excerpts_topic ON forum_excerpts(topic_id);
CREATE INDEX idx_excerpts_pattern ON forum_excerpts(pattern_tag);
CREATE INDEX idx_symptoms_name ON symptoms(name);
CREATE INDEX idx_relationships_from ON relationships(from_topic_id);
CREATE INDEX idx_relationships_to ON relationships(to_topic_id);
