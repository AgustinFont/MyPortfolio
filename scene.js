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

// --- Renderizador ---
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setClearColor(0x0a0a15, 1);
document.getElementById("scene-container").appendChild(renderer.domElement);

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

// --- Variables para modelos 3D ---
let characterModel = null;
let characterMixer = null; // Para animaciones
let characterAnimationAction = null;

// Clock para normalizar velocidad de animación independiente del FPS
const clock = new THREE.Clock();

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

// Helper para ocultar todos los objetos
function hideAllObjects() {
    meshCube.visible = meshCyl.visible = meshCone.visible = meshTorus.visible = false;
    if (characterModel) characterModel.visible = false;
    modelsGroup.visible = false;
}

// --- Objetos placeholder ---
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
meshCube.visible = true;
meshCyl.visible = meshCone.visible = meshTorus.visible = false;

// --- Grid + entorno visual (interactivo) ---
const gridSize = 12;
const gridDivisions = 12;
const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x336699, 0x224466);
grid.position.y = -1.5;
grid.material.opacity = 0.15;
grid.material.transparent = true;
scene.add(grid);

// Sistema de ondas para el grid
const wavePoints = [];
const maxWaves = 5;
const waveDecay = 0.95;
const waveSpeed = 0.02;

// Crear geometría personalizada para el grid con ondas
const gridGeometry = new THREE.BufferGeometry();
const gridVertices = [];
const gridIndices = [];
const gridColors = [];

// Generar vértices del grid
for (let i = 0; i <= gridDivisions; i++) {
    for (let j = 0; j <= gridDivisions; j++) {
        const x = (i / gridDivisions - 0.5) * gridSize;
        const z = (j / gridDivisions - 0.5) * gridSize;
        gridVertices.push(x, -1.5, z);
        gridColors.push(0.2, 0.4, 0.6, 0.15); // RGBA
    }
}

// Generar índices para las líneas del grid
for (let i = 0; i < gridDivisions; i++) {
    for (let j = 0; j < gridDivisions; j++) {
        const a = i * (gridDivisions + 1) + j;
        const b = a + 1;
        const c = a + (gridDivisions + 1);
        const d = c + 1;
        
        // Líneas horizontales
        gridIndices.push(a, b);
        // Líneas verticales
        gridIndices.push(a, c);
    }
}

gridGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridVertices), 3));
gridGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(gridColors), 4));
gridGeometry.setIndex(gridIndices);

const gridMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3
});

const interactiveGrid = new THREE.LineSegments(gridGeometry, gridMaterial);
scene.add(interactiveGrid);

// Ocultar el grid original y usar el interactivo
grid.visible = false;

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
            meshCube.visible = true; 
            targetAngle = 0; 
            break;
        case "projects": 
            // Mostrar modelo único
            if (characterModel) {
                characterModel.visible = true;
                modelsGroup.visible = true;
            } else {
                // Fallback al cilindro si el modelo no está cargado
                meshCyl.visible = true;
            }
            targetAngle = Math.PI / 2; 
            break;
        case "looking": 
            meshCone.visible = true; 
            targetAngle = Math.PI; 
            break;
        case "contact": 
            meshTorus.visible = true; 
            targetAngle = Math.PI * 1.5; 
            break;
        case "easter": 
            meshCyl.visible = true; 
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

// === Parallax de cámara con movimiento del mouse ===
let mouseX = 0, mouseY = 0;
let mouseWorldX = 0, mouseWorldZ = 0;
let lastWaveTime = 0;
const waveCooldown = 200; // ms entre ondas

const canvas = renderer.domElement;
const isProjectsVisible = () => {
    const section = document.getElementById('projects-content');
    return section && section.offsetParent !== null;
};

// Función para convertir coordenadas de pantalla a mundo 3D (en el plano del grid)
function screenToWorld(x, y) {
    const vector = new THREE.Vector3();
    const mouse = new THREE.Vector2();
    
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    
    vector.set(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const planeY = -1.5; // Altura del grid
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

// Función para crear una onda en el grid
function createWave(x, z) {
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

document.addEventListener("mousemove", (e) => {
    const xNorm = (e.clientX / window.innerWidth - 0.5) * 2; // -1 a 1
    const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseX = xNorm;
    mouseY = yNorm;
    
    // Calcular posición del mouse en el mundo 3D (en el plano del grid)
    const worldPos = screenToWorld(e.clientX, e.clientY);
    mouseWorldX = worldPos.x;
    mouseWorldZ = worldPos.z;
    
    // Crear ondas suaves mientras el mouse se mueve (más frecuente pero controlado)
    if (Math.random() > 0.92) { // Crear ondas suavemente
        createWave(mouseWorldX, mouseWorldZ);
    }
    
    // Si estamos arrastrando el modelo, actualizar el objetivo de rotación
    if (isDraggingModel && characterModel && characterModel.visible) {
        const dragDelta = e.clientX - dragStartX;
        dragTargetRotationY = dragStartRotationY + dragDelta * 0.01;
    }
});

// --- Rotación del modelo al arrastrar (global, aunque el HUD esté encima) ---
window.addEventListener('mousedown', (e) => {
    if (!characterModel || !characterModel.visible) return;
    if (!isProjectsVisible()) return;
    isDraggingModel = true;
    dragStartX = e.clientX;
    dragStartRotationY = characterModel.rotation.y;
    dragTargetRotationY = dragStartRotationY;
});

const endModelDrag = () => {
    if (!isDraggingModel || !characterModel) return;
    isDraggingModel = false;
    gsap.to(characterModel.rotation, {
        y: baseModelRotationY,
        duration: 0.8,
        ease: "power2.out"
    });
};

window.addEventListener('mouseup', endModelDrag);
window.addEventListener('mouseleave', endModelDrag);
window.addEventListener('blur', endModelDrag);

// --- Loop principal ---
function animate() {
    requestAnimationFrame(animate);

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

    // === Sistema de ondas en el grid ===
    const positions = interactiveGrid.geometry.attributes.position;
    const colors = interactiveGrid.geometry.attributes.color;
    const baseY = -1.5;
    
    // Resetear posiciones base primero
    for (let j = 0; j < positions.count; j++) {
        const x = positions.getX(j);
        const z = positions.getZ(j);
        positions.setY(j, baseY);
        
        // Color base
        colors.setXYZW(j, 0.2, 0.4, 0.6, 0.15);
    }
    
    // Aplicar todas las ondas
    for (let i = wavePoints.length - 1; i >= 0; i--) {
        const wave = wavePoints[i];
        wave.radius += wave.speed;
        wave.intensity *= waveDecay;
        
        // Eliminar ondas que se han desvanecido
        if (wave.intensity < 0.01 || wave.radius > gridSize * 1.5) {
            wavePoints.splice(i, 1);
            continue;
        }
        
        // Aplicar deformación de ondas a los vértices del grid
        for (let j = 0; j < positions.count; j++) {
            const x = positions.getX(j);
            const z = positions.getZ(j);
            const y = positions.getY(j);
            
            const dx = x - wave.x;
            const dz = z - wave.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const waveWidth = 0.8;
            
            if (dist < wave.radius + waveWidth && dist > wave.radius - waveWidth) {
                const normalizedDist = (dist - (wave.radius - waveWidth)) / (waveWidth * 2);
                const waveEffect = Math.sin(normalizedDist * Math.PI) * wave.intensity * 0.4;
                positions.setY(j, y + waveEffect);
                
                // Cambiar color basado en la intensidad de la onda
                const colorIntensity = wave.intensity * 0.5;
                const r = 0.2;
                const g = 0.4 + colorIntensity;
                const b = 0.6 + colorIntensity;
                const a = 0.15 + wave.intensity * 0.25;
                colors.setXYZW(j, r, g, b, a);
            }
        }
    }
    
    // Deformación suave basada en la posición del cursor
    const cursorInfluence = 0.2;
    const cursorMaxDist = 2.5;
    
    for (let j = 0; j < positions.count; j++) {
        const x = positions.getX(j);
        const z = positions.getZ(j);
        const y = positions.getY(j);
        
        const dx = x - mouseWorldX;
        const dz = z - mouseWorldZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < cursorMaxDist) {
            const influence = (1 - dist / cursorMaxDist) * cursorInfluence;
            const wavePattern = Math.sin(dist * 3) * influence;
            positions.setY(j, y + wavePattern);
            
            // Resaltar color cerca del cursor
            const colorBoost = influence * 0.4;
            const r = 0.2;
            const g = 0.4 + colorBoost;
            const b = 0.6 + colorBoost;
            const a = Math.min(0.15 + influence * 0.35, 0.5);
            colors.setXYZW(j, r, g, b, a);
        }
    }
    
    positions.needsUpdate = true;
    colors.needsUpdate = true;

    // === Rotación del cubo hacia el cursor ===
    if (meshCube.visible) {
        const cubePos = meshCube.position;
        const dx = mouseWorldX - cubePos.x;
        const dz = mouseWorldZ - cubePos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 0.1) { // Solo rotar si hay movimiento significativo
            // Calcular ángulo hacia el cursor
            const angleToCursor = Math.atan2(dx, dz);
            
            // Normalizar ángulo para transición suave
            let currentAngle = meshCube.rotation.y;
            let targetAngle = angleToCursor;
            
            // Ajustar para transición más suave (evitar saltos de 360°)
            let diff = targetAngle - currentAngle;
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;
            
            // Rotar suavemente hacia el cursor
            meshCube.rotation.y += diff * 0.08;
        }
        
        // Rotación continua suave adicional (idle)
        meshCube.rotation.y += 0.005;
    }

    // Aplicar rotación temporal mientras se arrastra el modelo
    if (isDraggingModel && characterModel && characterModel.visible) {
        const targetY = dragTargetRotationY;
        characterModel.rotation.y += (targetY - characterModel.rotation.y) * 0.25;
    }

    renderer.render(scene, camera);
}
animate();

// --- Resize handler (optimizado para móviles) ---
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
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

    if (!landingScreen || !terminalLines) return;

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
                    ease: "power2.in"
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
            gsap.fromTo(sceneContainer, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.2 });
        }
    }
});
