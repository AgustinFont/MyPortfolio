// hud.js
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    const sections = document.querySelectorAll(".section");
    let selectedIndex = 0;

    function updateMenu() {
        menuItems.forEach((item, i) => item.classList.toggle("active", i === selectedIndex));
    }

    function showSection(sectionId) {
        sections.forEach(sec => sec.classList.toggle("active", sec.id === sectionId));
        if (typeof window.rotateToSection === 'function') {
            window.rotateToSection(sectionId);
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { selectedIndex = (selectedIndex + 1) % menuItems.length; updateMenu(); }
        else if (e.key === "ArrowUp") { selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length; updateMenu(); }
        else if (e.key === "Enter") { showSection(menuItems[selectedIndex].dataset.section); }
    });

    menuItems.forEach((item, i) => {
        item.addEventListener("click", () => {
            selectedIndex = i;
            updateMenu();
            showSection(item.dataset.section);
        });
    });

    updateMenu();
    showSection(menuItems[selectedIndex].dataset.section);
});
