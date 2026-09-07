/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE NOTIFICACIONES Y TOASTS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioNotificaciones {
    constructor() {
        this.ContenedorToasts = null;
        this.CrearContenedorSiNoExiste();
    }

    CrearContenedorSiNoExiste() {
        let Contenedor = document.getElementById("ContenedorNotificacionesToast");
        if (!Contenedor) {
            Contenedor = document.createElement("div");
            Contenedor.id = "ContenedorNotificacionesToast";
            Contenedor.style.position = "fixed";
            Contenedor.style.bottom = "80px";
            Contenedor.style.left = "24px";
            Contenedor.style.display = "flex";
            Contenedor.style.flexDirection = "column";
            Contenedor.style.gap = "8px";
            Contenedor.style.zIndex = "9999";
            Contenedor.style.pointerEvents = "none";
            document.body.appendChild(Contenedor);
        }
        this.ContenedorToasts = Contenedor;
    }

    MostrarMensajeToast(Mensaje, Icono = '<i class="fa-solid fa-bell"></i>', Tipo = "info") {
        this.CrearContenedorSiNoExiste();

        const ElementoToast = document.createElement("div");
        ElementoToast.className = "NotificacionToastItem";
        ElementoToast.style.pointerEvents = "auto";
        ElementoToast.style.backgroundColor = "var(--ColorFondoSuperficie, #ffffff)";
        ElementoToast.style.color = "var(--ColorTextoPrincipal, #050505)";
        ElementoToast.style.border = "1px solid var(--ColorBordeSuave, #e4e6eb)";
        ElementoToast.style.borderRadius = "var(--RadioBotonPill, 9999px)";
        ElementoToast.style.padding = "10px 18px";
        ElementoToast.style.display = "flex";
        ElementoToast.style.alignItems = "center";
        ElementoToast.style.gap = "10px";
        ElementoToast.style.boxShadow = "var(--SombraNivelDos, 0 4px 12px rgba(0,0,0,0.15))";
        ElementoToast.style.fontSize = "13.5px";
        ElementoToast.style.fontWeight = "600";
        ElementoToast.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        ElementoToast.style.transform = "translateY(20px)";
        ElementoToast.style.opacity = "0";

        ElementoToast.innerHTML = `
            <span style="font-size: 16px;">${Icono}</span>
            <span>${Mensaje}</span>
        `;

        this.ContenedorToasts.appendChild(ElementoToast);

        requestAnimationFrame(() => {
            ElementoToast.style.transform = "translateY(0)";
            ElementoToast.style.opacity = "1";
        });

        setTimeout(() => {
            ElementoToast.style.transform = "translateY(10px)";
            ElementoToast.style.opacity = "0";
            setTimeout(() => {
                if (ElementoToast.parentNode) {
                    ElementoToast.parentNode.removeChild(ElementoToast);
                }
            }, 300);
        }, 3200);
    }
}

window.ServicioNotificaciones = ServicioNotificaciones;
