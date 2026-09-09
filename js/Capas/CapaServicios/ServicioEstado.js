/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE ESTADO GLOBAL REACTIVO
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioEstado {
    constructor() {
        let SesionGuardada = null;
        try {
            const SesionStr = localStorage.getItem("LMP_SesionUsuario_v1");
            if (SesionStr) {
                SesionGuardada = JSON.parse(SesionStr);
            }
        } catch (ErrorSesion) {
            SesionGuardada = null;
        }

        const UsuarioPorDefectoInvitado = {
            EsInvitado: true,
            Nombre: "Usuario",
            Rol: "",
            Carrera: "",
            Avatar: "AvatarInvitado",
            FotoPerfil: "",
            EsVerificado: false
        };

        this.EstadoInterno = {
            PestanaActiva: "muro", // muro | canciones | generos | artistas | ifael
            TerminoBusquedaGlobal: "",
            FiltroGeneroCanciones: "Todos",
            FiltroTonoCanciones: "Todos",
            CancionActualReproduccion: null,
            EstaReproduciendoAudio: false,
            ModoOscuro: false,
            MenuLateralMovilAbierto: false,
            UsuarioActual: SesionGuardada || UsuarioPorDefectoInvitado
        };
        this.ListaObservadores = {};
    }

    SuscribirEvento(NombreEvento, FuncionCallback) {
        if (!this.ListaObservadores[NombreEvento]) {
            this.ListaObservadores[NombreEvento] = [];
        }
        this.ListaObservadores[NombreEvento].push(FuncionCallback);
    }

    NotificarEvento(NombreEvento, DatosEvento) {
        if (this.ListaObservadores[NombreEvento]) {
            this.ListaObservadores[NombreEvento].forEach(Callback => Callback(DatosEvento));
        }
    }

    ObtenerEstado(Clave) {
        return Clave ? this.EstadoInterno[Clave] : this.EstadoInterno;
    }

    EstablecerPestanaActiva(NuevaPestana) {
        this.EstadoInterno.PestanaActiva = NuevaPestana;
        this.NotificarEvento("CambioPestanaActiva", NuevaPestana);
    }

    EstablecerTerminoBusqueda(NuevoTermino) {
        this.EstadoInterno.TerminoBusquedaGlobal = NuevoTermino.trim().toLowerCase();
        this.NotificarEvento("CambioTerminoBusqueda", this.EstadoInterno.TerminoBusquedaGlobal);
    }

    EstablecerFiltrosCanciones(Genero, Tono) {
        if (Genero !== undefined) this.EstadoInterno.FiltroGeneroCanciones = Genero;
        if (Tono !== undefined) this.EstadoInterno.FiltroTonoCanciones = Tono;
        this.NotificarEvento("CambioFiltrosCanciones", {
            Genero: this.EstadoInterno.FiltroGeneroCanciones,
            Tono: this.EstadoInterno.FiltroTonoCanciones
        });
    }

    EstablecerCancionReproduciendo(ObjetoCancion, ReproducirInmediatamente = true) {
        this.EstadoInterno.CancionActualReproduccion = ObjetoCancion;
        this.EstadoInterno.EstaReproduciendoAudio = ReproducirInmediatamente;
        this.NotificarEvento("CambioCancionReproduccion", {
            Cancion: ObjetoCancion,
            Reproducir: ReproducirInmediatamente
        });
    }

    AlternarEstadoReproduccion(EstaReproduciendo) {
        this.EstadoInterno.EstaReproduciendoAudio = EstaReproduciendo !== undefined 
            ? EstaReproduciendo 
            : !this.EstadoInterno.EstaReproduciendoAudio;
        this.NotificarEvento("CambioEstadoReproduccionAudio", this.EstadoInterno.EstaReproduciendoAudio);
    }

    AlternarModoOscuro(ActivarOscuro) {
        this.EstadoInterno.ModoOscuro = ActivarOscuro !== undefined 
            ? ActivarOscuro 
            : !this.EstadoInterno.ModoOscuro;
        this.NotificarEvento("CambioModoOscuro", this.EstadoInterno.ModoOscuro);
    }

    AlternarMenuMovil(EstaAbierto) {
        this.EstadoInterno.MenuLateralMovilAbierto = EstaAbierto !== undefined 
            ? EstaAbierto 
            : !this.EstadoInterno.MenuLateralMovilAbierto;
        this.NotificarEvento("CambioMenuMovil", this.EstadoInterno.MenuLateralMovilAbierto);
    }

    EstaAutenticado() {
        const Usuario = this.EstadoInterno.UsuarioActual;
        return !!(Usuario && !Usuario.EsInvitado && Usuario.Nombre && Usuario.Nombre !== "Usuario");
    }

    ObtenerUsuarioActual() {
        return this.EstadoInterno.UsuarioActual;
    }

    IniciarSesion(DatosUsuario) {
        const UsuarioSesion = {
            EsInvitado: false,
            IdUsuario: DatosUsuario.IdUsuario || "",
            Nombre: DatosUsuario.NombreCompleto || DatosUsuario.Nombre || "Usuario",
            Rol: DatosUsuario.Rol || "User",
            Carrera: DatosUsuario.Carrera || "",
            Avatar: DatosUsuario.FotoPerfilUrl || DatosUsuario.FotoPerfil || DatosUsuario.Avatar || "Logo1.png",
            FotoPerfil: DatosUsuario.FotoPerfilUrl || DatosUsuario.FotoPerfil || DatosUsuario.Avatar || "Logo1.png",
            EsVerificado: DatosUsuario.EsVerificado === true,
            CorreoElectronico: DatosUsuario.CorreoElectronico || ""
        };

        this.EstadoInterno.UsuarioActual = UsuarioSesion;
        try {
            localStorage.setItem("LMP_SesionUsuario_v1", JSON.stringify(UsuarioSesion));
        } catch (e) {
            console.warn("[ServicioEstado] Error al guardar sesión:", e);
        }

        this.NotificarEvento("CambioSesionUsuario", UsuarioSesion);
    }

    SincronizarUsuarioConBaseDatos(ListaUsuarios) {
        if (!this.EstaAutenticado() || !Array.isArray(ListaUsuarios) || ListaUsuarios.length === 0) return;
        const UsuarioActual = this.EstadoInterno.UsuarioActual;
        const UsuarioFresco = ListaUsuarios.find(U => 
            (UsuarioActual.IdUsuario && U.IdUsuario === UsuarioActual.IdUsuario) ||
            (UsuarioActual.CorreoElectronico && U.CorreoElectronico && U.CorreoElectronico.toLowerCase() === UsuarioActual.CorreoElectronico.toLowerCase()) ||
            (UsuarioActual.Nombre && U.NombreCompleto && U.NombreCompleto.trim().toLowerCase() === UsuarioActual.Nombre.trim().toLowerCase())
        );

        if (UsuarioFresco) {
            UsuarioActual.IdUsuario = UsuarioFresco.IdUsuario || UsuarioActual.IdUsuario;
            UsuarioActual.Nombre = UsuarioFresco.NombreCompleto || UsuarioActual.Nombre;
            UsuarioActual.FotoPerfil = UsuarioFresco.FotoPerfil || UsuarioFresco.FotoPerfilUrl || UsuarioActual.FotoPerfil;
            UsuarioActual.Avatar = UsuarioActual.FotoPerfil;
            UsuarioActual.Rol = UsuarioFresco.Rol || UsuarioActual.Rol;
            UsuarioActual.Carrera = UsuarioFresco.Carrera || UsuarioActual.Carrera;
            UsuarioActual.EsVerificado = UsuarioFresco.EsVerificado === true;
            UsuarioActual.CorreoElectronico = UsuarioFresco.CorreoElectronico || UsuarioActual.CorreoElectronico;

            try {
                localStorage.setItem("LMP_SesionUsuario_v1", JSON.stringify(UsuarioActual));
            } catch (e) {}

            this.NotificarEvento("CambioSesionUsuario", UsuarioActual);
        }
    }

    CerrarSesion() {
        const UsuarioInvitado = {
            EsInvitado: true,
            Nombre: "Usuario",
            Rol: "",
            Carrera: "",
            Avatar: "AvatarInvitado",
            FotoPerfil: "",
            EsVerificado: false
        };

        this.EstadoInterno.UsuarioActual = UsuarioInvitado;
        try {
            localStorage.removeItem("LMP_SesionUsuario_v1");
        } catch (e) {
            console.warn("[ServicioEstado] Error al limpiar sesión:", e);
        }

        this.NotificarEvento("CambioSesionUsuario", UsuarioInvitado);
    }
}

window.ServicioEstado = ServicioEstado;
