import { getMetaInsights } from '../lib/markdown'
import { metaInsights } from '../lib/db'
import { Link } from 'react-router-dom'
import Markdown from '../components/Markdown'

export default function MetaInsights() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Meta-insights</h1>
      <p className="text-slate-600 mt-1">
        Cross-topic synthesis — patterns that only appear when the nine topics are viewed as a web.
      </p>

      {metaInsights.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {metaInsights.map((i) => (
            <div key={i.insight_id} className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="font-medium text-slate-800">{i.title}</div>
              <p className="text-sm text-slate-600 mt-1">{i.content}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(i.sources || []).map((sid) => (
                  <Link key={sid} to={`/source/${sid}`}
                    className="text-xs font-mono text-sky-700 hover:underline">{sid}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Markdown source={getMetaInsights()} />
      </div>
    </div>
  )
}
