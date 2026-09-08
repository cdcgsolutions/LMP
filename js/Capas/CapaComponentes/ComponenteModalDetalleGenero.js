/* ==========================================================================
   COMPONENTE: MODAL DETALLE PEDAGÓGICO DE GÉNERO Y RITMO BENIANO
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalDetalleGenero {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar(NombreOGeneroId) {
        if (!NombreOGeneroId) return "";

        const TodosLosGeneros = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.ObtenerTodosLosGeneros()) || [];
        const Genero = TodosLosGeneros.find(G => 
            (G.Nombre && G.Nombre.trim().toLowerCase() === String(NombreOGeneroId).trim().toLowerCase()) ||
            (G.IdGenero && G.IdGenero === NombreOGeneroId)
        );

        // Sin fallback: si no existe en la base de datos, no se muestra nada simulado
        if (!Genero) {
            console.warn(`[ComponenteModalDetalleGenero] No se encontró el género musical '${NombreOGeneroId}' en la base de datos.`);
            return "";
        }

        const IconoHtml = Genero.Icono || (Genero.IconoClase ? `<i class="${Genero.IconoClase}"></i>` : '<i class="fa-solid fa-guitar"></i>');
        const Instrumentos = Array.isArray(Genero.InstrumentosTipicos) 
            ? Genero.InstrumentosTipicos.filter(I => I && String(I).trim().length > 0) 
            : [];

        // Evaluar qué datos de la ficha técnica existen realmente en la base de datos
        const HayFichaTecnica = Boolean(Genero.Compas || Genero.TempoTipico || Genero.Caracter || Genero.Origen);

        return `
        <div class="CapaFondoModalOscuro" id="ModalDetalleGeneroFondo">
            <div class="ContenedorVentanaModal ModalAnchoMediano" id="ContenedorVentanaModalGenero" style="overflow: hidden; max-width: 580px;">
                <!-- Cabecera Visual Temática con Color Sólido del Género -->
                <div class="CabeceraModalGeneroColor" style="background-color: ${Genero.Color || 'var(--ColorPrimarioAzul)'}; padding: 18px 20px; color: #ffffff; position: relative;">
                    <button class="BotonCerrarModal" id="BotonCerrarModalGenero" title="Cerrar" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.35); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                    <div style="display: flex; align-items: center; gap: 14px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.25); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                            ${IconoHtml}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <h2 style="font-size: 21px; font-weight: 800; margin: 0; line-height: 1.2; text-shadow: 0 1px 3px rgba(0,0,0,0.35);">${Genero.Nombre}</h2>
                            <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap;">
                                ${Genero.Compas ? `
                                <span style="background: rgba(0,0,0,0.28); color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--RadioBotonPill); border: 1px solid rgba(255,255,255,0.25); display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="fa-solid fa-music"></i> Compás: ${Genero.Compas}
                                </span>` : ''}
                                ${Genero.Origen ? `
                                <span style="background: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--RadioBotonPill); border: 1px solid rgba(255,255,255,0.25); display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="fa-solid fa-location-dot"></i> ${Genero.Origen}
                                </span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cuerpo del Modal: Solo datos reales de la BD -->
                <div class="CuerpoVentanaModal" style="padding: 20px; display: flex; flex-direction: column; gap: 16px; max-height: 68vh; overflow-y: auto;">
                    <!-- 1. Reseña e Historia (solo si existe en la BD) -->
                    ${Genero.Descripcion ? `
                    <div>
                        <div style="font-weight: 700; font-size: 14px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                            <i class="fa-solid fa-book-open" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Reseña Histórica y Cultural</span>
                        </div>
                        <p style="font-size: 13.5px; color: var(--ColorTextoSecundario); line-height: 1.6; margin: 0; background-color: var(--ColorFondoSecundario); padding: 12px 14px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor); white-space: pre-line;">
                            ${Genero.Descripcion}
                        </p>
                    </div>
                    ` : ''}

                    <!-- 2. Ficha Técnica Musical (solo los campos que existan en la BD) -->
                    ${HayFichaTecnica ? `
                    <div>
                        <div style="font-weight: 700; font-size: 14px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                            <i class="fa-solid fa-sliders" style="color: var(--ColorPrimarioAzul);"></i>
                            <span>Ficha Técnica Musical</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                            ${Genero.Compas ? `
                            <div style="background-color: var(--ColorFondoSecundario); padding: 10px 12px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                                <div style="font-size: 11px; color: var(--ColorTextoSecundario); text-transform: uppercase; font-weight: 700;">Compás Métrico</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--ColorTextoPrincipal); margin-top: 2px;">
                                    <i class="fa-solid fa-music" style="color: var(--ColorDorado); font-size: 12px; margin-right: 4px;"></i>${Genero.Compas}
                                </div>
                            </div>
                            ` : ''}

                            ${Genero.TempoTipico ? `
                            <div style="background-color: var(--ColorFondoSecundario); padding: 10px 12px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                                <div style="font-size: 11px; color: var(--ColorTextoSecundario); text-transform: uppercase; font-weight: 700;">Tempo Típico</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--ColorTextoPrincipal); margin-top: 2px;">
                                    <i class="fa-solid fa-stopwatch" style="color: var(--ColorPrimarioAzul); font-size: 12px; margin-right: 4px;"></i>${Genero.TempoTipico}
                                </div>
                            </div>
                            ` : ''}

                            ${Genero.Caracter ? `
                            <div style="background-color: var(--ColorFondoSecundario); padding: 10px 12px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                                <div style="font-size: 11px; color: var(--ColorTextoSecundario); text-transform: uppercase; font-weight: 700;">Carácter</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--ColorTextoPrincipal); margin-top: 2px;">
                                    <i class="fa-solid fa-masks-theater" style="color: var(--ColorVerdeBeni); font-size: 12px; margin-right: 4px;"></i>${Genero.Caracter}
                                </div>
                            </div>
                            ` : ''}

                            ${Genero.Origen ? `
                            <div style="background-color: var(--ColorFondoSecundario); padding: 10px 12px; border-radius: var(--RadioPequeno); border: 1px solid var(--ColorBordeDivisor);">
                                <div style="font-size: 11px; color: var(--ColorTextoSecundario); text-transform: uppercase; font-weight: 700;">Origen</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--ColorTextoPrincipal); margin-top: 2px;">
                                    <i class="fa-solid fa-location-dot" style="color: #e53935; font-size: 12px; margin-right: 4px;"></i>${Genero.Origen}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- 3. Instrumentos Típicos (solo si existen en la BD) -->
                    ${Instrumentos.length > 0 ? `
                    <div>
                        <div style="font-weight: 700; font-size: 14px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                            <i class="fa-solid fa-guitar" style="color: var(--ColorDorado);"></i>
                            <span>Instrumentación Típica Tradicional</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${Instrumentos.map(Inst => `
                            <span style="display: inline-flex; align-items: center; gap: 6px; background-color: var(--ColorFondoSecundario); border: 1px solid var(--ColorBordeDivisor); border-radius: var(--RadioBotonPill); padding: 5px 12px; font-size: 12.5px; font-weight: 600; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-compact-disc" style="color: var(--ColorDorado); font-size: 11px;"></i>${Inst}
                            </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Pie de Modal -->
                <div class="PieVentanaModal" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 18px; border-top: 1px solid var(--ColorBordeDivisor); background-color: var(--ColorFondoSuperficie);">
                    <button class="BotonAccionSecundario" id="BotonCerrarModalGeneroPie" style="font-size: 13px; padding: 7px 14px;">
                        Cerrar
                    </button>
                    <button class="BotonAccionPrimario BotonExplorarCancionesGenero" data-genero="${Genero.Nombre}" style="font-size: 13px; padding: 7px 16px; display: inline-flex; align-items: center; gap: 6px; background-color: ${Genero.Color || 'var(--ColorPrimarioAzul)'}; border-color: ${Genero.Color || 'var(--ColorPrimarioAzul)'};">
                        <i class="fa-solid fa-scroll"></i>
                        <span>Explorar Canciones</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalDetalleGenero = ComponenteModalDetalleGenero;
