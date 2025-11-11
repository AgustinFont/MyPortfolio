// === hud.js ===
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    const sections = document.querySelectorAll(".section");
    let selectedIndex = 0;

    // --- Actualiza visualmente el ítem activo ---
    function updateMenu() {
        menuItems.forEach((item, i) => item.classList.toggle("active", i === selectedIndex));
    }

    // --- Mostrar sección con animación ---
    function goToSection(sectionId) {
        // Llamar a la rotación 3D del cubo
        if (typeof window.rotateToSection === "function") {
            window.rotateToSection(sectionId);
        }

        // Ocultar menú y mostrar sección específica
        const hud = document.querySelector(".hud");
        const content = document.getElementById(sectionId + "-content");

        gsap.to(hud, {
            opacity: 0,
            duration: 0.6,
            onComplete: () => {
                hud.style.display = "none";
                if (content) {
                    content.style.display = "block";
                    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.8 });
                }
            }
        });
    }

    // --- Volver al menú principal ---
    window.backToMenu = function () {
        const hud = document.querySelector(".hud");
        const contents = document.querySelectorAll(".section-content");

        contents.forEach(c => {
            gsap.to(c, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => (c.style.display = "none")
            });
        });

        setTimeout(() => {
            hud.style.display = "block";
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
            const sectionId = menuItems[selectedIndex].dataset.section;
            goToSection(sectionId);
        }
    });

    // --- Navegación con mouse ---
    menuItems.forEach((item, i) => {
        item.addEventListener("click", () => {
            selectedIndex = i;
            updateMenu();
            goToSection(item.dataset.section);
        });
    });

    updateMenu();
});
