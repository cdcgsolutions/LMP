/* ==========================================================================
   PUNTO DE ENTRADA: APLICACIÓN PRINCIPAL (N-CAPAS)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class AplicacionLetrasMiPoblau {
    constructor() {
        this.InstanciaServicioFirebase = null;
        this.InstanciaServicioEstado = null;
        this.InstanciaModeloAlmacenamiento = null;
        this.InstanciaServicioReproductor = null;
        this.InstanciaServicioNotificaciones = null;
        this.InstanciaControladorPrincipal = null;
    }

    async Iniciar() {
        console.log("Iniciando Letras Mi Poblau (LMP) - Arquitectura N-Capas...");

        // 0. Inicializar Firebase y Firestore
        this.InstanciaServicioFirebase = new window.ServicioFirebase();
        const FirebaseExitoso = this.InstanciaServicioFirebase.Inicializar();
        if (FirebaseExitoso) {
            console.log("[LMP] Firebase/Firestore conectado. Inicializando capa de datos...");
        } else {
            console.warn("[LMP] Firebase no se pudo inicializar. La app funcionará con datos locales (localStorage).");
        }

        // 1. Instanciar Capa de Datos y Servicios vinculando Firebase
        this.InstanciaModeloAlmacenamiento = new window.ModeloAlmacenamiento(this.InstanciaServicioFirebase);

        // 2. Cargar datos en vivo desde Firestore (con fallback transparente a caché local)
        if (FirebaseExitoso) {
            try {
                await this.InstanciaModeloAlmacenamiento.CargarDatosDesdeFirestore();
            } catch (ErrorCargaBD) {
                console.warn("[LMP] Error al cargar datos iniciales de Firestore, operando con caché local:", ErrorCargaBD);
            }
        }

        this.InstanciaServicioCloudinary = new window.ServicioCloudinary();
        this.InstanciaServicioEstado = new window.ServicioEstado();
        this.InstanciaServicioEstado.SincronizarUsuarioConBaseDatos(this.InstanciaModeloAlmacenamiento.ObtenerTodosLosUsuarios());
        this.InstanciaServicioReproductor = new window.ServicioReproductor();
        this.InstanciaServicioNotificaciones = new window.ServicioNotificaciones();

        // 3. Instanciar Capa de Controlador
        this.InstanciaControladorPrincipal = new window.ControladorPrincipal(
            this.InstanciaServicioEstado,
            this.InstanciaModeloAlmacenamiento,
            this.InstanciaServicioReproductor,
            this.InstanciaServicioNotificaciones,
            this.InstanciaServicioCloudinary
        );

        // 4. Montar y Ejecutar la UI
        this.InstanciaControladorPrincipal.Inicializar();

        console.log("Letras Mi Poblau inicializado con éxito con base de datos en vivo.");
    }
}

// Inicialización automática al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
    const App = new AplicacionLetrasMiPoblau();
    await App.Iniciar();
    window.AppLMP = App;

    // Registro de Service Worker para capacidades PWA y soporte offline
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((registro) => {
                console.log('Service Worker (LMP PWA) registrado con éxito:', registro.scope);
            })
            .catch((error) => {
                console.warn('Fallo en registro de Service Worker:', error);
            });
    }
});
