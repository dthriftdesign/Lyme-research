import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getTopicBySlug, getTopic, sourcesForTopic, excerptsForTopic,
  insightsForTopic, relationshipsForTopic,
} from '../lib/db'
import { getMarkdown } from '../lib/markdown'
import { CONSENSUS_ORDER, consensusMeta, REL_STRENGTH_WIDTH } from '../lib/consensus'
import Markdown from '../components/Markdown'
import SourceCard from '../components/SourceCard'
import ConsensusBadge from '../components/ConsensusBadge'

const TABS = [
  ['consensus', 'Medical Consensus', 'medical-consensus'],
  ['non-consensus', 'Non-Consensus', 'non-consensus'],
  ['patient', 'Patient Reports', 'patient-reports'],
  ['insights', 'Insights', 'insights'],
  ['sources', 'Sources', null],
]

function ProvenanceBadge({ provenance }) {
  const verified = provenance === 'verified-thread'
  return (
    <span
      title={verified
        ? 'Links to a verified forum thread.'
        : 'Pattern-level synthesis across the named communities — not a quoted post or single verified thread. See Methodology.'}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
        verified
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
          : 'bg-slate-50 text-slate-500 border-slate-300 border-dashed'
      }`}
    >
      {verified ? 'verified thread' : 'synthesized pattern'}
    </span>
  )
}

function ExcerptCard({ e }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{e.platform}</span>
        <span className="text-xs text-slate-400">{e.approximate_date}</span>
      </div>
      <div className="mt-1"><ProvenanceBadge provenance={e.provenance} /></div>
      <p className="text-sm text-slate-700 mt-1">{e.paraphrased_content}</p>
      {e.pattern_tag && (
        <div className="mt-2">
          <span className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5 font-mono">
            {e.pattern_tag}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {(e.source_links || []).map((l) => (
          <Link key={l.source_id + l.link_type} to={`/source/${l.source_id}`}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              l.link_type === 'corroborates'
                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                : l.link_type === 'contradicts'
                ? 'border-rose-300 text-rose-700 bg-rose-50'
                : 'border-slate-300 text-slate-600 bg-slate-50'
            }`}>
            {l.link_type} {l.source_id}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Topic() {
  const { slug } = useParams()
  const topic = getTopicBySlug(slug)
  const [tab, setTab] = useState('consensus')
  if (!topic) return <p>Topic not found. <Link className="text-sky-700" to="/">Back</Link></p>

  const srcs = sourcesForTopic(topic.topic_id)
  const excerpts = excerptsForTopic(topic.topic_id)
  const insights = insightsForTopic(topic.topic_id)
  const rels = relationshipsForTopic(topic.topic_id)

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div>
        <div className="text-xs text-slate-400 font-mono">Topic {topic.topic_id}</div>
        <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
        <p className="text-slate-600 mt-2">{topic.summary}</p>

        <div className="flex gap-1 mt-5 border-b border-slate-200 flex-wrap">
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === key
                  ? 'border-sky-700 text-sky-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {['consensus', 'non-consensus', 'patient', 'insights'].includes(tab) && (
            <Markdown source={getMarkdown(slug, TABS.find((t) => t[0] === tab)[2])} />
          )}

          {tab === 'patient' && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-2">Forum pattern records</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {excerpts.map((e) => <ExcerptCard key={e.excerpt_id} e={e} />)}
              </div>
            </div>
          )}

          {tab === 'insights' && insights.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-2">Structured insights</h3>
              <div className="space-y-3">
                {insights.map((i) => (
                  <div key={i.insight_id} className="border border-slate-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{i.title}</span>
                      <span className="text-xs text-slate-400">{i.category}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{i.content}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(i.sources || []).map((sid) => (
                        <Link key={sid} to={`/source/${sid}`}
                          className="text-xs text-sky-700 font-mono hover:underline">{sid}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'sources' && (
            <div className="space-y-5">
              {CONSENSUS_ORDER.map((c) => {
                const group = srcs.filter((s) => s.consensus_status === c)
                if (!group.length) return null
                return (
                  <div key={c}>
                    <div className="flex items-center gap-2 mb-2">
                      <ConsensusBadge status={c} />
                      <span className="text-xs text-slate-400">{group.length}</span>
                    </div>
                    <div className="grid gap-3">
                      {group.map((s) => <SourceCard key={s.source_id} source={s} />)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <aside className="lg:border-l lg:border-slate-200 lg:pl-5">
        <h3 className="font-semibold text-slate-900 text-sm">Related topics</h3>
        <div className="mt-2 space-y-2">
          {rels.map((r) => {
            const otherId = r.from_topic_id === topic.topic_id ? r.to_topic_id : r.from_topic_id
            const other = getTopic(otherId)
            if (!other) return null
            return (
              <Link key={r.relationship_id} to={`/topic/${other.slug}`}
                className="block border border-slate-200 rounded-lg p-2 bg-white hover:border-sky-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">{other.title}</span>
                  <span className="h-1 rounded-full bg-sky-400 inline-block"
                    style={{ width: (REL_STRENGTH_WIDTH[r.strength] || 1) * 6 }} />
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.type} · {r.strength}</div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3">{r.description}</p>
              </Link>
            )
          })}
        </div>
        <div className="mt-5 text-xs text-slate-500">
          <div className="font-semibold text-slate-700 mb-1">Source mix</div>
          {CONSENSUS_ORDER.map((c) => {
            const n = srcs.filter((s) => s.consensus_status === c).length
            if (!n) return null
            return (
              <div key={c} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${consensusMeta(c).dot}`} />
                {consensusMeta(c).label}: {n}
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
