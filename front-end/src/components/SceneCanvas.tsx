import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import materials from '../materials.json'

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
      const width = host.current.clientWidth
      const height = host.current.clientHeight
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
