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
            : (Cancion.ImagenPartitura && Cancion.ImagenPartitura !== "IFAEL.jpg" ? Cancion.ImagenPartitura : (Cancion.PartituraUrl || ""));

        const TienePartitura = Boolean(UrlPartitura && UrlPartitura.trim() !== "");
        const EsPdf = TienePartitura && UrlPartitura.toLowerCase().includes(".pdf");

        return `
        <div class="CapaFondoModalOscuro" id="ModalVisorPartituraFondo">
            <div class="ContenedorVentanaModal ModalAnchoExtraGrande" id="ContenedorVentanaModalPartitura">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div>
                        <div class="TituloModalTexto">
                            <i class="${EsPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-music'}" style="color: ${EsPdf ? '#e63946' : 'var(--ColorPrimarioAzul)'}; margin-right: 6px;"></i>
                            <span>Partitura: ${Cancion.Titulo || 'Partitura Folklórica'}</span>
                        </div>
                        <div style="font-size: 13px; color: var(--ColorTextoSecundario); margin-top: 2px;">
                            Fondo Documental IFAEL • ${Cancion.Autor || 'Archivo Tradicional'} ${EsPdf ? '• Documento PDF Completo' : ''}
                        </div>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalPartitura" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Visor Inmersivo (PDF Completo en Iframe o Imagen con Zoom) -->
                <div class="CuerpoVentanaModal CuerpoModalPartitura" style="padding: ${EsPdf ? '0' : '10px'}; background-color: #0b0c0d; display: flex; flex-direction: column; overflow: hidden; flex: 1;">
                    ${TienePartitura ? (
                        EsPdf ? `
                        <div class="ContenedorVisorPartituraModal ContenedorVisorPDF" id="ContenedorVisorPartituraZoom" style="width: 100%; height: 75vh; min-height: 520px; flex: 1; display: flex; flex-direction: column; background: #1a1a1a;">
                            <iframe 
                                id="IframeVisorPartituraPDF"
                                src="${UrlPartitura}#toolbar=1&navpanes=0&view=FitH" 
                                style="width: 100%; height: 100%; min-height: 520px; border: none; flex: 1; background-color: #2b2b2b;" 
                                title="Partitura PDF de ${Cancion.Titulo || 'Partitura'}"
                                allow="fullscreen"
                            >
                                <p style="color: #fff; padding: 24px; text-align: center;">
                                    Tu navegador no soporta el visor integrado de PDF. 
                                    <a href="${UrlPartitura}" target="_blank" style="color: #38bdf8; text-decoration: underline;">Haz clic aquí para abrir o descargar el documento PDF.</a>
                                </p>
                            </iframe>
                        </div>
                        ` : `
                        <div class="ContenedorVisorPartituraModal ContenedorVisorImagenCentrada" id="ContenedorVisorPartituraZoom">
                            <!-- Controles Flotantes de Zoom Arriba a la Derecha -->
                            <div class="BarraHerramientasZoomPartitura">
                                <button class="BotonCircularIcono BotonZoomItem" id="BotonReducirZoomPartitura" title="Reducir zoom"><i class="fa-solid fa-minus"></i></button>
                                <span class="EtiquetaPorcentajeZoom" id="EtiquetaPorcentajeZoom">100%</span>
                                <button class="BotonCircularIcono BotonZoomItem" id="BotonAumentarZoomPartitura" title="Aumentar zoom"><i class="fa-solid fa-plus"></i></button>
                                <button class="BotonCircularIcono BotonZoomItem" id="BotonResetearZoomPartitura" title="Restablecer tamaño"><i class="fa-solid fa-rotate"></i></button>
                            </div>

                            <!-- Área Centrada de la Partitura -->
                            <div class="AreaDesplazamientoPartituraImagen">
                                <img 
                                    src="${UrlPartitura}" 
                                    alt="Partitura ${Cancion.Titulo}" 
                                    class="ImagenPartituraZoomable" 
                                    id="ImagenPartituraZoomable"
                                    style="transform: scale(${this.NivelZoom}); transform-origin: center center;"
                                >
                            </div>
                        </div>
                        `
                    ) : `
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
                    ${EsPdf ? `
                    <a href="${UrlPartitura}" target="_blank" rel="noopener noreferrer" class="BotonAccionSecundario" title="Abrir en pestaña nueva">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        <span>Abrir Pantalla Completa</span>
                    </a>
                    <a href="${UrlPartitura}" data-url-descarga="${UrlPartitura}" download="Partitura_${(Cancion.Titulo || 'Cancion').replace(/\s+/g, '_')}.pdf" class="BotonAccionPrimario" id="BotonDescargarPartitura" title="Descargar documento PDF">
                        <i class="fa-solid fa-download"></i>
                        <span>Descargar PDF</span>
                    </a>
                    ` : `
                    <button class="BotonAccionSecundario" id="BotonImprimirPartitura" ${!TienePartitura ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                        <i class="fa-solid fa-print"></i>
                        <span>Imprimir Partitura</span>
                    </button>
                    <a href="${UrlPartitura}" data-url-descarga="${UrlPartitura}" download="Partitura_${(Cancion.Titulo || 'Cancion').replace(/\s+/g, '_')}.jpg" class="BotonAccionPrimario" id="BotonDescargarPartitura" ${!TienePartitura ? 'style="pointer-events: none; opacity: 0.4;"' : ''} title="Descargar copia de la partitura">
                        <i class="fa-solid fa-download"></i>
                        <span>Descargar Copia</span>
                    </a>
                    `}
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalPartitura = ComponenteModalPartitura;
