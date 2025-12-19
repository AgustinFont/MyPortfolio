// === scene.js (ESM) ===
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Escena y cámara ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a15, 0.03);

let currentAngle = 0;
let targetAngle = 0;
let zoomLevel = 7;
let idleOffset = 0;
let isDraggingModel = false;
let dragStartX = 0;
let dragStartRotationY = 0;
let dragTargetRotationY = 0;
let baseModelRotationY = 0; // rotación base para volver suave

// Ajustar FOV según el dispositivo
const isMobile = window.innerWidth < 768;
const fov = isMobile ? 70 : 60;

const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, zoomLevel);
camera.lookAt(0, 0, 0);

// Flag para desactivar la interacción avanzada del juego (debug)
const INTERACTIVE_ENABLED = false;

// Clock para normalizar velocidad de animación independiente del FPS (definir antes de initScene)
const clock = new THREE.Clock();

// --- Variables para modelos 3D --- (mover arriba para evitar TDZ en animate)
let characterModel = null;
let characterMixer = null; // Para animaciones
let characterAnimationAction = null;

// --- Renderizador ---
let renderer = null;

function initRenderer() {
    if (renderer) return; // Ya inicializado
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x0a0a15, 1);
    
    const sceneContainer = document.getElementById("scene-container");
    if (sceneContainer) {
        sceneContainer.appendChild(renderer.domElement);
    } else {
        console.error("scene-container not found!");
    }
}

// Inicializar renderer cuando el DOM esté listo
function initScene() {
    initRenderer();
    // Iniciar loop de animación solo después de que el renderer esté listo
    if (renderer) {
        animate();
    }
}

// Esperar a que termine la evaluación del módulo y el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initScene, 0);
    });
} else {
    setTimeout(initScene, 0);
}

// --- Luces ---
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333, 0.8);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x404040, 0.7));

// --- Grupo principal ---
const group = new THREE.Group();
group.position.set(-1.2, 0, -7.5); // alejamos más de la cámara para apreciarlo mejor
scene.add(group);

// Grupo para modelos (solo character) rotará como un conjunto
const modelsGroup = new THREE.Group();
modelsGroup.position.set(0, 0, 0);
group.add(modelsGroup);

// --- Cargador GLTF ---
const loader = new GLTFLoader();

// --- Cargar modelos ---
function loadModels() {
    if (!loader) {
        console.warn('GLTFLoader no disponible, saltando carga de modelos');
        return;
    }
    
    // Cargar character (único modelo characterSand)
    loader.load(
        'models/characterSand.glb',
        (gltf) => {
            characterModel = gltf.scene;
            characterModel.scale.set(0.6, 0.6, 0.6); // un poco más compacto
            
            if (gltf.animations && gltf.animations.length > 0) {
                characterMixer = new THREE.AnimationMixer(characterModel);
                characterAnimationAction = characterMixer.clipAction(gltf.animations[0]);
                characterAnimationAction.play();
                console.log('Animación idle encontrada y reproduciendo');
            }
            
            // Posicionar y orientar para la sección Projects
            characterModel.position.set(-8, -0.2, 10);; // mover a la izquierda y un poco adelante
            characterModel.rotation.y = -Math.PI * 0.3; // rotar 3/4 de vuelta hacia la izquierda
            baseModelRotationY = characterModel.rotation.y;
            characterModel.visible = false;

            // Glow suave en ojos (amarillo tenue)
            const eyeGlowColor = new THREE.Color(0xffd966);
            characterModel.traverse((child) => {
                if (!child.isMesh) return;
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat) => {
                    if (!mat) return;
                    const name = (mat.name || child.name || "").toLowerCase();
                    if (name.includes('eye')) {
                        if (!mat.emissive) mat.emissive = new THREE.Color();
                        mat.emissive.copy(eyeGlowColor);
                        mat.emissiveIntensity = 0.6;
                    }
                });
            });

            modelsGroup.add(characterModel);

            // Exponer para ajustes desde consola (debug)
            window.characterModel = characterModel;
            window.modelsGroup = modelsGroup;
            console.log('Character cargado');
        },
        (progress) => {
            if (progress.total > 0) {
                console.log('Cargando character:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
            }
        },
        (error) => {
            console.error('Error cargando character:', error);
        }
    );
}

// Cargar modelos apenas esté disponible el loader
loadModels();

// Helper para ocultar el modelo
function hideAllObjects() {
    if (characterModel) characterModel.visible = false;
    modelsGroup.visible = false;
}

// --- Placeholders desactivados (dummy para evitar referencias) ---
const cubeState = {
    isLaunched: false,
    velocity: new THREE.Vector3(),
    basePosition: new THREE.Vector3(),
    friction: 0.98,
    isCharging: false,
    chargeStartPos: null,
    chargeCurrentPos: null,
    chargePower: 0,
    maxChargePower: 3.0,
    returnSpeed: 0.15,
    isReturning: false
};

const makeDummyMesh = () => {
    const obj = new THREE.Object3D();
    obj.material = { emissive: { setHex: () => {} }, emissiveIntensity: 0 };
    obj.scale = { setScalar: () => {} };
    obj.visible = false;
    return obj;
};

const meshCube = makeDummyMesh();
const meshCyl = makeDummyMesh();
const meshCone = makeDummyMesh();
const meshTorus = makeDummyMesh();

// Placeholders para sistemas eliminados
const cubeParticles = [];
const cubeParticlePool = [];
const targets = [];
function createCubeParticle() { return null; }
function createTarget() {}
function checkTargetCollision() { return false; }
function startCubeCharge() { return false; }
function launchCube() {}

// --- Grid + entorno visual (interactivo) ---
const gridSize = 12;
const gridDivisions = 12;
const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x336699, 0x224466);
grid.position.y = -1.5;
grid.material.opacity = 0.15;
grid.material.transparent = true;
scene.add(grid);

// Sistema de ondas deshabilitado temporalmente (debug): mantenemos solo GridHelper básico
const wavePoints = [];
const maxWaves = 0;
const waveDecay = 0;
const waveSpeed = 0;

const envGeo = new THREE.BoxGeometry(20, 20, 20);
const envMat = new THREE.MeshBasicMaterial({
    color: 0x113366,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
});
const envCube = new THREE.Mesh(envGeo, envMat);
scene.add(envCube);

// --- Partículas flotantes (optimizado para móviles) ---
const particlesGeo = new THREE.BufferGeometry();
const particleCount = isMobile ? 100 : 200; // Menos partículas en móviles
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMat = new THREE.PointsMaterial({
    color: 0x88ccff,
    size: isMobile ? 0.04 : 0.05,
    transparent: true,
    opacity: 0.5
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// --- Cámara idle (ligero movimiento) ---
gsap.to(camera.position, {
    y: "+=0.2",
    duration: 3,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
});

// --- Transición de secciones ---
function rotateToSection(sectionId) {
    hideAllObjects();
    
    // Determinar objeto visible y ángulo objetivo
    switch (sectionId) {
        case "about": 
            targetAngle = 0; 
            break;
        case "projects": 
            // Mostrar modelo único
            if (characterModel) {
                characterModel.visible = true;
                modelsGroup.visible = true;
            }
            targetAngle = Math.PI / 2; 
            break;
        case "looking": 
            targetAngle = Math.PI; 
            break;
        case "contact": 
            targetAngle = Math.PI * 1.5; 
            break;
        case "easter": 
            targetAngle = Math.PI * 2; 
            break;
    }

    // --- Rotación y zoom de cámara ---
    gsap.to(window, {
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
            currentAngle += (targetAngle - currentAngle) * 0.08;
            camera.position.x = zoomLevel * Math.sin(currentAngle);
            camera.position.z = zoomLevel * Math.cos(currentAngle);
            camera.lookAt(0, 0, 0);
        }
    });

    // Animación de zoom usando objeto temporal
    const zoomObj = { z: zoomLevel + 1.5 };
    gsap.to(zoomObj, {
        z: zoomLevel,
        duration: 2,
        ease: "power1.inOut",
        onUpdate: function () {
            zoomLevel = zoomObj.z;
        }
    });

    // NOTA: La manipulación del DOM (ocultar HUD, mostrar contenido) se maneja en hud.js
    // para evitar conflictos y recargas duplicadas. Esta función solo maneja la rotación 3D.

}

// --- Botón "Back" ---
function backToMenu() {
    hideAllObjects();

    document.querySelectorAll(".section-content").forEach(sec => {
        gsap.to(sec, { opacity: 0, duration: 0.6, onComplete: () => sec.style.display = "none" });
    });
    gsap.to(".hud", {
        opacity: 1, duration: 1, delay: 0.5, onStart: () => {
            document.querySelector(".hud").style.display = "block";
        }
    });
}

// Función para crear partícula del cubo
function createCubeParticle(position, velocity, color = 0x00ffff) {
    if (!INTERACTIVE_ENABLED) return null;
    let particle;
    if (cubeParticlePool.length > 0) {
        particle = cubeParticlePool.pop();
        particle.position.copy(position);
        particle.velocity.copy(velocity);
        particle.life = 1.0;
        particle.color = color;
    } else {
        const geo = new THREE.SphereGeometry(0.05, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true });
        particle = new THREE.Mesh(geo, mat);
        particle.position.copy(position);
        particle.velocity = velocity.clone();
        particle.life = 1.0;
        particle.color = color;
        scene.add(particle);
    }
    cubeParticles.push(particle);
    return particle;
}

// Función para crear objetivo
function createTarget() {
    if (!INTERACTIVE_ENABLED) return;
    const geo = new THREE.RingGeometry(0.3, 0.5, 16);
    const mat = new THREE.MeshBasicMaterial({ 
        color: 0xff6f00, 
        transparent: true, 
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const target = new THREE.Mesh(geo, mat);
    
    // Posición aleatoria en el grid
    const angle = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 3;
    target.position.set(
        Math.cos(angle) * radius,
        -1.2 + Math.random() * 1.5,
        Math.sin(angle) * radius
    );
    
    target.rotation.x = Math.PI / 2;
    target.userData = {
        bobSpeed: 0.5 + Math.random() * 0.5,
        bobOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 1 + Math.random()
    };
    
    scene.add(target);
    targets.push(target);
}

// Función para detectar colisión con objetivo
function checkTargetCollision(cubePos) {
    if (!INTERACTIVE_ENABLED) return false;
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const dist = cubePos.distanceTo(target.position);
        if (dist < 0.8) {
            // Colisión! Explosión de partículas
            for (let j = 0; j < 15; j++) {
                const angle = (Math.PI * 2 * j) / 15;
                const speed = 0.3 + Math.random() * 0.2;
                const vel = new THREE.Vector3(
                    Math.cos(angle) * speed,
                    (Math.random() - 0.5) * 0.3,
                    Math.sin(angle) * speed
                );
                createCubeParticle(target.position.clone(), vel, 0xff6f00);
            }
            
            // Rebote del cubo
            const dir = cubePos.clone().sub(target.position).normalize();
            cubeState.velocity.multiplyScalar(0.5);
            cubeState.velocity.add(dir.multiplyScalar(0.8));
            
            // Remover objetivo
            scene.remove(target);
            target.geometry.dispose();
            target.material.dispose();
            targets.splice(i, 1);
            
            return true;
        }
    }
    return false;
}

// === Parallax de cámara con movimiento del mouse ===
let mouseX = 0, mouseY = 0;
let mouseWorldX = 0, mouseWorldZ = 0;
let lastWaveTime = 0;
const waveCooldown = 200; // ms entre ondas

const isProjectsVisible = () => {
    const section = document.getElementById('projects-content');
    return section && section.offsetParent !== null;
};

const isAboutVisible = () => {
    const section = document.getElementById('about-content');
    return section && section.offsetParent !== null;
};

// Función para detectar si estamos en la landing (ninguna sección abierta)
const isLanding = () => {
    const projectsSection = document.getElementById('projects-content');
    const aboutSection = document.getElementById('about-content');
    const lookingSection = document.getElementById('looking-content');
    const contactSection = document.getElementById('contact-content');
    
    const anySectionOpen = 
        (projectsSection && projectsSection.offsetParent !== null) ||
        (aboutSection && aboutSection.offsetParent !== null) ||
        (lookingSection && lookingSection.offsetParent !== null) ||
        (contactSection && contactSection.offsetParent !== null);
    
    return !anySectionOpen;
};

// Función para convertir coordenadas de pantalla a mundo 3D (en el plano del grid)
function screenToWorld(x, y, planeY = -1.5) {
    const vector = new THREE.Vector3();
    const mouse = new THREE.Vector2();
    
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    
    vector.set(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = (planeY - camera.position.y) / dir.y;
    
    if (distance > 0) {
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        return pos;
    }
    
    // Fallback: usar posición aproximada basada en el mouse
    return new THREE.Vector3(
        (mouse.x * gridSize) * 0.5,
        planeY,
        (mouse.y * gridSize) * 0.5
    );
}

// Función para convertir pantalla a mundo 3D (cualquier altura)
function screenToWorld3D(x, y, targetY = 0) {
    const mouse = new THREE.Vector2(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
    );
    
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = (targetY - camera.position.y) / dir.y;
    
    if (distance > 0) {
        return camera.position.clone().add(dir.multiplyScalar(distance));
    }
    
    return new THREE.Vector3(mouse.x * 5, targetY, mouse.y * 5);
}

// Función para crear una onda en el grid
function createWave(x, z) {
    if (!INTERACTIVE_ENABLED) return;
    const now = Date.now();
    if (now - lastWaveTime < waveCooldown) return;
    lastWaveTime = now;
    
    wavePoints.push({
        x: x,
        z: z,
        radius: 0,
        intensity: 1.0,
        speed: waveSpeed
    });
    
    // Limitar número de ondas activas
    if (wavePoints.length > maxWaves) {
        wavePoints.shift();
    }
}

// Función unificada para manejar movimiento (mouse y touch)
function handlePointerMove(x, y) {
    const xNorm = (x / window.innerWidth - 0.5) * 2; // -1 a 1
    const yNorm = (y / window.innerHeight - 0.5) * 2;
    mouseX = xNorm;
    mouseY = yNorm;
    if (!INTERACTIVE_ENABLED) return;
    
    // Calcular posición del pointer en el mundo 3D (en el plano del grid)
    const worldPos = screenToWorld(x, y);
    mouseWorldX = worldPos.x;
    mouseWorldZ = worldPos.z;
    
    // Crear ondas suaves mientras el pointer se mueve
    if (Math.random() > 0.92) {
        createWave(mouseWorldX, mouseWorldZ);
    }
    
    // Si estamos cargando el cubo (en landing)
    if (cubeState.isCharging && meshCube.visible && isLanding()) {
        const currentWorldPos = screenToWorld3D(x, y, meshCube.position.y);
        cubeState.chargeCurrentPos = currentWorldPos;
        
        // Calcular poder de carga basado en distancia
        if (cubeState.chargeStartPos) {
            const dragVec = cubeState.chargeStartPos.clone().sub(currentWorldPos);
            cubeState.chargePower = Math.min(dragVec.length() * 0.3, cubeState.maxChargePower);
            
            // Efecto visual: hacer el cubo más brillante
            const intensity = cubeState.chargePower / cubeState.maxChargePower;
            meshCube.material.emissive.setHex(0x0077cc);
            meshCube.material.emissiveIntensity = intensity * 0.8;
            meshCube.scale.setScalar(1.0 + intensity * 0.2);
        }
    }
    
    // Si estamos arrastrando el modelo, actualizar el objetivo de rotación
    if (isDraggingModel && characterModel && characterModel.visible) {
        const dragDelta = x - dragStartX;
        dragTargetRotationY = dragStartRotationY + dragDelta * 0.01;
    }
}

document.addEventListener("mousemove", (e) => {
    handlePointerMove(e.clientX, e.clientY);
});

// Soporte touch
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
    }
}, { passive: false });

// === Sistema de interacción del cubo (click/drag para lanzar) ===
function startCubeCharge(x, y) {
    if (!INTERACTIVE_ENABLED) return false;
    if (!meshCube.visible || !isLanding()) return false;
    
    const worldPos = screenToWorld3D(x, y, meshCube.position.y);
    const cubeScreenPos = meshCube.position.clone();
    cubeScreenPos.applyMatrix4(camera.matrixWorldInverse);
    
    // Verificar si el click está cerca del cubo (aproximado)
    const dist = worldPos.distanceTo(meshCube.position);
    if (dist < 2.0) {
        cubeState.isCharging = true;
        cubeState.chargeStartPos = worldPos.clone();
        cubeState.chargeCurrentPos = worldPos.clone();
        cubeState.chargePower = 0;
        cubeState.basePosition = meshCube.position.clone();
        return true;
    }
    return false;
}

function launchCube(x, y) {
    if (!INTERACTIVE_ENABLED) return;
    if (!cubeState.isCharging) return;
    
    const currentWorldPos = screenToWorld3D(x, y, meshCube.position.y);
    if (cubeState.chargeStartPos) {
        // Calcular dirección opuesta al arrastre
        const dragVec = cubeState.chargeStartPos.clone().sub(currentWorldPos);
        const power = Math.min(dragVec.length() * 0.3, cubeState.maxChargePower);
        
        if (power > 0.1) {
            dragVec.normalize();
            cubeState.velocity = dragVec.multiplyScalar(power);
            cubeState.isLaunched = true;
            cubeState.isReturning = false;
            
            // Partículas de lanzamiento
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI * 2 * i) / 10;
                const speed = 0.2;
                const vel = new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * 0.1,
                    Math.sin(angle) * speed
                );
                createCubeParticle(meshCube.position.clone(), vel, 0x00ffff);
            }
        }
    }
    
    cubeState.isCharging = false;
    meshCube.material.emissiveIntensity = 0;
    meshCube.scale.setScalar(1.0);
}

// --- Rotación del modelo al arrastrar (global, aunque el HUD esté encima) ---
const endModelDrag = () => {
    if (!isDraggingModel || !characterModel) return;
    isDraggingModel = false;
    gsap.to(characterModel.rotation, {
        y: baseModelRotationY,
        duration: 0.8,
        ease: "power2.out"
    });
};

if (INTERACTIVE_ENABLED) {
    window.addEventListener('mousedown', (e) => {
        // Prioridad: cubo si está visible en landing
        if (meshCube.visible && isLanding()) {
            if (startCubeCharge(e.clientX, e.clientY)) {
                return; // Interceptar el evento
            }
        }
        
        // Luego modelo de projects
        if (characterModel && characterModel.visible && isProjectsVisible()) {
            isDraggingModel = true;
            dragStartX = e.clientX;
            dragStartRotationY = characterModel.rotation.y;
            dragTargetRotationY = dragStartRotationY;
        }
    });

    // Soporte touch para cubo
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0 && meshCube.visible && isLanding()) {
            const touch = e.touches[0];
            if (startCubeCharge(touch.clientX, touch.clientY)) {
                e.preventDefault();
            }
        }
    }, { passive: false });

    window.addEventListener('mouseup', (e) => {
        if (cubeState.isCharging) {
            launchCube(e.clientX, e.clientY);
        }
        endModelDrag();
    });

    window.addEventListener('mouseleave', () => {
        if (cubeState.isCharging) {
            cubeState.isCharging = false;
            meshCube.material.emissiveIntensity = 0;
            meshCube.scale.setScalar(1.0);
        }
        endModelDrag();
    });

    window.addEventListener('blur', () => {
        if (cubeState.isCharging) {
            cubeState.isCharging = false;
            meshCube.material.emissiveIntensity = 0;
            meshCube.scale.setScalar(1.0);
        }
        endModelDrag();
    });

    // Touch end para cubo
    window.addEventListener('touchend', (e) => {
        if (cubeState.isCharging && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            launchCube(touch.clientX, touch.clientY);
            e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('touchcancel', () => {
        if (cubeState.isCharging) {
            cubeState.isCharging = false;
            meshCube.material.emissiveIntensity = 0;
            meshCube.scale.setScalar(1.0);
        }
    });
}

    // --- Loop principal ---
function animate() {
    requestAnimationFrame(animate);
    
    // No renderizar si el renderer no está inicializado
    if (!renderer) return;
    // Evitar TDZ si algo no se inicializó aún
    if (typeof meshCube === 'undefined' || typeof meshCyl === 'undefined') return;

    // Calcular delta basado en tiempo real para normalizar velocidad de animación
    const delta = clock.getDelta();

    // Actualizar animación del character
    if (characterMixer) {
        characterMixer.update(delta);
    }

    // Rotación continua (solo para objetos placeholder)
    [meshCube, meshCyl, meshCone, meshTorus].forEach((m) => {
        if (m.visible) m.rotation.y += 0.01;
    });

    particles.rotation.y += 0.0005;

    currentAngle += (targetAngle - currentAngle) * 0.02;
    camera.position.x = zoomLevel * Math.sin(currentAngle);
    camera.position.z = zoomLevel * Math.cos(currentAngle);
    group.position.x = -1.5;

    // Parallax leve en la cámara (profundidad)
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Aplicar rotación temporal mientras se arrastra el modelo
    if (isDraggingModel && characterModel && characterModel.visible) {
        const targetY = dragTargetRotationY;
        characterModel.rotation.y += (targetY - characterModel.rotation.y) * 0.25;
    }

    if (renderer) {
        renderer.render(scene, camera);
    }
}
// animate() se llama desde initScene() después de que el renderer esté inicializado

// --- Resize handler (optimizado para móviles) ---
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!renderer) return; // No hacer nada si el renderer no está inicializado
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        // Ajustar pixel ratio para mejor rendimiento en móviles
        const pixelRatio = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2);
        renderer.setPixelRatio(pixelRatio);
    }, 100);
}

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", () => {
    setTimeout(handleResize, 200);
});

// --- Exponer globalmente ---
window.rotateToSection = rotateToSection;
window.backToMenu = backToMenu;

// === LANDING ANIMATION ===
function initLandingAnimation() {
    const landingScreen = document.getElementById('landing-screen');
    const terminalText = document.getElementById('terminal-text');
    const terminalLines = terminalText?.querySelectorAll('.terminal-line');
    const sceneContainer = document.querySelector("#scene-container");
    const hud = document.querySelector(".hud");
    // const introBeep = document.getElementById('intro-beep'); // sonido opcional (comentado)

    if (!landingScreen || !terminalLines) {
        return;
    }

    // Mostrar terminal text
    gsap.to(terminalText, {
        opacity: 1,
        duration: 0.5,
        delay: 0.3
    });

    // Animar cada línea del terminal
    terminalLines.forEach((line, index) => {
        gsap.fromTo(line, 
            { 
                opacity: 0, 
                x: -20 
            },
            { 
                opacity: 1, 
                x: 0, 
                duration: 0.6,
                delay: 0.8 + (index * 0.4),
                ease: "power2.out"
            }
        );
    });

    // Efecto de scanline
    const scanline = landingScreen.querySelector('.scanline-overlay');
    if (scanline) {
        gsap.to(scanline, {
            opacity: 0.3,
            duration: 1,
            delay: 1.5
        });
    }

    // Efecto glitch antes de desaparecer
    setTimeout(() => {
        landingScreen.classList.add('glitching');
        
        setTimeout(() => {
            landingScreen.classList.remove('glitching');
            
            // Fade out del landing screen (simple)
            landingScreen.classList.add('fade-out');
            
            // Mostrar escena 3D con efecto
            if (sceneContainer) {
                sceneContainer.style.opacity = "0";
                gsap.to(sceneContainer, {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.in",
                    onComplete: () => {
                        // Asegurar que el cubo esté visible en la landing
                        meshCube.visible = true;
                        meshCube.position.copy(cubeState.basePosition);
                        meshCube.rotation.set(0, 0, 0);
                    }
                });
            }

            // Mostrar HUD con efecto
            if (hud) {
                hud.style.opacity = "0";
                hud.style.display = "block";
                gsap.fromTo(hud, 
                    { 
                        opacity: 0, 
                        y: -30,
                        scale: 0.9
                    }, 
                    { 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                        duration: 1.2,
                        delay: 0.3,
                        ease: "back.out(1.7)"
                    }
                );
            }

            // Beep sutil al finalizar intro (comentado mientras no se use archivo)
            // if (introBeep) {
            //     introBeep.currentTime = 0;
            //     introBeep.volume = 0.35;
            //     introBeep.play().catch(() => {});
            // }

            // Remover landing screen del DOM después de la animación
            setTimeout(() => {
                landingScreen.style.display = "none";
            }, 1000);
        }, 500);
    }, 3000); // Duración total de la animación: ~3.5 segundos
}

// --- Fade inicial (solo si no hay landing screen) ---
window.addEventListener("load", () => {
    const landingScreen = document.getElementById('landing-screen');
    
    if (landingScreen) {
        // Iniciar animación de landing
        initLandingAnimation();
    } else {
        // Fallback: animación simple si no hay landing screen
        const hud = document.querySelector(".hud");
        if (hud) {
            hud.style.opacity = "1";
            hud.style.display = "block";
            gsap.fromTo(hud, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
        }

        const sceneContainer = document.querySelector("#scene-container");
        if (sceneContainer) {
            gsap.fromTo(sceneContainer, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.2, onComplete: () => {
                // Asegurar que el cubo esté visible en la landing
                meshCube.visible = true;
                meshCube.position.copy(cubeState.basePosition);
                meshCube.rotation.set(0, 0, 0);
            }});
        }
    }
});
