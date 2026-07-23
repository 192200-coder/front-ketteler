# Casa Ketteler — Interfaz (web y app móvil)

Frontend del sistema de control de asistencia de la residencia universitaria
Casa Ketteler. Un mismo proyecto Angular produce dos cosas:

- La **interfaz web** de administración (la publica el backend).
- La **app Android** para los residentes, empaquetada con Capacitor.

> 📖 **La documentación completa está en el repositorio del backend**: instalación,
> despliegue, operación y arquitectura.

---

## Requisitos

- Node.js 20 o superior
- El **backend en ejecución** (sin él no hay datos)
- Android Studio, solo si vas a generar el APK

---

## Puesta en marcha

```powershell
npm install
```

Antes de arrancar, indica dónde está el backend en
`src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://192.168.1.100:8001/casaketteler',  // ← IP de tu PC
};
```

> Se usa la **IP de la red y no `localhost`** porque el celular necesita alcanzar tu
> computadora. Averíguala con `ipconfig`. Esa IP también debe figurar en
> `CORS_ALLOWED_ORIGINS` del `.env` del backend.

---

## Comandos

```powershell
npx ng serve                  # desarrollo en http://localhost:4200
npx ng build                  # compila a dist/front-ketteler/browser
npx ng test --watch=false     # ejecuta las 16 pruebas
npm run ship:android          # compila e instala la app en un celular conectado
```

**APK firmado para repartir:**

```powershell
npm run build:android
npx cap sync android
cd android
.\gradlew.bat assembleRelease
```

Queda en `android/app/build/outputs/apk/release/app-release.apk`.

---

## Entornos

| Archivo | Se usa en | Contiene |
|---------|-----------|----------|
| `environment.ts` | `ng serve` | URL del backend en desarrollo |
| `environment.prod.ts` | `ng build` | URL del backend en producción |

El intercambio es automático (`fileReplacements` en `angular.json`).

> ⚠️ Al desplegar, `environment.prod.ts` debe apuntar al servidor real.

---

## Organización

```
src/app/
├── admin/       → pantallas de administración
├── residente/   → pantallas del residente
├── auth/        → inicio de sesión
└── core/
    ├── services/      → autenticación, perfil, descargas, red
    ├── guards/        → protección de rutas por rol
    ├── interceptors/  → token de sesión y tiempo de espera
    └── utils/         → almacenamiento de sesión y utilidades
```

---

## Detalles a tener en cuenta

**Las descargas en móvil son distintas.** Dentro de la app no existe el gestor de
descargas del navegador: hay que usar `DescargaService`, que guarda el archivo y abre
el menú de compartir del sistema. Un `<a download>` no funciona.

**Las pantallas del residente solo operan en la app.** Necesitan cámara y datos de
Wi-Fi; en un navegador de escritorio muestran un aviso.

**Sesión según el rol.** El residente permanece con la sesión iniciada (su celular es
personal); la administración no (la computadora es compartida).
