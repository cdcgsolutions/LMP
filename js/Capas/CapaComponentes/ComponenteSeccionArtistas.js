/* ==========================================================================
   COMPONENTE: SECCIÓN ARTISTAS Y COMPOSITORES (PERFILES FB)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionArtistas {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const Artistas = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosArtistas()) || [];
        if (!Artistas || Artistas.length === 0) {
            const EstaSincronizando = this.ModeloAlmacenamiento && typeof this.ModeloAlmacenamiento.EstaSincronizandoDatos === "function" && this.ModeloAlmacenamiento.EstaSincronizandoDatos();
            if (EstaSincronizando) {
                return `
                <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionArtistas">
                    <div class="TarjetaPerfilIFAEL" style="overflow: hidden; background: var(--ColorFondoSuperficie); border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeSuave);">
                        <div class="ElementoShimmerLMP" style="width: 100%; height: 200px;"></div>
                        <div style="padding: 20px; display: flex; gap: 16px; align-items: flex-end; margin-top: -50px;">
                            <div class="ElementoShimmerLMP" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid var(--ColorFondoSuperficie); flex-shrink: 0;"></div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;">
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 50%; height: 20px;"></div>
                                <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 30%; height: 12px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }
            return `
            <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionArtistas">
                <div style="background-color: var(--ColorFondoSuperficie); padding: 50px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave); margin-top: 20px;">
                    <i class="fa-solid fa-users" style="font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.6;"></i>
                    <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">No hay artistas registrados</div>
                    <p style="font-size: 13px; margin-top: 4px;">Aún no se han registrado artistas ni compositores en la base de datos.</p>
                </div>
            </div>`;
        }

        const ArtistaPrincipal = Artistas[0] || {};
        const CancionesDelArtista = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones()
            .filter(C => C.Autor && ArtistaPrincipal.NombreCompleto && C.Autor.toLowerCase().includes(ArtistaPrincipal.NombreCompleto.toLowerCase()));

        const UsuarioActual = this.ServicioEstado ? this.ServicioEstado.ObtenerUsuarioActual() : null;
        const EsUsuarioLogueado = UsuarioActual && !UsuarioActual.EsInvitado;
        const EsPerfilPropio = EsUsuarioLogueado && ArtistaPrincipal.NombreCompleto && 
            (UsuarioActual.Nombre.trim().toLowerCase() === ArtistaPrincipal.NombreCompleto.trim().toLowerCase() || ArtistaPrincipal.NombreCompleto.toLowerCase().includes(UsuarioActual.Nombre.toLowerCase()));

        const FotoPortadaMostrar = (EsPerfilPropio && UsuarioActual.FotoPortada) 
            ? UsuarioActual.FotoPortada 
            : (ArtistaPrincipal.FotoPortada || 'Logo1.png');

        const FotoPerfilMostrar = (EsPerfilPropio && UsuarioActual.FotoPerfil) 
            ? UsuarioActual.FotoPerfil 
            : (ArtistaPrincipal.FotoPerfil || 'Logo1.png');

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionArtistas">
            <!-- 1. Portada y Perfil Estilo Facebook de Artista Destacada -->
            <div class="TarjetaPerfilIFAEL">
                <div class="PortadaInstitucionIFAEL">
                    <img src="${FotoPortadaMostrar}" alt="Portada" class="ImagenPortadaInstitucion" onerror="this.src='Logo1.png'">
                </div>

                <div class="CuerpoPerfilInstitucion">
                    <div class="FilaAvatarYDatosPrincipales">
                        <div class="ContenedorAvatarFlotantePerfil">
                            <img src="${FotoPerfilMostrar}" alt="${ArtistaPrincipal.NombreCompleto}" class="AvatarInstitucionGrande" onerror="this.src='Logo1.png'">
                        </div>
                        <div class="DatosTextoInstitucion">
                            <h1 class="NombreInstitucionGrande">
                                <span>${ArtistaPrincipal.NombreCompleto}</span>
                                ${(this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EsUsuarioVerificado(ArtistaPrincipal.NombreCompleto, ArtistaPrincipal.EsVerificado === true)) ? '<span class="InsigniaVerificada" title="Artista e Investigadora Destacada"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                            </h1>
                            <div class="SubtituloInstitucion">${ArtistaPrincipal.RolTitulo} • ${ArtistaPrincipal.Institucion}</div>
                            <div class="MetaDetalleInstitucion">
                                <i class="fa-solid fa-users" style="margin-right: 4px;"></i>${ArtistaPrincipal.Seguidores} seguidores • ${ArtistaPrincipal.PublicacionesCantidad} obras registradas
                            </div>
                        </div>

                        <div class="BotonesAccionPerfilInstitucion">
                            <button class="BotonAccionPrimario" id="BotonSeguirArtista">
                                <i class="fa-solid fa-user-plus" style="margin-right: 6px;"></i>Seguir
                            </button>
                            <button class="BotonAccionSecundario" id="BotonMensajeArtista">
                                <i class="fa-solid fa-comment" style="margin-right: 6px;"></i>Mensaje
                            </button>
                        </div>
                    </div>

                    <!-- Ficha Biográfica e Información Personal -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--ColorBordeDivisor);">
                        <div style="background-color: var(--ColorFondoSecundario); padding: 14px; border-radius: var(--RadioMediano);">
                            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);"><i class="fa-solid fa-thumbtack" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Datos Biográficos:</div>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--ColorTextoSecundario);">
                                <li><i class="fa-solid fa-cake-candles" style="margin-right: 6px; width: 16px;"></i><strong>Nacimiento:</strong> ${ArtistaPrincipal.FechaNacimiento}</li>
                                <li><i class="fa-solid fa-location-dot" style="margin-right: 6px; width: 16px;"></i><strong>Origen:</strong> ${ArtistaPrincipal.LugarOrigen}</li>
                                <li><i class="fa-solid fa-graduation-cap" style="margin-right: 6px; width: 16px;"></i><strong>Especialidad:</strong> ${ArtistaPrincipal.Especialidad}</li>
                            </ul>
                        </div>

                        <div style="background-color: var(--ColorFondoSecundario); padding: 14px; border-radius: var(--RadioMediano);">
                            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--ColorTextoPrincipal);"><i class="fa-solid fa-book-open" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Reseña y Trayectoria:</div>
                            <p style="font-size: 13px; color: var(--ColorTextoPrincipal); line-height: 1.4;">
                                ${ArtistaPrincipal.Biografia}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Obras y Músicas Escritas por el Artista -->
            <div class="CabeceraSeccionPrincipal" style="margin-top: 10px;">
                <div>
                    <h2 class="TituloSeccionGrande" style="font-size: 20px;"><i class="fa-solid fa-music" style="color: var(--ColorPrimarioAzul); margin-right: 8px;"></i>Músicas Escritas y Composiciones</h2>
                    <p class="DescripcionSeccionSubtitulo">Letras, partituras y grabaciones registradas en Letras Mi Poblau.</p>
                </div>
            </div>

            ${CancionesDelArtista.length > 0 ? `
            <div class="CuadriculaTarjetasMusicales">
                ${CancionesDelArtista.map(Cancion => `
                <div class="TarjetaMusicalItem">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">${Cancion.Titulo}</div>
                            <div style="font-size: 12px; color: var(--ColorTextoSecundario); margin-top: 2px;">Ritmo: ${Cancion.Genero}</div>
                        </div>
                        <span class="InsigniaTono">${Cancion.TonoOriginal}</span>
                    </div>

                    <p style="font-size: 13px; color: var(--ColorTextoSecundario); line-height: 1.4;">
                        ${Cancion.Descripcion}
                    </p>

                    <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--ColorBordeDivisor);">
                        <button class="BotonAccionPrimario BotonReproducirTarjeta" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 13px;">
                            <i class="fa-solid fa-play" style="margin-right: 6px;"></i>
                            <span class="TextoBotonLargo">Escuchar</span>
                            <span class="TextoBotonCorto">Oír</span>
                        </button>
                        <button class="BotonAccionSecundario BotonAbrirModalLetra" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 13px;">
                            <i class="fa-solid fa-scroll" style="margin-right: 6px;"></i>
                            <span class="TextoBotonLargo">Ver Letra</span>
                            <span class="TextoBotonCorto">Letra</span>
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : `
            <div style="background-color: var(--ColorFondoSuperficie); padding: 30px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave); margin-top: 10px;">
                <p style="font-size: 13px;">No hay canciones o composiciones registradas para este artista en la base de datos.</p>
            </div>
            `}
        </div>
        `;
    }
}

window.ComponenteSeccionArtistas = ComponenteSeccionArtistas;
