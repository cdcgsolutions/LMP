/* ==========================================================================
   COMPONENTE: MODAL CREAR NUEVO ARTISTA Y COMPOSITOR
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalCrearArtista {
    constructor() {
        this.Limites = {
            Biografia: { Palabras: 500, Caracteres: 3000 },
            Inicios: { Palabras: 500, Caracteres: 3000 },
            Trayectoria: { Palabras: 600, Caracteres: 3500 },
            ObrasDestacadas: { Palabras: 150, Caracteres: 1000 },
            Legado: { Palabras: 500, Caracteres: 3000 },
            CitaCelebre: { Palabras: 50, Caracteres: 300 }
        };
    }

    Renderizar() {
        return `
        <div class="CapaFondoModalOscuro" id="ModalCrearArtistaFondo">
            <div class="ContenedorVentanaModal ModalAnchoExtraGrande" id="ContenedorVentanaModalCrearArtista">
                
                <!-- 1. Encabezado del Modal -->
                <div class="EncabezadoVentanaModal">
                    <div class="TituloModalTexto" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-user-plus" style="color: var(--ColorPrimarioAzul);"></i>
                        <span>Registrar Nuevo Artista y Compositor</span>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalCrearArtista" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- 2. Formulario con Scroll Interno -->
                <div class="CuerpoVentanaModal" style="max-height: calc(90vh - 130px); overflow-y: auto;">
                    <form id="FormularioCrearArtista" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 16px;">

                        <!-- Bloque A: Datos Básicos e Identificación -->
                        <div style="background: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                            <div style="font-weight: 700; font-size: 13.5px; color: var(--ColorPrimarioAzul); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-id-card"></i> Datos Básicos del Artista
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaNombre" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Nombre Completo <span style="color: var(--ColorRojoPeligro);">*</span>
                                    </label>
                                    <input type="text" id="CampoNuevoArtistaNombre" placeholder="Nombre y apellidos del artista" required maxlength="120">
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaApodo" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Nombre Artístico / Apodo
                                    </label>
                                    <input type="text" id="CampoNuevoArtistaApodo" placeholder="Nombre artístico o seudónimo (Opcional)" maxlength="100">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 12px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaNacimiento" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Fecha de Nacimiento
                                    </label>
                                    <input type="text" id="CampoNuevoArtistaNacimiento" placeholder="Ej. 18 de noviembre de 1950" maxlength="60">
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaLugar" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Lugar de Nacimiento / Origen
                                    </label>
                                    <input type="text" id="CampoNuevoArtistaLugar" placeholder="Ej. San Ignacio de Moxos, Beni, Bolivia" maxlength="120">
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaTrayectoriaAnos" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Años de Trayectoria (Núm.)
                                    </label>
                                    <input type="number" id="CampoNuevoArtistaTrayectoriaAnos" placeholder="Ej. 25" min="0" max="100">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 12px;">
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaGenero" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Género Musical / Estilo
                                    </label>
                                    <input type="text" id="CampoNuevoArtistaGenero" placeholder="Ej. Taquirari, Chovena, Polca beniana" maxlength="150">
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <label for="CampoNuevoArtistaInstrumentos" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Instrumentos (Separados por coma)
                                    </label>
                                    <input type="text" id="CampoNuevoArtistaInstrumentos" placeholder="Ej. Guitarra acústica, Mandolina, Flauta dulce" maxlength="200">
                                </div>
                            </div>
                        </div>

                        <!-- Bloque B: Fotografía del Artista (Drag and Drop Sencillo) -->
                        <div style="background: var(--ColorFondoSecundario); padding: 16px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                            <div style="font-weight: 700; font-size: 13.5px; color: var(--ColorPrimarioAzul); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-camera"></i> Fotografía del Artista
                            </div>
                            <p style="font-size: 12px; color: var(--ColorTextoSecundario); margin-bottom: 12px;">Arrastra una fotografía aquí o haz clic para seleccionarla desde tu dispositivo.</p>
                            
                            <div class="ZonaSubidaFotoArtista" id="ZonaDragDropFotoArtista" title="Haz clic o arrastra una imagen aquí">
                                <input type="file" id="InputArchivoFotoArtista" accept="image/*" style="display: none;">
                                <div class="ContenidoZonaFotoArtista">
                                    <div class="ContenedorAvatarPreviaArtista">
                                        <img id="VistaPreviaFotoNuevoArtista" class="ImagenAvatarPrevia" src="Logo1.png" alt="Vista Previa" onerror="this.src='Logo1.png'">
                                    </div>
                                    <div class="TextosZonaFotoArtista">
                                        <div class="TituloSubidaFoto">
                                            <i class="fa-solid fa-cloud-arrow-up"></i>
                                            <span>Arrastra tu foto aquí o <span class="EnlaceExaminarFoto">examinar</span></span>
                                        </div>
                                        <div id="NombreArchivoFotoArtista" class="InstruccionSubidaFoto">
                                            Formatos JPG, PNG o WEBP (máx. 10MB)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bloque C: Secciones Biográficas Detalladas con Contadores en Tiempo Real -->
                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            <div style="font-weight: 700; font-size: 13.5px; color: var(--ColorPrimarioAzul); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-book-open"></i> Secciones Biográficas
                            </div>

                            <!-- 1. Biografía General -->
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label for="CampoNuevoArtistaBiografia" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        1. Biografía General <span style="color: var(--ColorRojoPeligro);">*</span>
                                    </label>
                                    <span class="InsigniaContadorPalabras" id="ContadorPalabrasBiografia" style="font-size: 11px; color: var(--ColorTextoSecundario); font-family: monospace;">0 / 500 palabras</span>
                                </div>
                                <textarea id="CampoNuevoArtistaBiografia" rows="4" placeholder="Breve historia de la vida, formación y trayectoria del artista..." required style="resize: vertical; line-height: 1.45;"></textarea>
                            </div>

                            <!-- 2. Inicios -->
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label for="CampoNuevoArtistaInicios" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        2. Inicios Musicales
                                    </label>
                                    <span class="InsigniaContadorPalabras" id="ContadorPalabrasInicios" style="font-size: 11px; color: var(--ColorTextoSecundario); font-family: monospace;">0 / 500 palabras</span>
                                </div>
                                <textarea id="CampoNuevoArtistaInicios" rows="3" placeholder="Cómo comenzó en la música, primeros pasos o escenarios..." style="resize: vertical; line-height: 1.45;"></textarea>
                            </div>

                            <!-- 3. Trayectoria -->
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label for="CampoNuevoArtistaTrayectoria" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        3. Trayectoria y Momentos Clave
                                    </label>
                                    <span class="InsigniaContadorPalabras" id="ContadorPalabrasTrayectoria" style="font-size: 11px; color: var(--ColorTextoSecundario); font-family: monospace;">0 / 600 palabras</span>
                                </div>
                                <textarea id="CampoNuevoArtistaTrayectoria" rows="4" placeholder="Agrupaciones, festivales, conciertos memorables, premios o docencia..." style="resize: vertical; line-height: 1.45;"></textarea>
                            </div>

                            <!-- 4. Obras Destacadas -->
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label for="CampoNuevoArtistaObras" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        4. Obras Destacadas
                                    </label>
                                    <span class="InsigniaContadorPalabras" id="ContadorPalabrasObras" style="font-size: 11px; color: var(--ColorTextoSecundario); font-family: monospace;">0 / 150 palabras</span>
                                </div>
                                <textarea id="CampoNuevoArtistaObras" rows="2" placeholder="Títulos de canciones o composiciones destacadas (separadas por coma o línea)..." style="resize: vertical; line-height: 1.45;"></textarea>
                            </div>

                            <!-- 5. Legado -->
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label for="CampoNuevoArtistaLegado" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        5. Legado y Reconocimientos
                                    </label>
                                    <span class="InsigniaContadorPalabras" id="ContadorPalabrasLegado" style="font-size: 11px; color: var(--ColorTextoSecundario); font-family: monospace;">0 / 500 palabras</span>
                                </div>
                                <textarea id="CampoNuevoArtistaLegado" rows="3" placeholder="Aporte e importancia para la música boliviana y distinciones obtenidas..." style="resize: vertical; line-height: 1.45;"></textarea>
                            </div>

                            <!-- 6. Cita Célebre -->
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label for="CampoNuevoArtistaCita" style="font-size: 12.5px; font-weight: 700; color: var(--ColorTextoPrincipal);">
                                        Cita Célebre / Frase del Artista (Opcional)
                                    </label>
                                    <span class="InsigniaContadorPalabras" id="ContadorPalabrasCita" style="font-size: 11px; color: var(--ColorTextoSecundario); font-family: monospace;">0 / 50 palabras</span>
                                </div>
                                <input type="text" id="CampoNuevoArtistaCita" placeholder="«Frase o pensamiento representativo del artista...»" maxlength="300" style="font-style: italic;">
                            </div>
                        </div>

                        <!-- Indicador de Subida Multimedia a Cloudinary -->
                        <div id="IndicadorSubidaFotoArtista" style="display: none; padding: 10px; border-radius: var(--RadioPequeno); background: rgba(24, 119, 242, 0.1); border: 1px solid var(--ColorPrimarioAzul); font-size: 12.5px; text-align: center; color: var(--ColorPrimarioAzul); font-weight: 600;">
                            <i class="fa-solid fa-cloud-arrow-up fa-bounce" style="margin-right: 6px;"></i> Subiendo fotografía a Cloudinary...
                        </div>

                    </form>
                </div>

                <!-- 3. Pie de Acciones del Modal -->
                <div class="PieVentanaModal">
                    <button type="button" class="BotonAccionSecundario" id="BotonCancelarCrearArtista">
                        Cancelar
                    </button>
                    <button type="button" class="BotonAccionPrimario" id="BotonGuardarNuevoArtista">
                        <i class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i> Guardar Artista
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    VincularContadoresEnTiempoReal() {
        const CamposYLimites = [
            { IdInput: "CampoNuevoArtistaBiografia", IdContador: "ContadorPalabrasBiografia", Limite: this.Limites.Biografia.Palabras },
            { IdInput: "CampoNuevoArtistaInicios", IdContador: "ContadorPalabrasInicios", Limite: this.Limites.Inicios.Palabras },
            { IdInput: "CampoNuevoArtistaTrayectoria", IdContador: "ContadorPalabrasTrayectoria", Limite: this.Limites.Trayectoria.Palabras },
            { IdInput: "CampoNuevoArtistaObras", IdContador: "ContadorPalabrasObras", Limite: this.Limites.ObrasDestacadas.Palabras },
            { IdInput: "CampoNuevoArtistaLegado", IdContador: "ContadorPalabrasLegado", Limite: this.Limites.Legado.Palabras },
            { IdInput: "CampoNuevoArtistaCita", IdContador: "ContadorPalabrasCita", Limite: this.Limites.CitaCelebre.Palabras }
        ];

        CamposYLimites.forEach(({ IdInput, IdContador, Limite }) => {
            const ElementoInput = document.getElementById(IdInput);
            const ElementoContador = document.getElementById(IdContador);
            if (!ElementoInput || !ElementoContador) return;

            const ActualizarContador = () => {
                const Texto = ElementoInput.value.trim();
                const Palabras = Texto ? Texto.split(/\s+/).length : 0;
                ElementoContador.textContent = `${Palabras} / ${Limite} palabras`;

                if (Palabras > Limite) {
                    ElementoContador.style.color = "var(--ColorRojoPeligro)";
                    ElementoContador.style.fontWeight = "700";
                } else if (Palabras > Limite * 0.85) {
                    ElementoContador.style.color = "var(--ColorNaranjaAlerta, #d97706)";
                    ElementoContador.style.fontWeight = "600";
                } else {
                    ElementoContador.style.color = "var(--ColorTextoSecundario)";
                    ElementoContador.style.fontWeight = "normal";
                }
            };

            ElementoInput.addEventListener("input", ActualizarContador);
            ElementoInput.addEventListener("paste", () => setTimeout(ActualizarContador, 50));
        });
    }
}

window.ComponenteModalCrearArtista = ComponenteModalCrearArtista;
