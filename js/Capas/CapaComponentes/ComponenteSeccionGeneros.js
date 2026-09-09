/* ==========================================================================
   COMPONENTE: SECCIÓN GÉNEROS Y RITMOS TRADICIONALES
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionGeneros {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento = null) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const EstadoActual = this.ServicioEstado ? this.ServicioEstado.ObtenerEstado() : {};
        const TerminoBusqueda = (EstadoActual.TerminoBusquedaGlobal || "").trim().toLowerCase();
        let Generos = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosGeneros()) || [];

        // Filtrado por buscador global
        if (TerminoBusqueda) {
            Generos = Generos.filter(Gen => {
                const CoincideNombre = Gen.Nombre && Gen.Nombre.toLowerCase().includes(TerminoBusqueda);
                const CoincideOrigen = Gen.Origen && Gen.Origen.toLowerCase().includes(TerminoBusqueda);
                const CoincideDescripcion = Gen.Descripcion && Gen.Descripcion.toLowerCase().includes(TerminoBusqueda);
                const CoincideCompas = Gen.Compas && Gen.Compas.toLowerCase().includes(TerminoBusqueda);
                const CoincideInstrumentos = Array.isArray(Gen.InstrumentosTipicos)
                    ? Gen.InstrumentosTipicos.some(Inst => String(Inst).toLowerCase().includes(TerminoBusqueda))
                    : (typeof Gen.InstrumentosTipicos === "string" && Gen.InstrumentosTipicos.toLowerCase().includes(TerminoBusqueda));

                return CoincideNombre || CoincideOrigen || CoincideDescripcion || CoincideCompas || CoincideInstrumentos;
            });
        }

        const EsBusquedaActiva = Boolean(TerminoBusqueda);

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionGeneros">
            <!-- Encabezado de la Sección Compacto -->
            <div class="CabeceraSeccionPrincipal CabeceraSeccionGeneros">
                <div class="ContenedorEncabezadoGeneros">
                    <div class="TextosEncabezadoGeneros">
                        <h1 class="TituloSeccionGrande">
                            <i class="fa-solid fa-guitar" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Ritmos y Géneros</span>
                        </h1>
                        <p class="DescripcionSeccionSubtitulo">
                            ${EsBusquedaActiva ? `Resultados de búsqueda para "${EstadoActual.TerminoBusquedaGlobal}"` : 'Guía histórica y compases tradicionales del Beni'}
                        </p>
                    </div>
                    <button class="BotonAccionPrimario BotonAbrirModalNuevoGenero BotonRegistrarGeneroEncabezado" id="BotonAbrirModalCrearGenero" title="Registrar nuevo ritmo tradicional">
                        <i class="fa-solid fa-plus"></i>
                        <span>Registrar</span>
                    </button>
                </div>
            </div>

            <!-- Cuadrícula de Géneros o Estado Vacío -->
            ${Generos.length > 0 ? `
            <div class="CuadriculaGenerosMusicales">
                ${Generos.map(Gen => {
                    const IconoHtml = Gen.Icono || (Gen.IconoClase ? `<i class="${Gen.IconoClase}"></i>` : '<i class="fa-solid fa-guitar"></i>');
                    const ColorSolido = Gen.Color || '#1877f2';
                    return `
                    <div class="TarjetaGeneroBeniano">
                        <!-- Cabecera Visual con Color Sólido (Sin Gradiente) y Distribución Unificada -->
                        <div class="CabeceraGeneroSolida" style="background-color: ${ColorSolido};">
                            <div class="ContenedorIconoGeneroSolido" title="Ritmo: ${Gen.Nombre}">
                                ${IconoHtml}
                            </div>
                            <div class="DatosCabeceraGenero">
                                <h2 class="NombreGeneroTarjeta" title="${Gen.Nombre}">${Gen.Nombre}</h2>
                                ${Gen.Origen ? `
                                <div class="OrigenGeneroTexto" title="Origen geográfico: ${Gen.Origen}">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <span>${Gen.Origen}</span>
                                </div>` : ''}
                            </div>
                        </div>

                        <!-- Cuerpo de la Tarjeta con Nueva Distribución de Información -->
                        <div class="CuerpoGeneroInfo">
                            ${Gen.Compas ? `
                            <div class="FilaMetaCompas">
                                <span class="InsigniaCompasDestacada" style="color: ${ColorSolido}; border-color: ${ColorSolido}45; background-color: ${ColorSolido}14;">
                                    <i class="fa-solid fa-music"></i>
                                    <span><strong>Compás:</strong> ${Gen.Compas}</span>
                                </span>
                            </div>` : ''}

                            ${Gen.Descripcion ? `
                            <p class="DescripcionGeneroTexto" title="${Gen.Descripcion}">
                                ${Gen.Descripcion}
                            </p>` : ''}

                            <!-- Pie de Tarjeta con Botones Rectangulares con Puntas Redondeadas -->
                            <div class="PieTarjetaGenero">
                                <div class="FilaBotonesGenero">
                                    <button type="button" class="BotonAccionSecundario BotonAbrirModalGenero" data-genero="${Gen.Nombre}" title="Ver historia y ficha técnica completa">
                                        <i class="fa-solid fa-circle-info"></i>
                                        <span>Detalles</span>
                                    </button>
                                    <button type="button" class="BotonAccionPrimario BotonExplorarCancionesGenero" data-genero="${Gen.Nombre}" style="background-color: ${ColorSolido}; border-color: ${ColorSolido};" title="Explorar canciones de este ritmo">
                                        <i class="fa-solid fa-scroll"></i>
                                        <span>Canciones</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            ` : (this.ModeloAlmacenamiento && !EsBusquedaActiva && this.ModeloAlmacenamiento.EstaSincronizandoDatos() ? `
            <div class="CuadriculaGenerosMusicales">
                ${[1, 2, 3, 4].map(() => `
                <div class="TarjetaSkeletonCuadricula" style="overflow: hidden; padding: 0;">
                    <div class="ElementoShimmerLMP" style="height: 100px; border-radius: 0;"></div>
                    <div style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 85%;"></div>
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 60%;"></div>
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 100%; height: 32px; border-radius: var(--RadioBotonPill); margin-top: 8px;"></div>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : `
            <div style="background-color: var(--ColorFondoSuperficie); padding: 40px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave); margin-top: 20px;">
                <i class="fa-solid ${EsBusquedaActiva ? 'fa-magnifying-glass' : 'fa-guitar'}" style="font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.6; color: ${EsBusquedaActiva ? 'var(--ColorPrimarioAzul)' : 'inherit'};"></i>
                <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">${EsBusquedaActiva ? 'No se encontraron ritmos o géneros' : 'No hay géneros registrados'}</div>
                <p style="font-size: 13px; margin-top: 4px;">${EsBusquedaActiva ? `No hay ritmos ni géneros que coincidan con "<strong>${EstadoActual.TerminoBusquedaGlobal}</strong>".` : 'Aún no se han registrado géneros o ritmos folklóricos en la base de datos.'}</p>
            </div>
            `)}
        </div>
        `;
    }
}

window.ComponenteSeccionGeneros = ComponenteSeccionGeneros;
