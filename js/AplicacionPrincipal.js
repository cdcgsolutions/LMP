/* ==========================================================================
   PUNTO DE ENTRADA: APLICACIÓN PRINCIPAL (N-CAPAS)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class AplicacionLetrasMiPoblau {
    constructor() {
        this.InstanciaServicioEstado = null;
        this.InstanciaModeloAlmacenamiento = null;
        this.InstanciaServicioReproductor = null;
        this.InstanciaServicioNotificaciones = null;
        this.InstanciaControladorPrincipal = null;
    }

    Iniciar() {
        console.log("Iniciando Letras Mi Poblau (LMP) - Arquitectura N-Capas...");

        // 1. Instanciar Capa de Datos y Servicios
        this.InstanciaModeloAlmacenamiento = new window.ModeloAlmacenamiento();
        this.InstanciaServicioEstado = new window.ServicioEstado();
        this.InstanciaServicioReproductor = new window.ServicioReproductor();
        this.InstanciaServicioNotificaciones = new window.ServicioNotificaciones();

        // 2. Instanciar Capa de Controlador
        this.InstanciaControladorPrincipal = new window.ControladorPrincipal(
            this.InstanciaServicioEstado,
            this.InstanciaModeloAlmacenamiento,
            this.InstanciaServicioReproductor,
            this.InstanciaServicioNotificaciones
        );

        // 3. Montar y Ejecutar
        this.InstanciaControladorPrincipal.Inicializar();

        console.log("Letras Mi Poblau inicializado con éxito.");
    }
}

// Inicialización automática al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    const App = new AplicacionLetrasMiPoblau();
    App.Iniciar();
    window.AppLMP = App;
});
