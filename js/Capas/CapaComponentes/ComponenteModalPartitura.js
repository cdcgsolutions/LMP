/* ==========================================================================
   COMPONENTE: MODAL VISOR DE PARTITURAS Y MANUSCRITOS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalPartitura {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.NivelZoom = 1;
    }

    Renderizar(IdCancion) {
        const Cancion = this.ModeloAlmacenamiento.ObtenerCancionPorId(IdCancion) || {};
        this.NivelZoom = 1;

        const UrlPartitura = (Cancion.ImagenPartituraUrl && Cancion.ImagenPartituraUrl !== "IFAEL.jpg")
            ? Cancion.ImagenPartituraUrl
            : (Cancion.ImagenPartitura && Cancion.ImagenPartitura !== "IFAEL.jpg" ? Cancion.ImagenPartitura : "");

        const TienePartitura = Boolean(UrlPartitura && UrlPartitura.trim() !== "");

        return `
        <div class="CapaFondoModalOscuro" id="ModalVisorPartituraFondo">
            <div class="ContenedorVentanaModal ModalAnchoExtraGrande" id="ContenedorVentanaModalPartitura">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div>
                        <div class="TituloModalTexto"><i class="fa-solid fa-music" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Partitura / Manuscrito: ${Cancion.Titulo || 'Partitura Folklórica'}</div>
                        <div style="font-size: 13px; color: var(--ColorTextoSecundario);">
                            Fondo Documental IFAEL • ${Cancion.Autor || 'Archivo Tradicional'}
                        </div>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalPartitura" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Visor Inmersivo con Zoom o Estado Sin Partitura -->
                <div class="CuerpoVentanaModal" style="padding: 10px; background-color: #0b0c0d;">
                    ${TienePartitura ? `
                    <div class="ContenedorVisorPartituraModal" id="ContenedorVisorPartituraZoom">
                        <img 
                            src="${UrlPartitura}" 
                            alt="Partitura ${Cancion.Titulo}" 
                            class="ImagenPartituraZoomable" 
                            id="ImagenPartituraZoomable"
                            style="transform: scale(${this.NivelZoom});"
                        >

                        <!-- Controles Flotantes de Zoom -->
                        <div class="BarraHerramientasZoomPartitura">
                            <button class="BotonCircularIcono" id="BotonReducirZoomPartitura" style="width: 32px; height: 32px; color: #fff; background: rgba(255,255,255,0.15);" title="Reducir zoom"><i class="fa-solid fa-minus"></i></button>
                            <span style="color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; padding: 0 4px;" id="EtiquetaPorcentajeZoom">100%</span>
                            <button class="BotonCircularIcono" id="BotonAumentarZoomPartitura" style="width: 32px; height: 32px; color: #fff; background: rgba(255,255,255,0.15);" title="Aumentar zoom"><i class="fa-solid fa-plus"></i></button>
                            <button class="BotonCircularIcono" id="BotonResetearZoomPartitura" style="width: 32px; height: 32px; color: #fff; background: rgba(255,255,255,0.15);" title="Restablecer tamaño"><i class="fa-solid fa-rotate"></i></button>
                        </div>
                    </div>
                    ` : `
                    <div class="ContenedorVisorPartituraModal" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360px; text-align: center; padding: 40px 20px;">
                        <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 32px; color: var(--ColorTextoSecundario);">
                            <i class="fa-solid fa-file-excel"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 18px; font-weight: 700;">Sin Partitura o Manuscrito</h3>
                        <p style="margin: 0; font-size: 13.5px; max-width: 380px; color: var(--ColorTextoSecundario); line-height: 1.5;">
                            Esta composición aún no cuenta con partitura ni manuscrito original digitalizado en la plataforma.
                        </p>
                    </div>
                    `}
                </div>

                <!-- Pie de Modal -->
                <div class="PieVentanaModal">
                    <button class="BotonAccionSecundario" id="BotonImprimirPartitura" ${!TienePartitura ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                        <i class="fa-solid fa-print"></i>
                        <span class="TextoBotonLargo">Imprimir Partitura</span>
                        <span class="TextoBotonCorto">Imprimir</span>
                    </button>
                    <button class="BotonAccionPrimario" id="BotonDescargarPartitura" ${!TienePartitura ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                        <i class="fa-solid fa-download"></i>
                        <span class="TextoBotonLargo">Descargar Copia</span>
                        <span class="TextoBotonCorto">Descargar</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalPartitura = ComponenteModalPartitura;
