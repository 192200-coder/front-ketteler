import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-admin-crear-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-crear-usuario.html',
  styleUrls: ['./admin-crear-usuario.css'],
})
export class AdminCrearUsuarioComponent {
  firstName = '';
  surName = '';
  email = '';
  password = '';
  cellPhoneNumber: number | null = null;
  cellPhoneEmergency: number | null = null;

  guardando = signal(false);
  mensaje = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private profileService: ProfileService,
  ) {}

  ngOnInit() {
    if (!this.profileService.getIdResidence()) {
      this.profileService.cargarPerfil().subscribe();
    }
  }

  crearUsuario() {
    const idResidence = this.profileService.getIdResidence();

    if (!idResidence) {
      this.mensaje.set(
        'No se pudo determinar la residencia del administrador. Recarga la página e intenta de nuevo.',
      );
      return;
    }

    if (!this.firstName || !this.surName || !this.email || !this.password) {
      this.mensaje.set('Completa nombre, apellido, correo y contraseña.');
      return;
    }

    this.guardando.set(true);

    const body = {
      idResidence,
      firstName: this.firstName,
      surName: this.surName,
      email: this.email,
      password: this.password,
      cellPhoneNumber: this.cellPhoneNumber ?? 0,
      cellPhoneEmergency: this.cellPhoneEmergency ?? 0,
    };

    this.http
      .post<{ type: string; listMessage: string[] }>(`${API_BASE_URL}/registeruser`, body)
      .subscribe({
        next: (res) => {
          this.guardando.set(false);
          if (res.type === 'success') {
            this.router.navigate(['/admin-gestion-usuarios']);
          } else {
            this.mensaje.set(res.listMessage?.[0] ?? 'No se pudo crear el usuario.');
          }
        },
        error: () => {
          this.guardando.set(false);
          this.mensaje.set('No se pudo conectar con el servidor. Intenta nuevamente.');
        },
      });
  }
}
