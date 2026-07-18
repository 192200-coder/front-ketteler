export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function esExitoso(res: any): boolean {
  return res?.type === 'success';
}

export function primerMensaje(res: any, fallback: string): string {
  return res?.listMessage?.[0] ?? fallback;
}