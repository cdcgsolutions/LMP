/* ==========================================================================
   COMPONENTE: BARRA LATERAL DERECHA (EVENTOS Y CONTACTOS FB)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteBarraLateralDerecha {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        return `
        <aside class="ColumnaLateralDerecha" id="ColumnaLateralDerecha">
        </aside>
        `;
    }
}

window.ComponenteBarraLateralDerecha = ComponenteBarraLateralDerecha;
