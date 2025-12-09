// === easter-eggs.js - Sistema de Easter Eggs ===

// Contador de easter eggs (se reinicia cada vez que se carga la página)
let easterEggsFound = 0;
const foundEasterEggs = []; // Array para guardar los easter eggs encontrados en esta sesión

// Función para inicializar el contador
function initEasterEggCounter() {
    easterEggsFound = 0;
    foundEasterEggs.length = 0;
    updateEasterEggCounter();
}

// Función para actualizar el contador visual
function updateEasterEggCounter() {
    const counterEl = document.getElementById('easter-counter');
    if (counterEl) {
        counterEl.textContent = easterEggsFound;
        
        // Animación cuando cambia el contador
        gsap.fromTo(counterEl,
            { scale: 1.2 },
            { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }
    
    updateEasterEggsList();
}

// Función para registrar un easter egg encontrado
function foundEasterEgg(eggId, eggName, eggDescription) {
    // Verificar si ya fue encontrado en esta sesión
    if (foundEasterEggs.includes(eggId)) {
        return; // Ya fue encontrado, no hacer nada
    }
    
    // Agregar a la lista de encontrados
    foundEasterEggs.push(eggId);
    easterEggsFound++;
    
    // Actualizar contador
    updateEasterEggCounter();
    
    // Mostrar notificación (opcional)
    showEasterEggNotification(eggName);
    
    console.log(`Easter Egg encontrado: ${eggName} (${eggDescription})`);
}

// Función para mostrar notificación de easter egg encontrado
function showEasterEggNotification(eggName) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'easter-notification';
    notification.textContent = `EASTER EGG ENCONTRADO: ${eggName}`;
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
    
    // Remover después de 3 segundos
    setTimeout(() => {
        gsap.to(notification, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            onComplete: () => notification.remove()
        });
    }, 3000);
}

// Función para actualizar la lista de easter eggs encontrados
function updateEasterEggsList() {
    const listEl = document.getElementById('easter-eggs-list');
    if (!listEl) return;
    
    if (foundEasterEggs.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: #88ffff; opacity: 0.7;">Aún no has encontrado ningún easter egg...</p>';
        return;
    }
    
    // Aquí puedes agregar la lógica para mostrar los easter eggs encontrados
    // Por ahora solo mostramos el contador
    listEl.innerHTML = '';
    
    foundEasterEggs.forEach((eggId, index) => {
        const eggItem = document.createElement('div');
        eggItem.className = 'easter-egg-item';
        eggItem.textContent = `Easter Egg #${index + 1} encontrado!`;
        listEl.appendChild(eggItem);
    });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initEasterEggCounter();
});

// Exportar funciones globalmente
window.foundEasterEgg = foundEasterEgg;
window.initEasterEggCounter = initEasterEggCounter;
window.easterEggsFound = () => easterEggsFound;

