/* ==========================================================================
   COMPONENTE: SECCIÓN ARTISTAS Y COMPOSITORES BENIANOS
   Galería de Artistas y Página de Biografía Dedicada
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionArtistas {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ArtistaSeleccionadoId = null;
    }

    EstablecerArtistaActivo(IdArtista) {
        this.ArtistaSeleccionadoId = IdArtista;
    }

    LimpiarArtistaActivo() {
        this.ArtistaSeleccionadoId = null;
    }

    Renderizar() {
        if (this.ArtistaSeleccionadoId) {
            return this.RenderizarPaginaBiografia(this.ArtistaSeleccionadoId);
        }
        return this.RenderizarGaleria();
    }

    // #region 1. Vista Galería de Artistas
    RenderizarGaleria() {
        const Artistas = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosArtistas()) || [];

        if (!Artistas || Artistas.length === 0) {
            const EstaSincronizando = this.ModeloAlmacenamiento && typeof this.ModeloAlmacenamiento.EstaSincronizandoDatos === "function" && this.ModeloAlmacenamiento.EstaSincronizandoDatos();
            if (EstaSincronizando) {
                return `
                <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionArtistas">
                    <div style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                        <div class="ElementoShimmerLMP" style="height: 120px; border-radius: var(--RadioMediano);"></div>
                        <div class="ElementoShimmerLMP" style="height: 120px; border-radius: var(--RadioMediano);"></div>
                    </div>
                </div>`;
            }
            return `
            <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionArtistas">
                <!-- Encabezado de la Sección Compacto -->
                <div class="CabeceraSeccionPrincipal CabeceraSeccionArtistas">
                    <div class="ContenedorEncabezadoArtistas">
                        <div class="TextosEncabezadoArtistas">
                            <h1 class="TituloSeccionGrande">
                                <i class="fa-solid fa-users" style="color: var(--ColorPrimarioAzul);"></i>
                                <span>Artistas & Compositores</span>
                            </h1>
                            <p class="DescripcionSeccionSubtitulo">
                                Músicos y creadores del Beni
                            </p>
                        </div>
                        <button class="BotonAccionPrimario BotonAbrirModalNuevoArtista BotonRegistrarArtistaEncabezado" title="Registrar nuevo artista">
                            <i class="fa-solid fa-plus"></i>
                            <span>Registrar</span>
                        </button>
                    </div>
                </div>
                <div style="background-color: var(--ColorFondoSuperficie); padding: 50px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave);">
                    <i class="fa-solid fa-users" style="font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.6;"></i>
                    <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">No hay artistas registrados</div>
                    <p style="font-size: 13px; margin-top: 4px;">Sé el primero en registrar un gran compositor beniano.</p>
                </div>
            </div>`;
        }

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionArtistas">
            <!-- Encabezado de la Sección Compacto -->
            <div class="CabeceraSeccionPrincipal CabeceraSeccionArtistas">
                <div class="ContenedorEncabezadoArtistas">
                    <div class="TextosEncabezadoArtistas">
                        <h1 class="TituloSeccionGrande">
                            <i class="fa-solid fa-users" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Artistas & Compositores</span>
                        </h1>
                        <p class="DescripcionSeccionSubtitulo">
                            Músicos y creadores del Beni
                        </p>
                    </div>
                    <button class="BotonAccionPrimario BotonAbrirModalNuevoArtista BotonRegistrarArtistaEncabezado" title="Registrar nuevo artista">
                        <i class="fa-solid fa-plus"></i>
                        <span>Registrar</span>
                    </button>
                </div>
            </div>

            <!-- Cuadrícula de Tarjetas de la Galería -->
            <div class="CuadriculaArtistasGaleria" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px;">
                ${Artistas.map(Artista => this.RenderizarTarjetaArtista(Artista)).join('')}
            </div>
        </div>`;
    }

    RenderizarTarjetaArtista(Artista) {
        const FotoMostrar = Artista.FotoPerfil || Artista.FotoPerfilUrl || 'Logo1.png';
        const NombreMostrar = Artista.NombreCompleto || '';
        const SubtituloMostrar = Artista.NombreArtistico || Artista.RolTitulo || '';
        const Trayectoria = Artista.TrayectoriaAnos ? `${Artista.TrayectoriaAnos} años` : '';
        const Lugar = Artista.LugarNacimiento || Artista.LugarOrigen || '';

        return `
        <article class="TarjetaArtistaGaleria">
            <!-- Foto de Perfil a la Izquierda -->
            <div class="ContenedorAvatarTarjetaArtista">
                <img src="${FotoMostrar}" alt="${NombreMostrar}" class="AvatarTarjetaArtista" onerror="this.src='Logo1.png'">
            </div>

            <!-- Información a la Derecha (Compacta en altura) -->
            <div class="InfoTarjetaArtista">
                <div class="TextosPrincipalesArtista">
                    <h3 class="NombreArtistaTarjeta">${NombreMostrar}</h3>
                    ${SubtituloMostrar ? `<div class="SubtituloArtistaTarjeta">${SubtituloMostrar}</div>` : ''}
                </div>

                ${(Trayectoria || Lugar) ? `
                <div class="InsigniasArtistaTarjeta">
                    ${Trayectoria ? `
                    <span class="InsigniaPillArtista">
                        <i class="fa-solid fa-award"></i>${Trayectoria}
                    </span>` : ''}
                    ${Lugar ? `
                    <span class="InsigniaPillArtista">
                        <i class="fa-solid fa-location-dot" style="color: var(--ColorVerdeBeni);"></i>${Lugar}
                    </span>` : ''}
                </div>` : ''}

                <div class="AccionTarjetaArtista">
                    <button class="BotonAccionPrimario BotonVerBiografiaArtista BotonVerBioCompacto" data-artista-id="${Artista.IdArtista}">
                        <i class="fa-solid fa-book-open"></i>
                        <span>Ver Biografía</span>
                    </button>
                </div>
            </div>
        </article>`;
    }
    // #endregion

    // #region 2. Vista Dedicada: Página de Biografía ("Otra Paginita", Sin Modales)
    RenderizarPaginaBiografia(IdArtista) {
        const Artista = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerArtistaPorId(IdArtista)) 
            || (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosArtistas()[0]);

        if (!Artista) {
            this.LimpiarArtistaActivo();
            return this.RenderizarGaleria();
        }

        const FotoMostrar = Artista.FotoPerfil || Artista.FotoPerfilUrl || 'Logo1.png';
        const NombreMostrar = Artista.NombreCompleto || '';
        const NombreArtistico = Artista.NombreArtistico || '';
        const Instrumentos = Array.isArray(Artista.Instrumentos) ? Artista.Instrumentos : (Artista.Instrumentos ? [Artista.Instrumentos] : []);
        const ObrasDestacadas = Array.isArray(Artista.ObrasDestacadas) ? Artista.ObrasDestacadas : (Artista.ObrasDestacadas ? [Artista.ObrasDestacadas] : []);

        // Canciones asociadas al artista en la app
        const CancionesDelArtista = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodasLasCanciones())
            ? this.ModeloAlmacenamiento.ObtenerTodasLasCanciones().filter(C => 
                (C.Autor && NombreMostrar && C.Autor.toLowerCase().includes(NombreMostrar.toLowerCase())) ||
                (C.Autor && NombreArtistico && C.Autor.toLowerCase().includes(NombreArtistico.toLowerCase()))
              )
            : [];

        return `
        <div class="ContenedorVistaSeccion PaginaBiografiaArtistaDedicada" id="PaginaBiografiaArtistaDedicada">
            
            <!-- Barra Superior de Navegación: Retorno a la Galería -->
            <div style="margin-bottom: 14px;">
                <button class="BotonAccionSecundario BotonVolverGaleriaArtistas" style="padding: 7px 16px; font-size: 13px; font-weight: 700; border-radius: var(--RadioPequeno); display: inline-flex; align-items: center; gap: 7px;">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Volver a la Galería</span>
                </button>
            </div>

            <!-- Cabecera Visual Horizontal y Compacta (Foto a la Izquierda, Información a la Derecha) -->
            <div class="TarjetaCabeceraBiografia">
                <div class="ContenedorAvatarCabeceraBiografia">
                    <img src="${FotoMostrar}" alt="${NombreMostrar}" class="AvatarCabeceraBiografia" onerror="this.src='Logo1.png'">
                </div>

                <div class="InfoCabeceraBiografia">
                    <h1 class="NombreCabeceraBiografia">${NombreMostrar}</h1>

                    ${NombreArtistico ? `
                    <div class="SubtituloCabeceraBiografia">${NombreArtistico}</div>
                    ` : ''}

                    ${(Artista.RolTitulo || Artista.Institucion) ? `
                    <div class="DetalleCabeceraBiografia">
                        ${[Artista.RolTitulo, Artista.Institucion].filter(Boolean).join(' • ')}
                    </div>
                    ` : ''}

                    ${Artista.TrayectoriaAnos ? `
                    <div>
                        <span class="InsigniaTrayectoriaBiografia">
                            <i class="fa-solid fa-award"></i>${Artista.TrayectoriaAnos} Años de Trayectoria
                        </span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Ficha Técnica de Información Básica (Chips Grid) -->
            <div class="BloqueFichaTecnicaArtista" style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 22px 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta); margin-bottom: 24px;">
                <div style="font-size: 15px; font-weight: 800; color: var(--ColorPrimarioAzul); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--ColorBordeDivisor); padding-bottom: 10px;">
                    <i class="fa-solid fa-id-card-clip"></i> Ficha Técnica e Información Básica
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                    <div style="background: var(--ColorFondoSecundario); padding: 12px 14px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ColorTextoSecundario); font-weight: 700; margin-bottom: 4px;">Nombre Completo</div>
                        <div style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal); word-break: break-word;">${NombreMostrar || 'No registrado'}</div>
                    </div>

                    <div style="background: var(--ColorFondoSecundario); padding: 12px 14px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ColorTextoSecundario); font-weight: 700; margin-bottom: 4px;">Nombre Artístico / Apodo</div>
                        <div style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal); word-break: break-word;">${NombreArtistico || 'No registrado'}</div>
                    </div>

                    <div style="background: var(--ColorFondoSecundario); padding: 12px 14px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ColorTextoSecundario); font-weight: 700; margin-bottom: 4px;">Fecha de Nacimiento</div>
                        <div style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal); word-break: break-word;">${Artista.FechaNacimiento || 'No registrada'}</div>
                    </div>

                    <div style="background: var(--ColorFondoSecundario); padding: 12px 14px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ColorTextoSecundario); font-weight: 700; margin-bottom: 4px;">Lugar de Nacimiento</div>
                        <div style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal); word-break: break-word;">${Artista.LugarNacimiento || Artista.LugarOrigen || 'No registrado'}</div>
                    </div>

                    <div style="background: var(--ColorFondoSecundario); padding: 12px 14px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor); grid-column: 1 / -1;">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ColorTextoSecundario); font-weight: 700; margin-bottom: 4px;">Géneros y Disciplinas</div>
                        <div style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal); word-break: break-word;">${Artista.GeneroMusical || Artista.Especialidad || 'No registrado'}</div>
                    </div>
                </div>

                ${Instrumentos.length > 0 ? `
                <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--ColorBordeDivisor);">
                    <div style="font-size: 12px; font-weight: 700; color: var(--ColorTextoSecundario); margin-bottom: 8px;">Instrumentos Principales:</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${Instrumentos.map(Inst => `
                        <span style="font-size: 12px; padding: 5px 12px; border-radius: 12px; background: rgba(24, 119, 242, 0.1); color: var(--ColorPrimarioAzul); font-weight: 600; border: 1px solid rgba(24, 119, 242, 0.25);">
                            <i class="fa-solid fa-guitar" style="margin-right: 5px;"></i>${Inst}
                        </span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Cuerpo Biográfico en Bloques Claros y Legibles -->
            <div class="ContenedorBloquesBiograficos" style="display: flex; flex-direction: column; gap: 20px;">

                <!-- 1. Biografía General -->
                ${Artista.Biografia ? `
                <div class="BloqueBiograficoItem" style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta);">
                    <h2 style="font-size: 17px; font-weight: 800; color: var(--ColorTextoPrincipal); margin: 0 0 12px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-book-open" style="color: var(--ColorPrimarioAzul);"></i>
                        <span>1. Biografía General</span>
                    </h2>
                    <p style="font-size: 14px; line-height: 1.7; color: var(--ColorTextoPrincipal); margin: 0; text-align: justify;">
                        ${Artista.Biografia}
                    </p>
                </div>
                ` : ''}

                <!-- 2. Inicios Musicales -->
                ${Artista.Inicios ? `
                <div class="BloqueBiograficoItem" style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta);">
                    <h2 style="font-size: 17px; font-weight: 800; color: var(--ColorTextoPrincipal); margin: 0 0 12px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-seedling" style="color: var(--ColorVerdeBeni);"></i>
                        <span>2. Inicios en la Música</span>
                    </h2>
                    <p style="font-size: 14px; line-height: 1.7; color: var(--ColorTextoPrincipal); margin: 0; text-align: justify;">
                        ${Artista.Inicios}
                    </p>
                </div>
                ` : ''}

                <!-- 3. Trayectoria y Hitos Clave -->
                ${Artista.Trayectoria ? `
                <div class="BloqueBiograficoItem" style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta);">
                    <h2 style="font-size: 17px; font-weight: 800; color: var(--ColorTextoPrincipal); margin: 0 0 12px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-trophy" style="color: #d97706;"></i>
                        <span>3. Trayectoria y Momentos Destacados</span>
                    </h2>
                    <p style="font-size: 14px; line-height: 1.7; color: var(--ColorTextoPrincipal); margin: 0; text-align: justify;">
                        ${Artista.Trayectoria}
                    </p>
                </div>
                ` : ''}

                <!-- 4. Obras Destacadas -->
                ${ObrasDestacadas.length > 0 ? `
                <div class="BloqueBiograficoItem" style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta);">
                    <h2 style="font-size: 17px; font-weight: 800; color: var(--ColorTextoPrincipal); margin: 0 0 14px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-music" style="color: #8b5cf6;"></i>
                        <span>4. Obras y Composiciones Destacadas</span>
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
                        ${ObrasDestacadas.map(Obra => `
                        <div style="background: var(--ColorFondoSecundario); padding: 12px 16px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor); display: flex; align-items: center; gap: 10px;">
                            <i class="fa-solid fa-record-vinyl" style="color: var(--ColorPrimarioAzul); font-size: 18px;"></i>
                            <span style="font-size: 13.5px; font-weight: 600; color: var(--ColorTextoPrincipal);">${Obra}</span>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- 5. Legado y Reconocimientos -->
                ${Artista.Legado ? `
                <div class="BloqueBiograficoItem" style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta);">
                    <h2 style="font-size: 17px; font-weight: 800; color: var(--ColorTextoPrincipal); margin: 0 0 12px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-landmark" style="color: var(--ColorPrimarioAzul);"></i>
                        <span>5. Legado e Impacto para la Música Boliviana</span>
                    </h2>
                    <p style="font-size: 14px; line-height: 1.7; color: var(--ColorTextoPrincipal); margin: 0; text-align: justify;">
                        ${Artista.Legado}
                    </p>
                </div>
                ` : ''}

                <!-- 6. Cita Célebre -->
                ${Artista.CitaCelebre ? `
                <div class="BloqueCitaCelebreArtista" style="background: linear-gradient(135deg, rgba(24, 119, 242, 0.08), rgba(4, 120, 87, 0.08)); border-radius: var(--RadioMediano); padding: 24px 30px; border-left: 5px solid var(--ColorPrimarioAzul); box-shadow: var(--SombraTarjeta); margin-top: 4px;">
                    <i class="fa-solid fa-quote-left" style="font-size: 26px; color: var(--ColorPrimarioAzul); opacity: 0.5; display: block; margin-bottom: 8px;"></i>
                    <blockquote style="margin: 0; font-size: 15.5px; font-style: italic; font-weight: 500; line-height: 1.6; color: var(--ColorTextoPrincipal);">
                        «${Artista.CitaCelebre}»
                    </blockquote>
                    <div style="margin-top: 10px; font-size: 13px; font-weight: 700; color: var(--ColorPrimarioAzul); text-align: right;">
                        — ${NombreMostrar}
                    </div>
                </div>
                ` : ''}

                <!-- Canciones Asociadas en el Cancionero de LMP -->
                ${CancionesDelArtista.length > 0 ? `
                <div style="background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); padding: 24px; border: 1px solid var(--ColorBordeSuave); box-shadow: var(--SombraTarjeta);">
                    <h2 style="font-size: 17px; font-weight: 800; color: var(--ColorTextoPrincipal); margin: 0 0 14px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-guitar" style="color: var(--ColorVerdeBeni);"></i>
                        <span>Canciones Registradas en Letras Mi Poblau (${CancionesDelArtista.length})</span>
                    </h2>
                    <div class="CuadriculaTarjetasMusicales">
                        ${CancionesDelArtista.map(Cancion => `
                        <div class="TarjetaMusicalItem">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <div style="font-size: 15px; font-weight: 700; color: var(--ColorTextoPrincipal);">${Cancion.Titulo}</div>
                                    <div style="font-size: 12px; color: var(--ColorTextoSecundario); margin-top: 2px;">Ritmo: ${Cancion.Genero}</div>
                                </div>
                                <span class="InsigniaTono">${Cancion.TonoOriginal}</span>
                            </div>
                            <p style="font-size: 12.5px; color: var(--ColorTextoSecundario); line-height: 1.4; margin: 8px 0;">
                                ${Cancion.Descripcion || 'Composición beniana registrada.'}
                            </p>
                            <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--ColorBordeDivisor);">
                                <button class="BotonAccionPrimario BotonReproducirTarjeta" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 12.5px;">
                                    <i class="fa-solid fa-play" style="margin-right: 6px;"></i>Escuchar
                                </button>
                                <button class="BotonAccionSecundario BotonAbrirModalLetra" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 12.5px;">
                                    <i class="fa-solid fa-scroll" style="margin-right: 6px;"></i>Ver Letra
                                </button>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Botón Inferior para Regresar -->
                <div style="text-align: center; margin-top: 10px; margin-bottom: 20px;">
                    <button class="BotonAccionSecundario BotonVolverGaleriaArtistas" style="padding: 11px 24px; font-size: 14px; font-weight: 700; border-radius: var(--RadioPequeno); display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Volver a la Galería de Artistas</span>
                    </button>
                </div>

            </div>
        </div>`;
    }
    // #endregion
}

window.ComponenteSeccionArtistas = ComponenteSeccionArtistas;
