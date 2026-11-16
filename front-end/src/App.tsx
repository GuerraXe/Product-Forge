import { ControlPanel } from './components/ControlPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { SceneCanvas } from './components/SceneCanvas'
import { useRef, useState, type KeyboardEventHandler } from 'react'
import './styles/app.css'
import { Part, type Shape, type TransformMode} from './lib/types'
import * as THREE from 'three';

function App() {
  // slow in theory, need to refactor to better data structure
  const sceneParts = useRef<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const [transformMode, setTransformMode] = useState<TransformMode>(undefined);

  const addPart = (shape: Shape | undefined) => {
    const newPart: Part = new Part();
    newPart.shape = shape ?? "cube";
    sceneParts.current.push(newPart);
    setSelectedPartId(newPart.id);
  }

  // linear search is fine for mvp, but may need changing later on
  const getPart = (idToFind: string | null) => {
    const f = sceneParts.current.find( value => value.id === idToFind );
    return f ? f : null;
  }

  const setPosition = (vec: THREE.Vector3) => {
    const part = getPart(selectedPartId);
    if (part) part.position = vec;
  }

  const setRotation = (vec: THREE.Vector3) => {
    const part = getPart(selectedPartId);
    if (part) part.rotation = vec;
  }

  const setScale = (vec: THREE.Vector3) => {
    const part = getPart(selectedPartId);
    if (part) part.scale = vec;
  }

  const onKeyUp: KeyboardEventHandler<HTMLElement> = e => {
    console.log(e.key);
    switch(e.key) {
      case '1':
        setTransformMode("translate");
        break;
      case '2':
        setTransformMode("rotate");
        break;
      case '3':
        setTransformMode("scale");
        break;
      default:
    }
  }

  return (
    <main className="workspace" 
      tabIndex={-1} // so onKeyUp works
      onKeyUp={onKeyUp}
    >
      <header className="topbar">Dummy text</header>
      <section className="no-top">
        <ControlPanel 
          callbacks={ {
            onAddPart: addPart,
            onDeletePart: () => {},
            onSetPosition: setPosition,
            onSetRotation: setRotation,
            onSetScale: setScale,
            onSetMaterial: () => {},
          } } 
          selectedPart={ getPart(selectedPartId) } />
        <div className="scene-column">
          <div className="scene-frame"><SceneCanvas 
            selectedId={selectedPartId}
            onSelectPart={id => setSelectedPartId(id)}
            parts={sceneParts.current}
            transformMode={transformMode}
            onSetPosition={() => {}}
            onSetRotation={() => {}}
            onSetScale={() => {}} 
          />
          </div>
          <ResultsPanel />
        </div>
      </section>
    </main>
  )
}

export default App
