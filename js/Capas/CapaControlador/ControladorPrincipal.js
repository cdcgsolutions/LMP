/* ==========================================================================
   CAPA DE CONTROLADOR: CONTROLADOR PRINCIPAL Y DESPACHADOR DE EVENTOS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ControladorPrincipal {
    constructor(
        InstanciaServicioEstado,
        InstanciaModeloAlmacenamiento,
        InstanciaServicioReproductor,
        InstanciaServicioNotificaciones
    ) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ServicioReproductor = InstanciaServicioReproductor;
        this.ServicioNotificaciones = InstanciaServicioNotificaciones;

        // Instancias de Componentes
        this.ComponenteEncabezado = new ComponenteEncabezado(this.ServicioEstado);
        this.ComponenteBarraLateralIzquierda = new ComponenteBarraLateralIzquierda(this.ServicioEstado);
        this.ComponenteBarraLateralDerecha = new ComponenteBarraLateralDerecha(this.ServicioEstado);
        this.ComponenteMuroPrincipal = new ComponenteMuroPrincipal(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionCanciones = new ComponenteSeccionCanciones(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionGeneros = new ComponenteSeccionGeneros(this.ServicioEstado);
        this.ComponenteSeccionArtistas = new ComponenteSeccionArtistas(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteSeccionIFAEL = new ComponenteSeccionIFAEL(this.ServicioEstado);
        this.ComponenteModalLetra = new ComponenteModalLetra(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteModalPartitura = new ComponenteModalPartitura(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteModalCrearAporte = new ComponenteModalCrearAporte(this.ServicioEstado, this.ModeloAlmacenamiento);
        this.ComponenteBarraNavegacionMovil = new ComponenteBarraNavegacionMovil(this.ServicioEstado);
        this.ComponenteReproductorFlotante = new ComponenteReproductorFlotante(this.ServicioEstado, this.ServicioReproductor);

        this.ContenedorRaizApp = null;
        this.ContenedorModales = null;
    }

    Inicializar() {
        this.ContenedorRaizApp = document.getElementById("AppRaiz");
        this.ContenedorModales = document.getElementById("ContenedorModalesDinamicos");

        // Cargar estado inicial de tema oscuro
        const EsTemaOscuroGuardado = this.ModeloAlmacenamiento.ObtenerEstadoTemaOscuro();
        if (EsTemaOscuroGuardado) {
            document.body.classList.add("ModoOscuroActivo");
            this.ServicioEstado.AlternarModoOscuro(true);
        }

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

        // 7. Reacciones Estilo Facebook
        const BotonEmoji = Objetivo.closest(".BotonReaccionEmoji");
        if (BotonEmoji) {
            const IdPublicacion = BotonEmoji.dataset.publicacionId;
            const TipoReaccion = BotonEmoji.dataset.tipoReaccion;
            this.RegistrarReaccion(IdPublicacion, TipoReaccion);
            return;
        }

        const BotonReaccionRapida = Objetivo.closest(".BotonDisparadorReaccionRapida");
        if (BotonReaccionRapida) {
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

        // 8. Enviar Comentario
        const BotonEnviarComentario = Objetivo.closest(".BotonEnviarComentario");
        if (BotonEnviarComentario) {
            const IdPublicacion = BotonEnviarComentario.dataset.publicacionId;
            this.AgregarComentarioDesdeEntrada(IdPublicacion);
            return;
        }

        // 9. Enfocar Entrada de Comentario
        const BotonEnfocarComentario = Objetivo.closest(".BotonEnfocarComentario");
        if (BotonEnfocarComentario) {
            const IdPublicacion = BotonEnfocarComentario.dataset.publicacionId;
            const Entrada = document.getElementById(`EntradaComentario_${IdPublicacion}`);
            if (Entrada) Entrada.focus();
            return;
        }

        // 10. Compartir Publicación
        const BotonCompartir = Objetivo.closest(".BotonCompartirPublicacion");
        if (BotonCompartir) {
            this.ServicioNotificaciones.MostrarMensajeToast("¡Enlace de publicación copiado para compartir!", '<i class="fa-solid fa-share-nodes"></i>');
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

        // 14. Abrir Modal Crear Aporte / Canción
        if (
            Objetivo.closest("#BotonCrearNuevoAporte") || 
            Objetivo.closest("#BotonAbrirModalCrearPublicacion") ||
            Objetivo.closest("#BotonRapidoLetraAcordes") ||
            Objetivo.closest("#BotonAportarNuevaCancionEnSeccion") ||
            (Objetivo.closest("[data-accion='crear-aporte']"))
        ) {
            this.AbrirModalCrearAporte();
            return;
        }
        if (Objetivo.closest("#BotonCerrarModalCrear") || Objetivo.closest("#BotonCancelarCrearAporte") || Objetivo.closest("#ModalCrearAporteFondo") === Objetivo) {
            this.CerrarModales();
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
        const PublicacionActualizada = this.ModeloAlmacenamiento.RegistrarReaccionEnPublicacion(IdPublicacion, TipoReaccion);
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
        const Entrada = document.getElementById(`EntradaComentario_${IdPublicacion}`);
        if (!Entrada || !Entrada.value.trim()) return;

        const Texto = Entrada.value.trim();
        const ObjetoComentario = {
            NombreUsuario: "Edna Miriam Edgley Cuellar",
            AvatarUsuario: "Logo1.png",
            TextoComentario: Texto
        };

        const PublicacionActualizada = this.ModeloAlmacenamiento.AgregarComentarioAPublicacion(IdPublicacion, ObjetoComentario);
        if (PublicacionActualizada) {
            Entrada.value = "";
            const ListaContenedor = document.getElementById(`ListaComentarios_${IdPublicacion}`);
            if (ListaContenedor) {
                const NuevoHtml = `
                    <div class="ElementoComentarioIndividual" style="animation: AnimacionAparecerSuave 0.2s ease;">
                        <img src="${ObjetoComentario.AvatarUsuario}" alt="${ObjetoComentario.NombreUsuario}" class="AvatarComentarista">
                        <div class="BurbujaComentarioTexto">
                            <div class="NombreComentarista">${ObjetoComentario.NombreUsuario}</div>
                            <div class="CuerpoComentario">${ObjetoComentario.TextoComentario}</div>
                            <div class="MetaComentarioTiempo">Hace un momento</div>
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
        this.ContenedorModales.innerHTML = this.ComponenteModalCrearAporte.Renderizar();
    }

    ProcesarGuardarNuevoAporte() {
        const Titulo = document.getElementById("CampoNuevoTitulo")?.value.trim();
        const Autor = document.getElementById("CampoNuevoAutor")?.value.trim() || "Compositor Anónimo";
        const Genero = document.getElementById("CampoNuevoGenero")?.value || "Taquirari";
        const Tono = document.getElementById("CampoNuevoTono")?.value.trim() || "Re Mayor (D)";
        const Tempo = Number(document.getElementById("CampoNuevoTempo")?.value) || 108;
        const Letra = document.getElementById("CampoNuevaLetra")?.value.trim();
        const MensajeMuro = document.getElementById("CampoNuevoMensajeMuro")?.value.trim() || `¡Nueva letra y acordes registrados para '${Titulo}'!`;

        if (!Titulo || !Letra) {
            alert("Por favor ingresa al menos el Título y la Letra de la canción.");
            return;
        }

        // Crear Canción
        const LetraLimpia = Letra.replace(/\[([^\]]+)\]/g, '');
        const NuevaCancion = this.ModeloAlmacenamiento.GuardarCancionNueva({
            Titulo: Titulo,
            Autor: Autor,
            Genero: Genero,
            TonoOriginal: Tono,
            TempoBPM: Tempo,
            EsEstudianteIFAEL: true,
            Descripcion: `Composición beniana registrada en Letras Mi Poblau en ritmo de ${Genero}.`,
            Caratula: "Logo1.png",
            ImagenPartitura: "IFAEL.jpg",
            LetraConAcordes: Letra,
            LetraLimpia: LetraLimpia,
            SecuenciaNotasMelodia: [
                { Nota: "D4", Duracion: 0.4 }, { Nota: "G4", Duracion: 0.4 }, { Nota: "A4", Duracion: 0.6 }
            ]
        });

        // Crear Publicación en Feed
        this.ModeloAlmacenamiento.GuardarPublicacionNueva({
            NombreAutor: Autor,
            AvatarAutor: "Logo1.png",
            EsVerificado: true,
            TextoPublicacion: MensajeMuro,
            IdCancionAsociada: NuevaCancion.IdCancion
        });

        this.CerrarModales();
        this.ServicioEstado.EstablecerPestanaActiva("muro");
        this.ActualizarVistaCentral();
        this.ServicioNotificaciones.MostrarMensajeToast(`¡'${Titulo}' publicado con éxito en Letras Mi Poblau!`, '<i class="fa-solid fa-circle-check"></i>');
    }

    CerrarModales() {
        if (this.ComponenteModalLetra.IntervaloKaraoke) {
            clearInterval(this.ComponenteModalLetra.IntervaloKaraoke);
        }
        if (this.ContenedorModales) {
            this.ContenedorModales.innerHTML = "";
        }
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
