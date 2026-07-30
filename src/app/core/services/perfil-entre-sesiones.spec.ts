import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';

/**
 * Regresión: el perfil no debe sobrevivir a un cambio de sesión.
 *
 * El perfil del usuario se guarda en una señal EN MEMORIA (ProfileService), no en
 * localStorage. Al cerrar sesión se limpiaban el token y el usuario, pero esa señal
 * quedaba intacta. Como la pantalla de perfil solo pide los datos al servidor
 * cuando la señal está vacía, el siguiente usuario en entrar veía el perfil del
 * anterior: entrando como administrador y luego como residente, el perfil del
 * residente mostraba el correo del administrador. Recargar la página lo corregía,
 * porque eso destruye la memoria de la aplicación.
 *
 * Se reproduce aquí la misma mecánica: una señal de perfil y las dos operaciones
 * que deben vaciarla (cerrar sesión e iniciar una nueva).
 */
describe('Perfil entre sesiones', () => {
  interface Perfil {
    email: string;
  }

  let perfil: ReturnType<typeof signal<Perfil | null>>;

  // Equivalente a ProfileService.limpiar()
  const limpiarPerfil = () => perfil.set(null);

  // Equivalente a AuthService.logout()
  const cerrarSesion = () => {
    limpiarPerfil();
  };

  // Equivalente al tap() de AuthService.login()
  const iniciarSesion = () => {
    limpiarPerfil();
  };

  // Equivalente a residente-perfil.ngOnInit(): solo pide datos si no hay nada.
  const abrirPantallaPerfil = (traerDelServidor: () => Perfil) => {
    if (!perfil()) {
      perfil.set(traerDelServidor());
    }
    return perfil();
  };

  beforeEach(() => {
    perfil = signal<Perfil | null>(null);
  });

  it('al cerrar sesión se descarta el perfil que quedaba en memoria', () => {
    perfil.set({ email: 'admin@ketteler.com' });

    cerrarSesion();

    expect(perfil()).toBeNull();
  });

  it('al iniciar sesión se descarta el perfil de la sesión anterior', () => {
    perfil.set({ email: 'admin@ketteler.com' });

    iniciarSesion();

    expect(perfil()).toBeNull();
  });

  it('el residente no ve el correo del administrador tras cambiar de sesión', () => {
    // El administrador usa el sistema y su perfil queda en memoria.
    perfil.set({ email: 'admin@ketteler.com' });
    cerrarSesion();

    // Entra un residente y abre su perfil.
    iniciarSesion();
    const visto = abrirPantallaPerfil(() => ({ email: 'residente@ketteler.com' }));

    expect(visto?.email).toBe('residente@ketteler.com');
  });

  it('sin limpiar la memoria, la pantalla mostraria datos ajenos', () => {
    // Comprobación de que la prueba anterior detecta de verdad el fallo:
    // si no se limpia, la pantalla conserva el perfil del usuario anterior.
    perfil.set({ email: 'admin@ketteler.com' });

    const visto = abrirPantallaPerfil(() => ({ email: 'residente@ketteler.com' }));

    expect(visto?.email).toBe('admin@ketteler.com');
  });
});
