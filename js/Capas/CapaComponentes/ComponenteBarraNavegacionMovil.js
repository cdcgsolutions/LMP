/* ==========================================================================
   COMPONENTE: BARRA DE NAVEGACIÓN MÓVIL INFERIOR (ESTILO FACEBOOK APP)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteBarraNavegacionMovil {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        const PestanaActiva = this.ServicioEstado.ObtenerEstado("PestanaActiva");

        return `
        <nav class="BarraNavegacionMovilInferior" id="BarraNavegacionMovilInferior" aria-label="Navegación Móvil">
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'muro' ? 'MovilActivo' : ''}" data-pestana="muro">
                <i class="fa-solid fa-house"></i>
                <span>Inicio</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'canciones' ? 'MovilActivo' : ''}" data-pestana="canciones">
                <i class="fa-solid fa-scroll"></i>
                <span>Letras</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'generos' ? 'MovilActivo' : ''}" data-pestana="generos">
                <i class="fa-solid fa-guitar"></i>
                <span>Ritmos</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'ifael' ? 'MovilActivo' : ''}" data-pestana="ifael">
                <i class="fa-solid fa-building-columns"></i>
                <span>IFAEL</span>
            </div>
            <div class="ElementoNavegacionMovil" id="BotonMenuMovilDrawer">
                <i class="fa-solid fa-bars"></i>
                <span>Menú</span>
            </div>
        </nav>
        `;
    }
}

window.ComponenteBarraNavegacionMovil = ComponenteBarraNavegacionMovil;
