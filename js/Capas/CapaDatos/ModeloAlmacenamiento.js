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
        this.EstaCargandoFirestore = true;

        this.CargarDesdeCacheLocal();
    }
    // #endregion

    // #region Sincronizacion y Fallback Local
    EstablecerServicioFirebase(Instancia) {
        this.ServicioFirebase = Instancia;
    }

    EstaSincronizandoDatos() {
        return !this.DatosCargadosDesdeFirestore || this.EstaCargandoFirestore === true;
    }

    CargarDesdeCacheLocal() {
        try {
            const CancionesEnBruto = localStorage.getItem(this.ClaveAlmacenamientoCanciones);
            this.Canciones = CancionesEnBruto ? JSON.parse(CancionesEnBruto) : [];
            if (Array.isArray(this.Canciones)) {
                this.Canciones.forEach(C => {
                    if (C.ImagenPartitura !== undefined && !C.ImagenPartituraUrl) {
                        C.ImagenPartituraUrl = C.ImagenPartitura !== "IFAEL.jpg" ? C.ImagenPartitura : "";
                    }
                    if (C.ImagenPartituraUrl === "IFAEL.jpg") {
                        C.ImagenPartituraUrl = "";
                    }
                    delete C.ImagenPartitura;
                    delete C.SecuenciaNotasMelodia;
                });
            }
        } catch (Error) {
            this.Canciones = [];
        }

        try {
            const PubEnBruto = localStorage.getItem(this.ClaveAlmacenamientoPublicaciones);
            this.Publicaciones = PubEnBruto ? JSON.parse(PubEnBruto) : [];
            if (Array.isArray(this.Publicaciones)) {
                this.Publicaciones.forEach(Pub => {
                    if (Pub.FechaCreacion) {
                        Pub.TiempoTranscurrido = this.FormatearTiempoRelativo(Pub.FechaCreacion);
                    }
                    if (Array.isArray(Pub.Comentarios)) {
                        Pub.Comentarios.forEach(Com => {
                            if (Com.FechaCreacion) {
                                Com.Tiempo = this.FormatearTiempoRelativo(Com.FechaCreacion);
                            }
                            if (!Array.isArray(Com.UsuariosLikes)) {
                                Com.UsuariosLikes = [];
                            }
                            delete Com.DioLikeUsuario;
                        });
                    }
                });
            }
        } catch (Error) {
            this.Publicaciones = [];
        }

        try {
            const GenEnBruto = localStorage.getItem(this.ClaveAlmacenamientoGeneros);
            this.Generos = GenEnBruto ? JSON.parse(GenEnBruto) : [];
            if (Array.isArray(this.Generos)) {
                this.Generos.forEach(G => {
                    if (!G.Color) {
                        G.Color = this.ExtraerColorSolidoDeGradiente(G.ColorGradiente);
                    }
                });
            }
        } catch (Error) {
            this.Generos = [];
        }

        try {
            const ArtEnBruto = localStorage.getItem(this.ClaveAlmacenamientoArtistas);
            this.Artistas = ArtEnBruto ? JSON.parse(ArtEnBruto) : [];
        } catch (Error) {
            this.Artistas = [];
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

        this.EstaCargandoFirestore = true;

        try {
            // 0. Usuarios (para perfiles y verificación)
            try {
                const SnapUsuarios = await this.ServicioFirebase.ColeccionUsuarios().get();
                if (!SnapUsuarios.empty) {
                    const UsuariosLeidos = [];
                    SnapUsuarios.forEach(Doc => {
                        const Data = Doc.data();
                        const { Institucion: _Inst, UltimoAcceso: _Ult, ...DatosUsuarioLimpio } = Data;
                        UsuariosLeidos.push({
                            IdUsuario: Doc.id,
                            ...DatosUsuarioLimpio,
                            NombreCompleto: Data.NombreCompleto || "",
                            Nombre: Data.NombreCompleto || "",
                            EsVerificado: Data.EsVerificado === true,
                            FotoPerfil: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                            FotoPerfilUrl: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                            FotoPortada: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                            FotoPortadaUrl: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                            Rol: Data.Rol || "Usuario",
                            Activo: Data.Activo !== undefined ? Data.Activo : true,
                            Ciudad: Data.Ciudad || "Trinidad, Beni",
                            CorreoElectronico: Data.CorreoElectronico || "",
                            FechaRegistro: Data.FechaRegistro || null,
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
                    const PartituraLeida = (Data.ImagenPartituraUrl && Data.ImagenPartituraUrl !== "IFAEL.jpg")
                        ? Data.ImagenPartituraUrl
                        : (Data.ImagenPartitura && Data.ImagenPartitura !== "IFAEL.jpg" ? Data.ImagenPartitura : "");

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
                        ImagenPartituraUrl: PartituraLeida,
                        AudioUrl: Data.AudioUrl || "",
                        LetraConAcordes: Data.LetraConAcordes || "",
                        LetraLimpia: Data.LetraLimpia || "",
                        FechaCreacion: Data.FechaCreacion || null,
                        Activa: Data.Activa !== undefined ? Data.Activa : true
                    });
                });
                this.Canciones = CancionesLeidas;
                localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));

                // Ejecutar limpieza automática en segundo plano de campos obsoletos en Firestore
                this.LimpiarCamposObsoletosEnFirestore().catch(e => console.warn("[ModeloAlmacenamiento] Limpieza en Firestore diferida:", e));
            }

            // 2. Géneros
            const SnapGeneros = await this.ServicioFirebase.ColeccionGeneros().get();
            if (!SnapGeneros.empty) {
                const GenerosLeidos = [];
                SnapGeneros.forEach(Doc => {
                    const Data = Doc.data();
                    const ColorFinal = Data.Color || (Data.ColorGradiente ? this.ExtraerColorSolidoDeGradiente(Data.ColorGradiente) : "#1877f2");
                    GenerosLeidos.push({
                        IdGenero: Doc.id,
                        Nombre: Data.Nombre || "",
                        Compas: Data.Compas || "",
                        Origen: Data.Origen || "",
                        Descripcion: Data.Descripcion || "",
                        Color: ColorFinal,
                        Icono: Data.Icono || (Data.IconoClase ? `<i class="${Data.IconoClase}"></i>` : '<i class="fa-solid fa-guitar"></i>'),
                        IconoClase: Data.IconoClase || "fa-solid fa-music",
                        InstrumentosTipicos: Data.InstrumentosTipicos || [],
                        TempoTipico: Data.TempoTipico || Data.Tempo || "",
                        Caracter: Data.Caracter || ""
                    });
                });
                this.Generos = GenerosLeidos;
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

                    ArtistasLeidos.push({
                        IdArtista: Doc.id,
                        NombreCompleto: NombreDoc,
                        NombreArtistico: Data.NombreArtistico || "",
                        RolTitulo: Data.RolTitulo || "",
                        Especialidad: Data.Especialidad || Data.GeneroMusical || "",
                        FechaNacimiento: Data.FechaNacimiento || "",
                        LugarNacimiento: Data.LugarNacimiento || Data.LugarOrigen || "",
                        LugarOrigen: Data.LugarOrigen || Data.LugarNacimiento || "",
                        GeneroMusical: Data.GeneroMusical || Data.Especialidad || "",
                        Institucion: Data.Institucion || "",
                        TrayectoriaAnos: Data.TrayectoriaAnos || 0,
                        Instrumentos: Array.isArray(Data.Instrumentos) ? Data.Instrumentos : (Data.Instrumentos ? [Data.Instrumentos] : []),
                        FotoPerfil: FotoPerfilFinal,
                        Biografia: Data.Biografia || "",
                        Inicios: Data.Inicios || "",
                        Trayectoria: Data.Trayectoria || "",
                        ObrasDestacadas: Array.isArray(Data.ObrasDestacadas) ? Data.ObrasDestacadas : [],
                        Legado: Data.Legado || "",
                        CitaCelebre: Data.CitaCelebre || "",
                        Activo: Data.Activo !== undefined ? Data.Activo : true
                    });
                });
                this.Artistas = ArtistasLeidos;
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
                        const DocsCom = SnapComentarios.docs || SnapComentarios;
                        if (DocsCom && typeof DocsCom.forEach === "function") {
                            DocsCom.forEach(DocCom => {
                                const ComData = DocCom.data();
                                const FechaComentario = ComData.FechaCreacion || ComData.createTime || null;
                                const UsuariosLikes = Array.isArray(ComData.UsuariosLikes) ? ComData.UsuariosLikes : [];
                                const CantidadLikes = (typeof ComData.CantidadLikes === "number")
                                    ? Math.max(ComData.CantidadLikes, UsuariosLikes.length)
                                    : UsuariosLikes.length;
                                Comentarios.push({
                                    IdComentario: DocCom.id,
                                    NombreUsuario: ComData.NombreUsuario || "Usuario LMP",
                                    AvatarUsuario: ComData.AvatarUsuario || "Logo1.png",
                                    TextoComentario: ComData.TextoComentario || "",
                                    FechaCreacion: FechaComentario,
                                    Tiempo: this.FormatearTiempoRelativo(FechaComentario),
                                    CantidadLikes: CantidadLikes,
                                    UsuariosLikes: UsuariosLikes
                                });
                            });
                        }
                    } catch (ErrCom) {
                        console.warn(ErrCom);
                    }

                    let ReaccionesDetalle = { MeGusta: 0, MeEncanta: 0, VivaBeni: 0, Aplausos: 0, BuenRitmo: 0 };
                    let TotalReacciones = 0;
                    let UsuariosReacciones = [];

                    try {
                        const SnapReacciones = await this.ServicioFirebase.SubcoleccionReacciones(IdPublicacion).get();
                        const DocsReac = SnapReacciones.docs || SnapReacciones;
                        if (DocsReac && typeof DocsReac.forEach === "function") {
                            const TiposValidos = ["MeGusta", "MeEncanta", "VivaBeni", "Aplausos", "BuenRitmo"];
                            DocsReac.forEach(DocReac => {
                                const ReacData = DocReac.data();
                                const Tipo = ReacData.TipoReaccion;
                                const Cantidad = Number(ReacData.CantidadTotal) || 1;
                                const NombreUsuarioReac = (ReacData.NombreUsuario || "").trim();

                                if (Cantidad > 0 && Tipo && TiposValidos.includes(Tipo) && NombreUsuarioReac) {
                                    const YaExiste = UsuariosReacciones.some(u => 
                                        u.NombreUsuario && u.NombreUsuario.trim().toLowerCase() === NombreUsuarioReac.toLowerCase()
                                    );
                                    if (!YaExiste) {
                                        ReaccionesDetalle[Tipo] = (ReaccionesDetalle[Tipo] || 0) + 1;
                                        TotalReacciones++;
                                        UsuariosReacciones.push({
                                            IdReaccion: DocReac.id,
                                            NombreUsuario: NombreUsuarioReac,
                                            TipoReaccion: Tipo
                                        });
                                    }
                                }
                            });
                        }
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

                    const NombrePublicadorPub = Data.NombrePublicador || Data.NombreAutor || "Usuario LMP";
                    let EsVerificadoAutor = false;
                    const UsuarioAutor = this.Usuarios.find(U => 
                        U.NombreCompleto && (
                            U.NombreCompleto.trim().toLowerCase() === NombrePublicadorPub.trim().toLowerCase() ||
                            NombrePublicadorPub.trim().toLowerCase().includes(U.NombreCompleto.trim().toLowerCase())
                        )
                    );
                    if (UsuarioAutor && UsuarioAutor.EsVerificado !== undefined) {
                        EsVerificadoAutor = UsuarioAutor.EsVerificado === true;
                    } else if (Data.EsVerificado !== undefined) {
                        EsVerificadoAutor = Data.EsVerificado === true;
                    }

                    const FechaPublicacion = Data.FechaCreacion || Data.createTime || null;
                    PublicacionesLeidas.push({
                        IdPublicacion: IdPublicacion,
                        NombrePublicador: NombrePublicadorPub,
                        NombreAutor: NombrePublicadorPub,
                        AvatarAutor: Data.AvatarAutor || "Logo1.png",
                        FechaCreacion: FechaPublicacion,
                        TiempoTranscurrido: this.FormatearTiempoRelativo(FechaPublicacion),
                        EsVerificado: EsVerificadoAutor,
                        TextoPublicacion: Data.TextoPublicacion || "",
                        IdCancionAsociada: IdCancionAsociada,
                        CantidadMeGusta: TotalReacciones,
                        TipoReaccionPredominante: TipoPredominante,
                        MiReaccionUsuario: null,
                        UsuariosReacciones: UsuariosReacciones,
                        ReaccionesDetalle: ReaccionesDetalle,
                        CantidadCompartidos: Data.CantidadCompartidos || 0,
                        Comentarios: Comentarios
                    });
                }

                this.Publicaciones = PublicacionesLeidas;
                localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));
            }

            this.DatosCargadosDesdeFirestore = true;
            return true;
        } catch (ErrorCapturado) {
            console.error("[ModeloAlmacenamiento] Error al cargar desde Firestore:", ErrorCapturado);
            return false;
        } finally {
            this.EstaCargandoFirestore = false;
            this.DatosCargadosDesdeFirestore = true;
        }
    }

    FormatearTiempoRelativo(Fecha) {
        if (!Fecha) return "Hace un momento";
        try {
            let FechaObj = null;
            if (Fecha instanceof Date) {
                FechaObj = isNaN(Fecha.getTime()) ? null : Fecha;
            } else if (typeof Fecha.toDate === "function") {
                FechaObj = Fecha.toDate();
            } else if (typeof Fecha === "object") {
                if (Fecha.seconds !== undefined) {
                    FechaObj = new Date(Fecha.seconds * 1000);
                } else if (Fecha._seconds !== undefined) {
                    FechaObj = new Date(Fecha._seconds * 1000);
                } else if (Fecha.timestampValue) {
                    FechaObj = new Date(Fecha.timestampValue);
                }
            } else if (typeof Fecha === "number") {
                FechaObj = new Date(Fecha < 1e11 ? Fecha * 1000 : Fecha);
            } else if (typeof Fecha === "string") {
                const Parseado = new Date(Fecha);
                if (!isNaN(Parseado.getTime())) {
                    FechaObj = Parseado;
                } else {
                    return Fecha;
                }
            }

            if (!FechaObj || isNaN(FechaObj.getTime())) {
                return typeof Fecha === "string" ? Fecha : "Hace un momento";
            }

            const Ahora = Date.now();
            const Segundos = Math.floor((Ahora - FechaObj.getTime()) / 1000);

            if (Segundos < 60) return "Hace un momento";

            const Minutos = Math.floor(Segundos / 60);
            if (Minutos < 60) {
                return Minutos === 1 ? "Hace 1 minuto" : `Hace ${Minutos} minutos`;
            }

            const Horas = Math.floor(Minutos / 60);
            if (Horas < 24) {
                return Horas === 1 ? "Hace 1 hora" : `Hace ${Horas} horas`;
            }

            const Dias = Math.floor(Horas / 24);
            if (Dias < 7) {
                return Dias === 1 ? "Hace 1 día" : `Hace ${Dias} días`;
            }

            const Semanas = Math.floor(Dias / 7);
            if (Semanas < 4) {
                return Semanas === 1 ? "Hace 1 semana" : `Hace ${Semanas} semanas`;
            }

            const Meses = Math.floor(Dias / 30);
            if (Meses < 12) {
                return Meses === 1 ? "Hace 1 mes" : `Hace ${Meses} meses`;
            }

            const Anios = Math.floor(Dias / 365);
            return Anios === 1 ? "Hace 1 año" : `Hace ${Anios} años`;
        } catch (ErrorCapturado) {
            return "Hace un momento";
        }
    }

    FormatearFechaCompleta(Fecha) {
        if (!Fecha) return "";
        try {
            let FechaObj = null;
            if (Fecha instanceof Date) {
                FechaObj = isNaN(Fecha.getTime()) ? null : Fecha;
            } else if (typeof Fecha.toDate === "function") {
                FechaObj = Fecha.toDate();
            } else if (typeof Fecha === "object") {
                if (Fecha.seconds !== undefined) FechaObj = new Date(Fecha.seconds * 1000);
                else if (Fecha._seconds !== undefined) FechaObj = new Date(Fecha._seconds * 1000);
                else if (Fecha.timestampValue) FechaObj = new Date(Fecha.timestampValue);
            } else if (typeof Fecha === "number") {
                FechaObj = new Date(Fecha < 1e11 ? Fecha * 1000 : Fecha);
            } else if (typeof Fecha === "string") {
                const Parseado = new Date(Fecha);
                if (!isNaN(Parseado.getTime())) FechaObj = Parseado;
            }
            if (!FechaObj || isNaN(FechaObj.getTime())) return "";
            return FechaObj.toLocaleString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (ErrorCapturado) {
            return "";
        }
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
        if (!Array.isArray(this.Canciones)) return null;
        return this.Canciones.find(C => 
            C.Titulo && (
                C.Titulo.toLowerCase().includes("himno al beni") ||
                C.Titulo.toLowerCase().includes("himno del beni") ||
                String(C.IdCancion).toLowerCase() === "himnoalbeni"
            )
        ) || null;
    }

    ObtenerTodasLasPublicaciones() {
        return this.Publicaciones || [];
    }

    ObtenerPublicacionPorId(IdPublicacionBuscada) {
        if (!IdPublicacionBuscada) return null;
        return this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacionBuscada));
    }

    ObtenerTodosLosGeneros() {
        return this.Generos || [];
    }

    async GuardarGeneroNuevo(DatosGenero) {
        if (!DatosGenero || !DatosGenero.Nombre) {
            throw new Error("El nombre del ritmo o género es obligatorio.");
        }

        const InstrumentosFinales = Array.isArray(DatosGenero.InstrumentosTipicos)
            ? DatosGenero.InstrumentosTipicos
            : (typeof DatosGenero.InstrumentosTipicos === "string"
                ? DatosGenero.InstrumentosTipicos.split(",").map(I => I.trim()).filter(Boolean)
                : []);

        const ObjetoGuardar = {
            Nombre: DatosGenero.Nombre.trim(),
            Compas: (DatosGenero.Compas || "").trim(),
            Origen: (DatosGenero.Origen || "").trim(),
            Descripcion: (DatosGenero.Descripcion || "").trim(),
            Color: (DatosGenero.Color || "#1877f2").trim(),
            IconoClase: (DatosGenero.IconoClase || "fa-solid fa-guitar").trim(),
            TempoTipico: (DatosGenero.TempoTipico || "").trim(),
            Caracter: (DatosGenero.Caracter || "").trim(),
            InstrumentosTipicos: InstrumentosFinales,
            FechaCreacion: (typeof firebase !== "undefined" && firebase.firestore && firebase.firestore.FieldValue)
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date().toISOString()
        };

        if (this.ServicioFirebase && typeof this.ServicioFirebase.ColeccionGeneros === "function") {
            try {
                const DocRef = await this.ServicioFirebase.ColeccionGeneros().add(ObjetoGuardar);
                const NuevoGenero = {
                    IdGenero: DocRef.id,
                    ...ObjetoGuardar,
                    Icono: `<i class="${ObjetoGuardar.IconoClase}"></i>`
                };

                this.Generos.unshift(NuevoGenero);
                localStorage.setItem(this.ClaveAlmacenamientoGeneros, JSON.stringify(this.Generos));
                return NuevoGenero;
            } catch (ErrorFirestore) {
                console.error("[ModeloAlmacenamiento] Error al guardar género en Firestore:", ErrorFirestore);
                throw ErrorFirestore;
            }
        }

        // Fallback local si no hay servicio Firebase
        const NuevoGeneroLocal = {
            IdGenero: "gen_" + Date.now(),
            ...ObjetoGuardar,
            Icono: `<i class="${ObjetoGuardar.IconoClase}"></i>`
        };
        this.Generos.unshift(NuevoGeneroLocal);
        localStorage.setItem(this.ClaveAlmacenamientoGeneros, JSON.stringify(this.Generos));
        return NuevoGeneroLocal;
    }

    ObtenerTodosLosArtistas() {
        const Lista = this.Artistas || [];
        if (Array.isArray(this.Usuarios) && this.Usuarios.length > 0) {
            Lista.forEach(Artista => {
                const UsuarioBD = this.Usuarios.find(U => 
                    U.NombreCompleto && Artista.NombreCompleto &&
                    (U.NombreCompleto.trim().toLowerCase() === Artista.NombreCompleto.trim().toLowerCase() ||
                     Artista.NombreCompleto.trim().toLowerCase().includes(U.NombreCompleto.trim().toLowerCase()))
                );
                if (UsuarioBD && UsuarioBD.FotoPerfil) {
                    Artista.FotoPerfil = UsuarioBD.FotoPerfil;
                }
            });
        }
        return Lista;
    }

    ObtenerArtistaPorId(IdArtista) {
        if (!IdArtista) return null;
        return (this.ObtenerTodosLosArtistas() || []).find(A => A.IdArtista === IdArtista) || null;
    }

    async GuardarArtistaNuevo(DatosArtista) {
        if (!DatosArtista || !DatosArtista.NombreCompleto) {
            throw new Error("El nombre completo del artista es obligatorio.");
        }

        const InstrumentosFinales = Array.isArray(DatosArtista.Instrumentos)
            ? DatosArtista.Instrumentos
            : (typeof DatosArtista.Instrumentos === "string"
                ? DatosArtista.Instrumentos.split(",").map(I => I.trim()).filter(Boolean)
                : []);

        const ObrasFinales = Array.isArray(DatosArtista.ObrasDestacadas)
            ? DatosArtista.ObrasDestacadas
            : (typeof DatosArtista.ObrasDestacadas === "string"
                ? DatosArtista.ObrasDestacadas.split(",").map(O => O.trim()).filter(Boolean)
                : []);

        const ObjetoGuardar = {
            NombreCompleto: DatosArtista.NombreCompleto.trim(),
            NombreArtistico: (DatosArtista.NombreArtistico || "").trim(),
            RolTitulo: (DatosArtista.RolTitulo || "").trim(),
            Especialidad: (DatosArtista.Especialidad || DatosArtista.GeneroMusical || "").trim(),
            FechaNacimiento: (DatosArtista.FechaNacimiento || "").trim(),
            LugarNacimiento: (DatosArtista.LugarNacimiento || "").trim(),
            LugarOrigen: (DatosArtista.LugarNacimiento || "").trim(),
            GeneroMusical: (DatosArtista.GeneroMusical || "").trim(),
            Institucion: (DatosArtista.Institucion || "").trim(),
            TrayectoriaAnos: DatosArtista.TrayectoriaAnos ? parseInt(DatosArtista.TrayectoriaAnos) : 0,
            Instrumentos: InstrumentosFinales,
            FotoPerfilUrl: DatosArtista.FotoPerfilUrl || DatosArtista.FotoPerfil || "Logo1.png",
            Biografia: (DatosArtista.Biografia || "").trim(),
            Inicios: (DatosArtista.Inicios || "").trim(),
            Trayectoria: (DatosArtista.Trayectoria || "").trim(),
            ObrasDestacadas: ObrasFinales,
            Legado: (DatosArtista.Legado || "").trim(),
            CitaCelebre: (DatosArtista.CitaCelebre || "").trim(),
            Activo: true,
            FechaCreacion: (typeof firebase !== "undefined" && firebase.firestore && firebase.firestore.FieldValue)
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date().toISOString()
        };

        if (this.ServicioFirebase && typeof this.ServicioFirebase.ColeccionArtistas === "function") {
            try {
                const DocRef = await this.ServicioFirebase.ColeccionArtistas().add(ObjetoGuardar);
                const NuevoArtista = {
                    IdArtista: DocRef.id,
                    ...ObjetoGuardar,
                    FotoPerfil: ObjetoGuardar.FotoPerfilUrl
                };

                if (!this.Artistas) this.Artistas = [];
                this.Artistas.unshift(NuevoArtista);
                localStorage.setItem(this.ClaveAlmacenamientoArtistas, JSON.stringify(this.Artistas));
                return NuevoArtista;
            } catch (ErrorGuardar) {
                console.error("[ModeloAlmacenamiento] Error al guardar artista en Firestore:", ErrorGuardar);
                throw ErrorGuardar;
            }
        } else {
            const IdGenerado = "art_" + Date.now();
            const NuevoArtista = {
                IdArtista: IdGenerado,
                ...ObjetoGuardar,
                FotoPerfil: ObjetoGuardar.FotoPerfilUrl,
                FotoPortada: ObjetoGuardar.FotoPortadaUrl
            };
            if (!this.Artistas) this.Artistas = [];
            this.Artistas.unshift(NuevoArtista);
            localStorage.setItem(this.ClaveAlmacenamientoArtistas, JSON.stringify(this.Artistas));
            return NuevoArtista;
        }
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

    ObtenerUsuarioPorCorreo(Correo) {
        if (!Correo) return null;
        const CorreoLimpio = Correo.trim().toLowerCase();
        if (Array.isArray(this.Usuarios) && this.Usuarios.length > 0) {
            return this.Usuarios.find(U => 
                U.CorreoElectronico && U.CorreoElectronico.trim().toLowerCase() === CorreoLimpio
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

                    const { Institucion: _InstAuth, UltimoAcceso: _UltAuth, ...DatosAuthLimpios } = Data;
                    const UsuarioAutenticado = {
                        IdUsuario: Doc.id,
                        ...DatosAuthLimpios,
                        NombreCompleto: Data.NombreCompleto || "",
                        Nombre: Data.NombreCompleto || "",
                        EsVerificado: Data.EsVerificado === true,
                        FotoPerfil: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                        FotoPerfilUrl: Data.FotoPerfilUrl || Data.FotoPerfil || "Logo1.png",
                        FotoPortada: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                        FotoPortadaUrl: Data.FotoPortadaUrl || Data.FotoPortada || "Logo1.png",
                        Rol: Data.Rol || "Usuario",
                        Activo: Data.Activo !== undefined ? Data.Activo : true,
                        Ciudad: Data.Ciudad || "Trinidad, Beni",
                        CorreoElectronico: Data.CorreoElectronico || "",
                        FechaRegistro: Data.FechaRegistro || null,
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

        const PartituraLimpia = (ObjetoCancion.ImagenPartituraUrl && ObjetoCancion.ImagenPartituraUrl !== "IFAEL.jpg")
            ? ObjetoCancion.ImagenPartituraUrl
            : (ObjetoCancion.ImagenPartitura && ObjetoCancion.ImagenPartitura !== "IFAEL.jpg" ? ObjetoCancion.ImagenPartitura : "");

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
                ImagenPartituraUrl: PartituraLimpia,
                AudioUrl: ObjetoCancion.AudioUrl || "",
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
        ObjetoCancion.ImagenPartituraUrl = PartituraLimpia;
        delete ObjetoCancion.ImagenPartitura;
        delete ObjetoCancion.SecuenciaNotasMelodia;

        this.Canciones.unshift(ObjetoCancion);
        localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));

        return ObjetoCancion;
    }

    async GuardarPublicacionNueva(ObjetoPublicacion) {
        let IdFinal = Date.now().toString();
        const AhoraIso = new Date().toISOString();
        ObjetoPublicacion.FechaCreacion = ObjetoPublicacion.FechaCreacion || AhoraIso;
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

        const PublicadorActual = ObjetoPublicacion.NombrePublicador || ObjetoPublicacion.NombreAutor || "Usuario LMP";
        const EsVerificadoActual = this.EsUsuarioVerificado(PublicadorActual, ObjetoPublicacion.EsVerificado === true);
        ObjetoPublicacion.NombrePublicador = PublicadorActual;
        ObjetoPublicacion.NombreAutor = PublicadorActual;
        ObjetoPublicacion.EsVerificado = EsVerificadoActual;

        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            const DocFirestore = {
                NombrePublicador: PublicadorActual,
                NombreAutor: PublicadorActual,
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
            const AhoraIso = new Date().toISOString();
            ObjetoComentario.IdComentario = Date.now().toString();
            ObjetoComentario.FechaCreacion = ObjetoComentario.FechaCreacion || AhoraIso;
            ObjetoComentario.Tiempo = "Hace un momento";
            ObjetoComentario.CantidadLikes = 0;
            ObjetoComentario.UsuariosLikes = [];
            delete ObjetoComentario.DioLikeUsuario;
            if (!Publicacion.Comentarios) Publicacion.Comentarios = [];
            Publicacion.Comentarios.push(ObjetoComentario);
            localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

            if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                this.ServicioFirebase.SubcoleccionComentarios(String(IdPublicacion)).add({
                    NombreUsuario: ObjetoComentario.NombreUsuario || "Usuario LMP",
                    AvatarUsuario: ObjetoComentario.AvatarUsuario || "Logo1.png",
                    TextoComentario: ObjetoComentario.TextoComentario || "",
                    CantidadLikes: 0,
                    UsuariosLikes: [],
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

    AlternarLikeEnComentario(IdPublicacion, IdComentario, NombreUsuario) {
        if (!NombreUsuario) return null;
        const Publicacion = this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));
        if (!Publicacion || !Publicacion.Comentarios) return null;

        const Comentario = Publicacion.Comentarios.find(Com => String(Com.IdComentario) === String(IdComentario));
        if (!Comentario) return null;

        if (!Array.isArray(Comentario.UsuariosLikes)) {
            Comentario.UsuariosLikes = [];
        }

        const NombreNorm = NombreUsuario.trim().toLowerCase();
        const Indice = Comentario.UsuariosLikes.findIndex(n => 
            typeof n === "string" && n.trim().toLowerCase() === NombreNorm
        );

        let DioLike = false;
        if (Indice !== -1) {
            Comentario.UsuariosLikes.splice(Indice, 1);
            DioLike = false;
        } else {
            Comentario.UsuariosLikes.push(NombreUsuario.trim());
            DioLike = true;
        }

        Comentario.CantidadLikes = Comentario.UsuariosLikes.length;
        delete Comentario.DioLikeUsuario;

        localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(this.Publicaciones));

        if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
            this.ServicioFirebase.SubcoleccionComentarios(String(IdPublicacion))
                .doc(String(IdComentario))
                .update({
                    CantidadLikes: Comentario.CantidadLikes,
                    UsuariosLikes: Comentario.UsuariosLikes
                })
                .catch(Error => {
                    console.warn("[ModeloAlmacenamiento] Error actualizando CantidadLikes en comentario:", Error);
                });
        }

        return { Publicacion, Comentario, DioLike };
    }

    RegistrarReaccionEnPublicacion(IdPublicacion, TipoReaccion, NombreUsuario) {
        if (!NombreUsuario || !IdPublicacion) return null;
        const TiposValidos = ["MeGusta", "MeEncanta", "VivaBeni", "Aplausos", "BuenRitmo"];
        if (!TiposValidos.includes(TipoReaccion)) return null;

        const PublicacionObjetivo = this.Publicaciones.find(Pub => String(Pub.IdPublicacion) === String(IdPublicacion));

        if (PublicacionObjetivo) {
            if (!PublicacionObjetivo.ReaccionesDetalle) {
                PublicacionObjetivo.ReaccionesDetalle = { MeGusta: 0, MeEncanta: 0, VivaBeni: 0, Aplausos: 0, BuenRitmo: 0 };
            }
            if (!Array.isArray(PublicacionObjetivo.UsuariosReacciones)) {
                PublicacionObjetivo.UsuariosReacciones = [];
            }

            const DocIdReac = "Usuario_" + encodeURIComponent(NombreUsuario.trim()).replace(/[^a-zA-Z0-9_]/g, "_");
            const NombreNorm = NombreUsuario.trim().toLowerCase();
            const IndiceUsuario = PublicacionObjetivo.UsuariosReacciones.findIndex(U => 
                U.NombreUsuario && U.NombreUsuario.trim().toLowerCase() === NombreNorm
            );
            const ReaccionPrevia = (IndiceUsuario !== -1) ? PublicacionObjetivo.UsuariosReacciones[IndiceUsuario].TipoReaccion : null;

            if (ReaccionPrevia === TipoReaccion) {
                // Quitar reacción (toggle off)
                if (PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] && PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] > 0) {
                    PublicacionObjetivo.ReaccionesDetalle[TipoReaccion]--;
                }
                if (IndiceUsuario !== -1) {
                    PublicacionObjetivo.UsuariosReacciones.splice(IndiceUsuario, 1);
                }
                PublicacionObjetivo.CantidadMeGusta = PublicacionObjetivo.UsuariosReacciones.length;

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
                }

                if (PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] !== undefined) {
                    PublicacionObjetivo.ReaccionesDetalle[TipoReaccion]++;
                } else {
                    PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] = 1;
                }

                if (IndiceUsuario !== -1) {
                    PublicacionObjetivo.UsuariosReacciones[IndiceUsuario].TipoReaccion = TipoReaccion;
                } else {
                    PublicacionObjetivo.UsuariosReacciones.push({
                        IdReaccion: DocIdReac,
                        NombreUsuario: NombreUsuario.trim(),
                        TipoReaccion: TipoReaccion
                    });
                }
                PublicacionObjetivo.CantidadMeGusta = PublicacionObjetivo.UsuariosReacciones.length;

                if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                    this.ServicioFirebase.SubcoleccionReacciones(String(IdPublicacion))
                        .doc(DocIdReac)
                        .set({
                            NombreUsuario: NombreUsuario.trim(),
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
            if (CamposActualizados.ImagenPartitura !== undefined && CamposActualizados.ImagenPartituraUrl === undefined) {
                CamposActualizados.ImagenPartituraUrl = CamposActualizados.ImagenPartitura;
            }
            if (CamposActualizados.ImagenPartituraUrl === "IFAEL.jpg") {
                CamposActualizados.ImagenPartituraUrl = "";
            }
            delete CamposActualizados.ImagenPartitura;
            delete CamposActualizados.SecuenciaNotasMelodia;

            this.Canciones[Indice] = { ...this.Canciones[Indice], ...CamposActualizados };
            delete this.Canciones[Indice].ImagenPartitura;
            delete this.Canciones[Indice].SecuenciaNotasMelodia;

            localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(this.Canciones));

            if (this.ServicioFirebase && this.ServicioFirebase.ObtenerFirestore()) {
                try {
                    const DocActualizar = { ...CamposActualizados };
                    delete DocActualizar.IdCancion;
                    delete DocActualizar.SecuenciaNotasMelodia;

                    if (DocActualizar.Caratula && !DocActualizar.CaratulaUrl) {
                        DocActualizar.CaratulaUrl = DocActualizar.Caratula;
                    }
                    if (DocActualizar.ImagenPartitura && !DocActualizar.ImagenPartituraUrl) {
                        DocActualizar.ImagenPartituraUrl = DocActualizar.ImagenPartitura;
                    }
                    delete DocActualizar.ImagenPartitura;

                    const FieldValue = window.firebase ? window.firebase.firestore.FieldValue : null;
                    if (FieldValue) {
                        DocActualizar.ImagenPartitura = FieldValue.delete();
                        DocActualizar.SecuenciaNotasMelodia = FieldValue.delete();
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

    async LimpiarCamposObsoletosEnFirestore() {
        if (!this.ServicioFirebase || !this.ServicioFirebase.ObtenerFirestore()) return;
        try {
            const SnapCanciones = await this.ServicioFirebase.ColeccionCanciones().get();
            if (SnapCanciones.empty) return;

            const FieldValue = window.firebase ? window.firebase.firestore.FieldValue : null;
            if (!FieldValue) return;

            const Promesas = [];
            SnapCanciones.forEach(Doc => {
                const Data = Doc.data();
                const CamposAjustar = {};

                // 1. Si existe ImagenPartitura (campo redundante), migrar a ImagenPartituraUrl y eliminarlo
                if (Data.ImagenPartitura !== undefined) {
                    if (!Data.ImagenPartituraUrl && Data.ImagenPartitura && Data.ImagenPartitura !== "IFAEL.jpg") {
                        CamposAjustar.ImagenPartituraUrl = Data.ImagenPartitura;
                    }
                    CamposAjustar.ImagenPartitura = FieldValue.delete();
                }

                // 2. Si ImagenPartituraUrl es "IFAEL.jpg", limpiarlo a vacío
                if (Data.ImagenPartituraUrl === "IFAEL.jpg") {
                    CamposAjustar.ImagenPartituraUrl = "";
                }

                // 3. Si existe SecuenciaNotasMelodia, eliminarlo
                if (Data.SecuenciaNotasMelodia !== undefined) {
                    CamposAjustar.SecuenciaNotasMelodia = FieldValue.delete();
                }

                if (Object.keys(CamposAjustar).length > 0) {
                    Promesas.push(Doc.ref.update(CamposAjustar));
                }
            });

            if (Promesas.length > 0) {
                await Promise.all(Promesas);
                console.log(`[ModeloAlmacenamiento] Limpieza en Firestore completada: ${Promesas.length} canciones migradas/limpiadas.`);
            }
        } catch (ErrLimpieza) {
            console.warn("[ModeloAlmacenamiento] Aviso durante la limpieza de campos obsoletos en Firestore:", ErrLimpieza);
        }
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

    ExtraerColorSolidoDeGradiente(TextoGradiente) {
        if (!TextoGradiente || typeof TextoGradiente !== "string") return "#1877f2";
        if (TextoGradiente.startsWith("#") || TextoGradiente.startsWith("rgb")) return TextoGradiente;
        const Coincidencia = TextoGradiente.match(/#(?:[0-9a-fA-F]{3,8})/);
        return Coincidencia ? Coincidencia[0] : "#1877f2";
    }
    // #endregion
}

window.ModeloAlmacenamiento = ModeloAlmacenamiento;
