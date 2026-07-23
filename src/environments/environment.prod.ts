// Entorno de PRODUCCIÓN (se usa automáticamente en `ng build`, vía fileReplacements en angular.json).
// IMPORTANTE: al desplegar, reemplaza apiBaseUrl con la URL real del backend, SIEMPRE con https://
// (usar http:// haría que el navegador bloquee las peticiones por "mixed content" en un sitio HTTPS).
export const environment = {
  production: true,
  apiBaseUrl: 'http://192.168.101.3:8001/casaketteler',
};

//apiBaseUrl: 'https://REEMPLAZAR-CON-BACKEND-DE-PRODUCCION/casaketteler'