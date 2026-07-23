// Almacenamiento de sesión con dos niveles de persistencia:
//  - localStorage   -> sobrevive al cierre de la app (celular del residente, que es personal).
//  - sessionStorage -> muere al cerrar el navegador (terminal compartido del admin).
// Las lecturas revisan ambos, así el resto del código no necesita saber cuál se usó.

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

export function safeSetItem(key: string, value: string, persistente = true): void {
  if (typeof window === 'undefined') return;
  // Se limpia el otro almacén para no dejar copias viejas de la sesión anterior.
  if (persistente) {
    sessionStorage.removeItem(key);
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
    sessionStorage.setItem(key, value);
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function esExitoso(res: any): boolean {
  return res?.type === 'success';
}

export function primerMensaje(res: any, fallback: string): string {
  return res?.listMessage?.[0] ?? fallback;
}
