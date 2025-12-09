// === about-interactive.js - Manejo de links interactivos en About Me ===

function navigateToCategory(categoryId) {
    // Si ya estamos en la sección de projects, solo cambiar la categoría
    const projectsContent = document.getElementById('projects-content');
    if (projectsContent && (projectsContent.style.display === 'flex' || projectsContent.style.display === 'block')) {
        // Ya estamos en projects, solo cambiar categoría
        if (typeof window.selectCategory === 'function' && window.categories) {
            const categoryMap = {
                'universidad': 2,
                'nagma': 1,
                'recorridos': 1
            };
            
            const categoryIndex = categoryMap[categoryId];
            if (categoryIndex !== undefined) {
                const category = window.categories[categoryIndex];
                if (category) {
                    window.selectCategory(category.id, categoryIndex);
                    return;
                }
            }
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
            
            // Esperar a que se cargue y luego seleccionar la categoría
            setTimeout(() => {
                if (typeof window.selectCategory === 'function' && window.categories) {
                    const categoryMap = {
                        'universidad': 2,
                        'nagma': 1,
                        'recorridos': 1
                    };
                    
                    const categoryIndex = categoryMap[categoryId];
                    if (categoryIndex !== undefined) {
                        const category = window.categories[categoryIndex];
                        if (category) {
                            window.selectCategory(category.id, categoryIndex);
                        }
                    }
                }
            }, 600);
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

