import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { gsap } from 'gsap';


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
console.log(isMobile)
if(isMobile){
  camera.position.set(0,10,5)
}
else{
  camera.position.set(200,10,5)
}
let clock = new THREE.Clock();


const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.load([
  'bgbg2.png',
  'bgbg2.png',
  'bgbg2.png',
  'bgbg2.png',
  'bgbg2.png',
  'bgbg.png'
]);

scene.background = cubeTexture;

let targetLookAt = new THREE.Vector3(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  
})
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate)

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.002; 
composer.addPass(rgbShiftPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 
  0.3,   
  0.8,     
  0.2
);
composer.addPass(bloomPass);


const sun = new THREE.DirectionalLight(0xf5fae3, 1.5)
sun.position.set(1,50,20)


const ambientLight = new THREE.AmbientLight(0xf7e6cd, 1)
scene.add(sun, ambientLight)

const loader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader(); 
let monitorMesh;
let pc_button1_mesh
let pc_button2_mesh
let red_button1_mesh
let red_button2_mesh
let clicker_mesh
let exit_mesh
let page1_mesh
let page2_mesh
let page3_mesh
let page4_mesh
let mixer

let screen_material = new THREE.MeshStandardMaterial({
  roughness: 0.8, // Adjust as necessary
  // metalness: 0.5,  // Adjust as necessary
  emissive: new THREE.Color(0x012e0b), // Set emissive color (white glow)
  emissiveIntensity: 1
});

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
    gltf.scene.traverse((child) => {
      if (child.name === 'screen') {
          monitorMesh = child;
      }
      else if (child.name == "clicker") {
        clicker_mesh = child
      }
      else if (child.name == 'pc_button1'){
        pc_button1_mesh = child
        pc_button1_mesh.material = new THREE.MeshStandardMaterial({
          color: 0xffff00, // Yellow
          emissive: 0xffff00, // Yellow emission
          emissiveIntensity: 2, // Adjust intensity as needed
          roughness: 0.5,
          metalness: 0.5
        });
      }
      else if (child.name == 'pc_button2'){
        pc_button2_mesh = child
        pc_button2_mesh.material = new THREE.MeshStandardMaterial({
          color: 0xffff00, // Yellow
          emissive: 0xffff00, // Yellow emission
          emissiveIntensity: 2, // Adjust intensity as needed
          roughness: 0.5,
          metalness: 0.5
        });
      }
      else if (child.name == 'red_button1'){
        red_button1_mesh = child
        red_button1_mesh.material = new THREE.MeshStandardMaterial({
          color: 0xff0000, // Red
          emissive: 0xff0000, // Red emission
          emissiveIntensity: 10, // Adjust intensity as needed
          roughness: 0.5,
          metalness: 0.5
        });
      }
      else if (child.name == 'red_button2'){
        red_button2_mesh = child
        red_button2_mesh.material = new THREE.MeshStandardMaterial({
          color: 0xff0000, // Red
          emissive: 0xff0000, // Red emission
          emissiveIntensity: 10, // Adjust intensity as needed
          roughness: 0.5,
          metalness: 0.5
        });
      }
      else if (child.name == 'exit'){
        exit_mesh = child
     
      }
      else if (child.name == 'page1'){
        page1_mesh = child
      }
      else if (child.name == 'page2'){
        page2_mesh = child
      }
      else if (child.name == 'page3'){
        page3_mesh = child
      }
      else if (child.name == 'page4'){
        page4_mesh = child
      }
    });
    const textureUrl = 'windows.png';
    textureLoader.load(textureUrl, (texture) => {
      screen_material.map = texture
      if (monitorMesh) {
        
          monitorMesh.material = screen_material;
          monitorMesh.material.needsUpdate = true;
      }
    });
    scene.add(gltf.scene)
  },
  undefined,
  function (error) {
    console.error('An error happened', error)
  }
);

let stars = [] 
const windDirection = new THREE.Vector3(0.01, 0.02, -0.5)
const starGeometry = new THREE.ConeGeometry(0.1, 15, 4); 

const thresholdDistance = 300
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

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(400))
  star.position.set(x, y, z)
  star.rotation.x = Math.PI / 2;
  const randomVelocity = new THREE.Vector3(
    THREE.MathUtils.randFloat(-0.005, 0.005), 
    THREE.MathUtils.randFloat(-0.005, 0.005), 
    THREE.MathUtils.randFloat(-0.005, 0.005)  
  )
  star.velocity = windDirection.clone().add(randomVelocity)

  scene.add(star);
  stars.push(star);
}

Array(500).fill().forEach(addStar)

let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const movementArea = 1;  
const smoothingFactor = 0.05;  

document.addEventListener('mousemove', (event) => {
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
});


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isCameraLocked = false; 

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    if ((clickedObject === monitorMesh || clickedObject == clicker_mesh) && !isCameraLocked ) {
      const box = new THREE.Box3().setFromObject(monitorMesh);
      const targetPosition = box.getCenter(new THREE.Vector3());
      const distance = 1.2; 
      const newCameraPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, distance));

      isCameraLocked = true;
      const loadingFrames = [
        'loading1.png',
        'loading2.png',
        'loading3.png',
      ];

      const finalTextureUrl = 'page1.png';
      
      let currentFrame = 0;
      const loadingInterval = setInterval(() => {
        textureLoader.load(loadingFrames[currentFrame], (texture) => {
          screen_material.map = texture;
          if (monitorMesh) {
            monitorMesh.material = screen_material;
            monitorMesh.material.needsUpdate = true;
          }
        });

        currentFrame++;
        if (currentFrame >= loadingFrames.length) {
          clearInterval(loadingInterval);

          setTimeout(() => {
            textureLoader.load(finalTextureUrl, (texture) => {
              screen_material.map = texture;
              if (monitorMesh) {
                monitorMesh.material = screen_material;
                monitorMesh.material.needsUpdate = true;
              }
            });
          }, 250); 
        }
      }, 1000);
      gsap.to(camera.position, {
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
        duration: 1,
        onUpdate: () => {
          // Make the camera look at the targetPosition during the transition
        },
        onComplete: () => {
          camera.lookAt(targetPosition);
        }
      });
    }
    else if (clickedObject === exit_mesh && isCameraLocked) {
      const defaultTextureUrl = 'windows.png'; 
      textureLoader.load(defaultTextureUrl, (texture) => {
          screen_material.map = texture;
          if (monitorMesh) {
              monitorMesh.material = screen_material;
              monitorMesh.material.needsUpdate = true;
          }
      });

      gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: 5,
          duration: 1,
          onComplete: () => {
             isCameraLocked = false;
          }
      });
    }
    else if (clickedObject === page1_mesh && isCameraLocked) {
      const defaultTextureUrl = 'page1.png'; 
      textureLoader.load(defaultTextureUrl, (texture) => {
          screen_material.map = texture;
          if (monitorMesh) {
              monitorMesh.material = screen_material;
              monitorMesh.material.needsUpdate = true;
          }
      });
    }
    else if (clickedObject === page2_mesh && isCameraLocked) {
      const defaultTextureUrl = 'page2.png'; 
      textureLoader.load(defaultTextureUrl, (texture) => {
          screen_material.map = texture;
          if (monitorMesh) {
              monitorMesh.material = screen_material;
              monitorMesh.material.needsUpdate = true;
          }
      });
    }
    else if (clickedObject === page3_mesh && isCameraLocked) {
      const defaultTextureUrl = 'page3.png'; 
      textureLoader.load(defaultTextureUrl, (texture) => {
          screen_material.map = texture;
          if (monitorMesh) {
              monitorMesh.material = screen_material;
              monitorMesh.material.needsUpdate = true;
          }
      });
    }
    else if (clickedObject === page4_mesh && isCameraLocked) {
      const defaultTextureUrl = 'page4.png'; 
      textureLoader.load(defaultTextureUrl, (texture) => {
          screen_material.map = texture;
          if (monitorMesh) {
              monitorMesh.material = screen_material;
              monitorMesh.material.needsUpdate = true;
          }
      });
    }
  }
}

window.addEventListener('click', onMouseClick, false);

let blinkTimers = [0, 0,0,0]; // Timer for each button
let blinkIntervals = [getRandomBlinkInterval(0.5,1.5), getRandomBlinkInterval(0.1,2), getRandomBlinkInterval(0.5,5), 1]; // Random intervals for each button
let blinkingStates = [false, false, false, false]; // Blinking state for each button

function getRandomBlinkInterval(first, second) {
  return Math.random() * (first - second) + second; // Random interval between 0.5 and 1.5 seconds
}

function animate() {
  const delta = clock.getDelta(); // Get delta time

  // Update blink timers for both buttons
  blinkTimers[0] += delta;
  blinkTimers[1] += delta;
  blinkTimers[2] += delta;
  if(!blinkingStates[3]) {
    blinkTimers[3] += delta/9;
  }
  else{
    blinkTimers[3] += delta;
  }

  // Check and update blinking state for red_button1
  if (blinkTimers[0] > blinkIntervals[0]) {
    blinkingStates[0] = !blinkingStates[0]; // Toggle state
    blinkTimers[0] = 0; // Reset timer
    blinkIntervals[0] = getRandomBlinkInterval(0.5,1.5); // Get a new random interval
  }

  // Check and update blinking state for red_button2
  if (blinkTimers[1] > blinkIntervals[1]) {
    blinkingStates[1] = !blinkingStates[1]; // Toggle state
    blinkTimers[1] = 0; // Reset timer
    blinkIntervals[1] = getRandomBlinkInterval(0.5,1.5); // Get a new random interval
  }
  if (blinkTimers[2] > blinkIntervals[2]) {
    blinkingStates[2] = !blinkingStates[2]; // Toggle state
    blinkTimers[2] = 0; // Reset timer
    blinkIntervals[2] = getRandomBlinkInterval(1,1.5); // Get a new random interval
  }

  if (blinkTimers[3] > blinkIntervals[3]) {
    blinkingStates[3] = !blinkingStates[3]; // Toggle state
    blinkTimers[3] = 0; // Reset timer
    blinkIntervals[3] = 1 // Get a new random interval
  }

  // Set emissive intensity based on blinking state
  if (red_button1_mesh) {
    red_button1_mesh.material.emissiveIntensity = blinkingStates[0] ? Math.random() : 0;
  }
  if (red_button2_mesh) {
    red_button2_mesh.material.emissiveIntensity = blinkingStates[1] ? Math.random() : 0;
  }
  if (pc_button1_mesh) {
    pc_button1_mesh.material.emissiveIntensity = blinkingStates[2] ? Math.random() : 0;
  }
  if (pc_button2_mesh) {
    pc_button2_mesh.material.emissiveIntensity = blinkingStates[3] ? Math.random() : 0;
  }
  if (monitorMesh) {
    monitorMesh.material.emissiveIntensity = blinkingStates[3] ? Math.random()+0.5 : 3.5
  }
  
  if (!isCameraLocked) {
    camera.lookAt(targetLookAt);
    targetX = THREE.MathUtils.clamp(mouseX * movementArea, -movementArea, movementArea);
    targetY = THREE.MathUtils.clamp(mouseY * movementArea, -movementArea, movementArea);
    camera.position.x += (targetX - camera.position.x) * smoothingFactor;
    camera.position.y += (targetY - camera.position.y) * smoothingFactor;
  }

  if (mixer) {
    mixer.update(delta);
  }

  stars.forEach(star => {
    star.position.add(star.velocity);
    const distanceFromCamera = star.position.distanceTo(camera.position);
    if (distanceFromCamera > thresholdDistance) {
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(500));
      star.position.set(x, y, camera.position.z + 50);
    }
  });
  composer.render(scene, camera)
}