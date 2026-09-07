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

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionCanciones">
            <!-- Encabezado de la Sección -->
            <div class="CabeceraSeccionPrincipal">
                <div>
                    <h1 class="TituloSeccionGrande"><i class="fa-solid fa-scroll" style="color: var(--ColorPrimarioAzul); margin-right: 8px;"></i>Cancionero & Letras del Beni</h1>
                    <p class="DescripcionSeccionSubtitulo">
                        Repertorio de composiciones, partituras transcritas y obras tradicionales de autores benianos y estudiantes de IFAEL.
                    </p>
                </div>
                <button class="BotonAccionPrimario" id="BotonAportarNuevaCancionEnSeccion">
                    <i class="fa-solid fa-plus" style="margin-right: 6px;"></i>Aportar Nueva Letra
                </button>
            </div>

            <!-- Barra de Filtros Rápidos -->
            <div class="BarraFiltrosCanciones">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;">
                    <span style="font-weight: 600; font-size: 13.5px;">Género:</span>
                    <select id="SelectorFiltroGenero" style="flex: 1;">
                        <option value="Todos" ${FiltroGenero === 'Todos' ? 'selected' : ''}>Todos los Ritmos</option>
                        <option value="Taquirari" ${FiltroGenero === 'Taquirari' ? 'selected' : ''}>Taquirari</option>
                        <option value="Chovena" ${FiltroGenero === 'Chovena' ? 'selected' : ''}>Chovena</option>
                        <option value="Carnavalito" ${FiltroGenero === 'Carnavalito' ? 'selected' : ''}>Carnavalito</option>
                        <option value="Danza Ritual / Sarao" ${FiltroGenero === 'Danza Ritual / Sarao' ? 'selected' : ''}>Macheteros / Sarao</option>
                    </select>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px;">
                    <span style="font-weight: 600; font-size: 13.5px;">Tono:</span>
                    <select id="SelectorFiltroTono" style="flex: 1;">
                        <option value="Todos" ${FiltroTono === 'Todos' ? 'selected' : ''}>Todos los Tonos</option>
                        <option value="Re Mayor" ${FiltroTono === 'Re Mayor' ? 'selected' : ''}>Re Mayor (D)</option>
                        <option value="La Menor" ${FiltroTono === 'La Menor' ? 'selected' : ''}>La Menor (Am)</option>
                        <option value="Sol Mayor" ${FiltroTono === 'Sol Mayor' ? 'selected' : ''}>Sol Mayor (G)</option>
                        <option value="Mi Menor" ${FiltroTono === 'Mi Menor' ? 'selected' : ''}>Mi Menor (Em)</option>
                    </select>
                </div>
            </div>

            <!-- Cuadrícula de Canciones -->
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

                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span class="InsigniaRitmo">${Cancion.Genero}</span>
                        <span class="InsigniaTono">${Cancion.TonoOriginal}</span>
                        ${Cancion.TempoBPM ? `<span style="font-size: 11px; background: var(--ColorFondoSecundario); padding: 3px 6px; border-radius: 4px; font-weight: 600;"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i>${Cancion.TempoBPM} BPM</span>` : ''}
                    </div>

                    <p style="font-size: 13px; color: var(--ColorTextoSecundario); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${Cancion.Descripcion || 'Letra y partitura folklórica preservada en el archivo digital Letras Mi Poblau.'}
                    </p>

                    <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--ColorBordeDivisor);">
                        <button class="BotonAccionPrimario BotonReproducirTarjeta" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 13px; padding: 7px 10px;" title="Escuchar">
                            <i class="fa-solid fa-play" style="margin-right: 6px;"></i>Escuchar
                        </button>
                        <button class="BotonAccionSecundario BotonAbrirModalLetra" data-cancion-id="${Cancion.IdCancion}" style="flex: 1; font-size: 13px; padding: 7px 10px;" title="Ver letra y acordes">
                            <i class="fa-solid fa-scroll" style="margin-right: 6px;"></i>Letra
                        </button>
                        ${Cancion.ImagenPartitura ? `
                        <button class="BotonCircularIcono BotonAbrirModalPartitura" data-cancion-id="${Cancion.IdCancion}" style="width: 34px; height: 34px; font-size: 14px;" title="Ver partitura">
                            <i class="fa-solid fa-file-lines"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        `;
    }
}

window.ComponenteSeccionCanciones = ComponenteSeccionCanciones;
