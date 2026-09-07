/* ==========================================================================
   COMPONENTE: MODAL VISOR DE LETRA Y TRANSPOSITOR
   Nombres en PascalCase - Letras Mi Poblau (LMP)
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

        let LetraProcesada = this.CancionSeleccionada.LetraConAcordes;
        if (this.DesplazamientoSemitonos !== 0) {
            LetraProcesada = this.TransponerTextoConAcordes(LetraProcesada, this.DesplazamientoSemitonos);
        }

        let LetraFinalHtml = "";
        if (this.MostrarAcordes) {
            LetraFinalHtml = LetraProcesada.replace(/\[([^\]]+)\]/g, '<span class="AcordeMusical">$1</span>');
        } else {
            LetraFinalHtml = LetraProcesada.replace(/\[([^\]]+)\]/g, '');
        }

        return `
        <div class="CapaFondoModalOscuro" id="ModalVisorLetraFondo">
            <div class="ContenedorVentanaModal ModalAnchoExtraGrande" id="ContenedorVentanaModalLetra">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div>
                        <div class="TituloModalTexto"><i class="fa-solid fa-scroll" style="color: var(--ColorPrimarioAzul); margin-right: 8px;"></i>${this.CancionSeleccionada.Titulo}</div>
                        <div style="font-size: 13px; color: var(--ColorTextoSecundario); margin-top: 2px;">
                            ${this.CancionSeleccionada.Autor} • ${this.CancionSeleccionada.Genero}
                        </div>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalLetra" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Barra de Herramientas de Músico -->
                <div style="background-color: var(--ColorFondoSecundario); padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--ColorBordeDivisor);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 13px; font-weight: 700;">Tono:</span>
                        <button class="BotonAccionSecundario" id="BotonBajarSemitono" style="padding: 4px 8px; font-size: 12px;" title="Bajar semitono"><i class="fa-solid fa-minus" style="margin-right: 4px;"></i>1 Semitono</button>
                        <span style="font-size: 13px; font-weight: 800; color: var(--ColorPrimarioAzul);" id="EtiquetaTonoActual">
                            ${this.DesplazamientoSemitonos >= 0 ? `+${this.DesplazamientoSemitonos}` : this.DesplazamientoSemitonos} st
                        </span>
                        <button class="BotonAccionSecundario" id="BotonSubirSemitono" style="padding: 4px 8px; font-size: 12px;" title="Subir semitono"><i class="fa-solid fa-plus" style="margin-right: 4px;"></i>1 Semitono</button>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="BotonAccionSecundario" id="BotonAlternarAcordes" style="padding: 6px 12px; font-size: 12.5px;">
                            ${this.MostrarAcordes ? '<i class="fa-solid fa-eye-slash" style="margin-right: 6px;"></i>Ocultar Acordes' : '<i class="fa-solid fa-guitar" style="margin-right: 6px;"></i>Mostrar Acordes'}
                        </button>
                        <button class="BotonAccionSecundario" id="BotonAutoScrollKaraoke" style="padding: 6px 12px; font-size: 12.5px;">
                            ${this.EstaDesplazandoAuto ? '<i class="fa-solid fa-stop" style="margin-right: 6px;"></i>Detener Scroll' : '<i class="fa-solid fa-arrow-down" style="margin-right: 6px;"></i>Auto-Scroll'}
                        </button>
                    </div>
                </div>

                <!-- Cuerpo de la Letra -->
                <div class="CuerpoVentanaModal" id="CuerpoLetraScrollable" style="max-height: 480px; overflow-y: auto;">
                    <pre style="font-family: var(--FuenteMusical); font-size: 14.5px; line-height: 1.8; white-space: pre-wrap; color: var(--ColorTextoPrincipal);" id="TextoLetraPreformateada">${LetraFinalHtml}</pre>
                </div>

                <!-- Pie de Modal con Acciones -->
                <div class="PieVentanaModal">
                    <button class="BotonAccionSecundario" id="BotonCopiarLetraPortapapeles">
                        <i class="fa-solid fa-copy" style="margin-right: 6px;"></i>Copiar Letra
                    </button>
                    <button class="BotonAccionPrimario BotonReproducirTarjeta" data-cancion-id="${this.CancionSeleccionada.IdCancion}">
                        <i class="fa-solid fa-play" style="margin-right: 6px;"></i>Reproducir Melodía
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalLetra = ComponenteModalLetra;
