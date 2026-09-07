/* ==========================================================================
   CAPA DE SERVICIOS: SERVICIO DE ALMACENAMIENTO MULTIMEDIA EN CLOUDINARY
   Nombres en PascalCase - Letras Mi Poblau (LMP)
   ========================================================================== */

class ServicioCloudinary {
    // #region Propiedades y Constructor
    constructor() {
        this.CloudName = "pjmt8rts";
        this.UploadPreset = "lmp_uploads";
        this.UrlBaseApi = `https://api.cloudinary.com/v1_1/${this.CloudName}/auto/upload`;
    }
    // #endregion

    // #region Metodos de Subida a Cloudinary
    async SubirArchivo(Archivo, Carpeta = "lmp_multimedia") {
        if (!Archivo) {
            console.warn("[ServicioCloudinary] No se proporcionó ningún archivo para subir.");
            return null;
        }

        try {
            const DatosFormulario = new FormData();
            DatosFormulario.append("file", Archivo);
            DatosFormulario.append("upload_preset", this.UploadPreset);
            if (Carpeta) {
                DatosFormulario.append("folder", Carpeta);
            }

            console.log(`[ServicioCloudinary] Subiendo archivo "${Archivo.name}" (${(Archivo.size / 1024).toFixed(1)} KB)...`);

            const Respuesta = await fetch(this.UrlBaseApi, {
                method: "POST",
                body: DatosFormulario
            });

            if (!Respuesta.ok) {
                const ErrorDetalle = await Respuesta.json().catch(() => ({}));
                throw new Error(ErrorDetalle.error?.message || `HTTP ${Respuesta.status}: Error en subida a Cloudinary`);
            }

            const Resultado = await Respuesta.json();
            console.log(`[ServicioCloudinary] Archivo subido con éxito:`, Resultado.secure_url);

            return {
                UrlSegura: Resultado.secure_url,
                IdPublico: Resultado.public_id,
                Formato: Resultado.format,
                TipoRecurso: Resultado.resource_type,
                TamanoBytes: Resultado.bytes
            };
        } catch (ErrorCapturado) {
            console.error("[ServicioCloudinary] Error durante la subida:", ErrorCapturado);
            throw ErrorCapturado;
        }
    }

    async SubirPartitura(ArchivoPartitura) {
        const Resultado = await this.SubirArchivo(ArchivoPartitura, "lmp_partituras");
        return Resultado ? Resultado.UrlSegura : null;
    }

    async SubirAudio(ArchivoAudio) {
        const Resultado = await this.SubirArchivo(ArchivoAudio, "lmp_audios");
        return Resultado ? Resultado.UrlSegura : null;
    }

    async SubirImagen(ArchivoImagen) {
        const Resultado = await this.SubirArchivo(ArchivoImagen, "lmp_imagenes");
        return Resultado ? Resultado.UrlSegura : null;
    }
    // #endregion
}

window.ServicioCloudinary = ServicioCloudinary;
