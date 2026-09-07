/* ==========================================================================
   CAPA DE DATOS: MODELO DE ALMACENAMIENTO (CRUD FIRESTORE + LOCAL CACHE)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ModeloAlmacenamiento {
    // #region Propiedades y Constructor
    constructor(InstanciaServicioFirebase = null) {
        this.ServicioFirebase = InstanciaServicioFirebase;

        this.ClaveAlmacenamientoPublicaciones = "LMP_Publicaciones_v2";
        this.ClaveAlmacenamientoCanciones = "LMP_Canciones_v2";
        this.ClaveAlmacenamientoGeneros = "LMP_Generos_v1";
        this.ClaveAlmacenamientoArtistas = "LMP_Artistas_v1";
        this.ClaveAlmacenamientoIFAEL = "LMP_IFAEL_v1";
        this.ClaveAlmacenamientoTemaOscuro = "LMP_ModoOscuro_v1";
        this.ClaveAlmacenamientoUsuarios = "LMP_Usuarios_v1";

        this.Canciones = [];
        this.Publicaciones = [];
        this.Generos = [];
        this.Artistas = [];
        this.Usuarios = [];
        this.DatosIFAEL = null;
        this.DatosCargadosDesdeFirestore = false;

        this.CargarDesdeCacheLocal();
    }
    // #endregion

    // #region Sincronizacion y Fallback Local
    EstablecerServicioFirebase(Instancia) {
        this.ServicioFirebase = Instancia;
    }

    CargarDesdeCacheLocal() {
        try {
            const CancionesEnBruto = localStorage.getItem(this.ClaveAlmacenamientoCanciones);
            this.Canciones = CancionesEnBruto ? JSON.parse(CancionesEnBruto) : (window.DatosCancionesColeccion || []);
            this.Canciones = this.SanitizarCanciones(this.Canciones);
        } catch (Error) {
            this.Canciones = this.SanitizarCanciones(window.DatosCancionesColeccion || []);
        }

        try {
            const PubEnBruto = localStorage.getItem(this.ClaveAlmacenamientoPublicaciones);
            this.Publicaciones = PubEnBruto ? JSON.parse(PubEnBruto) : (window.DatosPublicacionesIniciales || []);
            this.Publicaciones = this.SanitizarPublicaciones(this.Publicaciones);
        } catch (Error) {
            this.Publicaciones = this.SanitizarPublicaciones(window.DatosPublicacionesIniciales || []);
        }

        try {
            const GenEnBruto = localStorage.getItem(this.ClaveAlmacenamientoGeneros);
            this.Generos = GenEnBruto ? JSON.parse(GenEnBruto) : (window.DatosGenerosColeccion || []);
        } catch (Error) {
            this.Generos = window.DatosGenerosColeccion || [];
        }

        try {
            const ArtEnBruto = localStorage.getItem(this.ClaveAlmacenamientoArtistas);
            this.Artistas = ArtEnBruto ? JSON.parse(ArtEnBruto) : (window.DatosArtistasColeccion || []);
        } catch (Error) {
            this.Artistas = window.DatosArtistasColeccion || [];
        }

        try {
            const UsuEnBruto = localStorage.getItem(this.ClaveAlmacenamientoUsuarios);
            this.Usuarios = UsuEnBruto ? JSON.parse(UsuEnBruto) : [];
        } catch (Error) {
            this.Usuarios = [];
        }

        try {
            const IFAELEnBruto = localStorage.getItem(this.ClaveAlmacenamientoIFAEL);
            this.DatosIFAEL = IFAELEnBruto ? JSON.parse(IFAELEnBruto) : null;
        } catch (Error) {
            this.DatosIFAEL = null;
        }
    }

    async CargarDatosDesdeFirestore() {
        if (!this.ServicioFirebase) return false;
        const db = this.ServicioFirebase.ObtenerFirestore();
        if (!db) return false;

        try {
            // 0. Usuarios (para perfiles y verificación)
            try {
                const SnapUsuarios = await this.ServicioFirebase.ColeccionUsuarios().get();
                if (!SnapUsuarios.empty) {
                    const UsuariosLeidos = [];
                    SnapUsuarios.forEach(Doc => {
                        const Data = Doc.data();
                        UsuariosLeidos.push({
                            IdUsuario: Doc.id,
                            NombreCompleto: Data.NombreCompleto || "",
                            EsVerificado: Data.EsVerificado === true,
                            FotoPerfil: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                            FotoPerfilUrl: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                            FotoPortada: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                            FotoPortadaUrl: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                            Institucion: Data.Institucion || "",
                            Rol: Data.Rol || "Usuario",
                            Activo: Data.Activo !== undefined ? Data.Activo : true,
                            Ciudad: Data.Ciudad || "Trinidad, Beni",
                            CorreoElectronico: Data.CorreoElectronico || "",
                            Contrasena: Data.Contrasena || Data.Password || ""
                        });
                    });
                    this.Usuarios = UsuariosLeidos;
                    localStorage.setItem(this.ClaveAlmacenamientoUsuarios, JSON.stringify(this.Usuarios));
                }
            } catch (ErrUsuarios) {
                console.warn("[ModeloAlmacenamiento] Error al cargar colección Usuarios:", ErrUsuarios);
            }

            // 1. Canciones
            const SnapCanciones = await this.ServicioFirebase.ColeccionCanciones().get();
            if (!SnapCanciones.empty) {
                const CancionesLeidas = [];
                SnapCanciones.forEach(Doc => {
                    const Data = Doc.data();
                    CancionesLeidas.push({
                        IdCancion: Doc.id,
                        Titulo: Data.Titulo || "Sin Título",
                        Autor: Data.Autor || "Autor Desconocido",
                        Genero: Data.Genero || "Taquirari",
                        TonoOriginal: Data.TonoOriginal || "Re Mayor (D)",
                        TempoBPM: Number(Data.TempoBPM) || 108,
                        EsEstudianteIFAEL: Data.EsEstudianteIFAEL !== undefined ? Data.EsEstudianteIFAEL : true,
                        Descripcion: Data.Descripcion || "",
                        Caratula: Data.CaratulaUrl || Data.Caratula || "Logo1.png",
                        ImagenPartitura: Data.ImagenPartituraUrl || Data.ImagenPartitura || "IFAEL.jpg",
                        AudioUrl: Data.AudioUrl || "",
                        SecuenciaNotasMelodia: Data.SecuenciaNotasMelodia || [],
                        LetraConAcordes: Data.LetraConAcordes || "",
                        LetraLimpia: Data.LetraLimpia || "",
                        FechaCreacion: Data.FechaCreacion || null,
                        Activa: Data.Activa !== undefined ? Data.Activa : true
                    });
                });
                this.Canciones = this.SanitizarCanciones(CancionesLeidas);
                localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));
            }

            // 2. Géneros
            const SnapGeneros = await this.ServicioFirebase.ColeccionGeneros().get();
            if (!SnapGeneros.empty) {
                const GenerosLeidos = [];
                SnapGeneros.forEach(Doc => {
                    const Data = Doc.data();
                    GenerosLeidos.push({
                        IdGenero: Doc.id,
                        Nombre: Data.Nombre || "",
                        Compas: Data.Compas || "",
                        Origen: Data.Origen || "",
                        Descripcion: Data.Descripcion || "",
                        ColorGradiente: Data.ColorGradiente || "linear-gradient(135deg, #1877f2, #0d5cb6)",
                        Icono: Data.Icono || (Data.IconoClase ? `<i class="${Data.IconoClase}"></i>` : '<i class="fa-solid fa-guitar"></i>'),
                        IconoClase: Data.IconoClase || "fa-solid fa-music",
                        InstrumentosTipicos: Data.InstrumentosTipicos || [],
                        CancionesRepresentativas: Data.CancionesRepresentativas || []
                    });
                });
                this.Generos = GenerosLeidos;
                window.DatosGenerosColeccion = this.Generos;
                localStorage.setItem(this.ClaveAlmacenamientoGeneros, JSON.stringify(this.Generos));
            }

            // 3. Artistas
            const SnapArtistas = await this.ServicioFirebase.ColeccionArtistas().get();
            if (!SnapArtistas.empty) {
                const ArtistasLeidos = [];
                SnapArtistas.forEach(Doc => {
                    const Data = Doc.data();
                    const NombreDoc = Data.NombreCompleto || "";
                    const UsuarioEnBD = (this.Usuarios || []).find(U => 
                        U.NombreCompleto && NombreDoc &&
                        (U.NombreCompleto.trim().toLowerCase() === NombreDoc.trim().toLowerCase() ||
                         NombreDoc.trim().toLowerCase().includes(U.NombreCompleto.trim().toLowerCase()))
                    );

                    const FotoPerfilFinal = (UsuarioEnBD && UsuarioEnBD.FotoPerfil) 
                        ? UsuarioEnBD.FotoPerfil 
                        : (Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png");

                    const FotoPortadaFinal = (UsuarioEnBD && UsuarioEnBD.FotoPortada) 
                        ? UsuarioEnBD.FotoPortada 
                        : (Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png");

                    ArtistasLeidos.push({
                        IdArtista: Doc.id,
                        NombreCompleto: NombreDoc,
                        RolTitulo: Data.RolTitulo || "",
                        Especialidad: Data.Especialidad || "",
                        FechaNacimiento: Data.FechaNacimiento || "",
                        LugarOrigen: Data.LugarOrigen || "",
                        Institucion: Data.Institucion || "",
                        FotoPerfil: FotoPerfilFinal,
                        FotoPortada: FotoPortadaFinal,
                        Biografia: Data.Biografia || "",
                        ObrasDestacadas: Data.ObrasDestacadas || [],
                        Seguidores: Data.SeguidoresCantidad || Data.Seguidores || "1.4k",
                        PublicacionesCantidad: Data.PublicacionesCantidad || 0
                    });
                });
                this.Artistas = ArtistasLeidos;
                window.DatosArtistasColeccion = this.Artistas;
                localStorage.setItem(this.ClaveAlmacenamientoArtistas, JSON.stringify(this.Artistas));
            }

            // 4. IFAEL
            const SnapIFAEL = await this.ServicioFirebase.ColeccionIFAEL().get();
            if (!SnapIFAEL.empty) {
                const DocIFAEL = SnapIFAEL.docs[0];
                this.DatosIFAEL = { IdIFAEL: DocIFAEL.id, ...DocIFAEL.data() };
                localStorage.setItem(this.ClaveAlmacenamientoIFAEL, JSON.stringify(this.DatosIFAEL));
            }

            // 5. Publicaciones, Comentarios y Reacciones
            let SnapPublicaciones;
            try {
                SnapPublicaciones = await this.ServicioFirebase.ColeccionPublicaciones().orderBy("FechaCreacion", "desc").get();
            } catch (ErrOrden) {
                SnapPublicaciones = await this.ServicioFirebase.ColeccionPublicaciones().get();
            }

            if (!SnapPublicaciones.empty) {
                const PublicacionesLeidas = [];
                for (const Doc of SnapPublicaciones.docs) {
                    const Data = Doc.data();
                    const IdPublicacion = Doc.id;

                    let Comentarios = [];
                    try {
                        const SnapComentarios = await this.ServicioFirebase.SubcoleccionComentarios(IdPublicacion).get();
                        SnapComentarios.forEach(DocCom => {
                            const ComData = DocCom.data();
                            Comentarios.push({
                                IdComentario: DocCom.id,
                                NombreUsuario: ComData.NombreUsuario || "Usuario LMP",
                                AvatarUsuario: ComData.AvatarUsuario || "Logo1.png",
                                TextoComentario: ComData.TextoComentario || "",
                                Tiempo: this.FormatearTiempoRelativo(ComData.FechaCreacion),
                                CantidadLikes: ComData.CantidadLikes || 0
                            });
                        });
                    } catch (ErrCom) {
                        console.warn(ErrCom);
                    }

                    let ReaccionesDetalle = { MeGusta: 0, MeEncanta: 0, VivaBeni: 0, Aplausos: 0, BuenRitmo: 0 };
                    let TotalReacciones = 0;
                    let UsuariosReacciones = [];
                    let MiReaccionUsuario = null;
                    const UsuarioActualLocal = "Edna Miriam Edgley Cuellar";

                    try {
                        const SnapReacciones = await this.ServicioFirebase.SubcoleccionReacciones(IdPublicacion).get();
                        SnapReacciones.forEach(DocReac => {
                            const ReacData = DocReac.data();
                            const Tipo = ReacData.TipoReaccion;
                            const Cantidad = Number(ReacData.CantidadTotal) || 1;
                            const NombreUsuarioReac = ReacData.NombreUsuario || "Usuario de la Comunidad";
                            if (Cantidad > 0 && Tipo) {
                                if (ReaccionesDetalle[Tipo] !== undefined) {
                                    ReaccionesDetalle[Tipo] += Cantidad;
                                } else {
                                    ReaccionesDetalle[Tipo] = Cantidad;
                                }
                                TotalReacciones += Cantidad;
                                UsuariosReacciones.push({
                                    IdReaccion: DocReac.id,
                                    NombreUsuario: NombreUsuarioReac,
                                    TipoReaccion: Tipo
                                });
                                if (NombreUsuarioReac === UsuarioActualLocal) {
                                    MiReaccionUsuario = Tipo;
                                }
                            }
                        });
                    } catch (ErrReac) {
                        console.warn(ErrReac);
                    }

                    let IdCancionAsociada = Data.IdCancionAsociada || null;
                    const CancionAsociadaExiste = IdCancionAsociada && this.Canciones.some(C => String(C.IdCancion) === String(IdCancionAsociada));
                    if (!CancionAsociadaExiste && this.Canciones.length > 0) {
                        const TextoPub = Data.TextoPublicacion || "";
                        const CancionEncontrada = this.Canciones.find(C =>
                            (C.Titulo && TextoPub.includes(C.Titulo)) || (C.Titulo && TextoPub.toLowerCase().includes(C.Titulo.toLowerCase()))
                        );
                        if (CancionEncontrada) {
                            IdCancionAsociada = CancionEncontrada.IdCancion;
                        }
                    }

                    let TipoPredominante = null;
                    let MaxVotos = 0;
                    for (const [Tipo, Cant] of Object.entries(ReaccionesDetalle)) {
                        if (Cant > MaxVotos) {
                            MaxVotos = Cant;
                            TipoPredominante = Tipo;
                        }
                    }

                    const NombreAutorPub = Data.NombreAutor || "Edna Miriam Edgley Cuellar";
                    let EsVerificadoAutor = false;
                    const UsuarioAutor = this.Usuarios.find(U => 
                        U.NombreCompleto && (
                            U.NombreCompleto.trim().toLowerCase() === NombreAutorPub.trim().toLowerCase() ||
                            NombreAutorPub.trim().toLowerCase().includes(U.NombreCompleto.trim().toLowerCase())
                        )
                    );
                    if (UsuarioAutor && UsuarioAutor.EsVerificado !== undefined) {
                        EsVerificadoAutor = UsuarioAutor.EsVerificado === true;
                    } else if (Data.EsVerificado !== undefined) {
                        EsVerificadoAutor = Data.EsVerificado === true;
                    }

                    PublicacionesLeidas.push({
                        IdPublicacion: IdPublicacion,
                        NombreAutor: NombreAutorPub,
                        AvatarAutor: Data.AvatarAutor || "Logo1.png",
                        TiempoTranscurrido: this.FormatearTiempoRelativo(Data.FechaCreacion),
                        EsVerificado: EsVerificadoAutor,
                        TextoPublicacion: Data.TextoPublicacion || "",
                        IdCancionAsociada: IdCancionAsociada,
                        CantidadMeGusta: TotalReacciones,
                        TipoReaccionPredominante: TipoPredominante,
                        MiReaccionUsuario: MiReaccionUsuario,
                        UsuariosReacciones: UsuariosReacciones,
                        ReaccionesDetalle: ReaccionesDetalle,
                        CantidadCompartidos: Data.CantidadCompartidos || 0,
                        Comentarios: Comentarios
                    });
                }

                this.Publicaciones = this.SanitizarPublicaciones(PublicacionesLeidas);
                localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));
            }

            this.DatosCargadosDesdeFirestore = true;
            return true;
        } catch (ErrorCapturado) {
            console.error("[ModeloAlmacenamiento] Error al cargar desde Firestore:", ErrorCapturado);
            return false;
        }
    }

    FormatearTiempoRelativo(Fecha) {
        if (!Fecha) return "Hace un momento";
        try {
            let FechaObj = Fecha;
            if (Fecha.toDate && typeof Fecha.toDate === "function") {
                FechaObj = Fecha.toDate();
            } else if (Fecha.seconds) {
                FechaObj = new Date(Fecha.seconds * 1000);
            } else if (!(Fecha instanceof Date)) {
                FechaObj = new Date(Fecha);
            }
            const Segundos = Math.floor((Date.now() - FechaObj.getTime()) / 1000);
            if (Segundos < 60) return "Hace un momento";
            const Minutos = Math.floor(Segundos / 60);
            if (Minutos < 60) return `Hace ${Minutos} min`;
            const Horas = Math.floor(Minutos / 60);
            if (Horas < 24) return `Hace ${Horas} h`;
            const Dias = Math.floor(Horas / 24);
            return `Hace ${Dias} d`;
        } catch (e) {
            return "Hace un momento";
        }
    }

    SanitizarCanciones(Canciones) {
        if (!Array.isArray(Canciones)) return [];
        return Canciones.map(Cancion => {
            if (Cancion.Autor && (Cancion.Autor.includes("Luci") || Cancion.Autor.includes("Xiomi") || Cancion.Autor.includes("Camacho"))) {
                Cancion.Autor = "Edna Miriam Edgley Cuellar";
            }
            return Cancion;
        });
    }

    SanitizarPublicaciones(Publicaciones) {
        if (!Array.isArray(Publicaciones)) return [];
        return Publicaciones.map(Pub => {
            if (Pub.NombreAutor && (Pub.NombreAutor.includes("Luci") || Pub.NombreAutor.includes("Xiomi") || Pub.NombreAutor.includes("Camacho"))) {
                Pub.NombreAutor = "Edna Miriam Edgley Cuellar";
            }
            if (this.Usuarios && this.Usuarios.length > 0) {
                Pub.EsVerificado = this.EsUsuarioVerificado(Pub.NombreAutor, Pub.EsVerificado === true);
            } else {
                Pub.EsVerificado = Pub.EsVerificado === true;
            }
            if (Array.isArray(Pub.Comentarios)) {
                Pub.Comentarios.forEach(C => {
                    if (C.TextoComentario) {
                        C.TextoComentario = C.TextoComentario.replace(/Xiomi/gi, "Edna Miriam").replace(/Luci/gi, "Edna");
                    }
                });
            }
            if (!Array.isArray(Pub.UsuariosReacciones)) {
                Pub.UsuariosReacciones = [];
            }
            return Pub;
        });
    }
    // #endregion

    // #region Metodos GET (Lectura)
    ObtenerTodasLasCanciones() {
        return this.Canciones || [];
    }

    ObtenerCancionPorId(IdCancionBuscada) {
        if (!IdCancionBuscada) return null;
        if (String(IdCancionBuscada).toLowerCase() === "himnoalbeni" || String(IdCancionBuscada).toLowerCase() === "himno-al-beni") {
            return this.ObtenerHimnoAlBeni();
        }
        return this.Canciones.find(CancionItem => String(CancionItem.IdCancion) === String(IdCancionBuscada));
    }

    ObtenerHimnoAlBeni() {
        return {
            IdCancion: "HimnoAlBeni",
            Titulo: "Himno al Beni",
            Autor: "Letra: Alfredo Pereyra L. • Música: Rafael Seghers",
            Genero: "Himno Cívico y Patriótico",
            TonoOriginal: "Mi Bemol Mayor (Eb)",
            TempoBPM: 112,
            EsEstudianteIFAEL: false,
            Descripcion: "Himno oficial del Departamento del Beni. Símbolo cívico y memoria histórica que ensalza el valor y la libertad de los pueblos benianos.",
            Caratula: "Logo1.png",
            ImagenPartitura: "IFAEL.jpg",
            AudioUrl: "HimnoAlBeni.mp3",
            LetraConAcordes: "[Eb]Canten victoriosos[Bb7]\nbolivianos con orgullo[Eb]\nla bendita tierra[Ab]\nde este suelo oriental[Eb].\n\n[Bb7]Donde el sol derrama lumbre[Eb]\nen sus pampas sin rival[Ab],\n[Eb]donde el río majestuoso[Bb7]\n[Eb]canta al Beni sin cesar.\n\n[Coro]\n[Ab]¡Viva el Beni, altivo y soberano![Eb]\n[Bb7]¡Viva el pueblo que sabe luchar![Eb]\n[Ab]¡Viva el Beni, el corazón de la patria,[Eb]\n[Bb7]reducto sagrado de la libertad![Eb]",
            LetraLimpia: "Canten victoriosos\nbolivianos con orgullo\nla bendita tierra\nde este suelo oriental.\n\nDonde el sol derrama lumbre\nen sus pampas sin rival,\ndonde el río majestuoso\ncanta al Beni sin cesar.\n\n[Coro]\n¡Viva el Beni, altivo y soberano!\n¡Viva el pueblo que sabe luchar!\n¡Viva el Beni, el corazón de la patria,\nreducto sagrado de la libertad!"
        };
    }

    ObtenerTodasLasPublicaciones() {
        return this.Publicaciones || [];
    }

    ObtenerPublicacionPorId(IdPublicacionBuscada) {
        if (!IdPublicacionBuscada) return null;
        return this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacionBuscada));
    }

    ObtenerTodosLosGeneros() {
        return this.Generos && this.Generos.length > 0 ? this.Generos : (window.DatosGenerosColeccion || []);
    }

    ObtenerTodosLosArtistas() {
        const Lista = this.Artistas && this.Artistas.length > 0 ? this.Artistas : (window.DatosArtistasColeccion || []);
        if (Array.isArray(this.Usuarios) && this.Usuarios.length > 0) {
            Lista.forEach(Artista => {
                const UsuarioBD = this.Usuarios.find(U => 
                    U.NombreCompleto && Artista.NombreCompleto &&
                    (U.NombreCompleto.trim().toLowerCase() === Artista.NombreCompleto.trim().toLowerCase() ||
                     Artista.NombreCompleto.trim().toLowerCase().includes(U.NombreCompleto.trim().toLowerCase()))
                );
                if (UsuarioBD) {
                    if (UsuarioBD.FotoPerfil) Artista.FotoPerfil = UsuarioBD.FotoPerfil;
                    if (UsuarioBD.FotoPortada) Artista.FotoPortada = UsuarioBD.FotoPortada;
                    if (UsuarioBD.EsVerificado !== undefined) Artista.EsVerificado = UsuarioBD.EsVerificado;
                }
            });
        }
        return Lista;
    }

    ObtenerDatosIFAEL() {
        return this.DatosIFAEL;
    }

    ObtenerTodosLosUsuarios() {
        return this.Usuarios || [];
    }

    EsUsuarioVerificado(NombreUsuario, Fallback = null) {
        if (!NombreUsuario) return false;
        if (Array.isArray(this.Usuarios) && this.Usuarios.length > 0) {
            const Usuario = this.Usuarios.find(U => 
                U.NombreCompleto && (
                    U.NombreCompleto.trim().toLowerCase() === NombreUsuario.trim().toLowerCase() ||
                    NombreUsuario.trim().toLowerCase().includes(U.NombreCompleto.trim().toLowerCase())
                )
            );
            if (Usuario && Usuario.EsVerificado !== undefined) {
                return Usuario.EsVerificado === true;
            }
        }
        if (Fallback !== null && Fallback !== undefined) {
            return Fallback === true;
        }
        return false;
    }

    ObtenerUsuarioPorNombre(NombreUsuario) {
        if (!NombreUsuario) return null;
        if (Array.isArray(this.Usuarios) && this.Usuarios.length > 0) {
            return this.Usuarios.find(U => 
                U.NombreCompleto && U.NombreCompleto.trim().toLowerCase() === NombreUsuario.trim().toLowerCase()
            ) || null;
        }
        return null;
    }

    async AutenticarUsuarioEnBaseDatos(Correo, Contrasena) {
        if (!Correo || !Contrasena) {
            return { Exito: false, Mensaje: "Por favor ingresa tu correo y contraseña." };
        }

        const CorreoLimpio = Correo.trim().toLowerCase();

        // 1. Intentar consultar directamente en Firestore en tiempo real
        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            try {
                let Snap = await this.ServicioFirebase.ColeccionUsuarios()
                    .where("CorreoElectronico", "==", CorreoLimpio)
                    .get();

                let DocEncontrado = null;
                if (!Snap.empty) {
                    DocEncontrado = Snap.docs[0];
                } else {
                    const SnapTodos = await this.ServicioFirebase.ColeccionUsuarios().get();
                    if (!SnapTodos.empty) {
                        DocEncontrado = SnapTodos.docs.find(D => {
                            const EmailBD = D.data().CorreoElectronico || "";
                            return EmailBD.trim().toLowerCase() === CorreoLimpio;
                        }) || null;
                    }
                }

                if (DocEncontrado) {
                    const Doc = DocEncontrado;
                    const Data = Doc.data();
                    const PassBD = Data.Contrasena || Data.Password || "";

                    if (!PassBD) {
                        return { Exito: false, Mensaje: "El usuario no tiene una contraseña configurada en la base de datos." };
                    }

                    if (PassBD !== Contrasena) {
                        return { Exito: false, Mensaje: "Contraseña incorrecta. Verifica tus credenciales." };
                    }

                    const UsuarioAutenticado = {
                        IdUsuario: Doc.id,
                        NombreCompleto: Data.NombreCompleto || "",
                        Nombre: Data.NombreCompleto || "",
                        EsVerificado: Data.EsVerificado === true,
                        FotoPerfil: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                        FotoPerfilUrl: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                        FotoPortada: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                        FotoPortadaUrl: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                        Institucion: Data.Institucion || "",
                        Rol: Data.Rol || "Usuario",
                        Activo: Data.Activo !== undefined ? Data.Activo : true,
                        Ciudad: Data.Ciudad || "Trinidad, Beni",
                        CorreoElectronico: Data.CorreoElectronico || "",
                        Contrasena: PassBD
                    };

                    // Actualizar cache local
                    const Indice = this.Usuarios.findIndex(U => U.IdUsuario === Doc.id);
                    if (Indice !== -1) {
                        this.Usuarios[Indice] = UsuarioAutenticado;
                    } else {
                        this.Usuarios.push(UsuarioAutenticado);
                    }
                    localStorage.setItem(this.ClaveAlmacenamientoUsuarios, JSON.stringify(this.Usuarios));

                    return { Exito: true, Usuario: UsuarioAutenticado };
                }
            } catch (ErrFirestore) {
                console.warn("[ModeloAlmacenamiento] Error al consultar usuario en tiempo real:", ErrFirestore);
            }
        }

        // 2. Consulta en memoria / localStorage como respaldo
        const UsuarioLocal = (this.Usuarios || []).find(U => 
            U.CorreoElectronico && U.CorreoElectronico.toLowerCase() === CorreoLimpio
        );

        if (!UsuarioLocal) {
            return { Exito: false, Mensaje: "El correo electrónico no está registrado en el sistema." };
        }

        const PassLocal = UsuarioLocal.Contrasena || "";
        if (!PassLocal) {
            return { Exito: false, Mensaje: "El usuario no tiene una contraseña configurada en la base de datos." };
        }

        if (PassLocal !== Contrasena) {
            return { Exito: false, Mensaje: "Contraseña incorrecta. Verifica tus credenciales." };
        }

        return { Exito: true, Usuario: UsuarioLocal };
    }

    ObtenerEstadoTemaOscuro() {
        return localStorage.getItem(this.ClaveAlmacenamientoTemaOscuro) === "true";
    }
    // #endregion

    // #region Metodos POST (Creacion)
    async GuardarCancionNueva(ObjetoCancion) {
        let IdFinal = Date.now().toString();

        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            const DocFirestore = {
                Titulo: ObjetoCancion.Titulo || "",
                Autor: ObjetoCancion.Autor || "Edna Miriam Edgley Cuellar",
                Genero: ObjetoCancion.Genero || "Taquirari",
                TonoOriginal: ObjetoCancion.TonoOriginal || "Re Mayor (D)",
                TempoBPM: Number(ObjetoCancion.TempoBPM) || 108,
                EsEstudianteIFAEL: ObjetoCancion.EsEstudianteIFAEL !== undefined ? ObjetoCancion.EsEstudianteIFAEL : true,
                Descripcion: ObjetoCancion.Descripcion || "",
                CaratulaUrl: ObjetoCancion.Caratula || ObjetoCancion.CaratulaUrl || "Logo1.png",
                ImagenPartituraUrl: ObjetoCancion.ImagenPartitura || ObjetoCancion.ImagenPartituraUrl || "IFAEL.jpg",
                AudioUrl: ObjetoCancion.AudioUrl || "",
                SecuenciaNotasMelodia: ObjetoCancion.SecuenciaNotasMelodia || [],
                LetraConAcordes: ObjetoCancion.LetraConAcordes || "",
                LetraLimpia: ObjetoCancion.LetraLimpia || "",
                FechaCreacion: this.ServicioFirebase.MarcaDeTiempoServidor(),
                Activa: true
            };

            try {
                const DocRef = await this.ServicioFirebase.ColeccionCanciones().add(DocFirestore);
                if (DocRef && DocRef.id) {
                    IdFinal = DocRef.id;
                }
            } catch (Error) {
                console.error("[ModeloAlmacenamiento] Error al guardar canción en Firestore:", Error);
            }
        }

        ObjetoCancion.IdCancion = IdFinal;
        this.Canciones.unshift(ObjetoCancion);
        localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));

        return ObjetoCancion;
    }

    async GuardarPublicacionNueva(ObjetoPublicacion) {
        let IdFinal = Date.now().toString();
        ObjetoPublicacion.TiempoTranscurrido = "Hace un momento";
        ObjetoPublicacion.CantidadMeGusta = 0;
        ObjetoPublicacion.TipoReaccionPredominante = null;
        ObjetoPublicacion.MiReaccionUsuario = null;
        ObjetoPublicacion.UsuariosReacciones = [];
        ObjetoPublicacion.ReaccionesDetalle = {
            MeGusta: 0,
            MeEncanta: 0,
            VivaBeni: 0,
            Aplausos: 0,
            BuenRitmo: 0
        };
        ObjetoPublicacion.CantidadCompartidos = 0;
        ObjetoPublicacion.Comentarios = [];

        const AutorActual = ObjetoPublicacion.NombreAutor || "Edna Miriam Edgley Cuellar";
        const EsVerificadoActual = this.EsUsuarioVerificado(AutorActual, ObjetoPublicacion.EsVerificado === true);
        ObjetoPublicacion.EsVerificado = EsVerificadoActual;

        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            const DocFirestore = {
                NombreAutor: AutorActual,
                AvatarAutor: ObjetoPublicacion.AvatarAutor || "Logo1.png",
                TextoPublicacion: ObjetoPublicacion.TextoPublicacion || "",
                EsVerificado: EsVerificadoActual,
                IdCancionAsociada: ObjetoPublicacion.IdCancionAsociada || null,
                CantidadMeGusta: 0,
                CantidadCompartidos: 0,
                EsEditada: false,
                FechaCreacion: this.ServicioFirebase.MarcaDeTiempoServidor(),
                Activa: true
            };

            try {
                const DocRef = await this.ServicioFirebase.ColeccionPublicaciones().add(DocFirestore);
                if (DocRef && DocRef.id) {
                    IdFinal = DocRef.id;
                }
            } catch (Error) {
                console.error("[ModeloAlmacenamiento] Error al guardar publicación en Firestore:", Error);
            }
        }

        ObjetoPublicacion.IdPublicacion = IdFinal;
        this.Publicaciones.unshift(ObjetoPublicacion);
        localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

        return ObjetoPublicacion;
    }

    AgregarComentarioAPublicacion(IdPublicacion, ObjetoComentario) {
        const Publicacion = this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));

        if (Publicacion) {
            ObjetoComentario.IdComentario = Date.now().toString();
            ObjetoComentario.Tiempo = "Hace un momento";
            ObjetoComentario.CantidadLikes = 0;
            ObjetoComentario.DioLikeUsuario = false;
            if (!Publicacion.Comentarios) Publicacion.Comentarios = [];
            Publicacion.Comentarios.push(ObjetoComentario);
            localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

            if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                this.ServicioFirebase.SubcoleccionComentarios(String(IdPublicacion)).add({
                    NombreUsuario: ObjetoComentario.NombreUsuario || "Edna Miriam Edgley Cuellar",
                    AvatarUsuario: ObjetoComentario.AvatarUsuario || "Logo1.png",
                    TextoComentario: ObjetoComentario.TextoComentario || "",
                    CantidadLikes: 0,
                    FechaCreacion: this.ServicioFirebase.MarcaDeTiempoServidor(),
                    Activo: true
                }).then(DocRef => {
                    ObjetoComentario.IdComentario = DocRef.id;
                }).catch(Error => {
                    console.error("[ModeloAlmacenamiento] Error al guardar comentario:", Error);
                });
            }

            return Publicacion;
        }
        return null;
    }

    AlternarLikeEnComentario(IdPublicacion, IdComentario) {
        const Publicacion = this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));
        if (!Publicacion || !Publicacion.Comentarios) return null;

        const Comentario = Publicacion.Comentarios.find(Com => String(Com.IdComentario) === String(IdComentario));
        if (!Comentario) return null;

        if (Comentario.DioLikeUsuario) {
            Comentario.DioLikeUsuario = false;
            Comentario.CantidadLikes = Math.max(0, (Number(Comentario.CantidadLikes) || 1) - 1);
        } else {
            Comentario.DioLikeUsuario = true;
            Comentario.CantidadLikes = (Number(Comentario.CantidadLikes) || 0) + 1;
        }

        localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            this.ServicioFirebase.SubcoleccionComentarios(String(IdPublicacion))
                .doc(String(IdComentario))
                .update({
                    CantidadLikes: Comentario.CantidadLikes
                })
                .catch(Error => {
                    console.warn("[ModeloAlmacenamiento] Error actualizando CantidadLikes en comentario:", Error);
                });
        }

        return { Publicacion, Comentario };
    }

    RegistrarReaccionEnPublicacion(IdPublicacion, TipoReaccion, NombreUsuario = "Edna Miriam Edgley Cuellar") {
        const PublicacionObjetivo = this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));

        if (PublicacionObjetivo) {
            if (!PublicacionObjetivo.ReaccionesDetalle) {
                PublicacionObjetivo.ReaccionesDetalle = { MeGusta: 0, MeEncanta: 0, VivaBeni: 0, Aplausos: 0, BuenRitmo: 0 };
            }
            if (!Array.isArray(PublicacionObjetivo.UsuariosReacciones)) {
                PublicacionObjetivo.UsuariosReacciones = [];
            }

            const ReaccionPrevia = PublicacionObjetivo.MiReaccionUsuario;
            const DocIdReac = "Usuario_" + encodeURIComponent(NombreUsuario).replace(/[^a-zA-Z0-9_]/g, "_");
            const IndiceUsuario = PublicacionObjetivo.UsuariosReacciones.findIndex(U => U.NombreUsuario === NombreUsuario);

            if (ReaccionPrevia === TipoReaccion) {
                // Quitar reacción (toggle off)
                if (PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] && PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] > 0) {
                    PublicacionObjetivo.ReaccionesDetalle[TipoReaccion]--;
                }
                PublicacionObjetivo.CantidadMeGusta = Math.max(0, (PublicacionObjetivo.CantidadMeGusta || 1) - 1);
                PublicacionObjetivo.MiReaccionUsuario = null;

                if (IndiceUsuario !== -1) {
                    PublicacionObjetivo.UsuariosReacciones.splice(IndiceUsuario, 1);
                }

                if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                    this.ServicioFirebase.SubcoleccionReacciones(String(IdPublicacion))
                        .doc(DocIdReac)
                        .delete()
                        .catch(Error => {
                            console.warn("[ModeloAlmacenamiento] Error al eliminar reacción:", Error);
                        });
                    this.ServicioFirebase.ColeccionPublicaciones().doc(String(IdPublicacion)).update({
                        CantidadMeGusta: PublicacionObjetivo.CantidadMeGusta
                    }).catch(e => console.warn(e));
                }
            } else {
                // Cambiar o añadir reacción
                if (ReaccionPrevia && PublicacionObjetivo.ReaccionesDetalle[ReaccionPrevia] && PublicacionObjetivo.ReaccionesDetalle[ReaccionPrevia] > 0) {
                    PublicacionObjetivo.ReaccionesDetalle[ReaccionPrevia]--;
                } else if (!ReaccionPrevia) {
                    PublicacionObjetivo.CantidadMeGusta = (PublicacionObjetivo.CantidadMeGusta || 0) + 1;
                }

                if (PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] !== undefined) {
                    PublicacionObjetivo.ReaccionesDetalle[TipoReaccion]++;
                } else {
                    PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] = 1;
                }

                PublicacionObjetivo.MiReaccionUsuario = TipoReaccion;

                if (IndiceUsuario !== -1) {
                    PublicacionObjetivo.UsuariosReacciones[IndiceUsuario].TipoReaccion = TipoReaccion;
                } else {
                    PublicacionObjetivo.UsuariosReacciones.push({
                        IdReaccion: DocIdReac,
                        NombreUsuario: NombreUsuario,
                        TipoReaccion: TipoReaccion
                    });
                }

                if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                    this.ServicioFirebase.SubcoleccionReacciones(String(IdPublicacion))
                        .doc(DocIdReac)
                        .set({
                            NombreUsuario: NombreUsuario,
                            TipoReaccion: TipoReaccion,
                            CantidadTotal: 1,
                            FechaActualizacion: this.ServicioFirebase.MarcaDeTiempoServidor()
                        })
                        .catch(Error => {
                            console.warn("[ModeloAlmacenamiento] Error al guardar reacción:", Error);
                        });
                    this.ServicioFirebase.ColeccionPublicaciones().doc(String(IdPublicacion)).update({
                        CantidadMeGusta: PublicacionObjetivo.CantidadMeGusta
                    }).catch(e => console.warn(e));
                }
            }

            // Recalcular reacción predominante
            let MaxVotos = 0;
            let TipoPred = null;
            for (const [Tipo, Cant] of Object.entries(PublicacionObjetivo.ReaccionesDetalle)) {
                if (Cant > MaxVotos) {
                    MaxVotos = Cant;
                    TipoPred = Tipo;
                }
            }
            PublicacionObjetivo.TipoReaccionPredominante = TipoPred;

            localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));
            return PublicacionObjetivo;
        }
        return null;
    }
    // #endregion

    // #region Metodos PUT (Actualizacion)
    async ActualizarPublicacion(IdPublicacion, CamposActualizados) {
        const Indice = this.Publicaciones.findIndex(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));
        if (Indice !== -1) {
            this.Publicaciones[Indice] = { ...this.Publicaciones[Indice], ...CamposActualizados };
            localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

            if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                try {
                    const DocActualizar = { ...CamposActualizados };
                    delete DocActualizar.IdPublicacion;
                    await this.ServicioFirebase.ColeccionPublicaciones().doc(String(IdPublicacion)).update(DocActualizar);
                } catch (Error) {
                    console.error("[ModeloAlmacenamiento] Error al actualizar publicación:", Error);
                }
            }
            return this.Publicaciones[Indice];
        }
        return null;
    }

    async ActualizarCancion(IdCancion, CamposActualizados) {
        const Indice = this.Canciones.findIndex(C => String(C.IdCancion) === String(IdCancion));
        if (Indice !== -1) {
            this.Canciones[Indice] = { ...this.Canciones[Indice], ...CamposActualizados };
            localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));

            if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                try {
                    const DocActualizar = { ...CamposActualizados };
                    delete DocActualizar.IdCancion;
                    if (DocActualizar.Caratula && !DocActualizar.CaratulaUrl) {
                        DocActualizar.CaratulaUrl = DocActualizar.Caratula;
                    }
                    if (DocActualizar.ImagenPartitura && !DocActualizar.ImagenPartituraUrl) {
                        DocActualizar.ImagenPartituraUrl = DocActualizar.ImagenPartitura;
                    }
                    await this.ServicioFirebase.ColeccionCanciones().doc(String(IdCancion)).update(DocActualizar);
                } catch (Error) {
                    console.error("[ModeloAlmacenamiento] Error al actualizar canción:", Error);
                }
            }
            return this.Canciones[Indice];
        }
        return null;
    }

    GuardarEstadoTemaOscuro(EsTemaOscuro) {
        localStorage.setItem(this.ClaveAlmacenamientoTemaOscuro, String(EsTemaOscuro));
    }
    // #endregion

    // #region Metodos DELETE (Eliminacion)
    async EliminarPublicacion(IdPublicacion, EliminarCancionAsociada = true) {
        const Indice = this.Publicaciones.findIndex(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));
        if (Indice === -1) return false;

        const Publicacion = this.Publicaciones[Indice];
        let IdCancionAsociada = Publicacion.IdCancionAsociada;

        if (!IdCancionAsociada && Publicacion.TextoPublicacion) {
            const CancionEncontrada = this.Canciones.find(C =>
                C.Titulo && Publicacion.TextoPublicacion.toLowerCase().includes(C.Titulo.toLowerCase())
            );
            if (CancionEncontrada) {
                IdCancionAsociada = CancionEncontrada.IdCancion;
            }
        }

        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            try {
                if (this.ServicioFirebase.EliminarPublicacionConSubcolecciones) {
                    await this.ServicioFirebase.EliminarPublicacionConSubcolecciones(IdPublicacion);
                } else {
                    await this.ServicioFirebase.ColeccionPublicaciones().doc(String(IdPublicacion)).delete();
                }
            } catch (Error) {
                console.error("[ModeloAlmacenamiento] Error al eliminar publicación en Firestore:", Error);
            }
        }

        if (EliminarCancionAsociada && IdCancionAsociada) {
            await this.EliminarCancion(IdCancionAsociada);
        }

        this.Publicaciones.splice(Indice, 1);
        localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

        return true;
    }

    async EliminarCancion(IdCancion) {
        const Indice = this.Canciones.findIndex(C => String(C.IdCancion) === String(IdCancion));
        if (Indice !== -1) {
            this.Canciones.splice(Indice, 1);
            localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));

            if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                try {
                    await this.ServicioFirebase.ColeccionCanciones().doc(String(IdCancion)).delete();
                } catch (Error) {
                    console.error("[ModeloAlmacenamiento] Error al eliminar canción en Firestore:", Error);
                }
            }
            return true;
        }
        return false;
    }
    // #endregion
}

window.ModeloAlmacenamiento = ModeloAlmacenamiento;
