// Eagerly load all exported topic markdown as raw strings.
// Keys look like: ../data/markdown/<slug>/<name>.md
const files = import.meta.glob('../data/markdown/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const lookup = {}
for (const [path, content] of Object.entries(files)) {
  const m = path.match(/markdown\/(.+)\.md$/)
  if (m) lookup[m[1]] = content
}

// getMarkdown('lyme-arthritis', 'medical-consensus') -> string | null
export function getMarkdown(slug, name) {
  return lookup[`${slug}/${name}`] ?? null
}

export function getMetaInsights() {
  return lookup['meta-insights'] ?? null
}

// Turn inline [T1-S001] / [T1-F001] citations into router links so the
// citation-popover / source-detail navigation works inside rendered markdown.
export function linkifyCitations(md) {
  if (!md) return md
  return md.replace(/\[(T\d+-S\d{3})\]/g, '[[$1]](#/source/$1)')
}
