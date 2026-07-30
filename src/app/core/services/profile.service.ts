import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../config/api.config';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface PerfilUsuario {
  idUser?: string;
  firstName?: string;
  surName?: string;
  email?: string;
  idResidence?: string;
  cellPhoneNumber?: string;
  cellPhoneEmergency?: string;
  presente?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  perfil = signal<PerfilUsuario | null>(null);

  constructor(private http: HttpClient) {}

  cargarPerfil() {
    return this.http.get<{ data: PerfilUsuario }>(`${API_BASE_URL}/myprofile`).pipe(
      tap((res) => this.perfil.set(res.data ?? null)),
      catchError(() => {
        this.perfil.set(null);
        return of(null);
      }),
    );
  }

  getIdResidence(): string | null {
    return this.perfil()?.idResidence ?? null;
  }

  /**
   * Borra el perfil guardado en memoria.
   *
   * Hay que llamarlo al cerrar o cambiar de sesión. Si no, el perfil del usuario
   * anterior sigue en la señal y las pantallas que solo cargan cuando está vacía
   * muestran los datos de quien entró antes (por ejemplo, el correo del
   * administrador dentro del perfil de un residente).
   */
  limpiar(): void {
    this.perfil.set(null);
  }
}