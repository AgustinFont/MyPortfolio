// === hud.js FINAL ===
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    let selectedIndex = 0;

    // --- Actualiza qué opción está seleccionada ---
    function updateMenu() {
        menuItems.forEach((item, i) => {
            item.classList.toggle("active", i === selectedIndex);
        });
    }

    // --- Mostrar una sección ---
    function goToSection(sectionId) {
        const hud = document.querySelector(".hud");
        const content = document.getElementById(sectionId + "-content");

        if (!hud || !content) return;

        // Fade out HUD
        gsap.to(hud, {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                hud.style.display = "none";
                content.style.display = "flex";
                gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.8 });
            }
        });

        // Llamar a la rotación 3D (desde scene.js)
        if (typeof window.rotateToSection === "function") {
            window.rotateToSection(sectionId);
        }
    }

    // --- Volver al menú principal ---
    window.backToMenu = function () {
        const hud = document.querySelector(".hud");
        const contents = document.querySelectorAll(".section-content");

        contents.forEach(c => {
            gsap.to(c, {
                opacity: 0,
                duration: 0.6,
                onComplete: () => (c.style.display = "none")
            });
        });

        setTimeout(() => {
            hud.style.display = "flex";
            gsap.fromTo(hud, { opacity: 0 }, { opacity: 1, duration: 0.8 });
        }, 600);
    };

    // --- Navegación con teclado ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % menuItems.length;
            updateMenu();
        } else if (e.key === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
            updateMenu();
        } else if (e.key === "Enter") {
            goToSection(menuItems[selectedIndex].dataset.section);
        }
    });

    // --- Navegación con clic ---
    menuItems.forEach((item, i) => {
        item.addEventListener("click", () => {
            selectedIndex = i;
            updateMenu();
            goToSection(item.dataset.section);
        });
    });

    updateMenu();
});
