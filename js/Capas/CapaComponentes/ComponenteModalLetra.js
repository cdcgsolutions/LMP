/* ==========================================================================
   COMPONENTE: MODAL VISOR DE LETRA Y TRANSPOSITOR TONAL (ESTUDIO PROFESIONAL)
   Letras de Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalLetra {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.CancionSeleccionada = null;
        this.MostrarAcordes = true;
        this.DesplazamientoSemitonos = 0;
        this.IntervaloKaraoke = null;
        this.EstaDesplazandoAuto = false;

        this.EscalaNotas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    }

    TransponerTextoConAcordes(TextoConAcordes, Semitonos) {
        if (Semitonos === 0) return TextoConAcordes;

        return TextoConAcordes.replace(/\[([^\]]+)\]/g, (Coincidencia, AcordeOriginal) => {
            const CoincidenciaNota = AcordeOriginal.match(/^([A-G][#b]?)(.*)$/);
            if (!CoincidenciaNota) return `[${AcordeOriginal}]`;

            let NotaBase = CoincidenciaNota[1];
            const Sufijo = CoincidenciaNota[2] || "";

            // Convertir bemoles a sostenidos equivalentes
            if (NotaBase === "Db") NotaBase = "C#";
            if (NotaBase === "Eb") NotaBase = "D#";
            if (NotaBase === "Gb") NotaBase = "F#";
            if (NotaBase === "Ab") NotaBase = "G#";
            if (NotaBase === "Bb") NotaBase = "A#";

            const IndiceActual = this.EscalaNotas.indexOf(NotaBase);
            if (IndiceActual === -1) return `[${AcordeOriginal}]`;

            let NuevoIndice = (IndiceActual + Semitonos) % 12;
            if (NuevoIndice < 0) NuevoIndice += 12;

            const NuevaNota = this.EscalaNotas[NuevoIndice];
            return `[${NuevaNota}${Sufijo}]`;
        });
    }

    Renderizar(IdCancion) {
        this.CancionSeleccionada = this.ModeloAlmacenamiento.ObtenerCancionPorId(IdCancion);
        if (!this.CancionSeleccionada) return "";

        let LetraProcesada = this.CancionSeleccionada.LetraConAcordes || this.CancionSeleccionada.LetraLimpia || "";
        if (this.DesplazamientoSemitonos !== 0) {
            LetraProcesada = this.TransponerTextoConAcordes(LetraProcesada, this.DesplazamientoSemitonos);
        }

        let LetraFinalHtml = "";
        if (this.MostrarAcordes) {
            LetraFinalHtml = LetraProcesada.replace(/\[([^\]]+)\]/g, '<span class="AcordeMusical">$1</span>');
        } else {
            LetraFinalHtml = LetraProcesada.replace(/\[([^\]]+)\]/g, '');
        }

        const DespTexto = this.DesplazamientoSemitonos === 0 
            ? "Tono Original" 
            : (this.DesplazamientoSemitonos > 0 ? `+${this.DesplazamientoSemitonos} st` : `${this.DesplazamientoSemitonos} st`);

        return `
        <div class="CapaFondoModalOscuro" id="ModalVisorLetraFondo">
            <div class="ContenedorVentanaModal" id="ContenedorVentanaModalLetra" style="max-width: 860px;">
                <!-- 1. Encabezado del Modal con Identidad de Obra -->
                <div class="EncabezadoVentanaModal">
                    <div>
                        <div class="TituloModalTexto">
                            <i class="fa-solid fa-scroll" style="color: var(--ColorVerdeBeni);"></i>
                            <span>${this.CancionSeleccionada.Titulo}</span>
                        </div>
                        <div style="font-size: 13px; color: var(--ColorTextoSecundario); margin-top: 3px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <span>${this.CancionSeleccionada.Autor}</span>
                            <span>•</span>
                            <span class="InsigniaGeneroMusical" style="padding: 2px 8px; font-size: 11px;">${this.CancionSeleccionada.Genero}</span>
                            <span>•</span>
                            <span class="InsigniaTonoMusical" style="padding: 2px 8px; font-size: 11px;">${this.CancionSeleccionada.TonoOriginal}</span>
                        </div>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalLetra" title="Cerrar ventana"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- 2. Barra de Herramientas de Transposición y Ejecución -->
                <div class="BarraControlesLetraModal" style="margin: 0; border-radius: 0; border-left: none; border-right: none;">
                    <!-- Transpositor Tonal -->
                    <div class="GrupoTranspositorTonal">
                        <span style="font-size: 12px; font-weight: 700; color: var(--ColorTextoSecundario); text-transform: uppercase; letter-spacing: 0.04em;">Transponer:</span>
                        <button class="BotonSemitono" id="BotonBajarSemitono" title="Bajar 1 semitono (-1 st)">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="BadgeTonoActual" id="EtiquetaTonoActual">${DespTexto}</span>
                        <button class="BotonSemitono" id="BotonSubirSemitono" title="Subir 1 semitono (+1 st)">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    <!-- Controles de Visualización y Auto-Scroll -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="BotonAccionSecundario" id="BotonAlternarAcordes" style="padding: 6px 12px; font-size: 12.5px;" title="Alternar visibilidad de acordes">
                            ${this.MostrarAcordes ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-guitar"></i>'}
                            <span>${this.MostrarAcordes ? 'Ocultar Acordes' : 'Mostrar Acordes'}</span>
                        </button>
                        <button class="BotonAccionSecundario" id="BotonAutoScrollKaraoke" style="padding: 6px 12px; font-size: 12.5px;" title="Desplazamiento automático para acompañamiento">
                            ${this.EstaDesplazandoAuto ? '<i class="fa-solid fa-circle-pause" style="color: #ef4444;"></i>' : '<i class="fa-solid fa-circle-play" style="color: var(--ColorVerdeBeni);"></i>'}
                            <span>${this.EstaDesplazandoAuto ? 'Pausar Scroll' : 'Auto-Scroll'}</span>
                        </button>
                    </div>
                </div>

                <!-- 3. Contenedor de la Letra y Acordes -->
                <div class="CuerpoVentanaModal" id="CuerpoLetraScrollable" style="padding: 20px 24px;">
                    <div class="ContenedorLetraConAcordes" id="TextoLetraPreformateada">${LetraFinalHtml}</div>
                </div>

                <!-- 4. Pie de Modal con Acciones -->
                <div style="padding: 14px 24px; border-top: 1px solid var(--ColorBordeDivisor); display: flex; justify-content: space-between; align-items: center; background-color: var(--ColorFondoSuperficie); gap: 10px; flex-wrap: wrap;">
                    <button class="BotonAccionSecundario" id="BotonCopiarLetraPortapapeles">
                        <i class="fa-solid fa-copy"></i>
                        <span>Copiar al Portapapeles</span>
                    </button>
                    <div style="display: flex; gap: 8px;">
                        ${(this.CancionSeleccionada.ImagenPartituraUrl && this.CancionSeleccionada.ImagenPartituraUrl !== 'IFAEL.jpg') ? `
                        <button class="BotonAccionSecundario BotonAbrirModalPartitura" data-cancion-id="${this.CancionSeleccionada.IdCancion}">
                            <i class="fa-solid fa-file-lines" style="color: var(--ColorVerdeBeni);"></i>
                            <span>Ver Partitura</span>
                        </button>
                        ` : ''}
                        <button class="BotonAccionPrimario BotonReproducirTarjeta" data-cancion-id="${this.CancionSeleccionada.IdCancion}">
                            <i class="fa-solid fa-play"></i>
                            <span>Escuchar Audio</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalLetra = ComponenteModalLetra;
