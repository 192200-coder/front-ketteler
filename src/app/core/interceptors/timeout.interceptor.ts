import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { timeout, catchError, throwError, TimeoutError } from 'rxjs';

// Angular HttpClient no tiene timeout por defecto: si el backend es inalcanzable
// (p. ej. el celular no está en la misma red Wi-Fi), la petición se queda esperando
// el timeout del sistema operativo (30 s – 2 min). Esto lo corta rápido.

const TIMEOUT_NORMAL_MS = 12000; // login, listados, KPIs, CRUD
const TIMEOUT_PESADO_MS = 30000; // reconocimiento facial, subida de archivos, exportaciones

function timeoutParaUrl(url: string): number {
  // "/register" cubre marcar asistencia y las subidas (registerphoto, registerdocument...).
  const esPesado = url.includes('/register') || url.includes('/export');
  return esPesado ? TIMEOUT_PESADO_MS : TIMEOUT_NORMAL_MS;
}

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(timeoutParaUrl(req.url)),
    catchError((err) => {
      if (err instanceof TimeoutError) {
        // Se transforma en un HttpErrorResponse para que los manejadores de error
        // existentes (que leen error.listMessage[0]) muestren un mensaje claro.
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 0,
              statusText: 'Timeout',
              url: req.url,
              error: {
                type: 'error',
                listMessage: [
                  'El servidor no respondió a tiempo. Verifica tu conexión a internet o Wi-Fi.',
                ],
              },
            }),
        );
      }
      return throwError(() => err);
    }),
  );
};
