import { useRef } from 'react'
import * as THREE from 'three'
import { type Part } from '../lib/types';
import { Canvas, useFrame } from '@react-three/fiber';
import * as drei from '@react-three/drei';

interface SceneCanvasProps {
  selectedId: string | null;
  onSelectPart: (part: Part | null) => void;
  parts: Part[];
  transformMode: "translate" | "rotate" | "scale" | undefined;

  // propagate changes up for control panel
  onSetPosition: (id: string, pos: THREE.Vector3) => void,
  onSetRotation: (id: string, rot: THREE.Vector3) => void,
  onSetScale: (id: string, scl: THREE.Vector3) => void,
}

// to be moved to a different file, or perhaps as a method of the Part class
function createPartGeometry(part: Part) {
  switch (part.shape) {
  case 'cube':
    return (<boxGeometry args={[1, 1, 1]}/>);
  case 'sphere':
    // radius, w and h segments
    return (<sphereGeometry args={[0.5, 32, 32]}/>);
  case 'cylinder':
    // rad top and bot, w segments
    return (<cylinderGeometry args={[0.5, 0.5, 1, 32]}/>);
  default:
    return null;
  }
}

// helper function
function Vector3ToEuler(vec: THREE.Vector3) {
  return new THREE.Euler(vec.x, vec.y, vec.z);
}

/**
 * props argument to be refactored to only need state and dispatch,
 * which requires refactoring functions that rely on current args
 * 
 * @param props holds references to the parent appstate and callback functions
 * @returns SceneCanvas component
 */
export function SceneCanvas(props: SceneCanvasProps) {
  // const camera = new THREE.PerspectiveCamera(45);
  // camera.position.set(10, 7, 10);

  interface PartModelArgs {
    part: Part; 
    isSelected: boolean;
    mode: "translate" | "rotate" | "scale" | undefined;
    onSelect: (part: Part) => void 
  }

  function PartModel({ part, isSelected, mode, onSelect }: PartModelArgs) {
    const meshRef = useRef<THREE.Mesh>(null!);

    // bypass having more messy prop drilling 
    // by prioritizing rendered mesh transforms over
    // data transforms
    // this is incredibly jank, but makes transformsControls work
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
          onClick={ e => { e.stopPropagation(); onSelect(part) } }
        >
          <meshStandardMaterial color={part.material.color}/>
          {createPartGeometry(part)}
        </mesh>
        {isSelected && (
          <drei.TransformControls
            object={meshRef}
            mode={mode}
            // when a drag ends, push the mesh's transforms into app state
            // so the control and results panels see the change
            onMouseUp={() => {
              const mesh = meshRef.current;
              if (!mesh) return;
              props.onSetPosition(part.id, mesh.position.clone());
              props.onSetRotation(part.id, new THREE.Vector3(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z));
              props.onSetScale(part.id, mesh.scale.clone());
            }}
          />
        )}  
      </>
    );
  }

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