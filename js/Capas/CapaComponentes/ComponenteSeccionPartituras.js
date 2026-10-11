/* ==========================================================================
   COMPONENTE: SECCIÓN VISOR Y ARCHIVO DE PARTITURAS DIGITALES
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionPartituras {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const EstadoActual = this.ServicioEstado.ObtenerEstado();
        const TerminoBusqueda = (EstadoActual.TerminoBusquedaGlobal || "").toLowerCase();

        const TodasLasCanciones = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones() || [];
        
        // Filtrar aquellas canciones que tienen una partitura válida asociada
        let CancionesConPartitura = TodasLasCanciones.filter(C => {
            const url = C.ImagenPartituraUrl || C.PartituraUrl || C.ImagenPartitura;
            return url && url.trim() !== "" && url !== "IFAEL.jpg";
        });

        if (TerminoBusqueda) {
            CancionesConPartitura = CancionesConPartitura.filter(C => 
                (C.Titulo && C.Titulo.toLowerCase().includes(TerminoBusqueda)) ||
                (C.Autor && C.Autor.toLowerCase().includes(TerminoBusqueda)) ||
                (C.Genero && C.Genero.toLowerCase().includes(TerminoBusqueda))
            );
        }

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionPartituras">
            <!-- Cabecera de la Sección -->
            <div class="CabeceraSeccionPrincipal CabeceraSeccionPartituras">
                <div class="TextosCabeceraPartituras">
                    <h1 class="TituloSeccionGrande">
                        <i class="fa-solid fa-file-audio" style="color: var(--ColorPrimarioAzul);"></i>
                        <span>Archivo de Partituras Digitales</span>
                    </h1>
                    <p class="DescripcionSeccionSubtitulo">
                        Partituras y manuscritos digitalizados del acervo documental del IFAEL en Trinidad, Beni.
                    </p>
                </div>
            </div>

            <!-- Rejilla de Partituras -->
            ${CancionesConPartitura.length > 0 ? `
            <div class="RejillaPartiturasCatalogo">
                ${CancionesConPartitura.map(C => {
                    const UrlPartitura = C.ImagenPartituraUrl || C.PartituraUrl || C.ImagenPartitura;
                    return `
                    <div class="TarjetaPartituraItem" id="PartituraCard_${C.IdCancion}">
                        <div class="PrevisualizacionMiniaturaPartitura" data-id-cancion="${C.IdCancion}">
                            <img src="${UrlPartitura}" alt="Partitura de ${C.Titulo}" class="ImagenMiniaturaPartitura" onerror="this.src='IFAEL.jpg'">
                            <div class="OverlayHoverPartitura">
                                <span class="BotonLupaZoomPartitura">
                                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                                    <span>Ver en Grande</span>
                                </span>
                            </div>
                        </div>
                        <div class="CuerpoInfoPartitura">
                            <div class="InsigniaRitmo" style="font-size: 11px;">${C.Genero || 'Folklore Beniano'}</div>
                            <h3 class="TituloCancionPartitura">${C.Titulo}</h3>
                            <p class="AutorCancionPartitura"><i class="fa-solid fa-user-pen" style="font-size: 12px; margin-right: 5px;"></i>${C.Autor || 'Tradicional'}</p>
                            
                            <div class="BotonesAccionTarjetaPartitura">
                                <button class="BotonAccionSecundario BotonAbrirModalPartituraDirecto" data-id-cancion="${C.IdCancion}">
                                    <i class="fa-solid fa-eye"></i>
                                    <span>Visualizar</span>
                                </button>
                                <a href="${UrlPartitura}" target="_blank" rel="noopener noreferrer" class="BotonAccionPrimario BotonDescargarPartituraEnlace" download="Partitura_${C.Titulo.replace(/\s+/g, '_')}.jpg">
                                    <i class="fa-solid fa-download"></i>
                                    <span>Descargar</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            ` : `
            <div class="EstadoVacioGenerico" style="background: var(--ColorFondoSuperficie); padding: 50px 20px; border-radius: var(--RadioMediano); text-align: center; border: 1px solid var(--ColorBordeDivisor);">
                <i class="fa-solid fa-file-circle-question" style="font-size: 44px; color: var(--ColorTextoAtenuado); margin-bottom: 14px; display: block;"></i>
                <h3 style="font-size: 18px; color: var(--ColorTextoPrincipal); font-weight: 700;">No se encontraron partituras</h3>
                <p style="font-size: 14px; color: var(--ColorTextoSecundario); margin-top: 6px;">Intenta con otro término de búsqueda o limpia el filtro para ver todo el catálogo documental.</p>
            </div>
            `}
        </div>
        `;
    }
}

window.ComponenteSeccionPartituras = ComponenteSeccionPartituras;
