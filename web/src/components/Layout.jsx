import { Link, NavLink, Outlet } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner'

const navItem = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium ${
    isActive ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-200'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBanner />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/" className="font-bold text-lg text-slate-900">
            🔬 Lyme Research DB
          </Link>
          <nav className="flex gap-1 flex-wrap">
            <NavLink to="/" end className={navItem}>Topics</NavLink>
            <NavLink to="/symptom-search" className={navItem}>Symptom search</NavLink>
            <NavLink to="/graph" className={navItem}>Cross-topic graph</NavLink>
            <NavLink to="/meta-insights" className={navItem}>Meta-insights</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 py-4">
          Research-synthesis resource. Sources are cited so readers can verify them
          independently; their presence is not an endorsement of their conclusions.
        </div>
      </footer>
    </div>
  )
}
