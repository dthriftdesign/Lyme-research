// Consensus-status presentation. Per the spec, fringe is presented as
// differently-categorized, not differently-trustworthy — the badge does the
// epistemic work, not visual hierarchy.
export const CONSENSUS = {
  mainstream: {
    label: 'Mainstream',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    blurb: 'Accepted in current guidelines / broad scientific consensus.',
  },
  'minority-research': {
    label: 'Minority research',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    blurb: 'Peer-reviewed but not mainstream consensus.',
  },
  fringe: {
    label: 'Non-consensus (fringe)',
    badge: 'bg-orange-100 text-orange-800 border-orange-400',
    dot: 'bg-orange-500',
    blurb: 'Published but widely contested or in non-mainstream venues.',
  },
  historical: {
    label: 'Historical',
    badge: 'bg-violet-100 text-violet-800 border-violet-300',
    dot: 'bg-violet-500',
    blurb: 'Older research, foundational or possibly superseded.',
  },
  speculative: {
    label: 'Speculative',
    badge: 'bg-slate-50 text-slate-600 border-dashed border-slate-400',
    dot: 'bg-slate-400',
    blurb: 'Hypothesis-level, not yet tested.',
  },
}

export const consensusMeta = (status) =>
  CONSENSUS[status] || {
    label: status || 'unknown',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
    blurb: '',
  }

export const CONSENSUS_ORDER = [
  'mainstream', 'minority-research', 'fringe', 'historical', 'speculative',
]

// Relationship-type colors for the graph edges.
export const REL_TYPE_COLOR = {
  'shared-mechanism': '#0ea5e9',
  'symptom-overlap': '#10b981',
  comorbidity: '#8b5cf6',
  'differential-diagnosis': '#f59e0b',
  contrasting: '#ef4444',
}

export const REL_STRENGTH_WIDTH = {
  strong: 3.5, moderate: 2.25, weak: 1.25, speculative: 1,
}
