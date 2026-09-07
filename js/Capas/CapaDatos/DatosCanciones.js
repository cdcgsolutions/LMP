/* ==========================================================================
   CAPA DE DATOS: CANCIONES Y FOLKLORE BENIANO
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

const DatosCancionesColeccion = [
    {
        IdCancion: 1,
        Titulo: "Viva el Beni (Tierra Hermosa)",
        Autor: "Edna Miriam Edgley Cuellar",
        Genero: "Taquirari",
        TonoOriginal: "Re Mayor (D)",
        TempoBPM: 108,
        EsEstudianteIFAEL: true,
        Descripcion: "Composición dedicada al departamento del Beni, exaltando su naturaleza, sus pampas y su noble pueblo.",
        Caratula: "Logo1.png",
        ImagenPartitura: "IFAEL.jpg",
        SecuenciaNotasMelodia: [
            { Nota: "D4", Duracion: 0.4 }, { Nota: "F#4", Duracion: 0.4 }, { Nota: "A4", Duracion: 0.6 },
            { Nota: "B4", Duracion: 0.4 }, { Nota: "A4", Duracion: 0.4 }, { Nota: "F#4", Duracion: 0.6 },
            { Nota: "E4", Duracion: 0.4 }, { Nota: "F#4", Duracion: 0.4 }, { Nota: "D4", Duracion: 0.8 }
        ],
        LetraConAcordes: `[D]Viva el Beni, tierra hermosa bendecida
[G]Con tus pampas, tus bajíos y tu [A]sol
[G]Es mi cuna donde florece la [D]vida
[A]Al compás del taquirari y su [D]canción.

[Coro]
[G]Cantan las aves en la espesura
[D]Bajo el cielo trinitario de esmeralda
[A]Tierra hermosa, bendecida y soberana
[D]¡Viva el Beni, mi orgullo y mi heredad!`,
        LetraLimpia: `Viva el Beni, tierra hermosa bendecida
Con tus pampas, tus bajíos y tu sol
Es mi cuna donde florece la vida
Al compás del taquirari y su canción.

[Coro]
Cantan las aves en la espesura
Bajo el cielo trinitario de esmeralda
Tierra hermosa, bendecida y soberana
¡Viva el Beni, mi orgullo y mi heredad!`
    },
    {
        IdCancion: 2,
        Titulo: "El Guajojó",
        Autor: "Tradicional Beniano / Recopilación IFAEL",
        Genero: "Chovena",
        TonoOriginal: "La Menor (Am)",
        TempoBPM: 116,
        EsEstudianteIFAEL: false,
        Descripcion: "Leyenda ancestral de la selva mojeña convertida en una melancólica y rítmica chovena.",
        Caratula: "LogoIniciales.png",
        ImagenPartitura: "IFAEL.jpg",
        SecuenciaNotasMelodia: [
            { Nota: "A4", Duracion: 0.5 }, { Nota: "C5", Duracion: 0.5 }, { Nota: "E5", Duracion: 0.5 },
            { Nota: "D5", Duracion: 0.5 }, { Nota: "C5", Duracion: 0.5 }, { Nota: "B4", Duracion: 0.5 },
            { Nota: "A4", Duracion: 1.0 }
        ],
        LetraConAcordes: `[Am]En la espesura del monte verde
[Dm]Llora una queja de desolación
[E7]Es el lamento del Guajojó que [Am]duele
[E7]Recordando su gran [Am]pasión.

[Coro]
[C]Guajojó, sombra de la selva
[G]Vuelo nocturno del monte [C]oriental
[F]Tu canto triste por siempre re[E7]suena
[Am]En el corazón de mi Trini[Am]dad.`,
        LetraLimpia: `En la espesura del monte verde
Llora una queja de desolación
Es el lamento del Guajojó que duele
Recordando su gran pasión.

[Coro]
Guajojó, sombra de la selva
Vuelo nocturno del monte oriental
Tu canto triste por siempre resuena
En el corazón de mi Trinidad.`
    },
    {
        IdCancion: 3,
        Titulo: "Trinidad Colonial y Festiva",
        Autor: "Maestros del IFAEL",
        Genero: "Carnavalito",
        TonoOriginal: "Sol Mayor (G)",
        TempoBPM: 130,
        EsEstudianteIFAEL: true,
        Descripcion: "Alegre carnavalito con bombos y flautas de caña mojeñas que revive el chuchío y la alegría beniana.",
        Caratula: "Logo1.png",
        ImagenPartitura: "IFAEL.jpg",
        SecuenciaNotasMelodia: [
            { Nota: "G4", Duracion: 0.3 }, { Nota: "B4", Duracion: 0.3 }, { Nota: "D5", Duracion: 0.4 },
            { Nota: "E5", Duracion: 0.3 }, { Nota: "D5", Duracion: 0.3 }, { Nota: "B4", Duracion: 0.4 },
            { Nota: "G4", Duracion: 0.6 }
        ],
        LetraConAcordes: `[G]Ya retumban los tambores en la plaza
[C]Llegan los macheteros con pa[D]sión
[G]Trinidad abre las puertas de su casa
[D]Para bailar este dulce son.

[Coro]
[C]¡Carnavalito de flores y aromas!
[G]Canta el chobena con gozo y calor
[D]Bajo la luna que besa las lomas
[G]Vibra en el Beni la fiesta y amor.`,
        LetraLimpia: `Ya retumban los tambores en la plaza
Llegan los macheteros con pasión
Trinidad abre las puertas de su casa
Para bailar este dulce son.

[Coro]
¡Carnavalito de flores y aromas!
Canta el chobena con gozo y calor
Bajo la luna que besa las lomas
Vibra en el Beni la fiesta y amor.`
    },
    {
        IdCancion: 4,
        Titulo: "Danza de los Macheteros",
        Autor: "Patrimonio Étnico Mojeño",
        Genero: "Danza Ritual / Sarao",
        TonoOriginal: "Mi Menor (Em)",
        TempoBPM: 96,
        EsEstudianteIFAEL: false,
        Descripcion: "La icónica melodía ceremonial de los Macheteros con sus plumajes de paraba y cascabeles de paichachí.",
        Caratula: "LogoInicialesSinFondoNegro.png",
        ImagenPartitura: "IFAEL.jpg",
        SecuenciaNotasMelodia: [
            { Nota: "E4", Duracion: 0.6 }, { Nota: "G4", Duracion: 0.3 }, { Nota: "B4", Duracion: 0.5 },
            { Nota: "A4", Duracion: 0.3 }, { Nota: "G4", Duracion: 0.3 }, { Nota: "E4", Duracion: 0.8 }
        ],
        LetraConAcordes: `[Em]Baten las plumas, relucen machetes
[B7]Hacia el sol que renace en el cielo
[Am]Suenan los pasos en el [Em]suelo
[B7]En devoción a la Santísima Trini[Em]dad.`,
        LetraLimpia: `Baten las plumas, relucen machetes
Hacia el sol que renace en el cielo
Suenan los pasos en el suelo
En devoción a la Santísima Trinidad.`
    }
];

window.DatosCancionesColeccion = DatosCancionesColeccion;
