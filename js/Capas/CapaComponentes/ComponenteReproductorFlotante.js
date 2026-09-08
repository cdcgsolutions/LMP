/* ==========================================================================
   COMPONENTE: REPRODUCTOR FLOTANTE INFERIOR CONTINUO
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteReproductorFlotante {
    constructor(InstanciaServicioEstado, InstanciaServicioReproductor) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ServicioReproductor = InstanciaServicioReproductor;
    }

    FormatearSegundos(SegundosTotales) {
        const Minutos = Math.floor(SegundosTotales / 60);
        const Segundos = Math.floor(SegundosTotales % 60);
        return `${Minutos}:${Segundos < 10 ? '0' : ''}${Segundos}`;
    }

    Renderizar() {
        const Cancion = this.ServicioReproductor.CancionActual || {
            Titulo: "Selecciona una canción",
            Autor: "Letras Mi Poblau",
            Caratula: "Logo1.png",
            Genero: "Beni Folk"
        };
        const EstaReproduciendo = this.ServicioReproductor.EstaReproduciendo;
        const EsVisible = !!this.ServicioReproductor.CancionActual;

        return `
        <div class="BarraReproductorInferiorFlotante ${EsVisible ? 'ReproductorVisible' : ''}" id="BarraReproductorInferiorFlotante">
            <!-- Pista y Autor Actual -->
            <div class="SeccionPistaReproductor">
                <img 
                    src="${Cancion.Caratula || 'Logo1.png'}" 
                    alt="${Cancion.Titulo}" 
                    class="CaratulaPistaReproductor" 
                    id="CaratulaPistaFlotante"
                    onerror="this.src='Logo1.png'"
                >
                <div class="TextoInfoPistaReproductor">
                    <div class="TituloPistaReproductor" id="TituloPistaFlotante">${Cancion.Titulo}</div>
                    <div class="AutorPistaReproductor" id="AutorPistaFlotante">${Cancion.Autor} • ${Cancion.Genero}</div>
                </div>
            </div>

            <!-- Controles Centrales de Audio -->
            <div class="SeccionControlesCentralesReproductor">
                <div class="BotonesControlesReproductor">
                    <button class="BotonCircularIcono" id="BotonCancionAnterior" style="width: 30px; height: 30px; font-size: 13px;" title="Canción anterior"><i class="fa-solid fa-backward-step"></i></button>
                    <button class="BotonReproducirGrande" id="BotonReproducirPausarFlotante" title="${EstaReproduciendo ? 'Pausar' : 'Reproducir'}">
                        ${EstaReproduciendo ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>'}
                    </button>
                    <button class="BotonCircularIcono" id="BotonCancionSiguiente" style="width: 30px; height: 30px; font-size: 13px;" title="Siguiente canción"><i class="fa-solid fa-forward-step"></i></button>
                    <button class="BotonCircularIcono" id="BotonAlternarBucle" style="width: 30px; height: 30px; font-size: 12px; color: ${this.ServicioReproductor.EstaEnBucle ? 'var(--ColorPrimarioAzul)' : 'inherit'};" title="Repetir en bucle"><i class="fa-solid fa-repeat"></i></button>
                </div>

                <div class="FilaProgresoYDuracion">
                    <span id="TiempoTranscurridoFlotante">0:00</span>
                    <input type="range" class="DeslizadorProgresoAudio" id="DeslizadorProgresoAudio" min="0" max="100" value="0">
                    <span id="TiempoTotalFlotante">0:30</span>
                </div>
            </div>

            <!-- Visualizador de Ondas, Volumen y Cierre -->
            <div class="SeccionVolumenYOpcionesReproductor">
                <canvas class="LienzoVisualizadorAudio" id="LienzoVisualizadorAudio" width="70" height="24"></canvas>
                <button class="BotonIconoVolumen" id="BotonSilenciarVolumen" style="background: none; border: none; font-size: 15px; cursor: pointer; padding: 0; display: flex; align-items: center; color: var(--ColorTextoPrincipal);" title="Silenciar / Activar volumen"><i class="fa-solid fa-volume-high"></i></button>
                <input 
                    type="range" 
                    class="DeslizadorVolumenAudio" 
                    id="DeslizadorVolumenAudio" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value="1" 
                    title="Volumen: 100%"
                >
                <button class="BotonCircularIcono" id="BotonCerrarReproductorFlotante" title="Cerrar reproductor"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        `;
    }
}

window.ComponenteReproductorFlotante = ComponenteReproductorFlotante;
