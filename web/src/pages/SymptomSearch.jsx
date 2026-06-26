import { useMemo, useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { Link, useSearchParams } from 'react-router-dom'
import { symptoms, getTopic } from '../lib/db'

const FREQ_COLOR = {
  hallmark: 'bg-sky-100 text-sky-800',
  common: 'bg-emerald-100 text-emerald-800',
  occasional: 'bg-amber-100 text-amber-800',
  rare: 'bg-slate-100 text-slate-600',
}

export default function SymptomSearch() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  useEffect(() => { setQ(params.get('q') || '') }, [params])

  const fuse = useMemo(
    () => new Fuse(symptoms, {
      keys: ['name', 'description', 'body_system', 'topics.mechanism_explanation'],
      threshold: 0.4,
      ignoreLocation: true,
    }),
    [],
  )

  const results = q.trim()
    ? fuse.search(q).map((r) => r.item)
    : symptoms

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Symptom search</h1>
      <p className="text-slate-600 mt-1">
        Fuzzy-search the symptom map. Each result shows which topics include the symptom, its
        frequency, the mechanism explanation, and the sources behind it.
      </p>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}) }}
        placeholder="e.g. formication, knee swelling, night sweats, obsessions…"
        className="mt-4 w-full max-w-xl border border-slate-300 rounded-md px-3 py-2 text-sm"
      />
      <div className="text-xs text-slate-400 mt-1">{results.length} symptom(s)</div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {results.map((s) => (
          <div key={s.symptom_id} className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{s.name}</span>
              <span className="text-xs text-slate-400">{s.body_system}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{s.description}</p>
            <div className="mt-2 space-y-2">
              {(s.topics || []).map((tm) => {
                const t = getTopic(tm.topic_id)
                if (!t) return null
                return (
                  <div key={tm.topic_id} className="text-sm border-t border-slate-100 pt-2">
                    <div className="flex items-center gap-2">
                      <Link to={`/topic/${t.slug}`} className="text-sky-700 font-medium hover:underline">
                        {t.title}
                      </Link>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${FREQ_COLOR[tm.frequency] || 'bg-slate-100'}`}>
                        {tm.frequency}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1">{tm.mechanism_explanation}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(tm.sources || []).map((sid) => (
                        <Link key={sid} to={`/source/${sid}`}
                          className="text-[11px] font-mono text-sky-700 hover:underline">{sid}</Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
