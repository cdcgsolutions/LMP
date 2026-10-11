/* ==========================================================================
   COMPONENTE: SECCIÓN INICIO / REVISTA Y PORTAL CULTURAL DE GRADO
   Letras de Mi Poblao (LMP) - IFAEL Trinidad, Beni
   ========================================================================== */

class ComponenteSeccionInicio {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const TotalCanciones = (this.ModeloAlmacenamiento.ObtenerTodasLasCanciones() || []).length;
        const TotalGeneros = (this.ModeloAlmacenamiento.ObtenerTodosLosGeneros() || []).length;
        const TotalArtistas = (this.ModeloAlmacenamiento.ObtenerTodosLosArtistas ? this.ModeloAlmacenamiento.ObtenerTodosLosArtistas() : []).length;
        const CancionHimno = this.ModeloAlmacenamiento.ObtenerHimnoAlBeni();

        return `
        <div class="ContenedorVistaSeccion ContenedorSeccionInicioPortal" id="ContenedorSeccionInicioPortal">
            <!-- 1. Hero Banner Institucional de Alto Impacto -->
            <section class="BannerHeroInstitucional">
                <div class="FondoHeroDecorativo"></div>
                <div class="ContenidoHeroInstitucional">
                    <div class="EscudosHeroFila">
                        <img src="LogoInicialesSinFondoBlanco.png" alt="LMP" class="LogoHeroPrincipal" onerror="this.src='Logo1.png'">
                        <span class="SeparadorHeroDivisor"></span>
                        <img src="IFAEL.jpg" alt="IFAEL" class="LogoHeroIFAEL" onerror="this.src='Logo1.png'">
                    </div>
                    
                    <div class="InsigniaProyectoBadge">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <span>Proyecto Artístico de Grado • IFAEL Trinidad</span>
                    </div>

                    <h1 class="TituloHeroPrincipal">Letras de Mi Poblao</h1>
                    
                    <p class="SubtituloHeroPrincipal">
                        Archivo digital interactivo para la preservación, rescate y difusión de las composiciones, letras, partituras y ritmos patrimoniales de la Santísima Trinidad y el Departamento del Beni.
                    </p>

                    <!-- Métricas / Contadores Rápidos -->
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin: 4px 0 10px 0;">
                        <span style="background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); padding: 5px 14px; border-radius: var(--RadioBotonPill); font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.25);">
                            <i class="fa-solid fa-music" style="margin-right: 5px; color: #fef08a;"></i>${TotalCanciones} Obras Catalogadas
                        </span>
                        <span style="background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); padding: 5px 14px; border-radius: var(--RadioBotonPill); font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.25);">
                            <i class="fa-solid fa-guitar" style="margin-right: 5px; color: #86efac;"></i>${TotalGeneros} Ritmos Benianos
                        </span>
                        <span style="background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); padding: 5px 14px; border-radius: var(--RadioBotonPill); font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.25);">
                            <i class="fa-solid fa-users" style="margin-right: 5px; color: #c4b5fd;"></i>${TotalArtistas} Compositores
                        </span>
                        <span style="background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); padding: 5px 14px; border-radius: var(--RadioBotonPill); font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.25);">
                            <i class="fa-solid fa-book-open" style="margin-right: 5px; color: #fde047;"></i>Consulta 100% Libre
                        </span>
                    </div>

                    <div class="BotonesAccionHero">
                        <button class="BotonHeroPrimario" data-pestana="canciones">
                            <i class="fa-solid fa-scroll"></i>
                            <span>Explorar Cancionero & Acordes</span>
                        </button>
                        <button class="BotonHeroSecundario" data-pestana="partituras">
                            <i class="fa-solid fa-file-audio"></i>
                            <span>Ver Archivo de Partituras</span>
                        </button>
                    </div>
                </div>
            </section>

            <!-- 2. Presentación y Justificación Académica (Proyecto de Grado) -->
            <section class="TarjetaBloqueInformativo">
                <div class="CabeceraBloqueInformativo">
                    <div class="IconoContenedorVerde">
                        <i class="fa-solid fa-landmark"></i>
                    </div>
                    <div>
                        <h2 class="TituloBloqueTexto">Patrimonio Sonoro de la Tierra Mojeña</h2>
                        <span class="SubtituloBloqueTexto">Investigación y digitalización del Instituto de Formación Artística "Edelmira Limpias" (IFAEL)</span>
                    </div>
                </div>
                <div class="CuerpoTextoInformativo">
                    <p>
                        Esta plataforma, <strong>Letras de Mi Poblao (LMP)</strong>, nace como una propuesta artística y documental dentro de la carrera de <strong>Técnico Superior en Música Boliviana</strong> del <strong>Instituto IFAEL</strong> en la ciudad de Trinidad, capital del departamento del Beni, bajo la autoría e investigación de <strong>Edna Miriam Edgley Cuellar</strong>.
                    </p>
                    <p>
                        Ante el riesgo de pérdida o dispersión de las partituras tradicionales y la tradición oral de nuestra región, este proyecto construye un <strong>puente digital interactivo</strong> que reúne:
                    </p>
                    <ul style="margin: 10px 0 16px 24px; color: var(--ColorTextoSecundario); font-size: 14.5px; line-height: 1.8;">
                        <li><strong>Cancionero interactivo</strong> con acordes tonales y función de transposición armónica (+/- semitonos).</li>
                        <li><strong>Manuscritos y partituras patrimoniales digitalizadas</strong> con visor de zoom para estudiantes y concertistas.</li>
                        <li><strong>Monografías rítmicas</strong> de Taquirari, Chovena, Carnavalito y la Danza Ceremonial de Macheteros.</li>
                        <li><strong>Fichas biográficas</strong> de los compositores y maestros que marcaron la historia musical del oriente boliviano.</li>
                    </ul>
                    <div class="CitaDestacadaPortal">
                        <i class="fa-solid fa-quote-left"></i>
                        <span>«El Beni no sólo se mira; el Beni se canta y se siente en el alma de sus compases. Mantener viva la memoria musical de nuestro pueblo es honrar nuestra identidad.»</span>
                    </div>
                </div>
            </section>

            <!-- 3. Módulos del Catálogo (Navegación Visual en Cuadrícula) -->
            <section class="SeccionCatalogoModulos">
                <div class="EncabezadoSeccionModulos">
                    <h3 class="TituloSeccionNormal">Colecciones y Archivos Documentales</h3>
                    <span class="TextoSecundario">Selecciona un área para comenzar tu exploración</span>
                </div>

                <div class="RejillaModulosPortal">
                    <!-- Tarjeta 1: Cancionero -->
                    <div class="TarjetaModuloItem" data-pestana="canciones">
                        <div class="IconoModuloGrande IconoVerde">
                            <i class="fa-solid fa-scroll"></i>
                        </div>
                        <div class="ContenidoModuloItem">
                            <h4 class="TituloModuloItem">Cancionero & Acordes</h4>
                            <p class="DescripcionModuloItem">Letras tradicionales con acordes, auto-scroll para instrumentistas, transpositor tonal en vivo y reproductor.</p>
                            <span class="EnlaceAccionModulo">
                                <span>Ver ${TotalCanciones} canciones</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Tarjeta 2: Partituras -->
                    <div class="TarjetaModuloItem" data-pestana="partituras">
                        <div class="IconoModuloGrande IconoTeal">
                            <i class="fa-solid fa-file-audio"></i>
                        </div>
                        <div class="ContenidoModuloItem">
                            <h4 class="TituloModuloItem">Partituras Digitales</h4>
                            <p class="DescripcionModuloItem">Archivo fotográfico y documental de partituras del IFAEL con visor de alta definición y descarga directa.</p>
                            <span class="EnlaceAccionModulo">
                                <span>Consultar catálogo</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Tarjeta 3: Géneros -->
                    <div class="TarjetaModuloItem" data-pestana="generos">
                        <div class="IconoModuloGrande IconoDorado">
                            <i class="fa-solid fa-guitar"></i>
                        </div>
                        <div class="ContenidoModuloItem">
                            <h4 class="TituloModuloItem">Ritmos Tradicionales</h4>
                            <p class="DescripcionModuloItem">Historia, compases sincopados, tempo e instrumentación típica de las danzas y canciones benianas.</p>
                            <span class="EnlaceAccionModulo">
                                <span>Explorar ${TotalGeneros} ritmos</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Tarjeta 4: Artistas -->
                    <div class="TarjetaModuloItem" data-pestana="artistas">
                        <div class="IconoModuloGrande IconoPurpura">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div class="ContenidoModuloItem">
                            <h4 class="TituloModuloItem">Grandes Compositores</h4>
                            <p class="DescripcionModuloItem">Biografías, galardones, grabaciones y discografía de maestros que inmortalizaron el pentagrama del Beni.</p>
                            <span class="EnlaceAccionModulo">
                                <span>Conocer ${TotalArtistas} maestros</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Tarjeta 5: IFAEL -->
                    <div class="TarjetaModuloItem" data-pestana="ifael">
                        <div class="IconoModuloGrande IconoRojo">
                            <i class="fa-solid fa-building-columns"></i>
                        </div>
                        <div class="ContenidoModuloItem">
                            <h4 class="TituloModuloItem">Instituto IFAEL</h4>
                            <p class="DescripcionModuloItem">Reseña del Instituto Edelmira Limpias, formación técnica musical, contacto y ubicación interactiva en Trinidad.</p>
                            <span class="EnlaceAccionModulo">
                                <span>Ver institución</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>

                    <!-- Tarjeta 6: Acerca de Nosotros -->
                    <div class="TarjetaModuloItem" data-pestana="acerca-de">
                        <div class="IconoModuloGrande IconoVerdeClaro">
                            <i class="fa-solid fa-circle-info"></i>
                        </div>
                        <div class="ContenidoModuloItem">
                            <h4 class="TituloModuloItem">Acerca del Proyecto</h4>
                            <p class="DescripcionModuloItem">Ficha técnica del proyecto de grado, objetivos de rescate patrimonial y contacto con la investigadora.</p>
                            <span class="EnlaceAccionModulo">
                                <span>Memoria académica</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Obra Símbolo Departamental: Himno al Beni -->
            ${CancionHimno ? `
            <section class="TarjetaObraDestacada">
                <div class="ContenidoObraDestacadaTexto">
                    <span class="EtiquetaObraSimbólica">Símbolo Cívico y Departamental</span>
                    <h3 class="TituloObraDestacada">Himno al Beni</h3>
                    <p class="SubtituloObraDestacada">Letra: Alfredo Pereyra L. • Música: Rafael Seghers • Tono: Mi Bemol Mayor</p>
                    <p class="DescripcionObraDestacada">
                        «Canta victorioso pueblo de leyenda tu himno de trabajo, libertad y unión...» Máxima expresión poética y cívica que exalta el coraje y la riqueza natural de los llanos benianos.
                    </p>
                    <div class="BotonesAccionObraDestacada">
                        <button class="BotonReproducirHimnoDirecto" id="BotonReproducirHimnoDesdeInicio">
                            <i class="fa-solid fa-play"></i>
                            <span>Escuchar Himno</span>
                        </button>
                        <button class="BotonVerLetraHimnoDirecto" data-accion="ver-letra-himno">
                            <i class="fa-solid fa-scroll"></i>
                            <span>Ver Letra con Acordes</span>
                        </button>
                        ${CancionHimno.ImagenPartituraUrl ? `
                        <button class="BotonVerPartituraHimnoDirecto" data-accion="ver-partitura-himno">
                            <i class="fa-solid fa-file-lines"></i>
                            <span>Ver Partitura Oficial</span>
                        </button>
                        ` : ''}
                    </div>
                </div>
                <div class="IlustracionObraDestacada">
                    <img src="LogoIniciales.png" alt="Himno al Beni" class="ImagenIlustracionDestacada" onerror="this.src='Logo1.png'">
                </div>
            </section>
            ` : ''}
        </div>
        `;
    }
}

window.ComponenteSeccionInicio = ComponenteSeccionInicio;
