// === scene.js ===

// --- Escena y cámara ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.03);

let currentAngle = 0;
let targetAngle = 0;
let zoomLevel = 6;


const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

// --- Renderizador ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("scene-container").appendChild(renderer.domElement);

// --- Luces ---
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333, 0.7);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- Grupo principal ---
const group = new THREE.Group();
scene.add(group);

// --- Objetos placeholder (uno por sección) ---
const materialBase = new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.4 });

const meshCube = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), materialBase.clone());
meshCube.material.color.set(0x0077cc);

const meshCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 24), materialBase.clone());
meshCyl.material.color.set(0xff6f00);

const meshCone = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.6, 24), materialBase.clone());
meshCone.material.color.set(0xffdd33);

const meshTorus = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.2, 12, 24), materialBase.clone());
meshTorus.material.color.set(0x55ffdd);

group.add(meshCube, meshCyl, meshCone, meshTorus);

// --- Posiciones iniciales ---
meshCube.visible = true;
meshCyl.visible = meshCone.visible = meshTorus.visible = false;

// --- Grid de referencia ---
const grid = new THREE.GridHelper(12, 12, 0x004466, 0x002233);
grid.position.y = -1.5;
grid.material.opacity = 0.12;
grid.material.transparent = true;
scene.add(grid);

function rotateToSection(sectionId) {
    // Ocultar todos los objetos
    meshCube.visible = meshCyl.visible = meshCone.visible = meshTorus.visible = false;

    // Determinar objeto visible y ángulo objetivo
    switch (sectionId) {
        case "about": meshCube.visible = true; targetAngle = 0; break;
        case "projects": meshCyl.visible = true; targetAngle = Math.PI / 2; break;
        case "looking": meshCone.visible = true; targetAngle = Math.PI; break;
        case "contact": meshTorus.visible = true; targetAngle = Math.PI * 1.5; break;
        case "easter": meshCyl.visible = true; targetAngle = Math.PI * 2; break;
    }

    // Suavizar el movimiento del zoom (efecto in/out)
    gsap.fromTo(
        { zoom: 6.5 },
        {
            zoom: 6,
            duration: 1.8,
            ease: "power2.inOut",
            onUpdate: function () {
                zoomLevel = this.targets()[0].zoom;
            }
        }
    );
}


// --- Animación loop ---
function animate() {
    requestAnimationFrame(animate);

    // Suavizar la rotación real en cada frame
    currentAngle += (targetAngle - currentAngle) * 0.08;

    // Aplicar posición de cámara con interpolación continua
    camera.position.x = zoomLevel * Math.sin(currentAngle);
    camera.position.z = zoomLevel * Math.cos(currentAngle);
    camera.lookAt(0, 0, 0);

    // Rotación sutil del objeto activo
    [meshCube, meshCyl, meshCone, meshTorus].forEach((m) => {
        if (m.visible) m.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

animate();

// --- Resize handler ---
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Exponer globalmente para hud.js ---
window.rotateToSection = rotateToSection;

// --- Efecto de aparición inicial ---
gsap.from("#scene-container", { opacity: 0, duration: 1.2 });
gsap.from(".hud", { opacity: 0, y: -30, duration: 1, delay: 0.3 });
gsap.from(".sections", { opacity: 0, duration: 1.2, delay: 0.8 });
