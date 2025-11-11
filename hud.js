// === hud.js ===
document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll("#menu li");
    let selectedIndex = 0;

    function updateMenu() {
        menuItems.forEach((item, i) => item.classList.toggle("active", i === selectedIndex));
    }

    function goToSection(sectionId) {
        if (typeof window.rotateToSection === "function") {
            window.rotateToSection(sectionId);
        }
    }

    // Navegación con teclado
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

    // Navegación con mouse
    menuItems.forEach((item, i) => {
        item.addEventListener("click", () => {
            selectedIndex = i;
            updateMenu();
            goToSection(item.dataset.section);
        });
    });

    updateMenu();
});
