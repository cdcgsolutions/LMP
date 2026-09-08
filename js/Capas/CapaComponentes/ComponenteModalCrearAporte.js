/* ==========================================================================
   COMPONENTE: MODAL PARA CREAR NUEVO APORTE / CANCIÓN
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalCrearAporte {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar(DatosEdicion = null) {
        const EsEdicion = Boolean(DatosEdicion);

        const UsuarioActual = this.ServicioEstado ? this.ServicioEstado.ObtenerUsuarioActual() : null;

        const TituloCancion = EsEdicion ? (DatosEdicion.Titulo || "") : "";
        const AutorCancion = EsEdicion ? (DatosEdicion.Autor || "") : "";
        const GenerosEnBD = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosGeneros()) || [];
        const GenerosNombres = GenerosEnBD.map(G => G.Nombre || G);
        const GeneroCancion = EsEdicion ? (DatosEdicion.Genero || (GenerosNombres[0] || "")) : (GenerosNombres[0] || "");
        const TonoCancion = EsEdicion ? (DatosEdicion.TonoOriginal || "") : "";
        const TempoCancion = EsEdicion ? (Number(DatosEdicion.TempoBPM) || 108) : 108;
        const LetraCancion = EsEdicion ? (DatosEdicion.LetraConAcordes || DatosEdicion.LetraLimpia || "") : "";
        const MensajeMuro = EsEdicion ? (DatosEdicion.TextoPublicacion || "") : "";
        const AudioActual = EsEdicion ? (DatosEdicion.AudioUrl || "") : "";
        const PartituraActual = EsEdicion ? (DatosEdicion.ImagenPartitura || "") : "";

        const SelectGenerosHtml = GenerosNombres.length > 0 
            ? GenerosNombres.map(Gen => `<option value="${Gen}" ${Gen === GeneroCancion ? 'selected' : ''}>${Gen}</option>`).join("")
            : `<option value="">Sin géneros en BD</option>`;

        return `
        <div class="CapaFondoModalOscuro" id="ModalCrearAporteFondo">
            <div class="ContenedorVentanaModal" id="ContenedorVentanaModalCrear">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div class="TituloModalTexto">
                        <i class="fa-solid ${EsEdicion ? 'fa-pen-to-square' : 'fa-pen-nib'}" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>
                        ${EsEdicion ? 'Editar Publicación y Composición' : 'Aportar Nueva Letra o Canción'}
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalCrear" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Formulario de Aporte -->
                <div class="CuerpoVentanaModal">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-weight: 700; font-size: 13px;">Título de la Canción / Letra *</label>
                        <input type="text" id="CampoNuevoTitulo" placeholder="Ej: Trinidad del Alma" value="${this.EscaparHtml(TituloCancion)}" required>
                    </div>

                    <div class="CuadriculaFormularioDoble">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Autor / Compositor de la Canción *</label>
                            <input type="text" id="CampoNuevoAutor" placeholder="Ej: Rafael Seghers, Gilberto Rojas..." value="${this.EscaparHtml(AutorCancion)}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Ritmo o Género *</label>
                            <select id="CampoNuevoGenero">
                                ${SelectGenerosHtml}
                            </select>
                        </div>
                    </div>

                    <div class="CuadriculaFormularioDoble">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Tono Sugerido</label>
                            <input type="text" id="CampoNuevoTono" placeholder="Ej: Re Mayor (D)" value="${this.EscaparHtml(TonoCancion)}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Tempo (BPM)</label>
                            <input type="number" id="CampoNuevoTempo" placeholder="108" value="${TempoCancion}">
                        </div>
                    </div>

                    <!-- Subida Multimedia a Cloudinary con Drag & Drop y Vista Previa -->
                    <div class="CuadriculaFormularioDoble">
                        <!-- 1. Campo y Zona de Audio -->
                        <div class="CampoFormularioMultimedia">
                            <label class="EtiquetaFormularioMultimedia">
                                <i class="fa-solid fa-file-audio" style="color: var(--ColorPrimarioAzul);"></i>
                                Audio Demostrativo (MP3 / WAV)
                            </label>
                            <div class="ZonaSubidaArchivo" id="ZonaSoltarAudio">
                                <input type="file" id="CampoNuevoArchivoAudio" accept="audio/*" class="InputArchivoOculto">
                                
                                <div class="VistaPreviaArchivoCargado" id="VistaPreviaAudioCargado" style="${AudioActual ? 'display: flex;' : 'display: none;'}">
                                    <div class="FilaEncabezadoVistaPrevia">
                                        <div class="IconoYDatosArchivo">
                                            <div class="IconoArchivoCargado">
                                                <i class="fa-solid fa-music"></i>
                                            </div>
                                            <div class="DetallesArchivoCargado">
                                                <div class="NombreArchivoCargado" id="EtiquetaNombreAudio" title="${EsEdicion && AudioActual ? 'Audio cargado en Cloudinary' : 'Audio seleccionado'}">
                                                    ${EsEdicion && AudioActual ? 'Audio en Cloudinary' : 'Audio seleccionado'}
                                                </div>
                                                <span class="EstadoArchivoTexto" id="EtiquetaEstadoAudio">
                                                    <i class="fa-solid fa-circle-check"></i> ${AudioActual ? 'Listo para escuchar' : 'Listo para guardar'}
                                                </span>
                                            </div>
                                        </div>
                                        <button type="button" class="BotonCambiarArchivo" id="BotonCambiarAudio" title="Seleccionar otro audio">
                                            <i class="fa-solid fa-arrows-rotate"></i> Cambiar
                                        </button>
                                    </div>

                                    <!-- Reproductor de Muestra Personalizado (100% responsivo y sin desbordes) -->
                                    <div class="ReproductorMuestraModal" id="ContenedorReproductorMuestra" style="${AudioActual ? 'display: flex;' : 'display: none;'}">
                                        <button type="button" class="BotonReproducirMuestraAudio" id="BotonPlayMuestraAudio" title="Reproducir audio de muestra">
                                            <i class="fa-solid fa-play" id="IconoPlayMuestraAudio"></i>
                                        </button>
                                        <div class="PistaProgresoMuestra">
                                            <div class="BarraProgresoMuestraContenedor" id="BarraProgresoMuestraClickeable" title="Avanzar / retroceder">
                                                <div class="BarraProgresoMuestraRelleno" id="ProgresoMuestraAudio"></div>
                                            </div>
                                            <div class="FilaTiempoAudioMuestra">
                                                <span id="TiempoActualMuestraAudio">0:00</span>
                                                <span id="TiempoTotalMuestraAudio">--:--</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="EstadoVacioSubida" id="EstadoVacioAudio" style="${AudioActual ? 'display: none;' : 'display: flex;'}">
                                    <i class="fa-solid fa-cloud-arrow-up IconoNubeSubida"></i>
                                    <span class="TextoPrincipalSubida">Arrastra tu audio o <strong>examina</strong></span>
                                    <span class="TextoSecundarioSubida">Soporta MP3, WAV, M4A</span>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Campo y Zona de Partitura -->
                        <div class="CampoFormularioMultimedia">
                            <label class="EtiquetaFormularioMultimedia">
                                <i class="fa-solid fa-file-lines" style="color: var(--ColorVerdeBeni);"></i>
                                Partitura o Manuscrito (JPG/PNG/PDF)
                            </label>
                            <div class="ZonaSubidaArchivo" id="ZonaSoltarPartitura">
                                <input type="file" id="CampoNuevoArchivoPartitura" accept="image/*,application/pdf" class="InputArchivoOculto">
                                
                                <div class="VistaPreviaArchivoCargado" id="VistaPreviaPartituraCargada" style="${PartituraActual && PartituraActual !== 'IFAEL.jpg' ? 'display: flex;' : 'display: none;'}">
                                    <div class="FilaEncabezadoVistaPrevia">
                                        <div class="IconoYDatosArchivo">
                                            <div class="MiniaturaPartituraPrevia">
                                                <img src="${PartituraActual || 'IFAEL.jpg'}" alt="Partitura" id="ImgMiniaturaPartitura" onerror="this.src='IFAEL.jpg'">
                                            </div>
                                            <div class="DetallesArchivoCargado">
                                                <div class="NombreArchivoCargado" id="EtiquetaNombrePartitura" title="${EsEdicion && PartituraActual && PartituraActual !== 'IFAEL.jpg' ? 'Partitura cargada en Cloudinary' : 'Partitura seleccionada'}">
                                                    ${EsEdicion && PartituraActual && PartituraActual !== 'IFAEL.jpg' ? 'Partitura en Cloudinary' : 'Partitura seleccionada'}
                                                </div>
                                                <span class="EstadoArchivoTexto" id="EtiquetaEstadoPartitura">
                                                    <i class="fa-solid fa-circle-check"></i> ${PartituraActual && PartituraActual !== 'IFAEL.jpg' ? 'Registrada en la canción' : 'Lista para guardar'}
                                                </span>
                                            </div>
                                        </div>
                                        <button type="button" class="BotonCambiarArchivo" id="BotonCambiarPartitura" title="Seleccionar otra partitura">
                                            <i class="fa-solid fa-arrows-rotate"></i> Cambiar
                                        </button>
                                    </div>
                                </div>

                                <div class="EstadoVacioSubida" id="EstadoVacioPartitura" style="${PartituraActual && PartituraActual !== 'IFAEL.jpg' ? 'display: none;' : 'display: flex;'}">
                                    <i class="fa-solid fa-file-image IconoNubeSubida" style="color: var(--ColorVerdeBeni);"></i>
                                    <span class="TextoPrincipalSubida">Arrastra tu partitura o <strong>examina</strong></span>
                                    <span class="TextoSecundarioSubida">Soporta PNG, JPG, PDF</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-weight: 700; font-size: 13px;">Letra con Acordes entre Corchetes [ ] *</label>
                        <textarea 
                            id="CampoNuevaLetra" 
                            rows="6" 
                            style="font-family: var(--FuenteMusical); font-size: 13.5px;" 
                            placeholder="[D]Viva el Beni tierra hermosa...&#10;[G]Con tus pampas de primor..."
                            required
                        >${this.EscaparHtml(LetraCancion)}</textarea>
                        <span style="font-size: 11px; color: var(--ColorTextoSecundario);">
                            <i class="fa-solid fa-lightbulb" style="color: #f59e0b; margin-right: 3px;"></i>Tip: Pon los acordes entre corchetes, por ejemplo <strong>[D]</strong> o <strong>[Am]</strong> antes de la sílaba.
                        </span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-weight: 700; font-size: 13px;">Mensaje para la publicación en Inicio</label>
                        <input type="text" id="CampoNuevoMensajeMuro" placeholder="¡Comparto esta hermosa composición con el IFAEL!" value="${this.EscaparHtml(MensajeMuro)}">
                    </div>

                    <!-- Indicador de Subida a Cloudinary -->
                    <div id="IndicadorSubidaCloudinary" style="display: none; padding: 10px; border-radius: var(--RadioPequeno); background: rgba(24, 119, 242, 0.1); border: 1px solid var(--ColorPrimarioAzul); font-size: 12.5px; text-align: center; color: var(--ColorPrimarioAzul); font-weight: 600;">
                        <i class="fa-solid fa-cloud-arrow-up fa-bounce" style="margin-right: 6px;"></i> Subiendo multimedia a Cloudinary...
                    </div>
                </div>

                <!-- Pie de Modal -->
                <div class="PieVentanaModal">
                    <button class="BotonAccionSecundario" id="BotonCancelarCrearAporte">
                        Cancelar
                    </button>
                    <button class="BotonAccionPrimario" id="BotonGuardarPublicarNuevoAporte">
                        <i class="fa-solid ${EsEdicion ? 'fa-floppy-disk' : 'fa-paper-plane'}"></i>
                        <span class="TextoBotonLargo">${EsEdicion ? 'Guardar Cambios' : 'Publicar en Letras Mi Poblau'}</span>
                        <span class="TextoBotonCorto">${EsEdicion ? 'Guardar' : 'Publicar'}</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    EscaparHtml(Texto) {
        if (!Texto) return "";
        return String(Texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

window.ComponenteModalCrearAporte = ComponenteModalCrearAporte;
