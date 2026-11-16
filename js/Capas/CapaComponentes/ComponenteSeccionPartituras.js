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
                        <span>Partituras Digitales</span>
                    </h1>
                    <p class="DescripcionSeccionSubtitulo">
                        Partituras y manuscritos digitalizados del acervo documental del IFAEL en Trinidad, Beni.
                    </p>
                </div>
            </div>

            <!-- Rejilla de Partituras (Diseño Documental Sin Miniatura) -->
            ${CancionesConPartitura.length > 0 ? `
            <div class="RejillaPartiturasCatalogo">
                ${CancionesConPartitura.map(C => {
            const UrlPartitura = C.ImagenPartituraUrl || C.PartituraUrl || C.ImagenPartitura;
            const EsPdf = (UrlPartitura || "").toLowerCase().includes(".pdf");
            return `
                    <div class="TarjetaPartituraItem TarjetaPartituraDocumento" id="PartituraCard_${C.IdCancion}">
                        <div class="CabeceraTarjetaDocumento BotonAbrirModalPartituraDirecto" data-id-cancion="${C.IdCancion}" title="Clic para visualizar partitura">
                            <div class="IconoDocumentoPartitura">
                                <img src="LogoIniciales.png" alt="LMP" class="ImagenLogoInicialesPartitura">
                            </div>
                            <div class="InsigniasTarjetaDocumento">
                                <span class="InsigniaRitmoPartitura">${C.Genero || 'Folklore Beniano'}</span>
                                <span class="InsigniaFormatoDocumento ${EsPdf ? 'FormatoPDF' : 'FormatoImagen'}">
                                    <i class="${EsPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}"></i>
                                    <span>${EsPdf ? 'Partitura PDF' : 'Manuscrito'}</span>
                                </span>
                            </div>
                        </div>

                        <div class="CuerpoInfoPartitura">
                            <h3 class="TituloCancionPartitura BotonAbrirModalPartituraDirecto" data-id-cancion="${C.IdCancion}" title="Clic para visualizar">${C.Titulo}</h3>
                            <p class="AutorCancionPartitura">
                                <i class="fa-solid fa-user-pen" style="font-size: 12px; margin-right: 4px;"></i>
                                <span>${C.Autor || 'Tradicional Beniano'}</span>
                            </p>
                            <div class="MetadatosDocumentoPartitura">
                                <span class="DatoMetaItem"><i class="fa-solid fa-building-columns"></i> Archivo IFAEL</span>
                                <span class="DatoMetaItem"><i class="fa-solid fa-circle-check" style="color: var(--ColorVerdeBeni);"></i> Digitalizado</span>
                            </div>
                        </div>

                        <div class="BotonesAccionTarjetaPartitura">
                            <button class="BotonAccionPrimario BotonAbrirModalPartituraDirecto" data-id-cancion="${C.IdCancion}">
                                <i class="fa-solid fa-book-open"></i>
                                <span>Visualizar</span>
                            </button>
                            <a href="${UrlPartitura}" data-url-descarga="${UrlPartitura}" class="BotonAccionSecundario BotonDescargarPartituraEnlace" download="Partitura_${C.Titulo.replace(/\s+/g, '_')}${EsPdf ? '.pdf' : '.jpg'}" title="Descargar archivo en tu dispositivo">
                                <i class="fa-solid fa-download"></i>
                                <span>Descargar</span>
                            </a>
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
