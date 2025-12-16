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
            thumbnail: "images/projects/thesis-thumb.png",
            media: {
                type: "carousel",
                items: [
                    { type: "image", src: "images/projects/thesis-screenshot1.png" },
                    { type: "image", src: "images/projects/thesis-screenshot2.png" },
                    { type: "image", src: "images/projects/thesis-screenshot3.png" },
                    { type: "image", src: "images/projects/thesis-screenshot4.png" },
                    { type: "image", src: "images/projects/thesis-screenshot5.png" },
                    { type: "image", src: "images/projects/thesis-screenshot6.png" },
                    { type: "image", src: "images/projects/thesis-screenshot7.png" },
                    { type: "youtube", src: "https://www.youtube.com/watch?v=dJVc4_AxM0Y" }
                ]
            },
            description: "This thesis presents the design and development of a 3D fantasy adventure game focused on exploration and combat. The project explores world-building, player progression, and interactive systems, combining environmental exploration with real-time combat mechanics. The game was developed as a full interactive experience, emphasizing level design, atmosphere, and player immersion.",
            tech: ["Unity", "C#", "3dsMax"],
            links: {
                play: "https://drive.google.com/file/d/1_CU74Z3_D2io2E2v_Of8A1kM66maDLgG/view?usp=drive_link",
                source: "https://github.com/...",
                steam: null
            },
            role: "Level Designer, Developer, 3D Artist"
        }
    ],
    nagma: [
        {
            id: 2,
            category: "nagma",
            title: "Virtual Apartment Tour App – Floor & Layout Selector",
            genre: "Interactive Tour",
            platform: "PC, VR",
            year: "2018",
            thumbnail: "images/projects/recorrido1-thumb.png",
            media: {
                type: "carousel",
                items: [
                    { type: "image", src: "images/projects/recorrido1-screenshot1.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot2.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot3.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot4.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot5.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot6.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot7.png" },
                    { type: "image", src: "images/projects/recorrido1-screenshot8.png" },
                    { type: "youtube", src: "https://www.youtube.com/watch?v=op-REI0--7I" }
                ]
            },
            description: "A virtual tour application allowing users to explore floors, switch apartment layouts, and choose optional room configurations.",
            tech: ["Unity", "C#", "3dsMax"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Developer, 3D Artist"
        },
        {
            id: 3,
            category: "nagma",
            title: "VR Walkthrough – Artificial Wave Pool Complex",
            genre: "Interactive Tour",
            platform: "PC, VR",
            year: "2020",
            thumbnail: "images/projects/recorrido2-thumb.png",
            media: {
                type: "carousel",
                items: [
                    { type: "image", src: "images/projects/recorrido2-screenshot1.png" },
                    { type: "image", src: "images/projects/recorrido2-screenshot2.png" },
                    { type: "image", src: "images/projects/recorrido2-screenshot3.png" },
                    { type: "image", src: "images/projects/recorrido2-screenshot4.png" },
                    { type: "image", src: "images/projects/recorrido2-screenshot5.png" },
                    { type: "image", src: "images/projects/recorrido2-screenshot6.png" },
                    { type: "youtube", src: "https://www.youtube.com/watch?v=aBcNwBF_do8" }
                ]
            },
            description: "A real-time VR walkthrough of an outdoor leisure complex featuring an artificial wave pool. This demo showcases the environment, amenities, and overall atmosphere of the facility through an immersive virtual experience.",
            tech: ["Unity", "C#","VR"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Developer, 3D Artist"
        }
    ],
    university: [
        {
            id: 4,
            category: "university",
            title: "Project Alpha",
            genre: "Platformer",
            platform: "PC",
            year: "2019",
            thumbnail: "images/projects/gamma-thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/gamma-1.png "},
                    {type: "image", src: "images/projects/gamma-2.png "},
                    {type: "image", src: "images/projects/gamma-3.png "},
                    {type: "image", src: "images/projects/gamma-4.png "}   
                ]
            },
            description: "A 2D platformer where the player can detach their soul to possess enemies, unlock new abilities, and solve puzzle-based challenges. This demo showcases the core mechanics, traversal, and creative possession-based gameplay",
            tech: ["Unity", "C#", "Plataformer"],
            links: {
                play: null,
                source: "https://github.com/...",
                steam: null
            },
            role: "Level Designer, Narrative Designer, Developer"
        },
        {
            id: 5,
            category: "university",
            title: "Project Beta",
            genre: "Puzzle",
            platform: "Mobile",
            year: "2023",
            thumbnail: "images/projects/beta-thumb.jpg",
            media: {
                type: "carousel",
                items: [
                    {type: "video", src: "videos/beta-demo.mp4"},
                    {type: "youtube", src: "https://www.youtube.com/watch?v=uVwGlzuEv74"}
                ]
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
            category: "university",
            title: "Soul Slave",
            genre: "Platformer",
            platform: "PC",
            year: "2019",
            thumbnail: "images/projects/gamma-thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/gamma-1.png "},
                    {type: "image", src: "images/projects/gamma-2.png "},
                    {type: "image", src: "images/projects/gamma-3.png "},
                    {type: "image", src: "images/projects/gamma-4.png "},
                    {type: "youtube", src: "https://www.youtube.com/watch?v=C7t-myucq5o"}
                ]
            },
            description: "A 2D platformer where the player can detach their soul to possess enemies, unlock new abilities, and solve puzzle-based challenges. This demo showcases the core mechanics, traversal, and creative possession-based gameplay",
            tech: ["Unity", "C#", "Plataformer"],
            links: {
                play: null,
                source: "https://github.com/...",
                steam: null
            },
            role: "Level Designer, Narrative Designer, Developer"
        },
        {
            id: 7,
            category: "university",
            title: "Fluki",
            genre: "Platformer",
            platform: "PC",
            year: "2019",
            thumbnail: "images/projects/delta-thumb.png",
            media: {
            type: "carousel",
            items: [
                {type: "image", src: "images/projects/delta-1.png "},
                {type: "image", src: "images/projects/delta-2.png "},
                {type: "image", src: "images/projects/delta-3.png "},
                {type: "image", src: "images/projects/delta-4.png "}   
            ]
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
    design: [
        {
            id: 8,
            category: "design",
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
            category: "design",
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
            category: "design",
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
    { id: "nagma", name: "NAGMA", label: "Nagma" },
    { id: "university", name: "UNIVERSITY", label: "University" },
    { id: "design", name: "DESIGN", label: "Design" }
];

// Exportar para uso global
// Forzar actualización para evitar caché
if (typeof window !== 'undefined') {
    window.projectsData = projectsData;
    window.categories = categories;
    console.log('Projects data loaded:', Object.keys(projectsData));
    console.log('Categories loaded:', categories.length);
}
