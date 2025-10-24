// scene.js
let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('scene-container').appendChild(renderer.domElement);

// cámara inicial
camera.position.set(0, 0, 6);

// LIGHTS
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemi.position.set(0, 1, 0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7);
scene.add(dir);

// OBJETOS placeholders (posicionados a la izquierda para profundidad)
const group = new THREE.Group();
scene.add(group);

// CUBO (ABOUT)
const geoCube = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const matCube = new THREE.MeshStandardMaterial({ color: 0x0077cc, metalness: 0.2, roughness: 0.6 });
const meshCube = new THREE.Mesh(geoCube, matCube);
meshCube.position.set(-2, 0.5, 0);

// CYLINDER (PROJECTS)
const geoCylinder = new THREE.CylinderGeometry(0.6, 0.6, 1.6, 24);
const matCyl = new THREE.MeshStandardMaterial({ color: 0xff6f00, metalness: 0.1, roughness: 0.6 });
const meshCyl = new THREE.Mesh(geoCylinder, matCyl);
meshCyl.position.set(-2, 0.5, 0);
meshCyl.visible = false;

// CONE/TRI (LOOKING)
const geoCone = new THREE.ConeGeometry(0.8, 1.6, 24);
const matCone = new THREE.MeshStandardMaterial({ color: 0xffdd33, metalness: 0.1, roughness: 0.6 });
const meshCone = new THREE.Mesh(geoCone, matCone);
meshCone.position.set(-2, 0.5, 0);
meshCone.visible = false;

// extras para contacto/easter
const geoSmall = new THREE.TorusGeometry(0.6, 0.2, 12, 24);
const matSmall = new THREE.MeshStandardMaterial({ color: 0x55ffdd });
const meshSmall = new THREE.Mesh(geoSmall, matSmall);
meshSmall.position.set(-2, 0.5, 0);
meshSmall.visible = false;

group.add(meshCube, meshCyl, meshCone, meshSmall);

// GRID / suelo sutil
const grid = new THREE.GridHelper(12, 12, 0x004466, 0x002233);
grid.position.y = -1.5;
grid.material.opacity = 0.12;
grid.material.transparent = true;
scene.add(grid);

// Función que anima la cámara y activa el objeto correspondiente
function rotateToSection(sectionId) {
    // visibilidad objetos
    meshCube.visible = meshCyl.visible = meshCone.visible = meshSmall.visible = false;
    let target = { x: 0, y: 0, z: 6, lookAt: new THREE.Vector3(0, 0, 0) };
    let activeObj = null;

    switch (sectionId) {
        case 'about':
            meshCube.visible = true;
            target.y = 0;
            activeObj = meshCube;
            break;
        case 'projects':
            meshCyl.visible = true;
            target.y = Math.PI / 2;
            activeObj = meshCyl;
            break;
        case 'looking':
            meshCone.visible = true;
            target.y = Math.PI;
            activeObj = meshCone;
            break;
        case 'contact':
            meshSmall.visible = true;
            target.y = Math.PI * 1.5;
            activeObj = meshSmall;
            break;
        case 'easter':
            meshCyl.visible = true;
            target.y = Math.PI * 2;
            activeObj = meshCyl;
            break;
        default:
            meshCube.visible = true;
            activeObj = meshCube;
    }

    // animar rotación de cámara (usando GSAP) - duración .8s
    gsap.to(camera.rotation, { y: target.y, duration: 0.8, ease: "power2.inOut" });

    // opcional: mover ligeramente la posición para sensación de "zoom lateral"
    const posTarget = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    gsap.to(posTarget, {
        x: 0,
        y: 0,
        z: 6,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: () => {
            camera.position.set(posTarget.x, posTarget.y, posTarget.z);
            camera.lookAt(0, 0, 0);
        }
    });
}

// ANIMATE LOOP
function animate() {
    requestAnimationFrame(animate);
    // animar rotación suave de objetos visibles
    group.children.forEach(m => {
        if (m.visible) m.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}
animate();

// resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// expose rotateToSection to global scope so hud.js can call it
window.rotateToSection = rotateToSection;

// inicial: mostrar sección por defecto (si querés, podés sincronizar con el HUD)
rotateToSection('about');
