import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.casaketteler.app',
  appName: 'Casa Ketteler',
  webDir: 'dist/front-ketteler/browser',
  server: {
    androidScheme: 'http',   // la app se sirve como http://localhost, no https://localhost
    cleartext: true,          // habilita cleartext también a nivel de Capacitor
  },
  android: {
    allowMixedContent: true,  // por si acaso, refuerzo adicional
  },
};

export default config;