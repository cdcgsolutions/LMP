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
        const Generos = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosGeneros()) || [];

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
                            Guía histórica y compases tradicionales del Beni
                        </p>
                    </div>
                </div>
            </div>

            <!-- Cuadrícula de Géneros o Estado Vacío -->
            ${Generos.length > 0 ? `
            <div class="CuadriculaGenerosMusicales">
                ${Generos.map(Gen => {
                    const IconoHtml = Gen.Icono || (Gen.IconoClase ? `<i class="${Gen.IconoClase}"></i>` : '<i class="fa-solid fa-guitar"></i>');
                    return `
                    <div class="TarjetaGeneroBeniano">
                        <!-- Cabecera Visual con Gradiente y Metadatos Clave -->
                        <div class="CabeceraGeneroColor" style="background: ${Gen.ColorGradiente || 'linear-gradient(135deg, #1877f2, #0d5cb6)'};">
                            <div class="FilaSuperiorCabeceraGenero">
                                <div class="ContenedorIconoGenero" title="Ritmo: ${Gen.Nombre}">
                                    ${IconoHtml}
                                </div>
                                ${Gen.Compas ? `
                                <span class="InsigniaCompasPill" title="Compás rítmico">
                                    <i class="fa-solid fa-music"></i>
                                    <span>${Gen.Compas}</span>
                                </span>` : ''}
                            </div>
                            <div class="FilaInferiorCabeceraGenero">
                                <h2 class="NombreGeneroTarjeta">${Gen.Nombre}</h2>
                                ${Gen.Origen ? `
                                <span class="OrigenGeneroPill" title="Origen geográfico">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <span>${Gen.Origen}</span>
                                </span>` : ''}
                            </div>
                        </div>

                        <!-- Cuerpo de la Tarjeta con Información Relevante y Despejada -->
                        <div class="CuerpoGeneroInfo">
                            ${Gen.Descripcion ? `
                            <p class="DescripcionGeneroTexto" title="${Gen.Descripcion}">
                                ${Gen.Descripcion}
                            </p>` : ''}

                            <!-- Pie de Tarjeta con Dos Acciones: Ver Detalles en Modal y Explorar Canciones -->
                            <div class="PieTarjetaGenero">
                                <div class="FilaBotonesGenero">
                                    <button type="button" class="BotonAccionSecundario BotonAbrirModalGenero" data-genero="${Gen.Nombre}" title="Ver historia y ficha técnica completa">
                                        <i class="fa-solid fa-circle-info"></i>
                                        <span>Detalles</span>
                                    </button>
                                    <button type="button" class="BotonAccionPrimario BotonExplorarCancionesGenero" data-genero="${Gen.Nombre}" title="Explorar canciones de este ritmo">
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
            ` : (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EstaSincronizandoDatos() ? `
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
                <i class="fa-solid fa-guitar" style="font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.6;"></i>
                <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">No hay géneros registrados</div>
                <p style="font-size: 13px; margin-top: 4px;">Aún no se han registrado géneros o ritmos folklóricos en la base de datos.</p>
            </div>
            `)}
        </div>
        `;
    }
}

window.ComponenteSeccionGeneros = ComponenteSeccionGeneros;
