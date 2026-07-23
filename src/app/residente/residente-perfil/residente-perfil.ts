import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { API_BASE_URL } from '../../core/config/api.config';

@Component({
  selector: 'app-residente-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './residente-perfil.html',
  styleUrls: ['./residente-perfil.css'],
})
export class ResidentePerfilComponent implements OnInit, OnDestroy {
  fotoUrl = signal<string | null>(null);

  constructor(
    private router: Router,
    public authService: AuthService,
    public profileService: ProfileService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // Si se entra directo a esta pantalla (sin pasar por el home), cargar el perfil.
    if (!this.profileService.perfil()) {
      this.profileService.cargarPerfil().subscribe();
    }
    this.cargarFoto();
  }

  ngOnDestroy() {
    const url = this.fotoUrl();
    if (url) URL.revokeObjectURL(url); // liberar el object URL
  }

  // La foto llega como thumbnail comprimido desde el backend (/myphoto). Se pide con
  // HttpClient (el interceptor agrega el token) y se muestra vía object URL.
  private cargarFoto() {
    this.http.get(`${API_BASE_URL}/myphoto`, { responseType: 'blob' }).subscribe({
      next: (blob) => this.fotoUrl.set(URL.createObjectURL(blob)),
      error: () => this.fotoUrl.set(null),
    });
  }

  volver() {
    this.router.navigate(['/residente-home']);
  }

  logout() {
    this.authService.logout();
  }
}
