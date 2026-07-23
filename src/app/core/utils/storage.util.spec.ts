import { describe, it, expect, beforeEach } from 'vitest';
import { safeGetItem, safeSetItem, safeRemoveItem, esExitoso, primerMensaje } from './storage.util';

/**
 * La sesión se guarda en dos lugares según el rol:
 *  - localStorage   -> residente (su celular es personal, la sesión sobrevive)
 *  - sessionStorage -> admin (terminal compartido, la sesión muere al cerrar)
 */
describe('Almacenamiento de sesión', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('guarda de forma persistente para el residente (sobrevive al cierre de la app)', () => {
    safeSetItem('ck_token', 'token-residente', true);

    expect(localStorage.getItem('ck_token')).toBe('token-residente');
    expect(sessionStorage.getItem('ck_token')).toBeNull();
  });

  it('guarda solo por sesión para el admin (se pierde al cerrar el navegador)', () => {
    safeSetItem('ck_token', 'token-admin', false);

    expect(sessionStorage.getItem('ck_token')).toBe('token-admin');
    expect(localStorage.getItem('ck_token')).toBeNull();
  });

  it('lee el token sin importar en cuál de los dos almacenes quedó', () => {
    safeSetItem('ck_token', 'token-admin', false);
    expect(safeGetItem('ck_token')).toBe('token-admin');

    safeSetItem('ck_token', 'token-residente', true);
    expect(safeGetItem('ck_token')).toBe('token-residente');
  });

  it('al cambiar de tipo de sesión no deja copias viejas del token', () => {
    safeSetItem('ck_token', 'token-residente', true);
    safeSetItem('ck_token', 'token-admin', false);

    // Si quedara el token viejo en localStorage, un admin heredaría una sesión persistente.
    expect(localStorage.getItem('ck_token')).toBeNull();
    expect(sessionStorage.getItem('ck_token')).toBe('token-admin');
  });

  it('cerrar sesión limpia ambos almacenes', () => {
    safeSetItem('ck_token', 'token-residente', true);
    safeSetItem('ck_user', 'datos-admin', false);

    safeRemoveItem('ck_token');
    safeRemoveItem('ck_user');

    expect(safeGetItem('ck_token')).toBeNull();
    expect(safeGetItem('ck_user')).toBeNull();
  });
});

describe('Lectura de respuestas del backend', () => {
  it('reconoce una respuesta exitosa', () => {
    expect(esExitoso({ type: 'success' })).toBe(true);
    expect(esExitoso({ type: 'error' })).toBe(false);
    expect(esExitoso(null)).toBe(false);
  });

  it('toma el primer mensaje del backend y si no hay usa el de respaldo', () => {
    expect(primerMensaje({ listMessage: ['Usuario no encontrado'] }, 'Falló')).toBe(
      'Usuario no encontrado',
    );
    expect(primerMensaje({}, 'Falló')).toBe('Falló');
    expect(primerMensaje(null, 'Falló')).toBe('Falló');
  });
});
