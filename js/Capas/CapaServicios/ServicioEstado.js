/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE ESTADO GLOBAL REACTIVO
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioEstado {
    constructor() {
        this.EstadoInterno = {
            PestanaActiva: "muro", // muro | canciones | generos | artistas | ifael
            TerminoBusquedaGlobal: "",
            FiltroGeneroCanciones: "Todos",
            FiltroTonoCanciones: "Todos",
            CancionActualReproduccion: null,
            EstaReproduciendoAudio: false,
            ModoOscuro: false,
            MenuLateralMovilAbierto: false,
            UsuarioActual: {
                Nombre: "Edna Miriam Edgley Cuellar",
                Rol: "Investigadora Musical & Compositora",
                Avatar: "Logo1.png"
            }
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
}

window.ServicioEstado = ServicioEstado;
