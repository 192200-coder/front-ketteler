// Entorno de la INTERFAZ WEB, la que sirve el propio backend en el puerto 8001
// (el panel de la administradora).
//
// La URL es RELATIVA a proposito. El backend entrega esta interfaz desde el
// mismo origen, asi que las peticiones van siempre al servidor que la sirvio:
// funciona igual en http://localhost:8001 que en http://<ip-de-la-residencia>:8001,
// y no hay que recompilar cuando cambia la IP o se cambia de red.
//
// OJO: la app Android NO puede usar esto. Se carga desde capacitor://localhost,
// que es otro origen, y necesita la direccion absoluta de environment.prod.ts.
export const environment = {
  production: true,
  apiBaseUrl: '/casaketteler',
};
