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
        const EsVerificado = this.ModeloAlmacenamiento ? this.ModeloAlmacenamiento.EsUsuarioVerificado("Edna Miriam Edgley Cuellar") : false;

        return `
        <aside class="ColumnaLateralIzquierda" id="ColumnaLateralIzquierda">
            <!-- Perfil Rápido -->
            <div class="ElementoAccesoDirecto" data-pestana="artistas" style="margin-bottom: 8px;">
                <img src="Logo1.png" alt="Perfil" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 700; font-size: 14.5px; display: flex; align-items: center; gap: 4px;">
                        <span>Edna Miriam Edgley Cuellar</span>
                        ${EsVerificado ? '<span class="InsigniaVerificada" style="font-size: 11px;" title="Verificado"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                    </span>
                    <span style="font-size: 12px; color: var(--ColorTextoSecundario);">Téc. Sup. Música Boliviana</span>
                </div>
            </div>

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

            <div class="TituloSeccionLateral">Tus Colecciones y Archivos</div>
            <ul class="ListaAccesosDirectos">
                <li class="ElementoAccesoDirecto" data-pestana="canciones">
                    <div class="IconoCirculoColor IconoTeal"><i class="fa-solid fa-file-audio"></i></div>
                    <span>Partituras Digitales</span>
                </li>
                <li class="ElementoAccesoDirecto" data-accion="ver-himno">
                    <div class="IconoCirculoColor IconoVerde"><i class="fa-solid fa-flag"></i></div>
                    <span>Himno al Beni</span>
                </li>
                <li class="ElementoAccesoDirecto" data-accion="crear-aporte">
                    <div class="IconoCirculoColor IconoAzul"><i class="fa-solid fa-pen-nib"></i></div>
                    <span>Aportar Nueva Letra</span>
                </li>
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
