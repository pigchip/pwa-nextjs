const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URL = "/offline";
const ICON_URL = "/icon-144.png";
const TILES_PATH = "/tiles/";

const FILES_TO_CACHE = [
  OFFLINE_URL,
  ICON_URL,
];

// Función para agregar dinámicamente las tiles al cache
const cacheTiles = async (cache) => {
  // Lista de archivos disponibles
  const availableTiles = [
    '12_917_1820.png', '12_917_1821.png', '12_917_1822.png', '12_917_1823.png', '12_917_1824.png', '12_917_1825.png',
    '12_918_1820.png', '12_918_1821.png', '12_918_1822.png', '12_918_1823.png', '12_918_1824.png', '12_918_1825.png',
    '12_919_1820.png', '12_919_1821.png', '12_919_1822.png', '12_919_1823.png', '12_919_1824.png', '12_919_1825.png',
    '12_920_1820.png', '12_920_1821.png', '12_920_1822.png', '12_920_1823.png', '12_920_1824.png', '12_920_1825.png',
    '12_921_1820.png', '12_921_1821.png', '12_921_1822.png', '12_921_1823.png', '12_921_1824.png', '12_921_1825.png',
    '12_922_1820.png', '12_922_1821.png', '12_922_1822.png', '12_922_1823.png', '12_922_1824.png', '12_922_1825.png',
    '13_1835_3641.png', '13_1835_3642.png', '13_1835_3643.png', '13_1835_3644.png', '13_1835_3645.png', '13_1835_3646.png',
    '13_1835_3647.png', '13_1835_3648.png', '13_1835_3649.png', '13_1835_3650.png', '13_1835_3651.png', '13_1836_3641.png',
    '13_1836_3642.png', '13_1836_3643.png', '13_1836_3644.png', '13_1836_3645.png', '13_1836_3646.png', '13_1836_3647.png',
    '13_1836_3648.png', '13_1836_3649.png', '13_1836_3650.png', '13_1836_3651.png', '13_1837_3641.png', '13_1837_3642.png',
    '13_1837_3643.png', '13_1837_3644.png', '13_1837_3645.png', '13_1837_3646.png', '13_1837_3647.png', '13_1837_3648.png',
    '13_1837_3649.png', '13_1837_3650.png', '13_1837_3651.png', '13_1838_3641.png', '13_1838_3642.png', '13_1838_3643.png',
    '13_1838_3644.png', '13_1838_3645.png', '13_1838_3646.png', '13_1838_3647.png', '13_1838_3648.png', '13_1838_3649.png',
    '13_1838_3650.png', '13_1838_3651.png', '13_1839_3641.png', '13_1839_3642.png', '13_1839_3643.png', '13_1839_3644.png',
    '13_1839_3645.png', '13_1839_3646.png', '13_1839_3647.png', '13_1839_3648.png', '13_1839_3649.png', '13_1839_3650.png',
    '13_1839_3651.png', '13_1840_3641.png', '13_1840_3642.png', '13_1840_3643.png', '13_1840_3644.png', '13_1840_3645.png',
    '13_1840_3646.png', '13_1840_3647.png', '13_1840_3648.png', '13_1840_3649.png', '13_1840_3650.png', '13_1840_3651.png',
    '14_3670_7282.png', '14_3670_7283.png', '14_3670_7284.png', '14_3670_7285.png', '14_3670_7286.png', '14_3670_7287.png',
    '14_3670_7288.png', '14_3670_7289.png', '14_3670_7290.png', '14_3670_7291.png', '14_3670_7292.png', '14_3670_7293.png',
    '14_3670_7294.png', '14_3670_7295.png', '14_3670_7296.png', '14_3670_7297.png', '14_3670_7298.png', '14_3670_7299.png',
    '14_3670_7300.png', '14_3670_7301.png', '14_3670_7302.png', '14_3670_7303.png',
    // Agrega más archivos si es necesario
  ];

  for (const tile of availableTiles) {
    const tilePath = `${TILES_PATH}${tile}`;
    try {
      await cache.add(tilePath);
    } catch (error) {
      console.warn(`Error al cachear tile: ${tilePath}`, error);
    }
  }
};


self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Service Worker: Cacheando recursos básicos");
      await cache.addAll(FILES_TO_CACHE);
      console.log("Service Worker: Cacheando tiles");
      await cacheTiles(cache);
    }).catch((error) => console.error("Error al precachear recursos:", error))
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activado");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`Service Worker: Eliminando cache antiguo: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log(`Service Worker: Interceptando solicitud: ${event.request.url}`);


  if (event.request.url.endsWith(ICON_URL)) {
    // Manejar específicamente la imagen del ícono
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          console.error("Service Worker: Imagen no disponible en modo offline");
          return caches.match(ICON_URL); // Devuelve la imagen desde el caché
        });
      })
    );
    return;
  }

  if (event.request.url.includes(TILES_PATH)) {
    // Manejar tiles desde el cache
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch((error) => {
        console.error("Error al obtener tiles:", error);
      })
    );
  } else if (event.request.mode === "navigate") {
    // Manejar navegación offline
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log("Service Worker: Usuario offline, devolviendo página offline");
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    // Manejar otros recursos
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch((error) => {
        console.error("Error al obtener recursos:", error);
      })
    );
  }
});
