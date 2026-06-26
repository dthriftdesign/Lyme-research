import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { linkifyCitations } from '../lib/markdown'

// Renders topic markdown, turning inline [T#-S###] citations into in-app links
// and routing internal #/source/... links through React Router.
export default function Markdown({ source }) {
  const text = linkifyCitations(source || '')
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...props }) {
            if (href && href.startsWith('#/')) {
              return (
                <Link to={href.slice(1)} className="citation-link">
                  {children}
                </Link>
              )
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            )
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
