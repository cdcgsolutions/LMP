/* ==========================================================================
   PANEL DE GESTIÓN Y CARGA DE CONTENIDO - LETRAS DE MI POBLAO (LMP)
   Controlador Lógico del Panel Administrativo Organizado por Secciones Oficiales
   ========================================================================== */

class PanelGestionLMP {
    constructor() {
        this.Firebase = null;
        this.Cloudinary = null;
        this.UsuarioSesion = null;

        // Datos en memoria
        this.Canciones = [];
        this.Partituras = [];
        this.Generos = [];
        this.Artistas = [];
        this.IFAEL = null;
        this.AcercaDeNosotros = null;
        this.Usuarios = [];

        // Estados de edición activa
        this.CancionEnEdicionId = null;
        this.PartituraEnEdicionId = null;
        this.ArtistaEnEdicionId = null;
        this.GeneroEnEdicionId = null;
    }

    async Inicializar() {
        console.log("[PanelGestionLMP] Inicializando sistema de gestión...");

        // 1. Inicializar servicios de capa
        if (typeof window.ServicioFirebase === "function") {
            this.Firebase = new window.ServicioFirebase();
            this.Firebase.Inicializar();
        } else {
            console.error("[PanelGestionLMP] ServicioFirebase no está cargado.");
        }

        if (typeof window.ServicioCloudinary === "function") {
            this.Cloudinary = new window.ServicioCloudinary();
        }

        // Limpiar URL si tiene signo de interrogación
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // 2. Verificar Sesión
        const SesionGuardada = sessionStorage.getItem("LMP_Admin_Sesion");
        if (SesionGuardada) {
            try {
                this.UsuarioSesion = JSON.parse(SesionGuardada);
                this.MostrarDashboard();
                await this.CargarDatosDesdeFirestore();
            } catch (e) {
                console.error("Error al leer sesión:", e);
                this.MostrarLogin();
            }
        } else {
            this.MostrarLogin();
        }

        // 3. Vincular Eventos de Interfaz
        this.VincularEventos();
    }

    // -------------------------------------------------------------
    // GESTIÓN DE PANTALLAS (LOGIN VS DASHBOARD)
    // -------------------------------------------------------------
    MostrarLogin() {
        const VistaLogin = document.getElementById("VistaLogin");
        const VistaDashboard = document.getElementById("VistaDashboard");
        if (VistaLogin) VistaLogin.style.display = "flex";
        if (VistaDashboard) VistaDashboard.style.display = "none";
    }

    MostrarDashboard() {
        const VistaLogin = document.getElementById("VistaLogin");
        const VistaDashboard = document.getElementById("VistaDashboard");
        if (VistaLogin) VistaLogin.style.display = "none";
        if (VistaDashboard) VistaDashboard.style.display = "flex";

        // Mostrar spinners de carga inmediata en el dashboard
        this.MostrarSpinnersMetricas();

        // Actualizar chip de usuario en sidebar
        if (this.UsuarioSesion) {
            const NombreElem = document.getElementById("SidebarNombreUsuario");
            const RolElem = document.getElementById("SidebarRolUsuario");
            const AvatarElem = document.getElementById("SidebarAvatarUsuario");

            if (NombreElem) NombreElem.textContent = this.UsuarioSesion.NombreCompleto || "Administrador";
            if (RolElem) RolElem.textContent = `Rol: ${this.UsuarioSesion.Rol || 'Admin'}`;
            if (AvatarElem && this.UsuarioSesion.FotoPerfilUrl) {
                AvatarElem.src = this.UsuarioSesion.FotoPerfilUrl;
            }
        }
    }

    // -------------------------------------------------------------
    // AUTENTICACIÓN
    // -------------------------------------------------------------
    async ProcesarLogin(Evento = null) {
        if (Evento && typeof Evento.preventDefault === "function") {
            Evento.preventDefault();
            Evento.stopPropagation();
        }

        const EmailInput = document.getElementById("LoginEmail");
        const PassInput = document.getElementById("LoginPassword");
        const BtnLogin = document.getElementById("BtnIniciarSesion");

        const Correo = EmailInput ? EmailInput.value.trim().toLowerCase() : "";
        const Clave = PassInput ? PassInput.value.trim() : "";

        if (!Correo || !Clave) {
            this.MostrarErrorLogin("Por favor completa tu correo y contraseña.");
            return;
        }

        try {
            if (BtnLogin) {
                BtnLogin.disabled = true;
                BtnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando credenciales...';
            }

            if (!this.Firebase || !this.Firebase.ObtenerFirestore()) {
                throw new Error("No hay conexión con la base de datos.");
            }

            const UsuariosPredefinidos = [
                {
                    IdUsuario: "EdnaMiriamAdmin2026",
                    NombreCompleto: "Edna Miriam Edgley Cuellar",
                    CorreoElectronico: "ednacuallr20@gmail.com",
                    Contrasena: "12345",
                    Rol: "Admin",
                    Activo: true,
                    FotoPerfilUrl: ""
                },
                {
                    IdUsuario: "EdnaMiriamAdminOficial",
                    NombreCompleto: "Edna Miriam Edgley Cuellar",
                    CorreoElectronico: "edna.edgley@gmail.com",
                    Contrasena: "12345",
                    Rol: "Admin",
                    Activo: true,
                    FotoPerfilUrl: "https://res.cloudinary.com/pjmt8rts/image/upload/v1788815172/lmp_partituras/n8tmlqvdnp9hxmgsoubv.png"
                },
                {
                    IdUsuario: "DanielAdminOficial",
                    NombreCompleto: "Carlos Daniel Cuellar Guasde",
                    CorreoElectronico: "daniel.cuellar@gmail.com",
                    Contrasena: "12345",
                    Rol: "Admin",
                    Activo: true,
                    FotoPerfilUrl: "https://res.cloudinary.com/pjmt8rts/image/upload/v1788870045/FotoDaniel.jpg"
                }
            ];

            let UsuarioAutenticado = null;
            const db = this.Firebase.ObtenerFirestore();

            // 1. Consultar Firestore
            try {
                const SnapUsuarios = await db.collection("Usuarios")
                    .where("CorreoElectronico", "==", Correo)
                    .get();

                if (!SnapUsuarios.empty) {
                    for (const Doc of SnapUsuarios.docs) {
                        const Datos = Doc.data();
                        const ClaveDoc = Datos.Contrasena || Datos.Password || Datos.Clave;
                        if (ClaveDoc === Clave) {
                            UsuarioAutenticado = {
                                IdUsuario: Doc.id,
                                NombreCompleto: Datos.NombreCompleto || Datos.Nombre || "Administrador",
                                CorreoElectronico: Datos.CorreoElectronico,
                                Rol: Datos.Rol || "Admin",
                                Activo: Datos.Activo !== undefined ? Datos.Activo : true,
                                FotoPerfilUrl: Datos.FotoPerfilUrl || Datos.FotoPerfil || ""
                            };
                            break;
                        }
                    }
                }
            } catch (Err) {
                console.warn("[PanelGestionLMP] Error en consulta de usuarios:", Err);
            }

            // 2. Si no se encontró en Firestore, validar lista autorizada
            if (!UsuarioAutenticado) {
                // Verificar si existe en la base de datos marcado como inactivo
                let EstaDesactivadoEnBD = false;
                try {
                    const SnapCheck = await db.collection("Usuarios")
                        .where("CorreoElectronico", "==", Correo)
                        .get();
                    if (!SnapCheck.empty) {
                        for (const Doc of SnapCheck.docs) {
                            if (Doc.data().Activo === false) {
                                EstaDesactivadoEnBD = true;
                                break;
                            }
                        }
                    }
                } catch (e) {}

                if (EstaDesactivadoEnBD) {
                    throw new Error("Esta cuenta ha sido desactivada. Ya no tienes acceso al panel de administración.");
                }

                const CoincidenciaPredefinida = UsuariosPredefinidos.find(
                    U => U.CorreoElectronico.toLowerCase() === Correo && U.Contrasena === Clave
                );
                if (CoincidenciaPredefinida) {
                    UsuarioAutenticado = { ...CoincidenciaPredefinida };
                }
            }

            if (!UsuarioAutenticado) {
                throw new Error("Credenciales incorrectas. Revisa tu correo y contraseña.");
            }

            // Validar estrictamente que el usuario esté activo
            if (UsuarioAutenticado.Activo === false) {
                throw new Error("Esta cuenta ha sido desactivada. Ya no tienes acceso al panel de administración.");
            }

            this.UsuarioSesion = UsuarioAutenticado;
            sessionStorage.setItem("LMP_Admin_Sesion", JSON.stringify(UsuarioAutenticado));

            this.MostrarToast(`¡Bienvenida/o, ${UsuarioAutenticado.NombreCompleto}!`, "Exito");
            this.MostrarDashboard();
            await this.CargarDatosDesdeFirestore();

        } catch (ErrorCapturado) {
            console.error("Error en login:", ErrorCapturado);
            this.MostrarErrorLogin(ErrorCapturado.message || "Error al iniciar sesión.");
        } finally {
            if (BtnLogin) {
                BtnLogin.disabled = false;
                BtnLogin.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Ingresar al Panel';
            }
        }
    }

    MostrarErrorLogin(Mensaje) {
        const DivError = document.getElementById("LoginError");
        if (DivError) {
            DivError.textContent = Mensaje;
            DivError.style.display = "block";
            setTimeout(() => { DivError.style.display = "none"; }, 5000);
        }
    }

    CerrarSesion() {
        sessionStorage.removeItem("LMP_Admin_Sesion");
        this.UsuarioSesion = null;
        this.MostrarLogin();
        this.MostrarToast("Sesión cerrada con éxito.", "Info");
    }

    // -------------------------------------------------------------
    // GESTIÓN DE SPINNERS Y ESTADO DE CARGA EN DASHBOARD
    // -------------------------------------------------------------
    MostrarSpinnersMetricas() {
        const spinnerHtml = '<i class="fa-solid fa-circle-notch fa-spin SpinnerMetrica"></i>';
        const MetricaCanciones = document.getElementById("MetricaTotalCanciones");
        const MetricaPartituras = document.getElementById("MetricaTotalPartituras");
        const MetricaArtistas = document.getElementById("MetricaTotalArtistas");
        const MetricaGeneros = document.getElementById("MetricaTotalGeneros");

        if (MetricaCanciones) MetricaCanciones.innerHTML = spinnerHtml;
        if (MetricaPartituras) MetricaPartituras.innerHTML = spinnerHtml;
        if (MetricaArtistas) MetricaArtistas.innerHTML = spinnerHtml;
        if (MetricaGeneros) MetricaGeneros.innerHTML = spinnerHtml;

        const ContenedorInicio = document.getElementById("ContenedorResumenInicio");
        if (ContenedorInicio) {
            ContenedorInicio.innerHTML = `
                <div class="EstadoCargandoDashboard">
                    <i class="fa-solid fa-circle-notch fa-spin IconoCargandoDashboard"></i>
                    <span>Cargando obras registradas...</span>
                </div>
            `;
        }
    }

    // -------------------------------------------------------------
    // CARGA DE DATOS DESDE BASE DE DATOS
    // -------------------------------------------------------------
    async CargarDatosDesdeFirestore() {
        if (!this.Firebase || !this.Firebase.ObtenerFirestore()) return;
        this.MostrarSpinnersMetricas();

        try {
            // Carga concurrente optimizada para máxima velocidad y rendimiento
            const [
                ResCanciones,
                ResPartituras,
                ResGeneros,
                ResArtistas,
                ResIFAEL,
                ResAcerca,
                ResUsuarios
            ] = await Promise.allSettled([
                this.Firebase.ColeccionCanciones().get(),
                this.Firebase.ColeccionPartiturasDigitales().get(),
                this.Firebase.ColeccionGeneros().get(),
                this.Firebase.ColeccionArtistas().get(),
                this.Firebase.ColeccionIFAEL().get(),
                this.Firebase.ColeccionAcercaDeNosotros().get(),
                this.Firebase.ColeccionUsuarios().get()
            ]);

            // 1. Canciones
            this.Canciones = [];
            if (ResCanciones.status === "fulfilled") {
                ResCanciones.value.forEach(Doc => {
                    this.Canciones.push({ IdCancion: Doc.id, ...Doc.data() });
                });
            } else {
                console.warn("[PanelGestionLMP] Aviso al leer Canciones:", ResCanciones.reason);
            }

            // 2. Partituras (desde PartiturasDigitales y desde Canciones con partitura)
            this.Partituras = [];
            if (ResPartituras.status === "fulfilled") {
                ResPartituras.value.forEach(Doc => {
                    this.Partituras.push({ IdPartitura: Doc.id, ...Doc.data() });
                });
            } else {
                console.warn("[PanelGestionLMP] Aviso al leer PartiturasDigitales:", ResPartituras.reason);
            }

            // Incorporar canciones con partitura que no estén ya en la lista
            this.Canciones.forEach(C => {
                const url = C.ImagenPartituraUrl || C.PartituraUrl;
                if (url && url !== "IFAEL.jpg" && !this.Partituras.some(P => (P.ImagenPartituraUrl === url) || (P.IdCancionAsociada === C.IdCancion))) {
                    this.Partituras.push({
                        IdPartitura: "cancion_" + C.IdCancion,
                        Titulo: C.Titulo,
                        Autor: C.Autor,
                        Genero: C.Genero,
                        Tono: C.TonoOriginal,
                        Instrumentacion: "Partitura General",
                        ImagenPartituraUrl: url,
                        Descripcion: C.Descripcion || "",
                        IdCancionAsociada: C.IdCancion,
                        EsDeCancion: true
                    });
                }
            });

            // 3. Géneros
            this.Generos = [];
            if (ResGeneros.status === "fulfilled") {
                ResGeneros.value.forEach(Doc => {
                    this.Generos.push({ IdGenero: Doc.id, ...Doc.data() });
                });
            } else {
                console.warn("[PanelGestionLMP] Aviso al leer Géneros:", ResGeneros.reason);
            }

            // 4. Artistas
            this.Artistas = [];
            if (ResArtistas.status === "fulfilled") {
                ResArtistas.value.forEach(Doc => {
                    this.Artistas.push({ IdArtista: Doc.id, ...Doc.data() });
                });
            } else {
                console.warn("[PanelGestionLMP] Aviso al leer Artistas:", ResArtistas.reason);
            }

            // 5. IFAEL
            if (ResIFAEL.status === "fulfilled" && !ResIFAEL.value.empty) {
                const Doc = ResIFAEL.value.docs[0];
                this.IFAEL = { IdDocumento: Doc.id, ...Doc.data() };
                this.CargarDatosFormularioIFAEL();
            } else if (ResIFAEL.status === "rejected") {
                console.warn("[PanelGestionLMP] Aviso al leer IFAEL:", ResIFAEL.reason);
            }

            // 6. Acerca de Nosotros
            if (ResAcerca.status === "fulfilled" && !ResAcerca.value.empty) {
                const Doc = ResAcerca.value.docs[0];
                this.AcercaDeNosotros = { IdDocumento: Doc.id, ...Doc.data() };
                this.CargarDatosFormularioAcercaDe();
            } else if (ResAcerca.status === "rejected") {
                console.warn("[PanelGestionLMP] Aviso al leer AcercaDeNosotros:", ResAcerca.reason);
            }

            // 7. Usuarios
            this.Usuarios = [];
            if (ResUsuarios.status === "fulfilled") {
                ResUsuarios.value.forEach(Doc => {
                    this.Usuarios.push({ IdUsuario: Doc.id, ...Doc.data() });
                });
            } else {
                console.warn("[PanelGestionLMP] Aviso al leer Usuarios:", ResUsuarios.reason);
            }

        } catch (ErrorCarga) {
            console.error("[PanelGestionLMP] Error en carga concurrente de Firestore:", ErrorCarga);
        }

        // Renderizados y Actualizaciones
        this.ActualizarMetricas();
        this.PoblarSelectores();
        this.RenderizarResumenInicio();
        this.RenderizarCanciones();
        this.RenderizarPartituras();
        this.RenderizarGeneros();
        this.RenderizarArtistas();
        this.RenderizarTablaUsuarios();
    }

    ActualizarMetricas() {
        const MetricaCanciones = document.getElementById("MetricaTotalCanciones");
        const MetricaPartituras = document.getElementById("MetricaTotalPartituras");
        const MetricaArtistas = document.getElementById("MetricaTotalArtistas");
        const MetricaGeneros = document.getElementById("MetricaTotalGeneros");

        if (MetricaCanciones) MetricaCanciones.textContent = this.Canciones.length;
        if (MetricaPartituras) MetricaPartituras.textContent = this.Partituras.length;
        if (MetricaArtistas) MetricaArtistas.textContent = this.Artistas.length;
        if (MetricaGeneros) MetricaGeneros.textContent = this.Generos.length;
    }

    PoblarSelectores() {
        const GenerosPorDefecto = ["Taquirari", "Chovena", "Carnavalito", "Polca Beniana", "Sarao", "Bajón Sagrado", "Himno Cívico y Patriótico"];
        const NombresGeneros = new Set(GenerosPorDefecto);
        this.Generos.forEach(G => { if (G.Nombre) NombresGeneros.add(G.Nombre); });

        const OpcionesGenerosHtml = Array.from(NombresGeneros).map(Gen => 
            `<option value="${Gen}">${Gen}</option>`
        ).join("");

        const SelectCancion = document.getElementById("FormCancionGenero");
        if (SelectCancion) SelectCancion.innerHTML = OpcionesGenerosHtml;

        const SelectPartitura = document.getElementById("FormPartituraGenero");
        if (SelectPartitura) SelectPartitura.innerHTML = OpcionesGenerosHtml;

        // Selector de canciones en Formulario de Partituras
        const SelectCancionAsoc = document.getElementById("FormPartituraIdCancion");
        if (SelectCancionAsoc) {
            let htmlCanciones = '<option value="">-- Ninguna (Partitura Documental Independiente) --</option>';
            this.Canciones.forEach(C => {
                htmlCanciones += `<option value="${C.IdCancion}">${C.Titulo} - ${C.Autor || 'Tradicional'}</option>`;
            });
            SelectCancionAsoc.innerHTML = htmlCanciones;
        }
    }

    // -------------------------------------------------------------
    // NAVEGACIÓN ENTRE SECCIONES
    // -------------------------------------------------------------
    CambiarPestana(NuevaPestana) {
        if (!NuevaPestana) return;

        // Alias
        if (NuevaPestana === "dashboard") NuevaPestana = "inicio";

        // Marcar en menú lateral
        document.querySelectorAll(".ItemMenuSidebar").forEach(Item => {
            const p = Item.dataset.pestana;
            if (p === NuevaPestana || (NuevaPestana === "inicio" && p === "dashboard")) {
                Item.classList.add("Activo");
            } else {
                Item.classList.remove("Activo");
            }
        });

        // Ocultar todas las secciones
        document.querySelectorAll(".SeccionPanelDashboard").forEach(Sec => {
            Sec.style.display = "none";
        });

        // Mostrar sección destino
        const SeccionDestino = document.getElementById(`Seccion_${NuevaPestana}`);
        if (SeccionDestino) {
            SeccionDestino.style.display = "block";
        }

        // Título del TopBar con icono oficial
        const TituloTopbar = document.getElementById("TituloSeccionTopbar");
        const TitulosMap = {
            "inicio": '<i class="fa-solid fa-house" style="color: var(--ColorPrimario);"></i> Inicio',
            "canciones": '<i class="fa-solid fa-scroll" style="color: var(--ColorPrimario);"></i> Cancionero y Letras',
            "partituras": '<i class="fa-solid fa-file-audio" style="color: var(--ColorPrimario);"></i> Partituras Digitales',
            "generos": '<i class="fa-solid fa-guitar" style="color: var(--ColorPrimario);"></i> Géneros Musicales',
            "artistas": '<i class="fa-solid fa-users" style="color: var(--ColorPrimario);"></i> Artistas y Compositores',
            "ifael": '<i class="fa-solid fa-building-columns" style="color: var(--ColorPrimario);"></i> Instituto IFAEL',
            "acerca-de": '<i class="fa-solid fa-circle-info" style="color: var(--ColorPrimario);"></i> Acerca de Nosotros',
            "usuarios": '<i class="fa-solid fa-users-gear" style="color: var(--ColorPrimario);"></i> Cuentas y Accesos'
        };

        if (TituloTopbar) {
            TituloTopbar.innerHTML = TitulosMap[NuevaPestana] || "Panel de Gestión";
        }

        this.CerrarMenuMobile();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    AlternarMenuMobile() {
        const Sidebar = document.getElementById("SidebarPanel");
        const Backdrop = document.getElementById("BackdropSidebarMobile");
        if (Sidebar) Sidebar.classList.toggle("Abierto");
        if (Backdrop) Backdrop.classList.toggle("Activo");
    }

    CerrarMenuMobile() {
        const Sidebar = document.getElementById("SidebarPanel");
        const Backdrop = document.getElementById("BackdropSidebarMobile");
        if (Sidebar) Sidebar.classList.remove("Abierto");
        if (Backdrop) Backdrop.classList.remove("Activo");
    }

    // -------------------------------------------------------------
    // 1. SECCIÓN INICIO: RESUMEN DE ACTIVIDAD RECIENTE
    // -------------------------------------------------------------
    RenderizarResumenInicio() {
        const Contenedor = document.getElementById("ContenedorResumenInicio");
        if (!Contenedor) return;

        if (this.Canciones.length === 0 && this.Partituras.length === 0) {
            Contenedor.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--ColorTextoSecundario);">Aún no hay obras registradas en el sistema.</div>';
            return;
        }

        const ObrasRecientes = [...this.Canciones].slice(0, 5);

        Contenedor.innerHTML = `
            <table class="TablaDatosAdmin">
                <thead>
                    <tr>
                        <th>Título de la Obra</th>
                        <th>Autor / Compositor</th>
                        <th>Ritmo / Género</th>
                        <th>Tono</th>
                        <th>Audio</th>
                        <th style="text-align: right;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${ObrasRecientes.map(C => `
                        <tr>
                            <td class="CeldaTituloCard" data-label="Obra"><strong>${C.Titulo}</strong></td>
                            <td data-label="Autor">${C.Autor || 'Compositor Tradicional'}</td>
                            <td data-label="Ritmo"><span class="BadgeItem BadgeVerde">${C.Genero || 'Folclore'}</span></td>
                            <td data-label="Tono">${C.TonoOriginal || '-'}</td>
                            <td data-label="Audio">${(() => {
                                const IdYT = this.ExtraerIdYouTube(C.AudioUrl);
                                if (IdYT) {
                                    return `<button type="button" class="BotonAccionItem" style="background: #fef2f2; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.2);" onclick="window.InstanciaPanel.AbrirVisorYouTube('${IdYT}', '${this.EscaparComillas(C.Titulo)}')"><i class="fa-brands fa-youtube" style="color: #ef4444;"></i> YouTube</button>`;
                                } else if (C.AudioUrl) {
                                    return `<button type="button" class="BotonAccionItem" style="background: var(--ColorPrimarioClaro); color: var(--ColorPrimario);" onclick="const a = new Audio('${C.AudioUrl}'); a.play(); window.InstanciaPanel.MostrarToast('Reproduciendo audio...', 'Info');"><i class="fa-solid fa-play"></i> Escuchar</button>`;
                                }
                                return '<span style="color: #94a3b8;">Sin audio</span>';
                            })()}</td>
                            <td class="CeldaAccionesCard" style="text-align: right;">
                                <button type="button" class="BotonAccionItem BotonEditarItem" onclick="window.InstanciaPanel.EditarCancion('${C.IdCancion}')">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // -------------------------------------------------------------
    // 2. SECCIÓN: CANCIONERO Y LETRAS
    // -------------------------------------------------------------
    async ProcesarGuardarCancion(Evento) {
        if (Evento) Evento.preventDefault();

        const Titulo = document.getElementById("FormCancionTitulo")?.value.trim();
        const Autor = document.getElementById("FormCancionAutor")?.value.trim();
        const Genero = document.getElementById("FormCancionGenero")?.value;
        const Tono = document.getElementById("FormCancionTono")?.value.trim() || "Do Mayor (C)";
        const Tempo = Number(document.getElementById("FormCancionTempo")?.value) || 108;
        const EsEstudiante = document.getElementById("FormCancionEsEstudiante")?.checked || false;
        const Descripcion = document.getElementById("FormCancionDescripcion")?.value.trim() || "";
        const Letra = document.getElementById("FormCancionLetra")?.value.trim();

        const InputAudio = document.getElementById("FormCancionAudioArchivo");
        let AudioUrl = document.getElementById("FormCancionAudioUrl")?.value.trim() || "";

        if (!Titulo || !Letra) {
            this.MostrarToast("Por favor ingresa al menos el Título y la Letra de la canción.", "Error");
            return;
        }

        const BtnGuardar = document.getElementById("BtnGuardarCancion");
        const BarraProgreso = document.getElementById("BarraProgresoCancion");
        const BarraInner = document.getElementById("BarraProgresoCancionInner");

        try {
            if (BtnGuardar) {
                BtnGuardar.disabled = true;
                BtnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando canción...';
            }

            if (BarraProgreso && BarraInner) {
                BarraProgreso.style.display = "block";
                BarraInner.style.width = "30%";
            }

            // Subir Audio a Cloudinary si hay archivo
            if (InputAudio && InputAudio.files && InputAudio.files.length > 0 && this.Cloudinary) {
                if (BtnGuardar) BtnGuardar.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-fade"></i> Subiendo audio a Cloudinary...';
                if (BarraInner) BarraInner.style.width = "60%";
                const ResAudio = await this.Cloudinary.SubirAudio(InputAudio.files[0]);
                if (ResAudio) AudioUrl = ResAudio;
            }

            if (BarraInner) BarraInner.style.width = "85%";

            const LetraLimpia = Letra.replace(/\[[^\]]+\]/g, "").replace(/ {2,}/g, " ").trim();

            const DatosCancion = {
                Titulo: Titulo,
                Autor: Autor || "Compositor Anónimo",
                Genero: Genero || "Taquirari",
                TonoOriginal: Tono,
                TempoBPM: Tempo,
                EsEstudianteIFAEL: EsEstudiante,
                Descripcion: Descripcion,
                LetraConAcordes: Letra,
                LetraLimpia: LetraLimpia,
                AudioUrl: AudioUrl,
                CaratulaUrl: "Logo1.png",
                Activa: true,
                FechaActualizacion: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();

            if (this.CancionEnEdicionId) {
                await db.collection("Canciones").doc(this.CancionEnEdicionId).update(DatosCancion);
                this.MostrarToast(`¡Canción "${Titulo}" actualizada con éxito!`, "Exito");
            } else {
                DatosCancion.FechaCreacion = new Date().toISOString();
                await db.collection("Canciones").add(DatosCancion);
                this.MostrarToast(`¡Canción "${Titulo}" guardada en el Cancionero!`, "Exito");
            }

            if (BarraInner) BarraInner.style.width = "100%";
            this.LimpiarFormularioCancion();
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al guardar canción:", Error);
            this.MostrarToast(`Error al guardar: ${Error.message}`, "Error");
        } finally {
            if (BtnGuardar) {
                BtnGuardar.disabled = false;
                BtnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Canción';
            }
            if (BarraProgreso) BarraProgreso.style.display = "none";
        }
    }

    ExtraerIdYouTube(url) {
        if (!url || typeof url !== "string") return null;
        const patron = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/;
        const m = url.trim().match(patron);
        return m ? m[1] : null;
    }

    ActualizarPreviewAudio() {
        const InputUrl = document.getElementById("FormCancionAudioUrl");
        const AudioElem = document.getElementById("AudioPreviewElemento");
        const YouTubeWrapper = document.getElementById("YouTubePreviewWrapper");
        const YouTubeIframe = document.getElementById("YouTubePreviewIframe");

        const Valor = InputUrl ? InputUrl.value.trim() : "";
        const IdYT = this.ExtraerIdYouTube(Valor);

        if (IdYT) {
            if (AudioElem) { AudioElem.style.display = "none"; AudioElem.src = ""; }
            if (YouTubeWrapper && YouTubeIframe) {
                YouTubeIframe.src = `https://www.youtube-nocookie.com/embed/${IdYT}`;
                YouTubeWrapper.style.display = "block";
            }
        } else if (Valor && (Valor.startsWith("http://") || Valor.startsWith("https://") || Valor.includes("cloudinary.com"))) {
            if (YouTubeWrapper && YouTubeIframe) {
                YouTubeWrapper.style.display = "none";
                YouTubeIframe.src = "";
            }
            if (AudioElem) {
                AudioElem.src = Valor;
                AudioElem.style.display = "block";
            }
        } else {
            if (AudioElem) { AudioElem.style.display = "none"; AudioElem.src = ""; }
            if (YouTubeWrapper && YouTubeIframe) {
                YouTubeWrapper.style.display = "none";
                YouTubeIframe.src = "";
            }
        }
    }

    AbrirVisorYouTube(IdYT, Titulo = "") {
        const Modal = document.getElementById("ModalVisorYouTube");
        const Iframe = document.getElementById("ModalYouTubeIframe");
        const TituloElem = document.getElementById("ModalYouTubeTitulo");

        if (Modal && Iframe) {
            if (TituloElem) TituloElem.textContent = Titulo ? `Reproduciendo: ${Titulo}` : "Reproductor de YouTube";
            Iframe.src = `https://www.youtube-nocookie.com/embed/${IdYT}?autoplay=1`;
            Modal.style.display = "flex";
        }
    }

    CerrarVisorYouTube() {
        const Modal = document.getElementById("ModalVisorYouTube");
        const Iframe = document.getElementById("ModalYouTubeIframe");
        if (Iframe) Iframe.src = "";
        if (Modal) Modal.style.display = "none";
    }

    LimpiarFormularioCancion() {
        this.CancionEnEdicionId = null;
        document.getElementById("FormularioCancion")?.reset();
        document.getElementById("FormCancionIdEdicion").value = "";

        const TituloForm = document.getElementById("TituloFormularioCancion");
        const BtnGuardar = document.getElementById("BtnGuardarCancion");
        const BtnCancelar = document.getElementById("BtnCancelarEdicionCancion");
        const AudioPreview = document.getElementById("AudioPreviewElemento");
        const YouTubeWrapper = document.getElementById("YouTubePreviewWrapper");
        const YouTubeIframe = document.getElementById("YouTubePreviewIframe");

        if (TituloForm) TituloForm.innerHTML = '<i class="fa-solid fa-scroll"></i> Cargar Canción y Letra';
        if (BtnGuardar) BtnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Canción';
        if (BtnCancelar) BtnCancelar.style.display = "none";
        if (AudioPreview) { AudioPreview.style.display = "none"; AudioPreview.src = ""; }
        if (YouTubeWrapper && YouTubeIframe) { YouTubeWrapper.style.display = "none"; YouTubeIframe.src = ""; }
    }

    EditarCancion(IdCancion) {
        const Cancion = this.Canciones.find(C => C.IdCancion === IdCancion);
        if (!Cancion) return;

        this.CancionEnEdicionId = IdCancion;
        this.CambiarPestana("canciones");

        document.getElementById("FormCancionIdEdicion").value = IdCancion;
        document.getElementById("FormCancionTitulo").value = Cancion.Titulo || "";
        document.getElementById("FormCancionAutor").value = Cancion.Autor || "";
        document.getElementById("FormCancionGenero").value = Cancion.Genero || "Taquirari";
        document.getElementById("FormCancionTono").value = Cancion.TonoOriginal || "";
        document.getElementById("FormCancionTempo").value = Cancion.TempoBPM || 108;
        document.getElementById("FormCancionEsEstudiante").checked = Boolean(Cancion.EsEstudianteIFAEL);
        document.getElementById("FormCancionDescripcion").value = Cancion.Descripcion || "";
        document.getElementById("FormCancionLetra").value = Cancion.LetraConAcordes || Cancion.LetraLimpia || "";
        document.getElementById("FormCancionAudioUrl").value = Cancion.AudioUrl || "";

        this.ActualizarPreviewAudio();

        const TituloForm = document.getElementById("TituloFormularioCancion");
        const BtnGuardar = document.getElementById("BtnGuardarCancion");
        const BtnCancelar = document.getElementById("BtnCancelarEdicionCancion");

        if (TituloForm) TituloForm.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Canción: ${Cancion.Titulo}`;
        if (BtnGuardar) BtnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios de Canción';
        if (BtnCancelar) BtnCancelar.style.display = "inline-flex";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async EliminarCancion(IdCancion, TituloCancion) {
        const Confirma = confirm(`¿Estás seguro de eliminar la canción "${TituloCancion}"?`);
        if (!Confirma) return;

        try {
            const db = this.Firebase.ObtenerFirestore();
            await db.collection("Canciones").doc(IdCancion).delete();
            this.MostrarToast(`Canción "${TituloCancion}" eliminada exitosamente.`, "Exito");
            await this.CargarDatosDesdeFirestore();
        } catch (Error) {
            console.error("Error al eliminar canción:", Error);
            this.MostrarToast(`Error al eliminar: ${Error.message}`, "Error");
        }
    }

    RenderizarCanciones() {
        const Contenedor = document.getElementById("ContenedorTablaCanciones");
        if (!Contenedor) return;

        const Busqueda = document.getElementById("InputBusquedaCanciones")?.value.trim().toLowerCase() || "";

        let Lista = this.Canciones;
        if (Busqueda) {
            Lista = Lista.filter(C => 
                (C.Titulo && C.Titulo.toLowerCase().includes(Busqueda)) ||
                (C.Autor && C.Autor.toLowerCase().includes(Busqueda)) ||
                (C.Genero && C.Genero.toLowerCase().includes(Busqueda))
            );
        }

        if (Lista.length === 0) {
            Contenedor.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--ColorTextoSecundario);">No se encontraron canciones en el cancionero.</div>';
            return;
        }

        Contenedor.innerHTML = `
            <table class="TablaDatosAdmin">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Autor / Compositor</th>
                        <th>Ritmo</th>
                        <th>Tono</th>
                        <th>Audio</th>
                        <th style="text-align: right;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${Lista.map(C => `
                        <tr>
                            <td class="CeldaTituloCard" data-label="Canción"><strong>${C.Titulo}</strong></td>
                            <td data-label="Autor">${C.Autor || 'Compositor Tradicional'}</td>
                            <td data-label="Ritmo"><span class="BadgeItem BadgeVerde">${C.Genero || 'Folclore'}</span></td>
                            <td data-label="Tono">${C.TonoOriginal || '-'}</td>
                            <td data-label="Audio">
                                ${(() => {
                                    const IdYT = this.ExtraerIdYouTube(C.AudioUrl);
                                    if (IdYT) {
                                        return `
                                            <button type="button" class="BotonAccionItem" style="background: #fef2f2; color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.2);" onclick="window.InstanciaPanel.AbrirVisorYouTube('${IdYT}', '${this.EscaparComillas(C.Titulo)}')">
                                                <i class="fa-brands fa-youtube" style="color: #ef4444;"></i> YouTube
                                            </button>
                                        `;
                                    } else if (C.AudioUrl) {
                                        return `
                                            <button type="button" class="BotonAccionItem" style="background: var(--ColorPrimarioClaro); color: var(--ColorPrimario);" onclick="const a = new Audio('${C.AudioUrl}'); a.play(); window.InstanciaPanel.MostrarToast('Reproduciendo audio...', 'Info');">
                                                <i class="fa-solid fa-play"></i> Escuchar
                                            </button>
                                        `;
                                    }
                                    return '<span style="color: #94a3b8; font-size: 12px;">Sin audio</span>';
                                })()}
                            </td>
                            <td class="CeldaAccionesCard" style="text-align: right; white-space: nowrap;">
                                <button type="button" class="BotonAccionItem BotonEditarItem" onclick="window.InstanciaPanel.EditarCancion('${C.IdCancion}')">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button type="button" class="BotonAccionItem BotonBorrarItem" onclick="window.InstanciaPanel.EliminarCancion('${C.IdCancion}', '${this.EscaparComillas(C.Titulo)}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // -------------------------------------------------------------
    // 3. SECCIÓN: PARTITURAS DIGITALES
    // -------------------------------------------------------------
    async ProcesarGuardarPartitura(Evento) {
        if (Evento) Evento.preventDefault();

        const Titulo = document.getElementById("FormPartituraTitulo")?.value.trim();
        const Autor = document.getElementById("FormPartituraAutor")?.value.trim();
        const Genero = document.getElementById("FormPartituraGenero")?.value;
        const Tono = document.getElementById("FormPartituraTono")?.value.trim() || "";
        const Formato = document.getElementById("FormPartituraFormato")?.value.trim() || "Partitura General";
        const IdCancion = document.getElementById("FormPartituraIdCancion")?.value || "";
        const Notas = document.getElementById("FormPartituraNotas")?.value.trim() || "";

        const InputArchivo = document.getElementById("FormPartituraArchivo");
        let PartituraUrl = document.getElementById("FormPartituraUrl")?.value.trim() || "";

        if (!Titulo || !Autor) {
            this.MostrarToast("Ingresa el Título y Autor de la partitura.", "Error");
            return;
        }

        const Btn = document.getElementById("BtnGuardarPartitura");
        const Barra = document.getElementById("BarraProgresoPartitura");
        const BarraInner = document.getElementById("BarraProgresoPartituraInner");

        try {
            if (Btn) {
                Btn.disabled = true;
                Btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando partitura...';
            }

            if (Barra && BarraInner) {
                Barra.style.display = "block";
                BarraInner.style.width = "30%";
            }

            // Subir Partitura a Cloudinary si hay archivo seleccionado
            if (InputArchivo && InputArchivo.files && InputArchivo.files.length > 0 && this.Cloudinary) {
                if (Btn) Btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-fade"></i> Subiendo imagen de partitura...';
                if (BarraInner) BarraInner.style.width = "70%";
                const Res = await this.Cloudinary.SubirPartitura(InputArchivo.files[0]);
                if (Res) PartituraUrl = Res;
            }

            if (!PartituraUrl) {
                throw new Error("Debes seleccionar una imagen de la partitura o ingresar una URL válida.");
            }

            if (BarraInner) BarraInner.style.width = "85%";

            const DatosPartitura = {
                Titulo: Titulo,
                Autor: Autor,
                Genero: Genero || "Tradicional Beniana",
                Tono: Tono,
                Instrumentacion: Formato,
                ImagenPartituraUrl: PartituraUrl,
                Descripcion: Notas,
                IdCancionAsociada: IdCancion,
                FechaActualizacion: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();

            if (this.PartituraEnEdicionId && !this.PartituraEnEdicionId.startsWith("cancion_")) {
                await db.collection("PartiturasDigitales").doc(this.PartituraEnEdicionId).update(DatosPartitura);
                this.MostrarToast(`¡Partitura "${Titulo}" actualizada!`, "Exito");
            } else {
                DatosPartitura.FechaCreacion = new Date().toISOString();
                await db.collection("PartiturasDigitales").add(DatosPartitura);
                this.MostrarToast(`¡Partitura "${Titulo}" guardada en el archivo digital!`, "Exito");
            }

            // Si está vinculada a una canción, actualizar la canción correspondiente
            if (IdCancion) {
                await db.collection("Canciones").doc(IdCancion).update({
                    ImagenPartituraUrl: PartituraUrl
                }).catch(() => {});
            }

            if (BarraInner) BarraInner.style.width = "100%";
            this.LimpiarFormularioPartitura();
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al guardar partitura:", Error);
            this.MostrarToast(`Error: ${Error.message}`, "Error");
        } finally {
            if (Btn) {
                Btn.disabled = false;
                Btn.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i> Guardar Partitura Digital';
            }
            if (Barra) Barra.style.display = "none";
        }
    }

    LimpiarFormularioPartitura() {
        this.PartituraEnEdicionId = null;
        document.getElementById("FormularioPartitura")?.reset();
        document.getElementById("FormPartituraIdEdicion").value = "";

        const TituloForm = document.getElementById("TituloFormularioPartitura");
        const Btn = document.getElementById("BtnGuardarPartitura");
        const BtnCanc = document.getElementById("BtnCancelarEdicionPartitura");
        const Prev = document.getElementById("PartituraPreviewElemento2");

        if (TituloForm) TituloForm.innerHTML = '<i class="fa-solid fa-file-audio"></i> Cargar Partitura Digital';
        if (Btn) Btn.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i> Guardar Partitura Digital';
        if (BtnCanc) BtnCanc.style.display = "none";
        if (Prev) { Prev.style.display = "none"; Prev.src = ""; }
    }

    EditarPartitura(IdPartitura) {
        const Partitura = this.Partituras.find(P => P.IdPartitura === IdPartitura);
        if (!Partitura) return;

        this.PartituraEnEdicionId = IdPartitura;
        this.CambiarPestana("partituras");

        document.getElementById("FormPartituraIdEdicion").value = IdPartitura;
        document.getElementById("FormPartituraTitulo").value = Partitura.Titulo || "";
        document.getElementById("FormPartituraAutor").value = Partitura.Autor || "";
        document.getElementById("FormPartituraGenero").value = Partitura.Genero || "Taquirari";
        document.getElementById("FormPartituraTono").value = Partitura.Tono || "";
        document.getElementById("FormPartituraFormato").value = Partitura.Instrumentacion || "Partitura General";
        document.getElementById("FormPartituraIdCancion").value = Partitura.IdCancionAsociada || "";
        document.getElementById("FormPartituraNotas").value = Partitura.Descripcion || "";
        document.getElementById("FormPartituraUrl").value = Partitura.ImagenPartituraUrl || "";

        if (Partitura.ImagenPartituraUrl) {
            const Prev = document.getElementById("PartituraPreviewElemento2");
            if (Prev) {
                Prev.src = Partitura.ImagenPartituraUrl;
                Prev.style.display = "block";
            }
        }

        const TituloForm = document.getElementById("TituloFormularioPartitura");
        const Btn = document.getElementById("BtnGuardarPartitura");
        const BtnCanc = document.getElementById("BtnCancelarEdicionPartitura");

        if (TituloForm) TituloForm.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Partitura: ${Partitura.Titulo}`;
        if (Btn) Btn.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i> Guardar Cambios de Partitura';
        if (BtnCanc) BtnCanc.style.display = "inline-flex";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async EliminarPartitura(IdPartitura, Titulo) {
        const Confirma = confirm(`¿Estás seguro de eliminar la partitura "${Titulo}"?`);
        if (!Confirma) return;

        try {
            const db = this.Firebase.ObtenerFirestore();
            if (IdPartitura.startsWith("cancion_")) {
                const idCanc = IdPartitura.replace("cancion_", "");
                await db.collection("Canciones").doc(idCanc).update({ ImagenPartituraUrl: "" });
            } else {
                await db.collection("PartiturasDigitales").doc(IdPartitura).delete();
            }
            this.MostrarToast(`Partitura "${Titulo}" eliminada con éxito.`, "Exito");
            await this.CargarDatosDesdeFirestore();
        } catch (Error) {
            console.error("Error al eliminar partitura:", Error);
            this.MostrarToast(`Error al eliminar: ${Error.message}`, "Error");
        }
    }

    RenderizarPartituras() {
        const Contenedor = document.getElementById("ContenedorGridPartituras");
        if (!Contenedor) return;

        const Busqueda = document.getElementById("InputBusquedaPartituras")?.value.trim().toLowerCase() || "";

        let Lista = this.Partituras;
        if (Busqueda) {
            Lista = Lista.filter(P => 
                (P.Titulo && P.Titulo.toLowerCase().includes(Busqueda)) ||
                (P.Autor && P.Autor.toLowerCase().includes(Busqueda)) ||
                (P.Genero && P.Genero.toLowerCase().includes(Busqueda))
            );
        }

        if (Lista.length === 0) {
            Contenedor.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--ColorTextoSecundario); grid-column: 1/-1;">No se encontraron partituras en el archivo digital.</div>';
            return;
        }

        Contenedor.innerHTML = Lista.map(P => {
            const img = P.ImagenPartituraUrl || "../Logo1.png";
            return `
                <div class="TarjetaAdminItem">
                    <div class="HeaderTarjetaAdmin" style="cursor: pointer;" onclick="window.InstanciaPanel.AbrirModalPartitura('${img}', '${this.EscaparComillas(P.Titulo)}')">
                        <img src="${img}" alt="${P.Titulo}" onerror="this.src='../Logo1.png'">
                        <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px;">
                            <i class="fa-solid fa-magnifying-glass-plus"></i> Ver Zoom
                        </div>
                    </div>
                    <div class="CuerpoTarjetaAdmin">
                        <div class="TituloTarjetaAdmin">${P.Titulo}</div>
                        <div class="SubtituloTarjetaAdmin"><i class="fa-solid fa-user-pen"></i> ${P.Autor || 'Tradicional'}</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
                            <span class="BadgeItem BadgeVerde">${P.Genero || 'Ritmo Beniano'}</span>
                            ${P.Tono ? `<span class="BadgeItem BadgeDorado">${P.Tono}</span>` : ''}
                            <span class="BadgeItem BadgeAzul">${P.Instrumentacion || 'Partitura'}</span>
                        </div>
                    </div>
                    <div class="PieTarjetaAdmin">
                        <a href="${img}" target="_blank" download class="BotonAccionItem" style="text-decoration: none; background: #ffffff; border: 1px solid var(--ColorBorde);">
                            <i class="fa-solid fa-download"></i> Descargar
                        </a>
                        <div style="display: flex; gap: 6px;">
                            <button type="button" class="BotonAccionItem BotonEditarItem" onclick="window.InstanciaPanel.EditarPartitura('${P.IdPartitura}')">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="BotonAccionItem BotonBorrarItem" onclick="window.InstanciaPanel.EliminarPartitura('${P.IdPartitura}', '${this.EscaparComillas(P.Titulo)}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    AbrirModalPartitura(Url, Titulo) {
        const Modal = document.getElementById("ModalVisorPartitura");
        const TituloElem = document.getElementById("ModalPartituraTitulo");
        const ImagenElem = document.getElementById("ModalPartituraImagen");
        const DescargaElem = document.getElementById("ModalPartituraDescarga");

        if (Modal && ImagenElem) {
            ImagenElem.src = Url;
            if (TituloElem) TituloElem.textContent = Titulo || "Partitura Digital";
            if (DescargaElem) {
                DescargaElem.href = Url;
                DescargaElem.download = `Partitura_${(Titulo || 'LMP').replace(/\s+/g, '_')}.jpg`;
            }
            Modal.style.display = "flex";
        }
    }

    // -------------------------------------------------------------
    // 4. SECCIÓN: GÉNEROS MUSICALES
    // -------------------------------------------------------------
    async ProcesarGuardarGenero(Evento) {
        if (Evento) Evento.preventDefault();

        const Nombre = document.getElementById("FormGeneroNombre")?.value.trim();
        const Compas = document.getElementById("FormGeneroCompas")?.value.trim();
        const Origen = document.getElementById("FormGeneroOrigen")?.value.trim() || "Trinidad, Beni";
        const Color = document.getElementById("FormGeneroColor")?.value.trim() || "#1b6b3e";
        const Icono = document.getElementById("FormGeneroIcono")?.value.trim() || "fa-solid fa-guitar";
        const Descripcion = document.getElementById("FormGeneroDescripcion")?.value.trim() || "";

        if (!Nombre || !Compas) {
            this.MostrarToast("Ingresa el Nombre y Compás del género musical.", "Error");
            return;
        }

        const Btn = document.getElementById("BtnGuardarGenero");
        try {
            if (Btn) {
                Btn.disabled = true;
                Btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
            }

            const DatosGenero = {
                Nombre: Nombre,
                Compas: Compas,
                Origen: Origen,
                Color: Color,
                IconoClase: Icono,
                Descripcion: Descripcion,
                FechaActualizacion: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();

            if (this.GeneroEnEdicionId) {
                await db.collection("Generos").doc(this.GeneroEnEdicionId).update(DatosGenero);
                this.MostrarToast(`¡Género "${Nombre}" actualizado!`, "Exito");
            } else {
                DatosGenero.FechaCreacion = new Date().toISOString();
                await db.collection("Generos").add(DatosGenero);
                this.MostrarToast(`¡Género "${Nombre}" catalogado con éxito!`, "Exito");
            }

            this.LimpiarFormularioGenero();
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al guardar género:", Error);
            this.MostrarToast(`Error: ${Error.message}`, "Error");
        } finally {
            if (Btn) {
                Btn.disabled = false;
                Btn.innerHTML = '<i class="fa-solid fa-plus"></i> Guardar Género';
            }
        }
    }

    LimpiarFormularioGenero() {
        this.GeneroEnEdicionId = null;
        document.getElementById("FormularioGenero")?.reset();
        document.getElementById("FormGeneroIdEdicion").value = "";

        const Titulo = document.getElementById("TituloFormularioGenero");
        const Btn = document.getElementById("BtnGuardarGenero");
        const BtnCanc = document.getElementById("BtnCancelarEdicionGenero");

        if (Titulo) Titulo.innerHTML = '<i class="fa-solid fa-guitar"></i> Registrar Nuevo Ritmo o Género';
        if (Btn) Btn.innerHTML = '<i class="fa-solid fa-plus"></i> Guardar Género';
        if (BtnCanc) BtnCanc.style.display = "none";
    }

    EditarGenero(IdGenero) {
        const Genero = this.Generos.find(G => G.IdGenero === IdGenero);
        if (!Genero) return;

        this.GeneroEnEdicionId = IdGenero;
        this.CambiarPestana("generos");

        document.getElementById("FormGeneroIdEdicion").value = IdGenero;
        document.getElementById("FormGeneroNombre").value = Genero.Nombre || "";
        document.getElementById("FormGeneroCompas").value = Genero.Compas || "";
        document.getElementById("FormGeneroOrigen").value = Genero.Origen || "";
        document.getElementById("FormGeneroColor").value = Genero.Color || "#1b6b3e";
        document.getElementById("FormGeneroIcono").value = Genero.IconoClase || "fa-solid fa-guitar";
        document.getElementById("FormGeneroDescripcion").value = Genero.Descripcion || "";

        const Titulo = document.getElementById("TituloFormularioGenero");
        const Btn = document.getElementById("BtnGuardarGenero");
        const BtnCanc = document.getElementById("BtnCancelarEdicionGenero");

        if (Titulo) Titulo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Género: ${Genero.Nombre}`;
        if (Btn) Btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios de Género';
        if (BtnCanc) BtnCanc.style.display = "inline-flex";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async EliminarGenero(IdGenero, Nombre) {
        const Confirma = confirm(`¿Estás seguro de eliminar el género "${Nombre}"?`);
        if (!Confirma) return;

        try {
            const db = this.Firebase.ObtenerFirestore();
            await db.collection("Generos").doc(IdGenero).delete();
            this.MostrarToast(`Género "${Nombre}" eliminado.`, "Exito");
            await this.CargarDatosDesdeFirestore();
        } catch (Error) {
            console.error("Error al eliminar género:", Error);
            this.MostrarToast(`Error al eliminar: ${Error.message}`, "Error");
        }
    }

    RenderizarGeneros() {
        const Contenedor = document.getElementById("ContenedorGridGeneros");
        if (!Contenedor) return;

        if (this.Generos.length === 0) {
            Contenedor.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--ColorTextoSecundario); grid-column: 1/-1;">No hay géneros catalogados aún.</div>';
            return;
        }

        Contenedor.innerHTML = this.Generos.map(G => `
            <div class="TarjetaAdminItem">
                <div style="padding: 20px; border-bottom: 1px solid var(--ColorBorde); display: flex; align-items: center; gap: 14px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: ${G.Color || 'var(--ColorPrimario)'}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                        <i class="${G.IconoClase || 'fa-solid fa-guitar'}"></i>
                    </div>
                    <div>
                        <div class="TituloTarjetaAdmin">${G.Nombre}</div>
                        <div class="SubtituloTarjetaAdmin"><i class="fa-solid fa-drum"></i> Compás: ${G.Compas || 'Tradicional'}</div>
                    </div>
                </div>
                <div class="CuerpoTarjetaAdmin">
                    <p style="font-size: 13px; color: var(--ColorTextoSecundario); line-height: 1.45;">${G.Descripcion || 'Ritmo emblemático del patrimonio musical beniano.'}</p>
                    <div style="margin-top: 6px;">
                        <span class="BadgeItem BadgeVerde"><i class="fa-solid fa-location-dot"></i> ${G.Origen || 'Beni'}</span>
                    </div>
                </div>
                <div class="PieTarjetaAdmin">
                    <span></span>
                    <div style="display: flex; gap: 6px;">
                        <button type="button" class="BotonAccionItem BotonEditarItem" onclick="window.InstanciaPanel.EditarGenero('${G.IdGenero}')">
                            <i class="fa-solid fa-pen-to-square"></i> Editar
                        </button>
                        <button type="button" class="BotonAccionItem BotonBorrarItem" onclick="window.InstanciaPanel.EliminarGenero('${G.IdGenero}', '${this.EscaparComillas(G.Nombre)}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // -------------------------------------------------------------
    // 5. SECCIÓN: ARTISTAS Y COMPOSITORES
    // -------------------------------------------------------------
    async ProcesarGuardarArtista(Evento) {
        if (Evento) Evento.preventDefault();

        const NombreCompleto = document.getElementById("FormArtistaNombreCompleto")?.value.trim();
        const NombreArtistico = document.getElementById("FormArtistaNombreArtistico")?.value.trim() || NombreCompleto;
        const RolTitulo = document.getElementById("FormArtistaRolTitulo")?.value.trim() || "Músico & Compositor";
        const Especialidad = document.getElementById("FormArtistaEspecialidad")?.value.trim() || "Compositor";
        const Trayectoria = Number(document.getElementById("FormArtistaTrayectoriaAnos")?.value) || 15;
        const Biografia = document.getElementById("FormArtistaBiografia")?.value.trim();
        const ObrasTexto = document.getElementById("FormArtistaObras")?.value.trim() || "";
        const Cita = document.getElementById("FormArtistaCita")?.value.trim() || "";

        const InputFoto = document.getElementById("FormArtistaFotoArchivo");
        let FotoUrl = document.getElementById("FormArtistaFotoUrl")?.value.trim() || "";

        if (!NombreCompleto || !Biografia) {
            this.MostrarToast("Ingresa el Nombre Completo y Biografía del artista.", "Error");
            return;
        }

        const Btn = document.getElementById("BtnGuardarArtista");
        try {
            if (Btn) {
                Btn.disabled = true;
                Btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando artista...';
            }

            if (InputFoto && InputFoto.files && InputFoto.files.length > 0 && this.Cloudinary) {
                const ResFoto = await this.Cloudinary.SubirImagen(InputFoto.files[0]);
                if (ResFoto) FotoUrl = ResFoto;
            }

            const ObrasArray = ObrasTexto ? ObrasTexto.split("\n").map(O => O.trim()).filter(Boolean) : [];

            const DatosArtista = {
                NombreCompleto: NombreCompleto,
                NombreArtistico: NombreArtistico,
                RolTitulo: RolTitulo,
                Especialidad: Especialidad,
                TrayectoriaAnos: Trayectoria,
                Biografia: Biografia,
                ObrasDestacadas: ObrasArray,
                CitaCelebre: Cita,
                FotoPerfilUrl: FotoUrl || "../Logo1.png",
                FechaActualizacion: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();

            if (this.ArtistaEnEdicionId) {
                await db.collection("Artistas").doc(this.ArtistaEnEdicionId).update(DatosArtista);
                this.MostrarToast(`¡Artista "${NombreArtistico}" actualizado!`, "Exito");
            } else {
                DatosArtista.FechaCreacion = new Date().toISOString();
                await db.collection("Artistas").add(DatosArtista);
                this.MostrarToast(`¡Artista "${NombreArtistico}" registrado con éxito!`, "Exito");
            }

            this.LimpiarFormularioArtista();
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al guardar artista:", Error);
            this.MostrarToast(`Error: ${Error.message}`, "Error");
        } finally {
            if (Btn) {
                Btn.disabled = false;
                Btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Guardar Artista';
            }
        }
    }

    LimpiarFormularioArtista() {
        this.ArtistaEnEdicionId = null;
        document.getElementById("FormularioArtista")?.reset();
        document.getElementById("FormArtistaIdEdicion").value = "";

        const Titulo = document.getElementById("TituloFormularioArtista");
        const Btn = document.getElementById("BtnGuardarArtista");
        const BtnCanc = document.getElementById("BtnCancelarEdicionArtista");
        const Prev = document.getElementById("FotoArtistaPreviewElemento");

        if (Titulo) Titulo.innerHTML = '<i class="fa-solid fa-users"></i> Registrar Artista o Compositor';
        if (Btn) Btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Guardar Artista';
        if (BtnCanc) BtnCanc.style.display = "none";
        if (Prev) { Prev.style.display = "none"; Prev.src = ""; }
    }

    EditarArtista(IdArtista) {
        const Artista = this.Artistas.find(A => A.IdArtista === IdArtista);
        if (!Artista) return;

        this.ArtistaEnEdicionId = IdArtista;
        this.CambiarPestana("artistas");

        document.getElementById("FormArtistaIdEdicion").value = IdArtista;
        document.getElementById("FormArtistaNombreCompleto").value = Artista.NombreCompleto || "";
        document.getElementById("FormArtistaNombreArtistico").value = Artista.NombreArtistico || "";
        document.getElementById("FormArtistaRolTitulo").value = Artista.RolTitulo || "";
        document.getElementById("FormArtistaEspecialidad").value = Artista.Especialidad || "";
        document.getElementById("FormArtistaTrayectoriaAnos").value = Artista.TrayectoriaAnos || 15;
        document.getElementById("FormArtistaBiografia").value = Artista.Biografia || "";
        document.getElementById("FormArtistaObras").value = Array.isArray(Artista.ObrasDestacadas) ? Artista.ObrasDestacadas.join("\n") : "";
        document.getElementById("FormArtistaCita").value = Artista.CitaCelebre || "";
        document.getElementById("FormArtistaFotoUrl").value = Artista.FotoPerfilUrl || "";

        if (Artista.FotoPerfilUrl) {
            const Prev = document.getElementById("FotoArtistaPreviewElemento");
            if (Prev) {
                Prev.src = Artista.FotoPerfilUrl;
                Prev.style.display = "block";
            }
        }

        const Titulo = document.getElementById("TituloFormularioArtista");
        const Btn = document.getElementById("BtnGuardarArtista");
        const BtnCanc = document.getElementById("BtnCancelarEdicionArtista");

        if (Titulo) Titulo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Artista: ${Artista.NombreArtistico || Artista.NombreCompleto}`;
        if (Btn) Btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Guardar Cambios de Artista';
        if (BtnCanc) BtnCanc.style.display = "inline-flex";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async EliminarArtista(IdArtista, Nombre) {
        const Confirma = confirm(`¿Estás seguro de eliminar a "${Nombre}"?`);
        if (!Confirma) return;

        try {
            const db = this.Firebase.ObtenerFirestore();
            await db.collection("Artistas").doc(IdArtista).delete();
            this.MostrarToast(`Artista "${Nombre}" eliminado.`, "Exito");
            await this.CargarDatosDesdeFirestore();
        } catch (Error) {
            console.error("Error al eliminar artista:", Error);
            this.MostrarToast(`Error al eliminar: ${Error.message}`, "Error");
        }
    }

    RenderizarArtistas() {
        const Contenedor = document.getElementById("ContenedorGridArtistas");
        if (!Contenedor) return;

        const Busqueda = document.getElementById("InputBusquedaArtistas")?.value.trim().toLowerCase() || "";

        let Lista = this.Artistas;
        if (Busqueda) {
            Lista = Lista.filter(A => 
                (A.NombreCompleto && A.NombreCompleto.toLowerCase().includes(Busqueda)) ||
                (A.NombreArtistico && A.NombreArtistico.toLowerCase().includes(Busqueda)) ||
                (A.Especialidad && A.Especialidad.toLowerCase().includes(Busqueda))
            );
        }

        if (Lista.length === 0) {
            Contenedor.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--ColorTextoSecundario); grid-column: 1/-1;">No hay artistas registrados aún.</div>';
            return;
        }

        Contenedor.innerHTML = Lista.map(A => {
            const foto = A.FotoPerfilUrl || "../Logo1.png";
            return `
                <div class="TarjetaAdminItem">
                    <div style="padding: 18px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--ColorBorde);">
                        <img src="${foto}" alt="${A.NombreCompleto}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid var(--ColorDorado);" onerror="this.src='../Logo1.png'">
                        <div>
                            <div class="TituloTarjetaAdmin">${A.NombreArtistico || A.NombreCompleto}</div>
                            <div class="SubtituloTarjetaAdmin"><i class="fa-solid fa-award"></i> ${A.RolTitulo || A.Especialidad || 'Compositor'}</div>
                        </div>
                    </div>
                    <div class="CuerpoTarjetaAdmin">
                        <p style="font-size: 13px; color: var(--ColorTextoSecundario); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                            ${A.Biografia || 'Semblanza del artista beniano.'}
                        </p>
                        ${Array.isArray(A.ObrasDestacadas) && A.ObrasDestacadas.length > 0 ? `
                            <div style="font-size: 12px; color: var(--ColorTextoSecundario); margin-top: 6px;">
                                <strong>Obras:</strong> ${A.ObrasDestacadas.slice(0, 2).join(', ')}...
                            </div>
                        ` : ''}
                    </div>
                    <div class="PieTarjetaAdmin">
                        <span class="BadgeItem BadgeDorado">${A.TrayectoriaAnos || 15} años trayect.</span>
                        <div style="display: flex; gap: 6px;">
                            <button type="button" class="BotonAccionItem BotonEditarItem" onclick="window.InstanciaPanel.EditarArtista('${A.IdArtista}')">
                                <i class="fa-solid fa-pen-to-square"></i> Editar
                            </button>
                            <button type="button" class="BotonAccionItem BotonBorrarItem" onclick="window.InstanciaPanel.EliminarArtista('${A.IdArtista}', '${this.EscaparComillas(A.NombreArtistico || A.NombreCompleto)}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // -------------------------------------------------------------
    // 6. SECCIÓN: INSTITUTO IFAEL
    // -------------------------------------------------------------
    CargarDatosFormularioIFAEL() {
        if (!this.IFAEL) return;
        const I = this.IFAEL;

        const Nom = document.getElementById("FormIFAELNombre");
        const Ciu = document.getElementById("FormIFAELCiudad");
        const Tel = document.getElementById("FormIFAELTelefono");
        const Dir = document.getElementById("FormIFAELDireccion");
        const Des = document.getElementById("FormIFAELDescripcion");
        const Por = document.getElementById("FormIFAELPortadaUrl");
        const Prev = document.getElementById("IFAELPreviewElemento");

        if (Nom) Nom.value = I.Nombre || "";
        if (Ciu) Ciu.value = I.Ciudad || "Trinidad, Beni - Bolivia";
        if (Tel) Tel.value = I.ContactoTelefono || "";
        if (Dir) Dir.value = I.Direccion || "";
        if (Des) Des.value = I.Descripcion || "";
        if (Por) Por.value = I.FotoPortadaUrl || "";
        if (Prev && I.FotoPortadaUrl) {
            Prev.src = I.FotoPortadaUrl;
            Prev.style.display = "block";
        }
    }

    async ProcesarGuardarIFAEL(Evento) {
        if (Evento) Evento.preventDefault();

        const Nombre = document.getElementById("FormIFAELNombre")?.value.trim();
        const Ciudad = document.getElementById("FormIFAELCiudad")?.value.trim();
        const Telefono = document.getElementById("FormIFAELTelefono")?.value.trim() || "";
        const Direccion = document.getElementById("FormIFAELDireccion")?.value.trim() || "";
        const Descripcion = document.getElementById("FormIFAELDescripcion")?.value.trim();

        const InputArchivo = document.getElementById("FormIFAELArchivo");
        let PortadaUrl = document.getElementById("FormIFAELPortadaUrl")?.value.trim() || "";

        if (!Nombre || !Descripcion) {
            this.MostrarToast("Completa el Nombre y la Descripción institucional.", "Error");
            return;
        }

        const Btn = document.getElementById("BtnGuardarIFAEL");
        try {
            if (Btn) {
                Btn.disabled = true;
                Btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando cambios...';
            }

            if (InputArchivo && InputArchivo.files && InputArchivo.files.length > 0 && this.Cloudinary) {
                const Res = await this.Cloudinary.SubirImagen(InputArchivo.files[0]);
                if (Res) PortadaUrl = Res;
            }

            const DatosIFAEL = {
                Nombre: Nombre,
                Ciudad: Ciudad,
                ContactoTelefono: Telefono,
                Direccion: Direccion,
                Descripcion: Descripcion,
                FotoPortadaUrl: PortadaUrl,
                FechaActualizacion: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();

            if (this.IFAEL && this.IFAEL.IdDocumento) {
                await db.collection("IFAEL").doc(this.IFAEL.IdDocumento).update(DatosIFAEL);
            } else {
                DatosIFAEL.FechaCreacion = new Date().toISOString();
                const DocRef = await db.collection("IFAEL").add(DatosIFAEL);
                this.IFAEL = { IdDocumento: DocRef.id, ...DatosIFAEL };
            }

            this.MostrarToast("Información institucional del IFAEL actualizada.", "Exito");
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al guardar IFAEL:", Error);
            this.MostrarToast(`Error: ${Error.message}`, "Error");
        } finally {
            if (Btn) {
                Btn.disabled = false;
                Btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios de IFAEL';
            }
        }
    }

    // -------------------------------------------------------------
    // 7. SECCIÓN: ACERCA DE NOSOTROS
    // -------------------------------------------------------------
    CargarDatosFormularioAcercaDe() {
        if (!this.AcercaDeNosotros) return;
        const A = this.AcercaDeNosotros;

        const Tit = document.getElementById("FormAcercaTitulo");
        const DesPag = document.getElementById("FormAcercaDescripcionPagina");
        
        // Edna
        const NomEdna = document.getElementById("FormAcercaNombreEdna");
        const FotoEdna = document.getElementById("FormAcercaFotoEdna");
        const DesEdna = document.getElementById("FormAcercaDescripcionEdna");
        const PrevEdna = document.getElementById("AcercaFotoEdnaPreview");

        if (Tit) Tit.value = A.TituloPagina || "Acerca de Nosotros";
        if (DesPag) DesPag.value = A.DescripcionPagina || "";
        if (NomEdna) NomEdna.value = A.NombreEdna || "Edna Miriam Edgley Cuellar";
        if (FotoEdna) FotoEdna.value = A.FotoEdna || "";
        if (DesEdna) DesEdna.value = A.DescripcionEdna || "";
        if (PrevEdna && A.FotoEdna) {
            PrevEdna.src = A.FotoEdna;
            PrevEdna.style.display = "block";
        } else if (PrevEdna) {
            PrevEdna.style.display = "none";
        }

        // Lucy / Luci
        const NomLuci = document.getElementById("FormAcercaNombreLuci");
        const FotoLuci = document.getElementById("FormAcercaFotoLuci");
        const DesLuci = document.getElementById("FormAcercaDescripcionLuci");
        const PrevLuci = document.getElementById("AcercaFotoLuciPreview");

        if (NomLuci) NomLuci.value = A.NombreLuci || "";
        if (FotoLuci) FotoLuci.value = A.FotoLuci || "";
        if (DesLuci) DesLuci.value = A.DescripcionLuci || "";
        if (PrevLuci && A.FotoLuci) {
            PrevLuci.src = A.FotoLuci;
            PrevLuci.style.display = "block";
        } else if (PrevLuci) {
            PrevLuci.style.display = "none";
        }
    }

    async ProcesarGuardarAcercaDe(Evento) {
        if (Evento) Evento.preventDefault();

        const Titulo = document.getElementById("FormAcercaTitulo")?.value.trim();
        const DescripcionPagina = document.getElementById("FormAcercaDescripcionPagina")?.value.trim();

        // Edna
        const NombreEdna = document.getElementById("FormAcercaNombreEdna")?.value.trim();
        let FotoEdna = document.getElementById("FormAcercaFotoEdna")?.value.trim() || "";
        const DescripcionEdna = document.getElementById("FormAcercaDescripcionEdna")?.value.trim();
        const ArchivoEdna = document.getElementById("FormAcercaArchivoEdna");

        // Luci
        const NombreLuci = document.getElementById("FormAcercaNombreLuci")?.value.trim() || "";
        let FotoLuci = document.getElementById("FormAcercaFotoLuci")?.value.trim() || "";
        const DescripcionLuci = document.getElementById("FormAcercaDescripcionLuci")?.value.trim() || "";
        const ArchivoLuci = document.getElementById("FormAcercaArchivoLuci");

        if (!Titulo || !DescripcionPagina || !NombreEdna) {
            this.MostrarToast("Por favor completa los campos principales de Acerca de Nosotros.", "Error");
            return;
        }

        const Btn = document.getElementById("BtnGuardarAcercaDe");
        try {
            if (Btn) {
                Btn.disabled = true;
                Btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
            }

            // Subir foto de Edna si se seleccionó archivo
            if (ArchivoEdna && ArchivoEdna.files && ArchivoEdna.files.length > 0 && this.Cloudinary) {
                const ResEdna = await this.Cloudinary.SubirImagen(ArchivoEdna.files[0]);
                if (ResEdna) {
                    FotoEdna = ResEdna;
                    const InputFotoEdna = document.getElementById("FormAcercaFotoEdna");
                    if (InputFotoEdna) InputFotoEdna.value = ResEdna;
                }
            }

            // Subir foto de Lucy si se seleccionó archivo
            if (ArchivoLuci && ArchivoLuci.files && ArchivoLuci.files.length > 0 && this.Cloudinary) {
                const ResLuci = await this.Cloudinary.SubirImagen(ArchivoLuci.files[0]);
                if (ResLuci) {
                    FotoLuci = ResLuci;
                    const InputFotoLuci = document.getElementById("FormAcercaFotoLuci");
                    if (InputFotoLuci) InputFotoLuci.value = ResLuci;
                }
            }

            const DatosAcerca = {
                TituloPagina: Titulo,
                DescripcionPagina: DescripcionPagina,
                NombreEdna: NombreEdna,
                FotoEdna: FotoEdna,
                DescripcionEdna: DescripcionEdna,
                NombreLuci: NombreLuci,
                FotoLuci: FotoLuci,
                DescripcionLuci: DescripcionLuci,
                FechaActualizacion: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();

            if (this.AcercaDeNosotros && this.AcercaDeNosotros.IdDocumento) {
                await db.collection("AcercaDeNosotros").doc(this.AcercaDeNosotros.IdDocumento).update(DatosAcerca);
                this.AcercaDeNosotros = { ...this.AcercaDeNosotros, ...DatosAcerca };
            } else {
                DatosAcerca.FechaCreacion = new Date().toISOString();
                const DocRef = await db.collection("AcercaDeNosotros").add(DatosAcerca);
                this.AcercaDeNosotros = { IdDocumento: DocRef.id, ...DatosAcerca };
            }

            this.MostrarToast("Información del proyecto Acerca de Nosotros guardada.", "Exito");
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al guardar Acerca de Nosotros:", Error);
            this.MostrarToast(`Error: ${Error.message}`, "Error");
        } finally {
            if (Btn) {
                Btn.disabled = false;
                Btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios de Acerca de Nosotros';
            }
        }
    }

    // -------------------------------------------------------------
    // 8. SECCIÓN: CUENTAS Y ACCESOS (USUARIOS)
    // -------------------------------------------------------------
    async ProcesarGuardarUsuario(Evento) {
        if (Evento) Evento.preventDefault();

        const Nombre = document.getElementById("FormUsuarioNombre")?.value.trim();
        const Email = document.getElementById("FormUsuarioEmail")?.value.trim().toLowerCase();
        const Password = document.getElementById("FormUsuarioPassword")?.value.trim();
        const Rol = document.getElementById("FormUsuarioRol")?.value || "User";

        if (!Nombre || !Email || !Password) {
            this.MostrarToast("Completa todos los campos obligatorios para el usuario.", "Error");
            return;
        }

        const Btn = document.getElementById("BtnGuardarUsuario");
        try {
            if (Btn) {
                Btn.disabled = true;
                Btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creando usuario...';
            }

            const DatosUsuario = {
                NombreCompleto: Nombre,
                CorreoElectronico: Email,
                Contrasena: Password,
                Rol: Rol,
                Activo: true,
                EsVerificado: Rol === "Admin",
                Ciudad: "Trinidad, Beni",
                FotoPerfilUrl: "",
                FechaRegistro: new Date().toISOString()
            };

            const db = this.Firebase.ObtenerFirestore();
            await db.collection("Usuarios").add(DatosUsuario);

            this.MostrarToast(`Usuario "${Nombre}" registrado exitosamente.`, "Exito");
            document.getElementById("FormularioUsuario")?.reset();
            await this.CargarDatosDesdeFirestore();
        } catch (Error) {
            console.error("Error al crear usuario:", Error);
            this.MostrarToast(`Error: ${Error.message}`, "Error");
        } finally {
            if (Btn) {
                Btn.disabled = false;
                Btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Guardar Usuario';
            }
        }
    }

    EsCuentaEdna(Correo = "", Nombre = "") {
        const C = (Correo || "").toLowerCase().trim();
        const N = (Nombre || "").toLowerCase().trim();
        return C === "ednacuallr20@gmail.com" || 
               C === "edna.edgley@gmail.com" || 
               C.includes("ednacuallr") || 
               N.includes("edna miriam") ||
               N === "edna edgley";
    }

    async EliminarUsuario(IdUsuario, Nombre, Correo = "") {
        // Protección Frontend: La cuenta de Edna Miriam nunca puede ser desactivada
        if (this.EsCuentaEdna(Correo, Nombre)) {
            this.MostrarToast("Acción no permitida: Esta cuenta de administrador no puede ser deshabilitada.", "Error");
            return;
        }

        const Confirma = confirm(`¿Estás seguro de eliminar el acceso para "${Nombre}"?\n\nAl eliminarlo, la cuenta quedará desactivada (Activo: false) y no podrá ingresar al panel.`);
        if (!Confirma) return;

        try {
            const db = this.Firebase.ObtenerFirestore();
            if (!db) throw new Error("No hay conexión con la base de datos.");

            let Actualizado = false;

            if (IdUsuario && !IdUsuario.startsWith("Edna") && !IdUsuario.startsWith("Daniel")) {
                await db.collection("Usuarios").doc(IdUsuario).update({
                    Activo: false,
                    FechaDesactivacion: new Date().toISOString()
                });
                Actualizado = true;
            } else if (Correo) {
                const Snap = await db.collection("Usuarios")
                    .where("CorreoElectronico", "==", Correo.toLowerCase().trim())
                    .get();

                if (!Snap.empty) {
                    for (const Doc of Snap.docs) {
                        await db.collection("Usuarios").doc(Doc.id).update({
                            Activo: false,
                            FechaDesactivacion: new Date().toISOString()
                        });
                        Actualizado = true;
                    }
                } else {
                    // Si era un usuario predefinido sin documento aún en la base de datos, crearlo desactivado
                    await db.collection("Usuarios").add({
                        NombreCompleto: Nombre,
                        CorreoElectronico: Correo.toLowerCase().trim(),
                        Contrasena: "12345",
                        Rol: "Admin",
                        Activo: false,
                        FechaRegistro: new Date().toISOString(),
                        FechaDesactivacion: new Date().toISOString()
                    });
                    Actualizado = true;
                }
            }

            this.MostrarToast(`Usuario "${Nombre}" desactivado. Ya no tiene acceso al panel.`, "Exito");
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al desactivar usuario:", Error);
            this.MostrarToast(`Error al desactivar usuario: ${Error.message}`, "Error");
        }
    }

    async ReactivarUsuario(IdUsuario, Nombre, Correo = "") {
        const Confirma = confirm(`¿Deseas reactivar el acceso al panel para "${Nombre}"?`);
        if (!Confirma) return;

        try {
            const db = this.Firebase.ObtenerFirestore();
            if (!db) throw new Error("No hay conexión con la base de datos.");

            if (IdUsuario && !IdUsuario.startsWith("Edna") && !IdUsuario.startsWith("Daniel")) {
                await db.collection("Usuarios").doc(IdUsuario).update({
                    Activo: true,
                    FechaReactivacion: new Date().toISOString()
                });
            } else if (Correo) {
                const Snap = await db.collection("Usuarios")
                    .where("CorreoElectronico", "==", Correo.toLowerCase().trim())
                    .get();

                if (!Snap.empty) {
                    for (const Doc of Snap.docs) {
                        await db.collection("Usuarios").doc(Doc.id).update({
                            Activo: true,
                            FechaReactivacion: new Date().toISOString()
                        });
                    }
                }
            }

            this.MostrarToast(`Usuario "${Nombre}" reactivado con éxito.`, "Exito");
            await this.CargarDatosDesdeFirestore();

        } catch (Error) {
            console.error("Error al reactivar usuario:", Error);
            this.MostrarToast(`Error al reactivar usuario: ${Error.message}`, "Error");
        }
    }

    RenderizarTablaUsuarios() {
        const Contenedor = document.getElementById("ListaUsuariosTabla");
        if (!Contenedor) return;

        let ListaMostrar = [...this.Usuarios];
        if (ListaMostrar.length === 0) {
            ListaMostrar = [
                {
                    NombreCompleto: "Edna Miriam Edgley Cuellar",
                    CorreoElectronico: "ednacuallr20@gmail.com",
                    Rol: "Admin",
                    Activo: true,
                    FotoPerfilUrl: ""
                },
                {
                    NombreCompleto: "Carlos Daniel Cuellar Guasde",
                    CorreoElectronico: "daniel.cuellar@gmail.com",
                    Rol: "Admin",
                    Activo: true,
                    FotoPerfilUrl: ""
                }
            ];
        }

        Contenedor.innerHTML = ListaMostrar.map(U => {
            const EsEdna = this.EsCuentaEdna(U.CorreoElectronico, U.NombreCompleto);
            const EstaActivo = (U.Activo !== false);

            return `
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--ColorBorde); background: ${EstaActivo ? '#ffffff' : '#fef2f2'};">
                    <div style="display: flex; align-items: center; gap: 12px; min-width: 220px;">
                        <img src="${U.FotoPerfilUrl || '../Logo1.png'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${EstaActivo ? 'var(--ColorPrimario)' : '#dc2626'};" onerror="this.src='../Logo1.png'">
                        <div>
                            <div style="font-weight: 700; font-size: 14px; color: ${EstaActivo ? 'var(--ColorTextoPrincipal)' : '#991b1b'};">
                                ${U.NombreCompleto || 'Sin nombre'}
                            </div>
                            <div style="font-size: 12px; color: var(--ColorTextoSecundario);">${U.CorreoElectronico || ''}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="BadgeItem ${U.Rol === 'Admin' ? 'BadgeDorado' : 'BadgeVerde'}">Rol: ${U.Rol || 'User'}</span>
                        <span class="BadgeItem ${EstaActivo ? 'BadgeVerde' : 'BadgeGris'}" style="${!EstaActivo ? 'background: #fee2e2; color: #dc2626; border-color: rgba(220,38,38,0.3);' : ''}">
                            ${EstaActivo ? '<i class="fa-solid fa-circle-check"></i> Activo' : '<i class="fa-solid fa-circle-xmark"></i> Inactivo'}
                        </span>

                        ${EstaActivo ? `
                            <button type="button" class="BotonAccionItem BotonBorrarItem" title="Eliminar acceso para este usuario" onclick="window.InstanciaPanel.EliminarUsuario('${U.IdUsuario || ''}', '${this.EscaparComillas(U.NombreCompleto || U.CorreoElectronico)}', '${U.CorreoElectronico || ''}')">
                                <i class="fa-solid fa-trash"></i> Eliminar
                            </button>
                        ` : `
                            <button type="button" class="BotonAccionItem" style="background: var(--ColorPrimarioClaro); color: var(--ColorPrimario); border: 1px solid rgba(27,107,62,0.3);" title="Reactivar acceso para este usuario" onclick="window.InstanciaPanel.ReactivarUsuario('${U.IdUsuario || ''}', '${this.EscaparComillas(U.NombreCompleto || U.CorreoElectronico)}', '${U.CorreoElectronico || ''}')">
                                <i class="fa-solid fa-rotate-left"></i> Reactivar
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join("");
    }

    // -------------------------------------------------------------
    // VINCULACIÓN DE EVENTOS
    // -------------------------------------------------------------
    VincularEventos() {
        // Formulario de Login
        document.getElementById("FormularioLogin")?.addEventListener("submit", (e) => this.ProcesarLogin(e));
        document.getElementById("BtnIniciarSesion")?.addEventListener("click", (e) => this.ProcesarLogin(e));

        // Logout
        document.getElementById("BtnLogoutSidebar")?.addEventListener("click", () => this.CerrarSesion());

        // Menú de Navegación Sidebar
        document.querySelectorAll(".ItemMenuSidebar").forEach(Item => {
            Item.addEventListener("click", (e) => {
                e.preventDefault();
                const Pestana = Item.dataset.pestana;
                if (Pestana) this.CambiarPestana(Pestana);
            });
        });

        // Controles de Menú Móvil
        document.getElementById("BtnToggleMenuMobile")?.addEventListener("click", () => this.AlternarMenuMobile());
        document.getElementById("BtnCerrarSidebarMobile")?.addEventListener("click", () => this.CerrarMenuMobile());
        document.getElementById("BackdropSidebarMobile")?.addEventListener("click", () => this.CerrarMenuMobile());

        // Formularios Principales
        document.getElementById("FormularioCancion")?.addEventListener("submit", (e) => this.ProcesarGuardarCancion(e));
        document.getElementById("FormularioPartitura")?.addEventListener("submit", (e) => this.ProcesarGuardarPartitura(e));
        document.getElementById("FormularioGenero")?.addEventListener("submit", (e) => this.ProcesarGuardarGenero(e));
        document.getElementById("FormularioArtista")?.addEventListener("submit", (e) => this.ProcesarGuardarArtista(e));
        document.getElementById("FormularioIFAEL")?.addEventListener("submit", (e) => this.ProcesarGuardarIFAEL(e));
        document.getElementById("FormularioAcercaDe")?.addEventListener("submit", (e) => this.ProcesarGuardarAcercaDe(e));
        document.getElementById("FormularioUsuario")?.addEventListener("submit", (e) => this.ProcesarGuardarUsuario(e));

        // Buscadores en vivo
        document.getElementById("InputBusquedaCanciones")?.addEventListener("input", () => this.RenderizarCanciones());
        document.getElementById("InputBusquedaPartituras")?.addEventListener("input", () => this.RenderizarPartituras());
        document.getElementById("InputBusquedaArtistas")?.addEventListener("input", () => this.RenderizarArtistas());

        // Toolbar de acordes
        document.querySelectorAll(".BtnAcordePill").forEach(Btn => {
            Btn.addEventListener("click", () => {
                const Acorde = Btn.dataset.acorde;
                if (Acorde) this.InsertarAcorde(Acorde);
            });
        });

        // Previsualizaciones de archivos seleccionados
        // 1. Audio URL / YouTube input
        const InputAudioUrl = document.getElementById("FormCancionAudioUrl");
        if (InputAudioUrl) {
            InputAudioUrl.addEventListener("input", () => this.ActualizarPreviewAudio());
            InputAudioUrl.addEventListener("change", () => this.ActualizarPreviewAudio());
        }

        // 1b. Audio file preview
        const InputAudio = document.getElementById("FormCancionAudioArchivo");
        const AudioElem = document.getElementById("AudioPreviewElemento");
        if (InputAudio && AudioElem) {
            InputAudio.addEventListener("change", () => {
                if (InputAudio.files && InputAudio.files[0]) {
                    AudioElem.src = URL.createObjectURL(InputAudio.files[0]);
                    AudioElem.style.display = "block";
                }
            });
        }

        // 2. Partitura preview
        const InputPartitura = document.getElementById("FormPartituraArchivo");
        const ImgPartituraPrev = document.getElementById("PartituraPreviewElemento2");
        if (InputPartitura && ImgPartituraPrev) {
            InputPartitura.addEventListener("change", () => {
                if (InputPartitura.files && InputPartitura.files[0]) {
                    ImgPartituraPrev.src = URL.createObjectURL(InputPartitura.files[0]);
                    ImgPartituraPrev.style.display = "block";
                }
            });
        }

        // 3. Artista foto preview
        const InputFotoArtista = document.getElementById("FormArtistaFotoArchivo");
        const ImgFotoPrev = document.getElementById("FotoArtistaPreviewElemento");
        if (InputFotoArtista && ImgFotoPrev) {
            InputFotoArtista.addEventListener("change", () => {
                if (InputFotoArtista.files && InputFotoArtista.files[0]) {
                    ImgFotoPrev.src = URL.createObjectURL(InputFotoArtista.files[0]);
                    ImgFotoPrev.style.display = "block";
                }
            });
        }

        // 4. IFAEL portada preview
        const InputIFAEL = document.getElementById("FormIFAELArchivo");
        const ImgIFAELPrev = document.getElementById("IFAELPreviewElemento");
        if (InputIFAEL && ImgIFAELPrev) {
            InputIFAEL.addEventListener("change", () => {
                if (InputIFAEL.files && InputIFAEL.files[0]) {
                    ImgIFAELPrev.src = URL.createObjectURL(InputIFAEL.files[0]);
                    ImgIFAELPrev.style.display = "block";
                }
            });
        }

        // 5. Acerca de Nosotros: Foto Edna preview
        const InputFotoEdna = document.getElementById("FormAcercaArchivoEdna");
        const ImgEdnaPrev = document.getElementById("AcercaFotoEdnaPreview");
        if (InputFotoEdna && ImgEdnaPrev) {
            InputFotoEdna.addEventListener("change", () => {
                if (InputFotoEdna.files && InputFotoEdna.files[0]) {
                    ImgEdnaPrev.src = URL.createObjectURL(InputFotoEdna.files[0]);
                    ImgEdnaPrev.style.display = "block";
                }
            });
        }

        // 6. Acerca de Nosotros: Foto Lucy preview
        const InputFotoLuci = document.getElementById("FormAcercaArchivoLuci");
        const ImgLuciPrev = document.getElementById("AcercaFotoLuciPreview");
        if (InputFotoLuci && ImgLuciPrev) {
            InputFotoLuci.addEventListener("change", () => {
                if (InputFotoLuci.files && InputFotoLuci.files[0]) {
                    ImgLuciPrev.src = URL.createObjectURL(InputFotoLuci.files[0]);
                    ImgLuciPrev.style.display = "block";
                }
            });
        }
    }

    InsertarAcorde(Acorde) {
        const Textarea = document.getElementById("FormCancionLetra");
        if (!Textarea) return;

        const TextoInsertar = `[${Acorde}] `;
        const PosInicio = Textarea.selectionStart;
        const PosFin = Textarea.selectionEnd;
        const ValorActual = Textarea.value;

        Textarea.value = ValorActual.substring(0, PosInicio) + TextoInsertar + ValorActual.substring(PosFin);
        Textarea.focus();
        Textarea.selectionStart = Textarea.selectionEnd = PosInicio + TextoInsertar.length;
    }

    // -------------------------------------------------------------
    // UTILIDADES (TOASTS, ESCAPE DE STRINGS)
    // -------------------------------------------------------------
    MostrarToast(Mensaje, Tipo = "Info") {
        const Contenedor = document.getElementById("ContenedorToast");
        if (!Contenedor) return;

        const Toast = document.createElement("div");
        Toast.className = `ToastMensaje ${Tipo}`;

        const Iconos = {
            "Exito": "fa-circle-check",
            "Error": "fa-circle-xmark",
            "Info": "fa-circle-info"
        };

        Toast.innerHTML = `
            <i class="fa-solid ${Iconos[Tipo] || 'fa-bell'}"></i>
            <span>${Mensaje}</span>
        `;

        Contenedor.appendChild(Toast);

        setTimeout(() => {
            Toast.style.opacity = "0";
            Toast.style.transition = "opacity 0.3s ease";
            setTimeout(() => Toast.remove(), 300);
        }, 4000);
    }

    EscaparComillas(Texto) {
        if (!Texto) return "";
        return Texto.replace(/'/g, "\\'").replace(/"/g, "&quot;");
    }
}

// Auto-inicialización robusta
function IniciarPanelApp() {
    if (!window.InstanciaPanel) {
        window.InstanciaPanel = new PanelGestionLMP();
        window.InstanciaPanel.Inicializar();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", IniciarPanelApp);
} else {
    IniciarPanelApp();
}
