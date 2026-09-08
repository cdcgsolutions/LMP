/* ==========================================================================
   SUBCOMPONENTE: SELECTOR Y BUSCADOR DE ICONOS FONT AWESOME EN TIEMPO REAL
   Motor dinámico que consulta la API GraphQL oficial de Font Awesome con
   autocompletado, traductor por categorías español-inglés y componente modular.
   Letras Mi Poblau (LMP) - Nombres en PascalCase
   ========================================================================== */

class ComponenteSelectorIconosFA {
    constructor() {
        this.IconoSeleccionado = "fa-solid fa-guitar";
        this.TemporizadorDebounce = null;
        this.CacheConsultas = new Map();

        // Diccionario de traducción semántica y categorizada Español -> Inglés
        this.DiccionarioTraduccion = {
            // 1. Música e Instrumentos
            "guitarra": "guitar",
            "guitar": "guitar",
            "guitarra electrica": "guitar-electric",
            "bajo": "guitar",
            "mandolina": "guitar",
            "charango": "guitar",
            "bombo": "drum",
            "tambor": "drum",
            "tambora": "drum",
            "caja": "drum",
            "percusion": "drum",
            "flauta": "wind",
            "flauta dulce": "wind",
            "pifano": "wind",
            "pífano": "wind",
            "quena": "wind",
            "bajon": "wind",
            "bajón": "wind",
            "viento": "wind",
            "violin": "violin",
            "violín": "violin",
            "arpa": "music",
            "trompeta": "bullhorn",
            "trombon": "bullhorn",
            "clarinete": "wind",
            "saxofon": "music",
            "piano": "keyboard",
            "teclado": "keyboard",
            "maracas": "bell",
            "cascabeles": "bell",
            "sonajero": "bell",
            "musica": "music",
            "música": "music",
            "nota": "music",
            "notas": "music",
            "sonido": "volume-high",
            "canto": "microphone",
            "cantar": "microphone",
            "voz": "microphone",
            "microfono": "microphone",
            "micrófono": "microphone",
            "disco": "compact-disc",
            "vinilo": "record-vinyl",
            "auriculares": "headphones",
            "audifonos": "headphones",
            "audífonos": "headphones",
            "altavoz": "volume-high",
            "partitura": "scroll",

            // 2. Naturaleza, Selva y Amazonía
            "hoja": "leaf",
            "selva": "tree",
            "arbol": "tree",
            "árbol": "tree",
            "bosque": "tree",
            "planta": "seedling",
            "semilla": "seedling",
            "palmera": "tree",
            "pluma": "feather",
            "plumas": "feather",
            "plumaje": "feather",
            "prosa": "feather",
            "ave": "dove",
            "pajaro": "dove",
            "pájaro": "dove",
            "paloma": "dove",
            "fauna": "paw",
            "rio": "water",
            "río": "water",
            "agua": "water",
            "mamore": "water",
            "pescado": "fish",
            "pez": "fish",
            "sol": "sun",
            "amanecer": "sun",
            "luna": "moon",
            "fuego": "fire",
            "fogata": "fire",
            "viento": "wind",
            "tierra": "globe",

            // 3. Folclore, Danzas y Fiesta
            "mascara": "masks-theater",
            "máscara": "masks-theater",
            "danza": "masks-theater",
            "baile": "masks-theater",
            "bailarin": "person-walking",
            "teatro": "masks-theater",
            "fiesta": "champagne-glasses",
            "alegria": "face-smile",
            "alegría": "face-smile",
            "sombrero": "hat-cowboy",
            "machete": "gavel",
            "espada": "shield",
            "sarao": "circle-nodes",

            // 4. Patria, Cultura y Tradición
            "bandera": "flag",
            "patria": "flag",
            "cívico": "landmark",
            "civico": "landmark",
            "himno": "flag",
            "escudo": "shield",
            "iglesia": "church",
            "templo": "church",
            "mision": "church",
            "misión": "church",
            "campana": "bell",
            "cruz": "cross",
            "libro": "book",
            "historia": "book-open",
            "pergamino": "scroll",
            "estrella": "star",
            "corona": "crown",
            "premio": "award",
            "distincion": "award",
            "medalla": "medal",
            "trofeo": "trophy",
            "corazon": "heart",
            "corazón": "heart",
            "amor": "heart",
            "pueblo": "city",
            "monumento": "monument"
        };

        // Categorías rápidas para descubrimiento con 1 solo clic
        this.CategoriasRapidas = [
            { Etiqueta: "🎵 Música", Termino: "music" },
            { Etiqueta: "🎸 Instrumentos", Termino: "guitar" },
            { Etiqueta: "🌿 Selva & Beni", Termino: "leaf" },
            { Etiqueta: "🎭 Folclore & Danza", Termino: "masks-theater" },
            { Etiqueta: "🇧🇴 Patria & Cívico", Termino: "flag" },
            { Etiqueta: "🪶 Plumas & Aves", Termino: "feather" }
        ];

        // Iconos de respaldo instantáneo garantizado
        this.IconosFallback = [
            { Id: "guitar", Label: "Guitarra", Clase: "fa-solid fa-guitar" },
            { Id: "music", Label: "Nota Musical", Clase: "fa-solid fa-music" },
            { Id: "drum", Label: "Tambor / Bombo", Clase: "fa-solid fa-drum" },
            { Id: "leaf", Label: "Hoja / Selva", Clase: "fa-solid fa-leaf" },
            { Id: "masks-theater", Label: "Máscaras / Danza", Clase: "fa-solid fa-masks-theater" },
            { Id: "feather", Label: "Pluma / Machetero", Clase: "fa-solid fa-feather" },
            { Id: "flag", Label: "Bandera / Himno", Clase: "fa-solid fa-flag" },
            { Id: "compact-disc", Label: "Disco Musical", Clase: "fa-solid fa-compact-disc" },
            { Id: "bell", Label: "Campana / Misiones", Clase: "fa-solid fa-bell" },
            { Id: "award", Label: "Medalla / Galardón", Clase: "fa-solid fa-award" },
            { Id: "sun", Label: "Sol Amazónico", Clase: "fa-solid fa-sun" },
            { Id: "fire", Label: "Fuego Festivo", Clase: "fa-solid fa-fire" }
        ];
    }

    Renderizar(IconoInicial = "fa-solid fa-guitar") {
        this.IconoSeleccionado = IconoInicial;

        return `
        <div class="ContenedorSelectorIconosFA" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Fila Superior: Icono Actualmente Seleccionado y Barra de Búsqueda -->
            <div style="display: flex; gap: 10px; align-items: center;">
                <div class="InsigniaIconoSeleccionadoPrevia" id="InsigniaPreviaIconoSeleccionado" title="Icono seleccionado actual" style="width: 44px; height: 44px; border-radius: var(--RadioPequeno); background-color: var(--ColorPrimarioAzulSuave); border: 2px solid var(--ColorPrimarioAzul); display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--ColorPrimarioAzul); flex-shrink: 0; box-shadow: 0 2px 8px rgba(24, 119, 242, 0.2);">
                    <i class="${this.IconoSeleccionado}" id="ElementoIconoSeleccionadoPrevia"></i>
                </div>

                <div style="flex: 1; position: relative;">
                    <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ColorTextoSecundario); font-size: 13px;"></i>
                    <input type="text" id="InputBuscarIconoFA" placeholder="Buscar icono (ej. guitarra, tambor, selva, pluma, bandera...)" autocomplete="off" style="width: 100%; padding: 9px 34px 9px 34px; border: 1.5px solid #b0b3b8 !important; border-radius: var(--RadioPequeno); font-size: 13px; background-color: var(--ColorFondoSuperficie); color: var(--ColorTextoPrincipal); box-sizing: border-box;">
                    <button type="button" id="BotonLimpiarBusquedaFA" title="Limpiar búsqueda" style="display: none; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--ColorTextoSecundario); cursor: pointer; font-size: 13px; padding: 4px;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Chips de Categorías Rápidas -->
            <div class="FilaChipsCategoriasFA" style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: var(--ColorTextoSecundario); margin-right: 2px;">Sugerencias:</span>
                ${this.CategoriasRapidas.map(Cat => `
                    <button type="button" class="ChipCategoriaFA" data-termino="${Cat.Termino}" style="font-size: 11.5px; padding: 3px 9px; border-radius: var(--RadioPequeno); background-color: var(--ColorFondoSecundario); border: 1px solid var(--ColorBordeDivisor); color: var(--ColorTextoPrincipal); cursor: pointer; transition: all 0.15s ease;">
                        ${Cat.Etiqueta}
                    </button>
                `).join('')}
            </div>

            <!-- Cuadrícula Desplegable de Resultados -->
            <div class="ContenedorListaResultadosFA" id="ContenedorListaResultadosFA" style="background-color: var(--ColorFondoSuperficie); border: 1px solid var(--ColorBordeDivisor); border-radius: var(--RadioPequeno); padding: 10px; max-height: 190px; overflow-y: auto; box-shadow: inset 0 2px 6px rgba(0,0,0,0.04);">
                <div class="CuadriculaIconosResultados" id="CuadriculaIconosResultados" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(68px, 1fr)); gap: 8px;">
                    ${this.RenderizarItemsIconos(this.IconosFallback)}
                </div>
                <div id="EstadoCargandoIconosFA" style="display: none; text-align: center; padding: 16px; color: var(--ColorPrimarioAzul); font-size: 12.5px; font-weight: 600;">
                    <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Buscando iconos...
                </div>
                <div id="EstadoSinResultadosFA" style="display: none; text-align: center; padding: 16px; color: var(--ColorTextoSecundario); font-size: 12px;">
                    <i class="fa-solid fa-circle-question" style="font-size: 20px; display: block; margin-bottom: 6px; opacity: 0.6;"></i>
                    No se encontraron iconos para este término. Prueba con otra palabra clave.
                </div>
            </div>

            <!-- Campo oculto con la clase del icono seleccionado -->
            <input type="hidden" id="CampoClaseIconoSeleccionado" name="IconoClase" value="${this.IconoSeleccionado}">
        </div>
        `;
    }

    RenderizarItemsIconos(ListaIconos) {
        if (!ListaIconos || ListaIconos.length === 0) return "";

        return ListaIconos.map(Item => {
            const ClaseIcono = Item.Clase || `fa-solid fa-${Item.Id}`;
            const EsSeleccionado = this.IconoSeleccionado === ClaseIcono;

            return `
            <div class="TarjetaOpcionIconoFA ${EsSeleccionado ? 'IconoFAActivo' : ''}" data-clase="${ClaseIcono}" data-id="${Item.Id}" title="${Item.Label || Item.Id}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px 4px; border-radius: var(--RadioPequeno); border: 1.5px solid ${EsSeleccionado ? 'var(--ColorPrimarioAzul)' : 'var(--ColorBordeDivisor)'}; background-color: ${EsSeleccionado ? 'var(--ColorPrimarioAzulSuave)' : 'var(--ColorFondoSecundario)'}; cursor: pointer; transition: all 0.15s ease; user-select: none;">
                <i class="${ClaseIcono}" style="font-size: 18px; color: ${EsSeleccionado ? 'var(--ColorPrimarioAzul)' : 'var(--ColorTextoPrincipal)'};"></i>
                <span style="font-size: 10px; color: var(--ColorTextoSecundario); max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Item.Label || Item.Id}</span>
            </div>
            `;
        }).join('');
    }

    VincularEventos(CallbackAlSeleccionar) {
        const InputBuscar = document.getElementById("InputBuscarIconoFA");
        const BotonLimpiar = document.getElementById("BotonLimpiarBusquedaFA");
        const Cuadricula = document.getElementById("CuadriculaIconosResultados");
        const ContenedorLista = document.getElementById("ContenedorListaResultadosFA");
        const EstadoCargando = document.getElementById("EstadoCargandoIconosFA");
        const EstadoSinResultados = document.getElementById("EstadoSinResultadosFA");
        const InsigniaPrevia = document.getElementById("InsigniaPreviaIconoSeleccionado");
        const ElementoPrevia = document.getElementById("ElementoIconoSeleccionadoPrevia");
        const CampoOculto = document.getElementById("CampoClaseIconoSeleccionado");

        const SeleccionarIcono = (ClaseIcono, IdIcono) => {
            this.IconoSeleccionado = ClaseIcono;
            if (CampoOculto) CampoOculto.value = ClaseIcono;
            if (ElementoPrevia) ElementoPrevia.className = ClaseIcono;

            // Actualizar clase activa en la interfaz
            if (Cuadricula) {
                Cuadricula.querySelectorAll(".TarjetaOpcionIconoFA").forEach(Tarjeta => {
                    const EsActivo = Tarjeta.getAttribute("data-clase") === ClaseIcono;
                    Tarjeta.classList.toggle("IconoFAActivo", EsActivo);
                    Tarjeta.style.borderColor = EsActivo ? "var(--ColorPrimarioAzul)" : "var(--ColorBordeDivisor)";
                    Tarjeta.style.backgroundColor = EsActivo ? "var(--ColorPrimarioAzulSuave)" : "var(--ColorFondoSecundario)";
                    const IconoInterno = Tarjeta.querySelector("i");
                    if (IconoInterno) {
                        IconoInterno.style.color = EsActivo ? "var(--ColorPrimarioAzul)" : "var(--ColorTextoPrincipal)";
                    }
                });
            }

            if (typeof CallbackAlSeleccionar === "function") {
                CallbackAlSeleccionar(ClaseIcono, IdIcono);
            }
        };

        // Delegación de clics en la cuadrícula de iconos
        if (ContenedorLista) {
            ContenedorLista.addEventListener("click", (e) => {
                const Tarjeta = e.target.closest(".TarjetaOpcionIconoFA");
                if (Tarjeta) {
                    const Clase = Tarjeta.getAttribute("data-clase");
                    const Id = Tarjeta.getAttribute("data-id");
                    if (Clase) SeleccionarIcono(Clase, Id);
                }
            });
        }

        // Clic en chips de categorías rápidas
        document.querySelectorAll(".ChipCategoriaFA").forEach(Boton => {
            Boton.addEventListener("click", () => {
                const Termino = Boton.getAttribute("data-termino");
                if (InputBuscar) InputBuscar.value = Termino;
                if (BotonLimpiar) BotonLimpiar.style.display = "block";
                EjecutarBusqueda(Termino);
            });
        });

        // Búsqueda en tiempo real con debounce
        const EjecutarBusqueda = (TerminoUsuario) => {
            const TerminoLimpio = (TerminoUsuario || "").trim().toLowerCase();

            if (!TerminoLimpio) {
                if (Cuadricula) Cuadricula.innerHTML = this.RenderizarItemsIconos(this.IconosFallback);
                if (EstadoCargando) EstadoCargando.style.display = "none";
                if (EstadoSinResultados) EstadoSinResultados.style.display = "none";
                return;
            }

            if (EstadoCargando) EstadoCargando.style.display = "block";
            if (EstadoSinResultados) EstadoSinResultados.style.display = "none";
            if (Cuadricula) Cuadricula.style.opacity = "0.4";

            this.ConsultarMotorFontAwesome(TerminoLimpio).then(IconosEncontrados => {
                if (EstadoCargando) EstadoCargando.style.display = "none";
                if (Cuadricula) Cuadricula.style.opacity = "1";

                if (IconosEncontrados && IconosEncontrados.length > 0) {
                    if (Cuadricula) Cuadricula.innerHTML = this.RenderizarItemsIconos(IconosEncontrados);
                    if (EstadoSinResultados) EstadoSinResultados.style.display = "none";
                } else {
                    if (Cuadricula) Cuadricula.innerHTML = "";
                    if (EstadoSinResultados) EstadoSinResultados.style.display = "block";
                }
            }).catch(Err => {
                console.warn("[ComponenteSelectorIconosFA] Error en consulta Font Awesome:", Err);
                if (EstadoCargando) EstadoCargando.style.display = "none";
                if (Cuadricula) {
                    Cuadricula.style.opacity = "1";
                    // Fallback con filtro local del diccionario
                    const IconosFiltrados = this.FiltrarIconosLocalmente(TerminoLimpio);
                    Cuadricula.innerHTML = this.RenderizarItemsIconos(IconosFiltrados);
                }
            });
        };

        if (InputBuscar) {
            InputBuscar.addEventListener("input", (e) => {
                const Valor = e.target.value;
                if (BotonLimpiar) BotonLimpiar.style.display = Valor.length > 0 ? "block" : "none";

                clearTimeout(this.TemporizadorDebounce);
                this.TemporizadorDebounce = setTimeout(() => {
                    EjecutarBusqueda(Valor);
                }, 280);
            });
        }

        if (BotonLimpiar && InputBuscar) {
            BotonLimpiar.addEventListener("click", () => {
                InputBuscar.value = "";
                BotonLimpiar.style.display = "none";
                EjecutarBusqueda("");
                InputBuscar.focus();
            });
        }
    }

    // Consulta en vivo al endpoint GraphQL público oficial de Font Awesome
    async ConsultarMotorFontAwesome(TerminoEntrada) {
        // 1. Traducir usando el diccionario español -> inglés si aplica
        let TerminoBusqueda = TerminoEntrada;
        const Palabras = TerminoEntrada.split(/\s+/);

        for (const Palabra of Palabras) {
            if (this.DiccionarioTraduccion[Palabra]) {
                TerminoBusqueda = this.DiccionarioTraduccion[Palabra];
                break;
            }
        }

        // Si existe en caché, devolver inmediatamente
        if (this.CacheConsultas.has(TerminoBusqueda)) {
            return this.CacheConsultas.get(TerminoBusqueda);
        }

        const CuerpoQuery = JSON.stringify({
            query: `{
                search(version: "6.5.1", query: "${TerminoBusqueda}", first: 18) {
                    id
                    label
                    familyStylesByLicense {
                        free {
                            style
                        }
                    }
                }
            }`
        });

        const Respuesta = await fetch("https://api.fontawesome.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: CuerpoQuery
        });

        if (!Respuesta.ok) {
            throw new Error(`Error HTTP ${Respuesta.status} en Font Awesome API`);
        }

        const Json = await Respuesta.json();
        const ListaOriginal = (Json && Json.data && Json.data.search) || [];

        // Filtrar exclusivamente iconos que tengan estilo gratuito (free) disponible en Font Awesome 6
        const IconosValidos = ListaOriginal
            .filter(Icono => {
                const EstilosFree = Icono.familyStylesByLicense && Icono.familyStylesByLicense.free;
                return Array.isArray(EstilosFree) && EstilosFree.length > 0;
            })
            .map(Icono => {
                const Estilo = Icono.familyStylesByLicense.free[0].style || "solid";
                const Prefijo = Estilo === "brands" ? "fa-brands" : (Estilo === "regular" ? "fa-regular" : "fa-solid");
                return {
                    Id: Icono.id,
                    Label: Icono.label || Icono.id,
                    Clase: `${Prefijo} fa-${Icono.id}`
                };
            });

        // Guardar en caché local para respuestas instantáneas futuras
        this.CacheConsultas.set(TerminoBusqueda, IconosValidos);
        return IconosValidos;
    }

    FiltrarIconosLocalmente(Termino) {
        const TerminoTraducido = this.DiccionarioTraduccion[Termino] || Termino;
        return this.IconosFallback.filter(Icono => 
            Icono.Id.includes(TerminoTraducido) || 
            Icono.Label.toLowerCase().includes(Termino) ||
            Icono.Id.includes(Termino)
        );
    }
}

window.ComponenteSelectorIconosFA = ComponenteSelectorIconosFA;
