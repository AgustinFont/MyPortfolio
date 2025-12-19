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
const gridSize = 12;
const gridDivisions = 12;
const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x336699, 0x224466);
grid.position.y = -1.5;
grid.material.opacity = 0.15;
grid.material.transparent = true;
scene.add(grid);

const envGeo = new THREE.BoxGeometry(20, 20, 20);
const envMat = new THREE.MeshBasicMaterial({
  color: 0x113366,
  wireframe: true,
  transparent: true,
  opacity: 0.25,
});
const envCube = new THREE.Mesh(envGeo, envMat);
scene.add(envCube);

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

  if (isDraggingModel && characterModel && characterModel.visible) {
    const dragDelta = x - dragStartX;
    dragTargetRotationY = dragStartRotationY + dragDelta * 0.01;
  }
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
    if (e.touches.length > 0 && characterModel && characterModel.visible && isProjectsVisible()) {
      const touch = e.touches[0];
      isDraggingModel = true;
      dragStartX = touch.clientX;
      dragStartRotationY = characterModel.rotation.y;
      dragTargetRotationY = dragStartRotationY;
    }
  },
  { passive: true }
);

window.addEventListener("mouseup", endModelDrag);
window.addEventListener("mouseleave", endModelDrag);
window.addEventListener("blur", endModelDrag);
window.addEventListener("touchend", endModelDrag, { passive: true });
window.addEventListener("touchcancel", endModelDrag, { passive: true });

// --- Loop principal ---
function animate() {
  requestAnimationFrame(animate);

  // No renderizar si el renderer no estÃ¡ inicializado
  if (!renderer) return;

  // Calcular delta basado en tiempo real para normalizar velocidad de animaciÃ³n
  const delta = clock.getDelta();

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
