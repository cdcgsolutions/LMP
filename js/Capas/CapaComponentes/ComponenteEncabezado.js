/* ==========================================================================
   COMPONENTE: ENCABEZADO SUPERIOR DEL PORTAL (MINIMALISTA Y ACADÉMICO)
   Galería y Archivo Musical Abierto - Letras Mi Poblau (LMP)
   Nombres en PascalCase
   ========================================================================== */

class ComponenteEncabezado {
    constructor(InstanciaServicioEstado) {
        this.ServicioEstado = InstanciaServicioEstado;
    }

    Renderizar() {
        const EstadoActual = this.ServicioEstado.ObtenerEstado();
        const PestanaActiva = EstadoActual.PestanaActiva || "inicio";
        const ModoOscuro = EstadoActual.ModoOscuro || false;

        const NombresPestana = {
            "inicio": "Inicio / Menú",
            "muro": "Inicio / Menú",
            "canciones": "Cancionero & Letras",
            "partituras": "Archivo de Partituras",
            "generos": "Géneros & Ritmos Benianos",
            "artistas": "Compositores & Artistas",
            "ifael": "Instituto IFAEL (Trinidad)",
            "acerca-de": "Acerca de Nosotros"
        };
        const TituloSeccionActual = NombresPestana[PestanaActiva] || "Letras de Mi Poblao";

        return `
        <header class="EncabezadoSuperiorPrincipal" id="EncabezadoSuperiorPrincipal">
            <!-- Sección Izquierda: Botón Hamburguesa y Título de Sección -->
            <div class="SeccionEncabezadoIzquierda">
                <button class="BotonCircularIcono BotonMenuMovilEncabezado" id="BotonAbrirMenuMovilLateral" title="Abrir Menú de Navegación">
                    <i class="fa-solid fa-bars"></i>
                </button>

                <div class="IndicadorSeccionEncabezado" title="${TituloSeccionActual}">
                    <span class="NombreSeccionTextoEncabezado">${TituloSeccionActual}</span>
                </div>
            </div>

            <!-- Sección Central: Buscador Global Unificado -->
            <div class="SeccionEncabezadoCentro">
                <div class="ContenedorBuscadorSuperior">
                    <span class="IconoBuscadorSuperior"><i class="fa-solid fa-magnifying-glass"></i></span>
                    <input 
                        type="text" 
                        class="CampoEntradaBuscador" 
                        id="CampoEntradaBuscadorPrincipal" 
                        placeholder="Buscar música, letra o artista..."
                        value="${EstadoActual.TerminoBusquedaGlobal || ''}"
                    >
                    ${EstadoActual.TerminoBusquedaGlobal ? `
                    <button class="BotonLimpiarBusqueda" id="BotonLimpiarBuscadorGlobal" title="Limpiar búsqueda">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    ` : ''}
                </div>
            </div>

            <!-- Sección Derecha: Himno al Beni y Modo Oscuro -->
            <div class="SeccionEncabezadoDerecha">
                <button class="BotonCircularIcono BotonReproducirHimnoRapido" id="BotonReproducirHimnoEncabezado" title="Reproducir Himno al Beni">
                    <i class="fa-solid fa-flag" style="color: var(--ColorVerdeBeni);"></i>
                </button>

                <button class="BotonCircularIcono" id="BotonAlternarModoOscuro" title="Alternar Modo Claro / Oscuro">
                    <i class="fa-solid ${ModoOscuro ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
            </div>
        </header>
        `;
    }
}

window.ComponenteEncabezado = ComponenteEncabezado;
