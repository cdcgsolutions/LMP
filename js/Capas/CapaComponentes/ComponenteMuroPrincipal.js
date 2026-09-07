/* ==========================================================================
   COMPONENTE: MURO PRINCIPAL / FEED (COMPOSICIÓN DE COMPONENTES)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteMuroPrincipal {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ComponenteHistorias = new ComponenteHistorias(InstanciaServicioEstado);
        this.ComponenteCrearPublicacion = new ComponenteCrearPublicacion(InstanciaServicioEstado);
        this.ComponenteTarjetaPublicacion = new ComponenteTarjetaPublicacion(InstanciaServicioEstado, InstanciaModeloAlmacenamiento);
    }

    Renderizar() {
        const TerminoBusqueda = this.ServicioEstado.ObtenerEstado("TerminoBusquedaGlobal") || "";
        let Publicaciones = this.ModeloAlmacenamiento.ObtenerTodasLasPublicaciones();

        if (TerminoBusqueda) {
            Publicaciones = Publicaciones.filter(Pub => {
                const CoincideTexto = Pub.TextoPublicacion && Pub.TextoPublicacion.toLowerCase().includes(TerminoBusqueda);
                const CoincideAutor = Pub.NombreAutor && Pub.NombreAutor.toLowerCase().includes(TerminoBusqueda);
                
                let CoincideCancion = false;
                if (Pub.IdCancionAsociada) {
                    const Cancion = this.ModeloAlmacenamiento.ObtenerCancionPorId(Pub.IdCancionAsociada);
                    if (Cancion) {
                        CoincideCancion = (Cancion.Titulo && Cancion.Titulo.toLowerCase().includes(TerminoBusqueda)) ||
                                          (Cancion.Genero && Cancion.Genero.toLowerCase().includes(TerminoBusqueda)) ||
                                          (Cancion.LetraLimpia && Cancion.LetraLimpia.toLowerCase().includes(TerminoBusqueda));
                    }
                }
                return CoincideTexto || CoincideAutor || CoincideCancion;
            });
        }

        return `
        <div class="ContenedorMuroMaximo" id="ContenedorMuroMaximo">
            <!-- 1. Bandeja de Historias / Reels -->
            ${this.ComponenteHistorias.Renderizar()}

            <!-- 2. Caja de Crear Publicación -->
            ${this.ComponenteCrearPublicacion.Renderizar()}

            <!-- 3. Lista de Publicaciones del Feed -->
            <div id="ListaPublicacionesFeed" style="display: flex; flex-direction: column; gap: 16px;">
                ${Publicaciones.length > 0 ? Publicaciones.map(Pub => this.ComponenteTarjetaPublicacion.Renderizar(Pub)).join('') : `
                    <div style="background-color: var(--ColorFondoSuperficie); padding: 40px 20px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeSuave);">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; display: block; margin-bottom: 12px; color: var(--ColorTextoSecundario);"></i>
                        <div style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal);">No se encontraron publicaciones</div>
                        <p style="font-size: 13px; margin-top: 4px;">Intenta con otro término o borra la búsqueda para ver todo el contenido folklórico.</p>
                    </div>
                `}
            </div>
        </div>
        `;
    }
}

window.ComponenteMuroPrincipal = ComponenteMuroPrincipal;
