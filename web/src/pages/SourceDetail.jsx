import { Link, useParams } from 'react-router-dom'
import {
  getSource, getTopic, excerptsReferencingSource, insightsReferencingSource,
  relationshipsReferencingSource, symptomsReferencingSource,
} from '../lib/db'
import ConsensusBadge from '../components/ConsensusBadge'
import { consensusMeta } from '../lib/consensus'

export default function SourceDetail() {
  const { id } = useParams()
  const s = getSource(id)
  if (!s) return <p>Source {id} not found. <Link className="text-sky-700" to="/">Back</Link></p>
  const topic = getTopic(s.topic_id)
  const excerpts = excerptsReferencingSource(id)
  const insights = insightsReferencingSource(id)
  const rels = relationshipsReferencingSource(id)
  const symptoms = symptomsReferencingSource(id)

  return (
    <div className="max-w-3xl">
      <Link to={topic ? `/topic/${topic.slug}` : '/'} className="text-sm text-sky-700 hover:underline">
        ← {topic ? topic.title : 'Home'}
      </Link>
      <div className="flex items-start justify-between gap-3 mt-2">
        <h1 className="text-xl font-bold text-slate-900">{s.title}</h1>
        <ConsensusBadge status={s.consensus_status} />
      </div>
      <p className="text-xs text-slate-500 italic mt-1">{consensusMeta(s.consensus_status).blurb}</p>

      <div className="text-sm text-slate-600 mt-3">
        {(s.authors || []).join(', ')}
        {s.year ? ` (${s.year})` : ''}. {s.journal_or_publisher}.
      </div>
      <div className="flex flex-wrap gap-3 mt-2 text-sm">
        <span className="font-mono text-slate-400">{s.source_id}</span>
        <span className="text-slate-500">type: {s.type}</span>
        {s.doi && <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer" href={`https://doi.org/${s.doi}`}>DOI: {s.doi}</a>}
        {s.pmid && <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`}>PMID: {s.pmid}</a>}
        {s.url && <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer" href={s.url}>Source link</a>}
      </div>

      {s.key_findings && (
        <Section title="Key findings"><p className="text-slate-700">{s.key_findings}</p></Section>
      )}
      {s.relevance_notes && (
        <Section title="Relevance"><p className="text-slate-700">{s.relevance_notes}</p></Section>
      )}

      {symptoms.length > 0 && (
        <Section title="Symptoms linked to this source">
          <ul className="list-disc ml-5 text-slate-700">
            {symptoms.map((sy) => <li key={sy.symptom_id}>{sy.name}</li>)}
          </ul>
        </Section>
      )}

      {excerpts.length > 0 && (
        <Section title="Forum excerpts referencing this source">
          <div className="space-y-2">
            {excerpts.map((e) => {
              const link = (e.source_links || []).find((l) => l.source_id === id)
              return (
                <div key={e.excerpt_id} className="border border-slate-200 rounded-lg p-2 bg-white text-sm">
                  <span className="text-slate-400 text-xs">{e.platform} · {e.approximate_date} · </span>
                  <span className={`text-xs ${link?.link_type === 'contradicts' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {link?.link_type}
                  </span>
                  <p className="text-slate-700 mt-1">{e.paraphrased_content}</p>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {insights.length > 0 && (
        <Section title="Insights drawing on this source">
          <div className="space-y-2">
            {insights.map((i) => (
              <div key={i.insight_id} className="border border-slate-200 rounded-lg p-2 bg-white text-sm">
                <div className="font-medium text-slate-800">{i.title}</div>
                <p className="text-slate-600">{i.content}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {rels.length > 0 && (
        <Section title="Cross-topic relationships citing this source">
          <ul className="list-disc ml-5 text-slate-700 text-sm">
            {rels.map((r) => <li key={r.relationship_id}>{r.description}</li>)}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-1">{title}</h2>
      {children}
    </div>
  )
}
