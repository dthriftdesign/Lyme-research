import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Topic from './pages/Topic'
import SymptomSearch from './pages/SymptomSearch'
import Graph from './pages/Graph'
import SourceDetail from './pages/SourceDetail'
import MetaInsights from './pages/MetaInsights'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:slug" element={<Topic />} />
        <Route path="/symptom-search" element={<SymptomSearch />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/meta-insights" element={<MetaInsights />} />
        <Route path="/source/:id" element={<SourceDetail />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
