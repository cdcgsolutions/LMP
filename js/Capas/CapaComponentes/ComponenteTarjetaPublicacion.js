const DiccionarioReaccionesLMP = {
    MeGusta: {
        Clave: "MeGusta",
        Titulo: "Me gusta",
        TituloCorto: "Me gusta",
        Icono: '<i class="fa-solid fa-thumbs-up" style="color: #1877f2;"></i>',
        Color: "#1877f2"
    },
    MeEncanta: {
        Clave: "MeEncanta",
        Titulo: "Me encanta",
        TituloCorto: "Me encanta",
        Icono: '<i class="fa-solid fa-heart" style="color: #f3425f;"></i>',
        Color: "#f3425f"
    },
    VivaBeni: {
        Clave: "VivaBeni",
        Titulo: "¡Viva el Beni!",
        TituloCorto: "¡Viva Beni!",
        Icono: '<i class="fa-solid fa-guitar" style="color: #2e7d32;"></i>',
        Color: "#2e7d32"
    },
    Aplausos: {
        Clave: "Aplausos",
        Titulo: "Aplausos folklóricos",
        TituloCorto: "Aplausos",
        Icono: '<i class="fa-solid fa-hands-clapping" style="color: #f7b125;"></i>',
        Color: "#f7b125"
    },
    BuenRitmo: {
        Clave: "BuenRitmo",
        Titulo: "¡Buen ritmo!",
        TituloCorto: "Buen ritmo",
        Icono: '<i class="fa-solid fa-music" style="color: #8b5cf6;"></i>',
        Color: "#8b5cf6"
    }
};
window.DiccionarioReaccionesLMP = DiccionarioReaccionesLMP;

class ComponenteTarjetaPublicacion {
    constructor(InstanciaServicioEstado, InstanciaModeloAlmacenamiento) {
        this.ServicioEstado = InstanciaServicioEstado;
        this.ModeloAlmacenamiento = InstanciaModeloAlmacenamiento;
    }

    FormatearLetraConAcordes(TextoLetra) {
        if (!TextoLetra) return "";
        // Reemplazar [Acorde] por <span class="AcordeMusical">Acorde</span>
        return TextoLetra.replace(/\[([^\]]+)\]/g, '<span class="AcordeMusical">$1</span>');
    }

    GenerarBurbujasReaccionesHtml(ObjetoPublicacion) {
        const Total = ObjetoPublicacion.CantidadMeGusta || 0;
        if (Total <= 0) return "";

        const ReaccionesDetalle = ObjetoPublicacion.ReaccionesDetalle || {};
        const MapaReacciones = {
            MeGusta: { Clase: "ReaccionAzul", Icono: "fa-thumbs-up" },
            MeEncanta: { Clase: "ReaccionRoja", Icono: "fa-heart" },
            VivaBeni: { Clase: "ReaccionVerde", Icono: "fa-guitar" },
            Aplausos: { Clase: "ReaccionAmarilla", Icono: "fa-hands-clapping" },
            BuenRitmo: { Clase: "ReaccionPurpura", Icono: "fa-music" }
        };

        // Filtrar tipos de reacción que realmente tienen votos (> 0)
        let TiposConVotos = Object.keys(MapaReacciones).filter(Tipo => (ReaccionesDetalle[Tipo] || 0) > 0);

        // Si no hay detalle pero el total > 0 (registros previos), mostrar la predominante
        if (TiposConVotos.length === 0 && Total > 0) {
            const TipoFallback = ObjetoPublicacion.TipoReaccionPredominante || "MeGusta";
            if (MapaReacciones[TipoFallback]) {
                TiposConVotos = [TipoFallback];
            }
        }

        // Ordenar de mayor a menor cantidad de votos
        TiposConVotos.sort((a, b) => (ReaccionesDetalle[b] || 0) - (ReaccionesDetalle[a] || 0));

        // Máximo 3 tipos distintos
        const TiposAMostrar = TiposConVotos.slice(0, 3);

        return TiposAMostrar.map(Tipo => {
            const Conf = MapaReacciones[Tipo];
            return `<span class="IconoReaccionBurbuja ${Conf.Clase}"><i class="fa-solid ${Conf.Icono}" style="font-size: 10px;"></i></span>`;
        }).join("");
    }

    ObtenerTextoTooltipReacciones(ObjetoPublicacion) {
        if (!ObjetoPublicacion) return "";
        const Usuarios = ObjetoPublicacion.UsuariosReacciones || [];
        if (Usuarios.length === 0) {
            const Total = ObjetoPublicacion.CantidadMeGusta || 0;
            if (Total > 0) return `${Total} ${Total === 1 ? 'persona reaccionó' : 'personas reaccionaron'}`;
            return "";
        }

        const UsuarioActual = this.ServicioEstado ? this.ServicioEstado.ObtenerUsuarioActual() : null;
        const NombreUsuarioActivo = (UsuarioActual && !UsuarioActual.EsInvitado && UsuarioActual.Nombre && UsuarioActual.Nombre !== "Usuario") 
            ? UsuarioActual.Nombre.trim().toLowerCase() 
            : null;

        const Nombres = Usuarios.map(u => {
            if (NombreUsuarioActivo && u.NombreUsuario && u.NombreUsuario.trim().toLowerCase() === NombreUsuarioActivo) {
                return "Tú";
            }
            return u.NombreUsuario;
        }).filter(Boolean);

        const IndiceTu = Nombres.indexOf("Tú");
        if (IndiceTu > 0) {
            Nombres.splice(IndiceTu, 1);
            Nombres.unshift("Tú");
        }

        if (Nombres.length === 1) {
            return Nombres[0];
        } else if (Nombres.length === 2) {
            return `${Nombres[0]} y ${Nombres[1]}`;
        } else if (Nombres.length === 3) {
            return `${Nombres[0]}, ${Nombres[1]} y ${Nombres[2]}`;
        } else {
            const Restantes = Nombres.length - 2;
            return `${Nombres[0]}, ${Nombres[1]} y ${Restantes} personas más`;
        }
    }

    Renderizar(ObjetoPublicacion) {
        let CancionAsociada = ObjetoPublicacion.IdCancionAsociada 
            ? this.ModeloAlmacenamiento.ObtenerCancionPorId(ObjetoPublicacion.IdCancionAsociada)
            : null;

        // Fallback por si una publicación previa no tenía el ID sincronizado
        if (!CancionAsociada && ObjetoPublicacion.TextoPublicacion) {
            const TodasLasCanciones = this.ModeloAlmacenamiento.ObtenerTodasLasCanciones();
            CancionAsociada = TodasLasCanciones.find(C =>
                C.Titulo && ObjetoPublicacion.TextoPublicacion.toLowerCase().includes(C.Titulo.toLowerCase())
            ) || null;
        }

        const UsuarioActual = this.ServicioEstado ? (this.ServicioEstado.ObtenerUsuarioActual() || this.ServicioEstado.ObtenerEstado("UsuarioActual")) : null;
        const EstaAutenticado = !!(UsuarioActual && !UsuarioActual.EsInvitado && UsuarioActual.Nombre && UsuarioActual.Nombre !== "Usuario");

        const TiposValidos = ["MeGusta", "MeEncanta", "VivaBeni", "Aplausos", "BuenRitmo"];
        const UsuariosReaccionesValidos = Array.isArray(ObjetoPublicacion.UsuariosReacciones)
            ? ObjetoPublicacion.UsuariosReacciones.filter(u => u && u.TipoReaccion && TiposValidos.includes(u.TipoReaccion) && u.NombreUsuario)
            : [];

        const TotalReacciones = UsuariosReaccionesValidos.length > 0 
            ? UsuariosReaccionesValidos.length 
            : (Number(ObjetoPublicacion.CantidadMeGusta) || 0);

        const TotalComentarios = (ObjetoPublicacion.Comentarios && ObjetoPublicacion.Comentarios.length) || 0;
        const TotalCompartidos = ObjetoPublicacion.CantidadCompartidos || 0;

        // La reacción persiste SI Y SOLO SI el usuario actual está autenticado y coincide con el registro
        let MiReaccionActual = null;
        if (EstaAutenticado) {
            const NombreUsuarioActivo = UsuarioActual.Nombre.trim().toLowerCase();
            const ReaccionUsuario = UsuariosReaccionesValidos.find(u => 
                u.NombreUsuario && u.NombreUsuario.trim().toLowerCase() === NombreUsuarioActivo
            );
            if (ReaccionUsuario && DiccionarioReaccionesLMP[ReaccionUsuario.TipoReaccion]) {
                MiReaccionActual = ReaccionUsuario.TipoReaccion;
            }
        }

        const InfoReaccionActiva = MiReaccionActual ? DiccionarioReaccionesLMP[MiReaccionActual] : null;

        const IconoBotonPrincipal = InfoReaccionActiva 
            ? InfoReaccionActiva.Icono 
            : '<i class="fa-regular fa-thumbs-up"></i>';
        const TextoBotonPrincipal = InfoReaccionActiva 
            ? InfoReaccionActiva.TituloCorto 
            : 'Reaccionar';
        const EstiloColorBoton = InfoReaccionActiva 
            ? `color: ${InfoReaccionActiva.Color}; font-weight: 700;` 
            : '';

        const NombrePublicador = ObjetoPublicacion.NombrePublicador || ObjetoPublicacion.NombreAutor || "Usuario LMP";

        let EsVerificadoAutor = false;
        if (this.ModeloAlmacenamiento && typeof this.ModeloAlmacenamiento.EsUsuarioVerificado === "function") {
            EsVerificadoAutor = this.ModeloAlmacenamiento.EsUsuarioVerificado(NombrePublicador, ObjetoPublicacion.EsVerificado === true);
        } else {
            EsVerificadoAutor = ObjetoPublicacion.EsVerificado === true;
        }
        const EsAdmin = UsuarioActual && (UsuarioActual.Rol === "Admin" || UsuarioActual.Rol === "admin");
        const EsAutorDeLaPublicacion = EstaAutenticado && (
            EsAdmin ||
            (NombrePublicador && (
                UsuarioActual.Nombre.trim().toLowerCase() === NombrePublicador.trim().toLowerCase() ||
                NombrePublicador.trim().toLowerCase().includes(UsuarioActual.Nombre.trim().toLowerCase()) ||
                UsuarioActual.Nombre.trim().toLowerCase().includes(NombrePublicador.trim().toLowerCase())
            ))
        );

        const TiempoPublicacion = (this.ModeloAlmacenamiento && ObjetoPublicacion.FechaCreacion)
            ? this.ModeloAlmacenamiento.FormatearTiempoRelativo(ObjetoPublicacion.FechaCreacion)
            : (ObjetoPublicacion.TiempoTranscurrido || 'Hace un momento');
        const TituloFechaPublicacion = (this.ModeloAlmacenamiento && ObjetoPublicacion.FechaCreacion)
            ? this.ModeloAlmacenamiento.FormatearFechaCompleta(ObjetoPublicacion.FechaCreacion)
            : '';

        return `
        <article class="TarjetaPublicacionMuro" id="Publicacion_${ObjetoPublicacion.IdPublicacion}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}">
            <!-- 1. Encabezado de la Publicación -->
            <header class="EncabezadoPublicacion">
                <div class="InfoAutorPublicacion">
                    <img src="${ObjetoPublicacion.AvatarAutor || 'Logo1.png'}" alt="${NombrePublicador}" class="AvatarAutorPublicacion" onerror="this.src='Logo1.png'">
                    <div class="DetallesAutorTexto">
                        <div class="NombreAutorTexto">
                            ${NombrePublicador}
                            ${EsVerificadoAutor ? '<span class="InsigniaVerificada" title="Publicador Verificado LMP"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                        </div>
                        <div class="MetaTiempoPublicacion">
                            <span ${TituloFechaPublicacion ? `title="${TituloFechaPublicacion}"` : ''}>${TiempoPublicacion}</span>
                            ${ObjetoPublicacion.EsEditada ? '<span>•</span> <span title="Publicación editada" style="font-size: 11px; opacity: 0.85;">(Editado)</span>' : ''}
                            <span>•</span>
                            <span title="Público"><i class="fa-solid fa-earth-americas" style="font-size: 11px;"></i></span>
                        </div>
                    </div>
                </div>

                ${EsAutorDeLaPublicacion ? `
                <div class="ContenedorOpcionesPublicacion">
                    <button class="BotonCircularIcono BotonDesplegarOpcionesPublicacion" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" style="width: 32px; height: 32px; font-size: 13px;" title="Opciones de publicación">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                    <div class="MenuDesplegableOpciones" id="MenuOpciones_${ObjetoPublicacion.IdPublicacion}">
                        <button class="ItemMenuOpcion BotonEditarPublicacion" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}">
                            <i class="fa-solid fa-pen-to-square"></i>
                            <span>Editar publicación</span>
                        </button>
                        <button class="ItemMenuOpcion ItemMenuPeligro BotonEliminarPublicacion" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}">
                            <i class="fa-solid fa-trash-can"></i>
                            <span>Eliminar publicación</span>
                        </button>
                    </div>
                </div>
                ` : ''}
            </header>

            <!-- 2. Cuerpo del Mensaje y Canción -->
            <div class="CuerpoContenidoPublicacion">
                <p class="MensajeTextoPublicacion">${ObjetoPublicacion.TextoPublicacion}</p>

                ${CancionAsociada ? `
                <div class="CajaFichaMusical">
                    <div class="EncabezadoFichaMusical">
                        <div class="TituloCancionFicha"><i class="fa-solid fa-music" style="color: var(--ColorPrimarioAzul); margin-right: 6px;"></i>${CancionAsociada.Titulo}</div>
                        <div class="InsigniasFichaMusical">
                            <span class="InsigniaRitmo">${CancionAsociada.Genero}</span>
                            <span class="InsigniaTono">${CancionAsociada.TonoOriginal}</span>
                        </div>
                    </div>

                    <!-- Mini Reproductor Embebido -->
                    <div class="ReproductorEmbebidoTarjeta">
                        <button class="BotonReproducirTarjeta" data-cancion-id="${CancionAsociada.IdCancion}" title="Reproducir muestra de ${CancionAsociada.Titulo}">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <div class="InfoPistaTarjeta">
                            <div class="TituloPistaTarjeta">${CancionAsociada.Titulo} - ${CancionAsociada.Autor}</div>
                            <div class="BarraProgresoPistaTarjeta">
                                <div class="ProgresoActualPista" id="ProgresoTarjeta_${CancionAsociada.IdCancion}"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Vista previa de Partitura si existe -->
                    ${CancionAsociada.ImagenPartitura ? `
                    <div class="VistaPreviaPartituraTarjeta" data-cancion-id="${CancionAsociada.IdCancion}" title="Ver manuscrito y partitura original">
                        <img src="${CancionAsociada.ImagenPartitura}" alt="Partitura ${CancionAsociada.Titulo}" class="ImagenPartituraMini">
                        <div class="InsigniaSuperpuestaPartitura"><i class="fa-solid fa-file-lines" style="margin-right: 4px;"></i>Ver Partitura / Manuscrito</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>

            <!-- 3. Estadísticas de Interacción -->
            <div class="FilaEstadisticasInteraccion">
                <div class="ContadorReaccionesPublicacion" id="ContenedorContadorLikes_${ObjetoPublicacion.IdPublicacion}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" style="${TotalReacciones > 0 ? 'display: flex;' : 'display: none;'}" title="${this.ObtenerTextoTooltipReacciones(ObjetoPublicacion)}">
                    <div class="BurbujasReaccionesIconos" id="BurbujasLikes_${ObjetoPublicacion.IdPublicacion}">
                        ${this.GenerarBurbujasReaccionesHtml(ObjetoPublicacion)}
                    </div>
                    <span id="ContadorLikes_${ObjetoPublicacion.IdPublicacion}">${TotalReacciones}</span>
                </div>
                <div style="display: flex; gap: 12px; margin-left: auto;">
                    <span id="ContadorComentarios_${ObjetoPublicacion.IdPublicacion}">${TotalComentarios} comentarios</span>
                    <span>${TotalCompartidos} veces compartido</span>
                </div>
            </div>

            <!-- 4. Barra de Botones de Acción FB con Reacciones Flotantes -->
            <div class="BarraBotonesAccionPublicacion">
                <!-- Botón de Reaccionar con Menú Emergente -->
                <div class="ContenedorBotonReaccionPrincipal" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" style="flex: 1; display: flex; position: relative;">
                    <!-- Menú Flotante con Iconos y Nombres debajo -->
                    <div class="ContenedorReaccionesEmergentes" id="MenuReacciones_${ObjetoPublicacion.IdPublicacion}">
                        <div class="BotonReaccionEmoji ${MiReaccionActual === 'MeGusta' ? 'ReaccionSeleccionada' : ''}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" data-tipo-reaccion="MeGusta" title="Me gusta">
                            <span class="IconoEmojiReaccion"><i class="fa-solid fa-thumbs-up" style="color: #1877f2;"></i></span>
                            <span class="EtiquetaNombreReaccion">Me gusta</span>
                        </div>
                        <div class="BotonReaccionEmoji ${MiReaccionActual === 'MeEncanta' ? 'ReaccionSeleccionada' : ''}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" data-tipo-reaccion="MeEncanta" title="Me encanta">
                            <span class="IconoEmojiReaccion"><i class="fa-solid fa-heart" style="color: #f3425f;"></i></span>
                            <span class="EtiquetaNombreReaccion">Me encanta</span>
                        </div>
                        <div class="BotonReaccionEmoji ${MiReaccionActual === 'VivaBeni' ? 'ReaccionSeleccionada' : ''}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" data-tipo-reaccion="VivaBeni" title="¡Viva el Beni!">
                            <span class="IconoEmojiReaccion"><i class="fa-solid fa-guitar" style="color: #2e7d32;"></i></span>
                            <span class="EtiquetaNombreReaccion">¡Viva Beni!</span>
                        </div>
                        <div class="BotonReaccionEmoji ${MiReaccionActual === 'Aplausos' ? 'ReaccionSeleccionada' : ''}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" data-tipo-reaccion="Aplausos" title="Aplausos folklóricos">
                            <span class="IconoEmojiReaccion"><i class="fa-solid fa-hands-clapping" style="color: #f7b125;"></i></span>
                            <span class="EtiquetaNombreReaccion">Aplausos</span>
                        </div>
                        <div class="BotonReaccionEmoji ${MiReaccionActual === 'BuenRitmo' ? 'ReaccionSeleccionada' : ''}" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" data-tipo-reaccion="BuenRitmo" title="¡Buen ritmo!">
                            <span class="IconoEmojiReaccion"><i class="fa-solid fa-music" style="color: #8b5cf6;"></i></span>
                            <span class="EtiquetaNombreReaccion">Buen ritmo</span>
                        </div>
                    </div>

                    <!-- Botón Principal que se actualiza con la reacción elegida -->
                    <button class="BotonAccionInteraccion BotonDisparadorReaccionRapida ${MiReaccionActual ? 'ReaccionadoActivo' : ''}" 
                            id="BotonReaccionPrincipal_${ObjetoPublicacion.IdPublicacion}" 
                            data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" 
                            style="width: 100%; ${EstiloColorBoton}">
                        <span class="IconoBotonReaccion">${IconoBotonPrincipal}</span>
                        <span class="TextoBotonReaccion">${TextoBotonPrincipal}</span>
                    </button>
                </div>

                <!-- Botón Comentar -->
                <button class="BotonAccionInteraccion BotonEnfocarComentario" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}">
                    <i class="fa-regular fa-comment"></i>
                    <span>
                        <span class="TextoBotonLargo">Comentar</span>
                        <span class="TextoBotonCorto">Opinar</span>
                    </span>
                </button>

                <!-- Botón Ver Letra Completa -->
                ${CancionAsociada ? `
                <button class="BotonAccionInteraccion BotonAbrirModalLetra" data-cancion-id="${CancionAsociada.IdCancion}">
                    <i class="fa-solid fa-scroll"></i>
                    <span>
                        <span class="TextoBotonLargo">Ver Letra</span>
                        <span class="TextoBotonCorto">Letra</span>
                    </span>
                </button>
                ` : ''}

                <!-- Botón Compartir -->
                <button class="BotonAccionInteraccion BotonCompartirPublicacion" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}">
                    <i class="fa-solid fa-share"></i>
                    <span>
                        <span class="TextoBotonLargo">Compartir</span>
                        <span class="TextoBotonCorto">Enviar</span>
                    </span>
                </button>
            </div>

            <!-- 5. Sección de Comentarios Desplegable -->
            <div class="SeccionComentariosPublicacion" id="SeccionComentarios_${ObjetoPublicacion.IdPublicacion}">
                <!-- Lista de Comentarios -->
                <div class="ListaComentariosExistentes" id="ListaComentarios_${ObjetoPublicacion.IdPublicacion}">
                    ${(ObjetoPublicacion.Comentarios || []).map(ComentarioItem => {
                        const TiempoComentario = (this.ModeloAlmacenamiento && ComentarioItem.FechaCreacion)
                            ? this.ModeloAlmacenamiento.FormatearTiempoRelativo(ComentarioItem.FechaCreacion)
                            : (ComentarioItem.Tiempo || 'Hace un momento');
                        const TituloFechaCom = (this.ModeloAlmacenamiento && ComentarioItem.FechaCreacion)
                            ? this.ModeloAlmacenamiento.FormatearFechaCompleta(ComentarioItem.FechaCreacion)
                            : '';

                        let DioLikeComentario = false;
                        if (EstaAutenticado && UsuarioActual && UsuarioActual.Nombre && Array.isArray(ComentarioItem.UsuariosLikes)) {
                            const NombreUsuarioActivo = UsuarioActual.Nombre.trim().toLowerCase();
                            DioLikeComentario = ComentarioItem.UsuariosLikes.some(n => 
                                typeof n === "string" && n.trim().toLowerCase() === NombreUsuarioActivo
                            );
                        }

                        const CantidadLikesCom = Array.isArray(ComentarioItem.UsuariosLikes) && ComentarioItem.UsuariosLikes.length > 0
                            ? ComentarioItem.UsuariosLikes.length
                            : (Number(ComentarioItem.CantidadLikes) || 0);

                        return `
                    <div class="ElementoComentarioIndividual" id="Comentario_${ComentarioItem.IdComentario}">
                        <img src="${ComentarioItem.AvatarUsuario || 'Logo1.png'}" alt="${ComentarioItem.NombreUsuario}" class="AvatarComentarista" onerror="this.src='Logo1.png'">
                        <div class="ContenidoComentarioCompleto">
                            <div class="BurbujaComentarioTexto">
                                <div class="NombreComentarista">
                                    ${ComentarioItem.NombreUsuario}
                                    ${(this.ModeloAlmacenamiento && this.ModeloAlmacenamiento.EsUsuarioVerificado(ComentarioItem.NombreUsuario)) ? '<span class="InsigniaVerificada" style="font-size: 11px; margin-left: 4px;" title="Verificado"><i class="fa-solid fa-circle-check" style="color: var(--ColorPrimarioAzul);"></i></span>' : ''}
                                </div>
                                <div class="CuerpoComentario">${ComentarioItem.TextoComentario}</div>
                            </div>
                            <div class="FilaMetaYAccionesComentario">
                                <span class="MetaComentarioTiempo" ${TituloFechaCom ? `title="${TituloFechaCom}"` : ''}>${TiempoComentario}</span>
                                <button class="BotonLikeComentario ${DioLikeComentario ? 'LikeActivo' : ''}" 
                                        data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" 
                                        data-comentario-id="${ComentarioItem.IdComentario}"
                                        id="BotonLikeCom_${ComentarioItem.IdComentario}">
                                    <i class="fa-solid fa-thumbs-up"></i> Me gusta
                                </button>
                                <span class="InsigniaLikesComentario" 
                                      id="InsigniaLikesCom_${ComentarioItem.IdComentario}" 
                                      style="${CantidadLikesCom > 0 ? 'display: inline-flex;' : 'display: none;'}">
                                    <i class="fa-solid fa-thumbs-up"></i>
                                    <span id="NumLikesCom_${ComentarioItem.IdComentario}">${CantidadLikesCom}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    `;
                    }).join('')}
                </div>

                <!-- Caja de Entrada para Nuevo Comentario -->
                <div class="FilaEntradaNuevoComentario">
                    ${EstaAutenticado ? `
                    <img src="${UsuarioActual.FotoPerfil || 'Logo1.png'}" alt="Usuario" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" onerror="this.src='Logo1.png'">
                    ` : `
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--ColorFondoSecundario); display: flex; align-items: center; justify-content: center; color: var(--ColorTextoSecundario); font-size: 15px; border: 1px solid var(--ColorBordeDivisor); flex-shrink: 0;">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    `}
                    <input 
                        type="text" 
                        class="CampoEntradaComentario" 
                        id="EntradaComentario_${ObjetoPublicacion.IdPublicacion}" 
                        placeholder="Escribe un comentario o saludo trinitario..."
                    >
                    <button class="BotonEnviarComentario" data-publicacion-id="${ObjetoPublicacion.IdPublicacion}" title="Enviar comentario">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </article>
        `;
    }
}

window.ComponenteTarjetaPublicacion = ComponenteTarjetaPublicacion;
