// === hud.js (v5.0 responsive + tilt + touch) ===
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll("#menu li");
    const hud = document.querySelector(".hud");
    let selectedIndex = 0;
    let inSection = false;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // === Actualiza el menú visualmente ===
    function updateMenu() {
        menuItems.forEach((item, i) => {
            item.classList.toggle("active", i === selectedIndex);
            item.classList.toggle("inactive", i !== selectedIndex);
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

    // === Navegación por teclado ===
    document.addEventListener("keydown", (e) => {
        if (inSection) {
            if (e.key === "Escape") window.backToMenu();
            return;
        }

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

    // === Clic / Tap ===
    menuItems.forEach((item, i) => {
        const eventType = isTouchDevice ? "touchstart" : "click";
        item.addEventListener(eventType, () => {
            if (inSection) return;
            selectedIndex = i;
            updateMenu();
            goToSection(item.dataset.section);
        });

        if (!isTouchDevice) {
            item.addEventListener("mouseenter", () => {
                selectedIndex = i;
                updateMenu();
            });
        }
    });

    // === Tilt 3D (solo en desktop) ===
    if (!isTouchDevice) {
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

    updateMenu();
});
