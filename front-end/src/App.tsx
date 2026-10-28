import ForgeCanvas from "./ForgeCanvas";
import { Canvas } from "@react-three/fiber";

function App() {

  return (
    <div style={{ width: "100%", height: "75vh" }}>
        <p>Product Forge</p>
        <Canvas>
            <pointLight args={[0xffffff]} position={[5, 5, 10]} intensity={10} distance={0} decay={1} />
            <ambientLight intensity={.1}/>
            <mesh>
                <sphereGeometry />
                <meshPhongMaterial color="hotpink" flatShading={false} specular={0xffffff} shininess={300} />
            </mesh>
        </Canvas>
    </div>
  )
}

export default App
