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
            id: 5,
            category: "university",
            title: "AnyBall",
            genre: "Puzzle",
            platform: "Mobile",
            year: "2023",
            thumbnail: "images/projects/Anyball-thumb.png",
            media: {
                type: "carousel",
                items: [
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
            id: 7,
            category: "university",
            title: "Fluki",
            genre: "3D Modeling",
            platform: "PC",
            year: "2019",
            thumbnail: "images/projects/modelado-1.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/modelado-1.png"},
                    {type: "image", src: "images/projects/modelado-2.png"},
                    {type: "image", src: "images/projects/modelado-3.png"},
                    {type: "image", src: "images/projects/modelado-4.png"},
                    {type: "image", src: "images/projects/modelado-5.png"}
                ]
            },
            description: "Proyecto de modelado 3D en 3ds Max. Creación de modelos, texturizado y renderizado de assets para proyectos universitarios.",
            tech: ["3D Modeling in 3ds Max"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "3D Artist"
        }
    ],
    design: [
        {
            id: 8,
            category: "design",
            title: "Century",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2024",
            thumbnail: "images/projects/design-1/century-thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/design-1/century-1.png"},
                    {type: "image", src: "images/projects/design-1/century-2.png"},
                    {type: "image", src: "images/projects/design-1/century-3.png"},
                    {type: "image", src: "images/projects/design-1/century-4.png"},
                    {type: "image", src: "images/projects/design-1/century-5.png"},
                    {type: "image", src: "images/projects/design-1/century-6.png"}
                ]
            },
            description: "Proyecto comercial de diseño gráfico para negocio real. Creación de identidad visual, branding y materiales promocionales.",
            tech: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
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
            title: "Lumos",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2023",
            thumbnail: "images/projects/design-2/lumos-thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/design-2/Alicia.jpg"},
                    {type: "image", src: "images/projects/design-2/Christmas.jpg"},
                    {type: "image", src: "images/projects/design-2/Friends.jpg"},
                    {type: "image", src: "images/projects/design-2/GreysAnatomy.jpg"},
                    {type: "image", src: "images/projects/design-2/Grishaverse.jpg"},
                    {type: "image", src: "images/projects/design-2/Gryffindor.jpg"},
                    {type: "image", src: "images/projects/design-2/GryffindorV2.png"},
                    {type: "image", src: "images/projects/design-2/HP.jpg"},
                    {type: "image", src: "images/projects/design-2/Hufflepuff.jpg"},
                    {type: "image", src: "images/projects/design-2/Hufflepuff3.png"},
                    {type: "image", src: "images/projects/design-2/OrgulloYPrejuicio2.jpg"},
                    {type: "image", src: "images/projects/design-2/Ravenclaw.jpg"},
                    {type: "image", src: "images/projects/design-2/RavenclawV2.png"},
                    {type: "image", src: "images/projects/design-2/ShadowHunter1.jpg"},
                    {type: "image", src: "images/projects/design-2/ShadowHunter2.jpg"},
                    {type: "image", src: "images/projects/design-2/Slytherin.jpg"},
                    {type: "image", src: "images/projects/design-2/SlytherinV2.png"},
                    {type: "image", src: "images/projects/design-2/TeenWold.jpg"}
                ]
            },
            description: "Proyecto comercial de diseño gráfico para negocio real. Creación de contenido visual, branding y materiales promocionales.",
            tech: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Graphic Designer"
        },
        {
            id: 10,
            category: "design",
            title: "LeviFortinero",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2023",
            thumbnail: "images/projects/design-3/LeviFortinero-thumb.jpg",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/design-3/LeviFortinero-thumb.jpg"},
                    {type: "image", src: "images/projects/design-3/GokuFortinero.jpg"},
                    {type: "image", src: "images/projects/design-3/MAXVelez.png"}
                ]
            },
            description: "Proyecto personal de diseño gráfico. Creaciones de fantasía y entretenimiento en tiempo libre.",
            tech: ["Adobe Photoshop", "Adobe Illustrator"],
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
