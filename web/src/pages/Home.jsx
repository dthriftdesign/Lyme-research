import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { topics, sourcesForTopic } from '../lib/db'
import { CONSENSUS, CONSENSUS_ORDER } from '../lib/consensus'

function MiniConsensusBar({ topicId }) {
  const srcs = sourcesForTopic(topicId)
  const counts = CONSENSUS_ORDER.map((c) => ({
    c, n: srcs.filter((s) => s.consensus_status === c).length,
  })).filter((x) => x.n > 0)
  const total = srcs.length || 1
  return (
    <div className="flex h-1.5 rounded overflow-hidden mt-3" title={`${srcs.length} sources`}>
      {counts.map(({ c, n }) => (
        <div key={c} style={{ width: `${(n / total) * 100}%` }}
             className={CONSENSUS[c]?.dot || 'bg-slate-300'} />
      ))}
    </div>
  )
}

export default function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Lyme Research Database</h1>
        <p className="mt-2 text-slate-600 max-w-3xl">
          A research-synthesis database across nine Lyme-related topics. For each topic it
          separates <strong>medical-consensus</strong>, <strong>non-consensus / minority</strong>,
          and <strong>patient-reported</strong> information — cross-linked, source-cited, and
          surfaced with emergent-pattern insights.
        </p>
        <form
          className="mt-4 flex gap-2 max-w-xl"
          onSubmit={(e) => { e.preventDefault(); navigate(`/symptom-search?q=${encodeURIComponent(q)}`) }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a symptom (e.g. knee swelling, formication, night sweats)…"
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <button className="bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Search
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          {CONSENSUS_ORDER.map((c) => (
            <span key={c} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${CONSENSUS[c].dot}`} />
              {CONSENSUS[c].label}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Link
            key={t.topic_id}
            to={`/topic/${t.slug}`}
            className="block border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md hover:border-sky-300 transition"
          >
            <div className="text-xs text-slate-400 font-mono">Topic {t.topic_id}</div>
            <div className="font-semibold text-slate-900 mt-1">{t.title}</div>
            <p className="text-sm text-slate-600 mt-2 line-clamp-5">{t.summary}</p>
            <MiniConsensusBar topicId={t.topic_id} />
          </Link>
        ))}
      </div>
    </div>
  )
}
