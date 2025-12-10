// === projects.js - Sistema de renderizado de proyectos con categorías ===

let currentCategory = "thesis"; // Categoría por defecto
let currentProjectIndex = 0; // Índice del proyecto seleccionado en la categoría actual
let currentCategoryIndex = 0; // Índice de la categoría seleccionada
let projectItems = []; // Array de elementos de proyectos visibles
let isInProjectsSection = false;
let pendingCategory = null; // Categoría que debe mostrarse al abrir projects

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

    // Media - Carrusel o media simple
    const carouselContainer = document.getElementById('carousel-container');
    const carouselSlides = document.getElementById('carousel-slides');
    const carouselIndicators = document.getElementById('carousel-indicators');
    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');
    
    if (project.media.type === 'carousel' && project.media.items) {
        // Modo carrusel - múltiples medios
        carouselContainer.style.display = 'block';
        carouselSlides.innerHTML = '';
        carouselIndicators.innerHTML = '';
        
        let currentSlide = 0;
        
        project.media.items.forEach((item, index) => {
            // Crear slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.dataset.slideIndex = index;
            
            if (item.type === 'video') {
                const video = document.createElement('video');
                video.src = item.src;
                video.muted = true;
                video.loop = true;
                video.controls = true;
                video.className = 'carousel-media';
                
                // Agregar manejo de errores
                video.addEventListener('error', (e) => {
                    console.error('Error cargando video:', item.src, e);
                    console.error('Video error details:', video.error);
                    // Mostrar mensaje de error al usuario
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'video-error';
                    errorMsg.style.cssText = 'color: #ff0000; padding: 20px; text-align: center;';
                    errorMsg.textContent = `Error al cargar el video: ${item.src}`;
                    slide.appendChild(errorMsg);
                });
                
                video.addEventListener('loadeddata', () => {
                    console.log('Video cargado exitosamente:', item.src);
                });
                
                slide.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = `${project.title} - Image ${index + 1}`;
                img.className = 'carousel-media';
                slide.appendChild(img);
            }
            
            carouselSlides.appendChild(slide);
            
            // Crear indicador
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.dataset.slideIndex = index;
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            carouselIndicators.appendChild(indicator);
        });
        
        // Función para cambiar de slide
        function goToSlide(index) {
            if (index < 0 || index >= project.media.items.length) return;
            
            currentSlide = index;
            
            // Actualizar slides
            carouselSlides.querySelectorAll('.carousel-slide').forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            
            // Actualizar indicadores
            carouselIndicators.querySelectorAll('.carousel-indicator').forEach((ind, i) => {
                ind.classList.toggle('active', i === index);
            });
            
            // Pausar todos los videos excepto el actual
            carouselSlides.querySelectorAll('video').forEach((video, i) => {
                if (i === index) {
                    video.play().catch(e => console.log('Error al reproducir video:', e));
                } else {
                    video.pause();
                }
            });
        }
        
        // Mostrar botones e indicadores para carrusel
        if (carouselPrev) carouselPrev.style.display = 'flex';
        if (carouselNext) carouselNext.style.display = 'flex';
        
        // Eventos de botones
        if (carouselPrev) {
            carouselPrev.onclick = () => {
                const prevIndex = (currentSlide - 1 + project.media.items.length) % project.media.items.length;
                goToSlide(prevIndex);
            };
        }
        
        if (carouselNext) {
            carouselNext.onclick = () => {
                const nextIndex = (currentSlide + 1) % project.media.items.length;
                goToSlide(nextIndex);
            };
        }
        
        // Navegación con teclado
        const handleCarouselKeyboard = (e) => {
            if (e.key === 'ArrowLeft') {
                const prevIndex = (currentSlide - 1 + project.media.items.length) % project.media.items.length;
                goToSlide(prevIndex);
            } else if (e.key === 'ArrowRight') {
                const nextIndex = (currentSlide + 1) % project.media.items.length;
                goToSlide(nextIndex);
            }
        };
        
        document.addEventListener('keydown', handleCarouselKeyboard);
        
        // Guardar handler para limpiarlo después
        window.currentCarouselHandler = handleCarouselKeyboard;
        
        // Inicializar primer slide
        goToSlide(0);
        
    } else {
        // Modo simple - un solo medio (compatibilidad con proyectos antiguos)
        carouselContainer.style.display = 'block';
        carouselSlides.innerHTML = '';
        carouselIndicators.innerHTML = '';
        
        // Ocultar botones e indicadores para media simple
        if (carouselPrev) carouselPrev.style.display = 'none';
        if (carouselNext) carouselNext.style.display = 'none';
        
        // Crear slide único
        const slide = document.createElement('div');
        slide.className = 'carousel-slide active';
        
        if (project.media.type === 'video') {
            const video = document.createElement('video');
            video.src = project.media.src;
            video.muted = true;
            video.loop = true;
            video.controls = true;
            video.className = 'carousel-media';
            
            // Agregar manejo de errores
            video.addEventListener('error', (e) => {
                console.error('Error cargando video:', project.media.src, e);
                console.error('Video error details:', video.error);
                // Mostrar mensaje de error al usuario
                const errorMsg = document.createElement('div');
                errorMsg.className = 'video-error';
                errorMsg.style.cssText = 'color: #ff0000; padding: 20px; text-align: center;';
                errorMsg.textContent = `Error al cargar el video: ${project.media.src}`;
                slide.appendChild(errorMsg);
            });
            
            video.addEventListener('loadeddata', () => {
                console.log('Video cargado exitosamente:', project.media.src);
            });
            
            slide.appendChild(video);
            video.play().catch(e => console.log('Error al reproducir video:', e));
        } else {
            const img = document.createElement('img');
            img.src = project.media.src;
            img.alt = project.title;
            img.className = 'carousel-media';
            slide.appendChild(img);
        }
        
        carouselSlides.appendChild(slide);
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

// Función para alternar pantalla completa
function toggleFullscreen() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;
    
    const isFullscreen = modal.classList.contains('fullscreen');
    
    if (isFullscreen) {
        modal.classList.remove('fullscreen');
    } else {
        modal.classList.add('fullscreen');
    }
    
    // Actualizar el ícono del botón
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        if (modal.classList.contains('fullscreen')) {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = 'Salir de pantalla completa (F o Escape)';
        } else {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = 'Pantalla completa (F)';
        }
    }
}

// Función para cerrar el modal
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;
    
    // Salir de pantalla completa si está activa
    modal.classList.remove('fullscreen');

    // Pausar todos los videos en el carrusel
    const carouselSlides = document.getElementById('carousel-slides');
    if (carouselSlides) {
        carouselSlides.querySelectorAll('video').forEach(video => {
            video.pause();
            video.src = '';
        });
    }
    
    // Limpiar handler de teclado del carrusel
    if (window.currentCarouselHandler) {
        document.removeEventListener('keydown', window.currentCarouselHandler);
        window.currentCarouselHandler = null;
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
        // Si el modal está abierto
        if (e.key === 'Escape') {
            // Si está en pantalla completa, salir primero
            if (modal.classList.contains('fullscreen')) {
                e.preventDefault();
                toggleFullscreen();
            } else {
                closeProjectModal();
            }
        } else if (e.key === 'f' || e.key === 'F') {
            // Alternar pantalla completa con F
            e.preventDefault();
            toggleFullscreen();
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
        // Verificar estado inicial
        const initialDisplay = projectsContent.style.display;
        isInProjectsSection = (initialDisplay === 'flex' || initialDisplay === 'block');
        if (isInProjectsSection) {
            document.addEventListener('keydown', handleProjectsKeyboard);
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = projectsContent.style.display;
                    const wasInSection = isInProjectsSection;
                    isInProjectsSection = (display === 'flex' || display === 'block');
                    
                    if (isInProjectsSection && !wasInSection) {
                        // Agregar listener de teclado cuando se entra
                        document.addEventListener('keydown', handleProjectsKeyboard);
                        // Reinicializar proyectos
                        initProjects();
                    } else if (!isInProjectsSection && wasInSection) {
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
function initProjects(targetCategoryId = null) {
    // Esperar a que se carguen los datos de proyectos
    if (window.projectsData && window.categories) {
        // Verificar que projectsData sea un objeto, no un array
        if (Array.isArray(window.projectsData)) {
            console.error('ERROR: projectsData es un array. Debe ser un objeto con categorías.');
            console.log('Recarga la página con Ctrl+F5 para limpiar la caché');
            return;
        }
        
        renderCategories();
        
        // Si hay una categoría pendiente o target, usarla
        const categoryToShow = pendingCategory || targetCategoryId;
        if (categoryToShow && window.categories) {
            const categoryIndex = window.categories.findIndex(cat => cat.id === categoryToShow);
            if (categoryIndex !== -1) {
                selectCategory(categoryToShow, categoryIndex);
                pendingCategory = null; // Limpiar después de usar
                return;
            }
        }
        
        // Si no hay categoría específica, usar la actual
        renderProjectsGrid();
    } else {
        console.warn('Esperando datos de proyectos...');
        // Intentar de nuevo después de un breve delay
        setTimeout(() => {
            if (window.projectsData && window.categories) {
                if (Array.isArray(window.projectsData)) {
                    console.error('ERROR: projectsData es un array. Debe ser un objeto con categorías.');
                    return;
                }
                renderCategories();
                
                // Verificar si hay categoría pendiente
                const categoryToShow = pendingCategory || targetCategoryId;
                if (categoryToShow && window.categories) {
                    const categoryIndex = window.categories.findIndex(cat => cat.id === categoryToShow);
                    if (categoryIndex !== -1) {
                        selectCategory(categoryToShow, categoryIndex);
                        pendingCategory = null;
                        return;
                    }
                }
                
                renderProjectsGrid();
            } else {
                console.error('No se pudieron cargar los datos de proyectos');
            }
        }, 500);
    }
}

// Exportar funciones globalmente
window.renderProjectsGrid = renderProjectsGrid;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.toggleFullscreen = toggleFullscreen;
window.initProjects = initProjects;
window.selectCategory = selectCategory;
window.pendingCategory = null; // Variable global para categoría pendiente

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initProjects();
});
