/* ==========================================================================
   COMPONENTE: MODAL PARA CREAR NUEVO APORTE / CANCIÓN
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalCrearAporte {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar() {
        return `
        <div class="CapaFondoModalOscuro" id="ModalCrearAporteFondo">
            <div class="ContenedorVentanaModal" id="ContenedorVentanaModalCrear">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div class="TituloModalTexto"><i class="fa-solid fa-pen-nib" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>Aportar Nueva Letra o Canción</div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalCrear" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Formulario de Aporte -->
                <div class="CuerpoVentanaModal">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-weight: 700; font-size: 13px;">Título de la Canción / Letra *</label>
                        <input type="text" id="CampoNuevoTitulo" placeholder="Ej: Trinidad del Alma" required>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Autor / Compositor *</label>
                            <input type="text" id="CampoNuevoAutor" placeholder="Ej: Edna Miriam Edgley" value="Edna Miriam Edgley Cuellar">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Ritmo o Género *</label>
                            <select id="CampoNuevoGenero">
                                <option value="Taquirari">Taquirari</option>
                                <option value="Chovena">Chovena</option>
                                <option value="Carnavalito">Carnavalito</option>
                                <option value="Danza Ritual / Sarao">Danza Ritual / Sarao</option>
                                <option value="Polca Beniana">Polca Beniana</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Tono Sugerido</label>
                            <input type="text" id="CampoNuevoTono" placeholder="Ej: Re Mayor (D)">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <label style="font-weight: 700; font-size: 13px;">Tempo (BPM)</label>
                            <input type="number" id="CampoNuevoTempo" placeholder="108" value="108">
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-weight: 700; font-size: 13px;">Letra con Acordes entre Corchetes [ ] *</label>
                        <textarea 
                            id="CampoNuevaLetra" 
                            rows="7" 
                            style="font-family: var(--FuenteMusical); font-size: 13.5px;" 
                            placeholder="[D]Viva el Beni tierra hermosa...&#10;[G]Con tus pampas de primor..."
                            required
                        ></textarea>
                        <span style="font-size: 11px; color: var(--ColorTextoSecundario);">
                            <i class="fa-solid fa-lightbulb" style="color: #f59e0b; margin-right: 3px;"></i>Tip: Pon los acordes entre corchetes, por ejemplo <strong>[D]</strong> o <strong>[Am]</strong> antes de la sílaba.
                        </span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="font-weight: 700; font-size: 13px;">Mensaje para la publicación en Inicio</label>
                        <input type="text" id="CampoNuevoMensajeMuro" placeholder="¡Comparto esta hermosa composición con el IFAEL!">
                    </div>
                </div>

                <!-- Pie de Modal -->
                <div class="PieVentanaModal">
                    <button class="BotonAccionSecundario" id="BotonCancelarCrearAporte">
                        Cancelar
                    </button>
                    <button class="BotonAccionPrimario" id="BotonGuardarPublicarNuevoAporte">
                        <i class="fa-solid fa-paper-plane"></i> Publicar en Letras Mi Poblau
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalCrearAporte = ComponenteModalCrearAporte;
