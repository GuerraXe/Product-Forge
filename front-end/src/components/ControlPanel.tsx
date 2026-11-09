export function ControlPanel() {
  return (
  <section className="control-panel">
    <p>Dummy text</p>

    <p>Actions</p>
    <button>Add</button>
    <select>
      <option>None selected</option>
      <option>Cube</option>
      <option>Sphere</option>
      <option>Cylinder</option>
    </select>
    <button>Delete</button>

    <p>Properties</p>
    <fieldset>
      <legend>Position</legend>
      <label>x: <input type="number"/></label>
      <label>y: <input type="number"/></label>
      <label>z: <input type="number"/></label>
    </fieldset>
    {/* TODO: format rotation as euler angles in degrees for now */}
    <fieldset>
      <legend>Rotation</legend>
      <label>x: <input type="number"/></label>
      <label>y: <input type="number"/></label>
      <label>z: <input type="number"/></label>
    </fieldset>

    <fieldset>
      <legend>Scale</legend>
      <label>x: <input type="number"/></label>
      <label>y: <input type="number"/></label>
      <label>z: <input type="number"/></label>
    </fieldset>

    {/* TODO: auto-populate with materials from JSON for now  */}
    <label htmlFor="material-select">Material :</label>
    <select id="material-select">
      <option value="">--Select Material--</option>
      <option value="1">1</option>
      <option value="1">2</option>
      <option value="1">3</option>
    </select>

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
