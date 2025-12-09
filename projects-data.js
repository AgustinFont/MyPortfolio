// === projects-data.js - Base de datos de proyectos por categorías ===
const projectsData = {
    thesis: [
        {
            id: 1,
            category: "thesis",
            title: "Thesis Project",
            genre: "Thesis",
            platform: "PC",
            year: "2024",
            thumbnail: "images/projects/thesis-thumb.jpg",
            media: {
                type: "video",
                src: "videos/thesis-demo.mp4"
            },
            description: "Proyecto de tesis de universidad. Un juego completo desarrollado como trabajo final de carrera.",
            tech: ["Unity", "C#", "Blender"],
            links: {
                play: "https://itch.io/...",
                source: "https://github.com/...",
                steam: null
            },
            role: "Solo Developer"
        }
    ],
    recorridos: [
        {
            id: 2,
            category: "recorridos",
            title: "Recorrido Interactivo - Edificio A",
            genre: "Interactive Tour",
            platform: "PC",
            year: "2024",
            thumbnail: "images/projects/recorrido1-thumb.jpg",
            media: {
                type: "video",
                src: "videos/recorrido1-demo.mp4"
            },
            description: "Recorrido interactivo en Unity de un edificio completo. Permite explorar todas las áreas con navegación fluida y detalles arquitectónicos.",
            tech: ["Unity", "C#", "Blender"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Developer, 3D Artist"
        },
        {
            id: 3,
            category: "recorridos",
            title: "Recorrido Interactivo - Complejo B",
            genre: "Interactive Tour",
            platform: "PC",
            year: "2023",
            thumbnail: "images/projects/recorrido2-thumb.jpg",
            media: {
                type: "image",
                src: "images/projects/recorrido2-screenshot.jpg"
            },
            description: "Recorrido virtual de un complejo arquitectónico. Incluye múltiples edificios y espacios exteriores con iluminación realista.",
            tech: ["Unity", "C#"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Developer"
        }
    ],
    universidad: [
        {
            id: 4,
            category: "universidad",
            title: "Project Alpha",
            genre: "Action",
            platform: "PC",
            year: "2024",
            thumbnail: "images/projects/alpha-thumb.jpg",
            media: {
                type: "video",
                src: "videos/demo.mp4"
            },
            description: "Un juego de acción frenético con mecánicas innovadoras. Desarrollado como proyecto personal para explorar sistemas de combate fluidos y dinámicos.",
            tech: ["Unity", "C#", "Blender", "Photoshop"],
            links: {
                play: "https://itch.io/...",
                source: "https://github.com/...",
                steam: null
            },
            role: "Game Designer, Programmer"
        },
        {
            id: 5,
            category: "universidad",
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
            id: 6,
            category: "universidad",
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
            id: 7,
            category: "universidad",
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
    ],
    diseno: [
        {
            id: 8,
            category: "diseno",
            title: "Diseño Gráfico - Proyecto A",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2024",
            thumbnail: "images/projects/diseno1-thumb.jpg",
            media: {
                type: "image",
                src: "images/projects/diseno1-screenshot.jpg"
            },
            description: "Proyecto de diseño gráfico. Creación de identidad visual y materiales promocionales.",
            tech: ["Photoshop", "Illustrator", "InDesign"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Graphic Designer"
        },
        {
            id: 9,
            category: "diseno",
            title: "Diseño Gráfico - Proyecto B",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2023",
            thumbnail: "images/projects/diseno2-thumb.jpg",
            media: {
                type: "image",
                src: "images/projects/diseno2-screenshot.jpg"
            },
            description: "Diseño de interfaz y experiencia de usuario. Creación de mockups y prototipos interactivos.",
            tech: ["Figma", "Photoshop", "Illustrator"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "UI/UX Designer"
        },
        {
            id: 10,
            category: "diseno",
            title: "Diseño Gráfico - Proyecto C",
            genre: "Graphic Design",
            platform: "Print",
            year: "2023",
            thumbnail: "images/projects/diseno3-thumb.jpg",
            media: {
                type: "image",
                src: "images/projects/diseno3-screenshot.jpg"
            },
            description: "Diseño editorial y layout. Creación de materiales impresos y digitales.",
            tech: ["InDesign", "Photoshop", "Illustrator"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Graphic Designer"
        }
    ]
};

// Categorías disponibles en orden
const categories = [
    { id: "thesis", name: "THESIS", label: "Thesis" },
    { id: "recorridos", name: "RECORRIDOS", label: "Recorridos Interactivos" },
    { id: "universidad", name: "UNIVERSIDAD", label: "Juegos de Universidad" },
    { id: "diseno", name: "DISEÑO", label: "Diseño Gráfico" }
];

// Exportar para uso global
// Forzar actualización para evitar caché
if (typeof window !== 'undefined') {
    window.projectsData = projectsData;
    window.categories = categories;
    console.log('Projects data loaded:', Object.keys(projectsData));
    console.log('Categories loaded:', categories.length);
}
