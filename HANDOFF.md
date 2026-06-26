# Lyme Research Database — Claude Code Handoff

This document is the operating manual for building a chronic-illness research aggregation database focused on Lyme disease and related/comorbid conditions. It was scoped and planned in a prior conversation. You (Claude Code) are picking it up to execute across multiple sessions.

**Read this entire document before starting. Then read `CLAUDE.md` at the start of every session.**

---

## 1. Project Brief

### Goal
Build a research database + browsable frontend covering 9 Lyme-related topics. For each topic, aggregate medical-consensus research, non-consensus/minority research, and patient-reported experiences from forums — clearly separated, cross-linked, with emergent-pattern insights surfaced.

### The 9 Topics
1. Lyme and arthritis
2. Lyme and Morgellons
3. Lyme and Morgellons and amphetamines
4. Lyme and OCD
5. Lyme and parasitic infections
6. Lyme and parasitic infections and suicide
7. Lyme, HIV, and syphilis
8. Lyme, HIV, syphilis, and white blood cell disruption
9. Lyme as a bioweapon

### Core Principles
- **Medical journals and academic papers are the source of truth.** Forum content is contextual, not authoritative.
- **Non-consensus research is treated seriously, not dismissively.** Flag it clearly, but include it. The user explicitly wants fringe ideas investigated.
- **Forum excerpts must connect back to medical claims** wherever possible. Standalone anecdote without any literature linkage is lower priority than anecdote that corroborates or contradicts published findings.
- **Citation rigor matters** — this is shareable. Every claim needs a source. DOIs, PMIDs, full citations.
- **Build the symptom-mapping infrastructure from day one** — it's a stretch goal but the schema must support it from the start, not be retrofitted.
- **Cross-topic relationships are first-class.** This is meant to be a web of info, not 9 isolated reports.

### Out of Scope
- Medical advice, diagnosis, or treatment recommendations
- Reproducing copyrighted text from sources (paraphrase + cite)
- Generating PII or identifying forum posters (paraphrase forum content; link to thread, don't name users)

---

## 2. Repo Structure

```
lyme-research-db/
├── CLAUDE.md                    # Session orientation, read on every session start
├── HANDOFF.md                   # This document
├── README.md                    # Public-facing project description + disclaimer
├── DISCLAIMER.md                # Full disclaimer language
├── PROGRESS.md                  # Running log: what's done, what's next
├── research/
│   ├── 01-lyme-arthritis/
│   │   ├── medical-consensus.md
│   │   ├── non-consensus.md
│   │   ├── patient-reports.md
│   │   ├── insights.md
│   │   ├── sources.json        # Structured source list
│   │   └── relationships.json  # Links to other topics
│   ├── 02-lyme-morgellons/
│   ├── 03-lyme-morgellons-amphetamines/
│   ├── 04-lyme-ocd/
│   ├── 05-lyme-parasitic/
│   ├── 06-lyme-parasitic-suicide/
│   ├── 07-lyme-hiv-syphilis/
│   ├── 08-lyme-hiv-syphilis-wbc/
│   ├── 09-lyme-bioweapon/
│   └── meta-insights.md        # Cross-topic synthesis (written after all 9)
├── data/
│   ├── schema.sql              # SQLite DDL
│   ├── lyme.db                 # SQLite database
│   ├── seed/                   # JSON files used to seed the DB
│   └── export/                 # JSON exports for the frontend
├── scripts/
│   ├── seed_db.py              # Build SQLite from research/*/sources.json + relationships.json
│   ├── export_json.py          # Export DB to frontend-ready JSON
│   └── validate.py             # Check citation integrity, broken links, etc.
└── web/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   ├── pages/
    │   └── data/               # Generated JSON exports copied here
    └── README.md
```

### Naming conventions
- Topic directories: `NN-short-name/` (zero-padded number, lowercase, hyphenated)
- Source IDs: `T{topic_number}-S{sequential}` (e.g., `T1-S001`)
- Forum excerpt IDs: `T{topic_number}-F{sequential}` (e.g., `T1-F001`)
- Relationship IDs: `R{sequential}` global counter

---

## 3. Per-Topic Research Protocol

For each topic, produce four markdown files plus two JSON files. Work in this order:

### Step 1: Medical Consensus (`medical-consensus.md`)
Search PubMed, Google Scholar, Cochrane, UpToDate-citable sources, CDC, IDSA guidelines, major journals (NEJM, Lancet, Clinical Infectious Diseases, Frontiers in Medicine, Journal of Clinical Microbiology, etc.).

**Aim for 15-30 peer-reviewed sources per topic** for exhaustive depth. Capture:
- Established mechanisms
- Diagnostic criteria
- Treatment consensus
- Epidemiology
- Known controversies *within* mainstream

Structure:
```markdown
# Topic N: [Title] — Medical Consensus

## Overview
[2-3 paragraph summary]

## Established Mechanisms
[Subsections per mechanism, each with inline citations [T1-S001]]

## Diagnostic Approach
...

## Treatment Consensus
...

## Open Questions Within Mainstream
...

## Key Sources
[Bibliography with full citations + DOI/PMID]
```

### Step 2: Non-Consensus / Minority Research (`non-consensus.md`)
Hunt for:
- ILADS positions and ILADS-affiliated researchers (Stricker, Horowitz, Cameron)
- Bransfield (neuropsychiatric Lyme, suicide)
- MacDonald (biofilms, Alzheimer's-Lyme connection)
- Middelveen & Stricker (Morgellons-Borrelia connection)
- Eva Sapi (biofilms, persisters)
- Ying Zhang (persister cells)
- Monica Embers (primate persistence studies)
- Burgdorfer's late-career statements
- Historical bioweapon research (Plum Island, Operation Paperclip context for tick-borne research, Willy Burgdorfer's military work)
- Foreign/international researchers whose work is underrepresented in US discourse

Use the same structure as medical-consensus.md but with an additional field per claim:

**Consensus status flag** for every claim:
- `mainstream` — accepted in current guidelines
- `minority-research` — peer-reviewed but not mainstream consensus
- `fringe` — published but widely contested or in non-mainstream journals
- `historical` — older research, possibly superseded
- `speculative` — hypothesis-level, not yet tested

Be honest about epistemic status. Don't launder fringe as mainstream; don't dismiss minority research as fringe.

### Step 3: Patient Reports (`patient-reports.md`)
Search forums (list in §7). For each forum, capture **patterns** not individual posts. Look for:
- Symptom clusters reported repeatedly across users
- Treatment responses (positive and negative)
- Diagnostic odysseys
- Where patient reports align with non-consensus research
- Where patient reports describe something not yet in literature

**Rules for forum content:**
- Paraphrase, never quote substantial text
- Link to thread/post, not username
- Note approximate date and platform
- Note how many independent posters describe the same pattern (rough count is fine: "3-5 posters", "dozens")
- Flag if a pattern contradicts or confirms a specific source from sections 1 or 2 — cite the source ID

Structure:
```markdown
# Topic N: [Title] — Patient Reports

## Methodology
[Forums searched, date range, search terms]

## Recurring Symptom Patterns
### Pattern: [Name]
- Description: [paraphrased]
- Platforms: [r/Lyme, LymeNet, ...]
- Approximate frequency: [common / occasional / rare]
- Relationship to literature: [confirms T1-S005, contradicts T1-S012, no literature yet]
- Source IDs: [T1-F001, T1-F002, ...]
```

### Step 4: Insights (`insights.md`)
This is the emergent-patterns layer. Write what you actually noticed by holding all three prior sections in mind at once.

Look for:
- **Mechanistic overlaps** between consensus and non-consensus accounts
- **Symptom clusters** that don't map cleanly to current diagnostic categories
- **Where patient reports lead literature** (patients describing something before researchers studied it)
- **Where literature contradicts itself**
- **Treatment paradoxes**
- **Connections to other topics** in this project (these also go in `relationships.json`)
- **Plausible-but-untested hypotheses** that would emerge if someone synthesized the three sections

Structure:
```markdown
# Topic N: [Title] — Insights

## Emergent Patterns
### Pattern: [Name]
[What you noticed, what supports it, what it suggests]

## Cross-Topic Connections
[Brief — full version is in relationships.json]

## Hypotheses Worth Investigating
[Speculative but grounded]

## Contradictions and Tensions
[Where sources don't agree]
```

### Step 5: `sources.json`
Machine-readable source list. Schema:
```json
{
  "topic_id": 1,
  "sources": [
    {
      "source_id": "T1-S001",
      "type": "peer_reviewed | guideline | book | preprint | forum_meta | historical_document",
      "consensus_status": "mainstream | minority-research | fringe | historical | speculative",
      "title": "...",
      "authors": ["..."],
      "year": 2023,
      "journal_or_publisher": "...",
      "doi": "...",
      "pmid": "...",
      "url": "...",
      "key_findings": "1-3 sentence paraphrase",
      "relevance_notes": "Why it matters for this topic"
    }
  ],
  "forum_excerpts": [
    {
      "excerpt_id": "T1-F001",
      "platform": "r/Lyme | LymeNet | ...",
      "thread_url": "...",
      "approximate_date": "2024-03",
      "paraphrased_content": "...",
      "pattern_tag": "knee-swelling-late-stage",
      "corroborates_sources": ["T1-S005"],
      "contradicts_sources": []
    }
  ]
}
```

### Step 6: `relationships.json`
```json
{
  "topic_id": 1,
  "relationships": [
    {
      "relationship_id": "R001",
      "to_topic_id": 4,
      "type": "shared-mechanism | symptom-overlap | comorbidity | differential-diagnosis | contrasting",
      "description": "Inflammatory mechanisms in Lyme arthritis overlap with neuroinflammation pathways implicated in Lyme-OCD",
      "evidence_sources": ["T1-S008", "T4-S003"],
      "strength": "strong | moderate | weak | speculative"
    }
  ]
}
```

---

## 4. Database Schema

```sql
-- data/schema.sql

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
```

### Seeding flow
1. `scripts/seed_db.py` reads every `research/*/sources.json` and `research/*/relationships.json`
2. Inserts topics, sources, forum excerpts, symptoms (extracted from sources + excerpts), mappings, relationships
3. Validates referential integrity
4. `scripts/export_json.py` produces `data/export/{topics,sources,excerpts,symptoms,relationships,insights}.json` for the frontend

---

## 5. Frontend Spec

**Stack:** Vite + React + Tailwind + d3-force (for the graph) + Fuse.js (fuzzy symptom search).

**Pages:**

### `/` — Home
- Project description
- Disclaimer banner (persistent)
- Topic grid (9 cards)
- Global symptom search bar
- Link to cross-topic graph

### `/topic/:slug` — Topic page
- Title + summary
- Tab interface:
  - **Medical Consensus** — rendered markdown with citation popovers
  - **Non-Consensus** — same, with consensus-status badges on each source
  - **Patient Reports** — pattern cards with platform tags, "corroborates/contradicts" badges linking to sources
  - **Insights** — emergent patterns, hypotheses, contradictions
- Right sidebar: related topics (from relationships table), with strength indicators

### `/symptom-search`
- Search input → fuzzy match against symptoms table
- Result: which topics include the symptom, frequency, mechanism explanation, linked sources
- Click through to source detail

### `/graph` — Cross-topic graph
- Force-directed graph of all 9 topics
- Edge thickness = relationship strength
- Edge color = relationship type
- Click node → topic page
- Hover edge → description

### `/source/:id` — Source detail
- Full citation
- Consensus-status badge
- Key findings
- Topics it appears in
- Forum excerpts that reference it
- Insights drawing on it

### Disclaimer banner (every page)
Text in §9.

### Visual design notes
- Consensus-status color coding (consistent across UI):
  - `mainstream` — neutral gray/blue
  - `minority-research` — amber
  - `fringe` — orange with clear "non-consensus" label
  - `historical` — muted purple
  - `speculative` — light gray with dashed border
- Don't visually hierarchy fringe *below* mainstream — present them as differently-categorized, not differently-trustworthy. The badge does the epistemic work.

---

## 6. Session Plan

Suggested chunking. Adjust as needed; update `PROGRESS.md` at the end of every session.

| Session | Work |
|---------|------|
| 1 | Scaffold repo, CLAUDE.md, README, DISCLAIMER, schema.sql, empty research dirs, PROGRESS.md, initial commit. Research Topic 1 (Lyme + arthritis) end-to-end. Commit. |
| 2 | Topic 2 (Lyme + Morgellons). Topic 3 (Lyme + Morgellons + amphetamines). |
| 3 | Topic 4 (Lyme + OCD). Topic 5 (Lyme + parasitic). |
| 4 | Topic 6 (Lyme + parasitic + suicide). Topic 7 (Lyme + HIV + syphilis). |
| 5 | Topic 8 (Lyme + HIV + syphilis + WBC). Topic 9 (Lyme as bioweapon). |
| 6 | Write `meta-insights.md`. Build `scripts/seed_db.py`, `scripts/export_json.py`, `scripts/validate.py`. Seed DB. |
| 7 | Frontend scaffolding (Vite + React + Tailwind). Home page. Topic page. |
| 8 | Symptom search. Graph view. Source detail page. Polish. |
| 9 | Validation pass. Citation audit. README polish. Deployment prep. |

Heavier topics (Morgellons, bioweapon) may warrant their own sessions. Use judgment.

### At the end of every session
1. Update `PROGRESS.md` with what was completed, what's blocked, what's next
2. Commit with a clear message
3. If research is incomplete for a topic, leave a `TODO.md` in that topic's directory listing what's missing

### At the start of every session
1. Read `CLAUDE.md`
2. Read `PROGRESS.md`
3. Skim any `TODO.md` files in research directories
4. Confirm with the user what to tackle this session

---

## 7. Forum Source List

### Primary (English, US/UK)
- **r/Lyme** — reddit.com/r/Lyme
- **r/lymedisease** — reddit.com/r/lymedisease
- **r/MorgellonsDisease** — reddit.com/r/MorgellonsDisease
- **LymeNet Flash** — lymenet.org/flash (older, very dense archive, often overlooked)
- **LymeDisease.org community** — lymedisease.org
- **Phoenix Rising** — forums.phoenixrising.me (ME/CFS overlap, valuable for symptom comparison)
- **Inspire Lyme community** — inspire.com
- **MDJunction Lyme** — mdjunction.com (legacy, still searchable)
- **HealingWell Lyme forum** — healingwell.com/community/default.aspx?f=30
- **ProHealth Lyme forums** — prohealth.com/forums
- **Charles E. Holman Morgellons Disease Foundation forum** — thecehf.org
- **r/cfs, r/MEcfs, r/longcovid** — for overlap mechanisms
- **r/OCD** — for Topic 4 cross-reference

### Foreign / international
- **Onlyme-Aktion (German)** — onlyme-aktion.org
- **Borreliose Selbsthilfe (German)** — borreliose-selbsthilfe.de
- **France Lyme (French)** — francelyme.fr
- **Lyme Vereniging (Dutch)** — lymevereniging.nl
- **Asociación de Lyme Crónico (Spanish)** — Spain/Latin America Lyme communities
- **Lyme.org.au (Australian)** — lymedisease.org.au
- **Canadian Lyme Disease Foundation forum** — canlyme.com

### Niche / topical
- **Morgellons Research Group** — historical posts and case reports
- **PsychonautWiki forums** — for Topic 3 (Morgellons + amphetamines crossover; harm-reduction context)
- **r/StopSpeeding, r/AdderallAddiction** — Topic 3 context
- **Bluelight.org** — amphetamine context, occasionally Morgellons-like skin symptom reports
- **Topix Lyme archives** (Wayback Machine where needed)
- **HIV/STD forums** for Topics 7-8: r/HIVAIDS, TheBody.com, POZ Community Forums
- **Bioweapon / declassified-history communities** for Topic 9: cautiously — primary sources (declassified documents, FOIA archives) are preferable to forum speculation, but forum posts often surface obscure primary sources worth verifying

### Forum search methodology
- Use search engines with `site:` operators (`site:reddit.com/r/Lyme "arthritis flare"`)
- Use Wayback Machine for defunct forums (LymeNet old threads especially)
- For non-English forums: search in the native language, then translate findings; cite original-language URL
- Always note approximate posting date — patient knowledge evolves

---

## 8. Quality Bar

### Citations
- Every medical/non-consensus claim has a source ID inline
- Every source has: title, authors, year, journal/publisher, DOI or PMID where available, URL
- Sources without DOI/PMID (books, declassified documents, conference talks) need stable URLs or archive links
- Forum excerpts have: platform, thread URL, approximate date

### Paraphrase rules
- Never reproduce substantial text from copyrighted sources
- Forum content: always paraphrased, never quoted at length, never attributed to a named user
- Direct quotes from peer-reviewed sources: under 15 words, sparingly, only when exact wording matters (e.g., a specific clinical definition)

### Consensus flagging
- Be honest. Don't upgrade fringe to minority-research to make it look better. Don't downgrade minority-research to fringe to dismiss it.
- If a researcher's work is peer-reviewed but in a low-impact or partisan journal, note that
- If a claim was once mainstream and is now superseded, flag as `historical`
- If a claim is hypothesis-only without published testing, flag as `speculative`

### Cross-topic relationships
- Don't invent relationships. Every relationship in `relationships.json` must be backed by at least one source.
- Strength = how well-supported the relationship is, not how interesting it is.

### Insights
- Must be grounded in the topic's sources. Mark hypotheses as hypotheses.
- It's okay (and valuable) to note "no source has connected X and Y, but the mechanisms suggest..." — just label it clearly.

### Handling sensitive topics
- **Topic 6 (Lyme + parasitic + suicide):** Bransfield's epidemiology is real and important. Treat it as the public-health research question it is. Avoid clinical-style detail about methods of self-harm. The disclaimer covers crisis resources.
- **Topic 9 (bioweapon):** Plum Island, Willy Burgdorfer's DoD work, Operation Paperclip-era tick research — all have primary-source history worth surfacing. Distinguish documented history from speculation. Don't dismiss; don't sensationalize.
- **Topic 3 (amphetamines):** Includes stimulant-induced formication, which is medically documented and overlaps phenomenologically with Morgellons. Harm-reduction framing where relevant.

---

## 9. Disclaimer Text

Put this verbatim in `DISCLAIMER.md`, in the README, and as a persistent banner on every frontend page.

```
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
```

---

## 10. CLAUDE.md (place this in repo root)

```markdown
# Project Orientation — Read at Start of Every Session

You are working on a Lyme disease research aggregation database.
The full operating manual is in `HANDOFF.md`. Read it if unfamiliar.

## Before starting work this session:
1. Read `PROGRESS.md` to see where things stand
2. Skim `research/*/TODO.md` files if any exist
3. Ask the user what to tackle this session — don't assume

## Core rules:
- Medical journals are source of truth. Forums are context.
- Non-consensus research is included with clear flags, not dismissed.
- Every claim cites a source. Use the source ID system from HANDOFF.md §3.
- Paraphrase forum content. Never name users.
- Update PROGRESS.md and commit at end of session.

## Working directory layout: see HANDOFF.md §2.
## Database schema: data/schema.sql (see HANDOFF.md §4).
## Forum list: HANDOFF.md §7.
## Quality bar: HANDOFF.md §8.
## Disclaimer (mandatory on all outputs): DISCLAIMER.md.

## Session-end checklist:
- [ ] Update PROGRESS.md
- [ ] Commit with clear message
- [ ] Note any blockers or open questions for next session
- [ ] If topic research incomplete, leave a TODO.md in that topic dir
```

---

## 11. First Session Kickoff Prompt (for the user to give Claude Code)

When you start the first Claude Code session, paste this:

> I'm starting a project from a handoff document. Please read `HANDOFF.md` in full, then read `CLAUDE.md` if it exists (it won't yet — you'll create it this session). After reading, scaffold the repo per §2, create CLAUDE.md, README.md, DISCLAIMER.md, PROGRESS.md, and `data/schema.sql`. Initialize git. Then begin Topic 1 (Lyme + arthritis) research following §3. Aim for the exhaustive depth specified. Commit at the end. Update PROGRESS.md with what's done and what's next.

For subsequent sessions:

> Read CLAUDE.md and PROGRESS.md, then ask me which topic(s) to work on this session.

---

## 12. Notes from Planning Conversation

- User wants exhaustive depth, chunked across sessions.
- Non-consensus research is explicitly important — user wants fringe ideas treated as something to investigate, not dismiss.
- Stretch goal (symptom → medical-explanation lookup) is wanted; schema supports it from day one.
- Cross-topic web of relationships is core, not optional. Every topic logs relationships as part of its research output.
- Shareable, so citation rigor matters.
- User won't review research between sessions — quality bar must be self-enforced.
- Force-directed graph for cross-topic visualization is approved.
- Foreign and niche forums are welcome.

End of handoff document.
