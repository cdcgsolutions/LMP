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
                <img src="Logo1.png" alt="Avatar" class="AvatarAutorPublicacion" style="width: 40px; height: 40px; border-radius: 50%;">
                <div class="BotonDisparadorModalCrear" id="BotonAbrirModalCrearPublicacion">
                    ¿Qué letra o composición del Beni deseas compartir hoy?
                </div>
            </div>

            <div class="DivisorCrearPublicacion"></div>

            <div class="FilaBotonesAccionesRapidas">
                <button class="BotonAccionRapidaCrear" id="BotonRapidoLetraAcordes">
                    <i class="fa-solid fa-pen-to-square" style="color: #45bd62; font-size: 18px;"></i>
                    <span>Letra y Acordes</span>
                </button>
                <button class="BotonAccionRapidaCrear" id="BotonRapidoPartitura">
                    <i class="fa-solid fa-file-lines" style="color: #f3425f; font-size: 18px;"></i>
                    <span>Partitura / Manuscrito</span>
                </button>
                <button class="BotonAccionRapidaCrear" id="BotonRapidoRitmo">
                    <i class="fa-solid fa-guitar" style="color: #f7b125; font-size: 18px;"></i>
                    <span>Ritmo Beniano</span>
                </button>
            </div>
        </div>
        `;
    }
}

window.ComponenteCrearPublicacion = ComponenteCrearPublicacion;
