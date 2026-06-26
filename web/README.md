# Lyme Research DB — Frontend

Vite + React + Tailwind browsable frontend for the Lyme research aggregation
database. Renders topics, a fuzzy symptom search (Fuse.js), a force-directed
cross-topic graph (d3-force), and per-source detail pages.

## Data flow

The app reads generated JSON and copied markdown from `src/data/`, produced by
the repo-root pipeline:

```bash
# from the repository root
python3 scripts/seed_db.py      # build data/lyme.db
python3 scripts/validate.py     # citation-integrity check (must pass)
python3 scripts/export_json.py  # writes web/src/data/*.json + markdown/
```

`src/data/` is committed so the frontend builds without re-running the pipeline.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

Routing uses `HashRouter` so deep links work on static hosts (e.g. GitHub
Pages). `vite.config.js` sets `base: './'` for subpath deployment.

## Pages

- `/` — home: topic grid + global symptom search + legend
- `/topic/:slug` — tabs (Medical Consensus, Non-Consensus, Patient Reports,
  Insights, Sources) + related-topics sidebar
- `/symptom-search` — fuzzy symptom → topics/frequency/mechanism/sources
- `/graph` — force-directed cross-topic graph
- `/meta-insights` — cross-topic synthesis
- `/source/:id` — full citation, consensus badge, and everything referencing it

## Design notes

Consensus statuses are color-coded consistently (see `src/lib/consensus.js`).
Per the project spec, `fringe`/`speculative` are presented as
*differently-categorized*, not *differently-trustworthy* — the badge does the
epistemic work. A persistent disclaimer banner appears on every page.
