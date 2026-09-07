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

    Renderizar() {
        const TerminoBusqueda = this.ServicioEstado.ObtenerEstado("TerminoBusquedaGlobal") || "";
        let Publicaciones = this.ModeloAlmacenamiento.ObtenerTodasLasPublicaciones();

        if (TerminoBusqueda) {
            Publicaciones = Publicaciones.filter(Pub => {
                const CoincideTexto = Pub.TextoPublicacion && Pub.TextoPublicacion.toLowerCase().includes(TerminoBusqueda);
                const CoincideAutor = Pub.NombreAutor && Pub.NombreAutor.toLowerCase().includes(TerminoBusqueda);
                
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

        return `
        <div class="ContenedorMuroMaximo" id="ContenedorMuroMaximo">
            <!-- 1. Caja de Crear Publicación / Aporte -->
            ${this.ComponenteCrearPublicacion.Renderizar()}

            <!-- 2. Lista de Publicaciones del Feed -->
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
