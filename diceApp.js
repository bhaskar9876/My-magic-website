// === Variables ===
let scene, camera, renderer;
let world, diceBody, diceMesh;
let tapCount=0, tapTimeout, fixedNumber=null, fixedActive=false;
let pressTimer;
let isDragging=false, previousX=0;

// === Create dice mesh with geometric dots ===
function createDiceMesh(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    const faceMaterials = [];

    for(let i=1;i<=6;i++){
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // White face
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#000000';

        // Dot positions
        const dots = {
            1:[[128,128]],
            2:[[64,64],[192,192]],
            3:[[64,64],[128,128],[192,192]],
            4:[[64,64],[192,64],[64,192],[192,192]],
            5:[[64,64],[192,64],[128,128],[64,192],[192,192]],
            6:[[64,64],[192,64],[64,192],[192,192],[64,128],[192,128]]
        };

        dots[i].forEach(p=>{
            ctx.beginPath();
            ctx.arc(p[0],p[1],16,0,Math.PI*2);
            ctx.fill();
        });

        const tex = new THREE.CanvasTexture(canvas);
        faceMaterials.push(new THREE.MeshBasicMaterial({map:tex}));
    }

    return new THREE.Mesh(geometry, faceMaterials);
}

// === Initialize Three.js ===
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,3,5);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff,1);
    scene.add(ambient);

    diceMesh = createDiceMesh();
    scene.add(diceMesh);

    animate();
}

// === Initialize Physics ===
function initPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    const shape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    diceBody = new CANNON.Body({ mass:1, shape:shape, position:new CANNON.Vec3(0,2,0), angularDamping:0.1 });
    world.addBody(diceBody);

    const ground = new CANNON.Body({mass:0});
    const groundShape = new CANNON.Plane();
    ground.addShape(groundShape);
    ground.position.y= -1;
    world.addBody(ground);
}

// === Animate Loop ===
function animate(){
    requestAnimationFrame(animate);
    world.step(1/60);
    diceMesh.position.copy(diceBody.position);
    diceMesh.quaternion.copy(diceBody.quaternion);
    renderer.render(scene, camera);
}

// === Dice Roll ===
function rollDice() {
    if(fixedActive && fixedNumber){
        const rot = getRotationForNumber(fixedNumber);
        diceBody.quaternion.setFromEuler(rot.x, rot.y, rot.z);
        diceBody.velocity.set(0,0,0);
        diceBody.angularVelocity.set(0,0,0);
    } else {
        diceBody.position.set(0,2,0);
        diceBody.velocity.set((Math.random()-0.5)*5,5,(Math.random()-0.5)*5);
        diceBody.angularVelocity.set((Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*10);
    }
}

// === Number to Rotation ===
function getRotationForNumber(num){
    const mapping = {
        1:{x:0, y:0, z:0},
        2:{x:Math.PI/2, y:0, z:0},
        3:{x:0, y:0, z:Math.PI/2},
        4:{x:0, y:0, z:-Math.PI/2},
        5:{x:-Math.PI/2, y:0, z:0},
        6:{x:Math.PI, y:0, z:0}
    };
    return mapping[num];
}

// === 5-Tap Fix Number ===
document.body.addEventListener('click', ()=>{
    tapCount++;
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(()=>{tapCount=0},1000);
    if(tapCount===5){
        tapCount=0;
        let num = prompt("Select fixed number 1-6");
        if(num>=1 && num<=6) fixedNumber=parseInt(num);
        alert("Fixed number set!");
    }
});

// === 3-sec Press Activate Fixed ===
document.body.addEventListener('mousedown', ()=>{
    pressTimer = setTimeout(()=>{
        fixedActive=true;
        document.getElementById('indicator').style.display='block';
        rollDice();
    },3000);
});
document.body.addEventListener('mouseup', ()=>{clearTimeout(pressTimer);});

// === Drag Rotation ===
document.body.addEventListener('mousedown',(e)=>{isDragging=true; previousX=e.clientX;});
document.body.addEventListener('mouseup',()=>{isDragging=false;});
document.body.addEventListener('mousemove',(e)=>{
    if(isDragging){
        const delta = e.clientX-previousX;
        diceBody.angularVelocity.y += delta*0.05;
        previousX=e.clientX;
    }
});

// === Resize Handling ===
window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Init App ===
initThree();
initPhysics();
rollDice();
