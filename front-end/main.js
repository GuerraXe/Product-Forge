import * as THREE from 'three';
import { materialRoughness } from 'three/src/nodes/accessors/MaterialNode.js';
// import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5)

const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );

const geometry = new THREE.BoxGeometry( 1,1,1 );
const sph = new THREE.SphereGeometry(1, 20, 20);
const material = new THREE.MeshPhongMaterial( { color: 0xffaa00, flatShading: false, specular: 0xffffff, shininess: 100 } );
const mm = new THREE.MeshPhongMaterial( { color: 0x00ff99, flatShading: false, specular: 0xffffff, shininess: 70 } );

const cube = new THREE.Mesh( geometry, material );
const sphs = new THREE.Mesh( sph, mm );
sphs.position.set(2,-2,-2);
scene.add( cube );
scene.add( sphs );

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const lightp = new THREE.PointLight(0xffffff, 10, 0);
lightp.position.set(0, 5, 10);
scene.add(lightp);

// const controls = new OrbitControls(camera, canvas);

function animate( time ) {
    cube.rotation.x = time / 2000;
    cube.rotation.z = time / 1000;
    sphs.position.y = 2*Math.sin(time / 1000);
    sphs.position.x = 2*Math.cos(time / 1000);
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );