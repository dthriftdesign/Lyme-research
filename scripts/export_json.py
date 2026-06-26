#!/usr/bin/env python3
"""Export data/lyme.db to frontend-ready JSON in data/export/ and copy to
web/src/data/.

Produces: topics.json, sources.json, excerpts.json, symptoms.json,
relationships.json, insights.json, and a combined db.json bundle.
See HANDOFF.md section 4.
"""
import json
import os
import shutil
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "data", "lyme.db")
EXPORT = os.path.join(ROOT, "data", "export")
WEB_DATA = os.path.join(ROOT, "web", "src", "data")


def rows(cur, q, args=()):
    cur.execute(q, args)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def export():
    if not os.path.exists(DB_PATH):
        print("ERROR: data/lyme.db not found. Run scripts/seed_db.py first.",
              file=sys.stderr)
        sys.exit(1)
    os.makedirs(EXPORT, exist_ok=True)
    os.makedirs(WEB_DATA, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    topics = rows(cur, "SELECT * FROM topics ORDER BY topic_id")
    sources = rows(cur, "SELECT * FROM sources ORDER BY source_id")
    for s in sources:
        s["authors"] = json.loads(s["authors"]) if s.get("authors") else []
    excerpts = rows(cur, "SELECT * FROM forum_excerpts ORDER BY excerpt_id")
    links = rows(cur, "SELECT * FROM excerpt_source_links")
    relationships = rows(cur, "SELECT * FROM relationships ORDER BY relationship_id")
    rel_ev = rows(cur, "SELECT * FROM relationship_evidence")
    symptoms = rows(cur, "SELECT * FROM symptoms ORDER BY name")
    sym_topic = rows(cur, "SELECT * FROM symptom_topic_map")
    sym_source = rows(cur, "SELECT * FROM symptom_source_map")
    insights = rows(cur, "SELECT * FROM insights ORDER BY insight_id")
    ins_links = rows(cur, "SELECT * FROM insight_source_links")
    conn.close()

    # enrich: attach excerpt links
    link_by_excerpt = {}
    for l in links:
        link_by_excerpt.setdefault(l["excerpt_id"], []).append(
            {"source_id": l["source_id"], "link_type": l["link_type"]})
    for e in excerpts:
        e["source_links"] = link_by_excerpt.get(e["excerpt_id"], [])

    # enrich: relationship evidence
    ev_by_rel = {}
    for ev in rel_ev:
        ev_by_rel.setdefault(ev["relationship_id"], []).append(ev["source_id"])
    for r in relationships:
        r["evidence_sources"] = ev_by_rel.get(r["relationship_id"], [])

    # enrich: symptoms with topic maps + sources
    src_by_sym = {}
    for ss in sym_source:
        src_by_sym.setdefault(ss["symptom_id"], []).append(ss["source_id"])
    topics_by_sym = {}
    for tm in sym_topic:
        topics_by_sym.setdefault(tm["symptom_id"], []).append(tm)
    for sym in symptoms:
        sym["topics"] = topics_by_sym.get(sym["symptom_id"], [])
        sym["sources"] = src_by_sym.get(sym["symptom_id"], [])

    # enrich: insights with sources
    src_by_ins = {}
    for il in ins_links:
        src_by_ins.setdefault(il["insight_id"], []).append(il["source_id"])
    for ins in insights:
        ins["sources"] = src_by_ins.get(ins["insight_id"], [])

    bundles = {
        "topics.json": topics,
        "sources.json": sources,
        "excerpts.json": excerpts,
        "relationships.json": relationships,
        "symptoms.json": symptoms,
        "insights.json": insights,
    }
    combined = {k.replace(".json", ""): v for k, v in bundles.items()}

    for fname, payload in bundles.items():
        _write(os.path.join(EXPORT, fname), payload)
        _write(os.path.join(WEB_DATA, fname), payload)
    _write(os.path.join(EXPORT, "db.json"), combined)
    _write(os.path.join(WEB_DATA, "db.json"), combined)

    print("Exported to data/export/ and web/src/data/:")
    for k, v in combined.items():
        print(f"  {k:16s} {len(v)} records")


def _write(path, payload):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    export()
