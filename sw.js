/* ==========================================================================
   SERVICE WORKER: LETRAS MI POBLAU (LMP) - PWA
   ========================================================================== */

const CACHE_NAME = 'lmp-pwa-cache-v18';
const RECURSOS_PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './README.md',
  './Logo1.png',
  './LogoIniciales.png',
  './LogoInicialesSinFondoBlanco.png',
  './LogoInicialesSinFondoNegro.png',
  './IFAEL.jpg',
  './HimnoAlBeni.mp3',
  './css/VariablesEstilos.css',
  './css/EstilosBase.css',
  './css/EstilosComponentes.css',
  './css/EstilosTemaOscuro.css',
  './css/EstilosResponsivos.css',
  './js/AplicacionPrincipal.js',
  './js/Capas/CapaDatos/ServicioFirebase.js',
  './js/Capas/CapaDatos/ModeloAlmacenamiento.js',
  './js/Capas/CapaServicios/ServicioCloudinary.js',
  './js/Capas/CapaServicios/ServicioEstado.js',
  './js/Capas/CapaServicios/ServicioReproductor.js',
  './js/Capas/CapaServicios/ServicioNotificaciones.js',
  './js/Capas/CapaComponentes/ComponenteEncabezado.js',
  './js/Capas/CapaComponentes/ComponenteBarraLateralIzquierda.js',
  './js/Capas/CapaComponentes/ComponenteBarraLateralDerecha.js',
  './js/Capas/CapaComponentes/ComponenteCrearPublicacion.js',
  './js/Capas/CapaComponentes/ComponenteTarjetaPublicacion.js',
  './js/Capas/CapaComponentes/ComponenteMuroPrincipal.js',
  './js/Capas/CapaComponentes/ComponenteSeccionCanciones.js',
  './js/Capas/CapaComponentes/ComponenteSeccionGeneros.js',
  './js/Capas/CapaComponentes/ComponenteSeccionArtistas.js',
  './js/Capas/CapaComponentes/ComponenteSeccionIFAEL.js',
  './js/Capas/CapaComponentes/ComponenteModalLetra.js',
  './js/Capas/CapaComponentes/ComponenteModalPartitura.js',
  './js/Capas/CapaComponentes/ComponenteModalCrearAporte.js',
  './js/Capas/CapaComponentes/ComponenteModalIniciarSesion.js',
  './js/Capas/CapaComponentes/ComponenteBarraNavegacionMovil.js',
  './js/Capas/CapaComponentes/ComponenteReproductorFlotante.js',
  './js/Capas/CapaControlador/ControladorPrincipal.js'
];

// 1. Instalación: cachear recursos estáticos clave
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RECURSOS_PRECACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activación: limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Intercepción de peticiones (Network First con fallback a Cache)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((respuestaRed) => {
        if (respuestaRed && respuestaRed.status === 200) {
          const respuestaClonada = respuestaRed.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, respuestaClonada);
          });
        }
        return respuestaRed;
      })
      .catch(() => {
        return caches.match(event.request).then((respuestaCache) => {
          if (respuestaCache) {
            return respuestaCache;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
