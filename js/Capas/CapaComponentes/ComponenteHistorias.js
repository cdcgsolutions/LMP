/* ==========================================================================
   COMPONENTE: BANDEJA DE HISTORIAS / REELS (ESTILO FACEBOOK)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteHistorias {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        return `
        <div class="BandejaHistoriasContenedor" id="BandejaHistoriasContenedor">
            <!-- Historia 1: Crear Aporte -->
            <div class="TarjetaHistoria" id="TarjetaCrearHistoriaBoton" style="background: linear-gradient(180deg, var(--ColorFondoSuperficie) 65%, var(--ColorPrimarioAzulSuave) 100%);">
                <img src="Logo1.png" alt="Crear Historia" class="ImagenFondoHistoria" style="height: 65%; object-fit: cover;">
                <div style="position: absolute; bottom: 35px; left: 50%; transform: translateX(-50%); width: 34px; height: 34px; border-radius: 50%; background: var(--ColorPrimarioAzul); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 3px solid var(--ColorFondoSuperficie);"><i class="fa-solid fa-plus"></i></div>
                <div style="position: absolute; bottom: 8px; width: 100%; text-align: center; font-size: 11px; font-weight: 700; color: var(--ColorTextoPrincipal);">Crear Aporte</div>
            </div>

            <!-- Historia 2: Viva el Beni -->
            <div class="TarjetaHistoria" data-cancion-id="1">
                <img src="IFAEL.jpg" alt="Viva el Beni" class="ImagenFondoHistoria">
                <div class="CapaGradienteHistoria"></div>
                <img src="Logo1.png" alt="Edna Miriam" class="AvatarEmisorHistoria">
                <div class="TituloTextoHistoria">Viva el Beni (Tierra Hermosa)</div>
            </div>

            <!-- Historia 3: IFAEL Trinidad -->
            <div class="TarjetaHistoria" data-pestana="ifael">
                <img src="IFAEL.jpg" alt="IFAEL" class="ImagenFondoHistoria">
                <div class="CapaGradienteHistoria"></div>
                <img src="LogoInicialesSinFondoNegro.png" alt="IFAEL" class="AvatarEmisorHistoria">
                <div class="TituloTextoHistoria">IFAEL: Formación Musical</div>
            </div>

            <!-- Historia 4: Chovena El Guajojó -->
            <div class="TarjetaHistoria" data-cancion-id="2">
                <img src="LogoIniciales.png" alt="El Guajojó" class="ImagenFondoHistoria">
                <div class="CapaGradienteHistoria"></div>
                <img src="LogoInicialesSinFondoBlanco.png" alt="Chovena" class="AvatarEmisorHistoria">
                <div class="TituloTextoHistoria">Chovena: El Guajojó</div>
            </div>

            <!-- Historia 5: Danza de los Macheteros -->
            <div class="TarjetaHistoria" data-cancion-id="4">
                <img src="IFAEL.jpg" alt="Macheteros" class="ImagenFondoHistoria">
                <div class="CapaGradienteHistoria"></div>
                <img src="Logo1.png" alt="Moxos" class="AvatarEmisorHistoria">
                <div class="TituloTextoHistoria">Macheteros de Moxos</div>
            </div>
        </div>
        `;
    }
}

window.ComponenteHistorias = ComponenteHistorias;
