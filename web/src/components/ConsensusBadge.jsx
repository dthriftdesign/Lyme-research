import { consensusMeta } from '../lib/consensus'

export default function ConsensusBadge({ status, title }) {
  const m = consensusMeta(status)
  return (
    <span
      title={title || m.blurb}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${m.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}
