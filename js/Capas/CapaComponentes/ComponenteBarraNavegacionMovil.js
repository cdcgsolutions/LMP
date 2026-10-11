/* ==========================================================================
   COMPONENTE: BARRA DE NAVEGACIÓN MÓVIL INFERIOR (PORTAL EDUCATIVO)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteBarraNavegacionMovil {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        const PestanaActiva = this.ServicioEstado.ObtenerEstado("PestanaActiva") || "inicio";

        return `
        <nav class="BarraNavegacionMovilInferior" id="BarraNavegacionMovilInferior" aria-label="Navegación Móvil">
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'inicio' || PestanaActiva === 'muro' ? 'MovilActivo' : ''}" data-pestana="inicio">
                <i class="fa-solid fa-house"></i>
                <span>Inicio</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'canciones' ? 'MovilActivo' : ''}" data-pestana="canciones">
                <i class="fa-solid fa-scroll"></i>
                <span>Letras</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'partituras' ? 'MovilActivo' : ''}" data-pestana="partituras">
                <i class="fa-solid fa-file-audio"></i>
                <span>Partituras</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'generos' ? 'MovilActivo' : ''}" data-pestana="generos">
                <i class="fa-solid fa-guitar"></i>
                <span>Géneros</span>
            </div>
            <div class="ElementoNavegacionMovil" id="BotonMenuMovilDrawer" title="Abrir Menú Completo">
                <i class="fa-solid fa-bars"></i>
                <span>Menú</span>
            </div>
        </nav>
        `;
    }
}

window.ComponenteBarraNavegacionMovil = ComponenteBarraNavegacionMovil;
