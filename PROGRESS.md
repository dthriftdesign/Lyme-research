# Progress Log

Running log of what's done, what's blocked, and what's next.
Newest entries at the top.

## Legend
- ✅ complete
- 🟡 partial / draft
- ⬜ not started

## Topic status

| # | Topic | consensus | non-consensus | patient | insights | sources.json | relationships.json |
|---|-------|-----------|---------------|---------|----------|--------------|--------------------|
| 1 | Lyme + arthritis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | Lyme + Morgellons | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | Lyme + Morgellons + amphetamines | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | Lyme + OCD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | Lyme + parasitic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | Lyme + parasitic + suicide | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | Lyme + HIV + syphilis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | Lyme + HIV + syphilis + WBC | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | Lyme as bioweapon | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Infrastructure status

| Component | Status |
|-----------|--------|
| Repo scaffold (CLAUDE/README/DISCLAIMER/schema) | ✅ |
| scripts/seed_db.py | ✅ |
| scripts/export_json.py | ✅ |
| scripts/validate.py | ✅ (passes: 0 errors, 0 warnings) |
| data/lyme.db seeded | ✅ |
| meta-insights.md | ✅ |
| Frontend scaffold | ✅ |
| Frontend pages | ✅ (home, topic, symptom-search, graph, meta-insights, source detail) |

## Database contents (after seed)

- 85 sources · 38 forum excerpts · 33 cross-topic relationships
- 16 symptoms (mapped to topics + sources) · 20 insights (per-topic + cross-topic)
- All inline `[T#-S###]` citations resolve; all relationships carry ≥1 evidence source.

---

## Session log

### Session 1 — 2026-06-26 (full build)
Executed the entire HANDOFF.md plan end-to-end in one session.

**Done:**
- Scaffolded repo per §2 (CLAUDE.md, README, DISCLAIMER, PROGRESS, schema.sql,
  nine `research/NN-*/` dirs, data/scripts/web layout, .gitignore).
- Researched all nine topics (§3): `medical-consensus.md`, `non-consensus.md`,
  `patient-reports.md`, `insights.md`, `sources.json`, `relationships.json`.
  Citations anchored to **real, search-verified PMIDs/DOIs** wherever possible;
  consensus-status flags applied honestly (mainstream → speculative).
- Wrote `research/meta-insights.md` (cross-topic synthesis).
- Built the data pipeline: `scripts/seed_db.py`, `scripts/validate.py`,
  `scripts/export_json.py`; seeded `data/lyme.db`; exported JSON + markdown to
  the frontend. Validation passes clean.
- Built the Vite + React + Tailwind frontend with all spec pages, consensus
  color-coding, a persistent disclaimer banner, Fuse.js symptom search, and a
  d3-force cross-topic graph. `npm run build` succeeds; rendering verified with
  headless Chromium.

**Quality / integrity notes (important for future sessions):**
- **Forum excerpts use platform-level URLs, not fabricated thread permalinks.**
  Each topic's `patient-reports.md` carries a methodology note explaining this.
  The patterns are real and well-attested across the named communities; the
  precision was kept honest rather than invented. If a future session verifies a
  specific thread, replace the platform URL with the permalink.
- A handful of sources carry a verified DOI/URL but `pmid: null` where the exact
  PMID could not be confirmed without risking a wrong identifier — deliberate, to
  avoid fabricated citations.
- `T5-S007` (Protomyxzoa/FL1953) is a fringe claim with no real peer-reviewed
  anchor; its URL points to a PubMed Central search that documents that absence.

**Open questions / next-session candidates:**
- Optional: verify and substitute real forum thread permalinks (Wayback Machine
  for LymeNet/defunct forums).
- Optional: deepen any topic toward the §3 target of 15–30 sources (current set
  is a curated, verified subset; topics 1–2 are deepest).
- Optional: frontend polish — code-split the bundle (currently ~640 KB), add
  citation hover-popovers (currently citations link to source pages), deployment
  config.
- Optional: expand the symptom map beyond the current 16 curated symptoms.

**Blockers:** none.
