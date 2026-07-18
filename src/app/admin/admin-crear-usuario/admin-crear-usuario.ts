// src/app/admin/admin-crear-usuario/admin-crear-usuario.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config/api.config';
import { ProfileService } from '../../core/services/profile.service';
import { esExitoso, primerMensaje } from '../../core/utils/storage.util';

@Component({
  selector: 'app-admin-crear-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-crear-usuario.html',
  styleUrls: ['./admin-crear-usuario.css'],
})
export class AdminCrearUsuarioComponent implements OnInit {
  firstName = '';
  surName = '';
  email = '';
  cellPhoneNumber: number | null = null;
  cellPhoneEmergency: number | null = null;

  guardando = signal(false);
  mensaje = signal<string | null>(null);

  // Contraseña generada por el sistema, mostrada tras crear el usuario
  contrasenaGenerada = signal<string | null>(null);
  emailCreado = signal<string | null>(null);
  copiado = signal(false);

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

    if (!this.firstName || !this.surName || !this.email) {
      this.mensaje.set('Completa nombre, apellido y correo.');
      return;
    }

    this.mensaje.set(null);
    this.guardando.set(true);

    const body = {
      idResidence,
      firstName: this.firstName,
      surName: this.surName,
      email: this.email,
      cellPhoneNumber: this.cellPhoneNumber ?? 0,
      cellPhoneEmergency: this.cellPhoneEmergency ?? 0,
    };

    this.http.post(`${API_BASE_URL}/registeruser`, body).subscribe({
      next: (res: any) => {
        this.guardando.set(false);
        if (esExitoso(res)) {
          this.emailCreado.set(this.email);
          this.contrasenaGenerada.set(res.temporalPassword ?? null);
        } else {
          this.mensaje.set(primerMensaje(res, 'No se pudo crear el usuario.'));
        }
      },
      error: () => {
        this.guardando.set(false);
        this.mensaje.set('No se pudo conectar con el servidor. Intenta nuevamente.');
      },
    });
  }

  copiarCredenciales() {
    const texto = `Usuario: ${this.emailCreado()}\nContraseña temporal: ${this.contrasenaGenerada()}`;
    navigator.clipboard.writeText(texto).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  volverAGestion() {
    this.router.navigate(['/admin-gestion-usuarios']);
  }
}