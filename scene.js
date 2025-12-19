// === scene.js (ESM) ===
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// --- Escena y cÃ¡mara ---
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
let baseModelRotationY = 0; // rotaciÃ³n base para volver suave

// Ajustar FOV segÃºn el dispositivo
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

// Flag para desactivar la interacciÃ³n avanzada del juego (debug)
const INTERACTIVE_ENABLED = false;

// Clock para normalizar velocidad de animaciÃ³n independiente del FPS (definir antes de initScene)
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
    powerPreference: "high-performance",
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

// Inicializar renderer cuando el DOM estÃ© listo
function initScene() {
  initRenderer();
  // Iniciar loop de animaciÃ³n solo despuÃ©s de que el renderer estÃ© listo
  if (renderer) {
    animate();
  }
}

// Esperar a que termine la evaluaciÃ³n del mÃ³dulo y el DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
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
group.position.set(-1.2, 0, -7.5); // alejamos mÃ¡s de la cÃ¡mara para apreciarlo mejor
scene.add(group);

// Grupo para modelos (solo character) rotarÃ¡ como un conjunto
const modelsGroup = new THREE.Group();
modelsGroup.position.set(0, 0, 0);
group.add(modelsGroup);

// --- Cargador GLTF ---
const loader = new GLTFLoader();

// --- Cargar modelos ---
function loadModels() {
  if (!loader) {
    console.warn("GLTFLoader no disponible, saltando carga de modelos");
    return;
  }

  // Cargar character (Ãºnico modelo characterSand)
  loader.load(
    "models/characterSand.glb",
    (gltf) => {
      characterModel = gltf.scene;
      characterModel.scale.set(0.6, 0.6, 0.6); // un poco mÃ¡s compacto

      if (gltf.animations && gltf.animations.length > 0) {
        characterMixer = new THREE.AnimationMixer(characterModel);
        characterAnimationAction = characterMixer.clipAction(gltf.animations[0]);
        characterAnimationAction.play();
        console.log("AnimaciÃ³n idle encontrada y reproduciendo");
      }

      // Posicionar y orientar para la secciÃ³n Projects
      characterModel.position.set(-8, -0.2, 10);
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
          if (name.includes("eye")) {
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
      console.log("Character cargado");
    },
    (progress) => {
      if (progress.total > 0) {
        console.log(
          "Cargando character:",
          ((progress.loaded / progress.total) * 100).toFixed(0) + "%"
        );
      }
    },
    (error) => {
      console.error("Error cargando character:", error);
    }
  );
}

// Cargar modelos apenas estÃ© disponible el loader
loadModels();

// Helper para ocultar el modelo
function hideAllObjects() {
  if (characterModel) characterModel.visible = false;
  modelsGroup.visible = false;
}

// --- Grid + entorno visual (interactivo) ---
const gridSize = 28;
const gridSegments = 28; // mayor tamaño, densidad similar
const baseGridColor = new THREE.Color(0x224466);
const highlightGridColor = new THREE.Color(0x66ccff);
const accentGridColor = new THREE.Color(0xff8a5c); // tono naranja/rosa para el pico

const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridSegments, gridSegments);
gridGeometry.rotateX(-Math.PI / 2);
gridGeometry.translate(0, -1.5, 0);

// Guardar posiciones base y seeds de ruido por vértice
const gridBasePositions = gridGeometry.attributes.position.array.slice();
const gridNoiseSeeds = new Float32Array((gridSegments + 1) * (gridSegments + 1));
for (let i = 0; i < gridNoiseSeeds.length; i++) {
  gridNoiseSeeds[i] = Math.random() * Math.PI * 2;
}

// Colores por vértice
const gridColors = new Float32Array((gridSegments + 1) * (gridSegments + 1) * 3);
for (let i = 0; i < gridColors.length; i += 3) {
  gridColors[i] = baseGridColor.r;
  gridColors[i + 1] = baseGridColor.g;
  gridColors[i + 2] = baseGridColor.b;
}
gridGeometry.setAttribute("color", new THREE.BufferAttribute(gridColors, 3));

const gridMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  vertexColors: true,
  transparent: true,
  opacity: 0.6,
});
const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
scene.add(gridMesh);

// --- Ball mode (pelota + meta + obstáculos) ---
let ballGroup = null;
let ball = null;
let ballOutline = null;
const ballState = {
  pos: new THREE.Vector3(0, -1.45, 2.5),
  vel: new THREE.Vector3(),
  dragging: false,
  dragStartWorld: new THREE.Vector3(),
  dragCurrentWorld: new THREE.Vector3(),
  hasLaunched: false,
};
let ballModeActive = false;
let goalGroup = null;
const obstacles = [];
const stars = [];
let ballScore = 0;

// Estado del puntero proyectado sobre el plano de la grid
const pointerWorld = new THREE.Vector3();
let hasPointer = false;
const raycaster = new THREE.Raycaster();
const gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.5); // y = -1.5

function updatePointerWorld(clientX, clientY) {
  const nx = (clientX / window.innerWidth) * 2 - 1;
  const ny = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera({ x: nx, y: ny }, camera);
  hasPointer = raycaster.ray.intersectPlane(gridPlane, pointerWorld) !== null;
}

// Obtener punto sobre el plano de la grid (devuelve false si no hay intersección)
function getPointOnGrid(clientX, clientY, target) {
  const nx = (clientX / window.innerWidth) * 2 - 1;
  const ny = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera({ x: nx, y: ny }, camera);
  return raycaster.ray.intersectPlane(gridPlane, target || new THREE.Vector3());
}

function ensureBall() {
  if (ballGroup) return;
  const ballGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    metalness: 0.1,
    roughness: 0.35,
    emissive: 0x0a0a0a,
    emissiveIntensity: 0.35,
  });
  ball = new THREE.Mesh(ballGeo, ballMat);

  // Outline/costura con acento
  const outlineGeo = ballGeo.clone();
  const outlineMat = new THREE.MeshBasicMaterial({
    color: accentGridColor,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  ballOutline = new THREE.Mesh(outlineGeo, outlineMat);
  ballOutline.scale.set(1.04, 1.04, 1.04);

  ballGroup = new THREE.Group();
  ballGroup.add(ball);
  ballGroup.add(ballOutline);
  ballGroup.position.copy(ballState.pos);
  scene.add(ballGroup);
}

function resetBall() {
  ensureBall();
  ballState.vel.set(0, 0, 0);
  ballState.dragging = false;
  ballState.hasLaunched = false;
  ballState.pos.set(0, -1.45, 2.5);
  if (ballGroup) ballGroup.position.copy(ballState.pos);
}

function ensureGoalAndObstacles() {
  if (goalGroup) return;
  goalGroup = new THREE.Group();
  const postMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.6,
  });
  const barGeo = new THREE.BoxGeometry(0.15, 2.0, 0.15);
  const crossGeo = new THREE.BoxGeometry(4.5, 0.15, 0.15);

  const leftPost = new THREE.Mesh(barGeo, postMat);
  leftPost.position.set(-2.25, -0.5, 0);
  const rightPost = leftPost.clone();
  rightPost.position.x = 2.25;
  const crossbar = new THREE.Mesh(crossGeo, postMat);
  crossbar.position.set(0, 0.5, 0);

  goalGroup.add(leftPost, rightPost, crossbar);
  goalGroup.position.set(0, -1.0, -7.5);
  goalGroup.visible = false;
  scene.add(goalGroup);

  // Obstáculos simples (barreras que oscilan)
  const obsMat = new THREE.MeshBasicMaterial({
    color: 0xff8a5c,
    transparent: true,
    opacity: 0.45,
  });
  const obsGeo = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const obsPositions = [
    { x: -1.2, z: -6.0, phase: 0 },
    { x: 0.0, z: -6.4, phase: Math.PI * 0.5 },
    { x: 1.2, z: -6.0, phase: Math.PI },
  ];
  obsPositions.forEach((p) => {
    const m = new THREE.Mesh(obsGeo, obsMat);
    m.position.set(p.x, -1.1, p.z);
    m.userData.phase = p.phase;
    m.visible = false;
    obstacles.push(m);
    scene.add(m);
  });

  // Estrellas recolectables
  const starGeo = new THREE.IcosahedronGeometry(0.18, 0);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xffdd55,
    emissive: 0xffbb33,
    emissiveIntensity: 0.9,
  });
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(starGeo, starMat);
    s.visible = false;
    stars.push(s);
    scene.add(s);
  }
}

function randomizeStars() {
  stars.forEach((s) => {
    const rx = THREE.MathUtils.randFloatSpread(3.5);
    const rz = THREE.MathUtils.randFloat(-7.8, -5.5);
    s.position.set(rx, -1.0 + Math.random() * 0.4, rz);
  });
}

const envGeo = new THREE.BoxGeometry(20, 20, 20);
const envMat = new THREE.MeshBasicMaterial({
  color: 0x113366,
  wireframe: true,
  transparent: true,
  opacity: 0.25,
});
const envCube = new THREE.Mesh(envGeo, envMat);
scene.add(envCube);

// --- Ambient visuals (meteoritos, flyby, fireworks) ---
const ambientEntities = [];
const ambientSchedule = {
  nextMeteor: 0,
  nextFirework: 0,
  nextFlyby: 0,
};

const meteorMat = new THREE.MeshBasicMaterial({ color: 0x99cfff, emissive: 0x66aaff, emissiveIntensity: 0.8 });
const meteorGeo = new THREE.SphereGeometry(0.08, 8, 8);
const meteorTrailMat = new THREE.LineBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.5 });

const fireworkMat = new THREE.PointsMaterial({
  size: 0.06,
  transparent: true,
  opacity: 1,
  color: 0xffdd88,
  depthWrite: false,
});

const flybyMat = new THREE.MeshBasicMaterial({ color: 0xff8a5c, transparent: true, opacity: 0.8 });
const flybyGeo = new THREE.BoxGeometry(0.25, 0.08, 0.6);

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function scheduleAmbient(timeNow) {
  if (!ambientSchedule.nextMeteor) ambientSchedule.nextMeteor = timeNow + randRange(6, 11);
  if (!ambientSchedule.nextFirework) ambientSchedule.nextFirework = timeNow + randRange(8, 14);
  if (!ambientSchedule.nextFlyby) ambientSchedule.nextFlyby = timeNow + randRange(12, 18);
}

function spawnMeteor(timeNow) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(meteorGeo, meteorMat.clone());
  const trailGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const trail = new THREE.Line(trailGeo, meteorTrailMat.clone());
  g.add(body);
  g.add(trail);
  const startX = randRange(-8, 8);
  const startZ = -12;
  const startY = randRange(2, 5);
  g.position.set(startX, startY, startZ);
  const vel = new THREE.Vector3(randRange(-0.6, 0.6), randRange(-0.4, -0.1), randRange(2.5, 3.5));
  ambientEntities.push({
    type: "meteor",
    obj: g,
    vel,
    life: 5,
    born: timeNow,
    trail,
  });
  scene.add(g);
}

function spawnFirework(timeNow) {
  const count = 24;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3(randRange(-1, 1), randRange(0.2, 1.2), randRange(-1, 1)).normalize().multiplyScalar(randRange(1.2, 2.2));
    velocities.push(dir);
    positions[i * 3 + 0] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geo, fireworkMat.clone());
  const origin = new THREE.Vector3(randRange(-5, 5), randRange(2.5, 4.5), randRange(-10, -6));
  points.position.copy(origin);
  ambientEntities.push({
    type: "firework",
    obj: points,
    velocities,
    life: 1.2,
    born: timeNow,
  });
  scene.add(points);
}

function spawnFlyby(timeNow) {
  const ship = new THREE.Mesh(flybyGeo, flybyMat.clone());
  const y = randRange(1.8, 3.2);
  const z = randRange(-8, -5);
  const dir = Math.random() > 0.5 ? 1 : -1;
  const startX = dir > 0 ? -9 : 9;
  ship.position.set(startX, y, z);
  ship.rotation.y = dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
  ambientEntities.push({
    type: "flyby",
    obj: ship,
    vel: new THREE.Vector3(3.2 * dir, randRange(-0.1, 0.1), 0),
    life: 6,
    born: timeNow,
  });
  scene.add(ship);
}

function updateAmbient(delta, timeNow) {
  scheduleAmbient(timeNow);

  if (timeNow >= ambientSchedule.nextMeteor) {
    spawnMeteor(timeNow);
    ambientSchedule.nextMeteor = timeNow + randRange(6, 11);
  }
  if (timeNow >= ambientSchedule.nextFirework) {
    spawnFirework(timeNow);
    ambientSchedule.nextFirework = timeNow + randRange(9, 14);
  }
  if (timeNow >= ambientSchedule.nextFlyby) {
    spawnFlyby(timeNow);
    ambientSchedule.nextFlyby = timeNow + randRange(12, 18);
  }

  for (let i = ambientEntities.length - 1; i >= 0; i--) {
    const e = ambientEntities[i];
    const age = timeNow - e.born;
    if (age > e.life) {
      scene.remove(e.obj);
      ambientEntities.splice(i, 1);
      continue;
    }
    if (e.type === "meteor") {
      e.obj.position.addScaledVector(e.vel, delta);
      const trailPoints = e.trail.geometry.attributes.position.array;
      trailPoints[0] = 0;
      trailPoints[1] = 0;
      trailPoints[2] = 0;
      trailPoints[3] = -e.vel.x * 0.8;
      trailPoints[4] = -e.vel.y * 0.8;
      trailPoints[5] = -e.vel.z * 0.8;
      e.trail.geometry.attributes.position.needsUpdate = true;
      const fade = 1 - age / e.life;
      e.obj.children.forEach((c) => {
        if (c.material && c.material.opacity !== undefined) {
          c.material.opacity = Math.max(0, fade);
        }
      });
    } else if (e.type === "firework") {
      const positions = e.obj.geometry.attributes.position.array;
      for (let p = 0; p < e.velocities.length; p++) {
        const v = e.velocities[p];
        positions[p * 3 + 0] += v.x * delta;
        positions[p * 3 + 1] += v.y * delta;
        positions[p * 3 + 2] += v.z * delta;
        v.y -= 0.8 * delta;
      }
      e.obj.geometry.attributes.position.needsUpdate = true;
      const fade = 1 - age / e.life;
      e.obj.material.opacity = Math.max(0, fade);
    } else if (e.type === "flyby") {
      e.obj.position.addScaledVector(e.vel, delta);
      const fade = 1 - age / e.life;
      if (e.obj.material.opacity !== undefined) e.obj.material.opacity = Math.max(0, fade);
    }
  }
}

// Pelota inicial
resetBall();

// --- PartÃ­culas flotantes (optimizado para mÃ³viles) ---
const particlesGeo = new THREE.BufferGeometry();
const particleCount = isMobile ? 100 : 200; // Menos partÃ­culas en mÃ³viles
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particlesMat = new THREE.PointsMaterial({
  color: 0x88ccff,
  size: isMobile ? 0.04 : 0.05,
  transparent: true,
  opacity: 0.5,
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// --- CÃ¡mara idle (ligero movimiento) ---
gsap.to(camera.position, {
  y: "+=0.2",
  duration: 3,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});

// --- TransiciÃ³n de secciones ---
function rotateToSection(sectionId) {
  hideAllObjects();

  // Determinar objeto visible y Ã¡ngulo objetivo
  switch (sectionId) {
    case "about":
      targetAngle = 0;
      break;
    case "projects":
      // Mostrar modelo Ãºnico
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

  // --- RotaciÃ³n y zoom de cÃ¡mara ---
  gsap.to(window, {
    duration: 2.2,
    ease: "power2.inOut",
    onUpdate: () => {
      currentAngle += (targetAngle - currentAngle) * 0.08;
      camera.position.x = zoomLevel * Math.sin(currentAngle);
      camera.position.z = zoomLevel * Math.cos(currentAngle);
      camera.lookAt(0, 0, 0);
    },
  });

  // AnimaciÃ³n de zoom usando objeto temporal
  const zoomObj = { z: zoomLevel + 1.5 };
  gsap.to(zoomObj, {
    z: zoomLevel,
    duration: 2,
    ease: "power1.inOut",
    onUpdate: function () {
      zoomLevel = zoomObj.z;
    },
  });

  // NOTA: La manipulaciÃ³n del DOM (ocultar HUD, mostrar contenido) se maneja en hud.js
  // para evitar conflictos y recargas duplicadas. Esta funciÃ³n solo maneja la rotaciÃ³n 3D.
}

// --- Demo rápida (tour de secciones con toasts) ---
let demoRunning = false;
function showDemoToast(text, duration = 1200) {
  let el = document.getElementById("demo-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "demo-toast";
    el.style.position = "fixed";
    el.style.top = "20px";
    el.style.right = "20px";
    el.style.padding = "10px 14px";
    el.style.background = "rgba(20,30,60,0.85)";
    el.style.border = "1px solid #66ccff";
    el.style.borderRadius = "6px";
    el.style.color = "#e8f6ff";
    el.style.fontFamily = "Montserrat, sans-serif";
    el.style.fontSize = "13px";
    el.style.letterSpacing = "0.4px";
    el.style.zIndex = "9999";
    el.style.pointerEvents = "none";
    el.style.opacity = "0";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.display = "block";
  gsap.killTweensOf(el);
  gsap.fromTo(el, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
  gsap.to(el, {
    opacity: 0,
    delay: duration / 1000,
    duration: 0.3,
    onComplete: () => {
      el.style.display = "none";
    },
  });
}

function startDemoTour() {
  if (demoRunning) return;
  demoRunning = true;
  const steps = [
    { section: "about", label: "Sobre mí" },
    { section: "projects", label: "Proyectos" },
    { section: "contact", label: "Contacto" },
    { section: "looking", label: "Looking For" },
  ];
  let idx = 0;
  const runStep = () => {
    if (idx >= steps.length) {
      demoRunning = false;
      if (typeof window.backToMenu === "function") window.backToMenu();
      return;
    }
    const s = steps[idx];
    showDemoToast(`Demo: ${s.label}`, 1.6);
    rotateToSection(s.section);
    idx++;
    setTimeout(runStep, 1700);
  };
  runStep();
}

// --- BotÃ³n "Back" ---
function backToMenu() {
  hideAllObjects();

  document.querySelectorAll(".section-content").forEach((sec) => {
    gsap.to(sec, {
      opacity: 0,
      duration: 0.6,
      onComplete: () => (sec.style.display = "none"),
    });
  });
  gsap.to(".hud", {
    opacity: 1,
    duration: 1,
    delay: 0.5,
    onStart: () => {
      document.querySelector(".hud").style.display = "block";
    },
  });
}

// === Parallax de cÃ¡mara con movimiento del mouse ===
let mouseX = 0,
  mouseY = 0;

const isProjectsVisible = () => {
  const section = document.getElementById("projects-content");
  return section && section.offsetParent !== null;
};

// --- RotaciÃ³n del modelo al arrastrar (global, aunque el HUD estÃ© encima) ---
const endModelDrag = () => {
  if (!isDraggingModel || !characterModel) return;
  isDraggingModel = false;
  gsap.to(characterModel.rotation, {
    y: baseModelRotationY,
    duration: 0.8,
    ease: "power2.out",
  });
};

// Movimiento del puntero (parallax + drag del modelo)
function handlePointerMove(x, y) {
  const xNorm = (x / window.innerWidth - 0.5) * 2; // -1 a 1
  const yNorm = (y / window.innerHeight - 0.5) * 2;
  mouseX = xNorm;
  mouseY = yNorm;

  updatePointerWorld(x, y);

  if (ballState.dragging) {
    getPointOnGrid(x, y, ballState.dragCurrentWorld);
  }

  if (isDraggingModel && characterModel && characterModel.visible) {
    const dragDelta = x - dragStartX;
    dragTargetRotationY = dragStartRotationY + dragDelta * 0.01;
  }
}

function tryStartBallDrag(clientX, clientY) {
  if (!ballGroup) ensureBall();
  const nx = (clientX / window.innerWidth) * 2 - 1;
  const ny = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera({ x: nx, y: ny }, camera);
  const intersects = raycaster.intersectObject(ballGroup, true);
  if (intersects.length === 0) return false;
  ballState.dragging = true;
  getPointOnGrid(clientX, clientY, ballState.dragStartWorld);
  ballState.dragCurrentWorld.copy(ballState.dragStartWorld);
  return true;
}

function endBallDrag(clientX, clientY) {
  if (!ballState.dragging) return;
  ballState.dragging = false;
  getPointOnGrid(clientX, clientY, ballState.dragCurrentWorld);
  const pull = new THREE.Vector3().subVectors(ballState.dragStartWorld, ballState.dragCurrentWorld);
  const forceScale = 2.4;
  const maxForce = 9.5;
  pull.y = 0;
  if (pull.length() === 0) return;
  pull.multiplyScalar(forceScale);
  if (pull.length() > maxForce) {
    pull.setLength(maxForce);
  }
  ballState.vel.copy(pull);
  ballState.hasLaunched = true;
  ballModeActive = true;
}

function respawnBall() {
  resetBall();
}

function updateBall(delta, time) {
  if (!ballGroup) return;

  // Si está siendo arrastrada, seguir el puntero
  if (ballState.dragging) {
    ballState.pos.copy(ballState.dragStartWorld);
    ballState.pos.y = -1.45;
    ballGroup.position.copy(ballState.pos);
    return;
  }

  // Integración simple
  ballState.pos.addScaledVector(ballState.vel, delta);

  // Fricción
  const friction = 1.6;
  const damp = Math.max(0, 1 - friction * delta);
  ballState.vel.multiplyScalar(damp);

  // Rebotes simples en bordes de la grid
  const limit = gridSize * 0.48;
  if (ballState.pos.x > limit) {
    ballState.pos.x = limit;
    ballState.vel.x *= -0.55;
  }
  if (ballState.pos.x < -limit) {
    ballState.pos.x = -limit;
    ballState.vel.x *= -0.55;
  }
  if (ballState.pos.z > limit) {
    ballState.pos.z = limit;
    ballState.vel.z *= -0.55;
  }
  if (ballState.pos.z < -limit) {
    ballState.pos.z = -limit;
    ballState.vel.z *= -0.55;
  }

  // Reposicionar mesh
  ballState.pos.y = -1.45;
  ballGroup.position.copy(ballState.pos);

  // Respawn si se detiene
  const speed = ballState.vel.length();
  if (speed < 0.15 && ballState.hasLaunched) {
    respawnBall();
  }
}

function updateObstacles(time) {
  const amp = 0.8;
  const speed = 1.2;
  obstacles.forEach((o) => {
    if (!o.visible) return;
    const phase = o.userData.phase || 0;
    o.position.x = Math.sin(time * speed + phase) * amp;
  });
}

function checkCollisions() {
  // Arco y estrellas desactivados
  return;
}

document.addEventListener(
  "mousemove",
  (e) => {
    handlePointerMove(e.clientX, e.clientY);
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    }
  },
  { passive: true }
);

window.addEventListener("mousedown", (e) => {
  if (tryStartBallDrag(e.clientX, e.clientY)) return;
  if (characterModel && characterModel.visible && isProjectsVisible()) {
    isDraggingModel = true;
    dragStartX = e.clientX;
    dragStartRotationY = characterModel.rotation.y;
    dragTargetRotationY = dragStartRotationY;
  }
});

window.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (tryStartBallDrag(touch.clientX, touch.clientY)) return;
      if (characterModel && characterModel.visible && isProjectsVisible()) {
        isDraggingModel = true;
        dragStartX = touch.clientX;
        dragStartRotationY = characterModel.rotation.y;
        dragTargetRotationY = dragStartRotationY;
      }
    }
  },
  { passive: true }
);

window.addEventListener("mouseup", (e) => {
  endBallDrag(e.clientX, e.clientY);
  endModelDrag();
});
window.addEventListener("mouseleave", (e) => {
  endBallDrag(e.clientX || 0, e.clientY || 0);
  endModelDrag();
});
window.addEventListener("blur", endModelDrag);
window.addEventListener(
  "touchend",
  (e) => {
    const touch = e.changedTouches && e.changedTouches[0];
    if (touch) {
      endBallDrag(touch.clientX, touch.clientY);
    }
    endModelDrag();
  },
  { passive: true }
);
window.addEventListener(
  "touchcancel",
  (e) => {
    const touch = e.changedTouches && e.changedTouches[0];
    if (touch) {
      endBallDrag(touch.clientX, touch.clientY);
    }
    endModelDrag();
  },
  { passive: true }
);

// Limpiar estado del puntero al salir de la ventana
window.addEventListener("mouseleave", () => {
  hasPointer = false;
});

// --- Loop principal ---
function animate() {
  requestAnimationFrame(animate);

  // No renderizar si el renderer no estÃ¡ inicializado
  if (!renderer) return;

  // Calcular delta basado en tiempo real para normalizar velocidad de animaciÃ³n
  const delta = clock.getDelta();
  const timeNow = performance.now() * 0.001;

  // Actualizar animaciÃ³n del character
  if (characterMixer) {
    characterMixer.update(delta);
  }

  particles.rotation.y += 0.0005;

  currentAngle += (targetAngle - currentAngle) * 0.02;
  camera.position.x = zoomLevel * Math.sin(currentAngle);
  camera.position.z = zoomLevel * Math.cos(currentAngle);
  group.position.x = -1.5;

  // Parallax leve en la cÃ¡mara (profundidad)
  camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  updateBall(delta, timeNow);
  updateObstacles(timeNow);
  checkCollisions();
  updateAmbient(delta, timeNow);

  // Deformación y color de la grid (onda + ruido para irregularidad)
  if (gridMesh) {
    const positions = gridGeometry.attributes.position.array;
    const colors = gridGeometry.attributes.color.array;

    const rippleAmplitude = 0.55; // altura del pico con puntero
    const rippleSpread = 1.8; // radio de influencia más pequeño (zona activa chica)
    const idleWaveAmp = 0.003; // casi nada en idle
    const noiseStrength = 0.02; // irregularidad mínima en idle
    const noiseFreq = 1.2; // velocidad del ruido
    const rippleJaggedness = 0.25; // dentado moderado

    for (let i = 0, v = 0; i < positions.length; i += 3, v++) {
      const ix = i;
      const iy = i + 1;
      const iz = i + 2;

      const baseX = gridBasePositions[ix];
      const baseZ = gridBasePositions[iz];
      let y = gridBasePositions[iy];

      // Factor de atenuación hacia los bordes para achicar la zona activa
      const edge = Math.max(Math.abs(baseX), Math.abs(baseZ)) / (gridSize * 0.5);
      const edgeFade = Math.max(0, 1 - edge * 0.65);

      // Ruido suave
      const seed = gridNoiseSeeds[v];
      const noise = Math.sin(timeNow * noiseFreq + seed + baseX * 0.35 + baseZ * 0.4) * noiseStrength;

      // Idle casi plano
      y += Math.sin(timeNow * 1.5 + baseX * 0.5 + baseZ * 0.5) * idleWaveAmp;
      y += noise;

      let t = 0;
      if (hasPointer) {
        const dx = pointerWorld.x - positions[ix];
        const dz = pointerWorld.z - positions[iz];
        const dist = Math.sqrt(dx * dx + dz * dz);
        const influence = Math.exp(-(dist * dist) / (rippleSpread * rippleSpread));
        const jagged = 1 + rippleJaggedness * Math.sin(seed * 3.7 + timeNow * 2.2);
        y += influence * rippleAmplitude * jagged * edgeFade;
        t += Math.min(1, influence * 2) * edgeFade;
      }

      if (ballGroup) {
        const dxB = ballState.pos.x - positions[ix];
        const dzB = ballState.pos.z - positions[iz];
        const distB = Math.sqrt(dxB * dxB + dzB * dzB);
        const ballSpread = 2.0;
        const ballInfluence = Math.exp(-(distB * distB) / (ballSpread * ballSpread));
        const ballAmp = 0.35;
        y += ballInfluence * ballAmp * edgeFade;
        t += ballInfluence * 1.2 * edgeFade;
      }

      t = Math.min(1, t);

      positions[iy] = y;

      // Mezcla de color: base -> highlight -> accent (complementario)
      const mixAccent = Math.pow(t, 1.2);
      const mixHighlight = t * (1 - mixAccent);

      const r =
        baseGridColor.r * (1 - t) +
        highlightGridColor.r * mixHighlight +
        accentGridColor.r * mixAccent;
      const g =
        baseGridColor.g * (1 - t) +
        highlightGridColor.g * mixHighlight +
        accentGridColor.g * mixAccent;
      const b =
        baseGridColor.b * (1 - t) +
        highlightGridColor.b * mixHighlight +
        accentGridColor.b * mixAccent;
      colors[ix] = r;
      colors[iy] = g;
      colors[iz] = b;
    }

    gridGeometry.attributes.position.needsUpdate = true;
    gridGeometry.attributes.color.needsUpdate = true;
  }

  // Aplicar rotaciÃ³n temporal mientras se arrastra el modelo
  if (isDraggingModel && characterModel && characterModel.visible) {
    const targetY = dragTargetRotationY;
    characterModel.rotation.y += (targetY - characterModel.rotation.y) * 0.25;
  }

  if (renderer) {
    renderer.render(scene, camera);
  }
}
// animate() se llama desde initScene() despuÃ©s de que el renderer estÃ© inicializado

// --- Resize handler (optimizado para mÃ³viles) ---
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (!renderer) return; // No hacer nada si el renderer no estÃ¡ inicializado

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    // Ajustar pixel ratio para mejor rendimiento en mÃ³viles
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
window.startDemoTour = startDemoTour;

// === LANDING ANIMATION ===
function initLandingAnimation() {
  const landingScreen = document.getElementById("landing-screen");
  const terminalText = document.getElementById("terminal-text");
  const terminalLines = terminalText?.querySelectorAll(".terminal-line");
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
    delay: 0.3,
  });

  // Animar cada lÃ­nea del terminal
  terminalLines.forEach((line, index) => {
    gsap.fromTo(
      line,
      {
        opacity: 0,
        x: -20,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: 0.8 + index * 0.4,
        ease: "power2.out",
      }
    );
  });

  // Efecto de scanline
  const scanline = landingScreen.querySelector(".scanline-overlay");
  if (scanline) {
    gsap.to(scanline, {
      opacity: 0.3,
      duration: 1,
      delay: 1.5,
    });
  }

  // Efecto glitch antes de desaparecer
  setTimeout(() => {
    landingScreen.classList.add("glitching");

    setTimeout(() => {
      landingScreen.classList.remove("glitching");

      // Fade out del landing screen (simple)
      landingScreen.classList.add("fade-out");

      // Mostrar escena 3D con efecto
      if (sceneContainer) {
        sceneContainer.style.opacity = "0";
        gsap.to(sceneContainer, {
          opacity: 1,
          duration: 1.5,
          ease: "power2.in",
        });
      }

      // Mostrar HUD con efecto
      if (hud) {
        hud.style.opacity = "0";
        hud.style.display = "block";
        gsap.fromTo(
          hud,
          {
            opacity: 0,
            y: -30,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            delay: 0.3,
            ease: "back.out(1.7)",
          }
        );
      }

      // Beep sutil al finalizar intro (comentado mientras no se use archivo)
      // if (introBeep) {
      //     introBeep.currentTime = 0;
      //     introBeep.volume = 0.35;
      //     introBeep.play().catch(() => {});
      // }

      // Remover landing screen del DOM despuÃ©s de la animaciÃ³n
      setTimeout(() => {
        landingScreen.style.display = "none";
      }, 1000);
    }, 500);
  }, 3000); // DuraciÃ³n total de la animaciÃ³n: ~3.5 segundos
}

// --- Fade inicial (solo si no hay landing screen) ---
window.addEventListener("load", () => {
  const landingScreen = document.getElementById("landing-screen");

  if (landingScreen) {
    // Iniciar animaciÃ³n de landing
    initLandingAnimation();
  } else {
    // Fallback: animaciÃ³n simple si no hay landing screen
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
