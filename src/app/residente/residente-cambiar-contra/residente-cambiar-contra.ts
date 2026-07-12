import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-residente-cambiar-contra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residente-cambiar-contra.html',
  styleUrls: ['./residente-cambiar-contra.css']
})
export class ResidenteCambiarContraComponent {
  showPass1 = false;
  showPass2 = false;
  newPassword = '';
  confirmPassword = '';
  errorMessage = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  goBack() {
    window.history.back();
  }

  onSkip() {
    // El usuario sigue con firstLogin = true; se le volverá a pedir en el próximo login.
    this.router.navigate(['/residente-home']);
  }

  onSave(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set('Por seguridad, la contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.authService.changePassword(this.newPassword).subscribe({
      next: (response) => {
        if (response.type === 'success') {
          this.router.navigate(['/residente-home']);
        } else {
          this.errorMessage.set(response.listMessage?.[0] ?? 'No se pudo actualizar la contraseña');
        }
      },
      error: () => this.errorMessage.set('No se pudo conectar con el servidor. Intenta nuevamente.')
    });
  }
}