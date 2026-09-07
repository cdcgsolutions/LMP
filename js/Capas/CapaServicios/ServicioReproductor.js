/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE REPRODUCTOR DE AUDIO Y SÍNTESIS
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioReproductor {
    constructor() {
        this.ContextoAudio = null;
        this.NodoGanancia = null;
        this.NodoAnalizador = null;
        this.CancionActual = null;
        this.EstaReproduciendo = false;
        this.IndiceNotaActual = 0;
        this.TemporizadorMelodia = null;
        this.TiempoProgresoSegundos = 0;
        this.DuracionTotalEstimada = 30; // Segundos por defecto
        this.VolumenNivel = 1.0;
        this.EstaEnBucle = false;
        this.AnimacionCanvasId = null;

        // Frecuencias para notas musicales estándar
        this.FrecuenciasNotas = {
            "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63,
            "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00,
            "A#4": 466.16, "B4": 493.88, "C5": 523.25, "C#5": 554.37, "D5": 587.33,
            "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99,
            "A5": 880.00, "B5": 987.77
        };

        this.CallbacksProgreso = [];
    }

    InicializarContextoAudio() {
        if (!this.ContextoAudio) {
            const AudioContextClase = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClase) {
                this.ContextoAudio = new AudioContextClase();
                this.NodoGanancia = this.ContextoAudio.createGain();
                this.NodoGanancia.gain.setValueAtTime(this.VolumenNivel, this.ContextoAudio.currentTime);
                this.NodoAnalizador = this.ContextoAudio.createAnalyser();
                this.NodoAnalizador.fftSize = 64;
                this.NodoGanancia.connect(this.NodoAnalizador);
                this.NodoAnalizador.connect(this.ContextoAudio.destination);
            }
        }
        if (this.ContextoAudio && this.ContextoAudio.state === "suspended") {
            this.ContextoAudio.resume();
        }
    }

    RegistrarCallbackProgreso(Callback) {
        this.CallbacksProgreso.push(Callback);
    }

    CargarYReproducirCancion(ObjetoCancion) {
        this.InicializarContextoAudio();
        this.DetenerReproduccion();
        this.CancionActual = ObjetoCancion;
        this.EstaReproduciendo = true;
        this.IndiceNotaActual = 0;
        this.TiempoProgresoSegundos = 0;

        // Calcular duración estimada según notas
        if (ObjetoCancion.SecuenciaNotasMelodia && ObjetoCancion.SecuenciaNotasMelodia.length > 0) {
            const DuracionSecuencia = ObjetoCancion.SecuenciaNotasMelodia.reduce((Acumulado, Item) => Acumulado + Item.Duracion, 0);
            this.DuracionTotalEstimada = Math.max(15, Math.round(DuracionSecuencia * 4)); // Ciclo de 4 repeticiones
        } else {
            this.DuracionTotalEstimada = 25;
        }

        this.ReproducirSecuenciaRecursiva();
        this.IniciarRelojProgreso();
    }

    ReproducirSecuenciaRecursiva() {
        if (!this.EstaReproduciendo || !this.CancionActual) return;

        const Secuencia = this.CancionActual.SecuenciaNotasMelodia;
        if (!Secuencia || Secuencia.length === 0) return;

        const NotaInfo = Secuencia[this.IndiceNotaActual];
        this.TocarNotaFolklorica(NotaInfo.Nota, NotaInfo.Duracion);

        this.IndiceNotaActual = (this.IndiceNotaActual + 1) % Secuencia.length;

        this.TemporizadorMelodia = setTimeout(() => {
            if (this.EstaReproduciendo) {
                this.ReproducirSecuenciaRecursiva();
            }
        }, NotaInfo.Duracion * 1000);
    }

    TocarNotaFolklorica(NombreNota, DuracionSegundos) {
        if (!this.ContextoAudio || !this.NodoGanancia) return;

        const Frecuencia = this.FrecuenciasNotas[NombreNota] || 440;
        const TiempoActual = this.ContextoAudio.currentTime;

        // Oscilador 1: Onda Triangular (cálida, similar a quena/flauta mojeña)
        const OsciladorFlauta = this.ContextoAudio.createOscillator();
        OsciladorFlauta.type = "triangle";
        OsciladorFlauta.frequency.setValueAtTime(Frecuencia, TiempoActual);

        // Oscilador 2: Onda Senoidal (cuerpo acústico armónico)
        const OsciladorCuerpo = this.ContextoAudio.createOscillator();
        OsciladorCuerpo.type = "sine";
        OsciladorCuerpo.frequency.setValueAtTime(Frecuencia * 2, TiempoActual);

        // Ganancia de Envolvente ADSR
        const GananciaNota = this.ContextoAudio.createGain();
        GananciaNota.gain.setValueAtTime(0.001, TiempoActual);
        GananciaNota.gain.linearRampToValueAtTime(0.35, TiempoActual + 0.05); // Attack
        GananciaNota.gain.exponentialRampToValueAtTime(0.2, TiempoActual + DuracionSegundos * 0.5); // Decay
        GananciaNota.gain.exponentialRampToValueAtTime(0.001, TiempoActual + DuracionSegundos); // Release

        OsciladorFlauta.connect(GananciaNota);
        OsciladorCuerpo.connect(GananciaNota);
        GananciaNota.connect(this.NodoGanancia);

        OsciladorFlauta.start(TiempoActual);
        OsciladorCuerpo.start(TiempoActual);
        OsciladorFlauta.stop(TiempoActual + DuracionSegundos + 0.1);
        OsciladorCuerpo.stop(TiempoActual + DuracionSegundos + 0.1);
    }

    IniciarRelojProgreso() {
        if (this.IntervaloReloj) clearInterval(this.IntervaloReloj);

        this.IntervaloReloj = setInterval(() => {
            if (this.EstaReproduciendo) {
                this.TiempoProgresoSegundos += 0.5;
                if (this.TiempoProgresoSegundos >= this.DuracionTotalEstimada) {
                    if (this.EstaEnBucle) {
                        this.TiempoProgresoSegundos = 0;
                    } else {
                        this.DetenerReproduccion();
                    }
                }
                this.NotificarProgreso();
            }
        }, 500);
    }

    NotificarProgreso() {
        this.CallbacksProgreso.forEach(Cb => Cb({
            TiempoActual: this.TiempoProgresoSegundos,
            DuracionTotal: this.DuracionTotalEstimada,
            Porcentaje: Math.min(100, (this.TiempoProgresoSegundos / this.DuracionTotalEstimada) * 100),
            EstaReproduciendo: this.EstaReproduciendo
        }));
    }

    PausarReproduccion() {
        this.EstaReproduciendo = false;
        if (this.TemporizadorMelodia) clearTimeout(this.TemporizadorMelodia);
        this.NotificarProgreso();
    }

    ReanudarReproduccion() {
        if (!this.CancionActual) return;
        this.InicializarContextoAudio();
        this.EstaReproduciendo = true;
        this.ReproducirSecuenciaRecursiva();
        this.IniciarRelojProgreso();
        this.NotificarProgreso();
    }

    DetenerReproduccion() {
        this.EstaReproduciendo = false;
        if (this.TemporizadorMelodia) clearTimeout(this.TemporizadorMelodia);
        if (this.IntervaloReloj) clearInterval(this.IntervaloReloj);
        this.TiempoProgresoSegundos = 0;
        this.NotificarProgreso();
    }

    AjustarVolumen(NuevoNivel) {
        this.VolumenNivel = Math.max(0, Math.min(1, NuevoNivel));
        if (this.NodoGanancia && this.ContextoAudio) {
            this.NodoGanancia.gain.setValueAtTime(this.VolumenNivel, this.ContextoAudio.currentTime);
        }
    }

    AlternarBucle() {
        this.EstaEnBucle = !this.EstaEnBucle;
        return this.EstaEnBucle;
    }

    SaltarProgreso(NuevoPorcentaje) {
        this.TiempoProgresoSegundos = (NuevoPorcentaje / 100) * this.DuracionTotalEstimada;
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
