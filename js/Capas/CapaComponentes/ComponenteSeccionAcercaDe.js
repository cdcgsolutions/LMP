/* ==========================================================================
   COMPONENTE: SECCIÓN ACERCA DE NOSOTROS (EQUIPO Y PROYECTO LMP)
   Nombres en PascalCase - Letras de mi Poblao (LMP)
   Refleja fielmente los datos dinámicos registrados en la colección 'AcercaDeNosotros' de Firestore
   ========================================================================== */

class ComponenteSeccionAcercaDe {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento = null) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    EsFotoValida(Valor) {
        if (!Valor || typeof Valor !== "string") return false;
        const Limpio = Valor.trim().toUpperCase();
        return Limpio !== "" && Limpio !== "N-A" && Limpio !== "N/A" && Limpio !== "NA" && Limpio !== "NULL" && Limpio !== "UNDEFINED";
    }

    FormatearTextoConSaltos(Texto) {
        if (!Texto || typeof Texto !== "string") return "";
        const TextoSeguro = Texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const Parrafos = TextoSeguro.split(/\r?\n\r?\n/).filter(P => P.trim().length > 0);
        if (Parrafos.length > 1) {
            return Parrafos.map(P => `<p class="ParrafoConSalto">${P.replace(/\r?\n/g, '<br>').trim()}</p>`).join('');
        }
        return TextoSeguro.replace(/\r?\n/g, '<br>');
    }

    Renderizar() {
        const EstaSincronizando = this.ModeloAlmacenamiento && (
            !this.ModeloAlmacenamiento.DatosCargadosDesdeFirestore || 
            this.ModeloAlmacenamiento.EstaSincronizandoDatos()
        );
        const DatosAcerca = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerDatosAcercaDeNosotros()) || null;

        // Vista de carga Skeleton / Shimmer
        if (!DatosAcerca && EstaSincronizando) {
            return this.RenderizarSkeleton();
        }

        // Datos principales de la página leídos de la BD
        const TituloPagina = (DatosAcerca && DatosAcerca.TituloPagina && DatosAcerca.TituloPagina.trim())
            ? DatosAcerca.TituloPagina
            : "Acerca de Nosotros";

        const DescripcionPagina = (DatosAcerca && DatosAcerca.DescripcionPagina && DatosAcerca.DescripcionPagina.trim())
            ? DatosAcerca.DescripcionPagina
            : "Letras de mi Poblao (LMP) es una plataforma digital de difusión, rescate y preservación del patrimonio musical, poético y lírico del Beni y la Amazonía boliviana.";

        // Datos de Edna leídos exactamente de la BD
        const TieneDatosEdna = Boolean(
            DatosAcerca && (
                (DatosAcerca.NombreEdna !== undefined && DatosAcerca.NombreEdna !== null && String(DatosAcerca.NombreEdna).trim() !== "") ||
                (DatosAcerca.DescripcionEdna !== undefined && DatosAcerca.DescripcionEdna !== null && String(DatosAcerca.DescripcionEdna).trim() !== "") ||
                (DatosAcerca.FotoEdna !== undefined && DatosAcerca.FotoEdna !== null && String(DatosAcerca.FotoEdna).trim() !== "")
            )
        );
        const NombreEdna = (DatosAcerca && DatosAcerca.NombreEdna) ? DatosAcerca.NombreEdna : "Edna";
        const FotoEdna = (DatosAcerca && DatosAcerca.FotoEdna) ? DatosAcerca.FotoEdna : "";
        const DescripcionEdna = (DatosAcerca && DatosAcerca.DescripcionEdna) ? DatosAcerca.DescripcionEdna : "";
        const EdnaTieneFoto = this.EsFotoValida(FotoEdna);

        // Datos de Luci leídos exactamente de la BD
        // Si se eliminan los campos en Firestore (o están vacíos), no se renderiza el card de Luci
        const TieneDatosLuci = Boolean(
            DatosAcerca && (
                (DatosAcerca.NombreLuci !== undefined && DatosAcerca.NombreLuci !== null && String(DatosAcerca.NombreLuci).trim() !== "") ||
                (DatosAcerca.DescripcionLuci !== undefined && DatosAcerca.DescripcionLuci !== null && String(DatosAcerca.DescripcionLuci).trim() !== "") ||
                (DatosAcerca.FotoLuci !== undefined && DatosAcerca.FotoLuci !== null && String(DatosAcerca.FotoLuci).trim() !== "")
            )
        );
        const NombreLuci = (DatosAcerca && DatosAcerca.NombreLuci) ? DatosAcerca.NombreLuci : "";
        const FotoLuci = (DatosAcerca && DatosAcerca.FotoLuci) ? DatosAcerca.FotoLuci : "";
        const DescripcionLuci = (DatosAcerca && DatosAcerca.DescripcionLuci) ? DatosAcerca.DescripcionLuci : "";
        const LuciTieneFoto = this.EsFotoValida(FotoLuci);

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionAcercaDe">
            
            <!-- Hero / Banner Principal de la Sección Centrado -->
            <div class="HeroSeccionAcercaDe">
                <div class="FondoDecorativoHeroAcercaDe"></div>
                <div class="ContenidoHeroAcercaDe">
                    <h1 class="TituloPrincipalAcercaDe">${TituloPagina}</h1>
                    <div class="DescripcionPrincipalAcercaDe">${this.FormatearTextoConSaltos(DescripcionPagina)}</div>
                    
                    <div class="ChipsResumenProyecto">
                        <span class="ChipResumen"><i class="fa-solid fa-graduation-cap"></i> Proyecto de Grado IFAEL</span>
                        <span class="ChipResumen"><i class="fa-solid fa-music"></i> Técnico Superior en Música Boliviana</span>
                        <span class="ChipResumen"><i class="fa-solid fa-location-dot"></i> Trinidad, Beni - Bolivia</span>
                    </div>
                </div>
            </div>

            <!-- Sección de Integrantes del Proyecto -->
            ${(TieneDatosEdna || TieneDatosLuci) ? `
            <div class="SeccionIntegrantesEquipo">
                <div class="CabeceraSubseccionAcercaDe">
                    <h2 class="TituloSubseccion">
                        <i class="fa-solid fa-users" style="color: #0d9488;"></i> Integrantes del Proyecto
                    </h2>
                    <p class="SubtituloSubseccion">
                        Conoce a las autoras e investigadoras del proyecto Letras de mi Poblao.
                    </p>
                </div>

                <div class="GridIntegrantesAcercaDe">
                    
                    <!-- Tarjeta 1: Edna -->
                    ${TieneDatosEdna ? `
                    <div class="TarjetaIntegranteAcercaDe">
                        <div class="CabeceraTarjetaIntegrante">
                            <div class="ContenedorFotoIntegrante">
                                ${EdnaTieneFoto ? `
                                <img src="${FotoEdna}" alt="${NombreEdna}" class="FotoPerfilIntegrante" onerror="this.src='Logo1.png'">
                                ` : `
                                <div class="AvatarIntegrantePlaceholder AvatarEdna">
                                    <i class="fa-solid fa-user"></i>
                                </div>
                                `}
                            </div>
                            <div class="InfoPrincipalIntegrante">
                                <h3 class="NombreIntegrante">${NombreEdna}</h3>
                            </div>
                        </div>

                        <div class="CuerpoTarjetaIntegrante">
                            <div class="EtiquetaBiografia">
                                <i class="fa-solid fa-feather-pointed"></i> Descripción
                            </div>
                            <div class="TextoDescripcionIntegrante">${this.FormatearTextoConSaltos(DescripcionEdna || 'Sin descripción disponible.')}</div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Tarjeta 2: Luci (solo se muestra si existen datos en Firestore) -->
                    ${TieneDatosLuci ? `
                    <div class="TarjetaIntegranteAcercaDe">
                        <div class="CabeceraTarjetaIntegrante">
                            <div class="ContenedorFotoIntegrante">
                                ${LuciTieneFoto ? `
                                <img src="${FotoLuci}" alt="${NombreLuci}" class="FotoPerfilIntegrante" onerror="this.src='Logo1.png'">
                                ` : `
                                <div class="AvatarIntegrantePlaceholder AvatarLuci">
                                    <i class="fa-solid fa-user"></i>
                                </div>
                                `}
                            </div>
                            <div class="InfoPrincipalIntegrante">
                                <h3 class="NombreIntegrante">${NombreLuci}</h3>
                            </div>
                        </div>

                        <div class="CuerpoTarjetaIntegrante">
                            <div class="EtiquetaBiografia">
                                <i class="fa-solid fa-feather-pointed"></i> Descripción
                            </div>
                            <div class="TextoDescripcionIntegrante">${this.FormatearTextoConSaltos(DescripcionLuci)}</div>
                        </div>
                    </div>
                    ` : ''}

                </div>
            </div>
            ` : ''}

            <!-- Bloque Institucional y Contexto Académico -->
            <div class="TarjetaInstitucionalAcercaDe">
                <div class="IconoInstitucionalGrande">
                    <i class="fa-solid fa-building-columns"></i>
                </div>
                <div class="ContenidoInstitucionalAcercaDe">
                    <h3 class="TituloInstitucional">Instituto de Formación Artística "Edelmira Limpias" (IFAEL)</h3>
                    <p class="TextoInstitucional">
                        Este proyecto nace en el seno del IFAEL (Trinidad, Beni) como parte de la formación académica en la carrera de <strong>Técnico Superior en Música Boliviana</strong>. Nuestro propósito es proveer a músicos, estudiantes, docentes y a la comunidad en general una herramienta moderna para explorar las letras con acordes, ritmos benianos tradicionales (Taquirari, Chovena, Machetero, Polca, Caluyo) y partituras de nuestros grandes maestros compositores.
                    </p>
                    <div class="AccionesInstitucionalesAcercaDe">
                        <button class="BotonAccionAcercaDe BotonIrCanciones" data-pestana="canciones">
                            <i class="fa-solid fa-scroll"></i> Explorar Cancionero
                        </button>
                        <button class="BotonAccionAcercaDe BotonIrIFAEL" data-pestana="ifael">
                            <i class="fa-solid fa-building-columns"></i> Ver Perfil IFAEL
                        </button>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    RenderizarSkeleton() {
        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionAcercaDe">
            <!-- Hero Skeleton -->
            <div class="HeroSeccionAcercaDe" style="min-height: 180px;">
                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 140px; height: 26px; border-radius: var(--RadioBotonPill); margin-bottom: 14px;"></div>
                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 60%; height: 32px; margin-bottom: 12px;"></div>
                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 90%; height: 16px; margin-bottom: 8px;"></div>
                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 75%; height: 16px;"></div>
            </div>

            <!-- Cards Skeleton -->
            <div style="margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                <div class="ElementoShimmerLMP" style="height: 220px; border-radius: var(--RadioMediano);"></div>
                <div class="ElementoShimmerLMP" style="height: 220px; border-radius: var(--RadioMediano);"></div>
            </div>

            <!-- Footer Card Skeleton -->
            <div class="ElementoShimmerLMP" style="height: 140px; border-radius: var(--RadioMediano); margin-top: 24px;"></div>
        </div>
        `;
    }
}

window.ComponenteSeccionAcercaDe = ComponenteSeccionAcercaDe;
