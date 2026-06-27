#!/usr/bin/env python3
"""Validate citation integrity and referential consistency of the research data.

Checks (HANDOFF.md section 8):
  - Every source has the required citation fields and a resolvable identifier
    (DOI, PMID, or URL).
  - consensus_status and type use allowed vocabularies.
  - Source IDs and excerpt IDs are unique and follow the T{n}-S/F{seq} pattern.
  - Forum excerpts reference existing sources.
  - relationships reference existing topics and at least one existing source.
  - Inline [T#-S###]/[T#-F###] citations in markdown resolve to real IDs.

Exits non-zero if any ERROR-level problem is found. Warnings do not fail.
"""
import json
import os
import re
import glob
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(ROOT, "research")
SEED = os.path.join(ROOT, "data", "seed")

CONSENSUS = {"mainstream", "minority-research", "fringe", "historical", "speculative"}
SOURCE_TYPES = {"peer_reviewed", "guideline", "book", "preprint", "forum_meta",
                "historical_document"}
LINK_TYPES = {"corroborates", "contradicts", "related"}
STRENGTHS = {"strong", "moderate", "weak", "speculative"}
REL_TYPES = {"shared-mechanism", "symptom-overlap", "comorbidity",
             "differential-diagnosis", "contrasting"}
PROVENANCE = {"synthesized-pattern", "verified-thread"}
# An author entry that is wholly parenthetical (e.g. "(study authors)") is a
# placeholder, not a real attribution.
PLACEHOLDER_AUTHOR_RE = re.compile(r"^\(.*\)$")

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def main():
    all_sources = {}      # source_id -> record
    all_excerpts = set()
    topic_ids = set()
    verified_count = 0

    topics = json.load(open(os.path.join(SEED, "topics.json")))["topics"]
    for t in topics:
        topic_ids.add(t["topic_id"])

    # ---- sources.json files ----
    for spath in sorted(glob.glob(os.path.join(RESEARCH, "*", "sources.json"))):
        rel = os.path.relpath(spath, ROOT)
        data = json.load(open(spath))
        tid = data.get("topic_id")
        if tid not in topic_ids:
            err(f"{rel}: topic_id {tid} not in topics.json")
        for s in data.get("sources", []):
            sid = s.get("source_id", "<missing>")
            if sid in all_sources:
                err(f"{rel}: duplicate source_id {sid}")
            all_sources[sid] = s
            if not re.match(r"^T\d+-S\d{3}$", sid):
                warn(f"{rel}: source_id {sid} does not match T#-S### pattern")
            for field in ("type", "consensus_status", "title"):
                if not s.get(field):
                    err(f"{rel}: source {sid} missing required field '{field}'")
            if s.get("consensus_status") not in CONSENSUS:
                err(f"{rel}: source {sid} bad consensus_status '{s.get('consensus_status')}'")
            if s.get("type") not in SOURCE_TYPES:
                err(f"{rel}: source {sid} bad type '{s.get('type')}'")
            if not (s.get("doi") or s.get("pmid") or s.get("url")):
                err(f"{rel}: source {sid} has no DOI, PMID, or URL")
            if not s.get("key_findings"):
                warn(f"{rel}: source {sid} missing key_findings")
            for a in s.get("authors", []):
                if PLACEHOLDER_AUTHOR_RE.match(a.strip()):
                    err(f"{rel}: source {sid} has placeholder author '{a}' — needs real attribution")
            if s.get("verified"):
                verified_count += 1
        for e in data.get("forum_excerpts", []):
            eid = e.get("excerpt_id", "<missing>")
            if eid in all_excerpts:
                err(f"{rel}: duplicate excerpt_id {eid}")
            all_excerpts.add(eid)
            if not re.match(r"^T\d+-F\d{3}$", eid):
                warn(f"{rel}: excerpt_id {eid} does not match T#-F### pattern")
            if not e.get("paraphrased_content"):
                err(f"{rel}: excerpt {eid} missing paraphrased_content")
            if not e.get("platform"):
                err(f"{rel}: excerpt {eid} missing platform")
            if e.get("provenance") not in PROVENANCE:
                err(f"{rel}: excerpt {eid} bad/missing provenance '{e.get('provenance')}' "
                    f"(expected one of {sorted(PROVENANCE)})")

    # second pass: excerpt source links resolve
    for spath in sorted(glob.glob(os.path.join(RESEARCH, "*", "sources.json"))):
        rel = os.path.relpath(spath, ROOT)
        data = json.load(open(spath))
        for e in data.get("forum_excerpts", []):
            for key in ("corroborates_sources", "contradicts_sources"):
                for sid in e.get(key, []):
                    if sid not in all_sources:
                        err(f"{rel}: excerpt {e['excerpt_id']} {key} -> unknown source {sid}")

    # ---- relationships.json files ----
    rel_ids = set()
    for rpath in sorted(glob.glob(os.path.join(RESEARCH, "*", "relationships.json"))):
        rel = os.path.relpath(rpath, ROOT)
        data = json.load(open(rpath))
        if data.get("topic_id") not in topic_ids:
            err(f"{rel}: topic_id {data.get('topic_id')} not in topics.json")
        for r in data.get("relationships", []):
            rid = r.get("relationship_id", "<missing>")
            if rid in rel_ids:
                err(f"{rel}: duplicate relationship_id {rid}")
            rel_ids.add(rid)
            if r.get("to_topic_id") not in topic_ids:
                err(f"{rel}: relationship {rid} -> unknown to_topic_id {r.get('to_topic_id')}")
            if r.get("type") not in REL_TYPES:
                warn(f"{rel}: relationship {rid} unusual type '{r.get('type')}'")
            if r.get("strength") not in STRENGTHS:
                err(f"{rel}: relationship {rid} bad strength '{r.get('strength')}'")
            ev = r.get("evidence_sources", [])
            if not ev:
                err(f"{rel}: relationship {rid} has no evidence_sources (every relationship needs >=1)")
            for sid in ev:
                if sid not in all_sources:
                    warn(f"{rel}: relationship {rid} cites source {sid} not in any sources.json")

    # ---- inline citations in markdown ----
    cite_re = re.compile(r"\[(T\d+-[SF]\d{3})\]")
    for mdpath in glob.glob(os.path.join(RESEARCH, "*", "*.md")) + [
            os.path.join(RESEARCH, "meta-insights.md")]:
        if not os.path.exists(mdpath):
            continue
        rel = os.path.relpath(mdpath, ROOT)
        text = open(mdpath, encoding="utf-8").read()
        for m in set(cite_re.findall(text)):
            if m.startswith(tuple(f"T{n}-S" for n in range(1, 10))) and "-S" in m:
                if m not in all_sources:
                    warn(f"{rel}: inline citation {m} does not resolve to a source")
            elif "-F" in m:
                if m not in all_excerpts:
                    warn(f"{rel}: inline citation {m} does not resolve to an excerpt")

    # ---- seed symptoms/insights source refs ----
    for fname in ("symptoms.json", "insights.json"):
        data = json.load(open(os.path.join(SEED, fname)))
        key = "symptoms" if fname == "symptoms.json" else "insights"
        for item in data[key]:
            refs = []
            if key == "symptoms":
                for tm in item.get("topics", []):
                    refs += tm.get("sources", [])
            else:
                refs = item.get("sources", [])
            for sid in refs:
                if sid not in all_sources:
                    warn(f"{fname}: '{item.get('name', item.get('title'))}' references unknown source {sid}")

    # ---- report ----
    print(f"Sources: {len(all_sources)}  Excerpts: {len(all_excerpts)}  "
          f"Relationships: {len(rel_ids)}  Topics: {len(topic_ids)}")
    print(f"Citation audit: {verified_count}/{len(all_sources)} sources marked verified "
          f"({100 * verified_count // max(1, len(all_sources))}%).")
    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s).")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
