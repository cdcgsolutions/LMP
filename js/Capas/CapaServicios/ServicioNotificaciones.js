/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE NOTIFICACIONES TOASTR (ESTILO UPDS / BLASOR)
   Implementación basada en IMensajeToastr & AlertsToastr
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioNotificaciones {
    constructor() {
        this.ContenedorToasts = null;
        this.CrearContenedorSiNoExiste();

        // Exponer funciones globales para interoperabilidad estilo IJSRuntime / Blazor
        window.AlertsToastr = (tipoMensaje, mensaje, titulo) => {
            this.MostrarMensaje(mensaje, tipoMensaje, titulo);
        };
        window.clearToastr = () => {
            this.ClearToastrALL();
        };
    }

    CrearContenedorSiNoExiste() {
        let Contenedor = document.getElementById("ContenedorNotificacionesToast");
        if (!Contenedor) {
            Contenedor = document.createElement("div");
            Contenedor.id = "ContenedorNotificacionesToast";
            Contenedor.style.position = "fixed";
            Contenedor.style.top = "20px";
            Contenedor.style.right = "20px";
            Contenedor.style.display = "flex";
            Contenedor.style.flexDirection = "column";
            Contenedor.style.gap = "10px";
            Contenedor.style.zIndex = "99999";
            Contenedor.style.pointerEvents = "none";
            Contenedor.style.maxWidth = "calc(100vw - 32px)";
            document.body.appendChild(Contenedor);
        }
        this.ContenedorToasts = Contenedor;
    }

    /* --------------------------------------------------------------------------
       1. MÉTODOS CON TÍTULO (IMensajeToastr)
       -------------------------------------------------------------------------- */
    MostrarMensajeErrorWithTitle(mensaje, titulo = "Error") {
        this.MostrarMensaje(mensaje, "error", titulo);
    }

    MostrarMensajeExitosoWithTitle(mensaje, titulo = "Éxito") {
        this.MostrarMensaje(mensaje, "success", titulo);
    }

    MostrarMensajeInfoWithTitle(mensaje, titulo = "Información") {
        this.MostrarMensaje(mensaje, "info", titulo);
    }

    MostrarMensajeWarningWithTitle(mensaje, titulo = "Advertencia") {
        this.MostrarMensaje(mensaje, "warning", titulo);
    }

    /* --------------------------------------------------------------------------
       2. MÉTODOS SIN TÍTULO (IMensajeToastr)
       -------------------------------------------------------------------------- */
    MostrarMensajeError(mensaje) {
        this.MostrarMensaje(mensaje, "error", null);
    }

    MostrarMensajeExitoso(mensaje) {
        this.MostrarMensaje(mensaje, "success", null);
    }

    MostrarMensajeInfo(mensaje) {
        this.MostrarMensaje(mensaje, "info", null);
    }

    MostrarMensajeWarning(mensaje) {
        this.MostrarMensaje(mensaje, "warning", null);
    }

    /* --------------------------------------------------------------------------
       3. LIMPIEZA TOTAL (clearToastr)
       -------------------------------------------------------------------------- */
    ClearToastrALL() {
        if (this.ContenedorToasts) {
            this.ContenedorToasts.innerHTML = "";
        }
    }

    /* --------------------------------------------------------------------------
       4. COMPATIBILIDAD CON LLAMADAS ANTERIORES
       -------------------------------------------------------------------------- */
    MostrarMensajeToast(Mensaje, Icono = null, Tipo = "info") {
        this.MostrarMensaje(Mensaje, Tipo, null, Icono);
    }

    /* --------------------------------------------------------------------------
       5. MOTOR DE RENDERIZADO VISUAL TOASTR (ARRIBA A LA DERECHA)
       -------------------------------------------------------------------------- */
    MostrarMensaje(mensaje, tipoMensaje = "info", titulo = null, iconoPersonalizado = null) {
        this.CrearContenedorSiNoExiste();

        // Configuración de colores sólidos e iconos inspirados en SAADS / UPDS Toastr
        const Configuraciones = {
            success: {
                ColorFondo: "#43a047", // Verde característico de la captura UPDS
                ColorTexto: "#ffffff",
                IconoDefecto: '<i class="fa-solid fa-check"></i>'
            },
            error: {
                ColorFondo: "#e53935", // Rojo alerta
                ColorTexto: "#ffffff",
                IconoDefecto: '<i class="fa-solid fa-xmark"></i>'
            },
            warning: {
                ColorFondo: "#f59e0b", // Ámbar / Naranja
                ColorTexto: "#ffffff",
                IconoDefecto: '<i class="fa-solid fa-triangle-exclamation"></i>'
            },
            info: {
                ColorFondo: "#1877f2", // Azul información
                ColorTexto: "#ffffff",
                IconoDefecto: '<i class="fa-solid fa-circle-info"></i>'
            }
        };

        const TipoNormalizado = (tipoMensaje || "info").toLowerCase();
        const Config = Configuraciones[TipoNormalizado] || Configuraciones.info;
        const IconoFinal = iconoPersonalizado || Config.IconoDefecto;

        const ElementoToast = document.createElement("div");
        ElementoToast.className = `NotificacionToastItem Toastr_${TipoNormalizado}`;
        ElementoToast.style.pointerEvents = "auto";
        ElementoToast.style.backgroundColor = Config.ColorFondo;
        ElementoToast.style.color = Config.ColorTexto;
        ElementoToast.style.borderRadius = "6px";
        ElementoToast.style.padding = "12px 18px";
        ElementoToast.style.display = "flex";
        ElementoToast.style.alignItems = "center";
        ElementoToast.style.gap = "14px";
        ElementoToast.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.28)";
        ElementoToast.style.minWidth = "260px";
        ElementoToast.style.maxWidth = "420px";
        ElementoToast.style.cursor = "pointer";
        ElementoToast.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        ElementoToast.style.transform = "translateX(40px)";
        ElementoToast.style.opacity = "0";

        let ContenidoTextoHtml = "";
        if (titulo) {
            ContenidoTextoHtml = `
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="font-weight: 700; font-size: 14px; color: #ffffff;">${titulo}</div>
                    <div style="font-size: 12.5px; opacity: 0.95; line-height: 1.35; color: #ffffff;">${mensaje}</div>
                </div>
            `;
        } else {
            ContenidoTextoHtml = `
                <div style="font-size: 13.5px; font-weight: 600; line-height: 1.35; color: #ffffff;">
                    ${mensaje}
                </div>
            `;
        }

        ElementoToast.innerHTML = `
            <div style="font-size: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #ffffff;">
                ${IconoFinal}
            </div>
            <div style="flex: 1; min-width: 0;">
                ${ContenidoTextoHtml}
            </div>
        `;

        // Cerrar al hacer clic
        ElementoToast.addEventListener("click", () => {
            this.RemoverElementoToast(ElementoToast);
        });

        this.ContenedorToasts.appendChild(ElementoToast);

        // Animación de entrada suave
        requestAnimationFrame(() => {
            ElementoToast.style.transform = "translateX(0)";
            ElementoToast.style.opacity = "1";
        });

        // Temporizador de salida automática
        const DuracionMs = titulo ? 4000 : 3200;
        const Temporizador = setTimeout(() => {
            this.RemoverElementoToast(ElementoToast);
        }, DuracionMs);

        ElementoToast._Temporizador = Temporizador;
    }

    RemoverElementoToast(ElementoToast) {
        if (!ElementoToast) return;
        if (ElementoToast._Temporizador) {
            clearTimeout(ElementoToast._Temporizador);
        }
        ElementoToast.style.transform = "translateX(30px) scale(0.95)";
        ElementoToast.style.opacity = "0";
        setTimeout(() => {
            if (ElementoToast.parentNode) {
                ElementoToast.parentNode.removeChild(ElementoToast);
            }
        }, 300);
    }
}

window.ServicioNotificaciones = ServicioNotificaciones;
