// Central data-access layer over the exported database bundle.
import db from '../data/db.json'

export const topics = db.topics
export const sources = db.sources
export const excerpts = db.excerpts
export const relationships = db.relationships
export const symptoms = db.symptoms
export const insights = db.insights

const sourceById = Object.fromEntries(sources.map((s) => [s.source_id, s]))
const topicById = Object.fromEntries(topics.map((t) => [t.topic_id, t]))
const topicBySlug = Object.fromEntries(topics.map((t) => [t.slug, t]))

export const getSource = (id) => sourceById[id]
export const getTopic = (id) => topicById[id]
export const getTopicBySlug = (slug) => topicBySlug[slug]

export const sourcesForTopic = (topicId) =>
  sources.filter((s) => s.topic_id === topicId)

export const excerptsForTopic = (topicId) =>
  excerpts.filter((e) => e.topic_id === topicId)

export const insightsForTopic = (topicId) =>
  insights.filter((i) => i.topic_id === topicId)

export const metaInsights = insights.filter((i) => i.topic_id == null)

// Relationships touching a topic (either direction), de-duplicated for display.
export const relationshipsForTopic = (topicId) =>
  relationships.filter((r) => r.from_topic_id === topicId || r.to_topic_id === topicId)

export const excerptsReferencingSource = (sourceId) =>
  excerpts.filter((e) =>
    (e.source_links || []).some((l) => l.source_id === sourceId))

export const insightsReferencingSource = (sourceId) =>
  insights.filter((i) => (i.sources || []).includes(sourceId))

export const relationshipsReferencingSource = (sourceId) =>
  relationships.filter((r) => (r.evidence_sources || []).includes(sourceId))

export const symptomsReferencingSource = (sourceId) =>
  symptoms.filter((s) => (s.sources || []).includes(sourceId))
