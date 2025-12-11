// === hud.js - Sistema de navegación completo (teclado + mouse) ===
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    const hud = document.querySelector(".hud");
    const playToggle = document.getElementById("play-toggle");
    const playModeOverlay = document.getElementById("play-mode-overlay");
    const playModeBack = document.getElementById("play-mode-back");
    const playgroundTitle = document.getElementById("playground-title");
    let playMode = false;
    let selectedIndex = 0;
    let inSection = false;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // === Actualiza el menú visualmente ===
    function updateMenu() {
        menuItems.forEach((item, i) => {
            const isActive = i === selectedIndex;
            item.classList.toggle("active", isActive);
            item.classList.toggle("inactive", !isActive);
        });
    }

    // === Mostrar sección seleccionada ===
    function goToSection(sectionId) {
        if (playMode) return; // en modo juego no navega secciones
        if (inSection) return;
        inSection = true;

        const content = document.getElementById(sectionId + "-content");
        if (!hud || !content) return;

        if (playgroundTitle) {
            playgroundTitle.style.display = "none";
        }

        gsap.to(hud, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => {
                hud.style.display = "none";
                content.style.display = "flex";
                // Scroll al inicio de la sección
                content.scrollTop = 0;
                gsap.fromTo(content, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
                
                // Inicializar proyectos si se abre la sección de proyectos
                if (sectionId === "projects" && typeof window.initProjects === "function") {
                    setTimeout(() => {
                        // Pasar la categoría pendiente si existe
                        const targetCategory = window.pendingCategory || null;
                        window.initProjects(targetCategory);
                    }, 100);
                }
            }
        });

        if (typeof window.rotateToSection === "function") {
            window.rotateToSection(sectionId);
        }
    }

    // === Volver al menú principal ===
    window.backToMenu = function () {
        if (playMode) {
            // salir de modo juego
            playMode = false;
            hud.classList.remove("play-mode");
            if (playModeOverlay) {
                gsap.to(playModeOverlay, {
                    opacity: 0,
                    duration: 0.4,
                    onComplete: () => {
                        playModeOverlay.style.display = "none";
                        playModeOverlay.style.opacity = 1;
                    }
                });
            }
            hud.style.display = "flex";
            gsap.fromTo(hud, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
            if (playgroundTitle) {
                playgroundTitle.style.display = "flex";
            }
            return;
        }

        if (!inSection) return;
        inSection = false;

        const contents = document.querySelectorAll(".section-content");

        contents.forEach(c => {
            gsap.to(c, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => (c.style.display = "none")
            });
        });

        setTimeout(() => {
            hud.style.display = "flex";
            gsap.fromTo(hud, 
                { opacity: 0, y: -10 }, 
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
            if (playgroundTitle) {
                playgroundTitle.style.display = "flex";
            }
        }, 400);
    };

    // === NAVEGACIÓN POR TECLADO ===
    document.addEventListener("keydown", (e) => {
        if (inSection) {
            if (e.key === "Escape") {
                window.backToMenu();
            }
            return;
        }

        if (playMode) {
            if (e.key === "Escape" || e.key === "Backspace") {
                window.backToMenu();
            }
            return;
        }

        // Navegación con teclado
        if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % menuItems.length;
            updateMenu();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
            updateMenu();
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToSection(menuItems[selectedIndex].dataset.section);
        }
    });

    // === NAVEGACIÓN POR MOUSE (HOVER) - SIMPLIFICADO ===
    if (!isTouchDevice) {
        // Hover sobre cada item del menú
        menuItems.forEach((item, i) => {
            // Cuando el mouse entra sobre un item
            item.addEventListener("mouseenter", () => {
                if (inSection || playMode) return;
                // Actualizar selectedIndex inmediatamente
                selectedIndex = i;
                updateMenu();
            });

            // Click en un item
            item.addEventListener("click", (e) => {
                if (inSection || playMode) return;
                e.preventDefault();
                selectedIndex = i;
                updateMenu();
                goToSection(item.dataset.section);
            });
        });
    }

    // === NAVEGACIÓN TÁCTIL (MÓVILES) ===
    if (isTouchDevice) {
        menuItems.forEach((item, i) => {
            item.addEventListener("touchstart", (e) => {
                if (inSection || playMode) return;
                e.preventDefault();
                selectedIndex = i;
                updateMenu();
                goToSection(item.dataset.section);
            });
        });
    }

    // === TILT 3D DESHABILITADO (comentado para evitar conflictos con el mouse) ===
    /*
    if (!isTouchDevice && window.innerWidth > 768) {
        document.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            gsap.to(".hud", {
                rotationY: x * 10,
                rotationX: -y * 6,
                transformPerspective: 600,
                transformOrigin: "center right",
                duration: 0.6,
                ease: "power2.out"
            });
        });
    }
    */

    // === Manejo de resize ===
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newIsTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (newIsTouchDevice !== isTouchDevice && window.innerWidth <= 768) {
                gsap.set(".hud", {
                    rotationY: 0,
                    rotationX: 0,
                    clearProps: "transform"
                });
            }
        }, 250);
    });

    // Inicializar menú
    updateMenu();

    // === PLAY MODE TOGGLE ===
    function enterPlayMode() {
        playMode = true;
        hud.classList.add("play-mode");
        // Ocultar menú (clase play-mode ya lo oculta) y mantener el botón Play/Back
        hud.style.display = "flex";
        if (playgroundTitle) {
            playgroundTitle.style.display = "none";
        }
        if (playModeOverlay) {
            playModeOverlay.style.display = "flex";
            gsap.fromTo(playModeOverlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
        }

        // Notificación y egg (solo primera vez)
        if (!window.__playModeUnlocked) {
            window.__playModeUnlocked = true;
            if (typeof window.addEasterEgg === "function") {
                window.addEasterEgg("Ready to play", "Unlock play mode");
            }
            // Si hay un sistema de notificaciones, podríamos disparar aquí (placeholder)
        }
    }

    if (playToggle) {
        playToggle.addEventListener("click", () => {
            if (playMode) {
                window.backToMenu();
            } else {
                enterPlayMode();
            }
        });
    }

    if (playModeBack) {
        playModeBack.addEventListener("click", () => {
            window.backToMenu();
        });
    }

    // Exportar funciones globalmente
    window.goToSection = goToSection;
});
