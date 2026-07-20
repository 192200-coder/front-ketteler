@echo off
REM ============================================================
REM  Compila el build de PRODUCCION y lo sirve para auditarlo
REM  con Lighthouse.
REM
REM  Uso: doble clic, o desde consola:  probar-lighthouse.bat
REM  Para detener: Ctrl+C en esta ventana (o detener-servidor.bat)
REM
REM  OJO: el backend debe estar corriendo para que los
REM  dashboards carguen datos.
REM ============================================================
cd /d "%~dp0"

echo.
echo ============================================
echo  [1/2] Compilando build de produccion...
echo ============================================
call npx ng build
if errorlevel 1 (
  echo.
  echo  ERROR: el build fallo. Revisa los mensajes de arriba.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  [2/2] Servidor en http://localhost:4000
echo ============================================
echo.
echo  1. Abre Chrome en:  http://localhost:4000
echo     ^(de preferencia en ventana de incognito: Ctrl+Shift+N^)
echo  2. Presiona F12  ^>  pestana "Lighthouse"
echo  3. Mode: Navigation ^| Device: Mobile ^| marca las 4 categorias
echo  4. Clic en "Analyze page load"
echo.
echo  Para auditar un dashboard: inicia sesion primero,
echo  navega a la pantalla, y ahi corre Lighthouse.
echo.
echo  Ctrl+C para detener el servidor.
echo.
call npm run serve:ssr:front-ketteler
