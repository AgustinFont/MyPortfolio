// === projects-data.js - Projects database by categories ===
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
                source: "https://mateo-portfolio.vercel.app/",
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
            title: "Soul Slave",
            genre: "Platformer, Puzzle",
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
            tech: ["Unity", "C#", "Platformer"],
            links: {
                play: null,
                source: null,
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
            year: "2021",
            thumbnail: "images/projects/Anyball-thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "youtube", src: "https://www.youtube.com/watch?v=uVwGlzuEv74"}
                ]
            },
            description: "Gameplay demo of a casual physics-based puzzle game inspired by slingshot mechanics, focused on destruction, timing, and level design, showcasing physics systems and Unity Ads integration.",
            tech: ["Unity", "C#","Unity Ads"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Game Designer, Developer"
        },
        {
            id: 6,
            category: "university",
            title: "3D Model showcase",
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
            description: "3D modeling project in 3ds Max. Creation of models, texturing and rendering of assets for university projects.",
            tech: ["3D Modeling in 3ds Max"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "3D Artist"
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
            description: "2D platformer with fluid movement mechanics. Inspired by classic games but with a modern touch. Levels designed to maximize fun.",
            tech: ["Unity", "C#", "Aseprite"],
            links: {
                play: "https://itch.io/...",
                source: "https://github.com/...",
                steam: null
            },
            role: "Game Designer, Artist"
        },
        {
            id: 11,
            category: "university",
            title: "Image Processing",
            genre: "Image Processing",
            platform: "PC",
            year: "2020",
            thumbnail: "images/projects/Screen4.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/Screen.png"},
                    {type: "image", src: "images/projects/Screen2.png"},
                    {type: "image", src: "images/projects/Screen3.png"},
                    {type: "image", src: "images/projects/Screen4.png"},
                    {type: "image", src: "images/projects/Screen5.png"},
                    {type: "image", src: "images/projects/Screen6.png"},
                    {type: "image", src: "images/projects/Screen7.png"}
                ]
            },
            description: "Image processing and treatment project. Development of techniques for image manipulation, enhancement and creative effects.",
            tech: ["Adobe Photoshop", "Image Processing"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Graphic Designer"
        }
    ],
    design: [
        {
            id: 8,
            category: "design",
            title: "20th Century Garage",
            genre: "Graphic Design",
            platform: "Digital, Mockups",
            year: "2020",
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
            description: "Design of a logo and brand mockups for an automotive workshop, focused on creating a solid visual identity and realistic brand applications.",
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
            title: "Vono Streetwear",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2022",
            thumbnail: "images/projects/design-2/thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/design-2/thumb.png"},
                    {type: "image", src: "images/projects/design-2/es la que va.png"}
                ]
            },
            description: "Commercial graphic design project for real business. Creation of visual identity, branding and promotional materials.",
            tech: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
            links: {
                play: null,
                source: null,
                steam: null
            },
            role: "Graphic Designer"
        },
        {
            id: 12,
            category: "design",
            title: "Lumos Shop",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2021",
            thumbnail: "images/projects/design-3/lumos-thumb.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/design-3/Alicia.jpg"},
                    {type: "image", src: "images/projects/design-3/Christmas.jpg"},
                    {type: "image", src: "images/projects/design-3/Friends.jpg"},
                    {type: "image", src: "images/projects/design-3/GreysAnatomy.jpg"},
                    {type: "image", src: "images/projects/design-3/Grishaverse.jpg"},
                    {type: "image", src: "images/projects/design-3/Gryffindor.jpg"},
                    {type: "image", src: "images/projects/design-3/GryffindorV2.png"},
                    {type: "image", src: "images/projects/design-3/HP.jpg"},
                    {type: "image", src: "images/projects/design-3/Hufflepuff.jpg"},
                    {type: "image", src: "images/projects/design-3/Hufflepuff3.png"},
                    {type: "image", src: "images/projects/design-3/OrgulloYPrejuicio2.jpg"},
                    {type: "image", src: "images/projects/design-3/Ravenclaw.jpg"},
                    {type: "image", src: "images/projects/design-3/RavenclawV2.png"},
                    {type: "image", src: "images/projects/design-3/ShadowHunter1.jpg"},
                    {type: "image", src: "images/projects/design-3/ShadowHunter2.jpg"},
                    {type: "image", src: "images/projects/design-3/Slytherin.jpg"},
                    {type: "image", src: "images/projects/design-3/SlytherinV2.png"},
                    {type: "image", src: "images/projects/design-3/TeenWold.jpg"}
                ]
            },
            description: "Design and production of custom candle labels and themed bookmarks, developed to match specific concepts, styles, and visual identities.",
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
            title: "Just for fun",
            genre: "Graphic Design",
            platform: "Digital",
            year: "2023",
            thumbnail: "images/projects/design-4/IROH.png",
            media: {
                type: "carousel",
                items: [
                    {type: "image", src: "images/projects/design-4/IROH.png"},
                    {type: "image", src: "images/projects/design-4/LeviFortinero-thumb.jpg"},
                    {type: "image", src: "images/projects/design-4/MAXVelez.png"},
                    {type: "image", src: "images/projects/design-4/MessiFortinera2.jpg"}
                ]
            },
            description: "Personal graphic design project. Fantasy and entertainment creations in free time.",
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

// Available categories in order
const categories = [
    { id: "thesis", name: "THESIS", label: "Thesis" },
    { id: "nagma", name: "NAGMA", label: "Nagma" },
    { id: "university", name: "UNIVERSITY", label: "University" },
    { id: "design", name: "DESIGN", label: "Design" }
];

// Exportar para uso global
// Force update to avoid cache
if (typeof window !== 'undefined') {
    window.projectsData = projectsData;
    window.categories = categories;
    console.log('Projects data loaded:', Object.keys(projectsData));
    console.log('Categories loaded:', categories.length);
}
