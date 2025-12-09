// === projects.js - Sistema de renderizado de proyectos con categorías ===

let currentCategory = "thesis"; // Categoría por defecto
let currentProjectIndex = 0; // Índice del proyecto seleccionado en la categoría actual
let currentCategoryIndex = 0; // Índice de la categoría seleccionada
let projectItems = []; // Array de elementos de proyectos visibles
let isInProjectsSection = false;

// Función para obtener todos los proyectos de una categoría
function getProjectsByCategory(categoryId) {
    if (!window.projectsData || !window.projectsData[categoryId]) {
        return [];
    }
    return window.projectsData[categoryId];
}

// Función para renderizar las categorías
function renderCategories() {
    const tabsContainer = document.getElementById('categories-tabs');
    if (!tabsContainer || !window.categories) return;

    tabsContainer.innerHTML = '';

    window.categories.forEach((category, index) => {
        const tab = document.createElement('button');
        tab.className = 'category-tab';
        tab.dataset.categoryId = category.id;
        tab.dataset.categoryIndex = index;
        tab.textContent = category.name;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        
        if (index === 0) {
            tab.classList.add('active');
        }

        tab.addEventListener('click', () => {
            selectCategory(category.id, index);
        });

        tabsContainer.appendChild(tab);
    });
}

// Función para seleccionar una categoría
function selectCategory(categoryId, categoryIndex) {
    currentCategory = categoryId;
    currentCategoryIndex = categoryIndex;
    currentProjectIndex = 0;

    // Actualizar tabs
    document.querySelectorAll('.category-tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === categoryIndex);
        tab.setAttribute('aria-selected', index === categoryIndex ? 'true' : 'false');
    });

    // Renderizar proyectos de la categoría
    renderProjectsGrid();
}

// Función para renderizar el grid de proyectos
function renderProjectsGrid() {
    const grid = document.getElementById('projects-grid');
    if (!grid) {
        console.warn('Projects grid no encontrado');
        return;
    }

    const projects = getProjectsByCategory(currentCategory);
    grid.innerHTML = '';
    projectItems = [];

    if (projects.length === 0) {
        grid.innerHTML = '<p class="no-projects">No hay proyectos en esta categoría.</p>';
        return;
    }

    projects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.dataset.projectId = project.id;
        projectItem.dataset.projectIndex = index;
        
        if (index === currentProjectIndex) {
            projectItem.classList.add('selected');
        }
        
        // Crear imagen de placeholder si no hay thumbnail
        const thumbnailSrc = project.thumbnail || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23003333' width='300' height='200'/%3E%3Ctext fill='%2300ffff' font-family='monospace' font-size='16' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(project.title)}%3C/text%3E%3C/svg%3E`;
        
        projectItem.innerHTML = `
            <img src="${thumbnailSrc}" alt="${project.title}" class="project-thumbnail" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\'%3E%3Crect fill=\\'%23003333\\' width=\\'300\\' height=\\'200\\'/%3E%3Ctext fill=\\'%2300ffff\\' font-family=\\'monospace\\' font-size=\\'16\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${encodeURIComponent(project.title)}%3C/text%3E%3C/svg%3E'">
            <div class="project-item-info">
                <h3 class="project-item-title">${project.title}</h3>
                <div class="project-item-meta">
                    <span>${project.genre}</span>
                    <span>${project.platform}</span>
                    <span>${project.year}</span>
                </div>
            </div>
        `;

        // Agregar evento click
        projectItem.addEventListener('click', () => {
            openProjectModal(project);
        });

        // Animación de entrada
        gsap.fromTo(projectItem, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: index * 0.1 }
        );

        grid.appendChild(projectItem);
        projectItems.push(projectItem);
    });

    // Scroll al proyecto seleccionado
    updateProjectSelection();
}

// Función para actualizar la selección visual del proyecto
function updateProjectSelection() {
    projectItems.forEach((item, index) => {
        item.classList.toggle('selected', index === currentProjectIndex);
    });

    // Scroll suave al proyecto seleccionado
    if (projectItems[currentProjectIndex]) {
        projectItems[currentProjectIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

// Función para navegar entre proyectos con teclado
function navigateProjects(direction) {
    const projects = getProjectsByCategory(currentCategory);
    if (projects.length === 0) return;

    if (direction === 'next') {
        currentProjectIndex = (currentProjectIndex + 1) % projects.length;
    } else if (direction === 'prev') {
        currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
    }

    updateProjectSelection();
}

// Función para navegar entre categorías con teclado
function navigateCategories(direction) {
    if (!window.categories || window.categories.length === 0) return;

    if (direction === 'next') {
        currentCategoryIndex = (currentCategoryIndex + 1) % window.categories.length;
    } else if (direction === 'prev') {
        currentCategoryIndex = (currentCategoryIndex - 1 + window.categories.length) % window.categories.length;
    }

    const category = window.categories[currentCategoryIndex];
    selectCategory(category.id, currentCategoryIndex);
}

// Función para abrir el modal de proyecto
function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    if (!modal) {
        console.warn('Modal no encontrado');
        return;
    }

    // Llenar datos del modal
    const titleEl = document.getElementById('project-title');
    const genreEl = document.getElementById('project-genre');
    const platformEl = document.getElementById('project-platform');
    const yearEl = document.getElementById('project-year');
    const descEl = document.getElementById('project-description');

    if (titleEl) titleEl.textContent = project.title;
    if (genreEl) genreEl.textContent = project.genre;
    if (platformEl) platformEl.textContent = project.platform;
    if (yearEl) yearEl.textContent = project.year;
    if (descEl) descEl.textContent = project.description;

    // Tecnologías
    const techContainer = document.getElementById('project-tech');
    if (techContainer) {
        techContainer.innerHTML = '';
        project.tech.forEach(tech => {
            const techTag = document.createElement('span');
            techTag.textContent = tech;
            techContainer.appendChild(techTag);
        });
    }

    // Links
    const linksContainer = document.getElementById('project-links');
    if (linksContainer) {
        linksContainer.innerHTML = '';
        
        if (project.links.play) {
            const playLink = document.createElement('a');
            playLink.href = project.links.play;
            playLink.target = '_blank';
            playLink.rel = 'noopener noreferrer';
            playLink.className = 'project-link';
            playLink.textContent = '▶ PLAY';
            linksContainer.appendChild(playLink);
        }
        
        if (project.links.source) {
            const sourceLink = document.createElement('a');
            sourceLink.href = project.links.source;
            sourceLink.target = '_blank';
            sourceLink.rel = 'noopener noreferrer';
            sourceLink.className = 'project-link';
            sourceLink.textContent = 'CODE';
            linksContainer.appendChild(sourceLink);
        }
        
        if (project.links.steam) {
            const steamLink = document.createElement('a');
            steamLink.href = project.links.steam;
            steamLink.target = '_blank';
            steamLink.rel = 'noopener noreferrer';
            steamLink.className = 'project-link';
            steamLink.textContent = 'STEAM';
            linksContainer.appendChild(steamLink);
        }
    }

    // Media (video o imagen)
    const videoEl = document.getElementById('project-video');
    const imageEl = document.getElementById('project-image');
    
    if (project.media.type === 'video') {
        if (videoEl) {
            videoEl.src = project.media.src;
            videoEl.style.display = 'block';
            videoEl.load();
            videoEl.play().catch(e => console.log('Error al reproducir video:', e));
        }
        if (imageEl) {
            imageEl.style.display = 'none';
        }
    } else {
        if (imageEl) {
            imageEl.src = project.media.src;
            imageEl.style.display = 'block';
            imageEl.alt = project.title;
        }
        if (videoEl) {
            videoEl.style.display = 'none';
            videoEl.pause();
            videoEl.src = '';
        }
    }

    // Mostrar modal con animación
    modal.style.display = 'flex';
    gsap.fromTo(modal, 
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
    );
    
    const detailEl = document.querySelector('.project-detail');
    if (detailEl) {
        gsap.fromTo(detailEl,
            { scale: 0.9, y: 20 },
            { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
    }
}

// Función para cerrar el modal
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const videoEl = document.getElementById('project-video');
    if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
    }

    gsap.to(modal, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            modal.style.display = 'none';
        }
    });
}

// Navegación por teclado dentro de la sección de proyectos
function handleProjectsKeyboard(e) {
    if (!isInProjectsSection) return;

    const modal = document.getElementById('project-modal');
    if (modal && modal.style.display !== 'none' && modal.style.display !== '') {
        // Si el modal está abierto, solo cerrar con Escape
        if (e.key === 'Escape') {
            closeProjectModal();
        }
        return;
    }

    // Navegación con Tab para cambiar categorías
    if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        navigateCategories('next');
        return;
    }

    if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        navigateCategories('prev');
        return;
    }

    // Navegación con flechas para proyectos
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateProjects('next');
        return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateProjects('prev');
        return;
    }

    // Enter para abrir proyecto seleccionado
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const projects = getProjectsByCategory(currentCategory);
        if (projects[currentProjectIndex]) {
            openProjectModal(projects[currentProjectIndex]);
        }
        return;
    }
}

// Cerrar modal con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('project-modal');
        if (modal && modal.style.display !== 'none' && modal.style.display !== '') {
            closeProjectModal();
        }
    }
});

// Cerrar modal al hacer click fuera
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'project-modal') {
                closeProjectModal();
            }
        });
    }

    // Detectar cuando se entra/sale de la sección de proyectos
    const projectsContent = document.getElementById('projects-content');
    if (projectsContent) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = projectsContent.style.display;
                    isInProjectsSection = (display === 'flex' || display === 'block');
                    
                    if (isInProjectsSection) {
                        // Agregar listener de teclado cuando se entra
                        document.addEventListener('keydown', handleProjectsKeyboard);
                    } else {
                        // Remover listener cuando se sale
                        document.removeEventListener('keydown', handleProjectsKeyboard);
                    }
                }
            });
        });
        observer.observe(projectsContent, { attributes: true, attributeFilter: ['style'] });
    }
});

// Renderizar cuando se carga la página o cuando se muestra la sección de proyectos
function initProjects() {
    // Esperar a que se carguen los datos de proyectos
    if (window.projectsData && window.categories) {
        renderCategories();
        renderProjectsGrid();
    } else {
        // Intentar de nuevo después de un breve delay
        setTimeout(() => {
            if (window.projectsData && window.categories) {
                renderCategories();
                renderProjectsGrid();
            }
        }, 500);
    }
}

// Exportar funciones globalmente
window.renderProjectsGrid = renderProjectsGrid;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.initProjects = initProjects;
window.selectCategory = selectCategory;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initProjects();
});
