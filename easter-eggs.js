// === easter-eggs.js - Sistema de Easter Eggs ===

const EASTER_EGG_CATALOG = [
    {
        id: "egg-ready-to-play",
        name: "Ready to Play",
        description: "Opened the playground"
    },
    {
        id: "egg-cv-explorer",
        name: "CV Explorer",
        description: "Visited every main section"
    },
    {
        id: "egg-paper-trail",
        name: "Paper Trail",
        description: "Downloaded the CV"
    },
    {
        id: "egg-deep-dive",
        name: "Deep Dive",
        description: "Opened a project in detail"
    },
    {
        id: "egg-signal-sent",
        name: "Signal Sent",
        description: "Reached out via LinkedIn, email or WhatsApp"
    }
];

let easterEggsFound = 0;
const foundEasterEggs = [];

function initEasterEggCounter() {
    easterEggsFound = 0;
    foundEasterEggs.length = 0;
    updateEasterEggCounter();
}

function updateEasterEggCounter() {
    const counterEl = document.getElementById("easter-counter");
    if (counterEl) {
        counterEl.textContent = `${easterEggsFound}/${EASTER_EGG_CATALOG.length}`;
        if (window.gsap) {
            gsap.fromTo(
                counterEl,
                { scale: 1.2 },
                { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }

    updateEasterEggsList();
}

function foundEasterEgg(eggId, eggName, eggDescription) {
    if (foundEasterEggs.some((egg) => egg.id === eggId)) return;

    foundEasterEggs.push({
        id: eggId,
        name: eggName,
        description: eggDescription || ""
    });
    easterEggsFound++;
    updateEasterEggCounter();
    showEasterEggNotification(eggName);

    if (typeof window.triggerSideFireworks === "function") {
        window.triggerSideFireworks();
    }
}

function showEasterEggNotification(eggName) {
    const reveal = () => {
        const notification = document.createElement("div");
        notification.className = "easter-notification";
        notification.textContent = `EASTER EGG FOUND: ${eggName}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 15px 25px;
            border: 2px solid #00ffff;
            border-radius: 4px;
            font-family: "Press Start 2P", monospace;
            font-size: 0.7em;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (window.gsap) {
                gsap.to(notification, {
                    opacity: 0,
                    y: -20,
                    duration: 0.3,
                    onComplete: () => notification.remove()
                });
            } else {
                notification.remove();
            }
        }, 4500);
    };

    if (document.hidden) {
        const wait = () => {
            if (!document.hidden) {
                document.removeEventListener("visibilitychange", wait);
                reveal();
            }
        };
        document.addEventListener("visibilitychange", wait);
        return;
    }

    requestAnimationFrame(() => {
        if (document.hidden) {
            showEasterEggNotification(eggName);
            return;
        }
        reveal();
    });
}

function openWithoutLeaving(url) {
    if (!url) return;
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (popup) {
        try {
            popup.blur();
        } catch {
            // Some browsers block access to the new tab.
        }
    }
    window.focus();
}

function updateEasterEggsList() {
    const listEl = document.getElementById("easter-eggs-list");
    if (!listEl) return;

    const unlocked = new Map(foundEasterEggs.map((egg) => [egg.id, egg]));
    listEl.innerHTML = "";

    EASTER_EGG_CATALOG.forEach((egg) => {
        const found = unlocked.get(egg.id);
        const item = document.createElement("div");
        item.className = found ? "easter-egg-item" : "easter-egg-item is-locked";

        const title = document.createElement("div");
        title.className = "egg-item-title";
        title.textContent = found ? found.name : "????";

        const desc = document.createElement("div");
        desc.className = "egg-item-desc";
        desc.textContent = found ? found.description : "Keep exploring";

        item.appendChild(title);
        item.appendChild(desc);
        listEl.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initEasterEggCounter();

    document.querySelectorAll(".linkedin-card, .email-card, .whatsapp-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            foundEasterEgg(
                "egg-signal-sent",
                "Signal Sent",
                "Reached out via LinkedIn, email or WhatsApp"
            );
            openWithoutLeaving(card.href);
        });
    });
});

window.addEasterEgg = function (title, description, id) {
    foundEasterEgg(id || `egg-${title}`, title, description || "");
};

window.foundEasterEgg = foundEasterEgg;
window.initEasterEggCounter = initEasterEggCounter;
window.easterEggsFound = () => easterEggsFound;
