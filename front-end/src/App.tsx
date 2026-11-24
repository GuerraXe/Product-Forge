import { ControlPanel } from './components/ControlPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { SceneCanvas } from './components/SceneCanvas'
import { useReducer, type KeyboardEventHandler } from 'react'
import './styles/app.css'
import { Part, type Shape} from './lib/types'
import type * as Forge from './lib/types'
import * as THREE from 'three';
import logo from './components/logo.png'

/*
 * React's paradigm centers around declarative programming, that is, 
 * components should focus on what to do, rather than how it's done.
 * This does require keeping things "pure," so a lot of copying is done
 * to minimize state. The compute efficiency of this may be questionable,
 * but this approach should be "easier" to debug.
 *
 * Features that should definitely be added later:
 * Undo and redo
 */

export type TransformMode = "translate" | "rotate" | "scale" | undefined;

// defined actions that user can make on canvas and control panel
export type AppAction =
  | { type: 'addPart'; shape?: Shape }
  | { type: 'deletePart' }
  | { type: 'selectPart'; part: Part | null }
  | { type: 'setPosition'; pos: THREE.Vector3 }
  | { type: 'setRotation'; rot: THREE.Vector3 }
  | { type: 'setScale'; scl: THREE.Vector3 }
  | { type: 'setMaterial'; name: Forge.PartMaterialKey; material: Forge.PartMaterial }
  | { type: 'setTransformMode'; mode: TransformMode };

interface AppState {
  parts: Part[];
  selectedPartId: string | null;
  transformMode: TransformMode;
}

// used for the reducer setup. state on startup
const initialAppState: AppState = {
  parts: [],                // slow in theory, need to refactor to better data structure
  selectedPartId: null,     // id is needed for deleting and selecting parts on canvas
  transformMode: undefined,
}

// helper handler for changing the selected part's property
function updateSelectedPart(state: AppState, updater: (part: Part) => void): AppState {
  if (!state.selectedPartId) return state;

  const parts = state.parts.map(part => {
    if (part.id !== state.selectedPartId) {
      return part;
    }
    const updatedPart = part.clone();
    updater(updatedPart)
    return updatedPart;
  });

  return {...state, parts};
}

function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case "addPart": {
      const newPart = new Part();
      newPart.shape = action.shape ?? 'cube';
      return {...state, parts: [...state.parts, newPart], selectedPartId: newPart.id};
    };

    case "deletePart": {
      if (!state.selectedPartId) return state;
      const newParts = state.parts.filter(p => p.id !== state.selectedPartId);
      return {...state, parts: newParts, selectedPartId: null};
    };

    case "selectPart": {
      // handle the case of selection and deselection
      return {...state, selectedPartId: action.part ? action.part.id : null} 
    }

    case "setPosition": {
      return updateSelectedPart(state, part => {
        part.position = action.pos.clone();
      });
    }

    case "setRotation": {
      return updateSelectedPart(state, part => {
        part.rotation = action.rot.clone();
      });
    }

    case "setScale": {
      return updateSelectedPart(state, part => {
        part.scale = action.scl.clone();
      });
    }

    case "setMaterial": {
      return updateSelectedPart(state, part => {
        // material name may be used for lookups
        part.materialName = action.name;
        part.material = action.material;
      });
    }

    case "setTransformMode": {
      return {...state, transformMode: action.mode}
    }

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // linear search is fine for mvp, but may need changing later on
  // /** @deprecated */ 
  const getPart = (idToFind: string | null) => {
    const f = state.parts.find( value => value.id === idToFind );
    return f ? f : null;
  }

  const onKeyUp: KeyboardEventHandler<HTMLElement> = e => {
    const actionType = "setTransformMode";
    switch(e.key) {
      case '1':
        dispatch({type: actionType, mode: "translate"});
        break;
      case '2':
        dispatch({type: actionType, mode: "rotate"});
        break;
      case '3':
        dispatch({type: actionType, mode: "scale"});
        break;
      default:
        break;
    }
  }

  return (
    <main className="workspace" 
      tabIndex={-1} // enable programmatic tab focus so onKeyUp works
      onKeyUp={onKeyUp}
    >
      <header className="topbar">
        <img className="brand-logo" src={logo} alt="Product Forge logo" />
        <h1>Product Forge</h1>
        <div className='control-label'>
          [LMB]: Select Part or Orbit Camera | [RMB]: Drag Camera | [MMB]: Zoom In/Out
        </div> 
        <div className='control-label'>
          [1]: Translate | [2]: Rotate | [3] Scale
        </div>
      </header>
      <section className="no-top">
        <ControlPanel dispatch={dispatch} selectedPart={getPart(state.selectedPartId)}/>
        <div className="scene-column">
          <div className="scene-frame">
            {/* sceneCanvas could use a refactor to minimize parameters passed */}
            <SceneCanvas 
              selectedId={state.selectedPartId}
              onSelectPart={part => dispatch({type: "selectPart", part})}
              parts={state.parts}
              transformMode={state.transformMode}
              onSetPosition={(_, pos) => dispatch({type: "setPosition", pos})}
              onSetRotation={(_, rot) => dispatch({type: "setRotation", rot})}
              onSetScale={(_, scl) => dispatch({type: "setScale", scl})} 
              // parts={state.parts}
              // dispatch={dispatch}
            />
          </div>
          <ResultsPanel selectedPart={getPart(state.selectedPartId)} />
        </div>
      </section>
    </main>
  )
}

export default App
