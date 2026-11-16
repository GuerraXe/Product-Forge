import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import materials from '../materials.json'
import { partMaterials, type Part } from '../lib/types';
import { Canvas, useFrame } from '@react-three/fiber';
import * as drei from '@react-three/drei';
import { select } from 'three/tsl';

interface SceneCanvasProps {
  selectedId: string | null;
  onSelectPart: (id: string | null) => void;
  parts: Part[];
  transformMode: "translate" | "rotate" | "scale" | undefined;

  // propagate changes up for control panel
  onSetPosition: (id: string, pos: THREE.Vector3) => void,
  onSetRotation: (id: string, rot: THREE.Vector3) => void,
  onSetScale: (id: string, scl: THREE.Vector3) => void,
}
/*
export function SceneCanvas() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!host.current) return

    //Background and Light
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f5f7f8')
    scene.add(new THREE.AmbientLight('#ffffff', 3))

    //Axes and Cube
    const axes = new THREE.AxesHelper(5)
    scene.add(axes)
    const shape = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 3),
      new THREE.MeshStandardMaterial({ color: materials.plastic.color }),
    )
    shape.position.y = 1
    scene.add(shape)

    //Camera
    const camera = new THREE.PerspectiveCamera(35)
    camera.position.set(10, 7, 10)

    //Renderer
    const renderer = new THREE.WebGLRenderer()
    host.current.appendChild(renderer.domElement)

    //Drag and move for camera along with zoom
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.maxPolarAngle = Math.PI

    //Watches div size to handle resizes
    const resize = () => {
      const width = host.current?.clientWidth
      const height = host.current?.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host.current)
    resize()

    //The render loop that recursively draws the canvas
    const render = () => {
      controls.update()
      renderer.render(scene, camera)
      requestAnimationFrame(render)
    }
    render()

  }, [])

  return <div className="scene-canvas" ref={host} />
}
*/
function createPartGeometry(part: Part) {
  switch (part.shape) {
  case 'cube':
    return (<boxGeometry args={[1, 1, 1]}/>);
  case 'sphere':
    // radius, w and h segments
    return (<sphereGeometry args={[1, 32, 32]}/>);
  case 'cylinder':
    // rad top and bot, w segments
    return (<cylinderGeometry args={[1, 1, 1, 32]}/>);
  default:
    return null;
  }
}

function Vector3ToEuler(vec: THREE.Vector3) {
  return new THREE.Euler(vec.x, vec.y, vec.z);
}

export function SceneCanvas(props: SceneCanvasProps) {
  // const camera = new THREE.PerspectiveCamera(45);
  // camera.position.set(10, 7, 10);

  interface PartModelArgs {
    part: Part; 
    isSelected: boolean;
    mode: "translate" | "rotate" | "scale" | undefined;
    onSelect: (id: string) => void 
  }

  function PartModel({ part, isSelected, mode, onSelect }: PartModelArgs) {
    const meshRef = useRef<THREE.Mesh>(null!);

    const onChange = () => {
      if (!meshRef.current) return;
      props.onSetPosition(part.id, part.position);
      props.onSetRotation(part.id, part.rotation);
      props.onSetScale(part.id, part.scale);
    }

    // bypass having more messy prop drilling 
    // this is incredibly jank
    useFrame(() => {
      if (!(meshRef.current)) return;

      part.position.x = meshRef.current.position.x;
      part.position.y = meshRef.current.position.y;
      part.position.z = meshRef.current.position.z;

      part.rotation.x = meshRef.current.rotation.x;
      part.rotation.y = meshRef.current.rotation.y;
      part.rotation.z = meshRef.current.rotation.z;

      part.scale.x = meshRef.current.scale.x;
      part.scale.y = meshRef.current.scale.y;
      part.scale.z = meshRef.current.scale.z;
    })

    return (
      <>
        <mesh 
          key={part.id} 
          ref={meshRef}
          position={part.position}
          rotation={Vector3ToEuler(part.rotation)}
          scale={part.scale}
          onClick={ e => { e.stopPropagation(); onSelect(part.id) } }
        >
          <meshStandardMaterial color={partMaterials[part.material].color}/>
          {createPartGeometry(part)}
        </mesh>
        {isSelected && (
          <drei.TransformControls 
            object={meshRef}
            mode={mode}
            onObjectChange={onChange}
          />
        )}  
      </>
    );
  }

  const getTarget = () => {

  };

  return (
    <Canvas 
      onPointerMissed={() => props.onSelectPart(null)}
      onKeyDown={e => console.log(e.key)}
      // camera={camera}
    >
      <axesHelper args={[5]}/>
      <ambientLight intensity={0.75} />
      <directionalLight position={[0, 1000000, 0]} intensity={1}/>
      <drei.OrbitControls 
        makeDefault 
        target={new THREE.Vector3(0, 1, 0)}
        maxPolarAngle={Math.PI}
        enableDamping={false}
      />
      { props.parts.map( part => 
        <PartModel 
          part={part} 
          isSelected={part.id == props.selectedId}
          mode={props.transformMode}
          onSelect={props.onSelectPart} 
        /> ) }
    </Canvas>
  );
}