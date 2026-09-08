/* ==========================================================================
   COMPONENTE: MODAL REGISTRAR NUEVO GÉNERO Y RITMO BENIANO
   Arquitectura modular: Componente sobre Componente.
   Integra ComponenteSelectorIconosFA para búsqueda directa en Font Awesome.
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalCrearGenero {
    constructor() {
        this.SelectorIconos = new ComponenteSelectorIconosFA();
        this.ColorSeleccionado = "#1877f2";
        this.IconoSeleccionado = "fa-solid fa-guitar";

        this.SugerenciasCompas = [
            "2/4 Rápido y Festivo",
            "2/4 o 4/4 Sincopado",
            "4/4 Marcial y Solemne",
            "3/4 Criollo",
            "6/8 Tradicional",
            "Ritmo Ceremonial"
        ];
    }

    Renderizar() {
        return `
        <div class="CapaFondoModalOscuro" id="ModalCrearGeneroFondo">
            <div class="ContenedorVentanaModal ModalAnchoExtraGrande" id="ContenedorVentanaModalCrearGenero" style="max-width: 820px;">
                
                <!-- 1. Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div class="TituloModalTexto" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-plus-circle" style="color: var(--ColorPrimarioAzul);"></i>
                        <span>Registrar Nuevo Ritmo y Género Beniano</span>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalCrearGenero" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- 2. Cuerpo del Modal con Formulario y Previsualización -->
                <div class="CuerpoVentanaModal" style="max-height: calc(90vh - 125px); overflow-y: auto;">
                    <form id="FormularioCrearGenero" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 16px;">

                        <!-- Bloque 2: Color Personalizado del Ritmo (Sólido, Sin Gradientes) -->
                        <div style="background: var(--ColorFondoSecundario); padding: 14px 16px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                            <div style="font-weight: 700; font-size: 13.5px; color: var(--ColorPrimarioAzul); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-palette"></i> Color de la tarjeta
                            </div>
                            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 12px; background: var(--ColorFondoSuperficie); padding: 8px 14px; border-radius: var(--RadioPequeno); border: 1.5px solid #b0b3b8 !important;">
                                    <input type="color" id="InputColorPersonalizadoGenero" value="${this.ColorSeleccionado}" title="Haz clic para elegir un color" style="width: 44px; height: 44px; border: none; border-radius: var(--RadioPequeno); cursor: pointer; padding: 0; background: none;">
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <label for="InputHexColorGenero" style="font-size: 11px; font-weight: 700; color: var(--ColorTextoSecundario); text-transform: uppercase; letter-spacing: 0.5px;">
                                            Código HEX
                                        </label>
                                        <input type="text" id="InputHexColorGenero" value="${this.ColorSeleccionado.toUpperCase()}" maxlength="7" placeholder="#1877F2" style="width: 110px; padding: 5px 8px; font-family: monospace; font-size: 14px; font-weight: 700; text-transform: uppercase; border: 1.5px solid #b0b3b8 !important; border-radius: var(--RadioPequeno); background: var(--ColorFondoPrincipal); color: var(--ColorTextoPrincipal);">
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" id="CampoColorGeneroSeleccionado" value="${this.ColorSeleccionado}">
                        </div>

                        <!-- Bloque 3: Selector de Iconos Representativo (Componente sobre Componente) -->
                        <div style="background: var(--ColorFondoSecundario); padding: 14px 16px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                            <div style="font-weight: 700; font-size: 13.5px; color: var(--ColorPrimarioAzul); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-icons"></i> Icono Representativo 
                            </div>
                            <!-- Subcomponente embebido -->
                            ${this.SelectorIconos.Renderizar(this.IconoSeleccionado)}
                        </div>

                        <!-- Bloque 4: Datos Musicales y Ficha Técnica -->
                        <div style="background: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                            <div style="font-weight: 700; font-size: 13.5px; color: var(--ColorPrimarioAzul); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-music"></i> Información y Ficha Técnica del Ritmo
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoGeneroNombre" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Nombre del Ritmo o Género <span style="color: var(--ColorRojoPeligro);">*</span>
                                    </label>
                                    <input type="text" id="CampoNuevoGeneroNombre" placeholder="Ej. Polca Beniana, Sarao, Chovena..." required maxlength="80">
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoGeneroOrigen" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Origen Geográfico o Cultural
                                    </label>
                                    <input type="text" id="CampoNuevoGeneroOrigen" placeholder="Ej. San Ignacio de Moxos y Trinidad, Beni" maxlength="120">
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 12px;">
                                <label for="CampoNuevoGeneroCompas" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                    Compás Musical Típico
                                </label>
                                <select id="CampoNuevoGeneroCompas" style="cursor: pointer;">
                                    <option value="">Selecciona el compás musical...</option>
                                    ${this.SugerenciasCompas.map(Compas => `
                                        <option value="${Compas}">${Compas}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoGeneroTempo" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Tempo Típico (Opcional)
                                    </label>
                                    <input type="text" id="CampoNuevoGeneroTempo" placeholder="Ej. 116 BPM (Allegro moderato)" maxlength="60">
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoGeneroCaracter" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Carácter / Ánimo (Opcional)
                                    </label>
                                    <input type="text" id="CampoNuevoGeneroCaracter" placeholder="Ej. Alegre, festivo, ceremonial..." maxlength="60">
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 12px;">
                                <label for="CampoNuevoGeneroInstrumentos" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                    Instrumentos Tradicionales (Separados por coma)
                                </label>
                                <input type="text" id="CampoNuevoGeneroInstrumentos" placeholder="Ej. Bajón Mojeño, Flauta de Pan, Tamboril, Violín jesuítico" maxlength="220">
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 12px;">
                                <label for="CampoNuevoGeneroDescripcion" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                    Reseña Histórica y Cultural
                                </label>
                                <textarea id="CampoNuevoGeneroDescripcion" rows="3" placeholder="Breve descripción del origen, significado folclórico y tradición musical en el Beni..." style="resize: vertical; line-height: 1.45;"></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- 3. Pie de Acciones del Modal -->
                <div class="PieVentanaModal">
                    <button type="button" class="BotonAccionSecundario" id="BotonCancelarCrearGenero">
                        Cancelar
                    </button>
                    <button type="button" class="BotonAccionPrimario" id="BotonGuardarNuevoGenero">
                        <i class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i> Guardar Ritmo
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    VincularEventos() {
        const InputColorPersonalizado = document.getElementById("InputColorPersonalizadoGenero");
        const InputHexColor = document.getElementById("InputHexColorGenero");
        const CampoColorOculto = document.getElementById("CampoColorGeneroSeleccionado");

        // Función para cambiar de color
        const ActualizarColor = (HexColor) => {
            if (!HexColor) return;
            if (!HexColor.startsWith("#")) HexColor = "#" + HexColor;
            this.ColorSeleccionado = HexColor;
            if (CampoColorOculto) CampoColorOculto.value = HexColor;
            if (InputColorPersonalizado && InputColorPersonalizado.value.toLowerCase() !== HexColor.toLowerCase()) {
                InputColorPersonalizado.value = HexColor;
            }
            if (InputHexColor && InputHexColor.value.toUpperCase() !== HexColor.toUpperCase()) {
                InputHexColor.value = HexColor.toUpperCase();
            }
        };

        // Cambio en selector nativo de color
        if (InputColorPersonalizado) {
            InputColorPersonalizado.addEventListener("input", (e) => {
                ActualizarColor(e.target.value);
            });
        }

        // Cambio manual en el campo de texto HEX
        if (InputHexColor) {
            InputHexColor.addEventListener("input", (e) => {
                let Val = e.target.value.trim();
                if (Val.length > 0 && !Val.startsWith("#")) Val = "#" + Val;
                if (/^#[0-9A-Fa-f]{6}$/.test(Val)) {
                    ActualizarColor(Val);
                }
            });
            InputHexColor.addEventListener("blur", (e) => {
                let Val = e.target.value.trim();
                if (!Val.startsWith("#")) Val = "#" + Val;
                if (!/^#[0-9A-Fa-f]{6}$/.test(Val)) {
                    InputHexColor.value = this.ColorSeleccionado.toUpperCase();
                } else {
                    ActualizarColor(Val);
                }
            });
        }

        // Vincular el subcomponente de búsqueda de iconos
        this.SelectorIconos.VincularEventos((ClaseIcono) => {
            this.IconoSeleccionado = ClaseIcono;
        });
    }
}

window.ComponenteModalCrearGenero = ComponenteModalCrearGenero;
