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
        const DatosIFAEL = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerDatosIFAEL()) || {};

        const NombreInstitucion = DatosIFAEL.Nombre || 'Instituto de Formación Artística "Edelmira Limpias" (IFAEL)';
        const Descripcion = DatosIFAEL.Descripcion || 'El IFAEL es la institución emblemática de educación musical en el departamento del Beni. Dedicada a la formación técnica y profesional de artistas, compositores e instrumentistas con profunda identidad nacional y rescate de la música mojeño-trinitaria.';
        const Ciudad = DatosIFAEL.Ciudad || 'Trinidad, Beni - Bolivia';
        const Carrera = DatosIFAEL.CarreraPrincipal || 'Técnico Superior en Música Boliviana';
        const Modalidad = DatosIFAEL.Modalidad || 'Formación Artística Fiscal (3 Años)';
        const LogoUrl = DatosIFAEL.LogoUrl || 'LogoInicialesSinFondoNegro.png';
        const PortadaUrl = DatosIFAEL.FotoPortadaUrl || 'IFAEL.jpg';

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionIFAEL">
            <!-- Portada Institucional Estilo Página de Facebook -->
            <div class="TarjetaPerfilIFAEL">
                <div class="PortadaInstitucionIFAEL">
                    <img src="${PortadaUrl}" alt="Instituto IFAEL Trinidad" class="ImagenPortadaInstitucion">
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
                            <div class="SubtituloInstitucion">Educación Musical Superior • ${Ciudad}</div>
                            <div class="MetaDetalleInstitucion">
                                <i class="fa-solid fa-graduation-cap" style="margin-right: 4px;"></i>Carrera: ${Carrera} • ${Modalidad}
                            </div>
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
                        <div style="background-color: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano);">
                            <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-building-columns" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Sobre el Instituto IFAEL:
                            </div>
                            <p style="font-size: 13.5px; color: var(--ColorTextoPrincipal); line-height: 1.5;">
                                ${Descripcion}
                            </p>
                        </div>

                        <div style="background-color: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano);">
                            <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-scroll" style="color: var(--ColorVerdeBeni); margin-right: 6px;"></i>Proyecto Académico "Letras Mi Poblau":
                            </div>
                            <p style="font-size: 13.5px; color: var(--ColorTextoPrincipal); line-height: 1.5;">
                                Iniciativa de graduación y archivo digital desarrollada por estudiantes de la carrera de <strong>Técnico Superior en Música Boliviana</strong> para sistematizar letras, partituras, audios demostrativos y biografías de los creadores del folklore beniano.
                            </p>
                        </div>
                    </div>

                    <!-- Datos de Contacto y Ubicación -->
                    <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, var(--ColorPrimarioAzulSuave), rgba(46, 125, 50, 0.1)); border-radius: var(--RadioMediano); border: 1px solid var(--ColorPrimarioAzulSuave);">
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);">
                            <i class="fa-solid fa-location-dot" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Ubicación e Informaciones:
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--ColorTextoPrincipal);">
                            <div><i class="fa-solid fa-city" style="margin-right: 4px;"></i><strong>Ciudad:</strong> ${Ciudad}</div>
                            <div><i class="fa-solid fa-award" style="margin-right: 4px;"></i><strong>Carrera:</strong> ${Carrera}</div>
                            <div><i class="fa-solid fa-music" style="margin-right: 4px;"></i><strong>Modalidad:</strong> ${Modalidad}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteSeccionIFAEL = ComponenteSeccionIFAEL;
