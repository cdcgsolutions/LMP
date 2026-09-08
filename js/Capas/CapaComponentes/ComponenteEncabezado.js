/* ==========================================================================
   COMPONENTE: ENCABEZADO SUPERIOR (ESTILO FACEBOOK / META)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteEncabezado {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        const EstadoActual = this.ServicioEstado.ObtenerEstado();
        const PestanaActiva = EstadoActual.PestanaActiva;
        const ModoOscuro = EstadoActual.ModoOscuro;
        const UsuarioActual = this.ServicioEstado.ObtenerUsuarioActual() || EstadoActual.UsuarioActual;
        const EsInvitado = !UsuarioActual || UsuarioActual.EsInvitado === true || UsuarioActual.Nombre === "Usuario";

        return `
        <header class="EncabezadoSuperiorPrincipal" id="EncabezadoSuperiorPrincipal">
            <!-- Sección Izquierda: Logotipo, Botón Menú Móvil y Buscador -->
            <div class="SeccionEncabezadoIzquierda">
                <!-- Botón Menú móvil (visible en pantallas pequeñas en lugar del icono de logo) -->
                <button class="BotonCircularIcono BotonMenuMovilEncabezado" id="BotonAbrirMenuMovilLateral" title="Menú de opciones">
                    <i class="fa-solid fa-bars"></i>
                </button>

                <div class="LogotipoMarcaLMP" id="BotonLogotipoInicio" title="Letras Mi Poblau - Inicio">
                    <img src="LogoIniciales.png" alt="LMP Logo" class="ImagenLogoPrincipal" onerror="this.src='Logo1.png'">
                </div>

                <div class="ContenedorBuscadorSuperior">
                    <span class="IconoBuscadorSuperior"><i class="fa-solid fa-magnifying-glass"></i></span>
                    <input 
                        type="text" 
                        class="CampoEntradaBuscador" 
                        id="CampoEntradaBuscadorPrincipal" 
                        placeholder="Buscar letras, ritmos, autores..."
                        value="${EstadoActual.TerminoBusquedaGlobal || ''}"
                    >
                </div>
            </div>

            <!-- Sección Central: Pestañas Principales FB -->
            <nav class="SeccionEncabezadoCentro" aria-label="Navegación principal">
                <button class="PestanaNavegacionSuperior ${PestanaActiva === 'muro' ? 'PestanaActiva' : ''}" data-pestana="muro" title="Inicio">
                    <i class="fa-solid fa-house"></i>
                    <span class="EtiquetaPestanaTexto">Inicio</span>
                </button>
                <button class="PestanaNavegacionSuperior ${PestanaActiva === 'canciones' ? 'PestanaActiva' : ''}" data-pestana="canciones" title="Cancionero y Letras">
                    <i class="fa-solid fa-scroll"></i>
                    <span class="EtiquetaPestanaTexto">Letras</span>
                </button>
                <button class="PestanaNavegacionSuperior ${PestanaActiva === 'generos' ? 'PestanaActiva' : ''}" data-pestana="generos" title="Géneros Musicales">
                    <i class="fa-solid fa-guitar"></i>
                    <span class="EtiquetaPestanaTexto">Géneros</span>
                </button>
                <button class="PestanaNavegacionSuperior ${PestanaActiva === 'artistas' ? 'PestanaActiva' : ''}" data-pestana="artistas" title="Compositores y Artistas">
                    <i class="fa-solid fa-users"></i>
                    <span class="EtiquetaPestanaTexto">Artistas</span>
                </button>
                <button class="PestanaNavegacionSuperior ${PestanaActiva === 'ifael' ? 'PestanaActiva' : ''}" data-pestana="ifael" title="Instituto IFAEL Trinidad">
                    <i class="fa-solid fa-building-columns"></i>
                    <span class="EtiquetaPestanaTexto">IFAEL</span>
                </button>
            </nav>

            <!-- Sección Derecha: Opciones, Tema y Perfil -->
            <div class="SeccionEncabezadoDerecha">
                <button class="BotonCircularIcono" id="BotonAlternarModoOscuro" title="Alternar Modo Oscuro / Claro">
                    <i class="fa-solid ${ModoOscuro ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <button class="BotonCircularIcono" id="BotonCrearNuevoAporte" title="Publicar nueva letra">
                    <i class="fa-solid fa-plus"></i>
                </button>
                ${EsInvitado ? `
                <div class="PerfilUsuarioBoton PerfilInvitadoEncabezado" id="BotonPerfilUsuario" title="Modo Invitado - Clic para iniciar sesión" style="cursor: pointer;">
                    <div class="AvatarUsuarioMini" style="display: flex; align-items: center; justify-content: center; background: var(--ColorFondoSecundario); border-radius: 50%; width: 28px; height: 28px; color: var(--ColorTextoSecundario); border: 1px solid var(--ColorBordeDivisor); flex-shrink: 0;">
                        <i class="fa-solid fa-user" style="font-size: 13px;"></i>
                    </div>
                    <span>Usuario</span>
                </div>
                ` : `
                <div class="PerfilUsuarioBoton" id="BotonPerfilUsuario" title="Perfil de ${UsuarioActual.Nombre}" style="cursor: pointer;">
                    <img src="${UsuarioActual.FotoPerfil || 'Logo1.png'}" alt="Avatar" class="AvatarUsuarioMini" onerror="this.src='Logo1.png'">
                    <span>${UsuarioActual.Nombre.split(' ').slice(0, 2).join(' ')}</span>
                </div>
                `}
            </div>
        </header>
        `;
    }
}

window.ComponenteEncabezado = ComponenteEncabezado;
