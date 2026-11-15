import { useRef } from "react";
import { Vector3 } from "three";
import * as Part from "../lib/types";
import { partMaterialKeys } from "../lib/types";
import type { PartMaterial } from "../lib/types";

// tracking selected part should be done in parent
export interface Callbacks {
  onAddPart: (shape: Part.Shape | undefined) => void,
  onDeletePart: () => void, 
  onSetPosition: (pos: Vector3) => void,
  onSetRotation: (rot: Vector3) => void,
  onSetScale: (scl: Vector3) => void,
  onSetMaterial: (partMaterial: PartMaterial) => void,
};

interface ControlPanelProps {
  callbacks: Callbacks;
  selectedPart: Part.Part | null;
}

export function ControlPanel( { callbacks, selectedPart } : ControlPanelProps) {
  const selectedNewPartShape = useRef<Part.Shape>("cube");

  const onNewPartChange = (value : string) => {
    // programming war crime, but wow, code analysis has gotten crazy
    value = value.toLowerCase();
    switch(value) {
    case "cube":
    case "sphere":
    case "cylinder":
      selectedNewPartShape.current = value;
      break;
    default:
      // fallback. should probably print an error message
      selectedNewPartShape.current = "cube";
      break;
    }
  };

  const onMaterialChange = (value: string) => {
    // fragile
    const key = value as Part.PartMaterialKey;
    callbacks.onSetMaterial(Part.partMaterials[key]);
  }


  type Axis = 'x' | 'y' | 'z';

  const onPosChange = (axis: Axis, rawVal: string) => {
    if (!selectedPart) return;
    // Fallback
    const num = parseFloat(rawVal);
    const value = Number.isNaN(num) ? 0 : num;
    const next = selectedPart.position.clone();
    next[axis] = value;
    callbacks.onSetPosition(next);
  };

  const onRotChange = (axis: Axis, rawVal: string) => {
    if (!selectedPart) return;
    // Fallback
    const num = parseFloat(rawVal);
    const value = Number.isNaN(num) ? 0 : num;
    const next = selectedPart.rotation.clone();
    next[axis] = value;
    callbacks.onSetRotation(next);
  };

  const onSclChange = (axis: Axis, rawVal: string) => {
    if (!selectedPart) return;
    // Fallback
    const num = parseFloat(rawVal);
    const value = Number.isNaN(num) ? 0 : num;
    const next = selectedPart.scale.clone();
    next[axis] = value;
    callbacks.onSetRotation(next);
  };

  const vec3Fields = (prop: "position" | "rotation" | "scale", onChange: (axis: Axis, rawVal: string) => void) => {
    return (['x', 'y', 'z'] as Axis[]).map( axis =>
      <label>{axis}:&nbsp;<input 
        type="number"
        step="0.1"
        value={selectedPart ? selectedPart[prop][axis] : ""}
        onChange={e => onChange(axis as Axis, e.target.value)}
      /></label>
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
        <button onClick={() => callbacks.onAddPart(selectedNewPartShape.current)}>Add</button>
      </fieldset>
    </section>

    <fieldset className="sub-panel">
      <legend>Selected</legend>
      <span className="field">{selectedPart?.name || "None"}</span>
      <button onClick={callbacks.onDeletePart} disabled={!selectedPart}>Delete</button>
    </fieldset>
    
    <section>
      <h3>Properties</h3>
      <fieldset disabled={!selectedPart}>
        <legend>Position</legend>
        {vec3Fields("position", onPosChange)}
      </fieldset>
      {/* TODO: format rotation as euler angles in degrees for now */}
      <fieldset disabled={!selectedPart}>
        <legend>Rotation</legend>
        {vec3Fields("rotation", onRotChange)}
      </fieldset>

      <fieldset disabled={!selectedPart}>
        <legend>Scale</legend>
        {vec3Fields("scale", onSclChange)}
      </fieldset>

      {/* TODO: auto-populate with materials from JSON for now  */}
      <label htmlFor="material-select">Material:&nbsp;</label>
      <select 
        id="material-select" 
        disabled={!selectedPart}
        onChange={e => onMaterialChange(e.target.value)}
      >
        <option value="" disabled>--Select Material--</option>
        {partMaterialKeys.map(key => 
          (<option value={key}> 
            {key.charAt(0).toUpperCase() + key.slice(1)} 
          </option>)
        )}
      </select>
    </section>
  </section>
  );

  // object controls for dragging
  // might have to modify canvas?
  // adding a new shape? dropdown for each shape
  // deleting currently selected shape?
  // note: when pushing to origin, squash commits first
  // make more use of useState(), or addHooks for changes
  
  /*
    - track the currently selected shape
    - if the user updates a field in the control panel, make a call
    for the listening canvas. the canvas should update from a listening connection
    - if the canvas detects a change from user (user drags or moves), then
    send info about that change to the control panel, which updates one or all properties
  */

}
