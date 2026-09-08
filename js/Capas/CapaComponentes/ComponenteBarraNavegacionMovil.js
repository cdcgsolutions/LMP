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
        const UsuarioActual = this.ServicioEstado ? this.ServicioEstado.ObtenerUsuarioActual() : null;
        const EsInvitado = !UsuarioActual || UsuarioActual.EsInvitado === true || UsuarioActual.Nombre === "Usuario";
        const FotoPerfil = (UsuarioActual && (UsuarioActual.FotoPerfilUrl || UsuarioActual.FotoPerfil)) || "";

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
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'artistas' ? 'MovilActivo' : ''}" data-pestana="artistas">
                <i class="fa-solid fa-users"></i>
                <span>Artistas</span>
            </div>
            <div class="ElementoNavegacionMovil ${PestanaActiva === 'perfil' ? 'MovilActivo' : ''}" data-pestana="perfil" id="BotonNavegacionMovilPerfil">
                ${(!EsInvitado && FotoPerfil) ? `
                <img src="${FotoPerfil}" alt="Perfil" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: ${PestanaActiva === 'perfil' ? '2px solid var(--ColorPrimarioAzul)' : '1px solid var(--ColorBordeDivisor)'};" onerror="this.src='Logo1.png'">
                ` : `
                <i class="fa-solid fa-user"></i>
                `}
                <span>Perfil</span>
            </div>
        </nav>
        `;
    }
}

window.ComponenteBarraNavegacionMovil = ComponenteBarraNavegacionMovil;
