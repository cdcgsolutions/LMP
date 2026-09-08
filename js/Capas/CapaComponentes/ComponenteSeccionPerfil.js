/* ==========================================================================
   COMPONENTE: SECCIÓN PERFIL DE USUARIO (ESTILO FACEBOOK)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ComponenteSeccionPerfil {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento = null) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
        this.ComponenteTarjetaPublicacion = (typeof ComponenteTarjetaPublicacion !== "undefined")
            ? new ComponenteTarjetaPublicacion(this.ServicioEstado, this.ModeloAlmacenamiento)
            : null;
    }

    FormatearFecha(FechaEntrada) {
        if (!FechaEntrada) return "";
        try {
            let FechaObj = null;
            if (typeof FechaEntrada === "string") {
                FechaObj = new Date(FechaEntrada);
            } else if (FechaEntrada.toDate && typeof FechaEntrada.toDate === "function") {
                FechaObj = FechaEntrada.toDate();
            } else if (FechaEntrada.seconds) {
                FechaObj = new Date(FechaEntrada.seconds * 1000);
            } else if (FechaEntrada instanceof Date) {
                FechaObj = FechaEntrada;
            }
            if (FechaObj && !isNaN(FechaObj.getTime())) {
                return FechaObj.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });
            }
        } catch (ErrorFormato) {
            console.warn("[ComponenteSeccionPerfil] Error formateando fecha:", ErrorFormato);
        }
        return String(FechaEntrada);
    }

    Renderizar() {
        const UsuarioSesion = this.ServicioEstado ? this.ServicioEstado.ObtenerUsuarioActual() : null;
        const EsInvitado = !UsuarioSesion || UsuarioSesion.EsInvitado === true || UsuarioSesion.Nombre === "Usuario";

        // Si está sincronizando Firestore por primera vez y no hay sesión cargada
        const EstaSincronizando = this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EstaSincronizandoDatos();
        if (EstaSincronizando && !UsuarioSesion) {
            return this.RenderizarSkeleton();
        }

        // Si es invitado, mostrar vista informativa para iniciar sesión
        if (EsInvitado) {
            return `
            <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionPerfil">
                <div class="TarjetaPerfilIFAEL" style="text-align: center; padding: 40px 20px;">
                    <div style="width: 90px; height: 90px; border-radius: 50%; background: var(--ColorFondoSecundario); margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 40px; color: var(--ColorTextoSecundario); border: 2px solid var(--ColorBordeDivisor);">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <h1 style="font-size: 22px; font-weight: 700; color: var(--ColorTextoPrincipal); margin-bottom: 6px;">Modo Invitado</h1>
                    <p style="font-size: 14px; color: var(--ColorTextoSecundario); max-width: 460px; margin: 0 auto 20px auto; line-height: 1.5;">
                        Estás explorando el cancionero y la cultura beniana en modo invitado. Inicia sesión con tus credenciales registradas en la base de datos para acceder a tu perfil personal, gestionar tus aportes y participar en la comunidad.
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="BotonAccionPrimario" data-accion="iniciar-sesion" style="padding: 10px 24px; font-size: 14px;">
                            <i class="fa-solid fa-arrow-right-to-bracket" style="margin-right: 8px;"></i>Iniciar Sesión
                        </button>
                        <button class="BotonAccionSecundario" data-pestana="muro" style="padding: 10px 20px; font-size: 14px;">
                            <i class="fa-solid fa-house" style="margin-right: 8px;"></i>Ir al Inicio
                        </button>
                    </div>
                </div>
            </div>
            `;
        }

        // Obtener datos frescos del usuario en base de datos local / Firestore
        let DatosUsuarioBD = null;
        if (this.ModeloAlmacenamiento) {
            if (UsuarioSesion.CorreoElectronico) {
                DatosUsuarioBD = this.ModeloAlmacenamiento.ObtenerUsuarioPorCorreo(UsuarioSesion.CorreoElectronico);
            }
            if (!DatosUsuarioBD && UsuarioSesion.Nombre) {
                DatosUsuarioBD = this.ModeloAlmacenamiento.ObtenerUsuarioPorNombre(UsuarioSesion.Nombre);
            }
        }

        const Usuario = Object.assign({}, UsuarioSesion, DatosUsuarioBD || {});
        const NombreCompleto = Usuario.NombreCompleto || Usuario.Nombre || "Usuario Registrado";
        const Correo = Usuario.CorreoElectronico || "";
        const Ciudad = Usuario.Ciudad || "Trinidad, Beni";
        const EsVerificado = (this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EsUsuarioVerificado(NombreCompleto, Usuario.EsVerificado === true));
        const FotoPerfil = Usuario.FotoPerfilUrl || Usuario.FotoPerfil || "Logo1.png";
        const FotoPortada = Usuario.FotoPortadaUrl || Usuario.FotoPortada || "Logo1.png";
        const FechaRegistroTexto = this.FormatearFecha(Usuario.FechaRegistro || Usuario.createTime);

        // Contabilizar publicaciones aportadas por este usuario en el muro / feed
        const TodasLasPublicaciones = this.ModeloAlmacenamiento ? this.ModeloAlmacenamiento.ObtenerTodasLasPublicaciones() : [];
        const NombresPosibles = [
            NombreCompleto,
            Usuario.Nombre,
            UsuarioSesion ? UsuarioSesion.Nombre : null,
            UsuarioSesion ? UsuarioSesion.NombreCompleto : null
        ].filter(Boolean).map(N => N.trim().toLowerCase());

        const PublicacionesDelUsuario = TodasLasPublicaciones.filter(Pub => {
            if (!Pub) return false;
            const AutorPub = (Pub.NombreAutor || Pub.Autor || Pub.NombreUsuario || "").trim().toLowerCase();
            if (!AutorPub) return false;
            return NombresPosibles.some(Nombre => 
                AutorPub === Nombre ||
                AutorPub.includes(Nombre) ||
                Nombre.includes(AutorPub)
            );
        });

        // Asegurar que la instancia de componente de tarjeta esté lista
        if (!this.ComponenteTarjetaPublicacion && typeof ComponenteTarjetaPublicacion !== "undefined") {
            this.ComponenteTarjetaPublicacion = new ComponenteTarjetaPublicacion(this.ServicioEstado, this.ModeloAlmacenamiento);
        }

        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionPerfil">
            <!-- 1. Cabecera y Portada de Perfil Estilo Facebook -->
            <div class="TarjetaPerfilIFAEL">
                <div class="PortadaInstitucionIFAEL">
                    <img src="${FotoPortada}" alt="Portada de ${NombreCompleto}" class="ImagenPortadaInstitucion" onerror="this.src='Logo1.png'">
                </div>

                <div class="CuerpoPerfilInstitucion">
                    <div class="FilaAvatarYDatosPrincipales">
                        <div class="ContenedorAvatarFlotantePerfil">
                            <img src="${FotoPerfil}" alt="${NombreCompleto}" class="AvatarInstitucionGrande" onerror="this.src='Logo1.png'">
                        </div>
                        <div class="DatosTextoInstitucion">
                            <h1 class="NombreInstitucionGrande">
                                <span>${NombreCompleto}</span>
                                ${EsVerificado ? '<span class="InsigniaVerificada" title="Cuenta Verificada en Letras Mi Poblau"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                            </h1>
                            <div class="MetaDetalleInstitucion">
                                <i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${Ciudad}
                            </div>
                        </div>
                    </div>

                    <!-- 2. Ficha de Datos Personales Registrados en la Base de Datos -->
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--ColorBordeDivisor);">
                        <!-- Caja de Datos Personales -->
                        <div style="background-color: var(--ColorFondoSecundario); padding: 18px 20px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                            <div style="font-weight: 700; font-size: 15px; margin-bottom: 14px; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-address-card" style="color: var(--ColorPrimarioAzul); font-size: 18px;"></i>
                                <span>Datos Personales Registrados:</span>
                            </div>
                            <ul style="list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; font-size: 13.5px; color: var(--ColorTextoSecundario); padding: 0; margin: 0;">
                                <li style="display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-user" style="width: 18px; color: var(--ColorPrimarioAzul);"></i>
                                    <span><strong>Nombre:</strong> ${NombreCompleto}</span>
                                </li>
                                <li style="display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-envelope" style="width: 18px; color: var(--ColorPrimarioAzul);"></i>
                                    <span><strong>Correo:</strong> ${Correo || 'No especificado'}</span>
                                </li>
                                <li style="display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-map-pin" style="width: 18px; color: var(--ColorPrimarioAzul);"></i>
                                    <span><strong>Ciudad:</strong> ${Ciudad}</span>
                                </li>
                                ${FechaRegistroTexto ? `
                                <li style="display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-calendar-check" style="width: 18px; color: var(--ColorPrimarioAzul);"></i>
                                    <span><strong>Miembro desde:</strong> ${FechaRegistroTexto}</span>
                                </li>
                                ` : ''}
                            </ul>
                        </div>
                    </div>

                    <!-- 3. Lista de Aportes del Usuario -->
                    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--ColorBordeDivisor);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                            <h2 style="font-size: 16px; font-weight: 700; color: var(--ColorTextoPrincipal); display: flex; align-items: center; gap: 8px; margin: 0;">
                                <i class="fa-solid fa-compact-disc" style="color: var(--ColorPrimarioAzul);"></i>
                                <span>Tus Aportes Musicales (${PublicacionesDelUsuario.length})</span>
                            </h2>
                        </div>

                        ${PublicacionesDelUsuario.length === 0 ? `
                        <div style="background-color: var(--ColorFondoSecundario); padding: 24px; border-radius: var(--RadioMediano); text-align: center; color: var(--ColorTextoSecundario);">
                            <i class="fa-solid fa-music" style="font-size: 28px; margin-bottom: 8px; opacity: 0.6;"></i>
                            <div style="font-weight: 600; font-size: 14px; color: var(--ColorTextoPrincipal);">Aún no has registrado ningún aporte musical</div>
                            <p style="font-size: 12.5px; margin-top: 4px; margin-bottom: 12px;">Comparte letras, acordes o información de canciones benianas con la comunidad.</p>
                            <button class="BotonAccionPrimario" id="BotonPerfilCrearAporteVacio" onclick="document.getElementById('BotonCrearNuevoAporte') && document.getElementById('BotonCrearNuevoAporte').click()">
                                <i class="fa-solid fa-plus" style="margin-right: 6px;"></i>Publicar Nueva Letra
                            </button>
                        </div>
                        ` : `
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            ${PublicacionesDelUsuario.map(Pub => {
                                if (this.ComponenteTarjetaPublicacion) {
                                    return this.ComponenteTarjetaPublicacion.Renderizar(Pub);
                                }
                                return `
                                <div class="TarjetaCancionSimple" style="background: var(--ColorFondoSecundario); padding: 12px; border-radius: var(--RadioMediano); border: 1px solid var(--ColorBordeDivisor);">
                                    <div style="font-weight: 700; font-size: 14px; color: var(--ColorTextoPrincipal);">${Pub.TextoPublicacion || 'Publicación musical'}</div>
                                    <div style="font-size: 12px; color: var(--ColorTextoSecundario); margin-top: 4px;">Por: ${Pub.NombreAutor || NombreCompleto}</div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    RenderizarSkeleton() {
        return `
        <div class="ContenedorVistaSeccion" id="ContenedorVistaSeccionPerfil">
            <div class="TarjetaPerfilIFAEL">
                <div class="PortadaInstitucionIFAEL ElementoShimmerLMP" style="height: 200px;"></div>
                <div class="CuerpoPerfilInstitucion">
                    <div class="FilaAvatarYDatosPrincipales">
                        <div class="ContenedorAvatarFlotantePerfil">
                            <div class="AvatarInstitucionGrande ElementoShimmerLMP" style="border-radius: 50%;"></div>
                        </div>
                        <div class="DatosTextoInstitucion" style="flex: 1;">
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 50%; height: 22px; margin-bottom: 8px;"></div>
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 35%; height: 14px; margin-bottom: 6px;"></div>
                            <div class="BarraTextoShimmer ElementoShimmerLMP" style="width: 25%; height: 12px;"></div>
                        </div>
                    </div>
                    <div style="margin-top: 20px; height: 90px; border-radius: var(--RadioMediano);" class="ElementoShimmerLMP"></div>
                </div>
            </div>
        </div>
        `;
    }
}

window.ComponenteSeccionPerfil = ComponenteSeccionPerfil;
