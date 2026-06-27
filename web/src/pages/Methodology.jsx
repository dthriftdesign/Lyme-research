import { topics, sources, excerpts } from '../lib/db'

function pct(n, d) {
  return d ? Math.round((100 * n) / d) : 0
}

export default function Methodology() {
  const verified = sources.filter((s) => s.verified).length
  const synthesized = excerpts.filter((e) => e.provenance !== 'verified-thread').length
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Methodology &amp; Limitations</h1>
      <p className="text-slate-600 mt-2">
        This page states plainly how the database was built and what it is and isn&rsquo;t. The
        project&rsquo;s value is in honest synthesis and structure — read these limitations before
        relying on anything here.
      </p>

      <Section title="What this is">
        <p>
          A research-<em>synthesis</em> resource across {topics.length} interlinked Lyme-related
          topics. For each topic it separates medical-consensus, non-consensus/minority, and
          patient-reported information, flags every source by epistemic status, and cross-links
          mechanisms. It is a <strong>map of the contested terrain</strong>, not a primary
          authority.
        </p>
      </Section>

      <Section title="Authorship &amp; review status — read this">
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <strong>AI-authored synthesis.</strong> The research was assembled by an AI system
            from published literature and general knowledge of patient communities. A human
            subject-matter expert has <strong>not</strong> reviewed it.
          </li>
          <li>
            <strong>Not reviewed by domain experts.</strong> Treat it as a well-organized
            starting point, not a vetted reference. Verify any claim against the cited source
            before relying on it.
          </li>
          <li>
            <strong>Not medical advice</strong> (see the disclaimer on every page).
          </li>
        </ul>
      </Section>

      <Section title="The patient-report layer (important)">
        <p>
          Forum &ldquo;patterns&rdquo; are <strong>pattern-level synthesis</strong> of
          well-attested themes across the named communities — <strong>not</strong> systematic
          forum mining, quoted posts, or single verified threads. Excerpts therefore link to
          <strong> platform-level URLs</strong>, not specific permalinks, and dates are
          approximate eras. Each excerpt carries a <em>provenance</em> badge:
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><strong>synthesized pattern</strong> — the current state for {synthesized} of {excerpts.length} excerpts.</li>
          <li><strong>verified thread</strong> — a real, checked permalink (a future upgrade).</li>
        </ul>
        <p className="mt-2">
          Forum content is always paraphrased and never attributed to a named user.
        </p>
      </Section>

      <Section title="Citations">
        <p>
          Every medical/non-consensus claim carries a source ID resolving to a structured record
          with a DOI, PMID, or stable URL. Citations are being audited; sources whose identifier
          has been checked carry a <strong>&ldquo;verified&rdquo;</strong> badge.
        </p>
        <p className="mt-2 font-medium">
          Audit status: {verified} of {sources.length} sources verified ({pct(verified, sources.length)}%).
        </p>
        <p className="mt-2 text-sm text-slate-600">
          A reproducible checker (<code>scripts/audit_citations.py</code>) resolves DOIs and PMIDs
          against doi.org and PubMed; the validator (<code>scripts/validate.py</code>) rejects
          placeholder authors and enforces provenance and referential integrity.
        </p>
      </Section>

      <Section title="Consensus flags">
        <p>
          Sources are labeled <em>mainstream</em>, <em>minority-research</em>, <em>fringe</em>,
          <em> historical</em>, or <em>speculative</em>. Per the project&rsquo;s design,
          fringe/speculative material is presented as <em>differently-categorized</em>, not
          <em> differently-trustworthy</em> — the badge does the epistemic work. Inclusion of a
          source is never an endorsement of its conclusions.
        </p>
      </Section>

      <Section title="Known gaps / roadmap">
        <ul className="list-disc ml-5 space-y-1">
          <li>Replace synthesized patterns with verified forum permalinks.</li>
          <li>Complete the citation audit across all {sources.length} sources.</li>
          <li>Deepen thinner topics toward the 15–30-source target.</li>
          <li>Obtain independent expert review and add a corrections workflow.</li>
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">{title}</h2>
      <div className="text-slate-700 leading-relaxed">{children}</div>
    </div>
  )
}
