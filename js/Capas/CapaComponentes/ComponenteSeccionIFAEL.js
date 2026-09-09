/* ==========================================================================
   COMPONENTE: SECCIÓN IFAEL (PÁGINA INSTITUCIONAL)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   Refleja fielmente los datos reales registrados en la colección 'IFAEL' de Firestore
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
                    <div class="ElementoShimmerLMP" style="width: 100%; height: 200px; border-radius: 0;"></div>

                    <div class="CuerpoPerfilInstitucion" style="padding: 0 20px 20px;">
                        <div class="FilaAvatarYDatosPrincipales" style="display: flex; gap: 16px; align-items: flex-end; margin-top: -55px; margin-bottom: 20px; flex-wrap: wrap;">
                            <!-- Avatar Skeleton -->
                            <div class="ElementoShimmerLMP" style="width: 110px; height: 110px; border-radius: 50%; border: 4px solid var(--ColorFondoSuperficie); flex-shrink: 0; box-shadow: var(--SombraNivelDos);"></div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 200px; padding-top: 10px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 65%; height: 22px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 40%; height: 14px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 50%; height: 12px;"></div>
                            </div>
                            <div style="display: flex; gap: 8px; padding-top: 10px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 110px; height: 36px; border-radius: var(--RadioBotonPill);"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 110px; height: 36px; border-radius: var(--RadioBotonPill);"></div>
                            </div>
                        </div>

                        <!-- Cajas de Información Skeleton -->
                        <div style="margin-top: 20px; background-color: var(--ColorFondoSecundario); padding: 18px; border-radius: var(--RadioMediano); display: flex; flex-direction: column; gap: 10px;">
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 35%; height: 16px;"></div>
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 95%; height: 12px;"></div>
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 88%; height: 12px;"></div>
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 72%; height: 12px;"></div>
                        </div>

                        <div style="margin-top: 16px; background-color: var(--ColorFondoSecundario); padding: 18px; border-radius: var(--RadioMediano); display: flex; flex-direction: column; gap: 12px;">
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 45%; height: 16px;"></div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="height: 56px; border-radius: var(--RadioPequeno);"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="height: 56px; border-radius: var(--RadioPequeno);"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="height: 56px; border-radius: var(--RadioPequeno);"></div>
                            </div>
                        </div>
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
        const Descripcion = DatosIFAEL.Descripcion || '';
        const Ciudad = DatosIFAEL.Ciudad || '';
        const Direccion = DatosIFAEL.Direccion || '';
        const ContactoTelefono = DatosIFAEL.ContactoTelefono || '';
        const LogoUrl = DatosIFAEL.LogoUrl || 'IFAEL.jpg';
        const PortadaUrl = DatosIFAEL.FotoPortadaUrl || 'Logo1.png';
        const UrlGoogleMaps = DatosIFAEL.UbicacionMapsUrl || DatosIFAEL.UbicacionMaps || DatosIFAEL.GoogleMapsUrl || DatosIFAEL.MapaUrl || "https://maps.app.goo.gl/7x4KijRxw8PaGzoYA";
        const UrlIframeMaps = DatosIFAEL.UbicacionMapsIframe || "https://maps.google.com/maps?q=-14.820114,-64.8840641&hl=es&z=17&output=embed";

        const TelefonoLimpio = ContactoTelefono ? ContactoTelefono.replace(/[^0-9+]/g, '') : '';
        const TelefonoWhatsApp = ContactoTelefono ? ContactoTelefono.replace(/[^0-9]/g, '') : '';

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionIFAEL">
            <!-- Portada Institucional Estilo Perfil -->
            <div class="TarjetaPerfilIFAEL">
                <div class="PortadaInstitucionIFAEL">
                    <img src="${PortadaUrl}" alt="${NombreInstitucion}" class="ImagenPortadaInstitucion" onerror="this.src='Logo1.png'">
                </div>

                <div class="CuerpoPerfilInstitucion">
                    <div class="FilaAvatarYDatosPrincipales">
                        <div class="ContenedorAvatarFlotantePerfil">
                            <img src="${LogoUrl}" alt="Logo IFAEL" class="AvatarInstitucionGrande" onerror="this.src='IFAEL.jpg'">
                        </div>
                        <div class="DatosTextoInstitucion">
                            <h1 class="NombreInstitucionGrande">
                                <span>${NombreInstitucion}</span>
                                <span class="InsigniaVerificada" title="Institución Educativa Oficial"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>
                            </h1>
                            <div class="SubtituloInstitucion">
                                <i class="fa-solid fa-graduation-cap" style="color: var(--ColorPrimarioAzul); margin-right: 4px;"></i>Educación Musical Superior
                                ${Ciudad ? ` • <i class="fa-solid fa-location-dot" style="margin-left: 2px; margin-right: 3px;"></i>${Ciudad}` : ''}
                            </div>
                            ${Direccion ? `
                            <a href="${UrlGoogleMaps}" target="_blank" rel="noopener noreferrer" class="MetaDetalleInstitucion" style="text-decoration: none; color: inherit; display: inline-flex; align-items: center;" title="Ver en Google Maps">
                                <i class="fa-solid fa-map-location-dot" style="margin-right: 5px; color: var(--ColorPrimarioAzul);"></i>
                                <span>${Direccion}</span>
                                <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 11px; margin-left: 6px; color: var(--ColorPrimarioAzul);"></i>
                            </a>
                            ` : ''}
                            ${ContactoTelefono ? `
                            <div class="MetaDetalleInstitucion">
                                <i class="fa-solid fa-phone" style="margin-right: 5px; color: var(--ColorTextoSecundario);"></i>${ContactoTelefono}
                            </div>
                            ` : ''}
                        </div>

                        <div class="BotonesAccionPerfilInstitucion">
                            ${TelefonoWhatsApp ? `
                            <a href="https://wa.me/${TelefonoWhatsApp}?text=Hola%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20el%20IFAEL" target="_blank" rel="noopener noreferrer" class="BotonAccionPrimario" id="BotonContactarIFAEL" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                                <i class="fa-brands fa-whatsapp" style="font-size: 15px;"></i>Contactar
                            </a>
                            ` : `
                            <button type="button" class="BotonAccionPrimario" id="BotonContactarIFAEL">
                                <i class="fa-solid fa-phone" style="margin-right: 6px;"></i>Contactar
                            </button>
                            `}
                            <button type="button" class="BotonAccionSecundario" id="BotonCompartirIFAEL">
                                <i class="fa-solid fa-share-nodes" style="margin-right: 6px;"></i>Compartir
                            </button>
                        </div>
                    </div>

                    <!-- 1. Sobre el Instituto IFAEL (Descripción oficial) -->
                    ${Descripcion ? `
                    <div style="background-color: var(--ColorFondoSecundario); padding: 20px 22px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor); margin-top: 18px;">
                        <div style="font-weight: 700; font-size: 15.5px; margin-bottom: 10px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-building-columns" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Sobre el Instituto IFAEL</span>
                        </div>
                        <p style="font-size: 14px; color: var(--ColorTextoPrincipal); line-height: 1.65; margin: 0;">
                            ${Descripcion}
                        </p>
                    </div>
                    ` : ''}

                    <!-- 2. Información Institucional y Contacto -->
                    <div style="margin-top: 16px; padding: 20px 22px; background-color: var(--ColorFondoSecundario); border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                        <div style="font-weight: 700; font-size: 15.5px; margin-bottom: 14px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-circle-info" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Información Institucional y Contacto</span>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
                            ${Ciudad ? `
                            <div style="display: flex; align-items: flex-start; gap: 12px; background: var(--ColorFondoSuperficie); padding: 12px 16px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeSuave);">
                                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--ColorPrimarioAzulSuave); color: var(--ColorPrimarioAzul); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">
                                    <i class="fa-solid fa-city"></i>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 11.5px; font-weight: 700; color: var(--ColorTextoSecundario); text-transform: uppercase;">Ciudad</span>
                                    <span style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal);">${Ciudad}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${Direccion ? `
                            <a href="${UrlGoogleMaps}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: flex-start; gap: 12px; background: var(--ColorFondoSuperficie); padding: 12px 16px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeSuave); text-decoration: none; transition: transform 0.15s ease;">
                                <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(46, 125, 50, 0.12); color: var(--ColorVerdeBeni); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">
                                    <i class="fa-solid fa-map-location-dot"></i>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 11.5px; font-weight: 700; color: var(--ColorTextoSecundario); text-transform: uppercase;">Dirección</span>
                                    <span style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal);">${Direccion}</span>
                                </div>
                            </a>
                            ` : ''}

                            ${ContactoTelefono ? `
                            <div style="display: flex; align-items: flex-start; gap: 12px; background: var(--ColorFondoSuperficie); padding: 12px 16px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeSuave);">
                                <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(37, 211, 102, 0.12); color: #25D366; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 17px;">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 3px;">
                                    <span style="font-size: 11.5px; font-weight: 700; color: var(--ColorTextoSecundario); text-transform: uppercase;">Teléfono de Contacto</span>
                                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                        <a href="tel:${TelefonoLimpio}" style="font-size: 13.5px; font-weight: 700; color: var(--ColorPrimarioAzul); text-decoration: none;">
                                             ${ContactoTelefono}
                                        </a>
                                        <a href="https://wa.me/${TelefonoWhatsApp}?text=Hola%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20el%20IFAEL" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 700; color: #166534; background-color: #dcfce7; padding: 2px 8px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                            <i class="fa-brands fa-whatsapp"></i> Chat WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- 3. Mapa y Ubicación Geográfica IFAEL -->
                    <div style="margin-top: 16px; padding: 20px 22px; background-color: var(--ColorFondoSecundario); border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
                            <div style="font-weight: 700; font-size: 15.5px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-map-location-dot" style="color: #ea4335;"></i>
                                <span>Mapa de Ubicación</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <a href="${UrlGoogleMaps}" target="_blank" rel="noopener noreferrer" class="BotonAccionPrimario" id="BotonAbrirGoogleMapsIFAEL" style="text-decoration: none; padding: 8px 16px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 7px; border-radius: var(--RadioBotonPill);">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    <span>Abrir en Google Maps</span>
                                </a>
                            </div>
                        </div>

                        <!-- Mapa Interactivo Embebido -->
                        <div style="width: 100%; height: 380px; border-radius: var(--RadioMediano); overflow: hidden; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraNivelUno); margin-bottom: 14px; position: relative; background-color: var(--ColorFondoSuperficie);">
                            <iframe 
                                title="Mapa Interactivo de IFAEL en Google Maps"
                                src="${UrlIframeMaps}" 
                                width="100%" 
                                height="100%" 
                                style="border: 0; display: block;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteSeccionIFAEL = ComponenteSeccionIFAEL;
