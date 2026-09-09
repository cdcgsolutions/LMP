/* ==========================================================================
   COMPONENTE: MODAL DE REGISTRO DE NUEVOS USUARIOS
   Nombres en PascalCase - Letras de mi Poblao (LMP)
   ========================================================================== */

const LISTA_PROVINCIAS_BOLIVIA = [
    "Cercado, Beni",
    "Vaca Diez, Beni",
    "General José Ballivián, Beni",
    "Yacuma, Beni",
    "Moxos, Beni",
    "Marbán, Beni",
    "Mamoré, Beni",
    "Itenez, Beni",

    "Belisario Boeto, Chuquisaca",
    "Azurduy, Chuquisaca",
    "Hernando Siles, Chuquisaca",
    "Luis Calvo, Chuquisaca",
    "Nor Cinti, Chuquisaca",
    "Oropeza, Chuquisaca",
    "Sud Cinti, Chuquisaca",
    "Tomina, Chuquisaca",
    "Yamparáez, Chuquisaca",
    "Zudáñez, Chuquisaca",

    "Arani, Cochabamba",
    "Arque, Cochabamba",
    "Ayopaya, Cochabamba",
    "Bolívar, Cochabamba",
    "Campero, Cochabamba",
    "Capinota, Cochabamba",
    "Carrasco, Cochabamba",
    "Cercado, Cochabamba",
    "Chapare, Cochabamba",
    "Esteban Arce, Cochabamba",
    "Germán Jordán, Cochabamba",
    "Mizque, Cochabamba",
    "Punata, Cochabamba",
    "Quillacollo, Cochabamba",
    "Tapacarí, Cochabamba",
    "Tiraque, Cochabamba",

    "Abel Iturralde, La Paz",
    "Aroma, La Paz",
    "Bautista Saavedra, La Paz",
    "Camacho, La Paz",
    "Caranavi, La Paz",
    "Franz Tamayo, La Paz",
    "General José Manuel Pando, La Paz",
    "Gualberto Villarroel, La Paz",
    "Ingavi, La Paz",
    "Inquisivi, La Paz",
    "Larecaja, La Paz",
    "Loayza, La Paz",
    "Los Andes, La Paz",
    "Manco Kapac, La Paz",
    "Muñecas, La Paz",
    "Murillo, La Paz",
    "Nor Yungas, La Paz",
    "Omasuyos, La Paz",
    "Pacajes, La Paz",
    "Sur Yungas, La Paz",

    "Abaroa, Oruro",
    "Carangas, Oruro",
    "Cercado, Oruro",
    "Ladislao Cabrera, Oruro",
    "Litoral, Oruro",
    "Mejillones, Oruro",
    "Nor Carangas, Oruro",
    "Pantaleón Dalence, Oruro",
    "Poopó, Oruro",
    "Sabaya, Oruro",
    "Sajama, Oruro",
    "San Pedro de Totora, Oruro",
    "Saucarí, Oruro",
    "Sebastián Pagador, Oruro",
    "Sur Carangas, Oruro",
    "Tomás Barrón, Oruro",

    "Abuná, Pando",
    "Federico Román, Pando",
    "Madre de Dios, Pando",
    "Manuripi, Pando",
    "Nicolás Suárez, Pando",

    "Alonso de Ibáñez, Potosí",
    "Antonio Quijarro, Potosí",
    "Bernardino Bilbao Rioja, Potosí",
    "Charcas, Potosí",
    "Chayanta, Potosí",
    "Cornelio Saavedra, Potosí",
    "Daniel Campos, Potosí",
    "Enrique Baldivieso, Potosí",
    "José María Linares, Potosí",
    "Modesto Omiste, Potosí",
    "Nor Chichas, Potosí",
    "Nor Lípez, Potosí",
    "Rafael Bustillo, Potosí",
    "Sur Chichas, Potosí",
    "Sur Lípez, Potosí",
    "Tomás Frías, Potosí",

    "Andrés Ibáñez, Santa Cruz",
    "Ángel Sandoval, Santa Cruz",
    "Chiquitos, Santa Cruz",
    "Cordillera, Santa Cruz",
    "Florida, Santa Cruz",
    "Germán Busch, Santa Cruz",
    "Guarayos, Santa Cruz",
    "Ichilo, Santa Cruz",
    "Manuel María Caballero, Santa Cruz",
    "Ñuflo de Chávez, Santa Cruz",
    "Obispo Santistevan, Santa Cruz",
    "Sara, Santa Cruz",
    "Vallegrande, Santa Cruz",
    "Velasco, Santa Cruz",
    "Warnes, Santa Cruz",

    "Aniceto Arce, Tarija",
    "Avilés, Tarija",
    "Cercado, Tarija",
    "Gran Chaco, Tarija",
    "Méndez, Tarija",
    "O'Connor, Tarija"
];

class ComponenteModalRegistroUsuario {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ArchivoFotoSeleccionada = null;
    }

    static FiltrarCiudades(Termino = "") {
        const TerminoLimpio = Termino.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!TerminoLimpio) return LISTA_PROVINCIAS_BOLIVIA;
        return LISTA_PROVINCIAS_BOLIVIA.filter(Ciudad => {
            const CiudadLimpia = Ciudad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return CiudadLimpia.includes(TerminoLimpio);
        });
    }

    static RenderizarOpcionesSugerencias(Lista = []) {
        if (!Lista || Lista.length === 0) {
            return `<div style="padding: 12px 14px; font-size: 12.5px; color: var(--ColorTextoSecundario); text-align: center;">No se encontraron resultados</div>`;
        }
        return Lista.map(Ciudad => `
            <div class="ItemSugerenciaCiudad" data-ciudad="${Ciudad}">
                <span>${Ciudad}</span>
                <i class="fa-solid fa-location-dot" style="font-size: 11px; opacity: 0.4;"></i>
            </div>
        `).join("");
    }

    Renderizar() {
        return `
        <div class="CapaFondoModalOscuro" id="ModalRegistroUsuarioFondo">
            <div class="ContenedorVentanaModal ModalAnchoMediano" id="ContenedorModalRegistroUsuario" style="max-width: 480px; max-height: 90vh; overflow-y: auto;">
                <!-- Encabezado del Modal -->
                <div class="EncabezadoVentanaModal" style="border-bottom: 1px solid var(--ColorBordeDivisor); position: sticky; top: 0; background: var(--ColorFondoSuperficie); z-index: 2;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="LogoIniciales.png" alt="LMP" style="width: 32px; height: 32px; object-fit: contain;" onerror="this.src='Logo1.png'">
                        <div>
                            <div class="TituloModalTexto" style="font-size: 17px;">Crear Cuenta</div>
                            <div style="font-size: 12px; color: var(--ColorTextoSecundario);">Letras de mi Poblao • Comunidad Musical</div>
                        </div>
                    </div>
                    <button class="BotonCerrarModal" id="BotonCerrarModalRegistro" title="Cerrar ventana"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Cuerpo del Modal -->
                <div class="CuerpoVentanaModal" style="padding: 22px 24px;">
                    <form id="FormularioRegistroUsuarioModal" autocomplete="off" onsubmit="event.preventDefault();" style="display: flex; flex-direction: column; gap: 14px;">
                        <!-- Inputs trampa para evitar que el gestor de contraseñas del navegador autocomplete -->
                        <input type="text" style="display: none;" tabindex="-1" autocomplete="false">
                        <input type="password" style="display: none;" tabindex="-1" autocomplete="false">
                        
                        <!-- Selector de Foto de Perfil con Vista Previa -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <div style="position: relative; width: 84px; height: 84px; border-radius: 50%; box-shadow: var(--SombraNivelDos); cursor: pointer;" id="ContenedorClickFotoRegistro" title="Haz clic para seleccionar tu foto de perfil">
                                <img src="Logo1.png" id="VistaPreviaFotoRegistro" alt="Foto de perfil" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--ColorPrimarioAzul);">
                                <div style="position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background-color: var(--ColorPrimarioAzul); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; border: 2px solid var(--ColorFondoSuperficie);">
                                    <i class="fa-solid fa-camera"></i>
                                </div>
                            </div>
                            <input type="file" id="InputFotoPerfilRegistro" accept="image/*" style="display: none;">
                            <span style="font-size: 11.5px; color: var(--ColorTextoSecundario);">Toca para subir tu foto de perfil (Opcional)</span>
                        </div>

                        <!-- Nombre Completo -->
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-user" style="margin-right: 4px; color: var(--ColorPrimarioAzul);"></i> Nombre Completo:
                            </label>
                            <input 
                                type="text" 
                                id="CampoRegistroNombreCompleto" 
                                name="nombre_registro_lmp"
                                class="CampoEntradaFormulario" 
                                value=""
                                autocomplete="off"
                                readonly
                                onfocus="this.removeAttribute('readonly');"
                                required
                                style="padding: 10px 12px; font-size: 13.5px; border-radius: 8px;"
                            >
                        </div>

                        <!-- Correo Electrónico -->
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-envelope" style="margin-right: 4px; color: var(--ColorPrimarioAzul);"></i> Correo Electrónico:
                            </label>
                            <input 
                                type="email" 
                                id="CampoRegistroEmail" 
                                name="email_registro_lmp"
                                class="CampoEntradaFormulario" 
                                value=""
                                autocomplete="off"
                                readonly
                                onfocus="this.removeAttribute('readonly');"
                                required
                                style="padding: 10px 12px; font-size: 13.5px; border-radius: 8px;"
                            >
                        </div>

                        <!-- Contraseña -->
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-lock" style="margin-right: 4px; color: var(--ColorPrimarioAzul);"></i> Contraseña:
                            </label>
                            <div style="position: relative; display: flex; align-items: center;">
                                <input 
                                    type="password" 
                                    id="CampoRegistroPassword" 
                                    name="clave_registro_lmp"
                                    class="CampoEntradaFormulario" 
                                    value=""
                                    autocomplete="new-password"
                                    readonly
                                    onfocus="this.removeAttribute('readonly');"
                                    required
                                    style="padding: 10px 40px 10px 12px; font-size: 13.5px; border-radius: 8px; width: 100%; box-sizing: border-box;"
                                >
                                <button 
                                    type="button" 
                                    id="BotonAlternarVisibilidadPasswordRegistro" 
                                    style="position: absolute; right: 10px; background: none; border: none; color: var(--ColorTextoSecundario); cursor: pointer; padding: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center;"
                                    title="Mostrar u ocultar contraseña"
                                >
                                    <i class="fa-solid fa-eye" id="IconoVisibilidadPasswordRegistro"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Ciudad (Autocomplete Custom HTML) -->
                        <div style="display: flex; flex-direction: column; gap: 5px; position: relative;" id="ContenedorGrupoCiudadRegistro">
                            <label style="font-size: 13px; font-weight: 600; color: var(--ColorTextoPrincipal);">
                                <i class="fa-solid fa-location-dot" style="margin-right: 4px; color: var(--ColorVerdeBeni);"></i> Ciudad:
                            </label>
                            <div style="position: relative; display: flex; align-items: center; width: 100%;">
                                <input 
                                    type="text" 
                                    id="CampoRegistroCiudad" 
                                    name="ciudad_registro_lmp"
                                    class="CampoEntradaFormulario" 
                                    value=""
                                    autocomplete="off"
                                    readonly
                                    onfocus="this.removeAttribute('readonly');"
                                    style="padding: 10px 36px 10px 12px; font-size: 13.5px; border-radius: 8px; width: 100%; box-sizing: border-box; cursor: pointer;"
                                >
                                <button 
                                    type="button" 
                                    id="BotonDisparadorSugerenciasCiudad" 
                                    style="position: absolute; right: 10px; background: none; border: none; color: var(--ColorTextoSecundario); cursor: pointer; padding: 4px; font-size: 13px; display: flex; align-items: center; justify-content: center;"
                                    title="Ver lista de ciudades y provincias"
                                >
                                    <i class="fa-solid fa-chevron-down"></i>
                                </button>
                            </div>

                            <!-- Caja Desplegable HTML debajo del Input -->
                            <div id="ContenedorSugerenciasCiudad" class="ContenedorSugerenciasCiudad"></div>
                        </div>

                        <!-- Mensaje de Error Dinámico -->
                        <div id="MensajeErrorRegistroModal" style="display: none; font-size: 12.5px; color: var(--ColorPeligroRojo); background-color: rgba(239, 68, 68, 0.08); padding: 9px 12px; border-radius: 6px; border-left: 3px solid var(--ColorPeligroRojo);"></div>

                        <!-- Botón de Confirmación -->
                        <button 
                            type="button" 
                            id="BotonConfirmarRegistroUsuario" 
                            class="BotonAccionPrimario" 
                            style="padding: 11px 16px; font-size: 14px; font-weight: 700; border-radius: 8px; justify-content: center; margin-top: 6px;"
                        >
                            <i class="fa-solid fa-user-plus" style="margin-right: 6px;"></i> Registrarme y Entrar
                        </button>
                    </form>

                    <!-- Enlace para volver a Iniciar Sesión -->
                    <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--ColorTextoSecundario);">
                        ¿Ya tienes una cuenta? 
                        <a href="javascript:void(0)" id="BotonIrALoginDesdeRegistro" style="color: var(--ColorPrimarioAzul); font-weight: 700; text-decoration: none; margin-left: 4px;">
                            Inicia Sesión
                        </a>
                    </div>
                </div>

                <!-- Pie del Modal -->
                <div class="PieVentanaModal" style="border-top: 1px solid var(--ColorBordeDivisor); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background-color: var(--ColorFondoSecundario);">
                    <button class="BotonAccionSecundario" id="BotonRegistroContinuarInvitado" style="font-size: 12.5px; border: none; background: transparent; color: var(--ColorTextoSecundario);">
                        <i class="fa-solid fa-eye" style="margin-right: 4px;"></i> Seguir como Invitado
                    </button>
                    <span style="font-size: 11px; color: var(--ColorTextoSecundario);">ⓒ ${new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteModalRegistroUsuario = ComponenteModalRegistroUsuario;
window.LISTA_PROVINCIAS_BOLIVIA = LISTA_PROVINCIAS_BOLIVIA;
