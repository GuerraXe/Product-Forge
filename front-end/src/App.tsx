import { Canvas, useFrame } from "@react-three/fiber";
import React from "react";
import { Mesh } from "three";


function MeshPropertySlider({ label = "", onChange = (_ : any) => {} }) {
  return (
    <div>
      <label>{label}</label>
      <input type="range" onChange={(e) => { onChange(Number(e.target.value)) }}/>
    </div>
  )
}

function OrbitingSphere( { size } : {size : number} ) {
  // hmm.....
  const sphs = React.useRef<Mesh>(null!);

  useFrame((state, _) => {
    const time = state.clock.getElapsedTime();
    sphs.current.position.x = 2*Math.sin(time);
    sphs.current.position.y = 2*Math.cos(time);
    sphs.current.scale.x = size;
    sphs.current.scale.y = size;
    sphs.current.scale.z = size;
  })

  return (
    <mesh ref={sphs}>
      <sphereGeometry />
      <meshPhongMaterial color={0x00ff99} flatShading={false} specular={0xffffff} shininess={70} />
    </mesh>
  );
}

function App() {
  const [size, setSize ] = React.useState(50);

  return (
    <div style={{ width: "100%", height: "75vh" }}>
        <p>Product Forge</p>
        <MeshPropertySlider label="x" onChange={setSize}/>
        <Canvas>
            <pointLight args={[0xffffff]} position={[0, 5, 10]} intensity={20} distance={0} decay={2} />
            <ambientLight intensity={.25}/>
            <OrbitingSphere size={size / 50}/>
        </Canvas>
    </div>
  )
}

export default App
