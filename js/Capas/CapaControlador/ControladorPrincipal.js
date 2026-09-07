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
            this.ServicioReproductor.DetenerReproduccion();
            const BarraReproductor = document.getElementById("BarraReproductorInferiorFlotante");
            if (BarraReproductor) {
                BarraReproductor.classList.remove("ReproductorVisible");
                document.body.classList.remove("ConReproductorActivo");
            }
            this.ServicioEstado.EstablecerCancionReproduciendo(null, false);
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
            this.RegistrarReaccion(IdPublicacion, "MeGusta");
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
            Objetivo.closest("#BotonRapidoPartitura") ||
            Objetivo.closest("#BotonRapidoRitmo") ||
            Objetivo.closest("#TarjetaCrearHistoriaBoton") ||
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

        // Historia click -> reproducir canción asociada
        const TarjetaHistoriaCancion = Objetivo.closest(".TarjetaHistoria[data-cancion-id]");
        if (TarjetaHistoriaCancion) {
            const IdCancion = TarjetaHistoriaCancion.dataset.cancionId;
            this.EjecutarReproduccionCancionPorId(IdCancion);
            this.AbrirModalLetra(IdCancion);
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
            const Contador = document.getElementById(`ContadorLikes_${IdPublicacion}`);
            if (Contador) Contador.textContent = PublicacionActualizada.CantidadMeGusta;

            const NombresReacciones = {
                MeGusta: 'Me Gusta',
                MeEncanta: 'Me Encanta',
                VivaBeni: '¡Viva el Beni!',
                Aplausos: 'Aplausos',
                BuenRitmo: 'Buen Ritmo'
            };
            this.ServicioNotificaciones.MostrarMensajeToast(
                `Reaccionaste con ${NombresReacciones[TipoReaccion] || TipoReaccion}`,
                '<i class="fa-solid fa-thumbs-up"></i>'
            );
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
}

window.ControladorPrincipal = ControladorPrincipal;
