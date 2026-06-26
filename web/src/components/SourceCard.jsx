import { Link } from 'react-router-dom'
import ConsensusBadge from './ConsensusBadge'

export default function SourceCard({ source, compact }) {
  const s = source
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/source/${s.source_id}`} className="font-medium text-sky-800 hover:underline">
          {s.title}
        </Link>
        <ConsensusBadge status={s.consensus_status} />
      </div>
      <div className="text-xs text-slate-500 mt-1">
        {(s.authors || []).slice(0, 3).join(', ')}
        {(s.authors || []).length > 3 ? ', et al.' : ''}
        {s.year ? ` · ${s.year}` : ''}
        {s.journal_or_publisher ? ` · ${s.journal_or_publisher}` : ''}
      </div>
      {!compact && s.key_findings && (
        <p className="text-sm text-slate-700 mt-2">{s.key_findings}</p>
      )}
      <div className="flex flex-wrap gap-3 mt-2 text-xs">
        <span className="text-slate-400">{s.source_id}</span>
        {s.doi && (
          <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer"
             href={`https://doi.org/${s.doi}`}>DOI</a>
        )}
        {s.pmid && (
          <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer"
             href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`}>PMID {s.pmid}</a>
        )}
        {s.url && (
          <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer"
             href={s.url}>Link</a>
        )}
      </div>
    </div>
  )
}
