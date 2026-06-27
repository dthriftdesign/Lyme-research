#!/usr/bin/env python3
"""Build data/lyme.db from research/*/sources.json + relationships.json and
data/seed/{topics,symptoms,insights}.json.

Idempotent: drops and recreates the database from schema.sql on each run.
See HANDOFF.md sections 4 and 8.
"""
import json
import os
import sqlite3
import sys
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
SEED = os.path.join(DATA, "seed")
RESEARCH = os.path.join(ROOT, "research")
DB_PATH = os.path.join(DATA, "lyme.db")
SCHEMA = os.path.join(DATA, "schema.sql")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    with open(SCHEMA, "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    cur = conn.cursor()

    # --- Topics ---
    topics = load_json(os.path.join(SEED, "topics.json"))["topics"]
    for t in topics:
        cur.execute(
            "INSERT INTO topics (topic_id, slug, title, summary) VALUES (?,?,?,?)",
            (t["topic_id"], t["slug"], t["title"], t.get("summary")),
        )

    # --- Sources + forum excerpts + excerpt-source links ---
    source_ids = set()
    excerpt_ids = set()
    for spath in sorted(glob.glob(os.path.join(RESEARCH, "*", "sources.json"))):
        data = load_json(spath)
        topic_id = data["topic_id"]
        for s in data.get("sources", []):
            cur.execute(
                """INSERT INTO sources
                   (source_id, topic_id, type, consensus_status, title, authors,
                    year, journal_or_publisher, doi, pmid, url, key_findings,
                    relevance_notes, verified)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    s["source_id"], topic_id, s["type"], s["consensus_status"],
                    s["title"], json.dumps(s.get("authors", [])), s.get("year"),
                    s.get("journal_or_publisher"), s.get("doi"), s.get("pmid"),
                    s.get("url"), s.get("key_findings"), s.get("relevance_notes"),
                    s.get("verified"),
                ),
            )
            source_ids.add(s["source_id"])
        for e in data.get("forum_excerpts", []):
            cur.execute(
                """INSERT INTO forum_excerpts
                   (excerpt_id, topic_id, platform, thread_url, approximate_date,
                    paraphrased_content, pattern_tag, provenance)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (
                    e["excerpt_id"], topic_id, e["platform"], e.get("thread_url"),
                    e.get("approximate_date"), e["paraphrased_content"],
                    e.get("pattern_tag"), e.get("provenance", "synthesized-pattern"),
                ),
            )
            excerpt_ids.add(e["excerpt_id"])

    # second pass for excerpt-source links (sources must exist first)
    for spath in sorted(glob.glob(os.path.join(RESEARCH, "*", "sources.json"))):
        data = load_json(spath)
        for e in data.get("forum_excerpts", []):
            for sid in e.get("corroborates_sources", []):
                _link_excerpt(cur, e["excerpt_id"], sid, "corroborates", source_ids)
            for sid in e.get("contradicts_sources", []):
                _link_excerpt(cur, e["excerpt_id"], sid, "contradicts", source_ids)

    # --- Relationships + evidence ---
    for rpath in sorted(glob.glob(os.path.join(RESEARCH, "*", "relationships.json"))):
        data = load_json(rpath)
        from_topic = data["topic_id"]
        for r in data.get("relationships", []):
            cur.execute(
                """INSERT INTO relationships
                   (relationship_id, from_topic_id, to_topic_id, type, description, strength)
                   VALUES (?,?,?,?,?,?)""",
                (
                    r["relationship_id"], from_topic, r["to_topic_id"], r["type"],
                    r.get("description"), r.get("strength"),
                ),
            )
            for sid in r.get("evidence_sources", []):
                if sid in source_ids:
                    cur.execute(
                        "INSERT OR IGNORE INTO relationship_evidence (relationship_id, source_id) VALUES (?,?)",
                        (r["relationship_id"], sid),
                    )
                else:
                    print(f"  warn: relationship {r['relationship_id']} cites unknown source {sid}")

    # --- Symptoms + maps ---
    symptoms = load_json(os.path.join(SEED, "symptoms.json"))["symptoms"]
    for sym in symptoms:
        cur.execute(
            "INSERT INTO symptoms (name, body_system, description) VALUES (?,?,?)",
            (sym["name"], sym.get("body_system"), sym.get("description")),
        )
        symptom_id = cur.lastrowid
        for tm in sym.get("topics", []):
            cur.execute(
                """INSERT INTO symptom_topic_map
                   (symptom_id, topic_id, frequency, mechanism_explanation)
                   VALUES (?,?,?,?)""",
                (symptom_id, tm["topic_id"], tm.get("frequency"), tm.get("mechanism_explanation")),
            )
            for sid in tm.get("sources", []):
                if sid in source_ids:
                    cur.execute(
                        "INSERT OR IGNORE INTO symptom_source_map (symptom_id, source_id) VALUES (?,?)",
                        (symptom_id, sid),
                    )

    # --- Insights + source links ---
    insights = load_json(os.path.join(SEED, "insights.json"))["insights"]
    for ins in insights:
        cur.execute(
            "INSERT INTO insights (topic_id, category, title, content) VALUES (?,?,?,?)",
            (ins.get("topic_id"), ins.get("category"), ins["title"], ins["content"]),
        )
        insight_id = cur.lastrowid
        for sid in ins.get("sources", []):
            if sid in source_ids:
                cur.execute(
                    "INSERT OR IGNORE INTO insight_source_links (insight_id, source_id) VALUES (?,?)",
                    (insight_id, sid),
                )

    conn.commit()

    counts = {
        t: cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        for t in ["topics", "sources", "forum_excerpts", "excerpt_source_links",
                  "relationships", "relationship_evidence", "symptoms",
                  "symptom_topic_map", "symptom_source_map", "insights",
                  "insight_source_links"]
    }
    conn.close()
    print("Seeded data/lyme.db:")
    for k, v in counts.items():
        print(f"  {k:24s} {v}")


def _link_excerpt(cur, excerpt_id, source_id, link_type, source_ids):
    if source_id not in source_ids:
        print(f"  warn: excerpt {excerpt_id} links unknown source {source_id}")
        return
    cur.execute(
        "INSERT OR IGNORE INTO excerpt_source_links (excerpt_id, source_id, link_type) VALUES (?,?,?)",
        (excerpt_id, source_id, link_type),
    )


if __name__ == "__main__":
    try:
        build()
    except Exception as e:  # noqa: BLE001
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
