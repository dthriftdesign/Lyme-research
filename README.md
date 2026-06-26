# Lyme Research Database

A research-synthesis database and browsable frontend covering nine
Lyme-disease–related topics. For each topic it aggregates **medical-consensus
research**, **non-consensus / minority research**, and **patient-reported
experiences** from forums — clearly separated, cross-linked, and surfaced with
emergent-pattern insights.

## Disclaimer

This project aggregates published research and patient-reported experiences
related to Lyme disease and associated conditions. It is a research-synthesis
resource, not a medical resource.

Nothing here is medical advice, diagnosis, or treatment recommendation.
Information presented as "non-consensus" or "fringe" research is included
because rigorous research synthesis requires engaging with minority positions,
not because those positions are endorsed.

Patient reports from forums are paraphrased for pattern-recognition purposes.
They are not validated case data and should not be interpreted as such.

If you are experiencing a medical issue, consult a licensed clinician.

If you are in mental-health crisis or considering self-harm, contact:
- US: 988 Suicide & Crisis Lifeline (call or text 988)
- UK: Samaritans 116 123
- International directory: findahelpline.com

Sources are cited so readers can verify and evaluate them independently.
The presence of a source in this database is not an endorsement of its
conclusions.

See [`DISCLAIMER.md`](DISCLAIMER.md) for the full text.

## The nine topics

1. Lyme and arthritis
2. Lyme and Morgellons
3. Lyme and Morgellons and amphetamines
4. Lyme and OCD
5. Lyme and parasitic infections
6. Lyme and parasitic infections and suicide
7. Lyme, HIV, and syphilis
8. Lyme, HIV, syphilis, and white blood cell disruption
9. Lyme as a bioweapon

## Repository layout

```
research/            One directory per topic. Each holds:
  NN-topic/
    medical-consensus.md   Peer-reviewed / guideline synthesis
    non-consensus.md       Minority + fringe + historical research, flagged
    patient-reports.md     Paraphrased forum patterns
    insights.md            Emergent-pattern synthesis
    sources.json           Machine-readable source + forum-excerpt list
    relationships.json     Cross-topic links
  meta-insights.md         Cross-topic synthesis (after all nine)
data/
  schema.sql               SQLite DDL
  lyme.db                  Generated SQLite database
  seed/                    JSON used to seed the DB
  export/                  JSON exports for the frontend
scripts/
  seed_db.py               Build SQLite from research/*/*.json
  export_json.py           Export DB to frontend-ready JSON
  validate.py              Citation-integrity + referential checks
web/                       Vite + React + Tailwind frontend
```

## How the data flows

1. Research is written as markdown + structured JSON (`sources.json`,
   `relationships.json`) per topic.
2. `scripts/seed_db.py` loads every topic's JSON into `data/lyme.db`.
3. `scripts/validate.py` checks citation integrity and referential links.
4. `scripts/export_json.py` writes `data/export/*.json` for the frontend.
5. The `web/` app renders topics, a symptom search, a cross-topic graph, and
   per-source detail pages.

## Source-ID conventions

- Sources: `T{topic}-S{seq}` (e.g. `T1-S001`)
- Forum excerpts: `T{topic}-F{seq}` (e.g. `T1-F001`)
- Relationships: `R{seq}` (global counter)

## Status

See [`PROGRESS.md`](PROGRESS.md) for the running log of what is complete.

## Quick start (frontend)

```bash
cd web
npm install
npm run dev
```

To rebuild the database and exports from the research JSON:

```bash
python3 scripts/seed_db.py
python3 scripts/validate.py
python3 scripts/export_json.py
```
