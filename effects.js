// === effects.js - Animaciones de scroll, hover, tilt y cursor ===
(function () {
    const gsapRef = window.gsap;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!gsapRef) return;

    document.addEventListener('DOMContentLoaded', () => {
        // --- ScrollTrigger (animaciones de entrada) ---
        if (!prefersReduce && window.ScrollTrigger) {
            gsapRef.registerPlugin(window.ScrollTrigger);

            const getScroller = (el) => el.closest('.section-content') || window;

            const reveal = (selector, opts = {}) => {
                const elements = gsapRef.utils.toArray(selector);
                elements.forEach((el) => {
                    window.ScrollTrigger.create({
                        trigger: el,
                        start: 'top 85%',
                        scroller: getScroller(el),
                        once: true,
                        onEnter: () => {
                            gsapRef.fromTo(
                                el,
                                { opacity: 0, y: opts.y ?? 24, scale: opts.scale ?? 1 },
                                {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    duration: opts.duration ?? 0.75,
                                    ease: 'power2.out',
                                }
                            );
                        },
                    });
                });
            };

            reveal(
                ['.profile-photo-container', '.cover-letter-container', '.skills-section', '.abilities-section'],
                { y: 26, duration: 0.8 }
            );
            reveal(['.section-title', '.projects-container'], { y: 20, duration: 0.7 });
            reveal(['.contact-section', '.easter-section'], { y: 18, duration: 0.65 });

            // Exponer refresco para cuando se muestran secciones dinámicas
            window.refreshScrollTriggers = () => {
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            };
        }

        // --- Hover y cambio de categoría en Projects ---
        const projectsGrid = document.getElementById('projects-grid');
        if (!prefersReduce && !isTouch && projectsGrid) {
            projectsGrid.addEventListener(
                'mouseenter',
                (e) => {
                    const item = e.target.closest('.project-item');
                    if (!item) return;
                    gsapRef.to(item, {
                        scale: 1.03,
                        y: -6,
                        boxShadow: '0 0 18px rgba(0,255,255,0.3), 0 0 28px rgba(255,111,0,0.2)',
                        duration: 0.22,
                        ease: 'power2.out',
                    });
                },
                true
            );

            projectsGrid.addEventListener(
                'mouseleave',
                (e) => {
                    const item = e.target.closest('.project-item');
                    if (!item) return;
                    gsapRef.to(item, {
                        scale: 1,
                        y: 0,
                        boxShadow: '0 0 0 rgba(0,0,0,0)',
                        duration: 0.22,
                        ease: 'power2.out',
                    });
                },
                true
            );
        }

        const categoriesTabs = document.getElementById('categories-tabs');
        if (!prefersReduce && categoriesTabs) {
            categoriesTabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.category-tab');
                if (!tab) return;
                gsapRef.fromTo(
                    tab,
                    { scale: 0.95, filter: 'brightness(0.9)' },
                    { scale: 1, filter: 'brightness(1)', duration: 0.22, ease: 'power2.out' }
                );
                const grid = document.getElementById('projects-grid');
                if (grid) {
                    gsapRef.fromTo(
                        grid,
                        { opacity: 0, y: 12 },
                        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
                    );
                }
            });
        }

        // --- Tilt sutil en ítems de menú ---
        if (!prefersReduce && !isTouch) {
            const menuItems = gsapRef.utils.toArray('#menu li');
            if (menuItems.length) {
                let rafId = null;
                let xN = 0;
                let yN = 0;
                const maxTilt = 4;

                const handleMove = (e) => {
                    xN = (e.clientX / window.innerWidth - 0.5) * 2;
                    yN = (e.clientY / window.innerHeight - 0.5) * 2;
                    if (rafId) return;
                    rafId = requestAnimationFrame(() => {
                        menuItems.forEach((item, idx) => {
                            gsapRef.to(item, {
                                rotationY: xN * maxTilt,
                                rotationX: -yN * maxTilt * 0.6,
                                transformPerspective: 700,
                                transformOrigin: 'center',
                                duration: 0.28,
                                ease: 'power2.out',
                            });
                        });
                        rafId = null;
                    });
                };

                window.addEventListener('mousemove', handleMove);
            }
        }

        // --- Cursor retro personalizado ---
        if (!prefersReduce && !isTouch) {
            const cursor = document.createElement('div');
            cursor.id = 'custom-cursor';
            const core = document.createElement('div');
            core.className = 'cursor-core';
            cursor.appendChild(core);
            document.body.appendChild(cursor);
            document.body.classList.add('custom-cursor-enabled');

            const setX = gsapRef.quickSetter(cursor, 'x', 'px');
            const setY = gsapRef.quickSetter(cursor, 'y', 'px');

            const updatePosition = (e) => {
                setX(e.clientX);
                setY(e.clientY);
                cursor.style.opacity = '1';
            };

            const hideCursor = () => {
                cursor.style.opacity = '0';
            };

            window.addEventListener('mousemove', updatePosition);
            window.addEventListener('mouseleave', hideCursor);

            const interactiveSelectors = [
                'a',
                'button',
                '.project-item',
                '.category-tab',
                '.play-btn',
                '.interactive-link',
                '#menu li',
                '.back-btn',
                '.contact-btn',
            ];

            interactiveSelectors.forEach((selector) => {
                document.querySelectorAll(selector).forEach((el) => {
                    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
                    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
                });
            });

            window.addEventListener('mousedown', () => cursor.classList.add('cursor-down'));
            window.addEventListener('mouseup', () => cursor.classList.remove('cursor-down'));
        }
    });
})();

