/* ==========================================================================
   COMPONENTE: MODAL DE INICIO DE SESIÓN Y AUTENTICACIÓN
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteModalIniciarSesion {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    Renderizar(MensajeMotivo = "") {
        return `
        <div class="CapaFondoModalOscuro" id="ModalIniciarSesionFondo">
            <div class="ContenedorVentanaModal ModalAnchoMediano" id="ContenedorModalIniciarSesion" style="max-width: 460px;">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal" style="border-bottom: 1px solid var(--ColorBordeDivisor);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="LogoInicialesSinFondoNegro.png" alt="LMP" style="width: 32px; height: 32px; object-fit: contain;" onerror="this.src='Logo1.png'">
                        <div>
                            <div class="TituloModalTexto" style="font-size: 17px;">Iniciar Sesión en LMP</div>
                            <div style="font-size: 12px; color: var(--ColorTextoSecundario);">Letras Mi Poblau • Cancionero Beniano</div>
                        </div>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalLogin" title="Cerrar ventana"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Cuerpo del Modal -->
                <div class="CuerpoVentanaModal" style="padding: 22px 24px;">
                    ${MensajeMotivo ? `
                    <div style="background-color: rgba(24, 119, 242, 0.08); border-left: 3px solid var(--ColorPrimarioAzul); padding: 10px 14px; border-radius: 6px; margin-bottom: 18px; font-size: 13px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-circle-info" style="color: var(--ColorPrimarioAzul); font-size: 16px;"></i>
                        <span>${MensajeMotivo}</span>
                    </div>
                    ` : ''}

                    <!-- Formulario de Login -->
                    <form id="FormularioInicioSesionModal" autocomplete="off" onsubmit="event.preventDefault();" style="display: flex; flex-direction: column; gap: 14px;">
                        <!-- Inputs trampa para evitar que el gestor de contraseñas del navegador autocomplete -->
                        <input type="text" style="display: none;" tabindex="-1" autocomplete="false">
                        <input type="password" style="display: none;" tabindex="-1" autocomplete="false">

                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--ColorTextoPrincipal);">Correo Electrónico:</label>
                            <input 
                                type="email" 
                                id="CampoEmailLogin" 
                                name="correo_acceso_lmp"
                                class="CampoEntradaFormulario" 
                                placeholder="correo@ejemplo.com" 
                                value=""
                                autocomplete="off"
                                readonly
                                onfocus="this.removeAttribute('readonly');"
                                style="padding: 10px 12px; font-size: 13.5px; border-radius: 8px;"
                            >
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--ColorTextoPrincipal);">Contraseña:</label>
                            <input 
                                type="password" 
                                id="CampoPasswordLogin" 
                                name="clave_acceso_lmp"
                                class="CampoEntradaFormulario" 
                                placeholder="••••••••" 
                                value=""
                                autocomplete="new-password"
                                readonly
                                onfocus="this.removeAttribute('readonly');"
                                style="padding: 10px 12px; font-size: 13.5px; border-radius: 8px;"
                            >
                        </div>

                        <div id="MensajeErrorLoginModal" style="display: none; font-size: 12.5px; color: var(--ColorPeligroRojo); background-color: rgba(239, 68, 68, 0.08); padding: 9px 12px; border-radius: 6px; border-left: 3px solid var(--ColorPeligroRojo);"></div>

                        <button 
                            type="button" 
                            id="BotonConfirmarIniciarSesion" 
                            class="BotonAccionPrimario" 
                            style="padding: 11px 16px; font-size: 14px; font-weight: 700; border-radius: 8px; justify-content: center; margin-top: 4px;"
                        >
                            <i class="fa-solid fa-arrow-right-to-bracket" style="margin-right: 6px;"></i> Iniciar Sesión
                        </button>
                    </form>
                </div>

                <!-- Pie del Modal -->
                <div class="PieVentanaModal" style="border-top: 1px solid var(--ColorBordeDivisor); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background-color: var(--ColorFondoSecundario);">
                    <button class="BotonAccionSecundario" id="BotonContinuarComoInvitado" style="font-size: 12.5px; border: none; background: transparent; color: var(--ColorTextoSecundario);">
                        <i class="fa-solid fa-eye" style="margin-right: 4px;"></i> Seguir como Invitado
                    </button>
                    <span style="font-size: 11px; color: var(--ColorTextoSecundario);">IFAEL Trinidad ⓒ ${new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalIniciarSesion = ComponenteModalIniciarSesion;
