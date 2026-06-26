import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide,
} from 'd3-force'
import { topics, relationships } from '../lib/db'
import { REL_TYPE_COLOR, REL_STRENGTH_WIDTH } from '../lib/consensus'

const W = 760
const H = 560

export default function Graph() {
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [hover, setHover] = useState(null)
  const navigate = useNavigate()
  const simRef = useRef(null)

  useEffect(() => {
    const ns = topics.map((t) => ({ id: t.topic_id, slug: t.slug, title: t.title }))
    const ls = relationships.map((r) => ({
      source: r.from_topic_id,
      target: r.to_topic_id,
      type: r.type,
      strength: r.strength,
      description: r.description,
      id: r.relationship_id,
    }))
    const sim = forceSimulation(ns)
      .force('link', forceLink(ls).id((d) => d.id).distance(150).strength(0.4))
      .force('charge', forceManyBody().strength(-520))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide(46))
      .on('tick', () => {
        setNodes([...ns])
        setLinks([...ls])
      })
    simRef.current = sim
    return () => sim.stop()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Cross-topic graph</h1>
      <p className="text-slate-600 mt-1">
        Force-directed map of the nine topics. Edge thickness = relationship strength; edge color =
        relationship type. Click a node to open the topic; hover an edge for its description.
      </p>
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        {Object.entries(REL_TYPE_COLOR).map(([k, c]) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="w-4 h-0.5 inline-block" style={{ background: c }} /> {k}
          </span>
        ))}
      </div>

      <div className="mt-4 border border-slate-200 rounded-xl bg-white overflow-hidden relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {links.map((l) => {
            const s = l.source, t = l.target
            if (typeof s !== 'object' || typeof t !== 'object') return null
            return (
              <line key={l.id}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={REL_TYPE_COLOR[l.type] || '#94a3b8'}
                strokeWidth={REL_STRENGTH_WIDTH[l.strength] || 1}
                strokeOpacity={hover && hover.id === l.id ? 1 : 0.45}
                onMouseEnter={() => setHover(l)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              />
            )
          })}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}
               onClick={() => navigate(`/topic/${n.slug}`)} style={{ cursor: 'pointer' }}>
              <circle r="26" fill="#0369a1" stroke="#fff" strokeWidth="2" />
              <text textAnchor="middle" dy="5" fill="#fff" fontSize="15" fontWeight="700">
                {n.id}
              </text>
            </g>
          ))}
        </svg>
        {hover && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 text-white text-xs rounded-md px-3 py-2">
            <span className="font-semibold">{hover.type} · {hover.strength}</span> — {hover.description}
          </div>
        )}
      </div>

      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-1 text-sm">
        {topics.map((t) => (
          <div key={t.topic_id} className="text-slate-600">
            <span className="font-mono text-slate-400">{t.topic_id}</span> {t.title}
          </div>
        ))}
      </div>
    </div>
  )
}
