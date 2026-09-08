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

        this.InstanciaServicioCloudinary = new window.ServicioCloudinary();
        this.InstanciaServicioEstado = new window.ServicioEstado();
        this.InstanciaServicioEstado.SincronizarUsuarioConBaseDatos(this.InstanciaModeloAlmacenamiento.ObtenerTodosLosUsuarios());
        this.InstanciaServicioReproductor = new window.ServicioReproductor();
        this.InstanciaServicioNotificaciones = new window.ServicioNotificaciones();

        // 2. Instanciar Capa de Controlador
        this.InstanciaControladorPrincipal = new window.ControladorPrincipal(
            this.InstanciaServicioEstado,
            this.InstanciaModeloAlmacenamiento,
            this.InstanciaServicioReproductor,
            this.InstanciaServicioNotificaciones,
            this.InstanciaServicioCloudinary
        );

        // 3. Montar y Ejecutar la UI INMEDIATAMENTE (0ms de espera, sin pantalla en blanco)
        this.InstanciaControladorPrincipal.Inicializar();

        // 4. Sincronizar datos en vivo desde Firestore en segundo plano (Skeletons activos mientras carga)
        if (FirebaseExitoso) {
            this.SincronizarDatosEnSegundoPlano();
        }

        console.log("Letras Mi Poblau montado e inicializado con éxito.");
    }

    async SincronizarDatosEnSegundoPlano() {
        try {
            console.log("[LMP] Sincronizando datos con Firestore en segundo plano...");
            const Exito = await this.InstanciaModeloAlmacenamiento.CargarDatosDesdeFirestore();
            if (Exito) {
                this.InstanciaServicioEstado.SincronizarUsuarioConBaseDatos(this.InstanciaModeloAlmacenamiento.ObtenerTodosLosUsuarios());
                console.log("[LMP] Sincronización en segundo plano completada con éxito.");
            }
        } catch (ErrorCargaBD) {
            console.warn("[LMP] Error al sincronizar con Firestore en segundo plano:", ErrorCargaBD);
        } finally {
            this.InstanciaControladorPrincipal.ActualizarVistaTrasSincronizacionFirestore();
        }
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
