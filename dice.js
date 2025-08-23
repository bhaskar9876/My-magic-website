const THREE = window.THREE;

let scene, camera, renderer, dice, clock;
let forceNumber = null;
let forceArmed = false;
let longPressTimer;
const dot = document.getElementById("dot");

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Dice
  const geometry = new THREE.BoxGeometry(1.5,1.5,1.5);
  const loader = new THREE.TextureLoader();
  const materials = [
    new THREE.MeshPhongMaterial({map: loader.load("faces/1.png")}),
    new THREE.MeshPhongMaterial({map: loader.load("faces/2.png")}),
    new THREE.MeshPhongMaterial({map: loader.load("faces/3.png")}),
    new THREE.MeshPhongMaterial({map: loader.load("faces/4.png")}),
    new THREE.MeshPhongMaterial({map: loader.load("faces/5.png")}),
    new THREE.MeshPhongMaterial({map: loader.load("faces/6.png")}),
  ];
  dice = new THREE.Mesh(geometry, materials);
  scene.add(dice);

  camera.position.z = 4;
  clock = new THREE.Clock();

  // Events
  window.addEventListener("resize", onWindowResize);
  document.body.addEventListener("mousedown", handlePressStart);
  document.body.addEventListener("mouseup", handlePressEnd);
  document.body.addEventListener("touchstart", handlePressStart);
  document.body.addEventListener("touchend", handlePressEnd);

  // Secret tap detection
  let tapCount = 0;
  document.body.addEventListener("click", ()=>{
    tapCount++;
    if(tapCount>=5){
      tapCount=0;
      chooseForceNumber();
    }
    setTimeout(()=>{ tapCount=0; },1000);
  });

  // load saved
  const saved = localStorage.getItem("forceNumber");
  if(saved) forceNumber = parseInt(saved);
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handlePressStart(){
  longPressTimer = setTimeout(()=>{
    forceArmed = true;
    dot.style.display="block";
    setTimeout(()=>{ dot.style.display="none"; },1200);
  },3000);
}
function handlePressEnd(){
  clearTimeout(longPressTimer);
  rollDice();
}

function rollDice(){
  if(forceArmed && forceNumber){
    spinTo(forceNumber);
    forceArmed = false;
  }else{
    const num = Math.floor(Math.random()*6)+1;
    spinTo(num);
  }
}

function spinTo(num){
  // random spin before final stop
  const randomX = Math.random()*4 + Math.PI*4;
  const randomY = Math.random()*4 + Math.PI*4;
  const randomZ = Math.random()*2 + Math.PI*2;
  let targetRotation = {x: randomX, y: randomY, z: randomZ};

  // adjust so that final face matches num
  switch(num){
    case 1: targetRotation.x += 0; targetRotation.y += 0; break;
    case 2: targetRotation.x += Math.PI/2; break;
    case 3: targetRotation.y -= Math.PI/2; break;
    case 4: targetRotation.y += Math.PI/2; break;
    case 5: targetRotation.x -= Math.PI/2; break;
    case 6: targetRotation.x += Math.PI; break;
  }

  // animate
  let duration = 1000;
  let start = performance.now();
  (function animateSpin(time){
    let t = Math.min((time-start)/duration,1);
    dice.rotation.x = t*targetRotation.x;
    dice.rotation.y = t*targetRotation.y;
    dice.rotation.z = t*targetRotation.z;
    renderer.render(scene,camera);
    if(t<1) requestAnimationFrame(animateSpin);
  })();
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}

function chooseForceNumber(){
  const choice = prompt("Fix number (1-6)?");
  if(choice>=1 && choice<=6){
    forceNumber = parseInt(choice);
    localStorage.setItem("forceNumber", forceNumber);
    alert("Fixed number saved: "+forceNumber);
  }
}
