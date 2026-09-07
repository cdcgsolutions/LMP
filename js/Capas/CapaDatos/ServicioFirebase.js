/* ==========================================================================
   CAPA DE DATOS: SERVICIO FIREBASE / FIRESTORE
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioFirebase {
    // #region Propiedades y Constructor
    constructor() {
        this.ConfiguracionFirebase = {
            apiKey: "AIzaSyBxumQznP7bh0j6pxs1Xvo1GgdR424CFXk",
            authDomain: "lmp-7ed0e.firebaseapp.com",
            projectId: "lmp-7ed0e",
            storageBucket: "lmp-7ed0e.firebasestorage.app",
            messagingSenderId: "652224267016",
            appId: "1:652224267016:web:0fc2cc32a8c5679d9362bd",
            measurementId: "G-LJZHKEK2ZH"
        };

        this.AppFirebase = null;
        this.BaseDatosFirestore = null;
        this.Autenticacion = null;
        this.Analiticas = null;
        this.EstaInicializado = false;
    }
    // #endregion

    // #region Inicializacion
    Inicializar() {
        try {
            if (typeof firebase === "undefined") {
                console.error("[ServicioFirebase] SDK de Firebase no encontrado.");
                return false;
            }

            this.AppFirebase = firebase.initializeApp(this.ConfiguracionFirebase);
            this.BaseDatosFirestore = firebase.firestore();

            if (firebase.auth) {
                this.Autenticacion = firebase.auth();
            }

            if (firebase.analytics) {
                this.Analiticas = firebase.analytics();
            }

            this.EstaInicializado = true;
            console.log("[ServicioFirebase] Conectado exitosamente al proyecto:", this.ConfiguracionFirebase.projectId);
            return true;
        } catch (ErrorCapturado) {
            console.error("[ServicioFirebase] Error al inicializar:", ErrorCapturado);
            return false;
        }
    }

    ObtenerFirestore() {
        if (!this.EstaInicializado) {
            console.warn("[ServicioFirebase] Firebase no inicializado.");
            return null;
        }
        return this.BaseDatosFirestore;
    }

    ObtenerAuth() {
        return this.Autenticacion;
    }

    ObtenerAnaliticas() {
        return this.Analiticas;
    }
    // #endregion

    // #region Referencias a Colecciones
    ColeccionUsuarios() {
        return this.BaseDatosFirestore.collection("Usuarios");
    }

    ColeccionPublicaciones() {
        return this.BaseDatosFirestore.collection("Publicaciones");
    }

    ColeccionCanciones() {
        return this.BaseDatosFirestore.collection("Canciones");
    }

    ColeccionGeneros() {
        return this.BaseDatosFirestore.collection("Generos");
    }

    ColeccionArtistas() {
        return this.BaseDatosFirestore.collection("Artistas");
    }

    ColeccionIFAEL() {
        return this.BaseDatosFirestore.collection("IFAEL");
    }

    ColeccionPartiturasDigitales() {
        return this.BaseDatosFirestore.collection("PartiturasDigitales");
    }

    SubcoleccionComentarios(IdPublicacion) {
        return this.BaseDatosFirestore
            .collection("Publicaciones")
            .doc(IdPublicacion)
            .collection("Comentarios");
    }

    SubcoleccionReacciones(IdPublicacion) {
        return this.BaseDatosFirestore
            .collection("Publicaciones")
            .doc(IdPublicacion)
            .collection("Reacciones");
    }
    // #endregion

    // #region Operaciones CRUD Firestore
    // #region GET (Lecturas)
    async ConsultarColeccion(NombreColeccion) {
        return await this.BaseDatosFirestore.collection(NombreColeccion).get();
    }

    async ConsultarDocumentoPorId(NombreColeccion, IdDocumento) {
        return await this.BaseDatosFirestore.collection(NombreColeccion).doc(IdDocumento).get();
    }
    // #endregion

    // #region POST (Creacion)
    async InsertarDocumento(NombreColeccion, DatosDocumento) {
        return await this.BaseDatosFirestore.collection(NombreColeccion).add(DatosDocumento);
    }
    // #endregion

    // #region PUT (Actualizacion)
    async ActualizarDocumento(NombreColeccion, IdDocumento, DatosActualizados) {
        return await this.BaseDatosFirestore.collection(NombreColeccion).doc(IdDocumento).update(DatosActualizados);
    }
    // #endregion

    // #region DELETE (Eliminacion)
    async EliminarDocumento(NombreColeccion, IdDocumento) {
        return await this.BaseDatosFirestore.collection(NombreColeccion).doc(IdDocumento).delete();
    }

    async EliminarPublicacionConSubcolecciones(IdPublicacion) {
        if (!this.BaseDatosFirestore || !IdPublicacion) return;

        try {
            const SnapComentarios = await this.SubcoleccionComentarios(String(IdPublicacion)).get();
            if (!SnapComentarios.empty) {
                const Batch = this.BaseDatosFirestore.batch();
                SnapComentarios.forEach(Doc => Batch.delete(Doc.ref));
                await Batch.commit();
            }
        } catch (e) {
            console.warn("[ServicioFirebase] Error al limpiar comentarios:", e);
        }

        try {
            const SnapReacciones = await this.SubcoleccionReacciones(String(IdPublicacion)).get();
            if (!SnapReacciones.empty) {
                const Batch = this.BaseDatosFirestore.batch();
                SnapReacciones.forEach(Doc => Batch.delete(Doc.ref));
                await Batch.commit();
            }
        } catch (e) {
            console.warn("[ServicioFirebase] Error al limpiar reacciones:", e);
        }

        return await this.ColeccionPublicaciones().doc(String(IdPublicacion)).delete();
    }
    // #endregion
    // #endregion

    // #region Utilidades
    MarcaDeTiempoServidor() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    Incrementar(Cantidad = 1) {
        return firebase.firestore.FieldValue.increment(Cantidad);
    }
    // #endregion
}

window.ServicioFirebase = ServicioFirebase;
