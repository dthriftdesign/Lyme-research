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
| 10 | Chronic & late-stage Lyme | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 | How Lyme is transmitted (tick/congenital/sexual) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 | Lyme and vaccines (incl. COVID-19) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

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

- 106 sources · 48 forum excerpts · 44 cross-topic relationships
- 20 symptoms (mapped to topics + sources) · 24 insights (per-topic + cross-topic)
- All inline `[T#-S###]` citations resolve; all relationships carry ≥1 evidence source.

### Session 2 addendum — 2026-06-26
- Added **Topic 10 (Chronic & late-stage Lyme)** — the keystone controversy;
  carefully separates late disseminated Lyme / PTLDS / "chronic Lyme disease."
- Added **Topic 11 (How Lyme is transmitted)** — tick-borne consensus plus
  congenital/in-utero and sexual transmission, built around the
  congenital-syphilis analogy; handled with extra epistemic care.
- Updated seed (topics/symptoms/insights), re-seeded, validated (0/0), exported,
  rebuilt and redeployed the frontend. Live site auto-updates via Pages workflow.

### Session 3 — 2026-06-26 (Topic 12 + Tier-1 integrity remediation)
Per the approved remediation plan (Topic 12 + Tier-1 fixes):
- **Added Topic 12 (Lyme + vaccines, incl. COVID-19)** — anchored on the real
  LYMErix/OspA molecular-mimicry history (the Topic-1 axis), with careful
  misinformation handling; 11 verified sources, post-vaccination-syndrome flagged
  speculative, COVID-infection foregrounded as the larger confounder.
- **Citation hygiene:** replaced all 22 placeholder author lists with
  web-confirmed authors; corrected one real citation error (T8-S004 PMID belonged
  to a different paper); confirmed the 2025/26 sources exist; added `verified`
  stamps (33/117 sources audited so far).
- **Provenance + verified data layer:** schema adds `provenance` (forum_excerpts,
  all backfilled `synthesized-pattern`) and `verified` (sources); `validate.py`
  now enforces provenance vocab and **fails on placeholder authors**; new
  `scripts/audit_citations.py` (offline checks + live DOI/PMID resolution).
- **Frontend Tier-1:** provenance badge on excerpt cards, `verified` badge on
  source cards, new **Methodology & Limitations** page + nav, and an
  **"AI-authored, not expert-reviewed"** line in the disclaimer.
- DB now: 12 topics · 117 sources · 53 excerpts · 48 relationships · 57 symptoms ·
  26 insights. validate 0/0.
- **Deferred (Tier 2/3):** full citation audit, real forum mining, depth
  expansion of thin topics, expert review + corrections workflow. See
  `docs/graph-enrichment-ideas.md` and the plan file for the roadmap.

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
