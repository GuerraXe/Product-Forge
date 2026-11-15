import { ControlPanel } from './components/ControlPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { SceneCanvas } from './components/SceneCanvas'
import { useRef } from 'react'
import './styles/app.css'
import { Part, type Shape} from './lib/types'

function App() {
  // slow in theory, though I don't care about time complexity 
  // if there's gonna be less than 500 parts in practice
  const sceneParts = useRef<Part[]>([]);
  const selectedPartId = useRef<string>(null);

  const addPart = (shape: Shape | undefined) => {
    const newPart: Part = new Part();
    newPart.shape = shape ?? "cube";
    sceneParts.current.push(newPart);
    selectedPartId.current = newPart.id;
  }

  const getPart = (idToFind: string | null) => {
    const f = sceneParts.current.find( value => value.id === idToFind );
    return f ? f : null;
  }

  return (
    <main className="workspace">
      <header className="topbar">Dummy text</header>
      <section className="no-top">
        <ControlPanel 
          callbacks={ {
            onAddPart: addPart,
            onDeletePart: () => {},
            onSetPosition: () => {},
            onSetRotation: () => {},
            onSetScale: () => {},
            onSetMaterial: () => {},
          } } 
          selectedPart={ getPart(selectedPartId.current) } />
        <div className="scene-column">
          <div className="scene-frame"><SceneCanvas /></div>
          <ResultsPanel />
        </div>
      </section>
    </main>
  )
}

export default App
