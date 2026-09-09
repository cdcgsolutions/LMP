/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE REPRODUCTOR DE AUDIO
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioReproductor {
    constructor() {
        this.CancionActual = null;
        this.EstaReproduciendo = false;
        this.TiempoProgresoSegundos = 0;
        this.DuracionTotalEstimada = 0;
        this.VolumenNivel = 1.0;
        this.EstaEnBucle = false;
        this.AnimacionCanvasId = null;

        // Elemento de audio HTML5 para reproducción de archivos reales (.mp3, URLs, etc.)
        this.ElementoAudio = new Audio();
        this.ConfigurarEventosElementoAudio();

        this.CallbacksProgreso = [];
    }

    ConfigurarEventosElementoAudio() {
        this.ElementoAudio.addEventListener("loadedmetadata", () => {
            if (this.ElementoAudio.duration && !isNaN(this.ElementoAudio.duration) && isFinite(this.ElementoAudio.duration)) {
                this.DuracionTotalEstimada = this.ElementoAudio.duration;
            }
            this.NotificarProgreso();
        });

        this.ElementoAudio.addEventListener("timeupdate", () => {
            if (this.CancionActual && this.CancionActual.AudioUrl) {
                this.TiempoProgresoSegundos = this.ElementoAudio.currentTime;
                if (this.ElementoAudio.duration && !isNaN(this.ElementoAudio.duration) && isFinite(this.ElementoAudio.duration)) {
                    this.DuracionTotalEstimada = this.ElementoAudio.duration;
                }
                this.NotificarProgreso();
            }
        });

        this.ElementoAudio.addEventListener("ended", () => {
            if (this.EstaEnBucle) {
                this.ElementoAudio.currentTime = 0;
                this.ElementoAudio.play().catch(e => console.warn(e));
            } else {
                this.DetenerReproduccion();
            }
        });

        this.ElementoAudio.addEventListener("error", (ErrorAudio) => {
            console.warn("[ServicioReproductor] Fallo al cargar archivo de audio HTML5:", ErrorAudio);
            this.EstaReproduciendo = false;
            this.NotificarProgreso();
        });
    }

    RegistrarCallbackProgreso(Callback) {
        this.CallbacksProgreso.push(Callback);
    }

    CargarYReproducirCancion(ObjetoCancion) {
        this.DetenerReproduccion();

        if (!ObjetoCancion || !ObjetoCancion.AudioUrl || ObjetoCancion.AudioUrl.trim() === "") {
            this.CancionActual = ObjetoCancion;
            this.EstaReproduciendo = false;
            this.TiempoProgresoSegundos = 0;
            this.DuracionTotalEstimada = 0;
            this.NotificarProgreso();
            return false;
        }

        this.CancionActual = ObjetoCancion;
        this.EstaReproduciendo = true;
        this.TiempoProgresoSegundos = 0;
        this.DuracionTotalEstimada = 180; // Provisional hasta que carguen los metadatos

        this.ElementoAudio.src = ObjetoCancion.AudioUrl;
        this.ElementoAudio.volume = this.VolumenNivel;
        this.ElementoAudio.loop = this.EstaEnBucle;

        const PromesaPlay = this.ElementoAudio.play();
        if (PromesaPlay !== undefined) {
            PromesaPlay.catch(ErrorAudio => {
                console.warn("[ServicioReproductor] Reproducción de audio bloqueada o demorada:", ErrorAudio);
            });
        }

        this.NotificarProgreso();
        return true;
    }

    NotificarProgreso() {
        const DuracionValida = Math.max(1, this.DuracionTotalEstimada || 1);
        this.CallbacksProgreso.forEach(Cb => Cb({
            TiempoActual: this.TiempoProgresoSegundos,
            DuracionTotal: this.DuracionTotalEstimada,
            Porcentaje: Math.min(100, (this.TiempoProgresoSegundos / DuracionValida) * 100),
            EstaReproduciendo: this.EstaReproduciendo
        }));
    }

    PausarReproduccion() {
        this.EstaReproduciendo = false;
        if (this.ElementoAudio && !this.ElementoAudio.paused) {
            this.ElementoAudio.pause();
        }
        this.NotificarProgreso();
    }

    ReanudarReproduccion() {
        if (!this.CancionActual || !this.CancionActual.AudioUrl || this.CancionActual.AudioUrl.trim() === "") return;
        this.EstaReproduciendo = true;
        this.ElementoAudio.play().catch(e => console.warn(e));
        this.NotificarProgreso();
    }

    DetenerReproduccion() {
        this.EstaReproduciendo = false;
        if (this.ElementoAudio) {
            this.ElementoAudio.pause();
            this.ElementoAudio.currentTime = 0;
        }
        this.TiempoProgresoSegundos = 0;
        this.NotificarProgreso();
    }

    AjustarVolumen(NuevoNivel) {
        this.VolumenNivel = Math.max(0, Math.min(1, NuevoNivel));
        if (this.ElementoAudio) {
            this.ElementoAudio.volume = this.VolumenNivel;
        }
    }

    AlternarBucle() {
        this.EstaEnBucle = !this.EstaEnBucle;
        if (this.ElementoAudio) {
            this.ElementoAudio.loop = this.EstaEnBucle;
        }
        return this.EstaEnBucle;
    }

    SaltarProgreso(NuevoPorcentaje) {
        if (this.CancionActual && this.CancionActual.AudioUrl && this.ElementoAudio && this.ElementoAudio.duration) {
            const NuevoTiempo = (NuevoPorcentaje / 100) * this.ElementoAudio.duration;
            this.ElementoAudio.currentTime = NuevoTiempo;
            this.TiempoProgresoSegundos = NuevoTiempo;
        } else {
            this.TiempoProgresoSegundos = (NuevoPorcentaje / 100) * (this.DuracionTotalEstimada || 1);
        }
        this.NotificarProgreso();
    }

    DibujarVisualizadorEnLienzo(ElementoCanvas) {
        if (!ElementoCanvas) return;
        const ContextoCanvas = ElementoCanvas.getContext("2d");
        const Ancho = ElementoCanvas.width;
        const Alto = ElementoCanvas.height;

        const DibujarCuadro = () => {
            ContextoCanvas.clearRect(0, 0, Ancho, Alto);

            const CantidadBarras = 10;
            const AnchoBarra = (Ancho / CantidadBarras) - 2;

            for (let i = 0; i < CantidadBarras; i++) {
                let AlturaBarra = 3;
                if (this.EstaReproduciendo) {
                    // Generar alturas dinámicas rítmicas
                    const FactorOscilacion = Math.sin((Date.now() / 150) + (i * 0.8)) * 0.5 + 0.5;
                    AlturaBarra = Math.max(4, FactorOscilacion * (Alto - 2));
                }

                const PosicionX = i * (AnchoBarra + 2);
                const PosicionY = Alto - AlturaBarra;

                // Gradiente Beniano verde y azul
                const GradienteBarra = ContextoCanvas.createLinearGradient(0, Alto, 0, 0);
                GradienteBarra.addColorStop(0, "#1877f2");
                GradienteBarra.addColorStop(1, "#2e7d32");

                ContextoCanvas.fillStyle = GradienteBarra;
                ContextoCanvas.beginPath();
                ContextoCanvas.roundRect(PosicionX, PosicionY, AnchoBarra, AlturaBarra, 2);
                ContextoCanvas.fill();
            }

            this.AnimacionCanvasId = requestAnimationFrame(DibujarCuadro);
        };

        if (this.AnimacionCanvasId) cancelAnimationFrame(this.AnimacionCanvasId);
        DibujarCuadro();
    }
}

window.ServicioReproductor = ServicioReproductor;
