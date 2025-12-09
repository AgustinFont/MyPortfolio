// === hud.js - Sistema de navegación completo (teclado + mouse) ===
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    const hud = document.querySelector(".hud");
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
        if (inSection) return;
        inSection = true;

        const content = document.getElementById(sectionId + "-content");
        if (!hud || !content) return;

        gsap.to(hud, {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                hud.style.display = "none";
                content.style.display = "flex";
                gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.8 });
                
                // Inicializar proyectos si se abre la sección de proyectos
                if (sectionId === "projects" && typeof window.initProjects === "function") {
                    setTimeout(() => {
                        window.initProjects();
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
            gsap.fromTo(hud, { opacity: 0 }, { opacity: 1, duration: 0.8 });
        }, 600);
    };

    // === NAVEGACIÓN POR TECLADO ===
    document.addEventListener("keydown", (e) => {
        if (inSection) {
            if (e.key === "Escape") {
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
                if (inSection) return;
                // Actualizar selectedIndex inmediatamente
                selectedIndex = i;
                updateMenu();
            });

            // Click en un item
            item.addEventListener("click", (e) => {
                if (inSection) return;
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
                if (inSection) return;
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
});
