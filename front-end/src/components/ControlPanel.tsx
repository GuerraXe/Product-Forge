import { useState, type Dispatch } from "react";
import * as Part from "../lib/types";
import { partMaterialKeys } from "../lib/types";
import type { AppAction } from "../App";

// tracking selected part should be done in parent.
// it is not good to also keep a copy of selected part's state
// in the control panel, because then that needs to be synced 

type Axis = 'x' | 'y' | 'z';
type VectorProperty = "position" | "rotation" | "scale";

interface ControlPanelProps {
  dispatch: Dispatch<AppAction>;
  selectedPart: Part.Part | null;
}

export function ControlPanel( { dispatch, selectedPart } : ControlPanelProps) {
  // const selectedNewPartShape = useRef<Part.Shape>("cube");
  const [newPartShape, setNewPartShape] = useState<Part.Shape>("cube");

  const onNewPartChange = (value : string) => {
    value = value.toLowerCase();
    switch(value) {
    case "cube":
    case "sphere":
    case "cylinder":
      setNewPartShape(value);
      break;
    default:
      // fallback
      setNewPartShape("cube");
      break;
    }
  };

  const onMaterialChange = (value: string) => {
    // fragile
    const key = value as Part.PartMaterialKey;
    dispatch({type: "setMaterial", name: key, material: Part.partMaterials[key]});
  }

  // callback using the dispatches defined in app.tsx
  const onVecPropChange = (prop: VectorProperty, axis: Axis, input: string) => {
    if (!selectedPart) return;
    let num = parseFloat(input);
    if (Number.isNaN(num)) num = 0;

    const next = selectedPart[prop].clone();
    next[axis] = num;

    switch(prop) {
      case "position": {
        dispatch({type: "setPosition", pos: next});
        break;
      }
      case "rotation": {
        dispatch({type: "setRotation", rot: next});
        break;
      }
      case "scale": {
        dispatch({type: "setScale", scl: next});
        break;
      }
      default: {
        console.error("dispatch not defined for prop:", prop);
        break;
      }
    }
  };

  // auto-generate input fields for vector properties 
  const vec3Fields = (prop: VectorProperty) => {
    return (['x', 'y', 'z'] as Axis[]).map( axis =>
      <label key={axis}>
        {axis}:&nbsp;
        <input 
          type="number"
          step={0.1}
          value={selectedPart ? selectedPart[prop][axis] : ""}
          onChange={e => {
            onVecPropChange(prop, axis, e.target.value);
          }}
        />
      </label>
    )
  }

  

  return (
  <section className="control-panel">
    <h2>Control Panel</h2>

    <section className="sub-panel">
      <h3>Actions</h3>
      <fieldset className="add-mesh">
        <legend>New Part</legend>
        <select onChange={e => onNewPartChange(e.target.value)}>
          <option disabled>--Select Shape--</option>
          <option value="cube">Cube</option>
          <option value="sphere">Sphere</option>
          <option value="cylinder">Cylinder</option>
        </select>
        <button onClick={() => dispatch({type: "addPart", shape: newPartShape})}>Add</button>
      </fieldset>
    </section>

    <fieldset className="sub-panel">
      <legend>Selected</legend>
      <span className="field">{selectedPart?.name || "None"}</span>
      <button onClick={() => dispatch({type: "deletePart"})} disabled={!selectedPart}>Delete</button>
    </fieldset>
    
    <section>
      <h3>Properties</h3>
      <fieldset disabled={!selectedPart}>
        <legend>Position</legend>
        {vec3Fields("position")}
      </fieldset>
      <fieldset disabled={!selectedPart}>
        <legend>Rotation</legend>
        {vec3Fields("rotation")}
      </fieldset>

      <fieldset disabled={!selectedPart}>
        <legend>Scale</legend>
        {vec3Fields("scale")}
      </fieldset>

      {/* auto-populate with materials from JSON for now  */}
      <label htmlFor="material-select">Material:&nbsp;</label>
      <select 
        id="material-select" 
        disabled={!selectedPart}
        value={selectedPart ? selectedPart.materialName : ""}
        onChange={e => onMaterialChange(e.target.value)}
      >
        <option value="" disabled>--Select Material--</option>
        {partMaterialKeys.map(key => 
          (<option key={key} value={key}> 
            {key.charAt(0).toUpperCase() + key.slice(1)} 
          </option>)
        )}
      </select>
    </section>
  </section>
  );
}
