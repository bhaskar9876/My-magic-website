let scene, camera, renderer;
let world, diceBody, diceMesh;
let tapCount=0, tapTimeout, fixedNumber=null, fixedActive=false;
let pressTimer;
let isDragging=false, previousX=0;

// === Dice Mesh ===
function createDiceMesh(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    const faceMaterials = [];

    for(let i=1;i<=6;i++){
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,256,256);
        ctx.fillStyle = '#000000';

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

    const dice = new THREE.Mesh(geometry, faceMaterials);
    dice.position.set(0,1,0);
    return dice;
}

// === Three.js Init ===
function initThree(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,3,7);
    camera.lookAt(0,0,0);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff,1);
    scene.add(light);

    diceMesh = createDiceMesh();
    scene.add(diceMesh);

    animate();
}

// === Physics Init ===
function initPhysics(){
    world = new CANNON.World();
    world.gravity.set(0,-9.82,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    const shape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    diceBody = new CANNON.Body({mass:1, shape:shape, position:new CANNON.Vec3(0,1,0), angularDamping:0.1});
    world.addBody(diceBody);

    const ground = new CANNON.Body({mass:0});
    ground.addShape(new CANNON.Plane());
    ground.quaternion.setFromEuler(-Math.PI/2,0,0);
    ground.position.y = 0;
    world.addBody(ground);
}

// === Animate ===
function animate(){
    requestAnimationFrame(animate);
    world.step(1/60);
    diceMesh.position.copy(diceBody.position);
    diceMesh.quaternion.copy(diceBody.quaternion);
    renderer.render(scene, camera);
    detectResult();
}

// === Roll Dice ===
function rollDice(){
    if(fixedActive && fixedNumber){
        const rot = getRotationForNumber(fixedNumber);
        diceBody.position.set(0,1,0);
        diceBody.velocity.set(0,2,0);
        diceBody.angularVelocity.set(0,1,0);
        diceBody.quaternion.setFromEuler(rot.x, rot.y, rot.z);
    } else {
        diceBody.position.set(0,1,0);
        diceBody.velocity.set((Math.random()-0.5)*5,5,(Math.random()-0.5)*5);
        diceBody.angularVelocity.set((Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*10);
    }
}

// === Fixed number rotations ===
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

// === 5-tap to set number ===
document.body.addEventListener('click',()=>{
    tapCount++;
    clearTimeout(tapTimeout);
    tapTimeout=setTimeout(()=>{tapCount=0},1000);
    if(tapCount===5){
        tapCount=0;
        let num=prompt("Enter fixed number 1-6");
        if(num>=1 && num<=6) fixedNumber=parseInt(num);
        alert("Fixed number set!");
    }
});

// === 3-sec press ===
document.body.addEventListener('mousedown',()=>{
    pressTimer=setTimeout(()=>{
        fixedActive=true;
        document.getElementById('indicator').style.display='block';
        rollDice();
    },3000);
});
document.body.addEventListener('mouseup',()=>{clearTimeout(pressTimer);});

// === Drag rotation ===
document.body.addEventListener('mousedown',(e)=>{isDragging=true; previousX=e.clientX;});
document.body.addEventListener('mouseup',()=>{isDragging=false;});
document.body.addEventListener('mousemove',(e)=>{
    if(isDragging){
        const delta = e.clientX-previousX;
        diceBody.angularVelocity.y += delta*0.05;
        previousX=e.clientX;
    }
});

// === Detect dice result ===
let lastResult=null;
function detectResult(){
    if(diceBody.velocity.length()<0.1 && diceBody.angularVelocity.length()<0.1){
        const upVec = new CANNON.Vec3(0,1,0);
        let maxDot=-1, result=1;
        const faceNormals = [
            new CANNON.Vec3(0,0,1),   // 1
            new CANNON.Vec3(0,0,-1),  // 2
            new CANNON.Vec3(1,0,0),   // 3
            new CANNON.Vec3(-1,0,0),  // 4
            new CANNON.Vec3(0,1,0),   // 5
            new CANNON.Vec3(0,-1,0)   // 6
        ];
        for(let i=0;i<6;i++){
            const worldNormal = diceBody.quaternion.vmult(faceNormals[i]);
            const dot = worldNormal.dot(upVec);
            if(dot>maxDot){maxDot=dot; result=i+1;}
        }
        if(result!==lastResult){
            lastResult=result;
            console.log("Dice Result:",result);
            // Optional: trigger callback here
        }
    }
}

// === Resize ===
window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Init ===
initThree();
initPhysics();
rollDice();
