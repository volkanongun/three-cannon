import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'

import starsTexture from '../img/stars.jpg';
import { Vec3 } from 'cannon-es';

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10,10,10);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const world = new CANNON.World({
    gravity : new Vec3(0, -9.81, 0)
})

const boxGeo = new THREE.BoxGeometry(2,2,2)
const boxMat = new THREE.MeshBasicMaterial({
    color:0xFFDD00,
    wireframe: true
})
const boxMesh = new THREE.Mesh(boxGeo, boxMat)
scene.add(boxMesh)

const groundGeo = new THREE.PlaneGeometry(30,30)
const groundMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true,
    side: THREE.DoubleSide
})
const groundMesh = new THREE.Mesh(groundGeo, groundMat)
scene.add(groundMesh)

const sphereGeo = new THREE.SphereGeometry(2,32,16)
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xFF00CC,
    wireframe: true,
})
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphereMesh)

const boxBodyPhysMat = new CANNON.Material() 

const boxBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    position: new CANNON.Vec3(1, 10, 0),
    material: boxBodyPhysMat
})
world.addBody(boxBody)

boxBody.angularVelocity.set(0, 10, 0)
boxBody.angularDamping = .5

const sphereBodyPhysMay = new CANNON.Material()
const sphereBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(2),
    position: new CANNON.Vec3(3, 5, 0),
    material: sphereBodyPhysMay
})
world.addBody(sphereBody)

sphereBody.linearDamping = .31 // simulates air friction

const groundBodyPhysMat = new CANNON.Material()

const groundBody = new CANNON.Body({
    // shape: new CANNON.Plane(), // this is infinite
    shape: new CANNON.Box(new CANNON.Vec3(15,15,.1)),
    type: CANNON.Body.STATIC,
    material: groundBodyPhysMat
})
world.addBody(groundBody)
groundBody.quaternion.setFromEuler(-Math.PI / 2,0,0)

const timeStep = 1 / 60

const groundBoxContactMaterial = new CANNON.ContactMaterial(groundBodyPhysMat, boxBodyPhysMat, {
    friction: 0
})

const sphereContactMaterial = new CANNON.ContactMaterial(groundBodyPhysMat, sphereBodyPhysMay, {
    restitution: .9
})

world.addContactMaterial(groundBoxContactMaterial)
world.addContactMaterial(sphereContactMaterial)

function animate() {
    world.step(timeStep)

    groundMesh.position.copy(groundBody.position)
    groundMesh.quaternion.copy(groundBody.quaternion)

    boxMesh.position.copy(boxBody.position)
    boxMesh.quaternion.copy(boxBody.quaternion)

    sphereMesh.position.copy(sphereBody.position)
    sphereMesh.quaternion.copy(sphereBody.quaternion)

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});