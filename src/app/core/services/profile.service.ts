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
}