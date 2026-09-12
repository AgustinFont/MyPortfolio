// === hud.js - Sistema de navegación completo (teclado + mouse) ===
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById("menu");
    const menuItems = document.querySelectorAll("#menu li");
    const hud = document.querySelector(".hud");
    const playToggle = document.getElementById("play-toggle");
    const playModeOverlay = document.getElementById("play-mode-overlay");
    const playModeBack = document.getElementById("play-mode-back");
    const playgroundTitle = document.getElementById("playground-title");
    let playMode = false;
    let selectedIndex = 0;
    let inSection = false;
    let hoverClearTimer = null;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // === Actualiza el menú visualmente ===
    function updateMenu() {
        menuItems.forEach((item, i) => {
            const isActive = i === selectedIndex;
            item.classList.toggle("active", isActive);
            item.classList.toggle("inactive", !isActive);
        });
    }

    const menuSections = ["about", "projects", "looking", "contact", "easter"];
    const visitedSections = new Set();

    function markSectionVisited(sectionId) {
        if (!menuSections.includes(sectionId)) return;
        visitedSections.add(sectionId);
        if (visitedSections.size === menuSections.length && typeof window.addEasterEgg === "function") {
            window.addEasterEgg("CV Explorer", "Visited every main section", "egg-cv-explorer");
        }
    }

    // === Mostrar sección seleccionada ===
    function goToSection(sectionId) {
        if (playMode) return; // en modo juego no navega secciones
        if (inSection) return;
        inSection = true;

        const content = document.getElementById(sectionId + "-content");
        if (!hud || !content) {
            inSection = false;
            return;
        }

        if (typeof window.setSceneActive === "function") {
            window.setSceneActive(false);
        }
        if (sectionId === "about" && typeof window.hydrateAboutMedia === "function") {
            window.hydrateAboutMedia();
        }

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
                setTimeout(() => {
                    if (typeof window.refreshScrollTriggers === "function") {
                        window.refreshScrollTriggers();
                    }
                }, 150);
                
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
        markSectionVisited(sectionId);
    }

    // === Volver al menú principal ===
    window.backToMenu = function () {
        if (playMode) {
            // salir de modo juego
            playMode = false;
            hud.classList.remove("play-mode");
            if (window.playgroundGame && typeof window.playgroundGame.destroy === "function") {
                window.playgroundGame.destroy();
                window.playgroundGame = null;
            }
            if (playModeOverlay) {
                gsap.killTweensOf(playModeOverlay);
                gsap.to(playModeOverlay, {
                    opacity: 0,
                    duration: 0.4,
                    onComplete: () => {
                        if (playMode) return;
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
            if (typeof window.setSceneActive === "function") {
                window.setSceneActive(true);
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
            if (typeof window.refreshScrollTriggers === "function") {
                window.refreshScrollTriggers();
            }
            if (typeof window.setSceneActive === "function") {
                window.setSceneActive(true);
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

        if (e.key.toLowerCase() === "d") {
            if (typeof window.startDemoTour === "function") {
                window.startDemoTour();
            }
            return;
        }

        // Navegación con teclado
        if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % menuItems.length;
            updateMenu();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = selectedIndex < 0 ? menuItems.length - 1 : (selectedIndex - 1 + menuItems.length) % menuItems.length;
            updateMenu();
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const idx = selectedIndex < 0 ? 0 : selectedIndex;
            selectedIndex = idx;
            updateMenu();
            goToSection(menuItems[idx].dataset.section);
        }
    });

    // === NAVEGACIÓN POR MOUSE (HOVER) - SIMPLIFICADO ===
    if (!isTouchDevice) {
        // Hover sobre cada item del menú
        menuItems.forEach((item, i) => {
            // Cuando el mouse entra sobre un item
            item.addEventListener("mouseenter", () => {
                if (inSection || playMode) return;
                if (hoverClearTimer) {
                    clearTimeout(hoverClearTimer);
                    hoverClearTimer = null;
                }
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

        // Quitar highlight al salir del área del menú tras un breve delay
        if (menu) {
            menu.addEventListener("mouseleave", () => {
                if (inSection || playMode) return;
                if (hoverClearTimer) clearTimeout(hoverClearTimer);
                hoverClearTimer = setTimeout(() => {
                    selectedIndex = -1;
                    updateMenu();
                }, 120); // delay breve para evitar parpadeo
            });
            menu.addEventListener("mouseenter", () => {
                if (hoverClearTimer) {
                    clearTimeout(hoverClearTimer);
                    hoverClearTimer = null;
                }
            });
        }
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
    function startPlaygroundGame() {
        if (!playMode) return;
        if (window.playgroundGame && typeof window.playgroundGame.destroy === "function") {
            window.playgroundGame.destroy();
            window.playgroundGame = null;
        }
        if (typeof window.NeonHopGame !== "function") return;
        window.playgroundGame = new window.NeonHopGame("game-canvas");
        if (window.playgroundGame && typeof window.playgroundGame.start === "function") {
            window.playgroundGame.start();
        }
    }

    function loadPlaygroundGame() {
        if (typeof window.NeonHopGame === "function") {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "game.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function enterPlayMode() {
        playMode = true;
        hud.classList.add("play-mode");
        hud.style.display = "flex";
        if (playgroundTitle) {
            playgroundTitle.style.display = "none";
        }
        if (typeof window.setSceneActive === "function") {
            window.setSceneActive(false);
        }
        if (playModeOverlay) {
            gsap.killTweensOf(playModeOverlay);
            playModeOverlay.style.display = "flex";
            gsap.fromTo(playModeOverlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (typeof window.NeonHopGame === "function") {
                        startPlaygroundGame();
                        return;
                    }
                    loadPlaygroundGame().then(startPlaygroundGame).catch(() => {});
                });
            });
        }

        // Notificación y egg (solo primera vez)
        if (!window.__playModeUnlocked) {
            window.__playModeUnlocked = true;
            if (typeof window.addEasterEgg === "function") {
                window.addEasterEgg("Ready to Play", "Opened the playground", "egg-ready-to-play");
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

    const demoToggle = document.getElementById("demo-toggle");
    if (demoToggle) {
        demoToggle.addEventListener("click", () => {
            if (typeof window.startDemoTour === "function") {
                window.startDemoTour();
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

// --- Utilidades de contacto ---
window.downloadCV = function () {
    const cvUrl = "assets/CV_Agustin_Gonzalez_Font.pdf";
    if (typeof window.addEasterEgg === "function") {
        window.addEasterEgg("Paper Trail", "Downloaded the CV", "egg-paper-trail");
    }
    const popup = window.open(cvUrl, "_blank", "noopener,noreferrer");
    if (popup) {
        try {
            popup.blur();
        } catch {
            // ignore
        }
    }
    window.focus();
};

window.sharePortfolio = function () {
    const shareData = {
        title: "Portfolio - Agustin Gonzalez Font",
        text: "Te comparto mi portfolio",
        url: window.location.href,
    };

    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
        return;
    }

    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copiado al portapapeles");
        }).catch(() => {
            alert("No se pudo compartir automáticamente. Copia este link: " + url);
        });
    } else {
        alert("Comparte este link: " + url);
    }
};
