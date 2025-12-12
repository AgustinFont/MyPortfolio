// === about-interactive.js - Manejo de links interactivos en About Me ===

function navigateToCategory(categoryId) {
    // Mapeo correcto: categoryId del link -> ID real de la categoría
    const categoryIdMap = {
        'universidad': 'universidad',  // ID real
        'nagma': 'recorridos'         // El ID real es 'recorridos' aunque se muestre como NAGMA
    };
    
    const realCategoryId = categoryIdMap[categoryId];
    if (!realCategoryId) return;
    
    // Si ya estamos en la sección de projects, solo cambiar la categoría
    const projectsContent = document.getElementById('projects-content');
    if (projectsContent && (projectsContent.style.display === 'flex' || projectsContent.style.display === 'block')) {
        // Ya estamos en projects, solo cambiar categoría
        if (typeof window.selectCategory === 'function' && window.categories) {
            // Buscar el índice correcto de la categoría
            const categoryIndex = window.categories.findIndex(cat => cat.id === realCategoryId);
            if (categoryIndex !== -1) {
                window.selectCategory(realCategoryId, categoryIndex);
            }
        }
        return;
    }
    
    // Establecer la categoría pendiente ANTES de abrir projects
    if (typeof window !== 'undefined' && window.pendingCategory !== undefined) {
        window.pendingCategory = realCategoryId;
    } else {
        // Si no existe la variable, crearla
        if (typeof window !== 'undefined') {
            window.pendingCategory = realCategoryId;
        }
    }
    
    // Si no estamos en projects, ir primero al menú y luego a projects
    if (typeof window.backToMenu === 'function') {
        window.backToMenu();
    }
    
    // Esperar y luego ir a projects
    setTimeout(() => {
        if (typeof window.goToSection === 'function') {
            window.goToSection('projects');
        }
    }, 800);
}

document.addEventListener('DOMContentLoaded', () => {
    // Agregar eventos a los links interactivos
    const interactiveLinks = document.querySelectorAll('.interactive-link');
    
    interactiveLinks.forEach(link => {
        const linkTarget = link.dataset.link;
        
        // Click
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToCategory(linkTarget);
        });
        
        // Enter key
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToCategory(linkTarget);
            }
        });
    });
});

// Exportar función globalmente
window.navigateToCategory = navigateToCategory;
