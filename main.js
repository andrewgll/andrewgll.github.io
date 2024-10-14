import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(0,3,5)
let clock = new THREE.Clock();

let targetLookAt = new THREE.Vector3(); 
window.addEventListener('click', onClick, false);
function onClick(event) {
  const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      - (event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
      const clickedObject = intersects[0].object;

      targetLookAt.copy(clickedObject.position);

      moveCameraTo(targetPoint);
  }
}

function moveCameraTo(targetPosition) {
  camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z - 0.2);
}

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  // powerPreference: "high-performance",
})
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.002; 
composer.addPass(rgbShiftPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio), 
  0.5,   // Strength of the bloom
  2,   // Radius of the bloom effect
  0.2   // Bloom threshold
);
composer.addPass(bloomPass);


const sun = new THREE.DirectionalLight(0xf5fae3, 1.5)
sun.position.set(1,50,20)


const ambientLight = new THREE.AmbientLight(0xc0adff, 1)
scene.add(sun, ambientLight)

const loader = new GLTFLoader()
let mixer
loader.load(
  './models/model.glb', 
  function (gltf) {
    gltf.scene.position.set(-1,-1.45,0)
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;  
        action.play();                   
      });
    }
    scene.add(gltf.scene)
  },
  undefined,
  function (error) {
    console.error('An error happened', error)
  }
);

let stars = [] 
const windDirection = new THREE.Vector3(0.01, 0.02, -1.5)
const starGeometry = new THREE.IcosahedronGeometry(0.5)
const thresholdDistance = 500
const maxTrailLength = 8
function addStar(){
  const colors = [
    new THREE.Color(1, 1, 0.5), // Yellowish
    new THREE.Color(1, 0.2, 0),   // Red
    new THREE.Color(0.2, 0.5, 0.8),   // Blue
    new THREE.Color(1, 1, 1)    // White
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,   
    emissive: randomColor,
    emissiveIntensity: 20  
  });
  const star = new THREE.Mesh(starGeometry, starMaterial)
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(600))
  star.position.set(x, y, z)
  const randomVelocity = new THREE.Vector3(
    THREE.MathUtils.randFloat(-0.005, 0.005), 
    THREE.MathUtils.randFloat(-0.005, 0.005), 
    THREE.MathUtils.randFloat(-0.005, 0.005)  
  )
  star.velocity = windDirection.clone().add(randomVelocity)

  star.trail =[] 
  const trailGeometry = new THREE.BufferGeometry();
  // trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(maxTrailLength * 3), 3));
  
  const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffffff,    
    color: randomColor, transparent: true });
  star.trailMesh = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(star.trailMesh);

  // Add star to the scene and stars array
  scene.add(star);
  stars.push(star);
}

Array(1000).fill().forEach(addStar)

let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const movementArea = 1;  
const smoothingFactor = 0.05;  

function updateStarTrail(star) {
  const trail = star.trail;
  trail.push(star.position.clone());
  if (trail.length > 30) {
    trail.shift();  
  }
  const positions = new Float32Array(star.trail.flatMap(p => [p.x, p.y, p.z]));
  star.trailMesh.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  star.trailMesh.geometry.attributes.position.needsUpdate = true;
}
document.addEventListener('mousemove', (event) => {
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
});

function animate() {
  
  // camera
  targetX = THREE.MathUtils.clamp(mouseX * movementArea, -movementArea, movementArea);
  targetY = THREE.MathUtils.clamp(mouseY * movementArea, -movementArea, movementArea);
  camera.position.x += (targetX - camera.position.x) * smoothingFactor;
  camera.position.y += (targetY - camera.position.y) * smoothingFactor;
  camera.lookAt(targetLookAt);

  // animations
  if (mixer) {
    const delta = clock.getDelta(); 
    mixer.update(delta);            
  }


  stars.forEach(star => {

    star.position.add(star.velocity);
    updateStarTrail(star);
    const distanceFromCamera = star.position.distanceTo(camera.position);
    if (distanceFromCamera > thresholdDistance) {
      
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(500));
      star.position.set(x, y, camera.position.z + 50);
      star.trail.length = 0;
    }
  });

  
  composer.render(scene, camera)
}
