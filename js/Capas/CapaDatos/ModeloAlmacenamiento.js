/* ==========================================================================
   CAPA DE DATOS: MODELO DE ALMACENAMIENTO PERSISTENTE (LOCALSTORAGE)
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ModeloAlmacenamiento {
    constructor() {
        this.ClaveAlmacenamientoPublicaciones = "LMP_Publicaciones_v2";
        this.ClaveAlmacenamientoCanciones = "LMP_Canciones_v2";
        this.ClaveAlmacenamientoTemaOscuro = "LMP_ModoOscuro_v1";
        this.InicializarDatosPorDefecto();
    }

    InicializarDatosPorDefecto() {
        // Limpiar versiones anteriores para renovar datos
        if (localStorage.getItem("LMP_Canciones_v1")) {
            localStorage.removeItem("LMP_Canciones_v1");
        }
        if (localStorage.getItem("LMP_Publicaciones_v1")) {
            localStorage.removeItem("LMP_Publicaciones_v1");
        }

        if (!localStorage.getItem(this.ClaveAlmacenamientoCanciones)) {
            localStorage.setItem(
                this.ClaveAlmacenamientoCanciones,
                JSON.stringify(window.DatosCancionesColeccion || [])
            );
        }

        if (!localStorage.getItem(this.ClaveAlmacenamientoPublicaciones)) {
            localStorage.setItem(
                this.ClaveAlmacenamientoPublicaciones,
                JSON.stringify(window.DatosPublicacionesIniciales || [])
            );
        }
    }

    SanitizarCanciones(Canciones) {
        if (!Array.isArray(Canciones)) return [];
        return Canciones.map(Cancion => {
            if (Cancion.Autor && (Cancion.Autor.includes("Luci") || Cancion.Autor.includes("Xiomi") || Cancion.Autor.includes("Camacho"))) {
                Cancion.Autor = "Edna Miriam Edgley Cuellar";
            }
            return Cancion;
        });
    }

    SanitizarPublicaciones(Publicaciones) {
        if (!Array.isArray(Publicaciones)) return [];
        return Publicaciones.map(Pub => {
            if (Pub.NombreAutor && (Pub.NombreAutor.includes("Luci") || Pub.NombreAutor.includes("Xiomi") || Pub.NombreAutor.includes("Camacho"))) {
                Pub.NombreAutor = "Edna Miriam Edgley Cuellar";
            }
            if (Array.isArray(Pub.Comentarios)) {
                Pub.Comentarios.forEach(C => {
                    if (C.TextoComentario) {
                        C.TextoComentario = C.TextoComentario.replace(/Xiomi/gi, "Edna Miriam").replace(/Luci/gi, "Edna");
                    }
                });
            }
            return Pub;
        });
    }

    ObtenerTodasLasCanciones() {
        try {
            const CancionesEnBruto = localStorage.getItem(this.ClaveAlmacenamientoCanciones);
            const Canciones = CancionesEnBruto ? JSON.parse(CancionesEnBruto) : window.DatosCancionesColeccion;
            return this.SanitizarCanciones(Canciones);
        } catch (ErrorCapturado) {
            console.error("Error al obtener canciones de almacenamiento:", ErrorCapturado);
            return this.SanitizarCanciones(window.DatosCancionesColeccion || []);
        }
    }

    GuardarCancionNueva(ObjetoCancion) {
        const CancionesActuales = this.ObtenerTodasLasCanciones();
        ObjetoCancion.IdCancion = Date.now();
        CancionesActuales.unshift(ObjetoCancion);
        localStorage.setItem(this.ClaveAlmacenamientoCanciones, JSON.stringify(CancionesActuales));
        return ObjetoCancion;
    }

    ObtenerCancionPorId(IdCancionBuscada) {
        const Canciones = this.ObtenerTodasLasCanciones();
        return Canciones.find(CancionItem => CancionItem.IdCancion === Number(IdCancionBuscada));
    }

    ObtenerTodasLasPublicaciones() {
        try {
            const PublicacionesEnBruto = localStorage.getItem(this.ClaveAlmacenamientoPublicaciones);
            const Publicaciones = PublicacionesEnBruto ? JSON.parse(PublicacionesEnBruto) : window.DatosPublicacionesIniciales;
            return this.SanitizarPublicaciones(Publicaciones);
        } catch (ErrorCapturado) {
            console.error("Error al obtener publicaciones:", ErrorCapturado);
            return this.SanitizarPublicaciones(window.DatosPublicacionesIniciales || []);
        }
    }

    GuardarPublicacionNueva(ObjetoPublicacion) {
        const PublicacionesActuales = this.ObtenerTodasLasPublicaciones();
        ObjetoPublicacion.IdPublicacion = Date.now();
        ObjetoPublicacion.TiempoTranscurrido = "Hace un momento";
        ObjetoPublicacion.CantidadMeGusta = 1;
        ObjetoPublicacion.TipoReaccionPredominante = "MeGusta";
        ObjetoPublicacion.ReaccionesDetalle = {
            MeGusta: 1,
            MeEncanta: 0,
            VivaBeni: 0,
            Aplausos: 0
        };
        ObjetoPublicacion.CantidadCompartidos = 0;
        ObjetoPublicacion.Comentarios = [];

        PublicacionesActuales.unshift(ObjetoPublicacion);
        localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(PublicacionesActuales));
        return ObjetoPublicacion;
    }

    AgregarComentarioAPublicacion(IdPublicacion, ObjetoComentario) {
        const PublicacionesActuales = this.ObtenerTodasLasPublicaciones();
        const IndicePublicacion = PublicacionesActuales.findIndex(Pub => Pub.IdPublicacion === Number(IdPublicacion));
        
        if (IndicePublicacion !== -1) {
            ObjetoComentario.IdComentario = Date.now();
            ObjetoComentario.Tiempo = "Hace un momento";
            ObjetoComentario.CantidadLikes = 0;
            PublicacionesActuales[IndicePublicacion].Comentarios.push(ObjetoComentario);
            localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(PublicacionesActuales));
            return PublicacionesActuales[IndicePublicacion];
        }
        return null;
    }

    RegistrarReaccionEnPublicacion(IdPublicacion, TipoReaccion) {
        const PublicacionesActuales = this.ObtenerTodasLasPublicaciones();
        const PublicacionObjetivo = PublicacionesActuales.find(Pub => Pub.IdPublicacion === Number(IdPublicacion));

        if (PublicacionObjetivo) {
            if (!PublicacionObjetivo.ReaccionesDetalle) {
                PublicacionObjetivo.ReaccionesDetalle = { MeGusta: 0, MeEncanta: 0, VivaBeni: 0, Aplausos: 0 };
            }
            if (PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] !== undefined) {
                PublicacionObjetivo.ReaccionesDetalle[TipoReaccion]++;
            } else {
                PublicacionObjetivo.ReaccionesDetalle[TipoReaccion] = 1;
            }
            PublicacionObjetivo.CantidadMeGusta++;
            PublicacionObjetivo.TipoReaccionPredominante = TipoReaccion;
            localStorage.setItem(this.ClaveAlmacenamientoPublicaciones, JSON.stringify(PublicacionesActuales));
            return PublicacionObjetivo;
        }
        return null;
    }

    ObtenerEstadoTemaOscuro() {
        return localStorage.getItem(this.ClaveAlmacenamientoTemaOscuro) === "true";
    }

    GuardarEstadoTemaOscuro(EsTemaOscuro) {
        localStorage.setItem(this.ClaveAlmacenamientoTemaOscuro, String(EsTemaOscuro));
    }
}

window.ModeloAlmacenamiento = ModeloAlmacenamiento;
