/* ==========================================================================
   COMPONENTE: MENÚ DE NAVEGACIÓN LATERAL IZQUIERDO (ESTILO GOOGLE SITES / IFAEL)
   Galería y Archivo Musical Abierto - Letras Mi Poblau (LMP)
   Nombres en PascalCase
   ========================================================================== */

class ComponenteBarraLateralIzquierda {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento = null) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        const PestanaActiva = this.ServicioEstado.ObtenerEstado("PestanaActiva") || "inicio";
        const ModoOscuro = this.ServicioEstado.ObtenerEstado("ModoOscuro") || false;

        return `
        <aside class="ColumnaLateralIzquierda" id="ColumnaLateralIzquierda">
            <!-- 1. Cabecera del Menú Lateral (Branding Institucional) -->
            <div class="CabeceraMarcaMenuLateral" id="BotonLogotipoInicioLateral" title="Volver al Inicio">
                <img src="LogoInicialesSinFondoNegro.png" alt="LMP Logo" class="LogoMarcaSidebar" onerror="this.src='Logo1.png'">
                <div class="TextosMarcaSidebar">
                    <span class="NombreProyectoSidebar">Letras de Mi Poblao</span>
                    <span class="InstitucionSidebar">IFAEL • Trinidad, Beni</span>
                </div>
            </div>

            <div class="SeparadorMenuLateral"></div>

            <!-- 2. Menú de Navegación Principal (Navegación Vertical Google Sites) -->
            <nav class="NavegacionVerticalSidebar" aria-label="Menú principal de navegación">
                <span class="EtiquetaGrupoMenuLateral">GALERÍA & ARCHIVO</span>
                <ul class="ListaEnlacesMenuLateral">
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'inicio' || PestanaActiva === 'muro' ? 'EnlaceMenuActivo' : ''}" data-pestana="inicio">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-house"></i></div>
                        <span class="TextoEnlaceMenu">Inicio</span>
                    </li>
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'canciones' ? 'EnlaceMenuActivo' : ''}" data-pestana="canciones">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-scroll"></i></div>
                        <span class="TextoEnlaceMenu">Cancionero y Letras</span>
                    </li>
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'partituras' ? 'EnlaceMenuActivo' : ''}" data-pestana="partituras">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-file-audio"></i></div>
                        <span class="TextoEnlaceMenu">Partituras Digitales</span>
                    </li>
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'generos' ? 'EnlaceMenuActivo' : ''}" data-pestana="generos">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-guitar"></i></div>
                        <span class="TextoEnlaceMenu">Géneros Musicales</span>
                    </li>
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'artistas' ? 'EnlaceMenuActivo' : ''}" data-pestana="artistas">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-users"></i></div>
                        <span class="TextoEnlaceMenu">Artistas y Compositores</span>
                    </li>
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'ifael' ? 'EnlaceMenuActivo' : ''}" data-pestana="ifael">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-building-columns"></i></div>
                        <span class="TextoEnlaceMenu">Instituto IFAEL</span>
                    </li>
                    <li class="ItemEnlaceMenuLateral ${PestanaActiva === 'acerca-de' ? 'EnlaceMenuActivo' : ''}" data-pestana="acerca-de">
                        <div class="IconoContenedorMenu"><i class="fa-solid fa-circle-info"></i></div>
                        <span class="TextoEnlaceMenu">Acerca de Nosotros</span>
                    </li>
                </ul>

                <div class="SeparadorMenuLateral"></div>

                <!-- 3. Herramientas Rápidas -->
                <span class="EtiquetaGrupoMenuLateral">OBRA PATRIMONIAL</span>
                <ul class="ListaEnlacesMenuLateral">
                    <li class="ItemEnlaceMenuLateral ItemHimnoBeniLateral" data-accion="ver-himno">
                        <div class="IconoContenedorMenu IconoHimnoBeni"><i class="fa-solid fa-flag"></i></div>
                        <span class="TextoEnlaceMenu">Himno al Beni</span>
                    </li>
                </ul>
            </nav>

            <div class="EspaciadorFlexibleSidebar"></div>

            <!-- 4. Pie del Menú Lateral (Tema y Créditos Institucionales) -->
            <div class="PieMenuLateralHerramientas">
                <!-- Selector de Tema Claro / Oscuro -->
                <div class="FilaControlTemaLateral" id="BotonAlternarModoOscuroSidebar" title="Alternar Modo Claro / Oscuro">
                    <div class="IconoContenedorMenu">
                        <i class="fa-solid ${ModoOscuro ? 'fa-sun' : 'fa-moon'}"></i>
                    </div>
                    <span class="TextoEnlaceMenu">${ModoOscuro ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </div>

                <!-- Insignia de Galería Libre de Consulta -->
                <div class="FilaUsuarioLateral FilaGaleriaAbierta" title="Galería y Archivo Musical de Consulta Libre">
                    <div class="AvatarMiniaturaSidebar"><i class="fa-solid fa-music"></i></div>
                    <div class="InfoUsuarioMiniatura">
                        <span class="NombreUsuarioSidebar">Galería Pública</span>
                        <span class="RolUsuarioSidebar">Acceso Libre • IFAEL</span>
                    </div>
                </div>

                <!-- Mención del Proyecto de Grado -->
                <div class="CreditosProyectoFooterSidebar">
                    <span>Proyecto Artístico de Grado • IFAEL</span>
                </div>
            </div>
        </aside>
        `;
    }
}

window.ComponenteBarraLateralIzquierda = ComponenteBarraLateralIzquierda;
