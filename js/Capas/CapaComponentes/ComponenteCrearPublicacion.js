/* ==========================================================================
   COMPONENTE: CAJA DE CREAR PUBLICACIÓN / APORTE (ESTILO FACEBOOK)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteCrearPublicacion {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        return `
        <div class="TarjetaCrearPublicacion" id="TarjetaCrearPublicacion">
            <div class="FilaSuperiorCrearPublicacion">
                <img src="Logo1.png" alt="Avatar" class="AvatarAutorPublicacion" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;" onerror="this.src='Logo1.png'">
                <div class="BotonDisparadorModalCrear" id="BotonAbrirModalCrearPublicacion">
                    ¿Qué letra del Beni deseas compartir hoy?
                </div>
                <button class="BotonAccionRapidaCrear BotonAccionLetraCostado" id="BotonRapidoLetraAcordes" title="Aportar Letra y Acordes">
                    <i class="fa-solid fa-pen-to-square" style="color: #45bd62; font-size: 16px;"></i>
                    <span class="TextoBotonLargo">Letra</span>
                </button>
            </div>
        </div>
        `;
    }
}

window.ComponenteCrearPublicacion = ComponenteCrearPublicacion;
