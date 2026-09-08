/* ==========================================================================
   COMPONENTE: MURO PRINCIPAL / FEED (COMPOSICIÓN DE COMPONENTES)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteMuroPrincipal {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ComponenteCrearPublicacion = new ComponenteCrearPublicacion(InstanciaServicioEstado);
        this.ComponenteTarjetaPublicacion = new ComponenteTarjetaPublicacion(InstanciaServicioEstado, InstanciaModeloAlmacenamiento);
    }

    GenerarTarjetasEsqueletoHtml(Cantidad = 3) {
        let EsqueletosHtml = "";
        for (let i = 0; i < Cantidad; i++) {
            EsqueletosHtml += `
            <div class="TarjetaSkeletonPublicacion">
                <!-- Cabecera: Avatar y Líneas de Autor -->
                <div class="CabeceraSkeleton">
                    <div class="AvatarSkeleton ElementoShimmerLMP"></div>
                    <div class="InfoAutorSkeleton">
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 45%;"></div>
                        <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 25%; height: 10px;"></div>
                    </div>
                </div>

                <!-- Cuerpo: Líneas de contenido -->
                <div class="CuerpoTextoShimmer">
                    <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 92%;"></div>
                    <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 80%;"></div>
                    <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 60%;"></div>
                </div>

                <!-- Caja Media / Letra / Previsualización -->
                <div class="CajaMediaShimmer ElementoShimmerLMP"></div>

                <!-- Pie: Botones de interacción simulados -->
                <div class="PieBotonesSkeleton">
                    <div class="BotonAccionSkeleton ElementoShimmerLMP"></div>
                    <div class="BotonAccionSkeleton ElementoShimmerLMP"></div>
                    <div class="BotonAccionSkeleton ElementoShimmerLMP"></div>
                </div>
            </div>
            `;
        }
        return EsqueletosHtml;
    }

    Renderizar() {
        const TerminoBusqueda = this.ServicioEstado.ObtenerEstado("TerminoBusquedaGlobal") || "";
        let Publicaciones = this.ModeloAlmacenamiento.ObtenerTodasLasPublicaciones();

        if (TerminoBusqueda) {
            Publicaciones = Publicaciones.filter(Pub => {
                const CoincideTexto = Pub.TextoPublicacion && Pub.TextoPublicacion.toLowerCase().includes(TerminoBusqueda);
                const NombrePub = Pub.NombrePublicador || Pub.NombreAutor || "";
                const CoincideAutor = NombrePub && NombrePub.toLowerCase().includes(TerminoBusqueda);
                
                let CoincideCancion = false;
                let Cancion = Pub.IdCancionAsociada ? this.ModeloAlmacenamiento.ObtenerCancionPorId(Pub.IdCancionAsociada) : null;
                if (!Cancion && Pub.TextoPublicacion) {
                    Cancion = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones().find(C =>
                        C.Titulo && Pub.TextoPublicacion.toLowerCase().includes(C.Titulo.toLowerCase())
                    ) || null;
                }
                if (Cancion) {
                    CoincideCancion = (Cancion.Titulo && Cancion.Titulo.toLowerCase().includes(TerminoBusqueda)) ||
                                      (Cancion.Genero && Cancion.Genero.toLowerCase().includes(TerminoBusqueda)) ||
                                      (Cancion.LetraLimpia && Cancion.LetraLimpia.toLowerCase().includes(TerminoBusqueda));
                }
                return CoincideTexto || CoincideAutor || CoincideCancion;
            });
        }

        const EsBusquedaActiva = !!(TerminoBusqueda && TerminoBusqueda.trim() !== "");
        const EstaSincronizando = !EsBusquedaActiva && (
            this.ModeloAlmacenamiento && typeof this.ModeloAlmacenamiento.EstaSincronizandoDatos === "function"
                ? this.ModeloAlmacenamiento.EstaSincronizandoDatos()
                : true
        );

        return `
        <div class="ContenedorMuroMaximo" id="ContenedorMuroMaximo">
            <!-- 1. Caja de Crear Publicación / Aporte -->
            ${this.ComponenteCrearPublicacion.Renderizar()}

            <!-- 2. Lista de Publicaciones del Feed -->
            <div id="ListaPublicacionesFeed" style="display: flex; flex-direction: column; gap: 16px;">
                ${Publicaciones.length > 0 
                    ? Publicaciones.map(Pub => this.ComponenteTarjetaPublicacion.Renderizar(Pub)).join('') 
                    : (EstaSincronizando 
                        ? this.GenerarTarjetasEsqueletoHtml(3) 
                        : `
                    <div style="background-color: var(--ColorFondoSuperficie); padding: 40px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave);">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; display: block; margin-bottom: 12px; color: var(--ColorTextoSecundario);"></i>
                        <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">No se encontraron publicaciones</div>
                        <p style="font-size: 13px; margin-top: 4px;">Intenta con otro término o borra la búsqueda para ver todo el contenido folklórico.</p>
                    </div>
                `)}
            </div>
        </div>
        `;
    }
}

window.ComponenteMuroPrincipal = ComponenteMuroPrincipal;
