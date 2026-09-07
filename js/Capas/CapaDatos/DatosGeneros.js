/* ==========================================================================
   CAPA DE DATOS: GÉNEROS MUSICALES TRADICIONALES BENIANOS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

const DatosGenerosColeccion = [
    {
        IdGenero: 1,
        Nombre: "Taquirari",
        Origen: "Trinidad - Llanos de Moxos, Beni",
        Compas: "2/4 o 4/4 Sincopado",
        ColorGradiente: "linear-gradient(135deg, #1877f2, #0d5cb6)",
        Icono: '<i class="fa-solid fa-guitar"></i>',
        Descripcion: "El ritmo insigne del oriente boliviano. Tiene raíces indígenas mojeñas y chiquitanas con compás binario cadencioso, alegre y romántico.",
        InstrumentosTipicos: ["Guitarra", "Bombos mojeños", "Flauta de caña o bajón", "Violín"],
        CancionesRepresentativas: ["Viva el Beni", "El Carretero", "Cunhumi"]
    },
    {
        IdGenero: 2,
        Nombre: "Chovena",
        Origen: "Región Mojeña y Chiquitana",
        Compas: "2/4 Rápido y Festivo",
        ColorGradiente: "linear-gradient(135deg, #2e7d32, #4caf50)",
        Icono: '<i class="fa-solid fa-leaf"></i>',
        Descripcion: "Danza prehispánica y colonial de las misiones jesuíticas. Se baila en rueda y trenzados con gran algarabía y zapateo alegre.",
        InstrumentosTipicos: ["Flauta de Pan", "Tamboril", "Violines jesuíticos", "Maracas"],
        CancionesRepresentativas: ["El Guajojó", "Chovena Trinitaria", "Rueda de Pascua"]
    },
    {
        IdGenero: 3,
        Nombre: "Carnavalito",
        Origen: "Llanos y Valles Bolivianos",
        Compas: "2/4 Alegre y Dinámico",
        ColorGradiente: "linear-gradient(135deg, #f59e0b, #d97706)",
        Icono: '<i class="fa-solid fa-masks-theater"></i>',
        Descripcion: "Música de fiesta y confraternidad, caracterizada por su carácter enérgico, saltos festivos y versos costumbristas.",
        InstrumentosTipicos: ["Caja", "Charango / Guitarra", "Quena / Flauta", "Pífano"],
        CancionesRepresentativas: ["Trinidad Colonial", "El Sarao", "Rumbo al Palmar"]
    },
    {
        IdGenero: 4,
        Nombre: "Danza de Macheteros (Sarao)",
        Origen: "San Ignacio de Moxos y Trinidad",
        Compas: "Ritmo Ceremonial y Devocional",
        ColorGradiente: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        Icono: '<i class="fa-solid fa-feather-pointed"></i>',
        Descripcion: "Máxima expresión del sincretismo y la dignidad mojeña. Los danzantes visten plumajes semicirculares (prosa) y machetes de madera.",
        InstrumentosTipicos: ["Bajón Mojeño (aerófono gigante de hojas de palma)", "Caja y Tambora", "Cascabeles de semillas de Paichachí"],
        CancionesRepresentativas: ["Danza Ritual de la Cruz", "Toque de los Macheteros"]
    }
];

window.DatosGenerosColeccion = DatosGenerosColeccion;
