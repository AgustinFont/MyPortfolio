// === projects-data.js - Base de datos de proyectos ===
const projectsData = [
    {
        id: 1,
        title: "Project Alpha",
        genre: "Action",
        platform: "PC",
        year: "2024",
        thumbnail: "images/projects/alpha-thumb.jpg", // Cambia por tus imágenes reales
        media: {
            type: "video", // "video" o "image"
            src: "videos/demo.mp4"
        },
        description: "Un juego de acción frenético con mecánicas innovadoras. Desarrollado como proyecto personal para explorar sistemas de combate fluidos y dinámicos. Combina elementos de plataformas y combate cuerpo a cuerpo.",
        tech: ["Unity", "C#", "Blender", "Photoshop"],
        links: {
            play: "https://itch.io/...",
            source: "https://github.com/...",
            steam: null // o URL si existe
        },
        role: "Game Designer, Programmer"
    },
    {
        id: 2,
        title: "Project Beta",
        genre: "Puzzle",
        platform: "Mobile",
        year: "2023",
        thumbnail: "images/projects/beta-thumb.jpg",
        media: {
            type: "image",
            src: "images/projects/beta-screenshot.jpg"
        },
        description: "Puzzle game con mecánicas únicas de física. Ganador del Game Jam Local 2023. Desafía a los jugadores con niveles progresivamente más complejos.",
        tech: ["Unity", "C#"],
        links: {
            play: "https://itch.io/...",
            source: null,
            steam: null
        },
        role: "Solo Developer"
    },
    {
        id: 3,
        title: "Project Gamma",
        genre: "RPG",
        platform: "PC",
        year: "2022",
        thumbnail: "images/projects/gamma-thumb.jpg",
        media: {
            type: "video",
            src: "videos/gamma-demo.mp4"
        },
        description: "RPG con sistema de combate por turnos y narrativa profunda. Proyecto universitario desarrollado en equipo. Explora un mundo fantástico lleno de misterios.",
        tech: ["Unreal Engine", "Blueprints", "Maya"],
        links: {
            play: null,
            source: "https://github.com/...",
            steam: null
        },
        role: "Level Designer, Narrative Designer"
    },
    {
        id: 4,
        title: "Project Delta",
        genre: "Platformer",
        platform: "PC",
        year: "2023",
        thumbnail: "images/projects/delta-thumb.jpg",
        media: {
            type: "image",
            src: "images/projects/delta-screenshot.jpg"
        },
        description: "Platformer 2D con mecánicas de movimiento fluidas. Inspirado en juegos clásicos pero con un toque moderno. Niveles diseñados para maximizar la diversión.",
        tech: ["Unity", "C#", "Aseprite"],
        links: {
            play: "https://itch.io/...",
            source: "https://github.com/...",
            steam: null
        },
        role: "Game Designer, Artist"
    }
    // Agrega más proyectos aquí cuando los tengas...
];

// Exportar para uso global
window.projectsData = projectsData;


