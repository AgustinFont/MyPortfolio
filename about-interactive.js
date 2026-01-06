// === about-interactive.js - Manejo de links interactivos en About Me ===

function navigateToCategory(categoryId) {
    // Mapeo correcto: categoryId del link -> ID real de la categoría
    const categoryIdMap = {
        'universidad': 'thesis',  // Da Vinci Escuela -> THESIS
        'nagma': 'nagma'          // Nagma -> NAGMA
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

    // Scroll suave a secciones de About
    const scrollButtons = document.querySelectorAll('.scroll-to-section-btn');
    const scrollToSection = (sectionId) => {
        const target = document.getElementById(sectionId);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    scrollButtons.forEach(btn => {
        const targetId = btn.getAttribute('data-target');
        btn.addEventListener('click', () => scrollToSection(targetId));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToSection(targetId);
            }
        });
    });
});

// Exportar función globalmente
window.navigateToCategory = navigateToCategory;
window.scrollToAboutSection = function(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Ajuste dinámico de desplazamiento vertical para About
window.setAboutOffset = function(px) {
    const val = typeof px === 'number' ? `${px}px` : px;
    document.documentElement.style.setProperty('--about-offset', val);
};
window.getAboutOffset = function() {
    return getComputedStyle(document.documentElement).getPropertyValue('--about-offset');
};
