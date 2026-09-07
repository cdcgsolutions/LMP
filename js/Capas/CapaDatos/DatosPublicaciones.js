/* ==========================================================================
   CAPA DE DATOS: PUBLICACIONES INICIALES DEL MURO (ESTILO FACEBOOK)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

const DatosPublicacionesIniciales = [
    {
        IdPublicacion: 101,
        NombreAutor: "Edna Miriam Edgley Cuellar",
        AvatarAutor: "Logo1.png",
        TiempoTranscurrido: "Hace 2 horas",
        EsVerificado: true,
        TextoPublicacion: "¡Querida comunidad de Letras Mi Poblau y compañeros del IFAEL! 🌿 Comparto con ustedes la letra completa y acordes de mi nueva composición 'Viva el Beni (Tierra Hermosa)'. Espero que todos en Trinidad la cantemos con el corazón bien en alto. ¡Viva el Beni!",
        IdCancionAsociada: 1,
        CantidadMeGusta: 142,
        TipoReaccionPredominante: "MeEnorgullece",
        ReaccionesDetalle: {
            MeGusta: 48,
            MeEncanta: 54,
            VivaBeni: 35,
            Aplausos: 5
        },
        CantidadCompartidos: 28,
        Comentarios: [
            {
                IdComentario: 1,
                NombreUsuario: "Franklin Santander Colque",
                AvatarUsuario: "LogoInicialesSinFondoBlanco.png",
                TextoComentario: "¡Felicidades Edna Miriam! Una obra con profundo sentimiento trinitario y beniano. Orgulloso de tu talento.",
                Tiempo: "Hace 1 hora",
                CantidadLikes: 12
            },
            {
                IdComentario: 2,
                NombreUsuario: "IFAEL Oficial",
                AvatarUsuario: "LogoInicialesSinFondoNegro.png",
                TextoComentario: "Excelente aporte al repertorio de la carrera de Técnico Superior en Música Boliviana. ¡A seguir componiendo!",
                Tiempo: "Hace 45 min",
                CantidadLikes: 9
            }
        ]
    },
    {
        IdPublicacion: 102,
        NombreAutor: "Instituto de Formación Artística Edelmira Limpias",
        AvatarAutor: "LogoInicialesSinFondoNegro.png",
        TiempoTranscurrido: "Hace 5 horas",
        EsVerificado: true,
        TextoPublicacion: "📜 ARCHIVO PATRIMONIAL DEL BENI: Presentamos la digitalización de la clásica Chovena 'El Guajojó'. En nuestro cancionero interactivo pueden consultar la letra, el análisis rítmico y escuchar la melodía demostrativa.",
        IdCancionAsociada: 2,
        CantidadMeGusta: 98,
        TipoReaccionPredominante: "MeEncanta",
        ReaccionesDetalle: {
            MeGusta: 30,
            MeEncanta: 45,
            VivaBeni: 18,
            Aplausos: 5
        },
        CantidadCompartidos: 19,
        Comentarios: [
            {
                IdComentario: 3,
                NombreUsuario: "Estudiante de Cuerdas IFAEL",
                AvatarUsuario: "Logo1.png",
                TextoComentario: "Hermosa versión. La tonalidad en La Menor permite un acompañamiento muy fluido en guitarra.",
                Tiempo: "Hace 3 horas",
                CantidadLikes: 6
            }
        ]
    },
    {
        IdPublicacion: 103,
        NombreAutor: "Archivo de Tradición Mojeña",
        AvatarAutor: "LogoIniciales.png",
        TiempoTranscurrido: "Ayer a las 18:30",
        EsVerificado: true,
        TextoPublicacion: "🪶 La Danza de los Macheteros es el latido vivo de la fe y el arte en el Beni. ¿Sabías que los bajones son construidos exclusivamente con hojas secas de palma enrolladas? Aquí compartimos su partitura de estudio.",
        IdCancionAsociada: 4,
        CantidadMeGusta: 215,
        TipoReaccionPredominante: "VivaBeni",
        ReaccionesDetalle: {
            MeGusta: 50,
            MeEncanta: 70,
            VivaBeni: 85,
            Aplausos: 10
        },
        CantidadCompartidos: 44,
        Comentarios: [
            {
                IdComentario: 4,
                NombreUsuario: "Músico de Cabildo",
                AvatarUsuario: "LogoInicialesSinFondoBlanco.png",
                TextoComentario: "Que esta música jamás se olvide. Gracias por digitalizarla para que las escuelas la enseñen.",
                Tiempo: "Hace 1 día",
                CantidadLikes: 18
            }
        ]
    }
];

window.DatosPublicacionesIniciales = DatosPublicacionesIniciales;
