/* ==========================================================================
   COMPONENTE: SECCIÓN IFAEL (PÁGINA INSTITUCIONAL ESTILO FACEBOOK)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionIFAEL {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento = null) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const EstaSincronizando = this.ModeloAlmacenamiento && (
            !this.ModeloAlmacenamiento.DatosCargadosDesdeFirestore || 
            this.ModeloAlmacenamiento.EstaSincronizandoDatos()
        );
        const DatosIFAEL = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerDatosIFAEL()) || null;

        if ((!DatosIFAEL || !DatosIFAEL.Nombre) && EstaSincronizando) {
            return `
            <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionIFAEL">
                <div class="TarjetaPerfilIFAEL" style="background-color: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeSuave); overflow: hidden;">
                    <!-- Portada Skeleton -->
                    <div class="ElementoShimmerLMP" style="width: 100%; height: 220px; border-radius: 0;"></div>

                    <div class="CuerpoPerfilInstitucion" style="padding: 20px;">
                        <div class="FilaAvatarYDatosPrincipales" style="display: flex; gap: 16px; align-items: flex-end; margin-top: -60px; margin-bottom: 20px; flex-wrap: wrap;">
                            <!-- Avatar Skeleton -->
                            <div class="ElementoShimmerLMP" style="width: 110px; height: 110px; border-radius: 50%; border: 4px solid var(--ColorFondoSuperficie); flex-shrink: 0; box-shadow: var(--SombraNivelDos);"></div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 200px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 60%; height: 24px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 35%; height: 14px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 45%; height: 12px;"></div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 100px; height: 36px; border-radius: var(--RadioBotonPill);"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 100px; height: 36px; border-radius: var(--RadioBotonPill);"></div>
                            </div>
                        </div>

                        <!-- Cajas de Información Skeleton -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--ColorBordeDivisor);">
                            <div style="background-color: var(--ColorFondoSecundario); padding: 18px; border-radius: var(--RadioMediano); display: flex; flex-direction: column; gap: 10px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 40%; height: 16px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 90%; height: 12px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 85%; height: 12px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 70%; height: 12px;"></div>
                            </div>
                            <div style="background-color: var(--ColorFondoSecundario); padding: 18px; border-radius: var(--RadioMediano); display: flex; flex-direction: column; gap: 10px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 50%; height: 16px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 95%; height: 12px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 88%; height: 12px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 75%; height: 12px;"></div>
                            </div>
                        </div>

                        <!-- Barra Inferior Skeleton -->
                        <div style="margin-top: 16px; height: 50px; border-radius: var(--RadioMediano);" class="ElementoShimmerLMP"></div>
                    </div>
                </div>
            </div>
            `;
        }

        if (!DatosIFAEL || !DatosIFAEL.Nombre) {
            return `
            <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionIFAEL">
                <div style="background-color: var(--ColorFondoSuperficie); padding: 50px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave); margin-top: 20px;">
                    <i class="fa-solid fa-building-columns" style="font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.6;"></i>
                    <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">Información de IFAEL no disponible</div>
                    <p style="font-size: 13px; margin-top: 4px;">Aún no se ha registrado la información institucional en la base de datos.</p>
                </div>
            </div>`;
        }

        const NombreInstitucion = DatosIFAEL.Nombre;
        const Descripcion = DatosIFAEL.Descripcion || DatosIFAEL.ResenaHistorica || '';
        const Ciudad = DatosIFAEL.Ciudad || '';
        const Carrera = DatosIFAEL.CarreraPrincipal || DatosIFAEL.Carrera || '';
        const Modalidad = DatosIFAEL.Modalidad || '';
        const LogoUrl = DatosIFAEL.LogoUrl || DatosIFAEL.Logo || 'Logo1.png';
        const PortadaUrl = DatosIFAEL.FotoPortadaUrl || DatosIFAEL.FotoPortada || DatosIFAEL.PortadaUrl || 'IFAEL.jpg';
        const ProyectoAcademico = DatosIFAEL.ProyectoAcademico || '';

        const MetaItems = [];
        if (Carrera) MetaItems.push(`Carrera: ${Carrera}`);
        if (Modalidad) MetaItems.push(Modalidad);
        const MetaTexto = MetaItems.join(' • ');

        const InfoItems = [];
        if (Ciudad) InfoItems.push(`<div><i class="fa-solid fa-city" style="margin-right: 4px;"></i><strong>Ciudad:</strong> ${Ciudad}</div>`);
        if (Carrera) InfoItems.push(`<div><i class="fa-solid fa-award" style="margin-right: 4px;"></i><strong>Carrera:</strong> ${Carrera}</div>`);
        if (Modalidad) InfoItems.push(`<div><i class="fa-solid fa-music" style="margin-right: 4px;"></i><strong>Modalidad:</strong> ${Modalidad}</div>`);

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionIFAEL">
            <!-- Portada Institucional Estilo Página de Facebook -->
            <div class="TarjetaPerfilIFAEL">
                <div class="PortadaInstitucionIFAEL">
                    <img src="${PortadaUrl}" alt="${NombreInstitucion}" class="ImagenPortadaInstitucion" onerror="this.src='IFAEL.jpg'">
                </div>

                <div class="CuerpoPerfilInstitucion">
                    <div class="FilaAvatarYDatosPrincipales">
                        <div class="ContenedorAvatarFlotantePerfil">
                            <img src="${LogoUrl}" alt="Logo IFAEL" class="AvatarInstitucionGrande" onerror="this.src='Logo1.png'">
                        </div>
                        <div class="DatosTextoInstitucion">
                            <h1 class="NombreInstitucionGrande">
                                <span>${NombreInstitucion}</span>
                                <span class="InsigniaVerificada" title="Institución Educativa Oficial"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>
                            </h1>
                            <div class="SubtituloInstitucion">Educación Musical Superior${Ciudad ? ` • ${Ciudad}` : ''}</div>
                            ${MetaTexto ? `
                            <div class="MetaDetalleInstitucion">
                                <i class="fa-solid fa-graduation-cap" style="margin-right: 4px;"></i>${MetaTexto}
                            </div>
                            ` : ''}
                        </div>

                        <div class="BotonesAccionPerfilInstitucion">
                            <button class="BotonAccionPrimario" id="BotonContactarIFAEL">
                                <i class="fa-solid fa-phone" style="margin-right: 6px;"></i>Contactar
                            </button>
                            <button class="BotonAccionSecundario" id="BotonCompartirIFAEL">
                                <i class="fa-solid fa-share" style="margin-right: 6px;"></i>Compartir
                            </button>
                        </div>
                    </div>

                    <!-- Misión y Proyecto Académico Letras Mi Poblau -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--ColorBordeDivisor);">
                        ${Descripcion ? `
                        <div style="background-color: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano);">
                            <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-building-columns" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Sobre el Instituto IFAEL:
                            </div>
                            <p style="font-size: 13.5px; color: var(--ColorTextoPrincipal); line-height: 1.5;">
                                ${Descripcion}
                            </p>
                        </div>
                        ` : ''}

                        <div style="background-color: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano);">
                            <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-scroll" style="color: var(--ColorVerdeBeni); margin-right: 6px;"></i>Proyecto Académico "Letras Mi Poblau":
                            </div>
                            <p style="font-size: 13.5px; color: var(--ColorTextoPrincipal); line-height: 1.5;">
                                ${ProyectoAcademico || 'Iniciativa de graduación y archivo digital desarrollada por estudiantes de la carrera de Técnico Superior en Música Boliviana para sistematizar letras, partituras, audios demostrativos y biografías de los creadores del folklore beniano.'}
                            </p>
                        </div>
                    </div>

                    <!-- Datos de Contacto y Ubicación -->
                    ${InfoItems.length > 0 ? `
                    <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, var(--ColorPrimarioAzulSuave), rgba(46, 125, 50, 0.1)); border-radius: var(--RadioMediano); border: 1px solid var(--ColorPrimarioAzulSuave);">
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);">
                            <i class="fa-solid fa-location-dot" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Ubicación e Informaciones:
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--ColorTextoPrincipal);">
                            ${InfoItems.join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteSeccionIFAEL = ComponenteSeccionIFAEL;
