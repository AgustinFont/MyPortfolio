// === projects.js - Sistema de renderizado de proyectos ===

// Función para renderizar el grid de proyectos
function renderProjectsGrid() {
    const grid = document.getElementById('projects-grid');
    if (!grid || !window.projectsData) {
        console.warn('Projects grid o datos no encontrados');
        return;
    }

    grid.innerHTML = '';

    window.projectsData.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.dataset.projectId = project.id;
        
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
            { opacity: 1, y: 0, duration: 0.5, delay: (project.id - 1) * 0.1 }
        );

        grid.appendChild(projectItem);
    });
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
            videoEl.load(); // Recargar el video
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
});

// Renderizar cuando se carga la página o cuando se abre la sección de proyectos
function initProjects() {
    // Esperar a que se carguen los datos de proyectos
    if (window.projectsData && window.projectsData.length > 0) {
        renderProjectsGrid();
    } else {
        // Intentar de nuevo después de un breve delay
        setTimeout(() => {
            if (window.projectsData && window.projectsData.length > 0) {
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initProjects();
});

// También renderizar cuando se muestre la sección de proyectos
const originalGoToSection = window.goToSection;
if (typeof originalGoToSection === 'undefined') {
    // Si no existe, esperar a que hud.js lo cree
    setTimeout(() => {
        const projectsContent = document.getElementById('projects-content');
        if (projectsContent) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const display = projectsContent.style.display;
                        if (display === 'flex' || display === 'block') {
                            initProjects();
                        }
                    }
                });
            });
            observer.observe(projectsContent, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1000);
}


