# Graph-enrichment ideas (design note — not yet implemented)

Captured while doing the curated symptom expansion. The goal: make the
force-directed graph (`/graph`) and the data model richer and more *filterable*
later, without over-building now. Nothing here is wired up yet; this is a
backlog/design doc so the thinking isn't lost.

Guiding principle (same as the rest of the project): any tag we add must be
**controlled vocabulary + sourced**, never free-form guesses. A tag that can't be
filtered or justified is noise.

---

## 1. Tag relationships and sources with a **mechanism** vocabulary (highest value)

Today the graph colors edges by `relationship.type` (shared-mechanism,
comorbidity, etc.) — but "shared-mechanism" is doing too much work; it doesn't say
*which* mechanism. Add a controlled `mechanism` tag to relationships (and ideally
sources), e.g.:

`autoimmunity` · `molecular-mimicry` · `spirochetal-persistence` ·
`antigen-persistence` · `neuroinflammation` · `kynurenine-quinolinic-acid` ·
`immune-suppression` · `dopaminergic-tactile-hallucinosis` ·
`delusional-infestation` · `serologic-cross-reactivity` · `vertical-transmission`
· `ecological` · `historical-archival`

Payoff: a **mechanism overlay** — "show me every edge that is about autoimmunity,"
or "highlight the persistence-vs-postinfectious axis across all topics." This is
the single richest enhancement and maps directly onto how the insights already
talk about the topics. Schema change: add `mechanism TEXT` (or a join table for
multi-tag) to `relationships`; optionally a `source_mechanisms` join table.

## 2. Node-level attributes (size, cluster, epistemic weight)

Give each topic node computed/declared attributes so the layout encodes meaning:
- **size** = source count (already derivable: `sources` per topic).
- **consensus weight** = ratio of mainstream : minority : fringe sources →
  node color or a small badge. (Derivable now from `sources.consensus_status`.)
- **thematic cluster** = a declared `cluster` tag on topics, e.g.
  `dermatologic` (2,3), `neuropsychiatric` (4,6), `infectious-mechanism` (1,5,8),
  `diagnostic-serology` (7,8), `meta/contested` (9,10,11). Enables grouped/clustered
  layouts and legend filtering.

Most of this is **computable from existing data** — no schema change needed for
size and consensus weight; only `cluster` needs a new field on topics.

## 3. Edge confidence/opacity from evidence, not just `strength`

`strength` is a human judgment. Also surface an **evidence count** (number of
`relationship_evidence` rows) and the **consensus mix** of those sources, and map
them to edge opacity or a confidence ring. Lets a viewer distinguish
"strong + mainstream-backed" from "strong-sounding but fringe-only." Fully
derivable from current tables.

## 4. Symptom-mediated (bipartite) graph layer

The expanded symptom map now connects topics through **shared symptoms**
(formication ↔ topics 2 & 3; fatigue ↔ 5,6,10; cognitive fog ↔ 4,10). Two views:
- **Implicit topic-topic edges** weighted by shared-symptom count (a second edge
  set alongside the curated relationships — useful to compare "declared" vs
  "symptom-overlap" structure).
- **Bipartite topic↔symptom graph** as an alternate `/graph?mode=symptoms` view,
  with symptoms colored by `body_system` (the controlled taxonomy added in the
  expansion is exactly the clustering key for this).

No schema change — `symptom_topic_map` already holds the edges.

## 5. Consensus / epistemic filter on the whole graph

A toggle to filter nodes/edges by consensus status: "show only mainstream-backed
links," "highlight fringe-only claims," etc. Pairs naturally with #1 and #3.
Derivable from `sources.consensus_status` + `relationship_evidence`.

## 6. Temporal dimension

Sources already carry `year`. A timeline scrubber could show how the evidence web
grew (e.g., 1977 arthritis → 1985 congenital case → 2010s persistence/autoimmunity
→ 2020s PTLDS biomarkers). Pure visualization; data is already there.

---

## Suggested sequencing if/when we build this

1. **Free wins (no schema change):** node size by source count, consensus-mix
   coloring, edge confidence from evidence count, symptom-overlap edges. (#2 partial,
   #3, #4-implicit, #5.)
2. **One schema addition, big payoff:** `mechanism` tagging on relationships +
   mechanism overlay/filter. (#1.) Add `cluster` to topics at the same time. (#2.)
3. **New views:** bipartite symptom graph, temporal scrubber. (#4-bipartite, #6.)

## Data-hygiene note for whoever implements

- Keep tag vocabularies in one place (a `data/seed/vocab.json`) and have
  `validate.py` enforce that every `mechanism`/`cluster`/`body_system` value is in
  the allowed set — same discipline already applied to `consensus_status`.
- `body_system` on symptoms is already a controlled set (see the `_note` in
  `data/seed/symptoms.json`); reuse that pattern for the new tags.
