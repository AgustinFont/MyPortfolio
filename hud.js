// === hud.js v3.3 ===
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    let selectedIndex = 0;
    let inSection = false; // bloquea navegación dentro de secciones

    function updateMenu() {
        menuItems.forEach((item, i) => {
            item.classList.toggle("active", i === selectedIndex);
        });
    }

    // --- Mostrar sección ---
    function goToSection(sectionId) {
        if (inSection) return;
        inSection = true;

        const hud = document.querySelector(".hud");
        const content = document.getElementById(sectionId + "-content");

        if (!hud || !content) return;

        gsap.to(hud, {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                hud.style.display = "none";
                content.style.display = "flex";
                gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.8 });
            }
        });

        if (typeof window.rotateToSection === "function") {
            window.rotateToSection(sectionId);
        }
    }

    // --- Volver al menú principal ---
    window.backToMenu = function () {
        if (!inSection) return;
        inSection = false;

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
            hud.style.display = "flex";
            gsap.fromTo(hud, { opacity: 0 }, { opacity: 1, duration: 0.8 });
        }, 600);
    };

    // --- Teclado ---
    document.addEventListener("keydown", (e) => {
        // si estás dentro de una sección, sólo ESC funciona
        if (inSection) {
            if (e.key === "Escape") {
                window.backToMenu();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                selectedIndex = (selectedIndex + 1) % menuItems.length;
                updateMenu();
                break;
            case "ArrowUp":
                selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
                updateMenu();
                break;
            case "Enter":
                goToSection(menuItems[selectedIndex].dataset.section);
                break;
        }
    });

    // --- Clic ---
    menuItems.forEach((item, i) => {
        item.addEventListener("click", () => {
            if (inSection) return;
            selectedIndex = i;
            updateMenu();
            goToSection(item.dataset.section);
        });
    });

    updateMenu();
});
