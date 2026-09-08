/* ==========================================================================
   COMPONENTE: BARRA LATERAL IZQUIERDA (ACCESOS DIRECTOS FB)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteBarraLateralIzquierda {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento = null) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const PestanaActiva = this.ServicioEstado.ObtenerEstado("PestanaActiva");
        const UsuarioActual = this.ServicioEstado.ObtenerUsuarioActual() || this.ServicioEstado.ObtenerEstado("UsuarioActual");
        const EsInvitado = !UsuarioActual || UsuarioActual.EsInvitado === true || UsuarioActual.Nombre === "Usuario";
        const EsVerificado = (!EsInvitado && this.ModeloAlmacenamiento)
            ? this.ModeloAlmacenamiento.EsUsuarioVerificado(UsuarioActual.Nombre, UsuarioActual.EsVerificado === true)
            : false;

        return `
        <aside class="ColumnaLateralIzquierda" id="ColumnaLateralIzquierda">
            <!-- Perfil Rápido -->
            ${EsInvitado ? `
            <div class="ElementoAccesoDirecto PerfilInvitadoLateral" data-accion="iniciar-sesion" style="margin-bottom: 8px; cursor: pointer;" title="Haz clic para iniciar sesión">
                <div class="AvatarPerfilLateralInvitado" style="width: 38px; height: 38px; border-radius: 50%; background: var(--ColorFondoSecundario); display: flex; align-items: center; justify-content: center; color: var(--ColorTextoSecundario); font-size: 18px; border: 1px solid var(--ColorBordeDivisor); flex-shrink: 0;">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 700; font-size: 14.5px; color: var(--ColorTextoPrincipal);">Usuario</span>
                    <span style="font-size: 11.5px; color: var(--ColorPrimarioAzul); font-weight: 600; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar sesión
                    </span>
                </div>
            </div>
            ` : `
            <div class="ElementoAccesoDirecto ${PestanaActiva === 'perfil' ? 'AccesoActivo' : ''}" data-pestana="perfil" style="margin-bottom: 8px; cursor: pointer;" title="Ver tu perfil">
                <img src="${UsuarioActual.FotoPerfil || 'Logo1.png'}" alt="Perfil" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" onerror="this.src='Logo1.png'">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 700; font-size: 14.5px; display: flex; align-items: center; gap: 4px;">
                        <span>${UsuarioActual.Nombre}</span>
                        ${EsVerificado ? '<span class="InsigniaVerificada" style="font-size: 11px;" title="Verificado"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                    </span>
                    <span style="font-size: 12px; color: var(--ColorTextoSecundario);">Ver perfil</span>
                </div>
            </div>
            `}

            <!-- Accesos Directos Principales -->
            <ul class="ListaAccesosDirectos">
                <li class="ElementoAccesoDirecto ${PestanaActiva === 'muro' ? 'AccesoActivo' : ''}" data-pestana="muro">
                    <div class="IconoCirculoColor IconoAzul"><i class="fa-solid fa-house"></i></div>
                    <span>Inicio</span>
                </li>
                <li class="ElementoAccesoDirecto ${PestanaActiva === 'canciones' ? 'AccesoActivo' : ''}" data-pestana="canciones">
                    <div class="IconoCirculoColor IconoVerde"><i class="fa-solid fa-scroll"></i></div>
                    <span>Cancionero y Letras</span>
                </li>
                <li class="ElementoAccesoDirecto ${PestanaActiva === 'generos' ? 'AccesoActivo' : ''}" data-pestana="generos">
                    <div class="IconoCirculoColor IconoDorado"><i class="fa-solid fa-guitar"></i></div>
                    <span>Ritmos y Géneros Benianos</span>
                </li>
                <li class="ElementoAccesoDirecto ${PestanaActiva === 'artistas' ? 'AccesoActivo' : ''}" data-pestana="artistas">
                    <div class="IconoCirculoColor IconoMorado"><i class="fa-solid fa-users"></i></div>
                    <span>Artistas y Compositores</span>
                </li>
                <li class="ElementoAccesoDirecto ${PestanaActiva === 'ifael' ? 'AccesoActivo' : ''}" data-pestana="ifael">
                    <div class="IconoCirculoColor IconoRojo"><i class="fa-solid fa-building-columns"></i></div>
                    <span>Instituto IFAEL (Trinidad)</span>
                </li>
            </ul>

            <div class="SeparadorBarraLateral"></div>

            <div class="TituloSeccionLateral">Colecciones y Archivos</div>
            <ul class="ListaAccesosDirectos">
                <li class="ElementoAccesoDirecto" data-accion="ver-himno">
                    <div class="IconoCirculoColor IconoVerde"><i class="fa-solid fa-flag"></i></div>
                    <span>Himno al Beni</span>
                </li>
                ${!EsInvitado ? `
                <li class="ElementoAccesoDirecto" data-accion="cerrar-sesion" style="color: var(--ColorPeligroRojo);">
                    <div class="IconoCirculoColor" style="background-color: rgba(239, 68, 68, 0.12); color: var(--ColorPeligroRojo);"><i class="fa-solid fa-arrow-right-from-bracket"></i></div>
                    <span>Cerrar Sesión</span>
                </li>
                ` : ''}
            </ul>

            <div class="SeparadorBarraLateral"></div>

            <footer class="PiePaginaLateralCreditos">
                <p><strong>Letras Mi Poblau (LMP)</strong></p>
                <p>Proyecto de Grado Académico - IFAEL</p>
                <p>Carrera: Técnico Superior en Música Boliviana</p>
                <p style="margin-top: 6px; color: var(--ColorTextoSecundario);">By: Ing. Daniel ⓒ <span id="year">${new Date().getFullYear()}</span></p>
            </footer>
        </aside>
        `;
    }
}

window.ComponenteBarraLateralIzquierda = ComponenteBarraLateralIzquierda;
