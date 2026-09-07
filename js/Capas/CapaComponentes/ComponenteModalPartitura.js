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

                <!-- Visor Inmersivo con Zoom -->
                <div class="CuerpoVentanaModal" style="padding: 10px; background-color: #0b0c0d;">
                    <div class="ContenedorVisorPartituraModal" id="ContenedorVisorPartituraZoom">
                        <img 
                            src="${Cancion.ImagenPartitura || 'IFAEL.jpg'}" 
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
                </div>

                <!-- Pie de Modal -->
                <div class="PieVentanaModal">
                    <button class="BotonAccionSecundario" id="BotonImprimirPartitura">
                        <i class="fa-solid fa-print"></i> Imprimir Partitura
                    </button>
                    <button class="BotonAccionPrimario" id="BotonDescargarPartitura">
                        <i class="fa-solid fa-download"></i> Descargar Copia
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalPartitura = ComponenteModalPartitura;
