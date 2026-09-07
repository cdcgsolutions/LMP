/* ==========================================================================
   COMPONENTE: SECCIÓN GÉNEROS Y RITMOS TRADICIONALES
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionGeneros {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        const Generos = window.DatosGenerosColeccion || [];

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionGeneros">
            <!-- Encabezado de la Sección -->
            <div class="CabeceraSeccionPrincipal">
                <div>
                    <h1 class="TituloSeccionGrande"><i class="fa-solid fa-guitar" style="color: var(--ColorVerdeBeni); margin-right: 8px;"></i>Ritmos y Géneros Tradicionales del Beni</h1>
                    <p class="DescripcionSeccionSubtitulo">
                        Guía pedagógica e histórica de los compases, raíces y melodías autóctonas que dan identidad a la música boliviana oriental.
                    </p>
                </div>
            </div>

            <!-- Cuadrícula de Géneros -->
            <div class="CuadriculaGenerosMusicales">
                ${Generos.map(Gen => `
                <div class="TarjetaGeneroBeniano">
                    <div class="CabeceraGeneroColor" style="background: ${Gen.ColorGradiente};">
                        <span style="font-size: 32px; margin-bottom: 4px;">${Gen.Icono}</span>
                        <div style="font-size: 20px; font-weight: 800;">${Gen.Nombre}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Compás: ${Gen.Compas}</div>
                    </div>

                    <div class="CuerpoGeneroInfo">
                        <div style="font-size: 12px; color: var(--ColorTextoSecundario);">
                            <i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i><strong>Origen:</strong> ${Gen.Origen}
                        </div>
                        <p style="font-size: 13.5px; color: var(--ColorTextoPrincipal); line-height: 1.4;">
                            ${Gen.Descripcion}
                        </p>

                        <div style="margin-top: 6px;">
                            <div style="font-size: 12px; font-weight: 700; color: var(--ColorTextoSecundario); margin-bottom: 4px;">
                                <i class="fa-solid fa-music" style="margin-right: 4px;"></i>Instrumentos Típicos:
                            </div>
                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                ${(Gen.InstrumentosTipicos || []).map(Inst => `
                                    <span style="font-size: 11px; background-color: var(--ColorFondoSecundario); padding: 3px 8px; border-radius: 4px; font-weight: 600;">
                                        ${Inst}
                                    </span>
                                `).join('')}
                            </div>
                        </div>

                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--ColorBordeDivisor);">
                            <button class="BotonAccionPrimario BotonExplorarCancionesGenero" data-genero="${Gen.Nombre}" style="width: 100%; font-size: 13px;">
                                <i class="fa-solid fa-scroll" style="margin-right: 6px;"></i>Explorar canciones de ${Gen.Nombre}
                            </button>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        `;
    }
}

window.ComponenteSeccionGeneros = ComponenteSeccionGeneros;
