/* ==========================================================================
   CAPA DE CONTROLADOR: CONTROLADOR PRINCIPAL Y DESPACHADOR DE EVENTOS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ControladorPrincipal {
    constructor(
        InstanciaServicioEstado,
        InstanciaModeloAlmacenamiento,
        InstanciaServicioReproductor,
        InstanciaServicioNotificaciones,
        InstanciaServicioCloudinary = null
    ) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ServicioReproductor = InstanciaServicioReproductor;
        this.ServicioNotificaciones = InstanciaServicioNotificaciones;
        this.ServicioCloudinary = InstanciaServicioCloudinary;

        // Instancias de Componentes
        this.ComponenteEncabezado = new ComponenteEncabezado(this.ServicioEstado);
        this.ComponenteBarraLateralIzquierda = new ComponenteBarraLateralIzquierda(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteBarraLateralDerecha = new ComponenteBarraLateralDerecha(this.ServicioEstado);
        this.ComponenteMuroPrincipal = new ComponenteMuroPrincipal(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionCanciones = new ComponenteSeccionCanciones(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionGeneros = new ComponenteSeccionGeneros(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionArtistas = new ComponenteSeccionArtistas(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionIFAEL = new ComponenteSeccionIFAEL(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteModalLetra = new ComponenteModalLetra(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteModalPartitura = new ComponenteModalPartitura(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteModalCrearAporte = new ComponenteModalCrearAporte(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteModalIniciarSesion = new ComponenteModalIniciarSesion(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteBarraNavegacionMovil = new ComponenteBarraNavegacionMovil(this.ServicioEstado);
        this.ComponenteReproductorFlotante = new ComponenteReproductorFlotante(this.ServicioEstado, this.ServicioReproductor);

        this.ContenedorRaizApp = null;
        this.ContenedorModales = null;
        this.PublicacionEnEdicion = null;
        this.CancionEnEdicion = null;
        this.AudioModal = null;
    }

    Inicializar() {
        window.InstanciaControladorPrincipal = this;
        this.ContenedorRaizApp = document.getElementById("AppRaiz");
        this.ContenedorModales = document.getElementById("ContenedorModalesDinamicos");

        // Cargar estado inicial de tema oscuro
        const EsTemaOscuroGuardado = this.ModeloAlmacenamiento.ObtenerEstadoTemaOscuro();
        if (EsTemaOscuroGuardado) {
            document.body.classList.add("ModoOscuroActivo");
            this.ServicioEstado.AlternarModoOscuro(true);
        }

        // Sincronizar sesión activa con la base de datos de usuarios en Firestore
        this.ServicioEstado.SincronizarUsuarioConBaseDatos(this.ModeloAlmacenamiento.ObtenerTodosLosUsuarios());

        this.SuscribirEventosDelEstado();
        this.RenderizarTodaLaAplicacion();
        this.VincularEventosGlobalesDOM();
        this.ConfigurarVisualizadorCanvas();
        this.ConfigurarDeslizamientoReproductorMovil();
    }

    SuscribirEventosDelEstado() {
        this.ServicioEstado.SuscribirEvento("CambioPestanaActiva", (NuevaPestana) => {
            this.ActualizarVistaCentral();
            this.ActualizarEstadosPestanasUI(NuevaPestana);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        this.ServicioEstado.SuscribirEvento("CambioTerminoBusqueda", () => {
            this.ActualizarVistaCentral();
        });

        this.ServicioEstado.SuscribirEvento("CambioFiltrosCanciones", () => {
            if (this.ServicioEstado.ObtenerEstado("PestanaActiva") === "canciones") {
                this.ActualizarVistaCentral();
            }
        });

        this.ServicioEstado.SuscribirEvento("CambioModoOscuro", (EsOscuro) => {
            if (EsOscuro) {
                document.body.classList.add("ModoOscuroActivo");
            } else {
                document.body.classList.remove("ModoOscuroActivo");
            }
            this.ModeloAlmacenamiento.GuardarEstadoTemaOscuro(EsOscuro);
            const BotonTema = document.getElementById("BotonAlternarModoOscuro");
            if (BotonTema) BotonTema.innerHTML = `<i class="fa-solid ${EsOscuro ? 'fa-sun' : 'fa-moon'}"></i>`;
        });

        this.ServicioReproductor.RegistrarCallbackProgreso((DatosProgreso) => {
            this.ActualizarProgresoAudioEnUI(DatosProgreso);
        });

        this.ServicioEstado.SuscribirEvento("CambioSesionUsuario", () => {
            this.RenderizarTodaLaAplicacion();
            this.ConfigurarVisualizadorCanvas();
        });
    }

    RenderizarTodaLaAplicacion() {
        if (!this.ContenedorRaizApp) return;

        this.ContenedorRaizApp.innerHTML = `
            ${this.ComponenteEncabezado.Renderizar()}
            <div class="ContenedorPrincipalAplicacion">
                ${this.ComponenteBarraLateralIzquierda.Renderizar()}
                <main class="AreaContenidoCentral" id="AreaContenidoCentral">
                    ${this.ObtenerHtmlSegunPestanaActiva()}
                </main>
                ${this.ComponenteBarraLateralDerecha.Renderizar()}
            </div>
            ${this.ComponenteBarraNavegacionMovil.Renderizar()}
            ${this.ComponenteReproductorFlotante.Renderizar()}
            <div class="CapaFondoMenuDeslizable" id="CapaFondoMenuDeslizable"></div>
        `;
    }

    ObtenerHtmlSegunPestanaActiva() {
        const Pestana = this.ServicioEstado.ObtenerEstado("PestanaActiva");
        switch (Pestana) {
            case "muro":
                return this.ComponenteMuroPrincipal.Renderizar();
            case "canciones":
                return this.ComponenteSeccionCanciones.Renderizar();
            case "generos":
                return this.ComponenteSeccionGeneros.Renderizar();
            case "artistas":
                return this.ComponenteSeccionArtistas.Renderizar();
            case "ifael":
                return this.ComponenteSeccionIFAEL.Renderizar();
            default:
                return this.ComponenteMuroPrincipal.Renderizar();
        }
    }

    ActualizarVistaCentral() {
        const AreaCentral = document.getElementById("AreaContenidoCentral");
        if (AreaCentral) {
            AreaCentral.innerHTML = this.ObtenerHtmlSegunPestanaActiva();
        }
    }

    ActualizarEstadosPestanasUI(PestanaActiva) {
        // Pestañas superiores
        document.querySelectorAll(".PestanaNavegacionSuperior").forEach(Btn => {
            if (Btn.dataset.pestana === PestanaActiva) {
                Btn.classList.add("PestanaActiva");
            } else {
                Btn.classList.remove("PestanaActiva");
            }
        });

        // Barra lateral
        document.querySelectorAll(".ElementoAccesoDirecto").forEach(Item => {
            if (Item.dataset.pestana === PestanaActiva) {
                Item.classList.add("AccesoActivo");
            } else {
                Item.classList.remove("AccesoActivo");
            }
        });

        // Barra móvil inferior
        document.querySelectorAll(".ElementoNavegacionMovil").forEach(MovilItem => {
            if (MovilItem.dataset.pestana === PestanaActiva) {
                MovilItem.classList.add("MovilActivo");
            } else {
                MovilItem.classList.remove("MovilActivo");
            }
        });
    }

    VincularEventosGlobalesDOM() {
        document.addEventListener("click", (Evento) => {
            this.ManejarClicksGlobales(Evento);
        });

        document.addEventListener("input", (Evento) => {
            this.ManejarEntradasTextoGlobales(Evento);
        });

        document.addEventListener("change", (Evento) => {
            this.ManejarCambiosSelects(Evento);
        });

        document.addEventListener("keydown", (Evento) => {
            if (Evento.key === "Escape") {
                this.CerrarModales();
                return;
            }
            if (Evento.key === "Enter") {
                const InputLogin = Evento.target.closest("#CampoEmailLogin, #CampoPasswordLogin");
                if (InputLogin) {
                    Evento.preventDefault();
                    this.ProcesarIniciarSesionFormulario();
                    return;
                }

                const InputComentario = Evento.target.closest(".CampoEntradaComentario");
                if (InputComentario && InputComentario.id) {
                    const Partes = InputComentario.id.split("_");
                    const IdPublicacion = Partes[1];
                    if (IdPublicacion) {
                        Evento.preventDefault();
                        if (!this.ServicioEstado.EstaAutenticado()) {
                            this.AbrirModalIniciarSesion("Inicia sesión para comentar en las publicaciones.");
                            return;
                        }
                        this.AgregarComentarioDesdeEntrada(IdPublicacion);
                    }
                }
            }
        });
    }

    ManejarClicksGlobales(Evento) {
        const Objetivo = Evento.target;

        // 1. Cambio de Pestañas (Header, Lateral, Móvil, Historias)
        const ElementoPestana = Objetivo.closest("[data-pestana]");
        if (ElementoPestana && !Objetivo.closest(".BotonAccionInteraccion")) {
            const NuevaPestana = ElementoPestana.dataset.pestana;
            this.ServicioEstado.EstablecerPestanaActiva(NuevaPestana);
            this.CerrarMenuLateralMovil();
            return;
        }

        // 2. Click en Logotipo Inicio
        if (Objetivo.closest("#BotonLogotipoInicio")) {
            this.ServicioEstado.EstablecerPestanaActiva("muro");
            return;
        }

        // 3. Alternar Modo Oscuro
        if (Objetivo.closest("#BotonAlternarModoOscuro")) {
            const EstadoActual = this.ServicioEstado.ObtenerEstado("ModoOscuro");
            this.ServicioEstado.AlternarModoOscuro(!EstadoActual);
            this.ServicioNotificaciones.MostrarMensajeToast(
                !EstadoActual ? "Modo oscuro activado" : "Modo claro activado",
                !EstadoActual ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>'
            );
            return;
        }

        // 4. Abrir / Cerrar Menú Móvil
        if (Objetivo.closest("#BotonAbrirMenuMovilLateral") || Objetivo.closest("#BotonMenuMovilDrawer")) {
            this.AlternarMenuLateralMovil();
            return;
        }
        if (Objetivo.closest("#CapaFondoMenuDeslizable")) {
            this.CerrarMenuLateralMovil();
            return;
        }

        // 5. Reproducción de Canción desde Tarjeta o Botón
        const BotonReproducir = Objetivo.closest(".BotonReproducirTarjeta");
        if (BotonReproducir) {
            const IdCancion = BotonReproducir.dataset.cancionId;
            this.EjecutarReproduccionCancionPorId(IdCancion);
            return;
        }

        // 6. Controles del Reproductor Flotante
        if (Objetivo.closest("#BotonReproducirPausarFlotante")) {
            if (this.ServicioReproductor.EstaReproduciendo) {
                this.ServicioReproductor.PausarReproduccion();
            } else {
                this.ServicioReproductor.ReanudarReproduccion();
            }
            return;
        }
        if (Objetivo.closest("#BotonCancionSiguiente")) {
            this.ReproducirSiguienteCancion();
            return;
        }
        if (Objetivo.closest("#BotonCancionAnterior")) {
            this.ReproducirCancionAnterior();
            return;
        }
        if (Objetivo.closest("#BotonAlternarBucle")) {
            const EnBucle = this.ServicioReproductor.AlternarBucle();
            Objetivo.closest("#BotonAlternarBucle").style.color = EnBucle ? 'var(--ColorPrimarioAzul)' : 'inherit';
            this.ServicioNotificaciones.MostrarMensajeToast(EnBucle ? "Repetición activada" : "Repetición desactivada", '<i class="fa-solid fa-repeat"></i>');
            return;
        }
        if (Objetivo.closest("#BotonCerrarReproductorFlotante")) {
            this.CerrarReproductorFlotante();
            return;
        }
        if (Objetivo.closest("#BotonSilenciarVolumen")) {
            const DeslizadorVolumen = document.getElementById("DeslizadorVolumenAudio");
            const BotonIcono = document.getElementById("BotonSilenciarVolumen");
            if (this.ServicioReproductor.VolumenNivel > 0) {
                this.ServicioReproductor.VolumenPrevio = this.ServicioReproductor.VolumenNivel;
                this.ServicioReproductor.AjustarVolumen(0);
                if (DeslizadorVolumen) {
                    DeslizadorVolumen.value = 0;
                    DeslizadorVolumen.style.background = `linear-gradient(to right, var(--ColorPrimarioAzul) 0%, var(--ColorBordeSuave) 0%, var(--ColorBordeSuave) 100%)`;
                    DeslizadorVolumen.title = `Volumen: 0%`;
                }
                if (BotonIcono) BotonIcono.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                const Restaurar = this.ServicioReproductor.VolumenPrevio || 1;
                this.ServicioReproductor.AjustarVolumen(Restaurar);
                const Porcentaje = Math.round(Restaurar * 100);
                if (DeslizadorVolumen) {
                    DeslizadorVolumen.value = Restaurar;
                    DeslizadorVolumen.style.background = `linear-gradient(to right, var(--ColorPrimarioAzul) 0%, var(--ColorPrimarioAzul) ${Porcentaje}%, var(--ColorBordeSuave) ${Porcentaje}%, var(--ColorBordeSuave) 100%)`;
                    DeslizadorVolumen.title = `Volumen: ${Porcentaje}%`;
                }
                if (BotonIcono) BotonIcono.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
            return;
        }

        // Cerrar menús de reacciones flotantes si se hace clic fuera
        if (!Objetivo.closest(".ContenedorBotonReaccionPrincipal")) {
            document.querySelectorAll(".ContenedorReaccionesEmergentes.MenuReaccionesAbierto").forEach(Menu => {
                Menu.classList.remove("MenuReaccionesAbierto");
            });
        }

        // Cerrar menús de opciones de publicación si se hace clic fuera
        if (!Objetivo.closest(".ContenedorOpcionesPublicacion")) {
            document.querySelectorAll(".MenuDesplegableOpciones.MenuAbierto").forEach(Menu => {
                Menu.classList.remove("MenuAbierto");
            });
        }

        // 7. Reacciones Estilo Facebook
        const BotonEmoji = Objetivo.closest(".BotonReaccionEmoji");
        if (BotonEmoji) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                document.querySelectorAll(".ContenedorReaccionesEmergentes.MenuReaccionesAbierto").forEach(Menu => {
                    Menu.classList.remove("MenuReaccionesAbierto");
                });
                this.AbrirModalIniciarSesion("Inicia sesión para reaccionar a las publicaciones.");
                return;
            }
            const IdPublicacion = BotonEmoji.dataset.publicacionId;
            const TipoReaccion = BotonEmoji.dataset.tipoReaccion;
            this.RegistrarReaccion(IdPublicacion, TipoReaccion);
            return;
        }

        const BotonReaccionRapida = Objetivo.closest(".BotonDisparadorReaccionRapida");
        if (BotonReaccionRapida) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para reaccionar a las publicaciones.");
                return;
            }
            const IdPublicacion = BotonReaccionRapida.dataset.publicacionId;
            const MenuEmergente = document.getElementById(`MenuReacciones_${IdPublicacion}`);
            if (MenuEmergente) {
                const YaEstaAbierto = MenuEmergente.classList.contains("MenuReaccionesAbierto");
                document.querySelectorAll(".ContenedorReaccionesEmergentes.MenuReaccionesAbierto").forEach(Menu => {
                    Menu.classList.remove("MenuReaccionesAbierto");
                });
                if (!YaEstaAbierto) {
                    MenuEmergente.classList.add("MenuReaccionesAbierto");
                }
            }
            return;
        }

        // 7.1 Abrir Modal de Lista de Reacciones al hacer clic en el contador de reacciones
        const BotonContadorReacciones = Objetivo.closest(".ContadorReaccionesPublicacion");
        if (BotonContadorReacciones) {
            const IdPublicacion = BotonContadorReacciones.dataset.publicacionId || BotonContadorReacciones.id.replace("ContenedorContadorLikes_", "");
            this.AbrirModalListaReacciones(IdPublicacion);
            return;
        }

        // 8. Enviar Comentario
        const BotonEnviarComentario = Objetivo.closest(".BotonEnviarComentario");
        if (BotonEnviarComentario) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para comentar en las publicaciones.");
                return;
            }
            const IdPublicacion = BotonEnviarComentario.dataset.publicacionId;
            this.AgregarComentarioDesdeEntrada(IdPublicacion);
            return;
        }

        // 8.1 Dar Like a un Comentario
        const BotonLikeComentario = Objetivo.closest(".BotonLikeComentario");
        if (BotonLikeComentario) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para reaccionar a los comentarios.");
                return;
            }
            const IdPublicacion = BotonLikeComentario.dataset.publicacionId;
            const IdComentario = BotonLikeComentario.dataset.comentarioId;
            this.AlternarLikeComentario(IdPublicacion, IdComentario);
            return;
        }

        // 9. Enfocar Entrada de Comentario
        const BotonEnfocarComentario = Objetivo.closest(".BotonEnfocarComentario");
        if (BotonEnfocarComentario) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para comentar en las publicaciones.");
                return;
            }
            const IdPublicacion = BotonEnfocarComentario.dataset.publicacionId;
            const Entrada = document.getElementById(`EntradaComentario_${IdPublicacion}`);
            if (Entrada) Entrada.focus();
            return;
        }

        // 10. Compartir Publicación
        const BotonCompartir = Objetivo.closest(".BotonCompartirPublicacion");
        if (BotonCompartir) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para compartir letras del Beni.");
                return;
            }
            this.ServicioNotificaciones.MostrarMensajeToast("¡Enlace de publicación copiado para compartir!", '<i class="fa-solid fa-share-nodes"></i>');
            return;
        }

        // 11. Menú de Opciones de Publicación (3 Puntos), Editar y Eliminar
        const BotonDesplegarOpciones = Objetivo.closest(".BotonDesplegarOpcionesPublicacion");
        if (BotonDesplegarOpciones) {
            const IdPublicacion = BotonDesplegarOpciones.dataset.publicacionId;
            const MenuOpciones = document.getElementById(`MenuOpciones_${IdPublicacion}`);
            if (MenuOpciones) {
                const YaAbierto = MenuOpciones.classList.contains("MenuAbierto");
                document.querySelectorAll(".MenuDesplegableOpciones.MenuAbierto").forEach(M => M.classList.remove("MenuAbierto"));
                if (!YaAbierto) {
                    MenuOpciones.classList.add("MenuAbierto");
                }
            }
            return;
        }

        const BotonEliminarPub = Objetivo.closest(".BotonEliminarPublicacion");
        if (BotonEliminarPub) {
            const IdPublicacion = BotonEliminarPub.dataset.publicacionId;
            document.querySelectorAll(".MenuDesplegableOpciones.MenuAbierto").forEach(M => M.classList.remove("MenuAbierto"));
            this.AbrirModalConfirmarEliminarPublicacion(IdPublicacion);
            return;
        }

        const BotonEditarPub = Objetivo.closest(".BotonEditarPublicacion");
        if (BotonEditarPub) {
            const IdPublicacion = BotonEditarPub.dataset.publicacionId;
            document.querySelectorAll(".MenuDesplegableOpciones.MenuAbierto").forEach(M => M.classList.remove("MenuAbierto"));
            this.AbrirModalEditarAporte(IdPublicacion);
            return;
        }

        const BotonConfirmarEliminar = Objetivo.closest("#BotonConfirmarEliminarPublicacion");
        if (BotonConfirmarEliminar) {
            const IdPublicacion = BotonConfirmarEliminar.dataset.publicacionId;
            this.ProcesarEliminarPublicacion(IdPublicacion);
            return;
        }

        if (Objetivo.closest("#BotonCancelarEliminarModal") || Objetivo.closest("#ModalConfirmarEliminarFondo") === Objetivo) {
            this.CerrarModales();
            return;
        }

        if (Objetivo.closest("#BotonCerrarModalReacciones") || Objetivo.id === "ModalReaccionesFondo" || Objetivo.closest("#ModalReaccionesFondo") === Objetivo) {
            this.CerrarModales();
            return;
        }

        const BotonPestanaReaccion = Objetivo.closest(".PestanaFiltroReaccion");
        if (BotonPestanaReaccion) {
            const Filtro = BotonPestanaReaccion.dataset.filtro;
            document.querySelectorAll(".PestanaFiltroReaccion").forEach(B => B.classList.remove("PestanaActiva"));
            BotonPestanaReaccion.classList.add("PestanaActiva");

            document.querySelectorAll("#ListaUsuariosReaccionesModal .ItemUsuarioReaccion").forEach(Item => {
                const Tipo = Item.dataset.tipoReaccion;
                if (!Filtro || Filtro === "todas" || Tipo === Filtro) {
                    Item.style.display = "flex";
                } else {
                    Item.style.display = "none";
                }
            });
            return;
        }

        // 11. Abrir Modal de Letra
        const BotonAbrirLetra = Objetivo.closest(".BotonAbrirModalLetra");
        if (BotonAbrirLetra) {
            const IdCancion = BotonAbrirLetra.dataset.cancionId;
            this.AbrirModalLetra(IdCancion);
            return;
        }
        if (Objetivo.closest("#BotonCerrarModalLetra") || Objetivo.closest("#ModalVisorLetraFondo") === Objetivo) {
            this.CerrarModales();
            return;
        }

        // 12. Acciones del Modal de Letra (Semitonos, Acordes, Auto-Scroll, Copiar)
        if (Objetivo.closest("#BotonSubirSemitono")) {
            this.ComponenteModalLetra.DesplazamientoSemitonos++;
            this.ActualizarContenidoModalLetra();
            return;
        }
        if (Objetivo.closest("#BotonBajarSemitono")) {
            this.ComponenteModalLetra.DesplazamientoSemitonos--;
            this.ActualizarContenidoModalLetra();
            return;
        }
        if (Objetivo.closest("#BotonAlternarAcordes")) {
            this.ComponenteModalLetra.MostrarAcordes = !this.ComponenteModalLetra.MostrarAcordes;
            this.ActualizarContenidoModalLetra();
            return;
        }
        if (Objetivo.closest("#BotonAutoScrollKaraoke")) {
            this.AlternarAutoScrollKaraoke();
            return;
        }
        if (Objetivo.closest("#BotonCopiarLetraPortapapeles")) {
            if (this.ComponenteModalLetra.CancionSeleccionada) {
                navigator.clipboard.writeText(this.ComponenteModalLetra.CancionSeleccionada.LetraLimpia || "");
                this.ServicioNotificaciones.MostrarMensajeToast("¡Letra copiada al portapapeles con éxito!", '<i class="fa-solid fa-check"></i>');
            }
            return;
        }

        // 13. Abrir Modal de Partitura
        const BotonAbrirPartitura = Objetivo.closest(".BotonAbrirModalPartitura") || Objetivo.closest(".VistaPreviaPartituraTarjeta");
        if (BotonAbrirPartitura) {
            const IdCancion = BotonAbrirPartitura.dataset.cancionId;
            this.AbrirModalPartitura(IdCancion);
            return;
        }
        if (Objetivo.closest("#BotonCerrarModalPartitura") || Objetivo.closest("#ModalVisorPartituraFondo") === Objetivo) {
            this.CerrarModales();
            return;
        }

        // Zoom Partitura
        if (Objetivo.closest("#BotonAumentarZoomPartitura")) {
            this.ComponenteModalPartitura.NivelZoom = Math.min(2.5, this.ComponenteModalPartitura.NivelZoom + 0.25);
            this.ActualizarZoomPartitura();
            return;
        }
        if (Objetivo.closest("#BotonReducirZoomPartitura")) {
            this.ComponenteModalPartitura.NivelZoom = Math.max(0.6, this.ComponenteModalPartitura.NivelZoom - 0.25);
            this.ActualizarZoomPartitura();
            return;
        }
        if (Objetivo.closest("#BotonResetearZoomPartitura")) {
            this.ComponenteModalPartitura.NivelZoom = 1;
            this.ActualizarZoomPartitura();
            return;
        }
        if (Objetivo.closest("#BotonImprimirPartitura")) {
            window.print();
            return;
        }
        if (Objetivo.closest("#BotonDescargarPartitura")) {
            this.ServicioNotificaciones.MostrarMensajeToast("Descargando partitura digital del IFAEL...", '<i class="fa-solid fa-download"></i>');
            return;
        }

        // 13.5 Reproducir Himno al Beni desde accesos directos
        if (Objetivo.closest("[data-accion='ver-himno']")) {
            this.ReproducirHimnoAlBeni();
            return;
        }

        // 14. Abrir Modal Crear Aporte / Canción
        if (
            Objetivo.closest("#BotonCrearNuevoAporte") || 
            Objetivo.closest("#BotonAbrirModalCrearPublicacion") ||
            Objetivo.closest("#BotonRapidoLetraAcordes") ||
            Objetivo.closest("#BotonAportarNuevaCancionEnSeccion") ||
            (Objetivo.closest("[data-accion='crear-aporte']"))
        ) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para aportar y publicar nuevas letras del Beni.");
                return;
            }
            this.AbrirModalCrearAporte();
            return;
        }
        if (Objetivo.closest("#BotonCerrarModalCrear") || Objetivo.closest("#BotonCancelarCrearAporte") || Objetivo.closest("#ModalCrearAporteFondo") === Objetivo) {
            this.CerrarModales();
            return;
        }

        // 15. Seguir y Mensaje a Artistas
        if (Objetivo.closest("#BotonSeguirArtista")) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para seguir a los artistas y compositores.");
                return;
            }
            this.ServicioNotificaciones.MostrarMensajeToast("¡Ahora sigues a este artista!", '<i class="fa-solid fa-user-check"></i>');
            return;
        }

        if (Objetivo.closest("#BotonMensajeArtista")) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion("Inicia sesión para enviar un mensaje a este artista.");
                return;
            }
            this.ServicioNotificaciones.MostrarMensajeToast("Mensajería directa habilitada para tu cuenta.", '<i class="fa-solid fa-comment-dots"></i>');
            return;
        }

        // 16. Eventos de Perfil e Inicio / Cierre de Sesión
        if (Objetivo.closest("[data-accion='iniciar-sesion']")) {
            this.AbrirModalIniciarSesion();
            return;
        }

        if (Objetivo.closest("[data-accion='cerrar-sesion']")) {
            this.ProcesarCerrarSesion();
            return;
        }

        if (Objetivo.closest("#BotonPerfilUsuario")) {
            if (!this.ServicioEstado.EstaAutenticado()) {
                this.AbrirModalIniciarSesion();
            } else {
                this.ServicioEstado.EstablecerPestanaActiva("artistas");
            }
            return;
        }

        if (Objetivo.closest("#BotonCerrarModalLogin") || Objetivo.closest("#BotonContinuarComoInvitado")) {
            this.CerrarModales();
            return;
        }

        // Si se hace clic en el fondo del modal de login, no hacer nada (evitar cierre al hacer clic afuera)
        if (Objetivo.id === "ModalIniciarSesionFondo" || Objetivo.closest("#ModalIniciarSesionFondo") === Objetivo) {
            return;
        }

        if (Objetivo.closest("#BotonConfirmarIniciarSesion")) {
            this.ProcesarIniciarSesionFormulario();
            return;
        }

        // Guardar Nuevo Aporte Formulario
        if (Objetivo.closest("#BotonGuardarPublicarNuevoAporte")) {
            this.ProcesarGuardarNuevoAporte();
            return;
        }

        // Explorar Canciones por Género
        const BotonExplorarGenero = Objetivo.closest(".BotonExplorarCancionesGenero");
        if (BotonExplorarGenero) {
            const GeneroElegido = BotonExplorarGenero.dataset.genero;
            this.ServicioEstado.EstablecerFiltrosCanciones(GeneroElegido, "Todos");
            this.ServicioEstado.EstablecerPestanaActiva("canciones");
            return;
        }
    }

    ManejarEntradasTextoGlobales(Evento) {
        const Objetivo = Evento.target;

        // Buscador superior
        if (Objetivo.id === "CampoEntradaBuscadorPrincipal") {
            this.ServicioEstado.EstablecerTerminoBusqueda(Objetivo.value);
            return;
        }

        // Slider de progreso de audio
        if (Objetivo.id === "DeslizadorProgresoAudio") {
            const Porcentaje = Number(Objetivo.value);
            this.ServicioReproductor.SaltarProgreso(Porcentaje);
            Objetivo.style.background = `linear-gradient(to right, var(--ColorPrimarioAzul) 0%, var(--ColorPrimarioAzul) ${Porcentaje}%, var(--ColorBordeSuave) ${Porcentaje}%, var(--ColorBordeSuave) 100%)`;
            return;
        }

        // Slider de volumen
        if (Objetivo.id === "DeslizadorVolumenAudio") {
            const Valor = Number(Objetivo.value);
            this.ServicioReproductor.AjustarVolumen(Valor);
            const Porcentaje = Math.round(Valor * 100);
            Objetivo.style.background = `linear-gradient(to right, var(--ColorPrimarioAzul) 0%, var(--ColorPrimarioAzul) ${Porcentaje}%, var(--ColorBordeSuave) ${Porcentaje}%, var(--ColorBordeSuave) 100%)`;
            Objetivo.title = `Volumen: ${Porcentaje}%`;

            const BotonIcono = document.getElementById("BotonSilenciarVolumen");
            if (BotonIcono) {
                BotonIcono.innerHTML = Valor === 0 ? '<i class="fa-solid fa-volume-xmark"></i>' : (Valor < 0.5 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>');
            }
            return;
        }
    }

    ManejarCambiosSelects(Evento) {
        const Objetivo = Evento.target;
        if (Objetivo.id === "SelectorFiltroGenero") {
            this.ServicioEstado.EstablecerFiltrosCanciones(Objetivo.value, undefined);
        }
        if (Objetivo.id === "SelectorFiltroTono") {
            this.ServicioEstado.EstablecerFiltrosCanciones(undefined, Objetivo.value);
        }
    }

    EjecutarReproduccionCancionPorId(IdCancion) {
        const Cancion = this.ModeloAlmacenamiento.ObtenerCancionPorId(IdCancion);
        if (Cancion) {
            this.ServicioReproductor.CargarYReproducirCancion(Cancion);
            this.ServicioEstado.EstablecerCancionReproduciendo(Cancion, true);
            this.ActualizarBarraReproductorFlotante(Cancion);
            this.ServicioNotificaciones.MostrarMensajeToast(`Reproduciendo: ${Cancion.Titulo}`, '<i class="fa-solid fa-music"></i>');
        }
    }

    ReproducirHimnoAlBeni() {
        const CancionHimno = this.ModeloAlmacenamiento.ObtenerHimnoAlBeni();
        this.ServicioReproductor.CargarYReproducirCancion(CancionHimno);
        this.ServicioEstado.EstablecerCancionReproduciendo(CancionHimno, true);
        this.ActualizarBarraReproductorFlotante(CancionHimno);
        this.ServicioNotificaciones.MostrarMensajeToast("¡Reproduciendo Himno al Beni!", '<i class="fa-solid fa-flag" style="color: #2e7d32;"></i>');
        if (window.innerWidth <= 768) {
            this.CerrarMenuLateralMovil();
        }
    }

    ActualizarBarraReproductorFlotante(Cancion) {
        const BarraReproductor = document.getElementById("BarraReproductorInferiorFlotante");
        if (BarraReproductor) {
            BarraReproductor.style.transform = "";
            BarraReproductor.style.opacity = "";
            BarraReproductor.style.transition = "";
            BarraReproductor.classList.add("ReproductorVisible");
            document.body.classList.add("ConReproductorActivo");
        }

        const Titulo = document.getElementById("TituloPistaFlotante");
        const Autor = document.getElementById("AutorPistaFlotante");
        const Caratula = document.getElementById("CaratulaPistaFlotante");
        const BotonPlay = document.getElementById("BotonReproducirPausarFlotante");

        if (Titulo) Titulo.textContent = Cancion.Titulo;
        if (Autor) Autor.textContent = `${Cancion.Autor} • ${Cancion.Genero}`;
        if (Caratula) Caratula.src = Cancion.Caratula || 'Logo1.png';
        if (BotonPlay) BotonPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';

        const Lienzo = document.getElementById("LienzoVisualizadorAudio");
        if (Lienzo) {
            this.ServicioReproductor.DibujarVisualizadorEnLienzo(Lienzo);
        }
    }

    ActualizarProgresoAudioEnUI(DatosProgreso) {
        const Deslizador = document.getElementById("DeslizadorProgresoAudio");
        const TiempoActual = document.getElementById("TiempoTranscurridoFlotante");
        const TiempoTotal = document.getElementById("TiempoTotalFlotante");
        const BotonPlay = document.getElementById("BotonReproducirPausarFlotante");

        if (Deslizador && !Deslizador.matches(":active")) {
            Deslizador.value = DatosProgreso.Porcentaje;
            Deslizador.style.background = `linear-gradient(to right, var(--ColorPrimarioAzul) 0%, var(--ColorPrimarioAzul) ${DatosProgreso.Porcentaje}%, var(--ColorBordeSuave) ${DatosProgreso.Porcentaje}%, var(--ColorBordeSuave) 100%)`;
        }
        if (TiempoActual) {
            TiempoActual.textContent = this.ComponenteReproductorFlotante.FormatearSegundos(DatosProgreso.TiempoActual);
        }
        if (TiempoTotal) {
            TiempoTotal.textContent = this.ComponenteReproductorFlotante.FormatearSegundos(DatosProgreso.DuracionTotal);
        }
        if (BotonPlay) {
            BotonPlay.innerHTML = DatosProgreso.EstaReproduciendo ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        }

        // Progreso en tarjeta activa
        if (this.ServicioReproductor.CancionActual) {
            const BarraTarjeta = document.getElementById(`ProgresoTarjeta_${this.ServicioReproductor.CancionActual.IdCancion}`);
            if (BarraTarjeta) {
                BarraTarjeta.style.width = `${DatosProgreso.Porcentaje}%`;
            }
        }
    }

    ReproducirSiguienteCancion() {
        const Canciones = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones();
        if (!Canciones || Canciones.length === 0) return;

        let Indice = 0;
        if (this.ServicioReproductor.CancionActual) {
            const IndiceActual = Canciones.findIndex(C => C.IdCancion === this.ServicioReproductor.CancionActual.IdCancion);
            Indice = (IndiceActual + 1) % Canciones.length;
        }
        this.EjecutarReproduccionCancionPorId(Canciones[Indice].IdCancion);
    }

    ReproducirCancionAnterior() {
        const Canciones = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones();
        if (!Canciones || Canciones.length === 0) return;

        let Indice = 0;
        if (this.ServicioReproductor.CancionActual) {
            const IndiceActual = Canciones.findIndex(C => C.IdCancion === this.ServicioReproductor.CancionActual.IdCancion);
            Indice = (IndiceActual - 1 + Canciones.length) % Canciones.length;
        }
        this.EjecutarReproduccionCancionPorId(Canciones[Indice].IdCancion);
    }

    RegistrarReaccion(IdPublicacion, TipoReaccion) {
        if (!this.ServicioEstado.EstaAutenticado()) {
            this.AbrirModalIniciarSesion("Inicia sesión para reaccionar a esta publicación.");
            return;
        }
        const UsuarioActual = this.ServicioEstado.ObtenerUsuarioActual();
        const NombreUsuario = (UsuarioActual && UsuarioActual.Nombre) ? UsuarioActual.Nombre : "Edna Miriam Edgley Cuellar";
        const PublicacionActualizada = this.ModeloAlmacenamiento.RegistrarReaccionEnPublicacion(IdPublicacion, TipoReaccion, NombreUsuario);
        if (PublicacionActualizada) {
            // 1. Cerrar y forzar desaparición inmediata del menú flotante
            const MenuEmergente = document.getElementById(`MenuReacciones_${IdPublicacion}`);
            if (MenuEmergente) {
                MenuEmergente.classList.remove("MenuReaccionesAbierto");
                MenuEmergente.classList.add("MenuReaccionesOculto");
                setTimeout(() => {
                    MenuEmergente.classList.remove("MenuReaccionesOculto");
                }, 350);
            }

            // 2. Actualizar contador total de likes / reacciones
            const Contador = document.getElementById(`ContadorLikes_${IdPublicacion}`);
            if (Contador) Contador.textContent = PublicacionActualizada.CantidadMeGusta;

            // 2.1 Actualizar visibilidad del contenedor y burbujas dinámicas de reacciones
            const ContenedorContador = document.getElementById(`ContenedorContadorLikes_${IdPublicacion}`);
            const BurbujasElem = document.getElementById(`BurbujasLikes_${IdPublicacion}`);

            if (ContenedorContador) {
                ContenedorContador.style.display = (PublicacionActualizada.CantidadMeGusta > 0) ? "flex" : "none";
                if (this.ComponenteMuroPrincipal && this.ComponenteMuroPrincipal.ComponenteTarjetaPublicacion) {
                    ContenedorContador.title = this.ComponenteMuroPrincipal.ComponenteTarjetaPublicacion.ObtenerTextoTooltipReacciones(PublicacionActualizada);
                }
            }
            if (BurbujasElem && this.ComponenteMuroPrincipal && this.ComponenteMuroPrincipal.ComponenteTarjetaPublicacion) {
                BurbujasElem.innerHTML = this.ComponenteMuroPrincipal.ComponenteTarjetaPublicacion.GenerarBurbujasReaccionesHtml(PublicacionActualizada);
            }

            // 3. Obtener diccionario y reacción activa del usuario
            const Diccionario = window.DiccionarioReaccionesLMP || {
                MeGusta: { Titulo: "Me gusta", TituloCorto: "Me gusta", Icono: '<i class="fa-solid fa-thumbs-up" style="color: #1877f2;"></i>', Color: "#1877f2" },
                MeEncanta: { Titulo: "Me encanta", TituloCorto: "Me encanta", Icono: '<i class="fa-solid fa-heart" style="color: #f3425f;"></i>', Color: "#f3425f" },
                VivaBeni: { Titulo: "¡Viva el Beni!", TituloCorto: "¡Viva Beni!", Icono: '<i class="fa-solid fa-guitar" style="color: #2e7d32;"></i>', Color: "#2e7d32" },
                Aplausos: { Titulo: "Aplausos folklóricos", TituloCorto: "Aplausos", Icono: '<i class="fa-solid fa-hands-clapping" style="color: #f7b125;"></i>', Color: "#f7b125" },
                BuenRitmo: { Titulo: "¡Buen ritmo!", TituloCorto: "Buen ritmo", Icono: '<i class="fa-solid fa-music" style="color: #8b5cf6;"></i>', Color: "#8b5cf6" }
            };

            const MiReaccion = PublicacionActualizada.MiReaccionUsuario;
            const BotonPrincipal = document.getElementById(`BotonReaccionPrincipal_${IdPublicacion}`);

            // 4. Actualizar estado visual del botón de reaccionar principal
            if (BotonPrincipal) {
                const IconoElem = BotonPrincipal.querySelector(".IconoBotonReaccion");
                const TextoElem = BotonPrincipal.querySelector(".TextoBotonReaccion");

                if (MiReaccion && Diccionario[MiReaccion]) {
                    const Config = Diccionario[MiReaccion];
                    if (IconoElem) IconoElem.innerHTML = Config.Icono;
                    if (TextoElem) TextoElem.textContent = Config.TituloCorto;
                    BotonPrincipal.style.color = Config.Color;
                    BotonPrincipal.style.fontWeight = "700";
                    BotonPrincipal.classList.add("ReaccionadoActivo");
                } else {
                    if (IconoElem) IconoElem.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
                    if (TextoElem) TextoElem.textContent = 'Reaccionar';
                    BotonPrincipal.style.color = "";
                    BotonPrincipal.style.fontWeight = "";
                    BotonPrincipal.classList.remove("ReaccionadoActivo");
                }
            }

            // 5. Actualizar selección en las opciones del menú flotante
            const ContenedorPadre = document.querySelector(`.ContenedorBotonReaccionPrincipal[data-publicacion-id="${IdPublicacion}"]`);
            if (ContenedorPadre) {
                ContenedorPadre.querySelectorAll(".BotonReaccionEmoji").forEach(Btn => {
                    if (Btn.dataset.tipoReaccion === MiReaccion) {
                        Btn.classList.add("ReaccionSeleccionada");
                    } else {
                        Btn.classList.remove("ReaccionSeleccionada");
                    }
                });
            }
        }
    }

    AgregarComentarioDesdeEntrada(IdPublicacion) {
        if (!this.ServicioEstado.EstaAutenticado()) {
            this.AbrirModalIniciarSesion("Inicia sesión para comentar en las publicaciones.");
            return;
        }

        const Entrada = document.getElementById(`EntradaComentario_${IdPublicacion}`);
        if (!Entrada || !Entrada.value.trim()) return;

        const UsuarioActual = this.ServicioEstado.ObtenerUsuarioActual();
        const Texto = Entrada.value.trim();
        const ObjetoComentario = {
            NombreUsuario: (UsuarioActual && UsuarioActual.Nombre) ? UsuarioActual.Nombre : "Edna Miriam Edgley Cuellar",
            AvatarUsuario: (UsuarioActual && UsuarioActual.FotoPerfil) ? UsuarioActual.FotoPerfil : "Logo1.png",
            TextoComentario: Texto
        };

        const PublicacionActualizada = this.ModeloAlmacenamiento.AgregarComentarioAPublicacion(IdPublicacion, ObjetoComentario);
        if (PublicacionActualizada) {
            Entrada.value = "";
            const ListaContenedor = document.getElementById(`ListaComentarios_${IdPublicacion}`);
            if (ListaContenedor) {
                const NuevoHtml = `
                    <div class="ElementoComentarioIndividual" id="Comentario_${ObjetoComentario.IdComentario}" style="animation: AnimacionAparecerSuave 0.2s ease;">
                        <img src="${ObjetoComentario.AvatarUsuario}" alt="${ObjetoComentario.NombreUsuario}" class="AvatarComentarista" onerror="this.src='Logo1.png'">
                        <div class="ContenidoComentarioCompleto">
                            <div class="BurbujaComentarioTexto">
                                <div class="NombreComentarista">
                                    ${ObjetoComentario.NombreUsuario}
                                    ${(this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EsUsuarioVerificado(ObjetoComentario.NombreUsuario)) ? '<span class="InsigniaVerificada" style="font-size: 11px; margin-left: 4px;" title="Verificado"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                                </div>
                                <div class="CuerpoComentario">${ObjetoComentario.TextoComentario}</div>
                            </div>
                            <div class="FilaMetaYAccionesComentario">
                                <span class="MetaComentarioTiempo">Hace un momento</span>
                                <button class="BotonLikeComentario" 
                                        data-publicacion-id="${IdPublicacion}" 
                                        data-comentario-id="${ObjetoComentario.IdComentario}"
                                        id="BotonLikeCom_${ObjetoComentario.IdComentario}">
                                    <i class="fa-solid fa-thumbs-up"></i> Me gusta
                                </button>
                                <span class="InsigniaLikesComentario" 
                                      id="InsigniaLikesCom_${ObjetoComentario.IdComentario}" 
                                      style="display: none;">
                                    <i class="fa-solid fa-thumbs-up"></i>
                                    <span id="NumLikesCom_${ObjetoComentario.IdComentario}">0</span>
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                ListaContenedor.insertAdjacentHTML("beforeend", NuevoHtml);
                ListaContenedor.scrollTop = ListaContenedor.scrollHeight;
            }
            const Contador = document.getElementById(`ContadorComentarios_${IdPublicacion}`);
            if (Contador) {
                Contador.textContent = `${PublicacionActualizada.Comentarios.length} comentarios`;
            }
            this.ServicioNotificaciones.MostrarMensajeToast("¡Comentario publicado!", '<i class="fa-solid fa-comment"></i>');
        }
    }

    AlternarLikeComentario(IdPublicacion, IdComentario) {
        const Resultado = this.ModeloAlmacenamiento.AlternarLikeEnComentario(IdPublicacion, IdComentario);
        if (Resultado && Resultado.Comentario) {
            const Comentario = Resultado.Comentario;
            const Boton = document.getElementById(`BotonLikeCom_${IdComentario}`);
            const Insignia = document.getElementById(`InsigniaLikesCom_${IdComentario}`);
            const NumLikes = document.getElementById(`NumLikesCom_${IdComentario}`);

            if (Boton) {
                if (Comentario.DioLikeUsuario) {
                    Boton.classList.add("LikeActivo");
                } else {
                    Boton.classList.remove("LikeActivo");
                }
            }

            if (NumLikes) {
                NumLikes.textContent = Comentario.CantidadLikes || 0;
            }

            if (Insignia) {
                Insignia.style.display = (Comentario.CantidadLikes > 0) ? "inline-flex" : "none";
            }
        }
    }

    AbrirModalLetra(IdCancion) {
        if (!this.ContenedorModales) return;
        this.ComponenteModalLetra.DesplazamientoSemitonos = 0;
        this.ComponenteModalLetra.MostrarAcordes = true;
        this.ComponenteModalLetra.EstaDesplazandoAuto = false;
        this.ContenedorModales.innerHTML = this.ComponenteModalLetra.Renderizar(IdCancion);
    }

    ActualizarContenidoModalLetra() {
        const Cancion = this.ComponenteModalLetra.CancionSeleccionada;
        if (!Cancion) return;

        let LetraProcesada = Cancion.LetraConAcordes;
        if (this.ComponenteModalLetra.DesplazamientoSemitonos !== 0) {
            LetraProcesada = this.ComponenteModalLetra.TransponerTextoConAcordes(
                LetraProcesada,
                this.ComponenteModalLetra.DesplazamientoSemitonos
            );
        }

        let LetraFinalHtml = "";
        if (this.ComponenteModalLetra.MostrarAcordes) {
            LetraFinalHtml = LetraProcesada.replace(/\[([^\]]+)\]/g, '<span class="AcordeMusical">$1</span>');
        } else {
            LetraFinalHtml = LetraProcesada.replace(/\[([^\]]+)\]/g, '');
        }

        const Pre = document.getElementById("TextoLetraPreformateada");
        if (Pre) Pre.innerHTML = LetraFinalHtml;

        const EtiquetaTono = document.getElementById("EtiquetaTonoActual");
        if (EtiquetaTono) {
            const St = this.ComponenteModalLetra.DesplazamientoSemitonos;
            EtiquetaTono.textContent = `${St >= 0 ? `+${St}` : St} st`;
        }

        const BotonAcordes = document.getElementById("BotonAlternarAcordes");
        if (BotonAcordes) {
            BotonAcordes.innerHTML = this.ComponenteModalLetra.MostrarAcordes ? '<i class="fa-regular fa-eye-slash"></i> Ocultar Acordes' : '<i class="fa-solid fa-guitar"></i> Mostrar Acordes';
        }
    }

    AlternarAutoScrollKaraoke() {
        const CajaScroll = document.getElementById("CuerpoLetraScrollable");
        const BotonScroll = document.getElementById("BotonAutoScrollKaraoke");
        if (!CajaScroll || !BotonScroll) return;

        if (this.ComponenteModalLetra.EstaDesplazandoAuto) {
            clearInterval(this.ComponenteModalLetra.IntervaloKaraoke);
            this.ComponenteModalLetra.EstaDesplazandoAuto = false;
            BotonScroll.innerHTML = '<i class="fa-solid fa-angles-down"></i> Auto-Scroll';
        } else {
            this.ComponenteModalLetra.EstaDesplazandoAuto = true;
            BotonScroll.innerHTML = '<i class="fa-solid fa-stop"></i> Detener Scroll';
            this.ComponenteModalLetra.IntervaloKaraoke = setInterval(() => {
                CajaScroll.scrollTop += 1.5;
                if (CajaScroll.scrollTop + CajaScroll.clientHeight >= CajaScroll.scrollHeight - 5) {
                    clearInterval(this.ComponenteModalLetra.IntervaloKaraoke);
                    this.ComponenteModalLetra.EstaDesplazandoAuto = false;
                    BotonScroll.innerHTML = '<i class="fa-solid fa-angles-down"></i> Auto-Scroll';
                }
            }, 60);
        }
    }

    AbrirModalPartitura(IdCancion) {
        if (!this.ContenedorModales) return;
        this.ContenedorModales.innerHTML = this.ComponenteModalPartitura.Renderizar(IdCancion);
    }

    ActualizarZoomPartitura() {
        const Imagen = document.getElementById("ImagenPartituraZoomable");
        const Etiqueta = document.getElementById("EtiquetaPorcentajeZoom");
        if (Imagen) Imagen.style.transform = `scale(${this.ComponenteModalPartitura.NivelZoom})`;
        if (Etiqueta) Etiqueta.textContent = `${Math.round(this.ComponenteModalPartitura.NivelZoom * 100)}%`;
    }

    AbrirModalCrearAporte() {
        if (!this.ContenedorModales) return;
        if (this.AudioModal) {
            this.AudioModal.pause();
            this.AudioModal = null;
        }
        // Limpiar de forma estricta cualquier residuo de edición previa
        this.PublicacionEnEdicion = null;
        this.CancionEnEdicion = null;
        this.ContenedorModales.innerHTML = this.ComponenteModalCrearAporte.Renderizar(null);
        this.VincularEventosSubidaMultimediaModal();
    }

    AbrirModalEditarAporte(IdPublicacion) {
        if (!this.ContenedorModales) return;
        if (this.AudioModal) {
            this.AudioModal.pause();
            this.AudioModal = null;
        }

        const Publicacion = this.ModeloAlmacenamiento.ObtenerPublicacionPorId(IdPublicacion);
        if (!Publicacion) return;

        const UsuarioActual = this.ServicioEstado ? (this.ServicioEstado.ObtenerUsuarioActual() || this.ServicioEstado.ObtenerEstado("UsuarioActual")) : null;
        const EstaAutenticado = !!(UsuarioActual && !UsuarioActual.EsInvitado && UsuarioActual.Nombre && UsuarioActual.Nombre !== "Usuario");
        const EsAutor = EstaAutenticado && Publicacion.NombreAutor && (
            UsuarioActual.Nombre.trim().toLowerCase() === Publicacion.NombreAutor.trim().toLowerCase() ||
            Publicacion.NombreAutor.trim().toLowerCase().includes(UsuarioActual.Nombre.trim().toLowerCase())
        );
        if (!EsAutor) {
            this.ServicioNotificaciones.MostrarMensajeToast("Solo el autor de la publicación puede editarla.", '<i class="fa-solid fa-lock"></i>');
            return;
        }

        let Cancion = null;
        if (Publicacion.IdCancionAsociada) {
            Cancion = this.ModeloAlmacenamiento.ObtenerCancionPorId(Publicacion.IdCancionAsociada);
        }
        if (!Cancion && Publicacion.TextoPublicacion) {
            Cancion = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones().find(C =>
                C.Titulo && Publicacion.TextoPublicacion.toLowerCase().includes(C.Titulo.toLowerCase())
            );
        }

        this.PublicacionEnEdicion = Publicacion;
        this.CancionEnEdicion = Cancion;

        const DatosEdicion = {
            IdPublicacion: Publicacion.IdPublicacion,
            TextoPublicacion: Publicacion.TextoPublicacion || "",
            IdCancion: Cancion ? Cancion.IdCancion : (Publicacion.IdCancionAsociada || null),
            Titulo: Cancion ? Cancion.Titulo : "",
            Autor: Cancion ? Cancion.Autor : (Publicacion.NombreAutor || "Edna Miriam Edgley Cuellar"),
            Genero: Cancion ? Cancion.Genero : "Taquirari",
            TonoOriginal: Cancion ? Cancion.TonoOriginal : "Re Mayor (D)",
            TempoBPM: Cancion ? Cancion.TempoBPM : 108,
            LetraConAcordes: Cancion ? (Cancion.LetraConAcordes || Cancion.LetraLimpia || "") : "",
            LetraLimpia: Cancion ? Cancion.LetraLimpia : "",
            AudioUrl: Cancion ? Cancion.AudioUrl : "",
            ImagenPartitura: Cancion ? Cancion.ImagenPartitura : ""
        };

        this.ContenedorModales.innerHTML = this.ComponenteModalCrearAporte.Renderizar(DatosEdicion);
        this.VincularEventosSubidaMultimediaModal();

        if (DatosEdicion.AudioUrl) {
            this.ConfigurarAudioModal(DatosEdicion.AudioUrl);
        }
    }

    ConfigurarAudioModal(UrlAudio) {
        if (this.AudioModal) {
            this.AudioModal.pause();
            this.AudioModal = null;
        }

        const IconoPlay = document.getElementById("IconoPlayMuestraAudio");
        const BarraProgreso = document.getElementById("ProgresoMuestraAudio");
        const TextoTiempoActual = document.getElementById("TiempoActualMuestraAudio");
        const TextoTiempoTotal = document.getElementById("TiempoTotalMuestraAudio");

        if (BarraProgreso) BarraProgreso.style.width = "0%";
        if (TextoTiempoActual) TextoTiempoActual.textContent = "0:00";
        if (TextoTiempoTotal) TextoTiempoTotal.textContent = "--:--";
        if (IconoPlay) IconoPlay.className = "fa-solid fa-play";

        if (!UrlAudio || UrlAudio.trim() === "") return;

        this.AudioModal = new Audio(UrlAudio);

        const FormatearSegundos = (Segundos) => {
            if (isNaN(Segundos) || Segundos < 0) return "0:00";
            const Min = Math.floor(Segundos / 60);
            const Seg = Math.floor(Segundos % 60);
            return `${Min}:${Seg < 10 ? '0' : ''}${Seg}`;
        };

        this.AudioModal.addEventListener("loadedmetadata", () => {
            if (TextoTiempoTotal && this.AudioModal && !isNaN(this.AudioModal.duration)) {
                TextoTiempoTotal.textContent = FormatearSegundos(this.AudioModal.duration);
            }
        });

        this.AudioModal.addEventListener("timeupdate", () => {
            if (!this.AudioModal) return;
            const Actual = this.AudioModal.currentTime || 0;
            const Duracion = this.AudioModal.duration || 1;
            const Porcentaje = Math.min(100, (Actual / Duracion) * 100);

            if (BarraProgreso) BarraProgreso.style.width = `${Porcentaje}%`;
            if (TextoTiempoActual) TextoTiempoActual.textContent = FormatearSegundos(Actual);
        });

        this.AudioModal.addEventListener("ended", () => {
            if (IconoPlay) IconoPlay.className = "fa-solid fa-play";
            if (BarraProgreso) BarraProgreso.style.width = "0%";
            if (TextoTiempoActual) TextoTiempoActual.textContent = "0:00";
        });

        this.AudioModal.addEventListener("error", (e) => {
            console.warn("[ModalAudio] Error al cargar recurso de audio:", e);
            if (IconoPlay) IconoPlay.className = "fa-solid fa-triangle-exclamation";
            if (TextoTiempoTotal) TextoTiempoTotal.textContent = "Error";
        });
    }

    VincularEventosSubidaMultimediaModal() {
        const ZonaAudio = document.getElementById("ZonaSoltarAudio");
        const InputAudio = document.getElementById("CampoNuevoArchivoAudio");
        const VistaPreviaAudio = document.getElementById("VistaPreviaAudioCargado");
        const EstadoVacioAudio = document.getElementById("EstadoVacioAudio");
        const EtiquetaNombreAudio = document.getElementById("EtiquetaNombreAudio");
        const EtiquetaEstadoAudio = document.getElementById("EtiquetaEstadoAudio");
        const BotonCambiarAudio = document.getElementById("BotonCambiarAudio");
        const ContenedorReproductorMuestra = document.getElementById("ContenedorReproductorMuestra");
        const BotonPlayMuestraAudio = document.getElementById("BotonPlayMuestraAudio");
        const IconoPlayMuestraAudio = document.getElementById("IconoPlayMuestraAudio");
        const BarraClickeable = document.getElementById("BarraProgresoMuestraClickeable");

        const ZonaPartitura = document.getElementById("ZonaSoltarPartitura");
        const InputPartitura = document.getElementById("CampoNuevoArchivoPartitura");
        const VistaPreviaPartitura = document.getElementById("VistaPreviaPartituraCargada");
        const EstadoVacioPartitura = document.getElementById("EstadoVacioPartitura");
        const EtiquetaNombrePartitura = document.getElementById("EtiquetaNombrePartitura");
        const EtiquetaEstadoPartitura = document.getElementById("EtiquetaEstadoPartitura");
        const ImgMiniaturaPartitura = document.getElementById("ImgMiniaturaPartitura");
        const BotonCambiarPartitura = document.getElementById("BotonCambiarPartitura");

        // Control Interactivo de Audio
        if (ZonaAudio && InputAudio) {
            ZonaAudio.addEventListener("click", (e) => {
                if (e.target.closest(".ReproductorMuestraModal") || e.target.closest(".BotonCambiarArchivo")) return;
                InputAudio.click();
            });

            if (BotonCambiarAudio) {
                BotonCambiarAudio.addEventListener("click", (e) => {
                    e.stopPropagation();
                    InputAudio.click();
                });
            }

            if (BotonPlayMuestraAudio) {
                BotonPlayMuestraAudio.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!this.AudioModal) return;

                    if (this.AudioModal.paused) {
                        this.AudioModal.play().then(() => {
                            if (IconoPlayMuestraAudio) IconoPlayMuestraAudio.className = "fa-solid fa-pause";
                        }).catch(err => {
                            console.warn("[ModalAudio] Reproducción bloqueada por navegador:", err);
                        });
                    } else {
                        this.AudioModal.pause();
                        if (IconoPlayMuestraAudio) IconoPlayMuestraAudio.className = "fa-solid fa-play";
                    }
                });
            }

            if (BarraClickeable) {
                BarraClickeable.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!this.AudioModal || !this.AudioModal.duration) return;
                    const Rect = BarraClickeable.getBoundingClientRect();
                    const PosX = Math.max(0, Math.min(e.clientX - Rect.left, Rect.width));
                    const Ratio = PosX / Rect.width;
                    this.AudioModal.currentTime = Ratio * this.AudioModal.duration;
                });
            }

            ["dragenter", "dragover"].forEach(TipoEvento => {
                ZonaAudio.addEventListener(TipoEvento, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ZonaAudio.classList.add("ZonaArrastreActiva");
                });
            });

            ["dragleave", "drop"].forEach(TipoEvento => {
                ZonaAudio.addEventListener(TipoEvento, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ZonaAudio.classList.remove("ZonaArrastreActiva");
                });
            });

            ZonaAudio.addEventListener("drop", (e) => {
                if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                    InputAudio.files = e.dataTransfer.files;
                    InputAudio.dispatchEvent(new Event("change"));
                }
            });

            InputAudio.addEventListener("change", () => {
                if (InputAudio.files && InputAudio.files.length > 0) {
                    const Archivo = InputAudio.files[0];
                    const TamanoMB = (Archivo.size / (1024 * 1024)).toFixed(2);
                    if (EtiquetaNombreAudio) {
                        EtiquetaNombreAudio.textContent = `${Archivo.name} (${TamanoMB} MB)`;
                        EtiquetaNombreAudio.title = Archivo.name;
                    }
                    if (EtiquetaEstadoAudio) {
                        EtiquetaEstadoAudio.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--ColorVerdeBeni);"></i> Listo para subir a Cloudinary';
                    }

                    if (VistaPreviaAudio) VistaPreviaAudio.style.display = "flex";
                    if (EstadoVacioAudio) EstadoVacioAudio.style.display = "none";
                    if (ContenedorReproductorMuestra) ContenedorReproductorMuestra.style.display = "flex";

                    const BlobUrl = URL.createObjectURL(Archivo);
                    this.ConfigurarAudioModal(BlobUrl);
                }
            });
        }

        // Control Interactivo de Partitura
        if (ZonaPartitura && InputPartitura) {
            ZonaPartitura.addEventListener("click", (e) => {
                if (e.target.closest(".BotonCambiarArchivo")) return;
                InputPartitura.click();
            });

            if (BotonCambiarPartitura) {
                BotonCambiarPartitura.addEventListener("click", (e) => {
                    e.stopPropagation();
                    InputPartitura.click();
                });
            }

            ["dragenter", "dragover"].forEach(TipoEvento => {
                ZonaPartitura.addEventListener(TipoEvento, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ZonaPartitura.classList.add("ZonaArrastreActiva");
                });
            });

            ["dragleave", "drop"].forEach(TipoEvento => {
                ZonaPartitura.addEventListener(TipoEvento, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ZonaPartitura.classList.remove("ZonaArrastreActiva");
                });
            });

            ZonaPartitura.addEventListener("drop", (e) => {
                if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                    InputPartitura.files = e.dataTransfer.files;
                    InputPartitura.dispatchEvent(new Event("change"));
                }
            });

            InputPartitura.addEventListener("change", () => {
                if (InputPartitura.files && InputPartitura.files.length > 0) {
                    const Archivo = InputPartitura.files[0];
                    const TamanoMB = (Archivo.size / (1024 * 1024)).toFixed(2);
                    if (EtiquetaNombrePartitura) {
                        EtiquetaNombrePartitura.textContent = `${Archivo.name} (${TamanoMB} MB)`;
                        EtiquetaNombrePartitura.title = Archivo.name;
                    }
                    if (EtiquetaEstadoPartitura) {
                        EtiquetaEstadoPartitura.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--ColorVerdeBeni);"></i> Listo para subir a Cloudinary';
                    }
                    if (ImgMiniaturaPartitura && Archivo.type.startsWith("image/")) {
                        ImgMiniaturaPartitura.src = URL.createObjectURL(Archivo);
                    }
                    if (VistaPreviaPartitura) VistaPreviaPartitura.style.display = "flex";
                    if (EstadoVacioPartitura) EstadoVacioPartitura.style.display = "none";
                }
            });
        }
    }

    async ProcesarGuardarNuevoAporte() {
        const Titulo = document.getElementById("CampoNuevoTitulo")?.value.trim();
        const Autor = document.getElementById("CampoNuevoAutor")?.value.trim() || "Compositor Anónimo";
        const Genero = document.getElementById("CampoNuevoGenero")?.value || "Taquirari";
        const Tono = document.getElementById("CampoNuevoTono")?.value.trim() || "Re Mayor (D)";
        const Tempo = Number(document.getElementById("CampoNuevoTempo")?.value) || 108;
        const Letra = document.getElementById("CampoNuevaLetra")?.value.trim();
        const MensajeMuro = document.getElementById("CampoNuevoMensajeMuro")?.value.trim() || `¡Nueva letra y acordes registrados para '${Titulo}'!`;

        const InputAudio = document.getElementById("CampoNuevoArchivoAudio");
        const InputPartitura = document.getElementById("CampoNuevoArchivoPartitura");
        const BotonGuardar = document.getElementById("BotonGuardarPublicarNuevoAporte");
        const IndicadorCloudinary = document.getElementById("IndicadorSubidaCloudinary");

        if (!Titulo || !Letra) {
            alert("Por favor ingresa al menos el Título y la Letra de la canción.");
            return;
        }

        const EsModoEdicion = Boolean(this.PublicacionEnEdicion);

        let UrlAudioSubido = EsModoEdicion && this.CancionEnEdicion ? (this.CancionEnEdicion.AudioUrl || "") : "";
        let UrlPartituraSubida = EsModoEdicion && this.CancionEnEdicion ? (this.CancionEnEdicion.ImagenPartitura || "IFAEL.jpg") : "IFAEL.jpg";

        // Subir a Cloudinary si se seleccionaron archivos nuevos
        const HayArchivos = (InputAudio?.files?.length > 0) || (InputPartitura?.files?.length > 0);
        if (HayArchivos && this.ServicioCloudinary) {
            if (BotonGuardar) {
                BotonGuardar.disabled = true;
                BotonGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo a Cloudinary...';
            }
            if (IndicadorCloudinary) {
                IndicadorCloudinary.style.display = "block";
            }

            try {
                if (InputAudio?.files?.length > 0) {
                    const ResAudio = await this.ServicioCloudinary.SubirAudio(InputAudio.files[0]);
                    if (ResAudio) UrlAudioSubido = ResAudio;
                }
                if (InputPartitura?.files?.length > 0) {
                    const ResPartitura = await this.ServicioCloudinary.SubirPartitura(InputPartitura.files[0]);
                    if (ResPartitura) UrlPartituraSubida = ResPartitura;
                }
            } catch (ErrorSubida) {
                console.warn("[ControladorPrincipal] Error al subir a Cloudinary:", ErrorSubida);
                this.ServicioNotificaciones.MostrarMensajeToast("Aviso: Falló la subida multimedia a Cloudinary, guardando datos.", '<i class="fa-solid fa-triangle-exclamation"></i>');
            }
        }

        if (BotonGuardar) {
            BotonGuardar.disabled = true;
            BotonGuardar.innerHTML = EsModoEdicion
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando en base de datos...'
                : '<i class="fa-solid fa-spinner fa-spin"></i> Registrando en base de datos...';
        }

        const LetraLimpia = Letra.replace(/\[([^\]]+)\]/g, '');

        if (EsModoEdicion) {
            const IdPublicacion = this.PublicacionEnEdicion.IdPublicacion;
            const IdCancion = this.CancionEnEdicion ? this.CancionEnEdicion.IdCancion : this.PublicacionEnEdicion.IdCancionAsociada;

            // 1. Actualizar Canción si existe
            if (IdCancion) {
                await this.ModeloAlmacenamiento.ActualizarCancion(IdCancion, {
                    Titulo: Titulo,
                    Autor: Autor,
                    Genero: Genero,
                    TonoOriginal: Tono,
                    TempoBPM: Tempo,
                    AudioUrl: UrlAudioSubido,
                    ImagenPartitura: UrlPartituraSubida,
                    LetraConAcordes: Letra,
                    LetraLimpia: LetraLimpia
                });
            }

            // 2. Actualizar Publicación
            await this.ModeloAlmacenamiento.ActualizarPublicacion(IdPublicacion, {
                TextoPublicacion: MensajeMuro,
                NombreAutor: Autor,
                EsEditada: true
            });

            // Limpieza estricta del estado de edición
            this.PublicacionEnEdicion = null;
            this.CancionEnEdicion = null;

            this.CerrarModales();
            this.ActualizarVistaCentral();
            this.ServicioNotificaciones.MostrarMensajeToast(
                `¡'${Titulo}' y su publicación actualizados con éxito!`,
                '<i class="fa-solid fa-circle-check"></i>'
            );
        } else {
            // Modo Creación
            const NuevaCancion = await this.ModeloAlmacenamiento.GuardarCancionNueva({
                Titulo: Titulo,
                Autor: Autor,
                Genero: Genero,
                TonoOriginal: Tono,
                TempoBPM: Tempo,
                EsEstudianteIFAEL: true,
                Descripcion: `Composición beniana registrada en Letras Mi Poblau en ritmo de ${Genero}.`,
                Caratula: "Logo1.png",
                ImagenPartitura: UrlPartituraSubida,
                AudioUrl: UrlAudioSubido,
                LetraConAcordes: Letra,
                LetraLimpia: LetraLimpia,
                SecuenciaNotasMelodia: [
                    { Nota: "D4", Duracion: 0.4 }, { Nota: "G4", Duracion: 0.4 }, { Nota: "A4", Duracion: 0.6 }
                ]
            });

            const UsuarioActual = this.ServicioEstado ? this.ServicioEstado.ObtenerUsuarioActual() : null;
            const NombreAutorFinal = (UsuarioActual && UsuarioActual.Nombre && !UsuarioActual.EsInvitado) ? UsuarioActual.Nombre : Autor;
            const AvatarFinal = (UsuarioActual && UsuarioActual.FotoPerfil) ? UsuarioActual.FotoPerfil : "Logo1.png";

            await this.ModeloAlmacenamiento.GuardarPublicacionNueva({
                NombreAutor: NombreAutorFinal,
                AvatarAutor: AvatarFinal,
                EsVerificado: this.ModeloAlmacenamiento.EsUsuarioVerificado(NombreAutorFinal),
                TextoPublicacion: MensajeMuro,
                IdCancionAsociada: NuevaCancion.IdCancion
            });

            // Limpieza estricta del estado de edición
            this.PublicacionEnEdicion = null;
            this.CancionEnEdicion = null;

            this.CerrarModales();
            this.ServicioEstado.EstablecerPestanaActiva("muro");
            this.ActualizarVistaCentral();
            this.ServicioNotificaciones.MostrarMensajeToast(
                `¡'${Titulo}' publicado con éxito en Letras Mi Poblau!`,
                '<i class="fa-solid fa-circle-check"></i>'
            );
        }
    }

    CerrarModales() {
        if (this.ComponenteModalLetra && this.ComponenteModalLetra.IntervaloKaraoke) {
            clearInterval(this.ComponenteModalLetra.IntervaloKaraoke);
        }
        if (this.AudioModal) {
            this.AudioModal.pause();
            this.AudioModal = null;
        }
        // Limpiar residuos de edición
        this.PublicacionEnEdicion = null;
        this.CancionEnEdicion = null;
        if (this.ContenedorModales) {
            this.ContenedorModales.innerHTML = "";
        }
    }

    AbrirModalIniciarSesion(MensajeMotivo = "") {
        if (!this.ContenedorModales) return;
        this.ContenedorModales.innerHTML = this.ComponenteModalIniciarSesion.Renderizar(MensajeMotivo);

        // Limpieza estricta de inputs para evitar autollenado por el navegador
        setTimeout(() => {
            const InputEmail = document.getElementById("CampoEmailLogin");
            const InputPass = document.getElementById("CampoPasswordLogin");
            const Form = document.getElementById("FormularioInicioSesionModal");
            if (Form) Form.reset();
            if (InputEmail) {
                InputEmail.value = "";
            }
            if (InputPass) {
                InputPass.value = "";
            }
        }, 50);
    }

    async ProcesarIniciarSesionFormulario() {
        const InputEmail = document.getElementById("CampoEmailLogin");
        const InputPass = document.getElementById("CampoPasswordLogin");
        const CajaError = document.getElementById("MensajeErrorLoginModal");
        const BotonSubmit = document.getElementById("BotonConfirmarIniciarSesion");

        const Email = InputEmail ? InputEmail.value.trim() : "";
        const Password = InputPass ? InputPass.value : "";

        if (CajaError) {
            CajaError.style.display = "none";
            CajaError.textContent = "";
        }

        if (!Email) {
            if (CajaError) {
                CajaError.textContent = "Por favor ingresa tu correo electrónico.";
                CajaError.style.display = "block";
            }
            return;
        }

        if (!Password) {
            if (CajaError) {
                CajaError.textContent = "Por favor ingresa tu contraseña.";
                CajaError.style.display = "block";
            }
            return;
        }

        if (BotonSubmit) {
            BotonSubmit.disabled = true;
            BotonSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando credenciales...';
        }

        try {
            const Resultado = await this.ModeloAlmacenamiento.AutenticarUsuarioEnBaseDatos(Email, Password);

            if (!Resultado.Exito) {
                if (CajaError) {
                    CajaError.textContent = Resultado.Mensaje || "Credenciales incorrectas.";
                    CajaError.style.display = "block";
                }
                if (BotonSubmit) {
                    BotonSubmit.disabled = false;
                    BotonSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket" style="margin-right: 6px;"></i> Iniciar Sesión';
                }
                return;
            }

            // Inicio de sesión exitoso con datos de Firestore
            this.ServicioEstado.IniciarSesion(Resultado.Usuario);
            this.CerrarModales();
            this.ServicioNotificaciones.MostrarMensajeToast(
                `¡Bienvenida/o, ${Resultado.Usuario.NombreCompleto || Resultado.Usuario.Nombre}!`,
                '<i class="fa-solid fa-circle-check"></i>'
            );
        } catch (ErrorAuth) {
            console.error("[ControladorPrincipal] Error al autenticar:", ErrorAuth);
            if (CajaError) {
                CajaError.textContent = "Ocurrió un error al verificar credenciales. Inténtalo de nuevo.";
                CajaError.style.display = "block";
            }
            if (BotonSubmit) {
                BotonSubmit.disabled = false;
                BotonSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket" style="margin-right: 6px;"></i> Iniciar Sesión';
            }
        }
    }

    ProcesarCerrarSesion() {
        this.ServicioEstado.CerrarSesion();
        this.CerrarModales();
        this.ServicioNotificaciones.MostrarMensajeToast(
            "Has cerrado sesión. Continuando como Invitado.",
            '<i class="fa-solid fa-arrow-right-from-bracket"></i>'
        );
    }

    AbrirModalListaReacciones(IdPublicacion) {
        if (!this.ContenedorModales) return;

        const Publicacion = this.ModeloAlmacenamiento.ObtenerPublicacionPorId(IdPublicacion);
        if (!Publicacion) return;

        const Total = Publicacion.CantidadMeGusta || 0;
        const Usuarios = Publicacion.UsuariosReacciones || [];
        const ReaccionesDetalle = Publicacion.ReaccionesDetalle || {};

        const MapaReacciones = window.DiccionarioReaccionesLMP || {
            MeGusta: { TituloCorto: "Me gusta", Icono: '<i class="fa-solid fa-thumbs-up" style="color: #1877f2;"></i>', Color: "#1877f2" },
            MeEncanta: { TituloCorto: "Me encanta", Icono: '<i class="fa-solid fa-heart" style="color: #f3425f;"></i>', Color: "#f3425f" },
            VivaBeni: { TituloCorto: "¡Viva Beni!", Icono: '<i class="fa-solid fa-guitar" style="color: #2e7d32;"></i>', Color: "#2e7d32" },
            Aplausos: { TituloCorto: "Aplausos", Icono: '<i class="fa-solid fa-hands-clapping" style="color: #f7b125;"></i>', Color: "#f7b125" },
            BuenRitmo: { TituloCorto: "Buen ritmo", Icono: '<i class="fa-solid fa-music" style="color: #8b5cf6;"></i>', Color: "#8b5cf6" }
        };

        // Generar pestañas de filtros por tipo de reacción
        let PestanasHtml = `<button class="PestanaFiltroReaccion PestanaActiva" data-filtro="todas">Todas <span style="opacity: 0.85;">${Total}</span></button>`;
        for (const [Tipo, Conf] of Object.entries(MapaReacciones)) {
            const Cant = ReaccionesDetalle[Tipo] || (Usuarios.filter(u => u.TipoReaccion === Tipo).length);
            if (Cant > 0) {
                PestanasHtml += `<button class="PestanaFiltroReaccion" data-filtro="${Tipo}">${Conf.Icono} ${Cant}</button>`;
            }
        }

        let FilasUsuariosHtml = "";
        if (Usuarios.length > 0) {
            FilasUsuariosHtml = Usuarios.map(User => {
                const Conf = MapaReacciones[User.TipoReaccion] || MapaReacciones.MeGusta;
                const IconoReac = Conf ? Conf.Icono : '<i class="fa-solid fa-thumbs-up" style="color: #1877f2;"></i>';
                const NombreReac = Conf ? Conf.TituloCorto : 'Reacción';
                const EsTuUsuario = User.NombreUsuario === "Edna Miriam Edgley Cuellar";

                return `
                <div class="ItemUsuarioReaccion" data-tipo-reaccion="${User.TipoReaccion}">
                    <div class="FilaUsuarioIzquierda">
                        <div class="ContenedorAvatarConInsigniaReaccion">
                            <img src="Logo1.png" alt="${User.NombreUsuario}" class="AvatarUsuarioReaccion" onerror="this.src='Logo1.png'">
                            <span class="MiniInsigniaReaccionUsuario">${IconoReac}</span>
                        </div>
                        <div class="InfoTextoUsuarioReaccion">
                            <span class="NombrePersonaReaccion">
                                ${User.NombreUsuario}
                                ${this.ModeloAlmacenamiento.EsUsuarioVerificado(User.NombreUsuario) ? '<span class="InsigniaVerificada" style="font-size: 11px; margin-left: 4px;" title="Verificado"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                                ${EsTuUsuario ? '<span class="InsigniaTuUsuario">Tú</span>' : ''}
                            </span>
                            <span class="TipoReaccionElegida">${NombreReac}</span>
                        </div>
                    </div>
                </div>`;
            }).join("");

            if (Total > Usuarios.length) {
                const Resto = Total - Usuarios.length;
                FilasUsuariosHtml += `
                <div class="ItemUsuarioReaccion ItemRestoReacciones" data-tipo-reaccion="todas" style="opacity: 0.85; font-size: 13px; color: var(--ColorTextoSecundario); justify-content: center; padding: 12px;">
                    <i class="fa-solid fa-users" style="margin-right: 8px;"></i>
                    <span>Y <strong>${Resto}</strong> ${Resto === 1 ? 'persona más reaccionó' : 'personas más reaccionaron'} en la comunidad</span>
                </div>`;
            }
        } else if (Total > 0) {
            FilasUsuariosHtml = `
            <div class="EstadoVacioReacciones">
                <i class="fa-solid fa-heart" style="font-size: 34px; color: #f3425f; margin-bottom: 6px;"></i>
                <p style="font-size: 15px; font-weight: 600; color: var(--ColorTextoPrincipal); margin: 0;">Esta publicación tiene ${Total} ${Total === 1 ? 'reacción' : 'reacciones'}</p>
                <span style="font-size: 13px;">Registradas por la comunidad en Letras Mi Poblau.</span>
            </div>`;
        } else {
            FilasUsuariosHtml = `
            <div class="EstadoVacioReacciones">
                <i class="fa-regular fa-thumbs-up" style="font-size: 34px; color: var(--ColorTextoSecundario); margin-bottom: 6px;"></i>
                <p style="font-size: 15px; font-weight: 600; color: var(--ColorTextoPrincipal); margin: 0;">Sin reacciones aún</p>
                <span style="font-size: 13px;">¡Sé el primero en reaccionar con tu música y corazón!</span>
            </div>`;
        }

        this.ContenedorModales.innerHTML = `
        <div class="CapaFondoModalOscuro" id="ModalReaccionesFondo">
            <div class="ContenedorVentanaModal VentanaModalReacciones">
                <div class="EncabezadoVentanaModal">
                    <div class="TituloModalTexto" style="display: flex; align-items: center;">
                        <i class="fa-solid fa-heart" style="color: #f3425f; margin-right: 8px;"></i>
                        <span>Personas que reaccionaron</span>
                        <span class="InsigniaConteoModal">${Total}</span>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalReacciones" title="Cerrar ventana">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                ${Total > 0 ? `
                <div class="BarraPestanasReaccionesModal">
                    ${PestanasHtml}
                </div>` : ''}
                <div class="CuerpoVentanaModal CuerpoModalReacciones">
                    <div class="ListaPersonasReacciones" id="ListaUsuariosReaccionesModal">
                        ${FilasUsuariosHtml}
                    </div>
                </div>
            </div>
        </div>`;

        const BotonCerrarReac = document.getElementById("BotonCerrarModalReacciones");
        if (BotonCerrarReac) {
            BotonCerrarReac.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.CerrarModales();
            };
        }

        const FondoModalReac = document.getElementById("ModalReaccionesFondo");
        if (FondoModalReac) {
            FondoModalReac.onclick = (e) => {
                if (e.target === FondoModalReac) {
                    this.CerrarModales();
                }
            };
        }
    }

    AbrirModalConfirmarEliminarPublicacion(IdPublicacion) {
        if (!this.ContenedorModales) return;

        const Publicacion = this.ModeloAlmacenamiento.ObtenerPublicacionPorId(IdPublicacion);
        if (!Publicacion) return;

        const UsuarioActual = this.ServicioEstado ? (this.ServicioEstado.ObtenerUsuarioActual() || this.ServicioEstado.ObtenerEstado("UsuarioActual")) : null;
        const EstaAutenticado = !!(UsuarioActual && !UsuarioActual.EsInvitado && UsuarioActual.Nombre && UsuarioActual.Nombre !== "Usuario");
        const EsAutor = EstaAutenticado && Publicacion.NombreAutor && (
            UsuarioActual.Nombre.trim().toLowerCase() === Publicacion.NombreAutor.trim().toLowerCase() ||
            Publicacion.NombreAutor.trim().toLowerCase().includes(UsuarioActual.Nombre.trim().toLowerCase())
        );
        if (!EsAutor) {
            this.ServicioNotificaciones.MostrarMensajeToast("Solo el autor de la publicación puede eliminarla.", '<i class="fa-solid fa-lock"></i>');
            return;
        }

        let NombreCancion = "";
        let Cancion = null;
        if (Publicacion.IdCancionAsociada) {
            Cancion = this.ModeloAlmacenamiento.ObtenerCancionPorId(Publicacion.IdCancionAsociada);
        }
        if (!Cancion && Publicacion.TextoPublicacion) {
            Cancion = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones().find(C =>
                C.Titulo && Publicacion.TextoPublicacion.toLowerCase().includes(C.Titulo.toLowerCase())
            );
        }
        if (Cancion && Cancion.Titulo) {
            NombreCancion = Cancion.Titulo;
        }

        const MensajeDetalle = NombreCancion
            ? `Se eliminará la publicación y su composición asociada <strong>'${NombreCancion}'</strong> permanentemente de la base de datos de Firestore y de la aplicación.`
            : `Se eliminará esta publicación de forma permanente de la base de datos de Firestore.`;

        this.ContenedorModales.innerHTML = `
        <div class="CapaFondoModalOscuro" id="ModalConfirmarEliminarFondo">
            <div class="ContenedorVentanaModal VentanaModalConfirmarEliminar" id="VentanaModalConfirmarEliminar">
                <div class="IconoAdvertenciaEliminar">
                    <i class="fa-solid fa-trash-can"></i>
                </div>
                <div class="TituloModalEliminar">¿Eliminar publicación?</div>
                <p class="DescripcionModalEliminar">${MensajeDetalle} Esta acción no se puede deshacer.</p>
                <div class="FilaBotonesAccionModal">
                    <button class="BotonAccionSecundario" id="BotonCancelarEliminarModal" style="padding: 10px 20px;">
                        Cancelar
                    </button>
                    <button class="BotonAccionPeligro" id="BotonConfirmarEliminarPublicacion" data-publicacion-id="${IdPublicacion}">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Sí, eliminar definitivamente</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    async ProcesarEliminarPublicacion(IdPublicacion) {
        const BotonConfirmar = document.getElementById("BotonConfirmarEliminarPublicacion");
        const BotonCancelar = document.getElementById("BotonCancelarEliminarModal");

        if (BotonConfirmar) {
            BotonConfirmar.disabled = true;
            BotonConfirmar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando de Firestore...';
        }
        if (BotonCancelar) {
            BotonCancelar.disabled = true;
        }

        const Publicacion = this.ModeloAlmacenamiento.ObtenerPublicacionPorId(IdPublicacion);
        const IdCancion = Publicacion ? Publicacion.IdCancionAsociada : null;

        // Si el reproductor estaba reproduciendo esta canción, detenerlo
        if (IdCancion && this.ServicioReproductor && this.ServicioReproductor.CancionActual) {
            if (String(this.ServicioReproductor.CancionActual.IdCancion) === String(IdCancion)) {
                this.ServicioReproductor.DetenerReproduccion();
                this.CerrarReproductorFlotante();
            }
        }

        // Eliminar en cascada en Firestore y Modelo
        await this.ModeloAlmacenamiento.EliminarPublicacion(IdPublicacion, true);

        this.CerrarModales();
        this.ActualizarVistaCentral();
        this.ServicioNotificaciones.MostrarMensajeToast(
            "Publicación y canción eliminadas correctamente de la base de datos",
            '<i class="fa-solid fa-trash-can"></i>'
        );
    }

    AlternarMenuLateralMovil() {
        const BarraLateral = document.getElementById("ColumnaLateralIzquierda");
        const FondoCapa = document.getElementById("CapaFondoMenuDeslizable");
        if (BarraLateral && FondoCapa) {
            BarraLateral.classList.toggle("MenuDeslizableActivo");
            FondoCapa.classList.toggle("MenuAbierto");
        }
    }

    CerrarMenuLateralMovil() {
        const BarraLateral = document.getElementById("ColumnaLateralIzquierda");
        const FondoCapa = document.getElementById("CapaFondoMenuDeslizable");
        if (BarraLateral && FondoCapa) {
            BarraLateral.classList.remove("MenuDeslizableActivo");
            FondoCapa.classList.remove("MenuAbierto");
        }
    }

    ConfigurarVisualizadorCanvas() {
        setTimeout(() => {
            const Lienzo = document.getElementById("LienzoVisualizadorAudio");
            if (Lienzo) {
                this.ServicioReproductor.DibujarVisualizadorEnLienzo(Lienzo);
            }
        }, 300);
    }

    CerrarReproductorFlotante() {
        this.ServicioReproductor.DetenerReproduccion();
        const BarraReproductor = document.getElementById("BarraReproductorInferiorFlotante");
        if (BarraReproductor) {
            BarraReproductor.classList.remove("ReproductorVisible");
            BarraReproductor.style.transform = "";
            BarraReproductor.style.opacity = "";
            BarraReproductor.style.transition = "";
            document.body.classList.remove("ConReproductorActivo");
        }
        this.ServicioEstado.EstablecerCancionReproduciendo(null, false);
    }

    ConfigurarDeslizamientoReproductorMovil() {
        const BarraReproductor = document.getElementById("BarraReproductorInferiorFlotante");
        if (!BarraReproductor) return;

        let PosicionInicioX = 0;
        let PosicionInicioY = 0;
        let DesplazamientoActualX = 0;
        let EstaDeslizando = false;
        let MovimientoBloqueado = false;
        let EsGestoHorizontal = false;

        const IniciarGesto = (PosicionX, PosicionY, ElementoObjetivo) => {
            // Ignorar si el toque/clic ocurrió sobre botones, deslizador de progreso o controles interactivos
            if (ElementoObjetivo && ElementoObjetivo.closest('button, input, a, .BotonReproducirGrande, .BotonCircularIcono, .DeslizadorProgresoAudio, .DeslizadorVolumenAudio')) {
                MovimientoBloqueado = true;
                return;
            }

            PosicionInicioX = PosicionX;
            PosicionInicioY = PosicionY;
            DesplazamientoActualX = 0;
            EstaDeslizando = true;
            MovimientoBloqueado = false;
            EsGestoHorizontal = false;
            BarraReproductor.style.transition = "none";
        };

        const MoverGesto = (PosicionX, PosicionY, EventoOriginal) => {
            if (!EstaDeslizando || MovimientoBloqueado) return;

            const DeltaX = PosicionX - PosicionInicioX;
            const DeltaY = PosicionY - PosicionInicioY;

            // Determinar si el gesto es horizontal antes de interferir con scroll
            if (!EsGestoHorizontal) {
                if (Math.abs(DeltaX) > 6 || Math.abs(DeltaY) > 6) {
                    if (Math.abs(DeltaX) >= Math.abs(DeltaY)) {
                        EsGestoHorizontal = true;
                    } else {
                        // Scroll vertical de la página, cancelar gesto
                        MovimientoBloqueado = true;
                        BarraReproductor.style.transform = "";
                        BarraReproductor.style.opacity = "";
                        return;
                    }
                } else {
                    return;
                }
            }

            if (EventoOriginal && EventoOriginal.cancelable) {
                EventoOriginal.preventDefault();
            }

            const EstaReproduciendo = this.ServicioReproductor.EstaReproduciendo;

            if (EstaReproduciendo) {
                // Validación: Si está reproduciendo sonido, aplicar resistencia elástica (no descartar)
                const Resistencia = Math.sign(DeltaX) * Math.min(Math.abs(DeltaX) * 0.15, 20);
                DesplazamientoActualX = Resistencia;
                BarraReproductor.style.transform = `translateX(${Resistencia}px)`;
            } else {
                // En pausa: deslizar libremente siguiendo el dedo y reducir opacidad
                DesplazamientoActualX = DeltaX;
                const AnchoBarra = BarraReproductor.offsetWidth || 320;
                const Opacidad = Math.max(0.15, 1 - (Math.abs(DeltaX) / AnchoBarra) * 0.8);
                BarraReproductor.style.transform = `translateX(${DeltaX}px)`;
                BarraReproductor.style.opacity = Opacidad.toString();
            }
        };

        const FinalizarGesto = () => {
            if (!EstaDeslizando) return;
            EstaDeslizando = false;

            const EstaReproduciendo = this.ServicioReproductor.EstaReproduciendo;
            const DeltaX = DesplazamientoActualX;
            const UmbralDescarte = 50; // Píxeles requeridos para descartar

            if (EstaReproduciendo) {
                // Si estaba reproduciendo sonido, rebotar elásticamente al centro y notificar
                BarraReproductor.style.transition = "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                BarraReproductor.style.transform = "translateX(0)";
                BarraReproductor.style.opacity = "1";

                if (Math.abs(DeltaX) > 8) {
                    this.ServicioNotificaciones.MostrarMensajeToast(
                        "Pausa la música para poder descartar el reproductor",
                        '<i class="fa-solid fa-circle-pause"></i>'
                    );
                }
                setTimeout(() => {
                    BarraReproductor.style.transition = "";
                }, 260);
            } else {
                // Si está en pausa
                if (Math.abs(DeltaX) >= UmbralDescarte) {
                    // Descartar suavemente hacia el lado del deslizamiento
                    const Direccion = DeltaX > 0 ? 1 : -1;
                    BarraReproductor.style.transition = "transform 0.25s ease-out, opacity 0.25s ease-out";
                    BarraReproductor.style.transform = `translateX(${Direccion * 115}%)`;
                    BarraReproductor.style.opacity = "0";

                    setTimeout(() => {
                        this.CerrarReproductorFlotante();
                    }, 250);
                } else {
                    // No alcanzó el umbral, retornar al centro
                    BarraReproductor.style.transition = "transform 0.2s ease-out, opacity 0.2s ease-out";
                    BarraReproductor.style.transform = "translateX(0)";
                    BarraReproductor.style.opacity = "1";
                    setTimeout(() => {
                        BarraReproductor.style.transition = "";
                    }, 210);
                }
            }

            DesplazamientoActualX = 0;
            MovimientoBloqueado = false;
            EsGestoHorizontal = false;
        };

        // Soporte de eventos táctiles (Smartphones y Tablets)
        BarraReproductor.addEventListener("touchstart", (e) => {
            if (e.touches && e.touches.length === 1) {
                IniciarGesto(e.touches[0].clientX, e.touches[0].clientY, e.target);
            }
        }, { passive: false });

        BarraReproductor.addEventListener("touchmove", (e) => {
            if (e.touches && e.touches.length === 1) {
                MoverGesto(e.touches[0].clientX, e.touches[0].clientY, e);
            }
        }, { passive: false });

        BarraReproductor.addEventListener("touchend", () => {
            FinalizarGesto();
        });

        BarraReproductor.addEventListener("touchcancel", () => {
            FinalizarGesto();
        });
    }
}

window.ControladorPrincipal = ControladorPrincipal;
