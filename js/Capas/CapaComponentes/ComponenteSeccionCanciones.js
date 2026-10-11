/* ==========================================================================
   COMPONENTE: SECCIÓN CANCIONERO Y LETRAS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionCanciones {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const EstadoActual = this.ServicioEstado.ObtenerEstado();
        const TerminoBusqueda = EstadoActual.TerminoBusquedaGlobal || "";
        const FiltroGenero = EstadoActual.FiltroGeneroCanciones || "Todos";
        const FiltroTono = EstadoActual.FiltroTonoCanciones || "Todos";

        let Canciones = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones();

        // Aplicar Filtros
        if (FiltroGenero !== "Todos") {
            Canciones = Canciones.filter(C => C.Genero === FiltroGenero);
        }
        if (FiltroTono !== "Todos") {
            Canciones = Canciones.filter(C => C.TonoOriginal && C.TonoOriginal.includes(FiltroTono));
        }
        if (TerminoBusqueda) {
            Canciones = Canciones.filter(C => 
                (C.Titulo && C.Titulo.toLowerCase().includes(TerminoBusqueda)) ||
                (C.Autor && C.Autor.toLowerCase().includes(TerminoBusqueda)) ||
                (C.Genero && C.Genero.toLowerCase().includes(TerminoBusqueda)) ||
                (C.LetraLimpia && C.LetraLimpia.toLowerCase().includes(TerminoBusqueda))
            );
        }

        const TodosLosGenerosBD = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosGeneros()) || [];
        const OpcionesGenerosHtml = TodosLosGenerosBD.map(G => {
            const NombreGen = G.Nombre || G;
            return `<option value="${NombreGen}" ${FiltroGenero === NombreGen ? 'selected' : ''}>${NombreGen}</option>`;
        }).join('');

        const TodasLasCancionesBD = this.ModeloAlmacenamiento ? this.ModeloAlmacenamiento.ObtenerTodasLasCanciones() : [];
        const TonosUnicos = Array.from(new Set(TodasLasCancionesBD.map(C => C.TonoOriginal).filter(Boolean)));
        const OpcionesTonosHtml = TonosUnicos.map(T => 
            `<option value="${T}" ${FiltroTono === T ? 'selected' : ''}>${T}</option>`
        ).join('');

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionCanciones">
            <!-- Encabezado de la Sección Compacto -->
            <div class="CabeceraSeccionPrincipal CabeceraSeccionCanciones">
                <div class="ContenedorEncabezadoCanciones">
                    <div class="TextosEncabezadoCanciones">
                        <h1 class="TituloSeccionGrande">
                            <i class="fa-solid fa-scroll" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Cancionero & Letras</span>
                        </h1>
                        <p class="DescripcionSeccionSubtitulo">
                            Repertorio y partituras del Beni
                        </p>
                    </div>
                    <div class="InsigniaConteoCanciones" style="background: var(--ColorFondoVerdeSuave); color: var(--ColorVerdeBeni); padding: 6px 14px; border-radius: var(--RadioBotonPill); font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(46, 125, 50, 0.25);">
                        <i class="fa-solid fa-music"></i>
                        <span>${Canciones.length} Registradas</span>
                    </div>
                </div>
            </div>

            <!-- Barra de Filtros Rápidos Dinámicos (Fila de 2 en móvil) -->
            <div class="BarraFiltrosCanciones">
                <div class="ItemFiltroCanciones">
                    <label for="SelectorFiltroGenero" class="EtiquetaFiltroCanciones">
                        <i class="fa-solid fa-guitar"></i>
                        <span>Género</span>
                    </label>
                    <select id="SelectorFiltroGenero" class="ControlFiltroCanciones">
                        <option value="Todos" ${FiltroGenero === 'Todos' ? 'selected' : ''}>Todos los Ritmos</option>
                        ${OpcionesGenerosHtml}
                    </select>
                </div>

                <div class="ItemFiltroCanciones">
                    <label for="SelectorFiltroTono" class="EtiquetaFiltroCanciones">
                        <i class="fa-solid fa-music"></i>
                        <span>Tono</span>
                    </label>
                    <select id="SelectorFiltroTono" class="ControlFiltroCanciones">
                        <option value="Todos" ${FiltroTono === 'Todos' ? 'selected' : ''}>Todos los Tonos</option>
                        ${OpcionesTonosHtml}
                    </select>
                </div>
            </div>

            <!-- Cuadrícula de Canciones o Estado Vacío / Skeleton -->
            ${Canciones.length > 0 ? `
            <div class="CuadriculaTarjetasMusicales">
                ${Canciones.map(Cancion => `
                <div class="TarjetaMusicalItem">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <img src="${Cancion.Caratula || 'Logo1.png'}" alt="${Cancion.Titulo}" style="width: 54px; height: 54px; border-radius: var(--RadioMediano); object-fit: cover; flex-shrink: 0;" onerror="this.src='Logo1.png'">
                        <div style="flex: 1; overflow: hidden;">
                            <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">${Cancion.Titulo}</div>
                            <div style="font-size: 13px; color: var(--ColorTextoSecundario); margin-top: 2px;">${Cancion.Autor}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; align-items: center;">
                        <span class="InsigniaGeneroMusical" title="Género musical"><strong>Género:</strong> ${Cancion.Genero}</span>
                        <span class="InsigniaTonoMusical" title="Tono original"><strong>Tono:</strong> ${Cancion.TonoOriginal}</span>
                        ${Cancion.CompasRitmo ? `<span class="InsigniaCompasMusical" title="Compás / Ritmo"><strong>Compás:</strong> ${Cancion.CompasRitmo}</span>` : ''}
                    </div>

                    <div class="FilaAccionesTarjetaCancion" style="display: flex; gap: 8px; margin-top: 16px; align-items: center; width: 100%;">
                        <button class="BotonAccionPrimario BotonReproducirTarjeta BotonReproducirCancionEnLista" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 12.5px; padding: 7px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap;" title="Reproducir audio">
                            <i class="fa-solid fa-play"></i>
                            <span>Escuchar</span>
                        </button>
                        <button class="BotonAccionSecundario BotonAbrirModalLetra" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 12.5px; padding: 7px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap;" title="Ver letra y acordes">
                            <i class="fa-solid fa-scroll"></i>
                            <span>Letra</span>
                        </button>
                        ${(Cancion.ImagenPartituraUrl && Cancion.ImagenPartituraUrl !== 'IFAEL.jpg') ? `
                        <button class="BotonAccionSecundario BotonAbrirModalPartitura" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 12.5px; padding: 7px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap;" title="Ver partitura digital">
                            <i class="fa-solid fa-file-lines"></i>
                            <span>Partitura</span>
                        </button>
                        ` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
            ` : (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EstaSincronizandoDatos() ? `
            <div class="CuadriculaTarjetasMusicales">
                ${[1, 2, 3, 4, 5, 6].map(() => `
                <div class="TarjetaSkeletonCuadricula">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div class="ElementoShimmerLMP" style="width: 54px; height: 54px; border-radius: var(--RadioMediano); flex-shrink: 0;"></div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 75%;"></div>
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 45%; height: 10px;"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; margin-top: 8px;">
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 50px; height: 18px; border-radius: var(--RadioBotonPill);"></div>
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 65px; height: 18px; border-radius: var(--RadioBotonPill);"></div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 10px;">
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="flex: 1; height: 32px; border-radius: var(--RadioBotonPill);"></div>
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="flex: 1; height: 32px; border-radius: var(--RadioBotonPill);"></div>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : `
            <div style="background-color: var(--ColorFondoSuperficie); padding: 40px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave); margin-top: 18px;">
                <i class="fa-solid fa-music" style="font-size: 36px; display: block; margin-bottom: 12px; opacity: 0.6;"></i>
                <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">No hay canciones disponibles</div>
                <p style="font-size: 13px; margin-top: 4px;">Aún no se han registrado canciones en la base de datos o ninguna coincide con los filtros aplicados.</p>
            </div>
            `)}
        </div>
        `;
    }
}

window.ComponenteSeccionCanciones = ComponenteSeccionCanciones;
