// === hud.js ===
window.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll("#menu li");
    const hud = document.querySelector(".hud");
    let selectedIndex = 0;

    function updateMenu() {
        menuItems.forEach((item, i) => item.classList.toggle("active", i === selectedIndex));
    }

    function goToSection(sectionId) {
        if (typeof window.rotateToSection === "function") {
            window.rotateToSection(sectionId);
        } else {
            console.warn("rotateToSection no está disponible todavía.");
        }
    }

    // --- Teclado ---
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

    // --- Click ---
    menuItems.forEach((item, i) => {
        item.addEventListener("click", () => {
            selectedIndex = i;
            updateMenu();
            goToSection(item.dataset.section);
        });
    });

    // Inicializar HUD visible
    if (hud) {
        hud.style.display = "flex";
        hud.style.opacity = "1";
    }

    updateMenu();
});
