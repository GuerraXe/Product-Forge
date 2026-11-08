import { ControlPanel } from './components/ControlPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { SceneCanvas } from './components/SceneCanvas'
import './styles/app.css'

function App() {
  return (
    <main className="workspace">
      <header className="topbar">Dummy text</header>
      <section className="no-top">
        <ControlPanel />
        <div className="scene-column">
          <div className="scene-frame"><SceneCanvas /></div>
          <ResultsPanel />
        </div>
      </section>
    </main>
  )
}

export default App
