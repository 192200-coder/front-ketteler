import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-cambiar-contrasena.html',
  styleUrls: ['../../auth/login/login.css'],
})
export class AdminCambiarContrasenaComponent {
  showActual = false;
  showNueva = false;
  showRepetir = false;

  contrasenaActual = '';
  nuevaContrasena = '';
  repetirContrasena = '';

  guardando = false;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  onGuardar(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.nuevaContrasena !== this.repetirContrasena) {
      this.errorMessage.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.errorMessage.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.guardando = true;

    this.authService.changePasswordAdmin(this.contrasenaActual, this.nuevaContrasena).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.type === 'success') {
          this.successMessage.set('Contraseña actualizada correctamente.');
          this.contrasenaActual = '';
          this.nuevaContrasena = '';
          this.repetirContrasena = '';
        } else {
          this.errorMessage.set(response.listMessage?.[0] ?? 'No se pudo actualizar la contraseña.');
        }
      },
      error: () => {
        this.guardando = false;
        this.errorMessage.set('No se pudo conectar con el servidor. Intenta nuevamente.');
      },
    });
  }

  volver() {
    this.router.navigate(['/admin-home']);
  }
}